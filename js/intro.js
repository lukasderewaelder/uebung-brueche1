'use strict';
/* =====================================================================
   Erklärungen: Anleitung beim ersten Öffnen eines Lernpfad-Bauteils
   Kurze Karten (3–4 Schritte) mit Bild, Rechnung und – bei Erweitern und Kürzen – zum Ausprobieren.
   Sätze höchstens 14 Wörter (runSelfTests prüft das). **fett** nennt einen Knopf oder ein Merkwort, {n|d} ist ein Bruch.
   Rechnungen stehen als Daten in calc, nie im Text: [n,d] = Bruch, [n,d,'x',k] bzw. [n,d,'d',k] = Bruch mit „· k“
   bzw. „: k“ in Zähler und Nenner, {m:[w,n,d]} = gemischte Zahl, Zahl = Zahl, anderer Text = Rechenzeichen oder Wort, {wrong:true,t:[…]} = falsche Rechnung.
   Schritt: h (Überschrift), say (Sätze), dazu höchstens eins von fig (Streifen/Kreise), lab (Ausgang/Jetzt), tryit (Ausprobieren), calc.
   Gate in renderAll: ungesehen oder per Knopf „Erklärung“ im Merkkasten (view.intro). Altbestand: migrateIntro.
   ===================================================================== */
