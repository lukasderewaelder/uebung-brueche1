'use strict';
/* =====================================================================
   Erklärungen: Anleitung beim ersten Öffnen eines Lernpfad-Bauteils
   Kurze Karten (3–4 Schritte) mit Bild, Rechnung und – bei Erweitern und Kürzen – zum Ausprobieren.
   Sätze höchstens 14 Wörter (runSelfTests prüft das). **fett** nennt einen Knopf oder ein Merkwort, {n|d} ist ein Bruch.
   Rechnungen stehen als Daten in calc, nie im Text: [n,d] = Bruch, [n,d,'x',k] bzw. [n,d,'d',k] = Bruch mit „· k“
   bzw. „: k“ in Zähler und Nenner, Zahl = Zahl, anderer Text = Rechenzeichen oder Wort, {wrong:true,t:[…]} = falsche Rechnung.
   Schritt: h (Überschrift), say (Sätze), dazu höchstens eins von fig (Streifen/Kreise), lab (Ausgang/Jetzt), tryit (Ausprobieren), calc.
   Gate in renderAll: ungesehen oder per Knopf „Erklärung“ im Merkkasten (view.intro). Altbestand: migrateIntro.
   ===================================================================== */
const INTRO={
  LAB:{title:'Bruchlabor',steps:[
    {h:'Ein Bruch, zwei Bilder',
      say:['Im Labor siehst du einen Bruch als Streifen.','Oben steht **Ausgang**. Unten steht **Jetzt**.','Du kannst oben auf **Kreis** wechseln.'],
      lab:{base:[2,3],cur:[4,6],op:'x',k:2}},
    {h:'Erweitern: feiner teilen',
      say:['Tippe auf **× 2**.','Jedes Teil wird in 2 kleinere Teile geteilt.','Das Gefärbte endet immer an der gestrichelten Linie.'],
      tryit:{base:[2,3],op:'x',ks:[2,3,4]}},
    {h:'Kürzen: gröber teilen',
      say:['Tippe auf **÷ 3**.','Je 3 kleine Teile werden zu einem großen Teil.','Probiere auch **÷ 2**. Was passiert?'],
      tryit:{base:[6,9],op:'d',ks:[2,3]}},
    {h:'Deine drei Aufträge',
      say:['Auftrag 1: Erweitere einen Bruch.','Auftrag 2: Kürze einen Bruch.','Auftrag 3: Finde heraus, was gleich bleibt.','Mit **Rückgängig** nimmst du einen Schritt zurück.']}
  ]},
  G01:{title:'Gleiche Anteile erkennen',steps:[
    {h:'Zwei Bilder, gleich viel',
      say:['Diese zwei Streifen zeigen denselben Anteil.','Der untere hat mehr Teile, aber kleinere.','Die gefärbte Fläche ist gleich groß.'],
      fig:[{n:2,d:3},{n:4,d:6}]},
    {h:'Zähle genau hin',
      say:['Beide Bilder haben 2 gefärbte Teile.','Aber die Teile sind verschieden groß.','Darum zeigen sie nicht denselben Anteil.'],
      fig:[{n:2,d:3},{n:2,d:6}]},
    {h:'Das Gefärbte kann überall liegen',
      say:['Die gefärbten Teile müssen nicht beieinander liegen.','Auch der Anfang ist egal.','Zähle und vergleiche den Anteil.'],
      fig:{mode:'circle',rows:[{n:1,d:3,fill:[1]},{n:2,d:6,fill:[1,4]}]}},
    {h:'So antwortest du',
      say:['Tippe alle Karten an, die denselben Anteil zeigen.','Oft gibt es mehr als eine richtige Karte.','Dann tippe auf **Prüfen**.']}
  ]},
  B01:{title:'Bruchbilder verändern',steps:[
    {h:'Das Vorgabebild',
      say:['Du siehst ein Bild mit einem Bruch.','Die gefärbten Teile müssen nicht beieinander liegen.','Du teilst dasselbe Bild feiner ein.'],
      fig:[{n:2,d:3,fill:[0,2]}]},
    {h:'Jedes Teil wird geteilt',
      say:['Jedes alte Teil wird in 2 neue Teile geteilt.','Aus 3 Teilen werden 6 Teile.','Der gefärbte Anteil bleibt gleich groß.'],
      fig:[{n:2,d:3,fill:[0,2]},{n:4,d:6,fill:[0,1,4,5],acc:'erw'}]},
    {h:'Das Gefärbte wächst mit',
      say:['Aus jedem gefärbten Teil werden 2 gefärbte Teile.','Aus 2 gefärbten Teilen werden also 4.'],
      calc:[[[2,3],'=',[2,3,'x',2],'=',[4,6]]]},
    {h:'So machst du es',
      say:['Tippe die neuen Teile an, die gefärbt sein sollen.','Unter dem Bild zählt dein Bruch mit.','Stimmt alles, tippe auf **Prüfen**.']}
  ]},
  G02:{title:'Erweitern',steps:[
    {h:'Erweitern heißt: feiner teilen',
      say:['Hier siehst du {2|3} als Bild.','2 von 3 Teilen sind gefärbt.','Dieses Bild teilen wir jetzt feiner.'],
      fig:[{n:2,d:3}]},
    {h:'Jedes Teil wird geteilt',
      say:['Wir teilen jedes Teil in 2 kleinere Teile.','Aus 3 Teilen werden 6 Teile.','Aus 2 gefärbten Teilen werden 4.','Der gefärbte Anteil bleibt gleich.'],
      fig:[{n:2,d:3},{n:4,d:6,acc:'erw'}]},
    {h:'Probiere es selbst aus',
      say:['Tippe auf eine Zahl.','Zähler und Nenner rechnen immer mit.'],
      tryit:{base:[2,3],op:'x',ks:[2,3,4]}},
    {h:'Die Regel',
      say:['Beim Erweitern multiplizierst du Zähler und Nenner mit derselben Zahl.','Diese Zahl heißt **Erweiterungszahl**.','Der Wert des Bruchs bleibt gleich.'],
      calc:[[[2,3],'=',[2,3,'x',2],'=',[4,6]]]}
  ]},
  T01:{title:'Teilbarkeit',steps:[
    {h:'Teilbar heißt: kein Rest',
      say:['Du bekommst eine Zahl und tippst Ja oder Nein.','**Ja**, wenn beim Teilen kein Rest bleibt.','**Nein**, wenn ein Rest bleibt.'],
      calc:[[12,':',3,'=',4,'→','Ja'],[14,':',3,'=',4,'Rest',2,'→','Nein']]},
    {h:'Die letzte Ziffer verrät viel',
      say:['**2**: Die letzte Ziffer ist 0, 2, 4, 6 oder 8.','**5**: Die letzte Ziffer ist 0 oder 5.','**10**: Die letzte Ziffer ist 0.']},
    {h:'Die Quersumme',
      say:['Für **3** und **9** brauchst du die Quersumme.','Zähle dazu alle Ziffern zusammen.','Ist die Summe durch 3 teilbar, ist es auch die Zahl.','Bei der 9 ist es genauso.'],
      calc:[[252,'→',2,'+',5,'+',2,'=',9]]},
    {h:'Vier und sechs',
      say:['**4**: Die letzten zwei Ziffern sind durch 4 teilbar.','**6**: Die Zahl ist durch 2 und durch 3 teilbar.','Alle Regeln findest du im **Merkkasten**.']}
  ]},
  G03:{title:'Kürzen',steps:[
    {h:'Kürzen heißt: gröber teilen',
      say:['Beim Kürzen fasst du kleine Teile zu großen Teilen zusammen.','Hier gehören immer 2 Teile zusammen.','Aus {4|6} wird {2|3}.'],
      fig:[{n:4,d:6},{n:2,d:3,acc:'kue'}]},
    {h:'Die Rechnung',
      say:['Du teilst Zähler und Nenner durch dieselbe Zahl.','Diese Zahl heißt **Kürzungszahl**.','Der Wert des Bruchs bleibt gleich.'],
      calc:[[[4,6],'=',[4,6,'d',2],'=',[2,3]]]},
    {h:'Probiere es selbst aus',
      say:['Tippe auf **÷ 2**.','Tippe dann auf **÷ 3**. Was passiert?'],
      tryit:{base:[4,6],op:'d',ks:[2,3]}},
    {h:'Nur, wenn beide passen',
      say:['Du kannst nur durch eine Zahl kürzen, die in beide Zahlen passt.','Prüfe vorher: Bleibt oben und unten kein Rest?','Die Regeln dazu stehen im **Merkkasten**.']}
  ]},
  G04:{title:'Kürzen so weit wie möglich',steps:[
    {h:'Mehrmals kürzen',
      say:['Oft kannst du mehr als einmal kürzen.','Hier erst durch 2, dann durch 3.'],
      calc:[[[12,18],'=',[12,18,'d',2],'=',[6,9]],[[6,9],'=',[6,9,'d',3],'=',[2,3]]]},
    {h:'Wann ist Schluss?',
      say:['Kürze, bis keine Zahl mehr in beide passt.','Dann ist der Bruch so weit wie möglich gekürzt.','Bei {2|3} geht nichts mehr.']},
    {h:'Manchmal geht es nicht',
      say:['Bei {5|7} passt keine Zahl in beide.','Dieser Bruch lässt sich nicht kürzen.','Dann tippe auf **Nicht kürzbar**.']},
    {h:'Die 2 geht IMMER',
      say:['**Die 2 geht IMMER, wenn Zähler und Nenner gerade sind.**','Enden beide auf 0 oder 5, geht auch die 5.','Enden beide auf 0, geht auch die 10.']}
  ]},
  G05:{title:'Erweitern und Kürzen gemischt',steps:[
    {h:'Erweitern oder kürzen?',
      say:['Hier entscheidest du selbst.','Vergleiche den alten Nenner mit dem neuen.','Wird er größer, erweiterst du.','Wird er kleiner, kürzt du.'],
      calc:[[[3,4],'=',['?',12]],[[6,9],'=',['?',3]]]},
    {h:'Oben und unten dasselbe',
      say:['Finde die Zahl, mit der sich der Nenner ändert.','Rechne mit dem Zähler genauso.'],
      calc:[[[3,4],'=',[3,4,'x',3],'=',[9,12]],[[6,9],'=',[6,9,'d',3],'=',[2,3]]]},
    {h:'Zwei Schritte nacheinander',
      say:['Manchmal steht da: erst erweitern, dann kürzen.','Rechne die Schritte nacheinander.','Der Wert bleibt die ganze Zeit gleich.'],
      calc:[[[4,6],'=',[4,6,'x',3],'=',[12,18]],[[12,18],'=',[12,18,'d',2],'=',[6,9]]]}
  ]},
  U01:{title:'Bruch-Lücken',steps:[
    {h:'Eine Zahl fehlt',
      say:['Zwei Brüche haben denselben Wert.','In einem Bruch fehlt eine Zahl.','Die sollst du finden.'],
      calc:[[[2,3],'=',['?',12]]]},
    {h:'Vergleiche die Zahlen',
      say:['Schau auf die Zahlen, die du kennst.','Von 3 nach 12 ist es mal 4.','Dann rechnest du oben auch mal 4.'],
      calc:[[[2,3],'=',[2,3,'x',4],'=',[8,12]]]},
    {h:'Auch Kürzen kommt vor',
      say:['Manchmal wurde der Bruch gekürzt.','Dann teilst du statt zu multiplizieren.','Tippe in jede Lücke eine Zahl.','Dann tippe auf **Prüfen**.'],
      calc:[[[6,9],'=',[6,9,'d',3],'=',[2,3]]]}
  ]},
  U02:{title:'Erweiterungs- oder Kürzungszahl finden',steps:[
    {h:'Welche Zahl war es?',
      say:['Du siehst einen Bruch und das Ergebnis.','Mit welcher Zahl wurde erweitert oder gekürzt?'],
      calc:[[[3,4],'→',[12,16]]]},
    {h:'Vergleiche Zähler mit Zähler',
      say:['Von 3 nach 12 ist es mal 4.','Mache die Probe mit dem Nenner.'],
      calc:[[3,'·',4,'=',12],[4,'·',4,'=',16]]},
    {h:'Größer oder kleiner?',
      say:['Werden die Zahlen größer, wurde erweitert.','Werden sie kleiner, wurde gekürzt.','Beim Kürzen teilst du, beim Erweitern multiplizierst du.','Die gesuchte Zahl ist immer größer als 1.'],
      calc:[[[12,16],'→',[3,4]],[12,':',4,'=',3],[16,':',4,'=',4]]}
  ]},
  U03:{title:'Fehler finden und berichtigen',steps:[
    {h:'Hier steckt ein Fehler',
      say:['Jemand hat falsch erweitert oder gekürzt.','Du findest den Fehler.','Dann rechnest du richtig.'],
      calc:[{wrong:true,t:[[2,3],'=',[6,3]]}]},
    {h:'Zuerst die Fehlerart',
      say:['Wähle aus, was falsch gemacht wurde.','Zum Beispiel wurde nur der Zähler verändert.','Oder es wurde addiert statt multipliziert.']},
    {h:'Dann richtig rechnen',
      say:['Zähler und Nenner brauchen immer dieselbe Rechnung.','Dann bleibt der Wert gleich.'],
      calc:[[[2,3],'=',[2,3,'x',3],'=',[6,9]]]}
  ]},
  O02:{title:'Kürzen-Maschine',steps:[
    {h:'Die Kürzen-Maschine',
      say:['Tippe auf eine Zahl, zum Beispiel **÷ 2**.','Der Bruch wird sofort gekürzt.','Es geht nur, wenn beide Zahlen teilbar sind.'],
      calc:[[[12,18],'=',[6,9]]]},
    {h:'Bis nichts mehr geht',
      say:['Kürze weiter, bis der Bruch fertig ist.','Dann hast du einen Weg geschafft.','Die 2 geht IMMER, wenn beide gerade sind.'],
      calc:[[[6,9],'=',[6,9,'d',3],'=',[2,3]]]},
    {h:'Zwei verschiedene Wege',
      say:['Du brauchst zwei Wege mit verschiedenen Zahlen.','Weg 1 kann ein großer Schritt sein.','Weg 2 besteht aus kleinen Schritten.','Mit **Weg neu starten** beginnst du noch einmal.'],
      calc:[[[12,18],'=',[12,18,'d',6],'=',[2,3]],[[12,18],'=',[6,9],'=',[2,3]]]}
  ]},
  Q00:{title:'Schnellcheck',steps:[
    {h:'Blitzfragen',
      say:[TASKS.Q00.size+' Fragen warten auf dich.','Du tippst nur die Antwort an.','Es gibt keine Zeitmessung.']},
    {h:'Sofort eine Rückmeldung',
      say:['Du siehst gleich, ob die Antwort stimmt.','War sie falsch, siehst du die richtige.','Dann geht es mit der nächsten Frage weiter.']},
    {h:'Danach siehst du, was fehlt',
      say:['Am Ende siehst du, was du schon kannst.','Wenn etwas fehlt, bekommst du einen Plan.','Weißt du etwas nicht, rate bitte nicht wild.']},
    {h:'Der Abschlusscheck',
      say:['Am Ende des Lernpfads wartet der Abschlusscheck.','Er hat auch '+TASKS.Q00.size+' Fragen.','Ab '+needOf(TASKS.Q00.size)+' richtigen Antworten gibt es die Urkunde.']}
  ]}
};
const hasIntro=(id)=>Object.prototype.hasOwnProperty.call(INTRO,id);
const introSeen=(id)=>!!(S.intro&&S.intro[id]===true);
/* Zu welcher Ansicht gehört eine Erklärung? Bruchlabor und jede Übung des Lernpfads – nicht der Kurztest, nicht die Spiele */
function introIdOf(v){
  if(!v)return null;
  if(v.kind==='lab')return 'LAB';
  if(v.kind==='practice'&&typeof v.id==='string'&&hasIntro(v.id)&&TASKS[v.id])return v.id;
  return null;
}
/* Gate: Welche Erklärung soll statt der Ansicht erscheinen? Ungesehen, oder ausdrücklich geöffnet (view.intro) */
function introWanted(v){
  const id=introIdOf(v);
  return id&&(!introSeen(id)||(v&&v.intro===true))?id:null;
}
/* Schema 7: Wer ein Bauteil schon bearbeitet hat, bekommt dessen Erklärung nicht noch einmal.
   „Bearbeitet“ = Zähler der Übung, bestanden oder Antworten in einer Runde – nicht schon das bloße Öffnen und
   nicht „per Check freigeschaltet“ (das Bauteil war ja noch nicht zu sehen). */
