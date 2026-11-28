'use strict';
/* =====================================================================
   Eingangstest HQ und Abschlusscheck HA zum Thema „Ungleichnamige Brüche addieren und subtrahieren“ (Konzept Kap. 12 und 13)
   HQ: 15 Antipp-Fragen (A–D, Ja/Nein, „Weiß ich nicht“), 5 Fähigkeiten à 3, ohne Tipps und ohne Zeitdruck; jede Frage enthält eine typische Falle.
   3 von 3 richtig = „sitzt“. H02 hängt an zwei Fähigkeiten (Hauptnenner und Erweitern): Die Station sitzt erst, wenn beide sitzen (path.js).
   HA: 10 Antipp-Fragen (2 je Fähigkeit) + 5 Rechenaufgaben (Hauptnenner und erweitern, 2× addieren, 2× subtrahieren, einmal davon ergänzen).
   Urkunde ab 12 Punkten und nach allen Pflichtstationen H02–H07. Zahlen wie Leicht (Hauptnenner bis 36), Knifflig bis 100; Ergebnisse immer gekürzt.
   ===================================================================== */
const HQ_SKILLS=['groesse','hn','erw','plus','minus'];
const HQ_NAMES={groesse:'Größe schätzen',hn:'Hauptnenner finden',erw:'Erweitern',plus:'Addieren',minus:'Subtrahieren'};
QCHK.HQ={skills:HQ_SKILLS,names:HQ_NAMES,
  stations:{groesse:[],hn:['H02'],erw:['H02'],plus:['H03','H04'],minus:['H03','H06']},allSure:['H07'],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Das Bruchlabor hilft dir beim Start.'};
const HQ_KINDS={groesse:['stimmtYN','bereich'],hn:['hnWahl','hnYN'],erw:['erwFehlt'],plus:['plusWahl'],minus:['minusWahl','minusYN']};
const HQ_NOTES={stimmtYN:['M20'],bereich:['M20'],hnWahl:['M19'],hnYN:['M19'],erwFehlt:['M19','M2'],plusWahl:['M20'],minusWahl:['M20'],minusYN:['M20']};
const HQ_HINT={
  stimmtYN:['Wird das Ergebnis beim Zusammenfügen größer als jeder Bruch?'],
  bereich:['Vergleiche jeden Bruch mit 1/2.'],
  hnWahl:['Trick 17: Prüfe die Vielfachen des größeren Nenners.'],
  hnYN:['Passen beide Nenner ohne Rest hinein? Gibt es eine kleinere Zahl?'],
  erwFehlt:['Womit wurde der Nenner malgenommen? Nimm den Zähler genauso mal.'],
  plusWahl:['Erweitere beide Brüche auf den Hauptnenner. Addiere dann die Zähler.'],
  minusWahl:['Erweitere beide Brüche auf den Hauptnenner. Subtrahiere dann die Zähler.'],
  minusYN:['Rechne mit dem Hauptnenner nach.']
};
const hqNums=(R,level,plus,o)=>hnNums(R,level,plus,Object.assign({step:level===1?2:4},o||{}));
const hqRes=(t)=>simplify(t.res[0],t.res[1]);
/* vier verschiedene Brüche: die richtige Antwort (gekürzt) und Fallen, die nicht gleichwertig sind */
function hqFracOpts(R,right,cands){return rqFracOpts(R,right,cands.filter(c=>c[0]>=1&&c[1]>=2));}

/* --- Größe schätzen --- */
function hqStimmtYN(level,R){
  const t=hqNums(R,level,true),r=hqRes(t),comp=[t.a+t.c,t.b+t.d],ok=!equivalent(comp[0],comp[1],r[0],r[1])&&R.chance(0.5);
  const shown=ok?r:comp,big=compareFrac(t.a,t.b,t.c,t.d)>=0?[t.a,t.b]:[t.c,t.d];
  return {kind:'stimmtYN',skill:'groesse',terms:t.terms,signs:t.signs,shown,answer:ok?'ja':'nein',
    why:ok?`Das stimmt: ${hnProof(Object.assign({level:2},t))}`:`${hnFt(shown)} ist kleiner als ${hnFt(big)}. Zusammen muss es mehr werden.`};
}
function hqBereich(level,R){
  for(let i=0;i<300;i++){
    const t=hqNums(R,level,true,{over:R.chance(0.5)});
    const r=t.res,diff=Math.abs(r[0]-r[1])/r[1];
    if(diff>0.25&&i<200)continue; /* knapp unter oder über 1 */
    const yes=r[0]>r[1];
    return {kind:'bereich',skill:'groesse',terms:t.terms,signs:t.signs,answer:yes?'ja':'nein',
      why:`${hnProof(Object.assign({level:2},t))} Das ist ${yes?'mehr':'weniger'} als 1.`};
  }
  throw new Error('hqBereich');
}
/* --- Hauptnenner finden --- */
function hqHnWahl(level,R){
  for(let i=0;i<300;i++){
    const t=hqNums(R,level,true,{typ:'beide'}),N=t.N,P=t.b*t.d;
    if(P===N&&i<200)continue;
    const g=Math.max(t.b,t.d),cands=[P,t.b+t.d,g,g*(N/g+1),N*2].filter(x=>x!==N&&x>1);
    const r=zqNums(R,N,cands,x=>x!==N,2,400);
    if(!r)continue;
    return Object.assign({kind:'hnWahl',skill:'hn',terms:t.terms,N,why:`Trick 17: ${trick17Steps(t.b,t.d).map(s=>s.v).join(', ')}. ${N} ist das kleinste gemeinsame Vielfache.`},r);
  }
  throw new Error('hqHnWahl');
}
function hqHnYN(level,R){
  const t=hqNums(R,level,true,{typ:'beide'}),N=t.N,P=t.b*t.d,g=Math.max(t.b,t.d),yes=R.chance(0.5);
  const fake=P!==N&&R.chance(0.6)?P:(g*(Math.floor(N/g)+1)%Math.min(t.b,t.d)!==0?g*(Math.floor(N/g)+1):t.b+t.d);
  const x=yes?N:fake;
  return {kind:'hnYN',skill:'hn',terms:t.terms,x,answer:yes?'ja':'nein',
    why:yes?`Beide Nenner passen ohne Rest in ${N}, und es gibt keine kleinere Zahl.`:isCommonDen(x,t.b,t.d)?`${x} ist ein gemeinsamer Nenner, aber nicht der kleinste. Der Hauptnenner ist ${N}.`:`${x} ist kein gemeinsamer Nenner. Der Hauptnenner ist ${N}.`};
}
/* --- Erweitern --- */
function hqErwFehlt(level,R){
  for(let i=0;i<200;i++){
    const t=hqNums(R,level,true,{typ:'beide'}),N=t.N,[a,b]=R.chance(0.5)?t.terms[0]:t.terms[1],k=N/b,ans=a*k;
    if(k<2)continue;
    const r=zqNums(R,ans,[a,a+(N-b),a*(k+1),a*(k-1),ans+1,ans-1,a+k],()=>true,1,200);
    if(!r)continue;
    return Object.assign({kind:'erwFehlt',skill:'erw',a,b,N,why:`${b} · ${k} = ${N}. Also auch der Zähler: ${a} · ${k} = ${ans}.`},r);
  }
  throw new Error('hqErwFehlt');
}
/* --- Addieren und Subtrahieren --- */
function hqPlusWahl(level,R){
  const t=hqNums(R,level,true),r=hqRes(t),N=t.N;
  return Object.assign({kind:'plusWahl',skill:'plus',terms:t.terms,signs:t.signs,why:hnProof(Object.assign({level:2},t))},
    hqFracOpts(R,r,[[t.a+t.c,t.b+t.d],[t.a+t.c,N],[t.a+t.c,Math.max(t.b,t.d)],[t.a*t.c,t.b*t.d],[t.res[0]+1,N]]));
}
function hqMinusWahl(level,R){
  for(let i=0;i<200;i++){
    const t=hqNums(R,level,false),r=hqRes(t),N=t.N,sum=addFrac(t.a,t.b,t.c,t.d);
    const cands=[[t.a-t.c,t.b-t.d],[Math.abs(t.a-t.c),N],[...simplify(sum[0],sum[1])],[t.a-t.c,Math.max(t.b,t.d)],[t.res[0]+1,N]];
    return Object.assign({kind:'minusWahl',skill:'minus',terms:t.terms,signs:t.signs,why:hnProof(Object.assign({level:2},t))},hqFracOpts(R,r,cands));
  }
}
function hqMinusYN(level,R){
  const t=hqNums(R,level,false),r=hqRes(t),ok=R.chance(0.5),sum=simplify(...addFrac(t.a,t.b,t.c,t.d));
  const wrongs=[[Math.max(1,t.a-t.c),t.N],sum].filter(w=>!equivalent(w[0],w[1],r[0],r[1]));
  const shown=ok||!wrongs.length?r:R.pick(wrongs);
  const yes=equivalent(shown[0],shown[1],r[0],r[1]);
  return {kind:'minusYN',skill:'minus',terms:t.terms,signs:t.signs,shown,answer:yes?'ja':'nein',why:(yes?'Das stimmt: ':'Richtig wäre: ')+hnProof(Object.assign({level:2},t))};
}
const HQ_GEN={stimmtYN:hqStimmtYN,bereich:hqBereich,hnWahl:hqHnWahl,hnYN:hqHnYN,erwFehlt:hqErwFehlt,plusWahl:hqPlusWahl,minusWahl:hqMinusWahl,minusYN:hqMinusYN};

const HQUICK={
  quick:true,
  notes:['M19','M20','M21'],
  notesFor(t){return (t&&HQ_NOTES[t.kind])||['M19','M20'];},
  prompt(t,h){
    const f=(x)=>frac(x[0],x[1]);
    let c;
    switch(t.kind){
      case 'stimmtYN':c=['Stimmt die Rechnung?'];break;
      case 'bereich':c=['Ist das Ergebnis größer als 1?'];break;
      case 'hnWahl':c=['Welche Zahl ist der Hauptnenner von ',f(t.terms[0]),' und ',f(t.terms[1]),'?'];break;
      case 'hnYN':c=['Ist ',strong(t.x),' der Hauptnenner von ',f(t.terms[0]),' und ',f(t.terms[1]),'?'];break;
      case 'erwFehlt':c=['Welche Zahl fehlt?'];break;
      case 'plusWahl':case 'minusWahl':c=['Was ist das Ergebnis?'];break;
      default:c=['Stimmt die Rechnung?'];
    }
    h.append(el('p',{class:'q'},...c));
  },
  render(view,host){
    const t=view.task,f=(x)=>frac(x[0],x[1]),blank=()=>el('span',{class:'blank','aria-label':'gesucht'},'?');
    switch(t.kind){
      case 'stimmtYN':case 'minusYN':host.append(hnEqOf(t.terms,t.signs,f(t.shown)));break;
      case 'bereich':host.append(hnEqOf(t.terms,t.signs));break;
      case 'erwFehlt':host.append(eq(frac(t.a,t.b),'=',el('span',{class:'frac',role:'math','aria-label':'gesuchte Zahl durch '+t.N},el('span',{class:'num'},el('span',{class:'blank'},'?')),el('span',{class:'den'},String(t.N)))));break;
      case 'plusWahl':case 'minusWahl':host.append(hnEqOf(t.terms,t.signs,blank()));break;
      default:break;
    }
    qOptions(view,host,t);
  },
  validate:QUICK.validate,
  solution:QUICK.solution,
  hints(t){return [['Lies die Frage genau.'],HQ_HINT[t.kind]];}
};
function hqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(HQ_SKILLS),kinds=HQ_KINDS[skill],kind=(ctx&&ctx.occ!=null)?kinds[ctx.occ%kinds.length]:R.pick(kinds);
  return Object.assign({type:'HQ',level,avoid:[]},HQ_GEN[kind](level,R));
}
TASKS.HQ=Object.assign({area:'Rechnen',name:'Eingangstest',desc:HQ_SKILLS.length*Q_PER_SKILL+' Fragen zum Antippen – ohne Zeitdruck.',size:HQ_SKILLS.length*Q_PER_SKILL,
  gen:hqGen,
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,HQ_SKILLS,Q_PER_SKILL);
    const i=round.results.length%round.plan.length,skill=round.plan[i];
    return {skill,occ:round.plan.slice(0,i).filter(x=>x===skill).length};
  }},HQUICK);

