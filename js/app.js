/* Topo-huisdier — spel-logica en schermen (geen build-stap, pure JS).
 * Werkt zowel lokaal (index.html dubbelklikken) als op GitHub Pages. */
(function () {
  "use strict";

  var DATA = window.TOPO_DATA;
  var SAVE_KEY = "topo-huisdier-v1";
  var QUESTIONS_PER_ROUND = 8;
  var MASTER_BOX = 4; // box >= 4 => "gekend"

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
      pet: { soort: "beerdiertje", naam: DATA.pet.standaardNaam, nameSet: false },
      coins: 30,
      xp: 0,
      needs: { blij: 70, honger: 60, energie: 70 },
      lastTick: Date.now(),
      owned: [],        // gekochte kleren/deco (ids)
      equipped: null,   // gedragen kleren-id
      deco: [],         // geplaatste deco-ids
      progress: {},     // id -> {box, goed, fout, dueAt, introduced}
      unlockedCount: 5,
      streakDays: 0,
      lastPlayDay: null,
      badges: [],
      stickers: [],     // ids van gekende begrippen
      overrides: {},    // id -> {label}
      muted: false      // geluid aan/uit
    };
    for (var i = 0; i < s.unlockedCount && i < DATA.items.length; i++) {
      var it = DATA.items[i];
      s.progress[it.id] = { box: 1, goed: 0, fout: 0, dueAt: 0, introduced: true };
    }
    return s;
  }

  var state;
  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) {}
    state = defaultState();
  }
  function save() {
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
  function isMastered(id) { var p = prog(id); return !!p && p.box >= MASTER_BOX; }
  function masteredCount() {
    return DATA.items.filter(function (it) { return isMastered(it.id); }).length;
  }

  // Begrippen die meedoen in de quiz: ontgrendeld, geïntroduceerd en met een teken
  function activeItems() {
    return DATA.items.slice(0, state.unlockedCount).filter(function (it) {
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
  function maybeUnlock() {
    var newlyUnlocked = [];
    while (state.unlockedCount < DATA.items.length) {
      var pool = DATA.items.slice(0, state.unlockedCount).filter(hasLabel);
      var mastered = pool.filter(function (it) { return isMastered(it.id); }).length;
      // nieuw begrip zodra bijna de hele set gekend is (buffer 1)
      if (pool.length === 0 || mastered >= pool.length - 1) {
        state.unlockedCount++;
        var nw = DATA.items[state.unlockedCount - 1];
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
    var pool = activeItems();
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
    var same = DATA.items.filter(function (it) {
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
      var any = shuffle(DATA.items.filter(function (it) { return it.id !== item.id && hasLabel(it); }));
      for (var m = 0; m < any.length && out.length < 3; m++) {
        var v = field === "naam" ? any[m].naam : labelOf(any[m]);
        if (!seen[v]) { seen[v] = true; out.push(v); }
      }
    }
    return out;
  }

  function catWoord(c) { return c === "stad" ? "plaats" : c === "water" ? "water" : "gebied"; }

  function makeQuestion(item) {
    var box = prog(item.id).box;
    // nieuwe/moeilijke begrippen: herkennen (teken -> naam). anders afwisselen.
    var mode = box <= 1 ? "tekenNaarNaam" : (Math.random() < 0.5 ? "tekenNaarNaam" : "naamNaarTeken");
    var q;
    if (mode === "tekenNaarNaam") {
      q = {
        item: item, mode: mode,
        vraag: "Welke " + catWoord(item.categorie) + " is " + labelOf(item) + "?",
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
    var mouth = blij >= 60
      ? "M78 104 Q100 124 122 104"          // blij
      : blij >= 35
        ? "M80 110 H120"                      // neutraal
        : "M78 114 Q100 100 122 114";        // slaperig
    var eyeOpen = blij >= 35;
    var body = "#c6d18a", edge = "#9aa86a", belly = "#dde7b4";
    var legs = "";
    for (var i = 0; i < 4; i++) {
      var lx = 55 + i * 22;
      legs += '<ellipse cx="' + lx + '" cy="140" rx="9" ry="13" fill="' + body + '" stroke="' + edge + '" stroke-width="2"/>';
    }
    var eyes = eyeOpen
      ? '<circle cx="86" cy="86" r="8" fill="#fff"/><circle cx="114" cy="86" r="8" fill="#fff"/>' +
        '<circle cx="88" cy="88" r="4" fill="#333"/><circle cx="116" cy="88" r="4" fill="#333"/>'
      : '<path d="M80 88 Q86 82 92 88" stroke="#333" stroke-width="3" fill="none"/>' +
        '<path d="M108 88 Q114 82 120 88" stroke="#333" stroke-width="3" fill="none"/>';
    var crown = st === "meester" ? '<text x="100" y="34" font-size="30" text-anchor="middle">👑</text>' : "";
    var hat = "";
    if (state.equipped) {
      var it = DATA.shop.filter(function (s) { return s.id === state.equipped; })[0];
      if (it) hat = '<text x="100" y="40" font-size="34" text-anchor="middle">' + it.emoji + "</text>";
    }
    var sparkle = st === "meester" ? '<text x="28" y="60" font-size="22">✨</text><text x="156" y="70" font-size="22">✨</text>' : "";
    return '<svg viewBox="0 0 200 170" class="pet-svg" style="transform:scale(' + scale + ')">' +
      sparkle + legs +
      '<ellipse cx="100" cy="100" rx="62" ry="46" fill="' + body + '" stroke="' + edge + '" stroke-width="3"/>' +
      '<ellipse cx="100" cy="110" rx="40" ry="26" fill="' + belly + '"/>' +
      '<path d="M55 78 Q100 70 145 78" stroke="' + edge + '" stroke-width="2" fill="none" opacity=".5"/>' +
      '<path d="M52 100 Q100 94 148 100" stroke="' + edge + '" stroke-width="2" fill="none" opacity=".5"/>' +
      eyes +
      '<path d="' + mouth + '" stroke="#7a5" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      crown + hat +
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

  // ---------------------------------------------------------------- Scherm: Home
  function renderHome() {
    tickNeeds(); save();
    var st = stage();
    var m = masteredCount(), totaal = DATA.items.filter(hasLabel).length;
    var greet = state.needs.honger < 40 ? "Ik heb een beetje honger… zullen we muntjes verdienen? 🍪"
      : state.needs.blij < 40 ? "Ik verveel me een beetje. Spelen? 🎲"
        : "Hoi! Zullen we samen de kaart oefenen? 🗺️";

    var nameBlock = state.pet.nameSet ? "" :
      '<div class="namebox"><input id="petname" placeholder="Naam voor je beertje" maxlength="14" value="' +
      state.pet.naam + '"><button class="btn mini" id="savename">Opslaan</button></div>';

    h(topbar("Topo-huisdier") +
      '<div class="screen">' +
      '<div class="petyard">' + petSVG() +
      '<div class="petname">' + esc(state.pet.naam) + ' — <span>' + st.naam + "</span></div>" +
      '<div class="speech">' + greet + "</div>" + nameBlock + "</div>" +
      needsBars() +
      '<div class="progress-line">🎓 ' + m + " / " + totaal + " gekend</div>" +
      '<button class="btn play" data-nav="oefenen">▶ Ga oefenen</button>' +
      '<div class="row">' +
      '<button class="btn shop" data-nav="winkel">🛍️ Winkel</button>' +
      '<button class="btn album" data-nav="album">📒 Album</button>' +
      "</div>" +
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
        '<div class="bigmap"><img src="assets/kaart.jpg" alt="kaart"></div>' +
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

  function startOefenen() {
    var newly = maybeUnlock();
    // zorg dat zichtbare begrippen ook echt 'introduced' zijn
    DATA.items.slice(0, state.unlockedCount).forEach(function (it) {
      var p = prog(it.id);
      if (p && !p.introduced && hasLabel(it)) { /* via intro */ }
    });
    save();
    if (newly.length) { showIntros(newly, beginRound); }
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
      '<div class="bigmap"><img src="assets/kaart.jpg" alt="kaart van West-Nederland"></div>' +
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
    var p = prog(q.item.id);
    if (correct) {
      sStreak++; sCorrect++;
      var bonus = sStreak >= 2 ? Math.min(10, (sStreak - 1) * 2) : 0;
      var gain = 10 + bonus;
      sEarned += gain; state.coins += gain; state.xp += 5;
      state.needs.blij = clamp(state.needs.blij + 3);
      schedule(p, true);
      el("fb").innerHTML = '<span class="ok">🎉 Goed! +' + gain + " 💰" + (bonus ? " (reeks-bonus!)" : "") + "</span>";
      AudioFX.play("goed"); setTimeout(function () { AudioFX.play("munt"); }, 140);
      confetti();
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
    h(topbar("Goed gedaan!") +
      '<div class="screen">' +
      '<div class="petyard">' + petSVG() +
      '<div class="petname">Super, ' + esc(state.pet.naam) + ' is blij! 🎉</div>' +
      '<div class="speech">Je had <b>' + sCorrect + " / " + session.length +
      "</b> goed en verdiende <b>" + sEarned + " 💰</b>.</div></div>" +
      (state.streakDays > 1 ? '<div class="progress-line">🔥 ' + state.streakDays + " dagen op rij geoefend!</div>" : "") +
      (newBadges.length ? '<div class="newbadges">Nieuwe beloning: ' + newBadges.map(esc).join(", ") + " 🏅</div>" : "") +
      '<button class="btn shop" data-nav="winkel">🛍️ Muntjes uitgeven</button>' +
      '<button class="btn play" data-nav="oefenen">▶ Nog een rondje</button>' +
      '<button class="btn ghost" data-nav="home">🏠 Naar huis</button>' +
      "</div>");
    confetti(); AudioFX.play("feest");
  }

  function checkUnlocksAndBadges() {
    state._justBadges = [];
    // stickers voor nieuw gekende begrippen
    DATA.items.forEach(function (it) {
      if (isMastered(it.id) && state.stickers.indexOf(it.id) < 0) state.stickers.push(it.id);
    });
    // mijlpaal-badges
    var m = masteredCount();
    [[5, "Eerste 5!"], [15, "15 gekend!"], [30, "30 gekend!"], [DATA.items.filter(hasLabel).length, "Alles gekend!"]]
      .forEach(function (mb) {
        var id = "mijlpaal-" + mb[0];
        if (m >= mb[0] && state.badges.indexOf(id) < 0) { state.badges.push(id); state._justBadges.push(mb[1]); }
      });
    // regio-badges
    Object.keys(DATA.regios).forEach(function (r) {
      var inReg = DATA.items.filter(function (it) { return it.regio === r && hasLabel(it); });
      if (inReg.length && inReg.every(function (it) { return isMastered(it.id); })) {
        var id = "regio-" + r;
        if (state.badges.indexOf(id) < 0) { state.badges.push(id); state._justBadges.push(DATA.regios[r] + " compleet!"); }
      }
    });
  }

  // ---------------------------------------------------------------- Scherm: Winkel
  function renderWinkel() {
    tickNeeds(); save();
    function card(it) {
      var owned = it.type !== "eten" && state.owned.indexOf(it.id) >= 0;
      var worn = state.equipped === it.id;
      var btn = it.type === "eten"
        ? '<button class="buy" data-buy="' + it.id + '">Koop</button>'
        : owned
          ? (it.type === "kleren"
            ? '<button class="buy ' + (worn ? "on" : "") + '" data-wear="' + it.id + '">' + (worn ? "Draagt ✓" : "Draag") + "</button>"
            : '<button class="buy on" disabled>In huis ✓</button>')
          : '<button class="buy" data-buy="' + it.id + '">Koop</button>';
      return '<div class="item"><div class="ico">' + it.emoji + "</div><div>" + it.naam +
        '</div><div class="price">' + it.prijs + " 💰</div>" + btn + "</div>";
    }
    function sectie(type, titel) {
      return "<h3>" + titel + "</h3><div class=\"shopgrid\">" +
        DATA.shop.filter(function (s) { return s.type === type; }).map(card).join("") + "</div>";
    }
    h(topbar("Winkel") +
      '<div class="screen">' +
      '<div class="petyard small">' + petSVG() + "</div>" +
      needsBars() +
      sectie("eten", "🍽️ Eten") +
      sectie("kleren", "👕 Kleren") +
      sectie("deco", "🏠 Voor in huis") +
      '<div class="feedback" id="shopfb"></div>' +
      "</div>");

    appEl.querySelectorAll("[data-buy]").forEach(function (b) {
      b.addEventListener("click", function () { buy(b.getAttribute("data-buy")); });
    });
    appEl.querySelectorAll("[data-wear]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-wear");
        state.equipped = state.equipped === id ? null : id; save(); renderWinkel();
      });
    });
  }

  function buy(id) {
    var it = DATA.shop.filter(function (s) { return s.id === id; })[0];
    if (!it) return;
    if (state.coins < it.prijs) { el("shopfb").textContent = "Nog niet genoeg muntjes — eerst even oefenen! 💪"; return; }
    state.coins -= it.prijs;
    if (it.type === "eten") {
      state.needs.honger = clamp(state.needs.honger + 20);
      state.needs.blij = clamp(state.needs.blij + 8);
    } else {
      if (state.owned.indexOf(id) < 0) state.owned.push(id);
      if (it.type === "kleren") state.equipped = id;
      else if (state.deco.indexOf(id) < 0) state.deco.push(id);
      state.needs.blij = clamp(state.needs.blij + 12);
    }
    save(); confetti(); AudioFX.play("munt"); renderWinkel();
    el("shopfb").textContent = state.pet.naam + " is er blij mee! " + it.emoji;
  }

  // ---------------------------------------------------------------- Scherm: Album
  function renderAlbum() {
    var cats = { stad: "🏙️ Steden", water: "🌊 Wateren", gebied: "🟩 Gebieden" };
    var body = "";
    Object.keys(cats).forEach(function (c) {
      var items = DATA.items.filter(function (it) { return it.categorie === c && hasLabel(it); });
      body += "<h3>" + cats[c] + "</h3><div class=\"album\">" + items.map(function (it) {
        var got = state.stickers.indexOf(it.id) >= 0;
        return '<div class="sticker ' + (got ? "got" : "") + '">' +
          '<div class="s-teken">' + esc(labelOf(it)) + "</div>" +
          '<div class="s-naam">' + (got ? esc(it.naam) : "???") + "</div></div>";
      }).join("") + "</div>";
    });
    var badges = state.badges.length
      ? state.badges.map(function (b) { return '<span class="badge">🏅 ' + esc(badgeNaam(b)) + "</span>"; }).join("")
      : '<p class="info">Nog geen beloningen — oefen een hele regio om er een te verdienen!</p>';
    h(topbar("Album") +
      '<div class="screen">' +
      "<h3>🏅 Beloningen</h3><div class=\"badges\">" + badges + "</div>" +
      body + "</div>");
  }
  function badgeNaam(id) {
    if (id.indexOf("regio-") === 0) return (DATA.regios[id.slice(6)] || id) + " compleet";
    if (id === "mijlpaal-5") return "Eerste 5";
    if (id === "mijlpaal-15") return "15 gekend";
    if (id === "mijlpaal-30") return "30 gekend";
    return "Alles gekend";
  }

  // ---------------------------------------------------------------- Scherm: Voor ouders
  function renderOuders() {
    var m = masteredCount(), totaal = DATA.items.filter(hasLabel).length;
    function statusWoord(it) {
      var p = prog(it.id);
      if (!p || !p.introduced) return '<span class="st nieuw">nog niet</span>';
      if (isMastered(it.id)) return '<span class="st gekend">gekend</span>';
      return '<span class="st lerend">lerend</span>';
    }
    var rows = DATA.items.filter(hasLabel).map(function (it) {
      return "<tr><td>" + esc(it.naam) + '</td><td class="c">' + esc(labelOf(it)) + "</td><td>" + statusWoord(it) + "</td></tr>";
    }).join("");
    h(topbar("Voor ouders") +
      '<div class="screen ouders">' +
      '<p class="info">Voortgang: <b>' + m + " / " + totaal + "</b> begrippen gekend. " +
      "Reeks: " + (state.streakDays || 0) + " dag(en).</p>" +
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
  }

  // ---------------------------------------------------------------- Scherm: Kaart instellen
  function renderKaart() {
    var rows = DATA.items.map(function (it) {
      var cur = labelOf(it);
      return '<tr><td>' + esc(it.naam) + ' <small>(' + it.categorie + ')</small></td>' +
        '<td><input class="lbl" data-id="' + it.id + '" value="' + esc(cur) + '" size="4"></td></tr>';
    }).join("");
    h(topbar("Kaart instellen") +
      '<div class="screen ouders">' +
      '<p class="info">Vergelijk met de kaart en corrigeer waar nodig. De tekens komen van het ' +
      "nagekeken werkblad; <b>Utrecht (3)</b> en <b>Noordwijk (11)</b> zijn de twee om even extra te checken. " +
      "Zaanstad stond doorgestreept (leeg = doet niet mee).</p>" +
      '<div class="bigmap"><img src="assets/kaart.jpg" alt="kaart"></div>' +
      '<table class="voortgang"><thead><tr><th>Begrip</th><th>Teken</th></tr></thead><tbody>' +
      rows + "</tbody></table>" +
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
      }
    }
    return { play: play, ensure: ensure };
  })();

  // ---------------------------------------------------------------- Util
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------------------------------------------------------------- Router
  var ROUTES = {
    home: renderHome, oefenen: startOefenen, winkel: renderWinkel,
    album: renderAlbum, ouders: renderOuders, kaart: renderKaart
  };
  var currentRoute = "home";
  function nav(route) { currentRoute = ROUTES[route] ? route : "home"; (ROUTES[currentRoute])(); window.scrollTo(0, 0); }

  function init() {
    appEl = document.getElementById("app");
    load(); initConfetti();
    document.body.addEventListener("click", function (e) {
      AudioFX.ensure(); // audio ontgrendelen bij eerste klik
      var mt = e.target.closest("[data-mute]");
      if (mt) { state.muted = !state.muted; save(); mt.textContent = state.muted ? "🔇" : "🔊"; if (!state.muted) AudioFX.play("pop"); return; }
      var t = e.target.closest("[data-nav]");
      if (t) nav(t.getAttribute("data-nav"));
    });
    // deep-link voor testen/bladwijzers: ?screen=oefenen|winkel|album|ouders
    var m = /[?&]screen=([a-z]+)/.exec(location.search);
    if (m && ROUTES[m[1]]) nav(m[1]); else renderHome();
    // service worker alleen op http(s)
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
