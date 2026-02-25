"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSnakeCase = exports.isSyncRedactor = exports.isSimpleRegexpCustomRedactorConfig = void 0;
function isSimpleRegexpCustomRedactorConfig(redactor) {
    return typeof redactor.regexpPattern !== 'undefined';
}
exports.isSimpleRegexpCustomRedactorConfig = isSimpleRegexpCustomRedactorConfig;
function isSyncRedactor(redactor) {
    return typeof redactor.redact === 'function';
}
exports.isSyncRedactor = isSyncRedactor;
function toSnakeCase(str) {
    if (!str) {
        return '';
    }
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toUpperCase();
}
exports.toSnakeCase = toSnakeCase;
//# sourceMappingURL=utils.js.map