'use strict';
/* =====================================================================
   Bruchlabor „Gemeinsame Teilung“ (HLAB, freiwillig am Anfang des Themas addsub2; Konzept Kap. 10)
   Ziel: die Idee „gleich einteilen“ selbst entdecken, bevor die Regel kommt (MSK-F 2.1 a).
   Bedienung: Stellschrauben (− und +) für Nenner 1 (2–6), Zähler 1, Nenner 2 (2–6), Zähler 2 und die Rechenart;
   Knöpfe „Teilung übertragen“ und „Zusammenschieben“. Die Rechnung mit Bruchstrich folgt sofort.
   Aufträge: 1 Passt das? (zusammenschieben ohne Übertragen) · 2 Gleich einteilen (plus) · 3 Wegnehmen (minus) ·
             4 Wie viele Felder? (Frage zum Antippen: b · d, „Nenner mal Nenner!“) · 5 Frei (bei nicht teilerfremden Nennern ein Satz zum Hauptnenner)
   Zustand S.labH = {op, b, a, d, c, step (0 getrennt, 1 übertragen, 2 zusammen), hist, did:{schief, plus, minus}, skip, done}. Eintrag in LABS (js/lab.js).
   ===================================================================== */
const HLAB_MIN=2,HLAB_MAX=6;
const HLAB_PROMPT={
  schief:'Auftrag 1: Passt das? Tippe gleich auf Zusammenschieben.',
  plus:'Auftrag 2: Gleich einteilen. Übertrage die Teilung, dann schiebe zusammen.',
  minus:'Auftrag 3: Wegnehmen. Wähle Minus, übertrage und schiebe zusammen.',
  quiz:'Auftrag 4: Wie viele Felder hat das gemeinsame Raster?',
  play:'Probiere aus. Bereit für Auftrag 4?',
  free:'Auftrag geschafft. Probiere weiter aus – was fällt dir auf?'
};
function hlabDefault(){return {op:'plus',b:3,a:1,d:2,c:1,step:0,hist:[],did:{schief:false,plus:false,minus:false},skip:false,done:false};}
const hlabValid=(L)=>[L.b,L.a,L.d,L.c].every(Number.isInteger)&&L.b>=HLAB_MIN&&L.b<=HLAB_MAX&&L.d>=HLAB_MIN&&L.d<=HLAB_MAX&&L.a>=1&&L.a<L.b&&L.c>=1&&L.c<L.d
  &&(L.op==='plus'?L.a*L.d+L.c*L.b<=L.b*L.d:L.a*L.d>L.c*L.b);
function hlabState(){
  const L=S.labH;
  const ok=L&&(L.op==='plus'||L.op==='minus')&&hlabValid(L)&&[0,1,2].includes(L.step)&&L.did&&Array.isArray(L.hist);
  if(!ok)S.labH=hlabDefault();
  return S.labH;
}
const hlabPhase=(L)=>L.done?'free':!L.did.schief?'schief':!L.did.plus?'plus':!L.did.minus?'minus':(L.skip?'play':'quiz');
/* Stellschraube drehen: key 'b','a','d','c', delta ±1 → {to} oder {why} */
function hlabTry(L,key,delta){
  const n={op:L.op,b:L.b,a:L.a,d:L.d,c:L.c};n[key]+=delta;
  if((key==='b'||key==='d')&&(n[key]<HLAB_MIN||n[key]>HLAB_MAX))return {why:`Der Nenner liegt hier zwischen ${HLAB_MIN} und ${HLAB_MAX}.`};
  if(key==='b')n.a=Math.min(n.a,n.b-1);
  if(key==='d')n.c=Math.min(n.c,n.d-1);
  if(n.a<1||n.c<1)return {why:'Ein Anteil hat mindestens 1 Teil.'};
  if(n.a>=n.b||n.c>=n.d)return {why:'Der Zähler bleibt kleiner als der Nenner.'};
  if(!hlabValid(n))return {why:L.op==='plus'?'Mehr als ein Ganzes passt hier nicht.':'Der erste Bruch muss größer sein als der zweite.'};
  return {to:n};
}
/* Satz zur Rechnung, wenn die Teilung übertragen ist */
function hlabTell(L){
  const N=L.b*L.d,x=L.a*L.d,y=L.c*L.b,plus=L.op==='plus';
  if(L.step===0)return `Das erste Rechteck hat ${L.b} Streifen, das zweite ${L.d}. Die Felder sind verschieden groß.`;
  const s=`Jetzt hat jedes Rechteck ${N} gleich große Felder.`;
  if(L.step===1)return s;
  return s+` Du ${plus?'addierst':'subtrahierst'} nur die Zähler.`+(gcd(L.b,L.d)>1?' Es geht auch mit weniger Feldern. Mehr dazu bei **Hauptnenner**.':'');
}
function hlabChain(L){
  const N=L.b*L.d,x=L.a*L.d,y=L.c*L.b,plus=L.op==='plus',sg=plus?'+':'−',n=plus?x+y:x-y,g=gcd(n,N);
  if(L.step<2)return eq(frac(L.a,L.b),sg,frac(L.c,L.d),'=',el('span',{class:'blank'},'?'));
  return eq(frac(L.a,L.b),sg,frac(L.c,L.d),'=',frac(x,N),sg,frac(y,N),'=',frac(n,N),...(g>1?['=',frac(n/g,N/g)]:[]));
}
/* Bild: getrennt, übertragen oder zusammen; „schief“: ohne Übertragen zusammengeschoben (die Felder passen nicht aufeinander) */
function hlabFigure(L,schief){
  if(schief){
    const r1=hnRect(1,L.b,(r,c)=>c<L.a?{on:true}:null,{mw:7,label:'erstes Rechteck, senkrecht geteilt'});
    const r2=hnRect(L.d,1,(r)=>r<L.c?{on2:true}:null,{mw:7,label:'zweites Rechteck, waagerecht geteilt, schief darübergeschoben'});
    return el('div',{class:'hnfig addfig'},el('div',{class:'hnschief',role:'img','aria-label':'Zwei Rechtecke schief übereinander: Die Felder passen nicht aufeinander'},r1,r2),el('small',{class:'acap'},'ohne Übertragen: Die Felder passen nicht'));
  }
  return crossFigure({b:L.b,a:L.a,d:L.d,c:L.c,stage:L.step+1,mode:L.op});
}
const hlabLabels={b:'Nenner 1',a:'Zähler 1',d:'Nenner 2',c:'Zähler 2'};

