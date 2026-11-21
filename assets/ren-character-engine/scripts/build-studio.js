#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
let html=fs.readFileSync(path.join(root,'templates/studio.html'),'utf8');
html=html.replace('/*__REN_ENGINE__*/',()=>fs.readFileSync(path.join(root,'src/ren.js'),'utf8'));
html=html.replace('/*__REN_EXAMPLE__*/',()=>fs.readFileSync(path.join(root,'examples/presentation.json'),'utf8').trim());
fs.writeFileSync(path.join(root,'studio.html'),html);
console.log('Built offline studio.html');
