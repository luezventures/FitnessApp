/* ============================================
   TRAININGSPLAN.JSX — Vorlagen den Wochentagen zuweisen
   
   Baustein 2 von 4 im Trainingsplan-Block:
   Vorlagen (Baustein 1) existieren jetzt als
   eigenständige Dinge. Hier verknüpfen wir sie
   mit einem Wochentag.
   
   Datenmodell:
   { "Montag": vorlageId oder null, "Dienstag": ..., ... }
   null bedeutet "Ruhetag" — bewusst kein Eintrag,
   sondern ein expliziter Wert, damit wir später
   unterscheiden können zwischen "noch nicht
   eingeplant" (Tag fehlt im Objekt) und "Ruhetag,
   mit Absicht" (Tag ist da, Wert ist null).
   ============================================ */

import { CalendarDays } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Trainingsplan.css'

const WOCHENTAGE = [
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
  'Freitag', 'Samstag', 'Sonntag',
]

function Trainingsplan() {

  const [vorlagen] = useLocalStorage('fitnessapp_vorlagen', [])
  const [plan, setPlan] = useLocalStorage('fitnessapp_trainingsplan', {})

  function waehleVorlageFuerTag(tag, vorlageIdString) {
    // Der <select> liefert immer einen String zurück.
    // "" heißt "Ruhetag" -> im Plan speichern wir dafür null.
    // Sonst wandeln wir den String zurück in die echte Zahl-ID,
    // damit er zur id in vorlagen passt (die sind Zahlen, von Date.now()).
    const neuerWert = vorlageIdString === '' ? null : parseInt(vorlageIdString)

    setPlan({
      ...plan,
      [tag]: neuerWert,
    })
  }

  // Findet die Vorlage zu einer ID — für die Anzeige
  // ("wie viele Übungen hat der heutige Tag" etc.)
  function vorlageZuId(id) {
    return vorlagen.find(v => v.id === id)
  }

  if (vorlagen.length === 0) {
    return (
      <div className="trainingsplan">
        <div className="leer-zustand">
          <div className="leer-icon"><CalendarDays size={24} /></div>
          <div className="leer-text">Noch keine Vorlagen vorhanden</div>
          <div className="leer-untertext">
            Leg zuerst unter "Vorlagen" ein Training an, bevor du
            einen Wochenplan erstellst
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="trainingsplan">
      <div className="tage-liste">
        {WOCHENTAGE.map(tag => {
          // plan[tag] kann sein: undefined (noch nie gesetzt),
          // null (bewusst Ruhetag), oder eine Vorlage-ID
          const zugewieseneId = plan[tag] ?? null
          const zugewieseneVorlage = zugewieseneId ? vorlageZuId(zugewieseneId) : null

          return (
            <div key={tag} className="tag-zeile">
              <div className="tag-info">
                <div className="tag-name">{tag}</div>
                {zugewieseneVorlage && (
                  <div className="tag-detail">
                    {zugewieseneVorlage.uebungen.length}{' '}
                    {zugewieseneVorlage.uebungen.length === 1 ? 'Übung' : 'Übungen'}
                  </div>
                )}
              </div>

              <select
                className="tag-auswahl"
                value={zugewieseneId ?? ''}
                onChange={(e) => waehleVorlageFuerTag(tag, e.target.value)}
              >
                <option value="">Ruhetag</option>
                {vorlagen.map(vorlage => (
                  <option key={vorlage.id} value={vorlage.id}>
                    {vorlage.name}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Trainingsplan