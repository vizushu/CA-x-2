import React from 'react';
import { Cap, Footer, HAIR, Icon, LoadoutTeaser, OfflineBanner, T1, T2, T3, FILL } from './ui.jsx';

export default function DoubleView({ v, dbl, ic, openDrawer, setOrder }) {
  return (
    <>
      <OfflineBanner show={v.offline} text={v.offlineTxt} icon={ic.cloudOff} />
      <Cap size={11} color={T2} style={{ display: 'block', lineHeight: '14px' }}>California Double · {v.dayWord}</Cap>
      <div className="pretty" style={{ fontSize: 24, lineHeight: '30px', fontWeight: 650, letterSpacing: '-0.02em', marginTop: 4 }}>{dbl.route}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
        <div style={{ position: 'relative', flex: 'none', width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ position: 'absolute', left: 0, top: 0, transform: 'rotate(-90deg)' }} aria-hidden="true">
            <defs>
              <linearGradient id="lnHorizon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" style={{ stopColor: 'oklch(0.8 0.1 190)' }} />
                <stop offset="1" style={{ stopColor: 'oklch(0.93 0.03 240)' }} />
              </linearGradient>
            </defs>
            <circle cx="48" cy="48" r="42" style={{ fill: 'none', stroke: HAIR, strokeWidth: 6 }} />
            <circle cx="48" cy="48" r="42" style={{ fill: 'none', stroke: 'url(#lnHorizon)', strokeWidth: 6, strokeLinecap: 'round', strokeDasharray: 263.9, strokeDashoffset: +dbl.dash, transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="tnum" style={{ fontSize: 34, lineHeight: '36px', fontWeight: 650, letterSpacing: '-0.03em' }}>{dbl.score}</div>
            <div style={{ fontSize: 10, lineHeight: '12px', color: T3 }}>/ 100</div>
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 13, background: dbl.labelBg, color: dbl.labelFg, fontSize: 12, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: dbl.labelFg }} />{dbl.label}
          </span>
          <div className="pretty" style={{ fontSize: 16, lineHeight: '22px', fontWeight: 600, marginTop: 8 }}>{dbl.verdict}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, marginTop: 18, borderRadius: 18, background: FILL }}>
        {[['surf', 'Surf first', ic.waves, dbl.surfScore, dbl.oSurfBg, dbl.oSurfFg], ['snow', 'Snow first', ic.snow, dbl.snowScore, dbl.oSnowBg, dbl.oSnowFg]].map(([id, label, icon, score, bg, fg]) => (
          <button key={id} className="btn" onClick={() => setOrder(id)} aria-pressed={bg !== 'transparent'} style={{ height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: bg, color: fg, fontSize: 14, fontWeight: 650, transition: 'background .2s, color .2s' }}>
            <Icon src={icon} size={16} />{label}<span className="tnum" style={{ opacity: 0.7 }}>{score}</span>
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ position: 'absolute', left: 79, top: 28, bottom: 28, width: 2, borderRadius: 1, background: dbl.spine, opacity: 0.6 }} />
        {dbl.stages.map(sg => (
          <div key={sg.kind} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '56px 28px minmax(0,1fr)', gap: '0 10px', padding: '12px 10px 12px 8px', margin: '0 -8px', borderRadius: 18, background: sg.bg, opacity: sg.op, transition: 'background .25s, opacity .25s' }}>
            <div style={{ textAlign: 'right', paddingTop: 2 }}>
              <div className="tnum" style={{ fontSize: 14, lineHeight: '18px', fontWeight: 650 }}>{sg.t0}</div>
              <div className="tnum" style={{ fontSize: 11, lineHeight: '14px', color: T3 }}>{sg.t1}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sg.nodeBg, color: sg.nodeFg, boxShadow: '0 0 0 4px var(--bg, #09141A)' }}>
                <Icon src={sg.icon} size={15} />
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cap>{sg.kind}</Cap>
                {sg.showTag && <span style={{ height: 18, padding: '0 7px', borderRadius: 9, display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: T1, color: 'var(--bg, #09141A)' }}>{sg.tag}</span>}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginTop: 22 }}>
        {dbl.parts.map(pt => (
          <div key={pt.label} style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 4 }}>
              <Cap ls=".05em">{pt.label}</Cap>
              <span className="tnum" style={{ fontSize: 15, fontWeight: 650 }}>{pt.score}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden', background: HAIR }}>
              <div style={{ height: '100%', borderRadius: 2, width: pt.pct + '%', background: pt.color, transition: 'width .5s' }} />
            </div>
            <div style={{ fontSize: 10, lineHeight: '14px', color: T3, marginTop: 4 }}>weight {pt.weight}</div>
          </div>
        ))}
      </div>
      <div className="pretty" style={{ fontSize: 13, lineHeight: '19px', color: T2, marginTop: 16 }}>{dbl.insight}</div>
      <LoadoutTeaser label="Loadout for both" text={dbl.teaser} onClick={openDrawer} ic={ic} mt={16} />
      <Footer footnote={dbl.footnote} ic={ic} />
    </>
  );
}
