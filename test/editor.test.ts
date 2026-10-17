import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,readFileSync,rmSync,writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Session } from '../src/application/Session.ts';
import { Repl } from '../src/cli/Repl.ts';
import { MemoryStore } from './MemoryStore.ts';
import { SvgCodec } from '../src/infrastructure/SvgCodec.ts';
import { FileDocumentStore } from '../src/infrastructure/FileDocumentStore.ts';

const setup=()=>{const store=new MemoryStore(),session=new Session(store),repl=new Repl(session);const run=(line:string)=>repl.execute(line);run('init');return {store,session,run};};
const ok=(output:string)=>assert.ok(!output.startsWith('error:'),output);

test('no document guards and help remains accessible',()=>{
  const run=new Repl(new Session(new MemoryStore()));
  for(const cmd of ['tree','show a','create g a','delete a','move a 1 2','scale a 2','set a fill red','group g a','ungroup g','addto g a','front a','back a','save','canvas','undo','redo'])assert.match(run.execute(cmd),/^error: no document/);
  assert.match(run.execute('help'),/create ellipse/);
});
test('all six shapes, quotes, comments, omitted styles and case-sensitive ids',()=>{
  const {session,run}=setup();
  for(const cmd of ['# comment','create g G','create rect r 1 2 3 4 #fff in G','create circle c 10 20 3','create ellipse e 1 2 3 4','create line l 1 2 3 4','create text t 1 2 "hello world"','create g g'])ok(run(cmd));
  assert.equal(session.document.find('t').content,'hello world');assert.equal(session.document.find('l').get('stroke'),undefined);assert.equal(session.document.find('c').get('fill'),undefined);
  assert.equal(session.document.parentLabel(session.document.find('r')),'g#G');
});
test('container move and scale recurse through nested geometry',()=>{
  const {session,run}=setup();['create g a','create g b in a','create rect r 1 2 3 4 in b','create line l 1 2 3 4 in a','move a 10 20','scale a 2'].forEach(c=>ok(run(c)));
  assert.deepEqual(session.document.find('r').entries(),[['x','22'],['y','44'],['width','6'],['height','8']]);
  assert.equal(session.document.find('l').get('x2'),'26');
});
test('set style on group and text content on text; reject invalid attributes',()=>{
  const {session,run}=setup();ok(run('create g a'));ok(run('set a fill red'));ok(run('create text t 0 0 "" in a'));ok(run('set t text "中文 & <SVG>"'));
  assert.equal(session.document.find('t').content,'中文 & <SVG>');assert.equal(run('set a x 3'),'error: unknown attribute: x');assert.equal(run('set t font-size 20'),'error: unknown attribute: font-size');
});
test('group preserves document order rather than argument order, undo is atomic',()=>{
  const {session,run}=setup();['create g a','create g b','create g c'].forEach(c=>ok(run(c)));const before=run('tree');ok(run('group grouped c a'));
  assert.deepEqual(session.document.find('grouped').children.map(s=>s.id),['a','c']);ok(run('undo'));assert.equal(run('tree'),before);ok(run('redo'));assert.equal(session.document.find('grouped').children.length,2);
});
test('group from different parents uses root and preserves traversal order',()=>{
  const {session,run}=setup();['create g a','create g b','create circle c 0 0 1 in a','create circle d 0 0 1 in b','group both d c'].forEach(c=>ok(run(c)));
  assert.deepEqual(session.document.find('both').children.map(s=>s.id),['c','d']);assert.equal(session.document.parentLabel(session.document.find('both')),'svg');
});
test('ungroup nested group splices children at original position',()=>{
  const {session,run}=setup();['create g a','create g first in a','create g b in a','create g x in b','create g y in b','create g last in a','ungroup b'].forEach(c=>ok(run(c)));
  assert.deepEqual(session.document.find('a').children.map(s=>s.id),['first','x','y','last']);assert.equal(run('ungroup a'),'error: cannot ungroup top-level container: a');
});
test('addto and z-order only affect appropriate sibling list',()=>{
  const {session,run}=setup();['create g a','create g b','create g c','addto a b','addto a c','back c'].forEach(c=>ok(run(c)));
  assert.deepEqual(session.document.find('a').children.map(s=>s.id),['c','b']);ok(run('front c'));assert.deepEqual(session.document.find('a').children.map(s=>s.id),['b','c']);ok(run('undo'));assert.deepEqual(session.document.find('a').children.map(s=>s.id),['c','b']);
});
test('deleting a subtree restores same parent and sibling position on undo',()=>{
  const {run}=setup();['create g a','create g b in a','create circle c 1 2 3 in b','create g d in a'].forEach(c=>ok(run(c)));const before=run('tree');ok(run('delete b'));assert.equal(run('show c'),'error: no such shape: c');ok(run('undo'));assert.equal(run('tree'),before);
});
test('new edit after undo clears redo; displays do not enter history',()=>{
  const {run}=setup();ok(run('create g a'));ok(run('create g b'));ok(run('undo'));ok(run('tree'));ok(run('show a'));ok(run('help'));ok(run('redo'));ok(run('undo'));ok(run('create g c'));assert.equal(run('redo'),'error: nothing to redo');
});
for(const command of ['init','canvas 500 400','save a.svg','read a.svg'])test(command+' is a history barrier',()=>{
  const {store,run}=setup();store.files.set('a.svg','<svg width="10" height="10"/>');ok(run('create g g'));ok(run(command));assert.equal(run('undo'),'error: undo not allowed after io command');assert.equal(run('redo'),'error: undo not allowed after io command');ok(run('create g after'));ok(run('undo'));assert.equal(run('redo'),'redone: last edit reapplied');
});
test('canvas query preserves undo and redo',()=>{const {run}=setup();ok(run('create g g'));ok(run('canvas'));ok(run('undo'));ok(run('canvas'));ok(run('redo'));});
const invalid=[
 ['create rect r 0 0 1 1','id already exists: r'],
 ['move missing 1 2','no such shape: missing'],
 ['create circle c 1 2 3 in missing','no such container: missing'],
 ['create circle c 1 2 3 in r','not a container: r'],
 ['create box n 1 2 3 4 "hi"','unknown shape type: box (is the plugin loaded?)'],
 ['group bad r a','cannot group a container into its own descendant: a'],
 ['addto b a','cannot group a container into its own descendant: a'],
 ['scale a 0','scale factor must be positive'],
 ['scale a -1','scale factor must be positive'],
 ['set r width -2','width must be non-negative'],
 ['move r NaN 2','invalid number: NaN'],
 ['set r unknown 2','unknown attribute: unknown'],
 ['read missing.svg','cannot read file: missing.svg'],
 ['save denied.svg','cannot write file: denied.svg'],
 ['create text t 0 0 "bad','unterminated double quote'],
];
for(const [command,message] of invalid)test('atomic failure: '+command,()=>{
  const {run}=setup();['create g a','create g b in a','create rect r 0 0 1 1 in a','create g temp','undo'].forEach(c=>ok(run(c)));const before=run('tree');assert.equal(run(command),'error: '+message);assert.equal(run('tree'),before);ok(run('redo'));ok(run('show temp'));
});
test('overflow in later child of composite rolls back earlier changes',()=>{
  const {run}=setup();['create g a','create circle c 1 1 1 in a','create circle d 1e308 1 1 in a'].forEach(c=>ok(run(c)));const before=run('tree');assert.match(run('scale a 100'),/^error:/);assert.equal(run('tree'),before);
});
test('external missing IDs reserve all explicit IDs first',()=>{
  const {store,run,session}=setup();store.files.set('a.svg','<svg width="400" height="300"><rect/><rect id="rect1"/><g><circle/></g></svg>');const out=run('read a.svg');assert.match(out,/warning: assigned id rect2 to unnamed <rect>/);assert.match(out,/warning: assigned id g1/);assert.equal(session.document.all().length,4);
});
test('save/read round trip retains hierarchy, text, styles, geometry and order',()=>{
  const {run,store}=setup();['create g outer','set outer fill red','create text t 20 30 "中文 & <hello> \\"quoted\\"" in outer','create ellipse e 1.5 2 3 4 in outer','set e stroke-width 2','create line l 0 0 20 30 black','save "with space.svg"'].forEach(c=>ok(run(c)));const before=run('tree');assert.match(store.files.get('with space.svg')!,/&amp; &lt;hello&gt; &quot;quoted&quot;/);ok(run('init'));ok(run('read "with space.svg"'));assert.equal(run('tree'),before);ok(run('save'));
});
for(const xml of ['<svg><g id="a"/><rect id="a"/></svg>','<svg><g></svg>','<svg><path id="p"/></svg>','<!DOCTYPE svg><svg/>','<svg viewBox="10 10 20 20"/>','<svg><rect id="r" transform="rotate(30)"/></svg>'])test('invalid or unsupported SVG is transactional: '+xml,()=>{
  const {store,run}=setup();ok(run('create g original'));const before=run('tree');store.files.set('bad.svg',xml);assert.match(run('read bad.svg'),/^error:/);assert.equal(run('tree'),before);ok(run('undo'));
});
test('file adapter writes standard SVG, reads it back and handles missing files',()=>{
  const dir=mkdtempSync(join(process.cwd(),'.test-svg-editor-'));
  try {const {session,run}=setup();ok(run('create circle c 1 2 3'));const store=new FileDocumentStore(),file=join(dir,'demo.svg');store.write(file,session.document);assert.match(readFileSync(file,'utf8'),/<svg xmlns=/);assert.equal(store.read(file).document.find('c').get('r'),'3');assert.throws(()=>store.read(join(dir,'missing.svg')),/cannot read file/);writeFileSync(file,'old');store.write(file,session.document);assert.match(readFileSync(file,'utf8'),/<circle/);assert.throws(()=>store.write(join(dir,'missing','a.svg'),session.document),/cannot write file/);} finally{rmSync(dir,{recursive:true,force:true});}
});
test('codec rejects empty or non-SVG input',()=>{const c=new SvgCodec();for(const text of ['','<html/>','<svg xmlns="wrong"/>'])assert.throws(()=>c.decode(text));});
