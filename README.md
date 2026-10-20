# Bruchwerkstatt – Erweitern und Kürzen

Interaktive Übungsumgebung als einzelne Datei: `index.html` im Browser öffnen (kein Server, keine Bibliotheken, kein Internet nötig).

- 12 Übungen (G01–G03, B01, U01–U03, O01–O02, D01–D03) und 2 Spiele (Bruch-Memory, Bruch-Tresor), je Niveau 1 und 2
- Brüche werden immer mit Bruchstrich dargestellt; Niveau 2 nutzt größere Zahlen
- Merkkästen M1–M6, zweistufige Tipps (Kürzen-Tipps nennen immer: *Die 2 geht IMMER, wenn Zähler und Nenner gerade sind*; ebenso 5 und 10)
- Fortschritt wird lokal im Browser gespeichert
- Selbsttest in der Entwicklerkonsole: `runSelfTests()`

## Design

Blaupausen-Look: Aufgaben sind Zeichenblätter mit Schriftfeld, Erweitern (orange, ×) und Kürzen (petrol, ÷) haben feste Farben, Hilfen liegen auf hellem Pauspapier. Eigene Linien-Symbole statt Emoji, nur System-Schriften.
