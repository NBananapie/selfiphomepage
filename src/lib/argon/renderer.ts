import { ArgonConfig, InteractionState, SdfEntry } from './types';
import {
  fragmentShaderSource,
  particleFragmentShaderSource,
  particleVertexShaderSource,
  vertexShaderSource,
} from './shaders';
import { generateSdfForText, sampleSdfCpu, GLYPH_SPAN_RATIO } from './sdf';

const framing = {
  scale(width: number, height: number): [number, number] {
    const relative = (width / height) / (16 / 9);
    return relative < 1 ? [relative, 1] : [1, 1 / relative];
  },
};

/**
 * One powder grain. Positions and velocities are in canvas pixels (y down),
 * velocities are per 60 Hz frame.
 */
interface PowderParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number; // 0 = far / slow dust, 1 = near / faster dust
  dustSize: number; // diameter while floating, CSS px
  grainSize: number; // diameter while resting in the pile, CSS px
  sharpness: number;
  phase: number;
  target: number; // index into the glyph target list, -1 when not recruited
  charge: number; // 0..1, how strongly the field currently holds this grain
  glow: number; // 0..1, smoothed visual state (floating dust -> resting grain)
}

const NUM_PARTICLES = 16000;
const FLOATS_PER_PARTICLE = 6; // x, y, size, alpha, sharpness, glow

