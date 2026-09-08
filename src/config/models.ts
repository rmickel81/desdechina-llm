import type { TaskIconName } from "@/components/icons";

// Base de los artículos del blog. Cada modelo enlaza a su ficha en la web
// pública; si cambia la estructura de URLs, se cambia aquí y en ningún otro
// sitio. Un modelo sin `slug` simplemente no muestra enlace: es lo que pasa
// mientras su ficha está sin escribir, y evita enlazar a un 404.
export const MODEL_ARTICLE_BASE = "https://desdechina.es/modelos";

/**
 * Franja de coste, no precio exacto: los precios de OpenRouter cambian y una
 * cifra desactualizada engaña más que orienta.
 * economico ≈ menos de 0,60 $ por millón de tokens de salida
 * equilibrado ≈ entre 0,60 y 2 $
 * premium ≈ más de 2 $
 */
export type CostTier = "economico" | "equilibrado" | "premium";

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  /** Para qué es bueno y, sobre todo, cuándo conviene elegirlo. */
  description: string;
  /** Ventana de contexto en tokens, del catálogo de OpenRouter. */
  contextTokens: number;
  tier: CostTier;
  /**
   * Si acepta imágenes de entrada. Sale de `architecture.input_modalities`
   * en OpenRouter: mandarle una imagen a un modelo que no la acepta es un
   * error de la API, así que el chat solo deja adjuntar cuando esto es true.
   */
  acceptsImages: boolean;
  /** Slug del artículo en desdechina.es. Sin él, no se muestra enlace. */
  slug?: string;
}

export interface TaskConfig {
  id: string;
  name: string;
  description: string;
  icon: TaskIconName;
  /** El primero de la lista es el que se usa por defecto en esta sección. */
  models: string[];
}

