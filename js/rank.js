'use strict';
/* =====================================================================
   Ränge, „alles perfekt“ und Einstellungen (Fenster hinter dem Knopf im Reiter „Ich“)
   Rang 1–22 hängen an den Punkten (XP); der höchste Rang (Kristall) braucht
   zusätzlich, dass wirklich alles perfekt geschafft ist.
   ===================================================================== */
/* P17 neutrale Stufen als Medaillen (gleiche XP-Schwellen); Kristall nur mit „alles perfekt“. [XP, Name, Symbol, Stufe für die Farbe] */
/* Punkte kommen aus allen Stationen. Neue Etappen und Stationen geben automatisch XP und zählen bei „alles perfekt“ mit (rankPractice, rankPath).
   Wenn weitere Bausteine dazukommen, die Schwellen hier prüfen: Ab Platin sind sie mit Absicht hoch angesetzt. */
/* Wie in vielen Spielen: Metalle mit je drei Stufen (I bis III), dann Diamant; Kristall nur mit „alles perfekt“. */
const RANKS=[
  [0,'Bronze I','plakette','bronze'],[40,'Bronze II','plakette','bronze'],[100,'Bronze III','plakette','bronze'],
  [190,'Silber I','plakette','silber'],[320,'Silber II','plakette','silber'],[500,'Silber III','plakette','silber'],
  [750,'Gold I','plakette','gold'],[1100,'Gold II','plakette','gold'],[1600,'Gold III','plakette','gold'],
  [2000,'Platin I','pokal','platin'],[2400,'Platin II','pokal','platin'],[2850,'Platin III','pokal','platin'],
  [3300,'Palladium I','schluessel','palladium'],[3800,'Palladium II','schluessel','palladium'],[4350,'Palladium III','schluessel','palladium'],
  [4900,'Rhodium I','gluehbirne','rhodium'],[5500,'Rhodium II','gluehbirne','rhodium'],[6150,'Rhodium III','gluehbirne','rhodium'],
  [6800,'Iridium I','zahnrad','iridium'],[7500,'Iridium II','zahnrad','iridium'],[8250,'Iridium III','zahnrad','iridium'],
  [9000,'Diamant','stern','diamant'],[10000,'Kristall','krone','kristall']
];
const medalIcon=(r,cls)=>el('span',{class:'medal tier-'+(r[3]||'bronze')+(cls?' '+cls:'')},icon(r[2],cls==='big'?'big':''));
const RANK_TOP=RANKS.length-1;

/* Bedingungen für „alles perfekt“ (höchster Rang) */
function perfection(){
  const keys=[];
  rankPractice().forEach(id=>[1,2].forEach(l=>keys.push(keyOf(id,l))));
  const perf=keys.filter(k=>S.perfect&&S.perfect[k]).length;
  const stars=keys.filter(k=>starsFor((S.progress[k]||{}).first||0)===3).length;
  const rp=rankPath(),path=rp.filter(m=>stationDone(m.id)).length;
  const games=['S01','S02'].reduce((n,id)=>n+[1,2].filter(l=>((S.games[keyOf(id,l)]||{}).won||0)>0).length,0);
  const items=[
    {id:'perfect',label:'Perfekte Runde in jeder Übung, leicht und knifflig',have:perf,need:keys.length},
    {id:'stars',label:'3 Sterne in jeder Übung, leicht und knifflig',have:stars,need:keys.length},
    {id:'path',label:'Lernpfad komplett, mit Urkunde',have:path,need:rp.length},
    {id:'lab',label:'Bruchlabor: Entdeckerauftrag',have:(S.lab&&S.lab.done)?1:0,need:1},
    {id:'games',label:'Memory und Tresor, leicht und knifflig',have:games,need:4},
    {id:'streak',label:'Treffer-Konto 30 erreicht',have:Math.min(30,S.bestStreak||0),need:30},
    {id:'days',label:'An 7 Tagen geübt',have:Math.min(7,Object.keys(S.days||{}).length),need:7}
  ];
  return {items,all:items.every(i=>i.have>=i.need),done:items.filter(i=>i.have>=i.need).length};
}
/* Rang aus Punkten; die Legende nur, wenn alles perfekt ist (perfect = true/false erzwingt, sonst wird geprüft) */
function rankState(xp,perfect){
  xp=xp==null?(S.xp||0):xp;
  let i=0;RANKS.forEach((r,j)=>{if(xp>=r[0])i=j;});
  const topLocked=i===RANK_TOP&&!(perfect==null?perfection().all:perfect);
  if(topLocked)i=RANK_TOP-1;
  const cur=RANKS[i],nxt=RANKS[i+1];
  const pct=nxt?Math.max(0,Math.min(1,(xp-cur[0])/(nxt[0]-cur[0]))):1;
  return {i,cur,nxt,pct,xp,topLocked};
}
const rankInfo=(xp)=>rankState(xp);
function rankHint(st){
  if(!st.nxt)return 'Höchster Rang erreicht';
  if(st.topLocked)return 'Kristall: erst, wenn alles perfekt ist';
  return 'Noch '+(st.nxt[0]-st.xp)+' XP bis „'+st.nxt[1]+'“'+(st.i===RANK_TOP-1?' und alles perfekt':'');
}
/* Neuen Rang einmalig melden (auch wenn er durch „alles perfekt“ erreicht wird) */
function checkRankUp(){
  const i=rankState().i;
  if(S.rankSeen==null||S.rankV!==2){S.rankSeen=i;S.rankV=2;persist();return;} /* rankV 2: neue Rangliste mit 23 Stufen, kein falsches „Neue Stufe“ beim ersten Laden */
  if(i>S.rankSeen){S.rankSeen=i;persist();setTimeout(()=>rankUpCard(i),900);}
}

