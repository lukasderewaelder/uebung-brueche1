'use strict';
/* =====================================================================
   Aufgaben des Themas „Brüche addieren und subtrahieren“ (Kürzel R), Teil 1: gleiche Nenner
   R01 Bild und Rechnung                     Bild → Brüche ablesen → Rechenweg (bild, wie LB S. 33 Nr. 5), Geschichte mit Bild, plus und minus am Bild; „Ein Bild, drei Aufgaben“ (offen: mehrere Lösungen, per Regel geprüft)
   R02 Gleichnamig rechnen                   plus und minus mit und ohne Geschichte (Kuchen, Pizza), auch über 1 (unechter Bruch), Lücken füllen
   R03 Fehler und eigene Aufgaben            „Hausaufgaben kontrollieren“ (falsche Rechnung, Fehlerart, berichtigen) und „Finde Brüche mit …“ (offen)
   Aufbau und Wörter wie an der Tafel: Fachwort „gleichnamig“, Rechenweg Aufgabe = (Zähler ± Zähler)/Nenner = Ergebnis = gekürzt, Bilder als Raster, bei minus durchgekreuzt.
   Reihenfolge des Themas: gleichnamig, danach unterschiedlich benannt, danach gemischte Zahlen (kommen später). Plus und Minus laufen in jeder Station gemischt.
   Gleicher Vertrag wie in tasks.js: gen, prompt, render, validate, solution (Tipps: js/tips.js). Aufgabenfelder: a, c = Zähler, b = Nenner (derselbe für beide), plus = Rechenart, res = [Zähler, Nenner] des Ergebnisses.
   Rechenweg-Block: Zwischenschritt (nur Leicht), Felder „Ergebnis“ und „gekürzt“ immer (addResult, js/rechnen-widgets.js). Zahlenraum: Leicht Nenner bis 24, Knifflig bis 100.
   Bilder: Leicht sofort (bis Nenner 24), Knifflig und Rechnungen erst mit dem zweiten Tipp. Fehlercodes: nennerAddiert, zwischenNenner, vertauscht, zahl (Zwischenschritt), andereRechnung, zaehlerNenner, rechenfehler, wert (addDiagnose in math.js),
   dazu nennerFelder, zaehlerFelder (Ablesen), luecke, sel, err (Fehler finden), zeile (offene Zeilen).
   ===================================================================== */
const ADD_NAMES=['Lena','Ben','Mia','Tom','Ida','Paul','Nora','Jan'];
const ADD_POOL={1:[4,5,6,7,8,9,10,11,12,15,16,20,24],2:[10,12,15,16,18,20,24,25,30,36,40,50,60,75,80,100]};
const ADD_POOL_PIC=[4,5,6,8,9,10,12,15,16]; /* Bilder zum Abzählen: höchstens 16 Felder (Tafel: 12, 5, 10, 9, 15) */
const ADD_SIGN=(plus)=>plus?'+':'−';

/* ---------- Zahlen ----------
   a/b ± c/b. o.over: Ergebnis über 1 (plus) oder unechter Minuend (minus) · o.red: Ergebnis kürzbar (true) oder nicht kürzbar (false), sonst egal · o.pool: Nenner.
   Das Ergebnis ist nie 0 und nie genau ein Ganzes. Rückgabe {a,c,b,plus,res} */
function addNums(R,level,plus,o){
  o=o||{};
  const pool=o.pool||ADD_POOL[level];
  for(let i=0;i<600;i++){
    const b=R.pick(pool);
    if(b<4)continue;
    let a,c;
    if(plus){
      if(o.over){c=R.int(2,b-1);a=R.int(b-c+1,b-1);}
      else{a=R.int(1,b-2);c=R.int(1,b-1-a);}
    }else if(o.over){a=R.int(b+1,2*b-1);c=R.int(1,b-1);}
    else{a=R.int(2,b-1);c=R.int(1,a-1);}
    const n=plus?a+c:a-c;
    if(n<1||n%b===0||a<1||c<1)continue;
    if(plus&&o.over!==true&&a+c>=b)continue;
    if(o.red!=null&&(!isFullyReduced(n,b))!==o.red)continue;
    return {a,c,b,plus,res:[n,b]};
  }
  return plus?{a:3,c:2,b:8,plus,res:[5,8]}:{a:7,c:2,b:8,plus,res:[5,8]};
}
const addAvoid=(t)=>[redKey(t.a,t.b),redKey(t.c,t.b)];
const addEq=(t,end)=>eq(frac(t.a,t.b),ADD_SIGN(t.plus),frac(t.c,t.b),...(end===undefined?[]:['=',end]));
const addPicKinds=(id,lvl)=>Array.from(new Set(ADD_PLAN[id][lvl]));
/* Zwischenschritt nur in Leicht (Gerüst); t.level, Zahlen der Aufgabe (bei „Fehler finden“ die der falschen Rechnung ct) */
const addMidOpt=(t)=>t.level===1?{mid:ADD_SIGN(t.plus)}:{};
const addMidArg=(t,ct)=>{ct=ct||t;return t.level===1?{a:ct.a,c:ct.c,b:ct.b,plus:ct.plus}:null;};

