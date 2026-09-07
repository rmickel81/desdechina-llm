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
| `DEFAULT_MONTHLY_LIMIT` | Mensajes al mes de cada cuenta nueva. Por defecto, 50. |
| `REGISTRATION_OPEN` | `false` cierra el registro público. |
| `OPENROUTER_MAX_TOKENS` | Tope de tokens por respuesta. Por defecto, 2000. |
| `PUBLIC_URL` | URL pública, para las estadísticas de OpenRouter. |

## Despliegue

La app necesita servidor: hay autenticación, base de datos y llamadas con la
clave de la instalación. No se puede servir como sitio estático.

1. Crea una base de datos PostgreSQL (Neon y Supabase tienen plan gratuito).
2. Importa el repositorio en [Vercel](https://vercel.com) y añade las variables
   de la tabla anterior.
3. Aplica el esquema una vez: `DATABASE_URL="..." npm run db:migrate`.
4. Añade el dominio en Vercel y apunta el DNS del subdominio.
5. Regístrate el primero para quedarte como administrador.

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
