import { useEffect, useRef } from 'react'
import { Reveal } from '../lib/ui.jsx'
import { ArrowRight, ArrowUp, ArrowUpRight, Play, Film, Rewind } from './Icons.jsx'
import { personal, hero } from '../data/portfolio.js'

/* =========================================================
   Flip-calendar skill widget — desk calendar on an endless
   flip. One leaf rotates a full 352° OVER the top of the stack
   and slips away behind it; the skill fades over the turn; the
   sheet beneath is dimmed and brightens as the page peels back
   (the seam is hidden by repainting on animation finish).
   Timing to the reference cycle: FLIP 1250ms, HOLD 1700ms.
   ========================================================= */
export function FlipCalendar({ words }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const cal = rootRef.current
    if (!cal) return
    const q = (s, c) => (c || cal).querySelector(s)
    const body = q('.cal__body')
    const face = q('.cal__face')
    const leaf = q('.cal__leaf')
    const under = q('[data-under]')
    const measure = q('.cal__measure')
    const rings = q('.cal__rings')
    const n = words.length
    const FLIP = 1250
    const HOLD = 1700
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let i = 0
    let timer = 0
    let started = false
    let dead = false

    const paint = (page, k) => {
      q('.cal__word', page).textContent = words[k]
      q('.cal__no', page).textContent = `${String(k + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`
    }
    paint(face, 0)
    paint(under, 1 % n)

    /* size the page to the longest word, shrink the whole calendar
       if the column gets narrow, recount rings + punched holes */
    function fit() {
      cal.style.fontSize = ''
      const fs = parseFloat(getComputedStyle(cal).fontSize)
      let max = 0
      for (const w of words) {
        measure.textContent = w
        max = Math.max(max, measure.getBoundingClientRect().width)
      }
      const wEm = max / fs + 0.8 + 0.06 // word + side padding
      body.style.setProperty('--cal-w', wEm.toFixed(3) + 'em')
      cal.style.setProperty('--cal-w', wEm.toFixed(3) + 'em')
      const host = cal.closest('.h1')
      if (host) {
        const avail = host.getBoundingClientRect().width - fs * 0.25
        const need = wEm * fs
        if (need > avail) cal.style.fontSize = ((fs * avail) / need).toFixed(2) + 'px'
      }
      const count = Math.max(5, Math.round((wEm - 0.64) / 0.7) + 1)
      if (rings) rings.innerHTML = '<i></i>'.repeat(count)
      cal.querySelectorAll('.cal__holes').forEach((h) => {
        h.innerHTML = '<i></i>'.repeat(count)
      })
    }
    fit()
    document.fonts?.ready.then(() => !dead && fit())
    const onResize = () => { clearTimeout(fit._t); fit._t = setTimeout(() => !dead && fit(), 120) }
    addEventListener('resize', onResize)

    function flip() {
      if (dead) return
      if (document.hidden) { timer = setTimeout(flip, 600); return }
      const next = (i + 1) % n
      if (reduce) {
        i = next
        paint(face, i)
        paint(under, (i + 1) % n)
        timer = setTimeout(flip, HOLD + 700)
        return
      }
      const timing = { duration: FLIP, easing: 'cubic-bezier(.5,.05,.2,1)', fill: 'forwards' }
      /* the current face disappears over the turn */
      face.animate(
        [{ opacity: 1 }, { opacity: 1, offset: 0.285 }, { opacity: 0, offset: 0.295 }, { opacity: 0 }],
        { duration: FLIP, easing: 'linear', fill: 'forwards' },
      )
      /* once the page is over the top it slips away behind the stack —
         the back of the page catches the light coming over, then dims as it drops */
      q('.cal__rear', leaf).animate(
        [
          { filter: 'brightness(1)' },
          { filter: 'brightness(1.02)', offset: 0.29 },
          { filter: 'brightness(.96)', offset: 0.45 },
          { filter: 'brightness(.9)' },
        ],
        { duration: FLIP, easing: 'linear', fill: 'forwards' },
      )
      const a = leaf.animate(
        [
          { transform: 'translateZ(.004em) rotateX(0deg)' },
          { transform: 'translateZ(.004em) rotateX(352deg)' },
        ],
        timing,
      )
      /* shadow sweeps across the page as it lifts */
      q('.cal__shade', face).animate(
        [{ opacity: 0 }, { opacity: 0.45, offset: 0.2 }, { opacity: 0, offset: 0.275 }, { opacity: 0 }],
        { duration: FLIP, easing: 'linear', fill: 'forwards' },
      )
      /* the revealed page brightens as the page peels off it */
      q('.cal__shade', under).animate(
        [{ opacity: 0.7 }, { opacity: 0 }],
        { duration: FLIP * 0.9, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' },
      )
      a.onfinish = () => {
        i = next
        paint(face, i) // the leaf now shows what was underneath…
        leaf.getAnimations({ subtree: true }).forEach((x) => x.cancel())
        cal.querySelectorAll('.cal__shade').forEach((sh) => sh.getAnimations().forEach((x) => x.cancel()))
        paint(under, (i + 1) % n) // …and the next skill waits below
        timer = setTimeout(flip, HOLD)
      }
    }

    const start = () => {
      if (started || dead) return
      started = true
      timer = setTimeout(flip, 1300) // first turn a beat after the intro
    }
    if (document.body.classList.contains('ready')) start()
    else addEventListener('intro:ready', start, { once: true })

    window.__calFlip = flip

    return () => {
      dead = true
      clearTimeout(timer)
      removeEventListener('resize', onResize)
      leaf?.getAnimations({ subtree: true }).forEach((x) => x.cancel())
    }
  }, [words])

  return (
    <span className="cal" ref={rootRef}>
      <span className="cal__body">
        <span className="cal__stand" />
        <span className="cal__stack">
          <span className="cal__back"><span className="cal__holes" /></span>
          <span className="cal__page" data-under>
            <span className="cal__holes" />
            <span className="cal__word" />
            <span className="cal__no" />
            <span className="cal__shade" />
          </span>
          <span className="cal__leaf">
            <span className="cal__face">
              <span className="cal__holes" />
              <span className="cal__word" />
              <span className="cal__no" />
              <span className="cal__shade" />
            </span>
            <span className="cal__rear"><span className="cal__holes" /></span>
          </span>
        </span>
        <span className="cal__rings" />
      </span>
      <span className="cal__measure" />
      <span className="sr-only">{words.join(', ')}</span>
    </span>
  )
}