/* ---------- Rang-Chip oben rechts: führt zur Seite „Ich“ (dort stehen Rang, Ziele und die Einstellungen) ---------- */
function chipNode(){
  const st=rankState(),xp=st.xp;
  return el('button',{type:'button',class:'gchip','aria-label':'Rang '+st.cur[1]+', '+xp+' XP. Zur Seite Ich',title:rankHint(st),onclick:()=>go({kind:'home',tab:'rang'})},
    el('span',{class:'gicon','aria-hidden':'true'},medalIcon(st.cur)),
    el('span',{class:'gtext'},el('b',{class:'gname'},st.cur[1]),segBar(st.pct)),
    el('span',{class:'gxp'},xp+' XP'),
    (S.streak||0)>1?el('span',{class:'gstreak','aria-hidden':'true'},'TREFFER '+S.streak):null);
}
function updateChip(){document.querySelectorAll('.gchip').forEach(c=>c.replaceWith(chipNode()));}

/* ---------- Rang-Seite ---------- */
function rankCard(){
  const st=rankState();
  return el('div',{class:'rankcard'},el('span',{class:'ico','aria-hidden':'true'},medalIcon(st.cur)),
    el('div',{class:'rk'},el('b',null,st.cur[1]),segBar(st.pct,'big'),
      el('small',null,st.xp+' XP · '+rankHint(st)),el('small',null,'Rang '+(st.i+1)+' von '+RANKS.length),
      el('small',{class:'kontohelp'},'Treffer-Konto: Jede richtige Antwort zählt +1. Ein Fehler halbiert es.')),
    (S.streak||0)>1?el('span',{class:'gstreak'},'TREFFER '+S.streak):null);
}
function rankLadder(){
  const st=rankState();
  return el('div',{class:'ladder'},...RANKS.map((r,i)=>{
    const done=i<=st.i,cur=i===st.i,top=i===RANK_TOP;
    return el('div',{class:'rung'+(done?' done':'')+(cur?' cur':'')+(top?' top':''),'aria-current':cur?'true':null},
      el('span',{class:'rn'},String(i+1).padStart(2,'0')),
      el('span',{class:'ri','aria-hidden':'true'},medalIcon(r)),
      el('span',{class:'rt'},el('b',null,r[1]),el('small',null,top?r[0]+' XP und alles perfekt':r[0]+' XP')),
      el('span',{class:'rs'},icon(done?'haken':'schloss'),el('span',{class:'sr'},done?'erreicht':'noch nicht')));
  }));
}
function perfectionList(){
  const pf=perfection();
  return el('div',{class:'perf'},
    el('p',{class:'perfhead'},pf.all?'Alles perfekt – Kristall ist frei!':'Für Kristall fehlt noch: '+(pf.items.length-pf.done)+' von '+pf.items.length+' Bedingungen.'),
    ...pf.items.map(it=>{
      const done=it.have>=it.need;
      return el('div',{class:'prow'+(done?' done':'')},
        el('span',{class:'pm','aria-hidden':'true'},icon(done?'haken':'schloss')),
        el('span',{class:'pt'},it.label,el('span',{class:'pbar','aria-hidden':'true'},el('i',{style:'width:'+Math.round(100*Math.min(1,it.have/it.need))+'%'}))),
        el('b',{class:'pn'},it.have+' von '+it.need));
    }));
}