const INTRO={
  LAB:{title:'Bruchlabor',steps:[
    {h:'Ein Bruch, zwei Bilder',
      say:['Im Labor siehst du einen Bruch als Streifen.','Oben steht **Ausgang**. Unten steht **Jetzt**.','Du kannst oben auf **Kreis** wechseln.'],
      lab:{base:[2,3],cur:[4,6],op:'x',k:2}},
    {h:'Erweitern: feiner teilen',
      say:['Tippe auf **× 2**.','Jedes Teil wird in 2 kleinere Teile geteilt.','Das Gefärbte endet immer an der gestrichelten Linie.'],
      tryit:{base:[2,3],op:'x',ks:[2,3,4]}},
    {h:'Kürzen: gröber teilen',
      say:['Tippe auf **÷ 3**.','Je 3 kleine Teile werden zu einem großen Teil.','Probiere auch **÷ 2**. Was passiert?'],
      tryit:{base:[6,9],op:'d',ks:[2,3]}},
    {h:'Deine drei Aufträge',
      say:['Auftrag 1: Erweitere einen Bruch.','Auftrag 2: Kürze einen Bruch.','Auftrag 3: Finde heraus, was gleich bleibt.','Mit **Rückgängig** nimmst du einen Schritt zurück.']}
  ]},
  G01:{title:'Gleiche Anteile erkennen',steps:[
    {h:'Zwei Bilder, gleich viel',
      say:['Diese zwei Streifen zeigen denselben Anteil.','Der untere hat mehr Teile, aber kleinere.','Die gefärbte Fläche ist gleich groß.'],
      fig:[{n:2,d:3},{n:4,d:6}]},
    {h:'Zähle genau hin',
      say:['Beide Bilder haben 2 gefärbte Teile.','Aber die Teile sind verschieden groß.','Darum zeigen sie nicht denselben Anteil.'],
      fig:[{n:2,d:3},{n:2,d:6}]},
    {h:'Das Gefärbte kann überall liegen',
      say:['Die gefärbten Teile müssen nicht beieinander liegen.','Auch der Anfang ist egal.','Zähle und vergleiche den Anteil.'],
      fig:{mode:'circle',rows:[{n:1,d:3,fill:[1]},{n:2,d:6,fill:[1,4]}]}},
    {h:'So antwortest du',
      say:['Tippe alle Karten an, die denselben Anteil zeigen.','Oft gibt es mehr als eine richtige Karte.','Dann tippe auf **Prüfen**.']},
    {h:'Mehr als ein Ganzes',
      say:['Manchmal ist der Zähler größer als der Nenner.','Bei {4|3} sind das mehr als 3 Drittel.','Drei Drittel sind ein Ganzes, dazu kommt noch ein Drittel.'],
      fig:[{n:3,d:3},{n:1,d:3}]}
  ]},
  B01:{title:'Bruchbilder verändern',steps:[
    {h:'Das Vorgabebild',
      say:['Du siehst ein Bild mit einem Bruch.','Die gefärbten Teile müssen nicht beieinander liegen.','Du teilst dasselbe Bild feiner ein.'],
      fig:[{n:2,d:3,fill:[0,2]}]},
    {h:'Jedes Teil wird geteilt',
      say:['Jedes alte Teil wird in 2 neue Teile geteilt.','Aus 3 Teilen werden 6 Teile.','Der gefärbte Anteil bleibt gleich groß.'],
      fig:[{n:2,d:3,fill:[0,2]},{n:4,d:6,fill:[0,1,4,5],acc:'erw'}]},
    {h:'Das Gefärbte wächst mit',
      say:['Aus jedem gefärbten Teil werden 2 gefärbte Teile.','Aus 2 gefärbten Teilen werden also 4.'],
      calc:[[[2,3],'=',[2,3,'x',2],'=',[4,6]]]},
    {h:'So machst du es',
      say:['Tippe die neuen Teile an, die gefärbt sein sollen.','Unter dem Bild zählt dein Bruch mit.','Stimmt alles, tippe auf **Prüfen**.']}
  ]},
  G02:{title:'Erweitern',steps:[
    {h:'Erweitern heißt: feiner teilen',
      say:['Hier siehst du {2|3} als Bild.','2 von 3 Teilen sind gefärbt.','Dieses Bild teilen wir jetzt feiner.'],
      fig:[{n:2,d:3}]},
    {h:'Jedes Teil wird geteilt',
      say:['Wir teilen jedes Teil in 2 kleinere Teile.','Aus 3 Teilen werden 6 Teile.','Aus 2 gefärbten Teilen werden 4.','Der gefärbte Anteil bleibt gleich.'],
      fig:[{n:2,d:3},{n:4,d:6,acc:'erw'}]},
    {h:'Probiere es selbst aus',
      say:['Tippe auf eine Zahl.','Zähler und Nenner rechnen immer mit.'],
      tryit:{base:[2,3],op:'x',ks:[2,3,4]}},
    {h:'Die Regel',
      say:['Beim Erweitern multiplizierst du Zähler und Nenner mit derselben Zahl.','Diese Zahl heißt **Erweiterungszahl**.','Der Wert des Bruchs bleibt gleich.'],
      calc:[[[2,3],'=',[2,3,'x',2],'=',[4,6]]]}
  ]},
  T01:{title:'Teilbarkeit',steps:[
    {h:'Teilbar heißt: kein Rest',
      say:['Du bekommst eine Zahl und tippst Ja oder Nein.','**Ja**, wenn beim Teilen kein Rest bleibt.','**Nein**, wenn ein Rest bleibt.'],
      calc:[[12,':',3,'=',4,'→','Ja'],[14,':',3,'=',4,'Rest',2,'→','Nein']]},
    {h:'Die letzte Ziffer verrät viel',
      say:['**2**: Die letzte Ziffer ist 0, 2, 4, 6 oder 8.','**5**: Die letzte Ziffer ist 0 oder 5.','**10**: Die letzte Ziffer ist 0.']},
    {h:'Die Quersumme',
      say:['Für **3** und **9** brauchst du die Quersumme.','Addiere dazu alle Ziffern.','Ist die Summe durch 3 teilbar, ist es auch die Zahl.','Bei der 9 ist es genauso.'],
      calc:[[252,'→',2,'+',5,'+',2,'=',9]]},
    {h:'Vier und sechs',
      say:['**4**: Die letzten zwei Ziffern sind durch 4 teilbar.','**6**: Die Zahl ist durch 2 und durch 3 teilbar.','Alle Regeln findest du im **Merkkasten**.']}
  ]},
  T02:{title:'Gemeinsame Teiler',steps:[
    {h:'Zwei Zahlen, ein Teiler',
      say:['Eine Zahl teilt eine andere, wenn kein Rest bleibt.','Gesucht sind Zahlen, die zwei Zahlen zugleich teilen.','Beide Zahlen müssen passen.'],
      calc:[[12,':',6,'=',2],[18,':',6,'=',3]]},
    {h:'Prüfe jede Zahl',
      say:['Probiere eine Zahl nach der anderen.','Eine Zahl, die nur eine von beiden teilt, zählt nicht.','Die Regeln dazu stehen im **Merkkasten**.']},
    {h:'So antwortest du',
      say:['Tippe alle Zahlen an, die beide Zahlen teilen.','Oft passt mehr als eine Zahl.','Dann tippe auf **Prüfen**.']}
  ]},
  G03:{title:'Kürzen',steps:[
    {h:'Kürzen heißt: gröber teilen',
      say:['Beim Kürzen fasst du kleine Teile zu großen Teilen zusammen.','Hier gehören immer 2 Teile zusammen.','Aus {4|6} wird {2|3}.'],
      fig:[{n:4,d:6},{n:2,d:3,acc:'kue'}]},
    {h:'Die Rechnung',
      say:['Du teilst Zähler und Nenner durch dieselbe Zahl.','Diese Zahl heißt **Kürzungszahl**.','Der Wert des Bruchs bleibt gleich.'],
      calc:[[[4,6],'=',[4,6,'d',2],'=',[2,3]]]},
    {h:'Probiere es selbst aus',
      say:['Tippe auf **÷ 2**.','Tippe dann auf **÷ 3**. Was passiert?'],
      tryit:{base:[4,6],op:'d',ks:[2,3]}},
    {h:'Nur, wenn beide passen',
      say:['Du kannst nur durch eine Zahl kürzen, die in beide Zahlen passt.','Prüfe vorher: Bleibt oben und unten kein Rest?','Die Regeln dazu stehen im **Merkkasten**.']}
  ]},
  G04:{title:'Kürzen so weit wie möglich',steps:[
    {h:'Kürzen in Schritten',
      say:['Teile erst durch die kleinste Zahl, die passt.','Prüfe dann noch einmal, ob du weiter kürzen kannst.','Hier erst durch 2, dann durch 3.'],
      calc:[[[12,18],'=',[12,18,'d',2],'=',[6,9]],[[6,9],'=',[6,9,'d',3],'=',[2,3]]]},
    {h:'Wann ist Schluss?',
      say:['Kürze, bis keine Zahl mehr in beide passt.','Dann ist der Bruch so weit wie möglich gekürzt.','Bei {2|3} geht nichts mehr.']},
    {h:'Manchmal geht es nicht',
      say:['Bei {5|7} passt keine Zahl in beide.','Dieser Bruch lässt sich nicht kürzen.','Dann tippe auf **Geht nicht mehr**.']},
    {h:'Schnelle Tipps',
      say:['**Sind beide Zahlen gerade, kannst du durch 2 kürzen.**','Enden beide auf 0 oder 5, geht auch die 5.','Enden beide auf 0, geht auch die 10.']}
  ]},
  G05:{title:'Erweitern und Kürzen gemischt',steps:[
    {h:'Erweitern oder kürzen?',
      say:['Hier entscheidest du selbst.','Vergleiche den alten Nenner mit dem neuen.','Wird er größer, erweiterst du.','Wird er kleiner, kürzt du.'],
      calc:[[[3,4],'=',['?',12]],[[6,9],'=',['?',3]]]},
    {h:'Oben und unten dasselbe',
      say:['Finde die Zahl, mit der sich der Nenner ändert.','Rechne mit dem Zähler genauso.'],
      calc:[[[3,4],'=',[3,4,'x',3],'=',[9,12]],[[6,9],'=',[6,9,'d',3],'=',[2,3]]]},
    {h:'Zwei Schritte nacheinander',
      say:['Manchmal steht da: erst erweitern, dann kürzen.','Rechne die Schritte nacheinander.','Der Wert bleibt die ganze Zeit gleich.'],
      calc:[[[4,6],'=',[4,6,'x',3],'=',[12,18]],[[12,18],'=',[12,18,'d',2],'=',[6,9]]]}
  ]},
  U01:{title:'Bruch-Lücken',steps:[
    {h:'Eine Zahl fehlt',
      say:['Zwei Brüche haben denselben Wert.','In einem Bruch fehlt eine Zahl.','Die sollst du finden.'],
      calc:[[[2,3],'=',['?',12]]]},
    {h:'Vergleiche die Zahlen',
      say:['Schau auf die Zahlen, die du kennst.','Von 3 nach 12 ist es mal 4.','Dann rechnest du oben auch mal 4.'],
      calc:[[[2,3],'=',[2,3,'x',4],'=',[8,12]]]},
    {h:'Auch Kürzen kommt vor',
      say:['Manchmal wurde der Bruch gekürzt.','Dann teilst du statt zu multiplizieren.','Tippe in jede Lücke eine Zahl.','Dann tippe auf **Prüfen**.'],
      calc:[[[6,9],'=',[6,9,'d',3],'=',[2,3]]]}
  ]},
  U02:{title:'Erweiterungs- oder Kürzungszahl finden',steps:[
    {h:'Welche Zahl war es?',
      say:['Du siehst einen Bruch und das Ergebnis.','Mit welcher Zahl wurde erweitert oder gekürzt?'],
      calc:[[[3,4],'→',[12,16]]]},
    {h:'Vergleiche Zähler mit Zähler',
      say:['Von 3 nach 12 ist es mal 4.','Mache die Probe mit dem Nenner.'],
      calc:[[3,'·',4,'=',12],[4,'·',4,'=',16]]},
    {h:'Größer oder kleiner?',
      say:['Werden die Zahlen größer, wurde erweitert.','Werden sie kleiner, wurde gekürzt.','Beim Kürzen teilst du, beim Erweitern multiplizierst du.','Die gesuchte Zahl ist immer größer als 1.'],
      calc:[[[12,16],'→',[3,4]],[12,':',4,'=',3],[16,':',4,'=',4]]}
  ]},
  U03:{title:'Fehler finden und berichtigen',steps:[
    {h:'Hier steckt ein Fehler',
      say:['Jemand hat falsch erweitert oder gekürzt.','Du findest den Fehler.','Dann rechnest du richtig.'],
      calc:[{wrong:true,t:[[2,3],'=',[6,3]]}]},
    {h:'Zuerst die Fehlerart',
      say:['Wähle aus, was falsch gemacht wurde.','Zum Beispiel wurde nur der Zähler verändert.','Oder es wurde addiert statt multipliziert.']},
    {h:'Dann richtig rechnen',
      say:['Zähler und Nenner brauchen immer dieselbe Rechnung.','Dann bleibt der Wert gleich.'],
      calc:[[[2,3],'=',[2,3,'x',3],'=',[6,9]]]}
  ]},
  O02:{title:'Kürzen-Maschine',steps:[
    {h:'Die Kürzen-Maschine',
      say:['Tippe auf eine Zahl, zum Beispiel **÷ 2**.','Der Bruch wird sofort gekürzt.','Es geht nur, wenn beide Zahlen teilbar sind.'],
      calc:[[[12,18],'=',[6,9]]]},
    {h:'Bis nichts mehr geht',
      say:['Kürze weiter, bis der Bruch fertig ist.','Dann hast du einen Weg geschafft.','Sind beide Zahlen gerade, kannst du durch 2 kürzen.'],
      calc:[[[6,9],'=',[6,9,'d',3],'=',[2,3]]]},
    {h:'Zwei verschiedene Wege',
      say:['Du brauchst zwei Wege mit verschiedenen Zahlen.','Weg 1 kann ein großer Schritt sein.','Weg 2 besteht aus kleinen Schritten.','Mit **Weg neu starten** beginnst du noch einmal.'],
      calc:[[[12,18],'=',[12,18,'d',6],'=',[2,3]],[[12,18],'=',[6,9],'=',[2,3]]]}
  ]},
  Q00:{title:'Eingangstest',steps:[
    {h:'Kurzfragen',
      say:[TASKS.Q00.size+' Fragen warten auf dich.','Du tippst eine Antwort an. Dann tippst du auf **Prüfen**.','Es gibt keine Zeitmessung.']},
    {h:'Sofort eine Rückmeldung',
      say:['Du siehst gleich, ob die Antwort stimmt.','War sie falsch, siehst du die richtige.','Dann geht es mit der nächsten Frage weiter.']},
    {h:'Danach siehst du, was fehlt',
      say:['Am Ende siehst du, was du schon kannst.','Bekannte Stationen sind dann im Lernpfad markiert.','Weißt du etwas nicht, tippe **Weiß ich nicht** an.']},
    {h:'Der Abschlusscheck',
      say:['Am Ende des Lernpfads wartet der Abschlusscheck.','Er hat '+TASKS.QA.size+' Aufgaben: '+QA_TAP+' zum Antippen und '+QA_CALC.length+' zum Rechnen.','Ab '+needOf(TASKS.Q00.size)+' richtigen Antworten gibt es die Urkunde.']}
  ]},
  QA:{title:'Abschlusscheck',steps:[
    {h:'Wie viele Aufgaben?',
      say:['Der Abschlusscheck hat '+TASKS.QA.size+' Aufgaben.',QA_TAP+' davon tippst du nur an.','Bei '+QA_CALC.length+' Aufgaben rechnest du selbst.']},
    {h:'So geht es',
      say:['Tippe eine Antwort an. Dann tippe auf **Prüfen**.','Bei den Rechenaufgaben tippst du die Zahlen ein.','Tipps und Lösung gibt es nur bei den Rechenaufgaben.']},
    {h:'Die Urkunde',
      say:['Ab '+needOf(TASKS.QA.size)+' richtigen Antworten gibt es die Urkunde.','Aufgaben mit Tipp zählen nur halb.','Alle Pflicht-Stationen müssen vorher fertig sein.']}
  ]},
  ZQ:{title:'Eingangstest',steps:[
    {h:'Kurzfragen zum Zahlenstrahl',
      say:[TASKS.ZQ.size+' Fragen warten auf dich.','Du tippst eine Antwort an. Dann tippst du auf **Prüfen**.','Manchmal siehst du einen Zahlenstrahl.'],
      nline:{from:0,to:1,parts:5,marks:[{n:3,d:5,text:'A'}],labels:'wholes'}},
    {h:'Sofort eine Rückmeldung',
      say:['Du siehst gleich, ob die Antwort stimmt.','War sie falsch, siehst du die richtige.','Es gibt keine Zeitmessung.']},
    {h:'Danach siehst du, was fehlt',
      say:['Am Ende siehst du, was du schon kannst.','Bekannte Stationen sind dann im Lernpfad markiert.','Weißt du etwas nicht, tippe **Weiß ich nicht** an.']},
    {h:'Der Abschlusscheck',
      say:['Am Ende des Lernpfads wartet der Abschlusscheck.','Er hat '+TASKS.ZA.size+' Aufgaben: '+ZA_TAP+' zum Antippen und '+ZA_LINE.length+' am Zahlenstrahl.','Ab '+needOf(TASKS.ZQ.size)+' richtigen Antworten gibt es die Urkunde.']}
  ]},
  /* Zahlenstrahl: nline = ein Strahl oder eine Liste von Strahlen {from,to,parts,marks,labels,strip,secs}; nltry = Einteilung ausprobieren {to,ks,mark} */
  Z01:{title:'Einteilung erkennen',steps:[
    {h:'Striche und Abschnitte',
      say:['Ein Zahlenstrahl hat Striche.','Zwischen zwei Strichen liegt ein **Abschnitt**.','Wir zählen immer die Abschnitte, nicht die Striche.'],
      nline:{from:0,to:1,parts:5,strip:{n:0,d:5},secs:true,labels:'wholes'}},
    {h:'Zähle selbst',
      say:['Tippe auf eine Zahl.','Der Strahl wird anders eingeteilt.','Zähle die Abschnitte und die Striche.'],
      nltry:{to:1,ks:[2,3,4,5]}},
    {h:'Alle Abschnitte gleich breit',
      say:['Auf einem Zahlenstrahl sind alle Abschnitte gleich breit.','Sonst kann man keinen Bruch ablesen.','Schau auch bei vielen Strichen genau hin.'],
      nline:{from:0,to:1,parts:6,labels:'wholes'}},
    {h:'Gezählt wird ein Ganzes',
      say:['Ein Ganzes ist die Strecke von 0 bis 1.','Bei einem längeren Strahl zählst du nur ein Ganzes.','Das Ergebnis wird später der **Nenner**.'],
      nline:{from:0,to:2,parts:3,labels:'wholes'}}
  ]},
  Z02:{title:'Brüche ablesen',steps:[
    {h:'Der Nenner',
      say:['Hier ist ein Ganzes in 4 Abschnitte geteilt.','Der **Nenner** ist also 4.'],
      nline:{from:0,to:1,parts:4,marks:[{n:3,d:4,text:'A'}],labels:'wholes'}},
    {h:'Der Zähler',
      say:['Zähle von 0 aus bis zum Punkt A.','Es sind 3 Abschnitte.','Der **Zähler** ist also 3.'],
      nline:{from:0,to:1,parts:4,marks:[{n:3,d:4,text:'A'}],strip:{n:3,d:4},labels:'wholes'},calc:[[[3,4]]]},
    {h:'Hinter der 1',
      say:['Der Punkt kann auch hinter der 1 liegen.','Zähle dann einfach ab 0 weiter.','Ein Ganzes hat weiterhin 4 Abschnitte.'],
      nline:{from:0,to:2,parts:4,marks:[{n:5,d:4,text:'B'}],labels:'wholes'},calc:[[[5,4]]]},
    {h:'So antwortest du',
      say:['Schreibe Zähler und Nenner in die Felder.','Dann tippe auf **Prüfen**.']}
  ]},
  Z03:{title:'Brüche eintragen',steps:[
    {h:'Der Strahl ist eingeteilt',
      say:['Der Strahl hat schon Striche.','Ein Ganzes ist in gleich große Abschnitte geteilt.'],
      nline:{from:0,to:1,parts:5,labels:'wholes'}},
    {h:'Punkt setzen',
      say:['Tippe auf den Strich, der zum Bruch gehört.','Oder nutze die Pfeile **◀** und **▶**.','Der Punkt springt von Strich zu Strich.'],
      nline:{from:0,to:1,parts:5,marks:[{i:2}],labels:'wholes'}},
    {h:'Abschnitte zählen',
      say:['Für {3|5} zählst du 3 Abschnitte ab 0.','Der Nenner 5 sagt, wie viele Abschnitte ein Ganzes hat.'],
      nline:{from:0,to:1,parts:5,marks:[{n:3,d:5,text:'3/5'}],strip:{n:3,d:5},labels:'wholes'}},
    {h:'Mehrere Punkte',
      say:['Manchmal gibt es mehrere Punkte: A, B und C.','Wähle zuerst den Buchstaben.','Tippe dann auf den Strahl und auf **Prüfen**.']}
  ]},
  Z04:{title:'Einteilung anpassen',steps:[
    {h:'Der Strahl ist noch leer',
      say:['Hier gibt es nur die Striche bei 0 und 1.','Du teilst den Strahl selbst ein.'],
      nline:{from:0,to:1,parts:1,labels:'wholes'}},
    {h:'Der Nenner sagt es',
      say:['Für {3|5} brauchst du 5 Abschnitte.','Stelle bei **Teile je Ganzem** die Zahl 5 ein.','Probiere es hier aus.'],
      nltry:{to:1,ks:[2,3,5,10],mark:{n:3,d:5}}},
    {h:'Dann zählen',
      say:['Zähle 3 Abschnitte von 0 aus.','Tippe auf den Strich oder nutze **◀** und **▶**.'],
      nline:{from:0,to:1,parts:5,marks:[{n:3,d:5,text:'3/5'}],labels:'wholes'}},
    {h:'Feiner geht auch',
      say:['Mit 10 Teilen liegt {3|5} auch auf einem Strich.','Zähle 6 Abschnitte von 0 aus. Dort liegt {6|10}.','Jede Einteilung, in die der Nenner aufgeht, passt.'],
      nline:{from:0,to:1,parts:10,marks:[{n:6,d:10,text:'6/10'}],labels:'wholes'}}
  ]},
  Z05:{title:'Bruch anpassen',steps:[
    {h:'Der Strahl ist schon eingeteilt',
      say:['Hier hat ein Ganzes 10 Abschnitte.','Du sollst {3|5} eintragen.','Der Nenner 5 passt nicht zur Einteilung.'],
      nline:{from:0,to:1,parts:10,strip:{n:3,d:5},labels:'wholes'}},
    {h:'Den Bruch umrechnen',
      say:['Erweitere den Bruch auf den Nenner 10.','Multipliziere Zähler und Nenner mit 2.','Dann zählst du 6 Abschnitte von 0 aus.'],
      calc:[[[3,5],'=',[3,5,'x',2],'=',[6,10]]]},
    {h:'Kürzen geht auch',
      say:['Manchmal musst du kürzen.','Teile Zähler und Nenner durch dieselbe Zahl.','Dann passt der Bruch zur Einteilung.'],
      calc:[[[6,8],'=',[6,8,'d',2],'=',[3,4]]]},
    {h:'Passt die Einteilung?',
      say:['Nicht jeder Bruch passt zu jeder Einteilung.','{1|3} liegt nie genau auf einem Zehntel-Strich.','Dann teile den Strahl feiner. Probiere es aus.'],
      nltry:{to:1,ks:[10,6,9,12],mark:{n:1,d:3}}}
  ]},
  Z06:{title:'Mehrere Brüche eintragen',steps:[
    {h:'Mehrere Brüche, ein Strahl',
      say:['Du trägst mehrere Brüche auf einem Strahl ein.','Dafür brauchst du eine Einteilung für alle.']},
    {h:'Jeder Nenner muss aufgehen',
      say:['Nimm {1|2}, {3|4} und {5|6}.','Die Nenner 2, 4 und 6 gehen alle in 12 auf.','Also teilst du ein Ganzes in 12 Abschnitte.'],
      nline:{from:0,to:1,parts:12,marks:[{n:1,d:2,text:'A'},{n:3,d:4,text:'B'},{n:5,d:6,text:'C'}],labels:'wholes'}},
    {h:'Die kleinste passende Einteilung',
      say:['Je kleiner die Einteilung, desto einfacher.','Suche die kleinste Zahl, in die alle Nenner passen.','Bei 2, 4 und 6 ist das 12.','Das Fachwort heißt kleinstes gemeinsames Vielfaches.']},
    {h:'So gehst du vor',
      say:['Stelle zuerst die Teile je Ganzem ein.','Wähle A, B oder C und tippe auf den Strahl.','Dann tippe auf **Prüfen**.']}
  ]},
  Z07:{title:'Einheit lesen',steps:[
    {h:'Ein Ganzes',
      say:['Ein Ganzes geht von 0 bis 1.','Das gilt auf jedem Strahl.'],
      nline:{from:0,to:2,parts:2,labels:[0,1,2]}},
    {h:'Gleich lange Ganze',
      say:['Jedes weitere Ganze ist genauso lang.','Die langen Striche zeigen die ganzen Zahlen.'],
      nline:{from:0,to:3,parts:2,labels:'ends'}},
    {h:'Derselbe Bruch',
      say:['{1|2} liegt immer in der Mitte zwischen 0 und 1.','Auf einem langen Strahl liegt es nicht in der Strahlmitte.'],
      nline:[{from:0,to:1,parts:2,marks:[{n:1,d:2,text:'1/2'}],labels:'ends'},{from:0,to:2,parts:2,marks:[{n:1,d:2,text:'1/2'}],labels:'ends'}]},
    {h:'Nicht immer bei 0',
      say:['Ein Strahl muss nicht bei 0 beginnen.','Manchmal sind nur 1 und 2 beschriftet.','Der Abstand zwischen ihnen ist ein Ganzes.'],
      nline:{from:1,to:3,parts:2,labels:[1,2]}}
  ]},
  ZA:{title:'Abschlusscheck',steps:[
    {h:'Wie viele Aufgaben?',
      say:['Der Abschlusscheck hat '+TASKS.ZA.size+' Aufgaben.',ZA_TAP+' davon tippst du nur an.','Bei '+ZA_LINE.length+' Aufgaben arbeitest du am Zahlenstrahl.']},
    {h:'So geht es',
      say:['Tippe eine Antwort an. Dann tippe auf **Prüfen**.','Am Zahlenstrahl setzt du Punkte oder stellst die Teile ein.','Tipps und Lösung gibt es nur bei den Strahl-Aufgaben.']},
    {h:'Die Urkunde',
      say:['Ab '+needOf(TASKS.ZA.size)+' richtigen Antworten gibt es die Urkunde.','Aufgaben mit Tipp zählen nur halb.','Alle Pflicht-Stationen müssen vorher fertig sein.']}
  ]},
  Z08:{title:'Größer als 1',steps:[
    {h:'Hinter der 1',
      say:['Brüche können größer als 1 sein.','Hier liegt {7|4} hinter der 1.'],
      nline:{from:0,to:2,parts:4,marks:[{n:7,d:4,text:'7/4'}],labels:'wholes'}},
    {h:'Zwischen welchen Zahlen?',
      say:['Frage: Wie viele Ganze passen hinein?','Es ist ein Ganzes und noch 3 Viertel.','Also liegt {7|4} zwischen 1 und 2.'],
      calc:[[7,':',4,'=',1,'Rest',3]]},
    {h:'Gemischte Zahl',
      say:['Ein Ganzes und 3 Viertel schreibst du als gemischte Zahl.','Der Nenner bleibt gleich.'],
      nline:{from:0,to:2,parts:4,marks:[{n:7,d:4,text:'7/4'}],labels:'wholes'},
      calc:[[[7,4],'=',1,'+',[3,4],'=',{m:[1,3,4]}]]},
    {h:'Brüche, die natürliche Zahlen sind',
      say:['Manche Brüche sind natürliche Zahlen, wie 1, 2 oder 3.','Bei {8|4} geht der Zähler ohne Rest durch den Nenner.','Es sind genau 2 Ganze.'],
      calc:[[8,':',4,'=',2]]}
  ]},
  WQ:{title:'Eingangstest',steps:[
    {h:'Kurzfragen zum Vergleichen',
      say:[TASKS.WQ.size+' Fragen warten auf dich.','Du tippst eine Antwort an. Dann tippst du auf **Prüfen**.','Manchmal siehst du Brüche in einer Reihe.']},
    {h:'Sofort eine Rückmeldung',
      say:['Du siehst gleich, ob die Antwort stimmt.','War sie falsch, siehst du die richtige.','Es gibt keine Zeitmessung.']},
    {h:'Danach siehst du, was fehlt',
      say:['Am Ende siehst du, was du schon kannst.','Bekannte Stationen sind dann im Lernpfad markiert.','Weißt du etwas nicht, tippe **Weiß ich nicht** an.']},
    {h:'Der Abschlusscheck',
      say:['Am Ende des Lernpfads wartet der Abschlusscheck.','Er hat '+TASKS.WA.size+' Aufgaben: '+WA_TAP+' zum Antippen und '+WA_LINE.length+' zum Lösen.','Ab '+needOf(TASKS.WQ.size)+' richtigen Antworten gibt es die Urkunde.']}
  ]},
  WA:{title:'Abschlusscheck',steps:[
    {h:'Wie viele Aufgaben?',
      say:['Der Abschlusscheck hat '+TASKS.WA.size+' Aufgaben.',WA_TAP+' davon tippst du nur an.','Bei '+WA_LINE.length+' Aufgaben löst du selbst.']},
    {h:'So geht es',
      say:['Tippe eine Antwort an. Dann tippe auf **Prüfen**.','Bei den anderen Aufgaben wählst du Zeichen, tippst Zahlen oder legst Karten.','Tipps und Lösung gibt es nur bei den Lösen-Aufgaben.']},
    {h:'Die Urkunde',
      say:['Ab '+needOf(TASKS.WA.size)+' richtigen Antworten gibt es die Urkunde.','Aufgaben mit Tipp zählen nur halb.','Alle Pflicht-Stationen müssen vorher fertig sein.']}
  ]},
  /* Vergleichen: Streifen immer gleich lang untereinander; Zeichen < und > stehen in calc zwischen zwei Brüchen */
  W01:{title:'Nenner gleich',steps:[
    {h:'Gleich große Stücke',
      say:['Beide Streifen sind in 8 gleich große Stücke geteilt.','Beide Brüche haben den Nenner 8.','Die Stücke sind also gleich groß.'],
      fig:[{n:3,d:8},{n:5,d:8}]},
    {h:'Mehr Stücke sind mehr',
      say:['Der Zähler zählt die gefärbten Stücke.','Oben sind es 3 Stücke, unten 5 Stücke.','Darum ist {5|8} größer als {3|8}.'],
      calc:[[[3,8],'<',[5,8]]]},
    {h:'Die Zeichen',
      say:['Das Zeichen zeigt, welcher Bruch kleiner oder größer ist.','Die Spitze zeigt auf den kleineren Bruch.','Sind beide gleich groß, steht ein Gleichheitszeichen.'],
      calc:[[[3,8],'<',[5,8]],[[5,8],'>',[3,8]]]},
    {h:'So antwortest du',
      say:['Schau auf den Nenner. Er ist bei beiden gleich.','Vergleiche dann die Zähler.','Wähle das Zeichen. Dann tippe auf **Prüfen**.']}
  ]},
  W02:{title:'Zähler gleich',steps:[
    {h:'Gleich viele Stücke',
      say:['Bei beiden Brüchen ist ein Stück gefärbt.','Aber die Stücke sind verschieden groß.'],
      fig:[{n:1,d:4},{n:1,d:8}]},
    {h:'Mehr Teile, kleinere Stücke',
      say:['Das Ganze ist einmal in 4, einmal in 8 Teile geteilt.','Je mehr Teile, desto kleiner ist jedes Stück.','Darum ist {1|8} kleiner als {1|4}.'],
      calc:[[[1,8],'<',[1,4]]]},
    {h:'Auch bei mehr Stücken',
      say:['Von jedem Streifen sind zwei Stücke gefärbt.','Die Stücke im unteren Streifen sind kleiner.','Darum ist {2|8} kleiner als {2|4}.'],
      fig:[{n:2,d:4},{n:2,d:8}]},
    {h:'So antwortest du',
      say:['Schau auf den Zähler. Er ist bei beiden gleich.','Vergleiche dann die Nenner.','Der größere Nenner macht den kleineren Bruch.']}
  ]},
  W03:{title:'Nenner oder Zähler?',steps:[
    {h:'Erst schauen',
      say:['Schau zuerst auf beide Brüche.','Ist der Nenner gleich oder der Zähler?','Das entscheidet, welche Regel hilft.']},
    {h:'Nenner gleich',
      say:['Gleicher Nenner heißt: gleich große Stücke.','Dann zählt der Zähler. Mehr Stücke sind mehr.'],
      calc:[[[3,8],'<',[5,8]]]},
    {h:'Zähler gleich',
      say:['Gleicher Zähler heißt: gleich viele Stücke.','Dann zählt der Nenner. Kleinere Stücke sind weniger.'],
      calc:[[[3,8],'<',[3,5]]]},
    {h:'Keins von beiden',
      say:['Manchmal ist weder der Nenner noch der Zähler gleich.','Dann wählst du **Keins von beiden**.','Eine Regel dafür kommt später.']}
  ]},
  /* rest:true zeichnet die fehlenden Teile gestrichelt */
  W04:{title:'Gleich viele Teile fehlen zum Ganzen',steps:[
    {h:'Was fehlt zum Ganzen?',
      say:['Das Ganze sind alle Stücke zusammen.','Bei {8|9} fehlt noch ein Stück.','Bei {11|12} fehlt auch ein Stück.'],
      fig:[{n:8,d:9,rest:true},{n:11,d:12,rest:true}]},
    {h:'Das fehlende Stück',
      say:['Bei beiden fehlt genau ein Stück.','Ein Zwölftel ist kleiner als ein Neuntel.','Bei {11|12} fehlt also weniger.'],
      fig:[{n:8,d:9,rest:true},{n:11,d:12,rest:true}]},
    {h:'Der kleinere Rest gewinnt',
      say:['Fehlt weniger zum Ganzen, ist der Bruch größer.','Das gilt nur, wenn gleich viele Stücke fehlen.','Darum ist {11|12} größer als {8|9}.'],
      calc:[[[8,9],'<',[11,12]]]},
    {h:'Vorsicht',
      say:['Gleich viele fehlende Stücke heißt nicht gleich groß.','Bei {3|4} und {5|6} fehlt je ein Stück.','Trotzdem ist {5|6} größer.'],
      calc:[[[3,4],'<',[5,6]]]},
    {h:'Verschieden viele fehlen',
      say:['Fehlen verschieden viele Stücke, hilft die Regel nicht.','Bei {7|9} fehlen 2 Stücke, bei {3|4} nur eins.','Trotzdem ist {7|9} größer.'],
      calc:[[[3,4],'<',[7,9]]]}
  ]},
  W05:{title:'Auf einen Nenner bringen',steps:[
    {h:'Verschieden eingeteilt',
      say:['Zwei Brüche mit verschiedenen Nennern sind schwer zu vergleichen.','Die Streifen sind verschieden eingeteilt.'],
      fig:[{n:2,d:3},{n:5,d:12}]},
    {h:'Feiner einteilen',
      say:['Wir teilen jedes Drittel in 4 kleinere Teile.','Dann hat auch der obere Streifen 12 Teile.','Der gefärbte Anteil bleibt gleich groß.'],
      fig:[{n:2,d:3},{n:8,d:12,acc:'erw'}]},
    {h:'Das ist Erweitern',
      say:['Wir erweitern mit 4.','Zähler und Nenner werden mit 4 malgenommen.'],
      calc:[[[2,3],'=',[2,3,'x',4],'=',[8,12]]]},
    {h:'Jetzt vergleichen',
      say:['Beide Brüche haben den Nenner 12.','Jetzt zählt nur noch der Zähler.','Darum ist {8|12} größer als {5|12}.'],
      calc:[[[5,12],'<',[8,12]]]},
    {h:'Gleicher Zähler geht auch',
      say:['Manchmal passt ein gleicher Zähler besser.','Erweitere {2|3} mit 2, dann vergleichst du {4|6} mit {4|7}.'],
      calc:[[[2,3],'=',[2,3,'x',2],'=',[4,6]],[[4,7],'<',[4,6]]]}
  ]},
  W06:{title:'Vergleichszahl',steps:[
    {h:'Die Hälfte als Maß',
      say:['{1|2} ist die Hälfte vom Ganzen.','Ein Bruch unter {1|2} ist kleiner als die Hälfte.','Ein Bruch darüber ist größer.'],
      fig:{mode:'strip',rows:[{n:3,d:8,half:true},{n:5,d:8,half:true}]}},
    {h:'Zähler verdoppeln',
      say:['So prüfst du schnell, ob ein Bruch über {1|2} liegt.','Verdopple den Zähler und vergleiche mit dem Nenner.','Bei {5|8} ist der doppelte Zähler 10. Das ist mehr als 8.'],
      calc:[[[5,8],'>',[1,2]]]},
    {h:'Einer darunter, einer darüber',
      say:['Bei {3|8} und {5|7} liegt {1|2} dazwischen.','Dann ist {5|7} der größere Bruch.'],
      fig:{mode:'strip',rows:[{n:3,d:8,half:true},{n:5,d:7,half:true}]},
      calc:[[[3,8],'<',[5,7]]]},
    {h:'Auch die 1 hilft',
      say:['Ist der Zähler größer als der Nenner, liegt der Bruch über 1.','{7|5} liegt über 1 und {5|6} darunter.','Darum ist {7|5} größer als {5|6}.'],
      calc:[[[5,6],'<',[7,5]]]}
  ]},
  W07:{title:'Welcher Weg passt?',steps:[
    {h:'Fünf Wege',
      say:['Du kennst jetzt fünf Wege zum Vergleichen.','Nicht jeder Weg passt zu jedem Paar.','Suche zuerst den schnellsten.']},
    {h:'Der Reihe nach prüfen',
      say:['Ist der Nenner gleich? Dann zählt der Zähler.','Ist der Zähler gleich? Dann zählt der Nenner.','Fehlen gleich viele Teile zum Ganzen? Dann zählt der Rest.']},
    {h:'Liegt eine Vergleichszahl dazwischen?',
      say:['Liegt ein Bruch unter {1|2} und einer darüber?','Dann ist die Sache klar.','Das gilt auch für die 1.']},
    {h:'Erweitern geht immer',
      say:['Auf einen Nenner bringen klappt bei allen Brüchen.','Es dauert aber länger.','Nimm es, wenn kein anderer Weg passt.']},
    {h:'So antwortest du',
      say:['Wähle zuerst den schnellsten Weg.','Dann wähle das Zeichen.','Dann tippe auf **Prüfen**.']}
  ]},
  W08:{title:'Brüche ordnen',steps:[
    {h:'Eine Reihe bilden',
      say:['Du bekommst drei bis fünf Brüche.','Lege sie der Größe nach in die Reihe.','Der kleinste Bruch kommt zuerst.']},
    {h:'Ziehen oder antippen',
      say:['Ziehe eine Karte auf einen Platz.','Oder tippe die Karte an. Sie springt auf den ersten freien Platz.','Tippe eine gelegte Karte an, dann geht sie zurück.']},
    {h:'Zwei auf einmal',
      say:['Vergleiche immer zwei Brüche.','Nimm den Weg, der gerade passt.','Dann weißt du, welcher kleiner ist.'],
      fig:[{n:1,d:4},{n:3,d:8},{n:3,d:4}]},
    {h:'So antwortest du',
      say:['Lege alle Karten ab.','Dann tippe auf **Prüfen**.']}
  ]},
  W09:{title:'Größer als 1',steps:[
    {h:'Ganze zuerst',
      say:['Ein Bruch über 1 enthält Ganze.','Teile den Zähler durch den Nenner.','Bei {9|4} sind es 2 Ganze und noch ein Viertel.'],
      calc:[[9,':',4,'=',2,'Rest',1]]},
    {h:'Gemischte Zahl',
      say:['Die Ganzen und der Rest ergeben eine gemischte Zahl.','Der Nenner bleibt gleich.'],
      calc:[[[9,4],'=',2,'+',[1,4],'=',{m:[2,1,4]}]]},
    {h:'Ganze vergleichen',
      say:['Hat eine Zahl mehr Ganze, ist sie größer.','Sind die Ganzen gleich, vergleichst du die Reste.','Der Zahlenstrahl hilft dabei.'],
      nline:{from:0,to:3,parts:4,marks:[{n:9,d:4,text:'9/4'},{n:11,d:4,text:'11/4'}],labels:'wholes'}},
    {h:'Zahlen ordnen',
      say:['Auch gemischte Zahlen und unechte Brüche kannst du ordnen.','Schau zuerst auf die Ganzen.','Ziehe oder tippe die Karten in die Reihe.']}
  ]},
  W10:{title:'Dazwischen',steps:[
    {h:'Immer noch ein Bruch',
      say:['Zwischen zwei Brüchen liegt immer noch ein Bruch.','Das gilt auch für Brüche, die dicht beieinander liegen.'],
      nline:{from:0,to:1,parts:5,marks:[{n:3,d:5,text:'3/5'},{n:4,d:5,text:'4/5'}],labels:'wholes'}},
    {h:'Feiner einteilen',
      say:['Zwischen {3|5} und {4|5} scheint kein Platz zu sein.','Erweitere beide Brüche mit 2.','Dann liegt {7|10} dazwischen.'],
      calc:[[[3,5],'=',[3,5,'x',2],'=',[6,10]],[[4,5],'=',[4,5,'x',2],'=',[8,10]]]},
    {h:'So antwortest du',
      say:['Manchmal nennst du einen Bruch dazwischen.','Schreibe ihn in die Felder.','Manchmal prüfst du eine Behauptung.']}
  ]}
};
const hasIntro=(id)=>Object.prototype.hasOwnProperty.call(INTRO,id);
const introSeen=(id)=>!!(S.intro&&S.intro[id]===true);
/* Zu welcher Ansicht gehört eine Erklärung? Bruchlabor und jede Übung des Lernpfads – nicht die Spiele */
function introIdOf(v){
  if(!v)return null;
  if(v.kind==='lab')return 'LAB';
  if(v.kind==='practice'&&typeof v.id==='string'&&hasIntro(v.id)&&TASKS[v.id])return v.id;
  return null;
}
/* Gate: Welche Erklärung soll statt der Ansicht erscheinen? Ungesehen, oder ausdrücklich geöffnet (view.intro) */
function introWanted(v){
  const id=introIdOf(v);
  return id&&(!introSeen(id)||(v&&v.intro===true))?id:null;
}
/* Schema 7: Wer ein Bauteil schon bearbeitet hat, bekommt dessen Erklärung nicht noch einmal.
   „Bearbeitet“ = Zähler der Übung, bestanden oder Antworten in einer Runde – nicht schon das bloße Öffnen und
   nicht „per Check freigeschaltet“ (das Bauteil war ja noch nicht zu sehen). */
