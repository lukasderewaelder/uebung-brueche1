'use strict';
function gridDims(d){
  for(let r=Math.floor(Math.sqrt(d));r>=2;r--)if(d%r===0)return [r,d/r];
  return null;
}
function cellShape(kind,i,d,dims,sh){
  if(kind==='strip'){const w=360/d;return S_('rect',{x:1+i*w,y:1,width:w,height:sh||56});}
  if(kind==='circle'){
    if(d===1)return S_('circle',{cx:102,cy:102,r:98});
    const a0=-Math.PI/2+i*2*Math.PI/d,a1=-Math.PI/2+(i+1)*2*Math.PI/d,r=98,c=102;
    const x0=c+r*Math.cos(a0),y0=c+r*Math.sin(a0),x1=c+r*Math.cos(a1),y1=c+r*Math.sin(a1);
    return S_('path',{d:`M${c} ${c} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${(a1-a0)>Math.PI?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`});
  }
  const [rows,cols]=dims,cs=Math.min(48,360/cols),r=Math.floor(i/cols),c=i%cols;
  return S_('rect',{x:1+c*cs,y:1+r*cs,width:cs,height:cs});
}
/* Gemeinsame Zeichenfunktion. filled: Set mit Indizes. opts.onToggle(i)->neuer Zustand */
function drawCells(kind,d,dims,filled,opts={}){
  let vb,maxW;
  const sh=opts.tall?110:56; /* hohe Streifen für kleine Karten */
  if(kind==='strip'){vb='0 0 362 '+(sh+2);maxW=opts.maxW||460;}
  else if(kind==='circle'){vb='0 0 204 204';maxW=opts.maxW||210;}
  else{const [rows,cols]=dims,cs=Math.min(48,360/cols);vb=`0 0 ${cols*cs+2} ${rows*cs+2}`;maxW=opts.maxW||(cols*cs*1.3+2);}
  const svg=S_('svg',{viewBox:vb,class:'fracsvg',role:'img','aria-label':opts.label||'Bruchbild'});
  svg.style.maxWidth=(maxW/16).toFixed(3)+'rem';
  if(maxW<=150)svg.classList.add('sm'); /* kleine Bilder: Linien in fester Stärke, damit man die Teile zählen kann */
  if(opts.onToggle)svg.classList.add('interactive');
  for(let i=0;i<d;i++){
    const on=filled.has(i);
    const g=S_('g',{class:'cell'+(on?' on':'')},cellShape(kind,i,d,dims,sh));
    if(opts.onToggle){
      g.setAttribute('role','button');g.setAttribute('tabindex','0');
      g.setAttribute('aria-pressed',String(on));g.setAttribute('aria-label','Teil '+(i+1));
      const fire=()=>{const s=opts.onToggle(i);if(typeof s==='boolean'){g.classList.toggle('on',s);g.setAttribute('aria-pressed',String(s));}};
      let down=false;
      g.addEventListener('pointerdown',()=>{down=true;});
      g.addEventListener('pointerup',e=>{if(down){down=false;e.preventDefault();fire();}});
      g.addEventListener('pointercancel',()=>{down=false;});
      g.addEventListener('pointerleave',()=>{down=false;});
      g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fire();}});
    }
    svg.append(g);
  }
  if(opts.onToggle)svg.removeAttribute('role');
  return svg;
}
const firstN=(n)=>new Set(Array.from({length:n},(_,i)=>i));
/* Welche Teile gefärbt sind: opts.filled (Set, z. B. „Dein Bild“) vor opts.fill (gespeicherte Indexliste) vor den ersten n.
   Fehlt die Liste (alter Spielstand) oder ist sie ungültig, werden die ersten n gefärbt. */
