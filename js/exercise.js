'use strict';
/* =====================================================================
   7 Aufgaben-Oberfläche (mountTask), Runden, Fortschritt
   ===================================================================== */
const AREAS=['Grundlagen','Umkehraufgaben','Offene Aufgaben','Darstellungen umwandeln','Spiele'];
const PRACTICE_ORDER=['Q00','G01','T01','G02','G03','G04','G05','B01','U01','U02','U03','O01','O02','D01','D02','D03'];
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
function generateUnique(typeId,level,ctx){
  let t=null;
  for(let i=0;i<30;i++){
    t=generateTask(typeId,level,null,ctx);
    const s=sigOf(t);
    if(!SEEN.has(s)){SEEN.add(s);return t;}
  }
  return t;
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
const PRAISE=['Maßgenau.','Sitzt.','Sauber gerechnet.','Stimmt auf den Millimeter.','Passt.','Volltreffer.','Genau so.','Bauteil in Ordnung.'];
let lastPraise=-1;
function praise(){
  let i;do{i=Math.floor(Math.random()*PRAISE.length);}while(i===lastPraise);
  lastPraise=i;return PRAISE[i];
}
function awardCorrect(first,quick){
  S.streak=(S.streak||0)+1;
  S.bestStreak=Math.max(S.bestStreak||0,S.streak);
  if(quick){award(3,S.streak>=3?S.streak+' in Folge':'');return;}
  const bonus=first?Math.min(S.streak-1,5):0;
  award((first?10:5)+bonus,S.streak>=3?S.streak+' in Folge':(first?'Sauber':'Richtig'));
}
function breakStreak(){if(S.streak){S.streak=0;persist();updateChip();}}
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
  const list=()=>[...host.querySelectorAll('input[type=text]:not([disabled])')];
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
  const alt=el('button',{type:'button',class:'key fn','aria-label':'Nächstes Feld'},icon('tab'));
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
    const dec=!!host.querySelector('.decin');alt.replaceChildren(dec?',':icon('tab'));alt.setAttribute('aria-label',dec?'Komma':'Nächstes Feld');alt.style.visibility=(dec||l.length>1)?'visible':'hidden';
    if(l.length)ensure();
  }};
}
function setHintLabel(btn,text){btn.replaceChildren(el('span',{class:'emo'},icon('hinweis')),text);}
/* Tipp als einklappbarer Zettel: offen = Text sichtbar, zu = schmale Leiste zum Aufklappen */
function hintBox(title,lines,open,onToggle){
  if(!open)return el('button',{type:'button',class:'hint hint-closed','aria-expanded':'false',onclick:()=>onToggle(true)},
    icon('hinweis'),el('span',{class:'ht'},title),el('span',{class:'hs'},'anzeigen'),icon('ab'));
  return el('div',{class:'hint'},
    el('div',{class:'hint-head'},el('b',{class:'lab'},icon('hinweis'),title),
      el('button',{type:'button',class:'hint-toggle','aria-expanded':'true','aria-label':title+' einklappen',onclick:()=>onToggle(false)},'Einklappen',icon('auf'))),
    lines.map(x=>el('p',null,x)));
}
function buildDock(main,{hintBtn,noteBtn,primary,pad,msg}){
  const bar=el('div',{class:'actionbar'},msg||null,pad?pad.el:null,el('div',{class:'primaryrow'},hintBtn,noteBtn,primary));
  main.append(bar);
  return bar;
}

