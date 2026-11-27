'use strict';
/* =====================================================================
   Etappe F „Brüche verstehen“ (Umbau 2026-11, P4/P5/P6): das Fundament für alle Etappen.
   Leitdarstellung Rechteck → Streifen (ein Rechteck mit einer Reihe) → Zahlenstrahl; Kreise nur in F06 und Knifflig.
   Kern: F01 Anteile erkennen · F02 Das Ganze zählt · F03 Mehrere Ganze · F04 Anteile von Größen · F05 Brüche größer 1 · F06 Was gehört zusammen?
   Plus: F07 Das Ganze finden · F08 Bruchrätsel. Labor FLAB (js/verstehen-extra.js), Eingangstest FQ, Abschlusscheck FA, Merkzettel M23–M25.
   Fokus (Notiz des Lehrers): Anteile, die auf mehrere Ganze verteilt sind, und: nur gleiche Ganze darf man zusammenfassen.
   Brüche größer 1 kommen ab F05 vor, nie in der ersten Aufgabe einer Runde (P6).
   ===================================================================== */
/* Bild eines Bruchs: Rechteck (Raster), wenn es lesbar ist, sonst Streifen; Kreis nur auf Wunsch */
function fMode(d,o){o=o||{};if(o.circle)return 'circle';return gridOK(d)&&!o.strip?'grid':'strip';}
function fFig(n,d,o){o=o||{};return drawMode(fMode(d,o),n,d,Object.assign({maxW:o.maxW||220,label:o.label||(n+' von '+d+' gleich großen Teilen gefärbt')},o));}
/* mehrere Ganze nebeneinander: p gefärbte Teile, jedes Ganze in q Teile (p darf größer als q sein) */
function fWholes(p,q,w,o){
  o=o||{};const box=el('div',{class:'fwholes',role:'img','aria-label':w+' Ganze zu je '+q+' Teilen, '+p+' Teile gefärbt'});
  for(let i=0;i<w;i++){const k=Math.max(0,Math.min(q,p-i*q));box.append(drawMode(o.mode||fMode(q),k,q,{maxW:o.maxW||(w>2?110:150),label:'Ganzes '+(i+1)}));}
  return box;
}
/* ungleich geteiltes Rechteck: Breiten (Summe 360), Teil 0 gefärbt */
function fUnequal(widths,on){
  const svg=S_('svg',{viewBox:'0 0 362 72',class:'fracsvg',role:'img','aria-label':'Rechteck in '+widths.length+' Teile geteilt'});svg.style.maxWidth='15rem';
  let x=1;widths.forEach((w,i)=>{svg.append(S_('g',{class:'cell'+(i===on?' on':'')},S_('rect',{x,y:1,width:w,height:70})));x+=w;});
  return svg;
}
/* Streifen mit fester Länge (für „verschieden große Ganze“): len in rem */
function fStripLen(n,d,len,label){const s=drawFractionStrip(n,d,{maxW:len*16,label});s.style.width=len+'rem';return s;}
const fPlanId=(plans)=>plans.__id;
const fPlanCtx=(plans)=>(round,level)=>{
  const P=plans[level]||plans[1],size=P.length;
  if(!Array.isArray(round.fk)||round.fk.length!==size)round.fk=oneFormPlan(fPlanId(plans),level,P,size); /* eine Form je Runde */
  const i=Math.min(round.results.length,size-1);
  return {kind:round.fk[i],step:i};
};
const fStation=(id,meta,plans,impl)=>(Object.defineProperty(plans,'__id',{value:id,enumerable:false}),Object.assign({area:'Verstehen',size:5,planKey:'fk',ctx:fPlanCtx(plans),layoutKinds:(l)=>Array.from(new Set(plans[l]||plans[1]))},meta,impl));
const fq=(R,list)=>R.pick(list);
const fRedPair=(R,qs,proper)=>{let p,q;do{q=R.pick(qs);p=proper===false?R.int(q+1,3*q-1):R.int(1,q-1);}while(gcd(p,q)!==1);return [p,q];};

