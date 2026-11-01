/* =========================================================
   ASHWAN — CENTRALIZED CONTENT CONFIGURATION
   =========================================================
   Everything the portfolio shows is editable here.
   You should not need to touch any React component to
   update writing, projects, experience, skills or contact.

   ── HOW TO REPLACE PLACEHOLDER PROJECTS ──────────────────
   Each project below currently uses a generated placeholder
   thumbnail ("thumb: null"). To publish a real project:
     1. Drop your thumbnail into  public/media/  (e.g. public/media/wedding.jpg)
     2. Set  thumb:  '/media/wedding.jpg'
     3. Optional: set  preview: '/media/wedding-preview.mp4'  (short muted loop,
        ~3–6s, small file) that plays when the card is hovered.
     4. Optional: set  videoUrl: 'https://...'  (YouTube/Vimeo/drive link)
        and it will be openable from the project detail view.
   Everything else (title, category, description, tools) is plain text.

   ⚠ The six projects are PLACEHOLDERS, not delivered client work.
   Do not add clients, dates, awards or metrics that didn't happen.
   ========================================================= */

export const personal = {
  name: 'Ashwan',
  role: 'Video Editor & Graphic Designer',
  roles: ['Video Editor', 'Graphic Designer', 'Motion Designer'],
}

/* Hero ---------------------------------------------------- */
export const hero = {
  eyebrow: 'Video Editor',
  greeting: ["Hi, I'm Ashwan.", 'I turn ideas into', 'visual stories.'],
  // Words the flip-calendar cycles through (short, fact-based skills)
  flipWords: ['Visual Stories', 'Video Editing', 'Motion Graphics', 'Color Grading', 'Sound Sync', 'Reels & Shorts'],
  taglineAlt: 'Creative visuals. Meaningful stories. Impactful experiences.',
  ctas: { work: 'See my work', contact: 'Get in touch' },
  showreelLabel: 'Showreel · Placeholder',
  // Bottom status bar of the hero
  status: {
    left: 'Available for work',
    mid: 'Video · Motion · Design · Stories',
    right: 'Scroll to explore',
  },
}

