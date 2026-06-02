import { ArrowLeft, ChevronRight, Heart, Plus, Sparkles } from 'lucide-react';
import type { ChildProfile } from '../types';

type AppHeaderProps = {
  childMemoryCount: number;
  onAddMemory: () => void;
  onBack: () => void;
  savedThisMonth: number;
  selectedChild?: ChildProfile;
};

export function AppHeader({ childMemoryCount, onAddMemory, onBack, savedThisMonth, selectedChild }: AppHeaderProps) {
  return (
    <header className="px-5 pb-4 pt-5">
      <div className="flex items-center justify-between">
        {selectedChild ? (
          <div className="flex items-center gap-3">
            <button className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700" onClick={onBack} aria-label="Back to home" title="Back to home">
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-sm font-medium text-slate-500">{selectedChild.age}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal">{selectedChild.name}</h1>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-slate-500">Monday, June 1</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">DearFutureYou</h1>
          </div>
        )}
        <button className="grid size-11 place-items-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-300" aria-label="Add memory" title="Add memory" onClick={onAddMemory}>
          <Plus size={22} />
        </button>
      </div>

      <section className="mt-5 rounded-[2rem] bg-slate-950 p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/65">{selectedChild ? 'Timeline' : 'This month'}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              {selectedChild ? `${childMemoryCount} memories for ${selectedChild.name}` : `${savedThisMonth} small moments saved`}
            </h2>
          </div>
          <Heart className="mt-1 text-rose-300" size={26} />
        </div>
        <button className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left text-slate-950">
          <span className="flex items-center gap-3 text-sm font-semibold">
            <Sparkles size={18} className="text-violet-600" />
            Generate June letter
          </span>
          <ChevronRight size={18} />
        </button>
      </section>
    </header>
  );
}
