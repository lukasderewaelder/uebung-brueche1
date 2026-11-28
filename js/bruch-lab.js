'use strict';
/* =====================================================================
   Falt- und Messlabor (KLAB, freiwillig am Anfang der Etappe „Bruch mal Bruch, Bruch durch Bruch“; Konzeption Kap. 3.3)
   Reiter „Falten“: Rechteck, erster Bruch längs (Spalten), zweiter Bruch quer (Zeilen); doppelt gefärbte Felder tragen ein Muster.
   Reiter „Messen“: Streifen der Länge 1, 2 oder 3, ein Messstück (1/2, 1/3, 1/4, 2/3, 3/4), Knopf „Anlegen“, der Rest mit Farbe und Muster.
   Aufträge: 1 Falte einen Anteil vom Anteil · 2 Miss, bis nichts mehr passt · 3 Finde beim Falten genau 1/2. Höchstens 12 Felder.
   Zustand S.labK = {tab, r, s, p, q, n, m, ml, did:{falten, messen, halb}, done, hist}. Eintrag in LABS (js/lab.js).
   ===================================================================== */
const KLAB_PIECES=[[1,2],[1,3],[1,4],[2,3],[3,4]];
const KLAB_PROMPT={
  falten:'Auftrag 1: Falte einen Anteil vom Anteil. Ändere einen der beiden Brüche.',
  messen:'Auftrag 2: Wähle oben Messen. Lege das Messstück an, bis nichts mehr passt.',
  halb:'Auftrag 3: Finde beim Falten ein Ergebnis von genau 1/2.',
  free:'Geschafft! Was fällt dir auf? Wann kommt mehr heraus als vorher?'
};
function klabDefault(){return {tab:'falten',r:2,s:3,p:1,q:2,n:2,m:4,ml:0,did:{falten:false,messen:false,halb:false},done:false,hist:[]};}
function klabState(){
  const L=S.labK,I=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
  const ok=L&&(L.tab==='falten'||L.tab==='messen')&&I(L.s,2,6)&&I(L.r,1,L.s-1)&&I(L.q,2,6)&&I(L.p,1,L.q-1)&&L.s*L.q<=KB_MAXCELLS&&I(L.n,1,3)&&I(L.m,0,KLAB_PIECES.length-1)&&I(L.ml,0,99)&&L.did&&Array.isArray(L.hist);
  if(!ok)S.labK=klabDefault();
  return S.labK;
}
const klabPhase=(L)=>L.done?'free':!L.did.falten?'falten':!L.did.messen?'messen':'halb';
const klabPiece=(L)=>KLAB_PIECES[L.m];
const klabInfo=(L)=>kbMeasureInfo([L.n,1],klabPiece(L));
function renderKLab(){
  const L=klabState();
  const root=el('div',{class:'page'});root.append(topbar('Falt- und Messlabor'));
  const shell=el('div',{class:'shell'}),help=helpPanel('KLAB'),main=el('main',{class:'work lab rlab vlab'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  main.dataset.acc='mix';
  help.setNotes(['M29','M30'].map(n=>el('section',{class:'note','aria-label':'Merkzettel '+n},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  help.setStats(el('div',null,el('h3',null,'Dein Labor'),el('p',null,L.done?'Der Entdeckerauftrag ist geschafft.':'Der Entdeckerauftrag ist noch offen.')));
  const tabBtn=(tab,label)=>{
    const b=el('button',{type:'button','aria-pressed':String(L.tab===tab)},label);
    b.addEventListener('click',()=>{if(L.tab===tab)return;push();L.tab=tab;persist();sayText(tell());draw();});
    return b;
  };
  const bF=tabBtn('falten','Falten'),bM=tabBtn('messen','Messen');
  const seg=el('div',{class:'seg labseg',role:'group','aria-label':'Reiter wählen'},bF,bM);
  const promptEl=el('div',{class:'prompt'}),stage=el('div',{class:'labstage'}),say=el('div',{class:'labsay','aria-live':'polite'});
  const tbPhase=el('span',{class:'tb-c'}),tbMode=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('kolben'),el('span',{class:'tb-name'},'Falt- und Messlabor')),tbPhase,tbMode);
  main.append(el('div',{class:'card'},seg,promptEl,stage,say,titleblock));
  const ctlBox=el('div',{class:'rlabctl',role:'group','aria-label':'Einstellen'});
  const pieceRow=el('div',{class:'introchips klabpieces',role:'group','aria-label':'Messstück wählen'});
  const layRow=el('div',{class:'rowbtns'});
  const ctl=el('div',{class:'labctl'},ctlBox,pieceRow,layRow);
  const undoBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('undo')),'Rückgängig');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkzettel');
  main.append(el('div',{class:'actionbar'},ctl,el('div',{class:'primaryrow'},undoBtn,noteBtn)));
  const sayText=(text,kind)=>{say.replaceChildren(text?(kind?el('div',{class:'msg '+kind},...introRich(text)):el('div',{class:'labtext'},...introRich(text))):'');};
  const push=()=>{L.hist.push({tab:L.tab,r:L.r,s:L.s,p:L.p,q:L.q,n:L.n,m:L.m,ml:L.ml});if(L.hist.length>40)L.hist.shift();};
  function tell(){
    if(L.tab==='falten'){const d=L.p*L.r,all=L.q*L.s;return d+' von '+all+' Feldern sind doppelt gefärbt. Das Ganze ist das ganze Rechteck.';}
    const I=klabInfo(L),[c,dd]=klabPiece(L);
    if(L.ml<I.full)return 'Tippe auf **Anlegen**. Zähle mit, wie oft das Messstück passt.';
    return I.rest?'Das Messstück passt '+I.full+'-mal ganz. Vom Messstück passt noch {'+I.rest+'|'+I.vu+'} hinein.':'Das Messstück passt genau '+I.full+'-mal. Es bleibt nichts übrig.';
  }
  const ROWS={falten:[['s','Nenner längs',2,6],['r','Zähler längs',1,null],['q','Nenner quer',2,6],['p','Zähler quer',1,null]],messen:[['n','Länge (Ganze)',1,3]]};
  const can=(key,delta)=>{
    const v=L[key]+delta;
    if(key==='s')return v>=2&&v<=6&&v*L.q<=KB_MAXCELLS;
    if(key==='q')return v>=2&&v<=6&&v*L.s<=KB_MAXCELLS;
    if(key==='r')return v>=1&&v<L.s;
    if(key==='p')return v>=1&&v<L.q;
    return v>=1&&v<=3&&v*klabPiece(L)[1]<=KB_MAXCELLS;
  };
  function turn(key,delta){
    if(!can(key,delta)){sayText(key==='r'||key==='p'?'Der Zähler bleibt kleiner als der Nenner.':'Höchstens 12 Felder: Dieser Wert geht hier nicht.','bad');return;}
    push();L[key]+=delta;
    if(key==='s')L.r=Math.min(L.r,L.s-1);
    if(key==='q')L.p=Math.min(L.p,L.q-1);
    if(key==='n')L.ml=0;
    if(L.tab==='falten'){L.did.falten=true;if(checkHalf()){draw();return;}}
    persist();sayText(tell());draw();
  }
  function checkHalf(){
    if(L.done||!L.did.falten||!L.did.messen)return;
    if(equivalent(L.p*L.r,L.q*L.s,1,2)){L.did.halb=true;L.done=true;persist();sayText('Genau! {'+L.p+'|'+L.q+'} von {'+L.r+'|'+L.s+'} ist genau {1|2}.','ok');award(15,'Entdeckt!');return true;}
    return false;
  }
  function lay(delta){
    const I=klabInfo(L),v=L.ml+delta;
    if(v<0||v>I.full)return;
    push();L.ml=v;
    if(v===I.full&&!L.did.messen){L.did.messen=true;}
    persist();sayText(tell());draw();
  }
  function draw(){
    const ph=klabPhase(L);
    bF.setAttribute('aria-pressed',String(L.tab==='falten'));bM.setAttribute('aria-pressed',String(L.tab==='messen'));
    promptEl.replaceChildren(el('p',{class:'q'},KLAB_PROMPT[ph]));
    if(ph==='free'){const nb=labNextBtn('KLAB');if(nb)promptEl.append(nb);}
    if(L.tab==='falten'){
      const t=kbT('mul',kbZ(L.p,L.q),kbZ(L.r,L.s)),r=kbRes(t);
      stage.replaceChildren(kbFoldFull(L.r,L.s,L.p,L.q),el('div',{class:'rlabchain'},eq(frac(L.p,L.q),' von ',frac(L.r,L.s),'=',frac(L.p+' · '+L.r,L.q+' · '+L.s),'=',frac(r[0],r[1]),...(gcd(r[0],r[1])>1?['=',kbFNode(r)]:[]))));
    }else{
      const [c,dd]=klabPiece(L),I=klabInfo(L),done=L.ml>=I.full;
      stage.replaceChildren(kbMeasureFig([L.n,1],[c,dd],L.ml),el('div',{class:'rlabchain'},eq(String(L.n),':',frac(c,dd),'=',done?kbFNode(kbRes(kbT('div',kbNat(L.n),kbZ(c,dd)))):el('span',{class:'blank'},'?'))));
    }
    tbPhase.textContent=ph==='free'?'Frei':'Auftrag '+({falten:1,messen:2,halb:3})[ph]+' von 3';
    tbMode.textContent=L.tab==='falten'?'Falten':'Messen';
    ctlBox.replaceChildren(...ROWS[L.tab].map(([key,label])=>{
      const out=el('b',{class:'rv'},String(L[key]));
      const mk=(delta,sym,word)=>{const ok=can(key,delta),b=el('button',{type:'button',class:'chip'+(ok?'':' off'),'aria-disabled':String(!ok),'aria-label':label+' '+word+(ok?'':' – geht nicht')},sym);b.addEventListener('click',()=>turn(key,delta));return b;};
      return el('div',{class:'rlabrow'},el('span',{class:'lbl'},label),mk(-1,'−','kleiner'),out,mk(1,'+','größer'));
    }));
    pieceRow.hidden=L.tab!=='messen';layRow.hidden=L.tab!=='messen';
    if(L.tab==='messen'){
      pieceRow.replaceChildren(el('span',{class:'lbl'},'Messstück'),...KLAB_PIECES.map(([c,dd],i)=>{
        const ok=L.n*dd<=KB_MAXCELLS,b=el('button',{type:'button',class:'chip'+(ok?'':' off'),'aria-pressed':String(L.m===i),'aria-label':'Messstück '+c+' durch '+dd},frac(c,dd));
        b.addEventListener('click',()=>{if(!ok){sayText('Höchstens 12 Felder: Wähle eine kürzere Länge.','bad');return;}push();L.m=i;L.ml=0;persist();sayText(tell());draw();});return b;}));
      const I=klabInfo(L);
      const add=el('button',{type:'button',class:'btn small'},icon('plus'),'Anlegen'),back=el('button',{type:'button',class:'btn small'},icon('undo'),'Zurücknehmen');
      add.disabled=L.ml>=I.full;back.disabled=L.ml<1;
      add.addEventListener('click',()=>lay(1));back.addEventListener('click',()=>lay(-1));
      layRow.replaceChildren(add,back,el('span',{class:'vtcount'},L.ml+(L.ml===1?' Messstück':' Messstücke')));
    }
    undoBtn.disabled=!L.hist.length;
    fitPage();
  }
  undoBtn.addEventListener('click',()=>{const h=L.hist.pop();if(!h)return;Object.assign(L,h);persist();sayText('Schritt zurückgenommen.');draw();});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  sayText(tell());
  draw();
}
LABS.KLAB={name:'Falt- und Messlabor',desc:'Anteile falten und messen, wie oft ein Stück passt.',
  done:()=>!!(S.labK&&S.labK.done),
  started:()=>!!(S.labK&&(S.labK.done||(S.labK.did&&(S.labK.did.falten||S.labK.did.messen)))),
  render:()=>renderKLab()};

/* ---------- Abzeichen für Lernhandlungen (Konzeption Kap. 8) ----------
   Spuren in S.kb (nur nach „richtig“, js/bruch.js): rest (Rest richtig gedeutet), schaetz (Überschlag), vorhersage (Größer oder kleiner? ohne Fehlversuch), fix (verbessert) */
(function(){
  const m=typeof moduleById==='function'?moduleById('rechnen'):null;
  if(!m)return;
  const plusIds=['K07','K08','K09','K10'];
  const tried=()=>plusIds.some(id=>[1,2].some(l=>{const p=S.progress&&S.progress[keyOf(id,l)],r=S.rounds&&S.rounds[keyOf(id,l)];return !!(p&&(p.done||p.first||p.later))||!!(r&&Array.isArray(r.results)&&r.results.length);}));
  m.badges=()=>{
    const v=S.kb&&typeof S.kb==='object'?S.kb:{},rest=Math.min(3,v.rest|0),sch=Math.min(5,v.schaetz|0),vor=Math.min(3,v.vorhersage|0),fix=Math.min(3,v.fix|0),plus=tried()?1:0;
    return [
      {mod:m.id,grp:'k-rest',label:'Rest-Detektiv',icon:'lupe',have:rest>=3,n:rest,of:3,say:'Du weißt, wozu der Rest gehört!'},
      {mod:m.id,grp:'k-schaetz',label:'Gut geschätzt',icon:'auge',have:sch>=5,n:sch,of:5,say:'Erst überschlagen, dann rechnen. Klug!'},
      {mod:m.id,grp:'k-vorhersage',label:'Vorhersage-Profi',icon:'gluehbirne',have:vor>=3,n:vor,of:3,say:'Du siehst das Ergebnis schon vorher.'},
      {mod:m.id,grp:'k-fix',label:'Selbst korrigiert',icon:'undo',have:fix>=3,n:fix,of:3,say:'Aus Fehlern gelernt. Stark!'},
      {mod:m.id,grp:'k-plus',label:'Plus probiert',icon:'zirkel',have:plus>=1,n:plus,of:1,say:'Du hast dich an eine Knobelstation gewagt.'}
    ];
  };
})();
