import { useEffect, useState } from 'react'
import { personal } from '../data/portfolio.js'

const BANDS = [
  { label: personal.name, c: '#1f1c1c', t: '#e8e4e0', dir: 1 },
  { label: 'Wedding Films', c: '#4a2e35', t: '#e8e4e0', dir: -1 },
  { label: 'Documentary', c: '#3e4a44', t: '#e8e4e0', dir: 1 },
  { label: 'YouTube', c: '#7a3f34', t: '#f3eeec', dir: -1 },
  { label: 'Motion Graphics', c: '#a4702e', t: '#f3eeec', dir: 1 },
  { label: 'Graphic Design', c: '#c4b0b0', t: '#1a1818', dir: -1 },
  { label: 'Six projects', c: '#5c5470', t: '#e8e4e0', dir: 1 },
]

export default function Loader({ onDone }) {
  const [out, setOut] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const done = { flag: false }
    const timers = []

    /* progress: interval-based so throttled/virtual-time ticks still advance */
    timers.push(
      setInterval(() => {
        setPct((p) => {
          const n = p + 0.04
          if (n >= 1) clearInterval(id)
          return Math.min(1, n)
        })
      }, 55),
    )
    const id = timers[timers.length - 1]

    BANDS.forEach((_, i) => {
      timers.push(setTimeout(() => document.getElementById(`band-${i}`)?.classList.add('on'), 140 + i * 130))
    })

    const finish = () => {
      if (done.flag) return
      done.flag = true
      setOut(true)
      document.getElementById('loader')?.classList.add('out')
      onDone?.()
    }

    /* both paths converge; whichever fires first wins */
    setTimeout(finish, 2400)
    if (document.readyState === 'complete') {
    } else {
      window.addEventListener('load', () => {
        setTimeout(finish, 900)
      }, { once: true })
    }

    return () => {
      timers.forEach((t) => {
        clearInterval(t)
        clearTimeout(t)
      })
      done.flag = true
    }
  }, [])

  return (
    <div className={`loader${out ? ' out' : ''}`} id="loader" aria-hidden="true">
      <div className="loader__bg" />
      <div className="loader__stack">
        {BANDS.map((b, i) => (
          <div key={b.label} id={`band-${i}`} className="loader__band" style={{ '--k': i, '--c': b.c, '--t': b.t, '--dir': b.dir }}>
            <span>{b.label}</span>
          </div>
        ))}
      </div>
      <div className="loader__hud">
        <div className="loader__top">
          <span><b>{personal.name}</b> · Portfolio</span>
          <span>Video · Motion · Design</span>
        </div>
        <div className="loader__bot">
          <p className="loader__num">
            <small>Opening up the work</small>
            <span id="ldCount">{Math.round(pct * 100).toString().padStart(3, '0')}</span>
          </p>
          <div className="loader__bar"><i style={{ '--p': pct }} /></div>
        </div>
      </div>
    </div>
  )
}
