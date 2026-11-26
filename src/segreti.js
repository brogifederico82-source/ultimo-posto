// Easter egg: segreti nascosti nel campus, collezione a schermo intero (segretiApri) e premi a soglie.
// Ganci nel resto del gioco (tutti minimi):
//  - world.js: installSegreti(map) aggiunge la stanza segreta "archivio-segreto" (zona nuova) e un punto di rientro;
//  - game.js interact(): segretiInteragisci(spot) conta gli esami ripetuti e le interazioni col paesaggio;
//  - dialogue.js getScene(): segretiScene() mostra la scena di un segreto; frame(): segretiPasso() dopo ogni passo
//    e tickSegreti(now) a ogni fotogramma (attese, orari, pulsante nel Diario);
//  - minigames.js endChallenge(): segretiFineSfida(g,result) per le vittorie perfette.
// Lo stato sta in state.segreti (creato al primo uso: i salvataggi vecchi continuano a funzionare).
// I segreti NON passano da discover(): quello gonfierebbe state.secrets, che alimenta il contatore del Diario di
// viaggio (16 scoperte). Il registro (record), l'effetto sonoro e i premi funzionano allo stesso modo.

// ---------------------------------------------------------------------------
// Mappa: stanza segreta (nessun cambio a campus.json). Usa solo costanti locali: viene chiamata all'avvio.
// ---------------------------------------------------------------------------
function installSegreti(map){
  const garden=map?.zones?.giardino;
  if(!garden||map.zones["archivio-segreto"])return map;
  if(!garden.objects.some(o=>o.uid==="segreti-ritorno")){
    garden.objects.push({uid:"segreti-ritorno",kind:"entrance",name:"Ritorno dall’Archivio",x:58,y:59,w:1,h:1});
  }
  map.zones["archivio-segreto"]={name:"Archivio dei fuoricorso · Stanza segreta",width:16,height:10,ground:"floor",objects:[
    {uid:"segreti-arrivo",kind:"entrance",name:"Ingresso",x:8,y:8,w:1,h:1,target:"campus"},
    {uid:"segreti-uscita",kind:"door",name:"Torna al muro delle firme",x:8,y:9,w:1,h:1,action:"portal",target:"giardino#segreti-ritorno"},
    {uid:"segreti-scaffale-1",kind:"shelf",name:"Scaffale di verbali",x:1,y:1,w:5,h:1,solid:true},
    {uid:"segreti-scaffale-2",kind:"shelf",name:"Scaffale di verbali",x:10,y:1,w:5,h:1,solid:true},
    {uid:"segreti-scrivania",kind:"desk",name:"Scrivania dell’archivista",x:6,y:3,w:4,h:1,solid:true},
    {uid:"segreti-registro",kind:"sign",name:"Registro degli appelli",x:7,y:4,w:1,h:1,color:"#d1ae72",action:"dialog",text:""},
    {uid:"segreti-teca",kind:"sign",name:"Teca con un anello",x:12,y:4,w:1,h:1,color:"#e0b44f",action:"dialog",text:""}
  ]};
  return map;
}

// ---------------------------------------------------------------------------
// Icone pixel-art 8x8 (# colore, d scuro, w chiaro)
// ---------------------------------------------------------------------------
const SG_ICONE={
  foglia:["....##..","..#####.",".#######","#######.","d#####..",".d####..","..d.....","..d....."],
  goccia:["...##...","...##...","..####..",".######.",".#w####.",".######.","..####..","........"],
  albero:["..####..",".######.","########","#w######",".######.","...dd...","...dd...","...dd..."],
  uccello:["........","..##....",".####.##","#######.","w######.",".#####..","..d.d...",".d..d..."],
  chiave:["..####..",".#....#.",".#....#.","..####..","...##...","...##d..","...##...","...###.."],
  libro:["........",".######.","#dwwww#.","#dwwww#.","#dwwww#.","#dwwww#.",".######.","........"],
  anello:["..wwww..",".w....w.","w......w","w......w",".w....w.","..wwww..","...##...","........"],
  moneta:["..####..",".#wwww#.","#w#dd#w#","#w#dd#w#","#w#dd#w#","#w#dd#w#",".#wwww#.","..####.."],
  lampada:[".######.","#wwwwww#","#wwwwww#",".######.","...dd...","...dd...","...dd...","..dddd.."],
  panca:["........","########","########","#d####d#","#d####d#","#d....d#","#d....d#","........"],
  cinghiale:["........","..d..d..",".######d","########","########","########",".#d..#d.",".d....d."],
  radio:["......d.",".....d..","########","#wwww#d#","#wwww###","#wwww#d#","########","........"],
  auto:["........","..####..",".######.","########","#w####w#","########",".dd..dd.","........"],
  bus:["########","#wwwwww#","#wwwwww#","########","########","########",".dd..dd.","........"],
  pillola:["..####..",".######.","########","########","dddddddd","dddddddd",".dddddd.","..dddd.."],
  luna:["..####..",".##.....","##......","##......","##......",".##.....","..####..","........"],
  stella:["...##...","...##...","########",".######.","..####..",".##..##.","##....##","........"],
  tazza:["........","#######.","#wwwww##","#wwwww#.","#wwwww#.",".#####..","dddddddd","........"],
  porta:[".######.","#dddddd#","#d#..#d#","#dddddd#","#d#..#d#","#dddddd#","#dddddd#","########"],
  joystick:["...##...","...##...","...##...","..####..",".######.","########","#d#dd#d#","########"],
  corona:["#..##..#","##.##.##","########","#wwwwww#","########","........","........","........"],
  clessidra:["########",".#wwww#.","..#ww#..","...##...","...##...","..#dd#..",".#dddd#.","########"],
  occhio:["........","..####..",".#wwww#.","#w#dd#w#",".#wwww#.","..####..","........","........"],
  cappello:["........","..####..","..####..","..####..","########","########","........","........"],
  tubo:["..####..","..#dd#..","..#dd#..","########","#wwwwww#","..#dd#..","..#dd#..","..####.."]
};
const SG_LIVELLI=["","facile","medio","durissimo"];

