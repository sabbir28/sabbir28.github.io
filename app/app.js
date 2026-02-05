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

  // Temporary placeholders – replace later
  placeholderScreenshots: [
    "https://raw.githubusercontent.com/sabbir28/GBC/main/app/src/main/res/drawable/bm_college_logo.png",
    "https://raw.githubusercontent.com/sabbir28/GBC/main/app/src/main/res/drawable/bm_college_logo.png"
  ]
};

/**
 * Utility: Select preferred APK
 * Strategy: release > debug > first apk
 */
function selectApk(assets) {
  if (!Array.isArray(assets)) return null;

  return (
    assets.find(a => a.name === "app-debug.apk") ||
    assets.find(a => a.name.endsWith(".apk")) ||
    null
  );
}

/**
 * UI bootstrap
 */
fetch(CONFIG.apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error("GitHub API request failed");
    }
    return response.json();
  })
  .then(release => {
    const apk = selectApk(release.assets);

    if (!apk) {
      throw new Error("No APK asset found in release");
    }

    // Header
    document.getElementById("appIcon").src = CONFIG.iconUrl;
    document.getElementById("appName").textContent = CONFIG.appName;
    document.getElementById("appVersion").textContent =
      `Version ${release.tag_name}`;

    // Description (null-safe)
    document.getElementById("appDescription").textContent =
      release.body?.trim() ||
      "Official Android application. Download the latest version below.";

    // Install / Update CTA
    const actionBtn = document.getElementById("actionBtn");
    actionBtn.href = apk.browser_download_url;
    actionBtn.textContent = "INSTALL";

    // Screenshots (placeholder for now)
    const screenshots = document.getElementById("screenshots");
    screenshots.innerHTML = "";

    CONFIG.placeholderScreenshots.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "App screenshot";
      screenshots.appendChild(img);
    });
  })
  .catch(error => {
    console.error(error);

    document.getElementById("appName").textContent =
      "Unable to load application";
    document.getElementById("appDescription").textContent =
      "Please check your network connection or try again later.";
  });
