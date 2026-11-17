import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const labReportDir = path.resolve(__dirname, '../Lab-report-demo-refference');
const outputPath = path.resolve(labReportDir, 'Online-Product-Catalog-System-Presentation.pptx');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
pres.author = 'Software Engineering Lab Project Team';
pres.company = 'Department of Computer Science & Engineering';
pres.title = 'Online Product Catalog System (OPCS) - Architectural Defense';

// Design System Constants
const BG_DARK = '0B131B';      // Deep obsidian
const BG_CARD = '15202B';      // Elevated card surface
const TEXT_WHITE = 'F8FAFC';   // Primary headline text
const TEXT_MUTED = '94A3B8';   // Secondary subtitle text
const TEXT_BODY = 'CBD5E1';    // Body paragraph text
const ACCENT_GREEN = '10B981'; // Primary brand highlight (Emerald)
const ACCENT_BLUE = '38BDF8';  // Secondary tech highlight (Sky)
const ACCENT_AMBER = 'F59E0B'; // Metric/warning highlight (Amber)
const BORDER_COLOR = '253342'; // Subtle container stroke

const FONT_TITLE = 'Arial';
const FONT_BODY = 'Calibri';

// Helper: Common slide header
function addSlideHeader(slide, categoryText, titleText, subtitleText) {
  // Category Pill
  slide.addText(categoryText.toUpperCase(), {
    x: 0.6,
    y: 0.4,
    w: 6.0,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 10,
    bold: true,
    color: ACCENT_GREEN,
    charSpacing: 2
  });

  // Main Slide Title
  slide.addText(titleText, {
    x: 0.6,
    y: 0.65,
    w: 8.8,
    h: 0.55,
    fontFace: FONT_TITLE,
    fontSize: 22,
    bold: true,
    color: TEXT_WHITE
  });

  // Subtitle / Narrative Hook
  if (subtitleText) {
    slide.addText(subtitleText, {
      x: 0.6,
      y: 1.15,
      w: 8.8,
      h: 0.35,
      fontFace: FONT_BODY,
      fontSize: 12,
      color: TEXT_MUTED,
      italic: true
    });
  }
}

// -------------------------------------------------------------
// SLIDE 1: The Provocative Title & Hook
// -------------------------------------------------------------
{
  const s1 = pres.addSlide();
  s1.background = { color: BG_DARK };

  // Decorative Accent bar
  s1.addShape(pres.ShapeType.rect, {
    x: 0.6,
    y: 1.4,
    w: 0.08,
    h: 2.5,
    fill: { color: ACCENT_GREEN }
  });

  s1.addText('SOFTWARE ENGINEERING LAB REPORT & SYSTEM DEFENSE', {
    x: 0.85,
    y: 1.35,
    w: 8.5,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 11,
    bold: true,
    color: ACCENT_GREEN,
    charSpacing: 3
  });

  s1.addText('Online Product Catalog System', {
    x: 0.85,
    y: 1.7,
    w: 8.5,
    h: 0.8,
    fontFace: FONT_TITLE,
    fontSize: 32,
    bold: true,
    color: TEXT_WHITE
  });

  s1.addText('Architecting a Zero-Jitter, High-Speed Catalog Engine for High-Variance Retail', {
    x: 0.85,
    y: 2.5,
    w: 8.5,
    h: 0.45,
    fontFace: FONT_BODY,
    fontSize: 14,
    color: TEXT_MUTED
  });

  // 3 Pillar badges at the bottom
  const pillars = [
    { label: 'ARCHITECTURE', val: 'Decoupled SSR (Next.js 16)' },
    { label: 'DATA MODEL', val: 'Dynamic Spec Matrix (MongoDB)' },
    { label: 'PERFORMANCE', val: 'Sub-100ms Query | CLS = 0' }
  ];

  pillars.forEach((p, idx) => {
    const xPos = 0.85 + idx * 2.85;
    s1.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: 3.4,
      w: 2.65,
      h: 0.9,
      fill: { color: BG_CARD },
      line: { color: BORDER_COLOR, width: 1 },
      rectRadius: 0.08
    });
    s1.addText(p.label, {
      x: xPos + 0.15,
      y: 3.5,
      w: 2.35,
      h: 0.25,
      fontFace: FONT_TITLE,
      fontSize: 9,
      bold: true,
      color: ACCENT_BLUE,
      charSpacing: 1.5
    });
    s1.addText(p.val, {
      x: xPos + 0.15,
      y: 3.8,
      w: 2.35,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE
    });
  });

  // Footer Metadata
  s1.addText('Presented by: Student Project Team  |  Evaluated under IEEE Std 830-1998 Specification', {
    x: 0.85,
    y: 4.8,
    w: 8.5,
    h: 0.3,
    fontFace: FONT_BODY,
    fontSize: 10,
    color: '64748B'
  });
}

