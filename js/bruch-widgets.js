'use strict';
/* =====================================================================
   Bausteine der Etappe „Bruch mal Bruch, Bruch durch Bruch“ (Stationen in js/bruch.js)
   kbFoldSvg      Falt-Rechteck: s Spalten (r gefärbt = der erste Anteil), q Zeilen (p gefärbt = Anteil davon). Doppelt gefärbt = Muster.
   kbFoldWidget   Falten in zwei Schritten zum Antippen (Spalten färben, quer teilen, Zeilen färben), Entwurf fc, fq, fr
   kbMeasure      Streifen mit Messstück und Knopf „Anlegen“ (kein Ziehen), Rest mit Farbe und Muster, Entwurf ml
   kbArea         Flächenbild für gemischte Zahl mal gemischte Zahl (das dunkle Quadrat ist 1 Ganzes)
   kbAnswerRow    Antwort „als Bruch“ oder „gemischte oder ganze Zahl“ (nur die Ganzen ausfüllen = ganze Zahl); kbIntRow eine Zahl
   kbAnsCheck     Prüfung dazu: gleichwertig zählt (ungekürzt mit Hinweis), sonst Fehlercode aus kbDiagnose
   kbWay          Rechenweg in einer Zeile: umwandeln (u, v), Kehrwert (k), Ergebnis (r), gemischt (freiwillig)
   Alle Zustände liegen als einfache Daten im Entwurf (view.draft). Bildgrenzen: Nenner höchstens 6, höchstens 12 Felder.
   ===================================================================== */
const KB_MAXCELLS=12;
/* Rechnung der Etappe K: eigene Klasse kbeq, damit Zahlen auf dem Handy größer und mit Abstand stehen (css/app.css) */
const kbExpr=(t,end)=>{const d=eq(kbNode(t.x),kbSign(t.op),kbNode(t.y),...(end===undefined?[]:['=',end]));d.classList.add('kbeq');return d;};
const kbBlank=()=>el('span',{class:'blank','aria-label':'gesucht'},'?');

/* ---------- Falt-Rechteck ---------- */
/* o: {r,s,p,q, cols:Set (gefärbte Spalten), rows:Set (gefärbte Zeilen), split (Zeilenzahl, 1 = noch nicht quer geteilt), onTap(i)} */
function kbFoldSvg(o){
  const s=o.s,rowsN=Math.max(1,o.split||1),d=rowsN*s,cols=o.cols||new Set(),rows=o.rows||new Set(),on=new Set();
  for(let i=0;i<d;i++)if(cols.has(i%s))on.add(i);
  let dbl=0;
  const svg=drawCells('grid',d,[rowsN,s],on,{maxW:Math.min(320,s*60),onToggle:o.onTap?(i)=>{o.onTap(i);}:null,
    label:'Rechteck mit '+d+' Feldern, '+on.size+' gefärbt'});
  svg.querySelectorAll('g.cell').forEach((g,i)=>{
    const c=i%s,r=Math.floor(i/s),two=rowsN>1&&cols.has(c)&&rows.has(r);
    if(two){g.classList.remove('on');g.classList.add('on2');dbl++;}
    if(o.onTap)g.setAttribute('aria-label',(rowsN>1?'Zeile '+(r+1)+', ':'')+'Spalte '+(c+1)+(two?', doppelt gefärbt':cols.has(c)?', gefärbt':''));
  });
  if(!o.onTap)svg.setAttribute('aria-label','Rechteck mit '+d+' Feldern, '+on.size+' gefärbt'+(rowsN>1?', '+dbl+' doppelt gefärbt':''));
  return el('div',{class:'vtfig kbfig'},svg);
}
const kbFoldFull=(r,s,p,q)=>kbFoldSvg({r,s,p,q,split:q,cols:new Set(Array.from({length:r},(_,i)=>i)),rows:new Set(Array.from({length:p},(_,i)=>i))});
/* Falten zum Antippen: t.x = p/q (der Anteil), t.y = r/s (wovon). Stufe 1 im Kasten box (Spalten, quer teilen, Zeilen), Bild in fig. */
function kbFoldWidget(view,fig,box,t){
  const d=view.draft,s=t.y.b,info=el('p',{class:'vtcount','aria-live':'polite'}),cuts=el('div',{class:'vtcut',role:'group','aria-label':'Quer teilen'});
  const setOf=(k)=>new Set(Array.isArray(d[k])?d[k]:[]);
  const draw=()=>{
    const cols=setOf('fc'),rows=setOf('fr'),split=d.fq||1;
    fig.replaceChildren(kbFoldSvg({s,cols,rows,split,onTap:view.locked()?null:(i)=>{
      if(view.locked())return;
      if(!d.fq){const c=new Set(cols),k=i%s;if(c.has(k))c.delete(k);else c.add(k);d.fc=[...c].sort((a,b)=>a-b);}
      else{const r=new Set(rows),k=Math.floor(i/s);if(r.has(k))r.delete(k);else r.add(k);d.fr=[...r].sort((a,b)=>a-b);}
      view.save();draw();
    }}));
    cuts.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.k)===d.fq)));
    info.textContent=!d.fq?cols.size+' von '+s+' Spalten gefärbt':rows.size+' von '+d.fq+' Zeilen gefärbt';
    if(view.changed)view.changed();
  };
  const ks=[2,3,4,5,6].filter(k=>k*s<=KB_MAXCELLS);
  ks.forEach(k=>{
    const b=el('button',{type:'button',class:'btn small','data-k':String(k),'aria-pressed':String(d.fq===k)},'quer in '+k);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{if(view.locked())return;d.fq=k;d.fr=[];view.save();draw();});
    view.inputs['fq'+k]=b;cuts.append(b);
  });
  view.inputs.fold=fig;
  box.append(el('p',{class:'kbfoldq'},strong('1. Färbe '),kbNode(t.y),strong(', dann quer '),kbNode(t.x),strong(' davon.')),cuts,info);
  draw();
}

