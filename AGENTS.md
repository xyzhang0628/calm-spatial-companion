# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite-based vanilla JavaScript web application (no framework). Node.js v22+ with npm is used.

### Quick Reference

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (starts on port 3000) |
| Lint | `npm run lint` |
| Test | `npm run test` |
| Build | `npm run build` |

### Notes

- The dev server uses Vite with HMR. Changes to files in `src/` are reflected instantly without manual reload.
- ESLint uses the flat config format (`eslint.config.js`).
- Tests use Vitest and live in the `tests/` directory. They run against the `src/` modules directly (no DOM/browser tests).
- The project uses ES modules (`"type": "module"` in `package.json`).
