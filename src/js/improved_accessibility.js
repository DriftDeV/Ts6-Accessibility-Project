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
    // Rules are now loaded from accessibility_rules.js
    
    const rules = window.tsA11yRules || [];

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
                    outline: 3px solid #d9ff00 !important; 
                    outline-offset: 2px; 
                    z-index: 9999;
                }
                [role="button"] { cursor: pointer; }
            `;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    // --- Keyboard Interaction Handling ---
    function handleKeyboardActivation(e) {
        // Only handle Enter (13) or Space (32)
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const el = e.target;
        if (!el) return;

        // check if element is natively interactive to avoid double-handling
        const tagName = el.tagName.toLowerCase();
        if (tagName === 'button' || tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;
        if (tagName === 'a' && el.hasAttribute('href')) return; 

        // Check for relevant roles
        const role = el.getAttribute('role');
        const interactiveRoles = ['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'tab', 'switch', 'checkbox', 'radio', 'treeitem'];
        
        if (role && interactiveRoles.includes(role)) {
            // Prevent scrolling for Space
            if (e.key === ' ') {
                e.preventDefault();
            }
            
            // Trigger click
            // Create a synthetic click event to ensure event bubbling works as expected
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(clickEvent);
            console.log(`[A11y] Simulated click on ${role}`);
        }
    }

    // --- Initialization ---

    function init() {
        // 0. Setup Global Listeners
        document.addEventListener('keydown', handleKeyboardActivation);

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
