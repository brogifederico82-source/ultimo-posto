// Lore di «Ultimo Posto»: il libro del mondo (docs/lore.md) dentro il gioco.
// Contiene: le voci dell'Archivio (luoghi, persone, leggende, cronologia), gli oggetti da trovare
// (pagine del Registro dei Posti, targhe, volantini, appunti), tre personaggi e alcuni oggetti nuovi,
// le battute extra di chi c'era già, il pannello a schermo intero archivioApri() e il finale.
// Ganci nel resto del gioco: installLore (world.js, due righe accanto a installIdee) e paintLore
// (dialogue.js, accanto a paintVillaBoars). Tutto il resto si aggancia da qui, avvolgendo funzioni
// esistenti senza riscriverle (getScene, conversationFor, campusOptionalScene, renderScene,
// exploringCampus). Stato: state.lore, creato al primo uso (i salvataggi vecchi non cambiano).
// Nota sull'ordine di caricamento: installLore gira dentro world.js, prima di questo file, quindi
// non usa const/let di livello file: i dati stanno in funzioni (hoisting).

// ---------------------------------------------------------------------------
// Dati: voci dell'Archivio
// ---------------------------------------------------------------------------
const loreSezioni=[["luoghi","Luoghi"],["persone","Persone"],["leggende","Leggende"],["cronologia","Cronologia"]];

