/* QA driver: boots headless Edge over CDP and captures section-level
   screenshots at the test viewports. Plain Node + built-in WebSocket. */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9333
const URL_ = 'http://localhost:4173/'
const OUT = path.resolve('qa')
mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const prof = path.resolve('.qa', 'qa-prof')
const proc = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${prof}`,
  '--window-size=1920,1080', 'about:blank',
], { stdio: 'ignore' })

try {
  /* wait for CDP */
  let list = null
  for (let i = 0; i < 50; i++) {
    try { list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (list.length) break } catch {}
    await sleep(200)
  }
  if (!list) throw new Error('CDP never came up')

  const VIEWPORTS = [
    { name: 'desktop', w: 1920, h: 1080, mobile: false },
    { name: 'laptop', w: 1440, h: 900, mobile: false },
    { name: 'tablet', w: 768, h: 1024, mobile: false },
    { name: 'mobile', w: 390, h: 844, mobile: true },
  ]
  const SECTIONS = ['home', 'works', 'story', 'skills', 'tools', 'contact', 'bottom']

  /* one fresh page per viewport */
  for (const vp of VIEWPORTS) {
    const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${URL_}`, { method: 'PUT' })).json()
    const ws = new WebSocket(t.webSocketDebuggerUrl)
    let id = 0
    const pend = new Map()
    const events = []
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data)
      if (msg.id && pend.has(msg.id)) { pend.get(msg.id)(msg); pend.delete(msg.id) }
      else if (msg.method) events.push(msg.method)
    }
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
    const send = (method, params = {}) => new Promise((resolve) => {
      const i = ++id
      pend.set(i, resolve)
      ws.send(JSON.stringify({ id: i, method, params }))
    })

    await send('Page.enable')
    await send('Runtime.enable')
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile,
    })
    await send('Page.navigate', { url: URL_ })

    /* wait for load + loader to complete + hero settle */
    const t0 = Date.now()
    while (!events.includes('Page.loadEventFired') && Date.now() - t0 < 15000) await sleep(120)
    /* the profile persists localStorage — start every viewport run in light mode */
    const mv0 = events.length
    await send('Runtime.evaluate', { expression: `localStorage.removeItem('ashwan-mode')` })
    await send('Page.reload')
    const t0b = Date.now()
    while (!events.slice(mv0).includes('Page.loadEventFired') && Date.now() - t0b < 15000) await sleep(120)
    await sleep(4200)

    for (const sec of SECTIONS) {
      await send('Runtime.evaluate', { expression: `(function(){
        ${sec === 'home' ? "window.scrollTo({top:0,behavior:'instant'}); return" : ''}
        ${sec === 'bottom' ? "window.scrollTo({top: document.documentElement.scrollHeight,behavior:'instant'}); return" : sec !== 'home' && sec !== 'bottom' ? `
        const el = document.getElementById('${sec}');
        if (el) el.scrollIntoView({block:'start',behavior:'instant'});
        window.scrollBy({top:-80,behavior:'instant'}); return` : ''}
      })()`, awaitPromise: true })
      await sleep(1500)
      const shot = await send('Page.captureScreenshot', { format: 'png' })
      writeFileSync(path.join(OUT, `${vp.name}-${sec}.png`), Buffer.from(shot.result.data, 'base64'))
      console.log('shot', vp.name, sec)

      /* verify the odometer actually rolls between chapters */
      if (sec === 'story') {
        const read = () => send('Runtime.evaluate', { expression: `(function(){
          const ds = Array.from(document.querySelectorAll('.dg__c')).map(function(c){ return getComputedStyle(c).getPropertyValue('--d').trim() })
          const when = (document.querySelector('.story__when') || {}).textContent || ''
          const s = document.querySelector('.story')
          return JSON.stringify({ ds: ds, when: when, ch: s ? s.dataset.ch : null })
        })()` }).then((r) => JSON.parse((r.result || {}).result?.value || '{}'))
        const a = await read()
        await send('Runtime.evaluate', { expression: `window.scrollBy({ top: window.innerHeight * 1.2, behavior: 'instant' })` })
        await sleep(1800)
        const b = await read()
        console.log('odometer:', JSON.stringify(a), '→', JSON.stringify(b))
        await send('Runtime.evaluate', { expression: `window.scrollBy({ top: -window.innerHeight * 1.2, behavior: 'instant' })` })
        await sleep(500)
      }
    }
    await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
    ws.close()
  }
