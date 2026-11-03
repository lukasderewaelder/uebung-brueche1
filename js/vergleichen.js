'use strict';
/* =====================================================================
   Aufgaben des Themas „Brüche vergleichen und ordnen“ (Kürzel W)
   W01 Nenner gleich        gleich große Stücke: mehr Stücke sind mehr
   W02 Zähler gleich        gleich viele Stücke, aber verschieden große: der größere Nenner macht den Bruch kleiner
   W03 Nenner oder Zähler?  erst erkennen, was gleich ist, dann vergleichen
   Gleicher Vertrag wie in tasks.js: gen, prompt, render, validate, solution (Tipps: js/tips.js); Antworten liegen im Entwurf (draft).
   Brüche stehen als a/b und c/d im Aufgabenobjekt (b und d sind die Nenner). Zahlenraum: Leicht Nenner bis 24, Knifflig bis 100.
   Bilder: Leicht sofort, Knifflig erst mit dem zweiten Tipp. Streifen immer gleich lang, gefärbt ab links; unechte Brüche am Zahlenstrahl.
   Eine Runde (5 Aufgaben) hat einen Plan der Aufgabenarten (round.cmp, CMP_PLAN); ohne Plan (Probeaufgabe) gilt die einfachste Art.
   Fehlercodes: gleichNenner, gleichZahl, gleichAbstand, gleich, gleichwertig, beide, nurZaehler, nurNenner, sign (cmpDiagnose in math.js),
   dazu paint (falsche Zahl gefärbter Teile), same (falsch erkannt, was gleich ist), judge und reason (Behauptung).
   ===================================================================== */
const CMP_NAMES=['Lena','Ben','Mia','Tom','Ida','Paul','Nora','Jan'];
const cmpAvoid=(a,b,c,d)=>[redKey(a,b),redKey(c,d)];
const cmpDelta=(a,b,c,d)=>Math.abs(a/b-c/d);
const cmpSwap=(R,a,b,c,d)=>R.chance(0.5)?[a,b,c,d]:[c,d,a,b];
const cmpTxt=(a,b,c,d,s)=>ft(a,b)+' '+s+' '+ft(c,d);

/* ---------- Zahlenpaare ---------- */
/* gleicher Nenner, verschiedene Zähler (etwa jedes achte Paar in Leicht, jedes vierte in Knifflig unecht: mindestens ein Zähler größer als der Nenner) */
function cmpNenner(R,level){
  const pool=level===1?[3,4,5,6,7,8,9,10,11,12,12,15,16,20,24]:[10,12,15,16,18,20,24,25,30,36,40,50,60,75,80,100];
  for(let i=0;i<300;i++){
    const d=R.pick(pool),imp=R.chance(level===1?0.12:0.25),hi=imp?2*d-1:d-1,gap=imp?Math.max(1,Math.ceil(0.15*d)):1;
    const a=R.int(1,hi),c=R.int(1,hi);
    if(Math.abs(a-c)<gap||(imp&&Math.max(a,c)<=d))continue;
    return cmpSwap(R,a,d,c,d);
  }
  return [3,8,5,8];
}
/* gleicher Zähler, verschiedene Nenner. o.stamm: Zähler 1 (Stammbrüche); o.max: größter Nenner (für Bilder zum Färben) */
function cmpZaehler(R,level,o){
  o=o||{};
  const all=level===1?[2,3,4,5,6,7,8,9,10,12,15,16,20,24]:[5,6,7,8,9,10,12,15,16,20,24,25,30,40,50,60,75,100];
  const pool=o.max?all.filter(x=>x<=o.max):all,gap=level===1?0.03:0.002;
  for(let i=0;i<400;i++){
    const b=R.pick(pool),d=R.pick(pool);
    if(b===d)continue;
    const lo=Math.min(b,d),imp=!o.stamm&&!o.noImp&&R.chance(level===1?0.12:0.25);
    let n;
    if(o.stamm)n=1;
    else if(imp)n=R.int(lo+1,2*lo-1);
    else{if(lo<3)continue;n=R.int(2,Math.min(level===1?4:9,lo-1));}
    if(cmpDelta(n,b,n,d)<gap+(imp?0.15:0))continue;
    return cmpSwap(R,n,b,n,d);
  }
  return o.stamm?[1,5,1,8]:[3,5,3,8];
}
/* weder Nenner noch Zähler gleich, nicht gleich groß */
function cmpKeins(R,level){
  const pool=level===1?[3,4,5,6,7,8,9,10,12,15,16,20,24]:[8,9,10,12,15,16,20,24,25,30,40,50,60,75,100];
  for(let i=0;i<400;i++){
    const b=R.pick(pool),d=R.pick(pool);
    if(b===d)continue;
    const a=R.int(1,b-1),c=R.int(1,d-1);
    if(a===c||cmpDelta(a,b,c,d)<(level===1?0.05:0.01))continue;
    return [a,b,c,d];
  }
  return [3,8,2,5];
}
/* beide Brüche echt, es fehlen k Stücke zum Ganzen (Leicht 1–2, Knifflig 1–3).
   mode 'gleich': bei beiden fehlen gleich viele · 'verschieden': verschieden viele · 'konflikt': verschieden viele, und die Faustregel „weniger fehlt = größer“ liegt falsch */
