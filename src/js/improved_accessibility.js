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
        speak: function (text) {
            if (!text) return;
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.onstart = () => { this.speaking = true; };
            utterance.onend = () => { this.speaking = false; };
            window.speechSynthesis.speak(utterance);
            console.log(`[A11y] Speaking: "${text}"`);
        },
        announce: function (text) {
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

            setTimeout(() => {
                applyRules(document);

                // Automatic Focus Management
                // If focus is already on a meaningful element (likely set by Magnetic Focus), don't override it.
                if (document.activeElement && 
                    document.activeElement !== document.body && 
                    document.activeElement.id !== 'app' &&
                    !document.activeElement.classList.contains('ts-app-main')) {
                    console.log('[A11y] Focus already active on:', document.activeElement, '- skipping generic router focus.');
                    return;
                }

                let mainFocus = document.querySelector('[role="main"], .ts-title-logo, [role="heading"]');
                if (!mainFocus) mainFocus = document.getElementById('app');

                if (mainFocus) {
                    safeSetAttr(mainFocus, 'tabindex', '-1');
                    mainFocus.focus();
                    console.log(`[A11y] Focus moved to ${mainFocus.tagName} for navigation to ${pageName}`);
                }
            }, 500);
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

    // --- Magnetic Focus Logic ---
    function handleMagneticFocus(mutations) {
        for (const mutation of mutations) {
            // Case 1: New Elements Added
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return; // Elements only

                    // 1. Context Menu (Newly injected)
                    if (node.matches('.ts-context-menu') || node.querySelector('.ts-context-menu')) {
                        const target = node.matches('.ts-context-menu') ? node : node.querySelector('.ts-context-menu');
                        if (target.style.visibility !== 'hidden' && target.style.display !== 'none') {
                            focusElement(target, "Context Menu");
                        }
                    }

                    // 2. Settings Header (Navigation)
                    if (node.matches('.tsv-settings-title') || node.querySelector('.tsv-settings-title')) {
                        const target = node.matches('.tsv-settings-title') ? node : node.querySelector('.tsv-settings-title');
                        focusElement(target, "Settings Section");
                    }

                    // 3. Server Tree (Connection/Entry)
                    if (node.matches('.tsv-view.tsv-activity-main') || node.querySelector('.tsv-view.tsv-activity-main')) {
                        const target = node.matches('.tsv-view.tsv-activity-main') ? node : node.querySelector('.tsv-view.tsv-activity-main');
                        focusElement(target, "Server List");
                    }
                    // 4. Screen Share Settings Window
                    if (node.matches('.tsv-flex-column.tsv-modal-container') || node.querySelector('.tsv-flex-column.tsv-modal-container')) {
                        const target = node.matches('.tsv-flex-column.tsv-modal-container') ? node : node.querySelector('.tsv-flex-column.tsv-modal-container');
                        focusElement(target, "Screen Share Settings");
                    }

                    // 5. Initial Splash Screen
                    if (node.matches('.ts-first-launch-splash') || node.querySelector('.ts-first-launch-splash')) {
                        const splash = node.matches('.ts-first-launch-splash') ? node : node.querySelector('.ts-first-launch-splash');
                        const button = splash.querySelector('.ts-first-launch-splash-button .tsv-button');
                        if (button) focusElement(button, "Get Started Button");
                    }

                    // 6. Create Account - Waiting for Email
                    if (node.matches('.ts-first-launch-create-myts-pending') || node.querySelector('.ts-first-launch-create-myts-pending')) {
                        const pending = node.matches('.ts-first-launch-create-myts-pending') ? node : node.querySelector('.ts-first-launch-create-myts-pending');
                        const heading = pending.querySelector('.ts-first-launch-subtitle');
                        if (heading) focusElement(heading, "Waiting for Email Confirmation");
                    }

                    // 7. Account Created Screen
                    if (node.matches('.ts-first-launch-create-myts-final') || node.querySelector('.ts-first-launch-create-myts-final')) {
                        const final = node.matches('.ts-first-launch-create-myts-final') ? node : node.querySelector('.ts-first-launch-create-myts-final');
                        const heading = final.querySelector('.ts-first-launch-subtitle');
                        if (heading) focusElement(heading, "Account Created!");
                    }

                    // 8. Account Recovery Key
                    if (node.matches('.ts-first-launch-backup-key-container') || node.querySelector('.ts-first-launch-backup-key-container')) {
                        const container = node.matches('.ts-first-launch-backup-key-container') ? node : node.querySelector('.ts-first-launch-backup-key-container');
                        const heading = container.querySelector('.ts-first-launch-title');
                        if (heading) focusElement(heading, "Account Recovery Key");
                    }

                    // 9. Pick a Theme
                    if (node.matches('.ts-first-launch-pick-theme-container') || node.querySelector('.ts-first-launch-pick-theme-container')) {
                        const container = node.matches('.ts-first-launch-pick-theme-container') ? node : node.querySelector('.ts-first-launch-pick-theme-container');
                        const heading = container.querySelector('.ts-first-launch-title');
                        if (heading) focusElement(heading, "Pick a Theme");
                    }

                    // 10. Setup Finished
                    if (node.matches('.ts-first-launch-finish') || node.querySelector('.ts-first-launch-finish')) {
                        const container = node.matches('.ts-first-launch-finish') ? node : node.querySelector('.ts-first-launch-finish');
                        const heading = container.querySelector('.ts-first-launch-subtitle');
                        if (heading) focusElement(heading, "Setup Finished");
                    }
                });
            } 
            // Case 2: Visibility Changes (Attributes)
            else if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                const target = mutation.target;
                
                // Context Menu Visibility Toggle
                if (target.matches('.ts-context-menu')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        focusElement(target, "Context Menu");
                    }
                }

                // Server Tree Visibility Toggle
                if (target.matches('.tsv-view.tsv-activity-main')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        focusElement(target, "Server List");
                    }
                }
                // Screen Share Settings Window Visibility Toggle
                if (target.matches('.tsv-flex-column.tsv-modal-container')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        focusElement(target, "Screen Share Settings");
                    }
                }

                // Initial Splash Screen Visibility Toggle
                if (target.matches('.ts-first-launch-splash')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        const button = target.querySelector('.ts-first-launch-splash-button .tsv-button');
                        if (button) focusElement(button, "Get Started Button");
                    }
                }

                // Create Account - Waiting for Email Visibility Toggle
                if (target.matches('.ts-first-launch-create-myts-pending')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        const heading = target.querySelector('.ts-first-launch-subtitle');
                        if (heading) focusElement(heading, "Waiting for Email Confirmation");
                    }
                }

                // Account Created Screen Visibility Toggle
                if (target.matches('.ts-first-launch-create-myts-final')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        const heading = target.querySelector('.ts-first-launch-subtitle');
                        if (heading) focusElement(heading, "Account Created!");
                    }
                }

                // Account Recovery Key Visibility Toggle
                if (target.matches('.ts-first-launch-backup-key-container')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                         const heading = target.querySelector('.ts-first-launch-title');
                        if (heading) focusElement(heading, "Account Recovery Key");
                    }
                }

                // Pick a Theme Visibility Toggle
                if (target.matches('.ts-first-launch-pick-theme-container')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        const heading = target.querySelector('.ts-first-launch-title');
                        if (heading) focusElement(heading, "Pick a Theme");
                    }
                }

                // Setup Finished Visibility Toggle
                if (target.matches('.ts-first-launch-finish')) {
                    const isVisible = target.style.visibility !== 'hidden' && target.style.display !== 'none';
                    if (isVisible) {
                        const heading = target.querySelector('.ts-first-launch-subtitle');
                        if (heading) focusElement(heading, "Setup Finished");
                    }
                }
            }
        }
    }

    function focusElement(el, label) {
        if (!el) return;
        // Small delay to ensure rendering is complete
        setTimeout(() => {
            // Avoid re-focusing if already there
            if (document.activeElement && (document.activeElement === el || el.contains(document.activeElement))) return;

            // Specific Logic for Context Menus: Prefer the first item
            if (label === "Context Menu") {
                const firstItem = el.querySelector('[role="menuitem"], .tsv-item-container');
                if (firstItem) el = firstItem;
            }

            if (!el.getAttribute('tabindex') || el.getAttribute('tabindex') === '-1') {
                safeSetAttr(el, 'tabindex', '-1');
            }
            
            el.focus();
            console.log(`[A11y] Magnetic Focus pulled to: ${label}`);
            // Optional: Announce if not already covered by ARIA live regions
            // TTS.announce(label); 
        }, 100);
    }

    // --- Initialization ---

    function init() {
        // 0. Setup Global Listeners
        document.addEventListener('keydown', handleKeyboardActivation);

        // 0b. Magnetic Focus for Settings Menu
        document.addEventListener('click', (e) => {
             // Check if clicked element is a settings menu item
            const settingsItem = e.target.closest('.tsv-settings-categories .tsv-item');
            if (settingsItem) {
                // Wait for the new section to render
                setTimeout(() => {
                    // Target the Right Section Content
                    const rightSection = document.querySelector('.tsv-settings-subcategory');
                    if (rightSection) {
                        // Priority 1: The first section header title
                        let target = rightSection.querySelector('.ts-widget-section-header .title');
                        // Priority 2: The first section header container
                        if (!target) target = rightSection.querySelector('.ts-widget-section-header');
                        // Priority 3: The section itself
                        if (!target) target = rightSection;

                        if (target) {
                            focusElement(target, "Settings Content Category");
                        }
                    }
                }, 200);
            }
        });

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
        const observer = new MutationObserver((mutations) => {
            handleMagneticFocus(mutations);
            // Re-apply rules on structure changes
            // We verify if we really need to run applyRules to save performance
            const needsReapply = mutations.some(m => m.type === 'childList');
            if (needsReapply) {
                applyRules(document);
            }
        });
        
        observer.observe(document.body || document.documentElement, { 
            childList: true, 
            subtree: true, 
            attributes: true, 
            attributeFilter: ['style', 'class', 'hidden'] // Watch for visibility changes
        });

        // Expose for debugging
        window.__ts_force_a11y = () => applyRules(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
