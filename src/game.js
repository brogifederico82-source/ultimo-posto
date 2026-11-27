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
  "Atrio centrale":"Central atrium","Serra · Spazio polifunzionale":"Greenhouse · Multipurpose space",
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
  $("challengeAudioLabel").textContent=local("Opzioni audio","Audio options");
  renderMixers();
  renderMusicFeedback();
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
  if(typeof schermateLingua==="function")schermateLingua();
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
const totalSecrets=16;
const challengeNames={arm:"Braccio di ferro",dance:"Trend di ballo",ping:"Ping pong",foos:"Biliardino",bris:"Briscola",scopa:"Scopa",poker:"Texas Hold’em",cavalli:"Cavalli virtuali",virtuali:"Virtuali · Calcio",calcetto:"Calcetto · The Dome 2",mattoni:"Pixel Mattoni",nastri:"Salva i nastri"};
const unlocks={ping:"Limonata al bar",foos:"Primo piano",bris:"Pergola di lettura"};
const won=id=>Boolean(state?.wins[id]);
const saveKey="ultimo-posto-v1";
const keys = new Set();
const controls = new Set();
let screen="home", state=null, activeScene=null, dirty=false, selectedMode="story";
const isFree=()=>state?.mode==="free";
const gateLocked=(id,profile=state)=>Boolean(id&&profile?.mode!=="free"&&!profile?.wins?.[id]);
const resumableStories=new Set(["parenzo-seminario","pola-festa","tutor-orientamento","storia","loft-progetto"]);
function resumableScene(id){
  if(typeof id!=="string"||state.prologue||state.ending)return null;
  const object=zoneObjects(room(state.zone)).byId.get(id);
  if(object?.action!=="native"||!resumableStories.has(object.native)||gateLocked(object.gate))return null;
  return nearbyIn(state.zone,state.x,state.y,mapClock)?.uid===id?id:null;
}

