// Shared building blocks for the "Lifeguard board" look: a solid rating-colored verdict, ink on paper (day) or
// paper on ink (night), Barlow Condensed for headings and numbers, Inter for everything else.
// All colors are CSS variables set on the app element (see App.apply), so a theme change re-colors everything at once.
import React from 'react';

export const SANS = "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
export const T1 = 'var(--t1, #0F171F)';
export const T2 = 'var(--t2, #4A545D)';
export const T3 = 'var(--t3, #636D77)';
export const BG = 'var(--bg, #FBFAF7)';
export const FILL = 'var(--fill, rgba(15,23,31,0.06))';
export const FILL2 = 'var(--fill2, rgba(15,23,31,0.1))';
export const HAIR = 'var(--hair, rgba(15,23,31,0.12))';
export const ACC = 'var(--acc, #00737E)';
export const DUR = 'var(--dur, .35s)';

/** Lucide icon drawn as a CSS mask so it takes `currentColor`. */
export function Icon({ src, size = 16, style }) {
  const m = `url("${src}")`;
  return <span className="ico" aria-hidden="true" style={{ width: size, height: size, WebkitMaskImage: m, maskImage: m, ...style }} />;
}

/** Small uppercase label (11 px, tracked). */
export function Label({ children, color = T3, style }) {
  return <span style={{ fontSize: 11, lineHeight: '14px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color, ...style }}>{children}</span>;
}

/** Condensed section heading. */
export function SectionTitle({ children, style }) {
  return <div className="disp" style={{ fontSize: 22, lineHeight: '24px', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', ...style }}>{children}</div>;
}

export function OfflineBanner({ show, text, icon }) {
  if (!show) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 40, padding: '0 14px', marginTop: 6, borderRadius: 12, background: FILL, fontSize: 13, lineHeight: '18px' }}>
      <Icon src={icon} size={16} /><span>{text}</span>
    </div>
  );
}

/** Screen header: tap the name to change spot, gear for sources and settings. */
export function Header({ head, ic, onPicker, onSettings }) {
  return (
    <div data-screen-label="Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 56 }}>
      <button type="button" className="btn" aria-label={head.label} onClick={onPicker} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', height: 56 }}>
        <span style={{ minWidth: 0, display: 'block' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="disp" style={{ fontSize: 28, lineHeight: '30px', fontWeight: 700, letterSpacing: '.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{head.name}</span>
            <Icon src={ic.chevDown} size={20} style={{ color: T2 }} />
          </span>
          <span style={{ display: 'block', fontSize: 12, lineHeight: '16px', color: T2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{head.sub}</span>
        </span>
      </button>
      <button type="button" className="btn" aria-label="Sources and settings" onClick={onSettings} style={{ flex: 'none', width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: FILL }}>
        <Icon src={ic.settings} size={20} />
      </button>
    </div>
  );
}

/** The verdict: a solid rating-colored block with the word, the one big number and a plain-language line. */
export function Hero({ hero }) {
  return (
    <section aria-label="Verdict" style={{ marginTop: 8, borderRadius: 22, padding: '16px 20px 18px', background: hero.bg, color: hero.fg, transition: `background-color ${DUR}, color ${DUR}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div className="disp" style={{ fontSize: 24, lineHeight: '26px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{hero.word}</div>
        <div className="ell" style={{ fontSize: 11, lineHeight: '14px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{hero.ctx}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
          <span className="disp tnum nw" style={{ fontSize: 96, lineHeight: '84px', fontWeight: 700, letterSpacing: '-0.01em' }}>{hero.num}</span>
          <span className="disp" style={{ fontSize: 40, lineHeight: '40px', fontWeight: 600 }}>{hero.unit}</span>
          <span className="nw" style={{ fontSize: 14, lineHeight: '18px', fontWeight: 600 }}>{hero.tail}</span>
        </div>
        <div style={{ flex: 'none', textAlign: 'right', paddingBottom: 4 }}>
          <div className="disp tnum nw" style={{ fontSize: 34, lineHeight: '34px', fontWeight: 600 }}>{hero.side}<span style={{ fontSize: 18, marginLeft: 3 }}>{hero.sideUnit}</span></div>
          <div className="nw" style={{ fontSize: 11, lineHeight: '14px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>{hero.sideLabel}</div>
        </div>
      </div>
      <div className="pretty" style={{ fontSize: 16, lineHeight: '21px', fontWeight: 500, marginTop: 12 }}>{hero.body}</div>
    </section>
  );
}

/** Three key readings under the verdict (Surf and Snow). */
export function Stats({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginTop: 14, padding: '12px 0', borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      {stats.map(s => (
        <div key={s.label} style={{ minWidth: 0 }}>
          <Label style={{ display: 'block' }}><span className="ell" style={{ display: 'block' }}>{s.label}</span></Label>
          <div className="tnum ell" style={{ fontSize: 17, lineHeight: '22px', fontWeight: 600, marginTop: 3, color: s.color, transition: `color ${DUR}` }}>{s.value}</div>
          <div className="pretty" style={{ fontSize: 12, lineHeight: '16px', color: T2, marginTop: 1 }}>{s.detail}</div>
        </div>
      ))}
    </div>
  );
}

/** Best window card (Surf and Snow). */
export function WindowCard({ win, chevron }) {
  return (
    <section aria-label="Best window" style={{ marginTop: 16, borderRadius: 16, padding: '14px 16px', background: win.bg, display: 'flex', alignItems: 'center', gap: 12, transition: `background-color ${DUR}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Label color={win.fg} style={{ display: 'block' }}>{win.caption}</Label>
        <div className="disp tnum pretty" style={{ fontSize: 30, lineHeight: '32px', fontWeight: 600, marginTop: 3 }}>{win.range}</div>
        <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 2 }}>{win.detail}</div>
      </div>
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span className="nw" style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: win.fg }}>{win.status}</span>
        {win.showCta && (
          <button type="button" className="btn" aria-label={win.ctaLabel} onClick={win.onClick} style={{ height: 46, padding: '0 12px 0 16px', borderRadius: 23, background: T1, color: BG, display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, fontWeight: 600 }}>
            {win.cta}<Icon src={chevron} size={16} />
          </button>
        )}
      </div>
    </section>
  );
}

/** What to bring: grouped packing rows that re-pack as the timeline moves. */
export function Gear({ gear }) {
  return (
    <section aria-label="What to bring" style={{ marginTop: 30 }}>
      <SectionTitle>What to bring</SectionTitle>
      <div style={{ fontSize: 12, lineHeight: '16px', color: T3, marginTop: 2 }}>{gear.sub}</div>
      {gear.groups.map(gp => (
        <div key={gp.title} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, lineHeight: '18px', fontWeight: 600, color: T2 }}><Icon src={gp.icon} size={15} />{gp.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
            {gp.rows.map(lr => (
              <div key={lr.k} style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 12, padding: '10px 0', borderBottom: `1px solid ${HAIR}` }}>
                <Label style={{ paddingTop: 4 }}>{lr.k}</Label>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, lineHeight: '21px', fontWeight: 600 }}>{lr.v}</div>
                  <div style={{ fontSize: 12, lineHeight: '16px', color: T2, marginTop: 1 }}>{lr.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function Footer({ foot, ic, summary, onSettings }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 24, fontSize: 12, lineHeight: '16px', color: T3 }}>
        <Icon src={ic.db} size={14} style={{ marginTop: 1 }} /><span>{foot}</span>
      </div>
      <button type="button" className="btn" onClick={onSettings} style={{ margin: '12px 0 0', width: '100%', minHeight: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderRadius: 14, background: FILL }}>
        <Icon src={ic.settings} size={18} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>Sources &amp; settings</span>
        <span style={{ fontSize: 12, color: T3 }}>{summary}</span>
      </button>
    </>
  );
}

/** Source status rows (settings sheet, loading screen, desktop side panel). */
export function SourceRows({ rows, gap = 10, labelColor = T1, stateColor = T3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {rows.map(r => (
        <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0,1fr) auto', gap: 10, alignItems: 'center', fontSize: 13, lineHeight: '18px' }}>
          <span style={{ width: 10, height: 10, borderRadius: 5, background: r.dot }} />
          <span className="ell" style={{ color: labelColor }}>{r.label}</span>
          <span className="nw tnum" style={{ color: stateColor }}>{r.state}</span>
        </div>
      ))}
    </div>
  );
}

/** Sticky bar that appears once the verdict has scrolled away: spot, number, word, time. Tap to go back to the top. */
export function CollapsedBar({ bar, show, topPad, onTop }) {
  return (
    <button type="button" className="btn" aria-label="Back to the top" onClick={onTop} tabIndex={show ? 0 : -1}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 30, boxSizing: 'border-box', width: '100%', padding: `${topPad} 20px 0`, background: BG, boxShadow: `0 1px 0 ${HAIR}`, opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none', transition: `opacity ${DUR}, background-color ${DUR}` }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44 }}>
        <span style={{ flex: 'none', width: 12, height: 12, borderRadius: 6, background: bar.dot, transition: `background-color ${DUR}` }} />
        <span className="ell" style={{ fontSize: 15, lineHeight: '20px', fontWeight: 600, minWidth: 0 }}>{bar.name}</span>
        <span className="disp tnum nw" style={{ fontSize: 24, lineHeight: '24px', fontWeight: 700 }}>{bar.num}<span style={{ fontSize: 15, fontWeight: 600, marginLeft: 2 }}>{bar.unit}</span></span>
        <span className="nw" style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600, color: bar.wordColor }}>{bar.word}</span>
        <span style={{ flex: 1 }} />
        <span className="nw tnum" style={{ fontSize: 13, color: T3 }}>{bar.time}</span>
      </span>
    </button>
  );
}

/** The scrolling column. Horizontal swipe (Surf/Snow): a quick, mostly-sideways flick changes the location. */
export const Scroller = React.forwardRef(function Scroller({ label, topPad, padB, onScroll, onSwipe, swipeKey, swipeDir, children }, ref) {
  const t = React.useRef(null);
  const start = e => { const p = e.touches[0]; t.current = e.touches.length === 1 ? { x: p.clientX, y: p.clientY, at: Date.now() } : null; };
  const end = e => {
    const s = t.current; t.current = null; if (!s || !onSwipe) return;
    const p = e.changedTouches[0], dx = p.clientX - s.x, dy = p.clientY - s.y;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - s.at < 700) onSwipe(dx < 0 ? 1 : -1);
  };
  return (
    <div data-screen-label={label} ref={ref} onScroll={onScroll} onTouchStart={onSwipe ? start : undefined} onTouchEnd={onSwipe ? end : undefined} className="noscroll"
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', touchAction: onSwipe ? 'pan-y' : undefined, boxSizing: 'border-box', padding: `${topPad} 20px ${padB}px` }}>
      <div key={swipeKey} style={{ animation: swipeDir ? `spotIn${swipeDir > 0 ? 'R' : 'L'} .32s cubic-bezier(.2,.8,.2,1) both` : undefined }}>{children}</div>
    </div>
  );
});
