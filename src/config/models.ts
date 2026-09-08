import type { TaskIconName } from "@/components/icons";

// Base de los artículos del blog. Cada modelo enlaza a su ficha en la web
// pública; si cambia la estructura de URLs, se cambia aquí y en ningún otro
// sitio. Un modelo sin `slug` simplemente no muestra enlace.
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
// un ID inexistente hace que la sección entera falle al enviar.
export const MODELS: Record<string, ModelConfig> = {
  "deepseek/deepseek-chat": {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description:
      "El todoterreno. Escribe bien en español y cuesta poco para lo que da. Si no sabes cuál elegir, este.",
    contextTokens: 163_840,
    tier: "equilibrado",
    slug: "deepseek-v3"
  },
  "deepseek/deepseek-r1": {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description:
      "Razona paso a paso antes de responder. Tarda más y cuesta más, así que úsalo cuando el problema lo merezca. Su contexto es el más corto del grupo.",
    contextTokens: 64_000,
    tier: "premium",
    slug: "deepseek-r1"
  },
  "qwen/qwen-plus": {
    id: "qwen/qwen-plus",
    name: "Qwen Plus",
    provider: "Alibaba",
    description:
      "Un millón de tokens de contexto por muy poco dinero. El más versátil del catálogo: sirve igual para redactar, traducir textos largos o estructurar ideas.",
    contextTokens: 1_000_000,
    tier: "equilibrado",
    slug: "qwen-plus"
  },
  "qwen/qwen3-coder": {
    id: "qwen/qwen3-coder",
    name: "Qwen3 Coder",
    provider: "Alibaba",
    description:
      "Especializado en código, con contexto de sobra para leer un proyecto entero. La mejor relación calidad-precio para programar.",
    contextTokens: 262_144,
    tier: "equilibrado",
    slug: "qwen3-coder"
  },
  "qwen/qwen3-32b": {
    id: "qwen/qwen3-32b",
    name: "Qwen3 32B",
    provider: "Alibaba",
    description:
      "Modelo abierto y barato para tareas cotidianas. Si el texto no es complicado, ahorra bastante frente a los grandes.",
    contextTokens: 131_072,
    tier: "economico",
    slug: "qwen3-32b"
  },
  "z-ai/glm-4.5": {
    id: "z-ai/glm-4.5",
    name: "GLM 4.5",
    provider: "Z.AI",
    description:
      "Tono cuidado y buena prosa. Se defiende bien cuando el texto tiene que sonar natural más que ser exacto.",
    contextTokens: 131_072,
    tier: "premium",
    slug: "glm-4-5"
  },
  "z-ai/glm-4.6": {
    id: "z-ai/glm-4.6",
    name: "GLM 4.6",
    provider: "Z.AI",
    description:
      "La evolución del 4.5: bastante más contexto por un precio parecido. Cómodo para documentos largos.",
    contextTokens: 204_800,
    tier: "premium",
    slug: "glm-4-6"
  },
  "z-ai/glm-5": {
    id: "z-ai/glm-5",
    name: "GLM 5",
    provider: "Z.AI",
    description:
      "Generalista de nueva hornada, fuerte en código y en seguir instrucciones largas sin perderse.",
    contextTokens: 204_800,
    tier: "equilibrado",
    slug: "glm-5"
  },
  "z-ai/glm-5.2": {
    id: "z-ai/glm-5.2",
    name: "GLM 5.2",
    provider: "Z.AI",
    description:
      "Un millón de tokens y razonamiento potente. Es de los más caros del catálogo: resérvalo para lo que de verdad lo necesite.",
    contextTokens: 1_048_576,
    tier: "premium",
    slug: "glm-5-2"
  },
  "minimax/minimax-m2": {
    id: "minimax/minimax-m2",
    name: "MiniMax M2",
    provider: "MiniMax",
    description:
      "Rápido y barato para su tamaño. Buena opción cuando quieres varias versiones de un texto sin gastar mucho.",
    contextTokens: 204_800,
    tier: "equilibrado",
    slug: "minimax-m2"
  },
  "minimax/minimax-m2-her": {
    id: "minimax/minimax-m2-her",
    name: "MiniMax M2-her",
    provider: "MiniMax",
    description:
      "Entrenado para escritura creativa y diálogo con personaje. El que menos suena a informe de los del catálogo.",
    contextTokens: 65_536,
    tier: "equilibrado",
    slug: "minimax-m2-her"
  },
  "minimax/minimax-m1": {
    id: "minimax/minimax-m1",
    name: "MiniMax M1",
    provider: "MiniMax",
    description:
      "Razonamiento con un millón de tokens de contexto. Para problemas largos que además hay que pensar.",
    contextTokens: 1_000_000,
    tier: "premium",
    slug: "minimax-m1"
  },
  "moonshotai/kimi-k2-0905": {
    id: "moonshotai/kimi-k2-0905",
    name: "Kimi K2",
    provider: "Moonshot AI",
    description:
      "La referencia en documentos largos: mantiene el hilo a lo largo de cientos de páginas sin olvidar el principio.",
    contextTokens: 262_144,
    tier: "premium",
    slug: "kimi-k2"
  },
  "moonshotai/kimi-k2-thinking": {
    id: "moonshotai/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    provider: "Moonshot AI",
    description:
      "Kimi con razonamiento explícito. Piensa antes de contestar y sostiene análisis largos y encadenados.",
    contextTokens: 262_144,
    tier: "premium",
    slug: "kimi-k2-thinking"
  },
  "moonshotai/kimi-k2.7-code": {
    id: "moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    provider: "Moonshot AI",
    description:
      "El más capaz para código difícil, y también el más caro de los de programar. Para cuando los otros no dan.",
    contextTokens: 262_144,
    tier: "premium",
    slug: "kimi-k2-7-code"
  },
  "tencent/hy-mt2-30b-a3b": {
    id: "tencent/hy-mt2-30b-a3b",
    name: "Hunyuan MT2 30B",
    provider: "Tencent",
    description:
      "Traductor dedicado, muy fino en chino-español-inglés y baratísimo. Ojo: solo admite unas 6.000 palabras por conversación.",
    contextTokens: 8_192,
    tier: "economico",
    slug: "tencent-hunyuan-mt2"
  },
  "tencent/hy-mt2-7b": {
    id: "tencent/hy-mt2-7b",
    name: "Hunyuan MT2 7B",
    provider: "Tencent",
    description:
      "El hermano pequeño del traductor: más rápido y algo menos preciso. Mismo límite de texto corto.",
    contextTokens: 8_192,
    tier: "economico",
    slug: "tencent-hunyuan-mt2-7b"
  },
  "tencent/hy3": {
    id: "tencent/hy3",
    name: "Hunyuan 3",
    provider: "Tencent",
    description:
      "Generalista muy barato con contexto amplio. Buen comodín cuando el volumen importa más que el matiz.",
    contextTokens: 262_144,
    tier: "economico",
    slug: "tencent-hunyuan-3"
  },
  "stepfun/step-3.5-flash": {
    id: "stepfun/step-3.5-flash",
    name: "Step 3.5 Flash",
    provider: "StepFun",
    description:
      "Contexto largo a precio de saldo. Ideal para resumir mucho material cuando no hace falta un análisis fino.",
    contextTokens: 262_144,
    tier: "economico",
    slug: "step-3-5-flash"
  },
  "inclusionai/ling-3.0-flash": {
    id: "inclusionai/ling-3.0-flash",
    name: "Ling 3.0 Flash",
    provider: "InclusionAI",
    description:
      "El más barato del catálogo, con diferencia, y aun así con contexto amplio. Perfecto para borradores y pruebas.",
    contextTokens: 262_144,
    tier: "economico",
    slug: "ling-3-0-flash"
  },
  "meituan/longcat-2.0": {
    id: "meituan/longcat-2.0",
    name: "LongCat 2.0",
    provider: "Meituan",
    description:
      "Un millón de tokens a precio contenido. Pensado para tareas largas encadenadas y trabajo con herramientas.",
    contextTokens: 1_048_756,
    tier: "equilibrado",
    slug: "longcat-2-0"
  },
  "kwaipilot/kat-coder-pro-v2.5": {
    id: "kwaipilot/kat-coder-pro-v2.5",
    name: "KAT Coder Pro",
    provider: "Kuaishou",
    description:
      "Alternativa seria para programar, con buen criterio al refactorizar. Cuesta más que Qwen3 Coder.",
    contextTokens: 262_144,
    tier: "premium",
    slug: "kat-coder-pro"
  },
  "bytedance-seed/seed-2.0-code": {
    id: "bytedance-seed/seed-2.0-code",
    name: "Seed 2.0 Code",
    provider: "ByteDance",
    description:
      "El modelo de código de ByteDance. Va bien en proyectos grandes, y es el más caro de esta sección.",
    contextTokens: 262_144,
    tier: "premium",
    slug: "seed-2-0-code"
  }
};

