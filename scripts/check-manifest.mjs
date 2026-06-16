// RecarregaAi! V.1.4.9

import { readFileSync } from "node:fs";

JSON.parse(readFileSync("manifest.json", "utf8"));
console.log("manifest ok");
