import { MMKV } from 'react-native-mmkv';

interface KeyValueStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export const storage = new MMKV();
export const encryptedStorage = new MMKV({ id: 'encrypted-storage' });

export const mmkvStorage: KeyValueStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
} as const;

export const mmkvEncryptedStorage: KeyValueStorage = {
  getItem: (name: string) => {
    const value = encryptedStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    encryptedStorage.delete(name);
  },
  setItem: (name: string, value: string) => {
    encryptedStorage.set(name, value);
  },
} as const;