/* ---------- F01 Anteile erkennen ---------- */
const F01_SENT=(p,q)=>p+' von '+q+' gleich großen Teilen';
TASKS.F01=fStation('F01',{name:'Anteile erkennen',desc:'Gleich große Teile zählen: Bild, Bruch und Satz gehören zusammen.',notes:['M23']},
  {1:['ablesen','faerben','gleich','satz','ablesen'],2:['ablesen','gleich','satz','faerben','gleich']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'ablesen';
    const qs=level===1?[2,3,4,5,6,8]:[4,6,8,9,10,12,15,16];
    if(kind==='gleich'){
      const k=R.pick([2,3,4]),eqp=R.chance(0.5);
      let widths=Array(k).fill(360/k);
      if(!eqp){const big=R.int(0,k-1);widths=widths.map((w,i)=>i===big?w*1.6:w);const s=widths.reduce((a,b)=>a+b,0);widths=widths.map(w=>w*360/s);}
      return {type:'F01',level,kind,k,widths,eq:eqp,answer:eqp?'ja':'nein',avoid:['g'+k+eqp]};
    }
    const q=R.pick(qs),p=R.int(1,q-1);
    if(kind==='satz'){
      const rev=level===2&&R.chance(0.5);
      const opts=R.shuffle([{id:'A',f:[p,q]},{id:'B',f:[q,p]},{id:'C',f:[p,q+p]},{id:'D',f:[q-p,q]}].filter((o,i,a)=>a.findIndex(x=>x.f[0]===o.f[0]&&x.f[1]===o.f[1])===i));
      return {type:'F01',level,kind,p,q,rev,opts,avoid:[redKey(p,q)]};
    }
    const fill=level===2&&kind==='ablesen'?scatterFill(p,q,fMode(q),R,{pClassic:0.2}):null;
    return {type:'F01',level,kind,p,q,fill,avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    if(t.kind==='ablesen')h.append(el('p',{class:'q'},'Welcher Bruch ist gefärbt?'));
    else if(t.kind==='faerben')h.append(el('p',{class:'q'},'Färbe ',frac(t.p,t.q),' des Rechtecks. Tippe die Teile an.'));
    else if(t.kind==='gleich')h.append(el('p',{class:'q'},'Das Rechteck ist in '+t.k+' Teile geteilt. Ist der gefärbte Teil ',frac(1,t.k),'?'));
    else h.append(el('p',{class:'q qa'},t.rev?['Welcher Satz passt zu ',frac(t.p,t.q),'?']:'„'+F01_SENT(t.p,t.q)+' sind gefärbt.“ Welcher Bruch passt?'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='ablesen'){host.append(el('div',{class:'fstage'},fFig(t.p,t.q,{fill:t.fill})),el('div',{class:'addrow'},fracInput(view,'r')));return;}
    if(t.kind==='faerben'){
      const sel=new Set((d.f||[]).map(Number));
      const fig=drawCells(fMode(t.q),t.q,fMode(t.q)==='grid'?gridDims(t.q):null,sel,{maxW:260,label:'Rechteck in '+t.q+' Teile geteilt',onToggle:view.locked()?null:(i)=>{
        if(view.locked())return sel.has(i);if(sel.has(i))sel.delete(i);else sel.add(i);d.f=[...sel].sort((a,b)=>a-b);view.save();return sel.has(i);}});
      host.append(el('div',{class:'fstage'},fig));return;
    }
    if(t.kind==='gleich'){host.append(el('div',{class:'fstage'},fUnequal(t.widths,0)));hnYesNo(view,host,'j');return;}
    hnChoice(view,host,'w',t.opts.map(o=>({id:o.id,parts:t.rev?['„'+F01_SENT(o.f[0],o.f[1])+'“']:[frac(o.f[0],o.f[1])]})),'Antworten');
  },
  validate(t,d){
    if(t.kind==='ablesen'){
      const r=getFrac(d,'r');if(!r)return invalid(MSG_FRAC_INVALID);
      if(r.n===t.p&&r.d===t.q)return right(`Richtig! ${t.p} von ${t.q} gleich großen Teilen sind gefärbt.`);
      if(equivalent(r.n,r.d,t.p,t.q))return soft('anders','Der Wert stimmt. Lies aber genau ab: Zähle alle Teile für den Nenner.',{'r.n':false,'r.d':false});
      if(r.n===t.q-t.p&&r.d===t.q)return wrong('ungefaerbt','Du hast die weißen Teile gezählt. Der Zähler zählt die gefärbten.',{'r.n':false});
      if(r.n===t.p&&r.d===t.q-t.p)return wrong('teilTeil','Der Nenner zählt alle Teile, nicht nur die weißen.',{'r.d':false});
      if(r.n===t.q&&r.d===t.p)return wrong('vertauscht','Zähler und Nenner sind vertauscht. Unten steht die Zahl aller Teile.',{'r.n':false,'r.d':false});
      return wrong('zaehlen','Zähle noch einmal: oben die gefärbten Teile, unten alle Teile.',{'r.n':false,'r.d':false});
    }
    if(t.kind==='faerben'){
      const n=(d.f||[]).length;if(!n)return invalid('Tippe Teile an, um sie zu färben.');
      if(n===t.p)return right(`Richtig! ${t.p} von ${t.q} Teilen sind gefärbt.`);
      return wrong('anzahl',n<t.p?'Es fehlen noch Teile. Der Zähler sagt, wie viele.':'Das sind zu viele Teile. Der Zähler sagt, wie viele.',{});
    }
    if(t.kind==='gleich'){
      if(!d.j)return invalid('Tippe Ja oder Nein an.');
      if(d.j===t.answer)return right(t.eq?'Richtig! Alle Teile sind gleich groß. Darum ist es '+ft(1,t.k)+'.':'Richtig! Die Teile sind nicht gleich groß. Dann ist es kein '+ft(1,t.k)+'.');
      return wrong('gleich','Prüfe zuerst: Sind alle Teile gleich groß?',{});
    }
    if(!d.w)return invalid('Tippe eine Antwort an.');
    const o=t.opts.find(x=>x.id===d.w);
    if(o.f[0]===t.p&&o.f[1]===t.q)return right('Richtig! '+F01_SENT(t.p,t.q)+' – das ist '+ft(t.p,t.q)+'.');
    return wrong('satz','Unten steht die Zahl aller Teile, oben die Zahl der gefärbten.',{});
  },
  solution(t){
    if(t.kind==='gleich')return [fUnequal(t.widths,0),line(t.eq?'Alle Teile sind gleich groß: '+ft(1,t.k)+'.':'Die Teile sind verschieden groß. Ein Bruch braucht gleich große Teile.')];
    if(t.kind==='faerben')return [fFig(t.p,t.q),line(`${t.p} von ${t.q} Teilen sind gefärbt.`)];
    return [fFig(t.p,t.q),line(F01_SENT(t.p,t.q)+': ',frac(t.p,t.q),'.')];
  },
  hints(t){
    if(t.kind==='gleich')return [['Ein Bruch braucht gleich große Teile.'],['Vergleiche die Breite der Teile.'],[t.eq?'Alle Teile sind gleich breit.':'Ein Teil ist breiter als die anderen.']];
    if(t.kind==='faerben')return [['Der Nenner sagt, in wie viele Teile geteilt ist.'],[`Der Zähler sagt, wie viele Teile du färbst: ${t.p}.`],[`Färbe genau ${t.p} Teile.`]];
    return [['Unten steht die Zahl aller Teile.'],['Oben steht die Zahl der gefärbten Teile.'],[`Es sind ${t.q} Teile, ${t.p} davon gefärbt.`]];
  }
});

/* ---------- F02 Das Ganze zählt ---------- */
TASKS.F02=fStation('F02',{name:'Das Ganze zählt',desc:'Derselbe Bruch ist bei verschiedenen Ganzen verschieden viel.',notes:['M24']},
  {1:['gleichViel','ganzes','gleichViel','ganzes','mehr'],2:['gleichViel','mehr','ganzes','mehr','ganzes']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'gleichViel';
    if(kind==='gleichViel'){
      const q=R.pick([2,3,4]),same=R.chance(0.4),big=same?1:R.pick([1.5,2]);
      return {type:'F02',level,kind,q,same,big,answer:same?'ja':'nein',avoid:['gv'+q+same]};
    }
    if(kind==='ganzes'){
      const [p,q]=level===1?[1,R.pick([2,3,4,5,6])]:fRedPair(R,[3,4,5,6,8]);
      return {type:'F02',level,kind,p,q,avoid:[redKey(p,q)]};
    }
    /* mehr: a/b vom kleinen Ganzen gegen c/d vom k-mal so großen Ganzen */
    for(let i=0;i<200;i++){
      const k=R.pick([2,3]),[a,b]=fRedPair(R,[2,3,4]),[c,d]=fRedPair(R,[2,3,4,6]);
      const L=a/b,Rv=k*c/d;if(Math.abs(L-Rv)<1e-9&&R.chance(0.7))continue;
      if(level===1&&!(Rv>L)&&!(Math.abs(L-Rv)<1e-9))continue;
      return {type:'F02',level,kind,k,a,b,c,d,answer:Math.abs(L-Rv)<1e-9?'C':Rv>L?'B':'A',avoid:['m'+a+b+c+d+k]};
    }
    return {type:'F02',level,kind,k:2,a:1,b:2,c:1,d:3,answer:'B',avoid:['m']};
  },
  prompt(t,h){
    if(t.kind==='gleichViel')h.append(el('p',{class:'q qa'},`${NAMES.c} isst `,frac(1,t.q),` vom oberen Blech, ${NAMES.d} `,frac(1,t.q),' vom unteren Blech. Haben beide gleich viel?'));
    else if(t.kind==='ganzes')h.append(el('p',{class:'q qa'},'Das ist ',frac(t.p,t.q),' eines Streifens. Wie viele solche Stücke hat der ganze Streifen?'));
    else h.append(el('p',{class:'q qa'},`${NAMES.a} nimmt `,frac(t.a,t.b),` vom kleinen Blech. ${NAMES.b} nimmt `,frac(t.c,t.d),' vom großen Blech. Wer hat mehr?'));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='gleichViel'){host.append(el('div',{class:'fstage fcol'},fStripLen(1,t.q,9,'oberes Blech'),fStripLen(1,t.q,9*t.big,'unteres Blech')));hnYesNo(view,host,'j');return;}
    if(t.kind==='ganzes'){host.append(el('div',{class:'fstage'},fStripLen(t.p,t.p,2.2*t.p,'Stück: '+t.p+' Teile')),el('div',{class:'addrow'},'Das Ganze hat ',intInput(view,'x','Zahl der Teile im Ganzen'),' Teile.'));return;}
    host.append(el('div',{class:'fstage fcol'},el('div',{class:'frow'},el('small',null,'kleines Blech'),fStripLen(t.a,t.b,6,'kleines Blech')),el('div',{class:'frow'},el('small',null,'großes Blech'),fStripLen(t.c,t.d,6*t.k,'großes Blech'))));
    hnChoice(view,host,'w',[{id:'A',parts:[NAMES.a]},{id:'B',parts:[NAMES.b]},{id:'C',parts:['Beide gleich viel']}],'Wer hat mehr?');
  },
  validate(t,d){
    if(t.kind==='gleichViel'){
      if(!d.j)return invalid('Tippe Ja oder Nein an.');
      if(d.j===t.answer)return right(t.same?'Richtig! Beide Bleche sind gleich groß. Dann ist '+ft(1,t.q)+' gleich viel.':'Richtig! Das untere Blech ist größer. Sein '+ft(1,t.q)+' ist mehr.');
      return wrong('ganzes','Schau auf die Größe der Bleche. Ein Bruch hängt vom Ganzen ab.',{});
    }
    if(t.kind==='ganzes'){
      const x=getInt(d,'x');if(x===null)return invalid('Trage eine Zahl ein.');
      if(x===t.q)return right(`Richtig! ${t.p} Teile sind ${ft(t.p,t.q)}. Das Ganze hat ${t.q} Teile.`);
      if(x===t.p)return wrong('stueck','Das Stück hat '+t.p+' Teile. Das Ganze ist größer.',{x:false});
      return wrong('ganzes','Der Nenner sagt, wie viele Teile das Ganze hat.',{x:false});
    }
    if(!d.w)return invalid('Tippe eine Antwort an.');
    if(d.w===t.answer)return right('Richtig! Das große Blech ist '+t.k+'-mal so groß. Darum zählt das Ganze mit.');
    return wrong('mehr','Vergleiche die gefärbten Stücke, nicht nur die Brüche.',{});
  },
  solution(t){
    if(t.kind==='ganzes')return [fStripLen(t.p,t.q,2.2*t.q,'ganzer Streifen'),line(`${t.p} Teile sind ${ft(t.p,t.q)}. Das Ganze hat ${t.q} Teile.`)];
    if(t.kind==='gleichViel')return [line(t.same?'Gleich große Bleche: gleich viel.':'Verschieden große Bleche: verschieden viel.')];
    return [line('Kleines Blech: ',frac(t.a,t.b),'. Großes Blech: ',frac(t.c,t.d),' von einem '+t.k+'-mal so großen Blech.'),line(t.answer==='C'?'Beide haben gleich viel.':(t.answer==='B'?NAMES.b:NAMES.a)+' hat mehr.')];
  },
  hints(t){
    if(t.kind==='ganzes')return [['Der Nenner sagt, wie viele Teile das Ganze hat.'],[`Hier ist der Nenner ${t.q}.`],[`Das Ganze hat ${t.q} Teile, das Stück nur ${t.p}.`]];
    if(t.kind==='gleichViel')return [['Sind die beiden Bleche gleich groß?'],['Ein Bruch hängt vom Ganzen ab.'],[t.same?'Die Bleche sind gleich lang.':'Das untere Blech ist länger.']];
    return [['Vergleiche die gefärbten Stücke im Bild.'],[`Das große Blech ist ${t.k}-mal so lang.`],['Welches gefärbte Stück ist länger?']];
  }
});

