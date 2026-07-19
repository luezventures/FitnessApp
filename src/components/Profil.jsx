/* ============================================
   PROFIL.JSX — komplett neu strukturiert
   
   Gewicht, Fortschrittsfotos und Ziele & Erfolge
   sind jetzt eigene Vorschau-Blöcke (wie bei
   Training/Ernährung), nicht mehr Teil der
   schlichten Link-Liste. Übrig in der Liste:
   Erinnerungen, Einstellungen, Datenschutz,
   Impressum.
   
   NEU: Profil-Kopf mit Name + "Seit wann dabei".
   Das Datum wird beim allerersten App-Start
   automatisch gesetzt.
   ============================================ */

import { useState, useEffect } from 'react'
import {
  Bell, Settings, Shield, FileText, ChevronRight, ArrowLeft, Flame, Trophy,
} from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Gewichtlogger from './Gewichtlogger'
import Fotos from './Fotos'
import ZieleErfolge from './ZieleErfolge'
import Einstellungen from './Einstellungen'
import Platzhalter from './Platzhalter'
import './Profil.css'

const MENU_PUNKTE = [
  { id: 'erinnerungen', label: 'Erinnerungen', icon: Bell },
  { id: 'einstellungen', label: 'Einstellungen', icon: Settings },
  { id: 'datenschutz', label: 'Datenschutz', icon: Shield },
  { id: 'impressum', label: 'Impressum', icon: FileText },
]