// -------------------------------------------------------------
// SLIDE 2: The Core Challenge (The High-Variance Chaos)
// -------------------------------------------------------------
{
  const s2 = pres.addSlide();
  s2.background = { color: BG_DARK };
  addSlideHeader(s2, 'The Problem Space', 'The High-Variance Catalog Dilemma', 'Why traditional e-commerce catalogs fail when dealing with diverse product lines');

  // Question Callout Card
  s2.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.6,
    w: 8.8,
    h: 0.75,
    fill: { color: '1E293B' },
    line: { color: ACCENT_AMBER, width: 1.5 },
    rectRadius: 0.08
  });
  s2.addText('THE CORE QUESTION: How can one database schema seamlessly display a $60,000 Electric Car, a High-End Smartphone, and a Cashmere Scarf — without altering database tables or crashing?', {
    x: 0.8,
    y: 1.7,
    w: 8.4,
    h: 0.55,
    fontFace: FONT_BODY,
    fontSize: 12,
    bold: true,
    color: 'FEF08A'
  });

  // 3 Problem Pillars
  const problems = [
    {
      num: '01',
      title: 'Schema Rigidity (SQL Trap)',
      desc: 'Relational tables require 15+ normalized joins or sparse columns with hundreds of null values for different category specs.'
    },
    {
      num: '02',
      title: 'Mobile UI Jitter (CLS Penalty)',
      desc: 'High-res product images load asynchronously with undefined aspect ratios, causing layout shifts that irritate mobile users.'
    },
    {
      num: '03',
      title: 'Spreadsheet Data Drift',
      desc: 'Static catalogs and Excel files create decoupled pricing errors, missing media assets, and zero searchability.'
    }
  ];

  problems.forEach((item, idx) => {
    const xPos = 0.6 + idx * 3.0;
    s2.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: 2.55,
      w: 2.8,
      h: 2.4,
      fill: { color: BG_CARD },
      line: { color: BORDER_COLOR, width: 1 },
      rectRadius: 0.08
    });
    s2.addText(item.num, {
      x: xPos + 0.2,
      y: 2.7,
      w: 1.0,
      h: 0.35,
      fontFace: FONT_TITLE,
      fontSize: 18,
      bold: true,
      color: ACCENT_GREEN
    });
    s2.addText(item.title, {
      x: xPos + 0.2,
      y: 3.1,
      w: 2.4,
      h: 0.45,
      fontFace: FONT_TITLE,
      fontSize: 13,
      bold: true,
      color: TEXT_WHITE
    });
    s2.addText(item.desc, {
      x: xPos + 0.2,
      y: 3.6,
      w: 2.4,
      h: 1.2,
      fontFace: FONT_BODY,
      fontSize: 11,
      color: TEXT_BODY
    });
  });
}

