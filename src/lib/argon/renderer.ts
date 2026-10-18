import { ArgonConfig, InteractionState, SdfEntry } from './types';
import {
  fragmentShaderSource,
  particleFragmentShaderSource,
  particleVertexShaderSource,
  vertexShaderSource,
} from './shaders';
import { generateGlyphAtlas, generateSdfForText } from './sdf';

const anchors: [number, number][][] = [
  [[0.5, 0.26], [0.75, 0.68]],
  [[0.29, 0.18], [0.69, 0.61]],
  [[0.38, 0.28], [0.78, 0.49]],
];

const framing = {
  scale(width: number, height: number): [number, number] {
    const relative = (width / height) / (16 / 9);
    return relative < 1 ? [relative, 1] : [1, 1 / relative];
  },
  toScene(point: [number, number], width: number, height: number): [number, number] {
    const scale = this.scale(width, height);
    return [(point[0] - 0.5) * scale[0] + 0.5, (point[1] - 0.5) * scale[1] + 0.5];
  },
};

const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class ArgonRenderer {
  public canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private program: WebGLProgram;
  private particleProgram: WebGLProgram;
  private quadBuffer: WebGLBuffer;
  private particleBuffer: WebGLBuffer;
  private particleData: Float32Array;

  private noiseTexture: WebGLTexture;
  private motifTexture: WebGLTexture;
  private particleTexture1: WebGLTexture;
  private particleTexture2: WebGLTexture;

  private currentMotifText: string = '';
  private currentSdfEntry: SdfEntry | null = null;
  private currentGlyph1Key: string = '';
  private currentGlyph2Key: string = '';

  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private particleUniforms: Record<string, WebGLUniformLocation | null> = {};

  private posAttr: number;
  private particlePosAttr: number;
  private particleAppAttr: number;

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
    this.particleData = new Float32Array(18000 * 6);

    const uniformNames = [
      'resolution',
      'viewScale',
      'shift',
      'pointer',
      'tap',
      'focusPoint',
      'focusAmount',
      'renderPass',
      'darkMode',
      'neutralMode',
      'family',
      'zoom',
      'rotation',
      'softness',
      'beamIntensity',
      'showMotif',
      'motifMode',
      'motifSize',
      'motifPosX',
      'motifPosY',
      'motifOpacity',
      'idleEvap',
      'motifEvap',
      'grain',
      'energy',
      'phase',
      'tapAge',
      'seed',
      'noiseMap',
      'motifSdfMap',
    ];
    uniformNames.forEach((n) => {
      this.uniforms[n] = gl.getUniformLocation(this.program, n);
    });

    this.posAttr = gl.getAttribLocation(this.program, 'position');
    this.particlePosAttr = gl.getAttribLocation(this.particleProgram, 'position');
    this.particleAppAttr = gl.getAttribLocation(this.particleProgram, 'appearance');

    this.particleUniforms = {
      resolution: gl.getUniformLocation(this.particleProgram, 'resolution'),
      darkMode: gl.getUniformLocation(this.particleProgram, 'darkMode'),
      glyphRows: gl.getUniformLocation(this.particleProgram, 'glyphRows'),
      glyph: gl.getUniformLocation(this.particleProgram, 'glyph'),
    };

    const makeTexture = (nearest = false, repeat = false) => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, nearest ? gl.NEAREST : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, nearest ? gl.NEAREST : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      return t;
    };

    this.noiseTexture = makeTexture(true, true);
    this.motifTexture = makeTexture(true, false);
    this.particleTexture1 = makeTexture(false, false);
    this.particleTexture2 = makeTexture(false, false);

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

    const gl = this.gl;
    const entry = generateSdfForText(cleanText, 512);
    this.currentSdfEntry = entry;

    gl.bindTexture(gl.TEXTURE_2D, this.motifTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      512,
      512,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      entry.rgbaBytes
    );

    const atlasEntry = generateGlyphAtlas(cleanText);
    if (atlasEntry.atlasCanvas) {
      [this.particleTexture1, this.particleTexture2].forEach((tex) => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          atlasEntry.atlasCanvas!
        );
        if (atlasEntry.atlasRows === 1) {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
      });
      this.currentGlyph1Key = atlasEntry.key;
      this.currentGlyph2Key = atlasEntry.key;
    }
  }

  public render(config: ArgonConfig, time: number, interaction: InteractionState) {
    const gl = this.gl;
    const u = this.uniforms;
    const a = anchors[config.family] || anchors[0];
    const delta = config.curve.map((v, i) => v - config.center[i]);
    const baseAngle = Math.atan2(a[1][1] - a[0][1], a[1][0] - a[0][0]);
    const rotation = Math.atan2(delta[1], delta[0]) - baseAngle;
    const zoom =
      1 +
      (config.spread - 80) * 0.006 +
      (Math.hypot(...delta) - Math.hypot(a[1][0] - a[0][0], a[1][1] - a[0][1])) * 0.22;
    const shift = config.center.map((v, i) => (v - a[0][i]) * 0.8);
    const dur = Math.max(1, config.duration || 15);
    const phase = (((time % dur) + dur) % dur) / dur;

    const viewScale = framing.scale(this.canvas.width, this.canvas.height);
    const isDark = config.colorMode === 'dark' ? 1 : 0;
    const isNeutral = config.colorMode === 'neutral' ? 1 : 0;

    if (this.currentMotifText !== config.motifText) {
      this.updateMotif(config.motifText);
    }

    const sceneInteraction = {
      ...interaction,
      pointer: [interaction.pointer[0] * viewScale[0], interaction.pointer[1] * viewScale[1]] as [number, number],
      tap: framing.toScene(interaction.tap, this.canvas.width, this.canvas.height),
      focus: framing.toScene(interaction.hover, this.canvas.width, this.canvas.height),
    };

    const drawQuad = (pass: number) => {
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      const p = this.posAttr;
      gl.enableVertexAttribArray(p);
      gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.noiseTexture);
      gl.uniform1i(u.noiseMap, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.motifTexture);
      gl.uniform1i(u.motifSdfMap, 1);

      gl.uniform2f(u.resolution, this.canvas.width, this.canvas.height);
      gl.uniform2fv(u.viewScale, viewScale);
      gl.uniform2fv(u.shift, shift);
      gl.uniform2fv(u.pointer, sceneInteraction.pointer);
      gl.uniform2fv(u.tap, sceneInteraction.tap);
      gl.uniform2fv(u.focusPoint, sceneInteraction.focus);
      gl.uniform1f(u.focusAmount, interaction.hoverAmount || 0);
      gl.uniform1f(u.renderPass, pass);
      gl.uniform1f(u.darkMode, isDark);
      gl.uniform1f(u.neutralMode, isNeutral);
      gl.uniform1f(u.tapAge, interaction.tapAge ?? 10);
      gl.uniform1f(u.phase, phase);
      gl.uniform1f(u.zoom, zoom);
      gl.uniform1f(u.rotation, rotation);
      gl.uniform1f(u.showMotif, config.showMotif ? 1 : 0);
      gl.uniform1f(u.motifMode, 1.0);

      const floatUniforms: (keyof ArgonConfig)[] = [
        'family',
        'seed',
        'softness',
        'beamIntensity',
        'motifSize',
        'motifPosX',
        'motifPosY',
        'motifOpacity',
        'idleEvap',
        'motifEvap',
        'grain',
        'energy',
      ];
      floatUniforms.forEach((n) => {
        if (u[n]) gl.uniform1f(u[n]!, Number(config[n]) || 0);
      });

      if (pass > 0) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.disable(gl.BLEND);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disable(gl.BLEND);
      gl.disableVertexAttribArray(p);
    };

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Pass 0: Sky / Aurora background
    drawQuad(0);

    // Back sparks
    if (config.density > 0) {
      this.drawSparks(config, phase, shift, zoom, rotation, sceneInteraction, 'back', 1);
    }
    if (config.secondMesh && config.density2 > 0) {
      this.drawSparks(config, phase, shift, zoom, rotation, sceneInteraction, 'back', 2);
    }

    // Pass 1: Central SDF Glyph
    if (config.showMotif) {
      drawQuad(1);
    }

    // Front sparks
    if (config.density > 0) {
      this.drawSparks(config, phase, shift, zoom, rotation, sceneInteraction, 'front', 1);
    }
    if (config.secondMesh && config.density2 > 0) {
      this.drawSparks(config, phase, shift, zoom, rotation, sceneInteraction, 'front', 2);
    }
  }

  private drawSparks(
    s: ArgonConfig,
    phase: number,
    shift: number[],
    zoom: number,
    rotation: number,
    interaction: any,
    layerPass: 'all' | 'back' | 'front',
    meshIndex: 1 | 2
  ) {
    const isSecond = meshIndex === 2;
    const meshDensity = isSecond ? (s.density2 ?? 66) : (s.density ?? 20);
    if (meshDensity <= 0) return;

    const isLight = s.colorMode === 'light';
    const isDark = s.colorMode === 'dark' ? 1 : 0;
    const rawModeOpacity = isLight
      ? isSecond
        ? (s.spark2OpacityLight ?? 69)
        : (s.sparkOpacityLight ?? 35)
      : isSecond
      ? (s.spark2OpacityDark ?? 38)
      : (s.sparkOpacityDark ?? 53);

    const modeOpacity = Math.max(0, Math.min(100, rawModeOpacity)) / 100;
    if (modeOpacity <= 0.001) return;

    const glyphEntry = generateGlyphAtlas(s.motifText);
    const charCount = glyphEntry?.charCount || 1;
    const spaceMask = glyphEntry?.spaceMask || null;
    const spinScale = 0.18;

    const meshScaleVal = isSecond ? (s.spark2Scale ?? 141) : (s.sparkScale ?? 84);
    const meshFalloffVal = isSecond ? (s.spark2SizeFalloff ?? 34) : (s.sparkSizeFalloff ?? 22);
    const meshDepthVal = isSecond ? (s.meshDepth2 ?? 72) : (s.meshDepth ?? 48);
    const meshPosX = isSecond ? (s.spark2PosX ?? 17) : (s.sparkPosX ?? 0);
    const meshPosY = isSecond ? (s.spark2PosY ?? -22) : (s.sparkPosY ?? 10);
    const activeTexture = isSecond ? this.particleTexture2 : this.particleTexture1;

    const meshSeed = (s.seed || 36) + (isSecond ? 517 : 0);
    const meshPhase = (phase + (isSecond ? 0.37 : 0)) % 1;

    const gl = this.gl;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const invCanvasW = 1 / canvasW;
    const invCanvasH = 1 / canvasH;
    const viewScale = framing.scale(canvasW, canvasH);
    const invViewScale0 = 1 / viewScale[0];
    const invViewScale1 = 1 / viewScale[1];

    const shortEdge = Math.min(canvasW, canvasH);
    const metric0 = canvasW / shortEdge;
    const metric1 = canvasH / shortEdge;
    const invMetric0 = 1 / metric0;
    const invMetric1 = 1 / metric1;

    const hover = interaction.hover;
    const reactivityScale = Math.max(0, Math.min(100, s.hoverReactivity ?? 30)) / 65;
    const hoverSizeBoost = Math.max(0, Math.min(100, s.hoverSize ?? 100)) / 50;
    const reach = 0.07 + Math.max(0, Math.min(100, s.reach ?? 100)) * 0.0036;
    const reachSq = reach * reach;
    const rawHoverAmt = Math.max(0, Math.min(1, interaction.hoverAmount || 0));
    const effectiveHoverAmt = rawHoverAmt * reactivityScale;
    const force = Math.max(0, Math.min(100, s.repulsion ?? 20)) * 0.011 * effectiveHoverAmt;

    const sparkOffX = meshPosX * 0.0075;
    const sparkOffY = meshPosY * 0.0075;
    const data = this.particleData;
    let count = 0;

    const a = meshPhase * Math.PI * 2;
    const waveAmp = meshDepthVal / 60;
    const densityScale = 0.52 + meshDensity * 0.0085;
    const promSize = (isLight ? 0.62 : 0.54) + s.prominence * 0.0068;
    const scaleMult = Math.max(15, Math.min(300, meshScaleVal)) / 100;
    const falloffT = Math.max(0, Math.min(100, meshFalloffVal)) / 100;
    const opacityGain = modeOpacity <= 0.75 ? modeOpacity / 0.75 : 1.0 + ((modeOpacity - 0.75) / 0.25) * 0.90;
    const promAlpha = ((isLight ? 1.28 : 0.82) + s.prominence * (isLight ? 0.009 : 0.0068)) * opacityGain;
    const lightBlurScale = isLight ? 0.56 : 1.0;
    const highOpacityRelax = 1 - 0.45 * Math.max(0, (modeOpacity - 0.65) / 0.35);
    const blurAtten = (isLight ? 0.72 : 1.28) * highOpacityRelax;

    const focusScene = interaction.focus || [0.50, 0.50];
    const cosRot = Math.cos(rotation);
    const sinRot = Math.sin(rotation);
    const shiftOffX = 0.5 + shift[0] * 0.55 - Math.sin(a) * s.energy * 0.00022;
    const shiftOffY = 0.5 + shift[1] * 0.55 - (Math.cos(a) - 1) * s.energy * 0.00022;

    const pointer = interaction.pointer || [0, 0];
    const ptrScale = 0.5 + 0.5 * reactivityScale;
    const ptrX = pointer[0] * ptrScale;
    const ptrY = pointer[1] * ptrScale;

    const tapAge = interaction.tapAge ?? 10;
    const hasTap = tapAge < 4;
    const tap = interaction.tap || [0.5, 0.5];
    const hasHover = Boolean(hover && rawHoverAmt > 0.005);
    const reactCoupling = 0.35 + 0.65 * Math.min(1.5, reactivityScale);
    const radiusFactor = (1.6 * canvasH) / 2160;

    const perspectiveSize = (camProx: number) => 1.08 / (2.42 - 1.55 * Math.max(0, Math.min(1, camProx)));
    const expFast = (x: number) => (x < -12 ? 0 : Math.exp(x));
    const pow145 = (u: number) => (u <= 0 ? 0 : u * (0.12 * u + 0.88 * Math.sqrt(u)));
    const tapDecay = hasTap ? expFast(-tapAge * 2.2) : 0;
    const uniformBaseSize = 2.15 * promSize * scaleMult;

    const computeParticleSize = (layerBase: number, camProx: number, u: number, v: number, z: number, rVal: number) => {
      if (falloffT <= 0.001) return uniformBaseSize;
      const edgeTaper = smooth(0.0, 0.32, u) * (1 - 0.65 * smooth(0.78, 1.0, u)) * (1 - 0.60 * smooth(0.62, 0.98, v));
      const crestBoost = 0.55 + 0.75 * Math.max(0, Math.min(1, 0.5 + z * 0.65));
      const depthFactor = perspectiveSize(camProx);
      const rCurve = Math.pow(rVal, 1.6);
      const particleSpread = 0.38 + 1.45 * rCurve;
      const contrastExp = 0.55 + 1.35 * falloffT;
      const rawRatio = Math.max(0.16, (layerBase / 2.15) * depthFactor * (0.45 + 0.75 * edgeTaper) * crestBoost * particleSpread);
      const contrastedRatio = Math.pow(rawRatio, contrastExp);
      return uniformBaseSize * (1 + (contrastedRatio - 1) * Math.min(1, falloffT * 1.35));
    };

    const cursorBlurShift = (x: number, y: number, baseBlur: number) => {
      if (effectiveHoverAmt < 0.001) return baseBlur;
      const sx = x + sparkOffX;
      const sy = y + sparkOffY;
      const w = Math.sin(sy * 14 + sx * 9 + a * 2) * 0.045;
      const dx = (sx - focusScene[0]) * 1.35 + w;
      const dy = sy - focusScene[1] - w * 0.7;
      const u1 = dx * 0.82 - dy * 0.57;
      const v1 = dx * 0.57 + dy * 0.82;
      const plume = expFast(-(u1 * u1) / 0.055 - (v1 * v1) / 0.016);
      return Math.max(0.002, Math.min(0.28, baseBlur * (1 - 0.35 * Math.min(1, effectiveHoverAmt) * plume) + 0.08 * effectiveHoverAmt * plume));
    };

    const emit = (
      x: number,
      y: number,
      zHeight: number,
      size: number,
      alpha: number,
      blur: number,
      spin: number,
      seedOffset: number,
      parallaxDepth = 0.018,
      applySparkOffset = true,
      charIdx = 0
    ) => {
      if (alpha < 0.005 || (spaceMask && spaceMask[charIdx])) return;
      if (applySparkOffset) {
        const rx = (x - 0.5) * zoom;
        const ry = (y - 0.5) * zoom;
        x = cosRot * rx - sinRot * ry + shiftOffX;
        y = sinRot * rx + cosRot * ry + shiftOffY;
      } else {
        x -= Math.sin(a) * s.energy * 0.00010;
        y -= (Math.cos(a) - 1) * s.energy * 0.00010;
      }

      const effParallax = parallaxDepth * (1 + zHeight * 0.65);
      x -= ptrX * effParallax;
      y -= ptrY * effParallax;

      const localScreenX = (x - 0.5) * invViewScale0 + 0.5;
      const localScreenY = (y - 0.5) * invViewScale1 + 0.5;
      const fadeStart = 0.54 + 0.26 * smooth(0.32, 0.95, localScreenX);
      alpha *= pow145(1 - smooth(fadeStart, 0.90, localScreenY));

      if (applySparkOffset) {
        x += sparkOffX;
        y += sparkOffY;
      }

      let rippleBoost = 0;
      if (hasTap) {
        const dx = x - tap[0];
        const dy = y - tap[1];
        const d = Math.sqrt(dx * dx + dy * dy) + 0.00001;
        const wave = Math.sin(d * 34 - tapAge * 7.5) * tapDecay;
        x -= (dx / d) * wave * 0.012;
        y -= (dy / d) * wave * 0.012;
        rippleBoost = Math.max(0, wave * 0.25);
      }

      x = (x - 0.5) * invViewScale0 + 0.5;
      y = (y - 0.5) * invViewScale1 + 0.5;

      let cursorLift = 0;
      let sizeMultiplier = 1;

      if (hasHover) {
        const dx = (x - hover[0]) * metric0;
        const dy = (y - hover[1]) * metric1;
        const distSq = dx * dx + dy * dy;

        if (distSq < reachSq) {
          const distance = Math.sqrt(distSq);
          const falloff = 1 - smooth(0, reach, distance);
          const smoothBell = pow145(falloff);

          if (effectiveHoverAmt > 0.005) {
            const push = reach * 0.85 * force * smoothBell * (0.85 + 0.3 * zHeight);
            const wave3D = Math.sin(distance * 22 - a * 2) * 0.007 * effectiveHoverAmt * smoothBell;
            let dirX: number, dirY: number;
            if (distance > 0.00001) {
              const invDist = 1 / distance;
              dirX = dx * invDist;
              dirY = dy * invDist;
            } else {
              const angle = rand(seedOffset + meshSeed) * Math.PI * 2;
              dirX = Math.cos(angle);
              dirY = Math.sin(angle);
            }
            const swirl = 0.0045 * effectiveHoverAmt * smoothBell * (zHeight * 0.5 + 0.5);
            x += (dirX * (push + wave3D) - dirY * swirl) * invMetric0;
            y += (dirY * (push + wave3D) + dirX * swirl) * invMetric1;
            cursorLift = smoothBell * effectiveHoverAmt * 0.34;
          }

          if (hoverSizeBoost > 0.005) {
            const individualHarmonic = 0.78 + 0.44 * Math.sin(a * 2 + rand(seedOffset * 1.7 + meshSeed) * 6.283);
            sizeMultiplier = 1 + hoverSizeBoost * rawHoverAmt * reactCoupling * smoothBell * individualHarmonic * 1.15;
            blur = Math.max(0.002, blur * (1 - 0.55 * smoothBell * Math.min(1, hoverSizeBoost * rawHoverAmt)));
          }
        }
      }

      const finalSize = size * sizeMultiplier * (1 + cursorLift * 0.22 + rippleBoost);
      const finalAlpha = Math.min(0.98, alpha * (1 + rippleBoost));
      const safeBlur = Math.max(0.001, Math.min(0.48, blur));
      const spriteSize = finalSize * (1 + safeBlur * 1.5) * invViewScale1;
      const radius = spriteSize * radiusFactor;
      const rxBound = radius * invCanvasW;
      const ryBound = radius * invCanvasH;

      if (x < -rxBound || x > 1 + rxBound || y < -ryBound || y > 1 + ryBound || finalAlpha < 0.005 || count >= 18000) {
        return;
      }

      const k = count++ * 6;
      data[k] = x;
      data[k + 1] = y;
      data[k + 2] = spriteSize;
      data[k + 3] = finalAlpha;
      data[k + 4] = spin * spinScale;
      data[k + 5] = charIdx + safeBlur;
    };

    const speedFactor = 0.25 + (s.energy / 36) * 0.75;
    const alignRows = (r: number) => (charCount > 1 ? Math.max(charCount, Math.round(r / charCount) * charCount) : r);
    const rowStep = charCount === 2 ? 1 : 2;

    if (layerPass !== 'front') {
      const cols1 = Math.max(8, Math.round(52 * densityScale));
      const rows1 = alignRows(Math.max(6, Math.round(32 * densityScale)));
      for (let j = 0; j < rows1; j++) {
        for (let i = 0; i < cols1; i++) {
          const u = i / (cols1 - 1);
          const v = (j / rows1 + meshPhase * 0.35 * speedFactor) % 1;
          const wavePhase1 = u * 5.2 + v * 3.8 - a;
          const wavePhase2 = u * 3.4 - v * 5.6 + a;
          const z = (0.58 * Math.sin(wavePhase1) + 0.42 * Math.cos(wavePhase2)) * waveAmp;
          const dZdu = (0.58 * 5.2 * Math.cos(wavePhase1) - 0.42 * 3.4 * Math.sin(wavePhase2)) * waveAmp * 0.0045;
          const dZdv = (0.58 * 3.8 * Math.cos(wavePhase1) + 0.42 * 5.6 * Math.sin(wavePhase2)) * waveAmp * 0.0045;
          const baseX = 0.46 + u * 0.54 - v * 0.14;
          const baseY = -0.04 + v * 0.62 - (1 - u) * 0.10;
          const x = baseX + dZdu + 0.018 * Math.sin(v * 4.4 + u * 2.6 - a) * waveAmp;
          const y = baseY + dZdv - z * 0.028 * waveAmp;
          const edgeFade = smooth(0.02, 0.22, u) * (1 - smooth(0.88, 0.99, u)) * smooth(0.02, 0.18, v) * (1 - smooth(0.74, 0.97, v));
          const rightBoost = (isLight ? 0.58 : 0.42) + (isLight ? 0.42 : 0.58) * smooth(0.54, 0.92, x) * smooth(0.58, 0.06, y);
          const camProx = Math.max(0, Math.min(1, 0.18 + 0.24 * smooth(0.08, 0.90, v) + 0.18 * z));
          const baseBlur = Math.min(0.26, 0.004 + 0.13 * smooth(0.25, 0.85, 1 - u) + 0.07 * Math.abs(z - 0.15)) * lightBlurScale;
          const progBlur = cursorBlurShift(x, y, baseBlur);
          const rSize = rand(i * 3.1 + j * 7.7 + meshSeed);
          const size = computeParticleSize(1.9, camProx, u, v, z, rSize);
          const ridgeHighlight = 0.78 + 0.32 * Math.max(0, z);
          const alpha = (isLight ? 0.46 : 0.38) * edgeFade * rightBoost * ridgeHighlight * promAlpha;
          const charIdx = charCount > 1 ? (i + j * rowStep) % charCount : 0;
          emit(x, y, z, size, alpha, progBlur, 0.22 + u * 0.48 - v * 0.18, i * 17 + j * 31, 0.010 + 0.012 * camProx, true, charIdx);
        }
      }
    }

    if (layerPass !== 'back') {
      const cols3 = Math.max(8, Math.round(44 * densityScale));
      const rows3 = alignRows(Math.max(6, Math.round(26 * densityScale)));
      for (let j = 0; j < rows3; j++) {
        for (let i = 0; i < cols3; i++) {
          const u = i / (cols3 - 1);
          const v = (j / rows3 + meshPhase * 0.68 * speedFactor + 0.67) % 1;
          const z = (0.65 * Math.cos(u * 4.0 + v * 3.6 - a) + 0.35 * Math.sin(v * 6.0 - a)) * waveAmp;
          const x = 0.38 + u * 0.58 + 0.028 * Math.cos(v * 4.8 + u * 2.2 - a) * waveAmp;
          const y = 0.04 + v * 0.64 + 0.046 * Math.sin(u * 3.8 - 0.6) * waveAmp - z * 0.032;
          const wingMask = smooth(0.04, 0.22, u) * (1 - smooth(0.86, 0.99, u)) * smooth(0.04, 0.20, v) * (1 - smooth(0.78, 0.96, v));
          const camProx = Math.max(0, Math.min(1, 0.38 + 0.34 * smooth(0.08, 0.92, v) + 0.24 * z));
          const focal = Math.abs(v - 0.38 - 0.26 * (u - 0.58) + z * 0.12);
          const baseBlur = Math.min(0.26, 0.004 + 0.22 * smooth(0.06, 0.45, focal)) * lightBlurScale;
          const progBlur = cursorBlurShift(x, y, baseBlur);
          const rSize = rand(i * 7.9 + j * 11.3 + meshSeed);
          const size = computeParticleSize(2.45, camProx, u, v, z, rSize);
          const alpha = (isLight ? 0.48 : 0.38) * wingMask * (1 - progBlur * blurAtten) * promAlpha;
          const charIdx = charCount > 1 ? (i + j * rowStep) % charCount : 0;
          emit(x, y, z, size, alpha, progBlur, 0.32 + u * 0.4 - v * 0.15, i * 29 + j * 53 + 3000, 0.024 + 0.026 * camProx, true, charIdx);
        }
      }

      // Evaporation sparks around the central glyph contour
      if (s.showMotif && !isSecond && this.currentSdfEntry?.contourPoints?.length) {
        const s4 = Math.max(0.4, Math.min(2.0, (s.motifSize ?? 100) / 100));
        const offX = (s.motifPosX ?? 0) * 0.0075;
        const offY = (s.motifPosY ?? 0) * 0.0075;
        const idleStrength = Math.max(0, (s.idleEvap ?? 46) / 58);
        const hoverStrength = rawHoverAmt * Math.max(0, (s.motifEvap ?? 42) / 54);
        const contours = this.currentSdfEntry.contourPoints;

        if (idleStrength > 0.05 || hoverStrength > 0.02) {
          const evapCount = Math.round(110 * densityScale);
          for (let k = 0; k < evapCount; k++) {
            const r1 = rand(k * 13.7 + s.seed);
            const r2 = rand(k * 29.3 + s.seed);
            const r3 = rand(k * 47.1 + s.seed);
            const life = (r1 + phase * 1.0) % 1;
            const pt = contours[Math.floor(r2 * contours.length) % contours.length];
            let spawnX = pt[0] + (rand(k * 5.3) - 0.5) * 0.026;
            let spawnY = pt[1] + (rand(k * 9.7) - 0.5) * 0.026;
            const isIdleZone = pt[2];

            spawnX = (spawnX - 0.50) * s4 + 0.50 + offX;
            spawnY = (spawnY - 0.50) * s4 + 0.50 + offY;

            const curlAngle = r1 * 6.283 + life * 2.85 + a;
            const driftRadius = life * (0.056 + 0.048 * r3);
            const px = spawnX + (-0.48 * driftRadius + Math.cos(curlAngle) * 0.024 * life);
            const py = spawnY + (-0.68 * driftRadius + Math.sin(curlAngle) * 0.022 * life);

            let cursorTrigger = 0;
            if (hoverStrength > 0.002) {
              const cdx = (spawnX - focusScene[0]) * 1.7778;
              const cdy = spawnY - focusScene[1];
              cursorTrigger = expFast(-(cdx * cdx + cdy * cdy) / 0.022) * hoverStrength;
            }

            const evapAlpha =
              (isIdleZone * idleStrength * 0.72 + cursorTrigger * 1.15) *
              Math.sin(life * Math.PI) *
              (isLight ? 0.55 : 0.65) *
              promAlpha;
            const evapSize = (1.4 + 1.2 * r3) * promSize * scaleMult;
            const evapBlur = Math.min(0.24, 0.02 + life * 0.16) * lightBlurScale;
            emit(px, py, 0.45, evapSize, evapAlpha, evapBlur, life * 2.5, k * 73 + 8000, 0.026, false, 0);
          }
        }
      }
    }

    if (count <= 0) return;

    gl.useProgram(this.particleProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * 6));

    const pPos = this.particlePosAttr;
    const pApp = this.particleAppAttr;
    gl.enableVertexAttribArray(pPos);
    gl.vertexAttribPointer(pPos, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(pApp);
    gl.vertexAttribPointer(pApp, 4, gl.FLOAT, false, 24, 8);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, activeTexture);
    gl.uniform1i(this.particleUniforms.glyph, 0);
    gl.uniform2f(this.particleUniforms.resolution, canvasW, canvasH);
    gl.uniform1f(this.particleUniforms.darkMode, isDark);
    gl.uniform1f(this.particleUniforms.glyphRows, glyphEntry?.atlasRows || 1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, count);

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
    gl.deleteTexture(this.motifTexture);
    gl.deleteTexture(this.particleTexture1);
    gl.deleteTexture(this.particleTexture2);
  }
}
