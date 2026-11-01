import { useEffect, useState } from 'react'
import { useClock, useScrollLock } from '../lib/ui.jsx'
import { Close, MenuIcon, Sun, Moon } from './Icons.jsx'
import { personal } from '../data/portfolio.js'

const ITEMS = [
  { label: 'Home', to: '#home' },
  { label: 'My work', to: '#works' },
  { label: 'My story', to: '#story' },
  { label: 'Skills', to: '#skills' },
  { label: 'Tools', to: '#tools' },
  { label: 'Contact', to: '#contact' },
]

export default function Header({ mode, onToggleMode }) {
  const { time, date, dshort } = useClock()
  const [stuck, setStuck] = useState(false)
  const [away, setAway] = useState(false)
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState('#home')

  useScrollLock(open)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setStuck(y > 64)
      setAway(y > 420 && y > lastY)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* highlight the section in view */
  useEffect(() => {
    const ids = ITEMS.map((i) => i.to.slice(1))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCur('#' + e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const go = (e, to) => {
    e.preventDefault()
    setOpen(false)
    const el = document.querySelector(to)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className={`hdr rv${stuck ? ' stuck' : ''}${away ? ' away' : ''}`}>
        <div className="shell hdr__in">
          <nav aria-label="Primary">
            <ul className="nav">
              {ITEMS.map((it) => (
                <li key={it.to}>
                  <button onClick={(e) => go(e, it.to)} aria-current={cur === it.to}>
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hdr__right">
            <button
              className="chip mode-btn"
              onClick={onToggleMode}
              role="switch"
              aria-checked={mode === 'dark'}
              aria-label="Toggle dark mode"
            >
              {mode === 'dark' ? <Sun /> : <Moon />}
              <span className="sr-only">Toggle dark mode</span>
            </button>
            <div className="chip clock" aria-label="Local time">
              <span className="clock__lbl">Local time</span>
              <span className="clock__time tnum">{time}</span>
              <span className="clock__sep" aria-hidden="true">•</span>
              <span className="clock__date">{date}</span>
              <span className="clock__ds">{dshort}</span>
            </div>
            <button
              className="chip menu-btn"
              id="menuBtn"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-label="Menu"
            >
              <span>
                <MenuIcon />
                <span className="word">Menu</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className={`menu${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu">
        <div className="shell menu__top">
          <span className="menu__brand">{personal.name}</span>
          <button className="close-btn" onClick={() => setOpen(false)}>
            <Close /> Close
          </button>
        </div>
        <div className="shell menu__nav">
          <ul>
            {ITEMS.map((it, i) => (
              <li key={it.to}>
                <button
                  className="menu__item"
                  style={{ '--d': `${150 + i * 60}ms` }}
                  onClick={(e) => go(e, it.to)}
                >
                  <small>0{i + 1}</small>
                  <span>{it.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="shell menu__bot">
          <span className="pulse"><i /> Available for work</span>
          <button onClick={onToggleMode} aria-label="Toggle dark mode">
            {mode === 'dark' ? <span>LIGHT</span> : <span>DARK MODE</span>}
            <span style={{ marginLeft: '0.5rem', display: 'inline-block' }}>{mode === 'dark' ? '☀' : '☾'}</span>
          </button>
          <span>Video Editor &amp; Graphic Designer</span>
          <span>Local time — {time}</span>
        </div>
      </div>
    </>
  )
}
