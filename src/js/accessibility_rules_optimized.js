// accessibility_rules.js
/**
 * Definitions of accessibility rules for TeamSpeak Client.
 * Optimized for VoiceOver and screen reader compatibility.
 * Injected before: improved_accessibility.js
 */

(function () {
    console.error('[A11y Rules] Rules definition starting...');

    // -- Utilities ---

    function cleanLabel(text) {
        if (!text) return "";
        return text.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    function safeSetAttr(el, attr, val) {
        if (!el) return;
        if (el.getAttribute(attr) !== val) el.setAttribute(attr, val);
    }

    // -- Rules Configuration ---

    window.tsA11yRules = [

        // -- [SECTION A] : Landmarks & Page Structure ---
        {
            name: "Main Window",
            selector: ".tsv-window",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'application');
                safeSetAttr(el, 'aria-label', 'TeamSpeak Client');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Sidebar",
            selector: ".tsv-sidebar",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'navigation');
                safeSetAttr(el, 'aria-label', 'Sidebar');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Server View",
            selector: ".tsv-view.tsv-activity-main",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'aria-label', 'Server Browser');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Top Toolbar",
            selector: ".tsv-header",
            match: (el) => !el.closest('.tsv-sidebar') && !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'banner');
                safeSetAttr(el, 'aria-label', 'Toolbar');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // -- [SECTION B] : Server Tree & Content ---
        {
            name: "Server Tree",
            selector: ".ts-server-tree-wrapper, .ts-server-tree-scroller",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'tree');
                safeSetAttr(el, 'aria-label', 'Channels and Clients');
                safeSetAttr(el, 'tabindex', '0');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Channel Item",
            // Using attribute selector for robustness
            selector: "[class*='ts-server-tree-item-leaf'][class*='channel']",
            match: () => true, // Always match to update status
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '-1'); 
                
                const textEl = el.querySelector('.ts-server-tree-item-text');
                const name = textEl ? textEl.textContent.trim() : "Channel";
                
                let status = [];
                if (el.classList.contains('has-password')) status.push("Password Protected");
                if (el.classList.contains('is-full')) status.push("Full");
                if (el.querySelector('.ts-icon-subscribe')) status.push("Subscribed");
                
                const isCurrent = el.classList.contains('tsv-active') || el.classList.contains('current-channel');
                if (isCurrent) {
                    safeSetAttr(el, 'aria-current', 'true');
                    status.unshift("Current Channel");
                }

                const label = `${name} ${status.length > 0 ? ', ' + status.join(', ') : ''}`;
                safeSetAttr(el, 'aria-label', label);
                
                if (el.classList.contains('has-children')) {
                    const isExpanded = !el.classList.contains('collapsed');
                    safeSetAttr(el, 'aria-expanded', isExpanded ? 'true' : 'false');
                }

                // --- Join Button Logic ---
                if (!el.querySelector('.ts-a11y-join-btn')) {
                    const joinBtn = document.createElement('button');
                    joinBtn.className = 'ts-a11y-join-btn';
                    joinBtn.textContent = 'Join';
                    
                    // Robust accessible hiding
                    joinBtn.style.cssText = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;';
                    
                    safeSetAttr(joinBtn, 'tabindex', '-1');
                    safeSetAttr(joinBtn, 'aria-label', `Join ${name}`);

                    joinBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.error(`[A11y] Joining channel: ${name}`);
                        const dblClick = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                        el.dispatchEvent(dblClick);
                    };
                    el.insertBefore(joinBtn, el.firstChild);
                }

                // Enter key support
                if (!el.hasAttribute('data-enter-listener')) {
                    el.setAttribute('data-enter-listener', 'true');
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            console.error(`[A11y] Enter on channel: ${name}`);
                            const dblClick = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                            el.dispatchEvent(dblClick);
                        }
                    });
                }
            }
        },
        {
            name: "Client Item",
            // Using attribute selector for robustness
            selector: "[class*='ts-server-tree-item-leaf'][class*='client']",
            match: () => true, // Always match to update status
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '-1');

                const nickEl = el.querySelector('.ts-client-nick');
                const nickname = nickEl ? nickEl.textContent.trim() : "Client";

                let status = "Silent";
                const iconStack = el.querySelector('.tsv-icon-stack');
                if (iconStack) {
                    if (el.querySelector('[name*="talking"]')) status = "Talking";
                    else if (el.querySelector('[name*="muted"]')) status = "Muted";
                    else if (el.querySelector('[name*="away"]')) status = "Away";
                }

                const badges = el.querySelectorAll('.ts-server-tree-group-icon');
                const badgeText = badges.length > 0 ? `, ${badges.length} badges` : "";

                safeSetAttr(el, 'aria-label', `${nickname}, ${status}${badgeText}`);
            }
        },
        {
            name: "Server Tree Spacer",
            selector: ".ts-server-tree-item-leaf.spacer",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                const textEl = el.querySelector('.ts-server-tree-item-text');
                if (textEl && textEl.textContent.trim()) {
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                    safeSetAttr(el, 'role', 'heading');
                    safeSetAttr(el, 'aria-level', '3');
                }
                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // -- [SECTION C] : UI Components ---
        {
            name: "Enhanced Icons",
            selector: "svg",
            match: (el) => {
                // Apply if no label OR if it has role presentation (which we want to override)
                return !el.hasAttribute('aria-label') || el.getAttribute('role') === 'presentation';
            },
            apply: (el) => {
                const iconMap = {
                    'search': 'Search', 'notifications': 'Notifications', 'item-expand': 'Expand',
                    'item-collapse': 'Collapse', 'server': 'Server', 'contacts': 'Contacts',
                    'chat-contact-add': 'Add Contact', 'settings': 'Settings', 'microphone': 'Microphone',
                    'microphone-muted': 'Microphone Muted', 'headset': 'Headphones', 'headset-muted': 'Headphones Muted',
                    'volume': 'Volume', 'folder': 'Folder', 'file': 'File', 'close': 'Close',
                    'item-close': 'Close', 'check': 'Success', 'error': 'Error', 'warning': 'Warning',
                    'info': 'Information', 'bookmark': 'Bookmark', 'edit': 'Edit', 'delete': 'Delete',
                    'copy': 'Copy', 'link': 'Link', 'lock': 'Locked', 'eye': 'View', 'eye-slash': 'Hide',
                    'plus': 'Add', 'minus': 'Remove', 'teamspeak-label': 'TeamSpeak'
                };

                const name = el.getAttribute('name');
                if (name && iconMap[name]) {
                    safeSetAttr(el, 'role', 'img');
                    safeSetAttr(el, 'aria-label', iconMap[name]);
                    safeSetAttr(el, 'aria-hidden', 'false');
                } else if (name && name.length > 2) {
                    safeSetAttr(el, 'role', 'img');
                    safeSetAttr(el, 'aria-label', cleanLabel(name));
                    safeSetAttr(el, 'aria-hidden', 'false');
                } else {
                    safeSetAttr(el, 'aria-hidden', 'true');
                    safeSetAttr(el, 'role', 'presentation');
                }
            }
        },
        {
            name: "Chat Message",
            selector: ".ts-chat-room-event-detailed",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'article');
                const sender = el.querySelector('.ts-chat-message-sender-name')?.textContent || "Unknown";
                const time = el.querySelector('.ts-timestamp')?.textContent || "";
                const content = el.querySelector('.ts-chat-message-content')?.textContent || "";
                safeSetAttr(el, 'aria-label', `${sender} at ${time}: ${content}`);
                safeSetAttr(el, 'tabindex', '0');
                el.setAttribute('data-a11y-applied', 'true');
            }
        }
    ];

    console.error('[A11y Rules] Rules merged and loaded.');
})();