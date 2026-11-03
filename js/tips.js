'use strict';
/* =====================================================================
   Tipps: drei Stufen je Aufgabe, bezogen auf die konkreten Zahlen
   1  eine Frage zur Aufgabe (nennt nie das Ergebnis)
   2  der erste Schritt, vorgemacht
   3  eine Teillösung (den Rest rechnest du selbst)
   Jeder Tipp ist eine Liste von Zeilen. {n|d} ist ein Bruch, **fett** ein Knopf oder Merkwort (wie in den Erklärungen).
   Sätze höchstens 14 Wörter (runSelfTests prüft das). Die Teilbarkeitsregel steht nur, wenn sie zu den beiden Zahlen passt (divRules).
   Die Tipps stehen hier und nicht an den Aufgaben, damit Wortlaut und Aufbau an einer Stelle liegen.
   ===================================================================== */
const tf=(n,d)=>'{'+n+'|'+d+'}';

/* Passende Kürzen-Regeln für Zähler und Nenner: nur, was wirklich geht (sonst leer) */
function divRules(a,b){
  const out=[];
  if(a%2===0&&b%2===0)out.push('Sind beide Zahlen gerade, kannst du durch 2 kürzen.');
  if(a%10===0&&b%10===0)out.push('Enden beide auf 0, kannst du durch 10 kürzen.');
  else if(a%5===0&&b%5===0)out.push('Enden beide auf 0 oder 5, kannst du durch 5 kürzen.');
  if(digitSum(a)%3===0&&digitSum(b)%3===0)out.push('Sind beide Quersummen durch 3 teilbar, kannst du durch 3 kürzen.');
  return out;
}
const plural=(n,one,many)=>n===1?one:many;
const TIPS={};