function loreVoci(){
  if(loreVoci.cache)return loreVoci.cache;
  const E=(id,sec,t,x,h)=>({id,sec,t,x,h});
  return loreVoci.cache=[
    // ---- Luoghi ----
    E("viale","luoghi","Viale Romania 32","Il campus comincia da un marciapiede e da una frase del gruppo del corso: «Domani alle 9, portate il documento». Da qui passano il 360, le biciclette di chi è in ritardo e un numero imprecisato di persone che dicono «ci sentiamo». Secondo la tradizione, chi attraversa con calma ha già superato metà dell’orientamento.","Il primo posto in cui ti sei trovato."),
    E("tornello","luoghi","Il tornello e la guardia","Il tornello è in servizio dal 1984 e non ha mai sbagliato un giudizio, solo i tempi. La guardia lo chiama «il collega»: riflessi lenti, onestà di ferro, nessuna eccezione per simpatia. Sul quaderno dei Vigilanti c’è una regola sola: «Il badge è un invito a presentarsi».","Chiedi alla guardia, o leggi il suo quaderno."),
    E("atrio","luoghi","L’atrio","È il cuore del campus: tutti ci passano, nessuno ci resta. Pavimento lucido, un busto in fondo e un’acustica che porta le conversazioni private a quindici metri di distanza. Le scale salgono ai piani. L’ascensore, più prudente, rimanda a data da destinarsi.","Varca la soglia dell’edificio centrale."),
    E("aula-chiesa","luoghi","Aula Chiesa · A200","Fu la cappella del Pio Seminario di San Sillabo e oggi ospita lezioni, convegni e ospiti che cercano la loro sezione sulla lista. I banchi in fondo sono i più contesi e i meno occupati: in fondo c’è un posto che resta libero da sempre, e nessuno ricorda di averlo deciso.","Entra nell’aula che era una chiesa."),
    E("matroneo","luoghi","Il Matroneo","Un tempo la galleria delle Madrine dell’Orario, che ascoltavano le lezioni dall’alto senza intervenire mai. Da allora al terzo piano vige il silenzio, rispettato per tradizione e per non fare la figura di chi squilla. Dal davanzale si vede mezzo campus e tutti i buoni propositi.","Sali fino al piano del silenzio."),
    E("dome","luoghi","The Dome 2","Era una palestra: il posto dove la gente sudava a comando. Oggi si suda in silenzio sul quarto capitolo. Le pareti metalliche amplificano ogni sospiro, quindi gli studenti hanno imparato a sospirare piano. In un angolo cresce un ficus più anziano di tutti i corsi di laurea.","Entra nella sala studio sotto il padiglione."),
    E("serra","luoghi","La Serra","La chiamano «spazio polifunzionale», ma ai tempi del Seminario era davvero una serra di limoni per le tisane del rettore. Ospita eventi, workshop e almeno una sedia pieghevole di troppo. D’inverno qualcuno giura di sentire odore di limone: i botanici dicono suggestione, i vecchi bidelli dicono memoria.","Entra nello spazio per gli eventi."),
    E("loft","luoghi","Il LOFT","L’ultimo piano è il più alto e il più connesso: si registrano podcast, si gioca all’arcade e si consegnano progetti un attimo prima che la finestra di consegna si chiuda con un gesto teatrale. Si dice che dalle vetrate, nelle giornate limpide, si veda l’inizio di ogni tesi.","Arriva in cima, dove finiscono le scale."),
    E("villa-ada","luoghi","Villa Ada","Il parco a ovest, dove i professori vanno a pensare e i cinghiali a fare gli ispettori. Ha un guardaparco, un laghetto che inghiotte i badge e una panchina con una targa di cui nessuno spiega la settimana. Il branco ha le sue strade: chi le rispetta di solito rientra in tempo per il caffè.","Attraversa il cancello a ovest, con cautela."),
    E("parenzo","luoghi","Via Parenzo","La sede dei giuristi: corridoi lunghi, porte numerate e un’aria da «lo dica con precisione». Al primo piano si tengono i seminari: si entra con un caso, si esce con due opinioni e un appunto sul «ragionevolmente». La navetta parte da Romania, quasi sempre quando dovrebbe.","Prendi la navetta."),
    E("pola","luoghi","Villa Alberoni · Pola","A Pola la salita è lunga e le scale rimbombano. In cima c’è il villino; a sinistra, il Tinello con il Nilo che riposa fra i Tritoni. È il posto dei brindisi: chi ci arriva, per la tradizione del campus, ha già lasciato qualche sedia libera dietro di sé.","Raggiungi Pola."),
    E("bar","luoghi","Il bar e la terrazza","Un tavolo di briscola, un biliardino conteso e un caffè che definisce l’umore del giorno. I baristi conoscono due tipi di cliente: chi ha fretta e chi dice di averne. La terrazza è l’unico posto del campus dove «solo un caffè» si trasforma in una discussione di politica monetaria.","Entra al bar."),
    E("radio","luoghi","Il furgone di Radio Luiss","Rosso, rumoroso e munito di una presa sempre contesa. Da qui Radio Luiss trasmette storie piccole: dieci secondi di una porta, un applauso lontano, un silenzio che dice tutto. La regia sta nel furgone; la direzione, secondo Greta, nel buonsenso.","Avvicinati al furgone rosso."),
    E("piani-alti","luoghi","I piani 4 e 5","Corridoi lunghi, porte che ti fanno sentire in ritardo anche se sei in anticipo. Al quarto piano gli studi dei docenti; al quinto, una porta d’ascensore con un cartello che promette il servizio «a breve». Nessuno ha mai chiesto quanto sia breve.","Sali oltre il Matroneo."),
    E("tutorato","luoghi","Il tutorato","La stanza dove si impara che chiedere aiuto fa parte del piano di studi. Una scrivania, un’agenda sempre aperta e una persona capace di trasformare «non so da dove cominciare» in «ho capito dove ero». Alle pareti, percorsi disegnati in fretta da chi è passato prima.","Cerca la stanza del tutorato, vicino al Dome."),
    E("studio","luoghi","Aula 107 e dintorni","Nessuno sa in quale edificio sia, ma tutti sanno quanto sia difficile da trovare. L’aula 107 compare negli orari, nelle mail e nelle lamentele. Gli studenti più esperti dicono che esiste solo per chi non la cerca.","Leggi gli annunci del campus."),
    // ---- Persone ----
    E("ottavia","persone","Ottavia Serpieri","Uditrice, ritardataria, fondatrice senza saperlo. Nell’autunno del 1958 arrivò all’ultima lezione di Elementi di Pazienza civile quando i banchi erano pieni e, invece di sedersi sull’unico posto libero, lo offrì a chi sarebbe arrivato dopo di lei. Rimase in piedi per tutta l’ora. Il professore le dedicò un cartellino.","Guarda il busto nell’atrio."),
    E("fausto","persone","Fausto Lanza","Bidello e poeta, in servizio dal 1963 e in pensione solo sulla carta: passa ancora ad annaffiare una violetta al Matroneo. Scriveva versi sul retro dei fogli presenza, e qualcuno li conserva. Sa dove sono le chiavi, i vuoti d’aria e le persone che non osano chiedere.","Parla con chi cura il silenzio del terzo piano."),
    E("rino","persone","Rino Calabrò","Studente di Giurisprudenza, fuoricorso per generosità. Il 14 giugno 1999 cedette il proprio posto a una matricola in ritardo e perse l’appello. Poi la sessione dopo, e quella dopo ancora. Da vent’anni non aspetta un voto: aspetta che qualcuno si sieda al posto che ha lasciato.","Parla con lo studente dell’ultimo banco."),
    E("serra","persone","Prof.ssa Livia Serra","Docente di Storia contemporanea. Nel 1999, matricola e in ritardo, fu la persona a cui Rino cedette il posto. Ogni settembre ricopia a mano il cartello «RISERVATO» sull’ultimo banco, da venticinque anni, senza dirlo a nessuno: tranne agli studenti più attenti, che hanno capito.","Chiedi a Serra del cartello in fondo all’aula."),
    E("teresa","persone","Teresa Bellandi","Tutor nel 2004. Aiutava le matricole a trovare la strada fino all’aula: la disegnava a penna su un foglio, sempre con una linea storta in mezzo, «perché i percorsi veri non sono dritti». Ora insegna lontano, ma le sue mappe girano ancora nelle tasche del campus.","Cerca una mappa disegnata a mano, dove si chiede aiuto."),
    E("viola","persone","Viola · Tutor","Allieva di Teresa, erede della linea storta, custode dell’agenda dove tutto è scritto tre volte. Dice che il suo mestiere consiste nel far sembrare facile ciò che non lo è. In realtà consiste nel restare seduta finché l’altro ha finito di spiegare.","Chiedi a Viola di chi ha imparato."),
    E("dario","persone","Dario · Compagno di seminario","Quello che a Parenzo ti ha fatto cambiare idea e poi ti ha lasciato finire. Figlio di un mercatino di biciclette, si riconosce dalla pazienza con cui chiede «ma intendevano vendere?». Nel Registro è l’unico che ha ceduto un posto solo ascoltando.","Cerca un’obiezione dimenticata nell’aula del seminario."),
    E("greta","persone","Greta e Tommaso · Radio Luiss","Lei cuce i suoni, lui li raccoglie. Hanno deciso che la sigla sarebbe stata il rumore di una porta d’autobus e che i silenzi non si tagliano. In archivio tengono una Cassetta Zero, la prima registrazione del furgone, mai trasmessa.","Parla con la regia della radio."),
    E("ettore","persone","Ettore · Guardaparco","Trent’anni alle officine dei tram, poi il parco. Annota dove passano i cinghiali e quando passano i ricordi. Una volta all’anno ripara la panchina con la targa, anche se nessuno gliel’ha chiesto, e ogni lunedì lascia mezzo panino sul bracciolo.","Parla con il guardaparco di Villa Ada."),
    E("capobranco","persone","Don Baldo, il capobranco","Grosso, paziente, con un orecchio diviso a metà. Ettore lo chiama Don Baldo. Non è un nemico: è un ispettore che controlla chi passa troppo in fretta. Da generazioni il suo branco dorme ogni lunedì sotto la panchina della targa, come per far compagnia a qualcuno che non c’è.","Chiedi a Ettore del branco."),
    E("ferretti","persone","Prof. Ferretti","Sociologo, osservatore del branco ed ex dottorando di Corradi. Ogni tanto cancella una conclusione dal taccuino e la sostituisce con un «forse». Ha una teoria sul ritardo accademico che comincia con «dipende» e finisce con una lunga pausa.","Chiedi a Ferretti chi fu il suo relatore."),
    E("corradi","persone","Prof. Alvise Corradi","Relatore di Rino, esperto di tempi tecnici. Lunedì 11 giugno 2001 disse «ci vediamo la settimana prossima» e da allora non ha più cambiato agenda. Non è cattivo: è un uomo che ha smesso di sapere che giorno sia. Compare alla fine delle sessioni, con due domande.","Cerca la porta del suo studio, o lui alla fine di un appello."),
    E("marisa","persone","Marisa · Portineria di Pola","Custode delle chiavi di Villa Alberoni. Ne riconosce alcune dal peso e una dal rumore. La più piccola apre una nicchia dietro il Nilo, dove i laureati lasciano bigliettini. Lei non li legge mai, ma li riordina per data.","Parla con la portinaia di Villa Alberoni."),
    E("lucia","persone","Lucia · Bibliotecaria itinerante","Spinge un carrello dove i libri hanno tutti la costa dalla stessa parte e qualche pagina sciolta fa da segnalibro. Dice di non sapere da chi vengano. In realtà le restituisce sempre alle persone giuste, con un po’ di ritardo.","Chiedi a Lucia cosa c’è fra i libri."),
    E("rocco","persone","Rocco · Collezionista di sedie","Raccoglie sedie destinate alla discarica e le ripara con la brugola. Una, nella collezione, è diversa: più vecchia, legno scuro, con un cartellino sotto il sedile. Non sa da dove venga. Sa che non la venderebbe.","Chiedi a Rocco se ha una sedia speciale."),
    E("nina","persone","Nina · Rappresentante","Gilet pieno di spille e cartellina «URGENTE (da tre anni)». Raccoglie firme, lamentele e, ogni tanto, sedie. È l’unica rappresentante che ottiene sempre una risposta dal Rettorato: una cortese richiesta di pazienza.","Chiedi a Nina chi tiene il conto delle prese."),
    E("marcella","persone","Marcella · Archivista dei seminari","Conserva i verbali di ogni seminario tenuto alla T02, anche quelli in cui non si è deciso nulla: «sono i più istruttivi». Non fa fotocopie. Dice che ciò che vale la pena sapere si legge sul posto, in piedi, con rispetto.","Cerca chi custodisce i verbali di Parenzo."),
    E("f-presa","persone","Gruppo · Confraternita della Presa","Fondata nel 1992 attorno a una ciabatta. Regole: una presa, due caricatori, tre bugie. Il grado più alto è Custode della Ciabatta; il più basso, «chi ha detto che gli bastava il 12%». Nina è la loro avvocata più diplomatica.","Informati sulle prese."),
    E("f-presenti","persone","Gruppo · Aspiranti Presenti","Si trovano alle sette del mattino davanti all’aula per prendere la fila giusta. Distribuiscono cornetti e si definiscono «il gruppo che c’era». Pasquale, il cerimoniere, giura di non aver mai chiesto a nessuno di arrivare prima: solo di non arrivare per ultimo.","Chiedi a Pasquale del suo gruppo."),
    E("f-dispensisti","persone","Gruppo · I Dispensisti","Chi vende, scambia e vorrebbe bruciare gli appunti. Regola: mai il proprio nome sulla prima pagina, ma le ultime righe devono essere sempre leggibili. Camilla è la loro contabile, per sua sfortuna.","Chiedi a Camilla degli appunti."),
    E("f-fuorisede","persone","Gruppo · Fuorisede dell’Ultimo Treno","Non è un’associazione: è un orario. Si riconoscono dal 360, dalle valigie piccole e dalla frase «io, comunque, torno giovedì». Hanno un codice: mai far restare in piedi chi ha un borsone.","Chiedi ai pendolari della fermata."),
    E("f-guardiani","persone","Gruppo · I Guardiani dell’Ultimo Banco","Società segreta così riservata che molti iscritti non sanno di farne parte. Regola unica: se vedi un posto libero in fondo, lascialo a chi arriva dopo. Ne fanno parte, senza tessera, Serra, Lucia, Rocco, Fausto e, ormai, probabilmente tu.","Raccogli almeno quattro pagine del Registro."),
    // ---- Leggende ----
    E("ultimo-posto","leggende","L’Ultimo Posto (versione da corridoio)","La versione che si racconta in fila al bar: esiste un posto, in Aula Chiesa, che nessuno occupa. Secondo alcuni porta fortuna agli esami, secondo altri sfortuna, secondo i più pratici «dipende da chi c’è davanti». Nessuno l’ha mai visto occupato. Nessuno ha mai chiesto perché.","Leggi la bacheca all’ingresso."),
    E("regola-ottavia","leggende","La Regola di Ottavia","«Non occupare l’ultimo posto libero: lascialo a chi arriva dopo.» Formulata in piedi, in un’aula piena, da chi aveva tutte le ragioni per sedersi. Con gli anni è diventata cortesia, poi consuetudine, poi reato morale: chi la viola si sente guardato dal busto.","Cerca la prima pagina, sotto un banco."),
    E("targa","leggende","Il cartello RISERVATO","In fondo all’Aula Chiesa c’è un cartellino scritto a mano, ricopiato di continuo: «RISERVATO». Sotto, nell’ottone, un’incisione quasi cancellata: «dal 1958». Nessuno ricorda di averlo scritto, perciò nessuno lo cambia.","Cerca la targa d’ottone nell’aula."),
    E("riservato-mistero","leggende","Mistero risolto: chi scrive «RISERVATO»","Per anni si è pensato a un bidello, a un fantasma o al fondo cassa. È Serra: ogni settembre ripassa le lettere con un pennarello nero, in piedi, prima che entri l’aula. Aggiunge il giorno e non firma. Il mistero più piccolo del campus aveva una risposta anche più piccola, e gentile.","Hai la targa? Chiedi a chi tiene la lezione."),
    E("fantasma","leggende","Il Fantasma del Fuoricorso","Lo vedono di rado, di solito sotto esame. Un ragazzo in cappotto fuori stagione che chiede se qualcuno abbia gli appunti. Per le matricole è un monito, per i veterani un conoscente. Chi gli risponde con gentilezza passa l’appello, dicono; chi gli risponde bene, il corso.","Incontra qualcuno che chiede gli appunti, di notte, in giardino."),
    E("presa","leggende","La Leggenda della Presa Occupata","Tre prese, ventidue fuorisede. Nel campus la presa libera è una specie protetta: avvistarla è raro, occuparla è una responsabilità. La tradizione vuole che chi cede la presa per primo non resti mai senza batteria nei momenti importanti, a differenza di chi la cede per ultimo.","Chiedi a chi raccoglie firme."),
    E("paradosso","leggende","Il paradosso del «prego, prima lei»","Secondo la prof.ssa Mameli, un posto che tutti cedono resta libero per sempre. È il fatto sociale perfetto: nessuno lo decide, tutti lo rispettano, a un certo punto nessuno ricorda a cosa serva. La buona educazione, a lungo andare, produce un’aula vuota con tutti in piedi.","Chiedi alla sociologa dell’aiuola."),
    E("360bis","leggende","Il 360 bis, capolinea Ultimo Posto","Una corsa che non compare sul tabellone ma di cui tutti conoscono l’orario: sempre dopo l’ultima. Il capolinea, Ultimo Posto, è il punto dove ogni fermata diventa raggiungibile con un po’ di ritardo. Il conducente, dicono, è già a lezione.","Guarda sotto la panchina della fermata, o leggi un vecchio orario."),
    E("quarta-stazione","leggende","La quarta stazione","Dopo la terza stazione la radiolina ne trova un’altra. Una voce calma, che somiglia alla tua, dice che l’ultimo posto libero è accanto a chi sta già studiando. È l’unica radio che non fa pubblicità e non fa pause.","Gira la manopola della radiolina fino in fondo."),
    E("branco","leggende","Il branco e le sue strade","A Villa Ada i cinghiali seguono percorsi antichi: non vagano, controllano. Conoscono il sentiero più breve per ogni cosa, comprese le mele. Non si lasciano distrarre dalle chiacchiere, ma da una buona mela sì. Gli studenti li chiamano «la commissione».","Chiedi al guardaparco, oppure semina un cinghiale."),
    E("tesi","leggende","La tesi masticata","Un cinghiale porge una tesi dal titolo «Mobilità sociale nei sottoboschi». È la prima stesura di Rino, ritrovata dal branco e mai smaltita: la conservano come si fa con un reperto. Nessuno ha il coraggio di dirgli che la bibliografia è la parte più masticata.","Incontra il cinghiale con la tesi a Villa Ada."),
    E("settimana","leggende","«Ci vediamo la settimana prossima»","La frase più pronunciata nei corridoi e meno rispettata dai calendari. Una panchina di Villa Ada la ricorda con una targa. Effetto collaterale: chi la ascolta comincia a contare le settimane e, dopo la quinta, le chiama «tempi tecnici».","Leggi la targa della panchina nel parco."),
    E("ficus","leggende","Il Ficus Benedetto","Più vecchio dei corsi, più paziente dei tutor. Nessuno l’ha piantato: ha semplicemente deciso di restare. Lo chiamano Benedetto perché non ha mai fatto una domanda scomoda. Dietro di lui, da vent’anni, gli studenti nascondono le cose da non dimenticare.","Guarda bene nell’angolo del Dome."),
    E("ascensore","leggende","L’ascensore del piano cinque e mezzo","Al quinto piano c’è un ascensore con il tasto «5½». Chi lo preme resta fermo e sente, oltre la porta, il rumore di una lezione. L’ascensore è fuori servizio dal 2011. L’aula, forse, no.","Prova l’ascensore del quinto piano."),
    E("ti-tengo","leggende","Il caso «Ti tengo il posto»","Il primo caso discusso alla T02: due studenti, un messaggio, una promessa dubbia. «Ti tengo il posto»: contratto o cortesia? La sentenza del seminario fu un lungo silenzio, che i verbali riportano come «pausa di riflessione». Il professore concluse: «La cortesia si perfeziona quando qualcuno si siede».","Chiedi del primo caso della T02."),
    E("registro","leggende","Il Registro dei Posti","Un quaderno a pagine sciolte: ogni pagina racconta chi ha ceduto qualcosa a chi arrivava dopo, un posto, un’ora, un turno, un’obiezione. Le pagine sono otto e l’ultima è bianca. Non è un archivio: è un passaggio di consegne.","Trova almeno due pagine."),
    E("nicchia","leggende","La nicchia del Nilo","Dietro il Nilo, nel Tinello, i laureati lasciano biglietti per chi arriva dopo: «grazie», «scusa», «ho copiato un po’» (parte cancellata). Marisa li riordina senza leggerli. L’ultima pagina del Registro è lì, bianca, in attesa.","Cerca dietro il Nilo."),
    E("brindisi","leggende","Il brindisi e la sedia libera","A Pola, prima di alzare il bicchiere, si lascia sempre una sedia libera: è la regola non scritta di ogni laurea. Il laureando brinda in piedi; chi arriva dopo trova un posto e una fetta di torta.","Festeggia la laurea a Pola."),
    E("verita","leggende","L’Ultimo Posto, davvero","L’Ultimo Posto non è il posto che nessuno occupa: è quello che ognuno cede. Metà della regola è cedere. L’altra metà, rimasta nascosta per sessant’anni, è accettare: quando qualcuno ti cede un posto e ne hai bisogno, siediti. Rino non aspettava un voto. Aspettava qualcuno capace di dire grazie e sedersi.","Completa il Registro dei Posti."),
    E("appello","leggende","L’appello di Rino","Alla fine, davanti al professor Corradi, Rino ha avuto il suo appello: due domande, «come stai?» e «hai letto il programma?». Alla prima ha risposto bene. Alla seconda ha detto «ci sto lavorando», e Corradi ha scritto accanto al nome: trenta e lode alla pazienza.","Porta a termine il Registro."),
    // ---- Cronologia ----
    E("a1958","cronologia","1958 · Il Pio Seminario di San Sillabo","Il complesso nasce come seminario dedicato a «studio e silenzio». Gli orari sono severi, i corridoi di più, e il refettorio ha un’acustica che premia chi mastica piano. L’aula di preghiera diventerà l’Aula Chiesa; il balcone delle benefattrici, il Matroneo.","Leggi la targa dei fondatori, nell’atrio."),
    E("a1958b","cronologia","Autunno 1958 · La lezione in piedi","Ottavia Serpieri arriva in ritardo a Elementi di Pazienza civile e non occupa l’ultimo posto. Il professor Vallauri scrive «RISERVATO» su un cartellino. Quel cartellino è la prima riga di tutto.","Cerca la prima pagina del Registro."),
    E("a1963","cronologia","1963 · Arriva Fausto","Fausto Lanza viene assunto come bidello. Nella domanda scrive «ho bella calligrafia». È la qualifica che, anni dopo, lo salverà dal licenziamento per eccesso di poesia.","Cerca la seconda pagina, dove si ascolta il silenzio."),
    E("a1977","cronologia","1977 · La prima corsa del 360 bis","Il Comune annuncia una corsa «supplementare». Nessuno ricorda di averla chiesta, ma da allora i ritardatari hanno una speranza ufficiale e un orario per giustificarla.","Trova un vecchio orario alla fermata."),
    E("a1984","cronologia","1984 · Il tornello","Viene installato il tornello e assunta la prima guardia. Alla cerimonia inaugurale il tornello non si apre al nastro tagliato dal rettore: «Mancava il badge». Da allora è un esempio di coerenza.","Leggi il quaderno della guardia."),
    E("a1992","cronologia","1992 · La prima ciabatta","Un gruppo di studenti porta in aula una ciabatta con sette prese. Il giorno dopo ne servono tre. Nasce la Confraternita della Presa, e con essa la prima petizione per «più prese, meno ansia».","Chiedi a Nina delle prese."),
    E("a1999","cronologia","14 giugno 1999 · L’appello mancato","Aula Chiesa, ore 9. Rino Calabrò cede il suo posto a una matricola trafelata, Livia Serra, e resta in piedi. L’appello comincia, finisce e lo lascia fuori dall’elenco. Un volantino della Segreteria annuncia una sessione straordinaria: nessuno sa se sia mai stata tenuta.","Cerca un volantino ingiallito, fuori dall’ingresso."),
    E("a2001","cronologia","11 giugno 2001 · La settimana prossima","Il professor Corradi, relatore di Rino, chiude il ricevimento con «ci vediamo la settimana prossima». Rino aspetta il lunedì dopo, e quello dopo ancora, su una panchina di Villa Ada. La targa verrà molto più tardi.","Cerca la pagina del parco, sotto la targa."),
    E("a2004","cronologia","2004 · La linea storta","Teresa Bellandi, tutor, disegna il primo percorso con la linea storta per una matricola smarrita. Quella matricola è Viola. Il foglio non è mai stato restituito, perché non è mai stato chiesto indietro.","Cerca una mappa di carta nel tutorato."),
    E("a2009","cronologia","2009 · Nasce il furgone rosso","Radio Luiss ottiene un furgone usato e una presa condivisa. La prima registrazione, la Cassetta Zero, dura quattro minuti: tre sono di prove microfono, uno di porta d’autobus. È ancora il pezzo più ascoltato.","Cerca una cassetta vicino al furgone."),
    E("a2015","cronologia","2015 · Arriva il branco","I primi cinghiali compaiono a Villa Ada con aria da sopralluogo. Il Comune pubblica un avviso, gli studenti una mappa, il guardaparco un diario. Il diario è l’unico dei tre che si è rivelato utile.","Chiedi a Ettore da quanto c’è il branco."),
    E("a-oggi","cronologia","Oggi · Un nome nuovo sul Registro","Il Registro ha otto pagine e, finalmente, otto firme. L’ultima è la tua: accanto, la data e una riga a matita: «Ricevuto. Grazie.» Il campus continua, i posti si liberano, e a qualcuno, domattina, ne toccherà uno.","Completa il Registro dei Posti.")
  ];
}
function loreVoce(id){return loreVoci().find(e=>e.id===id);}

