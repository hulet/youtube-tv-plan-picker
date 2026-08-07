<script lang="ts">
  import type { Channel, Plan } from '../types';
  import PlanCard from './PlanCard.svelte';
  import PlanChannelsModal from './PlanChannelsModal.svelte';

  interface Props {
    plans: Plan[];        // plans covering the current selection, cheapest first
    allPlans: Plan[];     // every plan, shown when nothing is selected
    channels: Channel[];  // full channel list, used by the modal
    selectedCount: number;
  }

  let { plans, allPlans, channels, selectedCount }: Props = $props();

  const sortedAllPlans = $derived(
    [...allPlans].sort((a, b) => a.priceMonthly - b.priceMonthly),
  );

  let openPlan: Plan | null = $state(null);

  const winner = $derived(selectedCount > 0 && plans.length > 0 ? plans[0] : null);
</script>

<aside class="panel" aria-live="polite">
  {#if selectedCount === 0}
    <p class="prompt">Pick some channels to see the cheapest plan.</p>
    <div class="runners">
      <div class="runners-label">All available plans</div>
      {#each sortedAllPlans as p (p.id)}
        <PlanCard plan={p} variant="runner-up" {selectedCount} onSelect={(pl) => openPlan = pl} />
      {/each}
    </div>
  {:else if plans.length === 0}
    <p class="prompt">No single plan covers all your selections — try removing a channel.</p>
  {:else}
    <PlanCard plan={plans[0]} variant="winner" {selectedCount} onSelect={(pl) => openPlan = pl} />
    {#if plans.length > 1}
      <div class="runners">
        <div class="runners-label">Other matching plans</div>
        {#each plans.slice(1) as p (p.id)}
          <PlanCard plan={p} variant="runner-up" {selectedCount} onSelect={(pl) => openPlan = pl} />
        {/each}
      </div>
    {/if}
  {/if}
</aside>

<PlanChannelsModal plan={openPlan} {winner} {channels} onClose={() => openPlan = null} />

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: sticky;
    top: 1rem;
  }
  .prompt {
    padding: 1rem;
    color: color-mix(in srgb, currentColor 60%, transparent);
    text-align: center;
  }
  .runners { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; }
  .runners-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: color-mix(in srgb, currentColor 60%, transparent);
    margin-top: 0.5rem;
  }
</style>
