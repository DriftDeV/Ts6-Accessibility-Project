// injector.js
// Usage: node injector.js
// Requires: npm i chrome-remote-interface

const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');

const REMOTE_DEBUG_PORT = 9222;
const RECONNECT_INTERVAL_MS = 3000;
const RULES_PATH = path.join(__dirname, 'accessibility_rules.js');
const MAIN_SCRIPT_PATH = path.join(__dirname, 'improved_accessibility.js');

let stop = false;

async function connectAndInject() {
  while (!stop) {
    try {
      // Connetti al CDP (primo tab disponibile)
      const client = await CDP({ port: REMOTE_DEBUG_PORT });
      console.log('[injector] Connected to CDP');

      const { Page, Runtime } = client;

      await Page.enable();

      // Leggi il payload JS da iniettare
      const rulesSource = fs.readFileSync(RULES_PATH, 'utf8');
      const mainSource = fs.readFileSync(MAIN_SCRIPT_PATH, 'utf8');
      const scriptSource = rulesSource + "\n" + mainSource;

      // 1) Assicurati che lo script venga eseguito in tutti i nuovi document (prima che la pagina esegua i suoi script)
      const { identifier } = await Page.addScriptToEvaluateOnNewDocument({ source: scriptSource });
      console.log(`[injector] Script registered (id=${identifier}) to evaluate on new documents`);

      // 2) Esegui subito lo stesso script anche nell'eventuale pagina già caricata
      try {
        await Runtime.evaluate({ expression: `(function(){ ${scriptSource} })()` , userGesture: true, awaitPromise: false });
        console.log('[injector] Script evaluated on current context');
      } catch (e) {
        console.warn('[injector] Runtime.evaluate error (may be ok if no page context yet)', e.message);
      }

      // Mantieni la connessione attiva e ricollegati se il target chiude
      client.on('disconnect', () => {
        console.log('[injector] CDP disconnected, will retry...');
      });

      // Non chiudere il client a meno che non venga richiesto; reinizializza su disconnect
      await new Promise((resolve) => client.on('disconnect', resolve));

    } catch (err) {
      console.error('[injector] Connection error:', err.message || err);
      await new Promise((r) => setTimeout(r, RECONNECT_INTERVAL_MS));
    }
  }
}

process.on('SIGINT', () => {
  console.log('Stopped by user');
  stop = true;
  process.exit(0);
});

connectAndInject().catch((err) => console.error(err));