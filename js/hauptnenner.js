'use strict';
/* =====================================================================
   Aufgaben des Themas „Ungleichnamige Brüche addieren und subtrahieren“ (Block 2, Thema addsub2, Kürzel H)
   Grundlage: Konzeptdatei vom 21.11.2026 (Hefter 6a LB 1, MSK-Förderbaustein B4, Lehrbuch Oberschule S. 33–39, Lehrbuch Gymnasium S. 20–25).
   Pflicht: H02 Hauptnenner finden · H03 Addieren am Bild · H04 Addieren und rechnen · H05 Subtrahieren am Bild ·
            H06 Subtrahieren und rechnen · H07 Erweitern oder nicht?
   Knobeln (freiwillig): H08 Zahlenrätsel · H09 Ergebniskarten · H10 Bis zum nächsten Ganzen · H11 Stammbruchmuster · H12 Magisches Quadrat · H13 17 Kamele
   Leitidee: Erst die Einteilung gleich machen (Bild: Kreuzeinteilung, Rechnung: Hauptnenner), dann die Zähler rechnen. Die Größenordnung prüft jedes Ergebnis.
   Zahlenraum: Leicht Nenner 2–12, Hauptnenner bis 36, Trick-17-Reihe höchstens 4 Schritte, halb „ein Nenner ist Vielfaches“, halb „beide erweitern“;
   Knifflig Nenner bis 25, Hauptnenner bis 100, Reihe höchstens 6 Schritte, drei Brüche, Ergebnisse über 1. Bilder (Kreuzraster) nur bei teilerfremden Nennern.
   Kürzen: In jeder Runde lässt sich etwa die Hälfte der Ergebnisse kürzen (Entscheidung des Lehrers, statt 40 %); kleine Zahlen am Anfang der Runde.
   Aufgabenfelder: terms = [[a,b],[c,d](,[e,f])], signs, plus, N (Hauptnenner), res = [Zähler, N] ungekürzt. Vertrag wie tasks.js (Tipps: js/tips.js).
   ===================================================================== */
const HN_DENS={1:[2,3,4,5,6,7,8,9,10,11,12],2:[2,3,4,5,6,7,8,9,10,12,14,15,16,18,20,24,25]};
const HN_PIC={1:[[2,3],[2,5],[2,7],[2,9],[2,11],[3,4],[3,5],[3,7],[3,8],[4,5]]};
HN_PIC[2]=HN_PIC[1].concat([[4,7],[4,9],[5,6],[5,7],[3,10],[3,11]]);
const HN_MAX={1:{N:36,steps:4},2:{N:100,steps:6}};
const HN_STAGE_N={1:[12,24,36],2:[24,60,100]}; /* Hauptnenner je Stufe der Runde (Aufgabe 1–2, 3–4, 5) */
const hnStep=(ctx)=>ctx&&ctx.step!=null?ctx.step:0; /* ohne Plan (Probeaufgabe): kleine Zahlen */
const hnPicOk=(b,d)=>gcd(b,d)===1&&b*d<=36;
const hnEqOf=(terms,signs,end)=>{const p=[];terms.forEach((x,i)=>{if(i)p.push(signs[i-1]);p.push(frac(x[0],x[1]));});if(end!==undefined)p.push('=',end);return eq(...p);};
const hnFt=(x)=>ft(x[0],x[1]);
const hnRed=(n,d)=>{const s=simplify(n,d);return s;};
const hnAvoid=(terms)=>terms.map(x=>redKey(x[0],x[1]));

/* ---------- Zahlen ---------- */
/* Zwei verschiedene Nenner. o.typ 'viel' (ein Nenner teilt den anderen) oder 'beide' (beide erweitern); o.pic: teilerfremd für das Kreuzraster; o.step: Platz in der Runde; o.dens: eigene Nenner */
function hnPair(R,level,o){
  o=o||{};
  const cap=Math.min(HN_STAGE_N[level][addStage(hnStep(o))],o.maxN||Infinity),M=HN_MAX[level];
  for(let i=0;i<600;i++){
    let b,d;
    if(o.pic){[b,d]=R.pick(HN_PIC[level]);if(R.chance(0.5))[b,d]=[d,b];}
    else{const L=o.dens||HN_DENS[level];b=R.pick(L);d=R.pick(L);}
    if(b===d)continue;
    const N=lcm(b,d),viel=b%d===0||d%b===0;
    if(N>M.N||(N>cap&&i<450))continue;
    if(trick17Steps(b,d).length>M.steps)continue;
    if(o.typ==='viel'&&!viel)continue;
    if(o.typ==='beide'&&viel)continue;
    if(o.pic&&!hnPicOk(b,d))continue;
    return [b,d,N];
  }
  return o.typ==='viel'?[2,4,4]:[3,4,12];
}
/* a/b ± c/d. o: typ, pic, step, red (Ergebnis kürzbar ja/nein), over (über 1 bzw. unechter Anfang), kuerzbar (ein Bruch lässt sich vorher kürzen), dens, maxN.
   Rückgabe {a,b,c,d,plus,N,terms,signs,res} */
function hnNums(R,level,plus,o){
  o=o||{};
  const small=level===1&&addStage(hnStep(o))===0;
  for(let i=0;i<900;i++){
    const [b,d,N]=hnPair(R,level,o);
    let a=o.over&&!plus?R.int(b+1,2*b-1):R.int(1,b-1),c=R.int(1,d-1);
    if(gcd(a,b)!==1||gcd(c,d)!==1)continue;
    if(small&&i<700&&(a>4||c>4))continue;
    const n=plus?a*N/b+c*N/d:a*N/b-c*N/d;
    if(n<1||n%N===0)continue;
    if(plus&&(o.over?n<=N:n>=N))continue;
    if(o.red!=null&&i<800&&(!isFullyReduced(n,N))!==o.red)continue;
    let terms=[[a,b],[c,d]];
    if(o.kuerzbar){
      const j=R.int(0,1),k=R.pick([2,3,4]),[p,q]=terms[j],other=terms[1-j][1];
      if(q*k>(level===1?12:24)||q*k===other||lcm(q*k,other)>HN_MAX[level].N)continue;
      terms[j]=[p*k,q*k];
    }
    return {a:terms[0][0],b:terms[0][1],c:terms[1][0],d:terms[1][1],plus,N,terms,signs:[hnSign(plus)],res:[n,N]};
  }
  return plus?{a:1,b:3,c:1,d:2,plus,N:6,terms:[[1,3],[1,2]],signs:['+'],res:[5,6]}:{a:3,b:4,c:1,d:3,plus,N:12,terms:[[3,4],[1,3]],signs:['−'],res:[5,12]};
}
/* Drei Brüche (Knifflig), alle plus: drei verschiedene Nenner, Hauptnenner bis 100 */
function hnNums3(R,level,o){
  o=o||{};
  const L=[2,3,4,5,6,8,9,10,12,15,20];
  for(let i=0;i<800;i++){
    const ds=R.shuffle(L).slice(0,3),N=hnOf(...ds);
    if(N>100||N<12||ds.some(x=>N===x)&&i<400)continue;
    const terms=ds.map(q=>{let p;do{p=R.int(1,q-1);}while(gcd(p,q)!==1);return [p,q];});
    const r=hnValue(terms,['+','+']);
    if(r[0]%r[1]===0)continue;
    if(o.red!=null&&i<600&&(!isFullyReduced(r[0],r[1]))!==o.red)continue;
    return {terms,signs:['+','+'],N:r[1],res:r,plus:true,a:terms[0][0],b:terms[0][1],c:terms[1][0],d:terms[1][1]};
  }
  return {terms:[[1,2],[1,3],[1,4]],signs:['+','+'],N:12,res:[13,12],plus:true,a:1,b:2,c:1,d:3};
}
/* 1 − a/b − c/d (Rest zum Ganzen, Knifflig) */
function hnRestNums(R,level,o){
  o=o||{};
  for(let i=0;i<600;i++){
    const t=hnNums(R,2,true,{typ:o.typ,step:o.step});
    if(t.res[0]>=t.res[1])continue;
    const terms=[[1,1],[t.a,t.b],[t.c,t.d]],res=hnValue(terms,['−','−']);
    if(res[0]<1)continue;
    if(o.red!=null&&i<400&&(!isFullyReduced(res[0],res[1]))!==o.red)continue;
    return {terms,signs:['−','−'],N:res[1],res,plus:false,a:t.a,b:t.b,c:t.c,d:t.d};
  }
  return {terms:[[1,1],[1,3],[3,8]],signs:['−','−'],N:24,res:[7,24],plus:false,a:1,b:3,c:3,d:8};
}

/* ---------- Rundenpläne (Kap. 10/11) ----------
   Die Arten stehen in der Reihenfolge des Konzepts. Je Runde: Kürzen halb und halb (red), Paarart halb und halb in Leicht (typ: viel / beide),
   bei Behauptungen mindestens eine richtige (truth). */
const HN_PLAN={
  H02:{1:['reihe','reihe','hn','erweitern','hnErw'],2:['reihe','hn','hnErw','drei','hnErw']},
  H03:{1:['bild','bild','plus','plus','geschichte'],2:['bild','plus','plus','geschichte','plus']},
  H04:{1:['plus','plus','plus','geschichte','luecke'],2:['plus','ueber1','drei','kuerzbar','geschichte']},
  H05:{1:['bild','bild','ergaenzen','ergaenzen','geschichte'],2:['bild','ergaenzen','ergaenzen','geschichte','bild']},
  H06:{1:['minus','minus','minus','geschichte','luecke'],2:['minus','rest','ergaenzenText','kuerzbar','ueber1']},
  H07:{1:['wasTun','pm','hausaufgaben','ganzes','schlange'],2:['einBild','pm','hausaufgaben','ganzes','schlange']},
  H08:{1:['raetsel','luecke','raetsel','luecke','raetsel'],2:['raetsel','luecke','raetsel','luecke','raetsel']},
  H09:{1:['karten','karten','karten'],2:['karten','karten','karten']},
  H10:{1:['bis','bis','bis','bis','bis'],2:['bis','bis','bis','bis','bis']},
  H11:{1:['muster','muster','muster'],2:['muster','muster','muster']},
  H12:{1:['quadrat','quadrat','quadrat'],2:['quadrat','quadrat','quadrat']},
  H13:{1:['summe','grund','anteil','summe','anteil'],2:['summe','grund','anteil','summe','anteil']},
  H14:{1:['falter','falter','wann','falter','wer'],2:['falter','wann','falter','wer','falter']}
};
/* Arten mit einem Ergebnis zum Kürzen (für halb und halb) und Arten mit zwei Nennern (für viel / beide) */
const HN_RES={H03:['bild','plus','geschichte'],H04:['plus','geschichte','ueber1','drei','kuerzbar'],H05:['bild','ergaenzen','geschichte'],
  H06:['minus','geschichte','rest','ergaenzenText','ueber1','kuerzbar'],H07:['wasTun','pm'],H08:['raetsel','luecke'],H13:['summe'],H14:['falter']};
const HN_TYPK=['reihe','hn','erweitern','hnErw','wer','plus','minus','geschichte','luecke','ueber1','kuerzbar','ergaenzenText','pm','raetsel','bis'];
function hnRedPlan(kinds,res){
  const idx=kinds.map((k,i)=>res.includes(k)?i:-1).filter(i=>i>=0),n=idx.length;
  const yes=Math.floor(n/2)+(n%2&&RNG.chance(0.5)?1:0),vals=RNG.shuffle(idx.map((_,j)=>j<yes)),out=kinds.map(()=>null);
  idx.forEach((i,j)=>{out[i]=vals[j];});
  return out;
}
function hnTypPlan(kinds,level){
  const idx=kinds.map((k,i)=>HN_TYPK.includes(k)?i:-1).filter(i=>i>=0),out=kinds.map(()=>null);
  const n=idx.length,beide=level===1?Math.floor(n/2)+(n%2&&RNG.chance(0.5)?1:0):Math.min(n,Math.max(2,RNG.int(2,n)));
  const vals=RNG.shuffle(idx.map((_,j)=>j<beide?'beide':level===1?'viel':null));
  idx.forEach((i,j)=>{out[i]=vals[j];});
  return out;
}
function hnCtx(id){
  return (round,level)=>{
    const size=TASKS[id].size,P=(HN_PLAN[id][level]||HN_PLAN[id][1]);
    if(!Array.isArray(round.hn)||round.hn.length!==size){
      const k=P.slice(0,size);
      round.hn=k;
    }
    const ks=round.hn;
    if(!Array.isArray(round.red)||round.red.length!==size)round.red=hnRedPlan(ks,HN_RES[id]||[]);
    if(!Array.isArray(round.typ)||round.typ.length!==size)round.typ=hnTypPlan(ks,level);
    const i=Math.min(round.results.length,size-1);
    return {kind:ks[i],step:i,red:round.red[i],typ:round.typ[i]};
  };
}
const hnRedOf=(R,ctx)=>ctx&&typeof ctx.red==='boolean'?ctx.red:R.chance(0.5);
const hnTypOf=(R,ctx,level)=>ctx&&ctx.typ?ctx.typ:(level===1?(R.chance(0.5)?'viel':'beide'):null);
const hnKinds=(id,lvl)=>Array.from(new Set((HN_PLAN[id][lvl]||HN_PLAN[id][1])));
/* gemeinsame Teile jeder Station */
function hnStation(id,meta,impl){
  return Object.assign({area:'Rechnen',size:5,ctx:hnCtx(id),planKey:'hn',layoutKinds:(lvl)=>hnKinds(id,lvl)},meta,impl);
}

