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
