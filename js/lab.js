'use strict';
/* =====================================================================
   Bruchlabor: Erweitern und Kürzen ausprobieren (Streifen oder Kreis)
   Auftrag 1: erweitern · Auftrag 2: kürzen · Auftrag 3: „Was bleibt gleich?“
   ===================================================================== */
const LAB_MAX=48;
const LAB_FACTORS=[2,3,4,5];
const LAB_START=[[2,3],[1,2],[3,4],[3,5],[5,6],[1,3],[2,5],[4,5],[3,8],[5,8],[1,4],[7,8],[6,9],[8,12],[10,15],[4,6],[9,12],[6,8]];
const LAB_QUIZ=[
  {id:'wert',txt:'Der gefärbte Anteil'},
  {id:'zaehler',txt:'Der Zähler'},
  {id:'nenner',txt:'Der Nenner'},
  {id:'teile',txt:'Die Zahl der Teile'}
];
const LAB_WRONG={
  zaehler:'Der Zähler ändert sich: Er wird mit multipliziert oder geteilt.',
  nenner:'Auch der Nenner ändert sich. Zähler und Nenner rechnen immer mit.',
  teile:'Die Zahl der Teile ist der Nenner – und der ändert sich.'
};
const LAB_PROMPT={
  x:'Auftrag 1: Erweitere den Bruch. Tippe unten ein ×.',
  d:'Auftrag 2: Jetzt kürzen! Tippe unten ein ÷.',
  quiz:'Auftrag 3: Was bleibt beim Erweitern und Kürzen gleich?',
  play:'Probiere aus. Bereit für Auftrag 3?',
  free:'Auftrag geschafft. Probiere weiter aus – was fällt dir auf?'
};

/* ---------- Zustand (S.lab) und reine Rechenfunktionen ---------- */
const labOkFrac=(f)=>Array.isArray(f)&&f.length===2&&f.every(x=>Number.isInteger(x)&&x>=1)&&f[1]>f[0]&&f[1]<=LAB_MAX;
function labDefault(){return {mode:'strip',base:[2,3],cur:[2,3],hist:[],last:null,did:{x:false,d:false},skip:false,done:false};}
function labState(){
  const L=S.lab;
  const ok=L&&labOkFrac(L.cur)&&labOkFrac(L.base)&&equivalent(L.base[0],L.base[1],L.cur[0],L.cur[1])&&L.did&&Array.isArray(L.hist)&&L.hist.every(h=>h&&labOkFrac(h.cur));
  if(!ok)S.lab=labDefault();
  if(S.lab.mode!=='circle')S.lab.mode='strip';
  return S.lab;
}
/* Geht „×k“ (höchstens 48 Teile) bzw. „÷k“ (beide Zahlen teilbar)? */
const labCan=(cur,op,k)=>op==='x'?cur[1]*k<=LAB_MAX:(cur[0]%k===0&&cur[1]%k===0);
const labStep=(cur,op,k)=>op==='x'?[cur[0]*k,cur[1]*k]:[cur[0]/k,cur[1]/k];
/* Welcher Auftrag ist dran? x = erweitern, d = kürzen, quiz = Frage, play = frei vor der Frage, free = alles erledigt */
function labPhase(L){
  if(L.done)return 'free';
  if(!L.did.x)return 'x';
  if(!L.did.d)return 'd';
  return L.skip?'play':'quiz';
}
function labTell(from,to,op,k){
  const sym=op==='x'?' · ':' : ';
  let t=(op==='x'?'Zähler und Nenner mal ':'Zähler und Nenner durch ')+k+': '+from[0]+sym+k+' = '+to[0]+' und '+from[1]+sym+k+' = '+to[1]+'. Der gefärbte Anteil bleibt gleich.';
  if(op==='d'&&isFullyReduced(to[0],to[1]))t+=' Weiter kürzen geht nicht mehr.';
  return t;
}
function labWhy(cur,op,k){
  if(op==='x')return 'Mit '+k+' entstünden '+cur[1]*k+' Teile. Mehr als '+LAB_MAX+' passen nicht ins Bild.';
  return 'Mit '+k+' geht das nicht: '+cur[0]+' und '+cur[1]+' sind nicht beide durch '+k+' teilbar.'+(k===2?' Die 2 geht IMMER, wenn beide gerade sind.':'');
}

