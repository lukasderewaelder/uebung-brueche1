'use strict';
/* =====================================================================
   Themen (Module): die eine Stelle, an der ein Lernthema angemeldet wird
   Ein Thema bringt mit: Übungsgruppen (Üben), Lernpfad-Bauteile. Die Aufgabentypen selbst stehen in TASKS (js/tasks.js).
   status 'aktiv': erscheint in Lernen und Üben. status 'geplant': nur ein Hinweis
   „Bald“ ohne Link, ohne Aufgaben (keine Platzhalterseiten).
   quickcheck: das Thema hat einen Eingangstest (Aufgabe qid; Fähigkeiten und Stationen in QCHK) vor dem Lernpfad (Knopf „Ohne Test starten“ überspringt ihn);
   finalId: der eigene Abschlusscheck (letzte Station des Pfads, Urkunde, Text finalText). recommends: Thema, das man vorher machen sollte (nur ein Hinweis, keine Sperre).
   rank: Aufgaben und Lernpfad des Themas zählen für „alles perfekt“ (höchster Rang).
   Neues Thema: Eintrag hier, Aufgabentypen in eigener Datei vor modules.js, Symbole in ICON/ACC (exercise.js).
   ===================================================================== */
const needOf=(size)=>Math.ceil(size*4/5); /* 80 % */

const MODULES=[
  {id:'veraendern',name:'Erweitern und Kürzen',desc:'Gleiche Anteile erkennen, erweitern und kürzen.',icon:'aus',status:'aktiv',rank:true,quickcheck:true,qid:'Q00',finalId:'QA',finalText:'Du kannst Erweitern und Kürzen. Stark!',
    /* Übungsgruppen (Reiter „Üben“): Name → Symbol, Muster, Text, Aufgaben */
    groups:{
      'Entdecken':{pat:'dots',icon:'lupe',text:'Labor, gleiche Anteile und Bruchbilder',ids:['LAB','G01','B01']},
      'Erweitern':{pat:'dash',icon:'aus',text:'Brüche feiner einteilen',ids:['G02']},
      'Kürzen':{pat:'hatch',icon:'ein',text:'Teilbarkeit, gemeinsame Teiler und Kürzen',ids:['T01','T02','G03','G04']},
      'Mischen':{pat:'dots',icon:'zahnrad',text:'Mal erweitern, mal kürzen',ids:['G05']},
      'Knobeln':{pat:'dash',icon:'zirkel',text:'Lücken, Fehler, Begründen und mehrere Lösungen',ids:['U01','U02','U03','U04','O01','O02']},
      'Umwandeln':{pat:'hatch',icon:'wechsel',text:'Dezimalzahlen und gemischte Zahlen',ids:['D01','D02','D03']},
      'Abschluss':{pat:'dots',icon:'plakette',text:'Eingangstest und Abschlusscheck',ids:['Q00','QA']}
    },
    /* Reihenfolge der Sterne-Liste und der „alles perfekt“-Bedingungen */
    practice:['Q00','QA','G01','T01','T02','G02','G03','G04','G05','B01','U01','U02','U03','U04','O01','O02','D01','D02','D03'],
    /* Lernpfad: Pflicht-Bauteile (must) schalten das jeweils nächste frei */
    path:[
      {id:'LAB',grp:'Entdecken',title:'Bruchlabor',desc:'Erweitern und Kürzen ausprobieren.'},
      {id:'G01',grp:'Entdecken',must:true},
      {id:'B01',grp:'Entdecken'},
      {id:'G02',grp:'Erweitern',must:true},
      {id:'T01',grp:'Kürzen',must:true},
      {id:'T02',grp:'Kürzen',must:true},
      {id:'G03',grp:'Kürzen',must:true},
      {id:'G04',grp:'Kürzen',must:true},
      {id:'G05',grp:'Mischen',must:true},
      {id:'U01',grp:'Knobeln'},{id:'U02',grp:'Knobeln'},{id:'U03',grp:'Knobeln'},{id:'O02',grp:'Knobeln'},
      {id:'QA',grp:'Abschluss',must:true,final:true,title:'Abschlusscheck',desc:TASKS.QA.size+' Aufgaben zeigen, was du kannst. Ab '+needOf(TASKS.QA.size)+' richtig gibt es die Urkunde.'}
    ],
    pathGroups:{Entdecken:'lupe',Erweitern:'aus','Kürzen':'ein',Mischen:'zahnrad',Knobeln:'zirkel',Umwandeln:'wechsel',Abschluss:'plakette'}
  },
  {id:'zahlenstrahl',name:'Brüche am Zahlenstrahl',desc:'Brüche ablesen, eintragen und passend einteilen.',icon:'lineal',status:'aktiv',rank:false,quickcheck:true,qid:'ZQ',finalId:'ZA',recommends:'veraendern',finalText:'Du kannst Brüche am Zahlenstrahl ablesen und eintragen. Stark!',
    groups:{
      'Einteilung':{pat:'dots',icon:'lupe',text:'Abschnitte und Einteilungen erkennen',ids:['Z01']},
      'Eintragen':{pat:'dash',icon:'lineal',text:'Brüche ablesen und eintragen',ids:['Z02','Z03']},
      'Zwei Wege':{pat:'hatch',icon:'wechsel',text:'Einteilung anpassen, Bruch anpassen, mehrere Brüche',ids:['Z04','Z05','Z06']},
      'Weiter':{pat:'dots',icon:'aus',text:'Ein Ganzes erkennen und Brüche über 1',ids:['Z07','Z08']},
      'Abschlusscheck':{pat:'dash',icon:'plakette',text:'Eingangstest und Abschlusscheck',ids:['ZQ','ZA']}
    },
    practice:['ZQ','ZA','Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'],
    /* Lernpfad: alle Bauteile sind Pflicht (zwei Wege: Z04 Einteilung anpassen, Z05 Bruch anpassen); ZQ ist der Abschlusscheck */
    path:[
      {id:'Z01',grp:'Einteilung',must:true},
      {id:'Z02',grp:'Eintragen',must:true},{id:'Z03',grp:'Eintragen',must:true},
      {id:'Z04',grp:'Zwei Wege',must:true,note:'Dafür hilft Erweitern und Kürzen.'},{id:'Z05',grp:'Zwei Wege',must:true,note:'Dafür hilft Erweitern und Kürzen.'},{id:'Z06',grp:'Zwei Wege',must:true},
      {id:'Z07',grp:'Weiter',must:true},{id:'Z08',grp:'Weiter',must:true},
      {id:'ZA',grp:'Abschlusscheck',must:true,final:true,title:'Abschlusscheck',desc:TASKS.ZA.size+' Aufgaben zeigen, was du kannst. Ab '+needOf(TASKS.ZA.size)+' richtig gibt es die Urkunde.'}
    ],
    pathGroups:{Einteilung:'lupe',Eintragen:'lineal','Zwei Wege':'wechsel',Weiter:'aus',Abschlusscheck:'plakette'}
  },
  {id:'vergleichen',name:'Brüche vergleichen',desc:'Brüche vergleichen und ordnen.',icon:'wechsel',status:'aktiv',rank:false,recommends:'veraendern',
    groups:{
      'Zwei Regeln':{pat:'dots',icon:'balken',text:'Nenner gleich, Zähler gleich und beides im Vergleich',ids:['W01','W02','W03']},
      'Fehlt zum Ganzen':{pat:'dash',icon:'luecke',text:'Gleich viele Teile fehlen zum Ganzen',ids:['W04']},
      'Mehr Wege':{pat:'hatch',icon:'aus',text:'Auf einen Nenner bringen, die Vergleichszahl und der schnellste Weg',ids:['W05','W06','W07']},
      'Ordnen':{pat:'dots',icon:'netz',text:'Brüche ordnen, über 1 und dazwischen',ids:['W08','W09','W10']}
    },
    practice:['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10'],
    /* Lernpfad: alle Bauteile sind Pflicht */
    path:[
      {id:'W01',grp:'Zwei Regeln',must:true},{id:'W02',grp:'Zwei Regeln',must:true},{id:'W03',grp:'Zwei Regeln',must:true},
      {id:'W04',grp:'Fehlt zum Ganzen',must:true},
      {id:'W05',grp:'Mehr Wege',must:true,note:'Dafür hilft Erweitern und Kürzen.'},{id:'W06',grp:'Mehr Wege',must:true},{id:'W07',grp:'Mehr Wege',must:true},
      {id:'W08',grp:'Ordnen',must:true},{id:'W09',grp:'Ordnen',must:true},{id:'W10',grp:'Ordnen',must:true}
    ],
    pathGroups:{'Zwei Regeln':'balken','Fehlt zum Ganzen':'luecke','Mehr Wege':'aus',Ordnen:'netz'}
  },
  {id:'rechnen',name:'Mit Brüchen rechnen',desc:'Addieren, subtrahieren, multiplizieren, dividieren.',icon:'zahnrad',status:'geplant'}
];

