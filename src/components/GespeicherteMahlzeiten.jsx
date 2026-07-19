/* ============================================
   GESPEICHERTEMAHLZEITEN.JSX
   
   Wiederverwendbare Mahlzeiten-Presets: einmal
   die Werte eintippen (z.B. "Haferflocken mit
   Whey"), danach mit einem Tap loggen statt
   jedes Mal alle vier Zahlen neu einzutippen.
   
   Schreibt in denselben Speicher wie der normale
   Logger (fitnessapp_ernaehrung) — ein Quick-Log
   taucht also sofort im "Eintragen"-Tab mit auf.
   ============================================ */

import { useState } from 'react'
import { Plus, Zap, UtensilsCrossed } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './GespeicherteMahlzeiten.css'

function GespeicherteMahlzeiten() {

  const [mahlzeiten, setMahlzeiten] = useLocalStorage('fitnessapp_mahlzeiten', [])
  const [eintraege, setEintraege] = useLocalStorage('fitnessapp_ernaehrung', [])

  const [erstellenModus, setErstellenModus] = useState(false)
  const [name, setName] = useState('')
  const [kalorien, setKalorien] = useState('')
  const [carbs, setCarbs] = useState('')
  const [protein, setProtein] = useState('')
  const [fett, setFett] = useState('')

  // Zeigt kurz "Geloggt ✓" nach dem Quick-Log
  const [geradeGeloggt, setGeradeGeloggt] = useState(null)


  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }
  const heute = alsDatumString(new Date())


  function legeMahlzeitAn() {
    if (!name.trim() || !kalorien) return

    const neueMahlzeit = {
      id: Date.now(),
      name: name.trim(),
      kalorien: parseFloat(kalorien) || 0,
      carbs: parseFloat(carbs) || 0,
      protein: parseFloat(protein) || 0,
      fett: parseFloat(fett) || 0,
    }

    setMahlzeiten([neueMahlzeit, ...mahlzeiten])
    setName('')
    setKalorien('')
    setCarbs('')
    setProtein('')
    setFett('')
    setErstellenModus(false)
  }

  function loescheMahlzeit(id) {
    if (!confirm('Mahlzeit löschen?')) return
    setMahlzeiten(mahlzeiten.filter(m => m.id !== id))
  }

  // Der eigentliche Punkt dieser Komponente: ein Tap,
  // fertig geloggt — keine Zahlen erneut eintippen.
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

    // Kurzes visuelles Feedback, verschwindet nach 1.5s
    setGeradeGeloggt(mahlzeit.id)
    setTimeout(() => setGeradeGeloggt(null), 1500)
  }


  if (erstellenModus) {
    return (
      <div className="mahlzeiten">
        <div className="karte">
          <div className="eingabe-feld">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Haferflocken mit Whey"
              autoFocus
            />
          </div>
          <div className="eingabe-reihe">
            <div className="eingabe-feld">
              <label>Kalorien</label>
              <input
                type="number"
                value={kalorien}
                onChange={(e) => setKalorien(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="eingabe-feld">
              <label>Carbs (g)</label>
              <input
                type="number"
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
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="eingabe-feld">
              <label>Fett (g)</label>
              <input
                type="number"
                value={fett}
                onChange={(e) => setFett(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="aktionen-reihe">
          <button className="abbrechen-btn" onClick={() => setErstellenModus(false)}>
            Abbrechen
          </button>
          <button className="speichern-btn" onClick={legeMahlzeitAn}>
            Mahlzeit speichern
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mahlzeiten">

      {mahlzeiten.length === 0 && (
        <div className="leer-zustand">
          <div className="leer-icon"><UtensilsCrossed size={24} /></div>
          <div className="leer-text">Noch keine Mahlzeit gespeichert</div>
          <div className="leer-untertext">
            Speicher Mahlzeiten, die du oft isst, um sie mit einem
            Tap zu loggen
          </div>
        </div>
      )}

      {mahlzeiten.length > 0 && (
        <div className="mahlzeiten-liste">
          {mahlzeiten.map(mahlzeit => (
            <div key={mahlzeit.id} className="mahlzeit-karte">
              <button
                className="mahlzeit-hauptbereich"
                onClick={() => schnellLoggen(mahlzeit)}
              >
                <div className="mahlzeit-info">
                  <span className="mahlzeit-name">{mahlzeit.name}</span>
                  <span className="mahlzeit-makros">
                    {mahlzeit.kalorien} kcal · C {mahlzeit.carbs}g ·
                    P {mahlzeit.protein}g · F {mahlzeit.fett}g
                  </span>
                </div>
                <div className="mahlzeit-log-icon">
                  {geradeGeloggt === mahlzeit.id ? (
                    <span className="geloggt-feedback">✓</span>
                  ) : (
                    <Zap size={18} />
                  )}
                </div>
              </button>
              <button
                className="mahlzeit-loeschen"
                onClick={() => loescheMahlzeit(mahlzeit.id)}
                aria-label="Mahlzeit löschen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="neu-btn" onClick={() => setErstellenModus(true)}>
        <Plus size={18} />
        Neue Mahlzeit speichern
      </button>

    </div>
  )
}

export default GespeicherteMahlzeiten