/* ---------- Grundlagen ---------- */
TIPS.G01=(t)=>{
  const g=t.target,ok=t.cards.map((c,i)=>equivalent(c.n,c.d,g.n,g.d)?i:-1).filter(i=>i>=0),rest=ok.length-1;
  return [
    [g.mode==='num'?`Die Vorgabe ist ${tf(g.n,g.d)}. Welchen Anteil zeigt jede Karte?`:`Die Vorgabe hat ${g.d} Teile, ${g.n} davon sind gefärbt. Welchen Anteil zeigt jede Karte?`],
    [`Erweitere die Vorgabe selbst: ${tf(g.n,g.d)} = ${tf(2*g.n,2*g.d)}. Suche solche Brüche und Bilder.`],
    [`Karte ${ok[0]+1} zeigt denselben Anteil.`+(rest>0?` Es gibt noch ${rest===1?'eine weitere':rest+' weitere'}.`:'')]
  ];
};
TIPS.G02=(t)=>{
  const nb=t.b*t.k;
  if(t.mode==='factor')return [
    [`Du erweiterst mit ${t.k}. Was passiert mit dem Nenner ${t.b}, was mit dem Zähler ${t.a}?`],
    [`Rechne zuerst den Nenner: ${t.b} mal ${t.k} ergibt ${nb}.`],
    [`Der neue Nenner ist ${nb}. Jetzt fehlt nur der Zähler: ${t.a} mal ${t.k}.`]];
  return [
    [`Der Nenner soll von ${t.b} auf ${nb} wachsen. Mit welcher Zahl musst du ${t.b} malnehmen?`],
    [`${nb} geteilt durch ${t.b} ergibt ${t.k}. Das ist die Erweiterungszahl.`],
    [`Rechne den Zähler mit derselben Zahl: ${t.a} mal ${t.k}.`]];
};
/* Kürzen mit vorgegebener Zahl oder so weit wie möglich (auch Tresortür, G04) */
TIPS.G03=(t,extra)=>{
  if(t.mode==='factor'){
    const nb=t.b/t.k;
    return [
      [`Du kürzt mit ${t.k}. Wie oft passt ${t.k} in ${t.b}, wie oft in ${t.a}?`],
      [`Rechne zuerst den Nenner: ${t.b} geteilt durch ${t.k} ergibt ${nb}.`],
      [`Der neue Nenner ist ${nb}. Jetzt fehlt nur der Zähler: ${t.a} geteilt durch ${t.k}.`]];
  }
  if(t.irreducible)return [
    [`Teilt eine Zahl größer als 1 sowohl ${t.a} als auch ${t.b}?`,...(extra||[])],
    ['Teste die kleinen Zahlen 2, 3, 5 und 7. Teilt eine davon beide Zahlen?'],
    [`Bei ${tf(t.a,t.b)} teilt keine davon beide. Der Bruch ist schon so weit wie möglich gekürzt.`]];
  const g=gcd(t.a,t.b),f=smallestPrimeFactor(g),rules=divRules(t.a,t.b);
  return [
    [`Welche Zahl teilt ${t.a} und ${t.b} ohne Rest?`,...(rules.length?rules:['Probiere die kleinen Zahlen 2, 3, 5 und 7.']),...(extra||[])],
    [`Probiere die ${f}: ${t.a} : ${f} = ${t.a/f} und ${t.b} : ${f} = ${t.b/f}.`],
    [`Nach dem ersten Schritt steht da ${tf(t.a/f,t.b/f)}.`,g===f?'Prüfe jetzt, ob du noch einmal kürzen kannst.':'Du kannst noch einmal kürzen.']];
};
TIPS.G04=(t)=>TIPS.G03(t,['Manchmal geht es nicht mehr. Dann tippe **Geht nicht mehr**.']);
TIPS.V01=(t)=>TIPS.G03(t);
TIPS.G05=(t)=>{
  if(t.mode==='denom'){
    const up=t.N>t.b,k=up?t.N/t.b:t.b/t.N,op=up?'mal':'geteilt durch';
    return [
      [`Der Nenner ändert sich von ${t.b} zu ${t.N}. Wird er größer oder kleiner? Danach weißt du, ob du erweiterst oder kürzt.`],
      [up?`${t.N} geteilt durch ${t.b} ergibt ${k}. Du erweiterst also mit ${k}.`:`${t.b} geteilt durch ${t.N} ergibt ${k}. Du kürzt also durch ${k}.`],
      [`Rechne den Zähler mit derselben Zahl: ${t.a} ${op} ${k}.`]];
  }
  return [
    [`Was steht oben und unten, wenn du ${tf(t.a,t.b)} mit ${t.k} erweiterst?`],
    [`Erster Schritt: ${t.a} mal ${t.k} ergibt ${t.a*t.k} und ${t.b} mal ${t.k} ergibt ${t.b*t.k}.`],
    [`Nach dem ersten Schritt steht da ${tf(t.a*t.k,t.b*t.k)}. Kürze jetzt beide Zahlen durch ${t.m}.`]];
};
TIPS.B01=(t)=>{
  if(t.level===1)return [
    [`Das Bild hat ${t.b} Teile, ${t.a} sind gefärbt. Es soll ${t.target} Teile haben. Wie viele neue Teile entstehen aus einem alten?`],
    [`${t.target} geteilt durch ${t.b} ergibt ${t.k}. Jedes alte Teil wird in ${t.k} Teile geteilt.`],
    [`Aus ${t.a} gefärbten Teilen werden ${t.a} mal ${t.k}, also ${t.a*t.k} gefärbte Teile.`]];
  let n=0;for(let r=1;r<=10;r++)for(let c=1;c<=10;c++){const m=r*c;if(m>=t.minTotal&&(m*t.a)%t.b===0&&(!n||m<n))n=m;}
  const step=t.b/gcd(t.a,t.b);
  return [
    [`Das Raster hat ${t.b} Felder, ${t.a} sind gefärbt. Du brauchst mindestens ${t.minTotal} Felder. Welche Gesamtzahl passt zu ${tf(t.a,t.b)}?`],
    [`Die Zahl der Felder muss ein Vielfaches von ${step} sein.`],
    [`Mit ${n} Feldern passt es. Dann sind ${n*t.a/t.b} Felder gefärbt.`]];
};
TIPS.T02=(t)=>{
  const ok=t.opts.filter(x=>t.a%x===0&&t.b%x===0),x0=t.opts[0];
  return [
    [`Beide Zahlen müssen passen. Prüfe jede Zahl für ${t.a} und ${t.b}.`],
    [`Teste die ${x0}: Bei ${t.a} ${t.a%x0===0?'geht es auf':'bleibt ein Rest'}, bei ${t.b} ${t.b%x0===0?'geht es auf':'bleibt ein Rest'}.`],
    [`Die ${ok[0]} teilt ${t.a} und ${t.b}.${ok.length>1?' Es gibt noch mehr.':''}`]];
};
TIPS.T01=(t)=>[
  [`Welche Regel gilt für die ${t.k}? Schau dir die Ziffern von ${t.n} an.`],
  [DIV_RULE[t.k]],
  [divExplain(t.n,t.k)[0]]];

