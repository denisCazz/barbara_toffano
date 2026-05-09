import type { APIRoute } from 'astro';
import { deleteProduct } from '../../../../lib/products';

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }

  const id = Number(formData.get('id') || 0);
  if (!id) return new Response(JSON.stringify({ error: 'ID mancante' }), { status: 400 });

  try {
    await deleteProduct(id);
  } catch (err) {
    console.error('Product delete error:', err);
    return new Response(JSON.stringify({ error: 'Errore database' }), { status: 500 });
  }

  return new Response(null, { status: 302, headers: { Location: '/admin/prodotti' } });
};

