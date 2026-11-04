// Lineup app shell: UI state, gestures (scrubber, spring-driven drawer, cam docking), layout and data wiring.
import React from 'react';
import E from './forecast/engine.js';
import Live from './forecast/live.js';
import viewModel from './forecast/view.js';
import { SANS, ModeScroller } from './components/ui.jsx';
import SurfView from './components/SurfView.jsx';
import DoubleView from './components/DoubleView.jsx';
import SnowView from './components/SnowView.jsx';
import Cam from './components/Cam.jsx';
import Dock from './components/Dock.jsx';
import { Splash } from './components/Sheets.jsx';
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
    if (['split', 'beach', 'mountain'].includes(u.camView)) out.camView = u.camView;
    return out;
  } catch (e) { return {}; }
}

export function standalone() {
  try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; } catch (e) { return false; }
}

export default class App extends React.Component {
  static defaultProps = { offline: false, glove: 'auto', showBlueprint: true };

  state = Object.assign(
    { mode: 'surf', breakId: 'swamis', mtnId: 'bear', order: 'surf', camView: 'split' },
    loadUI(),
    { t: 6.5, follow: true, dragging: false, bump: 0, connecting: '', docked: false, sheetLevel: 0, splash: 'in', splashMin: false, pinned: false, sec: 0, vw: window.innerWidth, vh: window.innerHeight, data: 0, offline: false, },
  );

  appRef = React.createRef();
  surfRef = React.createRef();
  dblRef = React.createRef();
  snowRef = React.createRef();
  anim = { sheet: { v: 0, vel: 0, to: 0 }, pin: { v: 0, vel: 0, to: 0 } };
  scrollP = 0;
  _exp = 508;
  _ctrl = 216;

  saveUI() {
    const s = this.state;
    try { localStorage.setItem(UI_KEY, JSON.stringify({ mode: s.mode, breakId: s.breakId, mtnId: s.mtnId, order: s.order, camView: s.camView })); } catch (e) { /* storage unavailable */ }
  }

  isApp() { return this.state.vw < 600 || standalone() || /[?&]app\b/.test(location.search); }

  layout(app, showBp) {
    const st = this.state;
    if (app) {
      const s = st.vw / 430, ah = Math.round(st.vh / s);
      return { app: true, s, ah, pw: st.vw, ph: st.vh, bw: 430, bh: ah, bpad: 0, brad: 0, bbg: '#09141A', bsh: 'none', framed: false, pos: 'fixed', top: 0, left: 0, z: 50, o1: 2, o2: 1, rootPad: '0px' };
    }
    const wide = showBp && st.vw >= 1280, side = st.vw >= 900, s = clamp(side ? (st.vh - 48) / 950 : (st.vw - 24) / 448, 0.5, 1);
    return { s, ah: 932, pw: Math.round(448 * s), ph: Math.round(950 * s), bw: 448, bh: 950, bpad: 9, brad: 57, bbg: '#13181F', bsh: 'inset 0 0 0 1px rgba(238,243,246,0.09), 0 0 0 1px #000000, 0 50px 120px -30px rgba(0,0,0,0.95)', framed: true, pos: wide ? 'sticky' : 'relative', top: 24, left: 'auto', z: 'auto', o1: wide ? 1 : 2, o2: wide ? 2 : 1, rootPad: '40px 32px 72px' };
  }

  refreshNow = () => Live.refresh();

