# Handoff: Lineup — live Surf + Snow + California Double PWA

## Overview
Lineup is a mobile-first PWA for Southern California that answers three jobs in about three seconds:
1. **Surf:** Is my break worth paddling out at now, and when is the cleanest window today?
2. **Snow:** How much snow fell, what's the summit wind (wind-hold risk), and what's the surface like?
3. **CA Double:** Can I surf and ride the same day? It gives an hour-by-hour plan (coastal window, then the drive with chain status, then the alpine window) and a 0–100 feasibility score.

The prototype in this bundle runs on **real public data** fetched in the browser. Nothing on screen is simulated. When a feed is missing, the UI says so.

## About the design files
The files in this bundle are **design references built in HTML**: working prototypes that show the intended look, behavior and data logic. They are not production code to ship as-is. Recreate them in your target environment using its own patterns. If there's no codebase yet, React + Vite (or Next.js) with a Workbox service worker is the recommended stack. The forecast logic in `lineup-engine.js` and `lineup-live.js` is plain JavaScript and can be ported almost directly into a `forecast/` module.

## Fidelity
**High-fidelity.** Colors, type, spacing, motion and copy are final. Recreate the UI pixel-for-pixel.

## Layout system
- **Design width 430 pt.** On phones the whole app is scaled by `viewportWidth / 430`, and its height becomes `viewportHeight / scale`. On a 390-pt-wide phone that's 0.907×. A production build should use real fluid layout instead of scaling.
- **Presentation mode** (wider than 600 px, not standalone, no `?app`): the phone sits in a 448×950 bezel with explanatory side panels. Below 600 px, when standalone, or with `?app=1`, the frame is dropped and the app runs full-bleed.
- **Grid:** 4/8 pt. Content gutters are 20 pt. Every touch target is at least 48 pt, and 56–64 pt in glove mode.
- **Vertical stack:**
  - Cam: 242 pt tall, full-bleed under the status bar.
  - Scrolling content: starts at y = 258.
  - Glass dock: pinned 8 pt from the left, right and bottom edges, with radius 30/30/40/40.
  - Loadout: the dock expands upward into the loadout drawer.

## Screens / views

### 1. Cam viewport (top, every mode)
- **Size and docking:** 16:9 region, 430×242. A single progress value `--cam` (0–1) collapses it into a 92×52 thumbnail at (16, 61) with radius 12, inside a 118-pt glass mini-bar.
  - `--cam = max(scroll/124, drawerProgress, pinned)`.
  - The mini-bar shows the spot name, a LIVE/PHOTO tag, a one-line summary, a rating pill and a chevron. Tapping it undocks the cam and scrolls back to the top.
- **HUD (fades as `1 − cam×2.2`):**
  - Top-left pill: pulsing dot, `LIVE | PHOTO | NO CAM | CACHED`, plus the source label.
  - Top-right:
    - Surf: water temperature and its source.
    - Snow: summit visibility.
    - CA Double: a 3-way segmented control (split, beach, mountain), each segment 48×40.
  - Bottom-left: dials (40 pt circles). Wind and swell arrows are drawn in the break's own frame: the arrow points the way the wind or swell travels, and the dashed line at the bottom is the beach. Snow mode shows summit wind and wind-hold risk instead.
  - Bottom-right: an external-link button (48 pt) to the cam's source page, then a dock-cam button (48 pt).
- **CA Double split view:** two panes of 49.75% with a 0.5% gutter, animating width/left over 450 ms with cubic-bezier(.2,.8,.2,1).
- **Feed types:**
  - `img`: a still that refreshes on a cache-busting time bucket.
  - `frame`: an iframe for YouTube or other embeds.
  - `none`: a message, with a link out.

### 2. Surf mode (dark theme `#080D14`)
1. **Header:**
   - Eyebrow, mono 11/14 uppercase: `LIVE NOW · 4:56 PM`, or `FORECAST · TODAY 7:30 AM`, or `BEFORE FIRST LIGHT`.
   - Spot name, 28/34, weight 650.
   - Area and facing, 13/18: `Encinitas · faces WSW 250°`.
   - Rating pill, 32 pt tall: Flat / Poor / Fair / Good / Epic.
2. **Verdict:**
   - Face-height range, 72/76, weight 600, tracking −0.045em, plus `ft`.
   - Swell energy on the right: 22/26 with `kJ`.
   - Body-reference line, 15/20: `Knee to waist high · choppy`.
3. **Wind and tide row** (two columns):
   - Wind tile (44 pt) with the arrow in the shore frame, category (`Offshore`) and `8 kt · gusts 11 · WNW`.
   - Tide sparkline (56×44) with `4.6 ft Dropping` and `Low 0.3 · 11:17 PM`.
