// Lineup live data layer. Swaps the engine's simulated inputs for public feeds, fetched in the browser:
// Open-Meteo (marine + weather + mountain), NOAA CO-OPS (tides, water temp), Caltrans CWWP2 (chain control, CCTV),
// routing via TomTom or Mapbox with the user's key (live traffic), else OSRM (free-flow, no traffic).
import E from './engine.js';

const D = E.D, TZ = 'America/Los_Angeles';
const SPOT = {
  blacks: { lat: 32.8899, lon: -117.2513, mlat: 32.88, mlon: -117.27, station: '9410230', stationName: 'La Jolla' },
  swamis: { lat: 33.0346, lon: -117.2924, mlat: 33.034, mlon: -117.305, station: '9410230', stationName: 'La Jolla' },
  lajolla: { lat: 32.8575, lon: -117.2570, mlat: 32.86, mlon: -117.27, station: '9410230', stationName: 'La Jolla' },
};
const MTN = {
  summit: { lat: 34.2364, lon: -116.8892, topM: 2499, baseM: 2134, plev: 750, d: 'd8', routes: ['18', '330'], site: 'https://www.bigbearmountainresort.com/webcams/snow-summit' },
  bear: { lat: 34.2267, lon: -116.8603, topM: 2683, baseM: 2176, plev: 750, d: 'd8', routes: ['38', '18'], site: 'https://www.bigbearmountainresort.com/webcams/bear-mountain' },
  mammoth: { lat: 37.651, lon: -119.0365, topM: 3369, baseM: 2424, plev: 700, d: 'd9', routes: ['395', '203'], site: 'https://www.mammothmountain.com' },
};
const CT = 'https://cwwp2.dot.ca.gov/data/';
const CAM = {
  blacks: { kind: 'none', label: 'No embeddable public cam', note: 'The Scripps Pier cam is run by Surfline and can’t be embedded. Add your own cam in Settings.', link: 'https://scripps.ucsd.edu/piercam', linkLabel: 'Scripps Pier cam' },
  swamis: { kind: 'img', src: 'https://embed.skylinewebcams.com/img/3461.jpg', every: 300, label: 'Encinitas · SkylineWebcams', live: 'https://www.skylinewebcams.com/webcam/united-states/california/encinitas/encinitas-california.html?w=3461', link: 'https://www.skylinewebcams.com/en/webcam/united-states/california/encinitas/encinitas-california.html', linkLabel: 'Watch live on SkylineWebcams' },
  lajolla: { kind: 'none', label: 'La Jolla cam · SkylineWebcams', note: 'Tap the link button to watch it live, or paste a cam link for La Jolla Shores in Sources & settings.', link: 'https://www.skylinewebcams.com/en/webcam/united-states/california/san-diego/la-jolla.html', linkLabel: 'La Jolla cam on SkylineWebcams' },
  summit: { kind: 'img', src: CT + 'd8/cctv/image/sr18125lakegregory/sr18125lakegregory.jpg', every: 60, label: 'SR-18 Lake Gregory · Caltrans', link: MTN.summit.site, linkLabel: 'Snow Summit resort cams' },
  bear: { kind: 'img', src: CT + 'd8/cctv/image/sr138393nohwy18/sr138393nohwy18.jpg', every: 60, label: 'SR-138 at SR-18 · Caltrans', link: MTN.bear.site, linkLabel: 'Bear Mountain resort cams' },
  mammoth: { kind: 'img', src: CT + 'd9/cctv/image/sr203mammothmountain/sr203mammothmountain.jpg', every: 60, label: 'SR-203 Mammoth Mtn · Caltrans', link: MTN.mammoth.site, linkLabel: 'Mammoth Mountain' },
};
const LABELS = { marine: 'Swell & water · Open-Meteo Marine', coast: 'Coastal wind & sun · Open-Meteo', mtn: 'Mountain weather & snow · Open-Meteo', tide9410230: 'Tides · NOAA La Jolla', water: 'Water temp · NOAA Scripps Pier', ccd8: 'Chain control · Caltrans D8 (Big Bear)', ccd9: 'Chain control · Caltrans D9 (US-395)', route: 'Drive time' };
const S = { off: 0, tday: '', raw: { tideH: {}, tideL: {}, cc: {} }, br: [], mt: [], tide: {}, hilo: {}, cc: {}, routes: {}, src: {}, camDown: {}, water: null, ready: false, settled: false, inflight: false, timers: false, cur: [1, 1], cb: null };
function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
S.settings = S.settings || Object.assign({ prov: 'none', key: '', swamisLive: false, cams: {} }, load('lineup.settings') || {});