/* ---------- Messen mit dem Messstück ---------- */
/* Streifen der Länge X (in Ganzen untereinander, je L Teile), Messstück Y. ml = angelegte Stücke. o: {ml, rest (Rest zeigen)} */
function kbMeasureFig(X,Y,ml,o){
  o=o||{};
  const L=lcm(X[1],Y[1]),du=X[0]*L/X[1],vu=Y[0]*L/Y[1],full=Math.floor(du/vu),rest=du-full*vu,rowsN=Math.max(1,Math.ceil(du/L));
  ml=Math.min(ml,full);
  const box=el('div',{class:'vtfig kbfig kbmeasure',role:'img','aria-label':rowsN+(rowsN===1?' Ganzes':' Ganze')+' in '+kbDenName(L)+', '+ml+(ml===1?' Messstück':' Messstücke')+' angelegt'+(ml>=full&&rest&&o.rest!==false?', Rest '+rest+' '+kbDenName(L):'')});
  for(let r=0;r<rowsN;r++){
    const svg=drawCells('strip',L,null,new Set(),{maxW:300,h:o.h||34,label:'Ganzes '+(r+1)}); /* immer volle Breite: auch drei Teile bleiben gut zählbar */
    svg.removeAttribute('role');svg.setAttribute('aria-hidden','true');
    svg.querySelectorAll('g.cell').forEach((g,i)=>{
      const k=r*L+i,piece=Math.floor(k/vu);
      if(k>=du)g.classList.add('kbout');
      else if(piece<ml)g.classList.add(piece%2?'on2':'on');
      else if(ml>=full&&rest&&o.rest!==false)g.classList.add('kbrest');
    });
    box.append(el('div',{class:'vtrow'},svg));
  }
  box.append(el('small',{class:'vtcap'},rowsN>1?'Jede Zeile ist 1 Ganzes.':'Der Streifen ist 1 Ganzes.'));
  return box;
}
function kbMeasureInfo(X,Y){const L=lcm(X[1],Y[1]),du=X[0]*L/X[1],vu=Y[0]*L/Y[1];return {L,du,vu,full:Math.floor(du/vu),rest:du%vu};}
/* Werkzeug: Knöpfe „Anlegen“ und „Zurücknehmen“, Zähler. o.ctl: Knöpfe an anderer Stelle, das Bild bleibt in host */
function kbMeasure(view,host,t,o){
  o=o||{};
  const d=view.draft,X=kbV(t.x),Y=kbV(t.y),I=kbMeasureInfo(X,Y),fig=el('div'),count=el('p',{class:'vtcount','aria-live':'polite'});
  const add=el('button',{type:'button',class:'btn small','aria-label':'Messstück '+kbTxt(t.y)+' anlegen'},icon('plus'),'Anlegen');
  const undo=el('button',{type:'button',class:'btn small','aria-label':'Ein Messstück zurücknehmen'},icon('undo'),'Zurück');
  const draw=()=>{
    const ml=Math.min(I.full,d.ml||0);
    fig.replaceChildren(kbMeasureFig(X,Y,ml));
    count.textContent=ml+'-mal'+(ml>=I.full?(I.rest?' · Rest '+I.rest+' von '+I.vu+' Teilen':' · passt genau'):'');
    add.disabled=view.locked()||ml>=I.full;undo.disabled=view.locked()||ml<1;
    if(view.changed)view.changed();
  };
  add.addEventListener('click',()=>{if(view.locked())return;d.ml=Math.min(I.full,(d.ml||0)+1);view.save();draw();});
  undo.addEventListener('click',()=>{if(view.locked())return;d.ml=Math.max(0,(d.ml||0)-1);view.save();draw();});
  view.inputs.ml=fig;
  host.append(fig);(o.ctl||host).append(el('div',{class:'rowbtns kbmrow'},add,undo,count));
  draw();
  return {draw,I};
}

