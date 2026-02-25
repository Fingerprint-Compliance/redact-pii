import { ISyncRedactor } from '../types';
import { toSnakeCase } from '../utils';

export class SimpleRegexpRedactor implements ISyncRedactor {
  regexpMatcher: RegExp;
  replaceWith: string;

  constructor({
    replaceWith = toSnakeCase().toUpperCase(),
    regexpPattern: regexpMatcher,
  }: {
    replaceWith: string;
    regexpPattern: RegExp;
  }) {
    this.replaceWith = replaceWith;
    this.regexpMatcher = regexpMatcher;
  }

  redact(textToRedact: string) {
    return textToRedact.replace(this.regexpMatcher, this.replaceWith);
  }
}
