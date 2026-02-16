# Running the app on iOS and Android

The INÖ Fitness mobile app and the trainer-app mobile app are built with **Expo** and **React Native**, so they run on both **iOS** and **Android**.

## Prerequisites

- **Node.js 20+** and **npm** or **pnpm**
- **Expo Go** (optional): install on your phone to run in dev without building
- **iOS**: Mac with **Xcode** (for simulator or device builds); or use **Expo Go** on a real iPhone
- **Android**: **Android Studio** with SDK (for emulator or device builds); or use **Expo Go** on a real Android device

## INÖ Fitness app (`mobile/`)

### Install and start

```bash
cd mobile
npm install
npx expo start
```

### Run on a device or simulator

- **iOS simulator (Mac only):** Press `i` in the terminal, or run `npm run ios`
- **Android emulator:** Start an AVD in Android Studio, then press `a` in the terminal, or run `npm run android`
- **Physical device:** Install **Expo Go** from the App Store (iOS) or Play Store (Android), ensure phone and PC are on the same Wi‑Fi, then scan the QR code from `npx expo start`

### Build for store (EAS Build)

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure the project: in `mobile/app.json`, set `extra.eas.projectId` to your Expo project ID (from `eas init` or expo.dev)
4. Build:
   - **iOS:** `eas build --platform ios --profile production`
   - **Android:** `eas build --platform android --profile production`

Both platforms are enabled in `app.json` (`platforms: ["ios", "android"]`). iOS uses `bundleIdentifier: "com.ino.fitness"`; Android uses `package: "com.ino.fitness"`. Build properties (iOS deployment target 13.4+, Android minSdk 23) are set for compatibility.

---

## Trainer-app mobile (`trainer-app/apps/mobile/`)

### Install and start

From the **trainer-app** root (so workspaces resolve):

```bash
cd trainer-app
pnpm install
cd apps/mobile
pnpm start
```

Then press `i` for iOS or `a` for Android (with simulator/emulator running), or scan the QR code with Expo Go.

### Build for store

- **iOS:** `eas build --platform ios --profile production`
- **Android:** `eas build --platform android --profile production`

Use bundle ID `com.ino.aifitnesscoach` (iOS) and package `com.ino.aifitnesscoach` (Android) as in `app.json`.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Metro won’t start | Run `npx expo start --clear` |
| iOS build fails (Xcode) | Open `ios/` in Xcode after `npx expo prebuild` and check signing & deployment target (e.g. 13.4) |
| Android build fails | Ensure `ANDROID_HOME` is set; run `npx expo prebuild --clean` and build again |
| Expo Go can’t connect | Same Wi‑Fi as dev machine; try “Tunnel” in Expo dev tools if “LAN” fails |
| White screen on device | Check that API/backend URL in app config is reachable from the device (e.g. use tunnel or a reachable host) |

---

## Summary

- **mobile/** and **trainer-app/apps/mobile/** are configured for **iOS** and **Android** (bundle IDs, packages, permissions, build properties).
- Use `npx expo start` then `i` / `a` or Expo Go for development.
- Use **EAS Build** for production builds and app store submission.
