import Chat from '@/components/Chat';
import Landing from '@/components/Landing';
import { getCurrentUser, getMonthlyUsage } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();
  // Sin sesión, la portada explica qué es esto. Antes redirigía a /entrar y
  // quien llegaba de fuera se encontraba un formulario a pelo.
  if (!user) return <Landing />;

  const used = await getMonthlyUsage(user.id);

  return (
    <Chat
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        monthly_limit: user.monthly_limit,
      }}
      initialUsed={used}
    />
  );
}
