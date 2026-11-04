// Surf screen. Progressive disclosure: every card face shows ≤3 data points (label · primary metric · status badge);
// secondary metadata, timestamps and controls live in each card's expandable detail drawer.
import React from 'react';
import { Card, HAIR, FILL, LoadoutCard, MONO, OfflineBanner, SectionTitle, SourcesCard, T1, T2, T3, WindowCard } from './ui.jsx';

const CHART_W = 390, FIT = 358 / CHART_W; // chart is drawn on a 390 grid, shown inside a 358-wide drawer

function TideChart({ tide }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, boxShadow: `inset 0 0.5px 0 ${HAIR}` }}>
      <div style={{ height: Math.round(132 * FIT), overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: CHART_W, height: 132, transform: `scale(${FIT})`, transformOrigin: '0 0' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 104, width: +tide.darkW, background: `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 6px)` }} />
          <svg width={CHART_W} height="104" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden="true">
            <path d={tide.area} style={{ fill: FILL }} />
            <path d={tide.line} style={{ fill: 'none', stroke: T2, strokeWidth: 1.5 }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, height: 104, width: 0, left: +tide.nowX, borderLeft: `1px dashed ${T3}` }} />
          <div style={{ position: 'absolute', top: 0, height: 104, width: 1.5, left: +tide.selX, background: T1, transition: 'left .3s cubic-bezier(.2,.8,.2,1)' }} />
          <div style={{ position: 'absolute', width: 10, height: 10, margin: '-5px 0 0 -5px', borderRadius: 5, background: T1, boxShadow: '0 0 0 3px var(--bg, #080D14)', left: +tide.sx, top: +tide.sy, transition: 'left .3s cubic-bezier(.2,.8,.2,1), top .3s cubic-bezier(.2,.8,.2,1)' }} />
          {tide.ex.map(e => (
            <div key={e.time + e.kind} style={{ position: 'absolute', width: 64, textAlign: 'center', lineHeight: '12px', left: +e.x, top: +e.y }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{e.kind} {e.h}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: T3, marginTop: 1 }}>{e.time}</div>
            </div>
          ))}
          {tide.hours.map(h => (
            <div key={h.label} style={{ position: 'absolute', top: 116, width: 32, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: T3, left: +h.x }}>{h.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SurfView({ v, S, ic, openDrawer, refresh }) {
  const [swell, wind, tide] = S.why.rows;
  return (
    <>
      <OfflineBanner show={v.offline} text={v.offlineTxt} icon={ic.cloudOff} />

      <Card hero label={S.name} value={S.range} unit="ft" badge={{ text: S.pill, bg: S.pillBg, fg: S.pillFg }} mt={0}
        rows={[{ k: 'As of', v: S.eyebrow }, { k: 'Feel', v: S.words }, { k: 'Break', v: S.area }]} />

      <SectionTitle>{S.why.lead} <span style={{ color: S.why.color }}>{S.why.word}</span></SectionTitle>
      <Card label="Swell" value={S.swellKj} unit="kJ" badge={{ text: S.swellTag, bg: S.swellBg, fg: S.swellCol }} mt={12}
        rows={[{ k: 'Train', v: swell.head, sub: swell.detail }]} />
      <Card label="Wind" value={S.windK} unit="kt" badge={{ text: S.windCat, bg: S.windBg, fg: S.windColor }}
        rows={[{ k: 'Gusts · from', v: S.windDetail }, { k: 'Outlook', v: wind.head, sub: wind.detail }]} />
      <Card label="Tide" value={S.tideNum} unit="ft" badge={{ text: S.tideTrend, bg: S.tideBg, fg: S.tideCol }}
        rows={[{ k: 'Next', v: S.tideDetail || 'No more turns before dark' }, { k: 'Sweet spot', v: tide.detail }, { k: 'As of', v: S.tide.readout }]}>
        <TideChart tide={S.tide} />
      </Card>

      <WindowCard win={S.win} />
      <LoadoutCard text={S.teaser} onOpen={openDrawer} mt={10} />
      <SourcesCard v={v} footnote={S.footnote} refresh={refresh} />
    </>
  );
}
