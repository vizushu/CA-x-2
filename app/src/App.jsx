// Lineup app shell (v3 "Lifeguard board"): UI state, the scrubber gesture, layout/theme and data wiring.
// One scrolling column (header · verdict · cam · sections), a dock with the time scrubber and mode tabs, and two bottom sheets.
import React from 'react';
import E from './forecast/engine.js';
import Live from './forecast/live.js';
import viewModel, { pal, srcRows, srcSummary } from './forecast/view.js';
import { SANS, Scroller, Header, OfflineBanner, Hero, Stats, WindowCard, Gear, Footer, CollapsedBar } from './components/ui.jsx';
import SurfView from './components/SurfView.jsx';
import SnowView from './components/SnowView.jsx';
import { DoubleTop, DoublePlan } from './components/DoubleView.jsx';
import CamSlot from './components/Cam.jsx';
import Dock from './components/Dock.jsx';
import { Splash, PickerSheet, SettingsSheet } from './components/Sheets.jsx';
import InstallBanner from './components/InstallBanner.jsx';
import { DeviceFrame, InstallPanel, SourcesPanel } from './components/Presentation.jsx';

const UI_KEY = 'lineup.ui';
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

function loadUI() {
  try {
    const u = JSON.parse(localStorage.getItem(UI_KEY) || '{}');
    if (!u || typeof u !== 'object') return {};
    const out = {};
    if (['surf', 'double', 'snow'].includes(u.mode)) out.mode = u.mode;
    if (E.D.breaks.some(b => b.id === u.breakId)) out.breakId = u.breakId;
    if (E.D.mtns.some(m => m.id === u.mtnId)) out.mtnId = u.mtnId;
    if (['surf', 'snow'].includes(u.order)) out.order = u.order;
    if (['auto', 'day', 'night'].includes(u.uiTheme)) out.uiTheme = u.uiTheme;
    return out;
  } catch (e) { return {}; }
}

export function standalone() {
  try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; }
}

export default class App extends React.Component {
  static defaultProps = { offline: false, glove: 'auto', showBlueprint: true };

  state = Object.assign(
    { mode: 'surf', breakId: 'swamis', mtnId: 'bear', order: 'surf', uiTheme: 'auto' },
    loadUI(),
    { t: 6.5, follow: true, dragging: false, bump: 0, connecting: '', collapsed: false, pickerOpen: false, settingsOpen: false, draft: null, splash: 'in', splashMin: false, sec: 0, vw: window.innerWidth, vh: window.innerHeight, data: 0, offline: false, sysDark: false, swipeDir: 0 },
  );

  rootRef = React.createRef();
  scrollRef = React.createRef();

  saveUI() {
    const s = this.state;
    try { localStorage.setItem(UI_KEY, JSON.stringify({ mode: s.mode, breakId: s.breakId, mtnId: s.mtnId, order: s.order, uiTheme: s.uiTheme })); } catch (e) { /* storage unavailable */ }
  }

  isApp() { return this.state.vw < 600 || standalone() || /[?&]app\b/.test(location.search); }
  theme() { const u = this.state.uiTheme; return u === 'day' || u === 'night' ? u : this.state.sysDark ? 'night' : 'day'; }

  layout(app, showBp) {
    const st = this.state;
    if (app) {
      const s = st.vw / 430, ah = Math.round(st.vh / s);
      return { app: true, s, ah, pw: st.vw, ph: st.vh, bw: 430, bh: ah, bpad: 0, brad: 0, bbg: 'transparent', bsh: 'none', framed: false, pos: 'fixed', top: 0, left: 0, z: 50, o1: 2, o2: 1, rootPad: '0px', topPad: 'calc(env(safe-area-inset-top, 0px) + 10px)', padB: 'calc(8px + env(safe-area-inset-bottom, 0px))' };
    }
    const wide = showBp && st.vw >= 1280, side = st.vw >= 900, s = clamp(side ? (st.vh - 48) / 950 : (st.vw - 24) / 448, 0.5, 1);
    return { s, ah: 932, pw: Math.round(448 * s), ph: Math.round(950 * s), bw: 448, bh: 950, bpad: 9, brad: 57, bbg: '#13181F', bsh: 'inset 0 0 0 1px rgba(243,242,238,0.1), 0 0 0 1px #000000, 0 40px 100px -30px rgba(0,0,0,0.6)', framed: true, pos: wide ? 'sticky' : 'relative', top: 24, left: 'auto', z: 'auto', o1: wide ? 1 : 2, o2: wide ? 2 : 1, rootPad: '40px 32px 72px', topPad: '54px', padB: '42px' };
  }