function migrateIntro(st){
  st.intro=(st.intro&&typeof st.intro==='object'&&!Array.isArray(st.intro))?st.intro:{};
  const prog=st.progress||{},pas=st.passed||{},rounds=st.rounds||{};
  const worked=(id)=>[1,2].some(l=>{
    const k=keyOf(id,l),p=prog[k],r=rounds[k];
    return !!(p&&['done','first','later','shown','skipped'].some(f=>p[f]>0))||!!pas[k]||!!(r&&Array.isArray(r.results)&&r.results.length>0);
  });
  PATH.forEach(m=>{
    let seen;
    if(m.id==='LAB')seen=!!(st.lab&&(st.lab.done||(st.lab.did&&(st.lab.did.x||st.lab.did.d))));
    else seen=worked(m.id)||(m.id==='QA'&&!!st.final)||(m.id==='ZA'&&!!(st.mq&&st.mq.zahlenstrahl&&st.mq.zahlenstrahl.final));
    if(seen)st.intro[m.id]=true;
  });
  /* Eingangstests sind keine Stationen des Pfads: ihre Erklärung gilt als gesehen, wenn der Test gemacht wurde */
  if(st.placed||st.final)st.intro.Q00=true;
  const zq=st.mq&&st.mq.zahlenstrahl;if(zq&&(zq.placed||zq.final))st.intro.ZQ=true;
}