// ---------------------------------------------------------------------------
// Dati: oggetti da trovare (pagine, targhe, volantini) e luoghi osservabili
// ---------------------------------------------------------------------------
// item: oggetto che finisce nelle tasche; ids: voci sbloccate; z: zona; x,y: posizione.
function lorePagine(){
  if(lorePagine.cache)return lorePagine.cache;
  return lorePagine.cache=[
    {n:"I",uid:"lore-pg1",item:"Registro · Pagina I",zona:"aula-chiesa",x:2,y:21,nome:"Foglio sotto l’ultimo banco",
      indizio:"«La prima pagina sta dove nessuno si siede, sotto l’ultimo banco della chiesa.»",ids:["ottavia","regola-ottavia","a1958b"],
      testo:"Sotto l’ultimo banco, incastrato tra due listelli, c’è un foglio piegato in quattro. Calligrafia sottile, orgogliosa e un po’ storta: «Registro dei Posti. Pagina I. Ottavia Serpieri, uditrice, cede il posto a chi arriva dopo. (Non so ancora chi sia. Lo riconoscerò dal fiatone.)». In fondo, a matita: «II», e una freccia verso l’alto."},
    {n:"II",uid:"lore-pg2",item:"Registro · Pagina II",zona:"terzo",x:21,y:11,nome:"Foglio sul davanzale",
      indizio:"«La seconda sta dove si ascolta senza parlare, sopra tre piani di scale, sul davanzale.»",ids:["a1963"],
      testo:"Sul davanzale del Matroneo, sotto un vaso di violette secche, un foglio con sei versi e un’intestazione: «Registro dei Posti. II. Fausto Lanza, bidello, riceve una sedia da Ottavia Serpieri e la restituisce ogni giorno in forma di silenzio. Cede la chiave del Matroneo a chiunque voglia stare zitto senza doversi giustificare.»"},
    {n:"III",uid:"lore-pg3",item:"Registro · Pagina III",zona:"villa-ada",x:36,y:9,nome:"Biglietto sotto la panchina",
      indizio:"«La terza è all’aperto, dove il Comune ha scritto la parola «cinghiali» tre volte.»",ids:["a2001","rino"],
      testo:"Sotto la panchina con la targa, in una busta di plastica rosicchiata ai bordi, c’è un biglietto: «Registro dei Posti. III. Io, Rino Calabrò, cedo il posto a una matricola in ritardo. Appello: perso. Pazienza. (Se leggete, il prof. Corradi ha detto la settimana prossima. Aspetto qui.)». Sul retro, qualcuno ha disegnato un cinghiale con il segno della spunta."},
    {n:"IV",uid:"lore-ficus",item:"Registro · Pagina IV",zona:"dome",x:21,y:11,nome:"Ficus Benedetto",
      indizio:"«La quarta sta dietro chi non ha mai fatto domande, in una sala con il tetto di lamiera.»",ids:["serra","ficus"],
      testo:"Dietro il vaso del ficus, ben infilato fra il tronco e il muro, c’è un foglio ripiegato: «Registro dei Posti. IV. Livia Serra, matricola, ha ricevuto un posto da Rino Calabrò il 14 giugno 1999. L’ho tenuto per venticinque anni. Ora lo ripasso: grazie.» La firma è una S con un trattino, come quella dei registri di Storia contemporanea."},
    {n:"V",uid:"lore-pg5",item:"Registro · Pagina V",zona:"tutorato",x:3,y:3,nome:"Mappa con la linea storta",
      indizio:"«La quinta è un percorso: sta dove si impara a chiedere, accanto a una scrivania con l’agenda aperta.»",ids:["teresa","a2004"],
      testo:"Sotto il sottomano della scrivania, un foglio quadrettato con un percorso a penna: dall’ingresso a un’aula, con una linea storta nel mezzo. Sul retro: «Registro dei Posti. V. Teresa Bellandi cede un’ora del suo pomeriggio a chi non sapeva da dove cominciare. La linea storta non è un errore: è il punto in cui ci si ferma a chiedere.»"},
    {n:"VI",uid:"lore-pg6",item:"Registro · Pagina VI",zona:"loft",x:4,y:4,nome:"Foglio nel registratore",
      indizio:"«La sesta sta in alto, dove si registra la voce: nel cassetto di qualcuno che ascolta.»",ids:["viola"],
      testo:"Dentro la custodia del registratore del LOFT, avvolto attorno al nastro, c’è un foglio con la scrittura ordinata di chi scrive tutto tre volte: «Registro dei Posti. VI. Viola, tutor. Cedo il mio turno nella fila, e scopro che finisco prima. Cedo l’agenda ad altri, e scopro che ho meno cose da ricordare. Ho tenuto la linea storta: la passo.»"},
    {n:"VII",uid:"lore-pg7",item:"Registro · Pagina VII",zona:"parenzo-interno",x:20,y:10,nome:"Verbale incompleto",
      indizio:"«La settima sta in un’aula dove si discute con precisione, fra due opinioni e un banco.»",ids:["dario"],
      testo:"Fra i banchi della T02 è rimasto un verbale non timbrato: «Registro dei Posti. VII. Dario cede la sua obiezione a chi sta parlando e la lascia finire. Poi riprende la parola, e la restituisce.» A margine, con una matita diversa: «Corretta una bici. Corretta l’ultima riga. Non corretta la persona, che stava bene così.»"},
    {n:"VIII",uid:"lore-pg8",item:"Registro · Pagina VIII",zona:"pola",x:9,y:20,nome:"Foglio bianco nella nicchia",
      indizio:"«L’ultima è bianca, e sta dove il Nilo sa aspettare, a Pola.»",ids:["nicchia"],
      testo:"In una nicchia dietro il Nilo, che sa di pietra fresca, c’è un foglio di carta pulita. In alto, una sola riga: «Registro dei Posti. VIII.» Il resto è bianco. Marisa, in lontananza, fa finta di contare le chiavi."}
  ];
}
function loreOggetti(){
  if(loreOggetti.cache)return loreOggetti.cache;
  const m={};
  for(const p of lorePagine())m[p.uid]={pagina:p};
  Object.assign(m,{
    "lore-targa":{nome:"Targa di ottone",item:"Incisione «RISERVATO»",ids:["targa"],
      testo:"In fondo all’Aula Chiesa, avvitata a un listello, c’è una piccola targa di ottone. L’incisione è quasi cancellata dal tempo: «Riservato. Dal 1958». Sopra, un cartellino scritto a mano con pennarello nero, più recente: RISERVATO. Le lettere sono state ripassate più volte, con cura. Copi l’incisione sul tuo taccuino.",presa:"Copia l’incisione"},
    "lore-quaderno":{nome:"Quaderno del Vigilante",item:"Quaderno del Vigilante",ids:["tornello","a1984"],
      testo:"Sul davanzale della guardiola, legato a una catenella, c’è un quaderno a righe. Ogni pagina ha una data e una riga: «Nessuna eccezione», «Un’eccezione (poi riprovato)», «Il tornello ha detto bene». La prima pagina riporta il regolamento in una frase: «Il badge è un invito a presentarsi». Prendi il quaderno solo per un attimo. Poi lo rimetti a posto, ma ne ricordi tutto.",presa:"Leggi e annota"},
    "lore-volantino":{nome:"Volantino ingiallito",item:"Volantino dell’appello",ids:["a1999"],
      testo:"Un volantino della Segreteria, scolorito ma ancora attaccato con il nastro: «APPELLO STRAORDINARIO · lunedì 14 giugno 1999 · Aula Chiesa · si prega di arrivare puntuali». Qualcuno ha aggiunto a penna, in basso: «Rino non l’ha visto nessuno». Poi, con un’altra penna: «Io sì. L’ho visto alzarsi.»",presa:"Stacca il volantino"},
    "lore-orario":{nome:"Orario del 360 bis",item:"Orario del 360 bis",ids:["360bis","a1977"],
      testo:"Su un cartello ripiegato, un orario dattiloscritto: «360 bis · supplementare · partenze: sempre dopo l’ultima». Il capolinea è segnato a mano: «Ultimo Posto». In basso: «Il conducente è già a lezione». Qualcuno ha aggiunto un asterisco: «*Fatevi trovare, non fatevi aspettare».",presa:"Tieni l’orario"},
    "lore-cassetta":{nome:"Cassetta «Zero»",item:"Cassetta Zero",ids:["a2009"],
      testo:"Ai piedi del furgone rosso c’è una cassetta con un’etichetta a pennarello: «ZERO». In una custodia, un biglietto: «Prove microfono, prove microfono, un uno uno. Porta del bus. Silenzio (non tagliare)». La cassetta è tiepida, come se fosse stata ascoltata poco fa.",presa:"Prendi la cassetta"},
    "lore-targa-fondatori":{nome:"Targa dei Fondatori",item:"Calco della targa dei Fondatori",ids:["a1958"],
      testo:"Nell’atrio, sotto un busto, una targa un po’ storta: «Qui sorgeva il Pio Seminario di San Sillabo, dedicato allo studio e al silenzio. Gli orari sono affissi. Il silenzio no, è facoltativo». Un’aggiunta a penna: «Ma consigliato».",presa:"Fai un calco con il foglio"}
  });
  Object.assign(m,{
    "lore-busto":{nome:"Busto di Ottavia Serpieri",ids:["ottavia"],
      testo:"Un busto di gesso, senza naso (un incidente del ’78) ma con lo sguardo di chi sta per dire «si accomodi». Sul basamento: «Ottavia Serpieri, uditrice. Rimase in piedi». Sotto, scritto a pennarello da qualcuno: «Grazie».",stato:()=>"Nessuno sa chi l’abbia fatto scolpire. Tutti sanno che a fine sessione qualcuno gli lascia un cioccolatino."},
    "lore-studio":{nome:"Studio 4.17 · Prof. Corradi",ids:["corradi"],
      testo:"Una porta chiusa con un cartello plastificato: «Prof. Alvise Corradi · Ricevimento: la settimana prossima». Il cartello è stato aggiornato più volte; la scritta è sempre la stessa. Sotto la porta passa un filo di luce e, forse, un’agenda aperta a un lunedì di giugno del 2001. Bussi. Dall’interno: «Avanti... la settimana prossima».",stato:()=>"Dall’interno nessuno risponde. Il cartello, a guardarlo bene, ha una piccola bruciatura di caffè accanto al «prossima»."},
    "lore-ascensore":{nome:"Ascensore · Fuori servizio",ids:["ascensore"],
      testo:"Un ascensore con la porta chiusa e un cartello: «Fuori servizio. A breve». Il pannello ha i tasti P, 1, 2, 3, 4, 5 e un 5½ scritto a pennarello. Premi per curiosità: non succede niente, ma dall’altra parte della porta si sente un docente che dice «dunque, riprendiamo da dove eravamo». Poi un applauso discreto. Poi più nulla.",stato:()=>"Il tasto 5½ è tiepido, come se qualcuno lo avesse appena premuto."}
  });
  return loreOggetti.cache=m;
}

