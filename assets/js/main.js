/**
 * ==============================================================================
 * MD. SABBIR HOSHEN HOWLADER — $2M-CLASS CINEMATIC PORTFOLIO ENGINE
 * ==============================================================================
 * Creative Direction: Private Banking Meets Cinematic Technology
 * Color System: Midnight Navy, Institutional Navy, Emerald Green, Champagne Gold
 * Architecture: Self-Contained Resilient Modular Client Engine
 * Individual source partials preserved in: /assets/js/modules/
 * ==============================================================================
 */

"use strict";


// >>> MODULE: config.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — CLIENT CONFIGURATION MODULE
 * Central configuration, reduced-motion detection, and Portfolio namespace.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.Portfolio.config = {
        prefersReducedMotion: prefersReducedMotion,
        timezone: "Asia/Dhaka",
        debug: false
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: smooth-scroll.js <<<
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


// >>> MODULE: particles.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — ATMOSPHERIC CANVAS PARTICLES & CELESTIAL LIGHTING
 * Interactive particle simulation on cinematic intro and hero canvas.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function initAtmosphericCanvas(canvasId, particleCount = 45, enableConnections = true) {
        const canvas = document.getElementById(canvasId);
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext("2d");
        let width, height;
        let particles = [];
        let animFrameId = null;

        function resize() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }

        window.addEventListener("resize", resize, { passive: true });
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.8 + 0.6;
                this.baseX = this.x;
                this.baseY = this.y;
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.alpha = Math.random() * 0.5 + 0.2;
                this.pulseSpeed = Math.random() * 0.02 + 0.008;
                // Palette: Gold, Emerald, Light Cream
                const colors = [
                    "rgba(200, 168, 91, ",  // Gold
                    "rgba(15, 168, 137, ",  // Emerald
                    "rgba(248, 248, 244, "  // Cream
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.005;
                this.alpha = Math.max(0.1, Math.min(0.7, this.alpha));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.alpha + ")";
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (enableConnections) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 110) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            const connAlpha = (1 - dist / 110) * 0.12;
                            ctx.strokeStyle = `rgba(200, 168, 91, ${connAlpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }

            animFrameId = requestAnimationFrame(render);
        }

        render();

        return {
            destroy: () => {
                if (animFrameId) cancelAnimationFrame(animFrameId);
                window.removeEventListener("resize", resize);
            }
        };
    }

    function init() {
        initAtmosphericCanvas("introCanvas", 48, true);
        initAtmosphericCanvas("heroCanvas", 35, true);
    }

    root.Portfolio.particles = {
        init: init,
        initAtmosphericCanvas: initAtmosphericCanvas
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: intro.js <<<
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

        // Ensure page is locked at top during loading intro
        document.body.classList.add("intro-active");
        if (typeof history !== "undefined" && "scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        window.scrollTo(0, 0);

        function dismissCinematicIntro() {
            if (introDismissed || !introElem) return;
            introDismissed = true;

            // Instantly ensure Hero section is at the exact top
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            if (root.Portfolio && root.Portfolio.scroll && typeof root.Portfolio.scroll.getInstance === "function") {
                const lenis = root.Portfolio.scroll.getInstance();
                if (lenis && typeof lenis.scrollTo === "function") {
                    try {
                        lenis.scrollTo(0, { immediate: true });
                    } catch (err) {}
                }
            }

            introElem.classList.add("fade-out", "intro-dismissed");
            introElem.style.pointerEvents = "none";
            introElem.style.opacity = "0";
            document.body.classList.remove("intro-active");

            setTimeout(() => {
                introElem.style.display = "none";
                introElem.setAttribute("aria-hidden", "true");
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                if (window.ScrollTrigger) {
                    window.ScrollTrigger.refresh();
                }
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


// >>> MODULE: cursor.js <<<
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


// >>> MODULE: navbar.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — LUXURY NAVBAR & SCROLL PROGRESS MODULE
 * Sticky navbar glass styling, scroll progress bar, and mobile navigation drawer.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const scrollProgressBar = document.getElementById("scrollProgressBar");
        const navbar = document.getElementById("navbar");
        const mobileNavBtn = document.getElementById("mobileNavBtn");
        const mobileDrawer = document.getElementById("mobileDrawer");

        function handleScroll() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

            if (scrollProgressBar) {
                scrollProgressBar.style.width = `${scrollPercent}%`;
            }

            if (navbar) {
                if (scrollTop > 45) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        // Mobile Drawer Controller
        if (mobileNavBtn && mobileDrawer) {
            mobileNavBtn.addEventListener("click", () => {
                const isActive = mobileDrawer.classList.toggle("active");
                mobileNavBtn.classList.toggle("active");
                mobileNavBtn.setAttribute("aria-expanded", String(isActive));
                document.body.classList.toggle("drawer-open", isActive);
            });

            // Close on any link click
            mobileDrawer.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", () => {
                    mobileDrawer.classList.remove("active");
                    mobileNavBtn.classList.remove("active");
                    mobileNavBtn.setAttribute("aria-expanded", "false");
                    document.body.classList.remove("drawer-open");
                });
            });

            // Close on escape key
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && mobileDrawer.classList.contains("active")) {
                    mobileDrawer.classList.remove("active");
                    mobileNavBtn.classList.remove("active");
                    mobileNavBtn.setAttribute("aria-expanded", "false");
                    document.body.classList.remove("drawer-open");
                }
            });
        }
    }

    root.Portfolio.navbar = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: section-spy.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — ACTIVE SECTION SPY MODULE
 * Automatically highlights the corresponding navbar navigation link based on scroll position.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll(".nav-links a");

        if ("IntersectionObserver" in window && sections.length > 0) {
            const spyObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const currentId = entry.target.getAttribute("id");
                        navLinks.forEach((link) => {
                            const href = link.getAttribute("href");
                            if (href && href.startsWith("#")) {
                                if (href === `#${currentId}`) {
                                    link.classList.add("active");
                                } else {
                                    link.classList.remove("active");
                                }
                            }
                        });
                    }
                });
            }, {
                rootMargin: "-25% 0px -65% 0px"
            });

            sections.forEach((sec) => spyObserver.observe(sec));
        }
    }

    root.Portfolio.sectionSpy = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: tilt.js <<<
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


