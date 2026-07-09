# Plan: Cambio sfondo sempre disponibile (no login required)

## TL;DR
Il cambio sfondo è oggi raggiungibile solo dal pannello "Profile" (`UserProfilePanel`), che ritorna `null` se l'utente non è loggato con Google. I dati di sfondo (`backgroundMode`/`backgroundImage`) sono già persistiti SOLO in localStorage (mai su Firestore), quindi il livello dati funziona già senza login: è solo l'entry point UI ad essere gated. Soluzione concordata: rimuovere del tutto la sezione "Sfondo" da `UserProfilePanel` e spostare l'unico entry point in un nuovo pulsante icona sempre visibile nell'Header (gruppo Utility Buttons), con un pulsante di reset accanto quando uno sfondo custom è attivo.

## Steps
1. **UserProfilePanel.tsx** — rimuovere: state `backgroundPickerOpen`, import `Image` (lucide) e `BackgroundPickerDialog`, il blocco JSX sezione "Sfondo" (label "Sfondo", bottoni "Cambia sfondo"/"Rimuovi", preview thumbnail), e il render di `<BackgroundPickerDialog .../>` in fondo al componente. Le altre sezioni (Account, Statistics, Cloud Sync/Auto Mode/Theme, Danger Zone) restano invariate e gated dietro login come oggi.
2. **Header.tsx** — *dipende da 1 solo per evitare doppio rendering del dialog, altrimenti indipendente*:
   - Importare `BackgroundPickerDialog` da `@/components/BackgroundPickerDialog` e `Image` (+ icona reset, es. `RotateCcw`) da `lucide-react`.
   - Aggiungere state locale `const [backgroundPickerOpen, setBackgroundPickerOpen] = useState(false)`.
   - Nel gruppo "Utility Buttons" (tra Keyboard Shortcuts e New Game), aggiungere `Button variant="ghost" size="icon"` con icona `Image`, `title="Cambia sfondo"`, `onClick={() => setBackgroundPickerOpen(true)}` — sempre visibile, nessuna dipendenza da `useAuth`.
   - Accanto, renderizzare condizionalmente (solo se `preferences.backgroundMode !== 'default'`) un bottone reset che chiama `onUpdatePreferences({ backgroundMode: 'default', backgroundImage: undefined })`.
   - In fondo al componente (accanto a `<UserProfilePanel .../>`), renderizzare `<BackgroundPickerDialog open={backgroundPickerOpen} onClose={() => setBackgroundPickerOpen(false)} onSave={(mode, image) => { onUpdatePreferences({ backgroundMode: mode, backgroundImage: image }); setBackgroundPickerOpen(false) }} />`.
   - `preferences`/`onUpdatePreferences` sono già props esistenti di `Header`, nessuna modifica alla firma o ai chiamanti (App.tsx) necessaria.
3. **Verifica** — vedi sezione sotto.

Nessuna modifica necessaria a: `App.tsx` (logica di applicazione sfondo invariata), `UserPreferences.ts`, `useUserPreferences.ts`, `backgroundUtils.ts`, `preferencesService.ts`, `useAuth.tsx`, scorciatoia Ctrl/Cmd+L (continua a gestire solo profilo/login).

## Relevant files
- `src/components/UserProfilePanel.tsx` — rimuovere sezione "Sfondo" e relativi state/import/dialog.
- `src/components/Header.tsx` — aggiungere pulsante icona "Cambia sfondo" (sempre visibile) + pulsante reset condizionale + render `BackgroundPickerDialog`, riusando props `preferences`/`onUpdatePreferences` già presenti.
- `src/components/BackgroundPickerDialog.tsx` — riusato invariato (props `open/onClose/onSave`, nessuna dipendenza da auth).

## Verification
1. Manuale, senza login: aprire l'app senza sign-in, cliccare la nuova icona in Header, scegliere tab "device" o "random", salvare, verificare che lo sfondo si applichi su tutta l'app (overlay scuro leggibile) esattamente come da `App.tsx` esistente.
2. Manuale: con sfondo custom attivo, verificare comparsa del pulsante reset in Header e che riporti a `backgroundMode: 'default'`.
3. Manuale, con login Google: aprire "Profile" (Ctrl/Cmd+L o click avatar) e verificare che la sezione "Sfondo" non compaia più, mentre Cloud Sync/Auto Mode/Theme/Danger Zone restano funzionanti.
4. Refresh pagina dopo il salvataggio sfondo (senza login) → verificare persistenza da localStorage (`marvel-zombies-user-preferences`).
5. `npm run build` per verificare che TypeScript compili senza errori (import inutilizzati rimossi in UserProfilePanel.tsx).

## Decisions
- Scope: SOLO il cambio sfondo esce dal gate di login; cloud sync/auto mode/theme/danger zone restano riservati agli utenti loggati (come oggi).
- Entry point: nuovo pulsante icona sempre visibile in Header (gruppo Utility Buttons), non un pannello "adattivo" — per evitare casi ambigui, come richiesto esplicitamente dall'utente.
- Reset allo sfondo default: pulsante dedicato accanto all'icona in Header (visibile solo se sfondo custom attivo), non un'opzione dentro il dialog.
- Nessun test automatico esistente per Header/UserProfilePanel (cartella `__tests__` vuota, nessun test runner configurato in package.json) — verifica solo manuale in questo scope.
