'use strict';
/* =====================================================================
   Zahlenstrahl-Werkzeug (Widget) für die Zahlenstrahl-Aufgaben
   Zeigt einen Strahl mit Einteilung, lässt Punkte setzen (Tippen rastet am nächsten Strich ein, ◀ ▶ gehen einen Strich weiter,
   auch mit den Pfeiltasten) und – bei Einteilungen mit mehr als 12 Abschnitten – eine Lupe: oben die Übersicht mit
   Rahmen, darunter das vergrößerte Fenster. Alles, was das Kind tut, liegt serialisierbar im Entwurf (view.draft[key]):
   parts (Teile je Ganzem), pts (Strichnummern der gesetzten Punkte oder null), act (aktiver Punkt), win (Anfang der Lupe),
   secs (gezählte Abschnitte).
   ===================================================================== */
const NL_LEN=326;     /* Strahllänge in der Zeichnung (wie numberLineGeometry) */
const NL_MINSP=26;    /* kleinster Strichabstand ohne Lupe, darunter erscheint die Lupe */
const NL_SPAN=8;      /* Abschnitte im Fenster der Lupe (je ≥ 40 px breit) */
const NL_MAXSTEPS=24; /* höchstens so viele Abschnitte je Strahl */
const nlNeedsLupe=(steps)=>steps>0&&NL_LEN/steps<NL_MINSP;
/* Anfang des Fensters so, dass der Strich idx mittig liegt, das Fenster aber im Strahl bleibt */
const nlWinStart=(steps,idx,span)=>{span=Math.min(span||NL_SPAN,steps);return Math.max(0,Math.min(steps-span,Math.round(idx-span/2)));};
/* Obergrenze für „Teile je Ganzem“ bei einem Strahl über len Ganze */
const nlMaxParts=(len)=>Math.floor(NL_MAXSTEPS/len);

/* cfg: from, to (ganze Zahlen);
   parts (feste Teile je Ganzem) oder choose:{max,start} (das Kind stellt sie ein);
   place: ['A',…] Punkte, die das Kind setzt (mehrere: Auswahl A, B, C); shown: [{i|n,d,text}] vorgegebene Punkte;
   labels, halfLong: wie drawNumberLine; strip:{n,d,always,hint}: Bruchstreifen (immer oder ab Tipp hint, Standard 2);
   secs:true: Abschnitte antippen und mitzählen; key: Name des Teil-Entwurfs (mehrere Strahlen in einer Aufgabe) */
