const htmlTemplate=document.documentElement.outerHTML;
"use strict";
const $ = id => document.getElementById(id);
const english={"Domani, ore 9:00": "Tomorrow, 9 a.m.", "Il telefono vibra sul marciapiede di Viale Romania. Il gruppo del corso manda l’ultimo messaggio: «Domani alle 9. Portate il documento». Hai un portatile quasi scarico, gli appunti a metà e un pomeriggio per rimediare.": "Your phone buzzes on Viale Romania. The class group sends one last message: “Tomorrow at nine. Bring ID.” Your laptop is nearly dead, your notes are half done, and you have one afternoon to fix it.", "Cerco una presa": "I’ll find an outlet", "Cerco un posto in silenzio": "I’ll find somewhere quiet", "Sull’altro lato del viale, due studenti spariscono oltre i pilastri della LUISS. Un motorino passa davanti alle strisce. La guardia è già al suo posto. Devi solo arrivare dall’altra parte.": "Across the road, two students disappear past the LUISS pillars. A scooter passes the crossing. The guard is already there. You just need to make it to the other side.", "Aspetta un varco e parti": "Wait for a gap and go", "Chiedi del campus": "Ask about the campus", "Chiedi com’è andato l’ultimo esame": "Ask how the last exam went", "«Se cerchi un tavolo, al Dome c’è sempre qualcuno che sta per andare via. Almeno, così dice.»": "“If you need a table, there’s always someone at the Dome who says they’re about to leave.”", "«Dal bar segui il vialetto verso i portici. Lì si sente meno il via vai.»": "“From the café, follow the path to the porticoes. It’s quieter over there.”", "«Mi hanno chiesto l’unica pagina che avevo saltato. Da allora studio anche l’indice.»": "“They asked about the only page I skipped. Now I study the index too.”", "«Eccoti, la star del campus!» Il barista ti saluta facendo la prima mossa del tuo balletto.": "“There’s our campus star!” The barista greets you with the first move from your dance.", "Chiedi del tavolo dopo pranzo": "Ask about the table after lunch", "Pranza e aspetta che si liberi il tavolo": "Have lunch and wait for the table", "«Sei tu nel video, vero?» Una studentessa sposta lo zaino. «Fai il passo finale e questo posto è tuo.»": "“That’s you in the video, right?” A student moves her bag. “Do the last move and this seat is yours.”", "Rifai il passo finale": "Do the last move", "Il tavolo dopo pranzo": "The table after lunch", "Le sedie sono libere. Dalla finestra si vede il cortile, ma qui dentro arriva solo un filo di rumore.": "The chairs are free. You can see the courtyard through the window and barely hear it.", "Il gruppo sta ancora pranzando. Puoi aspettare al bar.": "The group is still eating. You can wait at the café.", "Sul tavolo ci sono vassoi e quaderni. Il barista potrebbe sapere quando si libera.": "There are trays and notebooks on the table. The barista might know when it’s free.", "Due pagine in pace": "Two pages in peace", "Finalmente apri gli appunti. Fuori ricomincia il biliardino. Per la prima volta oggi, non devi alzarti.": "You finally open your notes. Outside, the foosball starts again. For the first time today, you don’t have to get up.", "Aula studio · Portico": "Study room · Portico", "Aula studio del portico": "Portico study room", "Sotto i portici c’è la porta dell’aula studio.": "The study room door is under the portico.", "Torna al cortile": "Return to the courtyard", "Tavolo vicino alla finestra": "Table by the window", "Questo cortile è tranquillo finché nessuno organizza un aperitivo di dipartimento.": "This courtyard is quiet until someone organises a department drinks reception.", "Il tavolo vicino alla finestra è il migliore. Da qui senti perfino le penne.": "The window table is the best. You can even hear people writing.", "Le scale del primo piano sono aperte. Parla con il barista del tavolo che si libera dopo pranzo.": "The first-floor stairs are open. Ask the barista about the table that frees up after lunch.","Le riunioni si fanno al bar. I verbali? Quelli li scriviamo dopo.": "We hold meetings at the café. The minutes? We write those later.", "Al Dome siediti lontano dalle prese: lì nessuno discute per il caricatore.": "Sit away from the sockets at the Dome. No one fights over chargers there.", "L’appello è domani. Il ripasso di gruppo di oggi è un esperimento sociale.": "The exam is tomorrow. Today’s group revision is a social experiment.", "Sotto la pergola si studia bene. Prima però devi battere i Nullafacenti.": "The pergola is a good place to study. First you have to beat the Slackers.", "Continuo a seguire le indicazioni. Sono al terzo giro dello stesso pino.": "I keep following the signs. This is my third lap around the same pine.", "Quello era il cancello dell’ala est. Adesso il sentiero continua fino al parcheggio.": "The path goes all the way to the parking area.", "Occhio ai motorini: quando trovano posto accostano senza pensarci due volte.": "Watch the scooters. When they spot a space, they pull in without a second thought.", "Per il ping pong vai davanti al bar. Se vinci, chiedi al barista della limonata.": "Table tennis is outside the café. If you win, ask the barista about lemonade.", "Trend di ballo": "Dance trend", "Balla con loro": "Dance with them", "Chiedi del prossimo trend": "Ask about the next trend", "«Cinque mosse per il video. Sei nel cast dal momento in cui sei passato davanti alla telecamera.»": "“Five moves for the video. You joined the cast when you walked past the camera.”", "Segui le frecce prima che scada il tempo. Servono almeno quattro mosse su cinque.": "Follow the arrows before time runs out. Land at least four out of five moves.", "Il video è pronto.": "The video is ready.", "Gettone limonata": "Lemonade token", "Hai ottenuto una limonata al bar.": "You earned a lemonade at the café.", "Limonata al bar": "Lemonade at the café", "Ritira la limonata": "Collect your lemonade", "Ordina un espresso": "Order an espresso", "Prendi un panino": "Get a sandwich", "Chiedi dove studiare": "Ask where to study", "Al bancone c’è un menu scritto a mano. Fuori, la terrazza è già piena.": "There is a handwritten menu on the counter. Outside, the terrace is already full.", "Si gioca a sette punti, con almeno due di vantaggio. Se vinci, il bar ti offre una limonata.": "First to five points. Win and the café gives you a lemonade.", "Ti ha colpito un motorino in cerca di parcheggio.": "You were hit by a scooter looking for parking.", "Riprova dall’ingresso": "Retry from the entrance", "Biliardino · Terrazza": "Foosball · Terrace", "Ping pong · Terrazza": "Table tennis · Terrace","Scale · Accesso chiuso":"Stairs · Access locked","Il primo piano si sblocca vincendo a biliardino al bar.":"Win at foosball in the café to unlock the first floor.","Da questa parte, secondo il cartello più ottimista.":"This way, according to the more optimistic sign.","Vai":"Go","Lello e Bea, creator napoletani":"Lello and Bea, creators from Naples","Trend superato":"Trend survived","«Se ti riconoscono in biblioteca, ricordati che il credito va a noi.»":"“If they recognise you in the library, remember who made you famous.”","«Ti rubiamo dieci secondi.» Hanno già tirato fuori due telefoni, un treppiede e una liberatoria.":"“We just need ten seconds.” They already have two phones, a tripod and a release form.","Faccio il trend, ma al primo ciak":"I’ll do it in one take","POV: dovevi studiare":"POV: you were supposed to study","No, cercavo un posto per studiare":"No, I’m looking for somewhere to study","Hai rifiutato di fare da comparsa.":"You turned down a role as an extra.","Sandro e Lina, squadra pulizie":"Sandro and Lina, campus cleaners","Sandro spazza, Lina tiene il conto. «Terzo coriandolo a forma di grafico a torta. C’è di nuovo un convegno.»":"Sandro sweeps, Lina keeps count. “Third piece of pie-chart confetti. Must be another conference.”","Spazzata":"Cleanup","Tieni aperto il sacco":"Hold the bag open","Pulizia straordinaria":"Emergency cleanup","Nota del Dome":"Dome note","A200 · Evento privato":"A200 · Private event","Dietro il cordone passano un sottosegretario, una CEO e un tizio che saluta tutti senza fermarsi. L’addetta scorre la lista. «Lei è nella sezione invisibile.»":"A junior minister, a CEO and a guy who waves without stopping pass behind the rope. The attendant checks her list. “You’re in the invisible section.”","Lista controllata":"Guest list checked","Chiedi di ricontrollare la lista":"Ask them to check the list again","Networking da dietro il cordone":"Networking from behind the rope","L’ospite con il pass":"The guest with a pass","«Dov’è l’A200? Dovevo essere al panel sul valore della puntualità.»":"“Where’s A200? I’m meant to be on a panel about punctuality.”","Indica l’Aula Chiesa":"Point out the Aula Chiesa","Dritta sul Matroneo":"Matroneo tip","L’ospite ti ringrazia. Il suo panel inizia con venti minuti di ritardo.":"The guest thanks you. His panel starts twenty minutes late.","I baristi":"The baristas","Caffè ristretto":"Short espresso","«Vuoi lo scontrino?» Lo dice come se la risposta potesse finire a verbale.":"“Want a receipt?” He says it like your answer might go on record.","Il barista con le nocche tatuate guarda la fila. L’altro conta le monetine in silenzio. Sul grembiule c’è scritto «Buona condotta».":"The barista with tattooed knuckles watches the queue. The other counts coins in silence. His apron says “Good Conduct.”","Ordina il caffè ristretto":"Order a short espresso","Caffè a regime di massima sicurezza":"Maximum-security coffee","La guardia":"The guard","Ti scruta in silenzio. Poi scruta lo zaino. Lo zaino sembra più preparato di te.":"The guard looks you over, then looks at your bag. Your bag seems better prepared than you.","Via libera":"Clearance","Mostra il badge":"Show your badge","La guardia approva il badge. Su di te si riserva. ":"The guard approves your badge. The jury is still out on you.","Sostieni lo sguardo e saluta":"Make eye contact and say hello","La guardia ricambia il saluto. Non succedeva dal 2018.":"The guard says hello back. First time since 2018.","Vittoria ai punti":"Win on points","Bacheca del campus":"Campus noticeboard","Tra un seminario sul futuro e un volantino per ripetizioni di micro c’è una nota sui posti al Dome.":"Between a seminar on the future and a flyer for microeconomics tutoring, you find a note about seats at the Dome.","Leggi il retro":"Read the back","Il retro della locandina":"The back of the flyer","Tornello":"Turnstile","Il display alterna «prego» e «riprovare». La guardia è l’unica che parla entrambe le lingue.":"The display alternates between “go ahead” and “try again.” The guard is fluent in both.","Entra nel campus":"Enter the campus","La nota diceva di guardare dietro la pianta. C’è un tavolo, una sedia e perfino una presa.":"The note said to look behind the plant. There’s a table, a chair and even a power outlet.","I tavoli visibili sono pieni. Un ficus di dimensioni ingiustificate copre metà vetrata.":"Every visible table is taken. An unreasonably large ficus blocks half the window.","Il posto dietro il ficus":"The seat behind the ficus","Apri gli appunti. Il ficus è il primo compagno di studio che non ti chiede gli appunti.":"You open your notes. The ficus is the first study partner who hasn’t asked to borrow them.","Sbircia dietro il ficus":"Look behind the ficus","I pendolari della presa":"The power-outlet commuters","«C’è posto in T04, ma guarda bene. Qui una felpa lasciata su una sedia ha più diritti di un matricolato.»":"“There’s room in T04, but look closely. A hoodie left on a chair has more rights than a first-year student.”","Presta il tuo caricatore":"Lend your charger","Presa condivisa":"Shared outlet","Aula T04":"Room T04","Lo studente del giardino ti fa cenno. Ha tenuto una sedia e trovato una ciabatta.":"The student from the garden waves you over. They saved you a chair and found a power strip.","C’è una sedia occupata da una felpa. Nessun proprietario in vista. Sul banco accanto c’è un posto libero, lontano dalla presa.":"A hoodie is occupying one chair, with no owner in sight. There’s a free seat at the next desk, far from the outlet.","T04, con corrente":"T04, with power","Studio in modalità risparmio":"Study in battery-saver mode","Una presa per due. Funziona meglio di certi lavori di gruppo.":"One outlet for two. It works better than some group projects.","Il portatile segna 4%. Con carta e penna duri senz’altro più di lui.":"Your laptop is at 4%. You’ll last longer with pen and paper.","Terrazza ping pong":"Table tennis terrace","Il varco nei pressi della terrazza dà accesso all’ala est. Qui accettano ancora rivincite.":"The gate by the terrace leads to the east wing. They’re still taking rematches.","Il custode dell’ala est ha lasciato la chiave all’arbitro. Batti l’avversario per aprire il varco.":"The east-wing caretaker left the key with the referee. Beat your opponent to open the gate.","Gioca a ping pong":"Play table tennis","Varco dell’ala est":"East-wing gate","La chiave gira. Al di là della siepe inizia il sentiero per il portico.":"The key turns. A path to the portico starts beyond the hedge.","Il varco è chiuso. Vinci a ping pong sulla terrazza per aprirlo.":"The gate is locked. Win at table tennis on the terrace to open it.","Entra nell’ala est":"Enter the east wing","Portico dell’ala est":"East-wing portico","C’è un tavolo all’ombra e un’unica presa. Qualcuno ha lasciato un cartello: «Riservato a chi ha vinto almeno una discussione con la segreteria». La tessera del torneo convince tutti.":"There’s a table in the shade and one outlet. A sign reads “Reserved for anyone who’s won an argument with administration.” Your tournament pass does the trick.","Il tavolo dell’ala est":"The east-wing table","Appoggi il libro sul tavolo. Ci hai messo due set di appunti e una racchetta, ma adesso puoi studiare.":"You set down your book. It took two sets of notes and a paddle, but you can finally study.","Pergola di lettura":"Reading pergola","Mostri la carta fortunata al ragazzo che gestisce i tavoli. Ti indica il posto in fondo, lontano dal bar.":"You show your lucky card to the person in charge of the tables. They point you to a seat far from the café.","I Nullafacenti hanno riservato questo tavolo al vincitore di Briscola. Li trovi al bar.":"The Slackers saved this table for the Briscola winner. Find them in the café.","Il posto sotto la pergola":"A seat under the pergola","La carta fortunata fa da segnalibro. Da qui il bar si sente appena.":"You use the lucky card as a bookmark. You can barely hear the café from here.","Il tavolo dei Nullafacenti":"The Slackers’ table","La carta fortunata ti dà accesso alla pergola, a ovest del giardino. I Nullafacenti chiedono la rivincita.":"Your lucky card opens the reading pergola west of the garden. The Slackers want a rematch.","«Lezione? L’abbiamo messa tra gli impegni eventuali.» Vinci a briscola per ottenere la carta che apre il posto studio alla pergola.":"“Class? We pencilled it in under ‘maybe’.” Win at Briscola for the card that gets you a study spot under the pergola.","Gioca a briscola":"Play Briscola","Chiedi dov’è il silenzio":"Ask where it’s quiet","La leggenda di un piano silenzioso":"The legend of a quiet floor","Biliardini":"Foosball tables","La prenotazione del bar apre le scale del primo piano. Il portiere chiede una rivincita.":"The café pass unlocks the first-floor stairs. The goalkeeper wants a rematch.","Vinci la partita e i baristi ti danno la prenotazione per salire al primo piano dell’edificio principale.":"Win the match and the baristas will give you a pass to the first floor of the main building.","Gioca a biliardino":"Play foosball","Mensa":"Dining hall","Vassoio":"Tray","La pasta è ancora in piedi da sola. Apprezzi la coerenza strutturale.":"The pasta can still stand on its own. You appreciate its structural integrity.","Il purè ha la consistenza di un progetto di gruppo: tiene insieme cose che avrebbero preferito restare separate.":"The mash has the texture of a group project: it holds together things that would rather be apart.","Assaggia il piatto del giorno":"Try the special","La pasta portante":"Load-bearing pasta","Chiostro della Mensa":"Dining hall cloister","Nella simulazione il servizio è quasi finito. Ti dicono che puoi usare il tavolo se dai una mano a sparecchiare.":"Service is almost over. You can use the table if you help clear it.","Posto con vista sul chiostro":"A seat overlooking the cloister","Restituisci il vassoio e apri il libro. La pasta del giorno ha lasciato il segno, fortunatamente solo emotivo.":"You return the tray and open your book. Today’s pasta left a mark, thankfully only an emotional one.","Riporta un vassoio dimenticato":"Return an abandoned tray","Aula 107":"Room 107","Dentro stanno facendo un gruppo di studio. Da dieci minuti discutono chi debba creare il gruppo WhatsApp.":"A study group has spent ten minutes deciding who should make the WhatsApp group.","Carta fortunata":"Lucky card","Studio di gruppo, per davvero":"An actual study group","Proponi di iniziare dalla prima domanda. Parte il timer. Per un momento si sente solo il rumore delle penne.":"You suggest starting with question one. The timer starts. For a moment, all you hear is pens.","La studentessa del terzo":"The student on the third floor","«Al Matroneo si sente anche un file Excel quando va in errore. Se entri, metti il telefono in silenzioso.»":"“In the Matroneo you can hear an Excel file throw an error. Put your phone on silent before you go in.”","Metti il telefono in silenzioso":"Silence your phone","Telefono silenziato":"Phone silenced","Notifica soppressa":"Notification suppressed","Il telefono tace. Un posto accanto al muro si è appena liberato.":"Your phone is silent. A seat against the wall has just opened up.","Si sente persino il cursore. Una studentessa ti indica il telefono con un cenno.":"You can practically hear the cursor. A student gestures at your phone.","Il silenzio del Matroneo":"Silence in the Matroneo","Finalmente studi. Ti accorgi che il rumore che sentivi in testa era il biliardino immaginario.":"You finally study. Turns out the noise in your head was imaginary foosball.","Prenotazione Biliardino":"Foosball pass","Il posto del campione":"The champion’s seat","I Nullafacenti hanno liberato il loro tavolo. Il torneo dell’anno prossimo è già in calendario. L’esame di domani, purtroppo, pure.":"The Slackers freed up their table. Next year’s tournament is already on the calendar. Sadly, so is tomorrow’s exam.","Cerca un posto per studiare":"Find a place to study","Avvicinati a persone, porte e oggetti e premi E. Apri la mappa sotto i comandi per orientarti.":"Approach people, doors or objects and press E. Open the campus map below the controls for directions.","Gioca":"Play","Nuovo protagonista":"New character","Il ritratto":"Appearance","Il carattere":"Personality","Il nome":"Name","Mescola il guardaroba":"Shuffle outfit","Profilo investigativo":"Investigator","Profilo diplomatico":"Diplomat","Profilo spericolato":"Risk-taker","Entra a Viale Romania":"Start at Viale Romania","Audio spento":"Sound off","Audio acceso":"Sound on","Torna all’editor":"Back to the editor","Torna a esplorare":"Back to exploring","Siediti e studia":"Sit down and study","Interagisci":"Interact","Mappa del campus":"Campus map","Missione compiuta":"Objective complete","Trova un posto per studiare":"Find a study spot","Crea un altro protagonista":"Create another character","Riprova dall’ingresso":"Retry from the entrance","Ti ha colpito un’auto su Viale Romania.":"You were hit by a car on Viale Romania.","Ti ha colpito un motorino su Viale Romania.":"You were hit by a scooter on Viale Romania.","Attraversa il viale quando si libera, poi mostra il badge alla guardia vicino ai pilastri. WASD o frecce per muoverti, E per parlare.":"Cross when the road is clear, then show your badge to the guard by the pillars. Move with WASD or the arrow keys. Press E to talk.","Esci":"Exit","Tira":"Shoot","Rivincita":"Rematch","Ping pong":"Table tennis","Biliardino":"Foosball","Ala est":"East wing","Primo piano":"First floor","Il varco dell’ala est è aperto.":"The east-wing gate is open.","Le scale del primo piano sono aperte.":"The first-floor stairs are open.","Il posto studio alla pergola è disponibile.":"The study spot under the pergola is available.","Pareggio. Puoi giocare la rivincita.":"A draw. You can play a rematch.","Hai perso. Puoi giocare la rivincita.":"You lost. You can play a rematch.","Servizio…":"Serving…","Palla colpita!":"Nice hit!","Tiro!":"Shot!","Ora · Spazio o Tira":"Now · Space or Shoot","Intercetta la palla con una delle due stecche.":"Intercept the ball with either rod.","Rimanda la pallina.":"Return the ball.","Come si gioca a briscola":"How to play Briscola","Carta, dalla più forte":"Cards, strongest first","Punti":"Points","Tu":"You","Avversario":"Opponent","Tocca a te.":"Your turn.","L’avversario sceglie…":"Your opponent is choosing…","L’avversario apre la mano…":"Your opponent leads…","Prendi tu":"You take the trick","Prende l’avversario":"Your opponent takes the trick","Asso":"Ace","Tre":"Three","Re":"King","Cavallo":"Knight","Fante":"Jack","Sette":"Seven","Sei":"Six","Cinque":"Five","Quattro":"Four","Due":"Two","Denari":"Coins","Coppe":"Cups","Spade":"Swords","Bastoni":"Clubs","Viale Romania 32 · Ingresso":"Viale Romania 32 · Entrance","Giardino · Campus di Viale Romania":"Gardens · Viale Romania campus","Bar · Briscola e biliardini":"Café · Briscola and foosball","Edificio · Piano terra":"Building · Ground floor","Primo piano · Mensa e Chiostro":"First floor · Dining hall and cloister","Terzo piano · Matroneo":"Third floor · Matroneo","Bar · Terrazza":"Café · Terrace","Ingresso di Via Panama":"Via Panama entrance","Piazzale di Economia e Finanza":"Economics and Finance courtyard","Area car sharing Luiss":"Luiss car-sharing area","Dal cancello di Via Panama il sentiero risale verso il Dome.":"The path from the Via Panama gate climbs towards the Dome.","I portici in cotto si affacciano sul piazzale del dipartimento.":"The terracotta porticoes overlook the department courtyard.","I posti riservati al car sharing si affacciano sul vialetto alberato.":"The car-sharing bays face the tree-lined lane.","Matricola":"First-year student","Pendolare":"Commuter","Fuorisede":"Student from out of town","Veterano degli appelli":"Exam veteran","Coraggio":"Courage","Empatia":"Empathy","Ambizione":"Ambition","Razionalità":"Rationality","Socialità":"Sociability","Autocontrollo":"Self-control","Propensione al rischio":"Risk tolerance","Fiducia negli altri":"Trust in others","Curiosità":"Curiosity","Pragmatismo":"Pragmatism","Slanciata":"Tall","Minuta":"Petite","Robusta":"Broad","Ovale":"Oval","Tondo":"Round","Squadrato":"Square","Onda":"Wavy","Riga":"Side part","Ricci":"Curly","Rasati":"Shaved","Nocciola":"Hazel","Verde":"Green","Azzurro":"Blue","Ambra":"Amber","Avorio":"Ivory","Miele":"Honey","Castagna":"Chestnut","Ebano":"Ebony","Ruggine":"Rust","Salvia":"Sage","Indaco":"Indigo","Mostarda":"Mustard","Nessuno":"None","Cappello":"Hat","Papillon":"Bow tie","Occhiali":"Glasses","Monocolo":"Monocle","Sciarpa":"Scarf","Castano":"Brown","Nero":"Black","Rame":"Copper","Argento":"Silver","Prugna":"Plum","Sorriso":"Smile","Broncio":"Frown","Sospetto":"Suspicious","A manubrio":"Handlebar","A matita":"Pencil","Pizzetto":"Goatee","Tinta unita":"Solid","Gessato":"Pinstripe","Pois":"Polka dots","Passare l’esame":"Pass the exam","Salvare la media":"Save my GPA","Trovare una presa":"Find a power outlet","Evitare il gruppo WhatsApp":"Avoid the WhatsApp group","Tinta dei capelli":"Hair colour","Espressione":"Expression","Barba e baffi":"Facial hair","Tessuto":"Pattern","Mestiere":"Background","Perché sei qui":"Why are you here?","Corporatura":"Build","Volto":"Face","Capelli":"Hair","Occhi":"Eyes","Pelle":"Skin","Abito":"Outfit","Accessorio":"Accessory","Scegli una delle tre carte. Puoi giocare qualsiasi seme. Il seme della carta scoperta è la briscola.":"Choose a card from your hand. Any suit is allowed. The face-up card determines the trump suit.","Una briscola batte qualsiasi altro seme. Tra due briscole vince la più alta. Se nessuno gioca briscola, conta il seme della prima carta.":"Trump beats every other suit. The highest trump wins. If neither card is trump, the suit led wins.","Chi fa la presa prende entrambe le carte, pesca per primo e apre la mano successiva. Quando il mazzo finisce si giocano le carte rimaste.":"The trick winner takes both cards, draws first and leads the next trick. Keep playing the cards in hand once the deck runs out.","Si giocano 20 prese. Con almeno 61 punti vinci. A 60 pari è pareggio.":"There are 20 tricks. Score at least 61 points to win. A 60–60 score is a draw.","←/→ oppure A/D per muovere la racchetta. Rimanda la pallina con la racchetta e mira con il bordo. Vince chi fa 5 punti.":"Move the paddle with ←/→ or A/D. Return the ball and use the edge of the paddle to aim. First to 5 points wins.","Muovi le due stecche con ←/→ o A/D. La stecca arretrata para anche senza tirare. Premi Spazio o Tira mentre la palla lampeggia: colpisci a sinistra o a destra dell’omino per cambiare angolo. Vince chi segna 3 gol.":"Move both rods with ←/→ or A/D. The rear rod blocks automatically. Press Space or Shoot when the ball flashes. Hit off-centre to change the angle. First to 3 goals wins.","Gioca una carta a turno. La briscola batte gli altri semi. Nel seme di apertura e in quello di briscola l’ordine è Asso, Tre, Re, Cavallo, Fante, 7, 6, 5, 4, 2. Vince chi supera 60 punti.":"Play one card per turn. Trump beats the other suits. In the led or trump suit, the order is Ace, Three, King, Knight, Jack, 7, 6, 5, 4, 2. Score more than 60 to win.","Hai un esame domani. Ti servono un tavolo, una presa e dieci minuti di silenzio. Il campus considera queste tre richieste separatamente.":"You have an exam tomorrow. You need a table, an outlet and ten minutes of silence. The campus treats these as three separate requests.","I tratti aprono opzioni diverse. Le scelte possono cambiarli durante la partita.":"Traits unlock different choices. Your decisions can change them during the game."};
let locale="it";
try{if(localStorage.getItem("ultimo-posto-language")==="en")locale="en";}catch{}
Object.assign(english,{
  "Storia":"Story","Modalità libera":"Free roam","Entra nel campus":"Enter campus",
  "Esplora il campus":"Explore campus","Braccio di ferro":"Arm wrestling",
  "Gira per il campus, parla con chi incontri e gioca sulla terrazza. Premi E vicino a qualcuno per iniziare.":"Walk around campus, talk to people and play on the terrace. Press E near someone to start.",
  "Premi Spazio o Spingi nella fascia verde. Ogni passaggio concede un tentativo. Vince chi prende due round.":"Press Space or Push in the green zone. You get one attempt per pass. Win two rounds to win the match.",
  "←/→ oppure A/D per muovere la racchetta. Mira con il bordo della racchetta. Premi Spazio o Schiaccia quando la pallina lampeggia. Vince chi fa 5 punti.":"Use arrows or A/D to move the paddle. Aim with its edge. Press Space or Smash when the ball glows. First to 5 points wins.",
  "Scegli una carta con il mouse o con i tasti 1, 2 e 3. La briscola batte gli altri semi. Nel seme di apertura e in quello di briscola l’ordine è Asso, Tre, Re, Cavallo, Fante, 7, 6, 5, 4, 2. Vince chi supera 60 punti.":"Choose a card with the mouse or keys 1, 2 and 3. Trump beats other suits. Ranking is Ace, Three, King, Knight, Jack, 7, 6, 5, 4, 2. You need more than 60 points to win.",
  "Spingi":"Push","Presa salda.":"Strong grip.","Riccardo prende vantaggio.":"Riccardo gains ground.",
  "Gomiti sul tavolo. Preparati.":"Elbows on the table. Get ready.",
  "Spingi quando il cursore è nella fascia verde.":"Push when the cursor is in the green zone.",
  "Sfida Riccardo a braccio di ferro":"Challenge Riccardo to arm wrestling","Schiaccia":"Smash","Schiacciata!":"Smash!","Timing perfetto!":"Perfect timing!",
  "Navetta LUISS":"LUISS shuttle","Mensa · Sala e chiostro":"Cafeteria · Dining room and cloister",
  "Mensa · Ingresso dal primo piano":"Cafeteria · First-floor entrance",
  "Mensa · Ingresso dal cortile":"Cafeteria · Courtyard entrance","Banco del pranzo":"Lunch counter",
  "Corridoio del primo piano":"First-floor corridor","Uscita verso il cortile":"Exit to the courtyard","Cinta del campus":"Campus boundary",
  "«Oggi faccio presa e avambracci. Ti siedi? Due round vinti e puoi dire che mi hai battuto.»":
    "“I’m working on my grip today. Take a seat. Win two rounds and you can say you beat me.”",
  "Hai conquistato il tavolo del giardino.":"You won at the garden table.",
  "The Dome":"The Dome","Bar · Briscola":"Café · Briscola","Ambienti e attività":"Areas and activities",
  "Il barista ti indica l’aula sotto i portici, sul lato di Via Panama, oltre il piazzale delle facoltà.":"The bartender points you to the study room under the portico, on the Via Panama side past the faculty courtyard."
});
const tr=text=>locale==="en"&&Object.hasOwn(english,text)?english[text]:text;
const local=(it,en)=>locale==="en"?en:it;
function refreshLanguage(){
  document.documentElement.lang=locale;
  $("langIt").setAttribute("aria-pressed",String(locale==="it"));
  $("langEn").setAttribute("aria-pressed",String(locale==="en"));
  const nodes=["home","creator","game","challenge"].flatMap(id=>[...$(id).querySelectorAll("button,h2,p,label,option,li,th,td,summary,span")]);
  for(const el of [...nodes,$("testBack")]){
    for(const node of el.childNodes){
      if(node.nodeType!==3)continue;
      const source=node.gameItalian??node.data.trim();
      if(Object.hasOwn(english,source)){node.gameItalian=source;node.data=node.data.replace(node.data.trim(),tr(source));}
    }
  }
  updateHomeActions();
  $("audio").textContent=tr(audioOn?"Audio acceso":"Audio spento");
}
function chooseLanguage(value){
  locale=value;
  try{localStorage.setItem("ultimo-posto-language",value);}catch{}
  refreshLanguage();
}
const traits = {coraggio:"Coraggio",empatia:"Empatia",ambizione:"Ambizione",razionalita:"Razionalità",socialita:"Socialità",autocontrollo:"Autocontrollo",rischio:"Propensione al rischio",fiducia:"Fiducia negli altri",curiosita:"Curiosità",pragmatismo:"Pragmatismo"};
const options = {
  profilo:["Studentessa","Studente","Senza etichetta"],
  corpo:["Slanciata","Minuta","Robusta"],
  volto:["Ovale","Tondo","Squadrato"],
  capelli:["Onda","Riga","Ricci","Rasati","Caschetto","Coda alta","Lunghi","Chignon"],
  occhi:["Nocciola","Verde","Azzurro","Ambra"],
  pelle:["Avorio","Miele","Castagna","Ebano"],
  abito:["Ruggine","Salvia","Indaco","Mostarda","Blu Luiss"],
  accessorio:["Nessuno","Cappello","Papillon","Occhiali","Monocolo","Sciarpa"],
  tinta:["Castano","Nero","Rame","Argento","Prugna"],
  espressione:["Sorriso","Broncio","Sospetto"],
  baffi:["Nessuno","A manubrio","A matita","Pizzetto"],
  motivo:["Tinta unita","Gessato","Pois"],
  taglio:["Giacca","Felpa","Camicia","Giubbotto varsity"],
  pantaloni:["Antracite","Denim","Sabbia","Salvia"],
  scarpe:["Nere","Bianche","Marroni"],
  zaino:["Nessuno","Tela","Tecnico","Tote bag"],
  dettaglio:["Nessuno","Spilla","Patch","Laccetto badge"],
  passato:["Matricola","Pendolare","Fuorisede","Veterano degli appelli"],
  meta:["Passare l’esame","Salvare la media","Trovare una presa","Evitare il gruppo WhatsApp"]
};
const labels={profilo:"Profilo",dettaglio:"Dettaglio",taglio:"Capo",pantaloni:"Pantaloni",scarpe:"Scarpe",zaino:"Borsa",tinta:"Tinta dei capelli",espressione:"Espressione",baffi:"Barba e baffi",motivo:"Tessuto",passato:"Mestiere",meta:"Perché sei qui",corpo:"Corporatura",volto:"Volto",capelli:"Capelli",occhi:"Occhi",pelle:"Pelle",abito:"Abito",accessorio:"Accessorio"};
const totalSecrets=14;
const challengeNames={arm:"Braccio di ferro",dance:"Trend di ballo",ping:"Ping pong",foos:"Biliardino",bris:"Briscola",scopa:"Scopa",poker:"Poker",mattoni:"Pixel Mattoni",nastri:"Salva i nastri"};
const unlocks={ping:"Limonata al bar",foos:"Primo piano",bris:"Pergola di lettura"};
const won=id=>Boolean(state?.wins[id]);
const saveKey="ultimo-posto-v1";
const keys = new Set();
const controls = new Set();
let screen="home", state=null, activeScene=null, dirty=false, selectedMode="story";
const isFree=()=>state?.mode==="free";
const gateLocked=id=>Boolean(id&&!isFree()&&!won(id));

