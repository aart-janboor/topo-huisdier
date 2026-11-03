/* Topo-huisdier — Noord-Nederland (kaart: assets/kaart-noord.jpg)
 *
 * Tekens op de kaart:
 *   - cijfer 1..17  -> steden/dorpen (1, 2, 3 zijn de hoofdsteden, met een ster)
 *   - Romeins I..IV -> wateren, en "?" = de verbinding Noord-Holland <-> Friesland
 *   - letter a..h   -> gebieden (eilanden, Noordelijke Friese Wouden, Hondsrug)
 * Gecontroleerd tegen de kaart zelf. Twee plekken wijken af van het ingevulde
 * werkblad: Terschelling (eiland) is b (5 is het dorp), en Rottumerplaat is e /
 * Rottumeroog is f (bevestigd door de ouder).
 *
 * Dit bestand vult de hoofd-data (js/data.js) aan: de app voegt de winkel-items,
 * plekken en motivaties hieronder zelf toe. Alle ids beginnen met "n-".
 */
window.TOPO_NOORD = {

  naam: "Noord-Nederland",
  emoji: "🐄",
  kaart: "assets/kaart-noord.jpg",
  start: 5,                 // zoveel begrippen meteen beschikbaar
  mijlpalen: [5, 15],       // + "alles gekend"

  regios: {
    "friesland": "Friesland",
    "groningen": "Groningen",
    "drenthe": "Drenthe",
    "noord-water": "Wateren van het Noorden",
    "noord-gebied": "Waddeneilanden & gebieden"
  },

  // Volgorde = leerroute: eerst de drie hoofdsteden en wat bekends, daarna uitbreiden.
  items: [
    // ---- Starterset ----
    { id: "n-leeuwarden", naam: "Leeuwarden", categorie: "stad", regio: "friesland", label: "1", weetje: "Hoofdstad van Friesland, met de scheve toren de Oldehove 🗼" },
    { id: "n-groningen",  naam: "Groningen",  categorie: "stad", regio: "groningen", label: "2", weetje: "Hoofdstad van Groningen: studentenstad met de hoge Martinitoren 🎓" },
    { id: "n-assen",      naam: "Assen",      categorie: "stad", regio: "drenthe",   label: "3", weetje: "Hoofdstad van Drenthe. Hier worden de motorraces van de TT gereden 🏍️" },
    { id: "n-harlingen",  naam: "Harlingen",  categorie: "stad", regio: "friesland", label: "8", weetje: "Havenstad: hier vertrekken de veerboten naar Terschelling en Vlieland ⛴️" },
    { id: "n-emmen",      naam: "Emmen",      categorie: "stad", regio: "drenthe",   label: "17", weetje: "Hier woon je naast dierentuin Wildlands, met leeuwen en giraffen 🦁" },

    // ---- Daarna ----
    { id: "n-sneek",      naam: "Sneek",      categorie: "stad", regio: "friesland", label: "9", weetje: "Watersportstad met de beroemde Waterpoort ⛵" },
    { id: "n-heerenveen", naam: "Heerenveen", categorie: "stad", regio: "friesland", label: "10", weetje: "Hier staat Thialf, het grote schaatsstadion ⛸️" },
    { id: "n-waddenzee",  naam: "Waddenzee",  categorie: "water", regio: "noord-water", label: "I", weetje: "Hier kun je wadlopen: lopen over de zeebodem als het eb is 🥾" },
    { id: "n-terschelling", naam: "Terschelling", categorie: "gebied", regio: "noord-gebied", label: "b", weetje: "Waddeneiland met cranberry's en de vuurtoren de Brandaris 🫐" },
    { id: "n-delfzijl",   naam: "Delfzijl",   categorie: "stad", regio: "groningen", label: "14", weetje: "Havenstad aan de Eems en de Dollard 🚢" },
    { id: "n-pieterburen", naam: "Pieterburen", categorie: "stad", regio: "groningen", label: "13", weetje: "Hier is de zeehondencrèche: zieke zeehondjes worden beter gemaakt 🦭" },
    { id: "n-meppel",     naam: "Meppel",     categorie: "stad", regio: "drenthe",   label: "15", weetje: "Stad in het zuidwesten van Drenthe, vlak bij het waterdorp Giethoorn 🚣" },
    { id: "n-hoogeveen",  naam: "Hoogeveen",  categorie: "stad", regio: "drenthe",   label: "16", weetje: "Stad in Zuid-Drenthe die vroeger een veenkolonie was 🌱" },
    { id: "n-ijsselmeer", naam: "IJsselmeer", categorie: "water", regio: "noord-water", label: "II", weetje: "Groot meer, afgesloten van de zee door de Afsluitdijk 🌊" },
    { id: "n-schiermonnikoog", naam: "Schiermonnikoog (eiland)", categorie: "gebied", regio: "noord-gebied", label: "d", weetje: "Het kleinste bewoonde Waddeneiland, een nationaal park 🌿" },
    { id: "n-drachten",   naam: "Drachten",   categorie: "stad", regio: "friesland", label: "11", weetje: "Grote plaats in Friesland waar scheerapparaten gemaakt worden 🪒" },
    { id: "n-lauwersoog", naam: "Lauwersoog", categorie: "stad", regio: "groningen", label: "12", weetje: "Hier vertrekt de boot naar Schiermonnikoog ⛴️" },
    { id: "n-afsluitdijk", naam: "Afsluitdijk", categorie: "water", regio: "noord-water", label: "?", weetje: "Een dijk van 32 kilometer tussen Noord-Holland en Friesland. Je kunt er fietsen en autorijden 🚲" },
    { id: "n-vlieland",   naam: "Vlieland",   categorie: "gebied", regio: "noord-gebied", label: "a", weetje: "Rustig Waddeneiland met veel duinen 🏝️" },
    { id: "n-ameland",    naam: "Ameland",    categorie: "gebied", regio: "noord-gebied", label: "c", weetje: "Waddeneiland met brede stranden 🏖️" },
    { id: "n-west-terschelling", naam: "West-Terschelling", categorie: "stad", regio: "friesland", label: "5", weetje: "Hoofddorp van Terschelling, waar de Brandaris staat. De veerboot uit Harlingen komt hier aan ⛴️" },
    { id: "n-oost-vlieland", naam: "Oost-Vlieland", categorie: "stad", regio: "friesland", label: "4", weetje: "Het enige dorp op Vlieland 🏝️" },
    { id: "n-ballum",     naam: "Ballum",     categorie: "stad", regio: "friesland", label: "6", weetje: "Een dorp op het Waddeneiland Ameland 🐑" },
    { id: "n-schiermonnikoog-plaats", naam: "Schiermonnikoog (plaats)", categorie: "stad", regio: "friesland", label: "7", weetje: "Het enige dorp van het eiland. Bezoekers mogen er niet met de auto komen, dus iedereen fietst 🚲" },
    { id: "n-eems",       naam: "Eems",       categorie: "water", regio: "noord-water", label: "III", weetje: "Hier stroomt de rivier de Eems de zee in, bij de grens met Duitsland 🇩🇪" },
    { id: "n-dollard",    naam: "Dollard",    categorie: "water", regio: "noord-water", label: "IV", weetje: "Een baai bij de Duitse grens, lang geleden ontstaan door overstromingen 🌊" },
    { id: "n-hondsrug",   naam: "Hondsrug",   categorie: "gebied", regio: "noord-gebied", label: "h", weetje: "Een lange zandrug door Drenthe en Groningen, vol hunebedden 🪨" },
    { id: "n-noordelijke-friese-wouden", naam: "Noordelijke Friese Wouden", categorie: "gebied", regio: "noord-gebied", label: "g", weetje: "Groen gebied met bosjes, slootjes en graslanden 🌳" },
    { id: "n-rottumerplaat", naam: "Rottumerplaat", categorie: "gebied", regio: "noord-gebied", label: "e", weetje: "Onbewoond eilandje waar zeehonden en vogels rust hebben. Het noordelijkste stukje van Nederland 🧭" },
    { id: "n-rottumeroog",   naam: "Rottumeroog",   categorie: "gebied", regio: "noord-gebied", label: "f", weetje: "Onbewoond eilandje naast de Rottumerplaat: een rustplek voor zeehonden en vogels 🦭" }
  ],

  // Posities van de tekens op de kaart (0..1), afgelezen van assets/kaart-noord.jpg.
  coords: {
    "n-leeuwarden": [0.422, 0.434], "n-groningen": [0.720, 0.405], "n-assen": [0.719, 0.618],
    "n-oost-vlieland": [0.115, 0.341], "n-west-terschelling": [0.189, 0.270],
    "n-ballum": [0.371, 0.199], "n-schiermonnikoog-plaats": [0.548, 0.174],
    "n-harlingen": [0.265, 0.451], "n-sneek": [0.349, 0.593], "n-heerenveen": [0.460, 0.673],
    "n-drachten": [0.508, 0.515], "n-lauwersoog": [0.580, 0.248], "n-pieterburen": [0.663, 0.233],
    "n-delfzijl": [0.866, 0.308], "n-meppel": [0.571, 0.897], "n-hoogeveen": [0.692, 0.877],
    "n-emmen": [0.873, 0.833],
    "n-waddenzee": [0.143, 0.477], "n-ijsselmeer": [0.245, 0.829], "n-eems": [0.873, 0.215],
    "n-dollard": [0.958, 0.335], "n-afsluitdijk": [0.162, 0.610],
    "n-vlieland": [0.050, 0.346], "n-terschelling": [0.234, 0.186], "n-ameland": [0.419, 0.149],
    "n-schiermonnikoog": [0.590, 0.111], "n-rottumeroog": [0.723, 0.062],
    "n-rottumerplaat": [0.676, 0.074], "n-noordelijke-friese-wouden": [0.419, 0.496],
    "n-hondsrug": [0.819, 0.654]
  },

  // Aantal gekende begrippen in het Noorden waarop er nieuwe winkelspullen opengaan.
  gates: [0, 3, 6, 8, 10, 12, 15, 18, 20, 24, 30],

  // Paspoort: een stempel per afgeronde groep (zie Album).
  paspoort: [
    { badge: "regio-friesland",    emoji: "🐄", naam: "Friesland" },
    { badge: "regio-groningen",    emoji: "🦭", naam: "Groningen" },
    { badge: "regio-drenthe",      emoji: "🪨", naam: "Drenthe" },
    { badge: "regio-noord-water",  emoji: "🌊", naam: "Wateren" },
    { badge: "regio-noord-gebied", emoji: "🏝️", naam: "Eilanden" }
  ],

  motivaties: [
    "Moi! Zullen we het Noorden gaan leren? 🐄", "Ga je mee wadlopen? 🥾",
    "Wat een schaatstalent ben jij! ⛸️", "De Friese paarden zijn trots op jou! 🐴",
    "Ik zie al zeehondjes op je wachten! 🦭", "Een hunebed is zo sterk als jij! 🪨",
    "Jij kent de Waddeneilanden al bijna allemaal! 🏝️"
  ],

  // Nieuwe plekken voor de pinguïn. Ze gaan vanzelf open als je alle begrippen van
  // één groep kent ('unlockBy' = de beloning-id). Daarna koop je er spullen voor.
  scenes: {
    elfsteden: { naam: "Elfstedentocht", emoji: "⛸️", upgrade: "n-plek-elfsteden", unlockBy: "regio-friesland",
                 hint: "Ken alle plaatsen van Friesland om de Elfstedentocht te ontgrendelen!" },
    zeehonden: { naam: "Zeehondencrèche", emoji: "🦭", upgrade: "n-plek-zeehonden", unlockBy: "regio-groningen",
                 hint: "Ken alle plaatsen van Groningen om de zeehondencrèche te ontgrendelen!" },
    heide:     { naam: "Drentse heide", emoji: "🪨", upgrade: "n-plek-heide", unlockBy: "regio-drenthe",
                 hint: "Ken alle plaatsen van Drenthe om de Drentse heide te ontgrendelen!" },
    wadden:    { naam: "Waddenstrand", emoji: "🏝️", upgrade: "n-plek-wadden", unlockBy: "regio-noord-gebied",
                 hint: "Ken alle eilanden en gebieden van het Noorden om het Waddenstrand te ontgrendelen!" }
  },

  // Winkel-spullen. minMastered telt alleen begrippen uit het Noorden.
  shop: [
    // ---- Eten ----
    { id: "n-sukerbole", naam: "Sûkerbôle",      emoji: "🍞", prijs: 18, type: "eten", minMastered: 3 },
    { id: "n-garnalen",  naam: "Garnaaltjes",    emoji: "🦐", prijs: 14, type: "eten", minMastered: 6 },
    { id: "n-cranberry", naam: "Cranberrysap",   emoji: "🧃", prijs: 16, type: "eten", minMastered: 10 },
    { id: "n-worst",     naam: "Drentse worst",  emoji: "🌭", prijs: 20, type: "eten", minMastered: 15 },
    { id: "n-koek",      naam: "Groninger koek", emoji: "🍪", prijs: 18, type: "eten", minMastered: 20 },

    // ---- Kleren ----
    { id: "n-schaatshelm", naam: "Schaatshelm",     emoji: "⛑️", prijs: 40,  type: "kleren", minMastered: 3 },
    { id: "n-zeemanspet",  naam: "Zeemanspet",      emoji: "⚓", prijs: 55,  type: "kleren", minMastered: 8 },
    { id: "n-zeehondje",   naam: "Zeehondje",       emoji: "🦭", prijs: 90,  type: "kleren", minMastered: 12 },
    { id: "n-friespaard",  naam: "Fries paardje",   emoji: "🐴", prijs: 100, type: "kleren", minMastered: 18 },
    { id: "n-hunebedhoed", naam: "Hunebed-hoed",    emoji: "🪨", prijs: 120, type: "kleren", minMastered: 24 },
    { id: "n-beker",       naam: "Noorderbeker",    emoji: "🏆", prijs: 200, type: "kleren", minMastered: 30 },

    // ---- Elfstedentocht ----
    { id: "n-e-schaatsen", naam: "Schaatsen",       emoji: "⛸️", prijs: 20, type: "deco", scene: "elfsteden", x: 24, y: 82, size: 38 },
    { id: "n-e-sneeuwpop", naam: "Sneeuwpop",       emoji: "⛄", prijs: 35, type: "deco", scene: "elfsteden", x: 12, y: 60, size: 54 },
    { id: "n-e-sjaal",     naam: "Sjaal",           emoji: "🧣", prijs: 15, type: "deco", scene: "elfsteden", x: 84, y: 84, size: 34 },
    { id: "n-e-chocomel",  naam: "Warme chocomel",  emoji: "☕", prijs: 15, type: "deco", scene: "elfsteden", x: 91, y: 66, size: 34 },
    { id: "n-e-paard",     naam: "Fries paard",     emoji: "🐴", prijs: 60, type: "deco", scene: "elfsteden", x: 80, y: 54, size: 54 },
    { id: "n-e-vlok",      naam: "Sneeuwvlok",      emoji: "❄️", prijs: 12, type: "deco", scene: "elfsteden", x: 30, y: 16, size: 30 },
    { id: "n-e-medaille",  naam: "Gouden medaille", emoji: "🥇", prijs: 50, type: "deco", scene: "elfsteden", x: 50, y: 16, size: 36 },
    { id: "n-e-thialf",    naam: "Thialf",          emoji: "🏟️", prijs: 80, type: "deco", scene: "elfsteden", x: 16, y: 30, size: 48 },

    // ---- Zeehondencrèche ----
    { id: "n-z-zeehond",   naam: "Zeehondje",       emoji: "🦭", prijs: 30, type: "deco", scene: "zeehonden", x: 22, y: 62, size: 56 },
    { id: "n-z-vis",       naam: "Visje",           emoji: "🐟", prijs: 12, type: "deco", scene: "zeehonden", x: 14, y: 86, size: 30 },
    { id: "n-z-anker",     naam: "Anker",           emoji: "⚓", prijs: 25, type: "deco", scene: "zeehonden", x: 82, y: 64, size: 40 },
    { id: "n-z-krab",      naam: "Krab",            emoji: "🦀", prijs: 18, type: "deco", scene: "zeehonden", x: 76, y: 84, size: 32 },
    { id: "n-z-schelp",    naam: "Schelp",          emoji: "🐚", prijs: 12, type: "deco", scene: "zeehonden", x: 8,  y: 86, size: 28 },
    { id: "n-z-zon",       naam: "Zon",             emoji: "☀️", prijs: 20, type: "deco", scene: "zeehonden", x: 82, y: 16, size: 44 },
    { id: "n-z-meeuw",     naam: "Meeuw",           emoji: "🐦", prijs: 15, type: "deco", scene: "zeehonden", x: 30, y: 22, size: 30 },
    { id: "n-z-pleister",  naam: "Pleister",        emoji: "🩹", prijs: 12, type: "deco", scene: "zeehonden", x: 8,  y: 46, size: 30 },

    // ---- Drentse heide ----
    { id: "n-h-hunebed",   naam: "Hunebed",         emoji: "🪨", prijs: 50, type: "deco", scene: "heide", x: 24, y: 70, size: 56 },
    { id: "n-h-schaap",    naam: "Schaap",          emoji: "🐑", prijs: 30, type: "deco", scene: "heide", x: 80, y: 82, size: 40 },
    { id: "n-h-heide",     naam: "Heidebloemen",    emoji: "🌸", prijs: 15, type: "deco", scene: "heide", x: 10, y: 86, size: 34 },
    { id: "n-h-tent",      naam: "Tent",            emoji: "⛺", prijs: 40, type: "deco", scene: "heide", x: 88, y: 58, size: 44 },
    { id: "n-h-motor",     naam: "TT-motor",        emoji: "🏍️", prijs: 60, type: "deco", scene: "heide", x: 22, y: 90, size: 40 },
    { id: "n-h-giraf",     naam: "Giraf",           emoji: "🦒", prijs: 70, type: "deco", scene: "heide", x: 93, y: 40, size: 52 },
    { id: "n-h-olifant",   naam: "Olifant",         emoji: "🐘", prijs: 70, type: "deco", scene: "heide", x: 8,  y: 42, size: 50 },

    // ---- Waddenstrand ----
    { id: "n-w-parasol",   naam: "Strandparasol",   emoji: "🏖️", prijs: 40, type: "deco", scene: "wadden", x: 80, y: 70, size: 50 },
    { id: "n-w-vlieger",   naam: "Vlieger",         emoji: "🪁", prijs: 25, type: "deco", scene: "wadden", x: 22, y: 18, size: 38 },
    { id: "n-w-kasteel",   naam: "Zandkasteel",     emoji: "🏰", prijs: 30, type: "deco", scene: "wadden", x: 14, y: 74, size: 44 },
    { id: "n-w-veerboot",  naam: "Veerboot",        emoji: "⛴️", prijs: 70, type: "deco", scene: "wadden", x: 86, y: 30, size: 52 },
    { id: "n-w-laarzen",   naam: "Wadlaarzen",      emoji: "🥾", prijs: 25, type: "deco", scene: "wadden", x: 26, y: 90, size: 34 },
    { id: "n-w-cranberry", naam: "Cranberry's",     emoji: "🫐", prijs: 20, type: "deco", scene: "wadden", x: 92, y: 88, size: 30 },
    { id: "n-w-vuurtoren", naam: "Vuurtoren",       emoji: "🗼", prijs: 60, type: "deco", scene: "wadden", x: 10, y: 40, size: 56 },
    { id: "n-w-zeilboot",  naam: "Zeilbootje",      emoji: "⛵", prijs: 45, type: "deco", scene: "wadden", x: 60, y: 22, size: 40 }
  ]
};

// Alles uit dit bestand hoort bij het Noorden (voor de telling per gebied).
(function () {
  var N = window.TOPO_NOORD;
  N.items.forEach(function (it) { it.land = "noord"; });
  N.shop.forEach(function (s) { s.land = "noord"; });
})();
