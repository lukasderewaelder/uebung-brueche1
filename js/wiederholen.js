'use strict';
/* =====================================================================
   P14 Tägliche Wiederholungsrunde (Reiter „Wiederholen“): 5 Aufgaben aus geschafften Stationen.
   Auswahl: bevorzugt Stationen mit früheren Fehlern und solche, die länger zurückliegen; höchstens 2 Aufgaben je Station.
   Je Station merkt sich S.rev[id] = {err (Fehlversuche, Tipps, Lösungen), last (Tag der letzten Bearbeitung)}.
   Die Runde zählt wie jede Runde für die Wochen-Serie (P19). Sie ist eine Runde mit Aufgaben mehrerer Arten (wie die Abschlusschecks).
   ===================================================================== */
const WH_SIZE=5;
function revOf(id){S.rev=S.rev&&typeof S.rev==='object'?S.rev:{};return S.rev[id]||(S.rev[id]={err:0,last:null});}
/* nach jeder Aufgabe einer Station: Fehler zählen, Datum merken */
function revRecord(id,ok){if(!TASKS[id]||TASKS[id].quick)return;const r=revOf(id);if(!ok)r.err++;r.last=dayKey(new Date());}
const daysSince=(k)=>{if(!k)return 99;const [y,m,d]=k.split('-').map(Number);return Math.max(0,Math.round((Date.now()-new Date(y,m-1,d).getTime())/864e5));};
/* Stationen, die wiederholt werden können: im Lernpfad, geschafft, keine Labore, Tests oder Checks */
const whPool=()=>PATH.filter(p=>!p.final&&!isLab(p.id)&&!QCHK[p.id]&&TASKS[p.id]&&stationPassed(p.id)).map(p=>p.id);
function whPlan(R){
  R=R||RNG;
  const pool=whPool();
  if(!pool.length)return [];
  const score=(id)=>{const r=(S.rev&&S.rev[id])||{err:0,last:null};return r.err*3+Math.min(daysSince(r.last),30)+Math.random()*2;};
  const ranked=pool.map(id=>({id,s:score(id)})).sort((a,b)=>b.s-a.s).map(x=>x.id);
  const out=[];
  for(const id of ranked){if(out.length>=WH_SIZE)break;out.push(id);}
  for(const id of ranked){if(out.length>=WH_SIZE)break;if(out.filter(x=>x===id).length<2)out.push(id);}
  return R.shuffle(out).slice(0,WH_SIZE);
}
const whDoneToday=()=>!!(S.whDay&&S.whDay===dayKey(new Date()));
TASKS.WH=proxyOf({area:'Wiederholen',name:'Wiederholung heute',desc:'5 Aufgaben aus geschafften Stationen – das Gehirn vergisst sonst.',notes:[],size:WH_SIZE,
  notesFor(t){return t&&TASKS[t.type]?TASKS[t.type].notes:[];},
  ctx(round){
    if(!Array.isArray(round.plan)||!round.plan.length)round.plan=whPlan();
    const i=Math.min(round.results.length,WH_SIZE-1);
    return {id:round.plan[i%Math.max(1,round.plan.length)]||null};
  },
  gen(level,R,ctx){
    const id=(ctx&&ctx.id)||R.pick(PATH.filter(p=>p.must&&!p.final&&!isLab(p.id)&&TASKS[p.id]&&!TASKS[p.id].quick).map(p=>p.id));
    const T=TASKS[id];
    return T.gen(levelOf(id),R,T.ctx?T.ctx({results:[],cur:null,size:T.size},levelOf(id)):null);
  }
});
/* Karte oben im Reiter „Wiederholen“ */
function whCard(){
  const pool=whPool(),done=whDoneToday();
  if(!pool.length)return el('div',{class:'whcard empty'},el('b',null,'Deine Wiederholung heute'),el('small',null,'Schaffe zuerst eine Station im Lernpfad. Dann wartet hier jeden Tag eine kurze Runde.'));
  const start=()=>{const k=keyOf('WH',1);S.rounds[k]={results:[],cur:null,size:WH_SIZE};S.levelByType.WH=1;persist();go({kind:'practice',id:'WH'});};
  return bigBtn(done?'haken':'undo',start,'Deine Wiederholung heute',done?'Heute schon geschafft. Noch eine Runde?':'5 Aufgaben aus deinen geschafften Stationen.',null,done?'':'go');
}
