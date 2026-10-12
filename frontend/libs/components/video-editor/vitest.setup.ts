// Vitest runs in Node/jsdom. Vite's /@fs file URLs are not understood by
// Node's native fetch, so load the *real* opencut-wasm binary from its
// installed local package. Do not mock media-time algorithms or project logic.
import { readFile } from "node:fs/promises";

const nativeFetch = globalThis.fetch.bind(globalThis);

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string"
    ? input
    : input instanceof URL ? input.toString() : input.url;

  if (url.startsWith("/@fs/") && url.endsWith("/opencut_wasm_bg.wasm")) {
    const filename = decodeURIComponent(url.slice("/@fs".length));
    return readFile(filename).then((bytes) => new Response(bytes, {
      headers: { "Content-Type": "application/wasm" },
    }));
  }
  return nativeFetch(input, init);
}) as typeof fetch;
