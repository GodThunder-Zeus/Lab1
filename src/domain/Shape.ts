export abstract class Shape {
  private readonly attributes = new Map<string, string>();
  constructor(private readonly identifier: string) {
    if (!identifier || /[\s<>"'&]/u.test(identifier)) throw new Error('invalid id: ' + identifier);
  }
  get id(): string { return this.identifier; }
  abstract get tag(): string;
  protected abstract get geometry(): readonly string[];
  abstract move(dx: number, dy: number): void;
  abstract clone(): Shape;
  get children(): readonly Shape[] { return []; }
  get content(): string { return ''; }
  entries(): [string,string][] { return [...this.attributes]; }
  get(name: string): string | undefined { return this.attributes.get(name); }
  set(name: string, value: string): void {
    if (this.geometry.includes(name) || name === 'stroke-width') {
      const n = Number(value);
      if (!value.trim() || !Number.isFinite(n)) throw new Error('invalid number: ' + value);
      if (['width','height','r','rx','ry','stroke-width'].includes(name) && n < 0) throw new Error(name + ' must be non-negative');
      this.attributes.set(name, String(n));
    } else if (['fill','stroke'].includes(name)) this.attributes.set(name,value);
    else throw new Error('unknown attribute: ' + name);
  }
  protected shift(names: readonly string[], delta: number): void {
    for (const key of names) this.set(key, String(Number(this.get(key) ?? 0) + delta));
  }
  scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) throw new Error('scale factor must be positive');
    for (const key of this.geometry) this.set(key, String(Number(this.get(key) ?? 0) * factor));
  }
  protected copyTo<T extends Shape>(target: T): T {
    for (const [k,v] of this.entries()) target.set(k,v);
    return target;
  }
  summary(): string {
    return this.tag + '#' + this.id + '  ' + this.entries().map(([k,v]) => k + '=' + v).join(' ');
  }
}
