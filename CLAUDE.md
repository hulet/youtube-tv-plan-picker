# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Static single-page Svelte 5 + Vite + TS app. Live at https://youtubetvplanpicker.ideaharbor.org (via Cloudflare Pages, auto-deployed on push to `main`).

The recommendation engine finds the cheapest YouTube TV plan whose channel list is a superset of the user's selection.

## Commands

```
npm run dev             # dev server at http://localhost:5173
npm run build           # production build → dist/
npm run check           # svelte-check (TypeScript + Svelte)
npm test                # vitest run (single pass)
npm run test:watch      # vitest in watch mode
npm test -- tests/recommender.test.ts    # single test file
```

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run check && npm test && npm run build` on push to `main` and every PR. Node version comes from `.nvmrc` (24).

## Architecture

**Data-driven.** Two JSON files under `data/` are the only source of truth:

- `data/channels.json` — canonical channels `{id, name, aliases, logo, bgColor?}`. Local affiliates map onto the corresponding national channel entry (`abc`, `cbs`, `nbc`, `fox-network`, `pbs`, `the-cw`) rather than market-specific callsigns, so the app is market-agnostic.
- `data/plans.json` — 13 plans `{id, name, priceMonthly, channels: string[]}` where `channels` references `channels.json` ids.

Data invariants are enforced by `tests/data-validation.test.ts` (unique ids, every plan-channel exists, logo files exist, exactly 13 plans). Any PR editing `data/` must pass this test.

**Pure logic lives in `src/lib/`.** Each module is fully unit-tested:

- `recommender.ts` — `recommend(selected, plans)` returns plans whose channel set is a superset of the selection, sorted ascending by price. Empty selection → empty array.
- `url-state.ts` — `encodeSelection` joins ids with `.` (dot, not comma — `.` is one of the few characters `URLSearchParams` doesn't percent-encode). `decodeSelection` accepts both `.` and `,` for backward compatibility with older shared URLs.
- `search.ts` — case-insensitive substring match against `name` + `aliases`. Selected channels stay visible even when they don't match the query.

**State lives in `src/stores.ts`.** Two writable stores (`selected: Set<string>`, `query: string`), plus derived `filteredChannels` and `matchingPlans`. `channels` and `plans` are re-exported from the JSON imports for direct access. No global mutable state outside these stores.

**Components in `src/components/` are thin and presentational.** No component tests — visual issues caught by using the app. The interesting logic all sits in `src/lib/` and in `App.svelte`'s `toggle()` and URL-sync effect.

**URL is the persistence layer.** Selection is encoded into `?c=` and read on mount. `history.replaceState` (not `pushState`) is used so back-button doesn't fill with intermediate selections.

**Scroll-position preservation.** `App.svelte`'s `toggle()` measures the clicked row's viewport Y before the state change, then compensates with `window.scrollBy` after Svelte commits. This keeps the clicked row under the pointer even when the SelectedChannels chip panel grows or shrinks above it. When triggered from a chip click (no event target that survives the update), no compensation runs — accepted trade-off.

## Deployment

Cloudflare Pages watches `main` via GitHub integration. Build command `npm run build`, output `dist/`. No wrangler CLI, no deploy command. `.nvmrc` pins Node 24 so Cloudflare's build matches local.

## Important non-obvious rules

- **`data/plans.json` and `data/channels.json` are hand-edited via PRs.** No script generates them on `main`. Treat them as source files.
- **Channel `id`s are stable forever.** Never rename an id — URLs depend on them. To rename a channel, update `name` and add the old spelling to `aliases`.
- **Local affiliate channels never appear in the JSON by callsign** (no KING 5, KIRO 7, etc.). Local coverage rolls up into the national channel entries (`abc`, `cbs`, `nbc`, `fox-network`, `pbs`, `the-cw`).
- **Modal opens with `winner: Plan | null` prop.** When non-null and different from the opened plan, `PlanChannelsModal` renders comparison sections ("Adds vs. X", "Lacks vs. X") before the full channel list.
- **Tied-cheapest plans all render as `winner` cards.** `RecommendationPanel` filters `plans` by matching `plans[0].priceMonthly` to find the tied set; runner-up cards start at the first higher-priced plan.
- **Scrollbar gutter is reserved globally** (`html { scrollbar-gutter: stable; }` in `src/app.css`). Required so opening the modal (which locks body overflow) doesn't cause horizontal layout shift.
