# Feature-to-test traceability — initial prioritized slice

Statuses mean: **VERIFIED** = applicable behavior exercised by the specified green exact-SHA CI; **PARTIAL** = some tested behavior but gaps; **UNVERIFIED** = no directly confirmed relevant automated validation; **BLOCKED** = missing infrastructure.

| ID       | Component/contract                                  | Tests and oracle                                          | CI SHA / result         | State      |
|----------|-----------------------------------------------------|-----------------------------------------------------------|-------------------------|------------|
| M-001    | Base64 data URI bytes, RFC 4648, malformed segments | 5 unit tests; exact byte vectors and rejection assertions| 1933db3e / 3 OS PASS    | VERIFIED   |
| M-002    | URL media extension filtering                       | Existing Rust unit tests; allowed/rejected extensions     | 1933db3e / 3 OS PASS    | PARTIAL    |
| M-003    | MIME inference/mapping                              | Selected Rust crate unit and doc tests                    | 1933db3e / 3 OS PASS    | PARTIAL    |
| UI-001   | Moodboard layout, snapping and persistence          | Vitest V8, 38 tests in 7 files                            | 1933db3e / Linux PASS   | PARTIAL    |
| APP-001  | Unix dev launcher: ports, HMR, shutdown, errors     | Node integration with real Vite and fake Rust process     | 1933db3e / Linux PASS   | VERIFIED*  |
| UI-002   | Full visual editor and canvas interactions          | Native/web application automation not yet run             | No applicable E2E       | UNVERIFIED |
| APP-002  | Tauri desktop startup, native IPC and installer     | Real desktop smoke/E2E and packaging absent in this scope | No applicable E2E       | UNVERIFIED |
| APP-003  | egui native desktop                                | Full desktop automated smoke/UI verification not run      | No applicable E2E       | UNVERIFIED |
| DATA-001 | SQLite generation tasks/migrations/roundtrip        | Offline compile metadata exists; no fresh E2E run        | Not exercised here      | UNVERIFIED |
| API-001  | Provider selection and generation request routing   | Provider clients and router need contract/stub testing    | Not exercised here      | UNVERIFIED |
| API-002  | Failure recovery: 401/403/429/5xx/timeouts          | Contract-driven negative-case matrix not yet complete     | Not exercised here      | UNVERIFIED |
| SEC-001  | Credentials, privacy, outbound disclosures          | Static/dynamic permission review not completed            | Not exercised here      | UNVERIFIED |
| E2E-001  | Create/edit/save/reopen/export media project        | Real GUI/system integration not yet executed              | Not exercised here      | UNVERIFIED |

*APP-001 VERIFIED only for its documented launcher-process contract, not a real Tauri window. This matrix is an **initial priority slice**, not a claim that all 3,261 Rust files and all frontend features have been inventoried. Expand it from source-level APIs and UI interactions before production certification.

## Next expansion criteria

For each module, record source path, user contract, trusted/untrusted inputs, error paths, state transitions, unit tests, integration tests, GUI E2E applicability, LCOV/V8 line + branch metrics, per-platform job and exact commit. Prefer first the data-integrity, media parsing, credential, async task, and provider error boundaries.
