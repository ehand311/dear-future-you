import { CalendarDays } from 'lucide-react';
import type { ChildProfile, Memory } from '../types';
import { MemoryCard } from './MemoryCard';

type MemoryTimelineProps = {
  hasAnyMemories: boolean;
  memories: Memory[];
  onAddMemory: () => void;
  onSelectMemory: (memory: Memory) => void;
  searchQuery: string;
  selectedChild?: ChildProfile;
};

export function MemoryTimeline({ hasAnyMemories, memories, onAddMemory, onSelectMemory, searchQuery, selectedChild }: MemoryTimelineProps) {
  const emptyTitle = searchQuery ? 'No matches found' : selectedChild ? `No memories for ${selectedChild.name} yet` : 'No memories yet';
  const emptyBody = searchQuery
    ? 'Try a different word or clear search to see everything again.'
    : selectedChild
      ? 'Add the first little moment, quote, or milestone for this timeline.'
      : 'Start with one small moment. The monthly letter gets better as these add up.';

  return (
    <section className="mt-6 flex-1 rounded-t-[2rem] bg-slate-50 px-5 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{selectedChild ? `${selectedChild.name}'s timeline` : 'Recent memories'}</h2>
          <p className="text-sm text-slate-500">
            {searchQuery ? `${memories.length} matching memories` : selectedChild ? 'The little moments, in order.' : 'Capture the little stuff before it fades.'}
          </p>
        </div>
        <CalendarDays size={21} className="text-slate-500" />
      </div>

      <div className="mt-4 space-y-3">
        {memories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} onSelectMemory={onSelectMemory} />
        ))}
        {memories.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-semibold">{emptyTitle}</p>
            <p className="mt-1 text-sm text-slate-500">{emptyBody}</p>
            {(!searchQuery || !hasAnyMemories) && (
              <button className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" onClick={onAddMemory}>
                Add memory
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
