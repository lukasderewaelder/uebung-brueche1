'use strict';
/* =====================================================================
   Bausteine für „Ungleichnamige Brüche addieren und subtrahieren“ (Thema addsub2, Aufgaben H02–H13 in js/hauptnenner.js)
   crossFigure   Kreuzraster wie im Hefter S. 4: Stufe 1 getrennt (erster Bruch senkrecht geteilt, zweiter waagerecht), Stufe 2 Teilung übertragen
                 (rote Linien wachsen ein), Stufe 3 zusammen (ein Raster, spaltenweise aufgefüllt; Minus: Weggenommenes durchgekreuzt).
                 mode 'erg' (Ergänzen): Start gefärbt, Ziel gestrichelt, fehlende Felder werden angetippt.
   trickRow      Trick 17 (Hefter S. 5): Vielfache des größten Nenners mit Haken oder Kreuz je kleinerem Nenner, der Hauptnenner eingerahmt
   hnWholes      Zwei verschiedene Ganze (Kuchen und Pizza) gegen ein gemeinsames Ganzes (M21, H07 „Das gleiche Ganze“)
   chainView     Rechenschlange: Kästchen mit Pfeilen, am Pfeil der Rechenschritt, im Kopf das Ziel
   addResultH    Rechenweg-Block: Leicht mit Feld „Hauptnenner“ und Zwischenschritt, Knifflig mit erweiterten Brüchen; immer „Ergebnis“, „gekürzt“, „Kürzen geht nicht“
   hnMixedInput  Eingabe einer gemischten Zahl (Ganze, Zähler, Nenner); neu, später auch für Block 3
   hnStages      Aufgaben in mehreren Etappen (wie twoStage, aber beliebig viele)
   hnChoice      Antworten zum Antippen in einer Liste (Optionen mit Text und Brüchen)
   Zustände liegen als einfache Daten im Entwurf (view.draft). Jeder Handler beginnt mit view.locked(), danach view.save().
   ===================================================================== */
const HN_W=120,HN_H=72; /* ein Ganzes als Rechteck (Bildpunkte im Bild), höchstens etwa 90 Pixel hoch auf dem Bildschirm */