function stored(mode="story"){
  try{
    const data=JSON.parse(localStorage.getItem(saveProfileKey(mode)));
    if(data?.version!==1 || !data.avatar || !data.traits || !Array.isArray(data.log))return null;
    data.mode=mode;
    if(data.zone==="td2"&&!Object.hasOwn(campus.zones,"td2")&&room("giardino").objects.some(o=>o.uid==="dome2-calcetto")){
      data.zone="giardino";
      [data.x,data.y]=reachEntry("giardino","dome2",data);
      data.campusGateOpen=true;
    }
    if(!Object.hasOwn(campus.zones,data.zone))data.zone="ingresso";
    if(data.zone==="ingresso"&&!data.streetVisited&&room("ingresso").width===30){
      [data.x,data.y]=reachEntry("ingresso",undefined,data);data.streetVisited=true;
    }
    const garden=room("giardino");
    const enlarged=garden.objects.some(o=>o.uid==="entry-from-panama");
    const layout=enlarged?campusLayoutVersion:garden.objects.some(o=>o.uid==="main-front")?2:0;
    if(data.zone==="giardino"&&layout&&(!data.campusLayout||data.campusLayout<layout)){
      if(data.campusLayout===2&&Number.isFinite(data.x)&&Number.isFinite(data.y)&&data.x>=0&&data.y>=0){
        if(data.x>=72||data.y>=79){
          [data.x,data.y]=reachEntry("giardino",data.x>=72?"panama":"ingresso",data);
        }else{
          data.x=Math.floor((data.x+.5)*4/3);data.y=Math.floor((data.y+.5)*4/3);
        }
      }else [data.x,data.y]=reachEntry("giardino","ingresso",data);
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
    [data.x,data.y]=freeTile(data.zone,Number.isFinite(data.x)?data.x:2,Number.isFinite(data.y)?data.y:2,data);
    return {...data,freeMoment:null,campusExpanded:true,wins:data.wins??{},pockets:Array.isArray(data.pockets)?data.pockets:[],secrets:Array.isArray(data.secrets)?data.secrets:[],events:Array.isArray(data.events)?data.events:[],
      completedEvents:Array.isArray(data.completedEvents)?data.completedEvents:[],mission:typeof data.mission==="string"?data.mission:"",missionTarget:typeof data.missionTarget==="string"?data.missionTarget:""};
  }catch{return null;}
}
function save(){
  if(testMode||!state)return true;
  try{localStorage.setItem(saveProfileKey(state.mode),JSON.stringify({...state,resumeScene:resumableScene(activeScene)}));return true;}
  catch{return false;}
}
function updateHomeActions(){
  if(screen!=="home")return;
  if(typeof schermateAggiornaHome==="function")return schermateAggiornaHome();
  const story=Boolean(stored("story"));
  const free=Boolean(stored("free"));
  $("start").textContent=story?local("Continua la storia","Continue story"):local("Inizia la storia","Start story");
  $("free").textContent=free?local("Riprendi l’esplorazione","Resume exploring"):local("Esplora il campus","Explore campus");
  $("resume").hidden=!story;
  $("resume").textContent=local("Nuova storia","New story");
  $("edOpen").textContent=local("Editor del campus","Campus editor");
}
function show(next){
  const prevScreen=screen;
  if(minigame)closeChallenge();
  if(next!=="game"&&cigarette)stopSmoking();
  clearCampusInputs();screen=next;
  for(const id of ["home","creator","game","editor"]) $(id).hidden=id!==next;
  $("homeButton").hidden=next==="home"||testMode;
  $("testBack").hidden=!testMode||next!=="game";
  if(next==="home")paintCover();
  if(next==="creator"){
    $("play").textContent=local("Inizia","Start");
    preview();
  }
  if(next==="editor") enterEditor();
  if(next==="game"){
    renderScene();
    window.scrollTo(0,0);
  }
  if(next!=="editor")refreshLanguage();
  if(typeof transizioneSchermata==="function")transizioneSchermata(prevScreen,next);
  if(typeof schermateMostra==="function")schermateMostra(next);
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
  if(typeof schermateTratti==="function")schermateTratti();
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
const spriteFrames=new Map();
const spriteCanvas={width:48,height:64,anchorX:24,anchorY:60};
const spriteFields=["pelle","abito","tinta","occhi","corpo","volto","pantaloni","scarpe","zaino",
  "taglio","dettaglio","motivo","capelli","espressione","baffi","accessorio","lenti","uniforme"];
function spriteTone(hex,amount){
  const color=Number.parseInt(hex.slice(1),16);
  const channels=[16,8,0].map(shift=>Math.round(clamp(((color>>shift)&255)+amount,0,255)));
  return "#"+channels.map(value=>value.toString(16).padStart(2,"0")).join("");
}
function createSpriteFrame(a,step,look,coatOverride){
  const canvas=document.createElement("canvas");
  const {width,height,anchorX,anchorY}=spriteCanvas;
  canvas.width=width*3;canvas.height=height*3;
  const c=canvas.getContext("2d");
  c.scale(3,3);c.translate(anchorX,anchorY);
  const block=(color,x,y,w,h)=>{
    c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,Math.min(w,h)*.35);c.fill();
  };
  const contour=(color,points)=>{
    const ys=points.map(p=>p[1]),top=Math.min(...ys),bottom=Math.max(...ys);
    const shade=c.createLinearGradient(0,top,3,bottom);
    shade.addColorStop(0,spriteTone(color,12));shade.addColorStop(.58,color);shade.addColorStop(1,spriteTone(color,-11));
    c.fillStyle=shade;c.beginPath();
    const last=points.at(-1),first=points[0];
    c.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);
    for(let i=0;i<points.length;i++){
      const [x,y]=points[i],[nx,ny]=points[(i+1)%points.length];
      c.quadraticCurveTo(x,y,(x+nx)/2,(y+ny)/2);
    }
    c.closePath();c.fill();
  };
  const facing=look==="left"||look==="right",behind=look==="up";
  const side=facing?1:0;
  const faceShift=side*4;
  const skin=["#edbc94","#c98b60","#a26950","#744936"][a.pelle]??"#c98b60";
  const coat=coatOverride??["#b85052","#63946e","#5476a3","#c18c43","#202f51"][a.abito]??"#5476a3";
  const hair=["#5b352a","#2e2938","#954933","#9c919b","#754261"][a.tinta]??"#5b352a";
  const iris=["#633c2c","#436249","#3d617b","#965c31"][a.occhi]??"#633c2c";
  const trousers=["#343845","#415a78","#a89170","#586c54"][a.pantaloni]??"#343845";
  const shoes=["#29313a","#e8dfca","#77472e"][a.scarpe]??"#29313a";
  const skinShade=spriteTone(skin,-28),skinLight=spriteTone(skin,29);
  const coatShade=spriteTone(coat,-23),coatLight=spriteTone(coat,26);
  const hairShade=spriteTone(hair,-24),hairLight=spriteTone(hair,28);
  const ink="#252737";
  const shoulders=([10,8,12][a.corpo]??10)-side;
  const face=([10,9,11][a.volto]??10)-side;
  const heightShift=[-2,1,0][a.corpo]??0;
  const bob=step===0?0:-1;
  const top=-48+heightShift+bob;

  c.fillStyle="#172b314b";c.beginPath();c.ellipse(0,-1,16,2.6,0,0,Math.PI*2);c.fill();
  if(look==="left")c.scale(-1,1);

  for(const [leg,offset] of [[-7,step===1?-2:0],[2,step===2?-2:0]]){
    const reach=facing?(offset?-2:2):0;
    contour(ink,[[leg-1,-16],[leg+6,-16],[leg+5+reach,-7+offset],[leg+8+reach,-3+offset],
      [leg+8+reach,offset],[leg-2+reach,offset],[leg-2+reach,-4+offset],[leg,-7+offset]]);
    contour(a.lingerie?skin:trousers,[[leg,-15],[leg+5,-15],[leg+4+reach,-7+offset],[leg+5+reach,-4+offset],[leg+reach,-4+offset]]);
    block(a.lingerie?skinLight:spriteTone(trousers,26),leg+reach,-8+offset,2,3);
    block(shoes,leg-1+reach,-3+offset,8,2);
    block(spriteTone(shoes,36),leg+3+reach,-3+offset,3,1);
    block("#d2c5ab",leg-1+reach,-1+offset,8,1);
  }
  if(a.capelli===4||a.capelli===6){
    const tip=top+(a.capelli===6?33:27);
    contour(ink,[[-face-2,top+9],[face+2,top+7],[face+3,tip-4],[face,tip],[-face-2,tip-1],[-face-4,tip-6]]);
    contour(hairShade,[[-face-1,top+10],[face+1,top+9],[face+1,tip-3],[face-2,tip-1],[-face-1,tip-3]]);
    block(hairLight,-face-2,top+14,2,Math.max(3,tip-top-17));
  }
  if(a.zaino){
    const bag=["#876849","#51435e","#303849","#dfca9b"][a.zaino]??"#51435e";
    const left=behind?-8:facing?-13:shoulders-1;
    contour(ink,[[left,-27+bob],[left+10,-27+bob],[left+13,-23+bob],[left+13,-12],[left+10,-9],[left,-9],[left-2,-13],[left-2,-23+bob]]);
    block(bag,left,-25+bob,11,14);
    block(spriteTone(bag,30),left+2,-17+bob,7,4);
    block(spriteTone(bag,-29),left+2,-16+bob,7,1);
  }
  const y=-28+heightShift+bob;
  if(a.lingerie){
    const hue=a.lingerie;
    const trim=spriteTone(hue,34);
    const mid=facing?3:0;
    contour(ink,[[-5,y-2],[5,y-2],[shoulders,y+3],[shoulders+2,y+14],
      [shoulders-1,y+17],[-shoulders+1,y+17],[-shoulders-2,y+14],[-shoulders,y+3]]);
    contour(skin,[[-4,y-1],[4,y-1],[shoulders-1,y+3],[shoulders+1,y+13],
      [shoulders-2,y+16],[-shoulders+2,y+16],[-shoulders-1,y+13],[-shoulders+1,y+3]]);
    for(const strap of [mid-5,mid+4])block(hue,strap,y+1,1,6);
    block(hue,-shoulders+2,y+7,shoulders*2-4,4);
    block(trim,mid-5,y+7,10,1);
    contour(hue,[[-shoulders+2,y+14],[shoulders-2,y+14],[5,y+18],[-5,y+18]]);
    block(trim,-shoulders+3,y+14,shoulders*2-6,1);
  }else{
    contour(ink,[[-6,y], [5,y], [shoulders+1,y+3],[shoulders+5,y+8],[shoulders+4,y+16],
      [shoulders+1,y+18],[-shoulders-1,y+18],[-shoulders-5,y+16],[-shoulders-5,y+8],[-shoulders-2,y+3]]);
    contour(coatShade,[[-6,y+1],[5,y+1],[shoulders,y+4],[shoulders+3,y+8],
      [shoulders+2,y+15],[-shoulders-3,y+15],[-shoulders-4,y+8],[-shoulders-1,y+4]]);
    contour(coat,[[-6,y+1],[5,y+1],[shoulders-1,y+4],[shoulders-1,y+12],
      [shoulders,y+16],[-shoulders,y+16],[-shoulders+1,y+7],[-shoulders+1,y+4]]);
    contour(coatLight,[[-7,y+3],[-4,y+4],[-6,y+9],[-shoulders+1,y+13],[-shoulders+2,y+6]]);
    block(coatShade,-shoulders+1,y+15,shoulders*2-2,1);
    for(const hand of [-shoulders-4,shoulders]){
      block(skinShade,hand,y+11,4,5);block(skin,hand+1,y+11,2,4);
      block(coatLight,hand,y+10,4,1);
    }
    if(!behind){
      const mid=facing?3:0;
      block(skinShade,mid-3,y-4,6,5);
      if(a.taglio===1){
        contour(coatShade,[[mid-6,y],[mid+7,y],[mid+4,y+4],[mid-3,y+4]]);
        block("#e7d4ad",mid-3,y+3,1,6);block("#e7d4ad",mid+3,y+3,1,5);
      }else if(a.taglio===2){
        contour("#e5d9bc",[[mid-5,y],[mid+5,y],[mid+2,y+7],[mid-1,y+7]]);
        block(ink,mid,y+7,1,9);block(coatLight,mid-4,y+4,2,5);
      }else if(a.taglio===3){
        block(coatLight,-shoulders+1,y+3,3,9);block(coatLight,shoulders-4,y+3,3,9);
      }else block(coatShade,mid-5,y,10,2);
      if(a.motivo===1)for(const stripe of [-5,0,5])block(coatLight,stripe,y+7,1,6);
      if(a.motivo===2)for(const stripe of [-5,0,5])block("#e7c68f",stripe,y+9+(stripe?2:0),1,1);
      if(a.zaino&&!facing)block(coatShade,-shoulders+1,y+3,2,9);
      if(a.dettaglio===1)block("#f0be75",mid+4,y+5,3,2);
      if(a.dettaglio===2){block("#192736",mid-7,y+5,4,3);block("#f0be75",mid-6,y+5,2,1);}
      if(a.dettaglio===3){
        contour("#c79977",[[mid-4,y],[mid+4,y],[mid+1,y+9],[mid-1,y+9]]);
        block("#f0e4cf",mid-2,y+8,4,4);block("#7a8e8d",mid-1,y+9,2,1);
      }
      if(a.accessorio===2)block("#ffd184",mid-3,y+2,6,1);
      if(a.accessorio===5){
        block("#b73d58",mid-6,y,13,3);block("#df646d",mid-5,y,11,1);
        block("#ca4c5b",mid-4,y+3,3,6);block("#ef8a7d",mid-3,y+8,2,1);
      }
    }else if(a.zaino){
      const bag=["#876849","#51435e","#303849","#dfca9b"][a.zaino]??"#51435e";
      contour(ink,[[-6,y+1],[6,y+1],[9,y+5],[9,y+13],[6,y+16],[-7,y+16],[-9,y+13],[-9,y+4]]);
      block(bag,-7,y+4,14,10);block(spriteTone(bag,26),-6,y+5,12,2);block(spriteTone(bag,-23),-5,y+10,10,3);
    }
  }

  const cx=faceShift;
  const jaw=a.volto===1?4:6;
  if(a.capelli===5||a.capelli===7){
    contour(ink,[[cx+1,top+1],[cx+3,top-4],[cx+7,top-6],[cx+11,top-4],[cx+12,top+1],[cx+9,top+6]]);
    contour(hair,[[cx+3,top+1],[cx+5,top-4],[cx+9,top-4],[cx+11,top],[cx+8,top+4]]);
    block(hairLight,cx+5,top-3,4,1);
  }
  contour(ink,[[cx-face+3,top],[cx+face-3,top],[cx+face+1,top+3],[cx+face+2,top+9],
    [cx+face+2,top+14],[cx+face-1,top+19],[cx+jaw,top+22],[cx-jaw,top+22],
    [cx-face+1,top+19],[cx-face-2,top+14],[cx-face-2,top+7],[cx-face,top+3]]);
  contour(skinShade,[[cx-face+3,top+1],[cx+face-4,top+1],[cx+face,top+4],[cx+face+1,top+13],
    [cx+face-2,top+18],[cx+jaw-1,top+21],[cx-jaw+1,top+21],[cx-face+2,top+18],[cx-face-1,top+13],[cx-face,top+5]]);
  contour(skin,[[cx-face+4,top+2],[cx+face-4,top+2],[cx+face-1,top+6],[cx+face-2,top+14],
    [cx+jaw-1,top+19],[cx-jaw+1,top+20],[cx-face+1,top+15],[cx-face,top+7]]);
  block(skin,cx-face-1,top+11,2,4);block(skinLight,cx-face-1,top+11,1,2);

  if(a.capelli!==3){
    if(behind){
      contour(hairShade,[[-face+3,top+1],[face-3,top+1],[face+1,top+6],[face,top+15],[5,top+20],
        [-5,top+20],[-face,top+15],[-face-1,top+6]]);
      contour(hair,[[-face+3,top+2],[face-3,top+2],[face,top+6],[face-2,top+12],[3,top+16],[-5,top+16],[-face+1,top+11]]);
    }else{
      const part=a.capelli===1?2:a.capelli===2?-2:0;
      contour(hairShade,[[cx-face+3,top],[cx+face-2,top],[cx+face,top+4],[cx+face,top+9],[cx+face-3,top+10],
        [cx+part+3,top+5],[cx+part-2,top+7],[cx-face+1,top+12],[cx-face-1,top+8],[cx-face,top+4]]);
      contour(hair,[[cx-face+4,top+1],[cx+face-3,top+1],[cx+face-1,top+4],[cx+face-2,top+7],
        [cx+part+2,top+4],[cx+part-2,top+6],[cx-face+2,top+9],[cx-face,top+6]]);
    }
    for(const [dx,dy,length] of [[-6,3,4],[-2,2,5],[3,3,3]]){
      c.strokeStyle=hairLight;c.lineWidth=.65;c.lineCap="round";c.beginPath();
      c.moveTo(cx+dx,top+dy+1);c.quadraticCurveTo(cx+dx+1,top+dy-.6,cx+dx+length,top+dy);c.stroke();
      if(a.capelli===2)block(hairShade,cx+dx+1,top+dy+2,2,1);
    }
  }else block(skinLight,cx-4,top+4,7,2);

  if(!behind){
    const eyes=facing?[cx+2]:[cx-5,cx+4];
    for(const ex of eyes){
      block(hairShade,ex-1,top+9,4,1);
      block("#f2dfc9",ex-1,top+11,4,2);block(iris,ex+side,top+11,2,2);
      block("#fff2db",ex+side,top+11,1,1);
    }
    block(skinLight,cx+side*2,top+12,2+side,3);
    block(skinShade,cx+side*3+1,top+15,2,1);
    block("#be755f70",cx-face+3,top+15,3,1);
    if(!facing)block("#be755f70",cx+face-5,top+15,3,1);
    block("#784744",cx+side-2,top+17+(a.espressione===1?1:0),a.espressione===2?3:5,1);
    if(a.espressione===1)block("#f4cfb3",cx+side-1,top+17,3,1);
    if(a.baffi===1||a.baffi===2)block(hairShade,cx+side-3,top+16,7,a.baffi===1?1:2);
    if(a.baffi===3)block(hair,cx+side-2,top+19,4,2);
    if(a.accessorio===3||a.accessorio===4||a.accessorio===6){
      const sporty=a.accessorio===6;
      const frame=sporty?ink:"#9b704c";
      const lens=["#66c7ca","#d39252","#9889bc"][a.lenti]??"#66c7ca";
      const lenses=a.accessorio===4?eyes.slice(-1):eyes;
      for(const ex of lenses){
        block(frame,ex-2,top+10,6,1);block(frame,ex-2,top+13,6,1);
        block(frame,ex-2,top+11,1,2);block(frame,ex+3,top+11,1,2);
        if(sporty){block(lens,ex-1,top+11,4,2);block("#d9ebdf",ex-1,top+11,2,1);}
      }
      if(lenses.length===2)block(frame,cx-1,top+11,3,1);
    }
  }
  if(a.uniforme){
    contour(ink,[[cx-11,top+2],[cx-9,top-4],[cx-4,top-6],[cx+7,top-6],
      [cx+10,top-3],[cx+11,top+1],[cx+13,top+3],[cx+7,top+5],[cx-9,top+4]]);
    block("#39475e",cx-8,top-4,16,5);
    block("#64718a",cx-7,top-4,13,1);
    block("#1b2637",cx-10,top+1,21,2);
    block("#d0b17c",cx-1,top-3,3,3);
    block("#f0d89d",cx,top-3,1,2);
  }else if(a.accessorio===1){
    contour(ink,[[cx-9,top+1],[cx-7,top-6],[cx+6,top-6],[cx+9,top+1],[cx+13,top+2],[cx+11,top+5],[cx-11,top+5],[cx-13,top+3]]);
    block("#694c68",cx-6,top-5,12,6);block("#a07790",cx-11,top+2,22,2);
    block("#c398a2",cx-6,top-5,9,1);block("#433a55",cx-7,top,14,1);
  }
  return canvas;
}
function sprite(c,a,x,y,step=0,look="down",size=1,coatOverride){
  const key=[...spriteFields.map(field=>a[field]),step,look,coatOverride].join("/");
  let frame=spriteFrames.get(key);
  if(!frame){
    frame=createSpriteFrame(a,step,look,coatOverride);
    if(spriteFrames.size>=384)spriteFrames.delete(spriteFrames.keys().next().value);
    spriteFrames.set(key,frame);
  }
  const {width,height,anchorX,anchorY}=spriteCanvas;
  const scale=size/2;
  c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
  c.drawImage(frame,Math.round(x)-anchorX*scale,Math.round(y)-anchorY*scale,width*scale,height*scale);
  c.restore();
}
function preview(){
  const c=$("portrait").getContext("2d"), a=avatar();
  const backdrop=c.createLinearGradient(0,0,240,144);
  backdrop.addColorStop(0,"#192b42");backdrop.addColorStop(1,"#4b5769");
  c.fillStyle=backdrop;c.fillRect(0,0,240,144);
  c.fillStyle="#d1b28542";c.beginPath();c.ellipse(120,70,61,55,0,0,Math.PI*2);c.fill();
  rect(c,"#d1b28552",45,11,150,1);rect(c,"#d1b28552",45,133,150,1);
  rect(c,"#172534",80,127,80,3);
  sprite(c,a,120,123,0,"down",4.15);
  $("ticket").textContent=badgeName();
  $("ticketNumber").textContent=local("Matricola di gioco ","Game student ID ")+draftMatricola;
  if(typeof schermatePreview==="function")schermatePreview();
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
  state={version:1,mode,campusGateOpen:mode==="free",name:badgeName(),matricola:draftMatricola,avatar:avatar(),traits:Object.fromEntries(Object.entries(sliders).map(([id,input])=>[id,Number(input.value)])),x,y,prologue:mode==="free"?0:1,streetVisited:true,campusExpanded:true,campusLayout:campusLayoutVersion,look:"down",zone,log:[],secrets:[],pockets:[],wallet:{coins:5,picked:[],owned:[]},ending:null,wins:{},events:[],completedEvents:[],mission:"",missionTarget:""};
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
  const fromZone=state.zone;
  [state.x,state.y]=reachEntry(zone,entry??state.zone);
  state.zone=zone;state.look="down";state.chatTopic=null;state.freeMoment=null;activeScene=null;
  if(typeof transizioneZona==="function")transizioneZona(fromZone,zone);
  syncBackgroundMusic();
}
function discover(id,description){
  if(state.secrets.includes(id))return;
  state.secrets.push(id);record("Scoperta · "+description);chime([60,64,67,71]);
  if(typeof toastOggetto==="function"&&!testMode)toastOggetto("Traguardo","Traguardo: "+description,{suono:false});
}
function carry(item){
  if(!state.pockets.includes(item)){
    state.pockets.push(item);
    if(typeof toastOggetto==="function"&&!testMode)toastOggetto(item);
  }
}
function has(item){return state.pockets.includes(item);}
function scene(title,text,...choices){return {title,text,choices};}
function campusTurnstile(uid){return uid==="viale-ingresso-varco"||uid==="panama-varco";}
function interact(){
  if(!exploringCampus())return;
  const spot=nearby();
  if(typeof guidaInteragisci==="function"&&guidaInteragisci(spot))return;
  if(segretiInteragisci(spot))return;
  if(!spot){sound("error","interface");return;}
  ambienteInteragisci(spot);
  clearCampusInputs();
  if(campusTurnstile(spot.uid)&&(isFree()||has("Via libera")||state.campusGateOpen)){
    if(!state.campusGateOpen)record("Badge riconosciuto. Il tornello è aperto.");
    sound("gate","map");
    state.campusGateOpen=true;activeScene=null;
    if(state.x===spot.x&&state.y===spot.y+1&&!blocked(state.zone,spot.x,spot.y))state.y=spot.y;
    syncBackgroundMusic();save();renderScene();$("interact").focus();
    return;
  }
  if(spot.uid==="viale-ingresso-varco"&&!has("Via libera")&&!isFree()){
    sound("error","interface");
    state.gateConfrontation=1;warnAtGate();
  }
  const destination=doorDestination(spot);
  if(destination){
    sound(spot.kind==="stairs"||spot.target.endsWith("#scale")?"stairs":"door","map");
    travel(...destination);save();renderScene();$("interact").focus();
    return;
  }
  if(spot.uid!=="viale-ingresso-varco"){
    sound(gateLocked(spot.gate)?"error":kindLayer(spot)==="persone"?"talk":"inspect","map");
  }
  state.chatTopic=null;activeScene=spot.uid;completeObjective(spot);
  if(resumableScene(activeScene))save();
  renderScene();focusScene();
}
const nativeDoors={uscita:"ingresso",giardino:"giardino",terra:"terra",caffe:"caffe",primo:"primo",terzo:"terzo"};
function doorDestination(spot){
  if(gateLocked(spot.gate)||(spot.uid==="pola-inside"&&!polaAuthorized()))return null;
  if(spot.action==="portal"){
    const destination=spot.target.split("#");
    return Object.hasOwn(campus.zones,destination[0])?destination:null;
  }
  if(spot.action!=="native")return null;
  if(!campusTurnstile(spot.uid)&&spot.native==="varco"&&(isFree()||has("Via libera")))return ["giardino"];
  if(spot.kind!=="door"&&spot.kind!=="stairs")return null;
  const destination=nativeDoors[spot.native];
  return destination&&Object.hasOwn(campus.zones,destination)?[destination]:null;
}

