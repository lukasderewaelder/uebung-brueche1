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
  W04:{1:['check','rest','rest','claim','check'],2:['check','conflict','rest','claim','conflict']},
  W05:{1:['ziel','ziel','ziel','ziel','ziel'],2:['ziel','frei','frei','zaehler','ziel']},
  W06:{1:['halb','halb','sign','sign','sign'],2:['halb','eins','sign','sign','sign']},
  W07:{1:['nenner','zaehler','fehlt','zahl','erw'],2:['konflikt','zaehler','fehlt','zahl','erw']},
  W08:{1:['ord3','ord3','ord3','ord4','desc3'],2:['ord4','ord4','ord5','desc4','ord5']},
  W09:{1:['ganze','sign','ganze','ordnen','sign'],2:['ganze','sign','sign','ordnen','ordnen']},
  W10:{1:['find','find','claim','find','find'],2:['find','claim','find','find','claim']}
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

/* ---------- W05 Auf einen Nenner bringen ---------- */
const CMP_FRIENDLY=[2,3,4,5,6,8,9,10,12,15,16,18,20,24,25,30,36,40,45,48,50,60,72,75,80,90,100];
/* Zwei Nenner b ≠ d mit gemeinsamem Nenner (kgV) höchstens lim; both: keiner geht im anderen auf, beide Brüche werden erweitert */
function cmpDenPair(R,pool,lim,both){
  for(let i=0;i<600;i++){
    const b=R.pick(pool),d=R.pick(pool);
    if(b===d)continue;
    const m=lcm(b,d);
    if(m>lim||(both&&(m===b||m===d)))continue;
    return [b,d,m];
  }
  return both?[4,6,12]:[3,6,6];
}
/* Paare für W05. ziel (Leicht): ein Nenner ist ein Vielfaches des anderen, N = der größere, etwa jedes fünfte Paar ist gleich groß;
   ziel (Knifflig) und frei: beide Brüche werden erweitert, N = kgV (höchstens 300); zaehler: c = k · a, der kleinere Zähler wird auf den größeren erweitert */
