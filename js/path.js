'use strict';
/* =====================================================================
   Lernpfad: Eingangstest, Pfad, Stationen freischalten, Tagesziel
   „Fertig“ = bestanden (mind. 80 % der Runde richtig). Der Eingangstest (Q00) schaltet nichts
   als fertig, er merkt nur, was sitzt (S.checked, S.einstufung):
   · Es gibt einen Pfad: jeder geht alle Stationen der Reihe nach; Pflicht-Stationen schalten die jeweils nächste frei.
     Was der Eingangstest als „sitzt“ markiert, steht als Markierung in der Liste; die Erklärung bietet dann „Kenne ich schon“.
   · Die frühere „Meine Übersicht“ (und die Wahl „Wie möchtest du lernen?“) gibt es nicht mehr.
   ===================================================================== */
const PATH_ACC={FLAB:'mix',FQ:'ok',FA:'ok',LAB:'mix',RLAB:'mix',HLAB:'mix',Q00:'ok',ZQ:'ok',QA:'ok',ZA:'ok',WQ:'ok',WA:'ok',RQ:'ok',RA:'ok',HQ:'ok',HA:'ok',NLAB:'mix',NQ:'ok',NA:'ok'};
/* Thema, zu dem ein Abschlusscheck (finalId) gehört */
const finalModOf=(id)=>activeModules().find(m=>m.finalId===id)||null;
/* Hinweis „Erst …“ (modules.js recommends, P10 Liste der Vorgänger): die erste empfohlene Etappe, die noch nicht abgeschlossen ist – keine Sperre */
function recommendNote(mod){
  const list=mod&&mod.recommends?[].concat(mod.recommends):[];
  for(const id of list){const r=moduleById(id);if(r&&r.status==='aktiv'&&!qstate(r).final)return r;}
  return null;
}
/* P3 Basis-Ebene: sichtbar nach dem Eingangstest, wenn eine Fähigkeit auf „üben“ steht, oder nach „Ich möchte wiederholen“ */
function basisOpen(mod){
  if(S.basis&&S.basis[mod.id])return true;
  const e=mod.quickcheck&&qstate(mod).einstufung;
  return !!(e&&e.skills&&Object.values(e.skills).some(x=>x&&x.status==='ueben'));
}
const hasBasis=(mod)=>mod.path.some(p=>p.lvl==='basis')||(mod.basisRefs||[]).length>0;
function toggleBasis(mod){S.basis=S.basis&&typeof S.basis==='object'?S.basis:{};S.basis[mod.id]=!S.basis[mod.id];persist();renderAll();}
const stationTitle=(id)=>{const m=PATH.find(x=>x.id===id);return (m&&m.title)||(TASKS[id]&&TASKS[id].name)||id;};
const stationLabel=(id)=>{const c=stationCode(id);return (c?c+' ':'')+stationTitle(id);}; /* P23: mit Kürzel */

/* ---------- Zustand ---------- */
const stationPassed=(id)=>!!(S.passed[id+'-L1']||S.passed[id+'-L2']);
/* Eingangstest-Zustand (placed, final, einstufung) je Thema: Brüche verändern (Q00) liegt wie immer direkt in S,
   jedes weitere Thema in S.mq[Themen-ID] */
function qstate(mod){
  if(mod.qid==='Q00')return S;
  S.mq=(S.mq&&typeof S.mq==='object'&&!Array.isArray(S.mq))?S.mq:{};
  return S.mq[mod.id]||(S.mq[mod.id]={placed:false,final:false,einstufung:null});
}
const qmodOf=(id)=>activeModules().find(m=>m.qid===id)||null; /* Thema, zu dem ein Eingangstest gehört */
function stationDone(id){
  if(isLab(id))return LABS[id].done();
  const fm=finalModOf(id);
  if(fm)return !!qstate(fm).final; /* der Abschlusscheck: fertig = Urkunde */
  return stationPassed(id);
}
/* im Eingangstest beherrscht, aber noch nicht selbst bestanden */
const stationChecked=(id)=>!!S.checked[id]&&!stationPassed(id);
/* Reihenfolge und Freischaltung eines Themas (ohne Thema das erste aktive): Pflicht-Stationen schalten das jeweils nächste frei.
   Je Zeile: done, checked, open, locked, blocker, next (die erste Pflicht-Station, die noch nicht fertig ist). Das zweite Argument ist
   nur ein Überbleibsel der früheren „Meine Übersicht“ und wird ignoriert. */
