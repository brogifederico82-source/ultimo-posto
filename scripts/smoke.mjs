// Test di fumo ripetibile: apre dist/index.html in un browser headless e controlla i percorsi principali.
// Richiede Playwright (npm i -g playwright && npx playwright install chromium). Uso:
//   node scripts/build.mjs && node scripts/smoke.mjs [percorso/o/URL/della/pagina]
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
page.on("dialog", d => d.accept());
await page.goto(url);
await page.waitForTimeout(500);

// 1. Mappa: uid unici, portali validi, ogni zona si disegna
const map = await page.evaluate(() => {
  const out = {dup: [], broken: [], render: []}, seen = new Set();
  window.confirm = () => true;
  for (const [zid, z] of Object.entries(campus.zones)) {
    for (const o of z.objects) {
      if (seen.has(o.uid)) out.dup.push(o.uid); seen.add(o.uid);
      if (o.action === "portal" && !campus.zones[String(o.target).split("#")[0]]) out.broken.push(zid + ":" + o.uid);
    }
    try {
      selectedMode = "free"; resetGame(); state.prologue = 0; state.zone = zid;
      [state.x, state.y] = reachEntry(zid); activeScene = null; renderScene();
    } catch (e) { out.render.push(zid + ": " + e.message); }
  }
  return out;
});
check("uid unici", !map.dup.length, map.dup);
check("portali validi", !map.broken.length, map.broken);
check("tutte le zone si disegnano", !map.render.length, map.render);

