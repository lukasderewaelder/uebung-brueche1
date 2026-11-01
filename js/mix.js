'use strict';
/* =====================================================================
   Gemischte Runden: Aufgaben anderer Art mitten in einer Runde
   U04 „Stimmt das?“   Urteil und Begründung (Denkfehler erkennen)
   U05 „Anteil im Text“ Textaufgabe, Anteil als gekürzter Bruch
   U06 „Zwei Schritte prüfen“  Welche Zeile ist falsch? Berichtigen
   Eingestreut wird über ctx(round,level) und gen(): Eine Runde darf Aufgaben verschiedener Typen enthalten (round.mix merkt je Platz die Art).
   · G02–G05: 1–2 von 5 Aufgaben „Stimmt das?“ (nie die erste); Knifflig bei G03/G04 zusätzlich 1 Transfer (U05 oder U06)
   · Knifflig bei U01, U02, U03: 1 von 5 Aufgaben ist ein Transfer (U05 oder U06)
   Alle drei Typen haben auch eigene Tipps (js/tips.js); U04 ist zusätzlich als Übung einzeln erreichbar.
   ===================================================================== */
const U_NAMES=['Lena','Ben','Mia','Tom','Ida','Paul','Nora','Jan'];
const U_LETTERS=['A','B','C'];

/* Bruch p/q, teilerfremd, mit Wahrscheinlichkeit 0,15 unecht (p > q) */
function uFrac(R,qmin,qmax){
  let p,q;const imp=R.chance(0.15);
  do{q=R.int(qmin,qmax);p=imp?R.int(q+1,2*q-1):R.int(1,q-1);}while(gcd(p,q)!==1);
  return [p,q];
}

