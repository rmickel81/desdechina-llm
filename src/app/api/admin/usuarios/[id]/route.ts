import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: 'Usuario no válido.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const { monthly_limit: limit, status, role } = body as Record<string, unknown>;
  const updates: string[] = [];
  const values: unknown[] = [];

  if (limit !== undefined) {
    if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 0 || limit > 1000000) {
      return NextResponse.json({ error: 'El límite no es válido.' }, { status: 400 });
    }
    values.push(limit);
    updates.push(`monthly_limit = $${values.length}`);
  }

  if (status !== undefined) {
    if (status !== 'active' && status !== 'suspended') {
      return NextResponse.json({ error: 'El estado no es válido.' }, { status: 400 });
    }
    values.push(status);
    updates.push(`status = $${values.length}`);
  }

  if (role !== undefined) {
    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json({ error: 'El rol no es válido.' }, { status: 400 });
    }
    values.push(role);
    updates.push(`role = $${values.length}`);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No hay nada que cambiar.' }, { status: 400 });
  }

  // Un administrador no puede degradarse ni suspenderse a sí mismo: evita
  // quedarse sin ningún administrador con acceso.
  if (id === admin.id && (role === 'user' || status === 'suspended')) {
    return NextResponse.json(
      { error: 'No puedes retirarte a ti mismo el acceso de administrador.' },
      { status: 400 },
    );
  }

  values.push(id);
  const updated = await queryOne<{ id: string }>(
    `update users set ${updates.join(', ')} where id = $${values.length} returning id`,
    values,
  );

  if (!updated) {
    return NextResponse.json({ error: 'Ese usuario no existe.' }, { status: 404 });
  }

  // Suspender cierra la sesión abierta del usuario de inmediato.
  if (status === 'suspended') {
    await query('delete from sessions where user_id = $1', [id]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: 'Usuario no válido.' }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
  }

  const deleted = await queryOne<{ id: string }>('delete from users where id = $1 returning id', [id]);
  if (!deleted) {
    return NextResponse.json({ error: 'Ese usuario no existe.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
