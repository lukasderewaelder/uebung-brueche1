'use strict';
/* =====================================================================
   Spiel S04 – Rechenschlange (Reiter „Spiele“, ohne Zeitdruck, zählt nicht für den Rang; Konzept Kap. 14)
   Eine Schlange mit Startbruch und 5 (Leicht) oder 8 (Knifflig) Segmenten; jedes Segment ist ein Rechenschritt, der Kopf zeigt das Ziel.
   Wer ein Segment richtig (und gekürzt) rechnet, lässt die Schlange wachsen. Am Ziel gibt es eine Sammelkarte (12 Schlangenarten,
   bevorzugt eine noch fehlende, wie beim Bruch-Tresor). Serie: Schlangen ohne Fehler (nur Anzeige).
   Zahlen: Leicht Nenner aus {2, 4, 8} oder {3, 6, 12} (eine Familie je Schlange), Werte zwischen 0 und 2; Knifflig gemischte Nenner, mindestens drei
   Segmente mit „beide erweitern“, Werte bis 3 (unechte Brüche erlaubt). Zahlen kommen aus hnSchlange (js/hauptnenner.js).
   Zustand: S.games[keyOf('S04',Niveau)].state = {ver, level, sn:{start, ops, vals, goal}, pos, draft, hint, fails, done, card, msg}; Serie in rec.serie.
   ===================================================================== */