/* Selected works (placeholder projects) ------------------- */
export const projects = [
  {
    id: 'wedding-films',
    title: 'Wedding Films',
    category: 'Cinematic Wedding Editing',
    description:
      'Placeholder project. A long-form cinematic wedding edit — pacing, music selection and color built around the couple’s best moments. Full-length film editing with clean scene transitions.',
    tools: ['Premiere Pro', 'After Effects'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#6B5C5C',
  },
  {
    id: 'wedding-teasers',
    title: 'Wedding Teasers',
    category: 'Wedding Teasers & Short-form Editing',
    description:
      'Placeholder project. Punchy 30–90 second wedding teasers cut to music — hooks first, beat-synced cuts and rhythm-driven pacing for quick consumption.',
    tools: ['Premiere Pro', 'After Effects'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#8A5C50',
  },
  {
    id: 'documentary',
    title: 'Documentary Editing',
    category: 'Documentary-Style Storytelling',
    description:
      'Placeholder project. Story-first editing: interviews, b-roll sequencing and natural sound that follow a real narrative arc from beginning to end.',
    tools: ['Premiere Pro', 'Photoshop'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#5C6B4C',
  },
  {
    id: 'youtube',
    title: 'YouTube Videos',
    category: 'YouTube Video Editing',
    description:
      'Placeholder project. Retention-focused YouTube edits — hooks, jump cuts, on-screen text and story pacing designed to keep viewers watching.',
    tools: ['Premiere Pro', 'After Effects'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#9A4A3C',
  },
  {
    id: 'motion-graphics',
    title: 'Motion Graphics',
    category: 'Motion Graphics & Animation',
    description:
      'Placeholder project. Animated titles, lower-thirds and logo reveals — type and shapes brought to life with clean timing and easing.',
    tools: ['After Effects', 'Illustrator'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#B0763C',
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    category: 'Graphic Design & Visual Communication',
    description:
      'Placeholder project. Posters, thumbnails and social layouts — hierarchy, color and typography working together for clear communication.',
    tools: ['Photoshop', 'Illustrator'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#5B5B7A',
  },
]

/* About --------------------------------------------------- */
export const about = {
  kicker: 'My story',
  heading: 'From the first cut to full-time frames.',
  intro:
    'I am Ashwan, a passionate Video Editor and Graphic Designer with hands-on experience in editing, motion graphics and visual storytelling.',
  introDetail:
    'Skilled in Adobe Premiere Pro, After Effects and Photoshop, I focus on creating clean, engaging visual stories. I enjoy transforming ideas into compelling visual experiences through creative editing, thoughtful design and attention to detail.',
}

/* Experience (real entries only — nothing invented) -------- */
export const experience = [
  {
    role: 'Freelance Video Editor',
    org: 'Working for myself',
    date: 'Nov 2025 — Present',
    year: '2025',
    bullets: [
      'Wedding teasers.',
      'Wedding video songs.',
      'YouTube video editing.',
    ],
    theme: { c1: '190,110,80', c2: '70,110,160' },
  },
  {
    role: 'Graphic Designer & Video Editor',
    org: 'TAC — THE ART CODE',
    date: 'Mar 2026 — Present',
    year: '2026',
    bullets: [
      'Editing and motion graphics for brand and social content.',
      'Design-led visual storytelling across projects.',
    ],
    theme: { c1: '120,120,190', c2: '70,150,130' },
  },
]

/* Skills & expertise (no fabricated percentages) ----------- */
export const skills = {
  kicker: 'Expertise',
  heading: 'What I bring to the timeline.',
  items: [
    'Short-form Editing',
    'Documentary-Style Editing',
    'Visual Storytelling',
    'Video Color Correction',
    'Reels & Shorts',
    'Sound Design & Music Synchronization',
    'Motion Graphics',
  ],
}

/* Creative tools ------------------------------------------ */
export const tools = {
  kicker: 'Creative tools',
  heading: 'The software I work with.',
  items: [
    { name: 'Adobe Premiere Pro', abbr: 'Pr', tint: '#5C4A6B' },
    { name: 'Adobe After Effects', abbr: 'Ae', tint: '#4A4A5C' },
    { name: 'Adobe Photoshop', abbr: 'Ps', tint: '#2E4A5C' },
    { name: 'Adobe Illustrator', abbr: 'Ai', tint: '#5C4A2E' },
    { name: 'DaVinci Resolve', abbr: 'Dv', tint: '#3C4A5C' },
    { name: 'AI Tools for Editing', abbr: 'AI', tint: '#6B5C5C' },
  ],
}

/* Contact -------------------------------------------------
   Nothing is invented here. Email / Instagram are empty, so
   the site simply hides those links. Fill them in later and
   they appear automatically.                                    */
export const contact = {
  kicker: 'Contact',
  heading: 'Got a project in the pipeline?',
  text: 'Wedding edits, YouTube videos, motion graphics or design — tell me what you are making and let us shape it together.',
  email: 'ashwanraojakkinapally@gmail.com',
  instagram: 'https://www.instagram.com/ashwan_rao/?hl=en',
  // Shown only while the fields above are empty:
  emptyNote: 'Direct contact details coming soon.',
}

/* Footer nav ---------------------------------------------- */
export const footer = {
  workLinks: [
    'Wedding Films',
    'Wedding Teasers',
    'Documentary Editing',
    'YouTube Videos',
    'Motion Graphics',
    'Graphic Design',
  ],
  navigate: [
    { label: 'Home', to: '#home' },
    { label: 'My work', to: '#works' },
    { label: 'My story', to: '#story' },
    { label: 'Skills', to: '#skills' },
    { label: 'Contact', to: '#contact' },
  ],
  status: ['Available for work', 'Video Editor & Graphic Designer'],
  bigWord: 'ASHWAN',
  legal: 'Designed and built for Ashwan.',
}
