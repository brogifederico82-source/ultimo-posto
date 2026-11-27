// Test delle "strade vive" (src/strade-vive.js): nome della via sotto i piedi, strisce pedonali, auto e motorini parcheggiati,
// passanti, cartelli dei luoghi LUISS, passabilità. Uso:
//   node scripts/build.mjs && node scripts/test-strade-vive.mjs [percorso/o/URL/della/pagina]
import {createRequire} from "node:module";
import {fileURLToPath, pathToFileURL} from "node:url";
import {execSync} from "node:child_process";
import path from "node:path";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require("playwright"); } catch {}
  try { return require(path.join(execSync("npm root -g").toString().trim(), "playwright")); } catch {}
  console.error("Playwright non trovato: installalo con `npm i -g playwright` e `npx playwright install chromium`.");
  process.exit(2);
}
const {chromium} = loadPlaywright();
const arg = process.argv[2] || process.env.GAME_URL;
const url = arg
  ? (/^[a-z]+:/i.test(arg) ? arg : pathToFileURL(path.resolve(arg)).href)
  : pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.html")).href;

const failures = [];
const check = (name, ok, detail = "") => {
  console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : " · " + JSON.stringify(detail)));
  if (!ok) failures.push(name);
};

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1000, height: 760}});
const errors = [];
page.on("pageerror", e => errors.push("pageerror: " + e));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
await page.goto(url);
await page.waitForFunction(() => typeof campus !== "undefined" && typeof stradeViveVia === "function");

// 1. Nome della via giusto in punti noti (oggetti veri della mappa) e nell'HUD
const punti = await page.evaluate(() => {
  const trova = (zona, uid) => campus.zones[zona].objects.find(o => o.uid === uid);
  const luogo = (zona, parte) => campus.zones[zona].objects.find(o => o.uid.includes("-luogo-") && o.name.includes(parte));
  const lista = [
    ["Via Parenzo vicino a parenzo-arrival", "parenzo", trova("parenzo", "parenzo-arrival"), "Via Parenzo"],
    ["Viale Pola vicino a pola-arrival", "pola", trova("pola", "pola-arrival"), "Viale Pola"],
    ["Viale Romania al cancello LUISS", "pq-1-1", trova("pq-1-1", "q-pq-1-1-ingresso-luiss"), "Viale Romania"],
    ["Via Gualtiero Castellini (cartello LUISS)", "pq-0-0", luogo("pq-0-0", "Castellini"), "Via Gualtiero Castellini"],
    ["Via di Santa Costanza (Biblioteca LUISS)", "pq-7-2", luogo("pq-7-2", "Biblioteca"), "Via di Santa Costanza"],
    ["Via Tommaso Salvini (LUISS Sport)", "pq-1-n", luogo("pq-1-n", "Sport"), "Via Tommaso Salvini"],
    ["Via di Villa Emiliani (sede LUISS)", "pq-1-n", luogo("pq-1-n", "Villa Emiliani"), "Via di Villa Emiliani"]
  ];
  return lista.map(([nome, zona, o, atteso]) => {
    if (!o) return {nome, mancante: true};
    const intorno = new Set();
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) intorno.add(stradeViveVia(zona, o.x + dx, o.y + dy));
    selectedMode = "free"; resetGame(); state.prologue = 0; state.zone = zona; state.x = o.x; state.y = o.y; state.campusGateOpen = true;
    activeScene = null; stradeViveVia.k = null; tickStradeVive.k = null; renderScene();
    const hud = document.getElementById("zone").textContent;
    return {nome, atteso, trovato: [...intorno], hud, testo: o.text || ""};
  });
});
for (const p of punti) {
  check("via giusta: " + p.nome, !p.mancante && p.trovato.includes(p.atteso) && p.hud === p.atteso, p);
}
const luoghi = punti.filter(p => p.testo).map(p => p.testo);
check("i cartelli dei luoghi LUISS riportano nome e indirizzo e la fonte", luoghi.length >= 4 && luoghi.every(t => /Indirizzo: /.test(t) && /Overture Maps/.test(t)), luoghi);

// 2. Il nome cambia camminando (tickStradeVive) e c'è un ripiego
const camminata = await page.evaluate(() => {
  selectedMode = "free"; resetGame(); state.prologue = 0; state.campusGateOpen = true; activeScene = null;
  const z = "pq-3-3", d = quartiereCache()[z], visti = new Set();
  state.zone = z;
  for (let x = 2; x < d.w - 2; x += 3) { state.x = x; state.y = 40; tickStradeVive.k = null; tickStradeVive(0); visti.add(document.getElementById("zone").textContent); }
  return [...visti];
});
check("camminando l'HUD mostra più vie diverse", camminata.length >= 2 && camminata.every(n => n.length > 3), camminata);