// >>> MODULE: timeline.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — SIGNATURE EDUCATION TIMELINE MODULE (2010 TO PRESENT)
 * Interactive horizontal timeline, era jumping, scrubber tracking, and active card sync.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;
        // 09. SIGNATURE EDUCATION TIMELINE (2010 TO PRESENT)
        // ==========================================================================
        const timelineContainer = document.getElementById("timelineScrollContainer");
        const scrubberFill = document.getElementById("timelineScrubberFill");
        const scrubberTrack = document.getElementById("timelineScrubber");
        const scrollLeftBtn = document.getElementById("timelineScrollLeftBtn");
        const scrollRightBtn = document.getElementById("timelineScrollRightBtn");
        const replayJourneyBtn = document.getElementById("timelineReplayBtn");
        const activeHudLabel = document.getElementById("timelineActiveHud");
        const eraButtons = document.querySelectorAll(".era-jump-btn");
        const milestoneItems = document.querySelectorAll(".timeline-milestone");

        let glideId = null;
        let isAutoGliding = false;
        let hasAutoGlided = false;

        function updateTimelineState() {
            if (!timelineContainer) return;

            const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
            if (maxScroll <= 0) {
                if (scrubberFill) scrubberFill.style.width = "100%";
                return;
            }

            const scrollRatio = timelineContainer.scrollLeft / maxScroll;
            const pct = Math.min(Math.max(scrollRatio * 100, 0), 100);
            if (scrubberFill) scrubberFill.style.width = `${pct}%`;

            let closestMilestone = null;

            // When scrolled near the end (within 140px or 90%+), snap active state to the current study status (Milestone 17)
            if (scrollRatio >= 0.90 || (maxScroll - timelineContainer.scrollLeft) < 140) {
                closestMilestone = {
                    item: milestoneItems[milestoneItems.length - 1],
                    index: milestoneItems.length - 1
                };
            } else if (scrollRatio <= 0.05 || timelineContainer.scrollLeft < 60) {
                closestMilestone = {
                    item: milestoneItems[0],
                    index: 0
                };
            } else {
                const containerCenter = timelineContainer.scrollLeft + (timelineContainer.clientWidth / 2);
                let minDistance = Infinity;

                milestoneItems.forEach((item, index) => {
                    const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
                    const dist = Math.abs(containerCenter - itemCenter);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestMilestone = { item, index };
                    }
                });
            }

            if (closestMilestone) {
                milestoneItems.forEach((m) => m.classList.remove("is-active-milestone"));
                closestMilestone.item.classList.add("is-active-milestone");

                const yearEl = closestMilestone.item.querySelector(".milestone-year");
                const rawYear = yearEl ? (yearEl.childNodes[0]?.textContent || yearEl.textContent || "") : "";
                const cleanYear = rawYear.replace(/\s+/g, " ").trim();
                const titleText = closestMilestone.item.querySelector(".milestone-title")?.textContent || "";
                if (activeHudLabel) {
                    activeHudLabel.innerHTML = `<span class="hud-pulse"></span><span>[ MILESTONE ${closestMilestone.index + 1}/17 ] ${cleanYear} &mdash; ${titleText.trim()}</span>`;
                }

                // Sync active Era Jump button based on current index
                const currentIdx = closestMilestone.index;
                let activeEraIdx = 0;
                const eraBreakpoints = [0, 5, 8, 11, 13, 16];
                for (let i = eraBreakpoints.length - 1; i >= 0; i--) {
                    if (currentIdx >= eraBreakpoints[i]) {
                        activeEraIdx = eraBreakpoints[i];
                        break;
                    }
                }
                eraButtons.forEach((btn) => {
                    const target = parseInt(btn.getAttribute("data-target-index") || "0", 10);
                    btn.classList.toggle("active", target === activeEraIdx);
                });
            }
        }

        function cancelTimelineGlide() {
            if (glideId) {
                cancelAnimationFrame(glideId);
                glideId = null;
            }
            if (timelineContainer) {
                timelineContainer.classList.remove("is-gliding");
            }
            isAutoGliding = false;
        }

        // Snaps the container so cards are cleanly framed and never cut off
        function snapToNearestMilestone() {
            if (!timelineContainer) return;
            const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
            if (maxScroll <= 0) return;

            // If scrolled near the end, cleanly snap to the final current status cards
            if (timelineContainer.scrollLeft > maxScroll - 160) {
                timelineContainer.scrollTo({ left: maxScroll, behavior: "smooth" });
                return;
            }
            // If near the start, snap to the first card
            if (timelineContainer.scrollLeft < 80) {
                timelineContainer.scrollTo({ left: 0, behavior: "smooth" });
                return;
            }

            // Find the nearest milestone offset (aligned with 10px track padding)
            let bestOffset = 0;
            let minDiff = Infinity;
            milestoneItems.forEach((item) => {
                const offset = item.offsetLeft - 10;
                const diff = Math.abs(timelineContainer.scrollLeft - offset);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestOffset = Math.min(Math.max(offset, 0), maxScroll);
                }
            });

            timelineContainer.scrollTo({ left: bestOffset, behavior: "smooth" });
        }

        function glideTimelineToPresent(duration = 2200, delay = 200) {
            if (!timelineContainer) return;
            cancelTimelineGlide();

            const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
            if (maxScroll <= 0) {
                // If layout is still settling or fonts are loading, retry after 100ms
                setTimeout(() => glideTimelineToPresent(duration, 0), 100);
                return;
            }

            // If user prefers reduced motion, jump directly to current status without waiting
            if (prefersReducedMotion) {
                timelineContainer.style.scrollBehavior = "auto";
                timelineContainer.scrollLeft = maxScroll;
                updateTimelineState();
                return;
            }

            // Temporarily set scrollBehavior to auto and disable snap during programmatic requestAnimationFrame
            timelineContainer.style.scrollBehavior = "auto";
            timelineContainer.classList.add("is-gliding");
            timelineContainer.scrollLeft = 0;
            updateTimelineState();
            isAutoGliding = true;

            setTimeout(() => {
                const freshMaxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
                if (freshMaxScroll <= 0) {
                    timelineContainer.classList.remove("is-gliding");
                    isAutoGliding = false;
                    return;
                }

                const start = timelineContainer.scrollLeft;
                const target = freshMaxScroll;
                const startTime = performance.now();

                function step(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Brisk & dynamic quartic curve: swift acceleration across past eras with a crisp snap landing
                    const ease = progress < 0.5
                        ? 8 * progress * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 4) / 2;

                    timelineContainer.scrollLeft = start + (target - start) * ease;
                    updateTimelineState();

                    if (progress < 1) {
                        glideId = requestAnimationFrame(step);
                    } else {
                        timelineContainer.scrollLeft = target;
                        updateTimelineState();

                        // Lock highlight onto the final milestone (ICAB CA & BBA)
                        const lastMilestone = milestoneItems[milestoneItems.length - 1];
                        if (lastMilestone) {
                            milestoneItems.forEach((m) => m.classList.remove("is-active-milestone"));
                            lastMilestone.classList.add("is-active-milestone");
                        }
                        if (activeHudLabel) {
                            activeHudLabel.innerHTML = '<span class="hud-pulse"></span><span>[ MILESTONE 17/17 ] 2026 &mdash; Present &mdash; Chartered Accountancy &mdash; Certificate Level</span>';
                        }
                        eraButtons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-target-index") === "16"));

                        timelineContainer.classList.remove("is-gliding");
                        glideId = null;
                        isAutoGliding = false;
                    }
                }

                glideId = requestAnimationFrame(step);
            }, delay);
        }

        if (timelineContainer) {
            timelineContainer.addEventListener("scroll", updateTimelineState, { passive: true });

            // Wheel behavior: Shift+Wheel or Trackpad Horizontal scrolls the timeline.
            // Vertical wheel does NOT trap page scroll and does NOT cancel auto-glide.
            timelineContainer.addEventListener("wheel", (e) => {
                if (e.shiftKey) {
                    e.preventDefault();
                    cancelTimelineGlide();
                    timelineContainer.scrollLeft += (e.deltaY || e.deltaX) * 1.2;
                } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    cancelTimelineGlide();
                    timelineContainer.scrollLeft += e.deltaX;
                }
            }, { passive: false });

            let isDown = false;
            let startX = 0;
            let startScroll = 0;

            timelineContainer.addEventListener("mousedown", (e) => {
                isDown = true;
                cancelTimelineGlide();
                timelineContainer.classList.add("is-dragging");
                startX = e.pageX - timelineContainer.offsetLeft;
                startScroll = timelineContainer.scrollLeft;
            });

            window.addEventListener("mouseup", () => {
                if (isDown) {
                    isDown = false;
                    timelineContainer.classList.remove("is-dragging");
                    // Snap cleanly to nearest card so no card is cut off
                    snapToNearestMilestone();
                }
            });

            timelineContainer.addEventListener("mousemove", (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - timelineContainer.offsetLeft;
                const walk = (x - startX) * 1.6;
                timelineContainer.scrollLeft = startScroll - walk;
            });

            timelineContainer.addEventListener("touchstart", () => {
                cancelTimelineGlide();
            }, { passive: true });

            timelineContainer.addEventListener("touchend", () => {
                setTimeout(snapToNearestMilestone, 150);
            }, { passive: true });

            if (scrubberTrack) {
                scrubberTrack.addEventListener("click", (e) => {
                    cancelTimelineGlide();
                    const rect = scrubberTrack.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = Math.min(Math.max(clickX / rect.width, 0), 1);
                    const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
                    timelineContainer.scrollTo({ left: maxScroll * ratio, behavior: "smooth" });
                });
            }

            if (scrollLeftBtn) {
                scrollLeftBtn.addEventListener("click", () => {
                    cancelTimelineGlide();
                    // Scroll by exactly 1 card + gap (330px card + 30px gap = 360px)
                    timelineContainer.scrollBy({ left: -360, behavior: "smooth" });
                });
            }

            if (scrollRightBtn) {
                scrollRightBtn.addEventListener("click", () => {
                    cancelTimelineGlide();
                    const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
                    if (maxScroll - timelineContainer.scrollLeft <= 380) {
                        timelineContainer.scrollTo({ left: maxScroll, behavior: "smooth" });
                    } else {
                        timelineContainer.scrollBy({ left: 360, behavior: "smooth" });
                    }
                });
            }

            if (replayJourneyBtn) {
                replayJourneyBtn.addEventListener("click", () => {
                    hasAutoGlided = true;
                    glideTimelineToPresent(2200, 80);
                });
            }

            eraButtons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    cancelTimelineGlide();
                    const targetIndex = parseInt(btn.getAttribute("data-target-index") || "0", 10);
                    const targetMilestone = milestoneItems[targetIndex];
                    if (targetMilestone) {
                        const maxScroll = timelineContainer.scrollWidth - timelineContainer.clientWidth;
                        const targetOffset = targetIndex === 16
                            ? maxScroll
                            : Math.min(Math.max(targetMilestone.offsetLeft - 10, 0), maxScroll);
                        timelineContainer.scrollTo({ left: targetOffset, behavior: "smooth" });
                    }
                    eraButtons.forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");
                });
            });

            window.addEventListener("keydown", (e) => {
                if (document.activeElement === timelineContainer || timelineContainer.contains(document.activeElement)) {
                    if (e.key === "ArrowLeft") {
                        cancelTimelineGlide();
                        timelineContainer.scrollBy({ left: -360, behavior: "smooth" });
                    } else if (e.key === "ArrowRight") {
                        cancelTimelineGlide();
                        timelineContainer.scrollBy({ left: 360, behavior: "smooth" });
                    }
                }
            });

            // Resilient Triggering: Automatically glides to Present when #education enters view
            function checkAndTriggerAutoGlide() {
                if (hasAutoGlided) return;
                const eduSection = document.getElementById("education");
                if (!eduSection) return;

                const rect = eduSection.getBoundingClientRect();
                // Trigger when the top of the education section enters within the viewport
                if (rect.top < window.innerHeight * 0.85 && rect.bottom > 100) {
                    hasAutoGlided = true;
                    glideTimelineToPresent(2200, 200);
                }
            }

            // 1. IntersectionObserver trigger with wide threshold
            if ("IntersectionObserver" in window) {
                const eduObserver = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !hasAutoGlided) {
                            hasAutoGlided = true;
                            glideTimelineToPresent(2200, 200);
                            eduObserver.disconnect();
                        }
                    });
                }, { threshold: [0, 0.05, 0.1], rootMargin: "60px 0px 60px 0px" });

                const eduSection = document.getElementById("education");
                if (eduSection) eduObserver.observe(eduSection);
            }

            // 2. Window scroll listener fallback (ensures Lenis or fast scrolls trigger it)
            window.addEventListener("scroll", checkAndTriggerAutoGlide, { passive: true });

            // 3. Delayed viewport checks in case page was loaded/refreshed near #education
            setTimeout(checkAndTriggerAutoGlide, 400);
            setTimeout(checkAndTriggerAutoGlide, 1000);

            // 4. In-page nav links to #education
            document.querySelectorAll('a[href="#education"]').forEach((link) => {
                link.addEventListener("click", () => {
                    hasAutoGlided = true;
                    setTimeout(() => {
                        glideTimelineToPresent(2200, 250);
                    }, 200);
                });
            });

            updateTimelineState();

            // Initialize Education Qualifications Analytics & Visual Graph
            initEducationAnalytics();
        }

        // ==========================================================================
        // 10. EDUCATION QUALIFICATION MATRIX & INTERACTIVE TRAJECTORY GRAPH ENGINE
        // ==========================================================================
        function initEducationAnalytics() {
            const chartSvg = document.getElementById("eduAnalyticsSvg");
            const tabButtons = document.querySelectorAll(".edu-tab-btn");
            const spotlightHud = document.getElementById("eduSpotlightHud");
            if (!chartSvg) return;

            const educationData = [
                {
                    id: "psc",
                    code: "PSC",
                    title: "Primary School Certificate (PSC)",
                    board: "General / Primary Board",
                    subject: "General",
                    year: "2016",
                    score: "2.93",
                    scale: "5.00",
                    pct: 58.6,
                    delta: "Foundational Baseline",
                    status: "Completed",
                    statusType: "completed",
                    badgeClass: "status-completed",
                    desc: "Foundational primary examination completion across elementary arithmetic, language literacy, and initial natural science study."
                },
                {
                    id: "jsc",
                    code: "JSC",
                    title: "Junior School Certificate (JSC)",
                    board: "Barishal Board (BISE Barishal)",
                    subject: "General",
                    year: "2019",
                    score: "3.57",
                    scale: "5.00",
                    pct: 71.4,
                    delta: "+21.8% Surge (+0.64 GPA)",
                    status: "Completed",
                    statusType: "completed",
                    badgeClass: "status-completed",
                    desc: "Junior secondary graduation under BISE Barishal &bull; Marked performance acceleration with algebraic problem-solving and critical reasoning."
                },
                {
                    id: "ssc",
                    code: "SSC",
                    title: "Secondary School Certificate (SSC)",
                    board: "Barishal Board (BISE Barishal)",
                    subject: "Business Studies",
                    year: "2022",
                    score: "4.28",
                    scale: "5.00",
                    pct: 85.6,
                    delta: "+19.9% Surge (First Division Distinction)",
                    status: "Distinction (Honors)",
                    statusType: "distinction",
                    badgeClass: "status-distinction",
                    desc: "Graduated with Distinction in Business Studies under BISE Barishal &bull; Comprehensive mastery of double-entry bookkeeping, commercial finance, and accounting logic."
                },
                {
                    id: "hsc",
                    code: "HSC",
                    title: "Higher Secondary Certificate (HSC)",
                    board: "Barishal Board (BISE Barishal)",
                    subject: "Business Studies",
                    year: "2024",
                    score: "4.17",
                    scale: "5.00",
                    pct: 83.4,
                    delta: "Sustained Collegiate Honors",
                    status: "Distinction (Honors)",
                    statusType: "distinction",
                    badgeClass: "status-distinction",
                    desc: "Higher Secondary Certificate with Honors distinction under BISE Barishal &bull; Rigorous coursework in financial accounting, banking & insurance, and business management."
                },
                {
                    id: "bba",
                    code: "BBA",
                    title: "BBA (Honours) in Accounting",
                    board: "National University (Govt. B.M. College)",
                    subject: "Accounting Major",
                    year: "Ongoing",
                    score: "Ongoing",
                    scale: "4.00 CGPA Scale",
                    pct: 90.0,
                    delta: "Undergraduate Pursuit",
                    status: "Active Scholar",
                    statusType: "active",
                    badgeClass: "status-active",
                    desc: "Pursuing 4-Year BBA Honours at the historic Department of Accounting, Brojomohun (B.M.) College &bull; Advanced costing, corporate taxation, and financial reporting."
                },
                {
                    id: "ca",
                    code: "CA",
                    title: "Chartered Accountancy (Certificate Level)",
                    board: "ICAB (Institute of Chartered Accountants of BD)",
                    subject: "Certificate Level",
                    year: "Ongoing",
                    score: "Ongoing",
                    scale: "Professional Standard",
                    pct: 95.0,
                    delta: "Statutory Professional Standard",
                    status: "Professional Candidate",
                    statusType: "active",
                    badgeClass: "status-active",
                    desc: "Studying Bangladesh's premier chartered accounting qualification &bull; In-depth international curriculum covering IFRS / BAS, Audit & Assurance, and Direct/Indirect Tax."
                }
            ];

            let currentView = "trajectory";
            let selectedIndex = 2; // Default focus on SSC Distinction

            function updateSpotlight(index) {
                selectedIndex = index;
                const item = educationData[index];
                if (!item || !spotlightHud) return;

                const pulseDot = item.statusType === "active"
                    ? '<span class="pulse-dot-cyan"></span>'
                    : item.statusType === "distinction"
                        ? '<span class="pulse-dot-green"></span>'
                        : '';

                spotlightHud.innerHTML = `
                    <div class="spotlight-left">
                        <div class="spotlight-badge">${item.code}</div>
                        <div>
                            <h4 class="spotlight-title">${item.title}</h4>
                            <div class="spotlight-board">${item.board} &bull; <span style="color: var(--gold-champagne);">${item.subject}</span></div>
                        </div>
                    </div>
                    <div class="spotlight-right">
                        <div class="spotlight-stat">
                            <div class="spotlight-stat-label">Passing Year</div>
                            <div class="spotlight-stat-val" style="color: var(--gold-champagne);">${item.year}</div>
                        </div>
                        <div class="spotlight-stat">
                            <div class="spotlight-stat-label">Standard Result</div>
                            <div class="spotlight-stat-val">${item.score === 'Ongoing' ? 'Scale 4.00' : 'GPA ' + item.score} <span style="font-size: 12px; color: var(--text-light-muted); font-weight: 500;">/ ${item.scale}</span></div>
                        </div>
                        <div class="spotlight-stat">
                            <div class="spotlight-stat-label">Accreditation</div>
                            <div class="status-pill ${item.badgeClass}">${pulseDot}${item.status}</div>
                        </div>
                    </div>
                `;

                // Highlight matching table row
                document.querySelectorAll(".edu-table tbody tr").forEach((row, rIdx) => {
                    row.classList.toggle("row-featured", rIdx === index);
                });
            }

            function renderTrajectoryView() {
                const points = [
                    { x: 110, y: 196, score: "2.93", itemIdx: 0, year: "2016", label: "PSC: 2.93" },
                    { x: 270, y: 152, score: "3.57", itemIdx: 1, year: "2019", label: "JSC: 3.57" },
                    { x: 430, y: 102, score: "4.28", itemIdx: 2, year: "2022", label: "SSC: 4.28 ★", star: true },
                    { x: 590, y: 110, score: "4.17", itemIdx: 3, year: "2024", label: "HSC: 4.17 ★", star: true },
                    { x: 750, y: 88, score: "BBA & CA", itemIdx: 4, year: "Ongoing", label: "BBA (4.00) & ICAB", ongoing: true }
                ];

                let svgHtml = `
                    <defs>
                        <linearGradient id="gpaLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#0FA889" />
                            <stop offset="50%" stop-color="#C8A85B" />
                            <stop offset="100%" stop-color="#38bdf8" />
                        </linearGradient>
                        <linearGradient id="gpaAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="rgba(200, 168, 91, 0.32)" />
                            <stop offset="50%" stop-color="rgba(15, 168, 137, 0.14)" />
                            <stop offset="100%" stop-color="rgba(10, 32, 45, 0.0)" />
                        </linearGradient>
                        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    <!-- Grid Baseline Lines & GPA Scale Labels -->
                    <g class="chart-grid">
                        <line x1="80" y1="52" x2="810" y2="52" stroke="rgba(200, 168, 91, 0.22)" stroke-dasharray="5 5" />
                        <text x="65" y="56" fill="#C8A85B" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">5.00</text>
                        <text x="815" y="56" fill="rgba(200, 168, 91, 0.5)" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="start">PERFECT GPA</text>

                        <line x1="80" y1="122" x2="810" y2="122" stroke="rgba(255, 255, 255, 0.12)" stroke-dasharray="4 4" />
                        <text x="65" y="126" fill="#9BB0BD" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">4.00</text>
                        <text x="815" y="126" fill="rgba(255, 255, 255, 0.3)" font-family="'JetBrains Mono', monospace" font-size="9" text-anchor="start">DISTINCTION / 1ST DIV</text>

                        <line x1="80" y1="192" x2="810" y2="192" stroke="rgba(255, 255, 255, 0.08)" stroke-dasharray="4 4" />
                        <text x="65" y="196" fill="#9BB0BD" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">3.00</text>

                        <line x1="80" y1="262" x2="810" y2="262" stroke="rgba(255, 255, 255, 0.08)" stroke-dasharray="4 4" />
                        <text x="65" y="266" fill="#61717B" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="end">2.00</text>
                    </g>

                    <!-- Shaded Gradient Area Under Trajectory -->
                    <path d="M 110,270 L 110,196 C 190,196 190,152 270,152 C 350,152 350,102 430,102 C 510,102 510,110 590,110 C 670,110 670,88 750,88 L 750,270 Z" 
                          fill="url(#gpaAreaGrad)" />

                    <!-- Historical Solid Spline Line (2016 to 2024) -->
                    <path d="M 110,196 C 190,196 190,152 270,152 C 350,152 350,102 430,102 C 510,102 510,110 590,110" 
                          fill="none" stroke="url(#gpaLineGrad)" stroke-width="3.5" stroke-linecap="round" />

                    <!-- Future/Ongoing Projected Dashed Spline (2024 to Present) -->
                    <path d="M 590,110 C 670,110 670,88 750,88" 
                          fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round" />

                    <!-- Growth Delta Surge Badges -->
                    <g>
                        <rect x="165" y="156" width="62" height="18" rx="3" fill="rgba(15, 168, 137, 0.25)" stroke="#0FA889" stroke-width="1" />
                        <text x="196" y="169" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" text-anchor="middle">&uarr; +21.8%</text>

                        <rect x="325" y="108" width="62" height="18" rx="3" fill="rgba(200, 168, 91, 0.25)" stroke="#C8A85B" stroke-width="1" />
                        <text x="356" y="121" fill="#C8A85B" font-family="'JetBrains Mono', monospace" font-size="9.5" font-weight="700" text-anchor="middle">&uarr; +19.9%</text>
                    </g>
                `;

                points.forEach((pt) => {
                    const isSelected = selectedIndex === pt.itemIdx || (pt.ongoing && (selectedIndex === 4 || selectedIndex === 5));
                    const nodeFill = pt.ongoing ? "#38bdf8" : pt.star ? "#C8A85B" : "#0FA889";
                    const ringColor = isSelected ? "#4ade80" : pt.ongoing ? "rgba(56, 189, 248, 0.4)" : "rgba(200, 168, 91, 0.4)";

                    svgHtml += `
                        <g class="chart-node-group ${isSelected ? 'active' : ''}" data-item-index="${pt.itemIdx}" tabindex="0" role="button" aria-label="${pt.label}">
                            <circle class="chart-node-ring" cx="${pt.x}" cy="${pt.y}" r="${isSelected ? 16 : 11}" fill="none" stroke="${ringColor}" stroke-width="${isSelected ? 2.5 : 1.5}" />
                            <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="${nodeFill}" filter="url(#goldGlow)" />
                            <circle cx="${pt.x}" cy="${pt.y}" r="2.5" fill="#0A202D" />

                            <rect x="${pt.x - 48}" y="${pt.y - 38}" width="96" height="24" rx="3" 
                                  fill="rgba(10, 32, 45, 0.95)" stroke="${isSelected ? '#4ade80' : nodeFill}" stroke-width="1.2" />
                            <text x="${pt.x}" y="${pt.y - 22}" fill="${isSelected ? '#4ade80' : pt.star ? '#C8A85B' : '#F8F8F4'}" 
                                  font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" text-anchor="middle">
                                ${pt.label}
                            </text>

                            <text x="${pt.x}" y="295" fill="#C8A85B" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${pt.year}</text>
                            <text x="${pt.x}" y="312" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">${educationData[pt.itemIdx].subject}</text>
                        </g>
                    `;
                });

                chartSvg.innerHTML = svgHtml;
                attachChartNodeEvents();
            }

            function renderComparisonView() {
                let svgHtml = `
                    <defs>
                        <linearGradient id="barGradGold" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#C8A85B" />
                            <stop offset="100%" stop-color="#E2CA88" />
                        </linearGradient>
                        <linearGradient id="barGradEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#0FA889" />
                            <stop offset="100%" stop-color="#4ade80" />
                        </linearGradient>
                        <linearGradient id="barGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#0284c7" />
                            <stop offset="100%" stop-color="#38bdf8" />
                        </linearGradient>
                    </defs>

                    <g class="chart-grid">
                        <line x1="200" y1="30" x2="200" y2="290" stroke="rgba(255, 255, 255, 0.08)" />
                        <line x1="350" y1="30" x2="350" y2="290" stroke="rgba(255, 255, 255, 0.06)" stroke-dasharray="3 3" />
                        <line x1="500" y1="30" x2="500" y2="290" stroke="rgba(255, 255, 255, 0.06)" stroke-dasharray="3 3" />
                        <line x1="650" y1="30" x2="650" y2="290" stroke="rgba(255, 255, 255, 0.06)" stroke-dasharray="3 3" />
                        <line x1="800" y1="30" x2="800" y2="290" stroke="rgba(200, 168, 91, 0.2)" />

                        <text x="200" y="25" fill="#61717B" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">0%</text>
                        <text x="350" y="25" fill="#61717B" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">25%</text>
                        <text x="500" y="25" fill="#61717B" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">50%</text>
                        <text x="650" y="25" fill="#61717B" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">75%</text>
                        <text x="800" y="25" fill="#C8A85B" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle">100% SCALE</text>
                    </g>
                `;

                const barYStarts = [45, 90, 135, 180, 225, 270];

                educationData.forEach((item, idx) => {
                    const y = barYStarts[idx];
                    const maxBarWidth = 600;
                    const barWidth = Math.round((item.pct / 100) * maxBarWidth);
                    const isSelected = selectedIndex === idx;
                    const barFill = idx >= 4 ? "url(#barGradCyan)" : idx >= 2 ? "url(#barGradGold)" : "url(#barGradEmerald)";

                    svgHtml += `
                        <g class="chart-node-group ${isSelected ? 'active' : ''}" data-item-index="${idx}" tabindex="0" role="button">
                            <text x="180" y="${y + 16}" fill="${isSelected ? '#4ade80' : '#F8F8F4'}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="end">
                                ${item.code} (${item.year})
                            </text>
                            
                            <rect x="200" y="${y}" width="${maxBarWidth}" height="22" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
                            <rect class="chart-animated-bar" x="200" y="${y}" width="${barWidth}" height="22" rx="3" fill="${barFill}" />

                            <text x="${200 + barWidth + 12}" y="${y + 16}" fill="${isSelected ? '#4ade80' : '#C8A85B'}" font-family="'JetBrains Mono', monospace" font-size="11.5" font-weight="700">
                                ${item.score === 'Ongoing' ? item.scale : 'GPA ' + item.score + ' / ' + item.scale} (${item.pct}%)
                            </text>
                        </g>
                    `;
                });

                chartSvg.innerHTML = svgHtml;
                attachChartNodeEvents();
            }

            function renderRoadmapView() {
                let svgHtml = `
                    <line x1="160" y1="160" x2="720" y2="160" stroke="rgba(200, 168, 91, 0.3)" stroke-width="3" stroke-dasharray="6 4" />

                    <!-- Phase 1: Foundational General -->
                    <g class="chart-node-group" data-item-index="0" tabindex="0">
                        <rect x="70" y="60" width="220" height="200" rx="6" fill="rgba(14, 39, 54, 0.85)" stroke="rgba(15, 168, 137, 0.4)" stroke-width="1.5" />
                        <rect x="85" y="75" width="70" height="20" rx="3" fill="rgba(15, 168, 137, 0.2)" />
                        <text x="120" y="89" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">PHASE 01</text>
                        
                        <text x="85" y="125" fill="#F8F8F4" font-family="'Playfair Display', serif" font-size="17" font-weight="600">General Education</text>
                        <text x="85" y="148" fill="#C8A85B" font-family="'JetBrains Mono', monospace" font-size="11.5">2010 &mdash; 2019 (PSC &amp; JSC)</text>
                        
                        <text x="85" y="180" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; Primary Certificate (GPA 2.93)
                        </text>
                        <text x="85" y="202" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; Junior Certificate (GPA 3.57)
                        </text>
                        <text x="85" y="224" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; Quantitative Foundations
                        </text>
                    </g>

                    <polygon points="315,160 300,152 300,168" fill="#C8A85B" />

                    <!-- Phase 2: Secondary & Collegiate Business Studies -->
                    <g class="chart-node-group" data-item-index="2" tabindex="0">
                        <rect x="330" y="45" width="220" height="230" rx="6" fill="rgba(16, 44, 61, 0.95)" stroke="#C8A85B" stroke-width="2" />
                        <rect x="345" y="60" width="70" height="20" rx="3" fill="rgba(200, 168, 91, 0.25)" />
                        <text x="380" y="74" fill="#C8A85B" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">PHASE 02</text>
                        
                        <text x="345" y="110" fill="#F8F8F4" font-family="'Playfair Display', serif" font-size="17" font-weight="600">Commerce Focus</text>
                        <text x="345" y="133" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="11.5">2020 &mdash; 2024 (SSC &amp; HSC)</text>
                        
                        <text x="345" y="165" fill="#DFE4E2" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; SSC Business: <strong>GPA 4.28</strong>
                        </text>
                        <text x="345" y="187" fill="#DFE4E2" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; HSC Business: <strong>GPA 4.17</strong>
                        </text>
                        <text x="345" y="209" fill="#DFE4E2" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; BISE Barishal Distinctions
                        </text>
                        <text x="345" y="231" fill="#DFE4E2" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; Double-Entry Bookkeeping
                        </text>
                    </g>

                    <polygon points="575,160 560,152 560,168" fill="#38bdf8" />

                    <!-- Phase 3: University Accounting & Chartered Accountancy -->
                    <g class="chart-node-group" data-item-index="5" tabindex="0">
                        <rect x="590" y="60" width="220" height="200" rx="6" fill="rgba(14, 39, 54, 0.85)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5" />
                        <rect x="605" y="75" width="70" height="20" rx="3" fill="rgba(56, 189, 248, 0.2)" />
                        <text x="640" y="89" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">PHASE 03</text>
                        
                        <text x="605" y="125" fill="#F8F8F4" font-family="'Playfair Display', serif" font-size="17" font-weight="600">Professional Finance</text>
                        <text x="605" y="148" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="11.5">2024 &mdash; Present (Ongoing)</text>
                        
                        <text x="605" y="180" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; BBA Accounting (Scale 4.00)
                        </text>
                        <text x="605" y="202" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; ICAB CA Certificate Level
                        </text>
                        <text x="605" y="224" fill="#9BB0BD" font-family="'DM Sans', sans-serif" font-size="12">
                            &bull; Statutory Audit &amp; IFRS
                        </text>
                    </g>
                `;

                chartSvg.innerHTML = svgHtml;
                attachChartNodeEvents();
            }

            function attachChartNodeEvents() {
                const nodes = chartSvg.querySelectorAll(".chart-node-group");
                nodes.forEach((node) => {
                    const idx = parseInt(node.getAttribute("data-item-index") || "0", 10);
                    node.addEventListener("mouseenter", () => updateSpotlight(idx));
                    node.addEventListener("click", () => updateSpotlight(idx));
                });
            }

            tabButtons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    tabButtons.forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");
                    currentView = btn.getAttribute("data-view") || "trajectory";

                    if (currentView === "trajectory") {
                        renderTrajectoryView();
                    } else if (currentView === "comparison") {
                        renderComparisonView();
                    } else if (currentView === "roadmap") {
                        renderRoadmapView();
                    }
                });
            });

            document.querySelectorAll(".edu-table tbody tr").forEach((row) => {
                row.addEventListener("click", () => {
                    const idx = parseInt(row.getAttribute("data-row-index") || "0", 10);
                    updateSpotlight(idx);
                });
            });

            renderTrajectoryView();
            updateSpotlight(2);
        }
    }

    root.Portfolio.timeline = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: benchmarks.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — INSTITUTIONAL RESEARCH BENCHMARK VISUALIZATION MODULE
 * Interactive multi-sector comparative analysis with animated financial ratio charts.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
        const prefersReducedMotion = root.Portfolio.config && root.Portfolio.config.prefersReducedMotion;
        // 10. INSTITUTIONAL RESEARCH BENCHMARK VISUALIZATION ENGINE
        // ==========================================================================
        const researchData = {
        rmg: {
            title: "Ready-Made Garments & Textiles (RMG)",
            subtitle: "Export-Driven Capital Cycle & Working Capital Normalization",
            dupont: {
                roe: "22.4%",
                netMargin: "6.8%",
                assetTurnover: "1.92x",
                equityMultiplier: "1.72x",
                desc: "High volume, low-to-moderate net profit margin compensated by high asset turnover."
            },
            workingCapital: {
                currentRatio: "1.42x",
                cashConversionCycle: "82 Days",
                inventoryDays: "58 Days",
                receivableDays: "44 Days",
                desc: "Back-to-back LC financing model; raw cotton & fabric lead times dictate liquidity buffers."
            },
            capitalEfficiency: {
                icor: "3.6x",
                operatingLeverage: "Moderate",
                capexRoic: "14.8%",
                desc: "Compliance & green factory certification (LEED) drive operational resilience."
            }
        },
        pharma: {
            title: "Pharmaceuticals & Healthcare",
            subtitle: "High Value-Add Formulation & Domestic Market Dominance",
            dupont: {
                roe: "26.8%",
                netMargin: "14.5%",
                assetTurnover: "1.15x",
                equityMultiplier: "1.61x",
                desc: "Premium operating margins driven by branded formulations and local pricing power."
            },
            workingCapital: {
                currentRatio: "1.85x",
                cashConversionCycle: "115 Days",
                inventoryDays: "88 Days",
                receivableDays: "52 Days",
                desc: "Substantial active pharmaceutical ingredient (API) buffers required to safeguard production."
            },
            capitalEfficiency: {
                icor: "4.2x",
                operatingLeverage: "High",
                capexRoic: "18.2%",
                desc: "Strong return on invested capital driven by automated packaging and global GMP facilities."
            }
        },
        banking: {
            title: "Commercial Banking & Financial Institutions",
            subtitle: "Asset-Liability Management, Net Interest Margin (NIM) & NPL Coverage",
            dupont: {
                roe: "15.2%",
                netMargin: "12.8%",
                assetTurnover: "0.08x",
                equityMultiplier: "14.8x",
                desc: "Financial intermediary model; low asset turnover counterbalanced by leveraged balance sheet."
            },
            workingCapital: {
                currentRatio: "1.12x (ADR 84.5%)",
                cashConversionCycle: "N/A (Treasury)",
                inventoryDays: "N/A",
                receivableDays: "N/A",
                desc: "Prudential liquidity maintained through CRR/SLR compliance and Treasury bond yields."
            },
            capitalEfficiency: {
                icor: "N/A",
                operatingLeverage: "Low",
                capexRoic: "11.5% ROA 1.05%",
                desc: "Core earnings anchored by fee-based corporate advisory, trade finance, and LC commissions."
            }
        }
    };

    let currentSector = "rmg";
    let currentMetric = "dupont";

    const sectorPills = document.querySelectorAll(".sector-pill-btn");
    const metricTabs = document.querySelectorAll(".metric-tab-btn");
    const chartTitleElem = document.getElementById("researchChartTitle");
    const chartSvgElem = document.getElementById("researchChartSvg");

    window.renderResearchChart = function (animate = false) {
        const data = researchData[currentSector];
        if (!data || !chartSvgElem) return;

        if (chartTitleElem) {
            chartTitleElem.textContent = `${data.title} — ${currentMetric.toUpperCase()} BENCHMARK`;
        }

        let svgContent = "";
        const metricData = data[currentMetric];

        if (currentMetric === "dupont") {
            svgContent = `
                <g transform="translate(40, 20)">
                    <line x1="0" y1="160" x2="620" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                    <line x1="0" y1="110" x2="620" y2="110" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4" />
                    <line x1="0" y1="60" x2="620" y2="60" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4" />

                    <!-- Bar 1: ROE -->
                    <rect class="chart-animated-bar" x="50" y="40" width="70" height="120" rx="3" fill="url(#goldBarGrad)" />
                    <text x="85" y="30" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.roe}</text>
                    <text x="85" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Return on Equity</text>

                    <!-- Multiply Sign -->
                    <text x="160" y="105" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="18" text-anchor="middle">=</text>

                    <!-- Bar 2: Net Margin -->
                    <rect class="chart-animated-bar" x="200" y="70" width="70" height="90" rx="3" fill="#075b4d" />
                    <text x="235" y="60" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.netMargin}</text>
                    <text x="235" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Net Margin</text>

                    <!-- Multiply Sign -->
                    <text x="310" y="105" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="16" text-anchor="middle">&times;</text>

                    <!-- Bar 3: Asset Turnover -->
                    <rect class="chart-animated-bar" x="350" y="60" width="70" height="100" rx="3" fill="#0fa889" />
                    <text x="385" y="50" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.assetTurnover}</text>
                    <text x="385" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Asset Turnover</text>

                    <!-- Multiply Sign -->
                    <text x="460" y="105" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="16" text-anchor="middle">&times;</text>

                    <!-- Bar 4: Financial Leverage -->
                    <rect class="chart-animated-bar" x="500" y="50" width="70" height="110" rx="3" fill="#102c3d" stroke="#c8a85b" stroke-width="1.5" />
                    <text x="535" y="40" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" text-anchor="middle">${metricData.equityMultiplier}</text>
                    <text x="535" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Equity Multiplier</text>
                </g>
            `;
        } else if (currentMetric === "workingCapital") {
            svgContent = `
                <g transform="translate(40, 20)">
                    <line x1="0" y1="160" x2="620" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                    
                    <rect class="chart-animated-bar" x="60" y="50" width="90" height="110" rx="3" fill="#0fa889" />
                    <text x="105" y="40" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.currentRatio}</text>
                    <text x="105" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Current Ratio</text>

                    <rect class="chart-animated-bar" x="230" y="30" width="90" height="130" rx="3" fill="url(#goldBarGrad)" />
                    <text x="275" y="20" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.cashConversionCycle}</text>
                    <text x="275" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Cash Cycle (CCC)</text>

                    <rect class="chart-animated-bar" x="400" y="70" width="90" height="90" rx="3" fill="#075b4d" />
                    <text x="445" y="60" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.inventoryDays}</text>
                    <text x="445" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Inventory Days</text>
                </g>
            `;
        } else {
            svgContent = `
                <g transform="translate(40, 20)">
                    <line x1="0" y1="160" x2="620" y2="160" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                    
                    <rect class="chart-animated-bar" x="100" y="50" width="120" height="110" rx="3" fill="url(#goldBarGrad)" />
                    <text x="160" y="40" fill="#c8a85b" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.capexRoic}</text>
                    <text x="160" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Capex ROIC / Yield</text>

                    <rect class="chart-animated-bar" x="360" y="70" width="120" height="90" rx="3" fill="#0fa889" />
                    <text x="420" y="60" fill="#0fa889" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">${metricData.icor}</text>
                    <text x="420" y="180" fill="#9bb0bd" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Capital-Output (ICOR)</text>
                </g>
            `;
        }

        chartSvgElem.innerHTML = `
            <defs>
                <linearGradient id="goldBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#c8a85b" />
                    <stop offset="100%" stop-color="#8c6c24" />
                </linearGradient>
            </defs>
            ${svgContent}
        `;

        const commentaryElem = document.getElementById("researchCommentary");
        if (commentaryElem) {
            commentaryElem.textContent = metricData.desc;
        }

        // Optional GSAP animation on bars
        if (window.gsap && !prefersReducedMotion) {
            gsap.fromTo(".chart-animated-bar", {
                scaleY: 0,
                transformOrigin: "bottom"
            }, {
                scaleY: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out"
            });
        }
    };

    if (sectorPills.length > 0) {
        sectorPills.forEach((pill) => {
            pill.addEventListener("click", () => {
                sectorPills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
                currentSector = pill.getAttribute("data-sector") || "rmg";
                window.renderResearchChart();
            });
        });

        metricTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                metricTabs.forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                currentMetric = tab.getAttribute("data-metric") || "dupont";
                window.renderResearchChart();
            });
        });

        window.renderResearchChart();
    }

    // ==========================================================================

    }

    root.Portfolio.benchmarks = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: modal.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — CASE STUDY MODAL SYSTEM MODULE
 * Accessible case study drawer modal with dynamic study injection and keyboard control.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    const projectData = {
        financial: {
            category: "FINANCIAL ANALYSIS & VALUATION",
            title: "Financial Statement & DuPont Ratio Modeling",
            status: "COMPLETED ACADEMIC SIMULATION",
            summary: "Comprehensive horizontal, vertical, and 3-stage DuPont decomposition of corporate financial statements to isolate operational drivers of equity profitability and working capital health.",
            points: [
                "<strong>DuPont 3-Stage Model:</strong> Decomposed Return on Equity (ROE) into Net Profit Margin × Total Asset Turnover × Equity Multiplier to identify key value levers.",
                "<strong>Working Capital Ratios:</strong> Evaluated liquidity through Current Ratio, Quick Ratio, and Cash Conversion Cycle benchmarks.",
                "<strong>Financial Normalization:</strong> Normalized multi-period financial statements across balance sheet and income statement line items."
            ],
            tools: "Microsoft Excel &bull; Financial Modeling Formulas &bull; DuPont Architecture"
        },
        accounting: {
            category: "ACCOUNTING SYSTEMS & GOVERNANCE",
            title: "Accounting Projects & Ledger Systems",
            status: "PRACTICAL COURSEWORK & CASE STUDY",
            summary: "Hands-on accounting system implementations covering double-entry ledger architecture, trial balance verification, and computerized ledger workflows.",
            points: [
                "<strong>General Ledger Architecture:</strong> Designed structured Chart of Accounts conforming to IFRS and IAS 1 financial reporting rules.",
                "<strong>Trial Balance Equalization:</strong> Implemented strict verification mechanisms ensuring zero deviation between total debits and credits.",
                "<strong>QuickBooks Workflow:</strong> Simulated journal adjustments, accounts payable/receivable batches, and monthly bank reconciliations."
            ],
            tools: "QuickBooks &bull; Microsoft Excel &bull; Double-Entry General Ledger"
        },
        data: {
            category: "DATA ANALYTICS & BI DASHBOARDS",
            title: "Data Analysis & Dynamic Modeling",
            status: "ANALYTICAL PORTFOLIO ARTIFACT",
            summary: "Leveraging Microsoft Excel and automated Python scripts to clean, transform, and visualize transactional corporate datasets into executive KPI dashboards.",
            points: [
                "<strong>Dynamic Excel Modeling:</strong> Built executive dashboards utilizing XLOOKUP, INDEX/MATCH, and automated PivotTables.",
                "<strong>Variance Monitoring:</strong> Modeled monthly budget vs. actual discrepancies with conditional risk indicators.",
                "<strong>Python ETL Scripts:</strong> Processed raw transaction feeds using Pandas to eliminate anomalies and generate summarized tables."
            ],
            tools: "Python (Pandas) &bull; Microsoft Excel &bull; MySQL Queries"
        },
        research: {
            category: "MACROECONOMIC & INDUSTRIAL RESEARCH",
            title: "Bangladesh Industrial Sector Benchmarking",
            status: "INDEPENDENT ANALYTICAL STUDY",
            summary: "A rigorous comparative cross-sectional study evaluating liquidity buffers, debt leverage, and capital output across Ready-Made Garments (RMG), Pharmaceuticals, and Commercial Banking.",
            points: [
                "<strong>Cross-Sector Ratio Matrix:</strong> Benchmarked working capital cycles (CCC), interest coverage, and net margins across three critical economic engines.",
                "<strong>Liquidity Stress Testing:</strong> Examined working capital stress and trade credit dependencies under foreign exchange volatility.",
                "<strong>Actionable Strategic Findings:</strong> Formulated insights on supply chain financing and working capital rationalization for Bangladeshi exporters."
            ],
            tools: "Financial Statement Synthesis &bull; Ratio Analysis &bull; Empirical Economics"
        },
        ecotrail: {
            category: "ENVIRONMENTAL FIELDWORK // ROVER SCOUTING",
            title: "Eco-Trail & Mangrove Habitat Reconnaissance",
            status: "EXPEDITION & RECONNAISSANCE LOG",
            summary: "On-site environmental reconnaissance and ecological corridor observation conducted along coastal mangrove trail systems in southern Bangladesh. The project evaluated elevated wooden boardwalk structural integrity, eco-tourism footprint, and native mangrove biodiversity.",
            points: [
                "<strong>Eco-Trail Pathway Mapping:</strong> Assessed elevated wooden boardwalks, mangrove tidal channels, and regional visitor footpaths.",
                "<strong>Scouting Field Readiness:</strong> Tested outdoor navigation protocols, safety logistics, and environmental stewardship guidelines under Rover Scout principles.",
                "<strong>Biodiversity & Conservation Insights:</strong> Documented habitat preservation challenges along coastal wetland ecosystems."
            ],
            tools: "Field Observation Log &bull; GPS Trail Mapping &bull; Rover Scout Expedition Gear",
            location: "Kuakata / Coastal Mangrove Belt, Bangladesh",
            image: "assets/MyPhato/486602102_1898432044300315_7034389853923374296_n.jpg",
            imageAlt: "Md. Sabbir Hoshen on wooden mangrove canopy bridge during eco-trail reconnaissance"
        },
        archives: {
            category: "ACADEMIC RESEARCH // ARCHIVAL STUDY",
            title: "Institutional Accounting Archive & Literature Survey",
            status: "ACADEMIC ARCHIVAL STUDY",
            summary: "An independent literature survey and historical document cataloging project undertaken at the Government Brojomohun College Central Library archives. The study surveyed early commercial statutes, Bangladesh taxation ordinances, and foundational accounting manuals.",
            points: [
                "<strong>Archival Volume Cataloging:</strong> Surveyed physical archive stacks containing foundational texts on South Asian commercial law and public finance.",
                "<strong>Evolution of Statutory Standards:</strong> Traced historical transitions from legacy bookkeeping conventions to modern IFRS/IAS regulatory benchmarks.",
                "<strong>Research Literature Synthesis:</strong> Formulated structured reading annotations supporting undergraduate research in corporate governance."
            ],
            tools: "Central Library Physical Archives &bull; Historical Research Dossier &bull; Comparative Analysis",
            location: "Central Library, Govt. Brojomohun College, Barishal",
            image: "assets/MyPhato/547404569_2038757233601128_4717052026797427268_n.jpg",
            imageAlt: "Md. Sabbir Hoshen in the college library archives surveying financial reference volumes"
        },
        "rural-outreach": {
            category: "COMMUNITY SERVICE // FIELD LOGISTICS",
            title: "Regional Rover Scout Rural Outreach & Route Mapping",
            status: "COMMUNITY FIELD LOGISTICS",
            summary: "Field-based community assessment and route reconnaissance in peri-urban and rural Barishal, organizing field logistics and communication pathways for youth mobilization and community disaster preparedness.",
            points: [
                "<strong>Route Access Reconnaissance:</strong> Mapped local access roads, river crossings, and emergency rally points for community mobilization.",
                "<strong>Scout Team Logistics:</strong> Supervised kit packing, field ration inventories, and rapid communication check-ins during outdoor drills.",
                "<strong>Community Needs Assessment:</strong> Engaged with local neighborhood residents to record primary infrastructure and seasonal flood vulnerability."
            ],
            tools: "Field Logistics Kit &bull; Route Planning &bull; Rover Scout Community Service",
            location: "Barishal Division, Southern Bangladesh",
            image: "assets/MyPhato/548302483_2038758410267677_7757873842697085935_n.jpg",
            imageAlt: "Md. Sabbir Hoshen equipped with travel backpack during rural scouting outreach"
        },
        "green-campus": {
            category: "SUSTAINABILITY // CAMPUS INITIATIVE",
            title: "Campus Environmental Stewardship & Green Audit",
            status: "STUDENT-LED SUSTAINABILITY INITIATIVE",
            summary: "A student-led ecological stewardship project across the historic Government Brojomohun College campus, mapping tree canopy health, waste segregation points, and organizing student environmental patrols.",
            points: [
                "<strong>Canopy Preservation Audit:</strong> Surveyed century-old indigenous trees and campus green spaces to highlight conservation priorities.",
                "<strong>Waste Disposal Mapping:</strong> Identified key disposal choke points across academic buildings to propose improved recycling receptables.",
                "<strong>Peer Volunteer Mobilization:</strong> Encouraged classmates and fellow scouts to adopt zero-litter practices across campus study zones."
            ],
            tools: "Campus Zoning Matrix &bull; Environmental Audit Checklist &bull; Student Outreach",
            location: "Govt. Brojomohun College Campus, Barishal",
            image: "assets/MyPhato/484980983_1889100101900176_4018985165419655048_n.jpg",
            imageAlt: "Md. Sabbir Hoshen standing amidst lush trees on the Brojomohun College campus"
        },
        waterfront: {
            category: "CIVIC OBSERVATION // URBAN WALK",
            title: "Barishal Waterfront Civic Drainage & Riverine Observation",
            status: "URBAN WALK & CIVIC OBSERVATION",
            summary: "A qualitative urban observation study documenting public waterfront promenades, river transport hubs, and canal runoff along the banks of the Kirtankhola River in Barishal.",
            points: [
                "<strong>Riverfront Public Space Utility:</strong> Evaluated civic accessibility, shaded walking corridors, and public space maintenance.",
                "<strong>Waterfront Drainage Inspection:</strong> Observed tidal flow dynamics and canal drainage outlets interacting with municipal waterways.",
                "<strong>Civic Reflection Journal:</strong> Recorded photographic logs and notes on sustainable urban-riverfront coexistence in southern Bangladesh."
            ],
            tools: "Field Walk Logs &bull; Urban Observational Notes &bull; Digital Photography",
            location: "Kirtankhola Riverfront & Lake Park, Barishal",
            image: "assets/MyPhato/568621359_2071978623612322_2164499406392233930_n.jpg",
            imageAlt: "Md. Sabbir Hoshen at the scenic lakeside walkway in Barishal"
        },
        mentoring: {
            category: "COMMUNITY LEADERSHIP // PEER MENTORING",
            title: "Peer Academic Mentoring & Accounting Study Circles",
            status: "ACADEMIC KNOWLEDGE SHARING",
            summary: "Organizing collaborative peer tutoring circles and revision workshops for junior business studies and accounting students at BM College, simplifying complex ledger principles and accounting theory.",
            points: [
                "<strong>Double-Entry Foundations:</strong> Mentored peers on ledger posting, debit-credit equalization, and trial balance reconciliation.",
                "<strong>Exam Problem Workshops:</strong> Structured step-by-step problem-solving walkthroughs for higher secondary and undergraduate accounting exams.",
                "<strong>Academic Confidence Building:</strong> Created an inclusive, open-question study environment fostering conceptual clarity and collaborative growth."
            ],
            tools: "Peer Study Circles &bull; Whiteboard Accounting Demonstrations &bull; Problem Solving Sets",
            location: "Govt. Brojomohun College, Barishal",
            image: "assets/MyPhato/465783742_1795988934544627_8139255824473982833_n.jpg",
            imageAlt: "Md. Sabbir Hoshen smiling outdoors on campus following an academic discussion"
        },
        omorekushe: {
            category: "NATIVE SYSTEMS PROGRAMMING // WIN32",
            title: "Omor Ekushe — Win32 Bengali Keyboard Engine",
            status: "OPEN-SOURCE SOFTWARE UTILITY",
            summary: "A modern, ultra-lightweight, 100% native Win32 Bengali keyboard engine featuring Avro phonetic typing algorithms, XML layout maps, and full options configuration. Built as an open-source linguistic tool for Windows.",
            points: [
                "<strong>Win32 Hook Architecture:</strong> Implements system-level keyboard hooks to capture and transform keystrokes in real-time.",
                "<strong>Phonetic Mapping Algorithm:</strong> Powered by Avro phonetic parsing rules and XML-based custom layout mapping definitions.",
                "<strong>Zero-Bloat Native Performance:</strong> Compiled for Windows with zero external runtime dependencies and minimal memory consumption."
            ],
            tools: "Win32 API &bull; C / C++ &bull; Avro Phonetic Algorithm &bull; XML Layouts",
            link: "https://sabbir28.github.io/OmorEkushe/",
            linkText: "Launch Omor Ekushe Web Portal &nearr;"
        },
        pylua: {
            category: "COMPILER ARCHITECTURE &amp; RUNTIME",
            title: "PyLua — Scripting Language &amp; Virtual Machine",
            status: "LANGUAGE DESIGN EXPERIMENT",
            summary: "A modern scripting language and bytecode virtual machine runtime experiment combining Python syntax elegance with Lua's embeddable execution efficiency. Features a complete language specification, opcode tables, and documentation portal.",
            points: [
                "<strong>Lexical &amp; Syntax Pipeline:</strong> Implements a custom tokenizer, abstract syntax tree (AST) generator, and semantic analyzer.",
                "<strong>Bytecode Virtual Machine:</strong> Custom stack/register-based opcode set designed for fast instruction dispatch and lightweight memory footprint.",
                "<strong>Comprehensive Documentation:</strong> Full documentation portal covering grammar specifications, standard libraries, and embed APIs."
            ],
            tools: "Python &bull; Lua Runtime &bull; Bytecode Compiler &bull; AST Parsing &bull; VM Architecture",
            link: "https://sabbir28.github.io/PyLua/",
            linkText: "Explore PyLua Documentation Portal &nearr;"
        },
        gftp: {
            category: "DEV-OPS &amp; CLI AUTOMATION",
            title: "gftp — Git-Aware Differential FTP Sync CLI",
            status: "PRODUCTION CLI UTILITY",
            summary: "A high-performance C++ command-line tool built for Windows that accelerates website and codebase deployments by performing Git commit differential FTP synchronization in a single command, avoiding redundant uploads.",
            points: [
                "<strong>Git Differential Parsing:</strong> Queries local Git commit trees to isolate only modified, added, or deleted files since the last deployment.",
                "<strong>Automated FTP Upload Pipeline:</strong> Connects to remote FTP servers, mirrors directory structures, and transfers differential payloads with speed.",
                "<strong>Windows CLI Ergonomics:</strong> Single-binary execution with command-line flags, color-coded terminal output, and credential security."
            ],
            tools: "C++17 &bull; Win32 Sockets &bull; Git Tree Parsing &bull; FTP Protocol Engine",
            link: "https://sabbir28.github.io/gftp/",
            linkText: "View gftp CLI Docs &amp; Installation &nearr;"
        },
        casabbir: {
            category: "FULL-STACK WEB &amp; EDUCATION",
            title: "CA Sabbir — Chartered Accountancy Prep Portal",
            status: "WEB APPLICATION &amp; STUDY HUB",
            summary: "A dedicated cloud-deployed web workspace and resource hub designed to streamline Chartered Accountancy (ICAB) curriculum preparation, syllabus tracking, revision notes, and study scheduling.",
            points: [
                "<strong>Curriculum Syllabus Tracker:</strong> Interactive progress checklists covering ICAB Certificate Level modules and statutory chapters.",
                "<strong>Study Resource Library:</strong> Structured repository indexing accounting standards summaries, taxation notes, and past examination problems.",
                "<strong>Cloud Deployment:</strong> Hosted on Vercel with responsive mobile-first interface and fast client-side rendering."
            ],
            tools: "Next.js / React &bull; Vercel Cloud Hosting &bull; ICAB Certificate Curriculum",
            link: "https://casabbir.vercel.app/",
            linkText: "Access CA Sabbir Web App &nearr;"
        },
        timer420: {
            category: "DESKTOP UTILITY &amp; PRODUCTIVITY",
            title: "Timer420 — Transparent Windows Work Timer Overlay",
            status: "NATIVE DESKTOP UTILITY",
            summary: "A high-performance, non-intrusive, transparent desktop work timer for Windows 10 &amp; 11 built in pure C11 with the native Win32 API. Designed for distraction-free deep work, Pomodoro sessions, and time logging.",
            points: [
                "<strong>Transparent DWM Overlay:</strong> Renders seamlessly above desktop windows without stealing focus or interrupting keyboard input.",
                "<strong>Pure C11 Performance:</strong> Ultra-minimal CPU and RAM footprint utilizing direct GDI/DWM composition APIs.",
                "<strong>Web Interactive Simulator:</strong> Companion web simulation portal showcasing live timer configurations and feature previews."
            ],
            tools: "Pure C11 &bull; Win32 Direct API &bull; DWM Desktop Composition &bull; Web Simulator",
            link: "https://sabbir28.github.io/Timer/",
            linkText: "Launch Timer420 Portal &amp; Simulator &nearr;"
        },
        notepadlite: {
            category: "DESKTOP APPLICATION &amp; OPEN SOURCE",
            title: "NotepadLite — Native Windows Text Editor (v26.02.62)",
            status: "BINARY RELEASE &amp; REPOSITORY",
            summary: "A lightweight, zero-bloat native Windows text editor release engineered for instant cold startup, distraction-free document drafting, and essential status bar metrics.",
            points: [
                "<strong>Instantaneous Startup:</strong> Direct Win32 GUI window creation bypassing heavy application frameworks for instant file opening.",
                "<strong>Status Bar &amp; Metrics:</strong> Real-time line and column tracking, character counts, and encoding indicators.",
                "<strong>Published GitHub Release:</strong> Packaged binary release (v26.02.62) with version tracking, bug fixes, and source distribution."
            ],
            tools: "C / C++ &bull; Win32 GUI &bull; GitHub Releases &bull; Windows Binary Packaging",
            link: "https://github.com/sabbir28/Notepad/releases/tag/v26.02.62",
            linkText: "Download NotepadLite Release (v26.02.62) &nearr;"
        }
    };

    window.openProjectModal = function (projectId) {
        const item = projectData[projectId];
        if (!item) return;

        const modal = document.getElementById("projectModal");
        const body = document.getElementById("modalBody");
        if (!modal || !body) return;

        const imageHtml = item.image ? `
            <div class="modal-hero-wrap">
                <img src="${item.image}" alt="${item.imageAlt || item.title}" class="modal-hero-img" loading="lazy">
                <div class="modal-hero-caption">
                    <span>${item.location ? `&bull; ${item.location}` : 'Visual Field Chronicle'}</span>
                    <a href="${item.image}" target="_blank" rel="noopener noreferrer" class="modal-zoom-link">Open High-Res Photo &nearr;</a>
                </div>
            </div>
        ` : '';

        const actionBtnHtml = item.link ? `
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-light);">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="modal-action-btn">
                    ${item.linkText || 'Open External Resource &nearr;'}
                </a>
            </div>
        ` : '';

        body.innerHTML = `
            ${imageHtml}
            <div class="modal-category">${item.category}</div>
            <h3 class="modal-title">${item.title}</h3>
            <span class="modal-tag">${item.status}</span>
            <p class="modal-summary">
                ${item.summary}
            </p>
            <div class="modal-section">
                <div class="modal-section-title">
                    Key Highlights &amp; Technical Architecture
                </div>
                <ul class="modal-list">
                    ${item.points.map((pt) => `<li>${pt}</li>`).join("")}
                </ul>
            </div>
            <div class="modal-section" style="padding-bottom: 0;">
                <div class="modal-section-title">
                    Toolkit, Location &amp; Methodology
                </div>
                <p style="font-family: var(--mono); font-size: 13px; color: var(--navy-midnight);">
                    ${item.tools}
                </p>
                ${item.location ? `
                <p style="font-family: var(--sans); font-size: 13px; color: var(--text-muted); margin-top: 8px;">
                    <strong>Location:</strong> ${item.location}
                </p>` : ''}
            </div>
            ${actionBtnHtml}
        `;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.closeProjectModal = function () {
        const modal = document.getElementById("projectModal");
        if (modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "";
        }
    };

    window.closeModalOnBackdrop = function (e) {
        if (e.target === document.getElementById("projectModal")) {
            window.closeProjectModal();
        }
    };

    function initSecondaryFilter() {
        const filterNav = document.getElementById("secondaryFilterNav");
        const grid = document.getElementById("secondaryGrid");
        if (!filterNav || !grid) return;

        const buttons = filterNav.querySelectorAll(".secondary-filter-btn");
        const cards = grid.querySelectorAll(".secondary-card");

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const filter = btn.getAttribute("data-filter");
                buttons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                cards.forEach((card) => {
                    const cat = card.getAttribute("data-category");
                    if (filter === "all" || cat === filter) {
                        card.style.display = "flex";
                        card.style.opacity = "1";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    function init() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                window.closeProjectModal();
            }
        });
        initSecondaryFilter();
    }

    root.Portfolio.modal = {
        init: init,
        projectData: projectData
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: toast.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — CLIPBOARD UTILITIES & TOAST NOTIFICATION MODULE
 * Unobtrusive toast feedback and resilient cross-browser clipboard copy actions.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
    // 12. CLIPBOARD UTILITIES & TOAST NOTIFICATIONS
    // ==========================================================================
    const toast = document.getElementById("toastNotification");
    let toastTimeout = null;

    window.copyToClipboard = function (text, message = "Copied to clipboard") {
        if (!navigator.clipboard) {
            const input = document.createElement("input");
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            showToast(message);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast(message);
        }).catch(() => {
            showToast("Failed to copy");
        });
    };

    function showToast(msg) {
        if (!toast) return;
        toast.innerHTML = `<span>✓</span> <span>${msg}</span>`;
        toast.classList.add("active");

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove("active");
        }, 2800);
    }

    // ==========================================================================

    }

    root.Portfolio.toast = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: clock.js <<<
