/* ============================================
   RADFAHREN.JSX — Radtouren eintragen

   Gleiche Bausteine wie der Lauf-Logger:
   - useLocalStorage zum Speichern
   - controlled inputs
   - Liste der heutigen Touren

   Anders als beim Laufen zeigen wir keine Pace
   an, nur km/h — beim Radfahren ist die
   Geschwindigkeit die gängige Kennzahl.
   ============================================ */

import { useState } from 'react'
import { RADTOUREN } from '../data/radfahren'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Radfahren.css'

function Radfahren() {

  /* ===== DATEN ===== */
  const [fahrten, setFahrten] = useLocalStorage('fitnessapp_fahrten', [])

  const [distanz, setDistanz] = useState('')
  const [stunden, setStunden] = useState('')
  const [minuten, setMinuten] = useState('')
  const [sekunden, setSekunden] = useState('')
  const [radtour, setRadtour] = useState(RADTOUREN[0])


  /* ===== ABGELEITETE DATEN ===== */

  // Lokales Datum statt toISOString() (das ist UTC) — sonst bekommen
  // Einträge kurz nach Mitternacht das Datum des Vortags und fallen
  // in Statistik.jsx aus der aktuellen Woche raus.
  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }

  const heute = alsDatumString(new Date())
  const heutigeFahrten = fahrten.filter(fahrt => fahrt.datum === heute)


  /* ===== BERECHNUNGEN ===== */

  // Alles in Sekunden umrechnen — einfacher zu rechnen
  function gesamtSekunden(h, m, s) {
    return (parseInt(h) || 0) * 3600
         + (parseInt(m) || 0) * 60
         + (parseInt(s) || 0)
  }

  // Geschwindigkeit in km/h
  function berechneKmh(km, sekundenGesamt) {
    if (!km || km <= 0 || sekundenGesamt <= 0) return null

    const stunden = sekundenGesamt / 3600
    const kmh = km / stunden
    return kmh.toFixed(1).replace('.', ',')  // 10.9 → "10,9"
  }

  // Live-Vorschau, während man eintippt
  const aktuelleSekunden = gesamtSekunden(stunden, minuten, sekunden)
  const aktuelleDistanz = parseFloat(distanz.replace(',', '.'))  // Komma erlauben
  const vorschauKmh = berechneKmh(aktuelleDistanz, aktuelleSekunden)


  /* ===== FUNKTIONEN ===== */

  function speichereRide() {
    if (!aktuelleDistanz || aktuelleSekunden <= 0) return

    const neuerRide = {
      id: Date.now(),
      distanz: aktuelleDistanz,
      sekunden: aktuelleSekunden,
      radtour: radtour,
      kmh: berechneKmh(aktuelleDistanz, aktuelleSekunden),
      datum: heute,
      zeitstempel: Date.now(),
    }

    setFahrten([neuerRide, ...fahrten])

    // Felder leeren
    setDistanz('')
    setStunden('')
    setMinuten('')
    setSekunden('')
  }

  function loescheRide(id) {
    setFahrten(fahrten.filter(fahrt => fahrt.id !== id))
  }

  // Zeit schön formatieren für die Anzeige: "52:30" oder "1:05:12"
  function formatiereZeit(sek) {
    const h = Math.floor(sek / 3600)
    const m = Math.floor((sek % 3600) / 60)
    const s = sek % 60
    const sStr = s.toString().padStart(2, '0')
    if (h > 0) {
      const mStr = m.toString().padStart(2, '0')
      return `${h}:${mStr}:${sStr}`
    }
    return `${m}:${sStr}`
  }


  /* ===== ANZEIGE ===== */

  return (
    <div className="rad-logger">

      {/* Eingabe-Karte */}
      <div className="rad-karte">

        {/* Radtour als Dropdown */}
        <div className="rad-feld">
          <label>Art</label>
          <select
            value={radtour}
            onChange={(e) => setRadtour(e.target.value)}
            className="rad-select"
          >
            {RADTOUREN.map(tour => (
              <option key={tour} value={tour}>{tour}</option>
            ))}
          </select>
        </div>

        {/* Distanz */}
        <div className="rad-feld">
          <label>Distanz (km)</label>
          <input
            type="text"
            inputMode="decimal"
            value={distanz}
            onChange={(e) => setDistanz(e.target.value)}
            placeholder="z.B. 10,52"
          />
        </div>

        {/* Zeit: drei Felder */}
        <div className="rad-feld">
          <label>Zeit</label>
          <div className="zeit-reihe">
            <input
              type="number"
              inputMode="numeric"
              value={stunden}
              onChange={(e) => setStunden(e.target.value)}
              placeholder="h"
            />
            <span className="zeit-trenner">:</span>
            <input
              type="number"
              inputMode="numeric"
              value={minuten}
              onChange={(e) => setMinuten(e.target.value)}
              placeholder="min"
            />
            <span className="zeit-trenner">:</span>
            <input
              type="number"
              inputMode="numeric"
              value={sekunden}
              onChange={(e) => setSekunden(e.target.value)}
              placeholder="sek"
            />
          </div>
        </div>

        {/* Live-Vorschau von km/h */}
        {vorschauKmh && (
          <div className="vorschau">
            <div className="vorschau-item">
              <span className="vorschau-wert">{vorschauKmh}</span>
              <span className="vorschau-label">km/h</span>
            </div>
          </div>
        )}

        <button className="speichern-btn" onClick={speichereRide}>
          Radfahren speichern
        </button>

      </div>


      {/* Heutige Rides */}
      {heutigeFahrten.length > 0 && (
        <div className="section">
          <div className="section-label">
            Heute — {heutigeFahrten.length}{' '}
            {heutigeFahrten.length === 1 ? 'Ride' : 'Rides'}
          </div>
          <div className="ride-liste">
            {heutigeFahrten.map(ride => (
              <div key={ride.id} className="ride-zeile">
                <div className="ride-info">
                  <div className="ride-haupt">
                    <span className="ride-distanz">
                      {ride.distanz.toString().replace('.', ',')} km
                    </span>
                    <span className="ride-zeit">{formatiereZeit(ride.sekunden)}</span>
                  </div>
                  <div className="ride-meta">
                    <span className="ride-art">{ride.radtour}</span>
                  </div>
                </div>
                <button
                  className="loeschen-btn"
                  onClick={() => loescheRide(ride.id)}
                  aria-label="Ride löschen"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default Radfahren
