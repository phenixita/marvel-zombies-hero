# Login & Google Auth Integration — PRD

A user authentication system for the Marvel Zombies Hero Tracker that enables Google Sign-In, personal profiles, and cloud-synced game state across devices, replacing the current anonymous localStorage-only persistence model.

**Experience Qualities**:
1. **Seamless** - One-tap Google login with no forms to fill, automatic session persistence, and invisible cloud sync that feels like the app "just remembers"
2. **Personal** - Each player has their own profile with avatar, game history, and preferences that follow them across browsers and devices
3. **Non-intrusive** - Authentication is optional; the app remains fully functional offline with localStorage fallback, and login is offered without blocking gameplay

**Complexity Level**: Medium Application (adds authentication layer, cloud persistence, and user context to existing features)
This feature introduces an auth provider, protected routes, a user profile panel, and a cloud sync strategy — requiring backend integration (Firebase Auth + Firestore) while preserving the existing offline-first architecture.

---

## Motivation

Currently, game state is stored exclusively in `localStorage` under the fixed key `'marvel-zombies-game'`. This means:
- Clearing browser data erases all game progress
- Players cannot resume games on a different device or browser
- There is no concept of "who is playing" — the app is fully anonymous
- Multiple players sharing a browser overwrite each other's state

Google Auth integration solves these problems while aligning with the app's single-page, keyboard-first philosophy.

---

## Essential Features

### 1. Google Sign-In

- **Functionality**: Authenticate users via Google OAuth 2.0 using Firebase Authentication, providing a one-tap login experience
- **Purpose**: Establish user identity with zero-friction onboarding — no custom registration forms, no passwords to manage
- **Trigger**: User clicks the "Sign in with Google" button in the Header or on the empty-state splash screen
- **Progression**: User clicks login → Google consent popup opens → User selects Google account → Popup closes → App receives auth token → User profile hydrates in Header → Cloud sync begins
- **Success Criteria**:
  - Login completes in under 3 seconds on average connection
  - Auth state persists across page refreshes (Firebase `onAuthStateChanged` listener)
  - Login button is hidden when authenticated; avatar + display name shown instead
  - Works with personal Google accounts and Google Workspace accounts
  - Silent token refresh — users never see re-authentication prompts during a session

### 2. User Profile Panel

- **Functionality**: Display and manage user profile information sourced from Google account data (name, email, avatar) with optional in-app preferences
- **Purpose**: Give players a sense of ownership and personalization, and provide access to account-related actions (sign out, delete data)
- **Trigger**: User clicks their avatar/name in the Header → Profile panel slides open (Sheet component from right)
- **Progression**: Avatar click → Sheet opens → Shows profile card (avatar, display name, email) → Shows preferences section → Shows account actions (sign out, delete cloud data) → Close sheet
- **UI Layout**:
  - **Profile Card** (top): Google avatar (48×48 rounded-full), display name (Rajdhani Bold), email (Inter Regular, text-muted)
  - **Game Stats** (middle): Total games played, total heroes created, total devour rolls (read from cloud)
  - **Preferences** (bottom-middle): Toggle for automatic mode default, toggle for cloud sync enabled/disabled
  - **Account Actions** (bottom): "Sign Out" button (ghost variant), "Delete Cloud Data" button (destructive variant with AlertDialog confirmation)
- **Success Criteria**:
  - Profile reflects Google account data accurately
  - Preferences persist to cloud and apply on next login
  - Sign out clears auth state but preserves local game data
  - "Delete Cloud Data" requires double confirmation and is irreversible

### 3. Cloud Sync

- **Functionality**: Automatically synchronize game state to Firestore when a user is authenticated, with conflict resolution and offline fallback
- **Purpose**: Enable cross-device gameplay continuity — start a game on desktop, continue on tablet
- **Trigger**: Automatic on any game state change when user is authenticated and cloud sync is enabled
- **Progression**: State change occurs → `usePersistentState` writes to localStorage (instant) → Debounced Firestore write (500ms) → Cloud confirms → Sync indicator briefly pulses in Header → On next login from any device, cloud state is merged with local state
- **Data Model** (Firestore):
  ```
  users/{uid}/
  ├── profile          # { displayName, email, photoURL, preferences, stats }
  └── gameState        # { heroes[], currentRound, currentTurn, ... } (mirrors GameState interface)
  ```
- **Conflict Resolution Strategy**:
  - On login: Compare `lastModified` timestamps between local and cloud state
  - If cloud is newer: Prompt user — "A more recent game was found in the cloud. Load it or keep local?"
  - If local is newer: Auto-push to cloud silently
  - If both are stale (>7 days): Offer to start fresh or load either version
