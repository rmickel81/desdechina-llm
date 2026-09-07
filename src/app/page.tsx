import { redirect } from 'next/navigation';
import Chat from '@/components/Chat';
import { getCurrentUser, getMonthlyUsage } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect('/entrar');

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
