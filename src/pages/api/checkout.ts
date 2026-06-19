import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { getProductById } from '../../lib/products';
import { sendOrderConfirmation, sendAdminNotification } from '../../lib/email';
import {
  checkCheckoutSpam,
  checkDuplicateOrder,
  getClientIp,
  logSpamBlock,
  validateCheckoutInput,
} from '../../lib/spam-guard';

function rejectCheckout(reason: string): Response {
  const params = new URLSearchParams({ error: reason });
  return new Response(null, {
    status: 302,
    headers: { Location: `/checkout?${params}` },
  });
}

function silentSuccess(): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: '/grazie?order=BT-CONFERMA' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(null, { status: 302, headers: { Location: '/shop?error=1' } });
  }

  const spamCheck = checkCheckoutSpam(request, formData);
  if (!spamCheck.allowed) {
    logSpamBlock(spamCheck.reason, ip);
    return spamCheck.action === 'silent_success'
      ? silentSuccess()
      : rejectCheckout('richiesta_non_valida');
  }

  const name          = (formData.get('name') as string | null)?.trim();
  const email         = (formData.get('email') as string | null)?.trim().toLowerCase();
  const phone         = (formData.get('phone') as string | null)?.trim() || null;
  const productId     = Number(formData.get('product_id'));
  const notes         = (formData.get('notes') as string | null)?.trim() || null;
  const paymentMethodRaw = (formData.get('payment_method') as string | null)?.trim() || 'non_specificato';
  const paymentMethod =
    paymentMethodRaw === 'paypal' || paymentMethodRaw === 'bonifico' || paymentMethodRaw === 'postepay'
      ? paymentMethodRaw
      : 'non_specificato';

  const inputCheck = validateCheckoutInput({ name: name ?? '', email: email ?? '', phone, notes });
  if (!inputCheck.allowed) {
    logSpamBlock(inputCheck.reason, ip, email ?? undefined);
    if (inputCheck.reason === 'rate_email') {
      return rejectCheckout('troppi_tentativi');
    }
    return rejectCheckout(
      inputCheck.reason === 'invalid_name' || inputCheck.reason === 'invalid_email'
        ? 'dati_mancanti'
        : 'richiesta_non_valida',
    );
  }

  if (!name || !email || !productId) {
    return rejectCheckout('dati_mancanti');
  }

  const product = await getProductById(productId);
  if (!product) {
    return new Response(null, { status: 302, headers: { Location: '/shop?error=prodotto' } });
  }
  if (!product.is_active) {
    return new Response(null, { status: 302, headers: { Location: '/shop?error=prodotto_non_disponibile' } });
  }

  const db = getDb();
  const duplicateCheck = await checkDuplicateOrder(db, email, productId);
  if (!duplicateCheck.allowed) {
    logSpamBlock(duplicateCheck.reason, ip, email);
    return rejectCheckout('ordine_duplicato');
  }

  const orderNumber = `BT-${Date.now().toString(36).toUpperCase()}`;

  try {
    await db.execute(
      `INSERT INTO orders
         (order_number, customer_name, customer_email, customer_phone,
          product_id, product_name, product_type, amount, payment_method, customer_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        name,
        email,
        phone,
        productId,
        product.name,
        product.delivery_type,
        product.price,
        paymentMethod,
        notes,
      ],
    );
  } catch (err) {
    console.error('DB error creating order:', err);
    return rejectCheckout('db');
  }

  sendOrderConfirmation(email, name, orderNumber, product.name, product.price, paymentMethod).catch(console.error);
  sendAdminNotification(orderNumber, name, email, product.name, product.price, paymentMethod).catch(console.error);

  return new Response(null, {
    status: 302,
    headers: { Location: `/grazie?order=${orderNumber}` },
  });
};
