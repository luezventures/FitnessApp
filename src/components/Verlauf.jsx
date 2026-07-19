/* ============================================
   VERLAUF.JSX — Geschichte vergangener Einheiten
   
   NEU (Teil der Wireframe-Umsetzung): zeigt
   vergangene Gym-Tage und Läufe zusammen,
   chronologisch, als abgeschlossene Einheiten.
   
   Ein Gym-Tag zeigt den echten Vorlagen-Namen,
   WENN die Sätze über Aktives Training geloggt
   wurden (die haben seit dem letzten Update ein
   "vorlageId"-Feld). Ältere oder frei geloggte
   Sätze zeigen stattdessen die trainierten
   Muskelgruppen als Titel.
   
   berechneVerlauf() ist exportiert, damit die
   kompakte Vorschau auf der Training-Hauptseite
   dieselbe Logik nutzen kann, statt sie zu
   duplizieren.
   ============================================ */

import { Dumbbell, Footprints, Check } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Verlauf.css'

/* ===== GETEILTE BERECHNUNG =====
   Baut aus Sätzen und Läufen eine gemeinsame,
   sortierte Liste vergangener Einheiten. */
export function berechneVerlauf(saetze, laeufe, vorlagen, heute) {

  // Sätze nach Datum gruppieren, HEUTE ausgeschlossen
  // (heute ist noch nicht "Geschichte")
  const saetzeNachDatum = {}
  for (const satz of saetze) {
    if (satz.datum === heute) continue
    if (!saetzeNachDatum[satz.datum]) saetzeNachDatum[satz.datum] = []
    saetzeNachDatum[satz.datum].push(satz)
  }

  const gymEintraege = Object.keys(saetzeNachDatum).map(datum => {
    const saetzeDesTages = saetzeNachDatum[datum]

    // Häufigste vorlageId dieses Tages finden
    const idZaehler = {}
    for (const satz of saetzeDesTages) {
      if (satz.vorlageId) {
        idZaehler[satz.vorlageId] = (idZaehler[satz.vorlageId] || 0) + 1
      }
    }
    const haeufigsteId = Object.keys(idZaehler).sort((a, b) => idZaehler[b] - idZaehler[a])[0]
    const vorlage = haeufigsteId ? vorlagen.find(v => v.id === parseInt(haeufigsteId)) : null

    const titel = vorlage
      ? vorlage.name
      : `Training: ${[...new Set(saetzeDesTages.map(s => s.gruppe))].join(', ')}`

    return {
      id: `gym-${datum}`,
      typ: 'gym',
      datum,
      titel,
      untertitel: `${saetzeDesTages.length} ${saetzeDesTages.length === 1 ? 'Satz' : 'Sätze'}`,
    }
  })

  const laufEintraege = laeufe
    .filter(lauf => lauf.datum !== heute)
    .map(lauf => ({
      id: `lauf-${lauf.id}`,
      typ: 'lauf',
      datum: lauf.datum,
      titel: lauf.laufart,
      untertitel: `${lauf.distanz.toString().replace('.', ',')} km`,
    }))

  // Zusammenführen, neuestes Datum zuerst
  return [...gymEintraege, ...laufEintraege].sort((a, b) => b.datum.localeCompare(a.datum))
}

function formatiereDatum(datumString) {
  const [jahr, monat, tag] = datumString.split('-')
  const date = new Date(Number(jahr), Number(monat) - 1, Number(tag))
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function alsDatumString(date) {
  const jahr = date.getFullYear()
  const monat = (date.getMonth() + 1).toString().padStart(2, '0')
  const tag = date.getDate().toString().padStart(2, '0')
  return `${jahr}-${monat}-${tag}`
}


function Verlauf() {

  const [saetze] = useLocalStorage('fitnessapp_saetze', [])
  const [laeufe] = useLocalStorage('fitnessapp_laeufe', [])
  const [vorlagen] = useLocalStorage('fitnessapp_vorlagen', [])

  const heute = alsDatumString(new Date())
  const eintraege = berechneVerlauf(saetze, laeufe, vorlagen, heute)

  return (
    <div className="verlauf">
      {eintraege.length === 0 && (
        <div className="leer-zustand">
          <div className="leer-text">Noch keine abgeschlossene Einheit</div>
          <div className="leer-untertext">
            Sobald du trainierst oder läufst, taucht es hier auf
          </div>
        </div>
      )}

      {eintraege.length > 0 && (
        <div className="verlauf-liste">
          {eintraege.map(eintrag => (
            <div key={eintrag.id} className="verlauf-zeile">
              <div className="verlauf-check"><Check size={16} /></div>
              <div className="verlauf-icon">
                {eintrag.typ === 'gym' ? <Dumbbell size={16} /> : <Footprints size={16} />}
              </div>
              <div className="verlauf-info">
                <span className="verlauf-titel">{eintrag.titel}</span>
                <span className="verlauf-datum">{formatiereDatum(eintrag.datum)}</span>
              </div>
              <span className="verlauf-untertitel">{eintrag.untertitel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Verlauf