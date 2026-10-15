/**
 * MD. SABBIR HOSHEN HOWLADER — LENIS SMOOTH MOMENTUM SCROLLING ENGINE
 * Smooth momentum physics integrated with GSAP ScrollTrigger.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    let lenisInstance = null;

    function init() {
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;
        if (window.Lenis && !prefersReducedMotion) {
            try {
                lenisInstance = new Lenis({
                    duration: 1.25,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    smoothTouch: false,
                    touchMultiplier: 1.5
                });

                // Prevent Lenis from intercepting the horizontal timeline
                const timelineContainer = document.getElementById("timelineScrollContainer");
                if (timelineContainer) {
                    timelineContainer.setAttribute("data-lenis-prevent", "true");
                }
            } catch (e) {
                console.warn("Lenis initialization notice:", e);
            }
        }
        return lenisInstance;
    }

    root.Portfolio.scroll = {
        init: init,
        getInstance: () => lenisInstance
    };
})(typeof window !== "undefined" ? window : this);