/* ---------- Umkehraufgaben ---------- */
TIPS.U01=(t)=>{
  const ref=t.terms.find(x=>!x.blank),x=t.terms.find(y=>y.blank);
  const known=x.blank==='n'?x.d:x.n,refv=x.blank==='n'?ref.d:ref.n,other=x.blank==='n'?ref.n:ref.d;
  const up=known>refv,hi=Math.max(known,refv),lo=Math.min(known,refv);
  const word=x.blank==='n'?'der Nenner':'der Zähler';
  if(hi%lo!==0){
    const [p,q]=simplify(ref.n,ref.d);
    return [
      ['Vergleiche den vollständigen Bruch mit den anderen. Wie verändern sich die Zahlen, die du kennst?'],
      [`Kürze ${tf(ref.n,ref.d)} zuerst so weit wie möglich. Du bekommst ${tf(p,q)}.`],
      [`Erweitere ${tf(p,q)} jetzt so, dass ${word} ${known} wird.`]];
  }
  const f=hi/lo;
  return [
    ['Vergleiche den vollständigen Bruch mit den anderen. Wie verändern sich die Zahlen, die du kennst?'],
    [`Bei der ersten Lücke wird ${word} von ${refv} zu ${known}. ${hi} : ${lo} = ${f}.`],
    [`Es wird mit ${f} ${up?'erweitert':'gekürzt'}. Rechne ${other} ${up?'mal':'geteilt durch'} ${f}.`]];
};
TIPS.U02=(t)=>{
  const [fa,fb]=t.from,[ta,tb]=t.to;
  if(t.mid){
    const [ma]=t.mid;
    return [
      [`Erst von ${tf(fa,fb)} zu ${tf(t.mid[0],t.mid[1])}, dann zu ${tf(ta,tb)}. Mit welchen zwei Zahlen wurde erweitert?`],
      [`Erster Schritt: ${ma} geteilt durch ${fa} ergibt ${ma/fa}.`],
      [`Zweiter Schritt: ${ta} geteilt durch ${ma} ergibt ${ta/ma}. Für die Gesamtzahl rechnest du beide zusammen.`]];
  }
  const hi=Math.max(fb,tb),lo=Math.min(fb,tb);
  return [
    [`Vergleiche die Zähler: Wie kommst du von ${fa} zu ${ta}?`],
    [`Prüfe auch die Nenner: ${fb} zu ${tb}. Bei beiden Zahlen gilt dieselbe Rechnung.`],
    [`Teile die größere Nenner-Zahl durch die kleinere: ${hi} : ${lo}.`]];
};
/* „Zähler: 6 wird zu 12.“ bzw. „Zähler: 6 bleibt 6.“ */
const chg=(label,x,y)=>x===y?`${label}: ${x} bleibt ${y}.`:`${label}: ${x} wird zu ${y}.`;
TIPS.U03=(t)=>{
  const [sa,sb]=t.shown;
  if(t.fix==='full')return [
    [`Vergleiche ${t.a} und ${sa} oben, ${t.b} und ${sb} unten. Wie weit wurde gekürzt?`],
    [`Prüfe, ob in ${tf(sa,sb)} noch eine Zahl größer als 1 in beide Zahlen passt.`,...divRules(sa,sb)],
    [ERR_TEXT.notFull]];
  const op=t.kind==='expand'?'mit':'durch',verb=t.kind==='expand'?'malnehmen':'teilen';
  return [
    [`Vergleiche ${t.a} und ${sa} oben, ${t.b} und ${sb} unten. Was wurde mit dem Zähler gemacht, was mit dem Nenner?`],
    [`${chg('Zähler',t.a,sa)} ${chg('Nenner',t.b,sb)} Wurde bei beiden dasselbe gerechnet?`],
    [`Der Fehler: ${ERR_TEXT[t.errType]}`,`Richtig ist: Zähler und Nenner beide ${op} ${t.k} ${verb}.`]];
};
TIPS.O01=(t)=>{
  const out=[];
  if(t.den)out.push(`Für den Nenner ${t.den}: ${t.den} : ${t.q} = ${t.den/t.q}. Erweitere mit ${t.den/t.q}.`);
  if(t.numMin)out.push(`Für einen Zähler über ${t.numMin}: Erweitere mit ${Math.floor(t.numMin/t.p)+1}.`);
  if(!out.length)out.push(`Erweitere mit 3, 4 und 5: ${tf(3*t.p,3*t.q)}, ${tf(4*t.p,4*t.q)}, ${tf(5*t.p,5*t.q)}.`);
  return [
    [`Welche Rechnung ändert den Wert von ${tf(t.p,t.q)} nicht? Erweitere mit verschiedenen Zahlen.`],
    [`Erweitere mit 2: ${tf(t.p,t.q)} = ${tf(2*t.p,2*t.q)}. Das ist schon ein Bruch.`],
    out];
};
TIPS.O02=(t)=>{
  const ways=o02Ways(t),lng=ways[ways.length-1]||[gcd(t.a,t.b)],sht=ways[0]||lng,f=lng[0];
  return [
    [`Welche Zahlen teilen ${t.a} und ${t.b}? Der zweite Weg braucht andere Zahlen als der erste.`,...divRules(t.a,t.b)],
    [`Ein Weg: erst durch ${f}. ${t.a} : ${f} = ${t.a/f} und ${t.b} : ${f} = ${t.b/f}.`],
    [ways.length>1?`Ein anderer Weg nimmt ${sht.map(k=>'÷'+k).join(' und ')}. Am Ende steht ${tf(t.p,t.q)}.`:`Dieselben Zahlen gehen auch in anderer Reihenfolge. Am Ende steht ${tf(t.p,t.q)}.`]];
};

