import * as fs from 'fs';
import * as path from 'path';
import { SyncRedactor, AsyncRedactor } from '../src';

/**
 * Lightweight non-Node / browser compatibility smoke checks.
 * Full browser automation is out of scope; this guards against Node-only
 * runtime imports in the published build and exercises the public API.
 */
describe('browser / non-Node compatibility', function () {
  it('should not require Node built-in modules from compiled lib/', function () {
    const libDir = path.join(__dirname, '..', 'lib');
    expect(fs.existsSync(libDir)).toBe(true);

    const nodeBuiltins = [
      'assert',
      'buffer',
      'child_process',
      'cluster',
      'crypto',
      'dgram',
      'dns',
      'fs',
      'http',
      'https',
      'net',
      'os',
      'path',
      'querystring',
      'readline',
      'stream',
      'tls',
      'url',
      'util',
      'vm',
      'zlib',
    ];
    const requireNodeBuiltin = new RegExp(
      String.raw`require\s*\(\s*['"](?:node:)?(?:${nodeBuiltins.join('|')})['"]\s*\)`,
    );

    function collectJsFiles(dir: string): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...collectJsFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          files.push(full);
        }
      }
      return files;
    }

    // Ensure a fresh build is present for CI/local (prepare may have run).
    const jsFiles = collectJsFiles(libDir);
    expect(jsFiles.length).toBeGreaterThan(0);

    for (const file of jsFiles) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).not.toMatch(requireNodeBuiltin);
    }
  });

  it('should redact via SyncRedactor with only language-standard APIs', function () {
    const redactor = new SyncRedactor();
    expect(redactor.redact('Hi David, call 555-555-5555')).toBe('Hi PERSON_NAME, call PHONE_NUMBER');
  });

  it('should redact via AsyncRedactor without Node-specific APIs', async function () {
    const redactor = new AsyncRedactor();
    await expect(redactor.redactAsync('email me at a@b.co')).resolves.toBe('email me at EMAIL_ADDRESS');
  });
});
