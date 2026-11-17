# Storefront Micro-Animation, Tactile Touch & Perceived Performance Rules

> **Status:** STRICT & LOCKED. Every public storefront component and administrative surface must follow these exact micro-interactions. Zero generic bouncing, zero erratic slide-ins, zero arbitrary AI animations.
> **Target Audience:** AI Assistants, Frontend Engineers, and UI Designers modifying any UI component in the codebase.

---

## 1. Core Philosophy: The "Instant Site" Illusion

Human perception thresholds dictate the feeling of speed:
- **< 16ms (1 frame @ 60fps):** Instant response to a touch or click.
- **< 100ms:** Perceived as instantaneous with zero cognitive delay.
- **> 300ms:** User perceives system latency; without immediate tactile feedback, users on 3G/4G mobile double-tap, rage-click, or abandon.

### The Golden Invariant
**Never make the user wait for an animation to finish before reading or interacting.**
- Animations must either happen **in-flight during interaction** (active tactile press) or be micro-scale (`150ms – 300ms`, `opacity` and `transform` only).
- **Layout containers remain stone-still and rock-solid.** Never animate, translate, or bounce entire sections, full cards, or parent wrappers. Only individual internal visual assets (e.g. an image or a line of text) execute micro-motion.

---

## 2. Universal Click & Touch Behavior (Android & iOS Parity)

Every interactive element—including CTA buttons, navigation pills, links, product cards, filter chips, accordion headers, and tab selectors—MUST enforce:

```html
<!-- Authoritative Tailwind Token Pattern -->
className="... active:scale-[0.98] transition-transform duration-75 ease-out select-none cursor-pointer [-webkit-tap-highlight-color:transparent] touch-manipulation"
```

1. **Instant Active Micro-Scale:**
   - `active:scale-[0.98] transition-transform duration-75 ease-out`
   - On finger press or mouse click down, the element micro-compresses by 2% within 75ms.
   - On release, snaps back smoothly (`duration-150`).
2. **Android Tap Highlight Elimination:**
   - `[-webkit-tap-highlight-color:transparent]` (or `-webkit-tap-highlight-color: transparent;` in CSS).
   - Eliminates the sluggish default grey/blue translucent rectangle Android Chrome overlays on tapped elements.
3. **Immediate Surface Feedback:**
   - Provide instant tactile lighting: `active:bg-black/5` or `active:bg-slate-100` (on light surfaces); `active:bg-white/10` (on dark surfaces).
4. **Double-Tap Zoom Delay Elimination:**
   - `touch-manipulation` (`touch-action: manipulation`) prevents the mobile browser from introducing a 300ms tap delay to wait for a hypothetical double-tap.
5. **Selection Hygiene:**
   - `select-none` on buttons, pills, chips, and icons prevents clumsy text selection highlights during rapid tapping.

---

## 3. Form Inputs & Interactive Controls (Zero Jitter, Instant Focus)

Form inputs (`<input>`, `<select>`, `<textarea>`):
1. **Zero Layout Shift:**
   - Always declare fixed heights (`h-10` or `h-11`) and explicit borders (`border border-slate-200` or `border border-zinc-300`).
   - NEVER animate layout geometry (`height`, `width`, `padding`, `margin`).
2. **Subtle Border Color Dissolve:**
   - `transition-colors duration-150 ease-out`.
3. **High-Contrast Focus Ring:**
   - `focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900` (or `focus:ring-[var(--accent)]`).
   - Mobile keyboards appear instantly without jumping borders or sliding placeholders.

---

## 4. Homepage Hero Banner & Media Showcases

```
┌─────────────────────────────────────────────────────────────┐
│ Outer Frame: 100% Locked, Fixed Height, overflow-hidden     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Image: scale-105 ──(1000ms cubic-bezier)──► scale-100│   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Eyebrow:      opacity-0 translate-y-2 ─(0ms)──► Visible   │
│   Heading (h1): opacity-0 translate-y-2 ─(100ms)─► Visible   │
│   Description:  opacity-0 translate-y-2 ─(200ms)─► Visible   │
│   CTA Button:   opacity-0 translate-y-2 ─(300ms)─► Visible   │
└─────────────────────────────────────────────────────────────┘
```

1. **Outer Frame Invariant:**
   - Container MUST remain completely locked in place with fixed aspect ratio / min-height (`min-h-[480px] sm:min-h-[560px] overflow-hidden`).
   - Never animate, slide, or scale the hero section container.
2. **Image Scale-Down (The Luxury Breather):**
   - On slide mount or initial page render, **ONLY the image element** scales from `scale-105` (1.05) down to `scale-100` (1.0).
   - Duration: Exactly `1000ms` (1.0s).
   - Timing curve: `ease-[cubic-bezier(0.16,1,0.3,1)]` (luxury ease-out with rapid initial deceleration).
   - Executes once per slide mount; never loops aggressively or oscillates.
