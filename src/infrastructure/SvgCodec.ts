import sax from 'sax';
import { Document } from '../domain/Document.ts';
import { Shape } from '../domain/Shape.ts';
import { Group } from '../domain/Group.ts';
import { ShapeFactory } from '../domain/ShapeFactory.ts';

export class SvgCodec {
  private escape(value:string):string {
    return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }
  encode(document:Document):string {
    const render=(shape:Shape,indent:string):string=>{
      const attrs=[['id',shape.id],...shape.entries()].map(([k,v])=>k+'="'+this.escape(v)+'"').join(' ');
      if(shape instanceof Group) return indent+'<g '+attrs+'>\n'+shape.children.map(c=>render(c,indent+'  ')).join('')+indent+'</g>\n';
      return indent+'<'+shape.tag+' '+attrs+'>'+this.escape(shape.content)+'</'+shape.tag+'>\n';
    };
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="'+document.width+'" height="'+document.height+'" viewBox="0 0 '+document.width+' '+document.height+'">\n'+document.children.map(s=>render(s,'  ')).join('')+'</svg>\n';
  }
  decode(xml:string):{document:Document;warnings:string[]} {
    type Element={tag:string;attributes:Record<string,string>;children:Element[];text:string};
    const parser=sax.parser(true,{trim:false,normalize:false});
    const stack:Element[]=[];let root:Element|undefined;
    parser.ondoctype=()=>{throw new Error('DOCTYPE is not supported');};
    parser.onopentag=node=>{
      const element:Element={tag:node.name,attributes:node.attributes as Record<string,string>,children:[],text:''};
      if(stack.length)stack.at(-1)!.children.push(element);
      else {if(root)throw new Error('multiple XML roots');root=element;}
      stack.push(element);
    };
    parser.ontext=text=>{if(stack.length)stack.at(-1)!.text+=text;else if(text.trim())throw new Error('text outside SVG root');};
    parser.oncdata=text=>{if(stack.length)stack.at(-1)!.text+=text;};
    parser.onclosetag=()=>{stack.pop();};
    parser.write(xml).close();
    if(!root || root.tag!=='svg')throw new Error('expected svg root');
    if(root.attributes.xmlns && root.attributes.xmlns!=='http://www.w3.org/2000/svg')throw new Error('invalid SVG namespace');
    const dimension=(value:string|undefined,defaultValue:number):number=>value===undefined?defaultValue:Number(value.replace(/px$/,''));
    const document=new Document(dimension(root.attributes.width,800),dimension(root.attributes.height,600));
    if(root.attributes.viewBox && root.attributes.viewBox.trim().split(/[\s,]+/).map(Number).join(' ')!==[0,0,document.width,document.height].join(' '))throw new Error('unsupported viewBox: expected 0 0 width height');
    for(const key of Object.keys(root.attributes))if(!['xmlns','width','height','viewBox','id'].includes(key))throw new Error('unsupported svg attribute: '+key);
    const ids=new Set<string>();
    const reserve=(element:Element):void=>{
      const id=element.attributes.id;if(id){if(ids.has(id))throw new Error('id already exists: '+id);ids.add(id);}
      element.children.forEach(reserve);
    };
    root.children.forEach(reserve);
    const warnings:string[]=[],factory=new ShapeFactory();
    const build=(element:Element):Shape=>{
      let id=element.attributes.id;
      if(!id){let n=1;while(ids.has(element.tag+n))n++;id=element.tag+n;ids.add(id);warnings.push('warning: assigned id '+id+' to unnamed <'+element.tag+'>');}
      const shape=factory.fromAttributes(element.tag,id,element.attributes,element.text);
      if(shape instanceof Group) {if(element.text.trim())throw new Error('unexpected text inside container');element.children.forEach(c=>shape.insert(build(c)));}
      else if(element.children.length)throw new Error('unsupported nested elements in '+shape.tag);
      return shape;
    };
    if(root.text.trim())throw new Error('unexpected text inside svg');
    root.children.forEach(e=>document.add(build(e)));
    return {document,warnings};
  }
}
