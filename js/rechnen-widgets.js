'use strict';
/* =====================================================================
   Bausteine für „Brüche addieren und subtrahieren“ (Aufgaben R01–R03 in js/rechnen.js)
   addFigure      Bild zu zwei Anteilen am selben Ganzen wie an der Tafel: ein Raster (Rechteck aus Feldern), Anteil 1 und Anteil 2 in zwei Mustern, bei minus das Weggenommene durchgekreuzt;
                  über ein Ganzes hinaus ein zweites Raster, ab Nenner 25 ein glatter Balken
   addPicBox      zeigt ein Bild sofort oder erst mit dem zweiten Tipp
   addReadStage   „Lies die Brüche am Bild ab“: zwei Brüche und das Rechenzeichen, dann „Weiter“ (erste Stufe von R01 bild)
   addResult      Rechenweg-Block: Zeile „Zwischenschritt“ (nur Leicht, siehe addMid), die Felder „Ergebnis“ und „gekürzt“ und der Knopf „Kürzen geht nicht“ stehen bei JEDER Aufgabe
   addResultCheck Prüfung dazu: erst der Zwischenschritt, dann (kuerzenCheck in math.js) das Kürzen vor dem Wert, damit nichts verraten wird
   addRows        Zeilen für offene Antworten („+ Zeile“, „Letzte Zeile entfernen“)
   addOpToggle    Rechenzeichen antippen (+ oder −), addNumOver ein Bruch mit festem Nenner und einem Zählerfeld
   Zustände liegen als einfache Daten im Entwurf (view.draft). Jeder Handler beginnt mit view.locked(), danach view.save().
   Anteil 1 und Anteil 2 unterscheiden sich in der Schraffur (nach rechts oder nach links oben), nicht nur in der Farbe.
   ===================================================================== */
const ADD_LEG={plus:['erster Anteil','zweiter Anteil'],minus:['bleibt','wird weggenommen']};
const ADD_LEG_X=['gefärbt','durchgekreuzt: wird weggenommen']; /* Raster bei minus: alles Gefärbte ist der Anfang, die Kreuze sind das Weggenommene (wie an der Tafel) */

/* Kleines Muster für die Legende (cls: 'on' = Anteil 1, 'on2' = Anteil 2; cross: mit Kreuz) */
function addSwatch(cls,cross){
  return S_('svg',{viewBox:'0 0 28 16','aria-hidden':'true',focusable:'false'},S_('g',{class:'cell '+cls},S_('rect',{x:1,y:1,width:26,height:14})),
    cross?S_('path',{class:'xmark',d:'M8 3L20 13M8 13L20 3'}):null);
}
function addLegend(mode,grid){
  if(mode==='minus'&&grid)return el('div',{class:'addleg'},el('span',null,addSwatch('on'),ADD_LEG_X[0]),el('span',null,addSwatch('on',true),ADD_LEG_X[1]));
  const L=ADD_LEG[mode]||ADD_LEG.plus;
  return el('div',{class:'addleg'},el('span',null,addSwatch('on'),L[0]),el('span',null,addSwatch('on2'),L[1]));
}
/* Raster: ein Rechteck aus Reihen × Spalten (gridDims in viz.js; Primzahlen wie 5 oder 7 sind eine Reihe, wie die fünf Spalten an der Tafel) */
const addDims=(d)=>gridDims(d)||[1,d];
const addCellPx=(rows)=>Math.max(18,Math.min(30,Math.floor(84/rows))); /* so groß erscheint ein Feld auf dem Bildschirm (Pixel): ein Raster ist höchstens etwa 84 Pixel hoch */
/* Feste Mischung der Felder (kein Zufall beim Zeichnen: dasselbe Bild bleibt beim erneuten Zeichnen gleich) */
function addPerm(d,seed){
  const idx=Array.from({length:d},(_,i)=>i);
  let s=((seed*2654435761)>>>0)||1;
  for(let i=d-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[idx[i],idx[j]]=[idx[j],idx[i]];}
  return idx;
}
/* Ein Ganzes als Raster: die ersten c1 Felder in Muster 1, die Felder bis e2 in Muster 2 (bei minus: Muster 1 mit Kreuz).
   o.scatter verteilt die Felder im Raster (Teilflächen liegen nicht nebeneinander) */
