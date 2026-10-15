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
