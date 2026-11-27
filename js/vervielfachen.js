'use strict';
/* =====================================================================
   Etappe V „Brüche vervielfachen und teilen“ (Thema vervielfachen; Konzeption Entwurf 1 vom 24.11.2026, Lehrbuch S. 42–45)
   Nur Bruch · natürliche Zahl und Bruch : natürliche Zahl, auch mit gemischten Zahlen. Bruch · Bruch bleibt für eine eigene Etappe.
   Kern (Bild vor Verfahren): N01 Vervielfachen am Bild (V1) · N02 Teilen am Bild (V2) · N03 Vervielfachen rechnen (V3) ·
        N04 Teilen rechnen (V4) · N05 Gemischte Zahlen (V5) · N06 Sachaufgaben (V6)
   Knobeln (freiwillig): N07 Fehlerdetektiv · N08 Geschickt rechnen · N09 Zahlenrätsel · N10 Tortenwerkstatt
   Die Kennungen N01 … sind intern (V01 ist die Tresortür); im Pfad steht der Etappenbuchstabe V mit Nummer (stationCode).
   Teilen: Standardweg Nenner · n; „Zähler teilen, wenn es aufgeht“ ist ausdrücklich erlaubt (Entscheidung des Lehrers). Geprüft wird der Wert.
   Wertung: Im Rechenweg verlangt das Feld „gekürzt“ das Kürzen (wie in R und H); bei Bild- und Sachaufgaben mit nur einem Feld zählt ein
   ungekürztes oder unechtes Ergebnis als richtig, mit Hinweis. Die gemischte Zahl ist freiwillig, außer die Aufgabe verlangt sie.
   Bildgrenzen: Nenner höchstens 6, höchstens 12 Felder. Kürzen: In jeder Runde lässt sich etwa die Hälfte der Ergebnisse kürzen.
   Fachwörter: Multiplikationsaufgabe, Divisionsaufgabe, Additionsaufgabe (wie im Lehrbuch), neu „vervielfachen“ und „das …-Fache“.
   ===================================================================== */
const VT_NAMES=NAME_LIST;
const vtWho=(R)=>R.shuffle(VT_NAMES).slice(0,3);

/* ---------- Zahlen ---------- */
/* Bruch fürs Bild: a/b, b ≤ 6. mul: Leicht a·n ≤ b, Knifflig a·n > b und alle Ganzen zusammen ≤ 12 Felder. div: b·n ≤ 12 */
function vtPicNums(R,level,op,o){
  o=o||{};
  for(let i=0;i<600;i++){
    const b=R.int(2,6),a=R.int(1,b-1),n=op==='div'?R.pick(o.ns||[2,3]):R.int(2,4);
    if(gcd(a,b)!==1)continue;
    const t={op,w:0,a,b,n};
    if(vtCollides(t))continue;
    if(op==='mul'){
      if(o.over===false||(o.over==null&&level===1)){if(a*n>b)continue;}
      else if(a*n<=b||Math.ceil(a*n/b)*b>VT_MAXCELLS)continue;
      if((a*n)%b===0)continue; /* kein ganzzahliges Ergebnis im Bild (die gemischte Zahl hätte keinen Bruchteil) */
    }else{
      if(b*n>VT_MAXCELLS)continue;
      if(o.group&&a%n!==0)continue;
    }
    return t;
  }
  return op==='mul'?{op,w:0,a:1,b:5,n:3}:{op,w:0,a:3,b:5,n:2};
}
/* Rechenaufgabe: red = Ergebnis kürzbar (true/false) oder egal (null). Leicht: mul b ≤ 12, n ≤ 5; div b ≤ 10, n ≤ 5. Knifflig: mul b ≤ 25, n ≤ 9; div b ≤ 12, n ≤ 9 */
function vtCalcNums(R,level,op,red,o){
  o=o||{};
  const L=level===1?(op==='mul'?{b:12,n:5}:{b:10,n:5}):(op==='mul'?{b:25,n:9}:{b:12,n:9});
  for(let i=0;i<900;i++){
    const b=R.int(3,L.b),n=R.int(2,L.n),a=R.int(1,b-1);
    if(gcd(a,b)!==1)continue;
    const t={op,w:0,a,b,n},r=vtRes(t);
    if(vtCollides(t))continue;
    if(o.under&&r[0]>=r[1])continue;
    if(red!=null&&i<800&&(!isFullyReduced(r[0],r[1]))!==red)continue;
    if(o.zaehler&&a%n!==0)continue;
    return t;
  }
  return op==='mul'?{op,w:0,a:2,b:9,n:4}:{op,w:0,a:3,b:5,n:2};
}
/* Gemischte Zahl w a/b · n oder : n. Leicht nur mul (w 1–4, b bis 10, n bis 6). Knifflig div: glatt (beide Teile gehen auf) oder mit Umwandeln */
function vtMixNums(R,level,op,red,o){
  o=o||{};
  for(let i=0;i<900;i++){
    const b=R.pick([2,3,4,5,6,8,10]),a=R.int(1,b-1),w=R.int(1,level===1?4:9),n=R.int(2,op==='mul'?6:9);
    if(gcd(a,b)!==1)continue;
    const t={op,w,a,b,n},r=vtRes(t);
    if(vtCollides(t))continue;
    if(op==='div'){
      if(o.glatt===true&&(w%n!==0||a%n!==0))continue;
      if(o.glatt===false&&w%n===0&&a%n===0)continue;
      if(r[0]*1>r[1]*20)continue;
    }
    if(red!=null&&i<800&&(!isFullyReduced(r[0],r[1]))!==red)continue;
    return t;
  }
  return op==='mul'?{op,w:2,a:1,b:2,n:3}:{op,w:3,a:1,b:2,n:3};
}

/* ---------- Rundenpläne ---------- */
const VT_PLAN={
  N01:{1:['legen','zuordnen','ergebnis','legen','zuordnen'],2:['ueber1','strahl','groesser1','torte','ueber1']},
  N02:{1:['schneiden','gruppen','ergebnis','schneiden','gruppen'],2:['strahl','ordnen','schneiden','torte','strahl']},
  N03:{1:['rechnen','rechnen','unterschied','rechnen','rechnen'],2:['rechnen','rechnen','groesser1','rechnen','rechnen']},
  N04:{1:['rechnen','rechnen','mehrWeniger','rechnen','rechnen'],2:['rechnen','zaehler','mehrWeniger','rechnen','unterschied']},
  N05:{1:['mul','mul','bild','mul','mul'],2:['mul','div','div','mul','div']},
  N06:{1:['sache','schaetzen','sache','sache','schaetzen'],2:['sache','schaetzen','sache','rezept','sache']},
  N07:{1:['warum','welche','warum','welche','warum'],2:['warum','welche','warum','welche','warum']},
  N08:{1:['vorher','ganz','vorher','ganz','vorher'],2:['vorher','ganz','vorher','vorher','ganz']},
  N09:{1:['luecke','natuerlich','sonder','luecke','luecke'],2:['luecke','natuerlich','luecke','sonder','luecke']},
  N10:{1:['legen','verteilen','legen'],2:['legen','verteilen','legen']}
};
/* Arten mit einem Ergebnis zum Kürzen (halb und halb) */
const VT_RED=['rechnen','zaehler','mul','div'];
function vtCtx(id){
  return (round,level)=>{
    const size=TASKS[id].size,P=(VT_PLAN[id][level]||VT_PLAN[id][1]);
    if(!Array.isArray(round.vt)||round.vt.length!==size)round.vt=oneFormPlan(id,level,P,size); /* eine Form je Runde */
    if(!Array.isArray(round.red)||round.red.length!==size)round.red=hnRedPlan(round.vt,VT_RED);
    const i=Math.min(round.results.length,size-1);
    return {kind:round.vt[i],step:i,red:round.red[i]};
  };
}
const vtKinds=(id,lvl)=>Array.from(new Set(VT_PLAN[id][lvl]||VT_PLAN[id][1]));
const vtRedOf=(R,ctx)=>ctx&&typeof ctx.red==='boolean'?ctx.red:R.chance(0.5);
const vtKindOf=(ctx,id)=>(ctx&&ctx.kind)||VT_PLAN[id][1][0];
function vtStation(id,meta,impl){
  return Object.assign({area:'Rechnen',size:5,ctx:vtCtx(id),planKey:'vt',layoutKinds:(lvl)=>vtKinds(id,lvl)},meta,impl);
}
const vtAvoid=(t)=>[redKey(t.a,t.b)];
const vtBase=(id,level,kind,t,extra)=>Object.assign({type:id,level,kind},t,{avoid:vtAvoid(t)},extra||{});
const vtExpr=(t,end)=>eq(...vtHead(t),...(end===undefined?[]:['=',end]));
/* vier Antworten als Brüche (die richtige gekürzt, Fallen aus den Fehlermustern), als Liste für hnChoice */
function vtFracChoices(R,t,cands){
  const r=simplify(...vtRes(t)),list=rqFracList(R,r,cands.filter(c=>c[1]>0&&c[0]>=1));
  const items=R.shuffle(list.map((f,i)=>({id:'o'+i,f}))); /* nur Daten (Neuladen!), vtTiles zeichnet den Bruch */
  return {items,answer:'o0'};
}
const vtMulCands=(t)=>{const [A,B]=vtVal(t),n=t.n;return [[A*n,B*n],[A,B*n],[A+n,B],[A*n,B+n],[A*n+1,B]];};
const vtDivCands=(t)=>{const [A,B]=vtVal(t),n=t.n;return [[A*n,B],[A*n,B*n],[A,B+n],[A,B*n*n],[A+1,B*n]];};
const vtCands=(t)=>t.op==='mul'?vtMulCands(t):vtDivCands(t);
const vtChoiceCheck=(t,d,key)=>{
  if(!d[key])return invalid('Tippe eine Antwort an.');
  if(d[key]===t.answer)return null;
  const it=t.items.find(x=>x.id===d[key]),c=it?vtDiagnose(t,it.f[0],it.f[1]):null;
  return wrong(c||'wert',c?vtMsgOf(c,t):'Das passt noch nicht. Rechne noch einmal nach.',{[key+d[key]]:false});
};
const vtSolLine=(t)=>{
  const [A,B]=vtVal(t),r=vtRes(t),g=gcd(r[0],r[1]),out=[];
  if(t.w)out.push(line('Erst umwandeln: ',eq(mixed(t.w,t.a,t.b),'=',frac(A,B))));
  out.push(t.op==='mul'?line(strong('Vervielfachen: '),'Den Zähler mal '+t.n+' nehmen. Der Nenner bleibt.'):line(strong('Teilen: '),'Den Nenner mal '+t.n+' nehmen. Der Zähler bleibt.'));
  out.push(t.op==='mul'?eq(frac(A,B),'·',String(t.n),'=',frac(A+' · '+t.n,B),'=',frac(r[0],r[1])):eq(frac(A,B),':',String(t.n),'=',frac(A,B+' · '+t.n),'=',frac(r[0],r[1])));
  if(t.op==='div'&&A%t.n===0)out.push(line('Zweiter Weg: Der Zähler geht glatt auf. ',eq(frac(A,B),':',String(t.n),'=',frac(A/t.n,B))));
  if(g>1)out.push(line('Kürzen: '),eq(frac(r[0],r[1]),'=',frac(r[0]+' : '+g,r[1]+' : '+g),'=',frac(r[0]/g,r[1]/g)));
  else out.push(line('Das Ergebnis lässt sich nicht kürzen.'));
  const s=simplify(r[0],r[1]);
  if(s[0]>s[1]&&s[1]>1)out.push(line('Als gemischte Zahl: ',mixed(Math.floor(s[0]/s[1]),s[0]%s[1],s[1]),'.'));
  else if(s[1]===1)out.push(line('Das sind ',strong(s[0]),' Ganze.'));
  return out;
};
const vtOkText=(t,extra)=>right('Richtig! '+vtProofText(t)+(extra||''));
const vtYN=(view,host,key)=>hnYesNo(view,host,key);
const vtYNCheck=(d,key,want,okMsg,badMsg)=>{
  if(!d[key])return invalid('Tippe Ja oder Nein an.');
  return d[key]===want?right(okMsg):wrong('groesse',badMsg,{[key+d[key]]:false});
};
const vtCmpWord=(t)=>{const [A,B]=vtVal(t),r=vtRes(t);return compareFrac(r[0],r[1],A,B)>0;};

