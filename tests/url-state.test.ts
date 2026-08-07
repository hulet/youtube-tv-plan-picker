import { describe, it, expect } from 'vitest';
import { encodeSelection, decodeSelection } from '../src/lib/url-state';

describe('encodeSelection', () => {
  it('returns empty string for empty set', () => {
    expect(encodeSelection(new Set())).toBe('');
  });

  it('joins ids with dots in stable (sorted) order', () => {
    expect(encodeSelection(new Set(['cnn', 'espn', 'hgtv']))).toBe('cnn.espn.hgtv');
    expect(encodeSelection(new Set(['hgtv', 'espn', 'cnn']))).toBe('cnn.espn.hgtv');
  });
});

describe('decodeSelection', () => {
  const knownIds = new Set(['espn', 'cnn', 'hgtv', 'food']);

  it('returns empty set for null/undefined/empty input', () => {
    expect(decodeSelection(null, knownIds)).toEqual(new Set());
    expect(decodeSelection('', knownIds)).toEqual(new Set());
  });

  it('parses dot-separated ids, keeping only known ones', () => {
    expect(decodeSelection('espn.cnn.fake', knownIds)).toEqual(new Set(['espn', 'cnn']));
  });

  it('accepts legacy comma-separated URLs', () => {
    expect(decodeSelection('espn,cnn,fake', knownIds)).toEqual(new Set(['espn', 'cnn']));
  });

  it('deduplicates and trims (dot separator)', () => {
    expect(decodeSelection('espn.espn. cnn .', knownIds)).toEqual(new Set(['espn', 'cnn']));
  });

  it('round-trips through encode', () => {
    const original = new Set(['espn', 'cnn', 'hgtv']);
    expect(decodeSelection(encodeSelection(original), knownIds)).toEqual(original);
  });

  it('handles malformed input without throwing', () => {
    expect(() => decodeSelection('...', knownIds)).not.toThrow();
    expect(decodeSelection('...', knownIds)).toEqual(new Set());
    expect(decodeSelection(',,,', knownIds)).toEqual(new Set());
  });
});
