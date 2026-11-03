/* Topo-huisdier — spel-logica en schermen (geen build-stap, pure JS).
 * Werkt zowel lokaal (index.html dubbelklikken) als op GitHub Pages. */
(function () {
  "use strict";

  var DATA = window.TOPO_DATA;
  var SAVE_KEY = "topo-huisdier-v1";
  var QUESTIONS_PER_ROUND = 8;
  var MASTER_BOX = 4; // box >= 4 => "gekend"

  // ---------------------------------------------------------------- Gebieden
  // West-Nederland (js/data.js) en Noord-Nederland (js/data-noord.js) hebben elk een
  // eigen leerroute, kaart en teller. Pinguïn, muntjes en winkel zijn gedeeld.
  // Alles van het Noorden (items, winkel, plekken) heeft land: "noord"; de rest is West.
  var NOORD = window.TOPO_NOORD || null;
  var LANDS = {
    west: {
      id: "west", naam: "West-Nederland", emoji: "🌷", kaart: "assets/kaart.jpg",
      items: DATA.items, key: "unlockedCount", gates: DATA.gates, regios: DATA.regios,
      start: 5, mijlpalen: [5, 15, 30], tierKey: "shopTier", pre: ""
    }
  };
  var LAND_IDS = ["west"];
  var ALL_REGIOS = {}, COORDS = {};
  Object.keys(DATA.regios).forEach(function (k) { ALL_REGIOS[k] = DATA.regios[k]; });
  Object.keys(DATA.coords || {}).forEach(function (k) { COORDS[k] = DATA.coords[k]; });
  if (NOORD) {
    LANDS.noord = {
      id: "noord", naam: NOORD.naam, emoji: NOORD.emoji, kaart: NOORD.kaart,
      items: NOORD.items, key: "unlockedNoord", gates: NOORD.gates, regios: NOORD.regios,
      start: NOORD.start, mijlpalen: NOORD.mijlpalen, tierKey: "shopTierNoord", pre: "Noord: "
    };
    LAND_IDS.push("noord");
    Object.keys(NOORD.regios).forEach(function (k) { ALL_REGIOS[k] = NOORD.regios[k]; });
    Object.keys(NOORD.coords).forEach(function (k) { COORDS[k] = NOORD.coords[k]; });
    DATA.shop = DATA.shop.concat(NOORD.shop);
    DATA.motivaties = DATA.motivaties.concat(NOORD.motivaties);
    Object.keys(NOORD.scenes).forEach(function (k) { DATA.scenes[k] = NOORD.scenes[k]; });
  }
  function landOf(item) { return item.land || "west"; }
  function itemsOf(id) { return LANDS[id].items; }
  function allItems() {
    var a = [];
    LAND_IDS.forEach(function (id) { a = a.concat(LANDS[id].items); });
    return a;
  }

  // ---------------------------------------------------------------- State
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }
  function yesterdayStr() {
    var d = new Date(Date.now() - 86400000);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function defaultState() {
    var s = {
      version: 1,
      pet: { soort: "pinguin", naam: DATA.pet.standaardNaam, nameSet: false },
      coins: 15,
      xp: 0,
      needs: { blij: 70, honger: 60, energie: 70 },
      lastTick: Date.now(),
      owned: [],        // alles wat gekocht is (kleren, deco, upgrades) — ids
      equipped: null,   // gedragen kleren-id
      deco: [],         // (legacy) niet meer gebruikt; scene leest uit owned
      currentScene: "buiten",
      shopTier: 0,      // hoogste bereikte unlock-drempel (voor "nieuw in winkel")
      progress: {},     // id -> {box, goed, fout, dueAt, introduced}
      unlockedCount: 5,   // West
      unlockedNoord: 5,   // Noord
      regio: "west",      // laatst geoefende gebied
      streakDays: 0,
      lastPlayDay: null,
      badges: [],
      stickers: [],     // ids van gekende begrippen
      overrides: {},    // id -> {label}
      pos: {},          // deco-id -> {x,y} (%): zelf verplaatste plek
      muted: false      // geluid aan/uit
    };
    ensureLands(s);
    return s;
  }

  // Zorgt dat elk gebied een teller en startbegrippen heeft, ook in een oude opslag
  // (van vóór Noord-Nederland): bestaande voortgang blijft onaangeroerd.
  // West-starters zijn al 'geïntroduceerd'; die van het Noorden krijgen eerst een introkaartje.
  function ensureLands(s) {
    if (!s.regio || !LANDS[s.regio]) s.regio = "west";
    LAND_IDS.forEach(function (id) {
      var L = LANDS[id];
      if (typeof s[L.key] !== "number") s[L.key] = L.start;
      for (var i = 0; i < s[L.key] && i < L.items.length; i++) {
        var it = L.items[i];
        if (!s.progress[it.id]) s.progress[it.id] = { box: 1, goed: 0, fout: 0, dueAt: 0, introduced: id === "west" };
      }
    });
  }

  var state;
  var demoMode = false;
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { state = JSON.parse(raw); if (!state.pos) state.pos = {}; ensureLands(state); return; }
    } catch (e) {}
    state = defaultState();
  }
  function save() {
    if (demoMode) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------------------------------------------------------------- Data helpers
  function labelOf(item) {
    var o = state.overrides[item.id];
    if (o && typeof o.label === "string") return o.label;
    return item.label;
  }
  function hasLabel(item) { return labelOf(item).trim() !== ""; }
  function prog(id) { return state.progress[id]; }
  function coordOf(item) { return COORDS[item.id] || null; }
  function land() { return LANDS[state.regio] || LANDS.west; }
  function mapHTML(item, showMarker) {
    var L = LANDS[landOf(item)];
    var c = showMarker ? coordOf(item) : null;
    var marker = c ? '<div class="maphi" style="left:' + (c[0] * 100) + "%;top:" + (c[1] * 100) + '%"></div>' : "";
    return '<div class="bigmap ' + L.id + '" id="qmap"><img src="' + L.kaart + '" alt="kaart van ' + L.naam + '">' + marker + "</div>";
  }
  function isMastered(id) { var p = prog(id); return !!p && p.box >= MASTER_BOX; }
  // Aantal gekende begrippen: van één gebied, of (zonder argument) van alle gebieden samen.
  function masteredCount(id) {
    var list = id ? itemsOf(id) : allItems();
    return list.filter(function (it) { return isMastered(it.id); }).length;
  }
  function totaalIn(id) { return itemsOf(id).filter(hasLabel).length; }
  function owns(id) { return state.owned.indexOf(id) >= 0; }
  function shopItem(id) { return DATA.shop.filter(function (s) { return s.id === id; })[0]; }
  // Winkel-spullen uit het Noorden tellen alleen Noord-begrippen, de rest alleen West.
  function isLocked(item) { return (item.minMastered || 0) > masteredCount(landOf(item)); }
  function sceneUnlocked(scene) {
    var cfg = DATA.scenes[scene];
    return !cfg || !cfg.upgrade || owns(cfg.upgrade);
  }
  function unlockedScenes() {
    return Object.keys(DATA.scenes).filter(sceneUnlocked);
  }
  // Volgende drempel waarop er iets nieuws in de winkel komt
  function nextGate(id) {
    var m = masteredCount(id), gates = LANDS[id].gates;
    for (var i = 0; i < gates.length; i++) if (gates[i] > m) return gates[i];
    return null;
  }

  // Begrippen van één gebied die al ontgrendeld zijn (op volgorde van de leerroute)
  function unlockedItems(id) { return itemsOf(id).slice(0, state[LANDS[id].key]); }

  // Begrippen die meedoen in de quiz: ontgrendeld, geïntroduceerd en met een teken
  function activeItems(id) {
    return unlockedItems(id).filter(function (it) {
      var p = prog(it.id);
      return p && p.introduced && hasLabel(it);
    });
  }

  var STAGES = [
    { id: "baby",    naam: "Baby",         min: 0 },
    { id: "kind",    naam: "Kind",         min: 5 },
    { id: "groot",   naam: "Groot",        min: 15 },
    { id: "meester", naam: "Topo-meester", min: 30 }
  ];
  function stage() {
    var m = masteredCount(), st = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) if (m >= STAGES[i].min) st = STAGES[i];
    return st;
  }

  // ---------------------------------------------------------------- Needs over tijd
  function tickNeeds() {
    var now = Date.now();
    var hours = (now - (state.lastTick || now)) / 3600000;
    if (hours > 0.01) {
      state.needs.honger = clamp(state.needs.honger - hours * 2);
      state.needs.energie = clamp(state.needs.energie - hours * 1.5);
      state.needs.blij = clamp(state.needs.blij - hours * 1);
      state.lastTick = now;
    }
  }
  function clamp(n) { return Math.max(10, Math.min(100, Math.round(n))); }

  // ---------------------------------------------------------------- Ontgrendelen
  function maybeUnlock(id) {
    var L = LANDS[id], newlyUnlocked = [];
    while (state[L.key] < L.items.length) {
      var pool = unlockedItems(id).filter(hasLabel);
      var mastered = pool.filter(function (it) { return isMastered(it.id); }).length;
      // nieuw begrip zodra bijna de hele set gekend is (buffer 1)
      if (pool.length === 0 || mastered >= pool.length - 1) {
        state[L.key]++;
        var nw = L.items[state[L.key] - 1];
        if (!prog(nw.id)) {
          state.progress[nw.id] = { box: 1, goed: 0, fout: 0, dueAt: 0, introduced: false };
        }
        if (hasLabel(nw)) newlyUnlocked.push(nw);
      } else break;
    }
    return newlyUnlocked;
  }

  // ---------------------------------------------------------------- SRS
  var INTERVAL_MS = { 1: 0, 2: 10 * 3600000, 3: 86400000, 4: 3 * 86400000, 5: 7 * 86400000 };
  function schedule(p, correct) {
    if (correct) { p.goed++; p.box = Math.min(5, p.box + 1); }
    else { p.fout++; p.box = 1; }
    p.dueAt = Date.now() + (INTERVAL_MS[p.box] || 0);
  }

  // ---------------------------------------------------------------- Sessie bouwen
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildSession() {
    var pool = activeItems(state.regio);
    if (!pool.length) return [];
    var now = Date.now();
    var due = pool.filter(function (it) { return prog(it.id).dueAt <= now; });
    due.sort(function (a, b) { return prog(a.id).box - prog(b.id).box; });
    var picked = [];
    for (var i = 0; i < due.length && picked.length < QUESTIONS_PER_ROUND; i++) picked.push(due[i]);
    if (picked.length < QUESTIONS_PER_ROUND) {
      var rest = pool.filter(function (it) { return picked.indexOf(it) < 0; })
        .sort(function (a, b) { return prog(a.id).dueAt - prog(b.id).dueAt; });
      for (var j = 0; j < rest.length && picked.length < QUESTIONS_PER_ROUND; j++) picked.push(rest[j]);
    }
    // bij een kleine pool: herhaal zodat een rondje lekker lang genoeg is
    if (picked.length && picked.length < 5) {
      var k = 0;
      while (picked.length < Math.min(5, pool.length * 2)) { picked.push(picked[k % picked.length]); k++; }
    }
    return shuffle(picked).map(makeQuestion);
  }

  function distractors(item, field) {
    var own = itemsOf(landOf(item));
    var same = own.filter(function (it) {
      return it.id !== item.id && it.categorie === item.categorie && hasLabel(it);
    });
    var pool = shuffle(same);
    var out = [], seen = {};
    seen[field === "naam" ? item.naam : labelOf(item)] = true;
    for (var i = 0; i < pool.length && out.length < 3; i++) {
      var val = field === "naam" ? pool[i].naam : labelOf(pool[i]);
      if (!seen[val]) { seen[val] = true; out.push(val); }
    }
    // aanvullen met andere categorieën indien nodig
    if (out.length < 3) {
      var any = shuffle(own.filter(function (it) { return it.id !== item.id && hasLabel(it); }));
      for (var m = 0; m < any.length && out.length < 3; m++) {
        var v = field === "naam" ? any[m].naam : labelOf(any[m]);
        if (!seen[v]) { seen[v] = true; out.push(v); }
      }
    }
    return out;
  }

  function welk(c) { return c === "stad" ? "Welke plaats" : c === "water" ? "Welk water" : "Welk gebied"; }

  function makeQuestion(item) {
    var box = prog(item.id).box;
    // nieuwe/moeilijke begrippen: herkennen (teken -> naam). anders afwisselen.
    var mode = box <= 1 ? "tekenNaarNaam" : (Math.random() < 0.5 ? "tekenNaarNaam" : "naamNaarTeken");
    var q;
    if (mode === "tekenNaarNaam") {
      q = {
        item: item, mode: mode,
        vraag: welk(item.categorie) + " is " + labelOf(item) + "?",
        antwoord: item.naam,
        opties: shuffle([item.naam].concat(distractors(item, "naam")))
      };
    } else {
      q = {
        item: item, mode: mode,
        vraag: "Waar ligt " + item.naam + "?",
        antwoord: labelOf(item),
        opties: shuffle([labelOf(item)].concat(distractors(item, "label")))
      };
    }
    return q;
  }

  // ---------------------------------------------------------------- Pet SVG (beerdiertje)
  function petSVG(opts) {
    opts = opts || {};
    var st = stage().id;
    var scale = st === "baby" ? 0.82 : st === "kind" ? 1 : st === "groot" ? 1.15 : 1.3;
    var blij = state.needs.blij;
    var sleepy = blij < 35;
    var dark = "#313c59", darker = "#28314a", belly = "#fdfdfd", beak = "#ffb23e", feet = "#ff9e2c";
    var eyes = sleepy
      ? '<path d="M78 70 q8 7 16 0" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M106 70 q8 7 16 0" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : '<ellipse cx="86" cy="70" rx="9" ry="11" fill="#fff"/><ellipse cx="114" cy="70" rx="9" ry="11" fill="#fff"/>' +
        '<circle cx="88" cy="72" r="4.5" fill="#222"/><circle cx="116" cy="72" r="4.5" fill="#222"/>' +
        '<circle cx="89.5" cy="70" r="1.4" fill="#fff"/><circle cx="117.5" cy="70" r="1.4" fill="#fff"/>';
    var cheeks = blij >= 60
      ? '<circle cx="73" cy="86" r="6" fill="#ff9ab0" opacity=".55"/><circle cx="127" cy="86" r="6" fill="#ff9ab0" opacity=".55"/>'
      : "";
    var zzz = sleepy ? '<text x="150" y="52" font-size="18" fill="#7a86b5">z</text><text x="163" y="40" font-size="13" fill="#9aa5cf">z</text>' : "";
    var crown = st === "meester" ? '<text x="100" y="24" font-size="28" text-anchor="middle">👑</text>' : "";
    var hat = "";
    if (state.equipped) {
      var it = DATA.shop.filter(function (s) { return s.id === state.equipped; })[0];
      if (it) hat = '<text x="100" y="30" font-size="32" text-anchor="middle">' + it.emoji + "</text>";
    }
    var sparkle = st === "meester" ? '<text x="26" y="72" font-size="20">✨</text><text x="160" y="82" font-size="20">✨</text>' : "";
    return '<svg viewBox="0 0 200 175" class="pet-svg" style="transform:scale(' + scale + ')">' +
      sparkle +
      '<ellipse cx="84" cy="159" rx="15" ry="8" fill="' + feet + '"/>' +
      '<ellipse cx="116" cy="159" rx="15" ry="8" fill="' + feet + '"/>' +
      '<ellipse cx="51" cy="104" rx="13" ry="33" fill="' + darker + '" transform="rotate(13 51 104)"/>' +
      '<ellipse cx="149" cy="104" rx="13" ry="33" fill="' + darker + '" transform="rotate(-13 149 104)"/>' +
      '<ellipse cx="100" cy="92" rx="53" ry="64" fill="' + dark + '"/>' +
      '<ellipse cx="100" cy="106" rx="35" ry="46" fill="' + belly + '"/>' +
      cheeks + eyes +
      '<path d="M100 80 L113 90 L100 99 L87 90 Z" fill="' + beak + '"/>' +
      '<path d="M100 90 L113 90 L100 99 Z" fill="#e8892a"/>' +
      zzz + crown + hat +
      "</svg>";
  }

  // ---------------------------------------------------------------- Render helpers
  var appEl;
  function h(html) { appEl.innerHTML = html; }
  function el(id) { return document.getElementById(id); }
  function on(id, ev, fn) { var e = el(id); if (e) e.addEventListener(ev, fn); }

  function topbar(title) {
    return '<div class="topbar"><button class="iconbtn" data-nav="home">🏠</button>' +
      '<b>' + title + "</b>" +
      '<span class="tb-right">' +
      '<button class="iconbtn" data-mute title="Geluid aan/uit">' + (state.muted ? "🔇" : "🔊") + "</button>" +
      '<span class="coins">💰 <span>' + state.coins + "</span></span>" +
      "</span></div>";
  }

  function needsBars() {
    function bar(lbl, key, cls) {
      return '<div class="bar"><span class="lbl">' + lbl + '</span><div class="track">' +
        '<div class="fill ' + cls + '" style="width:' + state.needs[key] + '%"></div></div></div>';
    }
    return '<div class="bars">' + bar("Blijheid", "blij", "blij") +
      bar("Honger", "honger", "honger") + bar("Energie", "energie", "energie") + "</div>";
  }

  // Het huis van buiten: groeit mee (extra verdieping, tuin met hek en bloemen).
  function houseSVG() {
    var up = owns("verdieping"), tuin = owns("tuin");
    var top = up ? 80 : 135;
    var win = function (x, y, w, hh) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="3" fill="#bfe8ff" stroke="#fff" stroke-width="4"/>' +
        '<path d="M' + (x + w / 2) + " " + y + "v" + hh + "M" + x + " " + (y + hh / 2) + "h" + w + '" stroke="#fff" stroke-width="2"/>';
    };
    var g = "";
    if (tuin) {
      g += '<path d="M188 205h24l14 20h-52z" fill="#e8d3a8"/>';
      for (var i = 0; i < 6; i++) {
        g += '<rect x="' + (18 + i * 14) + '" y="185" width="8" height="22" rx="2" fill="#fff" stroke="#d9cdbb"/>' +
          '<rect x="' + (302 + i * 14) + '" y="185" width="8" height="22" rx="2" fill="#fff" stroke="#d9cdbb"/>';
      }
      g += '<text x="22" y="182" font-size="62">🌳</text><text x="318" y="226" font-size="26">🌷</text>' +
        '<text x="348" y="228" font-size="26">🌻</text><text x="108" y="226" font-size="24">🌼</text>' +
        '<text x="274" y="228" font-size="24">🌸</text>';
    }
    return '<svg class="house-svg" viewBox="50 20 300 215" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      g +
      '<rect x="245" y="' + (top - 46) + '" width="16" height="34" fill="#a5483f"/>' +
      '<rect x="120" y="135" width="160" height="70" fill="#f6d8b0"/>' +
      (up ? '<rect x="120" y="80" width="160" height="55" fill="#f9e4c4"/>' +
        '<rect x="120" y="131" width="160" height="6" fill="#d9b98c"/>' +
        win(135, 94, 36, 30) + win(186, 94, 28, 30) + win(229, 94, 36, 30) : "") +
      win(135, 150, 36, 30) + win(229, 150, 36, 30) +
      '<rect x="187" y="160" width="26" height="45" rx="3" fill="#8b5a2b"/><circle cx="207" cy="184" r="2.5" fill="#f5c542"/>' +
      '<polygon points="108,' + top + " 200," + (top - 52) + " 292," + top + '" fill="#c0504d"/>' +
      '<rect x="112" y="205" width="176" height="5" fill="#b9a389"/>' +
      "</svg>";
  }

  // Tekent een scene (buiten/huis/tuin/boven) met de gekochte deco + de pinguïn.
  var editMode = false;
  function decoPos(s) { return (state.pos && state.pos[s.id]) || s; }

  function sceneHTML(scene, extraClass) {
    if (scene === "buiten") {
      return '<div class="scene buiten' + (extraClass ? " " + extraClass : "") + '">' + houseSVG() +
        '<div class="pet-wrap">' + petSVG() + "</div></div>";
    }
    var objs = DATA.shop.filter(function (s) {
      return s.type === "deco" && (s.scene || "huis") === scene && owns(s.id);
    }).map(function (s) {
      var q = decoPos(s);
      return '<span class="deco-obj" data-deco="' + s.id + '" style="left:' + q.x + "%;top:" + q.y + "%;font-size:" + (s.size || 36) + 'px">' + s.emoji + "</span>";
    }).join("");
    var editing = editMode && !extraClass;
    return '<div class="scene ' + scene + (editing ? " editing" : "") + (extraClass ? " " + extraClass : "") + '">' + objs +
      '<div class="pet-wrap">' + petSVG() + "</div></div>";
  }

  function hasDecoIn(scene) {
    return DATA.shop.some(function (s) { return s.type === "deco" && (s.scene || "huis") === scene && owns(s.id); });
  }
  function editBar(scene) {
    if (scene === "buiten" || !hasDecoIn(scene)) return "";
    return editMode
      ? '<div class="editbar"><span>👆 Sleep de spullen naar een nieuwe plek</span>' +
        '<button class="btn mini" data-edit="reset">↺ Terugzetten</button>' +
        '<button class="btn mini ok" data-edit="off">✅ Klaar</button></div>'
      : '<div class="editbar"><button class="btn mini" data-edit="on">✋ Inrichten</button></div>';
  }

  function sceneTabs() {
    var scenes = unlockedScenes();
    if (scenes.length < 2) return "";
    return '<div class="scenetabs">' + scenes.map(function (sc) {
      var cfg = DATA.scenes[sc];
      return '<button class="scenetab ' + (state.currentScene === sc ? "on" : "") +
        '" data-scene="' + sc + '">' + cfg.emoji + " " + cfg.naam + "</button>";
    }).join("") + "</div>";
  }

  function randomMotivatie() {
    var m = DATA.motivaties;
    return m[Math.floor(Math.random() * m.length)];
  }

  // Zwevend tekstballonnetje als aanmoediging (nudge).
  function showNudge(text) {
    var old = el("nudge"); if (old) old.parentNode.removeChild(old);
    var n = document.createElement("div");
    n.id = "nudge"; n.className = "nudge"; n.textContent = text;
    document.body.appendChild(n);
    AudioFX.play("nudge");
    setTimeout(function () { n.classList.add("show"); }, 20);
    setTimeout(function () { n.classList.remove("show"); }, 3200);
    setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 3700);
  }

  // Balkje "nieuwe versie beschikbaar" (zie service worker).
  function showUpdateBanner(reg) {
    if (document.getElementById("updatebar")) return;
    var bar = document.createElement("div");
    bar.id = "updatebar"; bar.className = "updatebar";
    bar.innerHTML = '<span>🔄 Er is een nieuwe versie!</span><button id="doupdate">Nu updaten</button>';
    document.body.appendChild(bar);
    document.getElementById("doupdate").addEventListener("click", function () {
      this.textContent = "Bezig…";
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
    });
  }

  // ---------------------------------------------------------------- Scherm: Home
  var homeMsg = null;
  function renderHome() {
    tickNeeds(); save();
    var st = stage();
    var L = land();
    var m = masteredCount(L.id), totaal = totaalIn(L.id);
    var greet = homeMsg ? homeMsg
      : state.needs.energie < 35 ? "Ik ben een beetje moe… zullen we even slapen? 😴"
      : state.needs.honger < 40 ? "Ik heb een beetje honger… zullen we muntjes verdienen? 🍪"
      : state.needs.blij < 40 ? "Ik verveel me een beetje. Spelen? 🎲"
      : Math.random() < 0.6 ? randomMotivatie()
        : "Hoi! Zullen we samen de kaart oefenen? 🗺️";
    homeMsg = null;

    if (!sceneUnlocked(state.currentScene)) state.currentScene = "buiten";

    var nameBlock = state.pet.nameSet ? "" :
      '<div class="namebox"><input id="petname" placeholder="Naam voor je pinguïn" maxlength="14" value="' +
      esc(state.pet.naam) + '"><button class="btn mini" id="savename">Opslaan</button></div>';

    var ng = nextGate(L.id);
    var wie = LAND_IDS.length > 1 ? L.emoji + " " + L.naam + ": " : "";
    var unlockLine = ng != null
      ? '<div class="progress-line">🎓 ' + wie + m + " / " + totaal + " gekend · nog " + (ng - m) + " tot nieuwe winkelspullen 🛍️</div>"
      : '<div class="progress-line">🎓 ' + wie + m + " / " + totaal + " gekend · alles ontgrendeld! 🏆</div>";

    h(topbar("Topo-huisdier") +
      '<div class="screen">' +
      sceneTabs() +
      sceneHTML(state.currentScene) + editBar(state.currentScene) +
      '<div class="petinfo">' +
      '<div class="petname">' + esc(state.pet.naam) + ' — <span>' + st.naam + "</span></div>" +
      '<div class="speech">' + greet + "</div>" + nameBlock + "</div>" +
      needsBars() +
      unlockLine +
      '<button class="btn play" data-nav="' + (LAND_IDS.length > 1 ? "oefenkeuze" : "oefenen") + '">▶ Ga oefenen</button>' +
      '<div class="row">' +
      '<button class="btn shop" data-nav="winkel">🛍️ Winkel</button>' +
      '<button class="btn album" data-nav="album">📒 Album</button>' +
      "</div>" +
      '<button class="btn rest" data-act="slapen">😴 Even slapen (meer energie)</button>' +
      '<button class="btn ghost" data-nav="ouders">⚙️ Voor ouders</button>' +
      "</div>");

    if (!state.pet.nameSet) {
      on("savename", "click", function () {
        var v = el("petname").value.trim();
        if (v) { state.pet.naam = v; state.pet.nameSet = true; save(); renderHome(); }
      });
    }
  }

  // ---------------------------------------------------------------- Scherm: Intro nieuw begrip
  function showIntros(list, done) {
    var i = 0;
    function next() {
      if (i >= list.length) { done(); return; }
      var it = list[i++];
      var p = prog(it.id); if (p) p.introduced = true;
      save();
      h('<div class="screen intro">' +
        '<div class="introcard">' +
        '<div class="newbadge">NIEUW!</div>' +
        mapHTML(it, true) +
        '<h2>' + esc(it.naam) + '</h2>' +
        '<div class="teken">Teken op de kaart: <b>' + esc(labelOf(it)) + '</b></div>' +
        '<p class="weetje">' + it.weetje + "</p>" +
        '<button class="btn play" id="introok">Leuk! Ga verder →</button>' +
        "</div></div>");
      AudioFX.play("pop");
      on("introok", "click", next);
    }
    next();
  }

  // ---------------------------------------------------------------- Scherm: Oefenen
  var session = null, sIndex = 0, sCorrect = 0, sEarned = 0, sStreak = 0;

  // Keuzescherm: West of Noord oefenen?
  function renderOefenKeuze() {
    tickNeeds(); save();
    var cards = LAND_IDS.map(function (id) {
      var L = LANDS[id], m = masteredCount(id), tot = totaalIn(id);
      var pct = tot ? Math.round(m / tot * 100) : 0;
      return '<button class="landcard" data-land="' + id + '">' +
        '<span class="thumb"><img src="' + L.kaart + '" alt=""></span>' +
        '<span class="lc-naam">' + L.emoji + " " + esc(L.naam) + "</span>" +
        '<span class="lc-bar"><span style="width:' + pct + '%"></span></span>' +
        '<span class="lc-info">' + m + " / " + tot + " gekend</span></button>";
    }).join("");
    h(topbar("Wat wil je oefenen?") +
      '<div class="screen"><div class="landlist">' + cards + "</div>" +
      '<button class="btn ghost" data-nav="home">← Terug</button></div>');
    appEl.querySelectorAll("[data-land]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.regio = b.getAttribute("data-land"); save(); AudioFX.play("pop"); startOefenen();
      });
    });
  }

  function startOefenen() {
    maybeUnlock(state.regio);
    // alles wat ontgrendeld is maar nog geen introkaartje kreeg, krijgt dat nu
    var nieuw = unlockedItems(state.regio).filter(function (it) {
      var p = prog(it.id);
      return p && !p.introduced && hasLabel(it);
    });
    save();
    if (nieuw.length) { showIntros(nieuw, beginRound); }
    else beginRound();
  }

  function beginRound() {
    session = buildSession(); sIndex = 0; sCorrect = 0; sEarned = 0; sStreak = 0;
    if (!session.length) {
      h(topbar("Oefenen") + '<div class="screen"><p class="info">Er zijn nog geen begrippen om te oefenen. ' +
        'Stel eerst de kaart in via "Voor ouders".</p>' +
        '<button class="btn play" data-nav="home">Terug</button></div>');
      return;
    }
    renderQuestion();
  }

  function renderQuestion() {
    var q = session[sIndex];
    var opts = q.opties.map(function (o, i) {
      return '<button class="opt" data-i="' + i + '">' + esc(o) + "</button>";
    }).join("");
    h(topbar("Oefenen") +
      '<div class="screen quiz">' +
      '<div class="progress-line">Vraag ' + (sIndex + 1) + " van " + session.length +
      (sStreak >= 2 ? ' · 🔥 ' + sStreak + " op rij!" : "") + "</div>" +
      mapHTML(q.item, q.mode === "tekenNaarNaam") +
      '<div class="question">' + esc(q.vraag) + "</div>" +
      '<div class="choices">' + opts + "</div>" +
      '<div class="feedback" id="fb"></div>' +
      "</div>");
    var buttons = appEl.querySelectorAll(".opt");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { answer(q, b, buttons); });
    });
  }

  function answer(q, btn, buttons) {
    var chosen = q.opties[+btn.getAttribute("data-i")];
    var correct = chosen === q.antwoord;
    buttons.forEach(function (b) {
      b.disabled = true;
      if (q.opties[+b.getAttribute("data-i")] === q.antwoord) b.classList.add("good");
    });
    // onthul de plek op de kaart (ook als 'ie niet vooraf getoond werd)
    var mp = el("qmap"), c = coordOf(q.item);
    if (mp && c && !mp.querySelector(".maphi")) {
      mp.insertAdjacentHTML("beforeend", '<div class="maphi" style="left:' + (c[0] * 100) + "%;top:" + (c[1] * 100) + '%"></div>');
    }
    var p = prog(q.item.id);
    if (correct) {
      sStreak++; sCorrect++;
      var bonus = sStreak >= 2 ? Math.min(6, (sStreak - 1) * 2) : 0;
      var gain = 8 + bonus;
      sEarned += gain; state.coins += gain; state.xp += 5;
      state.needs.blij = clamp(state.needs.blij + 3);
      schedule(p, true);
      el("fb").innerHTML = '<span class="ok">🎉 Goed! +' + gain + " 💰" + (bonus ? " (reeks-bonus!)" : "") + "</span>";
      AudioFX.play("goed"); setTimeout(function () { AudioFX.play("munt"); }, 140);
      confetti();
      if (sStreak === 3 || sStreak === 6) showNudge(randomMotivatie());
    } else {
      btn.classList.add("bad"); sStreak = 0;
      schedule(p, false);
      el("fb").innerHTML = '<span class="no">😊 Bijna! Dit is <b>' + esc(q.antwoord) + "</b>. Onthoud 'm goed.</span>";
      AudioFX.play("fout");
    }
    save();
    setTimeout(function () {
      sIndex++;
      if (sIndex < session.length) renderQuestion(); else finishRound();
    }, correct ? 950 : 1500);
  }

  function finishRound() {
    state.needs.honger = clamp(state.needs.honger - 5);
    state.needs.energie = clamp(state.needs.energie - 8);
    state.needs.blij = clamp(state.needs.blij + 10);

    // dagelijkse reeks
    var t = todayStr();
    if (state.lastPlayDay !== t) {
      state.streakDays = state.lastPlayDay === yesterdayStr() ? state.streakDays + 1 : 1;
      state.lastPlayDay = t;
    }
    // stickers + badges
    checkUnlocksAndBadges();
    save();

    var newBadges = state._justBadges || []; state._justBadges = [];
    var newUnlocks = state._justUnlocks || []; state._justUnlocks = [];
    save();
    h(topbar("Goed gedaan!") +
      '<div class="screen">' +
      '<div class="petyard">' + petSVG() +
      '<div class="petname">Super, ' + esc(state.pet.naam) + ' is blij! 🎉</div>' +
      '<div class="speech">Je had <b>' + sCorrect + " / " + session.length +
      "</b> goed en verdiende <b>" + sEarned + " 💰</b>.</div></div>" +
      (state.streakDays > 1 ? '<div class="progress-line">🔥 ' + state.streakDays + " dagen op rij geoefend!</div>" : "") +
      (newBadges.length ? '<div class="newbadges">Nieuwe beloning: ' + newBadges.map(esc).join(", ") + " 🏅</div>" : "") +
      (newUnlocks.length ? '<div class="newbadges unlock">' + newUnlocks.map(esc).join("<br>") + "</div>" : "") +
      '<button class="btn shop" data-nav="winkel">🛍️ Muntjes uitgeven</button>' +
      '<button class="btn play" data-nav="oefenen">▶ Nog een rondje (' + esc(land().naam) + ")</button>" +
      (LAND_IDS.length > 1 ? '<button class="btn album" data-nav="oefenkeuze">🗺️ Ander gebied oefenen</button>' : "") +
      '<button class="btn ghost" data-nav="home">🏠 Naar huis</button>' +
      "</div>");
    confetti();
    if (newUnlocks.length || newBadges.length) { AudioFX.play("levelup"); setTimeout(function () { showNudge(randomMotivatie()); }, 600); }
    else AudioFX.play("feest");
  }

  function mijlNaam(n, totaal) { return n === 5 ? "Eerste 5!" : n >= totaal ? "Alles gekend!" : n + " gekend!"; }

  function checkUnlocksAndBadges() {
    state._justBadges = [];
    state._justUnlocks = [];
    // stickers voor nieuw gekende begrippen
    allItems().forEach(function (it) {
      if (isMastered(it.id) && state.stickers.indexOf(it.id) < 0) state.stickers.push(it.id);
    });
    LAND_IDS.forEach(function (id) {
      var L = LANDS[id], m = masteredCount(id), totaal = totaalIn(id);
      // mijlpaal-badges (West houdt zijn oude ids: "mijlpaal-5"; Noord: "noord-mijlpaal-5")
      var seen = {};
      L.mijlpalen.concat([totaal]).forEach(function (n) {
        if (seen[n]) return; seen[n] = true;
        var bid = (id === "west" ? "" : id + "-") + "mijlpaal-" + n;
        if (m >= n && state.badges.indexOf(bid) < 0) { state.badges.push(bid); state._justBadges.push(L.pre + mijlNaam(n, totaal)); }
      });
      // regio-badges
      Object.keys(L.regios).forEach(function (r) {
        var inReg = L.items.filter(function (it) { return it.regio === r && hasLabel(it); });
        if (inReg.length && inReg.every(function (it) { return isMastered(it.id); })) {
          var bid = "regio-" + r;
          if (state.badges.indexOf(bid) < 0) { state.badges.push(bid); state._justBadges.push(L.regios[r] + " compleet!"); }
        }
      });
      // winkel-unlocks bij een nieuwe drempel
      (L.gates || []).forEach(function (g) {
        if (g > 0 && m >= g && (state[L.tierKey] || 0) < g) {
          state[L.tierKey] = g;
          var nw = DATA.shop.filter(function (s) { return (s.minMastered || 0) === g && landOf(s) === id; });
          var emojis = nw.slice(0, 5).map(function (s) { return s.emoji; }).join(" ");
          state._justUnlocks.push("Nieuw in de winkel (bij " + g + " gekend" + (id === "west" ? "" : " in het Noorden") + ")! " + emojis);
        }
      });
    });
    // nieuwe plekken (bijv. Elfstedentocht) gaan open als de bijbehorende groep compleet is
    Object.keys(DATA.scenes).forEach(function (sc) {
      var cfg = DATA.scenes[sc];
      if (cfg.unlockBy && cfg.upgrade && state.badges.indexOf(cfg.unlockBy) >= 0 && !owns(cfg.upgrade)) {
        state.owned.push(cfg.upgrade);
        state._justUnlocks.push("🎉 Nieuwe plek ontgrendeld: " + cfg.emoji + " " + cfg.naam + "! Kijk bij je huis en in de winkel.");
      }
    });
  }

  // ---------------------------------------------------------------- Scherm: Winkel
  function renderWinkel() {
    tickNeeds(); save();
    function card(it) {
      var locked = isLocked(it);
      var owned = it.type !== "eten" && owns(it.id);
      var worn = it.type === "kleren" && state.equipped === it.id;
      var btn;
      if (locked) {
        btn = '<div class="lockmsg">🔒 vanaf ' + it.minMastered + " gekend" + (landOf(it) === "west" ? "" : " in het Noorden") + "</div>";
      } else if (owned) {
        btn = it.type === "kleren"
          ? '<button class="buy ' + (worn ? "on" : "") + '" data-wear="' + it.id + '">' + (worn ? "Draagt ✓" : "Draag") + "</button>"
          : it.type === "upgrade"
            ? '<button class="buy on" disabled>In bezit ✓</button>'
            : '<button class="buy on" disabled>In huis ✓</button>';
      } else {
        var canAfford = state.coins >= it.prijs;
        btn = '<button class="buy' + (canAfford ? "" : " poor") + '" data-buy="' + it.id + '">Koop</button>';
      }
      return '<div class="item' + (locked ? " locked" : "") + '"><div class="ico">' + it.emoji + "</div><div>" + esc(it.naam) +
        '</div><div class="price">' + it.prijs + " 💰</div>" + btn + "</div>";
    }
    function grid(list) { return '<div class="shopgrid">' + list.map(card).join("") + "</div>"; }
    function byType(t, lnd) { return DATA.shop.filter(function (s) { return s.type === t && landOf(s) === (lnd || "west"); }); }
    function decoScene(sc) { return DATA.shop.filter(function (s) { return s.type === "deco" && (s.scene || "huis") === sc; }); }

    // Alles wat bij het Noorden hoort: eten, kleren en de plekken die je daar vrijspeelt.
    var noordSectie = "";
    if (LANDS.noord) {
      noordSectie = "<h3>🐄 Alleen in het Noorden</h3>" +
        '<p class="info">Leer plekken in Noord-Nederland om dit vrij te spelen!</p>' +
        "<h3>🍽️ Noorderlijk eten</h3>" + grid(byType("eten", "noord")) +
        "<h3>👕 Noorderlijke kleren</h3>" + grid(byType("kleren", "noord"));
      Object.keys(DATA.scenes).forEach(function (sc) {
        var cfg = DATA.scenes[sc];
        if (!cfg.unlockBy) return;
        noordSectie += "<h3>" + cfg.emoji + " " + esc(cfg.naam) + "</h3>" +
          (sceneUnlocked(sc) ? grid(decoScene(sc)) : '<p class="info">🔒 ' + esc(cfg.hint) + "</p>");
      });
    }

    var tuinSectie = owns("tuin")
      ? "<h3>🌳 Voor in de tuin</h3>" + grid(decoScene("tuin"))
      : '<h3>🌳 Voor in de tuin</h3><p class="info">Leg eerst een 🌳 <b>Tuin</b> aan bij Upgrades!</p>';
    var bovenSectie = owns("verdieping")
      ? "<h3>🛏️ Bovenverdieping</h3>" + grid(decoScene("boven"))
      : '<h3>🛏️ Bovenverdieping</h3><p class="info">Koop eerst een 🏠 <b>Extra verdieping</b> bij Upgrades!</p>';

    h(topbar("Winkel") +
      '<div class="screen">' +
      sceneHTML(state.currentScene === "buiten" ? "huis" : state.currentScene, "shoppeek") +
      needsBars() +
      "<h3>🍽️ Eten</h3>" + grid(byType("eten")) +
      "<h3>👕 Kleren</h3>" + grid(byType("kleren")) +
      "<h3>🏠 Voor in huis</h3>" + grid(decoScene("huis")) +
      "<h3>⭐ Upgrades</h3>" + grid(byType("upgrade")) +
      tuinSectie +
      bovenSectie +
      noordSectie +
      '<div class="feedback" id="shopfb"></div>' +
      "</div>");

    appEl.querySelectorAll("[data-buy]").forEach(function (b) {
      b.addEventListener("click", function () { buy(b.getAttribute("data-buy")); });
    });
    appEl.querySelectorAll("[data-wear]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-wear");
        state.equipped = state.equipped === id ? null : id; save(); AudioFX.play("pop"); renderWinkel();
      });
    });
  }

  function buy(id) {
    var it = shopItem(id);
    if (!it) return;
    if (isLocked(it)) {
      el("shopfb").textContent = "Dit kun je kopen vanaf " + it.minMastered + " gekende begrippen — leer er nog een paar! 💪";
      AudioFX.play("fout"); return;
    }
    if (it.type !== "eten" && owns(id)) return;
    if (state.coins < it.prijs) {
      el("shopfb").textContent = "Nog niet genoeg muntjes — eerst even oefenen! 💪";
      AudioFX.play("fout"); return;
    }
    state.coins -= it.prijs;
    if (it.type === "eten") {
      state.needs.honger = clamp(state.needs.honger + 20);
      state.needs.blij = clamp(state.needs.blij + 8);
      state.needs.energie = clamp(state.needs.energie + 10);
      AudioFX.play("koop");
    } else {
      if (!owns(id)) state.owned.push(id);
      state.needs.blij = clamp(state.needs.blij + 12);
      if (it.type === "kleren") { state.equipped = id; AudioFX.play("koop"); }
      else if (it.type === "upgrade") {
        state.currentScene = it.unlockScene;
        AudioFX.play("unlock");
        showNudge("Joepie! Je hebt nu een " + it.naam.toLowerCase() + "! 🎉");
      } else { AudioFX.play("koop"); }
    }
    save(); confetti(); renderWinkel();
    el("shopfb").textContent = state.pet.naam + " is er blij mee! " + it.emoji;
  }

  // ---------------------------------------------------------------- Scherm: Album
  function renderAlbum() {
    var cats = { stad: "🏙️ Steden", water: "🌊 Wateren", gebied: "🟩 Gebieden" };
    var body = "";
    LAND_IDS.forEach(function (id) {
      var L = LANDS[id];
      if (LAND_IDS.length > 1) body += '<h2 class="landkop">' + L.emoji + " " + esc(L.naam) + "</h2>";
      Object.keys(cats).forEach(function (c) {
        var items = L.items.filter(function (it) { return it.categorie === c && hasLabel(it); });
        body += "<h3>" + cats[c] + "</h3><div class=\"album\">" + items.map(function (it) {
          var got = state.stickers.indexOf(it.id) >= 0;
          return '<div class="sticker ' + (got ? "got" : "") + '">' +
            '<div class="s-teken">' + esc(labelOf(it)) + "</div>" +
            '<div class="s-naam">' + (got ? esc(it.naam) : "???") + "</div></div>";
        }).join("") + "</div>";
      });
    });
    var badges = state.badges.length
      ? state.badges.map(function (b) { return '<span class="badge">🏅 ' + esc(badgeNaam(b)) + "</span>"; }).join("")
      : '<p class="info">Nog geen beloningen — oefen een hele regio om er een te verdienen!</p>';

    // Paspoort van het Noorden: een stempel per afgeronde groep
    var paspoort = "";
    if (NOORD) {
      var gestempeld = NOORD.paspoort.filter(function (p) { return state.badges.indexOf(p.badge) >= 0; }).length;
      paspoort = "<h3>🛂 Paspoort Noord-Nederland (" + gestempeld + " / " + NOORD.paspoort.length + ")</h3>" +
        '<div class="paspoort">' + NOORD.paspoort.map(function (p) {
          var got = state.badges.indexOf(p.badge) >= 0;
          return '<div class="stempel ' + (got ? "got" : "") + '"><div class="st-emoji">' + (got ? p.emoji : "❔") +
            '</div><div class="st-naam">' + esc(p.naam) + "</div></div>";
        }).join("") + "</div>";
    }
    h(topbar("Album") +
      '<div class="screen">' +
      "<h3>🏅 Beloningen</h3><div class=\"badges\">" + badges + "</div>" +
      paspoort +
      body + "</div>");
  }
  function badgeNaam(id) {
    if (id.indexOf("regio-") === 0) return (ALL_REGIOS[id.slice(6)] || id) + " compleet";
    var m = /^(noord-)?mijlpaal-(\d+)$/.exec(id);
    if (m) {
      var lid = m[1] ? "noord" : "west", n = +m[2];
      var pre = lid === "noord" ? "Noord: " : "";
      return pre + (n === 5 ? "Eerste 5" : (!LANDS[lid] || n >= totaalIn(lid)) ? "Alles gekend" : n + " gekend");
    }
    return id;
  }

  // ---------------------------------------------------------------- Scherm: Voor ouders
  function renderOuders() {
    var m = masteredCount(), totaal = allItems().filter(hasLabel).length;
    function statusWoord(it) {
      var p = prog(it.id);
      if (!p || !p.introduced) return '<span class="st nieuw">nog niet</span>';
      if (isMastered(it.id)) return '<span class="st gekend">gekend</span>';
      return '<span class="st lerend">lerend</span>';
    }
    var rows = LAND_IDS.map(function (id) {
      var L = LANDS[id];
      return (LAND_IDS.length > 1 ? '<tr><th colspan="3" class="landrij">' + L.emoji + " " + esc(L.naam) + " (" + masteredCount(id) + " / " + totaalIn(id) + ")</th></tr>" : "") +
        L.items.filter(hasLabel).map(function (it) {
          return "<tr><td>" + esc(it.naam) + '</td><td class="c">' + esc(labelOf(it)) + "</td><td>" + statusWoord(it) + "</td></tr>";
        }).join("");
    }).join("");
    h(topbar("Voor ouders") +
      '<div class="screen ouders">' +
      '<p class="info">Voortgang: <b>' + m + " / " + totaal + "</b> begrippen gekend. " +
      "Reeks: " + (state.streakDays || 0) + " dag(en).</p>" +
      '<div class="namebox"><input id="rename" maxlength="14" value="' + esc(state.pet.naam) + '">' +
      '<button class="btn mini" id="dorename">Naam opslaan</button></div>' +
      '<div class="namebox"><label for="coinsin">Muntjes: </label>' +
      '<input id="coinsin" type="number" inputmode="numeric" min="0" max="' + (state.coins | 0) + '" value="' + (state.coins | 0) + '">' +
      '<button class="btn mini" id="setcoins">Muntjes verlagen</button></div>' +
      '<div class="row">' +
      '<button class="btn mini" data-nav="kaart">🗺️ Kaart instellen</button>' +
      '<button class="btn mini danger" id="reset">↺ Opnieuw beginnen</button>' +
      "</div>" +
      '<table class="voortgang"><thead><tr><th>Begrip</th><th>Teken</th><th>Status</th></tr></thead><tbody>' +
      rows + "</tbody></table></div>");
    on("reset", "click", function () {
      if (confirm("Weet je het zeker? Alle voortgang en muntjes worden gewist.")) {
        state = defaultState(); save(); renderHome();
      }
    });
    on("setcoins", "click", function () {
      var n = parseInt(el("coinsin").value, 10);
      if (isNaN(n) || n < 0) return;
      if (n >= state.coins) { alert("Je kunt het aantal muntjes alleen verlagen (nu " + state.coins + ")."); return; }
      if (confirm("Muntjes verlagen van " + state.coins + " naar " + n + "?")) {
        state.coins = n; save(); AudioFX.play("pop"); renderOuders();
      }
    });
    on("dorename", "click", function () {
      var v = el("rename").value.trim();
      if (v) { state.pet.naam = v; state.pet.nameSet = true; save(); AudioFX.play("pop"); renderOuders(); }
    });
  }

  // ---------------------------------------------------------------- Scherm: Kaart instellen
  function renderKaart() {
    var secties = LAND_IDS.map(function (id) {
      var L = LANDS[id];
      var rows = L.items.map(function (it) {
        var cur = labelOf(it);
        return '<tr><td>' + esc(it.naam) + ' <small>(' + it.categorie + ')</small></td>' +
          '<td><input class="lbl" data-id="' + it.id + '" value="' + esc(cur) + '" size="4"></td></tr>';
      }).join("");
      return '<h3>' + L.emoji + " " + esc(L.naam) + "</h3>" +
        '<div class="bigmap ' + id + '"><img src="' + L.kaart + '" alt="kaart van ' + esc(L.naam) + '"></div>' +
        '<table class="voortgang"><thead><tr><th>Begrip</th><th>Teken</th></tr></thead><tbody>' +
        rows + "</tbody></table>";
    }).join("");
    h(topbar("Kaart instellen") +
      '<div class="screen ouders">' +
      '<p class="info">Vergelijk met de kaart en corrigeer waar nodig. West: de tekens komen van het ' +
      "nagekeken werkblad; <b>Utrecht (3)</b> en <b>Noordwijk (11)</b> zijn de twee om even extra te checken. " +
      "Zaanstad stond doorgestreept (leeg = doet niet mee). Noord: gecontroleerd tegen de kaart zelf.</p>" +
      secties +
      '<button class="btn play" id="kaartklaar">✓ Opslaan en terug</button>' +
      "</div>");
    appEl.querySelectorAll(".lbl").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var id = inp.getAttribute("data-id");
        state.overrides[id] = { label: inp.value.trim() };
        save();
      });
    });
    on("kaartklaar", "click", function () { save(); renderOuders(); });
  }

  // ---------------------------------------------------------------- Confetti
  var cv, ctx, parts = [], running = false;
  function initConfetti() {
    cv = document.createElement("canvas"); cv.className = "confetti";
    document.body.appendChild(cv); ctx = cv.getContext("2d"); resize();
    window.addEventListener("resize", resize);
  }
  function resize() { if (cv) { cv.width = window.innerWidth; cv.height = window.innerHeight; } }
  function confetti() {
    if (!cv) return;
    cv.style.display = "block";
    var colors = ["#ff9ec7", "#ffcb47", "#6bc9ff", "#46b358", "#b06ad6"];
    for (var i = 0; i < 70; i++) {
      parts.push({
        x: window.innerWidth / 2, y: window.innerHeight / 3,
        vx: (i % 2 ? 1 : -1) * (1 + (i % 7)), vy: -(4 + (i % 6)),
        c: colors[i % colors.length], r: 4 + (i % 4)
      });
    }
    if (!running) { running = true; tick(); }
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(function (p) { p.vy += 0.15; p.x += p.vx; p.y += p.vy; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r); });
    parts = parts.filter(function (p) { return p.y < cv.height + 20; });
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; cv.style.display = "none"; }
  }

  // ---------------------------------------------------------------- Geluid (gesynthetiseerd)
  var AudioFX = (function () {
    var ctx = null;
    function ensure() {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
      if (ctx && ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function note(freq, t0, dur, type, vol) {
      if (!ctx) return;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(ctx.destination);
      var now = ctx.currentTime + t0;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol || 0.2, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now); o.stop(now + dur + 0.03);
    }
    function play(name) {
      if (state && state.muted) return;
      if (!ensure()) return;
      switch (name) {
        case "goed":   note(660, 0, 0.13, "triangle", 0.25); note(988, 0.1, 0.2, "triangle", 0.25); break;
        case "fout":   note(320, 0, 0.16, "sine", 0.18); note(240, 0.13, 0.22, "sine", 0.18); break;
        case "munt":   note(1180, 0, 0.06, "square", 0.12); note(1570, 0.05, 0.09, "square", 0.12); break;
        case "feest":  [523, 659, 784, 1046].forEach(function (f, i) { note(f, i * 0.1, 0.22, "triangle", 0.22); }); break;
        case "pop":    note(520, 0, 0.09, "sine", 0.2); break;
        // kaching bij een aankoop
        case "koop":   note(988, 0, 0.07, "square", 0.14); note(1319, 0.06, 0.12, "square", 0.14); break;
        // iets nieuws ontgrendeld in de winkel
        case "unlock": [523, 784, 1046].forEach(function (f, i) { note(f, i * 0.07, 0.14, "triangle", 0.2); }); break;
        // level-up / nieuwe groei-stage: grote fanfare
        case "levelup":[523, 659, 784, 1046, 1319].forEach(function (f, i) { note(f, i * 0.09, 0.26, "triangle", 0.24); }); break;
        // zacht geeuwtje bij slapen
        case "slaap":  note(392, 0, 0.3, "sine", 0.18); note(294, 0.22, 0.4, "sine", 0.16); break;
        // zachte nudge
        case "nudge":  note(740, 0, 0.07, "sine", 0.14); note(880, 0.06, 0.1, "sine", 0.12); break;
      }
    }
    return { play: play, ensure: ensure };
  })();

  // ---------------------------------------------------------------- Util
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------------------------------------------------------------- Router
  var ROUTES = {
    home: renderHome, oefenen: startOefenen, winkel: renderWinkel,
    album: renderAlbum, ouders: renderOuders, kaart: renderKaart, oefenkeuze: renderOefenKeuze
  };
  var currentRoute = "home";
  function nav(route) { editMode = false; currentRoute = ROUTES[route] ? route : "home"; (ROUTES[currentRoute])(); window.scrollTo(0, 0); }

  function doAction(act) {
    if (act === "slapen") {
      state.needs.energie = clamp(state.needs.energie + 45);
      state.needs.blij = clamp(state.needs.blij + 4);
      state.lastTick = Date.now();
      save(); AudioFX.play("slaap");
      homeMsg = "Hamm… heerlijk geslapen! Ik heb weer energie ✨😴";
      renderHome();
    }
  }

  function init() {
    appEl = document.getElementById("app");
    load(); initConfetti();
    // demo-modus (?demo) voor testen: rijke, niet-opgeslagen staat
    if (/[?&]demo/.test(location.search)) {
      demoMode = true;
      state.coins = 9999; state.unlockedCount = DATA.items.length;
      if (NOORD) state.unlockedNoord = NOORD.items.length;
      DATA.items.slice(0, 26).forEach(function (it) { state.progress[it.id] = { box: 5, goed: 9, fout: 0, dueAt: 0, introduced: true }; });
      if (NOORD) NOORD.items.forEach(function (it) { state.progress[it.id] = { box: 5, goed: 9, fout: 0, dueAt: 0, introduced: true }; });
      state.owned = DATA.shop.filter(function (s) { return s.type !== "eten"; }).map(function (s) { return s.id; });
      Object.keys(DATA.scenes).forEach(function (sc) { if (DATA.scenes[sc].upgrade && !owns(DATA.scenes[sc].upgrade)) state.owned.push(DATA.scenes[sc].upgrade); });
      state.shopTier = 30; state.shopTierNoord = 30;
    }
    document.body.addEventListener("click", function (e) {
      AudioFX.ensure(); // audio ontgrendelen bij eerste klik
      var mt = e.target.closest("[data-mute]");
      if (mt) { state.muted = !state.muted; save(); mt.textContent = state.muted ? "🔇" : "🔊"; if (!state.muted) AudioFX.play("pop"); return; }
      var ed = e.target.closest("[data-edit]");
      if (ed) {
        var a = ed.getAttribute("data-edit");
        if (a === "on") editMode = true;
        else if (a === "off") editMode = false;
        else if (a === "reset") {
          DATA.shop.forEach(function (s) { if (s.type === "deco" && (s.scene || "huis") === state.currentScene) delete state.pos[s.id]; });
        }
        save(); AudioFX.play("pop"); renderHome(); return;
      }
      var sc = e.target.closest("[data-scene]");
      if (sc) { editMode = false; state.currentScene = sc.getAttribute("data-scene"); save(); AudioFX.play("pop"); renderHome(); return; }
      var ac = e.target.closest("[data-act]");
      if (ac) { doAction(ac.getAttribute("data-act")); return; }
      var t = e.target.closest("[data-nav]");
      if (t) nav(t.getAttribute("data-nav"));
    });
    document.addEventListener("pointerdown", function (e) {
      var o = e.target.closest && e.target.closest(".scene.editing .deco-obj");
      if (!o) return;
      e.preventDefault();
      var scene = o.parentNode, id = o.getAttribute("data-deco");
      try { o.setPointerCapture(e.pointerId); } catch (x) {}
      o.classList.add("drag"); AudioFX.play("pop");
      function move(ev) {
        var r = scene.getBoundingClientRect();
        var x = Math.max(4, Math.min(96, (ev.clientX - r.left) / r.width * 100));
        var y = Math.max(6, Math.min(96, (ev.clientY - r.top) / r.height * 100));
        o.style.left = x + "%"; o.style.top = y + "%";
        o._p = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
      }
      function up() {
        o.removeEventListener("pointermove", move);
        o.removeEventListener("pointerup", up);
        o.removeEventListener("pointercancel", up);
        o.classList.remove("drag");
        if (o._p) { state.pos[id] = o._p; save(); AudioFX.play("pop"); }
      }
      o.addEventListener("pointermove", move);
      o.addEventListener("pointerup", up);
      o.addEventListener("pointercancel", up);
    });
    var scm = /[?&]scene=([a-z]+)/.exec(location.search);
    if (scm && DATA.scenes[scm[1]] && sceneUnlocked(scm[1])) state.currentScene = scm[1];
    // deep-link voor testen/bladwijzers: ?screen=oefenen|winkel|album|ouders
    var m = /[?&]screen=([a-z]+)/.exec(location.search);
    if (m && ROUTES[m[1]]) nav(m[1]); else renderHome();
    // service worker alleen op http(s) + "nieuwe versie"-detectie
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        if (reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg);
        reg.addEventListener("updatefound", function () {
          var nw = reg.installing; if (!nw) return;
          nw.addEventListener("statechange", function () {
            if (nw.state === "installed" && navigator.serviceWorker.controller) showUpdateBanner(reg);
          });
        });
      }).catch(function () {});
      var refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (refreshing) return; refreshing = true; location.reload();
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
