# redact-pii

[![GitHub release](https://img.shields.io/github/v/release/Fingerprint-Compliance/redact-pii)](https://github.com/Fingerprint-Compliance/redact-pii/releases)

> **NOTE**: From **5.0.0** this fork is distributed as a **GitHub tag / release only** (not published to the public npm `redact-pii` package). Check the [Changelog](CHANGELOG.md) before upgrading — `lib/` is no longer committed to git, Node 20+ is required, and several default redaction behaviors are stricter.

Remove personally identifiable information from text.

### Prerequisites

This library is primarily written for Node.js but it should work in the browser as well.
It is written in TypeScript and compiles to ES2016. Supported Node.js versions are **20 and newer** (see the `engines` field in `package.json`). CI runs on Node 20, 22, and 24.

### Install (from GitHub)

```
npm install github:Fingerprint-Compliance/redact-pii#v5.0.0
```

`npm install` runs the `prepare` script, which builds `lib/` (TypeScript and other devDependencies must be installable). For a local clone, run `npm install` or `npm run build` after pulling; do not commit `lib/`.

### Simple example (synchronous API)

```js
const { SyncRedactor } = require('redact-pii');
const redactor = new SyncRedactor();
const redactedText = redactor.redact('Hi David Johnson, Please give me a call at 555-555-5555');
// Hi NAME, Please give me a call at PHONE_NUMBER
console.log(redactedText);
```

`redact` and `redactAsync` always expect a `string`. Passing any other type throws a `TypeError`.

### Simple example (asynchronous / promise-based API)

```js
const { AsyncRedactor } = require('redact-pii');
const redactor = new AsyncRedactor();
redactor.redactAsync('Hi David Johnson, Please give me a call at 555-555-5555').then(redactedText => {
  // Hi NAME, Please give me a call at PHONE_NUMBER
  console.log(redactedText);
});
```

## Supported Features

- sync and async API variants
- ability to customize what to use as replacement value for detected patterns
- built in regex based redaction rules for:
  - credentials
  - creditCardNumber
  - emailAddress
  - ipAddress
  - names
  - password
  - phoneNumber
  - streetAddress
  - username
  - usSocialSecurityNumber
  - zipcode
  - url
  - digits (**opt-in** — see below; aggressive catch-all for long digit runs)
  - > **NOTE**: the built-in redaction rules are mostly applicable for identifying (US-)english PII.
    > Consider custom patterns (or an external service such as [Google Cloud DLP](https://cloud.google.com/dlp/) wired as a custom async redactor) if you have non-english PII to redact.
- ability to add custom redaction regex patterns and complete custom redaction functions (both sync and async)

## Advanced usage and features

### Customize replacement values

```js
const { SyncRedactor } = require('redact-pii');

// use a single replacement value for all built-in patterns found.
const redactor = new SyncRedactor({ globalReplaceWith: 'TOP_SECRET' });
redactor.redact('Dear David Johnson, I live at 42 Wallaby Way');
// Dear TOP_SECRET, I live at TOP_SECRET

// use a custom replacement value for a specific built-in pattern
const redactor = new SyncRedactor({
  builtInRedactors: {
    names: {
      replaceWith: 'ANONYMOUS_PERSON'
    }
  }
});

redactor.redact('Dear David Johnson');
// Dear ANONYMOUS_PERSON
```

### Add custom patterns or redaction functions

Note that the order of redaction rules matters, therefore you have to decide whether you want your custom redaction rules to run `before` or `after` the built-in ones. Generally it's better to put very specialized patterns or functions `before` the built-in ones and more broad / general ones `after`.

```js
const { SyncRedactor } = require('redact-pii');

// add a custom regexp pattern
const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        regexpPattern: /\b(cat|dog|cow)s?\b/gi,
        replaceWith: 'ANIMAL'
      }
    ]
  }
});

redactor.redact('I love cats, dogs, and cows');
// I love ANIMAL, ANIMAL, and ANIMAL

// add a synchronous custom redaction function
const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        redact(textToRedact) {
          return textToRedact.includes('TopSecret')
            ? 'THIS_FILE_IS_SO_TOP_SECRET_WE_HAD_TO_REDACT_EVERYTHING'
            : textToRedact;
        }
      }
    ]
  }
});

redactor.redact('This document is classified as TopSecret.')
// THIS_FILE_IS_SO_TOP_SECRET_WE_HAD_TO_REDACT_EVERYTHING


import { AsyncRedactor } from './src/index';

// add an asynchronous custom redaction function
const redactor = new AsyncRedactor({
  customRedactors: {
    before: [
      {
        redactAsync(textToRedact) {
          return myCustomRESTApiServer.redactCustomWords(textToRedact);
        }
      }
    ]
  }
});
```

### Disable specific built-in redaction rules

```js
const redactor = new SyncRedactor({
  builtInRedactors: {
    names: {
      enabled: false
    },
    emailAddress: {
      enabled: false
    }
  }
});
```

### Enable the opt-in `digits` redactor

The `digits` rule matches any run of 4+ digits (`\b\d{4,}\b`). That is useful as a last-resort catch-all but produces many false positives (years, ports, order IDs, partial account tokens). It is **disabled by default** and must be turned on explicitly:

```js
const redactor = new SyncRedactor({
  builtInRedactors: {
    digits: {
      enabled: true
    }
  }
});
redactor.redact('codeB: 6789');
// codeB: DIGITS
```

### Using an external service as a custom redactor

`GoogleDLPRedactor` was removed in 4.0.0 (along with the `@google-cloud/dlp` dependency). You can still use [Google Cloud DLP](https://cloud.google.com/dlp/) or any other service by implementing a custom async redactor with `redactAsync` and passing it to `AsyncRedactor` via `customRedactors` (see examples above). Use the official [`@google-cloud/dlp`](https://www.npmjs.com/package/@google-cloud/dlp) client (or another provider) directly in your own redactor.

### Limitations and known heuristics

These defaults aim to reduce false positives while still catching common US-English PII. They are **heuristics**, not a compliance guarantee:

| Rule | Behavior / limitation |
|------|------------------------|
| **names** | Greeting/closing + capitalized words, plus a well-known first-name list. Company signatures like `Google Support` are skipped; many real names and non-English names will be missed or still mis-detected. |
| **zipcode** | 5-digit ZIP only when preceded by a US state code (`NY 10002`), or ZIP+4 (`10002-1234`). Bare `90210` / order IDs are not redacted. |
| **phoneNumber** | Structured 10-digit (optional country code) forms. Vanity / alphanumeric numbers are not supported. Adjacent alphanumerics (e.g. UUID fragments) are not matched. |
| **emailAddress** | Requires a dotted domain (`user@host.tld`). Values like `a@b` are ignored. |
| **password** / **username** | Label-based (`password:`, `pass:`, `user:`, …). Bare prose such as `The secret: is out` is not treated as a password. |
| **creditCardNumber** | Pattern-based (16-digit / Amex / Diners shapes). No Luhn check — some non-PAN digit groups may still match. |
| **ipAddress** | IPv4 and common IPv6 shapes; not a full IPv6 grammar. |
| **digits** | Opt-in only (see above). |
| **Locale** | Built-ins target US-English patterns; non-Latin scripts and international IDs need custom redactors. |

### Contributing

#### Run tests

You can run the tests via `npm test`.
