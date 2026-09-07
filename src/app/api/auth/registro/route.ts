import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { createSession, hashPassword, normalizeEmail, validatePassword } from '@/lib/auth';

const DEFAULT_MONTHLY_LIMIT = Number(process.env.DEFAULT_MONTHLY_LIMIT ?? 50);

export async function POST(request: Request) {
  if (process.env.REGISTRATION_OPEN === 'false') {
    return NextResponse.json(
      { error: 'El registro está cerrado. Pide una invitación al administrador.' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const { email: rawEmail, password, name } = body as Record<string, unknown>;

  const email = normalizeEmail(rawEmail);
  if (!email) {
    return NextResponse.json({ error: 'Introduce un correo válido.' }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const existing = await queryOne<{ id: string }>('select id from users where email = $1', [email]);
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo.' }, { status: 409 });
  }

  // El primer usuario de la instalación, y quien coincida con ADMIN_EMAIL,
  // entran como administradores. El resto, como usuarios normales.
  const firstUser = await queryOne<{ total: string }>('select count(*)::text as total from users');
  const isBootstrap = Number(firstUser?.total ?? 0) === 0;
  const isNamedAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase() === email;
  const role = isBootstrap || isNamedAdmin ? 'admin' : 'user';

  const user = await queryOne<{ id: string }>(
    `insert into users (email, name, password_hash, role, monthly_limit)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [
      email,
      typeof name === 'string' ? name.trim().slice(0, 80) : '',
      await hashPassword(password as string),
      role,
      role === 'admin' ? 100000 : DEFAULT_MONTHLY_LIMIT,
    ],
  );

  if (!user) {
    return NextResponse.json({ error: 'No se ha podido crear la cuenta.' }, { status: 500 });
  }

  await query('update users set last_login_at = now() where id = $1', [user.id]);
  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
