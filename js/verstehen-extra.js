'use strict';
/* =====================================================================
   Etappe F „Brüche verstehen“: Anteile-Labor (FLAB) und Erklärungen (je Station zwei Karten: „So geht's“ und „Darauf achten“)
   FLAB: Stellschrauben für die Teile (Nenner) und die gefärbten Teile (Zähler); Umschalter Rechteck · Streifen · Zahlenstrahl.
   Auftrag 1: teilen und färben · Auftrag 2: dieselbe Zahl in allen drei Bildern sehen · Auftrag 3: „Was zeigt der Nenner?“
   Zustand S.labF = {d, n, mode, did:{teil, bilder:{rect,strip,line}}, done}. Eintrag in LABS.
   ===================================================================== */
const FLAB_QUIZ=[
  {id:'alle',txt:'Wie viele gleich große Teile es gibt'},
  {id:'gef',txt:'Wie viele Teile gefärbt sind'},
  {id:'gross',txt:'Wie groß das Ganze ist'},
  {id:'weiss',txt:'Wie viele Teile weiß bleiben'}
];
const FLAB_WRONG={gef:'Das zeigt der Zähler oben.',gross:'Die Größe des Ganzen steht nicht im Bruch.',weiss:'Die weißen Teile stehen nicht im Bruch.'};
function flabState(){
  const L=S.labF,ok=L&&Number.isInteger(L.d)&&Number.isInteger(L.n)&&L.d>=2&&L.d<=12&&L.n>=0&&L.n<=L.d&&['rect','strip','line'].includes(L.mode)&&L.did&&L.did.bilder;
  if(!ok)S.labF={d:4,n:3,mode:'rect',did:{teil:0,bilder:{rect:true,strip:false,line:false}},done:false};
  return S.labF;
}
const flabPhase=(L)=>L.done?'free':L.did.teil<2?'teil':!(L.did.bilder.strip&&L.did.bilder.line)?'bilder':'quiz';
function flabFigure(L){
  if(L.mode==='line')return drawNumberLine({from:0,to:1,parts:L.d,marks:L.n?[{n:L.n,d:L.d}]:[],labels:'wholes'});
  if(L.mode==='strip')return drawFractionStrip(L.n,L.d,{maxW:360,label:L.n+' von '+L.d+' Teilen'});
  const g=gridDims(L.d);
  return g?drawFractionGrid(L.n,L.d,g[0],g[1],{maxW:240,label:L.n+' von '+L.d+' Teilen'}):drawFractionStrip(L.n,L.d,{maxW:360,tall:true,label:L.n+' von '+L.d+' Teilen'});
}
function renderFLab(){
  const L=flabState();
  const root=el('div',{class:'page'});root.append(topbar('Anteile-Labor'));
  const shell=el('div',{class:'shell'}),help=helpPanel('FLAB'),main=el('main',{class:'work lab flab'});
  shell.append(main,help.el);root.append(shell);app.append(root);
  main.dataset.acc='mix';
  help.setNotes(['M23','M25'].map(n=>el('section',{class:'note','aria-label':'Merkzettel '+n},el('h3',null,n+' · '+NOTES[n].title),...NOTES[n].build([]))));
  help.setStats(el('div',null,el('h3',null,'Dein Labor'),el('p',null,L.done?'Der Entdeckerauftrag ist geschafft.':'Der Entdeckerauftrag ist noch offen.')));
  const modeBtn=(m,label)=>{const b=el('button',{type:'button','aria-pressed':String(L.mode===m)},label);b.addEventListener('click',()=>{L.mode=m;L.did.bilder[m]=true;persist();draw();});return b;};
  const seg=el('div',{class:'seg labseg',role:'group','aria-label':'Bild wählen'},modeBtn('rect','Rechteck'),modeBtn('strip','Streifen'),modeBtn('line','Zahlenstrahl'));
  const promptEl=el('div',{class:'prompt'}),stage=el('div',{class:'labstage'}),say=el('div',{class:'labsay','aria-live':'polite'});
  const tb=el('span',{class:'tb-c'});
  main.append(el('div',{class:'card'},seg,promptEl,stage,say,el('div',{class:'titleblock'},el('span',{class:'tb-id'},icon('kolben'),el('span',{class:'tb-name'},'Anteile-Labor')),tb)));
  const rows={};
  const steps=el('div',{class:'rlabctl',role:'group','aria-label':'Zahlen einstellen'});
  [['d','Teile'],['n','Gefärbt']].forEach(([k,label])=>{
    const out=el('b',{class:'rv'});
    const mk=(dl,sym)=>{const b=el('button',{type:'button',class:'chip','aria-label':label+(dl>0?' mehr':' weniger')},sym);b.addEventListener('click',()=>turn(k,dl));return b;};
    rows[k]={out,minus:mk(-1,'−'),plus:mk(1,'+')};
    steps.append(el('div',{class:'rlabrow'},el('span',{class:'lbl'},label),rows[k].minus,out,rows[k].plus));
  });
  const quizBox=el('div',{class:'labquiz'});
  const noteBtn=el('button',{type:'button',class:'btn'},el('span',{class:'emo'},icon('heft')),'Merkzettel');
  main.append(el('div',{class:'actionbar'},el('div',{class:'labctl'},steps,quizBox),el('div',{class:'primaryrow'},noteBtn)));
  const sayText=(t,k)=>say.replaceChildren(t?(k?el('div',{class:'msg '+k},t):el('div',{class:'labtext'},t)):null);
  function turn(k,dl){
    if(flabPhase(L)==='quiz')return;
    const nd=k==='d'?L.d+dl:L.d,nn=k==='n'?L.n+dl:Math.min(L.n,L.d+dl);
    if(nd<2||nd>12){sayText(nd<2?'Ein Bruch braucht mindestens 2 Teile.':'Mehr als 12 Teile passen nicht gut ins Bild.','bad');return;}
    if(nn<0||nn>nd){sayText(nn<0?'Weniger als 0 Teile geht nicht.':'Es sind schon alle Teile gefärbt.','bad');return;}
    L.d=nd;L.n=nn;L.did.teil++;persist();
    sayText(L.n+' von '+L.d+' gleich großen Teilen sind gefärbt. Das ist '+ft(L.n,L.d)+'.');draw();
  }
  function draw(){
    const ph=flabPhase(L);
    seg.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(['rect','strip','line'][i]===L.mode)));
    promptEl.replaceChildren(el('p',{class:'q'},{teil:'Auftrag 1: Teile das Rechteck und färbe Teile. Nutze − und +.',bilder:'Auftrag 2: Schau dir denselben Bruch als Streifen und am Zahlenstrahl an.',quiz:'Auftrag 3: Was zeigt der Nenner?',free:'Geschafft! Probiere weiter aus.'}[ph]));
    if(ph==='free'){const nb=labNextBtn('FLAB');if(nb)promptEl.append(nb);}
    stage.replaceChildren(flabFigure(L),el('div',{class:'rlabchain'},frac(L.n,L.d)));
    tb.textContent=ph==='free'?'Frei':'Auftrag '+({teil:1,bilder:2,quiz:3}[ph])+' von 3';
    rows.d.out.textContent=String(L.d);rows.n.out.textContent=String(L.n);
    steps.hidden=ph==='quiz';quizBox.hidden=ph!=='quiz';
    if(ph==='quiz'){
      const grid=el('div',{class:'tiles',role:'group','aria-label':'Antworten'});
      FLAB_QUIZ.forEach((o,i)=>{
        const b=el('button',{type:'button',class:'tile tile-txt','aria-label':'Antwort '+Q_LETTERS[i]+': '+o.txt},el('span',{class:'ltr','aria-hidden':'true'},Q_LETTERS[i]),el('span',{class:'tv'},o.txt));
        b.addEventListener('click',()=>{
          if(o.id==='alle'){L.done=true;persist();sayText('Genau! Der Nenner zählt alle gleich großen Teile.','ok');draw();award(15,'Entdeckt!');return;}
          b.disabled=true;b.classList.add('is-wrong');sayText(FLAB_WRONG[o.id],'bad');
        });
        grid.append(b);
      });
      quizBox.replaceChildren(grid);
    }
  }
  noteBtn.addEventListener('click',()=>setHelp(!helpOpen));
  draw();
}
LABS.FLAB={name:'Anteile-Labor',desc:'Teilen, färben und denselben Bruch als Rechteck, Streifen und am Zahlenstrahl sehen.',
  done:()=>!!(S.labF&&S.labF.done),started:()=>!!(S.labF&&(S.labF.done||S.labF.did&&S.labF.did.teil>0)),render:()=>renderFLab()};

