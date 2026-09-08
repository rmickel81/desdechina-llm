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

/**
 * Nombres bajo los que puede llegar la cadena de conexión, en orden de
 * preferencia. `DATABASE_URL` es la que documenta el .env.example, pero la
 * integración de Neon en Vercel inyecta la suya como `POSTGRES_URL` según la
 * versión, y entonces la app no la encontraba aunque estuviera puesta.
 *
 * Solo cadenas agrupadas (pooled): en serverless cada petición abre conexión,
 * y las variantes `_UNPOOLED` / `_NON_POOLING` agotan el servidor.
 */
const VARIABLES_DE_CONEXION = ['DATABASE_URL', 'POSTGRES_URL'] as const;

/** El nombre de la variable que trae la conexión, o null si no hay ninguna. */
export function variableDeConexion(): string | null {
  return VARIABLES_DE_CONEXION.find((n) => process.env[n]?.trim()) ?? null;
}

export function connectionString(): string | null {
  const nombre = variableDeConexion();
  return nombre ? (process.env[nombre] as string) : null;
}

function createPool(): Pool {
  const cadena = connectionString();
  if (!cadena) {
    throw new Error(
      `Falta la cadena de conexión. Se ha buscado en: ${VARIABLES_DE_CONEXION.join(', ')}.`,
    );
  }
  return new Pool({ connectionString: cadena, max: 5, ssl: sslFor(cadena) });
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
