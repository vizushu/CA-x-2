// Small shared primitives used across every screen.
import React from 'react';
import { iconUrl } from '../icons.js';

export const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Geist, system-ui, sans-serif";
export const MONO = "ui-monospace, 'SF Mono', 'Geist Mono', Menlo, monospace";

export const T1 = 'var(--t1, #EEF4F6)';
export const T2 = 'var(--t2, #A5B3BD)';
export const T3 = 'var(--t3, #778692)';
export const FILL = 'var(--fill, rgba(238,244,246,0.05))';
export const HAIR = 'var(--hair, rgba(238,244,246,0.1))';
/** Minimum tap target in design px. The app scales its 430-px design to the screen width, so 58 design px is
 *  ≥48 real CSS px on every phone ≥356 px wide (360-px Android: 48.6 px; iPhone SE: 50.6 px; iPhone 15 Pro: 53 px). */
export const TAP = 58;

/** Lucide icon drawn as a CSS mask so it takes `currentColor` (or `color`). */
export function Icon({ src, size = 16, color = 'currentColor', style }) {
  const m = `url("${src}") center / contain no-repeat`;
  return <span aria-hidden="true" style={{ flex: 'none', display: 'block', width: size, height: size, background: color, WebkitMask: m, mask: m, ...style }} />;
}

/** Mono uppercase caption. */
export function Cap({ size = 10, color = T3, ls = '.06em', style, children }) {
  return <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: ls, textTransform: 'uppercase', color, ...style }}>{children}</span>;
}

/** Status dot. */
export const Dot = ({ size = 8, color, style }) => <span style={{ flex: 'none', display: 'block', width: size, height: size, borderRadius: size / 2, background: color, ...style }} />;

