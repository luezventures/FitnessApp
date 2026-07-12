/* ============================================
   STATISTIK.JSX — Wochenübersicht
   
   Zeigt: 3 Kennzahlen-Kacheln (Workouts, Laufkilometer,
   Volumen) für eine wählbare Woche (Montag-Sonntag),
   mit Vor/Zurück-Navigation.
   ============================================ */

import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Statistik.css'

function Statistik() {

  /* ===== DATEN ===== */
  const [saetze] = useLocalStorage('fitnessapp_saetze', [])
  const [laeufe] = useLocalStorage('fitnessapp_laeufe', [])
  const [radfahrten] = useLocalStorage('fitnessapp_fahrten', [])

  // Welche Woche wird angezeigt? 0 = diese Woche, -1 = letzte Woche, ...
  const [wochenOffset, setWochenOffset] = useState(0)


  /* ===== MONTAG DER GEWÄHLTEN WOCHE FINDEN ===== */

  function montagDerWoche(offset) {
    const heute = new Date()
    const wochentag = heute.getDay()  // 0 = Sonntag, 1 = Montag, ...

    // Sonderfall Sonntag: 6 Tage zurück zum Montag davor.
    // Sonst: normale Rechnung.
    const tageZumMontag = wochentag === 0 ? 6 : wochentag - 1

    const montag = new Date(heute)
    montag.setDate(heute.getDate() - tageZumMontag + (offset * 7))

    // Uhrzeit auf Mitternacht setzen, damit reine Datumsvergleiche sauber sind
    montag.setHours(0, 0, 0, 0)

    return montag
  }

  // Ein Date-Objekt in "2026-07-06"-Format bringen (gleiches Format wie beim Speichern)
  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }


  /* ===== DIE 7 TAGE DER GEWÄHLTEN WOCHE ===== */

  const montag = montagDerWoche(wochenOffset)

  // Array mit 7 Datums-Strings, Montag bis Sonntag
  const wochenTage = []
  for (let i = 0; i < 7; i++) {
    const tag = new Date(montag)
    tag.setDate(montag.getDate() + i)
    wochenTage.push(alsDatumString(tag))
  }

  const sonntag = wochenTage[6]


  /* ===== FILTERN: was liegt in diesem Zeitfenster ===== */

  const saetzeDieserWoche = saetze.filter(satz => wochenTage.includes(satz.datum))
  const laeufeDieserWoche = laeufe.filter(lauf => wochenTage.includes(lauf.datum))
  const radfahrtenDieserWoche = radfahrten.filter(fahrt => wochenTage.includes(fahrt.datum))
  


  /* ===== KENNZAHLEN BERECHNEN ===== */

  // Workouts = Anzahl unterschiedlicher Tage mit mindestens einem Satz.
  // Set() lässt nur einzigartige Werte zu — doppelte Tage fallen automatisch weg.
  const trainingsTage = new Set(saetzeDieserWoche.map(satz => satz.datum))
  const anzahlWorkouts = trainingsTage.size

  // Laufkilometer: Distanzen aufsummieren
  const laufKilometer = laeufeDieserWoche.reduce(
    (summe, lauf) => summe + lauf.distanz,
    0
  )

  // Radkilometer: Distanzen aufsummieren
  const radKilometer = radfahrtenDieserWoche.reduce(
    (summe, fahrt) => summe + fahrt.distanz,
    0
  )

  // Volumen: Gewicht × Wiederholungen, aufsummiert
  const gesamtVolumen = saetzeDieserWoche.reduce(
    (summe, satz) => summe + satz.gewicht * satz.wiederholungen,
    0
  )


  /* ===== ANZEIGE-HELFER ===== */

  // Datumsbereich schön formatieren: "6. – 12. Juli"
  function formatiereBereich() {
    const monatsNamen = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ]
    const sonntagDate = new Date(montag)
    sonntagDate.setDate(montag.getDate() + 6)

    const startTag = montag.getDate()
    const endTag = sonntagDate.getDate()
    const startMonat = monatsNamen[montag.getMonth()]
    const endMonat = monatsNamen[sonntagDate.getMonth()]

    // Gleicher Monat? Dann nur einmal nennen.
    if (startMonat === endMonat) {
      return `${startTag}. – ${endTag}. ${endMonat}`
    }
    return `${startTag}. ${startMonat} – ${endTag}. ${endMonat}`
  }

  function istDieseWoche() {
    return wochenOffset === 0
  }

  // Zahlen mit Komma statt Punkt, eine Nachkommastelle
  function formatiereKm(zahl) {
    return zahl.toFixed(1).replace('.', ',')
  }

  function formatiereVolumen(zahl) {
    return Math.round(zahl).toLocaleString('de-DE')
  }

  // Prüft für einen Tag: gab's Gym-Sätze und/oder Läufe?
    function tagesStatus(datumString) {
    const hatTraining = saetzeDieserWoche.some(satz => satz.datum === datumString)
    const hatLauf = laeufeDieserWoche.some(lauf => lauf.datum === datumString)
    const hatRadfahren = radfahrtenDieserWoche.some(fahrt => fahrt.datum === datumString)
    const istHeute = datumString === alsDatumString(new Date())

    return { hatTraining, hatLauf, hatRadfahren, istHeute }
    }

    // Kurzes Kürzel für den Wochentag: "Mo", "Di", ...
    function wochentagsKuerzel(datumString) {
    const tage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
    const date = new Date(datumString)
    return tage[date.getDay()]
    }

    // Nur die Tageszahl: "9" aus "2026-07-09"
    function tagesZahl(datumString) {
    return parseInt(datumString.split('-')[2])
    }

  /* ===== ANZEIGE ===== */

  return (
    <div className="statistik">

      {/* Wochen-Navigation */}
      <div className="wochen-nav">
        <button
          className="wochen-pfeil"
          onClick={() => setWochenOffset(wochenOffset - 1)}
          aria-label="Vorherige Woche"
        >
          ‹
        </button>

        <div className="wochen-label">
          <span className="wochen-bereich">{formatiereBereich()}</span>
          {istDieseWoche() && <span className="wochen-badge">Diese Woche</span>}
        </div>

        <button
          className="wochen-pfeil"
          onClick={() => setWochenOffset(wochenOffset + 1)}
          disabled={istDieseWoche()}
          aria-label="Nächste Woche"
        >
          ›
        </button>
      </div>

      {/* Tages-Streifen */}
      <div className="tage-streifen">
        {wochenTage.map(tag => {
            const status = tagesStatus(tag)
            return (
            <div key={tag} className={`tag-kachel ${status.istHeute ? 'heute' : ''}`}>
                <div className="tag-name">{wochentagsKuerzel(tag)}</div>
                <div className="tag-zahl">{tagesZahl(tag)}</div>
                <div className="tag-punkte">
                {status.hatTraining && <span className="punkt orange"></span>}
                {status.hatLauf && <span className="punkt gruen"></span>}
                {status.hatRadfahren && <span className="punkt lila"></span>}
                </div>
            </div>
            )
        })}
        </div>

      {/* Die drei Kennzahlen-Kacheln */}
      <div className="kacheln-grid">

        <div className="kachel">
          <div className="kachel-label">
            <span className="kachel-dot blau"></span>
            Workouts
          </div>
          <div className="kachel-wert blau">{anzahlWorkouts}</div>
          <div className="kachel-sub">Trainingstage</div>
        </div>

        <div className="kachel">
          <div className="kachel-label">
            <span className="kachel-dot amber"></span>
            Volumen
          </div>
          <div className="kachel-wert amber">
            {formatiereVolumen(gesamtVolumen)}<span className="einheit">kg</span>
          </div>
          <div className="kachel-sub">
            {saetzeDieserWoche.length}{' '}
            {saetzeDieserWoche.length === 1 ? 'Satz' : 'Sätze'}
          </div>
        </div>

        <div className="kachel">
          <div className="kachel-label">
            <span className="kachel-dot gruen"></span>
            Laufen
          </div>
          <div className="kachel-wert gruen">
            {formatiereKm(laufKilometer)}<span className="einheit">km</span>
          </div>
          <div className="kachel-sub">
            {laeufeDieserWoche.length}{' '}
            {laeufeDieserWoche.length === 1 ? 'Lauf' : 'Läufe'}
          </div>
        </div>

        <div className="kachel">
          <div className="kachel-label">
            <span className="kachel-dot lila"></span>
            Radfahren
          </div>
          <div className="kachel-wert lila">
            {formatiereKm(radKilometer)}<span className="einheit">km</span>
          </div>
          <div className="kachel-sub">
            {radfahrtenDieserWoche.length}{' '}
            {radfahrtenDieserWoche.length === 1 ? 'Radtour' : 'Radtouren'}
          </div>
        </div>
      </div>

      {/* Leerer Zustand, falls in der Woche nichts geloggt wurde */}
      {saetzeDieserWoche.length === 0 && laeufeDieserWoche.length === 0 && radfahrtenDieserWoche.length === 0 && (
        <div className="leer-hinweis">
          Keine Einträge in dieser Woche.
        </div>
      )}

    </div>
  )
}

export default Statistik