'use strict';
/* =====================================================================
   11 Selbsttest (Entwicklerkonsole: runSelfTests())
   ===================================================================== */
function runSelfTests(){
  const res=[],t=(name,ok)=>res.push({name,ok:!!ok});
  t('2/3 = 4/6',equivalent(2,3,4,6));
  t('12/18 = 2/3',equivalent(12,18,2,3));
  t('4/6 ≠ 8/6',!equivalent(4,6,8,6));
  const g02={type:'G02',level:1,mode:'factor',a:2,b:5,k:3};
  t('Erweitere 2/5 mit 3 → 6/15',validateTask(g02,{'r.n':'6','r.d':'15'}).correct);
  t('… nicht 4/10',!validateTask(g02,{'r.n':'4','r.d':'10'}).correct);
  const g03={type:'G03',level:1,mode:'factor',a:8,b:12,k:2};
  t('Kürze 8/12 mit 2 → 4/6',validateTask(g03,{'r.n':'4','r.d':'6'}).correct);
  t('8/12 ist nicht vollständig gekürzt',!isFullyReduced(8,12));
  const g03f={type:'G03',level:2,mode:'full',a:84,b:126,p:2,q:3};
  t('84/126 → 2/3',validateTask(g03f,{'r.n':'2','r.d':'3'}).correct);
  t('84/126 → 42/63 noch kürzbar',validateTask(g03f,{'r.n':'42','r.d':'63'}).errorCode==='notFull');
  const u01={type:'U01',level:1,terms:[{n:2,d:3,blank:null},{n:8,d:12,blank:'n'}]};
  t('2/3 = □/12 → 8',validateTask(u01,{g1:'8'}).correct&&!validateTask(u01,{g1:'9'}).correct);
  t('7/1000 → 0,007',fractionToDecimalString(7,1000)==='0,007');
  t('125/100 → 1,25',fractionToDecimalString(125,100)==='1,25');
  const d02=(s,den)=>{const p=parseGermanDecimal(s);return {type:'D02',level:1,n:p.num,den:Math.pow(10,p.places),places:p.places,s};};
  t('0,04 → 4/100',validateTask(d02('0,04'),{'r.n':'4','r.d':'100'}).correct&&!validateTask(d02('0,04'),{'r.n':'4','r.d':'10'}).correct);
  t('0,050 → 50/1000',validateTask(d02('0,050'),{'r.n':'50','r.d':'1000'}).correct&&!validateTask(d02('0,050'),{'r.n':'5','r.d':'100'}).correct);
  t('1,25 → 125/100',validateTask(d02('1,25'),{'r.n':'125','r.d':'100'}).correct);
  t('parse 0.25',parseGermanDecimal('0.25').num===25);
  const d03a={type:'D03',level:1,w:2,n:1,d:3},d03b={type:'D03',level:2,w:6,n:5,d:7};
  t('2 1/3 → 7/3',validateTask(d03a,{'r.n':'7','r.d':'3'}).correct);
  t('6 5/7 → 47/7',validateTask(d03b,{'r.n':'47','r.d':'7'}).correct);
  const d01={type:'D01',level:1,n:7,den:1000};
  t('D01 7/1000 = 0,007',validateTask(d01,{dec:'0,007'}).correct&&!validateTask(d01,{dec:'0,07'}).correct);
  const o01={type:'O01',level:1,p:2,q:3,need:4};
  t('O01: vier verschiedene',validateTask(o01,{rows:4,'x0.n':'4','x0.d':'6','x1.n':'6','x1.d':'9','x2.n':'8','x2.d':'12','x3.n':'10','x3.d':'15'}).correct);
  t('O01: Doppelte abgelehnt',!validateTask(o01,{rows:4,'x0.n':'4','x0.d':'6','x1.n':'4','x1.d':'6','x2.n':'8','x2.d':'12','x3.n':'10','x3.d':'15'}).correct);
  const o02={type:'O02',level:1,a:12,b:18,p:2,q:3,mode:'target'};
  t('O02: Wege ÷6 und ÷2,÷3',validateTask(o02,{paths:[[6],[2,3]]}).correct);
  t('O02: gleiche Wege abgelehnt',!validateTask(o02,{paths:[[2,3],[2,3]]}).correct);
  t('O02: Fraktion nach Weg',pathFraction(12,18,[2,3])[0]===2&&pathFraction(12,18,[2,3])[1]===3);
  const t01={type:'T01',level:1,n:124,k:2};
  t('T01: 124 durch 2',validateTask(t01,{ans:'ja'}).correct&&!validateTask(t01,{ans:'nein'}).correct);
  const g04n={type:'G04',level:1,mode:'full',a:5,b:7,p:5,q:7,irreducible:true};
  t('G04: nicht kürzbar',validateTask(g04n,{none:true}).correct&&validateTask(g04n,{'r.n':'5','r.d':'7'}).correct&&!validateTask({type:'G04',level:1,mode:'full',a:10,b:14,p:5,q:7},{none:true}).correct);
  const g05={type:'G05',level:1,mode:'denom',a:6,b:9,N:3};
  t('G05: 6/9 = □/3 → 2',validateTask(g05,{'r.n':'2'}).correct&&!validateTask(g05,{'r.n':'3'}).correct);
  const g05t={type:'G05',level:1,mode:'twostep',a:4,b:6,k:3,m:2};
  t('G05: 4/6 mit 3 erweitern, mit 2 kürzen',validateTask(g05t,{'r1.n':'12','r1.d':'18','r2.n':'6','r2.d':'9'}).correct);
  t('Ränge: 12 Stufen, Schwellen steigen',RANKS.length===12&&RANKS.every((r,i)=>!i||r[0]>RANKS[i-1][0]));
  t('Rang-Berechnung nach Punkten',rankState(0,false).i===0&&rankState(40,false).i===1&&rankState(3200,false).i===10);
  t('Höchster Rang nur bei „alles perfekt“',rankState(99999,false).i===RANK_TOP-1&&rankState(99999,false).topLocked&&rankState(99999,true).i===RANK_TOP&&rankState(4499,true).i===RANK_TOP-1);
  /* Generatoren: viele Läufe, jede Variante muss lösbar und erzeugbar sein */
  let gen=0;
  for(const id of PRACTICE_ORDER)for(const lvl of [1,2])for(let i=0;i<150;i++){
    const task=generateTask(id,lvl);gen++;
    if(!task||task.type!==id)t('Generator '+id,false);
    if(TASKS[id].hints(task).length<2)t('Tipps '+id,false);
    if(!Array.isArray(task.avoid))t('avoid '+id,false);
  }
  t('Generatoren liefen ('+gen+' Aufgaben)',true);
  /* Memory: Werte paarweise verschieden */
  for(const lvl of [1,2]){
    const p=genMemoryPairs(lvl,lvl===1?6:10,RNG),keys=p.map(x=>redKey(x[0].n,x[0].d));
    t('Memory Niveau '+lvl+': '+p.length+' Paare, Werte verschieden',p.length===(lvl===1?6:10)&&new Set(keys).size===keys.length&&p.every(x=>equivalent(x[0].n,x[0].d,x[1].n,x[1].d)));
  }
  /* Teilbarkeit: Zahlenbereich leicht bis 500, knifflig bis 1000 */
  for(const [lvl,lo,hi] of [[1,12,500],[2,100,1000]]){
    let mn=1e9,mx=0;
    for(let i=0;i<600;i++){const x=generateTask('T01',lvl);mn=Math.min(mn,x.n);mx=Math.max(mx,x.n);}
    t('T01 Niveau '+lvl+': Zahlen '+lo+'–'+hi+' (gesehen '+mn+'–'+mx+')',mn>=lo&&mx<=hi&&mx>hi*0.8);
  }
  /* Schnellcheck: genau eine richtige Antwort, passende Fähigkeit, Zahlenbereich */
  const qProblems=(k,skill)=>{
    const bad=[],[a,b]=k.from||[],[c,d]=k.to||[];
    if(!Q_SKILLS.includes(k.skill))bad.push('skill');
    else if(!Q_KINDS_BY_SKILL[k.skill].includes(k.kind))bad.push('kind');
    if(skill&&k.skill!==skill)bad.push('skill≠ctx');
    if(Math.max(0,...numsOf(k))>(k.level===1?60:300))bad.push('Bereich');
    if(k.opts){
      if(k.opts.filter(o=>o.id===k.answer).length!==1)bad.push('Antwort');
      if(new Set(k.opts.map(o=>o.txt)).size!==k.opts.length)bad.push('Dubletten');
    }else if(k.answer!=='ja'&&k.answer!=='nein')bad.push('Antwort');
    const yes=k.answer==='ja';
    switch(k.kind){
      case 'eqYN':if(yes!==equivalent(a,b,c,d))bad.push('eqYN');break;
      case 'reducible':if(yes!==(gcd(a,b)>1))bad.push('reducible');break;
      case 'full':if(!equivalent(a,b,c,d)||yes!==isFullyReduced(c,d))bad.push('full');break;
      case 'div':if(yes!==divisible(k.n,k.k))bad.push('div');break;
      case 'which':{
        const good=k.optNums.filter(x=>a%x===0&&b%x===0);
        if(good.length!==1||String(good[0])!==k.opts.find(o=>o.id===k.answer).txt)bad.push('which');break;
      }
      case 'missing':{
        const num=Number(k.opts.find(o=>o.id===k.answer).txt),n=k.blank==='n'?num:c,dd=k.blank==='d'?num:d;
        if(!equivalent(a,b,n,dd))bad.push('missing');
        if(k.opts.filter(o=>equivalent(a,b,k.blank==='n'?Number(o.txt):c,k.blank==='d'?Number(o.txt):d)).length!==1)bad.push('missing-eindeutig');
        if((k.skill==='erweitern')!==(n>a))bad.push('missing-art');
        break;
      }
      case 'kind':{
        const isE=c%a===0&&d%b===0&&c/a===d/b&&c>a,isK=a%c===0&&b%d===0&&a/c===b/d&&c<a;
        if(k.answer==='erw'?!isE:k.answer==='kue'?!isK:(equivalent(a,b,c,d)||isE||isK))bad.push('kind');
        break;
      }
    }
    return bad;
  };
  const qBad=[];let qN=0;
  for(const id of ['Q00'])for(const lvl of [1,2])for(const sk of Q_SKILLS)for(let i=0;i<150;i++){
    const k=generateTask(id,lvl,null,{skill:sk});qN++;
    const pr=qProblems(k,sk);if(pr.length)qBad.push(id+' L'+lvl+' '+sk+' '+k.kind+': '+pr.join(','));
  }
  t('Schnellcheck: '+qN+' Fragen korrekt'+(qBad.length?' – '+qBad.slice(0,3).join(' | '):''),qBad.length===0);
  const kinds=new Set();for(let i=0;i<600;i++)kinds.add(generateTask('Q00',1).kind);
  t('Schnellcheck: alle 7 Fragearten kommen vor',kinds.size===7);
  const rr={results:[]};let plan=[];for(let i=0;i<Q_COUNT;i++){plan.push(TASKS.Q00.ctx(rr).skill);rr.results.push('f');}
  t('Q00: '+Q_COUNT+' Fragen, je Fähigkeit '+Q_PER_SKILL+', keine direkt doppelt',Q_COUNT===15&&Q_SKILLS.every(sk=>plan.filter(x=>x===sk).length===Q_PER_SKILL)&&plan.every((x,j)=>!j||x!==plan[j-1]));
  t('Fragenplan: 500 Mischungen, je Fähigkeit 3, nie dieselbe hintereinander',(()=>{for(let i=0;i<500;i++){const q=qPlan();if(q.length!==Q_COUNT||q.some((x,j)=>j&&x===q[j-1])||Q_SKILLS.some(sk=>q.filter(x=>x===sk).length!==Q_PER_SKILL))return false;}return true;})());
  const keepSk=S.skills;S.skills={};
  for(let i=0;i<4;i++)recordSkill('gleich',true);
  t('Fähigkeit sicher: 4 von 4',skillSure('gleich'));
  recordSkill('gleich',false);t('Fähigkeit sicher: 4 von 5 = 80 %',skillSure('gleich'));
  recordSkill('gleich',false);t('Fähigkeit nicht sicher: 4 von 6',!skillSure('gleich'));
  for(let i=0;i<12;i++)recordSkill('teilbar',true);
  t('Fähigkeiten-Protokoll: höchstens 10 Einträge',S.skills.teilbar.h.length===10);
  S.skills=keepSk;persist();
  /* Bruchlabor */
  t('Labor: alle Startbrüche gültig (echt, höchstens '+LAB_MAX+' Teile)',LAB_START.every(labOkFrac));
  t('Labor: Startbrüche nur mit 2, 3, 5 kürzbar',LAB_START.every(f=>{let g=gcd(f[0],f[1]);[2,3,5].forEach(q=>{while(g%q===0)g/=q;});return g===1;}));
  let labBad=0,labSteps=0;
  for(let i=0;i<400;i++){
    let cur=RNG.pick(LAB_START).slice();const base=cur.slice();
    for(let k0=0;k0<14;k0++){
      const op=RNG.pick(['x','d']),k=RNG.pick(LAB_FACTORS),can=labCan(cur,op,k);
      if(op==='d'&&can!==(cur[0]%k===0&&cur[1]%k===0))labBad++;
      if(op==='x'&&can!==(cur[1]*k<=LAB_MAX))labBad++;
      if(!can)continue;
      cur=labStep(cur,op,k);labSteps++;
      if(!labOkFrac(cur)||!equivalent(base[0],base[1],cur[0],cur[1]))labBad++;
    }
  }
  t('Labor: Erweitern/Kürzen erhält den Wert, 2–'+LAB_MAX+' Teile ('+labSteps+' Schritte)',labBad===0&&labSteps>1000);
  const lp=(x,d,sk,dn)=>labPhase({did:{x,d},skip:sk,done:dn});
  t('Labor: Auftragsfolge',lp(false,false,false,false)==='x'&&lp(true,false,false,false)==='d'&&lp(false,true,false,false)==='x'&&lp(true,true,false,false)==='quiz'&&lp(true,true,true,false)==='play'&&lp(true,true,false,true)==='free');
  const keepLab=S.lab;
  S.lab={mode:'strip',base:[2,3],cur:[9,3],hist:[],last:null,did:{x:false,d:false},skip:false,done:false};
  t('Labor: kaputter Zustand wird zurückgesetzt',labState().cur[0]===2&&labState().cur[1]===3);
  S.lab={mode:'strip',base:[2,3],cur:[4,6],hist:[{cur:[2,3],last:null}],last:{op:'x',k:2},did:{x:true,d:false},skip:false,done:false};
  t('Labor: gültiger Zustand bleibt erhalten',labState().cur[1]===6&&labState().hist.length===1);
  S.lab=keepLab;persist();
  t('Labor: Erklärungen nennen Rechnung, keine Pauschalregel zur 2',labTell([2,3],[6,9],'x',3).includes('2 · 3 = 6 und 3 · 3 = 9')&&labTell([6,9],[2,3],'d',3).includes('nicht mehr')&&labWhy([6,9],'d',2).includes('nicht beide durch 2')&&!labWhy([6,9],'d',2).includes('IMMER'));
  t('Labor: Frage hat genau eine richtige Antwort',LAB_QUIZ.filter(o=>o.id==='wert').length===1&&LAB_QUIZ.every(o=>o.id==='wert'||LAB_WRONG[o.id]));
  /* G01: Zahl richtiger Karten wechselt; Streifen/Kreis nur bei kleinen Nennern, große Nenner nur als Raster */
  for(const lvl of [1,2]){
    const counts=new Set();let badRep=0,badN=0,dup=0;
    for(let i=0;i<500;i++){
      const g=generateTask('G01',lvl);
      counts.add(g.cards.filter(c=>equivalent(c.n,c.d,g.target.n,g.target.d)).length);
      if(g.cards.length!==(lvl===1?5:6))badN++;
      if(new Set(g.cards.map(c=>c.n+'/'+c.d)).size!==g.cards.length)dup++;
      g.cards.concat([g.target]).forEach(c=>{if((c.mode==='strip'||c.mode==='circle')&&c.d>12)badRep++;if(c.mode==='grid'&&!gridOK(c.d))badRep++;});
    }
    t('G01 Niveau '+lvl+': Zahl richtiger Karten wechselt ('+[...counts].sort().join(',')+'), Kartenzahl fest, keine Dubletten',counts.size>=(lvl===1?3:4)&&badN===0&&dup===0);
    t('G01 Niveau '+lvl+': Streifen/Kreis nur bis Nenner 12, große Nenner nur als Raster',badRep===0);
  }
  t('pickMode: Nenner 13–36 nie Streifen oder Kreis',(()=>{for(let d=13;d<=36;d++)for(let i=0;i<30;i++){const m=pickMode(d,RNG);if(m&&m!=='grid')return false;}return true;})());
  /* Bruchbilder: gefärbte Teile verstreut oder verschoben (als Indexliste gespeichert, nur beim Erzeugen gewürfelt) */
  {
    const R2=makeRng(mulberry32(777));
    const runs=(a,d,circ)=>{const z=new Set(a);let r=0;for(let i=0;i<d;i++){const prev=i===0?(circ&&z.has(d-1)):z.has(i-1);if(z.has(i)&&!prev)r++;}return r;};
    let badSet=0,badGroups=0,total=0,oneAtZero=0;
    for(const kind of ['strip','circle','grid'])for(let d=2;d<=36;d++)for(let n=1;n<d;n++)for(let rep=0;rep<12;rep++){
      const f=scatterFill(n,d,kind,R2,{pClassic:0}),g=runs(f,d,kind==='circle'),cap=(kind==='strip'&&d>8)?2:3;
      total++;
      if(!validFill(f,n,d)||!f.some((c,i)=>c!==i)||f.some((c,i)=>i&&c<=f[i-1]))badSet++;
      if(g<1||g>cap)badGroups++;
      if(n===1&&f[0]===0)oneAtZero++;
    }
    t('Verstreute Färbung: gültige Listen, nie „die ersten n“ ('+total+' Fälle)',badSet===0&&oneAtZero===0);
    t('Verstreute Färbung: höchstens 3 Gruppen, Streifen mit mehr als 8 Teilen höchstens 2',badGroups===0);
    let cl=0,wrap=0;const N=4000;
    for(let i=0;i<N;i++){if(scatterFill(3,8,'strip',R2,{pClassic:0.3}).every((c,j)=>c===j))cl++;const f=scatterFill(3,8,'circle',R2,{pClassic:0});if(f.includes(0)&&f.includes(7))wrap++;}
    t('Verstreute Färbung: klassisch zu rund pClassic (0,3 → '+Math.round(100*cl/N)+' %), Kreis kann über 12 Uhr laufen',cl/N>0.25&&cl/N<0.35&&wrap>0);
    t('Verstreute Färbung: Randfälle n=d−1 (Lücke nie ganz hinten) und d=2 (nur Teil 2)',(()=>{for(let i=0;i<60;i++){const a=scatterFill(5,6,'strip',R2,{pClassic:0}),b=scatterFill(1,2,'strip',R2,{pClassic:0});if(a.length!==5||!a.includes(5)||b.join()!=='1')return false;}return true;})());
    t('fillOf: Liste, Set vor Liste, Rückfall auf die ersten n bei fehlender/ungültiger Liste',[...fillOf(3,8,{fill:[0,0,1]})].join()==='0,1,2'&&[...fillOf(2,5,{fill:[1,3]})].join()==='1,3'&&[...fillOf(2,5,{filled:new Set([4]),fill:[1,3]})].join()==='4'&&[...fillOf(2,5)].join()==='0,1'&&[...fillOf(2,5,{fill:[1,9]})].join()==='0,1');
    const onIdx=(svg)=>[...svg.querySelectorAll('g.cell')].map((g,i)=>g.classList.contains('on')?i:-1).filter(i=>i>=0);
    t('Zeichnen mit fill: genau diese Zellen gefärbt (Kreis, Streifen, Raster); ohne fill die ersten n',onIdx(drawFractionCircle(3,8,{fill:[1,4,6]})).join()==='1,4,6'&&onIdx(drawFractionStrip(2,5,{fill:[0,3]})).join()==='0,3'&&onIdx(drawMode('grid',4,12,{fill:[1,5,6,11]})).join()==='1,5,6,11'&&onIdx(drawFractionStrip(3,6)).join()==='0,1,2');
    t('Kleine Bilder bekommen die Klasse „sm“ (feste Linienstärke), große nicht',drawFractionStrip(1,2,{maxW:110}).classList.contains('sm')&&!drawFractionStrip(1,2,{maxW:300}).classList.contains('sm'));
    for(const lvl of [1,2]){
      let bad=0,badNum=0,badRound=0;
      for(let i=0;i<300;i++){
        const g=generateTask('G01',lvl),b=generateTask('B01',lvl);
        g.cards.concat([g.target]).forEach(c=>{if(c.mode==='num'){if(c.fill!==undefined)badNum++;}else if(!validFill(c.fill,c.n,c.d))bad++;});
        if(!validFill(b.fill,b.a,b.b))bad++;
        if(JSON.stringify(JSON.parse(JSON.stringify(g)))!==JSON.stringify(g)||JSON.stringify(JSON.parse(JSON.stringify(b)))!==JSON.stringify(b))badRound++;
      }
      t('G01/B01 Niveau '+lvl+': Bilder tragen eine gültige Färbungsliste, Zahlkarten keine, JSON-Roundtrip stabil',bad===0&&badNum===0&&badRound===0);
      const pairs=genMemoryPairs(lvl,lvl===1?6:10,RNG),faces=[].concat(...pairs);
      t('Memory Niveau '+lvl+': Bildkarten tragen eine gültige Färbungsliste, Zahlkarten keine',faces.every(f=>f.mode==='num'?f.fill===undefined:validFill(f.fill,f.n,f.d)));
    }
    const b1={type:'B01',level:1,kind:'strip',a:2,b:4,k:3,target:12,fill:[1,3],avoid:[]};
    t('B01: Signatur ignoriert die Färbungsliste (Dedupe bleibt)',sigOf(b1)===sigOf(Object.assign({},b1,{fill:[0,2]})));
    t('B01: verstreut gefärbtes Bild mit passender Anzahl ist richtig, falsche Anzahl nicht',validateTask(b1,{parts:12,col:[1,5,6,9,10,11]}).correct&&validateTask(b1,{parts:12,col:[0,1,2,3,4]}).errorCode==='area');
    t('B01: Musterlösung zeigt die echte Verfeinerung (Teile 1 und 3 mit 3 verfeinert)',(()=>{const sol=buildWorkedSolution(b1),svg=sol[sol.length-1];return !!svg&&svg.querySelectorAll&&onIdx(svg).join()==='3,4,5,9,10,11';})());
    t('Altstand ohne Färbungsliste: G01-Karte und B01 werden wie früher gezeichnet (erste n)',onIdx(drawMode('strip',2,4,{fill:undefined})).join()==='0,1'&&[...fillOf(2,4,{fill:null})].join()==='0,1');
  }
  t('G04: getippter richtiger Bruch zählt trotz „Nicht kürzbar“',validateTask({type:'G04',level:1,mode:'full',a:6,b:9,p:2,q:3},{none:true,'r.n':'2','r.d':'3'}).correct);
  t('G04: nur „Nicht kürzbar“ bei kürzbarem Bruch ist falsch',!validateTask({type:'G04',level:1,mode:'full',a:6,b:9,p:2,q:3},{none:true}).correct);
  t('„Fast“-Meldung: richtiger Wert, aber andere Form',validateTask({type:'G03',level:1,mode:'factor',a:12,b:18,k:3},{'r.n':'2','r.d':'3'}).soft===true&&!validateTask({type:'G03',level:1,mode:'factor',a:12,b:18,k:3},{'r.n':'3','r.d':'5'}).soft);
  /* Lernpfad */
  const keepP={passed:S.passed,checked:S.checked,final:S.final,placed:S.placed,days:S.days,lab:S.lab,einstufung:S.einstufung,modus:S.modus,perfect:Object.assign({},S.perfect)};
  const freshP=()=>{S.passed={};S.checked={};S.final=false;S.placed=false;S.days={};S.lab=null;S.einstufung=null;S.modus={};S.perfect={};};
  const R_=(id)=>pathState(moduleById("veraendern")).find(r=>r.id===id);
  freshP();
  t('Pfad: Start – nächstes Bauteil G01, Labor offen, G02/B01/Abschluss gesperrt',pathState(moduleById("veraendern")).find(r=>r.next).id==='G01'&&R_('LAB').open&&R_('G02').locked&&R_('G02').blocker==='G01'&&R_('B01').locked&&R_('Q00').locked);
  S.passed['G01-L1']=true;
  t('Pfad: G01 fertig ⇒ G02 nächstes, freiwilliges B01 offen',R_('G02').next&&R_('B01').open&&!R_('B01').must);
  S.checked.G03=true;
  t('Pfad: im Check beherrscht ist nicht fertig – bleibt gesperrt hinter dem Nächsten',R_('G03').checked&&!R_('G03').done&&R_('G03').locked&&R_('G03').blocker==='G02'&&R_('G04').blocker==='G02');
  S.passed['G02-L2']=true;S.passed['T01-L1']=true;S.passed['G03-L1']=true;
  t('Pfad: knifflig bestanden zählt, nächstes ist G04',R_('G02').done&&R_('G04').next);
  ['G04','G05'].forEach(x=>{S.passed[x+'-L1']=true;});
  t('Pfad: nach G05 sind Knobel-Bauteile und Abschluss offen',['U01','U02','U03','O02','Q00'].every(x=>R_(x).open)&&R_('Q00').next);
  S.final=true;
  t('Pfad: alles fertig ⇒ kein nächstes Bauteil',!pathState(moduleById("veraendern")).some(r=>r.next));
  t('Pfad: 80 %-Regel (5→4, 8→7, 10→8)',needOf(5)===4&&needOf(8)===7&&needOf(10)===8&&needOf(15)===12);
  const rnd=(res,sk)=>({results:res.slice(),size:res.length,sk});
  freshP();
  let inf=onRoundEnd('G03',1,rnd(['f','f','f','x','f']));
  t('Rundenende: 4 von 5 ohne Tipp ⇒ bestanden, erstes Mal, Tagesziel',inf.passed&&inf.firstPass&&S.passed['G03-L1']&&inf.daily);
  inf=onRoundEnd('G03',1,rnd(['f','f','f','f','f']));
  t('Rundenende: zweites Mal kein firstPass, Tagesziel nur einmal',inf.passed&&!inf.firstPass&&!inf.daily);
  inf=onRoundEnd('G04',1,rnd(['f','x','x','l','s']));
  t('Rundenende: 2 von 5 ⇒ nicht bestanden',!inf.passed&&!S.passed['G04-L1']);
  /* Schnellcheck: 15 Fragen (je Fähigkeit 3) – sitzt = 3 von 3, fast = 2 von 3, sonst üben; Stufen start / plan / fit */
  const qplan=[].concat(Q_SKILLS,Q_SKILLS,Q_SKILLS);
  const qres=(bad)=>qplan.map((_,i)=>bad.includes(i)?'x':'f');
  const pos=(sk)=>qplan.map((x,i)=>x===sk?i:-1).filter(i=>i>=0);
  const qev=(res,prog)=>qEvaluate(res,qplan,15,!!prog);
  t('Schnellcheck: 15 Fragen, Hürde 12 von 15, Texte nennen diese Zahlen',TASKS.Q00.size===15&&needOf(15)===12&&PATH.find(m=>m.id==='Q00').desc.includes('15 Fragen')&&PATH.find(m=>m.id==='Q00').desc.includes('Ab 12')&&TASKS.Q00.desc.includes('15'));
  t('Auswertung: 0 und 4 von 15 = von vorn (nichts „sitzt“), 4 mit Fortschritt = Plan',qev(qres(qplan.map((_,i)=>i))).stufe==='start'&&qev(qres(qplan.map((_,i)=>i).filter(i=>i>=4))).stufe==='start'&&Q_SKILLS.every(sk=>qev(qres(qplan.map((_,i)=>i).filter(i=>i>=4))).skills[sk].status==='ueben')&&qev(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),true).stufe==='plan');
  t('Auswertung: 5 und 11 = Themenliste, 12 und 15 = fit',qev(qres(qplan.map((_,i)=>i).filter(i=>i>=5))).stufe==='plan'&&qev(qres(qplan.map((_,i)=>i).filter(i=>i>=11))).stufe==='plan'&&qev(qres(qplan.map((_,i)=>i).filter(i=>i>=12))).stufe==='fit'&&qev(qres([])).stufe==='fit');
  const mix=qev(qres([].concat(pos('teilbar').slice(0,1),pos('erweitern').slice(0,2),pos('kuerzen'))));
  t('Auswertung je Fähigkeit: 3/3 sitzt, 2/3 fast, 1/3 und 0/3 üben',mix.skills.gleich.status==='sitzt'&&mix.skills.teilbar.status==='fast'&&mix.skills.erweitern.status==='ueben'&&mix.skills.kuerzen.status==='ueben'&&mix.skills.vollstaendig.status==='sitzt');
  const oldPlan=['gleich','gleich','teilbar','teilbar','erweitern','erweitern','kuerzen','kuerzen','vollstaendig','vollstaendig'];
  const oldEv=qEvaluate(['f','f','x','f','f','f','f','x','f','f'],oldPlan,10,false);
  t('Auswertung: Runden mit 2 Fragen je Fähigkeit (Altdaten) funktionieren (2 von 2 = sitzt)',oldEv.skills.gleich.status==='sitzt'&&oldEv.skills.teilbar.status==='ueben'&&oldEv.skills.erweitern.status==='sitzt'&&oldEv.stufe==='fit');
  /* Rundenende: Platzierung, Plan, Urkunde */
  const badIx=[1,3,8]; /* teilbar 2/3, kuerzen 1/3, Rest 3/3 → 12 richtig */
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres(badIx),qplan));
  t('Einstufung: nur 3 von 3 ist per Check frei (G01, G02, G04), „fast“ und „üben“ nicht',S.checked.G01&&S.checked.G02&&S.checked.G04&&!S.checked.T01&&!S.checked.G03&&!S.checked.G05&&S.placed&&!inf.final&&inf.ev.stufe==='fit');
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres([]),qplan));
  t('Einstufung: 15 von 15 merkt alles als beherrscht, aber ohne echten Pfad keine Urkunde und nichts fertig',['G01','G02','T01','G03','G04','G05'].every(x=>S.checked[x])&&!inf.ready&&!inf.final&&!S.final&&!pathState(moduleById("veraendern")).some(r=>r.must&&r.done));
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
  t('Von vorn: höchstens 4 richtig ohne Fortschritt – nichts als beherrscht gemerkt, Pfad ohne Wahl',inf.ev.stufe==='start'&&Object.keys(S.checked).length===0&&S.placed&&!S.final&&lernenZustand(moduleById('veraendern'))==='pfad');
  freshP();S.passed['G01-L1']=true;
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
  t('Wenige Treffer mitten im Pfad: kein „von vorn“, nichts frei, Plan mit allem „üben“',inf.ev.stufe==='plan'&&Object.keys(S.checked).length===0&&S.einstufung.stufe==='plan'&&S.einstufung.skills.erweitern.status==='ueben');
  S.einstufung={at:1,right:13,size:15,stufe:'fit',skills:S.einstufung.skills};
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
  t('Wenige Treffer überschreiben einen vorhandenen Plan nicht',S.einstufung.at===1&&S.einstufung.stufe==='fit');
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres(pos('vollstaendig')),qplan));
  t('3+3+3+3+0 ist „fit“, aber nicht fertig: keine Urkunde, G03 beherrscht, G04 und G05 nicht',inf.ev.stufe==='fit'&&!inf.final&&!S.final&&S.checked.G03&&!S.checked.G04&&!S.checked.G05);
  freshP();['G01','G02','T01','G03','G04','G05'].forEach(x=>{S.passed[x+'-L1']=true;});
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=11)),qplan));
  t('Abschlusscheck: alles fertig, aber nur 11 von 15 ⇒ keine Urkunde (ready, nicht passed)',inf.ready&&!inf.passed&&!inf.final&&!S.final);
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=12)),qplan));
  t('Abschlusscheck: alles fertig und 12 von 15 ⇒ Urkunde',inf.ready&&inf.passed&&inf.final&&S.final);
  freshP();S.passed['G01-L1']=true;
  inf=onRoundEnd('Q00',1,rnd(['f','f','f','f','f','f','x','x','f','f'],oldPlan));
  t('Abschluss: ohne alle Pflicht-Bauteile keine Urkunde',inf.passed&&!inf.final&&!S.final);
  t('Migration 6: alte Schnellcheck-Runden (10 Fragen) werden verworfen, Rest bleibt',(()=>{const o={rounds:{'Q00-L1':{size:10,results:[]},'Q00-L2':{size:15,results:[]},'G02-L1':{size:5,results:[]}}};migrate6(o);return !o.rounds['Q00-L1']&&!!o.rounds['Q00-L2']&&!!o.rounds['G02-L1'];})());
  freshP();
  const dk=(off)=>{const d=new Date();d.setDate(d.getDate()+off);return dayKey(d);};
  S.days[dk(0)]=1;S.days[dk(-1)]=2;S.days[dk(-2)]=1;
  t('Tage-Serie: 3 Tage in Folge',dayStreak()===3);
  delete S.days[dk(0)];
  t('Tage-Serie: heute noch nichts ⇒ ab gestern gezählt',dayStreak()===2);
  S.days={};S.days[dk(-3)]=1;
  t('Tage-Serie: Lücke ⇒ 0',dayStreak()===0);
  const old={progress:{'G03-L1':{first:5},'G02-L2':{first:3},'D01-L1':{first:9},'G01-L1':{first:4}}};
  migrate4(old);
  t('Migration: mind. 4 Treffer ⇒ bestanden; Rest und Nicht-Pfad-Übungen nicht',old.passed['G03-L1']&&old.passed['G01-L1']&&!old.passed['G02-L2']&&!old.passed['D01-L1']&&!!old.checked&&!!old.days);
  /* Lernen: Eingangstest, Wahl, Pfad und Selbst aussuchen */
  {
    const mod=moduleById('veraendern'),Z=()=>lernenZustand(mod);
    const view=()=>{const d=el('div');pfadTab(d,mod);return d;};
    const beispiel=()=>{freshP();return onRoundEnd('Q00',1,rnd(qres([].concat(pos('teilbar').slice(0,1),pos('kuerzen'),pos('vollstaendig'))),qplan));};
    freshP();
    t('Lernen: Neuling → erst der Eingangstest; Üben-Runden allein ändern das nicht',Z()==='gate'&&(()=>{S.progress['G02-L1']={done:3,first:2,later:1,skipped:0,shown:0};const z=Z();delete S.progress['G02-L1'];return z==='gate';})());
    const gv=view();
    t('Lernen: Eingangstest-Ansicht hat nur den Startknopf, keine Bauteil-Liste, keinen Schalter',/Eingangstest starten/.test(gv.textContent)&&!gv.querySelector('.rail')&&!gv.querySelector('.seg')&&/Üben/.test(gv.textContent));
    onRoundEnd('Q00',1,rnd(qres([1,3,8]),qplan));
    t('Lernen: nach dem Check (fit) kommt die Wahl mit zwei Karten, noch kein Modus gespeichert',Z()==='wahl'&&!S.modus.veraendern&&view().querySelectorAll('.wahl .bigbtn').length===2);
    freshP();onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
    t('Lernen: höchstens 4 von 15 richtig → direkt der Pfad, keine Wahl',Z()==='pfad'&&S.modus.veraendern==='pfad');
    freshP();S.passed['G02-L1']=true;
    t('Lernen: Bestandsnutzer (schon Fortschritt, noch keine Wahl) → einmal die Wahl',Z()==='wahl');
    S.modus.veraendern='irgendwas';
    t('Lernen: unbekannter Modus gilt als „keine Wahl“',Z()==='wahl'&&lernenZustand({id:'x',path:[]})==='pfad');
    beispiel();
    t('Beispiel-Check: Gleiche Anteile und Erweitern beherrscht, Teilbarkeit „fast“, Kürzen „üben“',S.checked.G01&&S.checked.G02&&!S.checked.T01&&!S.checked.G03&&!S.checked.G04&&S.einstufung.skills.teilbar.status==='fast'&&S.einstufung.skills.kuerzen.status==='ueben');
    const P=pathState(mod,'pfad'),F=pathState(mod,'frei');
    const rP=(id)=>P.find(r=>r.id===id),rF=(id)=>F.find(r=>r.id===id);
    t('Pfad-Modus: der Check überspringt nichts – Gleiche Anteile als Nächstes, Erweitern noch gesperrt',rP('G01').next&&!rP('G01').done&&rP('G01').checked&&rP('G02').locked);
    t('Selbst aussuchen: Beherrschtes offen (G01, G02), dazu Labor und Bruchbilder vor der Lücke',rF('G01').open&&rF('G02').open&&rF('LAB').open&&rF('B01').open&&!rF('G01').done);
    t('Selbst aussuchen: die Lücke (Teilbarkeit) und alles danach gesperrt, auch Knobeln, Mischen, Abschluss',['T01','G03','G04','G05','U01','U02','U03','O02','Q00'].every(id=>rF(id).locked)&&!F.some(r=>r.next));
    S.passed['G01-L1']=true;
    t('Fortschritt gilt in beiden Modi: G01 fertig, im Pfad ist Erweitern dran',pathState(mod,'frei').find(r=>r.id==='G01').done&&pathState(mod,'pfad').find(r=>r.id==='G01').done&&pathState(mod,'pfad').find(r=>r.next).id==='G02');
    beispiel();S.modus.veraendern='pfad';
    const pv=view();
    t('Pfad-Ansicht: Schalter, Fortschrittszeile, „Start: Gleiche Anteile erkennen“, Liste eingeklappt, Check-Marken',!!pv.querySelector('.seg')&&!!pv.querySelector('.pfadline')&&/^Start: Gleiche Anteile erkennen/.test(pv.querySelector('.bigbtn').textContent)&&!!pv.querySelector('details.fold:not([open]) .rail')&&pv.querySelectorAll('.mchk.sitzt').length===2&&pv.querySelectorAll('.mchk.fast').length===1&&/Als Nächstes/.test(pv.textContent)&&!/Weiter geht/.test(pv.textContent)&&/Eingangstest wiederholen/.test(pv.textContent));
    S.passed['G01-L1']=true;
    t('Pfad-Ansicht: nach dem ersten bestandenen Bauteil heißt der Knopf „Weiter“',/^Weiter: Gleiche Anteile erkennen|^Weiter: Erweitern/.test(view().querySelector('.bigbtn').textContent));
    S.modus.veraendern='frei';
    const fv=view();
    t('Selbst-aussuchen-Ansicht: Liste offen (nicht eingeklappt), Hinweis, keine Hauptkarte, offene und gesperrte Bauteile',!!fv.querySelector('.rail')&&!fv.querySelector('details')&&!!fv.querySelector('.modushint')&&!fv.querySelector('.bigbtn')&&fv.querySelectorAll('li.mod.locked').length>=8&&fv.querySelectorAll('li.mod.open, li.mod.done').length>=3);
    t('Tagesziel und Serie stehen im Reiter Ich (dayCard), nicht mehr im Lernpfad',/Tagesziel/.test(dayCard().textContent)&&!/Tagesziel/.test(view().textContent));
    freshP();
  }
  /* Bruch-Tresor: Code-Bruch, Schlösser, Tür */
  {
    let okCode=true,okSlots=true,okTypes=true,okDoor=true,okRange=true;
    const allowed=new Set([].concat(...Object.values(VAULT_GROUPS).map(gs=>[].concat(...gs))));
    for(const lvl of [1,2])for(let i=0;i<300;i++){
      const v=newVault(lvl),c=v.door.task;
      okCode=okCode&&c.a===c.p*(c.a/c.p)&&c.a%c.p===0&&c.b/c.q===c.a/c.p&&gcd(c.p,c.q)===1&&c.a/c.p>=2&&c.p<c.q;
      okSlots=okSlots&&v.digits.length===v.locks.length&&v.digits.join('')===String(c.a)+String(c.b)&&v.numLen===String(c.a).length&&v.locks.length===(lvl===1?3:4);
      okTypes=okTypes&&v.locks.every(l=>allowed.has(l.task.type)&&!/^D0/.test(l.task.type))&&new Set(v.locks.map(l=>l.task.type)).size===v.locks.length;
      okRange=okRange&&(lvl===1?(c.a<=9&&c.b>=10&&c.b<=60):(c.a>=10&&c.b<=99&&c.b>c.a&&(c.a/c.p)%10!==0&&(c.a/c.p)>=6));
      const g=c.a/c.p,k=smallestPrimeFactor(g),part=validateTask(c,{'r.n':String(c.a/k),'r.d':String(c.b/k)});
      okDoor=okDoor&&validateTask(c,{'r.n':String(c.p),'r.d':String(c.q)}).correct
        &&!validateTask(c,{'r.n':String(c.a),'r.d':String(c.b)}).correct
        &&(k===g?part.correct:(!part.correct&&part.soft&&part.errorCode==='notFull')); /* Teilschritt: bei zusammengesetztem Teiler nur „fast“ */
    }
    t('Tresor: Code-Bruch a/b = p/q erweitert, p/q gekürzt, Teiler ≥ 2',okCode);
    t('Tresor: ein Schloss je Ziffer (leicht 3, knifflig 4), Ziffern = Zähler + Nenner',okSlots);
    t('Tresor: nur Erweitern/Kürzen-Schlösser, jede Art höchstens einmal',okTypes);
    t('Tresor: Zahlenbereich leicht a ≤ 9, b ≤ 60; knifflig zweistellig, Teiler ab 6 (nicht 10, 20)',okRange);
    t('Tresor: Tür akzeptiert nur den gekürzten Code-Bruch',okDoor);
    const dv=newVault(2).door.task,h=TASKS.V01.hints(dv);
    t('Tresor: Tür-Tipps sind drei Stufen zum Code-Bruch, der erste Tipp der Aufgabe nennt keine Pauschalregel',h.length===3&&h.every(x=>x.length>0)&&!h.flat().some(l=>/IMMER/.test(l)));
    const half=validateTask({type:'V01',level:2,mode:'full',a:48,b:72,p:2,q:3},{'r.n':'24','r.d':'36'});
    t('Tresor: Tür 48/72 → 24/36 ist „fast“ (noch kürzbar)',!half.correct&&half.soft&&half.errorCode==='notFull');
    t('Tresor: alte Tresor-Zustände ohne ver:2 werden verworfen',!vaultOk({level:1,code:[1,2,3],locks:[{},{},{}],active:0,opened:false},1)&&vaultOk(newVault(1),1)&&!vaultOk(newVault(1),2));
  }
  /* Hilfe bei Problemen: vollständig, kurze Sätze für Kinder von 11–12 Jahren, öffnet sich mit Thema */
  {
    const words=(s)=>s.split(/\s+/).filter(Boolean).length;
    const texts=[];
    PROBLEMS.forEach(p=>{texts.push(p.q);if(p.intro)texts.push(p.intro);p.steps.forEach(s=>texts.push(s));if(p.tip)texts.push(p.tip);});
    const longest=Math.max(...[].concat(...texts.map(x=>x.replace(/\*\*/g,'').split(/[.!?]\s+/))).map(words));
    t('Hilfe: jedes Thema hat Frage, 1–4 Schritte und eine eindeutige Kennung',PROBLEMS.length>=6&&PROBLEMS.every(p=>p.id&&p.q&&p.steps.length>=1&&p.steps.length<=4)&&new Set(PROBLEMS.map(p=>p.id)).size===PROBLEMS.length);
    t('Hilfe: kurze Sätze, höchstens 14 Wörter (längster: '+longest+')',longest<=14);
    t('Hilfe: alle Knöpfe und Zusatzzeilen der Themen gibt es',PROBLEMS.every(p=>(p.acts||[]).every(k=>!!HELP_ACTS[k])&&(!p.extra||typeof p.extra==='function')));
    openProblemHelp('speichern');
    const hm=document.querySelector('.techmodal');
    const open1=hm?hm.querySelectorAll('details.tech[open]'):[];
    t('Hilfe: öffnet sich mit dem gewünschten Thema, genau ein Eintrag offen',!!hm&&hm.querySelectorAll('details.tech').length===PROBLEMS.length&&open1.length===1&&open1[0].dataset.id==='speichern');
    closeProblemHelp();
    t('Hilfe: Schließen entfernt die Anleitung',!document.querySelector('.techmodal')&&techModal===null);
  }
  /* Erklärungen: für alle Lernpfad-Bauteile, kurze Sätze, Rechnungen als Daten und rechnerisch richtig, Gate, Altbestand */
  {
    const ids=PATH.map(m=>m.id),keepI=S.intro;
    const words=(s)=>s.split(/\s+/).filter(Boolean).length;
    const sentences=(s)=>s.replace(/\*\*/g,'').split(/[.!?]\s+/);
    const texts=[],steps=[];
    ids.forEach(id=>{const I=INTRO[id];if(!I)return;texts.push(I.title);I.steps.forEach(s=>{steps.push(s);texts.push(s.h,...(s.say||[]));});});
    const longest=Math.max(...[].concat(...texts.map(sentences)).map(words));
    t('Erklärungen: jedes der '+ids.length+' Lernpfad-Bauteile hat eine mit 3–4 Schritten, Überschrift und 2–5 Sätzen',ids.every(id=>INTRO[id]&&INTRO[id].title&&INTRO[id].steps.length>=3&&INTRO[id].steps.length<=4&&INTRO[id].steps.every(s=>s.h&&Array.isArray(s.say)&&s.say.length>=2&&s.say.length<=5))&&Object.keys(INTRO).length===ids.length);
    t('Erklärungen: kurze Sätze, höchstens 14 Wörter (längster: '+longest+')',longest<=14);
    t('Erklärungen: keine Rechnung im Text (Zahlen, Rechenzeichen, Brüche stehen als Daten), kein Emoji, kein ✓/★/✗',texts.every(x=>!/\d\s*[·×÷+−=]\s*\d|\d\s*:\s*\d|[☀-➿\u{1F000}-\u{1FFFF}]/u.test(x)));
    /* Rechnungen: alle Brüche einer Zeile gleich (Lücke „?“ muss ganzzahlig lösbar sein), Erweitern/Kürzen mit Zahl ≥ 2 passend, Rechenketten stimmen */
    const isOp=(x)=>x==='+'||x==='·'||x===':',calcOK=(l)=>{
      if(l.some(x=>x&&x.m)){ /* gemischte Zahl: Bruch = Ganze + Rest = {m} */
        const [w,n,d]=l.find(x=>x&&x.m).m,f2=l.filter(Array.isArray);
        return f2.length===2&&equivalent(f2[0][0],f2[0][1],w*d+n,d)&&f2[1][0]===n&&f2[1][1]===d&&l.includes(w);
      }
      const fr=l.filter(Array.isArray);
      if(fr.length){
        const known=fr.filter(f=>!f.includes('?')),gap=fr.filter(f=>f.includes('?'));
        if(!known.length||gap.length>1)return false;
        const [a,b]=known[0];
        if(!known.every(f=>equivalent(a,b,f[0],f[1])))return false;
        if(known.some(f=>f[2]&&!(Number.isInteger(f[3])&&f[3]>=2&&(f[2]==='x'||(f[0]%f[3]===0&&f[1]%f[3]===0)))))return false;
        return gap.every(g=>g[0]==='?'?(a*g[1])%b===0&&a*g[1]/b>=1:(b*g[0])%a===0&&b*g[0]/a>=1);
      }
      const eqi=l.indexOf('=');if(eqi<1)return false;
      let from=0;for(let i=eqi-1;i>=0;i--)if(typeof l[i]!=='number'&&!isOp(l[i])){from=i+1;break;}
      const left=l.slice(from,eqi),right=[];
      for(const x of l.slice(eqi+1)){if(typeof x==='number'||isOp(x))right.push(x);else break;}
      const ev=(r)=>{let v=r[0];for(let i=1;i<r.length;i+=2)v=r[i]==='+'?v+r[i+1]:r[i]==='·'?v*r[i+1]:v/r[i+1];return v;};
      const rest=l[eqi+1+right.length]==='Rest'?l[eqi+2+right.length]:0;
      return rest?(right.length===1&&left.length===3&&left[1]===':'&&left[0]===left[2]*right[0]+rest):ev(left)===ev(right);
    };
    let calcs=0,calcBad=0,wrongBad=0;
    steps.forEach(s=>(s.calc||[]).forEach(l=>{
      calcs++;
      if(l.wrong){const [x,,y]=l.t;if(equivalent(x[0],x[1],y[0],y[1]))wrongBad++;}
      else if(!calcOK(l))calcBad++;
    }));
    t('Erklärungen: alle '+calcs+' Rechnungen stimmen (gleiche Brüche, Lücken lösbar, Teilbarkeit); falsche Rechnung ist wirklich falsch',calcs>=25&&calcBad===0&&wrongBad===0);
    t('Erklärungen: Bilder gültig (Teile, Färbung als gültige Indexliste, Farbe), höchstens ein Bild oder Ausprobieren je Schritt',steps.every(s=>{
      if([s.fig,s.lab,s.tryit,s.nline,s.nltry].filter(Boolean).length>1)return false;
      const f=s.fig&&(Array.isArray(s.fig)?{mode:'strip',rows:s.fig}:s.fig);
      return !f||(['strip','circle'].includes(f.mode)&&f.rows.length>=1&&f.rows.length<=3&&f.rows.every(r=>r.n>=1&&r.d>r.n&&(!r.fill||validFill(r.fill,r.n,r.d))&&[undefined,'erw','kue'].includes(r.acc)));
    }));
    t('Erklärungen: Ausprobieren und Labor-Bild gültig; ein Schritt geht, bei Kürzen zeigt ein anderer die Absage',steps.every(s=>{
      const ty=s.tryit,lb=s.lab;
      if(lb&&!(labOkFrac(lb.base)&&labOkFrac(lb.cur)&&equivalent(lb.base[0],lb.base[1],lb.cur[0],lb.cur[1])&&['x','d'].includes(lb.op)&&Number.isInteger(lb.k)))return false;
      if(!ty)return true;
      return labOkFrac(ty.base)&&['x','d'].includes(ty.op)&&ty.ks.length>=2&&ty.ks.length<=4&&ty.ks.every(k=>LAB_FACTORS.includes(k))
        &&ty.ks.some(k=>labCan(ty.base,ty.op,k))&&(ty.op==='x'||ty.ks.some(k=>!labCan(ty.base,ty.op,k)));
    })&&steps.filter(s=>s.tryit).length===4);
    t('Erklärungen: Schnellcheck nennt die Zahlen aus den Einstellungen (Fragen, Urkunden-Hürde)',(()=>{const x=INTRO.Q00.steps.map(s=>s.say.join(' ')).join(' ');return x.includes(TASKS.Q00.size+' Fragen')&&x.includes('Ab '+needOf(TASKS.Q00.size)+' richtigen');})());
    t('Erklärungen: Wörter und Knöpfe stimmen mit den Namen auf dem Bildschirm überein',[['G02','Erweiterungszahl'],['G03','Kürzungszahl'],['G04','Geht nicht mehr'],['G04','Sind beide Zahlen gerade'],['G01','Prüfen'],['LAB','Rückgängig'],['O02','Weg neu starten'],['T01','Merkkasten']].every(([id,w])=>INTRO[id].steps.some(s=>s.say.some(x=>x.includes('**'+w)))));
    let built=true;
    try{steps.forEach(s=>{introRich(s.h);s.say.forEach(introRich);if(s.fig)introFigNode(s.fig);if(s.calc)introCalcNode(s.calc);if(s.tryit)introTry(s.tryit);if(s.lab)labFigure({mode:'strip',base:s.lab.base,cur:s.lab.cur,last:{op:s.lab.op,k:s.lab.k}});});}catch(e){built=false;}
    t('Erklärungen: alle Schritte lassen sich aufbauen',built);
    t('Erklärungen: **fett** und {n|d} werden zu Text, Hervorhebung und Bruch',(()=>{const n=introRich('Tippe **Prüfen**. Aus {4|6} wird {2|3}.');return n.length===7&&n[1].tagName==='STRONG'&&n[1].textContent==='Prüfen'&&n[3].classList.contains('frac')&&n[3].textContent==='46'&&n[5].classList.contains('frac')&&n[5].textContent==='23';})());
    /* Gate: ungesehen oder ausdrücklich geöffnet; nie für Spiele, Startseite */
    S.intro={};
    t('Gate: Bruchlabor und Übungen des Lernpfads zeigen die Erklärung, solange sie ungesehen ist',introWanted({kind:'lab'})==='LAB'&&introWanted({kind:'practice',id:'G02'})==='G02'&&introWanted({kind:'practice',id:'Q00'})==='Q00');
    t('Gate: nie bei Spielen, auf der Startseite und bei unbekannten Kennungen',!introWanted({kind:'practice',id:'O01'})&&!introWanted({kind:'game',id:'S01'})&&!introWanted({kind:'home'})&&!introWanted({kind:'practice',id:'ZZ'})&&!introWanted({kind:'practice',id:'constructor'})&&!introWanted(null));
    S.intro={G02:true,LAB:true};
    t('Gate: Gesehenes kommt nicht wieder – außer per Knopf im Merkkasten (view.intro)',!introWanted({kind:'practice',id:'G02'})&&!introWanted({kind:'lab'})&&introWanted({kind:'practice',id:'G02',intro:true})==='G02'&&introWanted({kind:'lab',intro:true})==='LAB'&&introWanted({kind:'practice',id:'G03'})==='G03');
    S.intro=keepI;
    const mi=(o)=>{migrateIntro(o);return o.intro;};
    const m1=mi({progress:{'G02-L1':{done:3,first:1,later:2,skipped:0,shown:0},'U01-L2':{done:0,first:0,later:0,skipped:1,shown:0}},passed:{'G03-L2':true},rounds:{'T01-L1':{results:['f'],cur:null,size:8}},lab:{did:{x:true,d:false},done:false},placed:true});
    t('Migration 7: bearbeitete Bauteile gelten als gesehen (Zähler, bestanden, Antwort in einer Runde, Labor, Schnellcheck)',m1.G02===true&&m1.U01===true&&m1.G03===true&&m1.T01===true&&m1.LAB===true&&m1.Q00===true&&!m1.G01&&!m1.G04&&!m1.G05&&!m1.B01&&!m1.U02);
    t('Migration 7: bloßes Öffnen, leere Runde und „per Check frei“ zählen nicht; Neuling bleibt leer',Object.keys(mi({progress:{'G01-L1':{done:0,first:0,later:0,skipped:0,shown:0}},rounds:{'G05-L1':{results:[],cur:{},size:5}},checked:{G02:true},lab:{did:{x:false,d:false},done:false}})).length===0&&Object.keys(mi({})).length===0);
    const o7={intro:{G01:true},final:true,progress:{}};migrateIntro(o7);const once=JSON.stringify(o7);migrateIntro(o7);
    t('Migration 7: idempotent, lässt Vorhandenes stehen, Urkunde zählt für den Schnellcheck',JSON.stringify(o7)===once&&o7.intro.G01===true&&o7.intro.Q00===true&&Object.keys(o7.intro).length===2);
    t('Migration 7: kaputtes intro (Liste, Text, null) wird zu einem leeren Objekt',[[1,2],'x',null].every(v=>{const o={intro:v,progress:{'G02-L1':{done:1}}};migrateIntro(o);return !Array.isArray(o.intro)&&typeof o.intro==='object'&&o.intro.G02===true&&Object.keys(o.intro).length===1;}));
    t('Zustand: neuer Spielstand hat intro:{} (Erklärungen ungesehen)',typeof defaultState().intro==='object'&&Object.keys(defaultState().intro).length===0);
  }
  Object.assign(S,keepP);persist();
  /* Bruchrechnung (Grundlage für spätere Themen) */
  const eqF=(x,y)=>x&&y&&x[0]===y[0]&&x[1]===y[1];
  t('kgV: 4 und 6 → 12, 5 und 7 → 35, 6 und 6 → 6, 0 → 0',lcm(4,6)===12&&lcm(5,7)===35&&lcm(6,6)===6&&lcm(0,5)===0);
  t('1/2 + 1/3 = 5/6 (nicht 2/5)',eqF(addFrac(1,2,1,3),[5,6]));
  t('3/4 + 1/4 = 4/4, gekürzt 1/1',eqF(addFrac(3,4,1,4),[4,4])&&eqF(simplify(4,4),[1,1]));
  t('2/3 + 5/6 = 9/6, gekürzt 3/2, gemischt 1 1/2',eqF(addFrac(2,3,5,6),[9,6])&&eqF(simplify(9,6),[3,2])&&toMixed(3,2).w===1&&toMixed(3,2).n===1);
  t('3/4 − 1/6 = 7/12',eqF(subFrac(3,4,1,6),[7,12]));
  t('2/3 · 3/4 = 6/12, gekürzt 1/2',eqF(mulFrac(2,3,3,4),[6,12])&&eqF(simplify(6,12),[1,2]));
  t('2/3 : 4/5 = 10/12 (mit Kehrwert), gekürzt 5/6; Teilen durch 0 → null',eqF(divFrac(2,3,4,5),[10,12])&&divFrac(1,2,0,3)===null);
  t('Vergleich: 3/4 > 2/3, 2/4 = 1/2, 1/3 < 3/8',compareFrac(3,4,2,3)===1&&compareFrac(2,4,1,2)===0&&compareFrac(1,3,3,8)===-1);
  t('Ordnen: 3/4, 1/2, 2/3, 5/6 → 1/2, 2/3, 3/4, 5/6',JSON.stringify(sortFracs([[3,4],[1,2],[2,3],[5,6]]))==='[[1,2],[2,3],[3,4],[5,6]]');
  t('Unechter Bruch: 7/4 ja, 4/4 ja, 3/4 nein; 7/4 = 1 3/4, 8/4 = 2 0/4',isImproper(7,4)&&isImproper(4,4)&&!isImproper(3,4)&&toMixed(7,4).w===1&&toMixed(7,4).n===3&&toMixed(8,4).w===2&&toMixed(8,4).n===0);
  /* Zahlengerade: Geometrie (ohne DOM) und Zeichnung */
  const ng=numberLineGeometry(0,2,4,[{n:3,d:4},{n:5,d:4,text:''},{n:9,d:4},{n:1,d:0}]);
  t('Zahlengerade: 0 bis 2 mit Viertelteilung hat 9 Teilstriche, 3 Hauptstriche',ng.ticks.length===9&&ng.ticks.filter(x=>x.major).length===3);
  t('Zahlengerade: 3/4 liegt bei 3/8 der Länge, 1 genau in der Mitte; außerhalb und Nenner 0 entfallen',ng.marks.length===2&&Math.abs(ng.marks[0].x-(ng.pad+0.375*(ng.W-2*ng.pad)))<1e-9&&Math.abs(ng.ticks[4].x-ng.W/2)<1e-9);
  t('Zahlengerade: Beschriftung „n/d“ standardmäßig, leer = ohne',ng.marks[0].text==='3/4'&&ng.marks[1].text==='');
  const nlSvg=drawNumberLine({from:0,to:1,parts:3,marks:[{n:2,d:3}]});
  t('Zahlengerade: SVG hat Achse, 4 Teilstriche, 2 Zahlen (0, 1) und eine Marke',nlSvg.querySelectorAll('.nl-axis').length===1&&nlSvg.querySelectorAll('.nl-tick').length===4&&nlSvg.querySelectorAll('.nl-num').length===2&&nlSvg.querySelectorAll('.nl-mark').length===1&&nlSvg.querySelector('.nl-lab').textContent==='2/3');
  /* Zahlenstrahl: Einteilung, Striche, Ausschnitt (Lupe) */
  t('Einteilung: Nenner geht auf (3 in 12, 5 in 10), geht nicht auf (4 in 10, 3 in 8); gemeinsamer Nenner 3, 8 → 24 und 4, 6, 12 → 12',fitsDivision(3,12)&&fitsDivision(5,10)&&!fitsDivision(4,10)&&!fitsDivision(3,8)&&commonDenominator([3,8])===24&&commonDenominator([4,6,12])===12&&commonDenominator([5])===5);
  t('Strichnummer: 3/5 bei 10 Teilen ist Strich 6, 1/2 bei 8 Teilen Strich 4, 1/3 bei 10 Teilen keiner',tickOf(3,5,10)===6&&tickOf(1,2,8)===4&&tickOf(1,3,10)===null&&tickOf(7,4,4)===7);
  {
    const wg=numberLineGeometry(0,1,24,[{i:6,text:'A'},{i:20},{n:1,d:4,text:''},{n:1,d:3}],{win:[4,12]});
    t('Zahlengerade-Ausschnitt: Striche 4 bis 12 über die ganze Breite, nur Marken im Ausschnitt',wg.ticks.length===9&&Math.abs(wg.ticks[0].x-wg.pad)<1e-9&&Math.abs(wg.ticks[8].x-(wg.W-wg.pad))<1e-9&&wg.marks.length===3&&wg.marks[0].i===6&&wg.marks[1].i===6&&wg.marks[2].i===8&&wg.marks[0].text==='A'&&!wg.marks.some(m=>m.i===20));
    const og=numberLineGeometry(0,2,6,[],{});
    t('Strich zur x-Stelle: nächster Strich, begrenzt auf den Strahl',og.idxAt(og.pad)===0&&og.idxAt(og.W-og.pad)===12&&og.idxAt(og.W/2)===6&&og.idxAt(-50)===0&&og.idxAt(9999)===12&&Math.abs(og.sp-og.len/12)<1e-9);
    const sg=numberLineGeometry(0,1,4,[],{strip:true});
    t('Zahlengerade mit Streifen: mehr Höhe, Achse tiefer',sg.H>og.H&&sg.y>og.y&&sg.top===34);
  }
  {
    let picked=null,sec=null;
    const sv=drawNumberLine({from:0,to:1,parts:5,strip:{n:2,d:5},secs:{on:new Set([1]),onTap:i=>{sec=i;}},onPick:i=>{picked=i;},labels:'ends'});
    t('Zahlengerade: Streifen mit 5 Zellen (2 gefärbt), 5 Abschnitte (1 gezählt), Tippfläche, nur Enden beschriftet',sv.querySelectorAll('.nl-cell').length===5&&sv.querySelectorAll('.nl-cell.on').length===2&&sv.querySelectorAll('.nl-sec').length===5&&sv.querySelectorAll('.nl-sec.on').length===1&&!!sv.querySelector('.nl-cap')&&sv.querySelectorAll('.nl-num').length===2);
    sv.querySelectorAll('.nl-sec')[3].dispatchEvent(new Event('click'));
    t('Zahlengerade: Tippen auf einen Abschnitt meldet seine Nummer',sec===3&&picked===null);
    const lupe=drawNumberLine({from:0,to:1,parts:24,win:[8,16],frame:null,labels:'none'});
    t('Zahlengerade: Lupe zeigt 9 Striche, ohne Beschriftung',lupe.querySelectorAll('.nl-tick').length===9&&lupe.querySelectorAll('.nl-num').length===0);
    const ov=drawNumberLine({from:0,to:1,parts:24,frame:[8,16]});
    t('Zahlengerade: Übersicht hat 25 Striche und einen Rahmen um das Fenster',ov.querySelectorAll('.nl-tick').length===25&&ov.querySelectorAll('.nl-frame').length===1);
  }
  /* Zahlenstrahl-Aufgaben Z01–Z08: Lösungsprobe, Fehlercodes, Zahlenraum, Zeichnen */
  {
    const nlOK=(t,d)=>validateTask(t,d).correct===true;
    /* richtige Antwort (Entwurf) zu einer erzeugten Aufgabe */
    const answer=(t)=>{
      switch(t.type){
        case 'Z01':return t.kind==='count'?{a:String(t.m)}:t.kind==='pick'?{sel:t.ans}:{ans:t.equal?'ja':'nein'};
        case 'Z02':{const d={};t.idx.forEach((n,k)=>{d['r'+k+'.n']=String(n);d['r'+k+'.d']=String(t.m);});return d;}
        case 'Z03':return {nl:{pts:t.idx.slice()}};
        case 'Z04':return {nl:{parts:t.d,pts:t.fr.slice()}};
        case 'Z05':{
          const lands=nlLands(t.a,t.b,t.m),red=simplify(t.a,t.b)[1];
          if(t.kind==='nofit')return {fit:'nein',nl:{parts:red,pts:[t.a*red/t.b]}};
          return {fit:'ja',x:String(t.a*t.m/t.b),nl:{pts:[t.a*t.m/t.b]}};
        }
        case 'Z06':return {nl:{parts:t.l,pts:t.fr.map(f=>f[0]*t.l/f[1])}};
        case 'Z07':{const d={};t.ns.forEach((n,j)=>{d['w'+j]={pts:t.level===1?[t.p]:t.ps.map(p=>p-(t.from||0)*t.q)};});return d;}
        case 'Z08':
          if(t.kind==='between')return {lo:String(Math.floor(t.n/t.d)),hi:String(Math.floor(t.n/t.d)+1)};
          if(t.kind==='mixed')return {w:String(Math.floor(t.n/t.d)),'r.n':String(t.n%t.d),'r.d':String(t.d)};
          return {sel:t.cards.map((c,i)=>c[0]%c[1]===0?i:-1).filter(i=>i>=0)};
      }
    };
    let n=0,bad=[],range=[];
    for(const id of ['Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'])for(const lvl of [1,2])for(let i=0;i<120;i++){
      const tk=generateTask(id,lvl);n++;
      if(!nlOK(tk,answer(tk)))bad.push(id+'-L'+lvl+' '+JSON.stringify(tk));
      const steps=(tk.u||1)*(tk.m||tk.d||tk.l||tk.q||1);
      const lim=(id==='Z04'||id==='Z05'||id==='Z06')?NL_MAXSTEPS:12;
      if(id!=='Z08'&&id!=='Z07'&&steps>lim)range.push(id+'-L'+lvl+' Striche '+steps);
      if(id==='Z07'&&tk.ns.some(m=>m*tk.q>12))range.push('Z07 Striche');
      if(id==='Z08'&&tk.kind!=='nat'&&tk.level===1&&tk.u*tk.d>12)range.push('Z08 Striche');
      /* Beschreibung der Punkte: nie auf ganzen Zahlen, Werte im Strahl */
      if(id==='Z02'||id==='Z03')if(tk.idx.some(x=>x%tk.m===0||x<=0||x>=tk.u*tk.m)||new Set(tk.idx).size!==tk.idx.length)range.push(id+' Punkte');
      if(id==='Z06'&&(new Set(tk.fr.map(f=>redKey(f[0],f[1]))).size!==tk.fr.length||tk.fr.some(f=>f[0]%f[1]===0||f[0]>=tk.u*f[1])||tk.l>24))range.push('Z06 Brüche');
    }
    t('Zahlenstrahl: '+n+' erzeugte Aufgaben Z01–Z08 sind mit der richtigen Antwort lösbar',bad.length===0||(console.log(bad.slice(0,3)),false));
    t('Zahlenstrahl: Zahlenraum (Z01–Z03 und Z07 höchstens 12 Striche, Z04–Z06 höchstens 24), Punkte nie auf ganzen Zahlen, Z06-Brüche verschieden',range.length===0||(console.log(range.slice(0,3)),false));
    /* Fehlercodes mit Beispielaufgaben */
    const v=(tk,d)=>validateTask(tk,d);
    const z1={type:'Z01',level:1,kind:'count',u:1,m:5,avoid:[]},z1b={type:'Z01',level:2,kind:'count',u:2,m:3,avoid:[]};
    t('Z01: Striche statt Abschnitte (6 statt 5) → ticks; ganzer Strahl (6 bei 0–2 mit 3 Teilen) → whole; leer ungültig',v(z1,{a:'6'}).errorCode==='ticks'&&v(z1b,{a:'6'}).errorCode==='whole'&&v(z1b,{a:'7'}).errorCode==='ticks'&&v(z1,{}).invalid===true&&v(z1,{a:'4'}).errorCode==='count');
    const z1p={type:'Z01',level:1,kind:'pick',u:1,m:5,opts:[4,5,6],ans:1,trap:0,avoid:[]};
    t('Z01: Strahl mit 5 Strichen (4 Abschnitte) → ticks, anderer Strahl → pick, richtiger → richtig',v(z1p,{sel:0}).errorCode==='ticks'&&v(z1p,{sel:2}).errorCode==='pick'&&v(z1p,{sel:1}).correct&&v(z1p,{}).invalid);
    const z1e={type:'Z01',level:2,kind:'even',u:1,m:5,equal:false,k:2,shift:0.35,avoid:[]};
    t('Z01: ungleiche Abschnitte: „Ja“ falsch (uneven), „Nein“ richtig',v(z1e,{ans:'ja'}).errorCode==='uneven'&&v(z1e,{ans:'nein'}).correct);
    const z2={type:'Z02',level:2,u:2,m:4,idx:[3,5],avoid:[]};
    t('Z02: richtig 3/4 und 5/4; 6/8 = Wert stimmt (form, weich); Nenner 5 → ticks; Nenner 8 bei 0–2 → whole',v(z2,{'r0.n':'3','r0.d':'4','r1.n':'5','r1.d':'4'}).correct&&v(z2,{'r0.n':'6','r0.d':'8','r1.n':'5','r1.d':'4'}).soft===true&&v(z2,{'r0.n':'3','r0.d':'5','r1.n':'5','r1.d':'4'}).errorCode==='ticks'&&v(z2,{'r0.n':'3','r0.d':'8','r1.n':'5','r1.d':'4'}).errorCode==='whole');
    const z3={type:'Z03',level:1,u:1,m:5,idx:[3],avoid:[]};
    t('Z03: Punkt 3 richtig, 4 oder 2 → ticks, 1 → pos, kein Punkt ungültig',v(z3,{nl:{pts:[3]}}).correct&&v(z3,{nl:{pts:[4]}}).errorCode==='ticks'&&v(z3,{nl:{pts:[2]}}).errorCode==='ticks'&&v(z3,{nl:{pts:[1]}}).errorCode==='pos'&&v(z3,{nl:{pts:[null]}}).invalid&&v(z3,{}).invalid);
    const z4={type:'Z04',level:1,u:1,d:5,fr:[3],avoid:[]};
    t('Z04: 5 Teile richtig, 10 Teile auch (Vielfaches), 4 Teile → ticks, 7 Teile → einteilung, 1 Teil ungültig, falscher Strich → pos',v(z4,{nl:{parts:5,pts:[3]}}).correct&&v(z4,{nl:{parts:10,pts:[6]}}).correct&&v(z4,{nl:{parts:4,pts:[3]}}).errorCode==='ticks'&&v(z4,{nl:{parts:7,pts:[3]}}).errorCode==='einteilung'&&v(z4,{nl:{parts:1,pts:[1]}}).invalid&&v(z4,{nl:{parts:5,pts:[1]}}).errorCode==='pos'&&v(z4,{nl:{parts:10,pts:[3]}}).errorCode==='pos');
    const z5={type:'Z05',level:2,kind:'expand',a:3,b:5,m:10,k:2,avoid:[]},z5n={type:'Z05',level:2,kind:'nofit',a:1,b:3,m:10,avoid:[]},z5r={type:'Z05',level:2,kind:'reduce',a:6,b:8,m:4,k:2,avoid:[]};
    t('Z05: Entscheidung (fit) zuerst; 3/5 = 6/10 und Punkt 6; Zähler unverändert → onlyDen; falsche Rechnung → calc; kürzen 6/8 = 3/4',v(z5,{x:'6',nl:{pts:[6]}}).invalid===true&&v(z5,{fit:'ja',x:'6',nl:{pts:[6]}}).correct&&v(z5,{fit:'nein',x:'6',nl:{pts:[6]}}).errorCode==='fit'&&v(z5,{fit:'ja',x:'3',nl:{pts:[6]}}).errorCode==='onlyDen'&&v(z5,{fit:'ja',x:'8',nl:{pts:[6]}}).errorCode==='calc'&&v(z5,{fit:'ja',x:'6',nl:{pts:[5]}}).errorCode==='ticks'&&v(z5r,{fit:'ja',x:'3',nl:{pts:[3]}}).correct);
    t('Z05: 1/3 passt nicht auf Zehntel: „Ja“ falsch, Einteilung 10 bleibt falsch (einteilung), 12 oder 6 mit Punkt richtig',v(z5n,{fit:'ja',nl:{parts:10,pts:[3]}}).errorCode==='fit'&&v(z5n,{fit:'nein',nl:{parts:10,pts:[3]}}).errorCode==='einteilung'&&v(z5n,{fit:'nein',nl:{parts:12,pts:[4]}}).correct&&v(z5n,{fit:'nein',nl:{parts:6,pts:[2]}}).correct);
    const z6={type:'Z06',level:1,u:1,fr:[[1,2],[3,4]],l:4,avoid:[]};
    t('Z06: 4 und 8 Teile richtig, 6 Teile → einteilung (4 geht nicht auf), 3 Teile → einteilung',v(z6,{nl:{parts:4,pts:[2,3]}}).correct&&v(z6,{nl:{parts:8,pts:[4,6]}}).correct&&v(z6,{nl:{parts:6,pts:[3,4]}}).errorCode==='einteilung'&&v(z6,{nl:{parts:1,pts:[0,0]}}).invalid);
    const z7={type:'Z07',level:1,q:2,p:1,ns:[1,2,4],avoid:[]};
    t('Z07: 1/2 auf Strahlen bis 1, 2, 4 an Strich 1; Mitte des ganzen Strahls (Strich 2 bei Länge 2) → whole',v(z7,{w0:{pts:[1]},w1:{pts:[1]},w2:{pts:[1]}}).correct&&v(z7,{w0:{pts:[1]},w1:{pts:[2]},w2:{pts:[1]}}).errorCode==='whole'&&v(z7,{w0:{pts:[1]},w1:{pts:[1]}}).invalid);
    const z7b={type:'Z07',level:2,q:3,from:1,ns:[2],ps:[4,7],avoid:[]};
    t('Z07 knifflig: Strahl von 1 bis 3, nur 1 und 2 beschriftet: 4/3 liegt am Strich 1, 7/3 am Strich 4 (Zähler − 1 · Nenner); ein Strich daneben → ticks',v(z7b,{w0:{pts:[1,4]}}).correct&&v(z7b,{w0:{pts:[2,4]}}).errorCode==='ticks'&&v(z7b,{w0:{pts:[4,7]}}).errorCode==='pos'&&v(z7b,{w0:{pts:[1]}}).invalid);
    {
      let bad=0,nz=0,improper=0;
      for(let i=0;i<300;i++){const k=generateTask('Z07',2);if(k.from>0)nz++;if(k.ps.every(p=>p>k.q))improper++;if(k.ps.some(p=>p<=k.from*k.q||p>=(k.from+k.ns[0])*k.q||p%k.q===0))bad++;}
      t('Z07 knifflig: Strahlen beginnen oft bei 1, 2 oder 3 (mehr als die Hälfte), alle Brüche liegen im Strahl und nicht auf ganzen Zahlen ('+nz+' von 300 mit Start über 0)',bad===0&&nz>150&&improper>150);
    }
    const z8={type:'Z08',level:1,kind:'mixed',u:2,d:4,n:7,avoid:[]},z8b={type:'Z08',level:1,kind:'between',u:2,d:4,n:7,avoid:[]};
    t('Z08: 7/4 = 1 3/4 richtig, falsche Ganze → whole, falscher Rest → rest; zwischen 1 und 2 richtig, 2 und 3 falsch',v(z8,{w:'1','r.n':'3','r.d':'4'}).correct&&v(z8,{w:'2','r.n':'3','r.d':'4'}).errorCode==='whole'&&v(z8,{w:'1','r.n':'3','r.d':'5'}).errorCode==='rest'&&v(z8b,{lo:'1',hi:'2'}).correct&&!v(z8b,{lo:'2',hi:'3'}).correct);
    /* Zeichnen: jede Aufgabe baut ihre Ansicht ohne Fehler auf (auch mit Lösung) */
    let drawn=0,drawBad=[];
    for(const id of ['Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'])for(const lvl of [1,2])for(let i=0;i<25;i++){
      try{
        const tk=generateTask(id,lvl),host=el('div'),st=newState(tk);
        const c=mountTask(host,st,{save(){},done(){}});
        tk&&TASKS[id].solution(tk).length;TASKS[id].hints(tk).length>=2||drawBad.push(id+' Tipps');
        for(let h=0;h<3;h++)c.hint();
        c.solution();drawn++;
      }catch(e){drawBad.push(id+'-L'+lvl+': '+e.message);}
    }
    t('Zahlenstrahl: '+drawn+' Ansichten (Aufgabe, Tipps, Musterlösung) bauen ohne Fehler auf',drawBad.length===0||(console.log(drawBad.slice(0,3)),false));
  }
  /* Abwechslung (Nenner in einer Runde, Zahlenmaterial), Zahlenraum Leicht bis 100 in kleinem Anteil, Bauteil zurücksetzen */
  {
    SEEN.clear();
    const dist=(id,key,min)=>{let ok=0,R=150;for(let r=0;r<R;r++){const round={},set=new Set();for(let i=0;i<5;i++)set.add(key(generateUnique(id,1,null,round)));if(set.size>=min)ok++;}return ok/R;};
    const keys={G02:t=>t.b,G03:t=>t.b,G04:t=>t.b,G05:t=>t.b,U01:t=>t.terms[0].d,U02:t=>simplify(t.from[0],t.from[1])[1],O02:t=>t.q,D03:t=>t.d,Z02:t=>t.m,Z03:t=>t.m,Z04:t=>t.d};
    const low=Object.keys(keys).filter(id=>dist(id,keys[id],4)<0.97);
    t('Abwechslung: in 97 % der Runden (Leicht) stehen mindestens 4 verschiedene Nenner in den 5 Aufgaben ('+Object.keys(keys).join(', ')+')',low.length===0||(console.log(low),false));
    const distinct=(id,lvl)=>{const s=new Set();for(let i=0;i<400;i++)s.add(sigOf(generateTask(id,lvl)));return s.size;};
    const few=[['G02',180],['G03',180],['G04',200],['G05',190],['Z02',45],['Z03',45],['D03',120]].filter(([id,n])=>distinct(id,1)<n);
    t('Zahlenmaterial: Leicht liefert deutlich mehr verschiedene Aufgaben (G02/G03/G04/G05 ≥ 180, Zahlenstrahl Z02/Z03 ≥ 45, D03 ≥ 120 in 400 Läufen)',few.length===0||(console.log(few),false));
    /* Unechte Brüche (z. B. 4/3) kommen überall vor, wo Brüche gerechnet oder eingetragen werden – in beiden Niveaus */
    const isImp=(k)=>{switch(k.type){
      case 'G01':return k.target.n>k.target.d;
      case 'G02':case 'G03':case 'G04':case 'G05':case 'U03':case 'Z05':return k.a>k.b;
      case 'U01':return k.terms.some(x=>x.n>x.d);
      case 'U02':return k.from[0]>k.from[1]||k.to[0]>k.to[1];
      case 'O01':case 'O02':return k.p>k.q;
      case 'D01':case 'D02':return k.n>k.den;
      case 'Z02':case 'Z03':return k.idx.some(i=>i>k.m);
      case 'Z04':return k.fr.some(n=>n>k.d);
      case 'Q00':return !!k.from&&(k.from[0]>k.from[1]||(!!k.to&&k.to[0]>k.to[1]));
    }return false;};
    const noImp=[];
    for(const id of ['G01','G02','G03','G04','G05','U01','U02','U03','O01','O02','D01','D02','Z02','Z03','Z04','Z05','Q00'])for(const lvl of [1,2]){let c=0;const n=1000;for(let i=0;i<n;i++)if(isImp(generateTask(id,lvl)))c++;if(c/n<0.05)noImp.push(id+'-L'+lvl+' '+Math.round(c/n*100)+'%');}
    t('Unechte Brüche überall: in G01–G05, U01–U03, O01, O02, D01, D02, Zahlenstrahl Z02–Z05 und dem Eingangstest kommen sie in beiden Niveaus in mindestens 5 % der Aufgaben vor',noImp.length===0||(console.log(noImp),false));
    const badBig=[];
    for(const id of ['G02','G03','G04','G05']){let gt=0,mx=0;const n=800;for(let i=0;i<n;i++){const m=Math.max(...numsOf(generateTask(id,1)));mx=Math.max(mx,m);if(m>60)gt++;}if(mx>100||gt/n<0.03||gt/n>0.25)badBig.push(id+' max '+mx+' Anteil '+(gt/n).toFixed(2));}
    for(const id of ['U01','U02','U03','O02'])for(let i=0;i<300;i++){const m=Math.max(...numsOf(generateTask(id,1)));if(m>60){badBig.push(id+' '+m);break;}}
    t('Zahlenraum Leicht: Erweitern/Kürzen (G02–G05) haben in 3–25 % der Aufgaben Zahlen über 60, nie über 100; die Umkehr- und Offenen Aufgaben bleiben bis 60',badBig.length===0||(console.log(badBig),false));
    const keepRI={rounds:S.rounds,intro:S.intro,passed:S.passed};
    S.rounds={'G02-L1':{results:['f'],cur:null,size:5},'G02-L2':{results:[],cur:{task:{}},size:5},'G03-L1':{results:[],cur:null,size:5}};S.intro={G02:true,G03:true};S.passed={'G02-L1':true};
    const vmod=moduleById('veraendern'),row=(id)=>pathState(vmod).find(r=>r.id===id);
    t('Zurücksetzen: Bauteil mit angefangener Runde oder gesehener Erklärung lässt sich zurücksetzen, ein unberührtes nicht; der Knopf erscheint nur dann',stationResettable('G02')&&stationResettable('G03')&&!stationResettable('G04')&&!!modNode(row('G02'),1,'pfad').querySelector('.modreset')&&!modNode(row('G04'),3,'pfad').querySelector('.modreset'));
    clearStation('G02');
    t('Zurücksetzen: G02 verliert beide Runden und die Erklärung, G03 bleibt, „Fertig“ bleibt erhalten, die Erklärung erscheint wieder',!S.rounds['G02-L1']&&!S.rounds['G02-L2']&&!S.intro.G02&&S.intro.G03===true&&!!S.rounds['G03-L1']&&stationDone('G02')&&!stationResettable('G02')&&introWanted({kind:'practice',id:'G02'})==='G02');
    Object.assign(S,keepRI);
  }
  /* Thema Zahlenstrahl im Lernpfad (zwei Themen): eigener Pfad ohne Eingangstest, Pfad und Urkunde der Brüche-Werkstatt bleiben unabhängig */
  {
    const zs=moduleById('zahlenstrahl'),vm=moduleById('veraendern');
    const snap={passed:S.passed,checked:S.checked,final:S.final,placed:S.placed,days:S.days,lab:S.lab,einstufung:S.einstufung,modus:S.modus,perfect:S.perfect,mq:S.mq};
    const fresh=()=>{S.passed={};S.checked={};S.final=false;S.placed=false;S.days={};S.lab=null;S.einstufung=null;S.modus={};S.perfect={};S.mq={};};
    fresh();
    t('Thema Zahlenstrahl: aktiv, mit Eingangstest ZQ, nicht im Rang, acht Pflicht-Bauteile Z01–Z08 und der Abschlusscheck ZQ, Pfad erst nach dem Eingangstest',zs.status==='aktiv'&&zs.quickcheck&&zs.qid==='ZQ'&&!zs.rank&&zs.path.length===9&&zs.path.slice(0,8).every((p,i)=>p.must&&p.id===('Z0'+(i+1)))&&zs.path[8].id==='ZQ'&&zs.path[8].final&&lernenZustand(zs)==='gate'&&PRACTICE_ORDER.includes('Z08')&&PRACTICE_ORDER.includes('ZQ')&&!rankPractice().includes('Z01')&&!rankPath().some(p=>p.id==='Z01')&&moduleOf('Z05').id==='zahlenstrahl'&&moduleOf('Eintragen').id==='zahlenstrahl'&&moduleOf('ZQ').id==='zahlenstrahl');
    const rows=()=>pathState(zs);
    t('Pfad Zahlenstrahl: Start bei Z01, Z02 gesperrt (wartet auf Z01), alles andere gesperrt',rows().find(r=>r.next).id==='Z01'&&rows().find(r=>r.id==='Z02').locked&&rows().find(r=>r.id==='Z02').blocker==='Z01'&&rows().find(r=>r.id==='Z08').locked);
    onRoundEnd('Z01',1,{results:['f','f','f','f','x'],size:5});
    t('Pfad Zahlenstrahl: Z01 mit 4 von 5 bestanden ⇒ gespeichert, Z02 nächstes',S.passed['Z01-L1']===true&&rows().find(r=>r.next).id==='Z02'&&stationDone('Z01'));
    t('Eingangstest von „Brüche verändern“ bleibt Pflicht, auch wenn Zahlenstrahl-Bauteile bestanden sind; erst Bauteile dieses Themas zählen als Einstieg',lernenZustand(vm)==='gate'&&(S.passed['G01-L1']=true,lernenZustand(vm)==='wahl'));
    fresh();
    ['Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'].forEach(x=>{S.passed[x+'-L1']=true;});
    t('Pfad Zahlenstrahl: alle acht bestanden ⇒ nächstes ist der Abschlusscheck ZQ, noch keine Urkunde (S.final unberührt)',rows().find(r=>r.next).id==='ZQ'&&rows().filter(r=>r.id!=='ZQ').every(r=>r.done)&&!stationDone('ZQ')&&!S.final);
    t('Pfad Brüche verändern: bestandene Zahlenstrahl-Bauteile ändern dort nichts (Start weiter bei G01, nichts fertig)',pathState(vm).find(r=>r.next).id==='G01'&&!pathState(vm).some(r=>r.done));
    /* Eingangstest zum Zahlenstrahl (ZQ): Auswertung, Freischalten (3 von 3 = sitzt), Urkunde – getrennt vom Test der Brüche-Werkstatt */
    const zr=(res,plan)=>({results:res.slice(),size:res.length,sk:plan}),zplan=[].concat(ZQ_SKILLS,ZQ_SKILLS,ZQ_SKILLS);
    fresh();
    t('Eingangstest Zahlenstrahl: 15 Fragen, 5 Fähigkeiten; der Test gehört zum Thema (qmodOf), Q00 bleibt bei Brüche verändern; Zustand getrennt',TASKS.ZQ.size===15&&QCHK.ZQ.skills.length===5&&Object.values(QCHK.ZQ.stations).flat().join()==='Z01,Z02,Z03,Z04,Z05,Z06,Z07,Z08'&&qmodOf('ZQ').id==='zahlenstrahl'&&qmodOf('Q00').id==='veraendern'&&qstate(vm)===S&&qstate(zs)!==S&&lernenZustand(zs)==='gate'&&lernenZustand(vm)==='gate');
    let zi=onRoundEnd('ZQ',1,zr(zplan.map(()=>'f'),zplan));
    t('Eingangstest Zahlenstrahl: 15 von 15 ⇒ alle acht Bauteile als beherrscht gemerkt, nichts fertig, noch keine Urkunde; Brüche verändern unberührt; danach die Wahl',['Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'].every(x=>S.checked[x]&&!stationDone(x))&&!zi.final&&zi.qmod==='zahlenstrahl'&&qstate(zs).placed&&!qstate(zs).final&&!!qstate(zs).einstufung&&!S.placed&&!S.final&&!S.einstufung&&lernenZustand(zs)==='wahl'&&lernenZustand(vm)==='gate'&&checkMark('Z03')==='sitzt');
    fresh();
    const ip=zplan.indexOf('ablesen');
    onRoundEnd('ZQ',1,zr(zplan.map((s,i)=>i===ip?'x':'f'),zplan));
    const F=pathState(zs,'frei'),P=pathState(zs,'pfad'),fr=(id)=>F.find(r=>r.id===id),pf=(id)=>P.find(r=>r.id===id);
    t('Eingangstest Zahlenstrahl: Fähigkeit „Ablesen und Eintragen“ 2 von 3 ⇒ Z02 und Z03 nicht offen (Check „fast“), alle anderen Bauteile sitzen',!S.checked.Z02&&!S.checked.Z03&&['Z01','Z04','Z05','Z06','Z07','Z08'].every(x=>S.checked[x])&&checkMark('Z02')==='fast'&&checkMark('Z03')==='fast'&&checkMark('Z04')==='sitzt');
    t('Selbst aussuchen: Bauteile mit 3 von 3 sind offen und überspringen die Lücke (Z04 offen trotz Z02), Z02 bleibt gesperrt, der Abschlusscheck erst nach allen',fr('Z01').open&&fr('Z02').locked&&fr('Z03').locked&&fr('Z04').open&&fr('Z08').open&&fr('ZQ').locked);
    t('Dem Pfad folgen: der Check überspringt nichts – alles wartet auf Z01, Z04 bleibt gesperrt, Z01 ist als Nächstes dran',pf('Z01').next&&pf('Z04').locked&&pf('Z04').blocker==='Z01');
    fresh();
    onRoundEnd('ZQ',1,zr(zplan.map((s,i)=>i<4?'f':'x'),zplan));
    t('Eingangstest Zahlenstrahl: höchstens 4 von 15 richtig ⇒ nichts als beherrscht gemerkt, direkt in den Pfad ohne Wahl',Object.keys(S.checked).length===0&&S.modus.zahlenstrahl==='pfad'&&lernenZustand(zs)==='pfad'&&qstate(zs).einstufung.stufe==='start');
    fresh();
    ['Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'].forEach(x=>{S.passed[x+'-L1']=true;});
    zi=onRoundEnd('ZQ',1,zr(zplan.map((s,i)=>i<11?'f':'x'),zplan));
    t('Abschlusscheck Zahlenstrahl: alles bestanden, aber nur 11 von 15 ⇒ keine Urkunde (ready, nicht passed)',zi.ready&&!zi.passed&&!zi.final&&!stationDone('ZQ'));
    zi=onRoundEnd('ZQ',1,zr(zplan.map((s,i)=>i<12?'f':'x'),zplan));
    t('Abschlusscheck Zahlenstrahl: alles bestanden und 12 von 15 ⇒ Urkunde nur für dieses Thema (S.final der Brüche-Werkstatt bleibt)',zi.final&&stationDone('ZQ')&&qstate(zs).final&&!S.final&&!stationDone('Q00')&&zi.qmod==='zahlenstrahl'&&rows().every(r=>r.done));
    /* Fragen: je Art genau eine richtige Antwort, Bild und Antwort stimmen mathematisch, Prüfung und Ansicht arbeiten */
    const zqProblems=(k)=>{
      if(!ZQ_KINDS[k.skill]||!ZQ_KINDS[k.skill].includes(k.kind))return 'skill/kind';
      if(k.opts){if(k.opts.length!==4||k.opts.filter(o=>o.id===k.answer).length!==1)return 'Antwort';if(new Set(k.opts.map(o=>o.txt)).size!==4)return 'Dubletten';}
      else if(k.answer!=='ja'&&k.answer!=='nein')return 'ja/nein';
      const o=k.opts&&k.opts.find(x=>x.id===k.answer),yes=k.answer==='ja',mk=k.fig&&k.fig.marks&&k.fig.marks.find(x=>x.text===k.answer);
      const ok={
        count:()=>+o.txt===k.m&&k.opts.every(x=>x.id===k.answer||+x.txt!==k.m),
        isN:()=>yes===(k.n===k.p),
        even:()=>yes===!k.fig.uneven,
        read:()=>!!o.f&&o.f[0]===k.idx&&o.f[1]===k.m&&k.opts.every(x=>x.id===k.answer||!equivalent(x.f[0],x.f[1],k.idx,k.m)),
        place:()=>!!mk&&mk.i===k.n&&k.fig.marks.length===4&&new Set(k.fig.marks.map(x=>x.i)).size===4&&k.fig.marks.every(x=>x.i%k.m!==0),
        parts:()=>+o.txt===k.d&&k.opts.every(x=>x.id===k.answer||+x.txt%k.d!==0),
        fits:()=>yes===fitsDivision(k.d,k.m)&&gcd(k.n,k.d)===1,
        expand:()=>+o.txt===k.a*k.m/k.b&&Number.isInteger(k.a*k.m/k.b),
        common:()=>+o.txt===k.l&&k.ds.every(d=>(+o.txt)%d===0)&&k.opts.every(x=>x.id===k.answer||+x.txt%k.l!==0),
        fitsAll:()=>yes===k.ds.every(d=>k.m%d===0),
        unit:()=>!!mk&&mk.i===k.p&&new Set(k.fig.marks.map(x=>x.i)).size===4,
        between:()=>o.txt===k.w+' und '+(k.w+1)&&Math.floor(k.n/k.d)===k.w,
        mixed:()=>!!o.mx&&o.mx[0]===k.w&&o.mx[1]===k.rest&&o.mx[2]===k.d&&k.n===k.w*k.d+k.rest,
        nat:()=>yes===(k.n%k.d===0)
      }[k.kind];
      return ok&&ok()?null:'Inhalt '+k.kind;
    };
    const zqBad=[];let zqN=0,zqDraw=0;
    for(const lvl of [1,2])for(const sk of ZQ_SKILLS)for(let i=0;i<150;i++){
      const k=zqGen(lvl,RNG,{skill:sk});zqN++;
      const p=zqProblems(k);if(p){zqBad.push(p+' '+JSON.stringify(k).slice(0,140));continue;}
      const wrongAns=k.opts?k.opts.find(x=>x.id!==k.answer).id:(k.answer==='ja'?'nein':'ja');
      if(!validateTask(k,{ans:k.answer}).correct||validateTask(k,{ans:wrongAns}).correct||!validateTask(k,{}).invalid||TASKS.ZQ.hints(k).length<2||TASKS.ZQ.hints(k)[1].length<1)zqBad.push('Prüfung '+k.kind);
      if(i<20)try{const host=el('div'),c=mountTask(host,newState(k),{save(){},done(){}});c.solution();zqDraw++;}catch(e){zqBad.push('Ansicht '+k.kind+': '+e.message);}
    }
    t('Eingangstest Zahlenstrahl: '+zqN+' Fragen (alle 14 Arten, beide Niveaus) haben genau eine richtige Antwort und stimmen mathematisch; '+zqDraw+' Ansichten mit Musterlösung',zqBad.length===0||(console.log(zqBad.slice(0,4)),false));
    const zqKinds=new Set();for(let i=0;i<400;i++)zqKinds.add(zqGen(1+i%2,RNG,{skill:ZQ_SKILLS[i%5]}).kind);
    t('Eingangstest Zahlenstrahl: Fragenplan 5 Fähigkeiten × 3, jede Art kommt vor',qPlan(RNG,ZQ_SKILLS,3).length===15&&ZQ_SKILLS.every(s=>qPlan(RNG,ZQ_SKILLS,3).filter(x=>x===s).length===3)&&zqKinds.size===14);
    /* Erklärungen der Zahlenstrahl-Bauteile: Strahlen und Ausprobieren gültig */
    const zsSteps=[].concat(...['Z01','Z02','Z03','Z04','Z05','Z06','Z07','Z08'].map(id=>INTRO[id].steps));
    t('Erklärungen Zahlenstrahl: jeder Strahl und jedes Ausprobieren ist gültig (Teile, Marken im Strahl, Strichzahl, passende und unpassende Einteilung)',zsSteps.every(s=>{
      const lines=s.nline?[].concat(s.nline):[];
      const ok=lines.every(l=>l.to>(l.from||0)&&Number.isInteger(l.parts)&&l.parts>=1&&(l.to-(l.from||0))*l.parts<=12&&(l.marks||[]).every(m=>m.i!=null?m.i>=0&&m.i<=(l.to-(l.from||0))*l.parts:m.n/m.d<=l.to)&&(!l.strip||(l.strip.d>=1&&l.strip.n<=l.strip.d)));
      const y=s.nltry,tryOK=!y||(y.ks.length>=2&&y.ks.length<=4&&y.ks.every(k=>k>=1&&y.to*k<=12)&&(!y.mark||(y.ks.some(k=>fitsDivision(y.mark.d,k))&&y.ks.some(k=>!fitsDivision(y.mark.d,k)))));
      return ok&&tryOK;
    })&&zsSteps.filter(s=>s.nltry).length===3);
    Object.assign(S,snap);
  }
  /* Themen-Registry */
  t('Registry: jede Aufgabe, Gruppe und jedes Bauteil eines aktiven Themas gibt es',activeModules().every(m=>(m.practice||[]).every(id=>TASKS[id])&&Object.values(m.groups||{}).every(g=>g.ids.every(id=>id==='LAB'||TASKS[id]))&&(m.path||[]).every(p=>p.id==='LAB'||TASKS[p.id])));
  t('Registry: geplante Themen haben keine Aufgaben, keine Gruppen, keinen Lernpfad',plannedModules().length>0&&plannedModules().every(m=>!m.practice&&!m.groups&&!m.path));
  t('Registry: Themen-IDs und Aufgaben-IDs sind eindeutig',new Set(MODULES.map(m=>m.id)).size===MODULES.length&&new Set(PRACTICE_ORDER).size===PRACTICE_ORDER.length&&new Set(PATH.map(p=>p.id)).size===PATH.length);
  t('Registry: Rang zählt „Brüche verändern“ (16 Übungen, 13 Bauteile)',rankPractice().length===16&&rankPath().length===13&&moduleOf('G02').id==='veraendern'&&moduleOf('Entdecken').id==='veraendern');
  /* Navigation: Lernen (Themen) → Lernpfad des Themas → Bauteil, und zurück */
  {
    const keepV=S.view;
    const bt=(v)=>{S.view=v;return backTarget();};
    t('Navigation: pfadView findet das Thema zu Bauteil, Labor und unbekannter ID',pfadView('G02').thema==='veraendern'&&pfadView('LAB').thema==='veraendern'&&pfadView().thema==='veraendern');
    t('Navigation: Zurück aus dem Lernpfad führt zur Themenübersicht, aus der Übersicht nirgends hin',JSON.stringify(bt({kind:'home',tab:'pfad',thema:'veraendern'}))==='{"kind":"home","tab":"pfad"}'&&bt({kind:'home',tab:'pfad'})===null);
    t('Navigation: Zurück aus einem Bauteil des Lernpfads führt in den Lernpfad dieses Themas',bt({kind:'practice',id:'G02',from:'pfad'}).thema==='veraendern'&&bt({kind:'lab',from:'pfad'}).thema==='veraendern');
    t('Navigation: Zurück aus Üben führt in die Gruppe, aus der Gruppe in die Übersicht',bt({kind:'practice',id:'G02'}).group==='Erweitern'&&bt({kind:'home',tab:'ueben',group:'Erweitern'}).tab==='ueben'&&!bt({kind:'home',tab:'ueben',group:'Erweitern'}).group);
    S.view=keepV;
  }

  /* Paket 5: Eingangstest überspringen, Gruppen, Meine Übersicht, Einstellungen im Reiter „Ich“ */
  {
    const vm5=moduleById('veraendern'),zs5=moduleById('zahlenstrahl');
    const keep5={modus:S.modus,unlocked:S.unlocked,view:S.view,passed:S.passed,checked:S.checked,placed:S.placed,final:S.final,lab:S.lab,mq:S.mq,last:S.last,rounds:S.rounds,intro:S.intro,einstufung:S.einstufung,days:S.days,perfect:S.perfect};
    try{
      S.passed={};S.checked={};S.placed=false;S.final=false;S.lab=null;S.mq={};S.modus={};S.unlocked={};S.rounds={};S.einstufung=null;S.days={};S.perfect={};S.intro={G01:true,Z01:true};
      t('Einstieg: ohne Fortschritt steht der Eingangstest vor dem Pfad (beide Themen)',lernenZustand(vm5)==='gate'&&lernenZustand(zs5)==='gate');
      const gate=gateCard(vm5),btns=[...gate.querySelectorAll('button')].map(b=>b.textContent.trim());
      t('Einstieg: Karte fragt „Willst du testen, was du schon kannst? Das dauert etwa 5 Minuten.“ und bietet „Eingangstest starten“ und „Ohne Test starten“ gleich groß nebeneinander',gate.textContent.includes('Willst du testen, was du schon kannst? Das dauert etwa 5 Minuten.')&&btns.includes('Eingangstest starten')&&btns.includes('Ohne Test starten')&&!!gate.querySelector('.gatebtns'));
      const mc=moduleCard(vm5);
      t('Einstieg: auch die Themenkarte im Reiter Lernen hat beide Knöpfe',[...mc.querySelectorAll('button')].some(b=>b.textContent.includes('Ohne Test starten'))&&[...mc.querySelectorAll('button')].some(b=>b.textContent.includes('Eingangstest starten')));
      startOhneTest(vm5);
      t('Ohne Test starten: Pfad ist gewählt, der Pfad ist sichtbar (kein Eingangstest davor) und die erste Station G01 öffnet sich',S.modus.veraendern==='pfad'&&lernenZustand(vm5)==='pfad'&&S.view.kind==='practice'&&S.view.id==='G01'&&!qstate(vm5).placed);
      startOhneTest(zs5);
      t('Ohne Test starten gilt auch für den Zahlenstrahl (Z01)',S.modus.zahlenstrahl==='pfad'&&lernenZustand(zs5)==='pfad'&&S.view.id==='Z01'&&lernenZustand(vm5)==='pfad');
      S.view={kind:'home',tab:'pfad',thema:'veraendern'};renderAll();
      t('Pfad ohne Test: der Eingangstest bleibt nachholbar („Eingangstest machen“)',/Eingangstest machen/.test(app.textContent)&&!/Eingangstest wiederholen/.test(app.textContent));
      /* Gruppen in Üben = Gruppen im Lernpfad */
      const bad=[];
      activeModules().forEach(m=>{
        m.path.forEach(p=>{if(!(GROUPS[p.grp]&&GROUPS[p.grp].ids.includes(p.id)))bad.push(m.id+' '+p.id+' ↛ '+p.grp);});
        Object.keys(m.groups).forEach(g=>{if(m.groups[g].ids.some(id=>id!=='LAB'&&!m.practice.includes(id)))bad.push('Gruppe '+g+' hat fremde Aufgabe');});
        const inGroups=[].concat(...Object.values(m.groups).map(g=>g.ids)).filter(id=>id!=='LAB');
        if(new Set(inGroups).size!==inGroups.length||m.practice.some(id=>!inGroups.includes(id)))bad.push(m.id+' Aufgaben nicht in genau einer Gruppe');
      });
      t('Gruppen: jede Station des Pfads steht im Üben in derselben Gruppe, jede Aufgabe in genau einer Gruppe, Gruppennamen sind eindeutig',(bad.length===0&&Object.keys(GROUPS).length===activeModules().reduce((n,m)=>n+Object.keys(m.groups).length,0))||(console.log(bad),false));
      t('Gruppen Erweitern und Kürzen: Entdecken, Erweitern, Kürzen, Mischen, Knobeln, Umwandeln, Abschluss; Teilbarkeit (T01) bei Kürzen, Eingangstest (Q00) bei Abschluss',Object.keys(vm5.groups).join()==='Entdecken,Erweitern,Kürzen,Mischen,Knobeln,Umwandeln,Abschluss'&&vm5.groups['Kürzen'].ids.join()==='T01,G03,G04'&&vm5.groups.Abschluss.ids.join()==='Q00'&&!vm5.groups.Entdecken.ids.includes('T01')&&!vm5.groups.Entdecken.ids.includes('Q00'));
      t('Gruppen Zahlenstrahl: Einteilung, Eintragen, Zwei Wege, Weiter, Abschlusscheck wie im Lernpfad',Object.keys(zs5.groups).join()==='Einteilung,Eintragen,Zwei Wege,Weiter,Abschlusscheck'&&zs5.groups['Zwei Wege'].ids.join()==='Z04,Z05,Z06'&&zs5.groups.Abschlusscheck.ids.join()==='ZQ');
      /* Meine Übersicht, Alles freischalten */
      S.modus={veraendern:'frei'};S.checked={G01:true};S.unlocked={};
      const row5=(id)=>pathState(vm5,'frei').find(r=>r.id===id);
      t('Meine Übersicht: ohne Freischaltung bleibt gesperrt, was gesperrt ist (G03, Abschluss)',row5('G03').locked&&row5('Q00').locked&&row5('G01').open);
      S.view={kind:'home',tab:'pfad',thema:'veraendern'};renderAll();
      const body=app.textContent;
      t('Meine Übersicht: heißt so (nicht mehr „Selbst aussuchen“), erklärt „Grün = schon gekonnt, grau = noch gesperrt“ und bietet „Alles freischalten“',/Meine Übersicht/.test(body)&&!/Selbst aussuchen/.test(body)&&/Grün = schon gekonnt, grau = noch gesperrt/.test(body)&&[...app.querySelectorAll('button')].some(b=>b.textContent.includes('Alles freischalten')));
      [...app.querySelectorAll('button')].find(b=>b.textContent.includes('Alles freischalten')).click();
      const dlg=document.querySelector('.modal');
      t('Alles freischalten: fragt vorher nach und erklärt, dass die Urkunde trotzdem alle Pflicht-Stationen braucht',!!dlg&&dlg.textContent.includes('Alles freischalten?')&&dlg.textContent.includes('Urkunde')&&!S.unlocked.veraendern);
      [...dlg.querySelectorAll('button')].find(b=>b.textContent==='Alles freischalten').click();
      t('Alles freischalten: danach ist alles offen, nur dieses Thema, die Anzeige sagt es',S.unlocked.veraendern===true&&!S.unlocked.zahlenstrahl&&pathState(vm5,'frei').every(r=>r.open)&&pathState(vm5,'pfad').every(r=>r.open)&&/Alles ist freigeschaltet/.test(app.textContent));
      const info5=onRoundEnd('Q00',1,{results:Array(15).fill('f'),size:15,sk:[].concat(Q_SKILLS,Q_SKILLS,Q_SKILLS)});
      t('Alles freischalten: der Abschlusscheck ist offen, die Urkunde gibt es trotzdem nur nach allen Pflicht-Stationen',pathState(vm5,'frei').find(r=>r.id==='Q00').open&&info5.passed&&!info5.ready&&!info5.final&&!S.final);
      /* Einstellungen im Reiter Ich */
      const chip=chipNode();
      t('Rang-Chip: führt zur Seite „Ich“ (kein Dialog mehr)',!chip.hasAttribute('aria-haspopup')&&/Zur Seite Ich/.test(chip.getAttribute('aria-label')));
      chip.click();
      t('Rang-Chip: ein Tipp öffnet den Reiter „Ich“',S.view.kind==='home'&&S.view.tab==='rang'&&!document.querySelector('.optmodal'));
      const ich=[...app.querySelectorAll('button')].map(b=>b.textContent.trim());
      t('Ich: oben „Einstellungen“, dazu Bruchlabor, Lernpfad und Hilfe bei Problemen im Reiter',ich.findIndex(x=>x.includes('Einstellungen'))>=0&&ich.findIndex(x=>x.includes('Einstellungen'))<ich.findIndex(x=>x.includes('Bruchlabor'))&&ich.some(x=>x.includes('Bruchlabor'))&&ich.some(x=>x.includes('Lernpfad'))&&ich.some(x=>x.includes('Hilfe bei Problemen')));
      openOptions();
      const om=document.querySelector('.optmodal');
      t('Einstellungen: Textgröße, Hilfe bei Problemen und Fortschritt löschen; Bruchlabor und Lernpfad stehen nicht mehr im Dialog',!!om&&om.textContent.includes('Einstellungen')&&om.textContent.includes('Textgröße')&&om.textContent.includes('Hilfe bei Problemen')&&om.textContent.includes('Fortschritt löschen')&&!om.textContent.includes('Bruchlabor')&&!om.textContent.includes('Lernpfad'));
      closeOptions();
    }finally{
      closeOptions();document.querySelectorAll('.modal').forEach(m=>m.remove());
      Object.assign(S,keep5);persist();renderAll();
    }
  }
  /* Paket 4: Sprache für Kinder, Rechenprobe im Lob, Merkkästen, Schriftgröße */
  {
    const jargon=/Bauteil|Bauplan|Baupläne|Blatt \d|Blitz|Maßgenau|Millimeter|Legende: alles perfekt|\bPos\b/;
    t('Lob: keine Floskeln mit Technikwörtern (Maßgenau, Millimeter, Bauteil in Ordnung)',PRAISE.length>=5&&PRAISE.every(p=>!jargon.test(p)));
    const bom=bomList(['G02']);
    t('Stückliste: Spalte „Nr.“ statt „Pos“',bom.textContent.includes('Nr.')&&!/\bPos\b/.test(bom.textContent));
    t('Symbole: kein Blitz mehr (Eingangstest, Abschluss, Testkarte), der Haken ersetzt ihn',ICON.Q00==='haken'&&ICON.ZQ==='haken'&&!document.getElementById('i-blitz')&&!Object.values(ICON).includes('blitz'));
    const keepV=S.view,keepR=S.rounds,keepI=S.intro,seen=[];
    try{
      S.rounds={};S.intro={G02:true,Q00:true,ZQ:true,G04:true};
      [{kind:'home',tab:'pfad'},{kind:'home',tab:'pfad',thema:'veraendern'},{kind:'home',tab:'ueben'},{kind:'home',tab:'spiele'},{kind:'home',tab:'rang'},{kind:'practice',id:'G02'},{kind:'practice',id:'Q00'},{kind:'game',id:'S02'}].forEach(v=>{
        S.view=v;renderAll();
        if(jargon.test(app.textContent))seen.push((v.tab||v.id)+': '+(app.textContent.match(jargon)||[''])[0]);
      });
      S.view={kind:'practice',id:'G02'};S.rounds={};renderAll();
      const tb=document.querySelector('.titleblock');
      t('Aufgabenblatt: „Aufgabe 1 von 5“ statt „Blatt 1/5“',!!tb&&/Aufgabe 1 von 5/.test(tb.textContent)&&!/Blatt/.test(tb.textContent));
      S.view={kind:'home',tab:'rang'};renderAll();
      t('Ich-Reiter: „Alle Ziele“ statt „Legende: alles perfekt“',/Alle Ziele/.test(app.textContent)&&!/Legende: alles perfekt/.test(app.textContent));
    }finally{S.view=keepV;S.rounds=keepR;S.intro=keepI;persist();renderAll();}
    t('Sprache: in Lernen, Üben, Spiele, Ich, Aufgabe, Eingangstest und Tresor kommen Bauteil, Bauplan, Blatt, Pos und Blitz nicht mehr vor',seen.length===0||(console.log(seen),false));
    /* Rechenprobe statt Floskel */
    const keepX={xp:S.xp,streak:S.streak,bestStreak:S.bestStreak,skills:S.skills};
    const fb=(task,draft)=>{const st=newState(task);st.draft=draft;const host=el('div');const m=mountTask(host,st,{save(){},done(){}});m.check();return host.textContent;};
    const f1=fb({type:'G02',level:1,mode:'factor',a:2,b:5,k:3},{'r.n':'6','r.d':'15'});
    const f2=fb({type:'G03',level:1,mode:'factor',a:12,b:18,k:3},{'r.n':'4','r.d':'6'});
    const f3=fb({type:'G03',level:2,mode:'full',a:84,b:126,p:2,q:3},{'r.n':'2','r.d':'3'});
    const f4=fb({type:'D03',level:1,w:2,n:1,d:3},{'r.n':'7','r.d':'3'});
    Object.assign(S,keepX);persist();
    t('Lob mit Rechnung: „Richtig: 2 · 3 = 6 und 5 · 3 = 15.“ (Erweitern), 12 : 3 = 4 und 18 : 3 = 6 (Kürzen mit Zahl), 84 : 42 = 2 und 126 : 42 = 3 (so weit wie möglich), 2 · 3 + 1 = 7 (gemischte Zahl)',
      f1.includes('Richtig: 2 · 3 = 6 und 5 · 3 = 15.')&&f2.includes('Richtig: 12 : 3 = 4 und 18 : 3 = 6.')&&f3.includes('84 : 42 = 2 und 126 : 42 = 3')&&f4.includes('2 · 3 + 1 = 7'));
    t('Lob mit Rechnung: Aufgaben ohne kurze Rechnung (Bruchfamilie, Schnelltest) behalten Lob und Begründung',proofText({type:'O01',p:2,q:3})===null&&proofText({type:'Q00'})===null&&proofText({type:'G05',mode:'denom',a:6,b:9,N:3})==='9 : 3 = 3 und 6 : 3 = 2.'&&proofText({type:'U02',mode:'expand',from:[2,3],to:[6,9],k:3})==='2 · 3 = 6 und 3 · 3 = 9.');
    /* Merkkästen: Beispiel zuerst, kurze Sätze, Fachwörter erklärt */
    const ids=Object.keys(NOTES),words=(s)=>s.split(/\s+/).filter(Boolean).length;
    let longest=0,firstOK=0,bad=[];
    ids.forEach(id=>{
      let nodes;try{nodes=NOTES[id].build([]);}catch(e){bad.push(id);return;}
      const f=nodes[0];if(f.classList.contains('ex')||/^Beispiel/.test(f.textContent))firstOK++;
      nodes.filter(n=>n.tagName==='P'||n.classList.contains('rule')).forEach(n=>n.textContent.split(/[.!?]\s+/).forEach(s=>{longest=Math.max(longest,words(s));}));
    });
    t('Merkkästen: alle 10 (M1–M10) bauen sich, beginnen mit dem Beispiel, Sätze höchstens 14 Wörter (längster: '+longest+')',ids.length===10&&bad.length===0&&firstOK===10&&longest<=14);
    const txt=(id)=>NOTES[id].build([]).map(n=>n.textContent).join(' ');
    t('Merkkästen: Fachwörter kommen nach dem Beispiel mit Erklärung (Erweiterungszahl, Kürzungszahl, Quersumme, Dezimalbruch, gemischte Zahl, kgV)',txt('M2').includes('Erweiterungszahl. Sie ist mindestens 2')&&txt('M3').includes('Kürzungszahl. Sie ist mindestens 2')&&txt('M7').includes('Quersumme bekommst du, wenn du alle Ziffern addierst')&&txt('M4').includes('heißt Dezimalbruch')&&txt('M6').includes('Natürliche Zahlen sind 1, 2, 3')&&txt('M10').includes('kleinstes gemeinsames Vielfaches (kgV)'));
    /* Schrift: Menü und Rang-Chip mindestens 16 px */
    const px=(cls)=>{const x=el('span',{class:cls});document.body.append(x);const v=parseFloat(getComputedStyle(x).fontSize);x.remove();return v;};
    t('Schrift: Menü, Rangname, XP und Serie sind mindestens 16 px groß (navb '+px('navb')+', gname '+px('gname')+', gxp '+px('gxp')+')',['navb','gname','gxp','gstreak'].every(c=>px(c)>=16));
  }
  /* Paket 3: Tipps – drei Stufen je Aufgabe, bezogen auf die Zahlen, Sätze kurz, Regeln nur wenn sie passen */
  {
    const ids=Object.keys(TASKS).filter(id=>!TASKS[id].quick);
    const sents=(s)=>s.replace(/\*\*/g,'').replace(/\{\d+\|\d+\}/g,'x').split(/[.!?]\s+/);
    const words=(s)=>s.split(/\s+/).filter(Boolean).length;
    const bad=[];let n=0,longest=0;
    ids.forEach(id=>[1,2].forEach(lvl=>{
      for(let i=0;i<40;i++){
        const task=generateTask(id,lvl),tips=TASKS[id].hints(task);n++;
        const txt=tips.flat().join(' ');
        if(tips.length!==3||tips.some(x=>!Array.isArray(x)||!x.length||x.some(l=>typeof l!=='string'||!l.trim())))bad.push(id+' Aufbau');
        else if(/undefined|NaN|null|Infinity/.test(txt))bad.push(id+' Zahl fehlt: '+txt.slice(0,80));
        else if(/IMMER|Lies die Frage genau|Kontrolliere den Wert/.test(txt))bad.push(id+' leerer/alter Tipp');
        longest=Math.max(longest,...sents(txt).map(words));
      }
    }));
    t('Tipps: alle '+ids.length+' Aufgabentypen liefern drei Stufen mit Text, ohne fehlende Zahlen und ohne alten Pauschalsatz ('+n+' Aufgaben)',bad.length===0||(console.log(bad.slice(0,5)),false));
    t('Tipps: Sätze höchstens 14 Wörter (längster: '+longest+')',longest<=14);
    /* Regeln nur, wenn sie zu den beiden Zahlen passen */
    let ruleBad=0,chk=0;
    for(let i=0;i<200;i++){
      const task=generateTask(i%2?'G04':'G03',i%4<2?1:2);if(task.mode==='factor'||task.irreducible)continue;
      chk++;
      const r1=TASKS[task.type].hints(task)[0].join(' '),a=task.a,b=task.b;
      const e2=a%2===0&&b%2===0,e5=a%5===0&&b%5===0&&!(a%10===0&&b%10===0),e10=a%10===0&&b%10===0,e3=digitSum(a)%3===0&&digitSum(b)%3===0;
      if(r1.includes('durch 2 kürzen')!==e2||r1.includes('durch 5 kürzen')!==e5||r1.includes('durch 10 kürzen')!==e10||r1.includes('durch 3 kürzen')!==e3)ruleBad++;
    }
    t('Tipps Kürzen: Teilbarkeitsregel nur, wenn sie passt (beide gerade ⇒ 2, beide auf 0/5 ⇒ 5, beide auf 0 ⇒ 10, Quersummen ⇒ 3) – '+chk+' Aufgaben',chk>50&&ruleBad===0);
    const rules=divRules(36,48);
    t('Regeln: 36 und 48 sind gerade und haben Quersummen 9 und 12 ⇒ 2 und 3; 35 und 45 ⇒ 5; 7 und 11 ⇒ keine',rules.length===2&&rules[0].includes('durch 2')&&rules[1].includes('durch 3')&&divRules(35,45).join(' ').includes('durch 5 kürzen')&&divRules(7,11).length===0);
    const g4=generateTask('G04',1);g4.irreducible=true;g4.mode='full';
    t('Tipps G04: „Manchmal geht es nicht mehr“ steht im ersten Tipp (nicht mehr im Aufgabentext)',TASKS.G04.hints(generateTask('G04',2))[0].join(' ').includes('Geht nicht mehr')&&!(()=>{const h=el('div');TASKS.G04.prompt(generateTask('G04',1),h);return h.textContent.includes('Manchmal');})());
    t('Tipps Z05: der Hinweis „zuerst mit dem Nenner“ steht im ersten Tipp, nicht im Aufgabentext (Leicht)',(()=>{const z=generateTask('Z05',1),h=el('div');TASKS.Z05.prompt(z,h);return TASKS.Z05.hints(z)[0].join(' ').includes('zuerst mit dem Nenner')&&!h.textContent.includes('zuerst mit dem Nenner');})());
    t('Tipps U03: Tipp 1 vergleicht Zähler und Nenner der Aufgabe („Was wurde mit dem Zähler gemacht, was mit dem Nenner?“)',(()=>{const u={type:'U03',level:1,kind:'expand',errType:'onlyNum',fix:'op',a:2,b:3,k:3,shown:[6,3],pre:null};const h=TASKS.U03.hints(u);return h[0][0].includes('Vergleiche 2 und 6 oben, 3 und 3 unten')&&h[0][0].includes('Was wurde mit dem Zähler gemacht, was mit dem Nenner?')&&h[2].join(' ').includes('Nur der Zähler wurde verändert');})());
    t('Tipps: Brüche im Tipp-Kasten stehen mit Bruchstrich ({n|d}), **fett** wird hervorgehoben',(()=>{const b=hintBox('Tipp 1 von 3',['Aus {4|6} wird {2|3}. Tippe **Geht nicht mehr**.'],true,()=>{});return b.querySelectorAll('.frac').length===2&&b.querySelector('strong').textContent==='Geht nicht mehr'&&!b.textContent.includes('{');})());
    t('Tipps: G03 mit Zahl nennt zuerst den neuen Nenner, dann den Zähler; G02 mit Zielnenner nennt die Erweiterungszahl',TIPS.G03({mode:'factor',a:12,b:18,k:3})[1][0].includes('18 geteilt durch 3 ergibt 6')&&TIPS.G03({mode:'factor',a:12,b:18,k:3})[2][0].includes('12 geteilt durch 3')&&TIPS.G02({mode:'target',a:2,b:5,k:3})[1][0].includes('15 geteilt durch 5 ergibt 3'));
  }
  /* Paket 2: Rückmeldung und Bedienung der Aufgabe */
  {
    const rs=(r,size)=>roundScore(r,size||r.length);
    t('Bestehen: 5 Aufgaben brauchen 4 Punkte (ohne Tipp = 1, mit Tipp = ½) und mindestens 3 ohne Tipp',rs(['f','f','f','f','f']).passed&&rs(['f','f','f','f','x']).passed&&rs(['f','f','f','l','l']).passed&&!rs(['f','f','l','l','l']).passed&&!rs(['l','l','l','l','l']).passed&&!rs(['f','f','f','l','x']).passed);
    t('Bestehen: Punkte werden gemeldet (3 ohne Tipp + 2 mit Tipp = 4 Punkte, 2 + 3 = 3,5)',rs(['f','f','f','l','l']).points===4&&rs(['f','f','l','l','l']).points===3.5&&rs(['f','f','l','l','l']).right===5);
    t('Bestehen: Check-Fragen (nur ohne Tipp) wie bisher 12 von 15; T01 braucht 7 Punkte von 8 (6 ohne Tipp + 2 mit Tipp reichen, 5 + 3 nicht)',rs(qplan.map((_,i)=>i<12?'f':'x')).passed&&!rs(qplan.map((_,i)=>i<11?'f':'x')).passed&&rs(['f','f','f','f','f','f','f','x'],8).passed&&rs(['f','f','f','f','f','f','l','l'],8).passed&&!rs(['f','f','f','f','f','l','l','l'],8).passed);
    const kp2={passed:S.passed,days:S.days,perfect:S.perfect};S.passed={};S.days={};S.perfect={};
    const inf2=onRoundEnd('G03',1,rnd(['f','f','l','l','l']));
    t('Rundenende: 5 richtig, aber 3 mit Tipp ⇒ nicht bestanden (zählt halb), Treffer und Punkte stehen in der Auswertung',!inf2.passed&&inf2.right===5&&inf2.points===3.5&&!S.passed['G03-L1']);
    Object.assign(S,kp2);persist();
    /* Weiß ich nicht */
    const qq=generateTask('Q00',1);
    const uns=validateTask(qq,{ans:Q_UNSURE});
    t('Weiß ich nicht: weder richtig noch falsch, die richtige Antwort wird genannt',uns.unsure===true&&!uns.correct&&!uns.invalid&&uns.feedback.includes('Richtig wäre')&&validateTask(qq,{ans:qq.answer}).correct&&!validateTask(qq,{ans:Q_UNSURE}).soft);
    const ur=['u','f','f','f','f','f','f','f','f','f','f','f','f','f','f'];
    const ue=qEvaluate(ur,qplan,15,false);
    t('Weiß ich nicht: die Fähigkeit steht auf „üben“, die übrigen Treffer zählen; ein „u“ ist kein Treffer',ue.skills[qplan[0]].status==='ueben'&&ue.right===14&&ue.unsure===1&&ue.trust&&Q_SKILLS.filter(s=>s!==qplan[0]).every(s=>ue.skills[s].status==='sitzt'));
    const ue8=qEvaluate(qplan.map((_,i)=>i<8?'u':'f'),qplan,15,false);
    t('Weiß ich nicht: ab 8 von 15 geht es direkt in den Pfad („von vorn“, nichts „sitzt“); mit Fortschritt Plan; 7 mal nicht',ue8.stufe==='start'&&Q_SKILLS.every(s=>ue8.skills[s].status==='ueben')&&qEvaluate(qplan.map((_,i)=>i<8?'u':'f'),qplan,15,true).stufe==='plan'&&qEvaluate(qplan.map((_,i)=>i<7?'u':'f'),qplan,15,false).trust);
    /* Antippen markiert nur, gewertet wird mit Prüfen */
    {
      const host=el('div'),draftV={ans:null};let subs=0;
      const view={task:qq,draft:draftV,inputs:{},st:{},save(){},locked:()=>false,submit(){subs++;}};
      qOptions(view,host,Object.assign({},qq,{opts:[{id:'A',txt:'1'},{id:'B',txt:'2'},{id:'C',txt:'3'},{id:'D',txt:'4'}]}));
      host.querySelector('.tile').click();
      const un=host.querySelector('.btn.unsure');
      t('Antippen: markiert nur (keine sofortige Wertung), die fünfte Antwort „Weiß ich nicht“ steht unter den Kacheln',subs===0&&draftV.ans==='A'&&!!un&&un.textContent.includes('Weiß ich nicht')&&host.querySelectorAll('.tile').length===4);
      un.click();
      const unOk=draftV.ans===Q_UNSURE&&un.getAttribute('aria-pressed')==='true'&&host.querySelector('.tile').getAttribute('aria-pressed')==='false'&&subs===0;
      host.querySelectorAll('.tile')[1].click();
      t('Antippen: „Weiß ich nicht“ markiert die Antwort ? und löst die Kachel; danach wieder eine Kachel löst „Weiß ich nicht“',unOk&&draftV.ans==='B'&&un.getAttribute('aria-pressed')==='false'&&host.querySelectorAll('.tile')[1].getAttribute('aria-pressed')==='true');
      const h2=el('div'),v2={task:qq,draft:{ans:null},inputs:{},st:{},save(){},locked:()=>false,submit(){subs++;}};
      qOptions(v2,h2,{kind:'eqYN',answer:'ja',why:'x'});
      h2.querySelector('.yn').click();
      t('Antippen: Ja/Nein markieren nur, auch mit „Weiß ich nicht“',subs===0&&v2.draft.ans==='ja'&&!!h2.querySelector('.btn.unsure'));
    }
    /* T01: Antippen markiert nur, geprüft wird mit „Prüfen“ */
    {
      const host=el('div');let subs=0;
      const v={task:{type:'T01',n:124,k:2},draft:{},inputs:{},save(){},locked:()=>false,submit(){subs++;}};
      TASKS.T01.render(v,host);host.querySelector('.yn').click();
      t('T01: Ja/Nein markiert nur und wertet nicht sofort',subs===0&&v.draft.ans==='ja');
      const hz=el('div'),vz={task:{},draft:{},inputs:{},save(){},locked:()=>false,submit(){subs++;}};
      nlYesNo(vz,hz,'ans');hz.querySelector('.yn').click();
      t('Zahlenstrahl Ja/Nein: markiert nur und wertet nicht sofort',subs===0&&vz.draft.ans==='ja');
    }
    /* Tastatur, Knöpfe, O01, G04 */
    {
      const pad=makeKeypad(el('div'),()=>{});
      t('Tastatur: die Taste für das nächste Feld heißt „Weiter ▸“',[...pad.el.querySelectorAll('button')].some(b=>b.textContent==='Weiter ▸'&&b.getAttribute('aria-label')==='Nächstes Feld'));
      const hO=el('div'),vO={task:{type:'O01',level:1,p:2,q:3,need:4},draft:{},inputs:{},save(){},locked:()=>false};
      TASKS.O01.render(vO,hO);
      const add=hO.querySelectorAll('.btn.small')[0];
      t('O01: startet mit 2 Zeilen, „+ Bruch“ fügt eine dazu, Hinweis zu weiteren Zeilen',hO.querySelectorAll('.famrow').length===2&&add.textContent==='+ Bruch'&&(add.click(),hO.querySelectorAll('.famrow').length===3)&&hO.textContent.includes('„+ Bruch“'));
      const hG=el('div'),vG={task:{type:'G04',level:1,mode:'full',a:6,b:9,p:2,q:3},draft:{},inputs:{},save(){},locked:()=>false};
      TASKS.G04.render(vG,hG);
      const nb=hG.querySelector('.btn.none');
      t('G04: Knopf „Geht nicht mehr“ mit Stopp-Symbol und Unterzeile „Bruch ist schon fertig gekürzt“',!!nb&&nb.textContent.includes('Geht nicht mehr')&&nb.textContent.includes('Bruch ist schon fertig gekürzt')&&!!nb.querySelector('.ic')&&!/Nicht kürzbar/.test(nb.textContent));
    }
    /* Rückfrage vor Lösung und Überspringen */
    {
      let did=0;const m=confirmModal('Lösung ansehen?','Die Aufgabe zählt dann nicht als richtig.','Lösung ansehen',()=>{did++;});
      t('Rückfrage: Fenster mit Hinweis „zählt dann nicht als richtig“, Abbrechen tut nichts',!!m.parentNode&&m.textContent.includes('zählt dann nicht als richtig')&&(m.querySelector('.btn.alt').click(),!m.parentNode&&did===0));
      const m2=confirmModal('Aufgabe überspringen?','Die Aufgabe zählt dann nicht als richtig.','Überspringen',()=>{did++;});
      [...m2.querySelectorAll('button')].find(b=>b.textContent==='Überspringen').click();
      t('Rückfrage: Bestätigen führt die Aktion aus und schließt das Fenster',did===1&&!m2.parentNode);
      const m3=confirmModal('x','y','OK',()=>{did++;});window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));
      t('Rückfrage: Escape schließt ohne Aktion',!m3.parentNode&&did===1);
    }
    t('Erster Satz: Begründung im Check hat bei richtigen Antworten einen Satz',firstSentence('Kreuzprobe: 2 · 6 = 12 und 4 · 3 = 12. Beide Brüche sind gleich viel.')==='Kreuzprobe: 2 · 6 = 12 und 4 · 3 = 12.'&&firstSentence('')===''&&firstSentence('Nur ein Satz.')==='Nur ein Satz.');
  }
  /* Paket 1: Fehler und Begriffe */
  {
    const o2={type:'O02',level:1,a:12,b:18,p:2,q:3,mode:'target'};
    const same=validateTask(o2,{paths:[[2,3],[3,2]]});
    t('O02: dieselben Zahlen in anderer Reihenfolge sind derselbe Weg (eigene Meldung); ÷6 und ÷2›÷3 sowie ÷3›÷2 und ÷6 sind verschieden',!same.correct&&/anderer Reihenfolge/.test(same.feedback)&&validateTask(o2,{paths:[[6],[3,2]]}).correct&&!validateTask(o2,{paths:[[2,3],[2,3]]}).correct);
    t('O02-Tipp: nennt andere Kürzungszahlen, keine Rechenketten',HINT.ways.join(' ').includes('andere Kürzungszahlen')&&!HINT.ways.join(' ').includes('Rechenketten'));
    const z04=INTRO.Z04.steps.map(s=>s.say.join(' ')).join(' ');
    t('Z04-Erklärung: zählt Abschnitte von 0 aus, kein „sechster Strich“',z04.includes('Zähle 6 Abschnitte von 0 aus')&&!/sechste|Strich:/.test(z04));
    const t01=INTRO.T01.steps.map(s=>s.say.join(' ')).join(' ');
    t('T01-Erklärung: Quersumme heißt „Addiere dazu alle Ziffern“, nicht „zähle zusammen“',t01.includes('Addiere dazu alle Ziffern.')&&!/zusammen/.test(t01));
    t('Teilbarkeit durch 4: zweistellig gezeigt („00“, „04“), 00 ist durch 4 teilbar',divExplain(400,4)[0]==='Letzte zwei Ziffern: 00.'&&divExplain(400,4)[1]==='00 ist durch 4 teilbar.'&&divExplain(504,4)[0]==='Letzte zwei Ziffern: 04.'&&divExplain(504,4)[1].startsWith('04 : 4')&&divExplain(512,4)[0]==='Letzte zwei Ziffern: 12.');
    t('Labor: Meldung zum Zähler ist ein vollständiger Satz',LAB_WRONG.zaehler.includes('mit der Zahl multipliziert oder durch sie geteilt'));
    const noteText=Object.keys(NOTES).map(k=>NOTES[k].title+' '+NOTES[k].build([]).map(n=>n.textContent).join(' ')).join(' ');
    t('Begriffe: „gemischte Zahl“ und „Bruch“, nie „gemeiner Bruch“ oder „gemischte Schreibweise“ (Merkkästen, Aufgaben, Erklärungen)',!/gemeine[rn]? Bruch|[Gg]emischte Schreibweise/.test(noteText+JSON.stringify(INTRO)+Object.values(TASKS).map(x=>x.name+' '+x.desc).join(' '))&&TASKS.D03.name==='Gemischte Zahl → Bruch'&&NOTES.M6.title==='Gemischte Zahl als Bruch');
    t('Merkkästen: Erweiterungszahl und Kürzungszahl „mindestens 2“; M5 ohne „führende Nullen“, mit „Zähle alle Stellen“',noteText.includes('Erweiterungszahl. Sie ist mindestens 2')&&noteText.includes('Kürzungszahl. Sie ist mindestens 2')&&noteText.includes('Zähle alle Stellen hinter dem Komma')&&!/Führende Nullen|unbemerkt/.test(noteText));
    t('Merkkasten M9: Weg 1 (Einteilung anpassen) vor Weg 2 (Bruch anpassen), kein Weg A/B',noteText.indexOf('Weg 1: Einteilung anpassen')>=0&&noteText.indexOf('Weg 1: Einteilung anpassen')<noteText.indexOf('Weg 2: Bruch anpassen')&&!/Weg [AB]\b/.test(noteText));
    t('Kleinstes gemeinsames Vielfaches: nur als Randnotiz (Z06-Erklärung nennt zuerst „die kleinste Zahl, in die alle Nenner passen“)',INTRO.Z06.steps.some(s=>s.say[1]&&s.say[1].includes('kleinste Zahl, in die alle Nenner passen')&&s.say.some(x=>x.includes('Fachwort'))));
    t('Z08-Erklärung: gemischte Zahl mit Rechnung 7/4 = 1 + 3/4 = 1 ¾, Überschrift „Brüche, die natürliche Zahlen sind“',INTRO.Z08.steps.some(s=>(s.calc||[]).some(l=>l.some(x=>x&&x.m&&x.m.join()==='1,3,4')))&&INTRO.Z08.steps.some(s=>s.h==='Brüche, die natürliche Zahlen sind'&&s.say[0].includes('1, 2 oder 3')));
    t('Memory: Regel je Niveau, verschieden und nicht leer',MEMORY_RULE[1]&&MEMORY_RULE[2]&&MEMORY_RULE[1]!==MEMORY_RULE[2]);
    const lc=levelControl('G02').textContent;
    t('Niveau heißt überall „Leicht“ und „Knifflig“ (Niveau-Schalter), nie „Niveau 1“',lc.includes('Leicht')&&lc.includes('Knifflig')&&!lc.includes('Niveau'));
    t('Thema heißt „Erweitern und Kürzen“, Seitentitel „Bruchwerkstatt“',moduleById('veraendern').name==='Erweitern und Kürzen'&&document.title==='Bruchwerkstatt');
  }
  const bad=res.filter(r=>!r.ok);
  console.log(`Selbsttest: ${res.length-bad.length}/${res.length} bestanden`);
  bad.forEach(b=>console.error('FEHLER:',b.name));
  return {total:res.length,failed:bad.map(b=>b.name),passed:res.length-bad.length};
}
window.runSelfTests=runSelfTests;

