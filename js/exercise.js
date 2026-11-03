'use strict';
/* =====================================================================
   7 Aufgaben-Oberfläche (mountTask), Runden, Fortschritt
   ===================================================================== */
const AREAS=['Grundlagen','Umkehraufgaben','Offene Aufgaben','Darstellungen umwandeln','Spiele'];
const GAMES={
  S01:{area:'Spiele',name:'Bruch-Memory',desc:'Finde Kartenpaare, die denselben Anteil zeigen.',notes:['M1','M2','M3']},
  S02:{area:'Spiele',name:'Bruch-Tresor',desc:'Der Code ist ein Bruch: Öffne die Schlösser, sammle die Ziffern und kürze den Code-Bruch.',notes:['M2','M3']}
};
const ALL_IDS=PRACTICE_ORDER.concat(['S01','S02']);
const infoOf=(id)=>TASKS[id]||GAMES[id];
const isGame=(id)=>!!GAMES[id];

const app=document.getElementById('app');
const scrim=document.getElementById('scrim');
const SEEN=new Set();
const SIG_SKIP=new Set(['avoid','cards','shown','opts','optNums','why','fill']);
const sigOf=t=>JSON.stringify(t,(k,v)=>(SIG_SKIP.has(k)||(k==='answer'&&TASKS[t.type].quick))?undefined:v);
/* Kennzeichen einer Aufgabe für die Abwechslung innerhalb einer Runde: Nenner und Teile (n…), Faktor (k…), Art (x…) */
function varietyTokens(t){
  const o=[];
  ['b','d','m','q','l','N'].forEach(k=>{if(typeof t[k]==='number')o.push('n'+t[k]);});
  if(typeof t.k==='number')o.push('k'+t.k);
  ['kind','mode'].forEach(k=>{if(typeof t[k]==='string')o.push('x'+t[k]);});
  const T=TASKS[t.type];
  return T&&T.variety?o.concat(T.variety(t)):o;
}
/* Neue Aufgabe, möglichst eine, die in dieser Sitzung noch nicht vorkam. Mit round wird aus bis zu 30 Kandidaten die gewählt,
   die den bisherigen Aufgaben der Runde am wenigsten ähnelt (gleiche Nenner zählen 3, Faktoren 2, Arten 1; ein schon gestelltes
   Exemplar 0,5 – bei kleinen Zahlenräumen sind Wiederholungen irgendwann nicht zu vermeiden, gleiche Nenner in einer Runde
   dann trotzdem selten); round.vk merkt die Kennzeichen der Aufgaben dieser Runde. */
const VARIETY_WEIGHT={n:3,k:2,x:1};
function generateUnique(typeId,level,ctx,round){
  const quick=!!TASKS[typeId].quick,used=(round&&round.vk)||[];
  let best=null,bestScore=Infinity;
  for(let i=0;i<30;i++){
    const t=generateTask(typeId,level,null,ctx);
    const score=(SEEN.has(sigOf(t))?0.5:0)+(quick||!round?0:varietyTokens(t).reduce((n,x)=>n+VARIETY_WEIGHT[x[0]]*used.filter(u=>u===x).length,0));
    if(score<bestScore){best=t;bestScore=score;}
    if(!score)break;
  }
  SEEN.add(sigOf(best));
  if(round&&!quick)round.vk=used.concat(varietyTokens(best));
  return best;
}
const levelOf=(id)=>S.levelByType[id]||1;
const keyOf=(id,l)=>id+'-L'+l;
function prog(key){return S.progress[key]||(S.progress[key]={done:0,first:0,later:0,skipped:0,shown:0});}
function newState(task){return {task,draft:{},hint:0,attempts:0,status:'open',fb:null};}


/* =====================================================================
   Spielerischer Fortschritt: Punkte (XP), Ränge, Serien
   ===================================================================== */
