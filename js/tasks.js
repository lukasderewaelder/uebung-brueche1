'use strict';
/* =====================================================================
   6 Aufgabentypen: Generator, Darstellung, Prüfung, Musterlösung, Tipps
   Antworten liegen als einfaches Objekt (draft) vor und sind serialisierbar.
   ===================================================================== */
const MSG_FRAC_INVALID='Trage in beide Felder eine ganze Zahl ein (Nenner größer als 0).';

function getInt(draft,key){return parseIntStrict(draft[key]);}
function getFrac(draft,key){
  const n=parseIntStrict(draft[key+'.n']),d=parseIntStrict(draft[key+'.d']);
  return (n===null||d===null||d===0)?null:{n,d};
}
const invalid=(msg)=>({correct:false,invalid:true,errorCode:'invalid',feedback:msg});
const wrong=(code,msg,marks)=>({correct:false,errorCode:code,feedback:msg,marks});
/* „Fast“: Der Wert stimmt, aber die verlangte Form noch nicht (wird freundlicher angezeigt als ein Fehler) */
const soft=(code,msg,marks)=>({correct:false,soft:true,errorCode:code,feedback:msg,marks});
const right=(msg,norm)=>({correct:true,errorCode:null,feedback:msg,normalizedAnswer:norm});

/* ---- Eingabe-Bausteine ---- */
function digitsOnly(i){i.value=i.value.replace(/\D/g,'');}
function fracInput(view,key){
  const mk=(part,label)=>{
    const k=key+'.'+part;
    const i=el('input',{type:'text',inputmode:'none',pattern:'[0-9]*',autocomplete:'off',autocapitalize:'off',spellcheck:'false',maxlength:'6','aria-label':label});
    i.value=view.draft[k]!=null?view.draft[k]:'';
    i.disabled=view.locked();
    i.addEventListener('input',()=>{digitsOnly(i);view.draft[k]=i.value;i.classList.remove('bad','good');view.save();});
    view.inputs[k]=i;
    return i;
  };
  return el('span',{class:'frac inp',role:'group','aria-label':'Bruch eingeben'},
    el('span',{class:'num'},mk('n','Zähler')),el('span',{class:'den'},mk('d','Nenner')));
}
function intInput(view,key,label){
  const i=el('input',{type:'text',class:'intin',inputmode:'none',pattern:'[0-9]*',autocomplete:'off',spellcheck:'false',maxlength:'6','aria-label':label||'Zahl'});
  i.value=view.draft[key]!=null?view.draft[key]:'';
  i.disabled=view.locked();
  i.addEventListener('input',()=>{digitsOnly(i);view.draft[key]=i.value;i.classList.remove('bad','good');view.save();});
  view.inputs[key]=i;
  return i;
}
function decInput(view,key){
  const i=el('input',{type:'text',class:'decin',inputmode:'none',autocomplete:'off',spellcheck:'false',maxlength:'12',placeholder:'0,0','aria-label':'Dezimalzahl'});
  i.value=view.draft[key]!=null?view.draft[key]:'';
  i.disabled=view.locked();
  i.addEventListener('input',()=>{
    let v=i.value.replace(/\./g,',').replace(/[^\d,]/g,'');
    const p=v.indexOf(',');if(p>=0)v=v.slice(0,p+1)+v.slice(p+1).replace(/,/g,'');
    i.value=v;view.draft[key]=v;i.classList.remove('bad','good');view.save();
  });
  view.inputs[key]=i;
  return i;
}
function stepper(view,label,get,set,min,max){
  const out=el('output',{'aria-live':'polite'});
  const minus=el('button',{type:'button','aria-label':label+' verringern'},'−');
  const plus=el('button',{type:'button','aria-label':label+' erhöhen'},'+');
  const mx=()=>typeof max==='function'?max():max;
  const upd=()=>{out.textContent=get();minus.disabled=view.locked()||get()<=min;plus.disabled=view.locked()||get()>=mx();};
  minus.addEventListener('click',()=>{if(!view.locked()&&get()>min){set(get()-1);}});
  plus.addEventListener('click',()=>{if(!view.locked()&&get()<mx()){set(get()+1);}});
  const box=el('span',{class:'stepper'},el('span',{class:'lab'},label),minus,out,plus);
  box.upd=upd;upd();
  return box;
}

/* Allgemeine Diagnose für Erweitern/Kürzen: liefert nur zutreffende Hinweise */
function diagOps(a,b,n,d,mode){
  const verb=mode==='expand'?'Erweitern':'Kürzen';
  if(n===a&&d!==b)return wrong('onlyDen',`Beim ${verb} müssen Zähler und Nenner verändert werden. Du hast nur den Nenner verändert.`);
  if(d===b&&n!==a)return wrong('onlyNum',`Beim ${verb} müssen Zähler und Nenner verändert werden. Du hast nur den Zähler verändert.`);
  if(n===a&&d===b)return wrong('same',`Der Bruch ist unverändert. Beim ${verb} müssen sich Zähler und Nenner ändern.`);
  if(!equivalent(a,b,n,d))return wrong('diffFactors','Prüfe, ob du oben und unten dieselbe Zahl verwendet hast. Der Wert des Bruchs hat sich verändert.');
  return null;
}

/* ====================== Aufgabentypen ====================== */
const TASKS={};

/* ---------- G01 Gleiche Anteile erkennen ---------- */
TASKS.G01={area:'Grundlagen',name:'Gleiche Anteile erkennen',desc:'Finde die Bilder und Brüche, die denselben Anteil zeigen.',notes:['M1'],size:5,
  gen(level,R){
    let p,q,k0;
    do{q=level===1?R.pick([2,3,4,5,6]):R.int(3,9);p=R.int(1,q-1);}while(gcd(p,q)!==1);
    k0=level===1?1:R.int(2,4);
    const a=p*k0,b=q*k0,maxK=level===1?4:7,dmax=level===1?24:63,total=level===1?5:6;
    const equal=Array.from({length:maxK},(_,i)=>i+1).filter(k=>k!==k0&&q*k<=dmax).map(k=>[p*k,q*k]);
    /* Die Zahl der richtigen Karten wechselt: leicht 1–3, knifflig 1–4 */
    const nCorrect=Math.min(equal.length,R.pick(level===1?[1,2,2,3]:[1,2,3,3,4]));
    const correct=R.shuffle(equal).slice(0,nCorrect);
    /* typische Fehlvorstellungen als Gegenkarten */
    const dist=[],pool=[];
    const same=(x,n,d)=>x[0]===n&&x[1]===d;
    const add=(n,d)=>{if(n>=1&&d>n&&d<=dmax&&!equivalent(a,b,n,d)&&!pool.some(x=>same(x,n,d)))pool.push([n,d]);};
    [[a+1,b],[a-1,b],[b-a,b],[a,b*2],[a,b+1],[p,q+1],[p+1,q+1],[p+1,q],[a+k0,b+1],[b-a+1,b+1]].forEach(c=>add(c[0],c[1]));
    [2,3,4].forEach(k=>{add(p*k+1,q*k);add(p*k-1,q*k);add(p*k,q*k+1);});
    for(const c of R.shuffle(pool)){if(dist.length>=total-nCorrect)break;dist.push(c);}
    /* Darstellung: Streifen und Kreis nur bei kleinen Nennern, große Nenner nur als Rechteckeinteilung */
    /* Gefärbte Teile verstreut oder verschoben (nur bei Bildern); ein Teil der Bilder bleibt klassisch zusammenhängend */
    const pC=level===1?0.3:0.1;
    const withFill=(f)=>{if(f.mode!=='num')f.fill=scatterFill(f.n,f.d,f.mode,R,{pClassic:pC});return f;};
    const mk=([n,d])=>{
      const m=pickMode(d,R);
      return withFill({n,d,mode:(m&&R.chance(level===1?0.5:(d>12?0.6:0.35)))?m:'num'});
    };
    const cards=R.shuffle(correct.concat(dist)).map(mk);
    const tm=level===1?(pickMode(b,R)||'strip'):'num';
    return {type:'G01',level,target:withFill({n:a,d:b,mode:tm}),cards,avoid:[redKey(a,b)]};
  },
  prompt(t,h){
    const n=t.cards.filter(c=>equivalent(c.n,c.d,t.target.n,t.target.d)).length;
    h.append(el('p',{class:'q'},t.level===1?'Welche Karten zeigen denselben Anteil wie das Bild?':['Welche Karten sind gleich viel wert wie ',frac(t.target.n,t.target.d),'?'],' ',el('b',null,'(Es gibt '+n+' richtige.)')));
  },
  render(view,host){
    const t=view.task,d=view.draft;d.sel=d.sel||[];
    const tg=el('figure',{class:'fig',style:'max-width:12.5rem'});
    if(t.target.mode!=='num')tg.append(drawMode(t.target.mode,t.target.n,t.target.d,{label:'Vorgabe',maxW:150,fill:t.target.fill}));
    const cards=el('div',{class:'cards',role:'group','aria-label':'Karten'});
    t.cards.forEach((c,i)=>{
      const b=el('button',{type:'button',class:'pick','aria-pressed':String(d.sel.includes(i)),'aria-label':c.mode==='num'?`Karte ${i+1}: ${c.n} durch ${c.d}`:`Karte ${i+1}: Bruchbild`},
        c.mode==='num'?frac(c.n,c.d):drawMode(c.mode,c.n,c.d,{maxW:110,label:'Bruchbild',tall:true,fill:c.fill}));
      b.disabled=view.locked();
      b.addEventListener('click',()=>{
        if(view.locked())return;
        const j=d.sel.indexOf(i);if(j>=0)d.sel.splice(j,1);else d.sel.push(i);
        b.setAttribute('aria-pressed',String(d.sel.includes(i)));view.save();
      });
      view.inputs['c'+i]=b;cards.append(b);
    });
    host.append(...(tg.firstChild?[tg]:[]),cards);
  },
  validate(t,d){
    const sel=d.sel||[];
    if(!sel.length)return invalid('Wähle mindestens eine Karte aus.');
    const ok=i=>equivalent(t.cards[i].n,t.cards[i].d,t.target.n,t.target.d);
    const wr=sel.filter(i=>!ok(i)),miss=t.cards.map((_,i)=>i).filter(i=>ok(i)&&!sel.includes(i));
    if(!wr.length&&!miss.length)return right('Richtig! Alle diese Karten zeigen denselben Anteil – nur die Einteilung ist verschieden.');
    if(wr.length){
      const sameParts=wr.some(i=>t.cards[i].d===t.target.d);
      return wrong('wrongCard',sameParts?'Eine gewählte Karte hat gleich viele Teile, zeigt aber einen anderen Anteil. Die Anzahl der Teile allein genügt nicht: Der Anteil der gefärbten Fläche entscheidet.':'Mindestens eine gewählte Karte zeigt einen anderen Anteil. Vergleiche die gefärbten Anteile.');
    }
    return soft('missing','Das stimmt bisher – aber es gibt noch mehr passende Karten.');
  },
  solution(t){
    const box=[];
    t.cards.forEach((c,i)=>{
      if(equivalent(c.n,c.d,t.target.n,t.target.d))box.push(line(`Karte ${i+1}: `,frac(c.n,c.d),' – ',relationText(t.target.n,t.target.d,c.n,c.d)));
    });
    box.push(line('Alle anderen Karten zeigen einen anderen Anteil, auch wenn der Nenner oder der Zähler gleich sein kann.'));
    return box;
  },
  hints(t){return HINT.equal.map(x=>[x]);}
};
function relationText(a,b,c,d){
  if(c%a===0&&d%b===0&&c/a===d/b&&c/a>1)return `erweitert mit ${c/a}`;
  if(a%c===0&&b%d===0&&a/c===b/d&&a/c>1)return `gekürzt mit ${a/c}`;
  return `Kreuzprobe: ${a} · ${d} = ${a*d} und ${c} · ${b} = ${c*b}`;
}

