import { Pool } from 'pg';

// Una sola pool por proceso. En desarrollo, Next recarga los módulos en cada
// cambio, así que la guardamos en globalThis para no abrir conexiones sin fin.
const globalForDb = globalThis as unknown as { pool?: Pool };

// Los Postgres gestionados (Neon, Supabase) exigen TLS y verificamos su
// certificado. En local no hay TLS, y si la cadena ya trae sslmode se respeta.
export function sslFor(connectionString: string): { rejectUnauthorized: boolean } | undefined {
  let host = '';
  try {
    host = new URL(connectionString).hostname;
  } catch {
    return { rejectUnauthorized: true };
  }
  if (new URL(connectionString).searchParams.has('sslmode')) return undefined;
  const isLocal = host === '' || host === 'localhost' || host === '127.0.0.1' || host === '::1';
  return isLocal ? undefined : { rejectUnauthorized: true };
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Falta la variable de entorno DATABASE_URL.');
  }
  return new Pool({ connectionString, max: 5, ssl: sslFor(connectionString) });
}

export function getPool(): Pool {
  globalForDb.pool ??= createPool();
  return globalForDb.pool;
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
