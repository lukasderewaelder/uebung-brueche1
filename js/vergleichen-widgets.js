'use strict';
/* =====================================================================
   Bausteine für „Brüche vergleichen und ordnen“ (Aufgaben W01–W10 in js/vergleichen.js)
   cmpSign      Zeichen <, = oder > zwischen zwei Brüchen wählen (drei große Kacheln)
   cmpStack     Streifen (bis Nenner 24 mit Zellen, darüber ein glatter Balken) gleich lang und bündig untereinander
   cmpPairPic   Bild zu zwei Brüchen: Streifen, bei unechten Brüchen ein Zahlenstrahl
   cmpPaint     Streifen selbst färben (antippen)
   cmpTiles     Einfachwahl mit Kacheln (z. B. „Was ist gleich?“)
   cmpClaim     Behauptung prüfen wie U04: erst „Stimmt das?“, dann die passende Begründung A/B/C
   Zustände liegen als einfache Daten im Entwurf (view.draft, Listen statt Set). Jeder Handler beginnt mit view.locked(), danach view.save().
   Streifen sind immer gleich lang (ein Ganzes), gefärbt wird ab links.
   ===================================================================== */
const CMP_SIGNS=[['<','kleiner'],['=','gleich'],['>','größer']];

/* Zeichen wählen: oben die Zeile „a/b ▢ c/d“, unten drei Kacheln. Entwurf: draft[key] = '<' | '=' | '>'. Eingaben für Markierungen: key+Zeichen. */
function cmpSign(view,host,key,f,o){
  o=o||{};
  const d=view.draft,slot=el('span',{class:'cmpslot','aria-live':'polite'},d[key]||'');
  const row=el('div',{class:'cmpsigns',role:'group','aria-label':'Zeichen wählen'});
  CMP_SIGNS.forEach(([s,w])=>{
    const b=el('button',{type:'button',class:'tile tile-sign','aria-pressed':String(d[key]===s),'aria-label':w},el('span',{'aria-hidden':'true'},s),el('span',{class:'sw','aria-hidden':'true'},w));
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d[key]=s;view.save();slot.textContent=s;
      row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      if(o.onPick)o.onPick(s);
    });
    view.inputs[key+s]=b;row.append(b);
  });
  host.append(el('div',{class:'cmpeq',role:'group','aria-label':'Welches Zeichen passt?'},frac(f[0],f[1]),slot,frac(f[2],f[3])),row);
}

/* Ein Streifen: Zellen (bis Nenner 24) oder glatter Balken (ab 25). r = {n,d,rest,filled,onToggle,aria}; o = {flat,h,half} */
function cmpStrip(r,o){
  const lab=r.aria||(r.n+' von '+r.d+' Teilen gefärbt');
  if(r.d<BAR_FROM){
    const rest=r.rest?Array.from({length:Math.max(0,r.d-r.n)},(_,i)=>r.n+i):null;
    return drawCells('strip',r.d,null,r.filled||firstN(Math.min(r.n,r.d)),{maxW:2000,flat:o.flat!==false,h:o.h,rest,onToggle:r.onToggle,label:lab,half:o.half});
  }
  return drawSmoothBar(r.n,r.d,{maxW:2000,flat:o.flat!==false,h:o.h,rest:r.rest,half:o.half,label:lab});
}
/* Streifen untereinander: Beschriftung links (Bruch oder r.label), alle Streifen gleich lang und bündig */
function cmpStack(rows,o){
  o=o||{};
  const box=el('div',{class:'cmpstack',role:'group','aria-label':'Bruchstreifen gleich lang untereinander'});
  rows.forEach(r=>box.append(el('div',{class:'cmpfig'},r.label!=null?el('span',{class:'cmplab'},r.label):frac(r.n,r.d),cmpStrip(r,o))));
  return box;
}
/* Bild zu zwei Brüchen a/b und c/d: zwei Streifen untereinander; ist ein Bruch unecht (mehr als ein Ganzes), ein Zahlenstrahl */
function cmpPairPic(f,o){
  o=o||{};
  const [a,b,c,d]=f;
  if(a>b||c>d){
    const to=Math.max(2,Math.ceil(Math.max(a/b,c/d)));
    return el('div',{class:'cmppic'},drawNumberLine({from:0,to,parts:1,labels:'wholes',marks:[{n:a,d:b},{n:c,d:d}],maxW:460,label:'Zahlenstrahl mit beiden Brüchen'}));
  }
  return el('div',{class:'cmppic'},cmpStack([{n:a,d:b,rest:o.rest},{n:c,d:d,rest:o.rest}],{half:o.half,flat:o.flat}));
}

