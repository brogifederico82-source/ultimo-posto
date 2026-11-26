// Test senza rete per scripts/osm-to-map.mjs. Usa solo il fixture scripts/fixtures/osm-piccolo.json.
// Uso: node scripts/test-osm-to-map.mjs
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { converti, creaProiezione, larghezzaStrada, parseCentro, parseWidth } from "./osm-to-map.mjs";

const qui = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(qui, "osm-to-map.mjs");
const fixture = path.join(qui, "fixtures", "osm-piccolo.json");
const CENTRO = "41.9310,12.5030";

let fallimenti = 0;
const prova = (nome, fn) => {
  try {
    fn();
    console.log("ok   " + nome);
  } catch (e) {
    fallimenti++;
    console.log("FAIL " + nome + "\n     " + (e.message || e).toString().split("\n").slice(0, 6).join("\n     "));
  }
};

const dir = await mkdtemp(path.join(tmpdir(), "osm-test-"));
try {
  // 1. Esecuzione da riga di comando end-to-end sul fixture
  const out = path.join(dir, "sotto", "parioli.json");
  const run = spawnSync(process.execPath, [script, fixture, out, "--centro", CENTRO], { encoding: "utf8" });
  prova("esecuzione CLI termina con codice 0", () => assert.equal(run.status, 0, run.stderr));
  prova("CLI crea la cartella di output e scrive il file", () => assert.ok(run.stdout.includes("Scritto")));

  const mappa = JSON.parse(await readFile(out, "utf8"));

  // 2. Conteggi attesi dal fixture: 2 strade, 1 edificio, 1 area verde
  prova("conteggi: 2 strade, 1 edificio, 1 verde", () => {
    assert.equal(mappa.strade.length, 2);
    assert.equal(mappa.edifici.length, 1);
    assert.equal(mappa.verde.length, 1);
  });

  // 3. Proiezione: il centro diventa (0,0) e la scala è quella equirettangolare
  const via1 = mappa.strade.find(s => s.id === 900001);
  prova("il punto centrale della strada va in (0,0)", () => {
    assert.deepEqual(via1.punti[1], [0, 0]);
  });
  const latRad = 41.9310 * Math.PI / 180;
  prova("1 grado di latitudine = 111320 m (passo di 0.001°)", () => {
    const nord = creaProiezione({ lat: 41.9310, lon: 12.5030 })({ lat: 41.9320, lon: 12.5030 });
    assert.ok(Math.abs(nord[1] - 111.32) < 0.01, JSON.stringify(nord));
    assert.equal(nord[0], 0);
  });
  prova("1 grado di longitudine scala con cos(lat) (passo di 0.001°)", () => {
    const est = creaProiezione({ lat: 41.9310, lon: 12.5030 })({ lat: 41.9310, lon: 12.5040 });
    assert.ok(Math.abs(est[0] - 0.001 * 111320 * Math.cos(latRad)) < 0.01, JSON.stringify(est));
    assert.equal(est[1], 0);
  });

  // 4. Strade: larghezza da tag (width "9") o da tabella (residential 6), senso unico
  prova("residential senza width: larghezza 6 e oneway true", () => {
    assert.equal(via1.highway, "residential");
    assert.equal(via1.larghezza, 6);
    assert.equal(via1.oneway, true);
  });
  prova("primary con width=9: il tag prevale e oneway false", () => {
    const via2 = mappa.strade.find(s => s.id === 900002);
    assert.equal(via2.larghezza, 9);
    assert.equal(via2.oneway, false);
    assert.equal(via2.name, "Via finta Due");
  });

  // 5. Edificio: livelli dal tag building:levels, impronta chiusa in metri
  prova("edificio: levels 4, nome e impronta in metri", () => {
    const e = mappa.edifici[0];
    assert.equal(e.building, "yes");
    assert.equal(e.name, "Palazzo di prova");
    assert.equal(e.levels, 4);
    assert.equal(e.impronta.length, 5);
    assert.deepEqual(e.impronta[0], e.impronta[4]);
  });

  // 6. Area verde: tipo park da leisure
  prova("area verde: tipo park", () => {
    assert.equal(mappa.verde[0].tipo, "park");
    assert.equal(mappa.verde[0].name, "Parco di prova");
  });

  // 7. Unità: il file di output è in metri, nessuna coordinata geografica residua
  prova("tutti i punti sono in metri (poche centinaia al massimo dal centro)", () => {
    const valori = [...mappa.strade, ...mappa.edifici, ...mappa.verde]
      .flatMap(f => f.punti ?? f.impronta)
      .flat();
    assert.ok(valori.length > 0);
    for (const v of valori) assert.ok(Math.abs(v) < 500, "valore fuori scala: " + v);
    assert.equal(mappa.meta.centro.lat, 41.931);
  });

  // 8. Funzioni di supporto
  prova("parseWidth accetta '7.5', '7,5 m' e rifiuta unità non metriche", () => {
    assert.equal(parseWidth("7.5"), 7.5);
    assert.equal(parseWidth("7,5 m"), 7.5);
    assert.equal(parseWidth("10 ft"), null);
    assert.equal(parseWidth(undefined), null);
  });
  prova("larghezza: classi della tabella e fallback al default", () => {
    assert.equal(larghezzaStrada({ highway: "primary" }), 12);
    assert.equal(larghezzaStrada({ highway: "footway" }), 2);
    assert.equal(larghezzaStrada({ highway: "sconosciuta" }), 5);
    assert.equal(larghezzaStrada({ highway: "primary", width: "10 ft" }), 12);
  });
  prova("edificio senza building:levels: levels null", () => {
    const r = converti({
      elements: [{ type: "way", id: 1, tags: { building: "yes" }, geometry: [
        { lat: 41.93, lon: 12.5 }, { lat: 41.93, lon: 12.501 }, { lat: 41.931, lon: 12.501 }, { lat: 41.93, lon: 12.5 },
      ] }],
    }, { lat: 41.93, lon: 12.5 });
    assert.equal(r.mappa.edifici[0].levels, null);
    assert.equal(r.mappa.edifici[0].name, null);
  });
  prova("parseCentro rifiuta formati e range sbagliati", () => {
    assert.throws(() => parseCentro("41.9"), /non valido/);
    assert.throws(() => parseCentro("41.9,abc"), /non valido/);
    assert.throws(() => parseCentro("95,12"), /fuori range/);
  });

  // 9. Errori chiari: file mancante, JSON non valido, nessun elemento, --centro mancante
  const errore = (args, atteso) => {
    const r = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
    assert.notEqual(r.status, 0, "doveva fallire");
    assert.ok(r.stderr.includes(atteso), "stderr: " + r.stderr);
  };
  const jsonRotto = path.join(dir, "rotto.json");
  await writeFile(jsonRotto, "{ non json");
  const vuoto = path.join(dir, "vuoto.json");
  await writeFile(vuoto, JSON.stringify({ elements: [] }));

  prova("errore: file di input mancante", () => errore([path.join(dir, "nope.json"), out, "--centro", CENTRO], "File di input non trovato"));
  prova("errore: JSON non valido", () => errore([jsonRotto, out, "--centro", CENTRO], "JSON non valido"));
  prova("errore: nessun elemento", () => errore([vuoto, out, "--centro", CENTRO], "Nessun elemento"));
  prova("errore: --centro mancante", () => errore([fixture, out], "Manca --centro"));
} finally {
  await rm(dir, { recursive: true, force: true });
}

if (fallimenti > 0) {
  console.log(`\n${fallimenti} test falliti`);
  process.exit(1);
}
console.log("\nTutti i test sono passati");