/* ---------- Rundenplan ---------- */
const ADD_PLAN={
  R01:{1:['bild','plus','minus','geschichte','drei'],2:['plus','minus','drei','geschichte','minus']},
  R02:{1:['geschichte','minus','luecke','plus','minus'],2:['plus','geschichte','ueber1','luecke','minus']},
  R03:{1:['fehler','finde','fehler','fehler','finde'],2:['fehler','finde','fehler','fehler','finde']}
};
function addCtx(id){
  return (round,level)=>{
    if(!Array.isArray(round.add)||round.add.length!==TASKS[id].size)round.add=RNG.shuffle(ADD_PLAN[id][level]);
    return {kind:round.add[Math.min(round.results.length,round.add.length-1)]};
  };
}

/* ---------- Rückmeldungen ---------- */
const ADD_MSG={
  nennerAddiert:(t)=>'Der Nenner bleibt gleich. Er sagt nur, wie groß die Stücke sind. Rechne nur mit den Zählern.'+(t.plus?' Zusammengefügt ist es mehr als jeder Teil.':''),
  andereRechnung:(t)=>t.plus?'Hier wird zusammengefügt, also plus. Du hast weggenommen.':'Hier wird weggenommen, also minus. Du hast zusammengefügt.',
  zaehlerNenner:()=>'Zähler und Nenner wurden einzeln gerechnet. Der Nenner bleibt gleich. Nur die Zähler werden gerechnet.',
  rechenfehler:()=>'Der Nenner stimmt. Rechne die Zähler noch einmal.',
  wert:()=>'Das Ergebnis stimmt noch nicht. Zähle die Stücke noch einmal.'
};
/* Meldung für ein falsches Ergebnis x/y der Aufgabe t (a/b ± c/b) */
function addDiag(t,x,y){
  const code=addDiagnose(t.a,t.c,t.b,t.plus,x,y);
  return code?{code,msg:ADD_MSG[code](t)}:null;
}
/* Satz aus Wörtern und Brüchen: Teile sind Text oder Knoten */
const addP=(...parts)=>el('p',{class:'q qa'},...parts);

/* ---------- Geschichten (immer dasselbe Ganze: derselbe Kuchen, dieselbe Kanne) ----------
   plus: zusammenfügen, minus: wegnehmen. big: erlaubt Werte über 1 (Liter, Meter), sonst nur Teile eines Ganzen */
const ADD_STORIES={
  saft:{plus:true,big:true,txt:(t,w)=>[w[0]+' trinkt ',frac(t.a,t.b),' Liter Saft und danach noch ',frac(t.c,t.b),' Liter. Wie viel Liter sind das zusammen?']},
  weg:{plus:true,big:true,txt:(t,w)=>[w[0]+' läuft ',frac(t.a,t.b),' km zur Schule und dann ',frac(t.c,t.b),' km zum Sportplatz. Wie viele Kilometer sind das?']},
  pizza:{plus:true,big:false,txt:(t,w)=>[w[0]+' isst ',frac(t.a,t.b),' einer Pizza, '+w[1]+' isst ',frac(t.c,t.b),' derselben Pizza. Wie viel der Pizza ist das zusammen?']},
  beet:{plus:true,big:false,txt:(t)=>['Ein Beet: ',frac(t.a,t.b),' sind mit Salat bepflanzt, ',frac(t.c,t.b),' mit Tomaten. Wie viel vom Beet ist bepflanzt?']},
  kanne:{plus:false,big:true,txt:(t,w)=>['In einer Kanne sind ',frac(t.a,t.b),' Liter Wasser. '+w[0]+' gießt ',frac(t.c,t.b),' Liter aus. Wie viel Liter bleiben in der Kanne?']},
  band:{plus:false,big:true,txt:(t,w)=>['Ein Band ist ',frac(t.a,t.b),' Meter lang. '+w[0]+' schneidet ',frac(t.c,t.b),' Meter ab. Wie viel Meter bleiben übrig?']},
  torte:{plus:false,big:false,txt:(t,w)=>['Von einer Torte sind noch ',frac(t.a,t.b),' übrig. '+w[0]+' isst ',frac(t.c,t.b),' der ganzen Torte. Wie viel der Torte bleibt übrig?']},
  schoko:{plus:false,big:false,txt:(t,w)=>['Von einer Tafel Schokolade sind ',frac(t.a,t.b),' übrig. '+w[0]+' isst ',frac(t.c,t.b),' der ganzen Tafel. Wie viel der Tafel bleibt übrig?']},
  /* wie an der Tafel: zwei gleich große Kuchen, Reste zusammen; Pizza: Anfang und Ende sind gegeben, gesucht ist das Gegessene (Unterschied, ohne Bild: durchgekreuzt wäre sonst das Übrige) */
  kuchen:{plus:true,big:false,caps:['Schokokuchen','Apfelkuchen','zusammen'],txt:(t)=>['Vom Schokokuchen sind ',frac(t.a,t.b),' übrig, vom Apfelkuchen ',frac(t.c,t.b),'. Beide Kuchen sind gleich groß. Wie viel Kuchen ist das zusammen?']},
  pizzaEnde:{plus:false,big:false,pic:false,txt:(t)=>['Von der Salamipizza sind zu Beginn noch ',frac(t.a,t.b),' da. Am Ende sind noch ',frac(t.c,t.b),' übrig. Wie viel der Pizza wurde gegessen?']}
};
/* Aufgabe mit Geschichte (kind „geschichte“): Kuchen und Pizza von der Tafel besonders oft; die Rechenart folgt der Geschichte */
function addStoryTask(R,level,type,kind){
  const id=R.chance(0.5)?R.pick(['kuchen','pizzaEnde']):R.pick(Object.keys(ADD_STORIES)),S=ADD_STORIES[id];
  const r=addNums(R,level,S.plus,{over:S.big&&level===2&&R.chance(S.plus?0.35:0.25),red:R.chance(0.5)});
  return Object.assign({type,level,kind,story:id,who:addWho(R)},r,{avoid:addAvoid(r)});
}
/* Geschichte zu einer Aufgabe wählen (oder null): die Geschichte muss zur Rechenart und zur Größe passen */
function addPickStory(R,t,p){
  if(!R.chance(p))return null;
  const over=t.plus?t.a+t.c>t.b:t.a>t.b;
  const ids=Object.keys(ADD_STORIES).filter(id=>ADD_STORIES[id].plus===t.plus&&(!over||ADD_STORIES[id].big));
  return ids.length?R.pick(ids):null;
}
const addWho=(R)=>{const w=R.shuffle(ADD_NAMES);return [w[0],w[1]];};