function cmpFehlt(R,level,mode){
  const pool=level===1?[3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,20,24]:[5,6,7,8,9,10,11,12,13,15,16,17,18,20,24,25,30,40,50,60,75,100],kmax=level===1?2:3;
  for(let i=0;i<800;i++){
    const b=R.pick(pool),d=R.pick(pool);
    if(b===d)continue;
    const k1=R.int(1,kmax),k2=mode==='gleich'?k1:R.int(1,kmax);
    if(b<=k1||d<=k2||(mode!=='gleich'&&k1===k2))continue;
    const a=b-k1,c=d-k2;
    if(compareFrac(a,b,c,d)===0||(mode==='konflikt'&&!fehltConflict(a,b,c,d)))continue;
    return cmpSwap(R,a,b,c,d);
  }
  return mode==='gleich'?[3,4,5,6]:mode==='konflikt'?[7,9,3,4]:[2,3,7,10];
}

/* ---------- Rundenplan ---------- */
/* Aufgabenarten je Runde und Niveau (Reihenfolge wird gemischt; eine Behauptung nie als Erste). Funktion = Plan mit Zufall. */
const CMP_PLAN={
  W01:{1:['sign','sign','sign','paint','sign'],2:['sign','sign','claim','sign','sign']},
  W02:{1:['stamm','stamm','sign','claim','paint'],2:['stamm','sign','sign','claim','sign']},
  W03:{1:(R)=>['nenner','zaehler','nenner','zaehler',R.pick(['nenner','zaehler'])],2:(R)=>['nenner','zaehler','keins',R.pick(['nenner','zaehler']),R.pick(['nenner','zaehler'])]},
  W04:{1:['check','rest','rest','claim','check'],2:['check','conflict','rest','claim','conflict']}
};
/* alle Aufgabenarten einer Station (für den Layout-Test, layoutKinds) */
const cmpKindsOf=(id,lvl)=>{const src=CMP_PLAN[id][lvl];return Array.from(new Set(typeof src==='function'?src(RNG):src));};
function cmpCtx(id){
  return (round,level)=>{
    if(!Array.isArray(round.cmp)||round.cmp.length!==TASKS[id].size){
      const src=CMP_PLAN[id][level];let p;
      for(let i=0;i<20;i++){p=RNG.shuffle(typeof src==='function'?src(RNG):src);if(p[0]!=='claim'&&p[0]!=='conflict')break;}
      round.cmp=p;
    }
    return {kind:round.cmp[Math.min(round.results.length,round.cmp.length-1)]};
  };
}

