/* ============================================
   FOTOS.JSX — Fortschrittsfotos
   
   NEUES WERKZEUG: die Canvas-API zum Verkleinern
   von Bildern, bevor sie gespeichert werden.
   
   Warum das nötig ist: localStorage hat nur ca.
   5-10 MB Platz für die GESAMTE App. Ein normales
   Handyfoto direkt zu speichern wäre oft schon
   3-5 MB groß — nach zwei, drei Fotos wäre der
   Speicher voll.
   
   Der Trick: Bevor ein Bild gespeichert wird,
   zeichnen wir es auf eine <canvas> in kleinerer
   Auflösung (max. 800px Breite) und exportieren
   es als komprimiertes JPEG. Aus 4 MB werden so
   oft nur 50-150 KB — dadurch passen viele Fotos
   in den verfügbaren Platz.
   ============================================ */

import { useState, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './Fotos.css'

function Fotos() {

  const [fotos, setFotos] = useLocalStorage('fitnessapp_fotos', [])
  const dateiInputRef = useRef(null)

  function alsDatumString(date) {
    const jahr = date.getFullYear()
    const monat = (date.getMonth() + 1).toString().padStart(2, '0')
    const tag = date.getDate().toString().padStart(2, '0')
    return `${jahr}-${monat}-${tag}`
  }

  /* ===== BILD VERKLEINERN =====
     Nimmt eine hochgeladene Datei, zeichnet sie
     verkleinert auf eine Canvas, gibt ein
     komprimiertes JPEG als Text (Data-URL) zurück. */
  function verkleinereBild(datei) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        const bild = new Image()

        bild.onload = () => {
          const maxBreite = 800

          // Verhältnis beibehalten: ist das Bild breiter als
          // maxBreite, wird es proportional verkleinert.
          const skalierung = Math.min(1, maxBreite / bild.width)
          const zielBreite = bild.width * skalierung
          const zielHoehe = bild.height * skalierung

          const canvas = document.createElement('canvas')
          canvas.width = zielBreite
          canvas.height = zielHoehe

          const ctx = canvas.getContext('2d')
          ctx.drawImage(bild, 0, 0, zielBreite, zielHoehe)

          // 0.7 = 70% JPEG-Qualität — guter Kompromiss
          // zwischen Dateigröße und Bildqualität
          const komprimiert = canvas.toDataURL('image/jpeg', 0.7)
          resolve(komprimiert)
        }

        bild.onerror = reject
        bild.src = event.target.result
      }

      reader.onerror = reject
      reader.readAsDataURL(datei)
    })
  }

  async function dateiAusgewaehlt(event) {
    const datei = event.target.files[0]
    if (!datei) return

    try {
      const komprimiertesBild = await verkleinereBild(datei)

      const neuesFoto = {
        id: Date.now(),
        bild: komprimiertesBild,
        datum: alsDatumString(new Date()),
      }

      setFotos([neuesFoto, ...fotos])
    } catch (fehler) {
      alert('Foto konnte nicht verarbeitet werden.')
      console.error(fehler)
    }

    // Zurücksetzen, damit dasselbe Bild nochmal gewählt werden kann
    event.target.value = ''
  }

  function loescheFoto(id) {
    if (!confirm('Foto löschen?')) return
    setFotos(fotos.filter(f => f.id !== id))
  }

  function formatiereDatum(datumString) {
    const [jahr, monat, tag] = datumString.split('-')
    const date = new Date(Number(jahr), Number(monat) - 1, Number(tag))
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="fotos">

      <input
        type="file"
        accept="image/*"
        ref={dateiInputRef}
        onChange={dateiAusgewaehlt}
        style={{ display: 'none' }}
      />

      <button className="foto-hinzufuegen-btn" onClick={() => dateiInputRef.current.click()}>
        <Plus size={18} />
        Foto hinzufügen
      </button>

      {fotos.length === 0 && (
        <div className="leer-zustand">
          <div className="leer-text">Noch kein Foto gespeichert</div>
          <div className="leer-untertext">
            Fotos werden automatisch verkleinert, damit viele reinpassen
          </div>
        </div>
      )}

      <div className="fotos-grid">
        {fotos.map(foto => (
          <div key={foto.id} className="foto-kachel">
            <img src={foto.bild} alt={`Fortschrittsfoto vom ${formatiereDatum(foto.datum)}`} />
            <div className="foto-datum">{formatiereDatum(foto.datum)}</div>
            <button
              className="foto-loeschen"
              onClick={() => loescheFoto(foto.id)}
              aria-label="Foto löschen"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Fotos