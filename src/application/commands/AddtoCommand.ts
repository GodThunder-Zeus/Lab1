import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
export class AddtoCommand extends Command {
    readonly kind = 'edit' as const;
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; const d = s.document; a.count(2); d.addto(a.at(0), a.at(1)); return a.at(1) + ' moved into g#' + a.at(0); }
}
