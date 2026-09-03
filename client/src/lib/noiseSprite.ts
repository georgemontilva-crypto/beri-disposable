/**
 * Fractal-noise blob sprites, shared by the smoke effects.
 *
 * Rasterised once at mount and then stamped with drawImage: generating noise
 * per frame would be far too slow, while blitting a cached bitmap is nearly
 * free.
 */

function hash2(x: number, y: number, seed: number): number {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

/** Cubic smoothstep — linear interpolation leaves visible lattice creases. */
const fade = (t: number) => t * t * (3 - 2 * t);

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

/** Four octaves: enough structure to read as vapour, cheap enough at mount. */
export function fbm(x: number, y: number, seed: number): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < 4; i++) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 101) * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

/**
 * A soft blob with a ragged, cloudy outline.
 *
 * The threshold is what carves the holes: without it the noise only modulates
 * brightness and the silhouette stays a clean disc, which reads as a circle no
 * matter how it moves.
 */
export function makeNoiseSprite(seed: number, size = 192, scale = 3.2): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const half = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * scale, (y / size) * scale, seed);

      const dx = (x - half) / half;
      const dy = (y - half) / half;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const falloff = dist >= 1 ? 0 : Math.pow(1 - dist, 2.1);

      const density = Math.max(0, n * 1.9 - 0.5) * falloff;

      const i = (y * size + x) * 4;
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = Math.min(255, density * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Colours a sprite by filling it and keeping only where the mask is opaque.
 *
 * Done once per colour rather than tinting at draw time: canvas has no
 * per-drawImage tint, and the alternative — an offscreen composite every frame
 * — costs orders of magnitude more.
 */
export function tintSprite(mask: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = mask.width;
  c.height = mask.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}
