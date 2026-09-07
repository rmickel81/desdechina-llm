'use client';

import { useEffect, useRef, useState } from 'react';
import { MODELS, TASKS } from '@/config/models';
import { getHistory, saveHistory, clearHistory } from '@/lib/storage';
import TaskSelector from './TaskSelector';
import ModelPicker from './ModelPicker';
import AccountModal from './AccountModal';
import { ArrowUp, TaskIcon } from './icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  monthly_limit: number;
}

interface ChatProps {
  user: ChatUser;
  initialUsed: number;
}

export default function Chat({ user, initialUsed }: ChatProps) {
  const [selectedTask, setSelectedTask] = useState<string>(TASKS[0].id);
  const [selectedModel, setSelectedModel] = useState<string>(TASKS[0].models[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(initialUsed);
  const isHistoryLoaded = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const task = TASKS.find((t) => t.id === selectedTask) ?? TASKS[0];
  const model = MODELS[selectedModel] ?? MODELS[task.models[0]];
  const remaining = Math.max(0, user.monthly_limit - used);

  // El historial vive en localStorage, que solo existe en el cliente: se carga
  // tras el montaje para que el HTML del servidor y el del cliente coincidan.
  useEffect(() => {
    const history = getHistory(user.id);
    if (history.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronización inicial con localStorage
      setMessages(history);
    }
    isHistoryLoaded.current = true;
  }, [user.id]);

  useEffect(() => {
    if (!isHistoryLoaded.current) return;
    saveHistory(user.id, messages);
  }, [messages, user.id]);

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
    const next = TASKS.find((t) => t.id === taskId) ?? TASKS[0];
    setSelectedTask(next.id);
    setSelectedModel(next.models[0]);
    setMessages([]);
    setError('');
    clearHistory(user.id);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const updatedMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError('');
    requestAnimationFrame(resizeInput);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, model: model.id, messages: updatedMessages }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data?.usage) setUsed(data.usage.used);
        setError(data?.error ?? 'No se ha podido enviar el mensaje.');
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
      setUsed(data.usage.used);
    } catch {
      setError('Sin conexión con el servidor. Comprueba tu red.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-canvas text-ink">
      <header className="sticky top-0 z-10 border-b border-hairline bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <h1 className="text-[17px] font-semibold tracking-tight">DesdeChina LLM</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-[12px] tabular-nums text-ink-tertiary sm:inline">
              {remaining} restantes
            </span>
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              aria-label="Tu cuenta"
              className="flex size-8 items-center justify-center rounded-full bg-elevated text-[13px] font-medium text-ink-secondary transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              {(user.name || user.email).charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <TaskSelector selectedTask={selectedTask} onSelectTask={handleTaskSelect} />
      <ModelPicker task={task} selectedModel={model.id} onSelectModel={setSelectedModel} />

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
                <p key={index} className="text-[15px] leading-[1.65] whitespace-pre-wrap text-ink">
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
            Las conversaciones se guardan solo en este navegador.
          </p>
        </div>
      </div>

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        usage={{ used, limit: user.monthly_limit }}
      />
    </div>
  );
}
