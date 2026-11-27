# Piano: mappa reale dei Parioli, Pola, Parenzo e guida con il car sharing

## Stato (aggiornato)
- **Fatto:** dati reali dell'area (Overture Maps) in `data/mappa/overture/`; generatore `scripts/overture/to-zone.py`; 40 celle contigue di 110×90 tessere (3 m per tessera) tra Viale Romania 32, Viale Pola 12 e Via Parenzo 11, con strade, marciapiedi, edifici e verde veri, nomi veri delle vie; passaggio tra celle camminando; Pola e Parenzo ricostruite sulla geometria reale mantenendo porte e storia; zone generate escluse da salvataggi ed esportazioni.
- **In corso (agenti):** guida con il car sharing; nome della via nell'HUD, strisce pedonali, auto parcheggiate, pedoni e luoghi LUISS veri; confronto del campus di Viale Romania con i dati veri.
- **Da fare:** traffico reale sul grafo stradale, correzione del campus di Viale Romania in base al confronto, verifica sul campo (foto), conferma delle licenze Overture/OSM, interni delle sedi in base a planimetrie e foto.
- **Fonte dei dati:** il bucket pubblico di Overture Maps (`overturemaps-us-west-2`) era raggiungibile; OpenStreetMap, Overpass e i portali di Roma e Lazio no. La scansione si rifà con `scripts/overture/` (`scan2.py`, `scanall.py`, `geojson-metri.py`).

Il testo qui sotto è il piano originale (le parti già fatte sono indicate sopra).

