/**
 * ==============================================================================
 * MD. SABBIR HOSHEN HOWLADER — EXECUTIVE CV INTERACTION SCRIPT
 * ==============================================================================
 * Unobtrusive script handling print actions and keyboard navigation.
 * ==============================================================================
 */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    // Print / PDF Button Trigger
    const btnPrintCv = document.getElementById("btnPrintCv");
    if (btnPrintCv) {
        btnPrintCv.addEventListener("click", function () {
            window.print();
        });
    }

    // Keyboard Navigation: Escape returns to portfolio homepage
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            const backLink = document.querySelector(".back-link");
            if (backLink && backLink.href) {
                window.location.href = backLink.href;
            }
        }
    });
});
