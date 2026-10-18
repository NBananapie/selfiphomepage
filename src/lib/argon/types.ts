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
}

export interface SdfEntry {
  key: string;
  ready: boolean;
  rgbaBytes: Uint8Array;
  contourPoints: [number, number, number][];
}

export interface GlyphAtlasEntry {
  key: string;
  ready: boolean;
  atlasCanvas: HTMLCanvasElement | null;
  charCount: number;
  atlasRows: number;
  spaceMask: boolean[];
}
