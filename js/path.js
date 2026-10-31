'use strict';
/* =====================================================================
   Lernpfad: Eingangstest, Pfad oder Selbst aussuchen, Bauteile freischalten, Tagesziel
   „Fertig“ = bestanden (mind. 80 % der Runde richtig). Der Eingangstest (Q00) schaltet nichts
   als fertig, er merkt nur, was sitzt (S.checked, S.einstufung):
   · Pfad: jeder geht alle Bauteile der Reihe nach; Pflicht-Bauteile schalten das jeweils nächste frei.
   · Selbst aussuchen: alles ist sichtbar, offen ist nur Bestandenes und im Check Beherrschtes
     (dazu Freiwilliges vor der ersten Lücke); die erste Lücke und alles dahinter bleibt gesperrt.
   ===================================================================== */
const PATH_ACC={LAB:'mix',Q00:'ok'};
const stationTitle=(id)=>{const m=PATH.find(x=>x.id===id);return (m&&m.title)||(TASKS[id]&&TASKS[id].name)||id;};

/* ---------- Zustand ---------- */
const stationPassed=(id)=>!!(S.passed[id+'-L1']||S.passed[id+'-L2']);
function stationDone(id){
  if(id==='LAB')return !!(S.lab&&S.lab.done);
  if(id==='Q00')return !!S.final;
  return stationPassed(id);
}
/* im Eingangstest beherrscht, aber noch nicht selbst bestanden */
const stationChecked=(id)=>!!S.checked[id]&&!stationPassed(id);
/* Reihenfolge, Freischaltung (modus 'pfad' oder 'frei', Standard 'pfad'). Je Zeile: done, checked, open, locked, blocker, next */
function pathState(mod,modus){
  const rows=[];let blocker=null,allDone=true;
  const frei=modus==='frei';
  (mod?mod.path:PATH).forEach(m=>{
    const done=stationDone(m.id),checked=stationChecked(m.id);
    let open;
    if(frei){
      /* beherrscht oder bestanden = offen; Freiwilliges nur vor der ersten Lücke; der Abschluss, wenn alles davor bestanden ist */
      open=done||checked||(!m.must&&!blocker)||(!!m.final&&allDone);
    }else open=!blocker;
    rows.push({m,id:m.id,must:!!m.must,done,checked,open,locked:!done&&!open,blocker:open?null:blocker,next:false});
    if(m.must&&!done){allDone=false;if(!blocker&&!(frei&&checked))blocker=m.id;}
  });
  if(!frei){const nx=rows.find(r=>r.must&&!r.done);if(nx)nx.next=true;}
  return rows;
}
/* Eingestuft = den Eingangstest gemacht oder schon im Lernpfad gearbeitet (Üben allein zählt nicht) */
const eingestuft=()=>!!(S.placed||S.final||(S.lab&&S.lab.done)||Object.keys(S.passed||{}).length||Object.keys(S.checked||{}).length);
const modusOf=(mod)=>{const m=S.modus&&S.modus[mod.id];return m==='pfad'||m==='frei'?m:null;};
/* 'gate' (erst der Eingangstest), 'wahl' (Pfad oder Selbst aussuchen), sonst der gewählte Modus */
function lernenZustand(mod){
  if(!mod.quickcheck)return modusOf(mod)||'pfad'; /* Themen ohne Eingangstest: gleich der Pfad */
  if(!eingestuft())return 'gate';
  return modusOf(mod)||'wahl';
}
function ensureModus(mod,m){
  if(!S.modus||typeof S.modus!=='object'||Array.isArray(S.modus))S.modus={};
  S.modus[mod.id]=m;
}
function setModus(mod,m){ensureModus(mod,m);persist();renderAll();}

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
/* Tagesziel und Serie (steht im Reiter Ich) */
function dayCard(){
  const today=S.days[dayKey(new Date())]||0,streak=dayStreak();
  return el('div',{class:'daycard'},
    el('span',{class:'lamp'+(today?' on':''),role:'img','aria-label':today?'Tagesziel erreicht':'Tagesziel noch offen'},today?icon('haken'):null),
    el('span',{class:'dc-tx'},el('b',null,'Tagesziel'),el('small',null,today?'geschafft':'1 Runde')),
    streak>1?el('small',{class:'gstreak'},'Serie '+streak+' Tage'):null);
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
    /* Sehr wenige Treffer: kein Auswahlbildschirm, es geht direkt in den Pfad */
    const qm=activeModules().find(m=>m.quickcheck);
    if(ev.stufe==='start'&&qm&&!modusOf(qm))ensureModus(qm,'pfad');
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
    el('button',{type:'button',class:'btn',onclick:()=>{m.remove();go(pfadView());}},'Zum Lernpfad')]);
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
function lockSheet(row,modus){
  const mod=moduleOf(row.id);
  if(modus==='frei'){
    const m=modal([icon('schloss','big'),el('h2',null,'Noch nicht offen'),
      el('p',null,'Offen ist, was du im Eingangstest schon konntest. Das hier schaltet der Pfad frei.'),
      el('div',{class:'modalbtns'},
        el('button',{type:'button',class:'btn',onclick:()=>{m.remove();if(mod)setModus(mod,'pfad');}},'Zum Pfad wechseln'),
        el('button',{type:'button',class:'btn alt',onclick:()=>m.remove()},'Schließen'))]);
    return;
  }
  const b=row.blocker,name=stationTitle(b);
  const m=modal([icon('schloss','big'),el('h2',null,'Noch gesperrt'),
    el('p',null,'Erst dran: ',el('b',null,name),'.'),
    el('div',{class:'modalbtns'},
      el('button',{type:'button',class:'btn',onclick:()=>{m.remove();openStation(b);}},'Zu: '+name),
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

/* ---------- Ansicht: Eingangstest, Wahl, Pfad und Selbst aussuchen ---------- */
/* Marke aus dem Eingangstest: sitzt, fast oder üben (nur wo der Test das Bauteil prüft) */
const CHECK_TEXT={sitzt:'sitzt',fast:'fast',ueben:'üben'};
function checkMark(id){
  const e=S.einstufung;
  if(!e||!e.skills)return null;
  const sk=Object.keys(Q_STATION).find(k=>Q_STATION[k]===id);
  const x=sk&&e.skills[sk];
  if(x)return x.status;
  return id==='G05'&&S.checked.G05?'sitzt':null;
}
function modNode(r,pos,modus){
  const id=r.id,m=r.m,title=stationTitle(id),desc=m.desc||(TASKS[id]&&TASKS[id].desc)||'';
  const next=modus==='pfad'&&r.next;
  const state=r.done?'done':next?'next':r.locked?'locked':'open';
  const tag=r.done?'Fertig':next?'Als Nächstes':r.locked?'Gesperrt':r.must?'Offen':'Freiwillig';
  const chk=checkMark(id);
  const stars=(id==='LAB'||id==='Q00')?null:starNodes((S.passed[id+'-L1']?1:0)+(S.passed[id+'-L2']?1:0),2);
  const li=el('li',{class:'mod '+state+(r.must?'':' frei'),'data-acc':ACC[id]||PATH_ACC[id]||null});
  li.append(el('span',{class:'lamp','aria-hidden':'true'},r.done?icon('haken'):r.locked?icon('schloss'):null),
    el('button',{type:'button',class:'modbtn','aria-label':title+': '+tag.toLowerCase()+(chk?', Eingangstest: '+CHECK_TEXT[chk]:'')+(r.must||tag==='Freiwillig'?'':', freiwillig'),onclick:()=>r.locked?lockSheet(r,modus):openStation(id)},
      el('span',{class:'mpos'},String(pos+1).padStart(2,'0')),
      el('span',{class:'mnm'},el('b',null,title),el('small',null,desc)),
      el('span',{class:'mside'},chk?el('span',{class:'mchk '+chk},'Check: '+CHECK_TEXT[chk]):null,el('span',{class:'mtag'},tag),stars)));
  return li;
}
function pfadMap(rows,modus){
  const ol=el('ol',{class:'rail'});let last=null;
  rows.forEach((r,i)=>{
    if(r.m.grp!==last){last=r.m.grp;ol.append(el('li',{class:'pgrp'},icon(PATH_GROUPS[last]),last));}
    ol.append(modNode(r,i,modus));
  });
  return ol;
}
/* Stand eines Themas: Zeilen, Pflicht-Bauteile, nächstes Bauteil (nur im Pfad-Modus) */
function pfadInfo(mod,modus){
  const rows=pathState(mod,modus),must=rows.filter(r=>r.must),doneN=must.filter(r=>r.done).length,next=rows.find(r=>r.next)||null;
  return {rows,must,doneN,next,go1:next};
}
/* „Start“, solange noch nichts begonnen ist, danach „Weiter“ */
function startWord(rows,go1){
  const begun=rows.some(r=>r.done)||Object.keys(S.rounds||{}).some(k=>go1&&k.startsWith(go1.id+'-L')&&S.rounds[k]&&S.rounds[k].results&&S.rounds[k].results.length);
  return begun?'Weiter':'Start';
}
/* Ansicht eines Themas: sein Lernpfad */
function pfadView(id){const m=(id&&moduleOf(id))||activeModules()[0];return {kind:'home',tab:'pfad',thema:m.id};}
function startEingang(retake){
  if(retake){const l=levelOf('Q00');S.rounds[keyOf('Q00',l)]={results:[],cur:null,size:TASKS.Q00.size};persist();}
  go({kind:'practice',id:'Q00',from:'pfad'});
}
function pfadLine(doneN,total){
  const seg=el('span',{class:'segn',role:'img','aria-label':doneN+' von '+total+' Pflicht-Bauteilen fertig'});
  for(let i=0;i<total;i++)seg.append(el('i',{class:i<doneN?'on':''}));
  return el('div',{class:'pfadline'},seg,el('b',null,doneN+' von '+total+' geschafft'));
}
function modusSwitch(mod,modus){
  const mk=(m,label)=>el('button',{type:'button','aria-pressed':String(modus===m),onclick:()=>{if(modus!==m)setModus(mod,m);}},label);
  return el('div',{class:'modusrow'},el('div',{class:'seg',role:'group','aria-label':'So lernst du'},mk('pfad','Pfad'),mk('frei','Selbst aussuchen')));
}
function gateCard(){
  return el('section',{class:'gate'},
    el('div',{class:'gate-ic','aria-hidden':'true'},icon('blitz')),
    el('h2',null,'Eingangstest'),
    el('p',null,TASKS.Q00.size+' kurze Fragen zeigen, was du schon kannst. Danach geht es los.'),
    el('p',null,'Du hast keine Zeitnot, und es gibt keine Note.'),
    el('button',{type:'button',class:'btn primary',onclick:()=>startEingang()},icon('play'),'Eingangstest starten'),
    el('p',{class:'gatehint'},'Du kannst auch gleich im Reiter „Üben“ üben.'));
}
function wahlCards(mod){
  return el('section',{class:'wahl'},
    el('h2',null,'Wie möchtest du lernen?'),
    bigBtn('pfad',()=>setModus(mod,'pfad'),'Dem Pfad folgen','Alle Bauteile der Reihe nach. Empfohlen.',null,'go'),
    bigBtn('heft',()=>setModus(mod,'frei'),'Selbst aussuchen','Du siehst alles. Offen ist, was du schon kannst.'));
}
function pfadTab(home,mod){
  const z=lernenZustand(mod);
  home.append(el('h1',null,'Lernpfad'));
  if(z==='gate'){home.append(gateCard());return;}
  if(z==='wahl'){home.append(wahlCards(mod));return;}
  const info=pfadInfo(mod,z);
  home.append(modusSwitch(mod,z),pfadLine(info.doneN,info.must.length));
  if(z==='pfad'){
    const go1=info.go1;
    if(go1)home.append(bigBtn('play',()=>openStation(go1.id),startWord(info.rows,go1)+': '+stationTitle(go1.id),go1.id==='Q00'||go1.id==='LAB'?null:LEVEL_LABEL[levelOf(go1.id)],null,'go'));
    else home.append(el('div',{class:'msg ok'},'Alle Pflicht-Bauteile sind fertig – stark! Probiere die Knobel-Bauteile oder ein Spiel.'));
    home.append(fold('Alle Bauteile',pfadMap(info.rows,z)));
  }else{
    home.append(el('p',{class:'modushint'},'Hier siehst du alles. Offen ist, was du im Eingangstest schon konntest. Den Rest schaltet der Pfad frei.'),pfadMap(info.rows,z));
  }
  if(mod.quickcheck)home.append(el('p',{class:'retake'},el('button',{type:'button',class:'btn small alt',onclick:()=>startEingang(true)},'Eingangstest wiederholen')));
}
