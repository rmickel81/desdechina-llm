import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';

export const metadata = { title: 'Entrar · DesdeChina LLM' };

export default async function EntrarPage() {
  if (await getCurrentUser()) redirect('/');
  return <AuthForm mode="entrar" />;
}
