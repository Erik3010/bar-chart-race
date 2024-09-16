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

  private dateIndex = -1;

  private padding: { top: number; right: number; bottom: number; left: number };
  private bars: Bar[];
  private timelineBar!: TimelineBar;

  constructor({ element, data, width, height }: BarChartOption) {
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
  getLargestDataByDate(date: Dataset["date"] | null) {
    const data = this.getDataByDate(date);
    return data.reduce(
      (acc, cur) => (acc.value > cur.value ? acc : cur),
      data[0]
    );
  }
  get dateLabels() {
    if (this.data.length === 0) return [];
    return this.data[0].datasets.map((data) => data.date);
  }
  get currentDate() {
    if (this.dateIndex < 0) return null;
    return this.dateLabels[this.dateIndex];
  }
  get currentData() {
    return this.getDataByDate(this.currentDate);
  }
  get largestCurrentData() {
    return this.getLargestDataByDate(this.currentDate);
  }
  get nextDate() {
    const nextIndex = this.dateIndex + 1;
    if (nextIndex >= this.dateLabels.length) return null;
    return this.dateLabels[nextIndex];
  }
  get nextData() {
    if (!this.nextDate) return null;
    return this.getDataByDate(this.nextDate);
  }
  get largestNextData() {
    if (!this.nextDate) return null;
    return this.getLargestDataByDate(this.nextDate);
  }
  get lastDate() {
    return this.dateLabels[this.dateLabels.length - 1];
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
  get isInitialAnimation() {
    return this.dateIndex === -1;
  }
  init() {
    this.containerElement.appendChild(this.canvas);

    this.initBars();
    this.initTimelineBar();
    this.render();
    this.startAnimation();
  }
  async startAnimation() {
    while (this.nextDate) {
      const animations = this.bars.map((bar) => {
        const nextBarData = this.nextData?.find(
          (data) => data.label === bar.label
        );

        const largestNextData = Math.max(this.largestNextData!.value, 1);
        const widthRatio = nextBarData!.value / largestNextData;
        const newBarWidth = this.chartDimension.width * widthRatio;

        return bar.animateTo(newBarWidth, nextBarData!.value);
      });

      const timelineAnimations = !this.isInitialAnimation
        ? [this.timelineBar.animateTo(this.dateIndex + 1)]
        : [];
      await Promise.all([...animations, ...timelineAnimations]);
      await sleep(100);

      this.dateIndex++;
    }
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
    if (this.isInitialAnimation) return;

    const total = this.bars.reduce((acc, bar) => acc + bar.value, 0);
    const labelX = this.width - this.padding.right;
    const labelY = this.height - this.padding.bottom;
    const bottomOffset = 32;

    this.drawCounterLabel({
      text: this.currentDate || "",
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
