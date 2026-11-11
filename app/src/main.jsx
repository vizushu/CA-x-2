import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './styles.css';
import App, { standalone } from './App.jsx';

// Optional URL switches (the prototype's “Tweaks”): ?glove=on|off|auto, ?offline=1, ?blueprint=0
// Chrome/Edge/Samsung fire this once when the app is installable; keep it so the install banner can open the
// browser's own install dialog from a button. (iOS has no equivalent; the banner shows instructions there.)
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__installPrompt = e; window.dispatchEvent(new Event('installable')); });
window.addEventListener('appinstalled', () => { window.__installPrompt = null; window.dispatchEvent(new Event('installable')); });

const q = new URLSearchParams(location.search);
const glove = ['on', 'off', 'auto'].includes(q.get('glove')) ? q.get('glove') : 'auto';

createRoot(document.getElementById('root')).render(
  <App glove={glove} offline={q.get('offline') === '1'} showBlueprint={q.get('blueprint') !== '0'} />,
);

// Service worker: only for the installed / phone / ?app experience, never inside an iframe.
if ('serviceWorker' in navigator && window.top === window.self && (standalone() || /[?&](app|sw)\b/.test(location.search) || window.innerWidth < 600)) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}
