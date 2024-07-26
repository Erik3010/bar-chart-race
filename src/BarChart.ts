import { type BarChartOption } from "./types";
import { createCanvas } from "./utility";
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
    this.currentTimelineIndex = 0;
    this.timelineStepDuration = 1;

    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.padding = { top: 20, right: 20, bottom: 20, left: 100 };

    this.bars = [];
  }
  get currentData() {
    return this.data.map((d) => ({
      country: d.country,
      population: d.populations.find(
        (p: any) => p.year === this.currentTimelineKey
      ).population,
    }));
  }
  get currentTimelineKey() {
    return this.timelineKeys[this.currentTimelineIndex];
  }
  get nextTimelineKey() {
    const nextIndex = this.currentTimelineIndex + 1;

    if (nextIndex >= this.timelineKeys.length) return null;
    return this.timelineKeys[nextIndex];
  }
  get largestCurrentData() {
    return this.currentData.reduce(
      (acc, cur) => (acc.population > cur.population ? acc : cur),
      this.currentData[0]
    );
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
    // while (this.nextTimelineKey) {
    //   this.currentTimelineIndex++;
    // }
    // await Promise.all(this.bars.map((bar) => bar.animate(100)));

    const callbacks = this.bars.map((bar) => {
      return bar.animate(100);
    });
    await Promise.all(callbacks);
    console.log("done");

    // run temporary timeline
    // setInterval(() => {
    //   this.currentTimelineIndex =
    //     ++this.currentTimelineIndex % this.timelineKeys.length;
    //   // this.updateBars();
    // }, 1000);
  }
  initChart() {
    for (const [index, data] of this.currentData.entries()) {
      const bar = this.createBar(data, index);
      this.bars.push(bar);
    }
  }
  createBar(data: { country: string; population: number }, index: number) {
    const { x, y, width } = this.chartArea;

    const ratio = data.population / this.largestCurrentData.population;
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
  updateBars() {
    const { width } = this.chartArea;

    for (const bar of this.bars) {
      const value = this.currentData.find(
        ({ country }) => country === bar.label
      );
      if (!value) continue;

      const ratio = value.population / this.largestCurrentData.population;

      bar.value = value.population;
      bar.width = width * ratio;
    }
  }
  drawCurrentTimelineLabel() {
    this.ctx.save();
    this.ctx.fillStyle = "#000";
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(this.currentTimelineKey, this.width - 10, 10);
    this.ctx.restore();
  }
  draw() {
    this.drawCurrentTimelineLabel();

    for (const bar of this.bars) {
      bar.draw();
    }
  }
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw();
    requestAnimationFrame(this.render.bind(this));
  }
}

export default BarChart;
