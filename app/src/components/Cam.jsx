// Cam viewport: 430×242 feed area that docks into a 92×52 thumbnail as --cam goes 0 → 1.
import React from 'react';
import { Arrow, Icon, MONO } from './ui.jsx';

const HUD_OP = 'calc(1 - var(--cam, 0) * 2.2)';
const GLASS_S = { background: 'rgba(8,12,18,0.45)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 0 0.5px rgba(238,243,246,0.2)' };
const SHADOW_TXT = { textShadow: '0 1px 8px rgba(0,0,0,0.6)' };
const DIAL_CAP = { fontFamily: MONO, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(238,243,246,0.75)' };

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

/**
 * Third-party iframe player (IPCamLive, Camstreamer, YouTube…). Tap-to-play: the iframe is only created after the
 * viewer taps, so nothing loads in the background and the tap counts as the user gesture for the provider's player.
 * Some providers (IPCamLive) still show their own Play control inside the frame; their controls are left intact.
 */
function IframeFeed({ f, onPlay }) {
  const [on, setOn] = React.useState(false);
  if (on) {
    return (
      <iframe src={f.src} title={f.label + ' live camera'} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block', background: '#000' }} />
    );
  }
  return (
    <button className="btn" onClick={e => { e.stopPropagation(); setOn(true); if (onPlay) onPlay(f.key); }} aria-label={'Play ' + f.label + ' live camera'}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '36px 20px 0', textAlign: 'center', color: '#EEF3F6' }}>
      <span style={{ width: 52, height: 52, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(238,243,246,0.16)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 0 0.5px rgba(238,243,246,0.3)' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2A.8.8 0 0 0 6 3.8z" fill="currentColor" /></svg>
      </span>
      <span style={{ fontSize: 13, lineHeight: '17px', fontWeight: 650 }}>Tap to play · {f.label}</span>
      {f.provider && <span style={{ fontSize: 11, lineHeight: '15px', color: '#A3AEBA' }}>Live player by {f.provider}</span>}
    </button>
  );
}

function Feed({ f, onPlay }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {f.isImg && <img src={f.src} alt={f.label} onError={f.onError} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
      {f.isHls && <HlsVideo src={f.src} label={f.label} onError={f.onError} />}
      {f.isIframe && <IframeFeed f={f} onPlay={onPlay} />}
      {f.isNone && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, lineHeight: '17px', fontWeight: 650, color: '#EEF3F6' }}>{f.label}</div>
          <div className="pretty" style={{ fontSize: 11, lineHeight: '15px', color: '#A3AEBA' }}>{f.note}</div>
        </div>
      )}
    </div>
  );
}

function HalfCaption({ show, right, title, sub, subFg }) {
  return (
    <div style={{ position: 'absolute', left: 12, right, bottom: 12, display: show, opacity: 'calc(1 - var(--cam, 0) * 2.2)', pointerEvents: 'none', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
      <div className="ell" style={{ fontSize: 13, lineHeight: '17px', fontWeight: 650, color: '#EEF3F6' }}>{title}</div>
      <div className="ell" style={{ fontSize: 11, lineHeight: '15px', fontWeight: 600, color: subFg }}>{sub}</div>
    </div>
  );
}

function Dial({ children, beach = true }) {
  return (
    <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 20, overflow: 'hidden', ...GLASS_S }}>
      {beach
        ? <div style={{ position: 'absolute', left: 7, right: 7, bottom: 8, borderTop: '1px dashed rgba(238,243,246,0.45)' }} />
        : <div style={{ position: 'absolute', left: 19, top: 3, width: 2, height: 4, borderRadius: 1, background: 'rgba(238,243,246,0.6)' }} />}
      {children}
    </div>
  );
}

