import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';


export class SetCommand extends Command {
  readonly kind='edit' as const;
  
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;const d=s.document;a.count(3);const shape=d.find(a.at(0));shape.set(a.at(1),a.at(2));return shape.tag+'#'+shape.id+' updated: '+a.at(1)+'='+JSON.stringify(a.at(2));}
}
