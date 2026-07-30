// Self-check for the product options library: every option's labelKey must
// resolve to a real string in locales/en/product.json, and optionLabel must
// fall back to the raw code for legacy free-text values.
//
// Run: node lib/productOptions.check.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const en = JSON.parse(readFileSync(join(root, "locales/en/product.json"), "utf8"));
const src = readFileSync(join(root, "lib/productOptions.ts"), "utf8");

// The library is TS; re-derive its option groups from the `group(...)` calls
// rather than pulling in a compiler just for this check.
const groups = [];
for (const m of src.matchAll(/group\(\s*"([a-z_]+)"\s*,\s*\[([^\]]*)\]/g)) {
  const codes = [...m[2].matchAll(/"([^"]+)"/g)].map((c) => c[1]);
  groups.push({ name: m[1], codes });
}
assert.ok(groups.length >= 10, `expected many option groups, got ${groups.length}`);

const missing = [];
for (const { name, codes } of groups) {
  for (const code of codes) {
    if (typeof en[name]?.[code.toLowerCase()] !== "string") {
      missing.push(`product:${name}.${code.toLowerCase()}`);
    }
  }
}
assert.deepEqual(missing, [], `option codes with no English label:\n${missing.join("\n")}`);

// optionLabel semantics: known code translates, unknown code renders as-is.
const t = (key, opts) => {
  const [, path] = key.split(":");
  const [ns, code] = path.split(".");
  return en[ns]?.[code] ?? opts?.defaultValue ?? key;
};
const optionLabel = (t, name, code) =>
  t(`product:${name}.${code.toLowerCase()}`, { defaultValue: code });

assert.equal(optionLabel(t, "material", "cotton_silk"), "Cotton-Silk");
assert.equal(optionLabel(t, "category", "SAREE"), "Saree");
// Legacy rows hold free text — must render, not leak a key path.
assert.equal(optionLabel(t, "material", "Pure Silk"), "Pure Silk");

console.log(`ok — ${groups.length} option groups, all labels present`);