/* Ein Rechteck aus rows × cols Feldern. cellOf(r,c) → {on, on2, x, rest, tap}. o.newRows / o.newCols: übertragene Linien (rot) · o.onToggle(r,c) · o.label · o.mw (rem) */
function hnRect(rows,cols,cellOf,o){
  o=o||{};
  const cw=HN_W/cols,ch=HN_H/rows;
  const svg=S_('svg',Object.assign({viewBox:`0 0 ${HN_W+4} ${HN_H+4}`,class:'fracsvg hnrect','aria-label':o.label||'Rechteck'},o.onToggle?{}:{role:'img'}));
  svg.style.maxWidth=(o.mw||6.5).toFixed(3)+'rem';
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const s=cellOf(r,c)||{},x=2+c*cw,y=2+r*ch;
    const g=S_('g',{class:'cell'+(s.on?' on':'')+(s.on2?' on2':'')+(s.rest?' rest':'')+(s.tap?' tapped':'')},S_('rect',{x,y,width:cw,height:ch}));
    if(s.x){const p=Math.min(cw,ch)*0.22;g.append(S_('path',{class:'xmark',d:`M${x+p} ${y+p}L${x+cw-p} ${y+ch-p}M${x+p} ${y+ch-p}L${x+cw-p} ${y+p}`}));}
    if(o.onToggle&&s.can){
      g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-pressed',String(!!s.tap));g.setAttribute('aria-label','Feld in Reihe '+(r+1)+', Spalte '+(c+1));
      const fire=()=>o.onToggle(r,c);
      g.addEventListener('click',fire);
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fire();}});
    }
    svg.append(g);
  }
  if(o.newRows)for(let i=1;i<rows;i++)svg.append(S_('line',{class:'hnx',x1:2,x2:2+HN_W,y1:2+i*ch,y2:2+i*ch,pathLength:1}));
  if(o.newCols)for(let i=1;i<cols;i++)svg.append(S_('line',{class:'hnx',x1:2+i*cw,x2:2+i*cw,y1:2,y2:2+HN_H,pathLength:1}));
  svg.append(S_('rect',{class:'hnframe',x:2,y:2,width:HN_W,height:HN_H}));
  return svg;
}
/* Ein Bruch n/den als Rechteck(e): dir 'v' senkrecht geteilt (Spalten), 'h' waagerecht (Reihen); transfer: die Teilung other des anderen Bruchs ist übertragen */
function hnFracRects(n,den,dir,other,transfer,cls,mw){
  const wholes=Math.max(1,Math.ceil(n/den)),out=[];
  for(let w=0;w<wholes;w++){
    const rows=dir==='v'?(transfer?other:1):den,cols=dir==='v'?den:(transfer?other:1);
    const filled=(r,c)=>(dir==='v'?c:r)+w*den<n;
    out.push(hnRect(rows,cols,(r,c)=>filled(r,c)?{[cls]:true}:null,{newRows:transfer&&dir==='v',newCols:transfer&&dir==='h',mw,
      label:'Rechteck in '+den+(dir==='v'?' senkrechte':' waagerechte')+' Streifen geteilt'+(transfer?', dazu '+other+(dir==='v'?' waagerechte':' senkrechte')+' Streifen':'')+', '+Math.max(0,Math.min(den,n-w*den))+' gefärbt'}));
  }
  return out;
}
/* Gemeinsames Raster (rows = d Reihen, cols = b Spalten), spaltenweise aufgefüllt (Index k = Spalte · rows + Reihe). state(k) → Feldzustand */
function hnCombined(rows,cols,total,state,o){
  const N=rows*cols,wholes=Math.max(1,Math.ceil(total/N)),out=[];
  for(let w=0;w<wholes;w++)out.push(hnRect(rows,cols,(r,c)=>state(w*N+c*rows+r),Object.assign({},o,{onToggle:o&&o.onToggle?(r,c)=>o.onToggle(w*N+c*rows+r):null})));
  return out;
}
const hnPart=(svgs,cap,sym)=>el('div',{class:'addu'},sym?el('span',{class:'asym','aria-hidden':'true'},sym):null,
  el('div',{class:'addcol'},el('div',{class:'addgrids'},...svgs),cap?el('small',{class:'acap hncap'},cap):null));
/* Kreuzraster: s = {b, a, d, c, stage (1–3), mode ('plus' | 'minus' | 'erg'), tapped (Set, nur erg), onToggle(k) (nur erg), caps (Beschriftungen)}.
   Erster Bruch a/b senkrecht geteilt, zweiter c/d waagerecht. Bei mode 'erg' ist c/d der Start und a/b das Ziel. */
