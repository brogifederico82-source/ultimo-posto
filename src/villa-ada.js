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
    "Ettore infila il tappo del termos sul binocolo e se ne accorge solo quando provi a parlargli. «Trent’anni alle officine dei tram. In pensione pensavo che mi sarei stancato di alzarmi presto. A quest’ora il parco è tutto mio.»",
    ["Come scappo da un cinghiale?","«Qui in gioco, tieniti sul sentiero e punta all’uscita per il campus. Il branco si ferma al cancello. Se entri fra gli alberi, ti basta un tronco davanti per perdere il vantaggio.»"],
    ["A cosa servono le mele?","«Nel gioco puoi usare una mela per distrarre il cinghiale che ti insegue. Da ogni melo ne raccogli due. Là fuori i cartelli dicono di lasciare in pace gli animali.»"],
    ["Perché ci sono i cinghiali?","«I primi che ricordo li vedevo al mattino, giù verso Monte Antenne. Una volta ho smesso di appuntarmi quanti erano e ho cominciato a segnare dove passavano. Il parco ha strade sue. Noi ne vediamo la metà.»"],
    ["Posso dare da mangiare a Gigi?","«Lascia perdere. L’ho chiamato Gigi come il mio caporeparto. Tutti e due si fermavano appena sentivano una busta di carta. Tutti e due si offendevano se glielo facevi notare.»"]
  ],
  "va-gigi":[
    "Gigi sta al sole vicino a un ceppo. Ha terra sulle setole e una foglia incastrata sopra l’orecchio. Alza il muso al rumore delle tue scarpe, poi torna a grattarsi contro il legno.",
    ["Provi a salutarlo","Gigi smette di grattarsi per un istante. Il naso gli trema. È la sola risposta che ottieni prima che ricominci."],
    ["Gli offri un appunto di sociologia","Gigi annusa il bordo del foglio, sbuffa e si sposta di un passo. Lo rimetti nello zaino. Sotto la frase sul comportamento razionale è rimasta un’impronta bagnata."],
    ["Gli chiedi del branco","Da nord arriva un colpo tra le foglie. Gigi alza un orecchio, osserva il sentiero per qualche secondo e si rimette al sole."]
  ],
  "va-ilaria":[
    "Ilaria ha il nastro isolante intorno a una cuffia e un microfono con la spugna rossa. «Aspetta dieci secondi.» Fa cenno di tacere. Nel silenzio si sente una bicicletta sulla ghiaia. «Questo lo tengo. Il resto vediamo.»",
    ["Che programma è?","«Fuori Campus. Ho cominciato perché mio fratello, quando si è trasferito, mi chiedeva come suonava Roma al mattino. Gli mandavo trenta secondi alla volta. Greta ha sentito l’audio del primo 360 e ci ha costruito una sigla.»"],
    ["Hai già intervistato un cinghiale?","«Ho intervistato Ettore. A metà è passato un cinghiale. In montaggio avevo tagliato il punto in cui Ettore abbassava la voce. Greta mi ha fatto rimettere la pausa: diceva più di tutta la domanda.»"],
    ["Come si entra in redazione?","«Porta una registrazione a Greta. Una cosa piccola, tipo dieci secondi fuori da un’aula quando è finita una lezione. Lì ho capito che chi resta indietro spesso ha più da dire di chi esce per primo.»"]
  ],
  "va-matteo":[
    "Sul taccuino di Matteo ci sono due colonne, «visto» e «supposto». La seconda è piena. «Ferretti mi ha rimandato qua perché nella prima versione della tesina avevo attribuito intenzioni a tutto il branco. Anche a quello che dormiva.»",
    ["Come procede la ricerca?","«Oggi ho scritto sei righe. Sono poche, però posso spiegare come ci sono arrivato. Per il primo semestre avrei inventato la settima piuttosto che lasciare mezza pagina bianca.»"],
    ["Che cos’è l’osservazione partecipante?","«Passi tempo in un posto e provi a capire come cambia quando ci sei tu. Con i cinghiali, partecipare vuol dire soprattutto stare abbastanza lontano perché continuino a fare quello che facevano.»"],
    ["Ti manca il campus?","«Mi manca sapere a che punto della giornata sono dal rumore della macchina del caffè. Stamattina il barista mi ha scritto che il mio tavolo era libero. Gli ho chiesto di lasciarlo a chi ne aveva bisogno.»"]
  ],
  "va-pina":[
    "Pina ha una piega precisa nei pantaloni e un guinzaglio avvolto due volte al polso. Il cane si chiama Durkheim. «Il giro è lo stesso da vent’anni. Prima lo facevamo in tre. Lui adesso rallenta quando arriviamo alla panchina.»",
    ["Ha già incontrato un cinghiale?","«Tre volte. La prima credevo che lui volesse fare l’eroe. Si è messo dietro le mie gambe. Ho pensato che, per una volta, avevamo avuto la stessa idea.»"],
    ["Perché Durkheim?","«Mio marito voleva chiamarlo Emilio, così almeno in casa ne avrebbe avuto uno che lo ascoltava. Poi l’ha chiamato Durkheim davanti a un collega e da allora ci è toccato spiegarlo a ogni veterinario.»"],
    ["Posso accarezzarlo?","«Chiedilo con la mano. Tienila ferma. Se viene lui, sì. Se si rimette a guardare quella panchina, aspettiamo.»"]
  ],
  "va-davide":[
    "Davide ferma il cronometro e appoggia un piede sul bordo del sentiero. La scarpa sinistra ha il laccio nuovo. «Quattro mesi fa facevo dieci chilometri. Oggi torno a fare il giro intero. Al mio ginocchio il concetto di progresso piace più che a me.»",
    ["Da chi scappi?","«Dalla tabella che mi ero fatto a gennaio. Ruggero me l’ha tolta di mano. Glielo rinfaccio ancora, anche se da quando ci alleniamo insieme salgo le scale senza cercare il corrimano.»"],
    ["Ti serve qualcosa?","«Se torni al campus e incontri Ruggero, digli che mi sono fermato prima che mi facesse male. Gli avevo promesso di provare, non di fare l’eroe.»"],
    ["Il tuo record?","«La prima volta che ho corso con mio padre mi ha lasciato vincere. Oggi ci credo ancora per quasi metà del giro, soprattutto nel punto in cui mi ha fatto passare.»"]
  ],
  "va-ferretti":[
    "Ferretti prende appunti a matita con i polsini rimboccati. Ogni tanto cancella una parola e lascia il resto. «Avevo quasi scritto che si erano coordinati. In realtà, in quel momento erano tutti rivolti verso lo stesso rumore.»",
    ["È una lezione di sociologia?","«Lo diventa quando sa distinguere ciò che è successo da ciò che avrebbe voluto vedere succedere. A un mio studente l’ho fatto scrivere a due colonne. Oggi provo a farlo anch’io.»"],
    ["Posso citarla all’esame?","«Citi quello che ha osservato. Se si ricorda solo il mio nome, mi faccia una domanda. È il modo migliore per non trasformarmi in una nota a piè di pagina.»"],
    ["Cosa le ha insegnato Villa Ada?","«A riconoscere il momento in cui voglio troppo una conclusione. È più facile accorgersene qui. In ufficio, quando mi succede, apro un altro documento.»"]
  ],
  "va-brown":[
    "Mr Brown unfolds a paper map along the same worn creases. A street in red ink ends in the middle of a park. «My daughter drew this when she studied in Rome. I asked for the Colosseum this morning and walked here instead. That might be the better day out.»",
    ["This is Villa Ada","«Villa Ada. Of course. She came here after classes when she wanted to walk without meeting anybody she knew. I used to take that personally when she called home. I think I understand it now.»"],
    ["Where did you meet him?","«By the entrance. The man who pointed me this way asked which part of Rome my daughter missed most. I said the food. He said, “Walk a little today and ask her again tonight.”»"],
    ["Do you want to walk back?","«In a minute. I’d like to take a photograph of this bit, so she knows I found it. Could you put the campus entrance on my map? I seem to remember it being a small gate.»"]
  ],
  "ca-pasquale":[
    "Pasquale piega il volantino in quattro per fartelo entrare in tasca. «La prima volta a Roma mi sono presentato all’appello senza sapere dove fosse l’aula. Mo’ sul volantino metto prima il posto e poi la materia.»",
    ["A che ora ci si trova?","«Alle sette del mattino dell’esame. Io arrivo coi cornetti. Se arrivi alle otto ti facciamo posto lo stesso. Una volta hanno aspettato me.»"],
    ["Funziona?","«A volte passi l’esame, a volte capisci perché l’hai preparato male. La regola è che, se uno esce per ultimo, qualcuno resta fuori ad aspettarlo.»"],
    ["Posso portare un amico?","«Portalo. E al primo giro fallo parlare. Quello che arriva nuovo di solito ha la domanda che tutti gli altri si vergognano di fare.»"]
  ],
  "ca-greta":[
    "Greta riavvolge il cavo delle cuffie senza guardare le mani. «Ho lavorato due anni al call center. So riconoscere una persona che sta per riattaccare dal modo in cui inspira. Con gli ospiti viene comodo.»",
    ["Cosa fai di preciso?","«Mi accorgo di quando smettono di rispondere come a un esame. Quello è il pezzo che mando in onda. Ilaria una volta me ne ha portato uno di quattro secondi, quasi tutto silenzio.»"],
    ["Hai una sigla preferita?","«Luiss Weekend. Il rumore in fondo è la porta del 360. Edo voleva una batteria. Gli ho chiesto di aspettare il bus con me cinque minuti.»"],
    ["Posso fare un annuncio in diretta?","«Sì. Dimmelo prima come lo diresti a una persona sola. Poi lo rifacciamo al microfono. Ti prometto che se ti si spezza la voce, aspettiamo.»"]
  ],
  "ca-mameli":[
    "La professoressa Mameli ha un segnalibro in un quaderno senza più copertina. «È il mio primo taccuino di ricerca. Mi serve quando mi viene voglia di pensare di aver sempre saputo fare domande.»",
    ["Che cosa le interessa di più?","«Chi sa che può chiedere una cosa e chi chiede scusa prima ancora di parlare. All’inizio mi interessava la fila al bar. Poi ho notato chi, pur essendo in fila, non riusciva a ordinare.»"],
    ["Mi consiglia un libro?","«Goffman, La vita quotidiana come rappresentazione. Cominci dalle prime dieci pagine, poi guardi una persona tenere aperta una porta. Torni quando sa raccontarmi perché ha aspettato proprio quello che veniva dopo.»"],
    ["Che cos’è un fatto sociale?","«Per esempio, il posto in prima fila lasciato libero per una persona che non c’è più. Nessuno ha scritto la regola. Eppure se si siede lì, qualcuno le dirà che è occupato.»"]
  ],
  "ca-rocco":[
    "Rocco ha una sedia capovolta sulle ginocchia e stringe una vite. «A casa mio padre ripara quelle del circolo. Qui stavano buttando via questa perché ballava un po’. Mi sono fatto lasciare la brugola.»",
    ["Perché collezioni sedie?","«Tengo quelle che stanno per uscire dal campus. È cominciata dopo un seminario: erano tutti seduti tranne uno che non conosceva nessuno. Io avevo una sedia libera, occupata dallo zaino.»"],
    ["Posso sedermi?","«Sì. Però dimmi se balla ancora, che a forza di provarla ho iniziato a compensare io.»"],
    ["Dove le tieni?","«A casa ormai ne ho due. Le altre le lascio nei punti in cui la gente aspetta. Ne avevo messa una vicino al bar, ma qualcuno ce l’ha riportata con un biglietto: “grazie del prestito”.»"]
  ],
  "ca-camilla":[
    "Camilla tiene il cartello delle ripetizioni girato verso il muro mentre rifà un grafico. «Ho preso diciotto al primo appello. In famiglia mi chiamavano quella brava in matematica. Avevo paura di dovergli spiegare che era comunque un voto.»",
    ["Quanto costa la seconda lezione?","«La seconda la paghi. Se la prima ti serviva solo per capire dove ti eri bloccato, va bene così. Portami la foto di un esercizio sbagliato: da lì capiamo quanto ci vuole.»"],
    ["Funziona davvero?","«Funziona quando, a metà, inizi a correggere me. Alla fine dell’anno scorso una ragazza ha trovato un errore su una dispensa. Da allora le faccio vedere i grafici prima di usarli.»"],
    ["Hai un consiglio gratis?","«Sul grafico scrivi prima cosa misurano gli assi. Se non sai come chiamarli, torna al testo. Saltare quel passaggio mi è costato sei punti e un taccuino intero di curve bellissime.»"]
  ],
  "ca-ruggero":[
    "Ruggero ha un fischietto in tasca e una borsa di palloni sgonfi ai piedi. «Allenavo i ragazzini il sabato. Da quando ho smesso di giocare ho scoperto che riesco ancora a capire quando uno sta per farsi male. Lo facevo anch’io, quel passo.»",
    ["Che modulo giochi?","«Dipende da chi viene. A un terzino che non ha mai toccato palla serve un compagno disposto a ridargliela. Il modulo lo disegno dopo.»"],
    ["Hai mai allenato qualcuno?","«Sto aiutando Davide a riprendere a correre. La prima volta gli ho chiesto di tornare dopo cinque minuti. Ha fatto quaranta metri e mi ha detto che preferiva così. Da lì siamo partiti davvero.»"],
    ["Mi alleneresti?","«Sabato porta le scarpe. Se siamo pochi, facciamo due tocchi. Se siamo troppi, la prima squadra la facciamo con chi di solito si sceglie per ultimo.»"]
  ],
  "ca-lucia":[
    "Lucia tiene un carrello di libri con le coste tutte dalla stessa parte. Una raccolta di poesie ha la copertina riparata con il nastro da pacchi. «A casa non avevamo una libreria. I libri stavano nel mobile dei piatti. Ti doveva venire voglia di uno anche apparecchiando.»",
    ["Che libro mi dai?","«Mi racconti l’ultima cosa che hai letto per conto tuo? Anche la guida del telefono. Se in cambio mi chiedi cosa dovresti leggere, finisce che ti do un libro per il Luissino che penso tu sia.»"],
    ["Quanto posso tenerlo?","«Una settimana. Se sfori, torna lo stesso. Una persona ha tenuto per sei mesi il mio preferito perché si vergognava del ritardo. L’ho saputo quando ha lasciato il campus.»"],
    ["Hai un posto preferito?","«Il Matroneo prima delle nove. Ogni tanto vado lì a leggere una cosa mia prima di aprire il carrello. Mi piace ricordarmi il motivo per cui l’ho riempito.»"]
  ],
  "ca-elio":[
    "Elio si è segnato su un foglio i tasti difettosi del distributore. Accanto al B4 c’è scritto «due colpi». «Il tecnico arriva dopo le undici. Quelli che iniziano alle otto ci sono già.»",
    ["Perché lo sorvegli?","«Una mattina una ragazza ci ha lasciato dentro l’ultimo euro. Doveva stare fino alle sei. Ho aperto la mia borsa e avevo solo un panino. Il giorno dopo me ne ha portato uno uguale.»"],
    ["Cosa vende?","«Il tè non è male. Quelli che sostengono di voler prendere il caffè nero schiacciano il B4 quando pensano che non li veda.»"],
    ["Posso offrirti qualcosa?","«Se vai al bar, un bicchiere d’acqua. Non trovo mai il tempo di salire quando sento tutte queste monetine cadere.»"]
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
