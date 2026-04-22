import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { useAppSelector } from '@/hooks/useAppStore';

export default function RootIndex() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  switch (user.role) {
    case 'admin':
      return <Redirect href={'/(admin)' as Href} />;
    case 'commercial':
      return <Redirect href={'/(commercial)' as Href} />;
    case 'client':
    default:
      return <Redirect href={'/(client)/catalog' as Href} />;
  }
}
