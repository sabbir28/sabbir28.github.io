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
