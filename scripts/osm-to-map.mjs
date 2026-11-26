#!/usr/bin/env node
// Converte un file JSON in formato Overpass (`[out:json]` + `out body geom;`)
// in una mappa locale espressa in metri rispetto a un centro. Nessuna dipendenza esterna.
//
// Uso:
//   node scripts/osm-to-map.mjs input.json data/mappa/<nome>.json --centro lat,lon
//
// Output (JSON):
//   meta:     {centro:{lat,lon}, sorgente, proiezione}
//   strade:   [{id, highway, name, oneway, larghezza, punti}]     punti = [[x,y],...] in metri
//   edifici:  [{id, building, name, levels, impronta}]            impronta = [[x,y],...] in metri
//   verde:    [{id, tipo, name, punti}]                           tipo = park | garden | grass
//
// Coordinate: x verso est, y verso nord, origine nel centro indicato con --centro.
// Proiezione equirettangolare: 1° lat ~ 111320 m, 1° lon ~ 111320 * cos(lat_centro) m.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const METRI_PER_GRADO_LAT = 111320;

// Larghezza stimata (metri) per classe stradale, usata quando manca il tag `width`.
export const LARGHEZZA_PER_CLASSE = {
  motorway: 14, trunk: 13, primary: 12, secondary: 9, tertiary: 8,
  residential: 6, unclassified: 6, living_street: 5, service: 4,
  pedestrian: 4, track: 3, footway: 2, cycleway: 2, steps: 2, path: 1.5,
};
const LARGHEZZA_DEFAULT = 5;

// Valori accettati per le aree verdi, sia in `leisure` sia in `landuse`.
const VALORI_VERDE = ["park", "garden", "grass"];

// Errore previsto (input sbagliato): viene mostrato all'utente senza stack trace.
export class ErroreInput extends Error {}

// Arrotonda a due decimali (sufficiente per il metro, evita JSON enormi).
const arrotonda = v => Math.round(v * 100) / 100;

// Crea la funzione lat/lon -> [x, y] in metri rispetto al centro.
export function creaProiezione(centro) {
  const metriPerGradoLon = METRI_PER_GRADO_LAT * Math.cos(centro.lat * Math.PI / 180);
  return p => [
    arrotonda((p.lon - centro.lon) * metriPerGradoLon),
    arrotonda((p.lat - centro.lat) * METRI_PER_GRADO_LAT),
  ];
}

// Legge "lat,lon" dalla riga di comando con controlli sui range.
export function parseCentro(testo) {
  const parti = String(testo ?? "").split(",").map(s => s.trim());
  const lat = Number(parti[0]), lon = Number(parti[1]);
  if (parti.length !== 2 || parti.some(s => s === "") || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new ErroreInput(`--centro non valido: "${testo}". Formato atteso: lat,lon (es. 41.9310,12.5030).`);
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new ErroreInput(`--centro fuori range: lat ${lat}, lon ${lon}.`);
  }
  return { lat, lon };
}

// Larghezza dal tag `width` (es. "9", "7.5", "9 m"); unità diverse da metri vengono ignorate.
export function parseWidth(valore) {
  if (valore == null) return null;
  const m = String(valore).trim().match(/^(\d+(?:[.,]\d+)?)\s*(m)?$/i);
  if (!m) return null;
  return Number(m[1].replace(",", "."));
}

// Larghezza finale: tag width se leggibile, altrimenti tabella per classe.
export function larghezzaStrada(tags) {
  const dalTag = parseWidth(tags.width);
  if (dalTag !== null && dalTag > 0) return dalTag;
  return LARGHEZZA_PER_CLASSE[tags.highway] ?? LARGHEZZA_DEFAULT;
}

// Il tag oneway conta come senso unico con yes/1/true, e anche con -1 (senso inverso).
function isSensoUnico(valore) {
  return ["yes", "1", "true", "-1"].includes(String(valore ?? "").trim().toLowerCase());
}

// building:levels come numero intero, altrimenti null.
function parseLevels(valore) {
  const s = String(valore ?? "").trim();
  return /^\d+$/.test(s) ? Number(s) : null;
}

// Una geometria è chiusa quando primo e ultimo punto coincidono.
function isChiusa(geom) {
  const a = geom[0], b = geom[geom.length - 1];
  return geom.length >= 4 && a.lat === b.lat && a.lon === b.lon;
}

// Geometria valida: array di almeno 2 punti con lat/lon numerici.
function geometriaValida(geom) {
  return Array.isArray(geom) && geom.length >= 2 &&
    geom.every(p => p && Number.isFinite(p.lat) && Number.isFinite(p.lon));
}

