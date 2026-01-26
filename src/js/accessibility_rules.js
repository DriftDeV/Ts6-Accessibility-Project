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

        // TS SPLASH ICON AND BUTTON Initial Screen
        {
            name: "Splash Screen",
            selector: ".ts-first-launch-splash", // Target the container
            match: () => true,
            apply: (el) => {
                const icon = el.querySelector('.ts-first-launch-splash-icons');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
                    safeSetAttr(icon, 'tabindex', '0');
                    safeSetAttr(icon, 'aria-label', 'TeamSpeak Logo');
                }

                // The button is nested, so we target the actual button element
                const button = el.querySelector('.ts-first-launch-splash-button .tsv-button');
                if (button) {
                    safeSetAttr(button, 'role', 'button');
                    safeSetAttr(button, 'tabindex', '0');
                    
                    // Try to get label from content, otherwise use fallback
                    const buttonText = button.querySelector('.tsv-button-content');
                    const label = buttonText ? buttonText.textContent.trim() : 'Get Started';
                    safeSetAttr(button, 'aria-label', label);
                }
            }
        },
        // LICENSE AGREEMENT SCREEN
        {
            name: "License Agreement Screen",
            selector: ".ts-first-launch-terms-conditions-container",
            match: () => true,
            apply: (el) => {
                // 1. Make the scrollable text area accessible
                const scrollContainer = el.querySelector('.ts-first-launch-terms-conditions');
                if (scrollContainer) {
                    safeSetAttr(scrollContainer, 'role', 'region');
                    safeSetAttr(scrollContainer, 'aria-label', 'Terms and Conditions Text');
                    safeSetAttr(scrollContainer, 'tabindex', '0');
                }

                // 2. Enhance the Buttons (Accept/Reject)
                const buttons = el.querySelectorAll('.tsv-button');
                buttons.forEach(btn => {
                    const text = btn.textContent.trim();
                    safeSetAttr(btn, 'role', 'button');
                    safeSetAttr(btn, 'tabindex', '0');
                    safeSetAttr(btn, 'aria-label', text);
                    
                    if (btn.classList.contains('disabled')) {
                        safeSetAttr(btn, 'aria-disabled', 'true');
                    } else {
                        safeRemoveAttr(btn, 'aria-disabled');
                    }
                });

                // 3. Add a "Scroll to Bottom" button helper
                if (!el.querySelector('.ts-a11y-scroll-helper')) {
                    const buttonContainer = el.querySelector('.ts-first-launch-button-pocket');
                    if (buttonContainer && scrollContainer) {
                        const scrollBtn = document.createElement('div');
                        scrollBtn.className = 'tsv-button tsv-button-tinted ts-a11y-scroll-helper';
                        scrollBtn.style.marginBottom = '10px';
                        scrollBtn.style.cursor = 'pointer';
                        scrollBtn.innerHTML = '<div class="tsv-button-content tsv-flex tsv-flex-snd-center">Scroll to Bottom</div>';
                        
                        safeSetAttr(scrollBtn, 'role', 'button');
                        safeSetAttr(scrollBtn, 'tabindex', '0');
                        safeSetAttr(scrollBtn, 'aria-label', 'Scroll to end of agreement to enable Accept button');

                        scrollBtn.onclick = () => {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                            scrollContainer.dispatchEvent(new Event('scroll'));
                        };

                        scrollBtn.onkeydown = (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                scrollBtn.click();
                            }
                        };

                        buttonContainer.insertBefore(scrollBtn, buttonContainer.firstChild);
                    }
                }
            }
        },

        // Sign In Accessibility
        {
            name: "Sign In",
            selector: ".ts-first-launch-login-myts-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Sign In');
                safeSetAttr(el, 'tabindex', '0');
                /*
                let login_input_box = el.querySelector('.ts-first-launch-login-myts-input');
                if (login_input_box) {
                    let text_fields = login_input_box.querySelectorAll('.ts-text-input-box');
                    text_fields.forEach((field) => {
                        safeSetAttr(field, 'role', 'textbox');
                        safeSetAttr(field, 'tabindex', '0');
                    });
                } */
                let buttonset = el.querySelector('.ts-first-launch-login-myts-buttonset');
                if (buttonset) {
                    let buttons = buttonset.querySelectorAll('.tsv-button');
                    buttons.forEach((button) => {
                        safeSetAttr(button, 'role', 'button');
                        safeSetAttr(button, 'tabindex', '0');
                        const content = button.querySelector('.tsv-button-content');
                        const text = content ? content.textContent.trim() : 'Button';
                        safeSetAttr(button, 'aria-label', text);
                    });
                }
            }
        },

        // Create Account Accessibility
        {
            name: "Create Account",
            selector: ".ts-first-launch-create-myts-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Create Account');
                safeSetAttr(el, 'tabindex', '0');

                // Special handling for "Waiting for Email" state
                const pendingSection = el.querySelector('.ts-first-launch-create-myts-pending');
                if (pendingSection) {
                    const statusHeading = pendingSection.querySelector('.ts-first-launch-subtitle');
                    if (statusHeading) {
                        safeSetAttr(statusHeading, 'role', 'heading');
                        safeSetAttr(statusHeading, 'aria-level', '2');
                        safeSetAttr(statusHeading, 'tabindex', '-1');
                    }
                }

                // 1. Heading
                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                    // Ensure the step info is part of the label
                    const label = heading.innerText.replace(/\n/g, ' ').trim();
                    safeSetAttr(heading, 'aria-label', label);
                }

                // 2. Create Account Button
                const createBtn = el.querySelector('.ts-first-launch-create-myts-buttonset .tsv-button');
                if (createBtn) {
                    safeSetAttr(createBtn, 'role', 'button');
                    safeSetAttr(createBtn, 'tabindex', '0');
                    const content = createBtn.querySelector('.tsv-button-content');
                    const text = content ? content.textContent.trim() : 'Create Account';
                    safeSetAttr(createBtn, 'aria-label', text);
                    
                    if (createBtn.classList.contains('disabled')) {
                        safeSetAttr(createBtn, 'aria-disabled', 'true');
                    } else {
                        safeRemoveAttr(createBtn, 'aria-disabled');
                    }
                }

                // 3. Back Button
                const backBtn = el.querySelector('.ts-first-launch-back');
                if (backBtn) {
                    safeSetAttr(backBtn, 'role', 'button');
                    safeSetAttr(backBtn, 'tabindex', '0');
                    safeSetAttr(backBtn, 'aria-label', 'Go Back');
                }
            }
        },

        // Account Created Screen
        {
            name: "Account Created",
            selector: ".ts-first-launch-create-myts-final",
            match: () => true,
            apply: (el) => {
                // 1. Heading
                const heading = el.querySelector('.ts-first-launch-subtitle');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                // 2. Success Icon
                const icon = el.querySelector('svg[name="check"]');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
                    safeSetAttr(icon, 'aria-label', 'Success');
                }

                // 3. Continue Button
                const continueBtn = el.querySelector('.ts-first-launch-create-myts-buttonset .tsv-button');
                if (continueBtn) {
                    safeSetAttr(continueBtn, 'role', 'button');
                    safeSetAttr(continueBtn, 'tabindex', '0');
                    const content = continueBtn.querySelector('.tsv-button-content');
                    const text = content ? content.textContent.trim() : 'Continue';
                    safeSetAttr(continueBtn, 'aria-label', text);
                }
            }
        },

        // Account Recovery Key
        {
            name: "Account Recovery Key",
            selector: ".ts-first-launch-backup-key-container",
            match: () => true,
            apply: (el) => {
                // 1. Heading
                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                // 2. Recovery Key & Copy Button
                const keyContainer = el.querySelector('.ts-first-launch-backup-key-actual');
                if (keyContainer) {
                    // Make key readable
                    const keyTextEl = keyContainer.querySelector('p');
                    const key = keyTextEl ? keyTextEl.textContent.trim() : "";
                    
                    safeSetAttr(keyContainer, 'role', 'group');
                    safeSetAttr(keyContainer, 'aria-label', 'Recovery Key');
                    
                    if (keyTextEl) {
                        safeSetAttr(keyTextEl, 'tabindex', '0');
                        safeSetAttr(keyTextEl, 'aria-label', 'Recovery Key: ' + key);
                        // Ensure it's visible to screen readers even if blurred visually
                        keyTextEl.style.filter = 'none'; 
                        keyTextEl.style.opacity = '1';
                    }

                    // Create Copy Button
                    if (!keyContainer.querySelector('.ts-a11y-copy-btn')) {
                        const copyBtn = document.createElement('div');
                        copyBtn.className = 'tsv-button tsv-button-tinted ts-a11y-copy-btn';
                        copyBtn.style.marginTop = '10px';
                        copyBtn.style.cursor = 'pointer';
                        copyBtn.innerHTML = '<div class="tsv-button-content tsv-flex tsv-flex-snd-center">Copy Key to Clipboard</div>';
                        
                        safeSetAttr(copyBtn, 'role', 'button');
                        safeSetAttr(copyBtn, 'tabindex', '0');
                        safeSetAttr(copyBtn, 'aria-label', 'Copy recovery key to clipboard');

                        copyBtn.onclick = () => {
                            if (key) {
                                navigator.clipboard.writeText(key).then(() => {
                                    const content = copyBtn.querySelector('.tsv-button-content');
                                    if(content) content.textContent = "Copied!";
                                    setTimeout(() => {
                                         if(content) content.textContent = "Copy Key to Clipboard";
                                    }, 2000);
                                });
                            }
                        };
                        
                        copyBtn.onkeydown = (e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                copyBtn.click();
                            }
                        };

                        // Insert after the key display
                        keyContainer.parentElement.insertBefore(copyBtn, keyContainer.nextSibling);
                    }
                }

                // 3. Explanation
                const explain = el.querySelector('.ts-first-launch-backup-key-explain');
                if (explain) {
                     safeSetAttr(explain, 'tabindex', '0');
                     safeSetAttr(explain, 'role', 'article');
                }

                // 4. Checkbox
                const checkboxContainer = el.querySelector('.ts-checkbox');
                if (checkboxContainer) {
                    const input = checkboxContainer.querySelector('input');
                    const label = checkboxContainer.querySelector('label');
                    const labelText = label ? label.textContent.trim() : "I have saved my recovery key";

                    safeSetAttr(checkboxContainer, 'role', 'checkbox');
                    safeSetAttr(checkboxContainer, 'tabindex', '0');
                    safeSetAttr(checkboxContainer, 'aria-label', labelText);
                    
                    // Sync aria-checked state
                    const updateState = () => {
                         const isChecked = input && input.checked;
                         safeSetAttr(checkboxContainer, 'aria-checked', isChecked ? 'true' : 'false');
                    };
                    updateState();
                    
                    checkboxContainer.onclick = (e) => {
                        // If click didn't come from input, toggle input
                        if (e.target !== input) {
                            input.click();
                        }
                        updateState();
                    };
                    
                    checkboxContainer.onkeydown = (e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            input.click();
                            updateState();
                        }
                    };
                    // Listen for native changes too
                    if(input) input.addEventListener('change', updateState);
                }

                // 5. Continue Button
                const continueBtn = el.querySelector('.ts-first-launch-backup-key-buttons .tsv-button');
                if (continueBtn) {
                    safeSetAttr(continueBtn, 'role', 'button');
                    safeSetAttr(continueBtn, 'tabindex', '0');
                    safeSetAttr(continueBtn, 'aria-label', 'Continue');
                     if (continueBtn.classList.contains('disabled')) {
                        safeSetAttr(continueBtn, 'aria-disabled', 'true');
                    } else {
                        safeRemoveAttr(continueBtn, 'aria-disabled');
                    }
                }
                
                // 6. Back Button
                 const backBtn = el.querySelector('.ts-first-launch-back');
                if (backBtn) {
                    safeSetAttr(backBtn, 'role', 'button');
                    safeSetAttr(backBtn, 'tabindex', '0');
                    safeSetAttr(backBtn, 'aria-label', 'Go Back');
                }
            }
        },

        // Pick a Theme
        {
            name: "Pick a Theme",
            selector: ".ts-first-launch-pick-theme-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Pick a Theme');
                safeSetAttr(el, 'tabindex', '0');

                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                const list = el.querySelector('.ts-first-launch-pick-theme-preview-items');
                if (list) {
                    safeSetAttr(list, 'role', 'radiogroup');
                    safeSetAttr(list, 'aria-label', 'Theme Selection');
                }

                const items = el.querySelectorAll('.ts-first-launch-pick-theme-preview-item');
                items.forEach(item => {
                    safeSetAttr(item, 'role', 'radio');
                    safeSetAttr(item, 'tabindex', '0');
                    
                    const titleSpan = item.querySelector('.ts-first-launch-pick-theme-preview-item-title span:first-child');
                    const label = titleSpan ? titleSpan.textContent.trim() : 'Theme option';
                    safeSetAttr(item, 'aria-label', label);

                    const inner = item.querySelector('.ts-first-launch-pick-theme-preview-inner');
                    const isSelected = inner && inner.classList.contains('selected');
                    safeSetAttr(item, 'aria-checked', isSelected ? 'true' : 'false');
                });

                // Continue Button
                const btn = el.querySelector('.ts-first-launch-button-pocket .tsv-button');
                if (btn) {
                    safeSetAttr(btn, 'role', 'button');
                    safeSetAttr(btn, 'tabindex', '0');
                    safeSetAttr(btn, 'aria-label', 'Continue');
                }
                
                // Back Button
                const backBtn = el.querySelector('.ts-first-launch-back');
                if (backBtn) {
                    safeSetAttr(backBtn, 'role', 'button');
                    safeSetAttr(backBtn, 'tabindex', '0');
                    safeSetAttr(backBtn, 'aria-label', 'Go Back');
                }
            }
        },

        // Setup Finished
        {
            name: "Setup Finished",
            selector: ".ts-first-launch-finish",
            match: () => true,
            apply: (el) => {
                const heading = el.querySelector('.ts-first-launch-subtitle');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                const explainer = el.querySelector('.ts-first-launch-finish-explainer');
                if (explainer) {
                    safeSetAttr(explainer, 'role', 'article');
                    safeSetAttr(explainer, 'tabindex', '0');
                }

                const finishBtn = el.querySelector('.ts-first-launch-finish-buttonset .tsv-button');
                if (finishBtn) {
                    safeSetAttr(finishBtn, 'role', 'button');
                    safeSetAttr(finishBtn, 'tabindex', '0');
                    safeSetAttr(finishBtn, 'aria-label', 'Finish Setup');
                }
                
                 // Success Icon
                const icon = el.querySelector('svg[name="check"]');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
                    safeSetAttr(icon, 'aria-label', 'Success');
                }
            }
        },

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
        {
            name: "Buttons menubar",
            selector: ".tsv-bar.tsv-window-bar",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menubar');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Server Actions Menu Bar');
                let toolBtn = el.querySelectorAll('.tsv-tool-button')
                toolBtn.forEach(btn => {
                    safeSetAttr(btn, 'role', 'button');
                    const svg = btn.querySelector('svg');
                    const label = svg.getAttribute('name') || 'Action';
                    safeSetAttr(btn, 'aria-label', label);
                    safeSetAttr(btn, 'tabindex', '0');
                })
            }
        },

        // -- [SECTION D] : Lists, Trees & Items ---
        // [DESCRIPTION] Handles structured data like the server tree, bookmarks and lists.
        {
            name: "Bookmark List Container",
            selector: ".bookmarks",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menu')
                let entries = el.querySelectorAll('.tsv-item.ts-bookmark-entry')
                if (entries) { // Bookmark Entries
                    entries.forEach(entry =>{
                        safeSetAttr(entry, 'role', 'menuitem');
                        const iconStack = entry.querySelector('.tsv-item-icon-stack');
                        if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');
                        const textDiv = entry.querySelector('.tsv-item-text .tsv-text-truncate');
                        const label = textDiv ? textDiv.textContent : 'Bookmark';
                        safeSetAttr(entry, 'aria-label', label);})
                }
                let folders = el.querySelectorAll('.tsv-item.ts-bookmark-folder-box') 
                if (folders) {
                    folders.forEach(folder => {
                        safeSetAttr(folder, 'role', 'menuitem');
                        const iconStack = folder.querySelector('.tsv-item-icon-stack');
                        if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');
                        const textDiv = folder.querySelector('.tsv-item-text .tsv-text-truncate');
                        const label = textDiv ? textDiv.textContent : 'Folder';
                        safeSetAttr(folder, 'aria-label', label);
                    })
                }
            }
        },
        {
            name: "Contact List Container",
            selector: ".ts-contact-list",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menu')
                let off_contacts_men = el.querySelector('.tsv-virtual-list')
                if (off_contacts_men) {
                    safeSetAttr(off_contacts_men, 'role', 'menuitem')
                    safeSetAttr(off_contacts_men, 'aria-label', 'offline-contacts')
                }
            } 
        },
        {
            name: "Virtual List Items (Generic)",
            selector: ".tsv-virtual-list-item, .ts-room-list-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menuitem');
                safeSetAttr(el, 'tabindex', '0');
                const textEl = el.querySelector(".tsv-text-truncate");
                if (textEl) safeSetAttr(el, 'aria-label', textEl.textContent.trim());
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

                safeSetAttr(el, 'aria-label', `${nickname}`);
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
                const label_svg = (svg && svg.getAttribute('name') || 'Toggle Section');
                const text_label = el.querySelector('.label')
                const label = label_svg + " " + text_label
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
            selector: ".ts-chat-input-container-content-inner",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'textbox');
                safeSetAttr(el, 'contenteditable', 'true');
                if (!el.hasAttribute('aria-label')) {
                    safeSetAttr(el, 'aria-label', 'Type a message');
                }
            }
        },
        {
            name: "Chat Actions",
            selector: ".ts-chat-input-container-actions",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'group')
                safeSetAttr(el, 'aria-label', 'actions')
            }
        },
        {
            name: "left-side-section",
            selector: ".tsv-body.tsv-flex-column.tsv-virtual-list-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'section')
                safeSetAttr(el, 'aria-label', 'left-section-panel')
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
                        menuItems.forEach(item => {
                            let itemContainer = item.querySelector('.tsv-item-container');
                            if (itemContainer) {
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
                let basic_settings = el.querySelector('.setup-stream__settings-section');
                if (basic_settings) {
                    
                    safeSetAttr(basic_settings, 'role', 'region');
                    safeSetAttr(basic_settings, 'aria-label', 'Stream Basic Settings Section');

                    let heading = basic_settings.querySelector('.ts-expander');
                    if (heading) {
                        safeSetAttr(heading, 'role', 'heading');
                        safeSetAttr(heading, 'aria-level', '2');
                        safeSetAttr(heading, 'tabindex', '0');

                        const labelContainer = heading.querySelector('.label');
                        const labelText = labelContainer ? labelContainer.querySelector('.ts-font-large') : null;
                        if (labelText) {
                            safeSetAttr(heading, 'aria-label', cleanLabel(labelText.textContent));
                        }
                    }
                    let basic_settings_rows = basic_settings.querySelectorAll('.tsv-flex-row');
                    basic_settings_rows.forEach(row => {
                        safeSetAttr(row, 'role', 'group');
                        safeSetAttr(row, 'tabindex', '0');
                        // FIX: Label selector logic was too specific/incorrect
                        const labelEl = row.querySelector('.tsv-label-inline') || row.querySelector('label');
                        if (labelEl) {
                            safeSetAttr(row, 'aria-label', cleanLabel(labelEl.textContent));
                        }

                        // Handling controls
                        let flex1 = row.querySelector('.tsv-flex-1');
                        if (flex1) {
                            let controls = flex1.querySelector('.tsv-segmented-control');
                            if (controls) {
                                safeSetAttr(controls, 'role', 'group');
                                safeSetAttr(controls, 'tabindex', '0');
                                if (labelEl) safeSetAttr(controls, 'aria-label', cleanLabel(labelEl.textContent));

                                let buttons = controls.querySelectorAll('.tsv-segmented-button');
                                buttons.forEach(button => {
                                    safeSetAttr(button, 'role', 'button');
                                    safeSetAttr(button, 'tabindex', '0');
                                    const btnLabel = button.textContent;
                                    safeSetAttr(button, 'aria-label', cleanLabel(btnLabel));
                                    safeSetAttr(button, 'aria-pressed', button.classList.contains('active') ? 'true' : 'false');
                                })
                            }
                        }
                    })
                }
                let advanced_settings = el.querySelector(".setup-stream__settings-section.tsv-mar-t-large");
                if (advanced_settings) {
                    safeSetAttr(advanced_settings, 'role', 'button');
                    safeSetAttr(advanced_settings, 'aria-label', 'advanced_settings');
                }
            }
        },
        // Advanced Settings Groups Accessibility
        {
            name: "Advanced Settings Groups Accessibility",
            selector: ".setup-stream__settings",
            match: () => true,
            apply: (el) => {
                let advanced_settings_items = el.querySelectorAll(".tsv-flex-row");
                if (advanced_settings_items) {
                    advanced_settings_items.forEach(item => {
                        const label = cleanLabel(item.querySelector('.tsv-flex').textContent);
                        safeSetAttr(item, 'role', 'group');
                        safeSetAttr(item, 'aria-label', label);
                        safeSetAttr(item, 'tabindex', '0');
                        let pickerType_params = item.querySelector('.tsv-flex-grow');
                        if (pickerType_params) {
                            let picker_field = pickerType_params.querySelector('.tsv-number-picker-field');
                            safeSetAttr(picker_field, 'role', 'textfield');
                        }
                        // Accessibilità pulsanti Advanced Settings
                        let btnType_controls_section = item.querySelector('.tsv-flex-1') // Sezione controlli
                        if (btnType_controls_section) {
                            btnList = btnType_controls_section.querySelector('.tsv-segmented-control.tsv-mar-t-small');
                            btnList.querySelectorAll('.tsv-segmented-button').forEach(btn => {
                                const label = btn.textContent;
                                safeSetAttr(btn, 'role', 'button');
                                safeSetAttr(btn, 'aria-label', label)
                                safeSetAttr(btn, 'tabindex', '0')
                            })
                        }
                    })
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
