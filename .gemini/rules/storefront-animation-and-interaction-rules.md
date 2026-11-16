# Storefront Micro-Animation & Tactile Interaction Rules

> **Status:** STRICT & LOCKED. Every public storefront component must follow these exact micro-interactions. Zero generic bouncing, zero erratic slide-ins, zero arbitrary AI animations.

---

## 1. Hero Slider Scale-Down & Text Fade-In
* **Outer Container:** Must remain locked in place with fixed aspect ratio (`overflow-hidden`).
* **Image Element:** On slide activation or initial mount, the image executes a micro-scale from `scale-105` (1.05) down to `scale-100` (1.0) over `900ms` using `ease-[cubic-bezier(0.16,1,0.3,1)]`.
* **Typography:** Eyebrow, Headline, and CTA button execute a staggered fade-in (`opacity-0 translate-y-2` -> `opacity-100 translate-y-0`) with subtle `100ms` delay between elements. Never slide whole sections across the screen.

## 2. Catalog Image Curtain Reveal (CLS = 0)
* **Aspect Ratio:** Catalog images must strictly maintain 3:4 portrait ratio with explicit `sizes` attribute.
* **Curtain Reveal:** While loading, the card displays a solid neutral placeholder background (`#f8fafc`).
* **On Load:** The image reveals via a subtle bottom-to-top unmasking / smooth opacity dissolve (`opacity-0` -> `opacity-100` over `300ms ease-out`). No pixelated pop-in or layout jumping.

## 3. Tactile Touch & Click Feedback (Mobile & Desktop)
* **Active Press Feedback:** All interactive elements (Navbar links, Sub-collection pills, CTA buttons, Filter chips, Product cards) must include immediate active tactile press feedback:
  * `active:scale-[0.98] transition-transform duration-75 ease-out`
  * `-webkit-tap-highlight-color: transparent`
  * Subtle tap background feedback (`active:bg-black/5` or `active:bg-slate-100`).
* **Mobile Ambiguity Prevention:** Customers on mobile 3G/4G must receive instant visual confirmation the millisecond a finger touches the screen.

## 4. Header Layout Symmetry
* **Desktop (`≥ 1024px`):** `[ Logo ] ─── [ Navlinks (Mega-Menu) ] ─── [ SearchIcon | TrackOrder | ProfileIcon | CartIcon ]`
* **Mobile (`< 1024px`):** `[ MenuIcon ] ────── [ Logo ] ────── [ SearchIcon | ProfileIcon | CartIcon ]`
