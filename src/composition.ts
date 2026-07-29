import { NameRedactor } from './built-ins/NameRedactor';
import * as simpleRegexpBuiltIns from './built-ins/simple-regexp-patterns';
import { SimpleRegexpRedactor } from './built-ins/SimpleRegexpRedactor';
import {
  AsyncCustomRedactorConfig,
  IAsyncRedactor,
  CompositeRedactorOptions,
  SyncCustomRedactorConfig,
  ISyncRedactor,
} from './types';
import { isSimpleRegexpCustomRedactorConfig, toSnakeCase } from './utils';

function normalizeCustomRedactorConfig(redactorConfig: any) {
  return isSimpleRegexpCustomRedactorConfig(redactorConfig)
    ? new SimpleRegexpRedactor({
        regexpPattern: redactorConfig.regexpPattern,
        replaceWith: redactorConfig.replaceWith,
      })
    : redactorConfig;
}

function resolveBuiltInReplaceWith(
  opts: CompositeRedactorOptions<any>,
  redactorName: string,
  defaultReplaceWith: string,
): string {
  const builtInConfig = opts.builtInRedactors && (opts.builtInRedactors as any)[redactorName];
  return (builtInConfig && builtInConfig.replaceWith) || opts.globalReplaceWith || defaultReplaceWith;
}

export function composeChildRedactors<T extends AsyncCustomRedactorConfig>(opts: CompositeRedactorOptions<T> = {}) {
  const childRedactors: T extends SyncCustomRedactorConfig
    ? Array<ISyncRedactor>
    : Array<IAsyncRedactor | ISyncRedactor> = [] as any;

  if (opts.customRedactors && opts.customRedactors.before) {
    opts.customRedactors.before.map(normalizeCustomRedactorConfig).forEach((redactor) => childRedactors.push(redactor));
  }

  for (const regexpName of Object.keys(simpleRegexpBuiltIns)) {
    if (
      !opts.builtInRedactors ||
      !(opts.builtInRedactors as any)[regexpName] ||
      (opts.builtInRedactors as any)[regexpName].enabled !== false
    ) {
      childRedactors.push(
        new SimpleRegexpRedactor({
          regexpPattern: (simpleRegexpBuiltIns as any)[regexpName],
          replaceWith: resolveBuiltInReplaceWith(opts, regexpName, toSnakeCase(regexpName).toUpperCase()),
        }),
      );
    }
  }

  if (!opts.builtInRedactors || !opts.builtInRedactors.names || opts.builtInRedactors.names.enabled !== false) {
    childRedactors.push(new NameRedactor(resolveBuiltInReplaceWith(opts, 'names', 'PERSON_NAME')));
  }

  if (opts.customRedactors && opts.customRedactors.after) {
    opts.customRedactors.after.map(normalizeCustomRedactorConfig).forEach((redactor) => childRedactors.push(redactor));
  }
  return childRedactors;
}
