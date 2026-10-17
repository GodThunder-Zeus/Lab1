export class Tokenizer {
    parse(line: string): string[] {
        if (line.trimStart().startsWith('#'))
            return [];
        const tokens: string[] = [];
        let value = '', quoted = false, started = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
                quoted = !quoted;
                started = true;
            }
            else if (c === '\\' && quoted && ['"', '\\'].includes(line[i + 1])) {
                value += line[++i];
                started = true;
            }
            else if (/\s/u.test(c) && !quoted) {
                if (started) {
                    tokens.push(value);
                    value = '';
                    started = false;
                }
            }
            else {
                value += c;
                started = true;
            }
        }
        if (quoted)
            throw new Error('unterminated double quote');
        if (started)
            tokens.push(value);
        return tokens;
    }
}