/* ---------- Flächenbild ---------- */
/* x · y mit gemischten Zahlen: Spalten in Stücken von 1/x.b, Zeilen in Stücken von 1/y.b. Das Quadrat oben links ist 1 Ganzes. */
function kbArea(x,y){
  const X=kbV(x),Y=kbV(y),cols=X[0],rows=Y[0],d=cols*rows,on=new Set();
  for(let i=0;i<d;i++)if(i%cols<x.b&&Math.floor(i/cols)<y.b)on.add(i);
  const svg=drawCells('grid',d,[rows,cols],on,{maxW:Math.min(300,cols*56),label:'Rechteck aus '+d+' gleichen Feldern, davon '+on.size+' im Quadrat für 1 Ganzes'});
  svg.querySelectorAll('g.cell').forEach((g,i)=>{if(!on.has(i))g.classList.add('on2');});
  return el('div',{class:'vtfig kbfig'},svg,el('small',{class:'vtcap'},'Das einfarbige Quadrat ist 1 Ganzes.'));
}

/* ---------- Antworten ---------- */
/* Bruch (r) oder gemischte bzw. ganze Zahl (g.w, g.n, g.d; nur die Ganzen = ganze Zahl) */
function kbAnswerRow(view,host,label){
  host.append(el('div',{class:'hnline vtans',role:'group','aria-label':label||'Ergebnis'},
    el('span',{class:'hnq'},el('span',{class:'hnk'},fracInput(view,'r'),el('small',{class:'hnlab'},'als Bruch'))),
    el('span',{class:'hnq'},el('span',{class:'vtor'},'oder'),el('span',{class:'hnk'},hnMixedInput(view),el('small',{class:'hnlab'},'gemischt oder ganz')))));
}
/* eine ganze Zahl (z) mit Beschriftung davor */
function kbIntRow(view,host,label,unit){
  host.append(el('div',{class:'addrow kbint'},el('span',{class:'alab'},label||'Ergebnis'),intInput(view,'z',label||'Ergebnis'),unit?el('span',{class:'alab'},unit):null));
}
/* gelesene Antwort: {v:[p,q], marks, frac, mx} oder {bad:Meldung} oder null (leer) */
function kbReadAns(d,key){
  key=key||'r';
  const blank=(k)=>d[k]==null||d[k]==='';
  const f=getFrac(d,key);
  if(f)return {v:[f.n,f.d],marks:{[key+'.n']:false,[key+'.d']:false},frac:f};
  if(!blank(key+'.n')||!blank(key+'.d'))return {bad:MSG_FRAC_INVALID};
  if(blank('g.w')&&blank('g.n')&&blank('g.d'))return null;
  const w=getInt(d,'g.w'),n=getInt(d,'g.n'),q=getInt(d,'g.d'),mk={'g.w':false,'g.n':false,'g.d':false};
  if(w!==null&&blank('g.n')&&blank('g.d'))return {v:[w,1],marks:{'g.w':false},whole:true};
  if(n===null||q===null||q===0)return {bad:'Trage bei der gemischten Zahl die Ganzen, den Zähler und den Nenner ein.'};
  const W=w===null?0:w;
  return {v:[W*q+n,q],marks:mk,mx:{w:W,n,d:q}};
}
/* Prüfen gegen res. o: {full (vollständig gekürzt verlangt), diag(p,q) → Code, msg(code) → Satz, okText} */
function kbAnsCheck(t,d,res,o){
  o=o||{};
  const a=kbReadAns(d,o.key);
  if(!a)return invalid(o.empty||'Trage das Ergebnis ein: als Bruch oder als gemischte Zahl.');
  if(a.bad)return invalid(a.bad);
  const [p,q]=a.v;
  if(!equivalent(p,q,res[0],res[1])){
    const c=(o.diag&&o.diag(p,q))||(t.x&&t.y?kbDiagnose(t,p,q):null)||'wert';
    return wrong(c,o.msg?o.msg(c):kbMsgOf(c,t),a.marks);
  }
  if(a.mx&&(a.mx.n>=a.mx.d))return wrong('gemischtFalsch','Bei der gemischten Zahl ist der Bruchteil kleiner als 1.',{'g.n':false,'g.d':false});
  const reduced=a.frac?isFullyReduced(a.frac.n,a.frac.d):a.mx?isFullyReduced(a.mx.n,a.mx.d):true;
  if(o.full&&!reduced)return soft('nochKuerzen','Dein Ergebnis stimmt. Kürze noch so weit wie möglich.',a.marks);
  const g=simplify(res[0],res[1]),notes=[];
  if(!reduced)notes.push('Du kannst noch kürzen.');
  if(a.frac&&g[0]>g[1]&&g[1]>1)notes.push('Als gemischte Zahl: '+kbShow(g)+'.');
  return right((o.okText||('Richtig! '+(t.x&&t.y?kbProofText(t):'')))+(notes.length?' '+notes.join(' '):''));
}
/* ganze Zahl prüfen */
function kbIntCheck(t,d,want,o){
  o=o||{};
  const z=getInt(d,'z');
  if(z===null)return invalid(o.empty||'Trage eine Zahl ein.');
  if(z===want)return right(o.okText||('Richtig! '+(t.x&&t.y?kbProofText(t):'')));
  let c=(o.diag&&o.diag(z))||(t.x&&t.y?kbDiagnose(t,z,1):null)||'wert';
  if(c==='rechen')c='wert'; /* bei einer ganzen Zahl gibt es keinen Rechenweg, den man loben könnte */
  return wrong(c,o.msg?o.msg(c,z):kbMsgOf(c,t),{z:false});
}