function renderHLab(){
  const L=hlabState();
  const root=el('div',{class:'page'});root.append(topbar('Bruchlabor'));
  const shell=el('div',{class:'shell'}),help=helpPanel('HLAB'),main=el('main',{class:'work lab rlab hlab'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  main.dataset.acc='mix';
  help.setNotes(['M20','M19'].map(n=>el('section',{class:'note','aria-label':'Merkkasten '+n},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  help.setStats(el('div',null,el('h3',null,'Dein Labor'),el('p',null,L.done?'Der Entdeckerauftrag ist geschafft.':'Der Entdeckerauftrag ist noch offen.')));
  const segBtn=(op,label)=>{
    const b=el('button',{type:'button','aria-pressed':String(L.op===op)},label);
    b.addEventListener('click',()=>{
      if(L.op===op)return;
      const n=Object.assign({},L,{op});
      if(!hlabValid(n)){if(op==='plus'){n.a=1;n.c=1;}else{n.a=n.b-1;n.c=1;}}
      if(!hlabValid(n)){sayText('Mit diesen Zahlen geht das nicht. Ändere zuerst die Zähler.','bad');return;}
      push();Object.assign(L,{op,a:n.a,c:n.c,step:0});persist();sayText('');draw();
    });
    return b;
  };
  const bPlus=segBtn('plus','Plus'),bMinus=segBtn('minus','Minus');
  const seg=el('div',{class:'seg labseg',role:'group','aria-label':'Rechenart wählen'},bPlus,bMinus);
  const promptEl=el('div',{class:'prompt'}),stage=el('div',{class:'labstage'}),say=el('div',{class:'labsay','aria-live':'polite'});
  const tbPhase=el('span',{class:'tb-c'}),tbMode=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('kolben'),el('span',{class:'tb-name'},'Bruchlabor')),tbPhase,tbMode);
  main.append(el('div',{class:'card'},seg,promptEl,stage,say,titleblock));
  const rows={},stepsBox=el('div',{class:'rlabctl',role:'group','aria-label':'Zahlen einstellen'});
  ['b','a','d','c'].forEach(key=>{
    const lbl=el('span',{class:'lbl'},hlabLabels[key]),out=el('b',{class:'rv'});
    const mk=(delta,sym)=>{const b=el('button',{type:'button',class:'chip'},sym);b.addEventListener('click',()=>turn(key,delta));return b;};
    const minus=mk(-1,'−'),plus=mk(1,'+');rows[key]={out,minus,plus};
    stepsBox.append(el('div',{class:'rlabrow'},lbl,minus,out,plus));
  });
  const trBtn=el('button',{type:'button',class:'btn small'},'Teilung übertragen');
  const pushBtn=el('button',{type:'button',class:'btn small'},'Zusammenschieben');
  const quizBox=el('div',{class:'labquiz'});
  const ctl=el('div',{class:'labctl'},stepsBox,el('div',{class:'rowbtns'},trBtn,pushBtn),quizBox);
  const undoBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('undo')),'Rückgängig');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  main.append(el('div',{class:'actionbar'},ctl,el('div',{class:'primaryrow'},undoBtn,noteBtn)));
  const sayText=(text,kind)=>{say.replaceChildren(text?(kind?el('div',{class:'msg '+kind},...introRich(text)):el('div',{class:'labtext'},...introRich(text))):'');};
  const push=()=>{L.hist.push({op:L.op,b:L.b,a:L.a,d:L.d,c:L.c,step:L.step});if(L.hist.length>40)L.hist.shift();};
  let schief=false,quizOrder=null;
  function turn(key,delta){
    if(hlabPhase(L)==='quiz')return;
    const r=hlabTry(L,key,delta);
    if(!r.to){sayText(r.why,'bad');return;}
    push();Object.assign(L,{b:r.to.b,a:r.to.a,d:r.to.d,c:r.to.c,step:0});schief=false;persist();sayText(hlabTell(L));draw();
  }
  trBtn.addEventListener('click',()=>{if(hlabPhase(L)==='quiz'||L.step>=1)return;push();L.step=1;schief=false;persist();sayText(hlabTell(L));draw();});
  pushBtn.addEventListener('click',()=>{
    if(hlabPhase(L)==='quiz')return;
    if(L.step===0){schief=true;L.did.schief=true;persist();sayText('Die Felder sind verschieden groß. So kannst du nicht zählen.','bad');draw();return;}
    push();L.step=2;schief=false;
    if(hlabPhase(L)==='plus'&&L.op==='plus')L.did.plus=true;
    else if(hlabPhase(L)==='minus'&&L.op==='minus')L.did.minus=true;
    persist();sayText(hlabTell(L));draw();
  });
  function answer(o,b){
    if(o.id==='prod'){L.done=true;L.skip=false;persist();sayText('Genau! Das gemeinsame Raster hat Nenner 1 mal Nenner 2 Felder.','ok');draw();award(15,'Entdeckt!');return;}
    b.disabled=true;b.classList.add('is-wrong');b.append(el('span',{class:'mk','aria-hidden':'true'},icon('kreuz')));
    sayText(o.id==='sum'?'Zähle die Felder: Jede Spalte hat so viele Felder, wie der andere Nenner sagt.':'Im gemeinsamen Raster sind die Felder feiner als in beiden Rechtecken.','bad');
  }
  function drawQuiz(){
    const opts=[{id:'sum',txt:'Nenner 1 plus Nenner 2'},{id:'prod',txt:'Nenner 1 mal Nenner 2'},{id:'max',txt:'So viele wie der größere Nenner'}];
    if(!quizOrder)quizOrder=RNG.shuffle(opts);
    const grid=el('div',{class:'tiles',role:'group','aria-label':'Antworten'});
    quizOrder.forEach((o,i)=>{const b=el('button',{type:'button',class:'tile tile-txt','aria-label':'Antwort '+Q_LETTERS[i]+': '+o.txt},el('span',{class:'ltr','aria-hidden':'true'},Q_LETTERS[i]),el('span',{class:'tv'},o.txt));b.addEventListener('click',()=>answer(o,b));grid.append(b);});
    quizBox.replaceChildren(grid,el('button',{type:'button',class:'linkbtn',onclick:()=>{L.skip=true;persist();sayText('');draw();}},'Noch einmal ausprobieren'));
  }
  function draw(){
    const ph=hlabPhase(L);
    bPlus.setAttribute('aria-pressed',String(L.op==='plus'));bMinus.setAttribute('aria-pressed',String(L.op==='minus'));
    promptEl.replaceChildren(el('p',{class:'q'},HLAB_PROMPT[ph]));
    if(ph==='play')promptEl.append(el('button',{type:'button',class:'btn small',onclick:()=>{L.skip=false;persist();sayText('');draw();}},'Auftrag 4 starten'));
    if(ph==='free'){const nb=labNextBtn('HLAB');if(nb)promptEl.append(nb);}
    stage.replaceChildren(hlabFigure(L,schief),el('div',{class:'rlabchain'},hlabChain(L)));
    tbPhase.textContent=ph==='free'?'Frei':'Auftrag '+({schief:1,plus:2,minus:3,quiz:4,play:4})[ph]+' von 4';
    tbMode.textContent=L.op==='plus'?'Plus':'Minus';
    ['b','a','d','c'].forEach(key=>{const r=rows[key];r.out.textContent=String(L[key]);
      [[r.minus,-1,'kleiner'],[r.plus,1,'größer']].forEach(([b,delta,word])=>{const ok=!!hlabTry(L,key,delta).to;b.classList.toggle('off',!ok);b.setAttribute('aria-disabled',String(!ok));b.setAttribute('aria-label',hlabLabels[key]+' '+word+(ok?'':' – geht nicht'));});});
    trBtn.disabled=L.step>=1;pushBtn.disabled=L.step>=2;
    undoBtn.disabled=!L.hist.length;
    const quiz=ph==='quiz';stepsBox.hidden=quiz;trBtn.parentNode.hidden=quiz;quizBox.hidden=!quiz;
    if(quiz)drawQuiz();
    fitPage();
  }
  undoBtn.addEventListener('click',()=>{const h=L.hist.pop();if(!h)return;Object.assign(L,h);schief=false;persist();sayText('Schritt zurückgenommen.');draw();});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  draw();
}
LABS.HLAB={name:'Bruchlabor Gemeinsame Teilung',desc:'Teilungen übertragen und Brüche zusammenfügen.',
  done:()=>!!(S.labH&&S.labH.done),
  started:()=>!!(S.labH&&(S.labH.done||(S.labH.did&&(S.labH.did.schief||S.labH.did.plus)))),
  render:()=>renderHLab()};
