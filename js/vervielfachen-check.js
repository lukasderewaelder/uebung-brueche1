'use strict';
/* =====================================================================
   Eingangstest NQ und Abschlusscheck NA der Etappe V „Brüche vervielfachen und teilen“ (Konzept Kap. 3.1 und 3.5)
   NQ: 10 Antipp-Fragen (A–D, Ja/Nein, „Weiß ich nicht“), 5 Fähigkeiten à 2 (wie alle Eingangstests der App, P15):
       Grundlagen (Bild ablesen, wiederholt addieren, gemischte Zahl, erweitern) · Am Bild vervielfachen · Vervielfachen · Teilen · Gemischte Zahlen.
       Jede Frage enthält eine typische Falle aus der Fehlerliste (Kap. 4). 2 von 2 richtig = „sitzt“.
   NA: 10 Antipp-Fragen (2 je Fähigkeit) + 5 Rechenaufgaben (2/7 · 3, 5/8 : 2, mit Kürzen und gemischter Zahl, Zähler geht auf, gemischte Zahl).
       Urkunde ab 12 Punkten und nach allen Pflichtstationen V1–V6.
   ===================================================================== */
const NQ_SKILLS=['grund','bild','mal','teilen','gemischt'];
const NQ_NAMES={grund:'Grundlagen',bild:'Vervielfachen am Bild',mal:'Vervielfachen',teilen:'Teilen',gemischt:'Gemischte Zahlen'};
QCHK.NQ={skills:NQ_SKILLS,names:NQ_NAMES,
  stations:{grund:[],bild:['N01'],mal:['N03'],teilen:['N02','N04'],gemischt:['N05']},allSure:['N06'],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Die Bruch-Maschine hilft dir beim Start.'};
const NQ_KINDS={grund:['bildBruch','wiederholt','umwandeln','erweitern'],bild:['welcheRechnung','groesser1'],mal:['malErg','malWas'],teilen:['teilErg','teilSache'],gemischt:['gemMal','gemDiv']};
const NQ_NOTES={bildBruch:['M23'],wiederholt:['M17'],umwandeln:['M25'],erweitern:['M2'],welcheRechnung:['M26'],groesser1:['M26'],malErg:['M26'],malWas:['M26','M2'],teilErg:['M27'],teilSache:['M27'],gemMal:['M28'],gemDiv:['M28']};
const NQ_HINT={
  bildBruch:['Zähle alle Teile und die gefärbten Teile.'],
  wiederholt:['Die Nenner sind gleich. Rechne nur mit den Zählern.'],
  umwandeln:['Wie oft passt der Nenner ganz in den Zähler?'],
  erweitern:['Beim Erweitern nimmst du Zähler und Nenner mal dieselbe Zahl.'],
  welcheRechnung:['Wie groß ist ein Stück? Wie oft kommt es vor?'],
  groesser1:['Vergleiche den neuen Zähler mit dem Nenner.'],
  malErg:['Beim Vervielfachen bleibt der Nenner gleich.'],
  malWas:['Vergleiche den Wert vorher und nachher.'],
  teilErg:['Beim Teilen wird jedes Stück kleiner.'],
  teilSache:['Gerecht teilen heißt: Jeder bekommt gleich viel.'],
  gemMal:['Nimm die Ganzen und den Bruchteil mal.'],
  gemDiv:['Wandle die gemischte Zahl zuerst in einen Bruch um.']
};
const nqOpts=(R,right,cands)=>rqFracOpts(R,right,cands);
const nqMx=(f)=>{const [x,y]=simplify(f[0],f[1]);return x>y&&y>1?{mx:[Math.floor(x/y),x%y,y],txt:vtShow(x,y)}:{f:[x,y],txt:y===1?String(x):x+'/'+y};};
/* vier Antworten als gemischte Zahlen oder Brüche: die richtige und Fallen (verschiedene Werte) */
function nqMixOpts(R,right,cands){
  const seen=new Set([redKey(right[0],right[1])]),list=[nqMx(right)];
  for(const c of R.shuffle(cands)){if(list.length<4&&c[1]>0&&c[0]>0&&!seen.has(redKey(c[0],c[1]))){seen.add(redKey(c[0],c[1]));list.push(nqMx(c));}}
  for(let s=1;list.length<4&&s<20;s++){const c=[right[0]+s*right[1],right[1]];if(!seen.has(redKey(c[0],c[1]))){seen.add(redKey(c[0],c[1]));list.push(nqMx(c));}}
  return wqOpts(R,list,0);
}
const nqExpr=(o)=>o.pt.map(x=>Array.isArray(x)?x[0]+'/'+x[1]:x).join('');
const nqPt=(pt)=>({pt,txt:nqExpr({pt})});

/* --- Grundlagen --- */
function nqBildBruch(level,R){
  const b=R.pick([5,6,8]),a=R.int(2,b-2);
  return Object.assign({kind:'bildBruch',skill:'grund',a,b,why:`Das Rechteck hat ${b} gleich große Teile. ${a} davon sind gefärbt.`},
    nqOpts(R,[a,b],[[b-a,b],[a,b+a],[b,a],[a,b-a]]));
}
function nqWiederholt(level,R){
  for(let i=0;i<100;i++){const b=R.int(5,12),a=R.int(1,3),n=3;if(a*n>=b||gcd(a,b)!==1)continue;
    return Object.assign({kind:'wiederholt',skill:'grund',a,b,n,why:`Die Nenner sind gleich. Die Zähler werden addiert: ${a} + ${a} + ${a} = ${a*n}.`},
      nqOpts(R,[a*n,b],[[a*n,b*n],[a,b],[a*n+2,b],[a*n,b+n]]));}
  return nqWiederholt(level,RNG);
}
function nqUmwandeln(level,R){
  for(let i=0;i<100;i++){const b=R.int(3,8),w=R.int(2,4),r=R.int(1,b-1);if(gcd(r,b)!==1)continue;const p=w*b+r;
    const list=[{mx:[w,r,b],txt:w+' '+r+'/'+b},{mx:[w-1,r+b,b],txt:(w-1)+' '+(r+b)+'/'+b},{mx:[w,r,p],txt:w+' '+r+'/'+p},{mx:[p,r,b],txt:p+' '+r+'/'+b}];
    return Object.assign({kind:'umwandeln',skill:'grund',p,b,why:`${b} passt ${w}-mal ganz in ${p}. Der Rest ${r} kommt in den Zähler.`},wqOpts(R,list,0));}
  return nqUmwandeln(level,RNG);
}
function nqErweitern(level,R){
  for(let i=0;i<100;i++){const b=R.int(3,9),a=R.int(1,b-1),k=R.int(2,4);if(gcd(a,b)!==1)continue;
    return Object.assign({kind:'erweitern',skill:'grund',a,b,k,why:`Erweitern mit ${k}: Zähler und Nenner mal ${k}. Der Anteil bleibt gleich.`},
      rqFracOpts(R,[a*k,b*k],[[a*k,b],[a,b*k],[b,b*k],[a+k,b+k]],true));}
}
/* --- Vervielfachen am Bild --- */
function nqWelcheRechnung(level,R){
  const t=vtPicNums(R,1,'mul',{over:false}),f=[t.a,t.b];
  const list=[nqPt([f,' · '+t.n]),nqPt([f,' : '+t.n]),nqPt([[t.a*t.n,t.b],' · '+t.n]),nqPt([[t.a,t.b*t.n],' · '+t.n])];
  return Object.assign({kind:'welcheRechnung',skill:'bild',a:t.a,b:t.b,n:t.n,why:`Ein Stück ist ${t.a}/${t.b}. Es liegt ${t.n}-mal da: ${t.a}/${t.b} · ${t.n}.`},wqOpts(R,list,0));
}
function nqGroesser1(level,R){
  for(let i=0;i<300;i++){
    const ts=[vtPicNums(R,2,'mul',{over:true})].concat([0,1,2].map(()=>vtPicNums(R,1,'mul',{over:false})));
    if(ts[0].a*ts[0].n===ts[0].b||ts.slice(1).some(x=>x.a*x.n>=x.b))continue;
    const keys=new Set(ts.map(x=>x.a+'/'+x.b+'·'+x.n));if(keys.size<4)continue;
    const list=ts.map(x=>nqPt([[x.a,x.b],' · '+x.n])),w=ts[0];
    return Object.assign({kind:'groesser1',skill:'bild',why:`${w.a}/${w.b} · ${w.n} = ${w.a*w.n}/${w.b}. Der Zähler ist größer als der Nenner.`},wqOpts(R,list,0));
  }
}
/* --- Vervielfachen --- */
function nqMalErg(level,R){
  const t=vtCalcNums(R,1,'mul',false,{under:true});
  return Object.assign({kind:'malErg',skill:'mal',a:t.a,b:t.b,n:t.n,why:`Der Nenner bleibt. Nur der Zähler wird mal ${t.n} genommen.`},nqOpts(R,[t.a*t.n,t.b],vtMulCands(t)));
}
function nqMalWas(level,R){
  const t=vtCalcNums(R,1,'mul',null),who=R.pick(VT_NAMES);
  const list=[{txt:'Erweitert statt vervielfacht'},{txt:'Richtig gerechnet'},{txt:'Gekürzt'},{txt:'Geteilt'}];
  return Object.assign({kind:'malWas',skill:'mal',a:t.a,b:t.b,n:t.n,who,why:`${t.a*t.n}/${t.b*t.n} ist genauso viel wie ${t.a}/${t.b}. Richtig ist ${t.a*t.n}/${t.b}.`},wqOpts(R,list,0));
}
/* --- Teilen --- */
function nqTeilErg(level,R){
  const t=vtCalcNums(R,1,'div',false);
  return Object.assign({kind:'teilErg',skill:'teilen',a:t.a,b:t.b,n:t.n,why:`Die Teile werden ${t.n}-mal kleiner. Der Nenner wird mal ${t.n} genommen.`},nqOpts(R,[t.a,t.b*t.n],vtDivCands(t)));
}
function nqTeilSache(level,R){
  const b=R.pick([2,3,4,5]),n=2,who=R.shuffle(VT_NAMES).slice(0,2);
  return Object.assign({kind:'teilSache',skill:'teilen',a:1,b,n,who,why:`Jeder bekommt die Hälfte von 1/${b}. Das ist 1/${b*2}.`},nqOpts(R,[1,b*2],[[2,b],[1,b],[2,b*2],[1,b+2]]));
}
/* --- Gemischte Zahlen --- */
function nqGemMal(level,R){
  const t=vtMixNums(R,1,'mul',null),A=t.w*t.b+t.a,res=[A*t.n,t.b];
  return Object.assign({kind:'gemMal',skill:'gemischt',w:t.w,a:t.a,b:t.b,n:t.n,why:`${t.w} · ${t.n} = ${t.w*t.n}. Dazu kommt ${t.a}/${t.b} · ${t.n} = ${t.a*t.n}/${t.b}.`},
    nqMixOpts(R,res,[[t.w*t.n*t.b+t.a,t.b],[t.w*t.b+t.a*t.n,t.b],[A,t.b*t.n],[t.w*t.n*t.b*t.n+t.a,t.b*t.n]]));
}
function nqGemDiv(level,R){
  const t=vtMixNums(R,2,'div',null,{glatt:true}),A=t.w*t.b+t.a,res=[A,t.b*t.n];
  return Object.assign({kind:'gemDiv',skill:'gemischt',w:t.w,a:t.a,b:t.b,n:t.n,why:`Beide Teile gehen glatt auf: ${t.w} : ${t.n} = ${t.w/t.n} und ${t.a}/${t.b} : ${t.n} = ${t.a/t.n}/${t.b}.`},
    nqMixOpts(R,res,[[(t.w/t.n)*t.b+t.a,t.b],[A*t.n,t.b],[t.a,t.b*t.n],[t.w*t.b+t.a/t.n,t.b]]));
}
const NQ_GEN={bildBruch:nqBildBruch,wiederholt:nqWiederholt,umwandeln:nqUmwandeln,erweitern:nqErweitern,welcheRechnung:nqWelcheRechnung,groesser1:nqGroesser1,
  malErg:nqMalErg,malWas:nqMalWas,teilErg:nqTeilErg,teilSache:nqTeilSache,gemMal:nqGemMal,gemDiv:nqGemDiv};

const NQUICK={
  quick:true,
  notes:['M26','M27','M28'],
  notesFor(t){return (t&&NQ_NOTES[t.kind])||['M26','M27'];},
  prompt(t,h){
    const f=(n,d)=>frac(n,d);
    let c;
    switch(t.kind){
      case 'bildBruch':c=['Welcher Bruch ist gefärbt?'];break;
      case 'wiederholt':c=['Was ist das Ergebnis?'];break;
      case 'umwandeln':c=['Schreibe ',f(t.p,t.b),' als gemischte Zahl.'];break;
      case 'erweitern':c=['Erweitere ',f(t.a,t.b),' mit ',strong(t.k),'.'];break;
      case 'welcheRechnung':c=['Welche Rechnung passt zum Bild?'];break;
      case 'groesser1':c=['Welches Ergebnis ist größer als 1?'];break;
      case 'malWas':c=[t.who+' rechnet so. Was hat '+t.who+' gemacht?'];break;
      case 'teilSache':c=[t.who[0]+' und '+t.who[1]+' teilen sich ',f(1,t.b),' Pizza gerecht. Wie viel bekommt jeder?'];break;
      default:c=['Was ist das Ergebnis?'];
    }
    h.append(el('p',{class:'q'},...c));
  },
  render(view,host){
    const t=view.task,blank=()=>el('span',{class:'blank','aria-label':'gesucht'},'?');
    switch(t.kind){
      case 'bildBruch':host.append(el('div',{class:'vtfig'},vtRect(t.a,t.b,1,null)));break;
      case 'wiederholt':host.append(eq(frac(t.a,t.b),'+',frac(t.a,t.b),'+',frac(t.a,t.b),'=',blank()));break;
      case 'welcheRechnung':host.append(el('div',{class:'vtfig'},vtStrips(t.a,t.b,t.n)));break;
      case 'malErg':host.append(eq(frac(t.a,t.b),'·',String(t.n),'=',blank()));break;
      case 'malWas':host.append(eq(frac(t.a,t.b),'·',String(t.n),'=',frac(t.a*t.n,t.b*t.n)));break;
      case 'teilErg':host.append(eq(frac(t.a,t.b),':',String(t.n),'=',blank()));break;
      case 'gemMal':host.append(eq(mixed(t.w,t.a,t.b),'·',String(t.n),'=',blank()));break;
      case 'gemDiv':host.append(eq(mixed(t.w,t.a,t.b),':',String(t.n),'=',blank()));break;
      default:break;
    }
    qOptions(view,host,t);
  },
  validate:QUICK.validate,
  solution:QUICK.solution,
  hints(t){return [['Lies die Frage genau.'],NQ_HINT[t.kind]];}
};
function nqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(NQ_SKILLS),kinds=NQ_KINDS[skill],kind=(ctx&&ctx.occ!=null)?kinds[(ctx.occ+(skill==='grund'?R.int(0,1)*2:0))%kinds.length]:R.pick(kinds);
  return Object.assign({type:'NQ',level,avoid:[]},NQ_GEN[kind](level,R));
}
TASKS.NQ=Object.assign({area:'Rechnen',name:'Eingangstest',desc:NQ_SKILLS.length*Q_PER_SKILL+' Fragen zum Antippen – ohne Zeitdruck.',size:NQ_SKILLS.length*Q_PER_SKILL,
  gen:nqGen,
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,NQ_SKILLS,Q_PER_SKILL);
    const i=round.results.length%round.plan.length,skill=round.plan[i];
    return {skill,occ:round.plan.slice(0,i).filter(x=>x===skill).length};
  }},NQUICK);