/* ---------- Gemischte Runden (js/mix.js) ---------- */
TIPS.U04=(t)=>{
  if(t.kind==='full'){
    const rules=divRules(t.a,t.b);
    return [
      [`${t.who} sagt, ${tf(t.a,t.b)} sei schon fertig gekürzt. Teilt eine Zahl größer als 1 beide Zahlen?`],
      ['Teste die kleinen Zahlen 2, 3, 5 und 7. Teilt eine davon beide Zahlen?',...rules],
      [t.truth?'Keine dieser Zahlen teilt beide. Suche die Begründung, die das sagt.':`Beide Zahlen sind durch ${gcd(t.a,t.b)} teilbar. Suche die Begründung, die das sagt.`]];
  }
  return [
    [`Wurde oben und unten dasselbe gemacht? Vergleiche ${t.a} mit ${t.c} und ${t.b} mit ${t.d}.`],
    [qCross(t.a,t.b,t.c,t.d)+' Sind beide Ergebnisse gleich?'],
    [t.truth?'Die Brüche sind gleich. Suche die Begründung, die erklärt, warum.':'Die Brüche sind nicht gleich. Suche die Begründung, die den Fehler nennt.']];
};
TIPS.U05=(t)=>[
  ['Wie groß ist der Teil, wie groß ist das Ganze? Der Teil steht oben im Bruch.'],
  [`Der Teil ist ${t.part}, das Ganze ist ${t.total}. Das ergibt ${tf(t.part,t.total)}.`],
  [`Kürze mit ${t.g}: ${t.part} : ${t.g} und ${t.total} : ${t.g}.`]];
TIPS.U06=(t)=>[
  ['Rechne beide Zeilen nach. In welcher Zeile stimmt Zähler oder Nenner nicht?'],
  [`Zeile 1: ${t.a} mal ${t.k} und ${t.b} mal ${t.k}. Stimmt das Ergebnis ${tf(t.c,t.d)}?`],
  [t.err===1?`Zeile 1 ist falsch. Rechne ${t.a} mal ${t.k} und ${t.b} mal ${t.k} noch einmal.`:`Zeile 1 stimmt. Prüfe Zeile 2: ${t.c} ${t.op==='x'?'mal':'geteilt durch'} ${t.m} und ${t.d} ${t.op==='x'?'mal':'geteilt durch'} ${t.m}.`]];

/* ---------- Darstellungen umwandeln ---------- */
const decPlaces=(den)=>String(den).length-1;
TIPS.D01=(t)=>{
  const p=decPlaces(t.den),L=String(t.n).length;
  return [
    [`Der Nenner ${t.den} sagt, wie viele Stellen hinter dem Komma stehen. Wie viele sind es?`],
    [`${t.den} hat ${p} ${plural(p,'Null','Nullen')}, also ${p} ${plural(p,'Stelle','Stellen')} hinter dem Komma.`],
    [L>p?`Schreibe ${t.n}. Die letzten ${p} Ziffern stehen hinter dem Komma.`:`Schreibe ${t.n} und fülle davor mit Nullen auf, bis es ${p} ${plural(p,'Stelle','Stellen')} sind. Davor steht 0,.`]];
};
TIPS.D02=(t)=>[
  [`Wie viele Stellen stehen bei ${t.s} hinter dem Komma? Das bestimmt den Nenner.`],
  [`${t.s} hat ${t.places} ${plural(t.places,'Stelle','Stellen')}. Der Nenner ist eine 1 mit ${t.places} ${plural(t.places,'Null','Nullen')}.`],
  [`Der Zähler ist ${t.s} ohne Komma, also ${t.n}. Der Nenner ist ${t.den}.`]];
TIPS.D03=(t)=>[
  [`Ein Ganzes hat ${t.d} Teile. Wie viele Teile sind ${t.w} Ganze?`],
  [`${t.w} Ganze sind ${t.w} mal ${t.d}, also ${t.w*t.d} Teile.`],
  [`Dazu kommen noch ${t.n} Teile. Der Nenner bleibt ${t.d}.`]];

