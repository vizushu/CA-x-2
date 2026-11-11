// Lineup view-model, v3 "Lifeguard board": turns engine output + UI state into screen values.
// The verdict is a solid rating-colored block; everything else is ink on paper (day) or paper on ink (night).
// Palette validated for WCAG AA: every text color is ≥ 4.5:1 on its ground, and each rating block carries a text
// color that is ≥ 4.5:1 on it. The five rating steps are ordered by lightness, not hue, so they read in grey too.
import E from './engine.js';
import Live from './live.js';

export const PAL = {
  day: {
    bg: '#FBFAF7', t1: '#0F171F', t2: '#4A545D', t3: '#636D77', hair: 'rgba(15,23,31,0.12)', fill: 'rgba(15,23,31,0.06)', fill2: 'rgba(15,23,31,0.1)',
    acc: '#00737E', accfg: '#FBFAF7', frost: '#6B8FB3', scrim: 'rgba(15,23,31,0.45)',
    block: { flat: ['#DADEE3', '#0F171F'], poor: ['#F9B191', '#0F171F'], fair: ['#DCA81C', '#0F171F'], good: ['#16AC73', '#0F171F'], epic: ['#006772', '#FBFAF7'] },
    text: { flat: '#636D77', poor: '#B63613', fair: '#8A5700', good: '#007947', epic: '#006772' },
  },
  night: {
    bg: '#0A1016', t1: '#F3F2EE', t2: '#B0B8C1', t3: '#9299A1', hair: 'rgba(243,242,238,0.14)', fill: 'rgba(243,242,238,0.07)', fill2: 'rgba(243,242,238,0.12)',
    acc: '#56D3DA', accfg: '#0A1016', frost: '#9DB8D6', scrim: 'rgba(0,0,0,0.55)',
    block: { flat: ['#292E34', '#F3F2EE'], poor: ['#852A12', '#F3F2EE'], fair: ['#7D5100', '#F3F2EE'], good: ['#007948', '#F3F2EE'], epic: ['#35B9C0', '#0A1016'] },
    text: { flat: '#9299A1', poor: '#F69370', fair: '#F4BF3F', good: '#43DD9A', epic: '#54E2E9' },
  },
};
export const pal = theme => PAL[theme === 'night' ? 'night' : 'day'];

const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
const lc = s => s.toLowerCase();
const ic = n => E.icon(n);
const feasKey = s => s >= 90 ? 'epic' : s >= 80 ? 'good' : s >= 65 ? 'fair' : s >= 45 ? 'poor' : 'flat';
const srcKey = state => /^(Updated|Refresh|On demand|Live)/.test(state) ? 'good' : /^Cached/.test(state) ? 'fair' : /^(Unavailable|Failed)/.test(state) ? 'poor' : 'flat';

/** Source status rows for the settings sheet, the desktop side panel and the loading state (dot colors follow the theme). */
export function srcRows(theme) { const P = pal(theme); return Live.sources().map(r => ({ label: r.label, state: r.state, dot: P.text[srcKey(r.state)] })); }
export function srcSummary() { const rows = Live.sources(); return rows.filter(r => srcKey(r.state) === 'good').length + ' of ' + rows.length + ' live'; }

