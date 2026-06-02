import { Baby } from 'lucide-react';
import type { ChildProfile } from '../types';

type ChildrenStripProps = {
  activeChild: string | null;
  children: ChildProfile[];
  onSelectChild: (child: string) => void;
};

export function ChildrenStrip({ activeChild, children, onSelectChild }: ChildrenStripProps) {
  return (
    <section className="mt-6 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Children</h2>
        <button className="text-sm font-semibold text-slate-500">Edit</button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {children.map((child) => (
          <button
            key={child.name}
            className={`flex min-w-32 items-center gap-3 rounded-3xl border bg-white p-3 shadow-sm shadow-slate-200/70 ${
              activeChild === child.name ? 'border-slate-950' : 'border-slate-100'
            }`}
            onClick={() => onSelectChild(child.name)}
          >
            <span className={`grid size-10 place-items-center rounded-2xl ${child.tone}`}>
              <Baby size={19} />
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">{child.name}</span>
              <span className="block text-xs text-slate-500">{child.age}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