/* ---------- Zahlenstrahl ---------- */
TIPS.Z01=(t)=>{
  if(t.kind==='count')return [
    [t.u===1?'Zähle die Abschnitte zwischen 0 und 1. Zähle nicht die Striche.':'Zähle die Abschnitte von 0 bis 1, nicht den ganzen Strahl.'],
    ['Fange bei 0 an und zähle jeden Abschnitt bis zur 1.'+(t.level===1?' Du kannst die Abschnitte antippen. Sie werden gefärbt und mitgezählt.':'')],
    ['Es gibt immer einen Abschnitt weniger als Striche. Zähle noch einmal.']];
  if(t.kind==='pick')return [
    [`Gesucht ist der Strahl mit genau ${t.m} Abschnitten ${t.u===1?'zwischen 0 und 1':'je Ganzem'}.`],
    ['Zähle bei jedem Strahl die Abschnitte, nicht die Striche.'],
    [`${t.m} Abschnitte haben ${t.m+1} Striche. Suche den Strahl mit ${t.m+1} Strichen.`]];
  return [
    ['Vergleiche die Abstände zwischen je zwei Strichen.'],
    ['Alle Abschnitte müssen gleich breit sein, sonst ist die Einteilung ungleichmäßig.'],
    ['Ein einziger verschobener Strich genügt. Prüfe jeden Strich einzeln.']];
};
TIPS.Z02=(t)=>[
  ['Zähle die Abschnitte eines Ganzen, von 0 bis 1. Diese Zahl ist der Nenner.'],
  [`Hier hat ein Ganzes ${t.m} Abschnitte. Der Nenner ist also ${t.m}.`],
  [`${t.idx.length>1?'Punkt A':'Der Punkt'} liegt ${t.idx[0]} Abschnitte von 0 entfernt. Das ist der Zähler.`]];
TIPS.Z03=(t)=>{
  const strip=t.idx.length===1&&t.idx[0]<=t.m;
  return [
    [`Du sollst ${tf(t.idx[0],t.m)}${t.idx.length>1?' und weitere Brüche':''} eintragen. Wie viele Abschnitte zählst du von 0 aus?`],
    [strip?'Jetzt liegt ein Bruchstreifen über dem Strahl. Der gefärbte Teil reicht bis zum Punkt.':`Der erste Strich nach der 0 ist ${tf(1,t.m)}. Von dort zählst du weiter.`],
    [`${t.idx.length>1?'Punkt A':'Der Punkt'} liegt nach ${t.idx[0]} Abschnitten von 0 aus.`]];
};
TIPS.Z04=(t)=>{
  const strip=t.fr.length===1&&t.fr[0]<=t.d;
  return [
    [`Der Nenner ${t.d} sagt, wie viele Abschnitte ein Ganzes hat. Wie stellst du den Strahl ein?`],
    [strip?`Jetzt liegt ein Bruchstreifen über dem Strahl. Er ist in ${t.d} gleiche Teile geteilt: So soll auch der Strahl eingeteilt werden.`:`Stelle bei **Teile je Ganzem** die Zahl ${t.d} ein.`],
    [`Mit ${t.d} Teilen je Ganzem zählst du ${t.fr[0]} Abschnitte von 0 aus${t.fr.length>1?' (Punkt A)':''}.`]];
};
TIPS.Z05=(t)=>{
  const red=simplify(t.a,t.b),strip=t.a<t.b,e=t.kind==='expand';
  const first=t.kind==='nofit'
    ?[`${t.level===1?'':'Prüfe: '}Geht der Nenner ${red[1]} in ${t.m} auf? Dann liegt ${tf(t.a,t.b)} genau auf einem Strich.`]
    :[`${t.level===1?`Schreibe ${tf(t.a,t.b)} zuerst mit dem Nenner ${t.m}. `:''}Der Strahl hat ${t.m} Abschnitte je Ganzem, der Bruch den Nenner ${t.b}. Wie kommst du von ${t.b} zu ${t.m}?`];
  const step=t.kind==='nofit'?['Wenn die Einteilung nicht passt, teile den Strahl feiner. Der Nenner muss in die Teile aufgehen.']
    :[e?`${t.m} geteilt durch ${t.b} ergibt ${t.k}. Du erweiterst also mit ${t.k}.`:`${t.b} geteilt durch ${t.m} ergibt ${t.k}. Du kürzt also durch ${t.k}.`];
  const last=t.kind==='nofit'?[`Mit ${red[1]} Teilen je Ganzem liegt der Punkt auf einem Strich.`]
    :[`Rechne den Zähler mit derselben Zahl: ${t.a} ${e?'mal':'geteilt durch'} ${t.k}.`];
  if(strip)return [first,['Jetzt liegt ein Bruchstreifen über dem Strahl. Er zeigt den Bruch in seinem Nenner, der Strahl hat eine andere Einteilung.'],step.concat(last)];
  return [first,step,last];
};
TIPS.Z06=(t)=>{
  const ds=t.fr.map(f=>f[1]),mx=Math.max(...ds);
  return [
    [`Die Nenner sind ${ds.join(', ')}. Welche Zahl von Teilen je Ganzem passt zu allen?`],
    [`Teste den größten Nenner ${mx}: Gehen alle anderen Nenner in ${mx} auf? Wenn nicht, probiere ein Vielfaches von ${mx}.`],
    [`Die kleinste passende Einteilung hat ${t.l} Teile je Ganzem.`]];
};
TIPS.Z07=(t)=>{
  const f=t.from||0;
  return [
    [f?'Ein Ganzes ist der Abstand zwischen zwei ganzen Zahlen, hier von '+f+' bis '+(f+1)+'. Der Strahl muss nicht bei 0 beginnen.':'Ein Ganzes ist immer die Strecke von 0 bis 1, nicht der ganze Strahl.'],
    [f?`Zähle ab ${f}: Wie viele Abschnitte sind es bis zum Bruch? Von ${f} bis ${f+1} sind es ${t.q}.`:`Finde die 1 auf dem Strahl. Von 0 bis 1 ist ein Ganzes in ${t.q} Abschnitte geteilt.`],
    t.level===1?[`${tf(t.p,t.q)} liegt auf jedem Strahl nach ${t.p} Abschnitten von 0 aus.`]
      :[f?`${t.ps.length>1?'Punkt A':'Der Punkt'} liegt ${t.ps[0]-f*t.q} Abschnitte hinter der ${f}.`:`${t.ps.length>1?'Punkt A':'Der Punkt'} liegt ${t.ps[0]} Abschnitte von 0 entfernt.`]];
};
TIPS.Z08=(t)=>{
  if(t.kind==='nat'){
    const c=t.cards.find(x=>x[0]%x[1]===0);
    return [
      ['Ein Bruch ist eine natürliche Zahl, wenn der Zähler ein Vielfaches des Nenners ist.'],
      ['Teile bei jeder Karte den Zähler durch den Nenner. Bleibt ein Rest?'],
      [`Zum Beispiel ${tf(c[0],c[1])}: ${c[0]} : ${c[1]} = ${c[0]/c[1]} ohne Rest.`]];
  }
  const w=Math.floor(t.n/t.d),rest=t.n%t.d;
  return [
    [`Wie viele Ganze passen in ${tf(t.n,t.d)}? Teile ${t.n} durch ${t.d}.`],
    [`${t.n} : ${t.d} = ${w} Rest ${rest}.`],
    [t.kind==='between'?`Der Punkt liegt hinter der ${w}. Die nächste ganze Zahl ist ${w+1}.`:`Du hast ${w} Ganze und ${rest} Abschnitte. Der Nenner bleibt ${t.d}.`]];
};