function addGrid(d,c1,e2,o,k){
  const dims=addDims(d),[rows,cols]=dims,cs=Math.min(48,360/cols),minus=o.mode==='minus';
  const order=o.scatter?addPerm(d,(o.seed||d*31+c1*7+e2)+k*101):Array.from({length:d},(_,i)=>i);
  const maxW=Math.round((cols*cs+2)*addCellPx(rows)/cs);
  const svg=drawCells('grid',d,dims,new Set(order.slice(0,e2)),{maxW,label:'Raster aus '+d+' Feldern, '+(minus?(e2-c1)+' durchgekreuzt, '+c1+' nicht':c1+' im ersten Muster, '+(e2-c1)+' im zweiten')});
  const cells=svg.querySelectorAll('g.cell');
  order.slice(c1,e2).forEach(i=>{
    if(!minus){cells[i].classList.remove('on');cells[i].classList.add('on2');return;}
    const r=Math.floor(i/cols),c=i%cols,x=1+c*cs,y=1+r*cs,p=cs*0.22;
    svg.append(S_('path',{class:'xmark',d:`M${x+p} ${y+p}L${x+cs-p} ${y+cs-p}M${x+p} ${y+cs-p}L${x+cs-p} ${y+p}`}));
  });
  const wrap=el('div',{class:'addgridw'});
  wrap.style.setProperty('--gw',(maxW/16).toFixed(3)+'rem'); /* Breite des Rasters; auf niedrigen Bildschirmen etwas kleiner (app.css) */
  wrap.append(svg);
  return wrap;
}
/* Ab Nenner 25 ein glatter Balken in zwei Stücken (Zellen würden zu schmal) */
function addBar(d,c1,e2,o){
  const sh=o.h||34,w1=360*c1/d,w2=360*(e2-c1)/d;
  const svg=S_('svg',{viewBox:'0 0 362 '+(sh+2),class:'fracsvg addbar',role:'img','aria-label':'Balken, '+c1+' von '+d+' im ersten Muster, '+(e2-c1)+' im zweiten'});
  svg.style.maxWidth=(2000/16).toFixed(3)+'rem';
  if(w1>0)svg.append(S_('rect',{class:'seg1',x:1,y:1,width:w1,height:sh}));
  if(w2>0)svg.append(S_('rect',{class:'seg2',x:1+w1,y:1,width:w2,height:sh}));
  if(w1>0&&w2>0)svg.append(S_('line',{class:'sep',x1:1+w1,x2:1+w1,y1:1,y2:1+sh}));
  svg.append(S_('rect',{class:'barframe',x:1,y:1,width:360,height:sh}));
  return svg;
}
/* Bild zu zwei Anteilen p1 und p2 (Zähler) mit dem Nenner d, wie an der Tafel: ein Ganzes ist ein Raster (bis Nenner 24), darüber ein glatter Balken.
   Reichen die Anteile über ein Ganzes hinaus, folgt ein zweites Raster daneben (oder ein zweiter Balken darunter).
   o.mode 'plus' (zwei Anteile in zwei Mustern) oder 'minus' (Raster: das Ganze ist gefärbt, das Weggenommene ist durchgekreuzt; Balken: Weggenommenes im zweiten Muster)
   o.scatter verteilt die Felder im Raster · o.seed für die Verteilung · o.noLegend · o.h (Höhe der Balken) */
