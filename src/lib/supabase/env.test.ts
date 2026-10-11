import assert from "node:assert/strict";
import test from "node:test";
import { requiredEnv } from "./env.ts";

test("required configuration rejects missing values without exposing values", () => {
  for (const value of [undefined, "", "  "]) {
    assert.throws(() => requiredEnv(value, "TEST_KEY"), { message: "Missing required environment variable: TEST_KEY" });
  }
  assert.equal(requiredEnv("configured", "TEST_KEY"), "configured");
});
