import { Search } from 'lucide-react';
import type { ChildProfile, QuickAction } from '../types';
import { QuickCaptureGrid } from './QuickCaptureGrid';

type CaptureSectionProps = {
  actions: QuickAction[];
  isSearchOpen: boolean;
  onSelectAction: (type: string) => void;
  onToggleSearch: () => void;
  searchQuery: string;
  selectedChild?: ChildProfile;
  setSearchQuery: (query: string) => void;
};

export function CaptureSection({ actions, isSearchOpen, onSelectAction, onToggleSearch, searchQuery, selectedChild, setSearchQuery }: CaptureSectionProps) {
  return (
    <section className="px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Quick capture</h2>
        <button className={`grid size-9 place-items-center rounded-full text-slate-700 ${isSearchOpen ? 'bg-slate-950 text-white' : 'bg-slate-100'}`} aria-label="Search" title="Search" onClick={onToggleSearch}>
          <Search size={18} />
        </button>
      </div>
      {isSearchOpen && (
        <input
          className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
          placeholder={selectedChild ? `Search ${selectedChild.name}'s memories` : 'Search memories'}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      )}
      <QuickCaptureGrid actions={actions} onSelectAction={onSelectAction} />
    </section>
  );
}