/* ---------- Abschlusscheck NA: 10 Antippfragen (2 je Fähigkeit) + 5 Rechenaufgaben ---------- */
const NA_TAP=10,NA_CALC=[['N03','rechnen',false],['N04','rechnen',false],['N03','rechnen',true],['N04','zaehler',null],['N05','mul',null]];
TASKS.NA=proxyOf({area:'Rechnen',name:'Abschlusscheck',desc:NA_TAP+' Aufgaben zum Antippen und '+NA_CALC.length+' zum Rechnen – am Ende des Lernpfads.',
  notes:['M26','M27','M28'],size:NA_TAP+NA_CALC.length,finalTap:NA_TAP,finalLabel:'Zum Rechnen richtig',
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,NQ_SKILLS,2);
    const i=round.results.length;
    return i<NA_TAP?{skill:round.plan[i],slot:i,occ:Math.floor(i/NQ_SKILLS.length)}:{slot:i};
  },
  gen(level,R,ctx){
    const i=ctx&&ctx.slot!=null?ctx.slot:0;
    if(i<NA_TAP)return TASKS.NQ.gen(level,R,{skill:(ctx&&ctx.skill)||R.pick(NQ_SKILLS),occ:ctx&&ctx.occ});
    const [id,kind,red]=NA_CALC[Math.min(i-NA_TAP,NA_CALC.length-1)];
    return TASKS[id].gen(level,R,{kind,step:4,red});
  }
});