function pathState(mod){
  const rows=[];let blocker=null;
  const um=mod||activeModules()[0],allOpen=isUnlocked(um);
  um.path.forEach(m=>{
    const done=stationDone(m.id),checked=stationChecked(m.id);
    const open=allOpen||!blocker; /* S.unlocked (nur noch für Tests und alte Speicherstände): alles offen, die Urkunde gibt es trotzdem nur nach allen Pflicht-Stationen */
    /* P16 weiche Sperre: nur Kern-Stationen (must) nach der empfohlenen sind „später“ (antippbar mit Rückfrage), Plus und Basis immer offen */
    const later=!done&&!open&&!!m.must;
    rows.push({m,id:m.id,must:!!m.must,done,checked,open:open||!m.must,locked:later,later,blocker:later?blocker:null,next:false});
    if(m.must&&!done&&!blocker)blocker=m.id;
  });
  const nx=rows.find(r=>r.must&&!r.done);if(nx)nx.next=true;
  return rows;
}
/* „Alles freischalten“: nur noch intern je Thema (kein Knopf mehr), auf diesem Gerät */
const isUnlocked=(mod)=>!!(S.unlocked&&S.unlocked[mod.id]);
/* Eingestuft = den Eingangstest gemacht oder schon im Lernpfad dieses Themas gearbeitet (Üben allein zählt nicht;
   Bestandenes aus anderen Themen auch nicht) */
function eingestuft(mod){
  const ids=(mod.path||[]).map(m=>m.id),mine=(o)=>Object.keys(o||{}).some(k=>ids.includes(k.replace(/-L\d$/,'')));
  const q=mod.quickcheck?qstate(mod):null;
  return !!(!!modusOf(mod)||(q&&(q.placed||q.final))||ids.some(x=>isLab(x)&&LABS[x].done())||mine(S.passed)||mine(S.checked));
}
const modusOf=(mod)=>{const m=S.modus&&S.modus[mod.id];return m==='pfad'||m==='frei'?m:null;};
/* 'gate' (erst der Eingangstest, Block auf der Themenseite) oder 'pfad'. Es gibt nur einen Pfad: Was der Eingangstest als „sitzt“ markiert,
   steht als Markierung in der Liste, und die Erklärung bietet „Kenne ich schon“. (Früher gab es zusätzlich „Meine Übersicht“; alte Werte in S.modus gelten nur noch als „Einstieg gewählt“.) */
