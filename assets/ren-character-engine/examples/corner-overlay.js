// Demonstrate lower-right placement; do not treat these insets as platform guarantees.
const fs=require('node:fs'),path=require('node:path'),Ren=require('../src/ren.js');
const W=1080,H=1920,anchorW=440,anchorH=462,right=120,bottom=240;
const character=Ren.render({id:'anchor',width:anchorW,height:anchorH,pose:'present',emotion:'explaining',background:'transparent',time:1.2});
const placed=character.replace('<svg ','<svg x="'+(W-right-anchorW)+'" y="'+(H-bottom-anchorH)+'" ');
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+placed+'</svg>';
const output=path.resolve(process.argv[2]||'out/corner-overlay.svg');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,svg);console.log(output);