export default function Cam({ v, ic, liveCam, connecting, miniTap, togglePin }) {
  const { cam, hud, mini } = v;
  // Once a provider player is running in full view, drop the bottom dials so its own controls stay visible.
  const [playing, setPlaying] = React.useState(() => new Set());
  const onPlay = React.useCallback(k => setPlaying(s => new Set(s).add(k)), []);
  const shown = cam.halfDisp === 'block' ? [] : cam.bw === 100 ? cam.beach : cam.mtn;
  const providerUi = shown.some(f => f.isIframe && playing.has(f.key));
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 'calc(242px - 124px * var(--cam, 0))', zIndex: 5, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,21,0.84)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)', boxShadow: 'inset 0 -0.5px 0 rgba(238,243,246,0.08)', opacity: 'var(--cam, 0)' }} />

      <div style={{ position: 'absolute', left: 'calc(16px * var(--cam, 0))', top: 'calc(61px * var(--cam, 0))', width: 'calc(430px - 338px * var(--cam, 0))', height: 'calc(242px - 190px * var(--cam, 0))', borderRadius: 'calc(12px * var(--cam, 0))', overflow: 'hidden', background: '#070B10', color: 'rgba(238,243,246,0.6)', filter: hud.filter }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: cam.bw + '%', overflow: 'hidden', background: '#0D141C', transition: 'width .45s cubic-bezier(.2,.8,.2,1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(115deg, rgba(238,243,246,0.03) 0 10px, transparent 10px 20px)' }} />
          {cam.beach.map(f => <Feed key={f.key} f={f} onPlay={onPlay} />)}
          <HalfCaption show={cam.halfDisp} right={12} title={hud.bTitle} sub={hud.bSub} subFg={hud.bSubFg} />
        </div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: cam.ml + '%', width: cam.mw + '%', overflow: 'hidden', background: '#121A23', transition: 'left .45s cubic-bezier(.2,.8,.2,1), width .45s cubic-bezier(.2,.8,.2,1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(65deg, rgba(238,243,246,0.035) 0 10px, transparent 10px 20px)' }} />
          {cam.mtn.map(f => <Feed key={f.key} f={f} onPlay={onPlay} />)}
          <HalfCaption show={cam.halfDisp} right={60} title={hud.mTitle} sub={hud.mSub} subFg={hud.mSubFg} />
        </div>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#05080B', opacity: hud.dim, transition: 'opacity .4s' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, overflow: 'hidden', pointerEvents: 'none' }}>
          {connecting && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', background: 'linear-gradient(90deg, rgba(238,243,246,0), #EEF3F6, rgba(238,243,246,0))', animation: 'sweep 0.9s ease-in-out infinite' }} />}
        </div>
        <div onClick={miniTap} aria-hidden="true" style={{ position: 'absolute', inset: 0, cursor: 'pointer', pointerEvents: hud.catcherPE }} />
      </div>

      {/* HUD */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 430, height: 242, opacity: HUD_OP, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 96, background: 'linear-gradient(180deg, rgba(5,8,11,0.72), rgba(5,8,11,0))' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, opacity: providerUi ? 0 : 1, transition: 'opacity .3s', background: 'linear-gradient(0deg, rgba(5,8,11,0.72), rgba(5,8,11,0))' }} />
        <div style={{ position: 'absolute', left: 16, top: 58, height: 28, padding: '0 11px 0 10px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(8,12,18,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: 'inset 0 0 0 0.5px rgba(238,243,246,0.16)', fontSize: 12, lineHeight: '16px', color: '#EEF3F6' }}>
          <span style={{ display: 'block', width: 7, height: 7, borderRadius: 4, background: liveCam ? '#EEF3F6' : '#A3AEBA', animation: liveCam ? 'livepulse 2s ease-out infinite' : 'none' }} />
          <span style={{ fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>{hud.live}</span>
          <span className="tnum" style={{ fontFamily: MONO, fontSize: 11, color: '#A3AEBA' }}>{hud.stamp}</span>
        </div>

        {hud.showTimer && (
          <div style={{ position: 'absolute', right: 16, top: 58, padding: '6px 12px', borderRadius: 14, textAlign: 'right', background: hud.setBg, color: hud.setFg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: 'inset 0 0 0 0.5px rgba(238,243,246,0.16)', transition: 'background .3s, color .3s' }}>
            <div className="tnum" style={{ fontSize: 13, lineHeight: '16px', fontWeight: 650 }}>{hud.setTxt}</div>
            <div style={{ fontSize: 10, lineHeight: '13px', color: hud.setSubFg }}>{hud.setSub}</div>
          </div>
        )}
        {hud.showVis && (
          <div style={{ position: 'absolute', right: 16, top: 58, padding: '6px 12px', borderRadius: 14, textAlign: 'right', background: 'rgba(8,12,18,0.5)', color: '#EEF3F6', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: 'inset 0 0 0 0.5px rgba(238,243,246,0.16)' }}>
            <div style={{ fontSize: 13, lineHeight: '16px', fontWeight: 650 }}>{hud.visTxt}</div>
            <div style={{ fontSize: 10, lineHeight: '13px', color: '#A3AEBA' }}>{hud.visSub}</div>
          </div>
        )}
        {hud.showToggle && (
          <div role="group" aria-label="Cam view" style={{ position: 'absolute', right: 14, top: 52, display: 'flex', gap: 2, padding: 3, borderRadius: 17, background: 'rgba(8,12,18,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: 'inset 0 0 0 0.5px rgba(238,243,246,0.16)', pointerEvents: hud.pipPE }}>
            {hud.views.map(vw => (
              <button key={vw.title} className="btn" onClick={vw.onClick} title={vw.title} aria-label={vw.title} style={{ width: 48, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: vw.bg, color: vw.fg, transition: 'background .2s, color .2s' }}>
                <Icon src={vw.icon} size={18} />
              </button>
            ))}
          </div>
        )}
        {hud.showOverlay && (
          <div className="nw" style={{ position: 'absolute', left: '50%', top: 121, transform: 'translate(-50%,-50%)', padding: '8px 14px', borderRadius: 16, background: 'rgba(8,12,18,0.62)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', fontSize: 13, lineHeight: '16px', fontWeight: 500, color: '#EEF3F6' }}>{hud.overlay}</div>
        )}

        {hud.showSurfDials && !providerUi && (
          <div style={{ position: 'absolute', left: 16, bottom: 14, display: 'flex', gap: 18, color: '#EEF3F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dial><Arrow rot={hud.windRot} color={hud.windCol} style={{ left: 8, top: 7 }} /></Dial>
              <div style={SHADOW_TXT}><div style={DIAL_CAP}>Wind</div><div style={{ fontSize: 13, lineHeight: '17px', fontWeight: 600 }}>{hud.windTxt}</div></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dial><Arrow rot={hud.swellRot} color="#EEF3F6" style={{ left: 8, top: 7 }} /></Dial>
              <div style={SHADOW_TXT}><div style={DIAL_CAP}>Swell</div><div style={{ fontSize: 13, lineHeight: '17px', fontWeight: 600 }}>{hud.swellTxt}</div></div>
            </div>
          </div>
        )}
        {hud.showSnowDials && !providerUi && (
          <div style={{ position: 'absolute', left: 16, bottom: 14, display: 'flex', gap: 18, color: '#EEF3F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dial beach={false}><Arrow rot={hud.sRot} color={hud.sCol} style={{ left: 8, top: 8 }} /></Dial>
              <div style={SHADOW_TXT}><div style={{ fontSize: 13, lineHeight: '17px', fontWeight: 600 }}>{hud.sWind}</div><div style={{ fontSize: 11, lineHeight: '15px', color: hud.sCol }}>{hud.sSub}</div></div>
            </div>
            <div style={SHADOW_TXT}><div style={{ fontSize: 13, lineHeight: '17px', fontWeight: 600 }}>{hud.liftTxt}</div><div style={{ fontSize: 11, lineHeight: '15px', color: '#A3AEBA' }}>{hud.liftSub}</div></div>
          </div>
        )}

        {hud.showLink && (
          <a href={hud.link} target="_blank" rel="noopener noreferrer" title={hud.linkLabel} aria-label={hud.linkLabel} style={{ position: 'absolute', right: 66, bottom: 10, width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', ...GLASS_S, color: '#EEF3F6', pointerEvents: hud.pipPE }}>
            <Icon src={ic.ext} size={18} />
          </a>
        )}
        <button className="btn" onClick={togglePin} title="Dock cam" aria-label="Dock cam" style={{ color: '#EEF3F6', position: 'absolute', right: 12, bottom: 10, width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', ...GLASS_S, pointerEvents: hud.pipPE }}>
          <Icon src={ic.pip} size={20} />
        </button>
      </div>

      {/* Mini-bar (docked) */}
      <div onClick={miniTap} role="button" aria-label="Show cam" style={{ position: 'absolute', left: 120, right: 8, top: 54, height: 64, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#EEF3F6', opacity: 'calc((var(--cam, 0) - 0.55) * 2.2)', pointerEvents: hud.catcherPE }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nw" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 16, lineHeight: '20px', fontWeight: 600 }}>
            {mini.name}<span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#A3AEBA', textTransform: 'uppercase' }}>{hud.live}</span>
          </div>
          <div className="ell" style={{ fontSize: 13, lineHeight: '18px', color: '#A3AEBA' }}>{mini.summary}</div>
        </div>
        <div style={{ flex: 'none', height: 26, padding: '0 10px', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 6, background: mini.pillBg, color: mini.pillFg, fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: mini.pillFg }} />{mini.pill}
        </div>
        <span style={{ flex: 'none', width: 40, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3AEBA' }}><Icon src={ic.chevDown} size={20} /></span>
      </div>
    </div>
  );
}
