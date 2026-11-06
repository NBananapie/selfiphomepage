export const vertexShaderSource = `attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export const fragmentShaderSource = `precision highp float;
varying vec2 uv;
uniform vec2 resolution, viewScale, shift, pointer;
uniform float darkMode, softness, beamIntensity;
uniform float grain, energy, phase;
uniform sampler2D noiseMap;

float rotBell(vec2 p, vec2 c, vec2 r, float ang) {
  vec2 d = p - c;
  float ca = cos(ang), sa = sin(ang);
  vec2 q = vec2(ca * d.x + sa * d.y, -sa * d.x + ca * d.y) / r;
  return exp(-dot(q, q) * 2.0);
}

void main() {
  vec2 screen = vec2(uv.x, 1.0 - uv.y);
  vec2 scene = (screen - 0.5) * viewScale + 0.5;
  float a = phase * 6.2831853;
  float soft = mix(0.76, 1.34, clamp((softness - 15.0) / 65.0, 0.0, 1.0));

  float ign1 = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float ign2 = fract(52.9829189 * fract(dot(gl_FragCoord.xy + vec2(17.3, 31.7), vec2(0.06711056, 0.00583715))));
  vec3 dither = vec3(ign1 - ign2, (ign2 - 0.5) + (ign1 - 0.5), fract(ign1 + 0.37) - fract(ign2 + 0.73)) * (1.35 / 255.0);

  // Background aurora fluid / sky gradient
  vec2 p = scene - shift * 0.55 + pointer * 0.018;
  float motionAmp = energy * 0.00032;
  p += vec2(sin(a) * 1.15 + 0.35 * cos(a * 2.0), cos(a) * 0.95 - 0.30 * sin(a * 2.0)) * motionAmp;

  float diagCoord = p.x * 0.78 + p.y * 0.62;
  float rayDrift = sin(a + diagCoord * 2.6) * (energy * 0.00045);
  vec2 pWave = p + vec2(rayDrift, -rayDrift * 0.75);

  vec3 col;
  if (darkMode > 0.5) {
    float dSoft = soft / 1.34;
    vec3 topRow = mix(vec3(8.0, 18.0, 42.0) / 255.0, vec3(24.0, 78.0, 168.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
    vec3 botRow = mix(vec3(2.0, 4.0, 12.0) / 255.0, vec3(12.0, 32.0, 78.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
    col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));
    col = mix(col, vec3(20.0, 85.0, 215.0) / 255.0, clamp(rotBell(pWave, vec2(0.681, 0.203), vec2(0.329, 0.349) * dSoft, 1.117) * 0.78, 0.0, 0.96));
    col = mix(col, vec3(56.0, 189.0, 248.0) / 255.0, clamp(rotBell(pWave, vec2(0.945, 0.144), vec2(0.388, 0.420) * dSoft, 0.033) * 0.80, 0.0, 0.96));
    col = mix(col, vec3(3.0, 8.0, 28.0) / 255.0, clamp(rotBell(pWave, vec2(0.210, 0.825), vec2(0.393, 0.619) * dSoft, -0.689) * 0.85, 0.0, 0.96));
  } else {
    float lSoft = soft / 1.34;
    vec3 topRow = mix(vec3(242.0, 247.0, 254.0) / 255.0, vec3(172.0, 212.0, 250.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
    vec3 botRow = mix(vec3(212.0, 232.0, 252.0) / 255.0, vec3(182.0, 218.0, 255.0) / 255.0, clamp(pWave.x, 0.0, 1.0));
    col = mix(topRow, botRow, clamp(pWave.y, 0.0, 1.0));
    col = mix(col, vec3(128.0, 194.0, 255.0) / 255.0, clamp(rotBell(pWave, vec2(0.309, 0.159), vec2(0.495, 0.379) * lSoft, -0.265) * 0.92, 0.0, 0.96));
    col = mix(col, vec3(165.0, 214.0, 255.0) / 255.0, clamp(rotBell(pWave, vec2(1.032, 0.492), vec2(0.691, 0.342) * lSoft, -0.514) * 0.92, 0.0, 0.96));
  }

  float n1 = texture2D(noiseMap, fract(gl_FragCoord.xy / 512.0)).r - 0.5;
  col = clamp(col + vec3(n1 * grain * 0.0018), 0.0, 1.0);
  gl_FragColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
}`;

// Particle attributes:
//   position   = canvas pixel coordinates (y down)
//   appearance = (diameter px, alpha, sharpness, glow)
// glow is 0 for free-floating dust and 1 for grains resting in the powder pile.
export const particleVertexShaderSource = `precision highp float;
attribute vec2 position;
attribute vec4 appearance;
uniform vec2 resolution;
uniform float shadowPass;
uniform vec2 shadowOffset;
varying vec4 vStyle;

void main() {
  vStyle = appearance;
  vec2 p = position + shadowOffset * shadowPass;
  vec2 clip = p / resolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = max(1.0, appearance.x * mix(1.0, 2.6, shadowPass));
}`;

export const particleFragmentShaderSource = `precision highp float;
uniform float shadowPass;
uniform float darkMode;
varying vec4 vStyle;

void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = length(p) * 2.0;
  if (r > 1.0) {
    discard;
  }

  // Contact shadow: soft, offset copies of the resting grains accumulate under dense areas
  if (shadowPass > 0.5) {
    float s = exp(-r * r * 3.0) * (1.0 - r);
    float a = s * vStyle.w * mix(0.05, 0.11, darkMode);
    vec3 shadowCol = mix(vec3(0.09, 0.20, 0.40), vec3(0.0, 0.02, 0.06), darkMode);
    gl_FragColor = vec4(shadowCol, a);
    return;
  }

  float core = 1.0 - smoothstep(0.55, 1.0, r);
  float dust = exp(-r * r * 2.6) * (1.0 - r);
  float shape = mix(dust, core, vStyle.z);

  // Grains are lit from the top-left
  float lit = clamp(0.5 - (p.x + p.y) * 0.9, 0.0, 1.0);
  vec3 ice = vec3(0.88, 0.94, 1.0);
  vec3 white = vec3(1.0, 0.995, 0.985);
  vec3 col = mix(ice, white, vStyle.w);
  col *= mix(1.0, 0.86 + 0.18 * lit, vStyle.w * vStyle.z);

  gl_FragColor = vec4(col, clamp(shape * vStyle.y, 0.0, 1.0));
}`;
