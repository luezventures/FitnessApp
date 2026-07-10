/* ============================================
   LAUFLOGGER.JSX — Läufe eintragen
   
   Gleiche Bausteine wie der Satz-Logger:
   - useLocalStorage zum Speichern
   - controlled inputs
   - Liste der heutigen Läufe
   
   NEU: Berechnung von Pace und km/h aus
   Distanz und Zeit.
   ============================================ */

import { useState } from 'react'
import { LAUFARTEN } from '../data/laufarten'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './LaufLogger.css'

function LaufLogger() {

  /* ===== DATEN ===== */
  const [laeufe, setLaeufe] = useLocalStorage('fitnessapp_laeufe', [])

  const [distanz, setDistanz] = useState('')
  const [stunden, setStunden] = useState('')
  const [minuten, setMinuten] = useState('')
  const [sekunden, setSekunden] = useState('')
  const [laufart, setLaufart] = useState(LAUFARTEN[0])


  /* ===== ABGELEITETE DATEN ===== */

  const heute = new Date().toISOString().split('T')[0]
  const heutigeLaeufe = laeufe.filter(lauf => lauf.datum === heute)


  /* ===== BERECHNUNGEN =====
     Das Herz des Lauf-Loggers: aus Distanz und
     Zeit die Pace und Geschwindigkeit ableiten. */

  // Alles in Sekunden umrechnen — einfacher zu rechnen
  function gesamtSekunden(h, m, s) {
    return (parseInt(h) || 0) * 3600
         + (parseInt(m) || 0) * 60
         + (parseInt(s) || 0)
  }

  // Pace = Zeit pro Kilometer, Format "5:30"
  function berechnePace(km, sekundenGesamt) {
    if (!km || km <= 0 || sekundenGesamt <= 0) return null

    const sekProKm = sekundenGesamt / km
    const min = Math.floor(sekProKm / 60)
    const sek = Math.round(sekProKm % 60)

    // Sekunden immer zweistellig: 5:07 statt 5:7
    const sekStr = sek.toString().padStart(2, '0')
    return `${min}:${sekStr}`
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
  const vorschauPace = berechnePace(aktuelleDistanz, aktuelleSekunden)
  const vorschauKmh = berechneKmh(aktuelleDistanz, aktuelleSekunden)


  /* ===== FUNKTIONEN ===== */

  function speichereLauf() {
    if (!aktuelleDistanz || aktuelleSekunden <= 0) return

    const neuerLauf = {
      id: Date.now(),
      distanz: aktuelleDistanz,
      sekunden: aktuelleSekunden,
      laufart: laufart,
      pace: berechnePace(aktuelleDistanz, aktuelleSekunden),
      kmh: berechneKmh(aktuelleDistanz, aktuelleSekunden),
      datum: heute,
      zeitstempel: Date.now(),
    }

    setLaeufe([neuerLauf, ...laeufe])

    // Felder leeren
    setDistanz('')
    setStunden('')
    setMinuten('')
    setSekunden('')
  }

  function loescheLauf(id) {
    setLaeufe(laeufe.filter(lauf => lauf.id !== id))
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
    <div className="lauf-logger">

      {/* Eingabe-Karte */}
      <div className="lauf-karte">

        {/* Laufart als Dropdown */}
        <div className="lauf-feld">
          <label>Art</label>
          <select
            value={laufart}
            onChange={(e) => setLaufart(e.target.value)}
            className="lauf-select"
          >
            {LAUFARTEN.map(art => (
              <option key={art} value={art}>{art}</option>
            ))}
          </select>
        </div>

        {/* Distanz */}
        <div className="lauf-feld">
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
        <div className="lauf-feld">
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

        {/* Live-Vorschau von Pace und km/h */}
        {vorschauPace && (
          <div className="vorschau">
            <div className="vorschau-item">
              <span className="vorschau-wert">{vorschauPace}</span>
              <span className="vorschau-label">/km</span>
            </div>
            <div className="vorschau-trenner"></div>
            <div className="vorschau-item">
              <span className="vorschau-wert">{vorschauKmh}</span>
              <span className="vorschau-label">km/h</span>
            </div>
          </div>
        )}

        <button className="speichern-btn" onClick={speichereLauf}>
          Lauf speichern
        </button>

      </div>


      {/* Heutige Läufe */}
      {heutigeLaeufe.length > 0 && (
        <div className="section">
          <div className="section-label">
            Heute — {heutigeLaeufe.length}{' '}
            {heutigeLaeufe.length === 1 ? 'Lauf' : 'Läufe'}
          </div>
          <div className="laeufe-liste">
            {heutigeLaeufe.map(lauf => (
              <div key={lauf.id} className="lauf-zeile">
                <div className="lauf-info">
                  <div className="lauf-haupt">
                    <span className="lauf-distanz">
                      {lauf.distanz.toString().replace('.', ',')} km
                    </span>
                    <span className="lauf-zeit">{formatiereZeit(lauf.sekunden)}</span>
                  </div>
                  <div className="lauf-meta">
                    <span className="lauf-art">{lauf.laufart}</span>
                  </div>
                </div>
                <div className="lauf-pace">
                  <span className="pace-wert">{lauf.pace}</span>
                  <span className="pace-label">/km</span>
                </div>
                <button
                  className="loeschen-btn"
                  onClick={() => loescheLauf(lauf.id)}
                  aria-label="Lauf löschen"
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

export default LaufLogger