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
