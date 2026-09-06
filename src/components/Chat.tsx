'use client';

import { useEffect, useRef, useState } from 'react';
import { TASKS } from '@/config/models';
import { sendMessage } from '@/lib/openrouter';
import { getApiKey, getHistory, saveHistory, clearHistory } from '@/lib/storage';
import TaskSelector from './TaskSelector';
import SettingsModal from './SettingsModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [selectedTask, setSelectedTask] = useState<string>(TASKS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState('');
  const isHistoryLoaded = useRef(false);

  // El historial vive en localStorage, que solo existe en el cliente: se carga
  // tras el montaje para que el HTML del servidor y el del cliente coincidan.
  useEffect(() => {
    const history = getHistory();
    if (history.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronización inicial con localStorage
      setMessages(history);
    }
    isHistoryLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!isHistoryLoaded.current) return;
    saveHistory(messages);
  }, [messages]);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
    setMessages([]);
    clearHistory();
  };

  const handleSend = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Por favor, introduce tu API key de OpenRouter en Configuración.');
      setIsSettingsOpen(true);
      return;
    }
    if (!input.trim()) return;

    const newMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const task = TASKS.find((t) => t.id === selectedTask)!;
      const model = task.models[0];
      const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendMessage(apiKey, model, apiMessages);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con OpenRouter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600 dark:text-red-400">
          DesdeChina LLM
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          ⚙️ Configuración
        </button>
      </header>

      <TaskSelector selectedTask={selectedTask} onSelectTask={handleTaskSelect} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-4">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-3xl mx-auto p-4 rounded-xl ${
              msg.role === 'user'
                ? 'bg-gray-100 dark:bg-gray-800 ml-auto'
                : 'bg-blue-50 dark:bg-gray-700 mr-auto'
            }`}
          >
            <div className="font-semibold mb-1">
              {msg.role === 'user' ? 'Tú' : 'IA China'}
            </div>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="max-w-3xl mx-auto p-4 text-gray-500">
            Pensando...
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe tu mensaje..."
            rows={2}
            className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
