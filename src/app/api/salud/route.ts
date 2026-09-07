import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Diagnóstico de la instalación. Sirve para saber, tras desplegar, si la base
 * de datos y la clave están bien puestas, sin tener que provocar un error.
 *
 * No devuelve ningún valor de configuración: solo si está o no está.
 */
export async function GET() {
  const problemas: string[] = [];

  if (!process.env.OPENROUTER_API_KEY) {
    problemas.push('Falta la variable OPENROUTER_API_KEY.');
  }
  if (!process.env.ADMIN_EMAIL) {
    problemas.push('Falta ADMIN_EMAIL: nadie recibirá el rol de administrador al registrarse.');
  }

  let baseDatos = 'sin comprobar';
  if (!process.env.DATABASE_URL) {
    problemas.push('Falta la variable DATABASE_URL.');
    baseDatos = 'sin configurar';
  } else {
    try {
      const filas = await query<{ tabla: string }>(
        `select table_name as tabla
           from information_schema.tables
          where table_schema = 'public'
            and table_name in ('users', 'sessions', 'usage_events')`,
      );
      const faltan = ['users', 'sessions', 'usage_events'].filter(
        (t) => !filas.some((f) => f.tabla === t),
      );
      if (faltan.length > 0) {
        problemas.push(
          `Conecta con la base de datos, pero faltan tablas (${faltan.join(', ')}). ` +
            'Aplica el esquema con: DATABASE_URL="..." npm run db:migrate',
        );
        baseDatos = 'conectada, sin migrar';
      } else {
        baseDatos = 'lista';
      }
    } catch (error) {
      // El detalle va al log del servidor; al exterior, solo que no conecta.
      console.error('Comprobación de salud: fallo al conectar con la base de datos', error);
      problemas.push('No se puede conectar con la base de datos. Revisa DATABASE_URL.');
      baseDatos = 'sin conexión';
    }
  }

  const ok = problemas.length === 0;
  return NextResponse.json(
    {
      ok,
      baseDatos,
      claveOpenRouter: process.env.OPENROUTER_API_KEY ? 'puesta' : 'ausente',
      problemas,
    },
    { status: ok ? 200 : 503 },
  );
}
