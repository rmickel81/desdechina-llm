'use client';

import { useEffect, useRef, useState } from 'react';
import { MODELS, TASKS } from '@/config/models';
import { getHistory, saveHistory, clearHistory } from '@/lib/storage';
import TaskSelector from './TaskSelector';
import ModelPicker from './ModelPicker';
import AccountModal from './AccountModal';
import { ArrowUp, ChevronDown, Clip, Close } from './icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  /**
   * Miniatura de la imagen enviada, solo para pintarla en la conversación.
   * No se guarda en el historial: una imagen en base64 llena el localStorage
   * en tres mensajes.
   */
  image?: string;
  /** Nombre del modelo que respondió. Solo en los del asistente. */
  model?: string;
}

// Lado mayor al que se reduce la imagen antes de mandarla. Los modelos de
// visión no aprovechan más resolución que esta, y de paso la petición baja de
// varios megas a unos pocos cientos de kilobytes.
const MAX_LADO = 1568;

/**
 * Reduce la imagen en el navegador y la devuelve como `data:` URL. Los PNG
 * salen como PNG: suelen ser capturas de pantalla y pasarlas a JPEG emborrona
 * el texto, que es justo lo que se le va a pedir que lea.
 */
function prepararImagen(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se ha podido leer el archivo.'));
    lector.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Ese archivo no es una imagen.'));
      img.onload = () => {
        const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);
        const ctx = lienzo.getContext('2d');
        if (!ctx) {
          reject(new Error('Tu navegador no ha podido procesar la imagen.'));
          return;
        }
        ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
        const png = archivo.type === 'image/png';
        resolve(lienzo.toDataURL(png ? 'image/png' : 'image/jpeg', png ? undefined : 0.85));
      };
      img.src = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  });
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
  const [imagen, setImagen] = useState<string | null>(null);
  const archivoRef = useRef<HTMLInputElement>(null);
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
    // Sin la imagen: en base64 llenaría el localStorage en tres mensajes.
    saveHistory(
      user.id,
      messages.map(({ role, content, model }) => ({ role, content, model })),
    );
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
    if (!MODELS[next.models[0]]?.acceptsImages) descartarImagen();
    setMessages([]);
    setError('');
    clearHistory(user.id);
  };

  // Cambiar de modelo dentro de la misma sección puede llevar a uno que no
  // admite imágenes: si hay una adjunta, se suelta en vez de dejarla colgada
  // para que el servidor la rechace luego.
  const elegirModelo = (id: string) => {
    setSelectedModel(id);
    if (!MODELS[id]?.acceptsImages) descartarImagen();
  };

  const descartarImagen = () => {
    setImagen(null);
    if (archivoRef.current) archivoRef.current.value = '';
  };

  const handleImagen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    setError('');
    try {
      setImagen(await prepararImagen(archivo));
    } catch (e) {
      descartarImagen();
      setError(e instanceof Error ? e.message : 'No se ha podido cargar la imagen.');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const enviada = imagen;
    const updatedMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(enviada ? [...messages, { role: 'user', content: input, image: enviada }] : updatedMessages);
    setInput('');
    descartarImagen();
    setIsLoading(true);
    setError('');
    requestAnimationFrame(resizeInput);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          model: model.id,
          messages: updatedMessages,
          ...(enviada ? { image: enviada } : {}),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data?.usage) setUsed(data.usage.used);
        setError(data?.error ?? 'No se ha podido enviar el mensaje.');
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.content, model: model.name }]);
      setUsed(data.usage.used);
    } catch {
      setError('Sin conexión con el servidor. Comprueba tu red.');
    } finally {
      setIsLoading(false);
    }
  };

  const indice = TASKS.findIndex((t) => t.id === task.id);

  return (
    // El grano es el mismo de la portada: al 4% no se ve, pero quita a los
    // planos de color esa planitud de pantalla que delata lo barato.
    <div className="b-grano flex h-dvh flex-col bg-canvas text-ink">
      {/* Nada de esta zona hace scroll: solo lo hace la conversación. La
          cabecera no necesita ni `sticky` ni desenfoque detrás. */}
      <header className="shrink-0 border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <h1 className="a-display text-[20px]">DesdeChina LLM</h1>
          <div className="flex items-center gap-4">
            <span className="a-meta hidden text-ink-tertiary tabular-nums sm:inline">
              {remaining.toLocaleString('es-ES')} restantes
            </span>
            {/* El avatar solo no se leía como pulsable: el galón indica que
                abre un panel, que es donde vive «Cerrar sesión». */}
            <button
              type="button"
              onClick={() => setIsAccountOpen(true)}
              aria-label="Tu cuenta y cerrar sesión"
              title="Tu cuenta"
              aria-haspopup="dialog"
              className="a-boton-2 flex items-center gap-1.5 py-1.5 pr-2 pl-1.5 text-ink-secondary"
            >
              <span className="grid size-6 place-items-center bg-elevated font-mono text-[12px]">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      <TaskSelector selectedTask={selectedTask} onSelectTask={handleTaskSelect} />
      <ModelPicker task={task} selectedModel={model.id} onSelectModel={elegirModelo} />

      <main className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-auto mt-6 max-w-5xl px-5">
            <p
              role="alert"
              className="border-l-2 border-accent bg-elevated px-4 py-3 text-[14px] leading-relaxed"
            >
              {error}
            </p>
          </div>
        )}

        {messages.length === 0 && !isLoading ? (
          /* La pantalla de inicio, alineada a la izquierda y con el numeral
             gigante de la sección. Centrada en medio de un lienzo negro solo
             parecía una pantalla a medio cargar; así es la portada de la
             sección en la que estás y dice de un vistazo dónde estás y con
             qué modelo vas a hablar. */
          <div className="mx-auto max-w-5xl px-5 py-14">
            <p className="a-display text-[clamp(4rem,11vw,8rem)] leading-[0.8] text-accent">
              {String(indice + 1).padStart(2, '0')}
            </p>
            <h2 className="a-display mt-6 text-[clamp(1.75rem,4vw,2.75rem)]">{task.name}</h2>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-secondary">
              {task.description}
            </p>

            <dl className="mt-12 max-w-md border-t border-hairline">
              <div className="flex justify-between gap-4 border-b border-hairline py-3">
                <dt className="a-meta text-ink-tertiary">Modelo</dt>
                <dd className="a-meta text-right">
                  {model.name} · {model.provider}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-hairline py-3">
                <dt className="a-meta text-ink-tertiary">Te quedan</dt>
                <dd className="a-meta text-right tabular-nums">
                  {remaining.toLocaleString('es-ES')} mensajes
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-8 px-5 py-10">
            {messages.map((msg, index) =>
              msg.role === 'user' ? (
                <div key={index} className="flex flex-col items-end gap-2">
                  <p className="a-meta text-ink-tertiary">Tú</p>
                  {msg.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={msg.image}
                      alt="Imagen adjunta"
                      className="max-h-64 max-w-[34rem] border border-hairline object-contain"
                    />
                  )}
                  {/* La tinta oscura sobre el acento da 6,1:1. A los 15px de un
                      mensaje pasa de sobra; por eso el acento sí puede ser
                      fondo aquí y no lo es en un metadato de 11px. */}
                  <p className="max-w-[34rem] bg-accent px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-accent-ink">
                    {msg.content}
                  </p>
                </div>
              ) : (
                /* La regla a la izquierda hace de margen del cuaderno, y la
                   etiqueta dice qué modelo contestó: dentro de una sección se
                   puede cambiar a media conversación y luego no hay manera de
                   saber quién dijo qué. */
                <div key={index} className="border-l-2 border-hairline pl-5">
                  {msg.model && <p className="a-meta mb-2 text-ink-tertiary">{msg.model}</p>}
                  <p className="max-w-[70ch] text-[16px] leading-[1.7] whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              ),
            )}

            {isLoading && (
              <div className="border-l-2 border-accent pl-5">
                <p className="a-meta text-ink-tertiary" aria-label="Generando respuesta">
                  {model.name} está escribiendo
                  <span className="a-cursor ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.08em] bg-accent" />
                </p>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </main>

      <div className="shrink-0 border-t border-hairline pt-4 pb-5">
        <div className="mx-auto max-w-5xl px-5">
          {imagen && (
            <div className="mb-2 flex items-center gap-3 border border-hairline bg-surface p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagen} alt="" className="size-12 object-cover" />
              <span className="a-meta flex-1 text-ink-secondary">Se enviará con tu mensaje</span>
              <button
                type="button"
                onClick={descartarImagen}
                aria-label="Quitar la imagen"
                className="flex size-8 items-center justify-center text-ink-tertiary transition-colors hover:text-accent"
              >
                <Close className="size-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 border border-hairline bg-surface p-2 transition-colors focus-within:border-accent">
            {model.acceptsImages ? (
              <>
                <input
                  ref={archivoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImagen}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => archivoRef.current?.click()}
                  aria-label="Adjuntar una imagen"
                  title="Adjuntar una imagen"
                  className="flex size-9 shrink-0 items-center justify-center text-ink-tertiary transition-colors hover:bg-elevated hover:text-ink"
                >
                  <Clip className="size-[18px]" />
                </button>
              </>
            ) : (
              <span className="w-1" />
            )}
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
              className="max-h-40 flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-relaxed placeholder:text-ink-tertiary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Enviar"
              className="a-boton flex size-9 shrink-0 items-center justify-center"
            >
              <ArrowUp className="size-[17px]" />
            </button>
          </div>
          <p className="a-meta mt-3 text-ink-tertiary">
            Las conversaciones se guardan solo en este navegador
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
