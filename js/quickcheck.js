'use strict';
/* =====================================================================
   Schnellcheck: Q00 (Mix, 15 Fragen: je Fähigkeit 3) und Q01 (Kurztest, 5 Fragen)
   Alle Fragen sind Antipp-Fragen; jede trägt ein skill-Etikett.
   Zahlen der Bruchfragen: leicht ≤ 60, schwer ≤ 300 (Teilbarkeit wie T01).
   ===================================================================== */
const Q_SKILLS=['gleich','teilbar','erweitern','kuerzen','vollstaendig'];
const Q_KINDS_BY_SKILL={gleich:['eqYN'],teilbar:['div'],erweitern:['missing','kind'],kuerzen:['missing','reducible','which','kind'],vollstaendig:['full']};
const Q_NOTES={eqYN:['M1'],missing:['M2','M3'],reducible:['M7','M3'],which:['M7','M3'],full:['M3'],kind:['M2','M3'],div:['M7']};
const Q_HINT={
  eqYN:['Vergleiche beide Brüche: Wurde bei Zähler und Nenner dasselbe gerechnet?'],
  missing:['Was ist mit dem bekannten Zähler oder Nenner passiert? Dasselbe gilt für die gesuchte Zahl.'],
  reducible:['Gibt es eine Zahl größer als 1, durch die beide Zahlen teilbar sind?',RULE2],
  which:['Teste: Teilt die Zahl sowohl den Zähler als auch den Nenner?',RULE2],
  full:['Prüfe, ob du noch einmal kürzen kannst.',RULE2],
  kind:['Vergleiche die Zahlen vorher und nachher: Wurde bei beiden dasselbe gerechnet?'],
  div:[]
};
const Q_SKILL_NAME={gleich:'Gleiche Brüche erkennen',teilbar:'Teilbarkeit',erweitern:'Erweitern',kuerzen:'Kürzen',vollstaendig:'Vollständig kürzen'};
/* Zu welcher Übung gehört die Fähigkeit? */
const Q_STATION={gleich:'G01',teilbar:'T01',erweitern:'G02',kuerzen:'G03',vollstaendig:'G04'};
const Q_PER_SKILL=3;                        /* Fragen je Fähigkeit im Schnellcheck */
const Q_COUNT=Q_SKILLS.length*Q_PER_SKILL;  /* 15 */
const Q_START_SHARE=0.3;                    /* höchstens dieser Anteil richtig = „fast alles falsch“ (bei 15 Fragen: 4) */
/* Fragenplan: Q_PER_SKILL Blöcke mit allen Fähigkeiten in zufälliger Reihenfolge, nie zweimal dieselbe hintereinander */
function qPlan(R){
  R=R||RNG;
  const out=[];
  for(let b=0;b<Q_PER_SKILL;b++){
    let blk;
    do{blk=R.shuffle(Q_SKILLS);}while(out.length&&blk[0]===out[out.length-1]);
    out.push(...blk);
  }
  return out;
}
const qLim=(level)=>level===1?60:300;
const Q_LETTERS=['A','B','C','D'];

function qCoprime(R,qmin,qmax){let p,q;do{q=R.int(qmin,qmax);p=R.int(1,q-1);}while(gcd(p,q)!==1);return [p,q];}
function qDivisors(n){const out=[];for(let d=2;d<=n;d++)if(n%d===0)out.push(d);return out;}
/* Vier Zahlenoptionen: richtige Zahl + 3 Fallen, alle verschieden, 1..lim */
function qNumOptions(R,ans,cand,lim){
  const seen=new Set([ans]),dist=[];
  for(const x of R.shuffle(cand)){
    if(Number.isInteger(x)&&x>=1&&x<=lim&&!seen.has(x)){seen.add(x);dist.push(x);}
    if(dist.length===3)break;
  }
  for(let s=1;dist.length<3&&s<50;s++){
    for(const x of [ans+s,ans-s]){if(dist.length<3&&x>=1&&x<=lim&&!seen.has(x)){seen.add(x);dist.push(x);}}
  }
  const nums=R.shuffle([ans].concat(dist));
  const opts=nums.map((n,i)=>({id:Q_LETTERS[i],txt:String(n)}));
  return {opts,answer:opts[nums.indexOf(ans)].id,optNums:nums};
}
const qCross=(a,b,c,d)=>'Kreuzprobe: '+a+' · '+d+' = '+(a*d)+' und '+c+' · '+b+' = '+(c*b)+'.';