const DTF = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
function parts(d) { const p = {}; DTF.formatToParts(d).forEach(x => { p[x.type] = x.value; }); return p; }
function ymd(d) { const p = parts(d); return p.year + '-' + p.month + '-' + p.day; }
function hrs(d) { const p = parts(d); return (+p.hour % 24) + p.minute / 60 + p.second / 3600; }
const tH = s => +s.slice(11, 13) + s.slice(14, 16) / 60;
function dayDiff(a, b) { const f = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); return Math.round((f(a) - f(b)) / 864e5); }
const clockOf = ms => E.fmt(hrs(new Date(ms)));
function hv(a, t) { if (!a || !a.length) return null; t = Math.max(0, Math.min(a.length - 1, t)); const i = Math.floor(t), f = t - i, x = a[i], y = a[Math.min(a.length - 1, i + 1)]; if (x == null) return y == null ? null : y; if (y == null) return x; return x + (y - x) * f; }
function ha(a, t) { if (!a || !a.length) return null; t = Math.max(0, Math.min(a.length - 1, t)); const i = Math.floor(t), f = t - i, x = a[i], y = a[Math.min(a.length - 1, i + 1)]; if (x == null) return y == null ? null : y; if (y == null) return x; return (x + E.norm(y - x) * f + 360) % 360; }
const unitIn = u => /ft/.test(u) ? 12 : /mm/.test(u) ? 1 / 25.4 : /cm/.test(u) ? 1 / 2.54 : /in/.test(u) ? 1 : 39.37;
const r1 = x => x < 10 ? Math.round(x * 10) / 10 : Math.round(x);
const locs = j => Array.isArray(j) ? j : j ? [j] : [];

async function getJSON(id, url) {
  S.src[id] = Object.assign({}, S.src[id], { ok: null });
  try {
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 15000);
    const r = await fetch(url, { signal: ac.signal }); clearTimeout(to);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(), t = Date.now();
    save('lineup.c.' + id, { t, j });
    S.src[id] = { ok: true, t, cached: false };
    return j;
  } catch (err) {
    const c = load('lineup.c.' + id);
    if (c && c.j) { S.src[id] = { ok: true, t: c.t, cached: true, err: String(err.message || err) }; return c.j; }
    S.src[id] = { ok: false, t: null, err: String(err.message || err) };
    return null;
  }
}
const OM = 'https://api.open-meteo.com/v1/forecast?timezone=America%2FLos_Angeles&';
const list = (o, k) => Object.keys(o).map(id => o[id][k]).join(',');
function coastURL() { return OM + 'latitude=' + list(SPOT, 'lat') + '&longitude=' + list(SPOT, 'lon') + '&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunrise,sunset&wind_speed_unit=kn&temperature_unit=fahrenheit&forecast_days=3'; }
function marineURL() { return 'https://marine-api.open-meteo.com/v1/marine?timezone=America%2FLos_Angeles&latitude=' + list(SPOT, 'mlat') + '&longitude=' + list(SPOT, 'mlon') + '&hourly=swell_wave_height,swell_wave_period,swell_wave_direction,secondary_swell_wave_height,secondary_swell_wave_period,secondary_swell_wave_direction,wind_wave_height,wind_wave_period,wind_wave_direction,sea_surface_temperature&forecast_days=3'; }
function mtnURL() {
  const ids = Object.keys(MTN), lat = ids.concat(ids).map(i => MTN[i].lat), lon = ids.concat(ids).map(i => MTN[i].lon), el = ids.map(i => MTN[i].topM).concat(ids.map(i => MTN[i].baseM));
  return OM + 'latitude=' + lat + '&longitude=' + lon + '&elevation=' + el + '&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,wind_speed_700hPa,wind_direction_700hPa,wind_speed_750hPa,wind_direction_750hPa,visibility,snowfall,snow_depth&daily=snowfall_sum&past_days=2&forecast_days=16&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch';
}
const NOAA = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?application=lineup&time_zone=lst_ldt&units=english&format=json&';
const tideURL = (st, iv) => NOAA + 'product=predictions&datum=MLLW&station=' + st + '&begin_date=' + ymd(new Date()).replace(/-/g, '') + '&range=72&interval=' + iv;

