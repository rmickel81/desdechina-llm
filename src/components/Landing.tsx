import Link from 'next/link';
import { MODELS, TASKS, modelsForTask } from '@/config/models';
import { ArrowUpRight, TaskIcon } from './icons';

// Cifras del propio catálogo: si mañana entra un modelo, la portada lo dice
// sola. Escribirlas a mano es garantizar que algún día mientan.
const totalModelos = Object.keys(MODELS).length;
const conImagenes = Object.values(MODELS).filter((m) => m.acceptsImages).length;
const fabricantes = new Set(Object.values(MODELS).map((m) => m.provider)).size;

const CUOTA = Number(process.env.DEFAULT_MONTHLY_LIMIT ?? 8);

export default function Landing() {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-[17px] font-semibold tracking-tight">DesdeChina LLM</span>
          <Link
            href="/entrar"
            className="text-[14px] text-ink-secondary transition-colors hover:text-ink"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
          <h1 className="max-w-[16ch] text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] font-semibold tracking-tight">
            Los modelos de IA china, sin montarte nada.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[19px] leading-relaxed text-ink-secondary">
            {totalModelos} modelos de {fabricantes} fabricantes —DeepSeek, Alibaba,
            Moonshot, Z.AI, MiniMax, Tencent y más—, agrupados por lo que quieres
            hacer. Eliges la tarea, no el modelo.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/registro"
              className="rounded-full bg-accent px-6 py-3 text-[16px] font-medium text-accent-ink transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              Crear cuenta gratis
            </Link>
            <span className="text-[14px] text-ink-tertiary">
              {CUOTA} mensajes al mes. Sin tarjeta.
            </span>
          </div>
        </section>

        <section className="border-t border-hairline py-16" aria-labelledby="tareas">
          <h2 id="tareas" className="text-[13px] font-medium tracking-wide text-ink-tertiary uppercase">
            Para qué
          </h2>
          <ul className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {TASKS.map((task) => (
              <li key={task.id}>
                <TaskIcon name={task.icon} className="size-5 text-ink-tertiary" />
                <h3 className="mt-3 text-[16px] font-medium">{task.name}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
                  {task.description}
                </p>
                <p className="mt-2 text-[13px] text-ink-tertiary">
                  {modelsForTask(task).length} modelos ·{' '}
                  {MODELS[task.models[0]]?.name} por defecto
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-hairline py-16" aria-labelledby="como">
          <h2 id="como" className="text-[13px] font-medium tracking-wide text-ink-tertiary uppercase">
            Cómo funciona
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            <div>
              <dt className="text-[16px] font-medium">La clave la pongo yo</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
                No tienes que darte de alta en OpenRouter ni pagar nada. Creas
                cuenta con tu correo y escribes.
              </dd>
            </div>
            <div>
              <dt className="text-[16px] font-medium">{CUOTA} mensajes al mes</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
                Ocho, que en China es el número de la suerte. Suficiente para
                probar en serio y ver si te sirve.
              </dd>
            </div>
            <div>
              <dt className="text-[16px] font-medium">Tus conversaciones son tuyas</dt>
              <dd className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
                Se guardan solo en tu navegador. En el servidor queda cuántos
                mensajes has gastado, no lo que has escrito.
              </dd>
            </div>
          </dl>
        </section>

        <section className="border-t border-hairline py-16" aria-labelledby="saber">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[46ch]">
              <h2 id="saber" className="text-[24px] font-semibold tracking-tight">
                Y si quieres saber cuál elegir
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
                Cada modelo tiene su ficha en desdechina.es: qué hace bien, dónde
                se queda corto, cuándo elegirlo y cuándo no. Sin rankings y sin
                listas de moda. {conImagenes} de los {totalModelos} aceptan
                imágenes.
              </p>
            </div>
            <a
              href="https://desdechina.es/modelos"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hairline px-5 py-2.5 text-[15px] font-medium transition-colors hover:bg-elevated"
            >
              Ver las fichas
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-[13px] text-ink-tertiary">
          <span>
            Hecho en Shenzhen por{' '}
            <a href="https://desdechina.es" className="text-ink-secondary hover:text-ink">
              Desde China
            </a>
          </span>
          <Link href="/entrar" className="hover:text-ink">
            Ya tengo cuenta
          </Link>
        </div>
      </footer>
    </div>
  );
}
