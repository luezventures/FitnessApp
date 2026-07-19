/* ============================================
   TRAINING.JSX — komplett neu strukturiert
   
   Statt Tab-Umschalter jetzt EINE durchscrollbare
   Seite: Heute-Karte, dann kompakte Vorschauen von
   Trainingsplan, Vorlagen, Statistik und Verlauf.
   Jede Vorschau hat einen Link, der die volle
   Ansicht als Unteransicht öffnet — exakt das
   Muster aus Profil.jsx, nur auf mehrere Bereiche
   gleichzeitig angewendet.
   
   Freies Training (Laufen/Radfahren ohne Vorlage)
   bleibt über einen dezenten Link erreichbar, weil
   diese beiden Sportarten noch kein eigenes
   Vorlagen-System haben.
   ============================================ */

import { useState } from 'react'
import {
  Dumbbell, Footprints, Plus, ChevronRight, ArrowLeft, Trophy,
} from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Heute from './Heute'
import Trainingsplan from './Trainingsplan'
import Vorlagen from './Vorlagen'
import Statistik from './Statistik'
import Verlauf, { berechneVerlauf } from './Verlauf'
import Sport from './Sport'
import './Training.css'

const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const KURZ = { Montag: 'Mo', Dienstag: 'Di', Mittwoch: 'Mi', Donnerstag: 'Do', Freitag: 'Fr', Samstag: 'Sa', Sonntag: 'So' }
const WOCHENTAG_NAMEN = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