/* interaction states on fresh desktop pages */
const INTERACTIONS = [
  {
    name: 'dark-home',
    steps: [['click', '.mode-btn']],
    shots: [{ d: 1400, n: 'dark-home' }],
  },
  {
    name: 'menu-open',
    steps: [['click', '#menuBtn']],
    shots: [{ d: 1400, n: 'menu-open' }],
  },
  {
    name: 'door-hover',
    steps: [
      ['scrollEl', '#works'],
      ['eval', 'window.__doorHover && window.__doorHover(0); window.__doorAjar && window.__doorAjar(0, 0.1)', 900],
    ],
    shots: [{ d: 200, n: 'door-hover' }],
    probe: `(function(){
      const d = document.querySelector('.unit .door')
      const u = document.querySelectorAll('.unit')
      const info = document.querySelector('.dinfo')
      return JSON.stringify({
        door: d ? getComputedStyle(d).transform : 'none',
        on: document.querySelectorAll('.unit.on').length,
        focus: document.getElementById('works').className,
        infoOn: info ? info.classList.contains('on') : false,
        infoTXT: info ? (info.querySelector('.dinfo__h').textContent || '').trim() : '',
        faded: u.length ? Math.round(parseFloat(getComputedStyle(u[1].querySelector('.doorway')).opacity) * 100) : -1,
      })
    })()`,
  },
  {
    name: 'room-open',
    steps: [
      ['scrollEl', '#works'],
      ['click', '.unit .doorway', 200],
    ],
    shots: [
      { d: 1500, n: 'door-walk' },   /* mid walk-through: wall zooming into the gap */
      { d: 5400, n: 'room-open' },
    ],
    probe: `(function(){
      const r = document.querySelector('article.room')
      if (!r) return 'no room'
      const inn = r.querySelector('.room__in')
      const b = r.getBoundingClientRect()
      const dr = document.querySelector('.unit .droom')
      return JSON.stringify({
        modal: 'article.room',
        t: b.top, l: b.left, w: b.width, h: b.height,
        pos: getComputedStyle(r).position,
        clip: getComputedStyle(r).clipPath,
        op: inn && getComputedStyle(inn).opacity,
        doorRoom: dr ? [dr.getBoundingClientRect().width, dr.getBoundingClientRect().height].join('x') : 'none',
        y: window.scrollY,
      })
    })()`,
  },
  {
    name: 'room-closeback',
    steps: [
      ['scrollEl', '#works'],
      ['click', '.unit .doorway', 6000],
      ['click', '.room__back'],
    ],
    shots: [
      { d: 500, n: 'room-closing' },
      { d: 3200, n: 'room-closeback' },
    ],
    probe: `(function(){
      const s = document.getElementById('works')
      const d = s && s.querySelector('.unit .door')
      return JSON.stringify({
        cls: s ? s.className : 'none',
        tf: s ? s.style.transform : 'none',
        door: d ? getComputedStyle(d).transform : 'none',
        header: getComputedStyle(document.querySelector('.hdr')).opacity,
      })
    })()`,
  },
  {
    name: 'cal-midflip',
    steps: [['eval', 'window.__calFlip && window.__calFlip()', 0]],
    shots: [{ d: 460, n: 'cal-midflip' }, { d: 900, n: 'cal-lateflip' }],
    probe: `(function(){
      const leaf = document.querySelector('.cal__leaf')
      const face = document.querySelector('.cal__face')
      const under = document.querySelector('[data-under]')
      return JSON.stringify({
        leafTF: leaf ? getComputedStyle(leaf).transform.slice(0, 60) : 'none',
        faceOp: face ? getComputedStyle(face).opacity : '',
        underWord: under ? under.querySelector('.cal__word').textContent : '',
        faceWord: face ? face.querySelector('.cal__word').textContent : '',
        no: under ? under.querySelector('.cal__no').textContent : '',
      })
    })()`,
  },
]

for (const inter of INTERACTIONS) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${URL_}`, { method: 'PUT' })).json()
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  let id = 0
  const pend = new Map()
  const events = []
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pend.has(msg.id)) { pend.get(msg.id)(msg); pend.delete(msg.id) }
    else if (msg.method) events.push(msg.method)
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
  const t0 = Date.now()
  while (!events.includes('Page.loadEventFired') && Date.now() - t0 < 15000) await sleep(120)
  /* the profile persists localStorage between interactions — clear mode pollution */
  if (inter.name !== 'dark-home') {
    await send('Runtime.evaluate', { expression: `localStorage.removeItem('ashwan-mode')` })
    const mark = events.length
    await send('Page.reload')
    const t1 = Date.now()
    while (!events.slice(mark).includes('Page.loadEventFired') && Date.now() - t1 < 15000) await sleep(120)
  }
  await sleep(4200)

  for (const [kind, a, b] of inter.steps) {
    if (kind === 'click') {
      await send('Runtime.evaluate', { expression: `document.querySelector('${a}')?.click()` })
      await sleep(b || 1200)
    } else if (kind === 'scrollEl') {
      await send('Runtime.evaluate', { expression: `document.querySelector('${a}').scrollIntoView({block:'start',behavior:'instant'})` })
      await sleep(1600)
    } else if (kind === 'eval') {
      await send('Runtime.evaluate', { expression: a })
      await sleep(b || 500)
    }
  }

  /* checkpoint screenshots at cumulative delays after the last step */
  let lastD = 0
  for (const s of inter.shots || [{ d: 300, n: inter.name }]) {
    await sleep(Math.max(0, s.d - lastD))
    lastD = s.d
    const shot = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(path.join(OUT, `${s.n}.png`), Buffer.from(shot.result.data, 'base64'))
    console.log('shot', s.n)
  }
  if (inter.probe) {
    const dbg = await send('Runtime.evaluate', { expression: inter.probe })
    console.log(`probe ${inter.name}:`, dbg.result?.result?.value)
  }
  await send('Target.closeTarget', { targetId: t.id }).catch(() => {})
  ws.close()
}
} finally {
  proc.kill()
}