/* ---------- Bausteine der Erklärkarten ---------- */
/* Text mit **fett** und {n|d} (Bruch) → Textstücke und Elemente (nur eigene Texte, kein HTML) */
function introRich(s){
  const out=[];
  s.split('**').forEach((seg,i)=>{
    const kids=[];
    seg.split(/(\{\d+\|\d+\})/).forEach(t=>{
      const m=/^\{(\d+)\|(\d+)\}$/.exec(t);
      if(m)kids.push(frac(+m[1],+m[2]));else if(t)kids.push(t);
    });
    if(i%2)out.push(el('strong',null,...kids));else out.push(...kids);
  });
  return out;
}
const INTRO_OPS=['=','→','·',':','+','<','>'];
function introCalcLine(tokens){
  const parts=tokens.map(t=>{
    if(t&&t.m)return mixed(t.m[0],t.m[1],t.m[2]);
    if(Array.isArray(t)){
      const [n,d,how,k]=t;
      return how==='x'?frac(n+' · '+k,d+' · '+k):how==='d'?frac(n+' : '+k,d+' : '+k):frac(n,d);
    }
    if(typeof t==='number')return el('span',{class:'icn'},String(t));
    return INTRO_OPS.includes(t)?t:el('span',{class:'ict'},t);
  });
  const e=eq(...parts);
  if(tokens.filter(Array.isArray).length>3)e.classList.add('small');
  return e;
}
function introCalcNode(lines){
  return el('div',{class:'introcalc'},lines.map(l=>l.wrong
    ?el('div',{class:'wrongclaim',role:'group','aria-label':'Falsche Rechnung'},introCalcLine(l.t))
    :introCalcLine(l)));
}
/* Bildzeilen: Streifen untereinander (Beschriftung links, alle gleich lang) oder Kreise nebeneinander */
function introFigNode(spec){
  const f=Array.isArray(spec)?{mode:'strip',rows:spec}:spec,circ=f.mode==='circle';
  const box=el('div',{class:'introfigs'+(circ?' circ':'')});
  f.rows.forEach(r=>{
    const rest=r.rest?Array.from({length:r.d-r.n},(_,i)=>r.n+i):null;
    const svg=drawMode(f.mode,r.n,r.d,{maxW:circ?130:460,fill:r.fill,rest,half:r.half,label:r.n+' von '+r.d+' Teilen gefärbt'});
    box.append(el('div',{class:'fig'+(r.acc?' '+r.acc:'')},...(circ?[svg,frac(r.n,r.d)]:[frac(r.n,r.d),svg])));
  });
  return box;
}
/* Ausprobieren wie im Bruchlabor (Ausgang und Jetzt), aber mit einer Rechenart und wenigen Zahlen.
   Geht eine Zahl nicht, sagt ein kurzer Satz, warum. Nichts davon wird gespeichert. */
