// accessibility_rules.js
/**
 * Definitions of accessibility rules for TeamSpeak Client.
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
        // [DESCRIPTION] Defines major regions (Main, Banner, Sidebar) for quick navigation.
        {
            name: "Activity Page (Main View)",
            selector: ".tsv-view.tsv-activity",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'tabindex', '-1');
                safeSetAttr(el, 'aria-label', 'Activity Page');
            }
        },
        {
            name: "Sidebar (Complementary)",
            selector: ".tsv-sidebar",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'complementary');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Sidebar');
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
            name: "Footer (Settings/Profile)",
            selector: ".tsv-footer",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'contentinfo');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Profile and Settings Footer');
            }
        },
        {
            name: "Server View (Main View)",
            selector: ".tsv-view.tsv-activity-main",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'tabindex', '-1');
                safeSetAttr(el, 'aria-label', 'Server Main View');
            }
        },

        // -- [SECTION B] : Headings & Typography ---
        // [DESCRIPTION] Establishes heading hierarchy (H1-H6) for content structure.
        {
            name: "Main Header Logo (H1)",
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
            name: "Settings Title (H1)",
            selector: ".tsv-settings-title",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '1');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Sidebar Tab Headers (H2)",
            selector: ".v-popper.tsv-sidebar-tab-header",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '2');
                safeSetAttr(el, 'tabindex', '0');
            }
        },

        // -- [SECTION C] : Navigation & Tabs ---
        // [DESCRIPTION] Manages tab lists, navigation groups and selectable items.
        {
            name: "Sidebar Tab Items",
            selector: ".tsv-tab-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tab');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-selected', el.classList.contains('active') ? 'true' : 'false');
            }
        },
        {
            name: "Settings Category Item",
            selector: ".tsv-settings-categories .tsv-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tab');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-selected', el.classList.contains('tsv-selected') ? 'true' : 'false');

                const textEl = el.querySelector('.tsv-item-text');
                if (textEl) safeSetAttr(el, 'aria-label', textEl.textContent.trim());
            }
        },
        {
            name: "Resources Section (Nav Group)",
            selector: ".resources-section-container.tsv-flex-grow",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'navigation');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server and Chat Resources');
            }
        },

        // -- [SECTION D] : Lists, Trees & Items ---
        // [DESCRIPTION] Handles structured data like the server tree, bookmarks and lists.
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
            name: "Virtual List Items (Generic)",
            selector: ".tsv-virtual-list-item, .ts-room-list-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                safeSetAttr(el, 'tabindex', '0');
                const textEl = el.querySelector(".tsv-text-truncate");
                if (textEl) safeSetAttr(el, 'aria-label', textEl.textContent.trim());
            }
        },
        {
            name: "Bookmark Entry",
            selector: ".tsv-item.ts-bookmark-entry",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');

                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent : 'Bookmark';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        {
            name: "Bookmark Folders",
            selector: ".tsv-item.ts-bookmark-folder-box",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');

                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent : 'Folder';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        {
            name: "Server Tree Scroller",
            selector: ".vue-recycle-scroller.scroller.ts-server-tree-scroller",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tree');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server Channels Tree');
            }
        },
        {
            name: "Server Tree Client",
            selector: ".ts-server-tree-item-leaf.client",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '0');

                const nickEl = el.querySelector('.ts-client-nick');
                const nickname = nickEl ? nickEl.textContent.trim() : "Client";

                let status = "Silent";
                if (el.querySelector('svg[name="client-detailed-talking"]')) status = "Talking";
                else if (el.querySelector('svg[name="client-detailed-voiceless"]')) status = "Microphone Muted";
                else if (el.querySelector('svg[name="client-detailed-commander-talking"]')) status = "Commander Talking";

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
            }
        },
        {
            name: "Server Tree Spacer",
            selector: ".ts-server-tree-item-leaf.spacer",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
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

        // -- [SECTION E] : Inputs, Buttons & Controls ---
        // [DESCRIPTION] Covers interactive elements like search inputs, buttons and toggles.
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
            name: "Footer Profile Section (Clickable)",
            selector: ".tsv-item-content.tsv-item-content-primary",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                const titleEl = el.querySelector(".tsv-text-truncate");
                if (titleEl) safeSetAttr(el, 'aria-label', titleEl.textContent);
            }
        },
        {
            name: "Expand/Collapse Toggle",
            selector: ".ts-expander",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                const svg = el.querySelector('svg');
                const label = (svg && svg.getAttribute('name') || 'Toggle Section');
                safeSetAttr(el, 'aria-label', cleanLabel(label));

                safeSetAttr(el, 'aria-expanded', el.classList.contains('collapsed') ? 'false' : 'true');
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
                        safeSetAttr(el, 'aria-label', cleanLabel(name));
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
                safeSetAttr(el, 'aria-label', 'Talk Power');
            }
        },
        {
            name: "Search Hexagon Button",
            selector: ".ts-sidebar-tab-sub-panel-accessory",
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

        // -- [SECTION F] : Widgets & Complex Components ---
        // [DESCRIPTION] Specialized components like dashboards and status indicators.
        {
            name: "Widget Wrapper (Group)",
            selector: ".ts-widget-wrapper",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'tabindex', '0');
                const titleEl = el.querySelector(".ts-widget-section-header .title");
                if (titleEl) safeSetAttr(el, 'aria-label', titleEl.textContent);
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
            name: "Badges/Icons (Images)",
            selector: ".ts-server-tree-inactive-status, .tsv-icon.tsv-icon-stack",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'img');
                const svg = el.querySelector('svg');
                const label = (svg && svg.getAttribute('name')) || 'Icon';
                safeSetAttr(el, 'aria-label', cleanLabel(label));
            }
        },

        // -- [SECTION G] : Chat Area ---
        // [DESCRIPTION] Accessibility for the messaging and chat interface.
        {
            name: "Chat Message Content",
            selector: ".ts-chat-message-content",
            match: () => true,
            apply: (el) => {
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
                safeSetAttr(el, 'contenteditable', 'true');
                if (!el.hasAttribute('aria-label')) {
                    safeSetAttr(el, 'aria-label', 'Type a message');
                }
            }
        },

        // -- [SECTION H] : Modals & Overlays ---
        // [DESCRIPTION] Handles popup dialogs and modal windows.
        {
            name: "Modal Dialog",
            selector: ".tsv-modal-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'dialog');
                safeSetAttr(el, 'aria-modal', 'true');

                const heading = el.querySelector('h1, h2, h3, h4, h5, h6, .title, .tsv-modal-header');
                if (heading) {
                    if (!heading.id) heading.id = 'ts-modal-heading-' + Math.random().toString(36).substr(2, 9);
                    safeSetAttr(el, 'aria-labelledby', heading.id);
                } else {
                    safeSetAttr(el, 'aria-label', 'Dialog Window');
                }
            }
        },
        {
            name: "Modal Dialog - Teamspeak Context Menus",
            selector: ".ts-context-menu",
            match: () => true,
            apply: (el) => {
                let status = el.getAttribute('style');
                if (status.includes('visibility: hidden')) {
                    safeSetAttr(el, 'aria-hidden', 'true');
                } else {
                    let menu = el.querySelector('.tsv-tool-menu');
                    if (menu) {
                        safeSetAttr(el, 'role', 'menu');
                        safeSetAttr(el, 'aria-hidden', 'false');
                        let menuHeading = menu.querySelector('.ts-tool-section');
                        if (menuHeading) {
                            const label = menuHeading.querySelector('.ts-style-caption').textContent;
                            safeSetAttr(menuHeading, 'aria-label', cleanLabel(label));
                        }
                        let menuItems = menu.querySelectorAll('.tsv-item');
                        menuItems.forEach((item, index) => {
                            let itemContainer = item.querySelector('.tsv-item-container');
                            if(itemContainer) {
                                safeSetAttr(itemContainer, 'role', 'menuitem');
                                safeSetAttr(itemContainer, 'tabindex', '0');
                                const label = itemContainer.querySelector('.tsv-text-truncate').textContent;
                                safeSetAttr(itemContainer, 'aria-label', cleanLabel(label));
                            }
                        })
                    }
                }
            }
        },
        // DEDICATED Screen Share Overlay Window
        {
            name: "Screen Share Overlay Window Logic",
            selector: ".tsv-modal-overlay",
            match: () => true,
            apply: (el) => {
                // Main Screen Share Window
                let mainWindow = el.querySelector('.tsv-flex-column.tsv-modal-container');
                if (mainWindow) {
                    safeSetAttr(mainWindow, 'role', 'dialog');
                    safeSetAttr(mainWindow, 'aria-modal', 'true');
                    safeSetAttr(mainWindow, 'aria-label', 'Screen Share Overlay Window');
                    
                    let stream_preview = mainWindow.querySelector('.setup-stream__preview-wrapper');
                    if (stream_preview) {
                        safeSetAttr(stream_preview, 'role', 'img');
                        safeSetAttr(stream_preview, 'aria-label', 'Screen Share Preview');
                        safeSetAttr(stream_preview, 'aria-hidden', 'false');
                    } 
                    
                    let mainSection = mainWindow.querySelector('.tsv-flex-grow.tsv-flex-column');
                    if (mainSection) {
                        safeSetAttr(mainSection, 'role', 'region');
                        safeSetAttr(mainSection, 'aria-label', 'Screen Share Main Window');
                        
                        let top_bar = mainSection.querySelector('.tabs');
                        if (top_bar) {
                            safeSetAttr(top_bar, 'role', 'tablist');
                            safeSetAttr(top_bar, 'aria-label', 'Screen Share Source Types');
                            
                            let tabs = top_bar.querySelectorAll('.tab-item');
                            tabs.forEach(tab => {
                                safeSetAttr(tab, 'role', 'tab');
                                safeSetAttr(tab, 'tabindex', '0');
                                const label = tab.querySelector('.tab-item-content') ? tab.querySelector('.tab-item-content').textContent : 'Tab';
                                safeSetAttr(tab, 'aria-label', cleanLabel(label));
                                safeSetAttr(tab, 'aria-selected', tab.classList.contains('tab-item-active') ? 'true' : 'false');
                            });
                        }
                        
                        let source_selector = mainSection.querySelector('.tsv-scroll-area-v');
                        if (source_selector) {
                            safeSetAttr(source_selector, 'role', 'region');
                            safeSetAttr(source_selector, 'aria-label', 'Screen Share Source Selector');
                            let thumbnail_grid = source_selector.querySelector('.thumbnail-grid');
                            if (thumbnail_grid) {
                                safeSetAttr(thumbnail_grid, 'role', 'list');
                                safeSetAttr(thumbnail_grid, 'aria-label', 'Source Grid');
                                let thumbnail_items = thumbnail_grid.querySelectorAll('.tsv-flex-column.video-stream');
                                thumbnail_items.forEach((item, index) => {
                                    safeSetAttr(item, 'role', 'listitem');
                                    safeSetAttr(item, 'tabindex', '0');
                                    const titleEl = item.querySelector('.thumbnail-title.ts-font-small');
                                    safeSetAttr(titleEl, 'aria-hidden', 'true');
                                    const label = titleEl ? titleEl.textContent : 'Screen Source';
                                    safeSetAttr(item, 'aria-label', cleanLabel(label));
                                    let thumbnail_minimized = item.querySelector('.thumbnail-img-minimized');
                                    safeSetAttr(thumbnail_minimized, 'aria-hidden', 'true');
                                    let thumbnail_maximized = item.querySelector('.thumbnail-img');
                                    safeSetAttr(thumbnail_maximized, 'aria-hidden', 'true');
                                })
                            }
                        }
                    }

                    // Bottom bar is a direct child of mainWindow, sibling to mainSection
                    let bottom_bar = mainWindow.querySelector('.setup-stream__actions');
                    if (bottom_bar) {
                        safeSetAttr(bottom_bar, 'role', 'toolbar');
                        safeSetAttr(bottom_bar, 'aria-label', 'Screen Share Actions');
                        let buttons = bottom_bar.querySelectorAll('.tsv-button');
                        buttons.forEach(button => {
                            safeSetAttr(button, 'role', 'button');
                            safeSetAttr(button, 'tabindex', '0');
                            const content = button.querySelector('.tsv-button-content');
                            const label = content ? content.textContent : 'Button';
                            safeSetAttr(button, 'aria-label', cleanLabel(label));
                        })
                    }
                }
            }
        },
        // Setup Stream Settings Accessibiity
        {
            name: "Setup Stream Settings Region",
            selector: ".setup-stream__settings",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Setup Stream Settings');
                let upper_section = el.querySelector('.setup-stream__settings-section');
                if (upper_section) {
                    safeSetAttr(upper_section, 'role', 'region');
                    safeSetAttr(upper_section, 'aria-label', 'Setup Stream Settings Section');
                    let heading = upper_section.querySelector('.ts-expeander');
                    if (heading) {
                        safeSetAttr(heading, 'role', 'heading');
                        safeSetAttr(heading, 'aria-level', '2');
                    }
                }
            }
        },
        // -- [SECTION I] : Cleanup & Fallbacks ---
        // [DESCRIPTION] Final housekeeping for generic elements and removing artifacts.
        {
            name: "Resize Handle (Separator)",
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
