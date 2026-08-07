# Selected Channels Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a chip panel above the search bar showing currently-selected channels with one-click removal, a "Clear all" button, and a floating scroll-to-top button — all while preserving the clicked-row's viewport position.

**Architecture:** Two new presentational Svelte 5 components (`SelectedChannels`, `ScrollToTop`) wired into `App.svelte`. `ChannelRow` gains an event parameter on its `onToggle` callback so `App.svelte` can measure and correct the scroll position after each toggle. No new library code, no unit tests (components are thin; verified by manual smoke test).

**Tech Stack:** Svelte 5, TypeScript, plain CSS. `IntersectionObserver` (native).

**Related:** Implements spec at `docs/superpowers/specs/2026-08-06-selected-channels-panel-design.md`.

---

## File Structure

- **Create:** `src/components/SelectedChannels.svelte` — chip panel + empty state + Clear all button.
- **Create:** `src/components/ScrollToTop.svelte` — floating bottom-right button that fades in when the SelectedChannels panel scrolls out of view.
- **Modify:** `src/components/ChannelRow.svelte` — pass the change event through to `onToggle`.
- **Modify:** `src/App.svelte` — add `clearSelection`, update `toggle` to accept an event and preserve scroll, render `<SelectedChannels>` and `<ScrollToTop>`.

---

### Task 1: Create `SelectedChannels.svelte`

**Files:**
- Create: `src/components/SelectedChannels.svelte`

- [ ] **Step 1: Create the file**

```svelte
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
```

- [ ] **Step 2: Verify type-check**

```bash
cd /Users/hulet/tries/2026-08-05-youtube-plan-picker
npm run check
```

Expected: `COMPLETED ... 0 ERRORS 0 WARNINGS`.

- [ ] **Step 3: Commit**

```bash
git add src/components/SelectedChannels.svelte
git commit -m "feat: SelectedChannels chip panel component"
```

---

### Task 2: Update `ChannelRow.svelte` to pass the change event

**Files:**
- Modify: `src/components/ChannelRow.svelte`

The current `onToggle` signature is `(id: string) => void`. Widen it to `(id: string, event?: Event) => void` so App.svelte can measure the clicked row for scroll preservation.

- [ ] **Step 1: Read the current file**

```bash
cat src/components/ChannelRow.svelte
```

Note the current `onToggle` prop type and the `onchange` handler.

- [ ] **Step 2: Edit the Props interface** — change:

```ts
    onToggle: (id: string) => void;
```

to:

```ts
    onToggle: (id: string, event?: Event) => void;
```

- [ ] **Step 3: Edit the checkbox handler** — change:

```svelte
    onchange={() => onToggle(channel.id)}
```

to:

```svelte
    onchange={(e) => onToggle(channel.id, e)}
```

- [ ] **Step 4: Verify type-check**

```bash
npm run check
```

