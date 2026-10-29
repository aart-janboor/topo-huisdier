/* Zelf-opruimende service worker. De provincie-app is verhuisd naar
 * https://aart-janboor.github.io/topo-provincie/ . Deze SW wist de oude cache,
 * meldt zichzelf af en stuurt openstaande tabbladen door naar de redirect. */
self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    try {
      var ks = await caches.keys();
      await Promise.all(ks.map(function (k) { return caches.delete(k); }));
    } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
    try {
      var cs = await self.clients.matchAll({ type: "window" });
      cs.forEach(function (c) { c.navigate(c.url); });
    } catch (err) {}
  })());
});
/* geen fetch-handler: verzoeken gaan rechtstreeks naar het netwerk (de redirect) */
