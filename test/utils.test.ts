import { toSnakeCase } from '../src/utils';
import { snakeCase } from 'lodash';

describe('utils.ts', function () {
  it('toSnakeCase should convert to snake case', function () {
    expect(toSnakeCase('camelCase')).toBe('CAMEL_CASE');
    expect(toSnakeCase('PascalCase')).toBe('PASCAL_CASE');
    expect(toSnakeCase('kebab-case')).toBe('KEBAB_CASE');
    expect(toSnakeCase('snake_case')).toBe('SNAKE_CASE');
    expect(toSnakeCase('')).toBe('');
    expect(toSnakeCase(undefined)).toBe('');
  });
});
