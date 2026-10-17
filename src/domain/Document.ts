import { Shape } from './Shape.ts';
import { Group } from './Group.ts';
export class Document {
    private root = new Group('__canvas__');
    private w: number;
    private h: number;
    constructor(width = 800, height = 600) { this.w = width; this.h = height; this.resize(width, height); }
    get width(): number { return this.w; }
    get height(): number { return this.h; }
    get children(): readonly Shape[] { return this.root.children; }
    resize(width: number, height: number): void {
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
            throw new Error('canvas dimensions must be positive');
        this.w = width;
        this.h = height;
    }
    all(): Shape[] { const visit = (s: Shape): Shape[] => [s, ...s.children.flatMap(visit)]; return this.children.flatMap(visit); }
    find(id: string): Shape { const s = this.all().find(s => s.id === id); if (!s)
        throw new Error('no such shape: ' + id); return s; }
    container(id?: string): Group {
        if (id === undefined)
            return this.root;
        const s = this.all().find(s => s.id === id);
        if (!s)
            throw new Error('no such container: ' + id);
        if (!(s instanceof Group))
            throw new Error('not a container: ' + id);
        return s;
    }
    parent(shape: Shape): Group { const p = [this.root, ...this.all()].find(p => p.children.includes(shape)); if (!(p instanceof Group))
        throw new Error('missing parent'); return p; }
    parentLabel(shape: Shape): string { const p = this.parent(shape); return p === this.root ? 'svg' : 'g#' + p.id; }
    add(shape: Shape, container?: string): void {
        const ids = new Set(this.all().map(s => s.id));
        const visit = (s: Shape): void => { if (ids.has(s.id))
            throw new Error('id already exists: ' + s.id); ids.add(s.id); s.children.forEach(visit); };
        visit(shape);
        this.container(container).insert(shape);
    }
    delete(id: string): void { const s = this.find(id); this.parent(s).remove(s); }
    group(id: string, ids: string[]): void {
        if (this.all().some(s => s.id === id))
            throw new Error('id already exists: ' + id);
        if (!ids.length || new Set(ids).size !== ids.length)
            throw new Error('group requires distinct shapes');
        const selected = ids.map(id => this.find(id));
        for (const s of selected)
            if (selected.some(t => s !== t && this.descends(t, s)))
                throw new Error('cannot group a container into its own descendant: ' + s.id);
        const ordered = this.all().filter(s => selected.includes(s));
        const parents = ordered.map(s => this.parent(s));
        const target = parents.every(p => p === parents[0]) ? parents[0] : this.root;
        const index = target.children.indexOf(ordered[0]);
        const group = new Group(id);
        ordered.forEach(s => { this.parent(s).remove(s); group.insert(s); });
        target.insert(group, index < 0 ? target.children.length : index);
    }
    private descends(shape: Shape, ancestor: Shape): boolean { return ancestor.children.some(c => c === shape || this.descends(shape, c)); }
    ungroup(id: string): void {
        const g = this.container(id);
        const p = this.parent(g);
        if (p === this.root)
            throw new Error('cannot ungroup top-level container: ' + id);
        const index = p.remove(g);
        g.children.forEach((s, i) => { g.remove(s); p.insert(s, index + i); });
    }
    addto(gid: string, id: string): void {
        const g = this.container(gid), s = this.find(id);
        if (g === s || this.descends(g, s))
            throw new Error('cannot group a container into its own descendant: ' + id);
        this.parent(s).remove(s);
        g.insert(s);
    }
    reorder(id: string, front: boolean): void { const s = this.find(id), p = this.parent(s); p.remove(s); p.insert(s, front ? p.children.length : 0); }
    clone(): Document { const copy = new Document(this.w, this.h); copy.root = this.root.clone(); return copy; }
}
