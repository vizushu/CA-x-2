// Renders the link-preview card options (og-sketch.png, og-cad.png); the CAD one is published as public/og-image.png. Needs roughjs + playwright installed where you run it.
// Two link-preview card options: hand-drawn sketch (rough.js) and engineering CAD.
const { chromium } = require('playwright'); const fs = require('fs');
const rough = fs.readFileSync(__dirname + '/node_modules/roughjs/bundled/rough.js', 'utf8');
const wm = 'data:image/webp;base64,' + fs.readFileSync('/home/claude/repo/app/src/assets/wordmark.webp').toString('base64');
const page = (body) => `<!doctype html><html><body style="margin:0;background:#0D1017">
<svg id="c" xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="g" cx="50%" cy="36%" r="75%"><stop offset="0" stop-color="#252C37"/><stop offset="1" stop-color="#0D1017"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/><g id="art"></g>
<image href="${wm}" x="150" y="388" width="900" height="113"/></svg>
<script>${rough}</script><script>${body}</script></body></html>`;
// shared geometry (px): boards centred at (600,200), crossing at 90 degrees
const common = `
const CX=600, CY=200, K=3.7;
const SURF='M39,0 C27,-8 -6,-12.4 -28,-8.8 C-35.8,-7.4 -39,-3.6 -39,0 C-39,3.6 -35.8,7.4 -28,8.8 C-6,12.4 27,8 39,0 Z';
const SNOW='M-27,-8.6 C-12,-6.8 12,-6.8 27,-8.6 A8.6,8.6 0 0 1 27,8.6 C12,6.8 -12,6.8 -27,8.6 A8.6,8.6 0 0 1 -27,-8.6 Z';
// scale+rotate a path string's numbers into card pixels
function tx(d, ang){ const a=ang*Math.PI/180, c=Math.cos(a), s=Math.sin(a); let out='', nums=[], i=0;
  return d.replace(/([AaMmCcLlZz])([^AaMmCcLlZz]*)/g,(m,cmd,args)=>{ const n=args.trim().split(/[\\s,]+/).filter(Boolean).map(Number);
    if(cmd==='A'){ const [rx,ry,rot,la,sw,x,y]=n; const X=CX+K*(x*c-y*s), Y=CY+K*(x*s+y*c); return 'A'+(rx*K)+','+(ry*K)+' '+(rot+ang)+' '+la+' '+sw+' '+X.toFixed(1)+','+Y.toFixed(1)+' '; }
    const p=[]; for(let j=0;j<n.length;j+=2){ const x=n[j], y=n[j+1]; p.push((CX+K*(x*c-y*s)).toFixed(1)+','+(CY+K*(x*s+y*c)).toFixed(1)); } return cmd+p.join(' ')+' '; }); }
const NS='http://www.w3.org/2000/svg', art=document.getElementById('art');
function el(n,a,parent){ const e=document.createElementNS(NS,n); for(const k in a) e.setAttribute(k,a[k]); (parent||art).appendChild(e); return e; }
const surfD=tx(SURF,-45), snowD=tx(SNOW,45);
const defs=document.querySelector('defs');
const mask=el('mask',{id:'hide',maskUnits:'userSpaceOnUse',x:0,y:0,width:1200,height:630},defs);
el('rect',{x:0,y:0,width:1200,height:630,fill:'#fff'},mask); el('path',{d:surfD,fill:'#000',stroke:'#000','stroke-width':10},mask);
`;
const sketch = common + `
const rc = rough.svg(document.getElementById('c'));
const ink='#DCE2E6', o={stroke:ink, strokeWidth:1.5, roughness:1.25, bowing:1.4, seed:7};
const back=el('g',{mask:'url(#hide)'}), front=el('g',{});
// snowboard (behind): outline twice, inner edge, bindings, a little hatching
back.appendChild(rc.path(snowD,{...o,seed:3}));
back.appendChild(rc.path(snowD,{...o,strokeWidth:1.1,roughness:1.6,seed:4}));
back.appendChild(rc.path(tx('M-25,-6.2 C-12,-4.8 12,-4.8 25,-6.2',45),{...o,strokeWidth:1,roughness:1.6,seed:11}));
back.appendChild(rc.path(tx('M-25,6.2 C-12,4.8 12,4.8 25,6.2',45),{...o,strokeWidth:1,roughness:1.6,seed:12}));
for (const x of [-15,13]) back.appendChild(rc.path(tx('M'+(x-2.8)+',-5 L'+(x+2.8)+',-5 L'+(x+2.8)+',5 L'+(x-2.8)+',5 Z',45),{...o,strokeWidth:1.2,seed:20+x}));
for (let i=0;i<10;i++){ const x=(i<5?-31:24)+(i%5)*1.6; back.appendChild(rc.line(...[[x,-3],[x+3,3]].flatMap(([a,b])=>{const t=tx('M'+a+','+b,45).match(/[\\d.]+/g).map(Number);return t;}),{...o,strokeWidth:0.8,roughness:1.8,seed:40+i})); }
// surfboard (front): outline, stringer, rails, fins, nose chevrons
front.appendChild(rc.path(surfD,{...o,seed:5}));
front.appendChild(rc.path(surfD,{...o,strokeWidth:1.1,roughness:1.6,seed:6}));
front.appendChild(rc.path(tx('M-37,0 L36,0',-45),{...o,strokeWidth:1,roughness:1.5,seed:9}));
front.appendChild(rc.path(tx('M-30,-6.4 C-8,-9.6 20,-6.6 33,-1.6',-45),{...o,strokeWidth:0.9,roughness:1.7,seed:13}));
front.appendChild(rc.path(tx('M-30,6.4 C-8,9.6 20,6.6 33,1.6',-45),{...o,strokeWidth:0.9,roughness:1.7,seed:14}));
front.appendChild(rc.path(tx('M-31,-5.4 L-35,-10.4 L-28,-8.2',-45),{...o,strokeWidth:1.1,seed:15}));
front.appendChild(rc.path(tx('M-31,5.4 L-35,10.4 L-28,8.2',-45),{...o,strokeWidth:1.1,seed:16}));
front.appendChild(rc.path(tx('M-33.5,0 L-37,0',-45),{...o,strokeWidth:1.1,seed:17}));
for (let i=0;i<3;i++){ const x=24+i*3.4, w=4.2-i*1.0; front.appendChild(rc.path(tx('M'+(x-2.4)+','+(-w)+' L'+x+',0 L'+(x-2.4)+','+w,-45),{...o,strokeWidth:0.8,roughness:1.6,seed:60+i})); }
for (const el2 of art.querySelectorAll('path')) el2.setAttribute('stroke-opacity','0.92');
`;
const cad = common + `
const ln='#C9D4DE', dim='#8E9CAD';
// faint drafting grid
const grid=el('g',{stroke:'#FFFFFF','stroke-opacity':0.035,'stroke-width':1});
for(let x=0;x<=1200;x+=30) el('line',{x1:x,y1:0,x2:x,y2:630},grid); for(let y=0;y<=630;y+=30) el('line',{x1:0,y1:y,x2:1200,y2:y},grid);
const g=el('g',{fill:'none','stroke-linecap':'round','stroke-linejoin':'round'});
// centre lines (dash-dot), extended past each board
const cl=(ang)=>el('path',{d:tx('M-46,0 L46,0',ang),stroke:dim,'stroke-width':0.8,'stroke-dasharray':'14 4 2 4'},g);
cl(45); cl(-45);
// snowboard: visible part solid, part under the surfboard as hidden (dashed) line
el('path',{d:snowD,stroke:ln,'stroke-width':1.4,mask:'url(#hide)'},g);
const inside=el('mask',{id:'inside',maskUnits:'userSpaceOnUse',x:0,y:0,width:1200,height:630},document.querySelector('defs'));
el('path',{d:surfD,fill:'#fff'},inside);
el('path',{d:snowD,stroke:dim,'stroke-width':1,'stroke-dasharray':'5 4',mask:'url(#inside)'},g);
for (const x of [-15,13]) el('path',{d:tx('M'+(x-2.8)+',-5 L'+(x+2.8)+',-5 L'+(x+2.8)+',5 L'+(x-2.8)+',5 Z',45),stroke:ln,'stroke-width':1,mask:'url(#hide)'},g);
// surfboard: outline, stringer, fins
el('path',{d:surfD,stroke:ln,'stroke-width':1.4},g);
el('path',{d:tx('M-37,0 L36,0',-45),stroke:ln,'stroke-width':0.8},g);
el('path',{d:tx('M-31,-5.4 L-35,-10.4 L-28,-8.2 M-31,5.4 L-35,10.4 L-28,8.2 M-33.5,0 L-37,0',-45),stroke:ln,'stroke-width':1},g);
// crosshair at intersection
el('circle',{cx:CX,cy:CY,r:6,stroke:dim,'stroke-width':0.8},g); el('path',{d:'M'+(CX-11)+','+CY+' h22 M'+CX+','+(CY-11)+' v22',stroke:dim,'stroke-width':0.8},g);
// dimension lines with arrows + labels
function dimLine(ang, off, len, label){ const a=tx('M'+(-len)+','+off+' L'+len+','+off,ang); el('path',{d:a,stroke:dim,'stroke-width':0.8,'marker-start':'url(#ar)','marker-end':'url(#ar)'},g);
  for(const s of [-1,1]) el('path',{d:tx('M'+(s*len)+','+(off-2.2*Math.sign(off))+' L'+(s*len)+','+(off+1.4*Math.sign(off)),ang),stroke:dim,'stroke-width':0.8},g);
  const p=tx('M'+(len*0.62)+','+(off+3.4*Math.sign(off)),ang).match(/[\\d.]+/g).map(Number); const t=el('text',{x:p[0],y:p[1],fill:dim,'font-family':'ui-monospace, Menlo, monospace','font-size':13,'letter-spacing':1.5,'text-anchor':'middle','dominant-baseline':'middle',transform:'rotate('+ang+' '+p[0]+' '+p[1]+')'},g); t.textContent=label; }
const mk=el('marker',{id:'ar',viewBox:'0 0 10 10',refX:5,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},document.querySelector('defs'));
el('path',{d:'M0,1 L9,5 L0,9',fill:'none',stroke:dim,'stroke-width':1.4},mk);
dimLine(45, 15, 35.6, '156 CM');
dimLine(-45, -15, 39, '6\\u20320\\u2033');
// small title-block ticks in corners
const tk=el('g',{stroke:dim,'stroke-width':1,'stroke-opacity':0.6,fill:'none'});
for (const [x,y,dx,dy] of [[40,40,1,1],[1160,40,-1,1],[40,590,1,-1],[1160,590,-1,-1]]) el('path',{d:'M'+x+','+(y+dy*18)+' V'+y+' H'+(x+dx*18)},tk);
`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } }); p.on('pageerror', e => console.log('ERR', e.message));
  for (const [name, js] of [['og-sketch', sketch], ['og-cad', cad]]) {
    const p = await b.newPage({ viewport: { width: 1200, height: 630 } }); p.on('pageerror', e => console.log('ERR', name, e.message));
    await p.setContent(page(js)); await p.waitForTimeout(400);
    await p.locator('#c').screenshot({ path: __dirname + '/' + name + '.png' });
  }
  await b.close();
})();