/* ---------- Vergleichen (W01–W03). In Knifflig und bei unechten Brüchen erscheint das Bild erst mit Tipp 2 (cmpPicSign) ---------- */
const cmpLater=(t)=>(t.level===1&&t.a<=t.b&&t.c<=t.d)?'':'Jetzt siehst du ein Bild. ';
TIPS.W01=(t)=>{
  const big=Math.max(t.a,t.c),small=Math.min(t.a,t.c);
  if(t.kind==='claim')return [
    ['Beide Brüche haben denselben Nenner. Was heißt das für die Stücke?'],
    [`${cmpLater(t)}Der Nenner ${t.b} sagt, wie groß die Stücke sind. Beide Brüche haben gleich große Stücke.`],
    ['Dann entscheidet der Zähler: Wer mehr Stücke hat, ist größer. Passt das zur Behauptung?']];
  return [
    [t.kind==='paint'?'Beide Brüche haben denselben Nenner. Färbe so viele Teile, wie der Zähler sagt.':'Beide Brüche haben denselben Nenner. Was heißt das für die Stücke?'],
    [`${t.kind==='paint'?'':cmpLater(t)}Der Nenner ${t.b} sagt: Alle Stücke sind gleich groß. Der Zähler zählt die Stücke: ${t.a} und ${t.c}.`],
    [`${big} Stücke sind mehr als ${small} Stücke. Welcher Bruch ist also größer?`]];
};
TIPS.W02=(t)=>{
  const mn=Math.min(t.b,t.d);
  if(t.kind==='claim')return [
    ['Beide Brüche haben denselben Zähler. Was heißt das für die Stücke?'],
    [`${cmpLater(t)}Es sind je ${t.a} ${t.a===1?'Stück':'Stücke'}. Aber ${t.b} und ${t.d} Teile machen verschieden große Stücke.`],
    ['Je mehr Teile das Ganze hat, desto kleiner sind die Stücke. Passt das zur Behauptung?']];
  return [
    [t.kind==='stamm'?'Von beiden ist ein Stück gefärbt. Sind die Stücke gleich groß?':'Beide Brüche haben gleich viele Stücke. Sind die Stücke gleich groß?'],
    [`${t.kind==='paint'?'':cmpLater(t)}Das Ganze ist einmal in ${t.b} und einmal in ${t.d} Teile geteilt. Wo sind die Stücke größer?`],
    [`In ${mn} Teile geteilt, sind die Stücke größer. Welcher Bruch ist also größer?`]];
};
TIPS.W03=(t)=>{
  const first=['Vergleiche die Nenner und die Zähler. Steht bei beiden dieselbe Zahl?'];
  if(t.same==='keins')return [first,['Die Nenner sind verschieden und die Zähler auch. Was passt dann?'],['Wähle **Keins von beiden**. Dafür lernst du gleich einen anderen Weg.']];
  const n=t.same==='nenner';
  return [first,
    [n?`Beide Brüche haben den Nenner ${t.b}. Dann sind alle Stücke gleich groß.`:`Beide Brüche haben den Zähler ${t.a}. Dann sind es gleich viele Stücke.`],
    [n?'Bei gleich großen Stücken zählt der Zähler: Mehr Stücke sind mehr.':'Bei gleich vielen Stücken zählt der Nenner: Größere Stücke sind mehr.']];
};

