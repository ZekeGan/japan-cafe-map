# Changelog

## 0.1.11 — 2026-11-01

### Documentation

- Rewrite the Traditional Chinese README in more natural wording.

## 0.1.10 — 2026-11-01

### Documentation

- Rewrite README (English default) and add Traditional Chinese (`README.zh-TW.md`) and Japanese (`README.ja.md`) versions with a language switcher, scripts table, and updated feature list.

## 0.1.9 — 2026-11-01

### Refactor

- Split `shopInfo.tsx` (892 lines) into container + `shop/{shopDetail,shopForm,shopParts}.tsx`, and move map hooks to `mapHooks.ts`. No behavior change; UI tests now load the new modules directly.

## 0.1.8 — 2026-11-01

### Tooling

- Add GitHub Actions workflow running `pnpm check` (lint, typecheck, tests); it has not run yet because nothing has been pushed.

## 0.1.7 — 2026-11-01

### Fixed

- `POST /api/cafe/query` now returns 400 for entries that are not objects with a string `id` instead of failing with 500.

### Tests

- Add cafe query validation/upsert tests and a `todo` test documenting the M04 concurrent-favorite duplicate (needs a unique constraint).

## 0.1.6 — 2026-11-01

### Tooling

- Install prettier locally; replace the project-wide `pnpm prettier` with file-scoped `format` / `format:check`.
- Declare `packageManager` (pnpm 10.33.3) and `engines.node` (>=20.9.0).
- Remove 48 unused-import lint warnings introduced by the test split.

## 0.1.5 — 2026-11-01

### Tooling

- Add project `.claude/settings.json` denying reads of lockfile, build output, images, and archived docs to save AI context; tell agents to read docs by section.

## 0.1.4 — 2026-11-01

### Tests

- Split `maintenance.test.mjs` into `api`, `auth`, `infra`, and `ui` test files with shared `helpers.mjs`; no behavior change (21 tests).

## 0.1.3 — 2026-11-01

### Documentation

- Archive the one-off test record and historical plan under `docs/archive/`; condense project-status to open issues only.


## 0.1.2 — 2026-11-01

### Changed

- Add `typecheck`, `test`, and `check` scripts; update maintenance docs to use them.

## 0.1.1 — 2026-10-30

### Fixed

- Verify session identity in favorite and report APIs; validate report input and reject duplicate reports with HTTP 409.
- Enforce password rules in the reset API and return cafe IDs needed to recognize existing reports.
- Correct time-limit labels, icons, and the no-time-limit map filter.
- Render pages dynamically so a database outage during build cannot bake the unavailable screen into the site; remove nested document markup from the fallback.
- Handle Resend provider errors instead of reporting successful delivery.
- Protect the actual favorite route and reject invalid or expired page sessions.
- Retain failed report input, show translated errors, refresh cafe/member data on success, and prevent repeated submission while pending.

### Documentation and verification

- Add project navigation, architecture, maintenance instructions, issue tracking, and test evidence.
- Correct README setup requirements, environment variables, data flow, and verification commands.
- Add 21 focused regression tests without additional dependencies.
- Verify database-offline builds, recovery using the same build, protected routes, and an explicitly authorized delivery test.

No dependency upgrades or database schema changes are included. The default Resend sender still requires a verified domain to email general visitors. Full refactoring, performance architecture changes, and comprehensive test/CI coverage remain deferred.
