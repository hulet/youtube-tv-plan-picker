# YouTube TV Plan Picker

A tool for picking the cheapest YouTube TV plan that includes every channel you
actually watch. Tick the channels you care about, and the app shows the
cheapest plan whose lineup covers your picks — plus other matching plans
ranked by price.

**Live:** https://youtubeplanpicker.ideaharbor.org

## Contributing

The app is data-driven. When YouTube TV changes prices or lineups, submit a
pull request against the JSON files in [`data/`](./data). CI validates the
data on every PR.

**Fix a wrong price:** edit `data/plans.json`, update the `priceMonthly` field.

**A channel moved into a plan:** edit `data/plans.json`, add its `id` to that
plan's `channels` array.

**A channel is missing:** add an entry to `data/channels.json`, drop the logo
into `public/logos/<id>.png`, then add the `id` to whichever plans carry it in
`data/plans.json`.

## Data schema

**`data/channels.json`** — array of channels:

```json
{
  "id": "espn",
  "name": "ESPN",
  "aliases": [],
  "logo": "/logos/espn.png",
  "bgColor": "rgb(221, 0, 0)"
}
```

- `id` — stable slug (kebab-case). Never rename.
- `name` — display name.
- `aliases` — alternate names for search. Not displayed.
- `logo` — path under `/`, points to a file in `public/logos/`.
- `bgColor` — optional `rgb(...)` for the logo tile background.

**`data/plans.json`** — array of plans:

```json
{
  "id": "entertainment",
  "name": "Entertainment",
  "priceMonthly": 54.99,
  "channels": ["adult-swim", "amc", "..."]
}
```

- `channels` references channel `id`s from `channels.json`.

## Local development

```
npm install
npm run dev
```

Open http://localhost:5173.

## Tests

```
npm test
```

## Build

```
npm run build
```

Output goes to `dist/`. Hosted via Cloudflare Pages.

## License

Apache 2.0. See [LICENSE](./LICENSE).

Not affiliated with YouTube or Google.
