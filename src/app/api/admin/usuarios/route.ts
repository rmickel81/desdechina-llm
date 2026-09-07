import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  monthly_limit: number;
  created_at: string;
  last_login_at: string | null;
  used_this_month: number;
}

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

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

  return NextResponse.json({ users });
}
