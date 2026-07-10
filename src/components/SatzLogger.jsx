/* ============================================
   SATZLOGGER.JSX — Das erste Tool
   
   Aufbau von oben nach unten:
   1. Imports
   2. State (das Gedächtnis der Komponente)
   3. Effekte (Laden & Speichern)
   4. Funktionen (was bei Klicks passiert)
   5. Die Anzeige (JSX)
   ============================================ */

import { useState, useEffect } from 'react'
import { GRUPPEN, GRUPPEN_NAMEN } from '../data/uebungen'
import './SatzLogger.css'

// Der Schlüssel, unter dem wir im Browser speichern.
// Wie ein Schubladenname.
const SPEICHER_SCHLUESSEL = 'fitnessapp_saetze'

function SatzLogger() {

  /* ===== 1. STATE =====
     useState gibt dir zwei Dinge zurück:
     - den aktuellen Wert
     - eine Funktion, um ihn zu ändern
     
     const [wert, setWert] = useState(startwert)
     
     Änderst du den Wert mit setWert(), zeichnet
     React die Anzeige automatisch neu. */

  // Welche Gruppe ist gewählt? null = noch keine
  const [gewaehlteGruppe, setGewaehlteGruppe] = useState(null)

  // Welche Übung ist gewählt? null = noch keine
  const [gewaehlteUebung, setGewaehlteUebung] = useState(null)

  // Die Eingabefelder. Strings, weil Inputs immer Text liefern.
  const [gewicht, setGewicht] = useState('')
  const [wiederholungen, setWiederholungen] = useState('')
  const [rpe, setRpe] = useState(7)
  const [notiz, setNotiz] = useState('')

  // Alle gespeicherten Sätze. Startet als leere Liste.
  const [saetze, setSaetze] = useState([])


  /* ===== 2. LADEN BEIM START =====
     useEffect läuft nach dem ersten Rendern.
     Das leere [] am Ende heißt: nur EINMAL, beim Start.
     
     Hier holen wir die alten Sätze aus dem Browser-Speicher. */

  useEffect(() => {
    const gespeichert = localStorage.getItem(SPEICHER_SCHLUESSEL)
    if (gespeichert) {
      // localStorage speichert nur Text.
      // JSON.parse macht daraus wieder echte Daten.
      setSaetze(JSON.parse(gespeichert))
    }
  }, [])


  /* ===== 3. SPEICHERN BEI ÄNDERUNG =====
     Dieses useEffect hat [saetze] am Ende.
     Das heißt: läuft jedes Mal, wenn sich "saetze" ändert.
     
     So wird automatisch gespeichert, ohne dass du
     irgendwo einen Speichern-Button brauchst. */

  useEffect(() => {
    // JSON.stringify macht aus Daten wieder Text.
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(saetze))
  }, [saetze])


  /* ===== 4. FUNKTIONEN ===== */

  // Gruppe anklicken
  function waehleGruppe(gruppe) {
  // Ist die Gruppe schon gewählt? Dann abwählen.
  if (gewaehlteGruppe === gruppe) {
    setGewaehlteGruppe(null)
    setGewaehlteUebung(null)
    return
  }
  // Sonst: neue Gruppe wählen
  setGewaehlteGruppe(gruppe)
  setGewaehlteUebung(null)
}

  function waehleUebung(uebung) {
  if (gewaehlteUebung === uebung) {
    setGewaehlteUebung(null)
    return
  }
  setGewaehlteUebung(uebung)
}

  // Satz speichern
  function speichereSatz() {
    // Prüfen, ob alles ausgefüllt ist
    if (!gewicht || !wiederholungen) {
      return  // Nichts tun, wenn Felder leer sind
    }

    // Ein neuer Satz als Objekt
    const neuerSatz = {
      id: Date.now(),                    // Eindeutige Nummer (Millisekunden seit 1970)
      uebung: gewaehlteUebung,
      gruppe: gewaehlteGruppe,
      gewicht: parseFloat(gewicht),      // Text → Zahl (mit Komma)
      wiederholungen: parseInt(wiederholungen),  // Text → ganze Zahl
      rpe: rpe,
      notiz: notiz,
      datum: new Date().toISOString().split('T')[0],  // "2026-07-09"
      zeitstempel: Date.now(),
    }

    // Neuen Satz vorne an die Liste hängen.
    // [neuerSatz, ...saetze] heißt: neues Element + alle alten.
    // WICHTIG: Wir verändern die alte Liste nicht, wir bauen eine neue.
    // React merkt Änderungen nur, wenn ein NEUES Objekt kommt.
    setSaetze([neuerSatz, ...saetze])

    // Felder leeren für den nächsten Satz.
    // Gewicht behalten wir — meist macht man mehrere Sätze mit demselben.
    setWiederholungen('')
    setNotiz('')
  }

  // Satz löschen
  function loescheSatz(id) {
    // filter() baut eine neue Liste ohne den Satz mit dieser id
    setSaetze(saetze.filter(satz => satz.id !== id))
  }


  /* ===== 5. ABGELEITETE DATEN =====
     Nicht im State speichern, sondern bei jedem
     Rendern neu berechnen. Regel: alles, was sich
     aus dem State ableiten lässt, gehört NICHT in den State. */

  const heute = new Date().toISOString().split('T')[0]

  // Nur die Sätze von heute, für die gewählte Übung
  const heutigeSaetze = saetze.filter(
    satz => satz.datum === heute && satz.uebung === gewaehlteUebung
  )

  // Der letzte Satz dieser Übung, der NICHT von heute ist
  const letztesMal = saetze.find(
    satz => satz.uebung === gewaehlteUebung && satz.datum !== heute
  )

  // Farbe des RPE-Sliders je nach Wert
  function rpeFarbe(wert) {
    if (wert >= 9) return 'var(--danger)'
    if (wert >= 8) return 'var(--warning)'
    return 'var(--accent)'
  }


  /* ===== 6. DIE ANZEIGE ===== */

  return (
    <div className="logger">

       {/* Übersicht */}
      <div className="info-karte">
        <h2 className="info-titel">Der Satz-Logger</h2>
        <p className="info-text">
            Hier kannst du Gewicht, Wiederholungen und RPE pro Satz festhalten.
             (Aktuell nur für einige Übungen, weitere folgen.)
        </p>
      </div>

      {/* --- SCHRITT 1: Gruppe wählen --- */}
      <div className="section">
        <div className="section-label">Gruppe</div>
        <div className="gruppen-grid">
          {/* .map() geht durch die Liste und macht aus jedem
              Eintrag ein Button-Element. */}
          {GRUPPEN_NAMEN.map(gruppe => (
            <button
              key={gruppe}
              className={`gruppe-btn ${gewaehlteGruppe === gruppe ? 'aktiv' : ''}`}
              onClick={() => waehleGruppe(gruppe)}
            >
              {gruppe}
            </button>
          ))}
        </div>
      </div>


      {/* --- SCHRITT 2: Übung wählen ---
          Wird nur angezeigt, wenn eine Gruppe gewählt ist.
          && bedeutet: wenn links wahr, zeige rechts. */}
      {gewaehlteGruppe && (
        <div className="section">
          <div className="section-label">Übung</div>
          <div className="uebungen-liste">
            {GRUPPEN[gewaehlteGruppe].map(uebung => (
              <button
                key={uebung}
                className={`uebung-btn ${gewaehlteUebung === uebung ? 'aktiv' : ''}`}
                onClick={() => waehleUebung(uebung)}
              >
                {uebung}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* --- SCHRITT 3: Eingabe ---
          Nur wenn eine Übung gewählt ist. */}
      {gewaehlteUebung && (
        <div className="section">

          {/* Letztes Mal anzeigen, falls vorhanden */}
          {letztesMal && (
            <div className="letztes-mal">
              Letztes Mal: {letztesMal.gewicht} kg × {letztesMal.wiederholungen}
              {' '}(RPE {letztesMal.rpe})
            </div>
          )}

          <div className="eingabe-karte">

            {/* Gewicht und Wiederholungen nebeneinander */}
            <div className="eingabe-reihe">
              <div className="eingabe-feld">
                <label>Gewicht (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={gewicht}
                  onChange={(e) => setGewicht(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="eingabe-feld">
                <label>Wiederholungen</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={wiederholungen}
                  onChange={(e) => setWiederholungen(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* RPE-Slider */}
            <div className="rpe-bereich">
              <div className="rpe-kopf">
                <label>RPE</label>
                <span className="rpe-wert" style={{ color: rpeFarbe(rpe) }}>
                  {rpe}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rpe}
                onChange={(e) => setRpe(parseInt(e.target.value))}
                className="rpe-slider"
                style={{ accentColor: rpeFarbe(rpe) }}
              />
            </div>

            {/* Notiz, optional */}
            <div className="eingabe-feld">
              <label>Notiz (optional)</label>
              <input
                type="text"
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                placeholder="z.B. Schulter gezwickt"
              />
            </div>

            <button className="speichern-btn" onClick={speichereSatz}>
              Satz speichern
            </button>

          </div>
        </div>
      )}


      {/* --- SCHRITT 4: Heutige Sätze --- */}
      {gewaehlteUebung && heutigeSaetze.length > 0 && (
        <div className="section">
          <div className="section-label">
            Heute — {heutigeSaetze.length} {heutigeSaetze.length === 1 ? 'Satz' : 'Sätze'}
          </div>
          <div className="saetze-liste">
            {heutigeSaetze.map((satz, index) => (
              <div key={satz.id} className="satz-zeile">
                <div className="satz-nummer">
                  {heutigeSaetze.length - index}
                </div>
                <div className="satz-daten">
                  <div className="satz-haupt">
                    <span className="satz-gewicht">{satz.gewicht} kg</span>
                    <span className="satz-mal">×</span>
                    <span className="satz-reps">{satz.wiederholungen}</span>
                  </div>
                  {satz.notiz && (
                    <div className="satz-notiz">{satz.notiz}</div>
                  )}
                </div>
                <div className="satz-rpe" style={{ color: rpeFarbe(satz.rpe) }}>
                  {satz.rpe}
                </div>
                <button
                  className="loeschen-btn"
                  onClick={() => loescheSatz(satz.id)}
                  aria-label="Satz löschen"
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

export default SatzLogger