/* =====================================================================
   N01 Vervielfachen am Bild (V1): legen, zuordnen, ergebnis · Knifflig: ueber1, strahl, groesser1, torte
   ===================================================================== */
TASKS.N01=vtStation('N01',{name:'Vervielfachen am Bild',desc:'Einen Anteil mehrmals nehmen: Streifen aneinanderlegen und das Ergebnis ablesen.',notes:['M26']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N01');
    if(kind==='groesser1'){
      const big=R.chance(0.5);
      for(let i=0;i<200;i++){const t=vtPicNums(R,2,'mul',{over:big});if(big===(t.a*t.n>t.b)&&t.a*t.n!==t.b)return vtBase('N01',level,kind,t);}
    }
    if(kind==='torte'){const t=vtPicNums(R,2,'mul',{over:true});return vtBase('N01',level,kind,t,{k:Math.ceil(t.a*t.n/t.b)});}
    const t=vtPicNums(R,level,'mul',{over:kind==='ueber1'||kind==='strahl'?true:level===1?false:null});
    if(kind==='zuordnen'){
      /* Falle C: bei Zähler > 1 „n-mal ein Feld“ (Feld statt Stück gezählt), bei Zähler 1 wäre das dieselbe Rechnung → „ein Stück zu viel“ */
      const sum=(k,f)=>Array.from({length:k},(_,i)=>i?['+',f]:[f]).flat();
      const cMore=t.a===1;
      const adds=[{id:'A',x:sum(t.n,[t.a,t.b])},{id:'B',x:[[t.a,t.b],'+',t.n]},{id:'C',x:cMore?sum(t.n+1,[t.a,t.b]):sum(t.n,[1,t.b])}];
      const muls=[{id:'A',x:[[t.a,t.b],'·',t.n]},{id:'B',x:[[t.a,t.b],':',t.n]},{id:'C',x:[[t.a*t.n,t.b],'·',t.n]},{id:'D',x:[[t.a,t.b*t.n],'·',t.n]}];
      return vtBase('N01',level,kind,t,{adds:R.shuffle(adds),muls:R.shuffle(muls),cMore});
    }
    if(kind==='ergebnis')return vtBase('N01',level,kind,t,vtFracChoices(R,t,vtMulCands(t)));
    return vtBase('N01',level,kind,t);
  },
  prompt(t,h){
    const f=frac(t.a,t.b);
    switch(t.kind){
      case 'legen':h.append(el('p',{class:'q'},'Nimm ',f,' genau ',strong(t.n),'-mal. Lege die Stücke aneinander.'),vtExpr(t));break;
      case 'zuordnen':h.append(el('p',{class:'q'},'Welche Additionsaufgabe und welche Multiplikationsaufgabe passen zum Bild?'));break;
      case 'ergebnis':h.append(el('p',{class:'q'},'Was ist das Ergebnis?'),vtExpr(t,el('span',{class:'blank'},'?')));break;
      case 'ueber1':h.append(el('p',{class:'q'},'Lies am Bild ab. Schreibe das Ergebnis als Bruch und als gemischte Zahl.'),vtExpr(t));break;
      case 'strahl':h.append(el('p',{class:'q'},'Mache ',strong(t.n),' gleich lange Sprünge der Länge ',f,' ab 0. Setze den Punkt ans Ende.'));break;
      case 'groesser1':h.append(el('p',{class:'q'},'Ist das Ergebnis größer als 1? Rechne nicht, schätze.'),vtExpr(t));break;
      default:h.append(el('p',{class:'q'},'Jede Torte hat ',strong(t.b),' Stücke. Färbe ',f,' genau ',strong(t.n),'-mal. Lies dann ab.'),vtExpr(t));
    }
  },
  render(view,host){
    const t=view.task,d=view.draft;
    switch(t.kind){
      case 'legen':{
        const max=Math.min(t.n+1,Math.floor(2*t.b/t.a)),figBox=el('div'),d=view.draft;host.append(figBox);
        const stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>(d.cp||0)+' Stücke gelegt'});
        vtLayer(view,figBox,t,{max,rows:Math.max(1,Math.ceil(t.a*max/t.b)),ctl:stg.box1});
        const nx=el('button',{type:'button',class:'btn small'},'Weiter zum Ergebnis',icon('weiter'));nx.disabled=view.locked();
        nx.addEventListener('click',()=>{if(view.locked())return;d.s1=true;view.save();stg.advance();});
        stg.box1.append(nx);vtAnswerRow(view,stg.box2);stg.upd();return;
      }
      case 'zuordnen':{
        const fig=el('div',{class:'vtfig'},vtStrips(t.a,t.b,t.n));host.append(fig);
        const d=view.draft,chosen=()=>{const it=(t.adds||[]).find(x=>x.id===d.add);return it&&it.x?el('span',null,'Deine Addition: ',vtX(it.x)):'Addition gewählt';};
        const stg=hnStages(view,host,[{isDone:()=>!!d.add,summary:chosen},{}]);
        stg.boxes[0].append(el('p',null,strong('1. Welche Additionsaufgabe passt?')));vtTiles(view,stg.boxes[0],'add',t.adds,'Additionsaufgabe',()=>stg.advance(0));
        stg.boxes[1].append(el('p',null,strong('2. Welche Multiplikationsaufgabe passt?')));vtTiles(view,stg.boxes[1],'mul',t.muls,'Multiplikationsaufgabe');
        stg.upd();
        return;
      }
      case 'ergebnis':host.append(el('div',{class:'vtfig'},vtStrips(t.a,t.b,t.n)));vtTiles(view,host,'c',t.items,'Ergebnis');return;
      case 'ueber1':host.append(el('div',{class:'vtfig'},vtStrips(t.a,t.b,t.n)));
        host.append(el('div',{class:'hnline vtans',role:'group','aria-label':'Ergebnis'},el('span',{class:'hnq'},el('span',{class:'hnk'},fracInput(view,'r'),el('small',{class:'hnlab'},'als Bruch'))),
          el('span',{class:'hnq'},op('='),el('span',{class:'hnk'},hnMixedInput(view),el('small',{class:'hnlab'},'gemischte Zahl')))));return;
      case 'strahl':{const W=Math.ceil(t.a*t.n/t.b);lineWidget(view,host,{from:0,to:W,parts:t.b,labels:'wholes',place:['A'],label:'Zahlenstrahl von 0 bis '+W});vtAnswerRow(view,host,'Wo landest du?');return;}
      case 'groesser1':vtYN(view,host,'yn');return;
      default:vtCircles(view,host,t.b,t.k+1,{maxW:t.k+1>3?76:100});vtAnswerRow(view,host);
    }
  },
  validate(t,d){
    const r=vtRes(t),A=t.a*t.n;
    switch(t.kind){
      case 'legen':{
        const c=d.cp||0;
        if(c===t.n&&d.s1!==true)return invalid('Tippe auf „Weiter zum Ergebnis“.');
        if(c!==t.n&&d.s1===true)return wrong('legen',(c<t.n?`Du hast ${c}-mal gelegt. Du brauchst ${t.n} Stücke.`:`Das sind zu viele Stücke. Du brauchst genau ${t.n}.`)+' Tippe oben auf „ändern“.',{cp:false});
        if(c!==t.n)return c<t.n?wrong('legen',c?`Du hast ${c}-mal gelegt. Lege weiter, bis es ${t.n} Stücke sind.`:'Tippe auf „dazulegen“, um ein Stück zu legen.',{cp:false}):wrong('legen',`Das sind zu viele Stücke. Du brauchst genau ${t.n}.`,{cp:false});
        const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
      }
      case 'zuordnen':{
        if(!d.add||!d.mul)return invalid('Wähle eine Additionsaufgabe und eine Multiplikationsaufgabe.');
        const mulOk=d.mul==='A',addOk=d.add==='A';
        if(!addOk)return wrong('zuordnen',(mulOk?'Die Multiplikation stimmt. Die Addition noch nicht: ':'')+(d.add==='B'?`Das Bild zeigt nicht ${t.n} dazu. Es zeigt ${t.n} gleiche Stücke.`:t.cMore?`Zähle die Stücke im Bild. Es sind ${t.n}.`:'Zähle, wie viele Felder ein Stück hat.')+' Tippe oben auf „ändern“.',{['add'+d.add]:false});
        if(!mulOk)return wrong('zuordnen','Die Addition stimmt. Die Multiplikation noch nicht: '+(d.mul==='B'?'Beim Bild wird es mehr, nicht weniger. Du nimmst mehrmals.':`Ein Stück ist ${t.a}/${t.b}. Davon nimmst du ${t.n}.`),{['mul'+d.mul]:false});
        return right(`Richtig! ${t.n}-mal ${t.a}/${t.b} ist ${t.a}/${t.b} · ${t.n} = ${A}/${t.b}.`);
      }
      case 'ergebnis':{const c=vtChoiceCheck(t,d,'c');return c||vtOkText(t);}
      case 'ueber1':{
        const f=getFrac(d,'r'),mx=hnMixedOf(d);
        if(!f||!mx)return invalid('Trage das Ergebnis als Bruch und als gemischte Zahl ein.');
        if(!equivalent(f.n,f.d,r[0],r[1])){const c=vtDiagnose(t,f.n,f.d)||'wert';return wrong(c,c==='wert'?'Zähle alle gefärbten Felder. Der Nenner ist die Zahl der Teile eines Ganzen.':vtMsgOf(c,t),{'r.n':false,'r.d':false});}
        const g=vtResultCheck(t,{'g.w':d['g.w'],'g.n':d['g.n'],'g.d':d['g.d']},{mixed:true});
        if(g)return g;
        return vtOkText(t);
      }
      case 'strahl':{
        const s=d.nl,i=s&&Array.isArray(s.pts)?s.pts[0]:null;
        if(i==null)return invalid('Setze den Punkt A ans Ende der Sprünge.');
        if(i!==A)return wrong('strahl',i===t.a?`Das ist erst ein Sprung. Du brauchst ${t.n} Sprünge.`:`Ein Sprung ist ${t.a} kleine Abschnitte lang. Zähle ${t.n} Sprünge.`,{nlp0:false});
        const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
      }
      case 'groesser1':{const big=A>t.b;return vtYNCheck(d,'yn',big?'ja':'nein',`Richtig! ${vtProofText(t)} Das ist ${big?'mehr':'weniger'} als 1.`,`Prüfe: ${t.n}-mal ${t.a} Teile sind ${A} Teile. Ein Ganzes hat ${t.b} Teile.`);}
      default:{
        const c=Array.isArray(d.cs)?d.cs.length:0;
        if(c!==A)return wrong('legen',c?`Du hast ${c} Stücke gefärbt. ${t.n}-mal ${t.a} Stücke sind mehr oder weniger?`:'Tippe Tortenstücke an, um sie zu färben.',{cs:false});
        const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
      }
    }
  },
  solution(t){
    const out=[vtStrips(t.a,t.b,t.n)];
    if(t.kind==='zuordnen')out.push(line('Additionsaufgabe: ',eq(...Array.from({length:t.n},(_,i)=>i?['+',frac(t.a,t.b)]:[frac(t.a,t.b)]).flat())),line('Multiplikationsaufgabe: ',eq(frac(t.a,t.b),'·',String(t.n))));
    return out.concat(vtSolLine(t));
  },
  onRight(t){if(t.kind==='groesser1')vtCount('schaetz');}
});