function rebuild() {
  const now = new Date(), today = ymd(now), h = hrs(now), coast = locs(S.raw.coast);
  let off = 0;
  if (coast[0] && coast[0].daily) { const i = coast[0].daily.time.indexOf(today); if (i >= 0 && h > tH(coast[0].daily.sunset[i]) + 1) off = 1; } else if (h > 18.5) off = 1;
  S.off = off; S.tday = ymd(new Date(now.getTime() + off * 864e5));
  const T = S.tday;
  if (coast[0] && coast[0].daily) { const i = coast[0].daily.time.indexOf(T); if (i >= 0) { const r = tH(coast[0].daily.sunrise[i]), s = tH(coast[0].daily.sunset[i]); D.light = { first: r - 0.45, rise: r, set: s, last: s + 0.45 }; } }
  const mar = locs(S.raw.marine);
  S.br = D.breaks.map((b, i) => {
    const o = {}, c = coast[i], m = mar[i];
    if (c && c.hourly) { const H = c.hourly, k = H.time.indexOf(T + 'T00:00'); if (k >= 0) { o.wk = H.wind_speed_10m.slice(k, k + 48); o.wd = H.wind_direction_10m.slice(k, k + 48); o.wg = H.wind_gusts_10m.slice(k, k + 48); o.temp = H.temperature_2m.slice(k, k + 48); } }
    if (m && m.hourly) {
      const H = m.hourly, U = m.hourly_units || {}, k = H.time.indexOf(T + 'T00:00'), cv = /ft/.test(U.swell_wave_height || '') ? 0.3048 : 1;
      const g = n => H[n] ? H[n].slice(k, k + 48).map(v => v == null ? null : v * cv) : null, r = n => H[n] ? H[n].slice(k, k + 48) : null;
      if (k >= 0) { o.swH = g('swell_wave_height'); o.swT = r('swell_wave_period'); o.swD = r('swell_wave_direction'); o.s2H = g('secondary_swell_wave_height'); o.s2T = r('secondary_swell_wave_period'); o.s2D = r('secondary_swell_wave_direction'); o.wwH = g('wind_wave_height'); o.wwT = r('wind_wave_period'); o.wwD = r('wind_wave_direction'); }
      const k0 = H.time.indexOf(today + 'T00:00'), sst = H.sea_surface_temperature;
      if (sst && k0 >= 0) { const v = sst[k0 + Math.floor(h)]; if (v != null) o.sstF = /F/.test(U.sea_surface_temperature || '') ? v : v * 9 / 5 + 32; }
    }
    o.wsrc = 'model';
    if ((b.id === 'blacks' || b.id === 'lajolla') && S.water && S.water.v != null) { b.water = Math.round(S.water.v); o.wsrc = 'obs'; } else if (o.sstF != null) b.water = Math.round(o.sstF);
    return o;
  });
  D.breaks.forEach(b => {
    const st = SPOT[b.id].station, H = S.raw.tideH[st], Lo = S.raw.tideL[st];
    if (H && H.predictions) { const a = []; H.predictions.forEach(p => { const x = dayDiff(p.t.slice(0, 10), T) * 24 + tH(p.t); if (x >= 0 && x <= 47 && Number.isInteger(x)) a[x] = +p.v; }); S.tide[b.id] = a; }
    if (Lo && Lo.predictions) S.hilo[b.id] = Lo.predictions.map(p => ({ t: dayDiff(p.t.slice(0, 10), T) * 24 + tH(p.t), h: +p.v, type: /H/.test(p.type) ? 'H' : 'L' })).filter(e => e.t > -2 && e.t < 30);
  });
  const mt = locs(S.raw.mtn);
  S.mt = D.mtns.map((m, i) => {
    const top = mt[i], bot = mt[i + 3], M = MTN[m.id];
    if (!top || !bot || !top.hourly) return null;
    const H = top.hourly, U = top.hourly_units || {}, HB = bot.hourly, k = H.time.indexOf(T + 'T00:00'), k0 = H.time.indexOf(today + 'T00:00');
    if (k < 0 || k0 < 0) return null;
    const sl = A => A ? A.slice(k, k + 48) : null, vc = /ft/.test(U.visibility || '') ? 0.3048 : 1;
    const o = { temp: sl(H.temperature_2m), tempB: sl(HB.temperature_2m), pw: sl(H['wind_speed_' + M.plev + 'hPa']), w10: sl(H.wind_speed_10m), g10: sl(H.wind_gusts_10m), vis: H.visibility ? sl(H.visibility).map(v => v == null ? null : v * vc) : null };
    const nowI = k0 + Math.floor(h), sIn = unitIn(U.snowfall || 'cm'), dIn = unitIn(U.snow_depth || 'm');
    const back = n => { let s = 0; for (let j = Math.max(0, nowI - n + 1); j <= nowI; j++) s += H.snowfall[j] || 0; return s * sIn; };
    m.fresh24 = r1(back(24)); m.fresh48 = r1(back(48)); m.depth = r1((HB.snow_depth[nowI] || 0) * dIn);
    const pd = H['wind_direction_' + M.plev + 'hPa'] || H.wind_direction_10m; m.dir = Math.round((pd && pd[nowI]) || 0);
    const tt = H.temperature_2m[nowI], tb = HB.temperature_2m[nowI]; if (tt != null && tb != null) m.dT = Math.max(0, tb - tt);
    const dd = top.daily, dU = unitIn((top.daily_units || {}).snowfall_sum || 'cm'); o.next = null;
    if (dd) { const j0 = dd.time.indexOf(today); for (let j = Math.max(0, j0); j < dd.time.length; j++) { const v = (dd.snowfall_sum[j] || 0) * dU; if (v >= 0.5) { o.next = { date: dd.time[j], amt: r1(v) }; break; } } }
    return o;
  });
  ['d8', 'd9'].forEach(dist => {
    const j = S.raw.cc[dist]; if (!j || !j.data) return;
    const rows = j.data.map(x => x.cc).filter(Boolean);
    D.mtns.forEach(m => {
      const M = MTN[m.id]; if (M.d !== dist) return;
      let level = 0, seg = '';
      rows.forEach(c => { const rt = String((c.location && c.location.route) || '').replace(/\D/g, ''); if (M.routes.indexOf(rt) < 0) return; const s = String((c.statusData && c.statusData.status) || 'R-0'), lv = /clos/i.test(s) ? 3 : parseInt(s.replace(/\D/g, ''), 10) || 0; if (lv > level) { level = lv; seg = c.location.route + ' ' + (c.location.locationName || ''); } });
      S.cc[m.id] = { level, seg: seg.replace(/[_\s]+/g, ' ').trim() };
    });
  });
  S.ready = S.br.some(o => o.swH && o.wk);
  E.G = false; E._ex = {};
}
S.rebuild = rebuild;
function bump() { (S.rebuild || rebuild)(); if (S.cb) S.cb(); }

