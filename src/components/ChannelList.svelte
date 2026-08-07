<script lang="ts">
  import type { Channel } from '../types';
  import ChannelRow from './ChannelRow.svelte';

  interface Props {
    channels: Channel[];
    selected: Set<string>;
    onToggle: (id: string) => void;
  }

  let { channels, selected, onToggle }: Props = $props();
</script>

<ul class="list" aria-label="Channels">
  {#each channels as ch (ch.id)}
    <li>
      <ChannelRow channel={ch} checked={selected.has(ch.id)} {onToggle} />
    </li>
  {:else}
    <li class="empty">No channels match your search.</li>
  {/each}
</ul>

<style>
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .empty {
    padding: 1rem;
    color: color-mix(in srgb, currentColor 60%, transparent);
    text-align: center;
  }
</style>