const SNAKES=['Ringelnatter','Kreuzotter','Äskulapnatter','Schlingnatter','Königspython','Grüne Mamba','Kobra','Anakonda','Abgottschlange','Klapperschlange','Kornnatter','Baumpython'];
const snakesOf=()=>S.snakes||(S.snakes=[]);
function pickSnake(){const have=snakesOf(),rest=SNAKES.filter(x=>!have.includes(x));return RNG.pick(rest.length?rest:SNAKES);}
function newSnake(level){return {ver:1,level,sn:hnSchlange(RNG,level,level===1?5:8),pos:0,draft:{},hint:0,fails:0,done:false,card:null,msg:null};}
const snakeOk=(s,lvl)=>!!s&&s.ver===1&&s.level===lvl&&s.sn&&Array.isArray(s.sn.ops)&&Number.isInteger(s.pos);
/* Tipps zum aktuellen Segment (Wert v, Schritt op) */
function snakeHints(v,o){
  const N=lcm(v[1],o.f[1]);
  return [
    `Welcher Nenner passt zu ${ft(v[0],v[1])} und ${ft(o.f[0],o.f[1])}?`,
    `Der Hauptnenner ist ${N}: ${ft(v[0],v[1])} = ${ft(v[0]*N/v[1],N)} und ${ft(o.f[0],o.f[1])} = ${ft(o.f[0]*N/o.f[1],N)}.`
  ];
}
function renderSchlange(id){
  const lvl=levelOf(id),key=keyOf(id,lvl),rec=gameRec(key);
  if(!snakeOk(rec.state,lvl)){rec.state=newSnake(lvl);rec.played++;persist();}
  const G=rec.state,sn=G.sn,n=sn.ops.length;
  const root=el('div',{class:'page'});root.append(topbar(GAMES[id].name));
  const shell=el('div',{class:'shell'}),help=helpPanel(),main=el('main',{class:'work'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  help.setNotes(['M20','M19'].map(x=>el('section',{class:'note'},el('h3',null,x+' · '+NOTES[x].title),...NOTES[x].build([]))));
  const fillStats=()=>help.setStats(el('div',null,el('h3',null,'Deine Schlangen'),el('table',{class:'stats'},
    el('tr',null,el('td',null,'Gespielte Schlangen'),el('td',null,el('b',null,String(rec.played)))),
    el('tr',null,el('td',null,'Am Ziel angekommen'),el('td',null,el('b',null,String(rec.won||0)))),
    el('tr',null,el('td',null,'Serie ohne Fehler'),el('td',null,el('b',null,String(rec.serie||0)))),
    el('tr',null,el('td',null,'Sammelkarten'),el('td',null,el('b',null,snakesOf().length+' von '+SNAKES.length)))),
    el('ul',{class:'lootgrid','aria-label':'Sammelkarten'},...SNAKES.map(s=>{const got=snakesOf().includes(s);return el('li',{class:'lootcell'+(got?' have':''),'aria-label':got?s:'noch nicht gefunden'},icon(got?'schlange':'schloss'),el('small',null,got?s:'?'));}))));
  fillStats();
  main.append(el('div',{class:'progress'},el('span',{class:'lvlbadge'},LEVEL_LABEL[lvl])));
  const card=el('div',{class:'card'}),body=el('div'),live=el('div',{class:'sr','aria-live':'polite'});
  card.append(body,live);main.append(card);
  const host=el('div');
  const hintBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('hinweis')),'Tipp');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkzettel');
  const primary=el('button',{type:'button',class:'btn primary'},'Prüfen');
  const pad=makeKeypad(host,()=>onPrimary());
  const msg=el('div',{class:'dockmsg'});
  const bar=buildDock(main,{hintBtn,noteBtn,primary,pad,msg,host});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  const view={draft:G.draft,inputs:{},locked:()=>G.done,save:()=>persist(),changed(){}};
  const cur=()=>G.pos===0?sn.start:sn.vals[G.pos-1];
  const draw=(wobble)=>{
    view.inputs={};
    const segs=el('div',{class:'s4snake',role:'group','aria-label':'Rechenschlange: '+G.pos+' von '+n+' Segmenten gerechnet'});
    segs.append(el('div',{class:'s4seg start'},frac(sn.start[0],sn.start[1])));
    sn.ops.forEach((o,i)=>{
      segs.append(el('div',{class:'s4op'},el('span',null,hnSign(o.plus),' ',frac(o.f[0],o.f[1]))));
      const solved=i<G.pos,now=i===G.pos&&!G.done;
      segs.append(el('div',{class:'s4seg'+(solved?' on':'')+(now?' now':'')+(now&&wobble?' shake':'')},solved?frac(sn.vals[i][0],sn.vals[i][1]):now?fracInput(view,'k'):el('span',{class:'blank'},'?')));
    });
    segs.append(el('div',{class:'s4head'+(G.done?' eat':''),role:'img','aria-label':'Kopf der Schlange, Ziel '+sn.goal[0]+'/'+sn.goal[1]},icon('schlange'),el('small',null,'Ziel'),frac(sn.goal[0],sn.goal[1])));
    host.replaceChildren(segs);
    body.replaceChildren(
      el('p',null,G.done?`Geschafft! Die Schlange hat ihr Ziel gefressen. Sammelkarte: ${G.card}.`:'Rechne Schritt für Schritt. Kürze jedes Ergebnis. Am Ende muss die Zahl im Kopf stehen.'),
      el('div',{class:'memstats'},el('span',null,'Segment '+Math.min(G.pos+1,n)+' von '+n),el('span',null,'Serie: '+(rec.serie||0))),host,
      G.done?el('div',{class:'lootbig'},icon('schlange','big'),el('b',null,G.card),el('small',null,'Deine Sammlung: '+snakesOf().length+' von '+SNAKES.length)):'');
    msg.replaceChildren(G.msg?el('div',{class:'msg '+G.msg.kind},G.msg.text):'');
    if(G.hint&&!G.done)msg.append(el('div',{class:'hint compact'},el('p',null,el('b',{class:'hl'},icon('hinweis'),'Tipp: '),...introRich(snakeHints(cur(),sn.ops[G.pos])[G.hint-1]))));
    if(G.msg||G.hint)bar.showMsg('fb');else bar.showPad();
    primary.textContent=G.done?'Neue Schlange':'Prüfen';primary.classList.toggle('ready',G.done);
    hintBtn.disabled=G.done||G.hint>=2;
    pad.refresh();bar.reserve(true);fitPage();
  };
  hintBtn.addEventListener('click',()=>{if(G.done||G.hint>=2)return;G.hint++;persist();draw();});
  function onPrimary(){
    if(G.done){const s=rec.serie||0;rec.state=newSnake(lvl);rec.serie=s;rec.played++;persist();renderAll();return;}
    const f=getFrac(G.draft,'k'),want=sn.vals[G.pos];
    if(!f){G.msg={kind:'info',text:'Trage den Bruch in das Segment ein.'};persist();draw();return;}
    if(!equivalent(f.n,f.d,want[0],want[1])){
      G.fails++;G.msg={kind:'bad',text:'Das Segment stimmt noch nicht. Rechne mit dem Hauptnenner.'};persist();draw(true);
      try{if(navigator.vibrate)navigator.vibrate(60);}catch(e){}
      return;
    }
    if(!isFullyReduced(f.n,f.d)){G.msg={kind:'warn',text:'Der Wert stimmt. Kürze noch so weit wie möglich.'};persist();draw();return;}
    G.pos++;G.draft={};view.draft=G.draft;G.hint=0;G.msg=null;
    if(G.pos>=n){
      G.done=true;G.card=pickSnake();const have=snakesOf();if(!have.includes(G.card))have.push(G.card);
      rec.won=(rec.won||0)+1;rec.serie=G.fails?0:(rec.serie||0)+1;
      live.textContent='Ziel erreicht. Sammelkarte '+G.card+'.';
      persist();fillStats();draw();award(30,'Schlange am Ziel!');return;
    }
    live.textContent='Segment richtig. Die Schlange wächst.';
    persist();draw();
  }
  primary.addEventListener('click',onPrimary);
  host.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();onPrimary();}});
  draw();
}
