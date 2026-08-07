<script lang="ts">
  import type { Plan } from '../types';

  interface Props {
    plan: Plan;
    variant: 'winner' | 'runner-up';
    selectedCount: number;
  }

  let { plan, variant, selectedCount }: Props = $props();

  let priceStr = $derived(`$${plan.priceMonthly.toFixed(2)}/mo`);
</script>

<div class="card" class:winner={variant === 'winner'} class:runner-up={variant === 'runner-up'}>
  {#if variant === 'winner'}
    <div class="label">Cheapest plan</div>
  {/if}
  <div class="name">{plan.name}</div>
  <div class="price">{priceStr}</div>
  {#if variant === 'winner'}
    <div class="covers">Covers all {selectedCount} channel{selectedCount === 1 ? '' : 's'} you picked.</div>
  {/if}
</div>

<style>
  .card {
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .card.winner {
    background: color-mix(in srgb, currentColor 4%, transparent);
    border-color: color-mix(in srgb, currentColor 30%, transparent);
  }
  .card.runner-up { padding: 0.6rem 0.9rem; }
  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: color-mix(in srgb, currentColor 65%, transparent);
  }
  .name { font-weight: 600; font-size: 1.1rem; }
  .card.runner-up .name { font-size: 0.95rem; font-weight: 500; }
  .price { font-variant-numeric: tabular-nums; }
  .covers {
    font-size: 0.85rem;
    color: color-mix(in srgb, currentColor 70%, transparent);
    margin-top: 0.25rem;
  }
</style>