export default function viewModel(st, props, ctx) {
  const D = E.D; E.ensure();
  const mode = st.mode, night = st.theme === 'night', P = pal(night ? 'night' : 'day');
  const blk = k => P.block[k] || P.block.flat, txt = k => P.text[k] || P.text.flat, tint = (k, a) => hexA(blk(k)[0], a);
  const nowT = E.nowT(), L = D.light, t = st.t, tl = E.fmt(t), isNow = Math.abs(t - nowT) < 0.01;
  const offline = !!props.offline || !!st.offline, gp = props.glove || 'auto', glove = gp === 'on' || (gp === 'auto' && mode === 'snow');
  const bi = Math.max(0, D.breaks.findIndex(b => b.id === st.breakId)), mi = Math.max(0, D.mtns.findIndex(m => m.id === st.mtnId));
  const B = D.breaks[bi], M = D.mtns[mi], upd = E.updated('marine');
  const chip = (text, k) => ({ text, bg: k ? tint(k, night ? 0.3 : 0.22) : P.fill, fg: k ? txt(k) : P.t1 });
  const win = (w, caption, detail, status, cta, at) => ({
    caption, range: w ? E.range(w.a, w.b) : 'Nothing worth it today', detail, status, cta, showCta: !!cta, ctaLabel: cta ? cta + ' the forecast to ' + E.fmt(at) : '',
    bg: tint(w ? w.rating : 'flat', night ? 0.28 : 0.2), fg: txt(w ? w.rating : 'flat'), onClick: () => { if (cta) ctx.jump(at); },
  });
  const timeCtx = () => isNow ? 'Live now · ' + tl : E.dayCap() + ' · ' + tl;

  // ---------- SURF ----------
  const r = E.surfAt(bi, t), p = r.trains[0], darkS = t < L.first - 0.001, rg = E.rangeStr(r.H), sKey = darkS ? 'flat' : r.rating;
  const ex = E.extremes(bi), nx = ex.find(e => e.t > t + 0.01), wK = E.windKey(r.wind.score), tK = E.tideKey(r.tide.score);
  const sw = E.surfBW[bi], onshore = t0 => E.firstAfter(x => E.surfAt(bi, x).wind.score < 0.6, t0);
  let sWin;
  if (!sw) sWin = win(null, 'No clean window today', 'Stay dry and plan the mountain', '', '', nowT);
  else {
    const m = E.surfAt(bi, (sw.a + sw.b) / 2), desc = (m.tide.rising ? 'Rising tide' : 'Dropping tide') + ' · ' + Math.round(m.wind.k) + ' kt ' + lc(E.catLabel(m.wind.cat)) + ' · ' + E.rangeStr(m.H).str + ' ft';
    sWin = nowT <= sw.b ? win(sw, 'Best window ' + E.dayWord(), desc, nowT < sw.a ? 'In ' + E.dur(sw.a - nowT) : 'On now · ' + E.dur(sw.b - nowT) + ' left', 'Jump', sw.a)
      : win(sw, 'Today’s window · closed ' + E.fmt(sw.b), 'Onshore since ~' + E.fmt(onshore(sw.a)) + ' · ' + E.rangeStr(m.H).str + ' ft', '', 'Review', sw.a);
  }
  const ta = B.tide[0], tb = B.tide[1], zone = r.tide.h < ta ? 'Below' : r.tide.h > tb ? 'Above' : 'Inside';
  const wNext = (() => {
    const say = q => Math.round(q.wind.k) + ' kt ' + lc(E.catLabel(q.wind.cat));
    if (r.wind.score >= 0.85) { const x = E.firstAfter(y => E.surfAt(bi, y).wind.score < 0.6, t + 0.25); return x < 17 ? 'Clean until ~' + E.fmt(x) + ', then ' + say(E.surfAt(bi, x)) : 'Stays clean into the evening'; }
    if (r.wind.score < 0.6) return 'No clean-up before dark';
    const x = E.firstAfter(y => E.surfAt(bi, y).wind.score < 0.5, t + 0.25); return x < 17 ? 'Light texture; onshore builds ~' + E.fmt(x) : 'Light texture';
  })();
  const tc = E.path(x => E.tideAt(x, bi), 5.5, 0, 390, 22, 76, 104), XC = x => (x - 5) / 12 * 390, tsy = 22 + (1 - E.clamp(r.tide.h / 5.5, 0, 1)) * 76;
  const wet = B.water >= 72 ? 'Boardshorts' : B.water >= 68 ? 'Springsuit' : B.water >= 62 ? '3/2 full suit' : B.water >= 56 ? '4/3 full suit' : '5/4 hooded';
  const sBoard = h => h < 2 ? '9′2″ log' : h < 3.5 ? '5′10″ fish' : h < 5.5 ? '6′0″ shortboard' : '6′6″ step-up';
  const surf = {
    key: sKey,
    hero: {
      bg: blk(sKey)[0], fg: blk(sKey)[1], word: darkS ? 'Dark' : D.labels[r.rating],
      ctx: darkS ? 'Before first light · ' + tl : timeCtx(),
      num: rg.str, unit: 'ft', tail: '', side: String(Math.round(r.kj)), sideUnit: 'kJ', sideLabel: 'swell energy',
      body: E.sizeWords(rg.lo, rg.hi) + ' · ' + E.feel(r) + (darkS ? ' · first light ' + E.fmt(L.first) : ''),
    },
    stats: [
      { label: 'Swell', value: p.h.toFixed(1) + ' ft @ ' + Math.round(p.T) + ' s', color: P.t1, detail: E.compass(p.d) + ' ' + Math.round(p.d) + '°' + (p.T >= 13 ? ' · groundswell' : '') },
      { label: 'Wind', value: E.catLabel(r.wind.cat), color: txt(wK), detail: Math.round(r.wind.k) + ' kt · gusts ' + Math.round(r.wind.g) + ' ' + E.compass(r.wind.d) },
      { label: 'Tide', value: r.tide.h.toFixed(1) + ' ft', color: txt(tK), detail: (r.tide.rising ? '↑ Rising' : '↓ Dropping') + (nx ? ' · ' + (nx.type === 'H' ? 'high ' : 'low ') + E.fmtC(nx.t) : '') },
    ],
    win: sWin,
    why: {
      lead: darkS ? 'Why it would be' : 'Why it’s', word: D.labels[r.rating], color: txt(r.rating), at: E.dayCap() + ' · ' + tl,
      rows: [
        { label: 'Swell', dot: txt(r.H >= 3 && p.T >= 11 ? 'good' : r.H >= 2 ? 'fair' : 'poor'), head: p.T >= 13 ? 'Long-period ' + E.compass(p.d) + ' groundswell' : 'Mid-period swell', detail: p.h.toFixed(1) + ' ft @ ' + Math.round(p.T) + ' s from ' + Math.round(p.d) + '° — ' + B.note },
        { label: 'Wind', dot: txt(wK), head: r.wind.cat === 'glassy' ? 'Glassy, under 3 kt' : Math.round(r.wind.k) + ' kt ' + lc(E.catLabel(r.wind.cat)) + (r.wind.cat === 'onshore' && r.wind.k >= 8 ? ' — blown out' : ''), detail: wNext + ' · from ' + E.compass(r.wind.d) + ' ' + Math.round(r.wind.d) + '°' },
        { label: 'Tide', dot: txt(tK), head: r.tide.h.toFixed(1) + ' ft and ' + (r.tide.rising ? 'rising' : 'dropping'), detail: zone + ' the ' + E.num(ta) + '–' + E.num(tb) + ' ft sweet spot here' + (nx ? ' · ' + (nx.type === 'H' ? 'high ' : 'low ') + nx.h.toFixed(1) + ' ft at ' + E.fmt(nx.t) : '') },
      ],
    },
    tide: {
      line: tc.line, area: tc.area, sx: XC(t).toFixed(1), sy: tsy.toFixed(1), selX: (XC(t) - 0.75).toFixed(1), darkW: XC(L.first).toFixed(1),
      nowX: XC(nowT).toFixed(1), readout: r.tide.h.toFixed(1) + ' ft ' + (r.tide.rising ? 'rising' : 'dropping') + ' · ' + tl,
      ex: ex.filter(e => e.t >= 5 && e.t <= 17).map(e => { const y = 22 + (1 - E.clamp(e.h / 5.5, 0, 1)) * 76; return { x: E.clamp(XC(e.t) - 32, 0, 326).toFixed(1), y: (e.type === 'H' ? y - 30 : y + 7).toFixed(1), kind: e.type === 'H' ? 'High' : 'Low', h: e.h.toFixed(1) + ' ft', time: E.fmtC(e.t) }; }),
      hours: [5, 8, 11, 14, 17].map(h => ({ x: (XC(h) - 16).toFixed(1), label: (((h + 11) % 12) + 1) + (h < 12 ? 'a' : 'p') })),
    },
    foot: E.surfFootnote(bi, offline) + E.camCredit('break', bi),
  };

  // ---------- SNOW ----------
  const s = E.snowAt(mi, t), sN = E.snowAt(mi, nowT), nKey = s.closed ? 'flat' : s.rating;
  const holdEnd = E.firstAfter(x => E.snowAt(mi, x).gust < 45, t);
  const lvl = (label, elev, temp, wind) => { const g = wind * 1.3, k = E.gustKey(g); return { label, elev: elev.toLocaleString('en-US') + ' ft', temp: Math.round(temp) + '°', rot: (M.dir + 180) % 360, wcol: txt(k), wind: Math.round(wind) + ' mph', gust: 'gusts ~' + Math.round(g) + ' · ' + E.compass(M.dir), chip: g >= 45 ? 'Hold risk' : g >= 30 ? 'Breezy' : 'Calm', chipBg: tint(k, night ? 0.3 : 0.22), chipFg: txt(k) }; };
  const nw = E.snowBW[mi], snBoard = M.fresh24 >= 12 ? 'Powder swallowtail' : M.fresh24 >= 6 ? 'All-mountain twin' : 'Freestyle twin', nWinS = nw ? E.snowAt(mi, nw.a) : null;
  const steps = E.surfaceSteps(mi);
  const snow = {
    key: nKey,
    hero: {
      bg: blk(nKey)[0], fg: blk(nKey)[1],
      word: s.season === 'pre' ? 'Pre-season' : s.pre ? 'Opens 8:30' : s.post ? 'Closed' : D.labels[s.rating],
      ctx: s.season === 'pre' ? 'Model, not a snow report · ' + tl : s.pre ? (isNow ? 'Lifts in ' + E.dur(8.5 - nowT) : 'Before the lifts · ' + tl) : s.post ? 'Lifts closed · ' + tl : timeCtx(),
      num: String(M.fresh24), unit: '″', tail: 'fresh · last 24 h', side: Math.round(s.temp) + '°', sideUnit: 'F', sideLabel: 'summit',
      body: s.season === 'pre' ? E.preseasonText(mi) : s.pre ? 'Last 24 h ' + M.fresh24 + '″ · summit gusts ~' + Math.round(s.gust) + ' mph' : s.post ? 'Lifts usually close at 4:00 PM' : s.surface + (s.hold ? ' · wind-hold risk on the ' + lc(M.hold) + ' until ~' + E.fmt(holdEnd) : ' · low wind-hold risk'),
    },
    stats: [
      { label: '48 h', value: M.fresh48 + '″', color: P.t1, detail: 'snowfall · model' },
      { label: 'Base', value: M.depth + '″', color: P.t1, detail: 'depth · model' },
      { label: 'Summit wind', value: Math.round(s.wind) + ' mph', color: txt(E.gustKey(s.gust)), detail: 'gusts ' + Math.round(s.gust) + ' · ' + E.compass(M.dir) },
    ],
    at: tl, ladder: [lvl('Summit', M.top, s.temp, s.wind), lvl('Mid', Math.round((M.top + M.base) / 20) * 10, s.temp + M.dT / 2, s.wind * 0.62), lvl('Base', M.base, s.temp + M.dT, s.wind * 0.3)],
    lifts: E.liftsText(mi, s),
    stepCols: steps.length, steps: steps.map(([k, label, range]) => ({ label, range, bg: s.surfK === k ? P.fill2 : 'transparent', fg: s.surfK === k ? P.t1 : P.t3, ring: s.surfK === k ? P.t1 : P.hair })),
    win: s.season === 'pre' ? win(null, 'Not open yet', E.nextSnowText(mi), '', '', nowT) : !nw ? win(null, 'No standout window', 'Packed powder all day', '', '', nowT) : nowT <= nw.b
      ? win(nw, 'Best riding ' + E.dayWord(), nWinS.surface + ' before the chop · ' + (nWinS.hold ? 'summit still on hold' : 'summit open'), nowT < nw.a ? 'In ' + E.dur(nw.a - nowT) : 'On now · ' + E.dur(nw.b - nowT) + ' left', 'Jump', nw.a)
      : win(nw, 'Best riding · passed', 'Packed powder until the lifts close at 4:00 PM', '', 'Review', nw.a),
    foot: E.snowFootnote(mi, offline) + E.camCredit('mtn', mi),
  };

  // ---------- CA DOUBLE ----------
  const other = st.order === 'surf' ? 'snow' : 'surf', pl = E.plan(bi, mi, st.order), alt = E.plan(bi, mi, other), fKey = feasKey(pl.total);
  const done = sg => sg.b < nowT;
  const stages = pl.stages.map(sg => {
    const active = sg.b > sg.a && t >= sg.a - 0.001 && t <= sg.b + 0.001, ok = sg.b - sg.a >= 0.4; let o;
    if (sg.kind === 'surf') { const q = E.surfAt(bi, sg.a); o = { kind: 'Coastal window', icon: ic('waves'), nodeBg: P.acc, nodeFg: P.accfg, title: (sg.a < 11 ? 'Dawn patrol · ' : 'Evening session · ') + B.name, sub: ok ? E.range(sg.a, sg.b) + ' · ' + E.dur(sg.b - sg.a) : 'You arrive after last light', chips: ok ? [chip(E.rangeStr(q.H).str + ' ft'), chip(Math.round(q.kj) + ' kJ'), chip(Math.round(q.wind.k) + ' kt ' + lc(E.catLabel(q.wind.cat)), E.windKey(q.wind.score)), chip('Tide ' + q.tide.h.toFixed(1) + ' ft ' + (q.tide.rising ? '↑' : '↓'))] : [] }; }
    else if (sg.kind === 'drive') { const dr = pl.dr; o = { kind: 'Transit', icon: ic('car'), nodeBg: P.fill2, nodeFg: P.t1, title: dr.via, sub: 'Leave ' + E.fmt(sg.a) + ' · arrive ' + E.fmt(sg.b), chips: [chip(E.dur(dr.h) + dr.tag), chip((st.order === 'surf' ? '+' : '−') + dr.gain.toLocaleString('en-US') + ' ft'), chip('R' + dr.ch + ' · ' + M.grade, ['good', 'fair', 'poor'][dr.ch]), chip(dr.stop ? '1 charge stop' : 'EV ' + dr.evArr + '% left')] }; }
    else { const q = E.snowAt(mi, E.clamp(sg.a, 8.5, 16)); o = { kind: 'Alpine window', icon: ic('mountain-snow'), nodeBg: P.frost, nodeFg: '#0F171F', title: 'Ride · ' + M.name, sub: q.season === 'pre' ? 'Pre-season · no snowpack yet' : ok ? E.range(sg.a, sg.b) + ' · ' + E.dur(sg.b - sg.a) : 'Lifts close at 4:00 PM before you get there', chips: q.season === 'pre' ? [chip('Base ' + M.depth + '″', 'poor'), chip('Summit ' + Math.round(q.temp) + '°F')] : ok ? [chip(M.fresh24 + '″ fresh', M.fresh24 >= 4 ? 'good' : null), chip('Summit ' + Math.round(q.temp) + '°F'), chip(Math.round(q.wind) + ' mph', q.hold ? 'poor' : q.gust >= 30 ? 'fair' : null), chip(q.surface)] : [] }; }
    return Object.assign(o, { t0: E.fmtC(sg.a), t1: E.fmtC(sg.b), bg: active ? P.fill : 'transparent', op: done(sg) ? 0.6 : 1, showTag: active || done(sg), tag: done(sg) ? 'Done' : isNow ? 'Now' : 'At ' + E.fmtC(t) });
  });
  const parts = [['Surf', pl.sS, '30%'], ['Snow', pl.nS, '35%'], ['Transit', pl.tS, '20%'], ['Daylight', pl.tm, '15%']].map(([label, v, weight]) => ({ label, score: Math.round(v), pct: Math.round(v), color: blk(E.scoreKey(v))[0], weight }));
  const best = D.mtns.map((m, i) => ({ i, s: E.plan(bi, i, 'surf').total })).sort((a, b) => b.s - a.s)[0];
  let verdict, insight;
  if (E.preseason(mi)) { verdict = 'Not yet. ' + M.name + ' has no snowpack, so there’s no alpine half ' + E.dayWord() + '.'; insight = E.nextSnowText(mi); } else if (pl.total < 50) {
    verdict = 'Not today. ' + E.dur(pl.dr.h) + ' on ' + pl.dr.via.split(' · ').pop() + ' leaves ' + (st.order === 'surf' ? (pl.rideH >= 0.4 ? E.dur(pl.rideH) : 'no time') + ' on the hill.' : 'no light for the surf.');
    insight = best.i !== mi ? 'Try ' + D.mtns[best.i].name + ' from ' + B.name + ': it scores ' + best.s + '.' : 'Pick a closer mountain.';
  } else if (st.order === 'surf') {
    const weak = [['surf', pl.sS], ['snow', pl.nS], ['transit', pl.tS]].sort((a, b) => a[1] - b[1])[0][0];
    verdict = pl.total >= 85 ? 'Surf dawn patrol first, then head up the mountain.' : 'Doable: surf first, but ' + (weak === 'surf' ? 'the surf runs small at ' + B.name : weak === 'snow' ? 'the snow is packed out by the time you get there' : 'R' + pl.dr.ch + ' chains slow the climb on ' + M.grade) + '.';
    insight = 'Offshore holds until ~' + E.fmt(onshore(pl.stages[0].a)) + ' at ' + B.name + ', and ' + M.short + ' spins until 4:00 PM. Snow first scores ' + alt.total + '.';
  } else {
    const q = E.surfAt(bi, pl.stages[2].a);
    verdict = alt.total > pl.total + 4 ? 'Works, but surf first scores ' + alt.total + '. The sea breeze is onshore at ' + B.name + ' by the afternoon.' : 'Ride first chair, then catch the evening session.';
    insight = 'Assumes you wake up in ' + M.area + '. ' + B.name + ' is ' + Math.round(q.wind.k) + ' kt ' + lc(E.catLabel(q.wind.cat)) + ' by ' + E.fmt(pl.stages[2].a) + '.';
  }
  const pS = E.plan(bi, mi, 'surf'), pN = E.plan(bi, mi, 'snow'), surfStage = pl.stages.find(x => x.kind === 'surf'), snowStage = pl.stages.find(x => x.kind === 'snow');
  const seg = on => ({ bg: on ? P.t1 : 'transparent', fg: on ? P.bg : P.t2 });
  const dbl = {
    key: fKey,
    hero: { bg: blk(fKey)[0], fg: blk(fKey)[1], word: E.feasLabel(pl.total), ctx: 'California Double · ' + E.dayWord(), num: String(pl.total), unit: '', tail: '/ 100 feasibility', side: E.dur(pl.dr.h), sideUnit: '', sideLabel: 'drive' + pl.dr.tag, body: verdict },
    order: { surfScore: pS.total, snowScore: pN.total, setSurf: () => ctx.setOrder('surf'), setSnow: () => ctx.setOrder('snow'), surfBg: seg(st.order === 'surf').bg, surfFg: seg(st.order === 'surf').fg, snowBg: seg(st.order === 'snow').bg, snowFg: seg(st.order === 'snow').fg },
    parts, stages, insight, spine: P.hair, foot: E.doubleFootnote(mi, offline) + E.camCredit('break', bi) + E.camCredit('mtn', mi),
  };

  // ---------- WHAT TO BRING ----------
  const tSurf = mode === 'double' ? surfStage.a : t, tSnow = E.clamp(mode === 'double' ? snowStage.a : t, 8.5, 16);
  const rs = E.surfAt(bi, Math.min(tSurf, 17)), ss = E.snowAt(mi, tSnow), dr = mode === 'double' ? pl.dr : E.drive(bi, mi, Math.min(t, 15), true), air = E.airC(tSurf);
  const gSurf = { icon: ic('waves'), title: 'Surf · ' + B.name, rows: [
    { k: 'Board', v: sBoard(rs.H), why: E.rangeStr(rs.H).str + ' ft @ ' + Math.round(rs.trains[0].T) + ' s · ' + Math.round(rs.kj) + ' kJ' },
    { k: 'Wetsuit', v: wet, why: 'Water ' + B.water + '°F · air ' + air + '°F at ' + E.fmt(tSurf) },
    { k: 'Extras', v: air < 52 ? 'Booties · 7′ leash' : '7′ leash', why: air < 52 ? 'Cold cobbles and a long walk out' : 'Standard kit' } ] };
  const gSnow = { icon: ic('snowflake'), title: 'Snow · ' + M.name, rows: [
    { k: 'Board', v: snBoard, why: M.fresh24 + '″ fresh · ' + lc(ss.surface) + ' at ' + E.fmt(tSnow) },
    { k: 'Lens', v: ss.vis < 3 ? 'Low-light lens · VLT 55%' : 'Dark lens · VLT 14%', why: 'Summit vis ' + E.num1(ss.vis) + ' mi at ' + E.fmt(tSnow) },
    { k: 'Layers', v: ss.temp < 15 ? 'Heavy base + puffy' : ss.temp < 26 ? 'Midweight base + shell' : 'Light base + shell', why: 'Summit ' + Math.round(ss.temp) + '°F · ' + Math.round(ss.wind) + ' mph' } ] };
  const gRoad = { icon: ic('car'), title: 'Road · ' + M.grade, rows: [
    { k: 'Chains', v: ['No chains · R0', 'Carry chains · R1', 'Chains or 4WD · R2', 'Chains on all · R3'][dr.chRaw || dr.ch], why: dr.chainWhy || 'Caltrans status unavailable' },
    { k: 'Charge', v: dr.stop ? '1 charge stop · Bishop' : 'Leave at 90%', why: (dr.stop ? '+25 min stop' : '~' + dr.evArr + '% on arrival') + ' · ' + Math.round(dr.miles || 0) + ' mi · estimate' } ] };
  const gear = { sub: mode === 'double' ? 'Packed for the plan' : 'Packed for ' + E.dayWord() + ' ' + tl + ' · re-packs as you scrub',
    groups: mode === 'surf' ? [gSurf] : mode === 'snow' ? [gSnow, gRoad] : st.order === 'surf' ? [gSurf, gRoad, gSnow] : [gSnow, gRoad, gSurf] };

  // ---------- HEADER + COLLAPSED BAR ----------
  const cur = mode === 'surf' ? surf : mode === 'snow' ? snow : dbl;
  const head = {
    name: mode === 'surf' ? B.name : mode === 'snow' ? M.name : B.short + ' → ' + M.short,
    sub: mode === 'surf' ? B.area + ' · faces ' + E.compass(B.facing) + ' ' + B.facing + '°' : mode === 'snow' ? M.area + ' · ' + M.base.toLocaleString('en-US') + '–' + M.top.toLocaleString('en-US') + ' ft' : (st.order === 'surf' ? 'Surf first' : 'Snow first') + ' · ' + E.dayWord(),
    label: mode === 'surf' ? 'Change break' : mode === 'snow' ? 'Change mountain' : 'Change route',
  };
  const bar = { name: head.name, num: cur.hero.num, unit: cur.hero.unit, word: cur.hero.word, wordColor: txt(cur.key), dot: blk(cur.key)[0], time: tl };

  // ---------- CAM ----------
  // Real feeds: embedded players (YouTube, Camstreamer, IPCamLive), HLS, or a photo. A spot with no feed yet shows a short
  // dashed slot that says why (pending access, no public cam) instead of an empty video box.
  const view = mode === 'surf' ? 'beach' : mode === 'snow' ? 'mountain' : 'split', split = view === 'split';
  const rn = E.surfAt(bi, E.clamp(nowT, 5, 17)), wTxt = Math.round(rn.wind.k) + ' kt ' + lc(E.catLabel(rn.wind.cat));
  const paneOf = (kind, i, left, width, title, sub) => { const f = E.camFeed(kind, i); return { f, left, width, title, sub, showTitle: split && !f.isNone && !f.isPending, bg: f.isNone || f.isPending ? 'transparent' : '#121A23' }; };
  const panes = split ? [paneOf('break', bi, '0%', '49.75%', B.short + ' · ' + E.rangeStr(rn.H).str + ' ft', wTxt), paneOf('mtn', mi, '50.25%', '49.75%', M.short + ' · ' + M.fresh24 + '″ fresh', 'Summit ' + Math.round(sN.wind) + ' mph' + (sN.hold ? ' · hold' : ''))]
    : view === 'beach' ? [paneOf('break', bi, '0%', '100%', '', '')] : [paneOf('mtn', mi, '0%', '100%', '', '')];
  const oneKind = view === 'mountain' ? 'mtn' : 'break', oneIdx = view === 'mountain' ? mi : bi;
  const anyOwn = panes.some(x => !x.f.isNone && !x.f.isPending);
  const lk = !split ? E.camLinkFor(oneKind, oneIdx) : null;
  const liveWord = offline && anyOwn ? 'Cached' : E.camLive(view, bi, mi), liveNow = !offline && liveWord === 'Live';
  const overlay = st.connecting && anyOwn ? 'Connecting to ' + lc(st.connecting) + '…' : offline && anyOwn ? 'No signal · last frame ' + upd : '';
  const cam = {
    panes, split, tag: liveWord, stamp: anyOwn ? (offline ? upd : E.clockSec()) : '', liveNow, dim: offline && anyOwn ? 0.45 : 0, filter: offline && anyOwn ? 'grayscale(1)' : 'none',
    // Empty slot: short, light and dashed. Connected: the full dark panel.
    h: anyOwn ? 219 : 112, slotBg: anyOwn ? '#0F171F' : P.fill, slotFg: anyOwn ? '#F3F2EE' : P.t2, slotRing: anyOwn ? 'transparent' : P.hair, slotDash: anyOwn ? 'none' : 'dashed',
    chipBg: anyOwn ? 'rgba(10,16,22,0.72)' : 'transparent', chipFg: anyOwn ? '#F3F2EE' : P.t3, noteFg: anyOwn ? '#B0B8C1' : P.t3, dotColor: liveNow ? '#43DD9A' : anyOwn ? '#B0B8C1' : P.t3,
    caption: !anyOwn ? '' : offline ? 'Offline · cached ' + upd : split ? E.camLabel('break', bi) + ' · ' + E.camLabel('mtn', mi) : E.camLabel(oneKind, oneIdx),
    showLink: !!lk, link: lk ? lk.url : '#', linkLabel: lk ? lk.label : '',
    water: view === 'beach' && anyOwn ? B.water + '°F' : '',
    showOverlay: !!overlay, overlay,
  };

  // ---------- DOCK: SCRUBBER + TABS ----------
  const dk = { body: glove ? 68 : 56, knob: glove ? 34 : 26, tabs: glove ? 60 : 50, glove };
  dk.hours = Math.round(dk.knob / 2) + 16; dk.tabsR = dk.tabs / 2; dk.tabsR2 = dk.tabs / 2 - 3;
  dk.h = 8 + 28 + 4 + dk.body + dk.hours + 8 + dk.tabs + 42; dk.padB = dk.h + 20;
  const V = dk.body, X = x => 10 + (x - 5) / 12 * 370, barMax = V - 8, stAt = h => pl.stages.find(g => g.b > g.a && h >= g.a - 0.001 && h <= g.b + 0.001);
  const cols = [];
  for (let h = 5; h <= 17; h++) {
    const i = (h - 5) * 4; let bh = 3, c = P.fill2, op = 1;
    if (mode === 'surf') { const q = E.surfG[bi][i], dark = h < L.first; bh = E.clamp(q.H / 8 * barMax, 3, barMax); c = blk(q.rating)[0]; op = dark ? 0.45 : 1; }
    else if (mode === 'snow') { const q = E.snowG[mi][i]; if (!q.closed) { bh = E.clamp(q.q / 5 * barMax, 3, barMax); c = blk(q.rating)[0]; } }
    else { const g = stAt(h); if (g && g.kind === 'surf') { const q = E.surfG[bi][i]; bh = E.clamp(q.H / 8 * barMax, 3, barMax); c = blk(q.rating)[0]; } else if (g && g.kind === 'drive') { bh = 8; c = P.t3; op = 0.5; } else if (g) { const q = E.snowG[mi][i]; if (!q.closed) { bh = E.clamp(q.q / 5 * barMax, 3, barMax); c = blk(q.rating)[0]; } } }
    cols.push({ x: (X(h) - 8).toFixed(1), h: bh.toFixed(1), col: c, op });
  }
  const ds = pl.stages.find(g => g.kind === 'drive'), up = st.order === 'surf';
  const elev = x => { const e0 = up ? 0 : M.base, e1 = up ? M.base : 0; return x <= ds.a ? e0 : x >= ds.b ? e1 : E.lerp(e0, e1, (x - ds.a) / (ds.b - ds.a)); };
  const ln = mode === 'surf' ? E.path(x => E.tideAt(x, bi), 5.5, 10, 370, V - 14, 6, V - 8) : mode === 'snow' ? E.path(x => E.snowAt(mi, x).temp, 40, 10, 370, V - 14, 6, V - 8) : E.path(elev, 9000, 10, 370, V - 14, 6, V - 8);
  const band = mode === 'surf' ? sw : mode === 'snow' ? nw : null;
  const sc = {
    cols, line: ln.line, V,
    shL: (mode === 'snow' ? X(8.5) : X(L.first)).toFixed(1), shRx: (mode === 'snow' ? X(16) : 390).toFixed(1), shRw: (mode === 'snow' ? 390 - X(16) : 0).toFixed(1),
    bandDisp: band ? 'block' : 'none', bandX: band ? (X(band.a) - 10).toFixed(1) : 0, bandW: band ? (X(band.b) - X(band.a) + 20).toFixed(1) : 0, bandBg: band ? tint(band.rating, night ? 0.28 : 0.2) : 'transparent',
    track: mode === 'double' ? pl.stages.filter(g => g.b > g.a).map(g => ({ x: X(E.clamp(g.a, 5, 17)).toFixed(1), w: Math.max(0, X(E.clamp(g.b, 5, 17)) - X(E.clamp(g.a, 5, 17))).toFixed(1), bg: g.kind === 'surf' ? P.acc : g.kind === 'drive' ? 'repeating-linear-gradient(90deg, ' + P.t3 + ' 0 4px, transparent 4px 7px)' : P.frost })) : [],
    valNow: t.toFixed(2), nowX: X(E.clamp(nowT, 5, 17)).toFixed(1), phX: X(t).toFixed(1), phTrans: st.dragging ? 'none' : 'left var(--dur, .4s) cubic-bezier(.2,.8,.2,1)', knob: dk.knob, knobTop: V - Math.round(dk.knob / 2), knobScale: st.dragging ? 1.15 : 1,
    hours: [5, 7, 9, 11, 13, 15, 17].map(h => ({ x: (X(h) - 16).toFixed(1), label: (((h + 11) % 12) + 1) + (h < 12 ? 'a' : 'p') })),
  };
  const dock = { time: tl, sub: st.follow ? (isNow ? 'Now' : E.dayCap()) : E.dayCap(), showNow: !st.follow };
  const tabs = { idx: ['surf', 'double', 'snow'].indexOf(mode), items: [['surf', 'Surf', 'waves'], ['double', 'Double', 'route'], ['snow', 'Snow', 'mountain-snow']].map(([id, label, n]) => ({ id, label, icon: ic(n), fg: id === mode ? P.bg : P.t2, on: id === mode, onClick: () => ctx.setMode(id) })) };

  // ---------- PICKER SHEET ----------
  const bRows = D.breaks.map((b, i) => { const q = E.surfAt(i, t), k = t < L.first - 0.001 ? 'flat' : q.rating; return { key: b.id, name: b.name, sub: b.area + ' · ' + E.rangeStr(q.H).str + ' ft · ' + Math.round(q.wind.k) + ' kt ' + lc(E.catLabel(q.wind.cat)), dot: blk(k)[0], word: t < L.first - 0.001 ? 'Dark' : D.labels[q.rating], wordColor: txt(k), on: i === bi, onClick: () => ctx.selectBreak(b.id) }; });
  const mRows = D.mtns.map((m, i) => { const q = E.snowAt(i, t), k = q.closed ? 'flat' : q.rating, pv = mode === 'double' ? E.plan(bi, i, st.order).total : null; return { key: m.id, name: m.name, sub: m.area + ' · ' + m.fresh24 + '″ fresh · ' + lc(q.surface) + (mode === 'double' ? ' · ' + E.dur(E.plan(bi, i, st.order).dr.h) + ' drive' : ''), dot: blk(mode === 'double' ? feasKey(pv) : k)[0], word: mode === 'double' ? pv + ' / 100' : q.season === 'pre' ? 'Pre-season' : q.closed ? (q.pre ? 'Opens 8:30' : 'Closed') : D.labels[q.rating], wordColor: txt(mode === 'double' ? feasKey(pv) : k), on: i === mi, onClick: () => ctx.selectMtn(m.id) }; });
  const picker = { title: mode === 'surf' ? 'Breaks' : mode === 'snow' ? 'Mountains' : 'Route', sub: mode === 'double' ? 'Pick the beach and the mountain' : 'Conditions at ' + tl,
    groups: mode === 'surf' ? [{ title: 'Break', rows: bRows }] : mode === 'snow' ? [{ title: 'Mountain', rows: mRows }] : [{ title: 'Beach', rows: bRows }, { title: 'Mountain · feasibility ' + (st.order === 'surf' ? 'surf first' : 'snow first'), rows: mRows }] };

  return {
    offline, offlineTxt: 'Offline · showing the ' + upd + ' cache. Scrubbing still works.',
    isSurf: mode === 'surf', isSnow: mode === 'snow', isDouble: mode === 'double', isSingle: mode !== 'double',
    head, bar, hero: cur.hero, stats: mode === 'double' ? [] : cur.stats, win: cur.win || surf.win, surf, snow, dbl, gear, foot: cur.foot,
    cam, dk, sc, dock, tabs, picker,
    ic: { chevDown: ic('chevron-down'), chevRight: ic('chevron-right'), settings: ic('settings-2'), ext: ic('external-link'), x: ic('x'), refresh: ic('refresh-cw'), db: ic('database'), cloudOff: ic('cloud-off'), now: ic('rotate-ccw'), check: ic('check'), hand: ic('hand'), thermo: ic('thermometer'), waves: ic('waves'), snow: ic('mountain-snow') },
    theme: P, nowT,
  };
}
