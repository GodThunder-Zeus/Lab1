export class Arguments {
    constructor(private readonly values: readonly string[]) { }
    count(min: number, max = min): void { if (this.values.length < min || this.values.length > max)
        throw new Error('invalid command arguments'); }
    at(index: number): string { const v = this.values[index]; if (v === undefined)
        throw new Error('missing argument'); return v; }
    optional(index: number): string | undefined { return this.values[index]; }
    number(index: number, defaultValue?: number): number { const raw = this.values[index]; if (raw === undefined && defaultValue !== undefined)
        return defaultValue; const n = Number(this.at(index)); if (!raw?.trim() || !Number.isFinite(n))
        throw new Error('invalid number: ' + raw); return n; }
    rest(index: number): string[] { return this.values.slice(index); }
}
