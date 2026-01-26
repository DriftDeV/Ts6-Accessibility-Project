// accessibility_rules.js
/**
 * Definitions of accessibility rules for TeamSpeak Client.
 * Optimized for VoiceOver and screen reader compatibility.
 * Injected before: improved_accessibility.js
 *
 * Strategy:
 * - SVGs are DECORATIVE by default -> aria-hidden="true"
 * - Only interactive elements get labels
 * - Structure with landmarks, headings, and lists
 * - Minimal announcements, maximum clarity
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

    function removeAttr(el, attr) {
        if (!el) return;
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
    }

    // -- Rules Configuration ---

    window.tsA11yRules = [

        // =====================================================
        // [SECTION A] : LANDMARKS & PAGE STRUCTURE
        // =====================================================
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
            name: "Sidebar Navigation",
            selector: ".tsv-sidebar",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'navigation');
                safeSetAttr(el, 'aria-label', 'Server tabs');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Server View Main",
            selector: ".tsv-view.tsv-activity-main",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'aria-label', 'Server view');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Top Toolbar",
            selector: ".tsv-header",
            match: (el) => !el.closest('.tsv-sidebar') && !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'toolbar');
                safeSetAttr(el, 'aria-label', 'Main toolbar');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // =====================================================
        // [SECTION B] : SERVER HEADER (as heading level 1)
        // =====================================================
        {
            name: "Server Header",
            selector: ".ts-server-header",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '1');

                // Try to get server name from parent or content
                const banner = el.querySelector('.tsv-view-banner');
                const serverName = el.closest('[data-server-name]')?.getAttribute('data-server-name') || 'Server';
                safeSetAttr(el, 'aria-label', serverName);
                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // =====================================================
        // [SECTION C] : SERVER TREE (Channels and Clients)
        // =====================================================
        {
            name: "Server Tree Container",
            selector: ".ts-server-tree-wrapper",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Channels and users');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Server Tree Scroller",
            selector: ".ts-server-tree-scroller",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'list');
                safeSetAttr(el, 'aria-label', 'Channel list');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Spacer as Heading",
            selector: ".ts-server-tree-item-leaf.spacer",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                const textEl = el.querySelector('.ts-server-tree-item-text');
                const text = textEl ? textEl.textContent.trim() : '';

                if (text) {
                    // Spacers with text become section headings
                    safeSetAttr(el, 'role', 'heading');
                    safeSetAttr(el, 'aria-level', '2');
                    safeSetAttr(el, 'aria-label', text);
                } else {
                    // Empty spacers are separators
                    safeSetAttr(el, 'role', 'separator');
                    safeSetAttr(el, 'aria-hidden', 'true');
                }
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Channel Item",
            selector: ".ts-server-tree-item-leaf.channel:not(.spacer)",
            match: () => true, // Always update for dynamic status
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');

                const textEl = el.querySelector('.ts-server-tree-item-text');
                const name = textEl ? textEl.textContent.trim() : "Channel";

                // Build status info
                let statusParts = [];

                // Current channel indicator
                const isCurrent = el.classList.contains('tsv-active') ||
                                  el.classList.contains('current-channel') ||
                                  el.querySelector('.self');
                if (isCurrent) {
                    statusParts.push("current");
                    safeSetAttr(el, 'aria-current', 'location');
                } else {
                    removeAttr(el, 'aria-current');
                }

                // Channel properties
                if (el.classList.contains('has-password')) statusParts.push("password protected");
                if (el.classList.contains('is-full')) statusParts.push("full");

                // Build final label: "ChannelName, current, password protected"
                const label = statusParts.length > 0
                    ? `${name}, ${statusParts.join(', ')}`
                    : name;
                safeSetAttr(el, 'aria-label', label);

                // Expandable channels
                if (el.classList.contains('has-children') || el.querySelector('.ts-expander')) {
                    const isExpanded = !el.classList.contains('collapsed');
                    safeSetAttr(el, 'aria-expanded', isExpanded ? 'true' : 'false');
                }

                // Keyboard navigation
                safeSetAttr(el, 'tabindex', '0');

                // Enter key to join
                if (!el.hasAttribute('data-a11y-keyboard')) {
                    el.setAttribute('data-a11y-keyboard', 'true');
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            console.error(`[A11y] Activating channel: ${name}`);
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
            match: () => true, // Always update for dynamic status
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');

                const nickEl = el.querySelector('.ts-client-nick');
                const nickname = nickEl ? nickEl.textContent.trim() : "User";

                // Determine voice status from icons
                let status = "";
                if (el.querySelector('[name*="talking"]') || el.querySelector('.tsv-icon-client-detailed-talking:not([style*="display: none"])')) {
                    status = "talking";
                } else if (el.querySelector('[name*="muted"]') || el.querySelector('[name*="microphone-muted"]')) {
                    status = "muted";
                } else if (el.querySelector('[name*="away"]')) {
                    status = "away";
                }

                // Is this the current user?
                const isSelf = el.classList.contains('self');

                // Build label
                let label = nickname;
                if (isSelf) label += " (you)";
                if (status) label += `, ${status}`;

                safeSetAttr(el, 'aria-label', label);
                safeSetAttr(el, 'tabindex', '0');
            }
        },

        // =====================================================
        // [SECTION D] : INTERACTIVE BUTTONS (only these get labels)
        // =====================================================
        {
            name: "Action Buttons",
            selector: ".tsv-action, .tsv-bar-item, button, [role='button']",
            match: (el) => {
                // Skip if already processed or is not actually interactive
                if (el.hasAttribute('data-a11y-btn')) return false;
                // Must be clickable
                return el.onclick || el.closest('button') ||
                       el.classList.contains('tsv-action') ||
                       el.getAttribute('role') === 'button';
            },
            apply: (el) => {
                el.setAttribute('data-a11y-btn', 'true');

                // Only add label if missing
                if (!el.getAttribute('aria-label') && !el.textContent.trim()) {
                    // Try to get label from child icon
                    const icon = el.querySelector('svg[name]');
                    if (icon) {
                        const iconName = icon.getAttribute('name');
                        const labelMap = {
                            'search': 'Search',
                            'notifications': 'Notifications',
                            'settings': 'Settings',
                            'microphone': 'Toggle microphone',
                            'microphone-muted': 'Microphone muted, click to unmute',
                            'headset': 'Toggle speakers',
                            'headset-muted': 'Speakers muted, click to unmute',
                            'close': 'Close',
                            'item-close': 'Close',
                            'plus': 'Add',
                            'minus': 'Remove',
                            'edit': 'Edit',
                            'delete': 'Delete',
                            'contacts': 'Contacts',
                            'chat-contact-add': 'Add contact',
                            'bookmark': 'Bookmarks',
                            'server': 'Servers'
                        };

                        if (labelMap[iconName]) {
                            safeSetAttr(el, 'aria-label', labelMap[iconName]);
                        } else if (iconName && iconName.length > 2) {
                            safeSetAttr(el, 'aria-label', cleanLabel(iconName));
                        }
                    }
                }

                // Ensure focusable
                if (!el.hasAttribute('tabindex') && el.tagName !== 'BUTTON') {
                    safeSetAttr(el, 'tabindex', '0');
                }
            }
        },

        // =====================================================
        // [SECTION E] : HIDE ALL DECORATIVE SVGs
        // This MUST run last to clean up any icons not in buttons
        // =====================================================
        {
            name: "Hide Decorative SVGs",
            selector: "svg",
            match: (el) => {
                // Skip if inside an interactive element that needs the icon visible
                const parent = el.parentElement;
                if (!parent) return false;

                // If parent is a labeled button, icon is decorative
                const inButton = el.closest('button, [role="button"], .tsv-action, [data-a11y-btn]');
                if (inButton && inButton.getAttribute('aria-label')) {
                    return true; // Hide icon, button has label
                }

                // If SVG is direct child of something with text, it's decorative
                if (parent.textContent.trim().length > 0 && parent.textContent.trim() !== el.textContent) {
                    return true;
                }

                // Default: hide all SVGs unless explicitly needed
                return !el.hasAttribute('data-a11y-keep');
            },
            apply: (el) => {
                // Make SVG invisible to screen readers
                safeSetAttr(el, 'aria-hidden', 'true');
                safeSetAttr(el, 'role', 'presentation');
                // Remove any accidentally added labels
                removeAttr(el, 'aria-label');
            }
        },

        // =====================================================
        // [SECTION F] : CHAT MESSAGES
        // =====================================================
        {
            name: "Chat Container",
            selector: ".ts-chat-room, .ts-chat-message-list",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'log');
                safeSetAttr(el, 'aria-label', 'Chat messages');
                safeSetAttr(el, 'aria-live', 'polite');
                safeSetAttr(el, 'aria-relevant', 'additions');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },
        {
            name: "Chat Message",
            selector: ".ts-chat-room-event-detailed, .ts-chat-message",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'article');

                const sender = el.querySelector('.ts-chat-message-sender-name')?.textContent?.trim() || "Unknown";
                const time = el.querySelector('.ts-timestamp')?.textContent?.trim() || "";
                const content = el.querySelector('.ts-chat-message-content')?.textContent?.trim() || "";

                // Concise label for screen reader
                const label = time ? `${sender}, ${time}: ${content}` : `${sender}: ${content}`;
                safeSetAttr(el, 'aria-label', label);
                safeSetAttr(el, 'tabindex', '0');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // =====================================================
        // [SECTION G] : SIDEBAR TABS
        // =====================================================
        {
            name: "Sidebar Tab",
            selector: ".tsv-sidebar-tab-header, .tsv-sidebar-tab",
            match: (el) => !el.hasAttribute('data-a11y-applied'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'tab');

                const titleEl = el.querySelector('.tsv-sidebar-tab-header-title');
                if (titleEl) {
                    safeSetAttr(el, 'aria-label', titleEl.textContent.trim());
                }

                const isActive = el.classList.contains('tsv-active') ||
                                 el.closest('.tsv-active');
                safeSetAttr(el, 'aria-selected', isActive ? 'true' : 'false');
                safeSetAttr(el, 'tabindex', '0');
                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // =====================================================
        // [SECTION H] : MODALS AND DIALOGS
        // =====================================================
        {
            name: "Modal Dialog",
            selector: ".tsv-modal, .tsv-dialog, [class*='modal'], [class*='dialog']",
            match: (el) => !el.hasAttribute('data-a11y-applied') && el.offsetParent !== null,
            apply: (el) => {
                safeSetAttr(el, 'role', 'dialog');
                safeSetAttr(el, 'aria-modal', 'true');

                // Try to find title
                const title = el.querySelector('.tsv-modal-title, .tsv-dialog-title, h1, h2, .title');
                if (title) {
                    const titleId = 'dialog-title-' + Math.random().toString(36).substr(2, 9);
                    safeSetAttr(title, 'id', titleId);
                    safeSetAttr(el, 'aria-labelledby', titleId);
                }

                el.setAttribute('data-a11y-applied', 'true');
            }
        },

        // =====================================================
        // [SECTION I] : FORM CONTROLS
        // =====================================================
        {
            name: "Input Fields",
            selector: "input, textarea, select",
            match: (el) => !el.hasAttribute('data-a11y-applied') && !el.getAttribute('aria-label'),
            apply: (el) => {
                // Find associated label
                const id = el.getAttribute('id');
                let labelText = '';

                if (id) {
                    const label = document.querySelector(`label[for="${id}"]`);
                    if (label) labelText = label.textContent.trim();
                }

                if (!labelText) {
                    // Check for preceding text
                    const prev = el.previousElementSibling;
                    if (prev && prev.tagName !== 'INPUT') {
                        labelText = prev.textContent.trim();
                    }
                }

                if (!labelText) {
                    // Use placeholder
                    labelText = el.getAttribute('placeholder') || '';
                }

                if (labelText) {
                    safeSetAttr(el, 'aria-label', labelText);
                }

                el.setAttribute('data-a11y-applied', 'true');
            }
        }
    ];

    console.error('[A11y Rules] Rules loaded. Strategy: Hide decorative SVGs, label only interactive elements.');
})();
