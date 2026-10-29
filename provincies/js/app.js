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

  // Items van een groep, met een niet-leeg label, gesorteerd op nummer.
  function itemsVan(groep) {
    return DATA.items
      .filter(function (it) { return it.regio === groep && labelOf(it).trim() !== ""; })
      .sort(function (a, b) { return sortKey(labelOf(a)) - sortKey(labelOf(b)); });
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
  var ui = { groepIdx: 0, toonNamen: true, gespiekt: {} };
  try {
    var ps = JSON.parse(localStorage.getItem(PK) || "{}");
    if (typeof ps.groepIdx === "number" && ps.groepIdx >= 0 && ps.groepIdx < groepen.length) ui.groepIdx = ps.groepIdx;
    if (typeof ps.toonNamen === "boolean") ui.toonNamen = ps.toonNamen;
  } catch (e) {}
  function bewaar() {
    try { localStorage.setItem(PK, JSON.stringify({ groepIdx: ui.groepIdx, toonNamen: ui.toonNamen })); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ga(delta) {
    stopZingen();
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

    // kaart met genummerde markeringen voor deze groep (alleen waar coords bestaan)
    var markers = items.map(function (it) {
      var c = coordOf(it);
      if (!c) return "";
      return '<button class="pin" data-id="' + esc(it.id) + '" style="left:' + (c[0] * 100) +
        "%;top:" + (c[1] * 100) + '%" aria-label="' + esc(it.naam) + '">' + esc(labelOf(it)) + "</button>";
    }).join("");
    var geenCoords = items.length && markers.trim() === "";

    // namenlijst (tabel)
    var rijen = items.map(function (it) {
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
            '<div class="bigmap"><img src="assets/kaart.jpg" alt="kaart van West-Nederland">' + markers + "</div>" +
            (geenCoords
              ? '<p class="note">De ' + esc(naam.toLowerCase()) +
                " staan met " + (groep === "water" ? "Romeinse cijfers" : "letters") +
                ' óp de kaart — zoek het teken dat bij de naam hoort.</p>'
              : '<p class="note">Tik op een nummer om die naam even te zien.</p>') +
          "</div>" +

          // rechts: namenlijst
          '<div class="col list">' +
            '<div class="listhead">' +
              "<h2>" + emoji + " " + esc(naam) + " <span class=\"count\">(" + items.length + ")</span></h2>" +
              '<div class="tools">' +
                '<button class="btn toggle">' + (ui.toonNamen ? "🙈 Verberg namen" : "👀 Toon namen") + "</button>" +
                '<button class="btn sing">🎵 Zing de namen</button>' +
              "</div>" +
            "</div>" +
            '<table class="tbl"><tbody>' + rijen + "</tbody></table>" +
          "</div>" +

        "</div>" + // layout

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
        stopZingen();
        ui.groepIdx = parseInt(this.getAttribute("data-i"), 10);
        ui.gespiekt = {}; bewaar(); render();
      };
    }

    app.querySelector(".toggle").onclick = function () {
      ui.toonNamen = !ui.toonNamen;
      ui.gespiekt = {}; bewaar(); render();
    };

    app.querySelector(".sing").onclick = function () {
      if (zingtNu()) stopZingen(); else zingNamen(items);
    };

    // rij aantikken = die ene naam spieken (toggle)
    var rijen = app.querySelectorAll(".rij");
    for (var r = 0; r < rijen.length; r++) {
      rijen[r].onclick = function () { spiek(this.getAttribute("data-id")); };
    }

    // nummer op de kaart aantikken = naam spieken + rij oplichten
    var pins = app.querySelectorAll(".pin");
    for (var p = 0; p < pins.length; p++) {
      pins[p].onclick = function () {
        var id = this.getAttribute("data-id");
        spiek(id, true);
      };
    }
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
