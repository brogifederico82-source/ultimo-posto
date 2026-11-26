# Ultimo Posto online: piano

Stato: **base pronta nel client, server non ancora costruito.** Questo documento dice cosa c'è, cosa manca e cosa va deciso prima.

## 1. Cosa c'è già nel repository
- `src/online.js`: profilo (nome, cognome, soprannome, consenso) nelle Opzioni, lettura degli sticker (`?s=CODICE`), client WebSocket spento (si accende con `window.UP_SERVER`).
- `scripts/qr-stickers.mjs` + `docs/stickers/sticker.svg`: foglio di 8 sticker con QR, uno per luogo (ingresso, mensa, aula studio, bar, radio, Dome, fermata 360, Villa Ada). Il dominio nel QR è un segnaposto: va rigenerato con l'indirizzo vero.
- Ricompensa una tantum alla prima scansione di ogni sticker (toast "Hai trovato uno sticker").

## 2. Sticker con QR
1. Pubblica il gioco su un indirizzo stabile (GitHub Pages o dominio proprio, con HTTPS).
2. `npm i --no-save qrcode && node scripts/qr-stickers.mjs https://TUO-DOMINIO/ docs/stickers`
3. Stampa su adesivi resistenti, almeno 4×4 cm per QR (a 25 cm di distanza si legge bene; testato solo a schermo).
4. **Autorizzazione:** affiggere sticker nel campus richiede il permesso della LUISS (o limitarsi a luoghi tuoi o autorizzati). Senza, rischi rimozione e problemi disciplinari. Alternativa senza permessi: locandine in aule o bacheche che concedono l'uso.
5. Un codice per luogo fisico permette di misurare quali sticker funzionano (conteggio per codice, senza dati personali).

## 3. Multigiocatore: architettura consigliata
- **Server:** Node.js con WebSocket (libreria `ws`, oppure Colyseus se vuoi stanze e sincronizzazione pronte). Il server è l'autorità su posizione e zona; il client invia solo input e posizione, il server limita velocità e muri (anti-cheat di base).
- **Stanze:** una per zona della mappa (34); gli altri giocatori compaiono solo nella tua zona. 10 tick al secondo bastano per un gioco a tessere; interpolazione sul client.
- **Cosa si sincronizza:** posizione, direzione, avatar, soprannome, emote. NON la progressione di storia: resta locale (i salvataggi esistenti non cambiano).
- **Interazioni tra giocatori (in ordine di costo):** emote e saluto, chat a frasi predefinite (niente testo libero all'inizio), scambio di sticker, sfide a Briscola e Scopa, poi chat libera con moderazione.
- **Sempre attivo:** hosting con processo gestito. Opzioni: Fly.io, Railway o Render (da pochi euro al mese con una macchina sempre accesa; i piani gratuiti si addormentano, quindi non vanno bene), oppure un VPS piccolo con `systemd` o Docker. Servono health check, riavvio automatico e log.
- **Account:** senza password all'inizio, solo soprannome + codice dispositivo; email o Google solo se serve davvero il salvataggio sul cloud.

## 4. Nome e cognome: rischi veri
- Sono dati personali, e molti utenti sono studenti (anche minorenni non si possono escludere): serve **informativa privacy, base giuridica (consenso) e possibilità di cancellazione** (GDPR).
- Scelta fatta nel client: gli altri vedono il **soprannome**, oppure nome e iniziale del cognome; il cognome intero non viene mai mostrato in pubblico.
- Chat libera = moderazione, segnalazione e blocco. Vanno previsti prima di aprire.
- Non usare mai dati o loghi LUISS come se il gioco fosse ufficiale senza il loro consenso.

## 5. Tappe
1. Pubblicazione stabile + sticker (1 giorno, dipende dai permessi).
2. Server "presenza": vedere gli altri camminare, solo soprannomi (2-4 giorni).
3. Emote, saluti, frasi predefinite (1-2 giorni).
4. Sfide a carte tra giocatori (1 settimana).
5. Account, moderazione, privacy (prima di qualsiasi apertura pubblica).

## 6. Decisioni che servono da te
- Dove ospitare il server e quanto vuoi spendere al mese.
- Se gli sticker sono autorizzati dalla LUISS o vanno solo in luoghi tuoi.
- Se la chat libera esiste subito o solo frasi predefinite.
