'use strict';
/* =====================================================================
   Bausteine der Etappe V „Brüche vervielfachen und teilen“ (Stationen in js/vervielfachen.js)
   vtStrips       Bruchstreifen: a/b n-mal aneinandergelegt, jedes Ganze ein eigener, gleich langer Streifen untereinander; die Kopien wechseln das Muster
   vtLayer        Streifen-Kopierer zum Antippen („a/b dazulegen“, „Zurücknehmen“), Entwurf draft.cp = Zahl der Kopien
   vtRect         Rechteck („Blechpizza“): b Spalten, a gefärbt; nach dem Schnitt n Zeilen. Antippen markiert ein Feld als „ein Anteil“ (Muster 2)
   vtCutWidget    Schnitt-Knöpfe (in 2, 3, 4 Stücke) und das antippbare Rechteck, Entwurf draft.cut, draft.sel = markierte Felder
   vtGroupWidget  Streifen in b Teilen, a gefärbt; das Kind ordnet jedes gefärbte Teil einer Gruppe (Kind 1 … n) zu, Entwurf draft.grp
   vtCircles      Torten (Kreise) zum Färben, Entwurf draft.cs = gefärbte Sektoren (Index über alle Kreise)
   vtResultBlock  Rechenweg wie im Hefter: a/b · n = (□ · □)/□ = □/□ = □/□ gekürzt (= □ □/□ gemischt, freiwillig), „Kürzen geht nicht“
   vtResultCheck  Prüfung dazu: erst der Zwischenschritt (Leicht), dann Kürzen vor dem Wert (verrät nichts), dann die gemischte Zahl
   vtOrder        Brüche durch Antippen ordnen (kleinster zuerst), Entwurf draft.ord
   Alle Zustände liegen als einfache Daten im Entwurf (view.draft). Jeder Handler beginnt mit view.locked(), danach view.save().
   Mehrere Ganze sind immer gleich lang; gefärbte Felder tragen zusätzlich ein Muster (Farbe trägt nicht allein).
   ===================================================================== */
const VT_CELL=44;      /* Pixel je Feld bei 375 px Breite (Antippfläche ≥ 44 px) */
const VT_MAXCELLS=12;  /* höchstens so viele Felder im Bild */

/* ---------- Bruchstreifen ---------- */
/* copies Kopien von a/b auf Ganzen der Länge b. o: {rows (Zahl der Ganzen), maxW, cap} */
function vtStrips(a,b,copies,o){
  o=o||{};
  const total=a*copies,rows=Math.max(1,o.rows||Math.ceil(total/b)),box=el('div',{class:'vtstrips',role:'img',
    'aria-label':rows+(rows===1?' Ganzes':' Ganze')+' in je '+b+' Teilen, '+total+' Teile gefärbt'+(copies>1?', '+copies+' Stücke zu je '+a+' Teilen':'')});
  const maxW=o.maxW||Math.min(300,b*VT_CELL+2);
  for(let r=0;r<rows;r++){
    const on=new Set();for(let i=0;i<b;i++)if(r*b+i<total)on.add(i);
    const svg=drawCells('strip',b,null,on,{maxW,h:44,label:'Ganzes '+(r+1)});
    svg.removeAttribute('role');svg.setAttribute('aria-hidden','true');
    svg.querySelectorAll('g.cell').forEach((g,i)=>{const k=r*b+i;if(k<total&&Math.floor(k/a)%2===1){g.classList.remove('on');g.classList.add('on2');}});
    box.append(el('div',{class:'vtrow'},svg,o.cap===false?null:el('small',{class:'vtcap'},'1 Ganzes')));
  }
  return box;
}
/* Streifen-Kopierer: Knöpfe „a/b dazulegen“ und „Zurücknehmen“; max: höchstens so viele Kopien; onChange nach jeder Änderung */
function vtLayer(view,host,t,o){
  o=o||{};
  const d=view.draft,max=o.max||Math.floor(VT_MAXCELLS/t.a),rows=o.rows||Math.ceil(t.a*max/t.b);
  const fig=el('div',{class:'vtfig'}),count=el('p',{class:'vtcount','aria-live':'polite'});
  const add=el('button',{type:'button',class:'btn small'},icon('plus'),el('span',null,frac(t.a,t.b),' dazulegen'));
  const undo=el('button',{type:'button',class:'btn small'},icon('undo'),'Zurücknehmen');
  const draw=()=>{
    const c=d.cp||0;
    fig.replaceChildren(vtStrips(t.a,t.b,c,{rows}));
    count.textContent=c===1?'1 Stück gelegt':c+' Stücke gelegt';
    add.disabled=view.locked()||c>=max;undo.disabled=view.locked()||c<1;
    if(o.onChange)o.onChange(c);
    if(view.changed)view.changed();
  };
  add.addEventListener('click',()=>{if(view.locked())return;d.cp=Math.min(max,(d.cp||0)+1);view.save();draw();});
  undo.addEventListener('click',()=>{if(view.locked())return;d.cp=Math.max(0,(d.cp||0)-1);view.save();draw();});
  view.inputs.cp=fig;
  host.append(fig);(o.ctl||host).append(el('div',{class:'rowbtns'},add,undo),count); /* o.ctl: Knöpfe an anderer Stelle (Etappe 1), das Bild bleibt stehen */
  draw();
  return {draw};
}

