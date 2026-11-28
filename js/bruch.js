'use strict';
/* =====================================================================
   Etappe „Bruch mal Bruch, Bruch durch Bruch“ (Thema rechnen, interne Kennung K; Konzeption vom 27.11.2026, Lehrbuch S. 46–53)
   Verstehen: K01 Anteil vom Anteil (Rechteck falten) · K02 Wie oft passt der Bruch hinein? (Messen am Streifen)
   Üben: K03 Bruch mal Bruch · K04 Bruch durch Bruch (Kehrwert) · K05 Gemischte Zahlen mal und durch
   Anwenden: K06 Mal oder durch? (Sachaufgaben)
   Knobeln (freiwillig): K07 Null, Eins und Kehrwert · K08 Größer oder kleiner? · K09 Fehlerdetektiv · K10 Zahlenrätsel
   Reihenfolge: Handlung am Bild → Zuordnung → Begründung → Verfahren. Eine Form je Runde (oneFormPlan), wie überall.
   Wertung: Ein gleichwertiges Ergebnis zählt (ungekürzt mit Hinweis), außer die Aufgabe verlangt „vollständig gekürzt“ (vorher).
   Bildgrenzen: Nenner höchstens 6, höchstens 12 Felder. Sachaufgaben nutzen die Namen aus js/names.js.
   ===================================================================== */
const kbWho=(R)=>R.shuffle(NAME_LIST).slice(0,3);
/* echter, gekürzter Bruch mit Nenner aus bs */
function kbProper(R,bs,o){
  o=o||{};
  for(let i=0;i<200;i++){const b=R.pick(bs),a=R.int(o.min||1,b-1);if(gcd(a,b)===1&&!(o.notOne&&a===1)&&!(o.unit&&a!==1))return kbZ(a,b);}
  return kbZ(1,bs[0]);
}
const kbMix=(R,ws,bs)=>{const z=kbProper(R,bs);z.w=R.pick(ws);return z;};
const kbNat=(n)=>kbZ(n,1);
const kbT=(op,x,y,extra)=>Object.assign({op,x,y},extra||{});
const kbBase=(id,level,kind,t,extra)=>Object.assign({type:id,level,kind},t,{avoid:[kbTxt(t.x)+kbSign(t.op)+kbTxt(t.y)]},extra||{});
/* Zahlen suchen, die keine Fehlermuster-Kollision haben */
function kbFind(R,make,ok,fallback){
  for(let i=0;i<600;i++){const t=make();if(!t)continue;if(kbCollides(t))continue;if(ok&&!ok(t))continue;return t;}
  return fallback;
}

/* ---------- Rundenpläne: eine Form je Runde ---------- */
const KB_PLAN={
  K01:{1:['falten','ablesen','zuordnen'],2:['kleiner','woher','pizza']},
  K02:{1:['stamm','gruppen','bruchMessen','groesser'],2:['rest','bruchRest','strahl','gefaess']},
  K03:{1:['rechnen','natuerlich','kleiner'],2:['vorher','quadrat','luecke']},
  K04:{1:['kehrwert','regel','zahlDurchBruch','bruchDurchZahl'],2:['groesser','vorher','kopf']},
  K05:{1:['umwandelnMal','mal','streifen','kehrwertGem'],2:['schaetzen','malGemischt','durchGemischt','bruchDurchGem','flaeche']},
  K06:{1:['welcheRechnung','vonBruch','enthalten','vonGemischt'],2:['ganzes','teilfuellung','restDeuten','rezept','tempo']},
  K07:{1:['nullDurch','durchNull','selbst','einsDurch','kehrMal'],2:['nullDurch','durchNull','selbst','einsDurch','kehrMal']},
  K08:{1:['ordnen','vergleich','warum','verdoppeln','verdoppelnDurch'],2:['ordnen','vergleich','warum','verdoppeln','verdoppelnDurch']},
  K09:{1:['welche','warum'],2:['welche','warum']},
  K10:{1:['gedacht','pfeil','potenz','reihe'],2:['gedacht','pfeil','potenz','reihe']}
};
/* Varianten derselben Frage (K07, K08, K10) gelten als eine Form: FORM_SAME in js/exercise.js */
function kbCtx(id){
  return (round,level)=>{
    const size=TASKS[id].size,P=KB_PLAN[id][level]||KB_PLAN[id][1];
    if(!Array.isArray(round.kb)||round.kb.length!==size)round.kb=oneFormPlan(id,level,P,size);
    const i=Math.min(round.results.length,size-1);
    return {kind:round.kb[i],step:i};
  };
}
const kbKinds=(id,lvl)=>Array.from(new Set(KB_PLAN[id][lvl]||KB_PLAN[id][1]));
const kbKindOf=(ctx,id)=>(ctx&&ctx.kind)||KB_PLAN[id][1][0];
function kbStation(id,meta,impl){
  return Object.assign({area:'Rechnen',size:5,ctx:kbCtx(id),planKey:'kb',layoutKinds:(lvl)=>kbKinds(id,lvl),probeCtx:{kind:KB_PLAN[id][1][0]}},meta,impl);
}
/* Bausteine der Ansicht */
const kbQ=(h,...parts)=>h.append(el('p',{class:'q'},...parts));
const kbYN=(view,host)=>hnYesNo(view,host,'yn');
function kbYNCheck(d,want,okMsg,badMsg,code){
  if(!d.yn)return invalid('Tippe Ja oder Nein an.');
  return d.yn===want?right(okMsg):wrong(code||'groesse',badMsg,{['yn'+d.yn]:false});
}
function kbChoice(d,key,answer,badMsg,code){
  if(!d[key])return invalid('Tippe eine Antwort an.');
  return d[key]===answer?null:wrong(code||'wahl',badMsg,{[key+d[key]]:false});
}
/* Antwortkarten aus Daten: f (Bruch), m (gemischte Zahl), z (Zahl), e (Rechnung als vtX-Liste), s (Text) */
const kbItemNode=(it)=>it.f?(it.f[1]===1?String(it.f[0]):frac(it.f[0],it.f[1])):it.m?mixed(it.m[0],it.m[1],it.m[2]):it.e?vtX(it.e):it.z!=null?String(it.z):it.s;
const kbItems=(list)=>list.map(it=>({id:it.id,parts:[kbItemNode(it)]}));
/* Kacheln: sobald eine Antwort ein Wort ist, stehen alle in der Textschrift (große Zahlenschrift nur für Zahlen und Brüche) */
const kbTiles=(view,host,key,items,label,onPick)=>vtTiles(view,host,key,kbOptItems(items),label,onPick,{txt:items.some(it=>it.s!=null)});
const kbOpts=(R,list,right)=>{const all=R.shuffle(list.map((o,i)=>({o,i})));return {items:all.map((x,j)=>Object.assign({},x.o,{id:'ABCD'[j]})),answer:'ABCD'[all.findIndex(x=>x.i===right)]};};
const kbE=(z)=>z.b===1?String(z.a):z.w?'§'+z.w+','+z.a+','+z.b:[z.a,z.b]; /* Teil einer Rechnung für vtX (gemischte Zahlen über kbEx) */
const kbEx=(list)=>eq(...list.map(e=>Array.isArray(e)?frac(e[0],e[1]):typeof e==='string'&&e[0]==='§'?mixed(...e.slice(1).split(',').map(Number)):String(e)));
const kbOptNode=(it)=>it.ex?kbEx(it.ex):kbItemNode(it);
const kbOptItems=(list)=>list.map(it=>({id:it.id,parts:[kbOptNode(it)]}));
/* Lösungszeilen: umwandeln, Regel, Rechnung, kürzen, gemischte Zahl */
function kbSolLines(t){
  const X=kbV(t.x),Y=kbV(t.y),r=kbRes(t),g=simplify(r[0],r[1]),out=[];
  if(kbIsMix(t.x)||kbIsMix(t.y))out.push(line('Erst umwandeln: ',...[t.x,t.y].filter(kbIsMix).map((z,i)=>[i?' und ':'',eq(kbNode(z),'=',frac(kbV(z)[0],kbV(z)[1]))]).flat()));
  if(t.op==='mul'){
    out.push(line(strong('Mal: '),'Zähler mal Zähler, Nenner mal Nenner.'));
    out.push(eq(frac(X[0],X[1]),'·',frac(Y[0],Y[1]),'=',frac(X[0]+' · '+Y[0],X[1]+' · '+Y[1]),'=',frac(r[0],r[1])));
  }else{
    out.push(line(strong('Durch: '),'Nimm mal den Kehrwert der zweiten Zahl.'));
    out.push(eq(frac(X[0],X[1]),':',frac(Y[0],Y[1]),'=',frac(X[0],X[1]),'·',frac(Y[1],Y[0]),'=',frac(r[0],r[1])));
  }
  if(g[0]!==r[0])out.push(line('Gekürzt: ',g[1]===1?String(g[0]):frac(g[0],g[1]),'.'));
  if(g[0]>g[1]&&g[1]>1)out.push(line('Als gemischte Zahl: ',mixed(Math.floor(g[0]/g[1]),g[0]%g[1],g[1]),'.'));
  else if(g[1]===1)out.push(line('Das sind ',strong(g[0]),g[0]===1?' Ganzes.':' Ganze.'));
  return out;
}
/* „von“-Aufgaben: zuerst der Bezug (nur im gefärbten Teil gezählt), dann „von als durch“, dann die Fehlerliste */
function kbVonDiag(t,p,q){
  const X=kbV(t.x),Y=kbV(t.y);
  if(equivalent(p,q,X[0],X[1]))return 'bezug';
  if(equivalent(p,q,X[0]*Y[1],X[1]*Y[0])||equivalent(p,q,Y[0]*X[1],Y[1]*X[0]))return 'vonDurch';
  return kbDiagnose(t,p,q);
}
const kbVonMsg=(t)=>(c)=>c==='bezug'?'Das Ganze ist das ganze Rechteck. Zähle die Felder im ganzen Rechteck.':kbMsgOf(c,t);

/* =====================================================================
   K01 Anteil vom Anteil: falten, ablesen, zuordnen · Knifflig: kleiner, woher, pizza
   x = der Anteil (p/q, Zeilen), y = wovon (r/s, Spalten); Rechteck s × q höchstens 12 Felder
   ===================================================================== */
