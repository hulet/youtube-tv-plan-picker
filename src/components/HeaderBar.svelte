<script lang="ts">
  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(location.href);
      copied = true;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copied = false; }, 2000);
    } catch {
      // clipboard blocked (e.g. non-https, or user denied) — silent fail
    }
  }
</script>

<header>
  <h1>
    <img src="/favicon.svg" alt="" class="brand-mark" />
    <span>YouTube TV Plan Picker</span>
  </h1>
  <p class="lede">
    Pick the channels you actually watch. This tool tells you the cheapest
    YouTube TV plan that includes every one of them.
  </p>
  <div class="share">
    <button type="button" onclick={copyUrl}>
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
    <span class="hint">This URL saves your selections — share it or bookmark it.</span>
  </div>
</header>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 0 1.5rem;
    border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  }
  h1 {
    margin: 0;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .brand-mark {
    width: 1.4em;
    height: 1.4em;
    flex: 0 0 auto;
  }
  .lede { margin: 0; color: color-mix(in srgb, currentColor 75%, transparent); max-width: 60ch; }
  .share { display: flex; gap: 0.75rem; align-items: center; margin-top: 0.25rem; }
  button {
    padding: 0.4rem 0.9rem;
    font-size: 0.9rem;
    border-radius: 6px;
    border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  button:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
  .hint { font-size: 0.85rem; color: color-mix(in srgb, currentColor 60%, transparent); }
</style>