/* =====================================================================
   N02 Teilen am Bild (V2): schneiden, gruppen, ergebnis · Knifflig: strahl, ordnen, schneiden, torte
   ===================================================================== */
TASKS.N02=vtStation('N02',{name:'Teilen am Bild',desc:'Einen Anteil gerecht verteilen: jedes Teil feiner schneiden oder Gruppen bilden.',notes:['M27']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N02'),who=vtWho(R);
    if(kind==='gruppen'){const t=vtPicNums(R,level,'div',{group:true,ns:[2,3]});return vtBase('N02',level,kind,t,{who});}
    if(kind==='ordnen'){
      for(let i=0;i<100;i++){const t=vtPicNums(R,2,'div',{ns:[2]});if(t.b*3<=24)return vtBase('N02',level,kind,t,{shuffle:R.shuffle(['d3','d2','f','m2'])});}
    }
    if(kind==='torte'){const t=vtPicNums(R,2,'div',{ns:[2,3]});return vtBase('N02',level,kind,t,vtFracChoices(R,t,vtDivCands(t)));}
    const t=vtPicNums(R,level,'div',{ns:level===1?[2,3]:[2,3,4]});
    if(kind==='ergebnis')return vtBase('N02',level,kind,t,Object.assign({who},vtFracChoices(R,t,vtDivCands(t))));
    return vtBase('N02',level,kind,t,{who});
  },
  prompt(t,h){
    const f=frac(t.a,t.b),w=t.who||VT_NAMES;
    switch(t.kind){
      case 'schneiden':h.append(el('p',{class:'q'},t.n===2?w[0]+' und '+w[1]+' teilen ':t.n+' Kinder teilen ',f,' einer Blechpizza gerecht.'),vtExpr(t));break;
      case 'gruppen':h.append(el('p',{class:'q'},w[0]+' verteilt ',f,' an ',strong(t.n),' Kinder. Jedes Kind bekommt gleich viel.'),vtExpr(t));break;
      case 'ergebnis':h.append(el('p',{class:'q'},'Jedes Teil wurde in ',strong(t.n),' Stücke geschnitten. Was bekommt jeder?'),vtExpr(t,el('span',{class:'blank'},'?')));break;
      case 'strahl':h.append(el('p',{class:'q'},'Teile die Strecke von 0 bis ',f,' in ',strong(t.n),' gleiche Stücke. Setze den Punkt ans Ende des ersten Stücks.'));break;
      case 'ordnen':h.append(el('p',{class:'q'},'Ordne die vier Zahlen. Rechne nicht aus, überlege nur: mehr oder weniger?'));break;
      default:h.append(el('p',{class:'q'},'Die Torte wird gerecht an ',strong(t.n),' Kinder verteilt. Was bekommt jedes Kind?'),vtExpr(t,el('span',{class:'blank'},'?')));
    }
  },
  render(view,host){
    const t=view.task;
    switch(t.kind){
      case 'schneiden':case 'gruppen':{
        const d=view.draft,stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>t.kind==='schneiden'?'Geschnitten: '+t.b*(d.cut||1)+' Felder, '+((d.sel||[]).length)+' markiert':'Verteilt: '+t.b+' Teile im Ganzen, Kind 1 hat '+((d.grp||[]).filter(x=>x===1).length)});
        if(t.kind==='schneiden')vtCutWidget(view,stg.box1,t);else vtGroupWidget(view,stg.box1,t);
        const nx=el('button',{type:'button',class:'btn small'},'Weiter zum Ergebnis',icon('weiter'));nx.disabled=view.locked();
        nx.addEventListener('click',()=>{if(view.locked())return;d.s1=true;view.save();stg.advance();});
        stg.box1.append(nx);
        stg.box2.append(el('p',null,strong(t.kind==='schneiden'?'2. Was bekommt ein Kind? Schreibe es als Bruch.':'2. Wie viel bekommt jedes Kind?')));vtAnswerRow(view,stg.box2,'Ergebnis',true);
        stg.upd();return;
      }
      case 'ergebnis':host.append(el('div',{class:'vtfig'},vtRect(t.a,t.b,t.n,new Set(Array.from({length:t.a},(_,i)=>i)))));vtTiles(view,host,'c',t.items,'Ergebnis');return;
      case 'strahl':lineWidget(view,host,{from:0,to:1,parts:t.b*t.n,labels:'wholes',place:['A'],shown:[{i:t.a*t.n,text:t.a+'/'+t.b}],label:'Zahlenstrahl von 0 bis 1'});vtAnswerRow(view,host,'Wo endet das erste Stück?');return;
      case 'ordnen':{
        const f=frac(t.a,t.b),map={d3:[f,' : 3'],d2:[f,' : 2'],f:[frac(t.a,t.b)],m2:[f,' · 2']};
        vtOrder(view,host,t.shuffle.map(id=>({id,parts:map[id].map(x=>typeof x==='string'?x:x.cloneNode(true))})));return;
      }
      default:{const on=new Set(Array.from({length:t.a},(_,i)=>i));vtCircles(null,host,t.b,1,{on,maxW:150});vtTiles(view,host,'c',t.items,'Ergebnis');}
    }
  },
  validate(t,d){
    const r=vtRes(t);
    switch(t.kind){
      case 'schneiden':{
        const fix=d.s1===true?' Tippe oben auf „ändern“.':'';
        if(!d.cut)return invalid('Tippe zuerst an, in wie viele Stücke du jedes Teil schneidest.');
        if(d.cut!==t.n)return wrong('schnitt',`Es teilen ${t.n} Kinder. Schneide jedes Teil in ${t.n} Stücke.`+fix,{['cut'+d.cut]:false});
        const s=Array.isArray(d.sel)?d.sel.length:0;
        if(s!==t.a)return wrong('anteil',(s?'Jedes Kind bekommt aus jedem gefärbten Teil ein Stück.':'Tippe die Felder an, die ein Kind bekommt.')+fix,{sel:false});
        if(d.s1!==true)return invalid('Tippe auf „Weiter zum Ergebnis“.');
        const f=vtFracCheck(t,d);if(!f.ok)return f.r;
        return vtOkText(t,f.note);
      }
      case 'gruppen':{
        const per=Array.from({length:t.n},(_,k)=>d.grp?d.grp.filter(x=>x===k+1).length:0);
        if(!d.grp||d.grp.some(x=>!x))return invalid('Verteile alle gefärbten Teile an die Kinder.'+(d.s1===true?' Tippe oben auf „ändern“.':''));
        if(per.some(c=>c!==per[0]))return wrong('gruppen','Gerecht heißt: Jedes Kind bekommt gleich viele Teile.'+(d.s1===true?' Tippe oben auf „ändern“.':''),{grp:false});
        if(d.s1!==true)return invalid('Tippe auf „Weiter zum Ergebnis“.');
        const f=vtFracCheck(t,d,'r',[t.a/t.n,t.b]);if(!f.ok)return f.r;
        return right(`Richtig! ${t.a}/${t.b} : ${t.n} = ${t.a/t.n}/${t.b}. Es bleiben ${vtDenName(t.b)}, nur ihre Anzahl wird geteilt.`+f.note);
      }
      case 'ergebnis':case 'torte':{const c=vtChoiceCheck(t,d,'c');return c||vtOkText(t);}
      case 'strahl':{
        const s=d.nl,i=s&&Array.isArray(s.pts)?s.pts[0]:null;
        if(i==null)return invalid('Setze den Punkt A ans Ende des ersten Stücks.');
        if(i!==t.a)return wrong('strahl',i===t.a*t.n?'Das ist die ganze Strecke. Gesucht ist das erste von '+t.n+' Stücken.':`Teile die ${t.a*t.n} kleinen Abschnitte in ${t.n} gleiche Stücke.`,{nlp0:false});
        const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
      }
      default:{
        if(!Array.isArray(d.ord)||d.ord.length<4)return invalid('Tippe alle vier Karten an, die kleinste zuerst.');
        if(d.ord.join()!=='d3,d2,f,m2')return wrong('ordnen','Teilen macht weniger, durch mehr Kinder noch weniger. Vervielfachen macht mehr.',{ord:false});
        return right(`Richtig! Durch 3 ist weniger als durch 2. Mal 2 ist mehr als ${t.a}/${t.b}.`);
      }
    }
  },
  solution(t){
    if(t.kind==='ordnen'){const f=(n,dd)=>frac(n,dd);return [line('Teilen macht weniger. Vervielfachen macht mehr.'),eq(f(t.a,t.b*3),'<',f(t.a,t.b*2),'<',f(t.a,t.b),'<',f(t.a*2,t.b))];}
    if(t.kind==='gruppen')return [vtStrips(t.a,t.b,1),line(`Jedes Kind bekommt ${t.a/t.n} von ${t.a} Teilen.`),eq(frac(t.a,t.b),':',String(t.n),'=',frac(t.a/t.n,t.b))].concat(vtSolLine(t));
    return [vtRect(t.a,t.b,t.n,new Set(Array.from({length:t.a},(_,i)=>i)))].concat(vtSolLine(t));
  },
  onRight(t,d){if(t.kind==='ordnen')vtCount('schaetz');if(t.kind==='gruppen')vtWay('z');if(t.kind==='schneiden')vtWay('n');}
});

