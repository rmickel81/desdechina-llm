// Cliente de OpenRouter. Solo se usa desde el servidor: la clave es de la
// instalación, nunca del navegador, y por eso no debe importarse en un
// componente de cliente.
/**
 * Un mensaje puede ser texto suelto o una lista de partes cuando lleva
 * imagen. OpenRouter usa aquí el mismo formato que la API de OpenAI: la
 * imagen viaja como `data:` URL dentro de `image_url`.
 */
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface OpenRouterMessage {
  role: 'user' | 'assistant';
  content: string | ContentPart[];
}

interface OpenRouterResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export interface CompletionResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

const MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS ?? 2000);
const BASE_URL = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';

export async function createCompletion(
  model: string,
  messages: OpenRouterMessage[],
): Promise<CompletionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError('El servicio no está configurado.', 500);
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.PUBLIC_URL ?? 'https://llm.desdechina.es',
      'X-Title': 'DesdeChina LLM',
    },
    body: JSON.stringify({ model, messages, max_tokens: MAX_TOKENS }),
  });

  if (!response.ok) {
    // El cuerpo del error puede incluir detalles de la cuenta de OpenRouter,
    // así que se registra en el servidor y al usuario le llega algo genérico.
    console.error('OpenRouter respondió %d: %s', response.status, await response.text());
    throw new OpenRouterError(
      response.status === 429
        ? 'El servicio está saturado ahora mismo. Inténtalo en un minuto.'
        : 'El modelo no ha podido responder. Inténtalo de nuevo.',
      502,
    );
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || content.length === 0) {
    throw new OpenRouterError('El modelo ha devuelto una respuesta vacía.', 502);
  }

  return {
    content,
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
  };
}