async function refresh() {
  if (S.inflight) return; S.inflight = true; S.settled = false;
  const jobs = [
    getJSON('coast', coastURL()).then(j => { if (j) S.raw.coast = j; }),
    getJSON('marine', marineURL()).then(j => { if (j) S.raw.marine = j; }),
    getJSON('mtn', mtnURL()).then(j => { if (j) S.raw.mtn = j; }),
    getJSON('water', NOAA + 'product=water_temperature&date=latest&station=9410230').then(j => { const d = j && j.data && j.data[0]; S.water = d ? { v: +d.v, at: E.fmt(tH(d.t)) } : null; }),
  ];
  ['9410230'].forEach(st => {
    jobs.push(getJSON('tide' + st, tideURL(st, 'h')).then(j => { if (j) S.raw.tideH[st] = j; }));
    jobs.push(fetchQuiet(tideURL(st, 'hilo'), 'lineup.c.hilo' + st).then(j => { if (j) S.raw.tideL[st] = j; }));
  });
  ['d8', 'd9'].forEach(d => jobs.push(getJSON('cc' + d, CT + d + '/cc/ccStatus' + d.toUpperCase().replace('D', 'D0') + '.json').then(j => { if (j) S.raw.cc[d] = j; })));
  await Promise.all(jobs.map(p => p.then(bump, bump)));
  S.inflight = false; S.settled = true; bump();
}
async function fetchQuiet(url, key) { try { const r = await fetch(url); if (!r.ok) throw 0; const j = await r.json(); save(key, j); return j; } catch (e) { return load(key); } }

