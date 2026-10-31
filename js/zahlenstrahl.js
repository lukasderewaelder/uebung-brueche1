'use strict';
/* =====================================================================
   Zahlenstrahl-Aufgaben Z01–Z08 (Thema „Brüche am Zahlenstrahl“)
   Gleicher Vertrag wie in tasks.js: gen, prompt, render, validate, solution, hints; Antworten liegen im Entwurf (draft).
   Strichnummern zählen ab dem Strich 0; „Teile je Ganzem“ = Zahl der Abschnitte eines Ganzen (m).
   Fehlercodes (im Feedback benannt): ticks (Striche statt Abschnitte), whole (ganzen Strahl statt ein Ganzes),
   einteilung (Nenner geht nicht in die Einteilung auf), uneven (ungleiche Abschnitte), form (Wert stimmt, Nenner nicht), pos.
   ===================================================================== */
const NL_LET=['A','B','C'];
const ft=(n,d)=>n+'/'+d;
/* Strichnummern i (1 … steps−1) ohne ganze Zahlen (Vielfache von m), k verschiedene, sortiert */
function nlIdxs(R,k,steps,m){
  const pool=[];for(let i=1;i<steps;i++)if(i%m!==0)pool.push(i);
  return R.shuffle(pool).slice(0,Math.min(k,pool.length)).sort((a,b)=>a-b);
}
/* Strahl mit Punkten für Musterlösungen: Beschriftung Buchstabe oder Bruch */
const nlSol=(from,to,parts,idxs,letters,extra)=>drawNumberLine(Object.assign({from,to,parts,labels:'wholes',marks:idxs.map((i,k)=>({i,text:letters?letters[k]:''}))},extra));
const nlOffBy=(a,b)=>Math.abs(a-b)===1;
/* Ja/Nein-Knöpfe: Antippen markiert nur, gewertet wird mit „Prüfen“ */
function nlYesNo(view,host,key){
  const d=view.draft,row=el('div',{class:'yesno'});
  [['ja','haken','Ja'],['nein','kreuz','Nein']].forEach(([v,ic,label])=>{
    const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d[key]===v)},icon(ic),label);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d[key]=v;view.save();
      row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    });
    view.inputs[key+v]=b;row.append(b);
  });
  host.append(row);
}
/* Strahl von 0 bis 1 mit ungleichen Abschnitten (Strich k verschoben); nur zum Erkennen */
function nlDrawUneven(m,k,shift){
  const W=362,pad=18,len=W-2*pad,y=44,svg=S_('svg',{viewBox:`0 0 ${W} 70`,class:'fracsvg nline',role:'img','aria-label':'Zahlenstrahl von 0 bis 1'});
  svg.style.maxWidth='28.75rem';
  svg.append(S_('line',{class:'nl-axis',x1:pad,y1:y,x2:W-pad,y2:y}));
  for(let i=0;i<=m;i++){
    const x=pad+(i+(i===k?shift:0))/m*len,major=i===0||i===m;
    svg.append(S_('line',{class:'nl-tick'+(major?' major':''),x1:x,x2:x,y1:y-(major?9:5),y2:y+(major?9:5)}));
    if(major){const tx=S_('text',{class:'nl-num',x,y:y+24,'text-anchor':'middle'});tx.textContent=String(i?1:0);svg.append(tx);}
  }
  return svg;
}
/* Wahlkarten mit einem Strahl je Karte (ein Strahl wird gewählt) */
function nlPickList(view,host,items,key){
  const d=view.draft,list=el('div',{class:'nlpicks',role:'group','aria-label':'Strahlen'});
  items.forEach((svg,j)=>{
    const b=el('button',{type:'button',class:'pick','aria-pressed':String(d[key]===j),'aria-label':'Strahl '+(j+1)},svg);
    b.disabled=view.locked();
    b.addEventListener('click',()=>{
      if(view.locked())return;
      d[key]=j;view.save();
      list.querySelectorAll('button').forEach((x,i)=>x.setAttribute('aria-pressed',String(i===j)));
    });
    view.inputs[key+j]=b;list.append(b);
  });
  host.append(list);
}

