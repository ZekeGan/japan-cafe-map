# Changelog

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
