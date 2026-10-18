import { GlyphAtlasEntry, SdfEntry } from './types';

const INF = 1e12;

function edt1d(f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number) {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  let k = 0;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dx = q - v[k];
    d[q] = dx * dx + f[v[k]];
  }
}

function edt2d(grid: Float64Array, width: number, height: number) {
  const maxDim = Math.max(width, height);
  const f = new Float64Array(maxDim);
  const d = new Float64Array(maxDim);
  const v = new Int32Array(maxDim);
  const z = new Float64Array(maxDim + 1);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];
    edt1d(f, d, v, z, height);
    for (let y = 0; y < height; y++) grid[y * width + x] = d[y];
  }
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) f[x] = grid[rowOffset + x];
    edt1d(f, d, v, z, width);
    for (let x = 0; x < width; x++) grid[rowOffset + x] = Math.sqrt(d[x]);
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const sdfCache = new Map<string, SdfEntry>();
const atlasCache = new Map<string, GlyphAtlasEntry>();

export function generateSdfForText(text: string, size = 512): SdfEntry {
  const key = `sdf:${text}:${size}`;
  if (sdfCache.has(key)) {
    return sdfCache.get(key)!;
  }

  if (typeof document === 'undefined') {
    return {
      key,
      ready: false,
      rgbaBytes: new Uint8Array(size * size * 4),
      contourPoints: [],
    };
  }

  const scratch = document.createElement('canvas');
  scratch.width = size;
  scratch.height = size;
  const sctx = scratch.getContext('2d', { willReadFrequently: true });
  if (!sctx) {
    return {
      key,
      ready: false,
      rgbaBytes: new Uint8Array(size * size * 4),
      contourPoints: [],
    };
  }

  sctx.clearRect(0, 0, size, size);
  sctx.fillStyle = '#ffffff';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  
  // Use ultra-bold sans-serif / CJK typography for clean geometrical SDF
  const isCjk = /[\u4e00-\u9fa5]/.test(text);
  const fontSize = isCjk ? 340 : text.length > 2 ? 260 : 320;
  sctx.font = `900 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  sctx.fillText(text, size / 2, size / 2);

  const imgData = sctx.getImageData(0, 0, size, size).data;
  let minX = size;
  let minY = size;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (imgData[(y * size + x) * 4 + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const nctx = normCanvas.getContext('2d', { willReadFrequently: true })!;
  nctx.clearRect(0, 0, size, size);

  if (maxX >= minX && maxY >= minY) {
    const bw = Math.max(1, maxX - minX + 1);
    const bh = Math.max(1, maxY - minY + 1);
    const targetSpan = 330;
    const scale = targetSpan / Math.max(bw, bh);
    const dw = bw * scale;
    const dh = bh * scale;
    const dx = (size - dw) * 0.5;
    const dy = (size - dh) * 0.5;
    nctx.imageSmoothingEnabled = true;
    nctx.imageSmoothingQuality = 'high';
    nctx.drawImage(scratch, minX, minY, bw, bh, dx, dy, dw, dh);
  }

  const normData = nctx.getImageData(0, 0, size, size).data;
  const outside = new Float64Array(size * size);
  const inside = new Float64Array(size * size);

  for (let i = 0; i < size * size; i++) {
    const a = normData[i * 4 + 3] / 255;
    if (a <= 0.004) {
      outside[i] = INF;
      inside[i] = 0;
    } else if (a >= 0.996) {
      outside[i] = 0;
      inside[i] = INF;
    } else {
      const delta = 0.5 - a;
      const o = Math.max(0, delta);
      const ins = Math.max(0, -delta);
      outside[i] = o * o;
      inside[i] = ins * ins;
    }
  }

  edt2d(outside, size, size);
  edt2d(inside, size, size);

  const rgbaBytes = new Uint8Array(size * size * 4);
  const rawContours: [number, number, number][] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const dist = outside[idx] - inside[idx];
      const norm = Math.max(0, Math.min(1, 0.5 + dist / 256));
      const u16 = Math.round(norm * 65535);
      const pIdx = idx * 4;
      rgbaBytes[pIdx] = (u16 >> 8) & 255;
      rgbaBytes[pIdx + 1] = u16 & 255;
      rgbaBytes[pIdx + 2] = dist < 0 ? 255 : 0;
      rgbaBytes[pIdx + 3] = 255;

      if (Math.abs(dist) <= 1.35 && ((x + y) & 1) === 0) {
        const tcX = (x + 0.5) / size;
        const tcY = (y + 0.5) / size;
        const gx = (tcX - 0.5) * 0.96;
        const gy = (tcY - 0.5) * 0.96;
        const sx = 0.50 + gx / 1.7778;
        const sy = 0.50 + gy;
        const idleW = Math.min(
          1.0,
          Math.max(
            0.25,
            smooth(-0.02, -0.22, gx) * smooth(-0.08, 0.25, gy) +
              smooth(0.02, 0.22, gx) * smooth(0.12, -0.22, gy) * 0.85
          )
        );
        rawContours.push([sx, sy, idleW]);
      }
    }
  }

  const contourPoints: [number, number, number][] = [];
  const maxPts = 320;
  if (rawContours.length > 0) {
    const stride = Math.max(1, Math.floor(rawContours.length / maxPts));
    for (let i = 0; i < rawContours.length; i += stride) {
      contourPoints.push(rawContours[i]);
    }
  }

  const entry: SdfEntry = {
    key,
    ready: true,
    rgbaBytes,
    contourPoints,
  };
  sdfCache.set(key, entry);
  return entry;
}

export function generateGlyphAtlas(text: string): GlyphAtlasEntry {
  const key = `atlas:${text}`;
  if (atlasCache.has(key)) {
    return atlasCache.get(key)!;
  }

  if (typeof document === 'undefined') {
    return {
      key,
      ready: false,
      atlasCanvas: null,
      charCount: 1,
      atlasRows: 1,
      spaceMask: [false],
    };
  }

  const clean = text.trim() || '干';
  const chars = [clean, '✦'];
  const charCount = 2;
  const atlasRows = 2;

  const boxSize = 256;
  const atlasWidth = 1024;
  const atlasHeight = boxSize * atlasRows;

  const atlasCanvas = document.createElement('canvas');
  atlasCanvas.width = atlasWidth;
  atlasCanvas.height = atlasHeight;
  const actx = atlasCanvas.getContext('2d');
  if (!actx) {
    return { key, ready: false, atlasCanvas: null, charCount, atlasRows, spaceMask: [false] };
  }

  actx.clearRect(0, 0, atlasWidth, atlasHeight);
  const spaceMask: boolean[] = [];

  for (let r = 0; r < charCount; r++) {
    const ch = chars[r];
    if (!ch || ch.trim() === '') {
      spaceMask.push(true);
      continue;
    }
    spaceMask.push(false);

    const tile = document.createElement('canvas');
    tile.width = boxSize;
    tile.height = boxSize;
    const tctx = tile.getContext('2d')!;
    tctx.clearRect(0, 0, boxSize, boxSize);
    tctx.fillStyle = '#ffffff';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    const isCjk = /[\u4e00-\u9fa5]/.test(ch);
    tctx.font = `700 ${isCjk ? 150 : 160}px "PingFang SC", "Microsoft YaHei", Inter, sans-serif`;
    tctx.fillText(ch, boxSize / 2, boxSize / 2);

    // Multi-level Mipmap blur columns: 0px, 2.5px, 6.5px, 14px
    const blurLevels = [0, 2.5, 6.5, 14];
    blurLevels.forEach((blur, colIdx) => {
      actx.filter = `blur(${blur}px)`;
      actx.drawImage(tile, colIdx * boxSize, r * boxSize, boxSize, boxSize);
    });
    actx.filter = 'none';
  }

  const entry: GlyphAtlasEntry = {
    key,
    ready: true,
    atlasCanvas,
    charCount,
    atlasRows,
    spaceMask,
  };
  atlasCache.set(key, entry);
  return entry;
}