// ---------------------------------------------------------------------------
// Elenco dei segreti. tipo: tile | esamina (conteggio consecutivo) | cammino | attesa | altro (logica dedicata)
// modo: "scena" (si apre una scena, solo da interazione) | "avviso" (banner, non blocca mai il gioco)
// ---------------------------------------------------------------------------
const segretiLista=[
  // --- Luoghi nascosti (basta camminarci sopra)
  {id:"cantuccio-orto",nome:"Il cantuccio dell’orto",liv:2,icona:"foglia",col:"#8fbf6a",tipo:"tile",z:"giardino",x:22,y:10,monete:3,modo:"avviso",
   indizio:"Nell’angolo più a nord-ovest, dove il campus fa finta di finire, qualcuno ha dimenticato un pezzo di prato.",
   dove:"Giardino, tessera (22,10): vicolo cieco a nord-ovest.",
   testo:"Un cantuccio che non compare sulla mappa. Qui il prato è perfettamente curato, segno che il giardiniere ci viene a piangere in segreto."},
  {id:"dietro-fontana",nome:"Dietro la fontana",liv:2,icona:"goccia",col:"#6fb7d8",tipo:"tile",z:"giardino",x:12,y:34,monete:3,modo:"avviso",
   indizio:"Anche le fontane hanno un retro. Quella a ovest, dalla parte dove il fuoricorso fa le sue apparizioni.",
   dove:"Giardino, tessera (12,34): la nicchia a ovest della fontana del giardino.",
   testo:"Dietro la fontana si sente solo il rumore dell’acqua. Sul bordo, una moneta incollata: serve a ricordare che l’unico investimento sicuro è la fontana."},
  {id:"albero-solitario",nome:"L’albero che guarda il campo",liv:2,icona:"albero",col:"#6fa86b",tipo:"tile",z:"giardino",x:8,y:55,monete:3,modo:"avviso",
   indizio:"Un albero solitario a ovest del campo sportivo ha un lato dove nessuno passa. Va’ a vedere cosa guarda.",
   dove:"Giardino, tessera (8,55): sopra l’albero a ovest del campo sportivo.",
   testo:"L’albero guarda il campo da anni e ha capito tutto di calcetto: «Si perde sempre per un millimetro, ed è sempre colpa del vento». Ti lascia una foglia che dice «bravo».",},
  {id:"pini-panama",nome:"Il nido sotto i pini di Via Panama",liv:2,icona:"uccello",col:"#d9a66a",tipo:"tile",z:"giardino",x:84,y:58,monete:3,modo:"avviso",
   indizio:"All’estremo est, oltre la navetta, c’è una tessera di terra battuta dove il rumore del viale non arriva.",
   dove:"Giardino, tessera (84,58): vicolo cieco a est, oltre la fermata della navetta.",
   testo:"Un angolo tranquillo, dietro le pensiline: il posto perfetto per rispondere «sto arrivando» a un messaggio di venti minuti fa."},
  // --- La stanza segreta e il suo contenuto
  {id:"muro-firme",nome:"Il muro che cede",liv:2,icona:"porta",col:"#c9a063",tipo:"esamina",uid:"ca-murales",n:6,monete:4,modo:"scena",
   indizio:"Il muro delle firme ne ha viste tante. Se ti fermi a leggerlo con pazienza, sei volte, forse una firma cede.",
   dove:"Giardino, “Muro delle firme” (58,58): premere E sei volte di seguito. Si entra nell’Archivio dei fuoricorso.",
   testo:"Alla sesta lettura una firma si abbassa come una maniglia. Il muro si apre su una stanza piena di scaffali e di polvere accademica. Una targa recita: «Archivio dei fuoricorso. Si prega di non chiedere l’appello».",
   scelte:()=>[["Entra nella stanza",()=>{travel("archivio-segreto","segreti-arrivo");}],["Resta fuori, per ora",null]]},
  {id:"registro-appelli",nome:"Il registro degli appelli",liv:2,icona:"libro",col:"#b88a56",tipo:"altro",monete:3,modo:"scena",
   indizio:"Nell’archivio c’è un libro che non dovrebbe esistere. Leggilo.",
   dove:"Archivio segreto: sul registro (E).",
   testo:"Il registro contiene tutti gli appelli mai fissati e mai tenuti. L’ultima riga è scritta a matita: «Prossimo appello: quando il Rettorato si sveglierà».",},
  {id:"anello-appello",nome:"Un anello per l’appello",liv:2,icona:"anello",col:"#f1c453",tipo:"altro",monete:3,modo:"scena",oggetto:"Anello dell’appello",
   indizio:"Nell’archivio qualcuno custodisce un gioiello in una teca. Dice «tanto per far capire chi comanda».",
   dove:"Archivio segreto: teca con l’anello (E).",
   testo:"Sotto il vetro c’è un anello d’oro con un’incisione quasi illeggibile: «Un solo appello per domarli tutti, e nel prossimo semestre legarli». Lo prendi con rispetto, e con un guanto di carta.",},
  {id:"fantasma-firma",nome:"Il fantasma ha firmato",liv:3,icona:"stella",col:"#c9c2ff",tipo:"altro",monete:5,modo:"avviso",
   indizio:"Chi ha già incontrato il fantasma del fuoricorso dovrebbe tornare a rileggere un certo libro.",
   dove:"Archivio segreto: leggere il registro dopo aver incontrato il Fantasma del fuoricorso (tessera (13,39) del giardino).",
   testo:"Sul registro, a pagina 1987, c’è una firma nuova: «Ho portato gli appunti. — Il Fantasma». Accanto, un timbro: «Appello superato (con riserva)»."},
  {id:"codice-nel-codice",nome:"Il codice dentro il codice",liv:3,icona:"joystick",col:"#f0a0d0",tipo:"altro",monete:6,modo:"avviso",
   indizio:"Il codice più celebre dei videogiochi funziona anche in una stanza che non c’è. Basta che nessuno guardi.",
   dove:"Archivio segreto: digitare il codice classico (↑ ↑ ↓ ↓ ← → ← → B A) dentro la stanza.",
   testo:"Gli scaffali tremano e un verbale si trasforma in un trofeo: «Hai trovato un segreto dentro un segreto. Il bibliotecario, offeso, si dimette in modo teatrale»."},
  // --- Camminate speciali
  {id:"lampione-orario",nome:"Il giro del lampione",liv:2,icona:"lampada",col:"#f4d27a",tipo:"cammino",ob:"interno-lamp-3",dir:1,monete:3,modo:"avviso",
   indizio:"Nel cortile dei professori un lampione ama essere girato intorno. In senso orario, come le lancette del ritardo.",
   dove:"Giardino, lampione del cortile dei professori (58,69): un giro completo in senso orario.",
   testo:"Il lampione si accende per un attimo, come un applauso. Un professore alla finestra ti guarda e segna una crocetta: «partecipazione attiva»."},
  {id:"lampione-antiorario",nome:"Il giro al contrario",liv:2,icona:"lampada",col:"#9ad0f0",tipo:"cammino",ob:"interno-lamp-0",dir:-1,monete:3,modo:"avviso",
   indizio:"Sotto i pini, un altro lampione preferisce il verso opposto: contro le lancette, come la media di chi si pente.",
   dove:"Giardino, lampione tra i tavoli sotto i pini (29,21): un giro completo in senso antiorario.",
   testo:"Il lampione sfarfalla di sollievo: nessuno lo girava così dal 2011. L’ombra sul prato fa un inchino, uno solo, pieno di dignità."},
  {id:"girotondo-fontana",nome:"Girotondo alla fontana",liv:2,icona:"goccia",col:"#6fd0c0",tipo:"cammino",ob:"acqua-romania-piazzale",dir:-1,monete:4,modo:"avviso",
   indizio:"La fontana del piazzale esaudisce un desiderio se le giri intorno, tutta, contro il senso delle lancette.",
   dove:"Giardino, fontana del piazzale (63,51): un giro completo in senso antiorario.",
   testo:"Un getto più alto degli altri: la fontana ti saluta con un fiotto. Sul fondo compare, per un attimo, un segnalibro: «Ripasso a sorpresa, pagina 12»."},
  {id:"aspettando-360",nome:"Aspettando il 360",liv:2,icona:"bus",col:"#e07b5a",tipo:"attesa",ob:"viale-bus-360-stop",raggio:2,sec:20,monete:3,modo:"avviso",
   indizio:"Alla fermata del 360, il bus arriva solo quando ti rassegni. Fermati e aspetta, senza guardare l’orologio.",
   dove:"Viale Romania, fermata “Fermata Romania · 360”: restare fermi venti secondi vicino al cartello.",
   testo:"Dopo venti secondi di dignitosa attesa il tabellone cambia: «360 · In arrivo… in un’altra vita». Un piccione sul palo annuisce, in segno di solidarietà."},
  {id:"pisolino-panchina",nome:"Il pisolino in panchina",liv:2,icona:"luna",col:"#a7b4e8",tipo:"attesa",ob:"campus-bench-5",raggio:1,sec:20,monete:3,modo:"avviso",
   indizio:"La panchina più a sud, vicino alle aiuole del piazzale, funziona meglio di un materasso. Basta stare fermi.",
   dove:"Giardino, panchina sud (68,80): restare fermi venti secondi accanto alla panchina.",
   testo:"Per venti secondi dimentichi l’esame, il tornello e il gruppo del corso. Poi il telefono vibra: «Sei vivo?». Rispondi: «Sì, ma solo in senso accademico»."},
  // --- Conversazioni e reazioni insolite
  {id:"redazione-completa",nome:"La redazione al completo",liv:2,icona:"radio",col:"#e8b86a",tipo:"altro",monete:4,modo:"avviso",
   indizio:"Chi parla in radio, chi tiene la regia, chi studia la società: saluta loro in quest’ordine, uno dopo l’altro, senza distrarti con nessun altro.",
   dove:"Giardino: parlare con Tommaso (Radio Luiss), poi Greta (regia), poi la Prof.ssa Mameli, senza interazioni in mezzo.",
   testo:"Tommaso annuncia, Greta mette la sigla, Mameli commenta: «Un fatto sociale perfettamente riuscito». Per un istante, dall’altoparlante, esce un applauso registrato solo per te."},
  {id:"cinque-saluti",nome:"Cinque saluti alla guardia",liv:2,icona:"occhio",col:"#8fa6c2",tipo:"altro",monete:3,modo:"avviso",
   indizio:"Salutare la guardia una volta è educazione, due è insistenza, cinque è un messaggio. Prova senza distrarti.",
   dove:"Viale Romania: parlare con la guardia cinque volte di fila.",
   testo:"Alla quinta volta la guardia sospira e ti porge una caramella alla menta: «Il regolamento non dice niente sulle caramelle. Ma nemmeno sul resto, a pensarci»."},
  {id:"piuma-allorto",nome:"La piuma dello spaventapasseri",liv:3,icona:"foglia",col:"#d5d1c4",tipo:"altro",monete:6,modo:"avviso",oggetto:"Spaventapasseri in miniatura",
   indizio:"Una piuma lasciata da un piccione trattativista, portata al cartello dell’orto, vale più di mille monete.",
   dove:"Giardino, cartello “Orto Luiss” (32,11): premere E con la “Piuma del piccione” in tasca (si ottiene offrendo metà panino al piccione durante l’evento casuale).",
   testo:"Appoggi la piuma sul cartello dell’orto: tre zucchine si voltano, riconoscenti. Dal nulla compare uno spaventapasseri in miniatura, con la scritta: «Non spavento più nessuno, ma ho esperienza»."},
  {id:"gigi-zampa",nome:"La zampa di Gigi",liv:2,icona:"cinghiale",col:"#9a7b5f",tipo:"esamina",uid:"va-gigi",n:3,monete:3,modo:"avviso",
   indizio:"Il cinghiale pacifico di Villa Ada non è sempre scontroso. Se gli parli con costanza, tre volte, ti darà qualcosa di inatteso.",
   dove:"Villa Ada: parlare tre volte di fila con Gigi.",
   testo:"Gigi, alla terza volta, ti porge la zampa con la serietà di un notaio. Non è proprio una stretta di mano, ma tra suidi è un contratto."},
  // --- Oggetti da esaminare più volte
  {id:"cestino-filosofico",nome:"Il cestino che restituisce",liv:2,icona:"tazza",col:"#9fbfa6",tipo:"esamina",uid:"ca-cestino",n:5,monete:3,modo:"scena",
   indizio:"Il cestino filosofico ama chi non si accontenta della prima risposta. Cinque domande, cinque volte lo stesso cestino.",
   dove:"Giardino, “Cestino filosofico” (56,58): premere E cinque volte di seguito.",
   testo:"Alla quinta volta il cestino emette un tintinnio. Dentro, una pallina di carta con scritto: «Chi getta il pensiero, lo ritrova al ricevimento». Sotto c’era una moneta, la solita."},
  {id:"riflesso-ritardatario",nome:"Il riflesso in ritardo",liv:2,icona:"occhio",col:"#b0c4d8",tipo:"esamina",uid:"ca-specchio",n:3,monete:3,modo:"scena",
   indizio:"Lo specchio del corridoio ti guarda: se lo guardi tre volte, ti dice qualcosa che non voleva dire.",
   dove:"Giardino, “Specchio del corridoio” (62,58): premere E tre volte di seguito.",
   testo:"Alla terza occhiata il tuo riflesso resta fermo mentre tu ti sposti, poi ti raggiunge con aria di scuse: «Scusa, ero in ritardo». Anche i riflessi, qui, hanno gli appelli."},
  {id:"annuncio-impossibile",nome:"L’annuncio impossibile",liv:2,icona:"libro",col:"#d8c58f",tipo:"esamina",uid:"ca-bacheca-impossibile",n:3,monete:3,modo:"scena",
   indizio:"La bacheca degli annunci impossibili ne tiene uno ancora più impossibile sotto gli altri. Rileggila tre volte.",
   dove:"Giardino, “Bacheca degli annunci impossibili” (27,52): premere E tre volte di seguito.",
   testo:"Sotto i soliti volantini ne spunta uno scritto a mano: «Cercasi studente che dica la verità sul programma. Offresi pasta, in mensa, la prima sera di luna piena». Il numero è senza prefisso."},
  {id:"uovo-di-merlo",nome:"L’uovo nel nido",liv:2,icona:"uccello",col:"#e8e0c4",tipo:"esamina",uid:"villa-ada-nido",n:5,monete:3,modo:"scena",
   indizio:"I merli di Villa Ada custodiscono qualcosa. Se osservi il nido con pazienza, cinque volte, forse ti fidano.",
   dove:"Villa Ada, “Nido di merli”: premere E cinque volte di seguito.",
   testo:"Alla quinta osservazione scorgi un uovo azzurro, perfetto. Subito si sente un merlo indignato dai rami: «Non è un uovo, è un progetto di gruppo non ancora consegnato». Lo lasci dov’è."},
  {id:"sono-dietro-di-te",nome:"Sono dietro di te",liv:2,icona:"cinghiale",col:"#a98863",tipo:"esamina",uid:"villa-ada-cartello",n:3,monete:3,modo:"scena",
   indizio:"Il cartello dei cinghiali, a leggerlo troppe volte, comincia a rispondere. Tre letture bastano.",
   dove:"Villa Ada, “Attenzione cinghiali”: premere E tre volte di seguito.",
   testo:"Alla terza lettura, sotto la scritta, compare a pennarello: «(Sono dietro di te)». Ti volti: è solo un cespuglio. Dal cespuglio, un grugnito di cortesia."},
  {id:"pagina-col-tuo-nome",nome:"La pagina col tuo nome",liv:2,icona:"libro",col:"#c9b27c",tipo:"esamina",uid:"villa-ada-cassetta",n:4,monete:3,modo:"scena",
   indizio:"La cassetta degli appunti smarriti, se ci frughi quattro volte, trova ciò che cercavi senza saperlo.",
   dove:"Villa Ada, “Cassetta degli appunti smarriti”: premere E quattro volte di seguito.",
   testo:"Al quarto tentativo trovi una pagina di appunti con il tuo nome in cima e un solo, bellissimo, titolo: «Come non perdere gli appunti». Il resto della pagina è bianco, come tradizione."},
  {id:"pinna-laghetto",nome:"Ci vuole una barca più grande",liv:2,icona:"goccia",col:"#5fa0b8",tipo:"esamina",uid:"villa-ada-laghetto",n:3,monete:3,modo:"scena",
   indizio:"Nel laghetto di Villa Ada, se lo guardi tre volte, qualcosa emerge. Una citazione rimane affettuosamente tra le righe.",
   dove:"Villa Ada, “Laghetto di Villa Ada”: premere E tre volte di seguito.",
   testo:"Alla terza occhiata una pinna fende l’acqua, con musica minacciosa che non sai da dove arrivi. Poi la pinna si rivela una zucchina sfuggita all’orto. «Ci vuole una barca più grande», mormori. O un’insalata."},
  {id:"tubo-verde",nome:"Il tubo verde",liv:2,icona:"tubo",col:"#5cbf6b",tipo:"esamina",uid:"dome2-vent-sign",n:4,monete:3,modo:"scena",
   indizio:"Le prese d’aria della Serra assomigliano a un tubo che ogni idraulico baffuto vorrebbe prendere al volo. Quattro osservazioni.",
   dove:"Giardino, “Prese d’aria della Serra” (14,59): premere E quattro volte di seguito.",
   testo:"Alla quarta osservazione senti dentro il tubo un tintinnio ritmico, come di monete che saltano. Un cartello a matita: «Non è un tubo, è una scorciatoia fuori servizio»."},
  {id:"tornello-fidget",nome:"Il tornello fidget",liv:2,icona:"stella",col:"#dfa86a",tipo:"esamina",uid:"viale-ingresso-varco",n:5,monete:3,modo:"avviso",
   indizio:"Una volta passato, il tornello gira bene. Cinque colpetti di fila e capisci perché la guardia sospira.",
   dove:"Viale Romania, “Tornello” (23,75): a varco aperto, premere E cinque volte di seguito.",
   testo:"Il tornello gira per inerzia, poi di nuovo, poi con aria di sfida. La guardia, da lontano, non ti guarda. Ti guarda eccome."},
  {id:"cabina-blu",nome:"Più grande all’interno",liv:2,icona:"porta",col:"#4a78c8",tipo:"esamina",uid:"viale-romania-255",n:3,monete:4,modo:"scena",
   indizio:"La guardiola del viale sembra piccola. Se bussi tre volte, forse scopri che dentro è molto più grande. O almeno così dicono.",
   dove:"Viale Romania, “Guardiola” (15,75): rivolti verso la guardiola, premere E tre volte di seguito.",
   testo:"Alla terza bussata dall’interno viene un suono come di ottoni e di vecchi motori. Poi una voce: «Qui dentro è molto più grande». Un attimo dopo: «Ma c’è solo un tornello». La guardiola smette di vibrare, imbarazzata."},
  {id:"pillola-blu",nome:"Pillola blu o pillola rossa",liv:2,icona:"pillola",col:"#e05a5a",tipo:"esamina",uid:"viale-romania-253",n:3,monete:3,modo:"scena",
   indizio:"Il pilastro con l’urna ha un’aria cospiratoria. Se lo interroghi tre volte, ti offre una scelta classica.",
   dove:"Viale Romania, “Pilastro con urna” (18,77): rivolti verso il pilastro, premere E tre volte di seguito.",
   testo:"L’urna si apre: dentro due pastiglie di zucchero, una blu e una rossa. Un biglietto: «La blu: torni a studiare e credi a ciò che vuoi. La rossa: scopri quanto è profonda la tana del programma». Le lasci dov’erano. Sono caramelle vecchie."},
  // --- Paesaggio
  {id:"primo-sorso",nome:"Il primo sorso",liv:1,icona:"goccia",col:"#7fc4e8",tipo:"altro",monete:2,modo:"scena",
   indizio:"Roma ti offre acqua gratis ogni cento metri. Basta chiedere a un nasone.",
   dove:"Viale Romania: premere E davanti a un nasone.",
   testo:"Acqua fresca, anche se il tubo è un po’ storto. Rinfrancato, ti senti pronto ad affrontare un appello a sorpresa."},
  {id:"sette-colli",nome:"I sette colli",liv:3,icona:"corona",col:"#e0b76a",tipo:"altro",monete:8,modo:"avviso",oggetto:"Borraccia dei sette colli",
   indizio:"Roma ha sette colli e il viale ha sette nasoni. Bevi a tutti, tutti e sette, senza saltarne uno.",
   dove:"Viale Romania e dintorni: bere (E) a tutti e sette i nasoni.",
   testo:"Il settimo sorso chiude il cerchio: l’acqua ha un sapore di marmo, di fretta e di pomeriggio. Un vecchio romano ti passa una borraccia: «Adesso sei dei nostri, anche se non hai capito l’autobus»."},
  {id:"moneta-fontana",nome:"Un desiderio per tre monete",liv:2,icona:"moneta",col:"#e8c458",tipo:"altro",monete:3,modo:"scena",
   indizio:"Davanti a una fontana del campus, con una moneta in tasca, si può esprimere un desiderio. Non sempre torna tutto uguale.",
   dove:"Giardino: premere E davanti a una fontana (quelle senza dialogo), con almeno una moneta, e lanciarla.",
   testo:"La moneta fa «plin», poi dal fondo ne risalgono tre, bagnate ma valide. Un cartello galleggia: «Interessi della fontana: 200%. Non dirlo al Rettorato»."},
  {id:"foglia-del-28",nome:"La foglia del 28",liv:2,icona:"foglia",col:"#9bc668",tipo:"altro",monete:3,modo:"scena",oggetto:"Foglia con il voto",
   indizio:"Gli alberi del campus ascoltano le preghiere dei fuoricorso. Se ne scuoti uno con cortesia, tre volte, ti risponde.",
   dove:"Giardino: premere E tre volte di seguito davanti a un albero del campus.",
   testo:"Alla terza scrollata cade una foglia con un numero a matita: «28». Non è il voto, è il numero della tua prossima aula. Ma tu preferisci crederci."},
  {id:"lampione-ammicca",nome:"Il lampione che ammicca",liv:2,icona:"lampada",col:"#f2d36a",tipo:"altro",monete:3,modo:"scena",
   indizio:"A forza di essere ignorato, un lampione si offende. Dagli retta sette volte di seguito, senza spostarti.",
   dove:"Giardino: premere E sette volte di seguito davanti allo stesso lampione.",
   testo:"Alla settima attenzione il lampione si accende e si spegne, una, due volte, come chi ti fa l’occhiolino. Poi torna serio, perché un lampione non ha tempo da perdere."},
  {id:"clacson-sigla",nome:"La sigla del clacson",liv:2,icona:"auto",col:"#e0705a",tipo:"altro",monete:3,modo:"scena",
   indizio:"Le auto del car sharing, parcheggiate vicino a Via Panama, sono musicali se le tocchi con ritmo: tre volte, sempre la stessa.",
   dove:"Giardino, auto del car sharing (66,44): rivolti verso l’auto, premere E tre volte di seguito.",
   testo:"Tre colpetti sul cofano e il clacson attacca una sigla che conosci a memoria, ma non sai di dove. Le altre auto, in coro, rispondono con un bip. Un piccione applaude."},
  {id:"rosa-dei-venti",nome:"La rosa dei venti",liv:3,icona:"stella",col:"#90d4b0",tipo:"altro",monete:6,modo:"avviso",
   indizio:"Il campus ha quattro estremi: l’orto a nord, i pini a est, le botteghe a sud, Villa Ada a ovest. Toccali tutti.",
   dove:"Giardino: raggiungere i quattro estremi, orto (35,11), pini di Via Panama (83,14), botteghe del viale (66,100), cancello di Villa Ada (11,40).",
   testo:"Chiudi il giro del campus. Da qualche parte una bussola gira per conto suo e si ferma: indica sempre l’aula in cui non devi essere."},
  // --- Codici da tastiera
  {id:"modalita-fuoricorso",nome:"Modalità fuoricorso",liv:2,icona:"joystick",col:"#f08fe0",tipo:"altro",monete:5,modo:"avviso",
   indizio:"Il codice più celebre dei videogiochi: quattro frecce, due volte, e poi due lettere vicine all’inizio dell’alfabeto.",
   dove:"Qualsiasi momento nel gioco: ↑ ↑ ↓ ↓ ← → ← → B A.",
   testo:"Per qualche secondo il campus si colora come un cartone animato: è la «modalità fuoricorso». Nessuno sa a cosa serva, ma tutti la rimpiangeranno quando finirà."},
  {id:"non-succede-nulla",nome:"Non succede nulla",liv:2,icona:"clessidra",col:"#c8c0a0",tipo:"altro",monete:2,modo:"avviso",
   indizio:"Un’antica parola magica da avventure testuali, cinque lettere senza senso. Scrivila sulla tastiera e non aspettarti miracoli.",
   dove:"Qualsiasi momento: digitare x y z z y.",
   testo:"Non succede nulla. Poi, molto lontano, un tornello fa «clic». Per un attimo tutto il campus trattiene il fiato, poi riprende a parlare di appelli."},
  {id:"sigla-luiss",nome:"Le cinque lettere",liv:2,icona:"libro",col:"#e8b96a",tipo:"altro",monete:2,modo:"avviso",
   indizio:"Il nome del posto dove sei, scritto sulla tastiera, lettera per lettera, senza fretta.",
   dove:"Qualsiasi momento: digitare l u i s s.",
   testo:"L, U, I, S, S: cinque lettere, due S, zero posti liberi in aula. Dalle mura sale un coro soddisfatto di studenti che mangiano il panino in piedi."},
  // --- Orario
  {id:"mezzanotte-dome",nome:"Mezzanotte alla piazzetta",liv:3,icona:"luna",col:"#9aa6f0",tipo:"attesa",ob:"meeting-plaza",raggio:2,sec:10,monete:8,modo:"avviso",
   indizio:"Quando scocca la mezzanotte, la piazzetta del Dome ha qualcosa da dire a chi sa aspettare, fermo, per un po’.",
   dove:"Giardino, “Piazzetta del Dome” (55,54): restare fermi dieci secondi entro un quarto d’ora dopo la mezzanotte (ora del dispositivo).",
   testo:"A mezzanotte in punto la cupola del Dome sussurra una frase sola: «Hai ripassato?». Poi tace, soddisfatta, come chi sa già la risposta."},
  // --- Minigiochi
  {id:"ritmo-impeccabile",nome:"Ritmo impeccabile",liv:2,icona:"joystick",col:"#f0b0e0",tipo:"altro",monete:4,modo:"avviso",
   indizio:"Nel trend di ballo non serve fare quattro su cinque: l’estetica vuole cinque su cinque.",
   dove:"Trend di ballo (creator): vincere senza sbagliare nemmeno una mossa (5/5).",
   testo:"Cinque mosse, cinque tempi perfetti: i creator ti propongono uno sponsor che vende solo borracce."},
  {id:"presa-d-acciaio",nome:"Presa d’acciaio",liv:2,icona:"stella",col:"#e08a60",tipo:"altro",monete:4,modo:"avviso",
   indizio:"Al braccio di ferro con Riccardo, vincere vale una rivincita; vincere senza mai cedere un round vale di più.",
   dove:"Braccio di ferro (Riccardo): vincere 2-0.",
   testo:"Riccardo ti guarda con rispetto e prende appunti. «Se mi batti 2-0 mi devi anche un integratore», mormora."},
  {id:"cappotto-ping-pong",nome:"Cappotto al ping pong",liv:3,icona:"stella",col:"#f0d060",tipo:"altro",monete:6,modo:"avviso",
   indizio:"Sette punti a zero: la racchetta non fa prigionieri e il bar si ferma a guardare.",
   dove:"Ping pong (terrazza): vincere 7-0.",
   testo:"Sette a zero: il pubblico, composto da due piccioni e un barista, si alza in piedi. Il barista, per rispetto, spegne la radio."},
  {id:"porta-inviolata",nome:"Porta inviolata",liv:3,icona:"porta",col:"#8fd09a",tipo:"altro",monete:6,modo:"avviso",
   indizio:"Il biliardino è un gioco di sponde. Vincere senza subire nemmeno un gol è un’altra storia.",
   dove:"Biliardino (terrazza): vincere 3-0.",
   testo:"Tre a zero senza subire: l’omino portiere ha il turno di notte, ma non lo disturbano mai. Viene promosso a «difensore di fiducia»."},
  {id:"sessanta-pari",nome:"Sessanta pari",liv:3,icona:"clessidra",col:"#c8a8e8",tipo:"altro",monete:6,modo:"avviso",
   indizio:"A briscola si vince oltre sessanta, si perde sotto. Chi ottiene esattamente la mezza via ha l’aria di aver fatto apposta.",
   dove:"Briscola: chiudere la partita in pareggio, 60 a 60.",
   testo:"Sessanta a sessanta: il tavolo tace. Poi uno dei Nullafacenti mormora «Pareggio tecnico» e distribuisce, per solidarietà, una carta in più che nessuno vuole."},
  {id:"mattoni-senza-ferite",nome:"Mattoni senza una ferita",liv:2,icona:"libro",col:"#e07b7b",tipo:"altro",monete:5,modo:"avviso",
   indizio:"Al LOFT, la palla rimbalza: ripulire il tabellone di Pixel Mattoni senza perdere neppure una delle tre vite.",
   dove:"Pixel Mattoni (LOFT): vincere senza perdere vite.",
   testo:"Tabellone pulito e tre vite intatte: il gioco ti scrive «Imbattibile» e poi «Ma ora studia». Il cabinato abbassa la voce."},
  {id:"cinque-a-zero",nome:"Cinque a zero sul calcetto",liv:3,icona:"stella",col:"#80d080",tipo:"altro",monete:6,modo:"avviso",
   indizio:"A calcetto bastano cinque gol, ma c’è chi lo fa senza subirne nemmeno uno.",
   dove:"Calcetto, The Dome 2 (Matteo): vincere 5-0.",
   testo:"Cinque a zero! Matteo applaude in ginocchio, poi chiede la rivincita. Gliela concedi, ma solo per educazione."}
];
const segretiPer=id=>segretiLista.find(e=>e.id===id);
const segretiTotale=()=>segretiLista.length;

