// Loading / failed screen.
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
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: '#778692' }}>2CA · live</div>
      <div className="pretty" style={{ fontSize: 28, lineHeight: '34px', fontWeight: 650, letterSpacing: '-0.02em' }}>{title}</div>
      <SourceRows rows={rows} gap={12} fs={14} lh={19} labelColor="#A5B3BD" stateFs={12} />
      {failed && <button className="btn" onClick={onRetry} style={{ height: 52, borderRadius: 26, background: '#EEF4F6', color: '#09141A', fontSize: 15, fontWeight: 650 }}>Try again</button>}
    </div>
  );
}