/* ---------- Erklärungen (P12/P13: Karte 1 „So geht's“ mit Beispiel, dann die Probe, Karte 2 „Darauf achten“) ---------- */
Object.assign(INTRO,{
  FLAB:{title:'Anteile-Labor',steps:[
    {h:'So geht\'s',say:['Mit **Teile** teilst du das Rechteck in gleich große Teile.','Mit **Gefärbt** färbst du Teile.','Oben siehst du den Bruch dazu.']},
    {h:'Darauf achten',say:['Schalte zwischen Rechteck, Streifen und Zahlenstrahl um.','Es ist immer derselbe Bruch.']}
  ]},
  F01:{title:'Anteile erkennen',steps:[
    {h:'So geht\'s',say:['Das Rechteck ist in 4 gleich große Teile geteilt.','3 Teile sind gefärbt.','Das schreibst du als **drei Viertel**.'],fig:{mode:'grid',rows:[{n:3,d:4}]}},
    {h:'Darauf achten',say:['Unten steht die Zahl aller Teile: der **Nenner**.','Oben steht die Zahl der gefärbten Teile: der **Zähler**.','Die Teile müssen gleich groß sein.']}
  ]},
  F02:{title:'Das Ganze zählt',steps:[
    {h:'So geht\'s',say:['Zwei Bleche sind verschieden groß.','Die Hälfte vom großen Blech ist mehr.','Ein Bruch hängt immer vom Ganzen ab.'],fig:{mode:'strip',rows:[{n:1,d:2},{n:1,d:2}]}},
    {h:'Darauf achten',say:['Frage immer: Was ist hier das Ganze?','Gleiche Brüche sind nur bei gleichen Ganzen gleich viel.']}
  ]},
  F03:{title:'Mehrere Ganze',steps:[
    {h:'So geht\'s',say:['Drei Pizzen werden an vier Kinder verteilt.','Jede Pizza wird in Viertel geteilt.','Jedes Kind bekommt drei Viertel Pizza.'],fig:{mode:'grid',rows:[{n:1,d:4},{n:1,d:4},{n:1,d:4}]}},
    {h:'Darauf achten',say:['Zähle nur Teile, die zum selben Ganzen gehören.','Ein Viertel Kuchen und ein Viertel Pizza sind nicht zwei Viertel von etwas.']}
  ]},
  F04:{title:'Anteile von Größen',steps:[
    {h:'So geht\'s',say:['Gesucht sind drei Viertel von 12 Euro.','Erst teilst du durch den Nenner.','Dann nimmst du mit dem Zähler mal.']},
    {h:'Darauf achten',say:['Teile immer zuerst durch den Nenner.','Eine Stunde hat 60 Minuten, ein Kilogramm 1000 Gramm.']}
  ]},
  F05:{title:'Brüche größer 1',steps:[
    {h:'So geht\'s',say:['Jedes Rechteck ist ein Ganzes mit 4 Teilen.','7 Teile sind gefärbt.','Das sind ein Ganzes und noch drei Viertel.'],fig:{mode:'grid',rows:[{n:4,d:4},{n:3,d:4}]}},
    {h:'Darauf achten',say:['Ist der Zähler größer als der Nenner, ist es mehr als ein Ganzes.','Die gemischte Zahl heißt Ganze **und** Rest, nicht mal.']}
  ]},
  F06:{title:'Was gehört zusammen?',steps:[
    {h:'So geht\'s',say:['Bild, Bruch und Satz können dasselbe zeigen.','Zähle alle Teile und die gefärbten Teile.','Kreise und Rechtecke zeigen Brüche gleich gut.'],fig:{mode:'circle',rows:[{n:2,d:3}]}},
    {h:'Darauf achten',say:['Prüfe bei Geschichten das Ganze.','Nur Teile vom selben Ganzen darfst du zusammenzählen.']}
  ]},
  F07:{title:'Das Ganze finden',steps:[
    {h:'So geht\'s',say:['Das Stück ist zwei Fünftel eines Streifens.','Der Nenner sagt: Ein Ganzes hat 5 Teile.','So baust du das Ganze wieder auf.'],fig:{mode:'strip',rows:[{n:2,d:5}]}},
    {h:'Darauf achten',say:['Auch Brüche größer 1 verraten das Ganze.','Bei fünf Dritteln hat ein Ganzes 3 Teile.']}
  ]},
  F08:{title:'Bruchrätsel',steps:[
    {h:'So geht\'s',say:['Manchmal sind Teile noch einmal geteilt.','Teile in Gedanken alles in gleich kleine Teile.','Dann zählst du wie immer.']},
    {h:'Darauf achten',say:['Ein Bruch braucht gleich große Teile.','Ungleiche Teile musst du erst passend teilen.']}
  ]},
  FQ:{title:'Eingangstest',steps:[
    {h:'Kurz testen',say:[TASKS.FQ.size+' Fragen, keine Note, keine Zeit.','Tippe eine Antwort an. Dann tippe auf **Weiter**.','Am Ende siehst du, was du schon kannst.']}
  ]},
  FA:{title:'Abschlusscheck',steps:[
    {h:'So geht\'s',say:['Der Abschlusscheck hat '+TASKS.FA.size+' Aufgaben.',FA_TAP+' tippst du an, '+FA_CALC.length+' löst du selbst.','Ab '+needOf(TASKS.FA.size)+' richtigen gibt es die Urkunde.']},
    {h:'Darauf achten',say:['Tipps gibt es nur bei den Aufgaben zum Lösen.','Aufgaben mit Tipp zählen nur halb.']}
  ]}
});

