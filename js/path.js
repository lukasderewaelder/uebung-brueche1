'use strict';
/* =====================================================================
   Lernpfad: Bauteile nacheinander freischalten, Einstufung, Kurztest, Tagesziel
   Pflicht-Bauteile (must) schalten das jeweils nächste frei; freiwillige
   Bauteile blockieren nichts. „Fertig“ = bestanden (mind. 80 % der Runde
   richtig) oder per Check (Schnellcheck / Kurztest).
   ===================================================================== */
const needOf=(size)=>Math.ceil(size*4/5); /* 80 % */
const PATH=[
  {id:'LAB',grp:'Entdecken',title:'Bruchlabor',desc:'Erweitern und Kürzen ausprobieren.'},
  {id:'G01',grp:'Entdecken',must:true},
  {id:'B01',grp:'Entdecken'},
  {id:'G02',grp:'Erweitern',must:true},
  {id:'T01',grp:'Kürzen',must:true},
  {id:'G03',grp:'Kürzen',must:true},
  {id:'G04',grp:'Kürzen',must:true},
  {id:'G05',grp:'Mischen',must:true},
  {id:'U01',grp:'Knobeln'},{id:'U02',grp:'Knobeln'},{id:'U03',grp:'Knobeln'},{id:'O02',grp:'Knobeln'},
  {id:'Q00',grp:'Abschluss',must:true,final:true,title:'Abschlusscheck',desc:TASKS.Q00.size+' Fragen zeigen, was du kannst. Ab '+needOf(TASKS.Q00.size)+' richtig gibt es die Urkunde.'}
];
const PATH_GROUPS={Entdecken:'lupe',Erweitern:'aus','Kürzen':'ein',Mischen:'zahnrad',Knobeln:'zirkel',Abschluss:'plakette'};
/* Welche Fähigkeiten prüft der Kurztest für ein Bauteil? */
const PATH_SKILLS={G01:['gleich'],G02:['erweitern'],T01:['teilbar'],G03:['kuerzen'],G04:['vollstaendig','kuerzen'],G05:['erweitern','kuerzen']};
const PATH_ACC={LAB:'mix',Q00:'ok'};
const stationTitle=(id)=>{const m=PATH.find(x=>x.id===id);return (m&&m.title)||(TASKS[id]&&TASKS[id].name)||id;};

/* ---------- Zustand ---------- */
function stationDone(id){
  if(id==='LAB')return !!(S.lab&&S.lab.done);
  if(id==='Q00')return !!S.final;
  return !!(S.passed[id+'-L1']||S.passed[id+'-L2']||S.checked[id]);
}
const stationVia=(id)=>!!S.checked[id]&&!(S.passed[id+'-L1']||S.passed[id+'-L2']);
/* Reihenfolge, Freischaltung: ein Bauteil ist offen, wenn alle Pflicht-Bauteile davor fertig sind */
function pathState(){
  const rows=[];let blocker=null;
  PATH.forEach(m=>{
    const done=stationDone(m.id),open=!blocker;
    rows.push({m,id:m.id,must:!!m.must,done,via:done&&stationVia(m.id),open,locked:!done&&!open,blocker:open?null:blocker,next:false});
    if(m.must&&!done&&!blocker)blocker=m.id;
  });
  const nx=rows.find(r=>r.must&&!r.done);
  if(nx)nx.next=true;
  return rows;
}

/* ---------- Tagesziel: mindestens eine Runde pro Tag ---------- */
const dayKey=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function markDay(){
  const k=dayKey(new Date());
  S.days[k]=(S.days[k]||0)+1;
  const keys=Object.keys(S.days).sort();
  while(keys.length>60)delete S.days[keys.shift()];
  S.bestDays=Math.max(S.bestDays||0,dayStreak());
  return S.days[k]===1;
}
function dayStreak(){
  const d=new Date();let n=0;
  if(!S.days[dayKey(d)])d.setDate(d.getDate()-1);
  while(S.days[dayKey(d)]){n++;d.setDate(d.getDate()-1);}
  return n;
}

/* ---------- Auswertung am Ende einer Runde ---------- */
/* Auswertung des Schnellchecks (rein): je Fähigkeit „sitzt“ (alle Fragen richtig), „fast“ (eine falsch bei mindestens
   3 Fragen) oder „üben“; Gesamtstufe „start“ (fast alles falsch: von vorn beginnen), „plan“ (Themenliste) oder „fit“
   (ab 80 %). Bei fast allem falsch sind Treffer oft Raten: dann gilt keine Fähigkeit als „sitzt“, nichts wird freigeschaltet.
   hadProgress: ist schon ein Pflicht-Bauteil fertig? Dann gibt es nie „von vorn“. Rechnet auch mit Runden à 2 Fragen je Fähigkeit. */
