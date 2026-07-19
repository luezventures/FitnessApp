/* ============================================
   EINSTELLUNGEN.JSX
   
   NEU: echte Einheiten-Präferenz (gespeichert,
   aber noch nicht überall in der App wirksam —
   das wäre ein größerer Folgeschritt), echtes
   Datenexport/Backup, und "Account löschen"
   direkt auf dieser Hauptseite.
   
   Dark Mode und Sprache aus dem Wireframe sind
   bewusst weggelassen: die App hat aktuell nur
   ein dunkles Theme und nur Deutsch — ein
   Umschalter dafür hätte gerade nichts zu tun.
   ============================================ */

import { useState } from 'react'
import { Ruler, Download, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import DatenBackup from './DatenBackup'
import './Einstellungen.css'

const ALLE_SCHLUESSEL = [
  'fitnessapp_saetze', 'fitnessapp_gruppen', 'fitnessapp_laeufe',
  'fitnessapp_radtouren', 'fitnessapp_gewicht', 'fitnessapp_ernaehrung',
  'fitnessapp_ernaehrungsziele', 'fitnessapp_mahlzeiten', 'fitnessapp_vorlagen',
  'fitnessapp_trainingsplan', 'fitnessapp_wochenziele', 'fitnessapp_fotos',
  'fitnessapp_profil',
]

function Einstellungen({ onZurueck }) {

  const [unterpunkt, setUnterpunkt] = useState(null)
  const [einheiten, setEinheiten] = useLocalStorage('fitnessapp_einheiten', { gewicht: 'kg', distanz: 'km' })

  function accountLoeschen() {
    const bestaetigung = prompt(
      'Das löscht ALLE deine Daten unwiderruflich. Tipp "LÖSCHEN" um zu bestätigen.'
    )
    if (bestaetigung !== 'LÖSCHEN') return

    for (const schluessel of ALLE_SCHLUESSEL) {
      localStorage.removeItem(schluessel)
    }
    window.location.reload()
  }

  /* ===== UNTERANSICHT: Einheiten ===== */
  if (unterpunkt === 'einheiten') {
    return (
      <div className="einstellungen">
        <button className="zurueck-btn" onClick={() => setUnterpunkt(null)}>
          <ArrowLeft size={16} />
          Einstellungen
        </button>

        <div className="karte">
          <div className="eingabe-feld">
            <label>Gewicht</label>
            <select
              className="auswahl"
              value={einheiten.gewicht}
              onChange={(e) => setEinheiten({ ...einheiten, gewicht: e.target.value })}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </div>
          <div className="eingabe-feld">
            <label>Distanz</label>
            <select
              className="auswahl"
              value={einheiten.distanz}
              onChange={(e) => setEinheiten({ ...einheiten, distanz: e.target.value })}
            >
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
          <div className="hinweis-text">
            Diese Einstellung wird gespeichert. Die Anzeige in der
            restlichen App auf diese Einheit umzustellen ist ein
            separater, größerer Schritt.
          </div>
        </div>
      </div>
    )
  }

  /* ===== UNTERANSICHT: Datenexport/Backup ===== */
  if (unterpunkt === 'export') {
    return (
      <div className="einstellungen">
        <button className="zurueck-btn" onClick={() => setUnterpunkt(null)}>
          <ArrowLeft size={16} />
          Einstellungen
        </button>
        <DatenBackup />
      </div>
    )
  }

  /* ===== HAUPTLISTE ===== */
  return (
    <div className="einstellungen">
      <button className="zurueck-btn" onClick={onZurueck}>
        <ArrowLeft size={16} />
        Profil
      </button>

      <div className="menu-liste">
        <button className="menu-zeile" onClick={() => setUnterpunkt('einheiten')}>
          <span className="menu-icon"><Ruler size={18} /></span>
          <span className="menu-label">Einheiten (kg/km)</span>
          <ChevronRight size={16} className="menu-pfeil" />
        </button>
        <button className="menu-zeile" onClick={() => setUnterpunkt('export')}>
          <span className="menu-icon"><Download size={18} /></span>
          <span className="menu-label">Datenexport/Backup</span>
          <ChevronRight size={16} className="menu-pfeil" />
        </button>
      </div>

      <button className="account-loeschen-btn" onClick={accountLoeschen}>
        <Trash2 size={16} />
        Account löschen
      </button>
    </div>
  )
}

export default Einstellungen