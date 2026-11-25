# Ultimo Posto

Gioco narrativo in 2D ambientato in una versione giocabile del campus LUISS di Viale Romania. Offre una modalità storia, la modalità libera, minigiochi e un editor del campus.

## Avvio

Apri `index.html` nel browser. Il gioco è autosufficiente. I progressi sono salvati nel browser utilizzato.

## Collaborazione

Crea un branch per la modifica e apri una pull request verso `main`. Chi ha accesso in scrittura può creare il branch nel repository. Gli altri contributori possono usare un fork e aprire una pull request.

- `index.html` contiene gli stili, la mappa iniziale in `edOriginal` e il codice del gioco.
- I dialoghi degli NPC sono in `conversations` e `nativeConversations`. Gli eventi della storia sono in `nativeScene`.
- L’editor esporta la mappa in JSON. Per modificare la mappa iniziale, integra il JSON nell’elemento `edOriginal`. Il blocco `edEmbedded` serve invece alle esportazioni giocabili personalizzate.
- Prima della pull request, apri il gioco e prova le modalità, i passaggi tra le aree o le interazioni coinvolte dalla modifica.

## GitHub Pages

In **Settings → Pages**, seleziona **Deploy from a branch**, poi il branch **main** e la cartella **/(root)**. GitHub Pages pubblica `index.html`. Quando una modifica entra in `main`, il sito viene aggiornato.
