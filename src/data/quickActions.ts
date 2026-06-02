import { MessageCircle, Mic, PencilLine, Star } from 'lucide-react';
import type { QuickAction } from '../types';

export const quickActions: QuickAction[] = [
  { label: 'Memory', type: 'Memory', icon: PencilLine, tone: 'bg-emerald-600 text-white' },
  { label: 'Quote', type: 'Funny quote', icon: MessageCircle, tone: 'bg-sky-600 text-white' },
  { label: 'Milestone', type: 'Milestone', icon: Star, tone: 'bg-violet-600 text-white' },
  { label: 'Voice', type: 'Voice note', icon: Mic, tone: 'bg-slate-900 text-white' },
];
