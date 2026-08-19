import { User, SituacaoRegistro } from '../types';
import { DEFAULT_USERS, INITIAL_REGISTROS } from '../data/mockData';

const USER_KEY = 'guardioes_chaves_user';
const REGISTROS_KEY = 'guardioes_chaves_situacoes_v2';

// In-memory fallback if localStorage is blocked (e.g., third-party cookies disabled in iframe/sandbox)
let memoryUser: User = DEFAULT_USERS[0];
let memoryRegistros: SituacaoRegistro[] = [...INITIAL_REGISTROS];

export function getStoredUser(): User {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id && parsed.nome) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read user from localStorage, using memory:', e);
  }
  return memoryUser;
}

export function setStoredUser(user: User): void {
  memoryUser = user;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('Could not save user to localStorage:', e);
  }
}

export function getRegistros(): SituacaoRegistro[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(REGISTROS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryRegistros = parsed;
          return parsed;
        }
      }
      // Initialize with seed data in storage
      window.localStorage.setItem(REGISTROS_KEY, JSON.stringify(INITIAL_REGISTROS));
    }
  } catch (e) {
    console.warn('Could not load registros from localStorage:', e);
  }
  return memoryRegistros;
}

export function saveRegistro(item: SituacaoRegistro): SituacaoRegistro[] {
  const current = getRegistros();
  const updated = [item, ...current.filter((r) => r.id !== item.id)];
  memoryRegistros = updated;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(REGISTROS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Could not save registro to localStorage:', e);
  }
  return updated;
}

