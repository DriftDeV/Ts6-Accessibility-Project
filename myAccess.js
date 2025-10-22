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
      //pulsanti / intestazioni
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
        // Creo Banner
        root.querySelectorAll('.tsv-header.tsv-highlight.tsv-sidebar-header').forEach(element => {
          safeSetAttr(element, "role", "banner")
          safeSetAttr(element, "tabindex", "0")
        });
        //Etichetto Pulsanti come "create teamspeak community" come Pulsante
        root.querySelectorAll(".tsv-button-content.tsv-flex.tsv-flex-snd-center.ts-font-small").forEach(element =>{
          safeSetAttr(element, "tabindex", "0")
          safeSetAttr(element, "role", "button")
        });
        //Aggiungo Intestazione
        root.querySelectorAll('.ts-title-logo').forEach((el) => {
          safeSetAttr (el, 'tabindex', '0');
          safeSetAttr(el, 'role', 'heading');
          safeSetAttr(el, 'aria-label', 'Teamspeak');
      });
        root.querySelectorAll('.tsv-search-input, input.tsv-search-input').forEach((input) => {
          safeSetAttr(input, 'role', 'search');
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
      //pulsanti SVG
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
      //Icone
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
      //Tasti per espandere/Contrarre
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
      //Menu di Espansione dei pulsanti
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
      //Settings Section
      let sett_header = root.querySelector(".tsv-settings-title")
      safeSetAttr(sett_header, 'tabindex', '0')
      safeSetAttr(sett_header, 'role', 'heading')
      safeSetAttr(sett_header, 'aria-label', 'Settings-Title')
      //Intestazioni sezioni Impostazioni - Barra laterale
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
      //divido in sezioni le tabs principani
      root.querySelectorAll(".resources-section-container.tsv-flex-grow").forEach(element => {
        safeSetAttr(element, "role", "section");
        safeSetAttr(element, "tabindex", "0");
      });
      //divido in gruppi per navigazione più semplificata
      root.querySelectorAll(".ts-widget-wrapper").forEach(element => {
        var level;
        level++;
        var level_tostring = ''+level
        safeSetAttr(element, "role", "group");
        safeSetAttr(element, "tabindex", "0")
        safeSetAttr(element, "aria-label", element.querySelector(".ts-widget-section-header").querySelector(".title").textContent);
        safeSetAttr(element, "aria-level", level_tostring);
      });
      //Aggiongo i separatori
      root.querySelectorAll(".tsv-resize-handle.tsv-resize-handle-section.tsv-resize-handle-bottom").forEach(element => {
        safeSetAttr(element, "role", "separator");
      });

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