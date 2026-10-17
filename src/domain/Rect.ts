import { Shape } from './Shape.ts';
export class Rect extends Shape {
    get tag(): string { return 'rect'; }
    protected get geometry(): readonly string[] { return ["x", "y", "width", "height"]; }
    move(dx: number, dy: number): void { this.shift(["x"], dx); this.shift(["y"], dy); }
    clone(): Rect { return this.copyTo(new Rect(this.id)); }
}