/* Segmentierte Messanzeige (10 Segmente) */
function segBar(pct,cls){
  const w=el('span',{class:'gseg'+(cls?' '+cls:''),'aria-hidden':'true'});
  const lit=Math.round(pct*10);
  for(let i=0;i<10;i++)w.append(el('i',{class:i<lit?'on':''}));
  return w;
}
let toastTimer=null;
function toast(text,cls){
  let t=document.getElementById('toast');
  if(!t){t=el('div',{id:'toast','aria-live':'polite'});document.body.append(t);}
  t.className='toast '+(cls||'');t.textContent=text;
  const bar=document.querySelector('.actionbar');
  const top=bar?bar.getBoundingClientRect().top:innerHeight-72;
  t.style.bottom=Math.max(8,Math.round(innerHeight-top+8))+'px';
  void t.offsetWidth;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1500);
}
function modal(content){
  const m=el('div',{class:'modal',role:'dialog','aria-modal':'true'},el('div',{class:'modalcard'},...content));
  document.body.append(m);return m;
}
function rankUpCard(i){
  const r=RANKS[i],m=modal([icon(r[2],'big'),el('h2',null,'Neuer Rang'),el('p',{class:'rankname'},r[1]),el('div',{class:'stampbox'},'Geprüft'),
    el('p',null,'Rang '+(i+1)+' von '+RANKS.length+(i===RANK_TOP?' – alles perfekt!':'')),el('button',{type:'button',class:'btn primary',onclick:()=>m.remove()},'Weiter')]);
}
function award(xp,label){
  S.xp=(S.xp||0)+xp;
  persist();updateChip();
  toast('+'+xp+' XP'+(label?' · '+label:''));
  checkRankUp();
}
/* Abwechslungsreiches Lob (nie zweimal dasselbe hintereinander) */
const PRAISE=['Sitzt.','Sauber gerechnet.','Passt.','Volltreffer.','Genau so.','Stark.'];
let lastPraise=-1;
function praise(){
  let i;do{i=Math.floor(Math.random()*PRAISE.length);}while(i===lastPraise);
  lastPraise=i;return PRAISE[i];
}
function awardCorrect(first,quick){
  S.streak=(S.streak||0)+1;
  S.bestStreak=Math.max(S.bestStreak||0,S.streak);
  if(quick){award(3,S.streak>=3?S.streak+' Treffer':'');return;}
  const bonus=first?Math.min(S.streak-1,5):0;
  award((first?10:5)+bonus,S.streak>=3?S.streak+' Treffer':(first?'Sauber':'Richtig'));
}
/* Treffer-Konto: jede richtige Antwort +1, ein Fehler halbiert es (S.streak, der Feldname bleibt für alte Spielstände) */
function halveStreak(){if(S.streak){S.streak=Math.floor(S.streak/2);persist();updateChip();}}
/* Fähigkeiten-Protokoll: letzte 10 Antworten je Fähigkeit; „sicher“ = mind. 4 Antworten, mind. 80 % richtig */
function recordSkill(skill,ok){
  if(!skill)return;
  const r=S.skills[skill]||(S.skills[skill]={h:[]});
  r.h.push(ok?1:0);if(r.h.length>10)r.h.shift();persist();
}
function skillSure(skill){
  const h=(S.skills[skill]||{}).h||[];
  return h.length>=4&&h.reduce((a,b)=>a+b,0)/h.length>=0.8;
}
const starsFor=(n)=>n>=25?3:n>=10?2:n>=3?1:0;
/* Stern-Spalten (Leicht / Knifflig) für Stücklisten */
function starCols(id){
  const f=l=>starsFor((S.progress[keyOf(id,l)]||{}).first||0);
  return [starNodes(f(1)),starNodes(f(2))];
}
function bigStars(n){
  const w=el('div',{class:'bigstars',role:'img','aria-label':n+' von 3 Sternen'});
  for(let i=0;i<3;i++)w.append(icon('stern',i<n?'fill':''));
  return w;
}

/* =====================================================================
   Eigene Zahlentastatur (kompakt, ohne Bildschirmtastatur des Geräts)
   ===================================================================== */
function makeKeypad(host,onSubmit){
  let cur=null;
  const list=()=>[...host.querySelectorAll('input[type=text]:not([disabled])')].filter(i=>i.offsetParent!==null); /* nur sichtbare Felder (Etappen) */
  host.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches('input[type=text]'))cur=e.target;});
  const ensure=()=>{
    const l=list();if(!l.length)return null;
    if(!cur||!l.includes(cur))cur=l[0];
    cur.focus({preventScroll:true});return cur;
  };
  const fire=(i)=>i.dispatchEvent(new Event('input',{bubbles:true}));
  const key=(label,cls,fn,aria)=>{
    const b=el('button',{type:'button',class:'key '+(cls||''),'aria-label':aria||String(label)},label);
    b.addEventListener('pointerdown',e=>e.preventDefault());
    b.addEventListener('click',()=>{const i=ensure();if(i)fn(i);});
    return b;
  };
  const pad=el('div',{class:'keypad hidden',role:'group','aria-label':'Zahlentastatur'});
  '1234567890'.split('').forEach(d=>pad.append(key(d,'',i=>{if(i.value.length<(i.maxLength>0?i.maxLength:99)){i.value+=d;fire(i);}})));
  pad.append(key(icon('loeschen'),'fn',i=>{i.value=i.value.slice(0,-1);fire(i);},'Löschen'));
  const alt=el('button',{type:'button',class:'key fn','aria-label':'Nächstes Feld'},'Weiter ▸');
  alt.addEventListener('pointerdown',e=>e.preventDefault());
  alt.addEventListener('click',()=>{
    const i=ensure();if(!i)return;
    if(i.classList.contains('decin')){if(!i.value.includes(',')){i.value+=',';fire(i);}return;}
    const l=list();cur=l[(l.indexOf(i)+1)%l.length];cur.focus({preventScroll:true});
  });
  pad.append(alt);
  return {el:pad,refresh(){
    const l=list();
    pad.classList.toggle('hidden',!l.length||!matchMedia('(pointer:coarse)').matches);
    const dec=!!host.querySelector('.decin');alt.replaceChildren(dec?',':'Weiter ▸');alt.classList.toggle('next',!dec);alt.setAttribute('aria-label',dec?'Komma':'Nächstes Feld');alt.classList.toggle('invis',!(dec||l.length>1));
    if(l.length)ensure();
  }};
}
function setHintLabel(btn,text){btn.replaceChildren(el('span',{class:'emo'},icon('hinweis')),text);}
/* Tipp als einklappbarer Zettel: offen = Text sichtbar, zu = schmale Leiste zum Aufklappen */
function hintBox(title,lines,open,onToggle,compact){
  if(!open)return el('button',{type:'button',class:'hint hint-closed','aria-expanded':'false',onclick:()=>onToggle(true)},
    icon('hinweis'),el('span',{class:'ht'},title),el('span',{class:'hs'},'anzeigen'),icon('ab'));
  /* im Bedienpult: Überschrift steht vor dem ersten Satz, ohne eigene Zeile und ohne „Einklappen“ */
  if(compact)return el('div',{class:'hint compact'},...lines.map((x,i)=>el('p',null,...(i===0?[el('b',{class:'hl'},icon('hinweis'),title+': ')]:[]),...(typeof x==='string'?introRich(x):[x]))));
  return el('div',{class:'hint'},
    el('div',{class:'hint-head'},el('b',{class:'lab'},icon('hinweis'),title),
      el('button',{type:'button',class:'hint-toggle','aria-expanded':'true','aria-label':title+' einklappen',onclick:()=>onToggle(false)},'Einklappen',icon('auf'))),
    lines.map(x=>el('p',null,...(typeof x==='string'?introRich(x):[x])))); /* Text mit {n|d} und **fett** (wie in den Erklärungen) */
}
/* Bedienpult: oben ein Platz für die Zahlentasten ODER die Meldung/den Tipp (nie beides, die Aufgabe darüber bleibt unverändert),
   darunter die Knöpfe an festen Plätzen: links Hilfe, Mitte Nebenaktion, rechts der eine gelbe Hauptknopf */
