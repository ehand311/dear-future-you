import type { QuickAction } from '../types';

type QuickCaptureGridProps = {
  actions: QuickAction[];
  onSelectAction: (type: string) => void;
};

export function QuickCaptureGrid({ actions, onSelectAction }: QuickCaptureGridProps) {
  return (
    <div className="mt-3 grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl bg-slate-100 p-2 text-center"
            onClick={() => onSelectAction(action.type)}
          >
            <span className={`grid size-11 place-items-center rounded-2xl ${action.tone}`}>
              <Icon size={20} />
            </span>
            <span className="text-xs font-semibold text-slate-700">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