function gateConfrontation(){
  const armed=!$("unarmedGuard").checked;
  const stop=["Fermati e torna dalla guardia",()=>{
    state.gateConfrontation=0;state.guardWarned=false;activeScene=null;
  }];
  if(state.gateConfrontation===2)return scene("Tornello · Ultimo avvertimento",
    "La guardia taglia il passaggio e porta la mano al fianco. «Indietro. Adesso.» Il brusio del viale sembra spegnersi.",
    stop,
    ["Oltrepassa la linea",()=>{
      const x=vialeEntrance.x+15,y=vialeEntrance.gateY;
      state.gateConfrontation=0;warnAtGate();
      if(crossRestrictedLine(x,y)&&state.ending?.guard){
        state.ending.text=(armed
          ?"La guardia ha sparato. Sul pavimento resta una chiazza scura."
          :"La guardia ti ha immobilizzato. Un filo di sangue ti scende dal labbro.")+
          " Dovevi fermarti alla linea gialla, tornare dalla guardia e mostrare il badge.";
      }
    }]);
  return scene("Tornello · Fermati alla linea",
    "La guardia alza una mano. «Fermo. Mostrami il badge prima di passare.» Le sbarre restano immobili.",
    stop,
    ["Arretra di un passo",()=>{
      state.gateConfrontation=0;state.guardWarned=false;activeScene=null;
      if(!blocked(state.zone,state.x,state.y+1))state.y++;
    }],
    ["Insisti per passare",()=>{state.gateConfrontation=2;record("Tornello · Hai insistito dopo il primo avvertimento.");}]);
}
function stopAtRestrictedLine(x,y){
  if(testMode||isFree()||state.campusGateOpen||has("Via libera")||!atViale(state)||!hasIntegratedEntrance())return false;
  if(x!==vialeEntrance.x+15||y!==vialeEntrance.gateY||state.y!==y+1)return false;
  state.gateConfrontation=1;
  warnAtGate();activeScene="viale-ingresso-varco";keys.clear();controls.clear();
  renderScene();$("sceneTitle").focus();
  return true;
}

