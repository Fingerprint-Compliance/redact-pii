import { ISyncRedactor } from '../types';

export class SimpleRegexpRedactor implements ISyncRedactor {
  regexpMatcher: RegExp;
  replaceWith: string;

  constructor({
    replaceWith,
    regexpPattern: regexpMatcher,
  }: {
    /** Required replacement label (e.g. `PHONE_NUMBER`). No empty default. */
    replaceWith: string;
    regexpPattern: RegExp;
  }) {
    this.replaceWith = replaceWith;
    // Clone so each redactor owns its lastIndex / match state (module patterns are shared).
    this.regexpMatcher = new RegExp(regexpMatcher.source, regexpMatcher.flags);
  }

  redact(textToRedact: string) {
    return textToRedact.replace(this.regexpMatcher, this.replaceWith);
  }
}
