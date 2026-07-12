/* ============================================
   SPORT.JSX — Die Sport-Seite
   
   Obere Ebene: Umschalter zwischen Sportarten.
   Wählt man "Gym", kommt der SatzLogger.
   Wählt man "Laufen", der LaufLogger.
   
   Diese Struktur ist erweiterbar: neue Sportart
   = ein Eintrag mehr im SPORTARTEN-Array und
   eine Zeile mehr in der Anzeige.
   ============================================ */

import { useState } from 'react'
import SatzLogger from './SatzLogger'
import LaufLogger from './LaufLogger'
import Radfahren from './Radfahren'
import './Sport.css'

// Die verfügbaren Sportarten. Später einfach erweiterbar.
const SPORTARTEN = [
  { id: 'gym', label: 'Gym' },
  { id: 'laufen', label: 'Laufen' },
  { id: 'radfahren', label: 'Radfahren' },
]

function Sport() {

  // Welche Sportart ist gewählt? Startwert: Gym
  const [sport, setSport] = useState('gym')

  return (
    <div className="sport">

      {/* Obere Ebene: Sportart-Umschalter */}
      <div className="sport-switch">
        {SPORTARTEN.map(art => (
          <button
            key={art.id}
            className={`sport-tab ${sport === art.id ? 'aktiv' : ''}`}
            onClick={() => setSport(art.id)}
          >
            {art.label}
          </button>
        ))}
      </div>

      {/* Der passende Logger */}
      <div className="sport-inhalt">
        {sport === 'gym' && <SatzLogger />}
        {sport === 'laufen' && <LaufLogger />}
        {sport === 'radfahren' && <Radfahren />}
      </div>

    </div>
  )
}

export default Sport