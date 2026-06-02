import { children, initialMemories } from '../data/mockMemories';
import type { ChildProfile, Memory } from '../types';

const CHILDREN_STORAGE_KEY = 'dear-future-you.children';
const MEMORY_STORAGE_KEY = 'dear-future-you.memories';

export function loadStoredChildren() {
  if (typeof window === 'undefined') {
    return children;
  }

  try {
    const stored = window.localStorage.getItem(CHILDREN_STORAGE_KEY);

    if (!stored) {
      return children;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed) || !parsed.every(isChildProfile)) {
      return children;
    }

    return parsed;
  } catch {
    return children;
  }
}

export function saveStoredChildren(childProfiles: ChildProfile[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(childProfiles));
}

export function loadStoredMemories() {
  if (typeof window === 'undefined') {
    return initialMemories;
  }

  try {
    const stored = window.localStorage.getItem(MEMORY_STORAGE_KEY);

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

  window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
}

function isChildProfile(value: unknown): value is ChildProfile {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const child = value as Partial<ChildProfile>;

  return typeof child.name === 'string' && typeof child.age === 'string' && typeof child.tone === 'string';
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