/* ---------- Geschichten (Kap. 15.2): immer dasselbe Ganze; Größen dürfen über 1 gehen (big) ---------- */
const HN_STORIES={
  kuchen:{op:'plus',pic:true,lvl:1,caps:['Schokokuchen','Apfelkuchen'],txt:(t)=>`Vom Schokokuchen-Blech ist ${ft(t.a,t.b)} übrig, vom gleich großen Apfelkuchen-Blech ${ft(t.c,t.d)}. Alles kommt auf ein Blech. Wie viel ist voll?`},
  zeit:{op:'plus',lvl:1,dens:[2,3,4,5,6,10,12],txt:(t)=>`${NAMES.b} wartet ${ft(t.a,t.b)} Stunde, dann noch ${ft(t.c,t.d)} Stunde. Wie lange wartet ${NAMES.b} insgesamt?`},
  markt:{op:'plus',lvl:1,txt:(t)=>`${NAMES.c} kauft ${ft(t.a,t.b)} kg Äpfel und ${ft(t.c,t.d)} kg Trauben. Wie schwer ist alles zusammen?`},
  beet:{op:'plus',lvl:1,txt:(t)=>`Im Beet wachsen auf ${ft(t.a,t.b)} der Fläche Tomaten und auf ${ft(t.c,t.d)} Gurken. Welcher Anteil ist bepflanzt?`},
  saft:{op:'plus',big:true,lvl:2,txt:(t)=>`${NAMES.d} kauft ${ft(t.a,t.b)} l Apfelsaft und ${ft(t.c,t.d)} l Orangensaft. Wie viel Liter sind das zusammen?`},
  wanderung:{op:'plus',big:true,lvl:2,dens:[2,3,4,5,6,10,12,15,20],txt:(t)=>`Die Klasse wandert erst ${ft(t.a,t.b)} Stunde, dann noch ${ft(t.c,t.d)} Stunde. Wie lange dauert die Wanderung?`},
  blechWeg:{op:'minus',pic:true,lvl:1,txt:(t)=>`Auf dem Blech ist noch ${ft(t.a,t.b)} Kuchen. Die Klasse isst ${ft(t.c,t.d)} vom Blech. Wie viel bleibt übrig?`},
  pizzaErg:{op:'erg',pic:true,lvl:1,txt:(t)=>`${NAMES.c} hat ${ft(t.c,t.d)} der Pizza gegessen. ${NAMES.c} will ${ft(t.a,t.b)} schaffen. Wie viel fehlt noch?`},
  pizzaEnde:{op:'minus',lvl:1,txt:(t)=>`Am Anfang ist noch ${ft(t.a,t.b)} der Pizza da. Am Ende ist ${ft(t.c,t.d)} übrig. Wie viel wurde gegessen?`},
  kanne:{op:'minus',lvl:1,big:true,txt:(t)=>`In der Kanne sind ${ft(t.a,t.b)} l Wasser. ${NAMES.a} gießt ${ft(t.c,t.d)} l aus. Wie viel bleibt in der Kanne?`},
  torte:{op:'minus',lvl:1,txt:(t)=>`Mama hat ${ft(t.a,t.b)} Torte gekauft. Übrig ist noch ${ft(t.c,t.d)} Torte. Wie viel wurde gegessen?`},
  weg:{op:'minus',lvl:1,big:true,txt:(t)=>`Der Schulweg ist ${ft(t.a,t.b)} km lang. ${NAMES.d} ist schon ${ft(t.c,t.d)} km gegangen. Wie weit ist es noch?`},
  hausbau:{op:'rest',lvl:2,txt:(t)=>`Familie Kaya baut ein Haus. Sie hat ${ft(t.a,t.b)} des Preises gespart und ${ft(t.c,t.d)} geerbt. Welchen Anteil leiht sie bei der Bank?`},
  erbe:{op:'rest',lvl:2,txt:(t)=>`${NAMES.a} erbt ${ft(t.a,t.b)}, ${NAMES.b} erbt ${ft(t.c,t.d)}. ${NAMES.c} bekommt den Rest. Welchen Anteil bekommt ${NAMES.c}?`},
  gold:{op:'rest',lvl:2,txt:(t)=>`Weißgold besteht zu ${ft(t.a,t.b)} aus Gold und zu ${ft(t.c,t.d)} aus Silber. Der Rest ist Kupfer. Welcher Anteil ist Kupfer?`}
};
/* Geschichte wählen: op ('plus', 'minus', 'erg', 'rest'), pic (nur mit Bild), level (Knifflig auch Größen) */
function hnPickStory(R,op,level,pic){
  const ids=Object.keys(HN_STORIES).filter(k=>{const s=HN_STORIES[k];return s.op===op&&(!pic||s.pic)&&(pic||!s.pic)&&s.lvl<=level;});
  return ids.length?R.pick(ids):null;
}

/* ---------- Gemeinsame Bausteine ---------- */
const hnLeicht=(t)=>t.level===1;
/* Bild zur Aufgabe (Kreuzraster), nur bei teilerfremden Nennern und Ergebnissen, die sich zeichnen lassen */
const hnHasPic=(t)=>!!t.terms&&t.terms.length===2&&t.terms.every(x=>isFullyReduced(x[0],x[1]))&&hnPicOk(t.b,t.d);
function hnFigOf(t,stage){
  const mode=t.erg?'erg':t.plus?'plus':'minus';
  if(t.erg)return crossFigure({b:t.b,a:t.a,d:t.d,c:t.c,stage:Math.min(stage,1),mode});
  return crossFigure({b:t.b,a:t.a,d:t.d,c:t.c,stage,mode,caps:t.story&&HN_STORIES[t.story].caps&&stage===1?HN_STORIES[t.story].caps.map((x,i)=>el('span',null,x+' ',frac(t.terms[i][0],t.terms[i][1]))):null});
}
/* Rechenprobe nach „richtig“ (Kap. 8.3): Rechnung mit dem Hauptnenner, bei plus gelegentlich die Größenordnung */
function hnProof(t){
  const N=hnSmallest(t.terms),parts=t.terms.map(x=>ft(x[0]*N/x[1],N)),r=hnValue(t.terms,t.signs),g=simplify(r[0],r[1]);
  let s=t.terms.map(hnFt).map((x,i)=>(i?t.signs[i-1]+' ':'')+x).join(' ')+' = '+parts.map((x,i)=>(i?t.signs[i-1]+' ':'')+x).join(' ')+' = '+ft(r[0]*N/r[1],N);
  if(g[1]!==N)s+=' = '+ft(g[0],g[1]);
  s+='.';
  if(t.terms.length===2&&t.plus&&t.level===1){const big=compareFrac(t.a,t.b,t.c,t.d)>=0?[t.a,t.b]:[t.c,t.d];s+=` ${ft(g[0],g[1])} ist größer als ${hnFt(big)}. Passt.`;}
  return s;
}
const hnOk=(t,r,extra)=>right('Richtig! '+(extra?extra+' ':'')+hnProof(t)+(r&&r.note?' '+r.note:''));
/* Lösung: Hauptnenner, erweitern, rechnen, kürzen (und gemischte Zahl) */
function hnSolLines(t){
  const N=hnSmallest(t.terms),r=hnValue(t.terms,t.signs),n=r[0]*N/r[1],g=gcd(n,N),out=[];
  const dens=t.terms.map(x=>simplify(x[0],x[1])[1]);
  if(t.terms.some(x=>!isFullyReduced(x[0],x[1])))out.push(line('Erst kürzen: ',...t.terms.filter(x=>!isFullyReduced(x[0],x[1])).map(x=>eq(frac(x[0],x[1]),'=',frac(...simplify(x[0],x[1]))))));
  out.push(line(strong('Hauptnenner: '),N+' (Trick 17 mit '+Math.max(...dens)+').'));
  const left=[],mid=[];t.terms.forEach((x,i)=>{if(i){left.push(t.signs[i-1]);mid.push(t.signs[i-1]);}left.push(frac(x[0],x[1]));mid.push(frac(x[0]*N/x[1],N));});
  out.push(eq(...left,'=',...mid,'=',frac(n,N)));
  if(g>1)out.push(line('Kürzen: '),eq(frac(n,N),'=',frac(n+' : '+g,N+' : '+g),'=',frac(n/g,N/g)));
  else out.push(line('Das Ergebnis lässt sich nicht kürzen.'));
  const s=simplify(n,N);
  if(s[0]>s[1])out.push(line('Als gemischte Zahl: ',mixed(Math.floor(s[0]/s[1]),s[0]%s[1],s[1]),'.'));
  return out;
}
/* Rechenweg-Optionen je Aufgabe: Leicht mit Hauptnenner-Feld und Zwischenschritt, Knifflig mit erweiterten Brüchen; gemischte Zahl bei Ergebnissen über 1 möglich */
const hnBlockOpt=(t,extra)=>Object.assign({leicht:hnLeicht(t),staged:true,mixed:t.level===2&&['ueber1','drei','rest'].includes(t.kind)},extra||{});
/* eine Rechenaufgabe (Ausdruck oder Geschichte), mit Bild sofort (always) oder mit dem zweiten Tipp */
function hnCalcRender(view,host,t,picAlways,stage){
  if(hnHasPic(t))addPicBox(view,host,()=>hnFigOf(t,stage||3),picAlways);
  addResultH(view,host,t,hnBlockOpt(t));
}
function hnCalcValidate(t,d,extra){
  const r=hnResultCheck(t,d,hnBlockOpt(t));
  if(!r.ok)return r;
  return hnOk(t,r,extra);
}
function hnCalcPrompt(t,h,ask){
  if(t.story){h.append(el('p',{class:'q qa'},HN_STORIES[t.story].txt(t)));return;}
  h.append(el('p',{class:'q'},ask||'Rechne aus.'),hnEqOf(t.terms,t.signs));
}
const hnBase=(id,level,kind,r)=>Object.assign({type:id,level,kind},r,{avoid:hnAvoid(r.terms||[[r.a,r.b],[r.c,r.d]])});
/* Ja/Nein als Knöpfe (Entwurf draft[key] = 'ja' | 'nein') */
function hnYesNo(view,host,key,onPick){
  const d=view.draft,row=el('div',{class:'yesno'});
  [['ja','haken','Ja'],['nein','kreuz','Nein']].forEach(([v,ic,label])=>{
    const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d[key]===v)},icon(ic),label);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{if(view.locked())return;d[key]=v;view.save();row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(onPick)onPick(v);});
    view.inputs[key+v]=b;row.append(b);
  });
  host.append(row);
  return row;
}

/* =====================================================================
   H02 Hauptnenner finden (reihe, hn, erweitern, hnErw, drei), nur mit Trick 17; der Schmetterling kommt in H14 – hier zählt nur der kleinste gemeinsame Nenner
   ===================================================================== */
