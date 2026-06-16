// RecarregaAi! V.1.4.8

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const eslintCommand = process.platform === "win32"
  ? "node_modules\\.bin\\eslint.cmd"
  : "node_modules/.bin/eslint";

if (!existsSync(eslintCommand)) {
  console.warn("ESLint nao instalado. Rode npm install para ativar o lint.");
  process.exit(0);
}

const result = spawnSync(eslintCommand, [
  "JS/**/*.js",
  "scripts/**/*.mjs",
  "eslint.config.mjs"
], {
  shell: true,
  stdio: "inherit"
});

process.exit(result.status || 0);
