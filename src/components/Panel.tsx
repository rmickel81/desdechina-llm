'use client';

import { useEffect, useRef } from 'react';
import { Close } from './icons';

interface PanelProps {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Frase bajo el título. Opcional: no todos los paneles la necesitan. */
  entradilla?: string;
  anchoMax?: string;
}

/**
 * Cáscara común de los paneles modales. Antes cada uno repetía el overlay,
 * el `stopPropagation` y el botón de cerrar, y ninguno de los dos atendía a
 * la tecla Escape, que es como se cierra un diálogo desde el teclado.
 *
 * También bloquea el scroll de detrás mientras está abierto: sin eso, la
 * rueda del ratón mueve la conversación bajo el panel y desorienta.
 */
export default function Panel({ titulo, onClose, children, entradilla, anchoMax = '460px' }: PanelProps) {
  const cajaRef = useRef<HTMLDivElement>(null);

  // Dos efectos y no uno, porque dependen de cosas distintas. `onClose` suele
  // llegar como función anónima, así que cambia en cada render del padre: si
  // todo colgara de él, en cada render se volvería a poner el foco en el panel
  // y se le quitaría a lo que hubiera dentro. El bloqueo del scroll y el foco
  // inicial son de apertura y cierre, y solo de eso.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [onClose]);

  useEffect(() => {
    const antes = document.body.style.overflow;
    // Sin esto, la rueda del ratón mueve la conversación por debajo del panel.
    document.body.style.overflow = 'hidden';
    // El foco entra en el panel; si no, el teclado se queda detrás.
    cajaRef.current?.focus();
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);

  const id = `panel-${titulo.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-5"
      onClick={onClose}
    >
      <div
        ref={cajaRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: anchoMax }}
        className="a-panel max-h-[85dvh] w-full overflow-y-auto p-6 outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={id} className="a-display text-[24px]">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mt-1 -mr-1 shrink-0 p-1.5 text-ink-tertiary transition-colors hover:text-ink"
          >
            <Close className="size-[18px]" />
          </button>
        </div>
        {entradilla && (
          <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">{entradilla}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
