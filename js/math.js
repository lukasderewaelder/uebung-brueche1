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
   Ergebnisse sind nicht gekürzt – gekürzt wird mit simplify(). Noch in keiner Aufgabe verwendet, nur getestet. */
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
