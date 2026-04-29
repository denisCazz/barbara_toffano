import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }

  const orderId = Number(formData.get('order_id'));
  const status  = formData.get('status') as string | null;
  const adminNotes = formData.get('admin_notes') as string | null;

  if (!orderId) {
    return new Response(JSON.stringify({ error: 'order_id mancante' }), { status: 400 });
  }

  const validStatuses = ['in_attesa', 'lavorazione', 'completato', 'annullato'];
  if (status && !validStatuses.includes(status)) {
    return new Response(JSON.stringify({ error: 'Stato non valido' }), { status: 400 });
  }

  const db = getDb();
  try {
    await db.execute(
      `UPDATE orders SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?`,
      [status ?? 'in_attesa', adminNotes ?? null, orderId],
    );
  } catch (err) {
    console.error('DB error updating order:', err);
    return new Response(JSON.stringify({ error: 'Errore database' }), { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: `/admin/ordine/${orderId}?saved=1` },
  });
};
