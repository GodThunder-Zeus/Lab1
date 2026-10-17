import { Document } from '../domain/Document.ts';
export class History {
  private past: Document[]=[];
  private future: Document[]=[];
  private blocked=true;
  clear():void {this.past=[];this.future=[];this.blocked=true;}
  record(before:Document):void {this.past.push(before);this.future=[];this.blocked=false;}
  undo(current:Document):Document {
    if(this.blocked) throw new Error('undo not allowed after io command');
    const previous=this.past.pop();if(!previous) throw new Error('nothing to undo');
    this.future.push(current.clone());return previous.clone();
  }
  redo(current:Document):Document {
    if(this.blocked) throw new Error('undo not allowed after io command');
    const next=this.future.pop();if(!next) throw new Error('nothing to redo');
    this.past.push(current.clone());return next.clone();
  }
}
