'use client';

import { useState } from 'react';
import { getApiKey, setApiKey } from '@/lib/storage';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Configuración</h2>
        <label className="block text-sm font-medium mb-2">
          API Key de OpenRouter
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyState(e.target.value)}
          placeholder="sk-or-..."
          className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600"
        />
        <p className="text-xs text-gray-500 mb-4">
          Tu API key se guarda solo en tu navegador. Nunca se envía a ningún servidor.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