// ---------- routing ----------
const ORIG = { blacks: [32.8899, -117.2513], swamis: [33.0346, -117.2924], lajolla: [32.8575, -117.2570] };
const provNow = () => S.settings.prov !== 'none' && S.settings.key ? S.settings.prov : 'osrm';
const provLabel = () => ({ tomtom: 'TomTom live traffic', mapbox: 'Mapbox live traffic', osrm: 'OSRM, no traffic' })[provNow()];
if (!S.routesLoaded) { S.routesLoaded = true; S.routes = (load('lineup.routes') || {}).day === ymd(new Date()) ? load('lineup.routes').r : {}; }
const Q = []; let active = 0;
function routeKey(prov, bi, mi, dep) { return prov + '|' + bi + '|' + mi + '|' + (prov === 'osrm' ? 'x' : S.tday + '@' + Math.round(Math.max(dep, E.nowT()) * 2) / 2); }
function want(prov, bi, mi, dep) {
  const key = routeKey(prov, bi, mi, dep), hit = S.routes[key];
  if (hit && (hit.pending || (hit.fail && Date.now() - hit.t < 300e3) || (hit.v && (prov === 'osrm' || Date.now() - hit.t < 900e3)))) return;
  if (E.allowFetch === false) return;
  S.routes[key] = Object.assign({}, hit, { pending: true });
  Q.push({ key, prov, bi, mi, dep }); pump();
}
function pump() { while (active < 2 && Q.length) { const job = Q.shift(); active++; fetchRoute(job).then(() => { active--; pump(); }); } }
async function fetchRoute(job) {
  const o = ORIG[D.breaks[job.bi].id], m = MTN[D.mtns[job.mi].id], k = encodeURIComponent(S.settings.key);
  const startMs = Date.now() + (job.dep - E.nowT()) * 3600e3, future = startMs > Date.now() + 120e3, iso = new Date(startMs).toISOString().slice(0, 16);
  let url;
  if (job.prov === 'tomtom') url = 'https://api.tomtom.com/routing/1/calculateRoute/' + o[0] + ',' + o[1] + ':' + m.lat + ',' + m.lon + '/json?key=' + k + '&traffic=true&travelMode=car&departAt=' + (future ? iso + ':00Z' : 'now');
  else if (job.prov === 'mapbox') url = 'https://api.mapbox.com/directions/v5/mapbox/driving-traffic/' + o[1] + ',' + o[0] + ';' + m.lon + ',' + m.lat + '?overview=false&access_token=' + k + (future ? '&depart_at=' + iso + 'Z' : '');
  else url = 'https://router.project-osrm.org/route/v1/driving/' + o[1] + ',' + o[0] + ';' + m.lon + ',' + m.lat + '?overview=false';
  try {
    const r = await fetch(url), j = await r.json();
    if (!r.ok) throw new Error((j && (j.message || (j.error && j.error.description) || (j.detailedError && j.detailedError.message))) || 'HTTP ' + r.status);
    let v;
    if (job.prov === 'tomtom') { const s = j.routes[0].summary; v = { sec: s.travelTimeInSeconds, miles: s.lengthInMeters / 1609.34, live: true, provider: 'tomtom', delay: s.trafficDelayInSeconds || 0 }; }
    else { const rt = j.routes[0]; v = { sec: rt.duration, miles: rt.distance / 1609.34, live: job.prov === 'mapbox', provider: job.prov, typical: rt.duration_typical }; }
    S.routes[job.key] = { v, t: Date.now() };
    S.src.route = { ok: true, t: Date.now(), cached: false };
  } catch (err) {
    S.routes[job.key] = { fail: true, t: Date.now() };
    if (job.prov !== 'osrm') S.src.route = { ok: false, t: Date.now(), err: String(err.message || err) };
  }
  save('lineup.routes', { day: ymd(new Date()), r: Object.fromEntries(Object.entries(S.routes).filter(([, x]) => x.v)) });
  bump();
}
function route(bi, mi, dep) {
  const prov = provNow();
  want('osrm', bi, mi, dep);
  if (prov !== 'osrm') want(prov, bi, mi, dep);
  const exact = S.routes[routeKey(prov, bi, mi, dep)];
  if (exact && exact.v) return exact.v;
  if (prov !== 'osrm') { let best = null, bd = 9; Object.keys(S.routes).forEach(k => { const p = k.split('|'); if (p[0] === prov && +p[1] === bi && +p[2] === mi && S.routes[k].v) { const d = Math.abs(+p[3].split('@')[1] - dep); if (d < bd) { bd = d; best = S.routes[k].v; } } }); if (best && bd <= 2) return best; }
  const f = S.routes['osrm|' + bi + '|' + mi + '|x'];
  return f && f.v ? f.v : null;
}

