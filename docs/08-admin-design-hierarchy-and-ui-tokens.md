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

---

## 4. Multi-Tab Navigation & Horizontal Overflow Standard

When rendering multi-module tabs (e.g., `/admin/settings` with 7 modules):
1. **MouseWheel Horizontal Translation (`onWheel`):** The tabs container must listen to `onWheel` and translate `e.deltaY` into `scrollLeft`, allowing desktop users with a standard mouse wheel to smoothly scroll left and right without holding `Shift`.
2. **Left / Right Chevron Controls:** Floating `<` and `>` arrow buttons must dynamically appear when content overflows, providing single-click accessibility.
3. **No Hidden Overflow Traps:** Never use `.no-scrollbar` on overflow-critical tab bars. Use a subtle `scrollbar-thin scrollbar-thumb-slate-300` to guarantee visual affordance and drag capability.
4. **Non-Compressible Tab Items:** Every tab button must enforce `shrink-0 whitespace-nowrap` so labels and badges never distort when viewport width contracts.

---

## 5. Standard Entity Views Architecture (Categories, Collections, Brands, Settings)

Across all administrative entities, the layout adheres to a unified visual rhythm:

### 5.1 List / Table View (`*Client.tsx`)
- **Breadcrumbs:** `Dashboard > [Entity Name]`
- **Header:** `text-2xl font-bold tracking-tight text-[#060d11]`, 1-line muted description, `<Button className="bg-[#076E46] text-white hover:bg-[#055C3A]">` with `<Plus className="w-4 h-4" />`.
- **Search & Stats Bar:** Left-aligned search input with magnifying glass (`Search className="h-3.5 w-3.5 text-slate-400"`), right-aligned counter (`Showing X items`).
- **Data Table:** `<TableContainer className="border border-slate-200 shadow-2xs rounded-xl overflow-visible bg-white">`.
- **Row Columns:** Index number `#`, Name/Title + Image Avatar, Slug, Item/Product count, Active/Featured badges, and a 3-dot popover actions menu (`•••`).
- **Pagination:** `<TablePagination />` with page size selector (`20`, `50`, `100`).
- **Deletion Safeguard:** Modal with cascade unlinking summary (recursively cleans child references in `products` / sub-items).

### 5.2 Create & Edit View (`*FormClient.tsx`)
- **Breadcrumbs:** `Dashboard > [Entity Name] > Create / Edit`
- **Header:** Title + Cancel (`outline`) and Save Changes (`#076E46`) buttons.
- **Form Layout:** 12-column grid:
  - **Left (8 columns):** General Information card (Name, Slug with auto-lock/unlock slugifier, Description, Media upload).
  - **Right (4 columns):** Publishing & Status card (Active status, Featured placement, Order sorting).
