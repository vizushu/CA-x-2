# Lineup — live Surf + Snow + CA Double PWA

Production build of the Claude Design handoff in `../project/` (primary design: `Lineup Live.dc.html`,
spec: `../project/design_handoff_lineup_live/README.md`).

```sh
npm install
npm run dev       # http://localhost:5173  (add ?app=1 to drop the presentation frame on desktop)
npm run build     # static site + Workbox service worker in dist/
npm run preview
```

Deploy `dist/` to any HTTPS static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages). `base: './'`
means it also works from a sub-path.

## Layout
- `src/forecast/engine.js` — rating math, windows, CA Double planner, formatting (ported as-is).
- `src/forecast/live.js` — client-side data layer: Open-Meteo, NOAA CO-OPS, Caltrans CWWP2, TomTom/Mapbox/OSRM
  routing, cams, settings, `localStorage` mirroring (`lineup.c.*`, `lineup.settings`, `lineup.routes`).
- `src/forecast/view.js` — view-model: state + data → screen values.
- `src/App.jsx` — UI state, scrubber, spring drawer (k 320 / c 30), cam docking (`--cam`, `--sheet`), layout.
- `src/components/` — Surf, CA Double, Snow screens, cam viewport + HUD, glass dock, settings/loading sheets,
  desktop presentation frame.
- `vite.config.js` — manifest + Workbox: precached shell, network-first (8 s) for forecast APIs, keyed APIs and
  cams never cached.

## Notes
- Like the prototype, the app is laid out at a 430-pt design width and scaled to the viewport
  (`viewportWidth / 430`). A fully fluid layout is the next step if needed.
- Lucide icons and Geist fonts are bundled locally, so the shell works offline.
- URL switches: `?app=1`, `?glove=on|off|auto`, `?offline=1`, `?blueprint=0`, `?sw=1`.
- Keyboard: the time scrubber is a slider (←/→ 15 min, PgUp/PgDn 1 h, Home/End); Esc closes settings.
