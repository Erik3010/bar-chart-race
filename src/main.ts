import "./styles/index.css";
import BarChart from "./BarChart";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const barChart = new BarChart({
  canvas,
  data: [
    {
      country: "USA",
      populations: [
        { year: "2020", population: 331 },
        { year: "2021", population: 334 },
        { year: "2022", population: 337 },
        { year: "2023", population: 340 },
        { year: "2024", population: 343 },
      ],
    },
    {
      country: "China",
      populations: [
        { year: "2020", population: 1441 },
        { year: "2021", population: 1446 },
        { year: "2022", population: 1451 },
        { year: "2023", population: 1456 },
        { year: "2024", population: 1461 },
      ],
    },
    {
      country: "India",
      populations: [
        { year: "2020", population: 1380 },
        { year: "2021", population: 1390 },
        { year: "2022", population: 1400 },
        { year: "2023", population: 1410 },
        { year: "2024", population: 1420 },
      ],
    },
    {
      country: "Brazil",
      populations: [
        { year: "2020", population: 212 },
        { year: "2021", population: 213 },
        { year: "2022", population: 214 },
        { year: "2023", population: 215 },
        { year: "2024", population: 216 },
      ],
    },
    {
      country: "Pakistan",
      populations: [
        { year: "2020", population: 220 },
        { year: "2021", population: 222 },
        { year: "2022", population: 224 },
        { year: "2023", population: 226 },
        { year: "2024", population: 228 },
      ],
    },
  ],
});
barChart.init();
