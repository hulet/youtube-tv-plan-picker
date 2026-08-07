import type { Plan } from '../types';

export function recommend(selected: Set<string>, plans: Plan[]): Plan[] {
  if (selected.size === 0) return [];

  return plans
    .filter(plan => {
      const planChannels = new Set(plan.channels);
      for (const id of selected) {
        if (!planChannels.has(id)) return false;
      }
      return true;
    })
    .sort((a, b) => a.priceMonthly - b.priceMonthly);
}