function kbFoldNums(R){
  return kbFind(R,()=>{
    const s=R.int(2,6),q=R.int(2,6);if(s*q>KB_MAXCELLS)return null;
    const r=R.int(1,s-1),p=R.int(1,q-1);if(gcd(r,s)!==1||gcd(p,q)!==1)return null;
    return kbT('mul',kbZ(p,q),kbZ(r,s));
  },null,kbT('mul',kbZ(2,3),kbZ(3,4)));
}
const kbVon=(t)=>[kbNode(t.x),' von ',kbNode(t.y)];
TASKS.K01=kbStation('K01',{name:'Anteil vom Anteil',desc:'Ein Rechteck in zwei Richtungen teilen: ein Anteil von einem Anteil ist Bruch mal Bruch.',notes:['M29']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K01'),who=kbWho(R);
    if(kind==='pizza'){
      const t=kbFind(R,()=>{const s=R.pick([3,4,6,8]),r=R.int(1,s-1),q=R.pick([2,3,4]),p=R.int(1,q-1);if(gcd(r,s)!==1||gcd(p,q)!==1)return null;return kbT('mul',kbZ(p,q),kbZ(r,s));},null,kbT('mul',kbZ(2,3),kbZ(3,4)));
      return kbBase('K01',level,kind,t,{who});
    }
    const t=kbFoldNums(R);
    if(kind==='zuordnen'){
      const X=kbV(t.x),Y=kbV(t.y),big=compareFrac(X[0],X[1],Y[0],Y[1])>0;
      const list=[{ex:[kbE(t.x),'·',kbE(t.y)]},{ex:[kbE(t.x),'+',kbE(t.y)]},{ex:[kbE(t.y),':',kbE(t.x)]},{ex:big?[kbE(t.x),'−',kbE(t.y)]:[kbE(t.y),'−',kbE(t.x)]}];
      return kbBase('K01',level,kind,t,Object.assign({who},kbOpts(R,list,0)));
    }
    if(kind==='kleiner'){const vs=R.pick(['x','y']),more=R.chance(0.5);return kbBase('K01',level,kind,t,{vs,more});}
    if(kind==='woher'){
      const t2=kbFind(R,()=>{const u=kbFoldNums(R),p=u.x.a,q=u.x.b,r=u.y.a,s=u.y.b;return q!==r&&!(p+r===p*r&&q+s===q*s)?u:null;},null,kbT('mul',kbZ(2,3),kbZ(3,4)));
      const p=t2.x.a,q=t2.x.b,r=t2.y.a,s=t2.y.b;
      const list=[{s:p+' · '+r+' und '+q+' · '+s},{s:p+' · '+s+' und '+q+' · '+r},{s:p+' + '+r+' und '+q+' + '+s},{s:p+' · '+q+' und '+r+' · '+s}];
      const uniq=list.filter((x,i)=>list.findIndex(y=>y.s===x.s)===i);
      return kbBase('K01',level,kind,t2,kbOpts(R,uniq,0));
    }
    return kbBase('K01',level,kind,t,{who});
  },
  prompt(t,h){
    const w=t.who||NAME_LIST;
    switch(t.kind){
      case 'falten':kbQ(h,'Falte ',...kbVon(t),'. Lies dann ab: Welcher Anteil vom ganzen Rechteck ist das?');break;
      case 'ablesen':kbQ(h,'Welcher Anteil vom ganzen Rechteck ist doppelt gefärbt?');h.append(eq(...kbVon(t),'=',kbBlank()));break;
      case 'zuordnen':kbQ(h,w[0]+' nimmt ',...kbVon(t),' Kuchen. Welche Rechnung passt?');break;
      case 'kleiner':kbQ(h,'Ist ',...kbVon(t),' ',t.more?'mehr':'weniger',' als ',kbNode(t[t.vs]),'? Rechne nicht, überlege.');break;
      case 'woher':kbQ(h,'Woher kommen Zähler und Nenner?');h.append(eq(kbNode(t.x),'·',kbNode(t.y),'=',frac(t.x.a*t.y.a,t.x.b*t.y.b)));break;
      default:kbQ(h,'Von einer Pizza ist ',kbNode(t.y),' übrig. '+w[0]+' isst ',kbNode(t.x),' davon. Wie viel Pizza ist das?');
    }
  },
  render(view,host){
    const t=view.task,d=view.draft;
    switch(t.kind){
      case 'falten':{
        const fig=el('div');host.append(fig);
        const stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>'Gefaltet: '+((d.fc||[]).length)+' Spalten, '+((d.fr||[]).length)+' Zeilen'});
        kbFoldWidget(view,fig,stg.box1,t);
        const nx=el('button',{type:'button',class:'btn small'},'Weiter zum Ergebnis',icon('weiter'));nx.disabled=view.locked();
        nx.addEventListener('click',()=>{if(view.locked())return;d.s1=true;view.save();stg.advance();});
        stg.box1.append(nx);stg.box2.append(el('p',null,strong('2. Welcher Anteil vom ganzen Rechteck ist doppelt gefärbt?')));kbAnswerRow(view,stg.box2);stg.upd();return;
      }
      case 'ablesen':host.append(kbFoldFull(t.y.a,t.y.b,t.x.a,t.x.b));kbAnswerRow(view,host);return;
      case 'zuordnen':host.append(kbFoldFull(t.y.a,t.y.b,t.x.a,t.x.b));vtTiles(view,host,'c',kbOptItems(t.items),'Rechnungen');return;
      case 'kleiner':host.append(kbFoldFull(t.y.a,t.y.b,t.x.a,t.x.b));kbYN(view,host);return;
      case 'woher':host.append(kbFoldFull(t.y.a,t.y.b,t.x.a,t.x.b));kbTiles(view,host,'c',t.items,'Erklärungen');return;
      default:vtCircles(null,host,t.y.b,1,{on:new Set(Array.from({length:t.y.a},(_,i)=>i)),maxW:150});kbAnswerRow(view,host,'Anteil der ganzen Pizza');
    }
  },
  validate(t,d){
    const res=kbRes(t),vo={diag:(p,q)=>kbVonDiag(t,p,q),msg:kbVonMsg(t)};
    switch(t.kind){
      case 'falten':{
        const fix=d.s1===true?' Tippe oben auf „ändern“.':'',cols=(d.fc||[]).length,rows=(d.fr||[]).length;
        if(cols!==t.y.a)return wrong('falten',(cols?'Färbe genau '+t.y.a+' von '+t.y.b+' Spalten. Das ist ':'Tippe Spalten an. Färbe zuerst ')+kbTxt(t.y)+'.'+fix,{fold:false});
        if(!d.fq)return invalid('Teile jetzt quer: Tippe auf einen der Knöpfe „quer in …“.');
        if(d.fq!==t.x.b)return wrong('falten','Gesucht ist '+kbTxt(t.x)+'. Teile quer in '+kbDenName(t.x.b)+'.'+fix,{['fq'+d.fq]:false});
        if(rows!==t.x.a)return wrong('falten','Färbe '+t.x.a+' von '+t.x.b+' Zeilen.'+fix,{fold:false});
        if(d.s1!==true)return invalid('Tippe auf „Weiter zum Ergebnis“.');
        return kbAnsCheck(t,d,res,Object.assign({okText:'Richtig! '+kbTxt(t.x)+' von '+kbTxt(t.y)+' = '+kbProofText(t)},vo));
      }
      case 'ablesen':case 'pizza':return kbAnsCheck(t,d,res,Object.assign({okText:'Richtig! Von heißt mal: '+kbProofText(t)},vo));
      case 'zuordnen':return kbChoice(d,'c',t.answer,'Von heißt mal. Ein Anteil von einem Anteil ist eine Mal-Aufgabe.','vonDurch')||right('Richtig! '+kbTxt(t.x)+' von '+kbTxt(t.y)+' heißt '+kbTxt(t.x)+' · '+kbTxt(t.y)+'.');
      case 'kleiner':{
        const ref=kbV(t[t.vs]),c=compareFrac(res[0],res[1],ref[0],ref[1]),want=(t.more?c>0:c<0)?'ja':'nein';
        return kbYNCheck(d,want,'Richtig! '+kbProofText(t)+' Mal einen Bruch kleiner als 1 macht kleiner.','Ein Anteil von etwas ist weniger als das Ganze. Vergleiche im Bild.');
      }
      case 'woher':return kbChoice(d,'c',t.answer,'Zähle im Bild: Wie viele Felder sind doppelt gefärbt? Wie viele hat das Rechteck?')||right('Richtig! Oben steht Zähler mal Zähler, unten Nenner mal Nenner.');
    }
    return invalid('Unbekannte Aufgabe.');
  },
  solution(t){
    const out=[kbFoldFull(t.y.a,t.y.b,t.x.a,t.x.b),line(strong('Von heißt mal. '),'Das Ganze ist das ganze Rechteck.')];
    return out.concat(kbSolLines(t));
  },
  onRight(t){if(t.kind==='kleiner')kbCount('vorhersage');}
});

/* =====================================================================
   K02 Wie oft passt der Bruch hinein? stamm, gruppen, bruchMessen, groesser · Knifflig: rest, bruchRest, strahl, gefaess
   Messen am Streifen: Leicht ohne Rest, Knifflig mit Rest. Keine Regel „gleichnamig machen“ (die Teilung dient nur dem Messen).
   ===================================================================== */
