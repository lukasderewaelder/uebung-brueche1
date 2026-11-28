'use strict';
/* =====================================================================
   Etappe „Bruch mal Bruch, Bruch durch Bruch“ (Thema rechnen, interne Kennung K; Konzeption vom 27.11.2026, Lehrbuch S. 46–53)
   Reine Rechnungen ohne Bildschirm-Elemente.
   Zahl z = {w, a, b}: Bruch a/b (w = 0), gemischte Zahl w a/b, natürliche Zahl a (b = 1). Wert kbV(z) = [w·b + a, b].
   Aufgabe t = {op:'mul'|'div', x, y}. Ergebnis kbRes(t) ungekürzt nach der Regel: mal = Zähler mal Zähler, Nenner mal Nenner;
   durch = mal den Kehrwert der zweiten Zahl. Fehler werden am WERT der Eingabe erkannt (equivalent), nie an der Schreibweise.
   kbPatterns liefert die Fehlermuster (Konzept Kap. 5.1) in fester Reihenfolge; Generatoren schließen Zahlen aus, bei denen ein Muster
   denselben Wert wie die Lösung hätte (kbCollides).
   ===================================================================== */
const kbZ=(a,b,w)=>({w:w||0,a,b:b||1});
const kbV=(z)=>[z.w*z.b+z.a,z.b];
const kbIsMix=(z)=>!!z&&z.w>0&&z.b>1;
const kbKehr=(f)=>[f[1],f[0]];
const kbMulF=(p,q)=>[p[0]*q[0],p[1]*q[1]];
const kbRes=(t)=>{const X=kbV(t.x),Y=kbV(t.y);return t.op==='mul'?kbMulF(X,Y):kbMulF(X,kbKehr(Y));};
const kbSign=(op)=>op==='mul'?'·':':';
/* Text einer Zahl („3/4“, „2 1/2“, „7“; fracText setzt den Bruchstrich) und eines Werts (gekürzt, als gemischte Zahl) */
const kbTxt=(z)=>z.b===1?String(z.a):z.w?z.w+' '+z.a+'/'+z.b:z.a+'/'+z.b;
const kbFT=(f)=>{const [x,y]=simplify(f[0],f[1]);return y===1?String(x):x+'/'+y;};
const kbShow=(f)=>vtShow(f[0],f[1]);
const kbWhole=(f)=>f[0]%f[1]===0;
/* Zahl und Wert als Bildschirm-Knoten */
const kbNode=(z)=>z.b===1?String(z.a):z.w?mixed(z.w,z.a,z.b):frac(z.a,z.b);
const kbFNode=(f)=>{const [x,y]=simplify(f[0],f[1]);return y===1?String(x):x>y?mixed(Math.floor(x/y),x%y,y):frac(x,y);};
/* Ganze und Bruchteil einer Zahl (für „getrennt gerechnet“) */
const kbParts=(z)=>z.b===1?[z.a,[0,1]]:[z.w,[z.a,z.b]];
/* Fehler „Ganze und Bruchteil getrennt“: nur, wenn die zweite Zahl gemischt ist (sonst ist getrennt rechnen richtig) */
function kbGetrennt(t){
  if(!kbIsMix(t.y))return null;
  const [W1,F1]=kbParts(t.x),[W2,F2]=kbParts(t.y);
  if(t.op==='mul'){const p=kbMulF(F1,F2);return [W1*W2*p[1]+p[0],p[1]];}
  if(!F2[0])return null;
  const p=kbMulF(F1,kbKehr(F2));return [W1*p[1]+W2*p[0],W2*p[1]];
}
/* falsche Umwandlungen einer gemischten Zahl (Zähler statt w·b + a) */
const kbBadConv=(z)=>[z.w+z.a,z.w*z.a,z.w*z.b,z.a+z.b].filter((c,i,s)=>c>0&&c!==z.w*z.b+z.a&&s.indexOf(c)===i);
/* Rest auf das Ganze bezogen: 2 : 3/4 → 2 Messstücke, Rest 2 Viertel → 2 + 2/4 statt 2 + 2/3 */
function kbRestBezug(t){
  if(t.op!=='div')return null;
  const X=kbV(t.x),Y=kbV(t.y),L=lcm(X[1],Y[1]),du=X[0]*L/X[1],vu=Y[0]*L/Y[1];
  if(!vu||du%vu===0||du<vu)return null;
  return [Math.floor(du/vu)*L+du%vu,L];
}
/* Fehlermuster [Code, Wert] in der Reihenfolge der Diagnose */
function kbPatterns(t){
  const X=kbV(t.x),Y=kbV(t.y),out=[];
  const g=kbGetrennt(t);if(g)out.push(['gemGetrennt',g]);
  if(t.op==='div'&&kbIsMix(t.y))out.push(['gemKehr',kbMulF(X,[t.y.w*t.y.a+t.y.b,t.y.a])]);
  ['x','y'].forEach(k=>{const z=t[k];if(kbIsMix(z))kbBadConv(z).forEach(c=>out.push(['umwandeln',kbRes(Object.assign({},t,{[k]:{w:0,a:c,b:z.b}}))]));});
  if(t.op==='mul'){
    if(Y[1]===1&&X[1]>1)out.push(['mulGleich',X]);
    if(X[1]===1&&Y[1]>1)out.push(['mulGleich',Y]);
    out.push(['addiert',[X[0]+Y[0],X[1]+Y[1]]]);
    if(X[1]>1&&Y[1]>1){out.push(['nennerBleibt',[X[0]*Y[0],Y[1]]]);out.push(['nennerBleibt',[X[0]*Y[0],X[1]]]);}
    out.push(['kehrFalsch',kbMulF(X,kbKehr(Y))]);
    if(X[1]>1&&Y[1]>1&&X[1]!==Y[1]){const m=lcm(X[1],Y[1]);out.push(['gleichnamigMal',[(X[0]*m/X[1])*(Y[0]*m/Y[1]),m]]);}
  }else{
    if(X[1]===1&&Y[0]===1)out.push(['verteilt',kbMulF(X,Y)]);
    out.push(['keinKehr',kbMulF(X,Y)]);
    out.push(['kehrDividend',kbMulF(kbKehr(X),Y)]);
    out.push(['kehrBeide',kbMulF(kbKehr(X),kbKehr(Y))]);
    const rb=kbRestBezug(t);if(rb)out.push(['restBezug',rb]);
  }
  return out.filter(p=>p[1][1]>0&&p[1][0]>0);
}
/* Kollision: ein Fehlermuster hätte denselben Wert wie die Lösung (dann wäre der Fehler nicht zu erkennen) */
function kbCollides(t){
  const r=kbRes(t);
  if(!(r[0]>0&&r[1]>0))return true;
  return kbPatterns(t).some(p=>equivalent(p[1][0],p[1][1],r[0],r[1]));
}
/* Fehlercode für eine falsche Eingabe p/q, sonst null */
function kbDiagnose(t,p,q){
  if(!(q>0)||p==null)return null;
  const r=kbRes(t);
  if(equivalent(p,q,r[0],r[1]))return null;
  const hit=kbPatterns(t).find(x=>equivalent(p,q,x[1][0],x[1][1]));
  if(hit)return hit[0];
  if(q===r[1]||p===r[0])return 'rechen';
  return null;
}
const KB_DEN={2:'Halben',3:'Drittel',4:'Viertel',5:'Fünftel',6:'Sechstel',7:'Siebtel',8:'Achtel',9:'Neuntel',10:'Zehntel',12:'Zwölftel'};
const kbDenName=(b)=>KB_DEN[b]||vtDenName(b);
/* Rückmeldungen (Konzept Kap. 5.1): was zu tun ist, Sätze höchstens 14 Wörter */
const KB_MSG={
  addiert:()=>'Bei Mal rechnest du Zähler mal Zähler und Nenner mal Nenner.',
  nennerBleibt:()=>'Auch die Nenner werden malgenommen. Denk an das Rechteck.',
  gleichnamigMal:()=>'Bei Mal brauchst du keinen gemeinsamen Nenner.',
  vonDurch:(t)=>'Von heißt mal. Nimm '+kbTxt(t.x)+' von '+kbTxt(t.y)+'.',
  kehrFalsch:()=>'Das ist eine Mal-Aufgabe. Hier tauschst du nichts.',
  kehrDividend:()=>'Kehre nur die Zahl hinter dem Geteiltzeichen um.',
  kehrBeide:()=>'Die erste Zahl bleibt, wie sie ist.',
  keinKehr:()=>'Bei durch brauchst du den Kehrwert der zweiten Zahl.',
  verteilt:(t)=>'Frage: Wie oft passt '+kbTxt(t.y)+' in '+kbTxt(t.x)+'? Zähle die '+kbDenName(t.y.b)+'.',
  restBezug:(t)=>'Der Rest ist ein Teil vom Messstück. Wie viel von '+kbTxt(t.y)+' ist übrig?',
  gemGetrennt:()=>'Getrennt rechnen geht nur bei Plus. Wandle erst um.',
  gemKehr:(t)=>{const Y=kbV(t.y);return 'Wandle '+kbTxt(t.y)+' zuerst in '+Y[0]+'/'+Y[1]+' um. Dann tausche: '+Y[1]+'/'+Y[0]+'.';},
  umwandeln:(t)=>{const z=kbIsMix(t.x)?t.x:t.y;return 'Ein Ganzes sind '+z.b+' '+kbDenName(z.b)+'. Wie viele '+kbDenName(z.b)+' sind '+kbTxt(z)+'?';},
  mulGleich:()=>'Du hast erweitert. Dann bleibt es gleich viel. Schreibe die Zahl als Bruch mit Nenner 1.',
  rechen:()=>'Dein Weg stimmt. Rechne den letzten Schritt noch einmal nach.',
  kleinerErwartet:()=>'Ist die zweite Zahl kleiner als 1? Dann passt sie öfter hinein.',
  operation:()=>'Frage: Ist ein Anteil gesucht? Oder wie oft etwas hineinpasst?',
  durchNull:()=>'Durch 0 kannst du nicht teilen.',
  wert:(t)=>t.op==='mul'?'Das stimmt noch nicht. Rechne Zähler mal Zähler und Nenner mal Nenner.':'Das stimmt noch nicht. Nimm die erste Zahl mal den Kehrwert der zweiten.'
};
const kbMsgOf=(code,t)=>(KB_MSG[code]||KB_MSG.wert)(t);
/* Rechnung als Text für Rückmeldung und Lösung: „2/3 : 3/4 = 2/3 · 4/3 = 8/9.“ (gemischte Zahlen werden erst umgewandelt) */
function kbProofText(t){
  const X=kbV(t.x),Y=kbV(t.y),r=kbRes(t),g=simplify(r[0],r[1]);
  let s=kbTxt(t.x)+' '+kbSign(t.op)+' '+kbTxt(t.y)+' = ';
  if(kbIsMix(t.x)||kbIsMix(t.y)||(t.op==='div'&&(t.x.b===1||t.y.b===1)))s+=X[0]+'/'+X[1]+' '+kbSign(t.op)+' '+Y[0]+'/'+Y[1]+' = ';
  if(t.op==='div')s+=X[0]+'/'+X[1]+' · '+Y[1]+'/'+Y[0]+' = ';
  s+=r[0]+'/'+r[1];
  if(g[0]!==r[0])s+=' = '+(g[1]===1?String(g[0]):g[0]+'/'+g[1]);
  if(g[0]>g[1]&&g[1]>1)s+=' = '+kbShow(g);
  return s+'.';
}