function hnFindNums(R,level,ctx){
  const typ=hnTypOf(R,ctx,level);
  for(let i=0;i<300;i++){
    const [b,d,N]=hnPair(R,level,{typ,step:hnStep(ctx)});
    let a=R.int(1,b-1),c=R.int(1,d-1);
    if(gcd(a,b)!==1||gcd(c,d)!==1)continue;
    return {a,b,c,d,N,plus:true,terms:[[a,b],[c,d]],signs:['+'],res:[a*N/b+c*N/d,N]};
  }
  return {a:2,b:8,c:7,d:10,N:40,plus:true,terms:[[2,8],[7,10]],signs:['+'],res:[38,40]};
}
function hnDreiDens(R){
  const L=[2,3,4,5,6,8,9,10,12,15];
  for(let i=0;i<400;i++){
    const ds=R.shuffle(L).slice(0,3),N=hnOf(...ds),g=Math.max(...ds);
    if(N>100||N===g||trick17Steps(...ds).length>6)continue;
    return ds;
  }
  return [2,5,12];
}
TASKS.H02=hnStation('H02',{name:'Hauptnenner finden',desc:'Trick 17 und Erweitern auf den Hauptnenner.',notes:['M19','M2']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'reihe';
    if(kind==='drei'){
      const ds=hnDreiDens(R),terms=ds.map(q=>{let p;do{p=R.int(1,q-1);}while(gcd(p,q)!==1);return [p,q];});
      return {type:'H02',level,kind,terms,signs:['+','+'],N:hnOf(...ds),b:ds[0],d:ds[1],avoid:hnAvoid(terms)};
    }
    return hnBase('H02',level,kind,hnFindNums(R,level,ctx));
  },
  prompt(t,h){
    const f=t.terms.map(x=>frac(x[0],x[1]));
    switch(t.kind){
      case 'reihe':h.append(el('p',{class:'q'},'Finde den Hauptnenner von ',f[0],' und ',f[1],' mit Trick 17.'));break;
      case 'hn':h.append(el('p',{class:'q'},'Welche Zahl ist der Hauptnenner von ',f[0],' und ',f[1],'?'));break;
      case 'erweitern':h.append(el('p',{class:'q'},'Erweitere beide Brüche auf den Hauptnenner ',strong(t.N),'.'));break;
      case 'hnErw':h.append(el('p',{class:'q'},'Finde den Hauptnenner. Erweitere dann beide Brüche.'));break;
      default:h.append(el('p',{class:'q'},'Drei Brüche: ',f[0],', ',f[1],' und ',f[2],'. Finde den Hauptnenner.'));
    }
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='reihe'){
      const big=Math.max(t.b,t.d),small=Math.min(t.b,t.d),max=trick17Steps(t.b,t.d).length+2;
      const stg=twoStage(view,host,{isDone:()=>d.big!=null,summary:()=>'Großer Nenner: '+d.big});
      stg.box1.append(el('p',null,strong('1. Tippe den größeren Nenner an.')));
      const row=el('div',{class:'yesno'});
      [t.b,t.d].forEach(x=>{const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.big===x)},String(x));b.disabled=view.locked();
        b.addEventListener('click',()=>{if(view.locked())return;d.big=x;d.rm='';view.save();stg.advance();draw();});view.inputs['big'+x]=b;row.append(b);});
      stg.box1.append(row);
      const list=el('div',{class:'trick trtap'});
      stg.box2.append(el('p',null,strong('2. Passt der kleinere Nenner ohne Rest hinein?')),list);
      const draw=()=>{
        const g=d.big||big,s=g===t.b?t.d:t.b,rm=(d.rm||'').split('').filter(Boolean),done=rm[rm.length-1]==='y';
        const rows=rm.map((m,i)=>el('div',{class:'trrow'+(m==='y'?' hn':'')},el('span',{class:'trv'},String(g*(i+1))),el('span',{class:'trok '+(m==='y'?'ok':'no'),role:'img','aria-label':m==='y'?'passt':'passt nicht'},icon(m==='y'?'haken':'kreuz'))));
        list.replaceChildren(...rows);
        rows.forEach((r,i)=>{view.inputs['rm'+i]=r;});
        if(!done&&rm.length<max&&!view.locked()){
          const v=g*(rm.length+1),yes=el('button',{type:'button',class:'btn small'},icon('haken'),s+' passt'),no=el('button',{type:'button',class:'btn small'},icon('kreuz'),'passt nicht');
          yes.addEventListener('click',()=>{if(view.locked())return;d.rm=(d.rm||'')+'y';view.save();draw();});
          no.addEventListener('click',()=>{if(view.locked())return;d.rm=(d.rm||'')+'n';view.save();draw();});
          list.append(el('div',{class:'trrow ask'},el('span',{class:'trv'},String(v)),yes,no));
        }
        if(rm.length&&!view.locked())list.append(linkBtn('Letzten Schritt zurücknehmen',()=>{if(view.locked())return;d.rm=(d.rm||'').slice(0,-1);view.save();draw();}));
        if(done)list.append(el('p',{class:'trres'},strong('3. Der Hauptnenner ist '+g*rm.length+'.')));
        if(view.changed)view.changed();
      };
      draw();stg.upd();
      return;
    }
    if(t.kind==='hn'){host.append(el('div',{class:'addrow'},el('span',{class:'alab'},'Hauptnenner'),intInput(view,'x','Hauptnenner')));return;}
    if(t.kind==='erweitern'){host.append(hnExpandRow(view,t,t.N));return;}
    if(t.kind==='hnErw'){
      host.append(el('div',{class:'arow hnNrow'},el('span',{class:'alab'},'Hauptnenner'),intInput(view,'N','Hauptnenner')));
      const row=hnExpandRow(view,t,null);host.append(row);
      view.inputs.N.addEventListener('input',()=>row.refreshDens());
      return;
    }
    const stg=twoStage(view,host,{isDone:()=>d.big!=null,summary:()=>'Großer Nenner: '+d.big});
    stg.box1.append(el('p',null,strong('1. Tippe den größten Nenner an.')));
    const row=el('div',{class:'yesno'});
    t.terms.map(x=>x[1]).forEach(x=>{const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.big===x)},String(x));b.disabled=view.locked();
      b.addEventListener('click',()=>{if(view.locked())return;d.big=x;view.save();stg.advance();});view.inputs['big'+x]=b;row.append(b);});
    stg.box1.append(row);
    stg.box2.append(el('p',null,strong('2. Prüfe die Vielfache mit beiden kleineren Nennern.')),el('div',{class:'addrow'},el('span',{class:'alab'},'Hauptnenner'),intInput(view,'x','Hauptnenner')));
    stg.upd();
  },
  validate(t,d){
    const dens=t.terms.map(x=>x[1]),g=Math.max(...dens),hn=hnOf(...dens);
    if(t.kind==='reihe'){
      if(d.big==null)return invalid('Tippe zuerst den größeren Nenner an.');
      if(d.big!==g)return wrong('reiheFalsch','Fange mit dem größeren Nenner an. Er braucht weniger Schritte.',{['big'+d.big]:false});
      const rm=(d.rm||'').split('').filter(Boolean),s=Math.min(...dens);
      if(!rm.length||rm[rm.length-1]!=='y')return invalid('Prüfe die Vielfachen, bis der kleinere Nenner passt.');
      for(let i=0;i<rm.length;i++){
        const v=g*(i+1),ok=v%s===0;
        if((rm[i]==='y')!==ok)return wrong('reiheFalsch',ok?`${s} passt ohne Rest in ${v}.`:`${s} passt nicht ohne Rest in ${v}.`,{['rm'+i]:false});
      }
      return right(`Richtig! Der Hauptnenner ist ${hn}. Trick 17: ${trick17Steps(...dens).map(x=>x.v).join(', ')}.`);
    }
    if(t.kind==='hn'||t.kind==='drei'){
      if(t.kind==='drei'){
        if(d.big==null)return invalid('Tippe zuerst den größten Nenner an.');
        if(d.big!==g)return wrong('groesserNenner','Fange mit dem größten Nenner an.',{['big'+d.big]:false});
      }
      const x=getInt(d,'x');
      if(x===null)return invalid('Trage den Hauptnenner ein.');
      if(x===hn)return right(`Richtig! ${hn} ist das kleinste gemeinsame Vielfache der Nenner.`);
      if(t.kind==='hn'&&x===t.b+t.d)return wrong('summe','Die Nenner werden nicht addiert. Suche ein Vielfaches beider Nenner.',{x:false});
      if(x===g)return wrong('groesserNenner',`${g} allein reicht nicht. ${dens.find(q=>g%q!==0)} passt nicht ohne Rest hinein.`,{x:false});
      if(isCommonDen(x,...dens))return wrong('nichtKleinster',`${x} ist ein gemeinsamer Nenner, aber nicht der kleinste.`,{x:false});
      return wrong('keinGemeinsamer',`${dens.find(q=>x%q!==0)} passt nicht ohne Rest in ${x}. Nimm ein Vielfaches.`,{x:false});
    }
    if(t.kind==='erweitern'||t.kind==='hnErw'){
      const r=hnResultCheck(Object.assign({},t,{res:[1,1]}),Object.assign({},d,{'r.n':'1','r.d':'1',kn:true}),{leicht:true,givenN:t.kind==='erweitern'?t.N:null,smallest:true,mid:false});
      if(!r.ok)return r;
      return right(`Richtig! ${t.terms.map(x=>ft(x[0],x[1])+' = '+ft(x[0]*hn/x[1],hn)).join(' und ')}.`);
    }
    return invalid('Unbekannte Aufgabe.');
  },
  solution(t){
    const dens=t.terms.map(x=>x[1]),hn=hnOf(...dens),out=[trickRow(t.terms),line(strong('Hauptnenner: '),String(hn)+'.')];
    if(t.kind==='erweitern'||t.kind==='hnErw')t.terms.forEach(x=>out.push(eq(frac(x[0],x[1]),'=',frac(x[0]+' · '+hn/x[1],x[1]+' · '+hn/x[1]),'=',frac(x[0]*hn/x[1],hn))));
    return out;
  }
});
/* Zeile „a/b + c/d = [ ]/N + [ ]/N“ (N fest oder aus dem Feld „Hauptnenner“) */
function hnExpandRow(view,t,givenN){
  const d=view.draft,getN=()=>{const N=givenN||getInt(d,'N');return hnFits(N,t.terms)?N:null;};
  const fs=t.terms.map((_,i)=>hnNumOver(view,'e'+i,getN,'erweiterter Zähler '+(i+1)));
  const left=[],right=[];t.terms.forEach((x,i)=>{if(i){left.push(op(t.signs[i-1]));right.push(op(t.signs[i-1]));}left.push(frac(x[0],x[1]));right.push(fs[i]);});
  const row=el('div',{class:'addrow'},...left,op('='),...right);
  row.refreshDens=()=>fs.forEach(f=>f.refreshDen());
  return row;
}

/* =====================================================================
   Bild-Stationen H03 (plus) und H05 (minus): Brüche ablesen → Teilung übertragen → Rechenweg; H05 dazu Ergänzen
   ===================================================================== */
function hnBildNums(R,level,plus,ctx,o){
  o=o||{};
  for(let i=0;i<600;i++){
    const t=hnNums(R,level,plus,{pic:true,step:hnStep(ctx),red:hnRedOf(R,ctx),over:o.over});
    if(!plus&&compareFrac(t.a,t.b,t.c,t.d)<=0)continue;
    return t;
  }
  return plus?hnNums(R,1,true,{pic:true}):{a:3,b:4,c:1,d:3,plus:false,N:12,terms:[[3,4],[1,3]],signs:['−'],res:[5,12]};
}
/* Stufe „Brüche ablesen“ und „Teilung übertragen“ prüfen */
function hnReadCheck(t,d){
  const u=getFrac(d,'u'),v=getFrac(d,'v'),fix=' Tippe oben auf „ändern“.';
  if(!u||!v)return invalid('Trage beide Brüche ein.');
  const same=(f,x)=>f.n===x[0]&&f.d===x[1];
  const ok=t.plus?((same(u,t.terms[0])&&same(v,t.terms[1]))||(same(u,t.terms[1])&&same(v,t.terms[0]))):(same(u,t.terms[0])&&same(v,t.terms[1]));
  if(ok)return null;
  const dOk=t.plus?([u.d,v.d].sort().join()===[t.b,t.d].sort().join()):(u.d===t.b&&v.d===t.d);
  if(!dOk)return wrong('nennerFelder','Der Nenner ist die Zahl der gleich großen Streifen in einem Rechteck.'+fix,{'u.d':false,'v.d':false});
  return wrong('zaehlerFelder','Zähle die gefärbten Streifen in jedem Rechteck noch einmal.'+fix,{'u.n':false,'v.n':false});
}
function hnTeilCheck(t,d){
  const s1=getInt(d,'t1'),s2=getInt(d,'t2');
  if(s1===null||s2===null)return invalid('Trage ein, in wie viele Stücke geteilt wird.');
  const m={};if(s1!==t.d)m.t1=false;if(s2!==t.b)m.t2=false;
  if(Object.keys(m).length)return wrong('teilungZahl','Zähle die Streifen im anderen Rechteck. So oft wird jedes Stück geteilt. Tippe oben auf „ändern“.',m);
  return null;
}
/* Aufgabe mit drei Etappen: ablesen, Teilung übertragen, rechnen. Das Bild wechselt nach der Teilung zu Stufe 2. */
function hnBildRender(view,host){
  const t=view.task,d=view.draft,figBox=el('div');host.append(figBox);
  const drawFig=()=>{figBox.replaceChildren(hnFigOf(t,d.s2===true?2:1));};
  const stg=hnStages(view,host,[
    {isDone:()=>d.s1===true,summary:()=>`${d['u.n']}/${d['u.d']} ${t.signs[0]} ${d['v.n']}/${d['v.d']}`},
    {isDone:()=>d.s2===true,summary:()=>`Geteilt in ${d.t1} und ${d.t2} Stücke`},
    {}],()=>{drawFig();});
  const [b1,b2,b3]=stg.boxes;
  /* 1. ablesen */
  b1.append(el('p',null,strong('1. Lies die Brüche ab.')));
  const r1=el('div',{class:'addrow addread'},fracInput(view,'u'),op(t.signs[0]),fracInput(view,'v'));
  const go1=el('button',{type:'button',class:'btn small'},'Weiter');
  const full1=()=>!!getFrac(d,'u')&&!!getFrac(d,'v');
  const up1=()=>{go1.disabled=view.locked()||!full1();};
  r1.addEventListener('input',up1);
  go1.addEventListener('click',()=>{if(view.locked()||!full1())return;d.s1=true;view.save();stg.advance(0);});
  b1.append(r1,go1);up1();
  /* 2. Teilung übertragen */
  b2.append(el('p',null,strong('2. Übertrage die Teilung.')),
    el('p',{class:'addrow hnteil'},denEach(t.b)+' wird in ',intInput(view,'t1','Stücke je '+denName(t.b)),' Stücke geteilt.'),
    el('p',{class:'addrow hnteil'},denEach(t.d)+' in ',intInput(view,'t2','Stücke je '+denName(t.d)),' Stücke.'));
  const go2=el('button',{type:'button',class:'btn small'},'Linien zeichnen');
  const full2=()=>getInt(d,'t1')!==null&&getInt(d,'t2')!==null;
  const up2=()=>{go2.disabled=view.locked()||!full2();};
  b2.addEventListener('input',up2);
  go2.addEventListener('click',()=>{if(view.locked()||!full2())return;d.s2=true;view.save();stg.advance(1);});
  b2.append(go2);up2();
  /* 3. rechnen */
  b3.append(el('p',null,strong('3. Rechne aus.')));
  addResultH(view,b3,t,hnBlockOpt(t));
  stg.upd();
}
function hnBildValidate(t,d){
  const rd=hnReadCheck(t,d);if(rd)return rd;
  if(d.s1!==true)return invalid('Tippe auf „Weiter“.');
  const tc=hnTeilCheck(t,d);if(tc)return tc;
  if(d.s2!==true)return invalid('Tippe auf „Linien zeichnen“.');
  return hnCalcValidate(t,d);
}
const hnBildSolution=(t)=>[hnFigOf(t,3),line(`${denEach(t.b)} wird in ${t.d} Stücke geteilt, ${denEach(t.d).toLowerCase()} in ${t.b}. Jetzt gibt es ${t.N} gleich große Felder.`),...hnSolLines(t)];

TASKS.H03=hnStation('H03',{name:'Addieren am Bild',desc:'Teilung übertragen, verfeinerte Anteile zusammenfügen, Rechenweg notieren.',notes:['M20']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'bild',over=level===2&&kind==='plus'&&R.chance(0.35);
    const t=hnBase('H03',level,kind,hnBildNums(R,level,true,ctx,{over}));
    if(kind==='geschichte')t.story='kuchen';
    return t;
  },
  prompt(t,h){
    if(t.kind==='bild'){h.append(el('p',{class:'q'},'Welche Additionsaufgabe gehört zum Bild? Übertrage die Teilung und rechne aus.'));return;}
    hnCalcPrompt(t,h,'Addiere. Das Bild hilft dir.');
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='bild')return hnBildRender(view,host);
    if(t.kind==='geschichte'){host.append(hnFigOf(t,2));addResultH(view,host,t,hnBlockOpt(t));return;}
    hnCalcRender(view,host,t,t.level===1,3);
  },
  validate(t,d){return t.kind==='bild'?hnBildValidate(t,d):hnCalcValidate(t,d);},
  solution(t){return t.kind==='bild'?hnBildSolution(t):[hnFigOf(t,3),...hnSolLines(t)];}
});

/* =====================================================================
   H04 Addieren und rechnen (plus, geschichte, luecke, ueber1, drei, kuerzbar)
   ===================================================================== */