function crossFigure(s){
  const {b,a,d,c}=s,stage=s.stage||1,mode=s.mode||'plus',N=b*d,tr=stage>=2,mw=stage===3?5:6.5;
  const box=el('div',{class:'hnfig addfig',role:'group','aria-label':s.label||('Kreuzraster zu '+a+'/'+b+' und '+c+'/'+d)});
  const row=el('div',{class:'addsplit'});box.append(row);
  const cap=(n,q,txt)=>el('span',null,txt?txt+' ':'',frac(n,q));
  if(mode==='erg'){
    if(stage===1){
      row.append(hnPart(hnFracRects(c,d,'h',b,false,'on',mw),cap(c,d,'Start')),hnPart(hnFracRects(a,b,'v',d,false,'on2',mw),cap(a,b,'Ziel')));
      return box;
    }
    const st=c*b,tg=a*d,tap=s.tapped||new Set();
    const grid=hnCombined(d,b,Math.max(tg,st),(k)=>({on:k<st,on2:tap.has(k),tap:tap.has(k),rest:k>=st&&k<tg&&!tap.has(k),can:k>=st}),{mw:8,onToggle:s.onToggle,label:'Raster aus '+N+' Feldern'});
    row.append(hnPart(grid,el('span',null,'Start ',frac(c,d),' · Ziel ',frac(a,b))));
    box.append(el('div',{class:'addleg'},el('span',null,addSwatch('on'),'Start'),el('span',null,hnRestSwatch(),'Ziel'),el('span',null,addSwatch('on2'),'fehlt, angetippt')));
    return box;
  }
  const f1=hnFracRects(a,b,'v',d,tr,'on',mw),f2=hnFracRects(c,d,'h',b,tr,'on2',mw);
  const c1=tr?cap(a*d,N):cap(a,b),c2=tr?cap(c*b,N):cap(c,d);
  row.append(hnPart(f1,s.caps?s.caps[0]:c1),hnPart(f2,s.caps?s.caps[1]:c2,mode==='minus'?'−':'+'));
  if(stage===3){
    const p1=a*d,p2=c*b,plus=mode!=='minus',tot=plus?p1+p2:p1;
    const st=(k)=>plus?{on:k<p1,on2:k>=p1&&k<p1+p2}:{on:k<p1,x:k>=p1-p2&&k<p1};
    const r=plus?p1+p2:p1-p2;
    row.append(hnPart(hnCombined(d,b,tot,st,{mw,label:'gemeinsames Raster aus '+N+' Feldern'}),s.caps?s.caps[2]:cap(r,N),'='));
  }
  return box;
}
function hnRestSwatch(){return S_('svg',{viewBox:'0 0 28 16','aria-hidden':'true',focusable:'false'},S_('g',{class:'cell rest'},S_('rect',{x:1,y:1,width:26,height:14})));}

/* ---------- Trick 17 (Hefter S. 5) ----------
   Die Brüche oben (der größte Nenner eingekreist), darunter die Vielfachen mit Haken oder Kreuz je kleinerem Nenner; der Hauptnenner ist eingerahmt.
   fr: Liste [n,d] (oder nur Nenner als Zahlen) · o.upTo: nur so viele Zeilen zeigen (Tipps) */
function trickRow(fr,o){
  o=o||{};
  const list=fr.map(x=>Array.isArray(x)?x:[null,x]),dens=list.map(x=>x[1]),g=Math.max(...dens),steps=trick17Steps(...dens);
  const rest=dens.filter(x=>x!==g);
  const head=el('div',{class:'trhead'},...list.map(x=>el('span',{class:'trf'+(x[1]===g?' big':'')},x[0]==null?el('span',{class:'trd'},String(x[1])):frac(x[0],x[1]))));
  const rows=steps.slice(0,o.upTo||steps.length).map((s,i)=>{
    const last=i===steps.length-1;
    return el('div',{class:'trrow'+(last?' hn':'')},el('span',{class:'trv'},String(s.v)),
      ...s.ok.map((ok,j)=>el('span',{class:'trok '+(ok?'ok':'no'),role:'img','aria-label':ok?rest[j]+' passt':rest[j]+' passt nicht'},icon(ok?'haken':'kreuz'))));
  });
  return el('div',{class:'trick',role:'group','aria-label':'Trick 17: Vielfache von '+g},head,el('div',{class:'trlist'},...rows));
}

/* ---------- Zwei Ganze (M21, H07 „Das gleiche Ganze“): Kuchen und Pizza je ¼, daneben ein gemeinsames Blech ---------- */
function hnWholes(){
  const cake=drawCells('strip',4,null,new Set([0]),{maxW:120,label:'Kuchen in 4 Teile geteilt, 1 gefärbt'});
  const pizza=drawCells('circle',4,null,new Set([0]),{maxW:70,label:'Pizza in 4 Teile geteilt, 1 gefärbt'});
  const blech=drawCells('strip',4,null,new Set([0,1]),{maxW:120,label:'Ein Blech in 4 Teile geteilt, 2 gefärbt'});
  return el('div',{class:'hnwholes'},
    el('div',{class:'hnw'},el('div',{class:'hnwrow'},el('div',{class:'addcol'},cake,el('small',{class:'acap'},'Kuchen')),el('span',{class:'asym'},'+'),el('div',{class:'addcol'},pizza,el('small',{class:'acap'},'Pizza')),el('span',{class:'asym'},'?')),
      el('small',{class:'acap'},'zwei verschiedene Ganze')),
    el('div',{class:'hnw'},blech,el('small',{class:'acap'},'ein Ganzes: zwei Viertel vom selben Blech')));
}