// -------------------------------------------------------------
// SLIDE 3: Architectural Boundary - Why Pure Catalog Intelligence?
// -------------------------------------------------------------
{
  const s3 = pres.addSlide();
  s3.background = { color: BG_DARK };
  addSlideHeader(s3, 'Scope & Strategy', 'The Strategic Architectural Boundary', 'Why deliberate negative scope creates faster, more resilient systems');

  // Left Card: What We Built
  s3.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.6,
    w: 4.25,
    h: 3.4,
    fill: { color: BG_CARD },
    line: { color: ACCENT_GREEN, width: 1.5 },
    rectRadius: 0.08
  });
  s3.addText('CORE CATALOG ENGINE (WHAT WE BUILT)', {
    x: 0.85,
    y: 1.8,
    w: 3.75,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 12,
    bold: true,
    color: ACCENT_GREEN
  });

  const included = [
    'Hierarchical Category Tree & Brand Indexing',
    'Dynamic Modular Specifications Matrix',
    'Multi-Asset 4K WebP Gallery + Video Demos',
    'Faceted Real-Time Search & Sorting (<100ms)',
    'Edge-Authenticated Admin Studio (RBAC)'
  ];
  included.forEach((pt, idx) => {
    s3.addText(`✔  ${pt}`, {
      x: 0.85,
      y: 2.2 + idx * 0.48,
      w: 3.75,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 11,
      color: TEXT_WHITE
    });
  });

  // Right Card: Deliberate Negative Scope
  s3.addShape(pres.ShapeType.roundRect, {
    x: 5.15,
    y: 1.6,
    w: 4.25,
    h: 3.4,
    fill: { color: BG_CARD },
    line: { color: '475569', width: 1 },
    rectRadius: 0.08
  });
  s3.addText('DELIBERATE BOUNDARIES (THE "WHY NO CART?")', {
    x: 5.4,
    y: 1.8,
    w: 3.75,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 12,
    bold: true,
    color: ACCENT_AMBER
  });

  const excluded = [
    'Excluded: Payment Gateway Settlements',
    'Excluded: Bank Reconciliation & Cart Bloat',
    'Why: Preserves 0ms in-memory query throughput',
    'Industry Paradigm: Matches Tesla, Rolex & Apple showcases',
    'Integration: Exposes clean RESTful JSON APIs for external ERPs'
  ];
  excluded.forEach((pt, idx) => {
    s3.addText(`✖  ${pt}`, {
      x: 5.4,
      y: 2.2 + idx * 0.48,
      w: 3.75,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 11,
      color: TEXT_MUTED
    });
  });
}

// -------------------------------------------------------------
// SLIDE 4: Cloud & Edge Architecture (Figure 2.0)
// -------------------------------------------------------------
{
  const s4 = pres.addSlide();
  s4.background = { color: BG_DARK };
  addSlideHeader(s4, 'Architecture (Section 2.1)', 'Cloud & Edge Infrastructure (Figure 2.0)', 'Decoupled Server-Side Rendering (SSR) paired with CDN media offloading');

  // Left: Diagram Image
  const imgPath = path.resolve(labReportDir, 'Section 2.1 (Product Perspective).png');
  if (fs.existsSync(imgPath)) {
    s4.addImage({
      path: imgPath,
      x: 0.6,
      y: 1.6,
      w: 5.3,
      h: 3.4
    });
  }

  // Right: Engineering Highlights
  s4.addShape(pres.ShapeType.roundRect, {
    x: 6.1,
    y: 1.6,
    w: 3.3,
    h: 3.4,
    fill: { color: BG_CARD },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08
  });

  s4.addText('KEY ARCHITECTURAL DECISIONS', {
    x: 6.3,
    y: 1.8,
    w: 2.9,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 11,
    bold: true,
    color: ACCENT_BLUE
  });

  const archBullets = [
    { title: 'Next.js 16 SSR', detail: 'HTML generated at edge in <200ms TTFB. Zero-waterfall data fetching.' },
    { title: 'MongoDB Atlas', detail: 'High-availability cluster with compound indexes for instant search.' },
    { title: 'Cloudflare R2 CDN', detail: '100% media offloaded from application server to global edge.' }
  ];

  archBullets.forEach((b, idx) => {
    s4.addText(b.title, {
      x: 6.3,
      y: 2.2 + idx * 0.9,
      w: 2.9,
      h: 0.25,
      fontFace: FONT_TITLE,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE
    });
    s4.addText(b.detail, {
      x: 6.3,
      y: 2.45 + idx * 0.9,
      w: 2.9,
      h: 0.55,
      fontFace: FONT_BODY,
      fontSize: 10,
      color: TEXT_BODY
    });
  });
}

