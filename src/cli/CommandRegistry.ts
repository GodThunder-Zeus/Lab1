import { Command } from '../application/Command.ts';
import { InitCommand } from '../application/commands/InitCommand.ts';
import { ReadCommand } from '../application/commands/ReadCommand.ts';
import { SaveCommand } from '../application/commands/SaveCommand.ts';
import { CanvasCommand } from '../application/commands/CanvasCommand.ts';
import { CreateCommand } from '../application/commands/CreateCommand.ts';
import { DeleteCommand } from '../application/commands/DeleteCommand.ts';
import { MoveCommand } from '../application/commands/MoveCommand.ts';
import { ScaleCommand } from '../application/commands/ScaleCommand.ts';
import { SetCommand } from '../application/commands/SetCommand.ts';
import { GroupCommand } from '../application/commands/GroupCommand.ts';
import { UngroupCommand } from '../application/commands/UngroupCommand.ts';
import { AddtoCommand } from '../application/commands/AddtoCommand.ts';
import { FrontCommand } from '../application/commands/FrontCommand.ts';
import { BackCommand } from '../application/commands/BackCommand.ts';
import { TreeCommand } from '../application/commands/TreeCommand.ts';
import { ShowCommand } from '../application/commands/ShowCommand.ts';
import { UndoCommand } from '../application/commands/UndoCommand.ts';
import { RedoCommand } from '../application/commands/RedoCommand.ts';
import { HelpCommand } from '../application/commands/HelpCommand.ts';
export class CommandRegistry {
  // Phase 1 name dispatch point; registration will move into providers in Phase 2.
  private readonly commands=new Map<string,new(args:string[])=>Command>([
    ['init',InitCommand],
    ['read',ReadCommand],
    ['save',SaveCommand],
    ['canvas',CanvasCommand],
    ['create',CreateCommand],
    ['delete',DeleteCommand],
    ['move',MoveCommand],
    ['scale',ScaleCommand],
    ['set',SetCommand],
    ['group',GroupCommand],
    ['ungroup',UngroupCommand],
    ['addto',AddtoCommand],
    ['front',FrontCommand],
    ['back',BackCommand],
    ['tree',TreeCommand],
    ['show',ShowCommand],
    ['undo',UndoCommand],
    ['redo',RedoCommand],
    ['help',HelpCommand]
  ]);
  create(tokens:string[]):Command {const ctor=this.commands.get(tokens[0]);if(!ctor)throw new Error('unknown command: '+tokens[0]);return new ctor(tokens.slice(1));}
}
