# Calm Spatial Companion

## Cursor Cloud specific instructions

This is a purely client-side React + Vite app with no backend, database, or Docker services.

### Running the app

- `npm run dev` — starts Vite dev server on `http://localhost:5173`
- `npm run build` — production build to `dist/`
- `npm run preview` — serve production build locally

### Key notes

- **No lint or test framework** is configured. There is no ESLint config or test runner. Validation is done via `npm run build` (Vite build).
- **Mapbox token** is committed in `.env` as `VITE_MAPBOX_TOKEN`. The map will not render without it.
- **Route data** is hardcoded in `src/data/routes.js` — no API calls for route content.
- **Geolocation simulation**: The app has a built-in simulation mode that auto-walks the route. No real GPS is needed to test the full flow.
- **Native builds** (Capacitor for iOS/Android) require platform-specific tooling (Xcode, Android Studio) and are not runnable in this cloud environment.
- **`allowedHosts: true`** is set in `vite.config.js`, so the dev server accepts connections from any hostname.
