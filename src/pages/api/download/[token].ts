import type { APIRoute } from 'astro';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { getDb } from '../../../lib/db';

export const GET: APIRoute = async ({ params }) => {
  const { token } = params;

  if (!token || token.length > 128) {
    return new Response('Token non valido', { status: 400 });
  }

  const db = getDb();

  const [rows] = await db.execute(
    `SELECT id, customer_name, product_name, audio_file_path, audio_original_name,
            download_count
     FROM orders
     WHERE download_token = ? AND download_expires_at > NOW()`,
    [token],
  );
  const order = (rows as any[])[0];

  if (!order) {
    return new Response('Link scaduto o non valido', { status: 410 });
  }

  if (!order.audio_file_path) {
    return new Response('File non trovato', { status: 404 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(order.audio_file_path);
  } catch {
    return new Response('File non disponibile', { status: 404 });
  }

  // Increment download count (fire and forget)
  db.execute(
    'UPDATE orders SET download_count = download_count + 1, updated_at = NOW() WHERE id = ?',
    [order.id],
  ).catch(console.error);

  const ext = extname(order.audio_original_name || order.audio_file_path).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp3':  'audio/mpeg',
    '.webm': 'audio/webm',
    '.wav':  'audio/wav',
    '.ogg':  'audio/ogg',
    '.m4a':  'audio/mp4',
    '.aac':  'audio/aac',
    '.flac': 'audio/flac',
  };
  const contentType = mimeMap[ext] ?? 'audio/mpeg';
  const filename = encodeURIComponent(order.audio_original_name || `audio${ext}`);

  return new Response(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(fileBuffer.length),
      'Cache-Control': 'no-store',
    },
  });
};
