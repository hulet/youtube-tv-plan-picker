import { writable, derived, type Readable } from 'svelte/store';
import type { Channel, Plan } from './types';
import channelsData from '../data/channels.json';
import plansData from '../data/plans.json';
import { recommend } from './lib/recommender';
import { filterChannels } from './lib/search';

export const channels: Channel[] = channelsData as Channel[];
export const plans: Plan[] = plansData as Plan[];

export const channelIds = new Set(channels.map(c => c.id));

export const selected = writable<Set<string>>(new Set());
export const query = writable<string>('');

export const filteredChannels: Readable<Channel[]> = derived(
  [query, selected],
  ([$query, $selected]) => filterChannels(channels, $query, $selected),
);

export const matchingPlans: Readable<Plan[]> = derived(
  selected,
  ($selected) => recommend($selected, plans),
);
