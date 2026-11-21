'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Ren=require('../src/ren.js');let n=0;
function test(name,fn){fn();n++;console.log('PASS '+name);}
function validSVG(svg){
 assert(svg.startsWith('<svg '));assert(svg.endsWith('</svg>'));assert(!/NaN|Infinity|undefined/.test(svg));
 assert(!/<image\b|data:image|<script\b|<foreignObject\b|https?:\/\/(?!www.w3.org)/.test(svg));
 const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate SVG id');
 const refs=[...svg.matchAll(/url\(#([^)]*)\)/g)].map(m=>m[1]);refs.forEach(x=>assert(ids.includes(x),'missing reference '+x));
}
test('browser UMD has no module or package dependency',()=>{const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/ren.js'),'utf8'),c);assert.equal(c.Ren.VERSION,Ren.VERSION);assert.equal(c.Ren.render({motion:0}),Ren.render({motion:0}));});
for(const emotion of Ren.CATALOG.emotions)test('emotion '+emotion,()=>validSVG(Ren.render({emotion,blink:false})));
for(const mouth of Ren.CATALOG.mouths)test('mouth '+mouth,()=>{validSVG(Ren.render({mouth}));validSVG(Ren.mouthSVG(mouth));});
for(const eyes of Ren.CATALOG.eyes)test('eyes '+eyes,()=>{validSVG(Ren.render({eyes}));validSVG(Ren.eyesSVG(eyes));});
for(const pose of Ren.CATALOG.poses)test('gesture '+pose,()=>validSVG(Ren.render({pose})));
for(const view of Ren.CATALOG.views)for(const facing of ['left','right'])test('view '+view+' / '+facing,()=>validSVG(Ren.render({view,facing})));
test('all 280 emotion-mouth combinations render',()=>{for(const emotion of Ren.CATALOG.emotions)for(const mouth of Ren.CATALOG.mouths)validSVG(Ren.render({emotion,mouth,detail:'draft'}));});
test('all 200 emotion-view-facing combinations render',()=>{for(const emotion of Ren.CATALOG.emotions)for(const view of Ren.CATALOG.views)for(const facing of ['left','right'])validSVG(Ren.render({emotion,view,facing,detail:'draft'}));});
test('same parameters return byte-identical SVG',()=>{const o={emotion:'concerned',mouth:'OO',pose:'present',time:2.3};assert.equal(Ren.render(o),Ren.render(o));});
test('frame order does not affect output',()=>{const s=JSON.parse(fs.readFileSync(path.join(__dirname,'../examples/presentation.json'),'utf8'));const a=Ren.frame(s,72);Ren.frame(s,222);Ren.frame(s,1);assert.equal(a,Ren.frame(s,72));});
test('static mode is genuinely static',()=>assert.equal(Ren.render({motion:0,blink:false,time:0}),Ren.render({motion:0,blink:false,time:99})));
test('changing mouth does not change rig or eyes',()=>{const a=Ren.render({mouth:'AA',motion:0,blink:false});const b=Ren.render({mouth:'OO',motion:0,blink:false});const before=x=>x.split('<g id="ren-mouth"')[0];assert.equal(before(a),before(b));});
test('source never loads images or consults wall clock',()=>{const code=fs.readFileSync(path.join(__dirname,'../src/ren.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');assert(!/Math\.random\(|Date\.now\(|fetch\(|new Image\(/.test(code));});
for(const x of [{emotion:'joyful'},{mouth:'UNKNOWN'},{pose:'run'},{time:-1},{time:NaN},{width:0},{blink:'yes'},{gaze:[2,0]},{gaze:[0]},{id:'bad"/><script>'},{background:'url(evil)'},{arbitrary:1}])test('reject bad options '+JSON.stringify(x),()=>assert.throws(()=>Ren.render(x),/Ren:/));
for(const file of fs.readdirSync(path.join(__dirname,'../examples')).filter(x=>x.endsWith('.json'))){test('example '+file,()=>{const s=JSON.parse(fs.readFileSync(path.join(__dirname,'../examples',file),'utf8'));assert(Ren.validateScene(s));validSVG(Ren.frame(s,0));validSVG(Ren.frame(s,Math.ceil(s.duration*s.fps)-1));assert.throws(()=>Ren.frame(s,Math.ceil(s.duration*s.fps)),/outside/);});}
const base={version:1,fps:30,duration:2,character:{},acting:[],speech:[]};
test('empty speech track stays closed',()=>{const s=Ren.stateAt({...base,character:{emotion:'surprised'}},1);assert.equal(s.mouth.h,0);});
test('speech gap closes mouth',()=>{const s={...base,speech:[{start:.2,end:.7,mouth:'AA'}]};assert(Ren.stateAt(s,.4).mouth.h>30);assert.equal(Ren.stateAt(s,.9).mouth.h,0);});
test('overlapping speech is rejected',()=>assert.throws(()=>Ren.validateScene({...base,speech:[{start:0,end:1,mouth:'AA'},{start:.5,end:1.5,mouth:'EE'}]}),/overlap/));
test('unknown cue fields are rejected',()=>assert.throws(()=>Ren.validateScene({...base,acting:[{at:0,feeling:'sad'}]}),/Unknown/));
test('unsorted acting is rejected',()=>assert.throws(()=>Ren.validateScene({...base,acting:[{at:1,emotion:'sad'},{at:.5,emotion:'neutral'}]}),/increasing/));
test('emotion transitions interpolate numeric state',()=>{const s={...base,acting:[{at:0,emotion:'neutral'},{at:1,emotion:'surprised'}]};const a=Ren.stateAt(s,1),b=Ren.stateAt(s,1.14),c=Ren.stateAt(s,1.28);assert(a.face.open<b.face.open&&b.face.open<c.face.open);});
test('mutating exported palette or catalogue cannot alter geometry',()=>assert.throws(()=>{Ren.PALETTE.red='pink';},TypeError));
console.log('\n'+n+' checks passed, including 480 combination renders.');