function badge(reason){
  carry("Via libera");record(reason);
}
function reserve(title,text){
  return ["Siediti e studia",()=>finish(title,text)];
}
const storySteps=[
  ["Via libera","Mostra il badge alla guardia","Show your badge to security"],
  ["Colloquio tutor","Prepara il piano di studio con Viola al tutorato, davanti al Dome","Plan your studies with Viola at the tutoring office opposite The Dome"],
  ["Lezione A200","Segui la lezione di Storia contemporanea in Aula Chiesa (A200)","Attend Contemporary History in Aula Chiesa (A200)"],
  ["Progetto LOFT","Consegna il podcast al LOFT, all’ultimo piano","Hand in your podcast at the LOFT on the top floor"],
  ["Seminario Parenzo","Prendi la navetta dal giardino di Romania e segui il seminario a Parenzo","Take the shuttle from the garden at Romania and attend the seminar at Parenzo"],
  ["Abilitazione Green Mobility","Attiva Green Mobility all’area car sharing di Viale Romania","Activate Green Mobility at the car-sharing area on Viale Romania"],
  ["Festa a Pola","Raggiungi Pola in car sharing e festeggia la laurea","Reach Pola by car share and celebrate graduation"]
];
const romaniaComplete=()=>storySteps.slice(0,4).every(([item])=>has(item));
function checkpoint(item){
  if(!has(item))sound("objective","map");
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
    "A Parenzo il docente posa sul tavolo la stampa di una chat. Una bici, un prezzo e un ultimo «ci sentiamo». «Al mio primo tirocinio ho consigliato a un cliente di firmare prima di leggere l’ultima riga. Oggi quella riga la leggiamo insieme. Da dove iniziate?»",
    ...Object.entries(seminarPrep).map(([id,option])=>[option.label,()=>seminarChoice("prep",id,option)]));
  if(!attempt.response)return scene("Parenzo · L’obiezione di Dario",
    (attempt.prep==="timeline"?"Hai segnato l’ordine dei messaggi. ":"Hai annotato le differenze fra i due racconti. ")+
    "Dario volta la stampa e indica l’ultimo messaggio. «Al banco del mercatino di mio padre si concordava il prezzo anche solo per tenere da parte una bici. Qui come facciamo a sapere che intendessero già venderla?»",
    ...Object.entries(seminarResponses).map(([id,option])=>[option.label,()=>seminarChoice("response",id,option)]));
  return scene("Parenzo · Presentazione","Il docente ti passa il pennarello. Dario sposta la sedia verso la lavagna e ti lascia finire. Hai una frase per la tesi e una per il punto su cui lui ti ha fatto cambiare idea, o su cui continui a dissentire.",
    ["Presenta il caso",()=>{
      attempt.outcome=attempt.prep==="timeline"&&attempt.response==="prove"?"A":attempt.response==="ascolto"?"B":"C";
      const result=seminarOutcomes[attempt.outcome];
      record("Parenzo · "+result.title+". "+result.why);
      checkpoint("Seminario Parenzo");
    }],reset);
}


