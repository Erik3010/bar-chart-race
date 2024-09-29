import "../styles/index.css";
import data from "../data/data.json";
import BarChart from "@/index";

const barChart = new BarChart(data, {
  width: 800,
  height: 400,
  element: document.querySelector("#app")!,
});
barChart.init();
