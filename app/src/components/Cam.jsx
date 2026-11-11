// Cam slot under the verdict. A spot with a feed gets the dark panel (embedded player, HLS stream or a refreshing photo);
// a spot without one gets a short dashed slot that says why (pending access, no public cam), never a dead video box.
import React from 'react';
import { Icon, DUR, T3 } from './ui.jsx';

const SHEET = { background: 'rgba(10,16,22,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' };

/** HLS live stream: native playback on Safari/iOS, hls.js (lazy-loaded) elsewhere. Muted autoplay, inline. */
function HlsVideo({ src, label, onError }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const v = ref.current; if (!v) return undefined;
    let hls = null, dead = false;
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = src; play(); }
    else {
      import('hls.js').then(({ default: Hls }) => {
        if (dead) return;
        if (!Hls.isSupported()) { onError(); return; }
        hls = new Hls({ liveSyncDurationCount: 3, lowLatencyMode: false });
        hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) { hls.destroy(); hls = null; onError(); } });
        hls.loadSource(src); hls.attachMedia(v); play();
      }).catch(onError);
    }
    return () => { dead = true; if (hls) hls.destroy(); v.removeAttribute('src'); v.load(); };
  }, [src]);
  return <video ref={ref} muted autoPlay playsInline loop aria-label={label} onError={onError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#070B10' }} />;
}

/** Why a slot is empty: pending provider access, or no public cam at all. */
function Notice({ f, noteFg }) {
  return (
    <div role="status" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, lineHeight: '18px', fontWeight: 600 }}>{f.label}</div>
      {(f.provider && f.isPending) ? <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600 }}>{f.provider}</div> : null}
      <div className="pretty" style={{ fontSize: 12, lineHeight: '16px', color: noteFg }}>{f.note}</div>
    </div>
  );
}

function Feed({ f, noteFg }) {
  if (f.isIframe) {
    return <iframe src={f.src} title={f.title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', background: '#000' }} />;
  }
  if (f.isImg) return <img src={f.src} alt={f.label} onError={f.onError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
  if (f.isHls) return <HlsVideo src={f.src} label={f.label} onError={f.onError} />;
  return <Notice f={f} noteFg={noteFg} />;
}

export default function CamSlot({ cam, ic, connecting }) {
  return (
    <section aria-label="Cam" style={{ marginTop: 16 }}>
      <div style={{ position: 'relative', height: cam.h, borderRadius: 16, overflow: 'hidden', background: cam.slotBg, color: cam.slotFg, boxShadow: `inset 0 0 0 1px ${cam.slotRing}`, transition: `height ${DUR}, background-color ${DUR}` }}>
        <div style={{ position: 'absolute', inset: 6, borderRadius: 11, border: `1.5px ${cam.slotDash} ${cam.slotRing}`, pointerEvents: 'none' }} />
        {cam.panes.map(pn => (
          <div key={pn.f.key} style={{ position: 'absolute', top: 0, bottom: 0, left: pn.left, width: pn.width, overflow: 'hidden', background: pn.bg, filter: cam.filter, transition: `left ${DUR} cubic-bezier(.2,.8,.2,1), width ${DUR} cubic-bezier(.2,.8,.2,1)` }}>
            <Feed f={pn.f} noteFg={cam.noteFg} />
            {pn.showTitle && (
              <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, padding: '6px 10px', borderRadius: 10, background: 'rgba(10,16,22,0.72)', color: '#F3F2EE', pointerEvents: 'none' }}>
                <div className="ell" style={{ fontSize: 13, lineHeight: '17px', fontWeight: 600 }}>{pn.title}</div>
                <div className="ell" style={{ fontSize: 11, lineHeight: '15px', color: '#B0B8C1' }}>{pn.sub}</div>
              </div>
            )}
          </div>
        ))}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#0A1016', opacity: cam.dim, transition: `opacity ${DUR}` }} />

        <div style={{ position: 'absolute', left: 10, top: 10, height: 26, padding: '0 10px 0 9px', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 7, background: cam.chipBg, color: cam.chipFg, fontSize: 11, lineHeight: '14px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', pointerEvents: 'none' }}>
          <span style={{ display: 'block', width: 7, height: 7, borderRadius: 4, background: cam.dotColor, animation: cam.liveNow ? 'livepulse 2s ease-out infinite' : 'none' }} />
          <span>{cam.tag}</span>
          {cam.stamp && <span className="tnum" style={{ fontWeight: 500, letterSpacing: 0, color: '#C9D2DA' }}>{cam.stamp}</span>}
        </div>

        {cam.water && (
          <div style={{ position: 'absolute', left: 10, bottom: 10, height: 32, padding: '0 11px 0 8px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6, ...SHEET, color: '#F3F2EE', fontSize: 13, fontWeight: 600, pointerEvents: 'none' }}>
            <Icon src={ic.thermo} size={16} /><span className="tnum">{cam.water}</span><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#B0B8C1' }}>Water</span>
          </div>
        )}

        {cam.showOverlay && <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '8px 14px', borderRadius: 14, whiteSpace: 'nowrap', background: 'rgba(10,16,22,0.8)', color: '#F3F2EE', fontSize: 13, lineHeight: '16px', fontWeight: 500 }}>{cam.overlay}</div>}

        {cam.showLink && (
          <a href={cam.link} target="_blank" rel="noopener noreferrer" title={cam.linkLabel} aria-label={cam.linkLabel + ' (opens in a new tab)'}
            style={{ position: 'absolute', right: 8, bottom: 8, width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,16,22,0.72)', color: '#F3F2EE' }}>
            <Icon src={ic.ext} size={18} />
          </a>
        )}

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, overflow: 'hidden', pointerEvents: 'none' }}>
          {connecting && <div key="sw" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', background: 'linear-gradient(90deg, rgba(243,242,238,0), #F3F2EE, rgba(243,242,238,0))', animation: 'sweep 0.9s ease-in-out infinite' }} />}
        </div>
      </div>
      {cam.caption && <div className="ell" style={{ fontSize: 12, lineHeight: '16px', color: T3, marginTop: 8 }}>{cam.caption}</div>}
    </section>
  );
}