/* ---------- Zeichnung: Ausgang und Jetzt, Maßlinien, Mittellinie ---------- */
function labFigure(L){
  const [bn,bd]=L.base,[cn,cd]=L.cur;
  const wrap=el('div',{class:'labfig '+L.mode,role:'img','aria-label':`Ausgang: ${bn} von ${bd} Teilen gefärbt. Jetzt: ${cn} von ${cd} Teilen gefärbt. Der gefärbte Anteil ist gleich groß.`});
  const nowCls=L.last?(L.last.op==='x'?'erw':'kue'):'';
  const dim=(n,d)=>dimCap(n+' von '+d+(L.mode==='circle'?'':' gefärbt'));
  if(L.mode==='circle'){
    const cell=(cap,n,d,cls)=>{
      const svg=drawFractionCircle(n,d,{maxW:132,label:n+' von '+d});
      const a=-Math.PI/2+2*Math.PI*n/d;
      svg.append(S_('line',{x1:102,y1:102,x2:(102+98*Math.cos(a)).toFixed(2),y2:(102+98*Math.sin(a)).toFixed(2),class:'labcut'}));
      return el('div',{class:'labcell fig '+cls},el('span',{class:'labcap'},cap),el('div',{class:'labfr'},frac(n,d)),svg,dim(n,d));
    };
    wrap.append(cell('Ausgang',bn,bd,''),cell('Jetzt',cn,cd,nowCls));
  }else{
    wrap.style.setProperty('--pos',((1+360*bn/bd)/362).toFixed(5));
    const row=(cap,n,d,cls)=>el('div',{class:'labrow fig '+cls},
      el('div',{class:'labside'},el('span',{class:'labcap'},cap),frac(n,d)),
      el('div',{class:'labcol'},drawFractionStrip(n,d,{maxW:2000,label:n+' von '+d}),dim(n,d)));
    wrap.append(row('Ausgang',bn,bd,''),row('Jetzt',cn,cd,nowCls),el('i',{class:'labmid','aria-hidden':'true'}));
  }
  return wrap;
}

/* Knopf „Im Labor ausprobieren“ für die Merkkästen */
function labLink(){
  return el('button',{type:'button',class:'btn labbtn',onclick:()=>go({kind:'lab'})},icon('kolben'),'Im Labor ausprobieren');
}

