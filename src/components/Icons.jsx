/* Small lucide-style icon set (inline, zero-dependency). */

function I({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (p) => (
  <I {...p}><path d="M5 12h14M13 6l6 6-6 6" /></I>
)
export const ArrowUp = (p) => (
  <I {...p}><path d="M12 19V5M5 12l7-7 7 7" /></I>
)
export const ArrowUpRight = (p) => (
  <I {...p}><path d="M7 7h10v10M7 17 17 7" /></I>
)
export const ArrowLeft = (p) => (
  <I {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></I>
)
export const Play = (p) => (
  <I {...p}><polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" /></I>
)
export const External = (p) => (
  <I {...p}><path d="M15 3h6v6M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></I>
)
export const Close = (p) => (
  <I {...p}><path d="M18 6 6 18M6 6l12 12" /></I>
)
export const MenuIcon = (p) => (
  <I {...p}><path d="M4 6h16M4 12h16M4 18h16" /></I>
)
export const Sun = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </I>
)
export const Moon = (p) => (
  <I {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></I>
)
export const Film = (p) => (
  <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 5v14M17 5v14M3 12h18M3 8.5h4M3 15.5h4M17 8.5h4M17 15.5h4" /></I>
)
export const Mail = (p) => (
  <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></I>
)
export const Instagram = (p) => (
  <I {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </I>
)
export const ShieldCheck = (p) => (
  <I {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></I>
)
export const Palette = (p) => (
  <I {...p}>
    <circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.75-.46 2.28-1.16.67-.88.67-2.14-.3-3.11-.7-.7-.7-1.63 0-2.33H19c1.66 0 3-1.34 3-3 0-5.52-4.5-10.4-10-10.4z" />
  </I>
)
export const Scissors = (p) => (
  <I {...p}>
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.12 8.12 12 12M20 4 8.12 15.88M14.47 14.48 20 20" />
  </I>
)
export const Rewind = (p) => (
  <I {...p}><path d="M11 17V7l-6 5 6 5z" fill="currentColor" stroke="none" /><path d="M19 17V7l-6 5 6 5z" fill="currentColor" stroke="none" /><path d="M3 3v18" /></I>
)
export const Volume2 = (p) => (
  <I {...p}><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></I>
)
export const Type = (p) => (
  <I {...p}><polyline points="4 7 4 4 20 4 20 7" /><path d="M9 20h6" /><path d="M12 4v16" /></I>
)
export const Shape = (p) => (
  <I {...p}><path d="M12 3v10a2 2 0 0 1-2 2H4V7a4 4 0 0 1 4-4h4z" /><rect x="12" y="13" width="9" height="8" rx="1.5" /></I>
)
