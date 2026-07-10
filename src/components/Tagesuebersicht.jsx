/* ============================================
   TAGESUEBERSICHT.JSX
   
   NEUES KONZEPT: Props
   
   Diese Komponente hat KEINEN eigenen State.
   Sie bekommt die Sätze von außen übergeben —
   als "props" (properties).
   
   function Tagesuebersicht({ saetze }) {...}
   
   Der geschweifte Klammer-Kram ist "destructuring":
   holt "saetze" aus dem props-Objekt raus.
   
   Solche Komponenten nennt man "dumb" oder
   "presentational" — sie zeigen nur an, sie
   verwalten nichts. Das ist gut: sie sind
   leicht zu verstehen und wiederverwendbar.
   ============================================ */

import './Tagesuebersicht.css'

function Tagesuebersicht({ saetze }) {

  // Wenn heute nichts geloggt wurde, zeig nichts an.
  // "return null" heißt: rendere gar nichts.
  if (saetze.length === 0) {
    return null
  }

  /* ===== DATEN GRUPPIEREN =====
     Wir haben eine flache Liste von Sätzen.
     Wir wollen sie nach Übung gruppieren.
     
     reduce() geht durch die Liste und baut
     Schritt für Schritt ein Ergebnis auf.
     
     Aus:  [{uebung:"Bank",...}, {uebung:"Bank",...}, {uebung:"Latzug",...}]
     Wird: { "Bank": [satz1, satz2], "Latzug": [satz3] }
  */
  const nachUebung = saetze.reduce((gruppen, satz) => {
    // Gibt's die Übung schon als Schlüssel? Wenn nein, leere Liste anlegen.
    if (!gruppen[satz.uebung]) {
      gruppen[satz.uebung] = []
    }
    gruppen[satz.uebung].push(satz)
    return gruppen
  }, {})  // {} ist der Startwert: ein leeres Objekt

  /* ===== VOLUMEN BERECHNEN =====
     Volumen = Gewicht × Wiederholungen, summiert.
     Das ist die Zahl, an der man Fortschritt sieht.
  */
  function volumen(satzListe) {
    return satzListe.reduce(
      (summe, satz) => summe + satz.gewicht * satz.wiederholungen,
      0  // Startwert der Summe
    )
  }

  // Gesamtvolumen aller Sätze heute
  const gesamtVolumen = volumen(saetze)

  // Zahlen mit Tausenderpunkt formatieren: 12450 → "12.450"
  function formatiere(zahl) {
    return Math.round(zahl).toLocaleString('de-DE')
  }

  // RPE-Farbe, gleiche Logik wie im SatzLogger
  function rpeFarbe(wert) {
    if (wert >= 9) return 'var(--danger)'
    if (wert >= 8) return 'var(--warning)'
    return 'var(--accent)'
  }

  // Object.entries() macht aus dem Objekt eine Liste von Paaren:
  // { "Bank": [...] } → [ ["Bank", [...]] ]
  const uebungsListe = Object.entries(nachUebung)


  return (
    <div className="uebersicht">

      {/* Kopfzeile mit Gesamtzahlen */}
      <div className="uebersicht-kopf">
        <div className="uebersicht-titel">Heutiges Training</div>
        <div className="uebersicht-stats">
          <span className="stat-zahl">{saetze.length}</span>
          <span className="stat-label">
            {saetze.length === 1 ? 'Satz' : 'Sätze'}
          </span>
          <span className="stat-trenner">·</span>
          <span className="stat-zahl">{formatiere(gesamtVolumen)}</span>
          <span className="stat-label">kg Volumen</span>
        </div>
      </div>

      {/* Pro Übung ein Block */}
      <div className="uebersicht-liste">
        {uebungsListe.map(([uebungName, uebungSaetze]) => (
          <div key={uebungName} className="uebersicht-uebung">

            <div className="uebung-kopf">
              <span className="uebung-name">{uebungName}</span>
              <span className="uebung-volumen">
                {formatiere(volumen(uebungSaetze))} kg
              </span>
            </div>

            {/* Die einzelnen Sätze als kompakte Zeilen.
                slice().reverse() dreht die Reihenfolge um,
                damit Satz 1 oben steht.
                slice() macht vorher eine Kopie — sonst würden
                wir die Originalliste verändern. */}
            <div className="uebung-saetze">
              {uebungSaetze.slice().reverse().map((satz, i) => (
                <div key={satz.id} className="mini-satz">
                  <span className="mini-nummer">{i + 1}</span>
                  <span className="mini-werte">
                    {satz.gewicht} × {satz.wiederholungen}
                  </span>
                  <span
                    className="mini-rpe"
                    style={{ color: rpeFarbe(satz.rpe) }}
                  >
                    {satz.rpe}
                  </span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default Tagesuebersicht