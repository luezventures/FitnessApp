# FitnessApp

Eine Open-Source-Fitness-App, die ich Stück für Stück selbst baue – mit den Tools, auf die ich wirklich Bock habe.

**Live:** https://luezventures.github.io/FitnessApp/

> **Status:** früh. Das Grundgerüst steht und geht bei jedem Push automatisch live. Die eigentlichen Features kommen jetzt eins nach dem anderen dazu.

## Worum geht's

Statt eine fertige Fitness-App aus dem Store zu nehmen, baue ich meine eigene – genau so, wie ich sie will, mit den Funktionen, die ich im Training und beim Laufen tatsächlich brauche. Alles offen, alles nachvollziehbar. Jedes Tool ist ein eigener Schritt und landet einzeln hier im Repo.

Den Bau-Prozess dokumentiere ich ehrlich (inklusive der Fehler) auf https://instagram.com/luezventures.

## Geplante Tools

Noch nichts davon fertig – das ist die Ideenliste, aus der nach und nach echte Features werden:

- Satz-Logger fürs Gym (Gewicht, Wiederholungen, Sätze)
- Progressive-Overload-Tracker über die Wochen
- Körpergewicht-Tracker (Lean Bulk)
- 1RM- und Plate-Rechner
- Lauf- und Trainingsplan

## Tech-Stack

- **React** + **Vite** – Oberfläche und Build
- **JavaScript**
- **localStorage** – Daten liegen lokal im Browser, kein Server nötig
- **GitHub Pages** + **GitHub Actions** – automatisches Deployment bei jedem Push

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) (LTS-Version).

```bash
git clone https://github.com/luezventures/FitnessApp.git
cd FitnessApp
npm install
npm run dev
```

Danach im Browser die angezeigte Adresse öffnen (meist http://localhost:5173/).

Weitere Befehle:

- `npm run build` – Produktions-Build in den `dist`-Ordner
- `npm run preview` – den Build lokal testen, so wie er live läuft

## Deployment

Läuft automatisch: Jeder Push auf `main` baut die App per GitHub Actions und stellt sie auf GitHub Pages live. Kein manueller Schritt nötig.


## Lizenz

GNU AFFERO GENERAL PUBLIC LICENSE