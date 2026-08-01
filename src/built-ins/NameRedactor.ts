import { ISyncRedactor } from '../types';
import * as _wellKnownNames from './well-known-names.json';

const greetingRegex = /(^|\.\s+)(dear|hi|hello|greetings|hey|hey there)/gi;
const closingRegex =
  /(thx|thanks|thank you|regards|best|[a-z]+ly|[a-z]+ regards|all the best|happy [a-z]+ing|take care|have a [a-z]+ (weekend|night|day))/gi;

const greetingOrClosingSource = '(((' + greetingRegex.source + ')|(' + closingRegex.source + '\\s*[,.!]*))[\\s-]*)';
const genericNameSource = '( ?(([A-Z][a-z]+)|([A-Z]\\.)))+([,.]|[,.]?$)';

// Lookup set instead of one giant alternation regex (~11k names / ~86k chars).
const wellKnownNamesSet: Set<string> = new Set((_wellKnownNames as string[]).map((name) => name.toLowerCase()));

// Org / team signatures that look like capitalized names after greetings/closings.
const nonPersonNamePattern =
  /\b(Support|Team|Inc|Incorporated|LLC|Ltd|Corp|Corporation|Services|Service|Customer Experience|Help Desk|Helpdesk)\b/i;

function isLikelyPersonName(matchedName: string): boolean {
  return !nonPersonNamePattern.test(matchedName);
}

/** JS `\w` / word-boundary class used by the historical alternation regex. */
function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && /[A-Za-z0-9_]/.test(ch);
}

/** True when a `\b` exists between `index - 1` and `index` (or at the string edges). */
function isWordBoundaryAt(text: string, index: number): boolean {
  const leftWord = index > 0 && isWordChar(text[index - 1]);
  const rightWord = index < text.length && isWordChar(text[index]);
  return leftWord !== rightWord;
}

/**
 * Longest well-known name prefix at `start` (letters only, case-insensitive).
 * Returns length in characters, or 0 if none.
 */
function longestKnownNameLength(text: string, start: number): number {
  let maxEnd = start;
  while (maxEnd < text.length && /[A-Za-z]/.test(text[maxEnd])) {
    maxEnd++;
  }
  for (let len = maxEnd - start; len >= 1; len--) {
    if (wellKnownNamesSet.has(text.slice(start, start + len).toLowerCase())) {
      return len;
    }
  }
  return 0;
}

/**
 * Match the historical pattern `\b(name(\s*name)*)\b` using the Set:
 * - start only on a letter at a JS word boundary (preserve surrounding spaces;
 *   avoids swallowing ` user_john` / identifier glue)
 * - allow consecutive names with optional whitespace, including none (`davidjohn`)
 * Returns exclusive end index, or -1 if no match at `start`.
 */
function matchWellKnownNameRun(text: string, start: number): number {
  if (!/[A-Za-z]/.test(text[start] || '') || !isWordBoundaryAt(text, start)) {
    return -1;
  }

  let pos = start;
  let namesMatched = 0;

  while (pos < text.length) {
    let p = pos;
    if (namesMatched > 0) {
      // Between names: optional whitespace only (including none).
      while (p < text.length && /\s/.test(text[p])) {
        p++;
      }
    }
    if (p >= text.length || !/[A-Za-z]/.test(text[p])) {
      break;
    }

    const nameLen = longestKnownNameLength(text, p);
    if (nameLen === 0) {
      break;
    }
    pos = p + nameLen;
    namesMatched++;
  }

  if (namesMatched === 0) {
    return -1;
  }
  if (!isWordBoundaryAt(text, pos)) {
    return -1;
  }
  return pos;
}

/**
 * Replace runs of well-known names (case-insensitive) with the same `\b` semantics
 * as the old alternation regex, without compiling an ~86k-character pattern.
 */
function redactWellKnownNames(text: string, replaceWith: string): string {
  type Span = { start: number; end: number };
  const spans: Span[] = [];
  let i = 0;
  while (i < text.length) {
    const end = matchWellKnownNameRun(text, i);
    if (end > i) {
      spans.push({ start: i, end });
      i = end;
      continue;
    }
    i++;
  }

  let result = text;
  for (let s = spans.length - 1; s >= 0; s--) {
    const { start, end } = spans[s];
    result = result.slice(0, start) + replaceWith + result.slice(end);
  }
  return result;
}

export class NameRedactor implements ISyncRedactor {
  // Instance-owned regexes so concurrent redactors do not share lastIndex state.
  private greetingOrClosing = new RegExp(greetingOrClosingSource, 'gi');
  private genericName = new RegExp(genericNameSource, 'gm');

  constructor(private replaceWith = 'PERSON_NAME') {}

  redact(textToRedact: string) {
    const greetingOrClosing = this.greetingOrClosing;
    const genericName = this.genericName;
    greetingOrClosing.lastIndex = 0;
    genericName.lastIndex = 0;
    let greetingOrClosingMatch = greetingOrClosing.exec(textToRedact);
    while (greetingOrClosingMatch !== null) {
      genericName.lastIndex = greetingOrClosing.lastIndex;
      let genericNameMatch = genericName.exec(textToRedact);
      if (
        genericNameMatch !== null &&
        genericNameMatch.index === greetingOrClosing.lastIndex &&
        isLikelyPersonName(genericNameMatch[0])
      ) {
        let suffix = genericNameMatch[5] === null ? '' : genericNameMatch[5];
        textToRedact =
          textToRedact.slice(0, genericNameMatch.index) +
          this.replaceWith +
          suffix +
          textToRedact.slice(genericNameMatch.index + genericNameMatch[0].length);
      }
      greetingOrClosingMatch = greetingOrClosing.exec(textToRedact);
    }

    return redactWellKnownNames(textToRedact, this.replaceWith);
  }
}
