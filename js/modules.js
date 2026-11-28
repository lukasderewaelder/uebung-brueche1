'use strict';
/* =====================================================================
   Etappen (Module): die eine Stelle, an der eine Etappe angemeldet wird (Umbau 2026-11, P1/P3/P10/P26)
   Jede Etappe hat denselben Takt (TAKT): Entdecken (Labor) · Verstehen (am Bild) · Üben (rechnen) · Anwenden (mischen, Geschichten, Fehler)
   · Knobeln (Plus, freiwillig) · Abschlusscheck (15 Aufgaben, Urkunde). Fehlt eine Gruppe, entfällt sie.
   Drei Ebenen je Station (lvl): 'kern' (alle, weiche Sperre, zählt für die Urkunde), 'plus' (immer offen, eigenes Plus-Abzeichen),
   'basis' (Grundlagen; erst sichtbar nach dem Eingangstest bei „üben“ oder über „Ich möchte wiederholen“). basisRefs: Basis-Stationen
   aus anderen Etappen (Verweise, z. B. G02 für Vergleichen). must = Kern oder Abschlusscheck (für ältere Teile der App).
   status 'aktiv': erscheint in Lernen und Wiederholen. status 'geplant': nur ein Hinweis „Bald“ ohne Link.
   quickcheck/qid: Eingangstest (QCHK); finalId: Abschlusscheck (finalText); recommends: Liste von Etappen, die man vorher machen sollte
   (nur Empfehlung, keine Sperre; P10 zwei Stränge: nach E entweder Ordnen Z → W oder Rechnen R → H → V).
   rank: Aufgaben und Lernpfad der Etappe zählen für „alles perfekt“ (höchste Stufe).
   ===================================================================== */
const needOf=(size)=>Math.ceil(size*4/5); /* 80 % */

/* Gruppen des Takts: Symbol und Muster sind in jeder Etappe gleich */
const TAKT={
  'Entdecken':{icon:'kolben',pat:'dots',lvl:'kern'},
  'Verstehen':{icon:'gluehbirne',pat:'dash',lvl:'kern'},
  'Üben':{icon:'bleistift',pat:'hatch',lvl:'kern'},
  'Anwenden':{icon:'schluessel',pat:'dots',lvl:'kern'},
  'Knobeln':{icon:'zirkel',pat:'dash',lvl:'plus'},
  'Grundlagen':{icon:'undo',pat:'hatch',lvl:'basis'},
  'Abschlusscheck':{icon:'plakette',pat:'dots',lvl:'kern'}
};
const TAKT_ORDER=['Entdecken','Verstehen','Üben','Anwenden','Knobeln','Grundlagen','Abschlusscheck'];
/* Etappe bauen: st = {Gruppe: [Stations-ID | {id, title, desc, note}]}, texts = {Gruppe: Text für „Wiederholen“}, extra = Übungen nur zum Wiederholen */
function etappe(o){
  const path=[],groups={},pathGroups={},practice=[o.qid,o.finalId].filter(Boolean);
  TAKT_ORDER.forEach(g=>{
    const list=(o.st[g]||[]).map(x=>typeof x==='string'?{id:x}:x);
    if(g==='Abschlusscheck'){
      if(!o.finalId)return;
      list.push({id:o.finalId,final:true,title:'Abschlusscheck',desc:TASKS[o.finalId].size+' Aufgaben zeigen, was du kannst. Ab '+needOf(TASKS[o.finalId].size)+' richtig gibt es die Urkunde.'});
    }
    if(!list.length)return;
    list.forEach(p=>{p.grp=g;p.lvl=p.final?'kern':TAKT[g].lvl;p.must=p.lvl==='kern'&&!(typeof isLab==='function'&&isLab(p.id))&&!/LAB$/.test(p.id);path.push(p);});
    pathGroups[g]=TAKT[g].icon;
    const ids=list.map(p=>p.id).concat(g==='Abschlusscheck'&&o.qid?[o.qid]:[]).concat((o.extra&&o.extra[g])||[]);
    groups[g]={pat:TAKT[g].pat,icon:TAKT[g].icon,text:(o.texts&&o.texts[g])||'',ids};
    ids.forEach(id=>{if(!/LAB$/.test(id)&&!practice.includes(id))practice.push(id);});
  });
  return Object.assign({status:'aktiv',rank:false,quickcheck:!!o.qid},o,{path,groups,pathGroups,practice,recommends:o.recommends||[]});
}