// ---------- engine overrides ----------
E.surfAt = function (bi, t) {
  const sp = D.breaks[bi], b = S.br[bi] || {};
  const raw = [['swH', 'swT', 'swD'], ['s2H', 's2T', 's2D'], ['wwH', 'wwT', 'wwD']].map(([a, p, d]) => ({ h: (hv(b[a], t) || 0) * 3.281, T: hv(b[p], t) || 0, d: ha(b[d], t) || 0 }));
  const trains = raw.map(x => { const e = Math.pow(Math.max(0, Math.cos(Math.abs(E.norm(x.d - sp.facing)) * Math.PI / 180)), 0.7), hm = x.h * 0.3048 * e * sp.amp; return { h: x.h, T: x.T, d: x.d, face: x.h * E.clamp(Math.pow(Math.max(x.T, 1) / 10, 0.8), 0.6, 1.5) * e * sp.amp, kj: 3 * hm * hm * x.T * x.T }; });
  const H = Math.sqrt(trains.reduce((a, x) => a + x.face * x.face, 0)), kj = trains.reduce((a, x) => a + x.kj, 0);
  const k = hv(b.wk, t) || 0, wd = ha(b.wd, t) || 0, g = hv(b.wg, t) || k * 1.35, rel = Math.abs(E.norm(wd - sp.facing)), cat = E.windCat(rel, k), wsc = E.windScore(cat, k);
  const td = E.tideAt(t, bi), rising = E.tideAt(t + 0.1, bi) > td, ta = sp.tide[0], tb = sp.tide[1], tsc = td >= ta && td <= tb ? 1 : Math.max(0.3, 1 - (td < ta ? ta - td : td - tb) * 0.4);
  const Sz = E.sizeScore(H * 1.02) * (0.75 + 0.25 * E.clamp((trains[0].T - 6) / 8, 0, 1)), Q = 5 * Sz * (0.15 + 0.85 * wsc) * (0.6 + 0.4 * tsc);
  return { t, H, kj, trains, wind: { k, d: wd, g, rel, cat, score: wsc }, tide: { h: td, rising, score: tsc }, Q, rating: H < 1 ? 'flat' : Q < 1.8 ? 'poor' : Q < 2.8 ? 'fair' : Q < 4.4 ? 'good' : 'epic' };
};
E.tideAt = function (t, bi) { const a = S.tide[D.breaks[bi].id]; if (!a || !a.length) return 2.5; const v = hv(a, t); return v == null ? 2.5 : v; };
E.extremes = function (bi) { return S.hilo[D.breaks[bi].id] || []; };
E.airC = function (t) { const b = S.br[S.cur[0]] || {}; const v = hv(b.temp, t); return Math.round(v == null ? 60 : v); };
E.surfaceSteps = function (mi) {
  const m = D.mtns[mi], o = S.mt[mi];
  if (E.preseason(mi)) return [['none', 'No snowpack', o ? 'Model base ' + m.depth + '″' : 'No data', 0]];
  if (m.fresh24 >= 4) { const p = E.clamp(m.fresh24 / 4, 1.5, 3.5), p1 = 8.5 + p, p2 = p1 + 2; return [['powder', 'Powder', E.fmtC(8.5) + '–' + E.fmtC(p1), 0], ['chopped', 'Chopped', E.fmtC(p1) + '–' + E.fmtC(p2), p1], ['packed', 'Packed', 'from ' + E.fmtC(p2), p2]]; }
  const lo = Math.min.apply(null, (o.tempB || []).slice(0, 24).filter(v => v != null)), hi = Math.max.apply(null, (o.tempB || []).slice(0, 24).filter(v => v != null));
  if (lo <= 28 && hi >= 34) return [['firm', 'Firm', 'until 11a', 0], ['corn', 'Spring corn', '11a–2p', 11], ['slush', 'Slush', 'from 2p', 14]];
  return [['packed', 'Packed powder', 'all day', 0]];
};
E.snowAt = function (mi, t) {
  const o = S.mt[mi];
  const wind = o ? (hv(o.pw, t) || hv(o.w10, t) || 0) : 0, gust = Math.max(o ? hv(o.g10, t) || 0 : 0, wind * 1.3), hold = gust >= 45;
  const temp = o ? hv(o.temp, t) : null, vis = o && o.vis ? E.clamp((hv(o.vis, t) || 16090) / 1609, 0, 10) : 10;
  const season = E.preseason(mi) ? 'pre' : 'on', pre = t < 8.5, post = t > 16, closed = season === 'pre' || pre || post;
  let surfK = 'none', surface = 'No snowpack';
  E.surfaceSteps(mi).forEach(s => { if (t >= s[3]) { surfK = s[0]; surface = s[1]; } });
  if (season === 'on' && pre && D.mtns[mi].fresh24 >= 4) { surfK = 'untracked'; surface = 'Untracked'; }
  const sf = { untracked: 1, powder: 1, chopped: 0.82, packed: 0.68, firm: 0.55, corn: 0.78, slush: 0.5, none: 0 }[surfK];
  const fresh = E.clamp(0.55 + D.mtns[mi].fresh24 / 24, 0.55, 1.05), q = Math.min(5, 5 * sf * (hold ? 0.82 : 1) * (vis < 1 ? 0.75 : vis < 3 ? 0.9 : 1) * fresh);
  const short = { untracked: 'Fresh', powder: 'Powder', chopped: 'Chopped', packed: 'Packed', firm: 'Firm', corn: 'Corn', slush: 'Slush', none: 'None' }[surfK];
  return { t, wind, gust, hold, temp: temp == null ? 32 : temp, vis, pre, post, closed, season, surfK, surface, short, q, rating: season === 'pre' ? 'flat' : q < 1.8 ? 'poor' : q < 2.8 ? 'fair' : q < 4.4 ? 'good' : 'epic', lifts: 0 };
};
E.drive = function (bi, mi, dep, up) {
  const b = D.breaks[bi], m = D.mtns[mi], R = D.routes[b.id + '-' + m.id], r = route(bi, mi, dep);
  let h = r ? r.sec / 3600 : R.h * E.traffic(dep);
  const miles = r ? r.miles : R.mi, tag = r ? (r.live ? ' · live' : ' · no traffic') : ' · est.';
  const cc = S.cc[m.id] || { level: 0, seg: '' }, ch = Math.min(3, cc.level);
  const use = (miles * 1.15 + m.base / 1000 * 6) / 330 * (up ? 1 : 0.6), stop = use > 0.8;
  h += (ch === 1 ? 0.33 : ch >= 2 ? 0.58 : 0) + (stop ? 0.45 : 0);
  const ccSrc = S.src['cc' + MTN[m.id].d];
  return { h, ch: Math.min(2, ch), chRaw: ch, gradeT: up ? dep + h - 0.6 : dep + 0.3, stop, evArr: Math.round(90 - use * 100), via: R.via, gain: m.base, live: !!(r && r.live), provider: r ? r.provider : 'est', tag, miles, chainWhy: ccSrc && ccSrc.t ? 'Caltrans ' + clockOf(ccSrc.t) + ' · ' + (ch ? cc.seg : 'no controls on ' + MTN[m.id].routes.map(x => (x === '395' ? 'US-' : 'SR-') + x).join(', ')) : 'Caltrans status unavailable' };
};
if (!E._basePlan) E._basePlan = E.plan;
E.plan = function (bi, mi, order) {
  const p = E._basePlan.call(this, bi, mi, order);
  if (E.preseason(mi) && p.total !== 0) { p.total = 0; p.nS = 0; }
  return p;
};
E.chainAt = function (mi) { const cc = S.cc[D.mtns[mi].id]; return cc ? Math.min(2, cc.level) : 0; };