function migrateIntro(st){
  st.intro=(st.intro&&typeof st.intro==='object'&&!Array.isArray(st.intro))?st.intro:{};
  const prog=st.progress||{},pas=st.passed||{},rounds=st.rounds||{};
  const worked=(id)=>[1,2].some(l=>{
    const k=keyOf(id,l),p=prog[k],r=rounds[k];
    return !!(p&&['done','first','later','shown','skipped'].some(f=>p[f]>0))||!!pas[k]||!!(r&&Array.isArray(r.results)&&r.results.length>0);
  });
  PATH.forEach(m=>{
    let seen;
    if(m.id==='LAB')seen=!!(st.lab&&(st.lab.done||(st.lab.did&&(st.lab.did.x||st.lab.did.d))));
    else seen=worked(m.id)||(m.id==='Q00'&&!!(st.placed||st.final));
    if(seen)st.intro[m.id]=true;
  });
}

/* ---------- Bausteine der Erklärkarten ---------- */
/* Text mit **fett** und {n|d} (Bruch) → Textstücke und Elemente (nur eigene Texte, kein HTML) */
function introRich(s){
  const out=[];
  s.split('**').forEach((seg,i)=>{
    const kids=[];
    seg.split(/(\{\d+\|\d+\})/).forEach(t=>{
      const m=/^\{(\d+)\|(\d+)\}$/.exec(t);
      if(m)kids.push(frac(+m[1],+m[2]));else if(t)kids.push(t);
    });
    if(i%2)out.push(el('strong',null,...kids));else out.push(...kids);
  });
  return out;
}
const INTRO_OPS=['=','→','·',':','+'];
function introCalcLine(tokens){
  const parts=tokens.map(t=>{
    if(Array.isArray(t)){
      const [n,d,how,k]=t;
      return how==='x'?frac(n+' · '+k,d+' · '+k):how==='d'?frac(n+' : '+k,d+' : '+k):frac(n,d);
    }
    if(typeof t==='number')return el('span',{class:'icn'},String(t));
    return INTRO_OPS.includes(t)?t:el('span',{class:'ict'},t);
  });
  const e=eq(...parts);
  if(tokens.filter(Array.isArray).length>3)e.classList.add('small');
  return e;
}
function introCalcNode(lines){
  return el('div',{class:'introcalc'},lines.map(l=>l.wrong
    ?el('div',{class:'wrongclaim',role:'group','aria-label':'Falsche Rechnung'},introCalcLine(l.t))
    :introCalcLine(l)));
}
/* Bildzeilen: Streifen untereinander (Beschriftung links, alle gleich lang) oder Kreise nebeneinander */
function introFigNode(spec){
  const f=Array.isArray(spec)?{mode:'strip',rows:spec}:spec,circ=f.mode==='circle';
  const box=el('div',{class:'introfigs'+(circ?' circ':'')});
  f.rows.forEach(r=>{
    const svg=drawMode(f.mode,r.n,r.d,{maxW:circ?130:460,fill:r.fill,label:r.n+' von '+r.d+' Teilen gefärbt'});
    box.append(el('div',{class:'fig'+(r.acc?' '+r.acc:'')},...(circ?[svg,frac(r.n,r.d)]:[frac(r.n,r.d),svg])));
  });
  return box;
}
/* Ausprobieren wie im Bruchlabor (Ausgang und Jetzt), aber mit einer Rechenart und wenigen Zahlen.
   Geht eine Zahl nicht, sagt ein kurzer Satz, warum. Nichts davon wird gespeichert. */
