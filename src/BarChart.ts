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

  padding: { top: number; right: number; bottom: number; left: number };

  currentTimeline: string;

  bars: Bar[];

  constructor({ element, data, width, height }: BarChartOption) {
    this.element = element;
    this.width = width;
    this.height = height;

    this.data = data;
    this.currentTimeline = "2020";

    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.padding = { top: 20, right: 20, bottom: 20, left: 100 };

    this.bars = [];
  }
  get currentData() {
    return this.data.map((d) => ({
      country: d.country,
      population: d.populations.find(
        (p: any) => p.year === this.currentTimeline
      ).population,
    }));
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
  runTimeline() {
    // run temporary timeline
    const years = ["2020", "2021", "2022", "2023", "2024"];
    let index = 1;
    setInterval(() => {
      this.currentTimeline = years[index];
      index = ++index % years.length;
      this.updateBars();
    }, 1000);
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
    this.ctx.fillText(this.currentTimeline, this.width - 10, 10);
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
