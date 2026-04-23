import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import type { Href } from 'expo-router';
import { useAppSelector } from '@/hooks/useAppStore';
import type { UserRole } from '@/types/user.types';

/**
 * Hook to protect a route group by role.
 * Call it in a layout to redirect unauthenticated or unauthorized users.
 *
 * @param allowedRole - the role required to access this route group
 */
export function useAuthGuard(allowedRole: UserRole) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/(auth)/login' as Href);
      return;
    }
    if (user.role !== allowedRole) {
      // Redirect to the correct role group
      switch (user.role) {
        case 'admin':
          router.replace('/(admin)' as Href);
          break;
        case 'commercial':
          router.replace('/(commercial)' as Href);
          break;
        case 'client':
        default:
          router.replace('/(client)/catalog' as Href);
      }
    }
  }, [isAuthenticated, user, allowedRole]);
}