function cmpErw(R,level,kind){
  if(kind==='zaehler'){
    const pool=CMP_FRIENDLY.filter(x=>x>=3&&x<=60);
    for(let i=0;i<800;i++){
      const a=R.int(1,9),k=R.int(2,5),c=a*k,big=CMP_FRIENDLY.filter(x=>x>c&&x<=100);
      if(!big.length)continue;
      const b=R.pick(pool),d=R.pick(big);
      if(b<=a||d===b*k||b===d||cmpDelta(a,b,c,d)<0.01)continue;
      return R.chance(0.5)?{f:[a,b,c,d],ex:0,k}:{f:[c,d,a,b],ex:1,k};
    }
    return {f:[2,3,4,7],ex:0,k:2};
  }
  if(kind==='ziel'&&level===1){
    for(let i=0;i<300;i++){
      const k=R.pick([2,3,4]),b=R.int(2,Math.floor(24/k)),d=b*k,a=R.int(1,b-1),equal=R.chance(0.2),c=equal?a*k:R.int(1,d-1);
      if(c<1||c>=d||(!equal&&(c===a*k||Math.abs(a/b-c/d)<0.02)))continue;
      return {f:R.chance(0.5)?[a,b,c,d]:[c,d,a,b],N:d};
    }
    return {f:[1,3,5,12],N:12};
  }
  for(let i=0;i<600;i++){
    const [b,d,m]=cmpDenPair(R,CMP_FRIENDLY.filter(x=>x>=4),300,true),a=R.int(1,b-1),c=R.int(1,d-1);
    if(a*m/b===c*m/d||cmpDelta(a,b,c,d)<0.005)continue;
    return {f:[a,b,c,d],N:m};
  }
  return {f:[1,4,1,6],N:12};
}
/* erweiterte Brüche auf den Nenner N: [{i,n,den,k,v}] für jeden Bruch, dessen Nenner nicht schon N ist */
const cmpExpansions=(t,N)=>[[t.a,t.b],[t.c,t.d]].map(([n,den],i)=>({i,n,den,k:N/den,v:n*N/den})).filter(x=>x.den!==N);
TASKS.W05={area:'Vergleichen',name:'Auf einen Nenner bringen',desc:'Erweitere, bis beide Brüche denselben Nenner haben. Dann vergleichst du.',notes:['M13','M10'],size:5,
  ctx:cmpCtx('W05'),layoutKinds:(lvl)=>cmpKindsOf('W05',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'ziel',r=cmpErw(R,level,kind);
    const t={type:'W05',level,kind,a:r.f[0],b:r.f[1],c:r.f[2],d:r.f[3],avoid:cmpAvoid(...r.f)};
    if(r.N)t.N=r.N;
    if(kind==='zaehler'){t.ex=r.ex;t.k=r.k;}
    return t;
  },
  prompt(t,h){
    const q=t.kind==='ziel'?`Bringe beide Brüche auf den Nenner ${t.N}. Welches Zeichen passt?`:t.kind==='frei'?'Bringe beide Brüche auf denselben Nenner. Welches Zeichen passt?':'Bringe beide Brüche auf denselben Zähler. Welches Zeichen passt?';
    h.append(el('p',{class:'q'},q)); /* die Brüche stehen in den Zeilen darunter */
  },
  render(view,host){
    const t=view.task,f=[t.a,t.b,t.c,t.d],rows=el('div'),keys=[];
    if(t.kind!=='frei')cmpPicBox(view,host,f,t.level===1&&t.kind==='ziel'); /* beim freien Nenner hilft ein Bild nicht (Nenner bis 100) */
    host.append(rows);
    if(t.kind==='ziel'){
      [[t.a,t.b],[t.c,t.d]].forEach(([n,den],i)=>{
        if(den===t.N)rows.append(eq(frac(n,den)));
        else{rows.append(cmpExpandRow(view,'x'+i,n,den,t.N));keys.push('x'+i);}
      });
    }else if(t.kind==='frei'){
      [[t.a,t.b],[t.c,t.d]].forEach(([n,den],i)=>{rows.append(eq(frac(n,den),'=',fracInput(view,'x'+i)));keys.push('x'+i+'.n','x'+i+'.d');});
    }else{
      const e=t.ex===0?[t.a,t.b]:[t.c,t.d],o=t.ex===0?[t.c,t.d]:[t.a,t.b];
      rows.append(cmpExpandDenRow(view,'x0',e[0],e[1],o[0]),eq(frac(o[0],o[1])));keys.push('x0');
    }
    cmpAfterInputs(view,host,keys,(box)=>cmpSign(view,box,'sign',f,{noEq:true}));
  },
  validate(t,d){
    if(t.kind==='ziel'){
      const ex=cmpExpansions(t,t.N),vals=ex.map(x=>getInt(d,'x'+x.i));
      if(vals.some(v=>v===null))return invalid('Trage die neuen Zähler ein.');
      const marks={};let bad=null;
      ex.forEach((x,j)=>{if(vals[j]!==x.v){marks['x'+x.i]=false;bad=bad||{x,v:vals[j]};}});
      if(bad)return wrong(bad.v===bad.x.n?'onlyDen':'factor',bad.v===bad.x.n?`Beim Erweitern wird auch der Zähler mit ${bad.x.k} malgenommen.`:`Du erweiterst ${ft(bad.x.n,bad.x.den)} mit ${bad.x.k}. Rechne ${bad.x.n} mal ${bad.x.k}.`,marks);
    }else if(t.kind==='frei'){
      const x0=getFrac(d,'x0'),x1=getFrac(d,'x1');
      if(!x0||!x1)return invalid(MSG_FRAC_INVALID);
      if(x0.d!==x1.d)return wrong('gemeinsam','Beide Brüche brauchen denselben Nenner.',{'x0.d':false,'x1.d':false});
      if(x0.d%t.b!==0||x0.d%t.d!==0)return wrong('nenner',`In den Nenner ${x0.d} muss ${t.b} und ${t.d} aufgehen.`,{'x0.d':false,'x1.d':false});
      const m={};
      if(!equivalent(t.a,t.b,x0.n,x0.d))m['x0.n']=false;
      if(!equivalent(t.c,t.d,x1.n,x1.d))m['x1.n']=false;
      if(Object.keys(m).length)return wrong('wert','Ein neuer Bruch hat einen anderen Wert. Erweitere Zähler und Nenner mit derselben Zahl.',m);
    }else{
      const x=getInt(d,'x0'),e=t.ex===0?[t.a,t.b]:[t.c,t.d];
      if(x===null)return invalid('Trage den neuen Nenner ein.');
      if(x!==e[1]*t.k)return wrong('factor',`Du erweiterst ${ft(e[0],e[1])} mit ${t.k}. Rechne ${e[1]} mal ${t.k}.`,{x0:false});
    }
    if(!d.sign)return invalid('Wähle auch ein Zeichen.');
    const same=cmpSigned(t)==='=';
    const ok=same?'Richtig! Beide Brüche sind gleich groß.':t.kind==='zaehler'?'Richtig! Bei gleichem Zähler macht der kleinere Nenner den größeren Bruch.':'Richtig! Bei gleichem Nenner zählt der Zähler.';
    return cmpSignCheck(t,d,'sign',ok,{sign:t.kind==='zaehler'?'Bei gleichem Zähler macht der größere Nenner den kleineren Bruch.':'Mit gleichem Nenner zählt der Zähler. Vergleiche die neuen Zähler.'});
  },
  solution(t){
    const f=[t.a,t.b,t.c,t.d];
    if(t.kind==='zaehler'){
      const e=t.ex===0?[t.a,t.b]:[t.c,t.d],o=t.ex===0?[t.c,t.d]:[t.a,t.b],E=[e[0]*t.k,e[1]*t.k];
      return [line(`Erweitere ${ft(e[0],e[1])} mit ${t.k}. Dann haben beide den Zähler ${o[0]}.`),eq(frac(e[0],e[1]),'=',frac(e[0]+' · '+t.k,e[1]+' · '+t.k),'=',frac(E[0],E[1])),
        eq(frac(E[0],E[1]),cmpSignOf(compareFrac(E[0],E[1],o[0],o[1])),frac(o[0],o[1]))];
    }
    const N=t.kind==='ziel'?t.N:lcm(t.b,t.d),ex=cmpExpansions(t,N),v=[t.a*N/t.b,t.c*N/t.d];
    return [line(`Erweitere beide Brüche auf den Nenner ${N}.`),...ex.map(x=>eq(frac(x.n,x.den),'=',frac(x.n+' · '+x.k,x.den+' · '+x.k),'=',frac(x.v,N))),
      eq(frac(v[0],N),cmpSigned(t),frac(v[1],N)),cmpPairPic(f)];
  }
};

