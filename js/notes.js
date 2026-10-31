'use strict';
/* =====================================================================
   5 Merkkästen M1–M6 und Hilfetexte
   ===================================================================== */
const RULE2='Beide Zahlen gerade? Dann geht ÷2 – die 2 geht IMMER!';
const RULE510='Endet beides auf 0 oder 5: ÷5. Endet beides auf 0: ÷10. Und die 2 geht IMMER, wenn beide gerade sind.';

function figStrip(n,d){return el('div',{class:'fig'},frac(n,d),drawFractionStrip(n,d,{maxW:300}));}

const NOTE_EX={
  M1:[{p:2,q:3,ks:[1,2,4]},{p:1,q:2,ks:[1,2,4]},{p:3,q:4,ks:[1,2,3]},{p:3,q:5,ks:[1,2,3]},{p:1,q:3,ks:[1,2,3]}],
  M2:[{a:3,b:5,k:2},{a:1,b:4,k:3},{a:5,b:6,k:2},{a:4,b:9,k:2},{a:2,b:7,k:3}],
  M3:[{a:12,b:18,k:3},{a:15,b:20,k:5},{a:16,b:24,k:8},{a:18,b:30,k:6},{a:14,b:21,k:7}],
  M4:['7/10','35/100','7/1000','125/100','3/10','9/100','43/1000','205/100'],
  M5:['0,6','0,04','1,25','0,9','0,07','2,5','0,125','3,05'],
  M6:[[2,3,4],[3,1,2],[1,2,5],[4,3,7]]
};
const pickEx=(list,keyFn,avoid)=>list.find(x=>!avoid.includes(keyFn(x)))||list[list.length-1];

