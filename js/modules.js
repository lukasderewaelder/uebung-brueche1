'use strict';
/* =====================================================================
   Themen (Module): die eine Stelle, an der ein Lernthema angemeldet wird
   Ein Thema bringt mit: Übungsgruppen (Üben), Lernpfad-Bauteile. Die Aufgabentypen selbst stehen in TASKS (js/tasks.js).
   status 'aktiv': erscheint in Lernen und Üben. status 'geplant': nur ein Hinweis
   „Bald“ ohne Link, ohne Aufgaben (keine Platzhalterseiten).
   quickcheck: das Thema hat einen Eingangstest (Aufgabe qid; Fähigkeiten und Stationen in QCHK) vor dem Lernpfad (der Textlink „Ohne Test beginnen“ überspringt ihn);
   finalId: der eigene Abschlusscheck (letzte Station des Pfads, Urkunde, Text finalText). recommends: Thema, das man vorher machen sollte (nur ein Hinweis, keine Sperre).
   short, sub (freiwillig): kürzerer Name und Zusatzzeile für die Kachel im Reiter „Lernen“ (sonst steht dort name).
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
      'Mischen':{pat:'dots',icon:'wechsel',text:'Mal erweitern, mal kürzen',ids:['G05']},
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
    pathGroups:{Entdecken:'lupe',Erweitern:'aus','Kürzen':'ein',Mischen:'wechsel',Knobeln:'zirkel',Umwandeln:'wechsel',Abschluss:'plakette'}
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
  {id:'vergleichen',name:'Brüche vergleichen',desc:'Brüche vergleichen und ordnen.',icon:'wechsel',status:'aktiv',rank:false,quickcheck:true,qid:'WQ',finalId:'WA',recommends:'veraendern',finalText:'Du kannst Brüche vergleichen und ordnen. Stark!',
    groups:{
      'Zwei Regeln':{pat:'dots',icon:'balken',text:'Nenner gleich, Zähler gleich und beides im Vergleich',ids:['W01','W02','W03']},
      'Fehlt zum Ganzen':{pat:'dash',icon:'luecke',text:'Gleich viele Teile fehlen zum Ganzen',ids:['W04']},
      'Mehr Wege':{pat:'hatch',icon:'aus',text:'Auf einen Nenner bringen, die Vergleichszahl und der schnellste Weg',ids:['W05','W06','W07']},
      'Ordnen':{pat:'dots',icon:'netz',text:'Brüche ordnen, über 1 und dazwischen',ids:['W08','W09','W10']},
      'Check Vergleichen':{pat:'dash',icon:'plakette',text:'Eingangstest und Abschlusscheck',ids:['WQ','WA']}
    },
    practice:['WQ','WA','W01','W02','W03','W04','W05','W06','W07','W08','W09','W10'],
    /* Lernpfad: alle Bauteile sind Pflicht */
    path:[
      {id:'W01',grp:'Zwei Regeln',must:true},{id:'W02',grp:'Zwei Regeln',must:true},{id:'W03',grp:'Zwei Regeln',must:true},
      {id:'W04',grp:'Fehlt zum Ganzen',must:true},
      {id:'W05',grp:'Mehr Wege',must:true,note:'Dafür hilft Erweitern und Kürzen.'},{id:'W06',grp:'Mehr Wege',must:true},{id:'W07',grp:'Mehr Wege',must:true},
      {id:'W08',grp:'Ordnen',must:true},{id:'W09',grp:'Ordnen',must:true},{id:'W10',grp:'Ordnen',must:true},
      {id:'WA',grp:'Check Vergleichen',must:true,final:true,title:'Abschlusscheck',desc:TASKS.WA.size+' Aufgaben zeigen, was du kannst. Ab '+needOf(TASKS.WA.size)+' richtig gibt es die Urkunde.'}
    ],
    pathGroups:{'Zwei Regeln':'balken','Fehlt zum Ganzen':'luecke','Mehr Wege':'aus',Ordnen:'netz','Check Vergleichen':'plakette'}
  },
  /* Addieren und Subtrahieren, Teil 1: gleiche Nenner (R01–R05: Addieren am Bild, Addieren und rechnen, Subtrahieren am Bild, Subtrahieren und rechnen, Plus oder minus?).
     Reihenfolge: gleichnamig (addsub), ungleichnamig (addsub2, Block 2), gemischte Zahlen (Block 3, kommt später). Jeder Block ist ein eigenes Thema mit eigenem Check. */
  {id:'addsub',name:'Gleichnamige Brüche addieren und subtrahieren',short:'Addieren und Subtrahieren',sub:'Gleichnamige Brüche',desc:'Der Nenner bleibt, die Zähler werden addiert oder subtrahiert.',icon:'plusminus',status:'aktiv',rank:false,quickcheck:true,qid:'RQ',recommends:'veraendern',
    finalId:'RA',finalText:'Du kannst gleichnamige Brüche addieren und subtrahieren. Stark!',
    groups:{
      'Ausprobieren':{pat:'dots',icon:'lupe',text:'Labor: Plus und Minus ausprobieren',ids:['RLAB']},
      'Addieren':{pat:'dots',icon:'plus',text:'Bild lesen, Zähler addieren, Nenner bleibt',ids:['R01','R02']},
      'Subtrahieren':{pat:'dash',icon:'minus',text:'Durchkreuzen, Zähler subtrahieren, Nenner bleibt',ids:['R03','R04']},
      'Plus oder minus?':{pat:'hatch',icon:'plusminus',text:'Rechenart erkennen, Fehler finden, eigene Aufgaben',ids:['R05']},
      'Check Gleichnamig':{pat:'dots',icon:'plakette',text:'Eingangstest und Abschlusscheck',ids:['RQ','RA']}
    },
    practice:['RQ','RA','R01','R02','R03','R04','R05'],
    /* Lernpfad: alle Bauteile sind Pflicht, in dieser Reihenfolge; am Ende der Abschlusscheck mit der Urkunde dieses Themas */
    path:[
      {id:'RLAB',grp:'Ausprobieren',title:'Bruchlabor Plus und Minus',desc:'Addieren und Subtrahieren ausprobieren.'},
      {id:'R01',grp:'Addieren',must:true},{id:'R02',grp:'Addieren',must:true},
      {id:'R03',grp:'Subtrahieren',must:true},{id:'R04',grp:'Subtrahieren',must:true},
      {id:'R05',grp:'Plus oder minus?',must:true},
      {id:'RA',grp:'Check Gleichnamig',must:true,final:true,title:'Abschlusscheck',desc:TASKS.RA.size+' Aufgaben zeigen, was du kannst. Ab '+needOf(TASKS.RA.size)+' richtig gibt es die Urkunde.'}
    ],
    pathGroups:{'Ausprobieren':'lupe','Addieren':'plus','Subtrahieren':'minus','Plus oder minus?':'plusminus','Check Gleichnamig':'plakette'}
  },
  /* Addieren und Subtrahieren, Teil 2: ungleichnamige Brüche (Kürzel H, Konzeptdatei vom 21.11.2026). Gruppennamen sind über alle Themen eindeutig
     (GROUPS und PATH_GROUPS werden nach Namen gemischt). Die Knobelstationen H08–H13 stehen ohne must im Pfad: sofort offen, zählen nicht für die Urkunde. */
  {id:'addsub2',name:'Ungleichnamige Brüche addieren und subtrahieren',short:'Addieren und Subtrahieren',sub:'Ungleichnamige Brüche',
    desc:'Erst den Hauptnenner finden, dann die Zähler addieren oder subtrahieren.',
    icon:'kreuzraster',status:'aktiv',rank:false,recommends:'addsub',
    quickcheck:true,qid:'HQ',finalId:'HA',
    finalText:'Du kannst ungleichnamige Brüche addieren und subtrahieren. Stark!',
    groups:{
      'Labor Teilung':{pat:'dots',icon:'lupe',text:'Labor: gemeinsame Teilung ausprobieren',ids:['HLAB']},
      'Hauptnenner':{pat:'hatch',icon:'kreuzraster',text:'Trick 17 und Erweitern',ids:['H02']},
      'Plus ungleichnamig':{pat:'dots',icon:'plus',text:'Teilung übertragen, Zähler addieren',ids:['H03','H04']},
      'Minus ungleichnamig':{pat:'dash',icon:'minus',text:'Wegnehmen und ergänzen',ids:['H05','H06']},
      'Erweitern oder nicht?':{pat:'hatch',icon:'plusminus',text:'Hinschauen, Fehler finden, das gleiche Ganze, Rechenschlange',ids:['H07']},
      'Knobeln mit Brüchen':{pat:'dots',icon:'zirkel',text:'Rätsel, Muster und das magische Quadrat',ids:['H08','H09','H10','H11','H12','H13']},
      'Schmetterlingstrick':{pat:'hatch',icon:'schmetterling',text:'Zweiter Weg: über Kreuz malnehmen',ids:['H14']},
      'Check Ungleichnamig':{pat:'dash',icon:'plakette',text:'Eingangstest und Abschlusscheck',ids:['HQ','HA']}
    },
    practice:['HQ','HA','H02','H03','H04','H05','H06','H07','H08','H09','H10','H11','H12','H13','H14'],
    path:[
      {id:'HLAB',grp:'Labor Teilung',title:'Bruchlabor Gemeinsame Teilung',desc:'Teilungen übertragen und Brüche zusammenfügen.'},
      {id:'H02',grp:'Hauptnenner',must:true,note:'Dafür hilft Erweitern und Kürzen.'},
      {id:'H03',grp:'Plus ungleichnamig',must:true},{id:'H04',grp:'Plus ungleichnamig',must:true},
      {id:'H05',grp:'Minus ungleichnamig',must:true},{id:'H06',grp:'Minus ungleichnamig',must:true},
      {id:'H07',grp:'Erweitern oder nicht?',must:true},
      {id:'H08',grp:'Knobeln mit Brüchen'},{id:'H09',grp:'Knobeln mit Brüchen'},{id:'H10',grp:'Knobeln mit Brüchen'},
      {id:'H11',grp:'Knobeln mit Brüchen'},{id:'H12',grp:'Knobeln mit Brüchen'},{id:'H13',grp:'Knobeln mit Brüchen'},
      {id:'H14',grp:'Schmetterlingstrick'},
      {id:'HA',grp:'Check Ungleichnamig',must:true,final:true,title:'Abschlusscheck',
        desc:TASKS.HA.size+' Aufgaben zeigen, was du kannst. Ab '+needOf(TASKS.HA.size)+' richtig gibt es die Urkunde.'}
    ],
    pathGroups:{'Labor Teilung':'lupe','Hauptnenner':'kreuzraster','Plus ungleichnamig':'plus',
      'Minus ungleichnamig':'minus','Erweitern oder nicht?':'plusminus','Knobeln mit Brüchen':'zirkel','Schmetterlingstrick':'schmetterling','Check Ungleichnamig':'plakette'}
  },
  {id:'rechnen',name:'Brüche multiplizieren und dividieren',desc:'Malnehmen und teilen mit Brüchen.',icon:'winkel',status:'geplant'}
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