// ---------------------------------------------------------------------------
// Premi a soglie (monete) e traguardi cosmetici del Diario delle scoperte
// ---------------------------------------------------------------------------
const segretiPremi=[
  {n:5,monete:3,nome:"3 monete di cassa"},{n:10,monete:5,nome:"5 monete e la spilla del segreto (Diario)"},
  {n:20,monete:8,nome:"8 monete"},{n:30,monete:10,nome:"10 monete e la tote bag dei cospiratori (Diario)"},
  {n:40,monete:12,nome:"12 monete e i mocassini invisibili (Diario)"},{n:()=>segretiTotale(),monete:25,nome:"25 monete e il titolo di Archivista del campus"}
];
ideeTraguardi.push(
  {id:"segreti-10",name:"Fiuto da segugio",desc:"Trova 10 segreti del campus",goal:10,val:()=>segretiConta(),reward:{name:"Spilla del segreto",field:"dettaglio",value:1}},
  {id:"segreti-30",name:"Cospiratore del campus",desc:"Trova 30 segreti del campus",goal:30,val:()=>segretiConta(),reward:{name:"Tote bag dei cospiratori",field:"zaino",value:3}},
  {id:"segreti-40",name:"Passo felpato",desc:"Trova 40 segreti del campus",goal:40,val:()=>segretiConta(),reward:{name:"Mocassini invisibili",field:"scarpe",value:2}},
  {id:"segreti-tutti",name:"Archivista del campus",desc:"Trova tutti i segreti",goal:()=>segretiTotale(),val:()=>segretiConta(),reward:null}
);

