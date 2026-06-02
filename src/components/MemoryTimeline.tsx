import { CalendarDays } from 'lucide-react';
import type { ChildProfile, Memory } from '../types';
import { MemoryCard } from './MemoryCard';

type MemoryTimelineProps = {
  memories: Memory[];
  onAddMemory: () => void;
  searchQuery: string;
  selectedChild?: ChildProfile;
};

export function MemoryTimeline({ memories, onAddMemory, searchQuery, selectedChild }: MemoryTimelineProps) {
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
          <MemoryCard key={memory.id} memory={memory} />
        ))}
        {memories.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-semibold">No memories found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or add a new moment.</p>
            <button className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" onClick={onAddMemory}>
              Add memory
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
