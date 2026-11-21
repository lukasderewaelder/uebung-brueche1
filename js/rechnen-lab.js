'use strict';
/* =====================================================================
   Bruchlabor Plus und Minus (RLAB): gleichnamige Brüche addieren und subtrahieren ausprobieren
   Auftrag 1: addieren · Auftrag 2: subtrahieren · Auftrag 3: „Was bleibt gleich?“
   Bedienung mit Stellschrauben (− und +) für den Nenner und die beiden Anteile; das Raster (wie an der Tafel, erst getrennt, dann gesammelt)
   und die Rechnung mit Bruchstrich folgen sofort. Ein Ganzes: bei plus ist a + c höchstens d, bei minus ist a der Anfang, c wird weggenommen (Rest mindestens 1).
   Zustand S.labR = {op, d, a, c, hist, did:{plus,minus}, n:{plus,minus}, skip, done}. Eintrag in der Tabelle LABS (js/lab.js).
   ===================================================================== */
const RLAB_MIN=3,RLAB_MAX=16;
const RLAB_START=[[8,3,2],[12,5,4],[10,4,3],[9,2,5],[6,2,3],[15,6,5],[12,7,3],[16,5,8],[5,1,2],[10,3,6]]; /* [d, a, c] mit a + c ≤ d */
const RLAB_QUIZ=[
  {id:'nenner',txt:'Der Nenner'},
  {id:'zaehler',txt:'Der Zähler'},
  {id:'ergebnis',txt:'Das Ergebnis'},
  {id:'felder',txt:'Die Zahl der gefärbten Felder'}
];
const RLAB_WRONG={
  zaehler:'Die Zähler werden gerechnet. Sie ändern sich.',
  ergebnis:'Das Ergebnis ist ein neuer Anteil. Es ändert sich.',
  felder:'Gefärbte Felder kommen dazu oder fallen weg. Das ändert sich.'
};
const RLAB_PROMPT={
  plus:'Auftrag 1: Addiere. Ändere die Anteile mit + und −.',
  minus:'Auftrag 2: Jetzt subtrahieren! Wähle Minus und ändere die Zahlen.',
  quiz:'Auftrag 3: Was bleibt beim Addieren und Subtrahieren gleich?',
  play:'Probiere aus. Bereit für Auftrag 3?',
  free:'Auftrag geschafft. Probiere weiter aus – was fällt dir auf?'
};

/* ---------- Zustand und reine Rechenfunktionen ---------- */
const rlabValid=(op,d,a,c)=>d>=RLAB_MIN&&d<=RLAB_MAX&&(op==='plus'?(a>=1&&c>=1&&a+c<=d):(c>=1&&a>=c+1&&a<=d));
/* Zahlen a, c an einen (neuen) Nenner oder eine neue Rechenart anpassen */
function rlabFit(op,d,a,c){
  if(op==='plus'){a=Math.max(1,Math.min(a,d-1));c=Math.max(1,Math.min(c,d-a));}
  else{a=Math.max(2,Math.min(a,d));c=Math.max(1,Math.min(c,a-1));}
  return [a,c];
}
function rlabDefault(){return {op:'plus',d:8,a:3,c:2,hist:[],did:{plus:false,minus:false},n:{plus:0,minus:0},skip:false,done:false};}
function rlabState(){
  const L=S.labR;
  const ok=L&&(L.op==='plus'||L.op==='minus')&&[L.d,L.a,L.c].every(Number.isInteger)&&rlabValid(L.op,L.d,L.a,L.c)&&L.did&&L.n&&Array.isArray(L.hist)&&L.hist.every(h=>h&&rlabValid(h.op,h.d,h.a,h.c));
  if(!ok)S.labR=rlabDefault();
  return S.labR;
}
/* Welcher Auftrag ist dran? plus, minus, quiz, play (frei vor der Frage), free (alles erledigt) */
const rlabPhase=(L)=>L.done?'free':!L.did.plus?'plus':!L.did.minus?'minus':(L.skip?'play':'quiz');
/* Eine Stellschraube drehen: key 'd', 'a' oder 'c', delta ±1 → {to:{d,a,c}} oder {why} (Satz, warum es nicht geht) */
function rlabTry(L,key,delta){
  const n={d:L.d,a:L.a,c:L.c};
  n[key]+=delta;
  if(key==='d'){
    if(n.d<RLAB_MIN)return {why:'Das Raster hat mindestens '+RLAB_MIN+' Teile.'};
    if(n.d>RLAB_MAX)return {why:'Mehr als '+RLAB_MAX+' Teile passen nicht ins Bild.'};
    const f=rlabFit(L.op,n.d,n.a,n.c);
    return {to:{d:n.d,a:f[0],c:f[1]}};
  }
  if(rlabValid(L.op,n.d,n.a,n.c))return {to:n};
  if(L.op==='plus')return {why:delta>0?'Mehr als ein Ganzes passt hier nicht. Mache zuerst den Nenner größer.':'Ein Anteil hat mindestens 1 Teil.'};
  if(key==='a'&&delta>0)return {why:'Es sind schon alle Teile gefärbt.'};
  if(key==='c'&&delta<0)return {why:'Es wird mindestens 1 Teil weggenommen.'};
  return {why:'Du kannst nicht mehr wegnehmen, als gefärbt ist.'};
}
const rlabResult=(L)=>L.op==='plus'?L.a+L.c:L.a-L.c;
/* Satz zur Rechnung (höchstens 14 Wörter je Satz) */
function rlabTell(L){
  const n=rlabResult(L);
  return L.op==='plus'
    ?`Der Nenner bleibt ${L.d}. Du addierst nur die Zähler: ${L.a} + ${L.c} = ${n}.`+(n===L.d?' Das ganze Raster ist gefärbt.':'')
    :`Der Nenner bleibt ${L.d}. Du subtrahierst nur die Zähler: ${L.a} − ${L.c} = ${n}.`;
}
/* Rechnung mit Bruchstrich: a/d ± c/d = (a ± c)/d = n/d [= gekürzt], bei einem Ganzen = 1 */
function rlabChain(L){
  const plus=L.op==='plus',sg=plus?'+':'−',n=rlabResult(L),g=gcd(n,L.d);
  const tail=n===L.d?['=',el('span',{class:'icn'},'1')]:g>1?['=',frac(n/g,L.d/g)]:[];
  return eq(frac(L.a,L.d),sg,frac(L.c,L.d),'=',frac(L.a+' '+sg+' '+L.c,L.d),'=',frac(n,L.d),...tail);
}
/* Bild: bei plus zwei Anteile getrennt und gesammelt, bei minus alles Gefärbte, das Weggenommene durchgekreuzt */
function rlabFigure(L){
  return L.op==='plus'?addFigure(L.d,L.a,L.c,{mode:'plus',split:true}):addFigure(L.d,L.a-L.c,L.c,{mode:'minus',split:true});
}
const rlabLabels=(op)=>op==='plus'?{d:'Nenner',a:'Erster Anteil',c:'Zweiter Anteil'}:{d:'Nenner',a:'Anfang',c:'Wegnehmen'};