function kbMeasureNums(R,o){
  return kbFind(R,()=>{
    const n=R.int(1,o.maxN||4),b=R.pick(o.bs||[2,3,4,6]),a=o.unit?1:R.int(2,b-1);
    if(gcd(a,b)!==1||n*b>KB_MAXCELLS)return null;
    const t=kbT('div',kbNat(n),kbZ(a,b)),r=kbRes(t);
    if(o.rest===false&&!kbWhole(r))return null;
    if(o.rest===true&&(kbWhole(r)||r[0]<r[1]))return null;
    if(simplify(r[0],r[1])[0]<2&&o.rest===false)return null;
    return t;
  },null,o.rest?kbT('div',kbNat(2),kbZ(3,4)):kbT('div',kbNat(3),kbZ(1,2)));
}
function kbFracMeasure(R,rest){
  return kbFind(R,()=>{
    const L=R.pick(rest?[4,6,8,9,10,12]:[4,6,8,10,12]),q=R.int(1,L-2),p=R.int(q+1,L-1);
    if((p%q===0)===rest||(!rest&&p/q<2))return null;
    const x=simplify(p,L),y=simplify(q,L);
    if(lcm(x[1],y[1])!==L||x[1]===1||y[1]===1)return null;
    const t=kbT('div',kbZ(x[0],x[1]),kbZ(y[0],y[1]));
    return t;
  },null,rest?kbT('div',kbZ(5,6),kbZ(1,3)):kbT('div',kbZ(3,4),kbZ(1,4)));
}
const KB_GLAS=[[1,2,4],[1,2,2],[2,1,2],[1,1,4],[2,1,4],[1,3,4],[2,3,4],[1,1,2]];
TASKS.K02=kbStation('K02',{name:'Wie oft passt der Bruch hinein?',desc:'Ein Messstück an einen Streifen anlegen und zählen: Durch einen Bruch teilen heißt messen.',notes:['M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K02'),who=kbWho(R);
    switch(kind){
      case 'stamm':return kbBase('K02',level,kind,kbMeasureNums(R,{unit:true,rest:false}));
      case 'gruppen':return kbBase('K02',level,kind,kbMeasureNums(R,{rest:false,bs:[3,4,5,6]}));
      case 'bruchMessen':return kbBase('K02',level,kind,kbFracMeasure(R,false));
      case 'groesser':{
        const big=R.chance(0.6),x=R.chance(0.5)?kbNat(R.int(2,9)):kbProper(R,[3,4,5,6,8]);
        const y=big?kbProper(R,[2,3,4,5,6]):kbFind(R,()=>{const b=R.int(2,5),a=R.int(b+1,2*b-1);return gcd(a,b)===1?kbT('div',x,kbZ(a,b)):null;},null,kbT('div',x,kbZ(3,2))).y;
        return kbBase('K02',level,kind,kbT('div',x,y),{big});
      }
      case 'rest':return kbBase('K02',level,kind,kbMeasureNums(R,{rest:true,maxN:3}));
      case 'bruchRest':return kbBase('K02',level,kind,kbFracMeasure(R,true));
      case 'strahl':return kbBase('K02',level,kind,kbMeasureNums(R,{rest:false,bs:[2,3,4,5,6]}));
      default:{
        const [w,a,b]=R.pick(KB_GLAS),dd=b===2?R.pick([2,4]):4;
        return kbBase('K02',level,kind,kbT('div',kbZ(a,b,w),kbZ(1,dd)),{who});
      }
    }
  },
  prompt(t,h){
    const w=t.who||NAME_LIST;
    switch(t.kind){
      case 'stamm':case 'bruchMessen':case 'rest':case 'bruchRest':kbQ(h,'Wie oft passt ',kbNode(t.y),' in ',kbNode(t.x),'? Rechne ',el('span',{class:'kbinl'},kbExpr(t)),'.');break;
      case 'gruppen':kbQ(h,'Lege das Messstück ',kbNode(t.y),' an, bis nichts mehr passt: ',el('span',{class:'kbinl'},kbExpr(t)),'.');break;
      case 'groesser':kbQ(h,'Ist das Ergebnis größer als ',kbNode(t.x),'? Rechne nicht, überlege.');h.append(kbExpr(t));break;
      case 'strahl':kbQ(h,'Wie viele Sprünge der Länge ',kbNode(t.y),' passen von 0 bis ',kbNode(t.x),'?');h.append(kbExpr(t,kbBlank()));break;
      default:kbQ(h,'Eine Flasche hat ',kbNode(t.x),' l Saft. Ein Glas fasst ',kbNode(t.y),' l. Wie viele Gläser kann '+w[0]+' füllen?');
    }
  },
  render(view,host){
    const t=view.task,d=view.draft;
    switch(t.kind){
      case 'gruppen':{
        const fig=el('div');host.append(fig);
        const stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>(d.ml||0)+' Messstücke angelegt'});
        stg.box1.append(el('p',null,strong('1. Lege das Messstück so oft an, wie es passt.')));
        kbMeasure(view,fig,t,{ctl:stg.box1});
        const nx=el('button',{type:'button',class:'btn small'},'Weiter zum Ergebnis',icon('weiter'));nx.disabled=view.locked();
        nx.addEventListener('click',()=>{if(view.locked())return;d.s1=true;view.save();stg.advance();});
        stg.box1.append(nx);kbIntRow(view,stg.box2,'So oft passt es:');stg.upd();return;
      }
      case 'groesser':kbYN(view,host);return;
      case 'strahl':lineWidget(view,host,{from:0,to:t.x.a,parts:t.y.b,labels:'wholes',label:'Zahlenstrahl von 0 bis '+t.x.a+' in '+kbDenName(t.y.b)});kbIntRow(view,host,'Sprünge:');return;
      case 'stamm':case 'bruchMessen':case 'gefaess':kbMeasure(view,host,t);kbIntRow(view,host,t.kind==='gefaess'?'Gläser:':'So oft passt es:');return;
      default:kbMeasure(view,host,t);kbAnswerRow(view,host,'So oft passt es');
    }
  },
  validate(t,d){
    const res=kbRes(t),g=simplify(res[0],res[1]);
    switch(t.kind){
      case 'groesser':{const want=t.big?'ja':'nein';return kbYNCheck(d,want,t.big?'Richtig! '+kbTxt(t.y)+' ist kleiner als 1. Es passt öfter hinein. '+kbProofText(t):'Richtig! '+kbTxt(t.y)+' ist größer als 1. Es passt seltener hinein.',
        t.big?kbMsgOf('kleinerErwartet',t):'Das Messstück ist größer als 1. Passt es dann öfter oder seltener hinein?',t.big?'kleinerErwartet':'groesse');}
      case 'gruppen':{
        const I=kbMeasureInfo(kbV(t.x),kbV(t.y)),ml=d.ml||0;
        if(ml!==I.full)return wrong('messen',(ml<I.full?'Es passt noch ein Messstück.':'Zu viele Messstücke.')+(d.s1===true?' Tippe oben auf „ändern“.':''),{ml:false});
        if(d.s1!==true)return invalid('Tippe auf „Weiter zum Ergebnis“.');
        return kbIntCheck(t,d,g[0],{msg:()=>'Zähle die angelegten Messstücke.'});
      }
      case 'stamm':case 'bruchMessen':case 'strahl':case 'gefaess':return kbIntCheck(t,d,g[0],{okText:'Richtig! '+kbTxt(t.y)+' passt '+g[0]+'-mal in '+kbTxt(t.x)+'. '+kbProofText(t),msg:(c)=>c==='wert'?(t.kind==='strahl'?'Zähle die Sprünge. Ein Sprung ist '+t.y.a+(t.y.a===1?' Abschnitt':' Abschnitte')+' lang.':'Lege das Messstück an und zähle mit.'):kbMsgOf(c,t)});
      default:return kbAnsCheck(t,d,res,{okText:'Richtig! '+kbProofText(t)+' Der Rest ist ein Teil vom Messstück.'});
    }
  },
  solution(t){
    const out=[];
    if(t.kind==='strahl')out.push(line('Ein Sprung ist '+kbTxt(t.y)+' lang. Zähle die Sprünge bis '+kbTxt(t.x)+'.'));
    else if(t.kind!=='groesser')out.push(kbMeasureFig(kbV(t.x),kbV(t.y),99));
    out.push(line(strong('Wie oft passt '),kbNode(t.y),strong(' in '),kbNode(t.x),strong('?')));
    const I=kbMeasureInfo(kbV(t.x),kbV(t.y));
    if(I.rest)out.push(line(I.full+' Messstücke passen ganz. Der Rest ist '+I.rest+' von '+I.vu+' Teilen eines Messstücks.'));
    return out.concat(kbSolLines(t));
  },
  onRight(t){if(t.kind==='rest'||t.kind==='bruchRest')kbCount('rest');}
});

/* =====================================================================
   K03 Bruch mal Bruch: rechnen, natuerlich, kleiner · Knifflig: vorher (vollständig gekürzt), quadrat, luecke
   ===================================================================== */
function kbMulNums(R,level,o){
  o=o||{};
  const bs=level===1?[2,3,4,5,6,7,8,9,10]:[3,4,5,6,7,8,9,10,12,15,16,20];
  return kbFind(R,()=>{
    const t=kbT('mul',kbProper(R,bs),kbProper(R,bs)),X=kbV(t.x),Y=kbV(t.y);
    if(o.cross!=null&&((gcd(X[0],Y[1])>1||gcd(Y[0],X[1])>1)!==o.cross))return null;
    if(X[1]===Y[1]&&X[0]===Y[0])return null;
    return t;
  },null,kbT('mul',kbZ(2,3),kbZ(3,4)));
}
const kbPow=(z)=>el('span',{class:'kbpow'},'(',kbNode(z),')',el('sup',null,'2'));
TASKS.K03=kbStation('K03',{name:'Bruch mal Bruch',desc:'Zähler mal Zähler, Nenner mal Nenner. Vor dem Ausrechnen kürzen.',notes:['M29','M3']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K03');
    switch(kind){
      case 'natuerlich':{const t=kbFind(R,()=>{const f=kbProper(R,[2,3,4,5,6,7,8,9,10]),n=kbNat(R.int(2,9));return R.chance(0.5)?kbT('mul',f,n):kbT('mul',n,f);},null,kbT('mul',kbZ(3,4),kbNat(7)));return kbBase('K03',level,kind,t);}
      case 'kleiner':{
        const up=R.chance(0.4),t=up?kbFind(R,()=>{const b=R.int(2,6),a=R.int(b+1,2*b-1);if(gcd(a,b)!==1)return null;return kbT('mul',kbZ(a,b),kbProper(R,[3,4,5,6,7,8]));},null,kbT('mul',kbZ(5,4),kbZ(2,3))):kbMulNums(R,1);
        return kbBase('K03',level,kind,t,{less:R.chance(0.5)});
      }
      case 'vorher':return kbBase('K03',level,kind,kbMulNums(R,2,{cross:true}));
      case 'quadrat':return kbBase('K03',level,kind,(()=>{const z=kbProper(R,[2,3,4,5,6,7,8,9,10],{notOne:R.chance(0.6)});return kbT('mul',z,Object.assign({},z));})());
      case 'luecke':return kbBase('K03',level,kind,kbMulNums(R,level));
      default:return kbBase('K03',level,kind,kbMulNums(R,level));
    }
  },
  prompt(t,h){
    switch(t.kind){
      case 'kleiner':kbQ(h,'Ist das Ergebnis ',t.less?'kleiner':'größer',' als ',kbNode(t.y),'? Rechne nicht, überlege.');h.append(kbExpr(t));break;
      case 'vorher':kbQ(h,'Kürze vor dem Ausrechnen. Schreibe das Ergebnis vollständig gekürzt.');h.append(kbExpr(t));break;
      case 'quadrat':kbQ(h,'Rechne aus. Das Quadrat ist die Zahl mal sich selbst.');h.append(eq(kbPow(t.x),'=',kbBlank()));break;
      case 'luecke':kbQ(h,'Welcher Bruch fehlt?');break;
      default:kbQ(h,'Rechne aus.');h.append(kbExpr(t));
    }
  },
  render(view,host){
    const t=view.task;
    switch(t.kind){
      case 'kleiner':kbYN(view,host);return;
      case 'luecke':host.append(eq(kbNode(t.x),'·',fracInput(view,'r'),'=',kbFNode(kbRes(t))));return;
      case 'rechnen':case 'quadrat':host.append(el('div',{class:'hnline vtans'},el('span',{class:'hnq'},op('='),el('span',{class:'hnk'},fracInput(view,'r'),el('small',{class:'hnlab'},'Ergebnis')))));return;
      default:kbAnswerRow(view,host,t.kind==='vorher'?'Ergebnis, vollständig gekürzt':'Ergebnis');
    }
  },
  validate(t,d){
    const res=kbRes(t),X=kbV(t.x);
    switch(t.kind){
      case 'kleiner':{const Y=kbV(t.y),c=compareFrac(res[0],res[1],Y[0],Y[1]),want=(t.less?c<0:c>0)?'ja':'nein';
        return kbYNCheck(d,want,'Richtig! '+kbProofText(t),compareFrac(X[0],X[1],1,1)<0?'Mal einen Bruch kleiner als 1 macht kleiner.':kbTxt(t.x)+' ist größer als 1. Dann wird es mehr.');}
      case 'luecke':{
        const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
        const Y=kbV(t.y);
        if(equivalent(f.n,f.d,Y[0],Y[1]))return right('Richtig! Probe: '+kbProofText(t));
        return wrong('luecke','Probe: Rechne '+kbTxt(t.x)+' mal deinen Bruch. Kommt '+kbFT(res)+' heraus?',{'r.n':false,'r.d':false});
      }
      case 'quadrat':return kbAnsCheck(t,d,res,{diag:(p,q)=>equivalent(p,q,2*X[0],X[1])?'quadrat':kbDiagnose(t,p,q),msg:(c)=>c==='quadrat'?'Quadrat heißt mal sich selbst, nicht mal 2.':kbMsgOf(c,t),empty:'Trage das Ergebnis als Bruch ein.'});
      case 'vorher':return kbAnsCheck(t,d,res,{full:true,okText:'Richtig! Vorher kürzen spart Arbeit. '+kbProofText(t)});
      case 'rechnen':return kbAnsCheck(t,d,res,{empty:'Trage das Ergebnis als Bruch ein.'});
      default:return kbAnsCheck(t,d,res,{okText:'Richtig! '+kbTxt(t.x.b===1?t.x:t.y)+' ist '+(t.x.b===1?t.x.a:t.y.a)+'/1. '+kbProofText(t)});
    }
  },
  solution(t){
    const out=[];
    if(t.kind==='vorher'){const X=kbV(t.x),Y=kbV(t.y),g1=gcd(X[0],Y[1]),g2=gcd(Y[0],X[1]);out.push(line(strong('Vorher kürzen: '),(g1>1?X[0]+' und '+Y[1]+' durch '+g1:'')+(g1>1&&g2>1?', ':'')+(g2>1?Y[0]+' und '+X[1]+' durch '+g2:'')+'.'),eq(frac(X[0]/g1,X[1]/g2),'·',frac(Y[0]/g2,Y[1]/g1),'=',kbFNode(kbRes(t))));}
    if(t.kind==='natuerlich')out.push(line('Schreibe die natürliche Zahl als Bruch mit Nenner 1.'));
    if(t.kind==='luecke')out.push(line('Gesucht ist der zweite Bruch: ',kbNode(t.y),'.'));
    return out.concat(kbSolLines(t));
  },
  onRight(t){if(t.kind==='kleiner')kbCount('vorhersage');}
});

