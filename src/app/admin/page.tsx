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
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <h1 className="text-[17px] font-semibold tracking-tight">Usuarios</h1>
          <Link href="/" className="text-[14px] text-accent transition-opacity hover:opacity-80">
            Volver al chat
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="mb-6 text-[14px] text-ink-secondary">
          {users.length} {users.length === 1 ? 'cuenta' : 'cuentas'} · {totalThisMonth} mensajes
          este mes en total
        </p>
        <AdminUsers initialUsers={users} />
      </main>
    </div>
  );
}
