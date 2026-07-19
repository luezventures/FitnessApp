/* ============================================
   ERNAEHRUNGLOGGER.JSX
   
   NEU (Phase 4):
   - Kalorien-/Makro-Ziele, editierbar
   - Fortschrittsring statt nackter Zahl (die
     "Ring"-Technik aus der Referenz-App)
   - Makro-Fortschrittsbalken gegen die Ziele
   ============================================ */

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './ErnaehrungLogger.css'

const STANDARD_ZIELE = { kalorien: 3000, carbs: 350, protein: 180, fett: 90 }

function ErnaehrungLogger() {

  const [eintraege, setEintraege] = useLocalStorage('fitnessapp_ernaehrung', [])
  const [ziele, setZiele] = useLocalStorage('fitnessapp_ernaehrungsziele', STANDARD_ZIELE)

  const [kalorien, setKalorien] = useState('')
  const [carbs, setCarbs] = useState('')
  const [protein, setProtein] = useState('')
  const [fett, setFett] = useState('')
  const [notiz, setNotiz] = useState('')

  // Ziel-Bearbeitung
  const [zieleBearbeiten, setZieleBearbeiten] = useState(false)
  const [zielKalorien, setZielKalorien] = useState(ziele.kalorien.toString())
  const [zielCarbs, setZielCarbs] = useState(ziele.carbs.toString())
  const [zielProtein, setZielProtein] = useState(ziele.protein.toString())
  const [zielFett, setZielFett] = useState(ziele.fett.toString())


  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }

  const heute = alsDatumString(new Date())
  const heutigeEintraege = eintraege.filter(e => e.datum === heute)

  const summeKalorien = heutigeEintraege.reduce((s, e) => s + e.kalorien, 0)
  const summeCarbs = heutigeEintraege.reduce((s, e) => s + e.carbs, 0)
  const summeProtein = heutigeEintraege.reduce((s, e) => s + e.protein, 0)
  const summeFett = heutigeEintraege.reduce((s, e) => s + e.fett, 0)

  const hatEintraege = heutigeEintraege.length > 0


  /* ===== RING-BERECHNUNG =====
     Ein Kreis mit Radius r hat den Umfang 2πr.
     Wir zeichnen den Kreis komplett, aber blenden
     den nicht-erreichten Teil per stroke-dashoffset
     aus — das ist der Standard-Trick für SVG-
     Fortschrittsringe. */
  const radius = 58
  const umfang = 2 * Math.PI * radius
  const fortschritt = ziele.kalorien > 0
    ? Math.min(1, summeKalorien / ziele.kalorien)
    : 0
  const ringOffset = umfang * (1 - fortschritt)


  function speichereEintrag() {
    if (!kalorien) return
    const neuerEintrag = {
      id: Date.now(),
      kalorien: parseFloat(kalorien) || 0,
      carbs: parseFloat(carbs) || 0,
      protein: parseFloat(protein) || 0,
      fett: parseFloat(fett) || 0,
      notiz: notiz,
      datum: heute,
      zeitstempel: Date.now(),
    }
    setEintraege([neuerEintrag, ...eintraege])
    setKalorien('')
    setCarbs('')
    setProtein('')
    setFett('')
    setNotiz('')
  }

  function loescheEintrag(id) {
    setEintraege(eintraege.filter(e => e.id !== id))
  }

  function speichereZiele() {
    setZiele({
      kalorien: parseInt(zielKalorien) || STANDARD_ZIELE.kalorien,
      carbs: parseInt(zielCarbs) || STANDARD_ZIELE.carbs,
      protein: parseInt(zielProtein) || STANDARD_ZIELE.protein,
      fett: parseInt(zielFett) || STANDARD_ZIELE.fett,
    })
    setZieleBearbeiten(false)
  }

  // Prozent für die Makro-Balken, gedeckelt bei 100%
  function prozent(wert, ziel) {
    if (!ziel) return 0
    return Math.min(100, Math.round((wert / ziel) * 100))
  }


  return (
    <div className="ernaehrung-logger">

      {/* === HERO: Ring + Makros === */}
      <div className="karte hervorgehoben ring-karte">

        <div className="ring-wrapper">
          <svg className="ring-svg" viewBox="0 0 140 140">
            <circle
              className="ring-hintergrund"
              cx="70" cy="70" r={radius}
              fill="none" strokeWidth="10"
            />
            <circle
              className="ring-fuellung"
              cx="70" cy="70" r={radius}
              fill="none" strokeWidth="10"
              strokeDasharray={umfang}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="ring-mitte">
            <div className="ring-zahl">{Math.round(summeKalorien)}</div>
            <div className="ring-ziel">/ {ziele.kalorien} kcal</div>
          </div>
        </div>

        <div className="makro-balken-liste">
          <div className="makro-balken-zeile">
            <div className="makro-balken-kopf">
              <span className="makro-balken-label carbs">Carbs</span>
              <span className="makro-balken-wert">
                {Math.round(summeCarbs)} / {ziele.carbs}g
              </span>
            </div>
            <div className="makro-balken">
              <div
                className="makro-balken-fuellung carbs"
                style={{ width: `${prozent(summeCarbs, ziele.carbs)}%` }}
              ></div>
            </div>
          </div>

          <div className="makro-balken-zeile">
            <div className="makro-balken-kopf">
              <span className="makro-balken-label protein">Protein</span>
              <span className="makro-balken-wert">
                {Math.round(summeProtein)} / {ziele.protein}g
              </span>
            </div>
            <div className="makro-balken">
              <div
                className="makro-balken-fuellung protein"
                style={{ width: `${prozent(summeProtein, ziele.protein)}%` }}
              ></div>
            </div>
          </div>

          <div className="makro-balken-zeile">
            <div className="makro-balken-kopf">
              <span className="makro-balken-label fett">Fett</span>
              <span className="makro-balken-wert">
                {Math.round(summeFett)} / {ziele.fett}g
              </span>
            </div>
            <div className="makro-balken">
              <div
                className="makro-balken-fuellung fett"
                style={{ width: `${prozent(summeFett, ziele.fett)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button className="ziel-bearbeiten-btn" onClick={() => setZieleBearbeiten(!zieleBearbeiten)}>
          <Pencil size={13} />
          Ziel anpassen
        </button>

        {zieleBearbeiten && (
          <div className="ziel-formular">
            <div className="eingabe-reihe">
              <div className="eingabe-feld">
                <label>Kalorien-Ziel</label>
                <input
                  type="number"
                  value={zielKalorien}
                  onChange={(e) => setZielKalorien(e.target.value)}
                />
              </div>
              <div className="eingabe-feld">
                <label>Carbs-Ziel (g)</label>
                <input
                  type="number"
                  value={zielCarbs}
                  onChange={(e) => setZielCarbs(e.target.value)}
                />
              </div>
            </div>
            <div className="eingabe-reihe">
              <div className="eingabe-feld">
                <label>Protein-Ziel (g)</label>
                <input
                  type="number"
                  value={zielProtein}
                  onChange={(e) => setZielProtein(e.target.value)}
                />
              </div>
              <div className="eingabe-feld">
                <label>Fett-Ziel (g)</label>
                <input
                  type="number"
                  value={zielFett}
                  onChange={(e) => setZielFett(e.target.value)}
                />
              </div>
            </div>
            <button className="speichern-btn" onClick={speichereZiele}>
              Ziele speichern
            </button>
          </div>
        )}
      </div>


      {/* === EINGABE === */}
      <div className="section">
        <div className="section-label">Eintragen</div>
        <div className="karte">
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Kalorien</label>
              <input
                type="number"
                inputMode="numeric"
                value={kalorien}
                onChange={(e) => setKalorien(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="eingabe-feld">
              <label>Carbs (g)</label>
              <input
                type="number"
                inputMode="decimal"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Protein (g)</label>
              <input
                type="number"
                inputMode="decimal"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="eingabe-feld">
              <label>Fett (g)</label>
              <input
                type="number"
                inputMode="decimal"
                value={fett}
                onChange={(e) => setFett(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="eingabe-feld">
            <label>Notiz (optional)</label>
            <input
              type="text"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              placeholder="z.B. Frühstück"
            />
          </div>
          <button className="speichern-btn" onClick={speichereEintrag}>
            Eintrag speichern
          </button>
        </div>
      </div>


      {/* === LISTE === */}
      {hatEintraege && (
        <div className="section">
          <div className="section-label">
            Heute — {heutigeEintraege.length}{' '}
            {heutigeEintraege.length === 1 ? 'Eintrag' : 'Einträge'}
          </div>
          <div className="eintraege-liste">
            {heutigeEintraege.map(eintrag => (
              <div key={eintrag.id} className="eintrag-zeile">
                <div className="eintrag-info">
                  <div className="eintrag-haupt">
                    <span className="eintrag-kalorien">{eintrag.kalorien} kcal</span>
                    {eintrag.notiz && (
                      <span className="eintrag-notiz">{eintrag.notiz}</span>
                    )}
                  </div>
                  <div className="eintrag-makros">
                    C {eintrag.carbs}g · P {eintrag.protein}g · F {eintrag.fett}g
                  </div>
                </div>
                <button
                  className="loeschen-btn"
                  onClick={() => loescheEintrag(eintrag.id)}
                  aria-label="Eintrag löschen"
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

export default ErnaehrungLogger