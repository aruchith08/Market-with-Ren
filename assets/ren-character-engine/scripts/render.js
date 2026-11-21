#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),Ren=require('../src/ren.js');
function main(){
  const args=process.argv.slice(2),a={};
  for(let i=0;i<args.length;i++){
    if(!args[i].startsWith('--'))throw Error('Expected --option, got '+args[i]);
    const k=args[i].slice(2);if(!['scene','at','frame','out','emotion','pose','mouth','eyes','view','facing','background','detail','still','help'].includes(k))throw Error('Unknown flag --'+k);
    if(['still','help'].includes(k))a[k]=true;else {if(i+1>=args.length||args[i+1].startsWith('--'))throw Error('--'+k+' needs a value.');a[k]=args[++i];}
  }
  if(a.help){console.log('Render SVG with no dependencies.\nnode scripts/render.js --emotion concerned --mouth OO --pose present --still --out out/ren.svg\nnode scripts/render.js --scene examples/presentation.json --at 2.4 --out out/frame.svg\nnode scripts/render.js --scene examples/presentation.json --frame 72 --out out/frame.svg');return;}
  const opts={};for(const k of ['emotion','pose','mouth','eyes','view','facing','background','detail'])if(a[k]!==undefined)opts[k]=a[k];
  if(a.still)Object.assign(opts,{motion:0,blink:false});
  let svg;
  if(a.scene){const scene=JSON.parse(fs.readFileSync(a.scene,'utf8'));scene.character={...scene.character,...opts};svg=a.frame!==undefined?Ren.frame(scene,Number(a.frame)):Ren.renderAt(scene,Number(a.at||0));}
  else {if(a.frame!==undefined)throw Error('--frame requires --scene.');svg=Ren.render({...opts,time:Number(a.at||0)});}
  const out=path.resolve(a.out||'out/ren.svg');if(path.extname(out).toLowerCase()!=='.svg')throw Error('This command exports SVG. Use render_media.py for PNG or MP4.');
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,svg);console.log(out);
}
try{main();}catch(e){console.error(e.message);process.exitCode=1;}