/* ---------- Bild-Knoten zu einer Aufgabe: plus zwei Anteile, minus das Ganze gefärbt und das Weggenommene durchgekreuzt (t.scatter, t.seed: verstreute Felder) ---------- */
function addTaskFigure(t){
  /* Wie an der Tafel: die Anteile erst getrennt, dann gesammelt (außer „Bild lesen“: dort ist das gesammelte Bild die Aufgabe) */
  const n=t.res[0],o={scatter:t.scatter,seed:t.seed,split:t.kind!=='bild',caps:t.story?ADD_STORIES[t.story].caps:null};
  return t.plus?addFigure(t.b,t.a,t.c,Object.assign({mode:'plus'},o)):addFigure(t.b,n,t.c,Object.assign({mode:'minus'},o));
}
/* Bild zu dieser Aufgabe zeigen? (Geschichte „Pizza am Ende“ nicht: dort wäre das Durchgekreuzte nicht das Gegessene) */
const addHasPic=(t)=>!t.story||ADD_STORIES[t.story].pic!==false;
/* Rechenweg als Lösung: Nenner bleibt, Zähler gerechnet, dann gekürzt (immer vollständig angezeigt, nach dem Lösen) */
function addSolLines(t){
  const [n,b]=t.res,sg=ADD_SIGN(t.plus),g=gcd(n,b);
  const out=[...(t.story==='pizzaEnde'?[line('Gegessen wurde der Unterschied zwischen Anfang und Ende. Darum rechnest du minus.')]:[]),
    line(strong('Gleichnamige Brüche:'),' Der Nenner bleibt ',strong(b),'. Nur die Zähler werden gerechnet.'),
    eq(frac(t.a,b),sg,frac(t.c,b),'=',frac(t.a+' '+sg+' '+t.c,b),'=',frac(n,b))];
  if(g>1)out.push(line('Kürzen: '),eq(frac(n,b),'=',frac(n+' : '+g,b+' : '+g),'=',frac(n/g,b/g)));
  else out.push(line('Das Ergebnis lässt sich nicht kürzen.'));
  return out;
}

