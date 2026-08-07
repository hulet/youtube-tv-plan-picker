<script lang="ts">
  import type { Channel } from '../types';

  interface Props {
    channel: Channel;
    checked: boolean;
    onToggle: (id: string, event?: Event) => void;
  }

  let { channel, checked, onToggle }: Props = $props();
</script>

<label class="row" class:checked>
  <span class="tile" style="background-color: {channel.bgColor ?? 'black'}">
    <img src={channel.logo} alt="" loading="lazy" />
  </span>
  <span class="name">{channel.name}</span>
  <input
    type="checkbox"
    {checked}
    onchange={(e) => onToggle(channel.id, e)}
    aria-label={`Select ${channel.name}`}
  />
</label>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .row:hover { background: rgba(0, 0, 0, 0.04); }
  @media (prefers-color-scheme: dark) {
    .row:hover { background: rgba(255, 255, 255, 0.06); }
  }
  .row.checked { background: rgba(0, 100, 200, 0.08); }
  @media (prefers-color-scheme: dark) {
    .row.checked { background: rgba(90, 160, 240, 0.14); }
  }
  .tile {
    flex: 0 0 auto;
    width: 32px; height: 32px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .tile img { width: 100%; height: 100%; object-fit: contain; }
  .name { flex: 1 1 auto; }
  input[type="checkbox"] { flex: 0 0 auto; }
</style>
