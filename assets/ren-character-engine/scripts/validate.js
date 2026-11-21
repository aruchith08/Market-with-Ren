#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),Ren=require('../src/ren.js');
try{if(!process.argv[2])throw Error('Usage: node scripts/validate.js examples/presentation.json');const s=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));Ren.validateScene(s);console.log('VALID: '+s.duration+' seconds, '+s.fps+' fps, '+Math.ceil(s.duration*s.fps)+' frames.');}catch(e){console.error(e.message);process.exitCode=1;}
