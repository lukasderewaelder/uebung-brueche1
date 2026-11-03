'use strict';
/* =====================================================================
   10 Startseite
   ===================================================================== */
function bigBtn(ic,onclick,title,text,extra,cls,acc,pat){
  return el('button',{type:'button',class:'bigbtn '+(cls||''),'data-acc':acc||null,'data-pat':pat||null,onclick},
    el('span',{class:'ico','aria-hidden':'true'},icon(ic)),
    el('span',{class:'tx'},el('b',null,title),text?el('small',null,text):null,extra?el('small',{class:'pg'},extra):null));
}
/* Textlink: Nebenhandlung ohne Rahmen (der eine Hauptknopf je Bildschirm ist .btn.primary) */
function linkBtn(label,onclick,ic,cls){
  return el('button',{type:'button',class:'linkbtn'+(cls?' '+cls:''),onclick},ic?icon(ic):null,label);
}
function listLevel(ids){
  const tids=ids.filter(i=>TASKS[i]||GAMES[i]);
  const l=levelOf(tids[0]);
  const set=(n)=>{tids.forEach(i=>S.levelByType[i]=n);persist();renderAll();};
  const mk=(n)=>el('button',{type:'button','aria-pressed':String(l===n),onclick:()=>set(n)},LEVEL_LABEL[n]);
  return el('div',{class:'levelrow'},el('span',{class:'lblm'},'Schwierigkeit'),el('div',{class:'seg',role:'group','aria-label':'Schwierigkeit wählen'},mk(1),mk(2)));
}
/* Stückliste: Nr. · Bezeichnung · Sterne leicht/knifflig */
function bomList(ids){
  const head=el('div',{class:'bomhead'},el('span',null,'Nr.'),el('span',null,'Bezeichnung'),el('span',null,'Leicht'),el('span',null,'Knifflig'),el('span'));
  const rows=ids.map((id,i)=>{
    if(id==='LAB'){
      const done=!!(S.lab&&S.lab.done);
      return el('button',{type:'button',class:'bomrow','data-acc':'mix',onclick:()=>go({kind:'lab'})},
        el('span',{class:'pos'},String(i+1).padStart(2,'0')),
        el('span',{class:'nm'},el('b',null,'Bruchlabor'),el('small',null,'Erweitern und Kürzen ausprobieren – mit Streifen oder Kreis.')),
        el('span',{class:'labstat'+(done?' done':'')},done?icon('haken'):null,done?'Geschafft':'Neu'),icon('weiter'));
    }
    const [s1,s2]=starCols(id);
    return el('button',{type:'button',class:'bomrow','data-acc':ACC[id]||null,onclick:()=>openEntry(id)},
      el('span',{class:'pos'},String(i+1).padStart(2,'0')),
      el('span',{class:'nm'},el('b',null,TASKS[id].name),el('small',null,TASKS[id].desc)),
      s1,s2,icon('weiter'));
  });
  return el('div',{class:'bom'},head,...rows);
}
/* Reiter „Lernen“: eine Karte je Thema. Die Karte hat immer dieselben Teile: Kopf (eine Zeile, die zur Themenseite führt), Fortschritt, höchstens
   ein Hauptknopf („Starten“ führt zum Eingangstest-Block der Themenseite, „Start/Weiter: Station“ öffnet die Station). Geplante Themen sind nur ein Hinweis, kein Link. */
