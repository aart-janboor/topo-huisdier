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

  pet: { soort: "beerdiertje", standaardNaam: "Beertje" },

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

  // Winkel: eten vult honger+blijheid, kleren kun je dragen, deco siert het huis
  shop: [
    { id: "mosje",        naam: "Mosje",         emoji: "🌿", prijs: 10, type: "eten" },
    { id: "waterdruppel", naam: "Waterdruppel",  emoji: "💧", prijs: 8,  type: "eten" },
    { id: "algjes",       naam: "Algjes",        emoji: "🫧", prijs: 12, type: "eten" },
    { id: "bessen",       naam: "Bessen",        emoji: "🫐", prijs: 15, type: "eten" },

    { id: "hoedje",   naam: "Hoedje",   emoji: "🎩", prijs: 25, type: "kleren" },
    { id: "brilletje",naam: "Brilletje",emoji: "🕶️", prijs: 20, type: "kleren" },
    { id: "strikje",  naam: "Strikje",  emoji: "🎀", prijs: 18, type: "kleren" },
    { id: "kroontje", naam: "Kroontje", emoji: "👑", prijs: 60, type: "kleren" },

    { id: "plantje",    naam: "Plantje",       emoji: "🪴", prijs: 20, type: "deco" },
    { id: "tulpje",     naam: "Tulpje",        emoji: "🌷", prijs: 15, type: "deco" },
    { id: "molen",      naam: "Molentje",      emoji: "🌬️", prijs: 30, type: "deco" },
    { id: "schilderij", naam: "Schilderijtje", emoji: "🖼️", prijs: 25, type: "deco" }
  ]
};