function qEq(level,R){
  const L=qLim(level);
  for(let guard=0;guard<80;guard++){
    const [p,q]=qCoprime(R,2,level===1?9:25);
    const kmax=Math.min(level===1?6:12,Math.floor(L/q));
    if(kmax<1)continue;
    const ks=Array.from({length:kmax},(_,i)=>i+1);
    const k1=R.pick(ks),a=p*k1,b=q*k1;
    let c,d,eq,why;
    if(R.chance(0.5)){
      if(ks.length<2)continue;
      let k2;do{k2=R.pick(ks);}while(k2===k1);
      c=p*k2;d=q*k2;eq=true;
      why=qCross(a,b,c,d)+' Beide Brüche sind gleich viel.';
    }else{
      const trap=R.pick(['sameDen','additive','numOnly','denOnly','off1']);
      if(trap==='sameDen'){c=a+R.pick([-1,1,2]);d=b;why='Gleicher Nenner, aber anderer Zähler: nicht gleich viel.';}
      else if(trap==='additive'){const m=R.int(1,4);c=a+m;d=b+m;why='Beim Erweitern wird multipliziert, nicht addiert.';}
      else if(trap==='numOnly'){c=a*R.pick([2,3]);d=b;why='Beim Erweitern müssen Zähler und Nenner verändert werden.';}
      else if(trap==='denOnly'){c=a;d=b*R.pick([2,3]);why='Beim Erweitern müssen Zähler und Nenner verändert werden.';}
      else{const k2=R.pick(ks);c=p*k2;d=q*k2+R.pick([-1,1]);why='Schon ein kleiner Unterschied im Nenner ändert den Wert.';}
      eq=false;why=qCross(a,b,c,d)+' '+why;
    }
    if(c<1||d<2||Math.max(a,b,c,d)>L)continue;
    if(equivalent(a,b,c,d)!==eq||(a===c&&b===d))continue;
    return {kind:'eqYN',skill:'gleich',from:[a,b],to:[c,d],answer:eq?'ja':'nein',why};
  }
  throw new Error('qEq');
}

function qMissing(level,R,skill){
  const L=qLim(level);
  for(let guard=0;guard<120;guard++){
    const expand=skill==='erweitern'?true:skill==='kuerzen'?false:R.chance(0.5);
    let a,b,n,d,k;
    if(expand){
      b=R.int(2,level===1?9:25);a=R.int(1,b-1);k=R.int(2,level===1?5:9);
      n=a*k;d=b*k;
    }else{
      const [p,q]=qCoprime(R,2,level===1?7:15);
      const gmax=Math.floor(L/q);if(gmax<2)continue;
      const g=R.int(2,Math.min(gmax,level===1?12:30));
      k=R.pick(qDivisors(g));
      a=p*g;b=q*g;n=a/k;d=b/k;
    }
    if(Math.max(a,b,n,d)>L)continue;
    const blank=R.chance(0.7)?'n':'d',ans=blank==='n'?n:d;
    const cand=[ans+1,ans-1,ans+2,ans-2];
    if(blank==='n')cand.push(a+(d-b),a);else cand.push(b+(n-a),b);
    if(expand)cand.push(blank==='n'?a*(k+1):b*(k+1),blank==='n'?a*(k-1):b*(k-1));
    const {opts,answer,optNums}=qNumOptions(R,ans,cand,L);
    const op=expand?' · ':' : ';
    const why=blank==='n'
      ?'Der Nenner wurde '+(expand?'mit ':'durch ')+k+(expand?' multipliziert':' geteilt')+' ('+b+op+k+' = '+d+'). Also auch der Zähler: '+a+op+k+' = '+n+'.'
      :'Der Zähler wurde '+(expand?'mit ':'durch ')+k+(expand?' multipliziert':' geteilt')+' ('+a+op+k+' = '+n+'). Also auch der Nenner: '+b+op+k+' = '+d+'.';
    return {kind:'missing',skill:expand?'erweitern':'kuerzen',blank,from:[a,b],to:[blank==='n'?null:n,blank==='d'?null:d],opts,optNums,answer,why};
  }
  throw new Error('qMissing');
}

