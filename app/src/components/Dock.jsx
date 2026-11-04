// Bottom chrome: docked tab bar, plus a pull-up panel (handle → timeline controls → loadout drawer).
import React from 'react';
import { Arrow, Cap, Dot, FILL, HAIR, Icon, MONO, T1, T2, T3 } from './ui.jsx';

const HATCH = `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 5px)`;

export default function Dock({ v, ic, bump, h }) {
  const { dk, drawer, strip, sc, pills, modes } = v;
  return (
    <>
    {/* Pull-up panel: collapsed handle (0) → timeline controls (1) → loadout (2) */}
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(${dk.tab}px + max(20px, env(safe-area-inset-bottom, 0px)))`, height: `calc(${dk.grab}px + ${dk.ctrl}px * var(--ctrl, 0) + ${dk.exp}px * var(--load, 0))`, zIndex: 20, overflow: 'hidden', borderRadius: '24px 24px 0 0', background: 'var(--glass, rgba(12,24,30,0.78))', backdropFilter: 'blur(30px) saturate(170%)', WebkitBackdropFilter: 'blur(30px) saturate(170%)', boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.18), 0 -12px 40px rgba(0,0,0,0.25)`, color: T1, transition: 'background-color .45s, color .45s' }}>
      {/* Handle row */}
      <div onPointerDown={h.sheetDown} onPointerMove={h.sheetMove} onPointerUp={h.sheetUp} onPointerCancel={h.sheetUp} onKeyDown={h.sheetKey} tabIndex={0} role="button" aria-label={v.sheetLevel === 0 ? 'Show timeline' : v.sheetLevel === 1 ? 'Hide timeline' : 'Close loadout'} aria-expanded={v.sheetLevel > 0} style={{ position: 'relative', zIndex: 2, height: dk.grab, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', boxSizing: 'border-box', touchAction: 'none', cursor: 'grab', background: 'var(--glass, rgba(12,24,30,0.78))' }}>
        <div style={{ position: 'absolute', left: '50%', top: 6, width: 36, height: 5, marginLeft: -18, borderRadius: 3, background: 'var(--grab, rgba(238,244,246,0.3))' }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 6, opacity: 'calc(1 - var(--ctrl, 0) * 1.5)' }}>
          <span className="tnum nw" style={{ fontSize: 15, fontWeight: 700 }}>{strip.time}</span>
          <Cap color={strip.subFg}>{strip.sub}</Cap>
          {dk.glove && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: T2, alignSelf: 'center' }}><Icon src={ic.hand} size={13} />Glove</span>}
        </div>
        <div className="ell" style={{ flex: 'none', maxWidth: 150, paddingTop: 6, fontSize: 13, fontWeight: 600, color: strip.cells[0].color, opacity: 'calc(1 - var(--ctrl, 0) * 1.5)' }}>{strip.cells[0].value}</div>
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 4, paddingTop: 6, fontSize: 12, fontWeight: 600, color: T2 }}>
          {v.sheetLevel >= 1 ? 'Loadout' : 'Timeline'}<Icon src={ic.chevUp} size={15} style={{ transform: v.sheetLevel === 2 ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 12, right: 12, top: dk.grab, bottom: 0 }}>
      {/* Loadout drawer */}
      <div className="noscroll" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: dk.ctrl, overflowY: 'auto', padding: '0 4px 8px', opacity: 'calc(var(--load, 0) * 1.4 - 0.25)', pointerEvents: v.sheetLevel === 2 ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 22, lineHeight: '28px', fontWeight: 650, letterSpacing: '-0.01em' }}>Gear &amp; quiver</div>
          <Cap size={11} color={T2}>{drawer.when}</Cap>
        </div>
        <div style={{ fontSize: 12, lineHeight: '16px', color: T3, marginTop: 2 }}>{drawer.sub}</div>
        {drawer.groups.map(gp => (
          <div key={gp.title} style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: T2 }}>
              <Icon src={gp.icon} size={14} />{gp.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
              {gp.rows.map(lr => (
                <div key={lr.k} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: 12, padding: '9px 0', boxShadow: `inset 0 0.5px 0 ${HAIR}` }}>
                  <Cap style={{ paddingTop: 4 }}>{lr.k}</Cap>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, lineHeight: '21px', fontWeight: 600 }}>{lr.v}</div>
                    <div style={{ fontSize: 12, lineHeight: '16px', color: T2 }}>{lr.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline controls (anchored to the panel bottom; revealed as it grows) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: dk.ctrl, boxSizing: 'border-box', paddingBottom: 12, display: 'flex', flexDirection: 'column', opacity: 'calc(var(--ctrl, 0) * 1.6 - 0.4)', pointerEvents: v.sheetLevel >= 1 ? 'auto' : 'none' }}>
      {/* Readout strip */}
      <div style={{ flex: 'none', height: dk.strip, display: 'grid', gridTemplateColumns: strip.cols, gap: 2, alignItems: 'stretch' }}>
        <button className="btn" onClick={h.resetNow} aria-label={strip.sub === 'Now' ? 'Showing now' : 'Return to now'} style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', borderRadius: 14, background: strip.timeBg, textAlign: 'left', transition: 'background .2s' }}>
          <span className="tnum nw" style={{ fontSize: dk.val, lineHeight: '20px', fontWeight: 700 }}>{strip.time}</span>
          <Cap color={strip.subFg}>{strip.sub}</Cap>
        </button>
        {strip.cells.map(cl => (
          <div key={cl.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: strip.pad, minWidth: 0 }}>
            <Cap size={9.5} style={{ whiteSpace: 'nowrap' }}>{cl.label}</Cap>
            <span className="ell tnum" style={{ fontSize: strip.val, letterSpacing: '-0.01em', lineHeight: '20px', fontWeight: 650, color: cl.color, transition: 'color .2s' }}>{cl.value}</span>
          </div>
        ))}
      </div>

      {/* Scrubber */}
      <div onPointerDown={h.scrubDown} onPointerMove={h.scrubMove} onPointerUp={h.scrubUp} onPointerCancel={h.scrubUp} onKeyDown={h.scrubKey} tabIndex={0} role="slider" aria-label="Time of day" aria-valuemin={5} aria-valuemax={17} aria-valuenow={v.t} aria-valuetext={strip.time} style={{ flex: 'none', position: 'relative', height: dk.viz, touchAction: 'none', cursor: 'ew-resize', outline: 'none' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: sc.shH, width: +sc.shL, borderRadius: '8px 0 0 8px', background: HATCH }} />
        <div style={{ position: 'absolute', top: 0, height: sc.shH, left: +sc.shRx, width: +sc.shRw, borderRadius: '0 8px 8px 0', background: HATCH }} />
        <div style={{ position: 'absolute', boxSizing: 'border-box', top: sc.bandTop, height: sc.bandH, left: +sc.bandX, width: +sc.bandW, display: sc.bandDisp, borderRadius: 6, background: sc.bandBg, borderBottom: `2px solid ${sc.bandFg}`, transition: 'left .3s, width .3s' }} />
        {sc.track.map((tk, i) => <div key={i} style={{ position: 'absolute', top: 3, height: 10, borderRadius: 5, left: +tk.x, width: +tk.w, background: tk.bg, transition: 'left .4s, width .4s' }} />)}
        <div style={{ position: 'absolute', top: 16, width: 0, height: sc.nowH, left: +sc.nowX, borderLeft: `1px dashed ${T3}` }} />
        {sc.cols.map(c => (
          <div key={c.x} style={{ position: 'absolute', top: 0, bottom: 0, width: 0, left: +c.x }}>
            <Arrow size={12} w={1.6} rot={c.rot} color={c.wcol} style={{ left: -6, top: 2, opacity: c.aop }} />
            <div style={{ position: 'absolute', left: -7, width: 14, bottom: 26, height: +c.h, overflow: 'hidden', borderRadius: '3px 3px 1px 1px', background: c.col, transition: 'height .3s, background .3s' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: +c.secH, background: 'rgba(8,13,20,0.4)' }} />
            </div>
            <div style={{ position: 'absolute', left: -14, width: 28, bottom: 0, textAlign: 'center', fontFamily: MONO, fontSize: 10, lineHeight: '12px', color: c.lcol, transition: 'color .15s' }}>{c.label}</div>
          </div>
        ))}
        <svg width="390" height={sc.vh} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden="true">
          <path d={sc.area} style={{ fill: FILL }} />
          <path d={sc.line} style={{ fill: 'none', stroke: T2, strokeWidth: 1.25 }} />
        </svg>
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: 0, pointerEvents: 'none', left: +sc.phX, transition: sc.phTrans }}>
          <div style={{ position: 'absolute', left: -1, top: 0, width: 2, height: sc.phH, borderRadius: 1, background: T1, boxShadow: `0 0 10px ${HAIR}` }} />
          <div style={{ position: 'absolute', left: -8, top: sc.knobTop, width: 16, height: 16, borderRadius: 8, background: T1, boxShadow: '0 2px 8px rgba(0,0,0,0.4)', transform: `scale(${sc.knob})`, transition: 'transform .18s cubic-bezier(.2,.8,.2,1)' }}>
            {bump > 0 && <span key={'k' + bump} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid currentColor', color: T1, animation: 'detent 340ms ease-out forwards', pointerEvents: 'none' }} />}
          </div>
        </div>
      </div>

      <div style={{ flex: 'none', height: 0.5, margin: '6px 4px 5.5px', background: HAIR }} />

      {/* Location pills */}
      <div style={{ flex: 'none', height: dk.pills, display: 'grid', gridTemplateColumns: pills.cols, gap: 4 }}>
        {pills.items.map(pl => (
          <button key={pl.label} className="btn" onClick={pl.onClick} aria-pressed={pl.fw === 650} style={{ padding: '0 8px', minWidth: 0, height: '100%', borderRadius: 16, display: 'flex', flexDirection: pl.dir, alignItems: 'center', justifyContent: 'center', gap: pl.gap, background: pl.bg, color: pl.fg, fontSize: pl.fs, lineHeight: '17px', fontWeight: pl.fw, transition: 'background .2s, color .2s' }}>
            {pl.hasIcon && <Icon src={pl.icon} size={14} />}
            {pl.hasDot && <Dot color={pl.dot} style={{ transition: 'background .3s' }} />}
            <span className="ell">{pl.label}</span>
            {pl.hasScore && <span className="tnum" style={{ flex: 'none', fontSize: 13, fontWeight: 700, color: pl.scoreFg }}>{pl.score}</span>}
          </button>
        ))}
      </div>

      </div>
      </div>
    </div>

    {/* Bottom tab bar */}
    <nav aria-label="Mode" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 21, boxSizing: 'border-box', height: `calc(${dk.tab}px + max(20px, env(safe-area-inset-bottom, 0px)))`, paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', background: 'var(--glass, rgba(12,24,30,0.78))', backdropFilter: 'blur(30px) saturate(170%)', WebkitBackdropFilter: 'blur(30px) saturate(170%)', boxShadow: `inset 0 0.5px 0 ${HAIR}`, transition: 'background-color .45s' }}>
      {modes.items.map((md, i) => {
        const on = i === modes.idx;
        return (
          <button key={md.label} className="btn" onClick={md.onClick} aria-current={on ? 'page' : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: on ? 'var(--acc, oklch(0.82 0.1 190))' : T3, transition: 'color .25s' }}>
            <Icon src={md.icon} size={dk.glove ? 26 : 24} />
            <span style={{ fontSize: dk.glove ? 12 : 11, lineHeight: '13px', fontWeight: on ? 700 : 600 }}>{md.label}</span>
          </button>
        );
      })}
    </nav>
    </>
  );
}