/* ---------- Z01 Einteilung erkennen ---------- */
TASKS.Z01={area:'Zahlenstrahl',name:'Einteilung erkennen',desc:'Abschnitte zählen und gleiche Einteilungen erkennen.',notes:['M8'],size:5,
  gen(level,R){
    const kind=R.pick(level===1?['count','count','pick']:['count','pick','even']);
    if(kind==='count'){
      if(level===1)return {type:'Z01',level,kind,u:1,m:R.pick([2,3,4,5,6,7,8,9,10]),avoid:[]};
      const u=R.pick([2,3,4]);
      return {type:'Z01',level,kind,u,m:R.pick([2,3,4,5,6].filter(x=>u*x<=12)),avoid:[]};
    }
    if(kind==='pick'){
      const u=level===1?1:2,m=R.pick(level===1?[3,4,5,6,7,8]:[3,4,5]);
      const opts=R.shuffle([m,m-1,R.pick(u===1?[m+1,m+2]:[m+1])]);
      return {type:'Z01',level,kind,u,m,opts,ans:opts.indexOf(m),trap:opts.indexOf(m-1),avoid:[]};
    }
    const m=R.pick([4,5,6,7,8]),equal=R.chance(0.5);
    return {type:'Z01',level,kind,u:1,m,equal,k:R.int(1,m-1),shift:R.pick([-0.35,0.35]),avoid:[]};
  },
  prompt(t,h){
    if(t.kind==='count')h.append(el('p',{class:'q'},t.u===1?['In wie viele gleich große Abschnitte ist die Strecke von 0 bis 1 geteilt?']:['In wie viele gleich große Abschnitte ist ',strong('ein Ganzes'),' geteilt?']));
    else if(t.kind==='pick')h.append(el('p',{class:'q'},t.u===1?['Auf welchem Strahl ist die Strecke von 0 bis 1 in genau ',strong(t.m),' gleich große Abschnitte geteilt?']:['Auf welchem Strahl ist jedes Ganze in genau ',strong(t.m),' gleich große Abschnitte geteilt?']));
    else h.append(el('p',{class:'q'},'Sind alle Abschnitte zwischen 0 und 1 gleich groß?'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='count'){
      lineWidget(view,host,{from:0,to:t.u,parts:t.m,labels:'wholes',strip:t.level===1?{n:0,d:t.m,always:true}:null,secs:t.level===1,label:'Zahlenstrahl'});
      host.append(el('div',{class:'eq'},'Abschnitte:',intInput(view,'a','Anzahl der Abschnitte')));
    }else if(t.kind==='pick'){
      nlPickList(view,host,t.opts.map((p,j)=>drawNumberLine({from:0,to:t.u,parts:p,labels:'wholes',label:'Strahl '+(j+1),maxW:460})),'sel');
    }else{
      host.append(t.equal?drawNumberLine({from:0,to:1,parts:t.m,labels:'wholes',label:'Zahlenstrahl von 0 bis 1'}):nlDrawUneven(t.m,t.k,t.shift));
      nlYesNo(view,host,'ans');
    }
  },
  validate(t,d){
    if(t.kind==='count'){
      const a=getInt(d,'a');
      if(a===null)return invalid('Trage die Anzahl der Abschnitte ein.');
      if(a===t.m)return right(`Richtig! Ein Ganzes ist in ${t.m} gleich große Abschnitte geteilt.`);
      const marks={a:false};
      if(a===t.m+1||(t.u>1&&a===t.u*t.m+1))return wrong('ticks',`Du hast die Striche gezählt. Zähle die Abschnitte zwischen den Strichen: ${t.m} Abschnitte haben ${t.m+1} Striche.`,marks);
      if(t.u>1&&a===t.u*t.m)return wrong('whole',`Du hast alle Abschnitte des ganzen Strahls gezählt. Gefragt ist nur ein Ganzes, also die Strecke von 0 bis 1.`,marks);
      return wrong('count','Zähle die Abschnitte von 0 bis 1 noch einmal. Fange bei 0 an und zähle jeden Abschnitt.',marks);
    }
    if(t.kind==='pick'){
      if(d.sel==null)return invalid('Tippe auf einen Strahl.');
      if(d.sel===t.ans)return right(`Richtig! Auf diesem Strahl sind es ${t.m} Abschnitte.`);
      if(d.sel===t.trap)return wrong('ticks',`Dieser Strahl hat ${t.m} Striche, aber nur ${t.m-1} Abschnitte. Zähle die Abschnitte, nicht die Striche.`);
      return wrong('pick','Zähle bei jedem Strahl die Abschnitte zwischen 0 und 1.');
    }
    if(!d.ans)return invalid('Tippe auf Ja oder Nein.');
    const truth=t.equal?'ja':'nein';
    if(d.ans===truth)return right(t.equal?'Richtig! Alle Abschnitte sind gleich breit.':'Richtig! Ein Abschnitt ist breiter, ein anderer schmaler. Das ist keine gleichmäßige Einteilung.');
    return wrong(t.equal?'even':'uneven',t.equal?'Vergleiche die Abstände noch einmal: Alle Abschnitte sind hier gleich breit.':'Schau genau hin: Ein Strich sitzt nicht in der Mitte zwischen seinen Nachbarn. Die Abschnitte sind nicht gleich breit.');
  },
  solution(t){
    if(t.kind==='count'){
      const all=new Set(Array.from({length:t.u*t.m},(_,i)=>i));
      return [line(`Zähle die Abschnitte zwischen den Strichen, nicht die Striche selbst.`),line(`Ein Ganzes hat ${t.m} Abschnitte und ${t.m+1} Striche.`),
        drawNumberLine({from:0,to:t.u,parts:t.m,labels:'wholes',secs:{on:all}})];
    }
    if(t.kind==='pick')return [line(`Gesucht: ${t.m} Abschnitte. Ein Strahl mit ${t.m} Abschnitten hat ${t.m+1} Striche.`),drawNumberLine({from:0,to:t.u,parts:t.m,labels:'wholes'})];
    return [line(t.equal?'Alle Abschnitte sind gleich breit.':'Ein Strich ist verschoben: Die Abschnitte daneben sind verschieden breit.'),t.equal?drawNumberLine({from:0,to:1,parts:t.m,labels:'wholes'}):nlDrawUneven(t.m,t.k,t.shift)];
  },
  hints(t){
    if(t.kind==='count')return [['Die Striche begrenzen die Abschnitte. Zähle die Zwischenräume, nicht die Striche.'],['Fange bei 0 an und zähle jeden Abschnitt bis zur 1.'+(t.level===1?' Du kannst die Abschnitte antippen: Sie werden gefärbt und mitgezählt.':'')]];
    if(t.kind==='pick')return [['Zähle bei jedem Strahl die Abschnitte zwischen 0 und 1.'],[`Ein Strahl mit ${t.m} Strichen hat nur ${t.m-1} Abschnitte.`]];
    return [['Vergleiche die Abstände zwischen je zwei Strichen.'],['Alle Abschnitte müssen gleich breit sein, sonst ist die Einteilung ungleichmäßig.']];
  }
};

/* ---------- Z02 Ablesen ---------- */
TASKS.Z02={area:'Zahlenstrahl',name:'Brüche ablesen',desc:'Lies zu Punkten am Zahlenstrahl den Bruch ab.',notes:['M8'],size:5,
  gen(level,R){
    let u=1,m,k=1;
    if(level===1){u=R.pick([1,1,2]);m=R.pick(u===1?[2,3,4,5,6,8,9,10,12]:[2,3,4,5,6]);} /* auch Strahl bis 2: unechte Brüche */
    else{u=R.pick([1,1,2,3]);m=R.pick(u===1?[4,5,6,8,9,10,12]:u===2?[2,3,4,5,6]:[2,3,4]);k=R.int(2,3);}
    return {type:'Z02',level,u,m,idx:nlIdxs(R,k,u*m,m),avoid:[]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},t.idx.length===1?'Welcher Bruch gehört zum Punkt A?':'Gib zu jedem Punkt den Bruch an.'));},
  render(view,host){
    const t=view.task;
    lineWidget(view,host,{from:0,to:t.u,parts:t.m,labels:'wholes',shown:t.idx.map((i,k)=>({i,text:NL_LET[k]})),label:'Zahlenstrahl'});
    t.idx.forEach((_,k)=>host.append(el('div',{class:'eq'},NL_LET[k]+' =',fracInput(view,'r'+k))));
  },
  validate(t,d){
    const fr=t.idx.map((_,k)=>getFrac(d,'r'+k));
    if(fr.some(f=>!f))return invalid(MSG_FRAC_INVALID);
    const marks={};let first=null;
    fr.forEach((f,k)=>{
      const n=t.idx[k],okN=f.n===n,okD=f.d===t.m;
      marks['r'+k+'.n']=okN;marks['r'+k+'.d']=okD;
      if(!first&&!(okN&&okD))first={f,n,k};
    });
    if(!first)return right('Richtig! Der Nenner zählt die Abschnitte eines Ganzen, der Zähler die Abschnitte ab 0.');
    const {f,n}=first,L=t.idx.length>1?NL_LET[first.k]+': ':'';
    if(equivalent(f.n,f.d,n,t.m))return soft('form',`${L}Der Wert stimmt. Lies den Bruch passend zur Einteilung ab: ${ft(n,t.m)}.`,marks);
    if(f.d===t.m+1||(t.u>1&&f.d===t.u*t.m+1))return wrong('ticks',`${L}Du hast Striche gezählt. Der Nenner ist die Zahl der Abschnitte eines Ganzen.`,marks);
    if(t.u>1&&f.d===t.u*t.m)return wrong('whole',`${L}Der Nenner zeigt, in wie viele Abschnitte ein Ganzes geteilt ist, nicht der ganze Strahl.`,marks);
    if(f.d===t.m)return wrong('count',`${L}Der Nenner stimmt. Zähle die Abschnitte von 0 bis zum Punkt: Das ist der Zähler.`,marks);
    return wrong('read',`${L}Prüfe Zähler und Nenner: Der Nenner zählt die Abschnitte eines Ganzen, der Zähler die Abschnitte von 0 bis zum Punkt.`,marks);
  },
  solution(t){
    return [line(`Ein Ganzes ist in ${t.m} Abschnitte geteilt, also ist der Nenner ${t.m}.`),
      ...t.idx.map((n,k)=>line(`${NL_LET[k]}: ${n} Abschnitte von 0 aus. `,frac(n,t.m))),
      nlSol(0,t.u,t.m,t.idx,t.idx.map((n,k)=>NL_LET[k]+' = '+ft(n,t.m)))];
  },
  hints(t){return [['Der Nenner sagt, in wie viele gleich große Abschnitte ein Ganzes geteilt ist.'],['Der Zähler sagt, wie viele Abschnitte du von 0 aus bis zum Punkt zählst.']];}
};