4. **Best-window card:** radius 18, tinted with the rating color at 13%.
   - Caption: `BEST WINDOW TODAY`, or `TODAY’S WINDOW · CLOSED 9:00 AM`.
   - Time range, 20/26.
   - Detail line: tide trend, wind, size.
   - Status: `In 1h 40m` / `On now · 25m left`.
   - CTA: `Jump` or `Review`, which moves the playhead.
5. **Loadout teaser row:** opens the drawer.
6. **Why it's {rating}:** three rows (Swell, Wind, Tide). Each has a quality dot, a 15/20 headline and a 13/18 detail line.
7. **Tide chart:** 390×104, with a dashed now-line, the scrubbed playhead, and high/low labels.
8. **Footnote:** source and timestamps, then a `Sources & settings` button.

### 3. Snow mode (light glare theme `#E6ECF1`)
- **Header:** pill reads `Pre-season`, `Opens 8:30`, a rating, or `Closed`.
- **Big number:** 24-hour snowfall, shown as `0″ fresh · 24 h`, with 48 h and base depth beside it.
- **By elevation:** summit, mid and base rows.
  - Each row shows temperature, a wind arrow with mph and gusts, and a chip: `Calm` (gusts < 30), `Breezy` (30–44) or `Hold risk` (45+).
  - Below the rows: the lift-status sentence, which is honest that lift status isn't in an open feed.
- **Surface through the day:** 1–3 steps.
  - Powder → Chopped → Packed after a storm of 4″ or more.
  - Firm → Spring corn → Slush when the base drops to 28°F or below and rises to 34°F or above.
  - Packed powder otherwise.
  - `No snowpack` in pre-season.
- **Best-riding card:** in pre-season reads `Not open yet` and gives the next forecast snowfall.

### 4. CA Double (horizon theme `#09141A`, teal → frost radial glow)
- **Route title:** e.g. `Swami's → Bear Mountain`.
- **Feasibility ring:** 96 pt, 6 pt stroke, gradient from oklch(0.8 0.1 190) to oklch(0.93 0.03 240). Shows the score (34/36) and a label: Optimal ≥ 90, Strong ≥ 80, Doable ≥ 65, Stretch ≥ 45, otherwise Not today.
- **Verdict sentence:** 16/22, weight 600.
- **Order toggle:** `Surf first NN` | `Snow first NN`, 48 pt segments, each showing its own score.
- **3-stage sequencer:** time column (56 pt), node (28 pt), then content. A gradient spine connects the nodes.
  - **Coastal window:** size, kJ, wind, tide.
  - **Transit bridge:** route via, departure and arrival, then chips for duration (`2h 58m · live`, or `· no traffic` / `· est.`), elevation gain, chain status (`R0 · SR-38`) and the EV estimate.
  - **Alpine window:** fresh snow, summit temperature, wind, surface. In pre-season it shows base depth instead.
  - The stage that contains the playhead is highlighted. Past stages drop to 55% opacity.
- **Score breakdown:** four bars. Weights are surf 30%, snow 35%, transit 20%, daylight fit 15%.
- **Insight line**, then the loadout teaser, then the footnote.

### 5. Glass dock (every mode, thumb zone)
Top to bottom:
1. **Grab row**, 24 pt: shows `Glove mode` when active, and `Loadout ⌃` on the right.
2. **Readout strip**, 52 pt (58 in glove mode):
   - Time cell (tap to return to `↺ Now`).
   - Four cells in Surf/Snow, five in CA Double.
   - Labels are mono 9.5 pt; values are 15 pt (13.5 pt when there are five cells).
3. **Scrubber**, 80 pt (92 in glove mode), 5 AM–5 PM in 15-minute detents.
   - Wind arrows on top, quality bars in the middle (primary-swell share solid, secondary darker), and a context line along the bottom. The line is tide (Surf), summit temperature (Snow) or the traveller's elevation (CA Double).
   - Darkness or closed hours are hatched. The best window is a tinted band.
   - In CA Double, a stage track runs along the top (teal = surf, dashed = drive, frost = snow).
   - Hour crossings pulse the knob and call `navigator.vibrate(6)`.
4. **Location pills**, 48 pt (56 in glove mode): three breaks or three mountains, each with a rating dot. In CA Double: an origin chip, then the three mountains with their scores.
5. **Mode switch**, 56 pt (64 in glove mode): Surf · CA Double · Snow. The thumb is a pill that springs between positions (`cubic-bezier(.3,1.3,.4,1)`, 380 ms).

