import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminUsers from '@/components/AdminUsers';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import type { AdminUserRow } from '@/app/api/admin/usuarios/route';

export const metadata = { title: 'Usuarios · DesdeChina LLM' };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar');
  if (user.role !== 'admin') redirect('/');

  const users = await query<AdminUserRow>(
    `select u.id, u.email, u.name, u.role, u.status, u.monthly_limit,
            u.created_at, u.last_login_at,
            (select count(*)::int
               from usage_events e
              where e.user_id = u.id
                and e.created_at >= date_trunc('month', now())) as used_this_month
       from users u
      order by u.created_at desc`,
  );

  const totalThisMonth = users.reduce((sum, u) => sum + u.used_this_month, 0);

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <h1 className="a-display text-[20px]">Usuarios</h1>
          <Link href="/" className="a-meta text-accent transition-opacity hover:opacity-70">
            ← Volver al chat
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Las dos cifras que se miran al entrar aquí, en grande. Antes eran
            una frase de 14px que había que leer entera para sacar dos
            números. */}
        <dl className="mb-10 flex flex-wrap gap-12 border-b border-hairline pb-8">
          <div>
            <dt className="a-meta text-ink-tertiary">
              {users.length === 1 ? 'Cuenta' : 'Cuentas'}
            </dt>
            <dd className="a-display mt-2 text-[clamp(2rem,6vw,3.5rem)] tabular-nums">
              {users.length.toLocaleString('es-ES')}
            </dd>
          </div>
          <div>
            <dt className="a-meta text-ink-tertiary">Mensajes este mes</dt>
            <dd className="a-display mt-2 text-[clamp(2rem,6vw,3.5rem)] tabular-nums text-accent">
              {totalThisMonth.toLocaleString('es-ES')}
            </dd>
          </div>
        </dl>
        <AdminUsers initialUsers={users} />
      </main>
    </div>
  );
}