/* ---------- R01 Bild und Rechnung ---------- */
/* Ein Bild mit zwei Anteilen p1, p2 (Nenner b): Leicht Summe unter einem Ganzen, Knifflig auch darüber */
function addDrei(R,level){
  for(let i=0;i<300;i++){
    const b=R.pick(level===1?ADD_POOL_PIC:[12,15,16,20,24,40,50,60,100]);
    const over=level===2&&R.chance(0.3);
    const p1=R.int(1,b-1),p2=over?R.int(b-p1+1,b-1):R.int(1,Math.max(1,b-1-p1));
    if(p1===p2||p2<1||p2>b-1)continue;
    if(over?p1+p2<=b:p1+p2>=b)continue; /* Leicht: Summe unter einem Ganzen; Knifflig manchmal darüber, nie genau ein Ganzes */
    if(level===1&&p1+p2<4)continue;
    return {b,p1,p2};
  }
  return {b:8,p1:3,p2:2};
}
const R01_NEED={1:2,2:3};
/* Zeile i der offenen Aufgabe: [▢]/b ± [▢]/b = [▢]/b, das Rechenzeichen wird angetippt */
function r01Row(view,t,i){
  return el('div',{class:'addrow'},el('span',{class:'tag'},(i+1)+'.'),addNumOver(view,'q'+i+'x',t.b,'erster Zähler'),addOpToggle(view,'q'+i+'o'),
    addNumOver(view,'q'+i+'y',t.b,'zweiter Zähler'),op('='),addNumOver(view,'q'+i+'z',t.b,'Zähler des Ergebnisses'));
}
/* Eine Zeile prüfen: {key} für eine gültige Aufgabe zum Bild (p plus, mB Teil 2 wegnehmen, mA Teil 1 wegnehmen), sonst {bad, msg, marks} oder {empty} */
function r01Judge(t,d,i){
  const get=(k)=>getInt(d,'q'+i+k),x=get('x'),y=get('y'),z=get('z'),o=d['q'+i+'o'];
  const none=[x,y,z].every(v=>v===null)&&!o&&['x','y','z'].every(k=>d['q'+i+k]==null||d['q'+i+k]==='');
  if(none)return {empty:true};
  const mk=(m)=>{const r={};m.split('').forEach(c=>{r[c==='o'?'q'+i+'o':'q'+i+c]=false;});return r;};
  if(x===null||y===null||z===null||!o)return {bad:true,msg:`Zeile ${i+1}: Fülle alle Felder aus und wähle plus oder minus.`,marks:mk('xyzo')};
  const T=t.p1+t.p2;
  if(o==='+'){
    if(x+y!==z)return {bad:true,msg:`Zeile ${i+1}: Diese Rechnung stimmt nicht.`,marks:mk('xyz')};
    if(z===T&&((x===t.p1&&y===t.p2)||(x===t.p2&&y===t.p1)))return {key:'p'};
    return {bad:true,msg:`Zeile ${i+1}: Diese Rechnung stimmt, passt aber nicht zum Bild.`,marks:mk('xyz')};
  }
  if(x-y!==z||x<=y)return {bad:true,msg:`Zeile ${i+1}: Diese Rechnung stimmt nicht.`,marks:mk('xyz')};
  if(x===T&&y===t.p2&&z===t.p1)return {key:'mB'};
  if(x===T&&y===t.p1&&z===t.p2)return {key:'mA'};
  return {bad:true,msg:`Zeile ${i+1}: Diese Rechnung stimmt, passt aber nicht zum Bild.`,marks:mk('xyz')};
}
/* Stufe 1 von „bild“: die Brüche am Bild ablesen. plus: Muster 1 und Muster 2 (Reihenfolge egal), minus: erst alles Gefärbte, dann das Durchgekreuzte */
function addReadCheck(t,d){
  const u=getFrac(d,'u'),v=getFrac(d,'v'),op=d.op,fix=d.s1===true?' Tippe oben auf „ändern“.':'';
  if(!u||!v||(op!=='+'&&op!=='−'))return invalid('Trage beide Brüche ein und wähle plus oder minus.');
  if((op==='+')!==t.plus)return wrong('andereRechnung',(t.plus?'Hier werden zwei Anteile zusammengefügt. Das ist plus.':'Hier werden Felder durchgekreuzt, also weggenommen. Das ist minus.')+fix,{op:false});
  if(u.d!==t.b||v.d!==t.b){
    const m={};
    if(u.d!==t.b)m['u.d']=false;
    if(v.d!==t.b)m['v.d']=false;
    return wrong('nennerFelder','Der Nenner ist die Anzahl aller gleich großen Felder im Bild. Zähle noch einmal.'+fix,m);
  }
  const ok=t.plus?((u.n===t.a&&v.n===t.c)||(u.n===t.c&&v.n===t.a)):(u.n===t.a&&v.n===t.c);
  if(!ok)return wrong('zaehlerFelder',(t.plus?'Zähle die Felder jedes Musters noch einmal.':'Zähle alle gefärbten Felder, auch die durchgekreuzten. Zähle dann nur die durchgekreuzten.')+fix,{'u.n':false,'v.n':false});
  return null;
}
TASKS.R01={area:'Rechnen',name:'Bild und Rechnung',desc:'Brüche am Bild ablesen, addieren und subtrahieren. Ein Bild passt zu mehreren Aufgaben.',notes:['M17'],size:5,
  ctx:addCtx('R01'),planKey:'add',layoutKinds:(lvl)=>addPicKinds('R01',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'plus';
    if(kind==='drei'){
      const r=addDrei(R,level);
      return {type:'R01',level,kind,b:r.b,p1:r.p1,p2:r.p2,need:R01_NEED[level],avoid:[redKey(r.p1,r.b),redKey(r.p2,r.b)]};
    }
    if(kind==='geschichte')return addStoryTask(R,level,'R01',kind);
    if(kind==='bild'){
      /* wie LB S. 33 Nr. 5: ein Raster mit zwei Anteilen (oder einem Anteil mit Kreuzen), die Felder liegen manchmal verstreut */
      const plus=R.chance(0.65),r=addNums(R,1,plus,{pool:ADD_POOL_PIC,red:R.chance(0.5)});
      return Object.assign({type:'R01',level,kind},r,{scatter:R.chance(0.4),seed:R.int(1,9999),avoid:addAvoid(r)});
    }
    const plus=kind==='plus',r=addNums(R,level,plus,{over:level===2&&R.chance(plus?0.35:0.25),red:R.chance(0.5)});
    return Object.assign({type:'R01',level,kind},r,{avoid:addAvoid(r)});
  },
  prompt(t,h){
    if(t.kind==='drei')h.append(el('p',{class:'q'},`Schreibe Rechnungen, die zum Bild passen. Finde mindestens ${t.need} verschiedene.`));
    else if(t.kind==='bild')h.append(el('p',{class:'q'},'Welche Aufgabe gehört zum Bild? Schreibe die Aufgabe auf und rechne aus.'));
    else if(t.kind==='geschichte')h.append(addP(...ADD_STORIES[t.story].txt(t,t.who)));
    else h.append(el('p',{class:'q'},t.plus?'Addiere die beiden Anteile.':'Subtrahiere den zweiten Anteil.'),addEq(t));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='drei'){
      addPicBox(view,host,()=>addFigure(t.b,t.p1,t.p2,{mode:'plus'}),t.level===1&&t.b<BAR_FROM);
      addRows(view,host,{key:'rows',start:2,max:5,word:'Rechnung',row:(i)=>r01Row(view,t,i),drop:(i)=>['x','y','z','o'].map(k=>'q'+i+k)});
      return;
    }
    if(t.kind==='bild'){
      addPicBox(view,host,()=>addTaskFigure(t),true);
      const stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>addReadText(d)});
      stg.box1.append(el('p',null,strong('1. Lies die Aufgabe am Bild ab.')));
      addReadStage(view,stg.box1,()=>stg.advance());
      stg.box2.append(el('p',null,strong('2. Rechne aus.')));
      addResult(view,stg.box2,addMidOpt(t));
      stg.upd();
      return;
    }
    if(addHasPic(t))addPicBox(view,host,()=>addTaskFigure(t),t.level===1&&t.b<BAR_FROM);
    addResult(view,host,addMidOpt(t));
  },
  validate(t,d){
    if(t.kind==='drei'){
      const rows=d.rows==null?2:d.rows,seen=new Set(),marks={},issues=[];
      let good=0,any=false,bad=0;
      for(let i=0;i<rows;i++){
        const j=r01Judge(t,d,i);
        if(j.empty)continue;
        any=true;
        if(j.bad){bad++;issues.push(j.msg);Object.assign(marks,j.marks);continue;}
        if(seen.has(j.key)){bad++;issues.push(`Zeile ${i+1}: Diese Aufgabe hast du schon.`);['x','y','z'].forEach(k=>{marks['q'+i+k]=false;});marks['q'+i+'o']=false;continue;}
        seen.add(j.key);good++;['x','y','z'].forEach(k=>{marks['q'+i+k]=true;});marks['q'+i+'o']=true;
      }
      if(!any)return invalid('Schreibe mindestens eine Rechnung auf.');
      if(good<t.need)issues.push(`${good} von ${t.need} verschiedenen Rechnungen gefunden.`);
      if(!issues.length)return right('Richtig! In ein Bild passt eine Plusaufgabe und es passen zwei Minusaufgaben.');
      return (bad?wrong:soft)('zeile',issues.join(' '),marks);
    }
    if(t.kind==='bild'){
      const rd=addReadCheck(t,d);
      if(rd)return rd;
      if(d.s1!==true)return invalid('Tippe auf „Weiter zum Rechenweg“.');
    }
    const g=addResultCheck(t.res,d,(x,y)=>addDiag(t,x,y),addMidArg(t));
    if(g)return g;
    return right(t.plus?'Richtig! Du hast beide Anteile addiert. Der Nenner bleibt gleich.':'Richtig! Du hast den zweiten Anteil subtrahiert. Der Nenner bleibt gleich.');
  },
  solution(t){
    if(t.kind==='drei'){
      const T=t.p1+t.p2,b=t.b,out=[line('Zu einem Bild passt eine Plusaufgabe und es passen zwei Minusaufgaben.'),addFigure(b,t.p1,t.p2,{mode:'plus'}),
        eq(frac(t.p1,b),'+',frac(t.p2,b),'=',frac(T,b)),eq(frac(T,b),'−',frac(t.p2,b),'=',frac(t.p1,b)),eq(frac(T,b),'−',frac(t.p1,b),'=',frac(t.p2,b))];
      return out;
    }
    if(t.kind==='bild')return [addTaskFigure(t),line(t.plus?'Zwei Anteile werden zusammengefügt: plus.':'Felder werden durchgekreuzt: minus.'),...addSolLines(t)];
    return [...(addHasPic(t)?[addTaskFigure(t)]:[]),...addSolLines(t)];
  }
};

