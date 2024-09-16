import "../styles/index.css";
import data from "../data/data.json";
import BarChart from "@/index";

const barChart = new BarChart({
  data,
  element: document.querySelector("#app")!,
  width: 800,
  height: 400,
});

barChart.init();
