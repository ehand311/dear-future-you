import { Baby, Pencil, Plus } from 'lucide-react';
import type { ChildProfile } from '../types';

type ChildrenStripProps = {
  activeChild: string | null;
  isManagingChildren: boolean;
  children: ChildProfile[];
  onAddChild: () => void;
  onEditChild: (child: ChildProfile) => void;
  onSelectChild: (child: string) => void;
  onToggleManageChildren: () => void;
};

export function ChildrenStrip({ activeChild, children, isManagingChildren, onAddChild, onEditChild, onSelectChild, onToggleManageChildren }: ChildrenStripProps) {
  return (
    <section className="mt-6 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Children</h2>
        <button className="text-sm font-semibold text-slate-500" onClick={onToggleManageChildren}>
          {isManagingChildren ? 'Done' : 'Edit'}
        </button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {children.map((child) => (
          <button
            key={child.name}
            aria-label={isManagingChildren ? `Edit ${child.name}` : `Open ${child.name} timeline`}
            className={`flex min-w-32 items-center gap-3 rounded-3xl border bg-white p-3 shadow-sm shadow-slate-200/70 ${
              activeChild === child.name ? 'border-slate-950' : 'border-slate-100'
            }`}
            onClick={() => (isManagingChildren ? onEditChild(child) : onSelectChild(child.name))}
          >
            <span className={`grid size-10 place-items-center rounded-2xl ${child.tone}`}>
              {isManagingChildren ? <Pencil size={17} /> : <Baby size={19} />}
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold">{child.name}</span>
              <span className="block text-xs text-slate-500">{child.age}</span>
            </span>
          </button>
        ))}
        {isManagingChildren && (
          <button className="flex min-w-32 items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white p-3 text-left shadow-sm shadow-slate-200/70" onClick={onAddChild}>
            <span className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-700">
              <Plus size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold">Add child</span>
              <span className="block text-xs text-slate-500">New profile</span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
