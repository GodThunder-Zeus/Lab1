import { Shape } from './Shape.ts';
import { Rect } from './Rect.ts';
import { Circle } from './Circle.ts';
import { Ellipse } from './Ellipse.ts';
import { Line } from './Line.ts';
import { Text } from './Text.ts';
import { Group } from './Group.ts';
export class ShapeFactory {
    // Phase 1 name dispatch point; replace registration ownership with providers in Phase 2.
    private readonly types = new Map<string, {
        make: (id: string) => Shape;
        keys: string[];
        style?: string;
    }>([
        ['rect', { make: id => new Rect(id), keys: ['x', 'y', 'width', 'height'], style: 'fill' }],
        ['circle', { make: id => new Circle(id), keys: ['cx', 'cy', 'r'], style: 'fill' }],
        ['ellipse', { make: id => new Ellipse(id), keys: ['cx', 'cy', 'rx', 'ry'], style: 'fill' }],
        ['line', { make: id => new Line(id), keys: ['x1', 'y1', 'x2', 'y2'], style: 'stroke' }],
        ['text', { make: id => new Text(id), keys: ['x', 'y', 'text'] }],
        ['g', { make: id => new Group(id), keys: [] }],
    ]);
    private spec(type: string) { const spec = this.types.get(type); if (!spec)
        throw new Error('unknown shape type: ' + type + ' (is the plugin loaded?)'); return spec; }
    create(type: string, id: string, args: string[]): Shape {
        const spec = this.spec(type);
        if (args.length < spec.keys.length || args.length > spec.keys.length + (spec.style ? 1 : 0))
            throw new Error('invalid parameters for ' + type);
        const shape = spec.make(id);
        spec.keys.forEach((key, i) => shape.set(key, args[i]));
        if (spec.style && args.length > spec.keys.length)
            shape.set(spec.style, args[spec.keys.length]);
        return shape;
    }
    fromAttributes(type: string, id: string, attributes: Record<string, string>, text: string): Shape {
        const spec = this.spec(type);
        const shape = spec.make(id);
        for (const key of spec.keys)
            shape.set(key, key === 'text' ? text : (attributes[key] ?? '0'));
        for (const [key, value] of Object.entries(attributes))
            if (key !== 'id' && key !== 'data-kind' && key !== 'xmlns')
                shape.set(key, value);
        return shape;
    }
}