### 6. Loadout drawer
- Pull up the dock, flick it, or tap any loadout row. The drawer is spring-driven: k = 320, c = 30.
- It tracks the finger with velocity projection (0.16 s) and rubber-bands past its ends at 0.3×.
- Groups:
  - **Surf:** board by face height, wetsuit by water temperature (boardshorts ≥ 72°F, springsuit ≥ 68, 3/2 ≥ 62, 4/3 ≥ 56, otherwise 5/4 hooded), extras.
  - **Snow:** board by fresh snow, lens by visibility, layers by summit temperature.
  - **Road:** chains from the live Caltrans status, plus a labeled EV/charge estimate.

### 7. Sources & settings sheet
- **Live traffic:** provider segment (TomTom | Mapbox | Off), a password field for the key, Save, and a status line.
- **Swami's cam:** `5-min photo` | `Live player`, with a note on SkylineWebcams' terms.
- **Your own cams:** a URL field for the selected beach and one for the selected mountain. YouTube links auto-convert to embeds; image URLs refresh every 60 s; anything else is iframed.
- **Sources:** one row per feed with a status dot and timestamp. Green = live, amber = cached or no traffic, coral = failed.
- **Footer:** the list of data not available in any open feed, then `Refresh all sources`.

### 8. Loading / failed state
- **Layout:** full-screen `#09141A`. Shows `Fetching live conditions…` with per-source rows.
- **All sources failed:** if every source fails and there's no cache, the title becomes `Couldn’t reach the forecast feeds` and a `Try again` button appears.

## Interactions & behavior
- **Shared state:** the playhead time, selected break, selected mountain and plan order are shared across modes. The playhead follows real time until the user scrubs; `↺ Now` resumes following.
- **Day rollover:** one hour after sunset, the whole app moves to **tomorrow's** data. Labels switch from "today" to "tomorrow".
- **Spot switch:** shows a 900 ms "Connecting to {cam}…" sweep bar.
- **Persistence:** mode, break, mountain, order and cam view are saved in `localStorage` (`lineup.ui`).
- **Reduced motion:** `prefers-reduced-motion` snaps the springs instead of animating.
- **Offline:** the `navigator.onLine` state shows an offline banner. Cached values keep their original timestamps, marked "(cached)".

