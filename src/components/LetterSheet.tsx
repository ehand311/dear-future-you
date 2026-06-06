import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import type { GeneratedLetter, SavedLetter } from '../types';

type LetterSheetProps = {
  isSaved?: boolean;
  letter: GeneratedLetter | SavedLetter;
  onClose: () => void;
  onSave?: () => void;
};

export function LetterSheet({ isSaved = false, letter, onClose, onSave }: LetterSheetProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const sourceMemoryCount = 'sourceMemoryIds' in letter ? letter.sourceMemoryIds.length : 0;

  async function copyLetter() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(letter.body);
    }

    setHasCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-0 sm:px-4" role="dialog" aria-modal="true" aria-label="Monthly letter">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[#fffdf8] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl shadow-slate-950/30 sm:mb-4 sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Generated keepsake</p>
            <h2 className="mt-1 text-xl font-semibold capitalize">{letter.title}</h2>
          </div>
          <button className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700" onClick={onClose} aria-label="Close" title="Close">
            <X size={19} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white" onClick={copyLetter}>
            {hasCopied ? <Check size={17} /> : <Copy size={17} />}
            {hasCopied ? 'Copied' : 'Copy'}
          </button>
          <button
            className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 disabled:text-slate-400"
            disabled={isSaved || !onSave}
            onClick={onSave}
          >
            {isSaved ? 'Saved' : 'Save letter'}
          </button>
        </div>

        <article className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/70">
          {letter.body.split('\n\n').map((paragraph) => (
            <p key={paragraph} className="mb-4 text-sm leading-6 text-slate-700 last:mb-0">
              {paragraph}
            </p>
          ))}
        </article>

        <section className="mt-5">
          <h3 className="text-sm font-semibold">Source memories</h3>
          <div className="mt-3 space-y-2">
            {letter.sourceMemories.length > 0 ? (
              letter.sourceMemories.map((memory) => (
                <div key={memory.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">{memory.child}</p>
                    <p className="text-xs font-medium text-slate-400">{memory.date}</p>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-700">{memory.body}</p>
                </div>
              ))
            ) : sourceMemoryCount > 0 ? (
              <p className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
                This saved letter was generated from {sourceMemoryCount} source {sourceMemoryCount === 1 ? 'memory' : 'memories'}.
              </p>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">No memories were available for this letter yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
