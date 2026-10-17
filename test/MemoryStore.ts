import type { DocumentStore } from '../src/application/DocumentStore.ts';
import { Document } from '../src/domain/Document.ts';
import { SvgCodec } from '../src/infrastructure/SvgCodec.ts';
export class MemoryStore implements DocumentStore {
  readonly files=new Map<string,string>();
  private readonly codec=new SvgCodec();
  read(path:string){const xml=this.files.get(path);if(xml===undefined)throw new Error('cannot read file: '+path);return this.codec.decode(xml);}
  write(path:string,document:Document):void {if(path==='denied.svg')throw new Error('cannot write file: '+path);this.files.set(path,this.codec.encode(document));}
}