/* ---------- U04 Stimmt das? ---------- */
const U04_OK={
  add:'Beim Erweitern wird malgenommen, nicht addiert.',
  mul:'Zähler und Nenner wurden mit derselben Zahl malgenommen.',
  numOnly:'Auch der Nenner muss mit derselben Zahl malgenommen werden.',
  red:'Zähler und Nenner wurden durch dieselbe Zahl geteilt.',
  sub:'Beim Kürzen wird geteilt, nicht abgezogen.'
};
const U04_BAD={
  add:['Zähler und Nenner dürfen sich nie ändern.','Der Wert bleibt gleich, wenn beide Zahlen größer werden.'],
  mul:['Der Nenner ist größer geworden, also ist der Bruch größer.','Beim Erweitern darf man nur den Zähler malnehmen.'],
  numOnly:['Es genügt, wenn nur der Zähler größer wird.','Der Nenner darf nie verändert werden.'],
  red:['Beim Kürzen wird nur der Nenner kleiner.','Man darf nur durch 2 kürzen.'],
  sub:['Beim Kürzen darf man abziehen, wenn beide Zahlen kleiner werden.','Beim Kürzen muss man mit derselben Zahl malnehmen.'],
  fullNo:['Der Zähler ist kleiner als der Nenner, also geht nichts mehr.','Man kann nur kürzen, wenn der Zähler 1 ist.'],
  fullYes:['Beide Zahlen sind noch durch 2 teilbar.','Man kann immer noch einmal durch 2 kürzen.']
};
TASKS.U04={area:'Umkehraufgaben',name:'Stimmt das?',desc:'Stimmt die Rechnung? Wähle auch die passende Begründung.',notes:['M1','M2','M3'],size:5,
  gen(level,R){
    const kind=R.pick(level===1?['add','mul','numOnly','red','sub']:['add','mul','numOnly','red','sub','full','full']);
    const who=R.pick(U_NAMES),qmax=level===1?8:15,kmax=level===1?5:9;
    let a,b,c=null,d=null,truth,lead='',okTxt,badKey=kind;
    for(let tries=0;tries<80;tries++){
      if(kind==='add'){[a,b]=uFrac(R,2,qmax);const m=R.int(1,level===1?3:5);c=a+m;d=b+m;truth=false;lead=`weil man bei Zähler und Nenner ${m} dazurechnet`;}
      else if(kind==='mul'){[a,b]=uFrac(R,2,qmax);const k=R.int(2,kmax);c=a*k;d=b*k;truth=true;lead=`weil man oben und unten mit ${k} malnimmt`;}
      else if(kind==='numOnly'){[a,b]=uFrac(R,2,qmax);const k=R.int(2,kmax);c=a*k;d=b;truth=false;lead=`weil man den Zähler mit ${k} malnimmt`;}
      else if(kind==='red'){const [p,q]=uFrac(R,2,level===1?7:13),g=R.int(2,level===1?6:12);a=p*g;b=q*g;c=p;d=q;truth=true;lead=`weil man oben und unten durch ${g} teilt`;}
      else if(kind==='sub'){const [p,q]=uFrac(R,2,level===1?7:13),g=R.int(2,level===1?6:12),m=R.int(1,3);a=p*g;b=q*g;c=a-m;d=b-m;truth=false;lead=`weil man bei beiden ${m} abzieht`;}
      else{ /* full: „so weit wie möglich gekürzt“ */
        const [p,q]=uFrac(R,3,level===1?9:17);
        if(R.chance(0.5)){a=p;b=q;truth=true;badKey='fullYes';okTxt='Keine Zahl größer als 1 teilt beide Zahlen.';}
        else{const g=R.int(2,Math.min(level===1?6:12,Math.floor(300/Math.max(p,q))));a=p*g;b=q*g;truth=false;badKey='fullNo';okTxt=`Beide Zahlen sind noch durch ${g} teilbar.`;}
        c=d=null;
      }
      if(c==null||(c>=1&&d>=2&&equivalent(a,b,c,d)===truth&&!(a===c&&b===d)))break;
    }
    if(kind!=='full')okTxt=U04_OK[kind];
    const bad=R.shuffle(U04_BAD[badKey]).slice(0,2);
    const all=R.shuffle([{txt:okTxt,ok:true}].concat(bad.map(x=>({txt:x,ok:false}))));
    const opts=all.map((o,i)=>({id:U_LETTERS[i],txt:o.txt})),answerR=U_LETTERS[all.findIndex(o=>o.ok)];
    return {type:'U04',level,kind,who,a,b,c,d,lead,truth,opts,answerR,avoid:[redKey(a,b)]};
  },
  prompt(t,h){
    if(t.kind==='full')h.append(el('p',{class:'q'},t.who+' sagt: ',frac(t.a,t.b),' ist schon so weit wie möglich gekürzt.'));
    else h.append(el('p',{class:'q'},t.who+' sagt:'),el('div',{class:'wrongclaim'},eq('',frac(t.a,t.b),'=',frac(t.c,t.d))),el('p',{class:'q sm'},t.lead+'.'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    const stg=twoStage(view,host,{isDone:()=>!!d.j,summary:()=>'1. '+(d.j==='ja'?'Stimmt':'Stimmt nicht')});
    stg.box1.append(el('p',null,strong('1. Stimmt das?')));
    const row=el('div',{class:'yesno'});
    [['ja','haken','Stimmt'],['nein','kreuz','Stimmt nicht']].forEach(([v,ic,label])=>{
      const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.j===v)},icon(ic),label);
      b.disabled=view.locked();
      b.addEventListener('click',()=>{if(view.locked())return;d.j=v;view.save();row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stg.advance();});
      view.inputs['j'+v]=b;row.append(b);
    });
    stg.box1.append(row);
    stg.box2.append(el('p',null,strong('2. Welche Begründung passt?')));
    const grid=el('div',{class:'tiles tiles-3',role:'group','aria-label':'Begründungen'});
    t.opts.forEach(o=>{
      const b=el('button',{type:'button',class:'tile tile-txt','aria-pressed':String(d.r===o.id)},el('span',{class:'ltr','aria-hidden':'true'},o.id),el('span',{class:'tv'},o.txt));
      b.disabled=view.locked();
      b.addEventListener('click',()=>{if(view.locked())return;d.r=o.id;view.save();grid.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
      view.inputs['r'+o.id]=b;grid.append(b);
    });
    stg.box2.append(grid);
    stg.upd();
  },
  validate(t,d){
    if(!d.j)return invalid('Wähle zuerst: Stimmt das oder stimmt das nicht?');
    if(!d.r)return invalid('Wähle auch die Begründung.');
    const jOk=d.j===(t.truth?'ja':'nein'),rOk=d.r===t.answerR;
    const proof=t.kind==='full'?'':qCross(t.a,t.b,t.c,t.d)+' ';
    if(jOk&&rOk)return right('Richtig! '+proof+t.opts.find(o=>o.id===t.answerR).txt);
    if(!jOk)return wrong('judge',t.kind==='full'?'Das Urteil stimmt noch nicht. Prüfe, ob eine Zahl größer als 1 beide Zahlen teilt.':'Das Urteil stimmt noch nicht. Rechne nach: '+proof.trim());
    return wrong('reason','Das Urteil stimmt. Die Begründung passt noch nicht. Lies alle drei noch einmal.');
  },
  solution(t){
    const ok=t.opts.find(o=>o.id===t.answerR).txt;
    return [line(strong(t.truth?'Das stimmt. ':'Das stimmt nicht. '),ok),...(t.kind==='full'?[]:[line(qCross(t.a,t.b,t.c,t.d))])];
  }
};

/* ---------- U05 Anteil im Text ---------- */
const U05_TEXT=[
  (t,p)=>`In einer Klasse sind ${t} Kinder. ${p} davon fahren mit dem Rad zur Schule.`,
  (t,p)=>`In einer Tüte sind ${t} Bonbons. ${p} davon sind rot.`,
  (t,p)=>`Ein Buch hat ${t} Seiten. ${p} Seiten hat Jana schon gelesen.`,
  (t,p)=>`Das Stadion hat ${t} Plätze. ${p} Plätze sind besetzt.`,
  (t,p)=>`Ein Weg ist ${t} Meter lang. ${p} Meter sind schon geschafft.`
];
TASKS.U05={area:'Umkehraufgaben',name:'Anteil im Text',desc:'Gib den Anteil aus einer Textaufgabe so weit wie möglich gekürzt an.',notes:['M3'],size:5,
  gen(level,R){
    const [p,q]=uFrac(R,level===1?2:3,level===1?8:17),g=level===1?R.int(2,5):R.int(6,15);
    return {type:'U05',level,text:R.int(0,U05_TEXT.length-1),total:q*g,part:p*g,p,q,g,avoid:[redKey(p,q)]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},U05_TEXT[t.text](t.total,t.part)),el('p',{class:'q'},'Welcher Anteil ist das? Gib den Bruch so weit wie möglich gekürzt an.'));},
  render(view,host){host.append(eq('Anteil =',fracInput(view,'r')));},
  validate(t,d){
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const m={'r.n':f.n===t.p,'r.d':f.d===t.q};
    if(f.n===t.p&&f.d===t.q)return right(`Richtig! ${t.part} : ${t.g} = ${t.p} und ${t.total} : ${t.g} = ${t.q}.`);
    if(f.n===t.total&&f.d===t.part)return wrong('swap','Der Teil steht oben, das Ganze unten.',m);
    if(equivalent(t.part,t.total,f.n,f.d))return soft('notFull','Der Wert stimmt. Kürze noch so weit wie möglich.',m);
    return wrong('other','Der Anteil ist Teil durch Ganzes. Kürze danach den Bruch.',m);
  },
  solution(t){return [line(`Der Teil ist ${t.part}, das Ganze ist ${t.total}.`),eq(frac(t.part,t.total),'=',frac(t.part+' : '+t.g,t.total+' : '+t.g),'=',frac(t.p,t.q))];}
};