function stored(mode="story"){
  try{
    const data=JSON.parse(localStorage.getItem(saveProfileKey(mode)));
    if(data?.version!==1 || !data.avatar || !data.traits || !Array.isArray(data.log))return null;
    if(!Object.hasOwn(campus.zones,data.zone))data.zone="ingresso";
    if(data.zone==="ingresso"&&!data.streetVisited&&room("ingresso").width===30){
      [data.x,data.y]=reachEntry("ingresso");data.streetVisited=true;
    }
    const garden=room("giardino");
    const enlarged=garden.objects.some(o=>o.uid==="entry-from-panama");
    const layout=enlarged?campusLayoutVersion:garden.objects.some(o=>o.uid==="main-front")?2:0;
    if(data.zone==="giardino"&&layout&&(!data.campusLayout||data.campusLayout<layout)){
      if(data.campusLayout===2&&Number.isFinite(data.x)&&Number.isFinite(data.y)&&data.x>=0&&data.y>=0){
        if(data.x>=72||data.y>=79){
          [data.x,data.y]=reachEntry("giardino",data.x>=72?"panama":"ingresso");
        }else{
          data.x=Math.floor((data.x+.5)*4/3);data.y=Math.floor((data.y+.5)*4/3);
        }
      }else [data.x,data.y]=reachEntry("giardino","ingresso");
    }else if(data.zone==="giardino"&&!data.campusExpanded){data.x=8;data.y=32;}
    if(layout&&(!data.campusLayout||data.campusLayout<layout))data.campusLayout=layout;
    if(data.zone==="giardino"&&data.x===26&&data.y===22&&!data.wins)data.y=24;
    if(hasIntegratedEntrance()&&data.zone==="ingresso"){
      data.zone="giardino";
      data.x=(Number.isFinite(data.x)?data.x:14)+vialeEntrance.x;
      data.y=(Number.isFinite(data.y)?data.y:17)+vialeEntrance.y;
      data.campusGateOpen=false;
    }
    if(hasIntegratedEntrance()&&data.zone==="giardino"&&typeof data.campusGateOpen!=="boolean")data.campusGateOpen=true;
    [data.x,data.y]=freeTile(data.zone,Number.isFinite(data.x)?data.x:2,Number.isFinite(data.y)?data.y:2);
    return {...data,mode,freeMoment:null,campusExpanded:true,wins:data.wins??{},events:Array.isArray(data.events)?data.events:[],
      completedEvents:Array.isArray(data.completedEvents)?data.completedEvents:[],mission:typeof data.mission==="string"?data.mission:"",missionTarget:typeof data.missionTarget==="string"?data.missionTarget:""};
  }catch{return null;}
}
function save(){
  if(testMode||!state)return true;
  try{localStorage.setItem(saveProfileKey(state.mode),JSON.stringify(state));return true;}
  catch{return false;}
}
function updateHomeActions(){
  if(screen!=="home")return;
  const story=Boolean(stored("story"));
  const free=Boolean(stored("free"));
  $("start").textContent=story?local("Continua la storia","Continue story"):local("Inizia la storia","Start story");
  $("free").textContent=free?local("Riprendi l’esplorazione","Resume exploring"):local("Esplora il campus","Explore campus");
  $("resume").hidden=!story;
  $("resume").textContent=local("Nuova storia","New story");
  $("edOpen").textContent=local("Editor del campus","Campus editor");
}
function show(next){
  if(minigame)closeChallenge();
  keys.clear();controls.clear();screen=next;
  for(const id of ["home","creator","game","editor"]) $(id).hidden=id!==next;
  $("homeButton").hidden=next==="home"||testMode;
  $("testBack").hidden=!testMode||next!=="game";
  if(next==="home")paintCover();
  if(next==="creator"){
    $("play").textContent=selectedMode==="free"?tr("Entra nel campus"):tr("Entra a Viale Romania");
    preview();
  }
  if(next==="editor") enterEditor();
  if(next==="game") renderScene();
  if(next!=="editor")refreshLanguage();
  syncBackgroundMusic();
}
const studentNames=[
  ["Ada","Bianca","Giulia","Marta","Viola"],
  ["Andrea","Elia","Luca","Matteo","Samuele"],
  ["Ari","Eli","Noa","Sasha","Vale"]
];
let draftMatricola=newMatricola();
let suggestedName=Math.floor(Math.random()*5);
function newMatricola(){
  return "SP-"+String(100000+Math.floor(Math.random()*900000));
}
const nameInput=document.createElement("input");
nameInput.type="text";nameInput.maxLength=24;nameInput.autocomplete="off";nameInput.placeholder="Scrivi un nome";
const nameLabel=document.createElement("label");
nameInput.addEventListener("input",preview);nameLabel.append("Nome sul badge",nameInput);$("identityFields").append(nameLabel);
const selectors={};
const wardrobeFields=new Set(["taglio","abito","motivo","pantaloni","scarpe","zaino","accessorio","dettaglio"]);
for(const [id,values] of Object.entries(options)){
  const label=document.createElement("label");
  const select=document.createElement("select");
  values.forEach((value,i)=>select.add(new Option(value,i)));
  label.append(labels[id],select);
  $(id==="profilo"?"identityFields":wardrobeFields.has(id)?"wardrobeFields":"fields").append(label);
  selectors[id]=select;select.addEventListener("change",preview);
}
function badgeName(){
  const choices=studentNames[Number(selectors.profilo.value)]??studentNames[2];
  return nameInput.value.trim()||choices[suggestedName];
}
$("suggestName").onclick=()=>{
  suggestedName=(suggestedName+1)%5;nameInput.value="";preview();
};
const sliders={}, meters={};
for(const [id,labelText] of Object.entries(traits)){
  const label=document.createElement("label"), heading=document.createElement("span");
  const slider=document.createElement("input"), output=document.createElement("output");
  slider.type="range";slider.min=0;slider.max=100;slider.value=50;
  slider.setAttribute("aria-label",labelText);
  heading.append(labelText,output);label.append(heading,slider);$("traits").append(label);
  sliders[id]=slider;meters[id]=output;
  slider.addEventListener("input",updateMeters);
}
function updateMeters(){
  for(const id in traits) meters[id].textContent=sliders[id].value;
}
function preset(values){
  for(const id in traits) sliders[id].value=values[id]??50;
  updateMeters();
}
function avatar(){
  return Object.fromEntries(Object.entries(selectors).map(([id,select])=>[id,Number(select.value)]));
}
function rect(c,color,x,y,w,h){
  c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);
}
function sprite(c,a,x,y,step=0,look="down",size=1,coatOverride){
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(size,size);
  const skin=["#f9d3a3","#dc9f62","#ae6e4d","#744432"][a.pelle];
  const coat=coatOverride??["#b85052","#63946e","#5476a3","#c18c43","#202f51"][a.abito]??"#5476a3";
  const hair=["#5b352a","#252331","#a34e36","#b8aeb3","#754261"][a.tinta??0];
  const iris=["#774b32","#507950","#608bab","#c58938"][a.occhi];
  const ink="#222131",bodyWidth=[10,8,12][a.corpo],headWidth=[10,12,12][a.volto];
  const shift=look==="left"?-2:look==="right"?2:0;
  const height=a.corpo===0?1:a.corpo===1?-1:0;
  rect(c,"#20243177",-8,-1,16,3);
  rect(c,ink,-5,-5+(step===1?-1:0),4,5);rect(c,ink,1,-5+(step===2?-1:0),4,5);
  rect(c,ink,-bodyWidth/2-2,-12,bodyWidth+4,8);
  rect(c,coat,-bodyWidth/2,-12,bodyWidth,7);
  const trousers=["#343845","#415a78","#a89170","#586c54"][a.pantaloni]??"#343845";
  const shoes=["#222131","#e8dfca","#77472e"][a.scarpe]??"#222131";
  for(const [leg,lift] of [[-5,step===1?1:0],[1,step===2?1:0]]){
    rect(c,trousers,leg,-5-lift,4,3);rect(c,shoes,leg,-2-lift,4,2);
  }
  if(a.zaino)rect(c,["","#b28b58","#303849","#e3d2a3"][a.zaino],bodyWidth/2,-12,a.zaino===3?3:2,7);
  if(a.taglio===1){rect(c,ink,-3,-13,6,2);rect(c,"#efdbb7",-2,-11,1,3);rect(c,"#efdbb7",1,-11,1,3);}
  if(a.taglio===2){rect(c,"#e5d8bf",-3,-12,6,2);rect(c,ink,0,-10,1,5);}
  if(a.taglio===3){rect(c,"#eddbb5",-bodyWidth/2,-11,2,5);rect(c,"#eddbb5",bodyWidth/2-2,-11,2,5);}
  rect(c,"#fff1ca30",-bodyWidth/2+1,-7,bodyWidth-2,1);
  if(a.dettaglio===1)rect(c,"#f0be75",2,-10,2,2);
  if(a.dettaglio===2){rect(c,"#192736",-4,-10,3,3);rect(c,"#f0be75",-3,-9,1,1);}
  if(a.dettaglio===3){rect(c,"#ebaa65",0,-12,1,4);rect(c,"#f0e4cf",-1,-9,3,3);}
  rect(c,skin,-bodyWidth/2-2,-8,2,2);rect(c,skin,bodyWidth/2,-8,2,2);
  for(let i=-3;i<=3;i+=3){
    if(a.motivo===1)rect(c,"#e4be8766",i,-11,1,5);
    if(a.motivo===2)rect(c,"#f7d1a1",i,-8-i%2,1,1);
  }
  const top=-23-height;
  rect(c,ink,-headWidth/2-1,top+1,headWidth+2,10);
  rect(c,ink,-headWidth/2+(a.volto===2?0:1),top,headWidth-(a.volto===2?0:2),12);
  rect(c,look==="up"&&a.capelli!==3?hair:skin,-headWidth/2,top+2,headWidth,8);
  if(a.capelli===4||a.capelli===6){
    const length=a.capelli===6?12:8;
    rect(c,hair,-headWidth/2-1,top+2,2,length);
    rect(c,hair,headWidth/2-1,top+2,2,length);
  }
  if(a.capelli===5||a.capelli===7)rect(c,hair,2,top-3,a.capelli===5?4:5,a.capelli===5?6:3);
  if(a.capelli!==3){
    rect(c,hair,-headWidth/2,top+1,headWidth,3);
    rect(c,hair,a.capelli===1?1:-headWidth/2,top+(a.capelli===2?-1:0),5,5);
    if(a.capelli===2)rect(c,hair,2,top,3,4);
  }
  if(look!=="up"){
    rect(c,"#743c3936",-headWidth/2+1,top+8,2,1);
    rect(c,"#743c3936",headWidth/2-3,top+8,2,1);
    rect(c,"#fff1ca50",-1,top+6,2,2);
    for(const ex of [-3,2]){
      rect(c,"#fff2d4",ex+shift,top+5,2,2);rect(c,iris,ex+shift+1,top+5,1,2);
    }
    rect(c,"#81493f",shift-1,top+(a.espressione===1?9:8),a.espressione===2?2:3,1);
    if(a.baffi)rect(c,hair,shift-(a.baffi===3?1:3),top+(a.baffi===3?10:7),a.baffi===3?3:7,a.baffi===1?2:1);
    if(a.accessorio===6){
      const lens=["#6bd5da","#e99f50","#ab91de"][a.lenti??0];
      rect(c,ink,-6+shift,top+4,12,4);
      rect(c,lens,-5+shift,top+4,10,3);
      rect(c,"#f0e1c98a",-3+shift,top+4,3,1);
      rect(c,ink,-1+shift,top+7,2,1);
    }
    if(a.accessorio===3 || a.accessorio===4){
      rect(c,"#ebbf6b",shift+1,top+4,4,1);
      if(a.accessorio===3)rect(c,"#ebbf6b",shift-4,top+4,4,1);
    }
  }
  if(a.accessorio===1){
    rect(c,"#573d63",-5,top-4,10,5);rect(c,"#9a6b83",-8,top,16,2);
  }
  if(a.accessorio===2)rect(c,"#ffd184",-3,-12,6,2);
  if(a.accessorio===5){rect(c,"#ed6373",-6,-13,12,2);rect(c,"#ed6373",-4,-11,3,5);}
  c.restore();
}
function preview(){
  const c=$("portrait").getContext("2d"), a=avatar();
  rect(c,"#142337",0,0,240,144);
  c.fillStyle="#29405a";c.beginPath();c.ellipse(120,69,63,55,0,0,Math.PI*2);c.fill();
  rect(c,"#101b2a",74,128,92,3);
  sprite(c,a,120,126,0,"down",4.7);
  $("ticket").textContent=badgeName();
  $("ticketNumber").textContent=local("Matricola di gioco ","Game student ID ")+draftMatricola;
}
function resetGame(){
  testMode=false;
  const mode=selectedMode;
  if(mode==="story"&&stored(mode)&&!window.confirm(local(
    "Iniziare una nuova storia sostituirà il salvataggio della storia precedente. Continuare?",
    "Starting a new story will replace your previous story save. Continue?"
  )))return;
  const zone=(mode==="free"&&campus.zones.giardino)||hasIntegratedEntrance()?"giardino":"ingresso";
  const [x,y]=reachEntry(zone,mode==="story"&&hasIntegratedEntrance()?"viale":"ingresso");
  state={version:1,mode,campusGateOpen:mode==="free",name:badgeName(),matricola:draftMatricola,avatar:avatar(),traits:Object.fromEntries(Object.entries(sliders).map(([id,input])=>[id,Number(input.value)])),x,y,prologue:mode==="free"?0:1,streetVisited:true,campusExpanded:true,campusLayout:campusLayoutVersion,look:"down",zone,log:[],secrets:[],pockets:[],ending:null,wins:{},events:[],completedEvents:[],mission:"",missionTarget:""};
  draftMatricola=newMatricola();
  activeScene=null;dirty=false;save();show("game");
}
function record(message){state.log.push(message);}
function change(id,amount){
  state.traits[id]=Math.min(100,Math.max(0,state.traits[id]+amount));
}
function nearby(){
  const object=nearbyIn(state.zone,state.x,state.y,mapClock);
  return object&&{...object,label:object.name};
}
function travel(zone,entry){
  if(!Object.hasOwn(campus.zones,zone))return;
  [state.x,state.y]=reachEntry(zone,entry??state.zone);
  state.zone=zone;state.look="down";state.chatTopic=null;state.freeMoment=null;activeScene=null;
  syncBackgroundMusic();
}
function discover(id,description){
  if(state.secrets.includes(id))return;
  state.secrets.push(id);record("Scoperta · "+description);chime([60,64,67,71]);
}
function carry(item){
  if(!state.pockets.includes(item))state.pockets.push(item);
}
function has(item){return state.pockets.includes(item);}
function scene(title,text,...choices){return {title,text,choices};}
function interact(){
  if(screen!=="game"||state.ending||state.prologue||$("campusSurprise").open)return;
  const spot=nearby();if(!spot)return;
  if(spot.uid==="viale-ingresso-varco"&&(isFree()||has("Via libera"))){
    if(!state.campusGateOpen)record("Badge riconosciuto. Il tornello è aperto.");
    state.campusGateOpen=true;activeScene=null;keys.clear();controls.clear();
    if(state.x===spot.x&&state.y===spot.y+1&&!blocked(state.zone,spot.x,spot.y))state.y=spot.y;
    syncBackgroundMusic();save();renderScene();$("interact").focus();
    return;
  }
  if(spot.uid==="viale-ingresso-varco")warnAtGate();
  const destination=doorDestination(spot);
  if(destination){
    keys.clear();controls.clear();
    travel(...destination);save();renderScene();$("interact").focus();
    return;
  }
  state.chatTopic=null;activeScene=spot.uid;completeObjective(spot);renderScene();
  if(!$("speakerPortrait").hidden)$("sceneTitle").focus();
}
const nativeDoors={uscita:"ingresso",giardino:"giardino",terra:"terra",caffe:"caffe",primo:"primo",terzo:"terzo"};
function doorDestination(spot){
  if(gateLocked(spot.gate))return null;
  if(spot.action==="portal"){
    const destination=spot.target.split("#");
    return Object.hasOwn(campus.zones,destination[0])?destination:null;
  }
  if(spot.action!=="native")return null;
  if(spot.uid!=="viale-ingresso-varco"&&spot.native==="varco"&&(isFree()||has("Via libera")))return ["giardino"];
  if(spot.kind!=="door"&&spot.kind!=="stairs")return null;
  const destination=nativeDoors[spot.native];
  return destination&&Object.hasOwn(campus.zones,destination)?[destination]:null;
}
function badge(reason){
  carry("Via libera");record(reason);
}
function reserve(title,text){
  return ["Siediti e studia",()=>finish(title,text)];
}
const storySteps=[
  ["Via libera","Mostra il badge alla guardia","Show your badge to security"],
  ["Colloquio tutor","Vai al tutorato davanti al Dome","Visit the tutoring office by The Dome"],
  ["Lezione A200","Segui Storia contemporanea in Aula Chiesa","Attend Contemporary History in A200"],
  ["Progetto LOFT","Consegna il progetto al LOFT, all’ultimo piano","Submit your project at the top-floor LOFT"],
  ["Seminario Parenzo","Prendi la navetta e partecipa al seminario a Parenzo","Take the shuttle and join the seminar at Parenzo"],
  ["Abilitazione Green Mobility","Completa l’abilitazione Green Mobility","Complete your Green Mobility orientation"],
  ["Festa a Pola","Raggiungi Pola in car sharing e festeggia la laurea","Reach Pola by car share and celebrate graduation"]
];
const romaniaComplete=()=>storySteps.slice(0,4).every(([item])=>has(item));
function checkpoint(item){
  if(has(item))return;
  carry(item);awardCoins(2);record("Percorso · "+item+" · +2 monete");
  chime([60,67,72]);
}
function storyObjective(){
  const step=storySteps.find(([item])=>!has(item));
  return step?local(step[1],step[2]):local("Laurea festeggiata · Esplora le sedi","Graduation celebrated · Explore the campuses");
}

