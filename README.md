# JustGanIt | Personal Brand & AI Portfolio (`selfiphomepage`)

Personal homepage and creative space for **Gan (JustGanIt.com)**, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, and **Tailwind CSS v4**.

## Key Features

- **Real-Time WebGL Argon Fluid & SDF Glyph Engine (`src/lib/argon/`)**:
  - Dynamically generates 512x512 Signed Distance Field (SDF) textures and multi-level blurred glyph atlases (`干` in Chinese / `DO` in English) using 2D Euclidean Distance Transform (EDT).
  - Multi-pass shader pipeline rendering cosmic aurora fluid, dual 3D wave spark meshes, liquid refractive core typography, and contour evaporation sparks with pointer repulsion and tap ripples.
  - Persistent WebGL context across theme and language switches with `webglcontextlost` recovery and `prefers-reduced-motion` accessibility fallback.
- **Liquid Glass & Micro-Interactions**:
  - 3D parallax tilt glass cards (`GlassCard.tsx`), directional IntersectionObserver wave reveals (`SectionReveal.tsx`), and on-demand rAF spotlight tracking (`MouseTracker.tsx`).
- **Full Bilingual (ZH / EN) & System Theme Support**:
  - Strongly-typed `TranslationSchema` (`src/i18n/translations.ts`) with zero `any` casts and `next-themes` dark/light mode integration.
- **Static Export Ready**:
  - Configured with `output: "export"` in `next.config.ts` for zero-server static deployment.

## Project Structure

```text
src/
├── app/
│   ├── globals.css          # Tailwind v4 theme & liquid-glass utilities
│   ├── layout.tsx           # Root layout, OpenGraph/Twitter metadata & providers
│   └── page.tsx             # Main landing page composition
├── components/
│   ├── ArgonBackground.tsx  # Persistent WebGL canvas controller
│   ├── Header.tsx           # Floating liquid-glass navbar with theme/lang toggles
│   ├── Hero.tsx             # Hero section with quick-scroll actions
│   ├── ToolGrid.tsx         # AI Toolkit showcase grid
│   ├── MusicSection.tsx     # Original single vinyl player card
│   ├── BlogSection.tsx      # Latest WeChat Official Account articles
│   ├── SocialSection.tsx    # Multi-channel social matrix & QR lightbox modal
│   ├── GlassCard.tsx        # Reusable 3D tilt glass container
│   ├── MouseTracker.tsx     # On-demand rAF ambient cursor spotlight
│   ├── SectionReveal.tsx    # Directional IntersectionObserver reveal wrapper
│   └── Footer.tsx           # Site footer
├── context/
│   └── LanguageContext.tsx  # Bilingual state provider with html[lang] sync
├── i18n/
│   └── translations.ts      # Strongly-typed EN/ZH dictionary
└── lib/argon/
    ├── renderer.ts          # WebGL/WebGL2 multi-pass & particle mesh renderer
    ├── sdf.ts               # 2D EDT SDF & glyph mipmap atlas generator
    ├── shaders.ts           # GLSL vertex & fragment shaders
    └── types.ts             # Argon engine TypeScript interfaces
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server at http://localhost:3000
npm run dev

# Build static export to ./out
npm run build
```
