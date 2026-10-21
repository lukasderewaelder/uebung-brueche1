'use strict';
/* =====================================================================
   Themen (Module): die eine Stelle, an der ein Lernthema angemeldet wird
   Ein Thema bringt mit: Übungsgruppen (Üben), Lernpfad-Bauteile und – falls vorhanden –
   Kurztest-Fähigkeiten. Die Aufgabentypen selbst stehen in TASKS (js/tasks.js).
   status 'aktiv': erscheint in Lernen und Üben. status 'geplant': nur ein Hinweis
   „Bald“ ohne Link, ohne Aufgaben (keine Platzhalterseiten).
   rank: Aufgaben und Lernpfad des Themas zählen für „alles perfekt“ (höchster Rang).
   Neues Thema: Eintrag hier, Aufgabentypen in eigener Datei vor modules.js, Symbole in ICON/ACC (exercise.js).
   ===================================================================== */
const needOf=(size)=>Math.ceil(size*4/5); /* 80 % */

const MODULES=[
  {id:'veraendern',name:'Brüche verändern',desc:'Gleiche Anteile erkennen, erweitern und kürzen.',icon:'aus',status:'aktiv',rank:true,quickcheck:true,
    /* Übungsgruppen (Reiter „Üben“): Name → Symbol, Muster, Text, Aufgaben */
    groups:{
      'Entdecken':{pat:'dots',icon:'lupe',text:'Labor, Schnellcheck, Teilbarkeit, Erweitern und Kürzen',ids:['LAB','Q00','G01','T01','G02','G03','G04','G05','B01']},
      'Knobeln':{pat:'dash',icon:'zirkel',text:'Lücken, Fehler und mehrere Lösungen',ids:['U01','U02','U03','O01','O02']},
      'Umwandeln':{pat:'hatch',icon:'wechsel',text:'Dezimalzahlen und gemischte Zahlen',ids:['D01','D02','D03']}
    },
    /* Reihenfolge der Sterne-Liste und der „alles perfekt“-Bedingungen */
    practice:['Q00','G01','T01','G02','G03','G04','G05','B01','U01','U02','U03','O01','O02','D01','D02','D03'],
    /* Lernpfad: Pflicht-Bauteile (must) schalten das jeweils nächste frei */
    path:[
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
    ],
    pathGroups:{Entdecken:'lupe',Erweitern:'aus','Kürzen':'ein',Mischen:'zahnrad',Knobeln:'zirkel',Abschluss:'plakette'},
    /* Welche Fähigkeiten prüft der Kurztest für ein Bauteil? */
    pathSkills:{G01:['gleich'],G02:['erweitern'],T01:['teilbar'],G03:['kuerzen'],G04:['vollstaendig','kuerzen'],G05:['erweitern','kuerzen']}
  },
  {id:'zahlenstrahl',name:'Brüche am Zahlenstrahl',desc:'Brüche einordnen und ablesen.',icon:'lineal',status:'geplant'},
  {id:'vergleichen',name:'Brüche vergleichen',desc:'Brüche vergleichen und ordnen.',icon:'wechsel',status:'geplant'},
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
const PATH_SKILLS=merged('pathSkills');
/* Thema, zu dem eine Übung, ein Bauteil oder eine Gruppe gehört */
const moduleOf=(id)=>activeModules().find(m=>(m.practice||[]).includes(id)||(m.path||[]).some(x=>x.id===id)||(m.groups&&m.groups[id]))||null;
/* Aufgaben, die für „alles perfekt“ zählen */
const rankPractice=()=>activeModules().filter(m=>m.rank).reduce((a,m)=>a.concat(m.practice||[]),[]);
const rankPath=()=>activeModules().filter(m=>m.rank).reduce((a,m)=>a.concat(m.path||[]),[]);