// Formation tuning (CSS px based, scaled by device pixel ratio at runtime)
const CAPTURE_RADIUS = 30; // inside this distance the grain is caught by the pile (spring + friction)
const SPRING_K = 0.08;
const AIR_DRAG = 0.045; // per-frame velocity loss in flight
const PILE_FRICTION = 0.38; // extra per-frame velocity loss once caught
const MAX_SPEED = 22;

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export class ArgonRenderer {
  public canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private program: WebGLProgram;
  private particleProgram: WebGLProgram;
  private quadBuffer: WebGLBuffer;
  private particleBuffer: WebGLBuffer;
  private particleData: Float32Array;
  private particles: PowderParticle[] = [];

  private noiseTexture: WebGLTexture;

  private currentMotifText: string = '';
  private currentSdfEntry: SdfEntry | null = null;

  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private particleUniforms: Record<string, WebGLUniformLocation | null> = {};

  private posAttr: number;
  private particlePosAttr: number;
  private particleAppAttr: number;

  // Powder field state
  private gathering = false;
  private fieldTime = 0;
  private anchorX = 0;
  private anchorY = 0;
  private lastTime = -1;
  private lastWidth = 0;
  private lastHeight = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl =
      canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: false }) ||
      canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });

    if (!gl) {
      throw new Error('WebGL is not supported in this browser.');
    }
    this.gl = gl;

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compilation error: ${info}`);
      }
      return shader;
    };

    const linkProgram = (vsSrc: string, fsSrc: string) => {
      const vs = compileShader(gl.VERTEX_SHADER, vsSrc);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw new Error(`Program link error: ${info}`);
      }
      return program;
    };

    this.program = linkProgram(vertexShaderSource, fragmentShaderSource);
    this.particleProgram = linkProgram(particleVertexShaderSource, particleFragmentShaderSource);

    this.quadBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    this.particleBuffer = gl.createBuffer()!;
    this.particleData = new Float32Array(NUM_PARTICLES * FLOATS_PER_PARTICLE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particleData.byteLength, gl.DYNAMIC_DRAW);

    const w = Math.max(1, canvas.width);
    const h = Math.max(1, canvas.height);
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const depth = Math.random();
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        depth,
        dustSize: 1.5 + depth * 2.2,
        grainSize: 2.2 + Math.random() * 2.6,
        sharpness: 0.45 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        target: -1,
        charge: 0,
        glow: 0,
      });
    }
    this.lastWidth = w;
    this.lastHeight = h;

    const uniformNames = [
      'resolution',
      'viewScale',
      'shift',
      'pointer',
      'darkMode',
      'softness',
      'beamIntensity',
      'grain',
      'energy',
      'phase',
      'noiseMap',
    ];
    uniformNames.forEach((n) => {
      this.uniforms[n] = gl.getUniformLocation(this.program, n);
    });

    this.posAttr = gl.getAttribLocation(this.program, 'position');
    this.particlePosAttr = gl.getAttribLocation(this.particleProgram, 'position');
    this.particleAppAttr = gl.getAttribLocation(this.particleProgram, 'appearance');

    this.particleUniforms = {
      resolution: gl.getUniformLocation(this.particleProgram, 'resolution'),
      shadowPass: gl.getUniformLocation(this.particleProgram, 'shadowPass'),
      shadowOffset: gl.getUniformLocation(this.particleProgram, 'shadowOffset'),
      darkMode: gl.getUniformLocation(this.particleProgram, 'darkMode'),
    };

    this.noiseTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    this.buildProceduralNoise(this.noiseTexture);
  }

  private buildProceduralNoise(texture: WebGLTexture) {
    const gl = this.gl;
    const sz = 512;
    const buf = new Uint8Array(sz * sz * 4);
    let st = 0x6d2b79f5;
    const nextByte = () => {
      st = (st + 0x9e3779b9) | 0;
      let z = st;
      z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
      z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
      return ((z ^ (z >>> 15)) >>> 24) & 255;
    };

    for (let i = 0; i < sz * sz * 4; i += 4) {
      buf[i] = nextByte();
      buf[i + 1] = nextByte();
      buf[i + 2] = nextByte();
      buf[i + 3] = 255;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sz, sz, 0, gl.RGBA, gl.UNSIGNED_BYTE, buf);
  }

  public updateMotif(text: string) {
    const cleanText = (text || '干').trim();
    if (this.currentMotifText === cleanText && this.currentSdfEntry?.ready) {
      return;
    }
    this.currentMotifText = cleanText;
    this.currentSdfEntry = generateSdfForText(cleanText, 512);
  }

  private pixelRatio() {
    const cssWidth = this.canvas.clientWidth;
    return cssWidth > 0 ? this.canvas.width / cssWidth : 1;
  }

  /** Side length of the glyph SDF box in canvas pixels. */
  private glyphBoxPx() {
    const dpr = this.pixelRatio();
    const cssMin = Math.min(this.canvas.width, this.canvas.height) / dpr;
    const glyphCss = Math.max(140, Math.min(260, cssMin * 0.35));
    return (glyphCss / GLYPH_SPAN_RATIO) * dpr;
  }

  /**
   * Switches the field on at (nx, ny) in normalized viewport coordinates.
   * Negative-space targets are paired with particles in their respective radial
   * sectors so grains stream in smoothly from all 360 degrees simultaneously,
   * without angular distortion, bias, or tilting.
   */
  public beginGather(nx: number, ny: number) {
    this.updateMotif(this.currentMotifText);
    const entry = this.currentSdfEntry;
    if (!entry?.ready) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const hx = nx * w;
    const hy = ny * h;

    const poolSize = entry.targets.length / 2;
    const targetCount = poolSize;
    const n = this.particles.length;

    // 72 angular bins (5 degrees each)
    const NUM_BINS = 72;
    const bins: number[][] = Array.from({ length: NUM_BINS }, () => []);
    const pDist = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const p = this.particles[i];
      p.target = -1;
      p.charge = 0;
      const dx = p.x - hx;
      const dy = p.y - hy;
      pDist[i] = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx);
      const binIdx = Math.max(0, Math.min(NUM_BINS - 1, Math.floor(((ang + Math.PI) / (2 * Math.PI)) * NUM_BINS)));
      bins[binIdx].push(i);
    }

    // Sort each bin by distance ascending (nearest grains in that direction preferred)
    for (let b = 0; b < NUM_BINS; b++) {
      bins[b].sort((a, bIdx) => pDist[a] - pDist[bIdx]);
    }

    const binPtr = new Int32Array(NUM_BINS);
    const t = entry.targets;

    for (let k = 0; k < targetCount; k++) {
      const ang = Math.atan2(t[k * 2 + 1], t[k * 2]);
      const binIdx = Math.max(0, Math.min(NUM_BINS - 1, Math.floor(((ang + Math.PI) / (2 * Math.PI)) * NUM_BINS)));

      let found = -1;
      for (let offset = 0; offset < NUM_BINS / 2; offset++) {
        for (const sign of (offset === 0 ? [0] : [1, -1])) {
          const b = (binIdx + sign * offset + NUM_BINS) % NUM_BINS;
          if (binPtr[b] < bins[b].length) {
            found = bins[b][binPtr[b]++];
            break;
          }
        }
        if (found !== -1) break;
      }

      if (found !== -1) {
        this.particles[found].target = k;
      }
    }

    this.fieldTime = 0;
    this.gathering = true;
    this.anchorX = hx;
    this.anchorY = hy;
  }

  /** Switches the field off: held grains are puffed outward and drift back to ambient dust. */
  public release() {
    if (!this.gathering) return;
    this.gathering = false;

    const dpr = this.pixelRatio();
    const box = this.glyphBoxPx();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.target < 0) continue;
      if (p.charge > 0.02) {
        const dx = p.x - this.anchorX;
        const dy = p.y - this.anchorY;
        const radial = 0.6 + 0.4 * Math.min(1.5, Math.hypot(dx, dy) / (box * 0.35));
        const kick = (0.9 + Math.random() * 2.2) * dpr * p.charge * radial;
        const ang = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
        p.vx += Math.cos(ang) * kick;
        p.vy += Math.sin(ang) * kick - Math.random() * 0.6 * dpr * p.charge;
      }
      p.target = -1;
      p.charge = 0;
    }
  }

  public render(config: ArgonConfig, time: number, interaction: InteractionState) {
    const gl = this.gl;
    const u = this.uniforms;
    const dur = Math.max(1, config.duration || 15);
    const phase = (((time % dur) + dur) % dur) / dur;

    const viewScale = framing.scale(this.canvas.width, this.canvas.height);
    const isDark = config.colorMode === 'dark' ? 1 : 0;
    const shift = [-0.08, 0.016];

    if (this.currentMotifText !== config.motifText) {
      this.updateMotif(config.motifText);
    }

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Background sky / aurora
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    const p = this.posAttr;
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
    gl.uniform1i(u.noiseMap, 0);

    gl.uniform2f(u.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2fv(u.viewScale, viewScale);
    gl.uniform2fv(u.shift, shift);
    gl.uniform2f(
      u.pointer,
      interaction.pointer[0] * viewScale[0],
      interaction.pointer[1] * viewScale[1]
    );
    gl.uniform1f(u.darkMode, isDark);
    gl.uniform1f(u.phase, phase);
    gl.uniform1f(u.softness, config.softness);
    gl.uniform1f(u.beamIntensity, config.beamIntensity);
    gl.uniform1f(u.grain, config.grain);
    gl.uniform1f(u.energy, config.energy);

    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(p);

    this.drawPowder(config, time, interaction);
  }

  private drawPowder(config: ArgonConfig, timeSec: number, interaction: InteractionState) {
    const gl = this.gl;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const isDark = config.colorMode === 'dark';

    // Keep grains in place relative to the viewport when the canvas is resized
    if (w !== this.lastWidth || h !== this.lastHeight) {
      const sx = w / Math.max(1, this.lastWidth);
      const sy = h / Math.max(1, this.lastHeight);
      for (const q of this.particles) {
        q.x *= sx;
        q.y *= sy;
      }
      this.lastWidth = w;
      this.lastHeight = h;
    }

    const dt = this.lastTime < 0 ? 1 / 60 : Math.min(0.1, Math.max(0, timeSec - this.lastTime));
    this.lastTime = timeSec;
    const f = Math.max(0.25, Math.min(2.5, dt * 60));

    const dpr = this.pixelRatio();
    const box = this.glyphBoxPx();
    const targets = this.currentSdfEntry?.targets;
    const targetCount = targets ? targets.length / 2 : 0;

    if (this.gathering) {
      this.fieldTime += dt;
      this.anchorX = interaction.holdPoint[0] * w;
      this.anchorY = interaction.holdPoint[1] * h;
    }

    const captureR = CAPTURE_RADIUS * dpr;
    const maxSpeed = MAX_SPEED * dpr;
    const ambientAlpha = isDark ? 0.26 : 0.3;
    const heldAlpha = isDark ? 0.94 : 0.98;
    const margin = 8 * dpr;
    const ambientRelax = 1 - Math.pow(0.965, f);
    const tSlow = timeSec;
    const entry = this.currentSdfEntry;

    const data = this.particleData;
    let front = 0; // grains with visible glow are packed from the front
    let back = NUM_PARTICLES; // floating dust is packed from the back
    let anyGlow = false;

    for (let i = 0; i < this.particles.length; i++) {
      const q = this.particles[i];

      // Ambient air flow in CSS px space
      const cx = q.x / dpr;
      const cy = q.y / dpr;
      const flowAng =
        Math.sin(cx * 0.004 + tSlow * 0.21 + q.phase) * 1.7 + Math.cos(cy * 0.0035 - tSlow * 0.17) * 1.3;
      const ambSpeed = (0.12 + 0.28 * q.depth) * dpr;
      const ambVx = Math.cos(flowAng) * ambSpeed;
      const ambVy = Math.sin(flowAng) * ambSpeed - 0.04 * dpr;

      let glowTarget = 0;

      if (q.target >= 0 && q.target < targetCount && targets) {
        // SIMULTANEOUS RECRUITMENT: All grains in the negative space field activate together!
        q.charge = Math.min(1, q.charge + 0.08 * f);

        const tx = this.anchorX + targets[q.target * 2] * box;
        const ty = this.anchorY + targets[q.target * 2 + 1] * box;
        const dx = tx - q.x;
        const dy = ty - q.y;
        const r = Math.hypot(dx, dy) + 1e-3;
        const capture = Math.max(0, Math.min(1, 1 - r / captureR));

        // Simultaneous suction with depth variation:
        // Near grains (depth=1) move faster and brighter; far grains stream in gently
        const flight = 1 - capture;
        const pull = (1.8 * dpr + Math.min(7.0 * dpr, r * 0.016)) * flight * (0.75 + 0.5 * q.depth);
        let ax = q.charge * ((dx / r) * pull + dx * SPRING_K * capture);
        let ay = q.charge * ((dy / r) * pull + dy * SPRING_K * capture);

        // Air turbulence only disturbs grains still in flight
        ax += ambVx * 0.2 * flight;
        ay += ambVy * 0.2 * flight;

        const drag = Math.pow(1 - (AIR_DRAG + PILE_FRICTION * capture * q.charge), f);
        q.vx = q.vx * drag + ax * f;
        q.vy = q.vy * drag + ay * f;

        const speed = Math.hypot(q.vx, q.vy);
        if (speed > maxSpeed) {
          const s = maxSpeed / speed;
          q.vx *= s;
          q.vy *= s;
        }

        // Settling micro-jitter in the resting powder pile
        if (capture > 0.8) {
          q.vx += (Math.random() - 0.5) * 0.12 * dpr;
          q.vy += (Math.random() - 0.5) * 0.12 * dpr;
        }

        glowTarget = q.charge * (0.4 + 0.6 * capture);
      } else {
        q.vx += (ambVx - q.vx) * ambientRelax;
        q.vy += (ambVy - q.vy) * ambientRelax;
        // Freshly released clumps settle slightly downward before thinning out
        q.vy += 0.02 * dpr * q.glow * f;
      }

      q.x += q.vx * f;
      q.y += q.vy * f;

      // Real-time SDF exclusion guard:
      // If a grain penetrates the strokes of the glyph (negative stencil), push it outward immediately!
      if (entry && entry.ready && q.charge > 0.1) {
        const u = (q.x - this.anchorX) / box + 0.5;
        const v = (q.y - this.anchorY) / box + 0.5;
        if (u > 0.01 && u < 0.99 && v > 0.01 && v < 0.99) {
          const sample = sampleSdfCpu(entry, u, v);
          if (sample.d < 0.8) {
            const pushDist = (1.2 - sample.d) * dpr;
            q.x += sample.nx * pushDist;
            q.y += sample.ny * pushDist;
            q.vx *= 0.25;
            q.vy *= 0.25;
            if (sample.d < 0) {
              glowTarget = 0;
            }
          }
        }
      }

      if (q.target < 0 && q.glow < 0.05) {
        if (q.x < -margin) q.x = w + margin;
        else if (q.x > w + margin) q.x = -margin;
        if (q.y < -margin) q.y = h + margin;
        else if (q.y > h + margin) q.y = -margin;
      }

      const rate = glowTarget > q.glow ? 0.12 : 0.03;
      q.glow += (glowTarget - q.glow) * Math.min(1, rate * f);

      const g = q.glow;
      const size = (q.dustSize + (q.grainSize - q.dustSize) * g) * dpr;
      const baseAlpha = ambientAlpha * (0.5 + 0.5 * q.depth);
      const alpha = baseAlpha + (heldAlpha - baseAlpha) * g;
      const sharp = q.sharpness + (0.92 - q.sharpness) * g;

      let k: number;
      if (g > 0.03) {
        k = front++ * FLOATS_PER_PARTICLE;
        anyGlow = true;
      } else {
        k = --back * FLOATS_PER_PARTICLE;
      }
      data[k] = q.x;
      data[k + 1] = q.y;
      data[k + 2] = size;
      data[k + 3] = alpha;
      data[k + 4] = sharp;
      data[k + 5] = g;
    }

    gl.useProgram(this.particleProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);

    const pPos = this.particlePosAttr;
    const pApp = this.particleAppAttr;
    const stride = FLOATS_PER_PARTICLE * 4;
    gl.enableVertexAttribArray(pPos);
    gl.vertexAttribPointer(pPos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(pApp);
    gl.vertexAttribPointer(pApp, 4, gl.FLOAT, false, stride, 8);

    gl.uniform2f(this.particleUniforms.resolution, w, h);
    gl.uniform1f(this.particleUniforms.darkMode, isDark ? 1 : 0);
    gl.uniform2f(this.particleUniforms.shadowOffset, 1.6 * dpr, 2.4 * dpr);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Floating dust first, then the pile's contact shadow, then the resting grains on top
    gl.uniform1f(this.particleUniforms.shadowPass, 0);
    if (back < NUM_PARTICLES) {
      gl.drawArrays(gl.POINTS, back, NUM_PARTICLES - back);
    }
    if (anyGlow) {
      gl.uniform1f(this.particleUniforms.shadowPass, 1);
      gl.drawArrays(gl.POINTS, 0, front);
      gl.uniform1f(this.particleUniforms.shadowPass, 0);
      gl.drawArrays(gl.POINTS, 0, front);
    }

    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(pPos);
    gl.disableVertexAttribArray(pApp);
  }

  public destroy() {
    const gl = this.gl;
    gl.deleteProgram(this.program);
    gl.deleteProgram(this.particleProgram);
    gl.deleteBuffer(this.quadBuffer);
    gl.deleteBuffer(this.particleBuffer);
    gl.deleteTexture(this.noiseTexture);
  }
}
