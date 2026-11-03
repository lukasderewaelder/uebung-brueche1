'use strict';
/* =====================================================================
   5 Merkkästen M1–M6 und Hilfetexte
   ===================================================================== */

function figStrip(n,d){return el('div',{class:'fig'},frac(n,d),drawFractionStrip(n,d,{maxW:300}));}

const NOTE_EX={
  M1:[{p:2,q:3,ks:[1,2,4]},{p:1,q:2,ks:[1,2,4]},{p:3,q:4,ks:[1,2,3]},{p:3,q:5,ks:[1,2,3]},{p:1,q:3,ks:[1,2,3]}],
  M2:[{a:3,b:5,k:2},{a:1,b:4,k:3},{a:5,b:6,k:2},{a:4,b:9,k:2},{a:2,b:7,k:3}],
  M3:[{a:12,b:18,k:3},{a:15,b:20,k:5},{a:16,b:24,k:8},{a:18,b:30,k:6},{a:14,b:21,k:7}],
  M4:['7/10','35/100','7/1000','125/100','3/10','9/100','43/1000','205/100'],
  M5:['0,6','0,04','1,25','0,9','0,07','2,5','0,125','3,05'],
  M6:[[2,3,4],[3,1,2],[1,2,5],[4,3,7]],
  M11:{nenner:[[3,8,5,8],[2,7,5,7],[4,9,7,9],[3,10,9,10]],zaehler:[[1,5,1,8],[3,4,3,7],[2,5,2,9],[1,3,1,6]]}, /* Paare a/b, c/d */
  M12:[[8,9,11,12],[5,6,9,10],[7,8,11,12],[4,5,7,8]] /* je Bruch fehlt ein Stück: a/b < c/d */
};
const pickEx=(list,keyFn,avoid)=>list.find(x=>!avoid.includes(keyFn(x)))||list[list.length-1];

