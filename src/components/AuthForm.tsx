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

  const field =
    'w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-accent/50';

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 py-12 text-ink">
      <div className="w-full max-w-[360px]">
        <h1 className="text-center text-[28px] font-semibold tracking-tight">DesdeChina LLM</h1>
        <p className="mt-2 mb-8 text-center text-[15px] leading-relaxed text-ink-secondary">
          {isRegister
            ? 'Crea una cuenta para empezar a usar los modelos.'
            : 'Entra con tu cuenta para continuar.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label htmlFor="nombre" className="mb-1.5 block text-[13px] font-medium">
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
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
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
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
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
              <p className="mt-1.5 text-[12px] text-ink-tertiary">Mínimo 8 caracteres.</p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-hairline bg-elevated px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-secondary"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSending}
            className="w-full rounded-full bg-accent px-5 py-2.5 text-[15px] font-medium text-accent-ink transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none disabled:opacity-50"
          >
            {isSending ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-secondary">
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
