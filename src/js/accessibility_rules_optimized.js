// accessibility_rules.js
/**
 * Definitions of accessibility rules for TeamSpeak Client.
 * Optimized for VoiceOver and screen reader compatibility.
 * Injected before: improved_accessibility.js
 */

(function () {
    // -- Utilities ---

    function cleanLabel(text) {
        if (!text) return "";
        return text.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    function safeSetAttr(el, attr, val) {
        if (!el) return;
        if (el.getAttribute(attr) !== val) el.setAttribute(attr, val);
    }

    function safeRemoveAttr(el, attr) {
        if (!el) return;
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
    }

    // -- Rules Configuration ---

    window.tsA11yRules = [

        // -- [SECTION A] : Landmarks & Page Structure ---
        // Main Window Frame
        {
            name: "Main Window",
            selector: ".tsv-window",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'application');
                safeSetAttr(el, 'aria-label', 'TeamSpeak Client');
            }
        },
        // Sidebar (Server List & Contacts)
        {
            name: "Sidebar (Navigation)",
            selector: ".tsv-sidebar",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'navigation');
                safeSetAttr(el, 'aria-label', 'Server List and Contacts');
            }
        },
        // Server Tree View (The Main Content when connected)
        {
            name: "Server Tree View",
            selector: ".tsv-view.tsv-activity-main",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'aria-label', 'Server Browser');
            }
        },
        // Chat Area (Right Side)
        {
            name: "Chat View",
            selector: ".ts-chat-widget, .ts-chat-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'complementary');
                safeSetAttr(el, 'aria-label', 'Text Chat');
            }
        },
        // Top Toolbar
        {
            name: "Top Toolbar",
            selector: ".tsv-header",
            match: (el) => !el.closest('.tsv-sidebar'), // Only main header, not sidebar header
            apply: (el) => {
                safeSetAttr(el, 'role', 'banner');
                safeSetAttr(el, 'aria-label', 'Server Toolbar');
            }
        },

        // -- [SECTION B] : Server Tree & Navigation ---
        // Server Tree Container
        {
            name: "Server Tree Container",
            selector: ".ts-server-tree-wrapper",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tree');
                safeSetAttr(el, 'aria-label', 'Channels and Clients');
                // Ensure it's focusable for "magnetic focus"
                safeSetAttr(el, 'tabindex', '0'); 
            }
        },
        // Individual Channels (Leafs)
        {
            name: "Channel Item",
            selector: ".ts-server-tree-item-leaf.channel",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '-1'); 
                
                const textEl = el.querySelector('.ts-server-tree-item-text');
                const name = textEl ? textEl.textContent.trim() : "Channel";
                
                // Status checks
                let status = [];
                if (el.classList.contains('has-password')) status.push("Password Protected");
                if (el.classList.contains('is-full')) status.push("Channel Full");
                if (el.querySelector('.ts-icon-subscribe')) status.push("Subscribed");
                
                // Active/Current Channel check
                const isCurrent = el.classList.contains('tsv-active') || el.classList.contains('current-channel');
                if (isCurrent) {
                    safeSetAttr(el, 'aria-current', 'true');
                    status.unshift("Current Channel");
                }

                const label = `${name} ${status.length > 0 ? ', ' + status.join(', ') : ''}`;
                safeSetAttr(el, 'aria-label', label);
                
                // Expand/Collapse state
                if (el.classList.contains('has-children')) {
                    const isExpanded = !el.classList.contains('collapsed');
                    safeSetAttr(el, 'aria-expanded', isExpanded ? 'true' : 'false');
                }

                // --- Join Button Logic ---
                // Create a dedicated button for joining without double-clicking
                let joinBtn = el.querySelector('.ts-a11y-join-btn');
                if (!joinBtn) {
                    joinBtn = document.createElement('button');
                    joinBtn.className = 'ts-a11y-join-btn';
                    joinBtn.textContent = 'Join';
                    
                    // Style as screen-reader only but focusable
                    Object.assign(joinBtn.style, {
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: '0',
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0, 0, 0, 0)',
                        whiteSpace: 'nowrap',
                        border: '0',
                        top: '0',
                        left: '0' // Place at start of element
                    });

                    safeSetAttr(joinBtn, 'tabindex', '-1'); // Not in tab sequence, but reachable via VO cursor
                    safeSetAttr(joinBtn, 'aria-label', `Join ${name}`);

                    joinBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`[A11y] Join button clicked for ${name}`);
                        
                        // Dispatch double click to main element
                        const dblClick = new MouseEvent('dblclick', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        el.dispatchEvent(dblClick);
                    };

                    // Insert as first child so it's found easily
                    el.insertBefore(joinBtn, el.firstChild);
                }

                // Keyboard 'Enter' to Join
                if (!el.hasAttribute('data-enter-listener')) {
                    el.setAttribute('data-enter-listener', 'true');
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            console.log(`[A11y] Enter pressed on ${name}`);
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
        // Clients (Users)
        {
            name: "Client Item",
            selector: ".ts-server-tree-item-leaf.client",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '-1');

                const nickEl = el.querySelector('.ts-client-nick');
                const nickname = nickEl ? nickEl.textContent.trim() : "Client";

                // Detailed Status
                let status = "Silent";
                const iconStack = el.querySelector('.tsv-icon-stack');
                if (iconStack) {
                    // Heuristic based on icon classes/names usually found in TS
                    if (el.querySelector('[name*="talking"]')) status = "Talking";
                    if (el.querySelector('[name*="muted"]')) status = "Muted";
                    if (el.querySelector('[name*="hardware_input_muted"]')) status = "Mic Muted";
                    if (el.querySelector('[name*="hardware_output_muted"]')) status = "Sound Muted";
                    if (el.querySelector('[name*="away"]')) status = "Away";
                }

                // Badges/Server Groups
                const badges = el.querySelectorAll('.ts-server-tree-group-icon');
                const badgeCount = badges.length;
                const badgeText = badgeCount > 0 ? `, ${badgeCount} badges` : "";

                safeSetAttr(el, 'aria-label', `${nickname}, ${status}${badgeText}`);
            }
        },
        // Spacers
        {
            name: "Server Tree Spacer",
            selector: ".ts-server-tree-item-leaf.spacer",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                const textEl = el.querySelector('.ts-server-tree-item-text');
                if (textEl && textEl.textContent.trim()) {
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                    safeSetAttr(el, 'role', 'heading'); // Upgrade to heading if it has text
                    safeSetAttr(el, 'aria-level', '3');
                }
            }
        },

        // -- [SECTION C] : Chat Interaction ---
        {
            name: "Chat Input",
            selector: ".ts-chat-input-container .ts-input-as-text",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'textbox');
                safeSetAttr(el, 'aria-multiline', 'true');
                safeSetAttr(el, 'aria-label', 'Message Channel');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Chat History",
            selector: ".ts-chat-history-virtual-list",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'log');
                safeSetAttr(el, 'aria-label', 'Chat History');
                safeSetAttr(el, 'aria-live', 'polite');
            }
        },
        {
            name: "Chat Message",
            selector: ".ts-chat-room-event-detailed",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'article');
                // Construct a reading string
                const sender = el.querySelector('.ts-chat-message-sender-name')?.textContent || "Unknown";
                const time = el.querySelector('.ts-timestamp')?.textContent || "";
                const content = el.querySelector('.ts-chat-message-content')?.textContent || "";
                
                safeSetAttr(el, 'aria-label', `${sender} at ${time}: ${content}`);
                safeSetAttr(el, 'tabindex', '0');
            }
        },

        // -- [SECTION D] : Menus & Popups ---
        {
            name: "Context Menu",
            selector: ".ts-context-menu",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menu');
                safeSetAttr(el, 'aria-modal', 'true'); // Treat as modal for focus trap
                
                const items = el.querySelectorAll('.tsv-item');
                items.forEach(item => {
                    safeSetAttr(item, 'role', 'menuitem');
                    safeSetAttr(item, 'tabindex', '0');
                });
            }
        },

        // -- [SECTION E] : Dialogs (First Launch, Settings) ---
        // Splash / Initial Setup
        {
            name: "Splash Screen",
            selector: ".ts-first-launch-splash",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Welcome to TeamSpeak');
                el.querySelector('button')?.focus(); // Direct focus hint
            }
        },
        // Generic Modal
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

        // -- [SECTION F] : Cleanup & Noise Reduction ---
        // Enhanced Icons: Label known icons, hide decorative ones
        {
            name: "Enhanced Icons",
            selector: "svg",
            match: (el) => !el.hasAttribute('aria-label') && !el.hasAttribute('role'),
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
                     // Usually decorative backgrounds or small indicators
                     safeSetAttr(el, 'aria-hidden', 'true');
                } else {
                    // Fallback: try to clean up the name if it exists, otherwise hide
                    if (name && name.length > 2) {
                        safeSetAttr(el, 'role', 'img');
                        safeSetAttr(el, 'aria-label', cleanLabel(name));
                    } else {
                        safeSetAttr(el, 'aria-hidden', 'true');
                    }
                }
            }
        },
        // Fix split buttons / complex containers
        {
            name: "List Item Container",
            selector: ".tsv-item-container",
            match: (el) => el.parentElement.getAttribute('role') === 'treeitem' || el.parentElement.getAttribute('role') === 'listitem',
            apply: (el) => {
                // The container is presentation, the parent is the item
                safeSetAttr(el, 'role', 'presentation');
            }
        }
    ];

    console.log('[A11y Rules] Loaded ' + window.tsA11yRules.length + ' accessibility rules');
})();