/* =====================================================================
   N03 Vervielfachen rechnen (V3): rechnen (Leicht mit Zwischenschritt), unterschied (erweitert oder vervielfacht?), groesser1
   ===================================================================== */
TASKS.N03=vtStation('N03',{name:'Vervielfachen rechnen',desc:'Den Zähler mal die Zahl nehmen, der Nenner bleibt. Kürzen und gemischte Zahl.',notes:['M26','M3']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N03'),red=vtRedOf(R,ctx);
    if(kind==='unterschied'){const t=vtCalcNums(R,1,'mul',null);return vtBase('N03',level,kind,t,{asks:R.chance(0.5)?'erw':'mul'});}
    if(kind==='groesser1'){const t=vtCalcNums(R,level,'mul',null);return vtBase('N03',level,kind,t);}
    return vtBase('N03',level,kind,vtCalcNums(R,level,'mul',red));
  },
  prompt(t,h){
    if(t.kind==='unterschied'){h.append(el('p',{class:'q'},t.asks==='erw'?'Welche Rechnung ist Erweitern? Dabei bleibt der Anteil gleich groß.':'Welche Rechnung ist Vervielfachen? Dabei wird es mehr.'));return;}
    if(t.kind==='groesser1'){h.append(el('p',{class:'q'},'Ist das Ergebnis größer als 1? Schätze zuerst.'),vtExpr(t));return;}
    h.append(el('p',{class:'q'},'Rechne aus.'),vtExpr(t));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='unterschied'){
      const items=[{id:'erw',parts:[eq(frac(t.a,t.b),'=',frac(t.a*t.n,t.b*t.n))]},{id:'mul',parts:[eq(frac(t.a,t.b),'·',String(t.n),'=',frac(t.a*t.n,t.b))]}];
      vtTiles(view,host,'c',items,'Rechnungen');return;
    }
    if(t.kind==='groesser1'){vtYN(view,host,'yn');return;}
    vtResultBlock(view,host,t,{mid:t.level===1,mixed:true,noHead:false});
  },
  validate(t,d){
    if(t.kind==='unterschied'){
      if(!d.c)return invalid('Tippe eine Rechnung an.');
      return d.c===t.asks?right(t.asks==='erw'?'Richtig! Beim Erweitern bleibt der Anteil gleich groß.':`Richtig! Beim Vervielfachen nimmst du ${t.n}-mal so viel.`):
        wrong('erwMul',t.asks==='erw'?'Diese Rechnung vervielfacht: Nur der Zähler ändert sich, es wird mehr.':'Diese Rechnung erweitert: Zähler und Nenner ändern sich, der Anteil bleibt.',{['c'+d.c]:false});
    }
    if(t.kind==='groesser1'){const A=t.a*t.n,big=A>t.b;return vtYNCheck(d,'yn',big?'ja':'nein',`Richtig! ${vtProofText(t)} Das ist ${big?'mehr':'weniger'} als 1.`,`Prüfe: Der Zähler wird ${A}. Ein Ganzes hat ${t.b} Teile.`);}
    const g=vtResultCheck(t,d,{mid:t.level===1,mixed:true});
    return g||vtOkText(t);
  },
  solution(t){
    if(t.kind==='unterschied')return [line('Erweitern: Zähler und Nenner mal dieselbe Zahl. Der Anteil bleibt.'),eq(frac(t.a,t.b),'=',frac(t.a*t.n,t.b*t.n)),line('Vervielfachen: Nur der Zähler mal die Zahl. Es wird mehr.'),eq(frac(t.a,t.b),'·',String(t.n),'=',frac(t.a*t.n,t.b))];
    return vtSolLine(t);
  },
  onRight(t){if(t.kind==='groesser1')vtCount('schaetz');}
});

/* =====================================================================
   N04 Teilen rechnen (V4): rechnen (Leicht mit Zwischenschritt), zaehler (Zähler geht glatt auf), mehrWeniger, unterschied (gekürzt oder geteilt?)
   ===================================================================== */
TASKS.N04=vtStation('N04',{name:'Teilen rechnen',desc:'Den Nenner mal die Zahl nehmen, der Zähler bleibt. Geht der Zähler glatt auf, darfst du ihn teilen.',notes:['M27','M3']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N04'),red=vtRedOf(R,ctx);
    if(kind==='mehrWeniger'){const op=R.chance(0.5)?'div':'mul',t=vtCalcNums(R,level,op,null);return vtBase('N04',level,kind,t);}
    if(kind==='unterschied'){
      for(let i=0;i<200;i++){const n=R.pick([2,3,4,5]),k=R.int(2,5),b0=R.int(2,6),a0=R.int(1,b0-1);if(gcd(a0,b0)!==1||gcd(a0,n)!==1)continue;
        const t={op:'div',w:0,a:a0*n,b:b0*n,n};if(t.b>30)continue;return vtBase('N04',level,kind,t,{asks:R.chance(0.5)?'kue':'div'});}
    }
    if(kind==='zaehler')return vtBase('N04',level,kind,vtCalcNums(R,level,'div',null,{zaehler:true}));
    return vtBase('N04',level,kind,vtCalcNums(R,level,'div',red));
  },
  prompt(t,h){
    if(t.kind==='mehrWeniger'){h.append(el('p',{class:'q'},'Ist das Ergebnis größer als ',frac(t.a,t.b),'? Rechne nicht, überlege.'),vtExpr(t));return;}
    if(t.kind==='unterschied'){h.append(el('p',{class:'q'},t.asks==='kue'?'Welche Rechnung ist Kürzen? Dabei bleibt es gleich viel.':'Welche Rechnung ist Teilen? Dabei wird es weniger.'));return;}
    if(t.kind==='zaehler'){h.append(el('p',{class:'q'},'Rechne aus. Der Zähler geht glatt auf: Du darfst auch ihn teilen.'),vtExpr(t));return;}
    h.append(el('p',{class:'q'},'Rechne aus.'),vtExpr(t));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='mehrWeniger'){vtYN(view,host,'yn');return;}
    if(t.kind==='unterschied'){
      const g=t.n;
      vtTiles(view,host,'c',[{id:'kue',parts:[eq(frac(t.a,t.b),'=',frac(t.a/g,t.b/g))]},{id:'div',parts:[eq(frac(t.a,t.b),':',String(t.n),'=',frac(t.a,t.b*t.n))]}],'Rechnungen');return;
    }
    vtResultBlock(view,host,t,{mid:t.level===1&&t.kind==='rechnen',mixed:false});
  },
  validate(t,d){
    if(t.kind==='mehrWeniger'){
      const big=vtCmpWord(t);
      return vtYNCheck(d,'yn',big?'ja':'nein',big?`Richtig! Vervielfachen macht mehr. ${vtProofText(t)}`:`Richtig! Beim Teilen bekommt jeder weniger. ${vtProofText(t)}`,
        t.op==='div'?'Beim Teilen bekommt jeder weniger als vorher.':'Du nimmst den Anteil mehrmals. Dann wird es mehr.');
    }
    if(t.kind==='unterschied'){
      if(!d.c)return invalid('Tippe eine Rechnung an.');
      return d.c===t.asks?right(t.asks==='kue'?'Richtig! Beim Kürzen bleibt der Anteil gleich groß.':'Richtig! Beim Teilen wird jedes Stück kleiner.'):
        wrong('kueDiv',t.asks==='kue'?'Diese Rechnung teilt: Der Nenner wird größer, es wird weniger.':'Diese Rechnung kürzt: Zähler und Nenner werden kleiner, der Anteil bleibt.',{['c'+d.c]:false});
    }
    const g=vtResultCheck(t,d,{mid:t.level===1&&t.kind==='rechnen'});
    return g||vtOkText(t);
  },
  solution(t){
    if(t.kind==='unterschied')return [line('Kürzen: Zähler und Nenner durch dieselbe Zahl. Der Anteil bleibt.'),eq(frac(t.a,t.b),'=',frac(t.a/t.n,t.b/t.n)),line('Teilen: Der Nenner mal die Zahl. Es wird weniger.'),eq(frac(t.a,t.b),':',String(t.n),'=',frac(t.a,t.b*t.n))];
    return vtSolLine(t);
  },
  onRight(t,d){
    if(t.kind==='mehrWeniger')vtCount('schaetz');
    if(t.kind==='rechnen'||t.kind==='zaehler'){const r=getFrac(d,'r');if(r&&r.d===t.b&&t.a%t.n===0)vtWay('z');else if(r&&r.d===t.b*t.n)vtWay('n');}
  }
});

/* =====================================================================
   N05 Gemischte Zahlen vervielfachen und teilen (V5): mul, bild (Leicht), div (Knifflig: glatt oder mit Umwandeln)
   ===================================================================== */
TASKS.N05=vtStation('N05',{name:'Gemischte Zahlen',desc:'Gemischte Zahlen vervielfachen und teilen: umwandeln oder getrennt rechnen.',notes:['M28','M26','M27']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N05'),red=vtRedOf(R,ctx);
    if(kind==='bild'){const b=R.pick([2,3,4]),a=1,n=2;return vtBase('N05',level,kind,{op:'mul',w:1,a,b,n});}
    if(kind==='div')return vtBase('N05',level,kind,vtMixNums(R,2,'div',red,{glatt:R.chance(0.4)}));
    return vtBase('N05',level,kind,vtMixNums(R,level,'mul',red));
  },
  prompt(t,h){
    if(t.kind==='bild'){h.append(el('p',{class:'q'},'Nimm ',mixed(t.w,t.a,t.b),' zweimal. Lies am Bild ab.'),vtExpr(t));return;}
    h.append(el('p',{class:'q'},t.op==='div'?'Rechne aus. Tipp: Wandle zuerst in einen Bruch um.':'Rechne aus. Wähle deinen Weg.'),vtExpr(t));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='bild'){host.append(el('div',{class:'vtfig'},vtStrips(t.w*t.b+t.a,t.b,t.n,{rows:Math.ceil((t.w*t.b+t.a)*t.n/t.b)})));vtAnswerRow(view,host);return;}
    vtResultBlock(view,host,t,{mixed:true});
  },
  validate(t,d){
    if(t.kind==='bild'){const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;}
    const g=vtResultCheck(t,d,{mixed:true});
    return g||vtOkText(t);
  },
  solution(t){
    const out=vtSolLine(t);
    if(t.op==='mul'){const r=simplify(...vtRes(t));out.push(line(strong('Getrennt gerechnet: '),eq(t.w+' · '+t.n,'+',frac(t.a,t.b),'· '+t.n,'=',String(t.w*t.n),'+',frac(t.a*t.n,t.b))),line('Beide Wege geben ',vtShow(r[0],r[1]),'.'));}
    return out;
  }
});

