/**
 * ==============================================================================
 * MD. SABBIR HOSHEN HOWLADER — EXECUTIVE RESUME & CINEMATIC REDIRECT ENGINE
 * ==============================================================================
 * Automatically presents a high-tech holographic redirect sequence and
 * transfers the visitor to the official verified Google Drive Curriculum Vitae.
 * Allows instant launch, cancellation to view the web CV, and full keyboard/print control.
 * ==============================================================================
 */

"use strict";

(function () {
    const REDIRECT_URL = "https://drive.google.com/file/d/1biUJ33tODC9pe4xQnkNn7k8QJ5OfDkz1/view?usp=sharing";
    const TOTAL_DURATION = 3500; // 3.5 seconds countdown
    const RADAR_CIRCUMFERENCE = 264; // 2 * PI * 42 ~= 263.89

    let redirectTimer = null;
    let animationFrameId = null;
    let isCancelled = false;
    let startTime = null;

    // Terminal Status Sequence Steps
    const statusSteps = [
        { threshold: 0.00, message: "Initializing secure TLS session with Google Drive cloud..." },
        { threshold: 0.25, message: "Authenticating ICAB candidate credentials & audit checksums..." },
        { threshold: 0.55, message: "Credential verified. Preparing high-resolution PDF package..." },
        { threshold: 0.82, message: "Payload ready. Finalizing transfer to Google Drive viewer..." },
        { threshold: 1.00, message: "Redirecting to official Google Drive Curriculum Vitae now..." }
    ];

    document.addEventListener("DOMContentLoaded", function () {
        initRedirectEngine();
        initConstellationCanvas();
        initWebCvControls();
    });

    /**
     * Initializes the Automated Redirect Sequence
     */
    function initRedirectEngine() {
        const redirectScreen = document.getElementById("redirectScreen");
        const counterBadge = document.getElementById("counterBadge");
        const radarProgress = document.getElementById("radarProgress");
        const radarCountdown = document.getElementById("radarCountdown");
        const terminalPercent = document.getElementById("terminalPercent");
        const terminalMsg = document.getElementById("terminalMsg");
        const progressBarFill = document.getElementById("progressBarFill");
        const btnOpenNow = document.getElementById("btnOpenNow");
        const btnStayWeb = document.getElementById("btnStayWeb");

        if (!redirectScreen) return;

        // Button: Open Immediately
        if (btnOpenNow) {
            btnOpenNow.addEventListener("click", function (e) {
                // If clicked, cancel the auto loop and navigate directly
                isCancelled = true;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
            });
        }

        // Button: Stay on Web CV
        if (btnStayWeb) {
            btnStayWeb.addEventListener("click", function () {
                dismissRedirectScreen();
            });
        }

        // Start Smooth Animation Loop
        startTime = performance.now();

        function updateFrame(now) {
            if (isCancelled) return;

            const elapsed = now - startTime;
            const progress = Math.min(elapsed / TOTAL_DURATION, 1.0);
            const remainingSec = Math.max(0, ((TOTAL_DURATION - elapsed) / 1000)).toFixed(1);
            const percent = Math.floor(progress * 100);

            // Update Countdown Text
            if (counterBadge) {
                counterBadge.textContent = progress < 1.0 
                    ? "Redirecting in " + remainingSec + "s" 
                    : "Transferring now...";
            }

            if (radarCountdown) {
                radarCountdown.textContent = progress < 1.0 ? remainingSec + "s" : "0.0s";
            }

            // Update Circular Radar Progress
            if (radarProgress) {
                const offset = RADAR_CIRCUMFERENCE * (1 - progress);
                radarProgress.style.strokeDashoffset = offset;
            }

            // Update Linear Progress Bar
            if (progressBarFill) {
                progressBarFill.style.width = percent + "%";
            }

            if (terminalPercent) {
                terminalPercent.textContent = percent + "%";
            }

            // Update Dynamic Terminal Telemetry Message
            if (terminalMsg) {
                for (let i = statusSteps.length - 1; i >= 0; i--) {
                    if (progress >= statusSteps[i].threshold) {
                        if (terminalMsg.dataset.step !== String(i)) {
                            terminalMsg.dataset.step = String(i);
                            terminalMsg.style.opacity = "0.4";
                            setTimeout(() => {
                                terminalMsg.textContent = statusSteps[i].message;
                                terminalMsg.style.opacity = "1";
                            }, 50);
                        }
                        break;
                    }
                }
            }

            // Check if finished
            if (progress >= 1.0) {
                if (terminalMsg) {
                    terminalMsg.textContent = "Redirecting to Google Drive...";
                }
                setTimeout(function () {
                    if (!isCancelled) {
                        window.location.href = REDIRECT_URL;
                    }
                }, 150);
                return;
            }

            animationFrameId = requestAnimationFrame(updateFrame);
        }

        animationFrameId = requestAnimationFrame(updateFrame);
    }

    /**
     * Dismisses the redirect modal and reveals the full printable web CV
     */
    function dismissRedirectScreen() {
        isCancelled = true;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        const redirectScreen = document.getElementById("redirectScreen");
        if (redirectScreen) {
            redirectScreen.classList.add("dismissed");
            setTimeout(() => {
                redirectScreen.style.display = "none";
            }, 550);
        }

        const banner = document.getElementById("webCvBanner");
        if (banner) {
            banner.classList.add("visible");
        }

        // Scroll gracefully to top of web paper
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /**
     * Interactive Ambient Constellation Canvas Animation
     */
    function initConstellationCanvas() {
        const canvas = document.getElementById("redirectCanvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        let mouse = { x: null, y: null, radius: 120 };

        window.addEventListener("resize", function () {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createParticles();
        });

        window.addEventListener("mousemove", function (e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener("mouseleave", function () {
            mouse.x = null;
            mouse.y = null;
        });

        const particles = [];
        const particleCount = Math.min(Math.floor((width * height) / 18000), 65);

        const colors = [
            "rgba(15, 168, 137, 0.7)",   // Emerald Green
            "rgba(200, 168, 91, 0.75)",  // Champagne Gold
            "rgba(255, 255, 255, 0.5)"   // Crisp White
        ];

        function createParticles() {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.7,
                    vy: (Math.random() - 0.5) * 0.7,
                    radius: Math.random() * 2 + 1,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }

        createParticles();

        function renderCanvas() {
            const screen = document.getElementById("redirectScreen");
            if (isCancelled && screen && screen.classList.contains("dismissed")) {
                return; // Stop rendering canvas when dismissed to save CPU
            }

            ctx.clearRect(0, 0, width, height);

            // Update & Draw Particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Boundary bounce
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Mouse interaction: soft push
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        p.x += (dx / dist) * force * 2.5;
                        p.y += (dy / dist) * force * 2.5;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Draw connecting lines between nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 110) {
                        const alpha = (1 - dist / 110) * 0.22;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(15, 168, 137, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(renderCanvas);
        }

        renderCanvas();
    }

    /**
     * Web CV interactions (Print, Keyboard, Banner)
     */
    function initWebCvControls() {
        // Print / Save as PDF Button
        const btnPrintCv = document.getElementById("btnPrintCv");
        if (btnPrintCv) {
            btnPrintCv.addEventListener("click", function () {
                window.print();
            });
        }

        // Close Banner Button
        const btnCloseBanner = document.getElementById("btnCloseBanner");
        if (btnCloseBanner) {
            btnCloseBanner.addEventListener("click", function () {
                const banner = document.getElementById("webCvBanner");
                if (banner) banner.style.display = "none";
            });
        }

        // Keyboard Navigation
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                const redirectScreen = document.getElementById("redirectScreen");
                if (redirectScreen && !redirectScreen.classList.contains("dismissed")) {
                    dismissRedirectScreen();
                } else {
                    const backLink = document.querySelector(".back-link");
                    if (backLink && backLink.href) {
                        window.location.href = backLink.href;
                    }
                }
            }
        });
    }
})();