/* ---------- Abschlusscheck HA: 10 Antippfragen (2 je Fähigkeit) + 5 Rechenaufgaben ---------- */
const HA_TAP=10,HA_CALC=[['H02','hnErw'],['H04','plus','viel'],['H04','plus','beide'],['H06','minus'],['H06','ergaenzenText']];
TASKS.HA=proxyOf({area:'Rechnen',name:'Abschlusscheck',desc:HA_TAP+' Aufgaben zum Antippen und '+HA_CALC.length+' zum Rechnen – am Ende des Lernpfads.',
  notes:['M19','M20','M21'],size:HA_TAP+HA_CALC.length,finalTap:HA_TAP,finalLabel:'Zum Rechnen richtig',
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,HQ_SKILLS,2);
    if(!Array.isArray(round.red)||round.red.length!==HA_CALC.length)round.red=hnRedPlan(HA_CALC.map(x=>x[1]),['plus','minus','ergaenzenText']);
    const i=round.results.length;
    return i<HA_TAP?{skill:round.plan[i],slot:i,occ:Math.floor(i/HQ_SKILLS.length)}:{slot:i,red:round.red[i-HA_TAP]};
  },
  gen(level,R,ctx){
    const i=ctx&&ctx.slot!=null?ctx.slot:0;
    if(i<HA_TAP)return TASKS.HQ.gen(level,R,{skill:(ctx&&ctx.skill)||R.pick(HQ_SKILLS),occ:ctx&&ctx.occ});
    const [id,kind,typ]=HA_CALC[i-HA_TAP];
    return TASKS[id].gen(level,R,{kind,typ:typ||null,step:4,red:ctx&&typeof ctx.red==='boolean'?ctx.red:null});
  }
});
