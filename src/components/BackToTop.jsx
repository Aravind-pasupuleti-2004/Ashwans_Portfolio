import { useEffect, useState } from 'react'

export default function BackToTop() {
  const [show, setShow] = useState(false)
  const [p, setP] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setShow(y > window.innerHeight * 0.6)
      setP(max > 0 ? Math.min(1, y / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`totop${show ? ' show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <svg className="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      <svg className="ring" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" style={{ '--len': 62.83, '--p': p }} />
      </svg>
    </button>
  )
}
