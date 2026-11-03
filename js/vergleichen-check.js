'use strict';
/* =====================================================================
   Eingangstest WQ und Abschlusscheck WA zum Thema „Brüche vergleichen“ (15 Fragen: 5 Fähigkeiten à 3)
   Wie Q00 und ZQ nur Antipp-Fragen (A–D, Ja/Nein, „Weiß ich nicht“); jede Frage trägt ein skill-Etikett.
   3 von 3 richtig = „sitzt“: die Stationen der Fähigkeit stehen im Lernpfad mit „Check: sitzt“ (stations). Jede Frage enthält eine typische Falle
   (z. B. „gleicher Nenner = gleich groß“, „gleich viele fehlen = gleich groß“, „größerer Nenner = größer“, nur nach den Zählern ordnen).
   Antworten: opts mit txt (immer), dazu f (Bruch), mx (gemischte Zahl), pt (Text mit Brüchen: Liste aus Text und [n,d]) oder fs (Liste von Brüchen).
   ===================================================================== */
const WQ_SKILLS=['regel','fehlt','nenner','weg','ordnen'];
const WQ_NAMES={regel:'Nenner oder Zähler gleich',fehlt:'Gleich viele Teile fehlen zum Ganzen',nenner:'Auf einen Nenner bringen',weg:'Vergleichszahl und Wege',ordnen:'Ordnen, über 1 und dazwischen'};
QCHK.WQ={skills:WQ_SKILLS,names:WQ_NAMES,
  stations:{regel:['W01','W02','W03'],fehlt:['W04'],nenner:['W05'],weg:['W06','W07'],ordnen:['W08','W09','W10']},allSure:[],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Die Erklärungen helfen dir beim Start.'};
const WQ_KINDS={regel:['cmpN','cmpZ','which'],fehlt:['rico','rest','konfl'],nenner:['gemein','erwZ','zaehler'],weg:['halb','schnell','eins'],ordnen:['reihe','gemischt','zwischen']};
const WQ_NOTES={cmpN:['M11'],cmpZ:['M11'],which:['M11'],rico:['M12'],rest:['M12'],konfl:['M12'],gemein:['M13','M10'],erwZ:['M13','M2'],zaehler:['M13'],halb:['M14'],schnell:['M15'],eins:['M14'],reihe:['M16','M15'],gemischt:['M6','M16'],zwischen:['M16','M13']};
const WQ_HINT={
  cmpN:['Beide Brüche haben gleich große Stücke. Wer hat mehr Stücke?'],
  cmpZ:['Beide haben gleich viele Stücke. Wo sind die Stücke größer?'],
  which:['Vergleiche die Nenner und die Zähler. Steht bei beiden dieselbe Zahl?'],
  rico:['Fehlen gleich viele Stücke, kommt es auf die Größe der fehlenden Stücke an.'],
  rest:['Das kleinere fehlende Stück gehört zum größeren Bruch.'],
  konfl:['Zähle die fehlenden Stücke. Sind es bei beiden gleich viele?'],
  gemein:['In den gemeinsamen Nenner müssen beide Nenner aufgehen.'],
  erwZ:['Erweitere mit derselben Zahl wie beim Nenner.'],
  zaehler:['Wie kommst du vom kleineren Zähler zum größeren? Erweitere damit.'],
  halb:['Verdopple den Zähler und vergleiche mit dem Nenner.'],
  schnell:['Prüfe der Reihe nach: Nenner gleich? Zähler gleich? Fehlen gleich viele? Liegt eine Vergleichszahl dazwischen?'],
  eins:['Vergleiche den Zähler mit dem Nenner.'],
  reihe:['Vergleiche je zwei Brüche. Der kleinste Bruch kommt zuerst.'],
  gemischt:['Schau zuerst auf die Ganzen.'],
  zwischen:['Erweitere beide Brüche, dann siehst du, was dazwischen liegt.']
};
/* Antworten mischen: items = Antworten mit txt, right = Nummer der richtigen */
function wqOpts(R,items,right){
  const all=R.shuffle(items.map((o,i)=>({o,i}))),opts=all.map((x,j)=>Object.assign({},x.o,{id:Q_LETTERS[j]}));
  return {opts,answer:opts[all.findIndex(x=>x.i===right)].id,optNums:[]};
}
const wqFr=(f)=>({f:[f[0],f[1]],txt:ft(f[0],f[1])});
const wqEq={txt:'Beide sind gleich groß'};
const wqEchte=(f)=>f[0]<f[1]&&f[2]<f[3];
const wqRel=(x,y)=>x<y?'kleiner als':x===y?'gleich':'größer als';
/* zwei echte Brüche: welcher ist größer? opts [erster, zweiter, gleich groß] */
function wqPair(R,f,whyOf){
  const s=compareFrac(f[0],f[1],f[2],f[3]),big=s>0?0:1;
  return Object.assign({fr:[[f[0],f[1]],[f[2],f[3]]],why:whyOf(f,big)},wqOpts(R,[wqFr([f[0],f[1]]),wqFr([f[2],f[3]]),wqEq],big));
}
const wqEchtPair=(gen)=>{let f;for(let i=0;i<200;i++){f=gen();if(wqEchte(f))return f;}return f;};

/* --- Nenner oder Zähler gleich --- */
function wqCmpN(level,R){
  const f=wqEchtPair(()=>cmpNenner(R,level));
  return Object.assign({kind:'cmpN',skill:'regel'},wqPair(R,f,(g,big)=>`Die Stücke sind gleich groß. ${Math.max(g[0],g[2])} Stücke sind mehr als ${Math.min(g[0],g[2])} Stücke.`));
}
function wqCmpZ(level,R){
  const f=wqEchtPair(()=>cmpZaehler(R,level));
  return Object.assign({kind:'cmpZ',skill:'regel'},wqPair(R,f,(g)=>`Beide haben ${g[0]} ${g[0]===1?'Stück':'Stücke'}. Die Stücke mit dem Nenner ${Math.min(g[1],g[3])} sind größer.`));
}
function wqWhich(level,R){
  const same=R.pick(['nenner','zaehler','keins']),f=same==='nenner'?cmpNenner(R,level):same==='zaehler'?cmpZaehler(R,level):cmpKeins(R,level);
  const items=[{txt:'Der Nenner'},{txt:'Der Zähler'},{txt:'Keins von beiden'}],right=same==='nenner'?0:same==='zaehler'?1:2;
  return Object.assign({kind:'which',skill:'regel',fr:[[f[0],f[1]],[f[2],f[3]]],
    why:same==='nenner'?`Beide Brüche haben den Nenner ${f[1]}.`:same==='zaehler'?`Beide Brüche haben den Zähler ${f[0]}.`:'Nenner und Zähler sind verschieden.'},wqOpts(R,items,right));
}

/* --- Gleich viele Teile fehlen zum Ganzen --- */
function wqRico(level,R){
  const f=cmpFehlt(R,level,'gleich'),m=f[1]-f[0];
  return {kind:'rico',skill:'fehlt',fr:[[f[0],f[1]],[f[2],f[3]]],m,answer:'nein',why:'Es fehlt gleich viel, aber die fehlenden Stücke sind verschieden groß.'};
}
function wqRest(level,R){
  const f=cmpFehlt(R,level,'gleich'),m=f[1]-f[0],bigDen=f[1]>f[3]?[f[0],f[1]]:[f[2],f[3]];
  return Object.assign({kind:'rest',skill:'fehlt',m},wqPair(R,f,()=>`Bei beiden ${cmpMissMain(m)}. Das fehlende Stück bei ${ft(bigDen[0],bigDen[1])} ist kleiner, dieser Bruch ist größer.`));
}
function wqKonfl(level,R){
  const f=cmpFehlt(R,level,'konflikt'),big=compareFrac(f[0],f[1],f[2],f[3])>0?0:1,ask=R.chance(0.5)?big:1-big,m=lcm(f[1],f[3]);
  const x=ask===0?[f[0],f[1]]:[f[2],f[3]],y=ask===0?[f[2],f[3]]:[f[0],f[1]];
  return {kind:'konfl',skill:'fehlt',x,y,mA:f[1]-f[0],mC:f[3]-f[2],a:[f[0],f[1]],c:[f[2],f[3]],answer:ask===big?'ja':'nein',
    why:`Es fehlen verschieden viele Stücke. Zählen allein reicht nicht: Auf den Nenner ${m} erweitert sind es ${ft(f[0]*m/f[1],m)} und ${ft(f[2]*m/f[3],m)}.`};
}

/* --- Auf einen Nenner bringen --- */
function wqGemein(level,R){
  for(let g=0;g<200;g++){
    const [b,d,m]=cmpDenPair(R,level===1?[2,3,4,5,6,8,9,10,12]:[4,5,6,8,9,10,12,15,16,18,20,24],level===1?24:60,false);
    if(m===b||m===d)continue;
    const r=zqNums(R,m,[Math.max(b,d),b+d,m+2,m-2,m+1,m-1,Math.max(b,d)+2],x=>x%b!==0||x%d!==0,2,60);
    if(!r)continue;
    const a=R.int(1,b-1),c=R.int(1,d-1);
    return Object.assign({kind:'gemein',skill:'nenner',fr:[[a,b],[c,d]],m,why:`Beide Nenner (${b} und ${d}) gehen in ${m} auf. ${m} ist die kleinste solche Zahl.`},r);
  }
  throw new Error('wqGemein');
}
function wqErwZ(level,R){
  for(let g=0;g<100;g++){
    const b=R.pick(level===1?[2,3,4,5,6]:[3,4,5,6,8,9]),k=R.pick([2,3,4,5].filter(x=>b*x<=(level===1?24:48))),a=R.int(1,b-1),m=b*k,ans=a*k;
    const r=zqNums(R,ans,[a,a+(m-b),m,a*(k+1),a*(k-1),ans+1,ans-1],()=>true,1,60);
    if(!r)continue;
    return Object.assign({kind:'erwZ',skill:'nenner',a,b,m,k,why:`${b} · ${k} = ${m}, also auch den Zähler mal ${k}: ${a} · ${k} = ${ans}.`},r);
  }
  throw new Error('wqErwZ');
}
function wqZaehler(level,R){
  for(let g=0;g<100;g++){
    const a=R.int(1,level===1?3:5),k=R.int(2,4),c=a*k,b=R.int(a+1,level===1?8:12),ans=b*k;
    const r=zqNums(R,ans,[b+k,b+c,ans+1,ans-1,c,b*(k+1)],x=>x!==ans,2,60);
    if(!r)continue;
    return Object.assign({kind:'zaehler',skill:'nenner',a,b,c,k,why:`Von ${a} zu ${c} mit ${k} erweitern: ${b} · ${k} = ${ans}. Der neue Nenner ist ${ans}.`},r);
  }
  throw new Error('wqZaehler');
}

/* --- Vergleichszahl und Wege --- */
function wqHalb(level,R){
  const [a,b]=cmpOne(R,level,'half'),real=cmpSignOf(compareFrac(a,b,1,2));
  const items=[{pt:['kleiner als ',[1,2]],txt:'kleiner als 1/2'},{pt:['gleich ',[1,2]],txt:'gleich 1/2'},{pt:['größer als ',[1,2]],txt:'größer als 1/2'}];
  const right=real==='<'?0:real==='='?1:2;
  return Object.assign({kind:'halb',skill:'weg',a,b,why:`Der doppelte Zähler ${2*a} ist ${wqRel(2*a,b)} ${b}. Also ist ${ft(a,b)} ${wqRel(2*a,b)} 1/2.`},wqOpts(R,items,right));
}
function wqSchnell(level,R){
  const want=R.pick(['nenner','zaehler','fehlt','zahl']),r=cmpWegPair(R,level,want),others=R.shuffle(['nenner','zaehler','fehlt','zahl','erw'].filter(w=>w!==want)).slice(0,3);
  const items=[want].concat(others).map(w=>({txt:CMP_WAYNAME[w]}));
  return Object.assign({kind:'schnell',skill:'weg',fr:[[r.f[0],r.f[1]],[r.f[2],r.f[3]]],want,why:cmpWayOk({a:r.f[0],b:r.f[1],c:r.f[2],d:r.f[3]},want)},wqOpts(R,items,0));
}
function wqEins(level,R){
  const [a,b]=cmpOne(R,level,'one'),yes=a>b;
  return {kind:'eins',skill:'weg',a,b,answer:yes?'ja':'nein',why:a===b?`${a} ist gleich ${b}. Der Bruch ist genau 1, nicht größer.`:`Der Zähler ${a} ist ${wqRel(a,b)} dem Nenner ${b}. Also ist ${ft(a,b)} ${yes?'größer':'kleiner'} als 1.`};
}

/* --- Ordnen, über 1 und dazwischen --- */
function wqReihe(level,R){
  for(let g=0;g<200;g++){
    const fr=cmpList(R,level,3),idx=cmpIdxSorted(fr,false);
    const byNum=fr.map((_,i)=>i).sort((p,q)=>fr[p][0]-fr[q][0]||p-q),byDen=fr.map((_,i)=>i).sort((p,q)=>fr[p][1]-fr[q][1]||p-q);
    const lists=[idx,idx.slice().reverse(),byNum,byDen,[idx[1],idx[0],idx[2]],[idx[0],idx[2],idx[1]]];
    const seen=new Set([idx.join()]),dist=[];
    for(const l of lists.slice(1)){if(!seen.has(l.join())){seen.add(l.join());dist.push(l);}}
    if(dist.length<3)continue;
    const mk=(l)=>({fs:l.map(i=>fr[i]),txt:l.map(i=>ft(fr[i][0],fr[i][1])).join(' < ')});
    return Object.assign({kind:'reihe',skill:'ordnen',fr,why:`Vergleiche je zwei Brüche. Der kleinste kommt zuerst: ${mk(idx).txt}.`},wqOpts(R,[mk(idx)].concat(dist.slice(0,3).map(mk)),0));
  }
  throw new Error('wqReihe');
}
function wqGemischt(level,R){
  for(let g=0;g<200;g++){
    const pair=cmpBigPair(R,level===1?1:2,R.chance(0.4));
    if(pair[0].mixed===pair[1].mixed)continue;
    const [m,u]=pair[0].mixed?[pair[0],pair[1]]:[pair[1],pair[0]],bigIsMixed=compareFrac(m.p,m.q,u.p,u.q)>0;
    const items=[{mx:[m.w,m.r,m.q],txt:`${m.w} ${m.r}/${m.q}`},{f:[u.p,u.q],txt:ft(u.p,u.q)},wqEq];
    return Object.assign({kind:'gemischt',skill:'ordnen',m,u,why:m.w!==u.w?`${m.w} Ganze und ${u.w} Ganze: Mehr Ganze sind größer.`:'Die Ganzen sind gleich. Die Reste entscheiden.'},wqOpts(R,items,bigIsMixed?0:1));
  }
  throw new Error('wqGemischt');
}
function wqZwischen(level,R){
  const f=cmpZwischen(R,level,R.chance(0.5)),B=cmpBetween({a:f[0],b:f[1],c:f[2],d:f[3]}),yes=R.chance(0.5);
  const x=yes?[B.lo+1,B.M]:R.pick([[Math.max(1,B.lo-1),B.M],[B.hi+1,B.M]]);
  return {kind:'zwischen',skill:'ordnen',f:[[f[0],f[1]],[f[2],f[3]]],x,answer:yes?'ja':'nein',
    why:yes?`Auf den Nenner ${B.M} erweitert liegt ${ft(x[0],x[1])} zwischen ${ft(B.lo,B.M)} und ${ft(B.hi,B.M)}.`:`Auf den Nenner ${B.M} erweitert liegen die Grenzen bei ${B.lo} und ${B.hi}. ${x[0]} liegt nicht dazwischen.`};
}
const WQ_GEN={cmpN:wqCmpN,cmpZ:wqCmpZ,which:wqWhich,rico:wqRico,rest:wqRest,konfl:wqKonfl,gemein:wqGemein,erwZ:wqErwZ,zaehler:wqZaehler,halb:wqHalb,schnell:wqSchnell,eins:wqEins,reihe:wqReihe,gemischt:wqGemischt,zwischen:wqZwischen};

const WQUICK={
  quick:true,
  notes:['M11','M12','M13','M14','M15','M16'],
  notesFor(t){return (t&&WQ_NOTES[t.kind])||['M11','M12','M13'];},
  prompt(t,h){
    const f=(x)=>frac(x[0],x[1]);
    let c;
    switch(t.kind){
      case 'cmpN':c=['Beide Brüche haben denselben Nenner. Welcher Bruch ist größer?'];break;
      case 'cmpZ':c=['Beide Brüche haben denselben Zähler. Welcher Bruch ist größer?'];break;
      case 'which':c=['Was ist bei ',f(t.fr[0]),' und ',f(t.fr[1]),' gleich?'];break;
      case 'rico':c=['Bei ',f(t.fr[0]),' und ',f(t.fr[1]),' ',cmpMissMain(t.m).replace(/^fehlt/,'fehlt je').replace(/^fehlen/,'fehlen je'),' zum Ganzen. Sind beide gleich groß?'];break;
      case 'rest':c=['Bei beiden Brüchen ',cmpMissMain(t.m),' zum Ganzen. Welcher Bruch ist größer?'];break;
      case 'konfl':c=['Bei ',f(t.a),' ',cmpMissMain(t.mA),', bei ',f(t.c),' ',cmpMissMain(t.mC),'. Ist ',f(t.x),' größer als ',f(t.y),'?'];break;
      case 'gemein':c=['Auf welchen Nenner kannst du ',f(t.fr[0]),' und ',f(t.fr[1]),' bringen?'];break;
      case 'erwZ':c=['Auf den Nenner ',strong(t.m),' erweitert: Welche Zahl fehlt? ',f([t.a,t.b]),' = ',f(['?',t.m])];break;
      case 'zaehler':c=['Erweitere ',f([t.a,t.b]),' so, dass der Zähler ',strong(t.c),' wird. Welcher Nenner entsteht?'];break;
      case 'halb':c=['Wie liegt ',f([t.a,t.b]),' zu ',f([1,2]),'?'];break;
      case 'schnell':c=['Welcher Weg ist bei ',f(t.fr[0]),' und ',f(t.fr[1]),' am schnellsten?'];break;
      case 'eins':c=['Ist ',f([t.a,t.b]),' größer als 1?'];break;
      case 'reihe':c=['Welche Reihe ist richtig? Der kleinste Bruch kommt zuerst.'];break;
      case 'gemischt':c=['Welche Zahl ist größer?'];break;
      default:c=['Liegt ',f(t.x),' zwischen ',f(t.f[0]),' und ',f(t.f[1]),'?'];
    }
    h.append(el('p',{class:'q'},...c));
  },
  render(view,host){qOptions(view,host,view.task);},
  validate:QUICK.validate,
  solution:QUICK.solution,
  hints(t){return [['Lies die Frage genau.'],WQ_HINT[t.kind]];}
};
function wqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(WQ_SKILLS),kinds=WQ_KINDS[skill],kind=(ctx&&ctx.occ!=null)?kinds[ctx.occ%kinds.length]:R.pick(kinds);
  return Object.assign({type:'WQ',level,avoid:[]},WQ_GEN[kind](level,R));
}
TASKS.WQ=Object.assign({area:'Vergleichen',name:'Eingangstest',desc:WQ_SKILLS.length*Q_PER_SKILL+' Kurzfragen zum Antippen – ohne Zeitdruck.',size:WQ_SKILLS.length*Q_PER_SKILL,
  gen:wqGen,
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,WQ_SKILLS,Q_PER_SKILL);
    const i=round.results.length%round.plan.length,skill=round.plan[i];
    return {skill,occ:round.plan.slice(0,i).filter(x=>x===skill).length};
  }},WQUICK);

