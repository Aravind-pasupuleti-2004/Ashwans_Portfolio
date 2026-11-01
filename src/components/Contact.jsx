import { Reveal } from '../lib/ui.jsx'
import { ArrowUp, ArrowRight, Mail, Instagram } from './Icons.jsx'
import { contact } from '../data/portfolio.js'

export default function Contact() {
  return (
    <section id="contact" className="contact section" aria-label="Contact">
      <div className="shell contact__in">
        <Reveal className="pulse"><i /> {contact.kicker} — available for work</Reveal>
        <Reveal as="h2" className="contact__h" style={{ '--d': '80ms' }}>
          {contact.heading}
          <span>{"Let's talk."}</span>
        </Reveal>
        <Reveal as="p" className="contact__p" style={{ '--d': '160ms' }}>{contact.text}</Reveal>

        <Reveal className="contact__cta" style={{ '--d': '240ms', display: 'flex' }}>
          <button className="pill pill--dark pill--arrow" onClick={() => document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })}>
            <span className="pill__in">
              See my work
              <span className="pill__badge"><ArrowRight /></span>
            </span>
          </button>
          <button className="pill pill--outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="pill__in">
              <ArrowUp /> Back to top
            </span>
          </button>
        </Reveal>

        <Reveal className="contact__links" style={{ '--d': '320ms' }}>
          {contact.email ? (
            <a className="contact__link" href={`mailto:${contact.email}`}>
              <Mail /> {contact.email}
            </a>
          ) : null}
          {contact.instagram ? (
            <a className="contact__link" href={contact.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram /> @ashwan_rao
            </a>
          ) : null}
          {!contact.email && !contact.instagram ? (
            <span className="contact__empty">{contact.emptyNote}</span>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