/* ---------- Z03 Eintragen (Einteilung vorgegeben) ---------- */
TASKS.Z03={area:'Zahlenstrahl',name:'Brüche eintragen',desc:'Trage Brüche auf einem eingeteilten Zahlenstrahl ein.',notes:['M8'],size:5,
  gen(level,R){
    let u=1,m,k=1;
    if(level===1){u=R.pick([1,1,2]);m=R.pick(u===1?[2,3,4,5,6,8,9,10,12]:[2,3,4,5,6]);} /* auch Strahl bis 2: unechte Brüche */
    else{u=R.pick([1,1,2,3]);m=R.pick(u===1?[4,5,6,8,9,10,12]:u===2?[2,3,4,5,6]:[2,3,4]);k=R.int(2,3);}
    return {type:'Z03',level,u,m,idx:nlIdxs(R,k,u*m,m),avoid:[]};
  },
  prompt(t,h){
    if(t.idx.length===1)h.append(el('p',{class:'q'},'Trage ',frac(t.idx[0],t.m),' ein.'));
    else h.append(el('p',{class:'q'},'Trage ein: ',...t.idx.map((n,k)=>[el('b',null,NL_LET[k]),' = ',frac(n,t.m),k<t.idx.length-1?'   ':''])));
  },
  render(view,host){
    const t=view.task;
    lineWidget(view,host,{from:0,to:t.u,parts:t.m,labels:'wholes',place:NL_LET.slice(0,t.idx.length),
      strip:t.idx.length===1&&t.idx[0]<=t.m?{n:t.idx[0],d:t.m,hint:2}:null,label:'Zahlenstrahl'});
  },
  validate(t,d){
    const s=d.nl||{},pts=s.pts||[];
    if(pts.length!==t.idx.length||pts.some(p=>p==null))return invalid(t.idx.length===1?'Setze zuerst den Punkt: tippe auf den Strahl oder nutze ◀ ▶.':'Setze zuerst alle Punkte: wähle A, B, C und tippe auf den Strahl.');
    const marks={};let first=null;
    t.idx.forEach((n,k)=>{marks['nlp'+k]=pts[k]===n;if(!first&&pts[k]!==n)first={k,n,p:pts[k]};});
    if(!first)return right('Richtig! Du hast die Abschnitte ab 0 gezählt.');
    const L=t.idx.length>1?NL_LET[first.k]+': ':'';
    if(nlOffBy(first.p,first.n))return wrong('ticks',`${L}Du bist einen Strich daneben. Zähle die Abschnitte von 0 aus: Der erste Strich nach der 0 ist ${ft(1,t.m)}.`,marks);
    return wrong('pos',`${L}Der Punkt liegt noch nicht an der richtigen Stelle. Zähle den Zähler als Abschnitte von 0 aus.`,marks);
  },
  solution(t){
    return [line(`Ein Ganzes hat ${t.m} Abschnitte. Zähle den Zähler als Abschnitte von 0 aus.`),
      ...t.idx.map((n,k)=>line(`${NL_LET[k]} = `,frac(n,t.m),`: ${n} Abschnitte von 0 aus.`)),
      nlSol(0,t.u,t.m,t.idx,t.idx.length>1?NL_LET.slice(0,t.idx.length):t.idx.map(n=>ft(n,t.m)))];
  },
  hints(t){
    const h=[['Der Nenner sagt, wie viele Abschnitte ein Ganzes hat. Der Strahl ist schon passend eingeteilt.']];
    if(t.idx.length===1&&t.idx[0]<=t.m)h.push(['Jetzt liegt ein Bruchstreifen über dem Strahl. Der gefärbte Teil reicht bis zum Punkt.']);
    h.push(['Zähle vom Strich 0 aus so viele Abschnitte, wie der Zähler sagt.']);
    return h;
  }
};

