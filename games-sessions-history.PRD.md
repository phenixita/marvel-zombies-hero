# PRD - Gestione Storia Partite

## Business Outcome
Consentire al giocatore di conservare automaticamente la partita corrente quando avvia una nuova partita e di poter riprendere, in un secondo momento, una partita precedentemente storicizzata dallo stesso identico stato salvato.

## Non-Goals
- Non introdurre una gestione multi-branch o versioning avanzato delle partite.
- Non aggiungere funzionalita di rinomina, cancellazione manuale o tagging dello storico in questa iterazione.
- Non ridisegnare header, dashboard o flussi di autenticazione oltre al minimo necessario per accedere allo storico.
- Non modificare la logica di turno, round, attacco, devour o gestione eroi al di fuori del ripristino dello stato gia esistente.

## Constraints
- Mantenere l'architettura attuale con uno stato applicativo centrale in `src/App.tsx`.
- Mantenere la persistenza locale tramite `usePersistentState` e la sincronizzazione cloud tramite il modello attuale in `src/hooks/useCloudSync.ts` e `src/lib/gameStateService.ts`.
- Privilegiare il cambiamento minimo: estendere l'attuale `GameState` invece di introdurre un nuovo store globale o una nuova libreria di stato.
- Lo storico deve funzionare sia per utenti anonimi in localStorage sia per utenti autenticati con sync cloud attiva.
- Lo storico deve essere limitato a massimo 10 partite archiviate, con espulsione automatica delle piu vecchie.
- Il ripristino di una partita dallo storico la rende partita corrente e la rimuove dallo storico, evitando duplicati.
- Ogni snapshot storico deve salvare solo lo stato della partita, senza annidare a sua volta l'intero storico.

## Assumptions Accepted By User
- Quando una partita viene riaperta dallo storico, esce dallo storico e diventa la partita corrente.
- Lo storico ha un limite massimo di 10 partite archiviate.

## Product Backlog

### PBI 1 - Archiviazione automatica della partita corrente
**User Story**
As a player, I want the current game to be archived automatically when I start a new game so that I can come back to it later without losing progress.

**Why this item is INVEST-compliant**
- Independent: introduce il comportamento di storicizzazione senza dipendere dalla UI di selezione.
- Negotiable: il dettaglio dei metadati mostrati puo variare senza cambiare l'obiettivo.
- Valuable: evita la perdita del progresso corrente.
- Estimable: impatta principalmente modello dati e flusso di `handleStartNewGame`.
- Small: confinato al salvataggio e alla creazione della nuova partita.
- Testable: il risultato atteso e verificabile ispezionando stato corrente e storico.

**Acceptance Criteria**
- Given una partita corrente con almeno un eroe
  When il giocatore avvia una nuova partita
  Then la partita precedente viene salvata nello storico con un identificatore di sessione univoco e timestamp di archiviazione
  And la nuova partita corrente viene creata con un nuovo `gameSessionId`
  And lo storico contiene la snapshot completa della partita precedente senza annidare ulteriori elementi di storico
- Given nessuna partita corrente attiva o una partita vuota senza eroi
  When il giocatore avvia una nuova partita
  Then non viene creato alcun elemento di storico superfluo
  And la nuova partita parte come stato corrente iniziale
- Given uno storico gia pieno con 10 partite archiviate
  When il giocatore avvia una nuova partita partendo da una partita non vuota
  Then la partita corrente viene archiviata
  And la partita storica piu vecchia viene rimossa automaticamente per mantenere il limite massimo di 10

**Relevant Technical Details And Files**
- `src/lib/GameState.ts`: estendere `GameState` con una collezione embedded di snapshot storiche e helper per archiviare/ripristinare in modo sicuro.
- `src/App.tsx`: il flusso `handleStartNewGame` oggi sostituisce direttamente lo stato corrente; qui va inserita la logica di archiviazione preventiva della partita corrente.
- `src/hooks/usePersistentState.ts`: non richiede cambio di pattern, ma deve continuare a serializzare il nuovo shape esteso di `GameState`.
- Invariante chiave: gli elementi di storico non devono contenere `gameHistory`, per evitare crescita esponenziale del payload.
- Invariante chiave: nessun `sessionId` puo comparire sia come corrente sia nello storico; in caso di collisione si conserva solo la versione piu recente.

### PBI 2 - Selezione e ripristino di una partita dallo storico
**User Story**
As a player, I want to see archived games and choose one to resume so that I can continue a previous play session from the exact saved state.

**Why this item is INVEST-compliant**
- Independent: usa lo storico gia salvato ma si concentra sul recupero e sulla UX minima di accesso.
- Negotiable: la presentazione della lista puo essere raffinata successivamente.
- Valuable: rende realmente utile la storicizzazione.
- Estimable: impatta un dialogo esistente e il wiring dello stato corrente.
- Small: puo essere consegnato dentro il dialogo di inizializzazione gia presente.
- Testable: si verifica ripristinando round, turni, eroi e impostazioni.

**Acceptance Criteria**
- Given almeno una partita nello storico
  When il giocatore apre il flusso di nuova partita o la schermata iniziale senza partita attiva
  Then il sistema mostra un elenco delle partite archiviate selezionabili
  And per ogni elemento mostra almeno informazioni minime utili a distinguerlo, come data di archiviazione e numero eroi