const seminarPrep={
  timeline:{label:"Metti in ordine i messaggi",trait:"pragmatismo",log:"Hai costruito una cronologia con gli appunti."},
  voices:{label:"Rileggi le due versioni",trait:"autocontrollo",log:"Hai lasciato spazio alle due versioni prima di concludere."}
};
const seminarResponses={
  prove:{label:"Chiedo quale messaggio chiuda davvero l’accordo",trait:"razionalita",log:"Hai distinto le prove da ciò che ciascuno stava deducendo."},
  ascolto:{label:"Riformulo la sua obiezione e propongo due letture",trait:"empatia",log:"Hai accolto l’obiezione e mostrato due letture plausibili."},
  insisto:{label:"Resto sulla mia tesi e passo oltre",trait:"coraggio",log:"Hai difeso la tua tesi, lasciando irrisolto il messaggio decisivo."}
};
const seminarOutcomes={
  A:{title:"A · Una tesi che regge",why:"La cronologia rende visibile il passaggio tra trattativa e presunto accordo. La domanda puntuale mette alla prova il messaggio decisivo."},
  B:{title:"B · Due letture in aula",why:"Hai dato spazio all’obiezione. Chi ascolta capisce che la conclusione cambia a seconda di come si legge lo stesso messaggio."},
  C:{title:"C · Tesi da rivedere",why:"Hai preso posizione con chiarezza. Rimane da spiegare quale prova sostenga la conclusione scelta."}
};
function seminarChoice(stage,id,option){
  state.parenzoAttempt[stage]=id;
  const effects=state.parenzoEffects??=[];
  const key=stage+"-"+id;
  const changed=!effects.includes(key);
  if(changed){effects.push(key);change(option.trait,3);}
  record("Parenzo · "+option.log+(changed?" +3 "+traits[option.trait]+".":" Effetto sul tratto già acquisito."));
}
function parenzoSeminar(){
  const attempt=state.parenzoAttempt??={
    prep:state.seminarRole==="messaggi"?"timeline":state.seminarRole==="versioni"?"voices":null,
    response:state.seminarArgument==="prove"?"prove":state.seminarArgument==="interpretazioni"?"ascolto":null,
    outcome:has("Seminario Parenzo")?"legacy":null
  };
  const reset=["Riprova il seminario",()=>{
    state.parenzoAttempt={prep:null,response:null,outcome:null};
    record("Parenzo · Hai aperto una nuova prova del seminario.");
  }];
  if(attempt.outcome){
    const result=seminarOutcomes[attempt.outcome];
    const text=result?result.title+". "+result.why+" Preparazione: "+seminarPrep[attempt.prep].log+" Confronto: "+seminarResponses[attempt.response].log:
      "Il seminario risulta già completato nel tuo diario. Puoi rifare il caso dall’inizio.";
    return scene("Parenzo · Esito del seminario",text+" La tappa resta completata e Green Mobility è disponibile a Romania.",reset);
  }
  if(!attempt.prep)return scene("Parenzo · Preparazione",
    "Via Parenzo 11. In T02 il docente riapre il caso della bici concordata in chat. Consegna un foglio a testa. «Avete cinque minuti. Da dove iniziate?»",
    ...Object.entries(seminarPrep).map(([id,option])=>[option.label,()=>seminarChoice("prep",id,option)]));
  if(!attempt.response)return scene("Parenzo · L’obiezione di Dario",
    (attempt.prep==="timeline"?"Hai segnato l’ordine dei messaggi. ":"Hai annotato le differenze fra i due racconti. ")+
    "Dario, uno studente al tavolo, indica il telefono. «Aspetta. Che il prezzo fosse chiaro non vuol dire che si fossero già messi d’accordo.»",
    ...Object.entries(seminarResponses).map(([id,option])=>[option.label,()=>seminarChoice("response",id,option)]));
  return scene("Parenzo · Presentazione","Il docente ti passa il pennarello. Dario resta al tavolo ad ascoltare. Hai una frase per la tesi e una per il dubbio.",
    ["Presenta il caso",()=>{
      attempt.outcome=attempt.prep==="timeline"&&attempt.response==="prove"?"A":attempt.response==="ascolto"?"B":"C";
      const result=seminarOutcomes[attempt.outcome];
      record("Parenzo · "+result.title+". "+result.why);
      checkpoint("Seminario Parenzo");
    }],reset);
}

