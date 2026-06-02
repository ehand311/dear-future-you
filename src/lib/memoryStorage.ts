import { initialMemories } from '../data/mockMemories';
import type { Memory } from '../types';

const STORAGE_KEY = 'dear-future-you.memories';

export function loadStoredMemories() {
  if (typeof window === 'undefined') {
    return initialMemories;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return initialMemories;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || !parsed.every(isMemory)) {
      return initialMemories;
    }

    return parsed;
  } catch {
    return initialMemories;
  }
}

export function saveStoredMemories(memories: Memory[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const memory = value as Partial<Memory>;

  return (
    typeof memory.id === 'number' &&
    typeof memory.child === 'string' &&
    typeof memory.type === 'string' &&
    typeof memory.date === 'string' &&
    typeof memory.body === 'string' &&
    typeof memory.accent === 'string'
  );
}
