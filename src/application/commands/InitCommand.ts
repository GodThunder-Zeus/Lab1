import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
export class InitCommand extends Command {
    readonly kind = 'io' as const;
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; a.count(0, 2); s.init(a.number(0, 800), a.number(1, 600)); return 'canvas ' + s.document.width + 'x' + s.document.height + ' created'; }
}
