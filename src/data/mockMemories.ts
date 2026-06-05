import type { ChildProfile, Memory } from '../types';

export const children: ChildProfile[] = [
  { name: 'Ellie', age: '3y 4m', tone: 'bg-rose-100 text-rose-700' },
  { name: 'Miles', age: '14m', tone: 'bg-cyan-100 text-cyan-700' },
  { name: 'Family', age: 'All', tone: 'bg-amber-100 text-amber-700' },
];

export const initialMemories: Memory[] = [
  {
    id: '1',
    child: 'Ellie',
    type: 'Funny quote',
    date: 'Today',
    body: 'Asked why the moon follows our car, then told it to go home.',
    accent: 'border-rose-200',
  },
  {
    id: '2',
    child: 'Miles',
    type: 'Milestone',
    date: 'Yesterday',
    body: 'Took three careful steps while holding the couch and laughed after sitting down.',
    accent: 'border-cyan-200',
  },
  {
    id: '3',
    child: 'Family',
    type: 'Sweet moment',
    date: 'May 28',
    body: 'Everyone piled onto the kitchen floor after dinner and made up a song about pancakes.',
    accent: 'border-amber-200',
  },
];

export const memoryTypes = ['Memory', 'Funny quote', 'Milestone', 'Sweet moment', 'Trip'];

export const childAccent: Record<string, string> = {
  Ellie: 'border-rose-200',
  Miles: 'border-cyan-200',
  Family: 'border-amber-200',
};