/* ---------- R02 Gleichnamig rechnen ---------- */
/* Lücke: p1 ± p2 = p3 (Zähler, Nenner b für alle drei), eine Stelle fehlt: blank 0 (erster Zähler) oder 1 (zweiter Zähler) */
function addLuecke(R,level){
  for(let i=0;i<400;i++){
    const b=R.pick(level===1?ADD_POOL[1].filter(x=>x<=16):ADD_POOL[2]);
    const plus=R.chance(0.5),blank=R.int(0,1);
    let p1,p2,p3;
    if(plus){p1=R.int(1,b-2);p2=R.int(1,b-1-p1);p3=p1+p2;}
    else{p1=R.int(2,b-1);p2=R.int(1,p1-1);p3=p1-p2;}
    if(p3<2||(plus&&p1===p2&&blank===1)||p3>=b+b)continue;
    return {b,plus,blank,p:[p1,p2,p3],x:[p1,p2][blank]};
  }
  return {b:8,plus:true,blank:1,p:[3,2,5],x:2};
}
TASKS.R02={area:'Rechnen',name:'Gleichnamig rechnen',desc:'Addiere und subtrahiere gleichnamige Brüche. Der Nenner bleibt.',notes:['M17','M3'],size:5,
  ctx:addCtx('R02'),planKey:'add',layoutKinds:(lvl)=>addPicKinds('R02',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'plus';
    if(kind==='luecke'){
      const r=addLuecke(R,level);
      return {type:'R02',level,kind,b:r.b,plus:r.plus,blank:r.blank,p:r.p,x:r.x,avoid:[redKey(r.p[0],r.b),redKey(r.p[1],r.b)]};
    }
    if(kind==='geschichte')return addStoryTask(R,level,'R02',kind);
    const plus=kind==='ueber1'?R.chance(0.5):kind==='plus';
    const r=addNums(R,level,plus,{over:kind==='ueber1',red:R.chance(0.5)});
    const t=Object.assign({type:'R02',level,kind},r,{avoid:addAvoid(r)});
    t.who=addWho(R);
    t.story=addPickStory(R,t,level===1?0.4:0.45);
    return t;
  },
  prompt(t,h){
    if(t.kind==='luecke'){h.append(el('p',{class:'q'},'Welche Zahl fehlt in der Rechnung?'));return;}
    if(t.story)h.append(addP(...ADD_STORIES[t.story].txt(t,t.who)));
    else h.append(el('p',{class:'q'},'Rechne aus.'),addEq(t));
  },
  render(view,host){
    const t=view.task;
    if(t.kind==='luecke'){
      const parts=t.p.map((p,i)=>(i===t.blank)?addNumOver(view,'x',t.b,'fehlende Zahl'):frac(p,t.b));
      host.append(eq(parts[0],ADD_SIGN(t.plus),parts[1],'=',parts[2]));
      return;
    }
    if(addHasPic(t))addPicBox(view,host,()=>addTaskFigure(t),false);
    addResult(view,host,addMidOpt(t));
  },
  validate(t,d){
    if(t.kind==='luecke'){
      const x=getInt(d,'x');
      if(x===null)return invalid('Trage die fehlende Zahl ein.');
      if(x===t.x)return right(t.plus?'Richtig! Die beiden Teile ergeben zusammen das Ganze der Rechnung.':'Richtig! Setze die Zahl ein, dann stimmt die Rechnung.');
      const [p1,p2,p3]=t.p,known=t.blank===0?p2:p1;
      let msg='Das passt noch nicht. Setze deine Zahl in die Rechnung ein und prüfe.';
      if(t.plus&&x===known+p3)msg='Hier fehlt ein Teil. Das Ganze ist größer als jeder Teil. Nimm den bekannten Teil weg.';
      else if(!t.plus&&t.blank===1&&x===p1+p3)msg='Hier fehlt das, was weggenommen wird. Es ist kleiner als das, wovon weggenommen wird.';
      else if(!t.plus&&t.blank===0&&x===Math.abs(p2-p3))msg='Hier fehlt das, wovon weggenommen wird. Das ist mehr als der Rest.';
      return wrong('luecke',msg,{x:false});
    }
    const g=addResultCheck(t.res,d,(x,y)=>addDiag(t,x,y),addMidArg(t));
    if(g)return g;
    return right(t.plus?'Richtig! Der Nenner bleibt, die Zähler werden addiert.':'Richtig! Der Nenner bleibt, die Zähler werden subtrahiert.');
  },
  solution(t){
    if(t.kind==='luecke'){
      const [p1,p2,p3]=t.p,b=t.b;
      const how=t.plus?(t.blank===0?[p3,'−',p2]:[p3,'−',p1]):(t.blank===0?[p3,'+',p2]:[p1,'−',p3]);
      return [line(t.plus?'Das Ganze ist die Summe. Nimm den bekannten Teil weg.':(t.blank===0?'Hier wird etwas weggenommen. Rechne vom Rest zurück.':'Hier fehlt das Weggenommene. Rechne vom Anfang zum Rest.')),
        eq(frac(how[0],b),how[1],frac(how[2],b),'=',frac(t.x,b)),eq(frac(p1,b),ADD_SIGN(t.plus),frac(p2,b),'=',frac(p3,b))];
    }
    return [...(addHasPic(t)?[addTaskFigure(t)]:[]),...addSolLines(t)];
  }
};