function dockPanel(msg,pad,host){
  const panel=el('div',{class:'dockpanel'},msg||null,pad?pad.el:null);
  const dp={el:panel};
  /* Hat die Aufgabe Zahlenfelder (auch erst in Teil 2), bleibt der Platz für Tasten oder Meldung immer gleich groß */
  dp.reserve=(small)=>{
    const touch=matchMedia('(pointer:coarse)').matches,inputs=!!host&&!!host.querySelector('input[type=text]');
    panel.classList.toggle('reserve',touch&&inputs);              /* Zahlenfelder: Platz der Zahlentasten */
    panel.classList.toggle('reserve-s',touch&&!inputs&&!!small);  /* sonst: Platz für eine kurze Meldung oder einen Tipp */
  };
  dp.showMsg=(what)=>{panel.classList.add('msgmode');if(msg&&what)msg.dataset.show=what;};
  dp.showPad=()=>panel.classList.remove('msgmode');
  /* ein Tipp auf ein Eingabefeld bringt die Zahlentasten zurück (Fokus per Programm zählt nicht) */
  if(host)host.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('input[type=text]'))dp.showPad();});
  return dp;
}
function buildDock(main,{hintBtn,noteBtn,primary,pad,msg,host}){
  const dp=dockPanel(msg,pad,host);
  const bar=el('div',{class:'actionbar'},dp.el,el('div',{class:'primaryrow'},hintBtn,noteBtn,primary));
  main.append(bar);
  bar.reserve=dp.reserve;bar.showMsg=dp.showMsg;bar.showPad=dp.showPad;
  return bar;
}
/* Bilder an die Höhe anpassen: ist die Seite höher als der Bildschirm, werden die Bilder der Karte (SVG ohne Symbole) so weit
   verkleinert, wie es fehlt (nie unter FIT_MIN). Läuft nach jedem Zustandswechsel und beim Drehen des Geräts. */
const FIT_MIN=0.4;
function fitPage(){
  const card=document.querySelector('.page .card');if(!card)return;
  const doc=document.documentElement,figs=[...card.querySelectorAll('svg:not(.ic)')];
  figs.forEach(s=>{s.style.zoom='';});
  let over=doc.scrollHeight-innerHeight;
  if(over<=0||!figs.length)return;
  const total=figs.reduce((a,s)=>a+s.getBoundingClientRect().height,0);
  if(total<=0)return;
  let f=Math.max(FIT_MIN,1-over/total);
  figs.forEach(s=>{s.style.zoom=String(f);});
  over=doc.scrollHeight-innerHeight;
  if(over>0&&f>FIT_MIN){f=Math.max(FIT_MIN,f*(1-over/Math.max(1,total*f)));figs.forEach(s=>{s.style.zoom=String(f);});}
}
window.addEventListener('resize',()=>fitPage());
/* Musterlösung in einem eigenen Fenster (scrollt dort, nicht auf der Aufgabenseite) */
function openSolutionSheet(task){
  const m=modal([el('h2',null,icon('auge'),'Musterlösung'),el('div',{class:'solbody'},...buildWorkedSolution(task)),
    el('button',{type:'button',class:'btn primary',onclick:()=>m.remove()},'Schließen')]);
  m.classList.add('solsheet');
  m.addEventListener('click',e=>{if(e.target===m)m.remove();});
  return m;
}

/* Erster Satz eines Textes (Begründung bei richtigen Antworten im Check: ein Satz) */
const firstSentence=(s)=>(s||'').split(/(?<=[.!?])\s+/)[0];
/* Rückfrage mit Abbrechen (Lösung ansehen, Aufgabe überspringen): Escape und Tippen neben die Karte schließen, Fokus auf „Abbrechen“ */
function confirmModal(title,text,okLabel,onOk){
  const close=()=>{m.remove();window.removeEventListener('keydown',onKey);};
  const onKey=(e)=>{if(e.key==='Escape')close();};
  const cancel=el('button',{type:'button',class:'btn alt',onclick:close},'Abbrechen');
  const m=modal([el('h2',null,title),el('p',null,text),
    el('div',{class:'rowbtns'},cancel,el('button',{type:'button',class:'btn',onclick:()=>{close();onOk();}},okLabel))]);
  m.addEventListener('click',e=>{if(e.target===m)close();});
  window.addEventListener('keydown',onKey);
  cancel.focus();
  return m;
}

