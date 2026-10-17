import { Shape } from './Shape.ts';
export class Group extends Shape {
  private items: Shape[] = [];
  get tag(): string { return 'g'; }
  protected get geometry(): readonly string[] { return []; }
  get children(): readonly Shape[] { return [...this.items]; }
  insert(shape: Shape, index = this.items.length): void {
    if (shape === this || shape.children.some(child => this.contains(child, this))) throw new Error('cannot create a cycle');
    if (this.items.includes(shape)) throw new Error('shape already in container');
    this.items.splice(index,0,shape);
  }
  private contains(root: Shape, target: Shape): boolean { return root === target || root.children.some(child => this.contains(child,target)); }
  remove(shape: Shape): number {
    const index = this.items.indexOf(shape);
    if (index < 0) throw new Error('shape is not in container');
    this.items.splice(index,1); return index;
  }
  move(dx: number,dy: number): void { for (const child of this.items) child.move(dx,dy); }
  scale(factor: number): void { super.scale(factor); for (const child of this.items) child.scale(factor); }
  clone(): Group { const copy = this.copyTo(new Group(this.id)); for (const child of this.items) copy.insert(child.clone()); return copy; }
}
