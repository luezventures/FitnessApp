/* ============================================
   DASHBOARD.JSX — Die neue Start-Seite
   
   Ersetzt die reine Info-Seite als Hauptinhalt
   von "Start". Zeigt den heutigen/wöchentlichen
   Stand aus ALLEN Bereichen der App auf einen
   Blick — genau das Layout aus dem Wireframe.
   
   Zieht Daten aus: Sätzen, Läufen, Gewicht,
   Ernährung, Trainingsplan/Vorlagen. Nichts davon
   wird hier neu gespeichert — nur gelesen und
   zusammengerechnet.
   ============================================ */

import { Dumbbell, Footprints, Trophy, Flame } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Dashboard.css'

const STANDARD_WOCHENZIELE = { workouts: 5, laufkm: 20 }
const STANDARD_ERNAEHRUNGSZIELE = { kalorien: 3000, carbs: 350, protein: 180, fett: 90 }
const WOCHENTAG_NAMEN = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

function Dashboard({ zuTraining }) {

  /* ===== DATEN ===== */
  const [saetze] = useLocalStorage('fitnessapp_saetze', [])
  const [laeufe] = useLocalStorage('fitnessapp_laeufe', [])
  const [gewichtsEintraege] = useLocalStorage('fitnessapp_gewicht', [])
  const [ernaehrungsEintraege] = useLocalStorage('fitnessapp_ernaehrung', [])
  const [ernaehrungsZiele] = useLocalStorage('fitnessapp_ernaehrungsziele', STANDARD_ERNAEHRUNGSZIELE)
  const [wochenZiele] = useLocalStorage('fitnessapp_wochenziele', STANDARD_WOCHENZIELE)
  const [plan] = useLocalStorage('fitnessapp_trainingsplan', {})
  const [vorlagen] = useLocalStorage('fitnessapp_vorlagen', [])


  /* ===== DATUMS-HELFER ===== */
  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }
  const heute = alsDatumString(new Date())
  const heutigerWochentag = WOCHENTAG_NAMEN[new Date().getDay()]

  // Montag dieser Woche finden (gleiche Rechnung wie in Statistik.jsx)
  function montagDieserWoche() {
    const jetzt = new Date()
    const wochentag = jetzt.getDay()
    const tageZumMontag = wochentag === 0 ? 6 : wochentag - 1
    const montag = new Date(jetzt)
    montag.setDate(jetzt.getDate() - tageZumMontag)
    montag.setHours(0, 0, 0, 0)
    return montag
  }
  const montag = montagDieserWoche()
  const wochenTage = []
  for (let i = 0; i < 7; i++) {
    const tag = new Date(montag)
    tag.setDate(montag.getDate() + i)
    wochenTage.push(alsDatumString(tag))
  }


  /* ===== WORKOUT-KACHEL ===== */
  const saetzeDieseWoche = saetze.filter(s => wochenTage.includes(s.datum))
  const trainingsTage = new Set(saetzeDieseWoche.map(s => s.datum))
  const workoutsAnzahl = trainingsTage.size
  const workoutsProzent = Math.min(100, (workoutsAnzahl / wochenZiele.workouts) * 100)


  /* ===== GEWICHT-KACHEL ===== */
  const gewichtSortiert = [...gewichtsEintraege].sort((a, b) => b.datum.localeCompare(a.datum))
  const aktuellesGewicht = gewichtSortiert.length > 0 ? gewichtSortiert[0].gewicht : null

  // Ältester Eintrag DIESER Woche als Vergleichsbasis
  const gewichtDieseWoche = gewichtsEintraege
    .filter(e => wochenTage.includes(e.datum))
    .sort((a, b) => a.datum.localeCompare(b.datum))
  const gewichtVeraenderung = gewichtDieseWoche.length > 1
    ? (aktuellesGewicht - gewichtDieseWoche[0].gewicht)
    : null


  /* ===== KALORIEN-KACHEL ===== */
  const ernaehrungHeute = ernaehrungsEintraege.filter(e => e.datum === heute)
  const summeKalorien = ernaehrungHeute.reduce((s, e) => s + e.kalorien, 0)
  const summeProtein = ernaehrungHeute.reduce((s, e) => s + e.protein, 0)
  const summeCarbs = ernaehrungHeute.reduce((s, e) => s + e.carbs, 0)
  const summeFett = ernaehrungHeute.reduce((s, e) => s + e.fett, 0)
  const kalorienProzent = Math.min(100, (summeKalorien / ernaehrungsZiele.kalorien) * 100)


  /* ===== LAUFEN-KACHEL ===== */
  const laeufeDieseWoche = laeufe.filter(l => wochenTage.includes(l.datum))
  const laufKmDieseWoche = laeufeDieseWoche.reduce((s, l) => s + l.distanz, 0)
  const laufProzent = Math.min(100, (laufKmDieseWoche / wochenZiele.laufkm) * 100)


  /* ===== HEUTE-LISTE ===== */
  const zuweisung = plan[heutigerWochentag]
  const heutigeVorlage = zuweisung ? vorlagen.find(v => v.id === zuweisung) : null

  // Fortschritt der heutigen Vorlage: fertig, wenn alle Ziel-Sätze erreicht
  let vorlageFertig = false
  let vorlageMuskelgruppen = ''
  if (heutigeVorlage) {
    const zielGesamt = heutigeVorlage.uebungen.reduce((s, e) => s + e.zielSaetze, 0)
    const geloggtGesamt = heutigeVorlage.uebungen.reduce((s, e) => {
      return s + saetze.filter(satz => satz.datum === heute && satz.uebung === e.uebung).length
    }, 0)
    vorlageFertig = zielGesamt > 0 && geloggtGesamt >= zielGesamt
    vorlageMuskelgruppen = [...new Set(heutigeVorlage.uebungen.map(e => e.gruppe))].join(', ')
  }

  const heutigeLaeufe = laeufe.filter(l => l.datum === heute)

  function formatiereUhrzeit(zeitstempel) {
    return new Date(zeitstempel).toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit',
    })
  }

  const hatHeuteEintraege = heutigeVorlage || heutigeLaeufe.length > 0


  /* ===== STREAK =====
     Zähl Tage in Folge (rückwärts von heute), an denen
     mindestens ein Satz ODER Lauf geloggt wurde. */
  function hatAktivitaetAn(datumString) {
    return saetze.some(s => s.datum === datumString) || laeufe.some(l => l.datum === datumString)
  }

  function berechneStreak() {
    let tag = new Date()
    let anzahl = 0

    // Falls heute noch nichts geloggt ist, brechen wir den Streak
    // deswegen noch NICHT — wir fangen einfach bei gestern an zu zählen.
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


  /* ===== LETZTER PR =====
     Ein Satz ist ein PR, wenn sein Gewicht höher ist
     als alle vorherigen Sätze DERSELBEN Übung. */
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
            letzterPR = { uebung: uebungName, gewicht: satz.gewicht, zeitstempel: satz.zeitstempel }
          }
        }
      }
    }
    return letzterPR
  }
  const letzterPR = findeLetztenPR()

  function tageSeitPR(zeitstempel) {
    const diffMs = Date.now() - zeitstempel
    const tage = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (tage === 0) return 'heute'
    if (tage === 1) return 'vor 1 Tag'
    return `vor ${tage} Tagen`
  }


  /* ===== ANZEIGE ===== */

  return (
    <div className="dashboard">

      {/* === 2x2 KACHELN === */}
      <div className="stat-grid">

        <div className="stat-kachel tiefe-blau">
          <div className="stat-label">Workout</div>
          <div className="stat-wert">
            {workoutsAnzahl}<span className="stat-ziel">/{wochenZiele.workouts}</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung blau" style={{ width: `${workoutsProzent}%` }}></div>
          </div>
        </div>

        <div className="stat-kachel tiefe-blau">
          <div className="stat-label">Gewicht</div>
          <div className="stat-wert gruen">
            {aktuellesGewicht ?? '–'}<span className="stat-ziel-klein">kg</span>
          </div>
          {gewichtVeraenderung !== null ? (
            <div className="stat-sub gruen">
              {gewichtVeraenderung > 0 ? '+' : ''}{gewichtVeraenderung.toFixed(1)} diese Woche
            </div>
          ) : (
            <div className="stat-balken">
              <div className="stat-balken-fuellung gruen" style={{ width: '0%' }}></div>
            </div>
          )}
        </div>

        <div className="stat-kachel tiefe-blau">
          <div className="stat-label">Kalorien</div>
          <div className="stat-wert amber">
            {Math.round(summeKalorien)}<span className="stat-ziel">/{ernaehrungsZiele.kalorien}</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung amber" style={{ width: `${kalorienProzent}%` }}></div>
          </div>
        </div>

        <div className="stat-kachel tiefe-blau">
          <div className="stat-label">Laufen</div>
          <div className="stat-wert">
            {laufKmDieseWoche.toFixed(1)}<span className="stat-ziel-klein">km</span>
          </div>
          <div className="stat-balken">
            <div className="stat-balken-fuellung blau" style={{ width: `${laufProzent}%` }}></div>
          </div>
        </div>

      </div>


      {/* === HEUTE === */}
      <div className="heute-abschnitt">
        <div className="heute-kopf">
          <span className="heute-titel">Heute</span>
        </div>

        {!hatHeuteEintraege && (
          <div className="heute-leer">Nichts geloggt oder geplant für heute</div>
        )}

        {heutigeVorlage && (
          <div className="heute-zeile">
            <div className="heute-icon"><Dumbbell size={18} /></div>
            <div className="heute-info">
              <span className="heute-name">{heutigeVorlage.name}</span>
              <span className="heute-detail">{vorlageMuskelgruppen}</span>
            </div>
            {vorlageFertig && <span className="heute-check">✓</span>}
          </div>
        )}

        {heutigeLaeufe.map(lauf => (
          <div key={lauf.id} className="heute-zeile">
            <div className="heute-icon"><Footprints size={18} /></div>
            <div className="heute-info">
              <span className="heute-name">{lauf.laufart}</span>
              <span className="heute-detail">
                {lauf.distanz.toString().replace('.', ',')} km
              </span>
            </div>
            <span className="heute-zeit">{formatiereUhrzeit(lauf.zeitstempel)}</span>
          </div>
        ))}

        {heutigeVorlage && !vorlageFertig && (
          <button className="training-starten-btn" onClick={zuTraining}>
            Training starten
          </button>
        )}
      </div>


      {/* === STREAK / PR === */}
      {(streak > 0 || letzterPR) && (
        <div className="motivation-karte">
          {streak > 0 && (
            <div className="streak-zeile">
              <Flame size={16} className="streak-icon" />
              <span>{streak} {streak === 1 ? 'Tag' : 'Tage'} Streak — mach weiter!</span>
            </div>
          )}
          {letzterPR && (
            <div className="pr-zeile">
              <Trophy size={13} className="pr-icon" />
              Letzter PR: {letzterPR.uebung} {letzterPR.gewicht}kg {tageSeitPR(letzterPR.zeitstempel)}
            </div>
          )}
        </div>
      )}


      {/* === MAKRO-MINI-REIHE === */}
      <div className="makro-reihe">
        <div className="makro-mini">
          <span className="makro-mini-wert protein">{Math.round(summeProtein)}g</span>
          <span className="makro-mini-label">Protein</span>
        </div>
        <div className="makro-mini">
          <span className="makro-mini-wert carbs">{Math.round(summeCarbs)}g</span>
          <span className="makro-mini-label">Carbs</span>
        </div>
        <div className="makro-mini">
          <span className="makro-mini-wert fett">{Math.round(summeFett)}g</span>
          <span className="makro-mini-label">Fett</span>
        </div>
      </div>

    </div>
  )
}

export default Dashboard