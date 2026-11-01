/* one-off mobile diagnosis of the pinned doors wall */
import { spawn } from 'node:child_process'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9335
const URL_ = 'http://localhost:4173/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.cwd()}\\.qa\\diag-prof`,
  '--window-size=390,844', 'about:blank',
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
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await send('Page.navigate', { url: URL_ })
  await sleep(4500)

  await send('Runtime.evaluate', { expression: `document.getElementById('works').scrollIntoView({block:'start',behavior:'instant'})` })
  await sleep(2400)

  const r = await send('Runtime.evaluate', { expression: `(function(){
    const s = document.getElementById('works')
    const row = s.querySelector('.works__row')
    const pin = s.querySelector('.works__pin')
    const units = Array.from(s.querySelectorAll('.unit'))
    const info = s.querySelector('.dinfo')
    const cs = getComputedStyle(pin)
    return JSON.stringify({
      mob: matchMedia('(max-width: 639.98px)').matches,
      canHover: matchMedia('(hover: hover) and (pointer: fine)').matches,
      lenis: !!(window.__lenis),
      secTop: s.getBoundingClientRect().top.toFixed(0),
      scrollY: Math.round(scrollY),
      secH: s.offsetHeight,
      span: Math.max(1, s.offsetHeight - innerHeight),
      uw: cs.getPropertyValue('--uw'),
      padIn: getComputedStyle(row).paddingInline,
      rowTf: row.style.transform,
      unitX: units.map(u => Math.round(u.offsetLeft)),
      unitW: units.map(u => Math.round(u.offsetWidth)),
      dot: Array.from(s.querySelectorAll('.works__dots i')).map(d => d.classList.contains('on')),
      infoH: (info.querySelector('.dinfo__h').textContent || ''),
      infoPx: info.offsetHeight,
      infoBottom: Math.round(info.getBoundingClientRect().bottom),
      doorBottom: Math.round(units[0].getBoundingClientRect().bottom),
      pinBottom: Math.round(pin.getBoundingClientRect().bottom),
      secCls: s.className,
      li: Array.from(info.querySelectorAll('.dinfo__p li')).map((li) => getComputedStyle(li).display).join(','),
      pinH: pin.getBoundingClientRect().height.toFixed(0),
      rowTop: Math.round(row.getBoundingClientRect().top),
      pb: getComputedStyle(pin).paddingTop,
    })
  })()` })
  console.log(r.result.result.value)
  ws.close()
} finally {
  proc.kill()
}