// Todos los IDs de este catálogo están verificados contra
// https://openrouter.ai/api/v1/models — si añades uno, compruébalo antes:
// un ID inexistente hace que la sección entera falle al enviar. `npm run
// check:models` lo comprueba, y avisa además cuando un modelo se queda una
// generación por detrás de lo que publica su fabricante.
export const MODELS: Record<string, ModelConfig> = {
  "deepseek/deepseek-v4-flash": {
    id: "deepseek/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    provider: "DeepSeek",
    description:
      "La cuarta generación de DeepSeek en su versión rápida. Un contexto enorme por céntimos: el que dejo puesto cuando no hay una razón para otro.",
    contextTokens: 1_048_576,
    tier: "economico",
    acceptsImages: false
  },
  "deepseek/deepseek-v4-pro": {
    id: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    provider: "DeepSeek",
    description:
      "La versión seria de la V4. Razona antes de responder y cuesta bastante más que la Flash, así que se guarda para cuando el problema lo pide.",
    contextTokens: 1_048_576,
    tier: "equilibrado",
    acceptsImages: false
  },
  "deepseek/deepseek-v4-flash-vision-exp": {
    id: "deepseek/deepseek-v4-flash-vision-exp",
    name: "DeepSeek V4 Flash Visión",
    provider: "DeepSeek",
    description:
      "La V4 Flash con vista. Marcada como experimental por la propia DeepSeek, así que va bien para probar y no para trabajo que no puedas revisar.",
    contextTokens: 1_048_576,
    tier: "equilibrado",
    acceptsImages: true
  },
  "qwen/qwen3.7-plus": {
    id: "qwen/qwen3.7-plus",
    name: "Qwen3.7 Plus",
    provider: "Alibaba",
    description:
      "El equilibrado de Alibaba: un millón de tokens, acepta imágenes y no se va de precio. Buen todoterreno cuando hay material largo de por medio.",
    contextTokens: 1_000_000,
    tier: "equilibrado",
    acceptsImages: true
  },
  "qwen/qwen3.8-flash": {
    id: "qwen/qwen3.8-flash",
    name: "Qwen3.8 Flash",
    provider: "Alibaba",
    description:
      "Lo último de Alibaba en versión rápida y barata, con un millón de tokens y visión. Muy buena relación entre lo que cabe y lo que cuesta.",
    contextTokens: 1_000_000,
    tier: "economico",
    acceptsImages: true
  },
  "qwen/qwen3.8-max-0902": {
    id: "qwen/qwen3.8-max-0902",
    name: "Qwen3.8 Max",
    provider: "Alibaba",
    description:
      "El tope de gama de Alibaba, del 2 de septiembre. Caro: úsalo cuando la respuesta importe de verdad, no para el día a día.",
    contextTokens: 1_000_000,
    tier: "premium",
    acceptsImages: true
  },
  "qwen/qwen3-coder-next": {
    id: "qwen/qwen3-coder-next",
    name: "Qwen3 Coder Next",
    provider: "Alibaba",
    description:
      "Especializado en programar y muy barato para lo que hace. El que dejo puesto en esa sección.",
    contextTokens: 262_144,
    tier: "equilibrado",
    acceptsImages: false
  },
  "qwen/qwen3-max-thinking": {
    id: "qwen/qwen3-max-thinking",
    name: "Qwen3 Max Thinking",
    provider: "Alibaba",
    description:
      "Desarrolla el problema por dentro antes de contestar. Para cálculos con etapas y lógica encadenada.",
    contextTokens: 262_144,
    tier: "premium",
    acceptsImages: false
  },
  "z-ai/glm-5.3": {
    id: "z-ai/glm-5.3",
    name: "GLM 5.3",
    provider: "Z.AI",
    description:
      "El grande de Z.AI: 1,3 millones de tokens y razonamiento. Es de los caros del catálogo, y se nota en lo que resuelve.",
    contextTokens: 1_310_720,
    tier: "premium",
    acceptsImages: false
  },
  "z-ai/glm-5.3-flash": {
    id: "z-ai/glm-5.3-flash",
    name: "GLM 5.3 Flash",
    provider: "Z.AI",
    description:
      "1,3 millones de tokens, visión y precio de modelo barato. Es la mejor relación del catálogo entre lo que cabe y lo que cuesta.",
    contextTokens: 1_310_720,
    tier: "economico",
    acceptsImages: true
  },
  "inclusionai/ling-3.0-flash": {
    id: "inclusionai/ling-3.0-flash",
    name: "Ling 3.0 Flash",
    provider: "InclusionAI",
    description:
      "El más barato de todo el catálogo, y no por poco. Para volumen: muchas tareas pequeñas y parecidas.",
    contextTokens: 262_144,
    tier: "economico",
    acceptsImages: false,
    slug: "ling-3-0-flash"
  },
  "bytedance-seed/seed-2.0-code": {
    id: "bytedance-seed/seed-2.0-code",
    name: "Seed 2.0 Code",
    provider: "ByteDance",
    description:
      "Programación con entrada contenida y salida cara: rinde cuando le das mucho código y le pides respuestas cortas.",
    contextTokens: 262_144,
    tier: "premium",
    acceptsImages: true,
    slug: "seed-2-0-code"
  },
  "bytedance-seed/seed-2-1-turbo": {
    id: "bytedance-seed/seed-2-1-turbo",
    name: "Seed 2.1 Turbo",
    provider: "ByteDance",
    description:
      "La evolución del anterior: mismo contexto, algo más barato en salida y acepta imágenes.",
    contextTokens: 262_144,
    tier: "premium",
    acceptsImages: true
  },
  "bytedance-seed/seed-1.6-flash": {
    id: "bytedance-seed/seed-1.6-flash",
    name: "Seed 1.6 Flash",
    provider: "ByteDance",
    description:
      "Multimodal y muy barato. Bien para mirar imágenes en cantidad sin que la factura se note.",
    contextTokens: 262_144,
    tier: "economico",
    acceptsImages: true
  },
  "bytedance-seed/seed-2.0-lite": {
    id: "bytedance-seed/seed-2.0-lite",
    name: "Seed 2.0 Lite",
    provider: "ByteDance",
    description:
      "La versión ligera de la familia Seed 2.0, con visión. Un escalón por debajo de los grandes en precio y en resultado.",
    contextTokens: 262_144,
    tier: "equilibrado",
    acceptsImages: true
  },
  "moonshotai/kimi-k3": {
    id: "moonshotai/kimi-k3",
    name: "Kimi K3",
    provider: "Moonshot AI",
    description:
      "La tercera generación de Kimi. Es con diferencia el más caro del catálogo, así que conviene reservarlo para lo que de verdad no salga con otro.",
    contextTokens: 1_048_576,
    tier: "premium",
    acceptsImages: true
  },
  "moonshotai/kimi-k2.7-code": {
    id: "moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    provider: "Moonshot AI",
    description:
      "El caro de programación. Se paga por los encargos largos con muchos pasos, no por escribir una función suelta.",
    contextTokens: 262_144,
    tier: "premium",
    acceptsImages: true,
    slug: "kimi-k2-7-code"
  },
  "moonshotai/kimi-k2.5": {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "Moonshot AI",
    description:
      "El Kimi asequible: mismo contexto que los mayores y bastante menos precio. Buen punto de entrada a la familia.",
    contextTokens: 262_144,
    tier: "premium",
    acceptsImages: true
  },
  "kwaipilot/kat-coder-pro-v2.5": {
    id: "kwaipilot/kat-coder-pro-v2.5",
    name: "KAT Coder Pro",
    provider: "Kuaishou",
    description:
      "El modelo de programación de Kuaishou. Una alternativa de otra familia cuando los de siempre se atascan con el mismo problema.",
    contextTokens: 262_144,
    tier: "premium",
    acceptsImages: false,
    slug: "kat-coder-pro"
  },
  "stepfun/step-3.7-flash": {
    id: "stepfun/step-3.7-flash",
    name: "Step 3.7 Flash",
    provider: "StepFun",
    description:
      "Rápido, barato y con visión. Buen primer filtro para saber si un documento merece lectura seria.",
    contextTokens: 262_144,
    tier: "equilibrado",
    acceptsImages: true
  },
  "minimax/minimax-m3": {
    id: "minimax/minimax-m3",
    name: "MiniMax M3",
    provider: "MiniMax",
    description:
      "La generación actual de MiniMax: un millón de tokens y visión, al precio de siempre de la casa.",
    contextTokens: 1_048_576,
    tier: "equilibrado",
    acceptsImages: true
  },
  "minimax/minimax-m2-her": {
    id: "minimax/minimax-m2-her",
    name: "MiniMax M2-her",
    provider: "MiniMax",
    description:
      "El único del catálogo ajustado para que el texto tenga voz propia. Su ventana es la más pequeña, y esa es la contrapartida.",
    contextTokens: 65_536,
    tier: "equilibrado",
    acceptsImages: false,
    slug: "minimax-m2-her"
  },
  "minimax/minimax-m2.1": {
    id: "minimax/minimax-m2.1",
    name: "MiniMax M2.1",
    provider: "MiniMax",
    description:
      "La variante de MiniMax orientada a programar y a encadenar herramientas.",
    contextTokens: 204_800,
    tier: "equilibrado",
    acceptsImages: false
  },
  "tencent/hy-mt2-30b-a3b": {
    id: "tencent/hy-mt2-30b-a3b",
    name: "Hunyuan MT2 30B",
    provider: "Tencent",
    description:
      "El mejor traductor chino-español del catálogo, y de los más baratos que existen. Su límite es el tamaño, no la calidad.",
    contextTokens: 8_192,
    tier: "economico",
    acceptsImages: false,
    slug: "tencent-hunyuan-mt2"
  },
  "tencent/hy-mt2-7b": {
    id: "tencent/hy-mt2-7b",
    name: "Hunyuan MT2 7B",
    provider: "Tencent",
    description:
      "El hermano mediano del traductor de Tencent. Cuesta lo mismo que el grande, así que la razón para elegirlo es la velocidad.",
    contextTokens: 8_192,
    tier: "economico",
    acceptsImages: false,
    slug: "tencent-hunyuan-mt2-7b"
  },
  "tencent/hy-mt2-1.8b": {
    id: "tencent/hy-mt2-1.8b",
    name: "Hunyuan MT2 1.8B",
    provider: "Tencent",
    description:
      "El más pequeño y el más barato de los traductores de Tencent. Para tandas de textos muy cortos.",
    contextTokens: 8_192,
    tier: "economico",
    acceptsImages: false
  },
  "tencent/hy3": {
    id: "tencent/hy3",
    name: "Hunyuan 3",
    provider: "Tencent",
    description:
      "El generalista barato de Tencent: mucho contexto por céntimos. Muy buena relación entre lo que cuesta y lo que cabe.",
    contextTokens: 262_144,
    tier: "economico",
    acceptsImages: false,
    slug: "tencent-hunyuan-3"
  },
  "tencent/hunyuan-a13b-instruct": {
    id: "tencent/hunyuan-a13b-instruct",
    name: "Hunyuan A13B",
    provider: "Tencent",
    description:
      "Un generalista abierto de Tencent, económico y de contexto medio. Sirve de alternativa cuando quieres salir de las casas de siempre.",
    contextTokens: 131_072,
    tier: "economico",
    acceptsImages: false
  },
  "meituan/longcat-2.0": {
    id: "meituan/longcat-2.0",
    name: "LongCat 2.0",
    provider: "Meituan",
    description:
      "Un millón de tokens a precio contenido. Para partir de todo el material a la vez en lugar de resumirlo antes.",
    contextTokens: 1_048_756,
    tier: "equilibrado",
    acceptsImages: false,
    slug: "longcat-2-0"
  },
  "xiaomi/mimo-v2.5": {
    id: "xiaomi/mimo-v2.5",
    name: "MiMo V2.5",
    provider: "Xiaomi",
    description:
      "El multimodal de Xiaomi: un millón de tokens, imagen y audio, por céntimos. El más barato del catálogo que ve imágenes.",
    contextTokens: 1_050_000,
    tier: "economico",
    acceptsImages: true
  }
};

