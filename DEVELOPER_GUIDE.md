# Guida allo Sviluppo per Ts6-Accessibility-Project

Benvenuto nella guida per sviluppatori del progetto **Ts6-Accessibility-Project**. Questo documento è pensato per chiunque voglia contribuire a migliorare l'accessibilità del client TeamSpeak 5, spiegando l'architettura del progetto e fornendo istruzioni passo-passo su come aggiungere nuove funzionalità.

---

## 🏗️ Architettura del Progetto

Il progetto utilizza un approccio "ibrido" per iniettare codice JavaScript nel client TeamSpeak, che è basato su tecnologie web (Chromium/CEF).

1.  **Python Backend (`src/ts_master.py`):**
    *   Avvia il client TeamSpeak con il flag `--remote-debugging-port=9222`.
    *   Si connette all'interfaccia di debug (Chrome DevTools Protocol) tramite WebSocket.
    *   Iniettare lo script principale (`improved_accessibility.js`) nel contesto del browser di TeamSpeak.

2.  **JavaScript Frontend (`src/js/improved_accessibility.js`):**
    *   È il "cuore" dell'accessibilità.
    *   Utilizza un **MutationObserver** per monitorare i cambiamenti nel DOM.
    *   Applica una serie di **regole** predefinite per aggiungere attributi ARIA (`role`, `aria-label`, `tabindex`) agli elementi dell'interfaccia.
    *   Gestisce la navigazione tramite tastiera e il feedback vocale (TTS).

---

## 🧠 Il Core: `improved_accessibility.js`

Il file più importante da modificare è `src/js/improved_accessibility.js`. Questo script è progettato per essere modulare e basato su regole.

### Il Sistema a Regole

Invece di scrivere codice spaghetti che cerca elementi a caso, usiamo un array `const rules`. Ogni regola è un oggetto che definisce **cosa** cercare e **come** renderlo accessibile.

#### Struttura di una Regola

```javascript
{
    name: "Nome Descrittivo della Regola",
    selector: ".classe-css-elemento", // Selettore CSS per trovare l'elemento
    match: (el) => true, // Funzione booleana per filtri extra (opzionale)
    apply: (el) => {
        // Logica per applicare l'accessibilità
        safeSetAttr(el, 'role', 'button');
        safeSetAttr(el, 'aria-label', 'Descrizione per screen reader');
    }
}
```

*   **`name`**: Utile per il debug (appare nei log se qualcosa va storto).
*   **`selector`**: Una stringa CSS standard (es. `.tsv-button`, `#header`).
*   **`match`**: Una funzione che riceve l'elemento trovato (`el`). Deve restituire `true` se la regola deve essere applicata. Utile per distinguere elementi che hanno la stessa classe ma contenuto diverso.
*   **`apply`**: La funzione che modifica fisicamente il DOM. Usa sempre le helper functions come `safeSetAttr` per evitare loop infiniti o errori.

---

## 🛠️ Come Aggiungere Nuove Regole

Se trovi una parte di TeamSpeak non accessibile (es. un pulsante che non viene letto dallo screen reader), segui questi passaggi:

### 1. Analizza il DOM
Poiché non puoi fare "Ispeziona Elemento" facilmente dentro TeamSpeak, usa lo strumento incluso `src/dump_dom.py`.

1.  Avvia TeamSpeak e naviga nella schermata che ti interessa.
2.  Esegui lo script:
    ```bash
    python3 src/dump_dom.py
    ```
3.  Premi `Invio` per salvare uno snapshot dell'HTML corrente nella cartella `dumps/dom/`.
4.  Apri il file `.html` generato con un editor di testo o un browser per trovare le classi CSS dell'elemento.

### 2. Crea la Regola
Aggiungi un nuovo oggetto all'array `rules` in `src/js/improved_accessibility.js`.

**Esempio:** Supponiamo di voler rendere accessibile un pulsante "Muta Microfono" che ha la classe `.btn-mute`.

```javascript
{
    name: "Pulsante Muta Microfono",
    selector: ".btn-mute",
    match: () => true, // Si applica a tutti gli elementi con questa classe
    apply: (el) => {
        safeSetAttr(el, 'role', 'button');
        safeSetAttr(el, 'tabindex', '0'); // Rende l'elemento focusabile
        
        // Cerca di capire se è attivo o no guardando le classi figlie o attributi
        const isMuted = el.classList.contains('is-active');
        safeSetAttr(el, 'aria-label', isMuted ? 'Riattiva Microfono' : 'Muta Microfono');
        safeSetAttr(el, 'aria-pressed', isMuted ? 'true' : 'false');
    }
}
```