function lineWidget(view,host,cfg){
  const key=cfg.key||'nl',D=view.draft,s=D[key]||(D[key]={}),place=cfg.place||[];
  if(cfg.choose&&s.parts==null)s.parts=cfg.choose.start||1;
  if(!Array.isArray(s.pts)||s.pts.length!==place.length)s.pts=place.map(()=>null);
  if(s.act==null||s.act>=place.length)s.act=0;
  if(!Array.isArray(s.secs))s.secs=[];
  const partsNow=()=>cfg.choose?s.parts:cfg.parts;
  const stepsNow=()=>(cfg.to-cfg.from)*partsNow();
  const box=el('div',{class:'nlbox'});
  view.inputs[key]=box;
  place.forEach((_,k)=>{
    const on=(f)=>(...cs)=>box.querySelectorAll('.nl-mark.pt'+k).forEach(n=>n.classList[f](...cs));
    view.inputs[key+'p'+k]={classList:{add:on('add'),remove:on('remove')}};
  });

  const setPt=(i)=>{
    if(view.locked()||!place.length)return;
    s.pts[s.act]=i;
    const st=stepsNow();
    if(nlNeedsLupe(st)&&(s.win==null||i<s.win||i>s.win+NL_SPAN))s.win=nlWinStart(st,i);
    view.save();build(true);
  };
  const nudge=(dir)=>{
    if(view.locked()||!place.length)return;
    const st=stepsNow(),cur=s.pts[s.act];
    setPt(cur==null?(dir>0?0:st):Math.max(0,Math.min(st,cur+dir)));
  };
  const toggleSec=(i)=>{
    if(view.locked())return;
    const j=s.secs.indexOf(i);if(j>=0)s.secs.splice(j,1);else s.secs.push(i);
    view.save();build();
  };
  const stripNow=()=>{const z=cfg.strip;if(!z)return null;const on=z.always||(view.st&&view.st.hint>=(z.hint||2));return on?{n:z.n,d:z.d||partsNow()}:null;};
  const marks=()=>{
    const out=(cfg.shown||[]).map(p=>Object.assign({},p,{text:p.text==null?'':p.text,cls:'fix'}));
    s.pts.forEach((i,k)=>{if(i!=null)out.push({i,text:place.length>1?place[k]:'',cls:'pt'+k+(place.length>1&&k===s.act?' act':'')});});
    return out;
  };
  const draw=(extra)=>drawNumberLine(Object.assign({from:cfg.from,to:cfg.to,parts:partsNow(),marks:marks(),labels:cfg.labels,halfLong:cfg.halfLong,label:cfg.label},extra));

  const stepperBox=cfg.choose?stepper(view,'Teile je Ganzem',()=>s.parts,v=>{
    if(view.locked())return;
    s.parts=v;s.pts=place.map(()=>null);s.win=0;view.save();build();
  },1,cfg.choose.max):null;

  function build(keepFocus){
    const focusSvg=keepFocus||(document.activeElement&&box.contains(document.activeElement)&&document.activeElement.tagName.toLowerCase()==='svg');
    const st=stepsNow(),locked=view.locked(),can=place.length>0&&!locked;
    box.replaceChildren();
    const pick=can?setPt:null,nd=can?nudge:null,cur=s.pts[s.act];
    if(nlNeedsLupe(st)){
      const w0=Math.min(s.win==null?0:s.win,Math.max(0,st-NL_SPAN)),span=Math.min(NL_SPAN,st);
      box.append(el('div',{class:'nlcap'},'Übersicht'),
        draw({frame:[w0,w0+span],label:'Übersicht, tippe auf eine Stelle, um die Lupe zu verschieben',onPick:(i)=>{s.win=nlWinStart(st,i);view.save();build();}}),
        el('div',{class:'nlcap'},'Lupe'),
        draw({win:[w0,w0+span],labels:'wholes',label:'Lupe',onPick:pick,onNudge:nd,cur}));
    }else{
      box.append(draw({strip:stripNow(),secs:cfg.secs?{on:new Set(s.secs),onTap:locked?null:toggleSec}:null,onPick:pick,onNudge:nd,cur}));
    }
    if(cfg.secs)box.append(el('div',{class:'nlcount','aria-live':'polite'},'Gezählt: '+s.secs.length));
    if(stepperBox){stepperBox.upd();box.append(el('div',{class:'nlrow'},stepperBox));}
    const row=el('div',{class:'nlrow'});
    if(place.length>1){
      place.forEach((letter,k)=>{
        const b=el('button',{type:'button',class:'nlchip'+(s.pts[k]!=null?' set':''),'aria-pressed':String(k===s.act),'aria-label':'Punkt '+letter+(s.pts[k]!=null?' (gesetzt)':' (noch nicht gesetzt)')},letter);
        b.disabled=locked;
        b.addEventListener('click',()=>{if(view.locked())return;s.act=k;view.save();build();});
        row.append(b);
      });
    }
    if(place.length){
      const mk=(sym,label,dir)=>{
        const b=el('button',{type:'button',class:'btn','aria-label':label},sym);
        b.disabled=locked;
        b.addEventListener('click',()=>nudge(dir));
        return b;
      };
      row.append(mk('◀','Punkt einen Strich nach links',-1),mk('▶','Punkt einen Strich nach rechts',1));
    }
    if(row.childNodes.length)box.append(row);
    if(focusSvg){const f=box.querySelector('svg[tabindex]');if(f)f.focus({preventScroll:true});}
  }
  const prev=view.onHint;
  view.onHint=()=>{if(prev)prev();build();};
  host.append(box);
  build();
  return {box,state:s,parts:partsNow,steps:stepsNow,build};
}
