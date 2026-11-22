'use strict';
/* =====================================================================
   Phase 6 des Umbaus: Werkstatt-Team (P18), Sprechblasen (P21), Abzeichen und Wochen-Serie (P19),
   Kennfarben je Etappe und kleine Animationen (P25), Lernlandkarte als Startseite (P2).
   ===================================================================== */

/* ---------- P18 Werkstatt-Team: vier Figuren aus js/names.js ---------- */
const TEAM={
  Malik:{role:'rechnet schnell und macht typische Fehler',shirt:'var(--erw)',hair:'short'},
  Juna:{role:'findet Regeln und Abkürzungen',shirt:'var(--kue)',hair:'long'},
  Ida:{role:'denkt in Bildern und schätzt',shirt:'var(--ok)',hair:'bun'},
  Theo:{role:'prüft und kontrolliert',shirt:'var(--amber-fill)',hair:'curl'}
};
/* Figur als Bild (img/team/<name>-<pose>.webp, freigestellt). Posen: wave, think, cheer. size = Breite des Rahmens, die Figur ist höher als breit. */
function teamAvatar(name,size,pose){
  const T=TEAM[name]?name:'Ida',s=size||44,p=['wave','think','cheer'].includes(pose)?pose:'wave';
  return el('img',{class:'avatar',src:'img/team/'+T.toLowerCase()+'-'+p+'.webp',alt:'',width:Math.round(s*1.3),height:Math.round(s*1.3*184/139),loading:'lazy',decoding:'async','data-name':name});
}

/* P21 Sprechblase einer Figur: höchstens eine gleichzeitig, wegklickbar */
function speechBubble(name,text,pose){
  document.querySelectorAll('.bubble').forEach(b=>b.remove());
  const b=el('div',{class:'bubble',role:'note'},el('span',{class:'bav','aria-hidden':'true'},teamAvatar(name,30,pose)),
    el('p',{class:'btx'},el('b',null,name+': '),text),
    el('button',{type:'button',class:'bclose','aria-label':'Sprechblase schließen',onclick:()=>b.remove()},'×'));
  return b;
}

/* ---------- P25 Kennfarben je Etappe und Animationen ---------- */
const ET_COLOR={F:'F',E:'E',Z:'Z',W:'W',R:'R',H:'H'};
const etOf=(mod)=>mod&&mod.letter&&ET_COLOR[mod.letter]?mod.letter:null;
const animOn=()=>!(S.ui&&S.ui.anim===false)&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function animOptions(){
  const on=!(S.ui&&S.ui.anim===false);
  const seg=el('div',{class:'seg optseg',role:'group','aria-label':'Animationen'});
  [[true,'An'],[false,'Aus']].forEach(([v,label])=>{const b=el('button',{type:'button','aria-pressed':String(on===v),onclick:()=>{S.ui=S.ui||{};S.ui.anim=v;persist();seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}},label);seg.append(b);});
  return el('div',{class:'optsec'},el('span',{class:'lblm'},'Kleine Animationen'),seg);
}

/* ---------- P19 Abzeichen je Gruppe und Plus-Abzeichen ---------- */
const BADGE_GROUPS=['Verstehen','Üben','Anwenden','Knobeln'];
function badgesOf(mod){
  const out=[];
  BADGE_GROUPS.forEach(g=>{
    const ids=mod.path.filter(p=>p.grp===g&&!/LAB$/.test(p.id)).map(p=>p.id);
    if(!ids.length)return;
    out.push({mod:mod.id,grp:g,plus:g==='Knobeln',label:(g==='Knobeln'?'Plus-Abzeichen':g)+' '+mod.letter,have:ids.every(stationDone),n:ids.filter(stationDone).length,of:ids.length});
  });
  return out;
}
const allBadges=()=>activeModules().reduce((a,m)=>a.concat(badgesOf(m)),[]);
function badgeNode(b,small){
  const m=moduleById(b.mod);
  return el('span',{class:'badge'+(b.have?' have':'')+(b.plus?' plus':'')+(small?' sm':''),'data-et':etOf(m),role:'img','aria-label':b.label+(b.have?': geschafft':': '+b.n+' von '+b.of)},
    icon(b.plus?'zirkel':TAKT[b.grp].icon),small?null:el('small',null,b.label));
}
/* neue Abzeichen nach einer Runde melden (einmal) */
function checkBadges(){
  S.badges=S.badges&&typeof S.badges==='object'?S.badges:{};
  const fresh=allBadges().filter(b=>b.have&&!S.badges[b.mod+':'+b.grp]);
  fresh.forEach(b=>{S.badges[b.mod+':'+b.grp]=Date.now();});
  if(fresh.length){persist();setTimeout(()=>badgeCard(fresh[0]),1200);}
  return fresh;
}
function badgeCard(b){
  const fig=['Ida','Juna','Theo','Malik'][BADGE_GROUPS.indexOf(b.grp)%4];
  const m=modal([el('div',{class:'badgebig'+(animOn()?' pop':'')},badgeNode(b)),el('h2',null,'Neues Abzeichen'),el('p',{class:'rankname'},b.label),
    speechBubble(fig,b.plus?'Stark geknobelt!':'Diese Gruppe hast du geschafft!','cheer'),
    el('button',{type:'button',class:'btn primary',onclick:()=>m.remove()},'Weiter')]);
}

