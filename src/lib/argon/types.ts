export type ArgonTheme = 'dark' | 'light' | 'neutral';

export interface ArgonConfig {
  family: number;
  colorMode: ArgonTheme;
  themePreference: string;
  seed: number;
  center: [number, number];
  curve: [number, number];
  spread: number;
  softness: number;
  beamIntensity: number;
  showMotif: boolean;
  motifText: string;
  motifSize: number;
  motifPosX: number;
  motifPosY: number;
  motifOpacity: number;
  idleEvap: number;
  motifEvap: number;
  density: number;
  sparkScale: number;
  sparkSizeFalloff: number;
  sparkOpacityDark: number;
  sparkOpacityLight: number;
  prominence: number;
  meshDepth: number;
  sparkPosX: number;
  sparkPosY: number;
  secondMesh: boolean;
  density2: number;
  spark2Scale: number;
  spark2SizeFalloff: number;
  spark2OpacityDark: number;
  spark2OpacityLight: number;
  meshDepth2: number;
  spark2PosX: number;
  spark2PosY: number;
  grain: number;
  energy: number;
  duration: number;
  seamlessLoop: boolean;
  parallax: boolean;
  ripple: boolean;
  hoverReactivity: number;
  hoverSize: number;
  repulsion: number;
  reach: number;
}

export interface InteractionState {
  pointer: [number, number];
  hover: [number, number];
  hoverAmount: number;
  tap: [number, number];
  tapAge: number;
  /** Glyph anchor in normalized viewport coordinates (0..1, y down). */
  holdPoint: [number, number];
}

export interface SdfEntry {
  key: string;
  ready: boolean;
  size: number;
  /** Signed distance in texture pixels (negative inside the glyph). */
  distField: Float32Array;
  /** Powder resting positions as (x, y) pairs, relative to the glyph box center in box units (-0.5..0.5). */
  targets: Float32Array;
  /** Fraction of the glyph box area covered by ink. */
  inkFraction: number;
}

export interface GlyphAtlasEntry {
  key: string;
  ready: boolean;
  atlasCanvas: HTMLCanvasElement | null;
  charCount: number;
  atlasRows: number;
  spaceMask: boolean[];
}
