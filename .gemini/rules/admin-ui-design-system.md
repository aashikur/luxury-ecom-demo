# Administrative Dashboard Design System & Locked Token Hierarchy

Every design and frontend agent working on this repository MUST strictly follow these rules before creating, editing, or refactoring any admin dashboard interface.

---

## 1. Locked Typography & Color Tokens

| Component Element | Required Tailwind Classes | Hex / Token Value | Notes |
| :--- | :--- | :--- | :--- |
| **Page Title** (e.g., 'New Product', 'Products') | `text-2xl font-bold tracking-tight text-[#060d11]` | `#060d11` | Primary rich near-black foreground. |
| **Page Subtitle / Descriptions** | `text-sm text-slate-500 mt-1` | `text-muted-foreground` | Short, crisp, 1-line guidance. |
| **Breadcrumbs (Inactive Links)** | `text-sm text-slate-500 hover:text-[#060d11] transition-colors` | 14px (`text-sm`) | Hover smoothly transitions to `#060d11`. |
| **Breadcrumbs (Active Item)** | `text-sm text-[#060d11] font-medium` | `#060d11` | Current page indicator. |
| **Card Header Title** (e.g., 'Product Information', 'Organization') | `text-base font-semibold leading-none tracking-tight text-[#060d11]` | `#060d11` | Standard card title across all cards. |
| **Card Description** | `text-sm text-slate-500 leading-relaxed mt-1` | `#64748b` | Muted secondary note. |
| **Form Field Labels** | `text-xs font-semibold text-slate-700 block mb-1.5` | Standard field label | Clean, concise, no extra fluff. |
| **Primary Action Button** | `bg-[#076E46] text-white hover:bg-[#055C3A]` | Emerald green `#076E46` | Full-width or inline primary CTA. |
| **Secondary / Cancel Button** | `border border-slate-200 bg-white text-slate-700 hover:bg-slate-50` | Variant `outline` | Clean bordered button. |

---

## 2. Minimalist Form Copy & Options Rule (Shopify / WordPress Pattern)

1. **Avoid excessive hints, explanations, and wordy copy:**
   - Keep field labels and option text short and clear.
   - **Correct:** `Status` with options:
     - `Active`
     - `Draft`
     - `Archived`
   - **Prohibited:** `Publish Status` with `Draft (Hidden from storefront)`, `Active (Published on storefront)`.
2. **Simplified Taxonomy & Hierarchy Labels:**
   - Card title: `Organization` (or `Taxonomy`), avoiding verbose subtitles.
   - Category labels: Use simple `Category` and `Subcategory`.
   - **Prohibited:** `Department (Root)`, `1. Department (Root) (option)`.
3. **No Decorative Icon Clutter:**
   - Do NOT place arbitrary left-side icons beside standard form labels or category pickers (e.g., remove `Layers`, `Tag`, `Folder` icons next to input headers).
   - Only use functional icons (e.g., search icon inside search input, chevron for dropdowns, upload icon in media dropzone).
4. **No Extra Inner Background Wrappers:**
   - Keep card interiors clean and unboxed.
   - Do NOT wrap category or taxonomy sections in nested `bg-slate-50` or colored grey boxes. Form fields should sit cleanly on the white card background.

---

## 3. Standard Shared UI Suite Usage

Always import components from `@/components/ui`:
- `<Button variant="default | outline | secondary | ghost | destructive">`
- `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`
- `<Breadcrumb items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Products' }]} />`
- `<Input label="..." placeholder="..." />`
- `<Select label="...">`
- `<Textarea label="..." />`
- `<Badge variant="success | warning | secondary">`
- `<TableContainer>`, `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableHead>`, `<TableBody>`, `<TableCell>`

---

## 4. Checklist Before Finalizing Any Admin UI

- [ ] Page title is `text-2xl font-bold tracking-tight text-[#060d11]`
- [ ] Breadcrumbs are 14px (`text-sm`), inactive hover `#060d11`, active `#060d11`
- [ ] Card titles are `text-base font-semibold leading-none tracking-tight text-[#060d11]`
- [ ] Primary buttons use `#076E46`
- [ ] Form options are minimal and concise (no bloated descriptions in select dropdowns)
- [ ] Card contents are unboxed with zero unnecessary nested grey box wrappers
- [ ] TypeScript compilation `tsc --noEmit` and `next build` pass with zero errors.
