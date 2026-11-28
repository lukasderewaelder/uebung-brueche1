'use strict';
/* =====================================================================
   Mathe für „Ungleichnamige Brüche addieren und subtrahieren“ (Thema addsub2, Kürzel H)
   Reine Funktionen ohne Bildschirm (außer den Rückmeldungen als Text). Brüche als [Zähler, Nenner].
   hnOf            Hauptnenner (kleinster gemeinsamer Nenner) mehrerer Nenner
   isCommonDen     Ist N ein gemeinsamer Nenner (alle Nenner gehen ohne Rest auf)?
   trick17Steps    Trick 17 (Hefter S. 5): Vielfache des größten Nenners, je Schritt geprüft
   hnValue         Wert einer Rechnung mit mehreren Brüchen (ungekürzt, auf dem Hauptnenner)
   hnDiagnose      Welcher typische Fehler steckt hinter einem falschen Ergebnis x/y? (Kap. 8.1)
   hnResultCheck   Prüfung des Rechenwegs (Kap. 7.3): gemeinsamer Nenner → erweiterte Zähler → Zwischenschritt → Ergebnis und Kürzen → gemischte Zahl → Hinweis
   denName         Name der Teile: 3 → „Drittel“, 2 → „Halbe“ (für Bild-Aufgaben und Rückmeldungen)
   ===================================================================== */
const hnOf=(...ds)=>ds.reduce((m,x)=>lcm(m,x));
const isCommonDen=(N,...ds)=>Number.isInteger(N)&&N>0&&ds.every(x=>N%x===0);
/* Vielfache des größten Nenners, je Schritt geprüft: [{v:10,ok:[false]},…,{v:40,ok:[true]}] */
function trick17Steps(...ds){
  const g=Math.max(...ds),rest=ds.filter(x=>x!==g),out=[];
  for(let k=1;k<200;k++){const v=g*k,ok=rest.map(x=>v%x===0);out.push({v,ok});if(ok.every(Boolean))return out;}
  return out;
}
/* terms = [[n,d],…], signs = ['+','−',…] (eins weniger) → [Zähler, Hauptnenner], nicht gekürzt */
function hnValue(terms,signs){
  const N=hnOf(...terms.map(t=>t[1]));
  let n=terms[0][0]*N/terms[0][1];
  for(let i=1;i<terms.length;i++)n+=(signs[i-1]==='+'?1:-1)*terms[i][0]*N/terms[i][1];
  return [n,N];
}
const hnSign=(plus)=>plus?'+':'−';
/* Lässt sich jeder Bruch mit dem Nenner N schreiben? (auch für kürzbare Brüche wie 6/8: 9/12 geht, obwohl 8 nicht in 12 aufgeht) */
const hnFits=(N,terms)=>Number.isInteger(N)&&N>0&&terms.every(([a,b])=>(a*N)%b===0);
/* Hauptnenner nach dem Kürzen (der kleinste Nenner, mit dem alle Brüche gehen) */
const hnSmallest=(terms)=>hnOf(...terms.map(([a,b])=>simplify(a,b)[1]));

/* ---------- Namen der Teile ---------- */
const HN_ONES=['','ein','zwei','drei','vier','fünf','sechs','sieben','acht','neun'];
const HN_TEENS={10:'zehn',11:'elf',12:'zwölf',13:'dreizehn',14:'vierzehn',15:'fünfzehn',16:'sechzehn',17:'siebzehn',18:'achtzehn',19:'neunzehn'};
const HN_TENS={2:'zwanzig',3:'dreißig',4:'vierzig',5:'fünfzig',6:'sechzig',7:'siebzig',8:'achtzig',9:'neunzig'};
function hnWord(n){
  if(n<10)return HN_ONES[n];
  if(n<20)return HN_TEENS[n];
  const t=Math.floor(n/10),u=n%10;
  return (u?HN_ONES[u]+'und':'')+HN_TENS[t];
}
const hnCap=(s)=>s.charAt(0).toUpperCase()+s.slice(1);
/* 3 → „Drittel“ (Mehrzahl gleich), 2 → „Halbe“ */
function denName(n){
  const fix={2:'Halbe',3:'Drittel',7:'Siebtel',8:'Achtel'};
  if(fix[n])return fix[n];
  if(n>=100)return 'Hundertstel';
  return hnCap(hnWord(n)+(n<20?'tel':'stel'));
}
/* „Jedes Drittel“, „Jede Hälfte“ */
const denEach=(n)=>n===2?'Jede Hälfte':'Jedes '+denName(n);

