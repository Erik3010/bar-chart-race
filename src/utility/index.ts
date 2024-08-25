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

export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * This function using closures to cache the canvas and context objects
 * since this function will be called multiple times inside the animation loop.
 *
 * @param text - The text to measure
 * @param font - The font style to use
 * @returns The width of the text in pixels
 */
export const computeTextWidth = (() => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  return (text: string, font: string = "16px Arial") => {
    context.font = font;
    return context.measureText(text).width;
  };
})();

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