/* ---------- P24 Wörterliste je Etappe und Antipp-Lexikon ----------
   GLOSSAR: Fachwort → ein Satz und (frei) ein kleines Bild. Fett gesetzte Fachwörter (**Hauptnenner**) und [[Wort]] in Erklärungen,
   Tipps und Merkzetteln werden unterstrichen; Antippen öffnet die Mini-Erklärung. WORDS: höchstens 3 neue Fachwörter je Etappe,
   davor die Alltagssprache (ALLTAG). */
const GLOSSAR={
  'Zähler':{txt:'Die Zahl über dem Bruchstrich. Sie zählt die gemeinten Teile.',fig:[3,4]},
  'Nenner':{txt:'Die Zahl unter dem Bruchstrich. Sie sagt, in wie viele gleich große Teile das Ganze geteilt ist.',fig:[3,4]},
  'gemischte Zahl':{txt:'Ganze und ein Bruchteil zusammen, zum Beispiel 1 und drei Viertel.'},
  'erweitern':{txt:'Zähler und Nenner mit derselben Zahl malnehmen. Der Wert bleibt gleich.',fig:[2,4]},
  'kürzen':{txt:'Zähler und Nenner durch dieselbe Zahl teilen. Der Wert bleibt gleich.',fig:[1,2]},
  'gleichwertig':{txt:'Zwei Brüche sind gleich viel, auch wenn sie verschieden aussehen.'},
  'Zahlenstrahl':{txt:'Ein Streifen am Lineal: Jeder Bruch hat dort seinen Platz.'},
  'Einteilung':{txt:'In wie viele gleiche Abschnitte ein Ganzes am Zahlenstrahl geteilt ist.'},
  'gemeinsamer Nenner':{txt:'Ein Nenner, der zu beiden Brüchen passt.'},
  'gleichnamig':{txt:'Brüche mit demselben Nenner.'},
  'ungleichnamig':{txt:'Brüche mit verschiedenen Nennern.'},
  'Hauptnenner':{txt:'Der kleinste gemeinsame Nenner von zwei Brüchen.'}
};
const GLOSS_FORMS={'zähler':'Zähler','nenner':'Nenner','gemischte zahl':'gemischte Zahl','gemischten zahl':'gemischte Zahl','erweitern':'erweitern','erweiterst':'erweitern',
  'kürzen':'kürzen','kürzt':'kürzen','gleichwertig':'gleichwertig','zahlenstrahl':'Zahlenstrahl','einteilung':'Einteilung','gemeinsamer nenner':'gemeinsamer Nenner',
  'gemeinsamen nenner':'gemeinsamer Nenner','gleichnamig':'gleichnamig','gleichnamige':'gleichnamig','ungleichnamig':'ungleichnamig','ungleichnamige':'ungleichnamig','hauptnenner':'Hauptnenner'};
