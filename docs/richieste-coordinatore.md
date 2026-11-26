# Richieste al coordinatore

## Riferimenti verificati

Punti approssimati dei risultati selezionati in Google Maps. Sono coordinate del punto della sede, non rilievi dell’ingresso, della fermata della navetta o dei singoli edifici.

| Zona | Coordinate (latitudine, longitudine) | Riferimenti |
| --- | --- | --- |
| Romania 32 | 41.924490, 12.493939 | [Google Maps](https://www.google.com/maps/search/?api=1&query=Luiss%20Viale%20Romania%2032%20Roma), [Villa de Heritz](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/villa-de-heritz), [planimetria ECPR](https://ecpr.eu/Filestore/CustomContent/Standing%20Groups/SGEU%20-%20Conference/Campus_Map_Luiss_Rome_Updated.pdf) |
| Parenzo 11 | 41.921558, 12.513071 | [Google Maps](https://www.google.com/maps/search/?api=1&query=Luiss%20Via%20Parenzo%2011%20Roma), [sede Luiss](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/sede-di-parenzo), [Censimento del Ministero della Cultura](https://censimentoarchitetturecontemporanee.cultura.gov.it/scheda-opera?id=3128) |
| Pola 12 | 41.918961, 12.511279 | [Google Maps](https://www.google.com/maps/search/?api=1&query=Luiss%20Viale%20Pola%2012%20Roma), [Villa Alberoni e regolamento giardini](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/villa-alberoni) |

Parenzo è a est di Romania, leggermente più a sud. Pola è a sud-ovest di Parenzo e a sud-est di Romania. Il servizio documentato collega Romania e Parenzo. Le frequenze cambiano a seconda dei giorni e delle fasce orarie. I punti di imbarco nella mappa di gioco sono indicativi. [Luiss Green Mobility](https://www.luiss.it/it/ateneo/luiss-life/servizi-e-opportunita/luiss-green-mobility)

La planimetria ECPR distingue The Dome 2, Aula Polivalente e Aula Chiesa A200. Le fonti consultate descrivono un padiglione progettato da Gemma e Alvisi Kirimoto e indicano The Dome 1 come spazio di studio esterno al piano terra. Il confronto non basta a identificare con certezza The Dome 1 con l’edificio progettato dagli studi. Un atto progettuale del 2022 cita Dome 1 e Dome 2 in una procedura per strutture a tenda, ma non permette di concludere quali strutture siano in opera oggi. [Progetto del padiglione](https://www.alvisikirimoto.it/it/project/ex-palestra-luiss) · [Sale studio Luiss](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/sale-studio-e-lettura) · [Atto MIT](https://www.mit.gov.it/nfsmitgov/files/media/conferenza-servizio/2022-08/M_INFR.PRRM_.REGISTRO%20UFFICIALE%28U%29.0028225.17-08-2022.pdf)

## Oggetti da verificare per un intervento futuro

| Zona | Descrizione | Oggetto di gioco | Motivo |
| --- | --- | --- | --- |
| Romania 32 | Allineare il marciapiede, il varco e la relazione con Via Panama alla vista satellitare e alla planimetria. | `viale-ingresso-start`, `viale-ingresso-varco`, `entry-from-panama` | L’ingresso integrato usa una griglia rettangolare. La geometria, il perimetro e le distanze reali sono diversi. |
| Romania, area dei padiglioni | Controllare separatamente la pianta, la posizione degli accessi e la denominazione dei due Dome. Ottenere un rilievo per assegnare coordinate ai singoli fabbricati. | `dome-building`, `dome2-door`, `polivalente-door` | La mappa accosta ambienti distinti con sagome e distanze semplificate. Le fonti disponibili non verificano tutte le soglie. |
| Parenzo 11 | Usare il prospetto su Via Parenzo e la pianta del primo piano come riferimento per ingresso, corridoio e T02. | `parenzo-inside`, `parenzo-porta-seminario`, `navetta-sign` | Il gioco fa attraversare un esterno più un corridoio generico. Le coordinate del portone e della fermata effettiva non sono state rilevate. |
| Pola 12 | Rappresentare l’accesso con tessera e il percorso fino al cortile presso il Tinello, tenendo la villa come prospetto. | `pola-inside`, `pola-cortile` | La festa è un evento di finzione nel giardino. La pianta attuale è un cortile rettangolare e non riproduce fontana e giardino storico. |
| T02 e cortile di Pola | Valutare un ritratto separato per Dario e una posa per gli invitati dopo il discorso. | `parenzo-interno-npc`, `pola-cortile-npc` | Il dialogo usa gli interlocutori e la resa già disponibili. Dario parla da un tavolo nella scena, senza un nuovo NPC sulla mappa. |

## Stato e verifiche

Base letta su `main`: `0f08b1a`. La navetta Romania–Parenzo e l’abilitazione Green Mobility erano già presenti. Il caso della bici era nella scena T02, mentre `sport-adele` parlava di biciclette in un dialogo distinto. Il dialogo di Adele è rimasto intatto. L’abilitazione di gioco richiama patente e app, senza introdurre regole economiche o di prenotazione. [Notizia Luiss sulla flotta](https://www.luiss.it/it/ateneo/news-media/news/luiss-acea-e-renault-insieme-il-nuovo-progetto-di-car-sharing-elettrico)

I cambiamenti narrativi sono in `src/game.js` e `src/dialogue.js`. I salvataggi restano in versione 1. Semestre, docente e canale di **Sociologia della comunicazione** sono verificabili nella scheda 2026/27; lo studente e la lezione in gioco sono di finzione. L’orario di **Luiss Weekend** è quello indicato dalla radio. [Cattedra Luiss](https://www.luiss.it/it/ateneo/governance/faculty/cattedre-online/556/b/l25psbase/2026/sociologia-della-comunicazione) · [Radio Luiss](https://radioluiss.it/podcast/dalla-laurea-di-sofia-goggia-al-luiss-sport-forum-il-valore-della-dual-career-luiss-weekend-n-15/)

Il tornello riusa il Game Over con ripartenza già presente e resta escluso in modalità libera. L’ultima richiesta sullo splatter è stata interpretata come mantenimento dell’effetto in pixel art già presente su main, con testo sobrio e due vie per rinunciare prima del Game Over. Il «Guagliò!» usa una battuta originale e preferisce una voce napoletana del dispositivo, se disponibile. Il timbro reale dipende dal sistema. Nessuna registrazione è stata aggiunta. La Scopa e la mappa non sono state modificate.

| Verifica | Esito |
| --- | --- |
| `node scripts/build.mjs` | Passato in copia isolata, con due MP3 muti di prova. Gli originali restano nel repository e la preview li carica via HTTPS. |
| Prologo → varco → navetta → esito A → car sharing → Pola → epilogo | Passato in simulazione Node del gioco buildato, con interazioni di scena verificate. |
| Esiti B e C, riprova e conservazione della tappa | Passato in simulazione. |
| Ripresa a metà del seminario | Passato in simulazione. Tratti, log, vittorie, oggetti e fase intatti. |
| Esplorazione dopo l’epilogo e modalità libera | Passato in simulazione. Ritorno a Radio e trasporti disponibili in libera. |
| Tornello armato e disarmato, riprova, selezione voce napoletana | Passato in simulazione, con motore vocale simulato. Riproduzione reale e resa visiva da provare. |

## Ritocco dell’ingresso

La foto dell’ingresso mostra due pilastri chiari e un accesso carrabile aperto verso il viale interno. Nel gioco il tratto pieno diventa un’inferriata bassa con due pilastri ai lati del tornello. L’assetto del tornello è adattato al gioco. Il passaggio e le condizioni del badge restano quelli esistenti. [Foto dell’ingresso](https://retc.luiss.it/files/2016/05/Entrance.jpg) · [Percorso CIAC](https://easyconferences.eu/ciac2025/venue/)