/* mountTask: baut Aufgabe, Rückmeldung, Tipps und (auf Wunsch) Lösung in host auf */
function mountTask(host,st,cb){
  const T=TASKS[st.task.type];
  const view={task:st.task,draft:st.draft,inputs:{},st,save:()=>cb.save(),locked:()=>st.status!=='open'};
  const allHints=()=>(cb.prefixHints||[]).concat(T.hints(st.task));
  host.replaceChildren();
  const prompt=el('div',{class:'prompt'});T.prompt(st.task,prompt);
  const stage=el('div',{class:'stage'});T.render(view,stage);
  const fb=el('div',{class:'feedback','aria-live':'polite'});
  const hints=el('div',{class:'hints'});
  const sol=el('div',{class:'solution'});
  host.append(prompt,stage,sol);
  if(cb.msgHost)cb.msgHost.replaceChildren(fb,hints);else host.append(fb,hints);
  const showFb=(kind,text)=>{st.fb={kind,text};fb.replaceChildren(el('div',{class:'msg '+kind},text));};
  const hideToast=()=>{const tt=document.getElementById('toast');if(tt)tt.classList.remove('show');}; /* alte Einblendung nicht über die Meldung legen */
  const renderHints=()=>{
    hints.replaceChildren();
    const hs=allHints(),i=Math.min(st.hint,hs.length)-1;
    if(i>=0)hints.append(hintBox(`Tipp ${i+1} von ${hs.length}`,hs[i],st.hintOpen!==false,(o)=>{st.hintOpen=o;cb.save();renderHints();}));
  };
  const showSolution=()=>{sol.replaceChildren(el('div',{class:'solbox'},el('h4',null,icon('auge'),'Musterlösung'),...buildWorkedSolution(st.task)));setTimeout(()=>sol.scrollIntoView({block:'nearest',behavior:'smooth'}),50);};
  const applyMarks=(marks)=>{
    for(const k in view.inputs){const i=view.inputs[k];if(i&&i.classList)i.classList.remove('bad','good');}
    for(const k in marks){const i=view.inputs[k];if(i&&i.classList)i.classList.add(marks[k]?'good':'bad');}
  };
  if(st.fb)showFb(st.fb.kind,st.fb.text);
  renderHints();
  if(st.status==='shown'&&!T.quick)showSolution();
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
      if(res.correct){
        st.status='correct';
        showFb('ok',quick?praise():praise()+' '+res.feedback.replace(/^Richtig!\s*/,''));
        awardCorrect(st.attempts===0&&st.hint===0,quick);
        if(quick)recordSkill(st.task.skill,true);
        cb.done('correct');return 'correct';
      }
      st.attempts++;breakStreak();hideToast();showFb(res.soft?'warn':'bad',res.feedback);
      try{if(navigator.vibrate)navigator.vibrate(60);}catch(e){}
      /* Schnellcheck: eine Antwort pro Frage, danach Begründung statt zweitem Versuch */
      if(quick){recordSkill(st.task.skill,false);st.status='shown';cb.done('shown');return 'wrong';}
      applyMarks(res.marks||{});cb.save();
      host.classList.remove('shake');void host.offsetWidth;host.classList.add('shake');return 'wrong';
    },
    hint(){
      if(st.hint<allHints().length){st.hint++;st.hintOpen=true;cb.save();renderHints();}
      return st.hint>=allHints().length;
    },
    solution(){
      if(st.status!=='open')return;
      st.status='shown';st.fb=null;fb.replaceChildren(el('div',{class:'msg info'},'Schau dir die Lösung genau an. Dann geht es weiter.'));showSolution();cb.done('shown');
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

const GROUPS={
  'Entdecken':{pat:'dots',icon:'lupe',text:'Labor, Schnellcheck, Teilbarkeit, Erweitern und Kürzen',ids:['LAB','Q00','G01','T01','G02','G03','G04','G05','B01']},
  'Knobeln':{pat:'dash',icon:'zirkel',text:'Lücken, Fehler und mehrere Lösungen',ids:['U01','U02','U03','O01','O02']},
  'Umwandeln':{pat:'hatch',icon:'wechsel',text:'Dezimalzahlen und gemischte Zahlen',ids:['D01','D02','D03']}
};
/* Symbole und Kennfarbe je Übung (erw = Erweitern/Orange, kue = Kürzen/Petrol) */
const ICON={Q00:'blitz',Q01:'blitz',G01:'lineal',T01:'teiler',G02:'aus',G03:'schnitt',G04:'schnitt',G05:'zahnrad',B01:'bild',U01:'luecke',U02:'frage',U03:'lupe',O01:'netz',O02:'schnitt',D01:'wechsel',D02:'wechsel',D03:'wechsel',S01:'karten',S02:'tresor'};
const ACC={G02:'erw',O01:'erw',G03:'kue',G04:'kue',T01:'kue',O02:'kue',G05:'mix'};
function backTarget(){
  const v=S.view;
  if(v.from==='opt'&&v.back)return v.back;
  if(v.from==='pfad'&&(v.kind==='practice'||v.kind==='lab'))return {kind:'home',tab:'pfad'};
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
  return el('nav',{class:'bottomnav','aria-label':'Hauptmenü'},b('pfad','pfad','Pfad'),b('ueben','heft','Üben'),b('spiele','karten','Spiele'),b('rang','plakette','Rang'));
}
const LEVEL_LABEL={1:'Leicht',2:'Knifflig'};
function levelControl(id){
  const l=levelOf(id);
  const mk=(n,long,short)=>el('button',{type:'button','aria-pressed':String(l===n),onclick:()=>setLevel(id,n)},el('span',{class:'long'},long),el('span',{class:'short'},short));
  return el('div',{class:'seg',role:'group','aria-label':'Niveau wählen'},mk(1,'Niveau 1 – Grundlagen','Niveau 1'),mk(2,'Niveau 2 – Knifflig','Niveau 2'));
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
function renderPractice(id){
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
    (T.quick?renderQuickSummary:renderSummary)(main,id,lvl,key,round);
    return;
  }
  if(!round.cur)round.cur=newState(generateUnique(id,lvl,T.ctx?T.ctx(round):null));
  const st=round.cur,quick=!!T.quick;
  help.setNotes(noteFor(id,st.task));fillStats();

  main.dataset.acc=ACC[id]||'';
  const ruler=el('div',{class:'ruler',role:'img'});
  const tbBlatt=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon(ICON[id]),el('span',{class:'tb-name'},T.name)),tbBlatt,el('span',{class:'tb-c'},LEVEL_LABEL[lvl]));
  const updProgress=()=>{
    const ticks=[];
    for(let i=0;i<round.size;i++){
      const r=round.results[i];
      const cls=r==='f'?'f':r==='l'?'l':r?'x':(i===round.results.length&&st.status==='open'?'cur':'');
      ticks.push(el('i',{class:'tk '+cls}));
    }
    const x=Math.min(round.size,round.results.length+(st.status==='open'?1:0));
    ruler.replaceChildren(...ticks);
    ruler.setAttribute('aria-label',`Aufgabe ${x} von ${round.size}`);
    tbBlatt.textContent=`Blatt ${x}/${round.size}`;
  };
  main.append(ruler);
  const card=el('div',{class:'card'});
  const host=el('div');
  card.append(host,titleblock);
  main.append(card);

  const hintBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('hinweis')),'Tipp');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  const primary=el('button',{type:'button',class:'btn primary'},'Prüfen');
  const solBtn=el('button',{type:'button',class:'linkbtn'},icon('auge'),'Lösung ansehen');
  const skipBtn=el('button',{type:'button',class:'linkbtn'},icon('skip'),'Überspringen');
  const pad=makeKeypad(host,()=>onPrimary());
  const links=el('div',{class:'linkrow hidden'},solBtn,skipBtn);
  main.insertBefore(links,null);
  const msg=el('div',{class:'dockmsg'});
  buildDock(main,{hintBtn,noteBtn,primary,pad,msg});

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
    afterCheck:()=>refresh(),
    done(kind){
      if(kind==='correct'){const first=st.attempts===0&&st.hint===0;round.results.push(first?'f':'l');P[first?'first':'later']++;}
      else{round.results.push('x');P.shown++;}
      if(quick)(round.sk=round.sk||[]).push(st.task.skill);
      P.done++;persist();
      ctrl=mountTask(host,st,cb);refresh();updProgress();fillStats();roundBonus();
      if(kind==='correct')setTimeout(()=>{if(round.cur===st&&S.view.kind==='practice'&&S.view.id===id&&st.status==='correct')next();},quick?700:1500);
    }
  };
  let ctrl=mountTask(host,st,cb);
  const refresh=()=>{
    const open=st.status==='open';
    const last=round.results.length>=round.size;
    if(quick){ /* Antippen ist die Antwort; „Weiter“ erst danach */
      primary.textContent=last?'Ergebnis':'Weiter';primary.disabled=open;
      hintBtn.classList.add('hidden');links.classList.add('hidden');pad.refresh();return;
    }
    primary.textContent=open?'Prüfen':(last?'Runde abschließen':'Weiter');
    links.classList.toggle('hidden',!(open&&(st.attempts>0||st.hint>0)));
    const all=ctrl.hintCount();
    hintBtn.disabled=st.hint>=all;
    setHintLabel(hintBtn,st.hint>=all?'Alle Tipps':(st.hint?`Tipp ${st.hint+1}`:'Tipp'));
    pad.refresh();
  };
  const next=()=>{round.cur=null;persist();renderAll();};
  const onPrimary=()=>{if(st.status==='open'){ctrl.check();refresh();}else next();};
  primary.addEventListener('click',onPrimary);
  hintBtn.addEventListener('click',()=>{ctrl.hint();refresh();});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  solBtn.addEventListener('click',()=>{ctrl.solution();refresh();});
  skipBtn.addEventListener('click',()=>{
    if(st.status!=='open')return;
    round.results.push('s');P.skipped++;P.done++;round.cur=null;roundBonus();persist();renderAll();
  });
  main.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='radio'){e.preventDefault();onPrimary();}
  });
  updProgress();refresh();
}
function renderSummary(main,id,lvl,key,round){
  const c=(ch)=>round.results.filter(x=>x===ch).length;
  const stars=c('f')/round.size>=0.8?3:c('f')/round.size>=0.5?2:c('f')>=1?1:0;
  const info=round.info,inPath=!!info&&PATH.some(m=>m.id===id),passed=inPath&&info.passed;
  const again=()=>{S.rounds[key]={results:[],cur:null,size:TASKS[id].size};persist();renderAll();};
  const toPfad=()=>go({kind:'home',tab:'pfad'});
  const btn=(label,fn,primary)=>el('button',{type:'button',class:'btn'+(primary?' primary':''),onclick:fn},label);
  const lvlBtn=btn(lvl===1?'Knifflig probieren':'Zurück zu Leicht',()=>setLevel(id,lvl===1?2:1));
  let msg=null,btns;
  if(inPath){
    const nx=pathState().find(r=>r.next);
    if(passed){
      msg=info.firstPass?'Bauteil fertig!'+(nx?' Als Nächstes: '+stationTitle(nx.id)+'.':''):'Wieder geschafft – stark!';
      btns=[btn('Weiter im Lernpfad',toPfad,true),btn('Nochmal',again),lvlBtn];
    }else{
      msg='Du hast '+info.right+' von '+round.size+' richtig. Für das Bauteil brauchst du '+info.need+'. Noch einmal?';
      btns=[btn('Nochmal',again,true),btn('Zum Lernpfad',toPfad),lvlBtn];
    }
  }else btns=[btn(`Neue Runde (${TASKS[id].size} Aufgaben)`,again,true),lvlBtn];
  main.append(el('div',{class:'card summary'},el('div',{class:'stampbox'},passed?'Bauteil fertig':'Runde fertig'),el('p',null),bigStars(stars),
    el('p',null,`${round.size} Aufgaben bearbeitet · ${LEVEL_LABEL[lvl]}`),
    el('table',null,
      el('tr',null,el('td',null,'Beim 1. Versuch ohne Tipp richtig'),el('td',null,el('b',null,String(c('f'))))),
      el('tr',null,el('td',null,'Nach weiteren Versuchen oder mit Tipp richtig'),el('td',null,el('b',null,String(c('l'))))),
      el('tr',null,el('td',null,'Übersprungen'),el('td',null,el('b',null,String(c('s'))))),
      el('tr',null,el('td',null,'Lösung angezeigt'),el('td',null,el('b',null,String(c('x')))))),
    msg?el('p',null,msg):null,
    el('div',{class:'rowbtns'},...btns)));
}

