# Reproduce ArtCraft fork quality checks

This file is about the **fork** and never authorizes sending generation, purchase, subscription or upload requests to paid production services.

## Reference CI

Workflow: [`.github/workflows/fork-quality-baseline.yml`](../../.github/workflows/fork-quality-baseline.yml).
First fully successful run: [38267510528](https://github.com/Rwanbt/artcraft/actions/runs/38267510528), SHA `1933db3e`.
PR [#1](https://github.com/Rwanbt/artcraft/pull/1) must remain draft until broader acceptance gates are actually green.

### Commands

From repository root (Rust stable; SQLx uses checked-in offline metadata where needed):

```sh
SQLX_OFFLINE=true cargo test --locked -p web_base64 -p url_utils -p mimetypes
cargo llvm-cov --locked -p web_base64 -p url_utils --lcov --output-path coverage-rust.lcov
cargo llvm-cov report --summary-only
```

From `frontend/` (Node 24, npm lockfile):

```sh
npm ci --no-audit --no-fund
npx vitest run --config libs/components/moodboard/vite.config.ts --coverage
node --test scripts/unix-dev.test.mjs
```

The launcher test intentionally starts a **real local Vite HTTP/WebSocket server**, but substitutes a fake Cargo process tree. It is **not** a native desktop UI E2E and does not call remote generation providers.

To review the broader frontend test-runner inventory, use the fork workflow's additional workspace Vitest job; do not confuse workspace test failures with the passing focused moodboard run.

## Evidence and reporting

- GitHub Actions job and artifact URLs are scoped to the exact commit SHA.
- `rust-core-coverage`: LLVM LCOV; `frontend-moodboard-coverage`: V8 output.
- Do not combine V8 and LLVM percentages; keep per-module and per-language denominators.
- Count individual tests with real runner output (`-- --list` / Vitest summary), not file glob counts.
- No exclusions or hard 100% thresholds should be introduced without measured, reviewed justification.
- CI status is not a license to merge: review regression coverage and residual high-risk features.
