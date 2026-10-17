import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
import { TreeFormatter } from '../TreeFormatter.ts';
export class ShowCommand extends Command {
    readonly kind = 'display' as const;
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; const d = s.document; a.count(1); return new TreeFormatter().show(d, a.at(0)); }
}