function introWhy(cur,op,k){
  if(op==='x')return 'Mehr als '+LAB_MAX+' Teile passen nicht ins Bild. Tippe auf Nochmal.';
  const bad=cur[0]%k?cur[0]:cur[1];
  return 'Mit '+k+' geht das nicht: '+bad+' ist nicht durch '+k+' teilbar.';
}
function introTry(spec){
  const {base,op,ks}=spec,name=op==='x'?'Erweitern':'Kürzen',sym=op==='x'?' · ':' : ';
  const L={mode:'strip',base:base.slice(),cur:base.slice(),last:null};
  const stage=el('div',{class:'introstage'}),say=el('div',{class:'introsay','aria-live':'polite'});
  const chips=el('div',{class:'introchips',role:'group','aria-label':name,style:'--n:'+ks.length});
  const reset=el('button',{type:'button',class:'btn small introreset'},icon('undo'),'Nochmal');
  const btns=ks.map(k=>{
    const b=el('button',{type:'button',class:'chip'+(op==='x'?' erw':'')},(op==='x'?'× ':'÷ ')+k);
    b.addEventListener('click',()=>act(k));
    chips.append(b);
    return b;
  });
  const draw=()=>{
    stage.replaceChildren(labFigure(L));
    ks.forEach((k,j)=>{
      const ok=labCan(L.cur,op,k);
      btns[j].classList.toggle('off',!ok);
      btns[j].setAttribute('aria-disabled',String(!ok));
      btns[j].setAttribute('aria-label',name+' mit '+k+(ok?'':' – geht nicht'));
    });
    reset.disabled=!L.last;
  };
  function act(k){
    if(!labCan(L.cur,op,k)){say.replaceChildren(el('div',{class:'labtext no'},introWhy(L.cur,op,k)));return;}
    const from=L.cur.slice();
    L.cur=labStep(from,op,k);L.last={op,k};
    const e=eq(frac(from[0],from[1]),'=',frac(from[0]+sym+k,from[1]+sym+k),'=',frac(L.cur[0],L.cur[1]));
    e.classList.add('small');
    const stuck=ks.every(j=>!labCan(L.cur,op,j));
    say.replaceChildren(el('div',{class:'labtext'},e,
      el('p',null,'Der gefärbte Anteil bleibt gleich.'+(stuck?(op==='d'?' Weiter kürzen geht nicht mehr.':' Mehr passt nicht ins Bild.')+' Tippe auf Nochmal.':''))));
    draw();
  }
  reset.addEventListener('click',()=>{L.cur=base.slice();L.last=null;say.replaceChildren();draw();});
  draw();
  /* Zahlen direkt unter dem Auftrag (bleiben beim Antippen an derselben Stelle), darunter Bild, Rechnung und „Nochmal“ */
  return el('div',{class:'introtry'},chips,stage,say,reset);
}

