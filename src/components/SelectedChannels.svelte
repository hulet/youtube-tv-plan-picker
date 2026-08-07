<script lang="ts">
  import type { Channel } from '../types';

  interface Props {
    channels: Channel[];
    selected: Set<string>;
    onRemove: (id: string) => void;
    onClear: () => void;
  }

  let { channels, selected, onRemove, onClear }: Props = $props();

  // Build id → Channel lookup once per render.
  const byId = $derived(new Map(channels.map(c => [c.id, c])));

  // Sorted by id — matches URL c= param order exactly.
  const sortedIds = $derived([...selected].sort());
</script>

<section class="selected" data-scroll-top-anchor aria-label="Selected channels">
  {#if sortedIds.length === 0}
    <p class="empty">No channels selected yet — pick some below.</p>
  {:else}
    <div class="header">
      <span class="count">{sortedIds.length} selected</span>
      <button type="button" class="clear" onclick={onClear}>Clear all</button>
    </div>
    <ul class="chips">
      {#each sortedIds as id (id)}
        {@const ch = byId.get(id)}
        {#if ch}
          <li>
            <button
              type="button"
              class="chip"
              onclick={() => onRemove(id)}
              aria-label={`Remove ${ch.name}`}
            >
              <span class="tile" style="background-color: {ch.bgColor ?? 'black'}">
                <img src={ch.logo} alt="" loading="lazy" />
              </span>
              <span class="name">{ch.name}</span>
              <span class="x" aria-hidden="true">×</span>
            </button>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</section>

<style>
  .selected {
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 8px;
    padding: 0.75rem;
    background: transparent;
  }
  .empty {
    margin: 0;
    text-align: center;
    font-style: italic;
    color: color-mix(in srgb, currentColor 55%, transparent);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;
  }
  .count {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: color-mix(in srgb, currentColor 65%, transparent);
  }
  .clear {
    padding: 0;
    font-size: 0.85rem;
    background: transparent;
    color: color-mix(in srgb, currentColor 65%, transparent);
    border: none;
    cursor: pointer;
    font-variant-numeric: tabular-nums;
  }
  .clear:hover { color: inherit; }
  .chips {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .chip:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
  .chip:focus-visible { outline: 2px solid color-mix(in srgb, currentColor 40%, transparent); outline-offset: 1px; }
  .tile {
    flex: 0 0 auto;
    width: 24px; height: 24px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .tile img { width: 100%; height: 100%; object-fit: contain; }
  .name { font-size: 0.9rem; }
  .x {
    font-size: 1.1rem;
    line-height: 1;
    color: color-mix(in srgb, currentColor 55%, transparent);
    padding-left: 0.15rem;
  }
</style>
