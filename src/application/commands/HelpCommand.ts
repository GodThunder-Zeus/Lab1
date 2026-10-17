import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';


export class HelpCommand extends Command {
  readonly kind='display' as const;
  static readonly text="init [w] [h]\nread <file.svg>\nsave [file.svg]\ncanvas [w h]\ncreate rect <id> <x> <y> <w> <h> [fill] [in <gid>]\ncreate circle <id> <cx> <cy> <r> [fill] [in <gid>]\ncreate ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <gid>]\ncreate line <id> <x1> <y1> <x2> <y2> [stroke] [in <gid>]\ncreate text <id> <x> <y> \"content\" [in <gid>]\ncreate g <id> [in <gid>]\ndelete <id>\nmove <id> <dx> <dy>\nscale <id> <factor>\nset <id> <attr> <value>\ngroup <newGid> <id1> <id2>...\nungroup <gid>\naddto <gid> <id>\nfront <id>\nback <id>\ntree [id]\nshow <id>\nundo\nredo\nhelp";
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;a.count(0);return HelpCommand.text;}
}
