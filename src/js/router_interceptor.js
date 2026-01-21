(function() {
    console.error("Accessibility Injector: STARTED.");

    function findVueRoot() {
        // Method 1: Check known IDs
        const ids = ['app', 'ts-app-main', 'ts-app-loading-overlay'];
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) {
                console.error(`Accessibility Injector: Found element #${id}`);
                if (el.__vue__) {
                    console.error("Accessibility Injector: Found __vue__ on", id);
                    return el.__vue__;
                }
            }
        }

        // Method 2: Walk the DOM tree for any element with __vue__
        // This is heavy but useful for probing
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
        let node;
        while (node = walker.nextNode()) {
            if (node.__vue__) {
                console.error("Accessibility Injector: Found __vue__ on", node.tagName, node.className);
                if (node.__vue__.$router) {
                    console.error("Accessibility Injector: AND it has $router!");
                    return node.__vue__;
                }
            }
        }
        
        return null;
    }

    function hookRouter(app) {
        if (!app.$router) {
            console.error("Accessibility Injector: Vue instance has no $router");
            return;
        }

        console.error("Accessibility Injector: Hooking router...");
        try {
            app.$router.afterEach((to, from) => {
                console.error(`Accessibility Injector: ROUTE CHANGE -> ${to.path}`);
            });
            console.error("Accessibility Injector: Hook registered.");
            console.error("Accessibility Injector: Current route: " + app.$route.path);
        } catch (e) {
            console.error("Accessibility Injector: Error hooking router: " + e.message);
        }
    }

    let app = findVueRoot();
    if (app) {
        hookRouter(app);
    } else {
        console.error("Accessibility Injector: Vue root NOT found. Retrying in 2s...");
        setTimeout(() => {
            app = findVueRoot();
            if (app) hookRouter(app);
            else console.error("Accessibility Injector: Still nothing.");
        }, 2000);
    }
})();