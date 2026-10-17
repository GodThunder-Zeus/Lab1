import { readFileSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import type { DocumentStore } from '../application/DocumentStore.ts';
import type { Document } from '../domain/Document.ts';
import { SvgCodec } from './SvgCodec.ts';
export class FileDocumentStore implements DocumentStore {
    private readonly codec = new SvgCodec();
    read(path: string): {
        document: Document;
        warnings: string[];
    } {
        let xml: string;
        try {
            xml = readFileSync(path, 'utf8');
        }
        catch {
            throw new Error('cannot read file: ' + path);
        }
        return this.codec.decode(xml);
    }
    write(path: string, document: Document): void {
        const xml = this.codec.encode(document), temp = path + '.' + randomUUID() + '.tmp';
        try {
            writeFileSync(temp, xml, { encoding: 'utf8', flag: 'wx' });
            renameSync(temp, path);
        }
        catch {
            try {
                unlinkSync(temp);
            }
            catch { }
            throw new Error('cannot write file: ' + path);
        }
    }
}
