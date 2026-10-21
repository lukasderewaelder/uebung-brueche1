'use strict';
/* =====================================================================
   8 Spiel S01 – Bruch-Memory
   ===================================================================== */
function memoryFace(n,d,mode,R,level){
  const f={n,d,mode};
  if(mode!=='num'&&R)f.fill=scatterFill(n,d,mode,R,{pClassic:level===1?0.3:0.1}); /* gefärbte Teile verstreut oder verschoben */
  return f;
}
function genMemoryPairs(level,count,R){
  const used=new Set(),pairs=[],maxQ=level===1?8:12;
  const memoryFaceR=(n,d,mode)=>memoryFace(n,d,mode,R,level);
  const sameFace=(a,b)=>a.mode===b.mode&&a.n===b.n&&a.d===b.d;
  let guard=0;
  while(pairs.length<count&&guard++<2000){
    const q=R.int(2,maxQ),p=R.int(1,q-1);
    if(gcd(p,q)!==1||used.has(p+'/'+q))continue;
    let a,b;
    if(level===1){
      const kind=R.pick(['pic','pic','num']);
      if(kind==='num'){const k=R.int(2,5);a=memoryFaceR(p,q,'num');b=memoryFaceR(p*k,q*k,'num');}
      else{
        const k1=R.int(1,2),k2=R.pick([1,2,3,4].filter(x=>x!==k1));
        const m=pickMode(q*k1,R,24);if(!m)continue;
        a=memoryFaceR(p*k1,q*k1,m);b=memoryFaceR(p*k2,q*k2,'num');
      }
    }else{
      const kind=R.pick(['num','num','pic','picpic','red']);
      const ks=R.shuffle([1,2,3,4,5,6,7,8,9]);
      if(kind==='num'){a=memoryFaceR(p*ks[0],q*ks[0],'num');b=memoryFaceR(p*ks[1],q*ks[1],'num');}
      else if(kind==='red'){const k=R.int(4,9);a=memoryFaceR(p*k,q*k,'num');b=memoryFaceR(p,q,'num');}
      else if(kind==='pic'){
        const m=pickMode(q*ks[0],R,24);if(!m)continue;
        a=memoryFaceR(p*ks[0],q*ks[0],m);b=memoryFaceR(p*ks[1],q*ks[1],'num');
      }else{
        const m1=pickMode(q*ks[0],R,24),m2=pickMode(q*ks[1],R,24);if(!m1||!m2)continue;
        a=memoryFaceR(p*ks[0],q*ks[0],m1);b=memoryFaceR(p*ks[1],q*ks[1],m2);
      }
    }
    if(sameFace(a,b))continue;
    used.add(p+'/'+q);pairs.push(R.chance(0.5)?[a,b]:[b,a]);
  }
  return pairs;
}
function newMemory(level){
  const pairs=genMemoryPairs(level,level===1?6:10,RNG);
  const cards=[];
  pairs.forEach((pr,i)=>{cards.push({pair:i,face:pr[0],state:'down'});cards.push({pair:i,face:pr[1],state:'down'});});
  return {level,cards:RNG.shuffle(cards),first:null,attempts:0,hints:0,hintStage:0,done:false};
}
function gameRec(key){return S.games[key]||(S.games[key]={state:null,played:0,won:0,best:null});}