/* ---------- Rückmeldungen ---------- */
const CMP_MSG={
  gleichNenner:'Gleicher Nenner heißt nur: Die Stücke sind gleich groß. Die Zahl der Stücke ist verschieden.',
  gleichZahl:'Gleicher Zähler heißt nur: gleich viele Stücke. Die Stücke sind aber verschieden groß.',
  gleichAbstand:'Es fehlt zwar gleich viel, aber die fehlenden Stücke sind verschieden groß.',
  gleich:'Die beiden Brüche sind nicht gleich groß. Schau noch einmal genau hin.',
  gleichwertig:'Die beiden Brüche sind gleich groß. Sie sind nur verschieden eingeteilt.',
  beide:'Zähler und Nenner einzeln zu vergleichen reicht nicht. Denke an die Zahl und die Größe der Stücke.',
  nurZaehler:'Du hast nur den Zähler beachtet. Der Nenner sagt, wie groß die Stücke sind.',
  nurNenner:'Ein größerer Nenner macht kleinere Stücke. Der Bruch wird dadurch nicht größer.',
  sign:'Das Zeichen passt noch nicht. Vergleiche noch einmal, welcher Bruch größer ist.'
};
/* Zeichen prüfen: kid ist die Wahl in draft[key]; over überschreibt Meldungen einzelner Fehlercodes */
function cmpSignCheck(t,d,key,okText,over){
  const kid=d[key];
  if(!kid)return invalid('Wähle ein Zeichen: kleiner, gleich oder größer.');
  const code=cmpDiagnose(t.a,t.b,t.c,t.d,kid);
  if(!code)return right(okText);
  return wrong(code,(over&&over[code])||CMP_MSG[code],{[key+kid]:false});
}
/* Zwei Streifen färben: null, wenn die Zahl gefärbter Teile stimmt */
function cmpPaintCheck(t,d){
  const n0=cmpPainted(d,'p',0),n1=cmpPainted(d,'p',1),m={};
  if(!n0&&!n1)return invalid('Färbe zuerst beide Streifen.');
  if(n0!==t.a)m.p0=false;
  if(n1!==t.c)m.p1=false;
  if(!Object.keys(m).length)return null;
  const txt=[];
  if(m.p0)txt.push(`Der obere Streifen braucht ${t.a} gefärbte ${t.a===1?'Teil':'Teile'} von ${t.b}.`);
  if(m.p1)txt.push(`Der untere Streifen braucht ${t.c} gefärbte ${t.c===1?'Teil':'Teile'} von ${t.d}.`);
  return wrong('paint',txt.join(' ')+' Färbe von links.',m);
}
const cmpSigned=(t)=>cmpSignOf(compareFrac(t.a,t.b,t.c,t.d));
const cmpSolEq=(t)=>eq(frac(t.a,t.b),cmpSigned(t),frac(t.c,t.d));

