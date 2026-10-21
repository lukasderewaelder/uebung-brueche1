'use strict';
/* =====================================================================
   Hilfe bei Problemen – technische Anleitung für Kinder von 11 bis 12 Jahren
   Kurze Sätze (runSelfTests prüft: höchstens 14 Wörter), „du“, Knöpfe genau so
   benannt wie auf dem Bildschirm; **fett** ist der Name eines Knopfes. Aufruf:
   Optionen, Rang-Seite, „Ups“-Meldung und Speicher-Hinweis. Immer nur ein Eintrag offen.
   ===================================================================== */
const PROBLEMS=[
  {id:'haengt',q:'Die Seite hängt oder zeigt „Ups“',
    steps:['Warte kurz. Manchmal braucht das Gerät einen Moment.','Tippe auf **Seite neu laden**. Das hilft meistens.','Klappt es nicht? Dann tippe auf **Neu starten**.'],
    acts:['reload','restart'],
    tip:'Deine Punkte, Ränge und Sterne bleiben erhalten. Nur angefangene Runden und Spiele beginnen von vorn.'},
  {id:'tastatur',q:'Ich kann keine Zahl eintippen',
    steps:['Die Tastatur vom Handy kommt hier nicht hoch. Das ist richtig so.','Tippe auf ein Feld. Es leuchtet dann gelb.','Tippe die Zahlen unten im Bild. Der Knopf mit dem X löscht die letzte Ziffer.','Der Pfeil-Knopf springt ins nächste Feld. Bei Dezimalzahlen setzt er das Komma.'],
    tip:'Am Computer tippst du mit der normalen Tastatur. Nach **Lösung ansehen** sind die Felder gesperrt. Tippe dann auf **Weiter**.'},
  {id:'groesse',q:'Alles ist zu klein, zu groß oder abgeschnitten',
    steps:['Tippe auf **Textgröße ändern**.','Wähle Klein, Normal, Groß oder Sehr groß.','Drehe das Handy. Manchmal passt es dann besser.'],
    acts:['size'],
    tip:'Später findest du sie oben rechts. Tippe auf deine Punkte, zum Beispiel „120 XP“. Am Computer geht auch: Strg gedrückt halten und + oder − drücken.'},
  {id:'speichern',q:'Mein Fortschritt ist weg',
    intro:'Dein Fortschritt wird im Browser auf deinem Gerät gespeichert. Der Browser ist das Programm, mit dem du Seiten öffnest. Zum Beispiel Chrome oder Safari.',
    steps:['Nutzt du dasselbe Gerät und denselben Browser wie sonst? Auf einem anderen Gerät fängst du neu an.','Ist dein Fenster privat (Inkognito)? Dort wird nichts gespeichert. Öffne die Seite dann normal.','Hast du **Fortschritt löschen** getippt oder Browser-Daten gelöscht? Dann ist alles weg. Das lässt sich nicht zurückholen.'],
    extra:storageState,
    tip:'Das ist ärgerlich. Aber du kannst sofort wieder Punkte sammeln.'},
  {id:'geschlossen',q:'Ich habe die Seite aus Versehen geschlossen',
    steps:['Öffne die Seite einfach wieder.','Du machst dort weiter, wo du aufgehört hast. Deine Punkte und deine Runde sind gespeichert.'],
    tip:'Die Zurück-Taste vom Handy geht in der Bruchwerkstatt Schritt für Schritt zurück. Ganz am Anfang verlässt du die Seite.'},
  {id:'aufgabe',q:'Ich komme bei einer Aufgabe nicht weiter',
    steps:['Tippe auf **Tipp**. Tippst du nochmal, kommt der nächste Tipp.','Tippe auf **Merkkasten**. Dort stehen die Regeln mit Beispielen.','Hast du es versucht oder einen Tipp gelesen? Dann erscheint **Lösung ansehen**. Dort siehst du den Rechenweg.'],
    tip:'Mit **Überspringen** kommt die nächste Aufgabe.'},
  {id:'thema',q:'Ich verstehe ein Thema nicht',
    steps:['Öffne das Thema. Zum Beispiel **Erweitern** im Lernpfad.','Tippe auf **Merkkasten**.','Tippe oben auf **Erklärung**. Dann siehst du sie noch einmal.'],
    tip:'Auch das **Bruchlabor** und der **Schnellcheck** haben eine Erklärung.'},
  {id:'hilfe',q:'Nichts davon hilft',last:true,
    steps:['Frag deine Lehrerin, deinen Lehrer oder jemanden zu Hause.','Erzähle genau, was du getippt hast. Sag auch, was dann passiert ist.','Zeige diese Angaben. Du kannst auch ein Foto vom Bildschirm machen.'],
    extra:techInfo}
];
/* „Neu starten“: angefangene Runden und Spiele verwerfen; Punkte, Ränge und Sterne bleiben */
function restartKeepPoints(){
  S.rounds={};Object.values(S.games).forEach(g=>{g.state=null;});S.view={kind:'home'};persist();location.reload();
}
/* Knöpfe in den Einträgen: [Beschriftung, Aktion] */
const HELP_ACTS={
  reload:['Seite neu laden',()=>location.reload()],
  restart:['Neu starten',restartKeepPoints],
  size:['Textgröße ändern',()=>{closeProblemHelp();openOptions();}]
};
/* Text mit **fett** → Textstücke und <strong> (nur eigene Texte, kein HTML) */
const rich=(s)=>s.split('**').map((t,i)=>i%2?strong(t):t);
/* Live-Zeile: meldet das Gerät, dass Speichern klappt? (Store.ok wird beim Start geprüft) */
function storageState(){
  return Store.ok
    ?el('p',{class:'techstate ok'},icon('haken'),el('span',null,'Dein Gerät meldet: Speichern klappt.'))
    :el('p',{class:'techstate bad'},icon('kreuz'),el('span',null,'Dein Gerät meldet: Speichern klappt gerade nicht. Dein Fortschritt bleibt nur, solange diese Seite offen ist.'));
}
/* Angaben, die eine Lehrkraft braucht, wenn ein Kind ein Problem meldet */
function techInfo(){
  const cur=(S.ui&&S.ui.size)||'m',size=TEXT_SIZES.filter(x=>x[0]===cur)[0],st=rankState();
  const rows=[['Bildschirm',innerWidth+' × '+innerHeight],['Textgröße',size?size[1]:'Normal'],['Speichern',Store.ok?'klappt':'klappt nicht'],['Rang',st.cur[1]+' · '+st.xp+' XP']];
  return el('div',{class:'techinfo'},el('div',{class:'tih'},'Technik-Angaben'),
    ...rows.map(r=>el('div',{class:'tir'},el('span',null,r[0]),el('b',null,r[1]))));
}

