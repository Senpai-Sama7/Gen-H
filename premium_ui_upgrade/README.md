# GEN-H Studio

Premium HVAC growth systems. A dark editorial website with sophisticated scroll-driven animations and a high-end aesthetic. Built with React, TypeScript, Tailwind CSS, GSAP ScrollTrigger, and Lenis smooth scrolling.

## Features

- **Hero Section** - Full-viewport with Ken Burns background, parallax scrolling, and fade-out text
- **Narrative Text** - Scroll-triggered text reveal with animated gold star icon
- **Card Stack** - Pinned scroll-driven card gallery with stacking effect (Attract → Qualify → Convert)
- **Breath Section** - Cinematic image banner with scale-up animation and metric cards
- **ZigZag Grid** - Alternating image/text layout with internal parallax (Clarify → Capture → Run → Optimize)
- **Footer** - Dark footer with magnetic button effect, contact grid, and watermark logo

## Design System

- **Background**: #0B0C0E (near-black)
- **Accent**: #D7A04D (warm gold) - CTAs and labels only
- **Text Primary**: #F4F6F8 (off-white)
- **Text Secondary**: #A6ACB2 (cool gray)
- **Typography**: Montserrat 700-900 (display, ALL CAPS) + Inter 400-500 (body)
- **Visual Elements**: Sharp corners (0px radius), cut-corner clip-path, noise overlay (4%)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 3 with custom theme
- GSAP (ScrollTrigger) for scroll-driven animations
- Lenis for smooth scrolling
- Lucide React for icons

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will auto-detect Vite and use the correct build settings
4. Deploy!

**Build Settings:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

The `vercel.json` configuration is included for proper SPA routing and caching headers.

### Other Platforms

The build output is in the `dist/` directory. It's a static site that can be deployed anywhere:
- Netlify
- Cloudflare Pages
- GitHub Pages
- AWS S3 + CloudFront

## Configuration

All content is managed through `src/config.ts`.

### Hero Configuration
```typescript
heroConfig: {
  title: "PREMIUM HVAC GROWTH SYSTEMS",
  subtitle: "Websites that attract. Briefs that qualify. A portal that converts.",
  ctaPrimary: "Start the Strategy Brief",
  ctaSecondary: "Book a Discovery Call",
}
```

### Card Stack Configuration
```typescript
cardStackConfig: {
  sectionTitle: "What We Build",
  sectionSubtitle: "Three Pillars of Growth",
  cards: [
    { id: 1, title: "ATTRACT", description: "...", rotation: -2 },
    { id: 2, title: "QUALIFY", description: "...", rotation: 1 },
    { id: 3, title: "CONVERT", description: "...", rotation: -1 },
  ]
}
```

### Process Steps (ZigZag Grid)
```typescript
zigZagGridConfig: {
  items: [
    { id: "clarify", title: "Make the value obvious in seconds", subtitle: "01 / Clarify" },
    { id: "capture", title: "Collect intent, not just contact info", subtitle: "02 / Capture" },
    { id: "run", title: "Review, assign, and close in one place", subtitle: "03 / Run" },
    { id: "optimize", title: "Scale with confidence", subtitle: "04 / Optimize" },
  ]
}
```

## Required Images

Place images in the `public/` directory:

| File | Description | Aspect Ratio |
|------|-------------|--------------|
| `hero-bg.jpg` | Modern minimalist interior | 16:9 |
| `breath-bg.jpg` | HVAC control room/dashboard | 21:9 |
| `card-1.jpg` | Premium website on laptop | 4:3 |
| `card-2.jpg` | Lead qualification form on tablet | 4:3 |
| `card-3.jpg` | Admin portal dashboard on monitor | 4:3 |
| `grid-1.jpg` | Team collaboration meeting | 4:3 |
| `grid-2.jpg` | Professional reviewing documents | 4:3 |
| `grid-3.jpg` | HVAC technician with tablet | 4:3 |
| `grid-4.jpg` | Executive reviewing analytics | 4:3 |

**Image Treatment**: Cool desaturated grade (saturation -35%, contrast +10%), blue-gray tint toward #2A3A45, subtle vignette.

## Animation Specifications

- All scroll animations use GSAP with `scrub: 0.6`
- `fromTo()` for reversible animations
- Pinned sections: `start: "top top"`, `end: "+=130%"`, `pin: true`
- Stagger text reveals: 0.1s delay
- Parallax images: translateY based on scroll progress
- Magnetic buttons: elastic snap-back on mouse leave
- Global snap to pinned section centers (0.18s-0.55s duration)

## Accessibility

- Respects `prefers-reduced-motion` - disables animations and smooth scroll
- Proper ARIA labels on all sections
- Focus visible states with gold outline
- Semantic HTML structure

## License

© 2025 GEN-H Studio. All rights reserved.
