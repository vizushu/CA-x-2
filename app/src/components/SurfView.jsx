import React from 'react';
import { Arrow, Cap, Dot, FILL, Footer, HAIR, LoadoutTeaser, OfflineBanner, RatingPill, T1, T2, T3, WindowCard, MONO } from './ui.jsx';

export default function SurfView({ v, S, ic, openDrawer, openSettings }) {
  return (
    <>
      <OfflineBanner show={v.offline} text={v.offlineTxt} icon={ic.cloudOff} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Cap size={11} color={T2} style={{ display: 'block', lineHeight: '14px' }}><span className="ell" style={{ display: 'block' }}>{S.eyebrow}</span></Cap>
          <div style={{ fontSize: 28, lineHeight: '34px', fontWeight: 650, letterSpacing: '-0.02em', marginTop: 4 }}>{S.name}</div>
          <div style={{ fontSize: 13, lineHeight: '18px', color: T3 }}>{S.area}</div>
        </div>
        <RatingPill label={S.pill} bg={S.pillBg} fg={S.pillFg} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="tnum" style={{ fontSize: 72, lineHeight: '76px', fontWeight: 600, letterSpacing: '-0.045em' }}>{S.range}</span>
          <span style={{ fontSize: 24, fontWeight: 500, color: T2 }}>ft</span>
        </div>
        <div style={{ textAlign: 'right', paddingBottom: 10 }}>
          <div className="tnum" style={{ fontSize: 22, lineHeight: '26px', fontWeight: 600 }}>{S.kj}<span style={{ fontSize: 13, fontWeight: 500, color: T2, marginLeft: 3 }}>kJ</span></div>
          <Cap style={{ display: 'block', color: T3, marginTop: 2 }}>Swell energy</Cap>
        </div>
      </div>
      <div style={{ fontSize: 15, lineHeight: '20px', color: T2 }}>{S.words}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12, marginTop: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
          <div style={{ position: 'relative', flex: 'none', width: 44, height: 44, borderRadius: 14, background: FILL, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 11, background: FILL, borderTop: `1px dashed ${T3}` }} />
            <Arrow rot={S.windRot} color={S.windColor} style={{ left: 10, top: 7, transition: 'transform .35s cubic-bezier(.2,.8,.2,1)' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="ell" style={{ fontSize: 16, lineHeight: '21px', fontWeight: 600, color: S.windColor }}>{S.windCat}</div>
            <div className="ell" style={{ fontSize: 12, lineHeight: '16px', color: T2 }}>{S.windDetail}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <div style={{ flex: 'none', width: 56, height: 44, borderRadius: 14, background: FILL }}>
            <svg width="56" height="44" style={{ display: 'block' }} aria-hidden="true">
              <path d={S.sArea} style={{ fill: FILL }} />
              <path d={S.sLine} style={{ fill: 'none', stroke: T2, strokeWidth: 1.25 }} />
              <circle cx={S.sdx} cy={S.sdy} r="3" style={{ fill: T1 }} />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="nw" style={{ fontSize: 16, lineHeight: '21px', fontWeight: 600 }}>{S.tideH} <span style={{ color: S.tideCol }}>{S.tideTrend}</span></div>
            <div className="ell" style={{ fontSize: 12, lineHeight: '16px', color: T2 }}>{S.tideDetail}</div>
          </div>
        </div>
      </div>

      <WindowCard win={S.win} chevron={ic.chevRight} />
      <LoadoutTeaser text={S.teaser} onClick={openDrawer} ic={ic} />

      <div style={{ marginTop: 34 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 20, lineHeight: '26px', fontWeight: 650 }}>{S.why.lead} <span style={{ color: S.why.color }}>{S.why.word}</span></div>
          <div className="nw" style={{ fontSize: 12, color: T3 }}>{S.why.at}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
          {S.why.rows.map(w => (
            <div key={w.label} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: 12, alignItems: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}><Dot color={w.dot} /><Cap size={11}>{w.label}</Cap></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, lineHeight: '20px', fontWeight: 600 }}>{w.head}</div>
                <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 2 }}>{w.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 34 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 20, lineHeight: '26px', fontWeight: 650 }}>Tide</div>
          <div className="nw" style={{ fontSize: 12, color: T2 }}>{S.tide.readout}</div>
        </div>
        <div style={{ position: 'relative', height: 132, marginTop: 12 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 104, width: +S.tide.darkW, background: `repeating-linear-gradient(135deg, ${HAIR} 0 1px, transparent 1px 6px)` }} />
          <svg width="390" height="104" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden="true">
            <path d={S.tide.area} style={{ fill: FILL }} />
            <path d={S.tide.line} style={{ fill: 'none', stroke: T2, strokeWidth: 1.5 }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, height: 104, width: 0, left: +S.tide.nowX, borderLeft: `1px dashed ${T3}` }} />
          <div style={{ position: 'absolute', top: 0, height: 104, width: 1.5, left: +S.tide.selX, background: T1, transition: 'left .3s cubic-bezier(.2,.8,.2,1)' }} />
          <div style={{ position: 'absolute', width: 10, height: 10, margin: '-5px 0 0 -5px', borderRadius: 5, background: T1, boxShadow: '0 0 0 3px var(--bg, #080D14)', left: +S.tide.sx, top: +S.tide.sy, transition: 'left .3s cubic-bezier(.2,.8,.2,1), top .3s cubic-bezier(.2,.8,.2,1)' }} />
          {S.tide.ex.map(e => (
            <div key={e.time + e.kind} style={{ position: 'absolute', width: 64, textAlign: 'center', lineHeight: '12px', left: +e.x, top: +e.y }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{e.kind} {e.h}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: T3, marginTop: 1 }}>{e.time}</div>
            </div>
          ))}
          {S.tide.hours.map(h => (
            <div key={h.label} style={{ position: 'absolute', top: 116, width: 32, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: T3, left: +h.x }}>{h.label}</div>
          ))}
        </div>
      </div>

      <Footer footnote={S.footnote} ic={ic} onSettings={openSettings} summary={v.srcSummary} />
    </>
  );
}
