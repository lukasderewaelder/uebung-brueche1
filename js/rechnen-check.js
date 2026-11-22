'use strict';
/* =====================================================================
   Eingangstest RQ zum Thema „Gleichnamige Brüche addieren und subtrahieren“ (15 Fragen: 5 Fähigkeiten à 3)
   Wie Q00, ZQ und WQ nur Antipp-Fragen (A–D, Ja/Nein, „Weiß ich nicht“); jede Frage trägt ein skill-Etikett.
   3 von 3 richtig = „sitzt“: die Stationen der Fähigkeit stehen im Lernpfad mit „Check: sitzt“ (stations).
   Jede Frage enthält eine typische Falle (Nenner addiert, falsches Rechenzeichen, nicht weit genug gekürzt).
   Kürzen: Ob sich das Ergebnis kürzen lässt, ist etwa je zur Hälfte ja und nein; die Fragen verraten es nicht.
   Der Abschlusscheck des Themas ist RA (rechnen.js). Zahlen: Leicht kleine Nenner bis 12, Knifflig bis 36.
   ===================================================================== */
const RQ_SKILLS=['plus','minus','art','kuerzen','fehler'];
const RQ_NAMES={plus:'Addieren',minus:'Subtrahieren',art:'Plus oder minus?',kuerzen:'Ergebnis kürzen',fehler:'Fehler finden'};
QCHK.RQ={skills:RQ_SKILLS,names:RQ_NAMES,
  stations:{plus:['R01','R02'],minus:['R03','R04'],art:['R05'],kuerzen:[],fehler:[]},allSure:[],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Das Bruchlabor hilft dir beim Start.'};
const RQ_KINDS={plus:['plusErg','plusFehlt','zumGanzen'],minus:['minusErg','minusFehlt','vomGanzen'],art:['sZeichen','sErg','sJaNein'],kuerzen:['kRed','kErg','kWeit'],fehler:['fNenner','fStimmt','fWelche']};
const RQ_NOTES={plusErg:['M17'],plusFehlt:['M17'],zumGanzen:['M17'],minusErg:['M18'],minusFehlt:['M18'],vomGanzen:['M18'],
  sZeichen:['M17','M18'],sErg:['M17','M18'],sJaNein:['M17','M18'],kRed:['M3','M17'],kErg:['M3','M17'],kWeit:['M3'],fNenner:['M17','M18'],fStimmt:['M17','M18'],fWelche:['M17','M18']};
const RQ_HINT={
  plusErg:['Die Nenner sind gleich. Rechne nur mit den Zählern.'],
  plusFehlt:['Rechne: Ergebnis-Zähler minus erster Zähler.'],
  zumGanzen:['Ein Ganzes hat so viele Stücke, wie der Nenner angibt.'],
  minusErg:['Die Nenner sind gleich. Rechne nur mit den Zählern.'],
  minusFehlt:['Rechne: erster Zähler minus Ergebnis-Zähler.'],
  vomGanzen:['Schreibe 1 als Bruch mit demselben Nenner.'],
  sZeichen:['Wird etwas zusammengelegt oder weggenommen?'],
  sErg:['Wird etwas dazugegeben oder weggenommen?'],
  sJaNein:['Prüfe zuerst das Rechenzeichen. Dann prüfe die Zähler.'],
  kRed:['Gibt es eine Zahl größer als 1, durch die beide Zahlen teilbar sind?'],
  kErg:['Rechne zuerst. Prüfe dann, ob du kürzen kannst.'],
  kWeit:['Gibt es eine Zahl größer als 1, durch die beide Zahlen teilbar sind?'],
  fNenner:['Vergleiche die Nenner vor und nach der Rechnung.'],
  fStimmt:['Prüfe den Nenner und die Zähler einzeln.'],
  fWelche:['Der Nenner bleibt gleich. Die Zähler werden gerechnet.']
};
const RQ_POOL={1:[4,5,6,7,8,9,10,12],2:[12,15,16,18,20,24,30,36]};
const RQ_SIGN={true:'+',false:'−'};
const rqNums=(R,level,plus,o)=>addNums(R,level,plus,Object.assign({pool:RQ_POOL[level]||RQ_POOL[1]},o||{}));
const rqBlankFrac=(den)=>el('span',{class:'frac',role:'math','aria-label':'gesuchte Zahl durch '+den},el('span',{class:'num'},el('span',{class:'blank'},'?')),el('span',{class:'den'},String(den)));
const rqBlank=()=>el('span',{class:'blank','aria-label':'gesuchter Bruch'},'?');
const rqEqf=(t,end)=>eq(frac(t.a,t.b),RQ_SIGN[t.plus],frac(t.c,t.b),...(end===undefined?[]:['=',end]));

/* Antworten als Brüche: das richtige Ergebnis und Fallen (alle verschieden; eqOk: gleichwertige Fallen sind erlaubt, z. B. ungekürzt) */
function rqFracList(R,right,cands,eqOk){
  const seen=new Set([right.join('/')]),dist=[];
  const ok=(f)=>f[0]>=1&&f[1]>=2&&!seen.has(f.join('/'))&&(eqOk||!equivalent(f[0],f[1],right[0],right[1]));
  for(const c of R.shuffle(cands))if(dist.length<3&&ok(c)){seen.add(c.join('/'));dist.push(c);}
  for(let s=1;dist.length<3&&s<30;s++)for(const x of [[right[0]+s,right[1]],[Math.max(1,right[0]-s),right[1]]])if(dist.length<3&&ok(x)){seen.add(x.join('/'));dist.push(x);}
  return [right].concat(dist);
}
const rqFracOpts=(R,right,cands,eqOk)=>wqOpts(R,rqFracList(R,right,cands,eqOk).map(wqFr),0);
const rqNames2=(R)=>R.shuffle(ADD_NAMES).slice(0,2);

/* --- Addieren --- */
function rqPlusErg(level,R){
  const t=rqNums(R,level,true),n=t.a+t.c,b=t.b;
  return Object.assign({kind:'plusErg',skill:'plus',a:t.a,c:t.c,b,plus:true,
    why:`Der Nenner ${b} bleibt. Die Zähler werden addiert: ${t.a} + ${t.c} = ${n}.`},
    rqFracOpts(R,[n,b],[[n,b+b],[n,b+t.c],[n+1,b],[t.a,b+t.c],[t.a*t.c,b]]));
}
function rqPlusFehlt(level,R){
  for(let g=0;g<100;g++){
    const t=rqNums(R,level,true),n=t.a+t.c,r=zqNums(R,t.c,[n,t.a,t.c+1,t.c-1,n+t.a,t.b-t.a],()=>true,1,99);
    if(!r)continue;
    return Object.assign({kind:'plusFehlt',skill:'plus',a:t.a,c:t.c,b:t.b,n,plus:true,
      why:`Der Nenner bleibt. ${t.a} + ${t.c} = ${n}. Im Zähler fehlt die ${t.c}.`},r);
  }
  throw new Error('rqPlusFehlt');
}
function rqZumGanzen(level,R){
  const b=R.pick(RQ_POOL[level].filter(x=>x>=5)),a=R.int(1,b-1),m=b-a;
  return Object.assign({kind:'zumGanzen',skill:'plus',a,b,m,
    why:`Ein Ganzes sind ${b}/${b}. ${b} − ${a} = ${m}. Es fehlen ${ft(m,b)}.`},
    rqFracOpts(R,[m,b],[[a,b],[m,a],[m+1,b],[1,b],[b,a],[m,b+b]]));
}

/* --- Subtrahieren --- */
function rqMinusErg(level,R){
  const t=rqNums(R,level,false),n=t.a-t.c,b=t.b;
  return Object.assign({kind:'minusErg',skill:'minus',a:t.a,c:t.c,b,plus:false,
    why:`Der Nenner ${b} bleibt. Die Zähler werden subtrahiert: ${t.a} − ${t.c} = ${n}.`},
    rqFracOpts(R,[n,b],[[n,b-t.c],[t.a+t.c,b],[n+1,b],[n,b+b],[n,b+t.c]]));
}
function rqMinusFehlt(level,R){
  for(let g=0;g<100;g++){
    const t=rqNums(R,level,false),n=t.a-t.c,r=zqNums(R,t.c,[t.a+n,n,t.a,t.c+1,t.c-1,t.a+t.c],()=>true,1,99);
    if(!r)continue;
    return Object.assign({kind:'minusFehlt',skill:'minus',a:t.a,c:t.c,b:t.b,n,plus:false,
      why:`Der Nenner bleibt. ${t.a} − ${t.c} = ${n}. Im Zähler fehlt die ${t.c}.`},r);
  }
  throw new Error('rqMinusFehlt');
}
function rqVomGanzen(level,R){
  const b=R.pick(RQ_POOL[level].filter(x=>x>=5)),a=R.int(1,b-1),m=b-a;
  return Object.assign({kind:'vomGanzen',skill:'minus',a,b,m,
    why:`Ein Ganzes sind ${b}/${b}. ${b} − ${a} = ${m}. Es bleiben ${ft(m,b)}.`},
    rqFracOpts(R,[m,b],[[a,b],[m,a],[m+1,b],[1,b],[b,a],[m,b-1]]));
}

/* --- Plus oder minus? --- */
const rqStory=(R,t)=>{
  const [n1,n2]=rqNames2(R),a=t.a,c=t.c,b=t.b;
  return t.plus
    ?{text:`${n1} isst ${a}/${b} einer Pizza. ${n2} isst ${c}/${b} derselben Pizza.`,ask:'Wie viel essen beide zusammen?',claim:(x)=>`Beide essen zusammen ${ft(x[0],x[1])}.`}
    :{text:`In einer Kanne sind ${a}/${b} Liter Saft. ${n1} trinkt ${c}/${b} Liter.`,ask:'Wie viel Saft bleibt in der Kanne?',claim:(x)=>`Es bleiben ${ft(x[0],x[1])} Liter.`};
};
function rqSZeichen(level,R){
  const plus=R.chance(0.5),t=rqNums(R,level,plus),s=rqStory(R,t);
  return Object.assign({kind:'sZeichen',skill:'art',a:t.a,c:t.c,b:t.b,plus,story:s.text,ask:s.ask,
    why:plus?'Die Anteile werden zusammengelegt. Dafür rechnest du plus.':'Ein Anteil wird weggenommen. Dafür rechnest du minus.'},
    wqOpts(R,[{txt:'+'},{txt:'−'},{txt:'·'},{txt:':'}],plus?0:1));
}
function rqSErg(level,R){
  const plus=R.chance(0.5),t=rqNums(R,level,plus),s=rqStory(R,t),n=t.res[0],b=t.b;
  const wrongOp=plus?[Math.abs(t.a-t.c),b]:[t.a+t.c,b];
  return Object.assign({kind:'sErg',skill:'art',a:t.a,c:t.c,b,plus,story:s.text,ask:s.ask,
    why:plus?`Hier wird zusammengelegt: ${t.a} + ${t.c} = ${n}. Es sind ${ft(n,b)}.`:`Hier wird weggenommen: ${t.a} − ${t.c} = ${n}. Es bleiben ${ft(n,b)}.`},
    rqFracOpts(R,[n,b],[wrongOp,[n,b+b],[n+1,b],[Math.max(1,n-1),b],[t.a,b]]));
}
function rqSJaNein(level,R){
  const plus=R.chance(0.5),t=rqNums(R,level,plus),s=rqStory(R,t),n=t.res[0],b=t.b,ok=R.chance(0.5);
  const wrong=plus?(t.a!==t.c&&R.chance(0.6)?[Math.abs(t.a-t.c),b]:[n,b+b]):[t.a+t.c,b];
  const shown=ok?[n,b]:wrong;
  return {kind:'sJaNein',skill:'art',a:t.a,c:t.c,b,plus,story:s.text,ask:s.ask,claim:s.claim(shown),answer:ok?'ja':'nein',
    why:ok?`Das stimmt: ${t.a} ${RQ_SIGN[plus]} ${t.c} = ${n}. Der Nenner ${b} bleibt.`
      :plus?(wrong[1]===b?'Hier wird zusammengelegt. Dafür rechnest du plus, nicht minus.':'Der Nenner bleibt gleich. Er wird nicht addiert.')
        :'Hier wird weggenommen. Dafür rechnest du minus, nicht plus.'};
}

/* --- Ergebnis kürzen (etwa je zur Hälfte kürzbar und nicht kürzbar) --- */
function rqKRed(level,R){
  const plus=R.chance(0.5),red=R.chance(0.5),t=rqNums(R,level,plus,{red}),n=t.res[0],g=gcd(n,t.b);
  return {kind:'kRed',skill:'kuerzen',a:t.a,c:t.c,b:t.b,plus,n,answer:g>1?'ja':'nein',
    why:g>1?`Zähler ${n} und Nenner ${t.b} sind beide durch ${g} teilbar.`:`Es gibt keine Zahl größer als 1, die in ${n} und ${t.b} aufgeht.`};
}
function rqKErg(level,R){
  const plus=R.chance(0.5),red=R.chance(0.5),t=rqNums(R,level,plus,{red}),n=t.res[0],b=t.b,g=gcd(n,b),r=[n/g,b/g];
  const cands=[[n+1,b],[Math.max(1,n-1),b],[t.a,b],[n,b+b]];
  if(g>1){
    cands.push([n,b]);
    const p=qDivisors(g).find(d=>d<g);
    if(p)cands.push([n/p,b/p]);
  }
  return Object.assign({kind:'kErg',skill:'kuerzen',a:t.a,c:t.c,b,plus,n,
    why:g>1?`Zähler und Nenner durch ${g} teilen: ${ft(n,b)} = ${ft(r[0],r[1])}.`:`${ft(n,b)} lässt sich nicht kürzen. Es bleibt ${ft(n,b)}.`},
    rqFracOpts(R,r,cands,g>1));
}
function rqKWeit(level,R){
  const plus=R.chance(0.5);
  if(R.chance(0.5)){
    for(let i=0;i<300;i++){
      const t=rqNums(R,level,plus,{red:true}),n=t.res[0],g=gcd(n,t.b),p=qDivisors(g).find(d=>d<g);
      if(g<4||!p)continue;
      const part=[n/p,t.b/p],full=[n/g,t.b/g];
      return {kind:'kWeit',skill:'kuerzen',a:t.a,c:t.c,b:t.b,plus,n,chain:[[n,t.b],part],answer:'nein',
        why:`Beide Zahlen sind noch durch ${g/p} teilbar: ${ft(part[0],part[1])} = ${ft(full[0],full[1])}.`};
    }
  }
  const t=rqNums(R,level,plus,{red:R.chance(0.5)}),n=t.res[0],g=gcd(n,t.b),full=[n/g,t.b/g];
  return {kind:'kWeit',skill:'kuerzen',a:t.a,c:t.c,b:t.b,plus,n,chain:g>1?[[n,t.b],full]:[[n,t.b]],answer:'ja',
    why:`${full[0]} und ${full[1]} haben keinen gemeinsamen Teiler. Es geht nicht weiter.`};
}

/* --- Fehler finden --- */
function rqFNenner(level,R){
  let plus=R.chance(0.5),t=rqNums(R,level,plus);
  if(!plus&&t.b-t.c<2){plus=true;t=rqNums(R,level,true);}
  const den=plus?t.b+t.b:t.b-t.c;
  return Object.assign({kind:'fNenner',skill:'fehler',a:t.a,c:t.c,b:t.b,plus,n:t.res[0],bad:den,
    why:plus?`Der Nenner wurde addiert. Er bleibt ${t.b}.`:`Der Nenner wurde auch subtrahiert. Er bleibt ${t.b}.`},
    wqOpts(R,[{txt:'Der Nenner darf sich nicht ändern.'},{txt:'Der Zähler wurde falsch gerechnet.'},{txt:'Das Rechenzeichen ist falsch.'},{txt:'Das Ergebnis muss gekürzt werden.'}],0));
}
function rqFStimmt(level,R){
  const plus=R.chance(0.5),ok=R.chance(0.5),t=rqNums(R,level,plus),b=t.b,n=t.res[0];
  let res=[n,b],why;
  if(ok)why=`Der Nenner bleibt, die Zähler werden ${plus?'addiert':'subtrahiert'}. Die Rechnung stimmt.`;
  else if(plus){
    const v=R.pick(['nenner','zaehler']);
    if(v==='nenner'){res=[n,b+b];why='Der Nenner wurde addiert. Er bleibt gleich.';}
    else{res=[n+1,b];why=`Die Zähler ergeben ${t.a} + ${t.c} = ${n}, nicht ${n+1}.`;}
  }else{
    const v=R.pick(['plus','zaehler']);
    if(v==='plus'){res=[t.a+t.c,b];why='Hier steht minus. Die Zähler werden subtrahiert, nicht addiert.';}
    else{res=[n+1,b];why=`Die Zähler ergeben ${t.a} − ${t.c} = ${n}, nicht ${n+1}.`;}
  }
  return {kind:'fStimmt',skill:'fehler',a:t.a,c:t.c,b,plus,res,answer:ok?'ja':'nein',why};
}
function rqFWelche(level,R){
  const plus=R.chance(0.5),t=rqNums(R,level,plus),b=t.b,n=t.res[0];
  const cands=plus?[[n,b+b],[n+1,b],[Math.abs(t.a-t.c),b],[t.a*t.c,b]]:[[n,b-t.c],[t.a+t.c,b],[n+1,b],[Math.max(1,n-1),b]];
  const list=rqFracList(R,[n,b],cands);
  const items=list.map(x=>({pt:[[t.a,b],' '+RQ_SIGN[plus]+' ',[t.c,b],' = ',[x[0],x[1]]],txt:`${t.a}/${b} ${RQ_SIGN[plus]} ${t.c}/${b} = ${x[0]}/${x[1]}`}));
  return Object.assign({kind:'fWelche',skill:'fehler',a:t.a,c:t.c,b,plus,
    why:`Der Nenner ${b} bleibt. ${t.a} ${RQ_SIGN[plus]} ${t.c} = ${n}.`},wqOpts(R,items,0));
}
const RQ_GEN={plusErg:rqPlusErg,plusFehlt:rqPlusFehlt,zumGanzen:rqZumGanzen,minusErg:rqMinusErg,minusFehlt:rqMinusFehlt,vomGanzen:rqVomGanzen,
  sZeichen:rqSZeichen,sErg:rqSErg,sJaNein:rqSJaNein,kRed:rqKRed,kErg:rqKErg,kWeit:rqKWeit,fNenner:rqFNenner,fStimmt:rqFStimmt,fWelche:rqFWelche};

const RQUICK={
  quick:true,
  notes:['M17','M18','M3'],
  notesFor(t){return (t&&RQ_NOTES[t.kind])||['M17','M18'];},
  prompt(t,h){
    const f=(x)=>frac(x[0],x[1]);
    let c;
    switch(t.kind){
      case 'plusErg':case 'minusErg':c=['Was ist das Ergebnis?'];break;
      case 'plusFehlt':case 'minusFehlt':c=['Welche Zahl fehlt im Zähler?'];break;
      case 'zumGanzen':c=['Welcher Bruch fehlt bis zum Ganzen?'];break;
      case 'vomGanzen':c=['Wie viel bleibt von einem Ganzen?'];break;
      case 'sZeichen':c=[t.story+' '+t.ask+' Welches Zeichen fehlt?'];break;
      case 'sErg':c=[t.story+' '+t.ask];break;
      case 'sJaNein':c=[t.story+' '+t.claim+' Stimmt das?'];break;
      case 'kRed':c=['Lässt sich das Ergebnis kürzen?'];break;
      case 'kErg':c=['Rechne und kürze so weit wie möglich.'];break;
      case 'kWeit':c=['Ist der letzte Bruch so weit wie möglich gekürzt?'];break;
      case 'fNenner':c=['Hier hat sich ein Fehler eingeschlichen. Was ist falsch?'];break;
      case 'fStimmt':c=['Stimmt die Rechnung?'];break;
      default:c=['Welche Rechnung ist richtig?'];
    }
    h.append(el('p',{class:'q'},...c));
  },
  render(view,host){
    const t=view.task,f=(x)=>frac(x[0],x[1]);
    switch(t.kind){
      case 'plusErg':case 'minusErg':host.append(rqEqf(t,el('span',{class:'blank','aria-label':'gesuchtes Ergebnis'},'?')));break;
      case 'plusFehlt':case 'minusFehlt':host.append(eq(f([t.a,t.b]),RQ_SIGN[t.plus],rqBlankFrac(t.b),'=',f([t.n,t.b])));break;
      case 'zumGanzen':host.append(eq(f([t.a,t.b]),'+',rqBlank(),'=',strong(1)));break;
      case 'vomGanzen':host.append(eq(strong(1),'−',f([t.a,t.b]),'=',rqBlank()));break;
      case 'sZeichen':host.append(eq(f([t.a,t.b]),el('span',{class:'blank','aria-label':'gesuchtes Zeichen'},'?'),f([t.c,t.b])));break;
      case 'kRed':host.append(rqEqf(t,f([t.n,t.b])));break;
      case 'kErg':host.append(rqEqf(t,rqBlank()));break;
      case 'kWeit':{
        const e=rqEqf(t,f(t.chain[0]));
        t.chain.slice(1).forEach(x=>{e.append(op('='),f(x));});
        host.append(e);break;
      }
      case 'fNenner':host.append(eq(f([t.a,t.b]),RQ_SIGN[t.plus],f([t.c,t.b]),'=',f([t.n,t.bad])));break;
      case 'fStimmt':host.append(rqEqf(t,f(t.res)));break;
      default:break;
    }
    qOptions(view,host,t);
  },
  validate:QUICK.validate,
  solution:QUICK.solution,
  hints(t){return [['Lies die Frage genau.'],RQ_HINT[t.kind]];}
};
function rqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(RQ_SKILLS),kinds=RQ_KINDS[skill],kind=(ctx&&ctx.occ!=null)?kinds[ctx.occ%kinds.length]:R.pick(kinds);
  return Object.assign({type:'RQ',level,avoid:[]},RQ_GEN[kind](level,R));
}
TASKS.RQ=Object.assign({area:'Rechnen',name:'Eingangstest',desc:RQ_SKILLS.length*Q_PER_SKILL+' Fragen zum Antippen – ohne Zeitdruck.',size:RQ_SKILLS.length*Q_PER_SKILL,
  gen:rqGen,
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,RQ_SKILLS,Q_PER_SKILL);
    const i=round.results.length%round.plan.length,skill=round.plan[i];
    return {skill,occ:round.plan.slice(0,i).filter(x=>x===skill).length};
  }},RQUICK);