/* ---------- Ansicht ---------- */
function renderRLab(){
  const L=rlabState();
  const root=el('div',{class:'page'});root.append(topbar('Bruchlabor'));
  const shell=el('div',{class:'shell'}),help=helpPanel('RLAB'),main=el('main',{class:'work lab rlab'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  main.dataset.acc='mix';
  help.setNotes(['M17','M18'].map(n=>el('section',{class:'note','aria-label':'Merkkasten '+n},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  help.setStats(el('div',null,el('h3',null,'Dein Labor'),el('p',null,L.done?'Der Entdeckerauftrag ist geschafft.':'Der Entdeckerauftrag ist noch offen.')));

  const segBtn=(op,label)=>{
    const b=el('button',{type:'button','aria-pressed':String(L.op===op)},label);
    b.addEventListener('click',()=>{
      if(L.op===op)return;
      push();L.op=op;const f=rlabFit(op,L.d,L.a,L.c);L.a=f[0];L.c=f[1];persist();sayText(rlabTell(L));draw();
    });
    return b;
  };
  const bPlus=segBtn('plus','Plus'),bMinus=segBtn('minus','Minus');
  const seg=el('div',{class:'seg labseg',role:'group','aria-label':'Rechenart wählen'},bPlus,bMinus);
  const promptEl=el('div',{class:'prompt'});
  const stage=el('div',{class:'labstage'});
  const say=el('div',{class:'labsay','aria-live':'polite'});
  const tbPhase=el('span',{class:'tb-c'}),tbMode=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('kolben'),el('span',{class:'tb-name'},'Bruchlabor')),tbPhase,tbMode);
  main.append(el('div',{class:'card'},seg,promptEl,stage,say,titleblock));

  /* Stellschrauben: einmal gebaut und nur beschriftet, damit der Fokus beim Drehen bleibt */
  const rows={};
  const stepsBox=el('div',{class:'rlabctl',role:'group','aria-label':'Zahlen einstellen'});
  ['d','a','c'].forEach(key=>{
    const lbl=el('span',{class:'lbl'}),out=el('b',{class:'rv'});
    const mk=(delta,sym)=>{const b=el('button',{type:'button',class:'chip'},sym);b.addEventListener('click',()=>turn(key,delta));return b;};
    const minus=mk(-1,'−'),plus=mk(1,'+');
    rows[key]={lbl,out,minus,plus};
    stepsBox.append(el('div',{class:'rlabrow'},lbl,minus,out,plus));
  });
  const quizBox=el('div',{class:'labquiz'});
  const ctl=el('div',{class:'labctl'},stepsBox,quizBox);
  const undoBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('undo')),'Rückgängig');
  const newBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('neu')),'Neue Aufgabe');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  main.append(el('div',{class:'actionbar'},ctl,el('div',{class:'primaryrow'},undoBtn,newBtn,noteBtn)));

  const sayText=(text,kind)=>{say.replaceChildren(text?(kind?el('div',{class:'msg '+kind},text):el('div',{class:'labtext'},text)):null);};
  const push=()=>{L.hist.push({op:L.op,d:L.d,a:L.a,c:L.c});if(L.hist.length>40)L.hist.shift();};
  let quizOrder=null;

  function turn(key,delta){
    if(rlabPhase(L)==='quiz')return;
    const r=rlabTry(L,key,delta);
    if(!r.to){sayText(r.why,'bad');return;}
    push();L.d=r.to.d;L.a=r.to.a;L.c=r.to.c;
    L.n[L.op]++;if(L.n[L.op]>=2)L.did[L.op]=true;
    persist();sayText(rlabTell(L));draw();
  }
  function answer(o,b){
    if(o.id==='nenner'){
      L.done=true;L.skip=false;persist();
      sayText('Genau! Der Nenner bleibt gleich. Nur die Zähler werden gerechnet.','ok');
      draw();award(15,'Entdeckt!');
      return;
    }
    b.disabled=true;b.classList.add('is-wrong');
    b.append(el('span',{class:'mk','aria-hidden':'true'},icon('kreuz')));
    b.setAttribute('aria-label',b.getAttribute('aria-label')+' – falsch');
    sayText(RLAB_WRONG[o.id],'bad');
  }
  function drawQuiz(){
    if(!quizOrder)quizOrder=RNG.shuffle(RLAB_QUIZ);
    const grid=el('div',{class:'tiles',role:'group','aria-label':'Antworten'});
    quizOrder.forEach((o,i)=>{
      const b=el('button',{type:'button',class:'tile tile-txt','aria-label':'Antwort '+Q_LETTERS[i]+': '+o.txt},el('span',{class:'ltr','aria-hidden':'true'},Q_LETTERS[i]),el('span',{class:'tv'},o.txt));
      b.addEventListener('click',()=>answer(o,b));
      grid.append(b);
    });
    quizBox.replaceChildren(grid,el('button',{type:'button',class:'linkbtn',onclick:()=>{L.skip=true;persist();sayText('');draw();}},'Noch einmal ausprobieren'));
  }
  function draw(){
    const ph=rlabPhase(L),lab=rlabLabels(L.op);
    bPlus.setAttribute('aria-pressed',String(L.op==='plus'));
    bMinus.setAttribute('aria-pressed',String(L.op==='minus'));
    promptEl.replaceChildren(el('p',{class:'q'},RLAB_PROMPT[ph]));
    if(ph==='free'){const nb=labNextBtn('RLAB');if(nb)promptEl.append(nb);}
    if(ph==='play')promptEl.append(el('button',{type:'button',class:'btn small',onclick:()=>{L.skip=false;persist();sayText('');draw();}},'Auftrag 3 starten'));
    stage.replaceChildren(rlabFigure(L),el('div',{class:'rlabchain'},rlabChain(L)));
    tbPhase.textContent=ph==='free'?'Frei':'Auftrag '+(ph==='plus'?1:ph==='minus'?2:3)+' von 3';
    tbMode.textContent=L.op==='plus'?'Plus':'Minus';
    ['d','a','c'].forEach(key=>{
      const r=rows[key];
      r.lbl.textContent=lab[key];r.out.textContent=String(L[key]);
      [[r.minus,-1,'kleiner'],[r.plus,1,'größer']].forEach(([b,delta,word])=>{
        const ok=!!rlabTry(L,key,delta).to;
        b.classList.toggle('off',!ok);b.setAttribute('aria-disabled',String(!ok));
        b.setAttribute('aria-label',lab[key]+' '+word+(ok?'':' – geht nicht'));
      });
    });
    undoBtn.disabled=!L.hist.length;
    const quiz=ph==='quiz';
    stepsBox.hidden=quiz;quizBox.hidden=!quiz;
    if(quiz)drawQuiz();
  }

  undoBtn.addEventListener('click',()=>{
    const h=L.hist.pop();if(!h)return;
    L.op=h.op;L.d=h.d;L.a=h.a;L.c=h.c;persist();sayText('Schritt zurückgenommen.');draw();
  });
  newBtn.addEventListener('click',()=>{
    const cur=RLAB_START.filter(s=>!(s[0]===L.d&&(L.op==='plus'?(s[1]===L.a&&s[2]===L.c):(s[1]+s[2]===L.a&&s[2]===L.c))));
    const [d,a,c]=RNG.pick(cur);
    push();L.d=d;L.a=L.op==='plus'?a:a+c;L.c=c;persist();
    sayText('Neue Aufgabe: '+(L.op==='plus'?L.a+' und '+L.c+' von '+L.d+' Teilen.':L.a+' Teile gefärbt, '+L.c+' werden weggenommen.'));draw();
  });
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  draw();
}

LABS.RLAB={name:'Bruchlabor Plus und Minus',desc:'Addieren und Subtrahieren ausprobieren – mit Raster und Rechnung.',
  done:()=>!!(S.labR&&S.labR.done),
  started:()=>!!(S.labR&&(S.labR.done||(S.labR.did&&(S.labR.did.plus||S.labR.did.minus)))),
  render:()=>renderRLab()};