/* ---------- R03 Fehler und eigene Aufgaben ---------- */
const ADD_ERR=['nennerAddiert','andereRechnung','rechenfehler'];
const ADD_ERR_TEXT={nennerAddiert:'Der Nenner wurde mitgerechnet.',andereRechnung:'Plus und minus wurden verwechselt.',rechenfehler:'Der Zähler wurde falsch gerechnet.'};
/* Vier Hausaufgaben, eine ist falsch: Zeile {a,c,b,plus,x,y}; richtig ist x/y = Ergebnis mit dem Nenner b */
function addFehler(R,level){
  for(let tries=0;tries<200;tries++){
    const errType=R.pick(ADD_ERR),w=R.int(0,3),calcs=[],seen=new Set();
    let ok=true;
    for(let i=0;i<4;i++){
      const plus=R.chance(0.5),r=addNums(R,level,plus,{red:i===w?null:R.chance(0.4)});
      const key=r.a+'/'+r.c+'/'+r.b;
      if(seen.has(key)){ok=false;break;}
      seen.add(key);
      calcs.push({a:r.a,c:r.c,b:r.b,plus:r.plus,x:r.res[0],y:r.b});
    }
    if(!ok)continue;
    const e=calcs[w],n=e.x;
    if(errType==='nennerAddiert')e.y=2*e.b;
    else if(errType==='andereRechnung'){
      const o=e.plus?e.a-e.c:e.a+e.c;
      if(o<1||o===n)continue;
      e.x=o;
    }else{
      const x=n+(R.chance(0.5)?1:-1);
      if(x<1||x===n||2*x===n||x===(e.plus?e.a-e.c:e.a+e.c))continue; /* nicht zufällig das Ergebnis der anderen Rechenart oder mit mitgerechnetem Nenner (das wären andere Fehler) */
      e.x=x;
    }
    return {calcs,wrong:w,errType};
  }
  return {calcs:[{a:3,c:2,b:8,plus:true,x:5,y:16},{a:7,c:2,b:10,plus:false,x:5,y:10},{a:2,c:3,b:9,plus:true,x:5,y:9},{a:6,c:1,b:7,plus:false,x:5,y:7}],wrong:0,errType:'nennerAddiert'};
}
const addCalcTask=(c)=>({a:c.a,c:c.c,b:c.b,plus:c.plus,res:[c.plus?c.a+c.c:c.a-c.c,c.b]});
/* Rechnungen zum Antippen (Einfachwahl): Gleichung in der Kachel. Entwurf draft.sel = Nummer. Eingaben: 'sel'+Nummer */
function addCalcTiles(view,host,calcs,onPick){
  const d=view.draft,grid=el('div',{class:'tiles tiles-3',role:'group','aria-label':'Rechnungen'});
  calcs.forEach((c,i)=>{
    const b=el('button',{type:'button',class:'tile tile-eq','aria-pressed':String(d.sel===i)},el('span',{class:'ltr','aria-hidden':'true'},'ABCD'[i]),
      el('span',{class:'tv'},eq(frac(c.a,c.b),ADD_SIGN(c.plus),frac(c.c,c.b),'=',frac(c.x,c.y))));
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d.sel=i;view.save();
      grid.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',String(y===b)));
      if(onPick)onPick(i);
    });
    view.inputs['sel'+i]=b;grid.append(b);
  });
  return grid;
}
/* „Finde Brüche mit …“: summe  ▢/b + ▢/b = T/b · differenz  ▢/b − ▢/b = D/b (beide Brüche kleiner als 1) */
function addFinde(R,level){
  const need=level===1?2:3;
  for(let i=0;i<400;i++){
    const b=R.pick(level===1?ADD_POOL[1].filter(x=>x>=8&&x<=24):ADD_POOL[2]),mode=R.chance(0.5)?'summe':'differenz';
    let T;
    if(mode==='summe'){
      const lo=level===1?5:7,hi=Math.min(b,level===1?12:40);
      if(hi<lo)continue;
      T=R.int(lo,hi);
      if(Math.floor(T/2)<need)continue;
    }else{
      const hi=b-1-need;
      if(hi<1)continue;
      T=R.int(1,Math.min(hi,level===1?8:30));
    }
    return {b,mode,T,need};
  }
  return {b:12,mode:'summe',T:9,need};
}
/* Zeile i: Zähler x und y; Rückgabe {key} (gültige Lösung) · {bad,msg,marks} · {empty} */
function r03Judge(t,d,i){
  const x=getInt(d,'f'+i+'x'),y=getInt(d,'f'+i+'y'),blank=(k)=>d['f'+i+k]==null||d['f'+i+k]==='';
  if(blank('x')&&blank('y'))return {empty:true};
  const m={['f'+i+'x']:false,['f'+i+'y']:false};
  if(x===null||y===null)return {bad:true,msg:`Zeile ${i+1}: Trage beide Zähler ein.`,marks:m};
  if(t.mode==='summe'){
    if(x<1||y<1)return {bad:true,msg:`Zeile ${i+1}: Jeder Zähler ist mindestens 1.`,marks:m};
    if(x+y!==t.T)return {bad:true,msg:`Zeile ${i+1}: Die Zähler ergeben zusammen nicht ${t.T}.`,marks:m};
    return {key:Math.min(x,y)+'+'+Math.max(x,y)};
  }
  if(y<1)return {bad:true,msg:`Zeile ${i+1}: Jeder Zähler ist mindestens 1.`,marks:m};
  if(x>=t.b)return {bad:true,msg:`Zeile ${i+1}: Der erste Bruch soll kleiner als 1 sein.`,marks:m};
  if(x-y!==t.T)return {bad:true,msg:`Zeile ${i+1}: Der Unterschied der Zähler ist nicht ${t.T}.`,marks:m};
  return {key:x+'-'+y};
}
TASKS.R03={area:'Rechnen',name:'Fehler und eigene Aufgaben',desc:'Finde den Fehler in einer Rechnung. Erfinde selbst Aufgaben mit gleichnamigen Brüchen.',notes:['M17'],size:5,
  ctx:addCtx('R03'),planKey:'add',layoutKinds:(lvl)=>addPicKinds('R03',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'fehler';
    if(kind==='finde'){const r=addFinde(R,level);return {type:'R03',level,kind,b:r.b,mode:r.mode,T:r.T,need:r.need,avoid:[redKey(r.T,r.b)]};}
    const r=addFehler(R,level),w=r.calcs[r.wrong];
    return {type:'R03',level,kind,calcs:r.calcs,wrong:r.wrong,errType:r.errType,b:w.b,avoid:[redKey(w.a,w.b),redKey(w.c,w.b)]};
  },
  prompt(t,h){
    if(t.kind==='fehler'){h.append(el('p',{class:'q'},'Kontrolliere die Hausaufgaben. Eine Rechnung ist falsch.'));return;}
    h.append(t.mode==='summe'
      ?addP('Finde Brüche mit dem Nenner ',strong(t.b),', die zusammen ',frac(t.T,t.b),' ergeben. Schreibe mindestens '+t.need+' verschiedene Aufgaben auf.')
      :addP('Finde Brüche mit dem Nenner ',strong(t.b),', die ',frac(t.T,t.b),' als Unterschied haben. Beide Brüche sind kleiner als 1. Schreibe mindestens '+t.need+' verschiedene Aufgaben auf.'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='fehler'){
      const stg=twoStage(view,host,{isDone:()=>d.sel!=null,summary:()=>'Falsch ist Rechnung '+'ABCD'[d.sel]});
      stg.box1.append(el('p',null,strong('1. Welche Rechnung ist falsch?')),addCalcTiles(view,stg.box1,t.calcs,()=>stg.advance()));
      const w=t.calcs[t.wrong],opts=el('div',{class:'opts',role:'radiogroup','aria-label':'Was wurde falsch gemacht?'});
      ADD_ERR.forEach(o=>{
        const r=el('input',{type:'radio',name:'err',value:o});
        r.checked=d.err===o;r.disabled=view.locked();
        r.addEventListener('change',()=>{d.err=o;view.save();});
        view.inputs['err'+o]=r;
        opts.append(el('label',{class:'opt'},r,el('span',null,ADD_ERR_TEXT[o])));
      });
      stg.box2.append(el('p',null,strong('2. Was wurde falsch gemacht?')),opts,el('p',null,strong('3. Rechne richtig:')),eq(frac(w.a,w.b),ADD_SIGN(w.plus),frac(w.c,w.b),'='));
      addResult(view,stg.box2,addMidOpt({level:t.level,plus:w.plus}));
      stg.upd();
      return;
    }
    addRows(view,host,{key:'rows',start:2,max:6,word:'Aufgabe',row:(i)=>el('div',{class:'addrow'},el('span',{class:'tag'},(i+1)+'.'),
      addNumOver(view,'f'+i+'x',t.b,'erster Zähler'),op(t.mode==='summe'?'+':'−'),addNumOver(view,'f'+i+'y',t.b,'zweiter Zähler'),op('='),frac(t.T,t.b)),
      drop:(i)=>['x','y'].map(k=>'f'+i+k)});
  },
  validate(t,d){
    if(t.kind==='fehler'){
      if(d.sel==null)return invalid('Tippe zuerst die falsche Rechnung an.');
      if(d.sel!==t.wrong)return wrong('sel','Diese Rechnung stimmt. Rechne sie noch einmal nach.',{['sel'+d.sel]:false});
      if(!d.err)return invalid('Wähle auch aus, was falsch gemacht wurde.');
      if(d.err!==t.errType)return wrong('err','Du hast die falsche Rechnung gefunden. Die Fehlerart passt noch nicht. Vergleiche Nenner, Zähler und Rechenzeichen.',{['err'+d.err]:false});
      const w=t.calcs[t.wrong],ct=addCalcTask(w);
      const g=addResultCheck(ct.res,d,(x,y)=>addDiag(ct,x,y),addMidArg(t,ct));
      if(g)return g;
      return right('Richtig! Fehler gefunden: '+ADD_ERR_TEXT[t.errType]);
    }
    const rows=d.rows==null?2:d.rows,seen=new Set(),marks={},issues=[];
    let good=0,any=false,bad=0;
    for(let i=0;i<rows;i++){
      const j=r03Judge(t,d,i);
      if(j.empty)continue;
      any=true;
      if(j.bad){bad++;issues.push(j.msg);Object.assign(marks,j.marks);continue;}
      if(seen.has(j.key)){bad++;issues.push(`Zeile ${i+1}: Diese Aufgabe hast du schon.`);marks['f'+i+'x']=false;marks['f'+i+'y']=false;continue;}
      seen.add(j.key);good++;marks['f'+i+'x']=true;marks['f'+i+'y']=true;
    }
    if(!any)return invalid('Schreibe mindestens eine Aufgabe auf.');
    if(good<t.need)issues.push(`${good} von ${t.need} verschiedenen Aufgaben gefunden.`);
    if(!issues.length)return right('Richtig! Es gibt viele Lösungen. Die Zähler müssen nur zusammenpassen.');
    return (bad?wrong:soft)('zeile',issues.join(' '),marks);
  },
  solution(t){
    if(t.kind==='fehler'){
      const w=t.calcs[t.wrong],ct=addCalcTask(w);
      return [line(strong('Falsch ist Rechnung '+'ABCD'[t.wrong]+'. '),ADD_ERR_TEXT[t.errType]),
        eq(frac(w.a,w.b),ADD_SIGN(w.plus),frac(w.c,w.b),'=',frac(w.x,w.y)),line('So stimmt es:'),...addSolLines(ct)];
    }
    const out=[line(t.mode==='summe'?'Die Zähler müssen zusammen '+t.T+' ergeben. Mögliche Lösungen:':'Der Unterschied der Zähler muss '+t.T+' sein. Mögliche Lösungen:')],b=t.b;
    if(t.mode==='summe')for(let x=1;x<=Math.min(3,Math.floor(t.T/2));x++)out.push(eq(frac(x,b),'+',frac(t.T-x,b),'=',frac(t.T,b)));
    else for(let y=1;y<=3&&t.T+y<b;y++)out.push(eq(frac(t.T+y,b),'−',frac(y,b),'=',frac(t.T,b)));
    return out;
  }
};
