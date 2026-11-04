// Lineup v2 view-model: turns engine output + UI state into template values.
(function () {
  window.LineupView = function (st, props, ctx) {
    const E = window.LineupEngine, D = E.D; E.ensure();
    const mode = st.mode, lightTh = mode === 'snow';
    const ck = D.clocks[props.clock] ? props.clock : 'dawn', C = D.clocks[ck], nowT = C.t, L = D.light;
    const offline = !!props.offline, gp = props.glove || 'auto', glove = gp === 'on' || (gp === 'auto' && mode === 'snow');
    const bi = Math.max(0, D.breaks.findIndex(b => b.id === st.breakId)), mi = Math.max(0, D.mtns.findIndex(m => m.id === st.mtnId));
    const B = D.breaks[bi], M = D.mtns[mi], t = st.t, tl = E.fmt(t), isNow = Math.abs(t - nowT) < 0.01;
    const col = (k, a) => E.col(k, a, lightTh), colD = (k, a) => E.col(k, a, false), ic = n => E.icon(n);
    const T1 = 'var(--t1, #EEF4F6)', T2 = 'var(--t2, #A5B3BD)', T3 = 'var(--t3, #778692)', FILL = 'var(--fill, rgba(238,244,246,0.05))', CHIP = 'var(--chip, rgba(238,244,246,0.12))';
    const upd = E.fmt(nowT - 0.15), lc = s => s.toLowerCase();
    const chip = (text, k) => ({ text, bg: k ? col(k, 0.16) : FILL, fg: k ? col(k) : T1 });
    const win = (w, caption, detail, status, cta, at) => ({ caption, range: w ? E.range(w.a, w.b) : 'Nothing worth it today', detail, status, cta, showCta: !!cta, bg: col(w ? w.rating : 'flat', 0.13), fg: col(w ? w.rating : 'flat'), onClick: () => { if (cta) ctx.jump(at); } });

    // ---------- SURF ----------
    const r = E.surfAt(bi, t), p = r.trains[0], darkS = t < L.first - 0.001, rg = E.rangeStr(r.H), pkS = darkS ? 'flat' : r.rating;
    const ex = E.extremes(bi), nx = ex.find(e => e.t > t + 0.01), wK = E.windKey(r.wind.score), tK = E.tideKey(r.tide.score);
    const spk = E.path(x => E.tideAt(x, bi), 5.5, 4, 48, 8, 28, 44), sdot = { x: 4 + (t - 5) / 12 * 48, y: 8 + (1 - E.clamp(r.tide.h / 5.5, 0, 1)) * 28 };
    const sw = E.surfBW[bi], onshore = t0 => E.firstAfter(x => E.surfAt(bi, x).wind.score < 0.6, t0);
    let sWin;
    if (!sw) sWin = win(null, 'No clean window today', 'Stay dry and plan the mountain', '', '', nowT);
    else {
      const m = E.surfAt(bi, (sw.a + sw.b) / 2), desc = (m.tide.rising ? 'Rising tide' : 'Dropping tide') + ' · ' + Math.round(m.wind.k) + ' kt ' + lc(E.catLabel(m.wind.cat)) + ' · ' + E.rangeStr(m.H).str + ' ft';
      sWin = nowT <= sw.b ? win(sw, 'Best window today', desc, nowT < sw.a ? 'In ' + E.dur(sw.a - nowT) : 'On now · ' + E.dur(sw.b - nowT) + ' left', 'Jump', sw.a)
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
    const wet = B.water >= 62 ? '3/2 full suit' : B.water >= 56 ? '4/3 full suit' : '5/4 hooded';
    const sBoard = h => h < 2 ? '9′2″ log' : h < 3.5 ? '5′10″ fish' : h < 5.5 ? '6′0″ shortboard' : '6′6″ step-up';
    const S = {
      eyebrow: darkS ? 'Before first light · ' + tl : isNow ? 'Live now · ' + tl : 'Forecast · today ' + tl,
      name: B.name, area: B.area + ' · faces ' + E.compass(B.facing) + ' ' + B.facing + '°',
      pill: darkS ? 'Dark' : D.labels[r.rating], pillBg: col(pkS, 0.16), pillFg: col(pkS), range: rg.str, kj: Math.round(r.kj),
      words: E.sizeWords(rg.lo, rg.hi) + ' · ' + E.feel(r) + (darkS ? ' · first light ' + E.fmt(L.first) : ''),
      windRot: E.norm(r.wind.d + 180 - B.facing).toFixed(0), windColor: col(wK), windCat: E.catLabel(r.wind.cat),
      windDetail: Math.round(r.wind.k) + ' kt · gusts ' + Math.round(r.wind.g) + ' · ' + E.compass(r.wind.d),
      tideH: r.tide.h.toFixed(1) + ' ft', tideTrend: r.tide.rising ? 'Rising' : 'Dropping', tideCol: col(tK),
      tideDetail: nx ? (nx.type === 'H' ? 'High ' : 'Low ') + nx.h.toFixed(1) + ' · ' + E.fmt(nx.t) : '',
      sLine: spk.line, sArea: spk.area, sdx: sdot.x.toFixed(1), sdy: sdot.y.toFixed(1), win: sWin,
      teaser: sBoard(r.H) + ' · ' + wet + (E.airC(t) < 52 ? ' · booties' : ''),
      why: {
        lead: darkS ? 'Why it would be' : 'Why it’s', word: D.labels[r.rating], color: col(r.rating), at: 'Today · ' + tl,
        rows: [
          { label: 'Swell', dot: col(r.H >= 3 && p.T >= 11 ? 'good' : r.H >= 2 ? 'fair' : 'poor'), head: p.T >= 13 ? 'Long-period ' + E.compass(p.d) + ' groundswell' : 'Mid-period swell', detail: p.h.toFixed(1) + ' ft @ ' + Math.round(p.T) + ' s from ' + Math.round(p.d) + '° — ' + B.note },
          { label: 'Wind', dot: col(wK), head: r.wind.cat === 'glassy' ? 'Glassy, under 3 kt' : Math.round(r.wind.k) + ' kt ' + lc(E.catLabel(r.wind.cat)) + (r.wind.cat === 'onshore' && r.wind.k >= 8 ? ' — blown out' : ''), detail: wNext + ' · from ' + E.compass(r.wind.d) + ' ' + Math.round(r.wind.d) + '°' },
          { label: 'Tide', dot: col(tK), head: r.tide.h.toFixed(1) + ' ft and ' + (r.tide.rising ? 'rising' : 'dropping'), detail: zone + ' the ' + E.num(ta) + '–' + E.num(tb) + ' ft sweet spot here' + (nx ? ' · ' + (nx.type === 'H' ? 'high ' : 'low ') + nx.h.toFixed(1) + ' ft at ' + E.fmt(nx.t) : '') },
        ],
      },
      tide: {
        line: tc.line, area: tc.area, sx: XC(t).toFixed(1), sy: tsy.toFixed(1), selX: (XC(t) - 0.75).toFixed(1), darkW: XC(L.first).toFixed(1),
        nowX: XC(nowT).toFixed(1), readout: r.tide.h.toFixed(1) + ' ft ' + (r.tide.rising ? 'rising' : 'dropping') + ' · ' + tl,
        ex: ex.filter(e => e.t >= 5 && e.t <= 17).map(e => { const y = 22 + (1 - E.clamp(e.h / 5.5, 0, 1)) * 76; return { x: E.clamp(XC(e.t) - 32, 0, 326).toFixed(1), y: (e.type === 'H' ? y - 30 : y + 7).toFixed(1), kind: e.type === 'H' ? 'High' : 'Low', h: e.h.toFixed(1) + ' ft', time: E.fmtC(e.t) }; }),
        hours: [5, 8, 11, 14, 17].map(h => ({ x: (XC(h) - 16).toFixed(1), label: (((h + 11) % 12) + 1) + (h < 12 ? 'a' : 'p') })),
      },
      footnote: offline ? 'Offline · forecast from ' + upd + ', saved on this device' : 'Updated ' + upd + ' · cached on this device for offline use',
    };

    // ---------- SNOW ----------
    const s = E.snowAt(mi, t), sN = E.snowAt(mi, nowT), pkN = s.closed ? 'flat' : s.rating;
    const holdEnd = E.firstAfter(x => E.snowAt(mi, x).gust < 45, t);
    const lvl = (label, elev, temp, wind) => { const g = wind * 1.3, k = s.closed ? 'flat' : g >= 45 ? 'poor' : 'good'; return { label, elev: elev.toLocaleString('en-US') + ' ft', temp: Math.round(temp) + '°', rot: (M.dir + 180) % 360, wcol: col(E.gustKey(g)), wind: Math.round(wind) + ' mph', gust: 'gusts ' + Math.round(g) + ' · ' + E.compass(M.dir), chip: s.closed ? 'Closed' : g >= 45 ? 'Wind hold' : 'Open', chipBg: col(k, 0.14), chipFg: col(k) }; };
    const p1 = 8.5 + M.powderH, p2 = p1 + 2, nw = E.snowBW[mi];
    const snBoard = M.fresh24 >= 12 ? 'Powder swallowtail' : M.fresh24 >= 6 ? 'All-mountain twin' : 'Freestyle twin';
    const nWinS = nw ? E.snowAt(mi, nw.a) : null;
    const sn = {
      eyebrow: s.pre ? (isNow ? 'Lifts open 8:30 AM · in ' + E.dur(8.5 - nowT) : 'Before the lifts · ' + tl) : s.post ? 'Lifts closed · ' + tl : (isNow ? 'Live now · ' + tl : 'Forecast · today ' + tl),
      name: M.name, area: M.area + ' · ' + M.base.toLocaleString('en-US') + '–' + M.top.toLocaleString('en-US') + ' ft',
      pill: s.pre ? 'Opens 8:30' : s.post ? 'Closed' : D.labels[s.rating], pillBg: col(pkN, 0.16), pillFg: col(pkN),
      fresh: M.fresh24, fresh48: M.fresh48 + '″', depth: M.depth + '″',
      words: s.pre ? 'Overnight ' + M.fresh24 + '″ · summit gusts ' + Math.round(s.gust) + ' mph' : s.post ? 'Lifts closed at 4:00 PM' : s.surface + (s.hold ? ' · ' + lc(M.hold) + ' on wind hold until ~' + E.fmt(holdEnd) : ' · all lifts spinning'),
      at: s.closed ? tl : tl, ladder: [lvl('Summit', M.top, s.temp, s.wind), lvl('Mid', Math.round((M.top + M.base) / 20) * 10, s.temp + M.dT / 2, s.wind * 0.62), lvl('Base', M.base, s.temp + M.dT, s.wind * 0.3)],
      lifts: s.closed ? (s.pre ? 'Lifts open 8:30 AM · ' + M.lifts + ' scheduled' : 'Lifts closed for the day') : 'Lifts ' + s.lifts + ' of ' + M.lifts + ' spinning' + (s.hold ? ' · ' + lc(M.hold) + ' on hold' : '') + ' · summit vis ' + E.num1(s.vis) + ' mi',
      steps: [['powder', 'Powder', E.fmtC(8.5) + '–' + E.fmtC(p1)], ['chopped', 'Chopped', E.fmtC(p1) + '–' + E.fmtC(p2)], ['packed', 'Packed powder', 'from ' + E.fmtC(p2)]].map(([k, label, range]) => ({ label, range, bg: s.surfK === k ? CHIP : 'transparent', fg: s.surfK === k ? T1 : T3 })),
      win: !nw ? win(null, 'No standout window', 'Packed powder all day', '', '', nowT) : nowT <= nw.b
        ? win(nw, 'Best riding today', nWinS.surface + ' before the chop · ' + (nWinS.hold ? 'summit still on hold' : 'summit open'), nowT < nw.a ? 'In ' + E.dur(nw.a - nowT) : 'On now · ' + E.dur(nw.b - nowT) + ' left', 'Jump', nw.a)
        : win(nw, 'Best riding · passed', 'Packed powder until the lifts close at 4:00 PM', '', 'Review', nw.a),
      teaser: snBoard + ' · ' + (s.vis < 3 ? 'low-light lens' : 'dark lens') + ' · R' + E.chainAt(mi, t) + ' on ' + M.grade.split(' / ')[0],
      footnote: offline ? 'Offline · lift status from ' + upd + ', saved on this device' : 'Lift status ' + upd + ' · readable with no signal',
    };

    // ---------- CA DOUBLE ----------
    const other = st.order === 'surf' ? 'snow' : 'surf', pl = E.plan(bi, mi, st.order), alt = E.plan(bi, mi, other), fk = E.scoreKey(pl.total);
    const done = sg => ck === 'midday' && sg.b < nowT;
    const stages = pl.stages.map(sg => {
      const active = sg.b > sg.a && t >= sg.a - 0.001 && t <= sg.b + 0.001, ok = sg.b - sg.a >= 0.4; let o;
      if (sg.kind === 'surf') { const q = E.surfAt(bi, sg.a); o = { kind: 'Coastal window', icon: ic('waves'), nodeBg: 'oklch(0.8 0.1 190)', nodeFg: '#06161B', title: (sg.a < 11 ? 'Dawn patrol · ' : 'Evening session · ') + B.name, sub: ok ? E.range(sg.a, sg.b) + ' · ' + E.dur(sg.b - sg.a) : 'You arrive after last light', chips: ok ? [chip(E.rangeStr(q.H).str + ' ft'), chip(Math.round(q.kj) + ' kJ'), chip(Math.round(q.wind.k) + ' kt ' + lc(E.catLabel(q.wind.cat)), E.windKey(q.wind.score)), chip('Tide ' + q.tide.h.toFixed(1) + ' ft ' + (q.tide.rising ? '↑' : '↓'))] : [] }; }
      else if (sg.kind === 'drive') { const dr = pl.dr; o = { kind: 'Transit bridge', icon: ic('car'), nodeBg: 'rgba(238,244,246,0.18)', nodeFg: T1, title: dr.via, sub: 'Leave ' + E.fmt(sg.a) + ' · arrive ' + E.fmt(sg.b), chips: [chip(E.dur(dr.h)), chip((st.order === 'surf' ? '+' : '−') + dr.gain.toLocaleString('en-US') + ' ft'), chip('R' + dr.ch + ' · ' + M.grade, ['good', 'fair', 'poor'][dr.ch]), chip(dr.stop ? '1 charge stop' : 'EV ' + dr.evArr + '% left')] }; }
      else { const q = E.snowAt(mi, E.clamp(sg.a, 8.5, 16)); o = { kind: 'Alpine window', icon: ic('mountain-snow'), nodeBg: 'oklch(0.93 0.03 240)', nodeFg: '#06161B', title: 'Ride · ' + M.name, sub: ok ? E.range(sg.a, sg.b) + ' · ' + E.dur(sg.b - sg.a) : 'Lifts close at 4:00 PM before you get there', chips: ok ? [chip(M.fresh24 + '″ fresh', 'good'), chip('Summit ' + Math.round(q.temp) + '°F'), chip(Math.round(q.wind) + ' mph', q.hold ? 'poor' : q.gust >= 30 ? 'fair' : null), chip(q.surface)] : [] }; }
      return Object.assign(o, { t0: E.fmtC(sg.a), t1: E.fmtC(sg.b), bg: active ? CHIP : 'transparent', op: done(sg) ? 0.55 : 1, showTag: active || done(sg), tag: done(sg) ? 'Done' : isNow ? 'Now' : 'At ' + E.fmtC(t) });
    });
    const parts = [['Surf', pl.sS, '30%'], ['Snow', pl.nS, '35%'], ['Transit', pl.tS, '20%'], ['Daylight', pl.tm, '15%']].map(([label, v, weight]) => ({ label, score: Math.round(v), pct: Math.round(v), color: col(E.scoreKey(v)), weight }));
    const best = D.mtns.map((m, i) => ({ i, s: E.plan(bi, i, 'surf').total })).sort((a, b) => b.s - a.s)[0];
    let verdict, insight;
    if (pl.total < 50) {
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
    const dbl = {
      route: B.name + ' → ' + M.name, score: pl.total, dash: (263.9 * (1 - pl.total / 100)).toFixed(1), label: E.feasLabel(pl.total), labelBg: col(fk, 0.16), labelFg: col(fk), verdict, insight,
      surfScore: pS.total, snowScore: pN.total, oSurfBg: st.order === 'surf' ? CHIP : 'transparent', oSurfFg: st.order === 'surf' ? T1 : T2, oSnowBg: st.order === 'snow' ? CHIP : 'transparent', oSnowFg: st.order === 'snow' ? T1 : T2,
      spine: st.order === 'surf' ? 'linear-gradient(180deg, oklch(0.8 0.1 190), oklch(0.93 0.03 240))' : 'linear-gradient(180deg, oklch(0.93 0.03 240), oklch(0.8 0.1 190))',
      stages, parts, teaser: sBoard(E.surfAt(bi, surfStage.a).H) + ' · ' + wet + ' · ' + lc(snBoard) + ' · R' + pl.dr.ch + ' chains',
      footnote: offline ? 'Offline · plan built from the ' + upd + ' cache' : 'Chain status ' + upd + ' · cached for the no-signal canyon on ' + M.grade.split(' / ')[0],
    };

    // ---------- LOADOUT DRAWER ----------
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
      { k: 'Chains', v: ['No chains · R0', 'Carry chains · R1', 'Chains or 4WD · R2'][dr.ch], why: M.grade + ' at ~' + E.fmt(dr.gradeT) },
      { k: 'Charge', v: dr.stop ? '1 charge stop · Bishop' : 'Leave at 90%', why: dr.stop ? '+25 min on US-395' : 'Arrive with ' + dr.evArr + '% after the climb' } ] };
    const drawer = { when: mode === 'double' ? 'From the plan' : 'Today · ' + tl, sub: mode === 'double' ? 'Re-packs when you change the plan' : 'Re-packs as you scrub',
      groups: mode === 'surf' ? [gSurf] : mode === 'snow' ? [gSnow, gRoad] : st.order === 'surf' ? [gSurf, gRoad, gSnow] : [gSnow, gRoad, gSurf] };

    // ---------- DOCK ----------
    const dk = { strip: glove ? 58 : 52, viz: glove ? 92 : 80, pills: glove ? 56 : 48, modes: glove ? 64 : 56, val: glove ? 17 : 15, modeFs: glove ? 15 : 14, glove };
    dk.base = 24 + dk.strip + dk.viz + 12 + dk.pills + 6 + dk.modes + 12; dk.exp = 932 - 8 - 126 - dk.base; dk.padB = dk.base + 24; dk.modesR = dk.modes / 2; dk.modesR2 = dk.modes / 2 - 4;
    const dNow = E.drive(bi, mi, t, st.order === 'surf');
    const cells = mode === 'surf' ? [['Surf', rg.str + ' ft', col(pkS)], ['Energy', Math.round(r.kj) + ' kJ'], ['Tide', r.tide.h.toFixed(1) + ' ft'], ['Wind', Math.round(r.wind.k) + ' kt ' + E.catShort(r.wind.cat), col(wK)]]
      : mode === 'snow' ? [['Summit', Math.round(s.wind) + ' mph', col(E.gustKey(s.gust))], ['Temp', Math.round(s.temp) + '°F'], ['Surface', s.short], ['Lifts', s.lifts + '/' + M.lifts, s.hold && !s.closed ? col('fair') : null]]
      : [['Energy', Math.round(r.kj) + ' kJ'], ['Tide', r.tide.h.toFixed(1) + ' ft'], ['Drive', E.dur(dNow.h).replace(' ', ''), col(['good', 'fair', 'poor'][dNow.ch])], ['Summit', Math.round(s.wind) + ' mph', col(E.gustKey(s.gust))], ['Surface', s.short]];
    const strip = { time: tl, sub: isNow ? 'Now' : '↺ Now', subFg: isNow ? T3 : 'var(--acc, oklch(0.82 0.1 190))', timeBg: isNow ? 'transparent' : FILL, cols: (cells.length > 4 ? '66px' : '74px') + ' repeat(' + cells.length + ', minmax(0,1fr))', val: cells.length > 4 ? (glove ? 15 : 13.5) : dk.val, pad: cells.length > 4 ? '0 2px' : '0 6px', cells: cells.map(([label, value, c]) => ({ label, value, color: c || T1 })) };

    const V = dk.viz, X = x => 10 + (x - 5) / 12 * 370, barMax = V - 44, stAt = h => pl.stages.find(g => g.b > g.a && h >= g.a - 0.001 && h <= g.b + 0.001);
    const cols = [];
    for (let h = 5; h <= 17; h++) {
      const i = (h - 5) * 4; let rot = 0, wcol = 'transparent', aop = 0, bh = 3, secH = 0, c = col('flat', 0.35);
      if (mode === 'surf') { const q = E.surfG[bi][i], dk2 = h < L.first; rot = E.norm(q.wind.d + 180 - B.facing); wcol = col(E.windKey(q.wind.score)); aop = dk2 ? 0.35 : 1; bh = E.clamp(q.H / 8 * barMax, 3, barMax); secH = bh * (1 - (q.kj > 0 ? q.trains[0].kj / q.kj : 1)); c = dk2 ? col('flat', 0.45) : col(q.rating); }
      else if (mode === 'snow') { const q = E.snowG[mi][i]; rot = (M.dir + 180) % 360; wcol = col(E.gustKey(q.gust)); aop = 1; if (!q.closed) { bh = E.clamp(q.q / 5 * barMax, 3, barMax); c = col(q.rating); } }
      else { const g = stAt(h); if (g && g.kind === 'surf') { const q = E.surfG[bi][i]; bh = E.clamp(q.H / 8 * barMax, 3, barMax); c = col(q.rating); } else if (g && g.kind === 'drive') { bh = 10; c = col(['good', 'fair', 'poor'][E.chainAt(mi, h)], 0.85); } else if (g) { const q = E.snowG[mi][i]; if (!q.closed) { bh = E.clamp(q.q / 5 * barMax, 3, barMax); c = col(q.rating); } } }
      cols.push({ x: X(h).toFixed(1), rot: Math.round(rot), wcol, aop, h: bh.toFixed(1), secH: secH.toFixed(1), col: c, label: h % 2 ? (((h + 11) % 12) + 1) + (h < 12 ? 'a' : 'p') : '', lcol: Math.abs(h - t) < 0.7 ? 'rgba(0,0,0,0)' : T3 });
    }
    const ds = pl.stages.find(g => g.kind === 'drive'), up = st.order === 'surf';
    const elev = x => { const e0 = up ? 0 : M.base, e1 = up ? M.base : 0; return x <= ds.a ? e0 : x >= ds.b ? e1 : E.lerp(e0, e1, (x - ds.a) / (ds.b - ds.a)); };
    const ln = mode === 'surf' ? E.path(x => E.tideAt(x, bi), 5.5, 10, 370, V - 24, 12, V - 12) : mode === 'snow' ? E.path(x => E.snowAt(mi, x).temp, 40, 10, 370, V - 24, 12, V - 12) : E.path(elev, 9000, 10, 370, V - 24, 12, V - 12);
    const band = mode === 'surf' ? sw : mode === 'snow' ? nw : null;
    const sc = {
      cols, line: ln.line, area: ln.area, vh: V, shH: V - 12,
      shL: (mode === 'snow' ? X(8.5) : X(L.first)).toFixed(1), shRx: (mode === 'snow' ? X(16) : 390).toFixed(1), shRw: (mode === 'snow' ? 390 - X(16) : 0).toFixed(1),
      bandDisp: band ? 'block' : 'none', bandX: band ? (X(band.a) - 8).toFixed(1) : 0, bandW: band ? (X(band.b) - X(band.a) + 16).toFixed(1) : 0, bandTop: V - 28 - barMax, bandH: barMax + 4, bandBg: band ? col(band.rating, 0.14) : 'transparent', bandFg: band ? col(band.rating, 0.9) : 'transparent',
      track: mode === 'double' ? pl.stages.filter(g => g.b > g.a).map(g => ({ x: X(E.clamp(g.a, 5, 17)).toFixed(1), w: Math.max(0, X(E.clamp(g.b, 5, 17)) - X(E.clamp(g.a, 5, 17))).toFixed(1), bg: g.kind === 'surf' ? 'oklch(0.8 0.1 190)' : g.kind === 'drive' ? 'repeating-linear-gradient(90deg, rgba(238,244,246,0.55) 0 4px, rgba(238,244,246,0.15) 4px 7px)' : 'oklch(0.93 0.03 240)' })) : [],
      nowX: X(E.clamp(nowT, 5, 17)).toFixed(1), nowH: V - 30, phX: X(t).toFixed(1), phTrans: st.dragging ? 'none' : 'left .45s cubic-bezier(.2,.8,.2,1)', phH: V - 14, knobTop: V - 16, knob: st.dragging ? 1.3 : 1,
    };

    // ---------- PILLS + MODES ----------
    const pill = o => Object.assign({ hasIcon: false, icon: '', hasDot: false, dot: 'transparent', hasScore: false, score: '', scoreFg: T1, fw: 500, bg: 'transparent', fg: T2, dir: 'row', gap: 6, fs: 14 }, o);
    const items = mode === 'surf' ? D.breaks.map((b, i) => { const q = E.surfAt(i, t), on = i === bi; return pill({ label: b.short, hasDot: true, dot: col(q.rating), bg: on ? CHIP : 'transparent', fg: on ? T1 : T2, fw: on ? 650 : 500, onClick: () => ctx.selectBreak(b.id) }); })
      : mode === 'snow' ? D.mtns.map((m, i) => { const q = E.snowAt(i, t), on = i === mi; return pill({ label: m.short, hasDot: true, dot: col(q.closed ? 'flat' : q.rating), bg: on ? CHIP : 'transparent', fg: on ? T1 : T2, fw: on ? 650 : 500, onClick: () => ctx.selectMtn(m.id) }); })
      : [pill({ label: B.short, hasIcon: true, icon: ic('repeat'), bg: FILL, fg: T1, fw: 650, onClick: () => ctx.cycleBreak() })].concat(D.mtns.map((m, i) => { const v = E.plan(bi, i, st.order).total, on = i === mi; return pill({ label: m.short, hasScore: true, score: v, scoreFg: col(E.scoreKey(v)), bg: on ? CHIP : 'transparent', fg: on ? T1 : T2, fw: on ? 650 : 500, dir: 'column', gap: 0, fs: 13, onClick: () => ctx.selectMtn(m.id) }); }));
    const pills = { cols: 'repeat(' + items.length + ', minmax(0,1fr))', items };
    const modes = { idx: ['surf', 'double', 'snow'].indexOf(mode), items: [['surf', 'Surf', 'waves'], ['double', 'CA Double', 'route'], ['snow', 'Snow', 'mountain-snow']].map(([id, label, n]) => ({ label, icon: ic(n), fg: id === mode ? 'var(--accfg, #06161B)' : T2, onClick: () => ctx.setMode(id) })) };

    // ---------- CAM + HUD ----------
    const view = mode === 'surf' ? 'beach' : mode === 'snow' ? 'mountain' : st.camView;
    const rn = E.surfAt(bi, E.clamp(nowT, 5, 17)), wTxt = Math.round(rn.wind.k) + ' kt ' + lc(E.catLabel(rn.wind.cat));
    let setTxt, setSub = 'Sets every ~' + Math.round(B.cycle / 60) + ' min', isSet = false;
    if (offline) { setTxt = 'Set timer paused'; setSub = 'Needs the live stream'; }
    else { const ph = (st.sec + 300 + bi * 97) % B.cycle; if (ph < 64) { isSet = true; setTxt = 'Set · wave ' + (Math.floor(ph / 16) + 1) + ' of 4'; } else { const rem = B.cycle - ph; setTxt = 'Lull ' + Math.floor(rem / 60) + ':' + String(rem % 60).padStart(2, '0'); } }
    const overlay = st.connecting ? 'Connecting to ' + lc(st.connecting) + '…' : offline ? 'No signal · last frame ' + upd : '';
    const cam = { bw: view === 'split' ? 49.75 : view === 'beach' ? 100 : 0, ml: view === 'split' ? 50.25 : view === 'mountain' ? 0 : 100, mw: view === 'split' ? 49.75 : view === 'mountain' ? 100 : 0, halfDisp: view === 'split' ? 'block' : 'none',
      beach: D.breaks.map((b, i) => ({ id: 'dbl-cam-' + b.id, ph: 'Drop a ' + b.name + ' cam still', disp: i === bi ? 'block' : 'none' })),
      mtn: D.mtns.map((m, i) => ({ id: 'dbl-cam-' + m.id, ph: 'Drop a ' + m.name + ' cam still', disp: i === mi ? 'block' : 'none' })) };
    const hud = {
      filter: offline ? 'grayscale(1)' : 'none', dim: offline ? 0.45 : 0, catcherPE: st.docked ? 'auto' : 'none', pipPE: st.docked ? 'none' : 'auto',
      live: offline ? 'Cached' : 'Live', stamp: offline ? 'last frame ' + upd : view === 'split' ? '2 feeds' : E.stamp(nowT, st.sec) + ' · ' + (view === 'mountain' ? M.cam : B.cam),
      showTimer: mode === 'surf', setTxt, setSub, setBg: isSet ? 'rgba(238,243,246,0.94)' : 'rgba(8,12,18,0.5)', setFg: isSet ? '#0A1016' : '#EEF3F6', setSubFg: isSet ? 'rgba(10,16,22,0.7)' : '#A3AEBA',
      showVis: mode === 'snow', visTxt: 'Summit vis ' + E.num1(sN.vis) + ' mi', visSub: sN.vis >= 3 ? 'Clear above the inversion' : 'Clearing ~' + E.fmt(E.firstAfter(x => E.snowAt(mi, x).vis >= 3, nowT)),
      showToggle: mode === 'double', views: [['split', 'Split view', 'columns-2'], ['beach', 'Beach cam', 'waves'], ['mountain', 'Mountain cam', 'mountain-snow']].map(([id, title, n]) => ({ title, icon: ic(n), bg: st.camView === id ? 'rgba(238,243,246,0.92)' : 'transparent', fg: st.camView === id ? '#0A1016' : '#EEF3F6', onClick: () => ctx.setCamView(id) })),
      showOverlay: !!overlay, overlay,
      showSurfDials: view === 'beach', windRot: E.norm(rn.wind.d + 180 - B.facing).toFixed(0), windCol: colD(E.windKey(rn.wind.score)), windTxt: wTxt, swellRot: E.norm(rn.trains[0].d + 180 - B.facing).toFixed(0), swellTxt: Math.round(rn.trains[0].T) + ' s · ' + Math.round(rn.trains[0].d) + '° ' + E.compass(rn.trains[0].d),
      showSnowDials: view === 'mountain', sRot: (M.dir + 180) % 360, sCol: colD(E.gustKey(sN.gust)), sWind: 'Summit ' + Math.round(sN.wind) + ' mph', sSub: 'gusts ' + Math.round(sN.gust) + (sN.hold ? ' · wind hold' : ''), liftTxt: sN.closed ? (sN.pre ? 'Lifts 8:30 AM' : 'Lifts closed') : 'Lifts ' + sN.lifts + '/' + M.lifts, liftSub: sN.hold ? M.hold + ' on hold' : 'All terrain open',
      bTitle: B.short + ' · ' + E.rangeStr(rn.H).str + ' ft', bSub: wTxt, bSubFg: colD(E.windKey(rn.wind.score)),
      mTitle: M.short + ' · ' + M.fresh24 + '″ fresh', mSub: 'Summit ' + Math.round(sN.wind) + ' mph' + (sN.hold ? ' · hold' : ''), mSubFg: colD(E.gustKey(sN.gust)),
    };
    const mk = mode === 'surf' ? rn.rating : mode === 'snow' ? (sN.closed ? 'flat' : sN.rating) : fk;
    const mini = { name: mode === 'surf' ? B.name : mode === 'snow' ? M.name : B.short + ' + ' + M.short,
      summary: mode === 'surf' ? E.rangeStr(rn.H).str + ' ft · ' + wTxt : mode === 'snow' ? M.fresh24 + '″ fresh · ' + lc(sN.surface) : 'Feasibility ' + pl.total + ' · ' + (st.order === 'surf' ? 'surf first' : 'snow first'),
      pill: mode === 'surf' ? D.labels[rn.rating] : mode === 'snow' ? (sN.closed ? (sN.pre ? 'Opens 8:30' : 'Closed') : D.labels[sN.rating]) : E.feasLabel(pl.total), pillBg: colD(mk, 0.18), pillFg: colD(mk) };

    return {
      statusTime: C.label, offline, offlineTxt: 'Offline · showing the ' + upd + ' cache. Scrubbing still works.', glowOp: mode === 'double' ? 1 : 0,
      tv: { surf: { op: mode === 'surf' ? 1 : 0, vis: mode === 'surf' ? 'visible' : 'hidden' }, double: { op: mode === 'double' ? 1 : 0, vis: mode === 'double' ? 'visible' : 'hidden' }, snow: { op: mode === 'snow' ? 1 : 0, vis: mode === 'snow' ? 'visible' : 'hidden' } },
      dk, S, sn, dbl, drawer, strip, sc, pills, modes, cam, hud, mini,
      ic: { cloudOff: ic('cloud-off'), backpack: ic('backpack'), chevUp: ic('chevron-up'), chevDown: ic('chevron-down'), chevRight: ic('chevron-right'), pip: ic('picture-in-picture-2'), hand: ic('hand'), waves: ic('waves'), snow: ic('mountain-snow'), db: ic('database') },
      theme: D.themes[mode], exp: dk.exp, nowT,
    };
  };
})();
