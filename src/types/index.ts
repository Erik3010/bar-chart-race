export interface BarChartOption {
  width: number;
  height: number;
  element: HTMLElement;
  data: any[];
}

export interface BarOption {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  value: number;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