function Training() {

  // null = Hauptübersicht. Sonst welche Vollansicht offen ist.
  const [unteransicht, setUnteransicht] = useState(null)

  const [plan] = useLocalStorage('fitnessapp_trainingsplan', {})
  const [vorlagen] = useLocalStorage('fitnessapp_vorlagen', [])
  const [saetze] = useLocalStorage('fitnessapp_saetze', [])
  const [laeufe] = useLocalStorage('fitnessapp_laeufe', [])
  const [wochenZiele] = useLocalStorage('fitnessapp_wochenziele', { workouts: 5, laufkm: 20 })

  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }
  const heute = alsDatumString(new Date())
  const heutigerWochentag = WOCHENTAG_NAMEN[new Date().getDay()]


  /* ===== TRAININGSPLAN-VORSCHAU ===== */
  const geplanteTage = WOCHENTAGE.filter(tag => plan[tag])
  const planZeile = geplanteTage
    .map(tag => {
      const vorlage = vorlagen.find(v => v.id === plan[tag])
      return `${KURZ[tag]}: ${vorlage ? vorlage.name : '?'}`
    })
    .join(' · ')


  /* ===== STATISTIK-VORSCHAU ===== */
  function montagDieserWoche() {
    const jetzt = new Date()
    const wochentag = jetzt.getDay()
    const tageZumMontag = wochentag === 0 ? 6 : wochentag - 1
    const montag = new Date(jetzt)
    montag.setDate(jetzt.getDate() - tageZumMontag)
    return montag
  }
  const montag = montagDieserWoche()
  const wochenTage = []
  for (let i = 0; i < 7; i++) {
    const tag = new Date(montag)
    tag.setDate(montag.getDate() + i)
    wochenTage.push(alsDatumString(tag))
  }
  const trainingsTageAnzahl = new Set(
    saetze.filter(s => wochenTage.includes(s.datum)).map(s => s.datum)
  ).size
  const statistikProzent = Math.min(100, (trainingsTageAnzahl / wochenZiele.workouts) * 100)

  function findeLetztenPR() {
    const nachUebung = {}
    for (const satz of saetze) {
      if (!nachUebung[satz.uebung]) nachUebung[satz.uebung] = []
      nachUebung[satz.uebung].push(satz)
    }
    let letzterPR = null
    for (const uebungName of Object.keys(nachUebung)) {
      const sortiert = [...nachUebung[uebungName]].sort((a, b) => a.zeitstempel - b.zeitstempel)
      let maxGewicht = 0
      for (const satz of sortiert) {
        if (satz.gewicht > maxGewicht) {
          maxGewicht = satz.gewicht
          if (!letzterPR || satz.zeitstempel > letzterPR.zeitstempel) {
            letzterPR = { uebung: uebungName, gewicht: satz.gewicht }
          }
        }
      }
    }
    return letzterPR
  }
  const letzterPR = findeLetztenPR()


  /* ===== VERLAUF-VORSCHAU (erste 2 Einträge) ===== */
  const verlaufEintraege = berechneVerlauf(saetze, laeufe, vorlagen, heute).slice(0, 2)


  /* ===== UNTERANSICHTEN ===== */
  if (unteransicht) {
    const titel = {
      plan: 'Trainingsplan',
      vorlagen: 'Trainings-Vorlagen',
      statistik: 'Statistik',
      verlauf: 'Verlauf',
      frei: 'Freies Training',
    }[unteransicht]

    return (
      <div className="training-seite">
        <button className="zurueck-btn" onClick={() => setUnteransicht(null)}>
          <ArrowLeft size={16} />
          {titel}
        </button>

        {unteransicht === 'plan' && <Trainingsplan />}
        {unteransicht === 'vorlagen' && <Vorlagen />}
        {unteransicht === 'statistik' && <Statistik />}
        {unteransicht === 'verlauf' && <Verlauf />}
        {unteransicht === 'frei' && <Sport />}
      </div>
    )
  }


  /* ===== HAUPTÜBERSICHT ===== */
  return (
    <div className="training-seite">

      {/* Heute — bleibt exakt wie gehabt, inklusive Live-Screen */}
      <Heute />

      {/* Trainingsplan-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Trainingsplan</span>
          <button className="vorschau-link" onClick={() => setUnteransicht('plan')}>
            Bearbeiten
          </button>
        </div>
        <div className="wochentag-pillen">
          {WOCHENTAGE.map(tag => (
            <div
              key={tag}
              className={`wochentag-pille ${plan[tag] ? 'geplant' : ''} ${tag === heutigerWochentag ? 'heute' : ''}`}
            >
              {KURZ[tag]}
            </div>
          ))}
        </div>
        {planZeile ? (
          <div className="plan-zeile-text">{planZeile}</div>
        ) : (
          <div className="plan-zeile-text leer">Noch kein Plan festgelegt</div>
        )}
      </div>

      {/* Trainings-Vorlagen-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Trainings-Vorlagen</span>
          <button className="vorschau-plus" onClick={() => setUnteransicht('vorlagen')} aria-label="Neue Vorlage">
            <Plus size={16} />
          </button>
        </div>

        {vorlagen.length === 0 && (
          <div className="vorschau-leer">Noch keine Vorlage erstellt</div>
        )}

        {vorlagen.slice(0, 2).map(vorlage => (
          <button
            key={vorlage.id}
            className="kompakt-zeile"
            onClick={() => setUnteransicht('vorlagen')}
          >
            <div className="kompakt-icon"><Dumbbell size={16} /></div>
            <div className="kompakt-info">
              <span className="kompakt-name">{vorlage.name}</span>
              <span className="kompakt-detail">{vorlage.uebungen.length} Übungen · Kraft</span>
            </div>
            <ChevronRight size={16} className="kompakt-pfeil" />
          </button>
        ))}

        {vorlagen.length > 0 && (
          <button className="vorschau-link block" onClick={() => setUnteransicht('vorlagen')}>
            Alle Vorlagen anzeigen
          </button>
        )}
      </div>

      {/* Statistik-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Statistik</span>
          <button className="vorschau-link" onClick={() => setUnteransicht('statistik')}>
            Alle anzeigen
          </button>
        </div>
        <div className="statistik-vorschau-reihe">
          <div className="statistik-balken-bereich">
            <div className="statistik-balken-label">Wochenübersicht</div>
            <div className="statistik-balken">
              <div className="statistik-balken-fuellung" style={{ width: `${statistikProzent}%` }}></div>
            </div>
          </div>
          {letzterPR && (
            <div className="statistik-pr">
              <div className="statistik-pr-label">Neuer PR</div>
              <div className="statistik-pr-wert">
                <Trophy size={12} />
                {letzterPR.uebung} {letzterPR.gewicht}kg
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verlauf-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Verlauf</span>
          <button className="vorschau-link" onClick={() => setUnteransicht('verlauf')}>
            Alle anzeigen
          </button>
        </div>

        {verlaufEintraege.length === 0 && (
          <div className="vorschau-leer">Noch keine abgeschlossene Einheit</div>
        )}

        {verlaufEintraege.map(eintrag => (
          <div key={eintrag.id} className="verlauf-vorschau-zeile">
            <div className="verlauf-vorschau-check">✓</div>
            {eintrag.typ === 'gym'
              ? <Dumbbell size={14} className="verlauf-vorschau-icon" />
              : <Footprints size={14} className="verlauf-vorschau-icon" />}
            <div className="verlauf-vorschau-info">
              <span className="verlauf-vorschau-titel">{eintrag.titel}</span>
              <span className="verlauf-vorschau-datum">{eintrag.untertitel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dezenter Link zum freien Training (Laufen/Radfahren) */}
      <button className="frei-link" onClick={() => setUnteransicht('frei')}>
        Freies Training (Laufen/Radfahren)
      </button>

    </div>
  )
}

export default Training