// -------------------------------------------------------------
// SLIDE 5: Actors & Use Cases (Figure 2.1)
// -------------------------------------------------------------
{
  const s5 = pres.addSlide();
  s5.background = { color: BG_DARK };
  addSlideHeader(s5, 'User Classes & Security (Section 2.3)', 'Actors, Use Cases & RBAC Boundaries (Figure 2.1)', 'Role-Based Access Control enforcing strict separation of duties');

  // Left: Diagram Image
  const imgPath = path.resolve(labReportDir, 'Figure 2.1 - Use Case Diagram for Online Product Catalog System.png');
  if (fs.existsSync(imgPath)) {
    s5.addImage({
      path: imgPath,
      x: 0.6,
      y: 1.6,
      w: 3.8,
      h: 3.4,
      sizing: { type: 'contain', w: 3.8, h: 3.4 }
    });
  }

  // Right: 3 Actors Breakdown Cards
  const actors = [
    {
      role: 'System Administrator',
      access: 'Full Read / Write (All Modules)',
      duty: 'Platform configuration, staff account provisioning, database maintenance, master taxonomy.'
    },
    {
      role: 'Catalog Manager (Staff)',
      access: 'Read / Write (Products, Media, Brands)',
      duty: 'Curating product profiles, uploading WebP galleries, defining dynamic spec sheets.'
    },
    {
      role: 'Visitor / Public Consumer',
      access: 'Read-Only (Public Portal)',
      duty: 'Zero-friction browsing, keyword search, faceted category/brand filtering, spec comparison.'
    }
  ];

  actors.forEach((a, idx) => {
    const yPos = 1.6 + idx * 1.15;
    s5.addShape(pres.ShapeType.roundRect, {
      x: 4.6,
      y: yPos,
      w: 4.8,
      h: 1.05,
      fill: { color: BG_CARD },
      line: { color: BORDER_COLOR, width: 1 },
      rectRadius: 0.08
    });
    s5.addText(a.role, {
      x: 4.8,
      y: yPos + 0.1,
      w: 3.0,
      h: 0.25,
      fontFace: FONT_TITLE,
      fontSize: 12,
      bold: true,
      color: TEXT_WHITE
    });
    s5.addText(a.access, {
      x: 6.8,
      y: yPos + 0.1,
      w: 2.4,
      h: 0.25,
      fontFace: FONT_TITLE,
      fontSize: 9,
      bold: true,
      color: ACCENT_GREEN,
      align: 'right'
    });
    s5.addText(a.duty, {
      x: 4.8,
      y: yPos + 0.35,
      w: 4.4,
      h: 0.6,
      fontFace: FONT_BODY,
      fontSize: 10,
      color: TEXT_BODY
    });
  });
}

