# DesdeChina LLM

Interfaz web para trabajar con los mejores modelos de IA china (DeepSeek, Qwen, Kimi,
GLM, MiniMax, Tencent) usando tu propia API key de [OpenRouter](https://openrouter.ai).

La app selecciona automáticamente el modelo más adecuado según la tarea que elijas
(redacción, programación, análisis de documentos, creatividad, traducción, cálculo
y presentaciones).

## Requisitos previos

- Node.js 18 o superior
- Una cuenta en [OpenRouter](https://openrouter.ai) para obtener tu API key

## Instalación y ejecución en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Cómo usarlo

1. Pulsa **⚙️ Configuración**.
2. Introduce tu API key de OpenRouter (`sk-or-...`) y guarda.
3. Elige una tarea (por ejemplo, *Redacción general*).
4. Escribe tu mensaje y pulsa **Enviar** (o `Enter`; `Shift+Enter` hace un salto de línea).

Tu API key y el historial de conversación se guardan **solo en el `localStorage` de tu
navegador**: no se envían a ningún servidor propio. Las peticiones van directamente
desde tu navegador a la API de OpenRouter.

Al cambiar de tarea se limpia el historial, porque cada tarea usa un modelo distinto.

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx        # Layout raíz y metadatos
│   ├── page.tsx          # Página principal
│   └── globals.css       # Estilos globales (Tailwind CSS)
├── components/
│   ├── Chat.tsx          # Chat: mensajes, envío y estado
│   ├── TaskSelector.tsx  # Selector de tareas
│   └── SettingsModal.tsx # Modal de configuración de la API key
├── config/
│   └── models.ts         # Catálogo de modelos y tareas
└── lib/
    ├── storage.ts        # Acceso a localStorage (API key e historial)
    └── openrouter.ts     # Cliente de la API de OpenRouter
```

Para añadir o cambiar modelos y tareas, edita `src/config/models.ts`. Cada tarea usa
el primer modelo de su lista `models`.

## Comprobaciones

```bash
npm run lint     # ESLint
npm run build    # Build de producción (incluye comprobación de tipos)
```

## Despliegue en Vercel

```bash
npm run build
vercel deploy
```

O conecta el repositorio de GitHub a Vercel para el despliegue automático. No hace
falta configurar variables de entorno: cada usuario introduce su propia API key.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