const activeModules=()=>MODULES.filter(m=>m.status==='aktiv');
const plannedModules=()=>MODULES.filter(m=>m.status==='geplant');
const moduleById=(id)=>MODULES.find(m=>m.id===id)||null;
const flat=(key)=>activeModules().reduce((a,m)=>a.concat(m[key]||[]),[]);
const merged=(key)=>activeModules().reduce((o,m)=>Object.assign(o,m[key]||{}),{});

/* Abgeleitet (nur aktive Themen): Namen und Reihenfolgen, wie sie der Rest der App liest */
const PRACTICE_ORDER=flat('practice');
const PATH=flat('path');
const GROUPS=merged('groups');
const PATH_GROUPS=merged('pathGroups');
/* Thema, zu dem eine Übung, ein Bauteil oder eine Gruppe gehört */
const moduleOf=(id)=>activeModules().find(m=>(m.practice||[]).includes(id)||(m.path||[]).some(x=>x.id===id)||(m.groups&&m.groups[id]))||null;
/* Aufgaben, die für „alles perfekt“ zählen */
const rankPractice=()=>activeModules().filter(m=>m.rank).reduce((a,m)=>a.concat(m.practice||[]),[]);
const rankPath=()=>activeModules().filter(m=>m.rank).reduce((a,m)=>a.concat(m.path||[]),[]);
