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

/** Replace runs of well-known name tokens (case-insensitive), same as the old alternation regex. */
function redactWellKnownNames(text: string, replaceWith: string): string {
  // Local /g regex so concurrent redacts do not share lastIndex.
  const wordTokenPattern = /[A-Za-z]+/g;
  type Span = { start: number; end: number };
  const spans: Span[] = [];
  let match: RegExpExecArray | null;
  while ((match = wordTokenPattern.exec(text)) !== null) {
    if (!wellKnownNamesSet.has(match[0].toLowerCase())) {
      continue;
    }
    const start = match.index;
    const end = match.index + match[0].length;
    const previous = spans[spans.length - 1];
    // Consecutive well-known names with only whitespace between collapse to one replacement.
    if (previous && /^\s*$/.test(text.slice(previous.end, start))) {
      previous.end = end;
    } else {
      spans.push({ start, end });
    }
  }
  let result = text;
  for (let i = spans.length - 1; i >= 0; i--) {
    const { start, end } = spans[i];
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