/* ---------- Fehlerdiagnose (Kap. 8.1) ----------
   Aufgabe a/b ± c/d, Eingabe x/y (Endergebnis). Reihenfolge: erster Treffer zählt. null, wenn der Wert stimmt. */
function hnDiagnose(a,b,c,d,plus,x,y){
  const res=plus?addFrac(a,b,c,d):subFrac(a,b,c,d);
  if(y>0&&equivalent(x,y,res[0],res[1]))return null;
  const pm=(p,q)=>plus?p+q:p-q,common=y>0&&y%b===0&&y%d===0;
  if(x===pm(a,c)&&y===pm(b,d)&&y>0)return 'komponentenweise';
  if(plus&&x===a*c&&y===b*d)return 'multipliziert';
  if((y===b||y===d)&&x===pm(a,c))return 'nennerBehalten';
  if(common&&x===pm(a,c))return 'zaehlerNichtErweitert';
  if(common&&(x===pm(a*y/b,c)||x===pm(a,c*y/d)))return 'teilweiseErweitert';
  if(y===b*d&&x===pm(a*b,c*d)&&!equivalent(x,y,res[0],res[1]))return 'schmetterlingFalsch';
  const other=plus?subFrac(a,b,c,d):addFrac(a,b,c,d);
  if(y>0&&other[0]>0&&equivalent(x,y,other[0],other[1]))return 'andereRechnung';
  if(common)return 'rechenfehler';
  return 'wert';
}
/* Rückmeldung zum Fehlercode (Sätze höchstens 14 Wörter; Brüche als „a/b“, die Anzeige setzt den Bruchstrich) */
function hnDiagMsg(code,a,b,c,d,plus,x,y){
  const big=compareFrac(a,b,c,d)>=0?[a,b]:[c,d];
  switch(code){
    case 'komponentenweise':
      if(plus)return `Du hast Zähler und Nenner einzeln addiert. ${ft(x,y)} ist kleiner als ${ft(big[0],big[1])}. Zusammen muss es mehr werden.`;
      return compareFrac(x,y,a,b)>0?`Du hast Zähler und Nenner einzeln subtrahiert. Das Ergebnis wäre größer als ${ft(a,b)}. Beim Wegnehmen wird es kleiner.`
        :'Du hast Zähler und Nenner einzeln subtrahiert. Mache die Brüche zuerst gleichnamig.';
    case 'multipliziert':return 'Du hast malgenommen statt addiert. Das Ergebnis muss größer als beide Brüche sein.';
    case 'nennerBehalten':return 'Die Brüche sind noch nicht gleichnamig. Erweitere zuerst beide auf den Hauptnenner.';
    case 'zaehlerNichtErweitert':return 'Der Nenner stimmt. Die Zähler hast du aber nicht erweitert.';
    case 'teilweiseErweitert':return 'Nur ein Bruch ist erweitert. Erweitere beide.';
    case 'schmetterlingFalsch':return 'Beim Schmetterling gehört jeder Zähler zum anderen Nenner.';
    case 'andereRechnung':return `Du hast ${plus?'minus':'plus'} gerechnet. Schau aufs Rechenzeichen.`;
    case 'rechenfehler':return 'Der Nenner stimmt. Prüfe die Zähler noch einmal.';
    default:return 'Das passt nicht. Geh die drei Schritte noch einmal durch.';
  }
}
const HN_DIAG_CODES=['komponentenweise','multipliziert','nennerBehalten','zaehlerNichtErweitert','teilweiseErweitert','schmetterlingFalsch','andereRechnung','rechenfehler','wert'];

