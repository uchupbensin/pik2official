import path from 'path';

/**
 * Resolved root directory for uploads. Uses path.resolve to normalize any
 * symlinks/relative components in process.cwd() so that the containment check
 * below is reliable.
 */
export const UPLOADS_ROOT = path.resolve(process.cwd(), 'public', 'uploads');
export const UPLOADS_PREFIX = UPLOADS_ROOT + path.sep;

/**
 * Validates and resolves a list of path segments against the uploads root.
 * Returns the resolved file path if it stays within UPLOADS_ROOT, otherwise
 * null.
 *
 * Defenses:
 * - Reject null bytes (NUL injection).
 * - Reject absolute paths (POSIX and Windows drive letters).
 * - Reject traversal segments ('.', '..') and empty segments.
 * - Reject Windows-style backslash traversal.
 * - Reject segments containing a path separator after decoding, which covers
 *   URL-encoded slashes (%2F) that could collapse into a single segment.
 * - Use path.resolve + startsWith to guarantee containment.
 */
export function resolveUploadPath(segments: string[] | string): string | null {
  // Normalize to a plain array of strings.
  const parts = Array.isArray(segments) ? segments : [segments];

  for (const raw of parts) {
    if (typeof raw !== 'string') return null;

    const seg = raw;

    // Reject null bytes: attackers use these to truncate paths on some stacks.
    if (seg.indexOf('\0') !== -1) return null;

    // Reject empty segments: path.join collapses them, which can hide traversal.
    if (seg.length === 0) return null;

    // Decode URL-encoded characters to catch encoded traversal like %2e%2e or
    // %2F. Malformed encoding falls back to the raw segment; subsequent checks
    // still catch literal traversal.
    let decoded = seg;
    try {
      decoded = decodeURIComponent(seg);
    } catch {
      // keep raw segment
    }

    // Reject Windows drive letters (e.g. 'C:foo') and UNC-like absolute paths.
    if (/^[a-zA-Z]:/.test(decoded)) return null;

    // Reject any segment equal to '.' or '..' (literal or decoded).
    if (decoded === '.' || decoded === '..') return null;

    // Reject segments that contain a path separator after decoding. This
    // catches values like '..%2F..' that decode to '../' and would otherwise
    // be joined as a single segment containing a separator.
    if (decoded.indexOf('/') !== -1 || decoded.indexOf('\\') !== -1) return null;

    // Reject segments that, once decoded, resolve to a traversal component
    // when normalized (e.g. '...//..').
    const normalized = path.normalize(decoded);
    if (normalized === '.' || normalized === '..') return null;
  }

  // Resolve the full path. path.resolve also collapses '..' segments, so we
  // rely on it for the final containment check rather than on path.join.
  const resolved = path.resolve(UPLOADS_ROOT, ...parts);

  // Containment check: resolved path must be the root itself or start with
  // the root + separator (this prevents the 'uploads-evil' prefix bypass).
  if (resolved !== UPLOADS_ROOT && !resolved.startsWith(UPLOADS_PREFIX)) {
    return null;
  }

  return resolved;
}
