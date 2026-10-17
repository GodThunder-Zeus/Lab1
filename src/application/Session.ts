import { Document } from '../domain/Document.ts';
import { History } from './History.ts';
import type { DocumentStore } from './DocumentStore.ts';
import type { Command } from './Command.ts';
export class Session {
    private current?: Document;
    private filename?: string;
    private readonly history = new History();
    constructor(private readonly store: DocumentStore) { }
    get document(): Document { if (!this.current)
        throw new Error("no document. use 'init' or 'read' first"); return this.current; }
    run(command: Command): string {
        const before = this.current?.clone(), path = this.filename;
        try {
            const output = command.execute(this);
            if (command.kind === 'edit' && before)
                this.history.record(before);
            if (command.kind === 'io')
                this.history.clear();
            return output;
        }
        catch (error) {
            this.current = before;
            this.filename = path;
            throw error;
        }
    }
    init(w: number, h: number): void { this.current = new Document(w, h); this.filename = undefined; }
    read(path: string): string { const result = this.store.read(path); this.current = result.document; this.filename = path; return [...result.warnings, 'read ' + path + ' (' + this.document.all().length + ' elements)'].join('\n'); }
    save(path?: string): string {
        const doc = this.document, target = path ?? this.filename;
        if (!target)
            throw new Error('no file path. use save <file.svg>');
        this.store.write(target, doc);
        this.filename = target;
        return 'saved to ' + target + ' (' + doc.all().length + ' elements)';
    }
    undo(): void { this.current = this.history.undo(this.document); }
    redo(): void { this.current = this.history.redo(this.document); }
}