/* =====================================================================
   N06 Sachaufgaben (V6): sache (Rechnung wählen, dann rechnen), schaetzen (erst mehr oder weniger als 1?), rezept (Knifflig: Faktor finden)
   ===================================================================== */
/* Kontexte: op, Einheit (Ganzes), Zahlen; txt(t, Namen) */
const VT_STORIES={
  joggen:{op:'mul',unit:'Stunde',fr:[[1,4],[1,2],[3,4],[1,3],[2,3]],ns:[2,3,4,5],txt:(t,w)=>`${w[0]} joggt ${t.n}-mal pro Woche je ${t.a}/${t.b} Stunde. Wie lange ist das insgesamt?`},
  sticker:{op:'mul',unit:'Euro',fr:[[1,2],[1,4],[3,4],[1,5],[2,5]],ns:[3,4,5,6],txt:(t,w)=>`Ein Sticker kostet ${t.a}/${t.b} €. ${w[0]} kauft ${t.n} Sticker. Wie viel Euro kostet das?`},
  flaschen:{op:'mul',unit:'Liter',fr:[[1,2],[3,4],[7,10],[1,3],[2,5]],ns:[2,3,4,6],txt:(t,w)=>`Ein Kasten hat ${t.n} Flaschen mit je ${t.a}/${t.b} l Saft. Wie viel Liter sind das?`},
  pizza:{op:'div',unit:'Pizza',fr:[[3,4],[1,2],[2,3],[4,5],[5,6]],ns:[2,3],txt:(t,w)=>t.n===2?`${w[0]} und ${w[1]} teilen sich ${t.a}/${t.b} Pizza gerecht. Wie viel Pizza bekommt jeder?`:`${w[0]}, ${w[1]} und ${w[2]} teilen sich ${t.a}/${t.b} Pizza gerecht. Wie viel bekommt jeder?`},
  runden:{op:'div',unit:'km',fr:[[3,4],[2,3],[4,5],[6,7],[9,10]],ns:[2,3],txt:(t,w)=>`${w[0]} läuft ${t.a}/${t.b} km in ${t.n} gleich langen Runden. Wie lang ist eine Runde?`},
  band:{op:'div',unit:'Meter',fr:[[3,4],[5,6],[2,3],[4,5]],ns:[2,3,4],txt:(t,w)=>`${w[0]} schneidet ein Band von ${t.a}/${t.b} m in ${t.n} gleich lange Stücke. Wie lang ist ein Stück?`}
};
const VT_UNIT_TXT={Stunde:'1 Stunde',Euro:'1 Euro',Liter:'1 Liter',Pizza:'eine ganze Pizza',km:'1 km',Meter:'1 Meter'};
function vtStoryNums(R,level,o){
  o=o||{};
  const ids=Object.keys(VT_STORIES).filter(k=>!o.op||VT_STORIES[k].op===o.op);
  for(let i=0;i<300;i++){
    const id=R.pick(ids),S=VT_STORIES[id],[a,b]=R.pick(S.fr),n=R.pick(S.ns),t={op:S.op,w:0,a,b,n};
    if(vtCollides(t))continue;
    if(o.big!=null&&(S.op!=='mul'||(a*n>b)!==o.big||a*n===b))continue;
    return Object.assign(t,{story:id});
  }
  return {op:'mul',w:0,a:1,b:4,n:3,story:'joggen'};
}
/* Rezept „Minz-Limo“ für 4 Personen, gesucht für 4·k Personen (mal k) oder für 2 Personen (durch 2) */
const VT_LIMO=[['Zitronensaft',[1,8],'l'],['Orangensaft',[3,8],'l'],['Mineralwasser',[7,10],'l'],['Beeren',[1,4],'kg']];
TASKS.N06=vtStation('N06',{name:'Sachaufgaben',desc:'Mehr oder weniger? Erst die Rechnung wählen, dann rechnen.',notes:['M26','M27']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N06'),who=vtWho(R);
    if(kind==='rezept'){
      const [what,[a,b],u]=R.pick(VT_LIMO),half=R.chance(0.35),k=half?2:R.pick([2,3]),pers=half?2:4*k;
      const t={op:half?'div':'mul',w:0,a,b,n:k};
      const ops=half?[{id:'A',op:'div',n:2},{id:'B',op:'mul',n:2},{id:'C',op:'div',n:4},{id:'D',op:'mul',n:4}]:[{id:'A',op:'mul',n:k},{id:'B',op:'mul',n:pers},{id:'C',op:'div',n:k},{id:'D',op:'mul',n:pers+4}];
      return vtBase('N06',level,kind,t,{who,what,u,pers,ops:R.shuffle(ops)});
    }
    if(kind==='schaetzen'){const big=R.chance(0.5),t=vtStoryNums(R,level,{op:'mul',big});return vtBase('N06',level,kind,t,{who});}
    const t=vtStoryNums(R,level,{});
    const wrongN=t.op==='mul'?t.n+1:t.n+1;
    const ops=R.shuffle([{id:'A',op:t.op,n:t.n},{id:'B',op:t.op==='mul'?'div':'mul',n:t.n},{id:'C',op:t.op,n:wrongN},{id:'D',op:'add',n:t.n}]);
    return vtBase('N06',level,kind,t,{who,ops});
  },
  prompt(t,h){
    if(t.kind==='rezept'){h.append(el('p',{class:'q qa'},`Minz-Limo für 4 Personen: ${t.a}/${t.b} ${t.u} ${t.what}. ${t.who[0]} macht Limo für ${t.pers} Personen. Wie viel ${t.what} braucht ${t.who[0]}?`));return;}
    h.append(el('p',{class:'q qa'},VT_STORIES[t.story].txt(t,t.who)));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    const opItems=(list)=>list.map(o=>({id:o.id,parts:[o.op==='add'?eq(frac(t.a,t.b),'+',String(o.n)):eq(frac(t.a,t.b),vtSign(o.op),String(o.n))]}));
    if(t.kind==='schaetzen'){
      const unit=VT_UNIT_TXT[VT_STORIES[t.story].unit];
      const stg=hnStages(view,host,[{isDone:()=>!!d.yn,summary:()=>'Mehr als '+unit+': '+(d.yn==='ja'?'ja':'nein')},{}]);
      stg.boxes[0].append(el('p',null,strong('1. Schätze zuerst: Ist es mehr als '+unit+'?')));
      hnYesNo(view,stg.boxes[0],'yn',()=>stg.advance(0));
      stg.boxes[1].append(el('p',null,strong('2. Rechne aus.')));vtAnswerRow(view,stg.boxes[1]);
      stg.upd();return;
    }
    const stg=hnStages(view,host,[{isDone:()=>!!d.op,summary:()=>'Rechnung: '+(()=>{const o=t.ops.find(x=>x.id===d.op);return o?(o.op==='add'?t.a+'/'+t.b+' + '+o.n:t.a+'/'+t.b+' '+vtSign(o.op)+' '+o.n):'';})()},{}]);
    stg.boxes[0].append(el('p',null,strong('1. Welche Rechnung passt?')));
    vtTiles(view,stg.boxes[0],'op',opItems(t.ops),'Rechnungen',()=>stg.advance(0));
    stg.boxes[1].append(el('p',null,strong('2. Rechne aus.')));vtAnswerRow(view,stg.boxes[1]);
    stg.upd();
  },
  validate(t,d){
    if(t.kind==='schaetzen'){
      if(!d.yn)return invalid('Schätze zuerst: Tippe Ja oder Nein an.');
      const big=t.a*t.n>t.b;
      if((d.yn==='ja')!==big)return wrong('schaetzen',`Überlege: ${t.n}-mal ${t.a} Teile. Ein Ganzes hat ${t.b} Teile. Tippe oben auf „ändern“.`,{['yn'+d.yn]:false});
      const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
    }
    if(!d.op)return invalid('Wähle zuerst die Rechnung.');
    const o=t.ops.find(x=>x.id===d.op);
    if(o.op!==t.op)return wrong('opFalsch',(t.kind==='rezept'?'Werden es mehr oder weniger Personen?':'Wird es in der Geschichte mehr oder weniger?')+' Wähle danach die Rechnung. Tippe oben auf „ändern“.',{['op'+d.op]:false});
    if(o.n!==t.n)return wrong('faktorFalsch',(t.kind==='rezept'?(t.op==='mul'?`Prüfe die Zahl: Wie oft passen 4 Personen in ${t.pers} Personen?`:'Prüfe die Zahl: Das Rezept ist für 4 Personen.'):'Prüfe die Zahl in der Geschichte.')+' Tippe oben auf „ändern“.',{['op'+d.op]:false});
    const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
  },
  solution(t){
    const out=[];
    if(t.kind==='rezept')out.push(line(t.op==='mul'?`${t.pers} Personen sind ${t.n}-mal so viele wie 4. Du vervielfachst mit ${t.n}.`:'2 Personen sind die Hälfte von 4. Du teilst durch 2.'));
    else out.push(line(t.op==='mul'?'Mehrere gleiche Portionen: Du vervielfachst.':'Gerecht verteilen: Du teilst.'));
    return out.concat(vtSolLine(t));
  },
  onRight(t){if(t.kind==='schaetzen')vtCount('schaetz');}
});

/* =====================================================================
   Knobeln N07–N10
   ===================================================================== */
