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
        }
    }

    root.Portfolio.timeline = {
        init: init
    };
})(typeof window !== "undefined" ? window : this);
