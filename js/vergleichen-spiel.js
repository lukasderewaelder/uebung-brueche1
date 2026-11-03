'use strict';
/* =====================================================================
   Spiel S03 – Bruch-Duell (zwei Modi, ohne Zeitdruck; zählt nicht für den Rang)
   Duell: Gegen den Computer. In jedem Duell steht ein Paar Brüche da: Wer das richtige Zeichen wählt, bekommt den Punkt, sonst der Computer.
          Acht Duelle; die Paare kommen aus allen Wegen des Bausteins „Brüche vergleichen“ (cmpWegPair). Der Tipp nennt den schnellsten Weg.
   Rätsel: Vier (Leicht) oder fünf (Knifflig) Brüche werden per Ziehen und Ablegen (oder Antippen) der Größe nach in eine Reihe gelegt;
          nach dem Prüfen zeigen Streifen die Kontrolle. Nutzt cmpOrder mit einer kleinen Ansicht (view), wie sie mountTask baut.
   Zustand: S.games[keyOf('S03',Niveau)].state = {level, mode, duell:{…}, raetsel:{…}}
   ===================================================================== */
const DUELL_ROUNDS=8;
function newDuell(level){
  const R=RNG,want=R.pick(level===1?['nenner','zaehler','fehlt','zahl','erw']:['nenner','zaehler','fehlt','zahl','erw','konflikt']);
  const r=cmpWegPair(R,level,want);
  return {n:0,me:0,pc:0,hint:0,answered:false,msg:null,draft:{},f:r.f,fast:r.ways[0],ways:r.ways,end:false,paid:false};
}
function nextDuell(level,old){
  const d=newDuell(level);
  return Object.assign(d,{n:old.n,me:old.me,pc:old.pc});
}
function newRaetsel(level){
  const k=level===1?4:5;let fr,order;
  for(let i=0;i<40;i++){fr=cmpList(RNG,level,k);order=cmpIdxSorted(fr,false);if(order.some((c,j)=>c!==j))break;}
  return {n:0,solved:0,fr,order,dir:'asc',draft:{},tries:0,done:false,msg:null,bonus:0};
}
function renderDuell(id){
  const lvl=levelOf(id),key=keyOf(id,lvl),rec=gameRec(key);
  if(!rec.state||rec.state.level!==lvl||!rec.state.duell||!rec.state.raetsel){rec.state={level:lvl,mode:'duell',duell:newDuell(lvl),raetsel:newRaetsel(lvl)};rec.played++;persist();}
  const m=rec.state;
  const root=el('div',{class:'page'});root.append(topbar(GAMES[id].name));
  const shell=el('div',{class:'shell'}),help=helpPanel(),main=el('main',{class:'work'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  help.setNotes(['M11','M12','M13','M14','M15','M16'].map(n=>el('section',{class:'note'},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  const fillStats=()=>help.setStats(el('div',null,el('h3',null,'Deine Runden'),el('table',{class:'stats'},
    el('tr',null,el('td',null,'Gespielte Spiele'),el('td',null,el('b',null,String(rec.played)))),
    el('tr',null,el('td',null,'Gewonnene Duelle'),el('td',null,el('b',null,String(rec.won||0)))),
    el('tr',null,el('td',null,'Gelöste Rätsel'),el('td',null,el('b',null,String(m.raetsel.solved)))))));
  fillStats();
  main.append(el('div',{class:'progress'},el('span',{class:'lvlbadge'},LEVEL_LABEL[lvl])));
  const modes=el('div',{class:'seg',role:'group','aria-label':'Spielart'});
  const mBtn=(v,label)=>{const b=el('button',{type:'button','aria-pressed':String(m.mode===v)},label);b.addEventListener('click',()=>{if(m.mode===v)return;m.mode=v;persist();draw();});return b;};
  const bDuell=mBtn('duell','Duell'),bRaetsel=mBtn('raetsel','Ordnen-Rätsel');
  modes.append(bDuell,bRaetsel);
  const card=el('div',{class:'card'}),body=el('div'),msg=el('div',{'aria-live':'polite'}),hints=el('div',{class:'hints'});
  card.append(body,msg,hints);
  main.append(modes,card);
  const hintBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('hinweis')),'Tipp');
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkkasten');
  const primary=el('button',{type:'button',class:'btn primary'},'Weiter');
  main.append(el('div',{class:'actionbar'},el('div',{class:'primaryrow'},hintBtn,noteBtn,primary)));
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  const note=(kind,text)=>msg.replaceChildren(text?el('div',{class:'msg '+kind},text):'');
  let rView=null; /* Ansicht des Rätsels (nicht im Spielstand speichern) */
  const sorted=(t)=>cmpStack(t.order.map(i=>({n:t.fr[i][0],d:t.fr[i][1]})),{compact:true});

  /* ---- Duell ---- */
  const drawDuell=()=>{
    const D=m.duell,f=D.f,over=D.n>=DUELL_ROUNDS&&D.answered;
    const view={draft:D.draft,inputs:{},locked:()=>D.answered,save:()=>persist(),changed(){}};
    body.replaceChildren(
      el('p',null,'Welches Zeichen passt? Stimmt es, bekommst du den Punkt. Sonst bekommt ihn der Computer.'),
      el('div',{class:'memstats','aria-live':'polite'},el('span',null,'Du: '+D.me),el('span',null,'Computer: '+D.pc),el('span',null,'Duell '+Math.min(D.n+(D.answered?0:1),DUELL_ROUNDS)+' von '+DUELL_ROUNDS)));
    cmpSign(view,body,'sign',f,{onPick:(s)=>{
      if(D.answered)return;
      const code=cmpDiagnose(f[0],f[1],f[2],f[3],s);
      D.answered=true;D.n++;
      if(!code){D.me++;D.msg={kind:'ok',text:'Punkt für dich! '+cmpWayOk({a:f[0],b:f[1],c:f[2],d:f[3]},D.fast)};}
      else{D.pc++;D.msg={kind:'bad',text:'Punkt für den Computer. '+CMP_MSG[code]+' Richtig war: '+cmpSignOf(compareFrac(f[0],f[1],f[2],f[3]))+'.'};}
      if(D.n>=DUELL_ROUNDS&&!D.paid){
        D.paid=true;
        if(D.me>D.pc){rec.won=(rec.won||0)+1;award(30,'Duell gewonnen!');}
      }
      persist();fillStats();draw();
    }});
    if(D.answered)body.querySelectorAll('.cmpsigns button').forEach(b=>{b.disabled=true;});
    hintBtn.disabled=D.answered||D.hint>=2;
    primary.textContent=over?'Neues Duell':(D.answered?'Nächstes Duell':'Weiter');primary.disabled=!D.answered;primary.classList.toggle('ready',D.answered);
    note(D.msg&&D.answered?D.msg.kind:'',D.answered&&D.msg?D.msg.text+(over?` Spielstand: Du ${D.me}, Computer ${D.pc}. ${D.me>D.pc?'Du gewinnst!':D.me===D.pc?'Unentschieden.':'Der Computer gewinnt.'}`:''):'');
    hints.replaceChildren();
    if(D.hint>=1&&!D.answered)hints.append(el('div',{class:'hint'},el('p',null,D.hint===1?'Was ist bei beiden Brüchen gleich? Liegt ½ oder 1 dazwischen? Fehlen gleich viele Stücke zum Ganzen?':'Der schnellste Weg heißt: '+CMP_WAYNAME[D.fast]+'.')));
    fitPage();
  };
  /* ---- Rätsel ---- */
  const drawRaetsel=()=>{
    const Rr=m.raetsel;
    const view={draft:Rr.draft,inputs:{},locked:()=>Rr.done,save:()=>persist(),changed(){}};
    body.replaceChildren(
      el('p',null,'Lege die Brüche der Größe nach in die Reihe. Der kleinste kommt zuerst. Ziehe die Karten oder tippe sie an.'),
      el('div',{class:'memstats','aria-live':'polite'},el('span',null,'Gelöst: '+Rr.solved),el('span',null,'Versuche: '+Rr.tries)));
    cmpOrder(view,body,'ord',Rr.fr.map(x=>({n:x[0],d:x[1],aria:x[0]+' durch '+x[1]})),{});
    if(Rr.done)body.append(sorted(Rr));
    hintBtn.disabled=true;
    primary.textContent=Rr.done?'Neues Rätsel':'Prüfen';primary.disabled=false;primary.classList.toggle('ready',Rr.done);
    note(Rr.msg?Rr.msg.kind:'',Rr.msg&&Rr.msg.text);
    hints.replaceChildren();
    fitPage();
    return view;
  };
  const draw=()=>{
    bDuell.setAttribute('aria-pressed',String(m.mode==='duell'));bRaetsel.setAttribute('aria-pressed',String(m.mode==='raetsel'));
    if(m.mode==='duell')drawDuell();else rView=drawRaetsel();
  };
  hintBtn.addEventListener('click',()=>{const D=m.duell;if(m.mode!=='duell'||D.answered||D.hint>=2)return;D.hint++;persist();drawDuell();});
  primary.addEventListener('click',()=>{
    if(m.mode==='duell'){
      const D=m.duell;if(!D.answered)return;
      m.duell=D.n>=DUELL_ROUNDS?newDuell(lvl):nextDuell(lvl,D);
      if(D.n>=DUELL_ROUNDS)rec.played++;
      persist();fillStats();draw();return;
    }
    const Rr=m.raetsel;
    if(Rr.done){const s=Rr.solved,n=Rr.n+1;m.raetsel=Object.assign(newRaetsel(lvl),{solved:s,n});persist();fillStats();draw();return;}
    const res=cmpOrderCheck(Rr,Rr.draft,(i)=>ft(Rr.fr[i][0],Rr.fr[i][1]));
    if(res.invalid){Rr.msg={kind:'info',text:res.feedback};persist();draw();return;}
    Rr.tries++;
    if(res.correct){Rr.done=true;Rr.solved++;Rr.msg={kind:'ok',text:res.feedback};award(15,'Rätsel gelöst!');persist();fillStats();draw();return;}
    Rr.msg={kind:'bad',text:res.feedback};persist();
    draw();Object.keys(res.marks||{}).forEach(k=>{const e=rView&&rView.inputs[k];if(e)e.classList.add('bad');});
  });
  draw();
}
