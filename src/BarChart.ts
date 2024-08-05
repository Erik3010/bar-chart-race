import { type BarChartOption } from "./types";
import { createCanvas, sleep, sortDescending } from "./utility";
import { COLORS } from "./constants";
import Bar from "./elements/Bar";

class BarChart {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  data: any[];
  timelineKeys: string[];
  currentTimelineIndex: number;
  timelineStepDuration: number;

  padding: { top: number; right: number; bottom: number; left: number };

  bars: Bar[];

  constructor({ element, data, width, height }: BarChartOption) {
    this.element = element;
    this.width = width;
    this.height = height;

    this.data = data;
    this.timelineKeys = data[0].populations.map((p: any) => p.year);
    // this.timelineKeys = data[0].populations.map((p: any) => p.year).slice(0, 1);
    this.currentTimelineIndex = -1;
    this.timelineStepDuration = 1;

    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.padding = { top: 30, right: 30, bottom: 30, left: 100 };

    this.bars = [];
  }
  getDataBasedOnKey(key: string | null) {
    return this.data.map((d) => ({
      country: d.country,
      population:
        d.populations.find((p: any) => p.year === key)?.population ?? 0,
    }));
  }
  getLargestDataBasedOnKey(key: string | null) {
    const data = this.getDataBasedOnKey(key);
    return data.reduce(
      (acc, cur) => (acc.population > cur.population ? acc : cur),
      data[0]
    );
  }
  get currentTimelineKey() {
    if (this.currentTimelineIndex < 0) return null;
    return this.timelineKeys[this.currentTimelineIndex];
  }
  get currentData() {
    return this.getDataBasedOnKey(this.currentTimelineKey);
  }
  get largestCurrentData() {
    return this.getLargestDataBasedOnKey(this.currentTimelineKey);
  }
  get nextTimelineKey() {
    const nextIndex = this.currentTimelineIndex + 1;

    if (nextIndex >= this.timelineKeys.length) return null;
    return this.timelineKeys[nextIndex];
  }
  get nextData() {
    if (!this.nextTimelineKey) return null;
    return this.getDataBasedOnKey(this.nextTimelineKey);
  }
  get largestNextData() {
    if (!this.nextTimelineKey) return null;
    return this.getLargestDataBasedOnKey(this.nextTimelineKey);
  }
  get lastTimelineKey() {
    return this.timelineKeys[this.timelineKeys.length - 1];
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
  init() {
    this.element.appendChild(this.canvas);

    this.initChart();
    this.render();
    this.runTimeline();
  }
  async runTimeline() {
    while (this.nextTimelineKey) {
      const initialYPos = this.bars.map((bar) => bar.y).sort((a, b) => a - b);

      const callbacks = this.bars.map((bar) => {
        const nextBarData = this.nextData?.find(
          (data) => data.country === bar.label
        );

        // const currentPosition = this.getPosition(bar.label);
        const nextPosition = this.getPosition(bar.label, this.nextData!);
        const nextY = initialYPos[nextPosition];

        const largestPopulation = Math.max(this.largestNextData!.population, 1);
        const ratio = nextBarData!.population / largestPopulation;
        const barWidth = this.chartArea.width * ratio;

        return bar.animateTo(barWidth, nextBarData!.population, nextY);
      });
      await Promise.all(callbacks);
      await sleep(250);

      this.currentTimelineIndex++;
    }
  }
  initChart() {
    // const datum = this.currentData.slice(0, 1);
    // const datum = this.currentData;
    const datum = sortDescending(this.currentData);

    for (const [index, data] of datum.entries()) {
      const bar = this.createBar(data, index);
      this.bars.push(bar);
    }
  }
  createBar(data: { country: string; population: number }, index: number) {
    const { x, y, width } = this.chartArea;

    const largestPopulation = Math.max(this.largestCurrentData.population, 1);

    const ratio = data.population / largestPopulation;
    const barWidth = width * ratio;
    const top = y + index * this.barHeight;

    return new Bar({
      ctx: this.ctx,
      x,
      y: top,
      width: barWidth,
      height: this.barHeight,
      color: COLORS[index],
      label: data.country,
      value: data.population,
    });
  }
  getPosition(country: string, data = this.currentData) {
    return sortDescending(data).findIndex((d) => d.country === country);
  }
  drawTimelineLabel() {
    const timelineLabelText = this.nextTimelineKey || this.lastTimelineKey;

    this.ctx.save();
    this.ctx.fillStyle = "#000";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(timelineLabelText, this.width - 10, 10);
    this.ctx.restore();
  }
  draw() {
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
