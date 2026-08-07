<script lang="ts">
  interface Props {
    value: string;
    onInput: (value: string) => void;
  }

  let { value, onInput }: Props = $props();
</script>

<div class="search">
  <input
    type="search"
    placeholder="Search channels..."
    {value}
    oninput={(e) => onInput((e.target as HTMLInputElement).value)}
    aria-label="Search channels"
  />
</div>

<style>
  .search { width: 100%; }
  input {
    width: 100%;
    padding: 0.6rem 0.9rem;
    font-size: 1rem;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    box-sizing: border-box;
  }
  input:focus { outline: 2px solid color-mix(in srgb, currentColor 40%, transparent); outline-offset: 1px; }
</style>
