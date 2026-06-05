import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { childAccent, children as initialChildren, initialMemories, memoryTypes } from '../data/mockMemories';
import { quickActions } from '../data/quickActions';
import { generateMonthlyLetter } from '../lib/letterGenerator';
import { loadStoredChildren, loadStoredMemories, saveStoredChildren, saveStoredMemories } from '../lib/memoryStorage';
import {
  createChild,
  createMemory,
  deleteChild,
  deleteMemoryById,
  getCurrentUser,
  loadUserData,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updateChild,
  updateMemoriesForChild,
  updateMemory,
} from '../lib/supabaseRepository';
import type { ChildProfile, ChildProfileFormState, GeneratedLetter, Memory, MemoryFormState } from '../types';
import { AddMemorySheet } from './AddMemorySheet';
import { AppHeader } from './AppHeader';
import { AuthPanel } from './AuthPanel';
import { ChildProfileSheet } from './ChildProfileSheet';
import { CaptureSection } from './CaptureSection';
import { ChildrenStrip } from './ChildrenStrip';
import { LetterSheet } from './LetterSheet';
import { MemoryTimeline } from './MemoryTimeline';

export default function AppShell() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [childProfiles, setChildProfiles] = useState(initialChildren);
  const [memories, setMemories] = useState(initialMemories);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChildSheetOpen, setIsChildSheetOpen] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<GeneratedLetter | null>(null);
  const [isManagingChildren, setIsManagingChildren] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState<number | null>(null);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChildName, setEditingChildName] = useState<string | null>(null);
  const [childForm, setChildForm] = useState<ChildProfileFormState>({
    name: '',
    age: '',
    tone: initialChildren[0].tone,
  });
  const [form, setForm] = useState<MemoryFormState>({
    child: initialChildren[0].name,
    type: quickActions[0].type,
    body: '',
    tags: '',
  });

  useEffect(() => {
    async function restoreData() {
      const user = await getCurrentUser();

      if (user) {
        setCurrentUser(user);
        await loadRemoteData(user);
        return;
      }

      const storedChildren = loadStoredChildren();

      setChildProfiles(storedChildren);
      setMemories(loadStoredMemories());
      setForm((current) => ({ ...current, child: storedChildren[0]?.name ?? '' }));
      setHasRestoredData(true);
      setIsDataLoading(false);
    }

    void restoreData();
  }, []);

  useEffect(() => {
    if (!hasRestoredData) {
      return;
    }

    if (!currentUser) {
      saveStoredMemories(memories);
    }
  }, [currentUser, hasRestoredData, memories]);

  useEffect(() => {
    if (!hasRestoredData) {
      return;
    }

    if (!currentUser) {
      saveStoredChildren(childProfiles);
    }
  }, [childProfiles, currentUser, hasRestoredData]);

  const savedThisMonth = useMemo(() => memories.length, [memories.length]);
  const selectedChild = childProfiles.find((child) => child.name === activeChild);
  const visibleMemories = useMemo(() => filterMemories(memories, activeChild, searchQuery), [activeChild, memories, searchQuery]);
  const childMemoryCount = useMemo(() => {
    if (!activeChild) {
      return memories.length;
    }

    return memories.filter((memory) => memory.child === activeChild).length;
  }, [activeChild, memories]);

  function openSheet(type = 'Memory', child = activeChild ?? form.child) {
    if (childProfiles.length === 0) {
      openAddChildSheet();
      return;
    }

    setEditingMemoryId(null);
    setForm((current) => ({ ...current, child, type }));
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
    setEditingMemoryId(null);
  }

  function updateForm(field: keyof MemoryFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateChildForm(field: keyof ChildProfileFormState, value: string) {
    setChildForm((current) => ({ ...current, [field]: value }));
  }

  async function saveMemory() {
    if (!form.body.trim()) {
      return;
    }

    if (editingMemoryId) {
      const nextMemory = {
        id: editingMemoryId,
        child: form.child,
        type: form.type,
        date: memories.find((memory) => memory.id === editingMemoryId)?.date ?? 'Today',
        body: form.body.trim(),
        accent: getChildAccent(form.child, childProfiles),
      };
      const child = childProfiles.find((profile) => profile.name === form.child);
      const savedMemory = currentUser ? await updateMemory(nextMemory, child) : nextMemory;

      setMemories((current) => current.map((memory) => (memory.id === editingMemoryId ? savedMemory : memory)));
      setForm((current) => ({ ...current, body: '', tags: '' }));
      setEditingMemoryId(null);
      setIsSheetOpen(false);
      return;
    }

    const nextMemory = {
      child: form.child,
      type: form.type,
      date: 'Just now',
      body: form.body.trim(),
      accent: getChildAccent(form.child, childProfiles),
    };
    const child = childProfiles.find((profile) => profile.name === form.child);
    const savedMemory = currentUser ? await createMemory(currentUser, nextMemory, child) : { id: Date.now().toString(), ...nextMemory };

    setMemories((current) => [savedMemory, ...current]);
    setForm((current) => ({ ...current, body: '', tags: '' }));
    setIsSheetOpen(false);
  }

  function openEditMemorySheet(memory: Memory) {
    setEditingMemoryId(memory.id);
    setForm({
      child: memory.child,
      type: memory.type,
      body: memory.body,
      tags: '',
    });
    setIsSheetOpen(true);
  }

  async function deleteMemory() {
    if (!editingMemoryId) {
      return;
    }

    if (currentUser) {
      await deleteMemoryById(editingMemoryId);
    }

    setMemories((current) => current.filter((memory) => memory.id !== editingMemoryId));
    setForm((current) => ({ ...current, body: '', tags: '' }));
    setEditingMemoryId(null);
    setIsSheetOpen(false);
  }

  function openChildTimeline(child: string) {
    setActiveChild(child);
    setSearchQuery('');
    setIsSearchOpen(false);
  }

  function returnHome() {
    setActiveChild(null);
    setSearchQuery('');
    setIsSearchOpen(false);
  }

  function openAddChildSheet() {
    setEditingChildName(null);
    setChildForm({ name: '', age: '', tone: pickNextTone(childProfiles.length) });
    setIsChildSheetOpen(true);
  }

  function openEditChildSheet(child: ChildProfile) {
    setEditingChildName(child.name);
    setChildForm({ name: child.name, age: child.age, tone: child.tone });
    setIsChildSheetOpen(true);
  }

  function closeChildSheet() {
    setIsChildSheetOpen(false);
  }

  async function saveChildProfile() {
    const nextName = childForm.name.trim();

    if (!nextName) {
      return;
    }

    const nextChild = {
      id: childProfiles.find((child) => child.name === editingChildName)?.id,
      name: nextName,
      age: childForm.age.trim() || 'Age not set',
      tone: childForm.tone,
    };

    if (!editingChildName) {
      const savedChild = currentUser ? await createChild(currentUser, nextChild) : nextChild;

      setChildProfiles((current) => [...current, savedChild]);
      setForm((current) => ({ ...current, child: savedChild.name }));
      setIsChildSheetOpen(false);
      setIsManagingChildren(false);
      return;
    }

    const savedChild = currentUser ? await updateChild(nextChild) : nextChild;
    const savedChildAccent = getChildAccent(savedChild.name, [savedChild]);

    if (currentUser) {
      await updateMemoriesForChild(savedChild, savedChildAccent);
    }

    setChildProfiles((current) => current.map((child) => (child.name === editingChildName ? savedChild : child)));
    setMemories((current) => current.map((memory) => (memory.child === editingChildName ? { ...memory, child: savedChild.name, accent: savedChildAccent } : memory)));

    if (activeChild === editingChildName) {
      setActiveChild(savedChild.name);
    }

    setForm((current) => ({ ...current, child: current.child === editingChildName ? savedChild.name : current.child }));
    setIsChildSheetOpen(false);
    setIsManagingChildren(false);
  }

  async function deleteChildProfile() {
    if (!editingChildName || childProfiles.length <= 1) {
      return;
    }

    const childToDelete = childProfiles.find((child) => child.name === editingChildName);

    if (currentUser && childToDelete) {
      await deleteChild(childToDelete);
    }

    const remainingChildren = childProfiles.filter((child) => child.name !== editingChildName);
    const fallbackChild = remainingChildren[0]?.name ?? '';

    setChildProfiles(remainingChildren);
    setMemories((current) => current.filter((memory) => memory.child !== editingChildName));
    setActiveChild((current) => (current === editingChildName ? null : current));
    setForm((current) => ({ ...current, child: current.child === editingChildName ? fallbackChild : current.child }));
    setIsChildSheetOpen(false);
    setIsManagingChildren(false);
  }

  function openMonthlyLetter() {
    const letterMemories = activeChild ? memories.filter((memory) => memory.child === activeChild) : memories;

    setGeneratedLetter(generateMonthlyLetter(letterMemories, selectedChild));
  }

  async function loadRemoteData(user: User) {
    setIsDataLoading(true);
    setAuthError('');

    try {
      const remoteData = await loadUserData(user);

      setChildProfiles(remoteData.children);
      setMemories(remoteData.memories);
      setForm((current) => ({ ...current, child: remoteData.children[0]?.name ?? '' }));
      setHasRestoredData(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not load Supabase data.');
    } finally {
      setIsDataLoading(false);
    }
  }

  async function handleSignIn(email: string, password: string) {
    setIsAuthLoading(true);
    setAuthError('');

    try {
      await signInWithPassword(email, password);
      const user = await getCurrentUser();

      setCurrentUser(user);

      if (user) {
        await loadRemoteData(user);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign in.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSignUp(email: string, password: string) {
    setIsAuthLoading(true);
    setAuthError('');

    try {
      await signUpWithPassword(email, password);
      const user = await getCurrentUser();

      if (!user) {
        setAuthError('Check your email to confirm your account, then sign in.');
        return;
      }

      setCurrentUser(user);
      await loadRemoteData(user);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign up.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setCurrentUser(null);
    setChildProfiles(loadStoredChildren());
    setMemories(loadStoredMemories());
  }

  if (isDataLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f4ef] px-5 text-slate-950">
        <p className="text-sm font-semibold text-slate-500">Loading your family vault...</p>
      </main>
    );
  }

  if (!currentUser) {
    return <AuthPanel errorMessage={authError} isLoading={isAuthLoading} onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fffdf8] shadow-2xl shadow-slate-200/70">
        <AppHeader
          childMemoryCount={childMemoryCount}
          onAddMemory={() => openSheet('Memory', activeChild ?? form.child)}
          onBack={returnHome}
          onGenerateLetter={openMonthlyLetter}
          onSignOut={handleSignOut}
          savedThisMonth={savedThisMonth}
          selectedChild={selectedChild}
          userEmail={currentUser.email}
        />
        <CaptureSection
          actions={quickActions}
          isSearchOpen={isSearchOpen}
          onSelectAction={(type) => openSheet(type, activeChild ?? form.child)}
          onToggleSearch={() => setIsSearchOpen((current) => !current)}
          searchQuery={searchQuery}
          selectedChild={selectedChild}
          setSearchQuery={setSearchQuery}
        />
        <ChildrenStrip
          activeChild={activeChild}
          children={childProfiles}
          isManagingChildren={isManagingChildren}
          onAddChild={openAddChildSheet}
          onEditChild={openEditChildSheet}
          onSelectChild={openChildTimeline}
          onToggleManageChildren={() => setIsManagingChildren((current) => !current)}
        />
        <MemoryTimeline
          hasAnyMemories={memories.length > 0}
          memories={visibleMemories}
          onAddMemory={() => openSheet('Memory', activeChild ?? form.child)}
          onSelectMemory={openEditMemorySheet}
          searchQuery={searchQuery}
          selectedChild={selectedChild}
        />
      </div>

      {isSheetOpen && (
        <AddMemorySheet
          children={childProfiles}
          form={form}
          isEditing={Boolean(editingMemoryId)}
          memoryTypes={memoryTypes}
          onClose={closeSheet}
          onDelete={editingMemoryId ? deleteMemory : undefined}
          onSave={saveMemory}
          onUpdateForm={updateForm}
        />
      )}
      {isChildSheetOpen && (
        <ChildProfileSheet
          editingChildName={editingChildName}
          form={childForm}
          onClose={closeChildSheet}
          onDelete={editingChildName && childProfiles.length > 1 ? deleteChildProfile : undefined}
          onSave={saveChildProfile}
          onUpdateForm={updateChildForm}
        />
      )}
      {generatedLetter && <LetterSheet letter={generatedLetter} onClose={() => setGeneratedLetter(null)} />}
    </main>
  );
}

function filterMemories(memories: Memory[], activeChild: string | null, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();

  return memories.filter((memory) => {
    const matchesChild = activeChild ? memory.child === activeChild : true;
    const matchesSearch = query ? `${memory.child} ${memory.type} ${memory.body} ${memory.date}`.toLowerCase().includes(query) : true;

    return matchesChild && matchesSearch;
  });
}

function pickNextTone(index: number) {
  const tones = ['bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700', 'bg-amber-100 text-amber-700', 'bg-violet-100 text-violet-700'];

  return tones[index % tones.length];
}

function getChildAccent(childName: string, childProfiles: ChildProfile[]) {
  const child = childProfiles.find((profile) => profile.name === childName);
  const toneAccent = child?.tone.split(' ')[0].replace('bg-', 'border-').replace('100', '200');

  return childAccent[childName] ?? toneAccent ?? 'border-slate-200';
}