/* ---------- Rechteck (Blechpizza) ---------- */
/* b Spalten, rows Zeilen (1 = noch nicht geschnitten), a Spalten gefärbt; sel: markierte Felder (Muster 2); onTap(i) macht die Felder antippbar */
function vtRect(a,b,rows,sel,o){
  o=o||{};
  const d=b*rows,on=new Set();
  for(let i=0;i<d;i++)if(i%b<a)on.add(i);
  const svg=drawCells('grid',d,[rows,b],on,{maxW:Math.min(300,b*VT_CELL+2),onToggle:o.onTap?(i)=>{o.onTap(i);}:null,
    label:'Rechteck mit '+d+' Feldern, '+on.size+' gefärbt'+(sel&&sel.size?', '+sel.size+' markiert':'')});
  const cells=svg.querySelectorAll('g.cell');
  (sel||new Set()).forEach(i=>{if(cells[i]){cells[i].classList.remove('on');cells[i].classList.add('on2');}});
  if(o.onTap)cells.forEach((g,i)=>{g.setAttribute('aria-label','Feld '+(i+1)+(on.has(i)?', gefärbt':'')+(sel&&sel.has(i)?', markiert':''));g.setAttribute('aria-pressed',String(!!(sel&&sel.has(i))));});
  return el('div',{class:'vtrect'},svg);
}
/* Schnitt und Markieren: Stufe 1 „Schneide jedes Teil in … Stücke“ (Knöpfe 2, 3, 4), Stufe 2 ein Anteil antippen. Entwurf: cut (Zahl), sel (Feldnummern) */
function vtCutWidget(view,host,t){
  const d=view.draft,fig=el('div',{class:'vtfig'}),btns=el('div',{class:'vtcut',role:'group','aria-label':'Schneide jedes Teil in Stücke'});
  const info=el('p',{class:'vtcount','aria-live':'polite'});
  const selOf=()=>new Set(Array.isArray(d.sel)?d.sel:[]);
  const draw=()=>{
    const rows=d.cut||1,sel=selOf();
    fig.replaceChildren(vtRect(t.a,t.b,rows,sel,{onTap:view.locked()||!d.cut?null:(i)=>{
      if(view.locked())return;
      const s=selOf();if(s.has(i))s.delete(i);else if(i%t.b<t.a)s.add(i);else return;
      d.sel=[...s].sort((x,y)=>x-y);view.save();draw();
    }}));
    btns.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.k)===d.cut)));
    info.textContent=d.cut?(sel.size===1?'1 Feld markiert':sel.size+' Felder markiert'):'Noch nicht geschnitten';
    if(view.changed)view.changed();
  };
  [2,3,4].forEach(k=>{
    const b=el('button',{type:'button',class:'btn small','data-k':String(k),'aria-pressed':String(d.cut===k)},'in '+k);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{if(view.locked())return;d.cut=k;d.sel=[];view.save();draw();});
    view.inputs['cut'+k]=b;btns.append(b);
  });
  view.inputs.sel=fig;
  host.append(el('p',null,strong('1. Schneide jedes Teil in Stücke. Markiere, was ein Kind bekommt.')),btns,fig,info);
  draw();
}