function qReducible(level,R){
  const L=qLim(level);
  for(let guard=0;guard<150;guard++){
    const yes=R.chance(0.5);
    let a,b,why;
    if(yes){
      const oddTrap=R.chance(0.45);
      const g=oddTrap?R.pick(level===1?[3,5,7,9]:[3,5,7,9,11,13,15]):R.pick(level===1?[2,3,4,5,6,8,10]:[2,3,4,5,6,7,8,9,10,12]);
      let p,q,t=0;
      do{[p,q]=qCoprime(R,2,level===1?9:25);t++;}while(oddTrap&&(p%2===0||q%2===0)&&t<60);
      a=p*g;b=q*g;
      const f=smallestPrimeFactor(gcd(a,b));
      why='Beide Zahlen sind durch '+f+' teilbar: '+a+' : '+f+' = '+(a/f)+' und '+b+' : '+f+' = '+(b/f)+'.';
    }else{
      b=R.int(level===1?5:12,L);
      const odd=R.chance(0.6);
      let t=0;
      do{a=R.int(1,b-1);t++;}while((gcd(a,b)!==1||(odd&&(a%2===0||b%2===0)))&&t<80);
      why='Zähler und Nenner haben keinen gemeinsamen Teiler außer 1. Der Bruch lässt sich nicht kürzen.';
    }
    if(a<1||a>=b||b>L)continue;
    if(yes!==(gcd(a,b)>1))continue;
    return {kind:'reducible',skill:'kuerzen',from:[a,b],answer:yes?'ja':'nein',why};
  }
  throw new Error('qReducible');
}

function qWhich(level,R){
  const L=qLim(level),maxTile=level===1?10:15;
  for(let guard=0;guard<150;guard++){
    const [p,q]=qCoprime(R,2,level===1?9:25);
    const gmax=Math.floor(L/q);if(gmax<2)continue;
    const g=R.int(2,Math.min(gmax,level===1?12:30));
    const a=p*g,b=q*g;
    const valid=qDivisors(g).filter(x=>x<=maxTile);
    if(!valid.length)continue;
    const correct=R.pick(valid);
    const pool=[];for(let x=2;x<=maxTile;x++)if(g%x!==0)pool.push(x);
    const one=pool.filter(x=>(a%x===0)!==(b%x===0)),rest=pool.filter(x=>!one.includes(x));
    const pick=R.shuffle(one).concat(R.shuffle(rest)).slice(0,3);
    if(pick.length<3)continue;
    const nums=R.shuffle([correct].concat(pick));
    if(nums.filter(x=>a%x===0&&b%x===0).length!==1)continue;
    const opts=nums.map((n,i)=>({id:Q_LETTERS[i],txt:String(n)}));
    return {kind:'which',skill:'kuerzen',from:[a,b],opts,optNums:nums,answer:opts[nums.indexOf(correct)].id,
      why:a+' : '+correct+' = '+(a/correct)+' und '+b+' : '+correct+' = '+(b/correct)+'. Nur diese Zahl teilt beide.'};
  }
  throw new Error('qWhich');
}

function qFull(level,R){
  const L=qLim(level);
  for(let guard=0;guard<150;guard++){
    const [p,q]=qCoprime(R,2,level===1?9:25);
    const gmax=Math.floor(L/q);if(gmax<4)continue;
    const yes=R.chance(0.5);
    const g=R.int(4,Math.min(gmax,level===1?12:30));
    const proper=qDivisors(g).filter(x=>x<g);
    if(!proper.length)continue;
    const f=yes?g:R.pick(proper),h=g/f;
    const a=p*g,b=q*g,c=p*h,d=q*h;
    if(yes!==isFullyReduced(c,d))continue;
    const why=yes?'Zähler und Nenner haben keinen gemeinsamen Teiler mehr.'
      :'Beide Zahlen sind noch durch '+h+' teilbar: '+c+' : '+h+' = '+p+' und '+d+' : '+h+' = '+q+'.';
    return {kind:'full',skill:'vollstaendig',from:[a,b],to:[c,d],answer:yes?'ja':'nein',why};
  }
  throw new Error('qFull');
}