/* ---------- Behauptungen („Stimmt das?“) ---------- */
const CMP_WHY={
  W01:{ok:'Beide haben gleich große Stücke. Mehr Stücke sind mehr.',
    bad:['Gleicher Nenner heißt: Beide Brüche sind gleich groß.','Der Bruch mit dem kleineren Zähler ist größer.','Ein größerer Zähler macht die Stücke kleiner.']},
  W02:{ok:'Beide haben gleich viele Stücke. Ein größerer Nenner macht kleinere Stücke.',
    bad:['Der größere Nenner macht den Bruch größer.','Gleicher Zähler heißt: Beide Brüche sind gleich groß.','Der Nenner zählt nicht. Nur der Zähler entscheidet.']},
  /* W04: gleich viele Stücke fehlen · konflikt: verschieden viele fehlen (die Regel „weniger fehlt = größer“ trägt dann nicht) */
  W04:{ok:'Das kleinere fehlende Stück gehört zum größeren Bruch.',
    bad:['Fehlen gleich viele Stücke, sind beide Brüche gleich groß.','Das kleinere fehlende Stück gehört zum kleineren Bruch.','Das Ganze ist verschieden eingeteilt, also kann man nicht vergleichen.']},
  W04konflikt:{ok:'Es fehlen verschieden viele Stücke. Zählen allein reicht nicht.',
    bad:['Wo mehr Stücke fehlen, ist der Bruch kleiner. Das gilt immer.','Es fehlt bei beiden etwas, darum sind beide gleich groß.','Der Bruch mit dem kleineren Nenner ist immer kleiner.']}
};
/* Name, gezeigtes Zeichen (richtig oder falsch), Begründungen */
function cmpClaimData(R,f,why){
  const real=cmpSignOf(compareFrac(f[0],f[1],f[2],f[3])),truth=R.chance(0.5);
  const shown=truth?real:R.pick(['<','=','>'].filter(s=>s!==real));
  return Object.assign({who:R.pick(CMP_NAMES),shown,truth},cmpReasons(R,why.ok,why.bad));
}
function cmpClaimPrompt(t,h){
  h.append(el('p',{class:'q'},t.who+' sagt:'),el('div',{class:'wrongclaim'},eq(frac(t.a,t.b),t.shown,frac(t.c,t.d))));
  if(t.lead)h.append(el('p',{class:'q sm'},t.lead+'.'));
}
const cmpClaimSolution=(t)=>[line(strong(t.truth?'Das stimmt. ':'Das stimmt nicht. '),t.opts.find(o=>o.id===t.answerR).txt),cmpSolEq(t)];

/* Bild zu zwei Brüchen: Leicht sofort, Knifflig und unechte Brüche erst mit dem zweiten Tipp */
function cmpPicBox(view,host,f,always,o){
  const box=el('div');host.append(box);
  const draw=()=>{
    const on=always||(view.st&&view.st.hint>=2);
    box.replaceChildren(...(on?[cmpPairPic(f,o)]:[]));
    view.changed();
  };
  const prev=view.onHint;
  view.onHint=()=>{if(prev)prev();draw();};
  draw();
}
/* Bild und darunter die Zeichen */
function cmpPicSign(view,host,f,always,o){
  cmpPicBox(view,host,f,always,o);
  cmpSign(view,host,'sign',f);
}

/* ---------- W01 Nenner gleich ---------- */
TASKS.W01={area:'Vergleichen',name:'Nenner gleich',desc:'Gleich große Stücke: Welcher Bruch ist größer?',notes:['M11'],size:5,
  ctx:cmpCtx('W01'),layoutKinds:(lvl)=>cmpKindsOf('W01',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'sign';
    let f;
    if(kind==='paint'){const d=R.int(4,10);let a,c;do{a=R.int(1,d-1);c=R.int(1,d-1);}while(a===c);f=[a,d,c,d];}
    else f=cmpNenner(R,level);
    const t={type:'W01',level,kind,a:f[0],b:f[1],c:f[2],d:f[3],avoid:cmpAvoid(...f)};
    if(kind==='claim')Object.assign(t,cmpClaimData(R,f,CMP_WHY.W01));
    return t;
  },
  prompt(t,h){
    if(t.kind==='claim')cmpClaimPrompt(t,h);
    else h.append(el('p',{class:'q'},t.kind==='paint'?'Färbe beide Brüche in die Streifen. Welches Zeichen passt?':'Beide Brüche haben denselben Nenner. Welches Zeichen passt?'));
  },
  render(view,host){
    const t=view.task,f=[t.a,t.b,t.c,t.d];
    if(t.kind==='claim'){cmpClaim(view,host);return;}
    if(t.kind==='paint'){
      cmpPaint(view,host,'p',[{d:t.b,label:frac(t.a,t.b)},{d:t.d,label:frac(t.c,t.d)}]);
      cmpSign(view,host,'sign',f);
      return;
    }
    cmpPicSign(view,host,f,t.level===1&&t.a<=t.b&&t.c<=t.d);
  },
  validate(t,d){
    if(t.kind==='claim')return cmpClaimCheck(t,d,'Beide Brüche haben denselben Nenner. Prüfe, was das für die Stücke heißt.');
    const big=Math.max(t.a,t.c),small=Math.min(t.a,t.c);
    const ok=`Richtig! Die Stücke sind gleich groß. ${big} Stücke sind mehr als ${small} Stücke.`;
    if(t.kind==='paint'){
      if(!d.sign&&!cmpPainted(d,'p',0)&&!cmpPainted(d,'p',1))return invalid('Färbe zuerst beide Streifen.');
      if(!d.sign)return invalid('Wähle auch ein Zeichen.');
      const pc=cmpPaintCheck(t,d);if(pc)return pc;
    }
    return cmpSignCheck(t,d,'sign',ok,{sign:'Beide Brüche haben gleich große Stücke. Wer mehr Stücke hat, ist größer.'});
  },
  solution(t){
    if(t.kind==='claim')return cmpClaimSolution(t);
    return [line(`Beide Brüche haben den Nenner ${t.b}. Die Stücke sind gleich groß.`),line(`${Math.max(t.a,t.c)} Stücke sind mehr als ${Math.min(t.a,t.c)} Stücke.`),cmpPairPic([t.a,t.b,t.c,t.d]),cmpSolEq(t)];
  }
};

