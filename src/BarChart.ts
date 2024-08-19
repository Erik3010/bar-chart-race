import { type Dataset, type DataType, type BarChartOption } from "./types";
import { createCanvas, sleep } from "./utility";
import { COLORS } from "./constants";
import Bar from "./elements/Bar";

class BarChart {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  data: DataType[];
  timelineDates: string[] = [];
  timelineIndex = -1;

  padding: { top: number; right: number; bottom: number; left: number };

  bars: Bar[];

  constructor(options: BarChartOption) {
    const { element, data, width, height } = options;

    this.element = element;
    this.width = width;
    this.height = height;

    this.data = data;
    this.timelineIndex = -1;

    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.padding = { top: 30, right: 30, bottom: 30, left: 100 };

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
  get activeTimelineDate() {
    if (this.timelineIndex < 0) return null;
    return this.timelineDates[this.timelineIndex];
  }
  get currentData() {
    return this.getDataByDate(this.activeTimelineDate);
  }
  get largestCurrentData() {
    return this.getLargestDataByDate(this.activeTimelineDate);
  }
  get nextTimelineDate() {
    const nextIndex = this.timelineIndex + 1;
    if (nextIndex >= this.timelineDates.length) return null;
    return this.timelineDates[nextIndex];
  }
  get nextData() {
    if (!this.nextTimelineDate) return null;
    return this.getDataByDate(this.nextTimelineDate);
  }
  get largestNextData() {
    if (!this.nextTimelineDate) return null;
    return this.getLargestDataByDate(this.nextTimelineDate);
  }
  get endTimelineDate() {
    return this.timelineDates[this.timelineDates.length - 1];
  }
  get chartArea() {
    return {
      x: this.padding.left,
      y: this.padding.top,
      width: this.width - this.padding.left - this.padding.right,
      height: this.height - this.padding.top - this.padding.bottom,
    };
  }
  get barHeight() {
    return this.chartArea.height / this.data.length;
  }
  extractTimelineDates(): any[] {
    return this.data[0].datasets.map(({ date }: Dataset) => date);
  }
  init() {
    this.element.appendChild(this.canvas);
    this.timelineDates = this.extractTimelineDates();

    this.initChart();
    this.render();
    this.runTimeline();
  }
  async runTimeline() {
    while (this.nextTimelineDate) {
      const callbacks = this.bars.map((bar) => {
        const nextBarData = this.nextData?.find(
          (data) => data.label === bar.label
        );

        const largestNextData = Math.max(this.largestNextData!.value, 1);
        const ratio = nextBarData!.value / largestNextData;
        const barWidth = this.chartArea.width * ratio;

        return bar.animateTo(barWidth, nextBarData!.value);
      });
      await Promise.all(callbacks);
      await sleep(100);

      this.timelineIndex++;
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
  initChart() {
    const datum = this.currentData;
    for (const [index, data] of datum.entries()) {
      const bar = this.createBar(data, index);
      this.bars.push(bar);
    }
  }
  createBar(data: { label: string; value: number }, index: number) {
    const { x, y, width } = this.chartArea;

    const largestCurrentData = Math.max(this.largestCurrentData.value, 1);

    const ratio = data.value / largestCurrentData;
    const barWidth = width * ratio;
    const top = y + index * this.barHeight;

    return new Bar({
      ctx: this.ctx,
      x,
      y: top,
      width: barWidth,
      height: this.barHeight,
      color: COLORS[index],
      label: data.label,
      value: data.value,
    });
  }
  drawTimelineLabel() {
    const timelineLabelText = this.nextTimelineDate || this.endTimelineDate;

    this.ctx.save();
    this.ctx.fillStyle = "#000";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(timelineLabelText, this.width - 10, 10);
    this.ctx.restore();
  }
  draw() {
    this.sortBarChart();
    for (const bar of this.bars) {
      bar.draw();
    }
    this.drawTimelineLabel();
  }
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw();
    requestAnimationFrame(this.render.bind(this));
  }
}

export default BarChart;
