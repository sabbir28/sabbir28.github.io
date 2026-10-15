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