  refreshNow = () => Live.refresh();

  // ---------- scrubber ----------
  scrubDown = e => {
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* not supported */ }
    this._scrubEl = el; this._scrubbing = true; this._lastT = this.state.t;
    this.setState({ dragging: true, follow: false });
    this.scrubTo(e.clientX);
  };
  scrubMove = e => { if (this._scrubbing) this.scrubTo(e.clientX); };
  scrubUp = () => { if (!this._scrubbing) return; this._scrubbing = false; this.setState({ dragging: false }); };
  scrubTo(x) {
    const r = this._scrubEl.getBoundingClientRect(), k = r.width / 390;
    const f = clamp((x - r.left - 10 * k) / (370 * k), 0, 1), t = 5 + Math.round(f * 48) / 4;
    this.setT(t);
  }
  setT(t) {
    const cur = this._lastT == null ? this.state.t : this._lastT;
    if (Math.abs(t - cur) < 0.001) return;
    const cross = Math.floor(t + 1e-6) !== Math.floor(cur + 1e-6);
    this._lastT = t;
    this.setState(s => ({ t, follow: false, bump: cross ? s.bump + 1 : s.bump }));
    if (cross && navigator.vibrate) { try { navigator.vibrate(6); } catch (_) { /* ignore */ } }
  }
  scrubKey = e => {
    const step = { ArrowLeft: -0.25, ArrowRight: 0.25, ArrowDown: -0.25, ArrowUp: 0.25, PageDown: -1, PageUp: 1 }[e.key];
    if (e.key === 'Home') { e.preventDefault(); this.setT(5); return; }
    if (e.key === 'End') { e.preventDefault(); this.setT(17); return; }
    if (!step) return;
    e.preventDefault();
    this.setT(clamp(Math.round((this.state.t + step) * 4) / 4, 5, 17));
  };

  // ---------- sheets + scrolling ----------
  openPicker = () => this.setState({ pickerOpen: true });
  closePicker = () => this.setState({ pickerOpen: false });
  openSettings = () => this.setState({ settingsOpen: true, draft: this.draftFrom() });
  closeSettings = () => this.setState({ settingsOpen: false, draft: null });
  scrollTop = () => { const el = this.scrollRef.current; if (el) el.scrollTo({ top: 0, behavior: this.reduced ? 'auto' : 'smooth' }); };
  onScroll = e => { const c = e.currentTarget.scrollTop > 170; if (c !== this.state.collapsed) this.setState({ collapsed: c }); };

  // ---------- selection ----------
  connect(label) {
    const conn = this.props.offline || this.state.offline ? '' : label;
    this.setState({ connecting: conn });
    clearTimeout(this._ct);
    if (conn) this._ct = setTimeout(() => this.setState({ connecting: '' }), 900);
  }
  setMode(m) {
    if (m === this.state.mode) return;
    this.setState({ mode: m, collapsed: false, pickerOpen: false, swipeDir: 0 });
    const el = this.scrollRef.current; if (el) el.scrollTo({ top: 0 });
  }
  // In CA Double the picker stays open so both the beach and the mountain can be chosen.
  selectBreak(id, dir = 0) { const i = E.D.breaks.findIndex(b => b.id === id), same = id === this.state.breakId; this.setState(s => ({ breakId: id, swipeDir: dir, pickerOpen: s.pickerOpen && s.mode === 'double' })); if (!same) this.connect(E.camLabel('break', i)); }
  selectMtn(id, dir = 0) { const i = E.D.mtns.findIndex(m => m.id === id), same = id === this.state.mtnId; this.setState(s => ({ mtnId: id, swipeDir: dir, pickerOpen: s.pickerOpen && s.mode === 'double' })); if (!same) this.connect(E.camLabel('mtn', i)); }
  // Swipe left = next location, right = previous (stops at the ends). swipeDir drives the slide-in.
  swipeBreak = d => { const B = E.D.breaks, i = B.findIndex(b => b.id === this.state.breakId), j = i + d; if (j < 0 || j >= B.length) return; this.selectBreak(B[j].id, d); };
  swipeMtn = d => { const M = E.D.mtns, i = M.findIndex(m => m.id === this.state.mtnId), j = i + d; if (j < 0 || j >= M.length) return; this.selectMtn(M[j].id, d); };
  setOrder = o => { if (o !== this.state.order) this.setState({ order: o }); };
  jump(t, follow) { this._lastT = t; this.setState({ t, follow: !!follow }); }
  resetNow = () => this.jump(E.defaultT(), true);

  // ---------- settings sheet values ----------
  draftFrom() {
    const cfg = Live.settings(), D = E.D, b = D.breaks.find(x => x.id === this.state.breakId) || D.breaks[0], m = D.mtns.find(x => x.id === this.state.mtnId) || D.mtns[0], cams = cfg.cams || {};
    const own = id => { const c = cams[id]; return typeof c === 'string' ? c : c && c.url ? c.url : ''; };
    return { prov: cfg.prov, key: cfg.key, beach: own(b.id), mtn: own(m.id) };
  }
  setDraft(p) { this.setState(s => ({ draft: Object.assign({}, s.draft || this.draftFrom(), p) })); }
  settingsVals(P) {
    const D = E.D, b = D.breaks.find(x => x.id === this.state.breakId) || D.breaks[0], m = D.mtns.find(x => x.id === this.state.mtnId) || D.mtns[0], d = this.state.draft || this.draftFrom();
    const seg = on => ({ on, bg: on ? P.t1 : 'transparent', fg: on ? P.bg : P.t2 }), look = this.state.uiTheme;
    return {
      looks: [['auto', 'Auto'], ['day', 'Day'], ['night', 'Night']].map(([id, label]) => Object.assign({ label, onClick: () => this.setState({ uiTheme: id }) }, seg(look === id))),
      provs: [['tomtom', 'TomTom'], ['mapbox', 'Mapbox'], ['none', 'Off']].map(([id, label]) => Object.assign({ label, onClick: () => this.setDraft({ prov: id }) }, seg(d.prov === id))),
      key: d.key || '', keyDis: d.prov === 'none', keyPh: d.prov === 'mapbox' ? 'Mapbox access token' : d.prov === 'tomtom' ? 'TomTom API key' : 'Pick TomTom or Mapbox first',
      trafficLine: Live.trafficLine(), onKey: e => this.setDraft({ key: e.target.value }), saveTraffic: () => Live.setTraffic(d.prov, d.key),
      beach: d.beach, mtn: d.mtn, beachName: b.name, mtnName: m.name,
      onBeach: e => this.setDraft({ beach: e.target.value }), onMtn: e => this.setDraft({ mtn: e.target.value }),
      saveCams: () => { Live.setCam(b.id, d.beach); Live.setCam(m.id, d.mtn); this.setState({ draft: null }); },
    };
  }

  // ---------- data + lifecycle ----------
  onData = () => {
    if (Live.isReady() && !this._first) { this._first = true; this.jump(E.defaultT(), true); }
    this.setState(s => ({ data: s.data + 1 }));
  };
  tick() {
    this.setState(s => ({ sec: s.sec + 1 }));
    if (this.state.follow && !this.state.dragging && Live.isReady() && this.state.sec % 15 === 0) {
      const t = E.defaultT(); if (Math.abs(t - this.state.t) > 0.001) this.setState({ t });
    }
    // First open: if nothing has arrived after 5 s, ask again.
    if (!Live.isReady() && !Live.isSettled() && Date.now() - this._t0 > 5000) { this._t0 = Date.now(); Live.refresh(); }
  }
  /** Writes the theme tokens onto the root element (they cascade to the frame, sheets and side panels) and matches the page chrome. */
  apply() {
    const el = this.rootRef.current, P = this._P; if (!el || !P) return;
    ['bg', 't1', 't2', 't3', 'hair', 'fill', 'fill2', 'acc', 'accfg', 'frost', 'scrim'].forEach(k => el.style.setProperty('--' + k, P[k]));
    el.style.setProperty('--dur', this.reduced ? '0s' : '.35s');
    try {
      document.documentElement.style.background = P.bg; document.body.style.background = P.bg; // any gap (overscroll, home bar) matches the theme
      const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', P.bg);
    } catch (e) { /* ignore */ }
  }
  componentDidMount() {
    // iOS home-screen apps can report a short innerHeight at launch (leaving a strip at the bottom), so in
    // standalone portrait use the full screen height; re-measure after the viewport settles.
    this.onResize = () => {
      let vh = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
      if (standalone() && window.screen && window.screen.height > window.screen.width) vh = Math.max(vh, window.screen.height);
      this.setState({ vw: window.innerWidth, vh });
    };
    if (window.visualViewport) window.visualViewport.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', () => setTimeout(this.onResize, 300));
    this._settleT = setTimeout(this.onResize, 400);
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.onNet = () => this.setState({ offline: navigator.onLine === false });
    this.onNet();
    window.addEventListener('online', this.onNet);
    window.addEventListener('offline', this.onNet);
    try { this.mq = window.matchMedia('(prefers-color-scheme: dark)'); this.onMq = () => this.setState({ sysDark: !!this.mq.matches }); this.onMq(); if (this.mq.addEventListener) this.mq.addEventListener('change', this.onMq); else this.mq.addListener(this.onMq); } catch (e) { /* no matchMedia */ }
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.reduced = !!(mq && mq.matches);
    this._t0 = Date.now();
    this.timer = setInterval(() => this.tick(), 1000);
    this._splashT = setTimeout(() => this.setState({ splashMin: true }), 2400); // 1.4 s fade-in + 1 s hold, then a 0.6 s fade-out (~3 s total)
    Live.init({ onUpdate: this.onData });
    this.apply();
  }
  componentDidUpdate() {
    if (this.state.splash === 'in' && this.state.splashMin && Live.isReady()) { this.setState({ splash: 'out' }); this._splashOut = setTimeout(() => this.setState({ splash: 'gone' }), 650); }
    const s = this.state, ps = this._ps || {};
    if (this._ps && (ps.mode !== s.mode || ps.breakId !== s.breakId || ps.mtnId !== s.mtnId || ps.order !== s.order || ps.uiTheme !== s.uiTheme)) this.saveUI();
    this._ps = { mode: s.mode, breakId: s.breakId, mtnId: s.mtnId, order: s.order, uiTheme: s.uiTheme };
    this.apply();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('online', this.onNet);
    window.removeEventListener('offline', this.onNet);
    try { if (this.mq) { if (this.mq.removeEventListener) this.mq.removeEventListener('change', this.onMq); else this.mq.removeListener(this.onMq); } } catch (e) { /* ignore */ }
    clearInterval(this.timer); clearTimeout(this._ct); clearTimeout(this._splashT); clearTimeout(this._settleT); clearTimeout(this._splashOut);
    Live.stop();
  }

  // ---------- render ----------
  renderApp(lay, theme) {
    const st = this.state;
    if (!Live.isReady()) return <Splash failed={Live.isSettled()} onRetry={this.refreshNow} />;
    const D = E.D, bi = Math.max(0, D.breaks.findIndex(b => b.id === st.breakId)), mi = Math.max(0, D.mtns.findIndex(m => m.id === st.mtnId));
    Live.setCurrent(bi, mi);
    E.allowFetch = !st.dragging;
    const v = viewModel(Object.assign({}, st, { theme }), Object.assign({}, this.props, { appH: lay.ah }), this);
    this._nowT = v.nowT;
    const summary = srcSummary(), sc = v.sc, mode = st.mode, ic = v.ic;
    const swipe = mode === 'surf' ? this.swipeBreak : mode === 'snow' ? this.swipeMtn : undefined;
    const swipeKey = mode === 'surf' ? st.breakId : mode === 'snow' ? st.mtnId : 'double';
    const sheetPad = lay.padB;
    return (
      <>
        <CollapsedBar bar={v.bar} show={st.collapsed} topPad={lay.topPad} onTop={this.scrollTop} />
        <Scroller label={mode === 'surf' ? 'Surf' : mode === 'snow' ? 'Snow' : 'CA Double'} ref={this.scrollRef} topPad={lay.topPad} padB={v.dk.padB} onScroll={this.onScroll} onSwipe={swipe} swipeKey={swipeKey} swipeDir={st.swipeDir}>
          <Header head={v.head} ic={ic} onPicker={this.openPicker} onSettings={this.openSettings} />
          <OfflineBanner show={v.offline} text={v.offlineTxt} icon={ic.cloudOff} />
          <Hero hero={v.hero} />
          {v.isSingle ? <Stats stats={v.stats} /> : <DoubleTop dbl={v.dbl} ic={ic} />}
          <CamSlot cam={v.cam} ic={ic} connecting={st.connecting} />
          {v.isSingle && <WindowCard win={v.win} chevron={ic.chevRight} />}
          {v.isSurf && <SurfView surf={v.surf} />}
          {v.isSnow && <SnowView snow={v.snow} />}
          {v.isDouble && <DoublePlan dbl={v.dbl} />}
          <Gear gear={v.gear} />
          <Footer foot={v.foot} ic={ic} summary={summary} onSettings={this.openSettings} />
        </Scroller>
        <Dock v={v} h={this} bump={st.bump} padB={lay.padB} />
        {lay.app && !standalone() && <InstallBanner ready={st.splash === 'gone'} hidden={st.pickerOpen || st.settingsOpen} bottom={`calc(${v.dk.h - 42}px + ${lay.padB} + 12px)`} />}
        {st.pickerOpen && <PickerSheet picker={v.picker} ic={ic} padB={sheetPad} onClose={this.closePicker} />}
        {st.settingsOpen && <SettingsSheet set={this.settingsVals(v.theme)} rows={srcRows(theme)} ic={ic} padB={sheetPad} onClose={this.closeSettings} onRefresh={this.refreshNow} />}
      </>
    );
  }

  render() {
    const st = this.state, app = this.isApp(), showBp = !app && this.props.showBlueprint !== false, lay = this.layout(app, showBp), theme = this.theme();
    this._scale = lay.s; this._P = pal(theme);
    const appEl = (
      <div style={{ position: 'relative', width: 430, height: lay.ah, overflow: 'hidden', background: 'var(--bg, #FBFAF7)', color: 'var(--t1, #0F171F)', zIndex: 0, isolation: 'isolate', fontFamily: SANS, WebkitUserSelect: 'none', userSelect: 'none', transition: 'background-color var(--dur, .35s), color var(--dur, .35s)' }}>
        {this.renderApp(lay, theme)}
        {Live.isReady() && st.splash !== 'gone' && <Splash leaving={st.splash === 'out'} onSkip={() => this.setState({ splashMin: true })} />}
      </div>
    );
    return (
      <div ref={this.rootRef} style={{ minHeight: '100vh', boxSizing: 'border-box', padding: lay.rootPad, background: 'var(--bg, #FBFAF7)', color: 'var(--t1, #0F171F)', fontFamily: SANS, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 56, transition: 'background-color var(--dur, .35s), color var(--dur, .35s)' }}>
        {showBp && <SourcesPanel order={lay.o1} rows={srcRows(theme)} />}
        <div style={{ order: lay.o2, flex: 'none', position: lay.pos, top: lay.top, left: lay.left, zIndex: lay.z, width: lay.pw, height: lay.ph }}>
          <div style={{ width: lay.bw, height: lay.bh, boxSizing: 'border-box', padding: lay.bpad, borderRadius: lay.brad, background: lay.bbg, boxShadow: lay.bsh, transform: `scale(${lay.s.toFixed(4)})`, transformOrigin: '0 0' }}>
            {lay.framed ? <DeviceFrame width={430} height={lay.ah} time={E.clockLabel()} dark={theme === 'night'}>{appEl}</DeviceFrame> : appEl}
          </div>
        </div>
        {showBp && <InstallPanel />}
      </div>
    );
  }
}
