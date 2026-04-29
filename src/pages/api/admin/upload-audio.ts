import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';
import { getDb } from '../../../lib/db';
import { sendAudioDownload } from '../../../lib/email';

const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50 MB

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }

  const action  = formData.get('action') as string | null;
  const orderId = Number(formData.get('order_id'));

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'order_id mancante' }), { status: 400 });
  }

  const db = getDb();

  // Fetch order
  const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
  const order = (rows as any[])[0];
  if (!order) {
    return new Response(JSON.stringify({ error: 'Ordine non trovato' }), { status: 404 });
  }

  // ── Action: upload ──
  if (action === 'upload') {
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile || typeof audioFile === 'string') {
      return new Response(JSON.stringify({ error: 'Nessun file audio ricevuto' }), { status: 400 });
    }
    if (!audioFile.type.startsWith('audio/')) {
      return new Response(JSON.stringify({ error: 'Il file deve essere un audio' }), { status: 400 });
    }
    if (audioFile.size > MAX_AUDIO_SIZE) {
      return new Response(JSON.stringify({ error: 'File troppo grande (max 50 MB)' }), { status: 400 });
    }

    const ext = extname(audioFile.name) || '.webm';
    const filename = `order-${orderId}-${Date.now()}${ext}`;
    const uploadDir = join(process.cwd(), 'uploads', 'audio');
    const filePath = join(uploadDir, filename);

    try {
      await mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      await writeFile(filePath, buffer);
    } catch (err) {
      console.error('File write error:', err);
      return new Response(JSON.stringify({ error: 'Errore salvataggio file' }), { status: 500 });
    }

    try {
      await db.execute(
        `UPDATE orders
         SET audio_file_path = ?, audio_original_name = ?, status = 'lavorazione', updated_at = NOW()
         WHERE id = ?`,
        [filePath, audioFile.name, orderId],
      );
    } catch (err) {
      console.error('DB error updating audio:', err);
      return new Response(JSON.stringify({ error: 'Errore database' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  // ── Action: send ──
  if (action === 'send') {
    if (!order.audio_file_path) {
      return new Response(JSON.stringify({ error: 'Nessun audio caricato per questo ordine' }), { status: 400 });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    try {
      await db.execute(
        `UPDATE orders
         SET download_token = ?, download_expires_at = ?, status = 'completato', updated_at = NOW()
         WHERE id = ?`,
        [token, expiresAt, orderId],
      );
    } catch (err) {
      console.error('DB error setting download token:', err);
      return new Response(JSON.stringify({ error: 'Errore database' }), { status: 500 });
    }

    const siteUrl = import.meta.env.SITE_URL || 'http://localhost:4321';
    const downloadUrl = `${siteUrl}/api/download/${token}`;

    try {
      await sendAudioDownload(order.customer_email, order.customer_name, order.product_name, downloadUrl);
    } catch (err) {
      console.error('Email send error:', err);
      return new Response(JSON.stringify({ error: 'Errore invio email' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Azione non valida' }), { status: 400 });
};
