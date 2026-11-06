'use strict';
/* =====================================================================
   Bausteine für „Brüche addieren und subtrahieren“ (Aufgaben R01–R03 in js/rechnen.js)
   addFigure      Bild zu zwei Anteilen am selben Ganzen: Anteil 1 und Anteil 2 in zwei Mustern, ab einem Ganzen weitere Streifen
   addPicBox      zeigt ein Bild sofort oder erst mit dem zweiten Tipp
   addResult      Ergebnis-Block: die Felder „Ergebnis“ und „gekürzt“ und der Knopf „Kürzen geht nicht“ stehen bei JEDER Aufgabe
   addResultCheck Prüfung dazu (kuerzenCheck in math.js): fragt zuerst nach dem Kürzen, dann nach dem Wert, damit nichts verraten wird
   addRows        Zeilen für offene Antworten („+ Zeile“, „Letzte Zeile entfernen“)
   addOpToggle    Rechenzeichen antippen (+ oder −), addNumOver ein Bruch mit festem Nenner und einem Zählerfeld
   Zustände liegen als einfache Daten im Entwurf (view.draft). Jeder Handler beginnt mit view.locked(), danach view.save().
   Anteil 1 und Anteil 2 unterscheiden sich in der Schraffur (nach rechts oder nach links oben), nicht nur in der Farbe.
   ===================================================================== */
const ADD_LEG={plus:['erster Anteil','zweiter Anteil'],minus:['bleibt','wird weggenommen']};

/* Kleines Muster für die Legende (cls: 'on' = Anteil 1, 'on2' = Anteil 2) */
function addSwatch(cls){
  return S_('svg',{viewBox:'0 0 28 16','aria-hidden':'true',focusable:'false'},S_('g',{class:'cell '+cls},S_('rect',{x:1,y:1,width:26,height:14})));
}
function addLegend(mode){
  const L=ADD_LEG[mode]||ADD_LEG.plus;
  return el('div',{class:'addleg'},el('span',null,addSwatch('on'),L[0]),el('span',null,addSwatch('on2'),L[1]));
}
/* Ein Ganzes als Streifen mit Zellen (bis Nenner 24): die ersten c1 Teile in Muster 1, die Teile bis e2 in Muster 2 */
function addCells(d,c1,e2,o){
  const filled=new Set();
  for(let i=0;i<e2;i++)filled.add(i);
  const svg=drawCells('strip',d,null,filled,{maxW:2000,h:o.h||34,label:'Streifen aus '+d+' Teilen, '+c1+' im ersten Muster, '+(e2-c1)+' im zweiten'});
  const cells=svg.querySelectorAll('g.cell');
  for(let i=c1;i<e2;i++){cells[i].classList.remove('on');cells[i].classList.add('on2');}
  return svg;
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
/* Bild zu zwei Anteilen p1 und p2 (Zähler) mit dem Nenner d. Ein Streifen ist ein Ganzes; reichen die Anteile darüber hinaus, folgt ein zweiter Streifen.
   o.mode 'plus' (zwei Anteile) oder 'minus' (Anteil 2 wird weggenommen: gefärbt ist das Ganze, das Weggenommene im zweiten Muster) · o.noLegend · o.h (Höhe) */
function addFigure(d,p1,p2,o){
  o=o||{};
  const wholes=Math.max(1,Math.ceil((p1+p2)/d));
  if(!o.h&&wholes>1)o=Object.assign({},o,{h:24}); /* zwei Streifen untereinander: flacher, damit die Aufgabe ohne Scrollen passt */
  const box=el('div',{class:'addfig',role:'group','aria-label':o.label||('Bild: '+p1+' und '+p2+' von '+d+' gleich großen Teilen')});
  for(let k=0;k<wholes;k++){
    const lo=k*d,c1=Math.max(0,Math.min(d,p1-lo)),e2=Math.max(c1,Math.min(d,p1+p2-lo));
    box.append(d<BAR_FROM?addCells(d,c1,e2,o):addBar(d,c1,e2,o));
  }
  if(!o.noLegend)box.append(addLegend(o.mode));
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

/* ---------- Ergebnis-Block ----------
   Immer zwei Felder und ein Knopf, bei jeder Aufgabe in gleicher Größe und an gleicher Stelle: so verrät das Aussehen nie, ob sich ein Ergebnis kürzen lässt.
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
    el('div',{class:'arow'},el('span',{class:'alab'},o.label||'Ergebnis'),rf),
    el('div',{class:'arow'},el('span',{class:'alab'},'gekürzt'),kf),
    kn));
}
const ADD_KMSG_EMPTY='Prüfe noch: Lässt sich das Ergebnis kürzen? Trage den gekürzten Bruch ein oder tippe „Kürzen geht nicht“.';
/* Prüft „Ergebnis“ und „gekürzt“ gegen res = [Zähler, Nenner] (ungekürzt). diag(x,y) darf für ein falsches Ergebnis {code,msg} liefern.
   Rückgabe: null, wenn beides stimmt, sonst die Antwort (invalid, wrong oder soft). Die Meldungen zum Kürzen sind bei jeder Aufgabe gleich und kommen erst nach der Eingabe. */
function addResultCheck(res,d,diag){
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
/* Bild für eine Erklärkarte (intro.js, Schritt-Feld add: {d,p1,p2,mode}) */
function introAddNode(spec){
  return el('div',{class:'introfigs addintro'},addFigure(spec.d,spec.p1,spec.p2,{mode:spec.mode,label:spec.label}));
}
