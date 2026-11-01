import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../lib/ui.jsx'
import { spring, holdScroll, stopLenis, startLenis, snapTo, REDUCED, CAN_HOVER, T } from '../lib/anim.js'
import { Film, ArrowLeft, External } from './Icons.jsx'
import { projects } from '../data/portfolio.js'

/* computes a darker partner tone without color-mix (keep support wide) */
function darken(hex, f = 0.93) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * f)
  const g = Math.round(((n >> 8) & 255) * f)
  const b = Math.round((n & 255) * f)
  return `rgb(${r}, ${g}, ${b})`
}

/* what each door holds — shown beside the door on hover (desktop),
   docked under it on phones: [headline, kicker, checklist] */
function infoFor(p) {
  const sentences = p.description
    .split('. ')
    .filter(Boolean)
    .map((t, i, a) => (i < a.length - 1 ? t + '.' : t))
  return [p.title, p.category, [...sentences, `Built in ${p.tools.join(' + ')}`]]
}

/* ---------- one door with its casing ---------- */
function Door({ p, i }) {
  return (
    <li className="unit" style={{ '--i': i, '--door': p.accent, '--door-dk': darken(p.accent) }}>
      <button className="doorway" aria-label={`Open the ${p.title} door`}>
        <span className="casing" />
        <span className="opening">
          <span className="droom" />
          <span className="door">
            <span className="door__flute" />
            <span className="plate">{p.title}</span>
            <span className="handle">
              <span className="handle__lever" />
              <span className="handle__lock" />
            </span>
            <span className="door__shade" />
          </span>
          <span className="sill" />
        </span>
      </button>
    </li>
  )
}

