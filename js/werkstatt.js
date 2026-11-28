'use strict';
/* =====================================================================
   Abzeichen und Wochen-Serie (P19), Kennfarben je Etappe und kleine Animationen (P25),
   Lernlandkarte als Startseite (P2). Die Werkstatt-Figuren gibt es seit 27.11.2026 nicht mehr.
   ===================================================================== */

/* ---------- P25 Kennfarben je Etappe und Animationen ---------- */
const ET_COLOR={F:'F',E:'E',Z:'Z',W:'W',R:'R',H:'H',V:'V',K:'K'};
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
    out.push({mod:mod.id,grp:g,plus:g==='Knobeln',label:(g==='Knobeln'?'Plus-Abzeichen':g)+' '+codeOf(mod),have:ids.every(stationDone),n:ids.filter(stationDone).length,of:ids.length});
  });
  if(typeof mod.badges==='function')out.push(...mod.badges()); /* Abzeichen für Lernhandlungen (Etappe V) */
  return out;
}
const allBadges=()=>activeModules().reduce((a,m)=>a.concat(badgesOf(m)),[]);
function badgeNode(b,small){
  const m=moduleById(b.mod);
  return el('span',{class:'badge'+(b.have?' have':'')+(b.plus?' plus':'')+(small?' sm':''),'data-et':etOf(m),role:'img','aria-label':b.label+(b.have?': geschafft':': '+b.n+' von '+b.of)},
    icon(b.icon||(b.plus?'zirkel':TAKT[b.grp].icon)),small?null:el('small',null,b.label));
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
  const m=modal([el('div',{class:'badgebig'+(animOn()?' pop':'')},badgeNode(b)),el('h2',null,'Neues Abzeichen'),el('p',{class:'rankname'},b.label),
    el('p',null,b.say||(b.plus?'Stark geknobelt!':'Diese Gruppe hast du geschafft!')), /* ohne Figur (27.11.2026) */
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
const MAP_LAYOUT={trunk:['verstehen','veraendern'],strands:[{name:'Brüche ordnen',sub:'Zahlenstrahl und Vergleichen',icon:'lineal',et:'Z',ids:['zahlenstrahl','vergleichen']},{name:'Brüche rechnen',sub:'Plus, Minus, mal und durch',icon:'plusminus',et:'R',ids:['addsub','addsub2','vervielfachen','rechnen']}]}; /* zwei Wege nach Etappe E */
/* die Etappe, bei der es weitergeht: zuerst der Stamm, dann der Strang mit dem meisten Fortschritt */
function focusModule(){
  const act=activeModules(),open=(m)=>m&&(lernenZustand(m)==='gate'||pfadInfo(m).go1);
  for(const id of MAP_LAYOUT.trunk){const m=moduleById(id);if(open(m))return m;}
  const cand=[].concat(...MAP_LAYOUT.strands.map(s=>s.ids)).map(moduleById).filter(open);
  return cand.sort((a,b)=>pfadInfo(b).doneN-pfadInfo(a).doneN)[0]||act.find(open)||null;
}
/* Eine Zeile der Lernkarte: Kennfarbe als Kante, Buchstabe, Name, Fortschritt als Zahl und schmaler Balken. Führt zur Etappenseite. */
function etRow(m,focus){
  const z=lernenZustand(m),{must,doneN,go1}=pfadInfo(m),fertig=z!=='gate'&&!go1,here=m===focus;
  const label=m.name+': '+doneN+' von '+must.length+' Stationen fertig'+(fertig?', Urkunde geschafft':here?', hier geht es weiter':'');
  const bar=el('span',{class:'etbar','aria-hidden':'true'},el('i',{style:'width:'+(must.length?Math.round(100*doneN/must.length):0)+'%'}));
  return el('button',{type:'button',class:'etrow'+(here?' here':'')+(fertig?' done':''),'data-et':etOf(m)||'','data-mod':m.id,'aria-label':label,onclick:()=>go({kind:'home',tab:'pfad',thema:m.id})},
    el('span',{class:'etl','aria-hidden':'true'},codeOf(m)),
    el('span',{class:'ettx'},el('b',null,m.short||m.name),el('small',null,fertig?'geschafft':doneN+' von '+must.length),bar),
    fertig?icon('haken'):icon('weiter'));
}
function lernenTab(home){
  const focus=focusModule();
  /* Karte „Weiter“ ganz oben */
  if(focus){
    const z=lernenZustand(focus),go1=pfadInfo(focus).go1;
    home.append(bigBtn('play',()=>{if(z==='gate')go({kind:'home',tab:'pfad',thema:focus.id});else openStation(go1.id);},
      z==='gate'?'Weiter: '+focus.name:'Weiter: '+stationLabel(go1.id),z==='gate'?'Etappe '+codeOf(focus)+' beginnt mit dem Eingangstest.':focus.name,null,'go mapgo'));
  }
  /* Lernkarte: Grundlagen untereinander, danach die zwei Wege nebeneinander (Design „Klar“: Liste statt Bild, passt ohne Scrollen) */
  const rowOf=(id)=>{const m=moduleById(id);return m&&m.status==='aktiv'?etRow(m,focus):null;};
  const map=el('div',{class:'lmap','aria-label':'Lernlandkarte',role:'group'},
    el('section',{class:'etgrp'+(MAP_LAYOUT.trunk.length===2?' pair':'')},el('h2',{class:'area'},'Grundlagen'),...MAP_LAYOUT.trunk.map(rowOf).filter(Boolean)),
    el('div',{class:'etfork'},...MAP_LAYOUT.strands.map(st=>{const rows=st.ids.map(rowOf).filter(Boolean); /* gerade Zahl von Etappen: zwei Spalten (spart Höhe, nichts scrollt) */
      return el('section',{class:'etgrp'+(rows.length%2===0?' pair':''),'aria-label':st.name},el('h2',{class:'area'},st.name),...rows);})));
  /* Etappen, die nicht in der Karte stehen (Sicherheit, falls neue dazukommen) */
  const rest=activeModules().filter(m=>!MAP_LAYOUT.trunk.includes(m.id)&&!MAP_LAYOUT.strands.some(s=>s.ids.includes(m.id)));
  if(rest.length)map.append(el('section',{class:'etgrp'},el('h2',{class:'area'},'Weitere'),...rest.map(m=>etRow(m,focus))));
  home.append(map);
  const soon=plannedModules(); /* geplante Etappen: eine ruhige Zeile statt Kästen */
  if(soon.length)home.append(el('p',{class:'soonline'},el('b',null,'Bald: '),soon.map(m=>m.name).join(' · ')));
}
