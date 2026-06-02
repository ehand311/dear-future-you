import type { Memory } from '../types';

type MemoryCardProps = {
  memory: Memory;
};

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <article className={`rounded-3xl border bg-white p-4 shadow-sm shadow-slate-200/70 ${memory.accent}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{memory.child}</p>
        <p className="text-xs font-medium text-slate-500">{memory.date}</p>
      </div>
      <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{memory.type}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{memory.body}</p>
    </article>
  );
}
