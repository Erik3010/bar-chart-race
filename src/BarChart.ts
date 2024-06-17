import { type BarChartOption } from "./types";
import { COLORS } from "./constants";
import { createCanvas } from "./utility";

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

  constructor({ element, data, width, height }: BarChartOption) {
    this.element = element;
    this.width = width;
    this.height = height;

    this.data = data;
    this.currentTimeline = "2020";

    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext("2d")!;
    this.element.appendChild(this.canvas);

    this.labelWidth = 100;
    this.padding = { top: 20, right: 20, bottom: 20, left: 100 };
    this.barPadding = { top: 5, right: 0, bottom: 5, left: 0 };
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
    }, 1000);
  }
  drawLabel(label: string, top: number) {
    const fontSize = 14;

    this.ctx.save();
    this.ctx.fillStyle = "#000";
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = "right";
    this.ctx.fillText(
      label,
      this.labelWidth - 10,
      top + fontSize / 2 + this.barHeight / 2
    );
    this.ctx.restore();
  }
  drawNumLabel(label: string, top: number, width: number) {
    const fontSize = 14;

    this.ctx.save();
    this.ctx.fillStyle = "#fff";
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = "right";

    this.ctx.fillText(
      label,
      width - 10,
      top + fontSize / 2 + this.barHeight / 2
    );
    this.ctx.restore();
  }
  drawChart() {
    const { x, y, width } = this.chartArea;

    for (const [index, data] of this.currentData.entries()) {
      const ratio = data.population / this.largestCurrentData.population;
      const barWidth = width * ratio;

      const top = y + index * this.barHeight;

      this.ctx.beginPath();
      this.ctx.fillStyle = COLORS[index];
      this.ctx.rect(x, top, barWidth, this.barHeight);
      this.ctx.fill();
      this.ctx.closePath();

      this.drawLabel(data.country, top);
      this.drawNumLabel(data.population, top, x + barWidth);
    }
  }
  draw() {
    this.drawChart();
  }
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw();
    // requestAnimationFrame(this.render.bind(this));
  }
}

export default BarChart;
