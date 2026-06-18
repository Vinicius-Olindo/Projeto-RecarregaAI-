// RecarregaAi! 1.8.6

import { spawnSync } from "node:child_process";

const filesToCheck = [
  "eslint.config.mjs",
  "JS/background.js",
  "JS/popup.js",
  "JS/options.js",
  "JS/privacy.js",
  "JS/uninstall.js",
  "JS/welcome.js",
  "JS/content.js",
  "JS/modules/cache.js",
  "JS/modules/config.js",
  "JS/modules/shared.js",
  "JS/modules/storage.js",
  "JS/modules/tabs.js",
  "JS/modules/theme.js",
  "scripts/check-js.mjs",
  "scripts/check-manifest.mjs",
  "scripts/package-extension.mjs"
];

for (const filePath of filesToCheck) {
  const result = spawnSync("node", ["--check", filePath], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