/**
 * MD. SABBIR HOSHEN HOWLADER — LIVE LOCAL TIME ENGINE MODULE
 * Real-time Barishal / Dhaka (UTC+6) live clock in the luxury footer.
 */
(function (root) {
    "use strict";

    root.Portfolio = root.Portfolio || {};

    function init() {
    // 13. LIVE LOCAL TIME ENGINE (BARISHAL / DHAKA UTC+6)
    // ==========================================================================
    const clockElem = document.getElementById("liveLocalTime");
    function updateClock() {
        if (!clockElem) return;
        try {
            const now = new Date();
            const timeStr = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Dhaka",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }).format(now);
            clockElem.textContent = `BARISHAL / DHAKA: ${timeStr} (UTC+6)`;
        } catch (e) {
            clockElem.textContent = "BARISHAL / DHAKA (UTC+6)";
        }
    }
    updateClock();
    setInterval(updateClock, 1000);


    }

    root.Portfolio.clock = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);


// >>> MODULE: scroll-animations.js <<<
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


// ==============================================================================
// MASTER PRODUCTION SUBSYSTEM ORCHESTRATOR
// ==============================================================================
(function (root) {
    function bootstrapSubsystems() {
        const P = root.Portfolio;
        if (!P) return;

        // 1. Lenis Smooth Momentum Scrolling
        let lenis = null;
        if (P.scroll && typeof P.scroll.init === "function") {
            try {
                lenis = P.scroll.init();
            } catch (err) {
                console.warn("[Portfolio.scroll] Init notice:", err);
            }
        }

        // 2. Atmospheric Canvas Particles (Intro & Hero)
        if (P.particles && typeof P.particles.init === "function") {
            try {
                P.particles.init();
            } catch (err) {
                console.warn("[Portfolio.particles] Init notice:", err);
            }
        }

        // 3. Cinematic Intro Sequence
        if (P.intro && typeof P.intro.init === "function") {
            try {
                P.intro.init();
            } catch (err) {
                console.warn("[Portfolio.intro] Init notice:", err);
            }
        }

        // 4. Desktop Precision Custom Cursor
        if (P.cursor && typeof P.cursor.init === "function") {
            try {
                P.cursor.init();
            } catch (err) {
                console.warn("[Portfolio.cursor] Init notice:", err);
            }
        }

        // 5. Luxury Navbar & Scroll Progress Bar
        if (P.navbar && typeof P.navbar.init === "function") {
            try {
                P.navbar.init();
            } catch (err) {
                console.warn("[Portfolio.navbar] Init notice:", err);
            }
        }

        // 6. Active Navigation Section Spy
        if (P.sectionSpy && typeof P.sectionSpy.init === "function") {
            try {
                P.sectionSpy.init();
            } catch (err) {
                console.warn("[Portfolio.sectionSpy] Init notice:", err);
            }
        }

        // 7. 3D Tilt & Dynamic Spotlight Engine
        if (P.tilt && typeof P.tilt.init === "function") {
            try {
                P.tilt.init();
            } catch (err) {
                console.warn("[Portfolio.tilt] Init notice:", err);
            }
        }

        // 8. Signature Education Timeline (2010 to Present)
        if (P.timeline && typeof P.timeline.init === "function") {
            try {
                P.timeline.init();
            } catch (err) {
                console.warn("[Portfolio.timeline] Init notice:", err);
            }
        }

        // 9. Institutional Research Benchmark Visualization
        if (P.benchmarks && typeof P.benchmarks.init === "function") {
            try {
                P.benchmarks.init();
            } catch (err) {
                console.warn("[Portfolio.benchmarks] Init notice:", err);
            }
        }

        // 10. Case Study Modal System
        if (P.modal && typeof P.modal.init === "function") {
            try {
                P.modal.init();
            } catch (err) {
                console.warn("[Portfolio.modal] Init notice:", err);
            }
        }

        // 11. Toast Feedback & Clipboard Utilities
        if (P.toast && typeof P.toast.init === "function") {
            try {
                P.toast.init();
            } catch (err) {
                console.warn("[Portfolio.toast] Init notice:", err);
            }
        }

        // 12. Live Local Time Engine (Barishal / Dhaka UTC+6)
        if (P.clock && typeof P.clock.init === "function") {
            try {
                P.clock.init();
            } catch (err) {
                console.warn("[Portfolio.clock] Init notice:", err);
            }
        }

        // 13. GSAP ScrollTrigger & Resilient Observer Animations
        if (P.animations && typeof P.animations.init === "function") {
            try {
                P.animations.init(lenis);
            } catch (err) {
                console.warn("[Portfolio.animations] Init notice:", err);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrapSubsystems);
    } else {
        bootstrapSubsystems();
    }

    root.Portfolio.init = bootstrapSubsystems;
})(typeof window !== "undefined" ? window : this);
