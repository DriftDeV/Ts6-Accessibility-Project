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

        // TS SPLASH ICON AND BUTTON Initial Screen
        {
            name: "Splash Screen",
            selector: ".ts-first-launch-splash",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Welcome Screen');

                const icon = el.querySelector('.ts-first-launch-splash-icons');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
                    safeSetAttr(icon, 'aria-label', 'TeamSpeak Logo');
                    safeSetAttr(icon, 'aria-hidden', 'false');
                }

                const button = el.querySelector('.ts-first-launch-splash-button .tsv-button');
                if (button) {
                    safeSetAttr(button, 'role', 'button');
                    safeSetAttr(button, 'tabindex', '0');
                    
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
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'License Agreement');

                // 1. Scrollable text area
                const scrollContainer = el.querySelector('.ts-first-launch-terms-conditions');
                if (scrollContainer) {
                    safeSetAttr(scrollContainer, 'role', 'article');
                    safeSetAttr(scrollContainer, 'aria-label', 'Terms and Conditions');
                    safeSetAttr(scrollContainer, 'tabindex', '0');
                }

                // 2. Buttons (Accept/Reject)
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

                // 3. Scroll helper button
                if (!el.querySelector('.ts-a11y-scroll-helper')) {
                    const buttonContainer = el.querySelector('.ts-first-launch-button-pocket');
                    if (buttonContainer && scrollContainer) {
                        const scrollBtn = document.createElement('button');
                        scrollBtn.className = 'tsv-button tsv-button-tinted ts-a11y-scroll-helper';
                        scrollBtn.style.marginBottom = '10px';
                        scrollBtn.innerHTML = '<div class="tsv-button-content tsv-flex tsv-flex-snd-center">Scroll to Bottom</div>';
                        
                        safeSetAttr(scrollBtn, 'aria-label', 'Scroll to end of agreement to enable Accept button');
                        safeSetAttr(scrollBtn, 'tabindex', '0');

                        scrollBtn.onclick = () => {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                            scrollContainer.dispatchEvent(new Event('scroll'));
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
                safeSetAttr(el, 'aria-label', 'Sign In Form');

                const buttonset = el.querySelector('.ts-first-launch-login-myts-buttonset');
                if (buttonset) {
                    const buttons = buttonset.querySelectorAll('.tsv-button');
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
                safeSetAttr(el, 'aria-label', 'Create Account Form');

                // Pending email verification state
                const pendingSection = el.querySelector('.ts-first-launch-create-myts-pending');
                if (pendingSection) {
                    const statusHeading = pendingSection.querySelector('.ts-first-launch-subtitle');
                    if (statusHeading) {
                        safeSetAttr(statusHeading, 'role', 'heading');
                        safeSetAttr(statusHeading, 'aria-level', '2');
                        safeSetAttr(statusHeading, 'tabindex', '0');
                    }
                }

                // Main heading
                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                    const label = heading.innerText.replace(/\n/g, ' ').trim();
                    safeSetAttr(heading, 'aria-label', label);
                }

                // Create Account button
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

                // Back button
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
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Account Created Successfully');

                const heading = el.querySelector('.ts-first-launch-subtitle');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                const icon = el.querySelector('svg[name="check"]');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
                    safeSetAttr(icon, 'aria-label', 'Success');
                }

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
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Account Recovery Key Setup');

                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                // Recovery key display
                const keyContainer = el.querySelector('.ts-first-launch-backup-key-actual');
                if (keyContainer) {
                    const keyTextEl = keyContainer.querySelector('p');
                    const key = keyTextEl ? keyTextEl.textContent.trim() : "";
                    
                    safeSetAttr(keyContainer, 'role', 'group');
                    safeSetAttr(keyContainer, 'aria-label', 'Your Recovery Key');
                    
                    if (keyTextEl) {
                        safeSetAttr(keyTextEl, 'tabindex', '0');
                        safeSetAttr(keyTextEl, 'aria-label', 'Recovery Key: ' + key);
                        keyTextEl.style.filter = 'none'; 
                        keyTextEl.style.opacity = '1';
                    }

                    // Copy button
                    if (!keyContainer.querySelector('.ts-a11y-copy-btn')) {
                        const copyBtn = document.createElement('button');
                        copyBtn.className = 'tsv-button tsv-button-tinted ts-a11y-copy-btn';
                        copyBtn.style.marginTop = '10px';
                        copyBtn.innerHTML = '<div class="tsv-button-content tsv-flex tsv-flex-snd-center">Copy Key to Clipboard</div>';
                        
                        safeSetAttr(copyBtn, 'aria-label', 'Copy recovery key to clipboard');
                        safeSetAttr(copyBtn, 'tabindex', '0');

                        copyBtn.onclick = () => {
                            if (key) {
                                navigator.clipboard.writeText(key).then(() => {
                                    const content = copyBtn.querySelector('.tsv-button-content');
                                    if(content) content.textContent = "Copied!";
                                    copyBtn.setAttribute('aria-label', 'Recovery key copied to clipboard');
                                    setTimeout(() => {
                                         if(content) content.textContent = "Copy Key to Clipboard";
                                         copyBtn.setAttribute('aria-label', 'Copy recovery key to clipboard');
                                    }, 2000);
                                });
                            }
                        };

                        keyContainer.parentElement.insertBefore(copyBtn, keyContainer.nextSibling);
                    }
                }

                // Explanation text
                const explain = el.querySelector('.ts-first-launch-backup-key-explain');
                if (explain) {
                     safeSetAttr(explain, 'tabindex', '0');
                     safeSetAttr(explain, 'role', 'note');
                }

                // Checkbox
                const checkboxContainer = el.querySelector('.ts-checkbox');
                if (checkboxContainer) {
                    const input = checkboxContainer.querySelector('input');
                    const label = checkboxContainer.querySelector('label');
                    const labelText = label ? label.textContent.trim() : "I have saved my recovery key";

                    safeSetAttr(checkboxContainer, 'role', 'checkbox');
                    safeSetAttr(checkboxContainer, 'tabindex', '0');
                    safeSetAttr(checkboxContainer, 'aria-label', labelText);
                    
                    const updateState = () => {
                         const isChecked = input && input.checked;
                         safeSetAttr(checkboxContainer, 'aria-checked', isChecked ? 'true' : 'false');
                    };
                    updateState();
                    
                    checkboxContainer.onclick = (e) => {
                        if (e.target !== input && input) {
                            input.click();
                        }
                        setTimeout(updateState, 50);
                    };
                    
                    checkboxContainer.onkeydown = (e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            if (input) input.click();
                            setTimeout(updateState, 50);
                        }
                    };
                    
                    if(input) input.addEventListener('change', updateState);
                }

                // Continue button
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
                
                // Back button
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
                safeSetAttr(el, 'aria-label', 'Theme Selection');

                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                const list = el.querySelector('.ts-first-launch-pick-theme-preview-items');
                if (list) {
                    safeSetAttr(list, 'role', 'radiogroup');
                    safeSetAttr(list, 'aria-label', 'Available Themes');
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

                const btn = el.querySelector('.ts-first-launch-button-pocket .tsv-button');
                if (btn) {
                    safeSetAttr(btn, 'role', 'button');
                    safeSetAttr(btn, 'tabindex', '0');
                    safeSetAttr(btn, 'aria-label', 'Continue with Selected Theme');
                }
                
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
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Setup Complete');

                const heading = el.querySelector('.ts-first-launch-subtitle');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
                    safeSetAttr(heading, 'tabindex', '0');
                }

                const explainer = el.querySelector('.ts-first-launch-finish-explainer');
                if (explainer) {
                    safeSetAttr(explainer, 'role', 'note');
                    safeSetAttr(explainer, 'tabindex', '0');
                }

                const finishBtn = el.querySelector('.ts-first-launch-finish-buttonset .tsv-button');
                if (finishBtn) {
                    safeSetAttr(finishBtn, 'role', 'button');
                    safeSetAttr(finishBtn, 'tabindex', '0');
                    safeSetAttr(finishBtn, 'aria-label', 'Finish Setup and Start Using TeamSpeak');
                }
                
                const icon = el.querySelector('svg[name="check"]');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
                    safeSetAttr(icon, 'aria-label', 'Success');
                }
            }
        },

        // -- [SECTION A] : Landmarks & Page Structure ---
        {
            name: "Activity Page (Main View)",
            selector: ".tsv-view.tsv-activity",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'aria-label', 'Activity Page');
            }
        },
        {
            name: "Sidebar (Complementary)",
            selector: ".tsv-sidebar",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'complementary');
                safeSetAttr(el, 'aria-label', 'Sidebar Navigation');
            }
        },
        {
            name: "Sidebar Banner",
            selector: ".tsv-header.tsv-highlight.tsv-sidebar-header",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'banner');
                safeSetAttr(el, 'aria-label', 'TeamSpeak Header');
            }
        },
        {
            name: "Footer (Settings/Profile)",
            selector: ".tsv-footer",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'contentinfo');
                safeSetAttr(el, 'aria-label', 'User Profile and Settings');
            }
        },
        {
            name: "Server View (Main View)",
            selector: ".tsv-view.tsv-activity-main",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'main');
                safeSetAttr(el, 'aria-label', 'Server View');
            }
        },

        // -- [SECTION B] : Headings & Typography ---
        {
            name: "Main Header Logo (H1)",
            selector: ".ts-title-logo",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'heading');
                safeSetAttr(el, 'aria-level', '1');
                safeSetAttr(el, 'aria-label', 'TeamSpeak');
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
        {
            name: "Sidebar Tab Items",
            selector: ".tsv-tab-item",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tab');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-selected', el.classList.contains('active') ? 'true' : 'false');
                
                // Add label if not present
                const label = el.getAttribute('aria-label') || el.textContent.trim();
                if (label) safeSetAttr(el, 'aria-label', label);
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
                safeSetAttr(el, 'aria-label', 'Server and Chat Resources');
            }
        },

        // -- [SECTION D] : Lists, Trees & Items ---
        {
            name: "Bookmark List Container",
            selector: ".bookmarks",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'list');
                safeSetAttr(el, 'aria-label', 'Bookmarks');
            }
        },
        {
            name: "Contact List Container",
            selector: ".ts-contact-list",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'list');
                safeSetAttr(el, 'aria-label', 'Contacts');
            }
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
                safeSetAttr(el, 'tabindex', '0');
                
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');

                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent.trim() : 'Bookmark';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        {
            name: "Bookmark Folders",
            selector: ".tsv-item.ts-bookmark-folder-box",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'listitem');
                safeSetAttr(el, 'tabindex', '0');
                
                const iconStack = el.querySelector('.tsv-item-icon-stack');
                if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');

                const textDiv = el.querySelector('.tsv-item-text .tsv-text-truncate');
                const label = textDiv ? textDiv.textContent.trim() : 'Folder';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        {
            name: "Server Tree Scroller",
            selector: ".vue-recycle-scroller.scroller.ts-server-tree-scroller",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'tree');
                safeSetAttr(el, 'aria-label', 'Server Channel Tree');
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
            name: "Server Tree Channel - OPTIMIZED",
            selector: ".ts-server-tree-item-leaf.channel:not(.spacer)",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'treeitem');
                safeSetAttr(el, 'tabindex', '0');

                const textEl = el.querySelector('.ts-server-tree-item-text');
                const name = textEl ? textEl.textContent.trim() : "Channel";

                let extras = [];
                if (el.classList.contains('has-password')) extras.push("Password Protected");
                if (el.classList.contains('is-full')) extras.push("Full");
                
                const extraInfo = extras.length > 0 ? `, ${extras.join(', ')}` : '';
                safeSetAttr(el, 'aria-label', `${name}${extraInfo}`);

                // Single keypress join (Enter or Space triggers double-click)
                if (!el.hasAttribute('data-a11y-join-handler')) {
                    el.setAttribute('data-a11y-join-handler', 'true');
                    
                    el.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Dispatch double-click to join channel
                            const dblClickEvent = new MouseEvent('dblclick', {
                                bubbles: true,
                                cancelable: true,
                                view: window
                            });
                            el.dispatchEvent(dblClickEvent);
                            
                            console.log(`[A11y] Channel join triggered via ${e.key} for: ${name}`);
                        }
                    });
                }

                // VoiceOver-friendly action button (visible to screen readers only)
                let joinBtn = el.querySelector('.ts-a11y-join-btn');
                if (!joinBtn) {
                    joinBtn = document.createElement('button');
                    joinBtn.className = 'ts-a11y-join-btn';
                    joinBtn.textContent = `Join ${name}`;
                    
                    // Screen reader only button (positioned off-screen)
                    joinBtn.style.position = 'absolute';
                    joinBtn.style.left = '-10000px';
                    joinBtn.style.width = '1px';
                    joinBtn.style.height = '1px';
                    joinBtn.setAttribute('tabindex', '-1'); 
                    joinBtn.setAttribute('aria-label', `Join channel ${name}`);

                    joinBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const dblClickEvent = new MouseEvent('dblclick', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        el.dispatchEvent(dblClickEvent);
                        console.log(`[A11y] Channel joined via button: ${name}`);
                    };

                    el.appendChild(joinBtn);
                }
            }
        },
        {
            name: "Server Tree Spacer",
            selector: ".ts-server-tree-item-leaf.spacer",
            match: () => true,
            apply: (el) => {
                const textEl = el.querySelector('.ts-server-tree-item-text');
                const hasText = textEl && textEl.textContent.trim().length > 0;
                
                if (hasText) {
                    safeSetAttr(el, 'role', 'heading');
                    safeSetAttr(el, 'aria-level', '3');
                    safeSetAttr(el, 'aria-label', textEl.textContent.trim());
                    safeSetAttr(el, 'tabindex', '0');
                } else {
                    safeSetAttr(el, 'role', 'separator');
                    safeSetAttr(el, 'aria-hidden', 'true');
                }
            }
        },

        // -- [SECTION E] : Inputs, Buttons & Controls ---
        {
            name: "Search Input",
            selector: ".tsv-search-input, input.tsv-search-input, .server-search-input input, .ts-text-input-box input",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'searchbox');
                const placeholder = el.getAttribute('placeholder');
                safeSetAttr(el, 'aria-label', placeholder || 'Search');
            }
        },
        {
            name: "Input Action Buttons",
            selector: ".ts-text-input-box-accept, .ts-text-input-box-delete, .ts-text-input-box-reveal",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                
                if (el.classList.contains('ts-text-input-box-accept')) {
                    safeSetAttr(el, 'aria-label', 'Submit');
                } else if (el.classList.contains('ts-text-input-box-delete')) {
                    safeSetAttr(el, 'aria-label', 'Clear Input');
                } else if (el.classList.contains('ts-text-input-box-reveal')) {
                    safeSetAttr(el, 'aria-label', 'Toggle Password Visibility');
                }
            }
        },
        {
            name: "Pagination Controls",
            selector: ".ts-pagination-horizontal .tsv-icon",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                
                if (el.classList.contains('prev-chevron')) {
                    safeSetAttr(el, 'aria-label', 'Previous Page');
                } else if (el.classList.contains('next-chevron')) {
                    safeSetAttr(el, 'aria-label', 'Next Page');
                }
            }
        },
        {
            name: "Footer Profile Section",
            selector: ".tsv-item-content.tsv-item-content-primary",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                
                const titleEl = el.querySelector(".tsv-text-truncate");
                if (titleEl) {
                    safeSetAttr(el, 'aria-label', `User Profile: ${titleEl.textContent.trim()}`);
                }
            }
        },
        {
            name: "Expand/Collapse Toggle",
            selector: ".ts-expander",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                
                const isExpanded = !el.classList.contains('collapsed');
                safeSetAttr(el, 'aria-expanded', isExpanded ? 'true' : 'false');
                
                const svg = el.querySelector('svg');
                const label = svg && svg.getAttribute('name') ? cleanLabel(svg.getAttribute('name')) : 'Toggle Section';
                safeSetAttr(el, 'aria-label', label);
            }
        },
        {
            name: "Context Menu Toggle",
            selector: ".tsv-tool-button-context-menu-toggle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                safeSetAttr(el, 'aria-label', 'Open Context Menu');
                safeSetAttr(el, 'aria-haspopup', 'menu');
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
            name: "Search Hexagon Button",
            selector: ".ts-sidebar-tab-sub-panel-accessory",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');
                
                const svg = el.querySelector('svg');
                const label = svg && svg.getAttribute('name') ? cleanLabel(svg.getAttribute('name')) : "Action";
                safeSetAttr(el, 'aria-label', label);
            }
        },

        // -- [SECTION F] : Widgets & Components ---
        {
            name: "Widget Wrapper",
            selector: ".ts-widget-wrapper",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                
                const titleEl = el.querySelector(".ts-widget-section-header .title");
                if (titleEl) {
                    safeSetAttr(el, 'aria-label', titleEl.textContent.trim());
                }
            }
        },
        {
            name: "Dashboard Widget",
            selector: ".tsv-dashboard-widget",
            match: (el) => el.querySelector('.ts-font-large'),
            apply: (el) => {
                const title = el.querySelector('.ts-font-large');
                if (title) {
                    safeSetAttr(el, 'role', 'article');
                    safeSetAttr(el, 'aria-label', title.textContent.trim());
                }
            }
        },
        {
            name: "Status Icons",
            selector: ".ts-server-tree-inactive-status, .tsv-icon.tsv-icon-stack",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'img');
                
                const svg = el.querySelector('svg');
                const label = svg && svg.getAttribute('name') ? cleanLabel(svg.getAttribute('name')) : 'Icon';
                safeSetAttr(el, 'aria-label', label);
            }
        },

        // -- [SECTION G] : Chat Area ---
        {
            name: "Chat Message",
            selector: ".ts-chat-message-content",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'article');
                safeSetAttr(el, 'tabindex', '0');
            }
        },
        {
            name: "Chat Input",
            selector: ".ts-chat-input-container .ts-input-as-text",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'textbox');
                safeSetAttr(el, 'contenteditable', 'true');
                safeSetAttr(el, 'aria-multiline', 'true');
                safeSetAttr(el, 'aria-label', 'Type a message');
            }
        },

        // -- [SECTION H] : Modals & Overlays ---
        {
            name: "Modal Dialog",
            selector: ".tsv-modal-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'dialog');
                safeSetAttr(el, 'aria-modal', 'true');

                const heading = el.querySelector('h1, h2, h3, h4, h5, h6, .title, .tsv-modal-header');
                if (heading) {
                    if (!heading.id) {
                        heading.id = 'ts-modal-heading-' + Math.random().toString(36).substr(2, 9);
                    }
                    safeSetAttr(el, 'aria-labelledby', heading.id);
                } else {
                    safeSetAttr(el, 'aria-label', 'Dialog');
                }
            }
        },
        {
            name: "Context Menu",
            selector: ".ts-context-menu",
            match: () => true,
            apply: (el) => {
                const style = el.getAttribute('style') || '';
                const isHidden = style.includes('visibility: hidden') || style.includes('display: none');
                
                if (isHidden) {
                    safeSetAttr(el, 'aria-hidden', 'true');
                } else {
                    safeSetAttr(el, 'role', 'menu');
                    safeSetAttr(el, 'aria-hidden', 'false');
                    
                    const menu = el.querySelector('.tsv-tool-menu');
                    if (menu) {
                        const menuHeading = menu.querySelector('.ts-tool-section');
                        if (menuHeading) {
                            const caption = menuHeading.querySelector('.ts-style-caption');
                            if (caption) {
                                safeSetAttr(menuHeading, 'aria-label', cleanLabel(caption.textContent));
                            }
                        }
                        
                        const menuItems = menu.querySelectorAll('.tsv-item');
                        menuItems.forEach((item) => {
                            const itemContainer = item.querySelector('.tsv-item-container');
                            if (itemContainer) {
                                safeSetAttr(itemContainer, 'role', 'menuitem');
                                safeSetAttr(itemContainer, 'tabindex', '0');
                                
                                const textEl = itemContainer.querySelector('.tsv-text-truncate');
                                if (textEl) {
                                    safeSetAttr(itemContainer, 'aria-label', cleanLabel(textEl.textContent));
                                }
                            }
                        });
                    }
                }
            }
        },
        {
            name: "Screen Share Window",
            selector: ".tsv-modal-overlay",
            match: () => true,
            apply: (el) => {
                const mainWindow = el.querySelector('.tsv-flex-column.tsv-modal-container');
                if (!mainWindow) return;
                
                safeSetAttr(mainWindow, 'role', 'dialog');
                safeSetAttr(mainWindow, 'aria-modal', 'true');
                safeSetAttr(mainWindow, 'aria-label', 'Screen Share Settings');

                // Preview
                const preview = mainWindow.querySelector('.setup-stream__preview-wrapper');
                if (preview) {
                    safeSetAttr(preview, 'role', 'img');
                    safeSetAttr(preview, 'aria-label', 'Screen Share Preview');
                }

                // Main section
                const mainSection = mainWindow.querySelector('.tsv-flex-grow.tsv-flex-column');
                if (mainSection) {
                    safeSetAttr(mainSection, 'role', 'region');
                    safeSetAttr(mainSection, 'aria-label', 'Screen Share Configuration');

                    // Tabs
                    const topBar = mainSection.querySelector('.tabs');
                    if (topBar) {
                        safeSetAttr(topBar, 'role', 'tablist');
                        safeSetAttr(topBar, 'aria-label', 'Source Types');

                        const tabs = topBar.querySelectorAll('.tab-item');
                        tabs.forEach(tab => {
                            safeSetAttr(tab, 'role', 'tab');
                            safeSetAttr(tab, 'tabindex', '0');
                            
                            const content = tab.querySelector('.tab-item-content');
                            const label = content ? content.textContent.trim() : 'Tab';
                            safeSetAttr(tab, 'aria-label', label);
                            safeSetAttr(tab, 'aria-selected', tab.classList.contains('tab-item-active') ? 'true' : 'false');
                        });
                    }

                    // Source selector
                    const sourceSelector = mainSection.querySelector('.tsv-scroll-area-v');
                    if (sourceSelector) {
                        safeSetAttr(sourceSelector, 'role', 'region');
                        safeSetAttr(sourceSelector, 'aria-label', 'Available Sources');
                        
                        const thumbnailGrid = sourceSelector.querySelector('.thumbnail-grid');
                        if (thumbnailGrid) {
                            safeSetAttr(thumbnailGrid, 'role', 'list');
                            
                            const thumbnails = thumbnailGrid.querySelectorAll('.tsv-flex-column.video-stream');
                            thumbnails.forEach((item) => {
                                safeSetAttr(item, 'role', 'listitem');
                                safeSetAttr(item, 'tabindex', '0');
                                
                                const titleEl = item.querySelector('.thumbnail-title.ts-font-small');
                                const label = titleEl ? titleEl.textContent.trim() : 'Source';
                                safeSetAttr(item, 'aria-label', label);
                                
                                // Hide decorative thumbnails
                                const thumbMin = item.querySelector('.thumbnail-img-minimized');
                                const thumbMax = item.querySelector('.thumbnail-img');
                                if (thumbMin) safeSetAttr(thumbMin, 'aria-hidden', 'true');
                                if (thumbMax) safeSetAttr(thumbMax, 'aria-hidden', 'true');
                                if (titleEl) safeSetAttr(titleEl, 'aria-hidden', 'true');
                            });
                        }
                    }
                }

                // Bottom actions bar
                const bottomBar = mainWindow.querySelector('.setup-stream__actions');
                if (bottomBar) {
                    safeSetAttr(bottomBar, 'role', 'toolbar');
                    safeSetAttr(bottomBar, 'aria-label', 'Screen Share Actions');
                    
                    const buttons = bottomBar.querySelectorAll('.tsv-button');
                    buttons.forEach(button => {
                        safeSetAttr(button, 'role', 'button');
                        safeSetAttr(button, 'tabindex', '0');
                        
                        const content = button.querySelector('.tsv-button-content');
                        const label = content ? content.textContent.trim() : 'Button';
                        safeSetAttr(button, 'aria-label', label);
                    });
                }
            }
        },
        {
            name: "Screen Share Settings",
            selector: ".setup-stream__settings",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Advanced Settings');
                
                const sections = el.querySelectorAll('.setup-stream__settings-section');
                sections.forEach(section => {
                    safeSetAttr(section, 'role', 'group');
                    
                    const heading = section.querySelector('.ts-expander');
                    if (heading) {
                        safeSetAttr(heading, 'role', 'heading');
                        safeSetAttr(heading, 'aria-level', '2');
                        safeSetAttr(heading, 'tabindex', '0');
                        
                        const labelContainer = heading.querySelector('.label .ts-font-large');
                        if (labelContainer) {
                            safeSetAttr(heading, 'aria-label', cleanLabel(labelContainer.textContent));
                        }
                        
                        const isExpanded = !heading.classList.contains('collapsed');
                        safeSetAttr(heading, 'aria-expanded', isExpanded ? 'true' : 'false');
                    }

                    const rows = section.querySelectorAll('.tsv-flex-row');
                    rows.forEach(row => {
                        const labelEl = row.querySelector('.tsv-label-inline, label');
                        const rowLabel = labelEl ? cleanLabel(labelEl.textContent) : 'Setting';
                        
                        safeSetAttr(row, 'role', 'group');
                        safeSetAttr(row, 'aria-label', rowLabel);

                        // Hide tooltip symbols
                        const qMark = row.querySelector('.tsv-question-mark');
                        if (qMark) safeSetAttr(qMark, 'aria-hidden', 'true');

                        // Segmented controls
                        const segControl = row.querySelector('.tsv-segmented-control');
                        if (segControl) {
                            safeSetAttr(segControl, 'role', 'radiogroup');
                            safeSetAttr(segControl, 'aria-label', rowLabel);
                            
                            const buttons = segControl.querySelectorAll('.tsv-segmented-button');
                            buttons.forEach(btn => {
                                safeSetAttr(btn, 'role', 'radio');
                                safeSetAttr(btn, 'tabindex', '0');
                                safeSetAttr(btn, 'aria-label', cleanLabel(btn.textContent));
                                safeSetAttr(btn, 'aria-checked', btn.classList.contains('active') ? 'true' : 'false');
                            });
                        }

                        // Number pickers
                        const numPicker = row.querySelector('.tsv-number-picker');
                        if (numPicker) {
                            const input = numPicker.querySelector('input');
                            if (input) {
                                safeSetAttr(input, 'role', 'spinbutton');
                                safeSetAttr(input, 'aria-label', rowLabel);
                            }
                            
                            const buttons = numPicker.querySelectorAll('.tsv-number-picker-button');
                            if (buttons.length >= 2) {
                                safeSetAttr(buttons[0], 'role', 'button');
                                safeSetAttr(buttons[0], 'aria-label', `Decrease ${rowLabel}`);
                                safeSetAttr(buttons[0], 'tabindex', '0');

                                safeSetAttr(buttons[1], 'role', 'button');
                                safeSetAttr(buttons[1], 'aria-label', `Increase ${rowLabel}`);
                                safeSetAttr(buttons[1], 'tabindex', '0');
                            }
                        }

                        // Toggles
                        const toggleWrapper = row.querySelector('.ts-toggle-wrapper');
                        if (toggleWrapper) {
                            const toggle = toggleWrapper.querySelector('.ts-toggle');
                            if (toggle) {
                                safeSetAttr(toggle, 'role', 'switch');
                                safeSetAttr(toggle, 'tabindex', '0');
                                safeSetAttr(toggle, 'aria-label', rowLabel);
                                
                                const inner = toggle.querySelector('.ts-toggle-inner');
                                const input = toggleWrapper.querySelector('input');
                                const isChecked = (inner && inner.classList.contains('checked')) || (input && input.checked);
                                safeSetAttr(toggle, 'aria-checked', isChecked ? 'true' : 'false');

                                if (!toggle.hasAttribute('data-a11y-toggle')) {
                                    toggle.setAttribute('data-a11y-toggle', 'true');
                                    
                                    toggle.addEventListener('keydown', (e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            if (input) input.click();
                                            else toggle.click();
                                            
                                            setTimeout(() => {
                                                const newChecked = (inner && inner.classList.contains('checked')) || (input && input.checked);
                                                safeSetAttr(toggle, 'aria-checked', newChecked ? 'true' : 'false');
                                            }, 100);
                                        }
                                    });
                                }
                            }
                        }
                    });
                });
            }
        },

        // -- [SECTION I] : Cleanup & Fallbacks ---
        {
            name: "Resize Handle",
            selector: ".tsv-resize-handle",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'separator');
                safeSetAttr(el, 'aria-hidden', 'true');
                safeSetAttr(el, 'aria-orientation', 'vertical');
            }
        },
        {
            name: "Hide Auto Resize Overlay",
            selector: ".tsv-resize-area-info",
            match: (el) => el.textContent.includes('Auto Resize'),
            apply: (el) => {
                el.style.display = 'none';
                safeSetAttr(el, 'aria-hidden', 'true');
            }
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

    console.log('[A11y Rules] Loaded ' + window.tsA11yRules.length + ' accessibility rules');
})();