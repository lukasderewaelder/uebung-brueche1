'use strict';
/* =====================================================================
   Etappe V „Brüche vervielfachen und teilen“ (Thema vervielfachen, Kürzel V; Konzeption Entwurf 1 vom 24.11.2026)
   Reine Rechnungen ohne DOM: Bruch (oder gemischte Zahl) · natürliche Zahl und Bruch : natürliche Zahl.
   Aufgabenkern t = {op:'mul'|'div', w (Ganze, 0 bei einem Bruch), a, b (Bruchteil a/b), n (die Zahl)}.
   Vervielfachen: Zähler · n, der Nenner bleibt. Teilen: Nenner · n, der Zähler bleibt (geht der Zähler glatt auf, darf er geteilt werden).
   Fehler werden über den WERT der Eingabe erkannt (equivalent), nie über die Schreibweise (Konzept Kap. 4).
   Reihenfolge der Muster ist fest; Generatoren schließen Zahlen aus, bei denen ein Muster denselben Wert wie die Lösung hätte.
   ===================================================================== */
const vtVal=(t)=>[t.w*t.b+t.a,t.b];                                   /* Wert der Ausgangszahl als (unechter) Bruch */
const vtRes=(t)=>{const v=vtVal(t);return t.op==='mul'?[v[0]*t.n,v[1]]:[v[0],v[1]*t.n];}; /* Ergebnis ungekürzt, Standardweg */
const vtSign=(op)=>op==='mul'?'·':':';
/* Kollision: Zahlen, bei denen ein Fehlermuster denselben Wert wie die Lösung hätte (z. B. 2/7 · 2: Zähler + 2 = Zähler · 2) */
function vtCollides(t){
  const [A,B]=vtVal(t),n=t.n,r=vtRes(t),same=(p,q)=>q>0&&equivalent(p,q,r[0],r[1]);
  if(n<2)return true;
  if(t.op==='mul')return same(A+n,B)||same(A,B*n);
  return same(A,B+n)||same(A*n,B)||same(A,B*n*n);
}
/* Fehlercode für eine falsche Eingabe x/y (Konzept Kap. 4), oder null */
function vtDiagnose(t,x,y){
  if(!(y>0)||x==null)return null;
  const {op,w,a,b,n}=t,[A,B]=vtVal(t),eqv=(p,q)=>q>0&&equivalent(x,y,p,q);
  if(w){
    if(op==='mul'){
      if(eqv(w*n*b+a,b))return 'gemNurGanze';
      if(eqv(w*b+a*n,b))return 'gemNurBruch';
      for(const z of [w+a,w*b,a+b,w*a+b])if(z!==A&&eqv(z*n,b))return 'gemUmwandeln';
    }else{
      if(eqv(w*b+a*n,b*n)||eqv(a,b)||eqv(a,b*n))return 'gemDivTeil';
      for(const z of [w+a,w*b,a+b,w*a+b])if(z!==A&&eqv(z,b*n))return 'gemUmwandeln';
    }
  }
  if(op==='mul'){
    if(eqv(A,B))return 'mulGleich';
    if(eqv(A,B*n))return 'mulKleiner';
    if(eqv(A+n,B))return 'mulAddiert';
    if(y===B)return 'rechenfehler';
    return null;
  }
  if(eqv(A,B))return 'divGleich';
  if(eqv(A*n,B))return 'divGroesser';
  if(eqv(A,B*n*n))return 'divDoppelt';
  if(eqv(A,B+n))return 'divPlus';
  if(y===B*n||(y===B&&A%n===0))return 'rechenfehler';
  return null;
}
const VT_DEN={2:'Halbe',3:'Drittel',4:'Viertel',5:'Fünftel',6:'Sechstel',7:'Siebtel',8:'Achtel',9:'Neuntel',10:'Zehntel',11:'Elftel',12:'Zwölftel',20:'Zwanzigstel'};
const vtDenName=(b)=>VT_DEN[b]||('Teile mit Nenner '+b); /* „Fünftel“ statt „5tel“ */
const vtMixTxt=(t)=>t.w?t.w+' '+t.a+'/'+t.b:t.a+'/'+t.b;
/* Rückmeldungen: was zu tun ist (Sätze höchstens 14 Wörter) */
const VT_MSG={
  mulGleich:(t)=>`Du hast erweitert. Dann bleibt es gleich viel. Nimm nur den Zähler mal ${t.n}.`,
  mulKleiner:(t)=>`Dein Ergebnis ist kleiner geworden. Du nimmst aber ${t.n}-mal so viel. Der Nenner bleibt gleich.`,
  mulAddiert:(t)=>`Du hast ${t.n} dazugezählt. Nimm ${vtMixTxt(t)} lieber ${t.n}-mal.`,
  divGleich:(t)=>`Du hast gekürzt. Dann bleibt es gleich viel. Rechne den Nenner mal ${t.n}.`,
  divGroesser:(t)=>`Dein Ergebnis ist größer als vorher. Beim Teilen wird es weniger. Rechne den Nenner mal ${t.n}.`,
  divDoppelt:(t)=>`Du hast zweimal geteilt. Teile den Zähler oder rechne den Nenner mal ${t.n}.`,
  divPlus:(t)=>`Du hast ${t.n} zum Nenner addiert. Rechne den Nenner mal ${t.n}.`,
  gemNurGanze:(t)=>`Nimm auch ${t.a}/${t.b} ${t.n}-mal. Rechne dann die Ganzen und den Bruchteil zusammen.`,
  gemNurBruch:(t)=>`Auch die ${t.w} Ganzen musst du ${t.n}-mal nehmen.`,
  gemDivTeil:(t)=>`Teile die ganze Zahl samt Bruchteil. Wandle ${vtMixTxt(t)} zuerst in einen Bruch um.`,
  gemUmwandeln:(t)=>`Prüfe die Umwandlung: ${t.w} Ganze sind ${t.w*t.b}/${t.b}. Dazu kommt ${t.a}/${t.b}.`,
  rechenfehler:(t)=>t.op==='mul'?'Dein Weg stimmt. Rechne die Multiplikation im Zähler noch einmal nach.':'Dein Weg stimmt. Rechne die Multiplikation im Nenner noch einmal nach.',
  wert:(t)=>t.op==='mul'?'Das Ergebnis stimmt noch nicht. Wie oft nimmst du den Anteil?':'Das Ergebnis stimmt noch nicht. Wird es mehr oder weniger als vorher?'
};
const vtMsgOf=(code,t)=>(VT_MSG[code]||VT_MSG.wert)(t);
/* Wert und gemischte Zahl als Text, z. B. „9/4 = 2 1/4“ (fracText setzt den Bruchstrich) */
function vtShow(p,q){
  const [x,y]=simplify(p,q);
  if(y===1)return String(x);
  return x>y?Math.floor(x/y)+' '+(x%y)+'/'+y:x+'/'+y;
}
/* Rechnung als Text für Rückmeldungen und Tipps: „2/7 · 3 = (2 · 3)/7 = 6/7“ (Teilen: „3/5 : 2 = 3/(5 · 2) = 3/10“) */
function vtProofText(t){
  const [A,B]=vtVal(t),r=vtRes(t),g=simplify(r[0],r[1]);
  let s=vtMixTxt(t)+' '+vtSign(t.op)+' '+t.n+' = ';
  if(t.w)s+=A+'/'+B+' '+vtSign(t.op)+' '+t.n+' = ';
  s+=r[0]+'/'+r[1];
  if(g[0]!==r[0])s+=' = '+(g[1]===1?String(g[0]):g[0]+'/'+g[1]);
  if(g[0]>g[1]&&g[1]>1)s+=' = '+vtShow(g[0],g[1]);
  return s+'.';
}
