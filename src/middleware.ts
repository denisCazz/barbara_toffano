import { defineMiddleware } from 'astro:middleware';
import { getDb } from './lib/db';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Proteggi tutte le rotte /admin/* tranne /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionToken = context.cookies.get('admin_session')?.value;

    if (!sessionToken) {
      return context.redirect('/admin/login');
    }

    try {
      const db = getDb();
      const [rows] = await db.execute(
        'SELECT id FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
        [sessionToken],
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        context.cookies.delete('admin_session', { path: '/' });
        return context.redirect('/admin/login');
      }
    } catch {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
