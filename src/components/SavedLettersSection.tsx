import { FileText } from 'lucide-react';
import type { SavedLetter } from '../types';

type SavedLettersSectionProps = {
  letters: SavedLetter[];
  onOpenLetter: (letter: SavedLetter) => void;
};

export function SavedLettersSection({ letters, onOpenLetter }: SavedLettersSectionProps) {
  return (
    <section className="bg-slate-50 px-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Saved letters</h2>
          <p className="text-sm text-slate-500">{letters.length ? `${letters.length} keepsake letters` : 'Save generated letters to revisit later.'}</p>
        </div>
        <FileText size={21} className="text-slate-500" />
      </div>

      <div className="mt-4 space-y-3">
        {letters.length > 0 ? (
          letters.map((letter) => (
            <button key={letter.id} className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm shadow-slate-200/70" onClick={() => onOpenLetter(letter)}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold capitalize">{letter.title}</p>
                <p className="text-xs font-medium text-slate-400">{letter.month}</p>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{letter.body}</p>
              <p className="mt-3 text-xs font-semibold text-slate-400">{letter.childName ? `${letter.childName} letter` : 'Family letter'}</p>
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center">
            <p className="text-sm font-semibold">No saved letters yet</p>
            <p className="mt-1 text-sm text-slate-500">Generate a monthly letter, then save it as a keepsake.</p>
          </div>
        )}
      </div>
    </section>
  );
}
