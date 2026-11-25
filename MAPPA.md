# Mappa di Ultimo Posto

Rilevazione iniziale su `c5bdb8c`. Build eseguita con Node e pagina aperta con Playwright. Catturate tutte le 32 zone. L'analisi iniziale in modalità libera trova 62 collegamenti interagibili e nessun oggetto con azione privo di un punto raggiungibile.

## Priorità rilevate

1. **Sovrapposizioni nel giardino integrato.** La bacheca è dentro la recinzione al tornello, il Luiss Shop occupa parte della stessa area di un albero e Nora si sovrappone a un muro all'orto.
2. **Orientamento nei piani.** Porte e scale appaiono come piccoli elementi simili fra loro. I piani quarto e quinto hanno pochi riferimenti visivi.
3. **Fedeltà.** Confrontare giardino e collegamenti con `src/plan.webp` e le fonti del README. Le posizioni esatte di arredi, porte e scale richiedono riferimenti più dettagliati.
4. **Varietà.** Le aule delle lezioni ripetono disposizione e palette. Alcuni interni non hanno un percorso visivo chiaro verso l'uscita.
5. **Prestazioni.** Le 32 zone e l'HTML autonomo vanno misurati su un profilo mobile prima di scegliere un intervento.

## Ciclo 1 · Sovrapposizioni

Spostate di poche caselle Nora, la bacheca del tornello e il Luiss Shop. UID, azioni e destinazioni restano gli stessi. La migrazione riconosce l'impronta `1176053` del giardino standard 144 × 144 e mantiene nome e impostazioni della planimetria.
