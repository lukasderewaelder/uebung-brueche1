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
/* Stückliste: Nr. · Bezeichnung · Sterne leicht/knifflig (opts.head=false: ohne Kopfzeile, opts.start: so viele Nummern schon vergeben) */
function bomList(ids,opts={}){
  const head=el('div',{class:'bomhead'},el('span',null,'Nr.'),el('span',null,'Bezeichnung'),el('span',null,'Leicht'),el('span',null,'Knifflig'),el('span'));
  const no=(i)=>String((opts.start||0)+i+1).padStart(2,'0');
  const rows=ids.map((id,i)=>{
    if(id==='LAB'){
      const done=!!(S.lab&&S.lab.done);
      return el('button',{type:'button',class:'bomrow','data-acc':'mix',onclick:()=>go({kind:'lab'})},
        el('span',{class:'pos'},no(i)),
        el('span',{class:'nm'},el('b',null,'Bruchlabor'),el('small',null,'Erweitern und Kürzen ausprobieren – mit Streifen oder Kreis.')),
        el('span',{class:'labstat'+(done?' done':'')},done?icon('haken'):null,done?'Geschafft':'Neu'),icon('weiter'));
    }
    const [s1,s2]=starCols(id);
    return el('button',{type:'button',class:'bomrow','data-acc':ACC[id]||null,onclick:()=>openEntry(id)},
      el('span',{class:'pos'},no(i)),
      el('span',{class:'nm'},el('b',null,TASKS[id].name),el('small',null,TASKS[id].desc)),
      s1,s2,icon('weiter'));
  });
  return el('div',{class:'bom'},...(opts.head===false?[]:[head]),...rows);
}
/* Üben: alle Aufgaben eines Themas, nach Gruppen, in einer fortlaufenden Liste */
function uebenBody(m){
  const body=el('div',{class:'uebenbody'});let n=0,first=true;
  Object.keys(m.groups).forEach(g=>{
    const ids=m.groups[g].ids;
    body.append(el('h3',{class:'grp'},icon(m.groups[g].icon),g),bomList(ids,{head:first,start:n}));
    n+=ids.length;first=false;
  });
  return body;
}
/* Reiter „Lernen“: eine quadratische Kachel je Thema, zwei nebeneinander. Die Kachel hat immer dieselben Teile: Symbol, Name, Fortschritt und eine Marke
   („Start“, „Weiter“ oder „Geschafft“). Sie führt zur Themenseite; dort steht der eine Hauptknopf („Eingangstest starten“ oder „Weiter: Station“).
   Hervorgehoben (gelbe Marke, Rahmen) ist nur die Kachel, bei der es weitergeht. Geplante Themen sind nur ein Hinweis, kein Link. */
function moduleCard(m,primary=true){
  const z=lernenZustand(m),rec=recommendNote(m);
  const {must,doneN,go1,rows}=pfadInfo(m);
  const fertig=z!=='gate'&&!go1;
  const tag=fertig?'Geschafft':z==='gate'?'Start':startWord(rows,go1);
  const seg=el('span',{class:'segn',role:'img','aria-label':doneN+' von '+must.length+' Pflicht-Stationen fertig'});
  must.forEach((r,i)=>seg.append(el('i',{class:i<doneN?'on':''})));
  const label=m.name+': '+doneN+' von '+must.length+' Stationen fertig, '+(fertig?'Urkunde geschafft':tag.toLowerCase()+(z!=='gate'&&go1?' bei '+stationTitle(go1.id):''))+(rec?'. Empfohlen: erst '+rec.name:'');
  return el('button',{type:'button',class:'ttile'+(primary&&!fertig?' focus':'')+(fertig?' done':''),title:m.desc,'aria-label':label,onclick:()=>go({kind:'home',tab:'pfad',thema:m.id})},
    el('span',{class:'ico','aria-hidden':'true'},icon(m.icon)),
    el('b',{class:'tt-name'},m.name),
    seg,
    el('span',{class:'tt-row'},el('span',{class:'tt-n'},doneN+' von '+must.length),el('span',{class:'tt-tag'},fertig?icon('haken'):null,tag)),
    rec?el('small',{class:'tt-rec'},'Empfohlen: erst '+rec.name+'.'):null);
}
function lernenTab(home){
  const focus=activeModules().find(m=>lernenZustand(m)==='gate'||pfadInfo(m).go1); /* das Thema, bei dem es weitergeht */
  home.append(el('h1',null,'Lernen'),el('div',{class:'tgrid'},...activeModules().map(m=>moduleCard(m,m===focus))));
  const soon=plannedModules();
  if(soon.length)home.append(el('section',{class:'soon','aria-label':'Geplante Themen'},el('h2',{class:'area'},'Bald'),
    el('ul',null,...soon.map(m=>el('li',null,icon(m.icon),el('span',null,el('b',null,m.name),el('small',null,m.desc)),el('em',null,'geplant'))))));
}
/* Einklappbarer Abschnitt: hält lange Listen aus dem ersten Blick heraus (open: gleich aufgeklappt) */
function fold(title,content,open){
  const d=el('details',{class:'fold'},el('summary',null,title),content);
  if(open)d.open=true;
  return d;
}
function renderHome(){
  const v=S.view,tab=homeTab(),root=el('div');
  const thema=tab==='pfad'&&v.thema?activeModules().find(m=>m.id===v.thema):null;
  root.append(topbar('')); /* Themenseite, Üben und die anderen Reiter tragen ihren Namen als Überschrift */
  const home=el('div',{class:'home'});
  if(tab==='pfad'){
    if(thema)pfadTab(home,thema);else lernenTab(home);
  }else if(tab==='spiele'){
    home.append(el('h1',null,'Spiele'),listLevel(['S01','S02','S03']),el('div',{class:'menu'},
      ...['S01','S02','S03'].map(id=>{const r=S.games[keyOf(id,levelOf(id))];return bigBtn(ICON[id],()=>openEntry(id),GAMES[id].name,GAMES[id].desc,[r?`Runden: ${r.played}`:'',id==='S02'&&lootOf().length?`Sammelkarten: ${lootOf().length} von ${LOOT.length}`:''].filter(Boolean).join(' · '),'',null,id==='S01'?'dots':id==='S02'?'hatch':'dash');})));
  }else if(tab==='rang'){
    const total=Object.values(S.progress).reduce((a,p)=>a+p.done,0);
    home.append(el('div',{class:'ichhead'},el('h1',null,'Ich'),linkBtn('Einstellungen',openOptions,'zahnrad')),
      rankCard(),dayCard(),
      el('p',{class:'stats'},`Aufgaben bearbeitet: ${total} · Höchstes Treffer-Konto: ${S.bestStreak||0}`),
      fold('Alle Ränge',rankLadder()),
      fold('Alle Ziele',perfectionList()));
  }else{
    /* Üben: frei wählen. Ein Umschalter für alle, je Thema eine aufklappbare Liste (das Thema der letzten Aufgabe ist offen) */
    const last=S.last&&TASKS[S.last]?S.last:null,lastMod=last?moduleOf(last):null,mods=activeModules();
    if(last)home.append(bigBtn('play',()=>openEntry(last),'Weiter üben',TASKS[last].name,LEVEL_LABEL[levelOf(last)],'go'));
    home.append(el('h1',null,'Üben'),listLevel(PRACTICE_ORDER));
    mods.forEach(m=>home.append(fold(m.name,uebenBody(m),lastMod?lastMod.id===m.id:m===mods[0])));
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

