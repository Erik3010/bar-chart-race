import { BarOption, DrawBarLabelOption, Padding } from "../types";
import { animate } from "../utility/animation";
import { clamp, computeTextWidth, formatNumber } from "../utility";

class Bar {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;

  label: string;
  value: number;

  padding: Padding = { top: 5, right: 0, bottom: 5, left: 0 };
  labelProps = { font: "Arial", fontSize: 14, padding: 10 };

  swapping = false;

  constructor({ ctx, x, y, width, height, color, label, value }: BarOption) {
    this.ctx = ctx;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.label = label;
    this.value = value;
  }
  draw() {
    this.drawBar();

    this.drawLabel({ text: this.label, startX: this.x, color: "#000" });
    this.drawLabel({
      text: formatNumber(this.value),
      startX: this.x + this.width,
      color: "#fff",
      clampStart: true,
    });
  }
  drawBar() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.globalAlpha = 0.9;
    this.ctx.fillStyle = this.color;
    this.ctx.rect(
      this.x,
      this.y + this.padding.top,
      this.width,
      this.height - this.padding.bottom
    );
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }
  drawLabel({ text, startX, color, clampStart = false }: DrawBarLabelOption) {
    const { font, fontSize, padding } = this.labelProps;

    const labelX = startX - padding;
    const labelY = this.y + (this.height + this.padding.top) / 2;

    const fontStyle = `${fontSize}px ${font}`;
    const textWidth = computeTextWidth(text, fontStyle);

    const finalX = clampStart
      ? clamp(labelX, this.x + padding + textWidth, Infinity)
      : labelX;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = fontStyle;
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, finalX, labelY);
    this.ctx.restore();
  }
  async animateTo(nextWidth: number, nextValue: number, duration: number) {
    await animate<{ width: number; value: number }>({
      duration,
      initialValues: { width: this.width, value: this.value },
      targetValues: { width: nextWidth, value: nextValue },
      onUpdate: ({ width, value }) => {
        this.width = width;
        this.value = Number(value.toFixed(0));
      },
    });

    this.width = nextWidth;
    this.value = nextValue;
  }
  async swapBar(nextY: number) {
    this.swapping = true;

    await animate<{ y: number }>({
      duration: 300,
      initialValues: { y: this.y },
      targetValues: { y: nextY },
      onUpdate: ({ y }) => (this.y = y),
    });

    this.y = nextY;
    this.swapping = false;
  }
}

export default Bar;