function introWhy(cur,op,k){
  if(op==='x')return 'Mehr als '+LAB_MAX+' Teile passen nicht ins Bild. Tippe auf Nochmal.';
  const bad=cur[0]%k?cur[0]:cur[1];
  return 'Mit '+k+' geht das nicht: '+bad+' ist nicht durch '+k+' teilbar.';
}
function introTry(spec){
  const {base,op,ks}=spec,name=op==='x'?'Erweitern':'Kürzen',sym=op==='x'?' · ':' : ';
  const L={mode:'strip',base:base.slice(),cur:base.slice(),last:null};
  const stage=el('div',{class:'introstage'}),say=el('div',{class:'introsay','aria-live':'polite'});
  const chips=el('div',{class:'introchips',role:'group','aria-label':name,style:'--n:'+ks.length});
  const reset=el('button',{type:'button',class:'btn small introreset'},icon('undo'),'Nochmal');
  const btns=ks.map(k=>{
    const b=el('button',{type:'button',class:'chip'+(op==='x'?' erw':'')},(op==='x'?'× ':'÷ ')+k);
    b.addEventListener('click',()=>act(k));
    chips.append(b);
    return b;
  });
  const draw=()=>{
    stage.replaceChildren(labFigure(L));
    ks.forEach((k,j)=>{
      const ok=labCan(L.cur,op,k);
      btns[j].classList.toggle('off',!ok);
      btns[j].setAttribute('aria-disabled',String(!ok));
      btns[j].setAttribute('aria-label',name+' mit '+k+(ok?'':' – geht nicht'));
    });
    reset.disabled=!L.last;
  };
  function act(k){
    if(!labCan(L.cur,op,k)){say.replaceChildren(el('div',{class:'labtext no'},introWhy(L.cur,op,k)));return;}
    const from=L.cur.slice();
    L.cur=labStep(from,op,k);L.last={op,k};
    const e=eq(frac(from[0],from[1]),'=',frac(from[0]+sym+k,from[1]+sym+k),'=',frac(L.cur[0],L.cur[1]));
    e.classList.add('small');
    const stuck=ks.every(j=>!labCan(L.cur,op,j));
    say.replaceChildren(el('div',{class:'labtext'},e,
      el('p',null,'Der gefärbte Anteil bleibt gleich.'+(stuck?(op==='d'?' Weiter kürzen geht nicht mehr.':' Mehr passt nicht ins Bild.')+' Tippe auf Nochmal.':''))));
    draw();
  }
  reset.addEventListener('click',()=>{L.cur=base.slice();L.last=null;say.replaceChildren();draw();});
  draw();
  /* Zahlen direkt unter dem Auftrag (bleiben beim Antippen an derselben Stelle), darunter Bild, Rechnung und „Nochmal“ */
  return el('div',{class:'introtry'},chips,stage,say,reset);
}

