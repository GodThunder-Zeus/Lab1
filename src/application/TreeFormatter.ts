import { Document } from '../domain/Document.ts';
import { Shape } from '../domain/Shape.ts';
export class TreeFormatter {
    tree(document: Document, id?: string): string {
        const lines: string[] = [];
        const walk = (s: Shape, prefix: string, last: boolean): void => { lines.push(prefix + (last ? '└── ' : '├── ') + s.summary()); s.children.forEach((c, i) => walk(c, prefix + (last ? '    ' : '│   '), i === s.children.length - 1)); };
        if (id) {
            const s = document.find(id);
            lines.push(s.summary());
            s.children.forEach((c, i) => walk(c, '', i === s.children.length - 1));
        }
        else {
            lines.push('svg (' + document.width + 'x' + document.height + ')');
            document.children.forEach((c, i) => walk(c, '', i === document.children.length - 1));
        }
        return lines.join('\n');
    }
    show(document: Document, id: string): string { const s = document.find(id); return s.tag + '#' + s.id + '  parent=' + document.parentLabel(s) + '\n  ' + s.details(); }
}
