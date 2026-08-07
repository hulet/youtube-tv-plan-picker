import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Channel, Plan } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const channels: Channel[] = JSON.parse(
  readFileSync(join(REPO_ROOT, 'data/channels.json'), 'utf-8'),
);
const plans: Plan[] = JSON.parse(
  readFileSync(join(REPO_ROOT, 'data/plans.json'), 'utf-8'),
);

describe('data/channels.json', () => {
  it('has unique ids', () => {
    const ids = channels.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has non-empty name for every channel', () => {
    for (const c of channels) expect(c.name.length).toBeGreaterThan(0);
  });

  it('has aliases as an array (possibly empty) for every channel', () => {
    for (const c of channels) expect(Array.isArray(c.aliases)).toBe(true);
  });

  it('references logo files that exist under public/', () => {
    for (const c of channels) {
      const path = join(REPO_ROOT, 'public', c.logo);
      expect(existsSync(path), `missing logo: ${c.logo}`).toBe(true);
    }
  });
});

describe('data/plans.json', () => {
  it('has unique ids', () => {
    const ids = plans.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has positive priceMonthly for every plan', () => {
    for (const p of plans) expect(p.priceMonthly).toBeGreaterThan(0);
  });

  it('references only channel ids that exist in channels.json', () => {
    const knownIds = new Set(channels.map(c => c.id));
    for (const plan of plans) {
      for (const channelId of plan.channels) {
        expect(knownIds.has(channelId), `plan ${plan.id} references unknown channel ${channelId}`).toBe(true);
      }
    }
  });

  it('has exactly 13 plans', () => {
    expect(plans.length).toBe(13);
  });
});
