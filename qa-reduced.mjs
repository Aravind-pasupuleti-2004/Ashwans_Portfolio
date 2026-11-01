/* reduced-motion audit: with prefers-reduced-motion: reduce emulated,
   the calendar swaps instantly, the wall renders fully static, and the
   walk-through collapses to an instant room entry */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9337
const URL_ = 'http://localhost:4173/'
const OUT = path.resolve('qa')
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\rm-prof`,
  '--window-size=1920,1080', 'about:blank',
], { stdio: 'ignore' })

try {
  let list = null
  for (let i = 0; i < 50; i++) {
    try { list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (list.length) break } catch {}
    await sleep(200)
  }
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${URL_}`, { method: 'PUT' })).json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  let id = 0
  const pend = new Map()
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pend.has(msg.id)) { pend.get(msg.id)(msg); pend.delete(msg.id) }
  }
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = ++id
    pend.set(i, resolve)
    ws.send(JSON.stringify({ id: i, method, params }))
  })

  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false })
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  await send('Page.navigate', { url: URL_ })
  await sleep(3200)

  const p1 = await send('Runtime.evaluate', { expression: `(function(){
    const sec = document.getElementById('works')
    const face = document.querySelector('.cal__face')
    const before = face.querySelector('.cal__word').textContent
    window.__calFlip && window.__calFlip()
    const after = face.querySelector('.cal__word').textContent
    window.__doorAjar && window.__doorAjar(0, 0.5)
    return JSON.stringify({
      reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
      calBefore: before, calAfter: after,
    })
  })()` })
  console.log('cal probe:', p1.result.result.value)

  await sleep(500)
  const p2 = await send('Runtime.evaluate', { expression: `(function(){
    const sec = document.getElementById('works')
    const door = sec.querySelector('.unit .door')
    return JSON.stringify({
      doorTf: getComputedStyle(door).transform,
      paintClip: getComputedStyle(sec.querySelector('.paint')).clipPath.slice(0, 40),
      wallCls: sec.className,
      walking: document.documentElement.className.includes('walking'),
    })
  })()` })
  console.log('static probe:', p2.result.result.value)
  const shotA = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(path.join(OUT, 'reduced-home.png'), Buffer.from(shotA.result.data, 'base64'))

  await send('Runtime.evaluate', { expression: `document.getElementById('works').scrollIntoView({block:'start',behavior:'instant'})` })
  await sleep(1500)

  /* reduced walk-through: door click should land in the room almost instantly */
  await send('Runtime.evaluate', { expression: `document.querySelector('.unit .doorway').click()` })
  await sleep(2500)
  const p3 = await send('Runtime.evaluate', { expression: `(function(){
    const r = document.querySelector('article.room')
    const inn = r && r.querySelector('.room__in')
    return JSON.stringify({
      roomOpen: !!r,
      clip: r ? getComputedStyle(r).clipPath : '',
      op: inn ? getComputedStyle(inn).opacity : '',
      wallTf: document.getElementById('works').style.transform,
    })
  })()` })
  console.log('room probe:', p3.result.result.value)
  const shotB = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(path.join(OUT, 'reduced-works-open.png'), Buffer.from(shotB.result.data, 'base64'))

  /* back out static */
  await send('Runtime.evaluate', { expression: `document.querySelector('.room__back')?.click()` })
  await sleep(2600)
  const p4 = await send('Runtime.evaluate', { expression: `(function(){
    const sec = document.getElementById('works')
    const door = sec.querySelector('.unit .door')
    return JSON.stringify({
      wallTf: sec.style.transform,
      doorTf: getComputedStyle(door).transform,
      walking: document.documentElement.className.includes('walking'),
    })
  })()` })
  console.log('back probe:', p4.result.result.value)
  const shotC = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(path.join(OUT, 'reduced-works-back.png'), Buffer.from(shotC.result.data, 'base64'))

  await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
  ws.close()
} finally {
  proc.kill()
}
