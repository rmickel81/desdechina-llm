import type { TaskIconName } from "@/components/icons";

// Base de los artículos del blog. Cada modelo enlaza a su ficha en la web
// pública; si cambia la estructura de URLs, se cambia aquí y en ningún otro
// sitio. Los slugs de cada modelo están más abajo.
export const MODEL_ARTICLE_BASE = "https://desdechina.es/modelos";

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  /** Slug del artículo en desdechina.es que explica este modelo. */
  slug: string;
}

export interface TaskConfig {
  id: string;
  name: string;
  description: string;
  icon: TaskIconName;
  /** El primero de la lista es el que se usa por defecto en esta sección. */
  models: string[];
}

export const MODELS: Record<string, ModelConfig> = {
  "deepseek/deepseek-chat": {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Modelo general de DeepSeek. Excelente relación calidad-precio.",
    slug: "deepseek-v3"
  },
  "deepseek/deepseek-coder": {
    id: "deepseek/deepseek-coder",
    name: "DeepSeek Coder",
    provider: "DeepSeek",
    description: "Especializado en programación y tareas técnicas.",
    slug: "deepseek-coder"
  },
  "deepseek/deepseek-r1": {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Razonamiento complejo y resolución de problemas.",
    slug: "deepseek-r1"
  },
  "qwen/qwen-plus": {
    id: "qwen/qwen-plus",
    name: "Qwen Plus",
    provider: "Alibaba",
    description: "Modelo versátil de Alibaba. Bueno en múltiples idiomas.",
    slug: "qwen-plus"
  },
  "qwen/qwen-coder": {
    id: "qwen/qwen-coder",
    name: "Qwen Coder",
    provider: "Alibaba",
    description: "Especializado en código y desarrollo de software.",
    slug: "qwen-coder"
  },
  "moonshotai/kimi-k2": {
    id: "moonshotai/kimi-k2",
    name: "Kimi K2",
    provider: "Moonshot AI",
    description: "Contexto ultralargo para documentos extensos.",
    slug: "kimi-k2"
  },
  "z-ai/glm-4.5": {
    id: "z-ai/glm-4.5",
    name: "GLM 4.5",
    provider: "Z.AI",
    description: "Modelo general con buena relación calidad-precio.",
    slug: "glm-4-5"
  },
  "z-ai/glm-4.6": {
    id: "z-ai/glm-4.6",
    name: "GLM 4.6",
    provider: "Z.AI",
    description: "Contexto largo y buen rendimiento general.",
    slug: "glm-4-6"
  },
  "minimax/minimax-m2-her": {
    id: "minimax/minimax-m2-her",
    name: "MiniMax M2-her",
    provider: "MiniMax",
    description: "Especializado en escritura creativa y roleplay.",
    slug: "minimax-m2"
  },
  "tencent/hy-mt2-7b": {
    id: "tencent/hy-mt2-7b",
    name: "Tencent Hy-MT2",
    provider: "Tencent",
    description: "Traducción automática multilingüe.",
    slug: "tencent-hunyuan-mt2"
  },
  "moonshotai/kimi-k2-thinking": {
    id: "moonshotai/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    provider: "Moonshot AI",
    description: "Razonamiento complejo y análisis profundo.",
    slug: "kimi-k2-thinking"
  }
};

export const TASKS: TaskConfig[] = [
  {
    id: "general",
    name: "Redacción general",
    description: "Escribir artículos, correos, informes o contenido general.",
    icon: "pencil",
    models: ["deepseek/deepseek-chat", "qwen/qwen-plus", "z-ai/glm-4.5"]
  },
  {
    id: "programacion",
    name: "Programación",
    description: "Escribir, revisar y depurar código.",
    icon: "code",
    models: ["deepseek/deepseek-coder", "qwen/qwen-coder", "moonshotai/kimi-k2"]
  },
  {
    id: "analisis",
    name: "Análisis de documentos",
    description: "Resumir y analizar documentos largos.",
    icon: "document",
    models: ["moonshotai/kimi-k2", "z-ai/glm-4.6"]
  },
  {
    id: "creatividad",
    name: "Creatividad y diseño",
    description: "Generar ideas creativas, historias o contenido original.",
    icon: "sparkle",
    models: ["minimax/minimax-m2-her", "z-ai/glm-4.5"]
  },
  {
    id: "traduccion",
    name: "Traducción",
    description: "Traducir textos entre múltiples idiomas.",
    icon: "globe",
    models: ["tencent/hy-mt2-7b", "qwen/qwen-plus", "z-ai/glm-4.5"]
  },
  {
    id: "calculo",
    name: "Cálculo y razonamiento",
    description: "Resolver problemas complejos y razonar paso a paso.",
    icon: "calculator",
    models: ["deepseek/deepseek-r1", "z-ai/glm-4.6", "moonshotai/kimi-k2-thinking"]
  },
  {
    id: "presentaciones",
    name: "Presentaciones",
    description: "Estructurar ideas y crear contenido para presentaciones.",
    icon: "presentation",
    models: ["qwen/qwen-plus", "z-ai/glm-4.5"]
  }
];

/** Modelos que ofrece una sección, ya resueltos. */
export function modelsForTask(task: TaskConfig): ModelConfig[] {
  return task.models.map((id) => MODELS[id]).filter(Boolean);
}

/** Enlace a la ficha del modelo en la web pública. */
export function articleUrl(model: ModelConfig): string {
  return `${MODEL_ARTICLE_BASE}/${model.slug}`;
}
