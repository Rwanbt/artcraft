# Residual risks — ArtCraft fork (2026-10-12)

**Status: PARTIALLY VERIFIED. Not production-certified.**

| Priority | Risk / missing evidence                            | Acceptance requirement                                  |
|----------|----------------------------------------------------|---------------------------------------------------------|
| P0       | User project/media data loss or corrupt export      | Real create/edit/save/reopen/export integrity E2E       |
| P0       | Paid external generation/provider flows             | Local HTTP contract stubs, no live chargeable requests  |
| P0       | Secrets/authentication and network disclosures      | Security review + negative-case tests for auth failures |
| P1       | Full Rust workspace and optional features           | Per-crate discovery, runs, and LLVM reports             |
| P1       | Desktop native egui and Tauri user interactions      | Actual process/window smoke and platform-specific E2E   |
| P1       | Frontend feature coverage                            | Fill measured Moodboard line/function coverage gaps     |
| P1       | Browser/editor E2E, keyboard and pointer behavior    | Real app/browser interaction tests                       |
| P1       | CI and dependency security                            | Lint, format, Clippy, audited dependency and build gates|
| P2       | Repeated execution and nondeterministic failures     | Seeded, repeated stress runs; retain failing seeds       |
| P2       | Full Windows/macOS packaging/install/release safety  | Isolated installer and uninstall smoke tests            |
| P2       | `main` is not branch protected                       | User-enabled protection + required PR checks            |

GitHub branch API reported `main.protected=false` at audit start. No branch settings have been changed. The pre-existing two GitHub Actions workflows are release/publish workflows and are not substitutes for PR validation.

## Triage order

1. Confirm every job on exact head SHA; retrieve failed-job logs, never infer success from an earlier run.
2. Map and fix core integrity, request routing, authorization and media-error regressions with deterministic tests.
3. Instrument all Rust crates and all JavaScript packages separately; document modules not executable in CI.
4. Add real GUI/desktop, persistence and export E2E; test low/no connectivity and recovery.
5. Review security, cross-platform packaging, performance, fuzzing and property-based tests.
6. Review independent production-ready evidence before considering any merge to `main`.

No upstream PR is authorized. Never auto-merge or force-push.