const validFill=(a,n,d)=>Array.isArray(a)&&a.length===n&&a.every(i=>Number.isInteger(i)&&i>=0&&i<d)&&new Set(a).size===n;
function fillOf(n,d,opts){
  if(opts&&opts.filled)return opts.filled;
  if(opts&&validFill(opts.fill,n,d))return new Set(opts.fill);
  return firstN(n);
}
/* n gefärbte von d Teilen als sortierte Indexliste: mit Wahrscheinlichkeit pClassic die ersten n (das bekannte Bild),
   sonst 1–3 Gruppen mit Lücken dazwischen (Kreis: zusätzlich gedreht, auch über 12 Uhr) – nie gleich „die ersten n“.
   So lässt sich Gleichheit nicht am Umriss erkennen, man muss zählen oder rechnen. Zufall nur aus R; beim Erzeugen
   der Aufgabe aufrufen (und als Liste speichern), nie beim Zeichnen. */
function scatterFill(n,d,kind,R,o){
  o=o||{};
  const first=()=>Array.from({length:n},(_,i)=>i);
  if(n<=0||n>=d||R.chance(o.pClassic||0))return first();
  const circ=kind==='circle';
  const cap=o.maxGroups||((kind==='strip'&&d>8)?2:3); /* kleine Streifenzellen: höchstens 2 Gruppen */
  const maxG=Math.min(cap,n,circ?d-n:d-n+1);
  const split=(total,parts,min)=>{const a=Array(parts).fill(min);for(let k=total-parts*min;k>0;k--)a[R.int(0,parts-1)]++;return a;};
  const weights=[1,2,1].slice(0,maxG);
  for(let t=0;t<30;t++){
    let g=1,r=R.int(1,weights.reduce((x,y)=>x+y,0));
    for(let k=0;k<weights.length;k++){if(r<=weights[k]){g=k+1;break;}r-=weights[k];}
    const parts=split(n,g,1),cells=[];
    if(circ){
      const gaps=split(d-n,g,1),rot=R.int(0,d-1);
      let pos=0;
      parts.forEach((len,j)=>{for(let i=0;i<len;i++)cells.push((pos+i+rot)%d);pos+=len+gaps[j];});
    }else{
      /* Lücken vorn, zwischen den Gruppen (mindestens 1) und hinten: erst 1 je innere Lücke, den Rest frei verteilen */
      const gap=Array(g+1).fill(0);
      for(let j=1;j<g;j++)gap[j]=1;
      for(let k=d-n-(g-1);k>0;k--)gap[R.int(0,g)]++;
      let pos=gap[0];
      parts.forEach((len,j)=>{for(let i=0;i<len;i++)cells.push(pos+i);pos+=len+gap[j+1];});
    }
    cells.sort((x,y)=>x-y);
    if(cells.some((c,i)=>c!==i))return cells;
  }
  return Array.from({length:n},(_,i)=>i+1);
}
function drawFractionStrip(n,d,opts){return drawCells('strip',d,null,fillOf(n,d,opts),opts);}
function drawFractionCircle(n,d,opts){return drawCells('circle',d,null,fillOf(n,d,opts),opts);}
function drawFractionGrid(n,d,rows,cols,opts){return drawCells('grid',d,[rows,cols],fillOf(n,d,opts),opts);}
/* Darstellung nach Modus (strip | circle | grid) */
function drawMode(mode,n,d,opts){
  if(mode==='circle')return drawFractionCircle(n,d,opts);
  if(mode==='grid'){const dm=gridDims(d)||[1,d];return drawFractionGrid(n,d,dm[0],dm[1],opts);}
  return drawFractionStrip(n,d,opts);
}
/* Rechteckeinteilung nur, wenn Zeilen und Spalten gut lesbar bleiben (höchstens 9 je Richtung) */
function gridOK(d){const g=gridDims(d);return !!g&&Math.max(g[0],g[1])<=9;}
/* Darstellung nach Nenner: Streifen und Kreis nur mit kleinen Nennern (bis 12),
   große Nenner nur als Rechteckeinteilung */
function pickMode(d,R,max){
  const m=[],lim=max||36;
  if(d<=12){m.push('strip');if(d>=2)m.push('circle');}
  if(d>=4&&d<=lim&&gridOK(d))m.push('grid');
  return m.length?R.pick(m):null;
}

