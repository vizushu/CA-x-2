// Desktop presentation mode (wider than 600 px, not installed, no ?app): phone bezel plus two side panels.
import React from 'react';
import { MONO, SourceRows } from './ui.jsx';

const EYEBROW = { fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#778692' };
const H2 = { margin: 0, fontSize: 18, lineHeight: '24px', fontWeight: 600 };
const P = { margin: 0, fontSize: 14, lineHeight: '21px', color: '#A5B3BD' };
const B = { color: '#EEF4F6', fontWeight: 600 };

export function SourcesPanel({ order, rows }) {
  return (
    <aside data-screen-label="Live sources" style={{ order, flex: '1 1 340px', minWidth: 290, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={EYEBROW}>Lineup Live · real data</div>
        <h1 style={{ margin: 0, fontSize: 32, lineHeight: '36px', fontWeight: 650, letterSpacing: '-0.025em' }}>Every number is live</h1>
        <p className="pretty" style={{ ...P, fontSize: 15, lineHeight: '22px' }}>Your browser pulls public feeds directly. Nothing on the phone is simulated, and when a feed can’t answer, the app says so.</p>
      </header>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={H2}>Sources right now</h2>
        <SourceRows rows={rows} />
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={H2}>Cams</h2>
        <p className="pretty" style={P}><strong style={B}>Swami’s:</strong> SkylineWebcams’ Encinitas photo, refreshed every 5 minutes. Their terms allow the photo on any site; the live player is reserved for the webcam’s host.</p>
        <p className="pretty" style={P}><strong style={B}>Blacks and Lowers:</strong> no embeddable public cam. Surfline runs the Scripps Pier and Trestles cams, and HDOnTap’s La Jolla streams are token-locked. Every cam slot takes your own YouTube, image or embed URL.</p>
        <p className="pretty" style={P}><strong style={B}>Mountains:</strong> Caltrans road cams, which are public, plus a link out to each resort’s own cams.</p>
      </section>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={H2}>Not in any open feed</h2>
        <p className="pretty" style={P}>Lift status and resort snow reports, Surfline ratings, and NDBC or CDIP buoys, which block browser requests and need a small server proxy. The app shows wind-hold risk and model snow instead, labeled as such.</p>
      </section>
    </aside>
  );
}

const STEPS = [
  ['01', 'Host this folder', ' on any HTTPS static host: Netlify, Vercel, Cloudflare Pages or GitHub Pages.'],
  ['02', 'Open it on your phone.', ' Below 600 px wide it drops this frame and runs full-screen.'],
  ['03', 'Install.', ' iPhone: Share → Add to Home Screen. Android: ⋮ → Install app.'],
  ['04', 'Live traffic:', ' open Sources & settings and paste a TomTom or Mapbox key.'],
];

export function InstallPanel() {
  return (
    <aside data-screen-label="Install" style={{ order: 3, flex: '1 1 280px', minWidth: 260, maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={EYEBROW}>Installable PWA</div>
        <h2 style={{ margin: 0, fontSize: 24, lineHeight: '30px', fontWeight: 650, letterSpacing: '-0.02em' }}>Put it on your phone</h2>
      </header>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STEPS.map(([n, b, rest]) => (
          <li key={n} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr)', gap: 10, fontSize: 14, lineHeight: '21px', color: '#A5B3BD' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#778692', paddingTop: 2 }}>{n}</span>
            <span><strong style={B}>{b}</strong>{rest}</span>
          </li>
        ))}
      </ol>
      <p className="pretty" style={{ ...P, fontSize: 13, lineHeight: '19px' }}>Offline, the shell and the last forecast load from cache with their timestamps. Cams need a signal.</p>
    </aside>
  );
}

function StatusBar({ time }) {
  const c = '#fff';
  return (
    <div style={{ display: 'flex', gap: 154, alignItems: 'center', justifyContent: 'center', padding: '21px 24px 19px', boxSizing: 'border-box', position: 'relative', zIndex: 20, width: '100%' }}>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 1.5 }}>
        <span style={{ fontFamily: '-apple-system, "SF Pro", system-ui', fontWeight: 590, fontSize: 17, lineHeight: '22px', color: c }}>{time}</span>
      </div>
      <div style={{ flex: 1, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 1, paddingRight: 1 }}>
        <svg width="19" height="12" viewBox="0 0 19 12" aria-hidden="true">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c} /><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c} />
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c} /><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c} />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c} />
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c} />
          <circle cx="8.5" cy="10.5" r="1.5" fill={c} />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none" />
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c} />
          <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

/** Dark iPhone-style frame (dynamic island, status bar, home indicator). Presentation mode only. */
export function DeviceFrame({ width, height, time, children }) {
  return (
    <div style={{ width, height, borderRadius: 48, overflow: 'hidden', position: 'relative', background: '#000', boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)' }}>
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}><StatusBar time={time} /></div>
      <div style={{ height: '100%' }}>{children}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60, height: 34, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 8, pointerEvents: 'none' }}>
        <div style={{ width: 139, height: 5, borderRadius: 100, background: 'rgba(255,255,255,0.7)' }} />
      </div>
    </div>
  );
}
