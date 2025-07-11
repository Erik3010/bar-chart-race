import {
  type Dataset,
  type DataType,
  type BarChartOption,
  type Dimension,
} from "./types";
import { createCanvas, formatNumber, sleep } from "./utility";
import { COLORS } from "./constants";
import Bar from "./elements/Bar";
import TimelineBar from "./elements/TimelineBar";

class BarChart {
  private containerElement: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private data: DataType[];

  private currentPercentage = 0;
  private isAnimating = false;

  private padding: { top: number; right: number; bottom: number; left: number };
  private bars: Bar[];
  private timelineBar!: TimelineBar;

  constructor(data: DataType[], { element, width, height }: BarChartOption) {
    this.containerElement = element;
    this.data = data;
    this.width = width;
    this.height = height;

    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.padding = { top: 30, right: 30, bottom: 60, left: 100 };
    this.bars = [];
  }

  getDataByDate(date: Dataset["date"] | null) {
    return this.data.map(({ label, datasets }) => ({
      label,
      value: datasets.find((data: Dataset) => data.date === date)?.value ?? 0,
    }));
  }

  // New method to get interpolated data based on percentage
  getInterpolatedData(percentage: number) {
    const maxIndex = this.dateLabels.length - 1;
    const exactIndex = percentage * maxIndex;
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.ceil(exactIndex);

    // If we're exactly on a data point, return that data
    if (lowerIndex === upperIndex) {
      return this.getDataByDate(this.dateLabels[lowerIndex]);
    }

    // Interpolate between two data points
    const lowerData = this.getDataByDate(this.dateLabels[lowerIndex]);
    const upperData = this.getDataByDate(this.dateLabels[upperIndex]);
    const interpolationFactor = exactIndex - lowerIndex;

    return this.data.map(({ label }) => {
      const lowerValue = lowerData.find((d) => d.label === label)?.value ?? 0;
      const upperValue = upperData.find((d) => d.label === label)?.value ?? 0;
      const interpolatedValue =
        lowerValue + (upperValue - lowerValue) * interpolationFactor;

      return {
        label,
        value: interpolatedValue,
      };
    });
  }

  // Get current interpolated date string
  getCurrentInterpolatedDate(): string {
    const maxIndex = this.dateLabels.length - 1;
    const exactIndex = this.currentPercentage * maxIndex;
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.ceil(exactIndex);

    if (lowerIndex === upperIndex) {
      return this.dateLabels[lowerIndex];
    }

    // For interpolated dates, we'll show the lower date
    // You could implement more sophisticated date interpolation here
    return this.dateLabels[lowerIndex];
  }

  getLargestDataByDate(date: Dataset["date"] | null) {
    const data = this.getDataByDate(date);
    return data.reduce(
      (acc, cur) => (acc.value > cur.value ? acc : cur),
      data[0]
    );
  }

  // Get largest value from interpolated data
  getLargestInterpolatedData(percentage: number) {
    const data = this.getInterpolatedData(percentage);
    return data.reduce(
      (acc, cur) => (acc.value > cur.value ? acc : cur),
      data[0]
    );
  }

  get dateLabels() {
    if (this.data.length === 0) return [];
    return this.data[0].datasets.map((data) => data.date);
  }

  get currentData() {
    return this.getInterpolatedData(this.currentPercentage);
  }

  get largestCurrentData() {
    return this.getLargestInterpolatedData(this.currentPercentage);
  }

  get chartDimension(): Dimension {
    return {
      x: this.padding.left,
      y: this.padding.top,
      width: this.width - this.padding.left - this.padding.right,
      height: this.height - this.padding.top - this.padding.bottom,
    };
  }

  get barHeight() {
    return this.chartDimension.height / this.data.length;
  }

  init() {
    this.containerElement.appendChild(this.canvas);

    this.initBars();
    this.initTimelineBar();
    this.render();

    // Start at 0% (first data point)
    this.setPercentage(0);
  }

  private async setPercentage(newPercentage: number) {
    if (newPercentage === this.currentPercentage || this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.currentPercentage = newPercentage;

    // Get the interpolated data for the new percentage
    const newData = this.getInterpolatedData(this.currentPercentage);
    const largestNewData = Math.max(
      this.getLargestInterpolatedData(this.currentPercentage).value,
      1
    );

    // Animate bars to new positions
    const animations = this.bars.map((bar) => {
      const newBarData = newData.find((data) => data.label === bar.label);
      const widthRatio = newBarData!.value / largestNewData;
      const newBarWidth = this.chartDimension.width * widthRatio;

      return bar.animateTo(
        newBarWidth,
        newBarData!.value,
        200 // Short animation for smooth dragging
      );
    });

    await Promise.all(animations);
    this.isAnimating = false;
  }

  private handleTimelineChange(percentage: number) {
    this.setPercentage(percentage);
  }

  sortBarChart() {
    for (let i = 0; i < this.bars.length; i++) {
      const currentBar = this.bars[i];
      const previousBar = this.bars[i - 1];
      if (
        previousBar &&
        !currentBar.swapping &&
        !previousBar.swapping &&
        currentBar.value > previousBar.value
      ) {
        currentBar.swapBar(previousBar.y);
        previousBar.swapBar(currentBar.y);

        this.bars[i] = previousBar;
        this.bars[i - 1] = currentBar;
      }
    }
  }

  initBars() {
    const datum = this.currentData;
    for (const [index, data] of datum.entries()) {
      const bar = this.createBar(data, index);
      this.bars.push(bar);
    }
  }

  initTimelineBar() {
    const bottomOffset = 25;
    const coordinateY = this.height - this.padding.bottom + bottomOffset;

    this.timelineBar = new TimelineBar({
      ctx: this.ctx,
      start: { x: this.padding.left, y: coordinateY },
      end: { x: this.width - this.padding.right, y: coordinateY },
      labels: this.dateLabels,
      onPercentageChange: this.handleTimelineChange.bind(this),
    });
  }

  createBar(data: { label: string; value: number }, index: number) {
    const { x, y, width } = this.chartDimension;

    const largestCurrentData = Math.max(this.largestCurrentData.value, 1);

    const widthRatio = data.value / largestCurrentData;
    const barWidth = width * widthRatio;
    const topPosition = y + index * this.barHeight;

    return new Bar({
      ctx: this.ctx,
      x,
      y: topPosition,
      width: barWidth,
      height: this.barHeight,
      color: COLORS[index % COLORS.length],
      label: data.label,
      value: data.value,
    });
  }

  drawLabels() {
    const total = this.bars.reduce((acc, bar) => acc + bar.value, 0);
    const labelX = this.width - this.padding.right;
    const labelY = this.height - this.padding.bottom;
    const bottomOffset = 32;

    this.drawCounterLabel({
      text: this.getCurrentInterpolatedDate(),
      font: "bold 64px Arial",
      x: labelX,
      y: labelY - bottomOffset,
      color: "#ccc",
    });

    this.drawCounterLabel({
      text: `Total: ${formatNumber(total)}`,
      font: "24px Arial",
      x: labelX,
      y: labelY,
      color: "#ccc",
    });
  }

  drawCounterLabel(props: {
    text: string;
    font: string;
    x: number;
    y: number;
    color: string;
  }) {
    const { text, font, x, y, color } = props;

    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = "right";
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  draw() {
    this.sortBarChart();
    this.drawLabels();
    for (const bar of this.bars) {
      bar.draw();
    }
    this.timelineBar.draw();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw();

    requestAnimationFrame(this.render.bind(this));
  }
}

export default BarChart;
