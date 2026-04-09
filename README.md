# Events.Masjids.io — Landing Page

A production-ready, fully responsive landing page for a masjid community event ticketing platform. Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

---

## ✨ Design System

| Token | Value | Usage |
|---|---|---|
| `primary` | `#004532` | Deep Emerald — headlines, buttons, icons |
| `primary-container` | `#065f46` | Darker emerald — hover states |
| `secondary-container` | `#f6df84` | Warm Gold — accent buttons, highlights |
| `surface` | `#f9f9f8` | Pearl White — main canvas |
| Font (Display) | Plus Jakarta Sans | Headlines, bold statements |
| Font (Body) | Manrope | Body copy, labels, UI text |

**Design Rules:**
- ❌ No `1px solid` borders — use tonal shifts and ambient shadows
- ✅ Glassmorphism for floating elements (`backdrop-filter: blur(40px)`)
- ✅ Arch-inspired card radii (`3rem` top, `0.5rem` bottom)
- ✅ Ambient shadows tinted with emerald, not pure black
- ✅ Islamic geometric motifs as 5% opacity watermarks

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── globals.css        # Design tokens, glassmorphism, arch cards
│   ├── layout.tsx         # Root layout with fonts + SEO metadata
│   └── page.tsx           # Main landing page (assembles sections)
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx # Glassmorphic sticky nav + mobile drawer
│   │   └── Footer.tsx     # Minimal editorial footer
│   ├── sections/
│   │   ├── HeroSection.tsx     # Headline + floating dashboard preview
│   │   ├── FeaturesSection.tsx # Bento grid with 3 feature cards
│   │   ├── EventsSection.tsx   # Event cards (horizontal scroll mobile)
│   │   └── CTASection.tsx      # Deep emerald CTA with stats + geometric motif
│   └── ui/
│       ├── AnimateIn.tsx   # Scroll-triggered Framer Motion reveals
│       ├── Badge.tsx       # Category / status badges
│       └── Button.tsx      # Primary, secondary, ghost, outline variants
└── lib/
    ├── data.ts             # All content constants (events, features, nav)
    └── utils.ts            # cn() Tailwind class merger
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **18.17+** (required by Next.js 15)
- npm, yarn, or pnpm

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗 Build for Production

```bash
npm run build
```

This generates an optimised production build in `.next/`.

### Preview the production build locally

```bash
npm run start
```

---

## 🌐 Deployment

### Vercel (Recommended — zero config)

1. Push your project to GitHub / GitLab / Bitbucket.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Vercel auto-detects Next.js. Click **Deploy**.

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy the `.next` folder, set publish directory to `.next`
# Set build command: npm run build
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🔧 Customisation

### Update content
Edit `src/lib/data.ts` — all events, features, stats, and nav links live here.

### Update colours
Edit `tailwind.config.ts` → `theme.extend.colors`. All tokens follow the Material Design naming convention used in the design spec.

### Add a new section
1. Create `src/components/sections/MySection.tsx`
2. Import and add it to `src/app/page.tsx`
3. Use `<AnimateIn>` or `<StaggerChildren>` for scroll animations

### Change fonts
Edit `src/app/layout.tsx` — swap the `next/font/google` imports. Update `tailwind.config.ts` `fontFamily` tokens accordingly.

---

## ♿ Accessibility

- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`)
- Skip-to-content link for keyboard users
- `aria-label` on all interactive elements
- `aria-current="page"` on active nav items
- `focus-visible` ring styles (Tailwind + custom CSS)
- `alt` text on all images
- Colour contrast meets WCAG AA for all text/background combinations
- `role="list"` / `role="listitem"` on event card lists

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` | React framework with App Router |
| `react` / `react-dom` | UI library |
| `framer-motion` | Scroll animations, hover effects |
| `lucide-react` | Icon library |
| `clsx` + `tailwind-merge` | Conditional class merging |
| `tailwindcss` | Utility-first CSS |
| `autoprefixer` | CSS vendor prefixes |

---

## 📄 License

MIT — free to use and modify for your community.
