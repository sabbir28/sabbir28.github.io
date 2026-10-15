/**
 * MD. SABBIR HOSHEN HOWLADER — DESKTOP PRECISION CUSTOM CURSOR MODULE
 * Custom trailing magnetic halo with fine-pointer physics and hover magnification.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const cursorRing = document.getElementById("cursorRing");
        const cursorDot = document.getElementById("cursorDot");
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;

        if (cursorRing && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
            let mouseX = -100;
            let mouseY = -100;
            let ringX = -100;
            let ringY = -100;
            let isVisible = false;

            window.addEventListener("mousemove", (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                if (!isVisible) {
                    isVisible = true;
                    cursorRing.style.opacity = "1";
                }
            }, { passive: true });

            function animateCursor() {
                // Smooth trailing physics lerp
                ringX += (mouseX - ringX) * 0.18;
                ringY += (mouseY - ringY) * 0.18;
                cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
                requestAnimationFrame(animateCursor);
            }
            animateCursor();

            // Click down/up active states
            window.addEventListener("mousedown", () => {
                cursorRing.classList.add("cursor-active");
            });

            window.addEventListener("mouseup", () => {
                cursorRing.classList.remove("cursor-active");
            });

            // Interactive target hover detection via event delegation
            const interactiveSelector = "a, button, [role='button'], input[type='submit'], input[type='button'], .button, .btn, .era-jump-btn, .timeline-btn, .copy-email-chip, .intro-skip-btn, .mobile-nav-toggle, .modal-close, .nav-cta, .interactive, .milestone-card, .project-card, .tool-card, .activity-card, .social-card";

            document.addEventListener("mouseover", (e) => {
                if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
                    cursorRing.classList.add("cursor-hover");
                }
            }, { passive: true });

            document.addEventListener("mouseout", (e) => {
                if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
                    cursorRing.classList.remove("cursor-hover");
                }
            }, { passive: true });

            // Hide halo when mouse leaves viewport
            document.addEventListener("mouseleave", () => {
                cursorRing.style.opacity = "0";
                isVisible = false;
            });

            document.addEventListener("mouseenter", () => {
                cursorRing.style.opacity = "1";
                isVisible = true;
            });
        }
    }

    root.Portfolio.cursor = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);