/* ---------- W06 Vergleichszahl ---------- */
/* Vergleich mit ½ (halb) oder 1 (eins): ein Bruch a/b gegen die Vergleichszahl (c/d = 1/2 bzw. 1/1); sign: zwei Brüche, die Vergleichszahl liegt dazwischen */
function cmpOne(R,level,ref){
  const pool=level===1?[3,4,5,6,7,8,9,10,12,14,15,16,18,20,24]:[7,8,9,10,12,13,15,16,17,18,20,24,25,30,40,50,60,75,100];
  const pos=R.pick(level===1?['unter','unter','genau','ueber','ueber']:['unter','ueber','ueber','unter','genau']);
  for(let i=0;i<400;i++){
    const b=R.pick(pool);let a;
    if(ref==='half'){
      if(pos==='genau'){if(b%2)continue;a=b/2;}
      else a=pos==='unter'?R.int(1,Math.ceil(b/2)-1):R.int(Math.floor(b/2)+1,b-1);
      if(a<1||(pos!=='genau'&&2*a===b))continue;
    }else a=pos==='genau'?b:pos==='unter'?R.int(1,b-1):R.int(b+1,2*b-1);
    return [a,b];
  }
  return ref==='half'?[3,8]:[5,4];
}
/* zwei Brüche, bei denen ½ (Leicht) oder ½ oder 1 (Knifflig) die schnellste Hilfe ist: nur diese Vergleichszahl trägt, kein anderer Weg */
function cmpZahl(R,level){
  const pool=level===1?[3,4,5,6,7,8,9,10,12,14,15,16,18,20,24]:[7,8,9,10,12,13,15,16,17,18,20,24,25,30,40,50,60,75,100];
  for(let i=0;i<2000;i++){
    const b=R.pick(pool),d=R.pick(pool);
    if(b===d)continue;
    const one=level===2&&R.chance(0.4),a=R.int(1,one?2*b-1:b-1),c=R.int(1,one?2*d-1:d-1),s=strategiesFor(a,b,c,d);
    if(s.fastest!=='zahl'||s.gleich||s.zahl!==(one?'one':'half')||cmpDelta(a,b,c,d)<(level===1?0.05:0.01))continue;
    return {f:[a,b,c,d],ref:s.zahl};
  }
  return {f:[3,8,5,7],ref:'half'};
}
const CMP_REF={half:'1/2',one:'1'};
const cmpRefNode=(ref)=>ref==='half'?frac(1,2):el('span',{class:'icn'},'1');
TASKS.W06={area:'Vergleichen',name:'Vergleichszahl',desc:'Liegt ein Bruch unter oder über 1/2 oder 1? So vergleichst du schnell.',notes:['M14'],size:5,
  ctx:cmpCtx('W06'),layoutKinds:(lvl)=>cmpKindsOf('W06',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'halb';
    if(kind==='sign'){
      const r=cmpZahl(R,level);
      return {type:'W06',level,kind,ref:r.ref,a:r.f[0],b:r.f[1],c:r.f[2],d:r.f[3],avoid:cmpAvoid(...r.f)};
    }
    const ref=kind==='eins'?'one':'half',[a,b]=cmpOne(R,level,ref);
    return {type:'W06',level,kind,ref,a,b,c:1,d:ref==='half'?2:1,avoid:[redKey(a,b)]};
  },
  prompt(t,h){
    if(t.kind==='sign')h.append(el('p',{class:'q'},t.level===1?['Ein Bruch liegt unter ',frac(1,2),', einer darüber. Welches Zeichen passt?']:'Welches Zeichen passt?'));
    else h.append(el('p',{class:'q'},'Vergleiche ',frac(t.a,t.b),' mit ',cmpRefNode(t.ref),'. Welches Zeichen passt?'));
  },
  render(view,host){
    const t=view.task,f=[t.a,t.b,t.c,t.d];
    if(t.kind==='sign'){cmpPicSign(view,host,f,t.level===1&&t.a<=t.b&&t.c<=t.d,{half:t.ref==='half'});return;}
    const box=el('div');host.append(box);
    const draw=()=>{
      const on=t.level===1||(view.st&&view.st.hint>=2);
      box.replaceChildren(...(on?[cmpPairPic(f,{single:true,half:t.ref==='half',line:t.ref==='one'})]:[]));
      view.changed();
    };
    const prev=view.onHint;view.onHint=()=>{if(prev)prev();draw();};
    draw();
    cmpSign(view,host,'sign',f,{second:cmpRefNode(t.ref)});
  },
  validate(t,d){
    if(t.kind==='sign'){
      const lessFirst=compareFrac(t.a,t.b,t.c,t.d)<0,lo=lessFirst?[t.a,t.b]:[t.c,t.d],hi=lessFirst?[t.c,t.d]:[t.a,t.b];
      return cmpSignCheck(t,d,'sign',`Richtig! ${ft(lo[0],lo[1])} liegt unter ${CMP_REF[t.ref]}, ${ft(hi[0],hi[1])} liegt darüber.`,{sign:`Ein Bruch liegt unter ${CMP_REF[t.ref]}, der andere darüber. Der Bruch über ${CMP_REF[t.ref]} ist größer.`});
    }
    if(!d.sign)return invalid('Wähle ein Zeichen: kleiner, gleich oder größer.');
    const real=cmpSigned(t),pos=real==='<'?'unter':real==='='?'genau auf':'über',rel=real==='<'?'kleiner als':real==='='?'gleich':'größer als';
    const how=t.ref==='half'?`${2*t.a} ist ${rel} ${t.b}`:`${t.a} ist ${rel} ${t.b}`;
    if(d.sign===real)return right(`Richtig! ${how}, also liegt ${ft(t.a,t.b)} ${pos} ${CMP_REF[t.ref]}.`);
    return wrong(t.ref==='half'?'halb':'eins',t.ref==='half'?`Verdopple den Zähler: ${2*t.a}. Vergleiche mit dem Nenner ${t.b}.`:`Vergleiche den Zähler ${t.a} mit dem Nenner ${t.b}.`,{['sign'+d.sign]:false});
  },
  solution(t){
    const f=[t.a,t.b,t.c,t.d];
    if(t.kind==='sign')return [line(`Vergleiche jeden Bruch mit ${CMP_REF[t.ref]}.`),cmpPairPic(f,{half:t.ref==='half'}),cmpSolEq(t)];
    return [line(t.ref==='half'?`Verdopple den Zähler: ${2*t.a}. Vergleiche mit dem Nenner ${t.b}.`:`Vergleiche den Zähler ${t.a} mit dem Nenner ${t.b}.`),cmpPairPic(f,{single:true,half:t.ref==='half',line:t.ref==='one'}),eq(frac(t.a,t.b),cmpSigned(t),cmpRefNode(t.ref))];
  }
};

