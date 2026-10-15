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
