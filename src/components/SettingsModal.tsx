'use client';

import { useState } from 'react';
import { getApiKey, setApiKey } from '@/lib/storage';
import { Close } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // El contenido se monta solo al abrir, para leer localStorage en el cliente
  // sin provocar diferencias de hidratación.
  if (!isOpen) return null;
  return <SettingsModalContent onClose={onClose} />;
}

function SettingsModalContent({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKeyState] = useState(getApiKey);

  const handleSave = () => {
    setApiKey(apiKey.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajustes-titulo"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-[18px] bg-surface p-6 shadow-2xl shadow-black/10"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="ajustes-titulo" className="text-[19px] font-semibold tracking-tight">
            Ajustes
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1.5 -mt-1 rounded-full p-1.5 text-ink-tertiary transition-colors hover:bg-elevated hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            <Close className="size-[18px]" />
          </button>
        </div>

        <label htmlFor="api-key" className="mb-2 block text-[13px] font-medium">
          Clave de API de OpenRouter
        </label>
        <input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyState(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-or-..."
          autoComplete="off"
          className="w-full rounded-xl border border-hairline bg-elevated px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-accent/50 focus:bg-surface"
        />
        <p className="mt-2.5 text-[12px] leading-relaxed text-ink-tertiary">
          Se guarda solo en este navegador. No pasa por ningún servidor nuestro: las
          peticiones van directas a OpenRouter.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-[14px] font-medium text-ink-secondary transition-colors hover:bg-elevated hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-accent px-5 py-2 text-[14px] font-medium text-accent-ink transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
