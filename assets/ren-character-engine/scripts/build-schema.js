#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),R=require('../src/ren.js');
const en=values=>({type:'string',enum:values}),nr=(a,b)=>({type:'number',minimum:a,maximum:b});
const properties={
 emotion:en(R.CATALOG.emotions),pose:en(R.CATALOG.poses),mouth:en(['auto',...R.CATALOG.mouths]),eyes:en(R.CATALOG.eyes),
 gaze:{type:'array',items:nr(-1,1),minItems:2,maxItems:2},view:en(R.CATALOG.views),facing:en(['left','right']),
 blink:{anyOf:[{type:'boolean'},nr(0,1)]},motion:nr(0,2),time:nr(0,86400),seed:nr(0,2147483647),width:nr(32,8192),height:nr(32,8192),
 background:{type:'string',pattern:'^(transparent|#[0-9a-fA-F]{6})$'},id:{type:'string',pattern:'^[A-Za-z][A-Za-z0-9_-]{0,48}$'},detail:en(['full','draft']),headTilt:nr(-12,12)
};
const acting={at:{type:'number',minimum:0}};for(const key of ['emotion','pose','view','facing','gaze','eyes','headTilt'])acting[key]=properties[key];
const schema={
 '$schema':'https://json-schema.org/draft/2020-12/schema',title:'Ren scene v1',type:'object',additionalProperties:false,required:['version','fps','duration'],
 description:'Use scripts/validate.js as the runtime authority; it additionally checks chronological cue order, overlaps and duration bounds.',
 properties:{version:{const:1},fps:{type:'integer',minimum:1,maximum:120},duration:nr(.04,3600),transition:nr(0,1),character:{type:'object',additionalProperties:false,properties},
 acting:{type:'array',items:{type:'object',additionalProperties:false,required:['at'],properties:acting}},
 speech:{type:'array',items:{type:'object',additionalProperties:false,required:['start','end','mouth'],properties:{start:{type:'number',minimum:0},end:{type:'number',minimum:0},mouth:en(R.CATALOG.mouths)}}},metadata:{type:'object'}}
};
fs.writeFileSync(path.join(__dirname,'../docs/scene.schema.json'),JSON.stringify(schema,null,2));console.log('Scene schema regenerated.');