Obiettivo: un quartiere esplorabile a piedi e in auto (stile GTA 1/2, vista dall'alto) con **strade, isolati ed edifici fedeli alla realtà**, e le tre sedi (Viale Romania 32, Viale Pola 12, Via Parenzo 11) ricostruite bene.
Stato onesto: la mappa attuale è disegnata a mano e approssimata; Pola e Parenzo sono due stanze piccole. Questo piano sostituisce l'approssimazione con dati veri.

## 0. Blocco da sbloccare subito
In questa sessione la rete verso OpenStreetMap e Overpass è **bloccata** (403 del proxy), quindi non posso ancora scaricare i dati veri. Due strade:
- tu abiliti gli host (`overpass-api.de`, `geoportale.comune.roma.it`, `dati.lazio.it`) nell'ambiente, e li scarico io;
- oppure scarichi tu l'estratto OSM della zona (vedi §2) e lo metti in `data/raw/`.
Senza dati veri il piano si ferma: non invento le strade.

## 1. Fonti (da incrociare, in ordine di affidabilità per scopo)
| Fonte | Cosa dà | Licenza / nota |
|---|---|---|
| [OpenStreetMap](https://www.openstreetmap.org/copyright) via Overpass | strade, sensi unici, edifici (impronte), nomi, parchi, fermate | ODbL: serve la dicitura "© OpenStreetMap contributors"; se pubblichi i file di dati derivati vanno sotto ODbL, il gioco come opera prodotta di norma no ([guida OSMF](https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ)). Verifica col testo ufficiale prima di pubblicare |
| [Geoportale di Roma Capitale](https://geoportale.comune.roma.it/catalogo/) | CTRN 2003/2014, servizi OGC (WMS/WFS) | dati aperti del Comune: citare la fonte ([open data](https://www.comune.roma.it/web/it/open-data.page)); alcuni livelli non sono scaricabili, da verificare uno per uno |
| [Open data Roma Capitale](https://dati.comune.roma.it/od/en/progetto.page) | toponomastica, civici, confini | CC BY 4.0 |
| [Open Data Lazio, CTR 5.000](https://dati.lazio.it/dataset/carta-tecnica-regionale-2002-2003-5k-roma) | cartografia tecnica 2002-03, quote | CC BY; dati vecchi (edifici nuovi come The Dome mancano) |
| Sito LUISS e planimetrie ufficiali | sedi, accessi, edifici del campus | contenuti protetti: usarli come riferimento, non copiarli |
| Fotografie e satellite (Google Earth, Maps) | verifica a occhio di facciate, incroci, civici | **non** estrarre dati da Google: termini d'uso lo vietano; solo confronto visivo |
| Mapillary / foto proprie sul posto | facciate, insegne, cartelli, segnaletica | foto tue = libere; Mapillary ha propria licenza |
| Sopralluogo | l'unica verifica finale vera | gratuito, insostituibile per i dettagli (civici, cancelli, sensi unici) |

Regola di qualità: ogni strada ed edificio nel gioco deve avere una **fonte registrata** (`data/fonti.csv`) e uno stato (verificato / da verificare). Dove le fonti si contraddicono, vince il sopralluogo.

## 2. Zona da coprire
- Quartiere Parioli (e confinanti utili alla guida) con Viale Romania, Via Panama, Villa Ada, Viale Pola e Via Parenzo. Il perimetro esatto lo fissiamo guardando la mappa insieme; l'area va misurata, non stimata a occhio (distanze reali tra le tre sedi da verificare prima di decidere la scala).
- Estratto OSM: riquadro (bounding box) più margine di 300 m, in formato `.osm.pbf` o JSON Overpass.

## 3. Cambiamenti tecnici necessari (il motore di oggi non basta)
Oggi una zona è al massimo 144×144 tessere, con 34 zone in totale, tutto in memoria. Un quartiere reale serve:
1. **Mondo a blocchi (chunk):** celle di 64×64 tessere caricate e scaricate in base alla posizione. Le zone interne (aule, mensa, Pola, Parenzo dentro) restano zone separate raggiunte da porte.
2. **Scala:** decisione da prendere con i dati in mano (es. 1 tessera ≈ 3-4 m): strade larghe 2-4 tessere, abbastanza larghe per l'auto, edifici leggibili.
3. **Pipeline dati → mappa:** script `scripts/osm-to-map.mjs` che converte strade (con larghezza e senso unico), impronte degli edifici (semplificate sulla griglia), parchi, marciapiedi in oggetti del gioco. Output in file di dati, non scritto a mano. Rilanciabile quando cambiano le fonti.
4. **Edifici:** generati dalle impronte, con altezza stimata dal numero di piani (se in OSM) e stili per tipo (residenziale, villino, istituzionale). I campus (Romania, Pola, Parenzo) restano disegnati a mano sopra la base generata.
5. **Navigazione:** grafo stradale dalla stessa fonte, usato per l'auto e per i bus/le auto di traffico (oggi il traffico è un loop fisso).

## 4. Guida con il car sharing (stile GTA vecchi)
- Modalità guida: vista dall'alto, auto Renault 5 E-Tech del car sharing LUISS (dati reali già nel gioco: flotta e regole di accesso).
- Fisica semplice a risposta arcade: accelerazione, sterzo, freno, derapata leggera; collisioni con edifici e auto; marciapiedi percorribili solo a piedi.
- Regole: sensi unici e semafori come optional (prima versione: solo sensi unici); traffico e pedoni che reagiscono; "multa" o danni invece di violenza gratuita.
- Prendi/lascia l'auto solo nei punti reali del car sharing; le destinazioni della storia (Pola, Parenzo) diventano tragitti veri.
- Mappa piccola e radar in HUD; audio motore con il mixer esistente.

## 5. Sedi fatte bene
- **Viale Romania 32**: rifare il campus sulle impronte vere (villa de Heritz, chiesa, chiostro, The Dome), correggendo l'attuale mappa.
- **Viale Pola 12**: Villa Alberoni, giardino formale, fontana, pini; accesso con tessera (vincolo già nella storia).
- **Via Parenzo 11**: edificio di Giurisprudenza e il suo isolato.
- Interni (aule, atrio, uffici) restano come le zone di oggi, arricchite dopo un sopralluogo o foto.

## 6. Tappe
1. **Dati:** sbloccare la rete (§0), scaricare OSM e i layer del Comune, registrare le fonti. *(1-2 giorni)*
2. **Pipeline:** script strade + edifici, anteprima su una mappa statica per confrontarla con la realtà. *(3-5 giorni)*
3. **Motore a blocchi:** caricamento dinamico, camera, collisioni sui dati generati; salvataggi vecchi devono continuare a funzionare. *(1 settimana)*
4. **Campus rifatti** sulla base nuova. *(1 settimana)*
5. **Guida:** auto, fisica, punti car sharing. *(1 settimana)*
6. **Traffico e vita:** auto e pedoni sul grafo reale, negozi con insegne vere. *(1 settimana)*
7. **Verifica sul campo** e correzioni; attribuzioni e licenze nel gioco. *(continua)*

## 7. Rischi
- **Peso:** un quartiere intero renderizzato a 16 px/tessera è grande: servono chunk, cache e probabilmente un livello di dettaglio ridotto fuori schermo.
- **Fedeltà vs giocabilità:** strade reali strette sono scomode in gioco; useremo la geometria reale ma strade leggermente più larghe, dichiarandolo.
- **Licenze:** attribuzione obbligatoria; non usare dati estratti da Google; non copiare planimetrie LUISS.
- **Mobile:** il gioco deve restare giocabile su telefono; prove su dispositivo reale prima di andare avanti.
- **Tempo:** è il lavoro più grosso del progetto, comparabile a tutto quello fatto finora. Va a fasi con qualcosa di giocabile a ogni tappa.

## 8. Decisioni che servono da te
1. Sblocchi la rete (§0) o mi dai tu l'estratto dati?
2. Perimetro: tutti i Parioli fino a dove? (lo vediamo sulla mappa).
3. Priorità: prima la mappa reale a piedi, o prima la guida? Consiglio la mappa, perché la guida ne dipende.
4. Sopralluogo: puoi fare foto delle tre sedi e degli incroci principali?
