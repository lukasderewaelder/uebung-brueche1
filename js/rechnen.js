'use strict';
/* =====================================================================
   Aufgaben des Themas „Brüche addieren und subtrahieren“ (Kürzel R), Teil 1: gleiche Nenner
   Fünf Stationen, erst nach Rechenart getrennt, dann nach Thema (Bild / Rechnen), dazu ein gemischter Schlussbaustein:
   R01 Addieren am Bild                      Bild → Brüche ablesen → Rechenweg (bild, wie LB S. 33 Nr. 5), plus mit Bild, Geschichte mit Bild (Kuchen)
   R02 Addieren und rechnen                  plus mit und ohne Geschichte, auch über 1 (unechter Bruch), Lücken füllen
   R03 Subtrahieren am Bild                  wie R01, aber minus: durchgekreuzte Felder lesen
   R04 Subtrahieren und rechnen              wie R02, aber minus (Geschichte Pizza: Anfang − Ende)
   R05 Plus oder minus?                      Rechenart aus der Geschichte erkennen, „Ein Bild, mehrere Aufgaben“ (offen, per Regel geprüft), „Hausaufgaben kontrollieren“ (Fehler finden), „Finde Brüche mit …“ (offen)
   Aufbau und Wörter wie an der Tafel: Fachwort „gleichnamig“, Rechenweg Aufgabe = (Zähler ± Zähler)/Nenner = Ergebnis = gekürzt, Bilder als Raster, bei minus durchgekreuzt.
   Reihenfolge: gleichnamig (dieses Thema), danach ungleichnamig (Thema addsub2, js/hauptnenner.js), danach gemischte Zahlen (kommt später). Plus und Minus laufen in R01 bis R04 getrennt, in R05 gemischt.
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
  const pool=o.pool||(o.step!=null?addStepPool(level,o.step):ADD_POOL[level]);
  const maxN=o.over?0:(o.maxN||(level===1&&addStage(o.step)===0?4:0)); /* die ersten Aufgaben in Leicht: kleine Zähler (höchstens 4) */
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
    if(maxN&&(a>maxN||c>maxN))continue;
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

/* ---------- Steigerung in der Runde ----------
   step = Platz der Aufgabe in der Runde (0 = erste). Stufe 0 (Aufgabe 1 und 2): kleine Nenner, in Leicht auch kleine Zähler, Bilder mit wenigen Feldern in ein bis zwei Reihen.
   Stufe 1 (Aufgabe 3 und 4): mittlere Nenner. Stufe 2 (ab Aufgabe 5): der ganze Zahlenraum, Felder auch verstreut.
   Kürzen: In jeder Runde lässt sich etwa die Hälfte der Ergebnisse kürzen (addRedPlan), in gemischter Reihenfolge. */
const addStage=(step)=>step==null?2:step<2?0:step<4?1:2;
const ADD_STEP_POOL={1:[[4,5,6,8],[5,6,8,9,10,12],ADD_POOL[1]],2:[[10,12,15,16,18,20,24],[12,15,16,18,20,24,25,30,36,40],ADD_POOL[2]]};
const ADD_STEP_PIC=[[4,5,6,8],[6,8,9,10,12],ADD_POOL_PIC];
const addStepPool=(level,step)=>ADD_STEP_POOL[level][addStage(step)];
const addPicPool=(step)=>ADD_STEP_PIC[addStage(step)];
/* Arten ohne Ergebnis zum Kürzen (Lücke, offene Aufgaben) */
const ADD_NORES=['luecke','drei','finde'];
/* Für die Arten einer Runde: an jeder Stelle mit Ergebnis true (kürzbar) oder false, etwa halb und halb, gemischt; sonst null */
function addRedPlan(kinds){
  const idx=kinds.map((k,i)=>ADD_NORES.includes(k)?-1:i).filter(i=>i>=0),n=idx.length;
  const yes=Math.floor(n/2)+(n%2&&RNG.chance(0.5)?1:0);
  const vals=RNG.shuffle(idx.map((_,j)=>j<yes)),out=kinds.map(()=>null);
  idx.forEach((i,j)=>{out[i]=vals[j];});
  return out;
}
const addRed=(R,ctx)=>ctx&&typeof ctx.red==='boolean'?ctx.red:R.chance(0.5);
const addStep=(ctx)=>ctx&&ctx.step!=null?ctx.step:null;

