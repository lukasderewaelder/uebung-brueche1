'use strict';
/* =====================================================================
   Erklärkarten der Etappe „Bruch mal Bruch, Bruch durch Bruch“ (nach js/intro.js, vor js/verstehen-extra.js)
   Karte 1 „So geht's“ (das Beispiel mit Bild), Karte 2 „Darauf achten“ (der typische Fehler); dazwischen setzt die App die Probeaufgabe.
   Sätze höchstens 14 Wörter, keine Rechnungen im Satz: Rechnungen stehen in calc. kb = Bild (kbIntroNode).
   Fachwörter (höchstens 3 neu): enthalten sein (K2), Kehrwert (K4), Überschlag (K5, Wiederholung aus Klasse 5).
   ===================================================================== */
Object.assign(INTRO,{
  KLAB:{title:'Falt- und Messlabor',steps:[
    {h:'Zwei Reiter',say:['Beim Falten nimmst du einen Anteil von einem Anteil.','Beim Messen legst du ein Messstück an einen Streifen.','Bild und Rechnung zeigen sofort das Ergebnis.'],kb:{kind:'fold',r:3,s:4,p:2,q:3}},
    {h:'Deine drei Aufträge',say:['Auftrag 1: Falte einen Anteil vom Anteil.','Auftrag 2: Miss, bis nichts mehr passt.','Auftrag 3: Finde beim Falten genau ein Halbes.']}
  ]},
  KQ:{title:'Eingangstest',steps:[
    {h:'Kurz testen',say:[TASKS.KQ.size+' Fragen, keine Note, keine Zeit.','Tippe eine Antwort an. Dann tippe auf **Weiter**.','Am Ende siehst du, was du schon kannst.']}
  ]},
  K01:{title:'Anteil vom Anteil',steps:[
    {h:"So geht's",sub:'Von heißt mal',say:['Färbe zuerst drei Viertel des Rechtecks.','Teile quer in Drittel. Färbe zwei davon.','6 von 12 Feldern sind doppelt gefärbt. Das ist ein Halbes.'],
      kb:{kind:'fold',r:3,s:4,p:2,q:3},calc:[[[2,3],'·',[3,4],'=',[6,12],'=',[1,2]]]},
    {h:'Darauf achten',sub:'Das ganze Rechteck',say:['Das Ganze ist das ganze Rechteck, nicht nur der gefärbte Teil.','Zähle deshalb die Felder im ganzen Rechteck.'],
      fehler:'Nur die Felder im gefärbten Teil zählen.',calc:[{wrong:true,t:[[2,3],'·',[3,4],'=',[6,9]]}]}
  ]},
  K02:{title:'Wie oft passt der Bruch hinein?',steps:[
    {h:"So geht's",sub:'Messen',say:['Die Frage heißt: Wie oft passt ein Halbes in 3?','In 1 passt ein Halbes zweimal. In 3 passt es sechsmal.','Ein Halbes ist in 3 genau 6-mal **enthalten**.'],
      kb:{kind:'measure',X:[3,1],Y:[1,2]},calc:[[3,':',[1,2],'=',6]]},
    {h:'Darauf achten',sub:'Der Rest',say:['Zwei Messstücke passen ganz hinein. Zwei Viertel bleiben übrig.','Das sind zwei Drittel vom Messstück.','Der Rest gehört zum Messstück, nicht zum Ganzen.'],
      fehler:'Den Rest auf das Ganze beziehen.',kb:{kind:'measure',X:[2,1],Y:[3,4]},calc:[[2,':',[3,4],'=',{m:[2,2,3]}]]}
  ]},
  K03:{title:'Bruch mal Bruch',steps:[
    {h:"So geht's",sub:'Die Regel',say:['Rechne Zähler mal Zähler und Nenner mal Nenner.','Kürze vor dem Ausrechnen. Dann bleiben die Zahlen klein.','Eine natürliche Zahl schreibst du als Bruch mit Nenner 1.'],
      calc:[[[2,3],'·',[3,4],'=',[6,12],'=',[1,2]],[[3,4],'·',7,'=',[3,4],'·',[7,1],'=',[21,4]]]},
    {h:'Darauf achten',sub:'Kein gemeinsamer Nenner',say:['Bei Mal brauchst du keinen gemeinsamen Nenner.','Auch die Nenner werden malgenommen.'],
      fehler:'Nur die Zähler malnehmen.',calc:[{wrong:true,t:[[2,3],'·',[3,4],'=',[6,4]]}]}
  ]},
  K04:{title:'Bruch durch Bruch',steps:[
    {h:"So geht's",sub:'Der Kehrwert',say:['Den **Kehrwert** bildest du so: Tausche Zähler und Nenner.','Durch einen Bruch teilen heißt: mal den Kehrwert.','Die erste Zahl bleibt, wie sie ist.'],
      calc:[[[2,3],':',[3,4],'=',[2,3],'·',[4,3],'=',[8,9]],[3,':',[3,4],'=',[3,1],'·',[4,3],'=',4]]},
    {h:'Darauf achten',sub:'Nur die zweite Zahl',say:['Kehre nur die Zahl hinter dem Geteiltzeichen um.','Die Regel passt auch bei durch eine natürliche Zahl.'],
      fehler:'Beide Zahlen umdrehen.',calc:[{wrong:true,t:[[2,3],':',[3,4],'=',[3,2],'·',[4,3]]},[[3,4],':',5,'=',[3,4],'·',[1,5],'=',[3,20]]]}
  ]},
  K05:{title:'Gemischte Zahlen mal und durch',steps:[
    {h:"So geht's",sub:'Erst umwandeln',say:['Mache zuerst einen **Überschlag**: eine schnelle, grobe Rechnung.','Wandle dann jede gemischte Zahl in einen Bruch um.','Bei durch rechnest du danach mit dem Kehrwert.'],
      calc:[[{m:[2,1,2]},'·',{m:[1,1,3]},'=',[5,2],'·',[4,3],'=',[20,6],'=',{m:[3,1,3]}]]},
    {h:'Darauf achten',sub:'Nicht getrennt rechnen',say:['Getrennt gerechnet fehlen zwei Streifen.','Im Bild sind es neun Viertel.','Wandle deshalb immer zuerst um.'],
      fehler:'Ganze und Bruchteil getrennt malnehmen.',kb:{kind:'area',w1:1,a1:1,b1:2,w2:1,a2:1,b2:2},calc:[[{m:[1,1,2]},'·',{m:[1,1,2]},'=',[9,4],'=',{m:[2,1,4]}]]}
  ]},
  K06:{title:'Mal oder durch?',steps:[
    {h:"So geht's",sub:'Was ist das Ganze?',say:['Frage zuerst: Was ist hier das Ganze?','Ein Anteil von etwas: Das heißt mal.','Wie oft passt etwas hinein? Das heißt durch.'],calc:[[[3,2],':',[1,4],'=',6]]},
    {h:'Darauf achten',sub:'Den Rest deuten',say:['Zwei Meter Band reichen für zwei Schleifen.','Der Rest ist zwei Drittel einer Schleife.','Das sind ein halber Meter Band.'],calc:[[2,':',[3,4],'=',{m:[2,2,3]}]]}
  ]},
  K07:{title:'Null, Eins und Kehrwert',steps:[
    {h:"So geht's",sub:'Besondere Zahlen',say:['0 geteilt durch eine Zahl ist 0.','Eine Zahl passt genau einmal in sich selbst.','1 geteilt durch einen Bruch ist sein Kehrwert.'],calc:[[0,':',[3,5],'=',0],[1,':',[3,5],'=',[5,3]]]},
    {h:'Darauf achten',sub:'Durch 0',say:['Durch 0 kannst du nicht teilen.','Keine Zahl mal 0 ergibt einen Bruch größer als 0.']}
  ]},
  K08:{title:'Größer oder kleiner?',steps:[
    {h:"So geht's",sub:'Ohne Rechnen',say:['Mal einen Bruch kleiner als 1 macht kleiner.','Durch einen Bruch kleiner als 1 macht größer.','Je kleiner das Messstück, desto öfter passt es.'],calc:[[6,'·',[1,2],'=',3],[6,':',[1,2],'=',12]]},
    {h:'Darauf achten',sub:'Alte Regeln',say:['Mal macht nicht immer mehr.','Durch macht nicht immer weniger.']}
  ]},
  K09:{title:'Fehlerdetektiv',steps:[
    {h:"So geht's",sub:'Fehler finden',say:['Jede falsche Rechnung hat einen typischen Fehler.','Vergleiche jeden Schritt mit der Regel.','Wähle die Erklärung. Rechne dann richtig.'],calc:[{wrong:true,t:[[2,3],':',[3,4],'=',[3,2],'·',[3,4]]}]},
    {h:'Darauf achten',sub:'Die Regeln',say:['Bei mal: Zähler mal Zähler, Nenner mal Nenner.','Bei durch: mal den Kehrwert der zweiten Zahl.']}
  ]},
  K10:{title:'Zahlenrätsel',steps:[
    {h:"So geht's",sub:'Rückwärts rechnen',say:['Die Umkehrung von mal ist durch.','Die Umkehrung von durch ist mal.','Mache am Ende die Probe.'],calc:[['?','·',[2,3],'=',4],[4,':',[2,3],'=',6]]},
    {h:'Darauf achten',sub:'Quadrat',say:['Das Quadrat ist eine Zahl mal sich selbst.','Wandle gemischte Zahlen vorher um.']}
  ]},
  KA:{title:'Abschlusscheck',steps:[
    {h:'Wie viele Aufgaben?',say:['Der Abschlusscheck hat '+TASKS.KA.size+' Aufgaben.',KA_TAP+' davon tippst du nur an.','Bei '+KA_CALC.length+' Aufgaben rechnest du selbst.']},
    {h:'Die Urkunde',say:['Ab '+needOf(TASKS.KA.size)+' Punkten gibt es die Urkunde.','Mit Tipp oder zweitem Versuch zählt eine Aufgabe halb.','Alle Pflicht-Stationen müssen vorher fertig sein.']}
  ]}
});
