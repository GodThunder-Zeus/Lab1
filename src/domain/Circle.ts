import { Shape } from './Shape.ts';
export class Circle extends Shape {
  get tag(): string { return 'circle'; }
  protected get geometry(): readonly string[] { return ["cx","cy","r"]; }
  move(dx: number,dy: number): void { this.shift(["cx"],dx); this.shift(["cy"],dy); }
  clone(): Circle { return this.copyTo(new Circle(this.id)); }
}
