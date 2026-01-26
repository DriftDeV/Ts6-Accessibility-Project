// improved_accessibility.js
// Optimized for VoiceOver and screen reader compatibility
// Uses rule-based approach with improved magnetic focus

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
        if (el.getAttribute(attr) !== val) {
            el.setAttribute(attr, val);
        }
    }

    // --- TTS Module ---
    const TTS = {
        speaking: false,
        enabled: true, 
        
        announce: function (text, priority = 'polite') {
            const liveRegion = document.getElementById('ts-a11y-live-region');
            if (liveRegion) {
                liveRegion.setAttribute('aria-live', priority);
                liveRegion.textContent = text;
                setTimeout(() => { liveRegion.textContent = ''; }, 2000);
            }
        }
    };

    function createLiveRegion() {
        if (!document.getElementById('ts-a11y-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'ts-a11y-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
    }

    // --- Magnetic Focus Configuration ---
    
    const magneticFocusTargets = [
        // 1. Context Menus (Highest Priority)
        {
            selector: '.ts-context-menu',
            check: (el) => isVisible(el),
            target: (el) => el.querySelector('.tsv-item, [role="menuitem"]'),
            message: "Context Menu"
        },
        // 2. Modals / Dialogs
        {
            selector: '.tsv-modal-container',
            check: (el) => isVisible(el) && !el.closest('.hidden'),
            target: (el) => el.querySelector('input, button, [tabindex="0"]'),
            message: "Dialog Open"
        },
        // 3. Server Tree (Main View) - CRITICAL for user request
        {
            selector: '.tsv-view.tsv-activity-main',
            check: (el) => isVisible(el) && !document.querySelector('.ts-context-menu'),
            target: (el) => {
                // Try to find the focused/selected channel first
                let target = el.querySelector('.ts-server-tree-item-leaf.channel.tsv-selected');
                // Fallback to the first channel/spacer
                if (!target) target = el.querySelector('.ts-server-tree-item-leaf');
                // Fallback to the scroller container
                if (!target) target = el.querySelector('.ts-server-tree-wrapper');
                return target;
            },
            message: "Server Browser"
        },
        // 4. Initial Setup Screens
        {
            selector: '.ts-first-launch-splash',
            check: (el) => isVisible(el),
            target: (el) => el.querySelector('button'),
            message: "Welcome Screen"
        }
    ];

    // --- Focus Management ---

    function handleMagneticFocus(mutations) {
        // Debounce focus checks to avoid thrashing
        if (window.__ts_focus_timer) clearTimeout(window.__ts_focus_timer);
        
        window.__ts_focus_timer = setTimeout(() => {
            // If user is already interacting with something important, don't steal focus
            const active = document.activeElement;
            if (active && (
                active.tagName === 'INPUT' || 
                active.tagName === 'TEXTAREA' || 
                active.getAttribute('role') === 'menuitem' ||
                active.closest('.ts-context-menu')
            )) {
                return;
            }

            // Iterate targets by priority
            for (const rule of magneticFocusTargets) {
                const elements = document.querySelectorAll(rule.selector);
                for (const el of elements) {
                    if (rule.check(el)) {
                        const target = rule.target(el);
                        if (target) {
                            // Check if we are already inside the target area
                            if (el.contains(active)) return;

                            safeSetAttr(target, 'tabindex', '-1'); // Ensure focusable
                            target.focus();
                            console.log(`[A11y] Magnetic Focus -> ${rule.message}`);
                            TTS.announce(rule.message);
                            return; // Stop after first match
                        }
                    }
                }
            }
        }, 150);
    }

    function isVisible(el) {
        return el && (el.offsetParent !== null);
    }

    // --- Vue Router & Page Transitions ---

    function hookRouter(app) {
        if (!app.$router || app.__a11y_router_hooked) return;
        app.__a11y_router_hooked = true;

        app.$router.afterEach((to, from) => {
            // Apply rules immediately on route change
            setTimeout(() => {
                applyRules(document);
                // Trigger magnetic focus check explicitly
                handleMagneticFocus([]);
            }, 300);
        });
    }

    // --- Rule Application ---

    function applyRules(root) {
        if (!window.tsA11yRules) return;
        
        window.tsA11yRules.forEach(rule => {
            try {
                root.querySelectorAll(rule.selector).forEach(el => {
                    if (rule.match(el)) rule.apply(el);
                });
            } catch (e) {
                console.error(e);
            }
        });
        
        injectStyles();
    }

    function injectStyles() {
        if (document.getElementById('ts-a11y-styles')) return;
        const css = `
            .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
            :focus { outline: 3px solid #00AAFF !important; outline-offset: 2px !important; z-index: 1000; }
            [role="treeitem"]:focus { background-color: rgba(0, 170, 255, 0.2) !important; }
        `;
        const style = document.createElement('style');
        style.id = 'ts-a11y-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // --- Initialization ---

    function init() {
        console.log('[A11y] Init...');
        createLiveRegion();
        applyRules(document);

        // Watch for DOM changes (Vue renders, Popups)
        const observer = new MutationObserver((mutations) => {
            applyRules(document); // Re-apply attributes
            handleMagneticFocus(mutations); // Check focus
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
        });

        // Try to hook router
        const checkApp = setInterval(() => {
            const app = document.getElementById('app')?.__vue__;
            if (app && app.$router) {
                hookRouter(app);
                clearInterval(checkApp);
            }
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