/* mountTask: baut Aufgabe, Rückmeldung, Tipps und (auf Wunsch) Lösung in host auf */
function mountTask(host,st,cb){
  const T=TASKS[st.task.type];
  const view={task:st.task,draft:st.draft,inputs:{},st,save:()=>cb.save(),locked:()=>st.status!=='open',changed:()=>{if(cb.changed)cb.changed();}}; /* changed: die Aufgabe hat ihr Aussehen geändert (Etappe, Zeilen) */
  const allHints=()=>(cb.prefixHints||[]).concat(T.hints(st.task));
  host.replaceChildren();
  const prompt=el('div',{class:'prompt'});T.prompt(st.task,prompt);
  const stage=el('div',{class:'stage'});T.render(view,stage);
  const fb=el('div',{class:'feedback','aria-live':'polite'});
  const hints=el('div',{class:'hints'});
  const sol=el('div',{class:'solution'}); /* nur ohne Bedienpult (Tests, ältere Aufrufer): Lösung in der Karte */
  host.append(prompt,stage);
  if(cb.msgHost)cb.msgHost.replaceChildren(fb,hints);else host.append(sol,fb,hints);
  const onMsg=(what)=>{if(cb.onMsg)cb.onMsg(what);}; /* das Bedienpult zeigt dann Meldung oder Tipp statt der Zahlentasten */
  const showFb=(kind,text)=>{st.fb={kind,text};fb.replaceChildren(el('div',{class:'msg '+kind},text));onMsg('fb');};
  const hideToast=()=>{const tt=document.getElementById('toast');if(tt)tt.classList.remove('show');}; /* alte Einblendung nicht über die Meldung legen */
  const renderHints=()=>{
    hints.replaceChildren();
    const hs=allHints(),i=Math.min(st.hint,hs.length)-1;
    if(i>=0)hints.append(hintBox(`Tipp ${i+1} von ${hs.length}`,hs[i],cb.msgHost?true:st.hintOpen!==false,(o)=>{st.hintOpen=o;cb.save();renderHints();},!!cb.msgHost));
  };
  /* Musterlösung: Hinweis in der Meldung und ein Knopf, der sie in einem eigenen Fenster zeigt */
  const solMsg=()=>{
    const info=el('div',{class:'msg info'},'Schau dir die Lösung genau an. Dann geht es weiter.');
    if(!cb.msgHost){sol.replaceChildren(el('div',{class:'solbox'},el('h4',null,icon('auge'),'Musterlösung'),...buildWorkedSolution(st.task)));fb.replaceChildren(info);return;}
    fb.replaceChildren(info,el('button',{type:'button',class:'btn small sollink',onclick:()=>openSolutionSheet(st.task)},icon('auge'),'Lösung ansehen'));
    onMsg('fb');
  };
  const applyMarks=(marks)=>{
    for(const k in view.inputs){const i=view.inputs[k];if(i&&i.classList)i.classList.remove('bad','good');}
    for(const k in marks){const i=view.inputs[k];if(i&&i.classList)i.classList.add(marks[k]?'good':'bad');}
  };
  if(st.fb)showFb(st.fb.kind,st.fb.text);
  renderHints();
  if(st.status==='shown'&&!T.quick)solMsg();
  const api={
    view,
    hintCount:()=>allHints().length,
    check(){
      const r=this.doCheck();if(cb.afterCheck)cb.afterCheck();return r;
    },
    doCheck(){
      if(st.status!=='open')return null;
      const res=validateTask(st.task,st.draft);
      if(res.invalid){showFb('info',res.feedback);return 'invalid';}
      const quick=!!T.quick;
      if(res.unsure){ /* „Weiß ich nicht“: nichts falsch, Antwort und Begründung zeigen, keine Serie verlieren */
        st.status='shown';showFb('info',res.feedback);
        recordSkill(st.task.skill,false);
        cb.done('unsure');return 'unsure';
      }
      if(res.correct){
        st.status='correct';
        const why=res.feedback.replace(/^Richtig!\s*/,'');
        const proof=quick?null:proofText(st.task); /* Rechnung statt Floskel, wo es eine kurze gibt */
        showFb('ok',quick?(praise()+' '+firstSentence(why)).trim():proof?'Richtig: '+proof:praise()+' '+why);
        if(!cb.probe){awardCorrect(st.attempts===0&&st.hint===0,quick);if(quick)recordSkill(st.task.skill,true);}
        cb.done('correct');return 'correct';
      }
      st.attempts++;if(!cb.probe)halveStreak();hideToast();showFb(res.soft?'warn':'bad',res.feedback);
      try{if(navigator.vibrate)navigator.vibrate(60);}catch(e){}
      /* Schnellcheck: eine Antwort pro Frage, danach Begründung statt zweitem Versuch */
      if(quick){recordSkill(st.task.skill,false);st.status='shown';cb.done('shown');return 'wrong';}
      applyMarks(res.marks||{});cb.save();
      host.classList.remove('shake');void host.offsetWidth;host.classList.add('shake');return 'wrong';
    },
    hint(){
      if(st.hint<allHints().length){st.hint++;st.hintOpen=true;cb.save();renderHints();onMsg('hint');if(view.onHint)view.onHint(st.hint);} /* z. B. der Bruchstreifen am Zahlenstrahl erscheint mit dem Tipp */
      return st.hint>=allHints().length;
    },
    solution(){
      if(st.status!=='open')return;
      st.status='shown';st.fb=null;if(!cb.msgHost)solMsg();cb.done('shown');if(cb.msgHost)openSolutionSheet(st.task);
    }
  };
  view.submit=()=>api.check();
  return api;
}

/* ---------- Gerüst: Kopfzeile, Navigation, Niveau, Hilfe ---------- */
let helpOpen=false;
function setHelp(open){
  helpOpen=open;
  const h=document.querySelector('.help');
  if(h)h.classList.toggle('open',open);
  scrim.classList.toggle('show',open);
}
scrim.addEventListener('click',()=>setHelp(false));
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&helpOpen)setHelp(false);});

function go(view,replace){
  S.view=view;persist();
  try{if(replace)history.replaceState({v:view},'');else history.pushState({v:view},'');}catch(e){}
  renderAll();window.scrollTo(0,0);
}
window.addEventListener('popstate',e=>{S.view=(e.state&&e.state.v)||{kind:'home'};persist();renderAll();});
const openEntry=(id)=>{if(!isGame(id))S.last=id;go({kind:isGame(id)?'game':'practice',id});};
function setLevel(id,l){S.levelByType[id]=l;persist();renderAll();}

