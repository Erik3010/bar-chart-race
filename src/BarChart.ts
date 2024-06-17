import { type BarChartOption } from "./types";

class BarChart {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  data: any[];

  currentTimeline: string;

  constructor({ canvas, data }: BarChartOption) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.data = data;

    this.currentTimeline = "2020";
  }

  get currentData() {
    return this.data.map((d) => {
      return {
        country: d.country,
        population: d.populations.find(
          (p: any) => p.year === this.currentTimeline
        ).population,
      };
    });
  }

  get largestCurrentData() {
    return this.currentData.reduce(
      (acc, cur) => (acc.population > cur.population ? acc : cur),
      this.currentData[0]
    );
  }

  init() {
    this.render();

    console.log("data", this.currentData, this.largestCurrentData);
  }

  drawBar() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(0, 0, this.canvas.width, 50);
    this.ctx.closePath();
  }
  draw() {
    this.drawBar();
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.draw();
  }
}

export default BarChart;
