# ArtCraft fork — test and coverage baseline

**Measured:** 2026-10-12 (GitHub Actions UTC); **fork:** `Rwanbt/artcraft`.
**Reference `main`:** `d4e4ac69bbd93d237eaf5d0260bc6a5ff3a5e373`.
**First green PR validation SHA:** `1933db3ec0eb9d105f71c2096270315f378bcf05`.
**Evidence:** [GitHub Actions run 38267510528](https://github.com/Rwanbt/artcraft/actions/runs/38267510528) (all six jobs successful).
**Pull request:** [#1 — draft, internal fork only](https://github.com/Rwanbt/artcraft/pull/1).

## Inventory — static inspection, not test-runner counts

Obtained from the recursive Git tree of the reference SHA, excluding directories.

| Inventory item                      | Observed count |
|-------------------------------------|----------------|
| Git tree entries (files + dirs)     | 7,307          |
| Tracked files                       | 5,821          |
| Rust source files (`.rs`)            | 3,261          |
| TypeScript source files (`.ts/.tsx`)| 1,659          |
| `Cargo.toml` files (incl. root)     | 40             |
| TypeScript/JavaScript test files    | 78             |
| Existing workflows on `main`       | 2 (publish only)|

Test-file count = 60 `*.spec.ts(x)`, 17 `*.test.ts(x)`, one `*.test.mjs`.
These are **file counts, not individual test counts, functional coverage, or complete test discovery**. Rust inline unit tests are not captured by filename matching.

## Executed and instrumented baseline (SHA above)

| Scope                  | Recorded result                               |
|------------------------|-----------------------------------------------|
| Rust core Linux        | 14 + 31 + 5 unit tests, 2 doctests passed     |
| Rust core Windows      | PASS (same selected crate test command)       |
| Rust core macOS        | PASS (same selected crate test command)       |
| Rust LLVM coverage     | 36 instrumented core-library tests passed     |
| Frontend Moodboard     | 7 Vitest files, 38 individual tests passed    |
| Unix launcher harness  | 7 Node integration tests passed               |
| Rust coverage artifact | `rust-core-coverage` (LCOV) uploaded          |
| V8 coverage artifact   | `frontend-moodboard-coverage` uploaded        |

### Instrumented coverage — Moodboard only

| Metric      | Measured |
|-------------|----------|
| Statements  | 12.72%   |
| Branches    | 72.40%   |
| Functions   | 40.15%   |
| Lines       | 12.72%   |

Source: Vitest V8 table in the exact-SHA job log. This **does not represent the entire frontend**. LLVM LCOV was produced for `web_base64` and `url_utils`, but the first workflow did not print an overall LLVM percentage; do not invent one. Separate subsequent runs print a summary.

## Unmeasured

- Whole Rust workspace test discovery, crate-by-crate coverage and optional features.
- Desktop UI/E2E, native egui, packaging, app startup and update behavior.
- Browser E2E and complete JavaScript monorepo coverage.
- Cross-platform coverage (the Windows/macOS jobs execute tests, not LLVM instrumentation).
- Threat-model security review, dependency vulnerabilities and mutation testing.

A passing test job establishes only the contract it exercises. A production-ready or 100% whole-repo verdict **cannot** be justified by these first results.