// ---------------------------------------------------------------------------
// Stato e utilità
// ---------------------------------------------------------------------------
function sg(){return (state.segreti??={trovati:{},premi:[],indizi:{},nasoni:[],panche:[],angoli:[],ordine:0});}
function segretiConta(){return state&&state.segreti?Object.keys(state.segreti.trovati).filter(id=>segretiPer(id)).length:0;}
function segretiTrovato(id){return Boolean(state?.segreti?.trovati?.[id]);}
function segretiAttivi(){return Boolean(state)&&screen==="game"&&!testMode&&!state.prologue&&!state.ending;}
const segretiOra=()=>typeof ideeHour==="function"?ideeHour():new Date().getHours();
function segretiData(){
  const o=window.segretiDataOverride;
  if(o)return {mese:o.mese,giorno:o.giorno};
  const d=new Date();return {mese:d.getMonth()+1,giorno:d.getDate()};
}
let segretiEv=null,segretiRecenti=[],segretiStorico=[],segretiFermoDa=0,segretiPos="",segretiBtnAt=0;
const segretiCodici=[
  {id:"modalita-fuoricorso",seq:["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"]},
  {id:"non-succede-nulla",seq:["x","y","z","z","y"]},
  {id:"sigla-luiss",seq:["l","u","i","s","s"]}
];
let segretiTasti=[];