/* ---------- Gruppen bilden (gerecht verteilen) ---------- */
/* Streifen in b Teilen, die ersten a gefärbt. Entwurf grp: Liste der Gruppe je gefärbtem Teil (0 = keine), cur: aktive Gruppe */
function vtGroupWidget(view,host,t){
  const d=view.draft;
  if(!Array.isArray(d.grp)||d.grp.length!==t.a)d.grp=Array(t.a).fill(0);
  if(!(d.gcur>=1&&d.gcur<=t.n))d.gcur=1;
  const chips=el('div',{class:'yesno vtgchips',role:'group','aria-label':'Kind wählen'}),fig=el('div',{class:'vtfig'}),info=el('p',{class:'vtcount','aria-live':'polite'});
  const draw=()=>{
    chips.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.g)===d.gcur)));
    const svg=drawCells('strip',t.b,null,new Set(Array.from({length:t.a},(_,i)=>i)),{maxW:Math.min(300,t.b*VT_CELL+2),h:44,
      onToggle:view.locked()?null:(i)=>{if(view.locked()||i>=t.a)return;d.grp[i]=d.grp[i]===d.gcur?0:d.gcur;view.save();draw();},label:'Streifen mit '+t.b+' Teilen'});
    svg.querySelectorAll('g.cell').forEach((g,i)=>{
      if(i>=t.a){g.removeAttribute('role');g.removeAttribute('tabindex');return;}
      const k=d.grp[i];
      if(k){g.classList.add('vtg','vtg'+k);const r=g.firstChild,x=+r.getAttribute('x')+(+r.getAttribute('width'))/2;
        g.append(S_('text',{class:'vtgn',x,y:30,'text-anchor':'middle'},String(k)));}
      g.setAttribute('aria-label','Teil '+(i+1)+(k?', Kind '+k:', noch keinem Kind'));
    });
    fig.replaceChildren(svg);
    const per=Array.from({length:t.n},(_,k)=>d.grp.filter(x=>x===k+1).length);
    info.textContent=per.map((c,k)=>'Kind '+(k+1)+': '+c).join(' · ');
    if(view.changed)view.changed();
  };
  for(let k=1;k<=t.n;k++){
    const b=el('button',{type:'button',class:'btn yn vtgc vtg'+k,'data-g':String(k)},'Kind '+k);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{if(view.locked())return;d.gcur=k;view.save();draw();});
    chips.append(b);
  }
  view.inputs.grp=fig;
  host.append(el('p',null,strong('1. Wähle ein Kind. Tippe dann seine Teile an.')),chips,fig,info);
  draw();
}

/* ---------- Torten (Kreise) ---------- */
/* k Kreise zu je d Sektoren; Entwurf cs = gefärbte Sektoren (Index über alle Kreise); readOnly: nur zeigen (on = Set) */
function vtCircles(view,host,d,k,o){
  o=o||{};
  const D=view?view.draft:{},box=el('div',{class:'vtcircles'});
  const draw=()=>{
    const on=o.on||new Set(Array.isArray(D.cs)?D.cs:[]);
    box.replaceChildren();
    for(let c=0;c<k;c++){
      const mine=new Set();for(let i=0;i<d;i++)if(on.has(c*d+i))mine.add(i);
      const svg=drawCells('circle',d,null,mine,{maxW:o.maxW||150,label:'Torte '+(c+1)+' in '+d+' Stücken, '+mine.size+' gefärbt',
        onToggle:view&&!o.on&&!view.locked()?(i)=>{if(view.locked())return;const s=new Set(Array.isArray(D.cs)?D.cs:[]),j=c*d+i;if(s.has(j))s.delete(j);else s.add(j);D.cs=[...s].sort((x,y)=>x-y);view.save();draw();}:null});
      svg.style.width=((o.maxW||150)/16).toFixed(3)+'rem';
      box.append(svg);
    }
    if(view&&view.changed)view.changed();
  };
  if(view)view.inputs.cs=box;
  host.append(box);
  draw();
  return {draw};
}

