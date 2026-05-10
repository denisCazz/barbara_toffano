import type { APIRoute } from 'astro';
import { isValidSession } from '../../../lib/auth';
import { cleanupOldAudio } from '../../../lib/cleanup';

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get('admin_session')?.value;
  if (!(await isValidSession(token))) {
    return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const report = await cleanupOldAudio();
    return new Response(
      JSON.stringify({
        ok: true,
        deletedCount: report.deleted.length,
        dbCleared: report.dbCleared,
        errors: report.errors,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[cleanup-audio] errore:', err);
    return new Response(JSON.stringify({ error: 'Errore durante la pulizia' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