let techModal=null,techFrom=null;
function closeProblemHelp(){
  if(!techModal)return;
  techModal.remove();techModal=null;
  if(techFrom&&techFrom.isConnected)techFrom.focus();
  techFrom=null;
}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&techModal)closeProblemHelp();});
function problemItem(p,openId){
  const d=el('details',{class:'tech'+(p.last?' tech-last':''),'data-id':p.id,open:p.id===openId},
    el('summary',null,el('span',{class:'srow'},el('span',{class:'tq'},p.q),icon('ab'))),
    el('div',{class:'tbody'},
      p.intro?el('p',null,rich(p.intro)):null,
      el('ol',null,p.steps.map(s=>el('li',null,rich(s)))),
      p.extra?p.extra():null,
      p.acts?el('div',{class:'techact'},p.acts.map(k=>el('button',{type:'button',class:'btn',onclick:HELP_ACTS[k][1]},HELP_ACTS[k][0]))):null,
      p.tip?el('p',{class:'ttip'},icon('hinweis'),el('span',null,rich(p.tip))):null));
  /* Ein Eintrag öffnet sich, die anderen klappen zu */
  d.addEventListener('toggle',()=>{
    if(d.open&&d.parentNode)d.parentNode.querySelectorAll('details.tech[open]').forEach(o=>{if(o!==d)o.open=false;});
  });
  return d;
}
/* openId: Eintrag, der gleich offen sein soll (z. B. 'speichern') */
function openProblemHelp(openId){
  closeProblemHelp();
  techFrom=document.activeElement;
  const m=modal([
    el('div',{class:'helphead'},el('h2',{id:'techtitle'},'Hilfe bei Problemen'),
      el('button',{type:'button',class:'btn small',onclick:closeProblemHelp},'Schließen')),
    el('p',{class:'techlead'},'Tippe auf dein Problem. Dann siehst du, was du tun kannst.'),
    el('div',{class:'techlist'},PROBLEMS.map(p=>problemItem(p,openId))),
    el('div',{class:'techfoot'},el('button',{type:'button',class:'btn',onclick:closeProblemHelp},'Schließen'))]);
  m.classList.add('optmodal','techmodal');m.setAttribute('aria-labelledby','techtitle');
  techModal=m;
  m.addEventListener('click',e=>{if(e.target===m)closeProblemHelp();});
  const first=m.querySelector('details[open] summary')||m.querySelector('summary');
  if(first){first.focus();first.scrollIntoView({block:'nearest'});}
}