const partyChoices={
  chairs:{label:"Sistema le sedie vicino alla fontana",speech:"persone",line:"Hai tenuto una sedia per chi arriva tardi. Viola avrebbe approvato."},
  tape:{label:"Prepara la registrazione del LOFT",speech:"progetto",line:"Hai sistemato il registratore. Tommaso ti ricorda di lasciare un secondo di silenzio."},
  card:{label:"Lascia un foglio per un messaggio a chi arriva",speech:"matricole",line:"Sul primo foglio hai scritto dove trovare una presa e una persona a cui chiedere."},
  invite:{label:"Raggiungi chi è rimasto in disparte",speech:"persone",line:"Hai riportato al tavolo chi esitava a entrare. Il brindisi aspetta tutti."}
};
const graduationSpeeches={
  persone:"«A Romania cercavo un posto libero. Ho trovato persone che spostavano lo zaino senza che dovessi chiederlo. Oggi lascio una sedia libera anch’io.»",
  progetto:"«Nel mio primo podcast si sentiva più il tornello di me. Alla fine ho imparato ad ascoltare: anche mezzo secondo di silenzio può far parlare qualcun altro.»",
  matricole:"«A chi comincia: chiedete dove sono le prese, ma chiedete anche come sta chi vi siede accanto. Il primo consiglio salva una slide. Il secondo, a volte, un semestre.»"
};
function polaAuthorized(){
  return isFree()||(has("Seminario Parenzo")&&has("Abilitazione Green Mobility"));
}
function polaParty(){
  if(!polaAuthorized())return scene("Pola · Accesso",
    "La festa è nel cortile riservato agli invitati. Completa il seminario e l’abilitazione Green Mobility per arrivare con la tua tessera.");
  if(has("Festa a Pola"))return scene("Pola · Dopo il brindisi",
    "Davanti al Tinello Alberoni Chiara ripiega la lista degli invitati. «Ora ci siamo tutti.» Tommaso ha lasciato il registratore acceso un momento in più: sul nastro, dopo il discorso, si sente una sedia che qualcuno avvicina al tavolo. Viola, Serra e Tommaso ti aspettano a Romania.",
    [local(state.polaCapThrown?"Rilancia il tocco":"Lancia il tocco",state.polaCapThrown?"Throw the cap again":"Throw your graduation cap"),()=>{
      if(!state.polaCapThrown)record("Pola · Hai lanciato il tocco tra gli applausi.");
      state.polaCapThrown=true;
      polaThrowAt=performance.now();
      chime([60,64,67,76],.085);
    }],
    ["Ripensa al tuo semestre",ideeOpenRecap]);
  if(!state.graduationSpeech)return scene("Pola · Preparativi nel cortile",
    "Nel cortile Chiara conta le sedie pieghevoli e ne rimette una in fila. «Alla laurea di mia sorella sono arrivata quando stavano già sparecchiando. Da allora chiedo sempre chi deve ancora arrivare.» Ti porge la lista degli invitati. «Mi dai una mano prima del discorso?»",
    ...Object.entries(partyChoices).map(([id,choice])=>[choice.label,()=>{
      state.graduationSpeech=choice.speech;state.polaPreparation=id;record("Pola · "+choice.line);
    }]));
  const preparation=partyChoices[state.polaPreparation]?.line??"Chiara abbassa la musica e ti passa il microfono.";
  return scene("Pola · Il discorso",preparation+" "+graduationSpeeches[state.graduationSpeech],
    ["Brinda con gli altri",()=>{
      checkpoint("Festa a Pola");record("Pola · Hai fatto il discorso e lasciato il microfono sul tavolo.");
    }],
    ["Torna ai preparativi",()=>{state.graduationSpeech=null;state.polaPreparation=null;}]);
}

let vialeEncounterEffect=null;
let vialeGesture=null;
let vialeSelection=null;
const vialeOptions=[
  ["mouth","Bocca","Mouth"],
  ["hands","Mani","Hands"],
  ["feet","Piedi","Feet"],
  ["pecorella","Pecorella","From behind"]
];
function vialeEncounterScene(npc){
  const purse=wallet(),cost=5;
  const nadia=npc.uid==="viale-nadia";
  const offer=nadia
    ?local("«Bocca, mani, piedi o pecorella? Cinque monete, scegli tu.»","“Mouth, hands, feet, or from behind? Five coins. Your choice.”")
    :local("«Come preferisci, con la bocca, con le mani, con i piedi o a pecorella? Sempre cinque monete.»","“What's your preference: mouth, hands, feet, or from behind? It's five coins either way.”");
  const topics=[
    [local("Saluta","Say hello"),nadia
      ?local("Nadia alza la mano. «Ciao. Ti ho già visto rincorrere il 360?»","Nadia waves. “Hi. Have I seen you chasing the 360 before?”")
      :local("Mila sorride e ricambia il saluto. «Ciao, studente.»","Mila smiles and waves back. “Hi, student.”"),"wave"],
    [local("Chiedi del 360","Ask about the 360"),nadia
      ?local("«La fermata è verso l’ingresso della LUISS. Da qui lo vedi passare, ma non si ferma.»","“The stop is by the Luiss entrance. You can see it pass from here, but it doesn't stop.”")
      :local("«Per la fermata, torna verso le strisce davanti alla LUISS.»","“For the stop, head back toward the crossing by Luiss.”"),"point"],
    [local("Fai due chiacchiere","Make small talk"),nadia
      ?local("Nadia ride. «Al tabacchi ormai mi tengono da parte l’accendino.»","Nadia laughs. “The tobacconist keeps a lighter aside for me now.”")
      :local("Mila ride. «Il bello di stare qui? Sento tutte le scuse di chi ha perso il bus.»","Mila laughs. “Best thing about standing here? I get to hear every excuse for missing the bus.”"),"laugh"]
  ];
  const choices=topics.map(([prompt,reply,kind])=>[prompt,()=>{
    state.chatTopic={uid:npc.uid,prompt,reply};
    vialeGesture={uid:npc.uid,kind,start:performance.now()};
  }]);
  const balance=local("Saldo: ","Balance: ")+purse.coins;
  if(purse.coins<cost)return scene(npc.name,offer+" "+balance+" · "+
    local("Ti mancano ","You still need ")+(cost-purse.coins)+local(" monete."," coins."),...choices);
  const selected=vialeSelection?.npc===npc&&vialeSelection.profile===state?vialeSelection:null;
  const options=vialeOptions.map(([id,it,en])=>[local(it,en)+" · "+cost+local(" monete"," coins"),()=>{
    vialeSelection={npc,profile:state,id,label:local(it,en),start:performance.now()};
  }]);
  if(!selected)return scene(npc.name,offer+" "+balance,...options,...choices);
  return scene(npc.name,local("Hai scelto: ","You chose: ")+selected.label+" · "+
    local("Saldo dopo la conferma: ","Balance after confirming: ")+(purse.coins-cost),
    [local("Schizzo · 5 monete","Splash · 5 coins"),()=>{
      if(vialeSelection!==selected||currentObject()!==npc||wallet().coins<cost)return;
      vialeSelection=null;
      wallet().coins-=cost;
      vialeEncounterEffect={zone:state.zone,x:state.x,y:state.y,start:performance.now(),
        style:vialeOptions.findIndex(([id])=>id===selected.id)};
      sound("buy","map");
      activeScene=null;
    }],
    [local("Cambia scelta","Change choice"),()=>{vialeSelection=null;}]);
}