const Q_KIND_OPTS=[{id:'erw',txt:'erweitert',ic:'aus'},{id:'kue',txt:'gekürzt',ic:'ein'},{id:'bad',txt:'falsch gerechnet',ic:'kreuz'}];
function qKind(level,R,skill){
  const L=qLim(level);
  for(let guard=0;guard<200;guard++){
    const t=skill==='kuerzen'?R.pick(['kue','kue','bad']):skill==='erweitern'?R.pick(['erw','erw','bad']):R.pick(['erw','kue','bad']);
    const reduceFlavor=t==='kue'||(t==='bad'&&(skill==='kuerzen'||(!skill&&R.chance(0.5))));
    let a,b,c,d,why;
    if(!reduceFlavor){
      const [p,q]=qCoprime(R,2,level===1?7:20),m=R.int(1,2);
      a=p*m;b=q*m;
      const k=R.int(2,level===1?5:9);
      if(t==='erw'){c=a*k;d=b*k;why='Zähler und Nenner wurden beide mit '+k+' multipliziert: erweitert.';}
      else{
        const v=R.pick(['add','num','mix']);
        if(v==='add'){const x=R.int(1,5);c=a+x;d=b+x;why='Es wurde addiert statt multipliziert.';}
        else if(v==='num'){c=a*k;d=b;why='Nur der Zähler wurde verändert.';}
        else{let k2;do{k2=R.int(2,level===1?5:9);}while(k2===k);c=a*k;d=b*k2;why='Zähler und Nenner wurden mit verschiedenen Zahlen multipliziert.';}
      }
    }else{
      const [p,q]=qCoprime(R,2,level===1?7:15),gmax=Math.floor(L/q);
      if(gmax<2)continue;
      const g=R.int(2,Math.min(gmax,level===1?12:30));
      a=p*g;b=q*g;
      const f=R.pick(qDivisors(g));
      if(t==='kue'){c=a/f;d=b/f;why='Zähler und Nenner wurden beide durch '+f+' geteilt: gekürzt.';}
      else{
        const v=R.pick(['sub','num','den','mix']);
        if(v==='sub'){const x=R.int(1,3);c=a-x;d=b-x;why='Es wurde subtrahiert statt dividiert.';}
        else if(v==='num'){c=a/f;d=b;why='Nur der Zähler wurde geteilt.';}
        else if(v==='den'){c=a;d=b/f;why='Nur der Nenner wurde geteilt.';}
        else{const fs=qDivisors(g).filter(x=>x!==f);if(!fs.length)continue;const f2=R.pick(fs);c=a/f;d=b/f2;why='Zähler und Nenner wurden durch verschiedene Zahlen geteilt.';}
      }
    }
    if(c<1||d<2||Math.max(a,b,c,d)>L)continue;
    if(!Number.isInteger(c)||!Number.isInteger(d))continue;
    if((t==='bad')===equivalent(a,b,c,d))continue;
    if(a===c&&b===d)continue;
    return {kind:'kind',skill:t==='erw'?'erweitern':t==='kue'?'kuerzen':(reduceFlavor?'kuerzen':'erweitern'),from:[a,b],to:[c,d],opts:Q_KIND_OPTS,answer:t,why};
  }
  throw new Error('qKind');
}

function qDiv(level,R){
  const k=R.pick([2,3,4,5,6,9,10]),yes=R.chance(0.5);
  let n,t=0;
  do{n=level===1?R.int(12,500):R.int(100,1000);t++;}while(divisible(n,k)!==yes&&t<400);
  return {kind:'div',skill:'teilbar',n,k,answer:divisible(n,k)?'ja':'nein',why:divExplain(n,k).join(' ')};
}

const Q_GEN={eqYN:qEq,missing:qMissing,reducible:qReducible,which:qWhich,full:qFull,kind:qKind,div:qDiv};
function makeQuickGen(typeId){
  return function(level,R,ctx){
    const skill=(ctx&&ctx.skill)||R.pick(Q_SKILLS);
    const kind=R.pick(Q_KINDS_BY_SKILL[skill]);
    const body=Q_GEN[kind](level,R,skill),avoid=[];
    ['from','to'].forEach(k=>{const x=body[k];if(x&&x[0]!=null&&x[1]!=null)avoid.push(redKey(x[0],x[1]));});
    return Object.assign({type:typeId,level,avoid},body);
  };
}
function qAnswerText(t){
  if(t.answer==='ja')return 'Richtig wäre: Ja.';
  if(t.answer==='nein')return 'Richtig wäre: Nein.';
  const o=t.opts.find(x=>x.id===t.answer);
  return 'Richtig wäre: '+o.txt+'.';
}
function qMark(node,id,view,t){
  if(!view.locked())return;
  const right=id===t.answer;
  if(!right&&view.draft.ans!==id)return;
  node.classList.add(right?'is-right':'is-wrong');
  node.append(el('span',{class:'mk','aria-hidden':'true'},icon(right?'haken':'kreuz'),right?'richtig':'falsch'));
  node.setAttribute('aria-label',(node.getAttribute('aria-label')||'')+(right?' – richtig':' – deine Antwort, falsch'));
}
function qPick(view,id,node,group){
  if(view.locked())return;
  view.draft.ans=id;view.save();
  group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===node)));
  if(view.submit)view.submit();
}

