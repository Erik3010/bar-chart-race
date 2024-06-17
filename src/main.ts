import "./styles/index.css";
import BarChart from "./BarChart";
import data from "./data/data.json";

const barChart = new BarChart({
  element: document.querySelector("#app")!,
  width: 800,
  height: 400,
  data,
});

barChart.init();
