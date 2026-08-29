
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

    // Settings screens pair most controls with a "<label>" describing them, but the
    // wrapper markup varies a lot between screens: sometimes the <label> is a direct
    // child of the row, sometimes it's a sibling of an intermediate generic wrapper
    // div (e.g. a plain ".tsv-flex" used only for layout) that sits between the row
    // and the control. Matching by wrapper CLASS NAME (e.g. `.closest('.tsv-flex-row')`)
    // is fragile: `.closest()` stops at the nearest ancestor whose class happens to
    // match, even if that ancestor doesn't actually contain the <label> - silently
    // mislabeling the control from an unrelated row further out, or missing the label
    // entirely. Instead, this walks straight up looking for the <label> itself.
    //
    // `controlSelector` (e.g. ".multiselect[role='combobox']") guards each level: only
    // trust a <label> found at a level that uniquely owns this ONE control. Without
    // that check, climbing high enough always finds *some* label - just not the right
    // one, once the ancestor is big enough to contain multiple unrelated rows.
    function findSettingsRowLabel(el, controlSelector) {
        const ownsOnlyThisControl = (ancestor) =>
            !controlSelector || ancestor.querySelectorAll(controlSelector).length === 1;

        // Tier 1: an explicit <label> found while still uniquely owning the control.
        let ancestor = el.parentElement;
        for (let i = 0; i < 6 && ancestor; i++) {
            if (ownsOnlyThisControl(ancestor)) {
                const label = ancestor.querySelector('label');
                if (label) {
                    const titleSpan = label.querySelector('span');
                    const text = (titleSpan ? titleSpan.textContent : label.textContent).trim();
                    if (text) return text;
                }
            }
            ancestor = ancestor.parentElement;
        }

        // Tier 2: no <label> anywhere while unique (e.g. the Notifications event
        // list, which has no <label> at all) - use the nearest such ancestor's first
        // short text node as the name instead.
        ancestor = el.parentElement;
        for (let i = 0; i < 6 && ancestor; i++) {
            if (ownsOnlyThisControl(ancestor)) {
                const leaf = Array.from(ancestor.querySelectorAll('*')).find(n =>
                    n.children.length === 0 && n.textContent.trim().length > 0 && n.textContent.trim().length < 60
                );
                if (leaf) return leaf.textContent.trim();
            }
            ancestor = ancestor.parentElement;
        }

        return '';
    }

    // -- Rules Configuration ---

    window.tsA11yRules = [

        // -- [SECTION A] : First-Launch Onboarding Flow ---
        // [DESCRIPTION] Covers the one-time setup wizard (splash, license, account
        // creation/sign-in, recovery key, theme picker) shown only on first launch.
        {
            name: "Splash Screen",
            selector: ".ts-first-launch-splash", // Target the container
            match: () => true,
            apply: (el) => {
                const icon = el.querySelector('.ts-first-launch-splash-icons');
                if (icon) {
                    safeSetAttr(icon, 'role', 'img');
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

                // Special handling for "Waiting for Email" state
                const pendingSection = el.querySelector('.ts-first-launch-create-myts-pending');
                if (pendingSection) {
                    const statusHeading = pendingSection.querySelector('.ts-first-launch-subtitle');
                    if (statusHeading) {
                        safeSetAttr(statusHeading, 'role', 'heading');
                        safeSetAttr(statusHeading, 'aria-level', '2');
                    }
                }

                // 1. Heading
                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
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
                        safeSetAttr(keyTextEl, 'role', 'text');
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
                                    if (content) content.textContent = "Copied!";
                                    setTimeout(() => {
                                        if (content) content.textContent = "Copy Key to Clipboard";
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
                    if (input) input.addEventListener('change', updateState);
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

                const heading = el.querySelector('.ts-first-launch-title');
                if (heading) {
                    safeSetAttr(heading, 'role', 'heading');
                    safeSetAttr(heading, 'aria-level', '1');
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

        // -- [SECTION B] : Landmarks & Page Structure ---
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

        // -- [SECTION C] : Headings & Typography ---
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
        {
            name: "Teamspeak Server Error Screen",
            selector: ".overlay-info-wrapper.tsv-header-safe-area",
            match: () => true,
            apply: (el) => {
                // Announced automatically: this replaces the whole view when a connection fails.
                safeSetAttr(el, 'role', 'alert');
                safeSetAttr(el, 'aria-label', 'Server Connection Error');
                safeSetAttr(el, 'tabindex', '0');

                const errContainer = el.querySelector('.overlay-info');
                if (!errContainer) return;

                safeSetAttr(errContainer, 'role', 'region');
                safeSetAttr(errContainer, 'aria-label', 'Connection Error Details');
                safeSetAttr(errContainer, 'tabindex', '0');

                const errTitle = errContainer.querySelector('.overlay-info-title');
                if (errTitle) {
                    safeSetAttr(errTitle, 'role', 'heading');
                    safeSetAttr(errTitle, 'aria-level', '2');
                    safeSetAttr(errTitle, 'tabindex', '0');
                }

                const errMsgs = errContainer.querySelectorAll('.overlay-info-subtitle');
                errMsgs.forEach((errMsg) => {
                    safeSetAttr(errMsg, 'role', 'text');
                    safeSetAttr(errMsg, 'aria-label', errMsg.textContent.replace(/\s+/g, ' ').trim());
                    safeSetAttr(errMsg, 'tabindex', '0');
                });

                const retryBtn = errContainer.querySelector('.tsv-button');
                if (retryBtn) {
                    const content = retryBtn.querySelector('.tsv-button-content');
                    const label = content ? content.textContent.trim() : 'Retry';
                    safeSetAttr(retryBtn, 'role', 'button');
                    safeSetAttr(retryBtn, 'aria-label', label);
                    safeSetAttr(retryBtn, 'tabindex', '0');
                }
            }
        },
        // -- [SECTION D] : Navigation & Tabs ---
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
                safeSetAttr(el, 'role', 'menuitem');
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

        // -- [SECTION E] : Lists, Trees & Items ---
        // [DESCRIPTION] Handles structured data like the server tree, bookmarks and lists.
        {
            name: "Bookmark List Container",
            selector: ".bookmarks",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'menu')
                let entries = el.querySelectorAll('.tsv-item.ts-bookmark-entry')
                if (entries) { // Bookmark Entries
                    entries.forEach(entry => {
                        safeSetAttr(entry, 'role', 'menuitem');
                        const iconStack = entry.querySelector('.tsv-item-icon-stack');
                        if (iconStack) safeSetAttr(iconStack, 'aria-hidden', 'true');
                        const textDiv = entry.querySelector('.tsv-item-text .tsv-text-truncate');
                        const label = textDiv ? textDiv.textContent : 'Bookmark';
                        safeSetAttr(entry, 'aria-label', label);
                    })
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
            // Virtual-scrolling libraries render extra zero-height buffer rows outside
            // the visible range (e.g. "data-idx=-1", "height: 0px") to make scroll math
            // work. These carry no content, but without this check they'd still get
            // labeled as a real, focusable, empty menu item - a silent, pointless tab
            // stop for keyboard/screen-reader users. The same selector also matches
            // fake preview rows (mock usernames/avatars with no real aria-label source)
            // rendered *inside* the Appearance page's Compact/Detailed style-preview
            // cards purely for visual mockup purposes; those cards already get their
            // own single accessible name from the "Settings Picker Card Item" rule
            // (role="radio"), so the decorative rows inside are skipped here too.
            name: "Virtual List Items (Generic)",
            selector: ".tsv-virtual-list-item, .ts-room-list-item",
            match: (el) => el.getBoundingClientRect().height > 0 && !el.closest('[role="radio"]'),
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

                safeSetAttr(el, 'aria-label', `${name}${extra}. Press Enter twice quickly to join the channel.`);
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

        // -- [SECTION F] : Settings Panel Structure ---
        // [DESCRIPTION] Landmarks and menu semantics for the Settings screen's
        // category sidebar (Account, Appearance, Key Bindings, etc.).
        {
            name: "Settings View Structure",
            selector: ".tsv-settings",
            match: () => true,
            apply: (el) => {
                // Defines the main container for settings
                safeSetAttr(el, 'role', 'group');
                safeSetAttr(el, 'aria-label', 'Settings Interface');

                // LEFT SECTION: Categories/Menu
                const leftSection = el.querySelector('.tsv-settings-categories');
                if (leftSection) {
                    safeSetAttr(leftSection, 'role', 'navigation');
                    safeSetAttr(leftSection, 'aria-label', 'Settings Categories Navigation');

                    // Process categories within the left section
                    const categories = leftSection.querySelectorAll('.tsv-settings-category');
                    categories.forEach((category) => {
                        const header = category.querySelector('.tsv-sidebar-tab-header');
                        let categoryName = "Settings Group";

                        if (header) {
                            categoryName = header.textContent.trim();
                            safeSetAttr(header, 'role', 'heading');
                            safeSetAttr(header, 'aria-level', '2');
                        }

                        const menu = category.querySelector('.tsv-activity-group-list');
                        if (menu) {
                            safeSetAttr(menu, 'role', 'menu');
                            safeSetAttr(menu, 'aria-label', categoryName);
                        }
                    });
                }
            }
        },
        {
            // The vue-multiselect dropdown used throughout Settings (Language, Icon View
            // Mode, Audio/Video device pickers, ...) already ships with role="combobox"
            // and a "listbox"/"option" popup, but it has no accessible name of its own -
            // it lives in a ".tsv-flex-row" next to a <label> that isn't wired to it.
            // NOTE: match is unconditional (not just "no aria-label yet") because
            // vue-multiselect sometimes sets its OWN aria-label to the current
            // selected value (seen e.g. on a disabled device/codec picker) - that
            // looks "already labeled" but doesn't say what the control is for. The
            // row-derived label below is always preferred when one is found; if none
            // is found, any pre-existing aria-label is left untouched.
            name: "Settings Row Dropdown (Multiselect)",
            selector: ".multiselect[role='combobox']",
            match: () => true,
            apply: (el) => {
                const label = findSettingsRowLabel(el, ".multiselect[role='combobox']");
                if (label) safeSetAttr(el, 'aria-label', label);
                safeSetAttr(el, 'aria-haspopup', 'listbox');
            }
        },
        {
            // Segmented on/off controls reused all across Settings (Notifications,
            // Chats, Whispers, Connections, ...) in two flavors: icon-only pairs (an
            // "X" and a checkmark, no text) and text-labeled ones ("Hidden" / "Dynamic"
            // / "Always Visible"). Neither flavor had ANY role or tabindex before this
            // rule - completely invisible to keyboard/screen-reader navigation. Icon-
            // only buttons additionally need a name built from their row (otherwise
            // every row's pair falls through to the generic fallback and all get the
            // exact same label, e.g. "Item Close" repeated on every single row); text-
            // labeled buttons already have a clear name from their own content.
            // This intentionally excludes Screen Share's setup panel, which has its
            // own dedicated rule below with different semantics (aria-pressed toggle
            // buttons rather than a mutually-exclusive radio group).
            name: "Settings Row Segmented Toggle",
            selector: ".tsv-segmented-control",
            match: (el) => !el.closest('.setup-stream__settings'),
            apply: (el) => {
                const rowName = findSettingsRowLabel(el, '.tsv-segmented-control');
                safeSetAttr(el, 'role', 'radiogroup');
                if (rowName) safeSetAttr(el, 'aria-label', rowName);

                el.querySelectorAll('.tsv-segmented-button').forEach((btn) => {
                    safeSetAttr(btn, 'role', 'radio');
                    safeSetAttr(btn, 'tabindex', '0');
                    safeSetAttr(btn, 'aria-checked', btn.classList.contains('active') ? 'true' : 'false');

                    if (!btn.textContent.trim()) {
                        const svg = btn.querySelector('svg');
                        const iconName = svg ? cleanLabel(svg.getAttribute('name') || '') : '';
                        safeSetAttr(btn, 'aria-label', rowName ? `${rowName}: ${iconName}` : iconName);
                    }
                });
            }
        },
        {
            // Card-style single-choice pickers reused across Settings > Appearance:
            // Theme (Dark/Light), Display Size (Small/Medium/Large), and the List/Chat
            // Style previews (Compact/Detailed). None of them expose any role today.
            name: "Settings Picker Card Groups",
            selector: ".tsv-settings-theme-picker, .ts-collection-container",
            match: (el) => !!el.querySelector('.tsv-settings-theme-picker-item, .ts-collection-item.ts-magnify-container'),
            apply: (el) => {
                safeSetAttr(el, 'role', 'radiogroup');
                // Use the GROUP's own selector (not the individual item selector) for
                // the uniqueness check here: a group always contains several matching
                // items by design, so checking "exactly one item" would never pass -
                // what needs to be unique is that the ancestor contains only this one
                // picker group, not a sibling one (e.g. Display Size vs. Chat Style).
                const groupLabel = findSettingsRowLabel(el, '.tsv-settings-theme-picker, .ts-collection-container');
                if (groupLabel) safeSetAttr(el, 'aria-label', groupLabel);
            }
        },
        {
            name: "Settings Picker Card Item",
            selector: ".tsv-settings-theme-picker-item, .ts-collection-item.ts-magnify-container",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'radio');
                safeSetAttr(el, 'tabindex', '0');
                const isSelected = el.classList.contains('active') || el.classList.contains('selected');
                safeSetAttr(el, 'aria-checked', isSelected ? 'true' : 'false');

                // These cards contain large decorative preview markup (fake avatars,
                // sample chat bubbles, ...). Derive the label from the first short text
                // node instead, so screen readers hear "Small" / "Compact" rather than
                // the whole preview being read out.
                const candidates = Array.from(el.querySelectorAll('*')).filter(n =>
                    n.children.length === 0 && n.textContent.trim().length > 0 && n.textContent.trim().length < 20
                );
                const label = candidates.length ? candidates[0].textContent.trim() : el.textContent.trim().slice(0, 30);
                safeSetAttr(el, 'aria-label', label);
            }
        },

        // -- [SECTION G] : Inputs, Buttons & Controls ---
        // [DESCRIPTION] Covers interactive elements like search inputs, buttons and toggles.
        {
            // Custom drag-only sliders (Output Volume, Mic level, Security Level, ...).
            // Most render as a ".master-fader#<id>" wrapper with a native
            // "<label for=...>" pointing at that id; others (e.g. "Security Level" in
            // Identities, or sliders sitting in a plain ".ts-card-setting-container"
            // row like the device pickers) have no such id/label pairing at all, so
            // those fall back to the same row-label lookup used for dropdowns.
            // A hidden "<input type=number readonly>" holds the real value; the
            // draggable knob itself has no ARIA at all today.
            // NOTE: this only exposes the current value for discovery - it deliberately
            // does NOT get a tabindex, because dragging is still the only way to change
            // it. Making it a tab stop without also wiring up arrow-key support would
            // create a keyboard trap (focusable, but nothing happens on Enter/arrows).
            name: "Level Sliders (Volume, etc.)",
            selector: ".ts-slider",
            match: () => true,
            apply: (el) => {
                const wrapper = el.parentElement;
                let label = wrapper && wrapper.id ? document.querySelector('label[for="' + wrapper.id + '"]') : null;
                let labelText = label ? label.textContent.trim() : findSettingsRowLabel(el, '.ts-slider');
                const hiddenInput = el.querySelector('input.ts-slider-hidden');

                safeSetAttr(el, 'role', 'slider');
                safeSetAttr(el, 'aria-valuemin', '0');
                safeSetAttr(el, 'aria-valuemax', '100');
                if (hiddenInput) safeSetAttr(el, 'aria-valuenow', hiddenInput.value);
                if (labelText) safeSetAttr(el, 'aria-label', labelText);
            }
        },
        {
            // The hotkey chip on Settings > Key Bindings (e.g. "ALT + SHIFT + M") - had
            // no role or tabindex at all despite being a real button: clicking it
            // starts a "press a new key combination" capture. NOTE: labeling only,
            // deliberately not click-tested here - clicking it live puts the row into
            // that capture state, which requires a genuine OS-level keypress (this
            // app's hotkeys use a native/global listener, not a DOM keydown handler)
            // to complete safely, which browser automation cannot reliably provide.
            name: "Key Binding Hotkey Capture",
            selector: ".ts-keybinds-hotkeys-key",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'role', 'button');
                safeSetAttr(el, 'tabindex', '0');

                const entry = el.closest('.ts-keybinds-hotkeys-entry');
                const nameEl = entry ? entry.querySelector('.ts-keybinds-hotkeys-entry-name') : null;
                const name = nameEl ? nameEl.textContent.trim() : 'Key Binding';

                const valueSpan = el.querySelector('span');
                const currentValue = valueSpan ? valueSpan.textContent.trim() : 'Not set';

                safeSetAttr(el, 'aria-label', `${name}: ${currentValue}. Press Enter to record a new key combination.`);
            }
        },
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

                const isExpanded = !el.classList.contains('collapsed');
                safeSetAttr(el, 'aria-expanded', isExpanded ? 'true' : 'false');

                // 1. Prefer an explicit inline text label on the expander itself
                const labelEl = el.querySelector('.label');
                let name = labelEl ? labelEl.textContent.trim() : '';

                // 2. Otherwise, fall back to the name of the section/channel it belongs to
                //    (icon-only expanders, e.g. channel tree or sidebar section headers).
                if (!name) {
                    const context = el.closest('.ts-server-tree-item-node-content') || el.closest('.tsv-bar');
                    if (context) name = context.textContent.replace(/\s+/g, ' ').trim();
                }

                const action = isExpanded ? 'Collapse' : 'Expand';
                safeSetAttr(el, 'aria-label', name ? `${action} ${name}` : `${action} Section`);
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

        // -- [SECTION H] : Widgets & Complex Components ---
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

        // -- [SECTION I] : Chat Area ---
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

        // -- [SECTION J] : Modals & Overlays ---
        // [DESCRIPTION] Popup dialogs, context menus, the notifications panel,
        // and the Screen Share setup window and its settings sub-panels.
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
                const status = el.getAttribute('style') || '';
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
        {
            name: "Notifications Center Panel",
            selector: ".ts-notifications-center",
            match: () => true,
            apply: (el) => {
                // This popover is a ".ts-context-menu" variant without a ".tsv-tool-menu"
                // inside, so the generic context-menu rule above intentionally skips it.
                safeSetAttr(el, 'role', 'region');
                safeSetAttr(el, 'aria-label', 'Notifications');
                safeSetAttr(el, 'tabindex', '0');

                const placeholder = el.querySelector('.ts-notificatoin-center-placeholder');
                if (placeholder) {
                    safeSetAttr(placeholder, 'role', 'status');
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
            // NOTE: this runs on every ".tsv-flex-row" in the whole stream settings
            // panel, including "Preset" up in Basic Settings - it's not exclusive to
            // the Advanced section despite the name. It used to derive the row label
            // from `.tsv-flex` (the whole label wrapper), which also contains the "?"
            // tooltip-trigger span next to the text - producing labels like
            // "? Preset" instead of "Preset". It also called .querySelectorAll on
            // ".tsv-segmented-control.tsv-mar-t-small" without checking it was found
            // first, which throws (and, since each rule's errors are only caught
            // per-rule, silently skips every remaining row in the same pass) on any
            // row - like Preset's - whose segmented control doesn't carry that exact
            // modifier class.
            name: "Advanced Settings Groups Accessibility",
            selector: ".setup-stream__settings",
            match: () => true,
            apply: (el) => {
                const advanced_settings_items = el.querySelectorAll(".tsv-flex-row");
                advanced_settings_items.forEach(item => {
                    const labelEl = item.querySelector('.tsv-label-inline') || item.querySelector('.tsv-flex');
                    if (labelEl) safeSetAttr(item, 'aria-label', cleanLabel(labelEl.textContent));
                    safeSetAttr(item, 'role', 'group');
                    safeSetAttr(item, 'tabindex', '0');

                    const pickerType_params = item.querySelector('.tsv-flex-grow');
                    if (pickerType_params) {
                        const picker_field = pickerType_params.querySelector('.tsv-number-picker-field');
                        safeSetAttr(picker_field, 'role', 'textfield');
                    }
                    // Accessibilità pulsanti Advanced Settings
                    const btnType_controls_section = item.querySelector('.tsv-flex-1'); // Sezione controlli
                    const btnList = btnType_controls_section
                        ? btnType_controls_section.querySelector('.tsv-segmented-control.tsv-mar-t-small')
                        : null;
                    if (btnList) {
                        btnList.querySelectorAll('.tsv-segmented-button').forEach(btn => {
                            safeSetAttr(btn, 'role', 'button');
                            safeSetAttr(btn, 'aria-label', btn.textContent);
                            safeSetAttr(btn, 'tabindex', '0');
                        });
                    }
                });
            }
        },
        // -- [SECTION K] : Cleanup & Fallbacks ---
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
            // Last-resort labeling for any icon-bearing action not already covered by
            // a more specific rule above. Prefers the button's own visible text (e.g.
            // an identity/profile name next to a decorative icon) over the icon's SVG
            // name - a bare icon name like "mode-server-compact" describes the glyph,
            // not what the button does, and is actively misleading when real text sits
            // right next to it.
            name: "Generic Button Fallback",
            selector: ".tsv-action, .tsv-button",
            match: (el) => !el.hasAttribute('aria-label') && el.querySelector('svg'),
            apply: (el) => {
                const textEl = el.querySelector('.tsv-text-truncate') || el.querySelector('.tsv-item-text');
                const visibleText = textEl ? textEl.textContent.replace(/\s+/g, ' ').trim() : '';
                if (visibleText) {
                    safeSetAttr(el, 'role', 'button');
                    safeSetAttr(el, 'tabindex', '0');
                    safeSetAttr(el, 'aria-label', visibleText);
                    return;
                }

                const svg = el.querySelector('svg');
                if (svg) {
                    const label = svg.getAttribute('name') || 'Action';
                    safeSetAttr(el, 'role', 'button');
                    safeSetAttr(el, 'tabindex', '0');
                    safeSetAttr(el, 'aria-label', cleanLabel(label));
                }
            }
        },
        {
            // TeamSpeak marks controls that are temporarily unavailable (e.g. the "More
            // Options" toolbar button when there is nothing to act on) with this class,
            // purely visually (dimmed color). Earlier rules in this file still grant
            // those controls role="button" + tabindex="0" since they don't know about
            // this state, so a keyboard user could tab to and "press" a button that
            // silently does nothing. This rule runs last and corrects that: it removes
            // the control from the tab order and marks it aria-disabled, matching how a
            // native <button disabled> behaves.
            name: "Respect Visually-Disabled Controls",
            selector: ".tsv-is-visually-disabled",
            match: () => true,
            apply: (el) => {
                safeSetAttr(el, 'aria-disabled', 'true');
                safeSetAttr(el, 'tabindex', '-1');
            }
        },

        // -- [SECTION L] : Global "Modal Mode" Management ---
        // [DESCRIPTION] Detects if any Onboarding/Splash modal is present.
        // If so, it hides EVERYTHING ELSE (siblings of the modal and siblings of its ancestors)
        // from screen readers, ensuring the modal is the only thing "visible".
        {
            name: "Onboarding Modal Manager",
            selector: 'body',
            match: () => true,
            apply: (root) => {
                // 1. List of known onboarding overlay/modal containers
                const modalSelectors = [
                    '.ts-first-launch-splash',
                    '.ts-first-launch-terms-conditions-container',
                    '.ts-first-launch-login-myts-container',
                    '.ts-first-launch-create-myts-container',
                    '.ts-first-launch-create-myts-pending',
                    '.ts-first-launch-create-myts-final',
                    '.ts-first-launch-backup-key-container',
                    '.ts-first-launch-pick-theme-container',
                    '.ts-first-launch-finish'
                ];

                // 2. Determine Active Modal
                let activeModal = null;
                for (const sel of modalSelectors) {
                    // Check visibility: offsetParent is null if display:none
                    const el = document.querySelector(sel);
                    if (el && el.offsetParent !== null) {
                        activeModal = el;
                        break;
                    }
                }

                // 3. Helper: Hide node
                const hideNode = (node) => {
                    if (node.nodeType !== 1) return; // Elements only
                    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'LINK') return;

                    // Don't double-hide
                    if (node.getAttribute('aria-hidden') === 'true' && !node.hasAttribute('data-ts-a11y-hidden')) return;

                    safeSetAttr(node, 'aria-hidden', 'true');
                    safeSetAttr(node, 'inert', 'true');
                    safeSetAttr(node, 'data-ts-a11y-hidden', 'true'); // Mark as hidden
                };

                // 4. Helper: Show node (if we hid it)
                const showNode = (node) => {
                    if (node.getAttribute('data-ts-a11y-hidden') === 'true') {
                        safeRemoveAttr(node, 'aria-hidden');
                        safeRemoveAttr(node, 'inert');
                        safeRemoveAttr(node, 'data-ts-a11y-hidden');
                    }
                };

                if (activeModal) {
                    // --- HIDE MODE ---
                    // Traverse up from modal to body
                    let curr = activeModal;
                    while (curr && curr !== document.body) {
                        const parent = curr.parentElement;
                        if (!parent) break;

                        // Hide all siblings of curr
                        for (const child of parent.children) {
                            if (child !== curr) {
                                hideNode(child);
                            }
                        }

                        // Ensure ancestors are visible
                        showNode(curr);
                        if (curr.hasAttribute('aria-hidden')) {
                            safeRemoveAttr(curr, 'aria-hidden');
                            safeRemoveAttr(curr, 'inert');
                        }

                        curr = parent;
                    }

                    // Ensure modal has dialog role
                    if (!activeModal.hasAttribute('role')) {
                        safeSetAttr(activeModal, 'role', 'dialog');
                        safeSetAttr(activeModal, 'aria-modal', 'true');
                    }

                } else {
                    // --- RESTORE MODE ---
                    // Find ALL elements we hid and restore them
                    const hiddenNodes = document.querySelectorAll('[data-ts-a11y-hidden="true"]');
                    hiddenNodes.forEach(node => showNode(node));
                }
            }
        }
    ];
}) ();