function addFigure(d,p1,p2,o){
  o=o||{};
  const wholes=Math.max(1,Math.ceil((p1+p2)/d)),grid=d<BAR_FROM;
  if(!grid&&!o.h&&wholes>1)o=Object.assign({},o,{h:24}); /* zwei Balken untereinander: flacher, damit die Aufgabe ohne Scrollen passt */
  const box=el('div',{class:'addfig',role:'group','aria-label':o.label||('Bild: '+p1+' und '+p2+' von '+d+' gleich großen Teilen')});
  const rows=grid?el('div',{class:'addgrids'}):box;
  for(let k=0;k<wholes;k++){
    const lo=k*d,c1=Math.max(0,Math.min(d,p1-lo)),e2=Math.max(c1,Math.min(d,p1+p2-lo));
    rows.append(grid?addGrid(d,c1,e2,o,k):addBar(d,c1,e2,o));
  }
  if(grid)box.append(rows);
  if(!o.noLegend)box.append(addLegend(o.mode,grid));
  return box;
}
/* Bild sofort (always) oder erst mit dem zweiten Tipp; build liefert den Knoten */
function addPicBox(view,host,build,always){
  const box=el('div');host.append(box);
  const draw=()=>{
    const on=always||(view.st&&view.st.hint>=2);
    box.replaceChildren(...(on?[build()]:[]));
    view.changed();
  };
  const prev=view.onHint;
  view.onHint=()=>{if(prev)prev();draw();};
  draw();
}

/* ---------- Erste Stufe: Brüche am Bild ablesen ----------
   Zwei Brüche mit dem Rechenzeichen dazwischen (Entwurf u.n u.d, v.n v.d, op) und der Knopf „Weiter“ (Entwurf s1 = true). onNext klappt die Stufe zu (twoStage). */
function addReadStage(view,host,onNext){
  const d=view.draft;
  const row=el('div',{class:'addrow addread'},fracInput(view,'u'),addOpToggle(view,'op'),fracInput(view,'v'));
  const go=el('button',{type:'button',class:'btn small'},'Weiter zum Rechenweg');
  const full=()=>!!getFrac(d,'u')&&!!getFrac(d,'v')&&(d.op==='+'||d.op==='−');
  const upd=()=>{go.disabled=view.locked()||!full();};
  row.addEventListener('input',upd);row.addEventListener('click',upd);
  go.addEventListener('click',()=>{if(view.locked()||!full())return;d.s1=true;view.save();onNext();});
  host.append(row,go);upd();
}
const addReadText=(d)=>d['u.n']+'/'+d['u.d']+' '+d.op+' '+d['v.n']+'/'+d['v.d'];

/* ---------- Zwischenschritt ----------
   ( Zähler ± Zähler ) über einem Nenner, wie an der Tafel: (8 + 3) / 12. Entwurf z1, z2, zn. Nur in Leicht (Gerüst), in Knifflig fällt die Zeile weg. */
function addMid(view,sign){
  return el('span',{class:'frac inp mid',role:'group','aria-label':'Zwischenschritt: zwei Zähler über einem Nenner'},
    el('span',{class:'num'},intInput(view,'z1','erster Zähler'),el('span',{class:'zop','aria-hidden':'true'},sign),intInput(view,'z2','zweiter Zähler')),
    el('span',{class:'den'},intInput(view,'zn','Nenner')));
}
const ADD_MID_EMPTY='Fülle zuerst den Zwischenschritt aus: die beiden Zähler über dem Bruchstrich und darunter den Nenner.';
/* m = {a,c,b,plus} der Aufgabe a/b ± c/b. Rückgabe null (richtig) oder die Antwort (invalid oder wrong, Markierung nur am Zwischenschritt) */
function addMidCheck(m,d){
  if(['z1','z2','zn'].some(k=>d[k]==null||d[k]===''))return invalid(ADD_MID_EMPTY);
  const z1=getInt(d,'z1'),z2=getInt(d,'z2'),zn=getInt(d,'zn');
  if(z1===null||z2===null||zn===null)return invalid(ADD_MID_EMPTY);
  const pairOk=(z1===m.a&&z2===m.c)||(m.plus&&z1===m.c&&z2===m.a),nOk=zn===m.b;
  if(pairOk&&nOk)return null;
  const marks={};
  if(!pairOk){marks.z1=false;marks.z2=false;}
  if(!nOk){
    marks.zn=false;
    return wrong(zn===2*m.b?'nennerAddiert':'zwischenNenner',zn===2*m.b?'Der Nenner wird nicht mitgerechnet. Er bleibt gleich.':'Der Nenner steht schon in der Aufgabe. Er bleibt gleich.',marks);
  }
  if(!m.plus&&z1===m.c&&z2===m.a)return wrong('vertauscht','Beim Subtrahieren kommt der erste Zähler zuerst.',marks);
  return wrong('zahl','Über den Bruchstrich kommen die beiden Zähler aus der Aufgabe.',marks);
}

