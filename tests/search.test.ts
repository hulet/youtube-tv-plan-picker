import { describe, it, expect } from 'vitest';
import { filterChannels } from '../src/lib/search';
import type { Channel } from '../src/types';

const channels: Channel[] = [
  { id: 'espn', name: 'ESPN', aliases: [], logo: '/logos/espn.png' },
  { id: 'awe', name: 'AWE', aliases: ['A Wealth of Entertainment Network'], logo: '/logos/awe.png' },
  { id: 'cnn', name: 'CNN', aliases: ['Cable News Network'], logo: '/logos/cnn.png' },
  { id: 'hgtv', name: 'HGTV', aliases: [], logo: '/logos/hgtv.png' },
];

describe('filterChannels', () => {
  it('returns all channels when query is empty', () => {
    expect(filterChannels(channels, '', new Set())).toEqual(channels);
  });

  it('substring matches on name (case-insensitive)', () => {
    const result = filterChannels(channels, 'esp', new Set());
    expect(result.map(c => c.id)).toEqual(['espn']);
  });

  it('substring matches on aliases', () => {
    const result = filterChannels(channels, 'wealth', new Set());
    expect(result.map(c => c.id)).toEqual(['awe']);
  });

  it('is case-insensitive on both name and aliases', () => {
    expect(filterChannels(channels, 'CABLE', new Set()).map(c => c.id)).toEqual(['cnn']);
  });

  it('keeps selected channels visible even when they do not match the query', () => {
    const result = filterChannels(channels, 'esp', new Set(['hgtv', 'cnn']));
    const ids = result.map(c => c.id);
    expect(ids).toContain('espn');   // matches query
    expect(ids).toContain('hgtv');   // selected
    expect(ids).toContain('cnn');    // selected
    expect(ids).not.toContain('awe');
  });

  it('preserves the original channel order', () => {
    const result = filterChannels(channels, '', new Set());
    expect(result.map(c => c.id)).toEqual(['espn', 'awe', 'cnn', 'hgtv']);
  });
});
