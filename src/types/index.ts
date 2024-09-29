export interface Dimension {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dataset {
  date: string;
  value: number;
}

export type Datasets = Dataset[];

export interface DataType {
  label: string;
  datasets: Datasets;
}

export interface Drawable {
  ctx: CanvasRenderingContext2D;
}

export interface BarChartOption {
  width: number;
  height: number;
  element: HTMLElement;
}

export interface BarOption extends Drawable {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  value: number;
}

export interface TimelineBarOption extends Drawable {
  start: Coordinate;
  end: Coordinate;
  labels: string[];
}

export interface DrawBarLabelOption {
  text: string;
  startX: number;
  color: string;
  clampStart?: boolean;
}