function renderMemory(id){
  const lvl=levelOf(id),key=keyOf(id,lvl),rec=gameRec(key);
  if(!rec.state||rec.state.level!==lvl){rec.state=newMemory(lvl);rec.played++;persist();}
  const m=rec.state;
  m.cards.forEach(c=>{if(c.state==='up')c.state='down';});m.first=null;
  let busy=false;
  const root=el('div',{class:'page'});root.append(topbar(GAMES[id].name));
  const shell=el('div',{class:'shell'});const help=helpPanel();const main=el('main',{class:'work'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  help.setNotes(['M1','M2','M3'].map(n=>el('section',{class:'note'},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  const fillStats=()=>help.setStats(el('div',null,el('h3',null,'Deine Runden'),el('table',{class:'stats'},
    el('tr',null,el('td',null,'Gespielte Runden'),el('td',null,el('b',null,String(rec.played)))),
    el('tr',null,el('td',null,'Beendete Runden'),el('td',null,el('b',null,String(rec.won)))),
    el('tr',null,el('td',null,'Wenigste Versuche'),el('td',null,el('b',null,rec.best==null?'–':String(rec.best)))))));
  fillStats();
  main.append(el('div',{class:'progress'},el('span',{class:'lvlbadge'},'Niveau '+LEVEL_LABEL[lvl])));
  const card=el('div',{class:'card'});
  const stats=el('div',{class:'memstats','aria-live':'polite'});
  const msg=el('div',{'aria-live':'polite'});
  const grid=el('div',{class:'memgrid n'+m.cards.length,id:'memhost'});
  const hints=el('div',{class:'hints'});
  card.append(el('p',null,'Decke zwei Karten auf. Ein Paar zeigt denselben Anteil – auch wenn die Karten verschieden aussehen. Bruchbilder und Brüche mit Bruchstrich gehören zusammen.'),stats,msg,grid,hints);
  main.append(card);
  const hintBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('hinweis')),'Tipp');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  const again=el('button',{type:'button',class:'btn primary'},'Neu mischen');
  main.append(el('div',{class:'actionbar'},el('div',{class:'primaryrow'},hintBtn,noteBtn,again)));
  const renderHints=()=>{
    hints.replaceChildren();
    const open=m.hintOpen!==false;
    if(m.hintStage>0&&!open)hints.append(hintBox('Tipps (1–'+m.hintStage+')',[],false,()=>{m.hintOpen=true;persist();renderHints();}));
    else HINT.memory.slice(0,m.hintStage).forEach((h,i)=>hints.append(hintBox('Tipp '+(i+1)+' von '+HINT.memory.length,[h],true,()=>{m.hintOpen=false;persist();renderHints();})));
    hintBtn.disabled=m.hintStage>=HINT.memory.length;
  };
  const updStats=()=>{
    const found=m.cards.filter(c=>c.state==='matched').length/2;
    stats.replaceChildren(el('span',null,`Gefundene Paare: ${found} von ${m.cards.length/2}`),el('span',null,`Versuche: ${m.attempts}`),el('span',null,`Tipps: ${m.hints}`));
  };
  const faceNode=(c)=>c.face.mode==='num'?frac(c.face.n,c.face.d):drawMode(c.face.mode,c.face.n,c.face.d,{maxW:100,label:'Bruchbild',tall:true,fill:c.face.fill});
  const draw=()=>{
    grid.replaceChildren();
    m.cards.forEach((c,i)=>{
      const down=c.state==='down';
      const b=el('button',{type:'button',class:'mcard '+c.state,'aria-label':down?`Karte ${i+1}, verdeckt`:(c.face.mode==='num'?`Karte ${i+1}: ${c.face.n} durch ${c.face.d}`:`Karte ${i+1}: Bruchbild`)},down?'?':faceNode(c));
      b.addEventListener('click',()=>flip(i));
      grid.append(b);
    });
    updStats();
  };
  const flip=(i)=>{
    if(busy||m.done)return;
    const c=m.cards[i];if(c.state!=='down')return;
    c.state='up';
    if(m.first===null){m.first=i;draw();persist();return;}
    const f=m.cards[m.first];m.attempts++;
    if(f.pair===c.pair){
      f.state=c.state='matched';m.first=null;
      if(m.cards.every(x=>x.state==='matched')){
        m.done=true;rec.won++;rec.best=rec.best==null?m.attempts:Math.min(rec.best,m.attempts);
        award(30,'Memory geschafft!');msg.replaceChildren(el('div',{class:'msg ok'},`Geschafft! Du hast alle ${m.cards.length/2} Paare in ${m.attempts} Versuchen gefunden.`));fillStats();
      }
      draw();persist();
    }else{
      busy=true;draw();
      setTimeout(()=>{f.state='down';c.state='down';m.first=null;busy=false;if(document.getElementById('memhost')===grid)draw();persist();},1100);
    }
  };
  hintBtn.addEventListener('click',()=>{if(m.hintStage<HINT.memory.length){m.hintStage++;m.hints++;m.hintOpen=true;renderHints();updStats();persist();}});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  again.addEventListener('click',()=>{rec.state=newMemory(lvl);rec.played++;persist();renderAll();});
  if(m.done)msg.replaceChildren(el('div',{class:'msg ok'},`Runde beendet: ${m.attempts} Versuche. Mit „Neu mischen“ startet eine neue Runde.`));
  renderHints();draw();
}

/* =====================================================================
   9 Spiel S02 – Der Bruch-Tresor
   Der Code ist ein Bruch. Jedes Schloss (Erweitern oder Kürzen) gibt eine Ziffer frei.
   Sind alle Schlösser offen, steht der Code-Bruch da – der Tresor nimmt aber nur den
   gekürzten Bruch. Wer ihn knackt, findet einen Bauplan für die Sammlung.
   ===================================================================== */
const VAULT_GROUPS={
  1:[['G02','U02'],['G03','G04','T01'],['U01','B01','G05']],
  2:[['G02','G05'],['G03','G04'],['U01','U02','T01'],['U03','B01','O01','O02']]
};
const LOOT=['Zahnradwagen','Dampfschiff','Windmühle','Leuchtturm','Hängebrücke','Segelflieger','Uhrwerk','Hebekran','Schleusentor','Wasserrad','Fernrohr','Seilbahn'];
const lootOf=()=>S.loot||(S.loot=[]);
/* Bevorzugt einen Bauplan, den es in der Sammlung noch nicht gibt */
function pickLoot(){
  const have=lootOf(),rest=LOOT.filter(x=>!have.includes(x));
  return RNG.pick(rest.length?rest:LOOT);
}
function newVault(level){
  const c=vaultCode(level,RNG);
  const types=RNG.shuffle(VAULT_GROUPS[level].map(g=>RNG.pick(g)));
  return {
    ver:2,level,digits:(String(c.a)+String(c.b)).split('').map(Number),numLen:String(c.a).length,
    locks:types.map(t=>newState(generateUnique(t,level))),
    door:newState({type:'V01',level,mode:'full',a:c.a,b:c.b,p:c.p,q:c.q,avoid:[]}),
    active:0,opened:false,loot:pickLoot()
  };
}
const vaultOk=(v,lvl)=>!!v&&v.ver===2&&v.level===lvl&&Array.isArray(v.locks)&&v.locks.length===v.digits.length&&!!v.door;
function renderVault(id){
  const lvl=levelOf(id),key=keyOf(id,lvl),rec=gameRec(key);
  if(!vaultOk(rec.state,lvl)){rec.state=newVault(lvl);rec.played++;persist();}
  const v=rec.state,n=v.locks.length;
  const solved=(l)=>l.status==='correct';
  const allSolved=()=>v.locks.every(solved);
  if(v.active<0||v.active>n||(v.active===n&&!allSolved()&&!v.opened))v.active=Math.max(0,v.locks.findIndex(l=>!solved(l)));
  const onDoor=()=>v.active>=n;
  const cur=()=>onDoor()?v.door:v.locks[v.active];
  let fresh=-1,ctrl=null;

  const root=el('div',{class:'page'});root.append(topbar(GAMES[id].name));
  const shell=el('div',{class:'shell'});const help=helpPanel();const main=el('main',{class:'work'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  const fillStats=()=>help.setStats(el('div',null,el('h3',null,'Deine Runden'),el('table',{class:'stats'},
    el('tr',null,el('td',null,'Gespielte Runden'),el('td',null,el('b',null,String(rec.played)))),
    el('tr',null,el('td',null,'Geknackte Tresore'),el('td',null,el('b',null,String(rec.won)))),
    el('tr',null,el('td',null,'Baupläne gesammelt'),el('td',null,el('b',null,lootOf().length+' von '+LOOT.length)))),
    lootOf().length?el('p',{class:'lootlist'},lootOf().join(' · ')):null));
  fillStats();
  main.append(el('div',{class:'progress'},el('span',{class:'lvlbadge'},'Niveau '+LEVEL_LABEL[lvl])));
  const top=el('div',{class:'card vaultcard'});
  const puzzle=el('div',{class:'card vaultpuzzle'});
  const live=el('div',{class:'sr','aria-live':'polite'});
  main.append(top,puzzle,live);

  const hintBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('hinweis')),'Tipp');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  const primary=el('button',{type:'button',class:'btn primary'},'Prüfen');
  const solBtn=el('button',{type:'button',class:'linkbtn'},icon('auge'),'Lösung ansehen');
  const links=el('div',{class:'linkrow hidden'},solBtn);
  main.append(links);
  const host=el('div');
  const pad=makeKeypad(host,()=>onPrimary());
  const msg=el('div',{class:'dockmsg'});
  buildDock(main,{hintBtn,noteBtn,primary,pad,msg});

  /* Code-Anzeige: der Code-Bruch mit einem Feld je Ziffer */
  const range=(a,b)=>Array.from({length:b-a},(_,k)=>a+k);
  const codeFrac=()=>{
    const slot=(i)=>{
      const open=solved(v.locks[i]);
      return el('b',{class:'cf-slot'+(open?' on':'')+(i===fresh?' in':'')+(!open&&!v.opened&&!onDoor()&&i===v.active?' cur':''),'aria-hidden':'true'},open?String(v.digits[i]):'?');
    };
    const say=(a,b)=>range(a,b).map(i=>solved(v.locks[i])?String(v.digits[i]):'fehlt').join(' ');
    return el('div',{class:'codefrac',role:'img','aria-label':'Code-Bruch. Zähler: '+say(0,v.numLen)+'. Nenner: '+say(v.numLen,v.digits.length)+'.'},
      el('span',{class:'cf-row'},...range(0,v.numLen).map(slot)),el('span',{class:'cf-bar'}),el('span',{class:'cf-row'},...range(v.numLen,v.digits.length).map(slot)));
  };
  const lockChips=()=>{
    const box=el('div',{class:'locks',role:'group','aria-label':'Schlösser und Tür'});
    v.locks.forEach((l,i)=>{
      const open=solved(l);
      const b=el('button',{type:'button',class:'lock'+(open?' open':''),'aria-current':String(!v.opened&&i===v.active),'aria-label':`Schloss ${i+1}, ${open?'offen, Ziffer '+v.digits[i]:'verschlossen'}`},
        el('span',{class:'lk-n'},String(i+1)),icon(open?'haken':'schloss'));
      b.addEventListener('click',()=>{v.active=i;fresh=-1;persist();drawPuzzle(true);});
      box.append(b);
    });
    const ready=allSolved(),doorState=v.opened?'offen':(ready?'bereit':'gesperrt, erst alle Schlösser öffnen');
    const d=el('button',{type:'button',class:'lock door'+(v.opened?' open':'')+(ready?'':' locked'),'aria-current':String(!v.opened&&onDoor()),'aria-disabled':String(!ready),'aria-label':'Tresortür, '+doorState},
      icon(v.opened?'haken':'tresor'),el('span',{class:'lk-n'},'Tür'));
    d.addEventListener('click',()=>{if(!ready||v.opened)return;v.active=n;fresh=-1;persist();drawPuzzle(true);});
    box.append(d);
    return box;
  };
  const drawTop=()=>{
    const open=v.locks.filter(solved).length;
    const text=v.opened?`Der Tresor ist offen! Du hast den Bauplan »${v.loot}« gefunden.`
      :allSolved()?'Alle Schlösser sind offen. Jetzt steht der ganze Code-Bruch da.'
      :`Im Tresor liegt der Bauplan »${v.loot}«. Der Code ist ein Bruch – jedes Schloss verrät dir eine Ziffer.`;
    top.replaceChildren(
      el('div',{class:'vhead'},el('span',{class:'lblm'},'Code-Bruch'),
        v.opened?el('span',{class:'stampbox'},'Geknackt'):el('span',{class:'lblm vcount'},`${open} von ${n} offen`)),
      el('p',null,text),
      el('div',{class:'vpanel'},codeFrac(),el('div',{class:'vside'},lockChips(),
        v.opened?el('small',null,'Deine Sammlung: '+lootOf().length+' von '+LOOT.length+' Baupläne'):null)));
    fresh=-1;
  };

  const refresh=()=>{
    if(v.opened){primary.disabled=false;primary.textContent='Neue Runde';hintBtn.disabled=true;links.classList.add('hidden');pad.refresh();return;}
    const l=cur(),open=l.status==='open';
    primary.disabled=false;
    primary.textContent=open?'Prüfen':(l.status==='correct'?(allSolved()?'Zur Tür':'Nächstes Schloss'):(onDoor()?'Nochmal versuchen':'Neues Rätsel'));
    links.classList.toggle('hidden',!(open&&(l.attempts>0||l.hint>0)));
    const all=ctrl?ctrl.hintCount():0;
    hintBtn.disabled=!open||l.hint>=all;
    setHintLabel(hintBtn,l.hint>=all&&open?'Alle Tipps':(l.hint?`Tipp ${l.hint+1}`:'Tipp'));
    pad.refresh();
  };
  const openVault=()=>{
    v.opened=true;rec.won++;
    const have=lootOf();if(!have.includes(v.loot))have.push(v.loot);
    live.textContent='Der Tresor ist offen. Bauplan '+v.loot+' gefunden.';
    persist();fillStats();drawPuzzle();toTop();
    award(40,'Tresor geknackt!'); /* erst nach dem Umbau, damit die Einblendung über dem endgültigen Bedienpult liegt */
  };
  /* Erster Tipp: allgemeiner Hinweis; bei Kürzen-Aufgaben (und an der Tür) nennt er auch die 2-Regel */
  const prefixFor=()=>{
    if(onDoor())return [[HINT.vault[1],RULE2]];
    const l=cur(),own=TASKS[l.task.type].hints(l.task);
    return [own.length&&own.every(h=>h.some(x=>/2 geht IMMER/i.test(x)))?[HINT.vault[0],RULE2]:[HINT.vault[0]]];
  };
  const cbFor=()=>({
    save:()=>persist(),
    msgHost:msg,
    prefixHints:prefixFor(),
    afterCheck:()=>refresh(),
    done(kind){
      persist();
      if(kind==='correct'){
        if(onDoor()){openVault();return;}
        fresh=v.active;live.textContent='Schloss '+(v.active+1)+' ist offen. Ziffer '+v.digits[v.active]+' im Code.';drawTop();
        ctrl=mountTask(host,cur(),cbFor());refresh();toTop();
        return;
      }
      ctrl=mountTask(host,cur(),cbFor());refresh();
    }
  });
  /* Bereich sichtbar machen: auf kleinen Displays liegen Aufgabe und Code-Anzeige sonst unter Kopfzeile oder Bedienpult */
  const showEl=(node)=>{
    const bar=document.querySelector('.actionbar'),tb=document.querySelector('.topbar');
    const barTop=bar?bar.getBoundingClientRect().top:innerHeight,topEdge=tb?tb.getBoundingClientRect().bottom:0;
    const r=node.getBoundingClientRect();
    let dy=r.bottom>barTop-8?r.bottom-(barTop-8):0;
    if(r.top-dy<topEdge+8)dy=r.top-(topEdge+8);
    if(Math.abs(dy)>2)window.scrollBy({top:dy,behavior:'smooth'});
  };
  const reveal=()=>showEl(puzzle);
  const toTop=()=>showEl(top.querySelector('.vpanel')||top);
  const drawPuzzle=(show)=>{
    puzzle.replaceChildren();
    if(v.opened){host.replaceChildren();puzzle.classList.add('hidden');drawTop();refresh();return;}
    puzzle.classList.remove('hidden');
    const l=cur();
    puzzle.append(el('h3',null,onDoor()?'Tresortür – Code-Bruch kürzen':`Schloss ${v.active+1} – ${TASKS[l.task.type].name}`),host);
    help.setNotes(noteFor(l.task.type,l.task));
    ctrl=mountTask(host,l,cbFor());
    drawTop();refresh();
    if(show)reveal();
  };
  const newRound=()=>{rec.state=newVault(lvl);rec.played++;persist();renderAll();window.scrollTo(0,0);};
  const onPrimary=()=>{
    if(v.opened){newRound();return;}
    const l=cur();
    if(l.status==='open'){ctrl.check();refresh();return;}
    if(l.status==='shown'){ /* Lösung gesehen: neuer Versuch (Schloss: anderes Rätsel, Tür: derselbe Code-Bruch) */
      if(onDoor())v.door=newState(v.door.task);
      else v.locks[v.active]=newState(generateUnique(l.task.type,lvl));
      persist();drawPuzzle();return;
    }
    const nxt=v.locks.findIndex((x,i)=>!solved(x)&&i!==v.active);
    v.active=nxt>=0?nxt:n;
    persist();drawPuzzle(true);
  };
  primary.addEventListener('click',onPrimary);
  hintBtn.addEventListener('click',()=>{ctrl.hint();refresh();});
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  solBtn.addEventListener('click',()=>{ctrl.solution();refresh();});
  main.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='radio'&&host.contains(e.target)){e.preventDefault();onPrimary();}
  });
  drawPuzzle();
}

