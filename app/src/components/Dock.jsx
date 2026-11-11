// Bottom dock: big time readout, the 5 AM–5 PM scrubber (bars colored by rating, line for tide/temp/elevation), hour labels,
// and the Surf | Double | Snow switch. The scrubber is the one control you drag; everything it shows is for that moment.
import React from 'react';
import { ACC, BG, DUR, FILL, HAIR, Icon, Label, T1, T2, T3 } from './ui.jsx';

const HATCH = `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 5px)`;

export default function Dock({ v, h, bump, padB }) {
  const { dk, sc, dock, tabs, ic } = v;
  return (
    <div data-screen-label="Dock" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20, boxSizing: 'border-box', padding: `8px 20px ${padB}`, background: BG, boxShadow: `0 -1px 0 ${HAIR}`, color: T1, transition: `background-color ${DUR}, color ${DUR}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span className="disp tnum nw" style={{ fontSize: 26, lineHeight: '28px', fontWeight: 700 }}>{dock.time}</span>
          <Label style={{ whiteSpace: "nowrap" }}>{dock.sub}</Label>
        </div>
        {dock.showNow && (
          <button type="button" className="btn" aria-label="Back to now" onClick={h.resetNow} style={{ height: 32, padding: '0 12px 0 10px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6, background: FILL, color: ACC, fontSize: 13, fontWeight: 600 }}>
            <Icon src={ic.now} size={14} />Now
          </button>
        )}
        {dk.glove && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: T3 }}><Icon src={ic.hand} size={14} />Glove mode</span>}
      </div>

      <div role="slider" aria-label="Forecast time, 5 AM to 5 PM" aria-valuemin={5} aria-valuemax={17} aria-valuenow={sc.valNow} aria-valuetext={dock.time} tabIndex={0}
        onKeyDown={h.scrubKey} onPointerDown={h.scrubDown} onPointerMove={h.scrubMove} onPointerUp={h.scrubUp} onPointerCancel={h.scrubUp}
        style={{ position: 'relative', height: dk.body, marginTop: 4, touchAction: 'none', cursor: 'ew-resize', borderRadius: 8 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: +sc.shL, borderRadius: '8px 0 0 8px', background: HATCH }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: +sc.shRx, width: +sc.shRw, borderRadius: '0 8px 8px 0', background: HATCH }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: +sc.bandX, width: +sc.bandW, display: sc.bandDisp, borderRadius: 8, background: sc.bandBg, transition: `left ${DUR}, width ${DUR}, background-color ${DUR}` }} />
        {sc.track.map((tk, i) => <div key={i} style={{ position: 'absolute', top: 0, height: 4, borderRadius: 2, left: +tk.x, width: +tk.w, background: tk.bg, transition: `left ${DUR}, width ${DUR}` }} />)}
        {sc.cols.map(c => <div key={c.x} style={{ position: 'absolute', bottom: 0, width: 16, left: +c.x, height: +c.h, borderRadius: '3px 3px 1px 1px', background: c.col, opacity: c.op, transition: `height ${DUR}, background-color ${DUR}` }} />)}
        <svg width="390" height={sc.V} aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}><path d={sc.line} style={{ fill: 'none', stroke: T2, strokeWidth: 1.5, opacity: 0.9 }} /></svg>
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: 0, left: +sc.nowX, borderLeft: `1.5px dashed ${ACC}` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: 0, pointerEvents: 'none', left: +sc.phX, transition: sc.phTrans }}>
          <div style={{ position: 'absolute', left: -1, top: 0, bottom: 0, width: 2, borderRadius: 1, background: T1 }} />
          <div style={{ position: 'absolute', left: -sc.knob / 2, top: sc.knobTop, width: sc.knob, height: sc.knob, borderRadius: '50%', background: T1, boxShadow: '0 0 0 3px var(--bg, #FBFAF7), 0 2px 8px rgba(0,0,0,0.25)', transform: `scale(${sc.knobScale})`, transition: `transform ${DUR} cubic-bezier(.2,.8,.2,1)` }}>
            {bump > 0 && <span key={'k' + bump} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid ' + T1, animation: 'detent 340ms ease-out forwards', pointerEvents: 'none' }} />}
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', height: dk.hours }}>
        {sc.hours.map(hh => <div key={hh.label} className="tnum" style={{ position: 'absolute', bottom: 0, width: 32, textAlign: 'center', left: +hh.x, fontSize: 11, lineHeight: '14px', color: T3 }}>{hh.label}</div>)}
      </div>

      <div style={{ position: 'relative', height: dk.tabs, marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', borderRadius: dk.tabsR, background: FILL }}>
        <div style={{ position: 'absolute', top: 3, bottom: 3, left: `calc(${tabs.idx} * 33.333% + 3px)`, width: 'calc(33.333% - 6px)', borderRadius: dk.tabsR2, background: T1, transition: `left ${DUR} cubic-bezier(.3,1.2,.4,1), background-color ${DUR}` }} />
        {tabs.items.map(md => (
          <button key={md.id} type="button" className="btn" aria-pressed={md.on} onClick={md.onClick}
            style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: md.fg, fontSize: 14, fontWeight: 600, transition: `color ${DUR}` }}>
            <Icon src={md.icon} size={18} />{md.label}
          </button>
        ))}
      </div>
    </div>
  );
}
