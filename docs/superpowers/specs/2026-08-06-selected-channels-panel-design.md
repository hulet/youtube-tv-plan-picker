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

Two changes:

1. Import `SelectedChannels`; render it above `<SearchBox>`. Pass `channels` (from the stores module), `$selected`, `toggle` (existing), and a new `clearSelection` handler.
2. Add:
   ```ts
   function clearSelection() {
     selected.set(new Set());
   }
   ```

The URL sync effect already fires on any `selected` change, so clearing selections empties the `c=` param automatically.

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

## Non-goals (v1)

- No animation on chip add/remove. If jitter proves distracting later, a simple CSS transition can be added.
- No search or filter within the selected list.
- No grouping (by category, by plan, etc.). Flat alphabetical list.
- No "undo last remove" affordance.
