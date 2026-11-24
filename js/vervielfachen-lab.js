'use strict';
/* =====================================================================
   Labor „Bruch-Maschine“ (NLAB, freiwillig am Anfang der Etappe V; Konzept Kap. 3.2)
   Oben ein Bruch (Nenner 2–6, Zähler wählbar) als Streifen bzw. Rechteck. Knöpfe „· 2“, „· 3“ (Vervielfachen) oder „: 2“, „: 3“ (Teilen).
   Das Bild zeigt sofort das Ergebnis: beim Vervielfachen kommen Stücke dazu, beim Teilen wird jedes Teil feiner geschnitten und ein Anteil
   hervorgehoben. Die Rechnung läuft mit. Ohne Animation (Einstellung „Kleine Animationen: aus“) wechselt das Bild einfach.
   Aufträge: 1 Vervielfache · 2 Teile · 3 Finde eine Aufgabe, bei der ein Ganzes herauskommt. Drei Forscherfragen zum Aufklappen, ohne Bewertung.
   Zustand S.labV = {op, b, a, k (null = noch nicht gerechnet), hist, did:{mul, div, ganz}, done}. Eintrag in LABS (js/lab.js).
   ===================================================================== */
const VLAB_PROMPT={
  mul:'Auftrag 1: Vervielfache. Tippe auf · 2 oder · 3.',
  div:'Auftrag 2: Teile. Wähle oben Teilen und tippe auf : 2 oder : 3.',
  ganz:'Auftrag 3: Finde eine Aufgabe, bei der genau ein Ganzes herauskommt.',
  free:'Auftrag geschafft. Probiere weiter aus – was fällt dir auf?'
};
const VLAB_Q=['Was passiert mit dem Nenner beim Vervielfachen?','Was passiert mit den Teilen beim Teilen?','Findest du eine Aufgabe, bei der ein Ganzes herauskommt?'];
function vlabDefault(){return {op:'mul',b:5,a:2,k:null,hist:[],did:{mul:false,div:false,ganz:false},done:false};}
function vlabState(){
  const L=S.labV;
  const ok=L&&(L.op==='mul'||L.op==='div')&&Number.isInteger(L.b)&&L.b>=2&&L.b<=6&&Number.isInteger(L.a)&&L.a>=1&&L.a<L.b&&(L.k===null||L.k===2||L.k===3)&&L.did&&Array.isArray(L.hist);
  if(!ok)S.labV=vlabDefault();
  return S.labV;
}
const vlabPhase=(L)=>L.done?'free':!L.did.mul?'mul':!L.did.div?'div':'ganz';
function vlabTell(L){
  if(!L.k)return `Das ist ${L.a}/${L.b}. Tippe auf einen Knopf der Maschine.`;
  const r=L.op==='mul'?[L.a*L.k,L.b]:[L.a,L.b*L.k];
  if(L.op==='mul')return `Du nimmst ${L.a}/${L.b} ${L.k}-mal. Es bleiben ${vtDenName(L.b)}, nur ihre Anzahl wächst.`+(r[0]%r[1]===0?' Genau '+(r[0]/r[1])+(r[0]/r[1]===1?' Ganzes!':' Ganze!'):'');
  return `Jedes Teil wird in ${L.k} Stücke geschnitten. Die Teile werden kleiner: Es sind jetzt ${vtDenName(L.b*L.k)}.`;
}
function vlabChain(L){
  if(!L.k)return eq(frac(L.a,L.b),vtSign(L.op),el('span',{class:'blank'},'?'));
  const r=L.op==='mul'?[L.a*L.k,L.b]:[L.a,L.b*L.k],g=simplify(r[0],r[1]);
  const tail=g[0]!==r[0]?['=',g[1]===1?String(g[0]):frac(g[0],g[1])]:[];
  return L.op==='mul'?eq(frac(L.a,L.b),'·',String(L.k),'=',frac(L.a+' · '+L.k,L.b),'=',frac(r[0],r[1]),...tail):eq(frac(L.a,L.b),':',String(L.k),'=',frac(L.a,L.b+' · '+L.k),'=',frac(r[0],r[1]));
}
function vlabFigure(L){
  const box=el('div',{class:'vtfig vlabfig'+(animOn()?' vtpop':'')});
  if(L.op==='mul')box.append(vtStrips(L.a,L.b,L.k||1,{rows:Math.max(1,Math.ceil(L.a*(L.k||1)/L.b))}));
  else box.append(vtRect(L.a,L.b,L.k||1,L.k?new Set(Array.from({length:L.a},(_,i)=>i)):null));
  return box;
}
function renderVLab(){
  const L=vlabState();
  const root=el('div',{class:'page'});root.append(topbar('Bruch-Maschine'));
  const shell=el('div',{class:'shell'}),help=helpPanel('NLAB'),main=el('main',{class:'work lab rlab vlab'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  main.dataset.acc='mix';
  help.setNotes(['M26','M27'].map(n=>el('section',{class:'note','aria-label':'Merkzettel '+n},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  help.setStats(el('div',null,el('h3',null,'Dein Labor'),el('p',null,L.done?'Der Entdeckerauftrag ist geschafft.':'Der Entdeckerauftrag ist noch offen.')));
  const segBtn=(op,label)=>{
    const b=el('button',{type:'button','aria-pressed':String(L.op===op)},label);
    b.addEventListener('click',()=>{if(L.op===op)return;push();L.op=op;L.k=null;persist();sayText(vlabTell(L));draw();});
    return b;
  };
  const bMul=segBtn('mul','Vervielfachen'),bDiv=segBtn('div','Teilen');
  const seg=el('div',{class:'seg labseg',role:'group','aria-label':'Rechenart wählen'},bMul,bDiv);
  const promptEl=el('div',{class:'prompt'}),stage=el('div',{class:'labstage'}),say=el('div',{class:'labsay','aria-live':'polite'});
  const tbPhase=el('span',{class:'tb-c'}),tbMode=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('kolben'),el('span',{class:'tb-name'},'Bruch-Maschine')),tbPhase,tbMode);
  const qs=el('details',{class:'vlabq'},el('summary',null,'Drei Forscherfragen'),el('ol',null,...VLAB_Q.map(q=>el('li',null,q)))); /* zugeklappt: nimmt dem Bild keinen Platz */
  main.append(el('div',{class:'card'},seg,promptEl,stage,say,qs,titleblock));
  const rows={},stepsBox=el('div',{class:'rlabctl',role:'group','aria-label':'Bruch einstellen'});
  const labels={b:'Nenner',a:'Zähler'};
  ['b','a'].forEach(key=>{
    const lbl=el('span',{class:'lbl'},labels[key]),out=el('b',{class:'rv'});
    const mk=(delta,sym)=>{const b=el('button',{type:'button',class:'chip'},sym);b.addEventListener('click',()=>turn(key,delta));return b;};
    const minus=mk(-1,'−'),plus=mk(1,'+');rows[key]={out,minus,plus};
    stepsBox.append(el('div',{class:'rlabrow'},lbl,minus,out,plus));
  });
  const machine=el('div',{class:'introchips vlabkeys',role:'group','aria-label':'Maschine'});
  const ctl=el('div',{class:'labctl'},stepsBox,machine);
  const undoBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('undo')),'Rückgängig');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkzettel');
  main.append(el('div',{class:'actionbar'},ctl,el('div',{class:'primaryrow'},undoBtn,noteBtn)));
  const sayText=(text,kind)=>{say.replaceChildren(text?(kind?el('div',{class:'msg '+kind},...introRich(text)):el('div',{class:'labtext'},...introRich(text))):'');};
  const push=()=>{L.hist.push({op:L.op,b:L.b,a:L.a,k:L.k});if(L.hist.length>40)L.hist.shift();};
  const can=(key,delta)=>{const v=L[key]+delta;return key==='b'?v>=2&&v<=6:v>=1&&v<L.b;};
  function turn(key,delta){
    if(!can(key,delta)){sayText(key==='b'?'Der Nenner liegt hier zwischen 2 und 6.':'Der Zähler bleibt kleiner als der Nenner.','bad');return;}
    push();L[key]+=delta;if(key==='b')L.a=Math.min(L.a,L.b-1);L.k=null;persist();sayText(vlabTell(L));draw();
  }
  function run(k){
    push();L.k=k;
    const ph=vlabPhase(L);
    if(L.op==='mul')L.did.mul=true;else L.did.div=true;
    let fresh=false;
    if(ph==='ganz'&&L.op==='mul'&&(L.a*k)%L.b===0&&L.a*k/L.b===1){L.did.ganz=true;L.done=true;fresh=true;}
    persist();
    if(fresh){sayText('Genau! '+L.a+'/'+L.b+' · '+k+' ist genau ein Ganzes. Der Zähler wird so groß wie der Nenner.','ok');award(15,'Entdeckt!');}
    else sayText(vlabTell(L));
    draw();
  }
  function draw(){
    const ph=vlabPhase(L);
    bMul.setAttribute('aria-pressed',String(L.op==='mul'));bDiv.setAttribute('aria-pressed',String(L.op==='div'));
    promptEl.replaceChildren(el('p',{class:'q'},VLAB_PROMPT[ph]));
    if(ph==='free'){const nb=labNextBtn('NLAB');if(nb)promptEl.append(nb);}
    stage.replaceChildren(vlabFigure(L),el('div',{class:'rlabchain'},vlabChain(L)));
    tbPhase.textContent=ph==='free'?'Frei':'Auftrag '+({mul:1,div:2,ganz:3})[ph]+' von 3';
    tbMode.textContent=L.op==='mul'?'Vervielfachen':'Teilen';
    ['b','a'].forEach(key=>{const r=rows[key];r.out.textContent=String(L[key]);
      [[r.minus,-1,'kleiner'],[r.plus,1,'größer']].forEach(([b,delta,word])=>{const ok=can(key,delta);b.classList.toggle('off',!ok);b.setAttribute('aria-disabled',String(!ok));b.setAttribute('aria-label',labels[key]+' '+word+(ok?'':' – geht nicht'));});});
    machine.replaceChildren(...[2,3].map(k=>{const b=el('button',{type:'button',class:'chip'+(L.op==='mul'?' erw':''),'aria-pressed':String(L.k===k)},(L.op==='mul'?'· ':': ')+k);b.addEventListener('click',()=>run(k));return b;}));
    undoBtn.disabled=!L.hist.length;
    fitPage();
  }
  undoBtn.addEventListener('click',()=>{const h=L.hist.pop();if(!h)return;Object.assign(L,h);persist();sayText('Schritt zurückgenommen.');draw();});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  sayText(vlabTell(L));
  draw();
}
LABS.NLAB={name:'Bruch-Maschine',desc:'Brüche vervielfachen und teilen ausprobieren – mit Streifen und Rechteck.',
  done:()=>!!(S.labV&&S.labV.done),
  started:()=>!!(S.labV&&(S.labV.done||(S.labV.did&&(S.labV.did.mul||S.labV.did.div)))),
  render:()=>renderVLab()};