// 3. Strisce pedonali vere
const strisce = await page.evaluate(() => {
  let n = 0, fuoriStrada = 0;
  for (const [id, z] of Object.entries(campus.zones)) {
    if (!quartiereCache()[id]) continue;
    const d = quartiereCache()[id];
    for (const o of z.objects) {
      if (o.kind !== "zebra" || !o.uid.startsWith("q-" + id + "-zebra-")) continue;
      n++;
      let strada = 0;
      for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (d.righe[y][x] === "r") strada++;
      if (strada < o.w * o.h / 2) fuoriStrada++;
    }
  }
  return {n, fuoriStrada};
});
check("strisce pedonali dai segmenti crosswalk (almeno 30), tutte su strada", strisce.n >= 30 && strisce.fuoriStrada === 0, strisce);

// 4. Auto e motorini: fermi, solidi, mai su edifici, incroci-porte; non salvati
const parcheggi = await page.evaluate(() => {
  const r = {auto: 0, moto: 0, nonSolide: 0, suEdificio: 0, vicinoPorta: 0, nonIdle: 0, suZebra: 0};
  for (const [id, z] of Object.entries(campus.zones)) {
    const d = quartiereCache()[id];
    if (!d) continue;
    const speciali = z.objects.filter(o => !o.uid.startsWith("q-") || o.kind === "door" || o.kind === "entrance").map(o => [o.x, o.y]);
    const zebre = z.objects.filter(o => o.kind === "zebra");
    for (const o of z.objects) {
      if (!/^q-.*-(auto|moto)-\d+$/.test(o.uid)) continue;
      o.kind === "car" ? r.auto++ : r.moto++;
      if (!o.solid) r.nonSolide++;
      if (o.behavior !== "idle") r.nonIdle++;
      for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) {
        if (d.righe[y][x] === "B") r.suEdificio++;
        if (zebre.some(s => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h)) r.suZebra++;
      }
      if (speciali.some(([a, b]) => Math.abs(a - o.x) <= 1 && Math.abs(b - o.y) <= 1)) r.vicinoPorta++;
    }
  }
  r.salvati = JSON.stringify(campus).includes('"uid":"q-');
  return r;
});
check("auto parcheggiate (almeno 300) e motorini", parcheggi.auto >= 300 && parcheggi.moto >= 40, parcheggi);
check("auto e motorini fermi, solidi, non su edifici né su strisce né vicino a porte", !parcheggi.nonSolide && !parcheggi.nonIdle && !parcheggi.suEdificio && !parcheggi.suZebra && !parcheggi.vicinoPorta, parcheggi);
check("gli oggetti generati non finiscono nel salvataggio/esportazione", parcheggi.salvati === false);

// 5. Passanti: pochi, a coppie di tessere p collegate, mai nei parchi, con battute
const pedoni = await page.evaluate(() => {
  const r = {perCella: {}, nonDialog: 0, senzaRotta: 0, nelParco: [], totale: 0, senzaTesto: 0};
  for (const [id, z] of Object.entries(campus.zones)) {
    const d = quartiereCache()[id];
    if (!d) continue;
    const lista = z.objects.filter(o => /^q-.*-pedone-\d+$/.test(o.uid));
    r.perCella[id] = lista.length;
    r.totale += lista.length;
    if (lista.length && d.tag.includes("verde") && d.nomi.length <= 3) r.nelParco.push(id);
    for (const o of lista) {
      if (o.action !== "dialog") r.nonDialog++;
      if (o.behavior !== "patrol" || !o.route.length) r.senzaRotta++;
      const prof = conversationFor(o);
      if (!prof || !prof[0] || prof.length < 2) r.senzaTesto++;
      // tutta la rotta è su marciapiede/sentiero
      const [ex, ey] = o.route[0], dx = Math.sign(ex - o.x), dy = Math.sign(ey - o.y);
      for (let k = 0, x = o.x, y = o.y; k <= 12; k++, x += dx, y += dy) {
        if (!"pa".includes(d.righe[y][x])) { r.fuoriMarciapiede = (r.fuoriMarciapiede || 0) + 1; break; }
        if (x === ex && y === ey) break;
      }
    }
  }
  r.max = Math.max(...Object.values(r.perCella));
  return r;
});
check("passanti: al massimo 6 per cella, tutti con rotta e conversazione", pedoni.max <= 6 && pedoni.totale >= 60 && !pedoni.nonDialog && !pedoni.senzaRotta && !pedoni.senzaTesto, pedoni);
check("nessun passante nelle celle di parco denso e tutte le rotte su marciapiede", pedoni.nelParco.length === 0 && !pedoni.fuoriMarciapiede && pedoni.perCella["pq-3-0"] === 0 && pedoni.perCella["pq-0-3"] === 0, pedoni);
const scena = await page.evaluate(() => {
  selectedMode = "free"; resetGame(); state.prologue = 0; state.campusGateOpen = true;
  const z = "pq-0-1", o = campus.zones[z].objects.find(o => /-pedone-\d+$/.test(o.uid));
  state.zone = z; state.x = o.x; state.y = o.y + 1; activeScene = o.uid; renderScene();
  return {titolo: document.getElementById("sceneTitle").textContent, testo: document.getElementById("sceneText").textContent, scelte: document.querySelectorAll("#choices button").length};
});
check("parlare con un passante mostra battuta e argomenti", scena.testo.length > 20 && scena.scelte >= 2, scena);

// 6. Passabilità: le auto non isolano nessuna parte delle celle (raggiungibilità con e senza arredi)
const passabilita = await page.evaluate(() => {
  const peggiori = [];
  for (const [id, z] of Object.entries(campus.zones)) {
    if (!quartiereCache()[id]) continue;
    const idx = zoneObjects(z), start = reachEntry(id, undefined, {mode: "free"});
    const nostri = /^q-.*-(auto|moto|panchina)-\d+$/;
    const impronte = new Set();
    for (const o of idx.solid) if (nostri.test(o.uid)) for (let y = Math.floor(o.y); y < o.y + o.h; y++) for (let x = Math.floor(o.x); x < o.x + o.w; x++) impronte.add(y * z.width + x);
    const conta = esclusi => {
      const solidi = idx.solid.filter(o => !(esclusi && nostri.test(o.uid)));
      const occ = new Uint8Array(z.width * z.height);
      for (const o of solidi) for (let y = Math.floor(o.y); y < o.y + o.h; y++) for (let x = Math.floor(o.x); x < o.x + o.w; x++) if (x >= 0 && y >= 0 && x < z.width && y < z.height) occ[y * z.width + x] = 1;
      const seen = new Uint8Array(occ.length), q = [start[0] + start[1] * z.width];
      seen[q[0]] = 1; let n = 0;
      while (q.length) {
        const c = q.pop();
        if (!impronte.has(c)) n++;          // le tessere occupate dagli oggetti non contano come "perse"
        const x = c % z.width, y = (c - x) / z.width;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + a, ny = y + b;
          if (nx < 0 || ny < 0 || nx >= z.width || ny >= z.height) continue;
          const k = ny * z.width + nx;
          if (!seen[k] && !occ[k]) { seen[k] = 1; q.push(k); }
        }
      }
      return n;
    };
    const con = conta(false), senza = conta(true);
    peggiori.push([id, con, senza, +(con / senza).toFixed(4)]);
  }
  peggiori.sort((a, b) => a[3] - b[3]);
  return peggiori.slice(0, 3);
});
console.log("     peggiori (zona, con, senza, rapporto):", JSON.stringify(passabilita));
check("le auto parcheggiate non isolano tessere percorribili (>= 99,5% raggiungibile)", passabilita[0][3] >= 0.995, passabilita);

// 7. Disegno: ogni cella si disegna con gli oggetti nuovi e il tempo di un frame resta basso
const frame = await page.evaluate(() => {
  const r = {max: 0, zona: ""};
  selectedMode = "free"; resetGame(); state.prologue = 0; state.campusGateOpen = true; activeScene = null;
  for (const id of ["pq-7-0", "pq-0-2", "pq-1-n"]) {
    state.zone = id; const [x, y] = reachEntry(id); state.x = x; state.y = y; renderScene();
    const t0 = performance.now(); for (let i = 0; i < 60; i++) draw(1000 + i * 16);
    const ms = (performance.now() - t0) / 60;
    if (ms > r.max) { r.max = +ms.toFixed(2); r.zona = id; }
  }
  return r;
});
check("tempo di disegno per frame sotto i 16 ms nelle celle più cariche", frame.max < 16, frame);

check("nessun errore in console", errors.length === 0, errors.slice(0, 5));
await browser.close();
if (failures.length) { console.log("\n" + failures.length + " controlli falliti"); process.exit(1); }
console.log("\nTutti i controlli superati");