// ---------- helpers for the view ----------
const ago = id => { const s = S.src[id]; return s && s.t ? clockOf(s.t) + (s.cached ? ' (cached)' : '') : 'unavailable'; };
E.nowT = () => hrs(new Date()) - 24 * S.off;
E.clockLabel = () => { const p = parts(new Date()); return ((+p.hour % 12) || 12) + ':' + p.minute; };
E.updated = id => { const s = S.src[id]; return s && s.t ? clockOf(s.t) : '—'; };
E.dayWord = () => S.off ? 'tomorrow' : 'today';
E.dayCap = () => S.off ? 'Tomorrow' : 'Today';
E.defaultT = () => S.off ? E.clamp(Math.round(D.light.first * 4) / 4, 5, 17) : E.clamp(E.nowT(), 5, 17);
E.preseason = mi => { const m = D.mtns[mi]; return !S.mt[mi] || (m.depth < 2 && m.fresh24 < 3); };
E.nextSnowText = mi => { const o = S.mt[mi]; if (!o) return 'Mountain forecast unavailable right now.'; if (!o.next) return 'No snow in the 16-day forecast.'; const d = new Date(o.next.date + 'T12:00:00'); return 'Next snow in the forecast: ' + d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ', ~' + o.next.amt + '″ up top.'; };
E.preseasonText = mi => S.mt[mi] ? 'No natural snowpack · model base ' + D.mtns[mi].depth + '″ · ' + E.nextSnowText(mi).replace('Next snow in the forecast: ', 'next snow ') : 'Mountain forecast unavailable right now';
E.liftsText = (mi, s) => (s.season === 'pre' ? 'Lift status isn’t in any open feed. Check the resort before you drive.' : 'Lift status isn’t in an open feed · wind-hold risk ' + (s.gust >= 45 ? 'high' : s.gust >= 30 ? 'medium' : 'low') + ' · summit vis ' + E.num1(s.vis) + ' mi');
E.surfFootnote = (bi, off) => (off ? 'Offline · ' : '') + 'Swell & wind: Open-Meteo ' + ago('marine') + ' · tides: NOAA ' + SPOT[D.breaks[bi].id].stationName;
E.snowFootnote = (mi, off) => (off ? 'Offline · ' : '') + 'Model snow from Open-Meteo ' + ago('mtn') + ' · not a resort report';
E.doubleFootnote = (mi, off) => (off ? 'Offline · ' : '') + 'Chains: Caltrans ' + ago('cc' + MTN[D.mtns[mi].id].d) + ' · drive: ' + provLabel();
E.waterLine = bi => 'Water ' + D.breaks[bi].water + '°F';
E.waterSub = bi => (S.br[bi] || {}).wsrc === 'obs' ? 'NOAA Scripps Pier · ' + S.water.at : 'Open-Meteo model';
function camOf(kind, i) {
  const id = kind === 'break' ? D.breaks[i].id : D.mtns[i].id, c = CAM[id], ov = (S.settings.cams || {})[id];
  if (S.camDown[id] && !ov) return { id, kind: 'none', label: 'Cam offline', note: c.label + ' isn’t responding.', link: c.link, linkLabel: c.linkLabel };
  if (ov) { const y = ov.match(/(?:youtu\.be\/|v=|\/embed\/|\/live\/|\/shorts\/)([\w-]{11})/), ch = ov.match(/channel\/(UC[\w-]+)/); if (y || ch) return { id, kind: 'frame', src: y ? 'https://www.youtube.com/embed/' + y[1] + '?autoplay=1&mute=1&playsinline=1' : 'https://www.youtube.com/embed/live_stream?channel=' + ch[1] + '&autoplay=1&mute=1', label: 'Your cam · YouTube', link: ov, linkLabel: 'Open cam source' }; if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(ov)) return { id, kind: 'img', src: ov, every: 60, label: 'Your cam', link: ov, linkLabel: 'Open cam source' }; return { id, kind: 'frame', src: ov, label: 'Your cam', link: ov, linkLabel: 'Open cam source' }; }
  if (id === 'swamis' && S.settings.swamisLive) return { id, kind: 'frame', src: c.live, label: c.label + ' · live', link: c.link, linkLabel: c.linkLabel };
  return Object.assign({ id }, c);
}
E.camFeed = function (kind, i) {
  const f = camOf(kind, i), src = f.kind === 'img' ? f.src + (f.src.indexOf('?') < 0 ? '?' : '&') + 't=' + Math.floor(Date.now() / ((f.every || 60) * 1000)) : f.src || '';
  const onError = () => { S.camDown[f.id] = true; if (S.cb) S.cb(); };
  return { key: f.id + '|' + f.kind + '|' + (f.src || ''), isImg: f.kind === 'img', isFrame: f.kind === 'frame', isNone: f.kind === 'none', src, label: f.label, note: f.note || '', onError };
};
E.camLabel = (kind, i) => { const f = camOf(kind, i); return f.label + (f.kind === 'img' ? ' · photo' : ''); };
E.camLive = (view, bi, mi) => { if (view === 'split') return 'Cams'; const f = camOf(view === 'mountain' ? 'mtn' : 'break', view === 'mountain' ? mi : bi); return f.kind === 'frame' ? 'Live' : f.kind === 'img' ? 'Photo' : 'No cam'; };
E.camLinkFor = (kind, i) => { const f = camOf(kind, i); return f.link ? { url: f.link, label: f.linkLabel || 'Open source' } : null; };