/* ---------- Rechenweg ---------- */
/* Kopf der Rechnung: a/b · n oder w a/b · n */
const vtHead=(t)=>[t.w?mixed(t.w,t.a,t.b):frac(t.a,t.b),op(vtSign(t.op)),String(t.n)];
/* o: {mid (Zwischenschritt, Leicht), mixed (Feld „gemischt (freiwillig)“), noHead (Kopf steht schon in der Aufgabe)} */
function vtResultBlock(view,host,t,o){
  o=o||{};
  const d=view.draft,grp=(...xs)=>el('span',{class:'hnq'},...xs);
  const line=el('div',{class:'hnline',role:'group','aria-label':'Rechenweg'});
  if(!o.noHead)line.append(grp(...vtHead(t)));
  if(o.mid){
    const zop=(s)=>el('span',{class:'zop','aria-hidden':'true'},s);
    const midF=t.op==='mul'
      ?el('span',{class:'frac inp mid',role:'group','aria-label':'Zwischenschritt: Zähler mal Zahl über dem Nenner'},el('span',{class:'num'},intInput(view,'m1','Zähler'),zop('·'),intInput(view,'m2','Zahl')),el('span',{class:'den'},intInput(view,'m3','Nenner')))
      :el('span',{class:'frac inp mid',role:'group','aria-label':'Zwischenschritt: Zähler über Nenner mal Zahl'},el('span',{class:'num'},intInput(view,'m1','Zähler')),el('span',{class:'den'},intInput(view,'m2','Nenner'),zop('·'),intInput(view,'m3','Zahl')));
    line.append(grp(op('='),midF));
  }
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
  return line;
}
/* Zwischenschritt prüfen: Vervielfachen (Zähler · Zahl)/Nenner, Teilen Zähler/(Nenner · Zahl); Faktoren in beliebiger Reihenfolge */
function vtMidCheck(t,d){
  const m=[getInt(d,'m1'),getInt(d,'m2'),getInt(d,'m3')];
  if(m.some(x=>x===null))return invalid('Fülle zuerst den Zwischenschritt aus.');
  const [A,B]=vtVal(t),both=(p,q,x,y)=>(p===x&&q===y)||(p===y&&q===x);
  if(t.op==='mul'){
    if(m[2]!==B)return wrong(m[2]===B*t.n?'mulKleiner':'zwischen',m[2]===B*t.n?vtMsgOf('mulKleiner',t):'Der Nenner bleibt gleich. Schreibe ihn unten hin.',{m3:false});
    if(!both(m[0],m[1],A,t.n))return wrong('zwischen',`Oben steht der Zähler mal ${t.n}.`,{m1:false,m2:false});
    return null;
  }
  if(m[0]!==A)return wrong(m[0]===A*t.n?'divGroesser':'zwischen',m[0]===A*t.n?vtMsgOf('divGroesser',t):'Der Zähler bleibt gleich. Schreibe ihn oben hin.',{m1:false});
  if(!both(m[1],m[2],B,t.n))return wrong('zwischen',`Unten steht der Nenner mal ${t.n}.`,{m2:false,m3:false});
  return null;
}
/* Ergebnis prüfen (null = alles richtig). o wie vtResultBlock */
function vtResultCheck(t,d,o){
  o=o||{};
  const res=vtRes(t);
  if(o.mid){const m=vtMidCheck(t,d);if(m)return m;}
  const kid={r:getFrac(d,'r'),k:getFrac(d,'k'),kn:d.kn===true},mx=o.mixed?hnMixedOf(d):null;
  const mixMarks={'g.w':false,'g.n':false,'g.d':false};
  const mixCheck=()=>{
    if(mx.bad)return hnMixedCheck(res,mx);
    const val=[mx.w*mx.d+mx.n,mx.d];
    if(!equivalent(val[0],val[1],res[0],res[1])){
      const g=simplify(res[0],res[1]);
      if(mx.d===g[1]&&mx.n===g[0]%g[1]&&mx.w!==Math.floor(g[0]/g[1]))return wrong('rest',`Wie oft passt ${g[1]} ganz in ${g[0]}? Der Rest kommt in den Zähler.`,{'g.w':false});
      const c=vtDiagnose(t,val[0],val[1]);
      return wrong(c||'gemischtFalsch',c?vtMsgOf(c,t):'Die gemischte Zahl hat einen anderen Wert. Prüfe die Ganzen.',mixMarks);
    }
    return hnMixedCheck(res,mx);
  };
  if(!kid.r&&mx)return mixCheck();
  if(!kid.k&&(d['k.n']!=null&&d['k.n']!==''||d['k.d']!=null&&d['k.d']!==''))return invalid(MSG_FRAC_INVALID);
  /* Wer beim Teilen den Zähler teilt, hat ein anderes (schon gekürztes) Ergebnis: Kürzen wird an der eigenen Eingabe geprüft */
  const base=kid.r&&equivalent(kid.r.n,kid.r.d,res[0],res[1])?[kid.r.n,kid.r.d]:res;
  const code=kuerzenCheck(base,kid),mr={'r.n':false,'r.d':false},mk={'k.n':false,'k.d':false};
  switch(code){
    case null:break;
    case 'leer':return invalid(MSG_FRAC_INVALID);
    case 'kuerzenLeer':return invalid(HN_KMSG_EMPTY);
    case 'wert':{const c=vtDiagnose(t,kid.r.n,kid.r.d)||'wert';return wrong(c,vtMsgOf(c,t),mr);}
    case 'keinKuerzen':return soft('keinKuerzen','Dein Ergebnis stimmt. Es lässt sich aber noch kürzen. Suche eine Zahl, durch die Zähler und Nenner teilbar sind.',{kn:false});
    case 'kuerzenWert':return soft('kuerzenWert','Dein Ergebnis stimmt. Der gekürzte Bruch hat aber einen anderen Wert. Teile Zähler und Nenner durch dieselbe Zahl.',mk);
    default:return soft('nochKuerzen','Dein Ergebnis stimmt. Du kannst noch weiter kürzen.',mk);
  }
  if(mx)return mixCheck();
  return null;
}
/* Nur ein Bruchfeld (Antwort einer Sachaufgabe oder eines Bildes): ungekürzt zählt als richtig (Entscheidung des Lehrers), mit Hinweis */
function vtFracCheck(t,d,key,res){
  key=key||'r';res=res||vtRes(t);
  const f=getFrac(d,key),mx=hnMixedOf(d);
  if(!f&&mx&&!mx.bad){
    const val=[mx.w*mx.d+mx.n,mx.d];
    if(equivalent(val[0],val[1],res[0],res[1]))return {ok:true,note:isFullyReduced(mx.n,mx.d)?'':' Den Bruchteil kannst du noch kürzen.'};
    const c=vtDiagnose(t,val[0],val[1])||'wert';
    return {r:wrong(c,vtMsgOf(c,t),{'g.w':false,'g.n':false,'g.d':false})};
  }
  if(!f)return {r:invalid(MSG_FRAC_INVALID)};
  if(equivalent(f.n,f.d,res[0],res[1])){
    const g=simplify(res[0],res[1]),notes=[];
    if(!isFullyReduced(f.n,f.d))notes.push('Du kannst noch kürzen.');
    if(g[0]>g[1]&&g[1]>1)notes.push('Als gemischte Zahl: '+vtShow(g[0],g[1])+'.');
    return {ok:true,note:notes.length?' '+notes.join(' '):''};
  }
  const c=vtDiagnose(t,f.n,f.d)||'wert';
  return {r:wrong(c,vtMsgOf(c,t),{[key+'.n']:false,[key+'.d']:false})};
}
/* Antwortzeile „Ergebnis: □/□ oder □ □/□“ (für Bild- und Sachaufgaben ohne Rechenweg) */
function vtAnswerRow(view,host,label,noMix){
  host.append(el('div',{class:'hnline vtans',role:'group','aria-label':label||'Ergebnis'},
    el('span',{class:'hnq'},el('span',{class:'hnk'},fracInput(view,'r'),el('small',{class:'hnlab'},'als Bruch'))),
    noMix?null:el('span',{class:'hnq'},el('span',{class:'vtor'},'oder'),el('span',{class:'hnk'},hnMixedInput(view),el('small',{class:'hnlab'},'gemischt')))));
}

