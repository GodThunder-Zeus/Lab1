import { Shape } from './Shape.ts';
export class Ellipse extends Shape {
    get tag(): string { return 'ellipse'; }
    protected get geometry(): readonly string[] { return ["cx", "cy", "rx", "ry"]; }
    move(dx: number, dy: number): void { this.shift(["cx"], dx); this.shift(["cy"], dy); }
    clone(): Ellipse { return this.copyTo(new Ellipse(this.id)); }
}
