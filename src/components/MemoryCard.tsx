import type { Memory } from '../types';

type MemoryCardProps = {
  memory: Memory;
  onSelectMemory: (memory: Memory) => void;
};

export function MemoryCard({ memory, onSelectMemory }: MemoryCardProps) {
  return (
    <button className={`block w-full rounded-3xl border bg-white p-4 text-left shadow-sm shadow-slate-200/70 ${memory.accent}`} onClick={() => onSelectMemory(memory)} aria-label={`Edit memory for ${memory.child}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{memory.child}</p>
        <p className="text-xs font-medium text-slate-500">{memory.date}</p>
      </div>
      <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{memory.type}</p>
      {memory.photoUrl && <img className="mt-3 aspect-[4/3] w-full rounded-2xl object-cover" src={memory.photoUrl} alt={`Photo attached to ${memory.child}'s memory`} />}
      <p className="mt-3 text-sm leading-6 text-slate-700">{memory.body}</p>
    </button>
  );
}
