// Surf sections below the cam and the best-window card: why it's rated this way, and the tide curve.
import React from 'react';
import { HAIR, FILL, Label, SectionTitle, T1, T2, T3, DUR, ACC } from './ui.jsx';

export default function SurfView({ surf }) {
  return (
    <>
      <section data-screen-label="Surf" aria-label="Why" style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <SectionTitle>{surf.why.lead} <span style={{ color: surf.why.color }}>{surf.why.word}</span></SectionTitle>
          <div className="nw" style={{ fontSize: 12, color: T3 }}>{surf.why.at}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
          {surf.why.rows.map(w => (
            <div key={w.label} style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: 12, alignItems: 'start', padding: '12px 0', borderBottom: `1px solid ${HAIR}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 3 }}>
                <span style={{ flex: 'none', width: 10, height: 10, borderRadius: 5, background: w.dot, transition: `background-color ${DUR}` }} />
                <Label>{w.label}</Label>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, lineHeight: '20px', fontWeight: 600 }}>{w.head}</div>
                <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 2 }}>{w.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Tide" style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <SectionTitle>Tide</SectionTitle>
          <div className="nw tnum" style={{ fontSize: 12, color: T2 }}>{surf.tide.readout}</div>
        </div>
        <div style={{ position: 'relative', height: 132, marginTop: 12 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 104, width: +surf.tide.darkW, background: `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 6px)` }} />
          <svg width="390" height="104" role="img" aria-label="Tide height through the day" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            <path d={surf.tide.area} style={{ fill: FILL }} />
            <path d={surf.tide.line} style={{ fill: 'none', stroke: T2, strokeWidth: 1.5 }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, height: 104, width: 0, left: +surf.tide.nowX, borderLeft: `1px dashed ${ACC}` }} />
          <div style={{ position: 'absolute', top: 0, height: 104, width: 2, left: +surf.tide.selX, background: T1, transition: `left ${DUR} cubic-bezier(.2,.8,.2,1)` }} />
          <div style={{ position: 'absolute', width: 12, height: 12, margin: '-6px 0 0 -6px', borderRadius: 6, background: T1, boxShadow: '0 0 0 3px var(--bg, #FBFAF7)', left: +surf.tide.sx, top: +surf.tide.sy, transition: `left ${DUR} cubic-bezier(.2,.8,.2,1), top ${DUR} cubic-bezier(.2,.8,.2,1)` }} />
          {surf.tide.ex.map(e => (
            <div key={e.time + e.kind} style={{ position: 'absolute', width: 64, textAlign: 'center', lineHeight: '13px', left: +e.x, top: +e.y }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{e.kind} {e.h}</div>
              <div className="tnum" style={{ fontSize: 11, color: T3, marginTop: 1 }}>{e.time}</div>
            </div>
          ))}
          {surf.tide.hours.map(h => (
            <div key={h.label} className="tnum" style={{ position: 'absolute', top: 116, width: 32, textAlign: 'center', fontSize: 11, color: T3, left: +h.x }}>{h.label}</div>
          ))}
        </div>
      </section>
    </>
  );
}
