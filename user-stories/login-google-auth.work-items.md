# Login & Google Auth Integration - Product Backlog Items

Questo documento scompone il PRD in Product Backlog Items pronti per Azure DevOps. Ogni PBI e' scritto come user story piccola e verticale, secondo INVEST, con acceptance criteria in Gherkin che coprono happy path ed edge case.

## PBI 1. Configurare autenticazione Firebase lato client

**Titolo**  
Configurare il client Firebase e la sessione autenticata persistente

**Description**  
Come giocatore che usa l'app su piu' sessioni,  
voglio che l'app inizializzi correttamente il client di autenticazione e ripristini in automatico la mia sessione,  
cosi' da non dover ripetere il login ad ogni refresh e da avere una base stabile per le funzionalita' cloud.

**Note**  
Questo PBI copre solo la base tecnica per inizializzare Firebase Auth e osservare lo stato utente. Non include ancora il pulsante di login, la UI del profilo o la sincronizzazione del gioco.

**Acceptance Criteria**

```gherkin
Scenario: Ripristino automatico della sessione autenticata
  Given un utente si e' autenticato in una sessione precedente
  When l'app viene ricaricata
  Then lo stato di autenticazione viene ripristinato automaticamente
  And l'app rende disponibile il profilo utente alla UI senza richiedere un nuovo login manuale

Scenario: Avvio dell'app senza utente autenticato
  Given nessuna sessione autenticata e' presente
  When l'app viene aperta
  Then l'app si avvia in modalita' anonima
  And le funzionalita' locali restano disponibili

Scenario: Errore di configurazione Firebase
  Given la configurazione Firebase e' assente o non valida
  When l'app inizializza il layer di autenticazione
  Then l'app non va in crash
  And l'utente resta in modalita' anonima
  And viene reso disponibile un feedback di errore gestibile dagli sviluppatori
```

## PBI 2. Abilitare il login con Google con fallback robusto

**Titolo**  
Consentire il Sign in with Google con fallback da popup a redirect

**Description**  
Come giocatore anonimo,  
voglio poter accedere con il mio account Google in modo rapido e senza form,  
cosi' da iniziare a usare le funzionalita' personali e cloud con il minimo attrito.

**Note**  
Il PBI comprende il comando di login, la gestione degli errori utente e il fallback quando il popup viene bloccato. Non include ancora l'esposizione del profilo nel layout.

**Acceptance Criteria**

```gherkin
Scenario: Login Google completato con popup
  Given un utente anonimo e' nella schermata principale
  When seleziona l'azione di accesso con Google
  Then si apre il flusso di autenticazione Google
  And al completamento l'utente risulta autenticato nell'app

Scenario: Popup bloccato dal browser
  Given un utente anonimo tenta il login
  And il browser blocca il popup di autenticazione
  When il tentativo popup fallisce
  Then l'app ripiega automaticamente sul flusso di redirect
  And l'utente puo' completare il login senza dover cambiare manualmente impostazioni

Scenario: Login annullato dall'utente
  Given un utente anonimo ha avviato il login Google
  When annulla o chiude il flusso di autenticazione
  Then l'app resta in modalita' anonima
  And il gioco locale continua a essere utilizzabile
```

## PBI 3. Rendere l'header consapevole dello stato di autenticazione

**Titolo**  
Mostrare nell'header lo stato signed-out o signed-in

**Description**  
Come giocatore,  
voglio vedere nell'header se sono anonimo o autenticato e avere un accesso rapido alle azioni account,  
cosi' da capire subito il mio stato e raggiungere facilmente il profilo.

**Note**  
Il PBI riguarda il comportamento dell'header nei due stati principali. Non include ancora i dettagli completi del pannello profilo.

**Acceptance Criteria**

```gherkin
Scenario: Header in stato signed-out
  Given l'utente non e' autenticato
  When l'app mostra l'header
  Then l'header visualizza una call to action per il login
  And non mostra avatar o nome utente

Scenario: Header in stato signed-in
  Given l'utente e' autenticato
  When l'app mostra l'header
  Then l'header visualizza avatar e display name dell'utente
  And il comando di login non e' piu' visibile

Scenario: Cambio di stato auth durante la sessione
  Given l'header e' visibile
  When lo stato di autenticazione cambia da anonimo ad autenticato o viceversa
  Then l'header si aggiorna senza richiedere un refresh della pagina
```

## PBI 4. Supportare accesso tastiera al login e al profilo

