"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleRegexpRedactor = void 0;
const utils_1 = require("../utils");
class SimpleRegexpRedactor {
    constructor({ replaceWith = (0, utils_1.toSnakeCase)().toUpperCase(), regexpPattern: regexpMatcher, }) {
        this.replaceWith = replaceWith;
        this.regexpMatcher = regexpMatcher;
    }
    redact(textToRedact) {
        return textToRedact.replace(this.regexpMatcher, this.replaceWith);
    }
}
exports.SimpleRegexpRedactor = SimpleRegexpRedactor;
//# sourceMappingURL=SimpleRegexpRedactor.js.map