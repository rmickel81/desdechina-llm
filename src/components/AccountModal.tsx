'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Close } from './icons';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; role: 'user' | 'admin' };
  usage: { used: number; limit: number };
}

export default function AccountModal({ isOpen, onClose, user, usage }: AccountModalProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isOpen) return null;

  const percent = usage.limit > 0 ? Math.min(100, (usage.used / usage.limit) * 100) : 100;

  const handleLogout = async () => {
    setIsLeaving(true);
    await fetch('/api/auth/salir', { method: 'POST' });
    router.replace('/entrar');
    router.refresh();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cuenta-titulo"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-[18px] bg-surface p-6 shadow-2xl shadow-black/10"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 id="cuenta-titulo" className="text-[19px] font-semibold tracking-tight">
            Tu cuenta
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mt-1 -mr-1.5 rounded-full p-1.5 text-ink-tertiary transition-colors hover:bg-elevated hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            <Close className="size-[18px]" />
          </button>
        </div>

        <p className="text-[15px] font-medium">{user.name || user.email}</p>
        {user.name && <p className="text-[13px] text-ink-secondary">{user.email}</p>}

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[13px] font-medium">Mensajes este mes</span>
            <span className="text-[13px] tabular-nums text-ink-secondary">
              {usage.used} de {usage.limit}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={usage.used}
            aria-valuemin={0}
            aria-valuemax={usage.limit}
            className="h-1.5 overflow-hidden rounded-full bg-elevated"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-[12px] text-ink-tertiary">
            El contador se reinicia el día 1 de cada mes.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          {user.role === 'admin' ? (
            <Link
              href="/admin"
              className="rounded-full px-4 py-2 text-[14px] font-medium text-accent transition-colors hover:bg-elevated focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              Administrar usuarios
            </Link>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLeaving}
            className="rounded-full bg-elevated px-5 py-2 text-[14px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none disabled:opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
