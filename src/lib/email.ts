import { Resend } from 'resend';

let _resend: Resend | null = null;

function env(name: string): string | undefined {
  // @ts-expect-error - import.meta.env è un oggetto speciale Vite/Astro
  return process.env[name] ?? import.meta.env?.[name];
}

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(env('RESEND_API_KEY'));
  }
  return _resend;
}

const FROM = () => env('FROM_EMAIL') || 'Barbara Toffano <noreply@barbaratoffano.it>';
const SITE = () => env('SITE_URL') || 'https://barbaratoffano.it';

type PaymentMethod = 'paypal' | 'bonifico' | 'postepay' | 'non_specificato';

function paymentLabel(method: PaymentMethod): string {
  switch (method) {
    case 'paypal':
      return 'PayPal';
    case 'bonifico':
      return 'Bonifico Bancario';
    case 'postepay':
      return 'Postepay';
    default:
      return 'Da definire';
  }
}

function paymentHtmlNote(method: PaymentMethod): string {
  const postepay = env('POSTEPAY_INSTRUCTIONS')?.trim();
  const bonifico = env('BONIFICO_INSTRUCTIONS')?.trim();

  switch (method) {
    case 'paypal':
      return 'Ti invieremo a breve un link <strong>PayPal</strong> per completare il pagamento in modo sicuro.';
    case 'bonifico':
      return bonifico
        ? bonifico
        : 'Ti invieremo a breve le <strong>coordinate bancarie</strong> per effettuare il bonifico.';
    case 'postepay':
      return postepay
        ? postepay
        : 'Ti invieremo a breve i <strong>dati Postepay</strong> e le istruzioni per completare il pagamento.';
    default:
      return 'Ti contatteremo a breve con le istruzioni per completare il pagamento.';
  }
}

function parseWebhookUrls(): string[] {
  const raw = env('ORDER_NOTIFICATION_WEBHOOK_URL') || '';
  if (!raw.trim()) return [];

  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => {
      try {
        const url = new URL(s);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    });
}

/** Email conferma ordine al cliente */
export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  productName: string,
  amount: number,
  paymentMethod: PaymentMethod = 'non_specificato',
): Promise<void> {
  const paymentNote = paymentHtmlNote(paymentMethod);
  const paymentMethodLabel = paymentLabel(paymentMethod);

  await getResend().emails.send({
    from: FROM(),
    to: customerEmail,
    subject: `✦ Ordine Ricevuto — ${orderNumber}`,
    html: `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fdf7ec;font-family:Georgia,serif;color:#2b1d0e;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;border-bottom:2px solid #b8852a;padding-bottom:24px;">
      <p style="color:#b8852a;font-size:24px;margin:0 0 8px;letter-spacing:6px;">✦ ✦ ✦</p>
      <h1 style="color:#b8852a;font-size:24px;margin:0;letter-spacing:3px;font-family:Georgia,serif;">ORDINE RICEVUTO</h1>
    </div>
    <p style="color:#c05030;font-size:20px;text-align:center;margin-bottom:16px;font-style:italic;">Cara ${customerName},</p>
    <p style="line-height:1.75;color:#7a6248;">Ho ricevuto il tuo ordine con grande gioia. Elaborerò la tua richiesta con cura, dedizione e tutta la mia luce. Riscontro in genere entro <strong>48 ore</strong> (orario disponibilità 9–12 e 15–17).</p>
    <div style="background:#fffcf5;border:1px solid rgba(184,133,42,0.3);border-left:4px solid #b8852a;border-radius:8px;padding:20px;margin:24px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#7a6248;font-size:13px;letter-spacing:1px;font-family:Arial,sans-serif;">NUMERO ORDINE</td><td style="padding:6px 0;color:#b8852a;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">${orderNumber}</td></tr>
        <tr><td style="padding:6px 0;color:#7a6248;font-size:13px;letter-spacing:1px;font-family:Arial,sans-serif;">PRODOTTO</td><td style="padding:6px 0;color:#2b1d0e;text-align:right;">${productName}</td></tr>
        <tr><td style="padding:6px 0;color:#7a6248;font-size:13px;letter-spacing:1px;font-family:Arial,sans-serif;">PAGAMENTO</td><td style="padding:6px 0;color:#2b1d0e;text-align:right;">${paymentMethodLabel}</td></tr>
        <tr style="border-top:1px solid rgba(184,133,42,0.2);"><td style="padding:10px 0 0;color:#7a6248;font-size:13px;letter-spacing:1px;font-family:Arial,sans-serif;">IMPORTO</td><td style="padding:10px 0 0;color:#c05030;font-size:20px;font-weight:bold;text-align:right;font-family:Arial,sans-serif;">€${amount.toFixed(2)}</td></tr>
      </table>
    </div>
    <div style="background:#fff8f0;border:1px solid rgba(192,80,48,0.2);border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#7a6248;line-height:1.65;font-size:15px;">📋 <strong style="color:#2b1d0e;">Istruzioni pagamento:</strong><br/>${paymentNote}</p>
    </div>
    <p style="line-height:1.75;color:#7a6248;">Per qualsiasi necessità puoi scrivermi su <a href="https://wa.me/393297813392" style="color:#b8852a;">WhatsApp</a>, nel rispetto degli orari 9–12 e 15–17 quando possibile. Rispondo personalmente.</p>
    <div style="text-align:center;margin-top:36px;padding-top:24px;border-top:1px solid rgba(184,133,42,0.2);">
      <p style="color:#b8852a;font-size:20px;margin:0;letter-spacing:3px;">✦ Con Amore e Luce ✦</p>
      <p style="color:#7a6248;font-size:14px;margin:8px 0 0;">Barbara Toffano</p>
    </div>
  </div>
</body>
</html>`,
  });
}