const NOTES={
  M1:{title:'Brüche mit gleichem Wert',build(avoid){
    const e=pickEx(NOTE_EX.M1,x=>x.p+'/'+x.q,avoid);
    const terms=e.ks.map(k=>[e.p*k,e.q*k]);
    const chain=[];terms.forEach((t,i)=>{if(i)chain.push('=');chain.push(frac(t[0],t[1]));});
    return [
      el('div',{class:'ex'},strong('Beispiel: '),eq(...chain)),
      el('div',{class:'figrow'},terms.map(t=>figStrip(t[0],t[1]))),
      el('p',null,'Die Bilder sind verschieden eingeteilt. Gefärbt ist aber immer gleich viel. Die Brüche haben ',strong('denselben Wert'),'.'),
      el('p',null,strong('Merke: '),'Nur der gefärbte Anteil zählt. Die Zahl der Teile ist egal. Die Lage der Teile auch.')
    ];}},
  M2:{title:'Erweitern',build(avoid){
    const e=pickEx(NOTE_EX.M2,x=>redKey(x.a,x.b),avoid);
    return [
      el('div',{class:'ex'},strong('Beispiel: '),eq(frac(e.a,e.b),'=',frac(e.a+' · '+e.k,e.b+' · '+e.k),'=',frac(e.a*e.k,e.b*e.k))),
      el('div',{class:'figrow'},figStrip(e.a,e.b),figStrip(e.a*e.k,e.b*e.k)),
      el('p',null,strong('Erweitern'),' heißt: Zähler und Nenner mit derselben Zahl malnehmen. Der Wert bleibt gleich. Das Bild wird nur feiner geteilt.'),
      el('p',null,'Die Zahl zum Malnehmen heißt ',strong('Erweiterungszahl'),'. Sie ist mindestens 2.')
    ];}},
  M3:{title:'Kürzen',build(avoid){
    const e=pickEx(NOTE_EX.M3,x=>redKey(x.a,x.b),avoid);
    return [
      el('div',{class:'ex'},strong('Beispiel: '),eq(frac(e.a,e.b),'=',frac(e.a+' : '+e.k,e.b+' : '+e.k),'=',frac(e.a/e.k,e.b/e.k))),
      el('p',null,strong('Kürzen'),' heißt: Zähler und Nenner durch dieselbe Zahl teilen. Der Wert bleibt gleich. Das Bild wird gröber geteilt.'),
      el('p',null,'Die Zahl zum Teilen heißt ',strong('Kürzungszahl'),'. Sie ist mindestens 2.'),
      el('p',null,strong('So weit wie möglich gekürzt: '),'Keine Zahl größer als 1 teilt noch beide.'),
      el('div',{class:'rule'},strong('Schnelle Tipps: '),'Sind beide Zahlen gerade, kannst du durch 2 kürzen. ',el('br'),'Enden beide auf 0 oder 5, geht ÷5. Enden beide auf 0, geht auch ÷10.')
    ];}},
  M7:{title:'Teilbarkeitsregeln',build(avoid){
    return [
      el('p',null,strong('Beispiel: '),'374 endet auf 4. Das ist gerade, also ist 374 durch 2 teilbar.'),
      el('p',null,'Quersumme von 374: 3 + 7 + 4 = 14. 14 ist nicht durch 3 teilbar, also auch 374 nicht.'),
      el('p',null,'Die ',strong('Quersumme'),' bekommst du, wenn du alle Ziffern addierst.'),
      el('p',null,'So erkennst du schnell, ob du kürzen kannst:'),
      ...[2,3,4,5,6,9,10].map(k=>el('p',{class:'rule'},DIV_RULE[k]))];}},
  M4:{title:'Vom Dezimalbruch zur Dezimalzahl',build(avoid){
    const list=NOTE_EX.M4.filter(x=>!avoid.includes(x)).slice(0,4);
    const ex=list.map(k=>{const [n,d]=k.split('/').map(Number);return eq(frac(n,d),'=',el('span',null,decOf(n,Math.round(Math.log10(d)))));});
    return [
      el('div',{class:'ex'},strong('Beispiele:'),ex.map(x=>x)),
      el('p',null,'Ein Bruch mit dem Nenner 10, 100 oder 1000 heißt ',strong('Dezimalbruch'),'.'),
      el('p',null,'Der Nenner sagt, wie viele Stellen hinter dem Komma stehen.'),
      el('table',null,el('tr',null,el('th',null,'Nenner'),el('th',null,'Stellen hinter dem Komma'),el('th',null,'Name')),
        el('tr',null,el('td',null,'10'),el('td',null,'1'),el('td',null,'Zehntel')),
        el('tr',null,el('td',null,'100'),el('td',null,'2'),el('td',null,'Hundertstel')),
        el('tr',null,el('td',null,'1000'),el('td',null,'3'),el('td',null,'Tausendstel')))
    ];}},
  M5:{title:'Von der Dezimalzahl zum Bruch',build(avoid){
    const list=NOTE_EX.M5.filter(x=>!avoid.includes(x)).slice(0,3);
    const ex=list.map(s=>{const p=parseGermanDecimal(s);return eq(el('span',null,s),'=',frac(p.num,p.den));});
    return [
      el('div',{class:'ex'},strong('Beispiele:'),ex),
      el('p',null,'Zähle alle Stellen hinter dem Komma, auch die Nullen.'),
      el('p',null,el('b',null,'0,05'),' hat 2 Stellen, also steht 100 im Nenner: ',frac(5,100),'.'),
      el('p',null,el('b',null,'0,050'),' hat 3 Stellen, also steht 1000 im Nenner: ',frac(50,1000),'.'),
      el('p',null,'Der Zähler ist die Zahl ohne Komma. Beide Brüche haben denselben Wert.')
    ];}},
  M6:{title:'Gemischte Zahl als Bruch',build(avoid){
    const e=pickEx(NOTE_EX.M6,x=>x[0]+' '+x[1]+'/'+x[2],avoid);
    const [w,n,d]=e;
    const figs=[];
    for(let i=0;i<w;i++)figs.push(drawFractionStrip(d,d,{maxW:150,label:'Ganzes'}));
    figs.push(drawFractionStrip(n,d,{maxW:150,label:'Bruchteil'}));
    return [
      el('div',{class:'ex'},strong('Beispiel: '),eq(mixed(w,n,d),'=',frac(`${w} · ${d} + ${n}`,d),'=',frac(w*d+n,d))),
      el('div',{class:'figrow'},figs),
      el('p',null,'Eine ',strong('gemischte Zahl'),' besteht aus einer natürlichen Zahl und einem Bruch. Natürliche Zahlen sind 1, 2, 3 und so weiter.'),
      el('p',null,'So wird ein Bruch daraus: ',strong('Ganze · Nenner + Zähler'),'. Das Ergebnis ist der neue Zähler. ',strong('Der Nenner bleibt gleich.'))
    ];}},
  M8:{title:'Brüche am Zahlenstrahl',build(avoid){
    return [
      el('div',{class:'ex'},strong('Beispiel: '),frac(3,5),': ein Ganzes hat 5 Abschnitte, der Punkt liegt nach 3 Abschnitten.'),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:5,marks:[{n:3,d:5}],strip:{n:3,d:5},maxW:360,label:'Drei Fünftel am Zahlenstrahl'})),
      el('p',null,'Ein Ganzes ist die Strecke von 0 bis 1. Jedes weitere Ganze ist gleich lang.'),
      el('p',null,'Der ',strong('Nenner'),' sagt, wie viele ',strong('Abschnitte'),' ein Ganzes hat.'),
      el('p',null,'Der ',strong('Zähler'),' sagt, wie viele Abschnitte du von 0 aus zählst.'),
      el('p',null,strong('Merke: '),'Zähle Abschnitte, nicht Striche. 5 Abschnitte haben 6 Striche.')
    ];}},
  M9:{title:'Zwei Wege zum Punkt',build(avoid){
    return [
      el('div',{class:'ex'},'Beispiel: ',frac(3,5),' auf einem Strahl mit 5 oder mit 10 Abschnitten.'),
      el('p',null,'Manchmal passt die Einteilung nicht zum Nenner. Dann gibt es zwei Wege.'),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:5,marks:[{n:3,d:5}],maxW:360,label:'Drei Fünftel mit fünf Abschnitten'})),
      el('p',null,strong('Weg 1: Einteilung anpassen. '),'Teile den Strahl so, wie der Nenner sagt.'),
      el('div',{class:'ex'},eq(frac(3,5),'=',frac('3 · 2','5 · 2'),'=',frac(6,10))),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:10,marks:[{n:6,d:10}],maxW:360,label:'Sechs Zehntel mit zehn Abschnitten'})),
      el('p',null,strong('Weg 2: Bruch anpassen. '),'Erweitere oder kürze auf den Nenner der Einteilung.'),
      el('p',null,strong('Merke: '),'Feiner teilen heißt erweitern. Gröber teilen heißt kürzen.')
    ];}},
  M10:{title:'Die passende Einteilung',build(avoid){
    return [
      el('div',{class:'ex'},frac(1,3),' passt bei 3, 6, 9 und 12 Teilen, aber nicht bei 10 Teilen.'),
      el('div',{class:'ex'},frac(1,2),', ',frac(3,4),' und ',frac(5,6),' passen alle bei 12 Teilen je Ganzem.'),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:12,marks:[{n:1,d:2,text:'A'},{n:3,d:4,text:'B'},{n:5,d:6,text:'C'}],maxW:360,label:'Brüche mit zwölf Abschnitten'})),
      el('p',null,'Passt der Nenner in die Zahl der Teile, liegt der Bruch auf einem Strich.'),
      el('p',null,'Bei mehreren Brüchen suchst du eine Zahl, in die alle Nenner passen. Die kleinste solche Zahl ist am einfachsten.'),
      el('p',null,'Das Fachwort heißt kleinstes gemeinsames Vielfaches (kgV).')
    ];}},
  M11:{title:'Nenner gleich oder Zähler gleich',build(avoid){
    const free=(list)=>list.find(x=>!avoid.includes(redKey(x[0],x[1]))&&!avoid.includes(redKey(x[2],x[3])))||list[list.length-1];
    const n=free(NOTE_EX.M11.nenner),z=free(NOTE_EX.M11.zaehler);
    return [
      el('div',{class:'ex'},strong('Beispiel: '),eq(frac(n[0],n[1]),'<',frac(n[2],n[3]))),
      cmpStack([{n:n[0],d:n[1]},{n:n[2],d:n[3]}]),
      el('p',null,strong('Nenner gleich: '),'Alle Stücke sind gleich groß. Wer mehr Stücke hat, ist größer.'),
      el('div',{class:'ex'},eq(frac(z[0],z[1]),'>',frac(z[2],z[3]))),
      cmpStack([{n:z[0],d:z[1]},{n:z[2],d:z[3]}]),
      el('p',null,strong('Zähler gleich: '),'Es sind gleich viele Stücke. Ein größerer Nenner macht kleinere Stücke.'),
      el('p',null,strong('Merke: '),'Gleicher Nenner oder Zähler heißt nicht gleich groß. Vergleiche Zahl und Größe der Stücke.')
    ];}},
  M12:{title:'Gleich viele Teile fehlen zum Ganzen',build(avoid){
    const e=NOTE_EX.M12.find(x=>!avoid.includes(redKey(x[0],x[1]))&&!avoid.includes(redKey(x[2],x[3])))||NOTE_EX.M12[0];
    return [
      el('div',{class:'ex'},strong('Beispiel: '),eq(frac(e[0],e[1]),'<',frac(e[2],e[3]))),
      cmpStack([{n:e[0],d:e[1],rest:true},{n:e[2],d:e[3],rest:true}]),
      el('p',null,'Bei beiden fehlt ein Stück zum Ganzen. Das Gestrichelte ist der Rest.'),
      el('p',null,strong('Regel: '),'Fehlen gleich viele Stücke, gehört das kleinere fehlende Stück zum größeren Bruch.'),
      el('p',null,'Das gilt nur bei gleich vielen fehlenden Stücken. Zähle immer zuerst.'),
      el('p',null,strong('Merke: '),'Gleich viel fehlt heißt nicht gleich groß.')
    ];}}
};
/* noteFor(task): Merkkästen zur Aufgabe, ohne die Aufgabe zu lösen */
function noteFor(typeId,task){
  const avoid=(task&&task.avoid)||[],T=TASKS[typeId],ids=T.notesFor?T.notesFor(task):T.notes;
  const out=ids.map(id=>{
    const n=NOTES[id];
    return el('section',{class:'note','aria-label':'Merkkasten '+id},el('h3',null,id+' · '+n.title),...n.build(avoid));
  });
  if(ids.some(id=>id==='M1'||id==='M2'||id==='M3'))out.push(el('p',{class:'labnote'},labLink()));
  return out;
}