**Titolo**  
Abilitare shortcut e navigazione tastiera per login e profilo

**Description**  
Come giocatore che usa l'app in modalita' keyboard-first,  
voglio poter aprire login o profilo con shortcut e comandi accessibili da tastiera,  
cosi' da mantenere coerenza con l'esperienza esistente dell'app.

**Note**  
Il focus e' su accessibilita' e shortcut globale dedicata all'autenticazione. Il comportamento deve rispettare lo stato corrente dell'utente.

**Acceptance Criteria**

```gherkin
Scenario: Shortcut apre login per utente anonimo
  Given l'utente non e' autenticato
  When preme Ctrl+L o Cmd+L
  Then l'app avvia il flusso di login o apre il relativo entry point

Scenario: Shortcut apre il profilo per utente autenticato
  Given l'utente e' autenticato
  When preme Ctrl+L o Cmd+L
  Then l'app apre il pannello profilo utente

Scenario: Accesso tastiera agli elementi auth dell'header
  Given l'header e' visibile
  When l'utente naviga con il tasto Tab e conferma con Enter o Space
  Then il pulsante di login o il trigger del profilo e' utilizzabile senza mouse
```

## PBI 5. Mostrare e gestire il profilo utente

**Titolo**  
Aprire un pannello profilo con dati Google e azione di sign out

**Description**  
Come giocatore autenticato,  
voglio visualizzare il mio profilo e poter uscire dall'account senza perdere i dati locali,  
cosi' da gestire la mia identita' in app in modo chiaro e reversibile.

**Note**  
Il PBI copre avatar, nome, email e sign out. Le preferenze e le statistiche dettagliate sono trattate in PBI separati.

**Acceptance Criteria**

```gherkin
Scenario: Apertura pannello profilo
  Given l'utente e' autenticato
  When apre il profilo dall'header
  Then viene mostrato un pannello laterale con avatar, display name ed email

Scenario: Sign out preservando il gioco locale
  Given l'utente e' autenticato
  And esiste uno stato di gioco salvato in locale
  When seleziona l'azione di sign out
  Then l'utente viene disconnesso
  And l'app torna in modalita' anonima
  And il gioco locale resta disponibile sul dispositivo

Scenario: Chiusura standard del pannello
  Given il pannello profilo e' aperto
  When l'utente preme Escape o attiva il comando di chiusura
  Then il pannello si chiude
```

## PBI 6. Salvare e ricaricare le preferenze utente nel cloud

**Titolo**  
Persistire le preferenze utente tra sessioni e dispositivi

**Description**  
Come giocatore autenticato,  
voglio salvare nel cloud le mie preferenze personali,  
cosi' da ritrovarle automaticamente quando torno nell'app o cambio dispositivo.

**Note**  
Le preferenze minime richieste sono il toggle di cloud sync e il default della modalita' automatica. Il PBI copre lettura, modifica e riapplicazione delle preferenze.

**Acceptance Criteria**

```gherkin
Scenario: Salvataggio delle preferenze utente
  Given l'utente e' autenticato
  When modifica una preferenza supportata nel pannello profilo
  Then la nuova preferenza viene salvata nel profilo cloud dell'utente

Scenario: Ripristino preferenze al login successivo
  Given l'utente ha preferenze gia' salvate nel cloud
  When effettua il login in una nuova sessione o su un altro dispositivo
  Then l'app ricarica e applica automaticamente tali preferenze

Scenario: Cloud sync disabilitato dall'utente
  Given l'utente e' autenticato
  When disattiva la preferenza di cloud sync
  Then l'app interrompe i salvataggi automatici verso il cloud
  And la persistenza locale continua a funzionare
```

## PBI 7. Sincronizzare automaticamente il game state autenticato

**Titolo**  
Sincronizzare il game state nel cloud senza interrompere il salvataggio locale

**Description**  
Come giocatore autenticato,  
voglio che le modifiche al mio gioco vengano salvate localmente e sincronizzate in cloud in modo trasparente,  
cosi' da non perdere progressi e poter riprendere da altri dispositivi.

**Note**  
Il PBI include il salvataggio locale come comportamento sempre prioritario, piu' la sincronizzazione cloud debounce quando l'utente e' autenticato e la feature e' attiva.

**Acceptance Criteria**

