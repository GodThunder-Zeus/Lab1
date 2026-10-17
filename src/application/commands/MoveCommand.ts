import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
export class MoveCommand extends Command {
    readonly kind = 'edit' as const;
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; const d = s.document; a.count(3); const shape = d.find(a.at(0)); const dx = a.number(1), dy = a.number(2); shape.move(dx, dy); return shape.tag + '#' + shape.id + ' moved by (' + dx + ',' + dy + ')'; }
}
