import Link from 'next/link';

export const metadata = { title: '404 · DesdeChina LLM' };

export default function NoEncontrada() {
  return (
    <main className="brutal b-grano flex min-h-dvh flex-col justify-between px-[var(--b-margen)] py-10">
      <p className="b-meta">DesdeChina LLM · Error 404</p>

      <div>
        <p className="b-display text-[clamp(6rem,26vw,20rem)] text-[var(--b-acento)]">404</p>
        <h1 className="b-display mt-4 max-w-[16ch] text-[clamp(1.75rem,5vw,3.5rem)]">
          Esta página no existe.
        </h1>
        <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-[var(--b-tinta)]/65">
          O nunca existió, o la moví y se me olvidó dejar el aviso. Las dos cosas
          son culpa mía.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-[var(--b-linea)] pt-8">
        <Link
          href="/"
          className="b-meta border border-[var(--b-acento)] bg-[var(--b-acento)] px-6 py-4 !text-[var(--b-fondo)] transition-colors hover:bg-transparent hover:!text-[var(--b-acento)]"
        >
          Volver a la portada
        </Link>
        <a
          href="https://desdechina.es/modelos"
          className="b-meta border border-[var(--b-linea)] px-6 py-4 !text-[var(--b-tinta)] transition-colors hover:border-[var(--b-tinta)]"
        >
          Las fichas de los modelos ↗
        </a>
      </div>
    </main>
  );
}
