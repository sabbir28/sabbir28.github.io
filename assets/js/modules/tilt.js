/**
 * MD. SABBIR HOSHEN HOWLADER — 3D TILT & DYNAMIC SPOTLIGHT ENGINE
 * Realistic 3D card tilt and cursor-following spotlight glow for capability cards.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const capabilityCards = document.querySelectorAll(".capability-card");
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;

        if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
            capabilityCards.forEach((card) => {
                card.addEventListener("mousemove", (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -7;
                    const rotateY = ((x - centerX) / centerX) * 7;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
                    card.style.setProperty("--mouse-x", `${x}px`);
                    card.style.setProperty("--mouse-y", `${y}px`);
                });

                card.addEventListener("mouseleave", () => {
                    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
                });
            });
        }
    }

    root.Portfolio.tilt = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);
