import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { createSession, normalizeEmail, verifyPassword } from '@/lib/auth';

// Mismo mensaje para correo inexistente y contraseña incorrecta: así no se
// puede usar el formulario para averiguar qué correos están registrados.
const GENERIC_ERROR = 'Correo o contraseña incorrectos.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const { email: rawEmail, password } = body as Record<string, unknown>;
  const email = normalizeEmail(rawEmail);

  if (!email || typeof password !== 'string') {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const user = await queryOne<{ id: string; password_hash: string; status: string }>(
    'select id, password_hash, status from users where email = $1',
    [email],
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (user.status !== 'active') {
    return NextResponse.json(
      { error: 'Esta cuenta está suspendida. Escribe al administrador.' },
      { status: 403 },
    );
  }

  await query('update users set last_login_at = now() where id = $1', [user.id]);
  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
