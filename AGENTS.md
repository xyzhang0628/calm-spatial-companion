# AGENTS.md

## Cursor Cloud specific instructions

This is a React 19 + Vite 8 single-page application with no backend, database, or external service dependencies. All route data is hardcoded in `src/data/routes.js`.

### Running the app

- **Dev server:** `npm run dev` (starts Vite on port 5173)
- **Build:** `npm run build` (outputs to `dist/`)
- **Preview production build:** `npm run preview`

### Notes

- No linter or test framework is configured in this project.
- No environment variables or secrets are required.
- The "Find routes" button on the State Selection screen only appears after the user interacts with the walk-length slider.
