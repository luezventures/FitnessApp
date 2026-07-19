/* ============================================
   ERNAEHRUNG.JSX — komplett neu strukturiert
   
   Ersetzt den alten Tab-Umschalter (Eintragen /
   Mahlzeiten) durch EINE durchscrollbare Übersicht,
   genau wie Training.jsx: 2x2-Kacheln, dann
   kompakte Vorschauen mit "Alle anzeigen"-Links,
   die volle Unteransichten öffnen.
   
   ErnaehrungLogger.jsx wird hierdurch nicht mehr
   gebraucht — die Logik lebt jetzt direkt hier.
   
   NEU: Mahlzeit-Kategorie (Frühstück/Mittagessen/...)
   wird automatisch aus der Uhrzeit abgeleitet,
   statt ein zusätzliches Eingabefeld zu brauchen.
   ============================================ */

import { useState } from 'react'
import { Plus, ArrowLeft, Zap } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import GespeicherteMahlzeiten from './GespeicherteMahlzeiten'
import './Ernaehrung.css'

const STANDARD_ZIELE = { kalorien: 3000, carbs: 350, protein: 180, fett: 90 }

function Ernaehrung() {

  const [eintraege, setEintraege] = useLocalStorage('fitnessapp_ernaehrung', [])
  const [ziele, setZiele] = useLocalStorage('fitnessapp_ernaehrungsziele', STANDARD_ZIELE)
  const [mahlzeiten] = useLocalStorage('fitnessapp_mahlzeiten', [])

  // null = Übersicht. Sonst welche Unteransicht offen ist.
  const [unteransicht, setUnteransicht] = useState(null)

  // Formularfelder fürs Hinzufügen
  const [kalorien, setKalorien] = useState('')
  const [carbs, setCarbs] = useState('')
  const [protein, setProtein] = useState('')
  const [fett, setFett] = useState('')
  const [notiz, setNotiz] = useState('')

  // Formularfelder fürs Ziel-Bearbeiten
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

  function prozent(wert, ziel) {
    if (!ziel) return 0
    return Math.min(100, Math.round((wert / ziel) * 100))
  }

  // Mahlzeit-Kategorie automatisch aus der Uhrzeit ableiten —
  // spart ein zusätzliches Eingabefeld.
  function kategorieFuerZeit(zeitstempel) {
    const stunde = new Date(zeitstempel).getHours()
    if (stunde < 11) return 'Frühstück'
    if (stunde < 15) return 'Mittagessen'
    if (stunde < 18) return 'Snack'
    return 'Abendessen'
  }


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
    setUnteransicht(null)
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
    setUnteransicht(null)
  }

  // Quick-Log einer gespeicherten Mahlzeit, direkt von der Übersicht aus
  function schnellLoggen(mahlzeit) {
    const neuerEintrag = {
      id: Date.now(),
      kalorien: mahlzeit.kalorien,
      carbs: mahlzeit.carbs,
      protein: mahlzeit.protein,
      fett: mahlzeit.fett,
      notiz: mahlzeit.name,
      datum: heute,
      zeitstempel: Date.now(),
    }
    setEintraege([neuerEintrag, ...eintraege])
  }


  /* ===== UNTERANSICHT: Mahlzeit hinzufügen ===== */
  if (unteransicht === 'hinzufuegen') {
    return (
      <div className="ernaehrung-seite">
        <button className="zurueck-btn" onClick={() => setUnteransicht(null)}>
          <ArrowLeft size={16} />
          Ernährung
        </button>

        <div className="karte">
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Kalorien</label>
              <input type="number" value={kalorien} onChange={(e) => setKalorien(e.target.value)} placeholder="0" />
            </div>
            <div className="eingabe-feld">
              <label>Carbs (g)</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Protein (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" />
            </div>
            <div className="eingabe-feld">
              <label>Fett (g)</label>
              <input type="number" value={fett} onChange={(e) => setFett(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="eingabe-feld">
            <label>Was hast du gegessen? (optional)</label>
            <input
              type="text"
              value={notiz}
              onChange={(e) => setNotiz(e.target.value)}
              placeholder="z.B. Haferflocken mit Beeren"
            />
          </div>
          <button className="speichern-btn" onClick={speichereEintrag}>
            Eintrag speichern
          </button>
        </div>
      </div>
    )
  }


  /* ===== UNTERANSICHT: Heute geloggt (voll) ===== */
  if (unteransicht === 'heuteAlle') {
    return (
      <div className="ernaehrung-seite">
        <button className="zurueck-btn" onClick={() => setUnteransicht(null)}>
          <ArrowLeft size={16} />
          Ernährung
        </button>

        {heutigeEintraege.length === 0 && (
          <div className="leer-zustand">Noch nichts gegessen heute</div>
        )}

        <div className="eintraege-liste">
          {heutigeEintraege.map(eintrag => (
            <div key={eintrag.id} className="eintrag-zeile">
              <div className="eintrag-info">
                <div className="eintrag-haupt">
                  <span className="eintrag-kategorie">{kategorieFuerZeit(eintrag.zeitstempel)}</span>
                  <span className="eintrag-kalorien">{eintrag.kalorien} kcal</span>
                </div>
                {eintrag.notiz && <div className="eintrag-notiz">{eintrag.notiz}</div>}
                <div className="eintrag-makros">
                  C {eintrag.carbs}g · P {eintrag.protein}g · F {eintrag.fett}g
                </div>
              </div>
              <button className="loeschen-btn" onClick={() => loescheEintrag(eintrag.id)} aria-label="Löschen">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }


  /* ===== UNTERANSICHT: Gespeicherte Mahlzeiten (voll) ===== */
  if (unteransicht === 'mahlzeitenAlle') {
    return (
      <div className="ernaehrung-seite">
        <button className="zurueck-btn" onClick={() => setUnteransicht(null)}>
          <ArrowLeft size={16} />
          Ernährung
        </button>
        <GespeicherteMahlzeiten />
      </div>
    )
  }


  /* ===== UNTERANSICHT: Ziele anpassen ===== */
  if (unteransicht === 'ziele') {
    return (
      <div className="ernaehrung-seite">
        <button className="zurueck-btn" onClick={() => setUnteransicht(null)}>
          <ArrowLeft size={16} />
          Ernährung
        </button>

        <div className="karte">
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Kalorien-Ziel</label>
              <input type="number" value={zielKalorien} onChange={(e) => setZielKalorien(e.target.value)} />
            </div>
            <div className="eingabe-feld">
              <label>Carbs-Ziel (g)</label>
              <input type="number" value={zielCarbs} onChange={(e) => setZielCarbs(e.target.value)} />
            </div>
          </div>
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Protein-Ziel (g)</label>
              <input type="number" value={zielProtein} onChange={(e) => setZielProtein(e.target.value)} />
            </div>
            <div className="eingabe-feld">
              <label>Fett-Ziel (g)</label>
              <input type="number" value={zielFett} onChange={(e) => setZielFett(e.target.value)} />
            </div>
          </div>
          <button className="speichern-btn" onClick={speichereZiele}>
            Ziele speichern
          </button>
        </div>
      </div>
    )
  }


  /* ===== HAUPTÜBERSICHT ===== */
  return (
    <div className="ernaehrung-seite">

      {/* 2x2 Kacheln */}
      <div className="stat-grid">
        <div className="stat-kachel">
          <div className="stat-label">Kalorien</div>
          <div className="stat-wert amber">
            {Math.round(summeKalorien)}<span className="stat-ziel">/{ziele.kalorien}</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung amber" style={{ width: `${prozent(summeKalorien, ziele.kalorien)}%` }}></div>
          </div>
        </div>
        <div className="stat-kachel">
          <div className="stat-label">Protein</div>
          <div className="stat-wert blau">
            {Math.round(summeProtein)}<span className="stat-ziel">/{ziele.protein}g</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung blau" style={{ width: `${prozent(summeProtein, ziele.protein)}%` }}></div>
          </div>
        </div>
        <div className="stat-kachel">
          <div className="stat-label">Carbs</div>
          <div className="stat-wert gruen">
            {Math.round(summeCarbs)}<span className="stat-ziel">/{ziele.carbs}g</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung gruen" style={{ width: `${prozent(summeCarbs, ziele.carbs)}%` }}></div>
          </div>
        </div>
        <div className="stat-kachel">
          <div className="stat-label">Fett</div>
          <div className="stat-wert pink">
            {Math.round(summeFett)}<span className="stat-ziel">/{ziele.fett}g</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung pink" style={{ width: `${prozent(summeFett, ziele.fett)}%` }}></div>
          </div>
        </div>
      </div>

      <button className="mahlzeit-hinzufuegen-btn" onClick={() => setUnteransicht('hinzufuegen')}>
        <Plus size={18} />
        Mahlzeit hinzufügen
      </button>

      {/* Heute geloggt — Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Heute geloggt</span>
          <button className="vorschau-link" onClick={() => setUnteransicht('heuteAlle')}>
            Alle anzeigen
          </button>
        </div>

        {heutigeEintraege.length === 0 && (
          <div className="vorschau-leer">Noch nichts gegessen heute</div>
        )}

        {heutigeEintraege.slice(0, 2).map(eintrag => (
          <div key={eintrag.id} className="kompakt-info-zeile">
            <span className="kompakt-info-titel">{kategorieFuerZeit(eintrag.zeitstempel)}</span>
            <span className="kompakt-info-detail">
              {eintrag.notiz ? `${eintrag.notiz} · ` : ''}{eintrag.kalorien} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Gespeicherte Mahlzeiten — Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Gespeicherte Mahlzeiten</span>
          <button className="vorschau-link" onClick={() => setUnteransicht('mahlzeitenAlle')}>
            Alle anzeigen
          </button>
        </div>

        {mahlzeiten.length === 0 && (
          <div className="vorschau-leer">Noch keine Mahlzeit gespeichert</div>
        )}

        {mahlzeiten.slice(0, 2).map(mahlzeit => (
          <div key={mahlzeit.id} className="kompakt-zeile">
            <div className="kompakt-info">
              <span className="kompakt-name">{mahlzeit.name}</span>
              <span className="kompakt-detail">
                {mahlzeit.kalorien} kcal · {mahlzeit.protein}g Protein
              </span>
            </div>
            <button
              className="quick-log-btn"
              onClick={() => schnellLoggen(mahlzeit)}
              aria-label={`${mahlzeit.name} loggen`}
            >
              <Zap size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Kalorien-/Makro-Ziele */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Kalorien-/Makro-Ziele</span>
          <button className="vorschau-link" onClick={() => setUnteransicht('ziele')}>
            Anpassen
          </button>
        </div>
        <div className="ziele-zeile">
          {ziele.kalorien} kcal · {ziele.protein}g Protein · {ziele.carbs}g Carbs · {ziele.fett}g Fett
        </div>
      </div>

    </div>
  )
}

export default Ernaehrung