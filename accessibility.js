// accessibility.js
// Payload da iniettare. Si occupa di aggiungere aria-label/role/tabindex dove utile
// e di osservare il DOM per applicare le regole anche a elementi creati dinamicamente.

(function () {
  if (window.__teamspeak_a11y_injected) return;
  window.__teamspeak_a11y_injected = true;
  console.log('[a11y] Accessibility injector running');

  function safeSetAttr(el, attr, val) {
    try {
      if (!el) return;
      if (el.getAttribute && !el.getAttribute(attr)) el.setAttribute(attr, val);
    } catch (e) {
      // ignore
    }
  }

  function applyA11y(root = document) {
    try {
      // Esempio: icone nella barra superiore
      root.querySelectorAll('.tsv-bar-item.tsv-action').forEach((el) => {
        if (!el) return;
        const hasRole = el.getAttribute && el.getAttribute('role');
        const svg = el.querySelector('svg');
        if (svg && !hasRole) {
          safeSetAttr(el, 'role', 'button');
          safeSetAttr(el, 'tabindex', '0');
          // prova a derivare un aria-label intelligente dal title o dall'attributo name sull'SVG
          const label = svg.getAttribute('name') || el.getAttribute('title') || 'Action';
          safeSetAttr(el, 'aria-label', label);
        } 
    });

      // Search input
      root.querySelectorAll('.tsv-search-input, input.tsv-search-input').forEach((input) => {
        safeSetAttr(input, 'role', 'searchbox');
        safeSetAttr(input, 'aria-label', 'Search or Connect');
      });

      // Aggiungi focus visibile se manca
      const styleId = 'teamspeak-a11y-focus-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `:focus { outline: 3px solid #1a73e8 !important; outline-offset: 2px; }`;
        document.head.appendChild(style);
      }

      // Aggiungi più regole personalizzate qui per menu, liste, canali, pulsanti, ecc.
    } catch (e) {
      console.error('[a11y] applyA11y error', e);
    }
  }

  // Applica subito
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyA11y(document));
  } else {
    applyA11y(document);
  }

  // Observer per SPA / DOM dinamico
  const observer = new MutationObserver((mutations) => {
    // Puoi ottimizzare verificando targets specifici delle mutation records
    applyA11y(document);
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // Esporre funzione per debug
  window.__teamspeak_applyA11y = applyA11y;

  console.log('[a11y] Injector installed (MutationObserver active)');
})();