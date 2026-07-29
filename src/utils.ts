import { SimpleRegexpCustomRedactorConfig, AsyncCustomRedactorConfig, ISyncRedactor, IRedactor } from './types';

export function isSimpleRegexpCustomRedactorConfig(
  redactor: AsyncCustomRedactorConfig,
): redactor is SimpleRegexpCustomRedactorConfig {
  return typeof (redactor as SimpleRegexpCustomRedactorConfig).regexpPattern !== 'undefined';
}

export function isSyncRedactor(redactor: IRedactor): redactor is ISyncRedactor {
  return typeof (redactor as ISyncRedactor).redact === 'function';
}

export function toSnakeCase(str?: string): string {
  if (!str) {
    return '';
  }
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}