/* =====================================================================
   K04 Bruch durch Bruch: kehrwert, regel, zahlDurchBruch, bruchDurchZahl · Knifflig: groesser, vorher, kopf
   ===================================================================== */
function kbDivNums(R,level,o){
  o=o||{};
  const bs=level===1?[2,3,4,5,6,7,8,9,10]:[3,4,5,6,7,8,9,10,12,15,16,20];
  return kbFind(R,()=>{
    const x=o.x?o.x():kbProper(R,bs),y=o.y?o.y():kbProper(R,bs),t=kbT('div',x,y),X=kbV(x),Y=kbV(y),r=kbRes(t);
    if(equivalent(X[0],X[1],Y[0],Y[1]))return null;
    if(o.cross!=null&&((gcd(X[0],Y[0])>1||gcd(X[1],Y[1])>1)!==o.cross))return null;
    if(o.notWhole&&kbWhole(r))return null;
    if(r[0]/r[1]>120)return null;
    return t;
  },null,kbT('div',kbZ(2,3),kbZ(3,4)));
}
TASKS.K04=kbStation('K04',{name:'Bruch durch Bruch',desc:'Durch einen Bruch teilen heißt: mal den Kehrwert. Die erste Zahl bleibt.',notes:['M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K04');
    switch(kind){
      case 'kehrwert':{const z=R.chance(0.25)?kbNat(R.int(2,9)):kbProper(R,[2,3,4,5,6,7,8,9,10],{notOne:true});return kbBase('K04',level,kind,kbT('div',kbNat(1),z));}
      case 'zahlDurchBruch':return kbBase('K04',level,kind,kbDivNums(R,1,{x:()=>kbNat(R.int(2,9)),y:()=>kbProper(R,[2,3,4,5,6,7,8],{notOne:true}),notWhole:true}));
      case 'bruchDurchZahl':return kbBase('K04',level,kind,kbDivNums(R,1,{y:()=>kbNat(R.int(2,9))}));
      case 'groesser':{const big=R.chance(0.6),y=big?kbProper(R,[3,4,5,6,7,8]):kbFind(R,()=>{const b=R.int(2,6),a=R.int(b+1,2*b-1);return gcd(a,b)===1?kbT('div',kbNat(1),kbZ(a,b)):null;},null,kbT('div',kbNat(1),kbZ(5,4))).y;
        return kbBase('K04',level,kind,kbDivNums(R,2,{y:()=>y}),{big});}
      case 'vorher':return kbBase('K04',level,kind,kbDivNums(R,2,{cross:true,notWhole:true}));
      case 'kopf':{
        const t=kbFind(R,()=>{const y=R.chance(0.5)?kbZ(1,R.pick([2,3,4,5])):kbProper(R,[3,4,5,6],{notOne:true}),n=R.int(2,60);const tt=kbT('div',kbNat(n),y),r=kbRes(tt);return kbWhole(r)&&r[0]/r[1]<=120?tt:null;},null,kbT('div',kbNat(45),kbZ(1,2)));
        return kbBase('K04',level,kind,t);
      }
      default:return kbBase('K04',level,kind,kbDivNums(R,1,{notWhole:true}));
    }
  },
  prompt(t,h){
    switch(t.kind){
      case 'kehrwert':kbQ(h,'Wie heißt der Kehrwert?');h.append(eq('Kehrwert von ',kbNode(t.y),'=',kbBlank()));break;
      case 'groesser':kbQ(h,'Ist das Ergebnis größer als ',kbNode(t.x),'? Rechne nicht, überlege.');h.append(kbExpr(t));break;
      case 'vorher':kbQ(h,'Rechne mit dem Kehrwert. Kürze vor dem Ausrechnen.');break;
      case 'kopf':kbQ(h,'Rechne im Kopf.');break;
      default:kbQ(h,'Rechne mit dem Kehrwert.');
    }
  },
  render(view,host){
    const t=view.task;
    switch(t.kind){
      case 'kehrwert':host.append(el('div',{class:'hnline vtans'},el('span',{class:'hnq'},el('span',{class:'hnk'},fracInput(view,'r'),el('small',{class:'hnlab'},'Kehrwert')))));return;
      case 'groesser':kbYN(view,host);return;
      case 'kopf':host.append(eq(kbNode(t.x),':',kbNode(t.y),'=',intInput(view,'z','Ergebnis')));return;
      default:kbWay(view,host,t,{kehr:true,full:t.kind==='vorher',mixed:compareFrac(...kbRes(t),1,1)>0});
    }
  },
  validate(t,d){
    const res=kbRes(t);
    switch(t.kind){
      case 'kehrwert':{
        const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
        const Y=kbV(t.y);
        if(f.n===Y[1]&&f.d===Y[0]||equivalent(f.n,f.d,Y[1],Y[0]))return right('Richtig! Beim Kehrwert tauschst du Zähler und Nenner.'+(t.y.b===1?' '+t.y.a+' ist '+t.y.a+'/1.':''));
        return wrong('kehrwert',equivalent(f.n,f.d,Y[0],Y[1])?'Das ist dieselbe Zahl. Tausche Zähler und Nenner.':'Tausche Zähler und Nenner'+(t.y.b===1?'. '+t.y.a+' ist '+t.y.a+'/1.':'.'),{'r.n':false,'r.d':false});
      }
      case 'groesser':return kbYNCheck(d,t.big?'ja':'nein',t.big?'Richtig! Die zweite Zahl ist kleiner als 1. Sie passt öfter hinein.':'Richtig! Die zweite Zahl ist größer als 1. Es wird weniger.',
        t.big?kbMsgOf('kleinerErwartet',t):'Die zweite Zahl ist größer als 1. Passt sie dann öfter hinein?',t.big?'kleinerErwartet':'groesse');
      case 'kopf':return kbIntCheck(t,d,res[0]/res[1],{okText:'Richtig! '+kbTxt(t.y)+' passt '+(res[0]/res[1])+'-mal in '+t.x.a+'. '+kbProofText(t)});
      default:return kbWayCheck(t,d,{kehr:true,full:t.kind==='vorher',mixed:compareFrac(...res,1,1)>0});
    }
  },
  solution(t){
    if(t.kind==='kehrwert'){const Y=kbV(t.y);return [line('Tausche Zähler und Nenner.'),eq('Kehrwert von ',kbNode(t.y),'=',frac(Y[1],Y[0]))];}
    const out=[];
    if(t.kind==='vorher'){const X=kbV(t.x),Y=kbV(t.y),k=[Y[1],Y[0]],g1=gcd(X[0],k[1]),g2=gcd(k[0],X[1]);out.push(line(strong('Erst den Kehrwert, dann kürzen: '),eq(frac(X[0],X[1]),'·',frac(k[0],k[1]),'=',frac(X[0]/g1,X[1]/g2),'·',frac(k[0]/g2,k[1]/g1))));}
    return out.concat(kbSolLines(t));
  },
  onRight(t){if(t.kind==='groesser')kbCount('vorhersage');}
});

/* =====================================================================
   K05 Gemischte Zahlen mal und durch: umwandelnMal, mal, streifen, kehrwertGem · Knifflig: schaetzen, malGemischt, durchGemischt,
   bruchDurchGem, flaeche. Immer zuerst umwandeln (getrennt rechnen geht nur bei Plus).
   ===================================================================== */
