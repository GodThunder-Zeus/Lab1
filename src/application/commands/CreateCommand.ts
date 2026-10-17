import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
import { ShapeFactory } from '../../domain/ShapeFactory.ts';

export class CreateCommand extends Command {
  readonly kind='edit' as const;
  
  private readonly args:Arguments;
  constructor(values:string[]){super();this.args=new Arguments(values);}
  execute(s:Session):string {const a=this.args;const d=s.document;a.count(2,100);const params=a.rest(2);let parent:string|undefined;if(params.length>=2 && params[params.length-2]==='in'){parent=params.pop();params.pop();}const shape=new ShapeFactory().create(a.at(0),a.at(1),params);d.add(shape,parent);return shape.tag+'#'+shape.id+' created'+(parent?' in g#'+parent:'');}
}