/* ---------- Optionen ---------- */
let optModal=null;
function closeOptions(){if(optModal){optModal.remove();optModal=null;}}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&optModal)closeOptions();});
function resetProgress(){
  if(confirm('Wirklich allen Fortschritt löschen?')&&confirm('Sicher? Das kann man nicht rückgängig machen.')){
    closeOptions();Store.clear();S=defaultState();SEEN.clear();applyUi();go({kind:'home'},true);
  }
}
function optRow(ic,title,sub,fn){
  return el('button',{type:'button',class:'optbtn',onclick:fn},icon(ic),el('span',{class:'ot'},el('b',null,title),sub?el('small',null,sub):null),icon('weiter'));
}
/* Einstellungen (Textgröße, Hilfe, Fortschritt löschen): Knopf oben im Reiter „Ich“ */
function openOptions(){
  closeOptions();
  const m=modal([
    el('h2',null,'Einstellungen'),
    optionsExtra(),
    themeOptions(),
    typeof animOptions==='function'?animOptions():null,
    el('div',{class:'optlist'},
      optRow('schluessel','Hilfe bei Problemen','Wenn etwas nicht klappt',()=>{closeOptions();openProblemHelp();})),
    el('div',{class:'optfoot'},
      linkBtn('Fortschritt löschen',resetProgress,null,'danger'),
      el('button',{type:'button',class:'btn',onclick:closeOptions},'Schließen'))]);
  m.classList.add('optmodal');optModal=m;
  m.addEventListener('click',e=>{if(e.target===m)closeOptions();});
  const first=m.querySelector('.optbtn');if(first)first.focus();
}
/* Textgröße: „Normal“ passt sich automatisch dem Display an, die anderen Stufen vergrößern oder verkleinern dazu */
const TEXT_SIZES=[['s','Klein'],['m','Normal'],['l','Groß'],['xl','Sehr groß']];
/* Darstellung: „Automatisch“ folgt dem Gerät (hell oder dunkel), „Hell“ und „Dunkel“ gelten immer. Ohne Wahl kein Attribut data-theme. */
const THEMES=[['auto','Automatisch'],['hell','Hell'],['dunkel','Dunkel']];
const themeOf=()=>(S.ui&&S.ui.theme)||'auto';
/* Farbe der Adressleiste passend zum Hintergrund */
function syncThemeColor(){
  const m=document.querySelector('meta[name="theme-color"]'),bp=getComputedStyle(document.documentElement).getPropertyValue('--bp').trim();
  if(m&&bp)m.setAttribute('content',bp);
}
function applyUi(){
  const root=document.documentElement,th=themeOf();
  root.dataset.size=(S.ui&&S.ui.size)||'m';
  if(th==='hell'||th==='dunkel')root.dataset.theme=th;else delete root.dataset.theme;
  syncThemeColor();
}
try{const mq=matchMedia('(prefers-color-scheme: light)'),on=()=>setTimeout(syncThemeColor,0);if(mq.addEventListener)mq.addEventListener('change',on);else if(mq.addListener)mq.addListener(on);}catch(e){}
function optionsExtra(){
  const cur=(S.ui&&S.ui.size)||'m';
  const seg=el('div',{class:'seg optseg',role:'group','aria-label':'Textgröße wählen'});
  TEXT_SIZES.forEach(([k,label])=>{
    const b=el('button',{type:'button','aria-pressed':String(cur===k),'aria-label':'Textgröße '+label,onclick:()=>{
      S.ui=S.ui||{};S.ui.size=k;persist();applyUi();
      seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    }},el('span',{class:'az az-'+k,'aria-hidden':'true'},'A'),el('span',{class:'azl'},label));
    seg.append(b);
  });
  return el('div',{class:'optsec'},el('span',{class:'lblm'},'Textgröße'),seg);
}
function themeOptions(){
  const cur=themeOf();
  const seg=el('div',{class:'seg optseg optseg3',role:'group','aria-label':'Darstellung wählen'});
  THEMES.forEach(([k,label])=>{
    const b=el('button',{type:'button','aria-pressed':String(cur===k),onclick:()=>{
      S.ui=S.ui||{};S.ui.theme=k;persist();applyUi();
      seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    }},el('span',{class:'azl'},label));
    seg.append(b);
  });
  return el('div',{class:'optsec'},el('span',{class:'lblm'},'Darstellung'),seg,el('small',{class:'opthint'},'Automatisch folgt der Einstellung deines Geräts.'));
}

