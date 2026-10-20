# Bruchwerkstatt – Erweitern und Kürzen

Interaktive Übungsumgebung als einzelne Datei: `index.html` im Browser öffnen (kein Server, keine Bibliotheken, kein Internet nötig). Gedacht für Schülerinnen und Schüler ab Klasse 6, vor allem am Handy.

- 16 Übungen, das Bruchlabor und 2 Spiele (Bruch-Memory, Bruch-Tresor), je Niveau „Leicht“ und „Knifflig“
- **Lernpfad** (Startseite): Bauteile als Anlagenschema, nacheinander freigeschaltet (Gleiche Anteile → Erweitern → Teilbarkeit → Kürzen → Kürzen so weit wie möglich → gemischt → Abschlusscheck); ein Bauteil ist fertig bei mindestens 80 % richtig in einer Runde oder per Check; der **Schnellcheck** schaltet am Anfang schon Gekonntes frei, ein **Kurztest** (5 Fragen) schaltet das nächste Bauteil frei; Tagesziel (1 Runde) mit Tage-Serie; Urkunde nach dem Abschlusscheck
- **Bruchlabor**: Erweitern und Kürzen ausprobieren – Streifen oder Kreis, Ausgang und Jetzt untereinander mit Maßlinien, ×2…×5 und ÷2…÷5 (nur wenn es aufgeht), dazu ein kurzer Entdeckerauftrag („Was bleibt gleich?“)
- **Schnellcheck**: 10 Blitzfragen zum Antippen (Ja/Nein, A–D), sofortige Rückmeldung, keine Zeitmessung; am Ende steht je Fähigkeit „sitzt“ oder „üben“ und die passende Übung als nächster Schritt
- Teilbarkeit mit 2, 3, 4, 5, 6, 9 und 10 – jeweils mit Regel und Rechnung
- Brüche werden immer mit Bruchstrich dargestellt; Zahlenbereich der Brüche: leicht bis 60, knifflig bis 300; Teilbarkeit: leicht bis 500, knifflig bis 1000
- Merkkästen M1–M7, zweistufige und einklappbare Tipps (Kürzen-Tipps nennen immer: *Die 2 geht IMMER, wenn Zähler und Nenner gerade sind*; ebenso 5 und 10)
- 12 Ränge (Praktikant … Legende); die Legende gibt es nur, wenn wirklich alles perfekt ist (perfekte Runden und 3 Sterne überall, Lernpfad, Labor, Spiele, Serien). Ein Tipp auf die Rang-Anzeige oben rechts öffnet die Optionen – dort ist auch das Bruchlabor jederzeit erreichbar
- Fortschritt (Punkte, Ränge, Serien, Sterne) wird lokal im Browser gespeichert
- Selbsttest in der Entwicklerkonsole: `runSelfTests()`

## Design

Blaupausen-Look: Aufgaben sind Zeichenblätter mit Schriftfeld, Erweitern (orange, ×) und Kürzen (petrol, ÷) haben feste Farben, Hilfen liegen auf hellem Pauspapier. Eigene Linien-Symbole statt Emoji, nur System-Schriften.
