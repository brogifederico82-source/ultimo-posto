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