3. **Typography & CTA Staggered Micro-Reveal:**
   - Text elements never slide across the screen horizontally or jump vertically by large margins.
   - Text executes a micro-fade with a tiny vertical displacement capped strictly at **8px** (`translate-y-2` to `translate-y-0`):
     - Eyebrow / Tagline: `opacity-0 translate-y-2` -> `opacity-100 translate-y-0` (delay: `0ms`)
     - Main Headline (`h1`): delay `100ms`, duration `400ms`
     - Description text: delay `200ms`, duration `400ms`
     - CTA Button: delay `300ms`, duration `400ms`
   - Whole section NEVER animates in one block.

---

## 5. Clever Image Loading & Reveal Rules (CLS = 0 & Late-Loading Network Resiliency)

In Bangladesh, real-world cellular networks (3G/4G) have packet jitter. Images can arrive with unpredictable latency. To make the site feel blindingly fast, enforce this image architecture:

1. **Zero Cumulative Layout Shift (CLS = 0):**
   - All catalog image containers strictly enforce `aspect-[3/4]`, and PDP hero containers enforce locked ratios with `overflow-hidden relative`.
   - Layout geometry is 100% reserved before byte 1 is received.
2. **Solid Neutral Curtain Base:**
   - Card image wrapper has a neutral solid background (`bg-zinc-100` or `#f8fafc` on light; `bg-zinc-900` on dark).
   - Never show stark empty white voids, transparent holes, or broken image icons.
3. **Editorial Curtain Drop Reveal (Viewport Scroll & Load Gate):**
   - Each card uses a lightweight `IntersectionObserver` (`rootMargin: '120px 0px'`).
   - While image is fetching or outside the viewport: a clean neutral curtain layer (`bg-[#e4e4e7]` / `bg-zinc-800` on dark) sits at `translate-y-0 z-[5]`.
   - As the card enters near the viewport and the image finishes decoding (`isInView && isImageLoaded`): the curtain slides smoothly downward (`translate-y-full`) over `600ms` via `cubic-bezier(0.16, 1, 0.3, 1)`, unveiling the high-resolution garment like an editorial fashion exhibition.
   - Concurrently, top badges fade in smoothly (`transition-opacity duration-500`).
   - **Bandwidth & CPU Preservation:** Products down the page never initiate lazy downloads until the user scrolls near them, preventing all pictures from loading simultaneously and eliminating browser memory choking.
4. **Shimmer Blur Placeholder:**
   - Use Next.js `<Image placeholder="blur" blurDataURL="..." />` or inline SVG shimmer data URLs for instant visual feedback while network bytes stream in.
5. **Next.js LCP Priority & Device Sizes Gate:**
   - Hero banner and the first 4 catalog cards MUST have `priority` set.
   - Catalog images MUST set accurate `sizes` (e.g. `sizes="(max-width: 640px) 50vw, 25vw"`), matching `deviceSizes` (`384`, `480`), ensuring mobile screens fetch ~384w WebP files instead of 1200w+ desktop assets.

---

## 6. Catalog Card Hover & Interactive Micro-States

1. **Card Frame Remains Grounded:**
   - No card translation (`translate-y-[-8px]` or floating shadow jumps are BANNED).
2. **Internal Image Hover Zoom:**
   - On desktop mouse hover: image zooms subtly from `scale-100` to `scale-105` over `700ms ease-out` within its `overflow-hidden` container.
3. **Quick "Add to Cart" Tactile Confirmation:**
   - Button press: `active:scale-[0.98] duration-75`.
   - Icon swap: Cart icon swaps to `Check` with `animate-in zoom-in duration-150` for 1200ms.
   - Navbar Bag Badge: Triggers a 300ms tactile bump animation (`scale-125 -rotate-12` -> `scale-100 rotate-0`), giving clear cross-viewport confirmation.

---

## 7. Drawers, Modals & Slide-Overs (Cart Drawer, Filter Drawer, Mobile Nav)

1. **Backdrop Blur Fade:**
   - Backdrop fades from `opacity-0` to `opacity-100` over `200ms ease-out` with subtle `backdrop-blur-xs` or `backdrop-blur-sm`.
2. **Drawer Slide-In:**
   - Translates along its axis (`translate-x-full` -> `translate-x-0`) over `250ms` using `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Never use springy physics with heavy rubber-band oscillation.
3. **Scrollbar Gutter Lock:**
   - Enforce `html { scrollbar-gutter: stable; }` in `globals.css` so opening/closing drawers never shifts page layout or causes horizontal jump.

---

## 8. BANNED AI Anti-Patterns (Strict Prohibition Checklist)

- ❌ **NO Full-Section Entrance Animations:** Never wrap `<section>` or `<main>` in full-page entrance fade/slides. It creates the illusion of page lag.
- ❌ **NO Sweeping Fly-Ins:** No `translateX(-100px)` or `translateY(150px)` fly-ins.
- ❌ **NO Long Animation Durations:** Interactive transitions must NEVER exceed `300ms`. Ambient hero breathers must NEVER exceed `1000ms`.
- ❌ **NO Heavy JS Animation Libraries for Micro-Interactions:** Never pull heavy animation libraries (e.g., Lottie, heavy Framer-Motion wrapper trees) where lightweight Tailwind CSS transitions and CSS keyframes handle it at 60fps.
- ❌ **NO Distracting Hover Fluff:** No spinning icons, no pulsing gradient borders, no confetti, no bouncing badges.