  // ---------- gestures ----------
  activeRef() { const m = this.state.mode; return m === 'surf' ? this.surfRef : m === 'snow' ? this.snowRef : this.dblRef; }
  onScroll = e => { const el = e.currentTarget; if (el !== this.activeRef().current) return; this.scrollP = clamp(el.scrollTop / 124, 0, 1); this.apply(); };

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
    const step = { ArrowLeft: -0.25, ArrowRight: 0.25, PageDown: -1, PageUp: 1 }[e.key];
    if (e.key === 'Home') { e.preventDefault(); this.setT(5); return; }
    if (e.key === 'End') { e.preventDefault(); this.setT(17); return; }
    if (!step) return;
    e.preventDefault();
    this.setT(clamp(Math.round((this.state.t + step) * 4) / 4, 5, 17));
  };

  // Pull-up panel position. The spring runs on a 0–2 level (0 handle, 1 timeline, 2 loadout);
  // drags are tracked in pixels because the two segments have different heights.
  toPx(v) { return this._ctrl * Math.min(v, 1) + this._exp * Math.max(v - 1, 0); }
  fromPx(p) { return p <= this._ctrl ? p / this._ctrl : 1 + (p - this._ctrl) / this._exp; }
  setSheet(level) { this.anim.sheet.to = level; this.setState({ sheetLevel: level }); this.kick(); }
  sheetDown = e => {
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* not supported */ }
    const a = this.anim.sheet; a.drag = true; a.vel = 0;
    this._sd = { y: e.clientY, p: this.toPx(clamp(a.v, 0, 2)), lastY: e.clientY, lastT: performance.now(), vel: 0, moved: false };
  };
  sheetMove = e => {
    const d = this._sd; if (!d) return;
    const now = performance.now(), dy = e.clientY - d.y, s = this._scale || 1, max = this._ctrl + this._exp;
    if (Math.abs(dy) > 4) d.moved = true;
    let p = d.p - dy / s;
    if (p < 0) p *= 0.3;
    if (p > max) p = max + (p - max) * 0.3;
    this.anim.sheet.v = p < 0 ? p / this._ctrl : p > max ? 2 + (p - max) / this._exp : this.fromPx(p);
    const dt = now - d.lastT;
    if (dt > 0) d.vel = 0.75 * ((e.clientY - d.lastY) / dt) + 0.25 * d.vel;
    d.lastY = e.clientY; d.lastT = now;
    this.apply();
  };
  sheetUp = () => {
    const d = this._sd; if (!d) return;
    this._sd = null;
    const a = this.anim.sheet, s = this._scale || 1;
    a.drag = false;
    let level;
    if (!d.moved) level = this.state.sheetLevel === 0 ? 1 : 0;
    else {
      const vpx = -(d.vel / s) * 1000, cur = this.toPx(clamp(a.v, 0, 2)), proj = cur + vpx * 0.16;
      const stops = [0, this._ctrl, this._ctrl + this._exp];
      level = stops.reduce((best, x, i) => Math.abs(x - proj) < Math.abs(stops[best] - proj) ? i : best, 0);
      a.vel = clamp(vpx / (a.v > 1 ? this._exp : this._ctrl), -8, 8);
    }
    this.setSheet(level);
  };
  sheetKey = e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.setSheet(this.state.sheetLevel === 0 ? 1 : 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.setSheet(Math.min(2, this.state.sheetLevel + 1)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.setSheet(Math.max(0, this.state.sheetLevel - 1)); }
  };
  openDrawer = () => this.setSheet(2);

  // Spring integrator (k = 320, c = 30). Reduced motion snaps.
  kick() { if (this._raf) return; this._last = performance.now(); this._raf = requestAnimationFrame(this.step); }
  step = now => {
    const dt = Math.min(0.032, Math.max(0.001, (now - this._last) / 1000));
    this._last = now;
    let active = false;
    for (const key in this.anim) {
      const a = this.anim[key];
      if (a.drag) continue;
      if (this.reduced) { a.v = a.to; a.vel = 0; continue; }
      a.vel += (-320 * (a.v - a.to) - 30 * a.vel) * dt;
      a.v += a.vel * dt;
      if (Math.abs(a.v - a.to) > 0.0008 || Math.abs(a.vel) > 0.004) active = true; else { a.v = a.to; a.vel = 0; }
    }
    this.apply();
    this._raf = active ? requestAnimationFrame(this.step) : null;
  };
  /** Writes --cam, --ctrl, --load and the theme tokens straight onto the app element (no re-render per frame). */
  apply() {
    const el = this.appRef.current; if (!el) return;
    const a = this.anim, sheet = a.sheet.v, cam = clamp(Math.max(this.scrollP, sheet - 1, a.pin.v), 0, 1);
    el.style.setProperty('--cam', cam.toFixed(4));
    el.style.setProperty('--ctrl', clamp(sheet, -0.06, 1).toFixed(4));
    el.style.setProperty('--load', clamp(sheet - 1, 0, 1.06).toFixed(4));
    const th = this._theme;
    if (th && (this._thMode !== this.state.mode || !el.style.getPropertyValue('--bg'))) {
      this._thMode = this.state.mode;
      for (const k in th) el.style.setProperty('--' + k, th[k]);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', th.bg);
    }
    const docked = cam > 0.5;
    if (docked !== this.state.docked) this.setState({ docked });
  }

  // ---------- selection ----------
  connect(label) {
    const conn = this.props.offline || this.state.offline ? '' : label;
    this.setState({ connecting: conn });
    clearTimeout(this._ct);
    if (conn) this._ct = setTimeout(() => this.setState({ connecting: '' }), 900);
  }
  setMode(m) { if (m !== this.state.mode) this.setState({ mode: m }); }
  selectBreak(id, dir = 0) { if (id === this.state.breakId) return; const i = E.D.breaks.findIndex(b => b.id === id); this.setState({ breakId: id, swipeDir: dir }); this.connect(E.camLabel('break', i)); }
  selectMtn(id, dir = 0) { if (id === this.state.mtnId) return; const i = E.D.mtns.findIndex(m => m.id === id); this.setState({ mtnId: id, swipeDir: dir }); this.connect(E.camLabel('mtn', i)); }
  // Swipe left = next location, right = previous (stops at the ends). swipeDir drives the slide-in.
  swipeBreak = d => { const B = E.D.breaks, i = B.findIndex(b => b.id === this.state.breakId), j = i + d; if (j < 0 || j >= B.length) return; this.selectBreak(B[j].id, d); };
  swipeMtn = d => { const M = E.D.mtns, i = M.findIndex(m => m.id === this.state.mtnId), j = i + d; if (j < 0 || j >= M.length) return; this.selectMtn(M[j].id, d); };
  cycleBreak() { const B = E.D.breaks, i = B.findIndex(b => b.id === this.state.breakId); this.selectBreak(B[(i + 1) % B.length].id); }
  setCamView(v) { this.setState({ camView: v }); }
  setOrder = o => this.setState({ order: o });
  jump(t, follow) { this._lastT = t; this.setState({ t, follow: !!follow }); }
  resetNow = () => this.jump(E.defaultT(), true);
  miniTap = () => {
    if (!this.state.docked) return;
    const a = this.anim; a.pin.to = 0; a.sheet.to = Math.min(a.sheet.to, 1);
    this.setState(s => ({ pinned: false, sheetLevel: Math.min(s.sheetLevel, 1) }));
    const el = this.activeRef().current; if (el) el.scrollTo({ top: 0, behavior: this.reduced ? 'auto' : 'smooth' });
    this.kick();
  };

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
  componentDidMount() {
    this.onResize = () => this.setState({ vw: window.innerWidth, vh: window.innerHeight });
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.onNet = () => this.setState({ offline: navigator.onLine === false });
    this.onNet();
    window.addEventListener('online', this.onNet);
    window.addEventListener('offline', this.onNet);
    const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.reduced = !!(mq && mq.matches);
    this._t0 = Date.now();
    this.timer = setInterval(() => this.tick(), 1000);
    this._splashT = setTimeout(() => this.setState({ splashMin: true }), 2400); // 1.4 s fade-in + 1 s hold, then a 0.6 s fade-out (~3 s total)
    Live.init({ onUpdate: this.onData });
  }
  componentDidUpdate() {
    if (this.state.splash === 'in' && this.state.splashMin && Live.isReady()) { this.setState({ splash: 'out' }); this._splashOut = setTimeout(() => this.setState({ splash: 'gone' }), 650); }
    const s = this.state, ps = this._ps || {};
    if (ps.mode !== s.mode) { const el = this.activeRef().current; this.scrollP = el ? clamp(el.scrollTop / 124, 0, 1) : 0; }
    if (this._ps && (ps.mode !== s.mode || ps.breakId !== s.breakId || ps.mtnId !== s.mtnId || ps.order !== s.order || ps.camView !== s.camView)) this.saveUI();
    this._ps = { mode: s.mode, breakId: s.breakId, mtnId: s.mtnId, order: s.order, camView: s.camView };
    this.apply();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('online', this.onNet);
    window.removeEventListener('offline', this.onNet);
    clearInterval(this.timer); clearTimeout(this._ct); clearTimeout(this._splashT); clearTimeout(this._splashOut);
    if (this._raf) cancelAnimationFrame(this._raf);
    Live.stop();
  }

  // ---------- render ----------
  renderApp(lay) {
    const st = this.state;
    if (!Live.isReady()) return <Splash failed={Live.isSettled()} onRetry={this.refreshNow} />;
    const D = E.D, bi = Math.max(0, D.breaks.findIndex(b => b.id === st.breakId)), mi = Math.max(0, D.mtns.findIndex(m => m.id === st.mtnId));
    Live.setCurrent(bi, mi);
    E.allowFetch = !st.dragging;
    const v = viewModel(st, Object.assign({}, this.props, { appH: lay.ah }), this);
    this._exp = v.exp; this._ctrl = v.ctrl; this._theme = v.theme; this._nowT = v.nowT;
    const vk = st.mode === 'surf' ? 'beach' : st.mode === 'snow' ? 'mountain' : 'split';
    const off = !!this.props.offline || st.offline, liveCam = !off && E.camLive(vk, bi, mi) === 'Live';
    Object.assign(v, { srcSummary: Live.summary(), dayWord: E.dayWord(), sheetLevel: st.sheetLevel, t: st.t });
    const ic = v.ic, common = { v, ic, openDrawer: this.openDrawer };
    return (
      <>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: v.glowOp, transition: 'opacity .6s', background: 'radial-gradient(110% 40% at 50% 30%, rgba(214,224,240,0.18), rgba(214,224,240,0) 70%), radial-gradient(70% 30% at 15% 85%, rgba(80,200,215,0.07), rgba(80,200,215,0) 70%), linear-gradient(180deg, rgba(232,238,246,0.10) 0%, rgba(28,34,44,0) 45%, rgba(190,200,216,0.10) 100%)' }} />
        <ModeScroller label="Surf" ref={this.surfRef} onScroll={this.onScroll} onSwipe={this.swipeBreak} swipeKey={st.breakId} swipeDir={st.swipeDir} tv={v.tv.surf} padB={v.dk.padB}><SurfView {...common} S={v.S} /></ModeScroller>
        <ModeScroller label="CA Double" ref={this.dblRef} onScroll={this.onScroll} tv={v.tv.double} padB={v.dk.padB}><DoubleView {...common} dbl={v.dbl} setOrder={this.setOrder} /></ModeScroller>
        <ModeScroller label="Snow" ref={this.snowRef} onScroll={this.onScroll} onSwipe={this.swipeMtn} swipeKey={st.mtnId} swipeDir={st.swipeDir} tv={v.tv.snow} padB={v.dk.padB}><SnowView {...common} sn={v.sn} /></ModeScroller>
        <Cam v={v} ic={ic} liveCam={liveCam} connecting={st.connecting} miniTap={this.miniTap} />
        <Dock v={v} ic={ic} bump={st.bump} h={this} />
        {lay.app && !standalone() && <InstallBanner ready={st.splash === 'gone'} hidden={st.sheetLevel > 0} bottom={`calc(${v.dk.tab + v.dk.grab + 10}px + max(20px, env(safe-area-inset-bottom, 0px)))`} />}
      </>
    );
  }

  render() {
    const st = this.state, app = this.isApp(), showBp = !app && this.props.showBlueprint !== false, lay = this.layout(app, showBp);
    this._scale = lay.s;
    const appEl = (
      <div ref={this.appRef} style={{ position: 'relative', width: 430, height: lay.ah, overflow: 'hidden', background: 'var(--bg, #09141A)', color: 'var(--t1, #EEF4F6)', zIndex: 0, isolation: 'isolate', fontFamily: SANS, WebkitUserSelect: 'none', userSelect: 'none', transition: 'background-color .5s, color .5s' }}>
        {this.renderApp(lay)}
        {Live.isReady() && st.splash !== 'gone' && <Splash leaving={st.splash === 'out'} onSkip={() => this.setState({ splashMin: true })} />}
      </div>
    );
    return (
      <div style={{ minHeight: '100vh', boxSizing: 'border-box', padding: lay.rootPad, background: '#05080B', color: '#EEF3F6', fontFamily: SANS, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: 56 }}>
        {showBp && <SourcesPanel order={lay.o1} rows={Live.sources()} />}
        <div style={{ order: lay.o2, flex: 'none', position: lay.pos, top: lay.top, left: lay.left, zIndex: lay.z, width: lay.pw, height: lay.ph }}>
          <div style={{ width: lay.bw, height: lay.bh, boxSizing: 'border-box', padding: lay.bpad, borderRadius: lay.brad, background: lay.bbg, boxShadow: lay.bsh, transform: `scale(${lay.s.toFixed(4)})`, transformOrigin: '0 0' }}>
            {lay.framed ? <DeviceFrame width={430} height={lay.ah} time={E.clockLabel()}>{appEl}</DeviceFrame> : appEl}
          </div>
        </div>
        {showBp && <InstallPanel />}
      </div>
    );
  }
}