export const TASKS: TaskConfig[] = [
  {
    id: "general",
    name: "Redacción general",
    description: "Escribir artículos, correos, informes o contenido general.",
    icon: "pencil",
    models: [
      "deepseek/deepseek-chat",
      "qwen/qwen-plus",
      "z-ai/glm-4.5",
      "qwen/qwen3-32b",
      "inclusionai/ling-3.0-flash"
    ]
  },
  {
    id: "programacion",
    name: "Programación",
    description: "Escribir, revisar y depurar código.",
    icon: "code",
    models: [
      "qwen/qwen3-coder",
      "moonshotai/kimi-k2.7-code",
      "z-ai/glm-5",
      "kwaipilot/kat-coder-pro-v2.5",
      "bytedance-seed/seed-2.0-code"
    ]
  },
  {
    id: "analisis",
    name: "Análisis de documentos",
    description: "Resumir y analizar documentos largos.",
    icon: "document",
    models: [
      "moonshotai/kimi-k2-0905",
      "qwen/qwen-plus",
      "z-ai/glm-4.6",
      "stepfun/step-3.5-flash"
    ]
  },
  {
    id: "creatividad",
    name: "Creatividad y diseño",
    description: "Generar ideas creativas, historias o contenido original.",
    icon: "sparkle",
    models: ["minimax/minimax-m2-her", "z-ai/glm-4.5", "minimax/minimax-m2"]
  },
  {
    id: "traduccion",
    name: "Traducción",
    description: "Traducir textos entre múltiples idiomas.",
    icon: "globe",
    models: [
      "tencent/hy-mt2-30b-a3b",
      "tencent/hy-mt2-7b",
      "qwen/qwen-plus",
      "z-ai/glm-4.5"
    ]
  },
  {
    id: "calculo",
    name: "Cálculo y razonamiento",
    description: "Resolver problemas complejos y razonar paso a paso.",
    icon: "calculator",
    models: [
      "deepseek/deepseek-r1",
      "moonshotai/kimi-k2-thinking",
      "z-ai/glm-5.2",
      "minimax/minimax-m1"
    ]
  },
  {
    id: "presentaciones",
    name: "Presentaciones",
    description: "Estructurar ideas y crear contenido para presentaciones.",
    icon: "presentation",
    models: [
      "qwen/qwen-plus",
      "z-ai/glm-4.5",
      "meituan/longcat-2.0",
      "tencent/hy3"
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
