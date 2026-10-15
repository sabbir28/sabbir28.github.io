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
