// Lineup forecast engine: surf, snow, transit and the California Double planner.
// Ported from the design handoff (lineup-engine.js). The live data layer (live.js) overrides the
// input functions (surfAt, snowAt, tideAt, drive, …) with ones that read real feeds.
import { iconUrl } from '../icons.js';

const D = {
  breaks: [
    { id: 'ob', name: 'Ocean Beach', short: 'OB', area: 'San Diego', facing: 268, amp: 1.0, tide: [1.0, 4.5], water: 60, note: 'sandbars either side of the pier pick up W–NW swell', cam: 'Pier cam', cycle: 480 },
    { id: 'lajolla', name: 'La Jolla Shores', short: 'La Jolla', area: 'La Jolla', facing: 280, amp: 0.75, tide: [1.0, 4.0], water: 60, note: 'a sheltered sand-bottom beach break tucked inside the point, so it runs smaller than Blacks', cam: 'Shores cam', cycle: 480 },
    { id: 'blacks', name: 'Blacks', short: 'Blacks', area: 'La Jolla', facing: 265, amp: 1.15, tide: [1.5, 4.6], water: 58, note: 'Scripps Canyon focuses it into A-frame peaks', cam: 'North cliff cam', cycle: 420 },
    { id: 'delmar', name: 'Del Mar', short: 'Del Mar', area: 'Del Mar', facing: 265, amp: 0.9, tide: [1.0, 4.0], water: 60, note: 'a sand-bottom beach break whose peaks shift with the bars', cam: 'Beach cam', cycle: 480 },
    { id: 'swamis', name: "Swami's", short: "Swami's", area: 'Encinitas', facing: 250, amp: 0.95, tide: [1.0, 4.6], water: 58, note: 'the reef point lines up best on W–NW', cam: 'Bluff cam', cycle: 480 },
    { id: 'carlsbad', name: 'Carlsbad', short: 'Carlsbad', area: 'Carlsbad', facing: 260, amp: 0.95, tide: [1.0, 4.4], water: 60, note: 'open beach breaks that take W–NW swell straight on', cam: 'Beach cam', cycle: 480 },
  ],
  mtns: [
    { id: 'summit', name: 'Snow Summit', short: 'Summit', area: 'Big Bear Lake', base: 7000, top: 8200, lifts: 12, exposed: 3, fresh24: 7, fresh48: 10, depth: 30, wind: [34, 36, 38, 36, 32, 27, 22, 19, 17, 16, 15, 14, 14], dir: 40, temp: [14, 13, 13, 15, 18, 21, 24, 26, 27, 27, 26, 24, 22], dT: 9, vis: [0.3, 0.4, 0.8, 2, 5, 10, 10, 10, 10, 10, 10, 10, 10], powderH: 2.0, cam: 'Summit cam', hold: 'Summit chair', grade: 'SR-330 / SR-18', chain: [[0, 2], [8, 1], [12, 0]] },
    { id: 'bear', name: 'Bear Mountain', short: 'Bear Mtn', area: 'Big Bear Lake', base: 7140, top: 8805, lifts: 10, exposed: 2, fresh24: 9, fresh48: 13, depth: 26, wind: [40, 42, 44, 41, 36, 30, 24, 20, 18, 17, 16, 15, 15], dir: 45, temp: [12, 11, 11, 13, 16, 19, 22, 24, 25, 25, 24, 22, 20], dT: 10, vis: [0.2, 0.3, 0.5, 1.5, 4, 8, 10, 10, 10, 10, 10, 10, 10], powderH: 2.5, cam: 'Peak cam', hold: 'Summit chair', grade: 'SR-38', chain: [[0, 1], [11, 0]] },
    { id: 'mammoth', name: 'Mammoth Mountain', short: 'Mammoth', area: 'Mammoth Lakes', base: 7953, top: 11053, lifts: 25, exposed: 5, fresh24: 16, fresh48: 22, depth: 58, wind: [58, 62, 64, 60, 56, 50, 45, 40, 36, 34, 32, 30, 30], dir: 20, temp: [4, 3, 3, 5, 8, 11, 14, 16, 17, 17, 16, 14, 12], dT: 16, vis: [0.1, 0.2, 0.3, 0.5, 1, 3, 6, 10, 10, 10, 10, 10, 10], powderH: 3.5, cam: 'Summit gondola cam', hold: 'Summit gondola', grade: 'US-395 / SR-203', chain: [[0, 2], [10, 1]] },
  ],
  routes: {
    'blacks-summit': { via: 'I-15 · SR-330 · SR-18', mi: 135, h: 2.55 }, 'blacks-bear': { via: 'I-15 · SR-210 · SR-38', mi: 138, h: 2.6 }, 'blacks-mammoth': { via: 'I-15 · US-395', mi: 352, h: 5.9 },
    'swamis-summit': { via: 'I-15 · SR-330 · SR-18', mi: 122, h: 2.35 }, 'swamis-bear': { via: 'I-15 · SR-210 · SR-38', mi: 125, h: 2.4 }, 'swamis-mammoth': { via: 'I-15 · US-395', mi: 338, h: 5.7 },
    'ob-summit': { via: 'I-15 · SR-330 · SR-18', mi: 138, h: 2.6 }, 'ob-bear': { via: 'I-15 · SR-210 · SR-38', mi: 141, h: 2.65 }, 'ob-mammoth': { via: 'I-15 · US-395', mi: 355, h: 5.95 },
    'delmar-summit': { via: 'I-15 · SR-330 · SR-18', mi: 128, h: 2.45 }, 'delmar-bear': { via: 'I-15 · SR-210 · SR-38', mi: 131, h: 2.5 }, 'delmar-mammoth': { via: 'I-15 · US-395', mi: 344, h: 5.8 },
    'carlsbad-summit': { via: 'SR-78 · I-15 · SR-330', mi: 113, h: 2.2 }, 'carlsbad-bear': { via: 'SR-78 · I-15 · SR-38', mi: 116, h: 2.25 }, 'carlsbad-mammoth': { via: 'SR-78 · I-15 · US-395', mi: 330, h: 5.5 },
    'lajolla-summit': { via: 'I-15 · SR-330 · SR-18', mi: 134, h: 2.55 }, 'lajolla-bear': { via: 'I-15 · SR-210 · SR-38', mi: 137, h: 2.6 }, 'lajolla-mammoth': { via: 'I-15 · US-395', mi: 351, h: 5.9 },
  },
  wind: { d: [45, 45, 50, 55, 60, 75, 120, 230, 255, 265, 270, 275, 280], k: [8, 9, 10, 9, 8, 6, 3, 5, 8, 11, 12, 11, 9] },
  light: { first: 6.4, rise: 6.85, set: 17.08, last: 17.53 },
  clocks: { dawn: { t: 6.6667, label: '6:40' }, midday: { t: 13.25, label: '1:15' } },
  colors: { flat: [0.7, 0.02, 250], poor: [0.74, 0.15, 30], fair: [0.84, 0.14, 80], good: [0.8, 0.15, 160], epic: [0.87, 0.16, 170] },
  colorsL: { flat: [0.5, 0.02, 250], poor: [0.52, 0.17, 30], fair: [0.52, 0.12, 65], good: [0.5, 0.12, 160], epic: [0.47, 0.12, 175] },
  labels: { flat: 'Flat', poor: 'Poor', fair: 'Fair', good: 'Good', epic: 'Epic' },
  themes: {
    surf: { bg: '#080D14', t1: '#EEF3F6', t2: '#A2ADBA', t3: '#74808E', fill: 'rgba(238,243,246,0.05)', hair: 'rgba(238,243,246,0.10)', glass: 'rgba(14,20,29,0.78)', chip: 'rgba(238,243,246,0.12)', acc: 'oklch(0.84 0.12 195)', accbg: 'oklch(0.84 0.12 195)', accfg: '#04131A', grab: 'rgba(238,243,246,0.3)' },
    double: { bg: '#09141A', t1: '#EEF4F6', t2: '#A5B3BD', t3: '#778692', fill: 'rgba(238,244,246,0.05)', hair: 'rgba(238,244,246,0.10)', glass: 'rgba(12,24,30,0.78)', chip: 'rgba(238,244,246,0.12)', acc: 'oklch(0.82 0.1 190)', accbg: 'linear-gradient(90deg, oklch(0.8 0.1 190), oklch(0.93 0.03 240))', accfg: '#06161B', grab: 'rgba(238,244,246,0.3)' },
    snow: { bg: '#E6ECF1', t1: '#0C1621', t2: '#3B4856', t3: '#566371', fill: 'rgba(12,22,33,0.05)', hair: 'rgba(12,22,33,0.12)', glass: 'rgba(246,249,251,0.86)', chip: 'rgba(12,22,33,0.08)', acc: 'oklch(0.47 0.13 250)', accbg: 'oklch(0.47 0.13 250)', accfg: '#FFFFFF', grab: 'rgba(12,22,33,0.25)' },
  },
};

