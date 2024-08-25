import { Coordinate, TimelineBarOption } from "../types";

class TimelineBar {
  ctx: CanvasRenderingContext2D;
  start: Coordinate;
  end: Coordinate;
  labels: string[];

  strokeColor = "#ccc";
  textColor = "#9b9b9b";
  fractionLineOffset = 5;

  constructor({ ctx, start, end, labels }: TimelineBarOption) {
    this.ctx = ctx;
    this.start = start;
    this.end = end;
    this.labels = labels;
  }
  drawPointer() {}
  drawFractionLine() {
    for (const [index, label] of this.labels.entries()) {
      const fraction = index / (this.labels.length - 1);
      const x = this.start.x + (this.end.x - this.start.x) * fraction;

      this.ctx.beginPath();
      this.ctx.moveTo(x, this.start.y - this.fractionLineOffset);
      this.ctx.lineTo(x, this.start.y + this.fractionLineOffset);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = this.textColor;
      this.ctx.fillText(label, x, this.start.y + 22);
      this.ctx.closePath();
    }
  }
  drawMainBar() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.start.x, this.start.y);
    this.ctx.lineTo(this.end.x, this.end.y);
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.stroke();
    this.ctx.closePath();
  }
  draw() {
    this.drawMainBar();
    this.drawFractionLine();
    this.drawPointer();
  }
}

export default TimelineBar;
