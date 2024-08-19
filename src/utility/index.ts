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

export const sortDescending = (
  data: { country: string; population: number }[]
) => structuredClone(data).sort((a, b) => b.population - a.population);