function nativeScene(id){
  const t=state.traits;
  if(nativeDoors[id])return scene(room(nativeDoors[id]).name,"Da questa parte, secondo il cartello più ottimista.",["Vai",()=>travel(nativeDoors[id])]);
  switch(id){
    case "trend":return scene("Lello e Bea, creator napoletani",
      "«Cinque mosse per il video. Sei nel cast dal momento in cui sei passato davanti alla telecamera.»",
      ["Balla con loro",()=>openChallenge("dance")],
      ["Chiedi del prossimo trend",()=>record("Il prossimo trend? Una giornata senza dire networking.")]);
    case "spazzino":return scene("Sandro e Lina, squadra pulizie","Sandro spazza, Lina tiene il conto. «Terzo coriandolo a forma di grafico a torta. C’è di nuovo un convegno.»",
      ...(has("Spazzata")?[]:[["Tieni aperto il sacco",()=>{carry("Spazzata");discover("pulizie","Pulizia straordinaria");change("empatia",4);carry("Nota del Dome");}]]));
    case "evento":return scene("A200 · Aula Chiesa","Dietro il cordone passano un sottosegretario, una CEO e un tizio che saluta tutti senza fermarsi. L’addetta scorre la lista. «Lei è nella sezione invisibile.»",
      ["Entra nell’Aula Chiesa",()=>travel("aula-chiesa","campus")],
      ...(has("Lista controllata")?[]:[["Chiedi di ricontrollare la lista",()=>{carry("Lista controllata");discover("evento","Networking da dietro il cordone");}]]));
    case "ospite":return scene("L’ospite con il pass","«Dov’è l’A200? Dovevo essere al panel sul valore della puntualità.»",
      ...(has("Lista controllata")?[["Indica l’Aula Chiesa",()=>{carry("Dritta sul Matroneo");record("L’ospite ti ringrazia. Il suo panel inizia con venti minuti di ritardo.");}]]:[]));
    case "barista":return scene("I baristi",won("dance")?"«Eccoti, la star del campus!» Il barista ti saluta facendo la prima mossa del tuo balletto.":"Al bancone c’è un menu scritto a mano. Fuori, la terrazza è già piena.",
      ...(won("foos")?[["Chiedi del tavolo dopo pranzo",()=>{carry("Dritta del barista");record("Il barista ti indica l’aula sotto i portici, sul lato di Via Panama, oltre il piazzale delle facoltà.");}]]:[]),
      ...(has("Dritta del barista")&&!has("Pranzo finito")?[["Pranza e aspetta che si liberi il tavolo",()=>{carry("Pranzo finito");record("È passato il pranzo. Il tavolo sotto i portici dovrebbe essere libero.");}]]:[]),
      ["Ordina un espresso",()=>{if(!has("Caffè ristretto")){carry("Caffè ristretto");discover("espresso","Caffè a regime di massima sicurezza");change("autocontrollo",4);}}],
      ["Prendi un panino",()=>{if(!has("Panino")){carry("Panino");record("Panino preso. Lo scontrino è più lungo del panino.");}}],
      ["Chiedi dove studiare",()=>{if(!has("Nota del Dome")){carry("Nota del Dome");record("Il barista indica il Dome: «Guarda dietro il ficus».");}}],
      ...(won("ping")&&!has("Limonata")?[["Ritira la limonata",()=>{carry("Limonata");record("Limonata ritirata.");}]]:[]));
    case "gymbro":return scene("Riccardo · Gymbro","",
      ["Sfida Riccardo a braccio di ferro",()=>openChallenge("arm")]);
    case "autista":return nativeScene("navetta");
    case "easter-quiz":
      return scene("A203 · Aula Toti","Sotto la cattedra c’è un foglio con scritto: «Il test è a risposta multipla. Le risposte sono: dipende, dipende e dipende.»",
        ["Apri il foglio",()=>discover("toti-foglio","La quarta risposta era «argomenta»")]);
    case "easter-radio":
      return scene("Radio Luiss · Busta sigillata","Busta per il prossimo conduttore. Sul retro: «Aprire solo in caso di silenzio radio».",
        ["Apri la busta",()=>discover("radio-silenzio","Dentro c’è un biglietto: fai una pausa, non è un errore tecnico.")]);
    case "tutor-orientamento":
      return scene("Viola · Tutorato",has("Colloquio tutor")?"«Hai il piano del semestre. Aula Chiesa è al secondo piano.»":"«Tre anni sembrano tanti, finché non apri il calendario. Cominciamo dalla prima settimana?»",
        ...(!has("Colloquio tutor")?[["Prepara il piano di studio",()=>checkpoint("Colloquio tutor")]]:[]));
    case "loft-cabinato":
      return scene("LOFT · Sala arcade","Il cabinato è acceso. Scegli il gioco con la levetta, o con un clic.",["Pixel Mattoni",()=>openChallenge("mattoni")],["Salva i nastri",()=>openChallenge("nastri")]);
    case "loft-progetto":
      return scene("LOFT · Consegna del progetto",has("Progetto LOFT")?"«Progetto consegnato. La navetta ti aspetta alla piazzola del giardino.»":
        has("Lezione A200")&&has("Colloquio tutor")?"«Registra un minuto di vita a Romania per il tuo progetto di fine triennale.»":"«Prima passa dal tutorato e completa la lezione in Aula Chiesa.»",
        ...(!has("Progetto LOFT")&&(isFree()||has("Lezione A200")&&has("Colloquio tutor"))?[["Consegna il podcast",()=>checkpoint("Progetto LOFT")]]:[]));
    case "parenzo-seminario":return parenzoSeminar();
    case "pola-festa":
      if(has("Festa a Pola"))return scene("Pola · Festa di laurea","Le luci sono accese. Dal cortile qualcuno ti chiede se dopo la festa gli mandi gli appunti.");
      if(!state.graduationSpeech)return scene("Pola · Ultime parole prima della festa","Il cortile si fa silenzioso. Tocca a te raccontare in una frase cosa porti via da questi anni.",
        ["Ringrazio chi mi ha fatto posto",()=>{state.graduationSpeech="persone";record("Laurea · Hai ringraziato chi ti ha fatto posto.");}],
        ["Racconto il progetto che mi ha cambiato",()=>{state.graduationSpeech="progetto";record("Laurea · Hai raccontato il tuo progetto.");}]);
      return scene("Pola · Il brindisi",state.graduationSpeech==="persone"?
        "Dal fondo qualcuno solleva una sedia: «Stavolta un posto per te c’è». La musica riparte.":
        "Parte la sigla del podcast. Gli amici riconoscono il tornello al primo rumore e scoppiano a ridere.",
        ["Brinda con gli altri",()=>checkpoint("Festa a Pola")]);
    case "navetta":
      if(!isFree()&&!romaniaComplete())return scene("Navetta Luiss · Parenzo","La navetta sarà disponibile dopo le attività di Romania. Segui gli obiettivi nel diario.");
      return scene("Navetta Luiss · Parenzo",state.shuttleTicket?
        "Prenotazione attiva. Mostra il QR all’autista per salire.":"La corsa collega Viale Romania a Via Parenzo. Prenota dal telefono del gioco.",
        state.shuttleTicket?["Mostra il QR e sali",()=>{state.shuttleTicket=false;record("Navetta · Arrivo a Parenzo");travel("parenzo","shuttle");}]:
          ["Prenota Romania → Parenzo",()=>{state.shuttleTicket=true;record("Navetta · Prenotazione confermata, QR disponibile.");}]);
    case "sociologia":
      return scene("Arianna · Osservazione sul campo",
        has("Taccuino di Goffman")?"«Al prossimo seminario porto la tua nota. Anche la fila al bar ha un retroscena.»":
          "«Sto osservando come cambia il modo di parlare quando passa un professore. Tu dove cercheresti il retroscena?»",
        ["Vicino alla macchinetta del caffè",()=>{carry("Taccuino di Goffman");discover("goffman","Il retroscena della macchinetta");}],
        ["Davanti al microfono di Radio Luiss",()=>{state.chatTopic={uid:activeScene,prompt:"Davanti al microfono di Radio Luiss.",reply:"«Ottimo esempio di ribalta. Prova a riascoltare quello che dicono quando il microfono si spegne.»"};}]);
    case "radio":
      return scene("Radio Luiss · Fuori onda","«Stiamo registrando i rumori del campus. Per il momento il tornello è il nostro miglior ospite.»",
        ["Da dove viene la sigla?",()=>{state.chatTopic={uid:activeScene,prompt:"Da dove viene la sigla?",reply:"«Tre note al sintetizzatore, una porta che sbatte e il barista che dice: chi è il prossimo?»"};}],
        ["Racconta un fatto dal campus",()=>{carry("Pass Radio Luiss");record("Radio Luiss · La leggenda della presa occupata.");state.chatTopic={uid:activeScene,prompt:"Ti racconto della presa occupata.",reply:"«Dai, siediti. Puntata speciale sulle risorse scarse: tre prese, ventidue fuorisede.»"};}]);
    case "carsharing":
      if(!isFree()&&!has("Seminario Parenzo"))return scene("Luiss Green Mobility","Partecipa al seminario di Parenzo prima di richiedere l’abilitazione.");
      if(!isFree()&&!has("Abilitazione Green Mobility"))return scene("Luiss Green Mobility","Prima corsa? Controlla la batteria e riconsegna l’auto alla stazione di Pola.",
        ["Completa l’abilitazione",()=>checkpoint("Abilitazione Green Mobility")]);
      return scene("Luiss Green Mobility","Veicolo elettrico disponibile. Riconsegnalo alla stazione di Pola.",
        ["Vai a Viale Pola",()=>{record("Green Mobility · Auto riconsegnata a Pola");travel("pola","car");}]);
    case "shop":return shopScene();
    case "storia":
      return scene("Prof.ssa Serra · Storia contemporanea",state.historyAnswer??
        "«Partiamo da una data. In che anno cadde il Muro di Berlino?»",
        ...(!state.historyAnswer?[["1989",()=>{state.historyAnswer="«Esatto. Il 9 novembre 1989 si aprirono i valichi.»";checkpoint("Lezione A200");}],
          ["1991",()=>{state.historyAnswer="«Il 1991 è l’anno della dissoluzione dell’URSS. Per il Muro torniamo al 1989.»";}]]:[]),
        ["Perché il Muro venne costruito?",()=>{state.historyAnswer="«Nel 1961 la Germania Est volle fermare l’esodo verso Ovest attraverso Berlino.»";}],
        ["Un’altra domanda",()=>{state.historyAnswer=null;}]);
    case "guardia":
      return scene("La guardia",has("Via libera")?"«Badge a posto. Il tornello è alla tua destra, accanto alla bacheca.»":"Ti scruta in silenzio. Poi scruta lo zaino. Lo zaino sembra più preparato di te.",
        ...(has("Via libera")?[]:[["Mostra il badge",()=>badge("La guardia approva il badge. Su di te si riserva. ")]]),
        ...(t.autocontrollo>=65||t.socialita>=65?[["Sostieni lo sguardo e saluta",()=>{badge("La guardia ricambia il saluto. Non succedeva dal 2018.");discover("sguardo","Vittoria ai punti");change("coraggio",4);}]]:[]));
    case "bacheca":return scene("Bacheca del campus","Tra un seminario sul futuro e un volantino per ripetizioni di micro c’è una nota sui posti al Dome.",
      ["Leggi il retro",()=>{carry("Nota del Dome");discover("bacheca","Il retro della locandina");}]);
    case "varco":
      return scene("Tornello",has("Via libera")||isFree()?"Badge riconosciuto. Il tornello è aperto.":"Presenta il badge alla guardia, a sinistra del tornello.",
        ...((isFree()||has("Via libera"))?[["Entra nel campus",()=>travel("giardino")]]:[]));
    case "dome":
      return scene("The Dome",won("dance")?"«Sei tu nel video, vero?» Una studentessa sposta lo zaino. «Fai il passo finale e questo posto è tuo.»":has("Nota del Dome")?"La nota diceva di guardare dietro la pianta. C’è un tavolo, una sedia e perfino una presa.":"I tavoli visibili sono pieni. Un ficus di dimensioni ingiustificate copre metà vetrata.",
        ["Entra nel Dome",()=>travel("dome","campus")],
        ...(won("dance")?[["Rifai il passo finale",()=>{carry("Nota del Dome");record("Al Dome ti riconoscono e ti fanno posto.");}]]:[]),
        ...(has("Nota del Dome")?[reserve("Il posto dietro il ficus","Apri gli appunti. Il ficus è il primo compagno di studio che non ti chiede gli appunti.")]:[]),
        ...(t.curiosita>=65&&!has("Nota del Dome")?[["Sbircia dietro il ficus",()=>{carry("Nota del Dome");change("curiosita",5);}]]:[]));
    case "coppia":return scene("I pendolari della presa","«C’è posto in T04, ma guarda bene. Qui una felpa lasciata su una sedia ha più diritti di un matricolato.»",
      ...(t.empatia>=65?[["Presta il tuo caricatore",()=>{carry("Presa condivisa");change("empatia",3);}]]:[]));
    case "t04":return scene("Aula T04",has("Presa condivisa")?"Lo studente del giardino ti fa cenno. Ha tenuto una sedia e trovato una ciabatta.":"C’è una sedia occupata da una felpa. Nessun proprietario in vista. Sul banco accanto c’è un posto libero, lontano dalla presa.",
      reserve(has("Presa condivisa")?"T04, con corrente":"Studio in modalità risparmio",has("Presa condivisa")?"Una presa per due. Funziona meglio di certi lavori di gruppo.":"Il portatile segna 4%. Con carta e penna duri senz’altro più di lui."));
    case "poker":return scene(local("Tavolo da poker · Giardino","Garden poker table"),
      local("Nina e Benedetta ti fanno posto. Cinque carte a testa e un solo cambio, fino a tre carte.",
        "Nina and Benedetta make room. Five cards each and one draw of up to three cards."),
      [local("Siediti e gioca","Sit down and play"),()=>openChallenge("poker")]);
    case "ping":return scene("Terrazza ping pong","Si gioca a sette punti, con almeno due di vantaggio. Se vinci, il bar ti offre una limonata.",
      ["Gioca a ping pong",()=>openChallenge("ping")],["Allenati",()=>openChallenge("ping",true)]);
    case "lettura":return scene("Pergola di lettura",isFree()||won("bris")?
      "Mostri la carta fortunata al ragazzo che gestisce i tavoli. Ti indica il posto in fondo, lontano dal bar.":
      "I Nullafacenti hanno riservato questo tavolo al vincitore di Briscola. Li trovi al bar.",
      ...((isFree()||won("bris"))?[reserve("Il posto sotto la pergola","La carta fortunata fa da segnalibro. Da qui il bar si sente appena.")]:[]));
    case "bar":return scene("Il tavolo dei Nullafacenti",won("bris")?
      "La carta fortunata ti dà accesso alla pergola, a ovest del giardino. I Nullafacenti chiedono la rivincita.":
      "«Lezione? L’abbiamo messa tra gli impegni eventuali.» Vinci a briscola per ottenere la carta che apre il posto studio alla pergola.",
      ["Gioca a briscola",()=>openChallenge("bris")],
      [local("Gioca a Scopa","Play Scopa"),()=>openChallenge("scopa")],
      ["Chiedi dov’è il silenzio",()=>{carry("Dritta sul Matroneo");discover("dritta","La leggenda di un piano silenzioso");}]);
    case "lunch":return scene("Il tavolo dopo pranzo",
      has("Pranzo finito")?"Le sedie sono libere. Dalla finestra si vede il cortile, ma qui dentro arriva solo un filo di rumore.":has("Dritta del barista")?"Il gruppo sta ancora pranzando. Puoi aspettare al bar.":"Sul tavolo ci sono vassoi e quaderni. Il barista potrebbe sapere quando si libera.",
      ...(has("Pranzo finito")?[reserve("Due pagine in pace","Finalmente apri gli appunti. Fuori ricomincia il biliardino. Per la prima volta oggi, non devi alzarti.")]:[]));
    case "biliardo":return scene("Biliardini",won("foos")?
      "La prenotazione del bar apre le scale del primo piano. Il portiere chiede una rivincita.":
      "Vinci la partita e i baristi ti danno la prenotazione per salire al primo piano dell’edificio principale.",
      ["Gioca a biliardino",()=>openChallenge("foos")],["Allenati",()=>openChallenge("foos",true)]);
    case "mensa":return scene("Banco del pranzo",has("Vassoio")?"Ada ti indica i tavoli e il ritiro dei vassoi prima del chiostro.":"Sul bancone ci sono pasta al pomodoro, crocchette e frutta. Ada ti porge un vassoio.",
      ...(has("Vassoio")?[]:[
        ["Prendo la pasta al pomodoro.",()=>{carry("Vassoio");discover("mensa","La pasta portante");change("coraggio",5);}],
        ["Oggi vado di crocchette.",()=>{carry("Vassoio");discover("mensa","Pranzo in mensa");record("Prendi le crocchette e cerchi un tavolo.");}]
      ]));
    case "vassoi":return scene("Ritiro vassoi",has("Vassoio restituito")?"Hai già riordinato il tavolo. Il passaggio verso il chiostro è libero.":"Prima del chiostro c’è il carrello dei vassoi. Su un tavolo ne è rimasto uno.",
      ...(has("Vassoio restituito")?[]:[[has("Vassoio")?"Restituisci il vassoio":"Riporta il vassoio dimenticato",()=>{
        carry("Vassoio");carry("Vassoio restituito");change("pragmatismo",4);record("Vassoio restituito in mensa.");
      }]]));
    case "chiostro":return scene("Chiostro della mensa","Il servizio è quasi finito. Un tavolo all’ombra si libera quando i vassoi tornano al banco.",
      ...(has("Vassoio")?[reserve("Posto con vista sul chiostro","Restituisci il vassoio e apri il libro. La pasta del giorno ha lasciato il segno, fortunatamente solo emotivo.")]:[["Riporta un vassoio dimenticato",()=>{carry("Vassoio");change("pragmatismo",4);}]]));
    case "107":return scene("Aula 107","Dentro stanno facendo un gruppo di studio. Da dieci minuti discutono chi debba creare il gruppo WhatsApp.",
      ...(has("Carta fortunata")||t.socialita>=60||state.avatar.meta===1?[reserve("Studio di gruppo, per davvero","Proponi di iniziare dalla prima domanda. Parte il timer. Per un momento si sente solo il rumore delle penne.")]:[]));
    case "silenzio":return scene("La studentessa del terzo","«Al Matroneo si sente anche un file Excel quando va in errore. Se entri, metti il telefono in silenzioso.»",
      ["Metti il telefono in silenzioso",()=>{carry("Telefono silenziato");discover("silenzio","Notifica soppressa");}]);
    case "matroneo":return scene("Matroneo",has("Telefono silenziato")?"Il telefono tace. Un posto accanto al muro si è appena liberato.":"Si sente persino il cursore. Una studentessa ti indica il telefono con un cenno.",
      ...(has("Telefono silenziato")?[reserve("Il silenzio del Matroneo","Finalmente studi. Ti accorgi che il rumore che sentivi in testa era il biliardino immaginario.")]:[]),
      ...(has("Dritta sul Matroneo")&&has("Prenotazione Biliardino")?[reserve("Il posto del campione","I Nullafacenti hanno liberato il loro tavolo. Il torneo dell’anno prossimo è già in calendario. L’esame di domani, purtroppo, pure.")]:[]));
    default:return scene("Cerca un posto per studiare","Avvicinati a persone, porte e oggetti e premi E. Apri la mappa sotto i comandi per orientarti.");
  }
}
function finish(title,text){
  record(title);
  if(isFree())state.freeMoment={title,text};
  else state.ending={title,text};
}
let captionFrame=0, captionText="";
function finishCaption(){
  if($("skipCaption").hidden)return false;
  cancelAnimationFrame(captionFrame);
  $("sceneText").textContent=captionText;
  $("skipCaption").hidden=true;
  return true;
}
$("skipCaption").onclick=()=>{finishCaption();$("choices").querySelector("button")?.focus();};
function showCaption(text, animate){
  cancelAnimationFrame(captionFrame);
  $("sceneTranscript").textContent=text;
  captionText=text;
  $("skipCaption").hidden=!animate||!text||reducedMotion;
  if($("skipCaption").hidden){$("sceneText").textContent=text;return;}
  $("sceneText").textContent="";
  const start=performance.now();
  function type(now){
    $("sceneText").textContent=text.slice(0,Math.floor((now-start)/16));
    if($("sceneText").textContent===text){finishCaption();return;}
    captionFrame=requestAnimationFrame(type);
  }
  captionFrame=requestAnimationFrame(type);
}
const campusPortraits={
  "prof-storia":{capelli:4,tinta:2,pelle:0,occhi:1,volto:0,accessorio:3,taglio:2,abito:4},
  "tutor-viola":{capelli:7,tinta:1,pelle:2,occhi:0,volto:1,accessorio:5,taglio:1,abito:1},
  "giardiniera-nora":{capelli:5,tinta:0,pelle:1,occhi:2,volto:0,accessorio:1,taglio:1,abito:1},
  "radio-tommaso":{capelli:1,tinta:2,pelle:0,occhi:2,volto:2,accessorio:0,taglio:3,abito:3},
  gymbro:{capelli:3,pelle:2,corpo:2,volto:2,occhi:0,accessorio:0,taglio:1,abito:0},
  "parenzo-interno-npc":{capelli:1,tinta:3,pelle:1,occhi:0,volto:2,accessorio:3,taglio:2,abito:4},
  "pola-cortile-npc":{capelli:6,tinta:0,pelle:3,occhi:3,volto:1,accessorio:0,taglio:2,abito:0}
};
function characterSeed(uid){
  let hash=2166136261;
  for(const ch of uid)hash=Math.imul(hash^ch.codePointAt(0),16777619);
  return hash>>>0;
}
function characterAppearance(o){
  const seed=characterSeed(o.uid);
  const role=o.kind;
  if(role==="guard")return {...guard,taglio:2,dettaglio:3,pantaloni:0};
  const professor=role==="professor";
  return {...student,capelli:(seed>>>3)%8,pelle:(seed>>>8)%4,occhi:(seed>>>11)%4,
    tinta:professor&&seed%3===0?3:(seed>>>18)%5,volto:(seed>>>20)%3,
    corpo:role==="athlete"?2:(seed>>>24)%3,abito:seed%5,
    accessorio:role==="sportGlasses"?6:professor&&seed%2===0?3:(seed>>>16)%6,
    taglio:professor?2:(seed>>>23)%4,pantaloni:(seed>>>26)%4,
    scarpe:(seed>>>28)%3,zaino:professor?0:(seed>>>26)%4,lenti:o.variant,
    ...campusPortraits[o.uid]};
}
function characterCoat(o){
  return o.kind==="guard"||Object.hasOwn(campusPortraits,o.uid)?undefined:o.color;
}
function paintSpeaker(now){
  const canvas=$("speakerPortrait");
  if(canvas.hidden)return;
  const o=currentObject();
  if(!o)return;
  const c=canvas.getContext("2d");
  const colors=["#6c5d87","#77614d","#476c73","#5e7255"];
  const seed=characterSeed(o.uid);
  const beat=reducedMotion?0:Math.floor(now/170)%4;
  const moving=o.native==="trend";
  const a=characterAppearance(o);
  const {width,height}=canvas;
  const middle=width/2, baseline=height-17;
  c.fillStyle="#172331";c.fillRect(0,0,width,height);
  c.fillStyle=colors[seed%4];c.beginPath();c.ellipse(middle,height*.45,76,55,0,0,Math.PI*2);c.fill();
  c.fillStyle="#23364a";c.fillRect(0,baseline-17,width,34);
  c.fillStyle="#101923";c.beginPath();c.ellipse(middle,baseline+4,64,10,0,0,Math.PI*2);c.fill();
  const gesture=moving?[0,-10,4,10][beat]:o.kind==="professor"&&beat===1?2:0;
  sprite(c,a,middle+gesture,baseline-(moving&&beat%2?6:0),moving?beat%3:0,"down",4.55,
    characterCoat(o));
}
function renderScene(){
  const scene=getScene();
  $("objective").textContent=(testMode?"Prova · ":"")+((state.ending?.traffic||state.ending?.guard)?"Game Over":state.ending?tr("Missione compiuta"):state.mission||(isFree()?tr("Esplora il campus"):storyObjective()));
  const nextStep=isFree()?-1:storySteps.findIndex(([item])=>!has(item));
  const chapter=nextStep<0?"":nextStep<4?"Romania":nextStep===4?"Parenzo":"Pola";
  $("taskChapter").hidden=!chapter||Boolean(state.ending);
  $("taskChapter").textContent=chapter?chapter+" · "+(nextStep+1)+"/"+storySteps.length:"";
  $("zone").textContent=tr(room(state.zone).name);
  updateCampusOverview();
  $("campusMap").replaceChildren();
  for(const [id,zone] of Object.entries(campus.zones)){
    const item=document.createElement("li");
    item.textContent=(id===state.zone?local("Sei qui · ","You are here · "):"")+tr(zone.name)+" — "+zone.objects.filter(o=>o.action).map(o=>tr(o.name)).join(", ");
    $("campusMap").append(item);
  }
  const access=isFree()?[]:Object.keys(unlocks).filter(won).map(id=>unlocks[id]);
  refreshWallet();
  $("status").textContent=state.name+" · "+(state.matricola?state.matricola+" · ":"")+tr(options.passato[state.avatar.passato])+(access.length?local(" · Accessi: "," · Unlocked: ")+access.map(tr).join(", "):"");
  $("journalTitle").textContent=local("Diario e tasche · ","Journal and inventory · ")+state.secrets.length+"/"+totalSecrets+local(" scoperte"," discoveries");
  $("sceneTitle").textContent=tr(scene.title);
  const speaker=currentObject();
  const conversation=Boolean(speaker&&kindLayer(speaker)==="persone"&&!isVehicle(speaker));
  $("speakerPortrait").hidden=!conversation;
  $("game").classList.toggle("game-conversation",conversation||Boolean(state.ending?.guard));
  $("guardOutcome").hidden=!state.ending?.guard;
  refreshGateWarning();paintGuardOutcome(performance.now());
  paintSpeaker(performance.now());
  showCaption(tr(scene.text),Boolean(activeScene||state.prologue));
  $("playerLine").hidden=!scene.playerLine;
  $("playerLine").textContent=scene.playerLine?state.name+" · «"+tr(scene.playerLine)+"»":"";
  $("choices").replaceChildren();
  for(const [label,action] of scene.choices){
    const button=document.createElement("button");
    button.textContent=tr(label);
    const index=$("choices").children.length+1;
    if(index<=9){
      button.dataset.shortcut=String(index);
      button.setAttribute("aria-keyshortcuts",String(index));
    }
    button.onclick=()=>{state.chatTopic=null;action();if(screen==="game"){save();renderScene();if(!minigame)($("speakerPortrait").hidden?$("interact"):$("sceneTitle")).focus();}};
    $("choices").append(button);
  }
  if(activeScene && !state.ending){
    const close=document.createElement("button");close.textContent=tr("Torna a esplorare");
    close.onclick=()=>{activeScene=null;state.chatTopic=null;state.freeMoment=null;renderScene();$("interact").focus();};$("choices").append(close);
  }
  $("log").replaceChildren();
  for(const entry of state.log){const li=document.createElement("li");li.textContent=tr(entry);$("log").append(li);}
  const pockets=document.createElement("li");
  pockets.textContent=local("In tasca: ","Inventory: ")+(state.pockets.map(tr).join(", ")||local("solo il badge e un programma d’esame.","just your badge and an exam syllabus."));
  $("log").append(pockets);
  const profile=document.createElement("li");profile.textContent=Object.entries(traits).map(([id,label])=>tr(label)+" "+state.traits[id]).join(" · ");$("log").append(profile);
}
const stage=$("stage").getContext("2d");
const cover=$("cover").getContext("2d");
const guard={corpo:2,volto:2,capelli:1,occhi:1,pelle:2,abito:2,accessorio:1};
const student={corpo:0,volto:1,capelli:2,occhi:0,pelle:1,abito:0,accessorio:5,tinta:2};
