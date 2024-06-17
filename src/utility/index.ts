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