function kbMixNums(R,level,op,o){
  o=o||{};
  const ws=level===1?[1,2,3,4]:[1,2,3,4,5],bs=level===1?[2,3,4,5,6]:[2,3,4,5,6,7,8,9];
  return kbFind(R,()=>{
    const x=o.x?o.x(ws,bs):kbMix(R,ws,bs),y=o.y?o.y(ws,bs):kbMix(R,ws,bs),t=kbT(op,x,y),r=kbRes(t);
    if(o.notWhole&&kbWhole(r))return null;
    if(o.whole&&!kbWhole(r))return null;
    if(r[0]/r[1]>40)return null;
    return t;
  },null,kbT(op,kbZ(1,2,2),kbZ(1,3,1)));
}
TASKS.K05=kbStation('K05',{name:'Gemischte Zahlen mal und durch',desc:'Erst überschlagen, dann umwandeln, dann rechnen. Getrennt rechnen geht nur bei Plus.',notes:['M31','M29','M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K05');
    switch(kind){
      case 'umwandelnMal':return kbBase('K05',level,kind,kbMixNums(R,1,'mul',{y:(ws,bs)=>kbProper(R,bs),notWhole:true}));
      case 'mal':return kbBase('K05',level,kind,kbMixNums(R,1,'mul',{x:(ws,bs)=>kbProper(R,bs)}));
      case 'streifen':{const [w,a,b]=R.pick([[1,1,2],[2,1,2],[1,1,4],[1,3,4],[2,1,4],[1,1,3],[1,2,3],[2,1,3]]),dd=b===2?R.pick([2,4]):b;return kbBase('K05',level,kind,kbT('div',kbZ(a,b,w),kbZ(1,dd)));}
      case 'kehrwertGem':{
        const z=kbMix(R,[1,2,3],[2,3,4,5,6]),Z=kbV(z);
        const list=[{f:[Z[1],Z[0]]},{m:[z.w,z.b,z.a]},{f:[Z[0],Z[1]]},{f:[z.b,z.a]}]; /* richtig · ohne Umwandeln getauscht · nicht getauscht · nur den Bruchteil getauscht */
        return kbBase('K05',level,kind,kbT('div',kbNat(1),z),kbOpts(R,list,0));
      }
      case 'schaetzen':{
        const t=kbMixNums(R,2,'div',{y:(ws,bs)=>kbProper(R,[2,3,4,5,6],{notOne:true}),whole:true});
        const r=kbRes(t)[0]/kbRes(t)[1],c=[r,Math.max(1,Math.round(r/2)),Math.round(r*1.5)+1,r*2+1].filter((v,i,s)=>s.indexOf(v)===i);
        while(c.length<4)c.push(c[c.length-1]+3);
        return kbBase('K05',level,kind,t,kbOpts(R,c.slice(0,4).map(z=>({z})),0));
      }
      case 'malGemischt':return kbBase('K05',level,kind,kbMixNums(R,2,'mul',{notWhole:true}));
      case 'durchGemischt':return kbBase('K05',level,kind,kbMixNums(R,2,'div',{notWhole:true}));
      case 'bruchDurchGem':return kbBase('K05',level,kind,kbMixNums(R,2,'div',{x:(ws,bs)=>kbProper(R,bs),notWhole:true}));
      default:{const [x,y]=R.pick([[kbZ(1,2,1),kbZ(1,2,1)],[kbZ(1,2,1),kbZ(1,3,1)],[kbZ(1,3,1),kbZ(1,2,1)]]);return kbBase('K05',level,'flaeche',kbT('mul',x,y));}
    }
  },
  prompt(t,h){
    switch(t.kind){
      case 'streifen':kbQ(h,'Wie oft passt ',kbNode(t.y),' in ',kbNode(t.x),'? Rechne ',el('span',{class:'kbinl'},kbExpr(t)),'.');break;
      case 'kehrwertGem':kbQ(h,'Welcher Bruch ist der Kehrwert von ',kbNode(t.y),'?');break;
      case 'schaetzen':kbQ(h,'Überschlage: Welches Ergebnis passt? Rechne nicht genau.');h.append(kbExpr(t,'≈ ?'));break;
      case 'flaeche':kbQ(h,'Ein Rechteck ist ',kbNode(t.x),' m lang und ',kbNode(t.y),' m breit. Zähle die Felder. Wie groß ist die Fläche?');break;
      case 'mal':kbQ(h,'Rechne aus. Wandle zuerst um.');h.append(kbExpr(t));break;
      default:kbQ(h,t.op==='div'?'Wandle um und rechne mit dem Kehrwert.':'Wandle um und rechne.');
    }
  },
  render(view,host){
    const t=view.task,big=compareFrac(...kbRes(t),1,1)>0;
    switch(t.kind){
      case 'streifen':kbMeasure(view,host,t);kbIntRow(view,host,'So oft passt es:');return;
      case 'kehrwertGem':vtTiles(view,host,'c',kbOptItems(t.items),'Antworten');return;
      case 'schaetzen':vtTiles(view,host,'c',kbOptItems(t.items),'Überschlag');return;
      case 'flaeche':host.append(kbArea(t.x,t.y));kbAnswerRow(view,host,'Fläche in m²');return;
      case 'mal':kbAnswerRow(view,host);return;
      case 'umwandelnMal':case 'malGemischt':kbWay(view,host,t,{conv:true,mixed:big});return;
      default:kbWay(view,host,t,{conv:true,kehr:true,mixed:big});
    }
  },
  validate(t,d){
    const res=kbRes(t),big=compareFrac(...res,1,1)>0;
    switch(t.kind){
      case 'streifen':return kbIntCheck(t,d,res[0]/res[1],{okText:'Richtig! '+kbProofText(t),msg:(c)=>c==='wert'?'Lege das Messstück an und zähle mit.':kbMsgOf(c,t)});
      case 'kehrwertGem':{const Z=kbV(t.y);return kbChoice(d,'c',t.answer,'Wandle '+kbTxt(t.y)+' zuerst in '+Z[0]+'/'+Z[1]+' um. Tausche dann.','gemKehr')||right('Richtig! '+kbTxt(t.y)+' = '+Z[0]+'/'+Z[1]+'. Der Kehrwert ist '+Z[1]+'/'+Z[0]+'.');}
      case 'schaetzen':{const X=kbV(t.x),Y=kbV(t.y);return kbChoice(d,'c',t.answer,'Runde: '+kbTxt(t.x)+' ist etwa '+Math.round(X[0]/X[1])+'. Wie oft passt '+kbTxt(t.y)+' hinein?','schaetzen')||right('Richtig! '+kbProofText(t));}
      case 'flaeche':return kbAnsCheck(t,d,res,{okText:'Richtig! '+kbProofText(t)+' Im Bild sind es '+(kbV(t.x)[0]*kbV(t.y)[0])+' Felder.'});
      case 'mal':return kbAnsCheck(t,d,res);
      case 'umwandelnMal':case 'malGemischt':return kbWayCheck(t,d,{conv:true,mixed:big});
      default:return kbWayCheck(t,d,{conv:true,kehr:true,mixed:big});
    }
  },
  solution(t){
    const out=[];
    if(t.kind==='flaeche')out.push(kbArea(t.x,t.y),line('Getrennt gerechnet fehlen Streifen. Wandle deshalb immer zuerst um.'));
    if(t.kind==='streifen')out.push(kbMeasureFig(kbV(t.x),kbV(t.y),99));
    if(t.kind==='kehrwertGem'){const Z=kbV(t.y);return [line('Erst umwandeln, dann tauschen.'),eq(kbNode(t.y),'=',frac(Z[0],Z[1]),'→',frac(Z[1],Z[0]))];}
    return out.concat(kbSolLines(t));
  },
  onRight(t){if(t.kind==='schaetzen')kbCount('schaetz');}
});

/* =====================================================================
   K06 Mal oder durch? Sachaufgaben: welcheRechnung, vonBruch, enthalten, vonGemischt · Knifflig: ganzes, teilfuellung, restDeuten,
   rezept, tempo. Jede Aufgabe fragt sichtbar: Was ist hier das Ganze?
   ===================================================================== */
