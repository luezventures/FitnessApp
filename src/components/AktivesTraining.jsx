/* ============================================
   AKTIVESTRAINING.JSX — Der Live-Screen
   
   Baustein 3: Nimmt eine Vorlage (Ziel-Sätze pro
   Übung) und lässt dich die ECHTEN Sätze loggen —
   in denselben Speicher wie der normale SatzLogger
   (fitnessapp_saetze). Kein separates Datenmodell:
   ein Satz ist ein Satz, egal ob er aus dem freien
   Training oder aus einem geplanten Training kommt.
   
   Der einzige Unterschied: hier siehst du zusätzlich
   den ZIEL-Wert aus der Vorlage und einen Fortschritt
   ("2/4 Sätze").
   ============================================ */

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './AktivesTraining.css'

function AktivesTraining({ vorlage, onBeenden }) {

  const [saetze, setSaetze] = useLocalStorage('fitnessapp_saetze', [])

  const [gewaehlteUebung, setGewaehlteUebung] = useState(null)
  const [gewicht, setGewicht] = useState('')
  const [wiederholungen, setWiederholungen] = useState('')
  const [rpe, setRpe] = useState(7)


  /* ===== LOKALES DATUM ===== */
  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }
  const heute = alsDatumString(new Date())


  /* ===== FORTSCHRITT PRO ÜBUNG =====
     Wie viele Sätze wurden HEUTE für diese Übung
     schon geloggt — egal ob über Aktives Training
     oder über den normalen Satz-Logger. Es ist
     derselbe Speicher, also zählt alles mit. */
  function geloggteSaetzeFuer(uebungName) {
    return saetze.filter(
      satz => satz.datum === heute && satz.uebung === uebungName
    )
  }

  // Gesamtfortschritt der ganzen Einheit: geloggte vs. Ziel-Sätze,
  // über alle Übungen der Vorlage summiert.
  const gesamtGeloggt = vorlage.uebungen.reduce(
    (summe, e) => summe + geloggteSaetzeFuer(e.uebung).length,
    0
  )
  const gesamtZiel = vorlage.uebungen.reduce(
    (summe, e) => summe + e.zielSaetze,
    0
  )

  function rpeFarbe(wert) {
    if (wert >= 9) return 'var(--danger)'
    if (wert >= 8) return 'var(--warning)'
    return 'var(--accent)'
  }


  /* ===== SATZ SPEICHERN =====
     Exakt dasselbe Datenmodell wie im normalen
     SatzLogger — deshalb taucht dieser Satz auch
     ganz normal in Statistik und Tagesübersicht auf. */
  function speichereSatz(eintrag) {
    if (!gewicht || !wiederholungen) return

    const neuerSatz = {
      id: Date.now(),
      uebung: eintrag.uebung,
      gruppe: eintrag.gruppe,
      gewicht: parseFloat(gewicht),
      wiederholungen: parseInt(wiederholungen),
      rpe: rpe,
      notiz: '',
      zusatzgewicht: null,
      istKoerpergewicht: false,
      vorlageId: vorlage.id,
      datum: heute,
      zeitstempel: Date.now(),
    }

    setSaetze([neuerSatz, ...saetze])
    setWiederholungen('')
  }

  function waehleUebung(uebungName) {
    if (gewaehlteUebung === uebungName) {
      setGewaehlteUebung(null)
      return
    }
    setGewaehlteUebung(uebungName)
    setGewicht('')
    setWiederholungen('')
  }


  /* ===== ANZEIGE ===== */

  return (
    <div className="aktives-training">

      {/* Kopf mit Gesamtfortschritt und Fertig-Button */}
      <div className="training-kopf">
        <div className="kopf-info">
          <div className="kopf-name">{vorlage.name}</div>
          <div className="kopf-fortschritt">
            {gesamtGeloggt} / {gesamtZiel} Sätze
          </div>
        </div>
        <button className="fertig-btn" onClick={onBeenden}>
          <X size={16} />
          Fertig
        </button>
      </div>

      {/* Gesamt-Fortschrittsbalken */}
      <div className="gesamt-balken">
        <div
          className="gesamt-balken-fuellung"
          style={{
            width: `${gesamtZiel > 0 ? Math.min(100, (gesamtGeloggt / gesamtZiel) * 100) : 0}%`
          }}
        ></div>
      </div>

      {/* Übungsliste */}
      <div className="uebungen-liste">
        {vorlage.uebungen.map((eintrag, index) => {
          const geloggt = geloggteSaetzeFuer(eintrag.uebung)
          const fertig = geloggt.length >= eintrag.zielSaetze
          const istGewaehlt = gewaehlteUebung === eintrag.uebung

          return (
            <div key={index} className="uebung-block">

              <button
                className={`uebung-kopf-btn ${istGewaehlt ? 'aktiv' : ''} ${fertig ? 'fertig' : ''}`}
                onClick={() => waehleUebung(eintrag.uebung)}
              >
                <div className="uebung-info">
                  <span className="uebung-name">{eintrag.uebung}</span>
                  <span className="uebung-ziel">
                    Ziel: {eintrag.zielSaetze} × {eintrag.zielWiederholungen}
                  </span>
                </div>
                <div className="uebung-status">
                  {fertig ? (
                    <Check size={18} className="status-check" />
                  ) : (
                    <span className="status-zahl">
                      {geloggt.length}/{eintrag.zielSaetze}
                    </span>
                  )}
                </div>
              </button>

              {/* Aufklappender Bereich: Eingabe + geloggte Sätze */}
              {istGewaehlt && (
                <div className="eingabe-bereich">

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

                    <button
                      className="satz-loggen-btn"
                      onClick={() => speichereSatz(eintrag)}
                    >
                      Satz loggen
                    </button>
                  </div>

                  {/* Bereits geloggte Sätze dieser Übung, heute */}
                  {geloggt.length > 0 && (
                    <div className="geloggte-liste">
                      {geloggt.map((satz, i) => (
                        <div key={satz.id} className="mini-satz">
                          <span className="mini-nummer">{geloggt.length - i}</span>
                          <span className="mini-werte">
                            {satz.gewicht} kg × {satz.wiederholungen}
                          </span>
                          <span
                            className="mini-rpe"
                            style={{ color: rpeFarbe(satz.rpe) }}
                          >
                            {satz.rpe}
                          </span>
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
  )
}

export default AktivesTraining