// -------------------------------------------------------------
// SLIDE 6: The Database Genius & ERD (Figure 6.1)
// -------------------------------------------------------------
{
  const s6 = pres.addSlide();
  s6.background = { color: BG_DARK };
  addSlideHeader(s6, 'Data Modeling (Section 6.1)', 'The Dynamic Specification Matrix & ERD (Figure 6.1)', 'Eliminating relational JOIN overhead via embedded document schemas');

  // Left: Diagram Image
  const imgPath = path.resolve(labReportDir, 'Section 6.1 (Data Model).png');
  if (fs.existsSync(imgPath)) {
    s6.addImage({
      path: imgPath,
      x: 0.6,
      y: 1.6,
      w: 4.0,
      h: 3.4,
      sizing: { type: 'contain', w: 4.0, h: 3.4 }
    });
  }

  // Right: Engineering Explanation Card
  s6.addShape(pres.ShapeType.roundRect, {
    x: 4.8,
    y: 1.6,
    w: 4.6,
    h: 3.4,
    fill: { color: BG_CARD },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08
  });

  s6.addText('THE EMBEDDED MATRIX PATTERN', {
    x: 5.0,
    y: 1.8,
    w: 4.2,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 12,
    bold: true,
    color: ACCENT_AMBER
  });

  const erdBullets = [
    {
      title: 'Zero-Join Query Performance',
      desc: 'Variants, media galleries, and specifications are embedded directly in Product documents. One single indexed query loads 100% of the PDP in <50ms.'
    },
    {
      title: 'Dynamic Key-Value Spec Groups',
      desc: 'Automobiles store [Engine, Fuel], Laptops store [RAM, CPU], Clothing stores [Material, Fit] — without schema migrations.'
    },
    {
      title: 'Referential Integrity Where It Matters',
      desc: 'Categories & Brands remain normalized to prevent duplicate taxonomies and enable clean faceted aggregations.'
    }
  ];

  erdBullets.forEach((b, idx) => {
    s6.addText(b.title, {
      x: 5.0,
      y: 2.2 + idx * 0.85,
      w: 4.2,
      h: 0.25,
      fontFace: FONT_TITLE,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE
    });
    s6.addText(b.desc, {
      x: 5.0,
      y: 2.45 + idx * 0.85,
      w: 4.2,
      h: 0.55,
      fontFace: FONT_BODY,
      fontSize: 10,
      color: TEXT_BODY
    });
  });
}

// -------------------------------------------------------------
// SLIDE 7: Data Flow Pipelines (Figure 6.2 DFD)
// -------------------------------------------------------------
{
  const s7 = pres.addSlide();
  s7.background = { color: BG_DARK };
  addSlideHeader(s7, 'Process Decomposition (Section 6.2)', 'Data Flow Architecture: DFD Level 0 & 1 (Figure 6.2)', 'Tracking data streams across 5 decoupled subsystem processes');

  // 2 DFD Images stacked or side by side
  const dfd0 = path.resolve(labReportDir, 'Section 6.2 (Data Flow Diagram - Level 0).png');
  const dfd1 = path.resolve(labReportDir, 'Section 6.2 (Data Flow Diagram - Level 1).png');

  if (fs.existsSync(dfd0)) {
    s7.addImage({
      path: dfd0,
      x: 0.6,
      y: 1.6,
      w: 4.4,
      h: 1.7,
      sizing: { type: 'contain', w: 4.4, h: 1.7 }
    });
  }

  if (fs.existsSync(dfd1)) {
    s7.addImage({
      path: dfd1,
      x: 0.6,
      y: 3.4,
      w: 4.4,
      h: 1.6,
      sizing: { type: 'contain', w: 4.4, h: 1.6 }
    });
  }

  // Right Side: 5 Process Pipelines Breakdown
  s7.addShape(pres.ShapeType.roundRect, {
    x: 5.2,
    y: 1.6,
    w: 4.2,
    h: 3.4,
    fill: { color: BG_CARD },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08
  });

  s7.addText('5 CORE DECOMPOSED PROCESSES', {
    x: 5.4,
    y: 1.8,
    w: 3.8,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 11,
    bold: true,
    color: ACCENT_BLUE
  });

  const processes = [
    'P 1.0: Taxonomy & Brand Management (Orphan protection)',
    'P 2.0: Media & Catalog Ingestion (WebP & CDN sync)',
    'P 3.0: Faceted Index Search (Sub-100ms multi-filter)',
    'P 4.0: Specification & PDP Delivery (SSR dynamic page)',
    'P 5.0: Staff Auth & Edge Session Tokens (RBAC)'
  ];

  processes.forEach((p, idx) => {
    s7.addText(p, {
      x: 5.4,
      y: 2.2 + idx * 0.52,
      w: 3.8,
      h: 0.45,
      fontFace: FONT_BODY,
      fontSize: 10,
      color: TEXT_BODY
    });
  });
}