const KB_KAUF=[['Ein Heft kostet','€','Hefte',[[3,4],[1,2],[2,5],[3,5]]],['Ein Glas fasst','l','Gläser',[[1,4],[1,5],[3,10],[2,5]]],['Eine Schleife braucht','m Band','Schleifen',[[2,3],[3,4],[1,3],[2,5]]]];
function kbStoryDiv(R){
  for(let i=0;i<400;i++){
    const [txt,u,things,fr]=R.pick(KB_KAUF),[a,b]=R.pick(fr),n=R.int(2,12),t=kbT('div',kbNat(n),kbZ(a,b)),r=kbRes(t);
    if(!kbWhole(r)||r[0]/r[1]>24||kbCollides(t))continue;
    return Object.assign(t,{story:{txt,u,things}});
  }
  return Object.assign(kbT('div',kbNat(6),kbZ(3,4)),{story:{txt:'Ein Heft kostet',u:'€',things:'Hefte'}});
}
const KB_SACHE={
  vonBruch:(t,w)=>['Von ',kbNode(t.y),' Tafel Schokolade isst '+w[0]+' ',kbNode(t.x),'. Wie viel Tafel ist das?'],
  enthalten:(t,w)=>['Ein Glas fasst ',kbNode(t.y),' l. Wie oft füllt es ',kbNode(t.x),' l Saft?'],
  vonGemischt:(t,w)=>['Für ',String(t.pers),' Personen braucht man ',kbNode(t.y),' kg Butter. '+w[0]+' braucht das ',kbNode(t.x),'-Fache. Wie viel kg?'],
  ganzes:(t,w)=>[kbNode(t.y),' des Feldes sind ',kbNode(t.x),' ha. Wie groß ist das ganze Feld?'],
  teilfuellung:(t,w)=>[w[0]+' hat ',kbNode(t.x),' l Milch. Ein Glas fasst ',kbNode(t.y),' l. Wie voll wird das Glas?'],
  restDeuten:(t,w)=>[w[0]+' hat ',kbNode(t.x),' m Band. Eine Schleife braucht ',kbNode(t.y),' m.'],
  rezept:(t,w)=>['Ein Kuchen braucht ',kbNode(t.x),' Tassen Mehl. '+w[0]+' backt ',kbNode(t.y),' Kuchen. Wie viele Tassen braucht '+w[0]+'?'],
  tempo:(t,w)=>[w[0]+' fährt in ',kbNode(t.y),' Stunde ',kbNode(t.x),' km. Wie weit kommt '+w[0]+' in 1 Stunde?']
};
const KB_ANSLAB={vonBruch:'Anteil der Tafel',enthalten:'So oft füllt es',vonGemischt:'Butter in kg',ganzes:'Das Feld in ha',teilfuellung:'Anteil des Glases',rezept:'Tassen Mehl'};
TASKS.K06=kbStation('K06',{name:'Mal oder durch?',desc:'Sachaufgaben: Was ist das Ganze? Ist ein Anteil gesucht oder wie oft etwas passt?',notes:['M29','M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K06'),who=kbWho(R);
    switch(kind){
      case 'welcheRechnung':{
        const t=kbStoryDiv(R),n=kbE(t.x),y=kbE(t.y);
        const o=kbOpts(R,[{ex:[n,':',y]},{ex:[n,'·',y]},{ex:[y,':',n]},{ex:[n,'−',y]}],0);
        return kbBase('K06',level,kind,t,{who,ops:o.items,opAns:o.answer});
      }
      case 'vonBruch':return kbBase('K06',level,kind,kbFind(R,()=>kbT('mul',kbProper(R,[2,3,4,5]),kbProper(R,[2,3,4]))),{who});
      case 'enthalten':return kbBase('K06',level,kind,kbFind(R,()=>{const b=R.pick([5,8,10,12]),q=R.int(2,b-2),p=R.int(q+1,b-1);if(p%q===0||gcd(q,b)!==1||gcd(p,b)!==1)return null;return kbT('div',kbZ(p,b),kbZ(q,b));},null,kbT('div',kbZ(7,10),kbZ(3,10))),{who});
      case 'vonGemischt':{const [pers,f]=R.pick([[4,kbZ(1,2,1)],[4,kbZ(1,4,1)],[2,kbZ(1,2,1)],[2,kbZ(1,2,2)],[6,kbZ(1,3,1)]]);return kbBase('K06',level,kind,kbFind(R,()=>kbT('mul',f,kbProper(R,[3,4,5,8])),null,kbT('mul',f,kbZ(1,4))),{who,pers});}
      case 'ganzes':return kbBase('K06',level,kind,kbFind(R,()=>{const y=kbProper(R,[3,4,5,6,8],{notOne:true}),x=kbProper(R,[2,3,4,5]);return equivalent(...kbV(x),...kbV(y))?null:kbT('div',x,y);}),{who});
      case 'teilfuellung':return kbBase('K06',level,kind,kbFind(R,()=>{const x=kbProper(R,[2,3,4,5,8,10]),y=kbProper(R,[3,4,5,10]);return compareFrac(...kbV(x),...kbV(y))<0&&!equivalent(...kbV(x),...kbV(y))?kbT('div',x,y):null;}),{who});
      case 'restDeuten':return kbBase('K06',level,kind,kbFind(R,()=>{const n=R.int(2,4),y=kbProper(R,[3,4,5],{notOne:true});if(n*y.b>KB_MAXCELLS)return null;const t=kbT('div',kbNat(n),y);return !kbWhole(kbRes(t))&&compareFrac(...kbRes(t),1,1)>0?t:null;},null,kbT('div',kbNat(2),kbZ(3,4))),{who});
      case 'rezept':return kbBase('K06',level,kind,kbMixNums(R,2,'mul',{y:()=>R.pick([kbZ(1,2,1),kbZ(1,2,2),kbZ(1,3,1)])}),{who});
      default:{const t=kbFind(R,()=>{const y=kbProper(R,[3,4,5,6],{notOne:R.chance(0.7)}),n=R.int(2,40),tt=kbT('div',kbNat(n),y),r=kbRes(tt);return kbWhole(r)&&r[0]/r[1]<=60&&r[0]/r[1]>n?tt:null;},null,kbT('div',kbNat(12),kbZ(3,4)));return kbBase('K06',level,'tempo',t,{who});}
    }
  },
  prompt(t,h){
    const w=t.who||NAME_LIST;
    if(t.kind==='welcheRechnung'){const s=t.story;kbQ(h,s.txt+' ',kbNode(t.y),' '+s.u+'. '+w[0]+' hat '+t.x.a+' '+s.u+'. Wie viele '+s.things+'?');}
    else kbQ(h,...KB_SACHE[t.kind](t,w));
    h.append(el('p',{class:'kbganz'},'Frage dich: Was ist hier das Ganze?'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='welcheRechnung'){
      const stg=hnStages(view,host,[{isDone:()=>!!d.op,summary:()=>{const o=t.ops.find(x=>x.id===d.op);return el('span',null,'Rechnung: ',o?kbEx(o.ex):'');}},{}]);
      stg.boxes[0].append(el('p',null,strong('1. Welche Rechnung passt?')));
      vtTiles(view,stg.boxes[0],'op',kbOptItems(t.ops),'Rechnungen',()=>stg.advance(0));
      stg.boxes[1].append(el('p',null,strong('2. Rechne aus.')));kbIntRow(view,stg.boxes[1],'Anzahl:',t.story.things);
      stg.upd();return;
    }
    if(t.kind==='restDeuten'){
      host.append(el('div',{class:'hnline vtans kbrd',role:'group','aria-label':'Schleifen und Rest'},
        el('span',{class:'hnq'},el('span',{class:'hnk'},intInput(view,'s','Schleifen'),el('small',{class:'hnlab'},'Schleifen'))),
        el('span',{class:'hnq'},el('span',{class:'vtor'},'Rest'),el('span',{class:'hnk'},fracInput(view,'rr'),el('small',{class:'hnlab'},'m Band')))));
      return;
    }
    if(t.kind==='tempo'){kbIntRow(view,host,'In 1 Stunde:','km');return;}
    kbAnswerRow(view,host,KB_ANSLAB[t.kind]||'Ergebnis');
  },
  validate(t,d){
    const res=kbRes(t);
    switch(t.kind){
      case 'welcheRechnung':{
        if(!d.op)return invalid('Wähle zuerst die Rechnung.');
        if(d.op!==t.opAns)return wrong('operation',kbMsgOf('operation',t)+' Tippe oben auf „ändern“.',{['op'+d.op]:false});
        return kbIntCheck(t,d,res[0]/res[1],{okText:'Richtig! '+kbTxt(t.y)+' passt '+(res[0]/res[1])+'-mal in '+t.x.a+'.'});
      }
      case 'vonBruch':return kbAnsCheck(t,d,res,{diag:(p,q)=>kbVonDiag(t,p,q),msg:(c)=>c==='bezug'?'Gesucht ist der Anteil von der ganzen Tafel.':kbMsgOf(c,t),okText:'Richtig! Von heißt mal: '+kbProofText(t)});
      case 'ganzes':return kbAnsCheck(t,d,res,{diag:(p,q)=>{const X=kbV(t.x),Y=kbV(t.y);return equivalent(p,q,...kbMulF(X,Y))?'operation':kbDiagnose(t,p,q);},msg:(c)=>c==='operation'?'Gesucht ist das ganze Feld. Es ist größer als '+kbTxt(t.x)+' ha. Teile durch '+kbTxt(t.y)+'.':kbMsgOf(c,t),okText:'Richtig! Das Ganze ist größer als der Teil. '+kbProofText(t)});
      case 'restDeuten':{
        const s=getInt(d,'s'),f=getFrac(d,'rr'),I=kbMeasureInfo(kbV(t.x),kbV(t.y)),Y=kbV(t.y);
        if(s===null||!f)return invalid('Trage die Zahl der Schleifen und den Rest in Metern ein.');
        if(s!==I.full)return wrong('restDeuten',s>I.full?'Eine angefangene Schleife zählt nicht. Wie viele werden ganz fertig?':'Wie oft passt '+kbTxt(t.y)+' m ganz in '+t.x.a+' m?',{s:false});
        const X=kbV(t.x),rest=[X[0]*Y[1]-I.full*Y[0]*X[1],X[1]*Y[1]];
        if(!equivalent(f.n,f.d,rest[0],rest[1])){
          const rb=equivalent(f.n,f.d,I.rest,I.vu);
          return wrong(rb?'restBezug':'restDeuten',rb?kbFT([I.rest,I.vu])+' ist der Rest von einer Schleife. Wie viel Meter Band sind das?':'Rechne: '+t.x.a+' m minus '+I.full+' Schleifen zu '+kbTxt(t.y)+' m.',{'rr.n':false,'rr.d':false});
        }
        return right('Richtig! '+kbProofText(t)+' Also '+I.full+' Schleifen, Rest '+kbFT(rest)+' m.');
      }
      case 'tempo':return kbIntCheck(t,d,res[0]/res[1],{okText:'Richtig! In 1 Stunde schafft '+(t.who||NAME_LIST)[0]+' mehr. '+kbProofText(t),msg:(c)=>c==='keinKehr'?'In 1 Stunde kommt man weiter als in '+kbTxt(t.y)+' Stunde.':kbMsgOf(c,t)});
      default:return kbAnsCheck(t,d,res,{diag:(p,q)=>{const X=kbV(t.x),Y=kbV(t.y);return t.op==='mul'&&equivalent(p,q,...kbMulF(X,kbKehr(Y)))?'operation':kbDiagnose(t,p,q);}});
    }
  },
  solution(t){
    const out=[];
    const why={welcheRechnung:'Gesucht ist, wie oft der Preis in den Betrag passt: durch.',vonBruch:'Von heißt mal.',enthalten:'Wie oft passt das Glas hinein? Durch.',vonGemischt:'Das …-Fache heißt mal.',
      ganzes:'Ein Teil ist bekannt, das Ganze ist gesucht: durch.',teilfuellung:'Wie oft passt das Glas in die Milch? Weniger als einmal: durch.',restDeuten:'Wie oft passt eine Schleife hinein? Durch.',rezept:'Mehrere Kuchen: mal.',tempo:'Wie oft passt die Zeit in 1 Stunde? Durch.'};
    out.push(line(why[t.kind]||''));
    if(t.kind==='restDeuten'){const I=kbMeasureInfo(kbV(t.x),kbV(t.y));out.push(kbMeasureFig(kbV(t.x),kbV(t.y),99),line(I.full+' Schleifen werden fertig. Der Rest ist '+kbFT([I.rest,I.vu])+' Schleife.'));}
    return out.concat(kbSolLines(t));
  },
  onRight(t){if(t.kind==='restDeuten')kbCount('rest');}
});

/* =====================================================================
   Knobeln K07–K10 (freiwillig)
   ===================================================================== */