- Given una partita archiviata selezionata
  When il giocatore sceglie di riprenderla
  Then quella snapshot diventa la partita corrente esattamente con gli stessi dati salvati di eroi, hunger, health, round, turn e modalita automatica
  And l'elemento selezionato viene rimosso dallo storico
- Given una partita corrente non vuota e una partita nello storico
  When il giocatore riprende la partita storica
  Then la partita corrente precedente viene a sua volta archiviata prima del ripristino
  And non vengono creati duplicati della sessione selezionata nello storico
- Given lo storico e vuoto
  When il giocatore apre il dialogo relativo
  Then il sistema non mostra azioni di ripristino non valide
  And il flusso di creazione nuova partita resta disponibile come oggi

**Relevant Technical Details And Files**
- `src/components/GameInitDialog.tsx`: punto naturale per esporre lo storico, dato che oggi e il dialogo usato per inizializzare una nuova partita.
- `src/App.tsx`: deve passare al dialogo la lista delle partite archiviate e ricevere l'azione di resume con sostituzione dello stato corrente.
- `src/components/Header.tsx`: non richiede un redesign, ma il pulsante esistente `New Game` resta l'entry point che apre il dialogo anche per scegliere una partita storica.
- Il resume deve essere trattato come operazione di ripristino di stato completo, non come merge parziale con la partita corrente.
- Metadati minimi consigliati per ogni snapshot storico: `sessionId`, `archivedAt`, `heroCount`, eventuale identificativo derivato dal primo eroe o stato del round solo se gia disponibile senza logica extra.

### PBI 3 - Persistenza, compatibilita e sync cloud dello storico
**User Story**
As a signed-in or anonymous player, I want archived games to persist consistently across refreshes and cloud sync so that history behaves reliably on the same device and across devices.

**Why this item is INVEST-compliant**
- Independent: riguarda persistenza e compatibilita del nuovo shape dati.
- Negotiable: il dettaglio delle guardie di validazione puo variare senza cambiare il risultato atteso.
- Valuable: senza persistenza affidabile la feature perde valore.
- Estimable: confinato a servizi e hook di salvataggio/sync esistenti.
- Small: estende il modello attuale a un payload piu ricco senza cambiare stack tecnologico.
- Testable: si puo verificare tramite refresh browser, login e sincronizzazione tra dispositivi.

**Acceptance Criteria**
- Given un utente anonimo con partite archiviate
  When ricarica la pagina
  Then la partita corrente e lo storico vengono ripristinati dal localStorage senza perdita di dati
- Given un utente autenticato con cloud sync attiva
  When crea nuove partite o riprende partite dallo storico
  Then il documento cloud della partita viene aggiornato includendo anche lo storico secondo il nuovo shape compatibile
  And un secondo dispositivo autenticato riceve corrente e storico coerenti tramite il meccanismo di sync esistente
- Given uno stato legacy che non contiene alcun campo di storico
  When l'app lo carica
  Then il sistema assume uno storico vuoto senza errori runtime
  And il resto del flusso continua a funzionare come prima
- Given un conflitto cloud tra stato locale e cloud
  When il sistema apre il flusso di conflict resolution esistente
  Then il confronto continua a funzionare con il nuovo shape dati
  And l'opzione `Start Fresh` non lascia dati di storico in uno stato indefinito o incoerente

**Relevant Technical Details And Files**
- `src/lib/gameStateService.ts`: oggi salva un solo documento `users/{uid}/profile/gameState`; il payload puo restare nello stesso documento, ma va sanificato e bounded prima del write per ridurre il rischio di documento troppo grande.
- `src/hooks/useCloudSync.ts`: i path `applyCloudAsCurrent`, `resolveConflict('fresh')` e il salvataggio debounced devono trattare in modo esplicito i nuovi campi di storico.
- `src/lib/cloudDataService.ts`: se esiste cancellazione dati cloud, deve continuare a considerare un unico documento `gameState` che ora include anche lo storico.
- `src/lib/GameState.ts`: definire default difensivi per stato legacy privo di storico.
- Rischio da presidiare: limite dimensionale del documento Firestore. Il cap a 10 snapshot e parte della mitigazione, non un dettaglio opzionale.

## Implementation Notes For Delivery Team
- Preferire un'estensione di `GameState` con `gameHistory` embedded invece di introdurre una nuova collection Firestore o chiavi localStorage multiple in questa iterazione.
- Introdurre helper puri nel dominio, ad esempio per `archiveCurrentGame`, `restoreArchivedGame`, `trimGameHistory`, `sanitizeArchivedSnapshot`.
- Mantenere compatibilita con il flusso attuale in cui una partita vuota all'avvio mostra il dialogo iniziale.
- Per la lista storico, riusare il dialogo esistente e aggiungere solo le props minime necessarie: elenco storico e callback di resume.
- Per la validazione e sufficiente build/typecheck piu verifica manuale del flusso browser; il repository non espone una test suite automatizzata dedicata.

## Delivery Validation
- Verifica manuale: nuova partita con stato corrente non vuoto archivia correttamente lo stato precedente.
- Verifica manuale: apertura del dialogo mostra lo storico e consente il resume di una partita archiviata.
- Verifica manuale: ripristino da storico riporta round, turn, hero state e automatic mode esattamente come salvati.
- Verifica manuale: dopo oltre 10 archiviazioni restano solo le 10 piu recenti.
- Verifica manuale: refresh browser mantiene corrente e storico.
- Verifica manuale: con login attivo, corrente e storico si sincronizzano tra due sessioni senza shape invalido.
