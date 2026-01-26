// accessibility_rules.js
/**
 * Definitions of accessibility rules for TeamSpeak Client.
 * Optimized for VoiceOver and screen reader compatibility.
 * Injected before: improved_accessibility.js
 */

(function () {
    console.log('[A11y Rules] Loading rules definition...');

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
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'application');
                safeSetAttr(el, 'aria-label', 'TeamSpeak Client');
            }
        },
        {
            name: "Sidebar",
            selector: ".tsv-sidebar",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'navigation');
                safeSetAttr(el, 'aria-label', 'Sidebar');
            }
        },
        {
            name: "Server View",
            selector: ".tsv-view.tsv-activity-main",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'aria-label', 'Server Browser');
            }
        },
        {
            name: "Top Toolbar",
            selector: ".tsv-header",
            match: (el) => !el.closest('.tsv-sidebar'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'banner');
                safeSetAttr(el, 'aria-label', 'Toolbar');
            }
        },

        // -- [SECTION B] : Server Tree & Content ---
        {
            name: "Server Tree",
            selector: ".ts-server-tree-wrapper",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tree');
                safeSetAttr(el, 'aria-label', 'Channels and Clients');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Channel Item",
            selector: ".ts-server-tree-item-leaf.channel",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                // tabindex -1 allows programmatic focus but removes from tab order
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

                // --- Join Button Logic (Fixed) ---
                if (!el.querySelector('.ts-a11y-join-btn')) {
                    const joinBtn = document.createElement('button');
                    joinBtn.className = 'ts-a11y-join-btn';
                    joinBtn.textContent = 'Join Channel'; // Clear text for VoiceOver
                    
                    // Visually hidden but accessible style
                    joinBtn.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
                    
                    safeSetAttr(joinBtn, 'tabindex', '-1');
                    safeSetAttr(joinBtn, 'aria-label', `Join ${name}`);

                    joinBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`[A11y] Join button clicked for ${name}`);
                        
                        // Dispatch double click
                        const dblClick = new MouseEvent('dblclick', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        el.dispatchEvent(dblClick);
                    };

                    // Insert as first child to be read first when interacting
                    el.insertBefore(joinBtn, el.firstChild);
                }

                // Enter key support
                if (!el.hasAttribute('data-enter-listener')) {
                    el.setAttribute('data-enter-listener', 'true');
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            const dblClick = new MouseEvent('dblclick', {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            });
                            el.dispatchEvent(dblClick);
                        }
                    });
                }
            }
        },
        {
            name: "Client Item",
            selector: ".ts-server-tree-item-leaf.client",
            match: () => true,
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
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                const textEl = el.querySelector('.ts-server-tree-item-text');
                if (textEl && textEl.textContent.trim()) {
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                    safeSetAttr(el, 'role', 'heading');
                    safeSetAttr(el, 'aria-level', '3');
                }
            }
        },

        // -- [SECTION C] : UI Components ---
        {
            name: "Chat Input",
            selector: ".ts-chat-input-container .ts-input-as-text",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'textbox');
                safeSetAttr(el, 'aria-multiline', 'true');
                safeSetAttr(el, 'aria-label', 'Chat Message');
            }
        },
        {
            name: "Chat Message",
            selector: ".ts-chat-room-event-detailed",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'article');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Context Menu",
            selector: ".ts-context-menu",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menu');
                safeSetAttr(el, 'aria-modal', 'true');
                const items = el.querySelectorAll('.tsv-item');
                items.forEach(item => {
                    safeSetAttr(item, 'role', 'menuitem');
                    safeSetAttr(item, 'tabindex', '0');
                });
            }
        },
        {
            name: "Modal Dialog",
            selector: ".tsv-modal-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'dialog');
                safeSetAttr(el, 'aria-modal', 'true');
                const title = el.querySelector('.tsv-modal-header-title') || el.querySelector('h1, h2');
                if (title) safeSetAttr(el, 'aria-label', title.textContent.trim());
            }
        },

        // -- [SECTION D] : Icons & Cleanup ---
        // Status Icons (Container based)
        {
            name: "Status Icons",
            selector: ".tsv-icon-stack",
            match: (el) => !el.closest('.ts-server-tree-item-leaf.client'), // Skip client status as it's handled in client rule
            apply: (el) => {
                safeSetAttr(el, 'role', 'img');
                const svg = el.querySelector('svg');
                if (svg && svg.getAttribute('name')) {
                    safeSetAttr(el, 'aria-label', cleanLabel(svg.getAttribute('name')));
                }
            }
        },
        // Enhanced SVGs (Direct SVG based)
        {
            name: "Enhanced Icons",
            selector: "svg",
            match: (el) => !el.hasAttribute('aria-label') && !el.hasAttribute('role') && !el.getAttribute('aria-hidden'),
            apply: (el) => {
                const iconMap = {
                    'search': 'Search',
                    'notifications': 'Notifications',
                    'item-expand': 'Expand',
                    'item-collapse': 'Collapse',
                    'server': 'Server',
                    'contacts': 'Contacts',
                    'chat-contact-add': 'Add Contact',
                    'settings': 'Settings',
                    'microphone': 'Microphone',
                    'microphone-muted': 'Microphone Muted',
                    'headset': 'Headphones',
                    'headset-muted': 'Headphones Muted',
                    'volume': 'Volume',
                    'folder': 'Folder',
                    'file': 'File',
                    'close': 'Close',
                    'item-close': 'Close',
                    'check': 'Success',
                    'error': 'Error',
                    'warning': 'Warning',
                    'info': 'Information',
                    'bookmark': 'Bookmark',
                    'edit': 'Edit',
                    'delete': 'Delete',
                    'copy': 'Copy',
                    'link': 'Link',
                    'lock': 'Locked',
                    'eye': 'View',
                    'eye-slash': 'Hide',
                    'plus': 'Add',
                    'minus': 'Remove'
                };

                const name = el.getAttribute('name');
                if (name && iconMap[name]) {
                    safeSetAttr(el, 'role', 'img');
                    safeSetAttr(el, 'aria-label', iconMap[name]);
                } else if (el.closest('.tsv-icon-no-animation') || el.classList.contains('tsv-icon-no-animation')) {
                     safeSetAttr(el, 'aria-hidden', 'true');
                } else if (name && name.length > 2) {
                    safeSetAttr(el, 'role', 'img');
                    safeSetAttr(el, 'aria-label', cleanLabel(name));
                } else {
                    safeSetAttr(el, 'aria-hidden', 'true');
                }
            }
        }
    ];

    console.log('[A11y Rules] Loaded ' + window.tsA11yRules.length + ' rules.');
})();