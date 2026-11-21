#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),Ren=require('../src/ren.js');
const out=path.join(__dirname,'../previews');fs.mkdirSync(out,{recursive:true});
function sheet(name,title,sub,entries,cols,faceOnly=false){
 const cw=300,ch=faceOnly?315:365,gap=16,margin=32,header=114,rows=Math.ceil(entries.length/cols),w=margin*2+cols*cw+(cols-1)*gap,h=header+rows*ch+(rows-1)*gap+margin;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#f3eadc"/><text x="32" y="44" fill="#30251e" font-family="sans-serif" font-size="28" font-weight="700">${title}</text><text x="32" y="76" fill="#76695d" font-family="sans-serif" font-size="15">${sub}</text>`;
 entries.forEach(([label,opts],i)=>{const x=margin+(i%cols)*(cw+gap),y=header+Math.floor(i/cols)*(ch+gap);s+=`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="5" fill="#e8dcc9" stroke="#d4c4ae"/>`;
 const vw=faceOnly?'250 55 500 550':'0 0 1000 1050';
 let svg=Ren.render({motion:0,blink:false,...opts,id:'sheet'+i,width:cw-16,height:ch-52});
 svg=svg.replace('viewBox="0 0 1000 1050"',`viewBox="${vw}"`).replace('<svg ','<svg x="'+(x+8)+'" y="'+(y+3)+'" ');
 s+=svg+`<text x="${x+16}" y="${y+ch-20}" font-family="sans-serif" font-size="16" font-weight="700" fill="#493328">${String(i+1).padStart(2,'0')} / ${label}</text>`;
 });s+='</svg>';fs.writeFileSync(path.join(out,name+'.svg'),s);
}
sheet('emotion-sheet','REN / 20 EMOTION PRESETS','Every face below was rendered by the same JavaScript geometry. No raster character images.',Ren.CATALOG.emotions.map(emotion=>[emotion,{emotion}]),5,true);
sheet('mouth-sheet','REN / 14 SPEECH SHAPES','Independent mouth controls. Presets alone are not automatic audio-to-phoneme alignment.',Ren.CATALOG.mouths.map(mouth=>[mouth,{mouth,emotion:'neutral'}]),7,true);
sheet('gesture-sheet','REN / 8 WAIST-UP GESTURES','Fixed shoulder and wrist pivots. The default presenting direction is screen-left.',Ren.CATALOG.poses.map(pose=>[pose,{pose,emotion:pose==='idle'?'neutral':'explaining'}]),4);
sheet('view-sheet','REN / DRAWN KEY VIEWS','Discrete stylized views, not a true 3D model or a continuous 360-degree turn.',Ren.CATALOG.views.map(view=>[view,{view}]),5);
sheet('eye-sheet','REN / EYES AND GAZE','Blink timing, gaze and emotion are independently controllable.',[
 ...Ren.CATALOG.eyes.filter(x=>x!=='auto').map(eyes=>[eyes,{eyes}]),
 ...Object.entries({left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}).map(([name,gaze])=>['look-'+name,{gaze}])
],4,true);
console.log('Five model sheets regenerated.');
