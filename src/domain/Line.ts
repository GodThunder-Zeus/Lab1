import { Shape } from './Shape.ts';
export class Line extends Shape {
  get tag(): string { return 'line'; }
  protected get geometry(): readonly string[] { return ["x1","y1","x2","y2"]; }
  move(dx: number,dy: number): void { this.shift(["x1","x2"],dx); this.shift(["y1","y2"],dy); }
  clone(): Line { return this.copyTo(new Line(this.id)); }
}