function renderLab(){
  const L=labState();
  const root=el('div',{class:'page'});root.append(topbar('Bruchlabor'));
  const shell=el('div',{class:'shell'}),help=helpPanel('LAB'),main=el('main',{class:'work lab'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  main.dataset.acc='mix';
  help.setNotes(['M1','M2','M3'].map(n=>el('section',{class:'note','aria-label':'Merkkasten '+n},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  help.setStats(el('div',null,el('h3',null,'Dein Labor'),el('p',null,L.done?'Der Entdeckerauftrag ist geschafft.':'Der Entdeckerauftrag ist noch offen.')));

  const segBtn=(mode,label)=>{
    const b=el('button',{type:'button','aria-pressed':String(L.mode===mode)},label);
    b.addEventListener('click',()=>{L.mode=mode;persist();draw();});
    return b;
  };
  const bStrip=segBtn('strip','Streifen'),bCircle=segBtn('circle','Kreis');
  const seg=el('div',{class:'seg labseg',role:'group','aria-label':'Darstellung wählen'},bStrip,bCircle);
  const promptEl=el('div',{class:'prompt'});
  const stage=el('div',{class:'labstage'});
  const say=el('div',{class:'labsay','aria-live':'polite'});
  const tbPhase=el('span',{class:'tb-c'}),tbMode=el('span',{class:'tb-c'});
  const titleblock=el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('kolben'),el('span',{class:'tb-name'},'Bruchlabor')),tbPhase,tbMode);
  main.append(el('div',{class:'card'},seg,promptEl,stage,say,titleblock));

  const ctl=el('div',{class:'labctl'});
  const undoBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('undo')),'Rückgängig');
  const newBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('neu')),'Neuer Bruch');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  main.append(el('div',{class:'actionbar'},ctl,el('div',{class:'primaryrow'},undoBtn,newBtn,noteBtn)));

  const sayText=(text,kind)=>{
    say.replaceChildren(text?(kind?el('div',{class:'msg '+kind},text):el('div',{class:'labtext'},text)):null);
  };
  let quizOrder=null;

  const act=(op,k)=>{
    if(labPhase(L)==='quiz')return;
    if(!labCan(L.cur,op,k)){sayText(labWhy(L.cur,op,k),'bad');return;}
    const from=L.cur.slice();
    L.hist.push({cur:from,last:L.last});if(L.hist.length>40)L.hist.shift();
    L.cur=labStep(L.cur,op,k);L.last={op,k};L.did[op]=true;persist();
    sayText(labTell(from,L.cur,op,k));draw();
  };
  const answer=(o,b)=>{
    if(o.id==='wert'){
      L.done=true;L.skip=false;persist();
      sayText('Genau! Der gefärbte Anteil bleibt gleich – nur die Einteilung wird feiner oder gröber.','ok');
      draw();award(15,'Entdeckt!');
      return;
    }
    b.disabled=true;b.classList.add('is-wrong');
    b.append(el('span',{class:'mk','aria-hidden':'true'},icon('kreuz')));
    b.setAttribute('aria-label',b.getAttribute('aria-label')+' – falsch');
    sayText(LAB_WRONG[o.id],'bad');
  };
  const chipRows=()=>{
    const box=el('div',{class:'labops'});
    ['x','d'].forEach(op=>{
      const name=op==='x'?'Erweitern':'Kürzen';
      const row=el('div',{class:'labchips','data-op':op,role:'group','aria-label':name},el('span',{class:'lbl'},icon(op==='x'?'aus':'ein'),el('span',{class:'lt'},name)));
      LAB_FACTORS.forEach(k=>{
        const ok=labCan(L.cur,op,k);
        const b=el('button',{type:'button',class:'chip'+(op==='x'?' erw':'')+(ok?'':' off'),'aria-disabled':String(!ok),'aria-label':name+' mit '+k+(ok?'':' – geht nicht')},(op==='x'?'× ':'÷ ')+k);
        b.addEventListener('click',()=>act(op,k));
        row.append(b);
      });
      box.append(row);
    });
    return box;
  };
  const quizBox=()=>{
    if(!quizOrder)quizOrder=RNG.shuffle(LAB_QUIZ);
    const grid=el('div',{class:'tiles',role:'group','aria-label':'Antworten'});
    quizOrder.forEach((o,i)=>{
      const b=el('button',{type:'button',class:'tile tile-txt','aria-label':'Antwort '+Q_LETTERS[i]+': '+o.txt},el('span',{class:'ltr','aria-hidden':'true'},Q_LETTERS[i]),el('span',{class:'tv'},o.txt));
      b.addEventListener('click',()=>answer(o,b));
      grid.append(b);
    });
    return el('div',{class:'labquiz'},grid,el('button',{type:'button',class:'linkbtn',onclick:()=>{L.skip=true;persist();sayText('');draw();}},'Noch einmal ausprobieren'));
  };
  const draw=()=>{
    const ph=labPhase(L);
    bStrip.setAttribute('aria-pressed',String(L.mode==='strip'));
    bCircle.setAttribute('aria-pressed',String(L.mode==='circle'));
    promptEl.replaceChildren(el('p',{class:'q'},LAB_PROMPT[ph]));
    if(ph==='play')promptEl.append(el('button',{type:'button',class:'btn small',onclick:()=>{L.skip=false;persist();sayText('');draw();}},'Auftrag 3 starten'));
    stage.replaceChildren(labFigure(L));
    tbPhase.textContent=ph==='free'?'Frei':'Auftrag '+(ph==='x'?1:ph==='d'?2:3)+'/3';
    tbMode.textContent=L.mode==='strip'?'Streifen':'Kreis';
    undoBtn.disabled=!L.hist.length;
    ctl.replaceChildren(ph==='quiz'?quizBox():chipRows());
  };

  undoBtn.addEventListener('click',()=>{
    const h=L.hist.pop();if(!h)return;
    L.cur=h.cur;L.last=h.last;persist();sayText('Schritt zurückgenommen.');draw();
  });
  newBtn.addEventListener('click',()=>{
    const b=RNG.pick(LAB_START.filter(x=>x[0]!==L.base[0]||x[1]!==L.base[1]));
    L.base=b.slice();L.cur=b.slice();L.hist=[];L.last=null;persist();
    sayText('Neuer Bruch: '+b[0]+' von '+b[1]+' Teilen gefärbt.'+(isFullyReduced(b[0],b[1])?'':' Der lässt sich schon kürzen.'));draw();
  });
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  draw();
}