function qEvaluate(results,sk,size,hadProgress){
  const per={};
  results.forEach((r,i)=>{const s=(sk||[])[i];if(s){const x=per[s]||(per[s]={ok:0,n:0});x.n++;if(r==='f'||r==='l')x.ok++;}});
  const right=results.filter(r=>r==='f'||r==='l').length;
  const trust=right>Math.floor(size*Q_START_SHARE);
  const skills={};
  Q_SKILLS.forEach(s=>{
    const x=per[s]||{ok:0,n:0};
    skills[s]={ok:x.ok,n:x.n,status:trust&&x.n>=2&&x.ok===x.n?'sitzt':trust&&x.n>=3&&x.ok===x.n-1?'fast':'ueben'};
  });
  return {right,size,trust,skills,stufe:!trust?(hadProgress?'plan':'start'):right>=needOf(size)?'fit':'plan'};
}
function onRoundEnd(id,lvl,round){
  const right=round.results.filter(r=>r==='f'||r==='l').length,need=needOf(round.size);
  const info={right,need,passed:right>=need,firstPass:false,placed:[],final:false,daily:false,quiz:null};
  if(id==='Q00'){
    /* Einstufung: nur „sitzt“ (alle Fragen einer Fähigkeit richtig) schaltet das Bauteil per Check frei – und nur,
       wenn nicht fast alles falsch war */
    const hadProgress=pathState().some(r=>r.must&&!r.m.final&&r.done);
    const ev=qEvaluate(round.results,round.sk,round.size,hadProgress);
    info.ev=ev;
    S.placed=true;
    const sure=Q_SKILLS.filter(sk=>ev.skills[sk].status==='sitzt');
    sure.forEach(sk=>{const st=Q_STATION[sk];if(st&&!stationDone(st)){S.checked[st]=true;info.placed.push(st);}});
    if(sure.length===Q_SKILLS.length&&!stationDone('G05')){S.checked.G05=true;info.placed.push('G05');}
    /* Ergebnis für „Dein Plan“ merken; wenige Treffer mitten im Pfad überschreiben einen vorhandenen Plan nicht */
    if(ev.trust||!S.einstufung)S.einstufung={at:Date.now(),right:ev.right,size:ev.size,stufe:ev.stufe,skills:ev.skills};
    /* Abschluss: alle Pflicht-Bauteile davor fertig und mindestens 80 % richtig */
    const ready=pathState().filter(r=>r.must&&!r.m.final).every(r=>r.done);
    info.ready=ready;
    if(ready&&info.passed&&!S.final){S.final=true;info.final=true;}
  }else if(id==='Q01'){
    const st=S.quizFor;
    info.quiz={station:st,right,need,passed:info.passed};
    if(st&&info.passed&&!stationDone(st))S.checked[st]=true;
  }else if(info.passed&&PATH.some(m=>m.id===id)){
    info.firstPass=!stationDone(id);
    S.passed[keyOf(id,lvl)]=true;
  }
  /* perfekte Runde: jede Aufgabe beim 1. Versuch ohne Tipp richtig (zählt für „alles perfekt“) */
  if(id!=='Q01'&&round.results.length&&round.results.every(r=>r==='f')){(S.perfect=S.perfect||{})[keyOf(id,lvl)]=true;info.perfect=true;}
  info.daily=markDay();
  return info;
}
/* Punkte und Einblendung am Rundenende (eine Einblendung, damit nichts übereinanderliegt) */
function roundAward(info){
  let xp=15,label='Runde geschafft!';
  if(info.quiz&&info.quiz.passed){xp+=10;label='Kurztest geschafft!';}
  if(info.firstPass){xp+=20;label='Bauteil fertig!';}
  if(info.daily){xp+=10;if(label==='Runde geschafft!')label='Tagesziel!';}
  if(info.final){xp+=50;label='Urkunde!';}
  award(xp,label);
  if(info.final)setTimeout(finalCard,700);
}
function finalCard(){
  const m=modal([icon('plakette','big'),el('h2',null,'Urkunde'),el('p',{class:'rankname'},'Lernpfad geschafft'),el('div',{class:'stampbox'},'Geprüft'),
    el('p',null,'Du kannst Erweitern und Kürzen. Stark!'),
    el('button',{type:'button',class:'btn',onclick:()=>{m.remove();go({kind:'home',tab:'pfad'});}},'Zum Lernpfad')]);
}
/* Schema 4: Lernpfad-Felder; Bestandsnutzer behalten ihren Stand (mind. 4 Treffer beim 1. Versuch ⇒ bestanden) */
function migrate4(st){
  st.passed=st.passed||{};st.checked=st.checked||{};st.days=st.days||{};st.skills=st.skills||{};st.perfect=st.perfect||{};
  Object.keys(st.progress||{}).forEach(k=>{
    const p=st.progress[k];
    if(p&&p.first>=4&&PATH.some(m=>k.startsWith(m.id+'-L')))st.passed[k]=true;
  });
}