const Live = {
  init(o) { S.cb = o.onUpdate; S.rebuild = rebuild; rebuild(); if (!S.ready || !S.settled) refresh(); else if (S.cb) S.cb(); if (!S.timers) { S.timers = [setInterval(refresh, 10 * 60e3), setInterval(bump, 60e3)]; } },
  stop() { S.cb = null; if (S.timers) { S.timers.forEach(clearInterval); S.timers = false; } },
  refresh() { S.camDown = {}; return refresh(); },
  isReady: () => S.ready, isSettled: () => S.settled,
  setCurrent(bi, mi) { S.cur = [bi, mi]; },
  settings: () => S.settings,
  setTraffic(prov, key) { S.settings.prov = prov; S.settings.key = (key || '').trim(); save('lineup.settings', S.settings); Object.keys(S.routes).forEach(k => { if (k.indexOf('osrm|') !== 0) delete S.routes[k]; }); S.src.route = null; bump(); },
  setSwamisLive(v) { S.settings.swamisLive = !!v; save('lineup.settings', S.settings); bump(); },
  setCam(id, url) { S.settings.cams = Object.assign({}, S.settings.cams); if (url && url.trim()) S.settings.cams[id] = url.trim(); else delete S.settings.cams[id]; delete S.camDown[id]; save('lineup.settings', S.settings); bump(); },
  trafficLine() { const p = provNow(), s = S.src.route; if (p === 'osrm') return S.settings.prov !== 'none' ? 'Add a key to turn on live traffic' : 'Free-flow times from OSRM · no traffic'; if (!s) return provLabel() + ' · waiting for first route'; return s.ok ? provLabel() + ' · last route ' + clockOf(s.t) : 'Key rejected: ' + s.err; },
  sources() {
    const ids = ['marine', 'coast', 'tide9410230', 'water', 'mtn', 'ccd8', 'ccd9'];
    const rows = ids.map(id => { const s = S.src[id]; const st = !s || s.ok === null ? 'pending' : s.ok ? (s.cached ? 'cached' : 'live') : 'failed'; return { label: LABELS[id], state: st === 'pending' ? 'Loading…' : st === 'failed' ? 'Unavailable' : (st === 'cached' ? 'Cached ' : 'Updated ') + clockOf(s.t), dot: st === 'live' ? 'oklch(0.8 0.15 160)' : st === 'cached' ? 'oklch(0.84 0.14 80)' : st === 'failed' ? 'oklch(0.74 0.15 30)' : '#778692' }; });
    const rs = S.src.route, rp = provNow();
    rows.push({ label: 'Drive time · ' + provLabel(), state: rs && rs.t ? (rs.ok ? 'Updated ' : 'Failed ') + clockOf(rs.t) : 'On demand', dot: rs && !rs.ok ? 'oklch(0.74 0.15 30)' : rp === 'osrm' ? 'oklch(0.84 0.14 80)' : 'oklch(0.8 0.15 160)' });
    rows.push({ label: 'Cams · Caltrans CCTV + SkylineWebcams photo', state: 'Refresh 1–5 min', dot: 'oklch(0.8 0.15 160)' });
    return rows;
  },
  summary() { const r = this.sources(), n = r.filter(x => /Updated|Refresh|On demand/.test(x.state)).length; return n + ' of ' + r.length + ' live'; },
};

export default Live;
