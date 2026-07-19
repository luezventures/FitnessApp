/* ============================================
   APP.JSX
   
   NEU: Der Header zeigt "Do it anyway." nur noch
   auf Start. Auf den anderen Reitern steht
   stattdessen der Name der Seite — passend zu
   deinen Wireframes (Training-Screen, Ernährung-
   Screen zeigen jeweils ihren eigenen Titel).
   ============================================ */

import { useState } from 'react'
import { House, Dumbbell, Utensils, User } from 'lucide-react'
import Home from './components/Home'
import Training from './components/Training'
import Ernaehrung from './components/Ernaehrung'
import Profil from './components/Profil'
import './App.css'

const SEITEN_TITEL = {
  training: 'Training',
  ernaehrung: 'Ernährung',
  profil: 'Profil',
}

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
        {seite === 'home' ? (
          <h1 className="claim">
            Do it anyway<span className="claim-dot">.</span>
          </h1>
        ) : (
          <h1 className="seiten-titel">{SEITEN_TITEL[seite]}</h1>
        )}
        <p className="datum">{heute}</p>
      </header>

      <main className="app-main">
        {seite === 'home' && <Home zuTraining={() => setSeite('training')} />}
        {seite === 'training' && <Training />}
        {seite === 'ernaehrung' && <Ernaehrung />}
        {seite === 'profil' && <Profil />}
      </main>

      <nav className="app-nav">
        <button
          className={`nav-btn ${seite === 'home' ? 'aktiv' : ''}`}
          onClick={() => setSeite('home')}
        >
          <span className="nav-icon"><House size={20} /></span>
          <span className="nav-label">Start</span>
        </button>

        <button
          className={`nav-btn ${seite === 'training' ? 'aktiv' : ''}`}
          onClick={() => setSeite('training')}
        >
          <span className="nav-icon"><Dumbbell size={20} /></span>
          <span className="nav-label">Training</span>
        </button>

        <button
          className={`nav-btn ${seite === 'ernaehrung' ? 'aktiv' : ''}`}
          onClick={() => setSeite('ernaehrung')}
        >
          <span className="nav-icon"><Utensils size={20} /></span>
          <span className="nav-label">Ernährung</span>
        </button>

        <button
          className={`nav-btn ${seite === 'profil' ? 'aktiv' : ''}`}
          onClick={() => setSeite('profil')}
        >
          <span className="nav-icon"><User size={20} /></span>
          <span className="nav-label">Profil</span>
        </button>
      </nav>

    </div>
  )
}

export default App