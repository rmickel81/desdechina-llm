# DesdeChina LLM

Chat web con los mejores modelos de IA china (DeepSeek, Qwen, Kimi, GLM, MiniMax,
Tencent) a través de [OpenRouter](https://openrouter.ai). Los usuarios entran con
su cuenta y escriben; la clave de OpenRouter es de la instalación y cada cuenta
tiene una cuota mensual de mensajes.

La app elige el modelo según la tarea que se seleccione: redacción, programación,
análisis de documentos, creatividad, traducción, cálculo y presentaciones.

## Cómo funciona

- **Autenticación propia**: correo y contraseña. Las contraseñas se guardan con
  `scrypt` y sal aleatoria; la sesión es un token opaco en una cookie `httpOnly`,
  del que en la base de datos solo vive su hash SHA-256.
- **La clave de OpenRouter nunca sale del servidor.** El navegador habla con
  `/api/chat`, y es el servidor quien llama a OpenRouter.
- **Cuota por usuario**: cada mensaje deja una fila en `usage_events`. Antes de
  llamar al modelo se cuentan los del mes en curso y se compara con el límite de
  la cuenta. El contador se reinicia solo el día 1.
- **Panel de administración** en `/admin`: alta de usuarios, uso del mes, cambio
  de límite y suspensión. Suspender cierra además la sesión abierta al instante.
- Las conversaciones se guardan en el navegador de cada usuario, no en el servidor.

## Requisitos

- Node.js 18 o superior
- Una base de datos PostgreSQL
- Una clave de API de OpenRouter

## Puesta en marcha en local

```bash
npm install
cp .env.example .env.local     # y rellena los valores
npm run db:migrate             # crea las tablas
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). **El primer usuario que se
registre queda como administrador**; después, quien coincida con `ADMIN_EMAIL`.

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. Usa la versión *pooled* del proveedor. |
| `OPENROUTER_API_KEY` | Clave de OpenRouter de la instalación. Solo la usa el servidor. |
| `ADMIN_EMAIL` | Correo que recibe el rol de administrador al registrarse. |
| `DEFAULT_MONTHLY_LIMIT` | Mensajes al mes de cada cuenta nueva. Por defecto, 8. |
| `REGISTRATION_OPEN` | `false` cierra el registro público. |
| `OPENROUTER_MAX_TOKENS` | Tope de tokens por respuesta. Por defecto, 2000. |
| `PUBLIC_URL` | URL pública, para las estadísticas de OpenRouter. |

## Despliegue

La app necesita servidor: hay autenticación, base de datos y llamadas con la
clave de la instalación. No se puede servir como sitio estático, así que un
hosting por FTP no vale.

**Base de datos en Neon, aplicación en Vercel.** Se descartó poner la base en
el hosting compartido: solo ofrece MySQL, y para que Vercel llegue a ella
habría que abrirla a cualquier IP de internet, porque las funciones sin
servidor no tienen IP fija. La alternativa coherente para tenerlo todo en un
mismo sitio es un VPS con Node y PostgreSQL en la misma máquina.

1. Crea una base de datos en [Neon](https://neon.tech) y copia la cadena de
   conexión **pooled**.
2. Aplica el esquema, una sola vez:
   `DATABASE_URL="la-cadena-de-neon" npm run db:migrate`
3. Importa el repositorio en [Vercel](https://vercel.com) y añade las
   variables `DATABASE_URL`, `OPENROUTER_API_KEY` y `ADMIN_EMAIL`. El resto
   tienen valores por defecto razonables.
4. Añade el dominio en Vercel y apunta ahí el DNS del subdominio.
5. Abre `/api/salud`: dice si la base de datos y la clave están bien puestas.
   Debe responder `{"ok": true}`.
6. Regístrate el primero: el primer usuario queda como administrador.

### Comprobar una instalación

`GET /api/salud` devuelve 200 si todo está en su sitio y 503 con la lista de
problemas si falta algo. No expone ningún valor de configuración, solo si está
presente o no.

## Estructura

```
src/
├── app/
│   ├── page.tsx              # Chat (exige sesión)
│   ├── entrar/ registro/     # Acceso y alta
│   ├── admin/                # Panel de usuarios
│   └── api/
│       ├── auth/             # registro, entrar, salir
│       ├── chat/             # cuota + llamada a OpenRouter
│       ├── salud/            # diagnóstico de la instalación
│       └── admin/usuarios/   # listado y edición
├── components/               # Chat, TaskSelector, AuthForm, AdminUsers…
├── config/models.ts          # Catálogo de modelos y tareas
└── lib/
    ├── auth.ts               # Contraseñas, sesiones y cuota
    ├── db.ts                 # Pool de PostgreSQL
    ├── openrouter.ts         # Cliente de OpenRouter (solo servidor)
    └── storage.ts            # Historial en el navegador
db/schema.sql                 # Esquema, idempotente
```

Para añadir o cambiar modelos y tareas, edita `src/config/models.ts`. Cada tarea
usa el primer modelo de su lista.

## Comprobaciones

```bash
npm run lint
npm run build
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL
