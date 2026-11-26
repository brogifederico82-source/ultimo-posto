import { execFileSync } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { deflateSync, crc32 } from 'node:zlib';

export async function packageGame(output, version) {
  const makeIcon = (size) => {
    const chunk = (name, data) => {
      const header = Buffer.alloc(8);
      header.writeUInt32BE(data.length);
      header.write(name, 4, 'ascii');
      const checksum = Buffer.alloc(4);
      checksum.writeUInt32BE(crc32(Buffer.concat([header.subarray(4), data])));
      return Buffer.concat([header, data, checksum]);
    };
    const header = Buffer.alloc(13);
    header.writeUInt32BE(size); header.writeUInt32BE(size, 4);
    header[8] = 8; header[9] = 2;
    const pixels = Buffer.alloc((size * 3 + 1) * size);
    const palette = [[24,39,37],[49,74,65],[207,161,97],[234,202,149],[65,102,108],[85,117,106]];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const col = x * 32 / size, row = y * 32 / size;
      let color = 0;
      if ((col - 16) ** 2 + (row - 16) ** 2 < 153) color = 1;
      if (row >= 22 && row < 24 && col >= 7 && col < 25) color = 5;
      if (row >= 13 && row < 22 && col >= 9 && col < 23) color = 2;
      if (row >= 8 && row < 14 && Math.abs(col - 16) <= row - 7) color = 3;
      if (row >= 15 && row < 22 && ((col >= 11 && col < 13) || (col >= 19 && col < 21))) color = 3;
      if (row >= 16 && row < 22 && col >= 14 && col < 18) color = 4;
      pixels.set(palette[color], y * (size * 3 + 1) + 1 + x * 3);
    }
    return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),
      chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
  };

  const icons = [192, 512].map(size => ({
    src: `./icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any'
  }));
  const manifest = JSON.stringify({
    id: './', name: 'Ultimo Posto · Viale Romania', short_name: 'Ultimo Posto',
    description: 'Un gioco narrativo nel campus di Viale Romania.', lang: 'it',
    scope: './', start_url: './', display: 'standalone', background_color: '#182725',
    theme_color: '#182725', icons
  }, null, 2);
  const worker = `
const version = "${version}";
const cachePrefix = "ultimo-posto-v1-";
const cacheName = cachePrefix + version;
const app = new URL("./index.html", self.registration.scope).href;
const resources = ["manifest.webmanifest", "icon-192.png", "icon-512.png"].map(
  asset => new URL(asset, self.registration.scope).href
);
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const response = await fetch(app + "?release=" + version, { cache: "reload" });
    if (!response.ok || !(await response.clone().text()).includes(
      '<meta name="game-release" content="' + version + '">'
    )) throw new Error("La build online non corrisponde a questa versione");
    const cache = await caches.open(cacheName);
    const requests = resources.map(url => new Request(url, { cache: "reload" }));
    await cache.addAll(requests);
    await cache.put(app, response);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(cachePrefix) && key !== cacheName)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("message", event => {
  if (event.data === "GAME_RELEASE") event.ports[0]?.postMessage(version);
});
self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(self.registration.scope)) return;
  if (request.mode === "navigate" && [self.registration.scope, app].includes(request.url.split("?")[0])) {
    const cached = caches.open(cacheName).then(cache => cache.match(app));
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { signal: AbortSignal.timeout(2200), cache: "no-cache" });
        if (response.ok) return response;
      } catch {}
      return await cached || Response.error();
    })());
  } else if (resources.includes(request.url)) {
    event.respondWith(caches.open(cacheName).then(cache => cache.match(request))
      .then(cached => cached || fetch(request)));
  }
});
`;
  const instructions = `ULTIMO POSTO · ${version}

COMPUTER
Estrai lo ZIP e apri index.html nel browser per giocare direttamente offline.

INSTALLAZIONE COME APP
Apri la versione online:
https://brogifederico82-source.github.io/ultimo-posto/
Tocca «Installa il gioco», o usa il menu del tuo browser.
Su iPhone: Safari, Condividi, Aggiungi alla schermata Home, Apri come app web.
Avvia una volta con connessione e attendi «Pronto offline».
Le versioni nuove si scaricano quando riapri il gioco online.

I salvataggi sono conservati dal browser che usi per giocare.
`;
  await Promise.all([
    writeFile(new URL('manifest.webmanifest', output), manifest),
    writeFile(new URL('sw.js', output), worker),
    writeFile(new URL('LEGGIMI.txt', output), instructions),
    ...[192, 512].map(size => writeFile(new URL(`icon-${size}.png`, output), makeIcon(size)))
  ]);
  await rm(new URL('Ultimo-Posto.zip', output), { force: true });
  execFileSync('zip', ['-q', 'Ultimo-Posto.zip', 'index.html', 'manifest.webmanifest', 'sw.js',
    'icon-192.png', 'icon-512.png', 'LEGGIMI.txt'], { cwd: fileURLToPath(output) });
}
