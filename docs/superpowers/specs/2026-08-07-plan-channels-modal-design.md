# Plan Channels Modal — Design

**Status:** approved for implementation planning
**Date:** 2026-08-07
**Feature:** Clicking any plan card in the recommendation panel opens a modal listing every channel in that plan.

## Purpose

Users can see prices and plan names in the recommendation panel but have no way to inspect what a plan actually includes without matching every channel in the main list to that plan's tags. A per-plan modal answers "what do I get with plan X?" in one click. This applies equally to the currently-recommended winner, its runners-up, and the "All available plans" browse list shown when no channels are selected.

## Behavior

- **Every plan card is clickable** (winner, runner-up, all-plans-list). Clicking opens a modal for that plan.
- Modal shows: plan name, price, channel count, and a chip grid of every channel in that plan.
- Modal is dismissible via:
  - Clicking the backdrop
  - Pressing ESC
  - Clicking the X close button
- Chips inside the modal are **view-only**: no click behavior, no × glyph. They're pure display, styled the same way as the SelectedChannels chips (logo tile + name in a rounded pill).
- Chips are sorted **alphabetical by channel `name`** — browse-oriented, not URL-matching. Different from SelectedChannels which sorts by `id`.

## Components

### New: `src/components/PlanChannelsModal.svelte`

**Props:**
```ts
interface Props {
  plan: Plan | null;      // null = closed, non-null = open for that plan
  channels: Channel[];    // full channel array for id → Channel lookup
  onClose: () => void;
}
```

Rendered layout when `plan !== null`:

- Fixed-position backdrop covering the viewport, semi-transparent, click-to-close.
- Centered white/dark card (respects `prefers-color-scheme`), max-width ~560px, max-height ~85vh, internally scrollable if needed.
- Card contents:
  - Header row: `<h2>{plan.name}</h2>`, X close button on the right.
  - Sub-header: price (`$X.YZ/mo`) + channel count ("47 channels").
  - Chip grid: `.chips` `<ul>` wrapping each channel as a static chip (logo tile + name).
- Body scroll on the underlying page is locked (`document.body.style.overflow = 'hidden'`) while open, restored on close.

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the plan name `<h2>` element's id.
- ESC key handler bound to `window` while open.
- Focus moves to the close button on open; on close, focus returns to the PlanCard that triggered it (handled by the caller — PlanCard exposes its button so the caller can re-focus it).
- Backdrop is a `<div>` with click handler; clicking anywhere on it (outside the card) closes.

### Modified: `src/components/PlanCard.svelte`

Add `onSelect: (plan: Plan) => void` prop. Wrap the existing card contents in a `<button type="button">` so the entire card is a single keyboard/screen-reader activation target. Preserve existing visuals; add:
- `cursor: pointer`
- Subtle hover state (matches existing chip hover treatment)
- Focus-visible outline

The button element is what triggers `onSelect(plan)`. No styling on the button itself; it fills the card so the whole visible area is clickable.

### Modified: `src/components/RecommendationPanel.svelte`

- Add `channels: Channel[]` prop (for the modal's lookup).
- Hold local state: `let openPlan: Plan | null = $state(null)`.
- Pass `onSelect={(p) => openPlan = p}` to every `<PlanCard>` — winner, runner-up, and all-plans-list variants.
- Render `<PlanChannelsModal plan={openPlan} {channels} onClose={() => openPlan = null} />` at the end of the panel.

### Modified: `src/App.svelte`

Pass `channels` to `<RecommendationPanel>` (already imported from stores).

## Data flow

```
App
 └ RecommendationPanel (owns openPlan state)
    ├ PlanCard (winner)      ─ onSelect={p => openPlan = p}
    ├ PlanCard (runner-up)   ─ onSelect={p => openPlan = p}
    └ PlanChannelsModal      ─ plan={openPlan}, onClose={() => openPlan = null}
```

No stores modified. Modal state is UI-local, doesn't need URL persistence.

## Visual style

- Backdrop: `background: rgba(0, 0, 0, 0.4)` in both light and dark modes (or a slightly denser version in dark).
- Card: same border-radius / border style as existing cards. Elevated with a moderate box-shadow. Padding `1.5rem`.
- Chips: reuse the exact visual style of SelectedChannels chips minus the × and hover-cursor (so they don't imply clickability).
- Modal max-width `560px`, but shrinks to `calc(100vw - 2rem)` on narrow viewports.

## Testing

No unit tests. Presentational Svelte component. Manual smoke test:

- Click winner card → modal opens showing that plan's channels.
- Click each runner-up card → modal for that plan.
- Click a card in the "All available plans" list → modal for that plan.
- ESC key closes.
- Backdrop click closes; card body click does not close.
- X button closes.
- After close, keyboard focus returns to the plan card that opened it (Tab key highlights the same card).
- Body doesn't scroll while modal is open; scrolls again after close.
- On mobile viewport (Chrome DevTools), modal fills viewport minus margin; chips wrap cleanly.
- Dark mode: modal colors follow system preference.
- Screen reader (VoiceOver): modal announces plan name on open; chips are read as a list.

## Non-goals (v1)

- No "add all these channels to my selection" bulk action from the modal.
- No filtering/searching within a modal's chip list.
- No animation on open/close beyond a simple opacity fade (~150ms).
- No comparison view (side-by-side plans).
