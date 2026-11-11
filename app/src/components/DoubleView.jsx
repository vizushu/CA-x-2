// California Double. DoubleTop sits right under the verdict (surf-first / snow-first switch and the score breakdown);
// DoublePlan is the timeline of stages below the cam.
import React from 'react';
import { HAIR, FILL, FILL2, Icon, Label, SectionTitle, T2, T3, T1, BG, DUR } from './ui.jsx';

export function DoubleTop({ dbl, ic }) {
  const o = dbl.order;
  return (
    <>
      <div role="group" aria-label="Plan order" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 4, padding: 4, marginTop: 14, borderRadius: 16, background: FILL }}>
        {[[o.setSurf, o.surfBg, o.surfFg, ic.waves, 'Surf first', o.surfScore], [o.setSnow, o.snowBg, o.snowFg, ic.snow, 'Snow first', o.snowScore]].map(([on, bg, fg, icon, label, score]) => (
          <button key={label} type="button" className="btn" aria-pressed={bg !== 'transparent'} onClick={on} style={{ height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: bg, color: fg, fontSize: 14, fontWeight: 600, transition: `background-color ${DUR}, color ${DUR}` }}>
            <Icon src={icon} size={16} />{label}<span className="tnum" style={{ opacity: 0.75 }}>{score}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginTop: 14, padding: '12px 0', borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
        {dbl.parts.map(pt => (
          <div key={pt.label} style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 4 }}>
              <Label>{pt.label}</Label>
              <span className="tnum" style={{ fontSize: 15, fontWeight: 600 }}>{pt.score}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, marginTop: 6, overflow: 'hidden', background: FILL2 }}>
              <div style={{ height: '100%', borderRadius: 3, width: pt.pct + '%', background: pt.color, transition: `width ${DUR}, background-color ${DUR}` }} />
            </div>
            <div style={{ fontSize: 11, lineHeight: '14px', color: T3, marginTop: 4 }}>weight {pt.weight}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function DoublePlan({ dbl }) {
  return (
    <section data-screen-label="CA Double" aria-label="The plan" style={{ marginTop: 30 }}>
      <SectionTitle>The plan</SectionTitle>
      <div style={{ position: 'relative', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ position: 'absolute', left: 75, top: 28, bottom: 28, width: 2, borderRadius: 1, background: dbl.spine }} />
        {dbl.stages.map(sg => (
          <div key={sg.kind} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '52px 28px minmax(0,1fr)', gap: '0 10px', padding: '12px 10px 12px 8px', margin: '0 -8px', borderRadius: 16, background: sg.bg, opacity: sg.op, transition: `background-color ${DUR}, opacity ${DUR}` }}>
            <div style={{ textAlign: 'right', paddingTop: 3 }}>
              <div className="tnum" style={{ fontSize: 14, lineHeight: '18px', fontWeight: 600 }}>{sg.t0}</div>
              <div className="tnum" style={{ fontSize: 11, lineHeight: '14px', color: T3 }}>{sg.t1}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sg.nodeBg, color: sg.nodeFg, boxShadow: '0 0 0 4px var(--bg, #FBFAF7)' }}><Icon src={sg.icon} size={15} /></span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Label>{sg.kind}</Label>
                {sg.showTag && <span style={{ height: 18, padding: '0 7px', borderRadius: 9, display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: T1, color: BG }}>{sg.tag}</span>}
              </div>
              <div style={{ fontSize: 16, lineHeight: '21px', fontWeight: 600, marginTop: 2 }}>{sg.title}</div>
              <div style={{ fontSize: 12, lineHeight: '16px', color: T2, marginTop: 1 }}>{sg.sub}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {sg.chips.map(ch => <span key={ch.text} className="nw" style={{ height: 24, padding: '0 9px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, background: ch.bg, color: ch.fg }}>{ch.text}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pretty" style={{ fontSize: 13, lineHeight: '19px', color: T2, marginTop: 14 }}>{dbl.insight}</div>
    </section>
  );
}
