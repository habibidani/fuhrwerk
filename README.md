# Fuhrwerk

**Fuhrpark-Fragen, mit Daten beantwortet.**

Konzept-Prototyp v3 · Team 1, CODE University of Applied Sciences Berlin · M_10 Digital Product Development · Partner-Challenge mit dem Mobility Data Space (MDS)

Fuhrwerk ist eine Übersetzungsschicht zwischen kleinen Berliner Handwerksbetrieben (3 bis 30 Fahrzeuge) und Mobilitätsdaten. Der Inhaber tippt eine Frage auf Deutsch und bekommt eine Antwort auf einer Seite. Der Datenkatalog bleibt hinter dem Vorhang, die eigenen Daten bleiben im Betrieb, und ein optionaler letzter Schritt lässt den Betrieb aggregierte Zahlen über seine Innung in den Datenraum zurückgeben.

## Status

Work in progress, 22. Oktober 2026. Alle externen Zahlen (Ladepunkte, Parkzonen, Kosten) sind noch **Beispielwerte** und in der App als solche markiert. Nichts wird gesendet. Keine Rechtsberatung.

## Was die App kann

| Bereich | Funktion |
| --- | --- |
| Frage | Freitext auf Deutsch, drei Beispiel-Chips, Betriebsprofil (Branche, Fahrzeuge, Bezirke) bleibt im Browser |
| Verstanden | Erkannte Absicht, Datenbedarf-Tabelle: was im Haus bleibt, was von außen kommt, je mit Status (vorhanden, teilweise, Lücke, Beispiel), Quelle, Stand, Lizenz |
| Meine Touren | Eigene Touren (Bezirk, km, Zeiten, Wochentage) eintragen; die Antwort rechnet damit statt mit Beispieldaten; Beispieltouren laden |
| Antwort | A4-Karte: ein Satz mit Zahl, drei Fakten, Tourtabelle oder Karte oder Auslastung je Wochentag, „Was morgen anders läuft“, Annahmen änderbar, Quellenliste; als PDF drucken, per WhatsApp teilen, als Text kopieren |
| Zurückgeben | Aggregierte Felder wählen, Weg über Innung oder Verband, Label „was rausgeht, was nie rausgeht“, Zusage wird lokal vorgemerkt |
| Verlauf | Letzte Fragen mit Antwort, Daumen hoch/runter mit Kommentar, vorgemerkte Zusagen, Export als JSON, alles löschen |
| Datenquellen | Alle Quellen mit Anbieter, Status, Lizenz, Stand, Kosten, inkl. der Lücke „Lieferzonen und Halteverbote“ und dem Weg in den MDS |

Drei Fragen werden erkannt (deutsche Stichwort-Erkennung): E-Transporter, Halten und Parken, Fuhrparkgröße. Alles andere wird ehrlich abgelehnt und im Verlauf notiert, nicht erraten.

