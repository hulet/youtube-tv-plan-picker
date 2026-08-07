# Contributing

Thanks for helping keep this data current!

## What kinds of PRs

- **Price updates** — edit `data/plans.json`, update `priceMonthly`.
- **Lineup changes** — a channel added to or removed from a plan: edit that
  plan's `channels` array in `data/plans.json`.
- **New channel** — add to `data/channels.json`, drop logo in
  `public/logos/`, and reference it from the plans that carry it.
- **Renamed channel** — update `name` in `data/channels.json`. Keep the
  `id` the same. Optionally add the old name to `aliases` so old URLs
  and search terms still work.

## Guidelines

- Keep IDs stable — never rename an `id`. URLs depend on them.
- Kebab-case IDs, ASCII only.
- Prices in US dollars per month.
- Logos: PNG, roughly square, saved to `public/logos/<id>.png`.

## CI

Every PR runs:

- `npm test` — includes data validation (every referenced channel id
  exists, prices are positive, ids are unique, logo files exist).
- `npm run build` — Vite must build cleanly.

If either fails, the PR is not mergeable.

## License

By contributing, you agree your changes are licensed under Apache 2.0.