TASKS.K07=kbStation('K07',{name:'Null, Eins und Kehrwert',desc:'Was passiert mit 0 und 1? Wann kann man nicht teilen?',notes:['M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K07'),z=kbProper(R,[2,3,4,5,6,7,8,9],{notOne:true});
    if(kind==='durchNull'){const o=kbOpts(R,[{s:'geht nicht'},{z:0},{f:[z.a,z.b]},{f:[z.b,z.a]}],0);return kbBase('K07',level,kind,kbT('div',z,kbNat(1)),o);}
    if(kind==='nullDurch')return kbBase('K07',level,kind,kbT('div',kbNat(1),z));
    if(kind==='selbst')return kbBase('K07',level,kind,kbT('div',z,Object.assign({},z)));
    if(kind==='einsDurch')return kbBase('K07',level,kind,kbT('div',kbNat(1),z));
    return kbBase('K07',level,kind,kbT('mul',z,kbZ(z.b,z.a)));
  },
  prompt(t,h){
    switch(t.kind){
      case 'durchNull':kbQ(h,'Was ergibt die Rechnung?');h.append(eq(kbNode(t.x),':','0','=',kbBlank()));break;
      case 'nullDurch':kbQ(h,'Rechne aus.');h.append(eq('0',':',kbNode(t.y),'=',kbBlank()));break;
      case 'selbst':kbQ(h,'Rechne aus.');h.append(kbExpr(t,kbBlank()));break;
      case 'einsDurch':kbQ(h,'Rechne aus.');h.append(kbExpr(t,kbBlank()));break;
      default:kbQ(h,'Welcher Bruch fehlt?');
    }
  },
  render(view,host){
    const t=view.task;
    switch(t.kind){
      case 'durchNull':kbTiles(view,host,'c',t.items,'Antworten');return;
      case 'nullDurch':case 'selbst':kbIntRow(view,host,'Ergebnis:');return;
      case 'einsDurch':kbAnswerRow(view,host);return;
      default:host.append(eq(kbNode(t.x),'·',fracInput(view,'r'),'=','1'));
    }
  },
  validate(t,d){
    switch(t.kind){
      case 'durchNull':return kbChoice(d,'c',t.answer,kbMsgOf('durchNull',t)+' Keine Zahl mal 0 ergibt '+kbTxt(t.x)+'.','durchNull')||right('Richtig! Durch 0 kannst du nicht teilen.');
      case 'nullDurch':return kbIntCheck(t,d,0,{okText:'Richtig! 0 geteilt durch eine Zahl ist 0.',msg:()=>'Von nichts bleibt nichts: 0 geteilt durch eine Zahl ist 0.'});
      case 'selbst':return kbIntCheck(t,d,1,{okText:'Richtig! Eine Zahl passt genau einmal in sich selbst.',msg:()=>'Wie oft passt '+kbTxt(t.x)+' in '+kbTxt(t.x)+'?'});
      case 'einsDurch':return kbAnsCheck(t,d,kbRes(t),{okText:'Richtig! 1 durch einen Bruch ist sein Kehrwert.'});
      default:{
        const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
        if(equivalent(f.n,f.d,t.x.b,t.x.a))return right('Richtig! Ein Bruch mal sein Kehrwert ergibt 1.');
        return wrong('kehrMal','Ein Bruch mal sein Kehrwert ergibt 1. Tausche Zähler und Nenner.',{'r.n':false,'r.d':false});
      }
    }
  },
  solution(t){
    if(t.kind==='durchNull')return [line('Durch 0 kannst du nicht teilen. Keine Zahl mal 0 ergibt '),kbNode(t.x)];
    if(t.kind==='nullDurch')return [eq('0',':',kbNode(t.y),'=','0')];
    if(t.kind==='selbst')return [kbExpr(t,'1')];
    if(t.kind==='kehrMal')return [line('Ein Bruch mal sein Kehrwert ergibt 1.'),eq(kbNode(t.x),'·',frac(t.x.b,t.x.a),'=','1')];
    return kbSolLines(t);
  }
});
/* K08 Größer oder kleiner? ordnen, vergleich, warum, verdoppeln, verdoppelnDurch – ohne Rechnen */
const KB_WARUM=[{s:'Das Messstück passt öfter als einmal in 1.'},{s:'Durch rechnen macht immer mehr.'},{s:'Der Nenner wird kleiner.'},{s:'Die erste Zahl ist größer.'}];
TASKS.K08=kbStation('K08',{name:'Größer oder kleiner?',desc:'Ohne Rechnen vorhersagen: Wann wird das Ergebnis größer, wann kleiner?',notes:['M29','M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K08');
    if(kind==='ordnen'){
      const n=R.pick([4,6,8,10,12]),k=R.pick([2,3]);
      const list=[{id:'a',e:[n,'·',[1,k]]},{id:'b',e:[n,':',[1,k]]},{id:'c',e:[n,':',k]},{id:'d',e:[n,'·',1]}];
      return {type:'K08',level,kind,n,k,cards:R.shuffle(list),avoid:[]};
    }
    if(kind==='vergleich'){
      const n=R.pick([12,24,60,120]),y1=kbZ(1,2),y2=R.pick([kbZ(3,4),kbZ(2,3),kbZ(3,2),kbZ(5,4),kbZ(1,3),kbZ(1,4)]);
      const o=kbOpts(R,[{e:[n,':',[y1.a,y1.b]]},{e:[n,':',[y2.a,y2.b]]},{s:'Beide gleich'}],compareFrac(1,2,y2.a,y2.b)<0?0:1);
      return {type:'K08',level,kind,n,items:o.items,answer:o.answer,avoid:[]};
    }
    if(kind==='warum'){const n=R.int(2,9),k=R.pick([2,3,4,5]);const o=kbOpts(R,KB_WARUM,0);return {type:'K08',level,kind,n,k,items:o.items,answer:o.answer,avoid:[]};}
    const t=kbFind(R,()=>kbT(kind==='verdoppeln'?'mul':'div',kbProper(R,[3,4,5,6,7]),kbProper(R,[3,5,7,9])),null,kbT('mul',kbZ(3,5),kbZ(2,7)));
    const part=kind==='verdoppeln'?R.pick(['x.a','y.a']):R.pick(['x.a','y.a','y.b']);
    const eff=kind==='verdoppeln'?'doppelt':part==='y.a'?'halb':'doppelt';
    const list=[{s:'Es verdoppelt sich.'},{s:'Es halbiert sich.'},{s:'Es bleibt gleich.'},{s:'Es vervierfacht sich.'}];
    return Object.assign(kbBase('K08',level,kind,t),{part,eff},kbOpts(R,list,eff==='doppelt'?0:1));
  },
  prompt(t,h){
    switch(t.kind){
      case 'ordnen':kbQ(h,'Ordne nach der Größe, ohne zu rechnen.');break;
      case 'vergleich':kbQ(h,'Was ist mehr? Rechne nicht.');break;
      case 'warum':kbQ(h,'Warum ist das Ergebnis größer als ',String(t.n),'?');h.append(eq(String(t.n),':',frac(1,t.k)));break;
      default:{const name={'x.a':'Der Zähler der ersten Zahl','y.a':'Der Zähler der zweiten Zahl','y.b':'Der Nenner der zweiten Zahl'}[t.part];
        kbQ(h,name+' wird verdoppelt. Was passiert mit dem Ergebnis?');h.append(kbExpr(t));}
    }
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='ordnen'){vtOrder(view,host,t.cards.map(c=>({id:c.id,parts:[vtX(c.e)]})));return;}
    kbTiles(view,host,'c',t.items,'Antworten');
  },
  validate(t,d){
    if(t.kind==='ordnen'){
      if(!Array.isArray(d.ord)||d.ord.length<4)return invalid('Tippe alle vier Karten an, die kleinste zuerst.');
      const val={a:t.n/t.k,b:t.n*t.k,c:t.n/t.k,d:t.n},v=d.ord.map(id=>val[id]);
      if(v.some((x,i)=>i&&x<v[i-1]))return wrong('ordnen','Mal einen Bruch kleiner als 1 macht kleiner. Durch einen Bruch kleiner als 1 macht größer.',{ord:false});
      return right('Richtig! Mal '+ft(1,t.k)+' ist dasselbe wie durch '+t.k+'. Durch '+ft(1,t.k)+' macht am meisten.');
    }
    if(t.kind==='vergleich')return kbChoice(d,'c',t.answer,'Das kleinere Messstück passt öfter hinein.','kleinerErwartet')||right('Richtig! Je kleiner das Messstück, desto öfter passt es hinein.');
    if(t.kind==='warum')return kbChoice(d,'c',t.answer,'Denk an das Messen: Wie oft passt '+ft(1,t.k)+' in 1?','kleinerErwartet')||right('Richtig! '+ft(1,t.k)+' passt '+t.k+'-mal in 1. In '+t.n+' passt es '+(t.n*t.k)+'-mal.');
    return kbChoice(d,'c',t.answer,t.kind==='verdoppeln'?'Wird ein Zähler doppelt so groß, wird das Produkt doppelt so groß.':t.part==='y.a'?'Das Messstück wird doppelt so groß. Es passt nur halb so oft hinein.':'Wird ein Zähler oben doppelt so groß, wird das Ergebnis doppelt so groß.','vorhersage')||right('Richtig! '+(t.eff==='doppelt'?'Das Ergebnis verdoppelt sich.':'Das Ergebnis halbiert sich.'));
  },
  solution(t){
    if(t.kind==='ordnen')return [eq(String(t.n),'·',frac(1,t.k),'=',String(t.n),':',String(t.k),'<',String(t.n),'· 1','<',String(t.n),':',frac(1,t.k))];
    if(t.kind==='vergleich'||t.kind==='warum')return [line('Je kleiner das Messstück, desto öfter passt es hinein.')];
    const t2=Object.assign({},t,{x:Object.assign({},t.x),y:Object.assign({},t.y)}),[p,k]=t.part.split('.');t2[p][k]*=2;
    return [line('Vorher: ',kbProofText(t)),line('Nachher: ',kbProofText(t2))];
  },
  onRight(t,d,att){if(!att)kbCount('vorhersage');}
});
/* K09 Fehlerdetektiv: welche (eine von vier Rechnungen ist falsch), warum (Fehler benennen, dann richtig rechnen) */
const KB_ERR={
  kehrDividend:{txt:'Die erste Zahl umgedreht',mk:(R)=>kbDivNums(R,1,{})},
  kehrBeide:{txt:'Beide Zahlen umgedreht',mk:(R)=>kbDivNums(R,1,{})},
  keinKehr:{txt:'Ohne Kehrwert malgenommen',mk:(R)=>kbDivNums(R,1,{})},
  nennerBleibt:{txt:'Nur die Zähler malgenommen',mk:(R)=>kbFind(R,()=>{const t=kbMulNums(R,1);return t.x.b!==t.y.b?t:null;},null,kbT('mul',kbZ(2,3),kbZ(3,4)))},
  gleichnamigMal:{txt:'Erst gleichnamig gemacht',mk:(R)=>kbFind(R,()=>{const t=kbMulNums(R,1);return t.x.b!==t.y.b&&lcm(t.x.b,t.y.b)<=24?t:null;},null,kbT('mul',kbZ(2,3),kbZ(3,4)))},
  gemGetrennt:{txt:'Ganze und Bruchteil getrennt',mk:(R)=>kbMixNums(R,1,'mul',{x:()=>kbMix(R,[1,2],[2,3,4]),y:()=>kbMix(R,[1,2],[2,3,4])})},
  gemKehr:{txt:'Kehrwert ohne Umwandeln',mk:(R)=>kbMixNums(R,1,'div',{x:(ws,bs)=>kbProper(R,bs),y:()=>kbMix(R,[1,2],[2,3,4,5])})},
  restBezug:{txt:'Rest auf das Ganze bezogen',mk:(R)=>kbMeasureNums(R,{rest:true,maxN:3})}
};
const KB_ERR_L1=['kehrDividend','kehrBeide','keinKehr','nennerBleibt'];
function kbErrTask(R,level,code){
  for(let i=0;i<300;i++){
    const t=KB_ERR[code].mk(R),p=kbPatterns(t).find(x=>x[0]===code);
    if(!p)continue;
    const disp=code==='restBezug'?{m:[Math.floor(p[1][0]/p[1][1]),p[1][0]%p[1][1],p[1][1]]}:code==='gemGetrennt'?(()=>{const g=simplify(p[1][0],p[1][1]);return g[0]>g[1]&&g[1]>1?{m:[Math.floor(g[0]/g[1]),g[0]%g[1],g[1]]}:{f:g};})():{f:p[1]};
    return Object.assign(t,{err:code,disp});
  }
  return Object.assign(kbT('div',kbZ(2,3),kbZ(3,4)),{err:'keinKehr',disp:{f:[6,12]}});
}
TASKS.K09=kbStation('K09',{name:'Fehlerdetektiv',desc:'Typische Fehler bei mal und durch finden, erklären und richtig rechnen.',notes:['M29','M30','M31']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K09'),pool=level===1?KB_ERR_L1:Object.keys(KB_ERR),who=kbWho(R);
    if(kind==='welche'){
      const bad=kbErrTask(R,level,R.pick(pool)),rows=[];
      for(let i=0;i<3;i++){const t=R.chance(0.5)?kbMulNums(R,1):kbDivNums(R,1,{});rows.push({op:t.op,x:t.x,y:t.y,disp:{f:simplify(...kbRes(t))}});}
      const all=R.shuffle(rows.concat([{op:bad.op,x:bad.x,y:bad.y,disp:bad.disp,bad:true}])).map((x,i)=>Object.assign(x,{id:'ABCD'[i]}));
      return Object.assign(kbBase('K09',level,kind,bad),{rows:all.map(x=>({id:x.id,op:x.op,x:x.x,y:x.y,disp:x.disp})),answer:all.find(x=>x.bad).id,who,disp:bad.disp});
    }
    const t=kbErrTask(R,level,R.pick(pool)),others=R.shuffle(Object.keys(KB_ERR).filter(c=>c!==t.err&&(c.startsWith('gem')===t.err.startsWith('gem')||c==='rechen'))).slice(0,2);
    const o=kbOpts(R,[t.err].concat(others).map(c=>({s:KB_ERR[c].txt,code:c})).concat([{s:'Richtig gerechnet',code:'ok'}]),0);
    return Object.assign(kbBase('K09',level,kind,t),{who,items:o.items,answer:o.answer});
  },
  prompt(t,h){
    const w=t.who||NAME_LIST;
    if(t.kind==='welche'){kbQ(h,'Kontrolliere die Hausaufgaben von '+w[0]+'. Eine Rechnung ist falsch.');return;}
    kbQ(h,w[0]+' rechnet so. Was ist passiert?');h.append(el('div',{class:'wrongclaim',role:'group','aria-label':'Rechnung von '+w[0]},kbExpr(t,kbItemNode(t.disp))));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='welche'){vtTiles(view,host,'c',t.rows.map(r=>({id:r.id,parts:[eq(kbNode(r.x),kbSign(r.op),kbNode(r.y),'=',kbItemNode(r.disp))]})),'Rechnungen');return;}
    const stg=hnStages(view,host,[{isDone:()=>!!d.c&&d.c===t.answer,summary:()=>{const it=t.items.find(x=>x.id===d.c);return it?it.s:'';}},{}]);
    stg.boxes[0].append(el('p',null,strong('1. Was ist passiert?')));
    kbTiles(view,stg.boxes[0],'c',t.items,'Erklärungen',()=>{if(d.c===t.answer)stg.advance(0);});
    stg.boxes[1].append(el('p',null,strong('2. Rechne richtig.')));kbAnswerRow(view,stg.boxes[1]);
    stg.upd();
  },
  validate(t,d){
    if(t.kind==='welche'){
      if(!d.c)return invalid('Tippe die falsche Rechnung an.');
      if(d.c!==t.answer)return wrong('fehlerWahl','Diese Rechnung stimmt. Rechne die anderen nach.',{['c'+d.c]:false});
      return right('Richtig! '+KB_ERR[t.err].txt+'. Richtig ist: '+kbProofText(t));
    }
    if(!d.c)return invalid('Tippe an, was passiert ist.');
    if(d.c!==t.answer){const it=t.items.find(x=>x.id===d.c);return wrong('fehlerWahl',it&&it.code==='ok'?'Rechne nach: Das Ergebnis stimmt nicht.':'Vergleiche Schritt für Schritt mit der Regel.',{['c'+d.c]:false});}
    return kbAnsCheck(t,d,kbRes(t));
  },
  solution(t){return [line(strong('Der Fehler: '),KB_ERR[t.err].txt+'.')].concat(kbSolLines(t));}
});
/* K10 Zahlenrätsel: gedacht, pfeil (Rückweg), potenz, reihe */
TASKS.K10=kbStation('K10',{name:'Zahlenrätsel',desc:'Gedachte Zahlen, Pfeilbilder, Quadrate und eine Reihe, die immer größer wird.',notes:['M29','M30']},{
  gen(level,R,ctx){
    const kind=kbKindOf(ctx,'K10');
    if(kind==='gedacht'||kind==='pfeil'){
      const t=kbFind(R,()=>{const y=kbProper(R,[2,3,4,5,6],{notOne:true}),u=R.int(2,30),mul=kind==='pfeil'||R.chance(0.6),out=mul?[u*y.a,y.b]:[u*y.b,y.a];if(!kbWhole(out))return null;return Object.assign(kbT(mul?'mul':'div',kbNat(u),y),{out:out[0]/out[1]});},null,Object.assign(kbT('mul',kbNat(6),kbZ(2,3)),{out:4}));
      if(kind==='pfeil'){const o=kbOpts(R,[{e:[':',[t.y.a,t.y.b]]},{e:['·',[t.y.a,t.y.b]]},{e:[':',[t.y.b,t.y.a]]},{e:['−',[t.y.a,t.y.b]]}],0);return Object.assign(kbBase('K10',level,kind,t),{ways:o.items,wayAns:o.answer});}
      return kbBase('K10',level,kind,t);
    }
    if(kind==='potenz'){const z=kbMix(R,[1,2],[2,3,4]);return kbBase('K10',level,kind,kbT('mul',z,Object.assign({},z)));}
    const x=kbProper(R,[3,4,5,7]),T=R.pick([10,20,50,100]);
    let k=0;while(x.a*Math.pow(2,k)<=T*x.b)k++;
    const opts=[k-1,k,k+1,k+2].filter(v=>v>=1).slice(0,4);while(opts.length<4)opts.push(opts[opts.length-1]+1);
    const o=kbOpts(R,opts.map(v=>({f:[1,Math.pow(2,v)]})),opts.indexOf(k));
    return Object.assign(kbBase('K10',level,kind,kbT('div',x,kbZ(1,Math.pow(2,k)))),{T,k,items:o.items,answer:o.answer});
  },
  prompt(t,h){
    if(t.kind==='gedacht'){kbQ(h,'Ich denke mir eine Zahl. ',t.op==='mul'?'Mal ':'Durch ',kbNode(t.y),' ergibt '+t.out+'. Welche Zahl ist es?');return;}
    if(t.kind==='pfeil'){kbQ(h,'Finde die Startzahl mit dem Rückweg.');h.append(eq(el('span',{class:'blank'},'□'),'·',kbNode(t.y),'→',String(t.out)));return;}
    if(t.kind==='potenz'){kbQ(h,'Rechne aus. Wandle zuerst um.');h.append(eq(kbPow(t.x),'=',kbBlank()));return;}
    kbQ(h,'Teile ',kbNode(t.x),' durch 1, dann durch ',frac(1,2),', dann durch ',frac(1,4),' und so weiter. Ab welchem Bruch ist das Ergebnis größer als '+t.T+'?');
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='gedacht'){kbIntRow(view,host,'Die Zahl:');return;}
    if(t.kind==='pfeil'){
      const stg=hnStages(view,host,[{isDone:()=>!!d.way,summary:()=>{const o=t.ways.find(x=>x.id===d.way);return el('span',null,'Rückweg: ',o?vtX(o.e):'');}},{}]);
      stg.boxes[0].append(el('p',null,strong('1. Welcher Rückweg passt?')));
      vtTiles(view,stg.boxes[0],'way',t.ways.map(o=>({id:o.id,parts:[vtX(o.e)]})),'Rückwege',()=>stg.advance(0));
      stg.boxes[1].append(el('p',null,strong('2. Rechne zurück.')));kbIntRow(view,stg.boxes[1],'Startzahl:');stg.upd();return;
    }
    if(t.kind==='potenz'){kbAnswerRow(view,host);return;}
    vtTiles(view,host,'c',kbItems(t.items),'Divisoren');
  },
  validate(t,d){
    if(t.kind==='gedacht')return kbIntCheck(t,d,t.x.a,{diag:()=>'rueckweg',okText:'Richtig! Probe: '+kbProofText(t),msg:()=>'Rechne rückwärts. Die Umkehrung von '+(t.op==='mul'?'mal':'durch')+' '+kbTxt(t.y)+' ist '+(t.op==='mul'?'durch':'mal')+' '+kbTxt(t.y)+'.'});
    if(t.kind==='pfeil'){
      if(!d.way)return invalid('Wähle zuerst den Rückweg.');
      if(d.way!==t.wayAns)return wrong('rueckweg','Die Umkehrung von mal ist durch. Tippe oben auf „ändern“.',{['way'+d.way]:false});
      return kbIntCheck(t,d,t.x.a,{diag:()=>'rueckweg',okText:'Richtig! '+t.out+' : '+kbTxt(t.y)+' = '+t.x.a+'. Probe: '+kbProofText(t),msg:()=>'Rechne '+t.out+' : '+kbTxt(t.y)+' mit dem Kehrwert.'});
    }
    if(t.kind==='potenz')return kbAnsCheck(t,d,kbRes(t));
    return kbChoice(d,'c',t.answer,'Rechne nach: Durch '+ft(1,2)+' verdoppelt das Ergebnis jedes Mal.','reihe')||right('Richtig! '+kbTxt(t.x)+' : '+ft(1,Math.pow(2,t.k))+' = '+kbShow(kbRes(t))+'. Das ist mehr als '+t.T+'.');
  },
  solution(t){
    if(t.kind==='reihe'){const out=[line('Durch '),frac(1,2),line(' verdoppelt das Ergebnis jedes Mal.')];out.push(eq(kbNode(t.x),':',frac(1,Math.pow(2,t.k)),'=',kbFNode(kbRes(t))));return out;}
    if(t.kind==='gedacht'||t.kind==='pfeil'){const back=kbT(t.op==='mul'?'div':'mul',kbNat(t.out),t.y);return [line('Rückwärts rechnen:')].concat(kbSolLines(back));}
    return kbSolLines(t);
  }
});

/* ---------- Spuren für die Abzeichen (nur nach „richtig“, Spielstand S.kb) ---------- */
function kbState(){S.kb=S.kb&&typeof S.kb==='object'?S.kb:{};return S.kb;}
function kbCount(k){const v=kbState();v[k]=(v[k]|0)+1;persist();}
['K01','K02','K03','K04','K05','K06','K07','K08','K09','K10'].forEach(id=>{const own=TASKS[id].onRight;TASKS[id].onRight=function(t,d,att){if(own)own(t,d,att);if(att>0)kbCount('fix');};});
