// Small shared primitives used across every screen.
import React from 'react';

export const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Geist, system-ui, sans-serif";
export const MONO = "ui-monospace, 'SF Mono', 'Geist Mono', Menlo, monospace";

export const T1 = 'var(--t1, #EEF4F6)';
export const T2 = 'var(--t2, #A5B3BD)';
export const T3 = 'var(--t3, #778692)';
export const FILL = 'var(--fill, rgba(238,244,246,0.05))';
export const HAIR = 'var(--hair, rgba(238,244,246,0.1))';

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

/** Rating pill used in the screen headers. */
export function RatingPill({ label, bg, fg }) {
  return (
    <div style={{ flex: 'none', marginTop: 20, height: 32, padding: '0 13px 0 11px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 7, background: bg, color: fg, fontSize: 13, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', transition: 'background .25s, color .25s' }}>
      <Dot color={fg} />{label}
    </div>
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

/** The “best window” card (Surf and Snow). */
export function WindowCard({ win, chevron }) {
  return (
    <button className="btn" onClick={win.onClick} style={{ margin: '20px 0 0', width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '14px 14px 14px 16px', borderRadius: 18, background: win.bg }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Cap size={11} color={win.fg} style={{ display: 'block', lineHeight: '14px' }}>{win.caption}</Cap>
        <div className="tnum" style={{ fontSize: 20, lineHeight: '26px', fontWeight: 650, marginTop: 3 }}>{win.range}</div>
        <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 2 }}>{win.detail}</div>
      </div>
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span className="nw" style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: win.fg }}>{win.status}</span>
        {win.showCta && (
          <span style={{ height: 36, padding: '0 8px 0 14px', borderRadius: 18, background: 'var(--chip, rgba(238,243,246,0.12))', display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, fontWeight: 600 }}>
            {win.cta}<Icon src={chevron} size={16} />
          </span>
        )}
      </div>
    </button>
  );
}

export function LoadoutTeaser({ label = 'Loadout', text, onClick, ic, mt = 10 }) {
  return (
    <button className="btn" onClick={onClick} style={{ margin: `${mt}px 0 0`, width: '100%', minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '10px 14px', borderRadius: 16, background: FILL }}>
      <Icon src={ic.backpack} size={20} color={T2} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Cap>{label}</Cap>
        <div className="ell" style={{ fontSize: 14, lineHeight: '19px', fontWeight: 600 }}>{text}</div>
      </div>
      <Icon src={ic.chevUp} size={18} color={T3} />
    </button>
  );
}

export function Footer({ footnote, ic }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontSize: 12, lineHeight: '16px', color: T3 }}>
      <Icon src={ic.db} size={14} /><span>{footnote}</span>
    </div>
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
