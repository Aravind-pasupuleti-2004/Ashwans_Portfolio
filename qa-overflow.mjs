/* Overflow audit: at each test width, flag elements that poke past the
   viewport unless they sit inside a clipping ancestor (decorative layers). */
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9334
const URL_ = 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\ov-prof`,
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
  await send('Runtime.enable')
  await send('Page.navigate', { url: URL_ })
  await sleep(5000)

  const CHECK = `(function(){
    const vw = window.innerWidth
    const clipped = (el) => {
      let a = el.parentElement
      while (a && a !== document.body) {
        const c = getComputedStyle(a)
        if (['hidden','clip','auto','scroll'].includes(c.overflowX) || c.clipPath !== 'none') return true
        if (c.transform !== 'none') return true
        a = a.parentElement
      }
      return false
    }
    const bad = []
    document.querySelectorAll('body *').forEach((el) => {
      if (el.closest('[data-ovskip]')) return
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) {
        bad.push(el.tagName + '.' + String(el.className).slice(0, 48) + ' r=' + Math.round(r.right))
      }
    })
    return JSON.stringify({ vw, count: bad.length, bad: bad.slice(0, 6) })
  })()`

  for (const w of [1920, 1440, 1024, 768, 390, 360]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w, height: Math.round(w * 9 / 19.5), deviceScaleFactor: 1, mobile: w < 700,
    })
    await sleep(1400)
    const r = await send('Runtime.evaluate', { expression: CHECK })
    console.log(w + 'px →', r.result.result.value)
  }
  ws.close()
} finally {
  proc.kill()
}
