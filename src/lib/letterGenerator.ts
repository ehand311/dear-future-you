import type { ChildProfile, GeneratedLetter, Memory } from '../types';

export function getCurrentMonthLabel() {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function generateMonthlyLetter(memories: Memory[], selectedChild?: ChildProfile): GeneratedLetter {
  const monthLabel = getCurrentMonthLabel();
  const subject = selectedChild?.name ?? 'your family';
  const title = selectedChild ? `${monthLabel} letter to ${selectedChild.name}` : `${monthLabel} family letter`;
  const sortedMemories = [...memories].reverse();

  if (sortedMemories.length === 0) {
    return {
      title,
      body: `Dear future ${subject},\n\nThere are not any saved memories for ${monthLabel} yet. Add a few small moments, funny quotes, or milestones, then come back to generate a letter from what you captured.`,
      sourceMemories: [],
    };
  }

  const opening = selectedChild
    ? `Dear future ${selectedChild.name},\n\nThis month, the little pieces of your story were full of ${describeThemes(sortedMemories)}.`
    : `Dear future us,\n\nThis month, our family story was stitched together from ${describeThemes(sortedMemories)}.`;

  const memoryParagraphs = sortedMemories.map((memory) => {
    const typeLabel = memory.type.toLowerCase();

    return selectedChild
      ? `One ${typeLabel} we saved: ${memory.body}`
      : `${memory.child} gave us this ${typeLabel}: ${memory.body}`;
  });

  const closing = selectedChild
    ? `\n\nThese are the kinds of moments that would be easy to forget, but they matter. They show who you were becoming in the small, ordinary days.`
    : `\n\nThese small notes are the shape of our month. They are ordinary, funny, sweet, and worth keeping.`;

  return {
    title,
    body: [opening, ...memoryParagraphs, closing].join('\n\n'),
    sourceMemories: sortedMemories,
  };
}

function describeThemes(memories: Memory[]) {
  const types = [...new Set(memories.map((memory) => memory.type.toLowerCase()))];

  if (types.length === 1) {
    return types[0];
  }

  if (types.length === 2) {
    return `${types[0]} and ${types[1]}`;
  }

  return `${types.slice(0, -1).join(', ')}, and ${types[types.length - 1]}`;
}
