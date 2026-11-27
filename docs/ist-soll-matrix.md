# Ist-Soll-Matrix zum Implementierungsauftrag (AP00)

Stand: 27.11.2026, Basis `main` dde62b2 (v153). Quelle: Quellcode, keine Nutzertests.
Status: **vorhanden** / **teilweise** / **fehlt** / **n. z.** (nicht zutreffend).

| AP | Status | Was es schon gibt (Datei, Funktion) | Lücke |
|---|---|---|---|
| AP01 Fehlerspezifische Aufgabenwahl | teilweise | Fehlerdiagnosen je Etappe, z. B. `vtDiagnose` (js/vervielfachen-math.js), `wrong(code,…)` in den Prüfern, Fehlerliste je Station | Kein Protokoll je abgeschlossener Aufgabe (Kompetenz, erster Versuch, Hilfen, Zeit). Keine Förderaufgabe nach zwei gleichen Fehlern. Kein Grundlagen-Rücksprung. |
| AP02 Kompetenznachweise | teilweise | `S.skills[skill].h` (letzte 10, js/exercise.js `recordSkill`) nur für Schnellaufgaben; Eingangstest `qEvaluate` mit sitzt/fast/üben (js/path.js) | Keine fünf Stufen je Teilkompetenz. Hilfe und Lösung werden nicht getrennt bewertet. Kein dritter Versuch bei widersprüchlichem Eingangstest. Abschlusscheck wertet nur die Gesamtpunktzahl. |
| AP03 Positive Fehlerkultur | teilweise | XP sinken nie; Abzeichen „Selbst korrigiert“ (Etappe V) | **Treffer-Konto halbiert sich bei jedem Fehler** (`halveStreak`, js/exercise.js:105). Korrektur nur in Etappe V sichtbar. |
| AP04 Nächste Lernhandlung | teilweise | Karte „Weiter: …“ auf der Lernen-Seite (js/home.js, js/path.js) | Begründung nur allgemein, keine Lücken-Logik, keine zweite Wahl, Wiederholung nicht als Zusatz. |
| AP05 Mehrdimensionale Differenzierung | teilweise | Leicht/Knifflig, Pflicht- und Plus-Stationen, viele Darstellungen (Streifen, Kreis, Rechteck, Zahlenstrahl) | Zahlen und Bildhilfe sind gekoppelt; keine unabhängige Wahl. |
| AP06 Adaptive Hilfen | teilweise | Tipps in Stufen („Tipp 1 von n“), Musterlösung getrennt (`openSolutionSheet`) | Stufen nicht einheitlich als Denkimpuls / Bild / Teilschritt. Kein Hilfenabbau nach Erfolgen. |
| AP07 Visuelle Hierarchie | teilweise | Feste Aktionsleiste unten, eigene Zahlentastatur, `fitPage` | Startseite scrollt am Handy und am Tablet. XP-Chip und Rang während der Aufgabe sichtbar. Viele gleich laute Rahmen, Raster, Schraffuren. |
| AP08 Rundenauswertung | teilweise | Zeilen „1. Versuch ohne Tipp“, „nach Versuchen“, „übersprungen“, „Lösung angezeigt“ (js/exercise.js:399) | Drei Kategorien nicht zusammengefasst, keine drei Aussagen „gelingt gut / verbessert / als Nächstes“. |
| AP09 Gewichtete Wiederholung | teilweise | `whPlan` (js/wiederholen.js): Fehler × 3 + Tage | **Fehlerzähler `err` sinkt nie**; alte Fehler dominieren dauerhaft. Hilfebedarf nicht getrennt. |
| AP10 Belohnungen bündeln | teilweise | Lernkarte, Ränge, Abzeichen, Urkunden, Sammelkarten | **Rang- und Abzeichen-Fenster öffnen zeitversetzt** (900 ms / 1200 ms, js/rank.js:63, js/werkstatt.js:65) und können eine neue Aufgabe überdecken. |
| AP11 Transfer nach Lösungsanzeige | fehlt | – | Keine Folgeaufgabe nach aufgedeckter Lösung. |
| AP12 Werkstattfiguren | teilweise | Vier Figuren, Sprechblasen „Name sagt:“ in Erklärkarten (js/werkstatt.js `speechBubble`) | Keine feste Denkrolle je Figur in den Aufgaben. |
| AP13 Plusaufgaben | teilweise | Fehlerdetektiv, Zahlenrätsel, „finde“-Aufgaben in mehreren Etappen | Nicht in jeder Etappe Strategievergleich oder „alle finden“. |
| AP14 Sprache | weitgehend vorhanden | Satzregel ≤ 14 Wörter, `runWordScan`, Lehrbuchbegriffe | Textinventar fehlt; Operatoren nicht überall gleich. |
| AP15 Touch und Tastatur | teilweise | Tippflächen `--tap` ≥ 44 px, Enter = Prüfen, Ziehen auch per Antippen | Fokus nach Dialogen, Fokusreihenfolge und Live-Region nicht durchgehend geprüft. |
| AP16 Aufgabenanzahl | fehlt | Feste Rundengröße je Station | Kein früherer Abschluss, keine Zusatzaufgaben. |
| AP17 Langfristige Überprüfung | fehlt | – | Keine Intervalle 2/7/21 Tage. |
| AP18 Export/Import | fehlt | Speicher `bruchwerkstatt_v1` (js/store.js) | Kein Export, kein Import, kein Schema-Feld für Migrationen außer `addsubV`. |
| AP19 Wochenziele | teilweise | Wochenziel fest 3 von 5 Schultagen (`WEEK_GOAL`, js/werkstatt.js:76) | Nicht einstellbar, nicht abschaltbar. |
| AP20 Feinschliff | n. z. (später) | Bewegung reduziert per Systemeinstellung | Erst nach P0/P1. |

## Designbefund (Skills ui-ux-pro-max, design-system)

- 32 Tokens, aber 41 feste Farbwerte direkt in css/app.css.
- Hintergrundraster, Doppelrahmen, Eckmarken und Schraffuren auf Knöpfen erzeugen viele gleich laute Reize.
- Startseite: Lernkarte scrollt bei 390 × 844 und 1024 × 768; die Etappenkarte füllt am Tablet fast den ganzen Bildschirm.
- Positiv: feste Aktionsleiste, eigene Zahlentastatur, Tippflächen ≥ 44 px, Systemschrift (offline), Bewegung abschaltbar.
