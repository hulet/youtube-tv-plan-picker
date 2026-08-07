export function encodeSelection(selected: Set<string>): string {
  return [...selected].sort().join(',');
}

export function decodeSelection(raw: string | null | undefined, known: Set<string>): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && known.has(s)),
  );
}