/* Schema 6: Schnellcheck mit 15 statt 10 Fragen – alte (laufende oder fertige) Runden verwerfen; Punkte, Checks und Fortschritt bleiben */
function migrate6(st){
  [1,2].forEach(l=>{const k=keyOf('Q00',l),r=st.rounds&&st.rounds[k];if(r&&r.size!==TASKS.Q00.size)delete st.rounds[k];});
}

/* ---------- Wege zu den Bauteilen ---------- */
function openStation(id){
  if(id==='LAB')go({kind:'lab',from:'pfad'});
  else{S.last=id;go({kind:'practice',id,from:'pfad'});}
}
function startKurztest(stationId){
  S.quizSkills=PATH_SKILLS[stationId].slice();S.quizFor=stationId;
  S.levelByType.Q01=1;S.rounds[keyOf('Q01',1)]={results:[],cur:null,size:TASKS.Q01.size};
  go({kind:'practice',id:'Q01',from:'pfad'});
}
function lockSheet(row){
  const b=row.blocker,name=stationTitle(b);
  const m=modal([icon('schloss','big'),el('h2',null,'Noch gesperrt'),
    el('p',null,'Erst dran: ',el('b',null,name),'.'),
    el('div',{class:'modalbtns'},
      el('button',{type:'button',class:'btn',onclick:()=>{m.remove();openStation(b);}},'Zu: '+name),
      PATH_SKILLS[b]?el('button',{type:'button',class:'btn alt',onclick:()=>{m.remove();startKurztest(b);}},'Ich kann das schon (Kurztest)'):null,
      el('button',{type:'button',class:'btn alt',onclick:()=>m.remove()},'Schließen'))]);
}

/* ---------- Dein Plan (nach dem Schnellcheck) ---------- */
/* Zustandslos aus S.einstufung und dem Lernpfad berechnet; null, wenn es keinen (mehr) gibt.
   Posten in Lernpfad-Reihenfolge (Grundlegendes zuerst): Bauteile, deren Fähigkeit nicht „sitzt“, dazu G05, solange
   etwas nicht sitzt; bei „von vorn“ das Bruchlabor und Gleiche Anteile (danach läuft der normale Pfad). */
function planOf(rows){
  try{
    const e=S.einstufung;
    if(!e||S.final)return null;
    rows=rows||pathState();
    const byId={};rows.forEach(r=>{byId[r.id]=r;});
    const skillOf={};Object.keys(Q_STATION).forEach(sk=>{skillOf[Q_STATION[sk]]=sk;});
    const stat=(id)=>{const x=e.skills&&e.skills[skillOf[id]];return x?x.status:'ueben';};
    const items=[];
    if(e.stufe==='start'){
      ['LAB','G01'].forEach(id=>{if(byId[id])items.push({id,status:'ueben'});});
    }else{
      let weak=false;
      PATH.forEach(m=>{
        if(skillOf[m.id]){const st=stat(m.id);if(st!=='sitzt'){weak=true;items.push({id:m.id,status:st});}}
        else if(m.id==='G05'&&weak)items.push({id:'G05',status:'ueben'});
      });
    }
    items.forEach(it=>{it.done=!!(byId[it.id]&&byId[it.id].done);});
    const now=items.find(it=>!it.done);
    return now?{items,now,stufe:e.stufe}:null;
  }catch(err){return null;}
}
function planCard(plan){
  const li=plan.items.map(it=>{
    const now=it.id===plan.now.id;
    const kurz=now&&it.status==='fast'&&PATH_SKILLS[it.id];
    return el('li',{class:'plan-it'+(it.done?' done':'')+(now?' now':'')},
      el('span',{class:'pl-ic','aria-hidden':'true'},it.done?icon('haken'):now?icon('weiter'):null),
      el('span',{class:'pl-nm'},stationTitle(it.id),now?el('small',null,'jetzt'):null),
      el('span',{class:'pl-st'},it.done?'fertig':it.status==='fast'?'fast':'üben'),
      kurz?el('span',{class:'pl-act'},
        el('button',{type:'button',class:'btn small',onclick:()=>startKurztest(it.id)},'Kurztest'),
        el('button',{type:'button',class:'btn small alt',onclick:()=>openStation(it.id)},'Üben')):null);
  });
  return el('section',{class:'plancard','aria-label':'Dein Plan'},
    el('div',{class:'lblm'},'Dein Plan'),
    el('p',null,plan.stufe==='start'?'Fang vorn an – dann geht es Schritt für Schritt weiter.':'Das solltest du üben:'),
    el('ol',{class:'planlist'},...li));
}

