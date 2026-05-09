import type { APIRoute } from 'astro';
import {
  createProduct,
  updateProduct,
  type DeliveryType,
  type ProductCategory,
  type UpsertProductInput,
} from '../../../../lib/products';

function isCategory(v: string): v is ProductCategory {
  return v === 'consulto' || v === 'meditazione' || v === 'lettura' || v === 'vendita';
}

function isDelivery(v: string): v is DeliveryType {
  return v === 'audio' || v === 'carta' || v === 'pacchetto';
}

function parseDetails(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }

  const mode = String(formData.get('mode') || '');
  const id = Number(formData.get('id') || 0);

  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const price = Number(formData.get('price') || 0);
  const categoryRaw = String(formData.get('category') || '').trim();
  const deliveryRaw = String(formData.get('delivery_type') || '').trim();
  const icon = String(formData.get('icon') || '✦').trim() || '✦';
  const sortOrder = Number(formData.get('sort_order') || 0);
  const featured = formData.get('featured') ? true : false;
  const isActive = formData.get('is_active') ? true : false;
  const details = parseDetails((formData.get('details') as string | null) ?? null);
  const infoUrl = String(formData.get('info_url') || '').trim() || null;
  const infoLabel = String(formData.get('info_label') || '').trim() || null;

  if (!name || !description || !Number.isFinite(price) || price < 0) {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), { status: 400 });
  }
  if (!isCategory(categoryRaw) || !isDelivery(deliveryRaw)) {
    return new Response(JSON.stringify({ error: 'Categoria o consegna non valida' }), { status: 400 });
  }

  const input: UpsertProductInput = {
    name,
    description,
    price,
    category: categoryRaw,
    delivery_type: deliveryRaw,
    icon,
    details,
    info_url: infoUrl,
    info_label: infoLabel,
    featured,
    is_active: isActive,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  };

  try {
    if (mode === 'create') {
      const newId = await createProduct(input);
      return new Response(null, { status: 302, headers: { Location: `/admin/prodotti/${newId}` } });
    }

    if (mode === 'update') {
      if (!id) return new Response(JSON.stringify({ error: 'ID mancante' }), { status: 400 });
      await updateProduct(id, input);
      return new Response(null, { status: 302, headers: { Location: `/admin/prodotti/${id}?saved=1` } });
    }

    return new Response(JSON.stringify({ error: 'Mode non valido' }), { status: 400 });
  } catch (err) {
    console.error('Product upsert error:', err);
    return new Response(JSON.stringify({ error: 'Errore database' }), { status: 500 });
  }
};

