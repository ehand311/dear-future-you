import type { ChildProfile, GeneratedLetter, Memory } from '../types';
import { generateMonthlyLetter } from './letterGenerator';
import { supabase } from './supabaseClient';

type AiLetterResponse = {
  body: string;
};

export async function generateAiMonthlyLetter(memories: Memory[], selectedChild?: ChildProfile): Promise<GeneratedLetter> {
  const fallbackLetter = generateMonthlyLetter(memories, selectedChild);

  if (!supabase) {
    return fallbackLetter;
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    return fallbackLetter;
  }

  try {
    const response = await fetch('/api/generate-letter', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        child: selectedChild
          ? {
              age: selectedChild.age,
              name: selectedChild.name,
            }
          : null,
        memories: memories.map((memory) => ({
          body: memory.body,
          child: memory.child,
          date: memory.date,
          type: memory.type,
        })),
        title: fallbackLetter.title,
      }),
    });

    if (!response.ok) {
      return fallbackLetter;
    }

    const letter = (await response.json()) as AiLetterResponse;

    if (!letter.body?.trim()) {
      return fallbackLetter;
    }

    return {
      ...fallbackLetter,
      body: letter.body.trim(),
    };
  } catch {
    return fallbackLetter;
  }
}
