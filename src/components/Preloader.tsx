'use client';

import { useEffect, useState } from 'react';

/**
 * Cortina de entrada. Cubre una espera real —las dos tipografías de la
 * portada, Fraunces variable y JetBrains Mono, que son la imagen de la
 * página— y se va en cuanto están listas. No hay retardo fingido: si el
 * navegador ya las tiene en caché, esto dura lo que tarda en pintarse.
 *
 * Va marcado con `data-preloader` y el <noscript> del layout lo oculta: sin
 * JavaScript no se queda una cortina encima del contenido para siempre.
 */
export default function Preloader() {
  const [fuera, setFuera] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let vivo = true;
    const arranque = performance.now();

    // El contador sigue a las fuentes, pero nunca se planta: sube solo hasta
    // el 90% y el último tramo lo da la carga real. Un contador que llega a
    // 100 antes de tiempo y espera es peor que no tenerlo.
    // Con «menos movimiento» no hay contador ni cortina: se levanta al vuelo.
    const tic = menosMovimiento
      ? 0
      : window.setInterval(() => {
          if (!vivo) return;
          const t = Math.min((performance.now() - arranque) / 900, 1);
          setPct(Math.round(t * 90));
        }, 40);

    const terminar = () => {
      if (!vivo) return;
      window.clearInterval(tic);
      setPct(100);
      window.setTimeout(() => vivo && setFuera(true), menosMovimiento ? 0 : 380);
    };

    // Tope de seguridad: pase lo que pase con las fuentes, a los 2,5 s se
    // levanta. Nadie se queda mirando una cortina por un fallo de red.
    const tope = window.setTimeout(terminar, menosMovimiento ? 0 : 2500);
    if (!menosMovimiento) document.fonts.ready.then(terminar).catch(terminar);

    return () => {
      vivo = false;
      window.clearInterval(tic);
      window.clearTimeout(tope);
    };
  }, []);

  return (
    <div
      data-preloader
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] flex flex-col justify-between bg-[var(--b-fondo)] px-[var(--b-margen)] py-10 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fuera ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <p className="b-meta">DesdeChina LLM · Shenzhen</p>

      <div className="flex items-end justify-between gap-8">
        {/* La mancha. Hoy el sello de la casa; si algún día hay caricatura,
            se cambia este bloque y no hay que tocar nada más. */}
        <span className="shrink-0" style={{ transform: 'rotate(-3deg)' }}>
          <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
            <rect x="1.5" y="1.5" width="61" height="61" rx="3" fill="#c9250f" />
            <rect x="5.5" y="5.5" width="53" height="53" fill="none" stroke="#f5f2ee" strokeWidth="1.6" />
            {[
              ['米', 45, 27],
              ['罗', 45, 53],
              ['之', 19, 27],
              ['印', 19, 53],
            ].map(([c, x, y]) => (
              <text
                key={String(c)}
                x={x as number}
                y={y as number}
                textAnchor="middle"
                fontFamily="'Noto Serif SC', serif"
                fontWeight="900"
                fontSize="21"
                fill="#f5f2ee"
              >
                {c}
              </text>
            ))}
          </svg>
        </span>

        <span className="b-display text-[clamp(4rem,16vw,11rem)] leading-none tabular-nums">
          {String(pct).padStart(3, '0')}
        </span>
      </div>

      {/* Ningún hanzi va mudo: los dos llevan lectura, como en desdechina.es.
          Y no se confunden, que el DESIGN_SPEC insiste: 米罗之印 es el sello de
          la gaceta; 罗伯特 (Luóbótè) es el nombre chino de Roberto. */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[var(--b-linea)] pt-5">
        <p className="b-meta">
          罗伯特 · Luóbótè · Shenzhen
        </p>
        <p className="b-meta">米罗之印 · Mǐ Luó zhī yìn · el sello</p>
      </div>
    </div>
  );
}