const lerp = (a, b, f) => a + (b - a) * f;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const angd = (a, b) => ((a - b) % 360 + 540) % 360 - 180;
const lerpAng = (a, b, f) => (a + angd(b, a) * f + 360) % 360;
const norm = a => ((a % 360) + 540) % 360 - 180;
const idx = t => { const x = clamp(t - 5, 0, 12), i = Math.floor(x); return [i, Math.min(12, i + 1), x - i]; };
const arr = (A, t) => { const [i, j, f] = idx(t); return lerp(A[i], A[j], f); };
const arrAng = (A, t) => { const [i, j, f] = idx(t); return lerpAng(A[i], A[j], f); };

const E = {
  D, lerp, clamp, norm,
  tideAt(t, bi) { if (bi === 2) t -= 0.1; return 2.45 + 1.75 * Math.cos(2 * Math.PI * (t - 6.3) / 12.42) + 0.45 * Math.cos(2 * Math.PI * (t - 5.5) / 23.93); },
  windCat(rel, k) { return k < 2.5 ? 'glassy' : rel >= 135 ? 'offshore' : rel >= 112 ? 'cross-offshore' : rel >= 68 ? 'cross-shore' : rel >= 45 ? 'cross-onshore' : 'onshore'; },
  windScore(c, k) {
    if (c === 'glassy') return 0.95;
    if (c === 'offshore') return k <= 12 ? 1 : k <= 20 ? 0.85 : 0.6;
    if (c === 'cross-offshore') return k <= 8 ? 0.85 : 0.65;
    if (c === 'cross-shore') return k <= 5 ? 0.7 : k <= 10 ? 0.5 : 0.3;
    if (c === 'cross-onshore') return k <= 5 ? 0.6 : k <= 10 ? 0.35 : 0.2;
    return k <= 5 ? 0.5 : k <= 8 ? 0.3 : k <= 12 ? 0.15 : 0.08;
  },
  sizeScore(h) {
    const S = [[0.5, 0], [1, 0.12], [2, 0.32], [3, 0.55], [4, 0.72], [5, 0.82], [6, 0.9], [8, 1], [30, 1]];
    for (let i = 1; i < S.length; i++) if (h <= S[i][0]) { const [a, b] = S[i - 1], [c, d] = S[i]; return clamp(lerp(b, d, (h - a) / (c - a)), 0, 1); }
    return 1;
  },
  surfAt(bi, t) {
    const sp = D.breaks[bi], f = clamp((t - 5) / 12, 0, 1);
    const raw = [
      { h: lerp(4.4, 3.9, f), T: lerp(15, 14, f), d: lerpAng(285, 287, f) },
      { h: lerp(2.0, 1.2, f), T: 9, d: 300 },
      { h: lerp(0.3, 0.9, clamp((t - 11) / 5, 0, 1)), T: 7, d: 275 },
    ];
    const trains = raw.map(x => {
      const e = Math.pow(Math.max(0, Math.cos(Math.abs(angd(x.d, sp.facing)) * Math.PI / 180)), 0.7), hm = x.h * 0.3048 * e * sp.amp;
      return { h: x.h, T: x.T, d: x.d, face: x.h * clamp(Math.pow(x.T / 10, 0.8), 0.6, 1.5) * e * sp.amp, kj: 3 * hm * hm * x.T * x.T };
    });
    const H = Math.sqrt(trains.reduce((a, x) => a + x.face * x.face, 0)), kj = trains.reduce((a, x) => a + x.kj, 0);
    const k = arr(D.wind.k, t), wd = arrAng(D.wind.d, t), rel = Math.abs(angd(wd, sp.facing)), cat = this.windCat(rel, k), wsc = this.windScore(cat, k);
    const td = this.tideAt(t, bi), rising = this.tideAt(t + 0.1, bi) > td;
    const [ta, tb] = sp.tide, tsc = td >= ta && td <= tb ? 1 : Math.max(0.3, 1 - (td < ta ? ta - td : td - tb) * 0.4);
    const S = this.sizeScore(H * 1.02) * (0.75 + 0.25 * clamp((trains[0].T - 6) / 8, 0, 1));
    const Q = 5 * S * (0.15 + 0.85 * wsc) * (0.6 + 0.4 * tsc);
    const rating = H < 1 ? 'flat' : Q < 1.8 ? 'poor' : Q < 2.8 ? 'fair' : Q < 4.4 ? 'good' : 'epic';
    return { t, H, kj, trains, wind: { k, d: wd, g: k * 1.35 + 1, rel, cat, score: wsc }, tide: { h: td, rising, score: tsc }, Q, rating };
  },
  snowAt(mi, t) {
    const m = D.mtns[mi], wind = arr(m.wind, t), gust = wind * 1.3, hold = gust >= 45, temp = arr(m.temp, t), vis = arr(m.vis, t);
    const pre = t < 8.5, post = t > 16, closed = pre || post, since = t - 8.5;
    const surfK = pre ? 'untracked' : since < m.powderH ? 'powder' : since < m.powderH + 2 ? 'chopped' : 'packed';
    const sf = { untracked: 1, powder: 1, chopped: 0.82, packed: 0.68 }[surfK];
    const fresh = clamp(0.55 + m.fresh24 / 24, 0.55, 1.05);
    const q = Math.min(5, 5 * sf * (hold ? 0.82 : 1) * (vis < 1 ? 0.75 : vis < 3 ? 0.9 : 1) * fresh);
    const rating = q < 1.8 ? 'poor' : q < 2.8 ? 'fair' : q < 4.4 ? 'good' : 'epic';
    const surface = { untracked: 'Untracked', powder: 'Powder', chopped: 'Chopped powder', packed: 'Packed powder' }[surfK];
    const short = { untracked: 'Fresh', powder: 'Powder', chopped: 'Chopped', packed: 'Packed' }[surfK];
    return { t, wind, gust, hold, temp, vis, pre, post, closed, surfK, surface, short, q, rating, lifts: closed ? 0 : m.lifts - (hold ? m.exposed : 0) };
  },
  windowOf(rows, lo, hi) {
    let mx = -1, im = -1;
    rows.forEach((r, i) => { if (r.t >= lo && r.t <= hi && r.Q > mx) { mx = r.Q; im = i; } });
    if (im < 0 || mx < 1.8) return null;
    for (const fac of [0.955, 0.93, 0.9, 0.86]) {
      const thr = Math.max(1.8, mx * fac); let a = im, b = im;
      while (a > 0 && rows[a - 1].Q >= thr && rows[a - 1].t >= lo) a--;
      while (b < rows.length - 1 && rows[b + 1].Q >= thr && rows[b + 1].t <= hi) b++;
      if (rows[b].t - rows[a].t >= 1.5 || fac === 0.86) return { a: rows[a].t, b: rows[b].t, mx, rating: rows[im].rating };
    }
    return null;
  },
  chainAt(mi, t) { let l = 0; for (const [h, v] of D.mtns[mi].chain) if (t >= h) l = v; return l; },
  traffic(t) { return t < 6 ? 1 : t < 9.5 ? 1.22 : t < 11 ? 1.08 : t < 14 ? 1.04 : t < 17 ? 1.18 : 1.25; },
  drive(bi, mi, dep, up) {
    const R = D.routes[D.breaks[bi].id + '-' + D.mtns[mi].id], M = D.mtns[mi];
    const base = R.h * this.traffic(dep), gradeT = up ? dep + base - 0.6 : dep + 0.3, ch = this.chainAt(mi, gradeT);
    const use = (R.mi * 1.15 + M.base / 1000 * 6) / 330 * (up ? 1 : 0.6), stop = use > 0.8;
    return { h: base + (ch === 1 ? 0.33 : ch === 2 ? 0.58 : 0) + (stop ? 0.45 : 0), ch, gradeT, stop, evArr: Math.round(90 - use * 100), via: R.via, gain: M.base };
  },
  ensure() {
    if (this.G) return;
    this.surfG = D.breaks.map((_, bi) => { const r = []; for (let i = 0; i < 49; i++) r.push(this.surfAt(bi, 5 + i * 0.25)); return r; });
    this.snowG = D.mtns.map((_, mi) => { const r = []; for (let i = 0; i < 49; i++) r.push(this.snowAt(mi, 5 + i * 0.25)); return r; });
    this.surfBW = this.surfG.map(rows => this.windowOf(rows, D.light.first, 17));
    this.snowBW = this.snowG.map(rows => this.windowOf(rows.map(r => ({ t: r.t, Q: r.closed ? 0 : r.q, rating: r.rating })), 8.5, 16));
    this.pc = {}; this.G = true;
  },
  avg(fn, a, b) { let s = 0, n = 0; for (let t = a; t <= b + 1e-6; t += 0.25) { s += fn(t); n++; } return n ? s / n : 0; },
  plan(bi, mi, order) {
    this.ensure();
    const key = bi + '-' + mi + '-' + order; if (this.pc[key]) return this.pc[key];
    const L = D.light; let p;
    if (order === 'surf') {
      const w = this.surfBW[bi], s0 = Math.max(w ? w.a : L.first, L.first), s1 = Math.min(w ? w.b : s0 + 1.5, s0 + 2);
      const dep = s1 + 0.25, dr = this.drive(bi, mi, dep, true), arv = dep + dr.h, r0 = Math.max(arv + 0.33, 8.5), rideH = Math.max(0, 16 - r0);
      const sS = clamp(this.avg(t => this.surfAt(bi, t).Q, s0, s1) / 4.2 * 100, 0, 100);
      const nS = rideH > 0 ? clamp(this.avg(t => this.snowAt(mi, t).q, r0, 16) / 4 * 100, 0, 100) * clamp(rideH / 3, 0, 1) : 0;
      p = { stages: [{ kind: 'surf', a: s0, b: s1 }, { kind: 'drive', a: dep, b: arv }, { kind: 'snow', a: r0, b: Math.max(r0, 16) }], dr, sS, nS, surfH: s1 - s0, rideH };
    } else {
      const r0 = 8.5, r1 = 12, dep = 12.25, dr = this.drive(bi, mi, dep, false), arv = dep + dr.h;
      const s0 = arv + 0.2, s1 = Math.min(L.last, s0 + 1.75), surfH = Math.max(0, s1 - s0);
      const sS = surfH > 0.4 ? clamp(this.avg(t => this.surfAt(bi, t).Q, s0, s1) / 4.2 * 100, 0, 100) : 0;
      const nS = clamp(this.avg(t => this.snowAt(mi, t).q, r0, r1) / 4 * 100, 0, 100);
      p = { stages: [{ kind: 'snow', a: r0, b: r1 }, { kind: 'drive', a: dep, b: arv }, { kind: 'surf', a: s0, b: Math.max(s0, s1) }], dr, sS, nS, surfH, rideH: r1 - r0 };
    }
    p.tS = clamp(100 - [0, 10, 22][p.dr.ch] - Math.max(0, p.dr.h - 2.75) * 14 - (p.dr.stop ? 6 : 0), 0, 100);
    p.tm = 100 * clamp(Math.min(p.surfH / 1.5, p.rideH / 3), 0, 1);
    p.total = Math.round(0.30 * p.sS + 0.35 * p.nS + 0.20 * p.tS + 0.15 * p.tm);
    p.order = order;
    return (this.pc[key] = p);
  },
  firstAfter(fn, t0) { for (let t = t0; t <= 17; t += 0.25) if (fn(t)) return t; return 17; },
  extremes(bi) {
    this._ex = this._ex || {}; if (this._ex[bi]) return this._ex[bi];
    const out = [], f = t => this.tideAt(t, bi); let prev = f(3.98), cur = f(4);
    for (let t = 4; t <= 19; t += 0.02) { const nx = f(t + 0.02); if ((cur > prev && cur >= nx) || (cur < prev && cur <= nx)) out.push({ t, h: cur, type: cur > prev ? 'H' : 'L' }); prev = cur; cur = nx; }
    return (this._ex[bi] = out);
  },
  // formatting
  fmt(t) { const x = ((t % 24) + 24) % 24; let h = Math.floor(x), m = Math.round((x - h) * 60); if (m === 60) { h = (h + 1) % 24; m = 0; } return (((h + 11) % 12) + 1) + ':' + String(m).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); },
  fmtC(t) { return this.fmt(t).replace(' AM', 'a').replace(' PM', 'p'); },
  range(a, b) { const A = this.fmt(a), B = this.fmt(b); return A.slice(-2) === B.slice(-2) ? A.slice(0, -3) + ' – ' + B : A + ' – ' + B; },
  dur(h) { const m = Math.max(0, Math.round(h * 60)), H = Math.floor(m / 60), M = m % 60; return H ? H + 'h' + (M ? ' ' + M + 'm' : '') : M + 'm'; },
  compass(d) { return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round((((d % 360) + 360) % 360) / 22.5) % 16]; },
  num(x) { return Math.abs(x - Math.round(x)) < 0.01 ? String(Math.round(x)) : x.toFixed(1); },
  num1(x) { return x < 10 ? x.toFixed(1) : String(Math.round(x)); },
  rangeStr(H) {
    let lo, hi;
    if (H < 2) { lo = Math.max(0.5, Math.round(H * 0.82 * 2) / 2); hi = Math.round(H * 1.05 * 2) / 2; if (hi <= lo) hi = lo + 0.5; }
    else { lo = Math.round(H * 0.82); hi = Math.round(H * 1.05); if (hi <= lo) hi = lo + 1; }
    return { lo, hi, str: this.num(lo) + '–' + this.num(hi) };
  },
  body(ft) { let w = 'ankle'; for (const [v, s] of [[0, 'ankle'], [1, 'shin'], [1.5, 'knee'], [2.5, 'thigh'], [3, 'waist'], [3.5, 'stomach'], [4, 'chest'], [4.5, 'shoulder'], [5, 'head'], [6, 'overhead'], [8, 'well overhead']]) if (ft >= v) w = s; return w; },
  sizeWords(lo, hi) { const a = this.body(lo), b = this.body(hi), s = a === b ? a : a + ' to ' + b; return s.charAt(0).toUpperCase() + s.slice(1) + (b.indexOf('overhead') >= 0 ? '' : ' high'); },
  catLabel(c) { return { glassy: 'Glassy', offshore: 'Offshore', 'cross-offshore': 'Cross-offshore', 'cross-shore': 'Cross-shore', 'cross-onshore': 'Cross-onshore', onshore: 'Onshore' }[c]; },
  catShort(c) { return { glassy: 'glassy', offshore: 'off', 'cross-offshore': 'x-off', 'cross-shore': 'cross', 'cross-onshore': 'x-on', onshore: 'on' }[c]; },
  windKey(s) { return s >= 0.85 ? 'good' : s >= 0.5 ? 'fair' : 'poor'; },
  tideKey(s) { return s >= 0.99 ? 'good' : s >= 0.7 ? 'fair' : 'poor'; },
  gustKey(g) { return g >= 45 ? 'poor' : g >= 30 ? 'fair' : 'good'; },
  scoreKey(s) { return s >= 85 ? 'good' : s >= 65 ? 'fair' : 'poor'; },
  feasLabel(s) { return s >= 90 ? 'Optimal' : s >= 80 ? 'Strong' : s >= 65 ? 'Doable' : s >= 45 ? 'Stretch' : 'Not today'; },
  feel(r) { const c = r.wind.cat, k = r.wind.k; if (r.rating === 'flat') return 'flat'; if (c === 'glassy') return 'glassy'; if (c === 'offshore') return k > 15 ? 'clean but windy' : 'clean'; if (c === 'cross-offshore') return 'mostly clean'; if (c === 'cross-shore') return 'textured'; if (c === 'cross-onshore') return k >= 8 ? 'choppy' : 'bumpy'; return k >= 8 ? 'blown out' : 'choppy'; },
  airC(t) { return Math.round(t <= 13 ? 46 + 18 * Math.sin(clamp((t - 6.5) / 6.5, 0, 1) * Math.PI / 2) : 64 - (t - 13) * 1.5); },
  col(k, a, light) { const c = (light ? D.colorsL : D.colors)[k] || D.colors.flat; return 'oklch(' + c[0] + ' ' + c[1] + ' ' + c[2] + ' / ' + (a == null ? 1 : a) + ')'; },
  icon(n) { return iconUrl(n); },
  stamp(t, sec) { const T = Math.round(t * 3600) + 14 + sec, h = Math.floor(T / 3600) % 24, m = Math.floor(T / 60) % 60, s = T % 60; return (((h + 11) % 12) + 1) + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); },
  path(fn, max, x0, w, y0, h, base) {
    let line = '';
    for (let i = 0; i <= 48; i++) { const t = 5 + i * 0.25, x = x0 + (t - 5) / 12 * w, y = y0 + (1 - clamp(fn(t) / max, 0, 1)) * h; line += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
    return { line, area: line + 'L' + (x0 + w).toFixed(1) + ' ' + base + 'L' + x0 + ' ' + base + 'Z' };
  },
};
export default E;