/* ---------- U06 Zwei Schritte prüfen ---------- */
/* a/b → (Schritt 1: mal k) → c/d → (Schritt 2: mal m oder durch m) → e/f; genau eine Zeile ist falsch.
   Ein Fehler in Zeile 1 läuft in Zeile 2 weiter (Folgefehler): Zeile 2 rechnet richtig mit dem gezeigten Bruch. */
TASKS.U06={area:'Umkehraufgaben',name:'Zwei Schritte prüfen',desc:'Finde die falsche Zeile und berichtige sie.',notes:['M2','M3'],size:5,
  gen(level,R){ /* alle Zahlen höchstens 300 */
    for(let tries=0;tries<80;tries++){const t=TASKS.U06.build(level,R);if(Math.max(t.a,t.b,t.c,t.d,t.e,t.f,...t.right1,...t.right2)<=300)return t;}
    return TASKS.U06.build(1,R);
  },
  build(level,R){
    const [a,b]=uFrac(R,2,level===1?7:13),k=R.int(2,level===1?4:7),err=R.pick([1,2]),type1=R.pick(['onlyNum','onlyDen','add']);
    let op='x',m;
    if(err===2&&level===2&&R.chance(0.5)){const ds=[2,3,4,5,6,7].filter(x=>k%x===0);if(ds.length){op='d';m=R.pick(ds);}}
    if(op==='x')m=R.int(2,level===1?3:5);
    const bad=(n,dn,x)=>type1==='onlyNum'?[n*x,dn]:type1==='onlyDen'?[n,dn*x]:[n+x,dn+x];
    const right1=[a*k,b*k];
    let c=right1[0],d=right1[1],e,f;
    if(err===1)[c,d]=bad(a,b,k);
    const right2=op==='x'?[c*m,d*m]:[c/m,d/m];
    if(err===2)[e,f]=bad(right2[0],right2[1],op==='x'?m:2);else[e,f]=right2;
    return {type:'U06',level,a,b,k,op,m,type1,err,c,d,e,f,right1,right2:err===2?right2:right2,avoid:[redKey(a,b)]};
  },
  prompt(t,h){
    h.append(el('p',{class:'q'},'Eine der zwei Zeilen ist falsch.'),
      el('div',{class:'wrongclaim'},
        eq('1.',frac(t.a,t.b),'=',frac(t.a+' · '+t.k,t.b+' · '+t.k),'=',frac(t.c,t.d)),
        eq('2.',frac(t.c,t.d),'=',frac(t.c+(t.op==='x'?' · ':' : ')+t.m,t.d+(t.op==='x'?' · ':' : ')+t.m),'=',frac(t.e,t.f))));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    const stg=twoStage(view,host,{isDone:()=>!!d.s,summary:()=>'1. Falsch ist Zeile '+d.s});
    stg.box1.append(el('p',null,strong('1. Welche Zeile ist falsch?')));
    const row=el('div',{class:'yesno'});
    [[1,'Zeile 1'],[2,'Zeile 2']].forEach(([v,label])=>{
      const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.s===v)},label);
      b.disabled=view.locked();
      b.addEventListener('click',()=>{if(view.locked())return;d.s=v;view.save();row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stg.advance();});
      view.inputs['s'+v]=b;row.append(b);
    });
    stg.box1.append(row);
    stg.box2.append(el('p',null,strong('2. Wie lautet die richtige Zeile?')),eq('=',fracInput(view,'r')));
    stg.upd();
  },
  validate(t,d){
    if(!d.s)return invalid('Wähle zuerst die falsche Zeile.');
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const want=t.err===1?t.right1:t.right2,fixOk=f.n===want[0]&&f.d===want[1],stepOk=d.s===t.err,m={'r.n':f.n===want[0],'r.d':f.d===want[1]};
    if(stepOk&&fixOk)return right(t.err===1?`Richtig! In Zeile 1 muss ${t.a} · ${t.k} = ${t.a*t.k} und ${t.b} · ${t.k} = ${t.b*t.k} stehen.`:`Richtig! Zeile 2 ergibt oben ${want[0]} und unten ${want[1]}.`);
    if(!stepOk)return wrong('step','Prüfe die Zeilen der Reihe nach. Rechne jede Zeile mit beiden Zahlen nach.',m);
    return wrong('fix','Die Zeile stimmt. Berichtige sie noch einmal: Rechne Zähler und Nenner einzeln.',m);
  },
  solution(t){
    const w=t.err===1?t.right1:t.right2;
    return [line(strong('Falsch ist Zeile '+t.err+'. '),t.type1==='add'?'Es wurde addiert statt multipliziert.':t.type1==='onlyNum'?'Nur der Zähler wurde verändert.':'Nur der Nenner wurde verändert.'),
      t.err===1?eq(frac(t.a,t.b),'=',frac(t.a+' · '+t.k,t.b+' · '+t.k),'=',frac(w[0],w[1])):eq(frac(t.c,t.d),'=',frac(t.c+(t.op==='x'?' · ':' : ')+t.m,t.d+(t.op==='x'?' · ':' : ')+t.m),'=',frac(w[0],w[1]))];
  }
};

