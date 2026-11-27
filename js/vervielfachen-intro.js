'use strict';
/* =====================================================================
   Erklärkarten der Etappe V „Brüche vervielfachen und teilen“ (nach js/intro.js, vor js/verstehen-extra.js, das sie auf 2 Karten kürzt)
   Karte 1 heißt „So geht's“ (das Beispiel), Karte 2 „Darauf achten“ (der typische Fehler); dazwischen setzt die App die Probeaufgabe.
   Sätze höchstens 14 Wörter, keine Rechnungen im Satz: Rechnungen stehen in calc. vt = Bild der Etappe (vtIntroNode),
   fehler = der typische Fehler als kurzer Satz (Karte „Darauf achten“; seit 27.11.2026 ohne Figuren).
   ===================================================================== */
Object.assign(INTRO,{
  NLAB:{title:'Bruch-Maschine',steps:[
    {h:'Die Maschine',say:['Oben stellst du einen Bruch ein.','Die Knöpfe vervielfachen oder teilen ihn.','Bild und Rechnung zeigen sofort das Ergebnis.'],vt:{kind:'strips',a:2,b:5,n:3}},
    {h:'Deine drei Aufträge',say:['Auftrag 1: Vervielfache einen Bruch.','Auftrag 2: Teile einen Bruch.','Auftrag 3: Finde eine Aufgabe mit genau einem Ganzen.']}
  ]},
  NQ:{title:'Eingangstest',steps:[
    {h:'Kurz testen',say:[TASKS.NQ.size+' Fragen, keine Note, keine Zeit.','Tippe eine Antwort an. Dann tippe auf **Weiter**.','Am Ende siehst du, was du schon kannst.']}
  ]},
  N01:{title:'Vervielfachen am Bild',steps:[
    {h:"So geht's",sub:'Mehrmals nehmen',say:['**Vervielfachen** heißt: Du nimmst einen Anteil mehrmals.','Lege die Stücke aneinander. Es bleiben Siebtel.','Es werden nur mehr Siebtel.'],
      vt:{kind:'strips',a:2,b:7,n:3},calc:[[[2,7],'·',3,'=',[2,7],'+',[2,7],'+',[2,7],'=',[6,7]]]},
    {h:'Darauf achten',sub:'Zähler und Nenner mal 3?',say:['So wäre es genauso viel wie vorher.','Du hast aber dreimal so viel. Das passt nicht.'],
      fehler:'Zähler und Nenner mal 3 nehmen.',calc:[{wrong:true,t:[[2,7],'·',3,'=',[6,21]]}]}
  ]},
  N02:{title:'Teilen am Bild',steps:[
    {h:"So geht's",sub:'Gerecht verteilen',say:['Zwei Kinder teilen eine Blechpizza gerecht.','Schneide jedes Fünftel in 2 gleiche Stücke.','Jede bekommt 3 Stücke. Jedes Stück ist ein Zehntel.'],
      vt:{kind:'rect',a:3,b:5,n:2},calc:[[[3,5],':',2,'=',[3,10]]]},
    {h:'Darauf achten',sub:'Es wird weniger',say:['Beim Teilen bekommt jeder weniger als vorher.','Mehr als ein Ganzes kann nicht stimmen.','Geht der Zähler glatt auf, bildest du Gruppen.'],
      fehler:'Beim Teilen kommt mehr als vorher heraus.',calc:[{wrong:true,t:[[4,6],':',2,'=',[4,3]]},[[6,7],':',3,'=',[2,7]]]}
  ]},
  N03:{title:'Vervielfachen rechnen',steps:[
    {h:"So geht's",sub:'Die Regel',say:['Viele kleine Teile kannst du kaum zählen.','Der Nenner bleibt gleich.','Nimm nur den Zähler mal die Zahl.'],calc:[[[2,9],'·',4,'=',[8,9]],[[3,4],'·',3,'=',[9,4],'=',{m:[2,1,4]}]]},
    {h:'Darauf achten',sub:'Nicht erweitern',say:['Vervielfachen ist nicht Erweitern.','Beim Erweitern bleibt der Anteil gleich groß.','Beim Vervielfachen wird es viel mehr.'],calc:[[[3,5],'=',[24,40]],[[3,5],'·',8,'=',[24,5]]]}
  ]},
  N04:{title:'Teilen rechnen',steps:[
    {h:"So geht's",sub:'Die Regel',say:['Beim Teilen nimmst du den Nenner mal die Zahl.','Der Zähler bleibt gleich. Die Teile werden kleiner.','Geht der Zähler glatt auf, darfst du auch ihn teilen.'],calc:[[[3,5],':',2,'=',[3,10]],[[6,7],':',3,'=',[2,7]]]},
    {h:'Darauf achten',sub:'Nicht kürzen',say:['Teilen ist nicht Kürzen.','Beim Kürzen bleibt es gleich viel.','Beim Teilen wird es weniger.'],calc:[[[15,18],'=',[5,6]],[[15,18],':',3,'=',[5,18]]]}
  ]},
  N05:{title:'Gemischte Zahlen',steps:[
    {h:"So geht's",sub:'Zwei Wege',say:['Weg 1: Mach zuerst einen Bruch daraus.','Weg 2: Rechne Ganze und Bruchteil getrennt.','Beide Wege sind richtig. Wähle deinen Weg.'],
      calc:[[{m:[3,1,5]},'·',4,'=',[16,5],'·',4,'=',[64,5],'=',{m:[12,4,5]}],[3,'·',4,'+',[1,5],'·',4,'=',12,'+',[4,5],'=',{m:[12,4,5]}]]},
    {h:'Darauf achten',sub:'Auch den Bruchteil',say:['Nimm auch den Bruchteil mal die Zahl.','Beim Teilen wandelst du zuerst in einen Bruch um.'],
      fehler:'Nur die Ganzen malnehmen.',calc:[{wrong:true,t:[{m:[3,1,5]},'·',4,'=',{m:[12,1,5]}]}]}
  ]},
  N06:{title:'Sachaufgaben',steps:[
    {h:"So geht's",sub:'Mehr oder weniger?',say:['Lies genau: Wird es mehr oder weniger?','Mehrere gleiche Portionen: Du vervielfachst.','Gerecht verteilen: Du teilst.']},
    {h:'Darauf achten',sub:'Was ist das Ganze?',say:['Das Rezept ist schon für 4 Personen.','Für 12 Personen brauchst du nur 3-mal so viel.','Frage immer: Was ist hier das Ganze?'],
      fehler:'Für 12 Personen alles mal 12 nehmen.',calc:[[[3,8],'·',3,'=',[9,8],'=',{m:[1,1,8]}]]}
  ]},
  N07:{title:'Fehlerdetektiv',steps:[
    {h:"So geht's",sub:'Fehler finden',say:['Jede Rechnung hat einen typischen Fehler.','Vergleiche den Wert vorher und nachher.','Wähle die Erklärung. Rechne dann richtig.'],calc:[{wrong:true,t:[[15,18],':',3,'=',[5,6]]}]},
    {h:'Darauf achten',sub:'Gleich viel, mehr, weniger',say:['Gekürzt oder erweitert bleibt es gleich viel.','Vervielfacht wird es mehr, geteilt weniger.']}
  ]},
  N08:{title:'Geschickt rechnen',steps:[
    {h:"So geht's",sub:'Vorher kürzen',say:['Manchmal kannst du vor dem Rechnen kürzen.','Die Zahl und der Nenner haben einen gemeinsamen Teiler.','Dann rechnest du mit kleinen Zahlen.'],calc:[[[5,6],'·',3,'=',[5,2]],[[3,4],'·',8,'=',6]]},
    {h:'Darauf achten',sub:'Eine ganze Zahl',say:['Passt der Nenner in den neuen Zähler?','Dann kommt eine ganze Zahl heraus.']}
  ]},
  N09:{title:'Zahlenrätsel',steps:[
    {h:"So geht's",sub:'Lücken füllen',say:['Bei einer Lücke fragst du: Was fehlt?','Mache die Probe: Setze deine Zahl ein.'],calc:[[[2,9],'·','?','=',2]]},
    {h:'Darauf achten',sub:'Besondere Zahlen',say:['Mal 0 ergibt immer 0.','Mal 1 bleibt der Bruch gleich.']}
  ]},
  N10:{title:'Tortenwerkstatt',steps:[
    {h:"So geht's",sub:'Mit Torten',say:['Jede Torte ist ein Ganzes.','Färbe die Stücke so oft, wie die Zahl sagt.','Lies dann ab, wie viele Torten es sind.'],vt:{kind:'circles',a:3,b:4,n:2}},
    {h:'Darauf achten',sub:'Verteilen',say:['Beim Verteilen schneidest du jedes Stück feiner.','Jedes Kind bekommt weniger als vorher.']}
  ]},
  NA:{title:'Abschlusscheck',steps:[
    {h:'Wie viele Aufgaben?',say:['Der Abschlusscheck hat '+TASKS.NA.size+' Aufgaben.',NA_TAP+' davon tippst du nur an.','Bei '+NA_CALC.length+' Aufgaben rechnest du selbst.']},
    {h:'Die Urkunde',say:['Ab '+needOf(TASKS.NA.size)+' Punkten gibt es die Urkunde.','Aufgaben mit Tipp zählen nur halb.','Alle Pflicht-Stationen müssen vorher fertig sein.']}
  ]}
});
/* Bild einer Erklärkarte: Streifen (a/b n-mal), Rechteck (a/b in n Zeilen geschnitten, ein Anteil markiert) oder Torten */
function vtIntroNode(s){
  const box=el('div',{class:'introstage'});
  if(s.kind==='strips')box.append(vtStrips(s.a,s.b,s.n));
  else if(s.kind==='rect')box.append(vtRect(s.a,s.b,s.n,new Set(Array.from({length:s.a},(_,i)=>i))));
  else vtCircles(null,box,s.b,Math.ceil(s.a*s.n/s.b),{on:new Set(Array.from({length:s.a*s.n},(_,i)=>i)),maxW:110});
  return box;
}
