/* probe: hero fig vs headline collision geometry at 1920x1080 and 1440x900 */
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9340
const URL_ = 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\hero-prof`,
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
  await sleep(3200)

  const measure = async (w, h) => {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
    await sleep(1500)
    const p = await send('Runtime.evaluate', { expression: `(function(){
      const R = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
      const byText = (txt) => { const all = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim().toUpperCase().includes(txt)); if (!all.length) return null; const r = all[0].getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }
      /* union rect of all h1 text lines: hero h1 */
      const h1 = document.querySelector('.h1')
      const h1r = h1 ? h1.getBoundingClientRect() : null
      /* last text span of h1 (second line) for accurate bottom */
      const h1Last = h1 ? [...h1.querySelectorAll('span')].pop() : null
      const h1LastR = h1Last ? h1Last.getBoundingClientRect() : null
      /* overlap test: fig vs every visible text el in hero__left */
      const fig = document.querySelector('.fig')
      const fr = fig ? fig.getBoundingClientRect() : null
      let collisions = []
      if (fr) for (const e of document.querySelectorAll('.hero__left *')) {
        const r = e.getBoundingClientRect()
        if (!r.width || !r.height) continue
        if (e.children.length) continue
        if (r.left < fr.right && r.right > fr.left && r.top < fr.bottom && r.bottom > fr.top) {
          collisions.push([e.className || e.tagName, [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]])
        }
      }
      return JSON.stringify({
        vw: innerWidth, vh: innerHeight,
        h1: h1r && [Math.round(h1r.x), Math.round(h1r.y), Math.round(h1r.width), Math.round(h1r.height)],
        h1Last: h1LastR && [Math.round(h1LastR.x), Math.round(h1LastR.y), Math.round(h1LastR.width), Math.round(h1LastR.height)],
        fig: fr && [Math.round(fr.x), Math.round(fr.y), Math.round(fr.width), Math.round(fr.height)],
        figCard: R('.fig__card'),
        daily: byText('DAILY DRIVERS'),
        collisions: collisions.slice(0, 8),
      })
    })()`, returnByValue: true })
    console.log(w + 'x' + h, p.result.result.value)
  }

  await measure(1920, 1080)
  await measure(1440, 900)
  await measure(1024, 768)

  /* screenshots for eyeballing */
  for (const [w, h, name] of [[1920, 1080, 'hero-1920'], [1440, 900, 'hero-1440'], [1024, 768, 'hero-1024']]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false })
    await sleep(1200)
    const s = await send('Page.captureScreenshot', { format: 'png' })
    const fs = await import('node:fs')
    const b64 = s?.result?.data
    if (b64) fs.writeFileSync(`${process.cwd()}\\qa\\${name}.png`, Buffer.from(b64, 'base64'))
  }

  await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
  ws.close()
} finally {
  proc.kill()
}
