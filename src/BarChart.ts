import { type BarChartOption } from "./types";
import { COLORS } from "./constants";
import { createCanvas } from "./utility";
import Bar from "./elements/Bar";

class BarChart {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  data: any[];

  labelWidth: number;
  padding: { top: number; right: number; bottom: number; left: number };
  barPadding: { top: number; right: number; bottom: number; left: number };

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

    this.labelWidth = 100;
    this.padding = { top: 20, right: 20, bottom: 20, left: 100 };
    this.barPadding = { top: 5, right: 0, bottom: 5, left: 0 };

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
  get label() {
    return this.data.map((d) => d.country);
  }
  init() {
    this.element.appendChild(this.canvas);

    this.initBar();

    this.render();
    // this.runTimeline();
  }
  runTimeline() {
    // run temporary timeline
    const years = ["2021", "2022", "2023", "2024"];
    let index = 0;
    setInterval(() => {
      this.currentTimeline = years[index];
      index = ++index % years.length;
      this.updateBars();
    }, 1000);
  }
  initBar() {
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
  draw() {
    for (const bar of this.bars) {
      bar.draw();
    }
  }
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw();
    // requestAnimationFrame(this.render.bind(this));
  }
}

export default BarChart;