// -------------------------------------------------------------
// SLIDE 8: Non-Functional Engineering Metrics (Zero-Jitter Standard)
// -------------------------------------------------------------
{
  const s8 = pres.addSlide();
  s8.background = { color: BG_DARK };
  addSlideHeader(s8, 'Engineering Excellence', 'The Zero-Jitter Mobile Standard (NFRs)', 'Benchmarked against Google Core Web Vitals & Enterprise Reliability SLAs');

  // 4 Metric Scorecards
  const metrics = [
    { val: '< 2.0s', label: 'Largest Contentful Paint', sub: 'Targeted for 4G mobile networks via WebP & CDN' },
    { val: '0.00', label: 'Cumulative Layout Shift', sub: 'CLS = 0 achieved via locked 3:4 portrait ratios' },
    { val: '< 100ms', label: 'Indexed Query Latency', sub: 'Compound indexes on categorySlug & price tiers' },
    { val: '99.9%', label: 'High Availability SLA', sub: 'Stateless edge tier with cloud replica sets' }
  ];

  metrics.forEach((m, idx) => {
    const xPos = 0.6 + (idx % 2) * 4.5;
    const yPos = 1.6 + Math.floor(idx / 2) * 1.75;

    s8.addShape(pres.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 4.3,
      h: 1.55,
      fill: { color: BG_CARD },
      line: { color: BORDER_COLOR, width: 1 },
      rectRadius: 0.08
    });

    s8.addText(m.val, {
      x: xPos + 0.2,
      y: yPos + 0.15,
      w: 3.9,
      h: 0.5,
      fontFace: FONT_TITLE,
      fontSize: 26,
      bold: true,
      color: ACCENT_GREEN
    });

    s8.addText(m.label, {
      x: xPos + 0.2,
      y: yPos + 0.65,
      w: 3.9,
      h: 0.3,
      fontFace: FONT_TITLE,
      fontSize: 12,
      bold: true,
      color: TEXT_WHITE
    });

    s8.addText(m.sub, {
      x: xPos + 0.2,
      y: yPos + 0.95,
      w: 3.9,
      h: 0.45,
      fontFace: FONT_BODY,
      fontSize: 10,
      color: TEXT_MUTED
    });
  });
}

// -------------------------------------------------------------
// SLIDE 9: Live Demo & Feature Showcase
// -------------------------------------------------------------
{
  const s9 = pres.addSlide();
  s9.background = { color: BG_DARK };
  addSlideHeader(s9, 'System Demonstration', 'Live System Walkthrough & Feature Verification', 'Interactive demonstration of the running software application');

  const demoPoints = [
    {
      title: 'Faceted Multi-Attribute Discovery',
      desc: 'Instant keyword matching, multi-category toggling, brand filters, and price threshold sorting without full-page reloads.'
    },
    {
      title: 'Interactive Multimedia PDP',
      desc: 'Responsive WebP photo gallery, zoom inspection, video demo embeds, and formatted key-value technical spec matrix.'
    },
    {
      title: 'Secured Administrative Studio',
      desc: 'Taxonomy tree editor with circular relationship prevention, product manager with drag-and-drop media ordering.'
    }
  ];

  demoPoints.forEach((d, idx) => {
    const yPos = 1.6 + idx * 1.15;
    s9.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: yPos,
      w: 8.8,
      h: 1.0,
      fill: { color: BG_CARD },
      line: { color: idx === 0 ? ACCENT_GREEN : BORDER_COLOR, width: 1.5 },
      rectRadius: 0.08
    });

    s9.addText(`0${idx + 1}`, {
      x: 0.8,
      y: yPos + 0.25,
      w: 0.6,
      h: 0.5,
      fontFace: FONT_TITLE,
      fontSize: 20,
      bold: true,
      color: ACCENT_BLUE
    });

    s9.addText(d.title, {
      x: 1.5,
      y: yPos + 0.15,
      w: 7.7,
      h: 0.3,
      fontFace: FONT_TITLE,
      fontSize: 13,
      bold: true,
      color: TEXT_WHITE
    });

    s9.addText(d.desc, {
      x: 1.5,
      y: yPos + 0.45,
      w: 7.7,
      h: 0.45,
      fontFace: FONT_BODY,
      fontSize: 11,
      color: TEXT_BODY
    });
  });
}

