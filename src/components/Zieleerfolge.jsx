/* ============================================
   ZIELEERFOLGE.JSX
   
   Volle Ansicht: aktuelle Streak, längste Streak
   je, persönliche Bestleistungen pro Übung, und
   die chronologische PR-Historie.
   ============================================ */

import { Flame, Trophy } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './ZieleErfolge.css'

function ZieleErfolge() {

  const [saetze] = useLocalStorage('fitnessapp_saetze', [])
  const [laeufe] = useLocalStorage('fitnessapp_laeufe', [])

  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }

  function hatAktivitaetAn(datumString) {
    return saetze.some(s => s.datum === datumString) || laeufe.some(l => l.datum === datumString)
  }

  function berechneStreak() {
    let tag = new Date()
    let anzahl = 0
    if (!hatAktivitaetAn(alsDatumString(tag))) {
      tag.setDate(tag.getDate() - 1)
    }
    while (hatAktivitaetAn(alsDatumString(tag))) {
      anzahl++
      tag.setDate(tag.getDate() - 1)
    }
    return anzahl
  }
  const streak = berechneStreak()

  /* ===== LÄNGSTE STREAK JE =====
     Alle Tage mit Aktivität sammeln, sortieren,
     und die längste Folge aufeinanderfolgender
     Tage finden — nicht nur die aktuelle. */
  function berechneLaengsteStreak() {
    const alleDaten = new Set([
      ...saetze.map(s => s.datum),
      ...laeufe.map(l => l.datum),
    ])
    const sortiert = [...alleDaten].sort()

    let laengste = 0
    let aktuelleLaenge = 0
    let laengsteEndeDatum = null
    let vorherigesDatum = null

    for (const datumString of sortiert) {
      if (vorherigesDatum) {
        const vorher = new Date(vorherigesDatum)
        vorher.setDate(vorher.getDate() + 1)
        const istAufeinanderfolgend = alsDatumString(vorher) === datumString

        aktuelleLaenge = istAufeinanderfolgend ? aktuelleLaenge + 1 : 1
      } else {
        aktuelleLaenge = 1
      }

      if (aktuelleLaenge > laengste) {
        laengste = aktuelleLaenge
        laengsteEndeDatum = datumString
      }
      vorherigesDatum = datumString
    }

    return { laenge: laengste, endeDatum: laengsteEndeDatum }
  }
  const laengsteStreak = berechneLaengsteStreak()

  function formatiereMonatJahr(datumString) {
    if (!datumString) return ''
    const [jahr, monat] = datumString.split('-')
    const date = new Date(Number(jahr), Number(monat) - 1, 1)
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  }

  /* ===== PERSÖNLICHE BESTLEISTUNGEN =====
     Pro Übung: der Satz mit dem höchsten Gewicht
     jemals — nicht die PR-Historie, sondern der
     aktuelle Bestwert. */
  function berechneBestleistungen() {
    const nachUebung = {}
    for (const satz of saetze) {
      if (!nachUebung[satz.uebung]) nachUebung[satz.uebung] = []
      nachUebung[satz.uebung].push(satz)
    }

    const bestleistungen = []
    for (const uebungName of Object.keys(nachUebung)) {
      const bester = nachUebung[uebungName].reduce((max, satz) =>
        satz.gewicht > max.gewicht ? satz : max
      )
      bestleistungen.push({ uebung: uebungName, gewicht: bester.gewicht, wiederholungen: bester.wiederholungen })
    }
    return bestleistungen.sort((a, b) => b.gewicht - a.gewicht)
  }
  const bestleistungen = berechneBestleistungen()

  /* ===== ALLE PRs (chronologische Historie) ===== */
  function findeAllePRs() {
    const nachUebung = {}
    for (const satz of saetze) {
      if (!nachUebung[satz.uebung]) nachUebung[satz.uebung] = []
      nachUebung[satz.uebung].push(satz)
    }
    const prListe = []
    for (const uebungName of Object.keys(nachUebung)) {
      const sortiert = [...nachUebung[uebungName]].sort((a, b) => a.zeitstempel - b.zeitstempel)
      let maxGewicht = 0
      for (const satz of sortiert) {
        if (satz.gewicht > maxGewicht) {
          maxGewicht = satz.gewicht
          prListe.push({ uebung: uebungName, gewicht: satz.gewicht, zeitstempel: satz.zeitstempel })
        }
      }
    }
    return prListe.sort((a, b) => b.zeitstempel - a.zeitstempel)
  }
  const allePRs = findeAllePRs()

  function formatiereDatum(zeitstempel) {
    return new Date(zeitstempel).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  }

  const jetzt = new Date()
  const prsDiesenMonat = allePRs.filter(pr => {
    const datum = new Date(pr.zeitstempel)
    return datum.getMonth() === jetzt.getMonth() && datum.getFullYear() === jetzt.getFullYear()
  })

  return (
    <div className="ziele-erfolge">

      <div className="erfolge-kopf">
        <div className="erfolge-kachel">
          <Flame size={20} className="erfolge-icon warning" />
          <div className="erfolge-wert">{streak}</div>
          <div className="erfolge-label">Aktuelle Streak</div>
        </div>
        <div className="erfolge-kachel">
          <Trophy size={20} className="erfolge-icon warning" />
          <div className="erfolge-wert">{laengsteStreak.laenge}</div>
          <div className="erfolge-label">
            Längste Streak{laengsteStreak.endeDatum && ` (${formatiereMonatJahr(laengsteStreak.endeDatum)})`}
          </div>
        </div>
      </div>

      <div className="section-label">Persönliche Bestleistungen</div>
      {bestleistungen.length === 0 && (
        <div className="leer-zustand">Noch keine geloggten Sätze</div>
      )}
      <div className="best-liste">
        {bestleistungen.map((best, index) => (
          <div key={index} className="best-zeile">
            <span className="best-name">{best.uebung}</span>
            <span className="best-wert">{best.gewicht}kg × {best.wiederholungen}</span>
          </div>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: '24px' }}>
        PR-Historie {prsDiesenMonat.length > 0 && `— ${prsDiesenMonat.length} diesen Monat`}
      </div>
      {allePRs.length === 0 && (
        <div className="leer-zustand">Noch kein PR — leg los!</div>
      )}
      <div className="pr-liste">
        {allePRs.map((pr, index) => (
          <div key={index} className="pr-zeile">
            <Trophy size={14} className="pr-zeile-icon" />
            <div className="pr-zeile-info">
              <span className="pr-zeile-name">{pr.uebung}</span>
              <span className="pr-zeile-gewicht">{pr.gewicht} kg</span>
            </div>
            <span className="pr-zeile-datum">{formatiereDatum(pr.zeitstempel)}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default ZieleErfolge