/* ---------- W07 Welcher Weg passt? ---------- */
/* Erst den schnellsten Weg wählen (fünf Kacheln), dann das Zeichen. Richtig sind alle Wege, die bei diesem Paar tragen (Leicht genau einer);
   „Auf einen Nenner bringen“ geht immer, gilt bei einem schnelleren Weg aber nur als „fast“ (soft). Aufgabenart (ctx.kind) = der gesuchte Weg;
   konflikt: „Gleich viele Teile fehlen“ sieht passend aus, trägt aber nicht (verschieden viele fehlen). */
const CMP_WAYNAME={nenner:'Nenner gleich',zaehler:'Zähler gleich',fehlt:'Gleich viele Teile fehlen zum Ganzen',zahl:'Vergleichszahl',erw:'Auf einen Nenner bringen'};
function cmpWegPair(R,level,want){
  const small=level===1?[3,4,5,6,7,8,9,10,12,15,16,18,20,24]:[7,8,9,10,12,15,16,18,20,24,25,30,40,50,60,75,100];
  const plain=want==='erw'||want==='konflikt';
  for(let i=0;i<2000;i++){
    let f;
    if(want==='nenner')f=cmpNenner(R,level);
    else if(want==='zaehler')f=cmpZaehler(R,level,{noImp:true});
    else if(want==='fehlt')f=cmpFehlt(R,level,'gleich');
    else if(want==='zahl')f=cmpZahl(R,level).f;
    else if(want==='konflikt')f=cmpFehlt(R,level,'konflikt');
    else{const b=R.pick(small),d=R.pick(small);if(b===d)continue;f=[R.int(1,b-1),b,R.int(1,d-1),d];}
    const s=strategiesFor(f[0],f[1],f[2],f[3]);
    if(s.gleich||cmpDelta(f[0],f[1],f[2],f[3])<(level===1?0.03:0.005))continue;
    if(want==='erw'&&(s.special.length||(level===1&&s.erw.m>48)))continue;
    if(want==='konflikt'&&(s.special.length>1||s.special.includes('fehlt')||s.special.includes('nenner')||s.special.includes('zaehler')))continue;
    if(!plain&&(level===1?(s.special.length!==1||s.special[0]!==want):!s.special.includes(want)))continue;
    return {f,ways:s.special.length?s.special:['erw']};
  }
  const fb={nenner:[3,8,5,8],zaehler:[1,5,1,8],fehlt:[8,9,11,12],zahl:[3,8,5,7],erw:[2,3,3,4],konflikt:[7,9,3,4]}[want];
  return {f:fb,ways:strategiesFor(fb[0],fb[1],fb[2],fb[3]).special.length?strategiesFor(fb[0],fb[1],fb[2],fb[3]).special:['erw']};
}
/* Satz, warum der gewählte Weg trägt (Rückmeldung bei richtig) */
function cmpWayOk(t,w){
  const mA=t.b-t.a,mC=t.d-t.c,s=strategiesFor(t.a,t.b,t.c,t.d);
  if(w==='nenner')return 'Der Nenner ist gleich. Der größere Zähler gehört zum größeren Bruch.';
  if(w==='zaehler')return 'Der Zähler ist gleich. Der kleinere Nenner gehört zum größeren Bruch.';
  if(w==='fehlt')return `Bei beiden ${cmpMissMain(mA)}. Das kleinere fehlende Stück gehört zum größeren Bruch.`;
  if(w==='zahl')return `Die Vergleichszahl ${CMP_REF[s.zahl]} liegt zwischen den Brüchen.`;
  return `Auf den Nenner ${s.erw.m} erweitert zählt nur der Zähler.`;
}
/* Meldung, wenn der gewählte Weg bei diesem Paar nicht trägt */
function cmpWayNo(t,w){
  const mA=t.b-t.a,mC=t.d-t.c;
  if(w==='nenner')return `Die Nenner ${t.b} und ${t.d} sind verschieden.`;
  if(w==='zaehler')return `Die Zähler ${t.a} und ${t.c} sind verschieden.`;
  if(w==='fehlt')return t.a>=t.b||t.c>=t.d?'Hier ist ein Bruch nicht kleiner als 1. Es fehlt nichts zum Ganzen.':`Bei ${ft(t.a,t.b)} ${cmpMissMain(mA)}, bei ${ft(t.c,t.d)} ${cmpMissMain(mC)}. Diese Regel trägt hier nicht.`;
  return 'Beide Brüche liegen auf derselben Seite von 1/2 und von 1.';
}
TASKS.W07={area:'Vergleichen',name:'Welcher Weg passt?',desc:'Wähle den schnellsten Weg zum Vergleichen und wende ihn an.',notes:['M15','M11','M12'],size:5,
  ctx:cmpCtx('W07'),layoutKinds:(lvl)=>cmpKindsOf('W07',lvl),
  gen(level,R,ctx){
    const want=(ctx&&ctx.kind)||'nenner',r=cmpWegPair(R,level,want);
    return {type:'W07',level,kind:want,a:r.f[0],b:r.f[1],c:r.f[2],d:r.f[3],ways:r.ways,fast:r.ways[0],avoid:cmpAvoid(...r.f)};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Du vergleichst diese zwei Brüche:'),eq(frac(t.a,t.b),'und',frac(t.c,t.d)));},
  render(view,host){
    const t=view.task,d=view.draft,f=[t.a,t.b,t.c,t.d];
    const stg=twoStage(view,host,{isDone:()=>!!d.way,summary:()=>'1. Weg: '+(CMP_WAYNAME[d.way]||'')});
    stg.box1.append(el('p',null,strong('1. Welcher Weg ist am schnellsten?')));
    const opts=[{v:'nenner',label:CMP_WAYNAME.nenner},{v:'zaehler',label:CMP_WAYNAME.zaehler},{v:'fehlt',label:CMP_WAYNAME.fehlt},{v:'zahl',label:['Vergleichszahl ',frac(1,2),' oder 1']},{v:'erw',label:CMP_WAYNAME.erw}];
    const fill2=()=>{stg.box2.replaceChildren();if(d.way){stg.box2.append(el('p',null,strong('2. Welches Zeichen passt?')));cmpSign(view,stg.box2,'sign',f);}stg.upd();};
    cmpTiles(view,stg.box1,'way',opts,{label:'Wege',two:true,onPick:()=>{fill2();stg.advance();}});
    fill2();
  },
  validate(t,d){
    if(!d.way)return invalid('Wähle zuerst den schnellsten Weg.');
    const w=d.way;
    if(!t.ways.includes(w)){
      if(w==='erw')return soft('stur',`Auf einen Nenner bringen geht immer. Hier gibt es aber einen schnelleren Weg: ${CMP_WAYNAME[t.fast]}.`,{['way'+w]:false});
      return wrong('noCarry',cmpWayNo(t,w),{['way'+w]:false});
    }
    if(!d.sign)return invalid('Wähle auch ein Zeichen.');
    return cmpSignCheck(t,d,'sign','Richtig! '+cmpWayOk(t,w),{sign:'Wende den Weg noch einmal an. '+(w==='erw'?'Vergleiche die Zähler.':'Prüfe, welcher Bruch größer ist.')});
  },
  solution(t){
    const f=[t.a,t.b,t.c,t.d];
    return [line(strong('Schnellster Weg: '),CMP_WAYNAME[t.fast]+(t.ways.length>1?' (auch '+t.ways.slice(1).map(w=>CMP_WAYNAME[w]).join(', ')+')':'')+'.'),line(cmpWayOk(t,t.fast)),cmpPairPic(f),cmpSolEq(t)];
  }
};

/* ---------- Ordnen (W08, W09) ---------- */
/* k echte Brüche mit paarweise verschiedenen Werten. Familien: nenner (gleicher Nenner), zaehler (gleicher Zähler), vielfach (Nenner b, 2b, 3b …),
   gemischt. Gemeinsamer Nenner aller höchstens 48 (Leicht) bzw. 300 (Knifflig). */
function cmpList(R,level,k){
  const fams=level===1?['nenner','zaehler','vielfach','gemischt']:['nenner','zaehler','vielfach','gemischt','gemischt'];
  const lim=level===1?48:300,gap=level===1?0.03:0.004;
  const dNenner=level===1?[6,8,9,10,12,15,16,20,24]:[20,24,25,30,36,40,50,60,75,100];
  const dAny=level===1?[3,4,5,6,8,9,10,12,15,16,20,24]:[4,5,6,8,9,10,12,15,16,18,20,24,25,30,36,40,50,60,75,80,90,100];
  for(let i=0;i<2000;i++){
    const fam=R.pick(fams),fr=[];
    if(fam==='nenner'){const d=R.pick(dNenner);for(let j=0;j<k;j++)fr.push([R.int(1,d-1),d]);}
    else if(fam==='zaehler'){const n=R.int(1,level===1?3:5),ds=dAny.filter(x=>x>n);for(let j=0;j<k;j++)fr.push([n,R.pick(ds)]);}
    else if(fam==='vielfach'){const base=R.pick(level===1?[2,3,4]:[4,5,6,10]);R.shuffle([1,2,3,4,5,6]).slice(0,k).forEach(m=>{const d=base*m;fr.push([R.int(1,d-1),d]);});}
    else for(let j=0;j<k;j++){const d=R.pick(dAny);fr.push([R.int(1,d-1),d]);}
    if(commonDenominator(fr.map(x=>x[1]))>lim)continue;
    if(!fr.every((x,a)=>fr.every((y,b)=>a===b||Math.abs(x[0]/x[1]-y[0]/y[1])>=gap)))continue;
    return fr;
  }
  return [[1,2],[3,8],[5,6],[3,4],[1,3]].slice(0,k);
}
/* Kartennummern in der richtigen Reihenfolge (kleinste zuerst, bei desc die größte) */
function cmpIdxSorted(fr,desc){
  const idx=fr.map((_,i)=>i).sort((p,q)=>compareFrac(fr[p][0],fr[p][1],fr[q][0],fr[q][1]));
  return desc?idx.reverse():idx;
}
/* Fehlvorstellung hinter einer falschen Reihe: reverse (umgekehrt), byNum (nur nach den Zählern), byDen (nur nach den Nennern, größerer Nenner = größer),
   adjacent (zwei Nachbarn vertauscht), sonst order */
function cmpOrderCode(t,ord){
  const wrongAt=t.order.map((c,j)=>ord[j]!==c?j:-1).filter(j=>j>=0),desc=t.dir==='desc';
  const by=(sel)=>{const idx=t.fr.map((_,i)=>i).sort((p,q)=>sel(t.fr[p])-sel(t.fr[q])||p-q);return desc?idx.reverse():idx;};
  if(ord.join()===t.order.slice().reverse().join())return {code:'reverse'};
  if(ord.join()===by(x=>x[0]).join())return {code:'byNum'};
  if(ord.join()===by(x=>x[1]).join())return {code:'byDen'};
  if(wrongAt.length===2&&wrongAt[1]===wrongAt[0]+1)return {code:'adjacent',a:ord[wrongAt[0]],b:ord[wrongAt[1]]};
  return {code:'order'};
}
/* Prüfung einer Reihe; fmt(i) = Text der Karte i */
function cmpOrderCheck(t,d,fmt){
  const ord=Array.isArray(d.ord)?d.ord:[];
  if(!ordFull(ord))return invalid('Lege alle Karten in die Reihe.');
  const marks={};let bad=0;
  t.order.forEach((c,j)=>{if(ord[j]!==c){marks['ord'+j]=false;bad++;}});
  if(!bad)return right('Richtig! '+t.order.map(fmt).join(t.dir==='desc'?' > ':' < '));
  const r=cmpOrderCode(t,ord),big=t.dir==='desc'?'größte':'kleinste';
  const msg={
    reverse:`Die Reihe ist umgekehrt. Der ${big} gehört nach links.`,
    byNum:'Du hast nur auf die Zähler geschaut. Der Nenner sagt, wie groß die Stücke sind.',
    byDen:'Du hast nur auf die Nenner geschaut. Ein größerer Nenner heißt kleinere Stücke.',
    adjacent:`Vergleiche ${r.code==='adjacent'?fmt(r.a)+' und '+fmt(r.b):''} noch einmal.`,
    order:'Die Reihe stimmt noch nicht. Vergleiche je zwei Zahlen nebeneinander.'}[r.code];
  return wrong(r.code,msg,marks);
}
/* Lösung: die Reihe mit Zeichen und darunter die Streifen (echte Brüche) */
const cmpOrderSolution=(t,nodeOf,withPic)=>[line(t.dir==='desc'?'Der größte kommt zuerst:':'Der kleinste kommt zuerst:'),
  eq(...t.order.reduce((a,i,j)=>a.concat(j?[t.dir==='desc'?'>':'<']:[],[nodeOf(i)]),[])),
  ...(withPic?[cmpStack(t.order.map(i=>({n:t.fr[i][0],d:t.fr[i][1]})),{compact:true})]:[])];

/* ---------- W08 Brüche ordnen ---------- */
TASKS.W08={area:'Vergleichen',name:'Brüche ordnen',desc:'Lege Brüche der Größe nach in eine Reihe. Ziehe die Karten oder tippe sie an.',notes:['M16','M15'],size:5,
  ctx:cmpCtx('W08'),layoutKinds:(lvl)=>cmpKindsOf('W08',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'ord3',k=+kind.slice(-1),desc=kind.startsWith('desc');
    let fr,order;
    for(let i=0;i<60;i++){
      fr=cmpList(R,level,k);order=cmpIdxSorted(fr,desc);
      if(order.some((c,j)=>c!==j))break; /* nicht schon richtig herum */
    }
    return {type:'W08',level,kind,dir:desc?'desc':'asc',fr,order,avoid:fr.map(x=>redKey(x[0],x[1]))};
  },
  prompt(t,h){h.append(el('p',{class:'q'},t.dir==='desc'?'Ordne die Brüche. Der größte Bruch kommt zuerst.':'Ordne die Brüche. Der kleinste Bruch kommt zuerst.'));},
  render(view,host){
    const t=view.task,box=el('div');host.append(box);
    const draw=()=>{const on=view.st&&view.st.hint>=2;box.replaceChildren(...(on?[cmpStack(t.fr.map(x=>({n:x[0],d:x[1]})),{compact:true})]:[]));view.changed();};
    const prev=view.onHint;view.onHint=()=>{if(prev)prev();draw();};
    draw();
    cmpOrder(view,host,'ord',t.fr.map(x=>({n:x[0],d:x[1],aria:x[0]+' durch '+x[1]})),{desc:t.dir==='desc'});
  },
  validate(t,d){return cmpOrderCheck(t,d,(i)=>ft(t.fr[i][0],t.fr[i][1]));},
  solution(t){return cmpOrderSolution(t,(i)=>frac(t.fr[i][0],t.fr[i][1]),true);},
  variety:(t)=>t.fr.slice(0,2).map(x=>'n'+x[1])
};

/* ---------- W09 Größer als 1 ---------- */
/* Zahl über 1 als unechter Bruch p/q mit w Ganzen und Rest r; mixed: wird als gemischte Zahl angezeigt */
function cmpBig(R,level,wholeFix){
  const q=R.pick(level===1?[2,3,4,5,6,8]:[4,5,6,7,8,9,10,12,15,20,25,50,100]),w=wholeFix!=null?wholeFix:R.int(1,level===1?3:5),r=R.int(1,q-1);
  return {p:w*q+r,q,w,r,mixed:R.chance(0.5)};
}
const cmpBigNode=(x)=>x.mixed?mixed(x.w,x.r,x.q):frac(x.p,x.q);
const cmpBigTxt=(x)=>x.mixed?`${x.w} ${x.r}/${x.q}`:ft(x.p,x.q);
const cmpBigTf=(x)=>x.mixed?`${x.w} ${tf(x.r,x.q)}`:tf(x.p,x.q);
/* Paar: same = gleich viele Ganze (die Reste entscheiden), sonst verschieden viele Ganze; mindestens eine Zahl als unechter Bruch */
function cmpBigPair(R,level,same){
  for(let i=0;i<600;i++){
    const x=cmpBig(R,level),y=cmpBig(R,level,same?x.w:null);
    if((!same&&x.w===y.w)||(x.mixed&&y.mixed)||compareFrac(x.p,x.q,y.p,y.q)===0||cmpDelta(x.p,x.q,y.p,y.q)<(level===1?0.05:0.01))continue;
    return [x,y];
  }
  return [{p:9,q:4,w:2,r:1,mixed:false},{p:11,q:4,w:2,r:3,mixed:true}];
}
TASKS.W09={area:'Vergleichen',name:'Größer als 1',desc:'Unechte Brüche und gemischte Zahlen vergleichen und ordnen: Ganze zuerst.',notes:['M6','M16'],size:5,
  ctx:cmpCtx('W09'),layoutKinds:(lvl)=>cmpKindsOf('W09',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'sign';
    if(kind==='ordnen'){
      for(let i=0;i<300;i++){
        const big=[cmpBig(R,level),cmpBig(R,level),cmpBig(R,level)],fr=big.map(x=>[x.p,x.q]);
        if(big.filter(x=>x.mixed).length>2||new Set(big.map(x=>x.w)).size<2)continue;
        if(!fr.every((x,a)=>fr.every((y,b)=>a===b||Math.abs(x[0]/x[1]-y[0]/y[1])>=0.08)))continue;
        const desc=R.chance(0.3),order=cmpIdxSorted(fr,desc);
        if(!order.some((c,j)=>c!==j))continue;
        return {type:'W09',level,kind,dir:desc?'desc':'asc',big,fr,order,avoid:fr.map(x=>redKey(x[0],x[1]))};
      }
    }
    const pair=cmpBigPair(R,level,kind==='ganze'?R.chance(0.35):R.chance(0.4));
    return {type:'W09',level,kind:kind==='ordnen'?'sign':kind,x:pair,a:pair[0].p,b:pair[0].q,c:pair[1].p,d:pair[1].q,avoid:cmpAvoid(pair[0].p,pair[0].q,pair[1].p,pair[1].q)};
  },
  prompt(t,h){
    if(t.kind==='ordnen')h.append(el('p',{class:'q'},t.dir==='desc'?'Ordne die Zahlen. Die größte Zahl kommt zuerst.':'Ordne die Zahlen. Die kleinste Zahl kommt zuerst.'));
    else h.append(el('p',{class:'q'},t.kind==='ganze'?'Wie viele Ganze stecken in jeder Zahl? Welches Zeichen passt?':'Welches Zeichen passt?'));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='ordnen'){
      const box=el('div');host.append(box);
      cmpOrder(view,host,'ord',t.big.map((x,i)=>({node:cmpBigNode(x),aria:cmpBigTxt(x)})),{desc:t.dir==='desc'});
      return;
    }
    const f=[t.a,t.b,t.c,t.d],opt={first:cmpBigNode(t.x[0]),second:cmpBigNode(t.x[1])};
    cmpPicBox(view,host,f,false);
    if(t.kind==='sign'){cmpSign(view,host,'sign',f,opt);return;}
    const rows=el('div'),keys=['w0','w1'];host.append(rows);
    t.x.forEach((x,i)=>rows.append(el('div',{class:'eq'},cmpBigNode(x),el('span',{class:'cmpword'},'enthält'),intInput(view,'w'+i,'Ganze'),el('span',{class:'cmpword'},'Ganze'))));
    cmpAfterInputs(view,host,keys,(box)=>cmpSign(view,box,'sign',f,Object.assign({noEq:true},opt)));
  },
  validate(t,d){
    if(t.kind==='ordnen')return cmpOrderCheck(t,d,(i)=>cmpBigTxt(t.big[i]));
    const x0=t.x[0],x1=t.x[1];
    if(t.kind==='ganze'){
      const g0=getInt(d,'w0'),g1=getInt(d,'w1');
      if(g0===null||g1===null)return invalid('Trage bei beiden Zahlen die Ganzen ein.');
      const m={};
      if(g0!==x0.w)m.w0=false;
      if(g1!==x1.w)m.w1=false;
      if(Object.keys(m).length){const x=m.w0===false?x0:x1;return wrong('ganze',`Teile den Zähler durch den Nenner: ${x.p} : ${x.q} ergibt ${x.w} Rest ${x.r}.`,m);}
      if(!d.sign)return invalid('Wähle auch ein Zeichen.');
    }
    const hint=x0.w!==x1.w?'Die Ganzen sind verschieden. Die Zahl mit mehr Ganzen ist größer.':'Die Ganzen sind gleich. Vergleiche die Reste.';
    const over=Object.fromEntries(['sign','nurZaehler','nurNenner','beide','gleich','gleichwertig','gleichNenner','gleichZahl','gleichAbstand'].map(c=>[c,hint]));
    return cmpSignCheck(t,d,'sign',x0.w!==x1.w?`Richtig! ${x0.w} Ganze und ${x1.w} Ganze: Mehr Ganze sind größer.`:'Richtig! Die Ganzen sind gleich. Die Reste entscheiden.',over);
  },
  solution(t){
    if(t.kind==='ordnen')return cmpOrderSolution(t,(i)=>cmpBigNode(t.big[i]),false);
    const x0=t.x[0],x1=t.x[1];
    return [line(`${cmpBigTxt(x0)} hat ${x0.w} Ganze, ${cmpBigTxt(x1)} hat ${x1.w} Ganze.`),line(x0.w!==x1.w?'Mehr Ganze sind größer.':'Die Ganzen sind gleich. Vergleiche die Reste.'),cmpPairPic([t.a,t.b,t.c,t.d]),eq(cmpBigNode(x0),cmpSigned(t),cmpBigNode(x1))];
  },
  variety:(t)=>t.x?['n'+t.x[0].q,'n'+t.x[1].q]:['n'+t.fr[0][1]]
};