// The same cigarette cycle is drawn at map and portrait scale.
function drawVialeCigarette(c,npc,x,y,scale,now){
  const nadia=npc.uid==="viale-nadia";
  const phase=reducedMotion||!now?0:((now+(nadia?700:2400))%4200)/4200;
  const ease=t=>{const p=Math.max(0,Math.min(1,t));return p*p*(3-2*p);};
  const lift=ease((phase-.13)/.17)*(1-ease((phase-.43)/.20));
  const handX=x+(5-3*lift)*scale,handY=y+(4-4*lift)*scale;
  rect(c,"#f1e9dd",handX,handY,2*scale,scale);
  rect(c,"#f58c59",handX+2*scale,handY,scale,scale);
  c.save();
  for(let i=0;i<3;i++){
    const age=(phase-.43-i*.055)/.37;
    if(age<=0||age>=1)continue;
    c.globalAlpha=.58*Math.sin(Math.PI*age);
    rect(c,"#f2e9de",handX+(3+age*6)*scale,handY-age*9*scale,(1+age*2)*scale,scale);
  }
  c.restore();
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
    case "pola-festa":return polaParty();
    case "pola-foto":
      if(state.completedEvents.includes("pola-foto"))return scene("Foto di laurea","«È venuta bene. Sullo sfondo il buffet è ancora intero. Nessuno ci crederà.»");
      return scene("Foto di laurea","La fotografa ti fa cenno verso le luci del cortile. «Facciamola prima che arrivi qualcuno a chiederti la tesi.»",
        ["Scatta la foto",()=>{
          state.completedEvents.push("pola-foto");record("Pola · Foto di laurea sotto le luci del cortile.");sound("inspect","map");
        }]);
    case "navetta":
      if(!isFree()&&!romaniaComplete())return scene("Navetta Luiss · Parenzo",local("Prima di partire devi completare le tappe di Romania. Apri il diario dal menu per vedere quella che ti manca.","Finish the Romania objectives before boarding. Open the journal from the menu to see your next step."));
      return scene("Navetta Luiss · Parenzo",state.shuttleTicket?
        local("Il posto è prenotato. Mostra il codice QR all’autista per partire.","Your seat is booked. Show the driver your QR code to board."):local("La navetta va a Via Parenzo. Prenota qui la corsa, poi mostra il codice QR all’autista.","This shuttle goes to Via Parenzo. Book your seat here, then show the driver your QR code."),
        state.shuttleTicket?[local("Mostra il QR e sali","Show your QR code and board"),()=>{state.shuttleTicket=false;record("Navetta · Arrivo a Parenzo");travel("parenzo","shuttle");}]:
          [local("Prenota un posto per Parenzo","Book a seat to Parenzo"),()=>{state.shuttleTicket=true;record("Navetta · Prenotazione confermata, QR disponibile.");}]);
    case "sociologia":
      return scene("Arianna · Sociologia della comunicazione",
        has("Taccuino di Goffman")?"«Al prossimo seminario porto la tua nota. Anche la fila al bar ha un retroscena.»":
          "«Sto osservando come cambia il modo di parlare quando passa un professore. Tu dove cercheresti il retroscena?»",
        ["Vicino alla macchinetta del caffè",()=>{carry("Taccuino di Goffman");discover("goffman","Il retroscena della macchinetta");}],
        ["Perché lo stesso messaggio politico divide il pubblico?",()=>{state.chatTopic={uid:activeScene,prompt:"Perché lo stesso messaggio politico divide il pubblico?",reply:"«Chi ascolta seleziona indizi diversi. Un titolo mette in primo piano il costo, un altro chi ne beneficia. La scelta di quel primo piano orienta la discussione.»"};}],
        ["Davanti al microfono di Radio Luiss",()=>{state.chatTopic={uid:activeScene,prompt:"Davanti al microfono di Radio Luiss.",reply:"«Ottimo esempio di ribalta. Prova a riascoltare quello che dicono quando il microfono si spegne.»"};}]);
    case "radio":
      return scene("Tommaso · Radio Luiss","«Conduco una trasmissione della radio studentesca. Stamattina il tornello ha fatto una prova microfono senza avvisarci.»",
        ["Che cos’è Luiss Weekend?",()=>{state.chatTopic={uid:activeScene,prompt:"Che cos’è Luiss Weekend?",reply:"«Il podcast settimanale dell’Ufficio stampa, con commenti dei docenti. Su Radio Luiss va in onda il lunedì alle 13:00. La prova che il weekend, se lo monti bene, arriva fino a lunedì.»"};}],
        ["Da dove viene la sigla?",()=>{state.chatTopic={uid:activeScene,prompt:"Da dove viene la sigla?",reply:"«Tre note al sintetizzatore, una porta che sbatte e il barista che dice: chi è il prossimo?»"};}],
        ["Racconta un fatto dal campus",()=>{carry("Pass Radio Luiss");record("Radio Luiss · La leggenda della presa occupata.");state.chatTopic={uid:activeScene,prompt:"Ti racconto della presa occupata.",reply:"«Dai, siediti. Puntata speciale sulle risorse scarse: tre prese, ventidue fuorisede.»"};}]);
    case "carsharing":
      if(!isFree()&&!has("Seminario Parenzo"))return scene("Luiss Green Mobility","Partecipa al seminario di Parenzo prima di richiedere l’abilitazione.");
      if(!isFree()&&!has("Abilitazione Green Mobility"))return scene("Luiss Green Mobility","Il servizio è riservato alla comunità Luiss con patente valida. Nel gioco l’abilitazione simula il controllo della patente e la prenotazione dall’app Green Mobility.",
        ["Completa l’abilitazione",()=>checkpoint("Abilitazione Green Mobility")]);
      return scene("Luiss Green Mobility","Renault 5 elettrica disponibile. Arrivi all’area di sosta di Pola e mostri la tessera per la festa nel cortile.",
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
      if(activeScene==="panama-guardia")return scene("Guardia di Via Panama",
        has("Via libera")?"«Puoi passare. Il lettore del tornello è fra i due pilastri.»":"«Buongiorno. Mi mostra il badge?»",
        ...(has("Via libera")?[]:[["Mostra il badge",()=>badge("Via Panama · Badge verificato alla portineria.")]]));
      return scene("La guardia",has("Via libera")?"«Badge a posto. Il tornello è alla tua destra, accanto alla bacheca.»":"Ti scruta in silenzio. Poi scruta lo zaino. Lo zaino sembra più preparato di te.",
        ...(has("Via libera")?[]:[["Mostra il badge",()=>badge("La guardia approva il badge. Su di te si riserva. ")]]),
        ...(t.autocontrollo>=65||t.socialita>=65?[["Sostieni lo sguardo e saluta",()=>{badge("La guardia ricambia il saluto. Non succedeva dal 2018.");discover("sguardo","Vittoria ai punti");change("coraggio",4);}]]:[]));
    case "bacheca":return scene("Bacheca del campus","Tra un seminario sul futuro e un volantino per ripetizioni di micro c’è una nota sui posti al Dome.",
      ["Leggi il retro",()=>{carry("Nota del Dome");discover("bacheca","Il retro della locandina");}]);
    case "varco":
      if(activeScene==="panama-varco")return scene("Tornello di Via Panama","Per entrare, mostra il badge alla guardia accanto al varco.");
      if(activeScene==="viale-ingresso-varco"&&!has("Via libera")&&!isFree())return gateConfrontation();
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
    case "calcetto":return scene("Matteo · The Dome 2",local(
      "«Ti va un uno contro uno? Cinque gol e la partita è tua. Se preferisci, facciamo prima due tiri.»",
      "“Up for a one-on-one? First to five goals. We can warm up first if you like.”"),
      [local("Gioca a calcetto","Play football"),()=>openChallenge("calcetto")],
      [local("Allenati","Practice"),()=>openChallenge("calcetto",true)]);
    case "incontro-viale":return vialeEncounterScene(currentObject());
    case "tabaccheria":return tobaccoShopScene();
    case "rosticceria":return scene(local("Rosticceria · Viale Romania","Rotisserie · Viale Romania"),
      local("«Supplì appena fritti! Se esci dal campus tardi, ti tengo da parte l’ultimo.»",
        "“Fresh supplì! If you leave campus late, I’ll save you the last one.”"),
      ...(!has("Supplì")&&wallet().coins>0?[[local("Compra un supplì · 1 moneta","Buy a supplì · 1 coin"),()=>{
        wallet().coins--;carry("Supplì");refreshWallet();sound("buy","map");save();
      }]]:[]));
    case "cavalli":return scene(local("Sala scommesse · Viale Romania","Betting arcade · Viale Romania"),
      local("Sul monitor ci sono quattro cavalli virtuali. Scegline uno e guarda la corsa. Puoi usare le monete del campus oppure correre gratis.",
        "Four virtual horses are on the screen. Pick one and watch the race. Use campus coins or race for free."),
      [local("Vai alle corse","Go to the races"),()=>openChallenge("cavalli")],
      [local("Virtuali · Calcio","Virtual football"),()=>openChallenge("virtuali")]);
    case "poker":return scene(local("Tavolo da poker · Giardino","Garden poker table"),
      local("Nina e Benedetta ti fanno posto. Due carte a testa, cinque comuni e 100 fiches per sederti.",
        "Nina and Benedetta make room. Two cards each, five community cards and 100 chips to sit down."),
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
    default:return scene("Cerca un posto per studiare",local("Avvicinati a una persona, a una porta o a un oggetto. Premi E o tocca Interagisci. Per orientarti, apri il menu e scegli Mappa.","Walk up to a person, door or object. Press E or tap Interact. To find your way, open the menu and choose Map."));
  }
}
function finish(title,text){
  record(title);
  if(isFree())state.freeMoment={title,text};
  else state.ending={title,text};
}
let captionFrame=0, captionText="";
const captionSpeed=24;
// Il testo completo sta sempre in textContent: la rivelazione e solo visiva (due span, il secondo nascosto).
function captionPaint(count){
  const box=$("sceneText");
  let shown=box.firstElementChild, rest=box.lastElementChild;
  if(box.childElementCount!==2||!shown.classList.contains("tw-on")){
    box.textContent="";
    shown=document.createElement("span");shown.className="tw-on";
    rest=document.createElement("span");rest.className="tw-off";
    box.append(shown,rest);
  }
  shown.textContent=captionText.slice(0,count);
  rest.textContent=captionText.slice(count);
}
function finishCaption(){
  if($("skipCaption").hidden)return false;
  cancelAnimationFrame(captionFrame);
  $("sceneText").textContent=captionText;
  $("skipCaption").hidden=true;
  if(typeof schermoCaptionDone==="function")schermoCaptionDone();
  return true;
}
$("skipCaption").onclick=()=>{finishCaption();$("choices").querySelector("button")?.focus();};
function showCaption(text, animate){
  cancelAnimationFrame(captionFrame);
  $("sceneTranscript").textContent=text;
  captionText=text;
  const instant=!animate||!text||reducedMotion||navigator.webdriver;
  $("skipCaption").hidden=instant;
  if(instant){$("sceneText").textContent=text;return;}
  captionPaint(0);
  const start=performance.now();
  let painted=-1;
  function type(now){
    const count=Math.floor((now-start)/captionSpeed);
    if(count>=text.length){finishCaption();return;}
    if(count!==painted){painted=count;captionPaint(count);}
    captionFrame=requestAnimationFrame(type);
  }
  captionFrame=requestAnimationFrame(type);
}
const campusPortraits={
  "viale-nadia":{lingerie:"#843056",pelle:0,capelli:7,tinta:2,occhi:1,abito:0,taglio:1,zaino:0,baffi:0,accessorio:0},
  "viale-mila":{lingerie:"#32244a",pelle:0,capelli:4,tinta:1,occhi:2,abito:4,taglio:3,zaino:0,baffi:0,accessorio:5},
  "prof-storia":{capelli:4,tinta:2,pelle:0,occhi:1,volto:0,accessorio:3,taglio:2,abito:4},
  "tutor-viola":{capelli:7,tinta:1,pelle:2,occhi:0,volto:1,accessorio:5,taglio:1,abito:1},
  "giardiniera-nora":{capelli:5,tinta:0,pelle:1,occhi:2,volto:0,accessorio:1,taglio:1,abito:1},
  gymbro:{capelli:3,pelle:2,corpo:2,volto:2,occhi:0,accessorio:0,taglio:1,abito:0},
  "parenzo-interno-npc":{capelli:1,tinta:3,pelle:1,occhi:0,volto:2,accessorio:3,taglio:2,abito:4},
  "pola-cortile-npc":{capelli:6,tinta:0,pelle:3,occhi:3,volto:1,accessorio:0,taglio:2,abito:0},
  "radio-tommaso":{capelli:1,tinta:2,pelle:0,occhi:2,volto:2,accessorio:0,taglio:3,abito:3,zaino:2,dettaglio:2},
  "ca-greta":{capelli:4,tinta:4,pelle:1,occhi:3,volto:1,accessorio:3,taglio:1,abito:2,dettaglio:2},
  "ca-mameli":{capelli:6,tinta:3,pelle:2,occhi:0,volto:0,accessorio:5,taglio:0,abito:1,motivo:1},
  "giardino-lidia":{capelli:5,tinta:1,pelle:1,occhi:0,volto:2,accessorio:0,taglio:2,abito:0,dettaglio:1},
  "dome2-calcetto":{capelli:3,tinta:1,pelle:2,occhi:3,volto:2,corpo:2,accessorio:0,taglio:3,abito:4,scarpe:1},
  "giardini-vivi-marta":{capelli:7,tinta:3,pelle:1,occhi:1,volto:0,accessorio:1,taglio:0,abito:1,dettaglio:1},
  "pola-cortile-foto":{capelli:2,tinta:4,pelle:3,occhi:0,volto:1,accessorio:3,taglio:0,abito:4,zaino:2}
};
function characterSeed(uid){
  let hash=2166136261;
  for(const ch of uid)hash=Math.imul(hash^ch.codePointAt(0),16777619);
  return hash>>>0;
}
function characterAppearance(o){
  const seed=characterSeed(o.uid);
  const role=o.kind;
  if(role==="guard")return {...guard,uniforme:true,taglio:2,dettaglio:3,pantaloni:0,abito:4,
    pelle:(seed>>>8)%4,volto:(seed>>>20)%3,occhi:(seed>>>11)%4,tinta:(seed>>>18)%4,
    baffi:seed%3===0?2:0,espressione:1};
  const professor=role==="professor";
  return {...student,capelli:(seed>>>3)%8,pelle:(seed>>>8)%4,occhi:(seed>>>11)%4,
    tinta:professor&&seed%3===0?3:(seed>>>18)%5,volto:(seed>>>20)%3,
    corpo:role==="athlete"?2:(seed>>>24)%3,abito:seed%5,
    accessorio:role==="sportGlasses"?6:professor&&seed%2===0?3:(seed>>>16)%6,
    taglio:professor?2:(seed>>>23)%4,pantaloni:(seed>>>26)%4,
    scarpe:(seed>>>28)%3,zaino:professor?0:(seed>>>26)%4,lenti:o.variant,
    espressione:(seed>>>17)%3,baffi:seed%11===0?3:0,
    motivo:seed%7===0?2:seed%5===0?1:0,dettaglio:professor?0:seed%4,
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
  if(o.kind==="boar"){drawBoarPortrait(c,canvas.width,canvas.height,reducedMotion?0:Math.floor(now/170)%4);return;}
  const colors=["#6c5d87","#77614d","#476c73","#5e7255"];
  const seed=characterSeed(o.uid);
  const beat=reducedMotion?0:Math.floor(now/170)%4;
  const moving=o.native==="trend";
  const a=characterAppearance(o);
  const {width,height}=canvas;
  const middle=width/2;
  const backdrop=c.createLinearGradient(0,0,width,height);
  backdrop.addColorStop(0,"#172638");backdrop.addColorStop(1,colors[seed%4]);
  c.fillStyle=backdrop;c.fillRect(0,0,width,height);
  const panelWidth=width*.72;
  rect(c,"#e4c49736",middle-panelWidth/2,10,panelWidth,height-14);
  rect(c,"#192b3a85",middle-panelWidth/2+3,13,panelWidth-6,height-20);
  for(const offset of [-1,1]){
    rect(c,"#e7c69356",middle+offset*panelWidth/2-(offset===1?1:0),11,1,height-18);
    rect(c,"#efe1be30",middle+offset*(panelWidth/2-8),15,2,height-28);
  }
  const vialeNpc=o.native==="incontro-viale";
  const elapsed=vialeGesture?.uid===o.uid?now-vialeGesture.start:Infinity;
  const reacting=elapsed>=0&&elapsed<950;
  const reaction=reacting?vialeGesture.kind:null;
  const bounce=!reducedMotion&&reaction==="laugh"?Math.abs(Math.sin(elapsed/65))*3:0;
  const selection=vialeSelection?.npc===o&&vialeSelection.profile===state?vialeSelection:null;
  const motion=selection&&!reducedMotion?Math.min(1,Math.max(0,(now-selection.start)/750)):0;
  const arc=Math.sin(motion*Math.PI);
  const pose=selection?vialeOptions.findIndex(([id])=>id===selection.id):0;
  const lean=(pose===3?-8:pose===1?4:pose===2?-4:2)*arc;
  const breath=vialeNpc&&!reducedMotion?Math.sin(now/360+(o.uid==="viale-nadia"?0:2))*1.4:0;
  const gesture=moving?[0,-9,4,9][beat]:o.kind==="professor"&&beat===1?2:0;
  const scale=Math.min(width/28,height/22);
  const bustBaseline=height+scale*9.5;
  sprite(c,a,middle+gesture+lean,bustBaseline-(moving&&beat%2?5:0)-bounce-breath-arc*(pose===2?6:3),moving?beat%3:0,
    reaction==="point"?"left":"down",scale,characterCoat(o));
  if(vialeNpc){
    drawVialeCigarette(c,o,middle+lean,height*.50-bounce-breath-arc*(pose===2?6:3),scale*.72,now);
    if(reaction==="wave"||reaction==="point"){
      const point=reaction==="point";
      const handX=middle+(point?-9:7)*scale;
      const handY=height*.61-(point||reducedMotion?0:Math.sin(elapsed/85)*2);
      rect(c,"#edbc94",handX,handY,(point?5:2)*scale,2*scale);
    }
  }
  rect(c,"#d5b481",middle-panelWidth/2,height-9,panelWidth,1);
  rect(c,"#172331",0,height-8,width,8);
}
let polaThrowAt=null;
const impactLength=800;
let impactAnimation=null;
function startImpactAnimation(){
  impactAnimation={ending:state.ending,start:performance.now()};
}
function paintImpactOutcome(now){
  const canvas=$("impactOutcome"),ending=state.ending;
  canvas.hidden=!ending?.boar&&!ending?.traffic;
  if(canvas.hidden)return;
  const progress=reducedMotion||impactAnimation?.ending!==ending
    ?1:clamp((now-impactAnimation.start)/impactLength,0,1);
  const hit=clamp((progress-.29)/.71,0,1);
  if(progress===1&&impactAnimation?.ending===ending)impactAnimation.done=true;
  const c=canvas.getContext("2d"), forest=Boolean(ending.boar);
  const {width,height}=canvas;
  const sky=c.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,forest?"#20392e":"#1b2840");
  sky.addColorStop(1,forest?"#819d62":"#8f6472");
  c.fillStyle=sky;c.fillRect(0,0,width,height);
  for(let i=0;i<9;i++){
    const x=i*42-16,y=40+(i*13%19);
    if(forest){
      rect(c,"#233c30",x+12,y,5,56);
      c.fillStyle=i%2?"#345643":"#41644b";
      c.beginPath();c.ellipse(x+15,y,21,18,0,0,Math.PI*2);c.fill();
    }else{
      rect(c,i%2?"#45465c":"#565061",x,y,34,56);
      for(let col=0;col<3;col++)rect(c,"#d9b78365",x+5+col*9,y+10,4,11);
    }
  }
  rect(c,forest?"#53614a":"#435060",0,92,width,52);
  rect(c,forest?"#7b7853":"#b7aa94",0,91,width,3);
  for(let i=0;i<12;i++){
    const x=i*29,y=103+(i*7%32);
    rect(c,forest?"#b9a271":"#6d7981",x,y,forest?5:14,2);
  }
  const impactX=151,impactY=117;
  const source=ending.direction;
  const side=source==="left"?-1:1;
  const objectX=impactX+side*(-95+90*Math.min(1,progress/.29)+110*hit);
  if(forest){
    c.save();c.translate(objectX-24,78);c.scale(3.3,3.3);
    drawBoarShape(c,side<0?"left":"right","charge",progress*impactLength,0);
    c.restore();
  }else{
    const kind=["bus","car","scooter","shuttle"].includes(ending.vehicle)?ending.vehicle:"car";
    const large=kind==="bus"||kind==="shuttle";
    drawObject(c,{uid:"impact-vehicle",kind,x:(objectX-(large?48:25))/16,y:78/16,
      w:large?6:kind==="scooter"?2:3.2,h:2.6,rotation:0,variant:0,
      color:/^#[0-9a-f]{6}$/i.test(ending.color??"")?ending.color:assets[kind][3],look:side<0?"left":"right"});
  }
  c.save();
  c.translate(impactX+side*(8+hit*25),impactY);
  c.rotate(side*.12*hit);
  c.scale(1+hit*.52,1-hit*.72);
  sprite(c,state.avatar,0,0,0,"down",1.85);
  c.restore();
  if(progress<.29)return;
  for(let i=0;i<16;i++){
    const angle=i*Math.PI/8,radius=11+hit*(i%2?56:37);
    const x=impactX+Math.cos(angle)*radius;
    const y=impactY-22+Math.sin(angle)*radius*.62;
    rect(c,[forest?"#f0ca7b":"#7fdad8","#f7e1a8","#f6a061"][i%3],x,y,i%2?2:4,i%2?2:4);
  }
  c.save();c.translate(162,57);c.rotate(-.12);
  c.font="900 32px monospace";c.textAlign="center";c.textBaseline="middle";c.lineJoin="round";
  c.lineWidth=7;c.strokeStyle="#202434";c.strokeText("SPLAT!",0,4);
  c.fillStyle=forest?"#ffcc76":"#a9f2e7";c.fillText("SPLAT!",0,0);
  c.restore();
}

function paintPolaCeremony(now){
  const panel=$("polaCeremony");
  if(panel.hidden)return;
  const c=panel.getContext("2d");
  rect(c,"#243b46",0,0,480,224);
  rect(c,"#385849",0,52,480,172);
  c.fillStyle="#aa9d84";c.beginPath();c.ellipse(240,155,224,72,0,0,Math.PI*2);c.fill();
  c.fillStyle="#647f82";c.beginPath();c.ellipse(240,76,103,21,0,0,Math.PI*2);c.fill();
  c.fillStyle="#7ca8ac";c.beginPath();c.ellipse(240,72,94,14,0,0,Math.PI*2);c.fill();
  for(const [x,y,w,h] of [[214,51,48,13],[233,35,16,20],[169,49,17,17],[294,49,17,17]])rect(c,"#d8ccb2",x,y,w,h);
  for(const x of [22,56,424,458]){
    c.fillStyle="#203b39";c.beginPath();c.ellipse(x,59,24,40,0,0,Math.PI*2);c.fill();
  }
  rect(c,"#64404b",159,100,162,34);
  rect(c,"#a76a6b",159,100,162,4);
  const launched=polaThrowAt!==null;
  const t=launched?(reducedMotion?1:clamp((now-polaThrowAt)/1350,0,1)):0;
  for(let row=0;row<2;row++)for(let i=0;i<8;i++){
    const x=53+i*52+(row?10:0),y=168+row*30;
    rect(c,"#655047",x-10,y-5,20,9);
    const guest=characterAppearance({uid:"pola-invitato-"+row+"-"+i,kind:"student",variant:0});
    sprite(c,guest,x,y,launched&&!reducedMotion&&t<1?Math.floor(now/110)%3:0,"up",1.5);
  }
  sprite(c,state.avatar,240,127,0,"down",2.1);
  const capX=240+86*t,capY=91-190*t*(1-t)+31*t;
  c.save();c.translate(capX,capY);c.rotate(t*Math.PI*2);
  c.fillStyle="#172334";c.beginPath();c.moveTo(0,-6);c.lineTo(12,0);c.lineTo(0,6);c.lineTo(-12,0);c.closePath();c.fill();
  rect(c,"#efc876",9,0,2,8);c.restore();
  if(launched)for(let i=0;i<17;i++){
    const age=reducedMotion?1:t;
    rect(c,["#f4bd66","#e0838b","#b9dfbb"][i%3],205+(i*23%125)*age,110+(i*17%66)*age-40*age*(1-age),3,3);
  }
}
function renderScene(){
  updateSmokingUI();
  const scene=getScene();
  $("objective").textContent=(testMode?"Prova · ":"")+((state.ending?.traffic||state.ending?.guard||state.ending?.boar)?"Game Over":state.ending?tr("Missione compiuta"):state.mission||(isFree()?tr("Esplora il campus"):storyObjective()));
  const nextStep=isFree()?-1:storySteps.findIndex(([item])=>!has(item));
  const chapter=nextStep<0?"":nextStep<4?"Romania":nextStep===4?"Parenzo":"Pola";
  $("taskChapter").hidden=!chapter||Boolean(state.ending);
  $("taskChapter").textContent=chapter?chapter+" · "+(nextStep+1)+"/"+storySteps.length:"";
  const radioHint=state.ending?"":radioTapeHint();
  $("radioTapeHint").hidden=!radioHint;
  $("radioTapeHint").textContent=radioHint;
  updateStoryWaypointHint();
  $("zone").textContent=tr((typeof stradeViveLuogo==="function"&&stradeViveLuogo())||room(state.zone).name);
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
  $("journalTitle").textContent=local("Diario · ","Journal · ")+state.secrets.length+"/"+totalSecrets+local(" scoperte"," discoveries");
  $("sceneTitle").textContent=tr(scene.title);
  const speaker=currentObject();
  $("polaCeremony").hidden=speaker?.native!=="pola-festa"||(!state.graduationSpeech&&!has("Festa a Pola"))||Boolean(state.ending);
  if($("polaCeremony").hidden)polaThrowAt=null;
  paintPolaCeremony(performance.now());
  const conversation=Boolean($("polaCeremony").hidden&&speaker&&kindLayer(speaker)==="persone"&&!isVehicle(speaker));
  $("speakerPortrait").hidden=!conversation;
  $("tobaccoCounter").hidden=speaker?.native!=="tabaccheria"||Boolean(state.ending);
  $("game").classList.toggle("game-conversation",conversation||!$("polaCeremony").hidden||Boolean(state.ending?.guard||state.ending?.traffic||state.ending?.boar));
  $("game").classList.toggle("game-reading",Boolean(activeScene||state.prologue||state.ending));
  $("guardOutcome").hidden=!state.ending?.guard;
  refreshGateWarning();paintGuardOutcome(performance.now());paintImpactOutcome(performance.now());
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
    button.onclick=()=>{
      state.chatTopic=null;
      action();
      if(screen!=="game")return;
      save();renderScene();
      if(!minigame)focusScene();
    };
    $("choices").append(button);
  }
  $("closeConversation").hidden=!activeScene||Boolean(state.ending);
  $("closeConversationLabel").textContent=local("Torna al campus","Back to campus");
  $("log").replaceChildren();
  for(const entry of state.log){const li=document.createElement("li");li.textContent=tr(entry);$("log").append(li);}
  const pocketItems=state.pockets.map(item=>item==="Sigarette"
    ?local("Sigarette","Cigarettes")+" ("+cigarettesLeft()+"/10)":tr(item));
  const items=$("inventoryItems");
  items.replaceChildren();
  for(const label of [local("Badge LUISS","LUISS badge"),...pocketItems]){
    const item=document.createElement("li");
    item.textContent=label;
    items.append(item);
  }
  $("inventoryTitle").textContent=local("Tasche","Pockets")+" · "+(pocketItems.length+1);
  const profile=document.createElement("li");profile.textContent=Object.entries(traits).map(([id,label])=>tr(label)+" "+state.traits[id]).join(" · ");$("log").append(profile);
  ambienteScena();
  ideeRender();
  if(typeof transizioniScena==="function")transizioniScena();
  if(typeof schermoRender==="function")schermoRender();
}
const stage=$("stage").getContext("2d");
const cover=$("cover").getContext("2d");
const guard={corpo:2,volto:2,capelli:1,occhi:1,pelle:2,abito:2,accessorio:1};
const student={corpo:0,volto:1,capelli:2,occhi:0,pelle:1,abito:0,accessorio:5,tinta:2};