/* Zahlenstrahl in einer Erklärung: ein Strahl oder mehrere untereinander */
function introLineNode(spec){
  const box=el('div',{class:'introfigs nlintro'});
  (Array.isArray(spec)?spec:[spec]).forEach(s=>{
    const from=s.from||0,to=s.to||1,o={from,to,parts:s.parts,marks:s.marks,labels:s.labels,strip:s.strip,maxW:460,label:'Zahlenstrahl von '+from+' bis '+to};
    if(s.secs)o.secs={on:new Set(Array.from({length:(to-from)*s.parts},(_,i)=>i))};
    box.append(drawNumberLine(o));
  });
  return box;
}
/* Einteilung ausprobieren: Zahl antippen, der Strahl wird neu eingeteilt. Ohne mark zählt der Satz Abschnitte und Striche,
   mit mark bleibt ein Punkt am selben Wert: er liegt auf einem Strich, wenn der Nenner in die Einteilung aufgeht. Nichts wird gespeichert. */
function introLineTry(spec){
  const {to,ks,mark}=spec;
  let cur=ks[0];
  const stage=el('div',{class:'introstage'}),say=el('div',{class:'introsay','aria-live':'polite'});
  const chips=el('div',{class:'introchips',role:'group','aria-label':'Teile je Ganzem',style:'--n:'+ks.length});
  const btns=ks.map(k=>{
    const b=el('button',{type:'button',class:'chip','aria-label':k+' Teile je Ganzem'},String(k));
    b.addEventListener('click',()=>{cur=k;draw();});
    chips.append(b);return b;
  });
  function draw(){
    const fits=mark&&fitsDivision(mark.d,cur),o={from:0,to,parts:cur,labels:'wholes',maxW:460};
    if(mark)o.marks=[{n:mark.n,d:mark.d,text:fits?mark.n*cur/mark.d+'/'+cur:mark.n+'/'+mark.d}];
    else o.secs={on:new Set(Array.from({length:to*cur},(_,i)=>i))};
    stage.replaceChildren(drawNumberLine(o));
    btns.forEach((b,j)=>b.setAttribute('aria-pressed',String(ks[j]===cur)));
    say.replaceChildren(el('div',{class:'labtext'},...(!mark?[cur+' Abschnitte, '+(cur+1)+' Striche.']
      :fits?[eq(frac(mark.n,mark.d),'=',frac(mark.n*cur/mark.d,cur)),el('p',null,'Der Punkt liegt genau auf einem Strich.')]
      :[el('p',null,'Der Punkt liegt zwischen zwei Strichen. Diese Einteilung passt nicht.')])));
  }
  draw();
  return el('div',{class:'introtry'},el('div',{class:'nlcap'},'Teile je Ganzem'),chips,stage,say);
}

