/* KOPIE van ../../js/data.js (zodat deze provincie-app offline los werkt). Bij
 * wijziging van labels/coords: kopieer ../../js/data.js opnieuw hierheen. Deze
 * app gebruikt alleen items/coords/regios; pet/shop/scenes negeert 'ie. */
/* Topo-huisdier — leer- en speeldata
 *
 * BRON VAN WAARHEID: het nagekeken werkblad Kaart_0002.jpg (gecontroleerd met
 * de docent). De koppeling naam -> teken komt daar vandaan.
 *   - cijfer 1..26  -> steden
 *   - Romeins I..X  -> wateren
 *   - letter  A..G  -> gebieden
 * De sleutel is intern volledig consistent (elk teken komt precies 1x voor),
 * wat bevestigt dat 'ie klopt. Zaanstad is op het werkblad doorgestreept en
 * heeft dus geen teken (label leeg) -> doet niet mee in de quiz.
 *
 * Twijfel? Pas labels aan in de app via "Voor ouders > Kaart instellen".
 */
window.TOPO_DATA = {

  pet: { soort: "pinguin", standaardNaam: "Pingu" },

  regios: {
    "zuid-holland": "Zuid-Holland",
    "noord-holland": "Noord-Holland",
    "utrecht": "Utrecht",
    "zeeland": "Zeeland",
    "water": "Wateren",
    "gebied": "Gebieden"
  },

  // Volgorde = leerroute. Starterset vooraan; daarna breidt het uit.
  items: [
    // ---- Starterset (bekende grote plaatsen) ----
    { id: "rotterdam",  naam: "Rotterdam",  categorie: "stad", regio: "zuid-holland",  label: "19", weetje: "Grootste haven van Europa 🚢" },
    { id: "den-haag",   naam: "Den Haag",   categorie: "stad", regio: "zuid-holland",  label: "2",  weetje: "Regeringsstad: hier werken de regering en de koning 👑" },
    { id: "leiden",     naam: "Leiden",     categorie: "stad", regio: "zuid-holland",  label: "12", weetje: "Studentenstad met de oudste universiteit van Nederland 🎓" },
    { id: "utrecht",    naam: "Utrecht",    categorie: "stad", regio: "utrecht",       label: "3",  weetje: "Stad met de hoge Domtoren 🗼" },
    { id: "amsterdam",  naam: "Amsterdam",  categorie: "stad", regio: "noord-holland", label: "9",  weetje: "De hoofdstad van Nederland, met veel grachten 🚲" },

    // ---- Overige steden ----
    { id: "gouda",            naam: "Gouda",            categorie: "stad", regio: "zuid-holland",  label: "16", weetje: "Beroemd om kaas en stroopwafels 🧇" },
    { id: "schiedam",         naam: "Schiedam",         categorie: "stad", regio: "zuid-holland",  label: "18", weetje: "Bekend om jenever en de hoogste molens 🌬️" },
    { id: "hoek-van-holland", naam: "Hoek van Holland", categorie: "stad", regio: "zuid-holland",  label: "15", weetje: "Hier vertrekt de boot naar Engeland 🚢" },
    { id: "noordwijk",        naam: "Noordwijk",        categorie: "stad", regio: "zuid-holland",  label: "11", weetje: "Strandplaats met veel bloembollen 🌷" },

    { id: "amersfoort",       naam: "Amersfoort",       categorie: "stad", regio: "utrecht",       label: "14", weetje: "Stad met de Koppelpoort 🏰" },
    { id: "zeist",            naam: "Zeist",            categorie: "stad", regio: "utrecht",       label: "17", weetje: "Groene stad met veel bossen 🌲" },
    { id: "nieuwegein",       naam: "Nieuwegein",       categorie: "stad", regio: "utrecht",       label: "20", weetje: "Een nieuwe stad vlak bij Utrecht 🏙️" },

    { id: "alkmaar",          naam: "Alkmaar",          categorie: "stad", regio: "noord-holland", label: "6",  weetje: "Beroemd om zijn kaasmarkt 🧀" },
    { id: "den-helder",       naam: "Den Helder",       categorie: "stad", regio: "noord-holland", label: "5",  weetje: "Marinestad helemaal in het noorden ⚓" },
    { id: "den-burg",         naam: "Den Burg",         categorie: "stad", regio: "noord-holland", label: "4",  weetje: "Het hoofddorp van het eiland Texel 🐑" },
    { id: "hoorn",            naam: "Hoorn",            categorie: "stad", regio: "noord-holland", label: "7",  weetje: "Oude havenstad aan het Markermeer ⛵" },
    { id: "haarlem",          naam: "Haarlem",          categorie: "stad", regio: "noord-holland", label: "1",  weetje: "De hoofdstad van Noord-Holland 🌷" },
    { id: "amstelveen",       naam: "Amstelveen",       categorie: "stad", regio: "noord-holland", label: "10", weetje: "Ligt vlak onder Amsterdam 🌳" },
    { id: "volendam",         naam: "Volendam",         categorie: "stad", regio: "noord-holland", label: "8",  weetje: "Vissersdorp, bekend om de klederdracht 🐟" },
    { id: "hilversum",        naam: "Hilversum",        categorie: "stad", regio: "noord-holland", label: "13", weetje: "Mediastad: hier worden tv-programma's gemaakt 📺" },
    { id: "zaanstad",         naam: "Zaanstad",         categorie: "stad", regio: "noord-holland", label: "",   weetje: "Bekend om de molens van de Zaanse Schans 🌬️ (staat niet op deze toets)" },

    { id: "middelburg",       naam: "Middelburg",       categorie: "stad", regio: "zeeland",       label: "24", weetje: "De hoofdstad van Zeeland 🏛️" },
    { id: "vlissingen",       naam: "Vlissingen",       categorie: "stad", regio: "zeeland",       label: "25", weetje: "Havenstad aan de Westerschelde ⚓" },
    { id: "goes",             naam: "Goes",             categorie: "stad", regio: "zeeland",       label: "23", weetje: "Hoofdplaats van Zuid-Beveland 🍏" },
    { id: "zierikzee",        naam: "Zierikzee",        categorie: "stad", regio: "zeeland",       label: "22", weetje: "Oud stadje in Zeeland 🦪" },
    { id: "renesse",          naam: "Renesse",          categorie: "stad", regio: "zeeland",       label: "21", weetje: "Badplaats met brede stranden 🏖️" },
    { id: "terneuzen",        naam: "Terneuzen",        categorie: "stad", regio: "zeeland",       label: "26", weetje: "In Zeeuws-Vlaanderen, met grote sluizen 🚢" },

    // ---- Wateren (Romeinse cijfers I..X) ----
    { id: "noordzee",             naam: "Noordzee",             categorie: "water", regio: "water", label: "X",    weetje: "De grote zee aan de westkant 🌊" },
    { id: "waddenzee",            naam: "Waddenzee",            categorie: "water", regio: "water", label: "I",    weetje: "Ondiepe zee waar je kunt wadlopen 🦀" },
    { id: "ijsselmeer",           naam: "IJsselmeer",           categorie: "water", regio: "water", label: "II",   weetje: "Groot meer, vroeger de Zuiderzee 🌊" },
    { id: "markermeer",           naam: "Markermeer",           categorie: "water", regio: "water", label: "III",  weetje: "Meer tussen Amsterdam en Hoorn 🚤" },
    { id: "noordzeekanaal",       naam: "Noordzeekanaal",       categorie: "water", regio: "water", label: "IV",   weetje: "Kanaal van Amsterdam naar de zee 🚢" },
    { id: "amsterdam-rijnkanaal", naam: "Amsterdam-Rijnkanaal", categorie: "water", regio: "water", label: "V",    weetje: "Drukke vaarweg van Amsterdam naar de Rijn 🛶" },
    { id: "nieuwe-waterweg",      naam: "Nieuwe Waterweg",      categorie: "water", regio: "water", label: "VI",   weetje: "Verbindt Rotterdam met de zee 🚢" },
    { id: "lek",                  naam: "Lek",                  categorie: "water", regio: "water", label: "VII",  weetje: "Rivier door het midden van het land 🌊" },
    { id: "oosterschelde",        naam: "Oosterschelde",        categorie: "water", regio: "water", label: "VIII", weetje: "Zeearm met de beroemde stormvloedkering 🌊" },
    { id: "westerschelde",        naam: "Westerschelde",        categorie: "water", regio: "water", label: "IX",   weetje: "Zeearm naar de haven van Antwerpen 🚢" },

    // ---- Gebieden (letters A..G) ----
    { id: "texel",              naam: "Texel",              categorie: "gebied", regio: "gebied", label: "A", weetje: "Het grootste Waddeneiland 🐑" },
    { id: "haarlemmermeer",     naam: "Haarlemmermeer",     categorie: "gebied", regio: "gebied", label: "B", weetje: "Drooggemaakt meer; hier ligt Schiphol ✈️" },
    { id: "randstad",           naam: "Randstad",           categorie: "gebied", regio: "gebied", label: "C", weetje: "Het drukke gebied met de grote steden 🏙️" },
    { id: "groene-hart",        naam: "Groene Hart",        categorie: "gebied", regio: "gebied", label: "D", weetje: "Groen weidegebied midden in de Randstad 🐄" },
    { id: "rijnmond",           naam: "Rijnmond",           categorie: "gebied", regio: "gebied", label: "E", weetje: "Het havengebied rond Rotterdam 🚢" },
    { id: "biesbosch",          naam: "Biesbosch",          categorie: "gebied", regio: "gebied", label: "F", weetje: "Natuurgebied met rivieren en wilgen 🦫" },
    { id: "zeeuws-vlaanderen",  naam: "Zeeuws-Vlaanderen",  categorie: "gebied", regio: "gebied", label: "G", weetje: "Het stukje Zeeland onder de Westerschelde 🌾" }
  ],

  // Genormaliseerde posities (0..1) van de STAD-nummers op Kaart_0001, zodat de
  // app het gevraagde nummer kan omcirkelen. Afgelezen van de kaart en visueel
  // geverifieerd via een overlay. Alleen steden (wateren/gebieden = geen punt).
  coords: {
    "haarlem": [0.56, 0.40], "den-haag": [0.42, 0.52], "utrecht": [0.75, 0.515],
    "den-burg": [0.63, 0.055], "den-helder": [0.635, 0.105], "alkmaar": [0.60, 0.27],
    "hoorn": [0.725, 0.255], "volendam": [0.73, 0.30], "amsterdam": [0.69, 0.41],
    "amstelveen": [0.64, 0.42], "noordwijk": [0.51, 0.45], "leiden": [0.535, 0.49],
    "hilversum": [0.79, 0.455], "amersfoort": [0.885, 0.485], "hoek-van-holland": [0.40, 0.57],
    "gouda": [0.61, 0.565], "zeist": [0.79, 0.525], "schiedam": [0.52, 0.585],
    "rotterdam": [0.575, 0.585], "nieuwegein": [0.72, 0.575], "renesse": [0.215, 0.675],
    "zierikzee": [0.275, 0.73], "goes": [0.29, 0.80], "middelburg": [0.18, 0.785],
    "vlissingen": [0.125, 0.815], "terneuzen": [0.235, 0.895]
  },

  // Niveau-drempels (aantal GEKENDE begrippen) waarop nieuwe winkel-spullen opengaan.
  // Zo motiveer je om meer steden te leren voordat je het mooiste kunt kopen.
  gates: [0, 5, 10, 20, 30],

  // Motiverende teksten voor het tekstballonnetje bij de pinguïn (nudges).
  motivaties: [
    "Je kunt dit! 💪", "Wat ben jij slim! 🌟", "Ik ben trots op je! 🥰",
    "Je wordt elke dag beter! 📈", "Samen leren is leuk! 📚", "Jij bent een topper! ⭐",
    "Kom je me een nieuwe stad leren? 🗺️", "Nog eventjes oefenen en dan feest! 🎉",
    "Wauw, wat ken jij er al veel! 😮", "Even oefenen? Dan verdien je muntjes! 💰",
    "Knap hoor, ga zo door! 👏", "Jij maakt mij de blijste pinguïn! 🐧"
  ],

  // Scenes. 'buiten' (het huis van buiten, groeit mee met upgrades) en 'huis' (binnen, met deco) heb je altijd; 'tuin' en 'boven'
  // koop je als upgrade in de winkel.
  scenes: {
    buiten: { naam: "Mijn huis", emoji: "🏡" },
    huis:  { naam: "Binnen", emoji: "🏠" },
    tuin:  { naam: "Tuin",   emoji: "🌳", upgrade: "tuin" },
    boven: { naam: "Boven",  emoji: "🛏️", upgrade: "verdieping" }
  },

  // Winkel. type: eten | kleren | deco | upgrade.
  //  - eten: vult honger/energie/blijheid
  //  - kleren: draag je op de pinguïn
  //  - deco: verschijnt op positie (x,y) in de scene 'scene'
  //  - upgrade: ontgrendelt een nieuwe scene (unlockScene)
  // minMastered = pas te koop vanaf zoveel gekende begrippen.
  shop: [
    // ---- Eten ----
    { id: "waterdruppel", naam: "Waterdruppel", emoji: "💧", prijs: 6,  type: "eten" },
    { id: "mosje",        naam: "Mosje",        emoji: "🌿", prijs: 8,  type: "eten" },
    { id: "algjes",       naam: "Algjes",       emoji: "🫧", prijs: 10, type: "eten" },
    { id: "visje",        naam: "Visje",        emoji: "🐟", prijs: 12, type: "eten" },
    { id: "bessen",       naam: "Bessen",       emoji: "🫐", prijs: 16, type: "eten" },
    { id: "ijsje",        naam: "IJsje",        emoji: "🍦", prijs: 22, type: "eten", minMastered: 5 },
    { id: "taart",        naam: "Taart",        emoji: "🎂", prijs: 30, type: "eten", minMastered: 10 },

    // ---- Kleren (draag je op je pinguïn) ----
    { id: "strikje",       naam: "Strikje",       emoji: "🎀", prijs: 25, type: "kleren" },
    { id: "brilletje",     naam: "Brilletje",     emoji: "🕶️", prijs: 30, type: "kleren" },
    { id: "petje",         naam: "Petje",         emoji: "🧢", prijs: 40, type: "kleren" },
    { id: "hoedje",        naam: "Hoge hoed",     emoji: "🎩", prijs: 45, type: "kleren" },
    { id: "zonnebril",     naam: "Zonnebril",     emoji: "🕶️", prijs: 50, type: "kleren", minMastered: 5 },
    { id: "zonnehoed",     naam: "Zonnehoed",     emoji: "👒", prijs: 55, type: "kleren", minMastered: 5 },
    { id: "afstudeerhoed", naam: "Afstudeerhoed", emoji: "🎓", prijs: 85, type: "kleren", minMastered: 10 },
    { id: "kroontje",      naam: "Gouden kroon",  emoji: "👑", prijs: 160, type: "kleren", minMastered: 20 },

    // ---- Voor in huis ----
    { id: "tapijt",     naam: "Tapijt",      emoji: "🟫", prijs: 25,  type: "deco", scene: "huis", x: 50, y: 92, size: 64 },
    { id: "plantje",    naam: "Kamerplant",  emoji: "🪴", prijs: 25,  type: "deco", scene: "huis", x: 13, y: 70, size: 42 },
    { id: "schilderij", naam: "Schilderij",  emoji: "🖼️", prijs: 35,  type: "deco", scene: "huis", x: 22, y: 20, size: 40 },
    { id: "tulpje",     naam: "Tulpje",      emoji: "🌷", prijs: 20,  type: "deco", scene: "huis", x: 40, y: 72, size: 34 },
    { id: "molen",      naam: "Molentje",    emoji: "🌬️", prijs: 30,  type: "deco", scene: "huis", x: 50, y: 22, size: 36 },
    { id: "klok",       naam: "Klok",        emoji: "🕰️", prijs: 30,  type: "deco", scene: "huis", x: 82, y: 18, size: 38 },
    { id: "cactus",     naam: "Cactus",      emoji: "🌵", prijs: 30,  type: "deco", scene: "huis", x: 90, y: 82, size: 40, minMastered: 5 },
    { id: "knuffel",    naam: "Knuffel",     emoji: "🧸", prijs: 40,  type: "deco", scene: "huis", x: 72, y: 86, size: 42, minMastered: 5 },
    { id: "raam",       naam: "Raam",        emoji: "🪟", prijs: 45,  type: "deco", scene: "huis", x: 67, y: 24, size: 46, minMastered: 5 },
    { id: "boekenkast", naam: "Boekenkast",  emoji: "📚", prijs: 60,  type: "deco", scene: "huis", x: 88, y: 64, size: 48, minMastered: 5 },
    { id: "lamp",       naam: "Staande lamp",emoji: "💡", prijs: 35,  type: "deco", scene: "huis", x: 30, y: 14, size: 34, minMastered: 10 },
    { id: "tv",         naam: "Televisie",   emoji: "📺", prijs: 70,  type: "deco", scene: "huis", x: 13, y: 55, size: 46, minMastered: 10 },
    { id: "bank",       naam: "Bank",        emoji: "🛋️", prijs: 85,  type: "deco", scene: "huis", x: 33, y: 84, size: 54, minMastered: 10 },
    { id: "gitaar",     naam: "Gitaar",      emoji: "🎸", prijs: 100, type: "deco", scene: "huis", x: 88, y: 86, size: 48, minMastered: 20 },
    { id: "haard",      naam: "Open haard",  emoji: "🔥", prijs: 120, type: "deco", scene: "huis", x: 60, y: 84, size: 46, minMastered: 20 },

    // ---- Upgrades ----
    { id: "tuin",       naam: "Tuin aanleggen",   emoji: "🌳", prijs: 120, type: "upgrade", unlockScene: "tuin",  minMastered: 10 },
    { id: "verdieping", naam: "Extra verdieping", emoji: "🏠", prijs: 220, type: "upgrade", unlockScene: "boven", minMastered: 20 },

    // ---- Voor in de tuin (eerst de tuin aanleggen) ----
    { id: "bloemperk",  naam: "Bloemenperk", emoji: "🌷", prijs: 25, type: "deco", scene: "tuin", x: 26, y: 80, size: 40, minMastered: 10 },
    { id: "boom",       naam: "Boom",        emoji: "🌳", prijs: 40, type: "deco", scene: "tuin", x: 14, y: 50, size: 64, minMastered: 10 },
    { id: "zonnebloem", naam: "Zonnebloem",  emoji: "🌻", prijs: 30, type: "deco", scene: "tuin", x: 72, y: 74, size: 46, minMastered: 10 },
    { id: "vlinder",    naam: "Vlinder",     emoji: "🦋", prijs: 20, type: "deco", scene: "tuin", x: 30, y: 26, size: 32, minMastered: 10 },
    { id: "bijtje",     naam: "Bijtje",      emoji: "🐝", prijs: 20, type: "deco", scene: "tuin", x: 74, y: 24, size: 30, minMastered: 10 },
    { id: "tuinbankje", naam: "Tuinbankje",  emoji: "🪑", prijs: 45, type: "deco", scene: "tuin", x: 85, y: 72, size: 40, minMastered: 15 },
    { id: "paddenstoel",naam: "Paddenstoel", emoji: "🍄", prijs: 25, type: "deco", scene: "tuin", x: 42, y: 86, size: 34, minMastered: 15 },
    { id: "eendje",     naam: "Eendje",      emoji: "🦆", prijs: 30, type: "deco", scene: "tuin", x: 58, y: 84, size: 36, minMastered: 15 },
    { id: "fontein",    naam: "Fontein",     emoji: "⛲", prijs: 80, type: "deco", scene: "tuin", x: 50, y: 66, size: 50, minMastered: 20 },
    { id: "regenboog",  naam: "Regenboog",   emoji: "🌈", prijs: 60, type: "deco", scene: "tuin", x: 22, y: 16, size: 52, minMastered: 20 },

    // ---- Voor de bovenverdieping (eerst de verdieping kopen) ----
    { id: "bed",         naam: "Bed",          emoji: "🛏️", prijs: 70,  type: "deco", scene: "boven", x: 32, y: 82, size: 58, minMastered: 20 },
    { id: "dakraam",     naam: "Dakraam",      emoji: "🪟", prijs: 45,  type: "deco", scene: "boven", x: 50, y: 16, size: 44, minMastered: 20 },
    { id: "maanlamp",    naam: "Maanlampje",   emoji: "🌙", prijs: 40,  type: "deco", scene: "boven", x: 22, y: 18, size: 38, minMastered: 20 },
    { id: "sterrenlamp", naam: "Sterrenlamp",  emoji: "🌟", prijs: 35,  type: "deco", scene: "boven", x: 76, y: 20, size: 36, minMastered: 20 },
    { id: "wereldbol",   naam: "Wereldbol",    emoji: "🌍", prijs: 60,  type: "deco", scene: "boven", x: 66, y: 84, size: 44, minMastered: 25 },
    { id: "telescoop",   naam: "Telescoop",    emoji: "🔭", prijs: 100, type: "deco", scene: "boven", x: 82, y: 74, size: 48, minMastered: 25 }
  ]
};