function segretiTrova(id,extra){
  const e=segretiPer(id);
  if(!e||!segretiAttivi()||segretiTrovato(id))return false;
  const d=sg();
  d.trovati[id]=++d.ordine;
  record("Segreto · "+e.nome);
  let premio=e.monete||0;
  if(premio)awardCoins(premio);
  if(e.oggetto){
    carry(e.oggetto);
    if(typeof toastOggetto==="function"){try{toastOggetto(e.oggetto,"Un segreto del campus ti ha regalato un oggetto.");}catch{}}
  }
  sound(e.liv===3?"victory":"discovery","map");
  const n=segretiConta();
  const messaggi=[];
  for(const p of segretiPremi){
    const soglia=typeof p.n==="function"?p.n():p.n;
    if(n>=soglia&&!d.premi.includes(soglia)){
      d.premi.push(soglia);awardCoins(p.monete);premio+=p.monete;
      record("Segreti · soglia "+soglia+" · "+p.nome);messaggi.push("Soglia "+soglia+": "+p.nome+".");
    }
  }
  dirty=true;save();
  const testo=(extra?.testo??e.testo)+(premio?" · +"+premio+(premio===1?" moneta":" monete"):"");
  if(e.modo==="scena"&&!activeScene&&!minigame&&exploringCampus()){
    const scelte=e.scelte?e.scelte():[["Continua",null]];
    segretiEv={title:e.nome,text:testo+" ("+n+"/"+segretiTotale()+" segreti)"+(messaggi.length?"\n"+messaggi.join(" "):""),scelte};
    activeScene="segreti-scena";state.chatTopic=null;keys.clear();controls.clear();
    renderScene();focusScene();
  }else{
    segretiAvviso("Segreto trovato · "+e.nome+" ("+n+"/"+segretiTotale()+")",testo+(messaggi.length?" "+messaggi.join(" "):""));
  }
  refreshWallet();
  return true;
}
function segretiScene(){
  if(activeScene!=="segreti-scena"||!segretiEv)return null;
  const ev=segretiEv;
  return scene(ev.title,ev.text,...ev.scelte.map(([label,action])=>[label,()=>{
    if(action){const r=action();if(r===false)return;}
    activeScene=null;segretiEv=null;
  }]));
}

