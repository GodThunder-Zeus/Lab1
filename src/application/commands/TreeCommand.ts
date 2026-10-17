import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';

import { TreeFormatter } from '../TreeFormatter.ts';
export class TreeCommand extends Command {
  readonly kind='display' as const;
  
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;const d=s.document;a.count(0,1);return new TreeFormatter().tree(d,a.optional(0));}
}
