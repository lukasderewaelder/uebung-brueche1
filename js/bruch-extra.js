'use strict';
/* =====================================================================
   Etappe „Bruch mal Bruch, Bruch durch Bruch“: Merkzettel M29–M31 und Tipps (drei Stufen je Aufgabe)
   Tipps: 1 eine Frage zur Aufgabe (nie das Ergebnis) · 2 der erste Schritt · 3 eine Teillösung. {n|d} ist ein Bruch. Sätze höchstens 14 Wörter.
   ===================================================================== */
NOTES.M29={title:'Bruch mal Bruch',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(frac(2,3),'·',frac(3,4),'=',frac('2 · 3','3 · 4'),'=',frac(6,12),'=',frac(1,2))),
    kbFoldFull(3,4,2,3),
    el('p',null,strong('Von heißt mal: '),'2/3 von 3/4 ist 2/3 · 3/4.'),
    el('p',null,'Rechne Zähler mal Zähler und Nenner mal Nenner.'),
    el('p',null,'Kürze vor dem Ausrechnen. Dann bleiben die Zahlen klein.'),
    el('p',null,'Eine natürliche Zahl schreibst du als Bruch: 7 = 7/1.'),
    el('p',{class:'rule'},strong('Achtung: '),'Bei Mal brauchst du keinen gemeinsamen Nenner.')
  ];}};
NOTES.M30={title:'Bruch durch Bruch',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(frac(2,3),':',frac(3,4),'=',frac(2,3),'·',frac(4,3),'=',frac(8,9))),
    kbMeasureFig([2,1],[3,4],99),
    el('p',null,strong('Wie oft passt das Messstück hinein? '),'Das ist Durch.'),
    el('p',null,'Den ',strong('Kehrwert'),' bildest du so: Tausche Zähler und Nenner.'),
    el('p',null,'Durch einen Bruch teilen heißt: mal den Kehrwert.'),
    el('p',null,'Die erste Zahl bleibt, wie sie ist.'),
    el('p',{class:'rule'},strong('Achtung: '),'Durch einen Bruch kleiner als 1 macht das Ergebnis größer.')
  ];}};
NOTES.M31={title:'Gemischte Zahlen mal und durch',build(){
  return [
    el('div',{class:'ex'},strong('Beispiel: '),eq(mixed(2,1,2),'·',mixed(1,1,3),'=',frac(5,2),'·',frac(4,3),'=',frac(20,6),'=',mixed(3,1,3))),
    el('p',null,strong('1. Überschlagen: '),'etwa 3 · 1 = 3.'),
    el('p',null,strong('2. Umwandeln: '),'Schreibe jede gemischte Zahl als Bruch.'),
    el('p',null,strong('3. Rechnen: '),'Mal wie bei Brüchen. Bei durch mit dem Kehrwert.'),
    kbArea(kbZ(1,2,1),kbZ(1,2,1)),
    el('p',{class:'rule'},strong('Achtung: '),'Getrennt rechnen geht nur bei Plus. 1 1/2 · 1 1/2 ist 2 1/4, nicht 1 1/4.')
  ];}};