/* ---------- hero ---------- */
export default function Hero({ onOpenShowreel }) {
  const [g1, g2, g3] = hero.greeting

  return (
    <section id="home" className="hero" aria-label="Introduction">
      <div className="hero__vig" aria-hidden="true" />
      <div className="hero__amb" aria-hidden="true" />

      <div className="hero__stage">
        <div className="fig">
          <button className="reel" onClick={onOpenShowreel} aria-label="Explore the showreel">
            <span className="reel__placeholder">
              <span className="reel__wm">ASHWAN</span>
              <span className="reel__play"><Play /></span>
            </span>
            <span className="reel__cap">
              <span>{hero.showreelLabel}</span>
              <em>Weddings · Docs · YouTube · Motion</em>
            </span>
          </button>
          <button className="fig__card" onClick={onOpenShowreel}>
            <Rewind /> Explore my work
          </button>
        </div>
      </div>

      <div className="shell hero__content">
        <div className="hero__left">
          <Reveal as="p" className="eyebrow" style={{ '--d': '200ms' }}>{hero.eyebrow}</Reveal>
          <h1 className="h1">
            <span className="sr-only">{[g1, g2, g3].join(' ')}</span>
            <span aria-hidden="true">
              <span className="line"><span style={{ '--d': '250ms' }}>{g1}</span></span>
              <span className="line"><span className="soft" style={{ '--d': '370ms' }}>{g2}</span></span>
              <span className="cal-line">
                <Reveal as="span" style={{ '--d': '520ms' }}>
                  <FlipCalendar words={hero.flipWords} />
                </Reveal>
              </span>
            </span>
          </h1>
          <Reveal className="ctas" style={{ '--d': '750ms', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button className="pill pill--dark pill--arrow" onClick={() => document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="pill__in" data-h="s 1 1.04" data-hs="320 18" data-ht=".pill">
                {hero.ctas.work}
                <span className="pill__badge" data-h="x 0 3" data-hs="320 18" data-ht=".pill"><ArrowRight /></span>
              </span>
            </button>
            <button className="pill pill--outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="pill__in" data-h="s 1 1.04" data-hs="320 18" data-ht=".pill">{hero.ctas.contact}</span>
            </button>
          </Reveal>
        </div>

        <Reveal className="hero__right" style={{ '--d': '620ms' }}>
          <div className="reelchip">
            <em>Now editing</em>
            <span><strong>{personal.role}</strong> — cutting stories, moving type and grading pictures frame by frame.</span>
            <span className="linkline" onClick={onOpenShowreel} role="button" tabIndex={0}>
              Open the reel <ArrowUpRight />
            </span>
          </div>
          <div className="reelchip">
            <em>Daily drivers</em>
            <span>Premiere Pro · After Effects · Photoshop</span>
          </div>
        </Reveal>
      </div>

      <div className="shell hero__bar">
        <span className="pulse"><i style={{ background: 'var(--ok)' }} /> {hero.status.left}</span>
        <span className="mid">{hero.status.mid}</span>
        <span className="scroll">{hero.status.right} <ArrowUp /></span>
      </div>
    </section>
  )
}
