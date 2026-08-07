<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Channel, Plan } from '../types';

  interface Props {
    plan: Plan | null;
    channels: Channel[];
    onClose: () => void;
  }

  let { plan, channels, onClose }: Props = $props();

  const byId = $derived(new Map(channels.map(c => [c.id, c])));

  // Chips sorted alphabetically by name (browse-oriented, not URL-matching).
  const sortedChannels = $derived(
    plan
      ? plan.channels
          .map(id => byId.get(id))
          .filter((c): c is Channel => c !== undefined)
          .sort((a, b) => a.name.localeCompare(b.name))
      : [],
  );

  let closeButtonEl: HTMLButtonElement | null = $state(null);

  // Body-scroll lock + ESC handler + focus close button on open.
  $effect(() => {
    if (!plan) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);

    // Focus the close button so ESC/tab work naturally.
    queueMicrotask(() => closeButtonEl?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  });

  onDestroy(() => {
    // Safety net: restore body scroll if the component unmounts while open.
    document.body.style.overflow = '';
  });

  function onBackdropClick() {
    onClose();
  }

  function stopBubble(e: Event) {
    e.stopPropagation();
  }

  function priceStr(p: Plan): string {
    return `$${p.priceMonthly.toFixed(2)}/mo`;
  }
</script>

{#if plan}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="backdrop"
    onclick={onBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="plan-modal-title"
    tabindex="-1"
  >
    <div class="card" onclick={stopBubble}>
      <header>
        <h2 id="plan-modal-title">{plan.name}</h2>
        <button
          type="button"
          class="close"
          aria-label="Close"
          onclick={onClose}
          bind:this={closeButtonEl}
        >×</button>
      </header>
      <p class="meta">
        <span class="price">{priceStr(plan)}</span>
        <span class="sep">·</span>
        <span>{sortedChannels.length} channel{sortedChannels.length === 1 ? '' : 's'}</span>
      </p>
      {#if sortedChannels.length === 0}
        <p class="empty">This plan has no channels.</p>
      {:else}
        <ul class="chips">
          {#each sortedChannels as ch (ch.id)}
            <li class="chip">
              <span class="tile" style="background-color: {ch.bgColor ?? 'black'}">
                <img src={ch.logo} alt="" loading="lazy" />
              </span>
              <span class="name">{ch.name}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 1rem;
    animation: fade-in 150ms ease;
  }
  .card {
    background: canvas;
    color: inherit;
    max-width: 560px;
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    padding: 1.5rem;
    overflow-y: auto;
  }
  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .close {
    background: transparent;
    border: none;
    color: inherit;
    font-size: 1.75rem;
    line-height: 1;
    padding: 0 0.25rem;
    cursor: pointer;
    border-radius: 4px;
  }
  .close:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
  .close:focus-visible {
    outline: 2px solid color-mix(in srgb, currentColor 40%, transparent);
    outline-offset: 2px;
  }
  .meta {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: color-mix(in srgb, currentColor 70%, transparent);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .price { font-variant-numeric: tabular-nums; }
  .sep { color: color-mix(in srgb, currentColor 40%, transparent); }
  .empty {
    margin: 0;
    text-align: center;
    font-style: italic;
    color: color-mix(in srgb, currentColor 55%, transparent);
  }
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
    padding: 0.25rem 0.6rem 0.25rem 0.25rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 999px;
  }
  .tile {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .tile img { width: 100%; height: 100%; object-fit: contain; }
  .name { font-size: 0.9rem; }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