- **Success Criteria**:
  - State syncs within 2 seconds of change (debounced)
  - Offline changes queue and sync when connectivity returns
  - Sync status is visible but non-intrusive (small cloud icon in Header: ✓ synced, ↻ syncing, ✕ offline)
  - No data loss in any conflict scenario — user always has final say
  - Firestore security rules enforce `uid`-scoped access (users can only read/write their own data)

### 4. Auth-Aware Header

- **Functionality**: Extend the existing Header component to show authentication state — login button when anonymous, user avatar + name when signed in
- **Purpose**: Provide persistent, visible auth status and quick access to profile without disrupting the current layout
- **Trigger**: Always visible; updates reactively based on auth state
- **Layout (Signed Out)**:
  ```
  [🧟 Marvel Zombies Tracker]  [⌨️ Shortcuts] [Sign in with Google →]
  ```
- **Layout (Signed In)**:
  ```
  [🧟 Marvel Zombies Tracker]  [☁️ ✓] [⌨️ Shortcuts] [Avatar + Name ▾]
  ```
- **Success Criteria**:
  - Smooth transition between signed-in and signed-out states (200ms fade)
  - Avatar loads lazily with skeleton placeholder
  - Keyboard accessible: Tab to avatar, Enter to open profile panel
  - Cloud sync indicator visible only when authenticated

### 5. Auth-Guarded Empty State

- **Functionality**: Enhance the existing empty-state splash screen (when `heroes.length === 0`) to optionally promote sign-in alongside the existing GameInitDialog
- **Purpose**: Surface the login option at the most natural moment — when a player first opens the app or starts a new game
- **Trigger**: App loads with no heroes and no authenticated user
- **Progression**: Splash renders → Shows "Start New Game" (existing) + "Sign in to sync across devices" (new, secondary) → User can choose either independently → If user signs in and has cloud data, offer to load it
- **Success Criteria**:
  - Login CTA is visually secondary to "New Game" — authentication is optional
  - If user signs in and cloud state has heroes, offer to load that game
  - If user dismisses login, it does not reappear until next fresh visit (remembered via `sessionStorage`)

---

## Technical Architecture

### New Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `firebase` | Auth + Firestore SDK | `^11.x` |
| `react-firebase-hooks` | React bindings for Firebase auth/firestore | `^5.x` |

### New Files

```
src/
├── lib/
│   ├── firebase.ts              # Firebase app initialization and config
│   ├── auth.ts                  # signInWithGoogle(), signOut(), onAuthStateChanged wrappers
│   └── cloudSync.ts             # Firestore read/write/merge utilities for GameState
├── hooks/
│   ├── useAuth.ts               # Auth context hook: { user, loading, signIn, signOut }
│   └── useCloudSync.ts          # Sync hook: wraps usePersistentState + Firestore writes
├── components/
│   ├── AuthProvider.tsx          # React context provider wrapping Firebase auth listener
│   ├── UserProfilePanel.tsx      # Sheet-based profile panel
│   ├── SyncIndicator.tsx         # Cloud sync status icon in Header
│   └── GoogleSignInButton.tsx    # Styled "Sign in with Google" button (matches theme)
```

### Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap with `<AuthProvider>`, replace `usePersistentState` with `useCloudSync` |
| `src/components/Header.tsx` | Add auth-aware section (avatar/login button), sync indicator |
| `src/components/GameInitDialog.tsx` | Add optional "Sign in" CTA on empty state |
| `src/hooks/usePersistentState.ts` | No changes — remains as localStorage-only fallback |
| `.env.local` | Firebase project config (API key, project ID, etc.) |
| `vite.config.ts` | No changes expected |

### Auth Flow Sequence

```
┌──────────┐     ┌──────────────┐     ┌────────────┐     ┌───────────┐
│  User    │────▶│ GoogleSignIn │────▶│  Firebase   │────▶│ Firestore │
│  clicks  │     │  Button      │     │  Auth       │     │  (cloud)  │
└──────────┘     └──────────────┘     └────────────┘     └───────────┘
                        │                    │                   │
                        │              onAuthStateChanged        │
                        │                    │                   │
                        ▼                    ▼                   ▼
                 ┌──────────────┐     ┌────────────┐     ┌───────────┐
                 │ AuthProvider │◀────│  user obj  │     │ GameState │
                 │  context     │     │  (uid,name │     │ per uid   │
                 └──────────────┘     │  photo,etc)│     └───────────┘
                        │             └────────────┘           │
                        ▼                                      ▼
                 ┌──────────────┐                       ┌───────────┐
                 │ useAuth()    │                       │useCloudSync│
                 │ in Header,   │                       │ merges    │
                 │ Profile, etc │                       │ local+cloud│
                 └──────────────┘                       └───────────┘
```

