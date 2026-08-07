<script lang="ts">
  import type { Plan } from '../types';
  import PlanCard from './PlanCard.svelte';

  interface Props {
    plans: Plan[];
    selectedCount: number;
  }

  let { plans, selectedCount }: Props = $props();
</script>

<aside class="panel" aria-live="polite">
  {#if selectedCount === 0}
    <p class="prompt">Pick some channels to see the cheapest plan.</p>
  {:else if plans.length === 0}
    <p class="prompt">No single plan covers all your selections — try removing a channel.</p>
  {:else}
    <PlanCard plan={plans[0]} variant="winner" {selectedCount} />
    {#if plans.length > 1}
      <div class="runners">
        <div class="runners-label">Other matching plans</div>
        {#each plans.slice(1) as p (p.id)}
          <PlanCard plan={p} variant="runner-up" {selectedCount} />
        {/each}
      </div>
    {/if}
  {/if}
</aside>

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
