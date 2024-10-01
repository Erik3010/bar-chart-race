# Bar Chart Race Library

![preview](https://github.com/user-attachments/assets/e2b00fe1-a658-4120-9d10-0d3fadbc5d20)

An open-source Bar Chart Race library built with TypeScript. This library allows you to create a smooth animated bar chart races effortlessly. It works by utilizing the HTML5 Canvas API to render the graphics, providing high performance.

## Installation

Install the library using npm:

```bash
npm install bar-chart-race
```

Or using yarn:

```bash
yarn add bar-chart-race
```

## Usage

Here's a basic example to get you started:

```javascript
import BarChartRace from "bar-chart-race";

const data = [
  {
    label: "USA",
    datasets: [
      { date: "2020", value: 267 },
      { date: "2021", value: 426 },
      { date: "2024", value: 279 },
    ],
  },
  {
    label: "China",
    datasets: [
      { date: "2020", value: 1883 },
      { date: "2021", value: 1340 },
      { date: "2022", value: 1748 },
    ],
  },
];

const chart = new BarChartRace(data, {
  width: 800,
  height: 400,
  element: document.querySelector("#chart-container")!,
});
chart.init();
```

## Documentation

TBA