/* Symbole und Kennfarbe je Übung (erw = Erweitern/Orange, kue = Kürzen/Petrol) */
const ICON={QA:'plakette',ZA:'plakette',ZQ:'haken',Z01:'lineal',Z02:'lupe',Z03:'lineal',Z04:'aus',Z05:'wechsel',Z06:'zahnrad',Z07:'lineal',Z08:'wechsel',Q00:'haken',G01:'lineal',T01:'teiler',T02:'teiler',G02:'aus',G03:'schnitt',G04:'schnitt',G05:'zahnrad',B01:'bild',U01:'luecke',U02:'frage',U03:'lupe',O01:'netz',O02:'schnitt',D01:'wechsel',D02:'wechsel',D03:'wechsel',S01:'karten',S02:'tresor',W01:'balken',W02:'balken',W03:'wechsel'};
const ACC={G02:'erw',O01:'erw',G03:'kue',G04:'kue',T01:'kue',T02:'kue',O02:'kue',G05:'mix'};
function backTarget(){
  const v=S.view;
  if(v.from==='opt'&&v.back)return v.back;
  if(v.from==='pfad'&&(v.kind==='practice'||v.kind==='lab'))return pfadView(v.kind==='lab'?'LAB':v.id);
  if(v.kind==='home'&&v.tab==='pfad'&&v.thema)return {kind:'home',tab:'pfad'};
  if(v.kind==='practice'){const g=Object.keys(GROUPS).find(k=>GROUPS[k].ids.includes(v.id));return {kind:'home',tab:'ueben',group:g};}
  if(v.kind==='game')return {kind:'home',tab:'spiele'};
  if(v.kind==='lab')return {kind:'home',tab:'ueben',group:'Entdecken'};
  if(v.kind==='home'&&v.group)return {kind:'home',tab:'ueben'};
  return null;
}
function topbar(title){
  const bt=backTarget();
  return el('header',{class:'topbar'},
    bt?el('button',{type:'button',class:'btn small backbtn',onclick:()=>go(bt)},icon('zurueck'),'Zurück'):el('span',{class:'brand'},icon('zahnrad'),el('span',{class:'bt'},'Bruchwerkstatt')),
    el('span',{class:'title'},title||''),
    chipNode());
}
const homeTab=()=>{const t=S.view.tab;return t==='ueben'||t==='spiele'||t==='rang'?t:'pfad';};
function bottomNav(){
  const tab=homeTab();
  const b=(key,ic,label)=>el('button',{type:'button',class:'navb','aria-current':String(tab===key),onclick:()=>go({kind:'home',tab:key})},icon(ic),el('span',null,label));
  return el('nav',{class:'bottomnav','aria-label':'Hauptmenü'},b('pfad','pfad','Lernen'),b('ueben','heft','Üben'),b('spiele','karten','Spiele'),b('rang','plakette','Ich'));
}
const LEVEL_LABEL={1:'Leicht',2:'Knifflig'};
function levelControl(id){
  const l=levelOf(id);
  const mk=(n,long,short)=>el('button',{type:'button','aria-pressed':String(l===n),onclick:()=>setLevel(id,n)},el('span',{class:'long'},long),el('span',{class:'short'},short));
  return el('div',{class:'seg',role:'group','aria-label':'Niveau wählen'},mk(1,'Leicht','Leicht'),mk(2,'Knifflig','Knifflig'));
}
/* Hilfespalte: rechts auf dem Desktop, Schublade (Tablet), Bottom-Sheet (Smartphone) */
function helpPanel(introId){
  const body=el('div'),stats=el('div');
  const aside=el('aside',{class:'help','aria-label':'Merkkasten und Fortschritt'});
  const det=el('details',{class:'statsbox'},el('summary',null,icon('balken'),' Dein Fortschritt'),stats);
  /* Knopf „Erklärung“: die Anleitung des Bauteils noch einmal ansehen (nur Bauteile mit Erklärung) */
  const intro=introId&&hasIntro(introId)?el('p',{class:'helpintro'},el('button',{type:'button',class:'btn small helpintrobtn',onclick:openIntro},icon('gluehbirne'),'Erklärung')):null;
  aside.append(el('div',{class:'helphead'},el('h2',null,'Merkkasten'),el('button',{type:'button',class:'btn small helpclose',onclick:()=>setHelp(false)},'Schließen')),intro,body,det);
  if(helpOpen)aside.classList.add('open');
  return {el:aside,setNotes(nodes){body.replaceChildren(...nodes);},setStats(n){stats.replaceChildren(n);}};
}
function statsBlock(key,extra){
  const P=prog(key);
  const rows=[['Bearbeitet',P.done],['Beim 1. Versuch ohne Tipp richtig',P.first],['Nach weiteren Versuchen richtig',P.later],['Übersprungen',P.skipped],['Lösung angezeigt',P.shown]];
  return el('div',null,el('table',{class:'stats'},rows.map(r=>el('tr',null,el('td',null,r[0]),el('td',null,el('b',null,String(r[1])))))),extra||null);
}

