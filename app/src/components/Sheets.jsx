// Launch splash (the CALIFORNIA DOUBLE wordmark fades in while live data loads, then fades away) and the two bottom sheets.
// If every feed fails, a short message and a retry button appear under the wordmark.
import React from 'react';
import wordmark from '../assets/wordmark.webp';
import { Icon, Label, SourceRows, BG, FILL, FILL2, HAIR, T1, T2, T3, DUR } from './ui.jsx';

export function Splash({ failed, leaving, onRetry, onSkip }) {
  return (
    <div role="status" onClick={onSkip} aria-label={failed ? 'Couldn’t reach the forecast feeds' : 'California Double, loading'}
      style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, padding: '0 36px', background: 'radial-gradient(120% 60% at 50% 45%, #1C222C 0%, #0D1017 100%)', opacity: leaving ? 0 : 1, transition: 'opacity .6s ease', pointerEvents: leaving ? 'none' : 'auto' }}>
      <img src={wordmark} alt="California Double — Surf · Snow · Same day" draggable={false}
        style={{ width: '100%', maxWidth: 358, height: 'auto', display: 'block', animation: 'wordmarkIn 1.4s cubic-bezier(.2,.7,.2,1) both' }} />
      {failed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, animation: 'wordmarkIn .5s ease both' }}>
          <div style={{ fontSize: 14, lineHeight: '19px', color: '#B3BAC6', textAlign: 'center' }}>Couldn’t reach the forecast feeds.</div>
          <button className="btn" onClick={onRetry} style={{ height: 44, padding: '0 22px', borderRadius: 22, background: 'rgba(220,228,240,0.14)', color: '#F1F3F7', fontSize: 14, fontWeight: 650 }}>Try again</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Bottom sheets (spot picker, sources & settings) in the Lifeguard-board look.
// ---------------------------------------------------------------------------------------------------------------------

const SHEET_BASE = { position: 'absolute', left: 0, right: 0, bottom: 0, boxSizing: 'border-box', overflowY: 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'none', borderRadius: '24px 24px 0 0', background: BG, color: T1, boxShadow: `0 -1px 0 ${HAIR}` };

