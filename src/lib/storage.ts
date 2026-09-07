// Las conversaciones siguen viviendo en el navegador. Se guardan bajo una
// clave por usuario para que dos cuentas en el mismo equipo no se mezclen.
export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
}

const historyKey = (userId: string) => `chat_history:${userId}`;

export const getHistory = (userId: string): StoredMessage[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(historyKey(userId));
  if (!data) return [];
  try {
    return JSON.parse(data) as StoredMessage[];
  } catch {
    return [];
  }
};

export const saveHistory = (userId: string, messages: StoredMessage[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(historyKey(userId), JSON.stringify(messages));
};

export const clearHistory = (userId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(historyKey(userId));
};