/* ---------- Übungsrunde ---------- */
/* Enter geht weiter, wenn die Aufgabe beantwortet ist (setzt renderPractice; nicht in Eingabefeldern, auf Knöpfen und hinter Fenstern) */
let practiceEnter=null;
window.addEventListener('keydown',e=>{
  if(e.key!=='Enter'||!practiceEnter||S.view.kind!=='practice'||document.querySelector('.modal'))return;
  const tag=e.target&&e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||tag==='BUTTON'||tag==='A')return;
  if(practiceEnter())e.preventDefault();
});
function renderPractice(id){
  practiceEnter=null;
  const T=TASKS[id],lvl=levelOf(id),key=keyOf(id,lvl);
  const round=S.rounds[key]||(S.rounds[key]={results:[],cur:null,size:T.size});
  const root=el('div',{class:'page'});
  root.append(topbar(T.name));
  const shell=el('div',{class:'shell'});
  const help=helpPanel(id);
  const main=el('main',{class:'work'});
  shell.append(main,help.el);
  root.append(shell);
  app.append(root);

  const fillStats=()=>help.setStats(statsBlock(key,el('p',null,el('button',{type:'button',class:'btn small danger',onclick:()=>{S.rounds[key]={results:[],cur:null,size:T.size};persist();renderAll();}},'Runde neu beginnen'))));
  if(round.results.length>=round.size&&!round.cur){
    help.setNotes(noteFor(id,null));fillStats();
    (finalModOf(id)?renderFinalSummary:T.quick?renderQuickSummary:renderSummary)(main,id,lvl,key,round);
    return;
  }
  if(!round.cur)round.cur=newState(generateUnique(id,lvl,T.ctx?T.ctx(round,lvl):null,round));
  const st=round.cur,quick=!!TASKS[st.task?st.task.type:id].quick; /* je Aufgabe, denn eine Runde darf Aufgaben verschiedener Arten mischen */
  help.setNotes(noteFor(st.task.type,st.task));fillStats();

  main.dataset.acc=ACC[id]||'';
  const ruler=el('div',{class:'ruler',role:'img'});
  const tbBlatt=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon(ICON[id]),el('span',{class:'tb-name'},T.name)),tbBlatt,el('span',{class:'tb-c'},LEVEL_LABEL[lvl]));
  const updProgress=()=>{
    const ticks=[];
    for(let i=0;i<round.size;i++){
      const r=round.results[i];
      const cls=r==='f'?'f':r==='l'?'l':r==='u'?'u':r?'x':(i===round.results.length&&st.status==='open'?'cur':'');
      ticks.push(el('i',{class:'tk '+cls}));
    }
    const x=Math.min(round.size,round.results.length+(st.status==='open'?1:0));
    ruler.replaceChildren(...ticks);
    ruler.setAttribute('aria-label',`Aufgabe ${x} von ${round.size}`);
    tbBlatt.textContent=`Aufgabe ${x} von ${round.size}`;
  };
  main.append(ruler);
  const card=el('div',{class:'card'});
  const host=el('div');
  card.append(host,titleblock);
  main.append(card);

  const hintBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('hinweis')),'Tipp');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  const primary=el('button',{type:'button',class:'btn primary'},'Prüfen');
  const solBtn=el('button',{type:'button',class:'btn small'},icon('auge'),'Lösung ansehen');
  const skipBtn=el('button',{type:'button',class:'btn small'},icon('skip'),'Überspringen');
  const pad=makeKeypad(host,()=>onPrimary());
  const links=el('div',{class:'linkrow hidden'},solBtn,skipBtn); /* liegt in der Meldung unten, nach einem Fehlversuch */
  const msg=el('div',{class:'dockmsg'});
  const bar=buildDock(main,{hintBtn,noteBtn,primary,pad,msg,host});

  const P=prog(key);
  const roundBonus=()=>{
    if(round.results.length>=round.size&&!round.bonus){
      round.bonus=true;round.info=onRoundEnd(id,lvl,round);persist();
      const info=round.info;setTimeout(()=>roundAward(info),500);
    }
  };
  const cb={
    save:()=>persist(),
    msgHost:msg,
    onMsg:(what)=>bar.showMsg(what),
    changed:()=>{pad.refresh();bar.reserve(!quick);fitPage();},
    afterCheck:()=>refresh(),
    done(kind){
      if(kind==='correct'){const first=st.attempts===0&&st.hint===0;round.results.push(first?'f':'l');P[first?'first':'later']++;}
      else if(kind==='unsure')round.results.push('u'); /* „Weiß ich nicht“: weder richtig noch falsch */
      else{round.results.push('x');P.shown++;}
      if(quick)(round.sk=round.sk||[]).push(st.task.skill);
      P.done++;persist();
      ctrl=mountTask(host,st,cb);msg.append(links);refresh();updProgress();fillStats();roundBonus();
      /* Übung: kein Auto-Weiter, die Begründung bleibt stehen. Check: richtige Antworten gehen nach 2,5 s weiter (Weiter geht jederzeit) */
      if(kind==='correct'&&quick)setTimeout(()=>{if(round.cur===st&&S.view.kind==='practice'&&S.view.id===id&&st.status==='correct'&&!document.querySelector('.modal'))next();},2500);
    }
  };
  let ctrl=mountTask(host,st,cb);msg.append(links);
  const refresh=()=>{
    const open=st.status==='open';
    const last=round.results.length>=round.size;
    primary.classList.toggle('ready',!open); /* beantwortet: „Weiter“ leuchtet auf */
    if(quick){ /* Antwort antippen, mit „Prüfen“ werten; danach „Weiter“ */
      primary.textContent=open?'Prüfen':(last?'Ergebnis':'Weiter');primary.disabled=false;
      hintBtn.classList.add('hidden');links.classList.add('hidden');pad.refresh();fitPage();return;
    }
    primary.textContent=open?'Prüfen':(last?'Runde abschließen':'Weiter');
    links.classList.toggle('hidden',!(open&&st.attempts>0));
    /* links: Hilfe. Sind alle Tipps gezeigt, wird aus „Tipp“ der Weg zur Lösung */
    const all=ctrl.hintCount(),tipsDone=st.hint>=all;
    hintBtn.dataset.mode=tipsDone?'sol':'';
    hintBtn.disabled=!open;
    if(tipsDone)hintBtn.replaceChildren(el('span',{class:'emo'},icon('auge')),'Lösung');
    else setHintLabel(hintBtn,st.hint?`Tipp ${st.hint+1}`:'Tipp');
    pad.refresh();bar.reserve(!quick);fitPage();
  };
  const next=()=>{round.cur=null;persist();renderAll();};
  const onPrimary=()=>{if(st.status==='open'){ctrl.check();refresh();}else next();};
  primary.addEventListener('click',onPrimary);
  const askSolution=()=>{
    if(st.status!=='open')return;
    confirmModal('Lösung ansehen?','Die Aufgabe zählt dann nicht als richtig.','Lösung ansehen',()=>{ctrl.solution();refresh();});
  };
  hintBtn.addEventListener('click',()=>{if(hintBtn.dataset.mode==='sol'){askSolution();return;}ctrl.hint();refresh();});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  solBtn.addEventListener('click',askSolution);
  skipBtn.addEventListener('click',()=>{
    if(st.status!=='open')return;
    confirmModal('Aufgabe überspringen?','Die Aufgabe zählt dann nicht als richtig.','Überspringen',()=>{
      if(st.status!=='open')return;
      round.results.push('s');P.skipped++;P.done++;round.cur=null;roundBonus();persist();renderAll();
    });
  });
  main.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const tg=e.target;
    if(tg.tagName==='INPUT'&&tg.type!=='radio'){e.preventDefault();onPrimary();return;}
    /* Enter auf der markierten Antwort (Kachel, Ja/Nein, Weiß ich nicht) wertet wie „Prüfen“ */
    if(st.status==='open'&&tg.tagName==='BUTTON'&&tg.getAttribute('aria-pressed')==='true'&&host.contains(tg)){e.preventDefault();onPrimary();}
  });
  practiceEnter=()=>{if(st.status==='open')return false;onPrimary();return true;};
  updProgress();refresh();
}
function renderSummary(main,id,lvl,key,round){
  const c=(ch)=>round.results.filter(x=>x===ch).length;
  const stars=c('f')/round.size>=0.8?3:c('f')/round.size>=0.5?2:c('f')>=1?1:0;
  const info=round.info,inPath=!!info&&PATH.some(m=>m.id===id),passed=inPath&&info.passed;
  const again=()=>{S.rounds[key]={results:[],cur:null,size:TASKS[id].size};persist();renderAll();};
  const toPfad=()=>go(pfadView(id));
  const btn=(label,fn,primary)=>el('button',{type:'button',class:'btn'+(primary?' primary':''),onclick:fn},label);
  const lvlBtn=btn(lvl===1?'Knifflig probieren':'Zurück zu Leicht',()=>setLevel(id,lvl===1?2:1));
  let msg=null,btns;
  if(inPath){
    const nx=pathState(moduleOf(id)).find(r=>r.next);
    if(passed){
      msg=info.firstPass?'Station fertig!'+(nx?' Als Nächstes: '+stationTitle(nx.id)+'.':''):'Wieder geschafft – stark!';
      btns=[btn('Weiter im Lernpfad',toPfad,true),btn('Nochmal',again),lvlBtn];
    }else{
      /* Punkte: ohne Tipp ganz, mit Tipp oder zweitem Versuch halb (Altdaten ohne info.points: nur die Treffer) */
      const fmt=(x)=>String(x).replace('.',','),pts=info.points!=null?info.points:info.right;
      msg='Du hast '+info.right+' von '+round.size+' richtig.'+(pts<info.right?' Aufgaben mit Tipp zählen nur halb.':'')+' Du brauchst '+fmt(info.need)+' Punkte, du hast '+fmt(pts)+'. Noch einmal?';
      btns=[btn('Nochmal',again,true),btn('Zum Lernpfad',toPfad),lvlBtn];
    }
  }else btns=[btn(`Neue Runde (${TASKS[id].size} Aufgaben)`,again,true),lvlBtn];
  main.append(el('div',{class:'card summary'},el('div',{class:'stampbox'},passed?'Station fertig':'Runde fertig'),el('p',null),bigStars(stars),
    el('p',null,`${round.size} Aufgaben bearbeitet · ${LEVEL_LABEL[lvl]}`),
    el('table',null,
      el('tr',null,el('td',null,'Beim 1. Versuch ohne Tipp richtig'),el('td',null,el('b',null,String(c('f'))))),
      el('tr',null,el('td',null,'Nach weiteren Versuchen oder mit Tipp richtig'),el('td',null,el('b',null,String(c('l'))))),
      el('tr',null,el('td',null,'Übersprungen'),el('td',null,el('b',null,String(c('s'))))),
      el('tr',null,el('td',null,'Lösung angezeigt'),el('td',null,el('b',null,String(c('x')))))),
    msg?el('p',null,msg):null,
    el('div',{class:'rowbtns'},...btns)));
}

