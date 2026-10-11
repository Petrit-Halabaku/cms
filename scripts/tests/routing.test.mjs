import assert from "node:assert/strict";
import test from "node:test";

// Run against a local production server started with `next start --port 3217`.
const origin = "http://127.0.0.1:3217";
for (const [path, expected] of [
  ["/", 200], ["/sq", 200], ["/products", 200], ["/en", 301],
  ["/wp-login.php", 404], ["/wp-sitemap.xml", 404], ["/99631947.htm", 404],
  ["/xmlrpc.php", 404], ["/fr", 404], ["/missing-page", 404], ["/sq/missing-page", 404],
]) {
  test(`built route ${path} returns ${expected}`, async () => {
    const response = await fetch(`${origin}${path}`, { redirect: "manual" });
    assert.equal(response.status, expected);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    if (expected === 301) assert.equal(response.headers.get("location"), "/");
    const body = await response.text();
    if (path === "/") assert.match(body, /https:\/\/www\.gergoci\.eu/);
  });
}
