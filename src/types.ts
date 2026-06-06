import type { LucideIcon } from 'lucide-react';

export type ChildProfile = {
  id?: string;
  name: string;
  age: string;
  tone: string;
};

export type ChildProfileFormState = {
  name: string;
  age: string;
  tone: string;
};

export type Memory = {
  id: string;
  child: string;
  type: string;
  date: string;
  body: string;
  accent: string;
  photoPath?: string | null;
  photoUrl?: string | null;
};

export type GeneratedLetter = {
  title: string;
  body: string;
  sourceMemories: Memory[];
};

export type SavedLetter = GeneratedLetter & {
  id: string;
  childName?: string;
  createdAt: string;
  month: string;
  sourceMemoryIds: string[];
};

export type MemoryFormState = {
  child: string;
  type: string;
  body: string;
  tags: string;
  photoFile: File | null;
  photoPreviewUrl: string;
  photoPath: string | null;
};

export type QuickAction = {
  label: string;
  type: string;
  icon: LucideIcon;
  tone: string;
};
