/* ============================================
   UEBERAPP.JSX — die alte Info-Seite, umgezogen
   
   War früher der komplette Inhalt von "Start".
   Jetzt eine Unteransicht, erreichbar über den
   "Über diese App"-Link auf dem Dashboard.
   
   Feature-Liste aktualisiert: vieles, was hier
   noch offen war, ist inzwischen fertig.
   ============================================ */

import { Check } from 'lucide-react'
import './UeberApp.css'

function UeberApp() {
  return (
    <div className="ueber-app">

      <div className="status-badge">
        <span className="pulse-dot"></span>
        In Entwicklung — Open Source
      </div>

      <div className="info-karte">
        <h2 className="info-titel">Was ist das?</h2>
        <p className="info-text">
          Eine Fitness-App, die ich mir selbst baue — weil keine
          existierende App genau das macht, was ich brauche.
          Gym und Laufen in einem Plan, kein Abo, kein Ballast.
        </p>
      </div>

      <div className="info-karte">
        <h2 className="info-titel">Was schon läuft</h2>
        <div className="feature-liste">
          <div className="feature fertig">
            <span className="feature-status"><Check size={16} /></span>
            <div>
              <div className="feature-name">Workout-Logger</div>
              <div className="feature-detail">
                Gewicht, Wiederholungen und RPE pro Satz festhalten
              </div>
            </div>
          </div>
          <div className="feature fertig">
            <span className="feature-status"><Check size={16} /></span>
            <div>
              <div className="feature-name">Lauf- &amp; Rad-Logger</div>
              <div className="feature-detail">
                Distanz, Zeit, Pace automatisch berechnet
              </div>
            </div>
          </div>
          <div className="feature fertig">
            <span className="feature-status"><Check size={16} /></span>
            <div>
              <div className="feature-name">Trainingsplan</div>
              <div className="feature-detail">
                Vorlagen erstellen, Wochentagen zuweisen, live abhaken
              </div>
            </div>
          </div>
          <div className="feature fertig">
            <span className="feature-status"><Check size={16} /></span>
            <div>
              <div className="feature-name">Ernährung</div>
              <div className="feature-detail">
                Kalorien &amp; Makros mit Zielen, gespeicherte Mahlzeiten
              </div>
            </div>
          </div>
          <div className="feature fertig">
            <span className="feature-status"><Check size={16} /></span>
            <div>
              <div className="feature-name">Statistiken</div>
              <div className="feature-detail">
                Wochenübersicht mit Navigation durch vergangene Wochen
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="info-karte">
        <h2 className="info-titel">Der Prozess</h2>
        <p className="info-text">
          Ich bin kein Softwareentwickler. Ich baue das Stück für
          Stück, lerne unterwegs, und dokumentiere alles — auch
          die Fehler. Der komplette Code ist offen.
        </p>
      </div>

      <div className="links">
        <a
          href="https://instagram.com/luezventures"
          target="_blank"
          rel="noopener noreferrer"
          className="link-btn primary"
        >
          @luezventures
        </a>
        <a
          href="https://github.com/luezventures/FitnessApp"
          target="_blank"
          rel="noopener noreferrer"
          className="link-btn"
        >
          Code auf GitHub
        </a>
      </div>

    </div>
  )
}

export default UeberApp