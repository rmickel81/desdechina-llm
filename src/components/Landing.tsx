import Link from 'next/link';
import { MODELS, TASKS, formatContext, modelsForTask } from '@/config/models';
import Preloader from './Preloader';

// Cifras del propio catálogo: si mañana entra un modelo, la portada lo dice
// sola. Escribirlas a mano es garantizar que algún día mientan.
const modelos = Object.values(MODELS);
const fabricantes = [...new Set(modelos.map((m) => m.provider))].sort();
const conImagenes = modelos.filter((m) => m.acceptsImages).length;
const mayorContexto = Math.max(...modelos.map((m) => m.contextTokens));

const CUOTA = Number(process.env.DEFAULT_MONTHLY_LIMIT ?? 8);

// La cinta se repite dos veces y se desplaza un 50%: así el bucle no tiene
// costura. Los nombres son los de verdad, no relleno.
const cinta = [...modelos, ...modelos];

export default function Landing() {
  return (
    <div className="brutal b-grano min-h-dvh">
      <Preloader />
      <header className="sticky top-0 z-50 border-b border-[var(--b-linea)] bg-[var(--b-fondo)]/85 backdrop-blur-md">
        <div className="flex items-center justify-between px-[var(--b-margen)] py-4">
          <span className="b-meta !text-[var(--b-tinta)]">DesdeChina LLM</span>
          <nav className="flex items-center gap-6">
            <Link href="/entrar" className="b-meta transition-colors hover:!text-[var(--b-tinta)]">
              Entrar
            </Link>
            <Link
              href="/registro"
              className="b-meta b-cta px-4 py-2"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ---------------------------------------------------- HERO */}
        <section className="px-[var(--b-margen)] pt-[clamp(4rem,12vh,9rem)] pb-[var(--b-seccion)]">
          <p className="b-meta">
            {modelos.length} modelos · {fabricantes.length} fabricantes · Shenzhen
          </p>

          {/* Los saltos de línea son a mano y no del navegador: un titular de
              este tamaño no puede partirse donde caiga, y "toda la IA / de
              China" es donde tiene sentido que respire. */}
          <h1 className="b-display mt-8 text-[clamp(2.75rem,12vw,11rem)]">
            Nihao Europa
            <br />
            <span className="text-[var(--b-acento)]">
              Usa toda la IA
              <br />
              de China
            </span>
          </h1>

          <div className="mt-14 grid gap-10 border-t border-[var(--b-linea)] pt-8 md:grid-cols-12">
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-[var(--b-tinta)]/75 md:col-span-6">
              DeepSeek, Qwen, Kimi, GLM, MiniMax, Hunyuan. Todos cuestan
              céntimos y ninguno se parece al de al lado. Aquí están ordenados
              por lo que quieres hacer, no por quién los fabrica.
            </p>
            <div className="md:col-span-4 md:col-start-9">
              <Link
                href="/registro"
                className="b-meta b-cta inline-block px-6 py-4"
              >
                Empezar — {CUOTA} mensajes gratis
              </Link>
              <p className="b-meta mt-4">Sin tarjeta. Sin clave propia.</p>
            </div>
          </div>
        </section>

        {/* ------------------------------------- CINTA DE MODELOS */}
        <section
          aria-label={`Los ${modelos.length} modelos del catálogo`}
          className="overflow-hidden border-y border-[var(--b-linea)] py-5"
        >
          <div className="b-cinta">
            {cinta.map((m, i) => (
              <span key={`${m.id}-${i}`} className="b-meta flex shrink-0 items-center gap-4 px-6">
                {m.name}
                <span className="text-[var(--b-acento)]">◆</span>
              </span>
            ))}
          </div>
        </section>

        {/* ---------------------------------- ÍNDICE DE TAREAS */}
        <section className="pt-[var(--b-seccion)]" aria-labelledby="indice">
          <div className="flex items-end justify-between px-[var(--b-margen)] pb-10">
            <h2 id="indice" className="b-display text-[clamp(2rem,5vw,4rem)]">
              El índice
            </h2>
            <p className="b-meta hidden sm:block">/ {String(TASKS.length).padStart(2, '0')}</p>
          </div>

          <ul>
            {TASKS.map((task, i) => {
              const suyos = modelsForTask(task);
              const porDefecto = MODELS[task.models[0]];
              return (
                <li key={task.id}>
                  <Link href="/registro" className="b-fila b-entra">
                    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-[var(--b-margen)] py-7">
                      <span className="b-num b-meta !text-inherit w-10 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="b-display flex-1 text-[clamp(1.75rem,4.5vw,3.25rem)]">
                        {task.name}
                      </span>
                      <span className="b-tenue b-meta">
                        {suyos.length} modelos · {porDefecto?.name}
                      </span>
                      <span className="b-flecha text-[1.5rem] leading-none">→</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[var(--b-linea)]" />
        </section>

        {/* --------------------------------------------- CIFRAS */}
        <section className="px-[var(--b-margen)] py-[var(--b-seccion)]" aria-labelledby="cifras">
          <h2 id="cifras" className="b-meta">
            Lo que hay
          </h2>
          <dl className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: modelos.length, t: 'Modelos', d: 'Todos verificados contra el catálogo de OpenRouter.' },
              { n: fabricantes.length, t: 'Fabricantes', d: fabricantes.slice(0, 5).join(', ') + '…' },
              { n: conImagenes, t: 'Ven imágenes', d: 'Adjuntas una captura y preguntas por ella.' },
              { n: formatContext(mayorContexto), t: 'De contexto', d: 'El mayor del catálogo. Un expediente entero de una vez.' },
            ].map((c) => (
              <div key={c.t} className="b-entra border-t border-[var(--b-linea)] pt-5">
                <dt className="b-display text-[clamp(3rem,7vw,5rem)] text-[var(--b-acento)]">
                  {c.n}
                </dt>
                <dd className="mt-2">
                  <span className="b-meta !text-[var(--b-tinta)]">{c.t}</span>
                  <p className="mt-2 max-w-[28ch] text-[14px] leading-relaxed text-[var(--b-tinta)]/60">
                    {c.d}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ----------------------------------------- CÓMO VA */}
        <section
          className="border-t border-[var(--b-linea)] px-[var(--b-margen)] py-[var(--b-seccion)]"
          aria-labelledby="como"
        >
          <h2 id="como" className="b-meta">
            Cómo va
          </h2>
          <ol className="mt-10 grid gap-12 md:grid-cols-3">
            {[
              ['01', 'La clave la pongo yo', 'No te das de alta en OpenRouter ni pagas nada. Correo, contraseña y a escribir.'],
              ['02', `${CUOTA} mensajes al mes`, 'Ocho, que en China es el número de la suerte. Bastan para probar en serio.'],
              ['03', 'Lo que escribes es tuyo', 'Las conversaciones se quedan en tu navegador. En el servidor solo queda cuántos mensajes gastaste.'],
            ].map(([n, t, d]) => (
              <li key={n} className="b-entra">
                <span className="b-meta text-[var(--b-acento)]">{n}</span>
                <h3 className="b-display mt-3 text-[clamp(1.4rem,2.5vw,1.9rem)]">{t}</h3>
                <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-[var(--b-tinta)]/65">
                  {d}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* -------------------------------------------- CIERRE */}
        <section className="border-t border-[var(--b-linea)] px-[var(--b-margen)] py-[var(--b-seccion)]">
          <h2 className="b-display max-w-[14ch] text-[clamp(2.5rem,8vw,7rem)]">
            ¿No sabes cuál usar?
          </h2>
          <p className="mt-8 max-w-[52ch] text-[17px] leading-relaxed text-[var(--b-tinta)]/70">
            Cada modelo tiene su ficha en desdechina.es: qué hace bien, dónde se
            queda corto, cuándo elegirlo y cuándo no. Escritas a mano, una por
            una, sin rankings ni listas de moda.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/registro"
              className="b-meta b-cta px-6 py-4"
            >
              Crear cuenta
            </Link>
            <a
              href="https://desdechina.es/modelos"
              className="b-meta b-cta-2 px-6 py-4"
            >
              Leer las fichas ↗
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--b-linea)] px-[var(--b-margen)] py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="b-display text-[clamp(1.5rem,3vw,2.25rem)]">DesdeChina LLM</p>
            <p className="b-meta mt-2">Shenzhen · 22°32′N 114°03′E</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <a href="https://desdechina.es" className="b-meta transition-colors hover:!text-[var(--b-acento)]">
              Desde China ↗
            </a>
            <a href="https://desdechina.es/modelos" className="b-meta transition-colors hover:!text-[var(--b-acento)]">
              Las fichas ↗
            </a>
            <Link href="/entrar" className="b-meta transition-colors hover:!text-[var(--b-acento)]">
              Entrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