const QUICK={
  quick:true,
  notes:['M1','M2','M3','M7'],
  notesFor(t){return (t&&Q_NOTES[t.kind])||['M1','M2','M3','M7'];},
  prompt(t,h){
    const f=(x)=>frac(x[0],x[1]);
    let c;
    switch(t.kind){
      case 'eqYN':c=['Sind ',f(t.from),' und ',f(t.to),' gleich viel?'];break;
      case 'missing':c=['Welche Zahl fehlt?'];break;
      case 'reducible':c=['Lässt sich ',f(t.from),' kürzen?'];break;
      case 'which':c=['Mit welcher Zahl kannst du ',f(t.from),' kürzen?'];break;
      case 'full':c=['Ist der rechte Bruch so weit wie möglich gekürzt?'];break;
      case 'kind':c=['Was wurde hier gerechnet?'];break;
      default:c=['Ist ',strong(t.n),' durch ',strong(t.k),' teilbar?'];
    }
    h.append(el('p',{class:'q'},...c));
  },
  render(view,host){
    const t=view.task,d=view.draft,f=(x)=>frac(x[0],x[1]);
    if(t.kind==='missing'){
      const blank=el('span',{class:'blank','aria-label':'gesuchte Zahl'},'?');
      const tn=t.blank==='n'?blank:String(t.to[0]),td=t.blank==='d'?blank:String(t.to[1]);
      host.append(eq(f(t.from),'=',el('span',{class:'frac',role:'math','aria-label':(t.blank==='n'?'gesuchte Zahl':t.to[0])+' durch '+(t.blank==='d'?'gesuchte Zahl':t.to[1])},el('span',{class:'num'},tn),el('span',{class:'den'},td))));
    }else if(t.kind==='full')host.append(eq(f(t.from),'=',f(t.to)));
    else if(t.kind==='kind')host.append(eq(f(t.from),'→',f(t.to)));
    if(t.opts){
      const grid=el('div',{class:'tiles tiles-'+t.opts.length,role:'group','aria-label':'Antworten'});
      t.opts.forEach((o,i)=>{
        const b=el('button',{type:'button',class:'tile'+(o.ic?' tile-ic':''),'aria-pressed':String(d.ans===o.id),'aria-label':'Antwort '+Q_LETTERS[i]+': '+o.txt},
          el('span',{class:'ltr','aria-hidden':'true'},Q_LETTERS[i]),o.ic?icon(o.ic):null,el('span',{class:'tv'},o.txt));
        b.disabled=view.locked();qMark(b,o.id,view,t);
        b.addEventListener('click',()=>qPick(view,o.id,b,grid));
        view.inputs['t'+o.id]=b;grid.append(b);
      });
      host.append(grid);
    }else{
      const row=el('div',{class:'yesno'});
      [['ja','haken','Ja'],['nein','kreuz','Nein']].forEach(([v,ic,label])=>{
        const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.ans===v),'aria-label':label},icon(ic),label);
        b.disabled=view.locked();qMark(b,v,view,t);
        b.addEventListener('click',()=>qPick(view,v,b,row));
        view.inputs['yn'+v]=b;row.append(b);
      });
      host.append(row);
    }
  },
  validate(t,d){
    if(!d.ans)return invalid('Tippe eine Antwort an.');
    if(d.ans===t.answer)return right('Richtig! '+t.why);
    return wrong('quick',qAnswerText(t)+' '+t.why);
  },
  solution(t){return [line(qAnswerText(t)),line(t.why)];},
  hints(t){
    return t.kind==='div'?[['Schau dir die Ziffern an.'],[DIV_RULE[t.k]]]:[['Lies die Frage genau.'],Q_HINT[t.kind]];
  }
};
TASKS.Q00=Object.assign({area:'Grundlagen',name:'Schnellcheck',desc:Q_COUNT+' Blitzfragen zum Antippen – ohne Zeitdruck.',size:Q_COUNT,
  gen:makeQuickGen('Q00'),
  ctx(round){
    if(!round.plan)round.plan=qPlan();
    return {skill:round.plan[round.results.length%round.plan.length]};
  }},QUICK);
TASKS.Q01=Object.assign({area:'Grundlagen',name:'Kurztest',desc:'5 Fragen, um eine Station freizuschalten.',size:5,
  gen:makeQuickGen('Q01'),
  ctx(round){
    const sk=(S.quizSkills&&S.quizSkills.length)?S.quizSkills:['kuerzen'];
    return {skill:sk[round.results.length%sk.length]};
  }},QUICK);
wrapRange('Q00');wrapRange('Q01');