/* ---------- Rechenschlange ----------
   start [n,d], ops [{plus, f:[n,d]}], cells(i) → Knoten im Kästchen i (Eingabe oder Bruch), goal [n,d] im Kopf */
function chainView(start,ops,cells,goal){
  const box=el('div',{class:'hnchain',role:'group','aria-label':'Rechenschlange'});
  box.append(el('div',{class:'hnbox start'},frac(start[0],start[1])));
  ops.forEach((o,i)=>{
    box.append(el('div',{class:'hnarrow'},el('span',{class:'hnop'},hnSign(o.plus),' ',frac(o.f[0],o.f[1])),el('span',{class:'hnar','aria-hidden':'true'},'→')));
    box.append(el('div',{class:'hnbox'},cells(i)));
  });
  if(goal)box.append(el('div',{class:'hnhead',role:'img','aria-label':'Ziel '+goal[0]+'/'+goal[1]},el('small',null,'Ziel'),frac(goal[0],goal[1])));
  return box;
}

/* ---------- Eingaben ---------- */
/* Zähler-Feld über einem Nenner, der vom Feld „Hauptnenner“ abhängt (getN() → Zahl oder null; ▢ solange kein gemeinsamer Nenner da ist) */
function hnNumOver(view,key,getN,label){
  const den=el('span',{class:'den hnN'},'');
  const set=()=>{const N=getN();den.textContent=N?String(N):'▢';den.classList.toggle('empty',!N);};
  set();
  const f=el('span',{class:'frac inp',role:'group','aria-label':label||'Bruch mit dem Hauptnenner'},el('span',{class:'num'},intInput(view,key,label||'Zähler')),den);
  f.refreshDen=set;
  return f;
}
/* gemischte Zahl: Ganze (g.w) und Bruch (g.n, g.d) */
function hnMixedInput(view){
  return el('span',{class:'hnmixed',role:'group','aria-label':'Gemischte Zahl eingeben'},intInput(view,'g.w','Ganze'),fracInput(view,'g'));
}
/* Rechenweg-Block (Kap. 7). t: {terms, signs}; o: {leicht, givenN, mid (Standard wie leicht), resultOnly, mixed}.
   Leicht: Hauptnenner [N] · a/b + c/d = [x]/N + [y]/N · Zwischenschritt ([x] + [y])/N · Ergebnis · gekürzt · Kürzen geht nicht.
   Knifflig: a/b + c/d = [ ]/[ ] + [ ]/[ ] · Ergebnis · gekürzt. Das Feld „gemischte Zahl“ (freiwillig) steht, wenn o.mixed gesetzt ist. */