// Converte il dataset Overpass in strade, edifici e aree verdi in metri.
// Restituisce anche i contatori degli elementi scartati e il motivo.
export function converti(osm, centro, sorgente = "input") {
  if (!osm || !Array.isArray(osm.elements)) {
    throw new ErroreInput("Il file non contiene un array `elements`: serve un export Overpass (out:json, out body geom;).");
  }
  if (osm.elements.length === 0) {
    throw new ErroreInput("Nessun elemento nel file (elements è vuoto): niente da convertire.");
  }

  const proietta = creaProiezione(centro);
  const strade = [], edifici = [], verde = [];
  const scarti = { nodi: 0, relazioni: 0, senzaGeometria: 0, areaNonChiusa: 0, nonRiconosciuti: 0 };

  for (const el of osm.elements) {
    if (el.type === "node") { scarti.nodi++; continue; }
    if (el.type !== "way") { scarti.relazioni++; continue; }

    const tags = el.tags ?? {};
    if (!geometriaValida(el.geometry)) { scarti.senzaGeometria++; continue; }
    const punti = el.geometry.map(proietta);

    if (tags.highway) {
      strade.push({
        id: el.id,
        highway: tags.highway,
        name: tags.name ?? null,
        oneway: isSensoUnico(tags.oneway),
        larghezza: larghezzaStrada(tags),
        punti,
      });
    } else if (tags.building) {
      if (!isChiusa(el.geometry)) { scarti.areaNonChiusa++; continue; }
      edifici.push({
        id: el.id,
        building: tags.building,
        name: tags.name ?? null,
        levels: parseLevels(tags["building:levels"]),
        impronta: punti,
      });
    } else if (VALORI_VERDE.includes(tags.leisure) || VALORI_VERDE.includes(tags.landuse)) {
      if (!isChiusa(el.geometry)) { scarti.areaNonChiusa++; continue; }
      verde.push({
        id: el.id,
        tipo: VALORI_VERDE.includes(tags.leisure) ? tags.leisure : tags.landuse,
        name: tags.name ?? null,
        punti,
      });
    } else {
      scarti.nonRiconosciuti++;
    }
  }

  const mappa = {
    meta: {
      centro,
      sorgente,
      proiezione: "equirettangolare, metri locali rispetto al centro",
    },
    strade,
    edifici,
    verde,
  };
  return { mappa, scarti };
}

// Legge il file di input con messaggi chiari su file mancante o JSON non valido.
async function leggiInput(percorso) {
  let testo;
  try {
    testo = await readFile(percorso, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") throw new ErroreInput(`File di input non trovato: ${percorso}`);
    throw new ErroreInput(`Impossibile leggere ${percorso}: ${e.message}`);
  }
  try {
    return JSON.parse(testo);
  } catch (e) {
    throw new ErroreInput(`JSON non valido in ${percorso}: ${e.message}`);
  }
}

const USO = "Uso: node scripts/osm-to-map.mjs input.json data/mappa/<nome>.json --centro lat,lon";

// Interpreta gli argomenti della riga di comando.
function leggiArgomenti(argv) {
  const posizionali = [];
  let centro = undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--centro") {
      if (i + 1 >= argv.length) throw new ErroreInput("--centro richiede un valore lat,lon.");
      centro = argv[++i];
    } else if (a.startsWith("--centro=")) {
      centro = a.slice("--centro=".length);
    } else if (a.startsWith("-")) {
      throw new ErroreInput(`Opzione sconosciuta: ${a}\n${USO}`);
    } else {
      posizionali.push(a);
    }
  }
  if (posizionali.length !== 2) throw new ErroreInput(USO);
  if (centro === undefined) throw new ErroreInput(`Manca --centro lat,lon.\n${USO}`);
  return { input: posizionali[0], output: posizionali[1], centro: parseCentro(centro) };
}

async function main(argv) {
  const { input, output, centro } = leggiArgomenti(argv);
  const osm = await leggiInput(input);
  const { mappa, scarti } = converti(osm, centro, basename(input));

  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, JSON.stringify(mappa, null, 2) + "\n", "utf8");

  console.log(`Scritto ${output}`);
  console.log(`  strade: ${mappa.strade.length}, edifici: ${mappa.edifici.length}, aree verdi: ${mappa.verde.length}`);
  const totaleScarti = Object.values(scarti).reduce((s, n) => s + n, 0);
  if (totaleScarti > 0) {
    console.log(`  scartati: nodi ${scarti.nodi}, relazioni ${scarti.relazioni}, senza geometria ${scarti.senzaGeometria}, aree non chiuse ${scarti.areaNonChiusa}, tipo non gestito ${scarti.nonRiconosciuti}`);
  }
  if (mappa.strade.length + mappa.edifici.length + mappa.verde.length === 0) {
    console.warn("Attenzione: nessuna strada, edificio o area verde riconosciuti nel file.");
  }
}

// Esegue solo se lanciato da riga di comando (non quando importato dai test).
const eseguitoDaCli = process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (eseguitoDaCli) {
  main(process.argv.slice(2)).catch(e => {
    if (e instanceof ErroreInput) {
      console.error("Errore: " + e.message);
    } else {
      console.error("Errore inatteso: " + (e?.stack ?? e));
    }
    process.exitCode = 1;
  });
}
