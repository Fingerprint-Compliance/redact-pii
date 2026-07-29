"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeChildRedactors = void 0;
const NameRedactor_1 = require("./built-ins/NameRedactor");
const simpleRegexpBuiltIns = require("./built-ins/simple-regexp-patterns");
const SimpleRegexpRedactor_1 = require("./built-ins/SimpleRegexpRedactor");
const utils_1 = require("./utils");
function normalizeCustomRedactorConfig(redactorConfig) {
    return (0, utils_1.isSimpleRegexpCustomRedactorConfig)(redactorConfig)
        ? new SimpleRegexpRedactor_1.SimpleRegexpRedactor({
            regexpPattern: redactorConfig.regexpPattern,
            replaceWith: redactorConfig.replaceWith,
        })
        : redactorConfig;
}
function resolveBuiltInReplaceWith(opts, redactorName, defaultReplaceWith) {
    const builtInConfig = opts.builtInRedactors && opts.builtInRedactors[redactorName];
    return (builtInConfig && builtInConfig.replaceWith) || opts.globalReplaceWith || defaultReplaceWith;
}
function composeChildRedactors(opts = {}) {
    const childRedactors = [];
    if (opts.customRedactors && opts.customRedactors.before) {
        opts.customRedactors.before.map(normalizeCustomRedactorConfig).forEach((redactor) => childRedactors.push(redactor));
    }
    for (const regexpName of Object.keys(simpleRegexpBuiltIns)) {
        if (!opts.builtInRedactors ||
            !opts.builtInRedactors[regexpName] ||
            opts.builtInRedactors[regexpName].enabled !== false) {
            childRedactors.push(new SimpleRegexpRedactor_1.SimpleRegexpRedactor({
                regexpPattern: simpleRegexpBuiltIns[regexpName],
                replaceWith: resolveBuiltInReplaceWith(opts, regexpName, (0, utils_1.toSnakeCase)(regexpName).toUpperCase()),
            }));
        }
    }
    if (!opts.builtInRedactors || !opts.builtInRedactors.names || opts.builtInRedactors.names.enabled !== false) {
        childRedactors.push(new NameRedactor_1.NameRedactor(resolveBuiltInReplaceWith(opts, 'names', 'PERSON_NAME')));
    }
    if (opts.customRedactors && opts.customRedactors.after) {
        opts.customRedactors.after.map(normalizeCustomRedactorConfig).forEach((redactor) => childRedactors.push(redactor));
    }
    return childRedactors;
}
exports.composeChildRedactors = composeChildRedactors;
//# sourceMappingURL=composition.js.map