/* probe: opens Photoshop door (expect gallery) + Premiere door (expect embedded YouTube wall) */
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9339
const URL_ = 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\media-prof`,
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

  const openDoor = async (idx, label) => {
    await send('Runtime.evaluate', { expression: `document.getElementById('works').scrollIntoView({block:'start',behavior:'instant'})` })
    await sleep(1500)
    await send('Runtime.evaluate', { expression: `document.querySelectorAll('.unit .doorway')[${idx}].click()` })
    await sleep(7200)
    const p = await send('Runtime.evaluate', { expression: `(function(){
      const r = document.querySelector('article.room')
      if (!r) return JSON.stringify({ open: false })
      const frames = [...r.querySelectorAll('.room__vframe iframe')].map(f => f.src)
      const imgs = [...r.querySelectorAll('.room__gallery img')].map(i => i.getAttribute('src'))
      const staged = [...r.querySelectorAll('.room__shot img')].findLength = 0
      return JSON.stringify({
        open: true,
        title: r.querySelector('.room__title')?.textContent,
        videos: frames,
        gallery: imgs.filter(Boolean),
        galleryCount: imgs.length,
      })
    })()` })
    console.log(label, p.result.result.value)
    await send('Page.captureScreenshot', { format: 'png' }).then(async (s) => {
      const fs = await import('node:fs')
      const b64 = s?.result?.data
      if (!b64) { console.log('shot-debug:', JSON.stringify(s).slice(0, 300)); return }
      fs.writeFileSync(`${process.cwd()}\\qa\\media-${label}.png`, Buffer.from(b64, 'base64'))
    })
    /* close */
    await send('Runtime.evaluate', { expression: `document.querySelector('.room__back').click()` })
    await sleep(5600)
  }

  await openDoor(0, 'photoshop')
  await openDoor(1, 'premiere')

  await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
  ws.close()
} finally {
  proc.kill()
}
