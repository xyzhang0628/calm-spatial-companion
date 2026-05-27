# calm-spatial-companion
A calm spatial companion exploring atmosphere-based walking and running experiences.

## Web development

```sh
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173/`.

## Native mobile apps

This project uses Capacitor to package the React/Vite app as native iOS and
Android apps.

```sh
npm run native:sync
```

Then open the native project:

```sh
npm run native:android
npm run native:ios
```

Notes:
- Android builds require Android Studio / Android SDK.
- iOS builds require Xcode on macOS.
- Run `npm run native:sync` after changing React code so the latest `dist`
  assets are copied into `android/` and `ios/`.
