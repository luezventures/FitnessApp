/* ============================================
   HEUTE.JSX — Baustein 4: Quick-Start
   
   Schaut im Trainingsplan nach, was für HEUTE
   eingeplant ist, und bietet den Einstieg ins
   Aktive Training. Das ist der Punkt, an dem
   Vorlage + Plan + Loggen zusammenlaufen.
   
   Drei mögliche Zustände für heute:
   1. Eine Vorlage ist zugewiesen -> "Starten"
   2. Bewusst Ruhetag (Wert ist null) -> Ruhe-Hinweis
   3. Noch nie geplant (Tag fehlt im Objekt) -> Hinweis,
      erst unter "Plan" was festzulegen
   ============================================ */

import { useState } from 'react'
import { Sunrise, Play, Moon } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import AktivesTraining from './AktivesTraining'
import './Heute.css'

// Index von Date().getDay() (0 = Sonntag) auf unsere Wochentag-Namen
const WOCHENTAG_NAMEN = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch',
  'Donnerstag', 'Freitag', 'Samstag',
]

function Heute() {

  const [plan] = useLocalStorage('fitnessapp_trainingsplan', {})
  const [vorlagen] = useLocalStorage('fitnessapp_vorlagen', [])

  // Ist gerade ein Training aktiv (Live-Screen offen)?
  const [aktivesTraining, setAktivesTraining] = useState(false)

  const heutigerWochentag = WOCHENTAG_NAMEN[new Date().getDay()]

  // plan[tag] kann drei Dinge sein:
  // undefined = noch nie gesetzt, null = bewusst Ruhetag,
  // eine Zahl = die ID der zugewiesenen Vorlage
  const zuweisung = plan[heutigerWochentag]
  const vorlage = zuweisung ? vorlagen.find(v => v.id === zuweisung) : null

  // Wenn das Training läuft: zeig NUR den Live-Screen,
  // nichts drumherum. Fertig-Button dort bringt zurück.
  if (aktivesTraining && vorlage) {
    return (
      <AktivesTraining
        vorlage={vorlage}
        onBeenden={() => setAktivesTraining(false)}
      />
    )
  }

  return (
    <div className="heute">

      {/* Fall 1: Vorlage zugewiesen */}
      {vorlage && (
        <div className="heute-karte hervorgehoben">
          <div className="heute-label">{heutigerWochentag}</div>
          <div className="heute-vorlage-name">{vorlage.name}</div>
          <div className="heute-detail">
            {vorlage.uebungen.length}{' '}
            {vorlage.uebungen.length === 1 ? 'Übung' : 'Übungen'}
          </div>
          <button
            className="starten-btn"
            onClick={() => setAktivesTraining(true)}
          >
            <Play size={16} />
            Training starten
          </button>
        </div>
      )}

      {/* Fall 2: bewusst Ruhetag (Wert ist explizit null) */}
      {zuweisung === null && (
        <div className="heute-karte ruhe">
          <div className="heute-icon"><Moon size={22} /></div>
          <div className="heute-vorlage-name">Ruhetag</div>
          <div className="heute-detail">Heute steht nichts an — genieß es.</div>
        </div>
      )}

      {/* Fall 3: noch nie geplant */}
      {zuweisung === undefined && (
        <div className="heute-karte leer">
          <div className="heute-icon"><Sunrise size={22} /></div>
          <div className="heute-vorlage-name">Noch kein Plan für heute</div>
          <div className="heute-detail">
            Leg unter "Plan" fest, was an welchem Tag ansteht
          </div>
        </div>
      )}

    </div>
  )
}

export default Heute