export const TASKS: TaskConfig[] = [
  {
    id: "general",
    name: "Redacción general",
    description: "Escribir artículos, correos, informes o contenido general.",
    icon: "pencil",
    models: [
      "deepseek/deepseek-v4-flash",
      "deepseek/deepseek-v4-pro",
      "qwen/qwen3.7-plus",
      "z-ai/glm-5.3-flash",
      "tencent/hunyuan-a13b-instruct",
      "inclusionai/ling-3.0-flash"
    ]
  },
  {
    id: "programacion",
    name: "Programación",
    description: "Escribir, revisar y depurar código.",
    icon: "code",
    models: [
      "qwen/qwen3-coder-next",
      "bytedance-seed/seed-2-1-turbo",
      "moonshotai/kimi-k2.7-code",
      "kwaipilot/kat-coder-pro-v2.5",
      "bytedance-seed/seed-2.0-code",
      "minimax/minimax-m2.1",
      "z-ai/glm-5.3"
    ]
  },
  {
    id: "analisis",
    name: "Análisis de documentos",
    description: "Resumir informes largos, contratos o actas y buscar datos dentro.",
    icon: "document",
    models: [
      "z-ai/glm-5.3-flash",
      "deepseek/deepseek-v4-flash",
      "moonshotai/kimi-k2.5",
      "qwen/qwen3.8-flash",
      "stepfun/step-3.7-flash",
      "moonshotai/kimi-k3"
    ]
  },
  {
    id: "creatividad",
    name: "Creatividad y diseño",
    description: "Nombres, eslóganes, guiones y textos donde el tono es el encargo.",
    icon: "sparkle",
    models: [
      "minimax/minimax-m3",
      "minimax/minimax-m2-her",
      "z-ai/glm-5.3",
      "qwen/qwen3.8-max-0902"
    ]
  },
  {
    id: "traduccion",
    name: "Traducción",
    description: "Traducir, sobre todo del chino, con nombres propios y cargos correctos.",
    icon: "globe",
    models: [
      "tencent/hy-mt2-30b-a3b",
      "tencent/hy-mt2-7b",
      "tencent/hy-mt2-1.8b",
      "qwen/qwen3.7-plus",
      "deepseek/deepseek-v4-flash"
    ]
  },
  {
    id: "calculo",
    name: "Cálculo y razonamiento",
    description: "Problemas con varias etapas, lógica encadenada y casos límite.",
    icon: "calculator",
    models: [
      "deepseek/deepseek-v4-pro",
      "qwen/qwen3-max-thinking",
      "z-ai/glm-5.3",
      "moonshotai/kimi-k3"
    ]
  },
  {
    id: "presentaciones",
    name: "Presentaciones",
    description: "Estructurar el guion de una presentación a partir de tu material.",
    icon: "presentation",
    models: [
      "qwen/qwen3.8-flash",
      "z-ai/glm-5.3-flash",
      "tencent/hy3",
      "meituan/longcat-2.0"
    ]
  },
  {
    id: "imagenes",
    name: "Imágenes y visión",
    description: "Adjuntar una imagen y preguntar por ella: leerla, describirla o sacar sus datos.",
    icon: "image",
    models: [
      "z-ai/glm-5.3-flash",
      "xiaomi/mimo-v2.5",
      "bytedance-seed/seed-1.6-flash",
      "deepseek/deepseek-v4-flash-vision-exp",
      "bytedance-seed/seed-2.0-lite",
      "qwen/qwen3.8-max-0902"
    ]
  }
];

/** Modelos que ofrece una sección, ya resueltos. */
export function modelsForTask(task: TaskConfig): ModelConfig[] {
  return task.models.map((id) => MODELS[id]).filter(Boolean);
}

/** Enlace a la ficha del modelo en la web pública, si tiene artículo. */
export function articleUrl(model: ModelConfig): string | null {
  return model.slug ? `${MODEL_ARTICLE_BASE}/${model.slug}` : null;
}

export const COST_LABEL: Record<CostTier, string> = {
  economico: "Económico",
  equilibrado: "Equilibrado",
  premium: "Premium"
};

/** 262144 → "262k", 1000000 → "1M" */
export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  return `${Math.round(tokens / 1000)}k`;
}
