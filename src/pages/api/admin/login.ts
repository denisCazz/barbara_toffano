import type { APIRoute } from 'astro';
import { createSession, verifyAdminPassword } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(null, { status: 302, headers: { Location: '/admin/login?error=1' } });
  }

  const password = formData.get('password') as string | null;

  if (!password || !verifyAdminPassword(password)) {
    return new Response(null, { status: 302, headers: { Location: '/admin/login?error=1' } });
  }

  let token: string;
  try {
    token = await createSession();
  } catch (err) {
    console.error('Session creation error:', err);
    return new Response(null, { status: 302, headers: { Location: '/admin/login?error=1' } });
  }

  const isProduction = import.meta.env.PROD;
  const cookieValue = [
    `admin_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${7 * 24 * 60 * 60}`,
    isProduction ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin/dashboard',
      'Set-Cookie': cookieValue,
    },
  });
};
