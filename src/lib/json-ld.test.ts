import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "./json-ld.ts";

test("JSON-LD cannot break out of its script tag and preserves content", () => {
  const data = { address: '</script><script>alert("x")</script>', name: "Gergoci" };
  const serialized = serializeJsonLd(data);
  assert.equal(serialized.includes("<"), false);
  assert.deepEqual(JSON.parse(serialized), data);
});
