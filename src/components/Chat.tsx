'use client';

import { useEffect, useRef, useState } from 'react';
import { MODELS, TASKS } from '@/config/models';
import { sendMessage } from '@/lib/openrouter';
import { getApiKey, getHistory, saveHistory, clearHistory } from '@/lib/storage';
import TaskSelector from './TaskSelector';
import SettingsModal from './SettingsModal';
import { ArrowUp, Settings, TaskIcon } from './icons';

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const task = TASKS.find((t) => t.id === selectedTask) ?? TASKS[0];
  const model = MODELS[task.models[0]];

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  // El campo crece con el texto hasta un máximo, como en Mensajes.
  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId);
    setMessages([]);
    setError('');
    clearHistory();
  };

  const handleSend = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Añade tu clave de API de OpenRouter para empezar.');
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
    requestAnimationFrame(resizeInput);

    try {
      const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendMessage(apiKey, task.models[0], apiMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido conectar con OpenRouter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-10 border-b border-hairline bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <h1 className="text-[17px] font-semibold tracking-tight">DesdeChina LLM</h1>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Ajustes"
            className="-mr-2 rounded-full p-2 text-ink-secondary transition-colors hover:bg-elevated hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            <Settings className="size-[19px]" />
          </button>
        </div>
      </header>

      <TaskSelector selectedTask={selectedTask} onSelectTask={handleTaskSelect} />

      <main className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-auto mt-4 max-w-3xl px-5">
            <p
              role="alert"
              className="rounded-xl border border-hairline bg-elevated px-4 py-3 text-[13px] leading-relaxed text-ink-secondary"
            >
              {error}
            </p>
          </div>
        )}

        {messages.length === 0 && !isLoading ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <TaskIcon name={task.icon} className="size-8 text-ink-tertiary" />
            <h2 className="mt-5 text-[26px] font-semibold tracking-tight">{task.name}</h2>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-secondary">
              {task.description}
            </p>
            <p className="mt-6 text-[12px] text-ink-tertiary">
              {model.name} · {model.provider}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-5 py-8">
            {messages.map((msg, index) =>
              msg.role === 'user' ? (
                <div key={index} className="flex justify-end">
                  <p className="max-w-[80%] rounded-[20px] bg-accent px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-accent-ink">
                    {msg.content}
                  </p>
                </div>
              ) : (
                <p
                  key={index}
                  className="text-[15px] leading-[1.65] whitespace-pre-wrap text-ink"
                >
                  {msg.content}
                </p>
              ),
            )}

            {isLoading && (
              <div className="flex gap-1.5 py-1" aria-label="Generando respuesta">
                <span className="typing-dot size-1.5 rounded-full bg-ink-tertiary" />
                <span
                  className="typing-dot size-1.5 rounded-full bg-ink-tertiary"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="typing-dot size-1.5 rounded-full bg-ink-tertiary"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </main>

      <div className="border-t border-hairline bg-canvas/80 px-5 pt-3 pb-4 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-[22px] border border-hairline bg-surface py-2 pr-2 pl-4 transition-colors focus-within:border-accent/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resizeInput();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Escribe para ${task.name.toLowerCase()}`}
              rows={1}
              aria-label="Mensaje"
              className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed placeholder:text-ink-tertiary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Enviar"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none disabled:opacity-25"
            >
              <ArrowUp className="size-[17px]" />
            </button>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-ink-tertiary">
            La clave y las conversaciones se guardan solo en este navegador.
          </p>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