/* ---------- Probeaufgabe auf der ersten Karte ---------- */
/* Eine kleine Aufgabe (Leicht) der Station selbst: zählt nicht für Sterne, Punkte und Serie (cb.probe). Danach kommt die Erklärung.
   Die Probe hat dasselbe Bedienpult wie eine Übung (Zahlentasten oder Meldung, darunter Tipp | Kenne ich schon | Prüfen/Weiter). */
const introHasProbe=(id)=>!!(TASKS[id]&&!TASKS[id].quick&&!finalModOf(id)&&id!=='LAB');
const PROBE_STEP={h:'Probiere es aus',say:[],probe:true}; /* der Hinweis „Fehler sind erlaubt“ steht in der Schrittzeile */
function buildProbe(id){
  const st=newState(generateTask(id,1)),host=el('div',{class:'probetask'}),msg=el('div',{class:'dockmsg'});
  const P={st,host,msg,upd:null};
  const pad=makeKeypad(host,()=>P.check());
  P.pad=pad;P.dp=dockPanel(msg,pad,host);
  const cb={probe:true,save(){},msgHost:msg,
    onMsg:(what)=>P.dp.showMsg(what),
    changed:()=>{pad.refresh();P.dp.reserve(true);fitPage();},
    done(){P.api=mountTask(host,st,cb);if(P.upd)P.upd();}};
  P.api=mountTask(host,st,cb);
  P.check=()=>{if(st.status==='open'){P.api.check();if(P.upd)P.upd();}};
  P.hint=()=>{P.api.hint();if(P.upd)P.upd();};
  host.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();P.check();}});
  return P;
}

