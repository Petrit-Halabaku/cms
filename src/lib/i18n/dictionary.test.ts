import assert from "node:assert/strict";
import test from "node:test";

import { getDictionary } from "./dictionary.ts";

test("provides footer-only product copy without changing the shared tagline", () => {
  const dictionary = getDictionary("en");

  assert.equal(dictionary.footer.productLine, "Window | Doors | Glass | Blinds");
  assert.equal(dictionary.footer.tagline, "Windows, doors & glass systems in Pejë, Kosovo.");
});


test("supported locales provide complete market copy", () => {
  for (const locale of ["en", "sq"] as const) {
    for (const value of Object.values(getDictionary(locale).markets)) {
      assert.equal(typeof value, "string");
      assert.ok(value.length > 0);
    }
  }
});

test("invalid locale values fail explicitly", () => {
  for (const value of ["wp-login.php", "wp-sitemap.xml", "99631947.htm", "fr", "constructor", "__proto__", ""]) {
    assert.throws(() => getDictionary(value as Parameters<typeof getDictionary>[0]), RangeError);
  }
});
