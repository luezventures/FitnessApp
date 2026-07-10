/* ============================================
   APP.JSX — Rahmen mit Navigation
   
   Navigation: Start · Sport
   (Übersicht kommt später als dritter Punkt)
   ============================================ */

import { useState } from 'react'
import Home from './components/Home'
import Sport from './components/Sport'
import './App.css'

function App() {

  const [seite, setSeite] = useState('home')

  const heute = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="app">

      <header className="app-header">
        <h1 className="claim">
          Do it anyway<span className="claim-dot">.</span>
        </h1>
        <p className="datum">{heute}</p>
      </header>

      <main className="app-main">
        {seite === 'home' && <Home />}
        {seite === 'sport' && <Sport />}
      </main>

      <nav className="app-nav">
        <button
          className={`nav-btn ${seite === 'home' ? 'aktiv' : ''}`}
          onClick={() => setSeite('home')}
        >
          <span className="nav-icon">◉</span>
          <span className="nav-label">Start</span>
        </button>

        <button
          className={`nav-btn ${seite === 'sport' ? 'aktiv' : ''}`}
          onClick={() => setSeite('sport')}
        >
          <span className="nav-icon">▦</span>
          <span className="nav-label">Sport</span>
        </button>
      </nav>

    </div>
  )
}

export default App