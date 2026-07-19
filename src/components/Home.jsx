/* ============================================
   HOME.JSX — jetzt nur noch der Rahmen
   
   NEU: Zeigt standardmäßig das Dashboard.
   Die alte Info-Seite (Was ist das, Feature-Liste,
   Links) ist nicht verschwunden — sie ist jetzt
   über einen kleinen Link erreichbar, genau wie
   die Unteransichten in Profil.jsx.
   ============================================ */

import { useState } from 'react'
import { Info, ArrowLeft } from 'lucide-react'
import Dashboard from './Dashboard'
import UeberApp from './UeberApp'
import './Home.css'

function Home({ zuTraining }) {

  const [zeigeUeberApp, setZeigeUeberApp] = useState(false)

  if (zeigeUeberApp) {
    return (
      <div className="home">
        <button className="zurueck-btn" onClick={() => setZeigeUeberApp(false)}>
          <ArrowLeft size={16} />
          Zurück
        </button>
        <UeberApp />
      </div>
    )
  }

  return (
    <div className="home">
      <Dashboard zuTraining={zuTraining} />
      <button className="ueber-app-link" onClick={() => setZeigeUeberApp(true)}>
        <Info size={13} />
        Über diese App
      </button>
    </div>
  )
}

export default Home