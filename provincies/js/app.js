/* Topo per provincie — kaart links, namenlijst rechts (tonen/verbergen),
 * bladeren per provincie, en de namen als liedje voorlezen.
 *
 * Bewust los van de hoofd-app (eigen scherm, eigen scope), maar met dezelfde
 * data en kaart. Label-aanpassingen die ouders in de hoofd-app maakten
 * ("Voor ouders > Kaart instellen", opgeslagen onder topo-huisdier-v1) worden
 * hier hergebruikt — zelfde origin, dus zelfde localStorage. */
(function () {
  "use strict";

  var DATA = window.TOPO_DATA;
  var app = document.getElementById("app");

  // Volgorde waarin we de groepen tonen. Eerst de vier provincies, dan de
  // wateren en gebieden (die staan met Romeinse cijfers/letters op de kaart).
  var ORDER = ["noord-holland", "zuid-holland", "utrecht", "zeeland", "water", "gebied"];
  var GROEP_EMOJI = {
    "noord-holland": "🌷", "zuid-holland": "🚢", "utrecht": "🗼",
    "zeeland": "🦪", "water": "🌊", "gebied": "🗺️"
  };

  // Alleen groepen die echt in de data zitten.
  var groepen = ORDER.filter(function (k) { return DATA.regios && DATA.regios[k]; });

  // ---- label-overrides uit de hoofd-app (zelfde origin) ----
  var overrides = {};
  try {
    var raw = localStorage.getItem("topo-huisdier-v1");
    if (raw) { var saved = JSON.parse(raw); overrides = (saved && saved.overrides) || {}; }
  } catch (e) { overrides = {}; }

  function labelOf(item) {
    var o = overrides[item.id];
    if (o && typeof o.label === "string") return o.label;
    return item.label;
  }
  function coordOf(item) { return (DATA.coords && DATA.coords[item.id]) || null; }

  // Items van een groep, met een niet-leeg label. Standaard op nummer; als er een
  // eigen volgorde bewaard is, die aanhouden (nieuwe items vallen achteraan terug
  // op de nummervolgorde).
  function itemsVan(groep) {
    var lijst = DATA.items.filter(function (it) { return it.regio === groep && labelOf(it).trim() !== ""; });
    var ord = ui.volgorde[groep];
    if (ord && ord.length) {
      var pos = {};
      ord.forEach(function (id, i) { pos[id] = i; });
      lijst.sort(function (a, b) {
        var pa = (a.id in pos) ? pos[a.id] : 1e6, pb = (b.id in pos) ? pos[b.id] : 1e6;
        if (pa !== pb) return pa - pb;
        return sortKey(labelOf(a)) - sortKey(labelOf(b));
      });
    } else {
      lijst.sort(function (a, b) { return sortKey(labelOf(a)) - sortKey(labelOf(b)); });
    }
    return lijst;
  }

  function verplaats(groep, id, delta) {
    var ids = itemsVan(groep).map(function (it) { return it.id; });
    var i = ids.indexOf(id), j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return;
    ids.splice(i, 1); ids.splice(j, 0, id);
    ui.volgorde[groep] = ids;
    bewaar(); render();
  }
  function herstelVolgorde(groep) {
    delete ui.volgorde[groep];
    bewaar(); render();
  }

  // Sorteersleutel: "1".."26" -> getal, "I".."X" -> Romeins getal, "A".."G" -> letter.
  function sortKey(lbl) {
    lbl = (lbl || "").trim();
    if (/^\d+$/.test(lbl)) return parseInt(lbl, 10);
    if (/^[IVXLCDM]+$/i.test(lbl)) return romanToInt(lbl);
    return lbl.toUpperCase().charCodeAt(0);
  }
  function romanToInt(s) {
    var m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }, t = 0;
    s = s.toUpperCase();
    for (var i = 0; i < s.length; i++) {
      var c = m[s[i]] || 0, n = m[s[i + 1]] || 0;
      t += c < n ? -c : c;
    }
    return t;
  }

  // ---- toestand ----
  var PK = "topo-provincies-v1";
  // volgorde = eigen namenvolgorde per groep ({groep: [id,...]}); sorteerModus is sessie-only.
  var ui = { groepIdx: 0, toonNamen: true, gespiekt: {}, herhaal: true, toonBolletjes: true, volgorde: {}, sorteerModus: false };
  try {
    var ps = JSON.parse(localStorage.getItem(PK) || "{}");
    if (typeof ps.groepIdx === "number" && ps.groepIdx >= 0 && ps.groepIdx < groepen.length) ui.groepIdx = ps.groepIdx;
    if (typeof ps.toonNamen === "boolean") ui.toonNamen = ps.toonNamen;
    if (typeof ps.herhaal === "boolean") ui.herhaal = ps.herhaal;
    if (typeof ps.toonBolletjes === "boolean") ui.toonBolletjes = ps.toonBolletjes;
    if (ps.volgorde && typeof ps.volgorde === "object") ui.volgorde = ps.volgorde;
  } catch (e) {}
  function bewaar() {
    try {
      localStorage.setItem(PK, JSON.stringify({
        groepIdx: ui.groepIdx, toonNamen: ui.toonNamen, herhaal: ui.herhaal,
        toonBolletjes: ui.toonBolletjes, volgorde: ui.volgorde
      }));
    } catch (e) {}
  }
  function groepHuidig() { return groepen[ui.groepIdx]; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ga(delta) {
    stopZingen();
    stopAfspelen();
    stopOpnameStil();
    ui.groepIdx = (ui.groepIdx + delta + groepen.length) % groepen.length;
    ui.gespiekt = {};
    bewaar();
    render();
  }

  function render() {
    var groep = groepen[ui.groepIdx];
    var naam = DATA.regios[groep];
    var items = itemsVan(groep);
    var emoji = GROEP_EMOJI[groep] || "📍";

    // kaart met genummerde markeringen voor deze groep (alleen waar coords bestaan,
    // en alleen als de bolletjes-switch aan staat)
    var markers = ui.toonBolletjes ? items.map(function (it) {
      var c = coordOf(it);
      if (!c) return "";
      return '<button class="pin" data-id="' + esc(it.id) + '" style="left:' + (c[0] * 100) +
        "%;top:" + (c[1] * 100) + '%" aria-label="' + esc(it.naam) + '">' + esc(labelOf(it)) + "</button>";
    }).join("") : "";

    // namenlijst (tabel). In sorteer-modus: namen altijd zichtbaar + ▲▼ om te ordenen.
    var laatste = items.length - 1;
    var rijen = items.map(function (it, i) {
      if (ui.sorteerModus) {
        return '<tr class="rij sort" data-id="' + esc(it.id) + '">' +
          '<td class="num">' + esc(labelOf(it)) + "</td>" +
          '<td class="naam"><span class="nm">' + esc(it.naam) + "</span></td>" +
          '<td class="ord">' +
            '<button class="arrow up" data-id="' + esc(it.id) + '"' + (i === 0 ? " disabled" : "") + ">▲</button>" +
            '<button class="arrow down" data-id="' + esc(it.id) + '"' + (i === laatste ? " disabled" : "") + ">▼</button>" +
          "</td></tr>";
      }
      var zichtbaar = ui.toonNamen || ui.gespiekt[it.id];
      var cel = zichtbaar
        ? '<span class="nm">' + esc(it.naam) + "</span>"
        : '<span class="nm hidden">tik om te zien</span>';
      return '<tr class="rij" data-id="' + esc(it.id) + '">' +
        '<td class="num">' + esc(labelOf(it)) + "</td>" +
        '<td class="naam">' + cel + "</td></tr>";
    }).join("");

    app.innerHTML =
      '<div class="topbar">' +
        '<a class="back" href="../index.html" title="Naar de oefen-app">←</a>' +
        "<b>Topo per provincie</b>" +
        '<span class="sp"></span>' +
      "</div>" +

      '<div class="screen">' +

        // provincie-kiezer (chips)
        '<div class="chips">' + groepen.map(function (g, i) {
          return '<button class="chip' + (i === ui.groepIdx ? " on" : "") + '" data-i="' + i + '">' +
            (GROEP_EMOJI[g] || "") + " " + esc(DATA.regios[g]) + "</button>";
        }).join("") + "</div>" +

        '<div class="layout">' +

          // links: kaart
          '<div class="col map">' +
            '<div class="maptools">' +
              '<button class="btn bol' + (ui.toonBolletjes ? " on" : "") + '">🔴 Bolletjes: ' + (ui.toonBolletjes ? "aan" : "uit") + "</button>" +
            "</div>" +
            '<div class="bigmap"><img src="assets/kaart.jpg" alt="kaart van West-Nederland">' + markers + "</div>" +
            (!ui.toonBolletjes
              ? '<p class="note">Bolletjes uit — je ziet de kale kaart.</p>'
              : '<p class="note">Tik op een teken op de kaart om die naam even te zien.</p>') +
          "</div>" +

          // rechts: namenlijst
          '<div class="col list">' +
            '<div class="listhead">' +
              "<h2>" + emoji + " " + esc(naam) + " <span class=\"count\">(" + items.length + ")</span></h2>" +
              (ui.sorteerModus
                ? '<div class="tools">' +
                    '<button class="btn sortdone">✓ Klaar met ordenen</button>' +
                    '<button class="btn ghost reset">↺ Herstel nummervolgorde</button>' +
                  "</div>" +
                  '<p class="note">Zet de namen met ▲▼ in jullie liedjes-volgorde. Dit wordt onthouden.</p>'
                : '<div class="tools">' +
                    '<button class="btn toggle">' + (ui.toonNamen ? "🙈 Verberg namen" : "👀 Toon namen") + "</button>" +
                    '<button class="btn sing">🎵 Zing de namen</button>' +
                    '<button class="btn order">✏️ Volgorde aanpassen</button>' +
                  "</div>") +
            "</div>" +
            '<table class="tbl"><tbody>' + rijen + "</tbody></table>" +
          "</div>" +

        "</div>" + // layout

        // eigen liedje opnemen/afspelen
        '<div class="songcard">' +
          '<div class="songhead">🎤 Ons liedje — ' + esc(naam) + "</div>" +
          '<div id="songbody" class="songbody"><p class="note">Even laden…</p></div>' +
        "</div>" +

        // bladeren
        '<div class="nav">' +
          '<button class="btn nav-prev">◀ Vorige</button>' +
          '<span class="pos">' + (ui.groepIdx + 1) + " / " + groepen.length + "</span>" +
          '<button class="btn nav-next">Volgende ▶</button>' +
        "</div>" +

      "</div>"; // screen

    bind(items);
  }

  function bind(items) {
    app.querySelector(".nav-prev").onclick = function () { ga(-1); };
    app.querySelector(".nav-next").onclick = function () { ga(1); };

    var chips = app.querySelectorAll(".chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].onclick = function () {
        stopZingen(); stopAfspelen(); stopOpnameStil();
        ui.groepIdx = parseInt(this.getAttribute("data-i"), 10);
        ui.gespiekt = {}; bewaar(); render();
      };
    }

    // bolletjes aan/uit
    app.querySelector(".bol").onclick = function () {
      ui.toonBolletjes = !ui.toonBolletjes; bewaar(); render();
    };

    var grp = groepHuidig();

    if (ui.sorteerModus) {
      app.querySelector(".sortdone").onclick = function () { ui.sorteerModus = false; render(); };
      app.querySelector(".reset").onclick = function () {
        if (confirm("Terug naar de volgorde op nummer?")) herstelVolgorde(grp);
      };
      var arrows = app.querySelectorAll(".arrow");
      for (var a = 0; a < arrows.length; a++) {
        arrows[a].onclick = function (e) {
          e.stopPropagation();
          verplaats(grp, this.getAttribute("data-id"), this.classList.contains("up") ? -1 : 1);
        };
      }
    } else {
      app.querySelector(".toggle").onclick = function () {
        ui.toonNamen = !ui.toonNamen;
        ui.gespiekt = {}; bewaar(); render();
      };
      app.querySelector(".sing").onclick = function () {
        if (zingtNu()) stopZingen(); else zingNamen(items);
      };
      app.querySelector(".order").onclick = function () {
        stopZingen(); ui.sorteerModus = true; ui.gespiekt = {}; render();
      };

      // rij aantikken = die ene naam spieken (toggle)
      var rijen = app.querySelectorAll(".rij");
      for (var r = 0; r < rijen.length; r++) {
        rijen[r].onclick = function () { spiek(this.getAttribute("data-id")); };
      }

      // teken op de kaart aantikken = naam spieken + rij oplichten
      var pins = app.querySelectorAll(".pin");
      for (var p = 0; p < pins.length; p++) {
        pins[p].onclick = function () { spiek(this.getAttribute("data-id"), true); };
      }
    }

    laadLiedje(grp);
  }

  function spiek(id, flash) {
    if (ui.toonNamen) return; // al zichtbaar
    ui.gespiekt[id] = !ui.gespiekt[id];
    render();
    if (flash) {
      var row = app.querySelector('.rij[data-id="' + id + '"]');
      if (row) { row.classList.add("flash"); row.scrollIntoView({ block: "nearest" }); }
    }
  }

  // ---- namen voorlezen (hulp bij het liedje maken) ----
  var zingen = false;
  function zingtNu() { return zingen; }
  function stopZingen() {
    zingen = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    var b = app.querySelector(".sing");
    if (b) b.textContent = "🎵 Zing de namen";
  }
  function nlStem() {
    if (!window.speechSynthesis) return null;
    var vs = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < vs.length; i++) if (/nl([-_]|$)/i.test(vs[i].lang)) return vs[i];
    return null;
  }
  function zingNamen(items) {
    if (!window.speechSynthesis) { alert("Voorlezen werkt niet op dit apparaat."); return; }
    zingen = true;
    var b = app.querySelector(".sing");
    if (b) b.textContent = "⏹ Stop";
    var stem = nlStem();
    var namen = items.map(function (it) { return it.naam; });
    var idx = 0;
    function volgende() {
      if (!zingen || idx >= namen.length) { stopZingen(); return; }
      var u = new SpeechSynthesisUtterance(namen[idx]);
      u.lang = "nl-NL";
      if (stem) u.voice = stem;
      u.rate = 0.9; u.pitch = 1.1;
      u.onend = function () { idx++; setTimeout(volgende, 350); };
      u.onerror = function () { stopZingen(); };
      window.speechSynthesis.speak(u);
    }
    volgende();
  }
  // stemmen laden soms pas na een event
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = function () {};

  // ---- eigen liedje opnemen / bewaren / afspelen ----
  // Opnames staan per provincie in IndexedDB (zelfde origin, offline, overleeft
  // herstart). De herhaal-stand laat de opname steeds opnieuw afspelen (loop).
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open("topo-prov", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("liedjes"); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbDo(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var st = db.transaction("liedjes", mode).objectStore("liedjes");
        var rq = fn(st);
        rq.onsuccess = function () { res(rq.result); };
        rq.onerror = function () { rej(rq.error); };
      });
    });
  }
  function liedjeGet(key) { return idbDo("readonly", function (s) { return s.get(key); }); }
  function liedjePut(key, val) { return idbDo("readwrite", function (s) { return s.put(val, key); }); }
  function liedjeDel(key) { return idbDo("readwrite", function (s) { return s["delete"](key); }); }

  function fmtTijd(sec) {
    sec = Math.max(0, Math.floor(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  var rec = { mr: null, chunks: [], stream: null, t0: 0, timer: null, groep: null };
  var player = null, playURL = null;

  function stopStream() {
    if (rec.stream) { rec.stream.getTracks().forEach(function (t) { t.stop(); }); rec.stream = null; }
    if (rec.timer) { clearInterval(rec.timer); rec.timer = null; }
  }
  // opname stilletjes afbreken (bij wisselen van provincie) — niets opslaan
  function stopOpnameStil() {
    if (rec.mr && rec.mr.state === "recording") { rec.mr.onstop = null; try { rec.mr.stop(); } catch (e) {} }
    rec.mr = null; rec.chunks = []; stopStream();
  }
  function stopAfspelen() {
    if (player) { try { player.pause(); } catch (e) {} player = null; }
    if (playURL) { URL.revokeObjectURL(playURL); playURL = null; }
  }

  function startOpname(groep) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      alert("Opnemen werkt niet in deze browser. Probeer Chrome of Safari op de tablet.");
      return;
    }
    stopAfspelen();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      rec.stream = stream; rec.chunks = []; rec.groep = groep;
      var mr = new MediaRecorder(stream);
      rec.mr = mr;
      mr.ondataavailable = function (e) { if (e.data && e.data.size) rec.chunks.push(e.data); };
      mr.onstop = function () {
        var type = mr.mimeType || (rec.chunks[0] && rec.chunks[0].type) || "audio/webm";
        var blob = new Blob(rec.chunks, { type: type });
        stopStream(); rec.mr = null;
        liedjePut(groep, { blob: blob, mime: type, ts: Date.now() }).then(function () {
          if (groepHuidig() === groep) laadLiedje(groep);
        });
      };
      mr.start();
      rec.t0 = (window.performance && performance.now) ? performance.now() : Date.now();
      opnameUI(true);
      rec.timer = setInterval(function () {
        var el = document.getElementById("rectime");
        var nu = (window.performance && performance.now) ? performance.now() : Date.now();
        if (el) el.textContent = fmtTijd((nu - rec.t0) / 1000);
      }, 200);
    })["catch"](function () {
      alert("Geen toegang tot de microfoon. Sta de microfoon toe in de browser en probeer opnieuw.");
    });
  }
  function stopOpname() {
    if (rec.mr && rec.mr.state === "recording") { try { rec.mr.stop(); } catch (e) {} }
  }

  function opnameUI(bezig) {
    var body = document.getElementById("songbody");
    if (!body) return;
    if (bezig) {
      body.innerHTML =
        '<div class="recrow">' +
          '<button class="btn rec stop">⏹ Stop opname</button>' +
          '<span class="rectime" id="rectime">0:00</span>' +
          '<span class="recdot">● opname…</span>' +
        "</div>";
      body.querySelector(".stop").onclick = stopOpname;
    }
  }

  function laadLiedje(groep) {
    var body = document.getElementById("songbody");
    if (!body) return;
    liedjeGet(groep).then(function (opname) {
      if (groepHuidig() !== groep) return;
      if (opname && opname.blob) toonSpeler(body, groep, opname);
      else toonOpnemer(body, groep);
    })["catch"](function () { toonOpnemer(body, groep); });
  }

  function toonOpnemer(body, groep) {
    body.innerHTML =
      '<p class="note">Nog geen liedje voor deze provincie. Neem jullie eigen liedje op!</p>' +
      '<div class="recrow"><button class="btn rec">🎤 Neem liedje op</button></div>';
    body.querySelector(".rec").onclick = function () { startOpname(groep); };
  }

  function toonSpeler(body, groep, opname) {
    stopAfspelen();
    playURL = URL.createObjectURL(opname.blob);
    player = new Audio(playURL);
    player.loop = ui.herhaal;
    body.innerHTML =
      '<div class="playrow">' +
        '<button class="btn play-s">▶ Afspelen</button>' +
        '<button class="btn rep' + (ui.herhaal ? " on" : "") + '">🔁 Herhaal: ' + (ui.herhaal ? "aan" : "uit") + "</button>" +
        '<button class="btn mini danger del">🗑 Opnieuw</button>' +
      "</div>" +
      '<p class="note recmeta">Opgenomen op ' + new Date(opname.ts).toLocaleDateString("nl-NL") + ". Tik Afspelen om jullie liedje te horen.</p>";

    var playBtn = body.querySelector(".play-s");
    var repBtn = body.querySelector(".rep");
    player.onplay = function () { playBtn.textContent = "⏸ Pauze"; };
    player.onpause = function () { playBtn.textContent = "▶ Afspelen"; };
    player.onended = function () { playBtn.textContent = "▶ Afspelen"; };

    playBtn.onclick = function () {
      if (player.paused) player.play()["catch"](function () {}); else player.pause();
    };
    repBtn.onclick = function () {
      ui.herhaal = !ui.herhaal; bewaar();
      player.loop = ui.herhaal;
      repBtn.textContent = "🔁 Herhaal: " + (ui.herhaal ? "aan" : "uit");
      repBtn.classList.toggle("on", ui.herhaal);
    };
    body.querySelector(".del").onclick = function () {
      if (!confirm("Dit liedje verwijderen en opnieuw opnemen?")) return;
      stopAfspelen();
      liedjeDel(groep).then(function () { if (groepHuidig() === groep) laadLiedje(groep); });
    };
  }

  // ---- update-balkje als er een nieuwe versie klaarstaat ----
  function toonUpdate(reg) {
    if (document.querySelector(".update-bar")) return;
    var bar = document.createElement("button");
    bar.className = "update-bar";
    bar.textContent = "✨ Nieuwe versie — tik om te vernieuwen";
    bar.onclick = function () {
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
    };
    document.body.appendChild(bar);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        if (reg.waiting) toonUpdate(reg);
        reg.addEventListener("updatefound", function () {
          var sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", function () {
            if (sw.state === "installed" && navigator.serviceWorker.controller) toonUpdate(reg);
          });
        });
      }).catch(function () {});
      var reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (reloading) return; reloading = true; window.location.reload();
      });
    });
  }

  render();
})();