/* ---------- F03 Mehrere Ganze ---------- */
const F03_PAIRS=[
  {txt:'ein Viertel Kuchen und ein Viertel Pizza',ok:false,why:'Kuchen und Pizza sind verschiedene Ganze.'},
  {txt:'ein Viertel vom Blech und noch ein Viertel vom selben Blech',ok:true,why:'Beide Viertel gehören zum selben Blech.'},
  {txt:'ein Drittel von Lenas Tafel und ein Drittel von Toms Tafel (gleich große Tafeln)',ok:false,why:'Es sind zwei Tafeln. Zusammen sind es zwei Drittel von einer Tafel nur, wenn man genau hinschaut: es bleiben zwei Ganze.'},
  {txt:'zwei Fünftel und ein Fünftel derselben Strecke',ok:true,why:'Beide Teile gehören zur selben Strecke.'},
  {txt:'die Hälfte eines Apfels und die Hälfte einer Melone',ok:false,why:'Apfel und Melone sind verschieden große Ganze.'},
  {txt:'ein Achtel und drei Achtel derselben Pizza',ok:true,why:'Alles gehört zur selben Pizza.'}
];
F03_PAIRS[2].why='Die Teile gehören zu zwei verschiedenen Tafeln.';
TASKS.F03=fStation('F03',{name:'Mehrere Ganze',desc:'Verteilen, das Ganze bestimmen und nur gleiche Ganze zusammenfassen.',notes:['M24','M23']},
  {1:['verteilen','wasGanzes','zusammen','verteilen','wasGanzes'],2:['wasGanzes','verteilen','zusammen','wasGanzes','verteilen']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'verteilen';
    if(kind==='zusammen'){const i=R.int(0,F03_PAIRS.length-1);return {type:'F03',level,kind,i,answer:F03_PAIRS[i].ok?'ja':'nein',avoid:['z'+i]};}
    if(kind==='wasGanzes'){
      const q=R.pick(level===1?[3,4]:[3,4,5,6]),p=R.int(q+1,2*q-1),one=R.chance(0.5);
      return {type:'F03',level,kind,p,q,one,avoid:[redKey(p,q)+one]};
    }
    let n,k;do{n=R.int(1,level===1?4:7);k=R.int(2,level===1?6:8);}while(n===k||(level===1&&n>k)||n%k===0);
    return {type:'F03',level,kind,n,k,avoid:['v'+n+'/'+k]};
  },
  prompt(t,h){
    if(t.kind==='verteilen')h.append(el('p',{class:'q qa'},t.n+(t.n===1?' Pizza wird':' Pizzen werden')+' gerecht an '+t.k+' Kinder verteilt. Wie viel Pizza bekommt jedes Kind?'));
    else if(t.kind==='wasGanzes')h.append(el('p',{class:'q qa'},t.one?'Ein Rechteck ist das Ganze. Welcher Bruch ist gefärbt?':'Beide Rechtecke zusammen sind das Ganze. Welcher Bruch ist gefärbt?'));
    else h.append(el('p',{class:'q qa'},'Darf man '+F03_PAIRS[t.i].txt+' zu einem Bruch zusammenfassen?'));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='verteilen'){host.append(el('div',{class:'fstage'},fWholes(t.n*t.k,t.k,t.n,{mode:'grid'})),el('div',{class:'addrow'},'Jedes Kind bekommt ',fracInput(view,'r'),' Pizza.'));return;}
    if(t.kind==='wasGanzes'){host.append(el('div',{class:'fstage'},fWholes(t.p,t.q,2)),el('div',{class:'addrow'},fracInput(view,'r')));return;}
    hnYesNo(view,host,'j');
  },
  validate(t,d){
    if(t.kind==='zusammen'){
      if(!d.j)return invalid('Tippe Ja oder Nein an.');
      const P=F03_PAIRS[t.i];
      if(d.j===t.answer)return right('Richtig! '+P.why);
      return wrong('ganzes','Zusammenfassen darfst du nur Teile vom selben Ganzen.',{});
    }
    const r=getFrac(d,'r');if(!r)return invalid(MSG_FRAC_INVALID);
    if(t.kind==='verteilen'){
      if(equivalent(r.n,r.d,t.n,t.k))return right(`Richtig! Jede Pizza wird in ${t.k} Teile geteilt. Jedes Kind bekommt ${t.n} davon: ${ft(t.n,t.k)}.`);
      if(equivalent(r.n,r.d,t.k,t.n))return wrong('vertauscht','Zähler und Nenner sind vertauscht. Teile die Pizzen durch die Kinder.',{'r.n':false,'r.d':false});
      if(equivalent(r.n,r.d,1,t.k))return wrong('einePizza','Das wäre bei einer Pizza richtig. Es sind aber '+t.n+' Pizzen.',{'r.n':false});
      return wrong('verteilen','Teile jede Pizza in so viele Teile, wie es Kinder gibt.',{'r.n':false,'r.d':false});
    }
    const want=t.one?[t.p,t.q]:[t.p,2*t.q],other=t.one?[t.p,2*t.q]:[t.p,t.q];
    if(equivalent(r.n,r.d,want[0],want[1]))return right(t.one?`Richtig! Ein Rechteck hat ${t.q} Teile. Gefärbt sind ${t.p} davon: ${ft(t.p,t.q)}.`:`Richtig! Beide Rechtecke haben zusammen ${2*t.q} Teile: ${ft(t.p,2*t.q)}.`);
    if(equivalent(r.n,r.d,other[0],other[1]))return wrong('falschesGanzes','Lies genau: Was ist hier das Ganze? Danach richtet sich der Nenner.',{'r.d':false});
    return wrong('zaehlen','Zähle die gefärbten Teile und die Teile im Ganzen.',{'r.n':false,'r.d':false});
  },
  solution(t){
    if(t.kind==='zusammen')return [line(F03_PAIRS[t.i].ok?'Ja. ':'Nein. ',F03_PAIRS[t.i].why)];
    if(t.kind==='verteilen')return [fWholes(t.n*t.k,t.k,t.n,{mode:'grid'}),line(`Jede Pizza in ${t.k} Teile. Jedes Kind bekommt ${t.n} Teile: `,frac(t.n,t.k),'.')];
    return [fWholes(t.p,t.q,2),line(t.one?'Das Ganze hat '+t.q+' Teile: ':'Das Ganze hat '+2*t.q+' Teile: ',frac(t.p,t.one?t.q:2*t.q),'.')];
  },
  hints(t){
    if(t.kind==='zusammen')return [['Gehören beide Teile zum selben Ganzen?'],['Nur Teile vom selben Ganzen darf man zusammenzählen.'],[F03_PAIRS[t.i].ok?'Hier ist es dasselbe Ganze.':'Hier sind es zwei verschiedene Ganze.']];
    if(t.kind==='verteilen')return [['Teile jede Pizza in so viele Teile, wie es Kinder gibt.'],[`Jede Pizza hat dann ${t.k} Teile.`],[`Jedes Kind bekommt von jeder Pizza ein Teil, also ${t.n} Teile.`]];
    return [['Was ist das Ganze: ein Rechteck oder beide?'],[t.one?`Ein Rechteck hat ${t.q} Teile.`:`Beide zusammen haben ${2*t.q} Teile.`],[`Gefärbt sind ${t.p} Teile.`]];
  }
});

