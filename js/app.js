'use strict';
/* ---------- Start ---------- */
(function boot(){
  try{localStorage.setItem(KEY+'_probe','1');localStorage.removeItem(KEY+'_probe');}catch(e){Store.ok=false;}
  if((S.schema||1)<3){S.rounds={};Object.keys(S.games||{}).forEach(k=>{S.games[k].state=null;});S.schema=3;persist();}
  if((S.schema||1)<4){migrate4(S);S.view={kind:'home',tab:'pfad'};S.schema=4;persist();}
  if((S.schema||1)<5){Object.keys(S.games||{}).forEach(k=>{if(k.indexOf('S02')===0)S.games[k].state=null;});S.schema=5;persist();}
  if((S.schema||1)<6){migrate6(S);S.schema=6;persist();}
  if((S.schema||1)<7){migrateIntro(S);S.schema=7;persist();}
  if(!S.perfect)S.perfect={};
  if(!S.intro||typeof S.intro!=='object'||Array.isArray(S.intro))S.intro={};
  if(!S.ui)S.ui={size:'m'};
  applyUi();
  if(S.rankSeen==null){S.rankSeen=rankState().i;persist();}
  if(!S.view||(S.view.kind==='home'&&S.view.tab==='aufgaben'))S.view={kind:'home',tab:'ueben',group:S.view&&S.view.group};
  try{history.replaceState({v:S.view},'');}catch(e){}
  renderAll();
})();