/* ---------- detail room (walk-in destination) ---------- */
export function ProjectRoom({ project, onClose, onBeginClose }) {
  const [live, setLive] = useState(null)
  const [lit, setLit] = useState(false)
  const [closing, setClosing] = useState(false)
  useScrollLock(!!live)

  useEffect(() => {
    if (!project) return
    setLive(project)
    setLit(false)
    setClosing(false)
    /* one frame after mount: wipe open + reveal content (timeout is headless-safe) */
    const t = setTimeout(() => setLit(true), 50)
    return () => clearTimeout(t)
  }, [project])

  const requestClose = () => {
    if (!live || closing) return
    setClosing(true)
    onBeginClose?.()
    /* the room plays its exit (glow re-warms, content sinks, wipe closes),
       then unmounts and the doors walk back out of the gap */
    setTimeout(() => {
      setLive(null)
      onClose?.()
    }, 900)
  }

  useEffect(() => {
    if (!live) return
    const onKey = (e) => e.key === 'Escape' && requestClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, closing])

  useSpringsRoom(live)

  if (!live) return null

  const cls = `room anim${closing ? '' : ' open'}${!closing && lit ? ' lit' : ''}`

  /* portal to <body> — the gallery sits in a z-1 stacking context and the
     hero (z-2) would otherwise paint over the room's top strip */
  return createPortal(
    <>
      <div className={`room-veil${closing ? '' : ' open'}`} onClick={requestClose} />
      <article className={cls} role="dialog" aria-modal="true" aria-label={`${live.title} — detail`} data-lenis-prevent>
        <div className="room__glow" />
        <div className="room__in">
          <div className="room__top">
            <button className="room__back" onClick={requestClose}>
              <ArrowLeft /> Back to the gallery
            </button>
            <span className="room__cat">{live.category}</span>
          </div>
          <div className="room__head">
            <h2 className="room__title">{live.title}</h2>
            <p className="room__desc">{live.description}</p>
            <div className="room__tools">
              {live.tools.map((t) => (
                <span key={t} className="room__tool">{t}</span>
              ))}
            </div>
          </div>

          <div className="room__media">
            {live.videoUrl ? (
              <iframe
                src={live.videoUrl}
                title={live.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            ) : live.thumb ? (
              <img src={live.thumb} alt={live.title} />
            ) : (
              <div className="room__ph">
                <Film />
                <small>Preview slot — add thumb / videoUrl in src/data/portfolio.js</small>
              </div>
            )}
          </div>

          {live.videoUrl || live.projectUrl ? (
            <a className="room__open pill pill--dark pill--arrow" href={live.projectUrl || live.videoUrl} target="_blank" rel="noreferrer">
              <span className="pill__in" data-h="s 1 1.04" data-hs="320 18" data-ht=".pill">
                Open the project
                <span className="pill__badge" data-h="x 0 3" data-hs="320 18" data-ht=".pill"><External /></span>
              </span>
            </a>
          ) : (
            <p className="room__note">
              Placeholder project — drop real media in <code>public/media/</code> and wire it up in{' '}
              <code>src/data/portfolio.js</code>.
            </p>
          )}
        </div>
      </article>
    </>,
    document.body,
  )
}

/* re-bind spring hovers once the room content exists */
function useSpringsRoom(live) {
  useEffect(() => {
    if (!live) return
    const t = setTimeout(() => import('../lib/anim.js').then((m) => m.bindSprings(document)), 0)
    return () => clearTimeout(t)
  }, [live])
}

/* ---------- section: the doors wall ---------- */
export default function Works() {
  const secRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [room, setRoom] = useState(null)

  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* =====================================================
     doors driver — springs, hover promotion (dinfo + ajar),
     the walk-through, and the pinned mobile wall. Built once.
     ===================================================== */
  useEffect(() => {
    const el = secRef.current
    if (!el) return
    const q = (s, c) => (c || el).querySelector(s)
    const units = Array.from(el.querySelectorAll('.unit'))
    const wall = q('.works__wall')
    const row = q('.works__row')
    const pin = q('.works__pin')
    const info = q('.dinfo')
    const badge = document.getElementById('doorCursor')
    const MOB = window.matchMedia('(max-width: 639.98px)')
    const ANG = 70
    let busy = false
    let walkRaf = 0
    let walkT = []
    let roomIdx = -1
    let mRaf = 0

    /* each door: one spring drives the slab angle + all spill shading (--o) */
    const doors = units.map((u) => {
      const door = q('.door', u)
      const s = spring({ tension: 120, friction: 14 }, (o) => {
        door.style.transform = `rotateY(${(Math.max(0, o) * ANG).toFixed(3)}deg)` // frame's door stop: never swings outward
        u.style.setProperty('--o', Math.max(0, o).toFixed(4))
      })
      return { u, door, way: q('.doorway', u), s }
    })

    /* dinfo content + accessible description */
    const INFO = projects.map(infoFor)
    units.forEach((u, i) => {
      const [, t, list] = INFO[i]
      doors[i].way.setAttribute('aria-description', `${t}: ${list.join(', ')}`)
    })
    const setInfo = (i) => {
      const [h, t, list] = INFO[i]
      q('.dinfo__h', info).textContent = h
      q('.dinfo__t', info).textContent = t
      q('.dinfo__p', info).innerHTML = list.map((s) => `<li>${s}</li>`).join('')
    }

    /* position the description in the space of the faded doors,
       centred over the widest run of doorboxes beside the open one */
    const placeInfo = (i) => {
      if (MOB.matches) return // docked by CSS
      const visible = doors.filter((d) => getComputedStyle(d.u).visibility !== 'hidden' && d.u.offsetWidth > 0)
      const vi = visible.findIndex((d) => d.u === doors[i].u)
      if (vi < 0) return
      const top = doors[i].u.offsetTop
      const same = visible.filter((d) => Math.abs(d.u.offsetTop - top) < 8)
      const k = same.findIndex((d) => d.u === doors[i].u)
      const right = same.slice(k + 1)
      const left = same.slice(0, k)
      const chain = right.length >= left.length ? right : left
      const run = chain.length ? chain : doors
      const wr = wall.getBoundingClientRect()
      const ur = doors[i].u.getBoundingClientRect()
      let l = Infinity
      let r = -Infinity
      for (const d of run) {
        const b = d.u.getBoundingClientRect()
        l = Math.min(l, b.left)
        r = Math.max(r, b.right)
      }
      const w = Math.min(r - l - 24, 352)
      info.style.width = `${w}px`
      info.style.left = `${l - wr.left + (r - l - w) / 2}px`
      info.style.top = `${ur.top - wr.top + ur.height * 0.5 - info.offsetHeight / 2}px`
    }

    /* one source of truth: whichever door is under the pointer right now
       (re-checked on every move + scroll), so the description can never be
       left behind however fast the cursor travels */
    let active = -1
    let token = 0
    let px = -1
    let py = -1
    const show = (i) => {
      const my = ++token
      doors.forEach((d, k) => d.u.classList.toggle('on', k === i))
      el.classList.add('focus')
      const place = () => {
        if (my !== token || active !== i) return // something newer happened
        setInfo(i)
        placeInfo(i)
        info.classList.add('on')
      }
      if (info.classList.contains('on')) {
        info.classList.remove('on')
        walkT.push(setTimeout(place, 130))
      } else {
        place()
      }
    }
    const hide = () => {
      token++
      el.classList.remove('focus')
      doors.forEach((d) => d.u.classList.remove('on'))
      info.classList.remove('on')
    }
    const set = (i) => {
      if (busy) i = -1
      if (i === active) return
      active = i
      if (i < 0) hide()
      else show(i)
    }
    const under = (node) => {
      const w = node && node.closest ? node.closest('.doorway') : null
      return w ? units.findIndex((u) => u.contains(w)) : -1
    }
    const onMove = (e) => { px = e.clientX; py = e.clientY; set(under(e.target)) }
    const onScroll = () => { if (px >= 0) set(under(document.elementFromPoint(px, py))) }
    const onDocLeave = () => set(-1)
    const onBlur = () => set(-1)
    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onDocLeave)
    addEventListener('blur', onBlur)
    if (CAN_HOVER) window.__doorHover = set
    /* headless/touch-safe hook for tests + keyboard ajar: set door i's
       open-fraction directly (0..1, 0.1 = the hover crack). Reduced-motion
       users never get it, so the wall can be verified fully static */
    window.__doorAjar = (i, v) => {
      if (REDUCED) return
      const d = doors[i]
      if (d && !busy) d.s.set(v)
    }

    /* cursor badge that replaces the pointer over a doorway */
    let over = false
    const placeBadge = (e) => {
      badge?.style.setProperty('transform', `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`)
    }
    const showBadge = (on) => { over = on; badge?.classList.toggle('on', on) }
    if (CAN_HOVER) {
      addEventListener('pointermove', (e) => { if (over) placeBadge(e) }, { passive: true })
      doors.forEach((d) => {
        d.way.addEventListener('pointerenter', (e) => { placeBadge(e); if (!busy) showBadge(true) })
        d.way.addEventListener('pointerleave', () => showBadge(false))
      })
    }

    /* hovering a door: promote the section to its own layer and hold it there
       (pre-warms the GPU layer the walk-through will need) */
    const lift = () => { if (!el.classList.contains('lift')) el.classList.add('lift') }
    el.addEventListener('pointerenter', lift)

    doors.forEach((d, i) => {
      d.way.addEventListener('focus', lift)
      d.way.addEventListener('focus', () => { if (d.way.matches(':focus-visible')) set(i) })
      d.way.addEventListener('blur', () => { if (px < 0 || under(document.elementFromPoint(px, py)) !== i) set(-1) })
      if (CAN_HOVER && !REDUCED) {
        d.way.addEventListener('mouseenter', () => { if (!busy) d.s.set(0.1) }) //opens a crack
        d.way.addEventListener('mouseleave', () => { if (!busy) d.s.set(0) })
      }
      d.way.addEventListener('click', () => enter(i))
    })

    /* below the wall: stand the camera in front of the right door first */
    function openDoor(i) {
      if (busy) return
      const top = MOB.matches
        ? mobY(i)
        : el.getBoundingClientRect().top + window.scrollY
      const far = Math.abs(window.scrollY - top) > 4
      if (far) snapTo(top)
      const t0 = performance.now()
      const settle = () => {
        if (Math.abs(window.scrollY - top) > 24 && performance.now() - t0 < 1500) return requestAnimationFrame(settle)
        enter(i)
      }
      requestAnimationFrame(settle)
    }
    window.__openDoor = openDoor

    /* lion tamer: lever press → slab swings to the walk angle at ~170ms →
       wall zooms into the lit gap at ~760ms → hand off to the room */
    function enter(i) {
      if (busy) return
      busy = true
      lift()
      showBadge(false)
      set(-1)
      doors.forEach((o, k) => { if (k !== i) o.s.set(0) })
      const d = doors[i]
      d.u.classList.add('press')
      walkT = [
        setTimeout(() => d.u.classList.remove('press'), T.DOOR_PRESS),
        setTimeout(() => d.s.set(1), REDUCED ? 0 : T.DOOR_SWING), // full 70deg open
        setTimeout(() => through(i), REDUCED ? 0 : T.WALK),
      ]
      document.documentElement.classList.add('walking')
    }

    /* ------------------------------------------------------------------
       walk through: the whole wall scales up around the dark gap beside
       the open door until the room behind fills the screen; then the
       detail room takes over from the same picture. Driven per frame so
       the browser scales the existing layer instead of re-rendering it.
       ------------------------------------------------------------------ */
    function through(i) {
      const u = units[i]
      const r = q('.opening', u).getBoundingClientRect()
      const dr = q('.door', u).getBoundingClientRect()
      const gapL = Math.min(Math.max(dr.right, r.left), r.right - 6)
      const gw = Math.max(r.right - gapL, 10)
      const gh = r.height
      const cx = (gapL + r.right) / 2
      const cy = r.top + gh * 0.5
      holdScroll(true)
      stopLenis()
      const sr = el.getBoundingClientRect()
      el.style.transformOrigin = `${cx - sr.left}px ${cy - sr.top}px`
      el.classList.add('through')
      const tx = window.innerWidth / 2 - cx
      const ty = window.innerHeight / 2 - cy
      const sEnd = Math.max(window.innerWidth / gw, window.innerHeight / gh) * 1.15
      const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
      const t0 = performance.now()
      const D = REDUCED ? 1 : T.WALK_ZOOM
      let handed = false
      const step = (now) => {
        const p = Math.min(1, (now - t0) / D)
        const e2 = ease(p)
        const sc = Math.exp(Math.log(sEnd) * e2) // even speed of approach
        const f = Math.min(1, e2 * 1.6) // drift the door to centre early on
        el.style.transform = `translate(${(tx * f).toFixed(2)}px, ${(ty * f).toFixed(2)}px) scale(${sc.toFixed(4)})`
        if (!handed && (sc >= sEnd / 1.15 || p >= 1)) { handed = true; handoff(i) }
        if (p < 1) walkRaf = requestAnimationFrame(step)
      }
      walkRaf = requestAnimationFrame(step)
      function handoff(id) {
        roomIdx = id
        holdScroll(false) // release the swallow; Lenis stays stopped via useScrollLock
        setRoom(id) // the room's clip wipe continues the walk
      }
    }

    /* leaving the room: walk back out of the doorway, then the slab
       swings shut behind you */
    function walkBack() {
      if (roomIdx < 0) return
      const from = el.style.transform
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([\d.]+)\)/.exec(from) || []
      const X = +m[1] || 0
      const Y = +m[2] || 0
      const S = +m[3] || 1
      cancelAnimationFrame(walkRaf)
      const t0 = performance.now()
      const D = REDUCED ? 1 : T.ZOOM_BACK
      const ease = (x) => 1 - Math.pow(1 - x, 3)
      const step = (now) => {
        const p = Math.min(1, (now - t0) / D)
        const e2 = ease(p)
        const sc = Math.exp(Math.log(S) * (1 - e2))
        el.style.transform = `translate(${(X * (1 - e2)).toFixed(2)}px, ${(Y * (1 - e2)).toFixed(2)}px) scale(${sc.toFixed(4)})`
        if (p < 1) walkRaf = requestAnimationFrame(step)
        else {
          el.style.transform = ''
          el.style.transformOrigin = ''
          el.classList.remove('through', 'lift')
          document.documentElement.classList.remove('walking')
          busy = false
          startLenis() // room unmount's useScrollLock cleanup will also call this, but idempotent
          const i = roomIdx
          roomIdx = -1
          if (i >= 0) setTimeout(() => doors[i]?.s.set(0), T.DOOR_SURGE) // door settles shut
        }
      }
      walkRaf = requestAnimationFrame(step)
    }
    window.__walkBack = walkBack

    /* -------- phones: the wall pins; scrolling walks one door at a time -------- */
    let mIdx = 0
    let mForce = -1
    let mShown = -1
    const mSpan = () => Math.max(1, el.offsetHeight - window.innerHeight)
    const mobY = (i) => el.getBoundingClientRect().top + window.scrollY + (Math.min(5, Math.max(0, i)) / 5) * mSpan()
    const mDots = Array.from(el.querySelectorAll('.works__dots i'))
    let mCur = 0
    let mLast = 0
    let mSettle = 0
    let swipeLock = 0
    /* scroll progress across the pinned wall → a door position that rests
       on each door and glides between them */
    const mDwell = (f) => {
      const k = Math.floor(f)
      const t = f - k
      const u = Math.min(1, Math.max(0, (t - 0.2) / 0.6))
      return k + u * u * (3 - 2 * u)
    }
    const mProgress = () => Math.min(1, Math.max(0, -el.getBoundingClientRect().top / mSpan()))
    const mTarget = () => (mForce >= 0 ? mForce : mDwell(mProgress() * 5))

    function mShow(i) {
      if (i === mShown) return
      mShown = i
      setInfo(i)
      mDots.forEach((d, k) => d.classList.toggle('on', k === Math.min(5, i)))
      /* the description just filled: re-fit the door under the new text */
      if (MOB.matches) mSize()
      info.getAnimations().forEach((a) => a.cancel())
      if (!REDUCED) {
        info.animate(
          [{ opacity: 0, transform: 'translateY(.4rem)' }, { opacity: 1, transform: 'none' }],
          { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' },
        )
      }
    }
    function mFrame(now) {
      mRaf = 0
      if (!MOB.matches) { row.style.transform = ''; return }
      const dt = Math.min(64, now - (mLast || now))
      mLast = now
      const t = mTarget()
      mCur = REDUCED ? t : mCur + (t - mCur) * Math.min(1, (dt / 1000) * 10)
      mCur = Math.max(t - 1, Math.min(t + 1, mCur))
      if (Math.abs(t - mCur) < 0.001) mCur = t
      const stp = units[1].offsetLeft - units[0].offsetLeft
      row.style.transform = `translate3d(${(-mCur * stp).toFixed(2)}px,0,0)`
      mIdx = Math.round(t)
      mShow(mForce >= 0 ? mForce : mIdx)
      if (mCur !== t) mRaf = requestAnimationFrame(mFrame)
    }
    const mApply = () => { if (!mRaf) mRaf = requestAnimationFrame(mFrame) }
    /* the door takes exactly the height left under the text; the docked
       description (and, on short screens, the checklist stepping aside)
       eats into it */
    function mSize() {
      if (!MOB.matches) { pin.style.removeProperty('--uw'); el.classList.remove('compact'); return }
      const fit = () => {
        const pr = pin.getBoundingClientRect()
        const rr = row.getBoundingClientRect()
        const avail = pr.bottom - rr.top - parseFloat(getComputedStyle(row).paddingTop) - 2
        const below = info.classList.contains('on') ? info.offsetHeight + 32 : 0 // docked text + .9rem gap + wall gap
        return Math.min(window.innerWidth * 0.6, (avail - below) / 2.25)
      }
      el.classList.remove('compact')
      let w = fit()
      if (w < 150) { el.classList.add('compact'); w = fit() }
      pin.style.setProperty('--uw', Math.max(110, w).toFixed(1) + 'px')
      mApply()
    }
    mSize()
    addEventListener('resize', mSize)
    document.fonts?.ready.then(() => mSize())
    /* the reveal, the font swap and late wraps all move the row: re-fit when
       the wall shows and again once settle timers give the layout its last word */
    const revealIO = new IntersectionObserver(
      (es) => { if (es.some((e) => e.isIntersecting)) { mSize(); revealIO.disconnect() } },
      { threshold: 0.05 },
    )
    revealIO.observe(el)
    const fitTimers = [setTimeout(() => mSize(), 750), setTimeout(() => mSize(), 1600)]
    /* when scrolling stops part-way between two doors, ease onto the nearest */
    function mFromScroll() {
      if (!MOB.matches || busy) return
      mApply()
      clearTimeout(mSettle)
      mSettle = setTimeout(function settle() {
        if (busy || mForce >= 0 || performance.now() < swipeLock) return
        const r = el.getBoundingClientRect()
        if (r.top > 0 || r.bottom < window.innerHeight) return // only while pinned
        const want = mobY(Math.round(mProgress() * 5))
        if (Math.abs(window.scrollY - want) > 2) snapTo(want)
      }, 220)
    }
    addEventListener('scroll', mFromScroll, { passive: true })
    /* a sideways swipe steps exactly one door from where the finger landed */
    let tx0 = 0
    let ty0 = 0
    let i0 = 0
    el.addEventListener('touchstart', (e) => {
      tx0 = e.touches[0].clientX
      ty0 = e.touches[0].clientY
      i0 = Math.round(mProgress() * 5)
    }, { passive: true })
    el.addEventListener('touchend', (e) => {
      if (!MOB.matches || busy || mForce >= 0) return
      const dx = e.changedTouches[0].clientX - tx0
      const dy = e.changedTouches[0].clientY - ty0
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return
      const to = Math.min(5, Math.max(0, i0 + (dx < 0 ? 1 : -1)))
      swipeLock = performance.now() + 700
      snapTo(mobY(to))
    }, { passive: true })
    if (MOB.matches) { mShown = -1; mShow(0); info.classList.add('on'); mCur = mTarget(); mApply() }
    const onMobChange = () => {
      mForce = -1
      mShown = -1
      mFromScroll()
      mApply()
      if (MOB.matches) { info.classList.add('on'); mShow(0) }
    }
    MOB.addEventListener?.('change', onMobChange)

    /* a11y: taptic description hidden when there is no pointer+hover and no mobile pin */
    if (!CAN_HOVER && !MOB.matches) info.style.display = 'none'

    return () => {
      walkT.forEach(clearTimeout)
      clearTimeout(mSettle)
      fitTimers.forEach(clearTimeout)
      revealIO.disconnect()
      cancelAnimationFrame(walkRaf)
      cancelAnimationFrame(mRaf)
      removeEventListener('pointermove', onMove)
      removeEventListener('scroll', onScroll)
      removeEventListener('blur', onBlur)
      document.documentElement.removeEventListener('pointerleave', onDocLeave)
      removeEventListener('resize', mSize)
      removeEventListener('scroll', mFromScroll)
      MOB.removeEventListener?.('change', onMobChange)
      delete window.__doorHover
      delete window.__doorAjar
      delete window.__openDoor
      delete window.__walkBack
    }
  }, [])

  return (
    <section id="works" ref={secRef} className={`works ${inView ? 'in' : ' pre'}`} aria-label="Selected works">
      <div className="works__tex" aria-hidden="true" />
      <div className="works__pin">
        <div className="shell works__wall">
          <h2 className="paint">Six edits. One reel at a time.</h2>
          <p className="works__dots" aria-hidden="true">
            <i className="on" /><i /><i /><i /><i /><i />
          </p>
          <ul className="works__row">
            {projects.map((p, i) => (
              <Door key={p.id} p={p} i={i} />
            ))}
          </ul>
          {/* before the row on desktop (absolutely positioned; moveable), after
              it on phones: the description docks under the door like the ref */}
          <div className="dinfo" aria-live="polite">
            <h3 className="dinfo__h" />
            <p className="dinfo__t" />
            <ul className="dinfo__p" />
          </div>
          <p className="works__hint">
            <span>{projects.length} doors · placeholder reel</span>
            <span>Replace media via src/data/portfolio.js</span>
          </p>
        </div>
      </div>

      <div id="doorCursor" className="door-cursor" aria-hidden="true">Click to enter</div>

      {room !== null && (
        <ProjectRoom
          key="room"
          project={projects[room]}
          onClose={() => setRoom(null)}
          onBeginClose={() => window.__walkBack?.()}
        />
      )}
    </section>
  )
}