/* ---------- Ansicht: Anlagenschema ---------- */
function modNode(r,pos,plan){
  const id=r.id,m=r.m,title=stationTitle(id),desc=m.desc||(TASKS[id]&&TASKS[id].desc)||'';
  const rec=!!(plan&&!r.done&&plan.items.some(it=>it.id===id));
  const state=r.done?'done':r.next?'next':r.locked?'locked':'open';
  const tag=r.done?(r.via?'Per Check':'Fertig'):r.next?'Weiter':r.locked?'Gesperrt':'Freiwillig';
  const stars=(id==='LAB'||id==='Q00')?null:starNodes((S.passed[id+'-L1']?1:0)+(S.passed[id+'-L2']?1:0),2);
  const li=el('li',{class:'mod '+state+(r.must?'':' frei'),'data-acc':ACC[id]||PATH_ACC[id]||null});
  li.append(el('span',{class:'lamp','aria-hidden':'true'},r.done?icon('haken'):r.locked?icon('schloss'):null),
    el('button',{type:'button',class:'modbtn','aria-label':title+': '+tag.toLowerCase()+(r.must||tag==='Freiwillig'?'':', freiwillig')+(rec?', empfohlen':''),onclick:()=>r.locked?lockSheet(r):openStation(id)},
      el('span',{class:'mpos'},String(pos+1).padStart(2,'0')),
      el('span',{class:'mnm'},el('b',null,title),el('small',null,desc)),
      el('span',{class:'mside'},rec?el('span',{class:'mrec'},'Empfohlen'):null,el('span',{class:'mtag'},tag),stars)));
  return li;
}
function pfadMap(rows,plan){
  const ol=el('ol',{class:'rail'});let last=null;
  rows.forEach((r,i)=>{
    if(r.m.grp!==last){last=r.m.grp;ol.append(el('li',{class:'pgrp'},icon(PATH_GROUPS[last]),last));}
    ol.append(modNode(r,i,plan));
  });
  return ol;
}
function pfadHead(doneN,total){
  const today=S.days[dayKey(new Date())]||0,streak=dayStreak();
  const seg=el('span',{class:'segn',role:'img','aria-label':doneN+' von '+total+' Pflicht-Bauteilen fertig'});
  for(let i=0;i<total;i++)seg.append(el('i',{class:i<doneN?'on':''}));
  return el('div',{class:'pfadhead'},
    el('div',{class:'ph-prog'},el('span',{class:'lblm'},'Pflicht-Bauteile'),seg,el('b',null,doneN+' von '+total)),
    el('div',{class:'ph-day'},
      el('span',{class:'lamp'+(today?' on':''),role:'img','aria-label':today?'Tagesziel erreicht':'Tagesziel noch offen'},today?icon('haken'):null),
      el('span',{class:'lblm'},'Tagesziel'),el('small',null,today?'geschafft':'1 Runde'),
      streak>1?el('small',{class:'gstreak'},'Serie '+streak+' Tage'):null));
}
function pfadTab(home){
  const rows=pathState(),must=rows.filter(r=>r.must),doneN=must.filter(r=>r.done).length,next=rows.find(r=>r.next);
  const plan=planOf(rows);
  /* „Weiter geht’s“ folgt dem Plan (bei „von vorn“ das Bruchlabor), sonst dem nächsten Pflicht-Bauteil */
  const go1=(plan&&rows.find(r=>r.id===plan.now.id&&!r.locked))||next;
  home.append(el('h1',null,'Lernpfad'),pfadHead(doneN,must.length));
  if(plan)home.append(planCard(plan));
  if(go1)home.append(bigBtn('play',()=>openStation(go1.id),'Weiter geht’s',stationTitle(go1.id),go1.id==='Q00'||go1.id==='LAB'?'':LEVEL_LABEL[levelOf(go1.id)],'go'));
  else home.append(el('div',{class:'msg ok'},'Alle Pflicht-Bauteile sind fertig – stark! Probiere die Knobel-Bauteile oder ein Spiel.'));
  if(!S.placed&&next)home.append(el('div',{class:'pfadbanner'},icon('blitz'),
    el('div',{class:'pb-tx'},el('b',null,'Schon fit?'),el('span',null,TASKS.Q00.size+' Blitzfragen zeigen, was du schon kannst, und machen dir einen Plan.')),
    el('button',{type:'button',class:'btn small',onclick:()=>{S.last='Q00';go({kind:'practice',id:'Q00',from:'pfad'});}},'Schnellcheck starten')));
  home.append(pfadMap(rows,plan));
}

