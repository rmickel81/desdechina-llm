'use client';

import { useState } from 'react';
import type { AdminUserRow } from '@/app/api/admin/usuarios/route';

export default function AdminUsers({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const patch = async (id: string, changes: Partial<Pick<AdminUserRow, 'monthly_limit' | 'status' | 'role'>>) => {
    setBusyId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.error ?? 'No se ha podido guardar el cambio.');
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...changes } : u)));
    } catch {
      setError('Sin conexión con el servidor.');
    } finally {
      setBusyId(null);
    }
  };

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-hairline bg-elevated px-4 py-3 text-[13px] text-ink-secondary"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-hairline text-[12px] font-medium text-ink-secondary">
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Alta</th>
              <th className="px-4 py-3">Último acceso</th>
              <th className="px-4 py-3">Uso del mes</th>
              <th className="px-4 py-3">Límite</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3">
                  <span className="block font-medium">{user.name || '—'}</span>
                  <span className="block text-[12px] text-ink-secondary">{user.email}</span>
                  {user.role === 'admin' && (
                    <span className="mt-1 inline-block rounded-full bg-elevated px-2 py-0.5 text-[11px] text-ink-secondary">
                      Administrador
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[13px] text-ink-secondary">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3 text-[13px] text-ink-secondary">{formatDate(user.last_login_at)}</td>
                <td className="px-4 py-3 tabular-nums text-ink-secondary">{user.used_this_month}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    defaultValue={user.monthly_limit}
                    disabled={busyId === user.id}
                    aria-label={`Límite mensual de ${user.email}`}
                    onBlur={(e) => {
                      const value = Number(e.target.value);
                      if (Number.isInteger(value) && value >= 0 && value !== user.monthly_limit) {
                        patch(user.id, { monthly_limit: value });
                      }
                    }}
                    className="w-24 rounded-lg border border-hairline bg-canvas px-2.5 py-1.5 text-[14px] tabular-nums outline-none focus:border-accent/50"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={busyId === user.id}
                    onClick={() =>
                      patch(user.id, { status: user.status === 'active' ? 'suspended' : 'active' })
                    }
                    className="rounded-full bg-elevated px-3.5 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none disabled:opacity-50"
                  >
                    {user.status === 'active' ? 'Suspender' : 'Reactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="mt-6 text-center text-[14px] text-ink-secondary">Todavía no hay usuarios.</p>
      )}
    </div>
  );
}