## Lokal starten

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # statischer Build nach dist/
npm test           # Playwright-Tests gegen den Build (npm run build vorher)
```

Vercel: Repo importieren, Framework „Vite“, keine weiteren Einstellungen. Es gibt kein Backend; alle Daten bleiben im Browser (`localStorage`, Präfix `fuhrwerk.v3.`). Supabase ist als nächster Schritt für Feedback und Zusagen geplant.

Für die Tests in Containern ohne Playwright-Download: `PLAYWRIGHT_CHROMIUM_PATH=/pfad/zu/chrome npm test`.

## Audit Trail

### v1 „MDS Data Product Factory“ (27. Sep bis 16. Okt, Mika)

Zwei Richtungen: Flottendaten lokal scannen, sensible Felder klassifizieren, Privacy-Rezept, drei Freigaben, Angebot im MDS veröffentlichen; oder Produktidee beschreiben, Datenbedarf ableiten, simulierten Katalog durchsuchen, Sourcing-Blueprint erhalten. Gebaut für die Datenraum-Logik, auf Englisch.

### Synthetischer Test (16. bis 19. Okt)

12 KI-Personas, modelliert auf öffentliche Profile realer Berliner Betriebe (12 Branchen, 2 bis 40 Fahrzeuge), klicken v1 selbst durch: 12 Läufe, 24 getippte Fragen, 228 Screenshots. Alles synthetisch, nichts davon ist Evidenz; jede Erkenntnis trägt eine Vorhersage für das echte Gespräch.

### v2 Konzept (20. bis 22. Okt): neun Befunde, neun Entscheidungen

| Befund im synthetischen Test | Entscheidung |
| --- | --- |
| Deutsche Eingabe nicht gelesen; 12 von 12 landen im selben generischen Blueprint | Deutsche Stichwort-Flows; die Frage wird wörtlich gespiegelt; Unbekanntes wird abgelehnt, nicht erraten |
| Elektro-Pfad beantwortet den Ladesäulenbetreiber, nicht den Fuhrpark | Antwort je Tour: ja oder nein, mit Zahl |
| Katalog zeigt Fit-Prozente, „12 Metropolregionen“, „€€“ | Abdeckung je Bezirk, Preis in Euro, benannte Quellen, Lizenz und Stand |
| „Lokale Flottendaten nutzen“ hebt „Rohdaten bleiben lokal“ auf | Ein Satz: Ihre Daten bleiben im Haus, nur das Ergebnis wird gerechnet |
| „Sourcing-Anfrage erzeugen“: 9 von 12 brechen hier ab | Ergebnis ist eine druckbare A4-Karte oder eine WhatsApp-Nachricht; „nichts gesendet“ sichtbar |
| Upload-und-Veröffentlichen-Modus von 12 von 12 abgelehnt | Nur als optionaler letzter Schritt: zurückgeben, aggregiert, über die Innung |
| Freigabe-Gates wirken wie Konzern-Theater für zehn Leute | Ein klares Datenschutz-Label, keine Gates |
| Vorbefüllter Beispieltext wird kopiert statt ersetzt | Leeres Feld, Beispiele als Chips |
| Gewünschtes Ergebnis: ein Blatt Papier, Excel, WhatsApp, kein Dashboard | Antwort als A4-Karte |

### v3 App (22. Okt): von der Einzeldatei zur Anwendung

- Vite, React, TypeScript, Tailwind; Deployment als statische Seite
- **Meine Touren**: die Antwort rechnet mit den Touren des Betriebs (Reichweite je Tour, gleichzeitige Touren je Wochentag, Spitzen bis 2 h als lösbare Überlappung), nicht nur mit Beispieldaten
- **Datenquellen** als eigene Seite, jede Quelle mit Status; die Lücke „Lieferzonen und Halteverbote“ steht als Lücke drin
- **Verlauf und Feedback** lokal, als Vorstufe für Supabase
- Annahmen (Reichweite, Winterfaktor, Ladefenster) in der Antwort änderbar
- 8 Playwright-Tests für die drei Flows, unbekannte Eingaben, Zurückgeben, Feedback und Datenquellen

### Synthetischer Re-Test von v3 (22. Okt, drei KI-Personas: Gebäudereinigung, Elektro, Pflege)

Drei KI-Personas haben die v3-App per Playwright durchgeklickt (synthetisch, keine echten Menschen). Was daraus sofort geändert wurde: Überschrift beginnt mit „Beispielrechnung:“, solange keine eigenen Daten da sind; Flow B spricht von Beispieladressen, nicht von „Ihren“; Warnung, wenn weniger Touren als Fahrzeuge eingetragen sind; Sonntag und „Umland (Brandenburg)“ ergänzt; Ladefenster-Kachel an das Ergebnis gekoppelt; „außer …“ nur bei echter Überlappung; Singular/Plural; Stichwörter „zu viele“, „Autos“, „Wagen“, „Schicht“, „Umstellung“, „elektrifizieren“; Chip-Wahl im Verlauf als „Stichwort nicht erkannt“ markiert; Zurückgeben als Opt-in; kein vorbelegter Bezirk; die Antwort sagt, was sie nicht auswertet (Zahlen und Uhrzeiten aus der Frage). Offen: Uhrzeit-Logik für Parkzonen, „welche 4 Touren zuerst“, Schichtlogik je Branche, Touren-Import.

## Nächste Schritte

- Fünf echte Sessions mit Berliner Handwerksbetrieben (Woche 44), Einwilligung zuerst
- Erste echte Datenquelle anbinden: Ladesäulenregister der Bundesnetzagentur (Woche 45)
- Supabase für Fragen, Zusagen und Feedback (nach der WIP-Präsentation)
- Entscheidung „MDS-Flottenpfad oder nicht“ nach den Sessions, 30. Oktober

## Team

Daniel Kourie, Tom Blumenstock, Mika Viana Henrich, Gonçalo de Deus
