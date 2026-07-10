/* ============================================
   SATZLOGGER.JSX
   
   GROSSE ÄNDERUNG: Übungen sind jetzt Daten.
   
   Gruppen und Übungen leben im State und in
   localStorage. Der Nutzer legt sie selbst an.
   
   Zwei neue States:
     bearbeiteModus  → zeigt die +/× Buttons
     neueGruppe      → Text im Eingabefeld
   ============================================ */

import { useState } from 'react'
import { START_GRUPPEN } from '../data/uebungen'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Tagesuebersicht from './Tagesuebersicht'
import './SatzLogger.css'

function SatzLogger() {

  /* ===== GESPEICHERTE DATEN =====
     Der Custom Hook macht Laden und Speichern
     automatisch. Sieht aus wie useState. */

  const [saetze, setSaetze] = useLocalStorage('fitnessapp_saetze', [])
  const [gruppen, setGruppen] = useLocalStorage('fitnessapp_gruppen', START_GRUPPEN)


  /* ===== NORMALER STATE (nicht gespeichert) ===== */

  const [gewaehlteGruppe, setGewaehlteGruppe] = useState(null)
  const [gewaehlteUebung, setGewaehlteUebung] = useState(null)
  const [gewicht, setGewicht] = useState('')
  const [wiederholungen, setWiederholungen] = useState('')
  const [rpe, setRpe] = useState(7)
  const [notiz, setNotiz] = useState('')

  // Bearbeiten-Modus: zeigt Lösch-Buttons
  const [bearbeiten, setBearbeiten] = useState(false)

  // Eingabefelder fürs Anlegen
  const [neueGruppe, setNeueGruppe] = useState('')
  const [neueUebung, setNeueUebung] = useState('')
  const [zeigeGruppeFeld, setZeigeGruppeFeld] = useState(false)
  const [zeigeUebungFeld, setZeigeUebungFeld] = useState(false)


  /* ===== ABGELEITETE DATEN ===== */

  const heute = new Date().toISOString().split('T')[0]
  const gruppenNamen = Object.keys(gruppen)
  const alleHeutigenSaetze = saetze.filter(satz => satz.datum === heute)
  const heutigeSaetze = alleHeutigenSaetze.filter(
    satz => satz.uebung === gewaehlteUebung
  )
  const letztesMal = saetze.find(
    satz => satz.uebung === gewaehlteUebung && satz.datum !== heute
  )

  function satzZahlFuerUebung(uebung) {
    return alleHeutigenSaetze.filter(satz => satz.uebung === uebung).length
  }

  function satzZahlFuerGruppe(gruppe) {
    return alleHeutigenSaetze.filter(satz => satz.gruppe === gruppe).length
  }

  function rpeFarbe(wert) {
    if (wert >= 9) return 'var(--danger)'
    if (wert >= 8) return 'var(--warning)'
    return 'var(--accent)'
  }


  /* ===== GRUPPEN VERWALTEN ===== */

  function legeGruppeAn() {
    const name = neueGruppe.trim()
    if (!name) return

    // Gibt's die Gruppe schon?
    if (gruppen[name]) {
      alert('Diese Gruppe gibt es schon.')
      return
    }

    /* Neues Objekt bauen, altes nicht verändern.
       {...gruppen} kopiert alle alten Einträge,
       dann kommt der neue dazu. */
    setGruppen({ ...gruppen, [name]: [] })
    setNeueGruppe('')
    setZeigeGruppeFeld(false)
    setGewaehlteGruppe(name)
  }

  function loescheGruppe(name) {
    if (!confirm(`Gruppe "${name}" löschen? Die geloggten Sätze bleiben erhalten.`)) {
      return
    }

    /* Kopie machen, Eintrag rauslöschen.
       Die Sätze bleiben unangetastet — sie leben
       in einem eigenen State. */
    const kopie = { ...gruppen }
    delete kopie[name]
    setGruppen(kopie)

    if (gewaehlteGruppe === name) {
      setGewaehlteGruppe(null)
      setGewaehlteUebung(null)
    }
  }


  /* ===== ÜBUNGEN VERWALTEN ===== */

  function legeUebungAn() {
    const name = neueUebung.trim()
    if (!name || !gewaehlteGruppe) return

    if (gruppen[gewaehlteGruppe].includes(name)) {
      alert('Diese Übung gibt es in dieser Gruppe schon.')
      return
    }

    /* Neue Liste für diese Gruppe, alte Gruppen bleiben.
       [...alteListe, neu] hängt hinten an. */
    setGruppen({
      ...gruppen,
      [gewaehlteGruppe]: [...gruppen[gewaehlteGruppe], name],
    })
    setNeueUebung('')
    setZeigeUebungFeld(false)
  }

  function loescheUebung(uebung) {
    if (!confirm(`Übung "${uebung}" löschen? Die geloggten Sätze bleiben erhalten.`)) {
      return
    }

    setGruppen({
      ...gruppen,
      [gewaehlteGruppe]: gruppen[gewaehlteGruppe].filter(u => u !== uebung),
    })

    if (gewaehlteUebung === uebung) {
      setGewaehlteUebung(null)
    }
  }


  /* ===== AUSWAHL (Toggle) ===== */

  function waehleGruppe(gruppe) {
    if (bearbeiten) return  // Im Bearbeiten-Modus nicht auswählen

    if (gewaehlteGruppe === gruppe) {
      setGewaehlteGruppe(null)
      setGewaehlteUebung(null)
      return
    }
    setGewaehlteGruppe(gruppe)
    setGewaehlteUebung(null)
    setZeigeUebungFeld(false)
  }

  function waehleUebung(uebung) {
    if (bearbeiten) return

    if (gewaehlteUebung === uebung) {
      setGewaehlteUebung(null)
      return
    }
    setGewaehlteUebung(uebung)
  }


  /* ===== SÄTZE ===== */

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


      {/* === GRUPPEN === */}
      <div className="section">
        <div className="section-kopf">
          <div className="section-label">Gruppe</div>
          <button
            className={`bearbeiten-btn ${bearbeiten ? 'aktiv' : ''}`}
            onClick={() => setBearbeiten(!bearbeiten)}
          >
            {bearbeiten ? 'Fertig' : 'Bearbeiten'}
          </button>
        </div>

        <div className="gruppen-grid">
          {gruppenNamen.map(gruppe => {
            const anzahl = satzZahlFuerGruppe(gruppe)
            return (
              <div key={gruppe} className="gruppe-wrapper">
                <button
                  className={`gruppe-btn ${gewaehlteGruppe === gruppe ? 'aktiv' : ''}`}
                  onClick={() => waehleGruppe(gruppe)}
                >
                  {gruppe}
                  {anzahl > 0 && !bearbeiten && (
                    <span className="badge">{anzahl}</span>
                  )}
                </button>

                {bearbeiten && (
                  <button
                    className="entfernen-btn"
                    onClick={() => loescheGruppe(gruppe)}
                    aria-label={`${gruppe} löschen`}
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}

          {/* Plus-Button zum Anlegen */}
          {!zeigeGruppeFeld && (
            <button
              className="plus-btn"
              onClick={() => setZeigeGruppeFeld(true)}
            >
              +
            </button>
          )}
        </div>

        {/* Eingabefeld für neue Gruppe */}
        {zeigeGruppeFeld && (
          <div className="neu-feld">
            <input
              type="text"
              value={neueGruppe}
              onChange={(e) => setNeueGruppe(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && legeGruppeAn()}
              placeholder="Name der Gruppe"
              autoFocus
            />
            <button className="neu-btn" onClick={legeGruppeAn}>
              Anlegen
            </button>
            <button
              className="abbrechen-btn"
              onClick={() => {
                setZeigeGruppeFeld(false)
                setNeueGruppe('')
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>


      {/* === ÜBUNGEN === */}
      {gewaehlteGruppe && (
        <div className="section">
          <div className="section-label">Übung</div>

          <div className="uebungen-liste">
            {gruppen[gewaehlteGruppe].map(uebung => {
              const anzahl = satzZahlFuerUebung(uebung)
              const istGewaehlt = gewaehlteUebung === uebung
              return (
                <div key={uebung}>

                  <div className="uebung-wrapper">
                    <button
                      className={`uebung-btn ${istGewaehlt ? 'aktiv' : ''}`}
                      onClick={() => waehleUebung(uebung)}
                    >
                      <span>{uebung}</span>
                      {anzahl > 0 && !bearbeiten && (
                        <span className="badge">{anzahl}</span>
                      )}
                    </button>

                    {bearbeiten && (
                      <button
                        className="entfernen-btn"
                        onClick={() => loescheUebung(uebung)}
                        aria-label={`${uebung} löschen`}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Formular klappt direkt darunter auf */}
                  {istGewaehlt && !bearbeiten && (
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

            {/* Plus-Button für neue Übung */}
            {!zeigeUebungFeld && (
              <button
                className="plus-btn breit"
                onClick={() => setZeigeUebungFeld(true)}
              >
                + Übung hinzufügen
              </button>
            )}

            {/* Eingabefeld für neue Übung */}
            {zeigeUebungFeld && (
              <div className="neu-feld">
                <input
                  type="text"
                  value={neueUebung}
                  onChange={(e) => setNeueUebung(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && legeUebungAn()}
                  placeholder="Name der Übung"
                  autoFocus
                />
                <button className="neu-btn" onClick={legeUebungAn}>
                  Anlegen
                </button>
                <button
                  className="abbrechen-btn"
                  onClick={() => {
                    setZeigeUebungFeld(false)
                    setNeueUebung('')
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Tagesuebersicht saetze={alleHeutigenSaetze} onLoeschen={loescheSatz} />

    </div>
  )
}

export default SatzLogger