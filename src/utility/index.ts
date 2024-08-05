export const createCanvas = (width: number, height: number) => {
  const PIXEL_RATIO = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  canvas.width = width * PIXEL_RATIO;
  canvas.height = height * PIXEL_RATIO;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.scale(PIXEL_RATIO, PIXEL_RATIO);

  return canvas;
};

export const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

/**
 * Computes a smooth interpolation value based on the input parameter t.
 * This function uses the polynomial 6t^5 - 15t^4 + 10t^3 to produce a smooth curve.
 *
 * @param t - A value in the range [0, 1] representing the interpolation factor.
 * @returns A value in the range [0, 1] representing the interpolated result.
 */
export const smootherStep = (t: number) =>
  Math.pow(t, 3) * (t * (t * 6 - 15) + 10);

export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const sortDescending = (
  data: { country: string; population: number }[]
) => structuredClone(data).sort((a, b) => b.population - a.population);