// ---------------------------------------------------------------------------
// Avvisi (banner) visibili anche sopra le finestre modali
// ---------------------------------------------------------------------------
let segretiCoda=[],segretiOccupato=false,segretiTimer=0;
function segretiStili(){
  if(document.getElementById("segretiStile"))return;
  const s=document.createElement("style");s.id="segretiStile";
  s.textContent=
  "#segretiAvviso{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));bottom:auto;right:auto;transform:translateX(-50%);margin:0;z-index:9500;width:min(520px,calc(100% - 24px));"+
  "background:#182725;color:var(--cream,#fff2da);border:3px solid #a38358;box-shadow:0 6px 0 #0008;padding:10px 14px;font-family:var(--font-ui,system-ui);font-size:15px;line-height:1.35}"+
  "#segretiAvviso strong{display:block;font-family:var(--font-title,inherit);font-size:11px;letter-spacing:.04em;color:var(--gold,#ffc47e);margin-bottom:5px;font-weight:400;line-height:1.5}"+
  "#segretiAvviso span{display:block}"+
  "@keyframes sgArcobaleno{0%{filter:hue-rotate(0)}100%{filter:hue-rotate(360deg) saturate(1.5)}}"+
  "body.sg-arcobaleno #stage{animation:sgArcobaleno 1.4s linear 3}"+
  ".gp-segreti{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:#101a19;color:var(--cream,#fff2da);font-family:var(--font-ui,system-ui);padding:max(10px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));gap:10px;overflow:hidden}"+
  ".gp-segreti[hidden]{display:none}"+
  ".gp-segreti .sg-testa{display:flex;align-items:center;gap:12px;flex-wrap:wrap}"+
  ".gp-segreti h2{font-family:var(--font-title,inherit);font-weight:400;font-size:clamp(12px,2.6vw,18px);margin:0;letter-spacing:.03em;line-height:1.5;color:var(--gold,#ffc47e);flex:1 1 220px}"+
  ".gp-segreti .sg-conta{font-family:var(--font-title,inherit);font-size:12px;padding:8px 10px;border:2px solid #a38358;background:#182725;white-space:nowrap}"+
  ".gp-segreti .sg-indietro{min-height:44px;min-width:44px;padding:8px 16px;font-family:var(--font-ui,inherit);font-size:16px;font-weight:700;background:#2a3936;color:var(--cream,#fff2da);border:2px solid #a38358;border-radius:0;cursor:pointer}"+
  ".gp-segreti .sg-premi{display:flex;gap:6px;flex-wrap:wrap}"+
  ".gp-segreti .sg-premio{font-size:12px;padding:4px 8px;border:2px solid #53615a;background:#16211f;color:#b9b19e}"+
  ".gp-segreti .sg-premio.ok{border-color:#e5ad62;color:#ffe2a8;background:#2b2a1d}"+
  ".gp-segreti .sg-griglia{flex:1 1 auto;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;align-content:start;padding:4px 2px 8px}"+
  ".gp-segreti .sg-cella{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:6px;min-height:104px;padding:8px 6px;text-align:center;font-family:var(--font-ui,inherit);font-size:13px;line-height:1.2;color:var(--cream,#fff2da);background:#1d2c2a;border:2px solid #3f4f4a;border-radius:0;cursor:pointer}"+
  ".gp-segreti .sg-cella.no{color:#7f8a84;background:#141f1e;border-style:dashed}"+
  ".gp-segreti .sg-cella[aria-pressed=true]{border-color:#e5ad62;background:#2b2a1d}"+
  ".gp-segreti .sg-cella canvas{width:40px;height:40px;image-rendering:pixelated;flex:none}"+
  ".gp-segreti .sg-cella.no canvas{opacity:.35;filter:grayscale(1)}"+
  ".gp-segreti .sg-liv{display:flex;gap:3px;margin-top:auto}.gp-segreti .sg-liv i{width:6px;height:6px;background:#e5ad62;display:block}.gp-segreti .sg-liv i.v{background:#3a4743}"+
  ".gp-segreti button:focus-visible{outline:3px solid #ffd27a;outline-offset:2px}"+
  ".gp-segreti .sg-dettaglio{flex:none;max-height:38%;overflow:auto;border:3px double #a38358;background:#182725;padding:10px 14px;display:flex;flex-direction:column;gap:8px}"+
  ".gp-segreti .sg-dettaglio strong{font-family:var(--font-title,inherit);font-weight:400;font-size:12px;line-height:1.6;color:var(--gold,#ffc47e)}"+
  ".gp-segreti .sg-dettaglio p{margin:0;font-size:15px;line-height:1.4}"+
  ".gp-segreti .sg-azione{align-self:flex-start;min-height:44px;padding:8px 14px;font-family:var(--font-ui,inherit);font-size:15px;font-weight:700;background:#e5ad62;color:#211a15;border:2px solid #e5ad62;border-radius:0;cursor:pointer}"+
  ".gp-segreti .sg-azione[disabled]{opacity:.55;cursor:default}"+
  "@media (min-width:900px){.gp-segreti .sg-griglia{grid-template-columns:repeat(auto-fill,minmax(132px,1fr))}.gp-segreti .sg-dettaglio{max-height:30%}}"+
  "@media (max-height:520px){.gp-segreti .sg-cella{min-height:88px}.gp-segreti .sg-dettaglio{max-height:42%}}";
  document.head.append(s);
}
function segretiAvviso(titolo,testo){
  segretiCoda.push([titolo,testo]);
  if(!segretiOccupato)segretiProssimo();
}
function segretiElemento(){
  segretiStili();
  let el=document.getElementById("segretiAvviso");
  if(el)return el;
  el=document.createElement("div");el.id="segretiAvviso";el.setAttribute("role","status");el.setAttribute("aria-live","polite");
  el.hidden=true;
  try{el.popover="manual";}catch{}
  document.body.append(el);
  el.addEventListener("click",()=>{clearTimeout(segretiTimer);segretiProssimo();});
  return el;
}
function segretiMostra(el,on){
  try{if(on){if(typeof el.showPopover==="function"&&!el.matches(":popover-open"))el.showPopover();}else if(typeof el.hidePopover==="function"&&el.matches(":popover-open"))el.hidePopover();}catch{}
  el.hidden=!on;
}
function segretiProssimo(){
  const el=segretiElemento(),next=segretiCoda.shift();
  if(!next){segretiOccupato=false;segretiMostra(el,false);return;}
  segretiOccupato=true;
  const t=document.createElement("strong"),b=document.createElement("span");
  t.textContent=next[0];b.textContent=next[1];
  el.replaceChildren(t,b);
  segretiMostra(el,true);
  clearTimeout(segretiTimer);
  segretiTimer=setTimeout(segretiProssimo,Math.min(11000,4800+next[1].length*40));
}