function Profil() {

  const [offenerBereich, setOffenerBereich] = useState(null)

  const [profil, setProfil] = useLocalStorage('fitnessapp_profil', null)
  const [gewichtsEintraege] = useLocalStorage('fitnessapp_gewicht', [])
  const [saetze] = useLocalStorage('fitnessapp_saetze', [])
  const [laeufe] = useLocalStorage('fitnessapp_laeufe', [])
  const [fotos] = useLocalStorage('fitnessapp_fotos', [])

  // Beim allerersten Start: Profil mit heutigem Datum anlegen.
  // Das gehört in einen useEffect, nicht direkt in den Render-
  // Körper — sonst würde React beim Rendern selbst schon den
  // State ändern, was zu unsauberem Verhalten führen kann.
  useEffect(() => {
    if (!profil) {
      const heute = new Date().toISOString().split('T')[0]
      setProfil({ name: 'Du', seitDatum: heute })
    }
  }, [profil])

  const [nameBearbeiten, setNameBearbeiten] = useState(false)
  const [neuerName, setNeuerName] = useState(profil?.name || 'Du')

  function speichereName() {
    setProfil({ ...profil, name: neuerName.trim() || 'Du' })
    setNameBearbeiten(false)
  }

  function formatiereSeitDatum(datumString) {
    if (!datumString) return ''
    const date = new Date(datumString)
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
  }


  /* ===== GEWICHT-VORSCHAU ===== */
  const gewichtSortiert = [...gewichtsEintraege].sort((a, b) => b.datum.localeCompare(a.datum))
  const aktuellesGewicht = gewichtSortiert.length > 0 ? gewichtSortiert[0].gewicht : null

  function montagDieserWoche() {
    const jetzt = new Date()
    const wochentag = jetzt.getDay()
    const tageZumMontag = wochentag === 0 ? 6 : wochentag - 1
    const montag = new Date(jetzt)
    montag.setDate(jetzt.getDate() - tageZumMontag)
    montag.setHours(0, 0, 0, 0)
    return montag
  }
  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }
  const montag = montagDieserWoche()
  const wochenTage = []
  for (let i = 0; i < 7; i++) {
    const tag = new Date(montag)
    tag.setDate(montag.getDate() + i)
    wochenTage.push(alsDatumString(tag))
  }
  const gewichtDieseWoche = gewichtsEintraege
    .filter(e => wochenTage.includes(e.datum))
    .sort((a, b) => a.datum.localeCompare(b.datum))
  const gewichtVeraenderung = gewichtDieseWoche.length > 1
    ? (aktuellesGewicht - gewichtDieseWoche[0].gewicht)
    : null


  /* ===== ZIELE & ERFOLGE VORSCHAU ===== */
  function hatAktivitaetAn(datumString) {
    return saetze.some(s => s.datum === datumString) || laeufe.some(l => l.datum === datumString)
  }
  function berechneStreak() {
    let tag = new Date()
    let anzahl = 0
    if (!hatAktivitaetAn(alsDatumString(tag))) tag.setDate(tag.getDate() - 1)
    while (hatAktivitaetAn(alsDatumString(tag))) {
      anzahl++
      tag.setDate(tag.getDate() - 1)
    }
    return anzahl
  }
  const streak = berechneStreak()

  function zaehlePRsDiesenMonat() {
    const nachUebung = {}
    for (const satz of saetze) {
      if (!nachUebung[satz.uebung]) nachUebung[satz.uebung] = []
      nachUebung[satz.uebung].push(satz)
    }
    let anzahl = 0
    const jetzt = new Date()
    for (const uebungName of Object.keys(nachUebung)) {
      const sortiert = [...nachUebung[uebungName]].sort((a, b) => a.zeitstempel - b.zeitstempel)
      let maxGewicht = 0
      for (const satz of sortiert) {
        if (satz.gewicht > maxGewicht) {
          maxGewicht = satz.gewicht
          const datum = new Date(satz.zeitstempel)
          if (datum.getMonth() === jetzt.getMonth() && datum.getFullYear() === jetzt.getFullYear()) {
            anzahl++
          }
        }
      }
    }
    return anzahl
  }
  const prsDiesenMonat = zaehlePRsDiesenMonat()


  /* ===== UNTERANSICHTEN ===== */
  if (offenerBereich) {
    const titel = {
      gewicht: 'Gewicht',
      fotos: 'Fortschrittsfotos',
      ziele: 'Ziele & Erfolge',
      einstellungen: 'Einstellungen',
    }[offenerBereich] || MENU_PUNKTE.find(p => p.id === offenerBereich)?.label

    if (offenerBereich === 'einstellungen') {
      return (
        <div className="profil">
          <Einstellungen onZurueck={() => setOffenerBereich(null)} />
        </div>
      )
    }

    return (
      <div className="profil">
        <button className="zurueck-btn" onClick={() => setOffenerBereich(null)}>
          <ArrowLeft size={16} />
          {titel}
        </button>

        {offenerBereich === 'gewicht' && <Gewichtlogger />}
        {offenerBereich === 'fotos' && <Fotos />}
        {offenerBereich === 'ziele' && <ZieleErfolge />}
        {['erinnerungen', 'datenschutz', 'impressum'].includes(offenerBereich) && (
          <Platzhalter titel={titel} text="Dieser Bereich ist noch nicht gebaut." />
        )}
      </div>
    )
  }


  /* ===== HAUPTÜBERSICHT ===== */
  return (
    <div className="profil">

      {/* Profil-Kopf */}
      <div className="profil-kopf">
        <div className="avatar">{profil?.name?.charAt(0).toUpperCase() || 'D'}</div>
        <div className="profil-kopf-info">
          {nameBearbeiten ? (
            <div className="name-bearbeiten">
              <input
                type="text"
                value={neuerName}
                onChange={(e) => setNeuerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && speichereName()}
                autoFocus
              />
              <button onClick={speichereName}>Fertig</button>
            </div>
          ) : (
            <span className="profil-name" onClick={() => setNameBearbeiten(true)}>
              {profil?.name || 'Du'}
            </span>
          )}
          <span className="profil-seit">Seit {formatiereSeitDatum(profil?.seitDatum)} dabei</span>
        </div>
      </div>

      {/* Gewicht-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Gewicht</span>
          <button className="vorschau-link" onClick={() => setOffenerBereich('gewicht')}>
            Verlauf ansehen
          </button>
        </div>
        <div className="gewicht-wert">
          {aktuellesGewicht ?? '–'} <span className="gewicht-einheit">kg</span>
        </div>
        {gewichtVeraenderung !== null && (
          <div className="gewicht-veraenderung">
            {gewichtVeraenderung > 0 ? '+' : ''}{gewichtVeraenderung.toFixed(1)} diese Woche
          </div>
        )}
        <button className="gewicht-eintragen-btn" onClick={() => setOffenerBereich('gewicht')}>
          Gewicht eintragen
        </button>
      </div>

      {/* Fortschrittsfotos-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Fortschrittsfotos</span>
          <button className="vorschau-link" onClick={() => setOffenerBereich('fotos')}>
            Alle anzeigen
          </button>
        </div>
        <div className="fotos-vorschau-reihe">
          {fotos.slice(0, 2).map(foto => (
            <div key={foto.id} className="foto-vorschau-kachel">
              <img src={foto.bild} alt="Fortschrittsfoto" />
            </div>
          ))}
          {Array.from({ length: Math.max(0, 2 - fotos.length) }).map((_, i) => (
            <div key={`leer-${i}`} className="foto-vorschau-kachel leer"></div>
          ))}
          <button
            className="foto-vorschau-kachel plus"
            onClick={() => setOffenerBereich('fotos')}
            aria-label="Foto hinzufügen"
          >
            +
          </button>
        </div>
      </div>

      {/* Ziele & Erfolge-Vorschau */}
      <div className="vorschau-block">
        <div className="vorschau-kopf">
          <span className="vorschau-titel">Ziele &amp; Erfolge</span>
          <button className="vorschau-link" onClick={() => setOffenerBereich('ziele')}>
            Alle anzeigen
          </button>
        </div>
        <div className="erfolge-reihe">
          <div className="erfolge-punkt">
            <Flame size={16} className="erfolge-punkt-icon" />
            {streak} Tage Streak
          </div>
          <div className="erfolge-punkt">
            <Trophy size={16} className="erfolge-punkt-icon" />
            {prsDiesenMonat} {prsDiesenMonat === 1 ? 'PR' : 'PRs'} diesen Monat
          </div>
        </div>
      </div>

      {/* Schlichte Menü-Liste */}
      <div className="menu-liste">
        {MENU_PUNKTE.map(punkt => {
          const Icon = punkt.icon
          return (
            <button
              key={punkt.id}
              className="menu-zeile"
              onClick={() => setOffenerBereich(punkt.id)}
            >
              <span className="menu-icon"><Icon size={18} /></span>
              <span className="menu-label">{punkt.label}</span>
              <ChevronRight size={16} className="menu-pfeil" />
            </button>
          )
        })}
      </div>

    </div>
  )
}

export default Profil