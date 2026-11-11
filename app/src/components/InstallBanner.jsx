// One-time "add to Home Screen" banner, shown only in a phone browser (never inside the installed app).
// Android/desktop Chrome-family: a real Install button that opens the browser's install dialog.
// iPhone/iPad: Apple doesn't allow sites to install themselves, so it shows the exact taps instead.
// In-app browsers (Instagram, Facebook, …) can't install at all, so it asks to open the link in the real browser.
import React from 'react';
import { iconUrl } from '../icons.js';
import { Icon, T1, T2, T3, BG, FILL, HAIR, ACC } from './ui.jsx';

const KEY = 'lineup.installBanner';
const SNOOZE_DAYS = 14;
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
const inApp = /FBAN|FBAV|Instagram|Line\/|LinkedInApp|Twitter|TikTok|Snapchat|GSA\//i.test(ua);

function snoozed() { try { const t = +localStorage.getItem(KEY); return t && Date.now() - t < SNOOZE_DAYS * 864e5; } catch (e) { return false; } }
function snooze() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* storage blocked */ } }

export default function InstallBanner({ ready, hidden, bottom }) {
  const [, force] = React.useReducer(x => x + 1, 0);
  const [closed, setClosed] = React.useState(snoozed);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => { window.addEventListener('installable', force); return () => window.removeEventListener('installable', force); }, []);
  React.useEffect(() => { if (!ready) return undefined; const t = setTimeout(() => setShow(true), 1500); return () => clearTimeout(t); }, [ready]);

  const prompt = window.__installPrompt;
  const kind = inApp ? 'inapp' : prompt ? 'button' : isIOS ? 'ios' : null;
  if (closed || !kind) return null;
  const dismiss = () => { snooze(); setClosed(true); };
  const install = async () => {
    try { prompt.prompt(); const r = await prompt.userChoice; window.__installPrompt = null; if (r && r.outcome === 'accepted') setClosed(true); else force(); } catch (e) { force(); }
  };
  const iconSrc = import.meta.env.BASE_URL + 'icons/apple-touch-icon.png';
  const visible = show && !hidden;
  return (
    <div role="dialog" aria-label="Add 2CA to your Home Screen" style={{ position: 'absolute', left: 12, right: 12, bottom, zIndex: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px 12px 12px', borderRadius: 20, background: BG, boxShadow: `0 10px 30px rgba(0,0,0,0.18), inset 0 0 0 1px ${HAIR}`, color: T1, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)', pointerEvents: visible ? 'auto' : 'none', transition: 'opacity .35s ease, transform .35s cubic-bezier(.2,.8,.2,1)' }}>
      <img src={iconSrc} alt="" width={44} height={44} style={{ flex: 'none', borderRadius: 11, boxShadow: '0 0 0 0.5px rgba(0,0,0,0.15)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, lineHeight: '20px', fontWeight: 650 }}>{kind === 'inapp' ? 'Open in your browser to install' : kind === 'button' ? 'Install 2CA' : 'Add 2CA to your Home Screen'}</div>
        <div style={{ fontSize: 12.5, lineHeight: '17px', color: T2, marginTop: 1 }}>
          {kind === 'button' && 'Adds it to your home screen. Full screen, works offline.'}
          {kind === 'ios' && (<>Tap <Icon src={iconUrl('share')} size={14} style={{ display: 'inline-block', verticalAlign: '-2px', margin: '0 2px' }} /> <b style={{ color: T1, fontWeight: 650 }}>Share</b>, then <Icon src={iconUrl('square-plus')} size={14} style={{ display: 'inline-block', verticalAlign: '-2px', margin: '0 2px' }} /> <b style={{ color: T1, fontWeight: 650 }}>Add to Home Screen</b>.</>)}
          {kind === 'inapp' && (<>Tap <Icon src={iconUrl('ellipsis-vertical')} size={14} style={{ display: 'inline-block', verticalAlign: '-2px', margin: '0 1px' }} /> or <Icon src={iconUrl('share')} size={14} style={{ display: 'inline-block', verticalAlign: '-2px', margin: '0 1px' }} /> and choose <b style={{ color: T1, fontWeight: 650 }}>Open in {isIOS ? 'Safari' : 'Chrome'}</b>.</>)}
        </div>
      </div>
      {kind === 'button' && <button type="button" className="btn" onClick={install} style={{ flex: 'none', height: 44, padding: '0 18px', borderRadius: 22, textAlign: 'center', background: ACC, color: 'var(--accfg, #FBFAF7)', fontSize: 14, fontWeight: 700 }}>Install</button>}
      <button type="button" className="btn" onClick={dismiss} aria-label="Dismiss" style={{ flex: 'none', width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T3 }}>
        <Icon src={iconUrl('x')} size={18} />
      </button>
    </div>
  );
}