// ---------------------------------------------------------------------------
// Dati: personaggi, oggetti e luoghi nuovi (inseriti nella mappa)
// ---------------------------------------------------------------------------
function loreMappa(){
  if(loreMappa.cache)return loreMappa.cache;
  const sign=(zona,uid,nome,x,y,colore="#d1ae72",extra={})=>[zona,{uid,kind:"sign",name:nome,x,y,color:colore,action:"dialog",text:"",...extra}];
  const npc=(zona,uid,tipo,nome,x,y,colore)=>[zona,{uid,kind:tipo,name:nome,x,y,color:colore,solid:false,action:"dialog",text:"",behavior:"idle",speed:1,route:[]}];
  return loreMappa.cache=[
    // Pagine e oggetti del Registro
    ["aula-chiesa",{uid:"lore-pg1",kind:"sign",name:"Foglio sotto l’ultimo banco",x:2,y:21,color:"#e2cfa0",action:"dialog",text:"Un foglio piegato spunta da sotto l’ultimo banco."}],
    ["terzo",{uid:"lore-pg2",kind:"sign",name:"Foglio sul davanzale",x:21,y:11,color:"#e2cfa0",action:"dialog",text:"Un foglio sul davanzale, sotto un vaso di violette."}],
    ["villa-ada",{uid:"lore-pg3",kind:"sign",name:"Biglietto sotto la panchina",x:36,y:9,color:"#e2cfa0",action:"dialog",text:"Una busta di plastica rosicchiata, sotto la panchina."}],
    ["tutorato",{uid:"lore-pg5",kind:"sign",name:"Mappa con la linea storta",x:3,y:3,color:"#e2cfa0",action:"dialog",text:"Un foglio quadrettato con un percorso a penna."}],
    ["loft",{uid:"lore-pg6",kind:"sign",name:"Foglio nel registratore",x:4,y:4,color:"#e2cfa0",action:"dialog",text:"Un foglio avvolto attorno a un nastro."}],
    ["parenzo-interno",{uid:"lore-pg7",kind:"sign",name:"Verbale incompleto",x:20,y:10,color:"#e2cfa0",action:"dialog",text:"Un verbale non timbrato, dimenticato fra i banchi."}],
    ["pola",{uid:"lore-pg8",kind:"sign",name:"Foglio bianco nella nicchia",x:9,y:20,color:"#f2ead0",action:"dialog",text:"Un foglio bianco in una nicchia dietro il Nilo."}],
    // Targhe, volantini, appunti
    ["aula-chiesa",{uid:"lore-targa",kind:"sign",name:"Targa di ottone",x:9,y:18,color:"#c9a24f",action:"dialog",text:"Una targa di ottone in fondo all’aula."}],
    ["giardino",{uid:"lore-quaderno",kind:"sign",name:"Quaderno del Vigilante",x:20,y:77,color:"#8f9f7e",action:"dialog",text:"Un quaderno legato a una catenella."}],
    ["giardino",{uid:"lore-volantino",kind:"sign",name:"Volantino ingiallito",x:24,y:77,color:"#e0c985",action:"dialog",text:"Un volantino scolorito sul muro."}],
    ["giardino",{uid:"lore-orario",kind:"sign",name:"Orario del 360 bis",x:13,y:84,color:"#c9d6dc",action:"dialog",text:"Un orario dattiloscritto, ripiegato."}],
    ["giardino",{uid:"lore-cassetta",kind:"sign",name:"Cassetta «Zero»",x:33,y:55,color:"#b0504f",action:"dialog",text:"Una cassetta con la scritta ZERO."}],
    ["terra",{uid:"lore-targa-fondatori",kind:"sign",name:"Targa dei Fondatori",x:12,y:2,color:"#b9a578",action:"dialog",text:"Una targa un po’ storta, vicino al busto."}],
    // Luoghi e oggetti con storia
    ["terra",{uid:"lore-busto",kind:"pillar",name:"Busto di Ottavia Serpieri",x:11,y:5,color:"#ddd5c1",solid:true,action:"dialog",text:"Un busto senza naso."}],
    ["dome",{uid:"lore-ficus",kind:"tree",name:"Ficus Benedetto",x:21,y:11,color:"#3f6f45",solid:true,action:"dialog",text:"Un ficus enorme in un angolo."}],
    ["quarto",{uid:"lore-studio",kind:"door",name:"Studio 4.17 · Prof. Corradi",x:12,y:3,color:"#7c5a3f",action:"dialog",text:"Una porta chiusa con un cartello."}],
    ["quinto",{uid:"lore-ascensore",kind:"door",name:"Ascensore · Fuori servizio",x:12,y:3,color:"#7d8a8d",action:"dialog",text:"Un ascensore con la porta chiusa."}],
    ["aula-chiesa",{uid:"lore-sedia",kind:"chair",name:"Il posto riservato",x:5,y:19,color:"#6b4a35",solid:true,action:"dialog",text:"Una sedia di legno scuro con un cartellino."}],
    // Personaggi
    npc("aula-chiesa","lore-rino","student","Rino · Ultimo banco",6,19,"#9db6c8"),
    npc("terzo","lore-fausto","cleaner","Fausto · Custode del Matroneo",6,11,"#8f9a86"),
    npc("parenzo-corridoio","lore-marcella","professor","Marcella · Archivista dei seminari",26,9,"#8b7a9a")
  ];
}
function installLore(map){
  if(!map?.zones)return map;
  for(const [zona,o] of loreMappa()){
    const z=map.zones[zona];
    if(!z||z.objects.some(p=>p.uid===o.uid))continue;
    z.objects.push({w:1,h:1,color:"#d1ae72",...o});
  }
  return map;
}

// ---------------------------------------------------------------------------
// Dati: battute extra di personaggi già presenti (argomenti aggiunti, mai riscritti)
// ---------------------------------------------------------------------------
// uid del personaggio, domanda, risposta, voci sbloccate, condizione facoltativa.
function loreParole(){
  if(loreParole.cache)return loreParole.cache;
  const T=(uid,p,r,ids,quando)=>({uid,p,r,ids,quando});
  const pagine=()=>lorePagineTrovate();
  return loreParole.cache=[
    T("viale-ingresso-guardia","Il tornello ha una storia?","«Dal 1984, e da allora non ha mai fatto un’eccezione per simpatia. Io gli tengo compagnia il turno di giorno, lui a me quello di notte. Quando sbaglia, sbaglia i tempi. Mai le persone. C’è un quaderno sulla guardiola: lo leggo ogni lunedì, per ricordarmi di essere gentile.»",["tornello"],()=>!state.gateConfrontation&&!state.guardWarned),
    T("ingresso-guardia","Il tornello ha una storia?","«Dal 1984, e da allora non ha mai fatto un’eccezione per simpatia. Quando sbaglia, sbaglia i tempi. Mai le persone.»",["tornello"],()=>!state.gateConfrontation&&!state.guardWarned),
    T("prof-storia","Chi aggiorna il cartello in fondo all’aula?","Serra stringe un pennarello nero nel pugno, poi lo posa. «Sono io. Ogni settembre, prima che entri la classe. Ricopio RISERVATO sul cartellino perché una persona, nel ’99, mi cedette quel posto e io non ebbi il tempo di ringraziarla. Da allora aggiorno l’avviso, e a lui lo scrivo in silenzio.»",["serra","riservato-mistero"],()=>has("Incisione «RISERVATO»")),
    T("prof-storia","Cosa studiano gli storici del posto in fondo?","«Che le tradizioni più dure sono quelle gentili: nessuno le difende e nessuno le rompe. Quando finirà questa, spero di non essere qui. O di esserci, ma seduta.»",["serra"],()=>lorePagineTrovate()>=1),
    T("tutor-viola","Chi è Teresa?","Viola sfiora il bordo dell’agenda. «Teresa mi ha disegnato la strada il primo giorno, con una linea storta nel mezzo. Quando le ho chiesto perché, mi ha risposto che dopo la curva si incontra sempre qualcuno. Ora la linea storta la faccio io. E la prima persona che ho incontrato dopo la curva, per la cronaca, eri tu.»",["viola","teresa"]),
    T("tutor-viola","Hai mai lasciato una pagina da qualche parte?","«Una. Nel registratore del LOFT: lì nessuno guarda mai. Ho scritto cosa ho imparato dalla fila. Se la trovi, tienila. O restituiscila a qualcuno che sta raccogliendo cose così.»",["viola"],()=>loreHa("rino")||lorePagineTrovate()>=2),
    T("ca-greta","Cosa c’è sulla Cassetta Zero?","«Quattro minuti, di cui uno solo di cose belle: la porta del bus. Gli altri tre sono noi che diciamo prove. Abbiamo scoperto che il pezzo da tenere è quello in cui non si capisce cosa stia per succedere.»",["greta","a2009"],()=>has("Cassetta Zero")),
    T("ca-greta","Hai mai registrato un fantasma?","«Una voce, a tarda sera, da un banco in fondo: diceva “uagliò, avete gli appunti?”. Abbiamo risposto in diretta. Il pubblico non ha capito, ma gli ascolti sono saliti.»",["greta","fantasma"],()=>loreHa("rino")),
    T("va-ettore","Il branco ha un capo?","«Don Baldo. L’orecchio spaccato l’ha preso da una rete, e un tram ancora prima. Dorme sotto la panchina della targa, tutti i lunedì, da più generazioni di cinghiali di quante ne ricordi io. Come per tenere il posto a qualcuno.»",["capobranco","branco"]),
    T("va-ettore","Da quanto c’è il branco al parco?","«Dal 2015, almeno sul registro. Il primo che ho visto girava con aria da sopralluogo. Lo chiamammo Ispettore. Ora i cinghiali sono tanti. Gli ispettori, meno.»",["a2015","branco"]),
    T("va-ettore","Chi sta seduto sulla panchina con la targa?","«Di lunedì, un ragazzo con il cappotto. Gli lascio mezzo panino sul bracciolo e quando torno non c’è più. Una volta ho pensato che l’avesse mangiato il cinghiale. Poi ho visto il cinghiale tornare indietro e mettere la testa sotto la panchina, con rispetto.»",["rino"],()=>loreHa("settimana")),
    T("va-ferretti","Ha mai avuto un relatore difficile?","«Il prof. Corradi. Eravamo suoi dottorandi: lui non mancava mai a un ricevimento, finché un lunedì disse la settimana prossima e non cambiò più agenda. Aspettavamo il lunedì dopo. A un certo punto ho smesso di aspettare, ma una parte di me controlla ancora l’orologio.»",["ferretti","corradi"]),
    T("ca-lucia","Cosa c’è nel carrello, oltre ai libri?","Lucia solleva un volume e ne scuote piano le pagine. «A volte fogli sciolti, usati come segnalibro. Non so da chi vengano, e non importa: li rimetto dove servono. Se una pagina ti sembra scritta a te, probabilmente lo è.»",["lucia"]),
    T("ca-rocco","Tra le tue sedie ce n’è una speciale?","«Una di legno scuro. Era sotto un telo in uno scantinato dell’Aula Chiesa, con un cartellino: RISERVATO. L’ho ripulita e l’ho messa sotto un telo a casa. Non siedo mai. Sento che qualcuno la reclamerà prima o poi.»",["rocco"]),
    T("ca-pasquale","Sei un Aspirante Presente?","«Capo cerimoniere! La regola è: arrivi prima, tieni il posto a chi arriva dopo. Quello dopo tiene il posto a quello dopo ancora. Una catena che non si spezza mai, a meno che qualcuno non decida che è colpa del treno.»",["f-presenti"]),
    T("ca-camilla","Fate anche scambio di appunti?","«Siamo i Dispensisti. Regola uno: mai il tuo nome sulla prima pagina. Regola due: le ultime righe devono essere leggibili. Un anno ho perso metà dell’esame perché l’ultima riga diceva “e quindi”.»",["f-dispensisti"]),
    T("viale-bus-commuter","Siete in tanti sul 360?","«Quasi tutti fuorisede. Non siamo un gruppo: siamo un orario. L’unica regola è non lasciare in piedi chi ha un borsone. Una volta, per un borsone, il 360 si è fermato tre minuti in più. Nessuno ha protestato.»",["f-fuorisede"]),
    T("idee-nina","Chi tiene il conto delle prese?","«La Confraternita della Presa, fondata nel ’92 con una ciabatta. Regola: una presa, due caricatori, tre bugie. Poi c’è la leggenda: chi cede per primo la presa non resta mai senza batteria quando conta. Io l’ho ceduta sette volte. Il telefono è al 9%, ma serenissimo.»",["f-presa","presa","a1992"]),
    T("ca-mameli","Esiste un fatto sociale chiamato Ultimo Posto?","«Il più perfetto. Tutti lo rispettano, nessuno lo decide. Però osservi: se tutti cedono, il posto resta vuoto, e tutti in piedi. C’è un punto che non torna. Quando lo scopro, chiamo Goffman, anche se sono quarant’anni che non risponde.»",["paradosso"],()=>loreHa("ultimo-posto")),
    T("pola-portinaia","La chiave piccola apre qualcosa?","«Una nicchia dietro il Nilo, nel Tinello. I laureati ci lasciano biglietti: grazie, scusa, ho copiato un po’. Io li riordino per data e non li leggo. Ma una pagina, lì, l’ho sempre tenuta in bianco. Non so perché. Aspettava qualcuno con una penna.»",["marisa","nicchia"]),
    T("parenzo-interno-npc","Qual è stato il primo caso della T02?","«Ti tengo il posto. Due studenti, un messaggio, un banco in prima fila rimasto vuoto per un’ora. La sentenza fu un silenzio. Marcella, in corridoio, custodisce il verbale: lo conosce meglio di me.»",["ti-tengo"])
  ];
}