// -------------------------------------------------------------
// SLIDE 10: Conclusion & Defense Q&A
// -------------------------------------------------------------
{
  const s10 = pres.addSlide();
  s10.background = { color: BG_DARK };
  addSlideHeader(s10, 'Evaluation & Roadmap', 'Conclusion & Architectural Defense', 'Summary of engineering contributions and future system extensibility');

  // Left: Summary of Contributions
  s10.addShape(pres.ShapeType.roundRect, {
    x: 0.6,
    y: 1.6,
    w: 4.8,
    h: 3.4,
    fill: { color: BG_CARD },
    line: { color: BORDER_COLOR, width: 1 },
    rectRadius: 0.08
  });

  s10.addText('CORE ENGINEERING ACHIEVEMENTS', {
    x: 0.85,
    y: 1.8,
    w: 4.3,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 11,
    bold: true,
    color: ACCENT_GREEN
  });

  const achievements = [
    'Fully compliant IEEE Std 830-1998 Software Requirements Specification.',
    'Decoupled Next.js 16 + Cloudflare R2 architecture delivering sub-second LCP.',
    'Schema-resilient Dynamic Spec Matrix handling arbitrary product categories.',
    'Rigorous RBAC session boundaries shielding administrative endpoints.'
  ];

  achievements.forEach((ach, idx) => {
    s10.addText(`✦  ${ach}`, {
      x: 0.85,
      y: 2.2 + idx * 0.62,
      w: 4.3,
      h: 0.55,
      fontFace: FONT_BODY,
      fontSize: 10.5,
      color: TEXT_BODY
    });
  });

  // Right: Thank You & Q&A Box
  s10.addShape(pres.ShapeType.roundRect, {
    x: 5.6,
    y: 1.6,
    w: 3.8,
    h: 3.4,
    fill: { color: '071E18' },
    line: { color: ACCENT_GREEN, width: 2 },
    rectRadius: 0.08
  });

  s10.addText('READY FOR DEFENSE', {
    x: 5.8,
    y: 2.2,
    w: 3.4,
    h: 0.3,
    fontFace: FONT_TITLE,
    fontSize: 12,
    bold: true,
    color: ACCENT_GREEN,
    align: 'center'
  });

  s10.addText('Questions &\nEvaluation', {
    x: 5.8,
    y: 2.5,
    w: 3.4,
    h: 1.0,
    fontFace: FONT_TITLE,
    fontSize: 24,
    bold: true,
    color: TEXT_WHITE,
    align: 'center'
  });

  s10.addText('Thank you, respected faculty and evaluators.', {
    x: 5.8,
    y: 3.7,
    w: 3.4,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 11,
    color: TEXT_MUTED,
    align: 'center',
    italic: true
  });
}

// Save Presentation
pres.writeFile({ fileName: outputPath }).then((filename) => {
  console.log('Successfully generated PowerPoint presentation at:', filename);
  const stats = fs.statSync(outputPath);
  console.log('Presentation size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
});
