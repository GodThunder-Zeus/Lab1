import { createInterface } from 'node:readline';
import { Session } from './application/Session.ts';
import { FileDocumentStore } from './infrastructure/FileDocumentStore.ts';
import { Repl } from './cli/Repl.ts';
const repl = new Repl(new Session(new FileDocumentStore()));
const input = createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
console.log("svg-editor 0.1 — type 'help' for commands");
input.setPrompt('svg> ');
if (process.stdin.isTTY)
    input.prompt();
input.on('line', line => { const output = repl.execute(line); if (output)
    console.log(output); if (process.stdin.isTTY)
    input.prompt(); });
