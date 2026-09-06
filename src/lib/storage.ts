export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const getApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('openrouter_api_key') || '';
};

export const setApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('openrouter_api_key', key);
};

export const getHistory = (): StoredMessage[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('chat_history');
  if (!data) return [];
  try {
    return JSON.parse(data) as StoredMessage[];
  } catch {
    return [];
  }
};

export const saveHistory = (messages: StoredMessage[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('chat_history', JSON.stringify(messages));
};

export const clearHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('chat_history');
};
