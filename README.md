# Ultimo Posto

Gioco narrativo in 2D ambientato in una versione giocabile del campus LUISS di Viale Romania. Include la modalità storia, la modalità libera, minigiochi e un editor del campus.

[Gioca a Ultimo Posto](https://brogifederico82-source.github.io/ultimo-posto/)

## Avvio

Dalla radice del repository, esegui `node scripts/build.mjs` con Node.js 22. Apri `dist/index.html` nel browser. Il gioco funziona anche offline e salva i progressi nel browser utilizzato.

## Dove modificare il gioco

| File | Contenuto |
| --- | --- |
| `src/index.html`, `src/styles.css` | Interfaccia e aspetto |
| `src/game.js` | Avatar, storia e stato della partita |
| `src/world.js`, `src/campus.json` | Movimento, visualizzazione e mappa |
| `src/dialogue.js` | Dialoghi, scene e interazioni |
| `src/minigames.js` | Regole e controlli dei minigiochi |
| `src/editor.js` | Editor, importazione ed esportazione |
| `src/plan.webp` | Planimetria di riferimento nell’editor |

L’editor esporta la mappa in JSON. Per aggiornare il campus predefinito, modifica `src/campus.json`. Il comando di build riunisce i sorgenti in un HTML autonomo e mantiene l’esportazione HTML dall’editor. La cartella `dist/` si genera dai sorgenti.

## Collaborazione

Clona il repository, crea un branch, modifica i sorgenti e verifica il gioco eseguendo il comando di build. Fai commit e push del branch, poi apri una pull request verso `main`. Chi ha accesso in scrittura può usare il repository direttamente. Chi contribuisce dall’esterno può fare lo stesso da un fork. Gli agenti di coding usano l’accesso GitHub del collaboratore che li esegue. Per chiedere un invito con accesso in scrittura, apri una issue con il modello **Richiedi accesso in scrittura**. Il proprietario decide chi invitare.

## GitHub Pages

In **Settings → Pages**, imposta **Source** su **GitHub Actions**. Le pull request eseguono la build. Dopo il merge su `main`, il workflow pubblica l’HTML generato su GitHub Pages.

## Riferimenti per il campus

- [Planimetria ECPR](https://ecpr.eu/Filestore/CustomContent/Standing%20Groups/SGEU%20-%20Conference/Campus_Map_Luiss_Rome_Updated.pdf) per l’ingresso, i padiglioni e Aula Chiesa A200.
- [Viale Romania](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/sede-di-viale-romania) per Shop, Radio Luiss e servizi.
- [Bilancio di sostenibilità Luiss 2024](https://www.luiss.it/sites/default/files/media-documents/Luiss_Bilancio_di_Sostenibilita_e_Impatto_2024-compresso.pdf) per l’orto.
- [Tutorato Luiss](https://www.luiss.it/it/ateneo/luiss-life/servizi-e-opportunita/tutorato/tutorato-di-ateneo) e [LOFT](https://www.luiss.it/it/ateneo/luiss-life/studentesse-e-studenti-iscritti/digital-skills/loft).
- [Luiss Green Mobility](https://www.luiss.it/it/ateneo/luiss-life/servizi-e-opportunita/luiss-green-mobility) e [guida di mobilità Luiss](https://learn.luiss.it/pluginfile.php/1654850/coursecat/description/Infopack%20for%20International%20Students%202024-2025.pdf) per la tratta Romania–Parenzo e il QR.
- [Linea 360 e fermata Romania](https://www.romamobile.it/paline/percorso/RM100334?id_palina=70481&nav=3).

Le posizioni di fermata, negozio, tornelli, arredi, scale e approdi sono adattate per il gioco dove manca una planimetria di dettaglio. Parenzo e Pola sono scene esterne preliminari.

La conversazione di Arianna riprende i concetti di ribalta e retroscena in [The Presentation of Self in Everyday Life](https://books.google.com/books/about/The_Presentation_of_Self_in_Everyday_Lif.html?id=6ZlYzgEACAAJ) di Erving Goffman.

## Scaletta della storia

1. **Romania · Triennale.** Mostra il badge, concorda il piano di studio al tutorato, segui Storia contemporanea in A200 e consegna il podcast al LOFT. Le aule A200 e A203 si raggiungono anche dal corridoio del secondo piano.
2. **Parenzo · Seminario.** Prenota la navetta Romania–Parenzo, mostra il QR di gioco ed entra nell’aula del seminario. Una volta presentato il caso, rientra a Romania.
3. **Pola · Laurea.** Completa l’abilitazione Green Mobility, raggiungi Pola con l’auto condivisa ed entra nel cortile della festa. Dopo il brindisi puoi continuare a esplorare.

La modalità libera mantiene disponibili navetta e car sharing fin dall’inizio. I minigiochi sono attività parallele alla triennale.

Per affinare la ricostruzione, il prossimo passaggio è confrontare percorsi e ingressi con foto o planimetrie di piano, a partire da atrio, scalinata e corridoio A200–A203. La [vista satellitare Google Maps](https://www.google.com/maps/place/LUISS+Guido+Carli/@41.9245095,12.4939844,415m/data=!3m1!1e3) mostra il rapporto dell’area di Romania con Via Panama. Il [percorso CIAC 2025](https://easyconferences.eu/ciac2025/venue/) documenta il collegamento pedonale verso The Dome. Gli interni di Parenzo e Pola sono interpretazioni giocabili.


Fonti per i capitoli successivi. [Sede di Via Parenzo](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/sede-di-parenzo) conferma Giurisprudenza. [Villa Alberoni](https://www.luiss.it/it/ateneo/luiss-life/hub-e-sedi/villa-alberoni) documenta il Tinello e la statua del Nilo come riferimenti visivi per Pola. Il seminario e la festa sono episodi di finzione.


In modalità storia, il rombo dorato indica la prossima interazione nella zona corrente. Compare anche sulla mappa del giardino. I riferimenti per distinguere gli interni includono il [progetto di Alvisi Kirimoto](https://www.alvisikirimoto.it/it/project/ex-palestra-luiss), che documenta il padiglione su due livelli con anfiteatro, e la [guida Luiss alle sale studio](https://learn.luiss.it/pluginfile.php/1654850/coursecat/description/20240306_Infopack%20Ridotto_v21_compressed.pdf), che indica T04 al piano terra, 107 al primo, Matroneo al terzo e A4/A5 al primo piano a Parenzo. Questi riferimenti indicano funzioni e piani, mentre la disposizione di porte e corridoi richiede una pianta di dettaglio.

La mappa distingue The Dome 1 e The Dome 2, con il padiglione 2 a ovest dell’edificio principale. L’Aula Polivalente è ora un ambiente separato. I collegamenti si ispirano alla [planimetria ECPR](https://ecpr.eu/Filestore/CustomContent/Standing%20Groups/SGEU%20-%20Conference/Campus_Map_Luiss_Rome_Updated.pdf). Sagome, distanze e interni sono ancora adattati alla griglia di gioco.
