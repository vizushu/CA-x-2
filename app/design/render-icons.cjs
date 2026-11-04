// Renders app/public icons + og-image.png from the fine-line mark (mark.js). Run: node design/render-icons.cjs, then copy the PNGs from design/ into public/ (icons/) and public/og-image.png.
const { chromium } = require('playwright'); const { mark } = require('./mark.js'); const fs = require('fs');
const OUT = __dirname + '/';
const icon = (size, frac, name, opts) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${opts.bg}"/>
  <g transform="translate(50 50) scale(${frac}) translate(-50 -50)">${mark(opts)}</g></svg>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  async function shot(svg, w, h, file) { await p.setViewportSize({ width: w, height: h }); await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.locator('svg').first().screenshot({ path: OUT + file, omitBackground: true }); }
  const LIGHT = { bg: '#F2F0EB', surf: '#3E4B58', snow: '#7C8B99', sw: 2.4 };
  await shot(icon(512, 0.8, '', LIGHT), 512, 512, 'icon-512.png');
  await shot(icon(192, 0.8, '', LIGHT), 192, 192, 'icon-192.png');
  await shot(icon(180, 0.8, '', LIGHT), 180, 180, 'apple-touch-icon.png');
  await shot(icon(512, 0.68, '', LIGHT), 512, 512, 'icon-maskable-512.png');
  await shot(icon(64, 1.05, '', { ...LIGHT, sw: 3.4 }), 64, 64, 'favicon.png');
  // share card: midnight, silver mark (wordmark colours), no tile
  const wm = 'data:image/webp;base64,' + fs.readFileSync(__dirname + '/../src/assets/wordmark.webp').toString('base64');
  const card = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#262D38"/><stop offset="1" stop-color="#0D1017"/></radialGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <g transform="translate(467 52) scale(2.66)">${mark({ surf: '#DCE1E3', snow: '#9AA6B5', sw: 1.5, id: 'c' })}</g>
    <image href="${wm}" x="150" y="355" width="900" height="113"/></svg>`;
  await shot(card, 1200, 630, 'og-image.png');
  await b.close();
})();