/** Direction arrow used by wind and swell dials (points the way the air or water travels). */
export function Arrow({ size = 24, rot = 0, color, style, w = 2.2 }) {
  const d = size === 24 ? 'M12 20V5M6.5 10.5L12 5l5.5 5.5' : size === 18 ? 'M9 15V4M5 8l4-4 4 4' : 'M6 10.5V2M2.5 5.5L6 2l3.5 3.5';
  return (
    <svg width={size} height={size} aria-hidden="true" style={{ position: 'absolute', transform: `rotate(${rot}deg)`, color, ...style }}>
      <path d={d} style={{ fill: 'none', stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
    </svg>
  );
}

/** Status badge: the one status slot on a card face. */
export function Badge({ text, bg, fg, big }) {
  if (!text) return null;
  const c = fg || T1;
  return (
    <span className="nw" style={{ flex: 'none', height: big ? 32 : 28, padding: big ? '0 13px 0 11px' : '0 11px 0 9px', borderRadius: big ? 16 : 14, display: 'inline-flex', alignItems: 'center', gap: big ? 7 : 6, background: bg || 'var(--chip, rgba(238,244,246,0.12))', color: c, fontSize: big ? 13 : 11.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', transition: 'background .25s, color .25s' }}>
      <Dot size={big ? 8 : 6} color={c} />{text}
    </span>
  );
}

/** Section heading between groups of cards (no data of its own). */
export function SectionTitle({ children, mt = 30 }) {
  return <h2 style={{ margin: `${mt}px 0 0`, fontSize: 20, lineHeight: '26px', fontWeight: 650 }}>{children}</h2>;
}

/** 48 px action inside a detail drawer (secondary controls live here, not on card faces). */
export function DrawerAction({ label, onClick, icon, disabled, busy }) {
  return (
    <button type="button" className="btn" onClick={onClick} disabled={disabled} aria-busy={busy || undefined}
      style={{ marginTop: 12, width: '100%', minHeight: TAP, padding: '0 16px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--chip, rgba(238,244,246,0.12))', fontSize: 15, fontWeight: 650, opacity: disabled && !busy ? 0.5 : 1, transition: 'opacity .2s' }}>
      {icon && <Icon src={icon} size={16} style={busy ? { animation: 'spin 0.9s linear infinite' } : undefined} />}{label}
    </button>
  );
}

/**
 * Progressive-disclosure card. The face shows at most three data points: one label, one primary metric (value + unit)
 * and one status badge. Secondary metadata, timestamps and controls go in `rows` / `children`, which render in an
 * expandable detail drawer opened by tapping the card (the whole face is one ≥64 px tap target).
 */
export function Card({ label, value, unit, badge, icon, hero, tint, rows, children, mt = 10, dim, valueNode }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const hasDrawer = !!((rows && rows.length) || children);
  const long = typeof value === 'string' && value.length > 12;
  const Face = hasDrawer ? 'button' : 'div';
  const faceProps = hasDrawer ? { type: 'button', className: 'btn', onClick: () => setOpen(o => !o), 'aria-expanded': open, 'aria-controls': id } : {};
  const chev = hasDrawer && <Icon src={iconUrl('chevron-down')} size={18} color={T3} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />;
  const unitEl = unit && <span style={{ fontSize: hero ? 24 : 14, fontWeight: 500, color: T2, marginLeft: hero ? 6 : 4, letterSpacing: 0 }}>{unit}</span>;
  return (
    <section style={{ marginTop: mt, borderRadius: hero ? 0 : 20, background: hero ? 'transparent' : tint || FILL, opacity: dim ? 0.55 : 1, transition: 'opacity .25s, background .25s' }}>
      <Face {...faceProps} style={{ width: '100%', minHeight: Math.max(64, TAP), boxSizing: 'border-box', display: 'flex', alignItems: hero ? 'stretch' : 'center', gap: 12, padding: hero ? 0 : '12px 12px 12px 16px', textAlign: 'left', borderRadius: hero ? 0 : 20 }}>
        {icon && !hero && <span style={{ flex: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: icon.bg, color: icon.fg }}><Icon src={icon.src} size={16} /></span>}
        {hero ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div className="pretty" style={{ minWidth: 0, fontSize: 28, lineHeight: '34px', fontWeight: 650, letterSpacing: '-0.02em' }}>{label}</div>
              <span style={{ flex: 'none', marginTop: 1 }}><Badge {...badge} big /></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
              {valueNode || <div className="tnum nw" style={{ fontSize: 72, lineHeight: '76px', fontWeight: 600, letterSpacing: '-0.045em' }}>{value}{unitEl}</div>}
              {hasDrawer && <span style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 4, height: TAP, fontSize: 13, fontWeight: 600, color: T3 }}>{open ? 'Less' : 'Details'}{chev}</span>}
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Cap size={11} color={T2} style={{ display: 'block', lineHeight: '14px' }}><span className="ell" style={{ display: 'block' }}>{label}</span></Cap>
              <div className="tnum ell" style={{ fontSize: long ? 19 : 24, lineHeight: '30px', fontWeight: 650, letterSpacing: '-0.01em', marginTop: 2 }}>{value}{unitEl}</div>
            </div>
            {badge && <Badge {...badge} />}
            {chev}
          </>
        )}
      </Face>
      {hasDrawer && (
        <div id={id} role="region" aria-label={label + ' details'} style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', visibility: open ? 'visible' : 'hidden', transition: 'grid-template-rows .28s cubic-bezier(.2,.8,.2,1), visibility .28s' }}>
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
            <div style={{ padding: hero ? '6px 0 4px' : '0 16px 16px' }}>
              {(rows || []).map((r, i) => (
                <div key={r.k + i} style={{ display: 'grid', gridTemplateColumns: '88px minmax(0,1fr)', gap: 12, padding: '10px 0', boxShadow: `inset 0 0.5px 0 ${HAIR}` }}>
                  <Cap style={{ paddingTop: 3 }}>{r.k}</Cap>
                  <div style={{ minWidth: 0 }}>
                    <div className="pretty" style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: r.color }}>{r.v}</div>
                    {r.sub && <div className="pretty" style={{ fontSize: 12.5, lineHeight: '17px', color: T2, marginTop: 1 }}>{r.sub}</div>}
                  </div>
                </div>
              ))}
              {children}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function OfflineBanner({ show, text, icon }) {
  if (!show) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, padding: '0 14px', marginBottom: 18, borderRadius: 20, background: FILL, fontSize: 13, lineHeight: '18px' }}>
      <Icon src={icon} size={16} /><span>{text}</span>
    </div>
  );
}

/** The “best window” card (Surf and Snow): window label · time range · status. Conditions and the jump action open below. */
export function WindowCard({ win }) {
  const rows = win.detail ? [{ k: 'Conditions', v: win.detail }] : [];
  return (
    <Card label={win.caption} value={win.range} badge={win.status ? { text: win.status, fg: win.fg } : null} tint={win.bg} rows={rows} mt={20}>
      {win.showCta && <DrawerAction label={win.cta === 'Jump' ? 'Jump the timeline to this window' : 'Review it on the timeline'} onClick={win.onClick} icon={iconUrl('chevron-right')} />}
    </Card>
  );
}

