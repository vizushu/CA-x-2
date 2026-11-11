// Snow sections below the cam and the best-window card: conditions by elevation, and how the surface changes through the day.
import React from 'react';
import { HAIR, Label, SectionTitle, T2, T3, DUR } from './ui.jsx';

export default function SnowView({ snow }) {
  return (
    <>
      <section data-screen-label="Snow" aria-label="By elevation" style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <SectionTitle>By elevation</SectionTitle>
          <div style={{ fontSize: 12, color: T3 }}>{snow.at}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
          {snow.ladder.map(lv => (
            <div key={lv.label} style={{ display: 'grid', gridTemplateColumns: '84px 48px minmax(0,1fr) auto', gap: 10, alignItems: 'center', minHeight: 60, borderBottom: `1px solid ${HAIR}` }}>
              <div>
                <Label style={{ display: 'block' }}>{lv.label}</Label>
                <div className="tnum" style={{ fontSize: 14, lineHeight: '19px', fontWeight: 600 }}>{lv.elev}</div>
              </div>
              <div className="disp tnum" style={{ fontSize: 26, lineHeight: '26px', fontWeight: 600 }}>{lv.temp}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ position: 'relative', flex: 'none', width: 32, height: 32, borderRadius: 16, background: 'var(--fill, rgba(15,23,31,0.06))' }}>
                  <svg width="20" height="20" aria-hidden="true" style={{ position: 'absolute', left: 6, top: 6, transform: `rotate(${lv.rot}deg)`, color: lv.wcol }}>
                    <path d="M10 17V4M5.5 8.5L10 4l4.5 4.5" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, lineHeight: '19px', fontWeight: 600, color: lv.wcol }}>{lv.wind}</div>
                  <div className="nw" style={{ fontSize: 11, lineHeight: '14px', color: T3 }}>{lv.gust}</div>
                </div>
              </div>
              <span className="nw" style={{ height: 26, padding: '0 10px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, background: lv.chipBg, color: lv.chipFg }}>{lv.chip}</span>
            </div>
          ))}
        </div>
        <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 10 }}>{snow.lifts}</div>
      </section>

      <section aria-label="Surface through the day" style={{ marginTop: 30 }}>
        <SectionTitle>Surface through the day</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${snow.stepCols}, minmax(0,1fr))`, gap: 8, marginTop: 10 }}>
          {snow.steps.map(ss => (
            <div key={ss.label} style={{ minWidth: 0, padding: '10px 12px', borderRadius: 12, background: ss.bg, boxShadow: `inset 0 0 0 1px ${ss.ring}`, transition: `background-color ${DUR}` }}>
              <div style={{ fontSize: 14, lineHeight: '18px', fontWeight: 600, color: ss.fg }}>{ss.label}</div>
              <div className="tnum" style={{ fontSize: 11, lineHeight: '15px', color: T3 }}>{ss.range}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
