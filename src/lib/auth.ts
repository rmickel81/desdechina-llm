import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { query, queryOne } from './db';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const SESSION_COOKIE = 'dc_sesion';
const SESSION_DAYS = 30;
const KEY_LENGTH = 64;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  monthly_limit: number;
}

/* Contraseñas ------------------------------------------------------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split(':');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const derived = await scrypt(password.normalize('NFKC'), Buffer.from(saltHex, 'hex'), KEY_LENGTH);
  // Comparación en tiempo constante: no revela cuántos bytes coinciden.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/* Sesiones ---------------------------------------------------------------- */

// En la base solo guardamos el hash del token. Si alguien leyera la tabla,
// no podría reconstruir ninguna cookie válida.
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query('insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)', [
    hashToken(token),
    userId,
    expiresAt,
  ]);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await query('delete from sessions where token_hash = $1', [hashToken(token)]);
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return queryOne<SessionUser>(
    `select u.id, u.email, u.name, u.role, u.monthly_limit
       from sessions s
       join users u on u.id = s.user_id
      where s.token_hash = $1
        and s.expires_at > now()
        and u.status = 'active'`,
    [hashToken(token)],
  );
}

/* Cuota mensual ------------------------------------------------------------ */

export async function getMonthlyUsage(userId: string): Promise<number> {
  const row = await queryOne<{ total: string }>(
    `select count(*)::text as total
       from usage_events
      where user_id = $1
        and created_at >= date_trunc('month', now())`,
    [userId],
  );
  return Number(row?.total ?? 0);
}

/* Validación --------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const value = email.trim().toLowerCase();
  return EMAIL_PATTERN.test(value) && value.length <= 254 ? value : null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string') return 'La contraseña no es válida.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password.length > 200) return 'La contraseña es demasiado larga.';
  return null;
}
