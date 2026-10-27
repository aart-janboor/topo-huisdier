# Topo-huisdier (de app)

Een kleine, gamified PWA waarmee je kind de topografie van **West-Nederland**
oefent en tegelijk haar **beerdiertje** verzorgt. Zie het concept en het
technische plan in [`../voorstellen/topo-huisdier/`](../voorstellen/topo-huisdier/).

## Spelen

- **Online (GitHub Pages):** zodra Pages aanstaat → `https://aart-janboor.github.io/TopoApp/`
  Op de tablet in de browser openen en via het menu **"Zet op beginscherm"**
  installeren; daarna werkt 'ie offline, als een echt app-icoon.
- **Lokaal:** dubbelklik `index.html`. (De service-worker/offline-cache werkt
  alleen via http/https, niet via `file://`, maar het spel zelf werkt gewoon.)

## Wat zit erin

- Kaart altijd in beeld, multiple choice ("Welke plaats is 19?" en "Waar ligt …?").
- Start met 5 begrippen; breidt vanzelf uit zodra ze gekend zijn, met een speels
  introkaartje + weetje per nieuw begrip.
- Slim herhalen (Leitner/spaced repetition), muntjes, winkel (eten/kleren/deco),
  stickeralbum, badges, dagelijkse reeks en confetti.
- Alles lokaal op het apparaat: geen account, geen internet, geen reclame.

## De leer-data

De koppeling naam ↔ teken komt uit het **nagekeken** werkblad `Kaart_0002.jpg`
en staat in [`js/data.js`](js/data.js). De sleutel is intern volledig consistent
(steden 1–26, wateren I–X, gebieden A–G; elk teken precies één keer).

Twee tekens zijn verrassend maar zo op het blad ingevuld — even dubbelchecken:
**Utrecht = 3** en **Noordwijk = 11**. Aanpassen kan zonder code, in de app via
**Voor ouders → Kaart instellen**.

## Structuur

```
docs/
  index.html            app-shell
  manifest.webmanifest  PWA-manifest (installeerbaar)
  sw.js                 service worker (offline)
  css/style.css
  js/data.js            leerstof + winkel  (de "waarheid")
  js/app.js             spel-logica + schermen
  assets/kaart.jpg      Kaart_0001 (altijd in beeld)
  assets/icon-*.png     app-iconen
```

Handig tijdens testen: `?screen=oefenen|winkel|album|ouders` achter de URL.
