import type { User } from '@supabase/supabase-js';
import type { ChildProfile, GeneratedLetter, Memory, SavedLetter } from '../types';
import { getCurrentMonthLabel } from './letterGenerator';
import { supabase } from './supabaseClient';

type ChildRow = {
  id: string;
  name: string;
  age: string;
  tone: string;
};

type MemoryRow = {
  id: string;
  child_id: string | null;
  child_name: string;
  type: string;
  body: string;
  memory_date: string;
  accent: string;
  photo_path: string | null;
};

type LetterRow = {
  id: string;
  child_id: string | null;
  title: string;
  body: string;
  month: string;
  source_memory_ids: string[];
  created_at: string;
  children?: { name: string } | null;
};

export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getUser();

  return data.user;
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export async function loadUserData(user: User) {
  if (!supabase) {
    return { children: [], letters: [], memories: [] };
  }

  const [
    { data: children, error: childrenError },
    { data: memories, error: memoriesError },
    { data: letters, error: lettersError },
  ] = await Promise.all([
    supabase.from('children').select('id,name,age,tone').eq('user_id', user.id).order('created_at', { ascending: true }),
    supabase.from('memories').select('id,child_id,child_name,type,body,memory_date,accent,photo_path').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('letters').select('id,child_id,title,body,month,source_memory_ids,created_at,children(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);

  if (childrenError) {
    throw childrenError;
  }

  if (memoriesError) {
    throw memoriesError;
  }

  if (lettersError) {
    throw lettersError;
  }

  return {
    children: (children ?? []).map(mapChildRow),
    letters: (letters ?? []).map(mapLetterRow),
    memories: await mapMemoryRows(memories ?? []),
  };
}

export async function createChild(user: User, child: ChildProfile) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.from('children').insert({ user_id: user.id, name: child.name, age: child.age, tone: child.tone }).select('id,name,age,tone').single();

  if (error) {
    throw error;
  }

  return mapChildRow(data);
}

export async function updateChild(child: ChildProfile) {
  if (!supabase || !child.id) {
    throw new Error('Cannot update child without an id.');
  }

  const { data, error } = await supabase.from('children').update({ name: child.name, age: child.age, tone: child.tone }).eq('id', child.id).select('id,name,age,tone').single();

  if (error) {
    throw error;
  }

  return mapChildRow(data);
}

export async function updateMemoriesForChild(child: ChildProfile, accent: string) {
  if (!supabase || !child.id) {
    throw new Error('Cannot update memories without a child id.');
  }

  const { error } = await supabase.from('memories').update({ child_name: child.name, accent }).eq('child_id', child.id);

  if (error) {
    throw error;
  }
}

export async function deleteChild(child: ChildProfile) {
  if (!supabase || !child.id) {
    throw new Error('Cannot delete child without an id.');
  }

  const { error } = await supabase.from('children').delete().eq('id', child.id);

  if (error) {
    throw error;
  }
}

export async function createMemory(user: User, memory: Omit<Memory, 'id'> & { photoFile?: File | null }, child?: ChildProfile) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const memoryId = crypto.randomUUID();
  const photoPath = memory.photoFile ? await uploadMemoryPhoto(user, memoryId, memory.photoFile) : (memory.photoPath ?? null);

  const { data, error } = await supabase
    .from('memories')
    .insert({
      id: memoryId,
      user_id: user.id,
      child_id: child?.id ?? null,
      child_name: memory.child,
      type: memory.type,
      body: memory.body,
      memory_date: new Date().toISOString().slice(0, 10),
      accent: memory.accent,
      photo_path: photoPath,
    })
    .select('id,child_id,child_name,type,body,memory_date,accent,photo_path')
    .single();

  if (error) {
    throw error;
  }

  return mapMemoryRow(data, await getSignedPhotoUrl(data.photo_path));
}

export async function updateMemory(memory: Memory & { photoFile?: File | null }, child?: ChildProfile) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const user = memory.photoFile ? await getCurrentUser() : null;

  if (memory.photoFile && !user) {
    throw new Error('Cannot upload photo without a signed-in user.');
  }

  const photoPath = memory.photoFile && user ? await uploadMemoryPhoto(user, memory.id, memory.photoFile) : (memory.photoPath ?? null);

  const { data, error } = await supabase
    .from('memories')
    .update({
      child_id: child?.id ?? null,
      child_name: memory.child,
      type: memory.type,
      body: memory.body,
      accent: memory.accent,
      photo_path: photoPath,
    })
    .eq('id', memory.id)
    .select('id,child_id,child_name,type,body,memory_date,accent,photo_path')
    .single();

  if (error) {
    throw error;
  }

  return mapMemoryRow(data, await getSignedPhotoUrl(data.photo_path));
}

export async function deleteMemoryById(memoryId: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('memories').delete().eq('id', memoryId);

  if (error) {
    throw error;
  }
}

export async function createLetter(user: User, letter: GeneratedLetter, child?: ChildProfile) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('letters')
    .insert({
      user_id: user.id,
      child_id: child?.id ?? null,
      title: letter.title,
      body: letter.body,
      month: getCurrentMonthLabel(),
      source_memory_ids: letter.sourceMemories.map((memory) => memory.id),
    })
    .select('id,child_id,title,body,month,source_memory_ids,created_at,children(name)')
    .single();

  if (error) {
    throw error;
  }

  return mapLetterRow(data);
}

function mapChildRow(row: ChildRow): ChildProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    tone: row.tone,
  };
}

async function mapMemoryRows(rows: MemoryRow[]) {
  const signedUrls = await Promise.all(rows.map((row) => getSignedPhotoUrl(row.photo_path)));

  return rows.map((row, index) => mapMemoryRow(row, signedUrls[index]));
}

function mapMemoryRow(row: MemoryRow, photoUrl?: string | null): Memory {
  return {
    id: row.id,
    child: row.child_name,
    type: row.type,
    date: formatMemoryDate(row.memory_date),
    body: row.body,
    accent: row.accent,
    photoPath: row.photo_path,
    photoUrl,
  };
}

async function uploadMemoryPhoto(user: User, memoryId: string, file: File) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${user.id}/memories/${memoryId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('memory-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return path;
}

async function getSignedPhotoUrl(photoPath?: string | null) {
  if (!supabase || !photoPath) {
    return null;
  }

  const { data, error } = await supabase.storage.from('memory-photos').createSignedUrl(photoPath, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

function mapLetterRow(row: LetterRow): SavedLetter {
  return {
    id: row.id,
    childName: row.children?.name,
    title: row.title,
    body: row.body,
    month: row.month,
    createdAt: row.created_at,
    sourceMemories: [],
    sourceMemoryIds: row.source_memory_ids,
  };
}

function formatMemoryDate(memoryDate: string) {
  const today = new Date().toISOString().slice(0, 10);

  if (memoryDate === today) {
    return 'Today';
  }

  return new Date(`${memoryDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
