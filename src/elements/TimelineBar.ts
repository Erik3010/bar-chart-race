import { Coordinate, TimelineBarOption } from "../types";
import { animate } from "../utility/animation";

class TimelineBar {
  static POINTER_WIDTH = 10;
  static POINTER_OFFSET = 8;

  ctx: CanvasRenderingContext2D;
  start: Coordinate;
  end: Coordinate;
  labels: string[];
  percentage = 0;
  pointerCoordinate: Coordinate = { x: 0, y: 0 };

  strokeColor = "#ccc";
  pointerColor = "#ababab";
  textColor = "#9b9b9b";
  lineOffsetFraction = 5;

  constructor({ ctx, start, end, labels }: TimelineBarOption) {
    this.ctx = ctx;
    this.start = start;
    this.end = end;
    this.labels = labels;

    this.updatePointerCoordinate();
  }
  set percentageValue(value: number) {
    this.percentage = value;
    this.updatePointerCoordinate();
  }
  get startX() {
    return this.start.x + (this.end.x - this.start.x) * this.percentage;
  }
  private updatePointerCoordinate() {
    this.pointerCoordinate = { x: this.startX, y: this.start.y };
  }
  calculatePointerCoordinate() {
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
      this.calculatePointerCoordinate();

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
      this.ctx.moveTo(x, this.start.y - this.lineOffsetFraction);
      this.ctx.lineTo(x, this.start.y + this.lineOffsetFraction);
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
  async animateTo(index: number) {
    const step = 100 / (this.labels.length - 1);
    const percentage = (index * step) / 100;

    await animate<{ percentage: number }>({
      duration: 2500,
      initialValues: { percentage: this.percentage },
      targetValues: { percentage },
      onUpdate: ({ percentage }) => (this.percentageValue = percentage),
    });

    this.percentage = percentage;
  }
}

export default TimelineBar;
