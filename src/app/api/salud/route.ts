import { NextResponse } from 'next/server';
import { query, variableDeConexion } from '@/lib/db';

/**
 * Diagnóstico de la instalación. Sirve para saber, tras desplegar, si la base
 * de datos y la clave están bien puestas, sin tener que provocar un error.
 *
 * No devuelve ningún valor de configuración: solo si está o no está.
 */
// Esta ruta es un diagnóstico: nunca debe servirse cacheada, ni por el CDN ni
// por el navegador, o se acaba mirando el estado de hace dos despliegues.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const problemas: string[] = [];

  if (!process.env.OPENROUTER_API_KEY) {
    problemas.push('Falta la variable OPENROUTER_API_KEY.');
  }
  if (!process.env.ADMIN_EMAIL) {
    problemas.push('Falta ADMIN_EMAIL: nadie recibirá el rol de administrador al registrarse.');
  }

  let baseDatos = 'sin comprobar';
  // Se informa del NOMBRE de la variable encontrada, nunca de su valor: esta
  // ruta es pública y la cadena lleva usuario y contraseña dentro.
  const variable = variableDeConexion();
  if (!variable) {
    problemas.push(
      'No hay cadena de conexión. Se ha buscado en DATABASE_URL y POSTGRES_URL. ' +
        'Si acabas de añadirla en Vercel, vuelve a desplegar: las variables solo ' +
        'entran en despliegues nuevos.',
    );
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
            'Aplica db/schema.sql en el editor SQL de tu proveedor, o ejecuta npm run db:migrate.',
        );
        baseDatos = 'conectada, sin migrar';
      } else {
        baseDatos = 'lista';
      }
    } catch (error) {
      // El detalle va al log del servidor; al exterior, solo que no conecta.
      console.error('Comprobación de salud: fallo al conectar con la base de datos', error);
      problemas.push(`No se puede conectar con la base de datos. Revisa ${variable}.`);
      baseDatos = 'sin conexión';
    }
  }

  const ok = problemas.length === 0;
  return NextResponse.json(
    {
      ok,
      baseDatos,
      // Nombres de variables, nunca sus valores.
      variableDeConexion: variable ?? 'ninguna',
      claveOpenRouter: process.env.OPENROUTER_API_KEY ? 'puesta' : 'ausente',
      problemas,
    },
    {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  );
}
