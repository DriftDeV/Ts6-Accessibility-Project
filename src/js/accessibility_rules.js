// accessibility_rules.js
// Definitions of accessibility rules for TeamSpeak Client
// This file is injected before improved_accessibility.js

(function(){
    // Utility to clean up labels (e.g., "window-minimize" -> "Window Minimize")
    function cleanLabel(text) {
        if (!text) return "";
        return text.replace(/[-_]/g, ' ')
                   .replace(/\b\w/g, c => c.toUpperCase());
    }

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

    window.tsA11yRules = [
        // --- Headers & Structural ---
        {
            name: "Main Header Logo",
            selector: ".ts-title-logo",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '1');
                safeSetAttr(el, 'aria-label', 'TeamSpeak Home');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Sidebar Banner",
            selector: ".tsv-header.tsv-highlight.tsv-sidebar-header",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'banner');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Settings Title",
            selector: ".tsv-settings-title",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '2');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Sidebar Tab Headers",
            selector: ".v-popper.tsv-sidebar-tab-header",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '3');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Sidebar Tab Items",
            selector: ".tsv-tab-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tab');
                safeSetAttr(el, 'tabindex', '0');
                if (el.classList.contains('active')) {
                    safeSetAttr(el, 'aria-selected', 'true');
                } else {
                    safeSetAttr(el, 'aria-selected', 'false');
                }
            }
        },
        
        // --- Navigation & Groups ---
        {
            name: "Resources Section",
            selector: ".resources-section-container.tsv-flex-grow",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server/Chats');
            }
        },
        {
            name: "Widget Wrapper (Group)",
            selector: ".ts-widget-wrapper",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                const titleEl = el.querySelector(".ts-widget-section-header .title");
                if (titleEl) {
                    safeSetAttr(el, 'aria-label', titleEl.textContent);
                }
            }
        },
        {
            name: "Dashboard Widget (Join/Start)",
            selector: ".tsv-dashboard-widget",
            match: (el) => el.querySelector('.ts-font-large'),
            apply: (el) => {
                const title = el.querySelector('.ts-font-large').textContent;
                safeSetAttr(el, 'role', 'article');
                safeSetAttr(el, 'aria-label', title);
            }
        },
        {
            name: "Server Tree Scroller",
            selector: ".vue-recycle-scroller.scroller.ts-server-tree-scroller",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server Channels');
            }
        },

        // --- Lists (Bookmarks, Contacts) ---
        {
            name: "Bookmark List Container",
            selector: ".bookmarks",
            match: () => true,
            apply: (el) => safeSetAttr(el, 'role', 'list')
        },
        {
            name: "Contact List Container",
            selector: ".ts-contact-list",
            match: () => true,
            apply: (el) => safeSetAttr(el, 'role', 'list')
        },
        {
            name: "List Items (Virtual List / Contacts / Rooms)",
            selector: ".tsv-virtual-list-item, .ts-room-list-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                safeSetAttr(el, 'tabindex', '0');
                const textEl = el.querySelector(".tsv-text-truncate");
                if (textEl) {
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                }
            }
        },
        {
            name: "Bookmark Entry",
            selector: ".tsv-item.ts-bookmark-entry",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                // Hide icon stack
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');
                
                // Label extraction
                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent : 'Bookmark';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        {
            name: "Bookmark Cartelle",
            selector: ".tsv-item.ts-bookmark-folder-box",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                // Hide icon stack
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');
                
                // Label extraction
                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent : 'Bookmark';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        // --- Inputs & Controls ---
        {
            name: "Search Input",
            selector: ".tsv-search-input, input.tsv-search-input, .server-search-input input, .ts-text-input-box input",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'searchbox');
                const placeholder = el.getAttribute('placeholder');
                safeSetAttr(el, 'aria-label', placeholder || 'Search or Connect');
            }
        },
        {
            name: "Input Action Buttons",
            selector: ".ts-text-input-box-accept, .ts-text-input-box-delete, .ts-text-input-box-reveal",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                if (el.classList.contains('ts-text-input-box-accept')) safeSetAttr(el, 'aria-label', 'Submit');
                if (el.classList.contains('ts-text-input-box-delete')) safeSetAttr(el, 'aria-label', 'Clear');
                if (el.classList.contains('ts-text-input-box-reveal')) safeSetAttr(el, 'aria-label', 'Toggle Visibility');
            }
        },
        {
            name: "Pagination Controls",
            selector: ".ts-pagination-horizontal .tsv-icon",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                if (el.classList.contains('prev-chevron')) safeSetAttr(el, 'aria-label', 'Previous Page');
                if (el.classList.contains('next-chevron')) safeSetAttr(el, 'aria-label', 'Next Page');
            }
        },
        {
            name: "Create Community Button",
            selector: ".tsv-button-content.tsv-flex.tsv-flex-snd-center.ts-font-small",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Expand/Collapse",
            selector: ".ts-expander",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                const svg = el.querySelector('svg');
                const label = (svg && svg.getAttribute('name') || 'Toggle Section');
                safeSetAttr(el, 'aria-label', cleanLabel(label));
                
                if (el.classList.contains('collapsed')) {
                    safeSetAttr(el, 'aria-expanded', 'false');
                } else {
                    safeSetAttr(el, 'aria-expanded', 'true');
                }
            }
        },
        {
            name: "Context Menu Toggle",
            selector: ".tsv-tool-button-context-menu-toggle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'More Options');
            }
        },
        {
            name: "Resize Handle",
            selector: ".tsv-resize-handle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                safeSetAttr(el, 'aria-hidden', 'true');
            }
        },
        {
            name: "Hide Auto Resize Overlay",
            selector: ".tsv-resize-area-info",
            match: (el) => el.textContent.includes('Auto Resize'),
            apply: (el) => {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        },
        
        // --- Specific Icons / Buttons ---
        {
            name: "Action Buttons (Subtle)",
            selector: ".tsv-bar-item.tsv-action-subtle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'tabindex', '0');
                const svg = el.querySelector('svg');
                if (svg) {
                    const name = svg.getAttribute('name');
                    if (name) {
                        safeSetAttr(el, 'role', 'button');
                        safeSetAttr(el, 'aria-label', cleanLabel(name)); // 'settings', 'window-minimize', etc.
                    }
                }
            }
        },
        {
            name: "Talk Power Status",
            selector: ".ts-server-tree-active-status__item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'aria-label', 'Talk Power Grant/Revoke');
            }
        },
        {
            name: "Badges/Icons",
            selector: ".ts-server-tree-inactive-status, .tsv-icon.tsv-icon-stack",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'img');
                const svg = el.querySelector('svg');
                const label = (svg && svg.getAttribute('name')) || 'Icon';
                safeSetAttr(el, 'aria-label', cleanLabel(label));
            }
        },
        {
            name : "Search Hexagon",
            selector : ".ts-sidebar-tab-sub-panel-accessory",
            match: () => true,
            apply: (el) => {
                safeRemoveAttr(el, 'role');
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                const svg = el.querySelector('svg');
                const label = (svg && svg.getAttribute('name') || "Button");
                safeSetAttr(el, 'aria-label', cleanLabel(label));
            }
        },
        // --- Cleanup Rules (Negative Tabindex) ---
        {
            name: "Remove Tabindex for Virtual Lists",
            selector: ".tsv-virtual-list",
            match: () => true,
            apply: (el) => safeRemoveAttr(el, 'tabindex')
        },
        {
            name: "Remove Tabindex for Header Accessories",
            selector: ".tsv-bar-item.tsv-sidebar-header-accessories",
            match: () => true,
            apply: (el) => safeRemoveAttr(el, 'tabindex')
        },

        // --- Connected Server Tree Rules ---
        {
            name: "Server Tree Client",
            selector: ".ts-server-tree-item-leaf.client",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '0');
                
                const nickEl = el.querySelector('.ts-client-nick');
                const nickname = nickEl ? nickEl.textContent.trim() : "Client";
                
                // Determine status based on icon presence
                let status = "Silent";
                if (el.querySelector('svg[name="client-detailed-talking"]')) {
                    status = "Talking";
                } else if (el.querySelector('svg[name="client-detailed-voiceless"]')) {
                    status = "Microphone Muted";
                } else if (el.querySelector('svg[name="client-detailed-commander-talking"]')) {
                    status = "Channel Commander Talking";
                }
                
                // Check if user is away/dnd (usually indicated by specific icons or classes)
                // Based on CSS analysis, presence might be on .tsv-icon-contact-status-*
                
                safeSetAttr(el, 'aria-label', `${nickname}, ${status}`);
            }
        },
        {
            name: "Server Tree Channel",
            selector: ".ts-server-tree-item-leaf.channel:not(.spacer)",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '0');
                
                const textEl = el.querySelector('.ts-server-tree-item-text');
                const name = textEl ? textEl.textContent.trim() : "Channel";
                
                let extra = "";
                if (el.classList.contains('has-password')) extra += ", Password Protected";
                if (el.classList.contains('is-full')) extra += ", Full";
                
                safeSetAttr(el, 'aria-label', `${name}${extra}`);
                
                // Ideally, we would check aria-expanded if it's a parent channel, 
                // but the DOM structure for expansion needs verification.
            }
        },
        {
            name: "Server Tree Spacer",
            selector: ".ts-server-tree-item-leaf.spacer",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                // Spacers might have text used as headers
                const textEl = el.querySelector('.ts-server-tree-item-text');
                if (textEl && textEl.textContent.trim().length > 0) {
                    safeSetAttr(el, 'role', 'heading');
                    safeSetAttr(el, 'aria-level', '3');
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                } else {
                    safeSetAttr(el, 'aria-hidden', 'true');
                }
            }
        },

        // --- Chat Area Rules ---
        {
            name: "Chat Message Content",
            selector: ".ts-chat-message-content",
            match: () => true,
            apply: (el) => {
                // Ensure the message content is treated as a log item or article
                // Often messages are in a list, but individual content blocks need to be readable
                if (!el.getAttribute('role')) {
                    safeSetAttr(el, 'role', 'article');
                }
            }
        },
        {
            name: "Chat Input Area",
            selector: ".ts-chat-input-container .ts-input-as-text",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'textbox');
                safeSetAttr(el, 'contenteditable', 'true'); // Ensure it's announced as editable if it isn't already
                if (!el.hasAttribute('aria-label')) {
                    safeSetAttr(el, 'aria-label', 'Type a message');
                }
            }
        },

        // --- Settings Rules ---
        {
            name: "Settings Category Item",
            selector: ".tsv-settings-categories .tsv-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tab');
                safeSetAttr(el, 'tabindex', '0');
                if (el.classList.contains('tsv-selected')) {
                    safeSetAttr(el, 'aria-selected', 'true');
                } else {
                    safeSetAttr(el, 'aria-selected', 'false');
                }
                
                const textEl = el.querySelector('.tsv-item-text');
                if (textEl) {
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                }
            }
        },

        // --- Modals & Dialogs ---
        {
            name: "Modal Dialog",
            selector: ".tsv-modal-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'dialog');
                safeSetAttr(el, 'aria-modal', 'true');
                
                // Try to find a heading for labelling
                const heading = el.querySelector('h1, h2, h3, h4, h5, h6, .title, .tsv-modal-header');
                if (heading) {
                    if (!heading.id) heading.id = 'ts-modal-heading-' + Math.random().toString(36).substr(2, 9);
                    safeSetAttr(el, 'aria-labelledby', heading.id);
                } else {
                    safeSetAttr(el, 'aria-label', 'Dialog Window');
                }
            }
        },
        
        // --- Generic Fallback (Must be last) ---
        {
            name: "Generic Button Fallback",
            selector: ".tsv-action, .tsv-button",
            match: (el) => !el.hasAttribute('aria-label') && el.querySelector('svg'),
            apply: (el) => {
                const svg = el.querySelector('svg');
                if (svg) {
                    const label = svg.getAttribute('name') || 'Action';
                    safeSetAttr(el, 'role', 'button');
                    safeSetAttr(el, 'tabindex', '0');
                    safeSetAttr(el, 'aria-label', cleanLabel(label));
                }
            }
        }
    ];
})();