/* N07 Fehlerdetektiv: warum (Fehler erklären, dann richtig rechnen), welche (eine von vier Rechnungen ist falsch) */
const VT_ERR={
  mulGleich:{txt:'Erweitert statt vervielfacht',mk:(t)=>[t.a*t.n,t.b*t.n]},
  divGleich:{txt:'Gekürzt statt geteilt',mk:(t)=>[t.a/t.n,t.b/t.n]},
  divGroesser:{txt:'Den Nenner geteilt statt malgenommen',mk:(t)=>[t.a,t.b/t.n]},
  gemDivTeil:{txt:'Nur die Ganzen geteilt',mk:(t)=>[(t.w/t.n)*t.b+t.a,t.b]},
  gemNurGanze:{txt:'Den Bruchteil vergessen',mk:(t)=>[t.w*t.n*t.b+t.a,t.b]}
};
function vtErrTask(R,level,code){
  for(let i=0;i<400;i++){
    let t;
    if(code==='mulGleich')t=vtCalcNums(R,1,'mul',null);
    else if(code==='divGleich'){const n=R.pick([2,3,4]),b0=R.int(2,6),a0=R.int(1,b0-1);if(gcd(a0,b0)!==1)continue;t={op:'div',w:0,a:a0*n,b:b0*n,n};}
    else if(code==='divGroesser'){const n=R.pick([2,3]),b0=R.int(2,5),a=R.int(1,b0*n-1);if(gcd(a,b0*n)!==1)continue;t={op:'div',w:0,a,b:b0*n,n};}
    else if(code==='gemDivTeil'){const n=R.pick([2,3]),w=n*R.int(1,2),b=R.pick([2,3,4,5]),a=R.int(1,b-1);if(gcd(a,b)!==1||a%n===0)continue;t={op:'div',w,a,b,n};}
    else t=vtMixNums(R,1,'mul',null);
    if(vtCollides(t))continue;
    const f=VT_ERR[code].mk(t);
    if(equivalent(f[0],f[1],...vtRes(t)))continue;
    return Object.assign(t,{err:code,shown:f});
  }
  return {op:'mul',w:0,a:3,b:5,n:4,err:'mulGleich',shown:[12,20]};
}
TASKS.N07=vtStation('N07',{name:'Fehlerdetektiv',desc:'Typische Fehler finden, erklären und richtig rechnen.',notes:['M26','M27','M28']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N07'),pool=level===1?['mulGleich','divGleich','divGroesser']:['mulGleich','divGleich','divGroesser','gemDivTeil','gemNurGanze'],who=vtWho(R);
    if(kind==='welche'){
      const bad=vtErrTask(R,level,R.pick(pool)),rows=[];
      for(let i=0;i<3;i++){const op=R.chance(0.5)?'mul':'div',t=vtCalcNums(R,level,op,null);rows.push({t,f:simplify(...vtRes(t))});}
      const all=R.shuffle(rows.concat([{t:bad,f:bad.shown,bad:true}])).map((x,i)=>Object.assign(x,{id:'ABCD'[i]}));
      return {type:'N07',level,kind,rows:all.map(x=>({id:x.id,op:x.t.op,w:x.t.w,a:x.t.a,b:x.t.b,n:x.t.n,f:x.f})),answer:all.find(x=>x.bad).id,err:bad.err,op:bad.op,w:bad.w,a:bad.a,b:bad.b,n:bad.n,who,avoid:[]};
    }
    const t=vtErrTask(R,level,R.pick(pool)),codes=R.shuffle(Object.keys(VT_ERR).filter(c=>c!==t.err&&(t.w?true:!c.startsWith('gem')))).slice(0,2);
    const items=R.shuffle([t.err].concat(codes).map(c=>({id:c,parts:[VT_ERR[c].txt]})).concat([{id:'ok',parts:['Richtig gerechnet']}]));
    return vtBase('N07',level,kind,t,{who,items});
  },
  prompt(t,h){
    if(t.kind==='welche'){h.append(el('p',{class:'q'},'Kontrolliere die Hausaufgaben von '+t.who[0]+'. Eine Rechnung ist falsch.'));return;}
    h.append(el('p',{class:'q'},t.who[0]+' rechnet so. Was ist passiert?'),el('div',{class:'wrongclaim',role:'group','aria-label':'Rechnung von '+t.who[0]},vtExpr(t,frac(t.shown[0],t.shown[1]))));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='welche'){
      vtTiles(view,host,'c',t.rows.map(r=>({id:r.id,parts:[eq(...vtHead(r),'=',frac(r.f[0],r.f[1]))]})),'Rechnungen');return;
    }
    const stg=hnStages(view,host,[{isDone:()=>!!d.c&&d.c===t.err,summary:()=>(VT_ERR[d.c]||{txt:''}).txt},{}]);
    stg.boxes[0].append(el('p',null,strong('1. Was ist passiert?')));
    vtTiles(view,stg.boxes[0],'c',t.items,'Erklärungen',()=>{if(d.c===t.err)stg.advance(0);},{txt:true});
    stg.boxes[1].append(el('p',null,strong('2. Rechne richtig.')));vtAnswerRow(view,stg.boxes[1]);
    stg.upd();
  },
  validate(t,d){
    if(t.kind==='welche'){
      if(!d.c)return invalid('Tippe die falsche Rechnung an.');
      if(d.c!==t.answer)return wrong('fehlerWahl','Diese Rechnung stimmt. Rechne die anderen nach.',{['c'+d.c]:false});
      return right(`Richtig! ${VT_ERR[t.err].txt}. Richtig ist: ${vtProofText(t)}`);
    }
    if(!d.c)return invalid('Tippe an, was passiert ist.');
    if(d.c!==t.err)return wrong('fehlerWahl',d.c==='ok'?'Rechne nach: Das Ergebnis stimmt nicht.':'Vergleiche Zähler und Nenner vorher und nachher.',{['c'+d.c]:false});
    const f=vtFracCheck(t,d);return f.ok?vtOkText(t,f.note):f.r;
  },
  solution(t){return [line(strong('Der Fehler: '),VT_ERR[t.err].txt+'.')].concat(vtSolLine(t));}
});
/* N08 Geschickt rechnen: vorher (vor dem Rechnen kürzen, Ergebnis vollständig gekürzt), ganz (Kommt eine ganze Zahl heraus?) */
TASKS.N08=vtStation('N08',{name:'Geschickt rechnen',desc:'Vor dem Rechnen kürzen. Wann kommt eine ganze Zahl heraus?',notes:['M26','M3']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N08');
    for(let i=0;i<500;i++){
      const b=R.int(3,level===1?12:20),a=R.int(1,b-1),n=R.int(2,level===1?9:12);
      if(gcd(a,b)!==1||gcd(n,b)===1)continue;
      const t={op:'mul',w:0,a,b,n};if(vtCollides(t))continue;
      if(kind==='ganz'){const whole=(a*n)%b===0;if(whole!==R.chance(0.5)&&i<300)continue;}
      return vtBase('N08',level,kind,t);
    }
    return vtBase('N08',level,kind,{op:'mul',w:0,a:3,b:4,n:8});
  },
  prompt(t,h){
    if(t.kind==='ganz'){h.append(el('p',{class:'q'},'Kommt eine ganze Zahl heraus? Kürze im Kopf.'),vtExpr(t));return;}
    h.append(el('p',{class:'q'},'Kürze vor dem Rechnen. Schreibe das Ergebnis vollständig gekürzt.'),vtExpr(t));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='ganz'){vtYN(view,host,'yn');return;}
    vtAnswerRow(view,host,'Ergebnis, vollständig gekürzt');
  },
  validate(t,d){
    const r=simplify(...vtRes(t)),g=gcd(t.n,t.b);
    if(t.kind==='ganz'){const whole=r[1]===1;return vtYNCheck(d,'yn',whole?'ja':'nein',`Richtig! ${vtProofText(t)}`,`Kürze ${t.n} und ${t.b} durch ${g}. Bleibt unten eine 1?`);}
    const f=getFrac(d,'r'),mx=hnMixedOf(d);
    if(!f&&!mx)return invalid(MSG_FRAC_INVALID);
    const val=f?[f.n,f.d]:mx.bad?null:[mx.w*mx.d+mx.n,mx.d];
    if(!val)return invalid(MSG_FRAC_INVALID);
    if(!equivalent(val[0],val[1],r[0],r[1])){const c=vtDiagnose(t,val[0],val[1])||'wert';return wrong(c,vtMsgOf(c,t),f?{'r.n':false,'r.d':false}:{'g.w':false,'g.n':false,'g.d':false});}
    const full=f?isFullyReduced(f.n,f.d):isFullyReduced(mx.n,mx.d);
    if(!full)return soft('nochKuerzen',`Dein Ergebnis stimmt. Kürze noch: ${t.n} und ${t.b} sind durch ${g} teilbar.`,f?{'r.n':false,'r.d':false}:{'g.n':false,'g.d':false});
    return right(`Richtig! Kürze erst ${t.n} und ${t.b} durch ${g}. ${vtProofText(t)}`);
  },
  solution(t){
    const g=gcd(t.n,t.b),r=simplify(...vtRes(t));
    return [line(strong('Vorher kürzen: '),t.n+' und '+t.b+' sind durch '+g+' teilbar.'),eq(frac(t.a,t.b),'·',String(t.n),'=',frac(t.a+' · '+(t.n/g),t.b/g),'=',r[1]===1?String(r[0]):frac(r[0],r[1]))];
  }
});
/* N09 Zahlenrätsel: luecke (eine Zahl fehlt), natuerlich (alle n antippen, bei denen eine natürliche Zahl herauskommt), sonder (· 0, · 1, große Zahl) */
TASKS.N09=vtStation('N09',{name:'Zahlenrätsel',desc:'Lücken füllen und Zahlen finden, bei denen eine ganze Zahl herauskommt.',notes:['M26','M27']},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N09');
    if(kind==='natuerlich'){
      for(let i=0;i<200;i++){const b=R.int(3,level===1?7:12),a=R.int(1,b-1);if(gcd(a,b)!==1)continue;
        const list=R.shuffle([b,2*b,3*b,b+1,b-1,2*b-1,b+2,Math.floor(1.5*b)].filter((x,j,s)=>x>1&&s.indexOf(x)===j)).slice(0,6);
        if(list.filter(x=>x%b===0).length<2)continue;
        return {type:'N09',level,kind,op:'mul',w:0,a,b,n:b,list:list.sort((x,y)=>x-y),avoid:[redKey(a,b)]};}
    }
    if(kind==='sonder'){const t=vtCalcNums(R,level,'mul',null),n=R.pick([0,1,level===1?10:R.int(11,20)]);return vtBase('N09',level,kind,Object.assign(t,{n}));}
    /* Lücke: gesucht ist die Zahl (blank 'n'), der Zähler (blank 'a') oder beim Teilen die Zahl */
    const blank=R.pick(['n','a','dn']);
    if(blank==='dn'){const t=vtCalcNums(R,level,'div',null);return vtBase('N09',level,kind,t,{blank});}
    const t=vtCalcNums(R,level,'mul',null);return vtBase('N09',level,kind,t,{blank});
  },
  prompt(t,h){
    if(t.kind==='natuerlich'){h.append(el('p',{class:'q'},'Tippe alle Zahlen an, bei denen eine natürliche Zahl herauskommt.'),eq(frac(t.a,t.b),'·',el('span',{class:'blank'},'?')));return;}
    if(t.kind==='sonder'){h.append(el('p',{class:'q'},'Rechne aus.'),vtExpr(t));return;}
    h.append(el('p',{class:'q'},'Welche Zahl fehlt?'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='natuerlich'){
      if(!Array.isArray(d.pick))d.pick=[];
      const grid=el('div',{class:'tiles tiles-'+t.list.length,role:'group','aria-label':'Zahlen'});
      t.list.forEach(x=>{const b=el('button',{type:'button',class:'tile','aria-pressed':String(d.pick.includes(x))},el('span',{class:'tv'},String(x)));b.disabled=view.locked();
        b.addEventListener('click',()=>{if(view.locked())return;const i=d.pick.indexOf(x);if(i>=0)d.pick.splice(i,1);else d.pick.push(x);view.save();b.setAttribute('aria-pressed',String(d.pick.includes(x)));});
        view.inputs['p'+x]=b;grid.append(b);});
      host.append(grid);return;
    }
    if(t.kind==='sonder'){vtAnswerRow(view,host);host.append(el('div',{class:'addrow'},el('span',{class:'alab'},'oder als ganze Zahl'),intInput(view,'z','ganze Zahl')));return;}
    const r=simplify(...vtRes(t)),res=r[1]===1?String(r[0]):frac(r[0],r[1]);
    const box=intInput(view,'x','fehlende Zahl');
    if(t.blank==='n')host.append(eq(frac(t.a,t.b),'·',box,'=',res));
    else if(t.blank==='a')host.append(eq(el('span',{class:'frac inp',role:'group','aria-label':'Bruch mit fehlendem Zähler'},el('span',{class:'num'},box),el('span',{class:'den'},String(t.b))),'·',String(t.n),'=',frac(t.a*t.n,t.b)));
    else host.append(eq(frac(t.a,t.b),':',box,'=',frac(t.a,t.b*t.n)));
  },
  validate(t,d){
    if(t.kind==='natuerlich'){
      const want=t.list.filter(x=>(t.a*x)%t.b===0),got=(d.pick||[]).slice().sort((x,y)=>x-y);
      if(!got.length)return invalid('Tippe mindestens eine Zahl an.');
      const m={};t.list.forEach(x=>{if(got.includes(x)!==want.includes(x))m['p'+x]=false;});
      if(Object.keys(m).length)return wrong('natuerlich',`Eine natürliche Zahl kommt heraus, wenn ${t.b} in die Zahl passt.`,m);
      return right(`Richtig! Es passt immer, wenn die Zahl ein Vielfaches von ${t.b} ist: ${want.join(', ')}.`);
    }
    if(t.kind==='sonder'){
      const res=[t.a*t.n,t.b],f=getFrac(d,'r'),mx=hnMixedOf(d),z=getInt(d,'z');
      const val=f?[f.n,f.d]:mx&&!mx.bad?[mx.w*mx.d+mx.n,mx.d]:z!==null?[z,1]:null;
      if(!val)return invalid(MSG_FRAC_INVALID);
      if(equivalent(val[0],val[1],res[0],res[1]))return right(t.n===0?'Richtig! 0-mal etwas ist 0.':t.n===1?'Richtig! Einmal genommen bleibt der Bruch gleich.':'Richtig! '+vtProofText(t));
      return wrong('sonder',t.n===0?'Du nimmst den Bruch 0-mal. Wie viel hast du dann?':t.n===1?'Du nimmst den Bruch genau einmal.':`Nimm den Zähler mal ${t.n}. Der Nenner bleibt.`,f?{'r.n':false,'r.d':false}:z!==null?{z:false}:{'g.w':false,'g.n':false,'g.d':false});
    }
    const x=getInt(d,'x');
    if(x===null)return invalid('Trage die fehlende Zahl ein.');
    const want=t.blank==='a'?t.a:t.n;
    if(x===want)return right('Richtig! '+vtProofText(t));
    return wrong('luecke',t.blank==='dn'?'Beim Teilen wird der Nenner mal die Zahl genommen. Womit?':t.blank==='a'?'Der Nenner bleibt. Welcher Zähler mal '+t.n+' ergibt den neuen Zähler?':'Der Nenner bleibt. Womit wird der Zähler malgenommen?',{x:false});
  },
  solution(t){
    if(t.kind==='natuerlich'){const want=t.list.filter(x=>(t.a*x)%t.b===0);return [line(`Der Nenner ${t.b} muss in die Zahl passen.`),line('Passende Zahlen: '+want.join(', ')+'.')];}
    if(t.kind==='sonder'&&t.n===0)return [line('0-mal genommen ist 0.'),eq(frac(t.a,t.b),'·','0','=','0')];
    return vtSolLine(t);
  }
});
/* N10 Tortenwerkstatt (Kreise): legen (a/b · n färben und ablesen), verteilen (Torte an n Kinder) */
TASKS.N10=vtStation('N10',{name:'Tortenwerkstatt',desc:'Mit Torten vervielfachen und teilen.',notes:['M26','M27'],size:3},{
  gen(level,R,ctx){
    const kind=vtKindOf(ctx,'N10');
    if(kind==='verteilen'){
      for(let i=0;i<200;i++){const b=R.pick([2,3,4,5,6]),a=R.int(1,b-1),n=R.pick([2,3]);if(gcd(a,b)!==1)continue;const t={op:'div',w:0,a,b,n};if(vtCollides(t))continue;return vtBase('N10',level,kind,t,vtFracChoices(R,t,vtDivCands(t)));}
    }
    for(let i=0;i<300;i++){const b=R.pick([2,3,4]),a=R.int(1,b-1),n=R.int(2,level===1?4:5);if(gcd(a,b)!==1||a*n<=b)continue;const t={op:'mul',w:0,a,b,n};if(vtCollides(t)||Math.ceil(a*n/b)>4)continue;return vtBase('N10',level,kind,t,{k:Math.ceil(a*n/b)});}
    return vtBase('N10',level,kind,{op:'mul',w:0,a:3,b:4,n:3},{k:3});
  },
  prompt(t,h){
    if(t.kind==='verteilen'){h.append(el('p',{class:'q'},frac(t.a,t.b),' Torte wird gerecht an ',strong(t.n),' Kinder verteilt. Was bekommt jedes Kind?'),vtExpr(t,el('span',{class:'blank'},'?')));return;}
    TASKS.N01.prompt(Object.assign({},t,{kind:'torte'}),h);
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='verteilen'){vtCircles(null,host,t.b,1,{on:new Set(Array.from({length:t.a},(_,i)=>i)),maxW:170});vtTiles(view,host,'c',t.items,'Ergebnis');return;}
    vtCircles(view,host,t.b,t.k+1,{maxW:t.k+1>3?76:100});vtAnswerRow(view,host);
  },
  validate(t,d){
    if(t.kind==='verteilen'){const c=vtChoiceCheck(t,d,'c');return c||vtOkText(t);}
    return TASKS.N01.validate(Object.assign({},t,{kind:'torte'}),d);
  },
  solution(t){
    if(t.kind==='verteilen')return [line(`Schneide jedes Stück in ${t.n} kleinere Stücke. Jedes Kind bekommt aus jedem Stück eins.`)].concat(vtSolLine(t));
    const box=el('div');vtCircles(null,box,t.b,t.k,{on:new Set(Array.from({length:t.a*t.n},(_,i)=>i)),maxW:110});return [box].concat(vtSolLine(t));
  }
});

