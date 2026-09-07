'use client';

import { useState } from 'react';
import {
  articleUrl,
  COST_LABEL,
  formatContext,
  modelsForTask,
  MODELS,
  type TaskConfig,
} from '@/config/models';
import { ArrowUpRight, Check, ChevronDown, Close } from './icons';

interface ModelPickerProps {
  task: TaskConfig;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export default function ModelPicker({ task, selectedModel, onSelectModel }: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const models = modelsForTask(task);
  const current = MODELS[selectedModel] ?? models[0];

  return (
    <>
      <div className="flex justify-center border-b border-hairline bg-canvas/80 px-5 pb-2.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] text-ink-tertiary transition-colors hover:bg-elevated hover:text-ink-secondary focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
        >
          <span>
            {current.name} · {current.provider}
          </span>
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-5 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modelos-titulo"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-[18px] bg-surface p-6 shadow-2xl shadow-black/10"
          >
            <div className="mb-1 flex items-start justify-between">
              <h2 id="modelos-titulo" className="text-[19px] font-semibold tracking-tight">
                Modelo para {task.name.toLowerCase()}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
                className="-mt-1 -mr-1.5 rounded-full p-1.5 text-ink-tertiary transition-colors hover:bg-elevated hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
              >
                <Close className="size-[18px]" />
              </button>
            </div>
            <p className="mb-5 text-[13px] text-ink-secondary">
              Todos sirven para esta tarea. Cambian el estilo, la velocidad y el coste.
            </p>

            <ul className="space-y-1.5">
              {models.map((model) => {
                const isSelected = model.id === current.id;
                const article = articleUrl(model);
                return (
                  <li key={model.id}>
                    <div
                      className={`rounded-2xl border p-3.5 transition-colors ${
                        isSelected ? 'border-accent/40 bg-elevated' : 'border-hairline'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectModel(model.id);
                          setIsOpen(false);
                        }}
                        aria-pressed={isSelected}
                        className="flex w-full items-start gap-3 text-left focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
                      >
                        <span className="flex-1">
                          <span className="block text-[15px] font-medium">{model.name}</span>
                          <span className="block text-[12px] text-ink-tertiary">
                            {model.provider} · {COST_LABEL[model.tier]} ·{' '}
                            {formatContext(model.contextTokens)} de contexto
                          </span>
                          <span className="mt-1 block text-[13px] leading-relaxed text-ink-secondary">
                            {model.description}
                          </span>
                        </span>
                        {isSelected && <Check className="mt-1 size-4 shrink-0 text-accent" />}
                      </button>

                      {article && (
                        <a
                          href={article}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1 text-[13px] text-accent transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
                        >
                          Saber más sobre {model.name}
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