/* ---------- Hilfetexte (erster Tipp nennt nie eine Lösung) ---------- */
const HINT={
  equal:['Zähle bei jedem Bild die gefärbten Teile und alle Teile. Vergleiche die Anteile, nicht nur die Zahl der Teile.','Prüfe, ob Zähler und Nenner jeweils mit derselben Zahl verändert wurden.'],
  expand:['Beim Erweitern musst du Zähler und Nenner verändern.','Rechne die Multiplikation für Zähler und Nenner getrennt.'],
  reduce:['Suche eine Zahl, durch die sich Zähler und Nenner teilen lassen.','Prüfe nach dem Kürzen, ob du noch einmal kürzen kannst.'],
  reduceGiven:['Beim Kürzen musst du Zähler und Nenner durch dieselbe Zahl teilen.','Rechne die Division für Zähler und Nenner getrennt.'],
  gaps:['Überlege zuerst, wie sich der bekannte Zähler oder Nenner verändert hat.','Derselbe Rechenschritt gilt für Zähler und Nenner.'],
  factor:['Vergleiche Zähler mit Zähler und Nenner mit Nenner.','Die Veränderung muss oben und unten mit derselben Zahl möglich sein.'],
  error:['Prüfe, ob in beiden Zeilen dieselbe Rechnung durchgeführt wurde.','Kontrolliere den Wert vor und nach dem Rechenschritt.'],
  picture:['Zähle im Vorgabebild: Wie viele Teile sind gefärbt, wie viele gibt es? Der Anteil muss gleich groß bleiben.','Überlege, wie viele neue Teile aus einem alten Teil entstehen.'],
  family:['Du kannst neue Brüche erzeugen, indem du Zähler und Nenner gleich veränderst.','Suche unterschiedliche Erweiterungszahlen und beachte die Bedingungen.'],
  ways:['Suche verschiedene Zahlen, durch die beide Zahlen teilbar sind.','Nimm für Weg 2 andere Kürzungszahlen. Dieselben Zahlen in anderer Reihenfolge sind kein neuer Weg.'],
  d1:['Achte darauf, ob der Nenner 10, 100 oder 1000 ist.','Zähle, wie viele Stellen nach dem Komma benötigt werden.'],
  d2:['Zähle zuerst die Stellen nach dem Komma.','Der Nenner hängt von der Zahl der Nachkommastellen ab.'],
  mixed:['Die ganzen Anteile müssen in Bruchteile umgerechnet werden.','Denke an Ganze · Nenner + Zähler; der Nenner bleibt gleich.'],
  memory:['Vielleicht sehen zwei Karten anders aus, zeigen aber den gleichen Anteil.','Vergleiche den Wert der Brüche, nicht nur ihre Zahlen.'],
  vault:['Lies zuerst genau, ob du erweitern oder kürzen sollst.','Der Tresor nimmt nur einen Bruch, der sich nicht weiter kürzen lässt.']
};

