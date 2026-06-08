import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminToken() {
  const [token, setToken] = useState<string>('');
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/login');
          return null;
        }
        return r.json() as Promise<{ token: string }>;
      })
      .then((data) => {
        if (data?.token) setToken(data.token);
      })
      .finally(() => setReady(true));
  }, [router]);

  return { token, ready };
}