/* ---------- W10 Dazwischen ---------- */
/* Brüche lo < hi: adj = direkt benachbart bei gleichem Nenner (zum Finden muss man feiner einteilen); sonst Leicht gleicher Nenner mit Platz, Knifflig verschiedene Nenner */
function cmpZwischen(R,level,adj){
  for(let i=0;i<800;i++){
    let f;
    if(adj||level===1){
      const D=R.pick(level===1?[5,6,8,10,12,16,20]:[10,12,15,20,25,50,100]),lo=R.int(1,D-3),hi=adj?lo+1:lo+R.int(2,3);
      if(hi>=D)continue;
      f=[lo,D,hi,D];
    }else{
      const [b,d]=cmpDenPair(R,CMP_FRIENDLY.filter(x=>x>=3),120,false),a=R.int(1,b-1),c=R.int(1,d-1),s=compareFrac(a,b,c,d);
      if(!s||b===d||cmpDelta(a,b,c,d)>0.4||cmpDelta(a,b,c,d)<0.02)continue;
      f=s<0?[a,b,c,d]:[c,d,a,b];
    }
    return f;
  }
  return [3,8,5,8];
}
/* gemeinsamer Nenner M = doppelter kgV: zwischen lo' und hi' (je M-tel) liegt immer mindestens ein weiterer */
const cmpBetween=(t)=>{const M=2*lcm(t.b,t.d);return {M,lo:t.a*M/t.b,hi:t.c*M/t.d};};
CMP_WHY.W10={ok:'Man kann feiner einteilen. Dann liegt noch ein Bruch dazwischen.',
  bad:['Brüche mit demselben Nenner liegen direkt nebeneinander.','Zwischen zwei Brüchen mit gleichem Nenner liegt nie ein Bruch.','Es gibt nur Brüche mit diesem Nenner.']};
