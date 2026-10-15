<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project notes

- Content lives only in `lib/content.json` (see CONTENT.md). Never hard-code
  copy, dates or media paths in components, and never invent facts. Flag
  unknowns instead.
- Don't delete or move anything in `public/`. Derived files go under
  `public/generated/` (`npm run media`, `scripts/brand.mjs`).
- `app/api/**` and the submission form and email components belong to the
  backend. Change them only on purpose.
- The background stage owns `lib/stage/`, `components/stage/`, `app/lab/` and
  `e2e/stage.spec.ts`.
- Gates: `npx tsc --noEmit`, `npm run build`, `npm run e2e`.