/* ---------- Antworten als kompakte Kacheln (zwei Spalten) ----------
   items: [{id, parts}], Entwurf draft[key] = id, Eingaben key+id; o.txt: Wörter (Textschrift); onPick(id) nach der Wahl */
/* Rechnung aus Daten zeichnen: [Zähler, Nenner] = Bruch, sonst Zeichen oder Zahl */
const vtX=(x)=>eq(...x.map(e=>Array.isArray(e)?frac(e[0],e[1]):String(e)));
/* Inhalt einer Antwortkarte: x (Rechnung), f (Bruch) oder parts (Text/Knoten, nur beim Zeichnen gebaut) */
const vtPartsOf=(it)=>it.x?[vtX(it.x)]:it.f?[frac(it.f[0],it.f[1])]:(it.parts||[]).map(p=>p instanceof Node||typeof p==='string'?p:'');
function vtTiles(view,host,key,items,label,onPick,o){
  o=o||{};
  const d=view.draft,grid=el('div',{class:'tiles vttiles'+(o.txt?' vtwords':''),role:'group','aria-label':label||'Antworten'});
  items.forEach((it,i)=>{
    const b=el('button',{type:'button',class:'tile '+(o.txt?'tile-txt':'tile-fs'),'aria-pressed':String(d[key]===it.id)},el('span',{class:'ltr','aria-hidden':'true'},'ABCDE'[i]),el('span',{class:'tv'},...vtPartsOf(it)));
    b.disabled=view.locked();
    b.addEventListener('click',()=>{if(view.locked())return;d[key]=it.id;view.save();grid.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(onPick)onPick(it.id);});
    view.inputs[key+it.id]=b;grid.append(b);
  });
  host.append(grid);
  return grid;
}

