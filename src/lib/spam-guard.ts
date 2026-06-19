import type { Pool } from 'mysql2/promise';
import { isRateLimited } from './ratelimit';

export type SpamVerdict =
  | { allowed: true }
  | { allowed: false; action: 'silent_success' | 'reject'; reason: string };

const MIN_FORM_SECONDS = 3;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;

const IP_LIMIT = 5;
const IP_WINDOW_MS = 60 * 60 * 1000;

const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;

const DUPLICATE_WINDOW_MINUTES = 30;

const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'grr.la',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  '10minutemail.com',
  'dispostable.com',
  'fakeinbox.com',
  'sharklasers.com',
  'getnada.com',
  'maildrop.cc',
  'throwaway.email',
  'tempail.com',
  'emailondeck.com',
]);

const SUSPICIOUS_EMAIL_LOCAL = new Set([
  'test',
  'admin',
  'spam',
  'fake',
  'asdf',
  'qwerty',
  'noreply',
  'no-reply',
]);

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export function checkCheckoutSpam(
  request: Request,
  formData: FormData,
): SpamVerdict {
  const honeypot = (formData.get('website') as string | null)?.trim();
  if (honeypot) {
    return { allowed: false, action: 'silent_success', reason: 'honeypot' };
  }

  const formTsRaw = (formData.get('form_ts') as string | null)?.trim();
  const formTs = formTsRaw ? Number(formTsRaw) : NaN;
  const elapsed = Number.isFinite(formTs) ? Date.now() - formTs : -1;

  if (!Number.isFinite(formTs) || elapsed < MIN_FORM_SECONDS * 1000) {
    return { allowed: false, action: 'silent_success', reason: 'timing_fast' };
  }
  if (elapsed > MAX_FORM_AGE_MS) {
    return { allowed: false, action: 'reject', reason: 'timing_expired' };
  }

  const ip = getClientIp(request);
  if (ip !== 'unknown' && isRateLimited(`checkout:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS)) {
    return { allowed: false, action: 'reject', reason: 'rate_ip' };
  }

  return { allowed: true };
}

export function validateCheckoutInput(input: {
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
}): SpamVerdict {
  const { name, email, phone, notes } = input;

  if (!name || name.length < 2 || name.length > 100) {
    return { allowed: false, action: 'reject', reason: 'invalid_name' };
  }

  if (/https?:\/\//i.test(name) || /<[^>]+>/.test(name)) {
    return { allowed: false, action: 'reject', reason: 'invalid_name' };
  }

  if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
    return { allowed: false, action: 'reject', reason: 'invalid_email' };
  }

  const [local, domain] = email.split('@');
  if (!local || !domain || local.length < 2) {
    return { allowed: false, action: 'reject', reason: 'invalid_email' };
  }

  if (SUSPICIOUS_EMAIL_LOCAL.has(local)) {
    return { allowed: false, action: 'reject', reason: 'invalid_email' };
  }

  const domainLower = domain.toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domainLower)) {
    return { allowed: false, action: 'reject', reason: 'disposable_email' };
  }

  if (phone && phone.length > 30) {
    return { allowed: false, action: 'reject', reason: 'invalid_phone' };
  }

  if (notes && notes.length > 2000) {
    return { allowed: false, action: 'reject', reason: 'invalid_notes' };
  }

  if (isRateLimited(`checkout:email:${email}`, EMAIL_LIMIT, EMAIL_WINDOW_MS)) {
    return { allowed: false, action: 'reject', reason: 'rate_email' };
  }

  return { allowed: true };
}

export async function checkDuplicateOrder(
  db: Pool,
  email: string,
  productId: number,
): Promise<SpamVerdict> {
  const [rows] = await db.execute(
    `SELECT id FROM orders
     WHERE customer_email = ?
       AND product_id = ?
       AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
     LIMIT 1`,
    [email, productId, DUPLICATE_WINDOW_MINUTES],
  );

  if (Array.isArray(rows) && rows.length > 0) {
    return { allowed: false, action: 'reject', reason: 'duplicate_order' };
  }

  return { allowed: true };
}

export function logSpamBlock(reason: string, ip: string, email?: string): void {
  console.warn('[spam-guard] blocked checkout', { reason, ip, email: email ?? null });
}
