// improved_accessibility.js
// Optimized for VoiceOver and screen reader compatibility
// Uses rule-based approach with improved magnetic focus

(function () {
    // Prevent multiple injections
    if (window.__teamspeak_a11y_active) {
        console.error('[A11y] Already active.');
        return;
    }
    window.__teamspeak_a11y_active = true;
    
    // Aggressive logging to confirm injection
    console.error('[A11y] INJECTED AND STARTING!');
    
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
                console.error(`[A11y] Speaking: ${text}`);
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
            (document.body || document.documentElement).appendChild(liveRegion);
        }
    }

    // --- Magnetic Focus Configuration ---

    function isVisible(el) {
        return el && (el.offsetParent !== null);
    }

    // Track server connection state for magnetic focus
    let lastServerCount = 0;
    let serverJoinPending = false;

    const magneticFocusTargets = [
        {
            selector: '.ts-context-menu',
            check: (el) => isVisible(el),
            target: (el) => el.querySelector('.tsv-item, [role="menuitem"]'),
            message: "Context Menu",
            priority: 1
        },
        {
            selector: '.tsv-modal-container',
            check: (el) => isVisible(el) && !el.closest('.hidden'),
            target: (el) => el.querySelector('input, button, [tabindex="0"]'),
            message: "Dialog Open",
            priority: 2
        },
        {
            selector: '.tsv-view.tsv-activity-main',
            check: (el) => {
                // Check if visible and no modal/menu is open
                if (!isVisible(el)) return false;
                if (document.querySelector('.ts-context-menu')) return false;
                if (document.querySelector('.tsv-modal-container:not(.hidden)')) return false;

                // Check if this is a new server join
                if (serverJoinPending) {
                    return true;
                }

                return false;
            },
            target: (el) => {
                // For server view, find the current channel or first item
                // First, try to find the channel we're in (self indicator)
                let target = el.querySelector('.ts-server-tree-item-leaf.client.self');
                if (target) {
                    // Go to parent channel
                    const channelContainer = target.closest('.ts-server-tree-item-container');
                    if (channelContainer) {
                        const channel = channelContainer.querySelector('.ts-server-tree-item-leaf.channel');
                        if (channel) target = channel;
                    }
                }

                if (!target) {
                    target = el.querySelector('.ts-server-tree-item-leaf.channel.tsv-selected');
                }
                if (!target) {
                    target = el.querySelector('.ts-server-tree-item-leaf.channel');
                }
                if (!target) {
                    target = el.querySelector('.ts-server-tree-item-leaf');
                }
                if (!target) {
                    target = el.querySelector('.ts-server-tree-wrapper');
                }
                return target;
            },
            message: "Server View",
            priority: 3,
            onFocus: () => {
                serverJoinPending = false;
            }
        }
    ];

    // Detect server join by monitoring server tabs
    function checkForServerJoin() {
        const serverTabs = document.querySelectorAll('.tsv-activity-group-list .tsv-item, .tsv-item-group .tsv-item');
        const currentCount = serverTabs.length;

        if (currentCount > lastServerCount && lastServerCount > 0) {
            console.error('[A11y] Server join detected!');
            serverJoinPending = true;
            // Trigger magnetic focus after a brief delay for UI to settle
            setTimeout(() => {
                handleMagneticFocus([]);
            }, 300);
        }

        lastServerCount = currentCount;
    }

    // Also detect server join by watching for server tree appearing
    function checkForServerTreeChange(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if a server tree appeared
                        if (node.classList && (
                            node.classList.contains('ts-server-tree-wrapper') ||
                            node.classList.contains('ts-server-tree-scroller') ||
                            node.querySelector && node.querySelector('.ts-server-tree-wrapper')
                        )) {
                            console.error('[A11y] Server tree appeared - triggering focus');
                            serverJoinPending = true;
                            setTimeout(() => {
                                handleMagneticFocus([]);
                            }, 300);
                            return;
                        }

                        // Check if we joined a channel (self client appeared)
                        if (node.classList && node.classList.contains('self')) {
                            console.error('[A11y] Joined channel - triggering focus');
                            serverJoinPending = true;
                            setTimeout(() => {
                                handleMagneticFocus([]);
                            }, 200);
                            return;
                        }
                    }
                }
            }
        }
    }

    // --- Focus Management ---

    function handleMagneticFocus(mutations) {
        if (window.__ts_focus_timer) clearTimeout(window.__ts_focus_timer);

        // Check for server tree changes
        if (mutations && mutations.length > 0) {
            checkForServerTreeChange(mutations);
        }

        window.__ts_focus_timer = setTimeout(() => {
            const active = document.activeElement;

            // Don't steal focus from inputs or active menus
            if (active && (
                active.tagName === 'INPUT' ||
                active.tagName === 'TEXTAREA' ||
                active.getAttribute('role') === 'menuitem' ||
                active.closest('.ts-context-menu')
            )) {
                return;
            }

            // Sort rules by priority (lower number = higher priority)
            const sortedRules = [...magneticFocusTargets].sort((a, b) =>
                (a.priority || 99) - (b.priority || 99)
            );

            for (const rule of sortedRules) {
                const elements = document.querySelectorAll(rule.selector);
                for (const el of elements) {
                    if (rule.check(el)) {
                        const target = rule.target(el);
                        if (target) {
                            // Don't re-focus if already inside this element
                            if (el.contains(active)) {
                                // But call onFocus if present to reset state
                                if (rule.onFocus) rule.onFocus();
                                return;
                            }

                            safeSetAttr(target, 'tabindex', '-1');
                            target.focus();
                            console.error(`[A11y] Focus -> ${rule.message}`);
                            TTS.announce(rule.message);

                            // Call onFocus callback if present
                            if (rule.onFocus) rule.onFocus();

                            return;
                        }
                    }
                }
            }
        }, 150);
    }

    // Force focus to server view (can be called externally)
    window.tsA11yFocusServerView = function() {
        serverJoinPending = true;
        handleMagneticFocus([]);
    };

    // --- Rule Application ---

    function applyRules(root) {
        if (!window.tsA11yRules || !Array.isArray(window.tsA11yRules)) {
            console.error('[A11y] RULES NOT FOUND! Check accessibility_rules.js');
            return;
        }
        
        // DEBUG: Baseline check
        const totalChannels = root.querySelectorAll("[class*='ts-server-tree-item-leaf'][class*='channel']").length;
        // Only log if we found something relevant or if it changed significantly (simple heuristic)
        if (totalChannels > 0 && Math.random() < 0.05) { // Log occasionally to avoid spam
             console.error(`[A11y] Baseline Check: Found ${totalChannels} channel elements in DOM.`);
        }

        let count = 0;
        let stats = {};

        window.tsA11yRules.forEach(rule => {
            try {
                const elements = root.querySelectorAll(rule.selector);
                
                // Warn only once per session/reload if critical elements are missing entirely
                if (elements.length === 0 && ["Channel Item", "Server Tree"].includes(rule.name)) {
                    if (!window[`__warned_${rule.name}`]) {
                        console.error(`[A11y] WARNING: No elements found for rule "${rule.name}" with selector: "${rule.selector}"`);
                        window[`__warned_${rule.name}`] = true;
                    }
                }
                
                elements.forEach(el => {
                    if (rule.match(el)) {
                        rule.apply(el);
                        count++;
                        stats[rule.name] = (stats[rule.name] || 0) + 1;
                    }
                });
            } catch (e) {
                console.error(`[A11y] Error in rule ${rule.name}:`, e);
            }
        });
        
        if (count > 0) {
            // console.error(`[A11y] Applied ${count} rules:`, JSON.stringify(stats));
        }
        
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
        (document.head || document.documentElement).appendChild(style);
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
        console.error('[A11y] Router hooked.');
    }

    // --- Initialization ---

    function init() {
        console.error('[A11y] Init...');
        createLiveRegion();
        applyRules(document);

        // Initialize server count
        checkForServerJoin();

        const observer = new MutationObserver((mutations) => {
            const hasNodes = mutations.some(m => m.type === 'childList' && m.addedNodes.length > 0);
            if (hasNodes) {
                applyRules(document);
                handleMagneticFocus(mutations);
                // Also check for server joins
                checkForServerJoin();
            }
        });

        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
        });

        // Periodic check to ensure rules are applied even if mutations are missed
        setInterval(() => {
            applyRules(document);
            checkForServerJoin();
        }, 2000);

        // Try to hook router
        const checkApp = setInterval(() => {
            const appEl = document.getElementById('app');
            const app = appEl ? appEl.__vue__ : null;
            if (app && app.$router) {
                hookRouter(app);
                clearInterval(checkApp);
            }
        }, 1000);

        // Initial focus to server view if connected
        setTimeout(() => {
            const serverTree = document.querySelector('.ts-server-tree-wrapper');
            if (serverTree && isVisible(serverTree)) {
                serverJoinPending = true;
                handleMagneticFocus([]);
            }
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
