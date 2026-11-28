'use strict';
/* =====================================================================
   Eingangstest KQ und Abschlusscheck KA der Etappe „Bruch mal Bruch, Bruch durch Bruch“ (Konzeption Kap. 3.2 und 3.6)
   KQ: 10 Antipp-Fragen (4 Antworten und „Weiß ich nicht“), 5 Fähigkeiten à 2: Grundlagen · Anteil vom Anteil · Wie oft? · Durch rechnen ·
       Sonderfälle. Jede Frage enthält Fallen aus der Fehlerliste (Kap. 5.1). 2 von 2 richtig = „sitzt“.
   KA: 10 Antipp-Fragen (2 je Fähigkeit) + 5 Rechenaufgaben (K3 vorher, K4 regel, K4 zahlDurchBruch, K5 gemischt, K6 Sachaufgabe).
       Urkunde ab 12 Punkten und nach allen Pflichtstationen.
   ===================================================================== */
const KQ_SKILLS=['grund','anteil','wieoft','durch','sonder'];
const KQ_NAMES={grund:'Grundlagen',anteil:'Anteil vom Anteil',wieoft:'Wie oft passt es?',durch:'Durch rechnen',sonder:'Sonderfälle'};
QCHK.KQ={skills:KQ_SKILLS,names:KQ_NAMES,
  stations:{grund:[],anteil:['K01','K03'],wieoft:['K02'],durch:['K04'],sonder:['K05']},allSure:['K06'],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Das Falt- und Messlabor hilft dir beim Start.'};
const KQ_KINDS={grund:['umwandeln','malNat'],anteil:['vonAnteil','malBruch'],wieoft:['passt','messen'],durch:['durchRegel','groesser'],sonder:['gemMal','restDiv']};
const KQ_NOTES={umwandeln:['M25'],malNat:['M29'],vonAnteil:['M29'],malBruch:['M29'],passt:['M30'],messen:['M30'],durchRegel:['M30'],groesser:['M30'],gemMal:['M31'],restDiv:['M30']};
const KQ_HINT={
  umwandeln:['Ein Ganzes hat so viele Teile, wie der Nenner sagt.'],
  malNat:['Schreibe die natürliche Zahl als Bruch mit Nenner 1.'],
  vonAnteil:['Von heißt mal.'],
  malBruch:['Zähler mal Zähler, Nenner mal Nenner.'],
  passt:['Wie oft passt das Stück in 1?'],
  messen:['Lege das Messstück im Kopf an.'],
  durchRegel:['Nimm mal den Kehrwert der zweiten Zahl.'],
  groesser:['Ist die zweite Zahl kleiner als 1?'],
  gemMal:['Wandle zuerst um.'],
  restDiv:['Der Rest gehört zum Messstück.']
};
/* Antwort als Karte: gemischte Zahl (über 1, nicht ganz), ganze Zahl oder Bruch */
const kqCard=(f,raw)=>{const [x,y]=raw?f:simplify(f[0],f[1]);if(y===1)return {txt:String(x),f:[x,1],v:[x,1]};if(x>y&&!raw)return {mx:[Math.floor(x/y),x%y,y],txt:vtShow(x,y),v:[x,y]};return {f:[x,y],txt:x+'/'+y,v:[x,y]};};
/* die richtige Antwort und drei Fallen mit verschiedenen Werten */
function kqOpts(R,right,cands,raw){
  const list=[kqCard(right,raw)],seen=[right];
  const ok=(c)=>c&&c[1]>0&&c[0]>0&&!seen.some(s=>equivalent(s[0],s[1],c[0],c[1]));
  for(const c of cands)if(list.length<4&&ok(c)){seen.push(c);list.push(kqCard(c,raw));}
  for(let s=1;list.length<4&&s<40;s++){const c=[right[0]+s*(s%2?1:2),right[1]];if(ok(c)){seen.push(c);list.push(kqCard(c,raw));}}
  return wqOpts(R,list.map(o=>{const c=Object.assign({},o);delete c.v;return c;}),0);
}
const kqT=(t,o)=>Object.assign({op:t.op,x:t.x,y:t.y},o);
function kqUmwandeln(level,R){
  const z=kbMix(R,[2,3,4],[3,4,5,6,7,8]),Z=kbV(z);
  return Object.assign({kind:'umwandeln',skill:'grund',x:z,why:'Ein Ganzes sind '+z.b+' '+kbDenName(z.b)+'. '+z.w+' Ganze sind '+z.w*z.b+'/'+z.b+'. Dazu kommt '+z.a+'/'+z.b+'.'},
    kqOpts(R,Z,[[z.w+z.a,z.b],[z.w*z.a,z.b],[Z[0]-2,z.b],[z.w*z.b,z.a]],true));
}
function kqMalNat(level,R){
  const t=kbFind(R,()=>{const f=kbProper(R,[3,4,5,6,7],{notOne:true}),n=R.int(2,5);const t=kbT('mul',f,kbNat(n));return kbWhole(kbRes(t))?null:t;},null,kbT('mul',kbZ(2,3),kbNat(4))),X=kbV(t.x),n=t.y.a;
  return kqT(t,Object.assign({kind:'malNat',skill:'grund',why:n+' ist '+n+'/1. Zähler mal Zähler: '+X[0]+' · '+n+'. Der Nenner bleibt '+X[1]+'.'},
    kqOpts(R,kbRes(t),[[X[0]*n,X[1]*n],[X[0],X[1]*n],[X[0]+n,X[1]+n]],true)));
}
function kqVonAnteil(level,R){
  const t=kbFind(R,()=>kbT('mul',kbProper(R,[2,3,4]),kbProper(R,[2,3,4,5]))),X=kbV(t.x),Y=kbV(t.y);
  return kqT(t,Object.assign({kind:'vonAnteil',skill:'anteil',why:'Von heißt mal: '+kbProofText(t)},
    kqOpts(R,kbRes(t),[[Y[0]*X[1],Y[1]*X[0]],[X[0]*Y[1]+Y[0]*X[1],X[1]*Y[1]],[X[0]+Y[0],X[1]+Y[1]]],false)));
}
function kqMalBruch(level,R){
  const t=kbMulNums(R,1),X=kbV(t.x),Y=kbV(t.y);
  return kqT(t,Object.assign({kind:'malBruch',skill:'anteil',why:'Zähler mal Zähler, Nenner mal Nenner: '+kbProofText(t)},
    kqOpts(R,kbRes(t),[[X[0]+Y[0],X[1]+Y[1]],[X[0]*Y[1],X[1]*Y[0]],[X[0]*Y[0],Y[1]]],false)));
}
function kqPasst(level,R){
  const n=R.int(2,6),b=R.pick([2,3,4]),t=kbT('div',kbNat(n),kbZ(1,b));
  return kqT(t,Object.assign({kind:'passt',skill:'wieoft',why:kbTxt(t.y)+' passt '+b+'-mal in 1. In '+n+' passt es '+n*b+'-mal.'},kqOpts(R,[n*b,1],[[n,b],[n*b+1,b],[1,n*b]],false)));
}
function kqMessen(level,R){
  const t=kbFracMeasure(R,false),X=kbV(t.x),Y=kbV(t.y);
  return kqT(t,Object.assign({kind:'messen',skill:'wieoft',why:'Wie oft passt '+kbTxt(t.y)+' in '+kbTxt(t.x)+'? '+kbProofText(t)},kqOpts(R,kbRes(t),[[X[0]*Y[0],X[1]*Y[1]],[X[1]*Y[0],X[0]*Y[1]],[X[1]*Y[1],X[0]*Y[0]]],false)));
}
function kqDurchRegel(level,R){
  const t=kbDivNums(R,1,{notWhole:true}),X=kbV(t.x),Y=kbV(t.y);
  return kqT(t,Object.assign({kind:'durchRegel',skill:'durch',why:'Mal den Kehrwert der zweiten Zahl: '+kbProofText(t)},kqOpts(R,kbRes(t),[[X[0]*Y[0],X[1]*Y[1]],[X[1]*Y[0],X[0]*Y[1]],[X[1]*Y[1],X[0]*Y[0]]],false)));
}
function kqGroesser(level,R){
  const n=R.int(4,12),k=R.pick([2,3,4,5]),t=kbT('div',kbNat(n),kbZ(1,k));
  return kqT(t,Object.assign({kind:'groesser',skill:'durch',why:kbTxt(t.y)+' passt '+k+'-mal in 1. Das Ergebnis ist '+n*k+', also größer als '+n+'.'},
    wqOpts(R,[{txt:'größer als '+n},{txt:'kleiner als '+n},{txt:'genau '+n},{txt:'Man kann es nicht sagen.'}],0)));
}
function kqGemMal(level,R){
  const t=kbMixNums(R,1,'mul',{x:()=>kbMix(R,[1,2],[2,3,4]),y:()=>kbMix(R,[1,2],[2,3,4])}),g=kbGetrennt(t),X=kbV(t.x),Y=kbV(t.y);
  return kqT(t,Object.assign({kind:'gemMal',skill:'sonder',why:'Erst umwandeln: '+kbProofText(t)},kqOpts(R,kbRes(t),[g,[X[0]*Y[1]+Y[0]*X[1],X[1]*Y[1]],[kbRes(t)[0]+kbRes(t)[1],kbRes(t)[1]*2]],false)));
}
function kqRestDiv(level,R){
  const t=kbMeasureNums(R,{rest:true,maxN:3}),X=kbV(t.x),Y=kbV(t.y);
  return kqT(t,Object.assign({kind:'restDiv',skill:'sonder',why:'Mal den Kehrwert: '+kbProofText(t)+' Der Rest gehört zum Messstück.'},kqOpts(R,kbRes(t),[kbMulF(X,Y),kbRestBezug(t),kbMulF(kbKehr(X),Y)],false)));
}
const KQ_GEN={umwandeln:kqUmwandeln,malNat:kqMalNat,vonAnteil:kqVonAnteil,malBruch:kqMalBruch,passt:kqPasst,messen:kqMessen,durchRegel:kqDurchRegel,groesser:kqGroesser,gemMal:kqGemMal,restDiv:kqRestDiv};
const KQUICK={
  quick:true,
  notes:['M29','M30','M31'],
  notesFor(t){return (t&&KQ_NOTES[t.kind])||['M29','M30'];},
  prompt(t,h){
    switch(t.kind){
      case 'umwandeln':kbQ(h,'Schreibe ',kbNode(t.x),' als Bruch.');break;
      case 'vonAnteil':kbQ(h,'Was ist ',kbNode(t.x),' von ',kbNode(t.y),'?');break;
      case 'passt':kbQ(h,'Wie oft passt ',kbNode(t.y),' in ',kbNode(t.x),'?');break;
      case 'groesser':kbQ(h,'Das Ergebnis ist …');break;
      default:kbQ(h,'Was ist das Ergebnis?');
    }
  },
  render(view,host){
    const t=view.task;
    if(['malNat','malBruch','messen','durchRegel','gemMal','restDiv','groesser'].includes(t.kind))host.append(kbExpr(t,t.kind==='groesser'?undefined:kbBlank()));
    qOptions(view,host,t);
  },
  validate:QUICK.validate,
  solution:QUICK.solution,
  hints(t){return [['Lies die Frage genau.'],KQ_HINT[t.kind]];}
};
function kqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(KQ_SKILLS),kinds=KQ_KINDS[skill],kind=(ctx&&ctx.occ!=null)?kinds[ctx.occ%kinds.length]:R.pick(kinds);
  return Object.assign({type:'KQ',level,avoid:[]},KQ_GEN[kind](level,R));
}
TASKS.KQ=Object.assign({area:'Rechnen',name:'Eingangstest',desc:KQ_SKILLS.length*Q_PER_SKILL+' Fragen zum Antippen – ohne Zeitdruck.',size:KQ_SKILLS.length*Q_PER_SKILL,
  gen:kqGen,
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,KQ_SKILLS,Q_PER_SKILL);
    const i=round.results.length%round.plan.length,skill=round.plan[i];
    return {skill,occ:round.plan.slice(0,i).filter(x=>x===skill).length};
  }},KQUICK);

