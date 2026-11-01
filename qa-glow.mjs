/* targeted works-wall captures (post-glow-fix check) */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9336
const URL_ = 'http://localhost:4173/'
const OUT = path.resolve('qa')
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\glow-prof`,
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
  await send('Page.navigate', { url: URL_ })
  await sleep(3000)

  for (const [w, h, name] of [[1920, 1080, 'glow-desktop'], [768, 1024, 'glow-tablet'], [390, 844, 'glow-mobile']]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: h <= 844 })
    await sleep(900)
    await send('Runtime.evaluate', { expression: `document.getElementById('works').scrollIntoView({block:'start',behavior:'instant'})` })
    await sleep(2600)
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(shot.result.data, 'base64'))
    console.log('shot', name)
  }
  await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
  ws.close()
} finally {
  proc.kill()
}
