import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
export class BackCommand extends Command {
    readonly kind = 'edit' as const;
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; const d = s.document; a.count(1); d.reorder(a.at(0), false); return a.at(0) + ' moved to back'; }
}
