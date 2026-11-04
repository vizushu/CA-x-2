// Loading / failed screen and the Sources & settings sheet.
import React from 'react';
import { Icon, MONO, SourceRows } from './ui.jsx';

const SECTION = { fontFamily: MONO, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: '#A5B3BD', marginTop: 26 };
const NOTE = { fontSize: 12, lineHeight: '17px', color: '#A5B3BD', marginTop: 8 };
const INPUT = { flex: 1, minWidth: 0, height: 48, boxSizing: 'border-box', padding: '0 14px', border: 0, borderRadius: 14, background: 'rgba(238,244,246,0.08)', color: '#EEF4F6', font: 'inherit', fontSize: 15, outline: 'none' };
const SEG_WRAP = { display: 'grid', gap: 4, padding: 4, marginTop: 8, borderRadius: 18, background: 'rgba(238,244,246,0.05)' };
const SEG = { height: 44, borderRadius: 14, fontSize: 14, fontWeight: 650 };
const PRIMARY = { height: 48, padding: '0 18px', borderRadius: 14, background: '#EEF4F6', color: '#09141A', fontSize: 14, fontWeight: 650 };

export function Loading({ title, rows, failed, onRetry }) {
  return (
    <div role="status" style={{ position: 'absolute', inset: 0, zIndex: 60, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, padding: '0 32px', background: '#09141A', color: '#EEF4F6' }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#778692' }}>Lineup · live</div>
      <div className="pretty" style={{ fontSize: 28, lineHeight: '34px', fontWeight: 650, letterSpacing: '-0.02em' }}>{title}</div>
      <SourceRows rows={rows} gap={12} fs={14} lh={19} labelColor="#A5B3BD" stateFs={12} />
      {failed && <button className="btn" onClick={onRetry} style={{ height: 52, borderRadius: 26, background: '#EEF4F6', color: '#09141A', fontSize: 15, fontWeight: 650 }}>Try again</button>}
    </div>
  );
}

export function Settings({ set, srcRows, ic, onClose, onRefresh }) {
  return (
    <>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 44, background: 'rgba(5,8,11,0.55)' }} />
      <div data-screen-label="Settings" role="dialog" aria-modal="true" aria-label="Sources and settings" className="noscroll" style={{ position: 'absolute', left: 8, right: 8, top: 56, bottom: 8, zIndex: 45, boxSizing: 'border-box', overflowY: 'auto', overscrollBehavior: 'contain', padding: '4px 18px 28px', borderRadius: '30px 30px 40px 40px', background: 'rgba(12,20,27,0.97)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.16)', color: '#EEF4F6', WebkitUserSelect: 'text', userSelect: 'text' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, height: 64 }}>
          <div style={{ fontSize: 22, lineHeight: '28px', fontWeight: 650, letterSpacing: '-0.01em' }}>Sources &amp; settings</div>
          <button className="btn" onClick={onClose} title="Close" aria-label="Close" style={{ margin: '0 -6px 0 0', width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(238,244,246,0.08)', color: '#EEF4F6' }}>
            <Icon src={ic.x} size={20} />
          </button>
        </div>

        <div style={{ ...SECTION, marginTop: 6 }}>Live traffic</div>
        <div style={{ ...SEG_WRAP, gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
          {set.provs.map(pv => <button key={pv.label} className="btn" onClick={pv.onClick} aria-pressed={pv.fg === '#EEF4F6'} style={{ ...SEG, background: pv.bg, color: pv.fg }}>{pv.label}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input type="password" autoComplete="off" spellCheck="false" aria-label="Traffic API key" value={set.key} onChange={set.onKey} placeholder={set.keyPh} disabled={set.keyDis} style={INPUT} />
          <button className="btn" onClick={set.saveTraffic} style={PRIMARY}>Save</button>
        </div>
        <div className="pretty" style={NOTE}>{set.trafficLine}. The key stays on this device and is sent only to that provider.</div>

        <div style={SECTION}>Swami’s cam</div>
        <div style={{ ...SEG_WRAP, gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
          <button className="btn" onClick={set.setPhoto} style={{ ...SEG, background: set.swPhoto.bg, color: set.swPhoto.fg }}>5-min photo</button>
          <button className="btn" onClick={set.setLive} style={{ ...SEG, background: set.swLive.bg, color: set.swLive.fg }}>Live player</button>
        </div>
        <div className="pretty" style={NOTE}>SkylineWebcams lets any site show its 5-minute photo. Their live player is reserved for the webcam’s host, so get their OK before you publish with it switched on.</div>

        <div style={SECTION}>Your own cams</div>
        <label style={{ display: 'block', fontSize: 13, lineHeight: '18px', marginTop: 10 }}>Beach cam for {set.beachName}
          <div style={{ display: 'flex', marginTop: 6 }}><input type="url" autoComplete="off" spellCheck="false" value={set.beach} onChange={set.onBeach} placeholder="YouTube link, image URL or embed URL" style={INPUT} /></div>
        </label>
        <label style={{ display: 'block', fontSize: 13, lineHeight: '18px', marginTop: 12 }}>Mountain cam for {set.mtnName}
          <div style={{ display: 'flex', marginTop: 6 }}><input type="url" autoComplete="off" spellCheck="false" value={set.mtn} onChange={set.onMtn} placeholder="YouTube link, image URL or embed URL" style={INPUT} /></div>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <button className="btn" onClick={set.saveCams} style={PRIMARY}>Save cams</button>
          <span style={{ fontSize: 12, lineHeight: '17px', color: '#A5B3BD' }}>Leave blank to use the default.</span>
        </div>

        <div style={SECTION}>Sources</div>
        <div style={{ marginTop: 10 }}><SourceRows rows={srcRows} /></div>
        <div className="pretty" style={{ ...NOTE, marginTop: 14 }}>Not in any open feed: lift status and resort snow reports, Surfline cams and ratings, NDBC and CDIP buoys (they block browser requests, so they need a small server proxy).</div>
        <button className="btn" onClick={onRefresh} style={{ margin: '16px 0 0', width: '100%', height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(238,244,246,0.08)', color: '#EEF4F6', fontSize: 14, fontWeight: 650 }}>
          <Icon src={ic.refresh} size={16} />Refresh all sources
        </button>
      </div>
    </>
  );
}