// 2. Ogni oggetto interattivo apre una scena con testo e una via d'uscita (storia con tutto sbloccato e modalità libera)
for (const mode of ["story", "free"]) {
  const bad = await page.evaluate(m => {
    selectedMode = m; resetGame(); state.prologue = 0; state.campusGateOpen = true;
    for (const [i] of storySteps) if (!state.pockets.includes(i)) state.pockets.push(i);
    for (const k of Object.keys(challengeNames)) state.wins[k] = true;
    const bad = [];
    for (const [zid, z] of Object.entries(campus.zones)) for (const o of z.objects) {
      try {
        if (minigame) closeChallenge();
        state.ending = null; state.zone = zid; activeScene = null;
        [state.x, state.y] = freeTile(zid, Math.floor(o.x), Math.floor(o.y) + 1);
        if (nearby()?.uid !== o.uid) continue;
        interact();
        if (minigame) { closeChallenge(); continue; }
        if (!activeScene) continue;
        const s = getScene();
        const exits = document.querySelectorAll("#choices button").length || !$("closeConversation").hidden;
        if (!s.text || /undefined|NaN|\[object/.test(s.title + s.text) || !exits) bad.push(zid + ":" + o.uid);
      } catch (e) { bad.push(zid + ":" + o.uid + " " + e.message); }
    }
    return bad;
  }, mode);
  check("scene di tutti gli oggetti (" + mode + ")", !bad.length, bad.slice(0, 10));
}

// 3. Minigiochi: si aprono, si chiudono e non lasciano nodi in più
const mini = await page.evaluate(async () => {
  selectedMode = "free"; resetGame(); state.prologue = 0;
  const ids = [...new Set([...Object.keys(challengeNames), ...Object.keys(loftGames)])];
  const bad = [];
  const count = () => document.getElementsByTagName("*").length;
  for (const id of ids) {
    try {
      openChallenge(id); await new Promise(r => setTimeout(r, 150)); closeChallenge();
    } catch (e) { bad.push(id + ": " + e.message); }
  }
  const before = count();
  for (let i = 0; i < 5; i++) for (const id of ids) { try { openChallenge(id); closeChallenge(); } catch (e) { bad.push(id); } }
  return {bad, grown: count() - before};
});
check("minigiochi aperti e chiusi", !mini.bad.length, mini.bad);
check("nessun accumulo di nodi DOM", mini.grown < 20, mini.grown);

// 4. Storia: prologo, tornello e Game Over, poi salvataggio e ripresa
await page.evaluate(() => localStorage.clear());
await page.reload(); await page.waitForTimeout(300);
await page.click("#start"); await page.waitForTimeout(150);
await page.click("#play"); await page.waitForTimeout(300);
const click = re => page.evaluate(r => { const b = [...document.querySelectorAll("#choices button")].find(x => new RegExp(r, "i").test(x.textContent)); if (b) b.click(); return !!b; }, re);
check("prologo", (await click("presa")) && (await click("varco")));
await page.evaluate(() => { [state.x, state.y] = [vialeEntrance.x + 15, vialeEntrance.gateY + 1]; });
await page.keyboard.down("ArrowUp"); await page.waitForTimeout(250); await page.keyboard.up("ArrowUp");
check("tornello ferma senza badge", await page.evaluate(() => state.gateConfrontation === 1 && !state.campusGateOpen));
await click("Insisti"); await click("Oltrepassa");
check("Game Over del tornello", await page.evaluate(() => Boolean(state.ending?.guard)));
await click("Riprova");
await page.reload(); await page.waitForTimeout(300);
await page.click("#start"); await page.waitForTimeout(300);
check("ripresa dopo Game Over", await page.evaluate(() => screen === "game" && !state.ending && !blocked(state.zone, state.x, state.y, 0)));

// 5. Percorso completo (teletrasporto + E): badge, tutorato, A200, LOFT, navetta, Parenzo, car sharing, Pola
const route = await page.evaluate(() => {
  const at = (zone, uid) => {
    activeScene = null; state.zone = zone;
    const o = room(zone).objects.find(o => o.uid === uid);
    [state.x, state.y] = freeTile(zone, Math.floor(o.x), Math.floor(o.y) + 1);
    interact(); return activeScene;
  };
  const press = re => { const b = [...document.querySelectorAll("#choices button")].find(x => new RegExp(re, "i").test(x.textContent)); if (b) b.click(); return !!b; };
  const log = [];
  const step = (zone, uid, re, item) => {
    log.push([uid, at(zone, uid) === uid, press(re), item ? has(item) : true]);
  };
  state.campusGateOpen = true;
  step("giardino", "viale-ingresso-guardia", "Mostra il badge", "Via libera");
  step("tutorato", "tutor-viola", "piano di studio", "Colloquio tutor");
  step("aula-chiesa", "prof-storia", "^1989", "Lezione A200");
  step("loft", "loft-placard", "podcast", "Progetto LOFT");
  at("giardino", "navetta-sign"); press("Prenota"); press("Mostra il QR");
  log.push(["navetta", state.zone === "parenzo"]);
  at("parenzo-interno", "parenzo-interno-npc");
  state.pockets.push("Seminario Parenzo");
  step("giardino", "carsharing-romania", "abilitazione", "Abilitazione Green Mobility");
  press("Vai a Viale Pola");
  log.push(["pola", state.zone === "pola"]);
  at("pola-cortile", "pola-cortile-npc");
  press("sedie"); press("Brinda");
  log.push(["festa", has("Festa a Pola")]);
  return log.filter(r => r.includes(false));
});
check("percorso storia fino alla festa di Pola", !route.length, route);

// 6. Lingua e modalità libera
const lang = await page.evaluate(() => {
  chooseLanguage("en"); const en = document.documentElement.lang; chooseLanguage("it");
  return {en, it: document.documentElement.lang};
});
check("cambio lingua", lang.en === "en" && lang.it === "it", lang);
await page.evaluate(() => { selectedMode = "free"; resetGame(); });
await page.reload(); await page.waitForTimeout(300);
await page.click("#free"); await page.waitForTimeout(300);
check("ripresa modalità libera", await page.evaluate(() => screen === "game" && state.mode === "free"));

// 7. Editor: apri, esporta, importa, prova
await page.evaluate(() => show("home"));
await page.click("#edOpen"); await page.waitForTimeout(300);
const [download] = await Promise.all([page.waitForEvent("download"), page.click("#edJson")]);
const exported = await download.createReadStream().then(s => new Promise(r => { let t = ""; s.on("data", c => t += c); s.on("end", () => r(t)); }));
check("esporta mappa", Object.keys(JSON.parse(exported).zones).length > 20);
const modified = JSON.stringify({...JSON.parse(exported), zones: {...JSON.parse(exported).zones, giardino: {...JSON.parse(exported).zones.giardino, name: "Giardino di prova"}}});
const imported = await page.evaluate(async text => {
  const file = new File([text], "mappa.json", {type: "application/json"});
  const dt = new DataTransfer(); dt.items.add(file); $("edFile").files = dt.files; $("edFile").dispatchEvent(new Event("change"));
  await new Promise(r => setTimeout(r, 600)); return $("edStatus").textContent;
}, modified);
check("importa mappa", /importata/i.test(imported), imported);
await page.click("#edTest"); await page.waitForTimeout(200);
check("prova dall'editor", await page.evaluate(() => testMode && screen === "game"));
await page.click("#testBack"); await page.waitForTimeout(200);
check("ritorno all'editor", await page.evaluate(() => screen === "editor" && !testMode));

check("nessun errore in console", !errors.length, errors.slice(0, 5));
await browser.close();
console.log(failures.length ? "\n" + failures.length + " controlli falliti" : "\nTutti i controlli superati");
process.exit(failures.length ? 1 : 0);
