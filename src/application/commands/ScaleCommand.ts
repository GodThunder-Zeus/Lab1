import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
export class ScaleCommand extends Command {
    readonly kind = 'edit' as const;
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; const d = s.document; a.count(2); const shape = d.find(a.at(0)); shape.scale(a.number(1)); return shape.tag + '#' + shape.id + ' scaled by ' + a.at(1); }
}
