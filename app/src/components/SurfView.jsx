// Surf screen, top to bottom:
//   1. Spot header: name + rating, area · facing · water temp, and an external cam link when the spot has no
//      embeddable stream (the cam box collapses in that case; see App).
//   2. Hero: wave range + feel, swell energy.
//   3. Forward-looking window: today's best window if it's still ahead, otherwise tomorrow's, with today's closed
//      window demoted to one line.
//   4. Current conditions: one row each for swell, wind, tide (reading · direction/next · local takeaway).
// No "now" timestamps: the data is live unless the stale-data banner says otherwise.
import React from 'react';
import { Cap, Dot, FILL, Footer, HAIR, Icon, LoadoutTeaser, OfflineBanner, T1, T2, T3 } from './ui.jsx';

function CamLink({ link, icon }) {
  if (!link) return null;
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={'Open ' + link.label + ' (external site)'}
      style={{ flex: 'none', minHeight: 50, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 12px', borderRadius: 12, background: FILL, boxShadow: `inset 0 0 0 0.5px ${HAIR}`, color: T2, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
      <span className="nw">{link.label}</span><Icon src={icon} size={14} color={T3} />
    </a>
  );
}

function NextWindow({ next, chev }) {
  const m = next.main;
  return (
    <section style={{ marginTop: 22, padding: 16, borderRadius: 18, background: m.bg, boxShadow: `inset 0 0 0 1px ${m.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cap size={11} color={m.fg} style={{ lineHeight: '14px' }}>{m.caption}</Cap>
            {m.status && <span className="nw" style={{ fontSize: 11, lineHeight: '14px', fontWeight: 650, color: m.fg }}>· {m.status}</span>}
          </div>
          <div className="tnum pretty" style={{ fontSize: 19, lineHeight: '25px', fontWeight: 700, marginTop: 3 }}>{m.range}</div>
          <div className="pretty" style={{ fontSize: 13, lineHeight: '18px', color: T2, marginTop: 1 }}>{m.detail}</div>
        </div>
        {m.cta && (
          <button type="button" className="btn" onClick={m.onClick} style={{ flex: 'none', minHeight: 50, padding: '0 8px 0 14px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 2, background: 'var(--chip, rgba(238,243,246,0.12))', color: m.fg, fontSize: 13, fontWeight: 650 }}>
            {m.cta}<Icon src={chev} size={16} />
          </button>
        )}
      </div>
      {next.past && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, paddingTop: 4, boxShadow: `inset 0 0.5px 0 ${HAIR}` }}>
          <span className="pretty" style={{ fontSize: 12.5, lineHeight: '17px', color: T2 }}>{next.past.text}</span>
          <button type="button" className="btn" onClick={next.past.onClick} style={{ flex: 'none', minHeight: 50, padding: '0 4px', fontSize: 12.5, fontWeight: 600, color: T1, textDecoration: 'underline', textUnderlineOffset: 4 }}>Review morning</button>
        </div>
      )}
    </section>
  );
}

function Conditions({ cond }) {
  return (
    <section style={{ marginTop: 26 }}>
      <h2 style={{ margin: '0 4px', fontFamily: 'inherit' }}>
        <Cap size={11} color={T3} ls=".08em">{cond.title}<span style={{ color: cond.color }}>{cond.word}</span></Cap>
      </h2>
      <div style={{ marginTop: 10, borderRadius: 18, background: FILL, boxShadow: `inset 0 0 0 0.5px ${HAIR}` }}>
        {cond.rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 14, boxShadow: i ? `inset 0 0.5px 0 ${HAIR}` : 'none' }}>
            <span aria-hidden="true" style={{ flex: 'none', width: 32, height: 32, marginTop: 1, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: r.bg, color: r.fg }}><Icon src={r.icon} size={16} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span className="tnum nw" style={{ fontSize: 15, lineHeight: '20px', fontWeight: 650, color: r.pfg || T1 }}><span className="sr-only">{r.label}: </span>{r.primary}</span>
                <span className="tnum ell" style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: T2, textAlign: 'right' }}>{r.meta}</span>
              </div>
              <div className="pretty" style={{ fontSize: 12.5, lineHeight: '18px', color: T2, marginTop: 2 }}>{r.take}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SurfView({ v, S, ic, openDrawer }) {
  return (
    <>
      <OfflineBanner show={v.offline || !!v.staleTxt} text={v.offline ? v.offlineTxt : v.staleTxt} icon={ic.cloudOff} />

      {/* 1 · Spot header */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {S.eyebrow && <Cap size={11} color={T2} style={{ display: 'block', lineHeight: '14px', marginBottom: 4 }}><span className="ell" style={{ display: 'block' }}>{S.eyebrow}</span></Cap>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 30, lineHeight: '36px', fontWeight: 700, letterSpacing: '-0.02em' }}>{S.name}</h1>
            <span className="nw" style={{ height: 24, padding: '0 10px 0 8px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: S.pillBg, color: S.pillFg, boxShadow: `inset 0 0 0 1px ${S.pillBg}`, fontSize: 11.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>
              <Dot size={6} color={S.pillFg} />{S.pill}
            </span>
          </div>
          <div style={{ fontSize: 13.5, lineHeight: '19px', color: T2, marginTop: 3 }}>
            {S.sub}<span style={{ color: T3 }}> · </span><span style={{ color: T1 }}>{S.water}</span>
          </div>
        </div>
        <CamLink link={S.camLink} icon={ic.out} />
      </header>

      {/* 2 · Hero */}
      <section style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="tnum" style={{ fontSize: 64, lineHeight: '68px', fontWeight: 700, letterSpacing: '-0.045em' }}>{S.range}</span>
            <span style={{ fontSize: 24, fontWeight: 500, color: T2 }}>ft</span>
          </div>
          <div className="pretty" style={{ fontSize: 14, lineHeight: '19px', color: T2, marginTop: 2 }}>{S.words}</div>
        </div>
        <div style={{ flex: 'none', textAlign: 'right', paddingBottom: 2 }}>
          <div className="tnum" style={{ fontSize: 24, lineHeight: '28px', fontWeight: 650 }}>{S.kj}<span style={{ fontSize: 13, fontWeight: 500, color: T2, marginLeft: 4 }}>kJ</span></div>
          <Cap size={10.5} style={{ display: 'block', marginTop: 2 }}>Swell energy</Cap>
        </div>
      </section>

      {/* 3 · Forward-looking window */}
      <NextWindow next={S.next} chev={ic.chevRight} />

      {/* 4 · Current conditions: metric + meaning */}
      <Conditions cond={S.cond} />

      <LoadoutTeaser text={S.teaser} onClick={openDrawer} ic={ic} mt={18} />
      <Footer footnote={S.footnote} ic={ic} />
    </>
  );
}