/* ---------- G02 Erweitern ---------- */
TASKS.G02={area:'Grundlagen',name:'Erweitern',desc:'Erweitere Brüche mit einer vorgegebenen Zahl.',notes:['M2'],size:5,
  gen(level,R){
    let a,b,k,mode='factor';
    if(level===1){b=R.int(2,9);a=R.int(1,b-1);k=R.pick([2,3,4,5]);}
    else{b=R.int(5,25);a=R.chance(0.2)?R.int(b+1,2*b):R.int(2,b-1);k=R.pick([6,7,8,9,11,12]);if(R.chance(0.3))mode='target';}
    return {type:'G02',level,mode,a,b,k,avoid:[redKey(a,b),redKey(a*k,b*k)]};
  },
  prompt(t,h){
    h.append(t.mode==='factor'?el('p',{class:'q'},'Erweitere den Bruch ',frac(t.a,t.b),' mit ',strong(t.k),'.')
      :el('p',{class:'q'},'Erweitere den Bruch ',frac(t.a,t.b),' so, dass der Nenner ',strong(t.b*t.k),' entsteht.'));
  },
  render(view,host){const t=view.task;host.append(eq(frac(t.a,t.b),'=',fracInput(view,'r')));},
  validate(t,d){
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const n=t.a*t.k,dd=t.b*t.k,m={'r.n':f.n===n,'r.d':f.d===dd};
    if(f.n===n&&f.d===dd)return right(`Richtig! Du hast Zähler und Nenner mit derselben Zahl multipliziert. Der Wert hat sich nicht verändert.`,[n,dd]);
    const g=diagOps(t.a,t.b,f.n,f.d,'expand');if(g){g.marks=m;return g;}
    if(equivalent(t.a,t.b,f.n,f.d))return soft('wrongFactor',t.mode==='factor'?`Der Wert stimmt, aber du solltest mit ${t.k} erweitern.`:`Der Wert stimmt, aber der neue Nenner soll ${dd} sein.`,m);
    return wrong('other','Das ist noch nicht richtig. Rechne Zähler und Nenner noch einmal einzeln.',m);
  },
  solution(t){
    return [line('Zähler und Nenner werden mit '+t.k+' multipliziert:'),eq(frac(t.a,t.b),'=',frac(t.a+' · '+t.k,t.b+' · '+t.k),'=',frac(t.a*t.k,t.b*t.k)),line('Der Wert des Bruchs ändert sich nicht.')];
  },
  hints(t){return HINT.expand.map(x=>[x]);}
};

