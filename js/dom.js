'use strict';
/* ---------- 3 DOM und SVG ---------- */
function el(tag,attrs,...kids){
  const e=document.createElement(tag);
  if(attrs)for(const k in attrs){
    const v=attrs[k];
    if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k.startsWith('on')&&typeof v==='function')e.addEventListener(k.slice(2),v);
    else e.setAttribute(k,v===true?'':String(v));
  }
  for(const kid of kids.flat(Infinity)){
    if(kid==null||kid===false)continue;
    if(typeof kid==='string'&&kid.indexOf('/')>=0)e.append(...[].concat(fracText(kid))); /* Brüche im Text immer mit Bruchstrich */
    else e.append(kid);
  }
  return e;
}
/* Brüche im Text stehen immer mit Bruchstrich: „a/b“ und „w a/b“ (gemischte Zahl) werden zur Bruchdarstellung, der Rest bleibt Text.
   Gilt für jeden Text, der über el() eingesetzt wird; Text ohne Schrägstrich bleibt unverändert (Zeichenkette). */
function fracText(s){
  if(typeof s!=='string'||s.indexOf('/')<0)return s;
  const re=/(\d{1,2}) (\d+)\/(\d+)|(\d+)\/(\d+)/g,out=[];
  let last=0,m;
  const push=(t)=>{if(t)out.push(t);};
  while((m=re.exec(s))){
    push(s.slice(last,m.index));
    if(m[1]!=null){
      if(+m[2]<+m[3])out.push(mixed(+m[1],+m[2],+m[3]));
      else{push(m[1]+' ');out.push(frac(+m[2],+m[3]));}
    }else out.push(frac(+m[4],+m[5]));
    last=re.lastIndex;
  }
  if(!out.length)return s;
  push(s.slice(last));
  return out;
}
/* Text eines Elements setzen (mit Bruchstrich, wie el) */
function setText(node,text){node.replaceChildren(...[].concat(fracText(String(text))));}
const SVGNS='http://www.w3.org/2000/svg';
function S_(tag,attrs,...kids){
  const e=document.createElementNS(SVGNS,tag);
  if(attrs)for(const k in attrs)e.setAttribute(k,String(attrs[k]));
  for(const kid of kids.flat())if(kid!=null)e.append(kid);
  return e;
}
/* Linien-Symbol aus dem Sprite (Blaupausen-Design) */
function icon(name,cls){
  const s=S_('svg',{class:'ic'+(cls?' '+cls:''),viewBox:'0 0 24 24','aria-hidden':'true',focusable:'false'});
  s.append(S_('use',{href:'#i-'+name}));
  return s;
}
/* Maßlinie mit Pfeilspitzen und Beschriftung */
function dimCap(text){return el('div',{class:'dimcap'},el('i'),el('span',null,text),el('i'));}
/* Sterne: n von max gefüllt */
function starNodes(n,max=3){
  const w=el('span',{class:'stars',role:'img','aria-label':n+' von '+max+' Sternen'});
  for(let i=0;i<max;i++)w.append(icon('stern',i<n?'fill':''));
  return w;
}
/* renderFraction(n, d): Bruch immer mit waagerechtem Bruchstrich */
function frac(n,d,cls){
  return el('span',{class:'frac'+(cls?' '+cls:''),role:'math','aria-label':n+' durch '+d},
    el('span',{class:'num'},String(n)),el('span',{class:'den'},String(d)));
}
/* renderMixed(w, n, d) */
function mixed(w,n,d){
  return el('span',{class:'mixed',role:'math','aria-label':w+' und '+n+' durch '+d},
    el('span',{class:'whole'},String(w)),frac(n,d));
}
const op=(t)=>el('span',{class:'op'},t);
function eq(...parts){
  const d=el('div',{class:'eq'});
  parts.forEach(x=>d.append(typeof x==='string'?op(x):x));
  return d;
}
const line=(...parts)=>el('div',{class:'sol-line'},...parts);
const strong=(t)=>el('strong',null,String(t));

/* ---- Bruchbilder: Streifen, Kreis, Gitter ---- */