/* ---------- W02 Zähler gleich ---------- */
TASKS.W02={area:'Vergleichen',name:'Zähler gleich',desc:'Gleich viele Stücke, aber verschieden große: Welcher Bruch ist größer?',notes:['M11'],size:5,
  ctx:cmpCtx('W02'),layoutKinds:(lvl)=>cmpKindsOf('W02',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'stamm';
    let f;
    if(kind==='stamm')f=cmpZaehler(R,level,{stamm:true});
    else if(kind==='paint')f=cmpZaehler(R,1,{max:12,noImp:true});
    else f=cmpZaehler(R,level);
    const t={type:'W02',level,kind,a:f[0],b:f[1],c:f[2],d:f[3],avoid:cmpAvoid(...f)};
    if(kind==='claim')Object.assign(t,cmpClaimData(R,f,CMP_WHY.W02));
    return t;
  },
  prompt(t,h){
    if(t.kind==='claim')cmpClaimPrompt(t,h);
    else h.append(el('p',{class:'q'},t.kind==='paint'?'Färbe beide Brüche in die Streifen. Welches Zeichen passt?':t.kind==='stamm'?'Von beiden ist je ein Stück gefärbt. Welches Zeichen passt?':'Beide Brüche haben denselben Zähler. Welches Zeichen passt?'));
  },
  render(view,host){
    const t=view.task,f=[t.a,t.b,t.c,t.d];
    if(t.kind==='claim'){cmpClaim(view,host);return;}
    if(t.kind==='paint'){
      cmpPaint(view,host,'p',[{d:t.b,label:frac(t.a,t.b)},{d:t.d,label:frac(t.c,t.d)}]);
      cmpSign(view,host,'sign',f);
      return;
    }
    cmpPicSign(view,host,f,t.level===1&&t.a<=t.b&&t.c<=t.d);
  },
  validate(t,d){
    if(t.kind==='claim')return cmpClaimCheck(t,d,'Beide Brüche haben denselben Zähler. Prüfe, wie groß die Stücke sind.');
    const mx=Math.max(t.b,t.d);
    const ok=`Richtig! Beide haben ${t.a} ${t.a===1?'Stück':'Stücke'}. Die Stücke mit dem Nenner ${mx} sind kleiner.`;
    if(t.kind==='paint'){
      if(!d.sign&&!cmpPainted(d,'p',0)&&!cmpPainted(d,'p',1))return invalid('Färbe zuerst beide Streifen.');
      if(!d.sign)return invalid('Wähle auch ein Zeichen.');
      const pc=cmpPaintCheck(t,d);if(pc)return pc;
    }
    return cmpSignCheck(t,d,'sign',ok,{sign:'Beide haben gleich viele Stücke. Der Bruch mit den kleineren Stücken ist kleiner.',nurNenner:'Ein größerer Nenner macht kleinere Stücke. Gleich viele kleine Stücke sind weniger.'});
  },
  solution(t){
    if(t.kind==='claim')return cmpClaimSolution(t);
    const mn=Math.min(t.b,t.d);
    return [line(`Beide Brüche haben ${t.a} ${t.a===1?'Stück':'Stücke'}. Die Stücke sind verschieden groß.`),line(`Mit dem Nenner ${mn} sind die Stücke größer. Dieser Bruch ist größer.`),cmpPairPic([t.a,t.b,t.c,t.d]),cmpSolEq(t)];
  }
};

