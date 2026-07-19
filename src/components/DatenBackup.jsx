/* ============================================
   DATENBACKUP.JSX — Export / Import / Löschen
   
   Export: sammelt ALLE fitnessapp_*-Schlüssel aus
   localStorage in ein Objekt, wandelt es in Text
   (JSON) um, und lässt den Browser das als Datei
   herunterladen.
   
   Der Trick zum Datei-Download im Browser:
   1. Blob — ein "Datei-artiges" Objekt aus Text
   2. URL.createObjectURL — macht daraus eine
      temporäre, klickbare Adresse
   3. Ein unsichtbarer <a>-Link mit "download"-
      Attribut, den wir per Code anklicken lassen
   
   Import: liest eine ausgewählte Datei, prüft ob
   es gültiges JSON ist, und schreibt jeden
   Schlüssel zurück in localStorage.
   ============================================ */

import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import './DatenBackup.css'

// Alle Speicher-Schlüssel, die zur App gehören
const ALLE_SCHLUESSEL = [
  'fitnessapp_saetze',
  'fitnessapp_gruppen',
  'fitnessapp_laeufe',
  'fitnessapp_radtouren',
  'fitnessapp_gewicht',
  'fitnessapp_ernaehrung',
  'fitnessapp_ernaehrungsziele',
  'fitnessapp_mahlzeiten',
  'fitnessapp_vorlagen',
  'fitnessapp_trainingsplan',
  'fitnessapp_wochenziele',
  'fitnessapp_fotos',
  'fitnessapp_profil',
]

function DatenBackup() {

  const dateiInputRef = useRef(null)
  const [meldung, setMeldung] = useState(null)

  function exportieren() {
    const daten = {}
    for (const schluessel of ALLE_SCHLUESSEL) {
      const wert = localStorage.getItem(schluessel)
      if (wert !== null) {
        daten[schluessel] = JSON.parse(wert)
      }
    }

    const text = JSON.stringify(daten, null, 2)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const heute = new Date().toISOString().split('T')[0]
    const link = document.createElement('a')
    link.href = url
    link.download = `do-it-anyway-backup-${heute}.json`
    link.click()

    URL.revokeObjectURL(url)
    setMeldung({ typ: 'erfolg', text: 'Backup heruntergeladen.' })
  }

  function dateiAusgewaehlt(event) {
    const datei = event.target.files[0]
    if (!datei) return

    if (!confirm('Import überschreibt deine aktuellen Daten mit dem Inhalt der Datei. Fortfahren?')) {
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const daten = JSON.parse(e.target.result)

        for (const schluessel of Object.keys(daten)) {
          if (ALLE_SCHLUESSEL.includes(schluessel)) {
            localStorage.setItem(schluessel, JSON.stringify(daten[schluessel]))
          }
        }

        setMeldung({ typ: 'erfolg', text: 'Import erfolgreich. Lade die Seite neu, um alles zu sehen.' })
      } catch (fehler) {
        setMeldung({ typ: 'fehler', text: 'Diese Datei ist kein gültiges Backup.' })
      }
    }
    reader.readAsText(datei)
    event.target.value = ''
  }

  return (
    <div className="daten-backup">

      <div className="karte">
        <div className="karte-titel">Backup herunterladen</div>
        <div className="karte-text">
          Speichert alle deine Daten als Datei — Sätze, Läufe, Gewicht,
          Ernährung, Vorlagen, alles.
        </div>
        <button className="aktion-btn primary" onClick={exportieren}>
          <Download size={16} />
          Backup exportieren
        </button>
      </div>

      <div className="karte">
        <div className="karte-titel">Backup wiederherstellen</div>
        <div className="karte-text">
          Wählt eine zuvor exportierte Datei und schreibt sie zurück.
          Überschreibt deine aktuellen Daten.
        </div>
        <input
          type="file"
          accept="application/json"
          ref={dateiInputRef}
          onChange={dateiAusgewaehlt}
          style={{ display: 'none' }}
        />
        <button className="aktion-btn" onClick={() => dateiInputRef.current.click()}>
          <Upload size={16} />
          Backup importieren
        </button>
      </div>

      {meldung && (
        <div className={`meldung ${meldung.typ}`}>{meldung.text}</div>
      )}

    </div>
  )
}

export default DatenBackup
