# Ultimo Posto

Gioco narrativo in 2D ambientato in una versione giocabile del campus LUISS di Viale Romania. Include la modalità storia, la modalità libera, minigiochi e un editor del campus.

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
