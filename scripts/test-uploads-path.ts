import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { resolveUploadPath, UPLOADS_ROOT, UPLOADS_PREFIX } from '../src/lib/uploads-path';

/**
 * Verification tests for resolveUploadPath.
 *
 * Covers:
 * 1. Valid file path (single segment).
 * 2. Valid nested file path (multiple segments).
 * 3. Literal traversal with '..'.
 * 4. URL-encoded traversal (%2e%2e / %2f).
 * 5. Sibling-prefix bypass attempt ('uploads-evil' style).
 * 6. Null byte injection.
 * 7. Empty segment.
 * 8. Absolute path injection.
 * 9. Root-only request.
 * 10. Windows backslash traversal.
 */

test('1. valid single-segment file resolves inside uploads root', () => {
  const result = resolveUploadPath(['1787926107896-page_1.webp']);
  assert.ok(result, 'valid file should resolve');
  assert.ok(result!.startsWith(UPLOADS_PREFIX), 'must start with uploads root + sep');
  assert.strictEqual(result, path.resolve(UPLOADS_ROOT, '1787926107896-page_1.webp'));
});

test('2. valid nested file (subdirectory) resolves inside uploads root', () => {
  const result = resolveUploadPath(['projects', '1', '1787334529641-auji6b.webp']);
  assert.ok(result, 'nested valid file should resolve');
  assert.ok(result!.startsWith(UPLOADS_PREFIX));
  assert.strictEqual(result, path.resolve(UPLOADS_ROOT, 'projects', '1', '1787334529641-auji6b.webp'));
});

test('3. literal traversal with .. is rejected (null)', () => {
  // GET /api/uploads/../../.env  -> params.path = ['..','..','.env']
  assert.strictEqual(resolveUploadPath(['..']), null);
  assert.strictEqual(resolveUploadPath(['..', '..']), null);
  assert.strictEqual(resolveUploadPath(['..', '..', '.env']), null);
  assert.strictEqual(resolveUploadPath(['..', '..', 'package.json']), null);
  assert.strictEqual(resolveUploadPath(['..', '..', 'prisma', 'dev.db']), null);
});

test('4. URL-encoded traversal is rejected', () => {
  // %2e%2e decodes to '..' — must be rejected
  assert.strictEqual(resolveUploadPath(['%2e%2e']), null);
  assert.strictEqual(resolveUploadPath(['%2e%2e', '%2e%2e', '.env']), null);
  // %2f decodes to '/' — segment containing separator must be rejected
  assert.strictEqual(resolveUploadPath(['..%2f..%2f.env']), null);
  assert.strictEqual(resolveUploadPath(['%2e%2e%2f%2e%2e']), null);
  // mixed encoding
  assert.strictEqual(resolveUploadPath(['%2E', '%2E', '.env']), null);
});

test('5. sibling-prefix bypass (uploads-evil) is rejected', () => {
  // A naive startsWith('.../public/uploads') would match 'uploads-evil'.
  // Our check uses UPLOADS_PREFIX (root + path.sep) so this must be rejected.
  // Simulate a segment that would produce a sibling path if not properly
  // guarded: path.resolve(root, '../uploads-evil/x') -> outside root.
  assert.strictEqual(resolveUploadPath(['..', 'uploads-evil', 'secret.txt']), null);
  // Even if attacker tries absolute path to a sibling:
  assert.strictEqual(resolveUploadPath(['/../uploads-evil', 'secret.txt']), null);
});

test('6. null byte injection is rejected', () => {
  assert.strictEqual(resolveUploadPath(['file\0.txt']), null);
  assert.strictEqual(resolveUploadPath(['\0']), null);
  assert.strictEqual(resolveUploadPath(['safe\0../../../etc/passwd']), null);
});

test('7. empty segment is rejected', () => {
  assert.strictEqual(resolveUploadPath(['']), null);
  assert.strictEqual(resolveUploadPath(['file', '']), null);
  assert.strictEqual(resolveUploadPath(['', 'file']), null);
  assert.strictEqual(resolveUploadPath([]), path.resolve(UPLOADS_ROOT));
});

test('8. absolute path injection is rejected', () => {
  // POSIX absolute
  assert.strictEqual(resolveUploadPath(['/etc/passwd']), null);
  assert.strictEqual(resolveUploadPath(['/', 'etc', 'passwd']), null);
  // Windows drive letter
  assert.strictEqual(resolveUploadPath(['C:foo']), null);
  assert.strictEqual(resolveUploadPath(['c:\\windows\\win.ini']), null);
  assert.strictEqual(resolveUploadPath(['D:', 'secret']), null);
});

test('9. root-only request resolves to uploads root', () => {
  // Empty array -> resolves to root itself, which is allowed.
  const result = resolveUploadPath([]);
  assert.strictEqual(result, UPLOADS_ROOT);
});

test('10. Windows-style backslash traversal is rejected', () => {
  // Segments containing backslash after decode are rejected.
  assert.strictEqual(resolveUploadPath(['..\\..\\.env']), null);
  assert.strictEqual(resolveUploadPath(['..', '..\\..\\.env']), null);
});

test('11. dot segment is rejected', () => {
  assert.strictEqual(resolveUploadPath(['.']), null);
  assert.strictEqual(resolveUploadPath(['.', 'file']), null);
  assert.strictEqual(resolveUploadPath(['file', '.']), null);
});

test('12. non-string segment is rejected', () => {
  // Route handlers should only produce strings, but defensive coding.
  assert.strictEqual(resolveUploadPath([null as unknown as string]), null);
  assert.strictEqual(resolveUploadPath([undefined as unknown as string]), null);
  assert.strictEqual(resolveUploadPath([123 as unknown as string]), null);
});

test('13. valid file with unicode/space name resolves', () => {
  const result = resolveUploadPath(['my brochure file-é.webp']);
  assert.ok(result, 'valid unicode/space filename should resolve');
  assert.ok(result!.startsWith(UPLOADS_PREFIX));
});

/**
 * 14-15: Directory-access regression (EISDIR guard).
 *
 * Before the fix, requesting the uploads root (GET /api/uploads/) or any
 * subdirectory would cause fs.readFileSync to throw EISDIR, surfacing as a
 * 500 response. resolveUploadPath itself still resolves these paths (so the
 * route can convert them to 404); the route layer's fs.statSync().isFile()
 * check is responsible for the 404. These tests document that contract.
 */
test('14. root directory request resolves (route layer must guard EISDIR)', () => {
  const result = resolveUploadPath([]);
  assert.strictEqual(result, UPLOADS_ROOT);
});

test('15. subdirectory request resolves (route layer must guard EISDIR)', () => {
  const result = resolveUploadPath(['projects']);
  assert.ok(result, 'subdirectory path should resolve (route handles 404)');
  assert.strictEqual(result, path.resolve(UPLOADS_ROOT, 'projects'));
});