/* ---------- F04 Anteile von Größen ---------- */
const F04_KINDS={
  geld:{unit:'€',tot:[12,20,24,30,36,40,48,60],txt:(t)=>['Wie viel sind ',frac(t.p,t.q),' von '+t.tot+' €?']},
  zeit:{unit:'min',tot:[60],txt:(t)=>['Wie viele Minuten sind ',frac(t.p,t.q),' einer Stunde?']},
  gewicht:{unit:'g',tot:[1000],txt:(t)=>['Wie viel Gramm sind ',frac(t.p,t.q),' von 1 kg?']},
  menge:{unit:'Kinder',tot:[12,18,20,24,25,28,30],txt:(t)=>['Die Klasse hat '+t.tot+' Kinder. ',frac(t.p,t.q),' davon fahren mit dem Rad. Wie viele Kinder sind das?']}
};
TASKS.F04=fStation('F04',{name:'Anteile von Größen',desc:'Anteile von Geld, Zeit, Gewicht und Mengen bestimmen.',notes:['M23']},
  {1:['geld','zeit','menge','geld','gewicht'],2:['menge','gewicht','zeit','geld','menge']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'geld',K=F04_KINDS[kind];
    for(let i=0;i<300;i++){
      const tot=R.pick(K.tot),q=R.pick([2,3,4,5,6,8,10,12]);
      if(tot%q)continue;
      const p=level===1&&i<200?1:R.int(1,q-1);
      if(gcd(p,q)!==1)continue;
      if(level===1&&p>1&&R.chance(0.5))continue;
      return {type:'F04',level,kind,tot,p,q,ans:tot/q*p,avoid:[kind+p+'/'+q+tot]};
    }
    return {type:'F04',level,kind,tot:12,p:1,q:4,ans:3,avoid:['f']};
  },
  prompt(t,h){h.append(el('p',{class:'q qa'},...F04_KINDS[t.kind].txt(t)));},
  render(view,host){
    const t=view.task;
    host.append(el('div',{class:'fstage'},drawFractionStrip(t.p,t.q,{maxW:300,label:'Streifen in '+t.q+' Teile geteilt'})),el('div',{class:'addrow'},intInput(view,'x','Ergebnis'),' '+F04_KINDS[t.kind].unit));
  },
  validate(t,d){
    const x=getInt(d,'x');if(x===null)return invalid('Trage eine Zahl ein.');
    const one=t.tot/t.q;
    if(x===t.ans)return right(`Richtig! ${t.tot} : ${t.q} = ${one}. Dann ${one} · ${t.p} = ${t.ans}.`);
    if(t.p>1&&x===one)return wrong('nurGeteilt','Das ist erst '+ft(1,t.q)+'. Nimm das noch mit dem Zähler mal.',{x:false});
    return wrong('anteil','Teile zuerst durch den Nenner. Nimm dann mit dem Zähler mal.',{x:false});
  },
  solution(t){const one=t.tot/t.q;return [drawFractionStrip(t.p,t.q,{maxW:300}),line(`${ft(1,t.q)} von ${t.tot} ist ${t.tot} : ${t.q} = ${one}.`),line(`${ft(t.p,t.q)} ist ${one} · ${t.p} = ${t.ans} ${F04_KINDS[t.kind].unit}.`)];},
  hints(t){const one=t.tot/t.q;return [['Teile das Ganze in so viele Teile, wie der Nenner sagt.'],[`${t.tot} : ${t.q} = ${one}. Das ist ein Teil.`],[t.p>1?`Du brauchst ${t.p} solche Teile.`:'Du brauchst genau ein Teil.']];}
});