/* ---------- Ansicht: Erklärung ---------- */
function renderIntro(id){
  const I=INTRO[id],steps=introHasProbe(id)?[PROBE_STEP].concat(I.steps):I.steps,total=steps.length,again=!!(S.view&&S.view.intro);
  const known=!again&&!stationPassed(id)&&checkMark(id)==='sitzt'; /* im Eingangstest schon gezeigt: „Kenne ich schon“ ist der Hauptknopf */
  let P=null; /* die Probeaufgabe bleibt beim Blättern erhalten */
  let i=0;
  const root=el('div',{class:'page'});root.append(topbar('')); /* der Titel steht im Schriftfeld der Karte */
  const shell=el('div',{class:'shell'}),main=el('main',{class:'work introwork'});
  main.dataset.acc=ACC[id]||PATH_ACC[id]||'';
  shell.append(main);root.append(shell);app.append(root);
  root.introApi={next:()=>goNext()}; /* für den Layout-Test: Karten der Reihe nach durchblättern */
  const card=el('div',{class:'card'});
  /* Knöpfe an festen Plätzen: links Hilfe (Zurück bzw. Tipp), Mitte „Kenne ich schon“, rechts der eine gelbe Hauptknopf */
  const backB=el('button',{type:'button',class:'btn introback','aria-label':'Zurück zum vorigen Schritt'},icon('zurueck'));
  const skipB=el('button',{type:'button',class:'btn introskip'+(known?' primary':'')},again?'Schließen':'Kenne ich schon');
  const nextB=el('button',{type:'button',class:'btn intronext'+(known?'':' primary')});
  const hintB=el('button',{type:'button',class:'btn'});
  const checkB=el('button',{type:'button',class:'btn introcheck'+(known?'':' primary')},'Prüfen');
  const row=el('div',{class:'primaryrow introrow'}),bar=el('div',{class:'actionbar'},row);
  main.append(card,bar);
  /* „Los geht’s“ und „Kenne ich schon“: Erklärung gilt als gesehen, es geht zur eigentlichen Ansicht.
     Ausdrücklich geöffnet (Merkkasten): das Kennzeichen view.intro verschwindet, der Verlaufseintrag wird ersetzt. */
  const finish=()=>{
    S.intro=S.intro||{};S.intro[id]=true;
    if(S.view&&S.view.intro){
      const w=Object.assign({},S.view);delete w.intro;S.view=w;
      try{history.replaceState({v:w},'');}catch(e){}
    }
    persist();renderAll();window.scrollTo(0,0);
  };
  const goNext=()=>{if(i<total-1){i++;draw(true);}else finish();};
  /* Probe: Knöpfe und Bedienpult nach dem Zustand der Aufgabe einstellen */
  const updProbe=()=>{
    const st=P.st,open=st.status==='open',all=P.api.hintCount();
    checkB.textContent=open?'Prüfen':'Weiter';checkB.classList.toggle('ready',!open);
    hintB.disabled=!open||st.hint>=all;
    setHintLabel(hintB,st.hint>=all?'Alle Tipps':(st.hint?`Tipp ${st.hint+1}`:'Tipp'));
    P.pad.refresh();P.dp.reserve(true);fitPage();
  };
  const drawBar=()=>{
    const s=steps[i];
    if(s.probe){
      P=P||buildProbe(id);P.upd=updProbe;
      row.className='primaryrow introrow probe';row.replaceChildren(hintB,skipB,checkB);
      bar.replaceChildren(P.dp.el,row);
    }else{
      row.className='primaryrow introrow';row.replaceChildren(backB,skipB,nextB);
      bar.replaceChildren(row);
    }
  };
  const draw=(move)=>{
    const s=steps[i],last=i===total-1;
    drawBar();
    const ruler=el('div',{class:'ruler introruler','aria-hidden':'true'});
    for(let k=0;k<total;k++)ruler.append(el('i',{class:'tk'+(k<i?' f':k===i?' cur':'')}));
    const h=el('h2',{class:'introh',tabindex:'-1'},s.h);
    card.replaceChildren(...[ruler,
      el('p',{class:'introstep'},'Schritt '+(i+1)+' von '+total+(s.probe?' · Fehler sind erlaubt':'')),
      known?el('p',{class:'introknown'},icon('haken'),'Das konntest du schon im Eingangstest.'):null,
      h,
      el('div',{class:'introtxt'},s.say.map(t=>el('p',null,introRich(t)))),
      s.lab?el('div',{class:'introstage'},labFigure({mode:'strip',base:s.lab.base.slice(),cur:s.lab.cur.slice(),last:{op:s.lab.op,k:s.lab.k}})):null,
      s.fig?introFigNode(s.fig):null,
      s.nline?introLineNode(s.nline):null,
      s.nltry?introLineTry(s.nltry):null,
      s.calc?introCalcNode(s.calc):null,
      s.tryit?introTry(s.tryit):null,
      s.probe?el('div',{class:'introprobe'},P.host):null,
      el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('gluehbirne'),el('span',{class:'tb-name'},I.title)),el('span',{class:'tb-c'},'Erklärung'))].filter(Boolean));
    backB.disabled=i===0;
    nextB.replaceChildren(...(last?[again?'Zur Übung':'Los geht’s',icon('play')]:['Weiter',icon('weiter')]));
    skipB.onclick=finish;
    if(s.probe)updProbe();else fitPage();
    if(move){window.scrollTo(0,0);h.focus({preventScroll:true});}
  };
  backB.addEventListener('click',()=>{if(i>0){i--;draw(true);}});
  nextB.addEventListener('click',goNext);
  hintB.addEventListener('click',()=>{if(P)P.hint();});
  checkB.addEventListener('click',()=>{if(!P)return;if(P.st.status==='open')P.check();else goNext();});
  draw(false);
}
/* Knopf „Erklärung“ im Merkkasten: dieselbe Ansicht noch einmal, mit Erklärung davor */
function openIntro(){go(Object.assign({},S.view,{intro:true}));}

