// Glass dock: grab row, loadout drawer, readout strip, scrubber, location pills and mode switch.
import React from 'react';
import { Arrow, Cap, Dot, FILL, HAIR, Icon, MONO, T1, T2, T3 } from './ui.jsx';

const HATCH = `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 5px)`;

export default function Dock({ v, ic, bump, h }) {
  const { dk, drawer, strip, sc, pills, modes } = v;
  return (
    <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8, height: `calc(${dk.base}px + ${dk.exp}px * var(--sheet, 0))`, zIndex: 20, boxSizing: 'border-box', padding: '0 12px 12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '30px 30px 40px 40px', background: 'var(--glass, rgba(12,24,30,0.78))', backdropFilter: 'blur(30px) saturate(170%)', WebkitBackdropFilter: 'blur(30px) saturate(170%)', boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.18), inset 0 0 0 0.5px ${HAIR}, 0 -12px 40px rgba(0,0,0,0.3)`, color: T1, transition: 'background-color .45s, color .45s' }}>
      {/* Grab row */}
      <div onPointerDown={h.sheetDown} onPointerMove={h.sheetMove} onPointerUp={h.sheetUp} onPointerCancel={h.sheetUp} role="button" aria-label="Loadout drawer" aria-expanded={v.sheetOpen} style={{ flex: 'none', position: 'relative', height: 24, margin: '0 -12px', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', cursor: 'grab' }}>
        {dk.glove && (
          <div style={{ position: 'absolute', left: 18, top: 0, height: 24, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: T2 }}>
            <Icon src={ic.hand} size={14} />Glove mode
          </div>
        )}
        <div style={{ width: 36, height: 5, borderRadius: 3, background: 'var(--grab, rgba(238,244,246,0.3))' }} />
        <div style={{ position: 'absolute', right: 18, top: 0, height: 24, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: T2 }}>
          Loadout<Icon src={ic.chevUp} size={15} style={{ transform: 'rotate(calc(180deg * var(--sheet, 0)))' }} />
        </div>
      </div>

      {/* Loadout drawer */}
      <div className="noscroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 4px 8px', opacity: 'calc(var(--sheet, 0) * 1.4 - 0.25)' }}>
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

      {/* Mode switch */}
      <div role="tablist" aria-label="Mode" style={{ flex: 'none', position: 'relative', height: dk.modes, marginTop: 6, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', borderRadius: dk.modesR, background: FILL }}>
        <div style={{ position: 'absolute', top: 4, bottom: 4, left: `calc(${modes.idx} * 33.333% + 4px)`, width: 'calc(33.333% - 8px)', borderRadius: dk.modesR2, background: 'var(--accbg, oklch(0.8 0.1 190))', boxShadow: '0 4px 14px rgba(0,0,0,0.22)', transition: 'left .38s cubic-bezier(.3,1.3,.4,1)' }} />
        {modes.items.map((md, i) => (
          <button key={md.label} role="tab" aria-selected={i === modes.idx} className="btn" onClick={md.onClick} style={{ background: 'transparent', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: md.fg, fontSize: dk.modeFs, fontWeight: 650, transition: 'color .25s' }}>
            <Icon src={md.icon} size={19} />{md.label}
          </button>
        ))}
      </div>
    </div>
  );
}
