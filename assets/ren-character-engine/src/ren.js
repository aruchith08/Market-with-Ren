/* Ren Character Engine 1.0.0 - original, dependency-free procedural SVG.
 * Every frame is a function of explicit options and time. No image assets,
 * network calls, canvas snapshots, Math.random(), or accumulated physics.
 * Browser: window.Ren. Node: const Ren = require('./src/ren.js').
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Ren = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '1.0.0', TAU = Math.PI * 2;
  const C = Object.freeze({
    hair:'#38271f', hairLight:'#624838', hairDark:'#211a17',
    red:'#a33827', redLight:'#c45339', redDark:'#65221c',
    suit:'#2e2b28', suitLight:'#4b443a', skin:'#eac79b',
    skinLight:'#f6ddba', skinDark:'#b98e60', gold:'#b78747',
    cream:'#f3e8d6', ink:'#2b211c', mouth:'#3b1e1c', tongue:'#b76b55'
  });
  const clamp = (v,a=0,b=1) => Math.max(a, Math.min(b,v));
  const mix = (a,b,t) => a+(b-a)*t;
  const smooth = t => { t=clamp(t); return t*t*(3-2*t); };
  const f = n => String(Math.round(n*1000)/1000);
  const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const pts = a => a.map(p=>p.map(f).join(',')).join(' ');
  function tint(hex, k) {
    const a=hex.slice(1).match(/../g).map(x=>parseInt(x,16));
    return '#'+a.map(x=>Math.round(k>0?mix(x,255,k):x*(1+k)).toString(16).padStart(2,'0')).join('');
  }
  function hash(s) { let h=2166136261; for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0)/4294967296; }
  function deepFreeze(v) { if(v&&typeof v==='object'){Object.values(v).forEach(deepFreeze);Object.freeze(v);}return v; }
  const EMOTIONS = deepFreeze({
    neutral:     {open:1.03,brow:.12,raise:0,pupil:1,smile:0,tilt:0,mouth:'rest'},
    serious:     {open:.76,brow:.26,raise:-3,pupil:1,smile:-.2,tilt:0,mouth:'rest'},
    focused:     {open:.61,brow:.40,raise:-4,pupil:.94,smile:0,tilt:-1,mouth:'rest'},
    determined:  {open:.80,brow:.62,raise:-4,pupil:.95,smile:-.15,tilt:1,mouth:'rest'},
    concerned:   {open:.92,brow:-.60,raise:2,pupil:.96,smile:-.70,tilt:-2,mouth:'rest'},
    sad:         {open:.62,brow:-.78,raise:2,pupil:1,smile:-.90,tilt:-3,mouth:'rest'},
    surprised:   {open:1.40,brow:0,raise:15,pupil:.78,smile:0,tilt:-1,mouth:'OH'},
    alert:       {open:1.18,brow:.32,raise:7,pupil:.85,smile:0,tilt:1,mouth:'small'},
    confident:   {open:.84,brow:.25,raise:2,pupil:1,smile:.65,tilt:-2,mouth:'rest'},
    smiling:     {open:.78,brow:-.13,raise:4,pupil:1,smile:.95,tilt:1,mouth:'rest'},
    happy:       {open:.14,brow:-.25,raise:6,pupil:1,smile:1,tilt:2,mouth:'smile',happy:1},
    explaining:  {open:.98,brow:.05,raise:4,pupil:1,smile:.22,tilt:-1,mouth:'small'},
    thinking:    {open:.73,brow:.05,raise:3,pupil:1,smile:-.12,tilt:4,mouth:'rest'},
    skeptical:   {open:.63,brow:.25,raise:1,pupil:1,smile:-.3,tilt:-3,mouth:'rest',asym:10},
    curious:     {open:1.13,brow:-.12,raise:9,pupil:.95,smile:.18,tilt:4,mouth:'small'},
    relieved:    {open:.40,brow:-.15,raise:3,pupil:1,smile:.65,tilt:2,mouth:'rest'},
    excited:     {open:1.24,brow:-.1,raise:10,pupil:1,smile:.8,tilt:-2,mouth:'smile'},
    disappointed:{open:.48,brow:-.45,raise:0,pupil:1,smile:-.65,tilt:2,mouth:'rest'},
    angry:       {open:.68,brow:.85,raise:-5,pupil:.84,smile:-.5,tilt:-1,mouth:'teeth'},
    confused:    {open:.96,brow:-.25,raise:4,pupil:.94,smile:-.5,tilt:5,mouth:'small',asym:9}
  });
  // Width, height, corner lift, top-teeth fraction, bottom-teeth, tongue.
  const MOUTHS = deepFreeze({
    rest:  {w:34,h:0,c:0,teeth:0,bottom:0,tongue:0},
    MBP:   {w:31,h:0,c:0,teeth:0,bottom:0,tongue:0},
    small: {w:27,h:13,c:0,teeth:0,bottom:0,tongue:.25},
    medium:{w:42,h:24,c:0,teeth:.10,bottom:0,tongue:.25},
    AA:    {w:51,h:43,c:0,teeth:.08,bottom:0,tongue:.33},
    EE:    {w:61,h:17,c:.10,teeth:.35,bottom:.12,tongue:0},
    OH:    {w:33,h:38,c:0,teeth:0,bottom:0,tongue:.20},
    OO:    {w:20,h:24,c:0,teeth:0,bottom:0,tongue:0},
    FV:    {w:42,h:12,c:0,teeth:.65,bottom:0,tongue:0},
    L:     {w:36,h:29,c:0,teeth:.17,bottom:0,tongue:.72},
    TH:    {w:43,h:19,c:0,teeth:.18,bottom:0,tongue:.85},
    CH:    {w:37,h:19,c:0,teeth:.40,bottom:.20,tongue:0},
    smile: {w:54,h:25,c:.25,teeth:.20,bottom:0,tongue:.20},
    teeth: {w:52,h:15,c:0,teeth:.48,bottom:.43,tongue:0}
  });
  // Arms use explicit shoulder/elbow/wrist points. Hand rotations are degrees.
  const POSES = deepFreeze({
    idle:  {L:[285,827,337,967,0,'relax'],R:[715,827,663,967,0,'relax']},
    present:{L:[268,802,150,704,-55,'palm'],R:[715,827,663,967,0,'relax']},
    explain:{L:[270,793,157,699,-30,'palm'],R:[730,793,843,699,30,'palm']},
    point: {L:[269,780,157,659,-70,'point'],R:[715,827,663,967,0,'relax']},
    'point-up':{L:[259,777,202,619,0,'point'],R:[715,827,663,967,0,'relax']},
    'hand-on-chest':{L:[295,831,449,735,23,'relax'],R:[715,827,663,967,0,'relax']},
    emphasis:{L:[264,790,213,689,-12,'fist'],R:[715,827,663,967,0,'relax']},
    wave:{L:[263,745,185,581,-6,'palm'],R:[715,827,663,967,0,'relax']}
  });
  const VIEWS = ['front','three-quarter','side','three-quarter-back','back'];
  const EYES = ['auto','open','half','closed','wide','narrow','happy','wink-left','wink-right'];
  const OPTION_KEYS = ['emotion','pose','mouth','eyes','gaze','view','facing','blink','motion','time','seed','width','height','background','id','detail','headTilt'];
  const DEFAULTS = deepFreeze({emotion:'neutral',pose:'idle',mouth:'auto',eyes:'auto',gaze:[0,0],view:'front',facing:'left',blink:true,motion:1,time:0,seed:7,width:1000,height:1050,background:'transparent',id:'ren',detail:'full',headTilt:0});
  const CATALOG = deepFreeze({emotions:Object.keys(EMOTIONS),mouths:Object.keys(MOUTHS),poses:Object.keys(POSES),views:VIEWS,eyes:EYES});
  const err = msg => { throw new Error('Ren: '+msg); };
  function checkEnum(v, a, name) { if(!a.includes(v)) err(name+' must be one of: '+a.join(', ')+'. Received '+JSON.stringify(v)); }
  function num(v,name,a,b) { if(typeof v!=='number'||!Number.isFinite(v)||v<a||v>b) err(name+' must be a finite number in ['+a+', '+b+'].'); }
  function normalize(options={}) {
    if(!options||typeof options!=='object'||Array.isArray(options)) err('options must be an object.');
    for(const k of Object.keys(options)) if(!OPTION_KEYS.includes(k)) err('Unknown option '+k+'. See docs/AGENT_QUICKSTART.md.');
    const o={...DEFAULTS,...options};
    checkEnum(o.emotion,CATALOG.emotions,'emotion');checkEnum(o.pose,CATALOG.poses,'pose');
    checkEnum(o.mouth,['auto',...CATALOG.mouths],'mouth');checkEnum(o.eyes,EYES,'eyes');
    checkEnum(o.view,VIEWS,'view');checkEnum(o.facing,['left','right'],'facing');checkEnum(o.detail,['full','draft'],'detail');
    num(o.time,'time',0,86400);num(o.seed,'seed',0,2147483647);num(o.width,'width',32,8192);num(o.height,'height',32,8192);
    num(o.motion,'motion',0,2);num(o.headTilt,'headTilt',-12,12);
    if(!Array.isArray(o.gaze)||o.gaze.length!==2) err('gaze must be [x, y].');
    o.gaze.forEach((n,i)=>num(n,'gaze['+i+']',-1,1));
    if(typeof o.blink!=='boolean') num(o.blink,'blink',0,1);
    if(typeof o.id!=='string'||! /^[A-Za-z][A-Za-z0-9_-]{0,48}$/.test(o.id)) err('id must be a short, safe SVG identifier.');
    if(o.background!=='transparent'&&!/^#[0-9a-fA-F]{6}$/.test(o.background)) err('background must be transparent or a six-digit hex color.');
    return o;
  }
  function mixRecord(a,b,t) {
    const z={}; for(const k of new Set([...Object.keys(a),...Object.keys(b)])) {
      if(typeof a[k]==='number'||typeof b[k]==='number') z[k]=mix(a[k]||0,b[k]||0,t);
      else z[k]=t<.5?a[k]:b[k];
    } return z;
  }
  function mixPose(a,b,t) {
    const z={};for(const side of ['L','R'])z[side]=a[side].map((v,i)=>i<5?mix(v,b[side][i],t):(t<.5?v:b[side][i]));return z;
  }
  function blinkAt(t, seed) {
    const p=3.65+hash(seed)*.7, phase=(t+hash('blink'+seed)*2.4)%p;
    // Hold closed for two frames at 30 fps; no random state between frames.
    const s=phase-2.7;
    if(s<0||s>.19)return 0;
    if(s<.065)return smooth(s/.065);
    if(s<.115)return 1;
    return 1-smooth((s-.115)/.075);
  }
  function context(o) {
    const id=o.id;let serial=0;
    function line(p,color=C.ink,w=1,opacity=1) {return `<polyline points="${pts(p)}" fill="none" stroke="${color}" stroke-width="${f(w)}" opacity="${f(opacity)}" stroke-linejoin="round" stroke-linecap="round"/>`;}
    function poly(p,color,opacity=1) {return `<polygon points="${pts(p)}" fill="${color}" opacity="${f(opacity)}"/>`;}
    function panel(p,color,opts={}) {
      const i=serial++, key=opts.key||i, center=opts.center||[p.reduce((s,v)=>s+v[0],0)/p.length,p.reduce((s,v)=>s+v[1],0)/p.length];
      let s='';
      if(opts.shadow!==false) s+=`<polygon points="${pts(p)}" transform="translate(2 4)" fill="${C.ink}" opacity=".22"/>`;
      s+=poly(p,color);
      const contrast=opts.contrast===undefined?.12:opts.contrast;
      p.forEach((a,j)=>{
        const b=p[(j+1)%p.length];
        const shade=(hash(key+'-'+j)-.5)*contrast*2+(j%3===0?.03:0);
        if(o.detail==='full') {
          const gid=id+'-plane-'+i+'-'+j;
          const base=tint(color,shade);
          s+=`<defs><linearGradient id="${gid}" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="${tint(base,.075)}"/><stop offset=".52" stop-color="${base}"/><stop offset="1" stop-color="${tint(base,-.10)}"/></linearGradient></defs>`;
          s+=poly([a,b,center],`url(#${gid})`);
        } else s+=poly([a,b,center],tint(color,shade));
        if(o.detail==='full')s+=line([a,center],tint(color,.48),.85,.30);
      });
      if(o.detail==='full')s+=`<polygon points="${pts(p)}" fill="url(#${id}-fibers)" opacity=".38"/>`;
      s+=`<polygon points="${pts(p)}" fill="none" stroke="${tint(color,-.38)}" stroke-width="1.1" stroke-linejoin="round"/>`;
      s+=line([p[0],p[1]],tint(color,.45),1.3,.65);
      return s;
    }
    function defs() {
      let fibers='';
      for(let i=0;i<110;i++){
        const x=hash(i+'x')*96,y=hash(i+'y')*96,l=1+hash(i+'l')*8;
        fibers+=`<path d="M${f(x)} ${f(y)}l${f(l)} ${f(l*.36)}" stroke="${i%2?'#fff4db':'#150b05'}" opacity="${i%2?'.21':'.12'}" stroke-width=".45"/>`;
      }
      return `<defs><filter id="${id}-paper" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="11" result="noise"/><feColorMatrix in="noise" type="saturate" values="0" result="gray"/><feComponentTransfer in="gray" result="grain"><feFuncR type="linear" slope=".24" intercept=".84"/><feFuncG type="linear" slope=".24" intercept=".84"/><feFuncB type="linear" slope=".24" intercept=".84"/></feComponentTransfer><feComposite in="grain" in2="SourceGraphic" operator="in" result="masked"/><feBlend in="SourceGraphic" in2="masked" mode="multiply"/></filter><pattern id="${id}-fibers" width="96" height="96" patternUnits="userSpaceOnUse">${fibers}</pattern><linearGradient id="${id}-mouth-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#231513"/><stop offset="1" stop-color="#824031"/></linearGradient></defs>`;
    }
    return {id,panel,poly,line,defs};
  }
  function segment(ctx,a,b,wa,wb,color) {
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    return ctx.panel([[a[0]+nx*wa/2,a[1]+ny*wa/2],[b[0]+nx*wb/2,b[1]+ny*wb/2],[b[0]-nx*wb/2,b[1]-ny*wb/2],[a[0]-nx*wa/2,a[1]-ny*wa/2]],color,{contrast:.16});
  }
  function hand(ctx,type) {
    const P=ctx.panel,L=ctx.line;let s='';
    if(type==='palm'){
      s+=P([[-25,4],[-39,-42],[-25,-82],[23,-85],[39,-42],[26,2]],C.skin,{center:[1,-35],contrast:.10});
      const fingers=[[-25,-66,-33,-130,16],[-7,-75,-8,-143,17],[12,-74,18,-135,16],[29,-65,40,-113,14]];
      fingers.forEach(([x,y,xx,yy,w])=>{s+=segment(ctx,[x,y],[xx,yy],w,w*.65,C.skinLight);s+=L([[xx-w*.25,yy+26],[xx+w*.27,yy+24]],C.skinDark,.9,.8);});
      s+=P([[-29,-31],[-63,-58],[-70,-83],[-59,-87],[-35,-61],[-13,-53]],C.skinLight,{contrast:.09});
      s+=L([[-19,-57],[6,-49],[23,-61]],C.skinDark,1.1,.55);
    }else if(type==='point'){
      s+=P([[-27,0],[-35,-50],[-15,-76],[22,-66],[34,-32],[24,2]],C.skin,{center:[0,-35]});
      s+=P([[-20,-54],[-20,-141],[-10,-155],[1,-144],[2,-56]],C.skinLight,{contrast:.08});
      for(let i=0;i<3;i++)s+=P([[-5+i*12,-65+i*4],[9+i*12,-65+i*4],[14+i*11,-38+i*4],[1+i*12,-32+i*4]],tint(C.skin,-i*.03),{shadow:false});
      s+=P([[-30,-33],[-37,-62],[-27,-71],[5,-48],[10,-32],[-9,-24]],C.skinLight,{contrast:.08});
    }else if(type==='fist'){
      s+=P([[-26,3],[-38,-47],[-28,-77],[19,-83],[39,-50],[29,0]],C.skin,{center:[0,-40]});
      for(let i=0;i<4;i++)s+=P([[-29+i*15,-63],[-25+i*15,-83],[i*15-11,-80],[i*15-13,-54]],C.skinLight,{shadow:false,contrast:.08});
      s+=P([[-32,-41],[-13,-55],[17,-30],[13,-13],[-2,-16]],C.skin,{contrast:.06});
    }else{
      s+=P([[-24,-2],[-27,27],[-9,65],[13,68],[30,47],[25,-3]],C.skin,{center:[1,27]});
      s+=P([[-23,8],[-39,34],[-33,48],[-17,34],[-7,12]],C.skinLight,{contrast:.05});
      for(let i=0;i<3;i++)s+=L([[-11+i*12,22],[-4+i*11,56]],C.skinDark,1.2,.65);
    }
    return s;
  }
  function arms(ctx,pose,fore=false,m=0,t=0) {
    let s='';for(const [side,sgn,sx] of [['L',-1,315],['R',1,685]]){
      const a=pose[side],drift=m*Math.sin(t*1.7+(side==='L'?0:1.2))*1.6;
      const e=[a[0],a[1]+drift],w=[a[2],a[3]+drift];
      if(!fore){s+=segment(ctx,[sx,639],e,119,91,C.suit);continue;}
      s+=`<g id="${ctx.id}-arm-${side}">`;
      s+=segment(ctx,e,w,100,68,C.suit);
      const dx=w[0]-e[0],dy=w[1]-e[1],l=Math.hypot(dx,dy)||1;
      s+=segment(ctx,[w[0]-dx/l*34,w[1]-dy/l*34],w,75,70,C.suitLight);
      s+=`<g transform="translate(${f(w[0])} ${f(w[1])}) rotate(${f(a[4])}) scale(${side==='R'?-1:1} 1)">${hand(ctx,a[5])}</g></g>`;
    }return s;
  }
  function cloakBack(ctx,o,back=false) {
    const P=ctx.panel;let s='';const flap=o.motion*2.8*Math.sin(o.time*1.25);
    s+=P([[302,565],[495,602],[697,562],[802,751],[861+flap,1002],[663,962],[512,1008],[314,970],[139-flap,1003],[204,777]],C.redDark,{center:[500,750],contrast:.19});
    s+=P([[302,565],[486,639],[334,971],[139-flap,1003],[211,792]],C.red,{center:[300,791],contrast:.13});
    s+=P([[697,562],[516,636],[661,963],[861+flap,1002],[788,782]],C.red,{center:[689,802],contrast:.19});
    if(back){
      s+=P([[317,575],[499,628],[688,572],[761,834],[663,995],[500,1009],[324,993],[238,840]],C.red,{center:[500,806],contrast:.17});
      s+=P([[317,575],[500,645],[688,572],[645,756],[501,842],[354,746]],C.redLight,{center:[501,690],contrast:.14});
      s+=ctx.line([[500,646],[500,1008]],C.cream,1.5,.35);
    }
    return s;
  }
  function torso(ctx,o) {
    const P=ctx.panel,L=ctx.line;let s='';
    s+=P([[370,567],[500,599],[630,565],[682,727],[650,1013],[350,1013],[320,724]],C.suit,{center:[493,782],contrast:.10});
    s+=P([[384,598],[500,644],[456,794],[365,918],[349,722]],C.suitLight,{center:[421,745],contrast:.13});
    s+=P([[501,644],[618,597],[652,777],[572,926],[457,795]],C.suit,{center:[558,758],contrast:.14});
    s+=P([[456,794],[574,926],[498,1013],[350,1013]],tint(C.suit,.03),{center:[450,925]});
    s+=P([[572,926],[650,777],[649,1013],[498,1013]],tint(C.suit,-.14),{contrast:.16});
    // Diagonal cloth binding. Kept under the sword and cape.
    s+=P([[385,659],[410,642],[629,1011],[594,1011]],'#493a2b',{contrast:.10});
    s+=P([[348,947],[651,942],[652,989],[349,994]],'#795431',{center:[502,967],contrast:.13});
    s+=P([[470,944],[530,942],[534,993],[470,994]],C.gold,{center:[500,970],contrast:.20});
    s+=L([[473,946],[529,990],[472,991],[529,945]],'#e0b26c',1.5,.65);
    return s;
  }
  function collar(ctx) {
    const P=ctx.panel;let s='';
    // Neck and tall shirt collar.
    s+=P([[443,502],[558,502],[560,590],[499,640],[442,588]],C.skinDark,{center:[499,555],contrast:.15});
    s+=P([[443,540],[493,561],[500,643],[439,600],[425,554]],C.suit,{center:[466,585]});
    s+=P([[508,558],[561,536],[575,556],[558,607],[500,644]],C.suitLight,{center:[538,588]});
    // Five independent folded layers per shoulder; no flat red sticker.
    s+=P([[275,523],[390,542],[500,646],[302,601]],C.redDark,{center:[340,568],contrast:.13});
    s+=P([[725,523],[612,542],[500,646],[698,601]],C.red,{center:[659,568],contrast:.14});
    s+=P([[275,523],[341,587],[500,646],[388,572]],C.redLight,{center:[372,581],contrast:.12});
    s+=P([[725,523],[656,588],[500,646],[615,572]],C.redLight,{center:[624,583],contrast:.10});
    s+=P([[307,588],[500,646],[236,700],[219,671]],C.red,{center:[337,646],contrast:.14});
    s+=P([[695,588],[500,646],[764,700],[782,671]],C.redDark,{center:[665,650],contrast:.14});
    s+=P([[236,671],[500,646],[367,737],[196,780]],C.redLight,{center:[329,685],contrast:.10});
    s+=P([[764,671],[500,646],[633,737],[805,780]],C.red,{center:[669,686],contrast:.12});
    s+=P([[500,646],[367,737],[248,803],[236,739]],C.redDark,{center:[367,713],contrast:.16});
    s+=P([[500,646],[633,737],[756,804],[765,739]],C.redLight,{center:[634,712],contrast:.14});
    s+=P([[500,646],[333,729],[196,780],[267,689]],C.red,{center:[324,708],contrast:.12});
    s+=P([[500,646],[668,730],[805,780],[734,689]],C.red,{center:[674,709],contrast:.15});
    s+=ctx.line([[275,523],[500,646],[725,523]],'#f4ad7d',1.6,.55);
    return s;
  }
  function sword(ctx) {
    const P=ctx.panel;let s='<g transform="translate(558 822) rotate(-34)">';
    s+=P([[-19,-52],[19,-52],[19,68],[-19,68]],'#705136',{center:[0,0],contrast:.17});
    for(let i=0;i<4;i++)s+=P([[-18,-45+i*25],[17,-26+i*25],[17,-10+i*25],[-18,-29+i*25]],'#8a6540',{shadow:false,contrast:.10});
    s+=P([[-22,-76],[0,-91],[23,-75],[18,-50],[-17,-50]],C.gold,{center:[0,-66],contrast:.19});
    s+=P([[-53,72],[-45,56],[-15,64],[18,62],[49,51],[54,69],[20,84],[-20,85]],C.gold,{center:[2,70],contrast:.16});
    s+=P([[-18,85],[18,84],[20,191],[-17,192]],'#382e25',{contrast:.13});
    return s+'</g>';
  }
  function faceShape(ctx,view) {
    const P=ctx.panel,poly=ctx.poly;let s='';
    // The separate profile geometry has a nose silhouette and one visible eye.
    if(view==='side'){
      s+=P([[395,271],[535,267],[589,323],[596,385],[613,423],[597,437],[597,466],[559,518],[492,547],[441,498],[405,394]],C.skin,{center:[518,409],contrast:.085});
      s+=poly([[590,388],[613,423],[578,431]],C.skinLight);
      s+=P([[431,401],[451,390],[469,414],[461,452],[442,461],[427,434]],C.skinDark,{center:[447,425],contrast:.09});
      s+=P([[438,412],[450,404],[459,419],[450,445],[442,443]],C.skin,{shadow:false});
      return s;
    }
    s+=P([[362,392],[342,397],[345,447],[372,469],[388,440]],C.skinDark,{center:[365,428],contrast:.10});
    s+=P([[638,392],[657,397],[655,447],[628,469],[612,440]],C.skinDark,{center:[637,428],contrast:.12});
    s+=P([[380,289],[500,257],[619,292],[635,381],[610,467],[564,512],[500,551],[438,514],[391,468],[365,385]],C.skin,{center:[500,419],contrast:.055});
    s+=poly([[381,321],[412,391],[395,464],[440,510],[500,550],[393,468],[365,384]],'#cfa77e',.75);
    s+=poly([[500,283],[587,312],[616,380],[601,468],[565,506],[500,550]],C.skinLight,.37);
    s+=poly([[499,421],[489,456],[507,459]],C.skinDark,.48);
    s+=poly([[499,421],[499,456],[507,459]],C.skinLight,.75);
    s+=ctx.line([[500,477],[500,542]],C.skinLight,.9,.4);
    return s;
  }
  function eyeOne(ctx,side,face,o,blink,cx,cy,scaleX=1) {
    const {poly,line}=ctx;let s='';const happy=face.happy||0;
    let op=face.open;
    if(o.eyes==='open')op=1;if(o.eyes==='half')op=.45;if(o.eyes==='closed')op=0;
    if(o.eyes==='wide')op=1.4;if(o.eyes==='narrow')op=.35;
    if(o.eyes==='happy')op=.03;
    if((o.eyes==='wink-left'&&side<0)||(o.eyes==='wink-right'&&side>0))op=0;
    op*=1-blink;
    const h=49*op,w=49;
    const angle=side*(face.brow*6); // inner corners lower for determined/angry.
    s+=`<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(scaleX)} 1)">`;
    if(op<.08){
      const yy=(happy>.3||o.eyes==='happy')?-8:8;
      s+=line([[-26,4],[0,yy],[26,4]],C.ink,3.2);
    }else{
      const eye=[[-w/2,-h*.50+angle],[w/2,-h*.50-angle],[w*.45,h*.39],[w*.19,h*.57],[-w*.22,h*.54],[-w*.46,h*.28]];
      s+=poly(eye,C.skinLight);
      // A dark paper cut-out pupil, deliberately not glossy photorealistic eyes.
      const px=o.gaze[0]*7.5,py=o.gaze[1]*5,pw=26*face.pupil,ph=h*.99;
      const clip=ctx.id+'-eye-'+side;
      s+=`<defs><clipPath id="${clip}"><polygon points="${pts(eye)}"/></clipPath></defs><g clip-path="url(#${clip})">`;
      s+=poly([[px-pw/2,py-ph*.58],[px+pw/2,py-ph*.58],[px+pw*.46,py+ph*.25],[px+pw*.20,py+ph*.49],[px-pw*.24,py+ph*.45],[px-pw*.46,py+ph*.23]],'#33261e');
      s+=poly([[px-pw*.46,py+ph*.02],[px-pw*.1,py+ph*.43],[px+pw*.22,py+ph*.46],[px+pw*.46,py+ph*.26],[px+pw*.48,py+ph*.07]],'#59412c',.55);
      s+=line([[px-pw*.22,py-ph*.40],[px-pw*.22,py-ph*.20]],'#e9c99d',1.4,.72);
      s+='</g>';
      s+=line([[-27,-h*.53+angle],[0,-h*.56],[27,-h*.53-angle]],C.ink,3.5);
      s+=line([[-20,h*.41],[0,h*.59],[18,h*.44]],C.skinDark,1,.55);
    }
    const by=-36-face.raise+(side<0?-(face.asym||0):(face.asym||0));
    const a=face.brow*15;
    s+=poly([[-29,by+side*a],[26,by-side*a], [24,by-side*a+5],[-26,by+side*a+3]],C.hairDark);
    return s+'</g>';
  }
  function mouthPart(ctx,m,smile=0) {
    const {line,poly}=ctx,w=m.w,h=m.h;let s='';
    if(h<1){
      s+=line([[-w/2,-smile*4],[0,smile*3.5],[w/2,-smile*4]],'#654735',1.8);
      return s;
    }
    const c=m.c*w;
    const p=[[-w*.5,-h*.19-c],[-w*.28,-h*.50],[w*.28,-h*.50],[w*.5,-h*.19-c],[w*.38,h*.32],[w*.13,h*.50],[-w*.18,h*.50],[-w*.4,h*.25]];
    const clip=ctx.id+'-mouth-clip';
    s+=`<defs><clipPath id="${clip}"><polygon points="${pts(p)}"/></clipPath></defs>`;
    s+=poly(p,`url(#${ctx.gradientId||ctx.id}-mouth-fill)`);
    s+=`<g clip-path="url(#${clip})">`;
    if(m.teeth>.02)s+=poly([[-w,-h*.6],[w,-h*.6],[w,-h*.5+h*m.teeth],[-w,-h*.5+h*m.teeth]],'#f1dfbe');
    if(m.bottom>.02)s+=poly([[-w,h*.5-h*m.bottom],[w,h*.5-h*m.bottom],[w,h],[-w,h]],'#e9d1ae');
    if(m.tongue>.02)s+=poly([[-w*.32,h*.5],[-w*.34,h*.5-h*m.tongue*.55],[-w*.05,h*.5-h*m.tongue],[w*.23,h*.5-h*m.tongue*.8],[w*.34,h*.5]],C.tongue);
    s+='</g>';
    s+=`<polygon points="${pts(p)}" fill="none" stroke="#634131" stroke-width="1.1"/>`;
    return s;
  }
  function hair(ctx,back=false,profile=false) {
    const P=ctx.panel;let s='';
    const shapes=[
      [[[367,264],[310,191],[415,211],[471,295]],'#2b211b'],
      [[[411,194],[358,83],[489,150],[530,239]],'#4a3427'],
      [[[498,160],[588,108],[574,236],[506,290]],'#3a2a21'],
      [[[554,216],[670,183],[631,279],[564,321]],'#4d3628'],
      [[[619,268],[728,322],[639,347],[579,307]],'#38281f'],
      [[[382,272],[278,330],[362,336],[428,309]],'#39281f'],
      [[[366,324],[298,405],[373,382],[420,319]],'#2a201a'],
      [[[621,320],[696,422],[627,394],[580,314]],'#2b211b'],
      [[[354,376],[337,480],[384,440],[398,350]],'#30221a'],
      [[[642,374],[663,480],[616,440],[602,350]],'#2b2019'],
      [[[366,430],[375,503],[405,467],[402,388]],'#241c17'],
      [[[634,430],[625,503],[595,467],[598,388]],'#251c17']
    ];
    shapes.forEach(([p,c],i)=>{s+=P(p,c,{contrast:.17,center:p[2],key:'hair-back'+i});});
    const front=[
      [[[353,250],[405,173],[500,154],[449,268]],'#533a2b'],
      [[[500,154],[586,189],[645,255],[551,281]],'#3d2b22'],
      [[[353,250],[449,268],[379,381],[326,418]],'#402c21'],
      [[[449,268],[405,173],[500,154],[503,309],[439,369]],'#443023'],
      [[[500,154],[551,281],[503,401],[466,309]],'#3b2a21'],
      [[[551,281],[586,189],[645,255],[625,385],[583,331]],'#493225'],
      [[[449,268],[439,369],[400,415],[406,320]],'#2f221b'],
      [[[551,281],[583,331],[607,433],[549,377]],'#32231c'],
      [[[353,250],[326,418],[374,364],[400,294]],'#36251c'],
      [[[645,255],[661,404],[625,385],[596,287]],'#39271e']
    ];
    if(back){
      s+=P([[353,250],[405,173],[500,154],[586,189],[645,255],[642,418],[598,499],[501,520],[400,493],[352,414]],C.hair,{center:[505,320],contrast:.16});
      const backLocks=[[[353,250],[468,299],[379,456]],[[468,299],[540,300],[503,493]],[[540,300],[645,255],[618,466]],[[379,456],[455,396],[420,523]],[[503,493],[554,408],[576,526]]];
      backLocks.forEach((p,i)=>s+=P(p,tint(C.hair,(i%3-1)*.08),{contrast:.15}));
    }else front.forEach(([p,c],i)=>{s+=P(p,c,{contrast:.16,key:'fringe'+i});});
    return s;
  }
  function hairBehind(ctx) {
    let s='';
    for(const [p,c] of [
      [[[359,269],[309,371],[349,458],[420,495],[438,280]],'#241c18'],
      [[[611,254],[680,356],[651,459],[588,501],[559,290]],'#241c18'],
      [[[402,177],[358,83],[489,150],[552,231]],'#39281e']
    ])s+=ctx.panel(p,c,{contrast:.14});
    return s;
  }
  function head(ctx,o,face,mouth) {
    const back=o.view==='back'||o.view==='three-quarter-back';
    const profile=o.view==='side';
    const quarter=o.view==='three-quarter'||o.view==='three-quarter-back';
    const dir=o.facing==='left'?-1:1;
    let b=typeof o.blink==='number'?o.blink:o.blink?blinkAt(o.time,o.seed):0;
    const tilt=face.tilt+o.headTilt+o.motion*.50*Math.sin(o.time*1.31);
    const nod=o.motion*1.6*Math.sin(o.time*1.67+.4);
    const sx=profile?.88:quarter?.94:1;
    const dx=(quarter?20:profile?20:0)*dir;
    let s=`<g id="${ctx.id}-head" transform="translate(${f(dx)} ${f(nod)}) rotate(${f(tilt)} 500 550)"><g transform="translate(500 0) scale(${f(sx)} 1) translate(-500 0)">`;
    if(profile&&dir<0)s+='<g transform="translate(1000 0) scale(-1 1)">';
    s+=hairBehind(ctx);
    if(!back){
      s+=faceShape(ctx,profile?'side':'front');
      if(profile){
        // Profile face features are drawn below, after the side hair plane.
      }else{
        // Perspective shifts only the facial planes, not a flat-image rotation.
        const sh=quarter?dir*25:0;
        s+=eyeOne(ctx,-1,face,o,b,443+sh,403,quarter?(dir>0?.91:.76):1);
        s+=eyeOne(ctx,1,face,o,b,557+sh,403,quarter?(dir>0?.76:.91):1);
        s+=`<g id="${ctx.id}-mouth" transform="translate(${500+sh} 493) scale(${quarter?.88:1} 1)">${mouthPart(ctx,mouth,face.smile)}</g>`;
      }
    }
    if(profile){
      // Profile-specific fringe leaves the nose, mouth and the near eye visible.
      s+=`<g transform="translate(65 0) scale(.88 1)">${hair(ctx,true,true)}</g>`;
      s+=ctx.panel([[471,247],[550,268],[563,351],[533,392],[520,305]],C.hair,{contrast:.12});
      // Restore the front cheek plane: the back hair is behind the ear/nose.
      s+=ctx.panel([[531,390],[552,367],[582,382],[590,407],[612,423],[593,439],[595,468],[558,516],[493,547],[510,490]],C.skin,{center:[557,452],contrast:.045});
      s+=eyeOne(ctx,1,face,o,b,559,403,.72);
      s+=`<g transform="translate(587 469) scale(.56 1)">${mouthPart({...ctx,id:ctx.id+'-profile',gradientId:ctx.id},mouth,face.smile)}</g>`;
      s+=ctx.panel([[454,325],[514,298],[526,373],[487,453],[473,402]],C.hair,{contrast:.13});
      s+=ctx.panel([[465,404],[481,395],[495,413],[485,452],[470,461],[459,434]],C.skinDark,{center:[478,424],contrast:.10});
    }else s+=hair(ctx,back);
    if(profile&&dir<0)s+='</g>';
    return s+'</g></g>';
  }
  function sideBody(ctx,o) {
    const P=ctx.panel;let s='<g';
    if(o.facing==='left')s+=' transform="translate(1000 0) scale(-1 1)"';
    s+='>';
    s+=P([[385,567],[514,579],[551,737],[609,1007],[305,1010],[327,805]],C.redDark,{center:[421,799],contrast:.16});
    s+=P([[420,563],[556,569],[614,732],[602,1012],[409,1012],[386,730]],C.suit,{center:[510,792],contrast:.12});
    s+=P([[479,500],[546,501],[556,598],[477,611]],C.suitLight,{center:[518,551],contrast:.10});
    s+=P([[408,947],[601,945],[603,990],[410,995]],'#795431',{contrast:.13});
    s+=P([[385,567],[444,621],[469,798],[526,1009],[305,1010],[328,808]],C.red,{center:[405,805],contrast:.12});
    s+=P([[381,534],[480,553],[583,620],[549,674],[421,633],[359,593]],C.red,{center:[458,598],contrast:.14});
    s+=P([[381,534],[480,553],[583,620],[444,601]],C.redLight,{center:[458,577],contrast:.10});
    s+=segment(ctx,[523,654],[529,822],106,83,C.suit);
    s+=segment(ctx,[529,822],[545,956],88,66,C.suit);
    s+=segment(ctx,[542,925],[545,956],73,69,C.suitLight);
    s+='<g transform="translate(545 956)">'+hand(ctx,'relax')+'</g>';
    s+=P([[421,633],[549,674],[501,719],[367,706]],C.red,{center:[454,675],contrast:.11});
    return s+'</g>';
  }
  function draw(o,face,pose,mouth) {
    const ctx=context(o);let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${f(o.width)}" height="${f(o.height)}" viewBox="0 0 1000 1050" role="img" aria-label="${esc('Ren: '+o.emotion+', '+o.pose+', '+o.view)}">`;
    s+=`<title>${esc('Ren / '+o.emotion+' / '+o.pose)}</title>`+ctx.defs();
    if(o.background!=='transparent')s+=`<rect width="1000" height="1050" fill="${o.background}"/>`;
    const breathing=o.motion*1.8*Math.sin(o.time*1.62);
    s+=`<g id="${o.id}-character" transform="translate(0 ${f(breathing)})" ${o.detail==='full'?`filter="url(#${o.id}-paper)"`:''}>`;
    const back=o.view==='back'||o.view==='three-quarter-back';
    let bodyScale=o.view.includes('three-quarter')?.90:1;
    s+=`<g id="${o.id}-body" transform="translate(500 0) scale(${f(bodyScale)} 1) translate(-500 0)">`;
    if(o.view==='side'){s+=sideBody(ctx,o);}else{
    s+=cloakBack(ctx,o,false);
    s+=arms(ctx,back?POSES.idle:pose,false,o.motion,o.time);
    s+=torso(ctx,o);
    if(back){
      s+=ctx.panel([[455,499],[544,499],[552,590],[449,590]],C.suit,{center:[500,543],contrast:.08});
      s+=arms(ctx,POSES.idle,true,o.motion,o.time);
      s+=cloakBack(ctx,o,true);
      s+=ctx.panel([[315,534],[501,575],[686,533],[648,614],[502,655],[354,612]],C.red,{center:[501,602],contrast:.14});
    }else{
      s+=collar(ctx);s+=sword(ctx);s+=arms(ctx,pose,true,o.motion,o.time);
    }
    }
    s+='</g>';
    s+=head(ctx,o,face,mouth);
    return s+'</g></svg>';
  }
  function render(options={}) {
    const o=normalize(options),face=EMOTIONS[o.emotion];
    const mouth=MOUTHS[o.mouth==='auto'?face.mouth:o.mouth];
    return draw(o,face,POSES[o.pose],mouth);
  }
  function validateScene(scene) {
    if(!scene||typeof scene!=='object'||Array.isArray(scene))err('scene must be an object.');
    const allowed=['version','fps','duration','character','acting','speech','transition','metadata'];
    Object.keys(scene).forEach(k=>{if(!allowed.includes(k))err('Unknown scene field '+k);});
    if(scene.version!==1)err('scene.version must be 1.');
    num(scene.fps,'fps',1,120);num(scene.duration,'duration',.04,3600);
    if(!Number.isInteger(scene.fps))err('fps must be an integer.');
    if(scene.transition!==undefined)num(scene.transition,'transition',0,1);
    normalize(scene.character||{});
    if(scene.acting!==undefined&&!Array.isArray(scene.acting))err('acting must be an array.');
    let prev=-1;
    for(const [i,c] of (scene.acting||[]).entries()){
      if(!c||typeof c!=='object'||Array.isArray(c))err('acting['+i+'] must be an object.');
      for(const k of Object.keys(c))if(!['at','emotion','pose','view','facing','gaze','eyes','headTilt'].includes(k))err('Unknown acting field '+k);
      num(c.at,'acting['+i+'].at',0,scene.duration);
      if(c.at<=prev)err('acting cue times must be strictly increasing.');prev=c.at;
      const {at,...options}=c;normalize({...scene.character,...options});
    }
    if(scene.speech!==undefined&&!Array.isArray(scene.speech))err('speech must be an array.');
    let end=0;
    for(const [i,c] of (scene.speech||[]).entries()){
      if(!c||typeof c!=='object'||Array.isArray(c))err('speech['+i+'] must be an object.');
      for(const k of Object.keys(c))if(!['start','end','mouth'].includes(k))err('Unknown speech field '+k);
      num(c.start,'speech start',0,scene.duration);num(c.end,'speech end',0,scene.duration);
      if(c.end<=c.start)err('Speech end must be after start.');if(c.start<end-1e-8)err('Speech cues overlap or are out of order.');end=c.end;
      checkEnum(c.mouth,CATALOG.mouths,'speech mouth');
    }
    return true;
  }
  function stateAt(scene,t) {
    validateScene(scene);num(t,'scene time',0,scene.duration);
    let old=normalize(scene.character||{}),next={...old},at=-10;
    for(const cue of scene.acting||[]){if(cue.at>t)break;old={...next};at=cue.at;const {at:_,...rest}=cue;next=normalize({...next,...rest});}
    const k=smooth((t-at)/(scene.transition===0?1e-9:(scene.transition||.28)));
    const face=mixRecord(EMOTIONS[old.emotion],EMOTIONS[next.emotion],k);
    const pose=mixPose(POSES[old.pose],POSES[next.pose],k);
    const o={...next,time:t,gaze:old.gaze.map((n,i)=>mix(n,next.gaze[i],k)),headTilt:mix(old.headTilt,next.headTilt,k)};
    let mouth=mixRecord(MOUTHS[old.mouth==='auto'?EMOTIONS[old.emotion].mouth:old.mouth],MOUTHS[next.mouth==='auto'?EMOTIONS[next.emotion].mouth:next.mouth],k);
    if(scene.speech!==undefined){
      mouth={...MOUTHS.rest};
      const cues=scene.speech;
      const index=cues.findIndex(c=>t>=c.start&&t<c.end);
      if(index>=0){
        const c=cues[index],pre=index>0&&Math.abs(cues[index-1].end-c.start)<.001?MOUTHS[cues[index-1].mouth]:MOUTHS.rest;
        const edge=Math.min(.045,(c.end-c.start)/3),v=smooth((t-c.start)/edge);
        mouth=mixRecord(pre,MOUTHS[c.mouth],v);
        const following=cues[index+1];
        if(!following||following.start>c.end+.001){const close=smooth((t-(c.end-edge))/edge);mouth=mixRecord(mouth,MOUTHS.rest,close);}
      }
    }
    return {options:o,face,pose,mouth};
  }
  function renderAt(scene,t) {const s=stateAt(scene,t);return draw(s.options,s.face,s.pose,s.mouth);}
  function frame(scene,n) {if(!Number.isInteger(n)||n<0)err('frame number must be a nonnegative integer.');validateScene(scene);if(n>=Math.ceil(scene.duration*scene.fps))err('frame is outside scene duration.');return renderAt(scene,n/scene.fps);}
  function mouthSVG(name,options={}) {
    checkEnum(name,CATALOG.mouths,'mouth');const o=normalize({...options,width:320,height:180,mouth:name}),ctx=context(o);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="-80 -45 160 90">${ctx.defs()}${mouthPart(ctx,MOUTHS[name],0)}</svg>`;
  }
  function eyesSVG(name,options={}) {
    checkEnum(name,EYES,'eyes');const o=normalize({...options,eyes:name,blink:false}),ctx=context(o),face=EMOTIONS[o.emotion];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="350 330 300 135">${ctx.defs()}${eyeOne(ctx,-1,face,o,0,443,403)}${eyeOne(ctx,1,face,o,0,557,403)}</svg>`;
  }
  return deepFreeze({VERSION,PALETTE:C,DEFAULTS,CATALOG,render,renderAt,frame,stateAt,validateScene,mouthSVG,eyesSVG});
});
