// Aplica db/schema.sql sobre DATABASE_URL. Es idempotente: se puede repetir.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, '..', 'db', 'schema.sql'), 'utf8');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Falta DATABASE_URL.');
  process.exit(1);
}

const url = new URL(connectionString);
const isLocal = ['', 'localhost', '127.0.0.1', '::1'].includes(url.hostname);
const client = new pg.Client({
  connectionString,
  ssl: isLocal || url.searchParams.has('sslmode') ? undefined : { rejectUnauthorized: true },
});

try {
  await client.connect();
  await client.query(schema);
  console.log('Esquema aplicado correctamente.');
} catch (error) {
  console.error('La migración ha fallado:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