```gherkin
Scenario: Salvataggio locale immediato e sync cloud differito
  Given l'utente e' autenticato
  And il cloud sync e' abilitato
  When modifica il game state
  Then il nuovo stato viene salvato immediatamente in locale
  And la sincronizzazione cloud viene avviata in modo differito senza bloccare l'interazione

Scenario: Utente anonimo o sync disabilitato
  Given l'utente e' anonimo oppure ha disattivato il cloud sync
  When modifica il game state
  Then il nuovo stato viene salvato solo in locale
  And non viene eseguita alcuna scrittura cloud

Scenario: Mancanza temporanea di rete durante il salvataggio
  Given l'utente e' autenticato
  And il cloud sync e' abilitato
  And la rete non e' disponibile
  When modifica il game state
  Then il salvataggio locale avviene comunque
  And il sistema conserva la possibilita' di sincronizzare il dato quando la connettivita' ritorna
```

## PBI 8. Esprimere visivamente lo stato di sincronizzazione

**Titolo**  
Mostrare nell'header lo stato di sync cloud in modo non invasivo

**Description**  
Come giocatore autenticato,  
voglio vedere se il mio stato e' in sync, in corso di sync o offline,  
cosi' da avere fiducia nel salvataggio cross-device senza disturbare il gameplay.

**Note**  
Il PBI copre solo la visualizzazione dello stato e le transizioni principali. Non introduce nuove azioni utente.

**Acceptance Criteria**

```gherkin
Scenario: Indicatore visibile per utente autenticato
  Given l'utente e' autenticato
  When l'header viene renderizzato
  Then l'indicatore di sync e' visibile

Scenario: Stato syncing e stato synced
  Given l'utente e' autenticato
  And una modifica del game state richiede una scrittura cloud
  When la sincronizzazione parte e poi termina con successo
  Then l'indicatore mostra prima lo stato syncing
  And successivamente mostra lo stato synced

Scenario: Stato offline o errore di connessione
  Given l'utente e' autenticato
  When l'app rileva assenza di rete o impossibilita' temporanea di sincronizzare
  Then l'indicatore mostra uno stato offline o equivalente
  And il resto dell'app resta utilizzabile
```

## PBI 9. Gestire il conflitto tra stato locale e stato cloud

**Titolo**  
Risolvere i conflitti tra partita locale e partita cloud al momento del login

**Description**  
Come giocatore che usa piu' dispositivi o riprende una partita dopo tempo,  
voglio che l'app riconosca quale stato e' piu' recente e mi chieda conferma nei casi ambigui,  
cosi' da evitare perdite di dati e mantenere il controllo sulla versione corretta.

**Note**  
Il PBI copre confronto timestamp, caricamento automatico dei casi semplici e scelta esplicita quando la versione cloud e' piu' recente o il conflitto richiede decisione utente.

**Acceptance Criteria**

```gherkin
Scenario: Stato cloud piu' recente dello stato locale
  Given esistono sia uno stato locale sia uno stato cloud per lo stesso utente
  And lo stato cloud e' piu' recente
  When l'utente effettua il login
  Then l'app propone esplicitamente di caricare lo stato cloud oppure mantenere quello locale

Scenario: Stato locale piu' recente dello stato cloud
  Given esistono sia uno stato locale sia uno stato cloud per lo stesso utente
  And lo stato locale e' piu' recente
  When l'utente effettua il login
  Then l'app mantiene lo stato locale come fonte corrente
  And prepara l'aggiornamento del cloud senza richiedere una scelta manuale

Scenario: Nessun dato perso durante la risoluzione del conflitto
  Given l'utente sta scegliendo tra stato locale e cloud
  When completa la scelta
  Then viene caricata solo la versione selezionata
  And l'altra versione non viene distrutta implicitamente durante la decisione
```

## PBI 10. Proporre l'accesso nell'empty state senza bloccare il gioco

**Titolo**  
Arricchire l'empty state con una CTA secondaria di login e recupero partita cloud

**Description**  
Come nuovo giocatore o giocatore non autenticato con app vuota,  
voglio vedere un invito discreto al login accanto all'avvio di una nuova partita,  
cosi' da poter scegliere se iniziare subito oppure attivare la sincronizzazione cross-device senza interrompere il flusso principale.

**Note**  
Questo PBI mantiene la creazione nuova partita come azione primaria. Include anche il caso in cui il login riveli una partita cloud gia' disponibile.

**Acceptance Criteria**

