import { randomBytes } from 'crypto';
import { getDb } from './db';

function env(name: string): string | undefined {
  // @ts-expect-error - import.meta.env è un oggetto speciale Vite/Astro
  return process.env[name] ?? import.meta.env?.[name];
}

/** Crea una sessione admin e restituisce il token */
export async function createSession(): Promise<string> {
  const token = randomBytes(40).toString('hex');
  const db = getDb();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni
  await db.execute('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)', [
    token,
    expiresAt,
  ]);
  return token;
}

/** Elimina una sessione admin */
export async function deleteSession(token: string): Promise<void> {
  const db = getDb();
  await db.execute('DELETE FROM admin_sessions WHERE token = ?', [token]);
}

/** Restituisce true se il token corrisponde a una sessione admin valida e non scaduta */
export async function isValidSession(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const db = getDb();
    const [rows] = await db.execute(
      'SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
      [token],
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

/** Verifica la password admin (confronto costante per sicurezza) */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = env('ADMIN_PASSWORD');
  if (!adminPassword || !password) return false;
  // Confronto a lunghezza costante per prevenire timing attacks
  if (password.length !== adminPassword.length) return false;
  let diff = 0;
  for (let i = 0; i < password.length; i++) {
    diff |= password.charCodeAt(i) ^ adminPassword.charCodeAt(i);
  }
  return diff === 0;
}