/* Ergebnis des Abschlusschecks (QA, ZA): Punkte, Antippfragen und Rechenaufgaben getrennt, Urkunde */
function renderFinalSummary(main,id,lvl,key,round){
  const info=round.info||{},fm=finalModOf(id),sc=roundScore(round.results,round.size);
  const tapN=id==='ZA'?ZA_TAP:QA_TAP,tap=round.results.slice(0,tapN),calc=round.results.slice(tapN);
  const good=(r)=>r.filter(x=>x==='f'||x==='l').length,fmt=(x)=>String(x).replace('.',',');
  const again=()=>{S.rounds[key]={results:[],cur:null,size:TASKS[id].size};persist();renderAll();};
  const btn=(label,fn,primary)=>el('button',{type:'button',class:'btn'+(primary?' primary':''),onclick:fn},label);
  const lines=[];
  if(info.final)lines.push('Urkunde! Du hast den Lernpfad geschafft.');
  else if(sc.passed&&info.ready===false)lines.push('Bestanden! Für die Urkunde fehlen noch Pflicht-Stationen.');
  else if(!sc.passed)lines.push('Du brauchst '+fmt(sc.need)+' Punkte, du hast '+fmt(sc.points)+'.'+(sc.points<sc.right?' Aufgaben mit Tipp zählen nur halb.':'')+' Noch einmal?');
  main.append(el('div',{class:'card summary'},el('div',{class:'stampbox'},info.final?'Urkunde':sc.passed?'Bestanden':'Check fertig'),el('p',null),bigStars(sc.passed?3:sc.points>=sc.need*0.6?2:1),
    el('p',null,`${sc.right} von ${round.size} richtig · ${LEVEL_LABEL[lvl]}`),
    el('table',null,
      el('tr',null,el('td',null,'Zum Antippen richtig'),el('td',null,el('b',null,good(tap)+' von '+tap.length))),
      el('tr',null,el('td',null,id==='ZA'?'Am Zahlenstrahl richtig':'Zum Rechnen richtig'),el('td',null,el('b',null,good(calc)+' von '+calc.length)))),
    ...lines.map(x=>el('p',null,x)),
    el('div',{class:'rowbtns'},btn('Zum Lernpfad',()=>go(pfadView(id)),true),btn('Nochmal',again))));
}