/* ---------- F05 Brüche größer 1 (übernimmt D03) ---------- */
TASKS.F05=fStation('F05',{name:'Brüche größer 1',desc:'Mehr als ein Ganzes: als Bruch und als gemischte Zahl schreiben.',notes:['M25']},
  {1:['ablesen','ganze','umwandeln','zurueck','ablesen'],2:['ablesen','umwandeln','zurueck','ganze','umwandeln']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'ablesen';
    const qs=level===1?[2,3,4,5,6]:[3,4,5,6,8,10];
    const q=R.pick(qs),w=R.int(1,level===1?2:3);
    let r;do{r=R.int(1,q-1);}while(gcd(r,q)!==1&&R.chance(0.7));
    const p=w*q+r;
    return {type:'F05',level,kind,p,q,w,r,avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    if(t.kind==='ablesen')h.append(el('p',{class:'q'},'Jedes Rechteck ist ein Ganzes. Welcher Bruch ist gefärbt?'));
    else if(t.kind==='ganze')h.append(el('p',{class:'q'},'Wie viele Ganze stecken in ',frac(t.p,t.q),'?'));
    else if(t.kind==='umwandeln')h.append(el('p',{class:'q'},'Schreibe ',frac(t.p,t.q),' als gemischte Zahl.'));
    else h.append(el('p',{class:'q'},'Schreibe ',mixed(t.w,t.r,t.q),' als Bruch.'));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='ablesen'){host.append(el('div',{class:'fstage'},fWholes(t.p,t.q,t.w+1)),el('div',{class:'addrow'},fracInput(view,'r')));return;}
    if(t.kind==='ganze'){host.append(el('div',{class:'addrow'},intInput(view,'x','Ganze'),' Ganze und noch ein Rest'));return;}
    if(t.kind==='umwandeln'){host.append(el('div',{class:'addrow'},frac(t.p,t.q),op('='),hnMixedInput(view)));return;}
    host.append(el('div',{class:'addrow'},mixed(t.w,t.r,t.q),op('='),fracInput(view,'r')));
  },
  validate(t,d){
    if(t.kind==='ganze'){
      const x=getInt(d,'x');if(x===null)return invalid('Trage eine Zahl ein.');
      if(x===t.w)return right(`Richtig! ${t.w} · ${t.q} = ${t.w*t.q}. Dann bleiben ${t.r} Teile übrig.`);
      return wrong('ganze',`Wie oft passt ${t.q} in ${t.p}?`,{x:false});
    }
    if(t.kind==='umwandeln'){
      const w=getInt(d,'g.w'),n=getInt(d,'g.n'),q=getInt(d,'g.d');
      if(w===null||n===null||q===null||q===0)return invalid('Trage die Ganzen, den Zähler und den Nenner ein.');
      if(w===t.w&&n*t.q===t.r*q&&n<q)return right(`Richtig! ${ft(t.p,t.q)} = ${t.w} Ganze und ${ft(t.r,t.q)}.`);
      if(w*q+n===t.p&&q===t.q)return wrong('ganzeFalsch','Prüfe die Ganzen: Der Bruchteil muss kleiner als 1 sein.',{'g.w':false});
      return wrong('gemischt',`Wie oft passt ${t.q} in ${t.p}? Das sind die Ganzen. Der Rest kommt in den Zähler.`,{'g.w':false,'g.n':false});
    }
    const r=getFrac(d,'r');if(!r)return invalid(MSG_FRAC_INVALID);
    if(r.n===t.p&&r.d===t.q)return right(t.kind==='ablesen'?`Richtig! ${t.w} Ganze sind ${t.w*t.q} Teile. Dazu kommen ${t.r}: ${ft(t.p,t.q)}.`:`Richtig! ${t.w} · ${t.q} + ${t.r} = ${t.p}. Der Nenner bleibt ${t.q}.`);
    if(equivalent(r.n,r.d,t.p,t.q))return soft('anders','Der Wert stimmt. Nimm aber den Nenner '+t.q+'.',{'r.d':false});
    if(t.kind==='ablesen'&&r.d===(t.w+1)*t.q)return wrong('alleTeile','Jedes Rechteck ist ein Ganzes. Der Nenner zählt die Teile von einem Rechteck.',{'r.d':false});
    if(t.kind==='zurueck'&&r.n===t.w*t.r)return wrong('mal','Die gemischte Zahl bedeutet plus: '+t.w+' Ganze und '+ft(t.r,t.q)+'.',{'r.n':false});
    return wrong('ueber1',`Ein Ganzes sind ${t.q} Teile. Zähle alle gefärbten Teile.`,{'r.n':false,'r.d':false});
  },
  solution(t){return [fWholes(t.p,t.q,t.w+1),eq(frac(t.p,t.q),'=',mixed(t.w,t.r,t.q)),line(`${t.w} Ganze sind ${t.w} · ${t.q} = ${t.w*t.q} Teile. Dazu kommen ${t.r} Teile.`)];},
  hints(t){
    if(t.kind==='zurueck')return [['Ein Ganzes hat '+t.q+' Teile.'],[`${t.w} Ganze sind ${t.w} · ${t.q} = ${t.w*t.q} Teile.`],[`Dazu kommen noch ${t.r} Teile.`]];
    return [['Ein Ganzes hat '+t.q+' Teile.'],[`Wie oft passt ${t.q} in ${t.p}?`],[`${t.w} · ${t.q} = ${t.w*t.q}. Es bleiben ${t.r} Teile.`]];
  }
});

