import assert from "node:assert/strict";
import test from "node:test";

import { getDictionary } from "./dictionary.ts";

test("provides footer-only product copy without changing the shared tagline", () => {
  const dictionary = getDictionary("en");

  assert.equal(dictionary.footer.productLine, "Window | Doors | Glass | Blinds");
  assert.equal(dictionary.footer.tagline, "Windows, doors & glass systems in Pejë, Kosovo.");
});
