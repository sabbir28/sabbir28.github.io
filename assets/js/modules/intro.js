/**
 * MD. SABBIR HOSHEN HOWLADER — CINEMATIC INTRO SEQUENCE MODULE
 * Handles SVG monogram animation, mask reveals, percentage counter, and safe dismiss logic.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    let introDismissed = false;

    function init() {
        const introElem = document.getElementById("cinematicIntro");
        const introSkipBtn = document.getElementById("introSkipBtn");
        const introCounter = document.getElementById("introCounter");
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;

        if (!introElem) return;

        function dismissCinematicIntro() {
            if (introDismissed || !introElem) return;
            introDismissed = true;

            introElem.classList.add("fade-out", "intro-dismissed");
            introElem.style.pointerEvents = "none";
            introElem.style.opacity = "0";
            document.body.classList.remove("intro-active");

            setTimeout(() => {
                introElem.style.display = "none";
                introElem.setAttribute("aria-hidden", "true");
            }, 600);
        }

        if (prefersReducedMotion) {
            dismissCinematicIntro();
            return;
        }

        // Percentage Counter Animation (00% -> 100%)
        let count = 0;
        const countInterval = setInterval(() => {
            count += Math.floor(Math.random() * 5) + 3;
            if (count > 100) count = 100;
            if (introCounter) {
                introCounter.textContent = (count < 10 ? "0" : "") + count + "%";
            }
            if (count >= 100) {
                clearInterval(countInterval);
                setTimeout(dismissCinematicIntro, 250);
            }
        }, 32);

        // Failsafe timer: Force dismiss after at most 2.4s under all circumstances
        setTimeout(() => {
            if (!introDismissed) {
                clearInterval(countInterval);
                dismissCinematicIntro();
            }
        }, 2400);

        if (introSkipBtn) {
            introSkipBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                clearInterval(countInterval);
                dismissCinematicIntro();
            });
        }

        // Clicking anywhere on intro backdrop dismisses it
        introElem.addEventListener("click", () => {
            clearInterval(countInterval);
            dismissCinematicIntro();
        });

        // Global Esc key dismisses intro
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !introDismissed) {
                clearInterval(countInterval);
                dismissCinematicIntro();
            }
        });

        // Expose replay function globally for footer action
        window.replayCinematicIntro = function () {
            if (!introElem) return;
            introDismissed = false;
            introElem.style.display = "flex";
            introElem.style.pointerEvents = "auto";
            introElem.style.opacity = "1";
            introElem.removeAttribute("aria-hidden");
            introElem.classList.remove("fade-out", "intro-dismissed");

            if (introCounter) introCounter.textContent = "00%";

            window.scrollTo({ top: 0, behavior: "instant" });

            let replayCount = 0;
            const replayInterval = setInterval(() => {
                replayCount += 4;
                if (replayCount > 100) replayCount = 100;
                if (introCounter) {
                    introCounter.textContent = (replayCount < 10 ? "0" : "") + replayCount + "%";
                }
                if (replayCount >= 100) {
                    clearInterval(replayInterval);
                    setTimeout(dismissCinematicIntro, 300);
                }
            }, 25);
        };
    }

    root.Portfolio.intro = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);
