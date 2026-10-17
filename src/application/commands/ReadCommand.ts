import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';


export class ReadCommand extends Command {
  readonly kind='io' as const;
  
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;a.count(1);return s.read(a.at(0));}
}