/* ---------- Abschlusscheck Vergleichen (WA): 10 Antippfragen (2 je Fähigkeit) + 5 Aufgaben (Rico-Behauptung, Auf einen Nenner bringen,
   Strategiewahl mit Konflikt, Ordnen von vier Brüchen, Bruch dazwischen); Urkunde ab 12 Punkten und nach allen Pflicht-Stationen ---------- */
const WA_TAP=10,WA_LINE=['W04','W05','W07','W08','W10'],WA_KINDS={W04:'claim',W05:'ziel',W07:'konflikt',W08:'ord4',W10:'find'};
TASKS.WA=proxyOf({area:'Vergleichen',name:'Abschlusscheck',desc:WA_TAP+' Aufgaben zum Antippen und '+WA_LINE.length+' zum Lösen – am Ende des Lernpfads.',notes:['M11','M12','M13','M14','M15','M16'],size:WA_TAP+WA_LINE.length,
  finalTap:WA_TAP,finalLabel:'Zum Lösen richtig',
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,WQ_SKILLS,2);
    const i=round.results.length;
    return i<WA_TAP?{skill:round.plan[i],slot:i,occ:Math.floor(i/WQ_SKILLS.length)}:{slot:i};
  },
  gen(level,R,ctx){
    const i=ctx&&ctx.slot!=null?ctx.slot:0;
    if(i<WA_TAP)return TASKS.WQ.gen(level,R,{skill:(ctx&&ctx.skill)||R.pick(WQ_SKILLS),occ:ctx&&ctx.occ});
    const id=WA_LINE[i-WA_TAP];
    return TASKS[id].gen(level,R,{kind:WA_KINDS[id]});
  }
});