/* Ergebnis des Schnellchecks (Q00) und des Kurztests (Q01) */
function renderQuickSummary(main,id,lvl,key,round){
  const info=round.info||{};
  const right=round.results.filter(r=>r==='f'||r==='l').length,share=right/round.size;
  const again=()=>{S.rounds[key]={results:[],cur:null,size:TASKS[id].size};persist();renderAll();};
  const btn=(label,fn,primary)=>el('button',{type:'button',class:'btn'+(primary?' primary':''),onclick:fn},label);
  const toPfad=()=>go({kind:'home',tab:'pfad'});
  const stars=bigStars(share>=0.9?3:share>=0.7?2:share>=0.4?1:0);
  if(id==='Q01'){
    const q=info.quiz||{},st=q.station||S.quizFor,name=st?stationTitle(st):'das Bauteil',ok=!!q.passed;
    main.append(el('div',{class:'card summary'},
      el('div',{class:'stampbox'},ok?'Kurztest bestanden':'Noch nicht'),el('p',null),stars,
      el('p',null,`${right} von ${round.size} richtig`),
      el('p',null,ok?name+' ist geschafft (per Check). Es geht weiter.':'Du brauchst '+needOf(round.size)+' von '+round.size+' richtig. Übe zuerst das Bauteil – dann klappt es.'),
      el('div',{class:'rowbtns'},...(ok?[btn('Weiter im Lernpfad',toPfad,true)]:[btn('Zum Bauteil',()=>openStation(st),true),btn('Nochmal',again),btn('Zum Lernpfad',toPfad)]))));
    return;
  }
  /* Schnellcheck (Q00): Ergebnis je nach Stufe – von vorn beginnen, Themenliste oder fit */
  const ev=info.ev||qEvaluate(round.results,round.sk,round.size,true); /* Runden ohne info.ev: aus den Antworten rechnen */
  const per={};
  round.results.forEach((r,i)=>{const sk=(round.sk||[])[i];if(sk)(per[sk]=per[sk]||[]).push(r==='f'||r==='l');});
  if(ev.stufe==='start'){
    main.append(el('div',{class:'card summary'},
      el('div',{class:'stampbox'},'Check fertig'),el('p',null),
      el('p',null,`${right} von ${round.size} richtig`),
      el('p',null,'Das war noch schwer. Das ist ganz normal.'),
      el('p',null,'Im Lernpfad lernst du alles Schritt für Schritt. Fang vorn an: Erst probierst du im Bruchlabor aus.'),
      el('div',{class:'rowbtns'},btn('Lernpfad von vorn beginnen',()=>openStation('LAB'),true),btn('Nochmal',again))));
    return;
  }
  /* Fähigkeiten in Lernpfad-Reihenfolge */
  const pathIx=(sk)=>PATH.findIndex(m=>m.id===Q_STATION[sk]);
  const order=Q_SKILLS.filter(sk=>per[sk]).sort((a,b)=>pathIx(a)-pathIx(b));
  const rows=order.map(sk=>{
    const x=ev.skills[sk];
    return el('tr',null,
      el('td',null,per[sk].map(ok=>el('span',{class:'qm '+(ok?'ok':'bad'),role:'img','aria-label':ok?'richtig':'falsch'},icon(ok?'haken':'kreuz')))),
      el('td',null,Q_SKILL_NAME[sk]),
      el('td',{class:x.status==='sitzt'?'sits':'ueben'},el('b',null,x.status==='sitzt'?'sitzt':x.status==='fast'?'fast':'üben')));
  });
  const placed=(info.placed||[]).map(stationTitle);
  const plan=planOf();
  const lines=[];
  if(info.final)lines.push('Urkunde! Du hast den Lernpfad geschafft.');
  else{
    if(ev.stufe==='fit')lines.push('Du bist fit!');
    if(placed.length)lines.push('Per Check fertig: '+placed.join(', ')+'.');
    if(plan){
      lines.push((ev.stufe==='fit'?'Noch offen: ':'Das solltest du üben: ')+plan.items.filter(it=>!it.done).map(it=>stationTitle(it.id)).join(', ')+'.');
      if(plan.items.some(it=>!it.done&&it.status==='fast'))lines.push('Bei „fast“ kannst du es mit dem Kurztest versuchen.');
    }else if(!placed.length)lines.push('Alles sitzt – stark!');
    if(info.ready&&!info.passed)lines.push('Für die Urkunde brauchst du '+needOf(round.size)+' von '+round.size+' richtig.');
  }
  const btns=[];
  const nowIt=plan&&plan.now;
  if(nowIt){
    const nm=stationTitle(nowIt.id);
    btns.push(nowIt.status==='fast'&&PATH_SKILLS[nowIt.id]?btn('Kurztest: '+nm,()=>startKurztest(nowIt.id),true):btn('Mit '+nm+' beginnen',()=>openStation(nowIt.id),true),btn('Zum Lernpfad',toPfad));
  }else btns.push(btn('Weiter im Lernpfad',toPfad,true));
  if(order.every(sk=>ev.skills[sk].status==='sitzt')&&lvl===1)btns.push(btn('Knifflig probieren',()=>setLevel(id,2)));
  btns.push(btn('Nochmal',again));
  main.append(el('div',{class:'card summary'},
    el('div',{class:'stampbox'},'Check fertig'),el('p',null),stars,
    el('p',null,`${right} von ${round.size} richtig · ${LEVEL_LABEL[lvl]}`),
    el('table',{class:'qsum'},...rows),
    ...lines.map(x=>el('p',null,x)),
    el('div',{class:'rowbtns'},...btns)));
}

