/* ============================================
   HOME.JSX — Die Info-Seite
   
   Was Besucher sehen, wenn sie von Instagram
   kommen: was ist das, wer baut das, wo mitverfolgen.
   
   Später wird hier das Dashboard draus, wenn
   genug Daten da sind.
   ============================================ */

import './Home.css'

function Home() {
  return (
    <div className="home">

      {/* Status: zeigt, dass hier aktiv gebaut wird */}
      <div className="status-badge">
        <span className="pulse-dot"></span>
        Deine All-in-One Sport-App!
      </div>

      {/* Was ist das? */}
      <div className="info-karte">
        <h2 className="info-titel">Was ist das Ziel?</h2>
        <p className="info-text">
          Eine Sport-App, mit allen perönlichen Trainingsbereichen:
          Gym, Laufen, Yoga und was auch immer du willst!
           Alles in einer App und Open-Source so lange wie möglich.
        </p>
      </div>

      {/* Was kann sie schon? */}
      <div className="info-karte">
        <h2 className="info-titel">Was schon läuft</h2>
        <div className="feature-liste">
          <div className="feature fertig">
            <span className="feature-status">✓</span>
            <div>
              <div className="feature-name">Satz-Logger</div>
              <div className="feature-detail">
                Gewicht, Wiederholungen und RPE pro Satz festhalten
              </div>
            </div>
          </div>
          <div className="feature fertig">
            <span className="feature-status">✓</span>
            <div>
              <div className="feature-name">Laufen</div>
              <div className="feature-detail">
                Läufe tracken, mit dem Gym-Plan verzahnt
              </div>
            </div>
          </div>
          <div className="feature">
            <span className="feature-status">○</span>
            <div>
              <div className="feature-name">Trainingsplan</div>
              <div className="feature-detail">
                Persönlichen Trainingsplan erstellen und verfolgen
              </div>
            </div>
          </div>
          <div className="feature">
            <span className="feature-status">○</span>
            <div>
              <div className="feature-name">Statistiken</div>
              <div className="feature-detail">
                Fortschritt über Wochen sehen
              </div>
            </div>
          </div>
          <div className="feature">
            <span className="feature-status">○</span>
            <div>
              <div className="feature-name">Weitere Sportarten</div>
              <div className="feature-detail">
                Yoga, Schwimmen, Radfahren, was du willst
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wie es gebaut wird */}
      <div className="info-karte">
        <h2 className="info-titel">Der Prozess</h2>
        <p className="info-text">
          Ich bin kein Softwareentwickler. Ich baue die Anwendung Stück für
          Stück, lerne unterwegs, und dokumentiere alles auf Social Media.
          Der komplette Code ist frei verfügbar.
        </p>
      </div>

      {/* Links */}
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

export default Home