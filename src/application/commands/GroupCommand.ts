import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';


export class GroupCommand extends Command {
  readonly kind='edit' as const;
  
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;const d=s.document;a.count(2,10000);d.group(a.at(0),a.rest(1));return 'g#'+a.at(0)+' created with '+a.rest(1).length+' children';}
}
