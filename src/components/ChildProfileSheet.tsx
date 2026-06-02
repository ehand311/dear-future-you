import { X } from 'lucide-react';
import type { ChildProfileFormState } from '../types';

type ChildProfileSheetProps = {
  editingChildName: string | null;
  form: ChildProfileFormState;
  onClose: () => void;
  onDelete?: () => void;
  onSave: () => void;
  onUpdateForm: (field: keyof ChildProfileFormState, value: string) => void;
};

const profileTones = [
  { label: 'Rose', value: 'bg-rose-100 text-rose-700', swatch: 'bg-rose-300' },
  { label: 'Cyan', value: 'bg-cyan-100 text-cyan-700', swatch: 'bg-cyan-300' },
  { label: 'Amber', value: 'bg-amber-100 text-amber-700', swatch: 'bg-amber-300' },
  { label: 'Violet', value: 'bg-violet-100 text-violet-700', swatch: 'bg-violet-300' },
];

export function ChildProfileSheet({ editingChildName, form, onClose, onDelete, onSave, onUpdateForm }: ChildProfileSheetProps) {
  const isEditing = Boolean(editingChildName);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-0 sm:px-4" role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit child profile' : 'Add child profile'}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[#fffdf8] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-slate-950/30 sm:mb-4 sm:rounded-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Child profile</p>
            <h2 className="mt-1 text-xl font-semibold">{isEditing ? 'Edit child' : 'Add child'}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700" onClick={onClose} aria-label="Close" title="Close">
            <X size={19} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Name</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              placeholder="Ellie"
              value={form.name}
              onChange={(event) => onUpdateForm('name', event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Age</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              placeholder="3y 4m"
              value={form.age}
              onChange={(event) => onUpdateForm('age', event.target.value)}
            />
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-700">Profile color</legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {profileTones.map((tone) => (
                <button
                  key={tone.value}
                  className={`flex h-12 items-center justify-center rounded-2xl border bg-white ${form.tone === tone.value ? 'border-slate-950' : 'border-slate-200'}`}
                  type="button"
                  onClick={() => onUpdateForm('tone', tone.value)}
                  aria-label={tone.label}
                  title={tone.label}
                >
                  <span className={`size-5 rounded-full ${tone.swatch}`} />
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3">
            {isEditing && onDelete && (
              <button className="h-13 flex-1 rounded-2xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700" type="button" onClick={onDelete}>
                Delete
              </button>
            )}
            <button
              className="h-13 flex-[2] rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              type="button"
              onClick={onSave}
              disabled={!form.name.trim()}
            >
              Save profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
