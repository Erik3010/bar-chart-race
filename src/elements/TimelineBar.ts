import { Coordinate, TimelineBarOption } from "../types";

class TimelineBar {
  static POINTER_WIDTH = 10;
  static POINTER_OFFSET = 8;

  ctx: CanvasRenderingContext2D;
  start: Coordinate;
  end: Coordinate;
  labels: string[];
  pointerCoordinate: Coordinate = { x: 0, y: 0 };

  strokeColor = "#ccc";
  pointerColor = "#ababab";
  textColor = "#9b9b9b";
  fractionLineOffset = 5;

  constructor({ ctx, start, end, labels }: TimelineBarOption) {
    this.ctx = ctx;
    this.start = start;
    this.end = end;
    this.labels = labels;

    this.pointerCoordinate = { x: start.x, y: start.y };
  }
  calculatePointerPoints() {
    const { POINTER_WIDTH, POINTER_OFFSET } = TimelineBar;
    const { x, y } = this.pointerCoordinate;

    const halfWidth = POINTER_WIDTH / 2;
    const adjustedY = y - POINTER_OFFSET;
    const topPointY = adjustedY - POINTER_WIDTH;

    return {
      bottomPoint: { x: x, y: adjustedY },
      leftPoint: { x: x - halfWidth, y: topPointY },
      rightPoint: { x: x + halfWidth, y: topPointY },
    };
  }
  drawPointer() {
    const { bottomPoint, leftPoint, rightPoint } =
      this.calculatePointerPoints();

    this.ctx.beginPath();
    this.ctx.moveTo(bottomPoint.x, bottomPoint.y);
    this.ctx.lineTo(leftPoint.x, leftPoint.y);
    this.ctx.lineTo(rightPoint.x, rightPoint.y);
    this.ctx.fillStyle = this.pointerColor;
    this.ctx.fill();
    this.ctx.closePath();
  }
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
