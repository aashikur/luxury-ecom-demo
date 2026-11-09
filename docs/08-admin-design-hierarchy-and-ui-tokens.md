# 08 - Admin Dashboard Design Hierarchy & Locked UI Tokens

## Overview
This document specifies the authoritative design hierarchy, typography tokens, color palette, and minimalism rules across all administrative dashboard surfaces in the application.

---

## 1. Locked Typography & Tokens

- **Dashboard Page Heading**: `text-2xl font-bold tracking-tight text-[#060d11]`
- **Page Subtitle**: `text-sm text-slate-500 mt-1`
- **Breadcrumbs**:
  - Container: `text-sm text-slate-500 mb-2` (14px)
  - Inactive links: `text-slate-500 hover:text-[#060d11] transition-colors font-normal`
  - Active / current item: `text-[#060d11] font-medium`
- **Card Title**: `text-base font-semibold leading-none tracking-tight text-[#060d11]`
- **Card Subtitle**: `text-sm text-slate-500 leading-relaxed mt-1`
- **Form Input Label**: `text-xs font-semibold text-slate-700 block mb-1.5`
- **Primary CTA**: `#076E46` (`bg-[#076E46] text-white hover:bg-[#055C3A]`)
- **Secondary / Cancel**: `border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`

---

## 2. Copy & Layout Minimalism (Shopify / WordPress Standard)

1. **Short, Clean Label & Select Options**:
   - `Status`: `Active`, `Draft`, `Archived` (no verbose parentheticals).
   - `Stock Status`: `Auto`, `Force Out of Stock`, `Pre-Order`.
   - Card title: `Organization` without bloated subtitles.
2. **Uncluttered Taxonomy**:
   - Label: `Category` and `Subcategory`.
   - No unnecessary icons next to form labels.
   - No nested grey backgrounds (`bg-slate-50`) inside cards. All fields sit cleanly on the primary white surface.

---

## 3. Reusable UI Components
All dashboard views must import from `@/components/ui`:
- `Breadcrumb`
- `Button`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input`, `Select`, `Textarea`
- `Badge`
- `TableContainer`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
