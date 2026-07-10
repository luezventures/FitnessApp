/* ============================================
   APP.JSX — Die Startseite
   
   Das hier ist eine React-Komponente. Sieht aus
   wie HTML, ist aber JSX — React's Version davon.
   Unterschiede zu normalem HTML:
   - class → className (weil "class" in JS reserviert ist)
   - style={{ }} statt style="" (doppelte Klammern)
   - Alles muss in EINEM äußeren Element stehen
   ============================================ */

import './App.css'

function App() {
  return (
    <div className="landing">

      {/* Status-Badge: zeigt "aktiv in Entwicklung" */}
      <div className="status-badge">
        <span className="pulse-dot"></span>
        Deine All-in-One Fitness-App
      </div>

      {/* Hero: Der Claim, groß und zentriert */}
      <div className="hero">
        <h1 className="claim">
          Do it anyway<span className="claim-dot">.</span>
        </h1>
        <p className="subtitle">
          Eine Fitness-App, die Gym, Laufen, Yoga, etc. in einen Plan bringt.
          Kein Abo. Keine 20 Apps!
          In building...
        </p>
      </div>

      {/* Vorschau-Karten: was kommt */}
      <div className="preview-grid">
        <div className="preview-card">
          <div className="preview-icon">🏋️</div>
          <div className="preview-label">Workout</div>
        </div>
        <div className="preview-card">
          <div className="preview-icon">🏃</div>
          <div className="preview-label">Laufen</div>
        </div>
        <div className="preview-card">
          <div className="preview-icon">📊</div>
          <div className="preview-label">Tracking</div>
        </div>
      </div>

      {/* Footer: Instagram + GitHub */}
      <div className="footer">
        <a
          href="https://instagram.com/luezventures"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          @luezventures
        </a>
        <p className="footer-text">
          Open Source auf{' '}
          <a
            href="https://github.com/luezventures/FitnessApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>

    </div>
  )
}

export default App