## Data sources (all fetched client-side, all CORS-enabled)
| Data | Endpoint | Notes |
|---|---|---|
| Swell trains, wind waves, SST | `marine-api.open-meteo.com/v1/marine` | 3 locations in one call, slightly offshore. Heights in m, SST in °C. Hourly, 3 days. |
| Coastal wind, air temp, sunrise/sunset | `api.open-meteo.com/v1/forecast` | `wind_speed_unit=kn`, `temperature_unit=fahrenheit`. |
| Mountain weather and snow | `api.open-meteo.com/v1/forecast` | 6 points (summit + base per resort), using the `elevation=` override. Summit wind from 750 hPa (Big Bear) or 700 hPa (Mammoth). `past_days=2` for 24/48 h totals, `forecast_days=16` for the next snowfall, `precipitation_unit=inch`. |
| Tides | `api.tidesandcurrents.noaa.gov` `product=predictions` | Stations 9410230 (La Jolla: Blacks, Swami's) and 9410580 (Newport Beach: Lowers). Two calls per station, `interval=h` and `interval=hilo`. |
| Water temp (observed) | same API, `product=water_temperature&date=latest&station=9410230` | Scripps Pier. Used for Blacks; other breaks use model SST. |
| Chain control | `cwwp2.dot.ca.gov/data/d8/cc/ccStatusD08.json`, `d9/.../ccStatusD09.json` | Worst status across the resort's routes: SR-18/330, SR-38/18, US-395/SR-203. |
| Road cams | `cwwp2.dot.ca.gov/data/d8|d9/cctv/image/{id}/{id}.jpg` | sr18125lakegregory, sr138393nohwy18, sr203mammothmountain. Public. |
| Beach cam (Swami's) | `embed.skylinewebcams.com/img/3461.jpg` | SkylineWebcams' 5-minute photo, which their FAQ allows on any site. The live player is reserved for the webcam's host. |
| Drive time | TomTom `routing/1/calculateRoute` (`traffic=true`, `departAt`), or Mapbox `driving-traffic` (`depart_at`), or OSRM | The key is the user's own. Routes are cached per pair per 30-minute departure bucket, for 15 minutes. With no key, OSRM gives free-flow times. |

**Not in any open feed (handle server-side in production):**
- Lift status and resort snow reports. These need partnerships or scraping agreements.
- Surfline cams and ratings. These are licensed.
- NDBC and CDIP buoys. They block browser requests; proxy them.

**Caching:** every response is mirrored to `localStorage` (`lineup.c.{source}`) with its fetch time. The service worker adds network-first caching (8 s timeout) for data, cache-first for libraries, and stale-while-revalidate for the app shell. Keyed APIs and cams are never cached.

## Forecast logic (port as-is)
- **Face height:**
  - Per swell train: `face = h(ft) × clamp((T/10)^0.8, 0.6, 1.5) × exposure × spotAmp`.
  - `exposure = cos(|swellDir − beachFacing|)^0.7`.
  - Combined face height = root-sum-square of the three trains.
- **Energy:** `kJ = Σ 3 × (h_m × exposure × amp)² × T²`.
- **Wind category** is relative to the beach's facing:
  - glassy: under 2.5 kt
  - offshore: 135° or more
  - cross-offshore: 112°+
  - cross-shore: 68°+
  - cross-onshore: 45°+
  - onshore: otherwise
- **Quality:** `Q = 5 × sizeScore × (0.15 + 0.85 × windScore) × (0.6 + 0.4 × tideScore)`.
  - Ratings: Flat when H < 1 ft; Poor < 1.8; Fair < 2.8; Good < 4.4; Epic above.
- **Best window:** the contiguous daylight span around the peak Q, with the threshold relaxed from 95% down to 86% until the span is at least 1.5 h.
- **Pre-season:** model base depth under 2″ and 24-hour snowfall under 3″. In that state the alpine half is never scored as rideable.
- **Feasibility score:** `0.30·surf + 0.35·snow + 0.20·transit + 0.15·daylightFit`.
  - Transit loses 10 points for R1, 22 for R2, 14 per hour beyond 2.75 h, and 6 for a charge stop.

## State management
- **UI state:** `mode`, `breakId`, `mtnId`, `order` (surf | snow), `camView` (split | beach | mountain), `t` (playhead hours), `follow`, `dragging`, `docked`, `sheetOpen`, `pinned`, `settingsOpen`, `draft`.
- **Data store:** raw responses, per-day hourly slices (48 h from the target day's midnight), chain status per mountain, route cache, and per-source status (`ok`, `t`, `cached`, `err`).
- **Settings** (`lineup.settings`): `prov`, `key`, `swamisLive`, `cams{spotId: url}`.

## Design tokens
- **Surf theme:**
  - bg `#080D14`
  - text `#EEF3F6` / `#A2ADBA` / `#74808E`
  - fill `rgba(238,243,246,.05)`
  - glass `rgba(14,20,29,.78)` with 30 px blur and 170% saturation
  - accent `oklch(0.84 0.12 195)`
- **Snow theme:**
  - bg `#E6ECF1`
  - text `#0C1621` / `#3B4856` / `#566371`
  - glass `rgba(246,249,251,.86)`
  - accent `oklch(0.47 0.13 250)`
  - quality colors darkened for 4.5:1 on light grounds
- **CA Double theme:**
  - bg `#09141A`
  - accent gradient `oklch(0.8 0.1 190)` → `oklch(0.93 0.03 240)`
- **Quality (dark grounds):**
  - flat `oklch(.7 .02 250)`
  - poor `oklch(.74 .15 30)`
  - fair `oklch(.84 .14 80)`
  - good `oklch(.8 .15 160)`
  - epic `oklch(.87 .16 170)`
- **Type:** SF Pro / system UI, with Geist as the web fallback. Mono is SF Mono / Geist Mono. Scale: 9.5 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 20 · 22 · 28 · 34 · 72.
- **Radii:** 12 · 14 · 16 · 18 · 26 · 30 · 40 (concentric with the 48 pt device corner).

## Assets
- **Icons:** Lucide (static SVGs from jsDelivr), applied as CSS masks. Bundle them locally in production.
- **App icons:** generated in `icons/` (192, 512, maskable 512).
- **Cams:** as listed above. No other imagery.

## Files
- `Lineup Live.dc.html`: the live app (template plus UI logic class).
- `lineup-engine.js`: rating math, formatting and windows (shared with the simulated v2).
- `lineup-live.js`: data layer, engine overrides, routing, cams and settings.
- `lineup-live-view.js`: view-model that turns state and data into screen values.
- `manifest.webmanifest`, `sw.js`, `index.html`, `icons/`: PWA shell.
- `ios-frame.jsx`, `support.js`: prototype runtime (presentation frame and component runtime). Not needed in production.
