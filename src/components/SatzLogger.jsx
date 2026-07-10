/* ============================================
   SATZLOGGER.JSX
   
   NEU in dieser Version:
   - Tagesübersicht oben (immer sichtbar)
   - Satzzahlen an Gruppen- und Übungs-Buttons
   - Toggle: nochmal klicken klappt zu
   ============================================ */

import { useState, useEffect } from 'react'
import { GRUPPEN, GRUPPEN_NAMEN } from '../data/uebungen'
import Tagesuebersicht from './Tagesuebersicht'
import './SatzLogger.css'

const SPEICHER_SCHLUESSEL = 'fitnessapp_saetze'

function SatzLogger() {

  /* ===== STATE ===== */
  const [gewaehlteGruppe, setGewaehlteGruppe] = useState(null)
  const [gewaehlteUebung, setGewaehlteUebung] = useState(null)
  const [gewicht, setGewicht] = useState('')
  const [wiederholungen, setWiederholungen] = useState('')
  const [rpe, setRpe] = useState(7)
  const [notiz, setNotiz] = useState('')
  const [saetze, setSaetze] = useState([])


  /* ===== LADEN & SPEICHERN ===== */

  useEffect(() => {
    const gespeichert = localStorage.getItem(SPEICHER_SCHLUESSEL)
    if (gespeichert) {
      setSaetze(JSON.parse(gespeichert))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(saetze))
  }, [saetze])


  /* ===== ABGELEITETE DATEN ===== */

  const heute = new Date().toISOString().split('T')[0]

  // Alle Sätze von heute (für die Übersicht)
  const alleHeutigenSaetze = saetze.filter(satz => satz.datum === heute)

  // Nur die Sätze der gewählten Übung (für die Liste unten)
  const heutigeSaetze = alleHeutigenSaetze.filter(
    satz => satz.uebung === gewaehlteUebung
  )

  const letztesMal = saetze.find(
    satz => satz.uebung === gewaehlteUebung && satz.datum !== heute
  )

  /* Wie viele Sätze heute für eine bestimmte Übung?
     Wird an den Übungs-Buttons angezeigt. */
  function satzZahlFuerUebung(uebung) {
    return alleHeutigenSaetze.filter(satz => satz.uebung === uebung).length
  }

  /* Wie viele Sätze heute für eine ganze Gruppe?
     Wird an den Gruppen-Buttons angezeigt. */
  function satzZahlFuerGruppe(gruppe) {
    return alleHeutigenSaetze.filter(satz => satz.gruppe === gruppe).length
  }

  function rpeFarbe(wert) {
    if (wert >= 9) return 'var(--danger)'
    if (wert >= 8) return 'var(--warning)'
    return 'var(--accent)'
  }


  /* ===== FUNKTIONEN ===== */

  /* TOGGLE-LOGIK:
     Ist die Gruppe schon gewählt? Dann abwählen.
     Sonst: neue Gruppe wählen. */
  function waehleGruppe(gruppe) {
    if (gewaehlteGruppe === gruppe) {
      setGewaehlteGruppe(null)
      setGewaehlteUebung(null)
      return
    }
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

  function speichereSatz() {
    if (!gewicht || !wiederholungen) return

    const neuerSatz = {
      id: Date.now(),
      uebung: gewaehlteUebung,
      gruppe: gewaehlteGruppe,
      gewicht: parseFloat(gewicht),
      wiederholungen: parseInt(wiederholungen),
      rpe: rpe,
      notiz: notiz,
      datum: heute,
      zeitstempel: Date.now(),
    }

    setSaetze([neuerSatz, ...saetze])
    setWiederholungen('')
    setNotiz('')
  }

  function loescheSatz(id) {
    setSaetze(saetze.filter(satz => satz.id !== id))
  }


  /* ===== ANZEIGE ===== */

  return (
    <div className="logger">

      {/* TAGESÜBERSICHT — ganz oben, immer sichtbar.
          Wir übergeben die Sätze als "prop".
          Die Komponente zeigt nichts, wenn die Liste leer ist. */}
      <Tagesuebersicht saetze={alleHeutigenSaetze} />


      {/* SCHRITT 1: Gruppe wählen */}
      <div className="section">
        <div className="section-label">Gruppe</div>
        <div className="gruppen-grid">
          {GRUPPEN_NAMEN.map(gruppe => {
            const anzahl = satzZahlFuerGruppe(gruppe)
            return (
              <button
                key={gruppe}
                className={`gruppe-btn ${gewaehlteGruppe === gruppe ? 'aktiv' : ''}`}
                onClick={() => waehleGruppe(gruppe)}
              >
                {gruppe}
                {/* Badge nur zeigen, wenn Sätze da sind */}
                {anzahl > 0 && <span className="badge">{anzahl}</span>}
              </button>
            )
          })}
        </div>
      </div>


      {/* SCHRITT 2: Übung wählen — Formular klappt direkt darunter auf */}
    {gewaehlteGruppe && (
      <div className="section">
        <div className="section-label">Übung</div>
        <div className="uebungen-liste">
          {GRUPPEN[gewaehlteGruppe].map(uebung => {
            const anzahl = satzZahlFuerUebung(uebung)
            const istGewaehlt = gewaehlteUebung === uebung
            return (
              <div key={uebung}>
                <button
                  className={`uebung-btn ${istGewaehlt ? 'aktiv' : ''}`}
                  onClick={() => waehleUebung(uebung)}
                >
                  <span>{uebung}</span>
                  {anzahl > 0 && <span className="badge">{anzahl}</span>}
                </button>

                {/* Das Formular erscheint DIREKT unter dieser Übung */}
                {istGewaehlt && (
                  <div className="eingabe-bereich">

                    {letztesMal && (
                      <div className="letztes-mal">
                        Letztes Mal: {letztesMal.gewicht} kg × {letztesMal.wiederholungen}
                        {' '}(RPE {letztesMal.rpe})
                      </div>
                    )}

                    <div className="eingabe-karte">
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

                    {/* Die Sätze dieser Übung, direkt darunter */}
                    {heutigeSaetze.length > 0 && (
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
                    )}

                  </div>
                )}
              </div>
            )
          })}
    </div>
  </div>
)}

    </div>
  )
}


export default SatzLogger