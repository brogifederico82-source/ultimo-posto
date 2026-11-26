# Fonti dei dati mappa

Questa cartella raccoglie le query per i dati geografici di Parioli, Viale Romania, Viale Pola e Via Parenzo, e il registro delle fonti.

## File

- `overpass/strade.ql`: strade (`highway`).
- `overpass/edifici.ql`: edifici (`building`).
- `overpass/verde.ql`: parchi, giardini e prati (`leisure`, `landuse`).
- `overpass/campus.ql`: nodi e way con nome LUISS, Pola, Parenzo, Heritz, Alberoni.
- `fonti.csv`: registro delle fonti, con licenza, attribuzione, uso e stato.

Ogni query ha in cima la bounding box `(sud,ovest,nord,est)`. I valori attuali (41.9250, 12.4950, 41.9360, 12.5100) sono provvisori: confermarli sulla mappa prima di scaricare. Se cambiano, vanno aggiornati in ogni file, perché la box è scritta direttamente nelle istruzioni `(...)`.

## Come scaricare

**Web UI (Overpass Turbo):** aprire l'editor Overpass Turbo nel browser, incollare il contenuto del file `.ql` e premere "Esegui". Il risultato si esporta come GeoJSON o JSON dal menu di esportazione.

**API:** con `curl` si può inviare il file così:

```
curl -X POST --data-binary @overpass/strade.ql https://overpass-api.de/api/interpreter -o strade.json
```

Usare `--data-binary @file` per inviare il file come corpo della richiesta. Il risultato è JSON (`[out:json]`) con geometria inclusa (`out body geom;`).

Salvare i file scaricati fuori da `src/`, `dist/` e `docs/`. Non committare i dati grezzi senza aver verificato la licenza.

## Registrare una fonte

Per ogni elemento della mappa usato nel gioco (strade, edifici, verde, campus, foto, riferimenti), aggiungere o aggiornare una riga in `fonti.csv`:

- indicare la fonte nella colonna `fonte` e l'URL in `url`;
- copiare la licenza e la formula di attribuzione dalla fonte, senza inventarle;
- portare `stato` da `da verificare` a `verificata` solo dopo aver controllato la licenza sul sito della fonte.

Per i layer del Geoportale di Roma Capitale la licenza va verificata uno per uno.

## Attribuzione da mostrare nel gioco

Testo minimo da mostrare, per esempio nei crediti:

> Mappa: © OpenStreetMap contributors (ODbL).

Aggiungere le righe delle altre fonti usate, con la formula indicata in `fonti.csv` dopo averla verificata. Le fonti con `stato` ancora `da verificare` non vanno citate come definitive.

## Limiti

Questa cartella è stata preparata senza accesso alla rete. Le query non sono state eseguite, quindi non è verificato che restituiscano dati né quanto siano pesanti. Anche le licenze di Geoportale, dataset Roma Capitale e CTR Lazio, e la formula esatta di attribuzione, vanno controllate sui siti delle fonti.
