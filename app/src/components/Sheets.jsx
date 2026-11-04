// Launch splash: the CALIFORNIA DOUBLE wordmark fades in while live data loads, then the splash fades away.
// If no feed answers and nothing is cached, a plain-language message and a retry button appear in the bottom thumb
// zone. The button is disabled (and says so) while a retry is in flight, so it can't be double-submitted.
import React from 'react';
import wordmark from '../assets/wordmark.webp';
import { iconUrl } from '../icons.js';
import { Icon, TAP } from './ui.jsx';

function failCopy({ offline, attempts, lastTry }) {
  if (offline) return { title: 'You’re offline', body: 'Connect to Wi-Fi or cellular data. 2CA retries on its own as soon as you’re back online, or tap Try again.' };
  if (attempts > 0) return { title: 'Still can’t reach the forecast', body: 'The weather services didn’t answer' + (lastTry ? ' at ' + lastTry : '') + '. They may be busy. Wait a minute, then try again.' };
  return { title: 'Couldn’t load the forecast', body: 'The weather services didn’t answer and there’s no saved forecast on this phone yet. Check your connection, then try again.' };
}

export function Splash({ failed, pending, offline, attempts = 0, lastTry, leaving, onRetry, onSkip }) {
  const copy = failCopy({ offline, attempts, lastTry });
  return (
    <div role="status" onClick={failed ? undefined : onSkip} aria-label={failed ? copy.title : 'California Double, loading'}
      style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px', background: 'radial-gradient(120% 60% at 50% 45%, #1C222C 0%, #0D1017 100%)', opacity: leaving ? 0 : 1, transition: 'opacity .6s ease', pointerEvents: leaving ? 'none' : 'auto' }}>
      <img src={wordmark} alt="California Double — Surf · Snow · Same day" draggable={false}
        style={{ width: '100%', maxWidth: 358, height: 'auto', display: 'block', animation: 'wordmarkIn 1.4s cubic-bezier(.2,.7,.2,1) both' }} />
      {failed && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'calc(max(20px, env(safe-area-inset-bottom, 0px)) + 24px)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 14, animation: 'wordmarkIn .5s ease both' }}>
          <div aria-live="polite" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, lineHeight: '22px', fontWeight: 650, color: '#F1F3F7' }}>{pending ? 'Trying again…' : copy.title}</div>
            <div className="pretty" style={{ fontSize: 14, lineHeight: '20px', color: '#B3BAC6', marginTop: 4 }}>{pending ? 'Checking the weather services. This can take up to 15 seconds.' : copy.body}</div>
          </div>
          <button type="button" className="btn" onClick={onRetry} disabled={pending} aria-busy={pending || undefined}
            style={{ height: TAP, borderRadius: TAP / 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: pending ? 'rgba(220,228,240,0.10)' : 'rgba(220,228,240,0.18)', color: pending ? '#9AA3B0' : '#F1F3F7', fontSize: 16, fontWeight: 650, transition: 'background .2s, color .2s' }}>
            <Icon src={iconUrl('refresh-cw')} size={17} style={pending ? { animation: 'spin 0.9s linear infinite' } : undefined} />{pending ? 'Trying again…' : 'Try again'}
          </button>
        </div>
      )}
    </div>
  );
}
