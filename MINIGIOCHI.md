# Minigiochi di Ultimo Posto

Base: `3c321b1`. Rilevazione Playwright su Chromium desktop e profilo touch iPhone 13 emulato. L'apertura di ogni sfida è stata verificata in entrambe le configurazioni. I voti iniziali sono una valutazione qualitativa, senza misurazione degli FPS su hardware mobile. G/F/C/R/A = grafica, fluidità percepita, comandi, feedback, audio.

| Minigioco | Prima G/F/C/R/A | Difetto principale |
| --- | --- | --- |
| Virtuali | 6/7/8/6/3 | Campo essenziale e azioni poco distinte |
| Calcetto | 6/7/7/7/5 | Urti e tiri al volo difficili da leggere |
| Biliardino | 6/7/7/7/5 | Poco movimento visibile delle stecche |
| Ping pong | 6/7/7/7/5 | Contatto e traiettoria della palla poco marcati |
| Briscola | 6/8/8/7/3 | Distribuzione e prese quasi mute |
| Scopa | 6/8/7/7/3 | Prese e scope con poco rilievo |
| Poker | 7/8/7/7/3 | Fiches e distribuzione quasi mute |
| Cavalli | 5/7/8/7/4 | Simboli al posto di cavalli e fantini |
| Mattoni | 6/7/7/7/5 | Impatti e rimbalzi poco leggibili |
| Nastri | 6/7/7/7/5 | Segnali di presa e caduta simili |
| Braccio di ferro | 6/7/7/7/5 | Fasi del round poco distinte |
| Ballo | 6/7/8/7/5 | Poco riscontro sul tempo della mossa |

## Stile comune

Fondo blu notte, ciano per il giocatore, ambra per avversari e avvisi. Contorni chiari di una o due unità, ombre corte, numeri monospaziati per timer e punteggi. Pulsanti coerenti con il gioco base, con focus visibile e aree di tocco ampie. Transizioni brevi, ridotte con l'impostazione di sistema. Suoni sintetici corti con attacco morbido. Punteggio, tempi e risultati leggibili anche con tutti i canali muti.

## Suoni mancanti o indistinti sulla base

Interfaccia: pulsanti, menu, scelte, errori. Mappa: passi, porte, scale, tornello, avvicinamento dei veicoli, conferma acquisti, riconoscimento obiettivi. Le monete e alcuni acquisti avevano già un segnale generico. Virtuali: fischio, passaggi, tiro, parata, palo, rete e folla. Sport: calci, impatti, sponde e gol distinguibili. Carte: mescola, distribuzione, giocata, presa, scopa e fiches. Cavalli: zoccoli, folla e arrivo. Altri: colpi, ritmo e fine partita con segnali dedicati.

## Valutazione dopo i cicli

| Minigioco | Dopo G/F/C/R/A | Cosa è cambiato |
| --- | --- | --- |
| Virtuali | 8/8/8/8/8 | Maglie, corsa, ombre, rete, telecronaca e replay dell'ultimo gol |
| Calcetto | 8/8/7/8/8 | Passi animati, ombre, particelle e segnali separati per tiro e gol |
| Biliardino | 8/8/7/8/7 | Stecche con ombre, impugnature, rotazione visibile e sponde sonore |
| Ping pong | 7/8/7/8/7 | Ombre, scia e rimbalzi riconoscibili |
| Briscola | 7/8/8/8/8 | Distribuzione, giocate e prese sonore, comparsa breve delle carte |
| Scopa | 7/8/7/8/8 | Suoni separati per presa e scopa, carte animate |
| Poker | 8/8/7/8/8 | Distribuzione, fiches, pausa delle mosse e trattamento comune delle carte |
| Cavalli | 8/8/8/8/8 | Cavalli e fantini, galoppo, zoccoli, classifica al fotofinish |
| Mattoni | 7/8/7/8/8 | Mattoni con ombra, scia e impatto distinto |
| Nastri | 7/8/7/7/8 | Ombre e segnalazione distinta di presa e caduta |
| Braccio di ferro | 7/8/7/8/7 | Tacche dei tentativi e riscontro per presa o errore |
| Ballo | 7/8/8/8/7 | Colore della freccia dopo ogni mossa e suono al tempo corretto |

### Suoni da ascoltare

- **Interfaccia:** clic, apertura menu e segnale d'errore al tornello.
- **Mappa:** passi su prato, pavimentazione e pavimento, porte, scale, tornello, traffico vicino, monete, acquisti e obiettivi.
- **Virtuali:** fischi, passaggi, tiro, deviazioni del portiere, palo, gol e folla. Il replay non liquida una seconda puntata.
- **Sport:** calci, rimbalzi, traversa, sponde e gol. **Carte:** mescola, distribuzione, giocata, presa, scopa e fiches.
- **Cavalli e LOFT:** partenza, cadenza degli zoccoli, folla, arrivo, rimbalzi, mattoni e cassette. Il ballo e il braccio di ferro distinguono riuscita ed errore.
- **Voci:** prova vocale e incontri del campus, tramite sintesi del browser.
- **Fumo:** pacchetto, accendino, brace, soffio, cenere e spegnimento.

### Verifica e lavoro aperto

Build offline ed esecuzione Playwright su desktop e telefono emulato. Per tutti i 12 giochi: apertura, scenario di finale controllato e console. Registrazioni brevi delle sequenze di prova. Nel confronto sono state guardate le tavole prima/dopo su entrambi i profili. Campioni da 750 ms di richiesta dei frame: circa 60 FPS, intervallo al 95º percentile di circa 17 ms. I dati misurano l'output del browser di prova e non la resa su un telefono fisico o a 120 Hz.

Verificati pausa, muto, ripristino, recupero vecchio volume musica, uso di F, pressione a tocco, acquisto, pacchetto vuoto, riacquisto e recupero di un vecchio inventario. Il fotofinish mostra un ordine d'arrivo leggibile. La pista resta a corsie. I test dei 12 finali usano stati controllati per raggiungere le condizioni di fine partita. La copertura completa delle partite con ciascun metodo d'ingresso, la resa su hardware mobile e i voti inferiori a 8 restano aperti. Anche il mazzo illustrato originale, la resa ad alta densità e la copertura sistematica di tutti gli errori dell'interfaccia restano da completare.
