import { Command } from '../Command.ts';
import { Arguments } from '../Arguments.ts';
import type { Session } from '../Session.ts';
export class CanvasCommand extends Command {
    get kind(): 'io' | 'display' { return this.args.optional(0) === undefined ? 'display' : 'io'; }
    private readonly args: Arguments;
    constructor(values: string[]) { super(); this.args = new Arguments(values); }
    execute(s: Session): string { const a = this.args; const d = s.document; if (a.optional(0) === undefined) {
        a.count(0);
        return 'canvas ' + d.width + 'x' + d.height;
    } a.count(2); d.resize(a.number(0), a.number(1)); return 'canvas resized to ' + d.width + 'x' + d.height; }
}