/** Notifica al admin per nuovo ordine */
export async function sendAdminNotification(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  productName: string,
  amount: number,
  paymentMethod: PaymentMethod = 'non_specificato',
): Promise<void> {
  const adminEmail = env('ADMIN_EMAIL');
  const webhookUrls = parseWebhookUrls();
  if (!adminEmail && webhookUrls.length === 0) return;

  const paymentMethodLabel = paymentLabel(paymentMethod);
  const subject = `🔔 Nuovo Ordine: ${orderNumber} — ${productName}`;

  const jobs: Promise<unknown>[] = [];

  if (adminEmail) {
    jobs.push(
      getResend().emails.send({
        from: FROM(),
        to: adminEmail,
        subject,
        html: `
<!DOCTYPE html>
<html lang="it">
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,sans-serif;color:#333;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:30px;border:1px solid #ddd;">
    <h2 style="color:#5a189a;margin-top:0;">Nuovo Ordine Ricevuto</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;width:140px;">Numero Ordine</td><td style="padding:8px 0;font-weight:bold;color:#5a189a;">${orderNumber}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Cliente</td><td style="padding:8px 0;">${customerName}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${customerEmail}" style="color:#5a189a;">${customerEmail}</a></td></tr>
      <tr><td style="padding:8px 0;color:#666;">Prodotto</td><td style="padding:8px 0;">${productName}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Pagamento</td><td style="padding:8px 0;font-weight:bold;color:#c05030;">${paymentMethodLabel}</td></tr>
      <tr style="border-top:2px solid #f0f0f0;"><td style="padding:12px 0 0;color:#666;font-weight:bold;">Importo</td><td style="padding:12px 0 0;font-size:20px;font-weight:bold;color:#b8852a;">€${amount.toFixed(2)}</td></tr>
    </table>
    <div style="margin-top:24px;">
      <a href="${SITE()}/admin/dashboard" style="background:#5a189a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Gestisci Ordine →</a>
    </div>
  </div>
</body>
</html>`,
      }),
    );
  }

  for (const webhookUrl of webhookUrls) {
    jobs.push(
      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'order.created',
          orderNumber,
          customerName,
          customerEmail,
          productName,
          amount,
          paymentMethod,
          paymentMethodLabel,
          adminUrl: `${SITE()}/admin/dashboard`,
          createdAt: new Date().toISOString(),
          message: `Nuovo ordine ${orderNumber} da ${customerName} (${customerEmail}) - ${productName} - EUR ${amount.toFixed(2)} - pagamento: ${paymentMethodLabel}`,
        }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Webhook non riuscito (${res.status}) per ${webhookUrl}`);
        }
      }),
    );
  }

  await Promise.all(jobs);
}

/** Email con link download audio al cliente */
export async function sendAudioDownload(
  customerEmail: string,
  customerName: string,
  productName: string,
  downloadUrl: string,
): Promise<void> {
  await getResend().emails.send({
    from: FROM(),
    to: customerEmail,
    subject: `✦ Il tuo Audio è Pronto — ${productName}`,
    html: `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#07070f;font-family:Georgia,serif;color:#e8e8f0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <p style="color:#d4af37;font-size:32px;margin:0;">🎵</p>
      <h1 style="color:#d4af37;font-size:24px;margin:12px 0 0;letter-spacing:3px;">IL TUO AUDIO È PRONTO</h1>
    </div>
    <p style="color:#e0aaff;font-size:20px;text-align:center;margin-bottom:24px;">Cara ${customerName},</p>
    <p style="line-height:1.7;color:#c8c8d8;">Con grande gioia ti annuncio che il tuo audio personalizzato <strong style="color:#d4af37;">"${productName}"</strong> è pronto! L'ho registrato appositamente per te, con tutto il mio amore e la mia luce.</p>
    <div style="text-align:center;margin:36px 0;">
      <a href="${downloadUrl}" style="background:linear-gradient(135deg,#9d4edd,#d4af37);color:white;padding:16px 40px;text-decoration:none;border-radius:50px;font-size:16px;font-weight:bold;display:inline-block;letter-spacing:1px;">🎵 Scarica il tuo Audio</a>
    </div>
    <p style="font-size:12px;color:#606080;text-align:center;line-height:1.6;">Il link è valido per 7 giorni dalla ricezione di questa email.<br>Scarica e conserva il file sul tuo dispositivo.</p>
    <div style="text-align:center;margin-top:36px;padding-top:24px;border-top:1px solid rgba(212,175,55,0.15);">
      <p style="color:#d4af37;font-size:20px;margin:0;">✦ Con Amore e Luce ✦</p>
      <p style="color:#9090b0;font-size:14px;margin:8px 0 0;">Barbara Toffano</p>
    </div>
  </div>
</body>
</html>`,
  });
}
