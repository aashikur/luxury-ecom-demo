<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Admin UI Design System & Token Hierarchy
All administrative dashboard interfaces must follow the locked tokens and minimalist Shopify/WordPress layout conventions specified in `.gemini/rules/admin-ui-design-system.md` and `docs/08-admin-design-hierarchy-and-ui-tokens.md`:
- Page Title: `text-2xl font-bold tracking-tight text-[#060d11]`
- Breadcrumbs: 14px (`text-sm`), inactive `text-slate-500 hover:text-[#060d11] transition-colors`, active `text-[#060d11] font-medium`
- Page/Card Descriptions: `text-sm text-slate-500`
- Card Titles: `text-base font-semibold leading-none tracking-tight text-[#060d11]`
- Primary Action: `#076E46` (`bg-[#076E46] text-white hover:bg-[#055C3A]`)
- Form Options: Short, minimal labels and values (e.g. `Status` -> `Active`, `Draft`, `Archived`; no verbose parentheticals).
- Card Interiors: Clean, unboxed surfaces (no nested grey box wrappers, no decorative icons beside labels).