// ---------------------------------------------------------------------------
// Icone e collezione a schermo intero
// ---------------------------------------------------------------------------
function segretiIcona(nome,colore){
  const c=document.createElement("canvas");c.width=c.height=8;c.setAttribute("aria-hidden","true");
  const x=c.getContext("2d");
  const righe=SG_ICONE[nome]||SG_ICONE.stella;
  const scuro="#2b2b36",chiaro="#fff6df";
  righe.forEach((riga,py)=>[...riga].forEach((ch,px)=>{
    if(ch==="."||ch===" ")return;
    x.fillStyle=ch==="#"?colore:ch==="d"?scuro:chiaro;
    x.fillRect(px,py,1,1);
  }));
  return c;
}
let segretiPannello=null,segretiScelto=null,segretiRitorno=null;
function segretiApri(){
  if(!state||typeof document==="undefined")return false;
  segretiStili();
  if(segretiPannello&&!segretiPannello.hidden)return true;
  segretiRitorno=document.activeElement;
  keys.clear();controls.clear();
  const p=document.createElement("div");
  p.className="gp gp-segreti";p.setAttribute("role","dialog");p.setAttribute("aria-modal","true");p.setAttribute("aria-labelledby","sgTitolo");
  p.innerHTML="";
  segretiPannello=p;segretiScelto=segretiScelto||null;
  document.body.append(p);
  segretiDisegna();
  p.addEventListener("keydown",segretiTastiera);
  sound("menu","interface");
  const primo=p.querySelector(".sg-cella");(primo||p.querySelector(".sg-indietro")).focus();
  return true;
}
function segretiChiudi(){
  if(!segretiPannello)return;
  segretiPannello.remove();segretiPannello=null;
  sound("menuClose","interface");
  try{segretiRitorno?.focus?.();}catch{}
}
function segretiTastiera(event){
  const k=event.key;
  event.stopPropagation();
  if(k==="Escape"||k==="Backspace"||k.toLowerCase()==="b"&&!(event.target instanceof HTMLInputElement)){event.preventDefault();segretiChiudi();return;}
  const celle=[...segretiPannello.querySelectorAll(".sg-cella")];
  const i=celle.indexOf(document.activeElement);
  if(i<0||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(k))return;
  event.preventDefault();
  const griglia=segretiPannello.querySelector(".sg-griglia");
  const larghezza=celle[0].offsetWidth+8;
  const colonne=Math.max(1,Math.round(griglia.clientWidth/larghezza));
  const passo=k==="ArrowLeft"?-1:k==="ArrowRight"?1:k==="ArrowUp"?-colonne:colonne;
  const j=Math.max(0,Math.min(celle.length-1,i+passo));
  celle[j].focus();
}
function segretiDisegna(){
  const p=segretiPannello;if(!p)return;
  const d=sg(),n=segretiConta(),tot=segretiTotale();
  const testa=document.createElement("div");testa.className="sg-testa";
  const h=document.createElement("h2");h.id="sgTitolo";h.textContent="Collezione dei segreti";
  const conta=document.createElement("div");conta.className="sg-conta";conta.textContent=n+" / "+tot;
  const indietro=document.createElement("button");indietro.type="button";indietro.className="sg-indietro";indietro.textContent="Indietro";
  indietro.onclick=segretiChiudi;
  testa.append(h,conta,indietro);
  const premi=document.createElement("div");premi.className="sg-premi";premi.setAttribute("aria-label","Premi a soglie");
  for(const pr of segretiPremi){
    const soglia=typeof pr.n==="function"?pr.n():pr.n;
    const chip=document.createElement("span");chip.className="sg-premio"+(d.premi.includes(soglia)?" ok":"");
    chip.textContent=soglia+" · "+pr.nome;premi.append(chip);
  }
  const griglia=document.createElement("div");griglia.className="sg-griglia";griglia.setAttribute("role","list");
  for(const e of segretiLista){
    const trovato=segretiTrovato(e.id);
    const b=document.createElement("button");b.type="button";b.className="sg-cella"+(trovato?"":" no");b.dataset.id=e.id;
    b.setAttribute("role","listitem");b.setAttribute("aria-pressed",String(segretiScelto===e.id));
    b.setAttribute("aria-label",trovato?e.nome+", trovato":"Segreto non trovato, livello "+SG_LIVELLI[e.liv]);
    b.append(segretiIcona(trovato?e.icona:"occhio",trovato?e.col:"#6c7770"));
    const t=document.createElement("span");t.textContent=trovato?e.nome:"???";
    const liv=document.createElement("span");liv.className="sg-liv";liv.setAttribute("aria-hidden","true");
    for(let i=1;i<=3;i++){const q=document.createElement("i");if(i>e.liv)q.className="v";liv.append(q);}
    b.append(t,liv);
    b.onclick=()=>{segretiScelto=e.id;sound("click","interface");segretiDisegna();const nuovo=p.querySelector('.sg-cella[data-id="'+e.id+'"]');nuovo?.focus();};
    griglia.append(b);
  }
  const det=document.createElement("div");det.className="sg-dettaglio";det.setAttribute("aria-live","polite");
  const e=segretiScelto&&segretiPer(segretiScelto);
  if(!e){
    const s=document.createElement("strong");s.textContent="Scegli una casella";
    const t=document.createElement("p");t.textContent="Ogni casella nasconde un segreto del campus. Quelle trovate mostrano il racconto; le altre si lasciano interrogare con un indizio (costa 2 monete). Livello facile, medio o durissimo: lo dicono i quadratini.";
    det.append(s,t);
  }else if(segretiTrovato(e.id)){
    const s=document.createElement("strong");s.textContent=e.nome;
    const t=document.createElement("p");t.textContent=e.testo;
    const m=document.createElement("p");m.textContent="Livello "+SG_LIVELLI[e.liv]+(e.monete?" · premio "+e.monete+" monete":"")+(e.oggetto?" · oggetto: "+e.oggetto:"")+".";
    det.append(s,t,m);
  }else{
    const s=document.createElement("strong");s.textContent="??? · livello "+SG_LIVELLI[e.liv];
    const t=document.createElement("p");
    const sbloccato=Boolean(d.indizi[e.id]);
    t.textContent=sbloccato?"Indizio: "+e.indizio:"Indizio ancora sigillato.";
    det.append(s,t);
    if(!sbloccato){
      const a=document.createElement("button");a.type="button";a.className="sg-azione";
      const monete=wallet().coins;
      a.textContent=monete>=2?"Sblocca l’indizio · 2 monete":"Servono 2 monete (ne hai "+monete+")";
      a.disabled=monete<2;a.setAttribute("aria-disabled",String(monete<2));
      a.onclick=()=>{
        if(wallet().coins<2){sound("error","interface");return;}
        wallet().coins-=2;d.indizi[e.id]=1;refreshWallet();dirty=true;save();sound("buy","map");
        segretiDisegna();p.querySelector(".sg-azione")?.focus();
      };
      det.append(a);
    }
  }
  p.replaceChildren(testa,premi,griglia,det);
  const fuoco=segretiScelto&&p.querySelector('.sg-cella[data-id="'+segretiScelto+'"]');
  if(fuoco&&!p.contains(document.activeElement))fuoco.focus();
}
function segretiPulsanteDiario(){
  const body=document.getElementById("ideeDiaryBody");
  if(!body||body.querySelector(".sg-apri"))return;
  const b=document.createElement("button");b.type="button";b.className="sg-apri";
  b.textContent="Collezione dei segreti · "+segretiConta()+"/"+segretiTotale();
  b.onclick=segretiApri;
  body.prepend(b);
}

// ---------------------------------------------------------------------------
// Oggetti e luoghi: ricerca per tessera, vicinanza, anelli
// ---------------------------------------------------------------------------
function segretiOggetto(uid,zona=state.zone){return zoneObjects(room(zona)).byId.get(uid)||room(zona).objects.find(o=>o.uid===uid);}
function segretiVicino(uid,raggio){
  const o=segretiOggetto(uid);
  if(!o)return false;
  const w=o.w||1,h=o.h||1;
  const dx=Math.max(o.x-state.x,0,state.x-(o.x+w-1)),dy=Math.max(o.y-state.y,0,state.y-(o.y+h-1));
  return Math.max(dx,dy)<=raggio;
}
const SG_DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function segretiFronte(){
  const [dx,dy]=SG_DIR[state.look]||[0,1];
  const tx=state.x+dx+.5,ty=state.y+dy+.5,area=room(state.zone);
  const tipi=["tree","lamp","bench","fountain","nasone","car","booth","pillar","flowers","bin"];
  let trovato=null;
  for(const o of area.objects){
    if(!tipi.includes(o.kind))continue;
    const p=positionOf(o,mapClock,area.width);
    if(tx>=p.x&&tx<p.x+p.w&&ty>=p.y&&ty<p.y+p.h&&(!trovato||(o.w||1)*(o.h||1)<(trovato.w||1)*(trovato.h||1)))trovato=o;
  }
  return trovato;
}
function segretiAnello(o){
  const w=o.w||1,h=o.h||1,x0=o.x-1,y0=o.y-1,x1=o.x+w,y1=o.y+h,c=[];
  for(let x=x0;x<=x1;x++)c.push([x,y0]);
  for(let y=y0+1;y<=y1;y++)c.push([x1,y]);
  for(let x=x1-1;x>=x0;x--)c.push([x,y1]);
  for(let y=y1-1;y>y0;y--)c.push([x0,y]);
  return c;
}

