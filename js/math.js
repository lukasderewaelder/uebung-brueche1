'use strict';

/* ---------- 1 Zufall ---------- */
function makeRng(rnd){
  return {
    int:(a,b)=>a+Math.floor(rnd()*(b-a+1)),
    pick:(arr)=>arr[Math.floor(rnd()*arr.length)],
    chance:(p)=>rnd()<p,
    shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  };
}
function mulberry32(seed){let s=seed>>>0;return function(){s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const RNG=makeRng(Math.random);

/* ---------- 2 Mathematik (ausschließlich ganzzahlig) ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a;};
const equivalent=(a,b,c,d)=>b>0&&d>0&&a*d===c*b;
const simplify=(a,b)=>{const g=gcd(a,b)||1;return [a/g,b/g];};
const canReduce=(a,b,k)=>k>1&&a%k===0&&b%k===0;
const isFullyReduced=(a,b)=>gcd(a,b)===1;
const expand=(a,b,k)=>[a*k,b*k];
const mixedToFraction=(w,a,b)=>[w*b+a,b];
const redKey=(a,b)=>{const [p,q]=simplify(a,b);return p+'/'+q;};
const smallestPrimeFactor=(n)=>{for(let p=2;p*p<=n;p++)if(n%p===0)return p;return n;};

/* Ganze Zahl aus Zeichenkette (nur Ziffern, höchstens 6 Stellen) */
function parseIntStrict(s){
  if(s==null)return null;
  s=String(s).trim();
  return /^\d{1,6}$/.test(s)?Number(s):null;
}
/* Dezimalzahl als Zeichenkette -> exakt (Zähler, 10^Stellen); Punkt oder Komma */
function parseGermanDecimal(raw){
  const s=String(raw==null?'':raw).trim().replace(/\s/g,'').replace(',','.');
  const m=/^(\d{0,9})(?:\.(\d{1,6}))?$/.exec(s);
  if(!m||(m[1]===''&&m[2]===undefined))return null;
  if(m[1]===''&&!m[2])return null;
  const fracDigits=m[2]||'';
  const places=fracDigits.length;
  const num=Number((m[1]||'0')+fracDigits);
  if(!Number.isSafeInteger(num))return null;
  return {whole:Number(m[1]||'0'),fracDigits,places,num,den:Math.pow(10,places)};
}
/* a / 10^k -> "q,rest" mit führenden Nullen (stellengetreu) */
function fractionToDecimalString(a,den){
  const places=Math.round(Math.log10(den));
  if(Math.pow(10,places)!==den)return null;
  const q=Math.floor(a/den),r=a%den;
  return places===0?String(q):q+','+String(r).padStart(places,'0');
}
const decOf=(n,places)=>fractionToDecimalString(n,Math.pow(10,places));


/* ---------- Bruchrechnung (Grundlage für spätere Themen; Brüche als [Zähler, Nenner], Nenner > 0) ----------
   Ergebnisse sind nicht gekürzt – gekürzt wird mit simplify(). compareFrac, sortFracs, isImproper und toMixed tragen den Baustein „Brüche vergleichen und ordnen“ (js/vergleichen.js); addFrac … divFrac sind noch in keiner Aufgabe verwendet, nur getestet. */
const lcm=(a,b)=>(a&&b)?Math.abs(a/gcd(a,b)*b):0;
const addFrac=(a,b,c,d)=>{const m=lcm(b,d);return [a*(m/b)+c*(m/d),m];};
const subFrac=(a,b,c,d)=>{const m=lcm(b,d);return [a*(m/b)-c*(m/d),m];};
const mulFrac=(a,b,c,d)=>[a*c,b*d];
const divFrac=(a,b,c,d)=>c>0?[a*d,b*c]:null; /* Teilen durch 0 gibt null */
/* −1, 0 oder 1: a/b ist kleiner, gleich oder größer als c/d */
const compareFrac=(a,b,c,d)=>Math.sign(a*d-c*b);
const sortFracs=(list)=>list.slice().sort((x,y)=>compareFrac(x[0],x[1],y[0],y[1]));
const isImproper=(a,b)=>a>=b;
const toMixed=(a,b)=>({w:Math.floor(a/b),n:a%b,d:b});

/* ---------- Addieren und Subtrahieren, gleicher Nenner (Baustein R, js/rechnen.js) ----------
   Aufgabe: a/b + c/b oder a/b − c/b (gleicher Nenner b, bei Minus a ≥ c). Das Ergebnis ist res = [n, b], nicht gekürzt; gekürzt wird mit simplify().
   addDiagnose: Was steckt hinter einer falschen Eingabe x/y? null, wenn der Wert stimmt.
   nennerAddiert  der Nenner wurde mitgerechnet (b + b) und der Zähler stimmt (zum Beispiel 3/8 + 2/8 = 5/16)
   andereRechnung gerechnet wurde die andere Rechenart (plus statt minus oder umgekehrt), der Nenner ist richtig
   zaehlerNenner  Zähler und Nenner einzeln gerechnet, aber nicht nach dem Muster nennerAddiert (zum Beispiel Zähler a + c, Nenner b + b, dann gekürzt)
   rechenfehler   der Nenner stimmt, nur der Zähler ist falsch
   sonst          'wert' (der Nenner ist verändert oder gar nichts passt) */
const sameDenSum=(a,c,b)=>[a+c,b];
const sameDenDiff=(a,c,b)=>[a-c,b];
const sameDenRes=(a,c,b,plus)=>plus?sameDenSum(a,c,b):sameDenDiff(a,c,b);
function addDiagnose(a,c,b,plus,x,y){
  const res=sameDenRes(a,c,b,plus);
  if(equivalent(x,y,res[0],res[1]))return null;
  const other=sameDenRes(a,c,b,!plus);
  if(y===2*b&&x===res[0])return 'nennerAddiert';
  if(y===b&&x===other[0])return 'andereRechnung';
  if(equivalent(x,y,res[0],2*b))return 'zaehlerNenner';
  if(y===b)return 'rechenfehler';
  return 'wert';
}
/* Ergebnis-Block: Prüfung des Felds „Ergebnis“ und des Felds „gekürzt“ (js/rechnen-widgets.js zeigt beide immer).
   res = [n, b] das richtige Ergebnis (ungekürzt). kid: {r:{n,d}|null, k:{n,d}|null, kn:bool (Knopf „Kürzen geht nicht“)}.
   Rückgabe: 'leer' (Ergebnis fehlt) · 'kuerzenLeer' (zum Kürzen ist nichts angegeben; das kommt vor jeder Wertprüfung, damit die Rückmeldung nichts über das Ergebnis oder über das Kürzen verrät) ·
   'wert' (Ergebnis hat einen anderen Wert) · 'keinKuerzen' (Knopf gewählt, es geht aber) · 'kuerzenWert' (gekürzter Bruch hat einen anderen Wert) · 'nochKuerzen' (noch nicht ganz gekürzt) · null (alles stimmt). */
function kuerzenCheck(res,kid){
  if(!kid.r)return 'leer';
  if(!kid.kn&&!kid.k)return 'kuerzenLeer';
  if(!equivalent(kid.r.n,kid.r.d,res[0],res[1]))return 'wert';
  const exp=simplify(res[0],res[1]),reducible=!isFullyReduced(res[0],res[1]);
  if(kid.kn)return reducible?'keinKuerzen':null;
  if(!equivalent(kid.k.n,kid.k.d,exp[0],exp[1]))return 'kuerzenWert';
  return (kid.k.n===exp[0]&&kid.k.d===exp[1])?null:'nochKuerzen';
}

/* ---------- Zahlenstrahl ----------
   Ein Bruch mit dem Nenner d liegt genau auf einem Strich, wenn die Einteilung (m Teile je Ganzem) ein Vielfaches von d ist:
   der Nenner „geht in die Einteilung auf“. Strich i (von 0 gezählt) bei m Teilen je Ganzem liegt bei i/m. */
const fitsDivision=(d,m)=>d>0&&m>0&&m%d===0;
const commonDenominator=(ds)=>ds.reduce((a,d)=>lcm(a,d),1);
/* Nummer des Strichs für n/d bei m Teilen je Ganzem (ab dem Strich 0 der Zahl 0); null, wenn der Bruch zwischen zwei Strichen liegt */
const tickOf=(n,d,m)=>fitsDivision(d,m)?n*(m/d):null;

/* ---------- Vergleichen: Welche Wege tragen? ----------
   Reine Funktionen ohne DOM für den Baustein „Brüche vergleichen und ordnen“ (js/vergleichen.js). Brüche a/b und c/d, Nenner > 0.
   nenner  gleicher Nenner, verschiedene Zähler: mehr gleich große Stücke sind mehr
   zaehler gleicher Zähler, verschiedene Nenner: gleich viele Stücke, aber der größere Nenner macht kleinere Stücke
   fehlt   beide echt, verschiedene Nenner, es fehlen gleich viele Stücke zum Ganzen (1 bis FEHLT_MAX): das kleinere fehlende Stück gehört zum größeren Bruch
   zahl    ½ oder 1 liegt zwischen den Brüchen (oder ein Bruch liegt genau darauf)
   erw     geht immer: auf einen Nenner erweitern (kgV)
   Die Reihenfolge von CMP_WAYS ist der Vorrang für „am schnellsten“. */
const FEHLT_MAX=3;
const CMP_WAYS=['nenner','zaehler','fehlt','zahl','erw'];
const cmpSignOf=(c)=>c<0?'<':c>0?'>':'=';
function strategiesFor(a,b,c,d){
  const cmp=compareFrac(a,b,c,d),gleich=cmp===0;
  const nenner=b===d&&a!==c,zaehler=a===c&&b!==d;
  const mA=b-a,mC=d-c;
  const fehlt=(a<b&&c<d&&b!==d&&mA===mC&&mA<=FEHLT_MAX)?mA:0;
  let zahl=null;
  if(!gleich){
    if(compareFrac(a,b,1,2)*compareFrac(c,d,1,2)<=0)zahl='half';
    else if(compareFrac(a,b,1,1)*compareFrac(c,d,1,1)<=0)zahl='one';
  }
  const m=lcm(b,d),mz=(a>0&&c>0)?lcm(a,c):0;
  const erw={m,fa:m/b,fb:m/d,einfach:b%d===0||d%b===0};
  const erwZ=mz?{m:mz,fa:mz/a,fc:mz/c,einfach:a%c===0||c%a===0}:null;
  const special=[];
  if(nenner)special.push('nenner');
  if(zaehler)special.push('zaehler');
  if(fehlt)special.push('fehlt');
  if(zahl)special.push('zahl');
  return {cmp,gleich,nenner,zaehler,fehlt,zahl,erw,erwZ,special,fastest:special[0]||'erw'};
}
/* Faustregel „weniger Stücke fehlen = größer“, nur für echte Brüche (−1, 0, 1 wie compareFrac). Sie stimmt, wenn gleich viele Stücke fehlen
   (größerer Nenner = kleineres fehlendes Stück = größerer Bruch). Bei verschieden vielen fehlenden Stücken kann sie falsch liegen. */
function fehltRule(a,b,c,d){
  const mA=b-a,mC=d-c;
  return mA===mC?Math.sign(b-d):(mA<mC?1:-1);
}
const fehltConflict=(a,b,c,d)=>a<b&&c<d&&fehltRule(a,b,c,d)!==compareFrac(a,b,c,d);
/* Welche Fehlvorstellung steckt hinter einem falschen Zeichen? kid ist '<', '=' oder '>'; null, wenn es stimmt.
   gleichwertig: die Brüche sind gleich groß (nicht erkannt) · gleichNenner / gleichZahl / gleichAbstand: „=“ wegen gleichem Nenner, Zähler oder gleich vielen fehlenden Stücken ·
   beide: Zähler und Nenner einzeln verglichen · nurZaehler · nurNenner (größerer Nenner = größer) · sign: Zeichen verdreht */
function cmpDiagnose(a,b,c,d,kid){
  const truth=cmpSignOf(compareFrac(a,b,c,d));
  if(kid===truth)return null;
  if(truth==='=')return 'gleichwertig';
  if(kid==='='){
    if(b===d)return 'gleichNenner';
    if(a===c)return 'gleichZahl';
    if(a<b&&c<d&&b-a===d-c)return 'gleichAbstand';
    return 'gleich';
  }
  const sa=cmpSignOf(a-c),sb=cmpSignOf(b-d);
  if(sa===sb&&sa!=='='&&kid===sa)return 'beide';
  if(sa!=='='&&kid===sa)return 'nurZaehler';
  if(sb!=='='&&kid===sb)return 'nurNenner';
  return 'sign';
}