/* ---------- Spuren fürs Abzeichen (nur nach „richtig“, im Spielstand S.vt) ---------- */
function vtState(){S.vt=S.vt&&typeof S.vt==='object'?S.vt:{};S.vt.schaetz=S.vt.schaetz|0;S.vt.wege=S.vt.wege&&typeof S.vt.wege==='object'?S.vt.wege:{};return S.vt;}
function vtCount(k){const v=vtState();v[k]=(v[k]|0)+1;persist();}
function vtWay(k){const v=vtState();if(!v.wege[k]){v.wege[k]=true;persist();}}

/* ---------- Merkzettel M26–M28 ---------- */
NOTES.M26={title:'Brüche vervielfachen',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(frac(2,7),'·','3','=',frac('2 · 3',7),'=',frac(6,7))),
    vtStrips(2,7,3,{cap:false}),
    el('p',null,strong('Vervielfachen'),' heißt: Du nimmst etwas mehrmals.'),
    el('p',null,'Du nimmst den Zähler mal die Zahl. Der Nenner bleibt gleich.'),
    el('p',null,'Das ',strong('3-Fache'),' ist dreimal so viel.'),
    el('p',{class:'rule'},strong('Achtung: '),'Vervielfachen ist nicht Erweitern. Beim Erweitern bleibt der Anteil gleich groß.')
  ];}};
NOTES.M27={title:'Brüche teilen',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(frac(3,5),':','2','=',frac(3,'5 · 2'),'=',frac(3,10))),
    vtRect(3,5,2,new Set([0,1,2])),
    el('p',null,'Beim Teilen nimmst du den Nenner mal die Zahl. Der Zähler bleibt gleich.'),
    el('p',null,'Die Teile werden kleiner. Jeder bekommt weniger.'),
    el('p',null,strong('Zweiter Weg: '),'Geht der Zähler glatt auf, darfst du ihn teilen.'),
    el('div',{class:'ex'},eq(frac(6,7),':','3','=',frac(2,7))),
    el('p',{class:'rule'},strong('Achtung: '),'Teilen ist nicht Kürzen. Beim Kürzen bleibt der Anteil gleich groß.')
  ];}};
NOTES.M28={title:'Gemischte Zahlen vervielfachen und teilen',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(mixed(3,1,5),'·','4','=',frac(16,5),'·','4','=',frac(64,5),'=',mixed(12,4,5))),
    el('p',null,strong('Weg 1: '),'Wandle die gemischte Zahl in einen Bruch um. Rechne dann.'),
    el('p',null,strong('Weg 2: '),'Rechne die Ganzen und den Bruchteil getrennt. Zähle dann zusammen.'),
    el('div',{class:'ex'},eq('3 · 4','+',frac(1,5),'· 4','=','12','+',frac(4,5),'=',mixed(12,4,5))),
    el('p',{class:'rule'},strong('Beim Teilen: '),'Wandle die gemischte Zahl zuerst in einen Bruch um.')
  ];}};