TASKS.W10={area:'Vergleichen',name:'Dazwischen',desc:'Zwischen zwei Brüchen liegt immer noch ein Bruch. Finde einen.',notes:['M13','M16'],size:5,
  ctx:cmpCtx('W10'),layoutKinds:(lvl)=>cmpKindsOf('W10',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'find',adj=kind==='claim'||R.chance(level===1?0.3:0.4),f=cmpZwischen(R,level,adj);
    const t={type:'W10',level,kind,a:f[0],b:f[1],c:f[2],d:f[3],avoid:cmpAvoid(...f)};
    if(kind==='claim'){const neg=R.chance(0.6);Object.assign(t,{neg,who:R.pick(CMP_NAMES),truth:!neg},cmpReasons(R,CMP_WHY.W10.ok,CMP_WHY.W10.bad));}
    return t;
  },
  prompt(t,h){
    if(t.kind==='claim')h.append(el('p',{class:'q'},t.who+' sagt:'),el('p',{class:'q'},'Zwischen ',frac(t.a,t.b),' und ',frac(t.c,t.d),t.neg?' liegt kein Bruch.':' liegt ein Bruch.'));
    else h.append(el('p',{class:'q'},'Nenne einen Bruch zwischen ',frac(t.a,t.b),' und ',frac(t.c,t.d),'.'));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='claim'){cmpClaim(view,host);return;}
    cmpPicBox(view,host,[t.a,t.b,t.c,t.d],false);
    host.append(eq(el('span',{class:'cmpword'},'Dein Bruch'),fracInput(view,'x')));
  },
  validate(t,d){
    if(t.kind==='claim')return cmpClaimCheck(t,d,'Teile die Einteilung feiner. Prüfe, ob dann noch ein Bruch dazwischen liegt.');
    const x=getFrac(d,'x');
    if(!x)return invalid(MSG_FRAC_INVALID);
    const m={'x.n':false,'x.d':false},toLo=compareFrac(x.n,x.d,t.a,t.b),toHi=compareFrac(x.n,x.d,t.c,t.d);
    if(toLo>0&&toHi<0)return right(`Richtig! ${ft(x.n,x.d)} liegt zwischen ${ft(t.a,t.b)} und ${ft(t.c,t.d)}. Es gibt noch viele weitere.`);
    if(toLo===0||toHi===0)return wrong('edge','Das ist eine der beiden Grenzen. Gesucht ist ein Bruch dazwischen.',m);
    return wrong('outside',toLo<0?`Dein Bruch ist kleiner als ${ft(t.a,t.b)}.`:`Dein Bruch ist größer als ${ft(t.c,t.d)}.`,m);
  },
  solution(t){
    const f=[t.a,t.b,t.c,t.d],B=cmpBetween(t);
    if(t.kind==='claim')return [line(strong(t.truth?'Das stimmt. ':'Das stimmt nicht. '),t.opts.find(o=>o.id===t.answerR).txt),eq(frac(t.a,t.b),'=',frac(B.lo,B.M)),eq(frac(t.c,t.d),'=',frac(B.hi,B.M)),line(`Dazwischen liegt zum Beispiel ${ft(B.lo+1,B.M)}.`)];
    return [line(`Erweitere beide Brüche auf den Nenner ${B.M}.`),eq(frac(t.a,t.b),'=',frac(B.lo,B.M)),eq(frac(t.c,t.d),'=',frac(B.hi,B.M)),line(`Dazwischen liegt zum Beispiel ${ft(B.lo+1,B.M)}.`),cmpPairPic(f)];
  }
};
