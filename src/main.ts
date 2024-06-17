import "./styles/index.css";
import BarChart from "./BarChart";
import data from "./data/data.json";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const barChart = new BarChart({ canvas, data });

barChart.init();
