import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, getMonthlyUsage } from '@/lib/auth';
import { createCompletion, OpenRouterError, type OpenRouterMessage } from '@/lib/openrouter';
import { TASKS } from '@/config/models';

// Topes de la petición. La clave la paga la instalación, así que conviene
// acotar cuánto contexto puede mandar un usuario en cada mensaje.
const MAX_MESSAGES = 40;
const MAX_CHARS = 24000;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Necesitas iniciar sesión.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const { taskId, model: requestedModel, messages } = body as Record<string, unknown>;

  const task = TASKS.find((t) => t.id === taskId);
  if (!task) {
    return NextResponse.json({ error: 'Tarea desconocida.' }, { status: 400 });
  }

  // El modelo llega del navegador, así que solo se acepta si pertenece a la
  // sección pedida: nadie puede colar por aquí un modelo más caro.
  const model =
    requestedModel === undefined
      ? task.models[0]
      : task.models.find((id) => id === requestedModel);

  if (!model) {
    return NextResponse.json(
      { error: 'Ese modelo no está disponible en esta sección.' },
      { status: 400 },
    );
  }

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: 'La conversación no es válida.' }, { status: 400 });
  }

  const clean: OpenRouterMessage[] = [];
  let totalChars = 0;
  for (const message of messages) {
    const { role, content } = (message ?? {}) as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'La conversación no es válida.' }, { status: 400 });
    }
    totalChars += content.length;
    if (totalChars > MAX_CHARS) {
      return NextResponse.json(
        { error: 'La conversación es demasiado larga. Empieza una nueva.' },
        { status: 413 },
      );
    }
    clean.push({ role, content });
  }

  const used = await getMonthlyUsage(user.id);
  if (used >= user.monthly_limit) {
    return NextResponse.json(
      {
        error: `Has agotado tus ${user.monthly_limit} mensajes de este mes.`,
        usage: { used, limit: user.monthly_limit },
      },
      { status: 429 },
    );
  }

  try {
    const result = await createCompletion(model, clean);

    await query(
      `insert into usage_events (user_id, task_id, model, prompt_tokens, completion_tokens)
       values ($1, $2, $3, $4, $5)`,
      [user.id, task.id, model, result.promptTokens, result.completionTokens],
    );

    return NextResponse.json({
      content: result.content,
      usage: { used: used + 1, limit: user.monthly_limit },
    });
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Fallo inesperado en /api/chat', error);
    return NextResponse.json({ error: 'Error inesperado del servidor.' }, { status: 500 });
  }
}