const NOTES={
  M1:{title:'Brüche mit gleichem Wert',build(avoid){
    const e=pickEx(NOTE_EX.M1,x=>x.p+'/'+x.q,avoid);
    const terms=e.ks.map(k=>[e.p*k,e.q*k]);
    const chain=[];terms.forEach((t,i)=>{if(i)chain.push('=');chain.push(frac(t[0],t[1]));});
    return [
      el('p',null,'Drei Bilder können denselben Anteil einer Fläche zeigen, auch wenn sie unterschiedlich eingeteilt sind. Dieser Anteil kann durch verschiedene Brüche angegeben werden. Diese Brüche haben ',strong('denselben Wert'),'.'),
      el('div',{class:'ex'},strong('Beispiel: '),eq(...chain)),
      el('div',{class:'figrow'},terms.map(t=>figStrip(t[0],t[1]))),
      el('p',null,strong('Merke: '),'Der Wert eines Bruchs hängt vom Anteil ab, nicht davon, in wie viele Teile die Fläche eingeteilt wurde. Es kommt nur darauf an, wie viel gefärbt ist – nicht, wo die gefärbten Teile liegen.')
    ];}},
  M2:{title:'Erweitern eines Bruchs',build(avoid){
    const e=pickEx(NOTE_EX.M2,x=>redKey(x.a,x.b),avoid);
    return [
      el('p',null,'Ein Bruch wird ',strong('erweitert'),', wenn man seinen ',strong('Zähler und seinen Nenner mit derselben natürlichen Zahl (Erweiterungszahl, mindestens 2) multipliziert'),'.'),
      el('p',null,strong('Der Wert des Bruchs ändert sich dabei nicht.')),
      el('div',{class:'ex'},strong('Beispiel: '),eq(frac(e.a,e.b),'=',frac(e.a+' · '+e.k,e.b+' · '+e.k),'=',frac(e.a*e.k,e.b*e.k))),
      el('div',{class:'figrow'},figStrip(e.a,e.b),figStrip(e.a*e.k,e.b*e.k))
    ];}},
  M3:{title:'Kürzen eines Bruchs',build(avoid){
    const e=pickEx(NOTE_EX.M3,x=>redKey(x.a,x.b),avoid);
    return [
      el('p',null,'Ein Bruch wird ',strong('gekürzt'),', wenn man seinen ',strong('Zähler und seinen Nenner durch dieselbe natürliche Zahl (Kürzungszahl, mindestens 2) dividiert'),'.'),
      el('p',null,strong('Der Wert des Bruchs ändert sich dabei nicht.')),
      el('div',{class:'ex'},strong('Beispiel: '),eq(frac(e.a,e.b),'=',frac(e.a+' : '+e.k,e.b+' : '+e.k),'=',frac(e.a/e.k,e.b/e.k))),
      el('p',null,strong('So weit wie möglich gekürzt: '),'Zähler und Nenner können nicht mehr beide durch dieselbe natürliche Zahl größer als 1 geteilt werden.'),
      el('div',{class:'rule'},strong('Schnelle Teilbarkeits-Tipps: '),RULE2,' ',el('br'),'Enden Zähler und Nenner beide auf 0 oder 5, geht auch die 5. Enden beide auf 0, geht auch die 10.')
    ];}},
  M7:{title:'Teilbarkeitsregeln',build(avoid){
    return [el('p',null,'So erkennst du schnell, ob du kürzen kannst:'),
      ...[2,3,4,5,6,9,10].map(k=>el('p',{class:'rule'},DIV_RULE[k])),
      el('p',null,strong('Beispiel: '),'374 → Quersumme 3 + 7 + 4 = 14, also nicht durch 3 teilbar; letzte Ziffer 4, also durch 2 teilbar.')];}},
  M4:{title:'Vom Dezimalbruch zur Dezimalzahl',build(avoid){
    const list=NOTE_EX.M4.filter(x=>!avoid.includes(x)).slice(0,4);
    const ex=list.map(k=>{const [n,d]=k.split('/').map(Number);return eq(frac(n,d),'=',el('span',null,decOf(n,Math.round(Math.log10(d)))));});
    return [
      el('p',null,'Ein Bruch mit dem Nenner ',strong('10, 100, 1000, …'),' heißt ',strong('Dezimalbruch'),'.'),
      el('p',null,'Beim Schreiben als Dezimalzahl zeigt der Nenner, wie viele Stellen nach dem Komma gebraucht werden: 10 – eine Stelle, 100 – zwei Stellen, 1000 – drei Stellen.'),
      el('div',{class:'ex'},strong('Beispiele:'),ex.map(x=>x)),
      el('table',null,el('tr',null,el('th',null,'Nenner'),el('th',null,'Stellen nach dem Komma'),el('th',null,'Name')),
        el('tr',null,el('td',null,'10'),el('td',null,'1'),el('td',null,'Zehntel')),
        el('tr',null,el('td',null,'100'),el('td',null,'2'),el('td',null,'Hundertstel')),
        el('tr',null,el('td',null,'1000'),el('td',null,'3'),el('td',null,'Tausendstel')))
    ];}},
  M5:{title:'Von der Dezimalzahl zum Dezimalbruch',build(avoid){
    const list=NOTE_EX.M5.filter(x=>!avoid.includes(x)).slice(0,3);
    const ex=list.map(s=>{const p=parseGermanDecimal(s);return eq(el('span',null,s),'=',frac(p.num,p.den));});
    return [
      el('p',null,'Jede Stelle nach dem Komma ist wichtig. Bei einer Stelle nach dem Komma steht ',strong('10'),' im Nenner, bei zwei Stellen ',strong('100'),', bei drei Stellen ',strong('1000'),'.'),
      el('p',null,'Zähle alle Stellen hinter dem Komma, auch die Nullen. Der Zähler ist die Zahl ohne Komma.'),
      el('div',{class:'ex'},strong('Beispiele:'),ex),
      el('p',null,el('b',null,'0,05'),' hat 2 Stellen, also ',frac(5,100),'. ',el('b',null,'0,050'),' hat 3 Stellen, also ',frac(50,1000),'. Beide Brüche haben denselben Wert.')
    ];}},
  M6:{title:'Gemischte Zahl als Bruch',build(avoid){
    const e=pickEx(NOTE_EX.M6,x=>x[0]+' '+x[1]+'/'+x[2],avoid);
    const [w,n,d]=e;
    const figs=[];
    for(let i=0;i<w;i++)figs.push(drawFractionStrip(d,d,{maxW:150,label:'Ganzes'}));
    figs.push(drawFractionStrip(n,d,{maxW:150,label:'Bruchteil'}));
    return [
      el('p',null,'Eine gemischte Zahl besteht aus einer ',strong('natürlichen Zahl und einem Bruch'),'.'),
      el('p',null,'Um sie als Bruch zu schreiben, rechnet man: ',strong('Ganze · Nenner + Zähler'),'. Das Ergebnis wird zum neuen Zähler. ',strong('Der Nenner bleibt gleich.')),
      el('div',{class:'ex'},strong('Beispiel: '),eq(mixed(w,n,d),'=',frac(`${w} · ${d} + ${n}`,d),'=',frac(w*d+n,d))),
      el('div',{class:'ex'},el('span',null,w+' + '),frac(n,d)),
      el('div',{class:'figrow'},figs)
    ];}},
  M8:{title:'Brüche am Zahlenstrahl',build(avoid){
    return [
      el('p',null,'Auf dem Zahlenstrahl ist ',strong('ein Ganzes die Strecke von 0 bis 1'),'. Jedes weitere Ganze ist genauso lang.'),
      el('p',null,'Der ',strong('Nenner'),' sagt, in wie viele gleich große ',strong('Abschnitte'),' ein Ganzes geteilt ist. Der ',strong('Zähler'),' sagt, wie viele Abschnitte du von 0 aus bis zum Punkt zählst.'),
      el('div',{class:'ex'},strong('Beispiel: '),frac(3,5),': ein Ganzes hat 5 Abschnitte, der Punkt liegt nach 3 Abschnitten.'),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:5,marks:[{n:3,d:5}],strip:{n:3,d:5},maxW:360,label:'Drei Fünftel am Zahlenstrahl'})),
      el('p',null,strong('Merke: '),'Zähle die Abschnitte, nicht die Striche. 5 Abschnitte haben 6 Striche.')
    ];}},
  M9:{title:'Zwei Wege zum Punkt',build(avoid){
    return [
      el('p',null,'So trägst du einen Bruch ein, wenn die Einteilung nicht zum Nenner passt. Es gibt zwei Wege, und beide führen zum selben Punkt.'),
      el('p',null,strong('Weg 1: Einteilung anpassen. '),'Teile den Strahl so ein, wie der Nenner sagt, und zähle dann den Zähler ab.'),
      el('div',{class:'ex'},frac(3,5),': ein Ganzes in 5 Abschnitte teilen, 3 Abschnitte zählen.'),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:5,marks:[{n:3,d:5}],maxW:360,label:'Drei Fünftel mit fünf Abschnitten'})),
      el('p',null,strong('Weg 2: Bruch anpassen. '),'Erweitere oder kürze den Bruch auf den Nenner der vorhandenen Einteilung.'),
      el('div',{class:'ex'},eq(frac(3,5),'=',frac('3 · 2','5 · 2'),'=',frac(6,10))),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:10,marks:[{n:6,d:10}],maxW:360,label:'Sechs Zehntel mit zehn Abschnitten'})),
      el('p',null,strong('Merke: '),'Ein feineres Raster zeigt denselben Punkt: ',frac(3,5),' = ',frac(6,10),'. Erweitern heißt feiner teilen, Kürzen heißt gröber teilen.')
    ];}},
  M10:{title:'Die passende Einteilung',build(avoid){
    return [
      el('p',null,'Ein Bruch liegt ',strong('genau auf einem Strich'),', wenn sein Nenner in die Zahl der Teile je Ganzem ',strong('aufgeht'),'.'),
      el('div',{class:'ex'},frac(1,3),' passt bei 3, 6, 9, 12 Teilen, aber nicht bei 10 Teilen.'),
      el('p',null,'Für ',strong('mehrere Brüche'),' brauchst du eine Einteilung, in die alle Nenner aufgehen. Die kleinste solche Zahl ist am einfachsten. Das Fachwort dafür heißt kleinstes gemeinsames Vielfaches (kgV).'),
      el('div',{class:'ex'},strong('Beispiel: '),frac(1,2),', ',frac(3,4),', ',frac(5,6),': 2, 4 und 6 gehen in 12 auf. Also 12 Teile je Ganzem.'),
      el('div',{class:'figrow'},drawNumberLine({from:0,to:1,parts:12,marks:[{n:1,d:2,text:'A'},{n:3,d:4,text:'B'},{n:5,d:6,text:'C'}],maxW:360,label:'Brüche mit zwölf Abschnitten'}))
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
/* Kürzen-Hinweise nennen immer die 2-Regel */
function withRules(h){return [[h[0],RULE2],[h[1],RULE510]];}