/* Zwei leere Streifen zum Färben. rows = [{d,label}]; Entwurf: draft[key+i] = Liste der gefärbten Teile. Eingaben: key+i (Streifen) */
function cmpPaint(view,host,key,rows){
  const d=view.draft,box=el('div',{class:'cmpstack',role:'group','aria-label':'Streifen färben'});
  rows.forEach((r,i)=>{
    const k=key+i;
    const svg=drawCells('strip',r.d,null,new Set(d[k]||[]),{maxW:2000,h:44,label:r.aria||('Streifen '+(i+1)+' in '+r.d+' Teile geteilt'),
      onToggle:(j)=>{
        if(view.locked())return;
        const s=new Set(d[k]||[]);
        if(s.has(j))s.delete(j);else s.add(j);
        d[k]=Array.from(s).sort((x,y)=>x-y);view.save();
        return s.has(j);
      }});
    view.inputs[k]=svg;
    box.append(el('div',{class:'cmpfig'},el('span',{class:'cmplab'},r.label),svg));
  });
  host.append(box);
}
const cmpPainted=(d,key,i)=>(Array.isArray(d[key+i])?d[key+i]:[]).length;

/* Einfachwahl mit Kacheln: opts = [{v,label}]; Entwurf: draft[key] = v. Eingaben: key+v */
function cmpTiles(view,host,key,opts,o){
  o=o||{};
  const d=view.draft,grid=el('div',{class:'tiles tiles-3',role:'group','aria-label':o.label||'Antworten'});
  opts.forEach((x,i)=>{
    const b=el('button',{type:'button',class:'tile tile-txt'+(x.ltr?'':' noltr'),'aria-pressed':String(d[key]===x.v)},x.ltr?el('span',{class:'ltr','aria-hidden':'true'},x.ltr):null,el('span',{class:'tv'},x.label));
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d[key]=x.v;view.save();
      grid.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',String(y===b)));
      if(o.onPick)o.onPick(x.v);
    });
    view.inputs[key+x.v]=b;grid.append(b);
  });
  host.append(grid);
  return grid;
}

/* Behauptung prüfen (wie U04): Teil 1 „Stimmt das?“, Teil 2 „Welche Begründung passt?“.
   Aufgabe: t.opts = [{id,txt}] (A, B, C), t.answerR = richtige Kennung, t.truth = stimmt die Behauptung. Entwurf: draft.j ('ja'/'nein'), draft.r. */
function cmpClaim(view,host){
  const t=view.task,d=view.draft;
  const stg=twoStage(view,host,{isDone:()=>!!d.j,summary:()=>'1. '+(d.j==='ja'?'Stimmt':'Stimmt nicht')});
  stg.box1.append(el('p',null,strong('1. Stimmt das?')));
  const row=el('div',{class:'yesno'});
  [['ja','haken','Stimmt'],['nein','kreuz','Stimmt nicht']].forEach(([v,ic,label])=>{
    const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.j===v)},icon(ic),label);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d.j=v;view.save();
      row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      stg.advance();
    });
    view.inputs['j'+v]=b;row.append(b);
  });
  stg.box1.append(row);
  stg.box2.append(el('p',null,strong('2. Welche Begründung passt?')));
  const grid=el('div',{class:'tiles tiles-3',role:'group','aria-label':'Begründungen'});
  t.opts.forEach(o=>{
    const b=el('button',{type:'button',class:'tile tile-txt','aria-pressed':String(d.r===o.id)},el('span',{class:'ltr','aria-hidden':'true'},o.id),el('span',{class:'tv'},o.txt));
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d.r=o.id;view.save();
      grid.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    });
    view.inputs['r'+o.id]=b;grid.append(b);
  });
  stg.box2.append(grid);
  stg.upd();
}
/* Prüfung der Behauptung: richtig nur mit Urteil und Begründung. judgeHint: Satz, wenn das Urteil nicht stimmt */
function cmpClaimCheck(t,d,judgeHint){
  if(!d.j)return invalid('Wähle zuerst: Stimmt das oder stimmt das nicht?');
  if(!d.r)return invalid('Wähle auch die Begründung.');
  const jOk=d.j===(t.truth?'ja':'nein'),rOk=d.r===t.answerR;
  if(jOk&&rOk)return right('Richtig! '+t.opts.find(o=>o.id===t.answerR).txt);
  if(!jOk)return wrong('judge','Das Urteil stimmt noch nicht. '+judgeHint,{['j'+d.j]:false});
  return wrong('reason','Das Urteil stimmt. Die Begründung passt noch nicht. Lies alle drei noch einmal.',{['r'+d.r]:false});
}
/* Begründungen mischen: eine richtige (ok) und zwei falsche aus der Liste bad; liefert opts, answerR */
function cmpReasons(R,ok,bad){
  const all=R.shuffle([{txt:ok,ok:true}].concat(R.shuffle(bad).slice(0,2).map(x=>({txt:x,ok:false}))));
  const letters=['A','B','C'];
  return {opts:all.map((o,i)=>({id:letters[i],txt:o.txt})),answerR:letters[all.findIndex(o=>o.ok)]};
}
