import React from 'react';
import { Arrow, Cap, FILL, Footer, HAIR, LoadoutTeaser, OfflineBanner, RatingPill, T2, T3, WindowCard } from './ui.jsx';

export default function SnowView({ v, sn, ic, openDrawer }) {
  return (
    <>
      <OfflineBanner show={v.offline || !!v.staleTxt} text={v.offline ? v.offlineTxt : v.staleTxt} icon={ic.cloudOff} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {sn.eyebrow && <Cap size={11} color={T2} style={{ display: 'block', lineHeight: '14px', marginBottom: 4 }}><span className="ell" style={{ display: 'block' }}>{sn.eyebrow}</span></Cap>}
          <div style={{ fontSize: 28, lineHeight: '34px', fontWeight: 650, letterSpacing: '-0.02em' }}>{sn.name}</div>
          <div style={{ fontSize: 13, lineHeight: '18px', color: T3 }}>{sn.area}</div>
        </div>
        <RatingPill label={sn.pill} bg={sn.pillBg} fg={sn.pillFg} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="tnum" style={{ fontSize: 72, lineHeight: '76px', fontWeight: 600, letterSpacing: '-0.045em' }}>{sn.fresh}″</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: T2 }}>fresh · 24 h</span>
        </div>
        <div style={{ display: 'flex', gap: 16, paddingBottom: 10, textAlign: 'right' }}>
          {[[sn.fresh48, '48 h'], [sn.depth, 'Base']].map(([val, label]) => (
            <div key={label}>
              <div className="tnum" style={{ fontSize: 20, lineHeight: '24px', fontWeight: 600 }}>{val}</div>
              <Cap style={{ display: 'block' }}>{label}</Cap>
            </div>
          ))}
        </div>
      </div>
      <div className="pretty" style={{ fontSize: 15, lineHeight: '20px', color: T2 }}>{sn.words}</div>

      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 17, lineHeight: '22px', fontWeight: 650 }}>By elevation</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6 }}>
          {sn.ladder.map(lv => (
            <div key={lv.label} style={{ display: 'grid', gridTemplateColumns: '84px 44px minmax(0,1fr) auto', gap: 10, alignItems: 'center', minHeight: 58, boxShadow: `inset 0 0.5px 0 ${HAIR}` }}>
              <div>
                <Cap style={{ display: 'block' }}>{lv.label}</Cap>
                <div className="tnum" style={{ fontSize: 14, lineHeight: '19px', fontWeight: 600 }}>{lv.elev}</div>
              </div>
              <div className="tnum" style={{ fontSize: 20, lineHeight: '24px', fontWeight: 600 }}>{lv.temp}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ position: 'relative', flex: 'none', width: 30, height: 30, borderRadius: 15, background: FILL }}>
                  <div style={{ position: 'absolute', left: 14, top: 2, width: 2, height: 3, borderRadius: 1, background: T3 }} />
                  <Arrow size={18} w={2} rot={lv.rot} color={lv.wcol} style={{ left: 6, top: 6 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, lineHeight: '19px', fontWeight: 600, color: lv.wcol }}>{lv.wind}</div>
                  <div className="nw" style={{ fontSize: 11, lineHeight: '14px', color: T3 }}>{lv.gust}</div>
                </div>
              </div>
              <span className="nw" style={{ height: 26, padding: '0 10px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 650, background: lv.chipBg, color: lv.chipFg }}>{lv.chip}</span>
            </div>
          ))}
        </div>
        <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 8 }}>{sn.lifts}</div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 17, lineHeight: '22px', fontWeight: 650 }}>Surface through the day</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sn.stepCols}, minmax(0,1fr))`, gap: 6, marginTop: 10 }}>
          {sn.steps.map(ss => (
            <div key={ss.label} style={{ minWidth: 0, padding: 10, borderRadius: 14, background: ss.bg, boxShadow: `inset 0 0 0 0.5px ${HAIR}`, transition: 'background .25s' }}>
              <div style={{ fontSize: 13, lineHeight: '17px', fontWeight: 650, color: ss.fg }}>{ss.label}</div>
              <div className="tnum" style={{ fontSize: 11, lineHeight: '15px', color: T3 }}>{ss.range}</div>
            </div>
          ))}
        </div>
      </div>

      <WindowCard win={sn.win} chevron={ic.chevRight} />
      <LoadoutTeaser text={sn.teaser} onClick={openDrawer} ic={ic} />
      <Footer footnote={sn.footnote} ic={ic} />
    </>
  );
}