/* ---------- Ordnen durch Antippen ---------- */
/* items: [{id, parts}] in angezeigter Reihenfolge; Entwurf ord = angetippte ids (kleinster zuerst) */
function vtOrder(view,host,items){
  const d=view.draft;if(!Array.isArray(d.ord))d.ord=[];
  const row=el('div',{class:'vtord',role:'list','aria-label':'Deine Reihenfolge'}),pool=el('div',{class:'tiles tiles-'+items.length,role:'group','aria-label':'Karten'});
  const draw=()=>{
    row.replaceChildren(...items.map((_,i)=>{const id=d.ord[i],it=items.find(x=>x.id===id);return el('span',{class:'vtslot'+(it?' set':''),role:'listitem'},it?el('span',null,...it.parts):String(i+1)+'.');}));
    pool.querySelectorAll('button').forEach(b=>{b.disabled=view.locked()||d.ord.includes(b.dataset.id);});
    if(view.changed)view.changed();
  };
  items.forEach(it=>{
    const b=el('button',{type:'button',class:'tile tile-fs','data-id':it.id},el('span',{class:'tv'},...vtPartsOf(it)));
    b.addEventListener('click',()=>{if(view.locked()||d.ord.includes(it.id))return;d.ord.push(it.id);view.save();draw();});
    pool.append(b);
  });
  const reset=linkBtn('Neu anfangen',()=>{if(view.locked())return;d.ord=[];view.save();draw();});
  view.inputs.ord=row;
  host.append(el('p',{class:'vtordcap'},'Kleinster zuerst:'),row,pool,reset);
  draw();
}
