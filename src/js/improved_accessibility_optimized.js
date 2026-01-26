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
        announce: function (text, priority = 'polite') {
            let liveRegion = document.getElementById('ts-a11y-live-region');
            if (!liveRegion) {
                createLiveRegion();
                liveRegion = document.getElementById('ts-a11y-live-region');
            }
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
            liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
            document.body.appendChild(liveRegion);
        }
    }

    // --- Magnetic Focus Configuration ---
    
    function isVisible(el) {
        return el && (el.offsetParent !== null);
    }

    const magneticFocusTargets = [
        {
            selector: '.ts-context-menu',
            check: (el) => isVisible(el),
            target: (el) => el.querySelector('.tsv-item, [role="menuitem"]'),
            message: "Context Menu"
        },
        {
            selector: '.tsv-modal-container',
            check: (el) => isVisible(el) && !el.closest('.hidden'),
            target: (el) => el.querySelector('input, button, [tabindex="0"]'),
            message: "Dialog Open"
        },
        {
            selector: '.tsv-view.tsv-activity-main',
            check: (el) => isVisible(el) && !document.querySelector('.ts-context-menu'),
            target: (el) => {
                let target = el.querySelector('.ts-server-tree-item-leaf.channel.tsv-selected');
                if (!target) target = el.querySelector('.ts-server-tree-item-leaf');
                if (!target) target = el.querySelector('.ts-server-tree-wrapper');
                return target;
            },
            message: "Server Browser"
        }
    ];

    // --- Focus Management ---

    function handleMagneticFocus(mutations) {
        if (window.__ts_focus_timer) clearTimeout(window.__ts_focus_timer);
        
        window.__ts_focus_timer = setTimeout(() => {
            const active = document.activeElement;
            if (active && (
                active.tagName === 'INPUT' || 
                active.tagName === 'TEXTAREA' || 
                active.getAttribute('role') === 'menuitem' ||
                active.closest('.ts-context-menu')
            )) {
                return;
            }

            for (const rule of magneticFocusTargets) {
                const elements = document.querySelectorAll(rule.selector);
                for (const el of elements) {
                    if (rule.check(el)) {
                        const target = rule.target(el);
                        if (target) {
                            if (el.contains(active)) return;
                            safeSetAttr(target, 'tabindex', '-1');
                            target.focus();
                            console.log(`[A11y] Focus -> ${rule.message}`);
                            TTS.announce(rule.message);
                            return; 
                        }
                    }
                }
            }
        }, 150);
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
        `;
        const style = document.createElement('style');
        style.id = 'ts-a11y-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function hookRouter(app) {
        if (!app.$router || app.__a11y_router_hooked) return;
        app.__a11y_router_hooked = true;
        app.$router.afterEach(() => {
            setTimeout(() => {
                applyRules(document);
                handleMagneticFocus([]);
            }, 300);
        });
        console.log('[A11y] Router hooked.');
    }

    // --- Initialization ---

    function init() {
        console.log('[A11y] Initializing...');
        createLiveRegion();
        applyRules(document);

        const observer = new MutationObserver((mutations) => {
            const hasNodes = mutations.some(m => m.type === 'childList' && m.addedNodes.length > 0);
            if (hasNodes) {
                applyRules(document);
                handleMagneticFocus(mutations);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
        });

        // Try to hook router (Merged logic)
        const checkApp = setInterval(() => {
            const appEl = document.getElementById('app');
            const app = appEl ? appEl.__vue__ : null;
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