/* ---------- F06 Was gehört zusammen? (Kreise erlaubt) ---------- */
const F06_STORY=[
  {txt:(a,b)=>`${NAMES.c} isst ${ft(a,b)} einer Pizza. ${NAMES.d} isst ${ft(a,b)} vom Kuchen. Zusammen haben sie ${ft(2*a,b)} einer Pizza gegessen.`,ok:false},
  {txt:(a,b)=>`${NAMES.c} isst ${ft(a,b)} vom Blech. ${NAMES.d} isst noch ${ft(a,b)} vom selben Blech. Zusammen sind es ${ft(2*a,b)} vom Blech.`,ok:true},
  {txt:(a,b)=>`${NAMES.a} hat ${ft(a,b)} seiner Tafel. ${NAMES.b} hat ${ft(a,b)} ihrer Tafel. Zusammen haben sie ${ft(2*a,b)} einer Tafel.`,ok:false},
  {txt:(a,b)=>`Von einer Strecke läuft ${NAMES.a} ${ft(a,b)}, danach noch ${ft(a,b)} derselben Strecke. Das sind ${ft(2*a,b)} der Strecke.`,ok:true}
];
TASKS.F06=fStation('F06',{name:'Was gehört zusammen?',desc:'Bild, Bruch, Satz und Geschichte verbinden – und das Ganze prüfen.',notes:['M23','M24']},
  {1:['zuordnen','passt','zuordnen','passt','zuordnen'],2:['zuordnen','passt','zuordnen','zuordnen','passt']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'zuordnen';
    if(kind==='passt'){const i=R.int(0,F06_STORY.length-1);let a,b;do{[a,b]=fRedPair(R,[4,5,6,8]);}while(2*a>=b);return {type:'F06',level,kind,i,a,b,answer:F06_STORY[i].ok?'ja':'nein',avoid:['p'+i+a+b]};}
    const [p,q]=fRedPair(R,level===1?[3,4,5,6]:[4,5,6,8]);
    const modes=level===1?['grid','strip','circle']:['circle','grid','strip'];
    /* eine richtige Karte, drei Fallen: weiße Teile, ein Teil mehr im Ganzen, Zähler und Nenner vertauscht (als Satz) */
    const cards=[{n:p,d:q,ok:true},{n:q-p,d:q},{n:p,d:q+1},{n:p,d:q,sent:true,rev:true}].map((c,i)=>Object.assign(c,{mode:modes[i%modes.length]}));
    return {type:'F06',level,kind,p,q,cards:R.shuffle(cards),avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    if(t.kind==='passt')h.append(el('p',{class:'q qa'},'Stimmt das? „'+F06_STORY[t.i].txt(t.a,t.b)+'“'));
    else h.append(el('p',{class:'q'},'Welche Karte zeigt ',frac(t.p,t.q),'?'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='passt'){hnYesNo(view,host,'j');return;}
    const cards=el('div',{class:'cards',role:'group','aria-label':'Karten'});
    t.cards.forEach((c,i)=>{
      const b=el('button',{type:'button',class:'pick','aria-pressed':String(d.c===i),'aria-label':'Karte '+(i+1)},
        c.sent?el('span',{class:'fsent'},'„'+(c.rev?c.d+' von '+c.n:c.n+' von '+c.d)+' gleich großen Teilen“'):drawMode(c.mode,c.n,c.d,{maxW:110,tall:true,label:'Bruchbild'}));
      b.disabled=view.locked();
      b.addEventListener('click',()=>{if(view.locked())return;d.c=i;view.save();cards.querySelectorAll('.pick').forEach((x,j)=>x.setAttribute('aria-pressed',String(j===i)));});
      view.inputs['c'+i]=b;cards.append(b);
    });
    host.append(cards);
  },
  validate(t,d){
    if(t.kind==='passt'){
      if(!d.j)return invalid('Tippe Ja oder Nein an.');
      if(d.j===t.answer)return right(t.answer==='ja'?'Richtig! Beide Teile gehören zum selben Ganzen.':'Richtig! Das sind zwei verschiedene Ganze. Man darf sie nicht zusammenzählen.');
      return wrong('ganzes','Prüfe: Gehören beide Teile zum selben Ganzen?',{});
    }
    if(d.c==null)return invalid('Tippe eine Karte an.');
    const c=t.cards[d.c];
    if(c.ok)return right(`Richtig! ${t.p} von ${t.q} gleich großen Teilen.`);
    if(c.sent)return wrong('satz','Lies genau: Wie viele Teile gibt es, wie viele sind gemeint?',{['c'+d.c]:false});
    if(c.d!==t.q)return wrong('teile','Zähle alle Teile. Das ist der Nenner.',{['c'+d.c]:false});
    return wrong('gefaerbt','Zähle die gefärbten Teile. Das ist der Zähler.',{['c'+d.c]:false});
  },
  solution(t){
    if(t.kind==='passt')return [line(t.answer==='ja'?'Ja: dasselbe Ganze.':'Nein: zwei verschiedene Ganze.')];
    return [fFig(t.p,t.q),line(`${t.p} von ${t.q} gleich großen Teilen sind gefärbt.`)];
  },
  hints(t){
    if(t.kind==='passt')return [['Was ist bei jedem Teil das Ganze?'],['Zusammenzählen darf man nur Teile vom selben Ganzen.'],[F06_STORY[t.i].ok?'Hier ist es dasselbe Ganze.':'Hier sind es verschiedene Ganze.']];
    return [['Zähle bei jeder Karte alle Teile.'],[`Gesucht sind ${t.q} Teile im Ganzen.`],[`Davon müssen ${t.p} gefärbt sein.`]];
  }
});

/* ---------- F07 Das Ganze finden (Plus) ---------- */
TASKS.F07=fStation('F07',{name:'Das Ganze finden',desc:'Aus einem Anteil das Ganze zurückbauen, auch über 1.',notes:['M24','M25']},
  {1:['teile','fehlt','teile','fehlt','teile'],2:['teile','fehlt','teile','teile','fehlt']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'teile';
    const q=R.pick(level===1?[2,3,4,5]:[3,4,5,6,8]);let p;
    do{p=R.int(1,2*q-1);}while(p===q||gcd(p,q)!==1&&R.chance(0.6));
    return {type:'F07',level,kind,p,q,avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    h.append(el('p',{class:'q qa'},'Das sind ',frac(t.p,t.q),' eines Streifens. ',t.kind==='teile'?'Wie viele dieser Teile bilden ein Ganzes?':(t.p<t.q?'Wie viele Teile fehlen bis zu einem Ganzen?':'Wie viele Teile sind mehr als ein Ganzes?')));
  },
  render(view,host){const t=view.task;host.append(el('div',{class:'fstage'},fStripLen(t.p,t.p,Math.min(18,1.8*t.p),t.p+' Teile')),el('div',{class:'addrow'},intInput(view,'x','Zahl der Teile'),' Teile'));},
  validate(t,d){
    const x=getInt(d,'x');if(x===null)return invalid('Trage eine Zahl ein.');
    const want=t.kind==='teile'?t.q:Math.abs(t.q-t.p);
    if(x===want)return right(t.kind==='teile'?`Richtig! Der Nenner ist ${t.q}. Ein Ganzes hat ${t.q} Teile.`:`Richtig! Ein Ganzes hat ${t.q} Teile, hier sind es ${t.p}.`);
    if(x===t.p)return wrong('stueck','Das ist die Zahl der Teile im Bild. Der Nenner sagt, wie viele ein Ganzes hat.',{x:false});
    return wrong('ganzes','Der Nenner sagt, wie viele Teile ein Ganzes hat.',{x:false});
  },
  solution(t){return [fStripLen(t.q,t.q,1.8*t.q,'ein Ganzes'),line(`Ein Ganzes hat ${t.q} Teile. Im Bild sind ${t.p} Teile.`)];},
  hints(t){return [['Der Nenner sagt, wie viele Teile ein Ganzes hat.'],[`Hier ist der Nenner ${t.q}.`],[t.kind==='teile'?`Ein Ganzes hat ${t.q} Teile.`:`Vergleiche ${t.p} mit ${t.q}.`]];}
});

/* ---------- F08 Bruchrätsel (Plus): verschachtelte Teile ---------- */
function fNested(a,b,c,extra){
  const W=360,H=120,svg=S_('svg',{viewBox:'0 0 362 122',class:'fracsvg',role:'img','aria-label':'Rechteck in '+a+' Spalten, eine Spalte in '+b+' Teile geteilt'});svg.style.maxWidth='16rem';
  const cw=W/a;
  for(let i=0;i<a;i++){
    if(i===0){const rh=H/b;for(let j=0;j<b;j++)svg.append(S_('g',{class:'cell'+(j<c?' on':'')},S_('rect',{x:1,y:1+j*rh,width:cw,height:rh})));}
    else svg.append(S_('g',{class:'cell'+(extra&&i===1?' on':'')},S_('rect',{x:1+i*cw,y:1,width:cw,height:H})));
  }
  return svg;
}
TASKS.F08=fStation('F08',{name:'Bruchrätsel',desc:'Verschachtelte Teile: Welcher Anteil ist gefärbt?',notes:['M23']},
  {1:['klein','klein','gross','klein','gross'],2:['gross','klein','gross','gross','klein']},{
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'klein';
    const a=R.pick([2,3,4]),b=R.pick([2,3,4]),c=R.int(1,b-1)||1,extra=kind==='gross'&&a>2;
    const res=extra?[c+b,a*b]:[c,a*b];
    return {type:'F08',level,kind,a,b,c,extra,res,avoid:['n'+a+b+c+extra]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Das ganze Rechteck ist ein Ganzes. Welcher Anteil ist gefärbt?'));},
  render(view,host){const t=view.task;host.append(el('div',{class:'fstage'},fNested(t.a,t.b,t.c,t.extra)),el('div',{class:'addrow'},fracInput(view,'r')));},
  validate(t,d){
    const r=getFrac(d,'r');if(!r)return invalid(MSG_FRAC_INVALID);
    if(equivalent(r.n,r.d,t.res[0],t.res[1]))return right(`Richtig! Ein kleines Teil ist ${ft(1,t.a*t.b)} vom Ganzen. ${t.extra?'Eine große Spalte sind '+t.b+' kleine Teile.':''}`.trim());
    if(r.d===t.a+t.b-1||r.d===t.a-1+t.b)return wrong('ungleich','Die Teile sind nicht gleich groß. Teile in Gedanken alles in kleine Teile.',{'r.d':false});
    return wrong('klein',`Wie viele kleine Teile passen in das ganze Rechteck? ${t.a} Spalten zu je ${t.b}.`,{'r.n':false,'r.d':false});
  },
  solution(t){return [fNested(t.a,t.b,t.c,t.extra),line(`Das Ganze hat ${t.a} · ${t.b} = ${t.a*t.b} kleine Teile.`),line('Gefärbt: ',frac(t.res[0],t.res[1]),'.')];},
  hints(t){return [['Sind alle Teile gleich groß?'],[`Teile jede Spalte in Gedanken in ${t.b} kleine Teile.`],[`Das Ganze hat dann ${t.a*t.b} kleine Teile.`]];}
});
['F01','F02','F03','F04','F05','F06','F07','F08'].forEach(id=>{TIPS[id]=(t)=>TASKS[id].hints(t);});

/* ---------- Merkzettel M23–M25 ---------- */
NOTES.M23={title:'Bruch als Anteil',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),frac(3,4),' – 3 von 4 gleich großen Teilen'),
    fFig(3,4,{maxW:200}),
    el('p',null,'Der Nenner sagt, in wie viele gleich große Teile das Ganze geteilt ist.'),
    el('p',null,'Der Zähler sagt, wie viele Teile gemeint sind.'),
    el('p',{class:'rule'},strong('Achtung: '),'Die Teile müssen gleich groß sein.')
  ];}};