/* ---------- Rechenweg-Block ----------
   Immer zwei Felder und ein Knopf, bei jeder Aufgabe in gleicher Größe und an gleicher Stelle: so verrät das Aussehen nie, ob sich ein Ergebnis kürzen lässt.
   o.mid ('+' oder '−'): davor die Zeile Zwischenschritt (Entwurf z1, z2, zn), nur in Leicht.
   Entwurf: r.n, r.d (Ergebnis), k.n, k.d (gekürzt), kn (true = „Kürzen geht nicht“). Tippt das Kind in „gekürzt“, geht der Knopf wieder aus; der Knopf leert „gekürzt“. */
function addResult(view,host,o){
  o=o||{};
  const d=view.draft;
  const kn=el('button',{type:'button',class:'btn small kn','aria-pressed':String(d.kn===true)},'Kürzen geht nicht');
  kn.disabled=view.locked();
  const rf=fracInput(view,'r'),kf=fracInput(view,'k');
  const sync=()=>kn.setAttribute('aria-pressed',String(d.kn===true));
  kn.addEventListener('click',()=>{
    if(view.locked())return;
    d.kn=d.kn!==true;
    if(d.kn)['k.n','k.d'].forEach(k=>{delete d[k];if(view.inputs[k]){view.inputs[k].value='';view.inputs[k].classList.remove('bad','good');}});
    kn.classList.remove('bad','good');
    view.save();sync();
  });
  ['k.n','k.d'].forEach(k=>view.inputs[k].addEventListener('input',()=>{if(d.kn){d.kn=false;view.save();sync();}}));
  view.inputs.kn=kn;
  host.append(el('div',{class:'addres',role:'group','aria-label':'Antwort'},
    el('div',{class:'afields'},
      o.mid?el('div',{class:'arow amid'},el('span',{class:'alab'},'Zwischenschritt'),addMid(view,o.mid)):null,
      el('div',{class:'arow'},el('span',{class:'alab'},o.label||'Ergebnis'),rf),
      el('div',{class:'arow'},el('span',{class:'alab'},'gekürzt'),kf)),
    kn));
}
const ADD_KMSG_EMPTY='Prüfe noch: Lässt sich das Ergebnis kürzen? Trage den gekürzten Bruch ein oder tippe „Kürzen geht nicht“.';
/* Prüft „Ergebnis“ und „gekürzt“ gegen res = [Zähler, Nenner] (ungekürzt). diag(x,y) darf für ein falsches Ergebnis {code,msg} liefern.
   mid = {a,c,b,plus}: auch der Zwischenschritt wird geprüft, und zwar zuerst (nur in Leicht übergeben).
   Rückgabe: null, wenn alles stimmt, sonst die Antwort (invalid, wrong oder soft). Die Meldungen zum Kürzen sind bei jeder Aufgabe gleich und kommen erst nach der Eingabe. */
function addResultCheck(res,d,diag,mid){
  if(mid){const m=addMidCheck(mid,d);if(m)return m;}
  const kid={r:getFrac(d,'r'),k:getFrac(d,'k'),kn:d.kn===true};
  if(!kid.k&&(d['k.n']!=null&&d['k.n']!==''||d['k.d']!=null&&d['k.d']!==''))return invalid(MSG_FRAC_INVALID);
  const code=kuerzenCheck(res,kid);
  const mr={'r.n':false,'r.d':false},mk={'k.n':false,'k.d':false};
  switch(code){
    case null:return null;
    case 'leer':return invalid(MSG_FRAC_INVALID);
    case 'kuerzenLeer':return invalid(ADD_KMSG_EMPTY);
    case 'wert':{const g=diag?diag(kid.r.n,kid.r.d):null;return wrong(g?g.code:'wert',g?g.msg:'Das Ergebnis stimmt noch nicht. Rechne noch einmal.',mr);}
    case 'keinKuerzen':return soft('keinKuerzen','Dein Ergebnis stimmt. Es lässt sich aber noch kürzen. Suche eine Zahl, durch die Zähler und Nenner teilbar sind.',{kn:false});
    case 'kuerzenWert':return soft('kuerzenWert','Dein Ergebnis stimmt. Der gekürzte Bruch hat aber einen anderen Wert. Teile Zähler und Nenner durch dieselbe Zahl.',mk);
    default:return soft('nochKuerzen','Dein Ergebnis stimmt. Du kannst noch weiter kürzen.',mk);
  }
}