const MODULES=[
  etappe({id:'verstehen',letter:'F',name:'Brüche verstehen',desc:'Anteile erkennen, das Ganze, mehrere Ganze, Brüche größer 1.',icon:'bild',qid:'FQ',finalId:'FA',
    finalText:'Du verstehst, was ein Bruch ist. Stark!',
    st:{Entdecken:[{id:'FLAB',title:'Anteile-Labor',desc:'Teilen, färben und denselben Bruch in drei Bildern sehen.'}],Verstehen:['F01','F02','F03'],Üben:['F04','F05'],Anwenden:['F06'],Knobeln:['F07','F08']},
    texts:{Entdecken:'Labor: teilen und färben',Verstehen:'Anteile, das Ganze, mehrere Ganze',Üben:'Anteile von Größen, Brüche größer 1',Anwenden:'Bild, Bruch, Satz und Geschichte',Knobeln:'Das Ganze finden, Bruchrätsel',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  etappe({id:'veraendern',letter:'E',name:'Erweitern und Kürzen',desc:'Gleiche Anteile erkennen, erweitern und kürzen.',icon:'aus',rank:true,qid:'Q00',finalId:'QA',recommends:['verstehen'],
    finalText:'Du kannst Erweitern und Kürzen. Stark!',
    st:{Entdecken:[{id:'LAB',title:'Bruchlabor',desc:'Erweitern und Kürzen ausprobieren.'}],Verstehen:['G01','B01'],Üben:['G02','G04'],Anwenden:['G05'],
      Knobeln:['U01','U02','U03','O01','O02'],Grundlagen:['T01','T02','G03']},
    extra:{Knobeln:['U04']},
    texts:{Entdecken:'Labor: erweitern und kürzen ausprobieren',Verstehen:'Gleiche Anteile erkennen, Bruchbilder',Üben:'Erweitern und vollständig kürzen',Anwenden:'Mal erweitern, mal kürzen',
      Knobeln:'Lücken, Fehler, Begründen, mehrere Lösungen',Grundlagen:'Teilbarkeit und Kürzen mit einer Zahl',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  etappe({id:'zahlenstrahl',letter:'Z',name:'Brüche am Zahlenstrahl',desc:'Brüche ablesen, eintragen und passend einteilen.',icon:'lineal',qid:'ZQ',finalId:'ZA',recommends:['veraendern'],
    finalText:'Du kannst Brüche am Zahlenstrahl ablesen und eintragen. Stark!',
    st:{Verstehen:['Z01','Z02'],Üben:['Z03',{id:'Z04',note:'Dafür hilft Erweitern und Kürzen.'},{id:'Z05',note:'Dafür hilft Erweitern und Kürzen.'}],Knobeln:['Z06','Z07','Z08']},
    basisRefs:['F05'],
    texts:{Verstehen:'Einteilung erkennen, Brüche ablesen',Üben:'Eintragen und Einteilung anpassen',Knobeln:'Mehrere Brüche, das Ganze, über 1',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  etappe({id:'vergleichen',letter:'W',name:'Brüche vergleichen',desc:'Brüche vergleichen und ordnen.',icon:'balken',qid:'WQ',finalId:'WA',recommends:['zahlenstrahl','veraendern'],
    finalText:'Du kannst Brüche vergleichen und ordnen. Stark!',
    st:{Verstehen:['W01','W02'],Üben:['W03',{id:'W05',note:'Dafür hilft Erweitern und Kürzen.'}],Anwenden:['W08'],Knobeln:['W04','W06','W07','W09','W10']},
    basisRefs:['G02'],
    texts:{Verstehen:'Gleicher Nenner, gleicher Zähler',Üben:'Beides im Vergleich, auf einen Nenner bringen',Anwenden:'Brüche ordnen',Knobeln:'Fehlt zum Ganzen, Vergleichszahl, über 1, dazwischen',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  etappe({id:'addsub',letter:'R',name:'Plus und Minus mit gleichen Nennern',desc:'Der Nenner bleibt, die Zähler werden addiert oder subtrahiert.',icon:'plusminus',qid:'RQ',finalId:'RA',recommends:['veraendern'],
    finalText:'Du kannst Brüche mit gleichen Nennern addieren und subtrahieren. Stark!',
    st:{Entdecken:[{id:'RLAB',title:'Bruchlabor Plus und Minus',desc:'Addieren und Subtrahieren ausprobieren.'}],Verstehen:['R01','R03'],Üben:['R02','R04'],Anwenden:['R05']},
    basisRefs:['F01'],
    texts:{Entdecken:'Labor: Plus und Minus ausprobieren',Verstehen:'Addieren und subtrahieren am Bild',Üben:'Addieren und subtrahieren mit Rechenweg',Anwenden:'Plus oder minus? Fehler, eigene Aufgaben',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  etappe({id:'addsub2',letter:'H',name:'Plus und Minus mit verschiedenen Nennern',desc:'Erst gleich einteilen, dann die Zähler addieren oder subtrahieren.',icon:'kreuzraster',qid:'HQ',finalId:'HA',recommends:['addsub'],
    finalText:'Du kannst Brüche mit verschiedenen Nennern addieren und subtrahieren. Stark!',
    st:{Entdecken:[{id:'HLAB',title:'Bruchlabor Gemeinsame Teilung',desc:'Teilungen übertragen und Brüche zusammenfügen.'}],Verstehen:['H03'],
      Üben:[{id:'H02',note:'Dafür hilft Erweitern und Kürzen.'},'H04','H06'],Anwenden:['H07'],Knobeln:['H08','H09','H10','H11','H12','H13','H14']},
    basisRefs:['G02','R02'],
    texts:{Entdecken:'Labor: gemeinsame Teilung ausprobieren',Verstehen:'Am Bild: zusammenfügen, wegnehmen, ergänzen',Üben:'Hauptnenner finden, plus und minus rechnen',Anwenden:'Erweitern oder nicht? Fehler, das gleiche Ganze',
      Knobeln:'Rätsel, Muster, magisches Quadrat, Schmetterlingstrick',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  etappe({id:'vervielfachen',letter:'V',name:'Brüche vervielfachen und teilen',desc:'Brüche und gemischte Zahlen mal und durch eine natürliche Zahl.',icon:'mal',rank:true,qid:'NQ',finalId:'NA',recommends:['veraendern'],
    finalText:'Du kannst Brüche vervielfachen und teilen. Stark!',
    st:{Entdecken:[{id:'NLAB',title:'Bruch-Maschine',desc:'Brüche vervielfachen und teilen ausprobieren.'}],Verstehen:['N01','N02'],
      Üben:['N03','N04',{id:'N05',note:'Dafür hilft das Umwandeln gemischter Zahlen.'}],Anwenden:['N06'],Knobeln:['N07','N08','N09','N10']},
    basisRefs:['F05','G02'],
    texts:{Entdecken:'Labor: die Bruch-Maschine',Verstehen:'Am Bild: mehrmals nehmen, gerecht verteilen',Üben:'Vervielfachen und teilen mit der Regel, gemischte Zahlen',Anwenden:'Sachaufgaben: mehr oder weniger?',
      Knobeln:'Fehler, geschickt rechnen, Rätsel, Torten',Abschlusscheck:'Eingangstest und Abschlusscheck'}}),
  {id:'dezimal',letter:'D',name:'Brüche und Dezimalzahlen',desc:'Brüche als Dezimalzahlen schreiben und umgekehrt.',icon:'wechsel',status:'geplant'},
  {id:'gemischt',name:'Gemischte Zahlen rechnen',desc:'Ganze und Bruchteil getrennt addieren und subtrahieren.',icon:'plus',status:'geplant'},
  {id:'rechnen',name:'Bruch mal Bruch, Bruch durch Bruch',desc:'Brüche miteinander multiplizieren und dividieren.',icon:'winkel',status:'geplant'}
];

const activeModules=()=>MODULES.filter(m=>m.status==='aktiv');
const plannedModules=()=>MODULES.filter(m=>m.status==='geplant');
const moduleById=(id)=>MODULES.find(m=>m.id===id)||null;
/* P23 Kürzel: Etappenbuchstabe + Nummer im Pfad (Labore und Abschlusscheck ohne Nummer), z. B. E3, H4 – gleich in Lernpfad, Aufgabe und Rückmeldung */
function stationCode(id){
  const m=MODULES.find(x=>(x.path||[]).some(p=>p.id===id));
  if(!m||!m.letter)return '';
  const list=m.path.filter(p=>!p.final&&!/LAB$/.test(p.id)).map(p=>p.id),i=list.indexOf(id);
  return i<0?'':m.letter+(i+1);
}
const flat=(key)=>activeModules().reduce((a,m)=>a.concat(m[key]||[]),[]);

/* Abgeleitet (nur aktive Etappen): Namen und Reihenfolgen, wie sie der Rest der App liest. Gruppen gibt es je Etappe (P1: gleiche Namen in jeder Etappe). */
const PRACTICE_ORDER=flat('practice');
const PATH=flat('path');
/* Etappe, zu der eine Übung oder Station gehört */
const moduleOf=(id)=>activeModules().find(m=>(m.practice||[]).includes(id)||(m.path||[]).some(x=>x.id===id))||null;
/* Aufgaben, die für „alles perfekt“ zählen */
const rankPractice=()=>activeModules().filter(m=>m.rank).reduce((a,m)=>a.concat(m.practice||[]),[]);
const rankPath=()=>activeModules().filter(m=>m.rank).reduce((a,m)=>a.concat(m.path||[]),[]);