// ---------------------------------------------------------------------------
// Dati: conversazioni dei personaggi nuovi (stesso formato di conversations)
// ---------------------------------------------------------------------------
Object.assign(conversations,{
  "lore-fausto":[
    "Fausto annaffia una violetta con un bicchiere di carta. Ha un camice grigio, i polsini lisi e una penna dietro l’orecchio più vecchia dell’orecchio. «Il Matroneo non è silenzioso: è educato. Da fuori si somigliano, ma dentro c’è molta più gente.»",
    ["Da quanto lavora qui?","«Dal ’63. Facevo il poeta, ma la mensa dei bidelli era migliore. Mi hanno assunto perché avevo bella calligrafia e sapevo salire le scale a due a due. La seconda cosa l’ho persa; la prima, per fortuna, no.»"],
    ["Cosa scrive sui fogli presenza?","«Versi. Una volta una studentessa ne ha incorniciato uno. Il rettore non l’ha mai saputo. La studentessa nemmeno: era il retro.»"],
    ["Ha lasciato un foglio sul davanzale?","«Uno, da venticinque anni. Sei il primo che lo legge. Gli altri guardano il panorama, che è giusto: il panorama è più grande. Ma il foglio è più caldo.»"],
    ["Cosa pensa dell’Ultimo Posto?","«Quando arrivai io la professoressa Serpieri mi cedette la sedia del custode e disse: siediti, che resti in piedi tutta la vita. Gliel’ho restituita ogni giorno, in forma di silenzio. Forse sbagliavo. Forse bisognava solo dire grazie.»"]
  ],
  "lore-marcella":[
    "Marcella tiene un faldone legato con due elastici e uno sguardo che ha già letto il tuo caso. «Ogni seminario della T02 lascia un verbale. Li conservo tutti, anche quelli in cui non si è deciso nulla. Sono i più istruttivi, e anche i più brevi.»",
    ["Qual è il verbale più antico?","«Il caso uno: Ti tengo il posto. Due studenti, un messaggio e un banco in prima fila rimasto vuoto per un’ora, perché il destinatario non sapeva se poteva accettare. Il professore scrisse: «La cortesia si perfeziona quando qualcuno si siede». La frase è finita, tagliata male, su una tazza del bar.»"],
    ["Chi frequenta ancora l’archivio?","«Dario, quello del mercatino delle bici. Mi ha lasciato un foglio da tenere insieme al verbale: dice che appartiene a una serie. Non so quale. Il foglio, comunque, l’ho lasciato in aula: lì serve più che in archivio.»"],
    ["Posso avere una copia?","«Le copie non si fanno. Si leggono sul posto, in piedi, con rispetto. Se hai bisogno di ricordare, ricorda: è gratis e non finisce il toner.»"]
  ],
  "lore-rino":[
    "Rino è seduto di lato sul banco in fondo, con un cappotto da un altro decennio e una cartellina sulle ginocchia. Accanto a lui c’è una sedia vuota con un cartellino: RISERVATO. «Uagliò... sei nuovo? No, aspetta, tu sei di passaggio. Siediti pure. No, lì no. Lì no.»"
  ]
});

// ---------------------------------------------------------------------------
// Stato e sblocchi
// ---------------------------------------------------------------------------
function loreSt(){return state.lore??={got:[],nuovi:[],took:{},fin:0,tab:"luoghi",sel:{},fine:false};}
function loreHa(id){return Boolean(state?.lore?.got.includes(id));}
function lorePagineTrovate(){return state?lorePagine().filter(p=>has(p.item)).length:0;}
function archivioConta(){
  const tutte=loreVoci();
  return [state?.lore?loreVoci().filter(e=>state.lore.got.includes(e.id)).length:0,tutte.length];
}
function loreSuono(nome){try{sound(nome,"interface");}catch{}}
function loreZone(){return {giardino:["viale"],ingresso:["viale"],terra:["atrio"],"aula-chiesa":["aula-chiesa"],terzo:["matroneo"],dome:["dome"],dome2:["serra"],
  loft:["loft"],"villa-ada":["villa-ada"],parenzo:["parenzo"],"parenzo-corridoio":["parenzo"],pola:["pola"],caffe:["bar"],quarto:["piani-alti"],quinto:["piani-alti"],tutorato:["tutorato"]};}
function loreOg(){return {
  "viale-ingresso-bacheca":["ultimo-posto"],"ingresso-bacheca":["ultimo-posto"],
  "radio-luiss-van":["radio"],"radio-sign":["radio"],"villa-ada-panchina-targa":["settimana"],
  "ca-bacheca-impossibile":["studio"],"romania-corridoio-bacheca":["studio"],
  "lore-busto":["ottavia"],"lore-ficus":["ficus"],"lore-ascensore":["ascensore"],"lore-studio":["corradi"],"lore-targa":["targa"],
  "lore-fausto":["fausto"],"lore-marcella":["marcella"]};}
function loreChat(){return {
  "lore-marcella":{"Qual è il verbale più antico?":["ti-tengo"]},
  "lore-rino":{"Chi sei?":["rino"]}};}
function loreCond(){return [
  ["fantasma",()=>has("Fantasma del fuoricorso")],
  ["tesi",()=>has("Cinghiale con la tesi")],
  ["corradi",()=>has("Professore dell’ultimo appello")],
  ["360bis",()=>state.secrets.includes("corsa-fantasma")],
  ["quarta-stazione",()=>state.secrets.includes("frequenza-88")],
  ["branco",()=>state.secrets.includes("villa-seminato")||state.secrets.includes("villa-mela")],
  ["brindisi",()=>has("Festa a Pola")],
  ["registro",()=>lorePagineTrovate()>=2],
  ["f-guardiani",()=>lorePagineTrovate()>=4]
];}

let loreToastCoda=[],loreToastAttivo=false;
function loreSblocca(ids,extra){
  if(!state||testMode)return 0;
  const s=loreSt(),nuove=[];
  for(const id of ids){
    const e=loreVoce(id);
    if(!e||s.got.includes(id))continue;
    s.got.push(id);s.nuovi.push(id);nuove.push(e);
    record("Archivio · "+e.t);
  }
  if(!nuove.length)return 0;
  save();
  loreToastMostra(nuove,extra);
  if(lorePannello)loreDisegna(nuove[0].id);
  return nuove.length;
}
function scopriLore(id){return loreSblocca([id])>0;}

function loreCheck(){
  if(!state||testMode||screen!=="game"||state.prologue)return;
  const ids=[],zona=loreZone()[state.zone];
  if(zona)ids.push(...zona);
  if(activeScene){
    const og=loreOg()[activeScene];if(og)ids.push(...og);
    const chat=state.chatTopic&&loreChat()[state.chatTopic.uid]?.[state.chatTopic.prompt];
    if(chat)ids.push(...chat);
  }
  for(const [id,quando] of loreCond())if(!loreHa(id)&&quando())ids.push(id);
  loreSblocca(ids);
}

