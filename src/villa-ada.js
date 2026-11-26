// Villa Ada: il parco raggiungibile dal sentiero del campus, con cinghiali, mele, personaggi ed easter egg.
// La zona "villa-ada" nasce in world.js (refineRomania); qui la ampliamo e la popoliamo, e aggiungiamo
// alcuni personaggi e cartelli nel giardino del campus. Il resto del gioco chiama solo gli ingressi in fondo.

// ---------------------------------------------------------------------------
// Mappa: popola la zona Villa Ada e il giardino (nessun cambio a campus.json)
// ---------------------------------------------------------------------------
function installVillaAda(map){
  const garden=map.zones.giardino,villa=map.zones["villa-ada"];
  if(!garden||!villa)return map;
  if(villa.objects.some(o=>o.uid==="villa-ada-ingresso"))return map;
  // Ampliamo la zona creata per il sentiero: il parco diventa un bosco vero da attraversare.
  villa.width=Math.max(villa.width,64);villa.height=Math.max(villa.height,48);
  villa.name="Villa Ada · Parco con cinghiali";
  const vadd=item=>villa.objects.push(item);
  const vsign=(uid,name,x,y,text)=>vadd({uid,kind:"sign",name,x,y,w:1,h:1,color:"#d1ae72",action:"dialog",text});
  const vnpc=(uid,kind,name,x,y,color,route=[],speed=1.1)=>vadd({uid,kind,name,x,y,w:1,h:1,color,solid:false,
    action:"dialog",text:"",behavior:route.length?"patrol":"idle",speed,route});
  const add=item=>garden.objects.push(item);
  const sign=(uid,name,x,y,text)=>add({uid,kind:"sign",name,x,y,w:1,h:1,color:"#d1ae72",action:"dialog",text});
  const npc=(uid,kind,name,x,y,color,route=[],speed=1.1)=>add({uid,kind,name,x,y,w:1,h:1,color,solid:false,
    action:"dialog",text:"",behavior:route.length?"patrol":"idle",speed,route});

  // Sentieri: prolungano il sentiero già presente (terreno, non bloccano il passo)
  const trails=[
    [[20,10],[32,10],[32,22],[46,22],[46,12],[58,12]],
    [[32,22],[32,36],[50,36],[50,44]],
    [[46,22],[46,30],[58,30],[58,40]]
  ];
  const keepClear=[[3,9,19,4]];
  for(const line of trails){
    for(let i=1;i<line.length;i++){
      const [ax,ay]=line[i-1],[bx,by]=line[i];
      const x=Math.min(ax,bx),y=Math.min(ay,by);
      const w=Math.abs(bx-ax)+2,h=Math.abs(by-ay)+2;
      vadd({uid:"villa-ada-sentiero-"+villa.objects.length,kind:"path",name:"Sentiero di Villa Ada",x,y,w,h,color:"#a69172"});
      keepClear.push([x-1,y-1,w+2,h+2]);
    }
  }
  keepClear.push([34,13,12,9],[40,31,8,9],[2,10,8,6]);

  // Arredi e luoghi del parco
  vadd({uid:"villa-ada-casetta",kind:"booth",name:"Casetta del guardaparco",x:12,y:6,w:3,h:3,color:"#8f7a55",solid:true});
  vadd({uid:"villa-ada-laghetto",kind:"fountain",name:"Laghetto di Villa Ada",x:43,y:34,w:2,h:2,color:"#5f9aa0",solid:true,action:"dialog",
    text:"Un laghetto grande come un tappeto. Sul fondo brillano monete, un telecomando e almeno tre badge smarriti."});
  vadd({uid:"villa-ada-panchina-targa",kind:"bench",name:"Panchina con targa",x:28,y:8,w:2,h:1,color:"#a08a5b",solid:true,action:"dialog",
    text:"La targa dice: «In memoria del professore che il lunedì disse: ci vediamo la settimana prossima». Nessuno sa a quale settimana si riferisse."});
  vadd({uid:"villa-ada-picnic",kind:"desk",name:"Tavolo del picnic abbandonato",x:38,y:16,w:2,h:1,color:"#a68864",solid:true,action:"dialog",
    text:"Sul tavolo: una tovaglia a quadri, due mele morsicate da qualcuno con le zanne e una chiavetta USB con scritto «Tesi_definitiva_v14_FINALE_davvero». Provi a non aprirla."});
  vadd({uid:"villa-ada-cassetta",kind:"bin",name:"Cassetta degli appunti smarriti",x:52,y:8,w:1,h:1,color:"#71877c",solid:true,action:"dialog",
    text:"Dentro ci sono appunti di diritto privato, un esame di micro corretto con la penna rossa e una lista della spesa: «latte, cinghiale (NO), pane»."});
  vsign("villa-ada-ingresso","Villa Ada · Ingresso",5,9,
    "Benvenuti nel polmone verde dei Parioli. Il Comune ricorda che i cinghiali non hanno ancora superato il tornello, ma sono in lista d’attesa.");
  vsign("villa-ada-cartello","Attenzione cinghiali",8,12,
    "ATTENZIONE CINGHIALI. Non avvicinarsi, non fotografare con il flash, non offrire merendine. Se uno abbassa la testa e raspa la terra, la discussione è chiusa: corri verso il campus oppure lancia una mela.");
  vsign("villa-ada-dopo-cartello","Secondo cartello",16,12,
    "Il secondo cartello, più piccolo, aggiunge: «Le mele sugli alberi con la targhetta rossa sono per l’uso del parco. Per l’uso dei cinghiali, anche».");
  vsign("villa-ada-bivio","Bivio dei tre sentieri",30,12,
    "A est, il sentiero del capobranco. A sud, quello della merenda. Qualcuno ha scarabocchiato sotto: «Tutti portano ai cinghiali».");
  vsign("villa-ada-nido","Nido di merli",56,10,
    "Un nido di merli, perfettamente organizzato. Sembra più efficiente del gruppo di studio del terzo anno.");

  // Meli: raccogli mele per distrarre i cinghiali
  for(const [uid,x,y] of [["villa-ada-melo-1",24,12],["villa-ada-melo-2",36,21],["villa-ada-melo-3",35,33],["villa-ada-melo-4",52,26]]){
    vadd({uid,kind:"tree",name:"Melo con targhetta rossa",x,y,w:1,h:1,color:"#7a4a42",solid:true,action:"dialog",text:""});
  }

  // Personaggi di Villa Ada
  vnpc("va-ettore","professor","Ettore · Guardaparco",6,12,"#5f7d4f");
  vadd({uid:"va-gigi",kind:"boar",name:"Gigi · Cinghiale pacifico",x:44,y:38,w:1,h:1,color:"#6a5848",solid:false,action:"dialog",text:"",behavior:"idle",speed:1,route:[]});
  vnpc("va-ilaria","creator","Ilaria · Radio Luiss in diretta",24,8,"#6b86b3",[[25,8],[25,10]],1.0);
  vnpc("va-matteo","student","Matteo · Matricola in tenda",50,18,"#b8884f");
  vnpc("va-pina","student","Pina · Passeggia con il cane",28,14,"#a9667e",[[28,14],[31,14],[31,16]],1.0);
  vnpc("va-davide","athlete","Davide · Fa il giro da 40 minuti",50,5,"#c4624f",[[50,5],[56,5],[56,8],[50,8]],1.6);
  vnpc("va-ferretti","professor","Prof. Ferretti · Osserva il branco",41,27,"#8a7a52");
  vnpc("va-brown","sportGlasses","Mr Brown · Turista",14,12,"#527f87",[[14,12],[14,15]],0.9);

  // Bosco: alberi solidi e cespugli generati in modo deterministico. Restano liberi sentieri, radure,
  // personaggi, monete, sorprese e punti di partenza dei cinghiali (stesse coordinate usate più sotto).
  const reserved=[
    [38,14],[24,16],[56,12],[50,40],[34,44],[58,26],
    [60,4],[10,44],[54,40],[30,28],
    [36,24],[52,14],[44,36],[56,42],[41,18]
  ];
  const keepOut=villa.objects.filter(o=>o.uid!=="villa-ada-ingresso"&&(o.kind!=="path"||o.uid==="ada-walk")).map(o=>[o.x-1,o.y-1,(o.w||1)+2,(o.h||1)+2]);
  const inRect=(x,y,r)=>x>=r[0]&&x<r[0]+r[2]&&y>=r[1]&&y<r[1]+r[3];
  let seedValue=20241126;
  const random=()=>{seedValue|=0;seedValue=seedValue+0x6D2B79F5|0;let t=Math.imul(seedValue^seedValue>>>15,1|seedValue);
    t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  let woodId=0;
  for(let y=1;y<=46;y+=3){
    for(let x=8;x<=62;x+=3){
      const tx=x+Math.floor(random()*3)-1,ty=y+Math.floor(random()*3)-1;
      const roll=random();
      if(tx<8||tx>62||ty<1||ty>46)continue;
      if(keepClear.some(r=>inRect(tx,ty,r))||keepOut.some(r=>inRect(tx,ty,r)))continue;
      if(reserved.some(([rx,ry])=>Math.abs(rx-tx)<=2&&Math.abs(ry-ty)<=2))continue;
      woodId+=1;
      if(roll<.58){
        vadd({uid:"villa-ada-albero-"+woodId,kind:"tree",name:"Albero di Villa Ada",x:tx,y:ty,w:1,h:1,color:"#4c7553",solid:true});
      }else if(roll<.78){
        vadd({uid:"villa-ada-cespuglio-"+woodId,kind:"bush",name:"Cespuglio",x:tx,y:ty,w:1,h:1,color:"#648052"});
      }else if(roll<.86){
        vadd({uid:"villa-ada-fiori-"+woodId,kind:"flowers",name:"Fiori di campo",x:tx,y:ty,w:1,h:1,color:"#d8a86f"});
      }
    }
  }

  // Villa Ada sta a ovest del campus (a sinistra nella mappa): si entra dal lato est del parco e si cammina
  // verso ovest. Specchiamo orizzontalmente tutta la zona, compresi gli oggetti già presenti.
  const parkWidth=villa.width;
  for(const o of villa.objects){
    o.x=parkWidth-o.x-(o.w??1);
    if(Array.isArray(o.route))o.route=o.route.map(([px,py])=>[parkWidth-1-px,py]);
  }

  // Personaggi sparsi per il campus (posizione cercata attorno a un punto, poi spostata sul primo spazio libero)
  const tiles=new Set();
  for(const o of garden.objects){
    const solidLike=o.solid||["roof","faculty","chapel","domeHall","booth","court","wall","pillar","tree","shelter","shuttle","car","scooter","bus","bench","desk","foos","ping","poker","fountain"].includes(o.kind);
    const ground=["road","paving","path","grass"].includes(o.kind);
    const person=o.action||["student","professor","creator","cleaner","athlete","sportGlasses","heatedStudent","guard","bartender"].includes(o.kind);
    if(ground&&o.kind!=="paving"&&o.kind!=="path"&&o.kind!=="grass"){
      for(let yy=o.y;yy<o.y+(o.h||1);yy++)for(let xx=o.x;xx<o.x+(o.w||1);xx++)tiles.add(xx+","+yy);
    }else if(solidLike||person){
      for(let yy=o.y;yy<o.y+(o.h||1);yy++)for(let xx=o.x;xx<o.x+(o.w||1);xx++)tiles.add(xx+","+yy);
    }
  }
  const freeSpot=(wantX,wantY)=>{
    for(let r=0;r<12;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
      const x=wantX+dx,y=wantY+dy;
      if(x<2||y<2||x>94||y>100)continue;
      if(tiles.has(x+","+y))continue;
      tiles.add(x+","+y);return [x,y];
    }
    return [wantX,wantY];
  };
  // Il cancello per Villa Ada passa dal lato est (Via Panama) al lato ovest del campus.
  const gate=garden.objects.find(o=>o.uid==="ada-gate"),back=garden.objects.find(o=>o.uid==="ada-return-point");
  if(gate&&back&&gate.x>60){
    const [gx,gy]=freeSpot(10,40);
    const [bx,by]=tiles.has((gx+1)+","+gy)?[gx,gy+1]:[gx+1,gy];
    gate.x=gx;gate.y=gy;back.x=bx;back.y=by;
    tiles.add(bx+","+by);
    const [sx,sy]=freeSpot(gx+2,gy-2);
    sign("ca-verso-ada","Verso Villa Ada",sx,sy,
      "Una freccia di legno indica l’ovest: «Villa Ada». Sotto, un cartello del Comune: «Non dare da mangiare ai cinghiali». Sotto ancora, a pennarello: «Loro però hanno già mangiato».");
  }
  const campusNpc=(uid,kind,name,x,y,color,patrol)=>{
    const [fx,fy]=freeSpot(x,y);
    const route=patrol?[[fx,fy],[fx+patrol[0],fy+patrol[1]]]:[];
    npc(uid,kind,name,fx,fy,color,route,1.0);
  };
  campusNpc("ca-pasquale","student","Pasquale · Quello dei volantini",51,45,"#c0884a");
  campusNpc("ca-greta","creator","Greta · Regia di Radio Luiss",37,57,"#7f6ab0");
  campusNpc("ca-mameli","professor","Prof.ssa Mameli · Sociologia",42,45,"#7b6a58");
  campusNpc("ca-rocco","student","Rocco · Collezionista di sedie",30,61,"#9a6d4d");
  campusNpc("ca-camilla","student","Camilla · Ripetizioni di micro",70,53,"#b4607b");
  campusNpc("ca-ruggero","sportGlasses","Ruggero · Allenatore senza squadra",46,31,"#4f7d86");
  campusNpc("ca-lucia","student","Lucia · Bibliotecaria itinerante",24,45,"#6e8a62");
  campusNpc("ca-elio","cleaner","Elio · Sorveglia il distributore",64,69,"#80a471");

  // Cartelli ed easter egg nel campus (posizioni già verificate come libere e raggiungibili)
  const campusSign=(uid,name,x,y,text)=>{const [fx,fy]=freeSpot(x,y);sign(uid,name,fx,fy,text);};
  campusSign("ca-bacheca-impossibile","Bacheca degli annunci impossibili",27,52,
    "«Cercasi coinquilino silenzioso con pianoforte.» «Vendesi appunti di Macro, usati poco e capiti ancora meno.» «Smarrito: esame di Statistica. Ultimo avvistamento: vicino a una calcolatrice.» L’ultimo foglio dice soltanto: «Studiare ha un senso?» e sotto qualcuno ha risposto «dipende».");
  campusSign("ca-aiuola","Aiuola monitorata",44,49,
    "Un cartello fermo tra i fiori: «Non calpestare le aiuole. Le aiuole vi osservano». Per un attimo sembra che i fiori si voltino verso di te. Probabilmente è il vento.");
  campusSign("ca-libri","Scambio libri",22,48,
    "Una cassetta di legno con la scritta: «Prendi un libro, lascia un’ansia». Dentro c’è un manuale di diritto commerciale con una dedica: «A chi lo aprirà, coraggio». Più sotto, un romanzo giallo con il finale già rivelato da un segnalibro cattivo.");
  campusSign("ca-specchio","Specchio del corridoio",62,58,
    "Ti guardi nello specchio appeso al muro. Sotto c’è scritto: «Chi sei? Cosa fai? Cosa non sai?». Nessuna delle tre risposte ti convince. Lo specchio, per fortuna, non chiede spiegazioni.");
  campusSign("ca-panchina","Panchina del «ci vediamo qui»",20,40,
    "Sulla panchina qualcuno ha inciso: «ci vediamo qui». Ma nessuno ha scritto dove sia qui, né quando. È la panchina più frequentata del campus e la più vuota.");
  campusSign("ca-cestino","Cestino filosofico",56,58,
    "Il cestino ha quattro bocche: «Carta», «Plastica», «Indifferenziata» e «Dubbi». L’ultima è piena fino all’orlo. Ogni tanto qualcuno aggiunge una pagina di appunti con l’aria di chi si libera di un peso.");
  campusSign("ca-colonnina","Colonnina di ricarica",66,50,
    "Una colonnina Green Mobility lampeggia piano. Sul display: «Carica al 100% da stamattina. In attesa di essere usata. In attesa. In attesa». Sembra molto più paziente di te.");
  campusSign("ca-murales","Muro delle firme",58,58,
    "Sul muro grigio, firme a pennarello di anni diversi. Tra le più recenti: «Qui ho capito la domanda d’esame, mezz’ora dopo l’esame». Sotto, in piccolo: «Ci credo». Hai voglia di aggiungere la tua, ma la penna è finita.");
  return map;
}

// ---------------------------------------------------------------------------
// Conversazioni
// ---------------------------------------------------------------------------
Object.assign(conversations,{
  "va-ettore":[
    "Ettore regge un binocolo e un termos. «Benvenuto a Villa Ada. Io sono il guardaparco: la mia funzione è dire “ve l’avevo detto” con autorità.»",
    ["Come scappo da un cinghiale?","«In linea retta e senza guardarlo negli occhi. Sono più lenti di te, ma non hanno scadenze. Se ti blocchi tra gli alberi, sei nei guai. Il campus, a ovest, è territorio sicuro: i cinghiali non passano il tornello. Non hanno il badge.»"],
    ["A cosa servono le mele?","«A negoziare. Un cinghiale con una mela in bocca ha cose più importanti da fare che investirti. Ma sono due mele ogni albero, e solo se ti fermi a raccoglierle. Funziona una volta per mela.»"],
    ["Perché ci sono i cinghiali?","«Dicono che arrivino dalla zona di Monte Antenne. Io ho una teoria meno scientifica: hanno sentito parlare della mensa del Dome e non si sono più fermati.»"],
    ["Posso dare da mangiare a Gigi?","«Gigi è l’unico a non averne bisogno. Ha il carattere di chi ha già fatto la tesi. Non attaccherebbe nemmeno se gli rubassi il posto sulla panchina.»"]
  ],
  "va-gigi":[
    "Gigi alza lo sguardo con la calma di chi ha letto Weber e non ne è rimasto colpito. Non carica. Annusa i tuoi appunti con interesse accademico.",
    ["Provi a salutarlo","Gigi emette un grugnito basso, che nel linguaggio dei cinghiali sembra voler dire «sì, anche io avevo un esame, poi ho lasciato perdere». Riprende a rovistare in una zolla."],
    ["Gli offri un appunto di sociologia","Gigi mastica la prima pagina, valuta il contenuto e restituisce la seconda. Sembra un giudizio equilibrato."],
    ["Gli chiedi del branco","Gigi indica con il muso il sentiero a nord. Poi si sdraia, come per dire: «io lì non ci vado nemmeno per i punti bonus»."]
  ],
  "va-ilaria":[
    "Ilaria stringe un microfono con la spugnetta rossa. «Siamo in diretta su Radio Luiss da Villa Ada! Tra poco intervisto un cinghiale. Se vuoi farmi una domanda per gli ascoltatori, sono tutta orecchi e tutta tracolla.»",
    ["Che programma è?","«“Fuori Campus, Dentro i Cespugli”. Ho dodici ascoltatori certificati e uno non identificato che chiama ogni lunedì alle 13 per chiedere la sigla di Luiss Weekend.»"],
    ["Hai già intervistato un cinghiale?","«Uno. Ha risposto solo a una domanda su due, ma almeno ha mantenuto le distanze. Il mio fonico non ha avuto la stessa fortuna con il cavo del microfono.»"],
    ["Come si entra in redazione?","«Se sai parlare e vuoi imparare ad ascoltare, ci sei già. Poi ti insegniamo a tagliare i silenzi senza far notare che li stavi riempiendo di niente.»"]
  ],
  "va-matteo":[
    "Matteo sta accanto a una tenda canadese con un taccuino aperto. «Non sto campeggiando. Faccio osservazione partecipante. Il prof dice che per capire un gruppo devi viverci. Il gruppo è un branco di cinghiali.»",
    ["Come procede la ricerca?","«Il capobranco è un attore sociale. Gli altri lo seguono con un rispetto che in aula non ho mai visto. L’unica cosa che non rientra nel metodo è che vorrebbero mangiare i miei appunti.»"],
    ["Che cos’è l’osservazione partecipante?","«Stai nel posto, ascolti, scrivi. Impari a non giudicare subito. Il problema è quando il posto ti guarda a sua volta e inizia a scavare vicino ai tuoi piedi.»"],
    ["Ti manca il campus?","«Moltissimo. Il barista mi ha scritto: “il tuo caffè ti aspetta”. Gli ho risposto che il mio campo di ricerca è questo. Ha risposto con un cuoricino triste.»"]
  ],
  "va-pina":[
    "Pina tiene al guinzaglio un cane con l’espressione di un professore a metà esame. «Si chiama Durkheim. Morde solo se avverte un calo di coesione sociale.»",
    ["Ha già incontrato un cinghiale?","«Tre volte. Durkheim li ha guardati e ha fatto finta di avere un impegno. Io non lo giudico: hanno le zanne, lui ha una pensione di anzianità.»"],
    ["Perché Durkheim?","«Mio marito è sociologo. Io ho solo una vaga idea di cosa sia, ma il cane si è abituato al nome. Quando lo chiamo a casa, si siede e aspetta un saggio.»"],
    ["Posso accarezzarlo?","«Solo se non parli di anomia. Gli fa venire il nervoso.»"]
  ],
  "va-davide":[
    "Davide corre sul posto senza perdere il ritmo. «Sono quaranta minuti che faccio lo stesso giro. Se mi fermo, mi raggiungono. Sto praticamente facendo un tapis roulant con paesaggio.»",
    ["Da chi scappi?","«Dal branco. Mi hanno visto passare una volta e ora mi riconoscono. Credo di essere il loro programma preferito: “Il podista che non si ferma mai”.»"],
    ["Ti serve qualcosa?","«Un cinghiale più lento. Oppure un’app che mi dica quanto mancano alla fine del bosco. O una mela. Se ne hai una, tienila per te: potresti averne bisogno più di me.»"],
    ["Il tuo record?","«Quattro giri completi senza respirare. Ma ho un testimone: un merlo. Non è molto affidabile, però è l’unico che mi ha applaudito.»"]
  ],
  "va-ferretti":[
    "Il professor Ferretti osserva il bosco con un taccuino. «Studio la dinamica del gruppo. Il capobranco, qui, è quello che tutti guardano prima di decidere se avere paura.»",
    ["È una lezione di sociologia?","«Una lezione di come si comportano gli individui quando sono in tanti. Nelle assemblee di corso si osserva lo stesso fenomeno, con la differenza che qui nessuno chiede di mettere a verbale.»"],
    ["Posso citarla all’esame?","«Se mi cita, citi anche i cinghiali. Hanno contribuito di più dei miei assistenti. Ma segni anche che non ho potuto intervistare nessuno: al primo “buongiorno” sono scappati.»"],
    ["Cosa le ha insegnato Villa Ada?","«Che il campo di ricerca è un’idea. Il vero campo di ricerca è dove nessuno ti ha dato il permesso. Ma consiglio di portare scarpe comode.»"]
  ],
  "va-brown":[
    "Mr Brown regge una mappa del Colosseo capovolta. «Excuse me, is this the Colosseum? A man told me the Colosseum was near a lot of green and some wild boars.»",
    ["This is Villa Ada","«Ah. And the pizza?» Si ferma, guarda il bosco. «I think I misread the map. The man was selling it to me as an authentic roman experience.»"],
    ["Where did you meet him?","«Near a tree with a red tag. He had an apple and a very sincere expression. I gave him five euros. He gave me the apple. Now I am confused and slightly hungry.»"],
    ["Do you want to walk back?","«Yes, please. But if we meet a boar, you go first. I am a tourist, you are a student. It is only fair.»"]
  ],
  "ca-pasquale":[
    "Pasquale ti infila un volantino in mano. «Gruppo di studio che studia solo il giorno prima! Aperto a tutti, prenotazione a scelta. Se ti fermi a leggere, hai già fatto metà del programma.»",
    ["A che ora ci si trova?","«Alle sette di mattina del giorno dell’esame. Ma senza fretta: alle sette e un quarto cominciamo a decidere cosa portare, alle otto ci rendiamo conto che manca il programma, alle nove siamo in aula.»"],
    ["Funziona?","«Il novantadue per cento di chi viene prende almeno ventidue. L’altro otto per cento ci dice che era a una festa. È tutto statisticamente significativo, se non ci pensi troppo.»"],
    ["Posso portare un amico?","«Portane tre. Se siamo in dieci, la responsabilità si diluisce e nessuno controlla chi ha fatto il riassunto.»"]
  ],
  "ca-greta":[
    "Greta regola il volume di un mixer immaginario. «Regia di Radio Luiss. Se sentite un fischio improvviso, è il microfono. Se sentite il silenzio, è il tecnico che si è addormentato.»",
    ["Cosa fai di preciso?","«Tengo insieme il programma. Dico: “tre, due, uno” e poi nessuno ricorda il resto. Il mio lavoro è far sembrare tutto improvvisato quando in realtà è improvvisato davvero.»"],
    ["Hai una sigla preferita?","«Quella di Luiss Weekend: tre note al sintetizzatore e una porta che sbatte. Ogni volta che la sento, il barista mi guarda con aria complice.»"],
    ["Posso fare un annuncio in diretta?","«Se mi dai tre secondi di pace e una frase sensata, sì. Ma con l’intera lista degli ospiti non ci riesco: ho già dimenticato come si fa.»"]
  ],
  "ca-mameli":[
    "La professoressa Mameli sistema gli occhiali sul naso. «Sociologia significa osservare quello che fate quando pensate che nessuno vi guardi. Per esempio, adesso state fingendo di leggere la bacheca.»",
    ["Che cosa le interessa di più?","«Le piccole abitudini. La fila al bar, il posto che ognuno occupa a lezione, il modo in cui qualcuno saluta e qualcuno no. Dietro ogni gesto c’è una regola non scritta. Quasi sempre è più rigida di quelle scritte.»"],
    ["Mi consiglia un libro?","«Parta da un classico: Goffman, “La vita quotidiana come rappresentazione”. Poi legga qualcosa che la metta a disagio. Se non la mette a disagio, ha letto la sintesi.»"],
    ["Che cos’è un fatto sociale?","«Una cosa che esiste perché la pensiamo in molti. Come il posto in prima fila che nessuno occupa e tutti rispettano. Provi a sedersi: capirà cos’è un fatto sociale in meno di un minuto.»"]
  ],
  "ca-rocco":[
    "Rocco regge una sedia sotto ogni braccio. «Collezione di sedie del campus. Ne ho trovate sei da quando sono arrivato. Cinque appartengono all’Aula Chiesa. La sesta è un mistero.»",
    ["Perché collezioni sedie?","«Perché ogni sedia ha una storia. Su questa qui, per esempio, si è seduto qualcuno che ha fatto tutto l’anno senza prendere un appunto e ha preso trenta. Ci vorrebbe una targa.»"],
    ["Posso sedermi?","«Solo se mi dici il programma di diritto pubblico. Altrimenti è una sedia di tutti, e non mi piace che sia di tutti.»"],
    ["Dove le tieni?","«In garage. Mia madre pensa che faccia l’antiquario. Mio padre pensa che stia studiando ingegneria dei materiali. La verità è nel mezzo, e ha quattro gambe.»"]
  ],
  "ca-camilla":[
    "Camilla agita un cartello con scritto «RIPETIZIONI DI MICRO, PRIMA LEZIONE GRATIS, SECONDA A PREZZO DI MERCATO». Ti guarda come se fossi un bene Giffen.",
    ["Quanto costa la seconda lezione?","«Dipende dall’elasticità della domanda. Se piangi un po’, scende. Se mi dici che ti serve entro domani, sale. Sono una buona economista e una pessima benefattrice.»"],
    ["Funziona davvero?","«Quasi tutti i miei studenti passano. Quelli che non passano mi dicono che il professore ha cambiato il programma. È la tragedia dei beni comuni.»"],
    ["Hai un consiglio gratis?","«Disegna sempre i grafici. Anche quando non servono. Il professore ti guarderà e penserà: questo ragiona per immagini. Poi, se ti va male, hai almeno un bel disegno.»"]
  ],
  "ca-ruggero":[
    "Ruggero porta un fischietto al collo e uno sguardo da mister. «Sono l’allenatore. Non della squadra del campus: di un’altra squadra. Non l’ho ancora trovata, ma stasera dovrebbe uscire un annuncio.»",
    ["Che modulo giochi?","«Il modulo è un’attitudine. Quattro-quattro-due se c’è bel tempo, tre-cinque-due se c’è lezione alle nove. Ma senza il pallone, non è un modulo: è un’idea.»"],
    ["Hai mai allenato qualcuno?","«Una volta ho allenato un cinghiale. Alla terza partita ha capito il fuorigioco, ma poi ha attaccato l’arbitro. Ora non lo chiamano più.»"],
    ["Mi alleneresti?","«Se mi porti dodici compagni e una porta con le reti, sì. Altrimenti ti insegno a scappare. Alla fine, in un campus, è la skill più utile.»"]
  ],
  "ca-lucia":[
    "Lucia spinge un carrello con una torre di libri. «Biblioteca itinerante. Se un libro ti sceglie, non puoi dire di no. Se non ti sceglie, puoi sempre provare a convincerlo.»",
    ["Che libro mi dai?","«Quello che stai evitando. Di solito è quello giusto. Se non sai quale, guarda quello su cui hai appoggiato il caffè: ha già dimostrato di sopportarti.»"],
    ["Quanto posso tenerlo?","«Fino a quando non lo capisci. Poi lo restituisci con un biglietto: “mi ha cambiato la vita” oppure “mi ha tolto il sonno”. Le due frasi hanno quasi lo stesso valore.»"],
    ["Hai un posto preferito?","«Il Matroneo. Si sente anche il cursore. Una volta ho sentito un file Excel andare in errore: mi sono emozionata.»"]
  ],
  "ca-elio":[
    "Elio fissa il distributore come un custode con una missione. «Sorveglio il distributore dalle otto. Per ora ha restituito il resto una volta sola, ma era in monete da due centesimi.»",
    ["Perché lo sorvegli?","«Perché ogni tanto sparisce un pacco di patatine. Il sospetto è un cinghiale che entra da Via Panama. Io non ci credo, ma la teoria ha il suo fascino.»"],
    ["Cosa vende?","«Caffè freddo, caffè caldo, caffè con panna e una cosa chiamata “sorpresa”. L’ultima volta era un tè al limone. Il giorno prima, un minestrone.»"],
    ["Posso offrirti qualcosa?","«Accetto solo monete da un euro. Il distributore ha un carattere molto selettivo. Come il professore di Statistica.»"]
  ]
});

// ---------------------------------------------------------------------------
// Sorprese nascoste (stesso sistema del «Guagliò!» del campus)
// ---------------------------------------------------------------------------
campusSurprises.push(
  {zone:"villa-ada",x:3,y:4,id:"Cinghiale con la tesi",voice:"Grunf! Cerco un relatore!",line:"Un cinghiale ti porge una tesi masticata a metà. Il titolo sopravvissuto: «Mobilità sociale nei sottoboschi». Il relatore, per ora, è irreperibile.",theme:"garden"},
  {zone:"villa-ada",x:53,y:44,id:"Tasso del retroscena",voice:"Shh! Sono nel retroscena!",line:"Dal cespuglio esce un tasso con gli occhiali da sole. Davanti alla gente fa il tasso, nel retroscena fa tutt’altro. Goffman lo avrebbe adorato.",theme:"garden"},
  {zone:"villa-ada",x:9,y:40,id:"Fantasma del picnic",voice:"Posso restare a cena?",line:"Un fantasma in tovaglia a quadri chiede il bis di tiramisù. Ti spiega che sta aspettando da vent’anni un amico che aveva detto «arrivo tra cinque minuti».",theme:"party"},
  {zone:"giardino",x:30,y:43,id:"Piccione del Rettorato",voice:"Cru! Ho letto il regolamento!",line:"Un piccione ti blocca il passo con un volantino nel becco: è il regolamento della mensa. Lo ha già letto tre volte e vorrebbe discuterne con qualcuno di competente.",theme:"garden"},
  {zone:"giardino",x:49,y:64,id:"Barista fantasma",voice:"Un caffè? Lo vuoi lungo?",line:"Il barista fantasma ti porge un caffè che non esiste. Dice che è così che si prepara l’esame perfetto: vuoto, caldo e con un po’ di schiuma di speranza.",theme:"ghost"},
  {zone:"giardino",x:68,y:42,id:"Professore dell’ultimo appello",voice:"Ultimo appello! Ultimo appello!",line:"Compare e scompare alla fine di ogni sessione. Oggi ha solo due domande: «Come stai?» e «Hai letto il programma?». La seconda, dice, è facoltativa. Anche la prima.",theme:"dome"},
  {zone:"giardino",x:40,y:68,id:"Voce del tornello",voice:"Prego... riprovare!",line:"Il tornello ha parlato. Nessuno sa cosa abbia detto, ma alla guardia è sembrato un buon segno. Il display ha cambiato scritta tre volte e ora dice «ciao».",theme:"radio"},
  {zone:"villa-ada",x:33,y:28,id:"Conduttore della Radura",voice:"Siamo in onda dal bosco!",line:"Un conduttore con le cuffie appese a un ramo presenta il meteo: «Domani sole, con possibilità di cinghiali nel pomeriggio. Seguiranno approfondimenti».",theme:"radio"}
);

// Correzione: la sorpresa dell'orto era finita sotto un albero solido e non si poteva attivare mai.
// Se qualcuno la sposta altrove, questo controllo non fa nulla.
{
  const zucchine=campusSurprises.find(item=>item.id==="Custode delle zucchine");
  if(zucchine&&zucchine.zone==="giardino"&&zucchine.x===47&&zucchine.y===26)zucchine.y=25;
}

// Monete aggiuntive a Villa Ada
vialeCoins.push(
  ["va-moneta-1","villa-ada",25,14],["va-moneta-2","villa-ada",39,16],["va-moneta-3","villa-ada",7,12],
  ["va-moneta-4","villa-ada",13,40],["va-moneta-5","villa-ada",29,44],["va-moneta-6","villa-ada",5,26]
);

// ---------------------------------------------------------------------------
// Scene dedicate (meli e fine della corsa)
// ---------------------------------------------------------------------------
function villaAdaScene(o){
  if(!o.uid.startsWith("villa-ada-melo-"))return null;
  state.villaMeli??={};
  if(state.villaMeli[o.uid])return scene(o.name,"L’albero ha già dato quello che poteva. Sui rami restano mele che neanche un cinghiale rispetterebbe.");
  return scene(o.name,"Sui rami pendono mele rosse. Sulla targhetta: «Mele per l’uso del parco. I cinghiali, per l’uso loro». Ne bastano due per far ragionare un animale con le zanne.",
    ["Raccogli due mele",()=>{
      state.villaMeli[o.uid]=true;state.mele=(state.mele||0)+2;
      carry("Mele di Villa Ada");record("Villa Ada · Hai raccolto due mele.");sound("coin","map");
    }]);
}
function villaAdaEndingScene(){
  const ending=state.ending;
  return scene(ending.title,ending.text,["Riprova dall’ingresso di Villa Ada",()=>{
    state.ending=null;state.villaMeli={};state.mele=0;
    villaBoars.length=0;villaHerdSpawned=false;
    [state.x,state.y]=reachEntry(villaZone,"ada-entry");
    keys.clear();controls.clear();activeScene=null;save();
  }]);
}

// ---------------------------------------------------------------------------
// Cinghiali: disegno, comportamento e collisione
// ---------------------------------------------------------------------------
const villaZone="villa-ada";
const villaBounds={left:1,top:1,right:55,bottom:46};
const villaBoars=[];
let villaHerdSpawned=false,villaLast=0,villaWasInside=false;
const villaSpawnPoints=[[27,24,"left",false],[11,14,"left",false],[19,36,"right",false],[7,42,"left",false],[22,18,"left",true]];

function drawBoarShape(c,look,mode,now,seed){
  c.save();
  if(look==="right"){c.translate(16,0);c.scale(-1,1);}
  const run=mode==="charge"&&now?Math.floor(now/80+seed)%2:0;
  const bob=mode==="calm"&&now?Math.floor(now/600+seed)%2:0;
  const eating=mode==="eat";
  rect(c,"#17212655",2,13,12,2);
  rect(c,"#3d2d25",4,11+run,2,3);rect(c,"#3d2d25",7,11-run,2,3);
  rect(c,"#3d2d25",10,11+run,2,3);rect(c,"#3d2d25",12,11-run,1,3);
  rect(c,"#6b4f3d",3,6+bob,10,6);
  rect(c,"#3f2d24",4,5+bob,8,2);
  for(const px of [5,7,9,11])rect(c,"#8a6a52",px,4+bob,1,1);
  rect(c,"#4d3a2d",5,8+bob,7,1);
  const headY=eating?9:7;
  rect(c,"#5c4333",1,headY,5,5);
  rect(c,"#caa287",0,headY+2,2,3);
  rect(c,"#1c1410",0,headY+3,1,1);
  rect(c,"#f2ead0",1,headY+5,1,1);rect(c,"#f2ead0",0,headY+5,1,1);
  rect(c,mode==="charge"?"#e94b3c":"#fff6d6",3,headY+1,1,1);
  rect(c,"#3f2d24",4,headY-1,2,2);
  rect(c,"#3f2d24",13,7,2,1);rect(c,"#3f2d24",14,6,1,1);
  if(eating)rect(c,"#d94a3b",0,headY+3,2,2);
  c.restore();
}
function boarFloater(c,b,x,y,now){
  c.font="bold 7px monospace";c.textAlign="center";
  if(b.mode==="alert"){
    c.fillStyle="#f3d27a";c.fillText("!",x+8,y-4+(now%400<200?0:-1));
  }else if(b.mode==="charge"&&now%500<250){
    c.fillStyle="#e94b3c";c.fillText("!!",x+8,y-5);
  }else if(b.mode==="eat"){
    c.fillStyle="#f3d27a";c.fillText("nom",x+8,y-3+(now%800<400?0:-1));
  }
}
function paintVillaBoars(c,zone,now){
  if(zone!==villaZone||!villaBoars.length)return;
  for(const b of villaBoars){
    const t=Math.min(1,Math.max(0,(now-b.stepAt)/b.stepMs));
    const px=(b.fromX+(b.x-b.fromX)*t)*16,py=(b.fromY+(b.y-b.fromY)*t)*16;
    const k=b.leader?1.75:1.35;
    c.save();c.translate(px+8-8*k,py+15-15*k);c.scale(k,k);
    drawBoarShape(c,b.look,b.mode,now,b.id);
    c.restore();
    boarFloater(c,b,px,py-(k-1)*15,now);
  }
}
function drawBoarPortrait(c,width,height,beat){
  c.fillStyle="#172331";c.fillRect(0,0,width,height);
  c.fillStyle="#3f5b3d";c.beginPath();c.ellipse(width/2,height*.45,76,55,0,0,Math.PI*2);c.fill();
  c.fillStyle="#23364a";c.fillRect(0,height-34,width,34);
  c.save();c.translate(width/2-48,height-108+(beat%2?2:0));c.scale(6,6);
  drawBoarShape(c,"left","calm",0,0);
  c.restore();
}
function villaSpawnHerd(){
  for(const [x,y,look,leader] of villaSpawnPoints){
    if(Math.max(Math.abs(x-state.x),Math.abs(y-state.y))<12)continue;
    if(blocked(villaZone,x,y))continue;
    villaBoars.push({id:villaBoars.length+1,x,y,fromX:x,fromY:y,stepAt:0,stepMs:600,look,leader,mode:"graze",
      modeAt:0,nextAt:performance.now()+500+villaBoars.length*220,chargeUntil:0,calmUntil:0,last:null});
  }
  villaHerdSpawned=true;
}
function villaPlaceFree(x,y,self){
  if(x<villaBounds.left||x>villaBounds.right||y<villaBounds.top||y>villaBounds.bottom)return false;
  if(blocked(villaZone,x,y))return false;
  return !villaBoars.some(o=>o!==self&&o.x===x&&o.y===y);
}
function boarMove(b,now,toX,toY,ms){
  b.fromX=b.x;b.fromY=b.y;
  b.last=[b.x,b.y];
  b.x=toX;b.y=toY;
  b.stepAt=now;b.stepMs=ms;b.nextAt=now+ms;
}
function boarChaseStep(b,now){
  const dx=state.x-b.x,dy=state.y-b.y;
  const horizontal=Math.abs(dx)>=Math.abs(dy);
  const tries=horizontal
    ?[[Math.sign(dx),0],[0,Math.sign(dy)||1],[0,-(Math.sign(dy)||1)]]
    :[[0,Math.sign(dy)],[Math.sign(dx)||1,0],[-(Math.sign(dx)||1),0]];
  for(const [sx,sy] of tries){
    if(!sx&&!sy)continue;
    const nx=b.x+sx,ny=b.y+sy;
    if(nx===state.x&&ny===state.y)return "hit";
    if(b.last&&b.last[0]===nx&&b.last[1]===ny&&tries.length>1&&Math.random()<.7)continue;
    if(!villaPlaceFree(nx,ny,b))continue;
    b.look=sx<0?"left":sx>0?"right":b.look;
    boarMove(b,now,nx,ny,b.leader?135:165);
    return "step";
  }
  return "stuck";
}
function villaHit(b){
  const text=b.leader
    ?"Il capobranco non ha nemmeno rallentato. Hai fatto in tempo a pensare: «Non era nel programma d’esame». Poi il mondo ha girato, il cielo si è fatto di muschio e qualcuno ti ha messo davanti al cartello «Attenzione cinghiali». Avresti dovuto correre verso il campus, oppure lanciare una mela."
    :"Il cinghiale ti ha caricato a testa bassa. Un lampo di setole, un tonfo, un cielo pieno di foglie. Ti sei svegliato davanti al cartello «Attenzione cinghiali». Lui, con un solo sguardo, ti ha ricordato di averlo letto. Avresti dovuto correre verso il campus, oppure lanciare una mela.";
  state.ending={boar:true,title:"Game Over · Villa Ada",text};
  activeScene=null;keys.clear();controls.clear();
  chime([40,34],.1,.09);record("Game Over · Un cinghiale ti ha caricato a Villa Ada.");
  save();renderScene();
}
function tickVillaAda(now){
  if(!state||screen!=="game"||testMode)return;
  const inside=state.zone===villaZone;
  if(!inside){
    if(villaBoars.length)villaBoars.length=0;
    villaHerdSpawned=false;villaWasInside=false;villaLast=now;return;
  }
  if(state.ending||state.prologue){villaLast=now;return;}
  if(activeScene||minigame||$("campusSurprise").open){
    for(const b of villaBoars)b.nextAt+=now-villaLast;
    villaLast=now;return;
  }
  villaLast=now;
  if(!villaHerdSpawned)villaSpawnHerd();
  villaWasInside=true;
  for(const b of villaBoars){
    const dist=Math.hypot(state.x-b.x,state.y-b.y);
    if(b.x===state.x&&b.y===state.y){villaHit(b);return;}
    if(b.mode==="graze"){
      if(dist<6.5&&now>b.calmUntil){
        b.mode="alert";b.modeAt=now;b.look=state.x<b.x?"left":"right";sound("error","map");
      }else if(now>=b.nextAt){
        const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
        const [sx,sy]=dirs[Math.floor(Math.random()*4)];
        if(villaPlaceFree(b.x+sx,b.y+sy,b)&&Math.hypot(state.x-(b.x+sx),state.y-(b.y+sy))>=3){
          b.look=sx<0?"left":sx>0?"right":b.look;
          boarMove(b,now,b.x+sx,b.y+sy,520);
        }else b.nextAt=now+400;
      }
    }else if(b.mode==="alert"){
      b.look=state.x<b.x?"left":"right";
      if(now-b.modeAt>650){b.mode="charge";b.modeAt=now;b.chargeUntil=now+(b.leader?11000:9000);b.nextAt=now;}
    }else if(b.mode==="charge"){
      if(dist>15||now>b.chargeUntil){
        b.mode="graze";b.calmUntil=now+4500;b.nextAt=now+500;
        discover("villa-seminato","Hai seminato un cinghiale a Villa Ada");
      }else if(state.mele>0&&dist<=2.3){
        state.mele-=1;b.mode="eat";b.modeAt=now;b.nextAt=now+(b.leader?4500:7000);
        record("Villa Ada · Hai lanciato una mela: il cinghiale si è fermato a mangiare.");
        discover("villa-mela","La mela diplomatica");sound("coin","map");
      }else if(now>=b.nextAt){
        const result=boarChaseStep(b,now);
        sound("hoof","map");
        if(result==="hit"){villaHit(b);return;}
        if(result==="stuck")b.nextAt=now+220;
      }
    }else if(b.mode==="eat"){
      if(now>=b.nextAt){b.mode="graze";b.calmUntil=now+3500;b.nextAt=now+600;}
    }
  }
}
