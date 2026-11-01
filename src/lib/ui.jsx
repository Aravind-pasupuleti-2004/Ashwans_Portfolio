import { useEffect, useRef, useState } from 'react'

/* Fires inline entrance reveals when an element scrolls into view.
   Fine-grained reveals are set up as CSS (.rv -> .in), tuned with
   --d / --from / --to-o style indirection on the markup side. */
export function Reveal({ children, className = '', style = {}, as: Tag = 'div', amount = 0.2, ...rest }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.disconnect()
          }
        })
      },
      { threshold: amount, rootMargin: '0px 0px -5% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [amount])

  return (
    <Tag ref={ref} className={`${className} ${inView ? 'in' : ''}`.trim()} style={style} {...rest}>
      {children}
    </Tag>
  )
}

/* Locks page scroll while a modal / overlay is open.
   Talks to Lenis when it is running; falls back to a body lock. */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    const y = window.scrollY
    const b = document.body
    const lenis = window.__lenis
    lenis?.stop()
    b.style.overflow = 'hidden'
    b.style.touchAction = 'none'
    return () => {
      b.style.overflow = ''
      b.style.touchAction = ''
      if (lenis) lenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
      lenis?.start()
    }
  }, [active])
}

/* Binds the shared spring hovers to any [data-h] chips on mount.
   Safe to call from several components (idempotent per element). */
export function useSprings(deps = []) {
  useEffect(() => {
    /* after paint so trigger nodes exist */
    const t = setTimeout(() => import('./anim.js').then((m) => m.bindSprings(document)), 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* Live clock chip text, minute-precision. */
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  const time = now
    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?(am|pm)/i, (_, a) => a.toLowerCase())
    .toLowerCase()
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/, ',')
  const dshort = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return { time, date, dshort }
}
