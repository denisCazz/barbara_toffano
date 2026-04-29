import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { getProductById } from '../../data/products';
import { sendOrderConfirmation, sendAdminNotification } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(null, { status: 302, headers: { Location: '/shop?error=1' } });
  }

  const name          = (formData.get('name') as string | null)?.trim();
  const email         = (formData.get('email') as string | null)?.trim().toLowerCase();
  const phone         = (formData.get('phone') as string | null)?.trim() || null;
  const productId     = Number(formData.get('product_id'));
  const notes         = (formData.get('notes') as string | null)?.trim() || null;
  const paymentMethod = (formData.get('payment_method') as string | null)?.trim() || 'non_specificato';

  // Validate
  if (!name || !email || !productId || !email.includes('@')) {
    return new Response(null, { status: 302, headers: { Location: '/checkout?error=dati_mancanti' } });
  }

  const product = getProductById(productId);
  if (!product) {
    return new Response(null, { status: 302, headers: { Location: '/shop?error=prodotto' } });
  }

  // Generate order number
  const orderNumber = `BT-${Date.now().toString(36).toUpperCase()}`;

  try {
    const db = getDb();
    await db.execute(
      `INSERT INTO orders
         (order_number, customer_name, customer_email, customer_phone,
          product_id, product_name, product_type, amount, customer_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, name, email, phone, productId, product.name, product.type, product.price, notes],
    );
  } catch (err) {
    console.error('DB error creating order:', err);
    return new Response(null, { status: 302, headers: { Location: '/checkout?error=db' } });
  }

  // Send emails (non-blocking)
  const paymentLabel = paymentMethod === 'paypal' ? 'PayPal' : 'Bonifico Bancario';
  sendOrderConfirmation(email, name, orderNumber, product.name, product.price, paymentLabel).catch(console.error);
  sendAdminNotification(orderNumber, name, email, product.name, product.price, paymentLabel).catch(console.error);

  return new Response(null, {
    status: 302,
    headers: { Location: `/grazie?order=${orderNumber}` },
  });
};
