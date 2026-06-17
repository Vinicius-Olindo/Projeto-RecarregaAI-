// RecarregaAi! 1.7.6

import { readFileSync } from "node:fs";

JSON.parse(readFileSync("manifest.json", "utf8"));
console.log("manifest ok");
