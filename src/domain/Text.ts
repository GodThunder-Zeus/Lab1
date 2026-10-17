import { Shape } from './Shape.ts';
export class Text extends Shape {
    private value = '';
    get tag(): string { return 'text'; }
    protected get geometry(): readonly string[] { return ['x', 'y']; }
    get content(): string { return this.value; }
    details(): string { return super.details() + '\n  text=' + JSON.stringify(this.value); }
    set(name: string, value: string): void { if (name === 'text')
        this.value = value;
    else
        super.set(name, value); }
    move(dx: number, dy: number): void { this.shift(['x'], dx); this.shift(['y'], dy); }
    clone(): Text { const copy = this.copyTo(new Text(this.id)); copy.value = this.value; return copy; }
    summary(): string { return super.summary() + ' ' + JSON.stringify(this.value); }
}