function moduleCard(m){
  const z=lernenZustand(m),rec=recommendNote(m),openThema=()=>go({kind:'home',tab:'pfad',thema:m.id});
  const {must,doneN,go1,rows}=pfadInfo(m);
  const head=el('button',{type:'button',class:'tc-head','aria-label':m.name+': Stationen ansehen',onclick:openThema},
    el('span',{class:'ico','aria-hidden':'true'},icon(m.icon)),
    el('span',{class:'tc-tx'},el('b',{class:'tc-name'},m.name),el('small',null,m.desc)),
    icon('weiter'));
  const seg=el('span',{class:'segn',role:'img','aria-label':doneN+' von '+must.length+' Pflicht-Stationen fertig'});
  must.forEach((r,i)=>seg.append(el('i',{class:i<doneN?'on':''})));
  const act=z==='gate'?el('button',{type:'button',class:'btn primary',onclick:openThema},icon('play'),'Starten')
    :go1?el('button',{type:'button',class:'btn primary',onclick:()=>openStation(go1.id)},icon('play'),startWord(rows,go1)+': '+stationTitle(go1.id))
    :el('p',{class:'tc-done'},icon('haken'),'Urkunde geschafft');
  return el('section',{class:'tcard'},head,
    rec?el('p',{class:'tc-note'},'Empfohlen: erst '+rec.name+'.'):null,
    el('div',{class:'tc-prog'},seg,el('b',null,doneN+' von '+must.length)),
    act);
}
function lernenTab(home){
  home.append(el('h1',null,'Lernen'),...activeModules().map(moduleCard));
  const soon=plannedModules();
  if(soon.length)home.append(el('section',{class:'soon','aria-label':'Geplante Themen'},el('h2',{class:'area'},'Bald'),
    el('ul',null,...soon.map(m=>el('li',null,icon(m.icon),el('span',null,el('b',null,m.name),el('small',null,m.desc)),el('em',null,'geplant'))))));
}
/* Einklappbarer Abschnitt: hält lange Listen aus dem ersten Blick heraus */
function fold(title,content){
  return el('details',{class:'fold'},el('summary',null,title),content);
}
function renderHome(){
  const v=S.view,tab=homeTab(),root=el('div');
  const thema=tab==='pfad'&&v.thema?activeModules().find(m=>m.id===v.thema):null;
  const gmod=tab==='ueben'&&v.group?moduleOf(v.group):null;
  root.append(topbar(thema?'':gmod?gmod.name+' › '+v.group:'')); /* auf der Themenseite steht der Name als Überschrift */
  const home=el('div',{class:'home'});
  if(tab==='pfad'){
    if(thema)pfadTab(home,thema);else lernenTab(home);
  }else if(tab==='spiele'){
    home.append(el('h1',null,'Spiele'),listLevel(['S01','S02','S03']),el('div',{class:'menu'},
      ...['S01','S02','S03'].map(id=>{const r=S.games[keyOf(id,levelOf(id))];return bigBtn(ICON[id],()=>openEntry(id),GAMES[id].name,GAMES[id].desc,[r?`Runden: ${r.played}`:'',id==='S02'&&lootOf().length?`Sammelkarten: ${lootOf().length} von ${LOOT.length}`:''].filter(Boolean).join(' · '),'',null,id==='S01'?'dots':id==='S02'?'hatch':'dash');})));
  }else if(tab==='rang'){
    const total=Object.values(S.progress).reduce((a,p)=>a+p.done,0);
    home.append(el('h1',null,'Ich'),
      el('button',{type:'button',class:'btn small settingsbtn',onclick:openOptions},icon('zahnrad'),' Einstellungen'),
      rankCard(),dayCard(),
      el('p',{class:'stats'},`Aufgaben bearbeitet: ${total} · Höchstes Treffer-Konto: ${S.bestStreak||0}`),
      fold('Alle Ränge',rankLadder()),
      fold('Alle Ziele',perfectionList()),
      fold('Deine Sterne',bomList(PRACTICE_ORDER)),
      el('div',{class:'rowbtns'},
        el('button',{type:'button',class:'btn small',onclick:()=>{const prev=JSON.parse(JSON.stringify(S.view));go({kind:'lab',from:'opt',back:prev});}},icon('kolben'),' Bruchlabor'),
        el('button',{type:'button',class:'btn small',onclick:()=>go(pfadView())},icon('pfad'),' Lernpfad'),
        el('button',{type:'button',class:'btn small',onclick:()=>openProblemHelp()},icon('schluessel'),' Hilfe bei Problemen')));
  }else if(!v.group||!GROUPS[v.group]){
    const last=S.last&&TASKS[S.last]?S.last:null;
    if(last)home.append(bigBtn('play',()=>openEntry(last),'Weiter üben',TASKS[last].name,LEVEL_LABEL[levelOf(last)],'go'));
    home.append(el('h1',null,'Üben'));
    /* Mit mehr als einem aktiven Thema steht über den Gruppen der Name des Themas */
    activeModules().forEach(m=>{
      if(activeModules().length>1)home.append(el('h2',{class:'area'},m.name));
      home.append(el('div',{class:'menu'},...Object.keys(m.groups).map(g=>bigBtn(m.groups[g].icon,()=>go({kind:'home',tab:'ueben',group:g}),g,m.groups[g].text,null,'',null,m.groups[g].pat))));
    });
  }else{
    const g=GROUPS[v.group];
    home.append(el('h1',null,v.group),listLevel(g.ids),bomList(g.ids));
  }
  root.append(home,bottomNav());app.append(root);
}

function showCrash(){
  if(document.getElementById('crash'))return;
  const m=modal([el('h2',null,'Ups, da ist etwas schiefgelaufen'),el('p',null,'Deine Punkte bleiben erhalten.'),
    el('div',{class:'rowbtns'},
      el('button',{type:'button',class:'btn primary',onclick:restartKeepPoints},'Neu starten'),
      el('button',{type:'button',class:'btn',onclick:()=>openProblemHelp()},'Hilfe bei Problemen'))]);
  m.id='crash';
}
window.addEventListener('error',showCrash);
window.addEventListener('unhandledrejection',showCrash);

/* Gate: Ist für diese Ansicht eine Erklärung dran (ungesehen oder ausdrücklich geöffnet), erscheint sie statt der Ansicht.
   Schlägt sie fehl, gilt sie als gesehen und die Ansicht öffnet sich normal – eine kaputte Erklärung blockiert nie die Übung. */
function showIntro(v){
  let id=null;
  try{
    id=introWanted(v);
    if(!id)return false;
    renderIntro(id);
    return true;
  }catch(e){
    app.replaceChildren();
    if(id){S.intro=S.intro||{};S.intro[id]=true;}
    if(S.view&&S.view.intro){const w=Object.assign({},S.view);delete w.intro;S.view=w;}
    persist();
    return false;
  }
}
function renderAll(){
  setHelp(false);
  app.replaceChildren();
  const v=S.view||{kind:'home'};
  if(showIntro(v)){/* Erklärung statt Ansicht */}
  else if(v.kind==='practice'&&TASKS[v.id])renderPractice(v.id);
  else if(v.kind==='game'&&v.id==='S01')renderMemory(v.id);
  else if(v.kind==='game'&&v.id==='S02')renderVault(v.id);
  else if(v.kind==='game'&&v.id==='S03')renderDuell(v.id);
  else if(v.kind==='lab')renderLab();
  else renderHome();
  if(!Store.ok)app.append(el('div',{class:'note-storage'},
    el('p',null,'Hinweis: Der Browser erlaubt kein lokales Speichern. Dein Fortschritt bleibt nur erhalten, solange diese Seite geöffnet ist.'),
    el('button',{type:'button',class:'btn small',onclick:()=>openProblemHelp('speichern')},'Was kann ich tun?')));
}