// ---------------------------------------------------------------------------
// Scene: oggetti da trovare, finale, battute extra
// ---------------------------------------------------------------------------
function loreRicevi(def,item,ids,riga){
  carry(item);
  const extra=def.pagina?"Pagine ritrovate · "+lorePagineTrovate()+"/"+lorePagine().length:"";
  record("Trovato · "+item+(extra?" · "+extra:""));
  loreSuono("coin");
  loreSblocca(ids,extra);
  if(def.pagina&&lorePagineTrovate()===lorePagine().length){
    record("Archivio · Il Registro dei Posti è completo. Porta le pagine allo studente dell’ultimo banco.");
    loreToastMostra([{t:"Il Registro è completo",x:"Porta le otto pagine a Rino, in Aula Chiesa.",h:""}],"",true);
  }
}
function loreScenaPagina(o,p){
  const preso=has(p.item),tot=lorePagine().length,n=lorePagineTrovate();
  let testo=p.testo;
  if(p.uid==="lore-ficus")testo="Un ficus enorme, lucido come un esame andato bene, occupa l’angolo del Dome. Alla base c’è un caricatore infilato fra le radici, come su un albero di Natale con il Wi-Fi. Dietro il tronco, qualcosa di chiaro.\n\n"+testo;
  if(preso)return scene(o.name,testo+"\n\nL’hai già con te. Pagine ritrovate: "+n+"/"+tot+".");
  return scene(o.name,testo+(p.uid==="lore-ficus"?"":"\n\nPagine ritrovate: "+n+"/"+tot+"."),
    [p.uid==="lore-ficus"?"Guarda dietro il ficus e prendi la pagina":"Metti la pagina in tasca",()=>loreRicevi({pagina:p},p.item,p.ids)]);
}
function loreScenaSedia(o){
  const s=loreSt(),n=lorePagineTrovate(),tot=lorePagine().length;
  const turno=state.chatTopic?.uid===o.uid?state.chatTopic:null;
  if(s.fin>=4){
    if(!s.epilogoVisto)return scene("Il posto riservato · Dottore in Pazienza",
      "Scrivi «"+state.name+"» sulla pagina VIII e, sotto, una parola sola: «Grazie». Il foglio si scalda un attimo, come una tazza. Rino lo piega con cura e lo infila nel Registro, che chiude con un cenno. Ti passa un cartoncino: TITOLARE DELL’ULTIMO POSTO. Valido finché serve, rinnovabile cedendo.\n\nHai ottenuto la Tessera dell’Ultimo Posto e 25 monete. Il cartellino sulla sedia adesso dice: OCCUPATO.",
      ["Alzati e lascia il posto",()=>{s.epilogoVisto=true;activeScene=null;}]);
    return scene(o.name,turno?.reply??"Il cartellino sulla sedia dice OCCUPATO, scritto a matita con la tua calligrafia. È l’unico cartello del campus che sembra felice.",
      ["Siediti un momento",()=>{state.chatTopic={uid:o.uid,prompt:"Siediti un momento",reply:"Ti siedi. La sedia è esattamente della misura giusta, come se avesse aspettato proprio te. Dal fondo dell’Aula Chiesa le persone sembrano molto piccole e molto gentili. Dopo un minuto ti alzi e lasci il posto libero. È la parte più difficile, e ormai sai farla."};}]);
  }
  if(s.fin===0)return scene(o.name,n>=tot
    ?"Una sedia di legno scuro con un cartellino. Hai tutte le pagine. Rino, lì accanto, ti guarda con la cartellina sul petto: prima parla con lui."
    :"Una sedia di legno scuro con un cartellino ricopiato con cura: RISERVATO. Rino ti guarda e scuote piano la testa. «Non ancora, uagliò. Prima il Registro: il posto non scappa, sta lì da sessant’anni.»");
  if(s.fin===1)return scene(o.name,turno?.reply??"La sedia ti aspetta. La scritta RISERVATO, a guardarla bene, sembra molto meno rigida di prima. Rino si è fatto da parte e finge di leggere il soffitto.",
    ["Cedi il posto a Rino",()=>{state.chatTopic={uid:o.uid,prompt:"Cedi il posto a Rino",reply:"Rino alza le mani come davanti a un cane che si commuove. «No no no! Sei uguale a tutti: prego, prima lei. Sono vent’anni che cedono, uagliò. Il posto non è una cortesia da restituire: è un regalo da accettare. Siediti. Non è un esame.»"};}],
    ["Siediti all’Ultimo Posto",()=>{s.fin=2;state.chatTopic=null;}]);
  if(s.fin===2)return scene("L’appello dell’ultimo posto",
    "Appena ti siedi, la luce dell’Aula Chiesa si fa calda come in un pomeriggio di luglio. In fondo, sull’uscio, compare un professore con un’agenda aperta su un lunedì di giugno di tanti anni fa. «Buongiorno. Ci vediamo... oggi.»\n\nÈ Corradi. Rino si alza, si aggiusta il cappotto e gli va incontro. «Come stai?» «Bene, professore. Finalmente.» «E ha letto il programma?» «Ci sto lavorando.» Corradi scrive qualcosa e, per la prima volta in ventiquattro anni, gira la pagina dell’agenda.",
    ["Continua",()=>{s.fin=3;}]);
  return scene("Dottore in Pazienza",
    "Corradi chiude l’agenda. «Il lavoro è tardivo, ma puntualissimo nei contenuti. Trenta e lode alla pazienza, con menzione per chi ha ceduto più posti di quanti ne abbia occupati.» Rino ride, e il suono è quello di una chiesa piena. Poi si volta verso di te. «Il Registro è completo. Manca soltanto una riga sull’ottava pagina: quella tua.»",
    ["Scrivi il tuo nome sulla pagina VIII",()=>{
      s.fin=4;s.fine=true;
      awardCoins(25);carry("Tessera dell’Ultimo Posto");change("empatia",5);change("autocontrollo",3);
      discover("ultimo-posto-vero","Il vero Ultimo Posto");
      loreSblocca(["verita","appello","a-oggi"],"Registro completato");
      record("Archivio · Hai firmato la pagina VIII del Registro: Rino ha avuto il suo appello. +25 monete, Tessera dell’Ultimo Posto.");
      sound("coin","map");chime([60,64,67,72,76],.11);
    }]);
}
function loreScenaOggetto(o){
  const def=loreOggetti()[o.uid];
  if(!def&&o.uid!=="lore-sedia")return null;
  if(o.uid==="lore-sedia")return loreScenaSedia(o);
  if(def.pagina)return loreScenaPagina(o,def.pagina);
  if(def.item){
    const preso=has(def.item);
    return scene(o.name,def.testo+(preso?"\n\nL’hai già con te: «"+def.item+"».":""),
      ...(preso?[]:[[def.presa,()=>loreRicevi(def,def.item,def.ids)]]));
  }
  const visto=loreHa(def.ids[0]);
  return scene(o.name,def.testo+(visto?"\n\n"+def.stato():""));
}

const loreGetSceneBase=getScene;
getScene=function(){
  if(state&&!testMode&&activeScene&&!state.prologue&&!state.ending&&!state.freeMoment){
    const o=currentObject();
    if(o?.uid?.startsWith("lore-")){const s=loreScenaOggetto(o);if(s)return s;}
  }
  return loreGetSceneBase.apply(this,arguments);
};

// Rino: la conversazione cambia con il Registro e dopo il finale.
function loreRinoProfilo(){
  const s=loreSt(),n=lorePagineTrovate(),tot=lorePagine().length;
  if(s.fin>=4)return [
    "Rino è ancora lì, ma più leggero: il cappotto ha perso mezzo decennio e la cartellina si è fatta sottile. Sul banco c’è un cartellino nuovo: OCCUPATO, con il tuo nome a matita. «Uagliò! Mi hai fatto un favore. Adesso passo di tanto in tanto a controllare se qualcuno ha bisogno del posto.»",
    ["Come stai?","«Come uno che ha finalmente risposto alla prima domanda: bene. Sulla seconda sto ancora lavorando, ma adesso ho il tempo.»"],
    ["Cosa farai adesso?","«Girare. Dare appunti a chi non li ha. Controllare che i cartelli dicano la verità: RISERVATO, ma anche OCCUPATO, che è la parola più bella del vocabolario.»"],
    ["E il Registro?","«Tienilo tu. Ha il tuo nome sull’ultima riga. Prima o poi arriverà qualcuno in ritardo: dagli il posto, e quando tocca a te, ricorda di dire grazie.»"]];
  const mancanti=lorePagine().filter(p=>!has(p.item));
  const prossima=mancanti[0];
  return [
    conversations["lore-rino"][0],
    ["Chi sei?","«Rino Calabrò, Giurisprudenza, matricola del ’94. Fuoricorso da quando ho ceduto un posto, il 14 giugno ’99. Non mi lamento: ho avuto più tempo per leggere i cartelli. Sono bellissimi, ma non hanno mai la stessa idea di cosa sia “subito”.»"],
    ["Chi aspetti?","«Un appello, in teoria. In pratica, che qualcuno si sieda dove ho lasciato il posto. Non pensare che sia facile: tutti mi dicono “prego, prima lei” e tornano indietro. Sono vent’anni che nessuno dice grazie e si siede. Ho il sospetto di aver sbagliato qualcosa anch’io.»"],
    ["Posso sedermi sulla sedia riservata?",n>=tot
      ?"«Hai le otto pagine? Allora il Registro è in ordine. Fammelo vedere, che lo leggo anch’io: me lo ricordo a pezzi.»"
      :"«Calma, uagliò. Quel posto lo prende chi ne ha bisogno e ha imparato a riceverlo, non solo a cederlo. Tu non ancora: ti manca il Registro. Otto pagine sparse per il campus, scritte da gente che ha ceduto qualcosa a chi arrivava dopo.»"],
    ["Hai visto le mie pagine?",n>=tot
      ?"«Sì, sono tutte qui. Hai fatto il giro di tutto il campus per ritrovare i miei pensieri più vecchi: nessuno ha mai fatto una cosa del genere per me. Nemmeno io.»"
      :"«Ne hai "+n+" su "+tot+". Te ne dico una per volta, perché a ricordarle tutte mi viene la nostalgia in blocco. La prossima è la "+prossima.n+": "+prossima.indizio.replace(/^«|»$/g,"")+"»"]
  ];
}
const loreConversationBase=conversationFor;
conversationFor=function(o){
  if(o?.uid==="lore-rino"&&state&&!testMode){
    const profilo=loreRinoProfilo();
    return typeof ideeTune==="function"?ideeTune(o,profilo):profilo;
  }
  return loreConversationBase.apply(this,arguments);
};

// Argomenti extra e finale: un solo gancio su campusOptionalScene.
const loreOptionalBase=campusOptionalScene;
campusOptionalScene=function(sceneData,o){
  const result=loreOptionalBase.apply(this,arguments);
  try{return loreScelte(result,o);}catch{return result;}
};
function loreScelte(sceneData,o){
  if(!state||testMode||!o?.uid)return sceneData;
  const turno=state.chatTopic?.uid===o.uid?state.chatTopic:null;
  const nuove=[];
  if(o.uid==="lore-rino"){
    const s=loreSt();
    if(s.fin===0&&lorePagineTrovate()>=lorePagine().length&&!turno?.prompt?.startsWith("Apri il Registro")){
      nuove.push(["Apri il Registro completo sul banco",()=>{
        s.fin=1;loreSblocca(["registro"]);
        state.chatTopic={uid:o.uid,prompt:"Apri il Registro completo sul banco",reply:"Allinei le otto pagine sul banco: otto calligrafie, otto modi di cedere qualcosa. Rino le legge con il dito, una per una, e sorride a quella che ha scritto lui. Arriva all’ottava, quella bianca, e si ferma. «Manca solo chi riceve» dice piano. «Lo sai che nessuno, in tutti questi anni, ha mai scritto grazie sull’ultima riga? Cedevano tutti. Nessuno si sedeva. Il posto è lì, uagliò. Quando vuoi.»"};
      }]);
    }
  }
  for(const t of loreParole()){
    if(t.uid!==o.uid||turno?.prompt===t.p||(t.quando&&!t.quando()))continue;
    nuove.push([t.p,()=>{state.chatTopic={uid:o.uid,prompt:t.p,reply:t.r};loreSblocca(t.ids);}]);
  }
  if(!nuove.length)return sceneData;
  const scelte=[...sceneData.choices];
  const fine=scelte.findIndex(c=>String(c[0]).startsWith("Torna all"));
  scelte.splice(fine<0?scelte.length:fine,0,...nuove);
  return {...sceneData,choices:scelte};
}

// renderScene: gli sblocchi per luogo e oggetto avvengono prima del disegno (il diario si aggiorna da solo).
const loreRenderBase=renderScene;
renderScene=function(){
  try{loreCheck();}catch{}
  return loreRenderBase.apply(this,arguments);
};
// Mentre l'Archivio è aperto il gioco non interpreta comandi, movimento o traffico.
const loreEsplorandoBase=exploringCampus;
exploringCampus=function(){return !lorePannello&&loreEsplorandoBase.apply(this,arguments);};
setInterval(()=>{try{if(!lorePannello)loreCheck();}catch{}},900);