```gherkin
Scenario: Empty state con CTA secondaria di login
  Given non esistono eroi nella partita corrente
  And l'utente non e' autenticato
  When l'app mostra lo splash o empty state
  Then e' disponibile l'azione primaria per iniziare una nuova partita
  And e' disponibile una CTA secondaria per accedere e sincronizzare

Scenario: Login da empty state con partita cloud disponibile
  Given l'utente e' nell'empty state
  And nel cloud esiste una partita associata al suo account
  When completa il login
  Then l'app propone di caricare la partita cloud trovata

Scenario: Login promosso in modo non intrusivo
  Given l'utente sceglie di ignorare la CTA di login nell'empty state
  When continua a usare l'app in quella sessione
  Then puo' iniziare una nuova partita senza blocchi
  And la promozione login non interrompe nuovamente il flusso corrente
```

## PBI 11. Tracciare e mostrare statistiche utente nel profilo

**Titolo**  
Calcolare e mostrare nel profilo le statistiche principali del giocatore

**Description**  
Come giocatore autenticato,  
voglio vedere nel profilo alcune statistiche aggregate del mio utilizzo,  
cosi' da percepire il profilo come personale e utile oltre al solo accesso tecnico.

**Note**  
Le statistiche minime richieste sono totale partite giocate, totale eroi creati e totale devour rolls. Il PBI copre sia il salvataggio sia la visualizzazione.

**Acceptance Criteria**

```gherkin
Scenario: Visualizzazione statistiche disponibili nel profilo
  Given l'utente e' autenticato
  And esistono statistiche gia' registrate per il suo account
  When apre il pannello profilo
  Then vede i principali contatori personali richiesti dal prodotto

Scenario: Aggiornamento statistiche a fronte di eventi di gioco
  Given l'utente e' autenticato
  When compie un'azione di gioco che aggiorna una statistica tracciata
  Then il nuovo valore viene registrato nel profilo cloud dell'utente

Scenario: Profilo di un utente senza statistiche pregresse
  Given l'utente e' autenticato per la prima volta
  When apre il pannello profilo
  Then il pannello mostra valori iniziali validi e non genera errori di rendering
```

## PBI 12. Consentire la cancellazione irreversibile dei dati cloud

**Titolo**  
Permettere all'utente di eliminare i propri dati cloud con doppia conferma

**Description**  
Come giocatore autenticato,  
voglio poter cancellare in modo esplicito e sicuro i miei dati salvati nel cloud,  
cosi' da mantenere controllo sui miei dati personali e sulla cronologia di gioco.

**Note**  
Il PBI comprende il comando dal profilo, la doppia conferma e la rimozione dei dati cloud dell'utente. Il gioco locale sul dispositivo non deve essere eliminato salvo scelta separata.

**Acceptance Criteria**

```gherkin
Scenario: Cancellazione dati cloud confermata
  Given l'utente e' autenticato
  And nel cloud esistono dati profilo o partita associati al suo account
  When attiva la cancellazione dati e conferma il secondo passaggio di sicurezza
  Then i dati cloud dell'utente vengono eliminati
  And l'utente riceve conferma dell'operazione completata

Scenario: Cancellazione annullata prima della conferma finale
  Given l'utente ha avviato la cancellazione dei dati cloud
  When annulla uno dei passaggi di conferma
  Then nessun dato cloud viene eliminato

Scenario: Preservazione del dato locale dopo cancellazione cloud
  Given l'utente ha dati locali sul dispositivo
  When completa la cancellazione dei dati cloud
  Then il dato locale resta disponibile sul dispositivo
  And l'utente puo' continuare a usare l'app in locale
```

## Suggerimento di ordinamento backlog

1. PBI 1 - Configurare autenticazione Firebase lato client
2. PBI 2 - Abilitare il login con Google con fallback robusto
3. PBI 3 - Rendere l'header consapevole dello stato di autenticazione
4. PBI 4 - Supportare accesso tastiera al login e al profilo
5. PBI 5 - Mostrare e gestire il profilo utente
6. PBI 6 - Salvare e ricaricare le preferenze utente nel cloud
7. PBI 7 - Sincronizzare automaticamente il game state autenticato
8. PBI 8 - Esprimere visivamente lo stato di sincronizzazione
9. PBI 9 - Gestire il conflitto tra stato locale e stato cloud
10. PBI 10 - Proporre l'accesso nell'empty state senza bloccare il gioco
11. PBI 11 - Tracciare e mostrare statistiche utente nel profilo
12. PBI 12 - Consentire la cancellazione irreversibile dei dati cloud
