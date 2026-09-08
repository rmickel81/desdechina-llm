'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Panel from './Panel';

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
    <Panel titulo="Tu cuenta" onClose={onClose} anchoMax="420px">
      <p className="a-display text-[22px]">{user.name || user.email}</p>
      {user.name && <p className="a-meta mt-2 text-ink-tertiary">{user.email}</p>}

      <div className="mt-8 border-t border-hairline pt-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="a-meta text-ink-tertiary">Mensajes este mes</span>
          {/* El numeral grande es el dato; la etiqueta, un metadato. Al revés
              —etiqueta grande y cifra pequeña— hay que leer las dos para
              enterarse de lo único que importa aquí. */}
          <span className="font-mono text-[15px] tabular-nums">
            {usage.used.toLocaleString('es-ES')}
            <span className="text-ink-tertiary"> / {usage.limit.toLocaleString('es-ES')}</span>
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={usage.used}
          aria-valuemin={0}
          aria-valuemax={usage.limit}
          className="h-[3px] bg-elevated"
        >
          <div className="h-full bg-accent transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 text-[12px] text-ink-tertiary">
          El contador se reinicia el día 1 de cada mes.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-hairline pt-5">
        {user.role === 'admin' ? (
          <Link href="/admin" className="a-meta text-accent transition-opacity hover:opacity-70">
            Administrar usuarios →
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLeaving}
          className="a-meta a-boton-2 px-5 py-3"
        >
          {isLeaving ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>
    </Panel>
  );
}