// Barlume sugli oggetti ancora da raccogliere (disegnato nel canvas, rispetta reducedMotion).
function paintLore(c,zone,now){
  if(!state||testMode||screen!=="game")return;
  const objs=room(zone)?.objects;
  if(!objs)return;
  for(const o of objs){
    if(!o.uid.startsWith("lore-"))continue;
    const def=loreOggetti()[o.uid];
    const item=def?.pagina?.item??def?.item;
    if(!item||has(item))continue;
    const bob=reducedMotion?0:Math.round(Math.sin(now/260+o.x)*1.2);
    const x=o.x*16,y=o.y*16-5+bob;
    rect(c,"#fff3c4",x+7,y,2,2);rect(c,"#f2c75c",x+6,y+1,1,1);rect(c,"#f2c75c",x+9,y+1,1,1);
    rect(c,"#f2c75c",x+7,y-1,2,1);rect(c,"#f2c75c",x+7,y+2,2,1);
    if(!reducedMotion&&Math.floor(now/320+o.y)%3===0)rect(c,"#ffffff",x+11,y-2,1,1);
  }
}

// ---------------------------------------------------------------------------
// Scoperta: avviso a comparsa (stili iniettati qui, nessuna modifica a styles.css)
// ---------------------------------------------------------------------------
function loreStili(){
  if(document.getElementById("lore-stili"))return;
  const st=document.createElement("style");st.id="lore-stili";
  st.textContent=`
.gp-archivio{--ga-bg:#0f1a23;--ga-bg2:#16273a;--ga-card:#1c3045;--ga-line:#3b5d78;--ga-gold:#f2c968;--ga-paper:#f0e3c1;--ga-ink:#2b2117;--ga-mute:#8ea9bb;--ga-teal:#7fc9bb;--ga-rosa:#e48c8c;
  position:fixed;inset:0;z-index:9100;display:flex;flex-direction:column;box-sizing:border-box;color:#e9f0f4;font-family:var(--font-ui);
  background:radial-gradient(120% 90% at 50% 0,#1b3550 0,var(--ga-bg) 62%);
  padding:max(10px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));
  gap:10px;animation:ga-entra .28s ease-out both}
.gp-archivio *{box-sizing:border-box}
.gp-archivio::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.35;
  background:repeating-linear-gradient(0deg,transparent 0 3px,#00000030 3px 4px)}
.gp-archivio>*{position:relative}
.ga-top{display:flex;align-items:center;gap:12px;min-height:48px}
.ga-top h2{margin:0;font-family:var(--font-title);font-weight:400;font-size:clamp(14px,2.6vw,22px);letter-spacing:.06em;color:var(--ga-gold);text-shadow:3px 3px 0 #000a;flex:1;min-width:0}
.ga-indietro{min-height:46px;min-width:46px;padding:0 16px 0 12px;display:inline-flex;align-items:center;gap:10px;cursor:pointer;
  font:700 18px var(--font-ui);color:#f6efd6;background:var(--ga-card);border:3px solid var(--ga-line);box-shadow:0 4px 0 #000a}
.ga-indietro::before{content:"";width:12px;height:16px;background:currentColor;clip-path:polygon(100% 0,100% 100%,0 50%)}
.ga-indietro:hover{background:#25405a}.ga-indietro:active{transform:translateY(2px);box-shadow:0 2px 0 #000a}
.ga-conto{display:flex;align-items:center;gap:10px;font-family:var(--font-title);font-size:clamp(10px,1.8vw,13px);color:#f6efd6;white-space:nowrap}
.ga-conto b{color:var(--ga-gold);font-weight:400}
.ga-barra{display:inline-block;width:clamp(56px,14vw,150px);height:12px;background:#0007;border:2px solid var(--ga-line);padding:1px}
.ga-barra i{display:block;height:100%;background:repeating-linear-gradient(90deg,var(--ga-gold) 0 6px,#d7a445 6px 8px);transition:width .5s}
.ga-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.ga-tab{min-height:46px;padding:6px 6px;cursor:pointer;font:700 clamp(13px,1.9vw,17px) var(--font-ui);color:var(--ga-mute);background:#0d1822;border:3px solid #28445a;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;line-height:1.1}
.ga-tab small{font:400 12px var(--font-ui);opacity:.85}
.ga-tab[aria-selected=true]{color:#fff6dc;background:var(--ga-card);border-color:var(--ga-gold);box-shadow:0 4px 0 #000a}
.ga-tab:hover{color:#fff}
.ga-corpo{flex:1;min-height:0;display:grid;grid-template-columns:minmax(260px,380px) minmax(0,1fr);gap:14px}
.ga-lista{list-style:none;margin:0;padding:4px 6px 4px 2px;overflow:auto;display:flex;flex-direction:column;gap:7px;overscroll-behavior:contain;scrollbar-color:var(--ga-line) transparent}
.ga-voce{width:100%;min-height:50px;text-align:left;cursor:pointer;display:flex;align-items:center;gap:11px;padding:8px 12px;position:relative;
  font:700 clamp(14px,1.6vw,17px) var(--font-ui);color:#eef3f5;background:var(--ga-card);border:3px solid var(--ga-line);box-shadow:0 3px 0 #000a}
.ga-voce span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-voce::before{content:"";flex:none;width:18px;height:18px;background:var(--ga-gold)}
.ga-voce[data-sec=luoghi]::before{clip-path:polygon(50% 0,100% 42%,86% 42%,86% 100%,14% 100%,14% 42%,0 42%)}
.ga-voce[data-sec=persone]::before{background:var(--ga-teal);clip-path:polygon(30% 0,70% 0,80% 28%,70% 52%,100% 78%,100% 100%,0 100%,0 78%,30% 52%,20% 28%)}
.ga-voce[data-sec=leggende]::before{background:var(--ga-rosa);clip-path:polygon(50% 0,62% 36%,100% 38%,70% 60%,80% 100%,50% 76%,20% 100%,30% 60%,0 38%,38% 36%)}
.ga-voce[data-sec=cronologia]::before{background:#b9a3e8;clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)}
.ga-voce.ga-chiusa{color:#6f8798;background:repeating-linear-gradient(135deg,#0e1923 0 7px,#12202c 7px 14px);border-color:#243b4c;box-shadow:none}
.ga-voce.ga-chiusa::before{background:#2c4457;clip-path:polygon(0 0,100% 0,100% 100%,0 100%);opacity:.8}
.ga-voce.ga-chiusa span{font-family:var(--font-title);font-size:12px;letter-spacing:.1em}
.ga-voce[aria-selected=true]{border-color:var(--ga-gold);background:#26435e;transform:translateX(4px)}
.ga-voce.ga-chiusa[aria-selected=true]{background:#18293a}
.ga-nuovo::after{content:"NUOVO";position:absolute;right:8px;top:-9px;padding:2px 6px;font:700 11px var(--font-ui);color:#2b2117;background:var(--ga-gold);animation:ga-lampeggia 1.1s steps(2) infinite}
.ga-rivela{animation:ga-rivela .9s ease-out both}
.ga-dettaglio{min-height:0;overflow:auto;padding:clamp(14px,2.6vw,26px);background:var(--ga-paper);color:var(--ga-ink);border:4px solid #7d6a45;box-shadow:inset 0 0 0 3px #f8efd5,0 6px 0 #000a;
  overscroll-behavior:contain;scrollbar-color:#a08a5b transparent}
.ga-sez{display:inline-block;margin:0 0 10px;padding:3px 9px;font:700 12px var(--font-title);letter-spacing:.08em;color:#fff6dc;background:#6b5a37;text-transform:uppercase}
.ga-dettaglio h3{margin:0 0 12px;font:700 clamp(21px,3.2vw,30px)/1.15 var(--font-ui);color:#2b2117}
.ga-dettaglio p{margin:0 0 12px;font:400 clamp(16px,1.9vw,20px)/1.55 var(--font-ui)}
.ga-indizio{margin-top:6px;padding:10px 12px;border-left:5px solid #6b5a37;background:#e6d7b0;font:400 clamp(15px,1.7vw,18px)/1.45 var(--font-ui)}
.ga-ombra{display:flex;flex-direction:column;gap:9px;margin:4px 0 16px}
.ga-ombra i{display:block;height:15px;background:#c9b88f;opacity:.7}
.ga-ombra i:nth-child(2){width:92%}.ga-ombra i:nth-child(3){width:78%}.ga-ombra i:nth-child(4){width:55%}
.ga-vuoto{font:400 clamp(16px,2vw,20px)/1.5 var(--font-ui);color:#6b5a37}
.ga-aiuto{display:none;justify-content:center;gap:18px;flex-wrap:wrap;font-size:14px;color:var(--ga-mute)}
.ga-aiuto kbd{font:700 12px var(--font-ui);padding:1px 6px;border:2px solid var(--ga-line);background:#0d1822;color:#e9f0f4}
@media (hover:hover) and (pointer:fine) and (min-width:761px){.ga-aiuto{display:flex}}
@media (max-width:760px){
  .ga-corpo{grid-template-columns:1fr;grid-template-rows:minmax(0,40%) minmax(0,1fr);gap:10px}
  .ga-tab small{display:none}
  .ga-top h2{font-size:14px}
  .ga-conto span.ga-barra{display:none}
}
@media (max-height:520px) and (min-width:761px){.ga-dettaglio h3{font-size:22px}.ga-dettaglio p{font-size:16px}.ga-voce{min-height:42px}}
.gp-archivio button:focus-visible{outline:4px solid #fff;outline-offset:2px;z-index:2}
.gp-archivio .ga-voce:focus-visible{outline-offset:-7px}
.lore-toast{position:fixed;left:50%;top:max(14px,env(safe-area-inset-top));z-index:9200;transform:translateX(-50%);max-width:min(92vw,520px);display:flex;gap:12px;align-items:center;
  padding:10px 16px 10px 12px;background:#102232;color:#fbf2d6;border:3px solid var(--ga-gold,#f2c968);box-shadow:0 5px 0 #000b,0 0 0 3px #0a141c;
  font-family:var(--font-ui);animation:lt-entra .45s cubic-bezier(.2,1.4,.4,1) both;pointer-events:none}
.lore-toast.lt-esce{animation:lt-esci .4s ease-in both}
.lore-toast small{display:block;font:700 11px var(--font-title);letter-spacing:.06em;color:#f2c968}
.lore-toast b{display:block;font:700 18px/1.2 var(--font-ui)}
.lore-toast em{display:block;font:400 14px/1.3 var(--font-ui);color:#a9c4d3;font-style:normal;margin-top:2px}
@media (max-width:640px),(max-height:520px){.lore-toast{top:calc(max(14px,env(safe-area-inset-top)) + 60px);max-width:86vw;padding:8px 10px;gap:8px;pointer-events:none}.lore-toast b{font-size:14px}.lore-toast em{font-size:12px}.lore-toast small{font-size:9px}}
.lt-gem{flex:none;position:relative;width:30px;height:30px;background:#f2c968;clip-path:polygon(50% 0,100% 38%,50% 100%,0 38%);animation:lt-gira 1.6s steps(8) infinite}
.lt-gem::after{content:"";position:absolute;left:30%;top:18%;width:20%;height:20%;background:#fff}
.lore-toast.lt-speciale{border-color:#7fc9bb}.lore-toast.lt-speciale .lt-gem{background:#7fc9bb}
.lore-toast .lt-sc{position:absolute;width:6px;height:6px;background:#f2c968;opacity:0;animation:lt-sc 1.4s ease-out both}
@keyframes lt-entra{0%{opacity:0;transform:translate(-50%,-30px) scale(.7)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}
@keyframes lt-esci{to{opacity:0;transform:translate(-50%,-24px) scale(.9)}}
@keyframes lt-gira{0%{transform:scaleX(1)}50%{transform:scaleX(.25)}100%{transform:scaleX(1)}}
@keyframes lt-sc{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--dx),var(--dy))}}
@keyframes ga-entra{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}
@keyframes ga-lampeggia{50%{opacity:.4}}
@keyframes ga-rivela{0%{filter:brightness(3) saturate(0);clip-path:inset(0 100% 0 0)}60%{filter:brightness(1.8);clip-path:inset(0 0 0 0)}100%{filter:none;clip-path:inset(0 0 0 0)}}
@media (prefers-reduced-motion:reduce){.gp-archivio,.lore-toast,.lore-toast *,.ga-nuovo::after,.ga-rivela,.ga-barra i{animation:none!important;transition:none!important}.lore-toast .lt-sc{display:none}}
`;
  document.head.append(st);
}
function loreToastMostra(voci,extra,speciale){
  loreStili();
  loreSuono(speciale?"scopa":"objective");
  loreToastCoda.push({voci,extra,speciale});
  if(!loreToastAttivo)loreToastProssimo();
}
function loreToastProssimo(){
  const n=loreToastCoda.shift();
  if(!n){loreToastAttivo=false;return;}
  loreToastAttivo=true;
  const el=document.createElement("div");
  el.className="lore-toast"+(n.speciale?" lt-speciale":"");
  el.setAttribute("role","status");
  const gem=document.createElement("span");gem.className="lt-gem";gem.setAttribute("aria-hidden","true");
  const box=document.createElement("div");
  const small=document.createElement("small");
  small.textContent=n.speciale?"Archivio · Risultato":"Archivio · Nuova voce";
  const b=document.createElement("b");
  b.textContent=n.voci.length>1?n.voci[0].t+" (+"+(n.voci.length-1)+")":n.voci[0].t;
  box.append(small,b);
  const dettaglio=n.speciale?n.voci[0].x:n.extra;
  if(dettaglio){const em=document.createElement("em");em.textContent=dettaglio;box.append(em);}
  el.append(gem,box);
  for(let i=0;i<8;i++){
    const sc=document.createElement("i");sc.className="lt-sc";sc.setAttribute("aria-hidden","true");
    const a=i/8*Math.PI*2;
    sc.style.cssText="left:26px;top:50%;--dx:"+Math.round(Math.cos(a)*46)+"px;--dy:"+Math.round(Math.sin(a)*40)+"px;animation-delay:"+(i%3)*60+"ms";
    el.append(sc);
  }
  document.body.append(el);
  setTimeout(()=>el.classList.add("lt-esce"),n.speciale?4200:3300);
  setTimeout(()=>{el.remove();loreToastProssimo();},n.speciale?4600:3700);
}