// ---------------------------------------------------------------------------
// Ganci: passi, interazioni, attese, sfide, tastiera
// ---------------------------------------------------------------------------
function segretiPasso(){
  if(!segretiAttivi())return;
  const z=state.zone,x=state.x,y=state.y;
  if(segretiStorico.length&&segretiStorico.at(-1).z!==z)segretiStorico.length=0;
  segretiStorico.push({z,x,y});
  if(segretiStorico.length>20)segretiStorico.shift();
  for(const e of segretiLista){
    if(e.tipo==="tile"&&e.z===z&&e.x===x&&e.y===y)segretiTrova(e.id);
  }
  // giri attorno a un oggetto: otto (o più) passi consecutivi lungo il bordo, sempre nello stesso verso
  for(const e of segretiLista){
    if(e.tipo!=="cammino"||!e.ob||segretiTrovato(e.id))continue;
    const o=segretiOggetto(e.ob);
    if(!o)continue;
    const anello=segretiAnello(o),lunghezza=anello.length;
    if(segretiStorico.length<lunghezza+1)continue;
    const fine=segretiStorico.slice(-(lunghezza+1));
    const indici=fine.map(p=>anello.findIndex(([ax,ay])=>ax===p.x&&ay===p.y));
    if(indici.some(i=>i<0))continue;
    let ok=true;
    for(let i=1;i<indici.length;i++)if(((indici[i]-indici[i-1]+lunghezza)%lunghezza)!==(e.dir===1?1:lunghezza-1))ok=false;
    if(ok)segretiTrova(e.id);
  }
  // ballo del tornello: otto passi alternati tra due tessere, vicino alla guardia
  if(!segretiTrovato("ballo-tornello")&&segretiStorico.length>=9){
    const f=segretiStorico.slice(-9),a=f[0],b=f[1];
    const guardia=segretiOggetto("viale-ingresso-guardia");
    if(guardia&&Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1&&f.every((p,i)=>p.x===(i%2?b.x:a.x)&&p.y===(i%2?b.y:a.y))&&
       Math.hypot(a.x-guardia.x,a.y-guardia.y)<=8)segretiTrova("ballo-tornello");
  }
  // rosa dei venti
  if(z==="giardino"&&!segretiTrovato("rosa-dei-venti")){
    const d=sg();
    for(const [nome,px,py] of [["nord",35,11],["est",83,14],["sud",66,100],["ovest",11,40]]){
      if(Math.abs(x-px)<=2&&Math.abs(y-py)<=2&&!d.angoli.includes(nome)){d.angoli.push(nome);dirty=true;}
    }
    if(d.angoli.length===4)segretiTrova("rosa-dei-venti");
  }
}
function segretiRegistra(chiave){
  const ora=performance.now();
  const ultimo=segretiRecenti.at(-1);
  if(ultimo&&(ora-ultimo.t>90000||ultimo.z!==state.zone))segretiRecenti.length=0;
  segretiRecenti.push({k:chiave,t:ora,z:state.zone});
  if(segretiRecenti.length>12)segretiRecenti.shift();
}
function segretiRipetuto(chiave,n){
  if(segretiRecenti.length<n)return false;
  return segretiRecenti.slice(-n).every(r=>r.k===chiave);
}
function segretiSequenza(chiavi){
  if(segretiRecenti.length<chiavi.length)return false;
  return segretiRecenti.slice(-chiavi.length).every((r,i)=>r.k===chiavi[i]);
}
function segretiInteragisci(spot){
  if(!segretiAttivi()||!exploringCampus())return false;
  const fronte=segretiFronte();
  const bersaglio=fronte&&segretiLista.some(e=>e.tipo==="esamina"&&e.uid===fronte.uid);
  const chiave=bersaglio?"f:"+fronte.uid:spot?"s:"+spot.uid:fronte?"f:"+fronte.uid:null;
  const aperto=state.campusGateOpen||isFree();
  if(spot?.uid==="viale-ingresso-varco"&&!aperto)return false;
  if(chiave)segretiRegistra(chiave);
  else{segretiRecenti.length=0;}
  const trovati=[];
  const prima=activeScene;
  // esami ripetuti
  for(const e of segretiLista){
    if(e.tipo!=="esamina"||segretiTrovato(e.id))continue;
    if(segretiRipetuto("s:"+e.uid,e.n)||segretiRipetuto("f:"+e.uid,e.n))trovati.push(e.id);
  }
  // persone e luoghi particolari
  if(spot){
    if(segretiSequenza(["s:radio-tommaso","s:ca-greta","s:ca-mameli"]))trovati.push("redazione-completa");
    if(spot.uid==="viale-ingresso-guardia"&&segretiRipetuto("s:viale-ingresso-guardia",5))trovati.push("cinque-saluti");
    if(spot.kind==="professor"){
      const ora=segretiOra();
      if(ora>=0&&ora<4)trovati.push("lezione-di-notte");
      const dt=segretiData();
      if(dt.mese===5&&dt.giorno===4)trovati.push("appello-con-te");
    }
    if(spot.uid==="ca-elio"&&(state.mele||0)>0&&ix().active!=="mela")trovati.push("mela-per-elio");
    if(spot.uid==="orto-luiss"&&has("Piuma del piccione"))trovati.push("piuma-allorto");
    if(spot.uid==="segreti-registro"){
      trovati.push("registro-appelli");
      if(has("Fantasma del fuoricorso"))trovati.push("fantasma-firma");
    }
    if(spot.uid==="segreti-teca")trovati.push("anello-appello");
  }
  // paesaggio
  if(fronte){
    const d=sg();
    if(fronte.kind==="nasone"){
      if(!d.nasoni.includes(fronte.uid)){d.nasoni.push(fronte.uid);dirty=true;}
      trovati.push("primo-sorso");
      if(d.nasoni.length>=7)trovati.push("sette-colli");
    }
    if(fronte.kind==="bench"&&state.zone==="giardino"){
      if(!d.panche.includes(fronte.uid)){d.panche.push(fronte.uid);dirty=true;}
      const tutte=room("giardino").objects.filter(o=>o.kind==="bench").map(o=>o.uid);
      if(tutte.every(u=>d.panche.includes(u)))trovati.push("tutte-le-panchine");
    }
    if(fronte.kind==="tree"&&/^campus-tree-/.test(fronte.uid)&&segretiRipetuto("f:"+fronte.uid,3))trovati.push("foglia-del-28");
    if(fronte.kind==="lamp"&&segretiRipetuto("f:"+fronte.uid,7))trovati.push("lampione-ammicca");
    if(fronte.kind==="car"&&/^campus-parked-/.test(fronte.uid)&&segretiRipetuto("f:"+fronte.uid,3))trovati.push("clacson-sigla");
  }
  let consumato=false;
  for(const id of trovati){
    if(segretiTrova(id))consumato=consumato||activeScene==="segreti-scena";
  }
  if(consumato)return true;
  // fontana dei desideri (solo fontane senza dialogo)
  if(!spot&&fronte?.kind==="fountain"&&!segretiTrovato("moneta-fontana")){
    const monete=wallet().coins;
    segretiEv={title:"Fontana",text:monete>0?"Una fontana con il fondo pieno di desideri. Hai "+monete+(monete===1?" moneta":" monete")+" in tasca.":"Una fontana con il fondo pieno di desideri. Non hai una moneta da lanciare: forse più tardi.",
      scelte:monete>0?[["Lancia una moneta",()=>{
        wallet().coins-=1;refreshWallet();
        segretiTrova("moneta-fontana");
      }],["Tieni la moneta",null]]:[["Continua",null]]};
    activeScene="segreti-scena";state.chatTopic=null;keys.clear();controls.clear();
    sound("inspect","map");renderScene();
    return true;
  }
  if(!spot&&fronte){sound("inspect","map");return true;}
  return false;
}
function segretiFineSfida(g,result){
  if(!state||testMode||g.practice)return;
  const id=g.id;
  const vinto=result==="win";
  const trova=segretiTrova;
  if(id==="dance"&&vinto&&g.score===5)trova("ritmo-impeccabile");
  else if(id==="arm"&&vinto&&g.them===0)trova("presa-d-acciaio");
  else if(id==="ping"&&vinto&&g.them===0)trova("cappotto-ping-pong");
  else if(id==="foos"&&vinto&&g.them===0)trova("porta-inviolata");
  else if(id==="bris"&&result==="tie"&&g.score[0]===60)trova("sessanta-pari");
  else if(id==="mattoni"&&vinto&&g.lives===3)trova("mattoni-senza-ferite");
  else if(id==="calcetto"&&vinto&&g.score[1]===0)trova("cinque-a-zero");
}
function segretiCodice(event){
  if(!state||screen!=="game"||testMode||minigame||event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
  const campo=event.target instanceof Element&&event.target.closest("input,select,textarea,[contenteditable]:not([contenteditable=false])");
  if(campo)return;
  segretiTasti.push(event.key.toLowerCase());
  if(segretiTasti.length>12)segretiTasti.shift();
  for(const c of segretiCodici){
    if(segretiTasti.length<c.seq.length)continue;
    if(!segretiTasti.slice(-c.seq.length).every((k,i)=>k===c.seq[i]))continue;
    segretiTasti.length=0;
    if(!segretiAttivi())return;
    if(c.id==="modalita-fuoricorso"){
      if(state.zone==="archivio-segreto")segretiTrova("codice-nel-codice");
      const nuovo=segretiTrova("modalita-fuoricorso");
      if(!reducedMotion&&!document.body.classList.contains("sg-arcobaleno")){
        document.body.classList.add("sg-arcobaleno");
        setTimeout(()=>document.body.classList.remove("sg-arcobaleno"),4400);
        if(!nuovo)segretiAvviso("Modalità fuoricorso","Il campus si colora di nuovo. Il Rettorato finge di non vedere.");
      }
      sound("surprise","map");
    }else segretiTrova(c.id);
    return;
  }
}
window.addEventListener("keydown",segretiCodice);
function tickSegreti(now){
  if(!state||screen!=="game"||testMode){segretiFermoDa=now;return;}
  const pos=state.zone+":"+state.x+":"+state.y;
  if(!exploringCampus()||pos!==segretiPos){segretiPos=pos;segretiFermoDa=now;}
  if(now-segretiBtnAt>800){segretiBtnAt=now;segretiPulsanteDiario();}
  if(!segretiAttivi()||!exploringCampus())return;
  const fermo=(now-segretiFermoDa)/1000;
  for(const e of segretiLista){
    if(e.tipo!=="attesa"||segretiTrovato(e.id)||fermo<e.sec||state.zone!=="giardino")continue;
    if(!segretiVicino(e.ob,e.raggio))continue;
    if(e.id==="mezzanotte-dome"){const h=segretiOra();if(!(h>=0&&h<.25))continue;}
    segretiTrova(e.id);
  }
}
