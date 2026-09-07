import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';

export const metadata = { title: 'Crear cuenta · DesdeChina LLM' };

export default async function RegistroPage() {
  if (await getCurrentUser()) redirect('/');
  return <AuthForm mode="registro" />;
}
