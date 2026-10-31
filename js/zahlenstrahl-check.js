'use strict';
/* =====================================================================
   Eingangstest und Abschlusscheck zum Zahlenstrahl: ZQ (15 Fragen: 5 Fähigkeiten à 3)
   Wie Q00 (quickcheck.js) nur Antipp-Fragen (A–D oder Ja/Nein), jetzt mit Zahlenstrahl-Bild; jede Frage trägt ein skill-Etikett.
   3 von 3 richtig = „sitzt“: die Bauteile der Fähigkeit sind im Modus „Selbst aussuchen“ offen (stations).
   Bilder liegen als Daten in t.fig {from,to,parts,marks,labels} oder {uneven:{m,k,shift}}.
   ===================================================================== */
const ZQ_SKILLS=['einteilung','ablesen','anpassen','mehrere','einheit'];
const ZQ_NAMES={einteilung:'Einteilung erkennen',ablesen:'Ablesen und Eintragen',anpassen:'Einteilung und Bruch anpassen',mehrere:'Mehrere Brüche',einheit:'Einheit und Brüche über 1'};
QCHK.ZQ={skills:ZQ_SKILLS,names:ZQ_NAMES,
  stations:{einteilung:['Z01'],ablesen:['Z02','Z03'],anpassen:['Z04','Z05'],mehrere:['Z06'],einheit:['Z07','Z08']},allSure:[],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Die Erklärungen helfen dir beim Start.'};
const ZQ_KINDS={einteilung:['count','isN','even'],ablesen:['read','place'],anpassen:['parts','fits','expand'],mehrere:['common','fitsAll'],einheit:['unit','between','mixed','nat']};
const ZQ_NOTES={count:['M8'],isN:['M8'],even:['M8'],read:['M8'],place:['M8'],parts:['M9','M8'],fits:['M9','M10'],expand:['M9','M2'],common:['M10','M9'],fitsAll:['M10'],unit:['M8'],between:['M8','M6'],mixed:['M6','M8'],nat:['M8']};
const ZQ_HINT={
  count:['Zähle die Abschnitte zwischen den Strichen, nicht die Striche.'],
  isN:['Zähle die Abschnitte zwischen 0 und 1. Striche zählen nicht.'],
  even:['Vergleiche die Abstände zwischen je zwei Strichen.'],
  read:['Der Nenner zählt die Abschnitte eines Ganzen, der Zähler die Abschnitte von 0 bis zum Punkt.'],
  place:['Zähle so viele Abschnitte von 0 aus, wie der Zähler sagt.'],
  parts:['Der Nenner sagt, in wie viele Abschnitte ein Ganzes geteilt wird.'],
  fits:['Geht der Nenner des Bruchs in die Zahl der Teile auf?'],
  expand:['Erweitere den Bruch so, dass der Nenner zur Einteilung passt. Zähler und Nenner mit derselben Zahl.'],
  common:['Jeder Nenner muss in die Zahl der Teile aufgehen. Suche ein gemeinsames Vielfaches.'],
  fitsAll:['Prüfe jeden Nenner einzeln: Geht er in die Zahl der Teile auf?'],
  unit:['Ein Ganzes ist die Strecke von 0 bis 1, nicht der ganze Strahl.'],
  between:['Wie viele Ganze passen in den Bruch? Teile den Zähler durch den Nenner.'],
  mixed:['Teile den Zähler durch den Nenner. Der Rest wird der neue Zähler.'],
  nat:['Ein Bruch ist eine natürliche Zahl, wenn der Zähler ohne Rest durch den Nenner teilbar ist.']
};
const zqF=(n,d)=>n+'/'+d;
/* Vier Antworten A–D aus der richtigen und Fallen; key(o) muss je Antwort verschieden sein; null, wenn zu wenige Fallen da sind */
function zqOpts4(R,right,cands,key){
  const seen=new Set([key(right)]),dist=[];
  for(const c of R.shuffle(cands)){const k=key(c);if(!seen.has(k)){seen.add(k);dist.push(c);if(dist.length===3)break;}}
  if(dist.length<3)return null;
  const all=R.shuffle([right].concat(dist)),opts=all.map((o,i)=>Object.assign({},o,{id:Q_LETTERS[i]}));
  return {opts,answer:opts[all.indexOf(right)].id};
}
/* Zahlen als Antworten: ok(x) schließt falsche „Fallen“ aus (z. B. ein weiteres Vielfaches des Nenners) */
function zqNums(R,ans,cand,ok,lo,hi){
  const good=(x)=>Number.isInteger(x)&&x>=lo&&x<=hi&&x!==ans&&ok(x);
  const list=cand.filter(good);
  for(let s=1;s<30;s++){[ans+s,ans-s].forEach(x=>{if(good(x))list.push(x);});}
  const r=zqOpts4(R,{txt:String(ans)},list.map(x=>({txt:String(x)})),o=>o.txt);
  return r&&Object.assign(r,{optNums:r.opts.map(o=>+o.txt)});
}
const zqLetterOpts=(n)=>Array.from({length:n},(_,i)=>({id:Q_LETTERS[i],txt:'Punkt '+Q_LETTERS[i]}));
/* n verschiedene Strichnummern im Strahl (nicht auf ganzen Zahlen), darunter must; Reihenfolge zufällig */
function zqPoints(R,n,steps,m,must){
  const pool=[];for(let i=1;i<steps;i++)if(i%m!==0&&!must.includes(i))pool.push(i);
  const extra=R.shuffle(pool).slice(0,n-must.length);
  return extra.length===n-must.length?R.shuffle(must.concat(extra)):null;
}
const zqPick=(R,level,a,b)=>R.pick(level===1?a:b);

/* --- Einteilung erkennen --- */
function zqCount(level,R){
  for(let g=0;g<100;g++){
    const u=level===1?1:R.pick([1,2,3]),m=R.pick([3,4,5,6,8].filter(x=>u*x<=12));
    const r=zqNums(R,m,[m+1,m-1,u*m,u*m+1,m+2],()=>true,2,24);
    if(!r)continue;
    return Object.assign({kind:'count',skill:'einteilung',u,m,fig:{from:0,to:u,parts:m},
      why:`Ein Ganzes ist in ${m} Abschnitte geteilt. Die ${m+1} Striche zählen nicht, nur die Abschnitte.`},r);
  }
  throw new Error('zqCount');
}
function zqIsN(level,R){
  const p=R.pick(level===1?[3,4,5,6]:[3,4,5,6,8]),yes=R.chance(0.5);
  const n=yes?p:R.pick([p+1,p-1,p+2].filter(x=>x>=2));
  return {kind:'isN',skill:'einteilung',p,n,fig:{from:0,to:1,parts:p},answer:yes?'ja':'nein',
    why:yes?`Zwischen 0 und 1 liegen ${p} Abschnitte.`:`Zwischen 0 und 1 liegen ${p} Abschnitte (und ${p+1} Striche), nicht ${n}.`};
}
function zqEven(level,R){
  const m=R.pick([4,5,6,7,8]),yes=R.chance(0.5),k=R.int(1,m-1),shift=R.pick([-0.35,0.35]);
  return {kind:'even',skill:'einteilung',m,fig:yes?{from:0,to:1,parts:m}:{uneven:{m,k,shift}},answer:yes?'ja':'nein',
    why:yes?'Alle Abschnitte sind gleich breit.':'Ein Strich sitzt nicht in der Mitte zwischen seinen Nachbarn. Die Abschnitte sind verschieden breit.'};
}

/* --- Ablesen und Eintragen --- */
function zqRead(level,R){
  for(let g=0;g<100;g++){
    const u=level===1?R.pick([1,1,2]):R.pick([1,2,3]),m=R.pick((level===1?[3,4,5,6,8]:[3,4,5,6,8,10]).filter(x=>u*x<=12)),steps=u*m; /* auch Strahl bis 2: unechte Brüche */
    const i=R.int(1,steps-1);if(i%m===0)continue;
    const right={f:[i,m],txt:zqF(i,m)};
    const cands=[[i,m+1],[i+1,m],[i-1,m],[i,steps],[i,m-1],[i+1,m+1]].filter(x=>x[0]>=1&&x[1]>=2).map(x=>({f:x,txt:zqF(x[0],x[1])}));
    const r=zqOpts4(R,right,cands,o=>o.txt);
    if(!r)continue;
    return Object.assign({kind:'read',skill:'ablesen',u,m,idx:i,fig:{from:0,to:u,parts:m,marks:[{i,text:'A'}]},
      why:`Ein Ganzes hat ${m} Abschnitte (Nenner ${m}). Bis zum Punkt A sind es ${i} Abschnitte (Zähler ${i}).`},r);
  }
  throw new Error('zqRead');
}
function zqPlace(level,R){
  for(let g=0;g<100;g++){
    const u=level===1?R.pick([1,1,2]):R.pick([1,2,3]),m=R.pick((level===1?[3,4,5,6,8]:[3,4,5,6,8,10]).filter(x=>u*x<=12)),steps=u*m; /* auch Strahl bis 2: unechte Brüche */
    const n=R.int(1,steps-1);if(n%m===0)continue;
    const near=[n+1,n-1].filter(x=>x>=1&&x<steps&&x%m!==0);
    const pts=zqPoints(R,4,steps,m,[n].concat(near.slice(0,2)));
    if(!pts)continue;
    const letterOf=Q_LETTERS[pts.indexOf(n)];
    return {kind:'place',skill:'ablesen',u,m,n,fig:{from:0,to:u,parts:m,marks:pts.map((i,k)=>({i,text:Q_LETTERS[k]}))},
      opts:zqLetterOpts(4),optNums:[],answer:letterOf,
      why:`${zqF(n,m)}: ein Ganzes hat ${m} Abschnitte, der Punkt liegt nach ${n} Abschnitten von 0 aus. Das ist Punkt ${letterOf}.`};
  }
  throw new Error('zqPlace');
}

/* --- Einteilung und Bruch anpassen --- */
function zqParts(level,R){
  for(let g=0;g<100;g++){
    const d=R.pick(level===1?[3,4,5,6,8]:[4,5,6,7,8,9,10,12]),n=R.chance(0.25)?R.int(d+1,2*d-1):R.int(1,d-1);
    const r=zqNums(R,d,[d+1,d-1,d+2,d-2,n,n+1],x=>x%d!==0,2,24);
    if(!r)continue;
    return Object.assign({kind:'parts',skill:'anpassen',n,d,why:`Der Nenner ${d} sagt: ${d} Abschnitte je Ganzem. Dann zählst du ${n} Abschnitte ab 0.`},r);
  }
  throw new Error('zqParts');
}
function zqFits(level,R){
  const want=R.chance(0.5); /* etwa je zur Hälfte Ja und Nein */
  for(let g=0;g<200;g++){
    const m=R.pick(level===1?[4,6,8,10]:[4,6,8,9,10,12]),d=R.pick(level===1?[2,3,4,5]:[2,3,4,5,6,8,9]),n=(m<=6&&R.chance(0.25))?R.int(d+1,2*d-1):R.int(1,d-1);
    if(gcd(n,d)!==1||d===m)continue;
    const yes=fitsDivision(d,m);
    if(yes!==want&&g<150)continue;
    return {kind:'fits',skill:'anpassen',n,d,m,fig:{from:0,to:n>d?2:1,parts:m},answer:yes?'ja':'nein',
      why:yes?`${d} geht in ${m} auf: ${zqF(n,d)} = ${zqF(n*m/d,m)} liegt genau auf einem Strich.`:`${d} geht nicht in ${m} auf: ${zqF(n,d)} liegt zwischen zwei Strichen.`};
  }
  throw new Error('zqFits');
}
function zqExpand(level,R){
  for(let g=0;g<100;g++){
    const b=R.pick(level===1?[2,3,4,5,6]:[3,4,5,6,8]),k=R.pick([2,3,4,5].filter(x=>b*x<=(level===1?12:24))),a=R.chance(0.25)?R.int(b+1,2*b-1):R.int(1,b-1),m=b*k,ans=a*k;
    const r=zqNums(R,ans,[a,a+(m-b),m,a*(k+1),a*(k-1),ans+1,ans-1],()=>true,1,60);
    if(!r)continue;
    return Object.assign({kind:'expand',skill:'anpassen',a,b,m,k,why:`${b} · ${k} = ${m}, also auch den Zähler mal ${k}: ${a} · ${k} = ${ans}.`},r);
  }
  throw new Error('zqExpand');
}

/* --- Mehrere Brüche --- */
function zqFracsOf(R,ds){return ds.map(d=>{let n;do{n=R.int(1,d-1);}while(gcd(n,d)!==1);return [n,d];});}
function zqCommon(level,R){
  for(let g=0;g<100;g++){
    const ds=R.pick(level===1?NL_SETS1:NL_SETS2),l=commonDenominator(ds);
    const r=zqNums(R,l,[Math.max(...ds),ds.reduce((a,x)=>a+x,0),l-2,l+2,l-1,l+1,Math.max(...ds)*2,Math.min(...ds)*3],x=>x%l!==0,2,24);
    if(!r)continue;
    return Object.assign({kind:'common',skill:'mehrere',ds,l,fr:zqFracsOf(R,ds),
      why:`Alle Nenner (${ds.join(', ')}) müssen in die Zahl der Teile aufgehen. Die kleinste solche Zahl ist ${l}.`},r);
  }
  throw new Error('zqCommon');
}
function zqFitsAll(level,R){
  for(let g=0;g<100;g++){
    const ds=R.pick(level===1?NL_SETS1:NL_SETS2),l=commonDenominator(ds),yes=R.chance(0.5);
    const m=yes?l*R.pick(l*2<=24?[1,1,2]:[1]):R.pick([l-2,l+2,l-1,l+1,Math.max(...ds),Math.max(...ds)+2,l/2].filter(x=>Number.isInteger(x)&&x>=2&&x<=24&&x%l!==0));
    if(!m)continue;
    const bad=ds.find(d=>m%d!==0);
    return {kind:'fitsAll',skill:'mehrere',ds,m,fr:zqFracsOf(R,ds),answer:yes?'ja':'nein',
      why:yes?`Alle Nenner (${ds.join(', ')}) gehen in ${m} auf.`:`Der Nenner ${bad} geht nicht in ${m} auf. Die Einteilung passt nicht für alle Brüche.`};
  }
  throw new Error('zqFitsAll');
}

/* --- Einheit und Brüche über 1 --- */
function zqUnit(level,R){
  for(let g=0;g<150;g++){
    const q=R.pick(level===1?[2,3,4]:[2,3,4,5]),N=R.pick([2,3,4].filter(x=>x*q<=12)),p=R.int(1,q-1),steps=N*q;
    const trap=p*N;
    const must=[p].concat(trap!==p&&trap<steps&&trap%q!==0?[trap]:[]);
    const pts=zqPoints(R,4,steps,q,must);
    if(!pts)continue;
    const letterOf=Q_LETTERS[pts.indexOf(p)];
    return {kind:'unit',skill:'einheit',q,N,p,fig:{from:0,to:N,parts:q,labels:'ends',marks:pts.map((i,k)=>({i,text:Q_LETTERS[k]}))},
      opts:zqLetterOpts(4),optNums:[],answer:letterOf,
      why:`Ein Ganzes geht von 0 bis 1 und hat ${q} Abschnitte. ${zqF(p,q)} liegt nach ${p} Abschnitten von 0 aus: Punkt ${letterOf}.`};
  }
  throw new Error('zqUnit');
}
function zqBetween(level,R){
  for(let g=0;g<100;g++){
    const d=R.pick(level===1?[2,3,4,5]:[3,4,5,6,8]),u=level===1?R.pick([2,3]):R.pick([3,4,5]),n=R.int(d+1,u*d-1);
    if(n%d===0)continue;
    const w=Math.floor(n/d),txt=(a)=>a+' und '+(a+1);
    const cands=[w-1,w+1,w+2,w-2].filter(a=>a>=0).map(a=>({txt:txt(a)}));
    const r=zqOpts4(R,{txt:txt(w)},cands,o=>o.txt);
    if(!r)continue;
    return Object.assign({kind:'between',skill:'einheit',n,d,w,optNums:[],why:`${n} : ${d} = ${w} Rest ${n%d}. Also liegt ${zqF(n,d)} zwischen ${w} und ${w+1}.`},r);
  }
  throw new Error('zqBetween');
}
function zqMixed(level,R){
  for(let g=0;g<100;g++){
    const d=R.pick(level===1?[2,3,4,5]:[3,4,5,6,8]),u=level===1?R.pick([2,3]):R.pick([3,4,5]),n=R.int(d+1,u*d-1);
    if(n%d===0)continue;
    const w=Math.floor(n/d),rest=n%d,mk=(a,b,c)=>({mx:[a,b,c],txt:a+' '+b+'/'+c});
    const cands=[mk(w+1,rest,d),mk(w,d-rest,d),mk(w,rest,d+1)];
    if(w<d)cands.push(mk(rest,w,d));
    const r=zqOpts4(R,mk(w,rest,d),cands,o=>o.txt);
    if(!r)continue;
    return Object.assign({kind:'mixed',skill:'einheit',n,d,w,rest,optNums:[],why:`${n} : ${d} = ${w} Rest ${rest}. Also ${zqF(n,d)} = ${w} und ${zqF(rest,d)}. Der Nenner bleibt gleich.`},r);
  }
  throw new Error('zqMixed');
}
function zqNat(level,R){
  const d=R.pick(level===1?[2,3,4,5,6]:[3,4,6,8,9,12]),yes=R.chance(0.5);
  const n=yes?d*R.int(1,level===1?3:6):d*R.int(1,level===1?3:5)+R.int(1,d-1);
  return {kind:'nat',skill:'einheit',n,d,answer:yes?'ja':'nein',
    why:yes?`${n} : ${d} = ${n/d}, es bleibt kein Rest. ${zqF(n,d)} ist die natürliche Zahl ${n/d}.`:`${n} : ${d} = ${Math.floor(n/d)} Rest ${n%d}. ${zqF(n,d)} ist keine natürliche Zahl.`};
}
const ZQ_GEN={count:zqCount,isN:zqIsN,even:zqEven,read:zqRead,place:zqPlace,parts:zqParts,fits:zqFits,expand:zqExpand,common:zqCommon,fitsAll:zqFitsAll,unit:zqUnit,between:zqBetween,mixed:zqMixed,nat:zqNat};

function zqFig(f){
  if(f.uneven)return nlDrawUneven(f.uneven.m,f.uneven.k,f.uneven.shift);
  return drawNumberLine({from:f.from||0,to:f.to,parts:f.parts,labels:f.labels||'wholes',marks:f.marks||[],maxW:460,label:'Zahlenstrahl'});
}
const ZQUICK={
  quick:true,
  notes:['M8','M9','M10'],
  notesFor(t){return (t&&ZQ_NOTES[t.kind])||['M8','M9','M10'];},
  prompt(t,h){
    const f=(n,d)=>frac(n,d),list=(fr)=>fr.map((x,i)=>[i?', ':'',f(x[0],x[1])]);
    let c;
    switch(t.kind){
      case 'count':c=[t.u===1?'In wie viele gleich große Abschnitte ist die Strecke von 0 bis 1 geteilt?':'In wie viele gleich große Abschnitte ist ein Ganzes geteilt?'];break;
      case 'isN':c=['Ist die Strecke von 0 bis 1 in genau ',strong(t.n),' gleich große Abschnitte geteilt?'];break;
      case 'even':c=['Sind alle Abschnitte zwischen 0 und 1 gleich groß?'];break;
      case 'read':c=['Welcher Bruch gehört zum Punkt A?'];break;
      case 'place':c=['Welcher Punkt gehört zu ',f(t.n,t.m),'?'];break;
      case 'parts':c=['Du willst ',f(t.n,t.d),' eintragen. In wie viele Abschnitte teilst du ein Ganzes?'];break;
      case 'fits':c=['Liegt ',f(t.n,t.d),' bei ',strong(t.m),' Teilen je Ganzem genau auf einem Strich?'];break;
      case 'expand':c=['Der Strahl hat ',strong(t.m),' Abschnitte je Ganzem. Welche Zahl fehlt? ',f(t.a,t.b),' = ',f('?',t.m)];break;
      case 'common':c=['Welche Einteilung (Teile je Ganzem) passt für ',...list(t.fr),'?'];break;
      case 'fitsAll':c=['Passt eine Einteilung mit ',strong(t.m),' Teilen je Ganzem für ',...list(t.fr),'?'];break;
      case 'unit':c=['Welcher Punkt gehört zu ',f(t.p,t.q),'?'];break;
      case 'between':c=['Zwischen welchen ganzen Zahlen liegt ',f(t.n,t.d),'?'];break;
      case 'mixed':c=['Wie schreibst du ',f(t.n,t.d),' als gemischte Zahl?'];break;
      default:c=['Ist ',f(t.n,t.d),' eine natürliche Zahl?'];
    }
    h.append(el('p',{class:'q'},...c));
  },
  render(view,host){
    const t=view.task;
    if(t.fig)host.append(el('figure',{class:'fig nlq'},zqFig(t.fig)));
    qOptions(view,host,t);
  },
  validate:QUICK.validate,
  solution:QUICK.solution,
  hints(t){return [['Lies die Frage genau.'],ZQ_HINT[t.kind]];}
};
function zqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(ZQ_SKILLS),kind=R.pick(ZQ_KINDS[skill]);
  return Object.assign({type:'ZQ',level,avoid:[]},ZQ_GEN[kind](level,R));
}
TASKS.ZQ=Object.assign({area:'Zahlenstrahl',name:'Eingangstest',desc:ZQ_SKILLS.length*Q_PER_SKILL+' Blitzfragen zum Antippen – ohne Zeitdruck.',size:ZQ_SKILLS.length*Q_PER_SKILL,
  gen:zqGen,
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,ZQ_SKILLS,Q_PER_SKILL);
    return {skill:round.plan[round.results.length%round.plan.length]};
  }},ZQUICK);