/* ---------- P19 Wochen-Serie: „3 von 5 Schultagen“ statt ununterbrochener Tage ---------- */
const WEEK_GOAL=3;
function weekStart(d){const x=new Date(d);const wd=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-wd);return x;}
function weekCount(start){let n=0;for(let i=0;i<5;i++){const x=new Date(start);x.setDate(x.getDate()+i);if(S.days&&S.days[dayKey(x)])n++;}return n;}
function weekStreak(){
  let st=weekStart(new Date()),n=0;
  if(weekCount(st)<WEEK_GOAL)st.setDate(st.getDate()-7);
  for(let k=0;k<60&&weekCount(st)>=WEEK_GOAL;k++){n++;st.setDate(st.getDate()-7);}
  return n;
}
function weekCard(){
  const c=weekCount(weekStart(new Date())),ws=weekStreak(),row=el('span',{class:'wdots',role:'img','aria-label':c+' von 5 Schultagen geübt'});
  for(let i=0;i<5;i++)row.append(el('i',{class:i<c?'on':''}));
  return el('div',{class:'daycard weekcard'},el('span',{class:'lamp'+(c>=WEEK_GOAL?' on':''),'aria-hidden':'true'},c>=WEEK_GOAL?icon('haken'):null),
    el('span',{class:'dc-tx'},el('b',null,'Wochenziel'),el('small',null,c>=WEEK_GOAL?'geschafft':WEEK_GOAL+' von 5 Schultagen')),row,
    ws>0?el('small',{class:'gstreak'},ws+(ws===1?' Woche':' Wochen')+' geschafft'):null);
}

/* ---------- P2 Lernlandkarte (Reiter „Lernen“) ---------- */
/* Reihenfolge und Verzweigung: F → E → zwei Stränge (Ordnen: Z → W, Rechnen: R → H) */
const MAP_LAYOUT={trunk:['verstehen','veraendern'],strands:[{name:'Strang Ordnen',ids:['zahlenstrahl','vergleichen']},{name:'Strang Rechnen',ids:['addsub','addsub2']}]};
/* die Etappe, bei der es weitergeht: zuerst der Stamm, dann der Strang mit dem meisten Fortschritt */
function focusModule(){
  const act=activeModules(),open=(m)=>m&&(lernenZustand(m)==='gate'||pfadInfo(m).go1);
  for(const id of MAP_LAYOUT.trunk){const m=moduleById(id);if(open(m))return m;}
  const cand=[].concat(...MAP_LAYOUT.strands.map(s=>s.ids)).map(moduleById).filter(open);
  return cand.sort((a,b)=>pfadInfo(b).doneN-pfadInfo(a).doneN)[0]||act.find(open)||null;
}
function stationDots(mod){
  const rows=pathState(mod),box=el('span',{class:'sdots','aria-hidden':'true'});
  rows.filter(r=>!/LAB$/.test(r.id)&&r.m.lvl!=='basis').forEach(r=>box.append(el('i',{class:(r.m.lvl==='plus'?'p':'k')+(r.done?' on':'')+(r.next?' cur':'')+(r.m.final?' fin':'')})));
  return box;
}
function mapNode(m,focus){
  const card=moduleCard(m,m===focus);
  card.classList.add('etnode');card.dataset.et=etOf(m)||'';
  card.prepend(el('span',{class:'etl','aria-hidden':'true'},m.letter||''));
  card.append(stationDots(m),el('span',{class:'badgerow'},...badgesOf(m).filter(b=>b.have).map(b=>badgeNode(b,true))));
  const wrap=el('div',{class:'etwrap'+(m===focus?' here':'')},card);
  if(m===focus)wrap.append(el('span',{class:'standort','aria-hidden':'true'},teamAvatar('Ida',30,'wave'),el('small',null,'Du bist hier')));
  return wrap;
}
function lernenTab(home){
  const focus=focusModule();
  home.append(el('h1',null,'Lernen'));
  /* Karte „Weiter“ ganz oben */
  if(focus){
    const z=lernenZustand(focus),go1=pfadInfo(focus).go1;
    home.append(bigBtn('play',()=>{if(z==='gate')go({kind:'home',tab:'pfad',thema:focus.id});else openStation(go1.id);},
      z==='gate'?'Weiter: '+focus.name:'Weiter: '+stationLabel(go1.id),z==='gate'?'Etappe '+focus.letter+' beginnt mit dem Eingangstest.':focus.name,null,'go mapgo'));
  }
  const map=el('div',{class:'tgrid lmap',role:'list','aria-label':'Lernlandkarte'});
  MAP_LAYOUT.trunk.forEach(id=>{const m=moduleById(id);if(m&&m.status==='aktiv')map.append(el('div',{class:'mapstep',role:'listitem'},mapNode(m,focus)));});
  const fork=el('div',{class:'mapfork',role:'listitem'});
  MAP_LAYOUT.strands.forEach(s=>{
    const col=el('div',{class:'strand'},el('p',{class:'strandname'},s.name));
    s.ids.forEach(id=>{const m=moduleById(id);if(m&&m.status==='aktiv')col.append(mapNode(m,focus));});
    fork.append(col);
  });
  map.append(fork);
  /* Etappen, die nicht im Bild stehen (Sicherheit, falls neue dazukommen) */
  activeModules().filter(m=>!MAP_LAYOUT.trunk.includes(m.id)&&!MAP_LAYOUT.strands.some(s=>s.ids.includes(m.id))).forEach(m=>map.append(el('div',{class:'mapstep',role:'listitem'},mapNode(m,focus))));
  home.append(map);
  const soon=plannedModules();
  if(soon.length)home.append(el('section',{class:'soon','aria-label':'Geplante Etappen'},el('h2',{class:'area'},'Bald'),
    el('ul',null,...soon.map(m=>el('li',null,icon(m.icon),el('span',null,el('b',null,m.name),el('small',null,m.desc)),el('em',null,'geplant'))))));
}
