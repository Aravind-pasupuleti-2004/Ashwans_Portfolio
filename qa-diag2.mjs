/* two-issue diagnostic: (1) skills section paint/wash, (2) wheel scroll inside the room */
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9338
const URL_ = 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\diag2-prof`,
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
  await send('Page.navigate', { url: URL_ })
  await sleep(3200)

  /* ---- issue 2: skills ---- */
  await send('Runtime.evaluate', { expression: `document.getElementById('skills').scrollIntoView({block:'start',behavior:'instant'})` })
  await sleep(2000)
  const p1 = await send('Runtime.evaluate', { expression: `(function(){
    const row = document.querySelector('.skill-row')
    const b = row.querySelector('b')
    const rb = b.getBoundingClientRect()
    const rr = row.getBoundingClientRect()
    const cs = getComputedStyle(b)
    const rowCs = getComputedStyle(row)
    const amb = document.querySelector('.story__amb')
    const ar = amb && amb.getBoundingClientRect()
    const stack = document.elementsFromPoint(rb.left + 40, rb.top + rb.height / 2).slice(0, 4).map(el => el.className || el.tagName)
    return JSON.stringify({
      rowText: b.textContent,
      rowRect: [Math.round(rr.left), Math.round(rr.top), Math.round(rr.width)],
      bRect: [Math.round(rb.left), Math.round(rb.top)],
      rowDisplay: rowCs.display, rowJustify: rowCs.justifyContent, rowTextAlign: rowCs.textAlign,
      bWeight: cs.fontWeight, bColor: cs.color, bOpacity: cs.opacity,
      rowOpacity: rowCs.opacity, parentOp: getComputedStyle(row.parentElement).opacity,
      ambRect: ar ? [Math.round(ar.top), Math.round(ar.bottom), Math.round(ar.height)] : 'none',
      skillsBg: getComputedStyle(document.getElementById('skills')).background.slice(0, 120),
      storyBottom: Math.round(document.getElementById('story').getBoundingClientRect().bottom),
      paintStack: stack,
    })
  })()` })
  console.log('skills:', p1.result.result.value)

  /* ---- issue 1: room scroll ---- */
  await send('Runtime.evaluate', { expression: `document.getElementById('works').scrollIntoView({block:'start',behavior:'instant'})` })
  await sleep(1600)
  await send('Runtime.evaluate', { expression: `document.querySelector('.unit .doorway').click()` })
  await sleep(7000)
  const p2 = await send('Runtime.evaluate', { expression: `(function(){
    const r = document.querySelector('article.room')
    if (!r) return 'no room'
    return JSON.stringify({
      open: true,
      lenisPrevent: r.hasAttribute('data-lenis-prevent'),
      scrollable: r.scrollHeight > r.clientHeight,
      sh: r.scrollHeight, ch: r.clientHeight,
      scrollTop: r.scrollTop,
      lenisStopped: !!(window.__lenis && !window.__lenis.isStopped === false ? 'stopped' : 'running'),
    })
  })()` })
  console.log('room-before-wheel:', p2.result.result.value)

  /* real wheel over the room content */
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 960, y: 540, deltaX: 0, deltaY: 400 })
  await sleep(400)
  const p3 = await send('Runtime.evaluate', { expression: `JSON.stringify({
    scrollTop: document.querySelector('article.room').scrollTop,
    scrollY: window.scrollY,
  })` })
  console.log('room-after-wheel:', p3.result.result.value)

  await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
  ws.close()
} finally {
  proc.kill()
}
