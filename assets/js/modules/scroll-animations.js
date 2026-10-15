/**
 * MD. SABBIR HOSHEN HOWLADER — SCROLL CHOREOGRAPHY & ANIMATIONS MODULE
 * GSAP ScrollTrigger Master Choreography Suite with Resilient Observer Fallback.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init(lenis) {
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;
        const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);

        // Flag HTML as having active motion capabilities
        if (!prefersReducedMotion) {
            document.documentElement.classList.add("has-motion");
        }

        // 1. Resilient Native Observer for all Reveal Elements
        // Guarantees all sections, headers, and media become visible immediately upon scroll
        if ("IntersectionObserver" in window) {
            const revealObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-revealed", "visible");

                        // If it's the metrics strip, trigger number counters
                        if (entry.target.classList.contains("metrics-strip") || entry.target.id === "aboutMetricsStrip") {
                            entry.target.querySelectorAll(".metric-item-num").forEach((numEl) => {
                                const target = parseFloat(numEl.getAttribute("data-target") || numEl.textContent || "0");
                                const suffix = numEl.textContent.replace(/[0-9.]/g, "");
                                animateNumberCounter(numEl, target, 1600, suffix);
                            });
                        }

                        obs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            });

            const revealSelectors = [
                ".reveal-on-scroll",
                ".reveal-scale",
                ".curtain-clip-reveal",
                ".track-expand-reveal",
                ".metrics-strip",
                ".capability-card",
                ".timeline-milestone",
                ".milestone-card",
                ".project-card",
                ".tool-card",
                ".activity-card",
                ".social-card"
            ];

            document.querySelectorAll(revealSelectors.join(", ")).forEach((el) => {
                revealObserver.observe(el);
            });
        } else {
            // Fallback: Reveal everything immediately
            document.querySelectorAll(".reveal-on-scroll, .reveal-scale, .curtain-clip-reveal, .track-expand-reveal").forEach((el) => {
                el.classList.add("is-revealed", "visible");
            });
        }

        // 2. GSAP Enhanced Choreography (if loaded & motion allowed)
        if (hasGSAP && !prefersReducedMotion) {
            try {
                gsap.registerPlugin(ScrollTrigger);

                // Connect Lenis with ScrollTrigger if active
                if (lenis && typeof lenis.on === "function") {
                    lenis.on("scroll", ScrollTrigger.update);
                    gsap.ticker.add((time) => {
                        lenis.raf(time * 1000);
                    });
                    gsap.ticker.lagSmoothing(0);
                }

                // Hero Parallax on Scroll (calibrated to fixed 72px navbar)
                gsap.to(".hero-content", {
                    yPercent: -12,
                    opacity: 0.45,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".hero",
                        start: "top 72px",
                        end: "bottom top",
                        scrub: true
                    }
                });

                gsap.to(".hero-portrait-img", {
                    yPercent: -8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".hero",
                        start: "top 72px",
                        end: "bottom top",
                        scrub: true
                    }
                });

                gsap.to(".hero-floating-card", {
                    yPercent: -20,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".hero",
                        start: "top 72px",
                        end: "bottom top",
                        scrub: 1.5
                    }
                });

                // Capability Cards Staggered Reveal
                gsap.from(".capability-card", {
                    y: 40,
                    opacity: 0,
                    stagger: 0.12,
                    duration: 0.85,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".capability-grid",
                        start: "top 85%"
                    }
                });

                // Featured Project Cards Reveal
                gsap.from(".project-card", {
                    y: 45,
                    opacity: 0,
                    stagger: 0.14,
                    duration: 0.9,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".projects-grid",
                        start: "top 85%"
                    }
                });

                // Tool Cards Reveal
                gsap.from(".tool-card", {
                    y: 35,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".toolkit-grid",
                        start: "top 85%"
                    }
                });

                // Activity Cards Reveal
                gsap.from(".activity-card", {
                    y: 35,
                    opacity: 0,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: "#activities",
                        start: "top 85%"
                    }
                });

                // Quote Pillars Stagger
                gsap.from(".quote-pillar-item, .quote-tenet", {
                    y: 25,
                    opacity: 0,
                    stagger: 0.12,
                    duration: 0.75,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".quote-pillars",
                        start: "top 85%"
                    }
                });

            } catch (err) {
                console.warn("[Portfolio.animations] GSAP choreography notice:", err);
            }
        }
    }

    // Number Counter Animation Helper
    function animateNumberCounter(elem, target, duration = 1500, suffix = "") {
        if (!elem) return;
        const startTime = performance.now();
        const startVal = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out exponential
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = startVal + (target - startVal) * easeProgress;

            if (Number.isInteger(target)) {
                elem.textContent = Math.round(currentVal) + suffix;
            } else {
                elem.textContent = currentVal.toFixed(2) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                elem.textContent = (Number.isInteger(target) ? target : target.toFixed(2)) + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    root.Portfolio.animations = {
        init: init,
        animateNumberCounter: animateNumberCounter
    };
})(typeof window !== "undefined" ? window : this);