NOTES.M24={title:'Das Ganze',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),frac(1,2),' von einem großen Blech ist mehr als ',frac(1,2),' von einem kleinen.'),
    el('p',null,'Ein Bruch sagt nur etwas über einen Teil vom Ganzen.'),
    el('p',null,'Verteilen: 3 Pizzen an 4 Kinder gibt jedem ',frac(3,4),' Pizza.'),
    el('p',{class:'rule'},strong('Achtung: '),'Zusammenzählen darfst du nur Teile vom selben Ganzen.')
  ];}};
NOTES.M25={title:'Brüche größer 1',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(frac(7,4),'=',mixed(1,3,4))),
    fWholes(7,4,2),
    el('p',null,'Ist der Zähler größer als der Nenner, ist es mehr als ein Ganzes.'),
    el('p',null,'Eine gemischte Zahl schreibt die Ganzen und den Rest getrennt.'),
    el('p',{class:'rule'},strong('Achtung: '),mixed(1,3,4),' heißt 1 Ganzes und ',frac(3,4),', nicht mal.')
  ];}};

/* ---------- Eingangstest FQ und Abschlusscheck FA ---------- */
const FQ_SKILLS=['anteil','ganzes','mehrere','groessen','ueber1'];
const FQ_NAMES={anteil:'Anteil erkennen',ganzes:'Das Ganze',mehrere:'Mehrere Ganze',groessen:'Anteile von Größen',ueber1:'Brüche größer 1'};
QCHK.FQ={skills:FQ_SKILLS,names:FQ_NAMES,stations:{anteil:['F01'],ganzes:['F02'],mehrere:['F03'],groessen:['F04'],ueber1:['F05']},allSure:['F06'],
  startText:'Im Lernpfad lernst du alles Schritt für Schritt. Das Anteile-Labor hilft dir beim Start.'};
