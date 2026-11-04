import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import './styles.css';
import App, { standalone } from './App.jsx';

// Optional URL switches (the prototype's “Tweaks”): ?glove=on|off|auto, ?offline=1, ?blueprint=0
const q = new URLSearchParams(location.search);
const glove = ['on', 'off', 'auto'].includes(q.get('glove')) ? q.get('glove') : 'auto';

createRoot(document.getElementById('root')).render(
  <App glove={glove} offline={q.get('offline') === '1'} showBlueprint={q.get('blueprint') !== '0'} />,
);

// Service worker: only for the installed / phone / ?app experience, never inside an iframe.
if ('serviceWorker' in navigator && window.top === window.self && (standalone() || /[?&](app|sw)\b/.test(location.search) || window.innerWidth < 600)) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => {});
}
