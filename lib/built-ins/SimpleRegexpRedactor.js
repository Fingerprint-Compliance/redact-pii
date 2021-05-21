"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleRegexpRedactor = void 0;
// import { snakeCase } from 'lodash';
class SimpleRegexpRedactor {
    constructor({ replaceWith, regexpPattern: regexpMatcher }) {
        this.replaceWith = replaceWith;
        this.regexpMatcher = regexpMatcher;
    }
    redact(textToRedact) {
        return textToRedact.replace(this.regexpMatcher, this.replaceWith);
    }
}
exports.SimpleRegexpRedactor = SimpleRegexpRedactor;
//# sourceMappingURL=SimpleRegexpRedactor.js.map