function addResultH(view,host,t,o){
  o=o||{};
  const d=view.draft,terms=t.terms,signs=t.signs,mid=o.mid!=null?o.mid:!!o.leicht;
  /* P22: Rechenweg in einer Zeile (wie im Hefter), kein zweiter „Weiter“-Knopf: a/b + c/d = □/N + □/N = (□ + □)/N = □/□ = □/□.
     Die Zeile bricht nur zwischen den Gleichheitszeichen um (Handy hoch: zwei Zeilen, Tablet und PC: eine). */
  if(o.resultOnly){addResult(view,host,{});if(o.mixed)host.append(hnMixRow(view));return host;}
  const grp=(...xs)=>el('span',{class:'hnq'},...xs);
  const sg=(i)=>op(signs[i-1]);
  const line=el('div',{class:'hnline'+(terms.length>2?' hn3':''),role:'group','aria-label':'Rechenweg'});
  const left=[];terms.forEach((x,i)=>{if(i)left.push(sg(i));left.push(frac(x[0],x[1]));});
  const nums=[];
  let getN=()=>null;
  if(o.leicht){
    getN=()=>{const N=o.givenN||getInt(d,'N');return hnFits(N,terms)?N:null;};
    if(!o.givenN){
      line.append(grp(el('span',{class:'hnlab'},'Hauptnenner'),intInput(view,'N','Hauptnenner')));
      view.inputs.N.addEventListener('input',()=>nums.forEach(f=>f.refreshDen()));
    }
    const exp=terms.map((_,i)=>hnNumOver(view,'e'+i,getN,'erweiterter Zähler '+(i+1)));
    nums.push(...exp);
    const right=[];exp.forEach((f,i)=>{if(i)right.push(sg(i));right.push(f);});
    line.append(grp(...left),grp(op('='),...right));
    if(mid){
      const den=el('span',{class:'den hnN'},'');
      const z=[];terms.forEach((_,i)=>{if(i)z.push(el('span',{class:'zop','aria-hidden':'true'},signs[i-1]));z.push(intInput(view,'z'+i,'Zähler '+(i+1)+' im Zwischenschritt'));});
      const midF=el('span',{class:'frac inp mid',role:'group','aria-label':'Zwischenschritt: erweiterte Zähler über dem gemeinsamen Nenner'},el('span',{class:'num'},...z),den);
      midF.refreshDen=()=>{const N=getN();den.textContent=N?String(N):'▢';den.classList.toggle('empty',!N);};
      midF.refreshDen();nums.push(midF);
      line.append(grp(op('='),midF));
    }
  }else{
    const right=[];terms.forEach((_,i)=>{if(i)right.push(sg(i));right.push(el('span',{class:'frac inp',role:'group','aria-label':'erweiterter Bruch '+(i+1)},
      el('span',{class:'num'},intInput(view,'e'+i,'Zähler '+(i+1))),el('span',{class:'den'},intInput(view,'e'+i+'d','Nenner '+(i+1)))));});
    line.append(grp(...left),grp(op('='),...right));
  }
  /* Ergebnis und gekürzt in derselben Zeile; „Kürzen geht nicht“ darunter (verrät nichts, steht immer da) */
  const kn=el('button',{type:'button',class:'btn small kn','aria-pressed':String(d.kn===true)},'Kürzen geht nicht');
  kn.disabled=view.locked();
  const rf=fracInput(view,'r'),kf=fracInput(view,'k');
  const sync=()=>kn.setAttribute('aria-pressed',String(d.kn===true));
  kn.addEventListener('click',()=>{
    if(view.locked())return;
    d.kn=d.kn!==true;
    if(d.kn)['k.n','k.d'].forEach(k=>{delete d[k];if(view.inputs[k]){view.inputs[k].value='';view.inputs[k].classList.remove('bad','good');}});
    kn.classList.remove('bad','good');view.save();sync();
  });
  ['k.n','k.d'].forEach(k=>view.inputs[k].addEventListener('input',()=>{if(d.kn){d.kn=false;view.save();sync();}}));
  view.inputs.kn=kn;
  rf.setAttribute('aria-label','Ergebnis');kf.setAttribute('aria-label','gekürzt');
  line.append(grp(op('='),rf),grp(op('='),el('span',{class:'hnk'},kf,el('small',{class:'hnlab'},'gekürzt'))));
  if(o.mixed)line.append(grp(op('='),el('span',{class:'hnk'},hnMixedInput(view),el('small',{class:'hnlab'},'gemischt (freiwillig)'))));
  line.append(grp(kn));
  host.append(line);
  return host;
}
const hnMixRow=(view)=>el('div',{class:'arow hnmixrow'},el('span',{class:'alab'},'gemischte Zahl (freiwillig)'),hnMixedInput(view));
/* Zeile der zugeklappten ersten Etappe: die erweiterten Brüche */
function hnStageSummary(t,d,o){
  const N=o.leicht?(o.givenN||d.N):d.e0d;
  return t.terms.map((_,i)=>(i?t.signs[i-1]+' ':'')+(d['e'+i]||'?')+'/'+(o.leicht?N:(d['e'+i+'d']||'?'))).join(' ');
}