// ---------------------------------------------------------------------------
// Pannello a schermo intero: archivioApri() / archivioChiudi()
// ---------------------------------------------------------------------------
let lorePannello=null,lorePrecedente=null;
function loreEl(tag,classe,testo){
  const e=document.createElement(tag);
  if(classe)e.className=classe;
  if(testo!==undefined)e.textContent=testo;
  return e;
}
function archivioApri(){
  if(lorePannello||!state||typeof document==="undefined")return;
  loreStili();
  const s=loreSt();
  try{clearCampusInputs();}catch{}
  lorePrecedente=document.activeElement;
  const el=loreEl("div","gp gp-archivio");
  el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-labelledby","ga-titolo");
  const top=loreEl("header","ga-top");
  const indietro=loreEl("button","ga-indietro","Indietro");
  indietro.type="button";indietro.onclick=archivioChiudi;
  const titolo=loreEl("h2",null,"Archivio");titolo.id="ga-titolo";
  const conto=loreEl("div","ga-conto");
  top.append(indietro,titolo,conto);
  const tabs=loreEl("div","ga-tabs");tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Sezioni dell’Archivio");
  const corpo=loreEl("div","ga-corpo");
  const lista=loreEl("ul","ga-lista");lista.setAttribute("role","listbox");lista.setAttribute("aria-label","Voci");
  const dett=loreEl("article","ga-dettaglio");dett.setAttribute("aria-live","polite");dett.tabIndex=-1;
  corpo.append(lista,dett);
  const aiuto=loreEl("footer","ga-aiuto");
  for(const [k,t] of [["Su/Giù","scegli"],["Sinistra/Destra","sezione"],["Esc","indietro"]]){
    const kb=loreEl("kbd",null,k),sp=loreEl("span");sp.append(kb," "+t);aiuto.append(sp);
  }
  el.append(top,tabs,corpo,aiuto);
  document.body.append(el);
  lorePannello={el,indietro,conto,tabs,lista,dett,barra:null};
  // Se ci sono voci nuove, apri la prima: è il momento della scoperta.
  const nuova=s.nuovi.length?loreVoce(s.nuovi[0]):null;
  if(nuova)s.tab=nuova.sec;
  window.addEventListener("keydown",loreTastiera,true);
  loreDisegna(nuova?.id,true);
  loreSuono("menu");
  (lorePannello.lista.querySelector("[aria-selected=true]")||indietro).focus({preventScroll:true});
}
function archivioChiudi(){
  if(!lorePannello)return;
  window.removeEventListener("keydown",loreTastiera,true);
  lorePannello.el.remove();lorePannello=null;
  loreSuono("click");
  try{if(state)save();}catch{}
  try{lorePrecedente?.focus?.({preventScroll:true});}catch{}
  lorePrecedente=null;
}
function loreSezione(){return loreSt().tab;}
function loreDisegna(selezionaId,rivela){
  const p=lorePannello;if(!p||!state)return;
  const s=loreSt(),tutte=loreVoci();
  const [got,tot]=archivioConta();
  p.conto.replaceChildren();
  const num=loreEl("span");num.append(loreEl("b",null,String(got)),"/"+tot);
  const barra=loreEl("span","ga-barra"),riempi=document.createElement("i");riempi.style.width=Math.round(got/tot*100)+"%";barra.append(riempi);
  p.conto.append(num,barra);
  p.conto.setAttribute("aria-label",got+" voci su "+tot);
  if(selezionaId){const e=loreVoce(selezionaId);if(e)s.tab=e.sec;}
  p.tabs.replaceChildren();
  for(const [id,nome] of loreSezioni){
    const voci=tutte.filter(e=>e.sec===id),n=voci.filter(e=>s.got.includes(e.id)).length;
    const b=loreEl("button","ga-tab");b.type="button";b.setAttribute("role","tab");b.dataset.tab=id;
    b.setAttribute("aria-selected",String(id===s.tab));
    b.append(nome,loreEl("small",null,n+"/"+voci.length));
    b.onclick=()=>{s.tab=id;loreSuono("click");loreDisegna();};
    p.tabs.append(b);
  }
  const voci=tutte.filter(e=>e.sec===s.tab);
  let sel=selezionaId&&voci.some(e=>e.id===selezionaId)?selezionaId:(s.sel[s.tab]&&voci.some(e=>e.id===s.sel[s.tab])?s.sel[s.tab]:voci[0].id);
  s.sel[s.tab]=sel;
  p.lista.replaceChildren();
  for(const e of voci){
    const sbloccata=s.got.includes(e.id),nuova=s.nuovi.includes(e.id);
    const li=loreEl("li");li.setAttribute("role","presentation");
    const b=loreEl("button","ga-voce"+(sbloccata?"":" ga-chiusa")+(nuova?" ga-nuovo":"")+(nuova&&rivela?" ga-rivela":""));
    b.type="button";b.dataset.id=e.id;b.dataset.sec=e.sec;b.setAttribute("role","option");
    b.setAttribute("aria-selected",String(e.id===sel));
    b.setAttribute("aria-label",sbloccata?e.t+(nuova?", nuova":""):"Voce ancora bloccata");
    b.append(loreEl("span",null,sbloccata?e.t:"???"));
    b.onclick=()=>{loreSeleziona(e.id);};
    b.onfocus=()=>{if(s.sel[s.tab]!==e.id)loreSeleziona(e.id,true);};
    li.append(b);p.lista.append(li);
  }
  loreDettaglio(sel);
  const attivo=p.lista.querySelector("[aria-selected=true]");
  if(attivo&&(selezionaId||rivela))attivo.scrollIntoView({block:"nearest"});
}
function loreSeleziona(id,dalFuoco){
  const p=lorePannello;if(!p)return;
  const s=loreSt(),e=loreVoce(id);if(!e)return;
  s.sel[e.sec]=id;
  if(s.nuovi.includes(id)){s.nuovi=s.nuovi.filter(x=>x!==id);}
  for(const b of p.lista.querySelectorAll(".ga-voce")){
    const on=b.dataset.id===id;
    b.setAttribute("aria-selected",String(on));
    if(on){b.classList.remove("ga-nuovo");if(!dalFuoco){b.focus({preventScroll:true});}}
  }
  loreDettaglio(id);
  if(!dalFuoco)loreSuono("click");
}
function loreDettaglio(id){
  const p=lorePannello;if(!p)return;
  const s=loreSt(),e=loreVoce(id);if(!e)return;
  const sbloccata=s.got.includes(id);
  p.dett.replaceChildren();
  p.dett.append(loreEl("span","ga-sez",loreSezioni.find(x=>x[0]===e.sec)[1]));
  if(sbloccata){
    p.dett.append(loreEl("h3",null,e.t));
    for(const par of e.x.split("\n\n"))p.dett.append(loreEl("p",null,par));
  }else{
    p.dett.append(loreEl("h3",null,"???"));
    const ombra=loreEl("div","ga-ombra");ombra.setAttribute("aria-hidden","true");
    for(let i=0;i<4;i++)ombra.append(document.createElement("i"));
    p.dett.append(ombra,loreEl("p","ga-vuoto","Voce ancora da scoprire."),loreEl("div","ga-indizio","Indizio: "+e.h));
  }
  p.dett.scrollTop=0;
}
function loreTastiera(ev){
  const p=lorePannello;if(!p)return;
  if(ev.ctrlKey||ev.metaKey||ev.altKey)return;
  const k=ev.key,s=loreSt();
  const tieni=()=>{ev.preventDefault();ev.stopImmediatePropagation();};
  const voci=loreVoci().filter(e=>e.sec===s.tab);
  const indice=()=>Math.max(0,voci.findIndex(e=>e.id===s.sel[s.tab]));
  const vai=i=>{loreSeleziona(voci[Math.min(voci.length-1,Math.max(0,i))].id);};
  const cambia=d=>{
    const ids=loreSezioni.map(x=>x[0]);
    s.tab=ids[(ids.indexOf(s.tab)+d+ids.length)%ids.length];
    loreSuono("click");loreDisegna();
    (p.lista.querySelector("[aria-selected=true]")||p.indietro).focus({preventScroll:true});
  };
  if(k==="Tab"){ev.stopImmediatePropagation();return;}
  if(k==="Escape"||k==="Backspace"||k==="b"||k==="B"){tieni();archivioChiudi();return;}
  if(k==="ArrowLeft"||k==="a"||k==="A"){tieni();cambia(-1);return;}
  if(k==="ArrowRight"||k==="d"||k==="D"){tieni();cambia(1);return;}
  if(k==="ArrowUp"||k==="w"||k==="W"){tieni();vai(indice()-1);return;}
  if(k==="ArrowDown"||k==="s"||k==="S"){tieni();vai(indice()+1);return;}
  if(k==="Home"){tieni();vai(0);return;}
  if(k==="End"){tieni();vai(voci.length-1);return;}
  if(k==="PageUp"){tieni();vai(indice()-5);return;}
  if(k==="PageDown"){tieni();vai(indice()+5);return;}
  if(/^[1-4]$/.test(k)){tieni();s.tab=loreSezioni[Number(k)-1][0];loreSuono("click");loreDisegna();return;}
  if(k==="Enter"||k===" "||k==="e"||k==="E"){
    ev.stopImmediatePropagation();
    const a=document.activeElement;
    if(a instanceof HTMLButtonElement&&p.el.contains(a)){if(k==="e"||k==="E"){ev.preventDefault();a.click();}return;}
    ev.preventDefault();
    return;
  }
  ev.stopImmediatePropagation();
}
// Scorciatoia da tastiera: L apre l'Archivio mentre si esplora (il menu di pausa chiama archivioApri()).
window.addEventListener("keydown",ev=>{
  if((ev.key!=="l"&&ev.key!=="L")||ev.repeat||ev.ctrlKey||ev.metaKey||ev.altKey)return;
  if(lorePannello||screen!=="game"||!state||testMode)return;
  if(ev.target instanceof Element&&ev.target.closest("input,select,textarea,[contenteditable]:not([contenteditable=false])"))return;
  if(!exploringCampus())return;
  ev.preventDefault();archivioApri();
});