/* ---------- Rundenplan ---------- */
const ADD_PLAN={
  R01:{1:['bild','plus','geschichte','bild','plus'],2:['plus','geschichte','plus','geschichte','plus']},
  R02:{1:['geschichte','plus','luecke','plus','geschichte'],2:['plus','geschichte','ueber1','luecke','ueber1']},
  R03:{1:['bild','minus','geschichte','bild','minus'],2:['minus','geschichte','minus','geschichte','minus']},
  R04:{1:['geschichte','minus','luecke','minus','geschichte'],2:['minus','geschichte','ueber1','luecke','ueber1']},
  R05:{1:['art','drei','fehler','finde','art'],2:['art','drei','fehler','finde','fehler']}
};
function addCtx(id){
  return (round,level)=>{
    if(!Array.isArray(round.add)||round.add.length!==TASKS[id].size)round.add=RNG.shuffle(ADD_PLAN[id][level]);
    if(!Array.isArray(round.red)||round.red.length!==round.add.length)round.red=addRedPlan(round.add);
    const i=Math.min(round.results.length,round.add.length-1);
    return {kind:round.add[i],step:i,red:round.red[i]};
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
/* Aufgabe mit Geschichte (Arten „geschichte“ und „art“): Kuchen und Pizza von der Tafel besonders oft; die Rechenart folgt der Geschichte.
   o.op: 'plus' oder 'minus' (nur Geschichten dieser Rechenart), sonst beide · o.pic: nur Geschichten mit Bild (die Station „am Bild“) */
function addStoryTask(R,level,type,kind,o){
  o=o||{};
  const ids=Object.keys(ADD_STORIES).filter(k=>(o.op==null||ADD_STORIES[k].plus===(o.op==='plus'))&&(!o.pic||ADD_STORIES[k].pic!==false)),fav=ids.filter(k=>k==='kuchen'||k==='pizzaEnde');
  const id=fav.length&&R.chance(0.5)?R.pick(fav):R.pick(ids),S=ADD_STORIES[id];
  const r=addNums(R,level,S.plus,{over:S.big&&level===2&&R.chance(S.plus?0.35:0.25),red:o.red!=null?o.red:R.chance(0.5),step:o.step,pool:o.pic&&level===1?addPicPool(o.step):null});
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


/* ---------- Gemeinsame Bausteine der Stationen ---------- */
/* R01 und R02 addieren, R03 und R04 subtrahieren, R05 mischt. „am Bild“ (R01, R03) und „rechnen“ (R02, R04) sind je eine Familie mit fester Rechenart. */
const addPlusOf=(id)=>id==='R01'||id==='R02';
const addRightText=(t)=>t.plus?'Richtig! Du hast beide Anteile addiert. Der Nenner bleibt gleich.':'Richtig! Du hast den zweiten Anteil subtrahiert. Der Nenner bleibt gleich.';

/* Ein Bild mit zwei Anteilen p1, p2 (Nenner b): Leicht Summe unter einem Ganzen, Knifflig auch darüber (R05 „Ein Bild, mehrere Aufgaben“) */
function addDrei(R,level,step){
  for(let i=0;i<300;i++){
    const b=R.pick(level===1?(step!=null?addPicPool(step):ADD_POOL_PIC):[12,15,16,20,24,40,50,60,100]);
    const over=level===2&&R.chance(0.3);
    const p1=R.int(1,b-1),p2=over?R.int(b-p1+1,b-1):R.int(1,Math.max(1,b-1-p1));
    if(p1===p2||p2<1||p2>b-1)continue;
    if(over?p1+p2<=b:p1+p2>=b)continue; /* Leicht: Summe unter einem Ganzen; Knifflig manchmal darüber, nie genau ein Ganzes */
    if(level===1&&p1+p2<4)continue;
    return {b,p1,p2};
  }
  return {b:8,p1:3,p2:2};
}
const ADD_NEED={1:2,2:3};
/* Zeile i der offenen Aufgabe: [▢]/b ± [▢]/b = [▢]/b, das Rechenzeichen wird angetippt */
function addDreiRow(view,t,i){
  return el('div',{class:'addrow'},el('span',{class:'tag'},(i+1)+'.'),addNumOver(view,'q'+i+'x',t.b,'erster Zähler'),addOpToggle(view,'q'+i+'o'),
    addNumOver(view,'q'+i+'y',t.b,'zweiter Zähler'),op('='),addNumOver(view,'q'+i+'z',t.b,'Zähler des Ergebnisses'));
}
/* Eine Zeile prüfen: {key} für eine gültige Aufgabe zum Bild (p plus, mB Teil 2 wegnehmen, mA Teil 1 wegnehmen), sonst {bad, msg, marks} oder {empty} */
function addDreiJudge(t,d,i){
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
  const u=getFrac(d,'u'),v=getFrac(d,'v'),fix=d.s1===true?' Tippe oben auf „ändern“.':''; /* das Rechenzeichen ist fest (Station plus oder minus) */
  if(!u||!v)return invalid('Trage beide Brüche ein.');
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

/* ---------- Familie „am Bild“: R01 Addieren am Bild, R03 Subtrahieren am Bild ----------
   Arten: bild (Bild → Brüche ablesen → Rechenweg, wie LB S. 33 Nr. 5), plus oder minus (mit Bild), geschichte (mit Bild) */
function addBildTask(id,meta){
  const plusSt=addPlusOf(id);
  return Object.assign({area:'Rechnen',size:5,ctx:addCtx(id),planKey:'add',layoutKinds:(lvl)=>addPicKinds(id,lvl)},meta,{
    gen(level,R,ctx){
      const kind=(ctx&&ctx.kind)||'bild',step=addStep(ctx),red=addRed(R,ctx);
      if(kind==='geschichte')return addStoryTask(R,level,id,kind,{op:plusSt?'plus':'minus',pic:true,step,red});
      if(kind==='bild'){
        /* wie LB S. 33 Nr. 5: ein Raster mit zwei Anteilen (oder einem Anteil mit Kreuzen); verstreute Felder erst am Ende der Runde */
        const r=addNums(R,1,plusSt,{pool:addPicPool(step),red,step});
        return Object.assign({type:id,level,kind},r,{scatter:addStage(step)===2&&R.chance(0.5),seed:R.int(1,9999),avoid:addAvoid(r)});
      }
      const r=addNums(R,level,plusSt,{over:level===2&&R.chance(plusSt?0.35:0.25),red,step,pool:level===1?addPicPool(step):null});
      return Object.assign({type:id,level,kind},r,{avoid:addAvoid(r)});
    },
    prompt(t,h){
      if(t.kind==='bild')h.append(el('p',{class:'q'},t.plus?'Welche Additionsaufgabe gehört zum Bild? Schreibe die Aufgabe auf und rechne aus.':'Welche Subtraktionsaufgabe gehört zum Bild? Schreibe die Aufgabe auf und rechne aus.'));
      else if(t.kind==='geschichte')h.append(addP(...ADD_STORIES[t.story].txt(t,t.who)));
      else h.append(el('p',{class:'q'},t.plus?'Addiere die beiden Anteile.':'Subtrahiere den zweiten Anteil.'),addEq(t));
    },
    render(view,host){
      const t=view.task,d=view.draft;
      if(t.kind==='bild'){
        addPicBox(view,host,()=>addTaskFigure(t),true);
        const stg=twoStage(view,host,{isDone:()=>d.s1===true,summary:()=>addReadText(d)});
        stg.box1.append(el('p',null,strong('1. Lies die Aufgabe am Bild ab.')));
        addReadStage(view,stg.box1,()=>stg.advance(),ADD_SIGN(t.plus));
        stg.box2.append(el('p',null,strong('2. Rechne aus.')));
        addResult(view,stg.box2,addMidOpt(t));
        stg.upd();
        return;
      }
      if(addHasPic(t))addPicBox(view,host,()=>addTaskFigure(t),t.level===1&&t.b<BAR_FROM);
      addResult(view,host,addMidOpt(t));
    },
    validate(t,d){
      if(t.kind==='bild'){
        const rd=addReadCheck(t,d);
        if(rd)return rd;
        if(d.s1!==true)return invalid('Tippe auf „Weiter zum Rechenweg“.');
      }
      const g=addResultCheck(t.res,d,(x,y)=>addDiag(t,x,y),addMidArg(t));
      if(g)return g;
      return right(addRightText(t));
    },
    solution(t){
      if(t.kind==='bild')return [addTaskFigure(t),line(t.plus?'Zwei Anteile werden zusammengefügt: plus.':'Felder werden durchgekreuzt: minus.'),...addSolLines(t)];
      return [...(addHasPic(t)?[addTaskFigure(t)]:[]),...addSolLines(t)];
    }
  });
}

/* ---------- Familie „rechnen“: R02 Addieren und rechnen, R04 Subtrahieren und rechnen ----------
   Arten: plus oder minus, geschichte (Kuchen, Pizza), ueber1 (Ergebnis über 1 beziehungsweise Anfang über 1), luecke (eine Zahl fehlt) */
/* Lücke: p1 ± p2 = p3 (Zähler, Nenner b für alle drei), eine Stelle fehlt: blank 0 (erster Zähler) oder 1 (zweiter Zähler); plus: Rechenart fest (true/false) oder null = zufällig */
function addLuecke(R,level,plusFix,step){
  for(let i=0;i<400;i++){
    const b=R.pick(step!=null?addStepPool(level,step).filter(x=>level===2||x<=16):level===1?ADD_POOL[1].filter(x=>x<=16):ADD_POOL[2]);
    const plus=plusFix==null?R.chance(0.5):plusFix,blank=R.int(0,1);
    let p1,p2,p3;
    if(plus){p1=R.int(1,b-2);p2=R.int(1,b-1-p1);p3=p1+p2;}
    else{p1=R.int(2,b-1);p2=R.int(1,p1-1);p3=p1-p2;}
    if(p3<2||(plus&&p1===p2&&blank===1)||p3>=b+b)continue;
    return {b,plus,blank,p:[p1,p2,p3],x:[p1,p2][blank]};
  }
  return plusFix===false?{b:8,plus:false,blank:1,p:[6,2,4],x:2}:{b:8,plus:true,blank:1,p:[3,2,5],x:2};
}
function addRechnenTask(id,meta){
  const plusSt=addPlusOf(id);
  return Object.assign({area:'Rechnen',size:5,ctx:addCtx(id),planKey:'add',layoutKinds:(lvl)=>addPicKinds(id,lvl)},meta,{
    gen(level,R,ctx){
      const kind=(ctx&&ctx.kind)||(plusSt?'plus':'minus'),step=addStep(ctx),red=addRed(R,ctx);
      if(kind==='luecke'){
        const r=addLuecke(R,level,plusSt,step);
        return {type:id,level,kind,b:r.b,plus:r.plus,blank:r.blank,p:r.p,x:r.x,avoid:[redKey(r.p[0],r.b),redKey(r.p[1],r.b)]};
      }
      if(kind==='geschichte')return addStoryTask(R,level,id,kind,{op:plusSt?'plus':'minus',step,red});
      const r=addNums(R,level,plusSt,{over:kind==='ueber1',red,step});
      const t=Object.assign({type:id,level,kind},r,{avoid:addAvoid(r)});
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
  });
}

/* ---------- R05 Plus oder minus? Fehler und eigene Aufgaben ---------- */
const ADD_ERR=['nennerAddiert','andereRechnung','rechenfehler'];
const ADD_ERR_TEXT={nennerAddiert:'Der Nenner wurde mitgerechnet.',andereRechnung:'Plus und minus wurden verwechselt.',rechenfehler:'Der Zähler wurde falsch gerechnet.'};
/* Vier Hausaufgaben, eine ist falsch: Zeile {a,c,b,plus,x,y}; richtig ist x/y = Ergebnis mit dem Nenner b */
/* step: Platz in der Runde (kleinere Zahlen am Anfang) · red: Lässt sich das richtige Ergebnis der falschen Rechnung kürzen? (Kind rechnet es neu) */
function addFehler(R,level,step,red){
  for(let tries=0;tries<200;tries++){
    const errType=R.pick(ADD_ERR),w=R.int(0,3),calcs=[],seen=new Set();
    let ok=true;
    for(let i=0;i<4;i++){
      const plus=R.chance(0.5),r=addNums(R,level,plus,{red:i===w?(typeof red==='boolean'?red:null):R.chance(0.4),step});
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
function addFinde(R,level,step){
  const need=level===1?2:3;
  for(let i=0;i<400;i++){
    const b=R.pick(level===1?ADD_POOL[1].filter(x=>x>=8&&x<=(addStage(step)===0?12:24)):ADD_POOL[2]),mode=R.chance(0.5)?'summe':'differenz';
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
function addFindeJudge(t,d,i){
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
TASKS.R05={area:'Rechnen',name:'Plus oder minus?',desc:'Erkenne die Rechenart, finde Fehler und erfinde eigene Aufgaben.',notes:['M17','M18'],size:5,
  ctx:addCtx('R05'),planKey:'add',layoutKinds:(lvl)=>addPicKinds('R05',lvl),
  gen(level,R,ctx){
    const kind=(ctx&&ctx.kind)||'fehler',step=addStep(ctx),red=addRed(R,ctx);
    if(kind==='art')return addStoryTask(R,level,'R05',kind,{step,red});
    if(kind==='drei'){
      const r=addDrei(R,level,step);
      return {type:'R05',level,kind,b:r.b,p1:r.p1,p2:r.p2,need:ADD_NEED[level],avoid:[redKey(r.p1,r.b),redKey(r.p2,r.b)]};
    }
    if(kind==='finde'){const r=addFinde(R,level,step);return {type:'R05',level,kind,b:r.b,mode:r.mode,T:r.T,need:r.need,avoid:[redKey(r.T,r.b)]};}
    const r=addFehler(R,level,step,red),w=r.calcs[r.wrong];
    return {type:'R05',level,kind,calcs:r.calcs,wrong:r.wrong,errType:r.errType,b:w.b,avoid:[redKey(w.a,w.b),redKey(w.c,w.b)]};
  },
  prompt(t,h){
    if(t.kind==='art'){h.append(addP(...ADD_STORIES[t.story].txt(t,t.who)));return;}
    if(t.kind==='drei'){h.append(el('p',{class:'q'},`Schreibe Rechnungen, die zum Bild passen. Finde mindestens ${t.need} verschiedene.`));return;}
    if(t.kind==='fehler'){h.append(el('p',{class:'q'},'Kontrolliere die Hausaufgaben. Eine Rechnung ist falsch.'));return;}
    h.append(t.mode==='summe'
      ?addP('Finde Brüche mit dem Nenner ',strong(t.b),', die zusammen ',frac(t.T,t.b),' ergeben. Schreibe mindestens '+t.need+' verschiedene Aufgaben auf.')
      :addP('Finde Brüche mit dem Nenner ',strong(t.b),', die ',frac(t.T,t.b),' als Unterschied haben. Beide Brüche sind kleiner als 1. Schreibe mindestens '+t.need+' verschiedene Aufgaben auf.'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='art'){
      const stg=twoStage(view,host,{isDone:()=>d.art!=null,summary:()=>d.art==='plus'?'Rechenart: plus':'Rechenart: minus'});
      const opts=el('div',{class:'opts',role:'radiogroup','aria-label':'Welche Rechenart gehört zur Geschichte?'});
      [['plus','Es wird zusammengefügt: Das ist plus.'],['minus','Es wird weggenommen: Das ist minus.']].forEach(([v,txt])=>{
        const r=el('input',{type:'radio',name:'art',value:v});
        r.checked=d.art===v;r.disabled=view.locked();
        r.addEventListener('change',()=>{d.art=v;view.save();stg.advance();});
        view.inputs['art'+v]=r;
        opts.append(el('label',{class:'opt'},r,el('span',null,txt)));
      });
      stg.box1.append(el('p',null,strong('1. Wird zusammengefügt oder weggenommen?')),opts);
      stg.box2.append(el('p',null,strong('2. Rechne aus.')));
      addResult(view,stg.box2,addMidOpt(t));
      stg.upd();
      return;
    }
    if(t.kind==='drei'){
      addPicBox(view,host,()=>addFigure(t.b,t.p1,t.p2,{mode:'plus'}),t.level===1&&t.b<BAR_FROM);
      addRows(view,host,{key:'rows',start:2,max:5,word:'Rechnung',row:(i)=>addDreiRow(view,t,i),drop:(i)=>['x','y','z','o'].map(k=>'q'+i+k)});
      return;
    }
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
    if(t.kind==='art'){
      if(d.art==null)return invalid('Wähle zuerst die Rechenart.');
      if((d.art==='plus')!==t.plus)return wrong('andereRechnung',t.plus?'Hier wird zusammengefügt, also plus. Lies die Geschichte noch einmal.':'Hier wird weggenommen, also minus. Lies die Geschichte noch einmal.',{['art'+d.art]:false});
      const g=addResultCheck(t.res,d,(x,y)=>addDiag(t,x,y),addMidArg(t));
      if(g)return g;
      return right(addRightText(t));
    }
    if(t.kind==='drei'){
      const rows=d.rows==null?2:d.rows,seen=new Set(),marks={},issues=[];
      let good=0,any=false,bad=0;
      for(let i=0;i<rows;i++){
        const j=addDreiJudge(t,d,i);
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
      const j=addFindeJudge(t,d,i);
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
    if(t.kind==='art')return [line(t.plus?'Es wird zusammengefügt: plus.':'Es wird weggenommen: minus.'),...(addHasPic(t)?[addTaskFigure(t)]:[]),...addSolLines(t)];
    if(t.kind==='drei'){
      const T=t.p1+t.p2,b=t.b;
      return [line('Zu einem Bild passt eine Plusaufgabe und es passen zwei Minusaufgaben.'),addFigure(b,t.p1,t.p2,{mode:'plus'}),
        eq(frac(t.p1,b),'+',frac(t.p2,b),'=',frac(T,b)),eq(frac(T,b),'−',frac(t.p2,b),'=',frac(t.p1,b)),eq(frac(T,b),'−',frac(t.p1,b),'=',frac(t.p2,b))];
    }
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

/* ---------- Die fünf Stationen des Themas (Block 1: gleichnamig) ---------- */
TASKS.R01=addBildTask('R01',{name:'Addieren am Bild',desc:'Brüche am Bild ablesen, die Aufgabe notieren und addieren.',notes:['M17']});
TASKS.R02=addRechnenTask('R02',{name:'Addieren und rechnen',desc:'Addiere gleichnamige Brüche. Der Nenner bleibt, die Zähler werden addiert.',notes:['M17','M3']});
TASKS.R03=addBildTask('R03',{name:'Subtrahieren am Bild',desc:'Durchgekreuzte Felder lesen, die Aufgabe notieren und subtrahieren.',notes:['M18']});
TASKS.R04=addRechnenTask('R04',{name:'Subtrahieren und rechnen',desc:'Subtrahiere gleichnamige Brüche. Der Nenner bleibt, die Zähler werden subtrahiert.',notes:['M18','M3']});

/* ---------- Abschlusscheck „Gleichnamige Brüche“ (RA) ----------
   15 Aufgaben aus allen fünf Stationen (je drei Arten, Umbau P1), in gemischter Reihenfolge. Eine Runde mit Aufgaben mehrerer Arten wie QA, ZA, WA:
   gen() liefert Aufgaben der echten Typen, RA reicht prompt/render/validate/solution/hints an den Typ der Aufgabe weiter (proxyOf).
   Urkunde ab 12 Punkten (ohne Tipp 1, mit Tipp ½) und nach allen Pflicht-Stationen. Gehört zum Thema „Gleichnamige Brüche“ (Block 1);
   die späteren Blöcke (unterschiedlich benannt, gemischte Zahlen) bekommen je ein eigenes Thema mit eigenem Check. */
const RA_SLOTS={
  1:[['R01','bild'],['R02','plus'],['R03','bild'],['R04','minus'],['R05','art'],['R02','luecke'],['R04','geschichte'],['R01','geschichte'],['R05','fehler'],['R03','minus'],
     ['R01','plus'],['R02','geschichte'],['R03','geschichte'],['R04','luecke'],['R05','art']],
  2:[['R01','plus'],['R02','ueber1'],['R03','minus'],['R04','ueber1'],['R05','art'],['R02','luecke'],['R04','geschichte'],['R01','geschichte'],['R05','fehler'],['R03','geschichte'],
     ['R01','bild'],['R02','geschichte'],['R03','bild'],['R04','luecke'],['R05','fehler']]
};
TASKS.RA=proxyOf({area:'Rechnen',name:'Abschlusscheck',desc:RA_SLOTS[1].length+' Aufgaben aus allen Stationen zeigen, was du kannst – am Ende des Lernpfads.',notes:['M17','M18'],size:RA_SLOTS[1].length,
  finalTap:0,finalLabel:'Aufgaben richtig',
  ctx(round,level){
    const slots=RA_SLOTS[level]||RA_SLOTS[1];
    if(!Array.isArray(round.plan)||round.plan.length!==RA_SLOTS[1].length)round.plan=RNG.shuffle([...RA_SLOTS[1].keys()]);
    if(!Array.isArray(round.red)||round.red.length!==round.plan.length)round.red=addRedPlan(round.plan.map(i=>slots[i][1]));
    const j=Math.min(round.results.length,round.plan.length-1);
    return {slot:round.plan[j],step:j<4?0:j<10?2:4,red:round.red[j]}; /* P1: 15 Aufgaben wie jeder Abschlusscheck: 1–4 kleine Zahlen, 5–10 mittlere, 11–15 der ganze Zahlenraum */
  },
  gen(level,R,ctx){
    const slots=RA_SLOTS[level]||RA_SLOTS[1],i=ctx&&ctx.slot!=null?ctx.slot:0,[id,kind]=slots[i];
    return TASKS[id].gen(level,R,{kind,step:ctx&&ctx.step!=null?ctx.step:null,red:ctx?ctx.red:null});
  }
});
