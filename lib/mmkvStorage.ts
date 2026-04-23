/**
 * Storage abstraction — Expo Go compatible (in-memory).
 * Replace with MMKV implementation for EAS / production builds:
 *   import { MMKV } from 'react-native-mmkv';
 *   export const storage = new MMKV();
 */

interface KeyValueStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

// Simple synchronous in-memory store — works in Expo Go
const _store: Map<string, string> = new Map();
const _encryptedStore: Map<string, string> = new Map();

// Matches MMKV public API so the switch is a one-liner when using EAS
export const storage = {
  getString: (key: string): string | undefined => _store.get(key),
  set: (key: string, value: string): void => { _store.set(key, value); },
  delete: (key: string): void => { _store.delete(key); },
};

export const encryptedStorage = {
  getString: (key: string): string | undefined => _encryptedStore.get(key),
  set: (key: string, value: string): void => { _encryptedStore.set(key, value); },
  delete: (key: string): void => { _encryptedStore.delete(key); },
};

export const mmkvStorage: KeyValueStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const mmkvEncryptedStorage: KeyValueStorage = {
  getItem: (name: string) => encryptedStorage.getString(name) ?? null,
  setItem: (name: string, value: string) => encryptedStorage.set(name, value),
  removeItem: (name: string) => encryptedStorage.delete(name),
};