/* ---------- Einstreuen ---------- */
/* Plätze einer Runde (round.mix: je Aufgabe null, 'U04', 'U05' oder 'U06'); die erste Aufgabe bleibt eine gewohnte */
function mixSlots(round,level,id,R){
  if(round.mix)return round.mix;
  const size=round.size||5,slots=Array(size).fill(null),free=R.shuffle(Array.from({length:size-1},(_,i)=>i+1));
  const stands=['G02','G03','G04','G05'].includes(id),transfer=level===2&&['G03','G04','U01','U02','U03'].includes(id);
  if(stands){const n=transfer&&['G03','G04'].includes(id)?1:R.pick([1,2]);for(let i=0;i<n&&free.length;i++)slots[free.shift()]='U04';}
  if(transfer&&free.length)slots[free.shift()]=R.pick(['U05','U06']);
  round.mix=slots;return slots;
}
['G02','G03','G04','G05','U01','U02','U03'].forEach(id=>{
  const T=TASKS[id],gen=T.gen;
  T.ctx=function(round,level){return {mix:mixSlots(round,level||1,id,RNG)[round.results.length]||null};};
  T.gen=function(level,R,ctx){
    if(ctx&&ctx.mix&&TASKS[ctx.mix])return TASKS[ctx.mix].gen(level,R);
    return gen.call(this,level,R,null);
  };
});
