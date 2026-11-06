import { GlyphAtlasEntry, SdfEntry } from './types';

const INF = 1e12;

/** Glyph bounding span relative to the SDF box (the glyph is normalized to 320px inside a 512px box). */
export const GLYPH_SPAN_RATIO = 320 / 512;

// Powder distribution parameters, in SDF texture pixels.
const TARGET_POOL = 11500;
const GLYPH_EDGE_MARGIN = 0.8; // Negative space: points with d < 0.8px are inside ink and excluded

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

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number, seed: number) {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ seed;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function textSeed(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Samples resting positions for negative-space flour powder grains:
 * The glyph itself (dist < 0) is completely EMPTY/hollow (negative stencil).
 * Particles pile up densely around the stroke walls (dist in 1..16px),
 * fill the gaps between strokes and the surrounding flour bed,
 * and feather out organically with 2D noise.
 */
function buildPowderTargets(dist: Float32Array, size: number, text: string) {
  let minX = size;
  let minY = size;
  let maxX = -1;
  let maxY = -1;
  let inkCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (dist[y * size + x] < 0) {
        inkCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (inkCount === 0) {
    return { targets: new Float32Array(0), inkFraction: 0 };
  }

  const seed = textSeed(text);
  const rand = mulberry32(seed);
  const out = new Float32Array(TARGET_POOL * 2);
  let n = 0;

  // Maximum outer reach of the flour bed around the glyph
  const maxBed = 85;
  const x0 = Math.max(2, minX - maxBed);
  const y0 = Math.max(2, minY - maxBed);
  const x1 = Math.min(size - 3, maxX + maxBed);
  const y1 = Math.min(size - 3, maxY + maxBed);

  for (let attempt = 0; attempt < 1000000 && n < TARGET_POOL; attempt++) {
    const fx = x0 + rand() * (x1 - x0);
    const fy = y0 + rand() * (y1 - y0);
    const ix = fx | 0;
    const iy = fy | 0;
    const d = dist[iy * size + ix];

    // NEGATIVE SPACE: Inside the glyph (d <= 0.8px) MUST BE 100% EMPTY!
    if (d < GLYPH_EDGE_MARGIN) continue;

    // Organic outer contour: flour bed reach varies naturally with multi-scale 2D noise
    const noiseScale = 0.5 + 0.5 * valueNoise(fx / 32, fy / 32, seed) + 0.25 * valueNoise(fx / 15, fy / 15, seed + 19);
    const localMaxBed = 36 + 48 * noiseScale;
    if (d > localMaxBed) continue;

    // Density distribution:
    // 1. High density right along the stroke perimeter (d in 1..16px) for crisp silhouette readability
    // 2. Smooth exponential decay outwards into scattered powder dusting
    // 3. Granular clumping noise
    const edgeCling = Math.exp(-d / 18);
    const clump = 0.65 + 0.7 * hash2(fx / 2.5, fy / 2.5, seed + 47);
    const weight = Math.min(1.0, (0.32 + 0.85 * edgeCling) * clump);

    if (rand() < weight) {
      out[n * 2] = fx / size - 0.5;
      out[n * 2 + 1] = fy / size - 0.5;
      n++;
    }
  }

  return { targets: out.slice(0, n * 2), inkFraction: inkCount / (size * size) };
}

const sdfCache = new Map<string, SdfEntry>();
const atlasCache = new Map<string, GlyphAtlasEntry>();

function emptyEntry(key: string, size: number): SdfEntry {
  return {
    key,
    ready: false,
    size,
    distField: new Float32Array(size * size),
    targets: new Float32Array(0),
    inkFraction: 0,
  };
}

export function generateSdfForText(text: string, size = 512): SdfEntry {
  const key = `sdf:${text}:${size}`;
  if (sdfCache.has(key)) {
    return sdfCache.get(key)!;
  }

  if (typeof document === 'undefined') {
    return emptyEntry(key, size);
  }

  const scratch = document.createElement('canvas');
  scratch.width = size;
  scratch.height = size;
  const sctx = scratch.getContext('2d', { willReadFrequently: true });
  if (!sctx) {
    return emptyEntry(key, size);
  }

  sctx.clearRect(0, 0, size, size);
  sctx.fillStyle = '#ffffff';
  sctx.strokeStyle = '#ffffff';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';

  const isCjk = /[\u4e00-\u9fa5]/.test(text);
  const fontSize = isCjk ? 330 : text.length > 2 ? 250 : 300;
  sctx.font = `900 ${fontSize}px "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  sctx.fillText(text, size / 2, size / 2);
  // Slightly thicken strokes with rounded joins so the powder body reads as a solid mass
  sctx.lineJoin = 'round';
  sctx.lineWidth = fontSize * 0.025;
  sctx.strokeText(text, size / 2, size / 2);

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
    const targetSpan = size * GLYPH_SPAN_RATIO;
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

  const distField = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    distField[i] = outside[i] - inside[i];
  }

  const { targets, inkFraction } = buildPowderTargets(distField, size, text);

  const entry: SdfEntry = {
    key,
    ready: targets.length > 0,
    size,
    distField,
    targets,
    inkFraction,
  };
  sdfCache.set(key, entry);
  return entry;
}

export function generateGlyphAtlas(text: string): GlyphAtlasEntry {
  const key = `atlas:${text}`;
  if (atlasCache.has(key)) {
    return atlasCache.get(key)!;
  }
  return {
    key,
    ready: true,
    atlasCanvas: null,
    charCount: 1,
    atlasRows: 1,
    spaceMask: [false],
  };
}

export function sampleSdfCpu(
  sdf: SdfEntry,
  u: number,
  v: number
): { d: number; nx: number; ny: number } {
  if (u <= 0.01 || u >= 0.99 || v <= 0.01 || v >= 0.99) {
    const dx = u - 0.5;
    const dy = v - 0.5;
    const len = Math.hypot(dx, dy) || 1;
    return { d: 50, nx: dx / len, ny: dy / len };
  }
  const sz = sdf.size;
  const ix = Math.max(1, Math.min(sz - 2, Math.floor(u * sz)));
  const iy = Math.max(1, Math.min(sz - 2, Math.floor(v * sz)));
  const idx = iy * sz + ix;
  const df = sdf.distField;
  const d = df[idx];
  const gx = df[idx + 1] - df[idx - 1];
  const gy = df[idx + sz] - df[idx - sz];
  const len = Math.hypot(gx, gy) || 1e-4;
  return { d, nx: gx / len, ny: gy / len };
}