/* ---------- Ansicht: Erklärung ---------- */
function renderIntro(id){
  const I=INTRO[id],steps=I.steps,total=steps.length,again=!!(S.view&&S.view.intro);
  let i=0;
  const root=el('div',{class:'page'});root.append(topbar(I.title));
  const shell=el('div',{class:'shell'}),main=el('main',{class:'work introwork'});
  main.dataset.acc=ACC[id]||PATH_ACC[id]||'';
  shell.append(main);root.append(shell);app.append(root);
  const card=el('div',{class:'card'}),links=el('div',{class:'linkrow'});
  const backB=el('button',{type:'button',class:'btn introback','aria-label':'Zurück zum vorigen Schritt'},icon('zurueck'),'Zurück');
  const nextB=el('button',{type:'button',class:'btn primary intronext'});
  main.append(card,links,el('div',{class:'actionbar'},el('div',{class:'primaryrow'},backB,nextB)));
  /* „Los geht’s“ und „Kenne ich schon“: Erklärung gilt als gesehen, es geht zur eigentlichen Ansicht.
     Ausdrücklich geöffnet (Merkkasten): das Kennzeichen view.intro verschwindet, der Verlaufseintrag wird ersetzt. */
  const finish=()=>{
    S.intro=S.intro||{};S.intro[id]=true;
    if(S.view&&S.view.intro){
      const w=Object.assign({},S.view);delete w.intro;S.view=w;
      try{history.replaceState({v:w},'');}catch(e){}
    }
    persist();renderAll();window.scrollTo(0,0);
  };
  const draw=(move)=>{
    const s=steps[i],last=i===total-1;
    const ruler=el('div',{class:'ruler introruler','aria-hidden':'true'});
    for(let k=0;k<total;k++)ruler.append(el('i',{class:'tk'+(k<i?' f':k===i?' cur':'')}));
    const h=el('h2',{class:'introh',tabindex:'-1'},s.h);
    card.replaceChildren(...[ruler,
      el('p',{class:'introstep'},'Schritt '+(i+1)+' von '+total),
      h,
      el('div',{class:'introtxt'},s.say.map(t=>el('p',null,introRich(t)))),
      s.lab?el('div',{class:'introstage'},labFigure({mode:'strip',base:s.lab.base.slice(),cur:s.lab.cur.slice(),last:{op:s.lab.op,k:s.lab.k}})):null,
      s.fig?introFigNode(s.fig):null,
      s.calc?introCalcNode(s.calc):null,
      s.tryit?introTry(s.tryit):null,
      el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('gluehbirne'),el('span',{class:'tb-name'},I.title)),el('span',{class:'tb-c'},'Erklärung'))].filter(Boolean));
    backB.disabled=i===0;
    nextB.replaceChildren(...(last?[again?'Zur Übung':'Los geht’s',icon('play')]:['Weiter',icon('weiter')]));
    links.replaceChildren(el('button',{type:'button',class:'linkbtn introskip',onclick:finish},again?'Schließen':'Kenne ich schon'));
    if(move){window.scrollTo(0,0);h.focus({preventScroll:true});}
  };
  backB.addEventListener('click',()=>{if(i>0){i--;draw(true);}});
  nextB.addEventListener('click',()=>{if(i<total-1){i++;draw(true);}else finish();});
  draw(false);
}
/* Knopf „Erklärung“ im Merkkasten: dieselbe Ansicht noch einmal, mit Erklärung davor */
function openIntro(){go(Object.assign({},S.view,{intro:true}));}