TIPS.W04=(t)=>{
  const mA=t.b-t.a,mC=t.d-t.c,eqm=mA===mC;
  const counts=`Bei ${tf(t.a,t.b)} ${cmpMissMain(mA)}, bei ${tf(t.c,t.d)} ${cmpMissMain(mC)}.`;
  const pic=t.level===1?'':'Jetzt siehst du ein Bild. Das Gestrichelte fehlt noch. ';
  if(t.kind==='claim'||t.kind==='conflict')return [
    ['Zähle, wie viele Stücke bei jedem Bruch bis zum Ganzen fehlen.'],
    [counts],
    [eqm?'Fehlen gleich viele Stücke, zählt die Größe der fehlenden Stücke.':'Fehlen verschieden viele Stücke, reicht diese Regel nicht.']];
  if(t.kind==='check')return [
    ['Zähle bei jedem Bruch, wie viele Stücke bis zum Ganzen fehlen.'],
    [pic+counts],
    [t.equal?'Es sind gleich viele. Wähle **Ja**. Dann vergleichst du die fehlenden Stücke.':'Es sind verschieden viele. Wähle **Nein**.']];
  return [
    ['Wie viele Stücke fehlen bei jedem Bruch bis zum Ganzen?'],
    [pic+counts],
    ['Bei beiden fehlen gleich viele Stücke. Bei welchem Bruch ist das fehlende Stück kleiner?']];
};