Expected: 0 errors. (ChannelList.svelte's usage of `onToggle` still typechecks because the new second parameter is optional.)

- [ ] **Step 5: Commit**

```bash
git add src/components/ChannelRow.svelte
git commit -m "feat: ChannelRow passes change event to onToggle"
```

---

### Task 3: Wire SelectedChannels + scroll-preserving toggle into `App.svelte`

**Files:**
- Modify: `src/App.svelte`

Adds: import of `SelectedChannels`, `clearSelection` function, event-aware `toggle` with scroll compensation, and renders the component above `<SearchBox>`.

- [ ] **Step 1: Replace `src/App.svelte`** with the full updated content:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import HeaderBar from './components/HeaderBar.svelte';
  import SelectedChannels from './components/SelectedChannels.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import ChannelList from './components/ChannelList.svelte';
  import RecommendationPanel from './components/RecommendationPanel.svelte';
  import Footer from './components/Footer.svelte';
  import {
    channels, selected, query, filteredChannels, matchingPlans, channelIds,
  } from './stores';
  import { encodeSelection, decodeSelection } from './lib/url-state';

  // Initialize selection from URL on mount.
  onMount(() => {
    const params = new URLSearchParams(location.search);
    const initial = decodeSelection(params.get('c'), channelIds);
    if (initial.size > 0) selected.set(initial);
  });

  // Whenever selection changes, update the URL.
  $effect(() => {
    const encoded = encodeSelection($selected);
    const url = new URL(location.href);
    if (encoded) url.searchParams.set('c', encoded);
    else url.searchParams.delete('c');
    if (url.toString() !== location.href) {
      history.replaceState(null, '', url.toString());
    }
  });

  function toggle(id: string, event?: Event) {
    // Capture the target row's viewport Y before mutating state, so we can
    // compensate for the SelectedChannels panel growing/shrinking above.
    const target = event?.currentTarget;
    const rowEl = target instanceof HTMLElement
      ? (target.closest('label.row') as HTMLElement | null)
      : null;
    const beforeY = rowEl?.getBoundingClientRect().top ?? null;

    selected.update(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    if (rowEl && beforeY !== null) {
      requestAnimationFrame(() => {
        const afterY = rowEl.getBoundingClientRect().top;
        const delta = afterY - beforeY;
        if (delta !== 0) window.scrollBy(0, delta);
      });
    }
  }

  function clearSelection() {
    selected.set(new Set());
  }
</script>

<main>
  <HeaderBar />

  <div class="grid">
    <section class="channels">
      <SelectedChannels
        {channels}
        selected={$selected}
        onRemove={(id) => toggle(id)}
        onClear={clearSelection}
      />
      <SearchBox value={$query} onInput={(v) => query.set(v)} />
      <ChannelList channels={$filteredChannels} selected={$selected} onToggle={toggle} />
    </section>
    <section class="recommendation">
      <RecommendationPanel plans={$matchingPlans} selectedCount={$selected.size} />
    </section>
  </div>

  <Footer />
</main>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1rem 1.5rem 3rem;
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
    gap: 2rem;
    margin-top: 1.5rem;
  }
  .channels { display: flex; flex-direction: column; gap: 1rem; }
  @media (max-width: 800px) {
    .grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: Verify type-check, tests, build**

```bash
npm run check && npm test && npm run build
```

Expected: 0 type errors, 27/27 tests, `dist/` populated.

- [ ] **Step 3: Manual smoke test via dev server**

```bash
npm run dev -- --port 5173 &
SERVER_PID=$!
sleep 3
echo "Open http://localhost:5173/ in your browser to verify:"
echo "  1. Empty state placeholder is visible above the search bar"
echo "  2. Ticking a channel shows a chip and does not shift the clicked row visually"
echo "  3. Selecting several channels shows chips sorted alphabetically by id (matches URL)"
echo "  4. Clicking a chip removes the channel"
echo "  5. 'Clear all' empties the panel and the URL"
echo "  6. Ctrl-C or kill $SERVER_PID when done"
wait $SERVER_PID
```

If everything looks right, kill the server (Ctrl-C).

- [ ] **Step 4: Commit**

```bash
git add src/App.svelte
git commit -m "feat: wire SelectedChannels panel and scroll-preserving toggle"
```

---

### Task 4: Create `ScrollToTop.svelte`

**Files:**
- Create: `src/components/ScrollToTop.svelte`

A floating bottom-right button that appears when the SelectedChannels panel scrolls out of view (or, as fallback, when `scrollY > 400`). Uses `IntersectionObserver` for the primary path.

- [ ] **Step 1: Create the file**

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let visible = $state(false);
  let observer: IntersectionObserver | null = null;
  let scrollHandler: (() => void) | null = null;
  let scrollTicking = false;

  onMount(() => {
    const anchor = document.querySelector<HTMLElement>('[data-scroll-top-anchor]');

    if (anchor && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            // Button is visible when the anchor is NOT intersecting the viewport.
            visible = !entry.isIntersecting;
          }
        },
        { threshold: 0 },
      );
      observer.observe(anchor);
    } else {
      // Fallback: fixed scrollY threshold.
      const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          visible = window.scrollY > 400;
          scrollTicking = false;
        });
      };
      scrollHandler = onScroll;
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  });

  onDestroy(() => {
    if (observer) observer.disconnect();
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<button
  type="button"
  class="scroll-top"
  class:visible
  onclick={scrollToTop}
  aria-label="Scroll to top"
  tabindex={visible ? 0 : -1}
>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
</button>

<style>
  .scroll-top {
    position: fixed;
    bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    right: calc(1.5rem + env(safe-area-inset-right, 0px));
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    background: color-mix(in srgb, canvas 90%, currentColor 10%);
    color: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity 200ms ease, transform 200ms ease;
    z-index: 100;
  }
  .scroll-top.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .scroll-top:hover {
    background: color-mix(in srgb, canvas 80%, currentColor 20%);
  }
  .scroll-top:focus-visible {
    outline: 2px solid color-mix(in srgb, currentColor 60%, transparent);
    outline-offset: 2px;
  }
</style>
```

- [ ] **Step 2: Verify type-check**

```bash
npm run check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScrollToTop.svelte
git commit -m "feat: floating ScrollToTop button"
```

---

### Task 5: Render `<ScrollToTop />` in `App.svelte`

**Files:**
- Modify: `src/App.svelte`

- [ ] **Step 1: Add the import** — locate the existing import block and add:

```ts
import ScrollToTop from './components/ScrollToTop.svelte';
```

Place it near the other component imports (e.g., after `Footer`).

- [ ] **Step 2: Render the component inside `<main>`, after `<Footer />`**

Change:

```svelte
  <Footer />
</main>
```

to:

```svelte
  <Footer />

  <ScrollToTop />
</main>
```

- [ ] **Step 3: Verify type-check, tests, build**

```bash
npm run check && npm test && npm run build
```

Expected: 0 type errors, 27/27 tests, `dist/` populated.

- [ ] **Step 4: Commit**

```bash
git add src/App.svelte
git commit -m "feat: render ScrollToTop button"
```

---

### Task 6: Manual verification + push

**Files:** none.

- [ ] **Step 1: Full end-to-end smoke test**

```bash
npm run dev -- --port 5173 &
SERVER_PID=$!
sleep 3
echo "Open http://localhost:5173/ and verify:"
echo ""
echo "  Selected channels panel:"
echo "  [ ] Empty state shows 'No channels selected yet — pick some below.'"
echo "  [ ] Ticking a channel adds a chip; the clicked row stays under the mouse cursor"
echo "  [ ] Selecting more channels: chips sorted alphabetically by id"
echo "  [ ] Chip order matches the ?c= param character-for-character"
echo "  [ ] Clicking a chip removes the channel"
echo "  [ ] 'Clear all' empties chips and removes ?c= from URL"
echo ""
echo "  Scroll to top:"
echo "  [ ] Hidden when SelectedChannels is visible"
echo "  [ ] Fades in after scrolling past it"
echo "  [ ] Clicking smoothly scrolls to top and button fades out"
echo "  [ ] Keyboard: Tab reaches the button when visible, Enter scrolls"
echo ""
echo "  Cross-cutting:"
echo "  [ ] Dark mode: colors follow system preference"
echo "  [ ] Mobile viewport (DevTools): chips wrap, button not clipped by safe area"
echo "  [ ] Deep-link ?c=cnn,espn,hgtv restores selection with chips in that order"
echo ""
echo "  Ctrl-C or kill $SERVER_PID when done"
wait $SERVER_PID
```

If anything fails, STOP and either fix on this branch or report the issue.

- [ ] **Step 2: Push to remote** (triggers Cloudflare Pages auto-deploy)

```bash
git push
```

- [ ] **Step 3: Wait for Cloudflare deploy, then smoke test in production**

Watch the Cloudflare Pages dashboard for the build to complete (~1-2 min). Open https://youtube-tv-plan-picker.pages.dev/ (or the custom domain if wired up) and repeat the same manual checks as Step 1.

If the production build behaves the same as local, this plan is complete.

---

## Self-review notes (for the plan author, not the executor)

- Spec coverage: chip panel ✓, empty state ✓, Clear all ✓, order matches URL ✓, chip anatomy ✓, scroll preservation on ChannelList clicks ✓, no scroll preservation on chip removal (deliberate per spec) ✓, ScrollToTop ✓, IntersectionObserver + fallback ✓, safe-area ✓, keyboard access ✓.
- No unit tests per spec — task 6's manual checks are the acceptance.
- Placeholder scan: none.
- Type consistency: `onToggle: (id: string, event?: Event) => void` used consistently between ChannelRow and App; `onRemove: (id: string) => void` for chips (deliberately no event since compensation isn't wanted there).
- `[data-scroll-top-anchor]` attribute added to SelectedChannels root in Task 1; queried by ScrollToTop in Task 4. Names match.