/* ---------- Abschlusscheck KA: 10 Antippfragen (2 je Fähigkeit) + 5 Rechenaufgaben ---------- */
const KA_TAP=10,KA_CALC=[['K03',['vorher']],['K04',['regel']],['K04',['zahlDurchBruch']],['K05',['malGemischt','durchGemischt']],['K06',['ganzes','enthalten']]];
TASKS.KA=proxyOf({area:'Rechnen',name:'Abschlusscheck',desc:KA_TAP+' Aufgaben zum Antippen und '+KA_CALC.length+' zum Rechnen – am Ende des Lernpfads.',
  notes:['M29','M30','M31'],size:KA_TAP+KA_CALC.length,finalTap:KA_TAP,finalLabel:'Zum Rechnen richtig',
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,KQ_SKILLS,2);
    const i=round.results.length;
    return i<KA_TAP?{skill:round.plan[i],slot:i,occ:Math.floor(i/KQ_SKILLS.length)}:{slot:i};
  },
  gen(level,R,ctx){
    const i=ctx&&ctx.slot!=null?ctx.slot:0;
    if(i<KA_TAP)return TASKS.KQ.gen(level,R,{skill:(ctx&&ctx.skill)||R.pick(KQ_SKILLS),occ:ctx&&ctx.occ});
    const [id,kinds]=KA_CALC[Math.min(i-KA_TAP,KA_CALC.length-1)];
    return TASKS[id].gen(2,R,{kind:R.pick(kinds),step:4});
  }
});
