# Plan Channels Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a modal that opens on click of any plan card in the recommendation panel, listing that plan's channels as a chip grid.

**Architecture:** One new presentational Svelte 5 component (`PlanChannelsModal`), wrapped in a backdrop dialog with body-scroll lock, ESC handling, and focus management. `PlanCard` becomes clickable via a new `onSelect` prop; `RecommendationPanel` owns the `openPlan` state and renders the modal alongside its plan cards.

**Tech Stack:** Svelte 5, TypeScript, plain CSS. No new dependencies.

**Related:** Implements the spec at `docs/superpowers/specs/2026-08-07-plan-channels-modal-design.md`.

---

## File Structure

- **Create:** `src/components/PlanChannelsModal.svelte` — the modal (backdrop + card + chip grid + close + a11y).
- **Modify:** `src/components/PlanCard.svelte` — wrap contents in a `<button>`, add optional `onSelect` prop.
- **Modify:** `src/components/RecommendationPanel.svelte` — accept `channels` prop, hold `openPlan`, wire `onSelect` on each PlanCard, render the modal.
- **Modify:** `src/App.svelte` — pass `channels` to `<RecommendationPanel>`.

---

### Task 1: Create `PlanChannelsModal.svelte`

**Files:**
- Create: `src/components/PlanChannelsModal.svelte`

Standalone component. Renders a backdrop + card when `plan` prop is non-null; renders nothing when `plan` is null. Handles ESC key, body scroll lock, backdrop click, and X-button close.

- [ ] **Step 1: Create the file**

```svelte
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
```

- [ ] **Step 2: Verify type-check**

```bash
cd /Users/hulet/tries/2026-08-05-youtube-plan-picker
npm run check
```

Expected: `COMPLETED ... 0 ERRORS 0 WARNINGS`.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlanChannelsModal.svelte
git commit -m "feat: PlanChannelsModal component"
```

---

### Task 2: Make `PlanCard` clickable

**Files:**
- Modify: `src/components/PlanCard.svelte`

Wrap the card body in a `<button>` and add an optional `onSelect(plan)` prop. Optional so existing callers still typecheck without changes.

- [ ] **Step 1: Replace `src/components/PlanCard.svelte`** with:

```svelte
<script lang="ts">
  import type { Plan } from '../types';

  interface Props {
    plan: Plan;
    variant: 'winner' | 'runner-up';
    selectedCount: number;
    onSelect?: (plan: Plan) => void;
  }

  let { plan, variant, selectedCount, onSelect }: Props = $props();

  let priceStr = $derived(`$${plan.priceMonthly.toFixed(2)}/mo`);
</script>

<button
  type="button"
  class="card"
  class:winner={variant === 'winner'}
  class:runner-up={variant === 'runner-up'}
  onclick={() => onSelect?.(plan)}
  aria-label={`See channels in ${plan.name}`}