function hnLueckeGen(R,level,ctx,id,plus){
  for(let i=0;i<400;i++){
    const t=hnNums(R,level,plus,{step:hnStep(ctx),typ:hnTypOf(R,ctx,level),red:hnRedOf(R,ctx)});
    const blank=level===2&&R.chance(0.5)?'den':'num';
    return Object.assign(hnBase(id,level,'luecke',t),{blank,ans:simplify(t.res[0],t.res[1])});
  }
}
function hnLueckeRender(view,host){
  const t=view.task,box=t.blank==='num'?el('span',{class:'frac inp',role:'group','aria-label':'fehlender Zähler'},el('span',{class:'num'},intInput(view,'x','fehlender Zähler')),el('span',{class:'den'},String(t.d)))
    :el('span',{class:'frac inp',role:'group','aria-label':'fehlender Nenner'},el('span',{class:'num'},String(t.c)),el('span',{class:'den'},intInput(view,'x','fehlender Nenner')));
  host.append(el('div',{class:'addrow'},frac(t.a,t.b),op(t.signs[0]),box,op('='),frac(t.ans[0],t.ans[1])));
}
function hnLueckeValidate(t,d){
  const x=getInt(d,'x');
  if(x===null)return invalid('Trage die fehlende Zahl ein.');
  const want=t.blank==='num'?t.c:t.d;
  if(x===want)return right(`Richtig! ${ft(t.a,t.b)} ${t.signs[0]} ${ft(t.c,t.d)} = ${ft(t.a*t.N/t.b,t.N)} ${t.signs[0]} ${ft(t.c*t.N/t.d,t.N)} = ${ft(t.ans[0],t.ans[1])}.`);
  if(t.blank==='num'&&x===(t.plus?t.ans[0]-t.a:t.a-t.ans[0]))return wrong('luecke','Die Nenner sind verschieden. Erweitere zuerst. Dann siehst du, was fehlt.',{x:false});
  return wrong('luecke','Das passt noch nicht. Setze deine Zahl ein und rechne mit dem Hauptnenner nach.',{x:false});
}
const hnLueckeSolution=(t)=>[line(t.blank==='num'?'Gesucht ist der Zähler. Rechne mit dem Hauptnenner '+t.N+'.':'Gesucht ist der Nenner. Rechne mit dem Hauptnenner '+t.N+'.'),
  eq(frac(t.ans[0]*t.N/t.ans[1],t.N),t.plus?'−':'+',frac(t.a*t.N/t.b,t.N),'=',frac(t.c*t.N/t.d,t.N),'=',frac(t.c,t.d)),hnEqOf(t.terms,t.signs,frac(t.ans[0],t.ans[1]))];
/* Aufgaben mit Ergebnis für H04 (plus) und H06 (minus) */
function hnRechnenGen(R,level,ctx,id,plus){
  const kind=(ctx&&ctx.kind)||(plus?'plus':'minus'),step=hnStep(ctx),red=hnRedOf(R,ctx),typ=hnTypOf(R,ctx,level);
  if(kind==='luecke')return hnLueckeGen(R,level,ctx,id,plus);
  if(kind==='drei')return hnBase(id,level,kind,hnNums3(R,level,{red}));
  if(kind==='rest'){const t=hnBase(id,level,kind,hnRestNums(R,level,{red,typ,step}));t.story=R.pick(['hausbau','erbe','gold']);return t;}
  if(kind==='geschichte'){
    const sid=hnPickStory(R,plus?'plus':'minus',level,false),S=HN_STORIES[sid];
    const t=hnBase(id,level,kind,hnNums(R,level,plus,{step,red,typ:S.dens?null:typ,dens:S.dens,over:level===2&&S.big&&R.chance(plus?0.4:0.3)}));
    t.story=sid;return t;
  }
  const t=hnBase(id,level,kind,hnNums(R,level,plus,{step,red,typ:kind==='kuerzbar'?null:typ,over:kind==='ueber1',kuerzbar:kind==='kuerzbar'}));
  if(kind==='ergaenzenText')t.erg=true;
  return t;
}
TASKS.H04=hnStation('H04',{name:'Addieren und rechnen',desc:'Hauptnenner finden, erweitern, Zähler addieren – auch Geschichten und Ergebnisse über 1.',notes:['M20','M19','M3']},{
  gen(level,R,ctx){return hnRechnenGen(R,level,ctx,'H04',true);},
  prompt(t,h){
    if(t.kind==='luecke'){h.append(el('p',{class:'q'},'Welche Zahl fehlt in der Rechnung?'));return;}
    hnCalcPrompt(t,h,t.kind==='drei'?'Addiere die drei Brüche.':'Rechne aus.');
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='luecke')return hnLueckeRender(view,host);
    hnCalcRender(view,host,t,false,3);
  },
  validate(t,d){
    if(t.kind==='luecke')return hnLueckeValidate(t,d);
    return hnCalcValidate(t,d);
  },
  solution(t){
    if(t.kind==='luecke')return hnLueckeSolution(t);
    return [...(hnHasPic(t)?[hnFigOf(t,3)]:[]),...hnSolLines(t)];
  }
});

/* =====================================================================
   H05 Subtrahieren am Bild (bild, ergaenzen, geschichte): Wegnehmen mit Kreuzen und Ergänzen („Wie viel fehlt?“)
   ===================================================================== */
/* Ergänzen: c/d ist der Start, a/b das Ziel (a/b > c/d). Etappe 1: Teilung übertragen und fehlende Felder antippen, Etappe 2: Rechnung und Lücke */
function hnErgRender(view,host){
  const t=view.task,d=view.draft,figBox=el('div');
  const tap=()=>new Set((d.tap||[]).map(Number));
  const drawFig=()=>{
    if(d.tr!==true){figBox.replaceChildren(crossFigure({b:t.b,a:t.a,d:t.d,c:t.c,stage:1,mode:'erg'}));return;}
    figBox.replaceChildren(crossFigure({b:t.b,a:t.a,d:t.d,c:t.c,stage:2,mode:'erg',tapped:tap(),onToggle:view.locked()?null:(k)=>{
      if(view.locked())return;const s=tap();if(s.has(k))s.delete(k);else s.add(k);d.tap=[...s].sort((p,q)=>p-q);view.save();drawFig();upd1();}}));
    if(view.changed)view.changed();
  };
  host.append(figBox);
  const stg=hnStages(view,host,[{isDone:()=>d.s1===true,summary:()=>(d.tap||[]).length+' Felder fehlen'},{}],()=>drawFig());
  const [b1,b2]=stg.boxes;
  const trBtn=el('button',{type:'button',class:'btn small'},'Teilung übertragen');
  const go=el('button',{type:'button',class:'btn small'},'Weiter zur Rechnung');
  const say=el('p',null);
  const upd1=()=>{trBtn.hidden=d.tr===true;go.hidden=d.tr!==true;go.disabled=view.locked()||!(d.tap||[]).length;say.replaceChildren(d.tr===true?'Tippe die Felder an, die bis zum Ziel fehlen.':'Übertrage zuerst die Teilung. Dann sind alle Felder gleich groß.');};
  trBtn.addEventListener('click',()=>{if(view.locked())return;d.tr=true;view.save();drawFig();upd1();});
  go.addEventListener('click',()=>{if(view.locked()||!(d.tap||[]).length)return;d.s1=true;view.save();stg.advance(0);});
  b1.append(el('p',null,strong('1. Wie viele Felder fehlen bis zum Ziel?')),say,trBtn,go);
  b2.append(el('p',null,strong('2. Rechne aus.')));
  addResultH(view,b2,t,hnBlockOpt(t)).append(el('div',{class:'arow'},el('span',{class:'alab'},'Lücke'),el('div',{class:'addrow'},frac(t.c,t.d),op('+'),fracInput(view,'l'),op('='),frac(t.a,t.b))));
  upd1();drawFig();stg.upd();
}
function hnErgValidate(t,d){
  if(d.tr!==true)return invalid('Tippe auf „Teilung übertragen“.');
  const st=t.c*t.b,tg=t.a*t.d,tap=(d.tap||[]).map(Number);
  if(tap.some(k=>k<st||k>=tg))return wrong('felder','Tippe nur Felder an, die zum Ziel gehören und noch frei sind. Tippe oben auf „ändern“.',{});
  if(tap.length!==tg-st)return wrong('felder',(tap.length<tg-st?'Bis zum Ziel fehlen noch Felder.':'Das sind zu viele Felder.')+' Tippe oben auf „ändern“.',{});
  if(d.s1!==true)return invalid('Tippe auf „Weiter zur Rechnung“.');
  const r=hnResultCheck(t,d,hnBlockOpt(t));
  if(!r.ok)return r;
  const l=getFrac(d,'l');
  if(!l)return invalid('Trage in die Lücke den Bruch ein, der fehlt.');
  if(!equivalent(l.n,l.d,t.res[0],t.res[1])){
    const sum=addFrac(t.a,t.b,t.c,t.d);
    return wrong(equivalent(l.n,l.d,sum[0],sum[1])?'andereRechnung':'luecke',equivalent(l.n,l.d,sum[0],sum[1])?'Beim Ergänzen suchst du, was fehlt. Rechne minus.':'In die Lücke gehört, was bis zum Ziel fehlt.',{'l.n':false,'l.d':false});
  }
  return hnOk(t,r);
}
const hnErgSolution=(t)=>[crossFigure({b:t.b,a:t.a,d:t.d,c:t.c,stage:2,mode:'erg',tapped:new Set(Array.from({length:t.a*t.d-t.c*t.b},(_,i)=>t.c*t.b+i))}),
  line(`Das Ziel ${ft(t.a,t.b)} sind ${t.a*t.d} Felder. Der Start ${ft(t.c,t.d)} sind ${t.c*t.b} Felder.`),...hnSolLines(t),
  eq(frac(t.c,t.d),'+',frac(...simplify(t.res[0],t.res[1])),'=',frac(t.a,t.b))];
TASKS.H05=hnStation('H05',{name:'Subtrahieren am Bild',desc:'Wegnehmen mit Kreuzen und ergänzen: Wie viel fehlt bis zum Ziel?',notes:['M20']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'bild',over=level===2&&kind==='bild'&&hnStep(ctx)>=4;
    const t=hnBase('H05',level,kind,hnBildNums(R,level,false,ctx,{over}));
    if(kind==='ergaenzen')t.erg=true;
    if(kind==='geschichte'){t.story=R.pick(['blechWeg','pizzaErg']);if(t.story==='pizzaErg')t.erg=true;}
    return t;
  },
  prompt(t,h){
    if(t.kind==='bild'){h.append(el('p',{class:'q'},'Welche Subtraktionsaufgabe gehört zum Bild? Übertrage die Teilung und rechne aus.'));return;}
    if(t.kind==='ergaenzen'){h.append(el('p',{class:'q qa'},`Von ${ft(t.c,t.d)} bis ${ft(t.a,t.b)}: Wie viel fehlt?`));return;}
    hnCalcPrompt(t,h);
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='bild')return hnBildRender(view,host);
    if(t.erg)return hnErgRender(view,host);
    host.append(hnFigOf(t,3));addResultH(view,host,t,hnBlockOpt(t));
  },
  validate(t,d){
    if(t.kind==='bild')return hnBildValidate(t,d);
    if(t.erg)return hnErgValidate(t,d);
    return hnCalcValidate(t,d);
  },
  solution(t){
    if(t.kind==='bild')return hnBildSolution(t);
    if(t.erg)return hnErgSolution(t);
    return [hnFigOf(t,3),...hnSolLines(t)];
  }
});

/* =====================================================================
   H06 Subtrahieren und rechnen (minus, geschichte, luecke, rest, ergaenzenText, ueber1, kuerzbar)
   ===================================================================== */
TASKS.H06=hnStation('H06',{name:'Subtrahieren und rechnen',desc:'Hauptnenner finden, erweitern, Zähler subtrahieren – auch Rest zum Ganzen.',notes:['M20','M19','M3']},{
  gen(level,R,ctx){return hnRechnenGen(R,level,ctx,'H06',false);},
  prompt(t,h){
    if(t.kind==='luecke'){h.append(el('p',{class:'q'},'Welche Zahl fehlt in der Rechnung?'));return;}
    if(t.kind==='ergaenzenText'){h.append(el('p',{class:'q qa'},`Von ${ft(t.c,t.d)} bis ${ft(t.a,t.b)}: Wie viel fehlt?`));return;}
    if(t.kind==='rest'){h.append(el('p',{class:'q qa'},HN_STORIES[t.story].txt({a:t.terms[1][0],b:t.terms[1][1],c:t.terms[2][0],d:t.terms[2][1]})));return;}
    hnCalcPrompt(t,h);
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='luecke')return hnLueckeRender(view,host);
    if(t.kind==='ergaenzenText'){addResultH(view,host,t,{resultOnly:true});return;}
    if(t.kind==='rest'){host.append(el('p',{class:'hnhint'},'Ein Ganzes ist ',frac(1,1),' = ',frac(t.N,t.N),'.'));addResultH(view,host,t,hnBlockOpt(t,{leicht:false}));return;}
    hnCalcRender(view,host,t,false,3);
  },
  validate(t,d){
    if(t.kind==='luecke')return hnLueckeValidate(t,d);
    if(t.kind==='ergaenzenText'){const r=hnResultCheck(t,d,{resultOnly:true});return r.ok?hnOk(t,r):r;}
    if(t.kind==='rest'){const r=hnResultCheck(t,d,hnBlockOpt(t,{leicht:false}));return r.ok?hnOk(t,r):r;}
    return hnCalcValidate(t,d);
  },
  solution(t){
    if(t.kind==='luecke')return hnLueckeSolution(t);
    if(t.kind==='ergaenzenText')return [line('Ergänzen ist dasselbe wie subtrahieren: Ziel minus Start.'),...hnSolLines(t)];
    if(t.kind==='rest')return [line('Ein Ganzes minus alle Teile.'),...hnSolLines(t)];
    return [...(hnHasPic(t)?[hnFigOf(t,3)]:[]),...hnSolLines(t)];
  }
});

/* =====================================================================
   H07 Erweitern oder nicht? (wasTun, pm, hausaufgaben, ganzes, schlange, einBild)
   ===================================================================== */
