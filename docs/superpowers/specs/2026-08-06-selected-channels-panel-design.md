# Selected Channels Panel — Design

**Status:** approved for implementation planning
**Date:** 2026-08-06
**Feature:** Show currently-selected channels in a chip panel above the search bar, with one-click removal per channel and a "Clear all" affordance.

## Purpose

Give the user immediate visibility of their current channel selection, and make deselection a one-click operation. Today the only way to see or deselect a channel is to find it in the (250+ item) channel list — awkward when the selection has drifted from a shared URL or after heavy searching.

The chip panel makes the selection scannable, edit-able, and reinforces the mapping between the UI and the URL's `c=` param.

## Placement

Inside `src/App.svelte`, in the `.channels` section, **above** `<SearchBox>`. The panel sits between `<HeaderBar>` and the search input.

Full flow:
```
HeaderBar
├─ .channels
│  ├─ SelectedChannels   ← new
│  ├─ SearchBox
│  └─ ChannelList
└─ .recommendation
   └─ RecommendationPanel
```

## Behavior

### Empty state
When `selected.size === 0`, render a subtle bordered container with placeholder text:

> *No channels selected yet — pick some below.*

The container remains present (does not collapse). Keeping it in the layout prevents the search bar from jumping when the first channel is added.

### Populated state
When `selected.size > 0`:

- Render a chip for each selected channel. Order: **alphabetical by channel `id`**, matching the URL's `c=` param character-for-character. So the leftmost chip corresponds to the first id in the URL.
- Render a small **"Clear all"** text button aligned to the right of the header row above the chips.

### Chip anatomy
Each chip is a single interactive element:

- Logo tile: 24px square with the channel's `bgColor` (or black fallback), containing the channel's logo image at `object-fit: contain`.
- Channel name.
- A × glyph at the right.
- The **entire chip** is clickable — clicking removes the channel from `selected`. The × is visual, not a separate hit target, to keep the touch target large.

Chips wrap onto multiple lines using flexbox `flex-wrap: wrap`.

### "Clear all"
- Only visible when at least one channel is selected.
- Clicking it empties `selected` in a single update. No confirmation modal.
- Text button style (no border), small size, subtle color. Right-aligned.

## Component structure

**New file:** `src/components/SelectedChannels.svelte`

**Props:**
```ts
interface Props {
  channels: Channel[];         // full channel array (lookup by id)
  selected: Set<string>;       // current selection
  onRemove: (id: string) => void;
  onClear: () => void;
}
```

The component performs an O(n) lookup building an `id → Channel` map on render, then iterates the sorted `selected` set to produce chips. This is fine for 250-channel scale.

## Wiring in `App.svelte`

Changes:

1. Import `SelectedChannels`; render it above `<SearchBox>`. Pass `channels`, `$selected`, a `toggle`-derived `onRemove` handler, and a new `clearSelection` handler.
2. Add:
   ```ts
   function clearSelection() {
     selected.set(new Set());
   }
   ```
3. Update the `toggle` function to compensate for viewport shift caused by the SelectedChannels panel growing/shrinking above the ChannelList (see below).

The URL sync effect already fires on any `selected` change, so clearing selections empties the `c=` param automatically.

## Scroll-position preservation (required)

**Constraint:** Clicking a channel row to toggle it must never cause that row to move visually on screen. This applies both when selecting (which grows the SelectedChannels panel above) and when deselecting (which shrinks it).

Browser scroll-anchoring (default in Chrome/Firefox/Safari via `overflow-anchor: auto`) handles the case where the panel changes size **outside the viewport**, but does nothing when the panel is currently visible and growing — the ChannelList visibly shifts and the clicked row is no longer under the pointer.

Fix: measure the target row's viewport position before the toggle, then correct scroll after the DOM commits.

**Implementation** in `App.svelte`:

```ts
function toggle(id: string, event?: Event) {
  // Capture the clicked row's Y position before the DOM changes.
  const rowEl = event?.currentTarget instanceof HTMLElement
    ? (event.currentTarget.closest('label.row, .chip') as HTMLElement | null)
    : null;
  const beforeY = rowEl?.getBoundingClientRect().top ?? null;

  selected.update(s => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  // After Svelte commits the update, restore the row's Y position.
  if (rowEl && beforeY !== null) {
    requestAnimationFrame(() => {
      const afterY = rowEl.getBoundingClientRect().top;
      const delta = afterY - beforeY;
      if (delta !== 0) window.scrollBy(0, delta);
    });
  }
}
```

- ChannelRow's `onchange` handler is updated to pass the event to `toggle`.
- SelectedChannels chips' click handler also passes the event to `onRemove` (which is `toggle`), so removing a chip preserves its position too until it disappears — actually, when the chip vanishes it's fine that the mouse is no longer over anything. What matters is that OTHER content on the page doesn't jump: the ChannelList below stays put. Since the SelectedChannels panel shrinks on chip removal, the ChannelList moves up. That IS a shift, but it can't be pinned to the removed chip (the chip is gone). The pragmatic rule: pin the clicked row when clicked from ChannelList; on chip removal, don't compensate (the removed chip is gone and there's nothing to pin to).

