'use client';

import {
  articleUrl,
  COST_LABEL,
  formatContext,
  modelsForTask,
  MODELS,
  type TaskConfig,
} from '@/config/models';
import { ArrowUpRight, Check, ChevronDown } from './icons';
import Panel from './Panel';

interface ModelPickerProps {
  task: TaskConfig;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  /**
   * Abierto o cerrado lo lleva el chat, no este componente: el panel se abre
   * desde dos sitios —esta barra y la ficha de la sección— y con el estado
   * aquí dentro el segundo no tenía forma de abrirlo.
   */
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModelPicker({
  task,
  selectedModel,
  onSelectModel,
  isOpen,
  onOpenChange,
}: ModelPickerProps) {
  const models = modelsForTask(task);
  const current = MODELS[selectedModel] ?? models[0];

  return (
    <>
      <div className="border-b border-hairline">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-2.5">
          <span className="a-meta shrink-0 text-ink-tertiary">Modelo</span>
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            aria-haspopup="dialog"
            className="a-selector flex min-w-0 items-center gap-2.5 px-3 py-1.5"
          >
            <span className="truncate text-[14px]">{current.name}</span>
            <span className="hidden shrink-0 text-[14px] text-ink-tertiary sm:inline">
              · {current.provider}
            </span>
            <ChevronDown className="size-4 shrink-0 text-ink-tertiary" />
          </button>
          <span className="a-meta ml-auto hidden shrink-0 text-ink-tertiary md:inline">
            {models.length} para esta tarea
          </span>
        </div>
      </div>

      {isOpen && (
        <Panel
          titulo={`Modelo para ${task.name.toLowerCase()}`}
          entradilla="Todos sirven para esta tarea. Cambian el estilo, la velocidad y el coste."
          onClose={() => onOpenChange(false)}
          anchoMax="520px"
        >
          {/* Filas separadas por reglas, no tarjetas: la lista se lee como un
              índice y no como ocho cajas apiladas. */}
          <ul>
            {models.map((model) => {
              const isSelected = model.id === current.id;
              const article = articleUrl(model);
              return (
                <li key={model.id} className="border-t border-hairline last:border-b">
                  <div className={isSelected ? 'border-l-2 border-accent pl-4' : 'pl-[18px]'}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectModel(model.id);
                        onOpenChange(false);
                      }}
                      aria-pressed={isSelected}
                      className="flex w-full items-start gap-3 py-4 pr-1 text-left"
                    >
                      <span className="flex-1">
                        <span className="block text-[15px] font-medium">{model.name}</span>
                        <span className="a-meta mt-1 block text-ink-tertiary">
                          {model.provider} · {COST_LABEL[model.tier]} ·{' '}
                          {formatContext(model.contextTokens)} de contexto
                        </span>
                        <span className="mt-2 block text-[13px] leading-relaxed text-ink-secondary">
                          {model.description}
                        </span>
                      </span>
                      {isSelected && <Check className="mt-1 size-4 shrink-0 text-accent" />}
                    </button>

                    {/* El texto visible no repite el nombre del modelo, que
                        está dos líneas más arriba; el rótulo accesible sí lo
                        lleva, porque un lector de pantalla puede ir saltando
                        de enlace en enlace sin ese contexto alrededor. */}
                    {article && (
                      <a
                        href={article}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver la ficha de ${model.name}`}
                        className="mb-4 inline-flex items-center gap-1 font-mono text-[12px] tracking-[0.08em] uppercase text-accent transition-opacity hover:opacity-70"
                      >
                        Ver ficha
                        <ArrowUpRight className="size-3" />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </>
  );
}
