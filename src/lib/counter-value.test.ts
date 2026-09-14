import assert from "node:assert/strict";
import test from "node:test";

import { parseCounterValue } from "./counter-value.ts";

test("parses an admin counter value for the odometer", () => {
  assert.deepEqual(parseCounterValue("1,200+"), { value: 1200, suffix: "+" });
});

test("rejects counter values without a number", () => {
  assert.equal(parseCounterValue("many"), null);
});
