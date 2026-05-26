# AGENTS.md

## Cursor Cloud specific instructions

This is a purely client-side React SPA (no backend, no database). The only service to run is the Vite dev server.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves at http://localhost:5173) |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

### Notes

- No linting or test framework is configured in this repo. There are no `lint` or `test` npm scripts.
- All route/walk data is static (hardcoded in `src/data/routes.js`); no API keys or secrets are needed.
- The app uses Google Fonts loaded from CDN; it works without network access but falls back to system fonts.
- Vite HMR works reliably; no restart needed after dependency changes unless `vite.config.js` is modified.
