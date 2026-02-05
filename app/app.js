"use strict";

/**
 * Configuration layer
 * Single source of truth
 */
const CONFIG = {
  apiUrl: "https://api.github.com/repos/sabbir28/GBC/releases/latest",
  appName: "Government Brojomohun College",
  iconUrl:
    "https://raw.githubusercontent.com/sabbir28/GBC/main/app/src/main/res/drawable/bm_college_logo.png",

  bannerUrl:
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/final.png?raw=true",

  screenshots: [
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/1.png?raw=true",
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/2.png?raw=true",
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/3.png?raw=true",
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/4.png?raw=true"
  ]
};

/**
 * DEBUG-only APK selector
 * Governance decision: debug builds only
 */
function selectDebugApk(assets) {
  if (!Array.isArray(assets)) return null;
  return assets.find(a => a.name === "app-debug.apk") || null;
}

/**
 * Utilities
 */
function formatSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

/**
 * UI bootstrap
 */
fetch(CONFIG.apiUrl)
  .then(res => {
    if (!res.ok) {
      throw new Error("GitHub API request failed");
    }
    return res.json();
  })
  .then(release => {
    const apk = selectDebugApk(release.assets);
    if (!apk) {
      throw new Error("DEBUG APK not found in release");
    }

    /* ================= HEADER ================= */

    document.getElementById("appIcon").src = CONFIG.iconUrl;
    document.getElementById("appName").textContent = CONFIG.appName;
    document.getElementById("appVersion").textContent =
      `Version ${release.tag_name} • DEBUG`;

    /* ================= BANNER ================= */

    const banner = document.getElementById("banner");
    if (banner) {
      banner.src = CONFIG.bannerUrl;
    }

    /* ================= DESCRIPTION ================= */

    document.getElementById("appDescription").textContent =
      "The Government Brojomohun College application provides students with a centralized platform to access regular class updates, schedules, and official announcements. " +
      "Students receive real-time notifications for class activities, schedule changes, and important academic information. " +
      "The app is designed to simplify daily academic coordination and ensure timely communication.";

    /* ================= ACTION ================= */

    const actionBtn = document.getElementById("actionBtn");
    actionBtn.href = apk.browser_download_url;
    actionBtn.textContent = "INSTALL";

    /* ================= PLAY-STORE METRICS ================= */

    const meta = document.createElement("div");
    meta.className = "store-meta";
    meta.innerHTML = `
      <div>
        <span>${formatSize(apk.size)}</span>
        <label>Size</label>
      </div>
      <div>
        <span>${apk.download_count}</span>
        <label>Downloads</label>
      </div>
      <div>
        <span>${formatDate(release.published_at)}</span>
        <label>Updated</label>
      </div>
    `;

    document.querySelector(".header").after(meta);

    /* ================= SCREENSHOTS ================= */

    const screenshots = document.getElementById("screenshots");
    screenshots.innerHTML = "";

    CONFIG.screenshots.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Application screenshot";
      screenshots.appendChild(img);
    });
  })
  .catch(err => {
    console.error(err);

    document.getElementById("appName").textContent =
      "Application unavailable";
    document.getElementById("appDescription").textContent =
      "Unable to load application data. Please retry later.";
  });
