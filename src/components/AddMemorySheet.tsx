import { X } from 'lucide-react';
import type { ChildProfile, MemoryFormState } from '../types';

type AddMemorySheetProps = {
  children: ChildProfile[];
  form: MemoryFormState;
  memoryTypes: string[];
  onClose: () => void;
  onSave: () => void;
  onUpdateForm: (field: keyof MemoryFormState, value: string) => void;
};

export function AddMemorySheet({ children, form, memoryTypes, onClose, onSave, onUpdateForm }: AddMemorySheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-0 sm:px-4" role="dialog" aria-modal="true" aria-label="Add memory">
      <div className="w-full max-w-md rounded-t-[2rem] bg-[#fffdf8] p-5 shadow-2xl shadow-slate-950/30 sm:mb-4 sm:rounded-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Quick capture</p>
            <h2 className="mt-1 text-xl font-semibold">Add a memory</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700" onClick={onClose} aria-label="Close" title="Close">
            <X size={19} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Child</span>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-400"
              value={form.child}
              onChange={(event) => onUpdateForm('child', event.target.value)}
            >
              {children.map((child) => (
                <option key={child.name} value={child.name}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Type</span>
            <select
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-slate-400"
              value={form.type}
              onChange={(event) => onUpdateForm('type', event.target.value)}
            >
              {memoryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">What happened?</span>
            <textarea
              className="mt-2 min-h-32 w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-base leading-6 outline-none focus:border-slate-400"
              placeholder="Ellie asked why the moon follows our car..."
              value={form.body}
              onChange={(event) => onUpdateForm('body', event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tags</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              placeholder="bedtime, funny, firsts"
              value={form.tags}
              onChange={(event) => onUpdateForm('tags', event.target.value)}
            />
          </label>

          <button
            className="flex h-13 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            type="button"
            onPointerDown={onSave}
            disabled={!form.body.trim()}
          >
            Save memory
          </button>
        </div>
      </div>
    </div>
  );
}