/* ---------- Rechenweg in einer Zeile ----------
   o: {conv (gemischte Zahlen erst umwandeln: Felder u, v), kehr (Kehrwert der zweiten Zahl: Feld k), mixed (gemischt freiwillig)}
   Beispiel Division: 2 1/3 : 1 3/4 = [u] : [v] = [u] · [k] = [r] (= [g] gemischt) */
function kbWay(view,host,t,o){
  o=o||{};
  const grp=(...xs)=>el('span',{class:'hnq'},...xs),line=el('div',{class:'hnline kbway',role:'group','aria-label':'Rechenweg'});
  const lab=(node,txt)=>el('span',{class:'hnk'},node,el('small',{class:'hnlab'},txt));
  const fi=(key,label)=>{const f=fracInput(view,key);f.setAttribute('aria-label',label);return f;};
  line.append(grp(kbExpr(t)));
  const U=o.conv&&kbIsMix(t.x)?lab(fi('u','erste Zahl als Bruch'),'umgewandelt'):kbNode(t.x);
  /* Division: gleich mal den Kehrwert (bei gemischter zweiter Zahl der Kehrwert des umgewandelten Bruchs); Multiplikation: erst umwandeln */
  if(t.op==='div'&&o.kehr)line.append(grp(op('='),U,op('·'),lab(fi('k','Kehrwert'),'Kehrwert')));
  else if(o.conv)line.append(grp(op('='),U,op(kbSign(t.op)),kbIsMix(t.y)?lab(fi('v','zweite Zahl als Bruch'),'umgewandelt'):kbNode(t.y)));
  line.append(grp(op('='),lab(fi('r','Ergebnis'),o.full?'gekürzt':'Ergebnis')));
  if(o.mixed)line.append(grp(op('='),lab(hnMixedInput(view),'gemischt (freiwillig)')));
  host.append(line);
  return line;
}
/* Rechenweg prüfen: erst Umwandlung, dann Kehrwert, dann Ergebnis (gleichwertig; o.full verlangt vollständig gekürzt), zuletzt gemischt */
function kbWayCheck(t,d,o){
  o=o||{};
  const need=(key,label)=>{const f=getFrac(d,key);if(!f)return {r:invalid('Fülle zuerst das Feld „'+label+'“ aus.')};return {f};};
  if(o.conv){
    for(const [k,z,lab] of [['u',t.x,'umgewandelt'],['v',t.y,'umgewandelt']]){
      if(!kbIsMix(z)||(k==='v'&&t.op==='div'&&o.kehr))continue;
      const n=need(k,lab);if(n.r)return n.r;
      const Z=kbV(z);
      if(!equivalent(n.f.n,n.f.d,Z[0],Z[1]))return wrong('umwandeln','Ein Ganzes sind '+z.b+' '+kbDenName(z.b)+'. Wie viele '+kbDenName(z.b)+' sind '+kbTxt(z)+'?',{[k+'.n']:false,[k+'.d']:false});
    }
  }
  if(t.op==='div'&&o.kehr){
    const n=need('k','Kehrwert');if(n.r)return n.r;
    const Y=kbV(t.y),X=kbV(t.x);
    if(!equivalent(n.f.n,n.f.d,Y[1],Y[0])){
      const c=equivalent(n.f.n,n.f.d,Y[0],Y[1])?'keinKehr':equivalent(n.f.n,n.f.d,X[1],X[0])?'kehrDividend':kbIsMix(t.y)&&n.f.d===t.y.a?'gemKehr':'kehrwert';
      return wrong(c,c==='kehrwert'?'Der Kehrwert von '+kbTxt(t.y)+': Tausche Zähler und Nenner.':kbMsgOf(c,t),{'k.n':false,'k.d':false});
    }
  }
  const res=kbRes(t),f=getFrac(d,'r');
  if(!f)return invalid(getInt(d,'r.n')!==null||getInt(d,'r.d')!==null?MSG_FRAC_INVALID:'Trage das Ergebnis als Bruch ein.');
  if(!equivalent(f.n,f.d,res[0],res[1])){const c=kbDiagnose(t,f.n,f.d)||'wert';return wrong(c,kbMsgOf(c,t),{'r.n':false,'r.d':false});}
  if(o.full&&!isFullyReduced(f.n,f.d))return soft('nochKuerzen','Dein Ergebnis stimmt. Kürze noch so weit wie möglich.',{'r.n':false,'r.d':false});
  if(o.mixed){const mx=hnMixedOf(d);if(mx){const m=hnMixedCheck(res,mx);if(m)return m;}}
  const g=simplify(res[0],res[1]),notes=[];
  if(!o.full&&!isFullyReduced(f.n,f.d))notes.push('Du kannst noch kürzen.');
  if(g[0]>g[1]&&g[1]>1&&!hnMixedOf(d))notes.push('Als gemischte Zahl: '+kbShow(g)+'.');
  return right('Richtig! '+kbProofText(t)+(notes.length?' '+notes.join(' '):''));
}

/* ---------- Bild einer Erklärkarte ---------- */
function kbIntroNode(s){
  const box=el('div',{class:'introstage'});
  if(s.kind==='fold')box.append(kbFoldFull(s.r,s.s,s.p,s.q));
  else if(s.kind==='measure')box.append(kbMeasureFig(s.X,s.Y,s.ml==null?99:s.ml));
  else if(s.kind==='area')box.append(kbArea(kbZ(s.a1,s.b1,s.w1),kbZ(s.a2,s.b2,s.w2)));
  return box;
}