### 3. Testa le Modifiche
1.  Salva il file `src/js/improved_accessibility.js`.
2.  Riavvia lo script principale:
    ```bash
    python3 src/ts_master.py
    ```
3.  TeamSpeak si riavvierà con le nuove regole iniettate.

---

## 🧰 Utility Functions

All'interno di `improved_accessibility.js` sono disponibili funzioni helper per rendere il codice più pulito e sicuro:

*   **`safeSetAttr(el, attr, val)`**: Imposta un attributo solo se il valore è diverso da quello attuale. Fondamentale per evitare che il MutationObserver entri in un loop infinito rilevando le nostre stesse modifiche.
*   **`safeRemoveAttr(el, attr)`**: Rimuove un attributo in sicurezza.
*   **`TTS.speak(text)`**: Fa pronunciare una frase alla sintesi vocale.
*   **`findVueRoot()`**: Tenta di trovare l'istanza principale di Vue.js (utile per intercettare il Router).

---

## 🐛 Debugging con VS Code

Se vuoi usare il debugger di VS Code (tramite MS Edge Tools) per impostare breakpoint nel codice JavaScript iniettato, devi avviare lo script Python in modalità "detach".

Questo perché il protocollo di debug di Chrome (CDP) supporta solitamente una sola connessione attiva. Se lo script Python rimane connesso per monitorare i log, VS Code non può collegarsi.

### Procedura:

1.  **Avvia TeamSpeak con il flag `--detach`**:
    ```bash
    python3 src/ts_master.py --detach
    ```
    Lo script avvierà TeamSpeak, inietterà le regole di accessibilità e poi si disconnetterà immediatamente.

2.  **Avvia il Debugger in VS Code**:
    *   Vai nella tab "Run and Debug" di VS Code.
    *   Seleziona la configurazione **"Attach to TeamSpeak (CEF)"**.
    *   Premi Play (F5).

Ora dovresti essere in grado di mettere breakpoint in `src/js/improved_accessibility.js` o `src/js/accessibility_rules.js` e debuggare il codice in tempo reale.

---

## 🔍 Strumenti di Debugging

Il progetto include script Python nella cartella `src/` per aiutarti a capire cosa succede "sotto il cofano".

| Script | Descrizione |
| :--- | :--- |
| `ts_master.py` | Lo script principale. Lancia TS e inietta il codice. |
| `dump_dom.py` | Salva l'intero HTML della pagina corrente di TS. Essenziale per trovare selettori CSS. |
| `dump_resources.py` | Scarica tutti i file JS/CSS caricati da TeamSpeak. Utile per analizzare il codice sorgente originale del client. |
| `injector.py` | Una versione standalone dell'iniettore, utile per testare iniezioni al volo senza riavviare TS (richiede TS già avviato con debug port). |

---

## 📚 Link Utili e Riferimenti

Per scrivere buone regole di accessibilità, è fondamentale conoscere gli standard web.

*   **MDN - ARIA Roles**: [Elenco completo dei ruoli ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles) (es. `button`, `heading`, `listitem`).
*   **MDN - ARIA Attributes**: [Elenco degli stati e proprietà](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes) (es. `aria-label`, `aria-hidden`, `aria-expanded`).
*   **Chrome DevTools Protocol**: [Documentazione CDP](https://chromedevtools.github.io/devtools-protocol/). Utile se vuoi modificare come Python interagisce con TeamSpeak.

---

## 🤝 Consigli per la Contribuzione

1.  **Sii Specifico**: Cerca di usare selettori CSS il più specifici possibile per evitare di modificare elementi sbagliati.
2.  **Performance**: Il `MutationObserver` scatta spesso. Le regole devono essere veloci. Evita calcoli pesanti dentro `apply`.
3.  **Non Rompere Vue**: TeamSpeak è scritto in Vue.js. Modifica solo gli attributi DOM (`role`, `aria-*`). Evita di rimuovere elementi o cambiare classi che potrebbero rompere la logica interna di Vue.