/* ---------- W03 Nenner oder Zähler? ---------- */
const CMP_SAME={nenner:'der Nenner',zaehler:'der Zähler',keins:'keins von beiden'};
TASKS.W03={area:'Vergleichen',name:'Nenner oder Zähler?',desc:'Erst erkennen, was gleich ist. Dann vergleichen.',notes:['M11'],size:5,
  ctx:cmpCtx('W03'),layoutKinds:(lvl)=>cmpKindsOf('W03',lvl),
  gen(level,R,ctx){
    const same=(ctx&&ctx.kind)||R.pick(['nenner','zaehler']);
    const f=same==='nenner'?cmpNenner(R,level):same==='zaehler'?cmpZaehler(R,level):cmpKeins(R,level);
    return {type:'W03',level,kind:'which',same,a:f[0],b:f[1],c:f[2],d:f[3],avoid:cmpAvoid(...f)};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Du vergleichst diese zwei Brüche:'),eq(frac(t.a,t.b),'und',frac(t.c,t.d)));},
  render(view,host){
    const t=view.task,d=view.draft,f=[t.a,t.b,t.c,t.d];
    const opts=[{v:'nenner',label:'Der Nenner'},{v:'zaehler',label:'Der Zähler'}].concat(t.level===2?[{v:'keins',label:'Keins von beiden'}]:[]);
    const stg=twoStage(view,host,{isDone:()=>!!d.same,summary:()=>'1. Gleich: '+(CMP_SAME[d.same]||'')});
    stg.box1.append(el('p',null,strong('1. Was ist bei beiden Brüchen gleich?')));
    const fill2=()=>{
      stg.box2.replaceChildren();
      if(d.same==='keins')stg.box2.append(el('p',null,'Hier sind Nenner und Zähler verschieden. Dafür brauchst du später einen anderen Weg.'));
      else if(d.same){stg.box2.append(el('p',null,strong('2. Welches Zeichen passt?')));cmpSign(view,stg.box2,'sign',f);}
      stg.upd();
    };
    cmpTiles(view,stg.box1,'same',opts,{label:'Was ist gleich?',onPick:()=>{fill2();stg.advance();}});
    fill2();
  },
  validate(t,d){
    if(!d.same)return invalid('Wähle zuerst: Was ist bei beiden Brüchen gleich?');
    if(d.same!==t.same){
      const txt=t.same==='nenner'?`Schau noch einmal: Beide Brüche haben den Nenner ${t.b}.`:t.same==='zaehler'?`Schau noch einmal: Beide Brüche haben den Zähler ${t.a}.`:'Hier sind Nenner und Zähler verschieden.';
      return wrong('same',txt,{['same'+d.same]:false});
    }
    if(t.same==='keins')return right('Richtig! Hier sind Nenner und Zähler verschieden. Dafür gibt es später einen anderen Weg.');
    if(!d.sign)return invalid('Wähle auch ein Zeichen.');
    const big=Math.max(t.a,t.c),mx=Math.max(t.b,t.d);
    const ok=t.same==='nenner'?`Richtig! Die Stücke sind gleich groß. ${big} Stücke sind mehr.`:`Richtig! Es sind gleich viele Stücke. Die Stücke mit dem Nenner ${mx} sind kleiner.`;
    return cmpSignCheck(t,d,'sign',ok,{sign:t.same==='nenner'?'Gleich große Stücke: Wer mehr Stücke hat, ist größer.':'Gleich viele Stücke: Wer kleinere Stücke hat, ist kleiner.'});
  },
  solution(t){
    const f=[t.a,t.b,t.c,t.d];
    if(t.same==='keins')return [line('Nenner und Zähler sind verschieden. Hier hilft keine der beiden einfachen Regeln.'),line('Du lernst gleich einen anderen Weg.')];
    return [line(t.same==='nenner'?`Beide Brüche haben den Nenner ${t.b}. Die Stücke sind gleich groß.`:`Beide Brüche haben den Zähler ${t.a}. Es sind gleich viele Stücke.`),
      line(t.same==='nenner'?`${Math.max(t.a,t.c)} Stücke sind mehr als ${Math.min(t.a,t.c)} Stücke.`:`Mit dem Nenner ${Math.min(t.b,t.d)} sind die Stücke größer.`),cmpPairPic(f),cmpSolEq(t)];
  }
};

/* ---------- W04 Gleich viele Teile fehlen zum Ganzen ---------- */
/* Satzbausteine: „Bei beiden fehlt 1 Stück“ (Hauptsatz) und „weil bei beiden 1 Stück fehlt“ (Nebensatz) */
const cmpMissMain=(m)=>m===1?'fehlt 1 Stück':'fehlen '+m+' Stücke';
const cmpMissSub=(m)=>m===1?'1 Stück fehlt':m+' Stücke fehlen';
const cmpMissN=(m)=>m===1?'1 Stück':m+' Stücke';
/* Behauptung zu W04: gleich viele fehlen („=“ oder richtiges Zeichen) oder Konflikt (die Faustregel „weniger fehlt = größer“ liegt falsch) */
function cmpFehltClaim(R,t,conflict){
  const f=[t.a,t.b,t.c,t.d],real=cmpSignOf(compareFrac(f[0],f[1],f[2],f[3])),mA=t.b-t.a,mC=t.d-t.c,why=conflict?CMP_WHY.W04konflikt:CMP_WHY.W04;
  let shown,truth,lead;
  if(conflict){shown=cmpSignOf(fehltRule(f[0],f[1],f[2],f[3]));truth=false;lead='weil bei '+(mA>mC?ft(t.a,t.b):ft(t.c,t.d))+' mehr Stücke fehlen';}
  else{truth=R.chance(0.5);shown=truth?real:'=';lead='weil bei beiden '+cmpMissSub(mA);}
  return Object.assign({who:R.pick(CMP_NAMES),shown,truth,lead},cmpReasons(R,why.ok,why.bad));
}
TASKS.W04={area:'Vergleichen',name:'Gleich viele Teile fehlen zum Ganzen',desc:'Was fehlt zum Ganzen? Das kleinere fehlende Stück gehört zum größeren Bruch.',notes:['M12','M11'],size:5,
  ctx:cmpCtx('W04'),layoutKinds:(lvl)=>cmpKindsOf('W04',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'rest';
    const equal=kind==='check'?R.chance(0.5):kind!=='conflict';
    const f=cmpFehlt(R,level,kind==='conflict'?'konflikt':equal?'gleich':'verschieden');
    const t={type:'W04',level,kind,a:f[0],b:f[1],c:f[2],d:f[3],avoid:cmpAvoid(...f)};
    if(kind==='check')t.equal=equal;
    if(kind==='claim'||kind==='conflict')Object.assign(t,cmpFehltClaim(R,t,kind==='conflict'));
    return t;
  },
  prompt(t,h){
    if(t.kind==='claim'||t.kind==='conflict')cmpClaimPrompt(t,h);
    else if(t.kind==='check')h.append(el('p',{class:'q'},'Vergleiche, was bei jedem Bruch bis zum Ganzen fehlt.'),t.level===1?null:eq(frac(t.a,t.b),'und',frac(t.c,t.d))); /* Leicht: die Brüche stehen schon an den Streifen */
    else h.append(el('p',{class:'q'},'Bei beiden fehlt etwas zum Ganzen. Welches Zeichen passt?'));
  },
  render(view,host){
    const t=view.task,d=view.draft,f=[t.a,t.b,t.c,t.d],always=t.level===1;
    if(t.kind==='claim'||t.kind==='conflict'){cmpClaim(view,host);return;}
    if(t.kind==='rest'){cmpPicSign(view,host,f,always,{rest:true});return;}
    cmpPicBox(view,host,f,always,{rest:true});
    const stg=twoStage(view,host,{isDone:()=>!!d.eq,summary:()=>'1. '+(d.eq==='ja'?'Es fehlen gleich viele':'Es fehlen verschieden viele')});
    stg.box1.append(el('p',null,strong('1. Fehlen bei beiden gleich viele Stücke zum Ganzen?')));
    const fill2=()=>{
      stg.box2.replaceChildren();
      if(d.eq==='nein')stg.box2.append(el('p',null,'Hier fehlen verschieden viele Stücke. Diese Regel hilft hier nicht.'));
      else if(d.eq){stg.box2.append(el('p',null,strong('2. Welches Zeichen passt?')));cmpSign(view,stg.box2,'sign',f);}
      stg.upd();
    };
    cmpYesNo(view,stg.box1,'eq',()=>{fill2();stg.advance();});
    fill2();
  },
  validate(t,d){
    if(t.kind==='claim')return cmpClaimCheck(t,d,'Es fehlt bei beiden gleich viel. Prüfe, ob dann beide gleich groß sind.');
    if(t.kind==='conflict')return cmpClaimCheck(t,d,'Zähle, wie viele Stücke bei jedem Bruch fehlen. Sind es gleich viele?');
    const mA=t.b-t.a,mC=t.d-t.c,bigDen=t.b>t.d?ft(t.a,t.b):ft(t.c,t.d),counts=`Bei ${ft(t.a,t.b)} ${cmpMissMain(mA)}, bei ${ft(t.c,t.d)} ${cmpMissMain(mC)}.`;
    if(t.kind==='check'){
      if(!d.eq)return invalid('Wähle zuerst: Fehlen bei beiden gleich viele Stücke?');
      if((d.eq==='ja')!==t.equal)return wrong('eq',t.equal?`Zähle noch einmal: Bei beiden ${cmpMissMain(mA)}.`:counts,{['eq'+d.eq]:false});
      if(!t.equal)return right(`Richtig! ${counts} Das sind verschieden viele.`);
      if(!d.sign)return invalid('Wähle auch ein Zeichen.');
    }
    return cmpSignCheck(t,d,'sign',`Richtig! Bei beiden ${cmpMissMain(mA)}. Bei ${bigDen} ist das fehlende Stück kleiner.`,{sign:'Das kleinere fehlende Stück gehört zum größeren Bruch.'});
  },
  solution(t){
    const f=[t.a,t.b,t.c,t.d],mA=t.b-t.a,mC=t.d-t.c,bigDen=t.b>t.d?ft(t.a,t.b):ft(t.c,t.d),counts=line(`Bei ${ft(t.a,t.b)} ${cmpMissMain(mA)}, bei ${ft(t.c,t.d)} ${cmpMissMain(mC)}.`);
    if(t.kind==='claim'||t.kind==='conflict')return [counts].concat(cmpClaimSolution(t));
    if(t.kind==='check'&&!t.equal)return [counts,line('Das sind verschieden viele. Diese Regel hilft hier nicht.'),cmpPairPic(f,{rest:true})];
    return [counts,line(`Das fehlende Stück bei ${bigDen} ist kleiner. Dieser Bruch ist größer.`),cmpPairPic(f,{rest:true}),cmpSolEq(t)];
  }
};