/* ---------- Prüfung des Rechenwegs (Kap. 7.3) ----------
   t: {terms:[[n,d],…], signs:[…], res:[Zähler, Hauptnenner]} · d: Entwurf · o: {leicht (Hauptnenner-Feld und Zwischenschritt), givenN (Hauptnenner steht fest),
   smallest (nur der kleinste gemeinsame Nenner zählt, H02), mid (Zwischenschritt, Standard wie leicht), resultOnly (nur Ergebnis und gekürzt), mixed (Feld „gemischte Zahl“)}.
   Entwurf: N (Hauptnenner), e0, e1, … (erweiterte Zähler), e0d, e1d, … (erweiterte Nenner, nur Knifflig), z0, z1, … (Zwischenschritt),
   r.n r.d (Ergebnis), k.n k.d (gekürzt), kn (Kürzen geht nicht), g.w g.n g.d (gemischte Zahl).
   Rückgabe: eine Antwort (invalid, wrong, soft) oder {ok:true, note} (note: Hinweissatz „nichtHauptnenner“ oder null). */
const HN_KMSG_EMPTY='Prüfe noch: Lässt sich das Ergebnis kürzen? Trage den gekürzten Bruch ein oder tippe „Kürzen geht nicht“.';
function hnMixedOf(d){
  const blank=(k)=>d[k]==null||d[k]==='';
  if(blank('g.w')&&blank('g.n')&&blank('g.d'))return null;
  const w=getInt(d,'g.w'),n=getInt(d,'g.n'),q=getInt(d,'g.d');
  return {w,n,d:q,bad:w===null||n===null||q===null||q===0};
}
function hnMixedCheck(res,m){
  if(m.bad)return wrong('gemischtFalsch','Trage bei der gemischten Zahl die Ganzen, den Zähler und den Nenner ein.',{'g.w':false,'g.n':false,'g.d':false});
  const val=[m.w*m.d+m.n,m.d];
  if(!equivalent(val[0],val[1],res[0],res[1]))return wrong('gemischtFalsch','Die gemischte Zahl hat einen anderen Wert. Prüfe die Ganzen.',{'g.w':false,'g.n':false,'g.d':false});
  if(m.n>=m.d||m.n<1)return wrong('gemischtFalsch','Bei der gemischten Zahl ist der Bruchteil kleiner als 1.',{'g.n':false,'g.d':false});
  if(!isFullyReduced(m.n,m.d))return halfOk(res); /* richtig, Bruchteil ungekürzt: halbe Punkte (28.11.2026) */
  return null;
}
function hnResultCheck(t,d,o){
  o=o||{};
  const terms=t.terms,n=terms.length,res=t.res,hn=hnSmallest(terms);
  const badDen=(N)=>{const x=terms.find(([a,b])=>(a*N)%b!==0);return simplify(x[0],x[1])[1];};
  const mid=o.mid!=null?o.mid:!!o.leicht;
  let N=null;
  if(!o.resultOnly){
    /* Rechenweg freiwillig (Lehrer, 28.11.2026): kein Feld „Hauptnenner“ mehr; geprüft wird nur, was ausgefüllt ist.
       Der gemeinsame Nenner kommt aus o.givenN oder aus den eingetragenen Nennern der erweiterten Brüche. */
    const ds=terms.map((_,i)=>getInt(d,'e'+i+'d')),filled=ds.filter(x=>x!==null);
    const mk={};terms.forEach((_,i)=>{if(ds[i]!==null)mk['e'+i+'d']=false;});
    if(o.givenN)N=o.givenN;
    else if(o.nField){ /* H02 „Hauptnenner finden und erweitern“: dort ist das Feld „Hauptnenner“ die Aufgabe selbst */
      N=getInt(d,'N');
      if(N===null)return invalid('Trage zuerst den Hauptnenner ein.');
      if(!hnFits(N,terms))return wrong('keinGemeinsamer',`${badDen(N)} passt nicht ohne Rest in ${N}. Nimm ein Vielfaches.`,{N:false});
      if(o.smallest&&N>hn)return wrong('nichtKleinster',`${N} ist ein gemeinsamer Nenner, aber nicht der kleinste.`,{N:false});
    }
    else if(filled.length){
      if(filled.some(x=>x===0))return invalid(MSG_FRAC_INVALID);
      if(new Set(filled).size>1)return wrong('nichtGleichnamig','Die erweiterten Brüche brauchen denselben Nenner.',mk);
      N=filled[0];
      if(!hnFits(N,terms))return wrong('keinGemeinsamer',`${badDen(N)} passt nicht ohne Rest in ${N}. Nimm ein Vielfaches.`,mk);
      if(o.smallest&&N>hn)return wrong('nichtKleinster',`${N} ist ein gemeinsamer Nenner, aber nicht der kleinste.`,mk);
    }
    if(o.needAll)for(let i=0;i<n;i++)if(getInt(d,'e'+i)===null)return invalid('Trage alle erweiterten Zähler ein.');
    /* Stufe 2: erweiterte Zähler (nur die eingetragenen, und nur wenn der Nenner bekannt ist) */
    if(N)for(let i=0;i<n;i++){
      const [a,b]=terms[i],want=a*N/b,x=getInt(d,'e'+i);
      if(x===null||x===want)continue;
      const m={['e'+i]:false};
      if(x===a&&N!==b)return wrong('erwNurNenner','Beim Erweitern änderst du Zähler und Nenner.',m);
      if(N%b===0)return wrong('erwFalsch',`${a} · ${N/b} = ${want}. Rechne den Zähler mit derselben Zahl.`,m);
      return wrong('erwFalsch',`Kürze ${ft(a,b)} zuerst. Dann erweitere auf ${N}.`,m);
    }
    /* Stufe 3: Zwischenschritt (Leicht), nur wenn ganz ausgefüllt und der Nenner bekannt ist */
    if(mid&&N&&terms.every((_,i)=>getInt(d,'z'+i)!==null)){
      const zs=terms.map((_,i)=>getInt(d,'z'+i));
      const es=terms.map((x,i)=>x[0]*N/x[1]);
      const allPlus=t.signs.every(s=>s==='+');
      const same=allPlus?zs.slice().sort((p,q)=>p-q).join()===es.slice().sort((p,q)=>p-q).join():zs.join()===es.join();
      if(!same){const m={};zs.forEach((_,i)=>{m['z'+i]=false;});return wrong('zwischen','Im Zwischenschritt stehen die erweiterten Zähler, in derselben Reihenfolge.',m);}
    }
    if(o.staged&&d.hw!==true)return invalid('Tippe auf „Weiter“.');
  }
  /* Stufe 4: Ergebnis und Kürzen (wie Block 1, nichts verraten). Wer nur die gemischte Zahl einträgt, bekommt keine Meldung „leer“, wenn sie stimmt. */
  const kid={r:getFrac(d,'r'),k:getFrac(d,'k'),kn:d.kn===true},mx=o.mixed?hnMixedOf(d):null;
  if(!kid.r&&!kid.k&&mx){const g=hnMixedCheck(res,mx);return g||{ok:true,note:hnNote(N,hn)};}
  if(!kid.k&&(d['k.n']!=null&&d['k.n']!==''||d['k.d']!=null&&d['k.d']!==''))return invalid(MSG_FRAC_INVALID);
  const code=kuerzenCheck(res,kid),mr={'r.n':false,'r.d':false},mk={'k.n':false,'k.d':false};
  switch(code){
    case null:case 'halb':break;
    case 'leer':return invalid('Trage das Ergebnis ein: Zähler und Nenner.');
    case 'wert':{
      const f=kid.r||kid.k;
      let msg='Das Ergebnis stimmt noch nicht. Rechne noch einmal.',c='wert';
      if(n===2){const [a,b]=terms[0],[cc,dd]=terms[1],p=t.signs[0]==='+';c=hnDiagnose(a,b,cc,dd,p,f.n,f.d)||'wert';msg=hnDiagMsg(c,a,b,cc,dd,p,f.n,f.d);}
      return wrong(c,msg,kid.r?mr:mk);
    }
    case 'kuerzenWert':return soft('kuerzenWert','Dein Ergebnis stimmt. Der gekürzte Bruch hat aber einen anderen Wert. Teile Zähler und Nenner durch dieselbe Zahl.',mk);
  }
  /* Stufe 5: gemischte Zahl (nur wenn ausgefüllt) */
  if(mx){const g=hnMixedCheck(res,mx);if(g)return g;}
  if(code==='halb')return halfOk(res);
  return {ok:true,note:hnNote(N,hn)};
}
/* Stufe 6: größerer gemeinsamer Nenner ist richtig, bekommt aber einen Hinweis (Entscheidung 2) */
const hnNote=(N,hn)=>N&&N>hn?`Mit dem Hauptnenner ${hn} wäre es kürzer.`:null;
