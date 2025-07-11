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

  // New properties for interaction
  private isDragging = false;
  private canvas: HTMLCanvasElement;
  private onPercentageChange?: (percentage: number) => void;

  constructor({
    ctx,
    start,
    end,
    labels,
    onPercentageChange,
  }: TimelineBarOption & {
    onPercentageChange?: (percentage: number) => void;
  }) {
    this.ctx = ctx;
    this.start = start;
    this.end = end;
    this.labels = labels;
    this.onPercentageChange = onPercentageChange;
    this.canvas = ctx.canvas;

    this.updatePointerCoordinate();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseUp.bind(this));

    // Touch events for mobile support
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  private getCanvasCoordinates(clientX: number, clientY: number): Coordinate {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  private isPointOnTimeline(x: number, y: number): boolean {
    const tolerance = 20; // pixels
    return (
      x >= this.start.x - tolerance &&
      x <= this.end.x + tolerance &&
      y >= this.start.y - tolerance &&
      y <= this.start.y + tolerance
    );
  }

  private handleMouseDown(event: MouseEvent) {
    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);
    if (this.isPointOnTimeline(coords.x, coords.y)) {
      this.isDragging = true;
      this.canvas.style.cursor = "grabbing";
      this.updateFromPosition(coords.x);
    }
  }

  private handleMouseMove(event: MouseEvent) {
    const coords = this.getCanvasCoordinates(event.clientX, event.clientY);

    if (this.isDragging) {
      this.updateFromPosition(coords.x);
    } else if (this.isPointOnTimeline(coords.x, coords.y)) {
      this.canvas.style.cursor = "grab";
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  private handleMouseUp() {
    this.isDragging = false;
    this.canvas.style.cursor = "default";
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    const touch = event.touches[0];
    const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
    if (this.isPointOnTimeline(coords.x, coords.y)) {
      this.isDragging = true;
      this.updateFromPosition(coords.x);
    }
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (this.isDragging) {
      const touch = event.touches[0];
      const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
      this.updateFromPosition(coords.x);
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  private updateFromPosition(x: number) {
    // Clamp x to timeline bounds
    const clampedX = Math.max(this.start.x, Math.min(this.end.x, x));

    // Calculate percentage (allow any value between 0 and 1)
    const newPercentage =
      (clampedX - this.start.x) / (this.end.x - this.start.x);

    // Update percentage without snapping
    this.percentage = newPercentage;
    this.updatePointerCoordinate();

    // Notify parent component of percentage change
    if (this.onPercentageChange) {
      this.onPercentageChange(this.percentage);
    }
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

  // Method to set percentage directly without animation
  setPercentage(percentage: number) {
    this.percentage = Math.max(0, Math.min(1, percentage));
    this.updatePointerCoordinate();
  }

  // Method to get current percentage
  getCurrentPercentage(): number {
    return this.percentage;
  }
}

export default TimelineBar;
