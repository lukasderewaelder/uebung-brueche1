'use strict';
/* =====================================================================
   Ränge, „alles perfekt“ und Optionen (Blatt hinter dem Rang-Chip)
   Rang 1–11 hängen an den Punkten (XP); der höchste Rang (Legende) braucht
   zusätzlich, dass wirklich alles perfekt geschafft ist.
   ===================================================================== */
const RANKS=[
  [0,'Praktikant','bleistift'],[40,'Azubi','lineal'],[100,'Zeichner','winkel'],[190,'Konstrukteur','zirkel'],
  [320,'Techniker','zahnrad'],[500,'Werkmeister','schluessel'],[750,'Ingenieur','helm'],[1100,'Baumeister','plakette'],
  [1600,'Erfinder','gluehbirne'],[2300,'Chefkonstrukteur','pokal'],[3200,'Meister','stern'],[4500,'Legende','krone']
];
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
    {id:'streak',label:'30 richtige Antworten in Folge',have:Math.min(30,S.bestStreak||0),need:30},
    {id:'days',label:'7 Tage in Folge geübt',have:Math.min(7,S.bestDays||0),need:7}
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
  if(st.topLocked)return 'Legende: erst, wenn alles perfekt ist';
  return 'Noch '+(st.nxt[0]-st.xp)+' XP bis „'+st.nxt[1]+'“'+(st.i===RANK_TOP-1?' und alles perfekt':'');
}
/* Neuen Rang einmalig melden (auch wenn er durch „alles perfekt“ erreicht wird) */
function checkRankUp(){
  const i=rankState().i;
  if(S.rankSeen==null){S.rankSeen=i;persist();return;}
  if(i>S.rankSeen){S.rankSeen=i;persist();setTimeout(()=>rankUpCard(i),900);}
}

/* ---------- Rang-Chip oben rechts: öffnet die Optionen ---------- */
function chipNode(){
  const st=rankState(),xp=st.xp;
  return el('button',{type:'button',class:'gchip','aria-haspopup':'dialog','aria-label':'Rang '+st.cur[1]+', '+xp+' XP. Optionen öffnen',title:rankHint(st),onclick:openOptions},
    el('span',{class:'gicon','aria-hidden':'true'},icon(st.cur[2])),
    el('span',{class:'gtext'},el('b',{class:'gname'},st.cur[1]),segBar(st.pct)),
    el('span',{class:'gxp'},xp+' XP'),
    (S.streak||0)>1?el('span',{class:'gstreak','aria-hidden':'true'},'SERIE '+S.streak):null,
    el('span',{class:'gchev','aria-hidden':'true'},icon('ab')));
}
function updateChip(){document.querySelectorAll('.gchip').forEach(c=>c.replaceWith(chipNode()));}

/* ---------- Rang-Seite ---------- */
function rankCard(){
  const st=rankState();
  return el('div',{class:'rankcard'},el('span',{class:'ico','aria-hidden':'true'},icon(st.cur[2])),
    el('div',{class:'rk'},el('b',null,st.cur[1]),segBar(st.pct,'big'),
      el('small',null,st.xp+' XP · '+rankHint(st)),el('small',null,'Rang '+(st.i+1)+' von '+RANKS.length)),
    (S.streak||0)>1?el('span',{class:'gstreak'},'SERIE '+S.streak):null);
}
function rankLadder(){
  const st=rankState();
  return el('div',{class:'ladder'},...RANKS.map((r,i)=>{
    const done=i<=st.i,cur=i===st.i,top=i===RANK_TOP;
    return el('div',{class:'rung'+(done?' done':'')+(cur?' cur':'')+(top?' top':''),'aria-current':cur?'true':null},
      el('span',{class:'rn'},String(i+1).padStart(2,'0')),
      el('span',{class:'ri','aria-hidden':'true'},icon(r[2])),
      el('span',{class:'rt'},el('b',null,r[1]),el('small',null,top?r[0]+' XP und alles perfekt':r[0]+' XP')),
      el('span',{class:'rs'},icon(done?'haken':'schloss'),el('span',{class:'sr'},done?'erreicht':'noch nicht')));
  }));
}
function perfectionList(){
  const pf=perfection();
  return el('div',{class:'perf'},
    el('p',{class:'perfhead'},pf.all?'Alles perfekt – die Legende ist frei!':'Für die Legende fehlt noch: '+(pf.items.length-pf.done)+' von '+pf.items.length+' Bedingungen.'),
    ...pf.items.map(it=>{
      const done=it.have>=it.need;
      return el('div',{class:'prow'+(done?' done':'')},
        el('span',{class:'pm','aria-hidden':'true'},icon(done?'haken':'schloss')),
        el('span',{class:'pt'},it.label,el('span',{class:'pbar','aria-hidden':'true'},el('i',{style:'width:'+Math.round(100*Math.min(1,it.have/it.need))+'%'}))),
        el('b',{class:'pn'},it.have+'/'+it.need));
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
function openOptions(){
  closeOptions();
  const st=rankState(),pf=perfection(),inLab=S.view.kind==='lab';
  const m=modal([
    el('h2',null,'Optionen'),
    el('div',{class:'optrank'},icon(st.cur[2],'big'),
      el('div',{class:'orx'},el('b',null,st.cur[1]),segBar(st.pct,'big'),el('small',null,st.xp+' XP · '+rankHint(st)))),
    el('div',{class:'optlist'},
      optRow('plakette','Alle Ränge',pf.all?'Alles perfekt!':'Legende: '+pf.done+' von '+pf.items.length+' Bedingungen',()=>{closeOptions();go({kind:'home',tab:'rang'});}),
      inLab?null:optRow('kolben','Bruchlabor','Erweitern und Kürzen ausprobieren',()=>{
        closeOptions();const prev=JSON.parse(JSON.stringify(S.view));go({kind:'lab',from:'opt',back:prev});}),
      optRow('pfad','Lernpfad','Weiter geht’s',()=>{closeOptions();go({kind:'home',tab:'pfad'});}),
      optRow('schluessel','Hilfe bei Problemen','Wenn etwas nicht klappt',()=>{closeOptions();openProblemHelp();})),
    optionsExtra(),
    el('div',{class:'optfoot'},
      el('button',{type:'button',class:'btn alt small danger',onclick:resetProgress},'Fortschritt löschen'),
      el('button',{type:'button',class:'btn',onclick:closeOptions},'Schließen'))]);
  m.classList.add('optmodal');optModal=m;
  m.addEventListener('click',e=>{if(e.target===m)closeOptions();});
  const first=m.querySelector('.optbtn');if(first)first.focus();
}
/* Textgröße: „Normal“ passt sich automatisch dem Display an, die anderen Stufen vergrößern oder verkleinern dazu */
const TEXT_SIZES=[['s','Klein'],['m','Normal'],['l','Groß'],['xl','Sehr groß']];
function applyUi(){document.documentElement.dataset.size=(S.ui&&S.ui.size)||'m';}
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