const HN_WAS=[{id:'A',txt:'Sofort rechnen: Die Brüche sind gleichnamig.'},{id:'B',txt:'Nur einen Bruch erweitern.'},{id:'C',txt:'Beide Brüche erweitern.'},{id:'D',txt:'Erst kürzen.'}];
const HN_ERR=['komponentenweise','nennerBehalten','zaehlerNichtErweitert','teilweiseErweitert'];
const HN_ERR_TEXT={komponentenweise:'Zähler und Nenner wurden einzeln gerechnet.',nennerBehalten:'Ein Nenner wurde einfach behalten.',zaehlerNichtErweitert:'Die Zähler wurden nicht erweitert.',teilweiseErweitert:'Nur ein Bruch wurde erweitert.'};
/* „Passt die Geschichte zur Rechnung?“ (Kap. 15.3): Rechnung als [a,b,c,d,plus], Antwort, Grund */
const HN_GANZES=[
  {txt:`${NAMES.c} isst 1/4 von einer Pizza und 1/4 von einem Kuchen.`,calc:[1,4,1,4],fit:false,why:'B'},
  {txt:`${NAMES.d} trinkt 1/2 l Saft und 1/4 l Wasser.`,calc:[1,2,1,4],fit:true,why:'A'},
  {txt:`${NAMES.b} isst 1/3 einer kleinen und 1/3 einer großen Pizza.`,calc:[1,3,1,3],fit:false,why:'C'},
  {txt:`${NAMES.a} läuft 1/2 km und dann 1/4 km.`,calc:[1,2,1,4],fit:true,why:'A'},
  {txt:'Auf einem Blech sind 1/3 Schokokuchen und 1/4 Apfelkuchen übrig.',calc:[1,3,1,4],fit:true,why:'A'},
  {txt:'In der 6a ist 1/2 der Kinder krank, in der 6b 1/3 der Kinder.',calc:[1,2,1,3],fit:false,why:'B'},
  {txt:`${NAMES.d} bekommt 1/2 der Schokostücke und 1/4 der Bonbons.`,calc:[1,2,1,4],fit:false,why:'B'},
  {txt:`${NAMES.b} übt 1/2 Stunde Mathe und 3/4 Stunde Deutsch.`,calc:[1,2,3,4],fit:true,why:'A'},
  {txt:`${NAMES.c} kauft 1/2 Sack Kartoffeln und 1/4 kg Zwiebeln.`,calc:[1,2,1,4],fit:false,why:'D'},
  {txt:'Im Beet wachsen auf 2/5 Tomaten und auf 1/3 Gurken.',calc:[2,5,1,3],fit:true,why:'A'},
  {txt:`${NAMES.a} gibt 1/3 seines Taschengelds aus, ${NAMES.d} 1/3 seines.`,calc:[1,3,1,3],fit:false,why:'C'},
  {txt:`Aus einer Flasche trinkt ${NAMES.b} 1/4 l, dann 1/8 l.`,calc:[1,4,1,8],fit:true,why:'A'}
];
const HN_GRUND=[{id:'A',txt:'Es ist dasselbe Ganze.'},{id:'B',txt:'Zwei verschiedene Ganze.'},{id:'C',txt:'Die Ganzen sind ungleich groß.'},{id:'D',txt:'Die Größen passen nicht.'}]; /* gekürzt (Konzept Kap. 15.3), damit jede Antwort auf dem Handy in eine Zeile passt */
/* Rechenschlange: Leicht Familie {2,4,8} oder {3,6,12}, 3 Glieder, Werte zwischen 0 und 2; Knifflig Nenner 2–12, 5 Glieder, Werte bis 3 */
function hnSchlange(R,level,len){
  const L=level===1?R.pick([[2,4,8],[3,6,12]]):[2,3,4,5,6,8,10,12],n=len||(level===1?3:5),hi=level===1?2:3;
  for(let i=0;i<800;i++){
    const q0=R.pick(L),start=simplify(R.int(1,q0-1),q0);
    let v=start.slice();const ops=[],vals=[];let ok=true,beide=0;
    for(let k=0;k<n;k++){
      const q=R.pick(L),p=R.int(1,q-1),f=simplify(p,q),plus=R.chance(0.55);
      if(f[1]===v[1]&&R.chance(0.6)){ok=false;break;}
      const w=plus?addFrac(v[0],v[1],f[0],f[1]):subFrac(v[0],v[1],f[0],f[1]),s=simplify(w[0],w[1]);
      if(s[0]<=0||compareFrac(s[0],s[1],hi,1)>=0){ok=false;break;}
      if(v[1]%f[1]!==0&&f[1]%v[1]!==0)beide++;
      ops.push({plus,f});vals.push(s);v=s;
    }
    if(!ok)continue;
    if(level===2&&beide<Math.min(3,n))continue;
    return {start,ops,vals,goal:v};
  }
  return {start:[1,8],ops:[{plus:true,f:[1,4]},{plus:true,f:[1,2]},{plus:false,f:[1,8]}],vals:[[3,8],[7,8],[3,4]],goal:[3,4]};
}
function hnSchlangeCheck(t,d,pre){
  const k=t.ops.length;pre=pre||'k';
  for(let i=0;i<k;i++)if(!getFrac(d,pre+i))return invalid('Fülle jedes Kästchen der Schlange aus.');
  for(let i=0;i<k;i++){
    const f=getFrac(d,pre+i),w=t.vals[i];
    if(!equivalent(f.n,f.d,w[0],w[1]))return wrong('schlange',`Kästchen ${i+1} stimmt noch nicht. Rechne von dort aus neu.`,{[pre+i+'.n']:false,[pre+i+'.d']:false});
  }
  const m={};for(let i=0;i<k;i++){const f=getFrac(d,pre+i);if(!isFullyReduced(f.n,f.d)){m[pre+i+'.n']=false;m[pre+i+'.d']=false;}}
  if(Object.keys(m).length)return soft('nochKuerzen','Alle Werte stimmen. Kürze jedes Kästchen so weit wie möglich.',m);
  return null;
}
function hnHausaufgaben(R,level){
  for(let tries=0;tries<300;tries++){
    const err=R.pick(HN_ERR),w=R.int(0,3),calcs=[],seen=new Set();
    let ok=true;
    for(let i=0;i<4;i++){
      const plus=i===w&&err==='komponentenweise'?true:R.chance(0.6),t=hnNums(R,level,plus,{typ:R.chance(0.5)?'viel':'beide'});
      const key=t.a+'/'+t.b+'/'+t.c+'/'+t.d;if(seen.has(key)){ok=false;break;}seen.add(key);
      calcs.push({a:t.a,b:t.b,c:t.c,d:t.d,plus,x:simplify(t.res[0],t.res[1])[0],y:simplify(t.res[0],t.res[1])[1],N:t.N});
    }
    if(!ok)continue;
    const e=calcs[w],pm=(p,q)=>e.plus?p+q:p-q;
    if(err==='komponentenweise'){e.x=pm(e.a,e.c);e.y=pm(e.b,e.d);}
    else if(err==='nennerBehalten'){e.x=pm(e.a,e.c);e.y=Math.max(e.b,e.d);}
    else if(err==='zaehlerNichtErweitert'){e.x=pm(e.a,e.c);e.y=e.N;}
    else{const j=R.int(0,1);e.x=j?pm(e.a*e.N/e.b,e.c):pm(e.a,e.c*e.N/e.d);e.y=e.N;}
    if(e.x<1||e.y<2)continue;
    if(hnDiagnose(e.a,e.b,e.c,e.d,e.plus,e.x,e.y)!==err)continue;
    const others=R.shuffle(HN_ERR.filter(x=>x!==err)).slice(0,2);
    return {calcs,wrong:w,errType:err,errOpts:R.shuffle([err].concat(others))};
  }
  return {calcs:[{a:1,b:3,c:1,d:2,plus:true,x:2,y:5,N:6},{a:1,b:4,c:1,d:2,plus:true,x:3,y:4,N:4},{a:2,b:3,c:1,d:6,plus:false,x:1,y:2,N:6},{a:3,b:4,c:1,d:3,plus:true,x:13,y:12,N:12}],wrong:0,errType:'komponentenweise',errOpts:['komponentenweise','nennerBehalten','teilweiseErweitert']};
}
function hnCalcTiles(view,host,calcs,onPick){
  const d=view.draft,grid=el('div',{class:'tiles tiles-3',role:'group','aria-label':'Rechnungen'});
  calcs.forEach((c,i)=>{
    const b=el('button',{type:'button',class:'tile tile-eq','aria-pressed':String(d.sel===i)},el('span',{class:'ltr','aria-hidden':'true'},'ABCD'[i]),
      el('span',{class:'tv'},eq(frac(c.a,c.b),hnSign(c.plus),frac(c.c,c.d),'=',frac(c.x,c.y))));
    b.disabled=view.locked();
    b.addEventListener('click',()=>{if(view.locked())return;d.sel=i;view.save();grid.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',String(y===b)));if(onPick)onPick(i);});
    view.inputs['sel'+i]=b;grid.append(b);
  });
  return grid;
}
/* „Ein Bild, drei Aufgaben“ (Knifflig): eine Zeile [x] (+|−) [y] = [z] mit Brüchen, geprüft nach dem Wert */
function hnEinBildJudge(t,d,i){
  const g=(k)=>getFrac(d,'q'+i+k),x=g('x'),y=g('y'),z=g('z'),o=d['q'+i+'o'];
  const blank=['x','y','z'].every(k=>['.n','.d'].every(p=>d['q'+i+k+p]==null||d['q'+i+k+p]===''))&&!o;
  if(blank)return {empty:true};
  const mk=()=>{const m={};['x','y','z'].forEach(k=>{m['q'+i+k+'.n']=false;m['q'+i+k+'.d']=false;});m['q'+i+'o']=false;return m;};
  if(!x||!y||!z||!o)return {bad:true,msg:`Zeile ${i+1}: Fülle alle Felder aus und wähle plus oder minus.`,marks:mk()};
  const val=o==='+'?addFrac(x.n,x.d,y.n,y.d):subFrac(x.n,x.d,y.n,y.d);
  if(val[0]<=0||!equivalent(val[0],val[1],z.n,z.d))return {bad:true,msg:`Zeile ${i+1}: Diese Rechnung stimmt nicht.`,marks:mk()};
  const A=[t.a,t.b],B=[t.c,t.d],S=addFrac(t.a,t.b,t.c,t.d),is=(f,F)=>equivalent(f.n,f.d,F[0],F[1]);
  if(o==='+'&&((is(x,A)&&is(y,B))||(is(x,B)&&is(y,A))))return {key:'p'};
  if(o==='−'&&is(x,S)&&is(y,B))return {key:'mB'};
  if(o==='−'&&is(x,S)&&is(y,A))return {key:'mA'};
  return {bad:true,msg:`Zeile ${i+1}: Diese Rechnung stimmt, passt aber nicht zum Bild.`,marks:mk()};
}
TASKS.H07=hnStation('H07',{name:'Erweitern oder nicht?',desc:'Erst hinschauen, Fehler finden, das gleiche Ganze prüfen, Rechenschlange.',notes:['M20','M21','M17','M18']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'wasTun',red=hnRedOf(R,ctx);
    if(kind==='wasTun'){
      const ty=R.pick(['gleich','viel','beide']);
      if(ty==='gleich'){
        for(let i=0;i<300;i++){const b=R.pick([4,5,6,7,8,9,10,12]),a=R.int(1,b-1),c=R.int(1,b-1);if(a+c>=b||gcd(a,b)!==1||gcd(c,b)!==1||a===c)continue;if((!isFullyReduced(a+c,b))!==red&&i<200)continue;
          return Object.assign({type:'H07',level,kind,ty,a,b,c,d:b,plus:true,N:b,terms:[[a,b],[c,b]],signs:['+'],res:[a+c,b]},{avoid:[redKey(a,b),redKey(c,b)],answer:'A'});}
      }
      const t=hnNums(R,level,true,{typ:ty==='gleich'?'viel':ty,red,step:hnStep(ctx)});
      return Object.assign(hnBase('H07',level,kind,t),{ty:ty==='gleich'?'viel':ty,answer:ty==='beide'?'C':'B'});
    }
    if(kind==='pm'){
      const plus=R.chance(0.5),sid=hnPickStory(R,plus?'plus':'minus',level,false),S=HN_STORIES[sid];
      const t=hnBase('H07',level,kind,hnNums(R,level,plus,{red,dens:S.dens,typ:S.dens?null:hnTypOf(R,ctx,level),step:hnStep(ctx),over:level===2&&S.big&&R.chance(0.3)}));
      t.story=sid;return t;
    }
    if(kind==='hausaufgaben'){const r=hnHausaufgaben(R,level),w=r.calcs[r.wrong];return Object.assign({type:'H07',level,kind,b:w.b,d:w.d,avoid:[redKey(w.a,w.b),redKey(w.c,w.d)]},r);}
    if(kind==='ganzes'){const i=R.int(0,HN_GANZES.length-1),g=HN_GANZES[i];return {type:'H07',level,kind,gi:i,b:g.calc[1],d:g.calc[3],avoid:[g.txt.slice(0,12)]};}
    if(kind==='schlange'){const s=hnSchlange(R,level);return Object.assign({type:'H07',level,kind,b:s.start[1],avoid:[redKey(s.start[0],s.start[1])+'s']},s);}
    const t=hnNums(R,2,true,{pic:true,step:2});
    return Object.assign(hnBase('H07',level,'einBild',t),{need:3});
  },
  prompt(t,h){
    switch(t.kind){
      case 'wasTun':h.append(el('p',{class:'q'},'Was musst du tun, bevor du rechnest?'),hnEqOf(t.terms,t.signs));break;
      case 'pm':h.append(el('p',{class:'q qa'},HN_STORIES[t.story].txt(t)));break;
      case 'hausaufgaben':h.append(el('p',{class:'q'},`${NAMES.d} hat Hausaufgaben gemacht. Eine Rechnung ist falsch.`));break;
      case 'ganzes':h.append(el('p',{class:'q qa'},HN_GANZES[t.gi].txt));break;
      case 'schlange':h.append(el('p',{class:'q'},'Rechne die Schlange von links nach rechts. Kürze jedes Ergebnis.'));break;
      default:h.append(el('p',{class:'q'},'Finde eine Plus- und zwei Minusaufgaben.'));
    }
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='wasTun'){
      const stg=twoStage(view,host,{isDone:()=>d.was!=null,summary:()=>HN_WAS.find(x=>x.id===d.was).txt});
      hnChoice(view,stg.box1,'was',HN_WAS.map(x=>({id:x.id,parts:[x.txt]})),'Was musst du tun?',()=>stg.advance());
      addResultH(view,stg.box2,t,hnBlockOpt(t));
      stg.upd();return;
    }
    if(t.kind==='pm'){
      const stg=twoStage(view,host,{isDone:()=>d.pm!=null,summary:()=>d.pm==='plus'?'Rechenart: plus':'Rechenart: minus'});
      stg.box1.append(el('p',null,strong('Plus oder minus?')));
      hnChoice(view,stg.box1,'pm',[{id:'plus',parts:['Es kommt etwas dazu: plus.']},{id:'minus',parts:['Es wird etwas weggenommen: minus.']}],'Rechenart',()=>stg.advance());
      addResultH(view,stg.box2,t,hnBlockOpt(t,{mixed:t.level===2}));
      stg.upd();return;
    }
    if(t.kind==='hausaufgaben'){
      const stg=twoStage(view,host,{isDone:()=>d.sel!=null,summary:()=>'Falsch ist Rechnung '+'ABCD'[d.sel]});
      stg.box1.append(el('p',null,strong('1. Welche Rechnung ist falsch?')),hnCalcTiles(view,stg.box1,t.calcs,()=>stg.advance()));
      stg.box2.append(el('p',null,strong('2. Was wurde falsch gemacht?')));
      hnChoice(view,stg.box2,'err',t.errOpts.map(e=>({id:e,parts:[HN_ERR_TEXT[e]]})),'Fehler');
      stg.upd();return;
    }
    if(t.kind==='ganzes'){
      const g=HN_GANZES[t.gi];
      const top=el('div',{class:'hnganz'},eq(frac(g.calc[0],g.calc[1]),'+',frac(g.calc[2],g.calc[3]),'=',frac(...simplify(...addFrac(...g.calc)))));
      host.append(top);
      const rr=simplify(...addFrac(...g.calc)),calcTxt=`${g.calc[0]}/${g.calc[1]} + ${g.calc[2]}/${g.calc[3]} = ${rr[0]}/${rr[1]}`;
      const stg=twoStage(view,host,{isDone:()=>d.j!=null,summary:()=>calcTxt+(d.j==='ja'?' passt.':' passt nicht.')});
      top.append(host.querySelector(':scope>.etsum')); /* Antwort aus Teil 1 neben der Rechnung, spart eine Zeile */
      stg.box1.append(el('p',null,strong('1. Passt die Rechnung?')));
      hnYesNo(view,stg.box1,'j',()=>stg.advance());
      stg.box2.append(el('p',null,strong('2. Warum?')));
      hnChoice(view,stg.box2,'r',HN_GRUND.map(x=>({id:x.id,parts:[x.txt]})),'Begründung');
      stg.upd();return;
    }
    if(t.kind==='schlange'){host.append(chainView(t.start,t.ops,(i)=>fracInput(view,'k'+i),t.goal));return;}
    host.append(hnFigOf(t,2));
    addRows(view,host,{key:'rows',start:2,max:5,word:'Rechnung',row:(i)=>el('div',{class:'addrow'},el('span',{class:'tag'},(i+1)+'.'),fracInput(view,'q'+i+'x'),addOpToggle(view,'q'+i+'o'),fracInput(view,'q'+i+'y'),op('='),fracInput(view,'q'+i+'z')),
      drop:(i)=>['x','y','z'].flatMap(k=>['q'+i+k+'.n','q'+i+k+'.d']).concat(['q'+i+'o'])});
  },
  validate(t,d){
    if(t.kind==='wasTun'){
      if(!d.was)return invalid('Wähle zuerst, was du tun musst.');
      if(d.was!==t.answer){
        const msg=t.answer==='A'?'Die Nenner sind gleich. Du kannst sofort rechnen.':t.answer==='B'?`${Math.min(t.b,t.d)} passt in ${Math.max(t.b,t.d)}. Nur ein Bruch muss erweitert werden.`:'Kein Nenner passt in den anderen. Beide Brüche müssen erweitert werden.';
        return wrong('wasTun',d.was==='D'?'Die Brüche lassen sich nicht kürzen. '+msg:msg,{['was'+d.was]:false});
      }
      return hnCalcValidate(t,d);
    }
    if(t.kind==='pm'){
      if(!d.pm)return invalid('Wähle zuerst plus oder minus.');
      if((d.pm==='plus')!==t.plus)return wrong('andereRechnung',t.plus?'Hier kommt etwas dazu. Das ist plus.':'Hier wird etwas weggenommen oder verglichen. Das ist minus.',{['pm'+d.pm]:false});
      const r=hnResultCheck(t,d,hnBlockOpt(t,{mixed:t.level===2}));
      return r.ok?hnOk(t,r):r;
    }
    if(t.kind==='hausaufgaben'){
      if(d.sel==null)return invalid('Tippe zuerst die falsche Rechnung an.');
      if(d.sel!==t.wrong)return wrong('sel','Diese Rechnung stimmt. Rechne sie mit dem Hauptnenner nach.',{['sel'+d.sel]:false});
      if(!d.err)return invalid('Wähle auch aus, was falsch gemacht wurde.');
      if(d.err!==t.errType)return wrong('err','Die falsche Rechnung hast du gefunden. Die Fehlerart passt noch nicht.',{['err'+d.err]:false});
      return right('Richtig! '+HN_ERR_TEXT[t.errType]);
    }
    if(t.kind==='ganzes'){
      const g=HN_GANZES[t.gi];
      if(d.j==null)return invalid('Tippe zuerst Ja oder Nein an.');
      if((d.j==='ja')!==g.fit)return wrong('ganzesFalsch','Schau, worauf sich die Anteile beziehen.',{['j'+d.j]:false});
      if(!d.r)return invalid('Wähle auch eine Begründung.');
      if(d.r!==g.why)return wrong('grundFalsch','Deine Entscheidung stimmt. Die Begründung passt noch nicht.',{['r'+d.r]:false});
      return right('Richtig! '+HN_GRUND.find(x=>x.id===g.why).txt);
    }
    if(t.kind==='schlange'){const r=hnSchlangeCheck(t,d);return r||right(`Richtig! Die Schlange endet bei ${hnFt(t.goal)}.`);}
    const rows=d.rows==null?3:d.rows,seen=new Set(),marks={},issues=[];
    let good=0,any=false,bad=0;
    for(let i=0;i<rows;i++){
      const j=hnEinBildJudge(t,d,i);
      if(j.empty)continue;
      any=true;
      if(j.bad){bad++;issues.push(j.msg);Object.assign(marks,j.marks);continue;}
      if(seen.has(j.key)){bad++;issues.push(`Zeile ${i+1}: Diese Aufgabe hast du schon.`);continue;}
      seen.add(j.key);good++;
    }
    if(!any)return invalid('Schreibe mindestens eine Rechnung auf.');
    if(good<t.need)issues.push(`${good} von ${t.need} verschiedenen Rechnungen gefunden.`);
    if(!issues.length)return right('Richtig! Eine Plusaufgabe und zwei Minusaufgaben passen zum Bild.');
    return (bad?wrong:soft)('zeile',issues.join(' '),marks);
  },
  solution(t){
    if(t.kind==='wasTun')return [line(HN_WAS.find(x=>x.id===t.answer).txt),...hnSolLines(t)];
    if(t.kind==='pm')return [line(t.plus?'Es kommt etwas dazu: plus.':'Es wird etwas weggenommen: minus.'),...hnSolLines(t)];
    if(t.kind==='hausaufgaben'){const w=t.calcs[t.wrong];return [line(strong('Falsch ist Rechnung '+'ABCD'[t.wrong]+'. '),HN_ERR_TEXT[t.errType]),eq(frac(w.a,w.b),hnSign(w.plus),frac(w.c,w.d),'=',frac(w.x,w.y)),line('So stimmt es:'),
      ...hnSolLines({terms:[[w.a,w.b],[w.c,w.d]],signs:[hnSign(w.plus)],plus:w.plus,level:t.level})];}
    if(t.kind==='ganzes'){const g=HN_GANZES[t.gi];return [line(g.fit?'Die Rechnung passt.':'Die Rechnung passt nicht.'),line(HN_GRUND.find(x=>x.id===g.why).txt),hnWholes()];}
    if(t.kind==='schlange')return [chainView(t.start,t.ops,(i)=>frac(t.vals[i][0],t.vals[i][1]),t.goal)];
    const S=addFrac(t.a,t.b,t.c,t.d),s=simplify(S[0],S[1]);
    return [hnFigOf(t,3),eq(frac(t.a,t.b),'+',frac(t.c,t.d),'=',frac(s[0],s[1])),eq(frac(s[0],s[1]),'−',frac(t.c,t.d),'=',frac(t.a,t.b)),eq(frac(s[0],s[1]),'−',frac(t.a,t.b),'=',frac(t.c,t.d))];
  }
});

