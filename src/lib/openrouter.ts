export interface OpenRouterMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function sendMessage(
  apiKey: string,
  model: string,
  messages: OpenRouterMessage[]
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://nihao-europa.com',
      'X-Title': 'DesdeChina LLM'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as OpenRouterResponse;
  return data.choices[0].message.content;
}
