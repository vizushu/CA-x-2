// Launch splash: the CALIFORNIA DOUBLE wordmark fades in while live data loads, then the splash fades away.
// If every feed fails, a short message and a retry button appear under the wordmark.
import React from 'react';
import wordmark from '../assets/wordmark.webp';

export function Splash({ failed, leaving, onRetry }) {
  return (
    <div role="status" aria-label={failed ? 'Couldn’t reach the forecast feeds' : 'California Double, loading'}
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
