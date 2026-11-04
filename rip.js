// In-browser rip current segmentation (YOLOv8n-seg exported to ONNX, run with onnxruntime-web WASM).
// detectRips(img) -> { ms, rips: [{ score, box:[x1,y1,x2,y2], mask: Uint8Array(w*h) }], w, h } in source-image pixels.
const S = 416, NP = 104; // model input size, prototype mask size

let session = null;
export async function loadModel(url, { threads = 1 } = {}) {
  ort.env.wasm.numThreads = threads;
  ort.env.wasm.wasmPaths = new URL('./node_modules/onnxruntime-web/dist/', location.href).href;
  session = await ort.InferenceSession.create(url, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
  return session;
}

function letterbox(img) {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  const r = Math.min(S / w, S / h), nw = Math.round(w * r), nh = Math.round(h * r);
  const px = (S - nw) / 2, py = (S - nh) / 2;
  const c = new OffscreenCanvas(S, S), g = c.getContext('2d');
  g.fillStyle = 'rgb(114,114,114)'; g.fillRect(0, 0, S, S);
  g.drawImage(img, px, py, nw, nh);
  const d = g.getImageData(0, 0, S, S).data, f = new Float32Array(3 * S * S);
  for (let i = 0; i < S * S; i++) { f[i] = d[i * 4] / 255; f[i + S * S] = d[i * 4 + 1] / 255; f[i + 2 * S * S] = d[i * 4 + 2] / 255; }
  return { tensor: new ort.Tensor('float32', f, [1, 3, S, S]), r, px, py, w, h };
}

const iou = (a, b) => {
  const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]), x2 = Math.min(a[2], b[2]), y2 = Math.min(a[3], b[3]);
  const i = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return i / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i);
};

export async function detectRips(img, { conf = 0.25, maxDet = 5 } = {}) {
  const lb = letterbox(img);
  const t0 = performance.now();
  const out = await session.run({ [session.inputNames[0]]: lb.tensor });
  const ms = performance.now() - t0;
  const o = out.output0.data, p = out.output1.data, N = out.output0.dims[2];

  // Candidates: rows 0-3 box (cx,cy,w,h), row 4 class score, rows 5-36 mask coefficients.
  let cand = [];
  for (let i = 0; i < N; i++) {
    const s = o[4 * N + i]; if (s < conf) continue;
    const cx = o[i], cy = o[N + i], bw = o[2 * N + i], bh = o[3 * N + i];
    cand.push({ score: s, i, b: [cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2] });
  }
  cand.sort((a, b) => b.score - a.score);
  const keep = [];
  for (const c of cand) { if (keep.length >= maxDet) break; if (keep.every(k => iou(k.b, c.b) < 0.5)) keep.push(c); }

  const rips = keep.map(k => {
    // Prototype mask (104x104) = sigmoid(coeffs · protos), cropped to the box.
    const m = new Float32Array(NP * NP);
    for (let j = 0; j < 32; j++) { const cf = o[(5 + j) * N + k.i], off = j * NP * NP; for (let q = 0; q < NP * NP; q++) m[q] += cf * p[off + q]; }
    // Map to source pixels (undo letterbox), nearest-neighbour sample of the 104 grid.
    const mask = new Uint8Array(lb.w * lb.h), sc = NP / S;
    for (let y = 0; y < lb.h; y++) {
      const ly = y * lb.r + lb.py; if (ly < k.b[1] || ly > k.b[3]) continue;
      const my = Math.min(NP - 1, (ly * sc) | 0);
      for (let x = 0; x < lb.w; x++) {
        const lx = x * lb.r + lb.px; if (lx < k.b[0] || lx > k.b[2]) continue;
        if (m[my * NP + Math.min(NP - 1, (lx * sc) | 0)] > 0) mask[y * lb.w + x] = 1; // logit > 0 ⇔ sigmoid > .5
      }
    }
    const box = k.b.map((v, n) => (v - (n % 2 ? lb.py : lb.px)) / lb.r);
    return { score: k.score, box, mask };
  });
  return { ms, rips, w: lb.w, h: lb.h };
}

/** Draw image + translucent red rip masks + labels onto a canvas. */
export function drawResult(canvas, img, res) {
  canvas.width = res.w; canvas.height = res.h;
  const g = canvas.getContext('2d'); g.drawImage(img, 0, 0);
  const ov = g.getImageData(0, 0, res.w, res.h), d = ov.data;
  for (const r of res.rips) for (let i = 0; i < r.mask.length; i++) if (r.mask[i]) { d[i * 4] = d[i * 4] * 0.45 + 255 * 0.55; d[i * 4 + 1] *= 0.45; d[i * 4 + 2] *= 0.45; }
  g.putImageData(ov, 0, 0);
  const lw = Math.max(2, res.w / 300);
  g.lineWidth = lw; g.strokeStyle = '#ff3b30'; g.fillStyle = '#ff3b30'; g.font = `600 ${Math.max(14, res.w / 40)}px system-ui`;
  for (const r of res.rips) {
    const [x1, y1, x2, y2] = r.box; g.strokeRect(x1, y1, x2 - x1, y2 - y1);
    g.fillText(`Possible rip ${(r.score * 100) | 0}%`, x1 + lw * 2, Math.max(y1 - lw * 3, res.w / 40));
  }
}
