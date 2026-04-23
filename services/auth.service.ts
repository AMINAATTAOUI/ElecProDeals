import { api, STORAGE_KEYS } from './api';
import { encryptedStorage } from '@/lib/mmkvStorage';
import type { AuthUser } from '@/types/user.types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });

    // Persist tokens in encrypted storage
    encryptedStorage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    encryptedStorage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

    return data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<{ user: AuthUser }>('/auth/me');
    return data.user;
  },

  logout(): void {
    encryptedStorage.delete(STORAGE_KEYS.ACCESS_TOKEN);
    encryptedStorage.delete(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: encryptedStorage.getString(STORAGE_KEYS.ACCESS_TOKEN) ?? null,
      refreshToken: encryptedStorage.getString(STORAGE_KEYS.REFRESH_TOKEN) ?? null,
    };
  },
};
