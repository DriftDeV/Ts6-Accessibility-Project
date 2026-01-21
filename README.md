# TeamSpeak 6 Accessibility Injector

Questo progetto mira a migliorare l'accessibilità del client **TeamSpeak 6**, iniettando script che ottimizzano la navigazione da tastiera e la compatibilità con gli screen reader.

## 📋 Requisiti Preliminari

1.  **TeamSpeak 6 Client** installato sul sistema.
2.  **Python 3.8** (o superiore) installato.
    *   *Windows*: Scaricalo dal [sito ufficiale](https://www.python.org/downloads/) o dal Microsoft Store.
    *   *Mac/Linux*: Solitamente preinstallato, verifica con `python3 --version`.

---

## 🪟 Windows

### 1. Prima Installazione (Setup)
Apri la cartella del progetto, clicca con il tasto destro in uno spazio vuoto e seleziona **"Apri nel Terminale"** (o apri PowerShell).

Esegui questo comando per configurare tutto automaticamente:
```powershell
.\setup.ps1
```
> **Nota:** Se vedi un errore rosso riguardante i permessi, incolla questo comando e premi Invio, poi riprova il setup:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`

### 2. Avvio (Uso Quotidiano)
Una volta fatto il setup, per avviare il tool ti basterà eseguire:
```powershell
.\run.ps1
```

---

## 🐧 Linux / 🍎 macOS

### 🍎 macOS (Metodo Semplificato)
Per avviare rapidamente l'injector su macOS:
1.  Fai doppio clic sul file **`start_teamspeak.command`** presente nella cartella principale.
2.  Se è la prima volta, lo script eseguirà automaticamente il setup necessario.
3.  **Nota Importante:** Alla prima esecuzione, macOS potrebbe bloccare lo script per motivi di sicurezza. Per aprirlo:
    *   Fai **clic destro** (o Control-clic) su `start_teamspeak.command`.
    *   Seleziona **Apri** dal menu contestuale.
    *   Clicca su **Apri** nella finestra di dialogo di conferma.

### 🐧 Linux / 🍎 macOS (Terminale)

### 1. Prima Installazione
Apri il terminale nella cartella del progetto ed esegui il comando:
```bash
make setup
```
Questo creerà l'ambiente virtuale e installerà le dipendenze necessarie.

### 2. Avvio
Per avviare l'injector:
```bash
make run
```

---

## ⚠️ Risoluzione Problemi e Note Importanti

### TeamSpeak deve essere chiuso all'avvio
Lo script prova ad avviare TeamSpeak automaticamente in "modalità debug". Assicurati che TeamSpeak sia **completamente chiuso** prima di lanciare `run.ps1` o `make run`.

### Avvio Manuale (Se l'automatico fallisce)
Se lo script non riesce ad aprire TeamSpeak, devi avviarlo manualmente da terminale aggiungendo il flag per il debug:

*   **Windows**:
    ```powershell
    "C:\Program Files\TeamSpeak\TeamSpeak.exe" --remote-debugging-port=9222
    ```
*   **macOS**:
    ```bash
    /Applications/TeamSpeak.app/Contents/MacOS/TeamSpeak --remote-debugging-port=9222
    ```
*   **Linux**:
    ```bash
    flatpak run com.teamspeak.TeamSpeak --remote-debugging-port=9222
    # Oppure se installato nativamente:
    teamspeak --remote-debugging-port=9222
    ```

Una volta aperto TeamSpeak manualmente in questo modo, esegui lo script di avvio (`.\run.ps1` o `make run`) e si collegherà automaticamente.

---
---

# Manuale Sviluppo Accessibilità

Guida strategica per l'iniezione di accessibilità nel client TeamSpeak 6.
*(Aggiornato basandosi sul DOM dump del 20/01/2026)*

## Architettura del Sistema

Il sistema utilizza `enhanced_accessibility.js` per scansionare il DOM in tempo reale. A causa della natura dinamica di Vue.js (framework usato da TS6), gli elementi vengono creati e distrutti continuamente. Il nostro script usa un `MutationObserver` per riapplicare le regole quando necessario.

### Il Cuore: Array di Regole
Ogni modifica è definita come una regola:

```javascript
{
    name: "Nome Regola",
    selector: ".classe-target",
    match: (el) => condizione_booleana(el), // Filtro logico (opzionale)
    apply: (el) => azione_di_modifica(el)
}
```

**Dettaglio Parametro `match`:**
La funzione `match` (el => boolean) agisce come filtro secondario. Restituisce `true` se la regola deve essere applicata, permettendo controlli logici avanzati (es. testo, attributi) che i selettori CSS non coprono.


### 🔍 Dettaglio Parametro `match`
Il parametro `match` è una funzione di filtro (callback) che determina se la regola deve essere applicata all'elemento trovato dal `selector`.

**Sintassi:** `match: (el) => condizione`

*   **`el`**: Rappresenta l'elemento HTML trovato. È un oggetto DOM standard su cui puoi usare proprietà come `.textContent`, `.getAttribute()`, `.classList`, ecc.
*   **Ritorno**: Deve sempre restituire un booleano (`true` o `false`). Se restituisce `true`, la funzione `apply` viene eseguita.

#### Casi d'uso comuni:
1.  **Sempre Attivo**: `match: (el) => true`
2.  **Filtro per Testo**: `match: (el) => el.textContent.includes('Impostazioni')`
3.  **Filtro per Attributi**: `match: (el) => el.getAttribute('name') === 'settings'`
4.  **Filtro per Struttura**: `match: (el) => el.querySelector('svg') !== null`

## Strategie Specifiche per TeamSpeak (Analisi DOM)

Analizzando lo snapshot del DOM, abbiamo identificato pattern specifici che richiedono intervento immediato. Ecco le strategie consigliate.

### 1. Pulsanti Icona nella Sidebar (Header)
La sidebar contiene icone di notifica e altri controlli che sono privi di testo.
**Pattern Rilevato:** Un `div.tsv-action` contiene un `div.tsv-magnify` che contiene l'`svg`.

**STRATEGIA:** Non etichettare l'SVG (che ha `role="presentation"`), ma il contenitore interattivo padre.

```javascript
{
    name: "Pulsante Notifiche Header",
    selector: ".tsv-action", 
    match: (el) => el.querySelector('.tsv-icon-notifications'),
    apply: (el) => {
        safeSetAttr(el, 'aria-label', 'Notifiche');
        safeSetAttr(el, 'role', 'button');
        safeSetAttr(el, 'tabindex', '0');
    }
}
```

### 2. Liste Virtuali e Stato Contatti
TeamSpeak usa una **Virtual List** (`.tsv-virtual-list`) per i contatti. Questo significa che esistono nel DOM solo i contatti visibili. Le regole devono essere leggere per non rallentare lo scroll.
**Problema:** Lo stato "Online" è indicato solo visivamente da una classe (`.tsv-icon-contact-status-online`) o un'icona colore.

**STRATEGIA:** Cercare l'indicatore di stato e aggiungere l'informazione testuale al contenitore del contatto.

```javascript
{
    name: "Stato Contatto (Online)",
    selector: ".ts-room-list-item", // O .contact-list-entry
    match: (el) => el.querySelector('.tsv-icon-contact-status-online'),
    apply: (el) => {
        // Aggiungiamo lo stato alla label esistente o creiamo una descrizione
        let currentLabel = el.getAttribute('aria-label') || el.innerText;
        if (!currentLabel.includes('Online')) {
             safeSetAttr(el, 'aria-label', currentLabel + ", Online");
        }
    }
}
```

### 3. Elementi Espandibili (Accordion)
Le sezioni "Bookmarks", "Contacts", "Group Chats" sono espandibili.
**Pattern Rilevato:** Elementi con classe `.ts-expander` contenenti `.tsv-icon-item-expand`.

```javascript
{
    name: "Toggle Espansione Sezioni",
    selector: ".ts-expander",
    apply: (el) => {
        safeSetAttr(el, 'role', 'button');
        safeSetAttr(el, 'aria-label', 'Espandi/Comprimi sezione');
        // Idealmente dovremmo controllare se è espanso guardando classi o attributi vicini
    }
}
```

### 4. Input di Ricerca
L'input di ricerca `input.tsv-search-input` ha un placeholder ma potrebbe mancare di una label accessibile permanente.

```javascript
{
    name: "Input Ricerca Principale",
    selector: "input.tsv-search-input",
    apply: (el) => {
        safeSetAttr(el, 'aria-label', 'Cerca o Connetti');
    }
}
```

## Pattern Generici (Reference)

### Aggiungere Etichette (aria-label)
```javascript
apply: (el) => {
    safeSetAttr(el, 'aria-label', 'Impostazioni');
    safeSetAttr(el, 'role', 'button');
}
```

### Nascondere Elementi (aria-hidden)
```javascript
apply: (el) => {
    safeSetAttr(el, 'aria-hidden', 'true');
}
```

## Flusso di Lavoro

**Ciclo di Sviluppo:**
1.  Esegui il dump del DOM corrente se non sei sicuro della struttura (`python dump_dom.py`).
2.  Analizza il file HTML generato nella cartella `dumps/dom/`.
3.  Crea una nuova regola in `enhanced_accessibility.js` basata sui selettori trovati.
4.  Riavvia l'injector (`python ts_master.py`).
5.  Verifica con uno screen reader o ispezionando il DOM live.

```