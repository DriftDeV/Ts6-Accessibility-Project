// accessibility.js
// Payload da iniettare. Si occupa di aggiungere aria-label/role/tabindex dove utile
// e di osservare il DOM per applicare le regole anche a elementi creati dinamicamente.

(function () {
  function safeSetAttr(el, attr, val) {
    try {
      if (!el) return;
      // usa hasAttribute per distinguere "assenza" da valore vuoto
      if (el.getAttribute && !el.hasAttribute(attr)) el.setAttribute(attr, val);
    } catch (e) {
      // ignore
    }
  }

  function applyA11y(root = document) {
    try {
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
        root.querySelectorAll('.ts-title-logo').forEach((el) => {
          safeSetAttr (el, 'tabindex', '0')
          safeSetAttr(el, 'role', 'heading');
          safeSetAttr(el, 'aria-label', 'Teamspeak');
      });
        root.querySelectorAll('.tsv-search-input, input.tsv-search-input').forEach((input) => {
          safeSetAttr(input, 'role', 'searchbox');
          safeSetAttr(input, 'aria-label', 'Search or Connect');
      });
        root.querySelectorAll('.tsv-text-truncate').forEach((input) => {
          safeSetAttr(input, 'role', 'text');
      });
        root.querySelectorAll('.tsv-bar-item.tsv-action-subtle').forEach((input) => {
          safeSetAttr(input, 'tabindex', '0');
          const svg = input.querySelector('svg');
          if (svg && svg.getAttribute('name') === 'settings') {
            safeSetAttr(input, 'role', 'button');
            safeSetAttr(input, 'aria-label', 'Settings');
          }
          if (svg && svg.getAttribute('name') === 'window-minimize') {
            safeSetAttr(input, 'role', 'button');
            safeSetAttr(input, 'aria-label', 'minimize');
          }
          if (svg && svg.getAttribute('name') === 'window-maximize') {
            safeSetAttr(input, 'role', 'button');
            safeSetAttr(input, 'aria-label', 'maximize');
          }
          if (svg && svg.getAttribute('name') === 'window-close') {
            safeSetAttr(input, 'role', 'button');
            safeSetAttr(input, 'aria-label', 'close');
          }
        });
      });

      root.querySelectorAll('.ts-sidebar-tab-sub-panel-accessory').forEach((el) => {
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
        root.querySelectorAll('.ts-server-tree-active-status__item').forEach((el) => {
          safeSetAttr(el, 'role', 'button');
          safeSetAttr(el, 'aria-label', 'Talk-power Grant/Revoke');
      });
        root.querySelectorAll('.ts-server-tree-inactive-status').forEach((el) => {
          safeSetAttr(el, 'role', 'img');
          safeSetAttr(el, 'aria-label', 'Server Group roles/Badges');
      });
      });

      root.querySelectorAll('.tsv-icon.tsv-icon-stack').forEach((el) => {
        if (!el) return;
        const hasRole = el.getAttribute && el.getAttribute('role');
        const svg = el.querySelector('svg');
        if (svg && !hasRole) {
          safeSetAttr(el, 'role', 'img');
          safeSetAttr(el, 'tabindex', '0');
          // prova a derivare un aria-label intelligente dal title o dall'attributo name sull'SVG
          const label = svg.getAttribute('name') || el.getAttribute('title') || 'Action';
          safeSetAttr(el, 'aria-label', label);
        }
      });

      root.querySelectorAll('.ts-expander.tsv-tab-item').forEach((el) => {
        if (!el) return;
        const hasRole = el.getAttribute && el.getAttribute('role');
        const svg = el.querySelector('svg');
        if (svg && !hasRole) {
          safeSetAttr(el, 'role', 'img');
          safeSetAttr(el, 'tabindex', '0');
          // prova a derivare un aria-label intelligente dal title o dall'attributo name sull'SVG
          const label = svg.getAttribute('name') || el.getAttribute('title') || 'Action';
          safeSetAttr(el, 'aria-label', label);
        }
      });
      root.querySelectorAll('.tsv-tool-button-context-menu-toggle').forEach((el) => {
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

      let sett_header = root.querySelector(".tsv-settings-title")
      safeSetAttr(sett_header, 'tabindex', '0')
      safeSetAttr(sett_header, 'role', 'heading')
      safeSetAttr(sett_header, 'aria-label', 'Settings-Title')

      root.querySelectorAll(".v-popper.tsv-sidebar-tab-header").forEach((el) => {
          if (!el) return;
          safeSetAttr(el, 'role', 'heading');
          safeSetAttr(el, 'tabindex', '0');
        });
      
      // Aggiungi focus visibile se manca
      const styleId = 'teamspeak-a11y-focus-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `:focus { outline: 3px solid #2370b4ff !important; outline-offset: 2px; }`;
        // document.head può essere null in alcuni contesti; fallback
        (document.head || document.documentElement).appendChild(style);
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
  const observer = new MutationObserver(() => {
    // Puoi ottimizzare verificando targets specifici delle mutation records
    applyA11y(document);
  });
  const observeTarget = document.documentElement || document.body || document;
  observer.observe(observeTarget, { childList: true, subtree: true });

  // Esporre funzione per debug
  window.__teamspeak_applyA11y = applyA11y;

  console.log('[a11y] Injector installed (MutationObserver active)');
})();