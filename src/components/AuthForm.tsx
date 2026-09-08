'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AuthFormProps {
  mode: 'entrar' | 'registro';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === 'registro';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error ?? 'No se ha podido completar la operación.');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setError('Sin conexión con el servidor. Comprueba tu red.');
    } finally {
      setIsSending(false);
    }
  };

  const field = 'a-campo w-full px-3.5 py-3 text-[15px]';

  return (
    <main className="b-grano flex min-h-dvh flex-col justify-center bg-canvas px-6 py-16 text-ink">
      <div className="mx-auto w-full max-w-[420px]">
        {/* Alineado a la izquierda, como la portada. Un formulario centrado
            con el título encima flota; con la retícula a la izquierda tiene
            de dónde agarrarse. */}
        <p className="a-meta text-ink-tertiary">
          DesdeChina LLM · {isRegister ? 'Alta' : 'Acceso'}
        </p>
        <h1 className="a-display mt-4 text-[clamp(2rem,7vw,3.25rem)]">
          {isRegister ? 'Crea tu cuenta.' : 'Entra.'}
        </h1>
        <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-ink-secondary">
          {isRegister
            ? 'No hace falta darse de alta en OpenRouter ni poner una tarjeta. Correo, contraseña y a escribir.'
            : 'Con el correo y la contraseña con los que te diste de alta.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5 border-t border-hairline pt-8">
          {isRegister && (
            <div>
              <label htmlFor="nombre" className="a-meta mb-2 block text-ink-tertiary">
                Nombre
              </label>
              <input
                id="nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                className={field}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="a-meta mb-2 block text-ink-tertiary">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="password" className="a-meta mb-2 block text-ink-tertiary">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className={field}
            />
            {isRegister && (
              <p className="mt-2 text-[13px] text-ink-tertiary">Mínimo 8 caracteres.</p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="border-l-2 border-accent bg-elevated px-4 py-3 text-[14px] leading-relaxed"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={isSending} className="a-meta a-boton w-full px-6 py-4">
            {isSending ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 border-t border-hairline pt-6 text-[14px] text-ink-secondary">
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <Link href="/entrar" className="text-accent hover:underline">
                Entra
              </Link>
            </>
          ) : (
            <>
              ¿Aún no tienes cuenta?{' '}
              <Link href="/registro" className="text-accent hover:underline">
                Créala
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