/* Ergebnis des Eingangstests eines Themas (QCHK[id]) */
function renderQuickSummary(main,id,lvl,key,round){
  const qc=QCHK[id],info=round.info||{};
  const right=round.results.filter(r=>r==='f'||r==='l').length,share=right/round.size;
  const again=()=>{S.rounds[key]={results:[],cur:null,size:TASKS[id].size};persist();renderAll();};
  const btn=(label,fn,primary)=>el('button',{type:'button',class:'btn'+(primary?' primary':''),onclick:fn},label);
  const toPfad=()=>go(pfadView(id));
  const stars=bigStars(share>=0.9?3:share>=0.7?2:share>=0.4?1:0);
  /* Schnellcheck (Q00): Ergebnis je nach Stufe – von vorn beginnen, Themenliste oder fit */
  const ev=info.ev||qEvaluate(round.results,round.sk,round.size,true,qc.skills); /* Runden ohne info.ev: aus den Antworten rechnen */
  const per={};
  round.results.forEach((r,i)=>{const sk=(round.sk||[])[i];if(sk)(per[sk]=per[sk]||[]).push(r==='u'?null:(r==='f'||r==='l'));}); /* null = „Weiß ich nicht“ */
  if(ev.stufe==='start'){
    main.append(el('div',{class:'card summary'},
      el('div',{class:'stampbox'},'Check fertig'),el('p',null),
      el('p',null,`${right} von ${round.size} richtig`),
      el('p',null,'Das war noch schwer. Das ist ganz normal.'),
      el('p',null,qc.startText),
      el('div',{class:'rowbtns'},btn('Zum Lernpfad',toPfad,true),btn('Nochmal',again))));
    return;
  }
  /* Fähigkeiten in Lernpfad-Reihenfolge */
  const pathIx=(sk)=>PATH.findIndex(m=>m.id===(qc.stations[sk]||[])[0]);
  const order=qc.skills.filter(sk=>per[sk]).sort((a,b)=>pathIx(a)-pathIx(b));
  const rows=order.map(sk=>{
    const x=ev.skills[sk];
    return el('tr',null,
      el('td',null,per[sk].map(ok=>ok===null
        ?el('span',{class:'qm',role:'img','aria-label':'weiß ich nicht'},icon('frage'))
        :el('span',{class:'qm '+(ok?'ok':'bad'),role:'img','aria-label':ok?'richtig':'falsch'},icon(ok?'haken':'kreuz')))),
      el('td',null,qc.names[sk]),
      el('td',{class:x.status==='sitzt'?'sits':'ueben'},el('b',null,x.status==='sitzt'?'sitzt':x.status==='fast'?'fast':'üben')));
  });
  const sitzt=order.filter(sk=>ev.skills[sk].status==='sitzt').map(sk=>qc.names[sk]);
  const ueben=order.filter(sk=>ev.skills[sk].status!=='sitzt').map(sk=>qc.names[sk]);
  const lines=[];
  {
    if(ev.stufe==='fit')lines.push('Du bist fit!');
    if(sitzt.length)lines.push('Das sitzt schon: '+sitzt.join(', ')+'.');
    if(ueben.length)lines.push('Das solltest du noch üben: '+ueben.join(', ')+'.');
    else lines.push('Alles sitzt – stark!');
    if(ev.unsure)lines.push('Bei „Weiß ich nicht“ steht die Fähigkeit auf „üben“.');
  }
  const btns=[btn('Weiter',toPfad,true)];
  if(order.every(sk=>ev.skills[sk].status==='sitzt')&&lvl===1)btns.push(btn('Knifflig probieren',()=>setLevel(id,2)));
  btns.push(btn('Nochmal',again));
  main.append(el('div',{class:'card summary'},
    el('div',{class:'stampbox'},'Check fertig'),el('p',null),stars,
    el('p',null,`${right} von ${round.size} richtig · ${LEVEL_LABEL[lvl]}`),
    el('table',{class:'qsum'},...rows),
    ...lines.map(x=>el('p',null,x)),
    el('div',{class:'rowbtns'},...btns)));
}

