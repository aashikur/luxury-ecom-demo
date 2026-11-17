# 14. Storefront Micro-Animation, Tactile Touch & Perceived Performance Architecture

> **Authoritative Specification & Study Guide:** Standardizing perceived performance engineering, tactile mobile touch feedback, clever image loading unmasking, and hero banner micro-interactions across the platform.

---

## 1. What We Built

- **Authoritative Rule Set (`.gemini/rules/storefront-animation-and-interaction-rules.md` & `AGENTS.md`)**:
  A locked system rule governing all UI interactions across desktop and mobile storefront surfaces, prohibiting AI generic animations and enforcing strict micro-interactions.
- **Universal Mobile & Desktop Tactile Touch Architecture**:
  - `active:scale-[0.98] duration-75 ease-out` on all clickable buttons, pills, filter chips, and links.
  - `[-webkit-tap-highlight-color:transparent]` eradicating Android's sluggish default grey tap rectangle.
  - `touch-manipulation` (`touch-action: manipulation`) eliminating mobile browser 300ms double-tap delay.
  - `select-none` on interactive controls preventing accidental text selection highlights during rapid taps.
- **Hero Banner Image Breather & Staggered Micro-Reveal (`HeroBanner.tsx`)**:
  - Fixed-space outer container with `overflow-hidden`.
  - Image-only scale-down: from `scale-105` down to `scale-100` over `1000ms` (1.0s) via luxury curve `ease-[cubic-bezier(0.16,1,0.3,1)]`.
  - Micro-staggered typography entrance: eyebrow (`0ms`), headline (`100ms`), description (`200ms`), CTA (`300ms`), displacing vertically by at most `8px` (`translate-y-2` to `translate-y-0`).
  - Zero whole-section entrance animation.
- **Clever Image Loading Unmasking & CLS = 0 Architecture (`ProductCard.tsx`, `ProductDetailView.tsx`)**:
  - Strict aspect ratio reservation (`aspect-[3/4]` portrait for catalog cards) guaranteeing zero Cumulative Layout Shift (CLS = 0).
  - Solid neutral curtain placeholder (`bg-zinc-100` / `#f8fafc`).
  - Micro-dissolve unmasking: image transitions from `opacity-0 scale-[1.02]` to `opacity-100 scale-100` over `300ms ease-out` upon load, creating an optical focus illusion that completely masks cellular network latency.
  - Next.js LCP Priority and mobile device sizing (`sizes="(max-width: 640px) 50vw, 25vw"`) preventing over-serving high-res assets to mobile viewports.

---

## 2. Why We Built It (Senior Engineering / Interview Concept)

### A. The "Perceived Performance" Illusion (The 100ms Rule)
Real-world network bandwidth in emerging markets like Bangladesh fluctuates. A server response or image asset may take 200ms–800ms to arrive. If the UI does not respond to a touch tap within **16ms – 100ms**, human psychology registers the system as "sluggish", "laggy", or "broken", prompting users to tap repeatedly (rage clicks) or bounce.
By engineering instant micro-scale feedback (`active:scale-[0.98]` within 75ms) and eliminating Android's 300ms double-tap delay, the user feels physical mechanical resistance immediately upon screen contact—giving the perception of 0ms local application latency.

### B. The Anti-Pattern of AI Generic Animations
Junior developers and default AI assistants frequently clutter web apps with generic, sweeping animations:
- Whole-page slide-ins from `x: -100px` or `y: 200px`
- Bouncing product cards
- Spinning full-page loading walls
- Large layout jumps (`translate-y-16`)

These generic patterns degrade user experience:
1. **Perceived Lag**: Users cannot start reading or clicking until the animation finishes.
2. **GPU & Battery Drain**: Translating massive DOM trees and full sections causes paint invalidation and mobile frame drops.
3. **Motion Sickness & Cheap Aesthetics**: Luxury brands (e.g. Apple, SSENSE, Zara, Acne Studios) never sweep entire sections across the screen; their layout frames remain firmly anchored while subtle internal light or scale changes bring items to life.

### C. Optical Focus Image Reveal vs. Raw Pop-in
When an image pops into the DOM abruptly, it creates visual flash. If it fades in flatly from `opacity-0` to `opacity-100`, the user notices the wait. By combining an opacity dissolve with a subtle inward micro-scale from `scale-[1.02]` down to `scale-100` over 300ms, the eye perceives the image as a camera lens snapping into sharp optical focus. This deliberate optical trick transforms network latency into a premium brand experience.

---

## 3. Key Concepts Checklist (Quick Revision)

| Interaction Type | Permitted Pattern | Strictly Prohibited Pattern |
| :--- | :--- | :--- |
| **Touch / Click Down** | `active:scale-[0.97]` / `active:scale-95` + `active:brightness-90` or `active:bg-zinc-200` + `duration-75` + `touch-manipulation` + global WebKit `touchstart` listener | Default Android grey tap box, silenced tap feedback (`transparent`), sub-pixel invisible compression |
| **Hero Banner** | Image ONLY: `scale-105` $\rightarrow$ `scale-100` over `1000ms`. Text: `translate-y-2` $\rightarrow$ `0` stagger | Animating whole hero section, infinite looping zooms |
| **Image Loading** | Locked `3:4` container + `#f8fafc` curtain + 300ms micro-dissolve (`scale-[1.02]` $\rightarrow$ `scale-100`) | Layout jumping (CLS > 0), blank white gaps, raw pop-in |
| **Catalog Cards** | Stationary card frame; internal image hover `scale-100` $\rightarrow$ `scale-105` over `700ms`; `active:scale-[0.99] active:opacity-95` | Floating card jumps (`translate-y-[-8px]`), heavy shadows |
| **Add to Cart** | Tactile button press (`active:scale-[0.97] active:brightness-90`) + 150ms icon swap to checkmark + Navbar cart badge bump bounce | Modal alerts, page redirects, full-screen loaders |
| **Drawers / Modals** | 200ms backdrop blur + 250ms slide (`cubic-bezier(0.16, 1, 0.3, 1)`) + `scrollbar-gutter: stable` | Bouncy rubber-band oscillations, layout scroll shift |

---

## 4. Official Docs & Sources

- **Tailwind CSS v4 Transition & Transform Utilities**: [Tailwind Transitions Documentation](https://tailwindcss.com/docs/transition-property)
- **MDN Touch Action Specification**: [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- **Web.dev Perceived Performance & RAIL Model**: [Measure Performance with RAIL](https://web.dev/articles/rail)
- **Next.js Core Web Vitals & Image Optimization**: [Next.js Image Optimization Guide](https://nextjs.org/docs/app/building-your-application/optimizing/images)
