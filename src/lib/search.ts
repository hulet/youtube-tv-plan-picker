import type { Channel } from '../types';

export function filterChannels(
  channels: Channel[],
  query: string,
  selected: Set<string>,
): Channel[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === '') return channels;

  return channels.filter(ch => {
    if (selected.has(ch.id)) return true;
    if (ch.name.toLowerCase().includes(trimmed)) return true;
    return ch.aliases.some(a => a.toLowerCase().includes(trimmed));
  });
}
