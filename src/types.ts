import type { LucideIcon } from 'lucide-react';

export type ChildProfile = {
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
  id: number;
  child: string;
  type: string;
  date: string;
  body: string;
  accent: string;
};

export type GeneratedLetter = {
  title: string;
  body: string;
  sourceMemories: Memory[];
};

export type MemoryFormState = {
  child: string;
  type: string;
  body: string;
  tags: string;
};

export type QuickAction = {
  label: string;
  type: string;
  icon: LucideIcon;
  tone: string;
};