const glossKey=(w)=>GLOSS_FORMS[String(w).trim().toLowerCase()]||null;
const WORDS={F:['Zähler','Nenner','gemischte Zahl'],E:['erweitern','kürzen','gleichwertig'],Z:['Zahlenstrahl','Einteilung'],W:['gemeinsamer Nenner'],R:['gleichnamig'],H:['ungleichnamig','Hauptnenner']};
const ALLTAG={'Zähler':'die gefärbten Teile','Nenner':'alle Teile','gemischte Zahl':'mehr als ein Ganzes','erweitern':'feiner einteilen','kürzen':'gröber einteilen','gleichwertig':'gleich viel',
  'Zahlenstrahl':'Streifen am Lineal','Einteilung':'Striche zwischen zwei Zahlen','gemeinsamer Nenner':'gleich einteilen','gleichnamig':'gleich eingeteilt','ungleichnamig':'verschieden eingeteilt','Hauptnenner':'die kleinste gemeinsame Einteilung'};
function openGloss(key){
  const g=GLOSSAR[key];if(!g)return;
  const m=modal([el('h2',null,key),el('p',null,g.txt),ALLTAG[key]?el('p',{class:'glalltag'},'Im Alltag: '+ALLTAG[key]+'.'):null,
    g.fig?fFig(g.fig[0],g.fig[1],{maxW:160}):null,
    el('button',{type:'button',class:'btn primary',onclick:()=>m.remove()},'Schließen')]);
  m.classList.add('glossmodal');m.addEventListener('click',e=>{if(e.target===m)m.remove();});
}
function glossTerm(word,node){
  const key=glossKey(word);if(!key)return node;
  return el('button',{type:'button',class:'gloss','aria-label':word+': Erklärung öffnen',onclick:(e)=>{e.stopPropagation();openGloss(key);}},node);
}
/* Zeile „Neue Wörter“ auf der Etappenseite */
function wordsRow(mod){
  const w=WORDS[mod.letter]||[];if(!w.length)return null;
  return el('div',{class:'wordsrow'},el('span',{class:'wl'},'Neue Wörter:'),...w.map(k=>el('button',{type:'button',class:'gloss chipword',onclick:()=>openGloss(k)},k)));
}