/* =====================================================================
   Knobeln H08–H13 (freiwillig, Kap. 11)
   ===================================================================== */
/* H08 Zahlenrätsel: Umkehr mit Pfeilbild („Ich denke mir eine Zahl …“) und Lücken ▢ + c/d = r, a − ▢ = r */
TASKS.H08=hnStation('H08',{name:'Zahlenrätsel',desc:'Ich denke mir eine Zahl: Rechne rückwärts mit ungleichnamigen Brüchen.',notes:['M20','M19']},{
  /* Gesucht ist x (gekürzt), f ist der bekannte Bruch. Das Kind rechnet rückwärts (terms, signs):
     sub  „Ziehe ich f ab, erhalte ich r“: r = x − f, gerechnet r + f · add „Addiere ich f, erhalte ich r“: r = x + f, gerechnet r − f
     vorn ▢ + f = r: gerechnet r − f · minus A − ▢ = f mit A = x + f: gerechnet A − f. Ob sich das Ergebnis vor dem Kürzen kürzen lässt, ist halb und halb (red). */
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'raetsel',red=hnRedOf(R,ctx),mode=kind==='luecke'?R.pick(['vorn','minus']):R.pick(['add','sub']);
    for(let i=0;i<600;i++){
      const t=hnNums(R,level,true,{step:hnStep(ctx),typ:hnTypOf(R,ctx,level)}),x=[t.a,t.b],f=[t.c,t.d];
      let r,terms,signs;
      if(mode==='sub'){const v=subFrac(t.a,t.b,t.c,t.d);if(v[0]<=0)continue;r=simplify(v[0],v[1]);terms=[r,f];signs=['+'];}
      else{const v=addFrac(t.a,t.b,t.c,t.d);r=simplify(v[0],v[1]);terms=[r,f];signs=['−'];}
      const res=hnValue(terms,signs);
      if(!equivalent(res[0],res[1],x[0],x[1]))continue;
      if((!isFullyReduced(res[0],res[1]))!==red&&i<450)continue;
      const base={type:'H08',level,kind,mode,f,r,x,terms,signs,res,plus:signs[0]==='+',b:terms[0][1],d:terms[1][1],avoid:[redKey(f[0],f[1]),redKey(r[0],r[1])]};
      if(mode==='minus')return Object.assign(base,{A:r,f,terms:[r,f]}); /* A − ▢ = f: A ist x + f */
      return base;
    }
    return {type:'H08',level,kind:'raetsel',mode:'sub',f:[1,4],r:[1,3],x:[7,12],terms:[[1,3],[1,4]],signs:['+'],res:[7,12],plus:true,b:3,d:4,avoid:['1/4','1/3']};
  },
  prompt(t,h){
    if(t.mode==='add'||t.mode==='sub'){h.append(el('p',{class:'q qa'},`Ich denke mir eine Zahl. ${t.mode==='sub'?'Ziehe ich '+hnFt(t.f)+' ab':'Addiere ich '+hnFt(t.f)}, erhalte ich ${hnFt(t.r)}. Welche Zahl ist es?`));return;}
    h.append(el('p',{class:'q'},'Welcher Bruch gehört in das Kästchen?'));
  },
  render(view,host){
    const t=view.task,box=el('span',{class:'blank','aria-label':'gesuchte Zahl'},'?');
    if(t.mode==='add'||t.mode==='sub')host.append(el('div',{class:'hnpfeil',role:'img','aria-label':'Pfeilbild'},box,el('span',{class:'hnarrow'},el('span',{class:'hnop'},t.mode==='sub'?'−':'+',' ',frac(t.f[0],t.f[1])),el('span',{class:'hnar'},'→')),frac(t.r[0],t.r[1])));
    else if(t.mode==='vorn')host.append(eq(box,'+',frac(t.f[0],t.f[1]),'=',frac(t.r[0],t.r[1])));
    else host.append(eq(frac(t.A[0],t.A[1]),'−',box,'=',frac(t.f[0],t.f[1])));
    addResult(view,host,{label:'gesuchte Zahl'});
  },
  validate(t,d){
    const r=hnResultCheck(t,d,{resultOnly:true});
    if(!r.ok){if(r.errorCode&&HN_DIAG_CODES.includes(r.errorCode))return wrong('raetsel','Rechne rückwärts: Mache die Rechnung umgekehrt. Prüfe dann mit der Probe.',r.marks);return r;}
    return right(`Richtig! Die gesuchte Zahl ist ${hnFt(simplify(t.res[0],t.res[1]))}. ${hnProof(t)}`);
  },
  solution(t){
    const x=simplify(t.res[0],t.res[1]);
    return [line(t.mode==='minus'?'Gesucht ist, was weggenommen wird: Anfang minus Rest.':'Rechne rückwärts: Die Umkehr von minus ist plus, von plus ist minus.'),...hnSolLines(t),line('Probe: ',strong(hnFt(x)),' passt in die Rechnung.')];
  }
});
/* H09 Ergebniskarten: erst schätzen, dann prüfen (4 oder 5 Aufgaben, gleich viele Karten) */
TASKS.H09=hnStation('H09',{name:'Ergebniskarten',desc:'Ordne jeder Aufgabe ihre Ergebniskarte zu. Erst schätzen, dann prüfen.',notes:['M20']},{size:3,
  gen(level,R){
    const n=level===1?4:5;
    for(let g=0;g<200;g++){
      const list=[],seen=new Set();
      for(let i=0;i<n;i++){
        const plus=R.chance(0.6),t=hnNums(R,level,plus,{typ:R.chance(0.5)?'viel':'beide',step:level===1?2:4}),r=simplify(t.res[0],t.res[1]);
        if(seen.has(r.join('/')))break;
        seen.add(r.join('/'));list.push({terms:t.terms,signs:t.signs,r});
      }
      if(list.length<n)continue;
      const cards=R.shuffle(list.map((_,i)=>i));
      return {type:'H09',level,kind:'karten',list,cards,b:list[0].terms[0][1],avoid:list.map(x=>x.r.join('/'))};
    }
    return {type:'H09',level,kind:'karten',list:[{terms:[[1,2],[1,3]],signs:['+'],r:[5,6]},{terms:[[1,2],[1,4]],signs:['+'],r:[3,4]},{terms:[[3,4],[1,3]],signs:['−'],r:[5,12]},{terms:[[1,3],[1,6]],signs:['+'],r:[1,2]}],cards:[2,0,3,1],b:2,avoid:['x']};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Tippe eine Aufgabe an, dann ihre Ergebniskarte. Schätze zuerst, ohne zu rechnen.'));},
  render(view,host){
    const t=view.task,d=view.draft;d.p=d.p||{};
    const tasksBox=el('div',{class:'hnmatch-l',role:'group','aria-label':'Aufgaben'}),cardsBox=el('div',{class:'hnmatch-r',role:'group','aria-label':'Ergebniskarten'});
    const draw=()=>{
      tasksBox.replaceChildren(...t.list.map((x,i)=>{
        const p=d.p[i],b=el('button',{type:'button',class:'tile tile-eq hnm'+(d.cur===i?' cur':''),'aria-pressed':String(d.cur===i)},el('span',{class:'ltr','aria-hidden':'true'},p!=null?'ABCDE'[p]:'·'),el('span',{class:'tv'},hnEqOf(x.terms,x.signs)));
        b.disabled=view.locked();b.addEventListener('click',()=>{if(view.locked())return;d.cur=i;view.save();draw();});view.inputs['t'+i]=b;return b;}));
      cardsBox.replaceChildren(...t.cards.map((ci,j)=>{
        const r=t.list[ci].r,b=el('button',{type:'button',class:'tile tile-fs hnc'},el('span',{class:'ltr','aria-hidden':'true'},'ABCDE'[j]),frac(r[0],r[1]));
        b.disabled=view.locked();b.addEventListener('click',()=>{if(view.locked()||d.cur==null)return;Object.keys(d.p).forEach(k=>{if(d.p[k]===j)delete d.p[k];});d.p[d.cur]=j;d.cur=null;view.save();draw();});view.inputs['c'+j]=b;return b;}));
      if(view.changed)view.changed();
    };
    draw();
    host.append(el('div',{class:'hnmatch'},tasksBox,cardsBox));
  },
  validate(t,d){
    const p=d.p||{};
    if(t.list.some((_,i)=>p[i]==null))return invalid('Ordne jeder Aufgabe eine Karte zu.');
    const m={};let bad=0;
    t.list.forEach((x,i)=>{const ok=t.cards[p[i]]===i;m['t'+i]=ok;if(!ok)bad++;});
    if(!bad)return right('Richtig! Alle Karten passen. Hast du gut geschätzt?');
    return wrong('karten',`${bad} ${bad===1?'Karte passt':'Karten passen'} noch nicht. Rechne diese Aufgaben nach.`,m);
  },
  solution(t){return t.list.map(x=>hnEqOf(x.terms,x.signs,frac(x.r[0],x.r[1])));}
});
/* H10 Bis zum nächsten Ganzen: Summe und Ergänzung */
TASKS.H10=hnStation('H10',{name:'Bis zum nächsten Ganzen',desc:'Addiere zwei Brüche. Wie viel fehlt bis zum nächsten Ganzen?',notes:['M20']},{
  gen(level,R,ctx){
    const t=hnNums(R,level,true,{step:hnStep(ctx),typ:hnTypOf(R,ctx,level),over:level===2});
    const W=Math.ceil(t.res[0]/t.res[1]),e=simplify(W*t.res[1]-t.res[0],t.res[1]);
    return Object.assign(hnBase('H10',level,'bis',t),{W,e});
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Addiere. Wie viel fehlt dann bis zum nächsten Ganzen?'),hnEqOf(t.terms,t.signs));},
  render(view,host){
    host.append(el('div',{class:'afields'},el('div',{class:'arow'},el('span',{class:'alab'},'Summe'),fracInput(view,'s')),el('div',{class:'arow'},el('span',{class:'alab'},'bis zum nächsten Ganzen'),fracInput(view,'e'))));
  },
  validate(t,d){
    const s=getFrac(d,'s'),e=getFrac(d,'e');
    if(!s||!e)return invalid('Trage die Summe und das, was fehlt, ein.');
    if(!equivalent(s.n,s.d,t.res[0],t.res[1])){const c=hnDiagnose(t.a,t.b,t.c,t.d,true,s.n,s.d)||'wert';return wrong(c,hnDiagMsg(c,t.a,t.b,t.c,t.d,true,s.n,s.d),{'s.n':false,'s.d':false});}
    if(!equivalent(e.n,e.d,t.e[0],t.e[1]))return wrong('ergaenzung',`Das nächste Ganze ist ${t.W}. Schreibe es als Bruch mit dem Nenner ${t.res[1]}.`,{'e.n':false,'e.d':false});
    return right(`Richtig! ${hnProof(t)} Bis ${t.W} fehlen ${hnFt(t.e)}.`);
  },
  solution(t){return [...hnSolLines(t),line(`Das nächste Ganze ist ${t.W} = ${t.W*t.res[1]}/${t.res[1]}.`),eq(frac(t.W*t.res[1],t.res[1]),'−',frac(t.res[0],t.res[1]),'=',frac(t.e[0],t.e[1]))];}
});
/* H11 Stammbruchmuster: drei Rechnungen, Vorhersage, Muster benennen */
TASKS.H11=hnStation('H11',{name:'Stammbruchmuster',desc:'Rechne Stammbrüche, finde das Muster und sage das nächste Ergebnis voraus.',notes:['M20']},{size:3,
  gen(level,R){
    const n0=R.int(2,4),plus=level===2&&R.chance(0.5),m=R.int(n0+4,11),sg=plus?'+':'−';
    const rows=[0,1,2].map(i=>{const n=n0+i,v=plus?addFrac(1,n,1,n+1):subFrac(1,n,1,n+1);return {n,v:simplify(v[0],v[1])};});
    const pv=plus?addFrac(1,m,1,m+1):subFrac(1,m,1,m+1);
    return {type:'H11',level,kind:'muster',n0,plus,sg,m,rows,pred:simplify(pv[0],pv[1]),b:n0,avoid:[n0+'/'+m+sg]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},`Rechne die drei Aufgaben. Was fällt dir auf?`));},
  render(view,host){
    const t=view.task,d=view.draft;
    const stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>'Drei Rechnungen fertig'});
    stg.box1.append(el('div',{class:'hnmuster'},...t.rows.map((r,i)=>el('div',{class:'addrow'},frac(1,r.n),op(t.sg),frac(1,r.n+1),op('='),fracInput(view,'r'+i))))); /* nebeneinander, wenn Platz ist */
    const go=el('button',{type:'button',class:'btn small'},'Weiter zum Muster');
    go.addEventListener('click',()=>{if(view.locked())return;if(t.rows.some((_,i)=>!getFrac(d,'r'+i)))return;d.s1=true;view.save();stg.advance();});
    stg.box1.append(go);
    stg.box2.append(el('p',null,strong('Sage voraus:')),el('div',{class:'addrow'},frac(1,t.m),op(t.sg),frac(1,t.m+1),op('='),fracInput(view,'p')),el('p',null,strong('Welches Muster stimmt?')));
    hnChoice(view,stg.box2,'mu',[
      {id:'A',parts:[t.plus?'Zähler = Summe der Nenner, Nenner = Produkt der Nenner.':'Zähler 1, Nenner = Produkt der Nenner.']},
      {id:'B',parts:[t.plus?'Zähler 2, Nenner = Summe der Nenner.':'Zähler 1, Nenner = Summe der Nenner.']},
      {id:'C',parts:['Zähler und Nenner werden einzeln gerechnet.']}],'Muster');
    stg.upd();
  },
  validate(t,d){
    for(let i=0;i<3;i++){const f=getFrac(d,'r'+i);if(!f)return invalid('Rechne alle drei Aufgaben.');const v=t.rows[i].v;if(!equivalent(f.n,f.d,v[0],v[1]))return wrong('muster',`Aufgabe ${i+1} stimmt noch nicht. Erweitere beide Brüche auf den Hauptnenner. Tippe oben auf „ändern“.`,{['r'+i+'.n']:false,['r'+i+'.d']:false});}
    if(d.s1!==true)return invalid('Tippe auf „Weiter zum Muster“.');
    const p=getFrac(d,'p');if(!p)return invalid('Trage deine Vorhersage ein.');
    if(!equivalent(p.n,p.d,t.pred[0],t.pred[1]))return wrong('vorhersage','Die Vorhersage stimmt noch nicht. Nutze das Muster der drei Aufgaben.',{'p.n':false,'p.d':false});
    if(!d.mu)return invalid('Wähle das Muster.');
    if(d.mu!=='A')return wrong('muster','Vergleiche die Ergebnisse mit den Nennern der Aufgaben.',{['mu'+d.mu]:false});
    return right(`Richtig! ${ft(1,t.m)} ${t.sg} ${ft(1,t.m+1)} = ${hnFt(t.pred)}.`);
  },
  solution(t){return t.rows.map(r=>eq(frac(1,r.n),t.sg,frac(1,r.n+1),'=',frac(r.v[0],r.v[1]))).concat([eq(frac(1,t.m),t.sg,frac(1,t.m+1),'=',frac(t.pred[0],t.pred[1])),
    line(t.plus?'Der Zähler ist die Summe der Nenner, der Nenner ihr Produkt.':'Der Zähler ist 1, der Nenner ist das Produkt der Nenner.')]);}
});
/* H12 Magisches Quadrat: Lo-Shu-Muster · Schritt + Versatz mit gemeinsamem Nenner, gekürzt angezeigt (dadurch ungleichnamig) */
const HN_LOSHU=[2,7,6,9,5,1,4,3,8];
const HN_LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function hnSolvable(blanks){
  const left=new Set(blanks);let moved=true;
  while(left.size&&moved){moved=false;for(const L of HN_LINES){const b=L.filter(i=>left.has(i));if(b.length===1){left.delete(b[0]);moved=true;}}}
  return left.size===0;
}
TASKS.H12=hnStation('H12',{name:'Magisches Quadrat',desc:'Jede Zeile, Spalte und Diagonale hat dieselbe Summe. Fülle die leeren Felder.',notes:['M20','M19']},{size:3,
  gen(level,R,ctx){
    for(let g=0;g<200;g++){
      const D=R.pick(level===1?[6,8,10,12]:[12,15,18,20,24]),s=R.int(1,level===1?1:2),o=R.int(0,level===1?2:4);
      const vals=HN_LOSHU.map(x=>simplify(o+s*x,D));
      if(new Set(vals.map(v=>v[1])).size<3)continue;
      const k=level===1?3:5;let blanks;
      for(let i=0;i<60;i++){blanks=R.shuffle([0,1,2,3,4,5,6,7,8]).slice(0,k).sort((p,q)=>p-q);if(hnSolvable(blanks))break;blanks=null;}
      if(!blanks)continue;
      if(ctx&&ctx.probe&&new Set(blanks.map(i=>Math.floor(i/3))).size>2)continue; /* Probe in der Erklärung: Lücken in höchstens zwei Zeilen */
      return {type:'H12',level,kind:'quadrat',vals,blanks,sum:simplify(3*(o+5*s),D),b:D,avoid:[D+'/'+s+'/'+o]};
    }
    return {type:'H12',level,kind:'quadrat',vals:HN_LOSHU.map(x=>simplify(x,12)),blanks:[1,4,8],sum:[5,4],b:12,avoid:['x']};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Jede Zeile, jede Spalte und jede Diagonale ergibt ',frac(t.sum[0],t.sum[1]),'. Fülle die leeren Felder.'));},
  render(view,host){
    const t=view.task;
    host.append(el('div',{class:'hnmagic',role:'group','aria-label':'Magisches Quadrat'},...t.vals.map((v,i)=>el('div',{class:'hnmc'},t.blanks.includes(i)?fracInput(view,'q'+i):frac(v[0],v[1])))));
  },
  validate(t,d){
    if(t.blanks.some(i=>!getFrac(d,'q'+i)))return invalid('Fülle alle leeren Felder aus.');
    const m={};let bad=0;
    t.blanks.forEach(i=>{const f=getFrac(d,'q'+i),v=t.vals[i],ok=equivalent(f.n,f.d,v[0],v[1]);if(!ok){bad++;m['q'+i+'.n']=false;m['q'+i+'.d']=false;}});
    if(!bad)return right('Richtig! Alle Summen ergeben '+hnFt(t.sum)+'.');
    return wrong('quadrat',`${bad} ${bad===1?'Feld stimmt':'Felder stimmen'} noch nicht. Suche eine Zeile mit nur einem leeren Feld.`,m);
  },
  solution(t){return [el('div',{class:'hnmagic'},...t.vals.map(v=>el('div',{class:'hnmc'},frac(v[0],v[1])))),line('Starte mit einer Zeile, Spalte oder Diagonale, in der nur ein Feld fehlt.')];}
});
/* H13 17 Kamele: Summe der Anteile, Begründung, Anteil nach dem Leihen */
const HN_KAMELE=[{n:17,s:[2,3,9]},{n:11,s:[2,4,6]},{n:23,s:[2,3,8]},{n:19,s:[2,4,5]},{n:41,s:[2,3,7]}];
const HN_KGRUND=[{id:'A',txt:'Es ist weniger als ein Ganzes.'},{id:'B',txt:'Es ist genau ein Ganzes.'},{id:'C',txt:'Der Vater hat sich verzählt.'},{id:'D',txt:'Ein Sohn gibt ein Kamel zurück.'}];
TASKS.H13=hnStation('H13',{name:'17 Kamele',desc:'Ein altes Rätsel: Warum bleibt ein Kamel übrig?',notes:['M20','M19']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'summe',V=R.pick(level===1?HN_KAMELE.slice(0,2):HN_KAMELE),terms=V.s.map(q=>[1,q]),res=hnValue(terms,['+','+']);
    return {type:'H13',level,kind,n:V.n,s:V.s,terms,signs:['+','+'],res,son:R.int(0,2),b:V.s[0],d:V.s[1],avoid:[V.n+kind]};
  },
  prompt(t,h){
    const f=t.s.map(q=>frac(1,q));
    const ask=t.kind==='summe'?'Welcher Anteil ist das zusammen?':t.kind==='grund'?'Die Söhne leihen ein Kamel dazu. Am Ende bleibt eins übrig. Warum?'
      :`Die Söhne leihen ein Kamel. Jetzt sind es ${t.n+1}. Wie viele Kamele bekommt der ${['Älteste','Mittlere','Jüngste'][t.son]}?`;
    h.append(el('p',{class:'q qa'},`Ein Vater hinterlässt seinen drei Söhnen ${t.n} Kamele. Der Älteste bekommt `,f[0],', der Mittlere ',f[1],', der Jüngste ',f[2],'. '+ask)); /* ein Absatz: spart auf dem Handy eine Zeile */
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='summe'){addResultH(view,host,t,hnBlockOpt(t));return;}
    if(t.kind==='grund'){host.append(eq(frac(1,t.s[0]),'+',frac(1,t.s[1]),'+',frac(1,t.s[2]),'=',frac(t.n,t.n+1)));hnChoice(view,host,'g',HN_KGRUND.map(x=>({id:x.id,parts:[x.txt]})),'Warum?');return;}
    host.append(el('div',{class:'addrow'},el('span',{class:'alab'},'Kamele'),intInput(view,'x','Zahl der Kamele')));
  },
  validate(t,d){
    if(t.kind==='summe'){const r=hnResultCheck(t,d,hnBlockOpt(t));return r.ok?right(`Richtig! ${hnProof(t)} Es fehlt ${ft(1,t.n+1)} zum Ganzen.`):r;}
    if(t.kind==='grund'){if(!d.g)return invalid('Tippe eine Antwort an.');return d.g==='A'?right(`Richtig! Zusammen sind es nur ${ft(t.n,t.n+1)}. Das geliehene Kamel bleibt übrig.`):wrong('grund','Rechne die drei Anteile zusammen. Ist es ein ganzes Erbe?',{['g'+d.g]:false});}
    const x=getInt(d,'x'),want=(t.n+1)/t.s[t.son];
    if(x===null)return invalid('Trage die Zahl der Kamele ein.');
    if(x===want)return right(`Richtig! ${ft(1,t.s[t.son])} von ${t.n+1} sind ${want} Kamele.`);
    return wrong('anteil',`Teile ${t.n+1} durch ${t.s[t.son]}.`,{x:false});
  },
  solution(t){
    const out=[eq(frac(1,t.s[0]),'+',frac(1,t.s[1]),'+',frac(1,t.s[2]),'=',frac(t.n,t.n+1))];
    out.push(line(`Zusammen ist das weniger als ein Ganzes. Mit ${t.n+1} Kamelen: ${t.s.map(q=>(t.n+1)/q).join(' + ')} = ${t.n} Kamele.`));
    out.push(line('Ein Kamel bleibt übrig: Es geht zurück an den Nachbarn.'));
    return out;
  }
});
TASKS.H12.probeCtx={probe:true};
TASKS.H13.probeCtx={kind:'anteil'}; /* Probe in der Erklärung: eine Zahl eintragen, passt mit der Kopfzeile auf das Handy */

