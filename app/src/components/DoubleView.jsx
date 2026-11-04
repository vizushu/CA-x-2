// CA Double screen. Progressive disclosure: every card face shows ≤3 data points (label · primary metric · status badge);
// the verdict, score breakdown, stage details and timestamps live in expandable detail drawers. The Surf first /
// Snow first control is a primary action, so it is pinned in the bottom thumb zone (OrderBar), not in the scroll.
import React from 'react';
import { Card, HAIR, TAP, Icon, LoadoutCard, OfflineBanner, SectionTitle, SourcesCard, T3, FILL } from './ui.jsx';

function Ring({ dash, score }) {
  return (
    <div style={{ position: 'relative', flex: 'none', width: 96, height: 96 }}>
      <svg width="96" height="96" style={{ position: 'absolute', left: 0, top: 0, transform: 'rotate(-90deg)' }} aria-hidden="true">
        <defs>
          <linearGradient id="lnHorizon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'oklch(0.84 0.12 195)' }} />
            <stop offset="1" style={{ stopColor: 'oklch(0.92 0.015 255)' }} />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="42" style={{ fill: 'none', stroke: HAIR, strokeWidth: 6 }} />
        <circle cx="48" cy="48" r="42" style={{ fill: 'none', stroke: 'url(#lnHorizon)', strokeWidth: 6, strokeLinecap: 'round', strokeDasharray: 263.9, strokeDashoffset: +dash, transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="tnum" style={{ fontSize: 34, lineHeight: '36px', fontWeight: 650, letterSpacing: '-0.03em' }}>{score}</div>
        <div style={{ fontSize: 10, lineHeight: '12px', color: T3 }}>/ 100</div>
      </div>
    </div>
  );
}

/** Surf first / Snow first, pinned just above the dock handle (bottom thumb zone). Hidden while the dock panel is open. */
export function OrderBar({ dbl, ic, setOrder, bottom, show }) {
  return (
    <div role="group" aria-label="Plan order" style={{ position: 'absolute', left: 12, right: 12, bottom, zIndex: 19, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, borderRadius: 20, background: 'var(--glass, rgba(12,24,30,0.78))', backdropFilter: 'blur(30px) saturate(170%)', WebkitBackdropFilter: 'blur(30px) saturate(170%)', boxShadow: `inset 0 0 0 0.5px ${HAIR}, 0 8px 24px rgba(0,0,0,0.25)`, opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(8px)', pointerEvents: show ? 'auto' : 'none', transition: 'opacity .25s, transform .25s' }}>
      {[['surf', 'Surf first', ic.waves, dbl.oSurfBg, dbl.oSurfFg], ['snow', 'Snow first', ic.snow, dbl.oSnowBg, dbl.oSnowFg]].map(([id, label, icon, bg, fg]) => (
        <button key={id} type="button" className="btn" onClick={() => setOrder(id)} aria-pressed={bg !== 'transparent'} style={{ height: TAP, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: bg, color: fg, fontSize: 15, fontWeight: 650, transition: 'background .2s, color .2s' }}>
          <Icon src={icon} size={16} />{label}
        </button>
      ))}
    </div>
  );
}

export default function DoubleView({ v, dbl, ic, openDrawer, refresh }) {
  const parts = dbl.parts.map(pt => ({ k: pt.label, v: pt.score + ' / 100', sub: 'Weight ' + pt.weight, color: pt.color }));
  return (
    <>
      <OfflineBanner show={v.offline} text={v.offlineTxt} icon={ic.cloudOff} />

      <Card hero label={dbl.route} value={dbl.score} badge={{ text: dbl.label, bg: dbl.labelBg, fg: dbl.labelFg }} mt={0}
        valueNode={<Ring dash={dbl.dash} score={dbl.score} />}
        rows={[{ k: 'Verdict', v: dbl.verdict }, { k: 'Why', v: dbl.insight }, { k: 'Day', v: 'California Double · ' + v.dayWord }, { k: 'Surf first', v: dbl.surfScore + ' / 100' }, { k: 'Snow first', v: dbl.snowScore + ' / 100' }].concat(parts)} />

      <SectionTitle>The plan</SectionTitle>
      {dbl.stages.map((sg, i) => (
        <Card key={sg.kind} label={sg.kind} value={sg.t0 + '–' + sg.t1} badge={sg.showTag ? { text: sg.tag } : null} mt={i ? 10 : 12}
          icon={{ src: sg.icon, bg: sg.nodeBg, fg: sg.nodeFg }} tint={sg.bg !== 'transparent' ? sg.bg : FILL} dim={sg.op < 1}
          rows={[{ k: 'Plan', v: sg.title, sub: sg.sub }, { k: 'Details', v: sg.chips.map(ch => ch.text).join(' · ') }]} />
      ))}

      <LoadoutCard label="Loadout for both" text={dbl.teaser} onOpen={openDrawer} mt={22} />
      <SourcesCard v={v} footnote={dbl.footnote} refresh={refresh} />
    </>
  );
}
