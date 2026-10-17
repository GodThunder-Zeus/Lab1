import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';


export class UndoCommand extends Command {
  readonly kind='history' as const;
  
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;a.count(0);s.undo();return 'undone: last edit restored';}
}