function lernenZustand(mod){
  if(!mod.quickcheck)return 'pfad'; /* Themen ohne Eingangstest: gleich der Pfad */
  return eingestuft(mod)?'pfad':'gate';
}
function ensureModus(mod,m){
  if(!S.modus||typeof S.modus!=='object'||Array.isArray(S.modus))S.modus={};
  S.modus[mod.id]=m;
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
/* Tagesziel und Serie (steht im Reiter Ich) */
function dayCard(){
  const today=S.days[dayKey(new Date())]||0,streak=dayStreak();
  return el('div',{class:'daycard'},
    el('span',{class:'lamp'+(today?' on':''),role:'img','aria-label':today?'Tagesziel erreicht':'Tagesziel noch offen'},today?icon('haken'):null),
    el('span',{class:'dc-tx'},el('b',null,'Tagesziel'),el('small',null,today?'geschafft':'1 Runde')),
    streak>1?el('small',{class:'gstreak'},streak+' Tage in Folge'):null);
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
function qEvaluate(results,sk,size,hadProgress,skillList){
  const per={};
  results.forEach((r,i)=>{const s=(sk||[])[i];if(s){const x=per[s]||(per[s]={ok:0,n:0,u:0});x.n++;if(r==='f'||r==='l')x.ok++;if(r==='u')x.u++;}});
  const right=results.filter(r=>r==='f'||r==='l').length;
  /* „Weiß ich nicht“ (u): kein Raten, aber die Fähigkeit gilt als „üben“; bei der Hälfte und mehr und bei höchstens 30 % Treffern direkt in den Pfad */
  const unsure=results.filter(r=>r==='u').length;
  const trust=right>Math.floor(size*Q_START_SHARE)&&unsure<Math.ceil(size*Q_UNSURE_START);
  const skills={};
  (skillList||Q_SKILLS).forEach(s=>{
    const x=per[s]||{ok:0,n:0,u:0};
    skills[s]={ok:x.ok,n:x.n,status:x.u&&x.ok===0?'ueben':trust&&x.n>=2&&x.ok===x.n?'sitzt':trust&&x.n>=2&&x.ok>=x.n-1&&x.ok>0?'fast':'ueben'}; /* P15: 2 von 2 sitzt, 1 von 2 fast, 0 von 2 üben */
  });
  return {right,unsure,size,trust,skills,stufe:!trust?(hadProgress?'plan':'start'):right>=needOf(size)?'fit':'plan'};
}
/* Bestanden: mindestens 80 % der Punkte (ohne Tipp = 1, mit Tipp oder zweitem Versuch = ½) und mindestens 3 Treffer ohne Tipp */
function roundScore(results,size){
  const n=(ch)=>results.filter(r=>r===ch).length,f=n('f'),l=n('l'),need=needOf(size);
  const points=f+l/2;
  return {right:f+l,f,l,points,need,passed:points>=need&&f>=Math.min(3,need)};
}
/* P11 Ansammeln statt Runde: je Station und Niveau zählen richtige Aufgaben (r) und davon ohne Tipp beim 1. Versuch (f).
   Geschafft, sobald r ≥ ACC_NEED und f ≥ ACC_FREE – über beliebig viele Runden, nichts geht verloren. */
const ACC_NEED=5,ACC_FREE=2;
const accOf=(id,lvl)=>{S.acc=S.acc&&typeof S.acc==='object'?S.acc:{};return S.acc[keyOf(id,lvl)]||{r:0,f:0};};
const accReached=(a)=>a.r>=ACC_NEED&&a.f>=ACC_FREE;
/* eine richtige Aufgabe einer Lernpfad-Station zählen; true, wenn die Station (dieses Niveau) dadurch gerade geschafft ist */
function accAdd(id,lvl,first){
  const k=keyOf(id,lvl),a=accOf(id,lvl);
  a.r++;if(first)a.f++;S.acc[k]=a;
  if(accReached(a)&&!S.passed[k]){const was=stationDone(id);S.passed[k]=true;return !was;}
  return false;
}
const isPathStation=(id)=>PATH.some(m=>m.id===id)&&!isLab(id)&&!finalModOf(id)&&!QCHK[id];
/* Kästchenreihe „4 von 5 geschafft · 1 davon ohne Tipp“ */
function accRow(id,lvl,withText){
  const a=accOf(id,lvl),r=Math.min(a.r,ACC_NEED),f=Math.min(a.f,ACC_FREE),txt=r+' von '+ACC_NEED+' geschafft · '+Math.min(a.f,r)+' davon ohne Tipp';
  const row=el('span',{class:'accrow',role:'img','aria-label':txt});
  for(let i=0;i<ACC_NEED;i++)row.append(el('i',{class:i<f?'f':i<r?'on':''}));
  return withText?el('span',{class:'accline'},row,el('small',null,txt+(a.f<ACC_FREE&&a.r>=ACC_NEED?' (noch '+(ACC_FREE-a.f)+' ohne Tipp)':''))):row;
}
function onRoundEnd(id,lvl,round){
  advanceForm(id,lvl); /* eine Form je Runde: die nächste Runde übt die nächste Form */
  const sc=roundScore(round.results,round.size),right=sc.right,need=sc.need;
  const info={right,points:sc.points,need,passed:sc.passed,firstPass:false,placed:[],final:false,daily:false,quiz:null};
  if(isPathStation(id)){info.passed=!!S.passed[keyOf(id,lvl)];info.firstPass=!!round.newPass;info.acc=true;}
  if(QCHK[id]){
    /* Einstufung: nur „sitzt“ (alle Fragen einer Fähigkeit richtig) schaltet die Bauteile der Fähigkeit per Check frei – und nur,
       wenn nicht fast alles falsch war */
    const qc=QCHK[id],qm=qmodOf(id),qs=qstate(qm); /* qm: das Thema, zu dem dieser Test gehört */
    const hadProgress=pathState(qm).some(r=>r.must&&!r.m.final&&r.done);
    const ev=qEvaluate(round.results,round.sk,round.size,hadProgress,qc.skills);
    info.ev=ev;info.qmod=qm.id;
    qs.placed=true;
    /* Sehr wenige Treffer: kein Auswahlbildschirm, es geht direkt in den Pfad */
    if(ev.stufe==='start'&&!modusOf(qm))ensureModus(qm,'pfad');
    const sure=qc.skills.filter(sk=>ev.skills[sk].status==='sitzt');
    const open=(sid)=>{if(!stationDone(sid)&&!info.placed.includes(sid)){S.checked[sid]=true;info.placed.push(sid);}};
    /* Hängt eine Station an mehreren Fähigkeiten (z. B. H02: Hauptnenner und Erweitern), sitzt sie erst, wenn alle sitzen */
    const allSit=(sid)=>qc.skills.filter(k=>(qc.stations[k]||[]).includes(sid)).every(k=>sure.includes(k));
    sure.forEach(sk=>(qc.stations[sk]||[]).filter(allSit).forEach(open));
    if(sure.length===qc.skills.length)(qc.allSure||[]).forEach(open);
    /* Ergebnis des Eingangstests merken (Marken im Lernpfad); wenige Treffer mitten im Pfad überschreiben einen vorhandenen nicht */
    if(ev.trust||!qs.einstufung)qs.einstufung={at:Date.now(),right:ev.right,size:ev.size,stufe:ev.stufe,skills:ev.skills};
  }else if(finalModOf(id)){
    /* Abschlusscheck: alle Pflicht-Stationen davor fertig und mindestens 80 % der Punkte ⇒ Urkunde */
    const fm=finalModOf(id),qs=qstate(fm);
    info.qmod=fm.id;
    info.ready=pathState(fm).filter(r=>r.must&&!r.m.final).every(r=>r.done);
    if(info.ready&&info.passed&&!qs.final){qs.final=true;info.final=true;}
  }
  /* perfekte Runde: jede Aufgabe beim 1. Versuch ohne Tipp richtig (zählt für „alles perfekt“) */
  if(round.results.length&&round.results.every(r=>r==='f')){(S.perfect=S.perfect||{})[keyOf(id,lvl)]=true;info.perfect=true;}
  if(id==='WH')S.whDay=dayKey(new Date()); /* P14: Wiederholung heute geschafft */
  info.daily=markDay();
  return info;
}
/* Punkte und Einblendung am Rundenende (eine Einblendung, damit nichts übereinanderliegt) */
function roundAward(info){
  let xp=15,label='Runde geschafft!';
  if(info.firstPass){xp+=20;label='Station fertig!';}
  if(info.daily){xp+=10;if(label==='Runde geschafft!')label='Tagesziel!';}
  if(info.final){xp+=50;label='Urkunde!';}
  award(xp,label);
  if(typeof checkBadges==='function')checkBadges(); /* P19: neue Abzeichen melden */
  if(info.final)setTimeout(()=>finalCard(info.qmod),700);
}
function finalCard(modId){
  const mod=moduleById(modId)||activeModules()[0];
  const m=modal([icon('plakette','big'),el('h2',null,'Urkunde'),el('p',{class:'rankname'},'Etappe '+(mod.letter||'')+' geschafft'),el('div',{class:'stampbox'},'Geprüft'),
    el('p',null,mod.finalText||'Stark!'),
    el('button',{type:'button',class:'btn',onclick:()=>{m.remove();go({kind:'home',tab:'pfad',thema:mod.id});}},'Zum Lernpfad')]);
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

/* Schema 9 (Umbau 2026-11): Runden, deren Größe nicht mehr passt (Eingangstests 15 → 10, Abschlusschecks auf 15), werden verworfen.
   Bestandene Stationen bleiben geschafft; die neuen Zähler (S.acc) beginnen bei 0; Ergebnisse der Eingangstests bleiben gültig. */
function migrate9(st){
  st.acc=st.acc&&typeof st.acc==='object'?st.acc:{};
  Object.keys(st.rounds||{}).forEach(k=>{const id=k.replace(/-L\d$/,''),r=st.rounds[k];if(TASKS[id]&&r&&r.size!==TASKS[id].size)delete st.rounds[k];});
}

/* ---------- Wege zu den Bauteilen ---------- */
function openStation(id){
  if(isLab(id))openLab(id,'pfad');
  else{S.last=id;go({kind:'practice',id,from:'pfad'});}
}
/* „Weiter im Lernpfad“: gleich die nächste Station des Themas öffnen, ohne Umweg über die Themenseite. Ist nichts mehr offen (oder ist es dieselbe Station), die Themenseite. */
function continueInPath(id){
  const mod=moduleOf(id),nx=mod&&pathState(mod).find(r=>r.next);
  if(nx&&nx.id!==id&&!nx.locked)openStation(nx.id);else go(pfadView(id));
}
/* Hauptknopf „Weiter im Lernpfad“ für ein fertiges Labor, das aus dem Lernpfad geöffnet wurde (sonst null) */
function labNextBtn(id){
  if(!(S.view&&S.view.from==='pfad'))return null;
  return el('button',{type:'button',class:'btn primary small',onclick:()=>continueInPath(id)},'Weiter im Lernpfad');
}
/* ---------- Bauteil zurücksetzen: angefangene Runden (Leicht und Knifflig) und Erklärung; Fertig, Sterne und Punkte bleiben ---------- */
function stationResettable(id){
  const rounds=[1,2].some(l=>{const r=S.rounds[keyOf(id,l)];return !!r&&!!((r.results&&r.results.length)||r.cur);});
  return rounds||!!(S.intro&&S.intro[id]===true);
}
function clearStation(id){
  [1,2].forEach(l=>{delete S.rounds[keyOf(id,l)];});
  if(S.intro)delete S.intro[id];
}
function resetSheet(id){
  const title=stationTitle(id);
  const m=modal([icon('neu','big'),el('h2',null,'Station zurücksetzen?'),el('p',null,el('b',null,title)),
    el('p',null,'Angefangene Runden werden gelöscht, und die Erklärung erscheint wieder. Fertig, Sterne und Punkte bleiben.'),
    el('div',{class:'modalbtns'},
      el('button',{type:'button',class:'btn danger',onclick:()=>{m.remove();clearStation(id);persist();renderAll();toast('Zurückgesetzt: '+title);}},'Zurücksetzen'),
      el('button',{type:'button',class:'btn alt',onclick:()=>m.remove()},'Abbrechen'))]);
}
/* P16: keine Sperre mehr, nur eine Empfehlung mit Rückfrage */
function lockSheet(row){
  const b=row.blocker,name=stationLabel(b);
  const m=modal([icon('pfad','big'),el('h2',null,'Empfohlen: erst '+name),
    el('p',null,'Diese Station baut darauf auf. Trotzdem starten?'),
    el('div',{class:'modalbtns'},
      el('button',{type:'button',class:'btn primary',onclick:()=>{m.remove();openStation(b);}},'Zu: '+name),
      el('button',{type:'button',class:'btn alt',onclick:()=>{m.remove();openStation(row.id);}},'Trotzdem starten'))]);
}

/* ---------- Ansicht: Themenseite mit Eingangstest-Block, nächster Station und Stationenliste ---------- */
/* Marke aus dem Eingangstest: sitzt, fast oder üben (nur wo der Test das Bauteil prüft) */
const CHECK_TEXT={sitzt:'sitzt',fast:'fast',ueben:'üben'};
function checkMark(id){
  const mod=moduleOf(id),qc=mod&&mod.qid&&QCHK[mod.qid];
  const e=qc&&qstate(mod).einstufung;
  if(!e||!e.skills)return null;
  /* mehrere Fähigkeiten an einer Station: die schwächste zählt (üben vor fast vor sitzt) */
  const rank={ueben:0,fast:1,sitzt:2},sts=qc.skills.filter(k=>(qc.stations[k]||[]).includes(id)).map(k=>e.skills[k]).filter(Boolean).map(x=>x.status);
  if(sts.length)return sts.reduce((a,b)=>rank[b]<rank[a]?b:a);
  return (qc.allSure||[]).includes(id)&&S.checked[id]?'sitzt':null;
}
function modNode(r,pos){
  const id=r.id,m=r.m,title=stationTitle(id),desc=m.desc||(TASKS[id]&&TASKS[id].desc)||'';
  const next=r.next;
  const state=r.done?'done':next?'next':r.locked?'locked':'open';
  const tag=r.done?'Fertig':next?'Als Nächstes':r.locked?'Später':r.must?'Offen':m.lvl==='basis'?'Basis':m.lvl==='plus'?'Plus':'Freiwillig';
  const chk=checkMark(id);
  const stars=(isLab(id)||m.final)?null:starNodes((S.passed[id+'-L1']?1:0)+(S.passed[id+'-L2']?1:0),2);
  const li=el('li',{class:'mod '+state+(r.must?'':' frei'),'data-acc':ACC[id]||PATH_ACC[id]||null});
  li.append(el('span',{class:'lamp','aria-hidden':'true'},r.done?icon('haken'):null),
    el('button',{type:'button',class:'modbtn','aria-label':title+': '+tag.toLowerCase()+(chk?', Eingangstest: '+CHECK_TEXT[chk]:'')+(r.must||tag==='Freiwillig'?'':', freiwillig'),onclick:()=>r.locked?lockSheet(r):openStation(id)},
      el('span',{class:'mpos'},stationCode(id)||(isLab(id)?'Lab':'✓')),
      el('span',{class:'mnm'},el('b',null,title),el('small',null,desc+(m.note&&recommendNote(moduleOf(id))?' '+m.note:''))),
      el('span',{class:'mside'},!r.done&&isPathStation(id)&&accOf(id,levelOf(id)).r>0?accRow(id,levelOf(id)):null,chk?el('span',{class:'mchk '+chk},'Test: '+CHECK_TEXT[chk]):null,el('span',{class:'mtag'},tag),stars)));
  if(stationResettable(id))li.append(el('button',{type:'button',class:'modreset','aria-label':title+' zurücksetzen',title:'Zurücksetzen',onclick:()=>resetSheet(id)},icon('neu')));
  return li;
}
const GRP_LABEL={Knobeln:'Knobeln (Plus)',Grundlagen:'Grundlagen wiederholen'};
function pfadMap(rows,mod){
  mod=mod||(rows[0]&&moduleOf(rows[0].id));
  const ol=el('ol',{class:'rail'});let last=null;
  const showBasis=!!mod&&basisOpen(mod);
  rows.forEach((r,i)=>{
    if(r.m.lvl==='basis'&&!showBasis)return;
    if(r.m.grp!==last){last=r.m.grp;ol.append(el('li',{class:'pgrp'+(r.m.lvl==='basis'?' basis':r.m.lvl==='plus'?' plus':'')},icon((mod&&mod.pathGroups[last])||'pfad'),GRP_LABEL[last]||last));}
    const li=modNode(r,i);if(r.m.lvl==='basis')li.classList.add('basis');if(r.m.lvl==='plus')li.classList.add('plus');
    ol.append(li);
  });
  /* Basis aus anderen Etappen: Verweise */
  if(showBasis&&mod&&(mod.basisRefs||[]).length){
    if(last!=='Grundlagen')ol.append(el('li',{class:'pgrp basis'},icon('undo'),'Grundlagen wiederholen'));
    mod.basisRefs.forEach(id=>ol.append(el('li',{class:'mod open frei basis'},el('span',{class:'lamp','aria-hidden':'true'},stationDone(id)?icon('haken'):null),
      el('button',{type:'button',class:'modbtn','aria-label':stationTitle(id)+': Grundlage aus '+(moduleOf(id)||{}).name},
        el('span',{class:'mpos'},stationCode(id)),el('span',{class:'mnm'},el('b',null,stationTitle(id)),el('small',null,'Grundlage aus „'+(moduleOf(id)||{}).name+'“')),
        el('span',{class:'mside'},el('span',{class:'mtag'},'Basis'))))));
    [...ol.querySelectorAll('li.basis .modbtn')].slice(-mod.basisRefs.length).forEach((b,j)=>b.addEventListener('click',()=>openStation(mod.basisRefs[j])));
  }
  return ol;
}
/* Stand eines Themas: Zeilen, Pflicht-Stationen, nächste Station */
function pfadInfo(mod){
  const rows=pathState(mod),must=rows.filter(r=>r.must),doneN=must.filter(r=>r.done).length,next=rows.find(r=>r.next)||null;
  return {rows,must,doneN,next,go1:next};
}
/* „Start“, solange noch nichts begonnen ist, danach „Weiter“ */
function startWord(rows,go1){
  const begun=rows.some(r=>r.done)||Object.keys(S.rounds||{}).some(k=>go1&&k.startsWith(go1.id+'-L')&&S.rounds[k]&&S.rounds[k].results&&S.rounds[k].results.length);
  return begun?'Weiter':'Start';
}
/* Ansicht eines Themas: sein Lernpfad */
function pfadView(id){const m=(id&&moduleOf(id))||activeModules()[0];return {kind:'home',tab:'pfad',thema:m.id};}
/* Eingangstest eines Themas starten (retake: neuer Durchgang) */
function startEingang(mod,retake){
  const qid=mod.qid;
  if(retake){const l=levelOf(qid);S.rounds[keyOf(qid,l)]={results:[],cur:null,size:TASKS[qid].size};persist();}
  go({kind:'practice',id:qid,from:'pfad'});
}
function pfadLine(doneN,total){
  const seg=el('span',{class:'segn',role:'img','aria-label':doneN+' von '+total+' Pflicht-Stationen fertig'});
  for(let i=0;i<total;i++)seg.append(el('i',{class:i<doneN?'on':''}));
  return el('div',{class:'pfadline'},seg,el('b',null,doneN+' von '+total+' geschafft'));
}
/* Eingangstest überspringen: gleich im Pfad bei der ersten Station beginnen (den Test kann man später nachholen) */
function startOhneTest(mod){
  ensureModus(mod,'pfad');persist();
  const nx=pathState(mod).find(r=>r.next);
  if(nx)openStation(nx.id);else renderAll();
}
/* Block „Eingangstest“ auf der Themenseite, solange das Thema nicht eingestuft ist: ein Hauptknopf, dazu ein Textlink */
function gateCard(mod){
  return el('section',{class:'gate'},
    el('div',{class:'gate-ic','aria-hidden':'true'},icon('haken')),
    el('h2',null,'Eingangstest'),
    el('p',null,'Willst du testen, was du schon kannst? Das dauert etwa 5 Minuten.'),
    el('p',null,TASKS[mod.qid].size+' kurze Fragen. Es gibt keine Zeitnot und keine Note.'),
    el('button',{type:'button',class:'btn primary gatego',onclick:()=>startEingang(mod)},icon('play'),'Eingangstest starten'),
    linkBtn('Ohne Test beginnen',()=>startOhneTest(mod)));
}
/* Themenseite: Name, Fortschritt, ein Block je Zustand (Eingangstest oder „Weiter“), die Stationen eingeklappt, zuletzt der Textlink zum Wiederholen des Tests */
function pfadTab(home,mod){
  const z=lernenZustand(mod),info=pfadInfo(mod),rec=recommendNote(mod);
  if(typeof etOf==='function'&&etOf(mod))home.dataset.et=etOf(mod); /* P25: Kennfarbe der Etappe */
  home.append(el('h1',null,mod.name),pfadLine(info.doneN,info.must.length));
  if(typeof wordsRow==='function'){const w=wordsRow(mod);if(w)home.append(w);} /* P24: neue Fachwörter der Etappe, antippbar */
  if(z==='gate')home.append(gateCard(mod));
  else{
    if(rec)home.append(el('p',{class:'modushint'},'Empfohlen: erst '+rec.name+'. Du kannst aber auch gleich anfangen.'));
    const go1=info.go1;
    if(go1)home.append(bigBtn('play',()=>openStation(go1.id),startWord(info.rows,go1)+': '+stationLabel(go1.id),go1.m.final||isLab(go1.id)?null:LEVEL_LABEL[levelOf(go1.id)],null,'go'));
    else home.append(el('div',{class:'msg ok'},'Alle Pflicht-Stationen sind fertig – stark! '+(info.rows.some(r=>!r.must)?'Probiere die freiwilligen Stationen oder ein Spiel.':'Probiere ein Spiel oder eine andere Etappe.')));
  }
  home.append(fold('Alle Stationen',pfadMap(info.rows,mod)));
  if(mod.quickcheck&&z!=='gate')home.append(el('p',{class:'retake'},linkBtn(qstate(mod).placed?'Eingangstest wiederholen':'Eingangstest machen',()=>startEingang(mod,qstate(mod).placed))));
  /* P3: Basis-Ebene von Hand öffnen („Ich möchte wiederholen“) oder wieder schließen; vom Eingangstest geöffnet bleibt sie offen */
  const byHand=!!(S.basis&&S.basis[mod.id]);
  if(hasBasis(mod)&&(byHand||!basisOpen(mod)))home.append(el('p',{class:'basislink'},linkBtn(byHand?'Grundlagen ausblenden':'Ich möchte wiederholen',()=>toggleBasis(mod),'undo')));
}