function SheetTop({ title, sub, ic, onClose }) {
  return (
    <>
      <div style={{ width: 36, height: 5, borderRadius: 3, margin: '0 auto', background: FILL2 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div className="disp" style={{ fontSize: 24, lineHeight: '26px', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase' }}>{title}</div>
          {sub && <div style={{ fontSize: 12, lineHeight: '16px', color: T3, marginTop: 2 }}>{sub}</div>}
        </div>
        <button type="button" className="btn" aria-label="Close" onClick={onClose} style={{ flex: 'none', width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: FILL }}><Icon src={ic.x} size={18} /></button>
      </div>
    </>
  );
}

/** Pick the break / mountain (or both, in CA Double). Each row shows that spot's conditions at the scrubbed time. */
export function PickerSheet({ picker, ic, padB, onClose }) {
  return (
    <>
      <button type="button" className="btn" aria-label="Close" onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 40, width: '100%', background: 'var(--scrim, rgba(15,23,31,0.45))' }} />
      <div data-screen-label="Spot picker" role="dialog" aria-label={picker.title} style={{ ...SHEET_BASE, zIndex: 41, maxHeight: '78%', padding: `10px 20px ${padB}` }}>
        <SheetTop title={picker.title} sub={picker.sub} ic={ic} onClose={onClose} />
        {picker.groups.map(pg => (
          <div key={pg.title} style={{ marginTop: 14 }}>
            <Label>{pg.title}</Label>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
              {pg.rows.map(row => (
                <button key={row.key} type="button" className="btn" aria-pressed={row.on} onClick={row.onClick} style={{ display: 'grid', gridTemplateColumns: '14px minmax(0,1fr) auto', gap: 12, alignItems: 'center', width: '100%', minHeight: 60, padding: '8px 0', borderBottom: `1px solid ${HAIR}` }}>
                  <span style={{ width: 14, height: 14, borderRadius: 7, background: row.dot }} />
                  <span style={{ minWidth: 0, display: 'block' }}>
                    <span className="ell" style={{ display: 'block', fontSize: 17, lineHeight: '22px', fontWeight: 600 }}>{row.name}</span>
                    <span className="ell" style={{ display: 'block', fontSize: 12, lineHeight: '16px', color: T2 }}>{row.sub}</span>
                  </span>
                  <span className="nw" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: row.wordColor }}>
                    {row.word}{row.on && <Icon src={ic.check} size={18} style={{ color: T1 }} />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Seg({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))`, gap: 4, padding: 4, marginTop: 8, borderRadius: 16, background: FILL }}>
      {items.map(it => (
        <button key={it.label} type="button" className="btn" aria-pressed={it.on} onClick={it.onClick} style={{ height: 44, borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: 'center', background: it.bg, color: it.fg, transition: `background-color ${DUR}, color ${DUR}` }}>{it.label}</button>
      ))}
    </div>
  );
}

const FIELD = { width: '100%', height: 48, boxSizing: 'border-box', padding: '0 14px', border: `1px solid ${HAIR}`, borderRadius: 12, background: FILL, color: T1, font: 'inherit', fontSize: 15, outline: 'none' };
const SAVE = { flex: 'none', padding: '0 18px', height: 48, borderRadius: 12, background: T1, color: BG, fontSize: 14, fontWeight: 600, textAlign: 'center' };
const NOTE = { fontSize: 12, lineHeight: '17px', color: T2, marginTop: 8 };

/** Appearance, live traffic key, your own cam URLs, and the status of every feed. */
export function SettingsSheet({ set, rows, ic, padB, onClose, onRefresh }) {
  return (
    <>
      <button type="button" className="btn" aria-label="Close" onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 44, width: '100%', background: 'var(--scrim, rgba(15,23,31,0.45))' }} />
      <div data-screen-label="Settings" role="dialog" aria-label="Sources and settings" style={{ ...SHEET_BASE, top: 52, zIndex: 45, padding: `10px 20px ${padB}`, WebkitUserSelect: 'text', userSelect: 'text' }}>
        <SheetTop title="Sources & settings" ic={ic} onClose={onClose} />

        <Label style={{ display: 'block', marginTop: 20 }}>Appearance</Label>
        <Seg items={set.looks} />
        <div className="pretty" style={NOTE}>Auto follows your phone: paper in daylight, ink after dark.</div>

        <Label style={{ display: 'block', marginTop: 24 }}>Live traffic</Label>
        <Seg items={set.provs} />
        <label htmlFor="lineup-traffic-key" style={{ display: 'block', fontSize: 13, lineHeight: '18px', marginTop: 12 }}>API key</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input id="lineup-traffic-key" type="password" autoComplete="off" spellCheck="false" value={set.key} onChange={set.onKey} placeholder={set.keyPh} disabled={set.keyDis} style={{ ...FIELD, flex: 1, minWidth: 0, width: 'auto', opacity: set.keyDis ? 0.5 : 1 }} />
          <button type="button" className="btn" onClick={set.saveTraffic} style={SAVE}>Save</button>
        </div>
        <div className="pretty" style={NOTE}>{set.trafficLine}. The key stays on this device and is sent only to that provider.</div>

        <Label style={{ display: 'block', marginTop: 24 }}>Cams</Label>
        <div className="pretty" style={NOTE}>Each spot uses its built-in cam where there is one. Paste your own YouTube link, image URL or embed URL to replace it.</div>
        <label htmlFor="lineup-cam-beach" style={{ display: 'block', fontSize: 13, lineHeight: '18px', marginTop: 10 }}>Beach cam for {set.beachName}</label>
        <input id="lineup-cam-beach" type="url" autoComplete="off" spellCheck="false" value={set.beach} onChange={set.onBeach} placeholder="YouTube link, image URL or embed URL" style={{ ...FIELD, display: 'block', marginTop: 6 }} />
        <label htmlFor="lineup-cam-mtn" style={{ display: 'block', fontSize: 13, lineHeight: '18px', marginTop: 12 }}>Mountain cam for {set.mtnName}</label>
        <input id="lineup-cam-mtn" type="url" autoComplete="off" spellCheck="false" value={set.mtn} onChange={set.onMtn} placeholder="YouTube link, image URL or embed URL" style={{ ...FIELD, display: 'block', marginTop: 6 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <button type="button" className="btn" onClick={set.saveCams} style={SAVE}>Save cams</button>
          <span style={{ fontSize: 12, lineHeight: '17px', color: T2 }}>Leave blank to use the built-in cam.</span>
        </div>

        <Label style={{ display: 'block', marginTop: 24 }}>Sources</Label>
        <div style={{ marginTop: 10 }}><SourceRows rows={rows} labelColor={T1} /></div>
        <div className="pretty" style={{ ...NOTE, marginTop: 14 }}>Not in any open feed: lift status and resort snow reports, Surfline ratings, and NDBC or CDIP buoys (they block browser requests, so they need a small server proxy).</div>
        <button type="button" className="btn" onClick={onRefresh} style={{ margin: '16px 0 0', width: '100%', height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: FILL, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
          <Icon src={ic.refresh} size={16} />Refresh all sources
        </button>
      </div>
    </>
  );
}
