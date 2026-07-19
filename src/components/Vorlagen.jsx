/* ============================================
   VORLAGEN.JSX — Trainings-Vorlagen (Gym)
   
   Eine Vorlage ist ein benannter Satz von Übungen
   mit ZIEL-Werten (Ziel-Sätze, Ziel-Wiederholungen).
   Das ist noch KEIN Log — es ist ein Plan, den man
   später (Phase: Trainingsplan) Wochentagen zuweist
   und (Phase: Aktives Training) beim Trainieren abhakt.
   
   Datenmodell:
   {
     id, name: "Push Day",
     uebungen: [
       { gruppe, uebung, zielSaetze, zielWiederholungen }
     ]
   }
   ============================================ */

import { useState } from 'react'
import { Plus, X, Dumbbell } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { START_GRUPPEN } from '../data/uebungen'
import './Vorlagen.css'

function Vorlagen() {

  /* ===== DATEN ===== */
  const [vorlagen, setVorlagen] = useLocalStorage('fitnessapp_vorlagen', [])
  const [gruppen] = useLocalStorage('fitnessapp_gruppen', START_GRUPPEN)

  // Gleiche Migration wie im SatzLogger — alte Übungen waren
  // Strings, neue sind { name, typ }. Wir brauchen hier nur den
  // Namen, aber ohne Migration würde .name bei alten Strings
  // "undefined" ergeben.
  function migriereUebung(uebung) {
    if (typeof uebung === 'object') return uebung
    return { name: uebung, typ: 'zusatz' }
  }
  const gruppenMigriert = {}
  for (const gruppenName of Object.keys(gruppen)) {
    gruppenMigriert[gruppenName] = gruppen[gruppenName].map(migriereUebung)
  }
  const gruppenNamen = Object.keys(gruppenMigriert)


  /* ===== STATE: Erstellen-Modus ===== */
  const [erstellenModus, setErstellenModus] = useState(false)
  const [name, setName] = useState('')

  // Die Übungen, die gerade beim Erstellen zusammengestellt werden
  const [entwurfUebungen, setEntwurfUebungen] = useState([])

  // Die Eingabezeile zum Hinzufügen EINER Übung
  const [aktuelleGruppe, setAktuelleGruppe] = useState('')
  const [aktuelleUebung, setAktuelleUebung] = useState('')
  const [zielSaetze, setZielSaetze] = useState('3')
  const [zielWiederholungen, setZielWiederholungen] = useState('10')


  /* ===== FUNKTIONEN: Entwurf zusammenstellen ===== */

  function fuegeUebungHinzu() {
    if (!aktuelleGruppe || !aktuelleUebung) return

    setEntwurfUebungen([...entwurfUebungen, {
      gruppe: aktuelleGruppe,
      uebung: aktuelleUebung,
      zielSaetze: parseInt(zielSaetze) || 3,
      zielWiederholungen: parseInt(zielWiederholungen) || 10,
    }])

    // Übung zurücksetzen, Gruppe/Ziele behalten — meist fügt man
    // mehrere Übungen aus derselben Gruppe mit ähnlichen Zielen an
    setAktuelleUebung('')
  }

  function entferneAusEntwurf(index) {
    setEntwurfUebungen(entwurfUebungen.filter((_, i) => i !== index))
  }

  function speichereVorlage() {
    if (!name.trim() || entwurfUebungen.length === 0) return

    const neueVorlage = {
      id: Date.now(),
      name: name.trim(),
      uebungen: entwurfUebungen,
    }

    setVorlagen([neueVorlage, ...vorlagen])

    // Zurücksetzen und Formular schließen
    setName('')
    setEntwurfUebungen([])
    setAktuelleGruppe('')
    setAktuelleUebung('')
    setErstellenModus(false)
  }

  function abbrechen() {
    setName('')
    setEntwurfUebungen([])
    setAktuelleGruppe('')
    setAktuelleUebung('')
    setErstellenModus(false)
  }

  function loescheVorlage(id) {
    if (!confirm('Vorlage löschen?')) return
    setVorlagen(vorlagen.filter(v => v.id !== id))
  }


  /* ===== ANZEIGE ===== */

  if (erstellenModus) {
    return (
      <div className="vorlagen">

        <div className="karte">
          <div className="eingabe-feld">
            <label>Name der Vorlage</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Push Day"
              autoFocus
            />
          </div>
        </div>

        {/* Bereits hinzugefügte Übungen */}
        {entwurfUebungen.length > 0 && (
          <div className="section">
            <div className="section-label">Übungen in dieser Vorlage</div>
            <div className="entwurf-liste">
              {entwurfUebungen.map((eintrag, index) => (
                <div key={index} className="entwurf-zeile">
                  <div className="entwurf-info">
                    <span className="entwurf-name">{eintrag.uebung}</span>
                    <span className="entwurf-ziel">
                      {eintrag.zielSaetze} × {eintrag.zielWiederholungen}
                    </span>
                  </div>
                  <button
                    className="entfernen-btn"
                    onClick={() => entferneAusEntwurf(index)}
                    aria-label="Entfernen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formular: eine Übung hinzufügen */}
        <div className="section">
          <div className="section-label">Übung hinzufügen</div>
          <div className="karte">

            <div className="eingabe-feld">
              <label>Gruppe</label>
              <select
                className="auswahl"
                value={aktuelleGruppe}
                onChange={(e) => {
                  setAktuelleGruppe(e.target.value)
                  setAktuelleUebung('')
                }}
              >
                <option value="">Wählen…</option>
                {gruppenNamen.map(gruppe => (
                  <option key={gruppe} value={gruppe}>{gruppe}</option>
                ))}
              </select>
            </div>

            {aktuelleGruppe && (
              <div className="eingabe-feld">
                <label>Übung</label>
                <select
                  className="auswahl"
                  value={aktuelleUebung}
                  onChange={(e) => setAktuelleUebung(e.target.value)}
                >
                  <option value="">Wählen…</option>
                  {gruppenMigriert[aktuelleGruppe].map(uebung => (
                    <option key={uebung.name} value={uebung.name}>
                      {uebung.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="eingabe-reihe">
              <div className="eingabe-feld">
                <label>Ziel-Sätze</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={zielSaetze}
                  onChange={(e) => setZielSaetze(e.target.value)}
                />
              </div>
              <div className="eingabe-feld">
                <label>Ziel-Wiederholungen</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={zielWiederholungen}
                  onChange={(e) => setZielWiederholungen(e.target.value)}
                />
              </div>
            </div>

            <button className="hinzufuegen-btn" onClick={fuegeUebungHinzu}>
              <Plus size={16} />
              Zur Vorlage hinzufügen
            </button>

          </div>
        </div>

        {/* Speichern / Abbrechen */}
        <div className="aktionen-reihe">
          <button className="abbrechen-btn" onClick={abbrechen}>
            Abbrechen
          </button>
          <button className="speichern-btn" onClick={speichereVorlage}>
            Vorlage speichern
          </button>
        </div>

      </div>
    )
  }

  // === HAUPTANSICHT: Liste bestehender Vorlagen ===
  return (
    <div className="vorlagen">

      {vorlagen.length === 0 && (
        <div className="leer-zustand">
          <div className="leer-icon"><Dumbbell size={24} /></div>
          <div className="leer-text">Noch keine Vorlage angelegt</div>
          <div className="leer-untertext">
            Eine Vorlage ist ein Training, das du wiederverwenden kannst
          </div>
        </div>
      )}

      {vorlagen.length > 0 && (
        <div className="vorlagen-liste">
          {vorlagen.map(vorlage => (
            <div key={vorlage.id} className="vorlage-karte">
              <div className="vorlage-kopf">
                <span className="vorlage-name">{vorlage.name}</span>
                <button
                  className="entfernen-btn"
                  onClick={() => loescheVorlage(vorlage.id)}
                  aria-label="Vorlage löschen"
                >
                  ×
                </button>
              </div>
              <div className="vorlage-uebungen">
                {vorlage.uebungen.map((u, i) => (
                  <span key={i} className="vorlage-uebung-chip">
                    {u.uebung} {u.zielSaetze}×{u.zielWiederholungen}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="neu-vorlage-btn" onClick={() => setErstellenModus(true)}>
        <Plus size={18} />
        Neue Vorlage
      </button>

    </div>
  )
}

export default Vorlagen