### Security Considerations

- **Firebase API keys** are safe to expose in client bundles (they are project identifiers, not secrets). Access control is enforced via Firestore Security Rules.
- **Firestore Security Rules**:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```
- **No sensitive data** in Firestore — only game state (hero names, health, hunger, traits) and Google profile info the user has already consented to share
- **CSRF/XSS**: Firebase SDK handles token management; no manual token storage in localStorage or cookies
- **Data deletion**: GDPR-friendly "Delete Cloud Data" wipes all Firestore documents under the user's `uid` path

---

## Edge Case Handling

- **Google popup blocked** — Detect popup failure and fall back to redirect-based auth flow (`signInWithRedirect`)
- **Network loss during sync** — Firestore SDK has built-in offline persistence; queued writes sync on reconnect
- **User revokes Google access** — `onAuthStateChanged` fires with `null`; app gracefully falls back to anonymous mode, local data preserved
- **Multiple tabs open** — Firebase auth state syncs across tabs automatically; Firestore `onSnapshot` updates all tabs
- **localStorage full** — Existing edge case; cloud sync provides a natural fallback path
- **User signs in on new device with no local data** — Load cloud state directly, no merge dialog needed
- **User signs in on device with existing local data AND cloud data** — Timestamp-based conflict dialog (see Cloud Sync section)
- **Firebase quota exceeded** — Free tier supports 50K daily reads, 20K writes; display toast warning if approaching limits (track write count locally)
- **User with multiple Google accounts** — Google account chooser handles this natively; app stores `uid` from selected account

---

## Design Direction

The login and profile UI should feel like a natural extension of the existing dark, gritty S.H.I.E.L.D. monitoring aesthetic. The Google Sign-In button should be styled to match the app's comic book theme rather than using Google's default branding (while respecting Google's brand guidelines for the Google logo and "Sign in with Google" label). The profile panel should feel like a personnel dossier — angular borders, Rajdhani headings, muted stat readouts.

### Login Button Styling
- Dark variant with subtle crimson border glow
- Google "G" logo preserved per brand requirements
- Text: "Sign in with Google" in Inter Medium
- Hover: border intensifies, subtle scale 1.02

### Profile Panel Styling
- Uses existing Sheet component (slides from right)
- Avatar: rounded-full with 2px crimson ring border
- Stats displayed as monospace-style readout blocks
- Sign Out button: ghost variant with skull icon
- Delete Data button: destructive variant with AlertDialog ("Are you sure, Agent?")

### Sync Indicator
- Cloud icon from `lucide-react` (`Cloud`, `CloudOff`, `CloudUpload`)
- States: idle (dim), syncing (pulse animation 1s), synced (brief green flash), offline (CloudOff, muted)
- Size: 16×16, positioned left of keyboard shortcuts button

---

## Color Additions

No new colors needed. The feature reuses existing palette:
- **Sign-in button border**: `accent` (blue) — differentiates from game actions
- **Sync success flash**: existing `green` Radix color
- **Sync error/offline**: existing `crimson` Radix color
- **Profile panel background**: `neutral` dark (same as card backgrounds)

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + L` | Sign in / Open profile panel (toggle) |
| `Escape` | Close profile panel (standard Sheet behavior) |

---

## Rollout Strategy

### Phase 1 — Auth Foundation
- Firebase project setup and config
- `AuthProvider`, `useAuth` hook, `GoogleSignInButton`
- Auth-aware Header (login/avatar toggle)
- No cloud sync yet — localStorage only

### Phase 2 — Cloud Sync
- `useCloudSync` hook with Firestore integration
- Debounced write strategy
- Sync indicator in Header
- Conflict resolution dialog

### Phase 3 — Profile & Stats
- `UserProfilePanel` (Sheet)
- Game stats tracking and display
- Preferences (automatic mode default, sync toggle)
- Delete Cloud Data flow

### Phase 4 — Polish
- Popup-blocked fallback to redirect auth
- Offline queue visibility
- Quota warning toasts
- E2E testing of auth flows

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Login completion rate | >90% of users who click "Sign in" complete the flow |
| Sync latency (p95) | <2 seconds from state change to Firestore write |
| Cross-device resume rate | >80% of authenticated users load cloud state on second device |
| Auth-related errors | <1% of sessions encounter auth/sync errors |
| Opt-in rate | >40% of active users sign in within first 3 sessions |

---

## Out of Scope

- Email/password registration (Google-only for simplicity)
- Social features (sharing games, multiplayer lobby)
- Admin dashboard or user management
- Push notifications for game reminders
- OAuth providers beyond Google (Apple, GitHub — could be Phase 5)
- Server-side rendering or API routes (remains a fully client-side SPA)
