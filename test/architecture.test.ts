import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync,readFileSync } from 'node:fs';
import { join } from 'node:path';
test('domain and application obey inward dependency rules; one class per file',()=>{
  const files=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);
  for(const file of files('src')) {
    const source=readFileSync(file,'utf8');
    const classes=[...source.matchAll(/export (?:abstract )?class (\w+)/g)];assert.ok(classes.length<=1,file);
    if(classes.length)assert.ok(file.endsWith(classes[0][1]+'.ts'),file);
    if(file.includes('domain'))assert.doesNotMatch(source,/from ['"].*(application|cli|infrastructure|node:)/,file);
    if(file.includes('application'))assert.doesNotMatch(source,/from ['"].*(cli|infrastructure|node:)/,file);
    assert.doesNotMatch(source,/switch\s*\(/,file);
  }
});