/* ---------- Zeilen für offene Antworten ---------- */
/* o.key: Schlüssel der Zeilenzahl im Entwurf (Standard 'rows') · o.start, o.max · o.word (Standard 'Zeile') ·
   o.row(i) baut Zeile i · o.drop(i) nennt die Entwurfsschlüssel von Zeile i (werden beim Entfernen gelöscht) */
function addRows(view,host,o){
  const d=view.draft,key=o.key||'rows',max=o.max||6,word=o.word||'Zeile';
  if(d[key]==null)d[key]=o.start||2;
  const list=el('div',{class:'addrows'}),btns=el('div',{class:'rowbtns'});
  const draw=()=>{list.replaceChildren(...Array.from({length:d[key]},(_,i)=>o.row(i)));};
  const add=el('button',{type:'button',class:'btn small'},'+ '+word);
  const rem=el('button',{type:'button',class:'btn small','aria-label':'Letzte '+word+' entfernen'},'Letzte entfernen');
  const upd=()=>{add.disabled=view.locked()||d[key]>=max;rem.disabled=view.locked()||d[key]<=1;};
  add.addEventListener('click',()=>{if(view.locked()||d[key]>=max)return;d[key]++;view.save();draw();upd();view.changed();});
  rem.addEventListener('click',()=>{
    if(view.locked()||d[key]<=1)return;
    const i=d[key]-1;(o.drop?o.drop(i):[]).forEach(k=>{delete d[k];});
    d[key]--;view.save();draw();upd();view.changed();
  });
  view.inputs.add=add;view.inputs.rem=rem;
  btns.append(add,rem);host.append(list,btns);draw();upd();
}
/* Rechenzeichen antippen: ? → + → − → + … Entwurf draft[key] = '+' | '−' */
function addOpToggle(view,key){
  const d=view.draft;
  const b=el('button',{type:'button',class:'btn opbtn'},d[key]||'?');
  const aria=()=>b.setAttribute('aria-label','Rechenzeichen: '+(d[key]==='+'?'plus':d[key]==='−'?'minus':'noch nicht gewählt'));
  b.disabled=view.locked();
  b.addEventListener('click',()=>{
    if(view.locked())return;
    d[key]=d[key]==='+'?'−':'+';b.textContent=d[key];b.classList.remove('bad','good');aria();view.save();
  });
  aria();view.inputs[key]=b;
  return b;
}
/* Ein Bruch mit festem Nenner N und einem Feld für den Zähler (Eingabe key) */
function addNumOver(view,key,N,label){
  return el('span',{class:'frac inp',role:'group','aria-label':'Bruch mit dem Nenner '+N},el('span',{class:'num'},intInput(view,key,label||'Zähler')),el('span',{class:'den'},String(N)));
}
/* Rechenweg wie an der Tafel: a/b ± c/b = (a ± c)/b = Ergebnis (= gekürzt, wenn es sich kürzen lässt) */
function addChain(a,c,b,plus){
  const sg=plus?'+':'−',n=plus?a+c:a-c,g=gcd(n,b);
  return eq(frac(a,b),sg,frac(c,b),'=',frac(a+' '+sg+' '+c,b),'=',frac(n,b),...(g>1?['=',frac(n/g,b/g)]:[]));
}
/* Bild für eine Erklärkarte (intro.js, Schritt-Feld add: {d,p1,p2,mode}); chain: dazu der Rechenweg (bei plus p1 + p2, bei minus (p1 + p2) − p2), nofig: nur der Rechenweg ohne Bild */
function introAddNode(spec){
  const plus=spec.mode!=='minus',a=plus?spec.p1:spec.p1+spec.p2;
  return el('div',{class:'introfigs addintro'},spec.nofig?null:addFigure(spec.d,spec.p1,spec.p2,{mode:spec.mode,label:spec.label}),spec.chain?addChain(a,spec.p2,spec.d,plus):null);
}