/* ---------- P12 Erklärungen kürzen: höchstens 2 Karten je Station, je Karte höchstens 3 Sätze ----------
   Karte 1 „So geht's“ (das vorgerechnete Beispiel mit Bild: die erste Karte), Karte 2 „Darauf achten“ (die Karte mit einem typischen Fehler
   oder Merksatz, sonst die letzte inhaltliche). Die alte Überschrift bleibt als Unterzeile (sub). Bedienhinweise („So antwortest du“) entfallen:
   die Probe zeigt die Bedienung. Eingangstests und Abschlusschecks behalten ihre (kurzen) Karten, höchstens 2. */
/* feste Auswahl, wo die Regel nicht passt: [Karte 1, Karte 2] als Index der ausführlichen Fassung */
const INTRO_PICK={H02:[1,0],H03:[1,3]}; /* H03: Teilung übertragen, dann die Brückenkarte (P7) */
const INTRO_C2=/acht|fehler|vorsicht|falle|nicht|merk|wichtig|prüf|aufpass|nur|immer/i;
function shortIntro(I,id){
  if(!I||!Array.isArray(I.steps))return I;
  const isTest=!!(QCHK[id]||finalModOf(id));
  const cut=(s,h)=>Object.assign({},s,{h,sub:s.h!==h?s.h:undefined,say:s.say.slice(0,3)});
  if(isTest)return Object.assign({},I,{steps:I.steps.slice(0,2).map(s=>Object.assign({},s,{say:s.say.slice(0,3)}))});
  if(I.steps.length&&I.steps[0].h==='So geht\'s')return Object.assign({},I,{steps:I.steps.slice(0,2).map(s=>Object.assign({},s,{say:s.say.slice(0,3)}))});
  const content=I.steps.filter(s=>!/antwortest|so geht es|bedienung/i.test(s.h));
  const list=content.length?content:I.steps;
  const pick=INTRO_PICK[id];
  if(pick)return Object.assign({},I,{steps:[cut(I.steps[pick[0]],'So geht\'s')].concat(pick[1]!=null?[cut(I.steps[pick[1]],'Darauf achten')]:[])});
  const c1=list[0],rest=list.slice(1).filter(s=>!s.tryit&&!s.nltry&&!/probier/i.test(s.h));
  const c2=rest.find(s=>INTRO_C2.test(s.h))||rest.find(s=>s.say.some(x=>INTRO_C2.test(x)))||rest[rest.length-1];
  return Object.assign({},I,{steps:[cut(c1,'So geht\'s')].concat(c2?[cut(c2,'Darauf achten')]:[])});
}
const INTRO_LONG={};
Object.keys(INTRO).forEach(id=>{INTRO_LONG[id]=INTRO[id];INTRO[id]=shortIntro(INTRO[id],id);});
