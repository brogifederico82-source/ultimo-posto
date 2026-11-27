# Dati reali dell'area (Overture Maps, release 2026-11-18.0)

Estratti dal bucket pubblico `overturemaps-us-west-2` (S3), filtrati sul riquadro lon 12.478–12.522, lat 41.912–41.948.

| File | Elementi | Contenuto |
|---|---|---|
| edifici.geojson | 5181 | impronte, altezza (dove nota), piani, tipo |
| strade.geojson | 5890 | segmenti stradali, classe, sottoclasse |
| uso_suolo.geojson | 809 | parchi, verde, aree |
| acqua.geojson | 122 | specchi d'acqua |
| luoghi.geojson | 14559 | punti di interesse con indirizzo |

Coordinate in **metri** rispetto al centro (41.9205, 12.5040): x verso est, y verso nord.

Punti di ancoraggio verificati nei luoghi (non stimati):
- Viale Romania 32 (LUISS): circa 12.4933, 41.9250
- Viale Pola 12 (LUISS, Villa Alberoni nei dintorni): circa 12.5119, 41.9183
- Via Parenzo 11 (LUISS Giurisprudenza): circa 12.5131, 41.9218

Anteprima: `anteprima-tre-sedi.png`. Il tracciato è stato controllato visivamente, ma non ancora sul campo.

Rigenerazione: `scripts/overture/` (scan2.py per gli edifici, scanall.py per gli altri temi, geojson-metri.py per la conversione, anteprima.py per il grafico). Richiede Python con pyarrow, pandas, shapely, matplotlib, fsspec, aiohttp.

Licenza: da verificare (vedi data/fonti/fonti.csv, riga overture). Non è ancora una fonte confermata.

## Strade vive (scripts/overture/to-zone.py → src/quartiere-dati.js, src/strade-vive.js)

Dal generatore, per ogni cella: `nomi` + `via` (nome della via o del parco per tessera, compresso a corse: lettera = indice del nome, numero = tessere consecutive, `_` = nessun nome),
`strisce` (i 153 segmenti `footway/crosswalk`, qui quelli che cadono nelle celle, come rettangoli orientati lungo l'attraversamento), `auto` e `moto` (parcheggi deterministici, seme = id cella),
`panchine`, `parchi` (cartelli con il nome del parco dai dati `uso_suolo`), `pedoni` (rotte brevi su marciapiede), `luoghi` (cartelli dei soli luoghi LUISS istituzionali, per id Overture: Biblioteca di Via di Santa Costanza, Via Gualtiero Castellini, Via di Villa Emiliani 14, LUISS Sport di Via Tommaso Salvini 2).
Dati reali: nomi e tracciato delle vie, segmenti `crosswalk`, nomi dei parchi, nome e indirizzo dei luoghi. Dedotti (non verificati sul campo): quali tessere hanno auto, motorini, panchine, passanti; la posizione precisa dei cartelli (accanto all'edificio più vicino sulla via dell'indirizzo).
La cella `pq-1-n` (a nord di `pq-1-0`) esiste solo per contenere due dei luoghi LUISS. Le piscine private non diventano più "fontane".
