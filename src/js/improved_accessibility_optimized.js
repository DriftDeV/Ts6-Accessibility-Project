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

    function safeRemoveAttr(el, attr) {
        if (!el) return;
        if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
        }
    }

    // --- TTS Module ---
    const TTS = {
        speaking: false,
        enabled: true, // Can be toggled by user preference
        
        speak: function (text) {
            if (!text || !this.enabled) return;
            
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onstart = () => { this.speaking = true; };
            utterance.onend = () => { this.speaking = false; };
            utterance.onerror = () => { this.speaking = false; };
            
            window.speechSynthesis.speak(utterance);
            console.log(`[A11y] Speaking: "${text}"`);
        },
        
        announce: function (text, priority = 'polite') {
            // Use ARIA live regions for announcements when available
            const liveRegion = document.getElementById('ts-a11y-live-region');
            if (liveRegion) {
                liveRegion.setAttribute('aria-live', priority);
                liveRegion.textContent = text;
                
                // Clear after announcement
                setTimeout(() => {
                    liveRegion.textContent = '';
                }, 2000);
            }
            
            // Fallback to TTS
            this.speak(text);
        }
    };

    // Create ARIA live region for announcements
    function createLiveRegion() {
        if (!document.getElementById('ts-a11y-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'ts-a11y-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
    }

    // --- Vue Router Interceptor ---
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

            TTS.announce(`Navigated to ${pageName}`, 'assertive');

            setTimeout(() => {
                applyRules(document);

                // Improved focus management
                // Don't override if focus is already on an interactive element
                const activeEl = document.activeElement;
                if (activeEl && activeEl !== document.body) {
                    const isInteractive = activeEl.matches('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
                    const isInModal = activeEl.closest('.tsv-modal-container, .ts-context-menu');
                    
                    if (isInteractive || isInModal) {
                        console.log('[A11y] Focus already on interactive element:', activeEl, '- preserving');
                        return;
                    }
                }

                // Find best focus target for the new page
                let mainFocus = document.querySelector('[role="main"] h1, [role="main"] [role="heading"][aria-level="1"]');
                if (!mainFocus) mainFocus = document.querySelector('[role="main"]');
                if (!mainFocus) mainFocus = document.querySelector('.tsv-settings-title, .ts-title-logo');
                if (!mainFocus) mainFocus = document.getElementById('app');

                if (mainFocus) {
                    if (mainFocus.getAttribute('tabindex') !== '0') {
                        safeSetAttr(mainFocus, 'tabindex', '-1');
                    }
                    mainFocus.focus();
                    console.log(`[A11y] Focus moved to ${mainFocus.tagName} for navigation to ${pageName}`);
                }
            }, 300); // Reduced delay for faster response
        });
        
        TTS.announce("TeamSpeak Accessibility Loaded", 'polite');
    }

    // --- Accessibility Rules ---
    const rules = window.tsA11yRules || [];

    function applyRules(root) {
        if (!root) return;
        
        let appliedCount = 0;
        rules.forEach(rule => {
            try {
                const elements = root.querySelectorAll(rule.selector);
                elements.forEach(el => {
                    if (rule.match(el)) {
                        rule.apply(el);
                        appliedCount++;
                    }
                });
            } catch (e) {
                console.warn(`[A11y] Error in rule ${rule.name}:`, e);
            }
        });

        if (appliedCount > 0) {
            console.log(`[A11y] Applied ${appliedCount} rule modifications`);
        }

        // Inject focus styles
        injectFocusStyles();
    }

    function injectFocusStyles() {
        if (!document.getElementById('ts-a11y-style')) {
            const style = document.createElement('style');
            style.id = 'ts-a11y-style';
            style.textContent = `
                /* High-contrast focus indicator */
                :focus {
                    outline: 3px solid #d9ff00 !important;
                    outline-offset: 2px !important;
                    z-index: 9999 !important;
                }
                
                /* VoiceOver focus ring enhancement */
                :focus-visible {
                    outline: 3px solid #00aaff !important;
                    outline-offset: 3px !important;
                }
                
                /* Button cursor */
                [role="button"], button {
                    cursor: pointer !important;
                }
                
                /* Screen reader only content */
                .sr-only {
                    position: absolute !important;
                    left: -10000px !important;
                    width: 1px !important;
                    height: 1px !important;
                    overflow: hidden !important;
                }
            `;
            (document.head || document.documentElement).appendChild(style);
        }
    }

    // --- Keyboard Interaction Handling ---
    function handleKeyboardActivation(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const el = e.target;
        if (!el) return;

        // Skip native interactive elements
        const tagName = el.tagName.toLowerCase();
        if (tagName === 'button' || tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;
        if (tagName === 'a' && el.hasAttribute('href')) return;

        // Check for ARIA roles
        const role = el.getAttribute('role');
        const interactiveRoles = [
            'button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
            'option', 'tab', 'switch', 'checkbox', 'radio', 'treeitem'
        ];

        if (role && interactiveRoles.includes(role)) {
            // Prevent default for Space to avoid scrolling
            if (e.key === ' ') {
                e.preventDefault();
            }

            // Dispatch synthetic click
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            el.dispatchEvent(clickEvent);
            console.log(`[A11y] Simulated click on ${role} via ${e.key}`);
        }
    }

    // --- Magnetic Focus Logic (Optimized) ---
    const magneticFocusTargets = [
        {
            selector: '.ts-context-menu',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('[role="menuitem"], .tsv-item-container'),
            label: "Context Menu"
        },
        {
            selector: '.tsv-settings-title',
            visibilityCheck: false,
            focusTarget: (el) => el,
            label: "Settings Section"
        },
        {
            selector: '.tsv-view.tsv-activity-main',
            visibilityCheck: false,
            focusTarget: (el) => el,
            label: "Server View"
        },
        {
            selector: '.tsv-flex-column.tsv-modal-container',
            visibilityCheck: true,
            focusTarget: (el) => {
                // Try to focus on first interactive element
                const firstBtn = el.querySelector('button, [role="button"], input, [tabindex="0"]');
                return firstBtn || el;
            },
            label: "Modal Window"
        },
        {
            selector: '.ts-first-launch-splash',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('.ts-first-launch-splash-button .tsv-button'),
            label: "Welcome Screen"
        },
        {
            selector: '.ts-first-launch-create-myts-pending',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('.ts-first-launch-subtitle'),
            label: "Email Verification Pending"
        },
        {
            selector: '.ts-first-launch-create-myts-final',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('.ts-first-launch-subtitle'),
            label: "Account Created"
        },
        {
            selector: '.ts-first-launch-backup-key-container',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('.ts-first-launch-title'),
            label: "Recovery Key"
        },
        {
            selector: '.ts-first-launch-pick-theme-container',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('.ts-first-launch-title'),
            label: "Theme Selection"
        },
        {
            selector: '.ts-first-launch-finish',
            visibilityCheck: true,
            focusTarget: (el) => el.querySelector('.ts-first-launch-subtitle'),
            label: "Setup Complete"
        }
    ];

    function handleMagneticFocus(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;
                    
                    magneticFocusTargets.forEach(target => {
                        const el = node.matches(target.selector) ? node : node.querySelector(target.selector);
                        if (el) {
                            if (!target.visibilityCheck || isVisible(el)) {
                                const focusEl = target.focusTarget(el);
                                if (focusEl) {
                                    focusElement(focusEl, target.label);
                                }
                            }
                        }
                    });
                });
            } else if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                const el = mutation.target;
                
                magneticFocusTargets.forEach(target => {
                    if (el.matches(target.selector) && target.visibilityCheck) {
                        if (isVisible(el)) {
                            const focusEl = target.focusTarget(el);
                            if (focusEl) {
                                focusElement(focusEl, target.label);
                            }
                        }
                    }
                });
            }
        }
    }

    function isVisible(el) {
        if (!el) return false;
        const style = el.style;
        const computedStyle = window.getComputedStyle(el);
        return style.visibility !== 'hidden' && 
               style.display !== 'none' && 
               computedStyle.visibility !== 'hidden' && 
               computedStyle.display !== 'none';
    }

    function focusElement(el, label) {
        if (!el) return;
        
        // Debounce to prevent excessive focus changes
        setTimeout(() => {
            // Verify element is still in DOM and visible
            if (!document.contains(el) || !isVisible(el)) return;
            
            // Don't override if focus is already where we want it
            const activeEl = document.activeElement;
            if (activeEl === el || el.contains(activeEl)) {
                console.log('[A11y] Focus already on target:', label);
                return;
            }

            // Set tabindex if needed
            if (!el.hasAttribute('tabindex') || el.getAttribute('tabindex') === '-1') {
                safeSetAttr(el, 'tabindex', '-1');
            }
            
            el.focus();
            console.log(`[A11y] Magnetic focus: ${label}`);
            
            // Announce to screen readers
            if (label) {
                TTS.announce(label, 'polite');
            }
        }, 150);
    }

    // --- Initialization ---

    function init() {
        console.log('[A11y] Initializing accessibility features...');
        
        // Create live region for announcements
        createLiveRegion();
        
        // Setup global keyboard handler
        document.addEventListener('keydown', handleKeyboardActivation);

        // Hook Vue Router
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
                    console.warn('[A11y] Could not find Vue root after 20 attempts');
                }
            }, 500);
        }

        // Initial rule application
        applyRules(document);

        // Setup mutation observer
        const observer = new MutationObserver((mutations) => {
            handleMagneticFocus(mutations);
            
            // Re-apply rules when structure changes
            const hasStructuralChanges = mutations.some(m => m.type === 'childList' && m.addedNodes.length > 0);
            if (hasStructuralChanges) {
                // Debounce rule application
                clearTimeout(window.__ts_a11y_rule_timer);
                window.__ts_a11y_rule_timer = setTimeout(() => {
                    applyRules(document);
                }, 200);
            }
        });
        
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden', 'aria-hidden']
        });

        // Expose utilities for debugging
        window.__ts_a11y = {
            forceApply: () => applyRules(document),
            toggleTTS: () => {
                TTS.enabled = !TTS.enabled;
                console.log(`[A11y] TTS ${TTS.enabled ? 'enabled' : 'disabled'}`);
                return TTS.enabled;
            },
            announce: (text) => TTS.announce(text, 'assertive')
        };

        console.log('[A11y] Initialization complete. Use window.__ts_a11y for debugging.');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();