TIPS.W05=(t)=>{
  if(t.kind==='zaehler'){
    const e=t.ex===0?[t.a,t.b]:[t.c,t.d],o=t.ex===0?[t.c,t.d]:[t.a,t.b];
    return [
      [`Die Zähler sind ${t.a} und ${t.c}. Wie kommst du vom kleineren zum größeren?`],
      [`${o[0]} geteilt durch ${e[0]} ergibt ${t.k}. Erweitere ${tf(e[0],e[1])} mit ${t.k}.`],
      [`Der neue Nenner ist ${e[1]} mal ${t.k}.`]];
  }
  const N=t.kind==='ziel'?t.N:lcm(t.b,t.d);
  if(t.kind==='frei')return [
    ['Suche eine Zahl, in die beide Nenner aufgehen.'],
    [`Teste Vielfache des größeren Nenners ${Math.max(t.b,t.d)}. Geht auch ${Math.min(t.b,t.d)} auf?`],
    [`Der kleinste gemeinsame Nenner ist ${N}. Erweitere beide Brüche darauf.`]];
  const ex=cmpExpansions(t,N);
  return [
    [ex.length===1?`Der Nenner ${ex[0].den} soll zu ${N} werden. Mit welcher Zahl erweiterst du?`:`Die Nenner ${t.b} und ${t.d} sollen beide zu ${N} werden. Mit welchen Zahlen erweiterst du?`],
    [ex.map(x=>`${N} geteilt durch ${x.den} ergibt ${x.k}.`).join(' ')],
    [ex.length===1?`Rechne den Zähler: ${ex[0].n} mal ${ex[0].k}.`:`Rechne beide Zähler: ${ex.map(x=>`${x.n} mal ${x.k}`).join(' und ')}.`]];
};
TIPS.W06=(t)=>{
  const rel=(x,y)=>x<y?'kleiner als':x===y?'gleich':'größer als';
  if(t.kind==='sign')return [
    [`Liegt ${t.ref==='half'?'die Hälfte':'die 1'} zwischen den beiden Brüchen?`],
    [`Prüfe jeden Bruch einzeln: ${tf(t.a,t.b)} und ${tf(t.c,t.d)} gegen ${t.ref==='half'?tf(1,2):'1'}.`],
    [t.ref==='half'?`Doppelter Zähler gegen Nenner: ${2*t.a} zu ${t.b} und ${2*t.c} zu ${t.d}.`:`Vergleiche jeden Zähler mit seinem Nenner: ${t.a} zu ${t.b} und ${t.c} zu ${t.d}.`]];
  const pos=cmpSignOf(compareFrac(t.a,t.b,t.c,t.d))==='<'?'unter':cmpSignOf(compareFrac(t.a,t.b,t.c,t.d))==='='?'genau auf':'über';
  if(t.ref==='half')return [
    ['Die Hälfte eines Ganzen sind halb so viele Stücke wie der Nenner.'],
    [`Verdopple den Zähler: ${t.a} mal 2 ergibt ${2*t.a}. Vergleiche mit dem Nenner ${t.b}.`],
    [`${2*t.a} ist ${rel(2*t.a,t.b)} ${t.b}. Also liegt der Bruch ${pos} ${tf(1,2)}.`]];
  return [
    ['Ein Bruch ist größer als 1, wenn er mehr als ein Ganzes ist.'],
    [`Vergleiche den Zähler ${t.a} mit dem Nenner ${t.b}.`],
    [`${t.a} ist ${rel(t.a,t.b)} ${t.b}. Also liegt der Bruch ${pos} 1.`]];
};

/* ---------- Rückmeldung bei „richtig“: die Rechnung statt einer Floskel ----------
   proofText(task) liefert den Satz nach „Richtig: “ (null = die Aufgabe hat keine kurze Rechenprobe, dann gilt Lob + Begründung) */
const PROOF={
  G02:(t)=>`${t.a} · ${t.k} = ${t.a*t.k} und ${t.b} · ${t.k} = ${t.b*t.k}. Der Wert bleibt gleich.`,
  G03:(t)=>{
    if(t.mode==='factor')return `${t.a} : ${t.k} = ${t.a/t.k} und ${t.b} : ${t.k} = ${t.b/t.k}. Der Wert bleibt gleich.`;
    if(t.irreducible)return 'Keine Zahl größer als 1 teilt beide Zahlen. Der Bruch ist fertig gekürzt.';
    const g=gcd(t.a,t.b);
    return `${t.a} : ${g} = ${t.p} und ${t.b} : ${g} = ${t.q}. Der Bruch ist fertig gekürzt.`;
  },
  G05:(t)=>{
    if(t.mode==='denom'){
      const up=t.N>t.b,k=up?t.N/t.b:t.b/t.N,n=t.a*t.N/t.b;
      return up?`${t.b} · ${k} = ${t.N} und ${t.a} · ${k} = ${n}.`:`${t.b} : ${k} = ${t.N} und ${t.a} : ${k} = ${n}.`;
    }
    const e1=[t.a*t.k,t.b*t.k];
    return `${t.a} · ${t.k} = ${e1[0]} und ${t.b} · ${t.k} = ${e1[1]}, dann ${e1[0]} : ${t.m} = ${e1[0]/t.m} und ${e1[1]} : ${t.m} = ${e1[1]/t.m}.`;
  },
  U02:(t)=>{
    const e=t.mode==='expand',op=e?' · ':' : ';
    return `${t.from[0]}${op}${t.k} = ${t.to[0]} und ${t.from[1]}${op}${t.k} = ${t.to[1]}.`;
  },
  D03:(t)=>`${t.w} · ${t.d} + ${t.n} = ${t.w*t.d+t.n}. Der Nenner bleibt ${t.d}.`,
  U05:(t)=>`${t.part} : ${t.g} = ${t.p} und ${t.total} : ${t.g} = ${t.q}. Der Bruch ist fertig gekürzt.`
};
PROOF.G04=PROOF.G03;PROOF.V01=PROOF.G03;
function proofText(task){const f=PROOF[task.type];return f?f(task):null;}

/* Anmelden: jede Aufgabe liefert ihre Tipps aus TIPS (die Schnelltests Q00 und ZQ zeigen keine Tipps, behalten aber ihre eigenen) */
Object.keys(TIPS).forEach(id=>{if(TASKS[id]){TASKS[id].hints=function(t){return TIPS[id](t);};}});
