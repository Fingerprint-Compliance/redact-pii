import { ISyncRedactor } from '../types';
import * as _wellKnownNames from './well-known-names.json';

const greetingRegex = /(^|\.\s+)(dear|hi|hello|greetings|hey|hey there)/gi;
const closingRegex =
  /(thx|thanks|thank you|regards|best|[a-z]+ly|[a-z]+ regards|all the best|happy [a-z]+ing|take care|have a [a-z]+ (weekend|night|day))/gi;

const greetingOrClosingSource = '(((' + greetingRegex.source + ')|(' + closingRegex.source + '\\s*[,.!]*))[\\s-]*)';
const genericNameSource = '( ?(([A-Z][a-z]+)|([A-Z]\\.)))+([,.]|[,.]?$)';
const wellKnownNamesSource = '\\b(\\s*)(\\s*(' + _wellKnownNames.join('|') + '))+\\b';

// Org / team signatures that look like capitalized names after greetings/closings.
const nonPersonNamePattern =
  /\b(Support|Team|Inc|Incorporated|LLC|Ltd|Corp|Corporation|Services|Service|Customer Experience|Help Desk|Helpdesk)\b/i;

function isLikelyPersonName(matchedName: string): boolean {
  return !nonPersonNamePattern.test(matchedName);
}

export class NameRedactor implements ISyncRedactor {
  // Instance-owned regexes so concurrent redactors do not share lastIndex state.
  private greetingOrClosing = new RegExp(greetingOrClosingSource, 'gi');
  private genericName = new RegExp(genericNameSource, 'gm');
  private wellKnownNames = new RegExp(wellKnownNamesSource, 'gim');

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

    textToRedact = textToRedact.replace(this.wellKnownNames, '$1' + this.replaceWith);

    return textToRedact;
  }
}
