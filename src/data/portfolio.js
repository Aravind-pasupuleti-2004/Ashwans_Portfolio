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
  flipWords: ['Photoshop', 'Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Color Grading', 'Sound Sync'],
  taglineAlt: 'Creative visuals. Meaningful stories. Impactful experiences.',
  ctas: { work: 'See my work', contact: 'Get in touch' },
  showreelLabel: 'Showreel · Photoshop · Premiere · After Effects · DaVinci',
  // Bottom status bar of the hero
  status: {
    left: 'Available for work',
    mid: 'Photoshop · Premiere Pro · After Effects · DaVinci Resolve',
    right: 'Scroll to explore',
  },
}

/* Selected works (placeholder projects) ------------------- */
export const projects = [
  {
    id: 'photoshop-works',
    title: 'ADOBE PHOTOSHOP',
    category: 'Photo Editing & Compositing',
    description:
      'Photo Manipulation & Compositing. Photo Retouching & Enhancement. Typography & Poster Design. Advertising & Product Design.',
    skills: [
      'Photo Manipulation & Compositing',
      'Photo Retouching & Enhancement',
      'Typography & Poster Design',
      'Advertising & Product Design',
    ],
    tools: ['Adobe Photoshop'],
    gallery: [
      { src: '/media/ps-layer-11.jpg', alt: 'Photoshop composite — layer study' },
      { src: '/media/ps-layer-12.jpg', alt: 'Photoshop composite — layer study' },
      { src: '/media/ps-white.jpg', alt: 'Poster design — white key visual' },
      { src: '/media/ps-11.jpg', alt: 'Photoshop artwork' },
      { src: '/media/ps-sampu.jpg', alt: 'Edited key art' },
      { src: '/media/ps-paradise.webp', alt: 'The Paradise — poster design' },
      { src: '/media/ps-jadal-jamana.webp', alt: 'Jadal Jamana — poster design' },
      { src: '/media/ps-kaadhal.webp', alt: 'Kaadhal poster recreation' },
      { src: '/media/ps-biker.webp', alt: 'Photo manipulation — biker' },
      { src: '/media/ps-mohanbabu.webp', alt: 'Photo manipulation — portrait' },
    ],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#31A8FF',
  },
  {
    id: 'premiere-pro-works',
    title: 'ADOBE PREMIERE PRO',
    category: 'Video Editing & Post-Production',
    description:
      'Trailer & Teaser Editing. Music Video & Beat Cuts. Social Media & Promotional Videos. Short Film Editing & Promo Cuts.',
    skills: [
      'Trailer & Teaser Editing',
      'Music Video & Beat Cuts',
      'Social Media & Promotional Videos',
      'Short Film Editing & Promo Cuts',
    ],
    tools: ['Adobe Premiere Pro'],
    videos: [
      'zZkn-bc2loU',
      '9uIqsUvPyTE',
      'xMf7hhuQa_I',
      'z6ivrKF5JsM',
      'eJwtFygSSgE',
    ],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#9999FF',
  },
  {
    id: 'after-effects-works',
    title: 'ADOBE AFTER EFFECTS',
    category: 'Motion Graphics & Visual Effects',
    description:
      'Motion Graphics & Animation. Reels & Shorts. Title Design Animation. Logo Animation & Brand Videos.',
    skills: [
      'Motion Graphics & Animation',
      'Reels & Shorts',
      'Title Design Animation',
      'Logo Animation & Brand Videos',
    ],
    tools: ['Adobe After Effects'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#9999FF',
  },
  {
    id: 'davinci-resolve-works',
    title: 'DAVINCI RESOLVE',
    category: 'Color Grading & Finishing',
    description:
      'Cinematic Color Grading. Color Correction & Skin Tone. Professional Video Editing.',
    skills: [
      'Cinematic Color Grading',
      'Color Correction & Skin Tone',
      'Professional Video Editing',
    ],
    tools: ['DaVinci Resolve'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#57C8FF',
  },
  {
    id: 'ai-works',
    title: 'AI WORKS',
    category: 'AI-Powered Creative Production',
    description:
      'AI Image Generation. AI Video Generation. AI Image Enhancement & Editing. AI-Assisted Video Production.',
    skills: [
      'AI Image Generation',
      'AI Video Generation',
      'AI Image Enhancement & Editing',
      'AI-Assisted Video Production',
    ],
    tools: ['AI Tools for Editing'],
    videoUrl: '',
    projectUrl: '',
    thumb: null,
    preview: null,
    accent: '#000000',
    aiDoor: true,
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
    'Photoshop Works',
    'Premiere Pro Works',
    'After Effects Works',
    'DaVinci Resolve',
    'AI Works',
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
