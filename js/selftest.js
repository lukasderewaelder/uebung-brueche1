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
      case 'reducible':if(yes!==(gcd(a,b)>1)||a>=b)bad.push('reducible');break;
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
  for(const id of ['Q00','Q01'])for(const lvl of [1,2])for(const sk of Q_SKILLS)for(let i=0;i<150;i++){
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
  t('Labor: Erklärungen nennen Rechnung und 2-Regel',labTell([2,3],[6,9],'x',3).includes('2 · 3 = 6 und 3 · 3 = 9')&&labTell([6,9],[2,3],'d',3).includes('nicht mehr')&&labWhy([6,9],'d',2).includes('IMMER'));
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
  const keepP={passed:S.passed,checked:S.checked,final:S.final,placed:S.placed,days:S.days,lab:S.lab,quizFor:S.quizFor,quizSkills:S.quizSkills,einstufung:S.einstufung,perfect:Object.assign({},S.perfect)};
  const freshP=()=>{S.passed={};S.checked={};S.final=false;S.placed=false;S.days={};S.lab=null;S.einstufung=null;S.perfect={};};
  const R_=(id)=>pathState().find(r=>r.id===id);
  freshP();
  t('Pfad: Start – nächstes Bauteil G01, Labor offen, G02/B01/Abschluss gesperrt',pathState().find(r=>r.next).id==='G01'&&R_('LAB').open&&R_('G02').locked&&R_('G02').blocker==='G01'&&R_('B01').locked&&R_('Q00').locked);
  S.passed['G01-L1']=true;
  t('Pfad: G01 fertig ⇒ G02 nächstes, freiwilliges B01 offen',R_('G02').next&&R_('B01').open&&!R_('B01').must);
  S.checked.G03=true;
  t('Pfad: per Check fertig, dahinter bleibt gesperrt bis alles davor fertig ist',R_('G03').done&&R_('G03').via&&!R_('G03').locked&&R_('G04').locked&&R_('G04').blocker==='G02');
  S.passed['G02-L2']=true;S.passed['T01-L1']=true;
  t('Pfad: knifflig bestanden zählt, nächstes ist G04',R_('G02').done&&R_('G04').next);
  ['G04','G05'].forEach(x=>{S.passed[x+'-L1']=true;});
  t('Pfad: nach G05 sind Knobel-Bauteile und Abschluss offen',['U01','U02','U03','O02','Q00'].every(x=>R_(x).open)&&R_('Q00').next);
  S.final=true;
  t('Pfad: alles fertig ⇒ kein nächstes Bauteil',!pathState().some(r=>r.next));
  t('Pfad: 80 %-Regel (5→4, 8→7, 10→8)',needOf(5)===4&&needOf(8)===7&&needOf(10)===8&&needOf(15)===12);
  const rnd=(res,sk)=>({results:res.slice(),size:res.length,sk});
  freshP();
  let inf=onRoundEnd('G03',1,rnd(['f','f','l','x','f']));
  t('Rundenende: 4 von 5 ⇒ bestanden, erstes Mal, Tagesziel',inf.passed&&inf.firstPass&&S.passed['G03-L1']&&inf.daily);
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
  const pl1=planOf();
  t('Plan: Bauteile in Pfadreihenfolge, die nicht sitzen, dazu G05; „jetzt“ ist das erste (fast)',!!pl1&&pl1.items.map(x=>x.id).join()==='T01,G03,G05'&&pl1.now.id==='T01'&&pl1.now.status==='fast'&&pl1.items[1].status==='ueben');
  t('Plan: Karte mit Kurztest-Knopf bei „fast“, Marke Empfohlen nur bei offenen Plan-Bauteilen',(()=>{const c=planCard(pl1);return c.querySelectorAll('li.plan-it').length===3&&c.querySelectorAll('li.now .pl-act button').length===2&&/Kurztest/.test(c.textContent);})());
  S.passed['T01-L1']=true;
  const pl2=planOf();
  t('Plan: erledigtes Bauteil rückt vor, „jetzt“ wechselt',pl2.now.id==='G03'&&pl2.items[0].done);
  S.passed['G03-L1']=true;S.passed['G05-L1']=true;
  t('Plan: alles erledigt ⇒ Karte verschwindet',planOf()===null);
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres([]),qplan));
  t('Einstufung: 15 von 15 schaltet alles frei, Urkunde, kein Plan',['G01','G02','T01','G03','G04','G05'].every(x=>S.checked[x])&&inf.final&&S.final&&planOf()===null);
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
  t('Von vorn: höchstens 4 richtig ohne Fortschritt – nichts freigeschaltet, Plan = Bruchlabor + Gleiche Anteile',inf.ev.stufe==='start'&&Object.keys(S.checked).length===0&&S.placed&&!S.final&&(()=>{const p=planOf();return !!p&&p.items.map(x=>x.id).join()==='LAB,G01'&&p.now.id==='LAB'&&p.stufe==='start';})());
  S.lab={done:true};
  t('Von vorn: nach dem Labor ist Gleiche Anteile dran, danach verschwindet der Plan',planOf().now.id==='G01'&&(()=>{S.passed['G01-L1']=true;return planOf()===null;})());
  freshP();S.passed['G01-L1']=true;
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
  t('Wenige Treffer mitten im Pfad: kein „von vorn“, nichts frei, Plan mit allem „üben“',inf.ev.stufe==='plan'&&Object.keys(S.checked).length===0&&S.einstufung.stufe==='plan'&&S.einstufung.skills.erweitern.status==='ueben');
  S.einstufung={at:1,right:13,size:15,stufe:'fit',skills:S.einstufung.skills};
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=4)),qplan));
  t('Wenige Treffer überschreiben einen vorhandenen Plan nicht',S.einstufung.at===1&&S.einstufung.stufe==='fit');
  freshP();
  inf=onRoundEnd('Q00',1,rnd(qres(pos('vollstaendig')),qplan));
  t('3+3+3+3+0 ist „fit“, aber nicht fertig: keine Urkunde, Plan = G04 und G05',inf.ev.stufe==='fit'&&!inf.final&&!S.final&&planOf().items.map(x=>x.id).join()==='G04,G05'&&S.checked.G03&&!S.checked.G04);
  freshP();['G01','G02','T01','G03','G04','G05'].forEach(x=>{S.passed[x+'-L1']=true;});
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=11)),qplan));
  t('Abschlusscheck: alles fertig, aber nur 11 von 15 ⇒ keine Urkunde (ready, nicht passed)',inf.ready&&!inf.passed&&!inf.final&&!S.final);
  inf=onRoundEnd('Q00',1,rnd(qres(qplan.map((_,i)=>i).filter(i=>i>=12)),qplan));
  t('Abschlusscheck: alles fertig und 12 von 15 ⇒ Urkunde',inf.ready&&inf.passed&&inf.final&&S.final);
  freshP();S.passed['G01-L1']=true;
  inf=onRoundEnd('Q00',1,rnd(['f','f','f','f','f','f','x','x','f','f'],oldPlan));
  t('Abschluss: ohne alle Pflicht-Bauteile keine Urkunde',inf.passed&&!inf.final&&!S.final);
  t('Migration 6: alte Schnellcheck-Runden (10 Fragen) werden verworfen, Rest bleibt',(()=>{const o={rounds:{'Q00-L1':{size:10,results:[]},'Q00-L2':{size:15,results:[]},'G02-L1':{size:5,results:[]},'Q01-L1':{size:5,results:[]}}};migrate6(o);return !o.rounds['Q00-L1']&&!!o.rounds['Q00-L2']&&!!o.rounds['G02-L1']&&!!o.rounds['Q01-L1'];})());
  freshP();S.quizFor='G02';
  inf=onRoundEnd('Q01',1,rnd(['f','f','f','x','f']));
  t('Kurztest: 4 von 5 ⇒ Bauteil per Check, kein Pfad-Eintrag Q01',inf.quiz.passed&&S.checked.G02&&!S.passed['Q01-L1']);
  freshP();S.quizFor='G02';
  inf=onRoundEnd('Q01',1,rnd(['f','x','f','x','f']));
  t('Kurztest: 3 von 5 ⇒ nicht frei',!inf.quiz.passed&&!S.checked.G02);
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
    t('Tresor: Tür-Tipps nennen „Die 2 geht IMMER“',h.every(x=>x.some(l=>/2 geht IMMER/i.test(l))));
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
      if([s.fig,s.lab,s.tryit].filter(Boolean).length>1)return false;
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
    t('Erklärungen: Wörter und Knöpfe stimmen mit den Namen auf dem Bildschirm überein',[['G02','Erweiterungszahl'],['G03','Kürzungszahl'],['G04','Nicht kürzbar'],['G04','Die 2 geht IMMER'],['G01','Prüfen'],['LAB','Rückgängig'],['O02','Weg neu starten'],['T01','Merkkasten']].every(([id,w])=>INTRO[id].steps.some(s=>s.say.some(x=>x.includes('**'+w)))));
    let built=true;
    try{steps.forEach(s=>{introRich(s.h);s.say.forEach(introRich);if(s.fig)introFigNode(s.fig);if(s.calc)introCalcNode(s.calc);if(s.tryit)introTry(s.tryit);if(s.lab)labFigure({mode:'strip',base:s.lab.base,cur:s.lab.cur,last:{op:s.lab.op,k:s.lab.k}});});}catch(e){built=false;}
    t('Erklärungen: alle Schritte lassen sich aufbauen',built);
    t('Erklärungen: **fett** und {n|d} werden zu Text, Hervorhebung und Bruch',(()=>{const n=introRich('Tippe **Prüfen**. Aus {4|6} wird {2|3}.');return n.length===7&&n[1].tagName==='STRONG'&&n[1].textContent==='Prüfen'&&n[3].classList.contains('frac')&&n[3].textContent==='46'&&n[5].classList.contains('frac')&&n[5].textContent==='23';})());
    /* Gate: ungesehen oder ausdrücklich geöffnet; nie für Kurztest, Spiele, Startseite */
    S.intro={};
    t('Gate: Bruchlabor und Übungen des Lernpfads zeigen die Erklärung, solange sie ungesehen ist',introWanted({kind:'lab'})==='LAB'&&introWanted({kind:'practice',id:'G02'})==='G02'&&introWanted({kind:'practice',id:'Q00'})==='Q00');
    t('Gate: nie beim Kurztest, bei Spielen, auf der Startseite und bei unbekannten Kennungen',!introWanted({kind:'practice',id:'Q01'})&&!introWanted({kind:'practice',id:'O01'})&&!introWanted({kind:'game',id:'S01'})&&!introWanted({kind:'home'})&&!introWanted({kind:'practice',id:'ZZ'})&&!introWanted({kind:'practice',id:'constructor'})&&!introWanted(null));
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
  /* Themen-Registry */
  t('Registry: jede Aufgabe, Gruppe und jedes Bauteil eines aktiven Themas gibt es',activeModules().every(m=>(m.practice||[]).every(id=>TASKS[id])&&Object.values(m.groups||{}).every(g=>g.ids.every(id=>id==='LAB'||TASKS[id]))&&(m.path||[]).every(p=>p.id==='LAB'||TASKS[p.id])));
  t('Registry: geplante Themen haben keine Aufgaben, keine Gruppen, keinen Lernpfad',plannedModules().length>0&&plannedModules().every(m=>!m.practice&&!m.groups&&!m.path));
  t('Registry: Themen-IDs und Aufgaben-IDs sind eindeutig',new Set(MODULES.map(m=>m.id)).size===MODULES.length&&new Set(PRACTICE_ORDER).size===PRACTICE_ORDER.length&&new Set(PATH.map(p=>p.id)).size===PATH.length);
  t('Registry: Rang zählt „Brüche verändern“ (16 Übungen, 13 Bauteile)',rankPractice().length===16&&rankPath().length===13&&moduleOf('G02').id==='veraendern'&&moduleOf('Entdecken').id==='veraendern');
  const bad=res.filter(r=>!r.ok);
  console.log(`Selbsttest: ${res.length-bad.length}/${res.length} bestanden`);
  bad.forEach(b=>console.error('FEHLER:',b.name));
  return {total:res.length,failed:bad.map(b=>b.name),passed:res.length-bad.length};
}
window.runSelfTests=runSelfTests;

