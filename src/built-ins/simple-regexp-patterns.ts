const aptRegex = /(apt|bldg|dept|fl|hngr|lot|pier|rm|ste|slip|trlr|unit|#)\.? *[a-z0-9-]+\b/gi;
const poBoxRegex = /P\.? ?O\.? *Box +\d+/gi;
const roadRegex = /(street|st|road|rd|avenue|ave|drive|dr|loop|court|ct|circle|cir|lane|ln|boulevard|blvd|way)\.?\b/gi;

export const creditCardNumber = /\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}|\d{4}[ -]?\d{6}[ -]?\d{4}\d?/g;
export const streetAddress = new RegExp(
  '(\\d+\\s*(\\w+ ){1,2}' + roadRegex.source + '(\\s+' + aptRegex.source + ')?)|(' + poBoxRegex.source + ')',
  'gi',
);

// 5-digit ZIP only when preceded by a US state code; ZIP+4 anywhere. Avoids bare order IDs.
export const zipcode = /(?<=\b[A-Z]{2}\s+)\d{5}(-\d{4})?\b|\b\d{5}-\d{4}\b/g;

// Structured phones only: exactly 10 continuous digits, or separator-based forms (optional country code).
// Rejects longer digit runs (e.g. UUID tails) and alphanumeric-adjacent tokens.
export const phoneNumber =
  /(?<![A-Za-z0-9])(?:\(?\+?\d{1,2}\)?[-. ]+)?\(?\d{3}\)?[-. ]*\d{3}[-. ]+\d{4}(?![A-Za-z0-9])|(?<![A-Za-z0-9])\d{10}(?!\d)/g;

// IPv4 and common IPv6 forms (full + compressed).
export const ipAddress =
  /(?:\d{1,3}\.){3}\d{1,3}|(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}/gi;

export const usSocialSecurityNumber = /\b\d{3}[ -.]\d{2}[ -.]\d{4}\b/g;

// Require a dotted domain (at least one dot) so values like a@b are not treated as email.
export const emailAddress = /([a-z0-9_\-.+]+)@[\w\-]+(\.[\w\-]+)+/gi;

export const username = /(user( ?name)?|login): \S+/gi;

// Avoid matching prose like "The secret: is out" — require password/pass labels, not bare "secret:".
export const password = /(pass(word|phrase)?|passwd): \S+/gi;

export const credentials = /(login( cred(ential)?s| info(rmation)?)?|cred(ential)?s) ?:\s*\S+\s+\/?\s*\S+/gi;

// Aggressive catch-all for long digit runs. Opt-in via builtInRedactors.digits.enabled = true.
export const digits = /\b\d{4,}\b/g;

export const url = /([^\s":/?#]+):\/\/([^/?#\s"]*)([^?#\s"]*)(\?([^#\s"]*))?(#([^\s"]*))?/g;