/* =====================================================================
   H14 Schmetterlingstrick (falter, wann, wer): zweiter Weg zum gemeinsamen Nenner, freiwillig am Ende des Lernpfads.
   Über Kreuz malnehmen (a · d, c · b), unten b · d, dann oben rechnen und kürzen. Danach: Wann ist b · d schon der Hauptnenner?
   ===================================================================== */
const HN_FALTER_DENS={1:[2,3,4,5,6,7,8,9,10],2:[2,3,4,5,6,7,8,9,10,12,15]};
function hnFalterNums(R,level,ctx){
  const step=hnStep(ctx),red=hnRedOf(R,ctx);
  const plus=ctx&&typeof ctx.plus==='boolean'?ctx.plus:!ctx||ctx.step==null?true:level===1?step!==3:step===0?true:step===2?false:R.chance(0.5);
  const L=level===1&&step<2?[2,3,4,5,6]:HN_FALTER_DENS[level],cap=level===1?60:150;
  for(let i=0;i<900;i++){
    const b=R.pick(L),d=R.pick(L);
    if(b===d||b*d>cap)continue;
    const a=R.int(1,b-1),c=R.int(1,d-1);
    if(gcd(a,b)!==1||gcd(c,d)!==1||a*d===c*b)continue;
    if(!plus&&a*d<c*b)continue;
    const num=plus?a*d+c*b:a*d-c*b,bd=b*d;
    if(num%bd===0||level===1&&num>bd)continue;
    if(i<700&&(gcd(num,bd)>1)!==red)continue;
    return {a,b,c,d,plus,N:hnOf(b,d),terms:[[a,b],[c,d]],signs:[hnSign(plus)],res:[num,bd]};
  }
  return {a:2,b:3,c:3,d:5,plus:true,N:15,terms:[[2,3],[3,5]],signs:['+'],res:[19,15]};
}
const hnFalterProof=(t)=>{
  const s=simplify(t.res[0],t.res[1]);
  return `${ft(t.a,t.b)} ${t.signs[0]} ${ft(t.c,t.d)} = ${ft(t.res[0],t.res[1])}`+(s[1]!==t.res[1]?` = ${ft(s[0],s[1])}`:'')+'.';
};
TASKS.H14=hnStation('H14',{name:'Schmetterlingstrick',desc:'Ein zweiter Weg: über Kreuz malnehmen. Wann ist der Hauptnenner besser?',notes:['M22','M19']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'falter';
    if(kind==='wer'){
      let r=hnFindNums(R,level,ctx);
      for(let i=0;i<80&&r.b*r.d===r.N;i++)r=hnFindNums(R,level,Object.assign({},ctx,{typ:R.chance(0.5)?'viel':'beide'}));
      if(r.b*r.d===r.N)r={a:1,b:4,c:1,d:6,N:12,plus:true,terms:[[1,4],[1,6]],signs:['+'],res:[5,12]};
      const t=hnBase('H14',level,kind,r);
      t.opts=R.shuffle([{id:'A',txt:`Beide. ${NAMES.b} hat den Hauptnenner.`},{id:'B',txt:`Nur ${NAMES.a}.`},{id:'C',txt:`Nur ${NAMES.b}.`},{id:'D',txt:'Keiner von beiden.'}]);
      return t;
    }
    if(kind==='wann'){
      const L=HN_FALTER_DENS[level],want=R.chance(0.5);
      for(let i=0;i<400;i++){
        const b=R.pick(L),d=R.pick(L);
        if(b===d||(gcd(b,d)===1)!==want&&i<300)continue;
        let a,c;do{a=R.int(1,b-1);}while(gcd(a,b)!==1);do{c=R.int(1,d-1);}while(gcd(c,d)!==1);
        return hnBase('H14',level,kind,{a,b,c,d,N:hnOf(b,d),plus:true,terms:[[a,b],[c,d]],signs:['+']});
      }
      return hnBase('H14',level,kind,{a:1,b:4,c:1,d:6,N:12,plus:true,terms:[[1,4],[1,6]],signs:['+']});
    }
    return hnBase('H14',level,'falter',hnFalterNums(R,level,ctx));
  },
  prompt(t,h){
    const f=t.terms.map(x=>frac(x[0],x[1]));
    if(t.kind==='wer'){h.append(el('p',{class:'q qa'},`Gesucht ist ein gemeinsamer Nenner für `,f[0],' und ',f[1],`. ${NAMES.a} nimmt ${t.b} · ${t.d} = ${t.b*t.d}. ${NAMES.b} nimmt ${t.N}. Wer hat recht?`));return;}
    if(t.kind==='wann'){h.append(el('p',{class:'q qa'},`Der Schmetterling gibt ${t.b} · ${t.d} = ${t.b*t.d}. Ist das schon der Hauptnenner von `,f[0],' und ',f[1],'?'));return;}
    h.append(el('p',{class:'q'},t.plus?'Addiere mit dem Schmetterling.':'Subtrahiere mit dem Schmetterling.'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='wer'){hnChoice(view,host,'w',t.opts.map(o=>({id:o.id,parts:[o.txt]})),'Wer hat recht?');return;}
    if(t.kind==='wann'){hnYesNo(view,host,'j');return;}
    const keys=['fl','fr','fn'],filled=()=>keys.every(k=>d[k]!=null&&d[k]!=='');
    const stg=twoStage(view,host,{isDone:()=>d.hw===true,summary:()=>`Oben ${d.fl||'?'} und ${d.fr||'?'}, unten ${d.fn||'?'}`});
    const fig=falterFigure({a:t.a,b:t.b,c:t.c,d:t.d,sign:t.signs[0],
      l:intInput(view,'fl',`${t.a} mal ${t.d}`),r:intInput(view,'fr',`${t.c} mal ${t.b}`),n:intInput(view,'fn',`${t.b} mal ${t.d}`)});
    const go=el('button',{type:'button',class:'btn small','aria-label':'Weiter zum Ergebnis'},'Weiter');
    const up=()=>{go.disabled=view.locked()||!filled();};
    fig.addEventListener('input',up);
    go.addEventListener('click',()=>{if(view.locked()||!filled())return;d.hw=true;view.save();stg.advance();});
    stg.box1.append(el('div',{class:'flrow'},fig,go));
    up();
    addResult(view,stg.box2,{});
    stg.upd();
  },
  validate(t,d){
    if(t.kind==='wer'){
      const hn=t.N;
      if(!d.w)return invalid('Tippe eine Antwort an.');
      if(d.w==='A')return right(`Richtig! Beide sind gemeinsame Nenner. ${hn} ist der kleinste, das spart Kürzen.`);
      return wrong('wer',d.w==='C'?`Auch ${t.b*t.d} ist ein gemeinsamer Nenner. Beide gehen.`:d.w==='B'?`Auch ${hn} ist ein gemeinsamer Nenner. Er ist sogar der kleinste.`:'Prüfe beide Zahlen: Passen beide Nenner ohne Rest hinein?',{['w'+d.w]:false});
    }
    if(t.kind==='wann'){
      if(d.j==null)return invalid('Tippe Ja oder Nein an.');
      const yes=gcd(t.b,t.d)===1,bd=t.b*t.d;
      if((d.j==='ja')===yes)return right(yes?`Richtig! Trick 17 findet keine kleinere Zahl. ${bd} ist der Hauptnenner.`:`Richtig! Der Hauptnenner ist ${t.N}. ${bd} ist größer als nötig.`);
      return wrong('wann','Prüfe mit Trick 17: Passen beide Nenner in eine kleinere Zahl?',{['j'+d.j]:false});
    }
    const L=getInt(d,'fl'),Rr=getInt(d,'fr'),Nn=getInt(d,'fn');
    if(L===null||Rr===null||Nn===null)return invalid('Trage die drei Produkte ein.');
    if(L!==t.a*t.d)return L===t.a*t.b?wrong('schmetterlingFalsch','Jeder Zähler gehört zum anderen Nenner. Folge dem Flügel.',{fl:false}):wrong('produkt',`Rechne ${t.a} · ${t.d} noch einmal.`,{fl:false});
    if(Rr!==t.c*t.b)return Rr===t.c*t.d?wrong('schmetterlingFalsch','Jeder Zähler gehört zum anderen Nenner. Folge dem Flügel.',{fr:false}):wrong('produkt',`Rechne ${t.c} · ${t.b} noch einmal.`,{fr:false});
    if(Nn!==t.b*t.d)return Nn===t.b+t.d?wrong('nennerSumme','Die Nenner werden malgenommen, nicht addiert.',{fn:false}):wrong('produkt',`Rechne ${t.b} · ${t.d} noch einmal.`,{fn:false});
    if(d.hw!==true)return invalid('Tippe auf „Weiter“.');
    const r=hnResultCheck(t,d,{resultOnly:true});
    if(!r.ok)return r;
    return right('Richtig! '+hnFalterProof(t)+(t.N<t.b*t.d?` Mit dem Hauptnenner ${t.N} wäre es kürzer.`:''));
  },
  solution(t){
    if(t.kind==='wer')return [trickRow(t.terms),line(`${t.b*t.d} (Schmetterling) und ${t.N} (Hauptnenner) sind beide gemeinsame Nenner.`)];
    if(t.kind==='wann')return [trickRow(t.terms),line(gcd(t.b,t.d)===1?`${t.b*t.d} ist der Hauptnenner.`:`Der Hauptnenner ist ${t.N}, nicht ${t.b*t.d}.`)];
    const sg=t.signs[0],l=t.a*t.d,r=t.c*t.b,bd=t.b*t.d,s=simplify(t.res[0],bd),out=[
      falterFigure({a:t.a,b:t.b,c:t.c,d:t.d,sign:sg,l,r,n:bd}),
      eq(frac(t.a,t.b),sg,frac(t.c,t.d),'=',frac(`${l} ${sg} ${r}`,bd),'=',frac(t.res[0],bd))];
    if(s[1]!==bd){const g=bd/s[1];out.push(line('Kürzen: '),eq(frac(t.res[0],bd),'=',frac(t.res[0]+' : '+g,bd+' : '+g),'=',frac(s[0],s[1])));}
    else out.push(line('Das Ergebnis lässt sich nicht kürzen.'));
    if(t.N<bd)out.push(line(`Mit dem Hauptnenner ${t.N} musst du weniger kürzen.`));
    return out;
  }
});