Simpler formulation: `toggle` only compensates when the caller passes an event whose target is still in the DOM after the update. Chip clicks pass no event (or an event whose element vanishes), so no compensation runs — acceptable because chip removal causes a small ChannelList upward shift, not a jarring downward shift of a still-visible clicked target.

`clearSelection()` does not compensate scroll — the whole panel collapses to its empty state. Users clicking "Clear all" understand it's a large state change; a modest viewport shift is expected.

## Order-matches-URL detail

The URL encoding sorts by id:
```ts
export function encodeSelection(selected: Set<string>): string {
  return [...selected].sort().join(',');
}
```

The chip panel uses the exact same sort. This makes URL-to-UI mapping visually trivial: a user sharing a URL like `?c=cnn,espn,hgtv` will see chips in the order `[CNN] [ESPN] [HGTV]`.

## Visual style

- Chip container: `flex-wrap: wrap; gap: 0.5rem;` — same neutral palette as the rest of the app, no brand color.
- Chip: rounded pill (`border-radius: 999px`), 1px border in `color-mix(currentColor 20%)`, hover state slightly darker background, cursor pointer.
- Logo tile inside chip: same 24px square shape as the ChannelRow tile, just smaller.
- Placeholder empty-state container: same border style as chips, italic text at reduced opacity, centered.
- "Clear all" button: text-only style, tabular-numeric font, subtle color, hover darkens.
- All colors follow the existing `prefers-color-scheme` pattern.

## Testing

No unit tests. Presentational component matching the rest of `src/components/`. Rely on manual smoke test after build:

- Load app with empty URL → placeholder visible, no chips, no "Clear all".
- Select one channel → chip appears; URL updates.
- Select several → chips ordered alphabetically by id, matching URL.
- Click a chip → channel deselected, chip removed, URL updates.
- Click "Clear all" → all chips removed, placeholder returns, URL's `c=` disappears.
- Deep-link with `?c=espn,cnn,hgtv` → chips appear in `[CNN] [ESPN] [HGTV]` order on load.
- Mobile: chips wrap cleanly, chip is large enough to tap.
- Dark mode: colors follow OS setting.
- **Scroll preservation**: scroll partway down the channel list, click a row → the row stays exactly under the pointer. Repeat with 10 selections growing the SelectedChannels panel; the currently-clicked row never moves on screen.

## Scroll-to-top button

A floating button appears at bottom-right when the user has scrolled past the SelectedChannels panel, providing one-click return to it.

**Component:** `src/components/ScrollToTop.svelte`.

**Behavior:**
- Hidden by default.
- Visible when `window.scrollY > <threshold>` — threshold is the initial Y position of the SelectedChannels panel plus its height (so the button appears exactly when the panel scrolls out of view).
  - Implementation: use `IntersectionObserver` on the SelectedChannels root element. Observe entries; the button is visible iff the observed element is not intersecting the viewport.
  - Fallback for missing IO: `scroll` event listener with a scrollY threshold, throttled via `requestAnimationFrame`.
- On click: `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- On appear/disappear: opacity + translate transition (200ms) so it doesn't pop in abruptly.

**Position:** `position: fixed; bottom: 1.5rem; right: 1.5rem;` — respects safe areas on mobile via `env(safe-area-inset-*)`.

**Style:**
- Circular button, ~44px diameter (WCAG AA touch target).
- Subtle drop shadow for elevation.
- System-adaptive palette matching the rest of the app.
- Contains a single up-arrow SVG (24×24) or Unicode `↑`.
- `aria-label="Scroll to top"`.

**Wiring in `App.svelte`:**
- Import and render `<ScrollToTop />` inside `<main>`, at the end (order doesn't matter since it's `position: fixed`).
- The component internally holds a reference to the SelectedChannels element via a shared ID or a Svelte ref pattern. Simpler alternative: pass the threshold as a prop from App, or use a `data-scroll-top-anchor` attribute on the SelectedChannels root that ScrollToTop queries on mount.

Recommendation: use a `data-scroll-top-anchor` attribute on the SelectedChannels root element and have ScrollToTop query `document.querySelector('[data-scroll-top-anchor]')` on mount. Keeps the two components decoupled. If the anchor isn't found (e.g., panel didn't render), the button falls back to a fixed `scrollY > 400` threshold.

**Testing (manual):**
- Short pages (no scroll needed): button never appears.
- Scroll past the SelectedChannels panel: button fades in.
- Click button: smooth scroll to top; button fades out once panel is back in view.
- Mobile with iOS safe areas: button not clipped by home indicator.
- Keyboard nav: button is focusable and Enter triggers scroll.

## Non-goals (v1)

- No animation on chip add/remove. If jitter proves distracting later, a simple CSS transition can be added.
- No search or filter within the selected list.
- No grouping (by category, by plan, etc.). Flat alphabetical list.
- No "undo last remove" affordance.
