# Deep Linking (Demo)

App prefixes:

- `pawfectmatch://`
- `https://pawfectmatch.com`

## Core Routes

- **Home**: `pawfectmatch://home`
- **Stories**: `pawfectmatch://stories`
- **Matches**: `pawfectmatch://matches`
- **Messages**: `pawfectmatch://matches` (navigates to matches, which includes messages)
- **Profile**: `pawfectmatch://profile?userId=:userId`
  - Example: `pawfectmatch://profile?userId=demo1`
  - Without userId: `pawfectmatch://profile` (opens current user's profile)

## Demo Routes

- **Demo Showcase**: `pawfectmatch://demo-showcase`
- **Chat (match)**: `pawfectmatch://chat/:matchId/:petName?`
  - Example: `pawfectmatch://chat/match-1/Buddy`
- **Adoption application**: `pawfectmatch://adoption-application/:petId/:petName?`

## Testing Deep Links

### Android (ADB)

```bash
# Install app first
adb install -r apps/mobile/dist/PawfectMatch-Demo-preview.apk

# Open Home
adb shell am start -W -a android.intent.action.VIEW -d "pawfectmatch://home"

# Open Stories
adb shell am start -W -a android.intent.action.VIEW -d "pawfectmatch://stories"

# Open Profile with userId
adb shell am start -W -a android.intent.action.VIEW -d "pawfectmatch://profile?userId=demo1"

# Open Demo Showcase
adb shell am start -W -a android.intent.action.VIEW -d "pawfectmatch://demo-showcase"
```

### iOS (Simulator)

```bash
# Open Home
xcrun simctl openurl booted "pawfectmatch://home"

# Open Stories
xcrun simctl openurl booted "pawfectmatch://stories"

# Open Profile with userId
xcrun simctl openurl booted "pawfectmatch://profile?userId=demo1"
```

## Notes

- On web, `https://pawfectmatch.com/home` and `https://pawfectmatch.com/stories` also work when served with the same prefixes.
- Profile route supports optional `userId` parameter for viewing other users' profiles.
- All routes respect demo mode and will use offline fixtures when `DEMO_MODE=1` is set.
