import type { Session } from '../application/Session.ts';
import { Tokenizer } from './Tokenizer.ts';
import { CommandRegistry } from './CommandRegistry.ts';
export class Repl {
  private readonly tokenizer=new Tokenizer();
  private readonly registry=new CommandRegistry();
  constructor(private readonly session:Session){}
  execute(line:string):string {
    try {const tokens=this.tokenizer.parse(line);return tokens.length?this.session.run(this.registry.create(tokens)):'';}
    catch(error){return 'error: '+(error instanceof Error?error.message:String(error)).replace(/[\r\n]+/g,' ');}
  }
}