/* ---------- Tipps ---------- */
const kbTf=(z)=>z.b===1?String(z.a):z.w?z.w+' '+tf(z.a,z.b):tf(z.a,z.b);
const kbTfF=(f)=>{const [x,y]=simplify(f[0],f[1]);return y===1?String(x):tf(x,y);};
/* Rechentipps für Mal und Durch (gemischte Zahlen zuerst umwandeln) */
function kbTipCalc(t){
  const X=kbV(t.x),Y=kbV(t.y),conv=kbIsMix(t.x)||kbIsMix(t.y)?'Wandle zuerst um: '+[t.x,t.y].filter(kbIsMix).map(z=>kbTf(z)+' = '+tf(kbV(z)[0],kbV(z)[1])).join(', ')+'. ':'';
  if(t.op==='mul')return [['Ist das eine Mal-Aufgabe oder eine Durch-Aufgabe?'],[conv+'Rechne Zähler mal Zähler: '+X[0]+' · '+Y[0]+'.'],[conv+'Unten steht Nenner mal Nenner: '+X[1]+' · '+Y[1]+'. Kürze danach.']];
  return [['Welche Zahl steht hinter dem Geteiltzeichen?'],[conv+'Der Kehrwert von '+tf(Y[0],Y[1])+' ist '+tf(Y[1],Y[0])+'.'],[conv+'Rechne '+tf(X[0],X[1])+' · '+tf(Y[1],Y[0])+'. Zähler mal Zähler, Nenner mal Nenner.']];
}
TIPS.K01=(t)=>{
  const vonT=kbTf(t.x)+' von '+kbTf(t.y);
  if(t.kind==='woher')return [['Wie viele Felder hat das Rechteck? Wie viele sind doppelt gefärbt?'],['Die Spalten kommen vom Nenner '+t.y.b+', die Zeilen vom Nenner '+t.x.b+'.'],['Felder im Rechteck: '+t.x.b+' · '+t.y.b+'. Doppelt gefärbt: '+t.x.a+' · '+t.y.a+'.']];
  if(t.kind==='zuordnen')return [['Was bedeutet „von“ bei Anteilen?'],['Von heißt mal.'],['Gesucht ist '+vonT+'. Das ist eine Mal-Aufgabe.']];
  if(t.kind==='kleiner')return [['Ist '+kbTf(t.x)+' kleiner als 1?'],['Ein Anteil von etwas ist weniger als das Ganze.'],['Mal einen Bruch kleiner als 1 macht das Ergebnis kleiner.']];
  if(t.kind==='pizza')return [['Von welcher Menge nimmst du einen Anteil?'],['Teile '+kbTf(t.y)+' Pizza in '+t.x.b+' gleiche Teile. Nimm '+t.x.a+' davon.'],['Von heißt mal: '+kbTf(t.x)+' · '+kbTf(t.y)+'.']];
  if(t.kind==='falten')return [['Färbe zuerst den ersten Anteil: '+kbTf(t.y)+'.'],['Teile nur den gefärbten Teil noch einmal. Teile quer in '+kbDenName(t.x.b)+'.'],['Zähle die doppelt gefärbten Felder und alle Felder im Rechteck.']];
  return [['Wie viele Felder hat das ganze Rechteck?'],['Das Rechteck hat '+t.x.b*t.y.b+' Felder. Zähle die doppelt gefärbten.'],['Doppelt gefärbt sind '+t.x.a*t.y.a+' Felder. Kürze, wenn es geht.']];
};
TIPS.K02=(t)=>{
  const I=kbMeasureInfo(kbV(t.x),kbV(t.y));
  if(t.kind==='groesser')return [['Ist das Messstück '+kbTf(t.y)+' kleiner als 1?'],['Ein Messstück kleiner als 1 passt öfter als einmal in 1.'],['Kleiner als 1: Es kommt mehr heraus. Größer als 1: weniger.']];
  if(t.kind==='strahl')return [['Wie lang ist ein Sprung?'],['Ein Sprung ist '+t.y.a+(t.y.a===1?' Abschnitt':' Abschnitte')+' lang. Der Strahl hat '+t.x.a*t.y.b+' Abschnitte.'],['Zähle, wie oft '+t.y.a+' Abschnitte in '+t.x.a*t.y.b+' Abschnitte passen.']];
  return [['In wie viele gleiche Teile ist ein Ganzes geteilt?'],['Ein Ganzes hat '+I.L+' Teile. Ein Messstück braucht '+I.vu+' Teile.'],[I.rest?'Das Messstück passt '+I.full+'-mal ganz. Wie viel vom Messstück bleibt übrig?':'Zähle, wie oft '+I.vu+' Teile in '+I.du+' Teile passen.']];
};
TIPS.K03=(t)=>{
  if(t.kind==='kleiner')return [['Ist '+kbTf(t.x)+' kleiner oder größer als 1?'],['Mal einen Bruch kleiner als 1 macht kleiner.'],['Mal einen Bruch größer als 1 macht größer.']];
  if(t.kind==='luecke'){const r=kbRes(t);return [['Welche Zahl mal '+t.x.a+' ergibt oben den Zähler?'],['Rechne rückwärts: Zähler durch Zähler, Nenner durch Nenner.'],['Probe: '+kbTf(t.x)+' mal deinen Bruch muss '+kbTfF(r)+' ergeben.']];}
  if(t.kind==='quadrat')return [['Was heißt das Quadrat einer Zahl?'],['Das Quadrat ist die Zahl mal sich selbst.'],['Rechne '+kbTf(t.x)+' · '+kbTf(t.x)+'.']];
  if(t.kind==='vorher'){const X=kbV(t.x),Y=kbV(t.y),g1=gcd(X[0],Y[1]),g2=gcd(Y[0],X[1]);return [['Kannst du über Kreuz kürzen: Zähler oben, Nenner unten?'],[g1>1?'Kürze '+X[0]+' und '+Y[1]+' durch '+g1+'.':'Kürze '+Y[0]+' und '+X[1]+' durch '+g2+'.'],['Rechne danach Zähler mal Zähler und Nenner mal Nenner.']];}
  if(t.kind==='natuerlich'){const n=t.x.b===1?t.x:t.y;return [['Wie schreibst du '+n.a+' als Bruch?'],[n.a+' = '+tf(n.a,1)+'. Dann gilt die Regel auch hier.'],kbTipCalc(t)[2]];}
  return kbTipCalc(t);
};
TIPS.K04=(t)=>{
  const Y=kbV(t.y);
  if(t.kind==='kehrwert')return [['Was tauschst du beim Kehrwert?'],['Tausche Zähler und Nenner.'],[t.y.b===1?t.y.a+' ist '+tf(t.y.a,1)+'. Tausche jetzt.':'Oben steht dann '+Y[1]+'.']];
  if(t.kind==='groesser')return [['Ist die zweite Zahl kleiner als 1?'],['Ein Messstück kleiner als 1 passt öfter hinein.'],['Kleiner als 1: Es wird mehr. Größer als 1: weniger.']];
  if(t.kind==='kopf')return [['Wie oft passt '+kbTf(t.y)+' in 1?'],['In 1 passt '+kbTf(t.y)+' genau '+tf(Y[1],Y[0])+'-mal.'],['Rechne '+t.x.a+' · '+tf(Y[1],Y[0])+'.']];
  return kbTipCalc(t);
};
TIPS.K05=(t)=>{
  if(t.kind==='kehrwertGem'){const Z=kbV(t.y);return [['Was machst du zuerst mit der gemischten Zahl?'],['Wandle um: '+kbTf(t.y)+' = '+tf(Z[0],Z[1])+'.'],['Tausche jetzt Zähler und Nenner.']];}
  if(t.kind==='schaetzen'){const X=kbV(t.x);return [['Runde die gemischte Zahl auf eine ganze Zahl.'],[kbTf(t.x)+' ist etwa '+Math.round(X[0]/X[1])+'.'],['Wie oft passt '+kbTf(t.y)+' in '+Math.round(X[0]/X[1])+'?']];}
  if(t.kind==='streifen')return TIPS.K02(Object.assign({},t,{kind:'stamm'}));
  if(t.kind==='flaeche')return [['Wie viele Felder hat das Quadrat für 1 Ganzes?'],['Das Quadrat hat '+t.x.b*t.y.b+' Felder. Jedes Feld ist '+tf(1,t.x.b*t.y.b)+'.'],['Zähle alle Felder im Rechteck.']];
  return kbTipCalc(t);
};
TIPS.K06=(t)=>{
  if(t.kind==='restDeuten'){const I=kbMeasureInfo(kbV(t.x),kbV(t.y));return [['Wie oft passt eine Schleife ganz hinein?'],['Es werden '+I.full+' Schleifen fertig.'],['Rest: '+t.x.a+' m minus '+I.full+' · '+kbTf(t.y)+' m.']];}
  const ask=t.op==='mul'?'Ist ein Anteil von etwas gesucht? Dann heißt es mal.':'Wie oft passt etwas hinein? Oder ist das Ganze gesucht? Dann durch.';
  return [['Was ist hier das Ganze?'],[ask],kbTipCalc(t)[2]];
};
TIPS.K07=(t)=>{
  if(t.kind==='durchNull')return [['Welche Zahl mal 0 ergibt '+kbTf(t.x)+'?'],['Jede Zahl mal 0 ergibt 0.'],['Durch 0 kannst du nicht teilen.']];
  if(t.kind==='nullDurch')return [['Wie viel hast du, wenn du nichts teilst?'],['0 geteilt durch eine Zahl ist 0.'],['Das Ergebnis ist 0.']];
  if(t.kind==='selbst')return [['Wie oft passt eine Zahl in sich selbst?'],['Genau einmal.'],['Das Ergebnis ist 1.']];
  return [['Was ergibt ein Bruch mal seinen Kehrwert?'],['Ein Bruch mal sein Kehrwert ergibt 1.'],['Der Kehrwert von '+kbTf(t.kind==='einsDurch'?t.y:t.x)+': Tausche Zähler und Nenner.']];
};
TIPS.K08=(t)=>{
  if(t.kind==='ordnen')return [['Welche Karten sind gleich viel?'],['Mal '+tf(1,t.k)+' ist dasselbe wie durch '+t.k+'.'],['Durch '+tf(1,t.k)+' heißt: Wie oft passt '+tf(1,t.k)+' hinein? Das ist viel.']];
  if(t.kind==='vergleich'||t.kind==='warum')return [['Denk an das Messen mit dem Messstück.'],['Ein kleines Messstück passt öfter hinein.'],['Je kleiner das Messstück, desto größer das Ergebnis.']];
  return [['Rechne einmal vorher und einmal nachher.'],['Bei durch rechnest du mit dem Kehrwert der zweiten Zahl.'],['Vergleiche die beiden Ergebnisse.']];
};
TIPS.K09=(t)=>{
  if(t.kind==='welche')return [['Rechne jede Rechnung kurz nach.'],['Prüfe bei durch: Wurde nur die zweite Zahl umgedreht?'],['Prüfe bei mal: Zähler mal Zähler, Nenner mal Nenner?']];
  return [['Vergleiche die Rechnung Schritt für Schritt mit der Regel.'],[t.op==='mul'?'Bei mal: Zähler mal Zähler, Nenner mal Nenner.':'Bei durch: mal den Kehrwert der zweiten Zahl.'],kbTipCalc(t)[2]];
};
TIPS.K10=(t)=>{
  if(t.kind==='gedacht'||t.kind==='pfeil')return [['Wie kommst du rückwärts zur Startzahl?'],['Die Umkehrung von '+(t.op==='mul'?'mal':'durch')+' '+kbTf(t.y)+' ist '+(t.op==='mul'?'durch':'mal')+' '+kbTf(t.y)+'.'],['Rechne '+t.out+(t.op==='mul'?' : ':' · ')+kbTf(t.y)+'.']];
  if(t.kind==='reihe')return [['Was passiert, wenn du durch '+tf(1,2)+' teilst?'],['Durch '+tf(1,2)+' teilen verdoppelt das Ergebnis.'],['Verdopple '+kbTf(t.x)+' so lange, bis es größer als '+t.T+' ist.']];
  return [['Was heißt das Quadrat?'],['Wandle zuerst um: '+kbTf(t.x)+' = '+tf(kbV(t.x)[0],kbV(t.x)[1])+'.'],['Rechne den Bruch mal sich selbst.']];
};
['K01','K02','K03','K04','K05','K06','K07','K08','K09','K10'].forEach(id=>{TASKS[id].hints=function(t){return TIPS[id](t);};});
