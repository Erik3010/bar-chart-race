import { BarOption, Padding } from "../types";
import { lerp, smootherStep } from "../utility";

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

  duration = 750;

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

    this.drawLabel(this.label, this.x, "#000");
    this.drawLabel(this.value.toString(), this.x + this.width, "#fff");
  }
  drawBar() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.rect(
      this.x,
      this.y + this.padding.top,
      this.width,
      this.height - this.padding.bottom
    );
    this.ctx.fill();
    this.ctx.closePath();
  }
  drawLabel(text: string, xOffset: number, color: string) {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = `${this.labelProps.fontSize}px ${this.labelProps.font}`;
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      text,
      xOffset - this.labelProps.padding,
      this.y + (this.height + this.padding.top) / 2
    );
    this.ctx.restore();
  }
  async animateTo(nextWidth: number, nextValue: number, nextY: number) {
    return new Promise<void>((resolve) => {
      const originalValue = this.value;
      const originalWidth = this.width;
      const originalY = this.y;

      const startTime = performance.now();

      const animate = () => {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const interpolation = elapsedTime / this.duration;

        if (interpolation >= 1) {
          this.width = nextWidth;
          this.value = nextValue;
          this.y = nextY;
          return resolve();
        }

        const fraction = smootherStep(interpolation);

        const newWidth = lerp(originalWidth, nextWidth, fraction);
        this.width = newWidth;

        const newValue = lerp(originalValue, nextValue, fraction);
        this.value = Number(newValue.toFixed(0));

        const newY = lerp(originalY, nextY, fraction);
        this.y = newY;

        requestAnimationFrame(animate);
      };

      animate();
    });
  }
  // async animateYPos(nextY: number) {
  //   return new Promise<void>((resolve) => {
  //     const originalY = this.y;
  //     const startTime = performance.now();

  //     const animate = () => {
  //       const currentTime = performance.now();
  //       const elapsedTime = currentTime - startTime;
  //       const interpolation = elapsedTime / this.duration;

  //       if (interpolation >= 1) {
  //         this.y = nextY;
  //         return resolve();
  //       }

  //       const fraction = smootherStep(interpolation);

  //       const newY = lerp(originalY, nextY, fraction);
  //       this.y = newY;

  //       requestAnimationFrame(animate);
  //     };

  //     animate();
  //   });
  // }
}

export default Bar;
