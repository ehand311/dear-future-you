import { useEffect, useMemo, useState } from 'react';
import { childAccent, children as initialChildren, initialMemories, memoryTypes } from '../data/mockMemories';
import { quickActions } from '../data/quickActions';
import { loadStoredChildren, loadStoredMemories, saveStoredChildren, saveStoredMemories } from '../lib/memoryStorage';
import type { ChildProfile, ChildProfileFormState, Memory, MemoryFormState } from '../types';
import { AddMemorySheet } from './AddMemorySheet';
import { AppHeader } from './AppHeader';
import { ChildProfileSheet } from './ChildProfileSheet';
import { CaptureSection } from './CaptureSection';
import { ChildrenStrip } from './ChildrenStrip';
import { MemoryTimeline } from './MemoryTimeline';

export default function AppShell() {
  const [childProfiles, setChildProfiles] = useState(initialChildren);
  const [memories, setMemories] = useState(initialMemories);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChildSheetOpen, setIsChildSheetOpen] = useState(false);
  const [isManagingChildren, setIsManagingChildren] = useState(false);
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
    const storedChildren = loadStoredChildren();

    setChildProfiles(storedChildren);
    setMemories(loadStoredMemories());
    setForm((current) => ({ ...current, child: storedChildren[0]?.name ?? '' }));
    setHasRestoredData(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredData) {
      return;
    }

    saveStoredMemories(memories);
  }, [hasRestoredData, memories]);

  useEffect(() => {
    if (!hasRestoredData) {
      return;
    }

    saveStoredChildren(childProfiles);
  }, [childProfiles, hasRestoredData]);

  const savedThisMonth = useMemo(() => 15 + memories.length, [memories.length]);
  const selectedChild = childProfiles.find((child) => child.name === activeChild);
  const visibleMemories = useMemo(() => filterMemories(memories, activeChild, searchQuery), [activeChild, memories, searchQuery]);
  const childMemoryCount = useMemo(() => {
    if (!activeChild) {
      return memories.length;
    }

    return memories.filter((memory) => memory.child === activeChild).length;
  }, [activeChild, memories]);

  function openSheet(type = 'Memory', child = activeChild ?? form.child) {
    setForm((current) => ({ ...current, child, type }));
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
  }

  function updateForm(field: keyof MemoryFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateChildForm(field: keyof ChildProfileFormState, value: string) {
    setChildForm((current) => ({ ...current, [field]: value }));
  }

  function saveMemory() {
    if (!form.body.trim()) {
      return;
    }

    setMemories((current) => [
      {
        id: Date.now(),
        child: form.child,
        type: form.type,
        date: 'Just now',
        body: form.body.trim(),
        accent: getChildAccent(form.child, childProfiles),
      },
      ...current,
    ]);
    setForm((current) => ({ ...current, body: '', tags: '' }));
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

  function saveChildProfile() {
    const nextName = childForm.name.trim();

    if (!nextName) {
      return;
    }

    const nextChild = {
      name: nextName,
      age: childForm.age.trim() || 'Age not set',
      tone: childForm.tone,
    };

    if (!editingChildName) {
      setChildProfiles((current) => [...current, nextChild]);
      setForm((current) => ({ ...current, child: nextChild.name }));
      setIsChildSheetOpen(false);
      setIsManagingChildren(false);
      return;
    }

    setChildProfiles((current) => current.map((child) => (child.name === editingChildName ? nextChild : child)));
    setMemories((current) => current.map((memory) => (memory.child === editingChildName ? { ...memory, child: nextChild.name, accent: getChildAccent(nextChild.name, [nextChild]) } : memory)));

    if (activeChild === editingChildName) {
      setActiveChild(nextChild.name);
    }

    setForm((current) => ({ ...current, child: current.child === editingChildName ? nextChild.name : current.child }));
    setIsChildSheetOpen(false);
    setIsManagingChildren(false);
  }

  function deleteChildProfile() {
    if (!editingChildName || childProfiles.length <= 1) {
      return;
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

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fffdf8] shadow-2xl shadow-slate-200/70">
        <AppHeader childMemoryCount={childMemoryCount} onAddMemory={() => openSheet('Memory', activeChild ?? form.child)} onBack={returnHome} savedThisMonth={savedThisMonth} selectedChild={selectedChild} />
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
        <MemoryTimeline memories={visibleMemories} onAddMemory={() => openSheet('Memory', activeChild ?? form.child)} searchQuery={searchQuery} selectedChild={selectedChild} />
      </div>

      {isSheetOpen && <AddMemorySheet children={childProfiles} form={form} memoryTypes={memoryTypes} onClose={closeSheet} onSave={saveMemory} onUpdateForm={updateForm} />}
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