/** Loadout: the main pick on the face; the rest of the kit and the full gear drawer open below. */
export function LoadoutCard({ label = 'Loadout', text, onOpen, mt = 10 }) {
  const [first, ...rest] = String(text || '').split(' · ');
  return (
    <Card label={label} value={first} rows={rest.length ? [{ k: 'Also pack', v: rest.join(' · ') }] : []} mt={mt}>
      <DrawerAction label="Open gear & quiver" onClick={onOpen} icon={iconUrl('backpack')} />
    </Card>
  );
}

/**
 * Data sources + manual refresh. Visibility of system status: the button is disabled and spins while a refresh is in
 * flight, the forecast on screen stays put, and the result is announced in plain language with what to do next.
 */
export function SourcesCard({ v, footnote, refresh }) {
  const total = v.sources.length, live = v.sources.filter(r => /^Updated|^On demand|^Live/.test(r.state)).length;
  const badge = v.offline ? { text: 'Offline', fg: 'oklch(0.74 0.15 30)' } : live === total ? { text: 'All live', fg: 'oklch(0.8 0.15 160)' } : { text: 'Partial', fg: 'oklch(0.84 0.14 80)' };
  const busy = refresh.state === 'pending';
  return (
    <Card label="Data" value={live + ' of ' + total} unit="feeds live" badge={badge} rows={[{ k: 'Sources', v: footnote }]} mt={24}>
      <div style={{ paddingTop: 10, boxShadow: `inset 0 0.5px 0 ${HAIR}` }}><SourceRows rows={v.sources} fs={12.5} lh={17} labelColor={T2} /></div>
      <DrawerAction label={busy ? 'Checking for updates…' : 'Refresh now'} onClick={refresh.onClick} icon={iconUrl('refresh-cw')} disabled={busy} busy={busy} />
      <div role="status" aria-live="polite" className="pretty" style={{ minHeight: 18, marginTop: 8, fontSize: 12.5, lineHeight: '17px', color: refresh.state === 'failed' ? 'oklch(0.8 0.12 40)' : T2 }}>{busy ? 'You can keep using the app. The forecast on screen stays until new data arrives.' : refresh.msg}</div>
    </Card>
  );
}

/** Source status rows (settings sheet, loading screen, presentation panel). */
export function SourceRows({ rows, gap = 10, fs = 13, lh = 18, labelColor, stateFs }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '8px minmax(0,1fr) auto', gap: 10, alignItems: 'center', fontSize: fs, lineHeight: lh + 'px' }}>
          <Dot color={r.dot} />
          <span className={labelColor ? 'ell' : undefined} style={labelColor ? { color: labelColor } : undefined}>{r.label}</span>
          <span className="nw" style={{ color: '#778692', fontSize: stateFs }}>{r.state}</span>
        </div>
      ))}
    </div>
  );
}

/** Scrolling content column for one mode. */
export const ModeScroller = React.forwardRef(function ModeScroller({ label, tv, padB, onScroll, onSwipe, swipeKey, swipeDir, children }, ref) {
  // Horizontal swipe (Surf/Snow): a quick, mostly-sideways flick changes the location. Vertical scrolling is untouched.
  const t = React.useRef(null);
  const start = e => { const p = e.touches[0]; t.current = e.touches.length === 1 ? { x: p.clientX, y: p.clientY, at: Date.now() } : null; };
  const end = e => {
    const s = t.current; t.current = null; if (!s || !onSwipe) return;
    const p = e.changedTouches[0], dx = p.clientX - s.x, dy = p.clientY - s.y;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - s.at < 700) onSwipe(dx < 0 ? 1 : -1);
  };
  return (
    <div data-screen-label={label} ref={ref} onScroll={onScroll} onTouchStart={onSwipe ? start : undefined} onTouchEnd={onSwipe ? end : undefined} className="noscroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', touchAction: onSwipe ? 'pan-y' : undefined, boxSizing: 'border-box', padding: `258px 20px ${padB}px`, opacity: tv.op, visibility: tv.vis, transition: 'opacity .3s ease, visibility .3s' }}>
      <div key={swipeKey} style={{ animation: swipeDir ? `spotIn${swipeDir > 0 ? 'R' : 'L'} .32s cubic-bezier(.2,.8,.2,1) both` : undefined }}>{children}</div>
    </div>
  );
});
