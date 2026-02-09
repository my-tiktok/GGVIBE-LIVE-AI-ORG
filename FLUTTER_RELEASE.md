# Flutter Release Checklist (GGVIBE Mobile)

> The Flutter app directory is expected at `ggvibe_mobile/` (or equivalent). This repo currently does not include the mobile source; add it before release.

## Firebase Setup (Do Not Commit Secrets)
- Android: `android/app/google-services.json`
- iOS: `ios/Runner/GoogleService-Info.plist`
- Ensure `firebase_options.dart` is generated via FlutterFire CLI and used by the app.

## Build Commands
- Get dependencies: `flutter pub get`
- Android APK: `flutter build apk --release`
- Android AAB: `flutter build appbundle --release`
- iOS (archive): `flutter build ipa --release`

## Signing (Placeholders)
- Android: configure `key.properties` and Gradle signing config.
- iOS: configure signing in Xcode (Team, Provisioning Profile).

## Smoke Checks
- Launch app, sign in, verify `/api/auth/user` reaches the web backend.
