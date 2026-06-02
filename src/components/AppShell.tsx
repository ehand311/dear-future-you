import { useEffect, useMemo, useState } from 'react';
import { childAccent, children, initialMemories, memoryTypes } from '../data/mockMemories';
import { quickActions } from '../data/quickActions';
import { loadStoredMemories, saveStoredMemories } from '../lib/memoryStorage';
import type { Memory, MemoryFormState } from '../types';
import { AddMemorySheet } from './AddMemorySheet';
import { AppHeader } from './AppHeader';
import { CaptureSection } from './CaptureSection';
import { ChildrenStrip } from './ChildrenStrip';
import { MemoryTimeline } from './MemoryTimeline';

export default function AppShell() {
  const [memories, setMemories] = useState(initialMemories);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasRestoredMemories, setHasRestoredMemories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState<MemoryFormState>({
    child: children[0].name,
    type: quickActions[0].type,
    body: '',
    tags: '',
  });

  useEffect(() => {
    setMemories(loadStoredMemories());
    setHasRestoredMemories(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredMemories) {
      return;
    }

    saveStoredMemories(memories);
  }, [hasRestoredMemories, memories]);

  const savedThisMonth = useMemo(() => 15 + memories.length, [memories.length]);
  const selectedChild = children.find((child) => child.name === activeChild);
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
        accent: childAccent[form.child] ?? 'border-slate-200',
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
        <ChildrenStrip activeChild={activeChild} children={children} onSelectChild={openChildTimeline} />
        <MemoryTimeline memories={visibleMemories} onAddMemory={() => openSheet('Memory', activeChild ?? form.child)} searchQuery={searchQuery} selectedChild={selectedChild} />
      </div>

      {isSheetOpen && <AddMemorySheet children={children} form={form} memoryTypes={memoryTypes} onClose={closeSheet} onSave={saveMemory} onUpdateForm={updateForm} />}
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
