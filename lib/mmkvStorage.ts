import { createMMKV } from 'react-native-mmkv';

interface KeyValueStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export const storage = createMMKV();
export const encryptedStorage = createMMKV();

export const mmkvStorage: KeyValueStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.remove(name);
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
    encryptedStorage.remove(name);
  },
  setItem: (name: string, value: string) => {
    encryptedStorage.set(name, value);
  },
} as const;