>
  {#if variant === 'winner'}
    <div class="label">Cheapest plan</div>
  {/if}
  <div class="name">{plan.name}</div>
  <div class="price">{priceStr}</div>
  {#if variant === 'winner'}
    <div class="covers">Covers all {selectedCount} channel{selectedCount === 1 ? '' : 's'} you picked.</div>
  {/if}
</button>

<style>
  .card {
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 0.25rem;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    width: 100%;
  }
  .card:hover { background: color-mix(in srgb, currentColor 4%, transparent); }
  .card:focus-visible {
    outline: 2px solid color-mix(in srgb, currentColor 40%, transparent);
    outline-offset: 2px;
  }
  .card.winner {
    background: color-mix(in srgb, currentColor 4%, transparent);
    border-color: color-mix(in srgb, currentColor 30%, transparent);
  }
  .card.winner:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
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
```

- [ ] **Step 2: Verify type-check**

```bash
npm run check
```

Expected: 0 errors. `RecommendationPanel.svelte`'s existing usage of `<PlanCard>` (without `onSelect`) still typechecks because the prop is optional.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlanCard.svelte
git commit -m "feat: PlanCard is now a clickable button with optional onSelect"
```

---

### Task 3: Wire modal into `RecommendationPanel`

**Files:**
- Modify: `src/components/RecommendationPanel.svelte`

Accept a new `channels` prop, hold `openPlan` state, pass `onSelect` to every PlanCard, render `<PlanChannelsModal>`.

- [ ] **Step 1: Replace `src/components/RecommendationPanel.svelte`** with:

```svelte
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

<PlanChannelsModal plan={openPlan} {channels} onClose={() => openPlan = null} />

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
```

- [ ] **Step 2: Verify type-check**

```bash
npm run check
```

Expected: 1 error — `App.svelte` no longer typechecks because it doesn't pass `channels` yet. That's expected; Task 4 fixes it.

If you see a DIFFERENT error, stop and investigate.

- [ ] **Step 3: Commit (still broken; App.svelte will be fixed in Task 4)**

Do NOT commit yet. Continue to Task 4 and commit both changes together at the end of Task 4. This keeps main clean.

---

### Task 4: Pass `channels` from `App.svelte` and commit both changes

**Files:**
- Modify: `src/App.svelte`

- [ ] **Step 1: Read `src/App.svelte` and find the line** rendering `<RecommendationPanel>`.

The current line is:

```svelte
      <RecommendationPanel plans={$matchingPlans} allPlans={plans} selectedCount={$selected.size} />
```

- [ ] **Step 2: Add the `channels` prop** — replace that line with:

```svelte
      <RecommendationPanel plans={$matchingPlans} allPlans={plans} {channels} selectedCount={$selected.size} />
```

The `channels` value is already imported from `./stores` at the top of the file — no import change needed.

- [ ] **Step 3: Verify type-check + tests + build all pass**

```bash
npm run check && npm test && npm run build
```

Expected: 0 type errors, 27/27 tests pass, `dist/` populated.

- [ ] **Step 4: Commit both files together**

```bash
git add src/components/RecommendationPanel.svelte src/App.svelte
git commit -m "feat: wire PlanChannelsModal into recommendation panel"
```

---

### Task 5: Manual smoke test and push

**Files:** none.

- [ ] **Step 1: Run the dev server**

```bash
cd /Users/hulet/tries/2026-08-05-youtube-plan-picker
npm run dev -- --port 5173 &
SERVER_PID=$!
sleep 3
echo "Open http://localhost:5173/ and verify:"
echo ""
echo "  With no channels selected:"
echo "  [ ] Click a card in 'All available plans' — modal opens for that plan"
echo "  [ ] ESC closes the modal"
echo "  [ ] Click backdrop closes"
echo "  [ ] Click X closes"
echo "  [ ] After close, keyboard focus is on the card that opened it (Tab to verify)"
echo "  [ ] While modal is open, body doesn't scroll (try scroll wheel)"
echo ""
echo "  With some channels selected:"
echo "  [ ] Click winner card — modal opens for that plan"
echo "  [ ] Click a runner-up card — modal opens for that plan"
echo "  [ ] Chips inside show logo + name, sorted alphabetically by name"
echo ""
echo "  Cross-cutting:"
echo "  [ ] Dark mode: modal colors follow system preference"
echo "  [ ] Mobile viewport (DevTools): modal fills viewport minus margin, chips wrap"
echo "  [ ] Screen reader (optional): announces plan name on open"
echo ""
echo "  Ctrl-C or kill $SERVER_PID when done"
wait $SERVER_PID
```

If any check fails, STOP and either fix or report.

- [ ] **Step 2: Push to remote**

```bash
git push
```

This triggers a Cloudflare Pages auto-deploy.

- [ ] **Step 3: Smoke test in production**

Wait ~1-2 minutes for the deploy to complete, then open https://youtube-tv-plan-picker.pages.dev/ and repeat the manual checks from Step 1.

If production behaves the same as local, this plan is complete.

---

## Self-review notes (for the plan author, not the executor)

- Spec coverage: modal component ✓, all cards clickable ✓, chip grid view-only ✓, alphabetical by name ✓, ESC/backdrop/X dismiss ✓, body scroll lock ✓, focus management ✓, `role="dialog"` a11y ✓, empty-plan safety ✓.
- Placeholder scan: none.
- Type consistency: `onSelect: (plan: Plan) => void` used consistently between PlanCard's prop, RecommendationPanel's callers, and Task 4. `channels: Channel[]` matches the type imported from `./stores`.
- Task 3 leaves the tree in a broken state deliberately. Task 4 restores type-check-clean before committing both files. This is documented explicitly to prevent an executor from committing halfway.
