import { describe, it, expect } from 'vitest';
import { recommend } from '../src/lib/recommender';
import type { Plan } from '../src/types';

const plans: Plan[] = [
  { id: 'youtube-tv', name: 'YouTube TV', priceMonthly: 82.99, channels: ['espn', 'cnn', 'hgtv', 'hbo-doc'] },
  { id: 'sports', name: 'Sports', priceMonthly: 64.99, channels: ['espn', 'fs1'] },
  { id: 'entertainment', name: 'Entertainment', priceMonthly: 54.99, channels: ['hgtv', 'food'] },
  { id: 'news-ent', name: 'News + Entertainment', priceMonthly: 62.99, channels: ['cnn', 'hgtv', 'food'] },
  { id: 'ent-family', name: 'Entertainment + Family', priceMonthly: 62.99, channels: ['hgtv', 'food', 'disney'] },
];

describe('recommend', () => {
  it('returns empty list for empty selection', () => {
    expect(recommend(new Set(), plans)).toEqual([]);
  });

  it('returns only plans whose channels are a superset of the selection', () => {
    const result = recommend(new Set(['hgtv']), plans);
    const ids = result.map(p => p.id);
    expect(ids).toContain('entertainment');
    expect(ids).toContain('news-ent');
    expect(ids).toContain('ent-family');
    expect(ids).toContain('youtube-tv');
    expect(ids).not.toContain('sports'); // no hgtv
  });

  it('sorts results ascending by price', () => {
    const result = recommend(new Set(['hgtv']), plans);
    const prices = result.map(p => p.priceMonthly);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(result[0].id).toBe('entertainment'); // cheapest that covers hgtv
  });

  it('returns only the base plan when a channel is exclusive to it', () => {
    const result = recommend(new Set(['hbo-doc']), plans);
    expect(result.map(p => p.id)).toEqual(['youtube-tv']);
  });

  it('surfaces both plans when two plans at the same price both cover the selection', () => {
    const result = recommend(new Set(['hgtv', 'food']), plans);
    const at6299 = result.filter(p => p.priceMonthly === 62.99).map(p => p.id);
    expect(at6299).toContain('news-ent');
    expect(at6299).toContain('ent-family');
  });

  it('returns empty list when no plan covers the selection', () => {
    const result = recommend(new Set(['nonexistent']), plans);
    expect(result).toEqual([]);
  });
});
