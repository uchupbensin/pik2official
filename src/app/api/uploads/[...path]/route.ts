import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { resolveUploadPath } from '@/lib/uploads-path';

export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context.params;

    // Validate and resolve the requested path. Returns null if the path
    // would escape the uploads root (path traversal attempt).
    const filePath = resolveUploadPath(params.path);
    if (!filePath) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if the path exists AND is a regular file. We intentionally do not
    // distinguish between "missing" and "is a directory" in the response so we
    // don't leak filesystem details (e.g. EISDIR). A directory request is
    // treated as Not Found instead of letting fs.readFileSync throw EISDIR
    // (which would otherwise surface as a 500).
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      // File does not exist (ENOENT) or is otherwise inaccessible.
      return new NextResponse('Not Found', { status: 404 });
    }
    if (!stat.isFile()) {
      // Path resolves to a directory or other non-file type. Return 404
      // without disclosing the nature of the target.
      return new NextResponse('Not Found', { status: 404 });
    }

    // Determine content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.mp4') contentType = 'video/mp4';

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Return response with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