/* ---------- Z04 Weg 1: Einteilung anpassen ---------- */
TASKS.Z04={area:'Zahlenstrahl',name:'Einteilung anpassen',desc:'Teile den Strahl passend zum Nenner ein und trage ein.',notes:['M9','M8'],size:5,
  gen(level,R){
    if(level===1){const d=R.pick([2,3,4,5,6,7,8,9,10]),u=R.chance(0.2)?2:1,pool=[];for(let n=1;n<u*d;n++)if(n%d!==0)pool.push(n);return {type:'Z04',level,u,d,fr:[R.pick(pool)],avoid:[]};}
    const u=R.pick([1,2,3]),dm=Math.min(12,nlMaxParts(u)),d=R.pick([4,5,6,7,8,9,10,12].filter(x=>x<=dm));
    const pool=[];for(let n=1;n<u*d;n++)if(n%d!==0)pool.push(n);
    return {type:'Z04',level,u,d,fr:R.shuffle(pool).slice(0,R.int(2,3)).sort((a,b)=>a-b),avoid:[]};
  },
  prompt(t,h){
    const items=t.fr.length===1?[frac(t.fr[0],t.d)]:t.fr.map((n,k)=>[el('b',null,NL_LET[k]),' = ',frac(n,t.d),k<t.fr.length-1?'   ':'']);
    h.append(el('p',{class:'q'},'Trage ein: ',...items),el('p',{class:'q sm'},'Teile den Strahl zuerst passend ein. Stelle dazu die Teile je Ganzem ein.'));
  },
  render(view,host){
    const t=view.task;
    lineWidget(view,host,{from:0,to:t.u,choose:{max:nlMaxParts(t.u),start:1},labels:'wholes',place:t.fr.length===1?['A']:NL_LET.slice(0,t.fr.length),
      strip:t.fr.length===1&&t.fr[0]<=t.d?{n:t.fr[0],d:t.d,hint:2}:null,label:'Zahlenstrahl'});
  },
  validate(t,d){
    const s=d.nl||{},m=s.parts==null?1:s.parts,pts=s.pts||[];
    if(m===1)return invalid('Teile den Strahl zuerst ein: Stelle die Teile je Ganzem ein.');
    const L=(k)=>t.fr.length>1?NL_LET[k]+' = ':'';
    if(!fitsDivision(t.d,m)){
      const k=0;
      if(m===t.d-1)return wrong('ticks',`Der Nenner ${t.d} heißt: ${t.d} Abschnitte je Ganzem. Du hast nur ${m} Abschnitte eingestellt. Zähle Abschnitte, nicht Striche.`);
      return wrong('einteilung',`Mit ${m} Teilen je Ganzem liegt ${L(k)}${ft(t.fr[k],t.d)} nicht auf einem Strich. Der Nenner ${t.d} muss in die Einteilung aufgehen: Nimm ${t.d} Teile oder ein Vielfaches davon.`);
    }
    if(pts.length!==t.fr.length||pts.some(p=>p==null))return invalid(t.fr.length===1?'Setze zuerst den Punkt: tippe auf den Strahl oder nutze ◀ ▶.':'Setze zuerst alle Punkte: wähle A, B, C und tippe auf den Strahl.');
    const marks={};let first=null;
    t.fr.forEach((n,k)=>{const want=tickOf(n,t.d,m);marks['nlp'+k]=pts[k]===want;if(!first&&pts[k]!==want)first={k,want,p:pts[k]};});
    if(!first)return right(`Richtig! Mit ${m} Teilen je Ganzem liegt der Punkt genau auf einem Strich.`+(m>t.d?` ${t.d} geht in ${m} auf, darum passt auch diese Einteilung.`:''));
    const k=first.k;
    if(nlOffBy(first.p,first.want))return wrong('ticks',`${t.fr.length>1?NL_LET[k]+': ':''}Du bist einen Strich daneben. Zähle die Abschnitte von 0 aus, nicht die Striche.`,marks);
    return wrong('pos',`${t.fr.length>1?NL_LET[k]+': ':''}Die Einteilung stimmt. Zähle jetzt den Zähler als Abschnitte von 0 aus.`,marks);
  },
  solution(t){
    return [line(`Teile jedes Ganze in ${t.d} gleich große Abschnitte (der Nenner ${t.d} sagt es). Zähle dann den Zähler ab 0.`),
      ...t.fr.map((n,k)=>line(`${t.fr.length>1?NL_LET[k]+' = ':''}`,frac(n,t.d),`: ${n} Abschnitte von 0 aus.`)),
      nlSol(0,t.u,t.d,t.fr,t.fr.length>1?NL_LET.slice(0,t.fr.length):t.fr.map(n=>ft(n,t.d)))];
  },
  hints(t){
    const h=[['Der Nenner sagt, in wie viele gleich große Abschnitte jedes Ganze geteilt wird.']];
    if(t.fr.length===1&&t.fr[0]<=t.d)h.push([`Jetzt liegt ein Bruchstreifen über dem Strahl. Er ist in ${t.d} gleiche Teile geteilt: So soll auch der Strahl eingeteilt werden.`]);
    h.push(['Stelle zuerst die Teile je Ganzem ein. Zähle dann den Zähler vom Strich 0 aus ab.']);
    return h;
  }
};