/* ---------- G03 Kürzen ---------- */
TASKS.G03={area:'Grundlagen',name:'Kürzen',desc:'Kürze Brüche mit einer Zahl oder so weit wie möglich.',notes:['M3'],size:5,
  gen(level,R){
    const coprime=(qmin,qmax)=>{let p,q;do{q=R.int(qmin,qmax);p=R.int(1,q-1);}while(gcd(p,q)!==1);return [p,q];};
    if(R.chance(level===1?0.5:0.35)){
      const k=level===1?R.pick([2,3,4,5]):R.pick([6,8,9,12]);
      const q=level===1?R.int(2,6):R.int(3,12),p=R.int(1,q-1);
      const a=p*k,b=q*k;
      return {type:'G03',level,mode:'factor',a,b,k,avoid:[redKey(a,b)]};
    }
    const [p,q]=level===1?coprime(2,7):coprime(3,17);
    const g=level===1?R.pick([2,3,4,5]):R.int(6,15);
    return {type:'G03',level,mode:'full',a:p*g,b:q*g,p,q,avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    h.append(t.mode==='factor'?el('p',{class:'q'},'Kürze den Bruch ',frac(t.a,t.b),' mit ',strong(t.k),'.')
      :el('p',{class:'q'},'Kürze den Bruch ',frac(t.a,t.b),' so weit wie möglich.'));
  },
  render(view,host){const t=view.task;host.append(eq(frac(t.a,t.b),'=',fracInput(view,'r')));},
  validate(t,d){
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const [en,ed]=t.mode==='factor'?[t.a/t.k,t.b/t.k]:[t.p,t.q];
    const m={'r.n':f.n===en,'r.d':f.d===ed};
    if(f.n===en&&f.d===ed)return right(t.mode==='factor'?'Richtig! Du hast Zähler und Nenner durch dieselbe Zahl geteilt. Der Wert hat sich nicht verändert.':'Richtig! Der Bruch ist so weit wie möglich gekürzt.',[en,ed]);
    const g=diagOps(t.a,t.b,f.n,f.d,'reduce');if(g){g.marks=m;return g;}
    if(equivalent(t.a,t.b,f.n,f.d)){
      if(t.mode==='full'&&f.d<t.b&&!isFullyReduced(f.n,f.d))return soft('notFull','Der Bruch hat den richtigen Wert. Du kannst aber noch weiter kürzen.',m);
      if(f.d>t.b)return soft('expanded','Das ist erweitert, nicht gekürzt. Beim Kürzen werden die Zahlen kleiner.',m);
      if(t.mode==='factor')return soft('wrongFactor',`Der Wert stimmt, aber du solltest mit ${t.k} kürzen.`,m);
    }
    return wrong('other','Das ist noch nicht richtig. Teile Zähler und Nenner noch einmal einzeln.',m);
  },
  solution(t){
    if(t.mode==='factor')return [line('Zähler und Nenner werden durch '+t.k+' geteilt:'),eq(frac(t.a,t.b),'=',frac(t.a+' : '+t.k,t.b+' : '+t.k),'=',frac(t.a/t.k,t.b/t.k))];
    const g=gcd(t.a,t.b),out=[line('Zähler und Nenner lassen sich beide durch '+g+' teilen:'),eq(frac(t.a,t.b),'=',frac(t.a+' : '+g,t.b+' : '+g),'=',frac(t.p,t.q))];
    out.push(line('Der Bruch ',frac(t.p,t.q),' lässt sich nicht weiter kürzen. (Man kann auch in mehreren kleinen Schritten kürzen.)'));
    return out;
  },
  hints(t){return withRules(t.mode==='factor'?HINT.reduceGiven:HINT.reduce);}
};

/* ---------- U01 Bruch-Lücken ---------- */
TASKS.U01={area:'Umkehraufgaben',name:'Bruch-Lücken',desc:'Ergänze die fehlende Zahl in gleichwertigen Brüchen.',notes:['M1','M2'],size:5,
  gen(level,R){
    let p,q;
    if(level===1){do{q=R.int(2,6);p=R.int(1,q-1);}while(gcd(p,q)!==1);}
    else{do{q=R.int(3,12);p=R.int(1,q-1);}while(gcd(p,q)!==1);}
    const ms=level===1?(R.chance(0.5)?[1,R.int(2,5)]:[R.int(2,5),1]):R.shuffle([1,2,3,4,5,6,7,8,9]).slice(0,3);
    const full=R.int(0,ms.length-1);
    const terms=ms.map((m,i)=>({n:p*m,d:q*m,blank:i===full?null:R.pick(['n','d'])}));
    if(level===1&&R.chance(0.5))terms.reverse();
    return {type:'U01',level,terms,avoid:[redKey(p,q)]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Welche Zahlen fehlen?'));},
  render(view,host){
    const t=view.task,parts=[];
    t.terms.forEach((x,i)=>{
      if(i)parts.push('=');
      if(!x.blank)parts.push(frac(x.n,x.d));
      else{
        const mk=(part)=>{
          const k='g'+i,inp=intInput(view,k,part==='n'?'fehlender Zähler':'fehlender Nenner');
          return inp;
        };
        parts.push(el('span',{class:'frac inp'},
          el('span',{class:'num'},x.blank==='n'?mk('n'):String(x.n)),
          el('span',{class:'den'},x.blank==='d'?mk('d'):String(x.d))));
      }
    });
    host.append(eq(...parts));
  },
  validate(t,d){
    const marks={};let all=true,empty=false;
    t.terms.forEach((x,i)=>{
      if(!x.blank)return;
      const v=getInt(d,'g'+i);
      if(v===null){empty=true;return;}
      const exp=x.blank==='n'?x.n:x.d,ok=v===exp;
      marks['g'+i]=ok;if(!ok)all=false;
    });
    if(empty)return invalid('Trage in jede Lücke eine ganze Zahl ein.');
    if(all)return right('Richtig! Auf beiden Seiten wurde derselbe Rechenschritt ausgeführt.');
    return wrong('gap','Mindestens eine Lücke stimmt noch nicht. Der Wert der Brüche muss gleich bleiben.',marks);
  },
  solution(t){
    const ref=t.terms.find(x=>!x.blank),out=[];
    out.push(line('Vergleiche den bekannten Bruch ',frac(ref.n,ref.d),' mit den anderen:'));
    t.terms.forEach(x=>{
      if(!x.blank)return;
      out.push(line(frac(ref.n,ref.d),' → ',frac(x.n,x.d),': ',relationText(ref.n,ref.d,x.n,x.d),'. Gesuchte Zahl: ',strong(x.blank==='n'?x.n:x.d),'.'));
    });
    return out;
  },
  hints(t){
    const red=t.terms.some(x=>!x.blank&&t.terms.some(y=>y.blank&&y.d<x.d));
    return red?withRules(HINT.gaps):HINT.gaps.map(x=>[x]);
  }
};

/* ---------- U02 Erweiterungs- oder Kürzungszahl finden ---------- */
TASKS.U02={area:'Umkehraufgaben',name:'Erweiterungs- oder Kürzungszahl finden',desc:'Finde heraus, womit erweitert oder gekürzt wurde.',notes:['M2','M3'],size:5,
  gen(level,R){
    const mode=R.chance(0.5)?'expand':'reduce';
    let p,q,k,mid=null,total;
    if(level===1){do{q=R.int(2,8);p=R.int(1,q-1);}while(gcd(p,q)!==1);k=R.pick([2,3,4,5]);}
    else{do{q=R.int(3,14);p=R.int(1,q-1);}while(gcd(p,q)!==1);k=R.int(6,15);}
    total=k;
    if(level===2&&mode==='expand'&&R.chance(0.35)){
      const k1=R.int(2,5),k2=R.int(2,6);mid=[p*k1,q*k1];k=k1*k2;total=k;
    }
    const small=[p,q],big=[p*k,q*k];
    return {type:'U02',level,mode,from:mode==='expand'?small:big,to:mode==='expand'?big:small,mid,k:total,avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    if(t.mid)h.append(el('p',{class:'q'},'Erst ',frac(t.from[0],t.from[1]),' = ',frac(t.mid[0],t.mid[1]),', dann ',frac(t.to[0],t.to[1]),'. Mit welcher Zahl wurde ',strong('insgesamt'),' erweitert?'));
    else h.append(el('p',{class:'q'},t.mode==='expand'?'Mit welcher Zahl wurde erweitert?':'Mit welcher Zahl wurde gekürzt?'));
  },
  render(view,host){
    const t=view.task;
    host.append(eq(frac(t.from[0],t.from[1]),t.mode==='expand'?'→':'→',frac(t.to[0],t.to[1])),
      el('p',null,t.mode==='expand'?'Erweiterungszahl: ':'Kürzungszahl: ',intInput(view,'k',t.mode==='expand'?'Erweiterungszahl':'Kürzungszahl')));
  },
  validate(t,d){
    const k=getInt(d,'k');if(k===null)return invalid('Trage eine ganze Zahl ein.');
    if(k===t.k)return right(`Richtig! Zähler und Nenner wurden mit derselben Zahl ${t.mode==='expand'?'multipliziert':'dividiert'}: ${t.k}.`);
    if(k<=1)return wrong('small','Die Zahl muss größer als 1 sein.');
    if(t.mode==='expand'){
      return wrong('wrongK',`Probe: Mit ${k} erhältst du ${t.from[0]*k} und ${t.from[1]*k} – das passt nicht zum Zielbruch.`);
    }
    if(t.from[0]%k!==0||t.from[1]%k!==0)return wrong('noDiv',`Probe: Zähler und Nenner lassen sich nicht beide durch ${k} teilen.`);
    return wrong('wrongK',`Probe: Mit ${k} erhältst du ${t.from[0]/k} und ${t.from[1]/k} – das ist nicht der Zielbruch.`);
  },
  solution(t){
    const out=[];
    if(t.mode==='expand'){
      out.push(line('Vergleiche Zähler mit Zähler und Nenner mit Nenner:'));
      out.push(line(`${t.from[0]} · ${t.k} = ${t.to[0]} und ${t.from[1]} · ${t.k} = ${t.to[1]}`));
      out.push(line('Erweiterungszahl: ',strong(t.k)));
    }else{
      out.push(line('Vergleiche Zähler mit Zähler und Nenner mit Nenner:'));
      out.push(line(`${t.from[0]} : ${t.k} = ${t.to[0]} und ${t.from[1]} : ${t.k} = ${t.to[1]}`));
      out.push(line('Kürzungszahl: ',strong(t.k)));
    }
    return out;
  },
  hints(t){return t.mode==='reduce'?withRules(HINT.factor):HINT.factor.map(x=>[x]);}
};

/* ---------- U03 Fehler finden und berichtigen ---------- */
const ERR_TEXT={
  onlyNum:'Nur der Zähler wurde verändert.',
  onlyDen:'Nur der Nenner wurde verändert.',
  diff:'Zähler und Nenner wurden mit verschiedenen Zahlen multipliziert bzw. geteilt.',
  add:'Zu Zähler und Nenner wurde etwas addiert, statt zu multiplizieren.',
  notFull:'Der Bruch ist noch nicht so weit wie möglich gekürzt.'
};
TASKS.U03={area:'Umkehraufgaben',name:'Fehler finden und berichtigen',desc:'Finde den Fehler im Rechenweg und gib die richtige Lösung an.',notes:['M2','M3'],size:5,
  gen(level,R){
    for(let tries=0;tries<50;tries++){
      let kind=R.pick(level===1?['expand','reduce']:['expand','reduce','notFull','twoStep']);
      let errType,shown,a,b,k,fix='op',intro=null;
      if(kind==='expand'){
        b=R.int(2,level===1?9:15);a=R.int(1,b-1);k=R.int(2,level===1?5:9);
        errType=R.pick(level===1?['onlyNum','onlyDen','diff']:['onlyNum','onlyDen','diff','add']);
        if(errType==='onlyNum')shown=[a*k,b];
        else if(errType==='onlyDen')shown=[a,b*k];
        else if(errType==='diff'){const k2=R.int(2,9);if(k2===k)continue;shown=[a*k,b*k2];}
        else{const m=R.int(1,5);shown=[a+m,b+m];}
      }else if(kind==='reduce'){
        k=R.int(2,level===1?5:9);const q=R.int(2,level===1?6:12),p=R.int(1,q-1);a=p*k;b=q*k;
        errType=R.pick(level===1?['onlyNum','onlyDen']:['onlyNum','onlyDen','diff']);
        if(errType==='onlyNum')shown=[p,b];
        else if(errType==='onlyDen')shown=[a,q];
        else{const k2=R.pick([2,3,4,5,6,7,8,9]);if(k2===k||b%k2!==0||a%k!==0)continue;shown=[a/k,b/k2];}
      }else if(kind==='notFull'){
        let p,q;do{q=R.int(3,12);p=R.int(1,q-1);}while(gcd(p,q)!==1);
        const g=R.pick([6,8,9,10,12]),f=smallestPrimeFactor(g);
        a=p*g;b=q*g;shown=[a/f,b/f];errType='notFull';fix='full';k=null;
        intro='so weit wie möglich gekürzt';
      }else{ /* twoStep: erster Schritt richtig, zweiter falsch */
        const q=R.int(2,8),p=R.int(1,q-1),k1=R.int(2,4);
        kind='expand';a=p*k1;b=q*k1;
        const k2=R.int(2,4);k=k2;errType=R.pick(['onlyNum','onlyDen']);
        const base=[p,q],mid=[p*k1,q*k1];
        shown=errType==='onlyNum'?[mid[0]*k2,mid[1]]:[mid[0],mid[1]*k2];
        return {type:'U03',level,kind,errType,fix:'op',a:mid[0],b:mid[1],k,shown,pre:base,avoid:[redKey(p,q)]};
      }
      if(equivalent(a,b,shown[0],shown[1]))continue;
      return {type:'U03',level,kind,errType,fix,a,b,k,shown,pre:null,intro,avoid:[redKey(a,b)]};
    }
    return {type:'U03',level,kind:'expand',errType:'onlyNum',fix:'op',a:4,b:6,k:2,shown:[8,6],pre:null,avoid:['2/3']};
  },
  prompt(t,h){
    if(t.fix==='full')h.append(el('p',{class:'q'},'So weit wie möglich kürzen: ',frac(t.a,t.b),' = ',frac(t.shown[0],t.shown[1]),'. Das ist falsch.'));
    else if(t.pre)h.append(el('p',{class:'q'},frac(t.pre[0],t.pre[1]),' = ',frac(t.a,t.b),' ist richtig. Dann noch mit ',strong(t.k),' erweitern – aber das Ergebnis ist falsch.'));
    else h.append(el('p',{class:'q'},frac(t.a,t.b),' mit ',strong(t.k),t.kind==='expand'?' erweitern':' kürzen',' – das Ergebnis ist falsch.'));
  },
  options(t){
    const order=['onlyNum','onlyDen','diff','add','notFull'];
    const pool=order.filter(o=>o!==t.errType&&(o!=='notFull'||t.errType==='notFull')&&(o!=='add'||t.kind==='expand'));
    let pick=pool.slice();
    /* feste Reihenfolge der Auswahl, damit sie beim Neuladen gleich bleibt */
    pick=pick.slice(0,3);
    return order.filter(o=>o===t.errType||pick.includes(o));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    host.append(el('div',{class:'wrongclaim'},eq('',frac(t.a,t.b),'=',frac(t.shown[0],t.shown[1]))));
    host.append(el('p',null,strong('1. Was ist falsch?')));
    const opts=el('div',{class:'opts',role:'radiogroup'});
    this.options(t).forEach(o=>{
      const r=el('input',{type:'radio',name:'err',value:o});
      r.checked=d.err===o;r.disabled=view.locked();
      r.addEventListener('change',()=>{d.err=o;view.save();});
      view.inputs['err'+o]=r;
      opts.append(el('label',{class:'opt'},r,el('span',null,ERR_TEXT[o])));
    });
    host.append(opts);
    host.append(el('p',null,strong('2. '),t.fix==='full'?'Kürze richtig so weit wie möglich:':(t.kind==='expand'?`Erweitere richtig mit ${t.k}:`:`Kürze richtig mit ${t.k}:`)));
    host.append(eq(frac(t.a,t.b),'=',fracInput(view,'r')));
  },
  validate(t,d){
    if(!d.err)return invalid('Wähle zuerst aus, welcher Fehler gemacht wurde.');
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const [en,ed]=t.fix==='full'?simplify(t.a,t.b):(t.kind==='expand'?[t.a*t.k,t.b*t.k]:[t.a/t.k,t.b/t.k]);
    const errOk=d.err===t.errType,fixOk=f.n===en&&f.d===ed;
    const marks={'r.n':f.n===en,'r.d':f.d===ed};
    if(errOk&&fixOk)return right('Richtig! Du hast den Fehler erkannt und berichtigt.');
    if(!errOk&&fixOk)return soft('errType','Die Verbesserung stimmt. Aber die Fehlerart ist noch nicht richtig. Vergleiche, was mit Zähler und Nenner passiert ist.',marks);
    if(errOk&&!fixOk){
      if(t.fix==='full'&&equivalent(t.a,t.b,f.n,f.d)&&!isFullyReduced(f.n,f.d))return soft('notFull','Die Fehlerart stimmt. Dein Bruch hat den richtigen Wert, du kannst aber noch weiter kürzen.',marks);
      return wrong('fix','Die Fehlerart stimmt. Die Verbesserung noch nicht: Rechne Zähler und Nenner einzeln.',marks);
    }
    return wrong('both','Das passt noch nicht. Prüfe die Fehlerart und rechne dann die richtige Lösung aus.',marks);
  },
  solution(t){
    const out=[line(strong('Fehler: '),ERR_TEXT[t.errType]),line('Richtig ist:')];
    if(t.fix==='full'){const [p,q]=simplify(t.a,t.b),g=gcd(t.a,t.b);out.push(eq(frac(t.a,t.b),'=',frac(t.a+' : '+g,t.b+' : '+g),'=',frac(p,q)));}
    else if(t.kind==='expand')out.push(eq(frac(t.a,t.b),'=',frac(t.a+' · '+t.k,t.b+' · '+t.k),'=',frac(t.a*t.k,t.b*t.k)));
    else out.push(eq(frac(t.a,t.b),'=',frac(t.a+' : '+t.k,t.b+' : '+t.k),'=',frac(t.a/t.k,t.b/t.k)));
    out.push(line('Beim Erweitern und Kürzen muss mit Zähler und Nenner dieselbe Rechnung gemacht werden, dann bleibt der Wert gleich.'));
    return out;
  },
  hints(t){return (t.kind==='reduce'||t.fix==='full')?withRules(HINT.error):HINT.error.map(x=>[x]);}
};

/* ---------- B01 Bruchbilder verändern ---------- */
TASKS.B01={area:'Grundlagen',name:'Bruchbilder verändern',desc:'Teile ein Bild feiner ein und färbe denselben Anteil.',notes:['M1','M2','M3'],size:5,
  gen(level,R){
    if(level===1){
      const kind=R.pick(['strip','circle']),b=R.pick([2,3,4,5,6]),a=R.int(1,b-1);
      const k=R.pick([2,3].filter(x=>b*x<=12));
      return {type:'B01',level,kind,a,b,k,target:b*k,fill:scatterFill(a,b,kind,R,{pClassic:0.3}),avoid:[redKey(a,b)]};
    }
    const dims=R.pick([[2,3],[2,4],[3,3],[2,5],[3,4],[2,6]]),b=dims[0]*dims[1],a=R.int(1,b-1);
    let minTotal=b*R.pick([2,3]);
    const solvable=(m)=>{for(let r=1;r<=10;r++)for(let c=1;c<=10;c++)if(r*c>=m&&(r*c*a)%b===0)return true;return false;};
    while(!solvable(minTotal)&&minTotal>b)minTotal--;
    return {type:'B01',level,kind:'grid',a,b,rows0:dims[0],cols0:dims[1],minTotal,fill:scatterFill(a,b,'grid',R,{pClassic:0.1}),avoid:[redKey(a,b)]};
  },
  prompt(t,h){
    if(t.level===1)h.append(el('p',{class:'q'},'Zeige ',frac(t.a,t.b),' mit ',strong(t.target),' Teilen: färbe die passenden Teile.'));
    else h.append(el('p',{class:'q'},'Zeige ',frac(t.a,t.b),' mit mindestens ',strong(t.minTotal),' Feldern. Wähle Zeilen und Spalten, färbe und schreibe den Bruch.'));
  },
  render(view,host){
    const t=view.task,d=view.draft,L1=t.level===1;
    if(L1){if(d.parts==null)d.parts=t.target;}
    else if(d.rows==null){d.rows=t.rows0;d.cols=t.cols0;}
    d.col=d.col||[];
    const total=()=>L1?d.parts:d.rows*d.cols;
    const origFig=L1?drawMode(t.kind,t.a,t.b,{label:'Vorgabe',maxW:130,fill:t.fill}):drawFractionGrid(t.a,t.b,t.rows0,t.cols0,{label:'Vorgabe',maxW:130,fill:t.fill});
    const orig=el('figure',{class:'fig'},origFig,dimCap(t.b+' Teile'),el('figcaption',null,frac(t.a,t.b)));
    const editBox=el('div'),steppers=[],info=el('div',{class:'q bigline'});
    const updInfo=()=>{
      info.replaceChildren(...(L1?['Dein Bild: ',frac(d.col.length,total())]:['Gefärbt: ',strong(d.col.length),' von ',strong(total()),' Feldern']));
      steppers.forEach(s=>s.upd());
    };
    const redraw=()=>{
      editBox.replaceChildren();
      const n=total(),opts={onToggle:i=>{
        if(view.locked())return; /* gesperrt: Zelle behält ihre Farbe */
        const j=d.col.indexOf(i);if(j>=0)d.col.splice(j,1);else d.col.push(i);
        view.save();updInfo();return j<0;
      },label:'Dein Bild',filled:new Set(d.col),maxW:320};
      editBox.append(L1?drawMode(t.kind,0,n,opts):drawFractionGrid(0,n,d.rows,d.cols,opts),dimCap(L1?n+' Teile':d.rows+' × '+d.cols+' = '+n+' Felder'));
      updInfo();
    };
    const controls=el('div',{class:'controls'});
    if(!L1){
      const chg=()=>{d.col=[];view.save();redraw();};
      steppers.push(stepper(view,'Zeilen',()=>d.rows,v=>{d.rows=v;chg();},1,10));
      steppers.push(stepper(view,'Spalten',()=>d.cols,v=>{d.cols=v;chg();},1,10));
    }
    steppers.push(stepper(view,'Gefärbt',()=>d.col.length,v=>{
      if(v>d.col.length){for(let i=0;i<total()&&d.col.length<v;i++)if(!d.col.includes(i))d.col.push(i);}
      else d.col.pop();
      view.save();redraw();
    },0,()=>total()));
    steppers.forEach(s=>controls.append(s));
    const reset=el('button',{type:'button',class:'btn small'},icon('neu'),'Neu färben');
    reset.addEventListener('click',()=>{if(view.locked())return;d.col=[];view.save();redraw();});
    view.inputs.reset=reset;controls.append(reset);
    host.append(el('div',{class:'figpair'},orig,el('div',{class:'edit fig erw'},editBox,el('div',{class:'cap'},'Tippe zum Färben'))),info,controls);
    if(!L1)host.append(el('div',{class:'eq'},'Dein Bruch:',fracInput(view,'r')));
    redraw();
  },
  validate(t,d){
    const L1=t.level===1;
    const parts=L1?(d.parts==null?t.target:d.parts):(d.rows==null?t.rows0*t.cols0:d.rows*d.cols);
    const m=(d.col||[]).length;
    if(L1&&parts!==t.target)return wrong('parts',`Das Bild soll ${t.target} gleich große Teile haben.`);
    if(!L1&&parts<t.minTotal)return wrong('parts',`Es sollen mindestens ${t.minTotal} Felder sein. Ändere Zeilen oder Spalten.`);
    if(m===0)return wrong('nocolor','Färbe zuerst Teile ein: tippe sie an.');
    if(m*t.b!==t.a*parts)return wrong('area',`Du hast ${m} von ${parts} Teilen gefärbt. Das ist nicht derselbe Anteil wie in der Vorgabe.`);
    if(L1)return right('Richtig! Mehr Teile, aber derselbe Anteil.');
    const f=getFrac(d,'r');if(!f)return invalid('Trage noch den Bruch ein, den dein Bild zeigt.');
    if(f.n!==m||f.d!==parts)return wrong('fraction','Dein Bild und dein Bruch passen nicht zusammen.',{'r.n':f.n===m,'r.d':f.d===parts});
    return right('Richtig! Mehr Felder, aber derselbe Anteil.');
  },
  solution(t){
    let n,m,svg;
    if(t.level===1){
      /* Jedes gefärbte alte Teil i wird zu den k gefärbten neuen Teilen i·k … i·k+k−1 */
      n=t.target;m=t.a*t.k;
      const ref=new Set();fillOf(t.a,t.b,{fill:t.fill}).forEach(i=>{for(let j=0;j<t.k;j++)ref.add(i*t.k+j);});
      svg=drawMode(t.kind,m,n,{label:'Lösung',filled:ref});
    }
    else{
      let best=null;
      for(let r=1;r<=10;r++)for(let c=1;c<=10;c++)if(r*c>=t.minTotal&&(r*c*t.a)%t.b===0&&(!best||r*c<best[0]*best[1]))best=[r,c];
      n=best[0]*best[1];m=n*t.a/t.b;svg=drawFractionGrid(m,n,best[0],best[1],{label:'Lösung'});
    }
    const k=n/t.b;
    return [line('Aus jedem alten Teil entstehen '+k+' neue Teile. Auch die gefärbten Teile werden mit '+k+' vervielfacht:'),
      eq(frac(t.a,t.b),'=',frac(t.a+' · '+k,t.b+' · '+k),'=',frac(m,n)),svg];
  },
  hints(t){return HINT.picture.map(x=>[x]);}
};

/* ---------- O01 Bruchfamilien ---------- */
TASKS.O01={area:'Offene Aufgaben',name:'Bruchfamilien',desc:'Gib mehrere verschiedene Brüche mit demselben Wert an.',notes:['M1','M2'],size:5,
  gen(level,R){
    let p,q;
    do{q=level===1?R.int(2,7):R.int(3,12);p=R.int(1,q-1);}while(gcd(p,q)!==1);
    const t={type:'O01',level,p,q,need:4,avoid:[redKey(p,q)]};
    if(level===2){
      t.den=q*R.int(4,9);
      t.numMin=p*R.int(6,12);
    }
    return t;
  },
  prompt(t,h){
    h.append(el('p',{class:'q'},`Gib ${t.need} verschiedene Brüche an, die denselben Wert haben wie `,frac(t.p,t.q),'.'));
    if(t.level===2)h.append(el('ul',{class:'cond'},el('li',null,'Mindestens ein Bruch hat den Nenner ',strong(t.den),'.'),el('li',null,'Mindestens ein Bruch hat einen Zähler größer als ',strong(t.numMin),'.')));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    if(d.rows==null)d.rows=t.need;
    const list=el('div'),btns=el('div',{class:'rowbtns'});
    const draw=()=>{
      list.replaceChildren();
      for(let i=0;i<d.rows;i++){
        const row=el('div',{class:'famrow'},el('span',{class:'tag'},(i+1)+'.'),fracInput(view,'x'+i));
        list.append(row);
      }
    };
    const add=el('button',{type:'button',class:'btn small'},'Bruch hinzufügen');
    const rem=el('button',{type:'button',class:'btn small'},'Letzten Bruch entfernen');
    add.addEventListener('click',()=>{if(view.locked()||d.rows>=10)return;d.rows++;view.save();draw();updB();});
    rem.addEventListener('click',()=>{if(view.locked()||d.rows<=1)return;const i=d.rows-1;delete d['x'+i+'.n'];delete d['x'+i+'.d'];d.rows--;view.save();draw();updB();});
    const updB=()=>{add.disabled=view.locked()||d.rows>=10;rem.disabled=view.locked()||d.rows<=1;};
    view.inputs.add=add;view.inputs.rem=rem;
    btns.append(add,rem);host.append(list,btns);draw();updB();
  },
  validate(t,d){
    const rows=d.rows==null?t.need:d.rows,seen=new Set(),marks={},issues=[];
    let good=0,anyFilled=false,hasDen=false,hasNum=false,badRows=0;
    for(let i=0;i<rows;i++){
      const n=d['x'+i+'.n'],dd=d['x'+i+'.d'];
      if((n==null||n==='')&&(dd==null||dd==='')){continue;}
      anyFilled=true;
      const f=getFrac(d,'x'+i);
      if(!f){badRows++;issues.push(`Zeile ${i+1}: Trage zwei ganze Zahlen ein.`);marks['x'+i+'.n']=false;marks['x'+i+'.d']=false;continue;}
      const key=f.n+'/'+f.d;
      if(f.n===t.p&&f.d===t.q){badRows++;issues.push(`Zeile ${i+1}: Das ist der gegebene Bruch.`);marks['x'+i+'.n']=false;marks['x'+i+'.d']=false;continue;}
      if(!equivalent(t.p,t.q,f.n,f.d)){badRows++;issues.push(`Zeile ${i+1}: Dieser Bruch hat einen anderen Wert.`);marks['x'+i+'.n']=false;marks['x'+i+'.d']=false;continue;}
      if(seen.has(key)){badRows++;issues.push(`Zeile ${i+1}: Diesen Bruch hast du schon angegeben.`);marks['x'+i+'.n']=false;marks['x'+i+'.d']=false;continue;}
      seen.add(key);good++;marks['x'+i+'.n']=true;marks['x'+i+'.d']=true;
      if(t.den&&f.d===t.den)hasDen=true;
      if(t.numMin&&f.n>t.numMin)hasNum=true;
    }
    if(!anyFilled)return invalid('Trage mindestens einen Bruch ein.');
    if(t.den&&!hasDen)issues.push(`Es fehlt ein Bruch mit dem Nenner ${t.den}.`);
    if(t.numMin&&!hasNum)issues.push(`Es fehlt ein Bruch mit einem Zähler größer als ${t.numMin}.`);
    if(good<t.need)issues.push(`${good} von ${t.need} verschiedenen Brüchen gefunden.`);
    if(!issues.length)return right('Richtig! Jeder dieser Brüche entsteht durch Erweitern und hat denselben Wert.');
    return (badRows?wrong:soft)('family',issues.join(' '),marks);
  },
  solution(t){
    const out=[line('Mögliche Lösungen (du kannst mit jeder Erweiterungszahl neue Brüche bilden):')];
    [2,3,4,5].forEach(k=>out.push(eq(frac(t.p,t.q),'=',frac(t.p+' · '+k,t.q+' · '+k),'=',frac(t.p*k,t.q*k))));
    if(t.den){const k=t.den/t.q;out.push(line('Mit Nenner '+t.den+': ',frac(t.p*k,t.den),' (Erweiterungszahl '+k+')'));}
    if(t.numMin){const k=Math.floor(t.numMin/t.p)+1;out.push(line('Mit Zähler größer als '+t.numMin+': ',frac(t.p*k,t.q*k),' (Erweiterungszahl '+k+')'));}
    return out;
  },
  hints(t){return HINT.family.map(x=>[x]);}
};

/* ---------- O02 Kürzen-Maschine (verschiedene Rechenwege) ---------- */
function pathFraction(a,b,ks){let n=a,d=b;for(const k of ks){n/=k;d/=k;}return [n,d];}
TASKS.O02={area:'Offene Aufgaben',name:'Kürzen-Maschine',desc:'Kürze auf zwei verschiedenen Wegen.',notes:['M3'],size:5,
  gen(level,R){
    let p,q;
    do{q=level===1?R.int(2,7):R.int(5,13);p=R.int(1,q-1);}while(gcd(p,q)!==1);
    const g=level===1?R.pick([6,10,12,15]):R.pick([12,18,24,30,36,42,60]);
    return {type:'O02',level,a:p*g,b:q*g,p,q,mode:level===1?'target':'full',avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    h.append(el('p',{class:'q'},'Kürze ',frac(t.a,t.b),' auf ',strong('zwei verschiedenen Wegen'),t.mode==='target'?[' bis ',frac(t.p,t.q),'.']:' so weit wie möglich.'));
  },
  render(view,host){
    const t=view.task,d=view.draft;
    d.paths=d.paths||[];d.cur=d.cur||[];
    const chips=t.level===1?[2,3,4,5,6,7,9,10]:[2,3,4,5,6,7,8,9,10,11,12,13];
    const box=el('div',{class:'machine'});
    const msg=el('div',{class:'machsg','aria-live':'polite'});
    const rebuild=()=>{
      const [n,m]=pathFraction(t.a,t.b,d.cur);
      const done=isFullyReduced(n,m);
      const row=el('div',{class:'chiprow'});
      chips.forEach(k=>{
        const b=el('button',{type:'button',class:'chip','aria-label':'Kürzen mit '+k},'÷'+k);
        b.disabled=view.locked()||done||d.paths.length>=2;
        b.addEventListener('click',()=>{
          if(view.locked())return;
          if(!canReduce(n,m,k)){
            msg.className='machsg bad';msg.textContent='Mit '+k+' geht das nicht: Zähler und Nenner müssen beide durch '+k+' teilbar sein.';
            b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return;
          }
          d.cur.push(k);
          const [n2,m2]=pathFraction(t.a,t.b,d.cur);
          if(isFullyReduced(n2,m2)){
            d.paths.push(d.cur.slice());d.cur=[];
            msg.className='machsg ok';msg.textContent=d.paths.length<2?'Weg '+d.paths.length+' geschafft! Jetzt ein anderer Weg mit anderen Kürzungszahlen.':'Beide Wege geschafft! Tippe auf „Prüfen“.';
          }else{msg.className='machsg';msg.textContent='';}
          view.save();rebuild();
        });
        view.inputs['chip'+k]=b;row.append(b);
      });
      const hist=(ks)=>ks.length?ks.map(k=>'÷'+k).join('  ›  '):'–';
      const undo=el('button',{type:'button',class:'btn small'},icon('neu'),'Weg neu starten');
      undo.disabled=view.locked()||!d.cur.length;
      undo.addEventListener('click',()=>{d.cur=[];msg.textContent='';view.save();rebuild();});
      view.inputs.undo=undo;
      box.replaceChildren(
        el('div',{class:'machhead'},d.paths.length>=2?'Fertig!':'Weg '+(d.paths.length+1)+' von 2'),
        el('div',{class:'eq machfrac'},frac(n,m)),
        el('div',{class:'machhist'},'Deine Schritte: ',hist(d.cur)),
        row,msg,
        ...d.paths.map((ks,i)=>el('div',{class:'machdone'},icon('haken'),'Weg '+(i+1)+': '+hist(ks))),
        undo);
    };
    host.append(box);rebuild();
  },
  validate(t,d){
    const paths=d.paths||[];
    if(paths.length<2)return invalid('Finde noch '+(2-paths.length===2?'zwei Wege':'einen zweiten Weg')+'. Tippe die Kürzungszahlen.');
    if(paths[0].join(',')===paths[1].join(','))return wrong('same','Beide Wege nutzen dieselben Kürzungszahlen. Suche einen anderen Weg.');
    return right('Richtig! Zwei verschiedene Wege, dasselbe Ergebnis.');
  },
  solution(t){
    const g=gcd(t.a,t.b),f=smallestPrimeFactor(g);
    return [line('Weg 1: in einem Schritt mit '+g+':'),eq(frac(t.a,t.b),'=',frac(t.a+' : '+g,t.b+' : '+g),'=',frac(t.p,t.q)),
      line('Weg 2: erst mit '+f+', dann mit '+(g/f)+':'),eq(frac(t.a,t.b),'=',frac(t.a/f,t.b/f),'=',frac(t.p,t.q)),
      line('Die 2 geht immer, wenn Zähler und Nenner gerade sind.')];
  },
  hints(t){return withRules(HINT.ways);}
};

/* ---------- D01 Dezimalbruch -> Dezimalzahl ---------- */
TASKS.D01={area:'Darstellungen umwandeln',name:'Dezimalbruch → Dezimalzahl',desc:'Schreibe Brüche mit Nenner 10, 100, 1000 als Dezimalzahl.',notes:['M4'],size:5,
  gen(level,R){
    const places=level===1?R.pick([1,1,2,2,2]):R.pick([2,3,3,3,4]);
    const den=Math.pow(10,places);
    let n;
    if(level===1)n=R.chance(0.2)?R.int(den+1,2*den-1):R.int(1,den-1);
    else n=R.chance(0.35)?R.int(den+1,3*den-1):R.int(1,den-1);
    if(n%10===0)n+=R.int(1,9);
    if(level===2&&places>=3&&R.chance(0.3))n=R.int(1,9)*Math.pow(10,places-1)+R.int(1,9);
    return {type:'D01',level,n,den,avoid:[n+'/'+den,decOf(n,places)]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Schreibe ',frac(t.n,t.den),' als Dezimalzahl.'));},
  render(view,host){const t=view.task;host.append(eq(frac(t.n,t.den),'=',decInput(view,'dec')));},
  validate(t,d){
    const p=parseGermanDecimal(d.dec);
    if(!p)return invalid('Gib eine Dezimalzahl mit Komma ein, zum Beispiel 0,25.');
    const places=Math.round(Math.log10(t.den));
    if(p.num*t.den===t.n*p.den){
      return right(p.places===places?'Richtig! Der Nenner zeigt, wie viele Stellen nach dem Komma gebraucht werden.':'Richtig! (Die Null am Ende wäre nicht nötig.)');
    }
    const strip=s=>s.replace(/^0+/,'');
    if(strip(String(p.num))===strip(String(t.n))&&p.places!==places)return wrong('commaPlaces','Prüfe noch einmal die Anzahl der Stellen nach dem Komma.');
    return wrong('other','Das passt noch nicht. Achte auf den Nenner und die Stellen nach dem Komma.');
  },
  solution(t){
    const places=Math.round(Math.log10(t.den));
    return [line(`Der Nenner ${t.den} bedeutet: ${places} Stelle${places>1?'n':''} nach dem Komma.`),eq(frac(t.n,t.den),'=',el('span',null,decOf(t.n,places)))];
  },
  hints(t){return HINT.d1.map(x=>[x]);}
};

/* ---------- D02 Dezimalzahl -> Dezimalbruch ---------- */
TASKS.D02={area:'Darstellungen umwandeln',name:'Dezimalzahl → Dezimalbruch',desc:'Schreibe Dezimalzahlen als Bruch mit vorgegebenem Nenner.',notes:['M5'],size:5,
  gen(level,R){
    const places=level===1?R.pick([1,2,2]):R.pick([3,3,4,2]);
    const den=Math.pow(10,places);
    let n=level===1?R.int(1,den-1):(R.chance(0.35)?R.int(den+1,3*den-1):R.int(1,den-1));
    if(level===1&&n%10===0)n++;
    if(level===2&&!R.chance(0.2)&&n%10===0)n++;
    const s=decOf(n,places);
    return {type:'D02',level,n,den,places,s,avoid:[s,n+'/'+den]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Schreibe ',strong(t.s),' als Bruch mit dem Nenner ',strong(t.den),'.'));},
  render(view,host){const t=view.task;host.append(eq(el('span',null,t.s),'=',fracInput(view,'r')));},
  validate(t,d){
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const marks={'r.n':f.n===t.n,'r.d':f.d===t.den};
    if(f.n===t.n&&f.d===t.den)return right(`Richtig! ${t.places} Stelle${t.places>1?'n':''} nach dem Komma ergibt den Nenner ${t.den}.`,[t.n,t.den]);
    if(equivalent(f.n,f.d,t.n,t.den))return soft('wrongDen',`Der Wert stimmt, aber der Nenner soll ${t.den} sein.`,marks);
    if(f.n===t.n)return wrong('commaPlaces','Prüfe noch einmal die Anzahl der Stellen nach dem Komma.',marks);
    return wrong('other','Das passt noch nicht. Der Zähler enthält die Zahl ohne Komma.',marks);
  },
  solution(t){
    return [line(`${t.places} Stelle${t.places>1?'n':''} nach dem Komma → Nenner ${t.den}. Der Zähler ist die Zahl ohne Komma.`),eq(el('span',null,t.s),'=',frac(t.n,t.den))];
  },
  hints(t){return HINT.d2.map(x=>[x]);}
};

/* ---------- D03 Gemischte Schreibweise -> gemeiner Bruch ---------- */
TASKS.D03={area:'Darstellungen umwandeln',name:'Gemischte Schreibweise → gemeiner Bruch',desc:'Schreibe gemischte Zahlen als gemeinen Bruch.',notes:['M6'],size:5,
  gen(level,R){
    let w,n,d;
    if(level===1){do{d=R.int(2,8);n=R.int(1,d-1);}while(gcd(n,d)!==1);w=R.int(1,4);}
    else{do{d=R.int(3,19);n=R.int(1,d-1);w=R.int(5,25);}while(gcd(n,d)!==1||w*d+n>300);}
    return {type:'D03',level,w,n,d,avoid:[w+' '+n+'/'+d,redKey(n,d)]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Schreibe ',mixed(t.w,t.n,t.d),' als gemeinen Bruch. Der Nenner ',strong(t.d),' bleibt gleich.'));},
  render(view,host){
    const t=view.task,box=[eq(mixed(t.w,t.n,t.d),'=',fracInput(view,'r'))];
    if(t.level===1){
      const figs=[];
      for(let i=0;i<t.w;i++)figs.push(drawFractionStrip(t.d,t.d,{maxW:140,label:'Ganzes'}));
      figs.push(drawFractionStrip(t.n,t.d,{maxW:140,label:'Bruchteil'}));
      box.push(el('div',{class:'figrow',style:'display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.625rem'},figs.map(f=>el('div',{style:'width:8.75rem'},f))));
    }
    host.append(...box);
  },
  validate(t,d){
    const f=getFrac(d,'r');if(!f)return invalid(MSG_FRAC_INVALID);
    const [en,ed]=mixedToFraction(t.w,t.n,t.d),marks={'r.n':f.n===en,'r.d':f.d===ed};
    if(f.n===en&&f.d===ed)return right('Richtig! Ganze · Nenner + Zähler ergibt den neuen Zähler, der Nenner bleibt gleich.',[en,ed]);
    if(f.d!==t.d&&equivalent(en,ed,f.n,f.d))return soft('denChanged',`Der Wert stimmt. Der Nenner soll aber gleich bleiben (${t.d}).`,marks);
    if(f.n===t.n)return wrong('noWhole','Denke auch an die ganzen Teile.',marks);
    if(f.d===t.d)return wrong('numerator','Rechne Ganze · Nenner + Zähler: Die Ganzen müssen zuerst in Bruchteile umgerechnet werden.',marks);
    return wrong('other','Das passt noch nicht. Der Nenner bleibt gleich, der Zähler wird neu berechnet.',marks);
  },
  solution(t){
    return [line(`${t.w} Ganze sind ${t.w} · ${t.d} = ${t.w*t.d} Bruchteile (Teile mit Nenner ${t.d}).`),
      eq(mixed(t.w,t.n,t.d),'=',frac(`${t.w} · ${t.d} + ${t.n}`,t.d),'=',frac(t.w*t.d+t.n,t.d))];
  },
  hints(t){return HINT.mixed.map(x=>[x]);}
};


/* ---------- G04 Kürzen so weit wie möglich (auch „nicht kürzbar“) ---------- */
TASKS.G04=Object.assign({},TASKS.G03,{name:'Kürzen so weit wie möglich',desc:'Kürze so weit wie möglich – manchmal geht es nicht mehr!',size:5,
  gen(level,R){
    let p,q;
    const improper=level===2&&R.chance(0.2);
    do{q=level===1?R.int(2,9):R.int(3,19);p=improper?R.int(q+1,2*q):R.int(1,q-1);}while(gcd(p,q)!==1);
    if(R.chance(0.2))return {type:'G04',level,mode:'full',a:p,b:q,p,q,irreducible:true,avoid:[redKey(p,q)]};
    const g=level===1?R.pick([2,3,4,5,6,8,10]):R.int(6,24);
    return {type:'G04',level,mode:'full',a:p*g,b:q*g,p,q,avoid:[redKey(p,q)]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Kürze ',frac(t.a,t.b),' so weit wie möglich. ',el('small',null,'(Manchmal geht es nicht mehr.)')));},
  render(view,host){
    const t=view.task,d=view.draft;
    const none=el('button',{type:'button',class:'btn none','aria-pressed':String(!!d.none)},icon('stopp'),'Nicht kürzbar');
    none.disabled=view.locked();
    /* Entweder einen Bruch eintippen oder „Nicht kürzbar“ wählen – beides zugleich gibt es nicht */
    none.addEventListener('click',()=>{
      if(view.locked())return;
      d.none=!d.none;
      if(d.none)['r.n','r.d'].forEach(k=>{delete d[k];const i=view.inputs[k];if(i){i.value='';i.classList.remove('bad','good');}});
      none.setAttribute('aria-pressed',String(!!d.none));view.save();
    });
    const fi=fracInput(view,'r');
    ['r.n','r.d'].forEach(k=>view.inputs[k].addEventListener('input',()=>{
      if(d.none){d.none=false;none.setAttribute('aria-pressed','false');view.save();}
    }));
    view.inputs.none=none;
    host.append(eq(frac(t.a,t.b),'=',fi),el('div',{class:'rowbtns'},none));
  },
  validate(t,d){
    const f0=getFrac(d,'r');
    if(d.none&&!f0){
      if(t.irreducible)return right('Richtig! Zähler und Nenner haben keine gemeinsame Zahl außer 1. Der Bruch ist schon so weit wie möglich gekürzt.');
      return wrong('stillReducible','Doch, hier geht noch etwas: Suche eine Zahl, durch die Zähler und Nenner teilbar sind.');
    }
    const f=f0;if(!f)return invalid('Trage zwei Zahlen ein – oder tippe „Nicht kürzbar“.');
    if(t.irreducible&&f.n===t.a&&f.d===t.b)return right('Richtig! Dieser Bruch lässt sich nicht weiter kürzen.');
    return TASKS.G03.validate(t,d);
  },
  solution(t){
    if(t.irreducible)return [line('Zähler und Nenner haben keinen gemeinsamen Teiler außer 1:'),eq(frac(t.a,t.b),'  →  nicht kürzbar')];
    return TASKS.G03.solution(t);
  },
  hints(t){
    const h=withRules(HINT.reduce);
    h[1]=h[1].concat(['Achtung: Manchmal geht es nicht mehr. Dann tippe „Nicht kürzbar“.']);
    return h;
  }
});

/* ---------- V01 Tresortür (nur im Bruch-Tresor) ---------- */
/* Der Code-Bruch a/b entsteht aus einem gekürzten Bruch p/q und einer Zahl g (a = p·g, b = q·g).
   Leicht: Zähler einstellig, Nenner zweistellig bis 60 (3 Ziffern). Knifflig: beide zweistellig, Teiler ab 6 und nicht 10 oder 20 (4 Ziffern). */
function vaultCode(level,R){
  const combos={},add=(g,p,q)=>(combos[g]=combos[g]||[]).push([p,q,g]);
  if(level===1){
    for(let g=2;g<=9;g++)for(let p=1;p*g<=9;p++)for(let q=p+1;q*g<=60;q++)if(q*g>=10&&gcd(p,q)===1)add(g,p,q);
  }else{
    for(let g=6;g<=24;g++)if(g%10)for(let p=1;p*g<=99;p++)for(let q=Math.max(3,p+1);q*g<=99;q++)if(p*g>=10&&gcd(p,q)===1)add(g,p,q);
  }
  const [p,q,g]=R.pick(combos[R.pick(Object.keys(combos))]);
  return {a:p*g,b:q*g,p,q,g};
}
TASKS.V01=Object.assign({},TASKS.G03,{area:'Spiele',name:'Tresortür',desc:'Kürze den Code-Bruch so weit wie möglich.',notes:['M3'],size:1,
  gen(level,R){const c=vaultCode(level,R);return {type:'V01',level,mode:'full',a:c.a,b:c.b,p:c.p,q:c.q,avoid:[]};},
  prompt(t,h){h.append(el('p',{class:'q'},'Der Code-Bruch ist ',frac(t.a,t.b),'. Der Tresor nimmt nur den Bruch, der sich nicht weiter kürzen lässt.'));}
});

/* ---------- T01 Teilbarkeit ---------- */
function digitSum(n){return String(n).split('').reduce((s,c)=>s+Number(c),0);}
function divisible(n,k){return n%k===0;}
const DIV_RULE={
  2:'Durch 2 teilbar: Die letzte Ziffer ist 0, 2, 4, 6 oder 8 (gerade Zahlen gehen IMMER).',
  3:'Durch 3 teilbar: Die Quersumme (alle Ziffern addieren) ist durch 3 teilbar.',
  4:'Durch 4 teilbar: Die letzten zwei Ziffern bilden eine Zahl, die durch 4 teilbar ist.',
  5:'Durch 5 teilbar: Die letzte Ziffer ist 0 oder 5.',
  6:'Durch 6 teilbar: Die Zahl ist durch 2 und durch 3 teilbar.',
  9:'Durch 9 teilbar: Die Quersumme ist durch 9 teilbar.',
  10:'Durch 10 teilbar: Die letzte Ziffer ist 0.'
};
/* Erklärung mit konkreter Rechnung (als Text-Zeilen) */
function divExplain(n,k){
  const last=n%10,ds=digitSum(n),sum=String(n).split('').join(' + ');
  const yn=(ok)=>ok?'ja':'nein';
  switch(k){
    case 2:return ['Letzte Ziffer von '+n+': '+last+' → '+(last%2===0?'gerade':'ungerade')+'.'];
    case 5:return ['Letzte Ziffer von '+n+': '+last+' → '+(last===0||last===5?'0 oder 5':'weder 0 noch 5')+'.'];
    case 10:return ['Letzte Ziffer von '+n+': '+last+' → '+(last===0?'0':'nicht 0')+'.'];
    case 3:case 9:return ['Quersumme: '+sum+' = '+ds+'.',ds+' ist '+(ds%k===0?'':'nicht ')+'durch '+k+' teilbar.'];
    case 4:{const l2=n%100;return ['Letzte zwei Ziffern: '+l2+'.',l2+' : 4 '+(l2%4===0?'geht auf ('+(l2/4)+').':'geht nicht auf.')];}
    case 6:return ['Durch 2? Letzte Ziffer '+last+' → '+yn(n%2===0)+'.','Durch 3? Quersumme '+sum+' = '+ds+' → '+yn(ds%3===0)+'.','Beides nötig: '+(n%6===0?'ja':'nein')+'.'];
  }
  return [];
}
TASKS.T01={area:'Grundlagen',name:'Teilbarkeit',desc:'Blitzcheck: Geht das Kürzen mit 2, 3, 4, 5, 6, 9 oder 10?',notes:['M7','M3'],size:8,
  gen(level,R){
    const k=R.pick([2,3,4,5,6,9,10]);
    const yes=R.chance(0.5);
    let n,tries=0;
    do{n=level===1?R.int(12,500):R.int(100,1000);tries++;}while(divisible(n,k)!==yes&&tries<400);
    return {type:'T01',level,n,k,avoid:[]};
  },
  prompt(t,h){h.append(el('p',{class:'q'},'Ist ',strong(t.n),' durch ',strong(t.k),' teilbar?'));},
  render(view,host){
    const d=view.draft,row=el('div',{class:'yesno'});
    [['ja','haken','Ja'],['nein','kreuz','Nein']].forEach(([v,ic,label])=>{
      const b=el('button',{type:'button',class:'btn yn','aria-pressed':String(d.ans===v)},icon(ic),label);
      b.disabled=view.locked();
      b.addEventListener('click',()=>{
        if(view.locked())return;
        d.ans=v;view.save();
        row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        if(view.submit)view.submit();
      });
      view.inputs['yn'+v]=b;row.append(b);
    });
    host.append(row);
  },
  validate(t,d){
    if(!d.ans)return invalid('Tippe auf Ja oder Nein.');
    const truth=divisible(t.n,t.k)?'ja':'nein',ex=divExplain(t.n,t.k).join(' ');
    if(d.ans===truth)return right('Richtig! '+ex);
    return wrong('div','Nicht ganz. '+DIV_RULE[t.k]+' '+ex);
  },
  solution(t){
    return [line(strong('Regel: '),DIV_RULE[t.k]),...divExplain(t.n,t.k).map(x=>line(x)),line(strong(t.n+(divisible(t.n,t.k)?' ist durch ':' ist nicht durch ')+t.k+' teilbar.'))];
  },
  hints(t){return [['Schau dir die Ziffern an.'],[DIV_RULE[t.k]]];}
};

/* ---------- G05 Erweitern und Kürzen gemischt ---------- */
TASKS.G05={area:'Grundlagen',name:'Erweitern und Kürzen gemischt',desc:'Mal erweitern, mal kürzen – entscheide selbst.',notes:['M2','M3'],size:5,
  gen(level,R){
    const two=R.chance(level===1?0.3:0.5);
    if(two){
      let p,q;do{q=R.int(2,level===1?6:11);p=R.int(1,q-1);}while(gcd(p,q)!==1);
      const m=R.pick(level===1?[2,3]:[2,3,4,5,6]);
      let k;do{k=R.int(2,level===1?4:9);}while(k%m===0);
      return {type:'G05',level,mode:'twostep',a:p*m,b:q*m,k,m,avoid:[redKey(p,q)]};
    }
    let p,q;do{q=R.int(2,level===1?7:13);p=R.int(1,q-1);}while(gcd(p,q)!==1);
    const g=level===1?R.pick([2,3,4]):R.pick([2,3,4,5,6,8,9]);
    const a=p*g,b=q*g;
    let N;
    if(R.chance(0.5)){N=b*R.int(2,level===1?4:7);}
    else{const hs=[2,3,4,5,6,8,9].filter(h=>g%h===0);N=b/R.pick(hs);}
    return {type:'G05',level,mode:'denom',a,b,N,avoid:[redKey(p,q)]};
  },
  prompt(t,h){
    h.append(t.mode==='denom'?el('p',{class:'q'},'Bringe ',frac(t.a,t.b),' auf den Nenner ',strong(t.N),'.')
      :el('p',{class:'q'},frac(t.a,t.b),': erst mit ',strong(t.k),' erweitern, dann mit ',strong(t.m),' kürzen.'));
  },
  render(view,host){
    const t=view.task;
    if(t.mode==='denom')host.append(eq(frac(t.a,t.b),'=',el('span',{class:'frac inp'},el('span',{class:'num'},intInput(view,'r.n','fehlender Zähler')),el('span',{class:'den'},String(t.N)))));
    else host.append(eq(frac(t.a,t.b),'=',fracInput(view,'r1'),'=',fracInput(view,'r2')));
  },
  validate(t,d){
    if(t.mode==='denom'){
      const n=getInt(d,'r.n');if(n===null)return invalid('Trage eine ganze Zahl ein.');
      const en=t.a*t.N/t.b;
      if(n===en)return right(t.N>t.b?`Richtig! Der Nenner wurde mit ${t.N/t.b} multipliziert, also auch der Zähler: es wurde erweitert.`:`Richtig! Der Nenner wurde durch ${t.b/t.N} geteilt, also auch der Zähler: es wurde gekürzt.`);
      return wrong('denomNum','Das passt noch nicht. Der Wert des Bruchs muss gleich bleiben. Was passiert mit dem Nenner – und was muss dann mit dem Zähler passieren?',{'r.n':false});
    }
    const f1=getFrac(d,'r1'),f2=getFrac(d,'r2');
    if(!f1||!f2)return invalid(MSG_FRAC_INVALID);
    const e1=[t.a*t.k,t.b*t.k],e2=[e1[0]/t.m,e1[1]/t.m];
    const ok1=f1.n===e1[0]&&f1.d===e1[1],ok2=f2.n===e2[0]&&f2.d===e2[1];
    const marks={'r1.n':f1.n===e1[0],'r1.d':f1.d===e1[1],'r2.n':f2.n===e2[0],'r2.d':f2.d===e2[1]};
    if(ok1&&ok2)return right('Richtig! Erst erweitert, dann gekürzt – der Wert hat sich nie verändert.');
    if(!ok1){const g=diagOps(t.a,t.b,f1.n,f1.d,'expand');if(g){g.marks=marks;return g;}return wrong('step1','Der erste Schritt (Erweitern) stimmt noch nicht.',marks);}
    return wrong('step2','Der erste Schritt stimmt. Beim zweiten Schritt (Kürzen) teilst du Zähler und Nenner durch dieselbe Zahl.',marks);
  },
  solution(t){
    if(t.mode==='denom'){
      const up=t.N>t.b,k=up?t.N/t.b:t.b/t.N,n=t.a*t.N/t.b;
      return [line(up?`Der Nenner wird mit ${k} multipliziert (${t.b} · ${k} = ${t.N}), also erweitern wir mit ${k}:`:`Der Nenner wird durch ${k} geteilt (${t.b} : ${k} = ${t.N}), also kürzen wir mit ${k}:`),
        eq(frac(t.a,t.b),'=',frac(t.a+(up?' · ':' : ')+k,t.b+(up?' · ':' : ')+k),'=',frac(n,t.N))];
    }
    const e1=[t.a*t.k,t.b*t.k];
    return [line('Erst mit '+t.k+' erweitern, dann mit '+t.m+' kürzen:'),eq(frac(t.a,t.b),'=',frac(t.a+' · '+t.k,t.b+' · '+t.k),'=',frac(e1[0],e1[1]),'=',frac(e1[0]+' : '+t.m,e1[1]+' : '+t.m),'=',frac(e1[0]/t.m,e1[1]/t.m))];
  },
  hints(t){
    return withRules(t.mode==='denom'?['Vergleiche den alten und den neuen Nenner: Wird er größer oder kleiner? Dann musst du erweitern oder kürzen.','Finde heraus, womit sich der Nenner verändert hat. Dieselbe Rechnung gilt für den Zähler.']:['Rechne die beiden Schritte nacheinander: zuerst erweitern, dann kürzen.','Beim Erweitern multiplizierst du Zähler und Nenner, beim Kürzen teilst du beide.']);
  }
};


/* Zahlenbereich der Brüche: Niveau 1 bis 60, Niveau 2 bis 300 */
function numsOf(t){
  const out=[],push=(x)=>{if(typeof x==='number')out.push(x);else if(Array.isArray(x))x.forEach(push);};
  ['a','b','p','q','N','from','to','mid','shown','pre','optNums'].forEach(k=>push(t[k]));
  if(t.terms)t.terms.forEach(x=>{push(x.n);push(x.d);});
  if((t.type==='G02'||(t.type==='G05'&&t.mode==='twostep'))&&t.k){out.push(t.a*t.k,t.b*t.k);}
  return out;
}
function wrapRange(id){
  const gen=TASKS[id].gen;
  TASKS[id].gen=function(level,R,ctx){
    const lim=level===1?60:300;let t;
    for(let i=0;i<80;i++){t=gen.call(this,level,R,ctx);if(Math.max(...numsOf(t))<=lim)return t;}
    return t;
  };
}
['G02','G03','G04','G05','U01','U02','U03','O02'].forEach(wrapRange);

/* ---- Schnittstelle gemäß Konzeption ---- */
function generateTask(typeId,level,rng,ctx){return TASKS[typeId].gen(level,rng||RNG,ctx);}
function validateTask(task,answer){return TASKS[task.type].validate(task,answer);}
function buildWorkedSolution(task){return TASKS[task.type].solution(task);}
function hintFor(task,stage){const h=TASKS[task.type].hints(task);return h[Math.min(stage,h.length-1)];}

