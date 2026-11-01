import { useEffect, useState } from 'react'
import Loader from './components/Loader.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Works, { ProjectRoom } from './components/Works.jsx'
import Story from './components/Story.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import { initLenis } from './lib/anim.js'
import { useSprings } from './lib/ui.jsx'
import { personal } from './data/portfolio.js'

const SHOWREEL = {
  id: 'showreel',
  title: `${personal.name}'s Showreel`,
  category: 'Video Editing · Placeholder',
  description:
    'A placeholder room for the showreel. When the reel is ready, set hero-level video details in src/data/portfolio.js (projects → thumbs / videoUrl) or point this card at your reel file.',
  tools: ['Premiere Pro', 'After Effects'],
  videoUrl: '',
  projectUrl: '',
  thumb: null,
}

export default function App() {
  useSprings()
  const [loaded, setLoaded] = useState(false)
  const [reelOpen, setReelOpen] = useState(false)
  const [mode, setMode] = useState(() =>
    document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    window.__lenisRaf && cancelAnimationFrame(window.__lenisRaf)
    initLenis()
  }, [])

  useEffect(() => {
    if (loaded) {
      document.body.classList.add('ready')
      document.getElementById('loader')?.remove()
      /* the hero (calendar) starts its cycle off this event, like the reference */
      requestAnimationFrame(() => dispatchEvent(new Event('intro:ready')))
    }
  }, [loaded])

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    document.documentElement.dataset.mode = next
    try {
      localStorage.setItem('ashwan-mode', next)
    } catch (e) {}
    const meta = document.querySelector('meta[name=theme-color]')
    if (meta) meta.content = next === 'dark' ? '#1A1818' : '#E8E4E0'
  }

  return (
    <>
      <Loader onDone={() => setLoaded(true)} />
      <Header mode={mode} onToggleMode={toggleMode} />

      <main id="main">
        <Hero onOpenShowreel={() => setReelOpen(true)} />
        <Works />
        <Story />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
      <ProjectRoom project={reelOpen ? SHOWREEL : null} onClose={() => setReelOpen(false)} />
    </>
  )
}
