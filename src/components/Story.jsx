import { useEffect, useRef, useState } from 'react'
import { Reveal } from '../lib/ui.jsx'
import { ArrowUpRight } from './Icons.jsx'
import { about, experience, skills, tools } from '../data/portfolio.js'

/* ---------- odometer year ---------- */
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
function Odometer({ value }) {
  return (
    <div className="story__yr" aria-label={value} role="text">
      {value.split('').map((d, i) => (
        <span className="dg" key={i} aria-hidden="true">
          <span className="dg__c" style={{ '--d': String(DIGITS.indexOf(d)) }}>
            {DIGITS.map((n) => (
              <i key={n}>{n}</i>
            ))}
          </span>
        </span>
      ))}
    </div>
  )
}

/* ---------- story ---------- */
export default function Story() {
  const stageRef = useRef(null)
  const listRef = useRef(null)
  const [dp, setDp] = useState(0)
  const [ch, setCh] = useState(0)
  const [now, setNow] = useState(false)

  useEffect(() => {
    const update = () => {
      const list = listRef.current
      const stage = stageRef.current
      if (!list || !stage) return
      const mid = window.innerHeight / 2
      const lr = list.getBoundingClientRect()
      const dp = Math.min(1, Math.max(0, (mid - lr.top) / lr.height))
      setDp(dp)

      const chs = list.querySelectorAll('.ch')
      let idx = 0
      chs.forEach((c, i) => {
        const cr = c.getBoundingClientRect()
        if (cr.top <= mid) idx = i
      })
      setCh(idx)

      const active = chs[idx].getBoundingClientRect()
      setNow(active.top <= mid && active.bottom >= mid)

      stage.style.setProperty('--r0', '0px')
      stage.style.setProperty('--rh', `${lr.height}px`)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const cur = experience[Math.min(ch, experience.length - 1)]

  return (
    <>
      <section id="story" className={`story${now ? ' is-now' : ''}`} data-ch={ch} aria-label="My story">
        <div className="story__amb" aria-hidden="true">
          {experience.map((e) => (
            <i key={e.role} style={{ '--c1': e.theme.c1, '--c2': e.theme.c2 }} />
          ))}
        </div>

        <div className="shell story__pin">
          <div ref={stageRef} className="story__stage">
            <div className="story__clock">
              <p className="eyebrow">{about.kicker}</p>
              <h2 className="story__h">{about.heading}</h2>
              <p className="story__lead">{about.intro}</p>
              <p className="story__lead" style={{ marginTop: '0.5rem' }}>{about.introDetail}</p>
              <Odometer value={cur.year} />
              <p className="story__when">{cur.date}</p>
              <div className="story__meter">
                <span className="story__of tnum">
                  {String(ch + 1).padStart(2, '0')}/{String(experience.length).padStart(2, '0')}
                </span>
                <svg className="story__rw" viewBox="0 0 24 24" style={{ '--p': dp }} aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M21 3v6h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="story__bar"><b style={{ '--p': dp }} /></span>
              </div>
            </div>

            <div className="story__line">
              <div ref={listRef} className="story__list">
                <span className="story__rail" aria-hidden="true" />
                <span className="story__fill" style={{ '--dp': dp, '--r0': '0px', '--rh': '100%' }} aria-hidden="true" />
                <span className="story__dottrack" aria-hidden="true">
                  <span className="story__dot" />
                </span>
                {experience.map((e, i) => (
                  <div key={e.role} className={`ch${i === ch ? ' on' : ''}`}>
                    <p className="ch__date">{e.date}</p>
                    <h3 className="ch__t">{e.role}</h3>
                    <p className="ch__org">{e.org}</p>
                    <ul className="ch__b">
                      {e.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Reveal as="p" className="story__lead" style={{ marginTop: '2.5rem', maxWidth: '46ch' }}>
                  {tools.heading}
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- skills ---------- */}
      <section id="skills" className="skills" aria-label="Skills and expertise">
        <div className="shell">
          <div className="sec-head">
            <p className="eyebrow">{skills.kicker}</p>
            <h2 className="sec-title">{skills.heading}</h2>
          </div>
          <div className="skills__grid">
            {skills.items.map((s, i) => (
              <Reveal key={s} style={{ '--d': `${i * 50}ms` }}>
                <button className="skill-row" type="button" tabIndex={-1} aria-disabled>
                  <small className="tnum">0{i + 1}</small>
                  <b>{s}</b>
                  <ArrowUpRight />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- creative tools ---------- */}
      <section id="tools" className="tools" aria-label="Creative tools">
        <div className="shell">
          <div className="sec-head">
            <p className="eyebrow">{tools.kicker}</p>
            <h2 className="sec-title">
              The software <span className="soft">I work with.</span>
            </h2>
          </div>
          <div className="tools__grid">
            {tools.items.map((t, i) => (
              <Reveal key={t.name} style={{ '--d': `${i * 55}ms` }}>
                <div className="tool" style={{ '--i-tint': t.tint }}>
                  <span className="tool__tile">{t.abbr}</span>
                  <span className="tool__name">{t.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
