export const vertexShaderSource = `attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export const fragmentShaderSource = `precision highp float;
varying vec2 uv;
uniform vec2 resolution, viewScale, shift, pointer, tap, focusPoint;
uniform float darkMode, neutralMode, family, zoom, rotation, softness, beamIntensity;
uniform float showMotif, motifMode, motifSize, motifPosX, motifPosY, motifOpacity, idleEvap, motifEvap;
uniform float grain, energy, phase, tapAge, seed, focusAmount, renderPass;
uniform sampler2D noiseMap;
uniform sampler2D motifSdfMap;

float bell(vec2 p, vec2 c, vec2 r) {
  vec2 q = (p - c) / r;
  return exp(-dot(q, q) * 2.0);
}

float rotBell(vec2 p, vec2 c, vec2 r, float ang) {
  vec2 d = p - c;
  float ca = cos(ang), sa = sin(ang);
  vec2 q = vec2(ca * d.x + sa * d.y, -sa * d.x + ca * d.y) / r;
  return exp(-dot(q, q) * 2.0);
}

void blendOver(inout vec3 baseC, inout float baseA, vec3 srcC, float srcA) {
  float a = clamp(srcA, 0.0, 1.0);
  float outA = a + baseA * (1.0 - a);
  baseC = (srcC * a + baseC * baseA * (1.0 - a)) / max(outA, 0.0001);
  baseA = outA;
}

float unpackSdf(vec2 tc) {
  vec4 c = texture2D(motifSdfMap, clamp(tc, 0.001, 0.999));
  return ((c.r * 255.0 * 256.0 + c.g * 255.0) / 65535.0 - 0.5) * 0.48;
}

