/* ============================================
   PLATZHALTER.JSX — Wiederverwendbare "kommt noch"-Seite
   
   Für alle Profil-Unterpunkte, die laut Architektur-
   Diagramm geplant sind, aber noch nicht gebaut wurden.
   Ehrlicher als eine leere Seite oder ein toter Link —
   zeigt "das kommt", nicht "hier ist nichts".
   ============================================ */

import './Platzhalter.css'

function Platzhalter({ titel, text }) {
  return (
    <div className="platzhalter">
      <div className="platzhalter-icon">◌</div>
      <div className="platzhalter-titel">{titel}</div>
      <div className="platzhalter-text">{text}</div>
    </div>
  )
}

export default Platzhalter