import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "BarChartRace",
      formats: ["es", "umd", "cjs"],
      fileName: (format) => `bar-chart-race.${format}.js`,
    },
  },
});
