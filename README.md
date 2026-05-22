# Barbara Toffano - Sito e Shop

Applicazione Astro SSR per sito vetrina, shop, checkout e area admin ordini/prodotti.

## Configurazione Base

1. Installa dipendenze:

```bash
npm install
```

2. Crea ambiente locale:

```bash
cp .env.example .env
```

3. Imposta variabili principali in `.env`:

- `SITE_URL=https://barbaratoffano.it`
- `RESEND_API_KEY=...`
- `FROM_EMAIL=Barbara Toffano <noreply@barbaratoffano.it>`
- `ADMIN_EMAIL=barbara@barbaratoffano.it`

4. Avvia in sviluppo:

```bash
npm run dev
```

## Notifiche Ordine

Quando arriva un ordine (`POST /api/checkout`):

- viene inviata email di conferma cliente
- viene inviata email notifica admin
- opzionalmente viene inviato un webhook istantaneo

Per webhook istantaneo imposta:

- `ORDER_NOTIFICATION_WEBHOOK_URL=https://hook.example.com/order`

Puoi passare piu URL separati da virgola o newline.

Payload JSON inviato:

- `event` (`order.created`)
- `orderNumber`
- `customerName`
- `customerEmail`
- `productName`
- `amount`
- `paymentMethod`
- `paymentMethodLabel`
- `adminUrl`
- `createdAt`
- `message`

## PWA

Il progetto e configurato come PWA installabile con:

- manifest completo
- service worker con auto update
- cache pulizia automatica
- metadata mobile (`theme-color`, `apple-web-app`)
- icone dedicate in `public/icons/`

## Comandi

- `npm run dev` - avvia server sviluppo
- `npm run build` - build produzione
- `npm run preview` - preview build locale

## Deploy

- Dominio target: `barbaratoffano.it`
- Imposta sempre `SITE_URL` in produzione con dominio pubblico senza slash finale.