/* ---------- Tipps (drei Stufen, nie das Ergebnis im ersten; Kürzen verrät nichts) ---------- */
const vtTipCalc=(t)=>{
  const [A,B]=vtVal(t),conv=t.w?`${t.w} ${t.a}/${t.b} = ${A}/${B}. `:'';
  if(t.op==='mul')return [[`Stell dir ${vtMixTxt(t)} ${t.n}-mal hintereinander vor. Wird es mehr oder weniger?`],[conv+`Der Nenner bleibt ${B}. Nimm den Zähler mal ${t.n}.`],[conv+`Rechne ${A} · ${t.n} im Zähler. Prüfe zuletzt das Feld **gekürzt**.`]];
  return [[`Wird das Ergebnis mehr oder weniger als ${vtMixTxt(t)}?`],[conv+`Schneide jedes Teil in ${t.n} Stücke. Wie heißen die neuen Teile?`],[conv+`Rechne den Nenner mal ${t.n}: ${B} · ${t.n}. Der Zähler bleibt. Prüfe zuletzt **gekürzt**.`]];
};
TIPS.N01=(t)=>{
  if(t.kind==='zuordnen')return [['Wie viele gleiche Stücke siehst du? Wie groß ist eines?'],[`Ein Stück ist ${tf(t.a,t.b)}. Es kommt ${t.n}-mal vor.`],[`Die Additionsaufgabe addiert ${t.n}-mal ${tf(t.a,t.b)}. Das ist ${t.n}-mal so viel.`]];
  if(t.kind==='strahl')return [['Wie viele kleine Abschnitte hat ein Sprung?'],[`Ein Sprung ist ${t.a} Abschnitte lang. Jeder Abschnitt ist ${tf(1,t.b)}.`],[`${t.n} Sprünge sind ${t.n} · ${t.a} Abschnitte.`]];
  if(t.kind==='groesser1')return [['Wie viele Teile hat ein Ganzes?'],[`Ein Ganzes hat ${t.b} Teile. Du nimmst ${t.n}-mal ${t.a} Teile.`],['Vergleiche die Zahl der Teile mit einem Ganzen.']];
  if(t.kind==='legen'||t.kind==='torte')return [[`Wie oft musst du ${tf(t.a,t.b)} nehmen?`],[`Lege ${tf(t.a,t.b)} genau ${t.n}-mal. Zähle dann alle gefärbten Teile.`],[`Der Nenner bleibt ${t.b}. Der Zähler ist die Zahl der gefärbten Teile.`]];
  return [['Zähle die gefärbten Teile in allen Streifen.'],[`Ein Ganzes hat ${t.b} Teile. Es bleiben ${vtDenName(t.b)}.`],[`Gefärbt sind ${t.n} · ${t.a} Teile. Der Nenner bleibt ${t.b}.`]];
};
TIPS.N02=(t)=>{
  if(t.kind==='gruppen')return [['Wie viele gefärbte Teile gibt es? An wie viele Kinder?'],[`Es gibt ${t.a} gefärbte Teile für ${t.n} Kinder.`],[`Jedes Kind bekommt ${t.a} : ${t.n} Teile. Der Nenner bleibt ${t.b}.`]];
  if(t.kind==='strahl')return [[`In wie viele kleine Abschnitte ist die Strecke bis ${tf(t.a,t.b)} geteilt?`],[`Bis ${tf(t.a,t.b)} sind es ${t.a*t.n} Abschnitte.`],[`Teile die ${t.a*t.n} Abschnitte in ${t.n} gleiche Stücke.`]];
  if(t.kind==='ordnen')return [['Was macht Teilen? Was macht Vervielfachen?'],['Teilen macht weniger. Durch 3 gibt kleinere Stücke als durch 2.'],['Vorne steht das Teilen durch 3, hinten das Vervielfachen.']];
  return [['Wird es mehr oder weniger als vorher?'],[`Schneide jedes Teil in ${t.n} gleiche Stücke. Wie viele Stücke hat das Ganze dann?`],[`Das Ganze hat jetzt ${t.b*t.n} Stücke. Jedes Kind bekommt ${t.a} davon.`]];
};
TIPS.N03=(t)=>{
  if(t.kind==='unterschied')return [['Bleibt der Anteil gleich oder wird es mehr?'],['Beim Erweitern ändern sich Zähler und Nenner.'],['Beim Vervielfachen ändert sich nur der Zähler.']];
  return t.kind==='groesser1'?TIPS.N01(t):vtTipCalc(t);
};
TIPS.N04=(t)=>{
  if(t.kind==='mehrWeniger')return [['Wird hier geteilt oder vervielfacht?'],[t.op==='div'?'Beim Teilen bekommt jeder weniger.':'Beim Vervielfachen nimmst du mehrmals.'],['Vergleiche das Ergebnis mit dem Bruch vorne.']];
  if(t.kind==='unterschied')return [['Bleibt der Anteil gleich oder wird es weniger?'],['Beim Kürzen werden Zähler und Nenner kleiner.'],['Beim Teilen wird der Nenner größer.']];
  if(t.kind==='zaehler')return [[`Geht ${t.a} durch ${t.n} glatt auf?`],[`${t.a} : ${t.n} = ${t.a/t.n}. Der Nenner bleibt ${t.b}.`],[`Oder: Rechne den Nenner mal ${t.n}. Prüfe zuletzt **gekürzt**.`]];
  return vtTipCalc(t);
};
TIPS.N05=(t)=>{
  if(t.kind==='bild')return [['Wie viele Teile sind in einem Streifen gefärbt?'],[`${t.w} ${t.a}/${t.b} sind ${t.w*t.b+t.a} ${vtDenName(t.b)}.`],[`Zweimal sind das ${2*(t.w*t.b+t.a)} ${vtDenName(t.b)}.`]];
  return t.op==='div'?[['Wandle die gemischte Zahl zuerst in einen Bruch um.'],[`${t.w} Ganze sind ${t.w*t.b} ${vtDenName(t.b)}. Dazu kommen ${t.a}.`],[`Rechne ${t.w*t.b+t.a}/${t.b} : ${t.n}. Der Nenner wird mal ${t.n} genommen.`]]
    :[['Du kannst umwandeln oder getrennt rechnen.'],[`Getrennt: ${t.w} · ${t.n} = ${t.w*t.n}. Dazu kommt ${t.a}/${t.b} · ${t.n}.`],[`${t.a}/${t.b} · ${t.n} = ${t.a*t.n}/${t.b}. Zähle die Ganzen zusammen.`]];
};
TIPS.N06=(t)=>{
  if(t.kind==='rezept')return [['Werden es mehr oder weniger Personen als im Rezept?'],[t.op==='mul'?`Das Rezept ist für 4 Personen. ${t.pers} Personen sind ${t.n}-mal so viele.`:'Das Rezept ist für 4 Personen. 2 Personen sind die Hälfte.'],[t.op==='mul'?`Rechne ${t.a}/${t.b} · ${t.n}.`:`Rechne ${t.a}/${t.b} : 2.`]];
  if(t.kind==='schaetzen')return [['Wie viele Teile hat ein Ganzes? Wie viele nimmst du?'],[`Ein Ganzes hat ${t.b} Teile. Du nimmst ${t.n}-mal ${t.a} Teile.`],[`Rechne ${t.a}/${t.b} · ${t.n}. Der Nenner bleibt.`]];
  return [['Lies genau: Wird es mehr oder weniger?'],[t.op==='mul'?'Mehrere gleiche Portionen: Du vervielfachst.':'Gerecht verteilen: Du teilst.'],[t.op==='mul'?`Rechne ${t.a}/${t.b} · ${t.n}. Der Nenner bleibt.`:`Rechne ${t.a}/${t.b} : ${t.n}. Der Nenner wird mal ${t.n} genommen.`]];
};
TIPS.N07=(t)=>{
  if(t.kind==='welche')return [['Rechne jede Rechnung selbst nach.'],['Prüfe: Wird beim Vervielfachen nur der Zähler malgenommen? Beim Teilen der Nenner?'],[`Prüfe Rechnung ${t.answer}.`]];
  return [['Vergleiche Zähler und Nenner vorher und nachher.'],['Ist das Ergebnis gleich viel, mehr oder weniger als vorher?'],[t.op==='mul'?`Richtig: Nur der Zähler mal ${t.n}.`:`Richtig: Der Nenner mal ${t.n}.`]];
};
TIPS.N08=(t)=>{const g=gcd(t.n,t.b);return [[`Haben ${t.n} und ${t.b} einen gemeinsamen Teiler?`],[`${t.n} und ${t.b} sind beide durch ${g} teilbar.`],[`Kürze: ${t.n} : ${g} = ${t.n/g} und ${t.b} : ${g} = ${t.b/g}.`]];};
TIPS.N09=(t)=>{
  if(t.kind==='natuerlich')return [['Wann bleibt unten eine 1 übrig?'],[`Der Nenner ${t.b} muss in die Zahl passen.`],[`Prüfe die Vielfachen von ${t.b}: ${t.b}, ${2*t.b}, ${3*t.b} …`]];
  if(t.kind==='sonder')return [[`Wie oft nimmst du ${tf(t.a,t.b)}?`],[t.n===0?'0-mal genommen ist nichts.':t.n===1?'Einmal genommen bleibt es gleich.':`Nimm den Zähler mal ${t.n}.`],['Der Nenner bleibt gleich.']];
  if(t.blank==='dn')return [['Beim Teilen wird der Nenner mal die Zahl genommen.'],[`Vorher ist der Nenner ${t.b}, nachher ${t.b*t.n}.`],[`Rechne ${t.b*t.n} : ${t.b}.`]];
  return [['Beim Vervielfachen bleibt der Nenner. Was passiert mit dem Zähler?'],[t.blank==='a'?`Der neue Zähler ist ${t.a*t.n}. Er ist das ${t.n}-Fache.`:`Vorher ist der Zähler ${t.a}. Nachher ${t.a*t.n}.`],[t.blank==='a'?`Rechne ${t.a*t.n} : ${t.n}.`:`Rechne ${t.a*t.n} : ${t.a}.`]];
};
TIPS.N10=(t)=>t.kind==='verteilen'?TIPS.N02(Object.assign({},t,{kind:'ergebnis'})):TIPS.N01(Object.assign({},t,{kind:'torte'}));
['N01','N02','N03','N04','N05','N06','N07','N08','N09','N10'].forEach(id=>{TASKS[id].hints=function(t){return TIPS[id](t);};});
/* „Selbst korrigiert“: richtig nach einer Rückmeldung in derselben Aufgabe (Spur für das Abzeichen) */
['N01','N02','N03','N04','N05','N06','N07','N08','N09','N10'].forEach(id=>{const own=TASKS[id].onRight;TASKS[id].onRight=function(t,d,att){if(own)own(t,d,att);if(att>0)vtCount('fix');};});
/* Rechenprobe nach „richtig“: kurze Rechnung, wo es eine gibt */
['N03','N04','N05'].forEach(id=>{PROOF[id]=(t)=>t.kind==='rechnen'||t.kind==='zaehler'||t.kind==='mul'||t.kind==='div'?vtProofText(t):null;});