/* ---------- Z05 Weg 2: Bruch anpassen ---------- */
const nlLands=(a,b,m)=>(a*m)%b===0;
TASKS.Z05={area:'Zahlenstrahl',name:'Bruch anpassen',desc:'Bringe den Bruch auf den Nenner der Einteilung und trage ein.',notes:['M9','M2','M3'],size:5,
  gen(level,R){
    let kind='expand';
    if(level===2)kind=R.pick(['expand','reduce','nofit']);
    if(kind==='expand'){
      const b=R.pick(level===1?[2,3,4,5,6]:[3,4,5,6,8,9]),mx=level===1?12:24;
      const k=R.pick([2,3,4,5].filter(x=>b*x<=mx)),m=b*k,a=(m*2<=24&&R.chance(0.2))?R.int(b+1,2*b-1):R.int(1,b-1); /* auch unechte Brüche: dann Strahl bis 2 */
      return {type:'Z05',level,kind,a,b,m,k,u:a>b?2:1,avoid:[]};
    }
    if(kind==='reduce'){
      const m=R.pick([2,3,4,5,6,8,10]),k=R.pick([2,3,4].filter(x=>m*x<=24)),a1=R.chance(0.2)?R.int(m+1,2*m-1):R.int(1,m-1);
      return {type:'Z05',level,kind,a:a1*k,b:m*k,m,k,u:a1>m?2:1,avoid:[]};
    }
    let a,b,m,tries=0;
    const imp=R.chance(0.2);
    do{b=R.pick([3,5,6,7,9]);m=R.pick([4,6,8,10,12]);a=imp?R.int(b+1,2*b-1):R.int(1,b-1);tries++;}while((nlLands(a,b,m)||b===m)&&tries<200);
    return {type:'Z05',level,kind,a,b,m,u:a>b?2:1,avoid:[]};
  },
  prompt(t,h){
    h.append(el('p',{class:'q'},'Trage ',frac(t.a,t.b),' ein. Der Strahl ist in ',strong(t.m),' Abschnitte je Ganzem geteilt.'));
    if(t.level===1)h.append(el('p',{class:'q sm'},'Schreibe den Bruch zuerst mit dem Nenner ',strong(t.m),'.'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.level===2){
      host.append(el('p',{class:'q sm'},'Passt die Einteilung genau zu diesem Bruch?'));
      nlYesNo(view,host,'fit');
    }
    if(t.kind!=='nofit'){
      const num=el('span',{class:'num'},intInput(view,'x','Neuer Zähler'));
      host.append(el('div',{class:'eq'},frac(t.a,t.b),'=',el('span',{class:'frac inp',role:'group','aria-label':'Bruch mit dem Nenner '+t.m},num,el('span',{class:'den'},String(t.m)))));
    }
    const u=t.u||1,strip=t.a<t.b?{n:t.a,d:t.b,hint:2}:null; /* unechte Brüche: Strahl bis 2, ohne Streifen (er zeigt höchstens ein Ganzes) */
    lineWidget(view,host,t.kind==='nofit'?{from:0,to:u,choose:{max:nlMaxParts(u),start:t.m},labels:'wholes',place:['A'],strip,label:'Zahlenstrahl'}
      :{from:0,to:u,parts:t.m,labels:'wholes',place:['A'],strip,label:'Zahlenstrahl'});
  },
  validate(t,d){
    const s=d.nl||{},pts=s.pts||[],lands=nlLands(t.a,t.b,t.m),red=simplify(t.a,t.b);
    if(t.level===2){
      if(!d.fit)return invalid('Beantworte zuerst die Frage: Passt die Einteilung genau? Tippe Ja oder Nein.');
      if(d.fit!==(lands?'ja':'nein')){
        return wrong('fit',lands?`Doch, die Einteilung passt: ${ft(t.a,t.b)} = ${ft(t.a*t.m/t.b,t.m)}. Der Nenner lässt sich auf ${t.m} bringen.`:`Die Einteilung passt nicht genau: ${ft(t.a,t.b)} liegt zwischen zwei Strichen. Der Nenner ${red[1]} geht nicht in ${t.m} auf.`,{['fit'+d.fit]:false});
      }
    }
    if(t.kind==='nofit'){
      const m2=s.parts==null?t.m:s.parts;
      if(!nlLands(t.a,t.b,m2))return wrong('einteilung',`Mit ${m2} Teilen je Ganzem liegt ${ft(t.a,t.b)} nicht auf einem Strich. Wähle eine Einteilung, in die der Nenner ${red[1]} aufgeht.`);
      if(pts[0]==null)return invalid('Setze zuerst den Punkt: tippe auf den Strahl oder nutze ◀ ▶.');
      const want=t.a*m2/t.b;
      if(pts[0]===want)return right(`Richtig! ${ft(t.a,t.b)} liegt nicht auf der vorgegebenen Einteilung. Mit ${m2} Teilen je Ganzem trifft man den Punkt genau.`);
      return wrong(nlOffBy(pts[0],want)?'ticks':'pos',nlOffBy(pts[0],want)?'Du bist einen Strich daneben. Zähle die Abschnitte von 0 aus.':'Die Einteilung passt. Zähle jetzt den Zähler als Abschnitte von 0 aus.',{nlp0:false});
    }
    const x=getInt(d,'x'),want=t.a*t.m/t.b;
    if(x===null)return invalid('Trage den neuen Zähler ein.');
    if(x!==want){
      if(x===t.a)return wrong('onlyDen','Beim Erweitern und Kürzen musst du Zähler und Nenner verändern. Du hast nur den Nenner geändert.',{x:false});
      const verb=t.kind==='expand'?`${t.b} · ${t.k} = ${t.m}, also auch den Zähler mal ${t.k}`:`${t.b} : ${t.k} = ${t.m}, also auch den Zähler durch ${t.k}`;
      return wrong('calc',`Rechne den Bruch auf den Nenner ${t.m} um: ${verb}.`,{x:false});
    }
    if(pts[0]==null)return invalid('Setze zuerst den Punkt: tippe auf den Strahl oder nutze ◀ ▶.');
    if(pts[0]===want)return right(`Richtig! ${ft(t.a,t.b)} = ${ft(want,t.m)}: Der Punkt liegt am ${want}. Strich nach der 0.`);
    return wrong(nlOffBy(pts[0],want)?'ticks':'pos',nlOffBy(pts[0],want)?'Die Rechnung stimmt. Du bist einen Strich daneben: Zähle die Abschnitte von 0 aus.':'Die Rechnung stimmt. Zähle jetzt so viele Abschnitte von 0 aus, wie der neue Zähler sagt.',{nlp0:false});
  },
  solution(t){
    const red=simplify(t.a,t.b);
    if(t.kind==='nofit'){
      const m2=red[1];
      return [line(`${ft(t.a,t.b)} liegt nicht auf einem Strich der Einteilung mit ${t.m} Teilen: Der Nenner ${red[1]} geht nicht in ${t.m} auf.`),
        line(`Teile feiner, zum Beispiel in ${m2} Teile je Ganzem, und zähle ${t.a*m2/t.b} Abschnitte.`),nlSol(0,t.u||1,m2,[t.a*m2/t.b],[ft(t.a,t.b)])];
    }
    const e=t.kind==='expand';
    return [line(e?`Der Nenner ${t.b} wird mit ${t.k} multipliziert, um ${t.m} zu erhalten: erweitern mit ${t.k}.`:`Der Nenner ${t.b} wird durch ${t.k} geteilt, um ${t.m} zu erhalten: kürzen mit ${t.k}.`),
      eq(frac(t.a,t.b),'=',frac(t.a+(e?' · ':' : ')+t.k,t.b+(e?' · ':' : ')+t.k),'=',frac(t.a*t.m/t.b,t.m)),
      line(`Zähle ${t.a*t.m/t.b} Abschnitte von 0 aus.`),nlSol(0,t.u||1,t.m,[t.a*t.m/t.b],[ft(t.a,t.b)])];
  },
  hints(t){
    const h=[t.kind==='nofit'?['Prüfe: Geht der Nenner des Bruchs in die Zahl der Teile je Ganzem auf?']:['Vergleiche den Nenner des Bruchs mit der Zahl der Abschnitte je Ganzem auf dem Strahl.']];
    if(t.a<t.b)h.push(['Jetzt liegt ein Bruchstreifen über dem Strahl. Er zeigt den Bruch in seinem Nenner, der Strahl hat eine andere Einteilung.']);
    h.push(t.kind==='expand'?[`Womit musst du ${t.b} multiplizieren, um ${t.m} zu erhalten? Dieselbe Zahl gilt für den Zähler.`]
      :t.kind==='reduce'?[`Wodurch musst du ${t.b} teilen, um ${t.m} zu erhalten? Dieselbe Zahl gilt für den Zähler.`]
      :['Wenn die Einteilung nicht passt, teile den Strahl feiner. Der Nenner des Bruchs muss in die Teile aufgehen.']);
    return h;
  }
};

/* ---------- Z06 Mehrere Brüche auf einem Strahl ---------- */
const NL_SETS1=[[2,4],[2,3],[3,6],[2,6],[4,6],[3,4],[2,5],[5,10],[2,8],[4,8],[3,9],[4,12],[6,12]];
const NL_SETS2=[[3,8],[6,8],[8,12],[3,4,8],[4,6,8],[2,3,8],[3,6,8],[3,4,6],[2,3,4],[4,6,12],[4,5],[4,10],[6,9],[3,4,12]];
/* je Nenner ein Bruch n/d im Strahl bis u (nicht ganz), alle Werte verschieden */
function nlFracsFor(R,ds,u){
  for(let tries=0;tries<60;tries++){
    const fr=ds.map(d=>{let n;do{n=R.int(1,u*d-1);}while(n%d===0);return [n,d];});
    if(fr.every((x,i)=>fr.every((y,j)=>i===j||compareFrac(x[0],x[1],y[0],y[1])!==0)))return fr;
  }
  return ds.map(d=>[1,d]);
}
TASKS.Z06={area:'Zahlenstrahl',name:'Mehrere Brüche eintragen',desc:'Finde eine Einteilung, die für alle Brüche passt.',notes:['M10','M9'],size:5,
  gen(level,R){
    let ds,u=1;
    if(level===1){ds=R.pick(NL_SETS1);if(commonDenominator(ds)*2<=12&&R.chance(0.3))u=2;} /* auch Strahl bis 2: unechte Brüche */
    else{ds=R.pick(NL_SETS2);const l=commonDenominator(ds);if(l<=12&&R.chance(0.4))u=2;}
    return {type:'Z06',level,u,fr:R.shuffle(nlFracsFor(R,ds,u)),l:commonDenominator(ds),avoid:[]};
  },
  prompt(t,h){
    h.append(el('p',{class:'q'},'Trage ein: ',...t.fr.map((f,k)=>[el('b',null,NL_LET[k]),' = ',frac(f[0],f[1]),k<t.fr.length-1?'   ':''])),
      el('p',{class:'q sm'},'Wähle eine Einteilung, die für alle Brüche passt.'));
  },
  render(view,host){
    const t=view.task;
    lineWidget(view,host,{from:0,to:t.u,choose:{max:nlMaxParts(t.u),start:1},labels:'wholes',place:NL_LET.slice(0,t.fr.length),label:'Zahlenstrahl'});
  },
  validate(t,d){
    const s=d.nl||{},m=s.parts==null?1:s.parts,pts=s.pts||[];
    if(m===1)return invalid('Teile den Strahl zuerst ein: Stelle die Teile je Ganzem ein.');
    const bad=t.fr.findIndex(f=>!fitsDivision(f[1],m));
    if(bad>=0){
      const f=t.fr[bad];
      return wrong('einteilung',`Mit ${m} Teilen je Ganzem liegt ${NL_LET[bad]} = ${ft(f[0],f[1])} nicht auf einem Strich: ${f[1]} geht nicht in ${m} auf. Die Einteilung muss für alle Nenner passen.`);
    }
    if(pts.length!==t.fr.length||pts.some(p=>p==null))return invalid('Setze zuerst alle Punkte: wähle A, B, C und tippe auf den Strahl.');
    const marks={};let first=null;
    t.fr.forEach((f,k)=>{const want=tickOf(f[0],f[1],m);marks['nlp'+k]=pts[k]===want;if(!first&&pts[k]!==want)first={k,want,p:pts[k]};});
    if(!first)return right(`Richtig! ${m} Teile je Ganzem passen zu allen Nennern.`+(m===t.l?' Das ist die kleinste passende Einteilung.':` Es geht auch kleiner: ${t.l} Teile genügen.`));
    return wrong(nlOffBy(first.p,first.want)?'ticks':'pos',`${NL_LET[first.k]}: ${nlOffBy(first.p,first.want)?'Du bist einen Strich daneben. ':''}Die Einteilung passt. Zähle den Zähler als Abschnitte von 0 aus.`,marks);
  },
  solution(t){
    const ds=t.fr.map(f=>f[1]);
    return [line(`Alle Nenner (${ds.join(', ')}) müssen in die Zahl der Teile aufgehen. Die kleinste solche Zahl ist ${t.l}.`),
      ...t.fr.map((f,k)=>line(`${NL_LET[k]} = `,frac(f[0],f[1]),'= ',frac(f[0]*t.l/f[1],t.l))),
      nlSol(0,t.u,t.l,t.fr.map(f=>f[0]*t.l/f[1]),NL_LET.slice(0,t.fr.length))];
  },
  hints(t){return [['Die Einteilung muss für jeden Nenner passen: Jeder Nenner muss in die Zahl der Teile aufgehen.'],['Suche die kleinste Zahl, in die alle Nenner aufgehen.']];}
};

/* ---------- Z07 Einheit lesen ---------- */
TASKS.Z07={area:'Zahlenstrahl',name:'Einheit lesen',desc:'Ein Ganzes geht von einer ganzen Zahl zur nächsten: Trage Brüche auf Strahlen verschiedener Länge ein.',notes:['M8'],size:5,
  /* Leicht: derselbe echte Bruch auf Strahlen von 0 bis 1, 2, 3 oder 4. Knifflig: Strahl beginnt auch bei 1, 2 oder 3 (nur Anfang und eine
     weitere ganze Zahl beschriftet), die Brüche sind meist größer als 1; Strichnummer = Zähler − from·Nenner */
  gen(level,R){
    if(level===1){
      const q=R.pick([2,3,4,5]),p=R.int(1,q-1),ns=R.shuffle([1,2,3,4].filter(n=>n*q<=12)).slice(0,R.int(2,3));
      if(!ns.includes(1)&&R.chance(0.5))ns[ns.length-1]=1;
      return {type:'Z07',level,q,p,ns,avoid:[]};
    }
    const q=R.pick([2,3,4,5]),n=R.pick([2,3].filter(x=>x*q<=12)),from=R.pick([0,1,1,2,2,3]),pool=[];
    for(let i=Math.max(1,from*q+1);i<(from+n)*q;i++)if(i%q!==0)pool.push(i);
    return {type:'Z07',level,q,from,ns:[n],ps:R.shuffle(pool).slice(0,Math.min(2,pool.length)).sort((a,b)=>a-b),avoid:[]};
  },
  prompt(t,h){
    const f=t.from||0;
    if(t.level===1)h.append(el('p',{class:'q'},'Trage ',frac(t.p,t.q),' auf jedem Strahl ein.'),el('p',{class:'q sm'},'Ein Ganzes geht immer von 0 bis 1, nicht bis zum Ende des Strahls.'));
    else h.append(el('p',{class:'q'},'Trage ein: ',...t.ps.map((p,k)=>[el('b',null,NL_LET[k]),' = ',frac(p,t.q),k<t.ps.length-1?'   ':''])),
      el('p',{class:'q sm'},'Nur ',strong(f),' und ',strong(f+1),' sind beschriftet. Der Abstand zwischen ihnen ist ein Ganzes.'));
  },
  render(view,host){
    const t=view.task,f=t.from||0;
    t.ns.forEach((n,j)=>{
      host.append(el('div',{class:'nlcap'},t.level===1?'Strahl '+(j+1)+(n>1?' (bis '+n+')':' (bis 1)'):'Strahl'));
      lineWidget(view,host,{key:'w'+j,from:f,to:f+n,parts:t.q,labels:t.level===1?'ends':[f,f+1],place:t.level===1?['A']:NL_LET.slice(0,t.ps.length),label:'Strahl '+(j+1)});
    });
  },
  validate(t,d){
    const f=t.from||0,marks={};let first=null;
    for(let j=0;j<t.ns.length;j++){
      const s=d['w'+j]||{},pts=s.pts||[],want=t.level===1?[t.p]:t.ps.map(p=>p-f*t.q);
      if(pts.length!==want.length||pts.some(p=>p==null))return invalid(t.level===1?'Setze auf jedem Strahl einen Punkt.':'Setze zuerst alle Punkte: wähle A, B, C und tippe auf den Strahl.');
      want.forEach((w,k)=>{const ok=pts[k]===w;marks['w'+j+'p'+k]=ok;if(!first&&!ok)first={j,k,w,p:pts[k]};});
    }
    if(!first)return right(f?`Richtig! Ein Ganzes ist der Abstand von ${f} bis ${f+1}. Der Strahl muss nicht bei 0 beginnen.`:'Richtig! Ein Ganzes geht immer von 0 bis 1, egal wie lang der Strahl ist.');
    const n=t.ns[first.j];
    if(t.level===1&&n>1&&first.p===t.p*n)return wrong('whole','Du hast den ganzen Strahl als Ganzes genommen. Ein Ganzes geht nur von 0 bis 1, danach beginnt das nächste Ganze.',marks);
    if(nlOffBy(first.p,first.w))return wrong('ticks',`Du bist einen Strich daneben. Zähle die Abschnitte von ${f} aus.`,marks);
    return wrong('pos',t.level===1?`Auf Strahl ${first.j+1}: Finde zuerst die 1. Von 0 bis 1 liegt ein Ganzes mit ${t.q} Abschnitten.`
      :f?`Der Strahl beginnt bei ${f}. Ein Ganzes ist der Abstand von ${f} bis ${f+1}. Rechne: Wie viele Abschnitte liegen zwischen ${f} und dem Bruch?`:'Finde zuerst die 1. Von 0 bis 1 liegt ein Ganzes. Zähle dann die Abschnitte ab 0.',marks);
  },
  solution(t){
    const f=t.from||0;
    if(t.level===1)return [line(`Von 0 bis 1 ist ein Ganzes in ${t.q} Abschnitte geteilt. ${ft(t.p,t.q)} liegt immer bei ${t.p} Abschnitten von 0 aus.`),
      ...t.ns.map(n=>nlSol(0,n,t.q,[t.p],[ft(t.p,t.q)],{labels:'ends'}))];
    return [line(f?`Der Strahl beginnt bei ${f}. Von ${f} bis ${f+1} ist ein Ganzes in ${t.q} Abschnitte geteilt. Ziehe ${f} Ganze, also ${f*t.q} Abschnitte, vom Zähler ab.`:`Von 0 bis 1 ist ein Ganzes in ${t.q} Abschnitte geteilt. Der Zähler sagt, wie viele Abschnitte du von 0 aus zählst.`),
      ...t.ps.map((p,k)=>line(`${NL_LET[k]} = `,frac(p,t.q),f?`: ${p} − ${f*t.q} = ${p-f*t.q} Abschnitte ab ${f}.`:`: ${p} Abschnitte von 0 aus.`)),
      nlSol(f,f+t.ns[0],t.q,t.ps.map(p=>p-f*t.q),NL_LET.slice(0,t.ps.length),{labels:[f,f+1]})];
  },
  hints(t){
    const f=t.from||0;
    return [[f?'Ein Ganzes ist der Abstand zwischen zwei ganzen Zahlen, hier von '+f+' bis '+(f+1)+'. Der Strahl muss nicht bei 0 beginnen.':'Ein Ganzes ist immer die Strecke von 0 bis 1, nicht der ganze Strahl.'],
      [f?`Zähle ab ${f}: Wie viele Abschnitte sind es bis zum Bruch? Von ${f} bis ${f+1} sind es ${t.q}.`:`Finde die 1 auf dem Strahl. Von 0 bis 1 ist ein Ganzes in ${t.q} Abschnitte geteilt.`]];
  }
};

/* ---------- Z08 Größer als 1 ---------- */
const NL_CASES=[[2,2],[2,3],[2,4],[2,5],[2,6],[3,2],[3,3],[3,4],[4,2],[4,3]]; /* Strahl bis u mit Nenner d: u·d höchstens 12 */
TASKS.Z08={area:'Zahlenstrahl',name:'Größer als 1',desc:'Zwischen welchen ganzen Zahlen liegt ein Bruch? Gemischte Zahl.',notes:['M8','M6'],size:5,
  gen(level,R){
    const kind=R.pick(level===1?['between','mixed']:['between','mixed','nat']);
    if(kind==='nat'){
      const good=[],ds=R.shuffle([2,3,4,5,6,8,9,10,12]),ng=R.int(2,3);
      for(let i=0;i<ng;i++)good.push([R.int(1,5)*ds[i],ds[i]]);
      const bad=[];
      for(let i=3;bad.length<6-good.length&&i<60;i++){
        const d=ds[i%ds.length],n=R.pick([R.int(1,3)*d+R.int(1,d-1),R.int(1,d-1)]);
        if(n%d!==0&&!bad.some(b=>b[0]===n&&b[1]===d)&&!good.some(g=>g[0]===n&&g[1]===d))bad.push([n,d]);
      }
      return {type:'Z08',level,kind,cards:R.shuffle(good.concat(bad).slice(0,6)),avoid:[]};
    }
    let u,d,n;
    if(level===1){[u,d]=R.pick(NL_CASES);}
    else{u=R.pick([3,4,5]);d=R.pick([3,4,5,6,7,8,9,10,12]);}
    do{n=R.int(d+1,u*d-1);}while(n%d===0);
    return {type:'Z08',level,kind,u,d,n,avoid:[]};
  },
  prompt(t,h){
    if(t.kind==='between')h.append(el('p',{class:'q'},'Zwischen welchen zwei ganzen Zahlen liegt ',frac(t.n,t.d),'?'));
    else if(t.kind==='mixed')h.append(el('p',{class:'q'},'Schreibe ',frac(t.n,t.d),' als gemischte Zahl.'));
    else h.append(el('p',{class:'q'},'Welche Brüche sind natürliche Zahlen? ',el('b',null,'(Tippe alle richtigen an.)')));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(t.kind==='nat'){
      d.sel=d.sel||[];
      const cards=el('div',{class:'cards',role:'group','aria-label':'Brüche'});
      t.cards.forEach((c,i)=>{
        const b=el('button',{type:'button',class:'pick','aria-pressed':String(d.sel.includes(i)),'aria-label':'Karte '+(i+1)+': '+c[0]+' durch '+c[1]},frac(c[0],c[1]));
        b.disabled=view.locked();
        b.addEventListener('click',()=>{
          if(view.locked())return;
          const j=d.sel.indexOf(i);if(j>=0)d.sel.splice(j,1);else d.sel.push(i);
          b.setAttribute('aria-pressed',String(d.sel.includes(i)));view.save();
        });
        view.inputs['c'+i]=b;cards.append(b);
      });
      host.append(cards);
      return;
    }
    const showParts=t.level===1?t.d:1;
    lineWidget(view,host,{from:0,to:t.u,parts:showParts,labels:'wholes',shown:t.kind==='mixed'&&t.level===1?[{n:t.n,d:t.d,text:'A'}]:[],label:'Zahlenstrahl'});
    if(t.kind==='between')host.append(el('div',{class:'eq'},'Zwischen',intInput(view,'lo','Kleinere ganze Zahl'),'und',intInput(view,'hi','Größere ganze Zahl')));
    else host.append(el('div',{class:'eq'},'=',intInput(view,'w','Ganze'),fracInput(view,'r')));
  },
  validate(t,d){
    if(t.kind==='nat'){
      const sel=d.sel||[];
      if(!sel.length)return invalid('Wähle mindestens eine Karte aus.');
      const ok=i=>t.cards[i][0]%t.cards[i][1]===0;
      const wr=sel.filter(i=>!ok(i)),miss=t.cards.map((_,i)=>i).filter(i=>ok(i)&&!sel.includes(i));
      if(!wr.length&&!miss.length)return right('Richtig! Bei diesen Brüchen geht der Zähler ohne Rest durch den Nenner.');
      if(wr.length)return wrong('wrongCard','Mindestens eine gewählte Karte ist keine natürliche Zahl. Teile den Zähler durch den Nenner: Es darf kein Rest bleiben.');
      return soft('missing','Das stimmt bisher – aber es gibt noch mehr natürliche Zahlen unter den Brüchen.');
    }
    const w=Math.floor(t.n/t.d),rest=t.n%t.d;
    if(t.kind==='between'){
      const lo=getInt(d,'lo'),hi=getInt(d,'hi');
      if(lo===null||hi===null)return invalid('Trage beide ganzen Zahlen ein.');
      if(lo===w&&hi===w+1)return right(`Richtig! ${ft(t.n,t.d)} liegt zwischen ${w} und ${w+1}: ${w} · ${t.d} = ${w*t.d} und ${(w+1)*t.d}.`);
      if(hi===lo+1)return wrong('between',`Dein Paar passt nicht: Rechne ${t.n} : ${t.d}. Die ganze Zahl davor ist ${w}, die danach ${w+1}.`,{lo:lo===w,hi:hi===w+1});
      return wrong('between','Gesucht sind zwei ganze Zahlen, die direkt nebeneinander liegen. Rechne Zähler : Nenner.',{lo:lo===w,hi:hi===w+1});
    }
    const ww=getInt(d,'w'),f=getFrac(d,'r');
    if(ww===null||!f)return invalid('Trage die Ganzen und den Bruch ein.');
    const marks={w:ww===w,'r.n':f.n===rest,'r.d':f.d===t.d};
    if(ww===w&&f.n===rest&&f.d===t.d)return right(`Richtig! ${ft(t.n,t.d)} = ${w} ${ft(rest,t.d)}.`);
    if(ww===w&&equivalent(f.n,f.d,rest,t.d))return soft('form',`Der Wert stimmt. Schreibe den Rest mit dem Nenner ${t.d}: ${ft(rest,t.d)}.`,marks);
    if(ww!==w)return wrong('whole',`Wie viele ganze Strecken passen in ${ft(t.n,t.d)}? Rechne ${t.n} : ${t.d}.`,marks);
    return wrong('rest',`Die Ganzen stimmen. Der Rest ist ${t.n} − ${w*t.d} = ${rest} Abschnitte, der Nenner bleibt ${t.d}.`,marks);
  },
  solution(t){
    if(t.kind==='nat')return [line('Ein Bruch ist eine natürliche Zahl, wenn der Zähler ohne Rest durch den Nenner teilbar ist.'),
      ...t.cards.filter(c=>c[0]%c[1]===0).map(c=>line(frac(c[0],c[1]),`= ${c[0]/c[1]}`))];
    const w=Math.floor(t.n/t.d),rest=t.n%t.d;
    if(t.kind==='between')return [line(`${t.n} : ${t.d} = ${w} Rest ${rest}. Also liegt ${ft(t.n,t.d)} zwischen ${w} und ${w+1}.`),nlSol(0,t.u,t.level===1?t.d:1,t.level===1?[t.n]:[],t.level===1?[ft(t.n,t.d)]:[])];
    return [line(`${t.n} : ${t.d} = ${w} Rest ${rest}.`),eq(frac(t.n,t.d),'=',mixed(w,rest,t.d))];
  },
  hints(t){
    if(t.kind==='nat')return [['Ein Bruch ist eine natürliche Zahl, wenn der Zähler ein Vielfaches des Nenners ist.'],['Teile Zähler : Nenner. Bleibt kein Rest, ist es eine natürliche Zahl.']];
    return [[`Wie viele Ganze passen in ${t.n}/${t.d}? Teile ${t.n} durch ${t.d}.`],[t.kind==='between'?'Der Rest zeigt, wie weit der Punkt hinter der letzten ganzen Zahl liegt.':'Der Rest wird der Zähler des Bruchs, der Nenner bleibt gleich.']];
  }
};
