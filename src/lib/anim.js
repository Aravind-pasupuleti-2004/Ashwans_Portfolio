/* =========================================================
   MOTION ARCHITECTURE
   Shared timing constants, easing curves, the spring engine
   (semi-implicit Euler, mass 1) and declarative hover springs,
   plus lazy Lenis smooth scrolling. Every animation on the site
   pulls timings from here so sections stay in step.
   ========================================================= */

export const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const CAN_HOVER =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

/* Reference-derived timing values (ms unless deg noted) ------- */
export const T = {
  DOOR_PRESS: 380,   // lever press before the slab starts to swing
  DOOR_SWING: 170,   // delay after press before the door opens
  WALK: 760,         // door swings open → walk-through starts
  WALK_ZOOM: 1500,   // camera zoom into the lit gap
  ZOOM_BACK: 1300,   // walk back out of the room
  DOOR_SURGE: 900,   // update-back settle before the door swings shut
}

/* Shared easing library (micro-durations stay local to CSS) --- */
export const E = {
  soft: 'cubic-bezier(.16,1,.3,1)',
  spring: 'cubic-bezier(.22,1,.36,1)',
  snap: 'cubic-bezier(.7,0,.2,1)',
  press: 'cubic-bezier(.3,.7,.4,1)',
  walk: 'cubic-bezier(.5,0,.75,1)',
  flip: 'cubic-bezier(.5,.05,.2,1)',
  reveal: 'cubic-bezier(.65,0,.25,1)',
}

/* ---------- spring (mass 1, semi-implicit Euler) ---------- */
export function spring({ tension = 320, friction = 18 } = {}, render) {
  let x = 0, v = 0, target = 0, raf = 0
  const step = () => {
    const dt = 1 / 60, a = tension * (target - x) - friction * v
    v += a * dt
    x += v * dt
    render(x)
    if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001) { x = target; v = 0; render(x); raf = 0; return }
    raf = requestAnimationFrame(step)
  }
  render(0)
  return {
    set(t) { target = t; if (!raf) raf = requestAnimationFrame(step) },
    get value() { return x },
  }
}

/* ---------- declarative hovers (data-h) --------------------
   data-h="s 1 1.04|y 0 -2|o .8 1"  data-hs="320 18"  data-ht=".pill"
   k: s = scale, x/y = translate px, r = rotate deg, o = opacity   */
export function bindSprings(scope = document) {
  if (!scope || !CAN_HOVER || REDUCED) return
  scope.querySelectorAll('[data-h]').forEach((el) => {
    if (el._h) return
    el._h = 1
    const props = (el.dataset.h || '').split('|').map((p) => {
      const [k, a, b] = p.trim().split(/\s+/)
      return { k, a: +a, b: +b }
    })
    const [tension, friction] = (el.dataset.hs || '320 18').split(/\s+/).map(Number)
    const trig = el.dataset.ht ? el.closest(el.dataset.ht) || el : el
    const render = (p) => {
      const v = { s: 1, x: 0, y: 0, r: 0 }
      let o = null
      props.forEach(({ k, a, b }) => {
        const val = a + (b - a) * p
        if (k === 'o') o = val
        else v[k] = val
      })
      el.style.transform = `translate(${v.x}px,${v.y}px) rotate(${v.r}deg) scale(${v.s})`
      if (o !== null) el.style.opacity = o
    }
    const s = spring({ tension, friction }, render)
    trig.addEventListener('mouseenter', () => s.set(1))
    trig.addEventListener('mouseleave', () => s.set(0))
    trig.addEventListener('focusin', () => s.set(1))
    trig.addEventListener('focusout', () => s.set(0))
  })
}

/* ---------- Lenis smooth scrolling (lazy, once) ------------- */
export async function initLenis() {
  if (REDUCED) return
  if (typeof window === 'undefined' || window.__lenisBoot) return
  window.__lenisBoot = true
  try {
    const { default: Lenis } = await import('lenis')
    const lenis = new Lenis({
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.25,
      duration: 1.05,
    })
    window.__lenis = lenis
    const raf = (time) => { lenis.raf(time); window.__lenisRaf = requestAnimationFrame(raf) }
    window.__lenisRaf = requestAnimationFrame(raf)
  } catch (e) {
    window.__lenis = null
  }
}

export function snapTo(top) {
  const lenis = window.__lenis
  if (lenis && !REDUCED) {
    lenis.scrollTo(top, { duration: 0.6, easing: (x) => 1 - Math.pow(1 - x, 3) })
  } else {
    window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' })
  }
}

/* Warm-swallows window-level wheel/touch/key input while the walk-
   through plays (a layout change here caused stalls before). Only the
   event swallow lives here — the Lenis freeze is separate (stopLenis),
   because the swallow must drop the moment the room takes over while
   Lenis has to stay stopped until the walk-back settles. */
let swallow = (e) => e.preventDefault()
let keysStop = (e) => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key)) e.preventDefault()
}
export function holdScroll(on) {
  if (on) {
    addEventListener('wheel', swallow, { passive: false })
    addEventListener('touchmove', swallow, { passive: false })
    addEventListener('keydown', keysStop)
  } else {
    removeEventListener('wheel', swallow)
    removeEventListener('touchmove', swallow)
    removeEventListener('keydown', keysStop)
  }
}

/* Lenis freeze for the doors cycle — stop at the lever press so the
   page behind never drifts, start only after the walk-back settles.
   Stopped lenis keeps eating the page's own wheel/touch, while the room
   opts out with data-lenis-prevent, so its inner scroll stays native. */
export function stopLenis() {
  window.__lenis?.stop()
}
export function startLenis() {
  window.__lenis?.start()
}
