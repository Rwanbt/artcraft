import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const signingWorkflow = new URL("../../.github/workflows/artcraft-macos-publish.yml", import.meta.url);
const source = await readFile(signingWorkflow, "utf8");

test("macOS signing never dumps unencrypted private keys to Actions logs", () => {
  assert.doesNotMatch(source, /(?:^|\s)-nodes(?:\s|$)/m);
  assert.doesNotMatch(source, /openssl pkcs12[^\n]*-nocerts/);
  assert.doesNotMatch(source, /openssl pkcs12[^\n]*-info[^\n]*\|\s*head/);
});

test("PKCS#12 validation avoids passing its password as a command-line argument", () => {
  assert.doesNotMatch(source, /-passin\s+pass:/);
  assert.match(source, /-passin env:APPLE_CERTIFICATE_PASSWORD/);
});

test("the temporary signing archive is created privately and cleaned up on exit", () => {
  assert.match(source, /umask 077/);
  assert.match(source, /trap 'rm -f certificate\.p12' EXIT/);
  assert.match(source, /printf '%s' "\$APPLE_CERTIFICATE" \| base64 --decode > certificate\.p12/);
});
