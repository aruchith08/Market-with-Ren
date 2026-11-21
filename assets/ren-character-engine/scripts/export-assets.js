#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),Ren=require('../src/ren.js');
const out=path.resolve(process.argv[2]||path.join(__dirname,'../exports'));
const manifest={version:1,engine:Ren.VERSION,format:'procedural-svg',canonicalViewBox:[0,0,1000,1050],background:'transparent',notes:'All files are generated from src/ren.js. Not raster sprites. Do not edit exports; edit preset selections.',anchors:{headPivot:[500,550],mouth:[500,493],leftEye:[443,403],rightEye:[557,403],leftShoulder:[315,639],rightShoulder:[685,639]},groups:{}};
function save(group,name,svg,options){const folder=path.join(out,group);fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,name+'.svg'),svg);(manifest.groups[group]??=[]).push({name,file:group+'/'+name+'.svg',options});}
for(const emotion of Ren.CATALOG.emotions)save('emotions',emotion,Ren.render({emotion,blink:false,motion:0}),{emotion});
for(const pose of Ren.CATALOG.poses)save('poses',pose,Ren.render({pose,emotion:pose==='idle'?'neutral':'explaining',blink:false,motion:0}),{pose});
for(const view of Ren.CATALOG.views)for(const facing of (view==='front'||view==='back'?['left']:['left','right']))save('views',view+'-'+facing,Ren.render({view,facing,blink:false,motion:0}),{view,facing});
for(const mouth of Ren.CATALOG.mouths){save('mouths',mouth,Ren.mouthSVG(mouth),{mouth});save('speech-faces',mouth,Ren.render({mouth,blink:false,motion:0}),{mouth});}
for(const eyes of Ren.CATALOG.eyes){save('eyes',eyes,Ren.eyesSVG(eyes),{eyes});save('eye-faces',eyes,Ren.render({eyes,blink:false,motion:0}),{eyes});}
for(const [name,gaze] of Object.entries({left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}))save('gaze',name,Ren.render({gaze,blink:false,motion:0}),{gaze});
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(Object.values(manifest.groups).reduce((s,g)=>s+g.length,0)+' SVG assets regenerated in '+out);
