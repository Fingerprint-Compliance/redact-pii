# Changelog

All notable changes to this project from 3.x.x onward will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.0.0] - Unreleased

### Breaking changes

- **Compiled `lib/` is no longer committed to git.**  
  Since 4.0.0 the built JavaScript output lived in the repository so the package could be consumed from git without a build step. That made every TypeScript or source change require a matching `lib/` commit and was easy to get out of sync.

  **What this means for you:**

  | Install method | Action required |
  |----------------|-----------------|
  | `npm install redact-pii` (npm registry) | None. The published package still ships prebuilt `lib/` (built on publish). |
  | Install from git / GitHub | Run a normal `npm install` in this repo (or of the git dependency). The `prepare` script builds `lib/`. You need a Node.js environment with the package’s devDependencies available (TypeScript, etc.). |
  | Local clone / development | Run `npm install` (builds via `prepare`) or `npm run build` after pulling. Do not commit `lib/`. |

- Package version is **5.0.0** to reflect the packaging / install-from-git break. Class names, option shapes, and the built-in redactor surface are otherwise the same; see **Fixed** / **Changed** for behavior hardenings in this release (e.g. non-string input, `replaceWith`, redactor order, and false-positive pattern tweaks).

### Changed

- `lib/` is listed in `.gitignore`.
- `package.json` includes `"files": ["lib"]` so npm publishes only the build output (plus package metadata).
- `prepare` runs `npm run build` so git installs and local installs produce `lib/` automatically.
- `prepublishOnly` runs `verify_all` (typecheck, tests, prettier); the build runs via `prepare` before pack/publish.
- **Reduce false positives in built-in patterns** ([#4](https://github.com/Fingerprint-Compliance/redact-pii/issues/4)):
  - `digits` is **opt-in** (`builtInRedactors.digits.enabled: true`); previously it redacted any 4+ digit run by default
  - `zipcode` requires a US state code before 5-digit ZIP, or ZIP+4 form (avoids order/invoice IDs)
  - `phoneNumber` requires structured phone shapes and avoids UUID / hex-adjacent matches
  - `emailAddress` requires a dotted domain (no longer matches `a@b`)
  - `password` no longer treats bare `secret:` labels as passwords (still matches `password:` / `pass:` / `passphrase:`)
  - `ipAddress` recognizes common full and compressed IPv6 forms more consistently
  - `names` skips org-style signatures after greetings/closings (e.g. `Google Support`, `Acme Support`)
- README documents remaining heuristic limitations
- Declare `engines.node` as `>=20` and run CI on Node 20 / 22 / 24 ([#15](https://github.com/Fingerprint-Compliance/redact-pii/issues/15))
- Well-known first-name matching uses a `Set` + token scan instead of one giant alternation regex ([#16](https://github.com/Fingerprint-Compliance/redact-pii/issues/16))
- `package.json` includes a modern `exports` map (CJS + types; no dual ESM build) ([#16](https://github.com/Fingerprint-Compliance/redact-pii/issues/16))

### Fixed

- Distinct redactor instances no longer share mutable `RegExp` match state ([#5](https://github.com/Fingerprint-Compliance/redact-pii/issues/5))
- `redact` / `redactAsync` throw a clear `TypeError` for non-string input ([#6](https://github.com/Fingerprint-Compliance/redact-pii/issues/6))
- `SimpleRegexpRedactor` requires an explicit `replaceWith` (no empty default); drop redundant `.toUpperCase()` after `toSnakeCase` ([#7](https://github.com/Fingerprint-Compliance/redact-pii/issues/7))
- Built-in regexp redactors use an explicit application order instead of `Object.keys` export order ([#8](https://github.com/Fingerprint-Compliance/redact-pii/issues/8))

### Security

- Pin transitive `brace-expansion` / `minimatch` via npm `overrides` so `npm audit` is clean for the current dev tree ([#14](https://github.com/Fingerprint-Compliance/redact-pii/issues/14))

### Tests

- Added regression coverage for high-impact false positives
- Housekeeping ([#16](https://github.com/Fingerprint-Compliance/redact-pii/issues/16)): drop unused `TestCase.only`; replace flaky 100ms “speedy” tests with behavior assertions; add browser/non-Node lib smoke checks

## [4.1.0] - 2026-02-25

### Changed

- Remove lodash in favour of a custom `toSnakeCase` helper
- Add Dependabot configuration
- Update GitHub Actions workflow

## [4.0.3] - 2026-02-24

### Security

- Run `npm audit fix` to update dependencies and address security vulnerabilities

## [4.0.2] - 2022-08-01

### Changed

- Dependency and lockfile maintenance after the 4.0 packaging line

## [4.0.1] - 2022-01-04

### Changed

- Upgrade `package-lock.json` to a newer npm lockfile format

## [4.0.0] - 2021-09-09

### Breaking changes

- Remove `@google-cloud/dlp` dependency and built-in Google DLP redactor

### Changed

- Add compiled `lib/` directory to git so the library can be consumed from source in compiled form
- Improve regex pattern including dashes in email domain addresses
- Improve URL regex in href links

## [3.4.0] - 2022-07-29

- npm package updates including @google-cloud/dlp

## [3.3.0] - 2022-06-27

- Updating dependent libraries to latest

## [3.2.3] - 2019-09-12

- Downgrade @google-cloud/dlp to avoid memory leak in recent versions

## [3.2.2] - 2019-08-12

- Fix bug in Google DLP Redactor with tokens overlapping and repeating
- Update dependencies to get security fixes

## [3.2.1] - 2019-06-20

- Tweak the built-in US SSN regex to work better on large input by removing the optional delimiters (the digits regex will already cover this situation)

## [3.2.0] - 2019-05-21

- Add enhancement to automatically split Google DLP input that is too large into smaller batches. This can be disabled with the `disableAutoBatchWhenContentSizeExceedsLimit` option.

## [3.1.0] - 2019-05-04

- BREAKING: rename `replacementValue` param of built-in redaction config to `replaceWith` for consistency

## [3.0.2] - 2019-05-04

- fix parameter typo in docs (`enable` -> `enabled`)
- fix `TypeError` when attempting to disable built-in redactors

## [3.0.1] - 2019-04-29

- Fix `Cannot find module './well-known-names.json'` error by making sure the file gets properly packaged

## [3.0.0] - 2019-04-21

- This version is an almost complete rewrite from prior versions and **breaks** the prior API contract. In summary the changes are:
- Library is now written in TypeScript
- Introduces separate API for sync and async redaction via separate `SyncRedactor` and `AsyncRedactor` classes and separate `.redact` and `.redactAsync` methods.
- **Important Breaking Change:** The `redact` and `redactAsync` methods now always expect a `string`. Passing anything else causes undefined behaviour and _may_ cause an exception. Prior versions of the library used to simply return the original value "untouched" if it wasn't a `string`.
- Google Cloud DLP redaction is now a separate redaction class that has to be explicitly imported and instantiated (`new GoogleDLPRedactor()`)
  in order to use it.
- Google Cloud DLP redaction does not have an implicit, hard-coded 5000ms timeout anymore. If you want to set a timeout for DLP calls you have to implement it yourself. In case you're using `bluebird` as promise library consider using `.timeout`.

[5.0.0]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v4.0.3...v4.1.0
[4.0.3]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v4.0.2...v4.0.3
[4.0.2]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v3.1.0...v4.0.0
[3.1.0]: https://github.com/Fingerprint-Compliance/redact-pii/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/Fingerprint-Compliance/redact-pii/releases/tag/v3.0.0
