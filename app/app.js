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

  // Temporary placeholders
  placeholderScreenshots: [
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/1.png?raw=true",
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/2.png?raw=true",
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/3.png?raw=true",
    "https://github.com/sabbir28/sabbir28.github.io/blob/main/app/img/4.png?raw=true"
  ]
};

/**
 * DEBUG-only APK selector
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
  .then(r => {
    if (!r.ok) throw new Error("GitHub API failed");
    return r.json();
  })
  .then(release => {
    const apk = selectDebugApk(release.assets);
    if (!apk) throw new Error("Debug APK not found");

    /* Header */
    document.getElementById("appIcon").src = CONFIG.iconUrl;
    document.getElementById("appName").textContent = CONFIG.appName;
    document.getElementById("appVersion").textContent =
      `Version ${release.tag_name} • DEBUG`;

    /* Description */
    document.getElementById("appDescription").textContent =
      release.body?.trim() ||
      "Official DEBUG build distributed via GitHub Releases.";

    /* Action */
    const actionBtn = document.getElementById("actionBtn");
    actionBtn.href = apk.browser_download_url;
    actionBtn.textContent = "INSTALL";

    /* Play-Store-style metadata row */
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

    /* Screenshots */
    const screenshots = document.getElementById("screenshots");
    screenshots.innerHTML = "";

    CONFIG.placeholderScreenshots.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "App screenshot";
      screenshots.appendChild(img);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("appName").textContent =
      "Unable to load application";
    document.getElementById("appDescription").textContent =
      "GitHub API error or rate limit reached.";
  });
