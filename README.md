# Ashwan — Portfolio (Video Editor & Graphic Designer)

A cinematic single-page portfolio built with **React + Vite + plain CSS** (no UI libraries).
Design language: warm paper `#E8E4E0` / charcoal `#1A1818`, the **Onest** variable typeface
(SIL Open Font License), pill CTAs, masked line reveals, a story timeline with a metro-style
odometer year, and a dark footer beaten by a giant background name.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Where everything is edited — `src/data/portfolio.js`

One file holds the whole site: personal info, hero copy, the six placeholder projects,
experience, skills, tools, contact details and footer links.

### Replacing the placeholder projects (Wedding Films, Wedding Teasers, Documentary, YouTube, Motion Graphics, Graphic Design)

1. Drop media into `public/media/` — e.g. `public/media/wedding-films.jpg`, and an optional
   short (3–6 s, muted, ~2 MB max) hover loop `public/media/wedding-films.mp4`.
2. In `src/data/portfolio.js`, for that project set:

```js
thumb: '/media/wedding-films.jpg',
preview: '/media/wedding-films.mp4',       // optional hover video
videoUrl: 'https://...',                   // optional embed/external link
projectUrl: 'https://...',                 // optional "open the project" link
```

3. Update `title`, `category`, `description` and `tools` freely. No other file needs editing.

> Until then the cards show generated placeholder art marked "Placeholder". The six projects
> are placeholders, not delivered client work — don't attach invented clients, dates or metrics.

### Adding contact details later

`contact.email` and `contact.instagram` are intentionally empty — the site hides unavailable
links instead of inventing them. When an address/account exists, fill them in the config and
the email button / Instagram chip appear automatically in Contact + Footer.

## Structure

```
src/
  data/portfolio.js          ← ALL editable content
  App.jsx                    page composition (loader, header, sections, footer)
  components/
    Loader.jsx               stacked-band preloader with counter
    Header.jsx               fixed bar (nav, clock chip, dark-mode chip, ink menu)
    Hero.jsx                 greeting, flip-calendar skill widget, showreel frame
    Works.jsx                gallery + hover previews + cursor badge + detail "room"
    Story.jsx                about + scroll timeline + skills + tools
    Contact.jsx / Footer.jsx / BackToTop.jsx
    ProjectRoom (in Works.jsx)
  lib/ui.jsx                 Reveal observer, scroll lock, clock hook
  styles/*.css               token system + per-section styles (plain CSS)
public/
  favicon.svg
  media/                     ← put real project media here
```

## Accessibility & performance

- `prefers-reduced-motion`: loaders, marquee-ish animation and transitions collapse gracefully.
- Below-fold media is `loading="lazy"`; hover videos only load once configured.
- No horizontal overflow at the test sizes (1920 / 1440 / 1024 / 768 / 390 / 360 px).
