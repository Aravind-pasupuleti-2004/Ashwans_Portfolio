import { Reveal } from '../lib/ui.jsx'
import { ArrowRight, ArrowUpRight } from './Icons.jsx'
import { personal, footer, contact } from '../data/portfolio.js'

export default function Footer() {
  const go = (e, to) => {
    e.preventDefault()
    document.querySelector(to)?.scrollIntoView({ behavior: 'smooth' })
  }
  const year = new Date().getFullYear()

  return (
    <div className="slot">
      <footer className="sf" aria-label="Footer">
        <div className="sf__in">
          <span className="sf__eye"><i /> Available for new work</span>
          <h2 className="sf__h">
            Got a project?<span>Let's cut it together.</span>
          </h2>
          <p className="sf__p">
            {personal.role} — wedding edits, YouTube videos, motion graphics or design. Tell me
            what you are making and let us shape it.
          </p>

          {contact.email ? (
            <div className="sf__cta">
              <a className="sf__btn" href={`mailto:${contact.email}`}>
                Start a project
                <b><ArrowRight /></b>
              </a>
              <button className="sf__ghost" onClick={(e) => go(e, '#works')}>
                See my work
              </button>
            </div>
          ) : (
            <div className="sf__cta">
              <button className="sf__btn" onClick={(e) => go(e, '#works')}>
                See my work
                <b><ArrowRight /></b>
              </button>
              <button className="sf__ghost" onClick={(e) => go(e, '#contact')}>
                Reach me <ArrowUpRight />
              </button>
            </div>
          )}

          <div className="sf__cols">
            <div>
              <h3>Work</h3>
              <ul className="work">
                {footer.workLinks.map((w) => (
                  <li key={w}>
                    <button type="button" onClick={(e) => go(e, '#works')}>{w}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Navigate</h3>
              <ul>
                {footer.navigate.map((n) => (
                  <li key={n.label}>
                    <button type="button" onClick={(e) => go(e, n.to)}>{n.label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Status</h3>
              <ul>
                {footer.status.map((s) => (
                  <li key={s} className="st">{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sf__bot">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
            <span>
              © {year} {personal.name}. {footer.legal}
            </span>
          </div>
        </div>

        <p className="sf__word" aria-hidden="true">
          <span>{footer.bigWord}</span>
        </p>
      </footer>
    </div>
  )
}