/* ---------- Etappen ----------
   list: [{isDone(), summary()}]; die letzte Etappe hat kein isDone. Eine fertige Etappe klappt zu einer Zeile zusammen (Tipp darauf öffnet sie wieder).
   Rückgabe {boxes, upd(), advance(i)}; onChange(offen) nach jedem Wechsel (z. B. Bild neu zeichnen). */
function hnStages(view,host,list,onChange){
  const d=view.draft,n=list.length;
  const boxes=list.map(()=>el('div',{class:'etappe'})),sums=list.map(()=>el('button',{type:'button',class:'etsum'}));
  const upd=()=>{
    let open=-1;
    for(let i=0;i<n;i++){const done=i<n-1&&!!list[i].isDone();if(open<0&&(!done||d['ed'+i]===true))open=i;}
    if(open<0)open=n-1;
    for(let i=0;i<n;i++){
      boxes[i].hidden=i!==open;sums[i].hidden=!(i<open);
      if(i<open){sums[i].replaceChildren(icon('haken'),el('span',{class:'ets'},list[i].summary()),view.locked()?'':el('span',{class:'etc'},'ändern'));sums[i].disabled=view.locked();}
    }
    if(onChange)onChange(open);
    if(view.changed)view.changed();
  };
  sums.forEach((s,i)=>s.addEventListener('click',()=>{if(view.locked())return;d['ed'+i]=true;view.save();upd();}));
  for(let i=0;i<n;i++)host.append(sums[i],boxes[i]);
  return {boxes,upd,advance(i){d['ed'+i]=false;view.save();upd();}};
}

/* ---------- Antworten zum Antippen (Liste) ----------
   items: [{id, parts:[Text oder Knoten …]}], Entwurf draft[key] = id, Eingaben key+id. onPick(id) nach der Wahl */
function hnChoice(view,host,key,items,label,onPick){
  const d=view.draft,opts=el('div',{class:'opts',role:'radiogroup','aria-label':label||'Antworten'});
  items.forEach((it,i)=>{
    const r=el('input',{type:'radio',name:key+'-'+Math.random().toString(36).slice(2,7),value:it.id});
    r.checked=d[key]===it.id;r.disabled=view.locked();
    r.addEventListener('change',()=>{if(view.locked())return;d[key]=it.id;view.save();if(onPick)onPick(it.id);});
    view.inputs[key+it.id]=r;
    opts.append(el('label',{class:'opt'},r,el('span',{class:'ltr','aria-hidden':'true'},'ABCDE'[i]),el('span',null,...it.parts)));
  });
  host.append(opts);
  return opts;
}
/* Text mit Brüchen: Teile sind Text oder [n,d] */
const hnTxt=(...parts)=>parts.map(x=>Array.isArray(x)?frac(x[0],x[1]):x);

/* ---------- Schmetterling (H14, M22, Erklärung): a/b ± c/d mit zwei Flügeln ----------
   Oben links a · d, oben rechts c · b, unten b · d. o: {a,b,c,d,sign,l,r,n} – l, r, n sind Zahlen, Text oder Eingabefelder (leer: nichts). */
function falterFigure(o){
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','flbg');
  [[12,40,88,64,'fw1'],[12,64,88,40,'fw2']].forEach(([x1,y1,x2,y2,c])=>{
    const ln=document.createElementNS(NS,'line');
    [['x1',x1],['y1',y1],['x2',x2],['y2',y2],['class',c],['vector-effect','non-scaling-stroke']].forEach(([k,v])=>ln.setAttribute(k,v));
    svg.append(ln);
  });
  const cell=(x,cls)=>el('span',{class:'fl '+cls},x==null?'':typeof x==='object'?x:String(x));
  return el('div',{class:'falter',role:'group','aria-label':'Schmetterling: '+o.a+'/'+o.b+' '+o.sign+' '+o.c+'/'+o.d},
    svg,cell(o.l,'fl-l'),cell(o.r,'fl-r'),el('span',{class:'fl-a'},frac(o.a,o.b)),el('span',{class:'fl-o'},o.sign),el('span',{class:'fl-c'},frac(o.c,o.d)),cell(o.n,'fl-n'));
}