const fqOpts=(R,right,cands)=>{
  const seen=[right],out=[right];
  for(const c of R.shuffle(cands)){if(out.length>=4)break;if(c[0]>=1&&c[1]>=1&&!seen.some(x=>equivalent(x[0],x[1],c[0],c[1]))){seen.push(c);out.push(c);}}
  const opts=R.shuffle(out).map((f,i)=>({id:Q_LETTERS[i],f,txt:f[0]+'/'+f[1]}));
  return {opts,answer:opts.find(o=>o.f===right).id};
};
const fqNum=(R,right,cands)=>{const seen=new Set([right]),out=[right];R.shuffle(cands).forEach(c=>{if(out.length<4&&c>0&&!seen.has(c)){seen.add(c);out.push(c);}});const nums=R.shuffle(out);const opts=nums.map((n,i)=>({id:Q_LETTERS[i],txt:String(n)}));return {opts,answer:opts[nums.indexOf(right)].id};};
function fqGen(level,R,ctx){
  const skill=(ctx&&ctx.skill)||R.pick(FQ_SKILLS);
  const base={type:'FQ',level,skill};
  if(skill==='anteil'){
    const [p,q]=fRedPair(R,level===1?[3,4,5,6]:[5,6,8,9,10]);
    return Object.assign(base,{kind:'anteil',p,q,why:`${p} von ${q} gleich großen Teilen sind gefärbt.`,avoid:[redKey(p,q)]},fqOpts(R,[p,q],[[q-p,q],[q,p],[p,q-p],[p,q+1]]));
  }
  if(skill==='ganzes'){
    const q=R.pick([2,3,4]),same=R.chance(0.5);
    return Object.assign(base,{kind:'ganzes',q,same,answer:same?'ja':'nein',why:same?'Die Ganzen sind gleich groß.':'Die Ganzen sind verschieden groß. Dann ist auch der Anteil verschieden viel.',avoid:['gz'+q+same]});
  }
  if(skill==='mehrere'){
    let n,k;do{n=R.int(2,level===1?4:6);k=R.int(3,level===1?6:8);}while(n>=k||gcd(n,k)!==1);
    return Object.assign(base,{kind:'mehrere',n,k,why:`Jede Pizza wird in ${k} Teile geteilt. Jedes Kind bekommt ${n} Teile.`,avoid:['m'+n+k]},fqOpts(R,[n,k],[[k,n],[1,k],[1,n],[n,n+k]]));
  }
  if(skill==='groessen'){
    const q=R.pick([2,3,4,5,6]),one=R.pick([2,3,4,5,6]),tot=q*one,p=level===1?1:R.int(1,q-1)||1;
    return Object.assign(base,{kind:'groessen',p,q,tot,why:`${tot} : ${q} = ${one}, mal ${p} gibt ${one*p} €.`,avoid:['g'+p+q+tot]},fqNum(R,one*p,[one,tot-one*p,tot/q+p,one*p+q,tot]));
  }
  const q=R.pick([2,3,4,5]),w=R.int(1,2),r=R.int(1,q-1),p=w*q+r;
  return Object.assign(base,{kind:'ueber1',p,q,w,r,why:`${w} Ganze sind ${w*q} Teile. Dazu kommen ${r}.`,avoid:[redKey(p,q)]},fqOpts(R,[p,q],[[p,(w+1)*q],[r,q],[w*q,q],[q,p]]));
}
TASKS.FQ={area:'Verstehen',name:'Eingangstest',desc:FQ_SKILLS.length*Q_PER_SKILL+' Fragen zum Antippen – ohne Zeitdruck.',size:FQ_SKILLS.length*Q_PER_SKILL,quick:true,notes:['M23','M24','M25'],
  ctx(round){if(!round.plan)round.plan=qPlan(null,FQ_SKILLS,Q_PER_SKILL);return {skill:round.plan[round.results.length%round.plan.length]};},
  gen:fqGen,
  prompt(t,h){
    const q={anteil:'Welcher Bruch ist gefärbt?',ganzes:['Ist ',frac(1,t.q),' vom oberen und vom unteren Streifen gleich viel?'],mehrere:[t.n+' Pizzen werden an '+t.k+' Kinder verteilt. Wie viel bekommt jedes Kind?'],
      groessen:['Wie viel sind ',frac(t.p,t.q),' von '+t.tot+' €?'],ueber1:'Jedes Rechteck ist ein Ganzes. Welcher Bruch ist gefärbt?'}[t.kind];
    h.append(el('p',{class:'q'},...[].concat(q)));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='anteil')host.append(el('div',{class:'fstage'},fFig(t.p,t.q,{maxW:180})));
    if(t.kind==='ganzes')host.append(el('div',{class:'fstage fcol'},fStripLen(1,t.q,8,'oberer Streifen'),fStripLen(1,t.q,t.same?8:13,'unterer Streifen')));
    if(t.kind==='ueber1')host.append(el('div',{class:'fstage'},fWholes(t.p,t.q,t.w+1)));
    qOptions(view,host,t);
  },
  validate(t,d){
    if(!d.ans)return invalid('Tippe eine Antwort an.');
    if(d.ans===Q_UNSURE)return unsure('Das ist in Ordnung. '+qAnswerText(t)+' '+t.why);
    if(d.ans===t.answer)return right('Richtig! '+t.why);
    return wrong('quick',qAnswerText(t)+' '+t.why);
  },
  solution(t){return [line(qAnswerText(t)),line(t.why)];},
  hints(t){return [['Lies die Frage genau.'],['Zähle alle Teile und die gefärbten Teile.']];}
};
const FA_TAP=10,FA_CALC=[['F01','ablesen'],['F03','verteilen'],['F04','geld'],['F05','umwandeln'],['F05','ablesen']];
TASKS.FA=proxyOf({area:'Verstehen',name:'Abschlusscheck',desc:FA_TAP+' Aufgaben zum Antippen und '+FA_CALC.length+' zum Lösen – am Ende des Lernpfads.',notes:['M23','M24','M25'],size:FA_TAP+FA_CALC.length,
  finalTap:FA_TAP,finalLabel:'Zum Lösen richtig',
  ctx(round){
    if(!round.plan)round.plan=qPlan(null,FQ_SKILLS,2);
    const i=round.results.length;
    return i<FA_TAP?{skill:round.plan[i],slot:i}:{slot:i};
  },
  gen(level,R,ctx){
    const i=ctx&&ctx.slot!=null?ctx.slot:0;
    if(i<FA_TAP)return TASKS.FQ.gen(level,R,{skill:(ctx&&ctx.skill)||R.pick(FQ_SKILLS)});
    const [id,kind]=FA_CALC[i-FA_TAP];
    return TASKS[id].gen(level,R,{kind,step:2});
  }
});
