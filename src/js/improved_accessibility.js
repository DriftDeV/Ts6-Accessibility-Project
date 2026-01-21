// improved_accessibility.js
// Consolidates logic from myAccess.js, accessibility.js, and enhanced_accessibility.js
// Uses a rule-based approach for maintainability and performance.

(function () {
    if (window.__teamspeak_a11y_active) {
        console.log('[A11y] Accessibility module already active.');
        return;
    }
    window.__teamspeak_a11y_active = true;
    console.log('[A11y] Improved Accessibility Module Starting...');

    // --- Helper Functions ---

    function safeSetAttr(el, attr, val) {
        if (!el) return;
        // Avoid setting if already set to the same value to reduce DOM mutation noise
        if (el.getAttribute(attr) !== val) {
            el.setAttribute(attr, val);
        }
    }

    function safeRemoveAttr(el, attr) {
        if (!el) return;
        if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
        }
    }

    // --- TTS Module (from enhanced_accessibility.js) ---
    const TTS = {
        speaking: false,
        speak: function(text) {
            if (!text) return;
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0; 
            utterance.onstart = () => { this.speaking = true; };
            utterance.onend = () => { this.speaking = false; };
            window.speechSynthesis.speak(utterance);
            console.log(`[A11y] Speaking: "${text}"`);
        },
        announce: function(text) {
            this.speak(text);
        }
    };

    // --- Vue Router Interceptor (from enhanced_accessibility.js) ---
    function findVueRoot() {
        const ids = ['app', 'ts-app-main', 'ts-app-loading-overlay'];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el && el.__vue__) return el.__vue__;
        }
        // Fallback walker
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while (node = walker.nextNode()) {
            if (node.__vue__ && node.__vue__.$router) return node.__vue__;
        }
        return null;
    }

    function hookRouter(app) {
        if (!app.$router || app.__a11y_router_hooked) return;
        app.__a11y_router_hooked = true;
        
        app.$router.afterEach((to, from) => {
            let pageName = to.name || "Unknown Page";
            if (to.path === '/') pageName = "Home";
            else if (to.path.includes('settings')) pageName = "Settings";
            else if (to.path.includes('chat')) pageName = "Chat";
            
            TTS.announce(`Navigated to ${pageName}`);
            setTimeout(() => applyRules(document), 500); 
        });
        TTS.announce("TeamSpeak Accessibility Loaded. Current page: " + (app.$route.name || "Home"));
    }

    // --- Accessibility Rules ---
    // The "const rules" method requested.
    
    const rules = [
        // --- Headers & Structural ---
        {
            name: "Main Header Logo",
            selector: ".ts-title-logo",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '1');
                safeSetAttr(el, 'aria-label', 'TeamSpeak Home');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Sidebar Banner",
            selector: ".tsv-header.tsv-highlight.tsv-sidebar-header",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'banner');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Settings Title",
            selector: ".tsv-settings-title",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '2');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Sidebar Tab Headers",
            selector: ".v-popper.tsv-sidebar-tab-header",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '3');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        
        // --- Navigation & Groups ---
        {
            name: "Resources Section",
            selector: ".resources-section-container.tsv-flex-grow",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server/Chats');
            }
        },
        {
            name: "Widget Wrapper (Group)",
            selector: ".ts-widget-wrapper",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                const titleEl = el.querySelector(".ts-widget-section-header .title");
                if (titleEl) {
                    safeSetAttr(el, 'aria-label', titleEl.textContent);
                }
            }
        },
        {
            name: "Server Tree Scroller",
            selector: ".vue-recycle-scroller.scroller.ts-server-tree-scroller",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server Channels');
            }
        },

        // --- Lists (Bookmarks, Contacts) ---
        {
            name: "Bookmark List Container",
            selector: ".bookmarks",
            match: () => true,
            apply: (el) => safeSetAttr(el, 'role', 'list')
        },
        {
            name: "Contact List Container",
            selector: ".ts-contact-list",
            match: () => true,
            apply: (el) => safeSetAttr(el, 'role', 'list')
        },
        {
            name: "List Items (Virtual List / Contacts)",
            selector: ".tsv-virtual-list-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                safeSetAttr(el, 'tabindex', '0');
                const textEl = el.querySelector(".tsv-text-truncate");
                if (textEl) {
                    safeSetAttr(el, 'aria-label', textEl.textContent);
                }
            }
        },
        {
            name: "Bookmark Entry",
            selector: ".tsv-item.ts-bookmark-entry",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                // Hide icon stack
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');
                
                // Label extraction
                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent : 'Bookmark';
                safeSetAttr(el, 'aria-label', label);
            }
        },

        // --- Inputs & Controls ---
        {
            name: "Search Input",
            selector: ".tsv-search-input, input.tsv-search-input",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'searchbox');
                safeSetAttr(el, 'aria-label', 'Search or Connect');
            }
        },
        {
            name: "Create Community Button",
            selector: ".tsv-button-content.tsv-flex.tsv-flex-snd-center.ts-font-small",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Expand/Collapse",
            selector: ".ts-expander",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Toggle Section');
            }
        },
        {
            name: "Context Menu Toggle",
            selector: ".tsv-tool-button-context-menu-toggle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'More Options');
            }
        },
        {
            name: "Resize Handle",
            selector: ".tsv-resize-handle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                safeSetAttr(el, 'aria-hidden', 'true');
            }
        },
        
        // --- Specific Icons / Buttons ---
        {
            name: "Action Buttons (Subtle)",
            selector: ".tsv-bar-item.tsv-action-subtle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'tabindex', '0');
                const svg = el.querySelector('svg');
                if (svg) {
                    const name = svg.getAttribute('name');
                    if (name) {
                        safeSetAttr(el, 'role', 'button');
                        safeSetAttr(el, 'aria-label', name); // 'settings', 'window-minimize', etc.
                    }
                }
            }
        },
        {
            name: "Talk Power Status",
            selector: ".ts-server-tree-active-status__item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'aria-label', 'Talk Power Grant/Revoke');
            }
        },
        {
            name: "Badges/Icons",
            selector: ".ts-server-tree-inactive-status, .tsv-icon.tsv-icon-stack",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'img');
                // Avoid tabindex on static images unless they have tooltip info
                // safeSetAttr(el, 'tabindex', '0'); 
                const svg = el.querySelector('svg');
                const label = (svg && svg.getAttribute('name')) || 'Icon';
                safeSetAttr(el, 'aria-label', label);
            }
        },

        // --- Cleanup Rules (Negative Tabindex) ---
        {
            name: "Remove Tabindex for Virtual Lists",
            selector: ".tsv-virtual-list",
            match: () => true,
            apply: (el) => safeRemoveAttr(el, 'tabindex')
        },
        {
            name: "Remove Tabindex for Header Accessories",
            selector: ".tsv-bar-item.tsv-sidebar-header-accessories",
            match: () => true,
            apply: (el) => safeRemoveAttr(el, 'tabindex')
        },

        // --- Generic Fallback (Must be last) ---
        {
            name: "Generic Button Fallback",
            selector: ".tsv-action, .tsv-button",
            match: (el) => !el.hasAttribute('aria-label') && el.querySelector('svg'),
            apply: (el) => {
                const svg = el.querySelector('svg');
                if (svg) {
                    const name = svg.getAttribute('name') || 'Action';
                    safeSetAttr(el, 'role', 'button');
                    safeSetAttr(el, 'tabindex', '0');
                    safeSetAttr(el, 'aria-label', name);
                }
            }
        }
    ];

    function applyRules(root) {
        rules.forEach(rule => {
            try {
                const elements = root.querySelectorAll(rule.selector);
                elements.forEach(el => {
                    if (rule.match(el)) {
                        rule.apply(el);
                    }
                });
            } catch (e) {
                console.warn(`[A11y] Error in rule ${rule.name}:`, e);
            }
        });

        // Inject Focus Styles
        if (!document.getElementById('ts-a11y-style')) {
            const style = document.createElement('style');
            style.id = 'ts-a11y-style';
            style.textContent = `
                :focus { 
                    outline: 3px solid #0056b3 !important; 
                    outline-offset: 2px; 
                    z-index: 9999;
                }
                [role="button"] { cursor: pointer; }
            `;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    // --- Initialization ---

    function init() {
        // 1. Hook Router
        let app = findVueRoot();
        if (app) {
            hookRouter(app);
        } else {
            let attempts = 0;
            const timer = setInterval(() => {
                app = findVueRoot();
                if (app) {
                    clearInterval(timer);
                    hookRouter(app);
                } else if (++attempts > 20) {
                    clearInterval(timer);
                }
            }, 500);
        }

        // 2. Initial Apply
        applyRules(document);

        // 3. Observer
        const observer = new MutationObserver(() => {
            // Debounce could be added if performance issues arise
            applyRules(document);
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
        
        // Expose for debugging
        window.__ts_force_a11y = () => applyRules(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