float sdMotif(vec2 p) {
  vec2 g = vec2((p.x - 0.50) * 1.7778, p.y - 0.50);
  vec2 tc = g / 0.96 + 0.5;
  vec2 boxD = abs(tc - 0.5) - 0.494;
  float outsideBox = length(max(boxD, 0.0)) * 0.96;
  if (outsideBox > 0.015) {
    return 0.24 + outsideBox;
  }
  vec2 pix = tc * 512.0 - 0.5;
  vec2 i = floor(pix);
  vec2 f = fract(pix);
  vec2 i00 = (i + vec2(0.5, 0.5)) / 512.0;
  vec2 i10 = (i + vec2(1.5, 0.5)) / 512.0;
  vec2 i01 = (i + vec2(0.5, 1.5)) / 512.0;
  vec2 i11 = (i + vec2(1.5, 1.5)) / 512.0;
  float d = mix(
    mix(unpackSdf(i00), unpackSdf(i10), f.x),
    mix(unpackSdf(i01), unpackSdf(i11), f.x),
    f.y
  );
  return d + outsideBox;
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

float gnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(hash22(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash22(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash22(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash22(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  ) * 0.5 + 0.5;
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += amp * gnoise(p);
    p = rot * p * 2.03 + vec2(13.7, 29.3);
    amp *= 0.5;
  }
  return v * 1.0714286;
}

void main() {
  vec2 screen = vec2(uv.x, 1.0 - uv.y);
  vec2 scene = (screen - 0.5) * viewScale + 0.5;
  float a = phase * 6.2831853;
  float soft = mix(0.76, 1.34, clamp((softness - 15.0) / 65.0, 0.0, 1.0));
  float beamGain = mix(0.62, 1.04, clamp((beamIntensity - 20.0) / 80.0, 0.0, 1.0));

  float ign1 = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float ign2 = fract(52.9829189 * fract(dot(gl_FragCoord.xy + vec2(17.3, 31.7), vec2(0.06711056, 0.00583715))));
  vec3 dither = vec3(ign1 - ign2, (ign2 - 0.5) + (ign1 - 0.5), fract(ign1 + 0.37) - fract(ign2 + 0.73)) * (1.35 / 255.0);

  vec2 p = scene;
  if (tapAge < 4.0) {
    p += normalize(p - tap + vec2(0.00001)) * sin(length(p - tap) * 35.0 - tapAge * 7.0) * exp(-tapAge * 2.4) * 0.0028;
  }
  p -= shift * 0.55;
  p += pointer * 0.018;

  float motionAmp = energy * 0.00032;
  vec2 flowOffset = vec2(sin(a) * 1.15 + 0.35 * cos(a * 2.0), cos(a) * 0.95 - 0.30 * sin(a * 2.0)) * motionAmp;
  p += flowOffset;

  mat2 R = mat2(cos(rotation), -sin(rotation), sin(rotation), cos(rotation));
  p = R * (p - 0.5) / zoom + 0.5;

  // PASS 0: Background Aurora Fluid / Cosmic Sky
  if (renderPass < 0.5) {
    vec2 pSky = p;
    vec2 cursorShift = (focusPoint - 0.5) * focusAmount * 0.026;
    pSky -= cursorShift;

    float diagCoord = pSky.x * 0.78 + pSky.y * 0.62;
    float rayDrift = sin(a + diagCoord * 2.6) * (energy * 0.00045);
    vec2 pWave = pSky + vec2(rayDrift, -rayDrift * 0.75);

    vec3 col;
    if (darkMode > 0.5) {
      // Cosmic Obsidian & Sapphire with Golden Amber Highlights
      float dSoft = soft / 1.34;
      float dBeam = mix(1.0, 1.25, clamp((beamIntensity - 20.0) / 80.0, 0.0, 1.0));

      vec3 topRow = mix(vec3(8.0, 18.0, 42.0) / 255.0, vec3(24.0, 78.0, 168.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
      vec3 botRow = mix(vec3(2.0, 4.0, 12.0) / 255.0, vec3(12.0, 32.0, 78.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
      col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));

      // Deep celestial blue beams
      col = mix(col, vec3(20.0, 85.0, 215.0) / 255.0, clamp(rotBell(pWave, vec2(0.681, 0.203), vec2(0.329, 0.349) * dSoft, 1.117) * 0.72 * dBeam, 0.0, 0.96));
      col = mix(col, vec3(56.0, 189.0, 248.0) / 255.0, clamp(rotBell(pWave, vec2(0.945, 0.144), vec2(0.388, 0.420) * dSoft, 0.033) * 0.75 * dBeam, 0.0, 0.96));

      // Subtle warm amber filament in the flow
      col = mix(col, vec3(245.0, 158.0, 11.0) / 255.0, clamp(rotBell(pWave, vec2(0.420, 0.360), vec2(0.240, 0.180) * dSoft, 0.45) * 0.28 * dBeam, 0.0, 0.96));
      col = mix(col, vec3(251.0, 191.0, 36.0) / 255.0, clamp(rotBell(pWave, vec2(0.550, 0.220), vec2(0.180, 0.140) * dSoft, -0.35) * 0.22 * dBeam, 0.0, 0.96));

      // Lower deep indigo / violet abyss
      col = mix(col, vec3(3.0, 8.0, 28.0) / 255.0, clamp(rotBell(pWave, vec2(0.210, 0.825), vec2(0.393, 0.619) * dSoft, -0.689) * 0.85, 0.0, 0.96));
      col = mix(col, vec3(70.0, 160.0, 255.0) / 255.0, clamp(rotBell(pWave, vec2(1.173, 0.898), vec2(0.242, 0.808) * dSoft, 0.033) * 0.90 * dBeam, 0.0, 0.96));
    } else if (neutralMode > 0.5) {
      // Classic Neutral Vibrant Blue
      float nSoft = soft / 1.34;
      float nBeam = mix(1.0, 1.20, clamp((beamIntensity - 20.0) / 80.0, 0.0, 1.0));
      vec3 topRow = mix(vec3(53.8, 90.2, 209.3) / 255.0, vec3(174.3, 246.4, 255.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
      vec3 botRow = mix(vec3(0.0, 77.0, 137.1) / 255.0, vec3(0.0, 88.6, 255.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
      col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));
      col = mix(col, vec3(21.2, 158.5, 255.0) / 255.0, clamp(rotBell(pWave, vec2(0.409, 0.022), vec2(0.324, 0.499) * nSoft, 0.579) * 0.960 * nBeam, 0.0, 0.96));
      col = mix(col, vec3(150.7, 205.5, 250.8) / 255.0, clamp(rotBell(pWave, vec2(0.483, -0.023), vec2(0.451, 0.233) * nSoft, -0.856) * 0.960 * nBeam, 0.0, 0.96));
      col = mix(col, vec3(209.1, 249.4, 255.0) / 255.0, clamp(rotBell(pWave, vec2(0.949, 0.250), vec2(0.349, 0.547) * nSoft, -0.072) * 0.897 * nBeam, 0.0, 0.96));
    } else {
      // Light Mode: Pure Airy Celestial Sky & Champagne Warm Glow
      float lSoft = soft / 1.34;
      float lBeam = mix(1.0, 1.18, clamp((beamIntensity - 20.0) / 80.0, 0.0, 1.0));
      vec3 topRow = mix(vec3(250.0, 250.0, 252.0) / 255.0, vec3(180.0, 215.0, 248.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
      vec3 botRow = mix(vec3(220.0, 235.0, 252.0) / 255.0, vec3(195.0, 222.0, 255.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
      col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));
      col = mix(col, vec3(140.0, 200.0, 255.0) / 255.0, clamp(rotBell(pWave, vec2(0.309, 0.159), vec2(0.495, 0.379) * lSoft, -0.265) * 0.960, 0.0, 0.96));
      col = mix(col, vec3(254.0, 243.0, 199.0) / 255.0, clamp(rotBell(pWave, vec2(0.720, 0.280), vec2(0.320, 0.220) * lSoft, 0.22) * 0.55 * lBeam, 0.0, 0.96));
      col = mix(col, vec3(180.0, 220.0, 255.0) / 255.0, clamp(rotBell(pWave, vec2(1.032, 0.492), vec2(0.691, 0.342) * lSoft, -0.514) * 0.960, 0.0, 0.96));
      col = mix(col, vec3(255.0, 255.0, 255.0) / 255.0, clamp(rotBell(pWave, vec2(0.356, 0.452), vec2(0.446, 0.243) * lSoft, -0.444) * 0.801 * lBeam, 0.0, 0.96));
    }

    float pxScale = max(1.0, max(resolution.x, resolution.y) / 2560.0);
    vec2 grainPx = floor(gl_FragCoord.xy / pxScale);
    vec2 tileId = floor(grainPx / 512.0);
    vec2 noiseUV1 = (grainPx + 0.5) / 512.0;
    vec2 noiseUV2 = (grainPx + floor(vec2(tileId.x * 173.0 + tileId.y * 311.0, tileId.x * 257.0 - tileId.y * 139.0)) + 0.5) / 512.0;
    float n1 = texture2D(noiseMap, noiseUV1).r - 0.5;
    float n2 = texture2D(noiseMap, noiseUV2).g - 0.5;
    float grainSignal = (n1 + n2) * 0.65;
    float grainAmp = grain * 0.0024;
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float lumShift = -0.30 * smoothstep(0.92, 0.995, lum) + 0.30 * smoothstep(0.08, 0.005, lum);
    col = clamp(col + vec3((grainSignal + lumShift) * grainAmp), 0.0, 1.0);
    gl_FragColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
    return;
  }

  // PASS 1: Central Liquid Refraction Glyph (干 / DO)
  if (showMotif < 0.5) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float s4 = clamp(motifSize / 100.0, 0.4, 2.0);
  vec2 motifOffset = vec2(motifPosX, motifPosY) * 0.0075;
  vec2 motifCenter = vec2(0.50, 0.50) + motifOffset;
  vec2 c4 = scene - motifCenter;
  vec2 tilt4 = vec2(c4.x * pointer.x * 0.022 + c4.y * pointer.x * 0.010, c4.y * pointer.y * 0.020 + c4.x * pointer.y * 0.008);
  vec2 p4World = scene + pointer * 0.028 + tilt4 + vec2(sin(a), cos(a) - 1.0) * energy * 0.00010;
  vec2 p4 = (p4World - motifCenter) / s4 + vec2(0.50, 0.50);

  vec2 isoP = vec2((p4.x - 0.50) * 1.7778, p4.y - 0.50);
  if (abs(isoP.x) > 0.72 || abs(isoP.y) > 0.72) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float dExact = sdMotif(p4);
  if (dExact > 0.28 * max(1.0, soft * 0.85)) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float flowRate = 0.28 + (energy / 36.0) * 0.42;
  vec2 loopVec = vec2(cos(a), sin(a)) * flowRate;
  vec2 loopVec2 = vec2(sin(a * 2.0), -cos(a * 2.0)) * (flowRate * 0.55);
  vec2 gasCoord = isoP * 5.8 + loopVec * 1.35;

  vec2 warpQ = vec2(
    fbm(gasCoord + vec2(0.0, 0.0)),
    fbm(gasCoord + vec2(5.2, 1.3))
  ) - 0.5;

  vec2 warpR = vec2(
    fbm(gasCoord * 1.85 + 1.6 * warpQ + vec2(1.7, 9.2) + loopVec2),
    fbm(gasCoord * 1.85 + 1.6 * warpQ + vec2(8.3, 2.8) - loopVec2)
  ) - 0.5;

  float gasBillows = fbm(gasCoord * 1.4 + 1.25 * warpR);
  float gasTendrils = smoothstep(0.28, 0.78, fbm(gasCoord * 2.9 - 1.4 * warpQ + loopVec2));
  vec2 curlV = vec2(warpR.y - warpQ.y, -(warpR.x - warpQ.x)) * 2.2;

  float idleScale = clamp(idleEvap / 58.0, 0.0, 1.65);
  float symCrispCore = bell(p4, vec2(0.50, 0.45), vec2(0.12, 0.16));
  float structuralLock = clamp(symCrispCore * 0.85, 0.0, 0.92);
  float symLowerLeft = rotBell(p4, vec2(0.42, 0.58), vec2(0.15, 0.18), -0.58);
  float symLowerRight = bell(p4, vec2(0.58, 0.62), vec2(0.13, 0.15)) * 0.80;
  float symTopRim = smoothstep(0.32, 0.16, p4.y) * bell(p4, vec2(0.50, 0.25), vec2(0.14, 0.10)) * 0.45;
  float zoneSum = symLowerLeft * 1.02 + symLowerRight + symTopRim;

  vec2 idleFlowCoord = isoP * 3.6 + loopVec * 0.85;
  float silkFbm1 = fbm(idleFlowCoord);
  float silkFbm2 = clamp(silkFbm1 * 0.62 + (warpQ.x + 0.5) * 0.38, 0.0, 1.0);
  float silkMod = mix(0.76, 1.26, silkFbm1 * 0.55 + silkFbm2 * 0.45);
  float idleGasTexture = 0.52 + 0.52 * gasBillows + 0.38 * gasTendrils;
  float idleDiffusion = clamp(zoneSum * silkMod * idleGasTexture * (1.0 - structuralLock) * idleScale, 0.0, 1.0);

  float hoverGasField = 0.0;
  vec2 fromCursor = vec2(0.0);
  if (focusAmount > 0.002 && motifEvap > 0.5) {
    float hoverScale = clamp(motifEvap / 54.0, 0.0, 1.6);
    vec2 cursorPWorld = focusPoint + pointer * 0.028;
    vec2 cursorP = (cursorPWorld - motifCenter) / s4 + vec2(0.50, 0.50);
    float dCursor = sdMotif(cursorP) * s4;
    float cursorProximity = exp(-pow(max(dCursor, 0.0) / 0.18, 2.0));
    float activeHover = focusAmount * cursorProximity * hoverScale;
    fromCursor = vec2((p4World.x - cursorPWorld.x) * 1.7778, p4World.y - cursorPWorld.y);
    float distCursor = length(fromCursor);
    vec2 warpedFromCursor = fromCursor + warpQ * 0.055 + warpR * 0.032;
    float gasEnvelope = exp(-dot(warpedFromCursor, warpedFromCursor) / (0.145 * 0.145)) * (1.0 - smoothstep(0.11, 0.25, distCursor));
    hoverGasField = clamp(gasEnvelope * (0.45 + 0.55 * gasBillows + 0.45 * gasTendrils) * activeHover, 0.0, 1.0);
  }

  float tapWisp = 0.0;
  if (tapAge < 3.5) {
    vec2 tapPWorld = tap + pointer * 0.028;
    vec2 tapP = (tapPWorld - motifCenter) / s4 + vec2(0.50, 0.50);
    float dTap = sdMotif(tapP) * s4;
    float tapOnGlyph = 1.0 - smoothstep(0.01, 0.24, max(dTap, 0.0));
    vec2 fromTap = vec2((p4World.x - tapPWorld.x) * 1.7778, p4World.y - tapPWorld.y);
    float tapDist = length(fromTap + warpQ * 0.035);
    float waveRadius = 0.02 + 0.55 * (1.0 - exp(-tapAge * 1.4));
    float ringWidth = 0.05 + tapAge * 0.028;
    float tapRings = exp(-pow((tapDist - waveRadius) / ringWidth, 2.0));
    tapWisp = clamp(tapRings * exp(-tapAge * 1.25) * smoothstep(0.0, 0.03, tapAge) * tapOnGlyph, 0.0, 1.0);
  }

  float totalDiffusion = clamp(idleDiffusion + hoverGasField * 0.82 + tapWisp * 0.65, 0.0, 1.0);
  float diffSq = totalDiffusion * totalDiffusion;

  float dCore = dExact;
  float dStratum1 = dExact;
  float dStratum2 = dExact;
  float dStratum3 = dExact;

  if (totalDiffusion >= 0.012) {
    vec2 idleFlowDir = mix(vec2(-0.56, -0.36), vec2(0.46, -0.44), smoothstep(0.46, 0.62, p4.x));
    vec2 idleBuoyantCurl = normalize(curlV * 0.88 + idleFlowDir * 0.92 + vec2(0.0001));
    vec2 idleAdvect = (idleBuoyantCurl * (0.46 + 0.54 * gasTendrils) + warpQ * 0.52 + warpR * 0.56) * 0.034 * idleDiffusion;
    vec2 hoverAdvect = vec2(0.0);
    if (hoverGasField > 0.001) {
      vec2 buoyantCurl = normalize(curlV + vec2(fromCursor.x * 1.2, -0.55) + vec2(0.0001));
      hoverAdvect = (buoyantCurl * (0.45 + 0.55 * gasTendrils) + warpR * 0.65) * 0.028 * hoverGasField;
    }
    vec2 totalAdvect = idleAdvect + hoverAdvect;
    float warpScale = idleDiffusion * 0.84 + hoverGasField;
    dCore = sdMotif(p4 + totalAdvect * 0.24);
    dStratum1 = sdMotif(p4 + totalAdvect * 0.68 + warpQ * (0.009 * warpScale));
    dStratum2 = sdMotif(p4 + totalAdvect * 1.22 + vec2(-warpQ.y, warpQ.x) * (0.015 * warpScale));
    dStratum3 = sdMotif(p4 + totalAdvect * 1.85 + warpR * (0.022 * warpScale));
  }

  float baseFeather = mix(0.0022, 0.00075, structuralLock) / s4;
  float sigmaCore = (baseFeather + diffSq * 0.030) * soft;
  float sigmaS1 = (0.0035 + totalDiffusion * 0.048) * soft;
  float sigmaS2 = (0.0080 + totalDiffusion * 0.088) * soft;
  float sigmaS3 = (0.0160 + totalDiffusion * 0.138) * soft;

  float densityCore = 1.0 - smoothstep(-sigmaCore, sigmaCore, mix(dExact, dCore, smoothstep(0.04, 0.38, totalDiffusion)));
  float densityS1 = (1.0 - smoothstep(-sigmaS1, sigmaS1, dStratum1)) * smoothstep(0.02, 0.32, totalDiffusion);
  float densityS2 = (1.0 - smoothstep(-sigmaS2, sigmaS2, dStratum2)) * smoothstep(0.06, 0.50, totalDiffusion) * (0.68 + 0.32 * silkFbm2);
  float densityS3 = (1.0 - smoothstep(-sigmaS3, sigmaS3, dStratum3)) * smoothstep(0.12, 0.70, totalDiffusion) * (0.55 + 0.45 * gasBillows);

  float pocketMask = smoothstep(0.22, 0.76, 1.0 - gasBillows * 0.65 - gasTendrils * 0.35);
  float coreRetention = clamp(1.0 - (hoverGasField * 0.46 + idleDiffusion * 0.34) * pocketMask, 0.30, 1.0);
  float innerDepth = max(-dCore, 0.0);
  float rimWidth = 0.016 + totalDiffusion * 0.026;
  float rimHighlight = exp(-(innerDepth * innerDepth) / (rimWidth * rimWidth));

  float gasCaustic = (idleDiffusion * 0.60 + hoverGasField) * gasTendrils * exp(-pow(abs(dStratum1) / 0.030, 2.0)) * 0.55;
  float bodyLuminance = mix(0.82, 1.0, rimHighlight) * (1.0 - 0.18 * (idleDiffusion * 0.65 + hoverGasField) * (1.0 - gasBillows)) + gasCaustic;

  float posOut = max(dStratum2, 0.0);
  float haloWidth = 0.018 + totalDiffusion * 0.105;
  float outerHalo = exp(-(posOut * posOut) / (haloWidth * haloWidth)) * (0.18 + 0.82 * totalDiffusion) * (0.72 + 0.28 * silkFbm1);

  vec2 shadeP = p4 - vec2(0.55, 0.55);
  vec2 shadeRot = vec2(shadeP.x * 0.78 + shadeP.y * 0.62, -shadeP.x * 0.62 + shadeP.y * 0.78);
  float stemShade = exp(-(shadeRot.x * shadeRot.x) / (0.062 * 0.062) - (shadeRot.y * shadeRot.y) / (0.155 * 0.155));
  float shadeAtten = 1.0 - 0.42 * stemShade;

  float compositeBody = mix(
    densityCore * bodyLuminance,
    densityCore * bodyLuminance * 0.52 + densityS1 * 0.34 + densityS2 * 0.22 + densityS3 * 0.14,
    smoothstep(0.0, 0.65, totalDiffusion)
  ) * coreRetention * shadeAtten;

  float compositeGlow = (outerHalo * 0.48 + densityS2 * 0.24 + densityS3 * 0.28 + gasCaustic * 0.35) * shadeAtten;
  float opacityScale = clamp(motifOpacity / 100.0, 0.0, 1.0);

  vec3 fgCol = vec3(0.0);
  float fgAlpha = 0.0;

  if (darkMode > 0.5 || neutralMode > 0.5) {
    // Blue & Gold Fusion Foreground Palette
    // Celestial crystalline blue core with warm champagne amber rim refraction
    vec3 coreTint = mix(vec3(186.0, 224.0, 255.0) / 255.0, vec3(255.0, 246.0, 218.0) / 255.0, 0.50 + 0.50 * rimHighlight * (1.0 - totalDiffusion * 0.35));
    coreTint = mix(coreTint, vec3(102.0, 164.0, 245.0) / 255.0, stemShade * 0.58);

    // Gas evaporation tendrils carry vibrant amber-gold sparks and cyan sheen
    vec3 gasTint = mix(vec3(114.0, 184.0, 255.0) / 255.0, vec3(251.0, 191.0, 36.0) / 255.0, 0.45 + 0.55 * gasTendrils);
    vec3 glyphCol = mix(coreTint, gasTint, hoverGasField * 0.55);

    // Glowing aura with golden-amber shimmer
    vec3 glyphGlow = mix(vec3(56.0, 189.0, 248.0) / 255.0, vec3(245.0, 158.0, 11.0) / 255.0, smoothstep(0.70, 0.20, p4.y));

    blendOver(fgCol, fgAlpha, glyphGlow, compositeGlow * 0.42 * opacityScale);
    blendOver(fgCol, fgAlpha, glyphCol, compositeBody * 0.88 * opacityScale);
  } else {
    // Pure White/Crystal with Warm Amber Edge in Light Mode
    vec3 glyphColLight = mix(vec3(235.0, 246.0, 255.0) / 255.0, vec3(255.0, 252.0, 242.0) / 255.0, 0.46 + 0.54 * rimHighlight);
    vec3 glyphGlowLight = vec3(255.0, 248.0, 225.0) / 255.0;
    blendOver(fgCol, fgAlpha, glyphGlowLight, compositeGlow * 0.48 * opacityScale);
    blendOver(fgCol, fgAlpha, glyphColLight, compositeBody * 0.94 * opacityScale);
  }

  gl_FragColor = vec4(clamp(fgCol + dither, 0.0, 1.0), fgAlpha);
}`;

export const particleVertexShaderSource = `precision highp float;
attribute vec2 position;
attribute vec4 appearance;
uniform vec2 resolution;
varying vec4 style;
varying vec2 vPos;

void main() {
  vPos = position;
  gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
  gl_PointSize = appearance.x * 4.2 * max(0.8, resolution.y / 1080.0);
  style = appearance;
}`;

export const particleFragmentShaderSource = `precision highp float;
uniform sampler2D glyph;
uniform float darkMode;
uniform float glyphRows;
varying vec4 style;
varying vec2 vPos;

void main() {
  vec2 p = gl_PointCoord - 0.5;
  float c = cos(style.z), s = sin(style.z);
  p = mat2(c, -s, s, c) * p + 0.5;
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
  if (inside < 0.5) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float px = clamp(p.x, 0.002, 0.998);
  float rowIdx = floor(style.w + 0.0001);
  float blurVal = max(0.0, style.w - rowIdx);
  float py = (clamp(p.y, 0.002, 0.998) + rowIdx) / max(1.0, glyphRows);
  float level = clamp(blurVal * 10.0, 0.0, 3.0);
  float lo = floor(level), hi = min(3.0, lo + 1.0);
  float a0 = texture2D(glyph, vec2(px / 4.0, py)).a;
  float a = texture2D(glyph, vec2((px + lo) / 4.0, py)).a;
  float b = texture2D(glyph, vec2((px + hi) / 4.0, py)).a;
  float blurComp = 1.0 + level * 0.58;
  float mipAlpha = clamp(mix(a, b, fract(level)) * blurComp, 0.0, 1.0);

  if (darkMode > 0.5) {
    // Blue & Gold Dual Spark Colors in Dark Mode
    vec3 haloTint = mix(vec3(245.0, 158.0, 11.0) / 255.0, vec3(56.0, 189.0, 248.0) / 255.0, smoothstep(0.20, 0.75, vPos.y));
    float darkShape = clamp(max(mipAlpha * 1.15, a0 * (0.74 - 0.08 * level)), 0.0, 1.0);
    float coreMask = smoothstep(0.20, 0.72, a0) * (1.0 - clamp(blurVal * 2.0, 0.0, 0.78));
    vec3 darkSpark = mix(haloTint, vec3(255.0, 252.0, 235.0) / 255.0, coreMask);
    float darkAlpha = clamp(darkShape * min(1.0, style.y * 1.32), 0.0, 0.98);
    gl_FragColor = vec4(darkSpark, darkAlpha);
  } else {
    // Light Mode: Shimmering Amber Gold & Azure Sparks
    float lightShape = clamp(max(mipAlpha * 1.22, a0 * (0.78 - 0.10 * level)), 0.0, 1.0);
    float coreMask = smoothstep(0.18, 0.72, a0);
    vec3 edgeTint = mix(vec3(217.0, 119.0, 6.0) / 255.0, vec3(56.0, 189.0, 248.0) / 255.0, smoothstep(0.55, 0.05, vPos.y) * smoothstep(0.45, 0.95, vPos.x));
    vec3 lightSpark = mix(edgeTint, vec3(1.0), coreMask * 0.92 + 0.08);
    float lightAlpha = clamp(lightShape * min(1.0, style.y * 1.45), 0.0, 0.98);
    gl_FragColor = vec4(lightSpark, lightAlpha);
  }
}`;
