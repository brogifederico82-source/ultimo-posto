const teachingRooms={
  "lezione-micro":{
    code:"A201", title:"Microeconomia", teacher:"Prof.ssa Conti", corridor:"secondo", door:[6,3],
    overview:"Domanda, elasticità, scelte del consumatore e vincolo di bilancio.",
    topics:[
      ["Il prezzo cresce del 2% e la quantità domandata cala del 4%. Qual è l’elasticità approssimata?",["−2","−0,5","+2"],0,"Dividi la variazione della quantità per quella del prezzo. −4% diviso 2% dà −2."],
      ["Con 24 euro e un prezzo di 6 euro per quaderno, quanti quaderni puoi acquistare al massimo?",["2","4","6"],1,"Il vincolo permette di spendere 24 euro. Quattro quaderni esauriscono il budget."],
      ["Se il prezzo del bene A scende, cosa isola l’effetto di sostituzione?",["Il cambiamento della pendenza del vincolo di bilancio","Il cambiamento del reddito nominale","La variazione della popolazione"],0,"Cambia il prezzo relativo. La compensazione elimina l’aumento del potere d’acquisto nella parte di variazione attribuita alla sostituzione."],
      ["Se aumenta il prezzo di un bene sostituto, che cosa succede di norma alla domanda del bene considerato?",["Aumenta","Diminuisce","Non può cambiare"],0,"Il bene considerato diventa relativamente più conveniente e alcuni consumatori si spostano verso di esso."]
    ]
  },
  "lezione-finanziaria":{
    code:"A202", title:"Matematica finanziaria", teacher:"Prof. Bellini", corridor:"secondo", door:[21,3],
    overview:"Capitalizzazione composta, valore attuale e confronto tra flussi.",
    topics:[
      ["Investi 100 euro al 10% composto per due anni. Quanto ottieni?",["120 euro","121 euro","110 euro"],1,"Il secondo anno maturi interessi anche sui primi 10 euro. Il montante è 100 × 1,10²."],
      ["Quanto valgono oggi 110 euro pagabili fra un anno se il tasso è del 10%?",["100 euro","99 euro","121 euro"],0,"Il valore attuale è 110 diviso 1,10, cioè 100 euro."],
      ["Con un tasso mensile effettivo dell’1%, qual è il tasso annuo effettivo?",["12% esatto","Circa 12,68%","1%"],1,"Dodici periodi composti danno (1,01)¹² − 1, circa 12,68%."],
      ["Un progetto costa 100 oggi e incassa 121 fra due anni. Qual è il VAN al 10%?",["21","11","0"],2,"Attualizzando 121 al 10% per due anni si ottiene 100. Il valore attuale netto è zero."]
    ]
  },
  "lezione-statistica":{
    code:"A204", title:"Statistica", teacher:"Prof.ssa Riva", corridor:"secondo", door:[26,3],
    overview:"Sintesi dei dati, probabilità e interpretazione dei risultati.",
    topics:[
      ["Qual è la mediana dei valori 3, 4, 7, 10, 19?",["4","7","8,6"],1,"Una volta ordinati i cinque valori, la mediana è il terzo."],
      ["Quale misura è in genere meno sensibile a un valore estremo?",["Media","Mediana","Massimo"],1,"La mediana dipende dalla posizione centrale, quindi l’ampiezza di un valore estremo conta meno."],
      ["Una correlazione fra due variabili dimostra una relazione causale?",["Sempre","Solo se è positiva","No"],2,"L’associazione può dipendere da una terza variabile, causalità inversa o coincidenza."]
    ]
  },
  "lezione-azienda":{
    code:"A205a", title:"Economia aziendale e Business", teacher:"Prof. De Santis", corridor:"secondo", door:[31,3],
    overview:"Contabilità, margini e decisioni d’impresa.",
    topics:[
      ["Attività per 180 e debiti per 110. Qual è il patrimonio netto?",["70","110","290"],0,"Sottrai le passività dalle attività: 180 − 110 = 70."],
      ["Prezzo 20, costo variabile unitario 12. Quanto contribuisce una vendita a coprire i costi fissi?",["12","8","32"],1,"Il margine di contribuzione unitario è prezzo meno costo variabile, cioè 8."],
      ["Qual è il collo di bottiglia in una linea con capacità di 12 e 8 unità all’ora?",["La stazione da 12","La stazione da 8","Nessuna"],1,"La stazione più lenta limita la capacità della linea quando tutte le unità devono attraversarla."]
    ]
  },
  "lezione-ai":{
    code:"A206a", title:"Management and Artificial Intelligence", teacher:"Prof.ssa Leone", corridor:"secondo", door:[6,11],
    overview:"Dati, validazione dei modelli e applicazioni aziendali.",
    topics:[
      ["Un modello funziona benissimo sui dati di addestramento ma male su dati nuovi. Che cosa sospetti?",["Overfitting","Cifratura","Che sia sempre più accurato"],0,"Il modello potrebbe aver imparato dettagli che non si ripetono nei dati nuovi."],
      ["Su quali dati va stimata la media usata per standardizzare le variabili?",["Su tutti i dati prima di dividerli","Sul solo training set","Sul solo test set"],1,"Si stimano i parametri sul training set, poi si applicano agli altri insiemi per evitare fughe di informazione."],
      ["Per un modello usato in azienda, che cosa confronti oltre all’accuratezza?",["Solo il numero di dipendenti","Solo la dimensione del file","Costi, latenza e impatto degli errori"],2,"La migliore metrica tecnica non basta se usare il modello è troppo lento o gli errori più gravi ricadono sulle persone."]
    ]
  },
  "lezione-politica":{
    code:"A207", title:"Scienze Politiche e PPE", teacher:"Prof. Greco", corridor:"secondo", door:[12,11],
    overview:"Legittimità, istituzioni, rappresentanza e filosofia politica.",
    topics:[
      ["La legittimità di un potere riguarda soprattutto…",["La sua giustificazione","Il numero di uffici","Il solo costo delle elezioni"],0,"La legittimità riguarda le ragioni per cui l’esercizio del potere può essere considerato giustificato."],
      ["Che cosa può cambiare se aumenti la soglia di accesso ai seggi?",["Le opportunità di rappresentanza dei partiti minori","L’età di tutti gli elettori","La popolazione del Paese"],0,"Una soglia più alta può escludere partiti al di sotto della percentuale richiesta."],
      ["Quale problema affronta il patto in Hobbes?",["Il calcolo del PIL","L’insicurezza dello stato di natura","L’elezione diretta di tutti i magistrati"],1,"Il patto istituisce un potere comune per uscire dall’insicurezza dello stato di natura."]
    ]
  },
  "lezione-macro":{
    code:"A209", title:"Macroeconomia", teacher:"Prof.ssa Gentile", corridor:"secondo", door:[22,11],
    overview:"PIL, inflazione e cicli economici.",
    topics:[
      ["L’inflazione scende dal 5% al 2%. Come chiami il fenomeno?",["Deflazione","Disinflazione","Iperinflazione"],1,"I prezzi continuano a crescere, ma più lentamente."],
      ["Quale indicatore corregge il valore della produzione per la variazione dei prezzi?",["PIL nominale","Popolazione residente","PIL reale"],2,"Il PIL reale usa una misura depurata dall’effetto delle variazioni dei prezzi."],
      ["Con prezzi stabili, se aumenta la produzione finale interna, quale grandezza cresce?",["Il PIL reale","L’inflazione necessariamente","Il disavanzo necessariamente"],0,"Con prezzi stabili, maggiori quantità prodotte aumentano il PIL reale a parità delle altre condizioni."]
    ]
  },
  "lezione-global-law":{
    code:"A4", title:"Global Law", teacher:"Prof.ssa Rossi", corridor:"parenzo-corridoio", door:[5,3],
    overview:"Comparative law, treaties and international organizations.",
    topics:[
      ["What most directly distinguishes a treaty from customary international law?",["A treaty rests on agreement; custom on practice accepted as law","Treaties never create obligations","Custom only applies in one city"],0,"The sources differ in how their obligations arise."],
      ["Why can the same legal term have different effects across countries?",["Legal effects depend on institutions and interpretation","It always produces identical effects","Vocabulary alone determines the result"],0,"Legal comparatists consider the context in which rules operate, including procedural and institutional differences."],
      ["Why start with an international organization’s founding instrument?",["It lists all future disputes","It defines powers and procedures","It replaces every national law"],1,"It is a starting point for assessing what the organization has authority to do."]
    ]
  },
  "lezione-giurisprudenza":{
    code:"A5", title:"Giurisprudenza", teacher:"Prof. Nanni", corridor:"parenzo-corridoio", door:[22,3],
    overview:"Argomentazione, fonti e ragionamento giuridico.",
    topics:[
      ["Se due persone raccontano lo stesso episodio diversamente, da dove parti?",["Individuo fatti comuni, fatti contestati e prove disponibili","Scelgo subito il racconto più lungo","Ignoro gli elementi che non conosco"],0,"Separare fatti e inferenze permette di formulare una tesi controllabile."],
      ["Per argomentare su un caso, quale sequenza è più chiara?",["Esito, titolo, esito","Fatti rilevanti, regola, applicazione, conclusione","Conclusione senza fonti"],1,"La struttura rende visibile come colleghi la regola al caso."],
      ["Una controparte propone un’interpretazione alternativa. Qual è la risposta più utile?",["Ignorarla","Distinguere ciò che condividete e mettere alla prova le premesse che divergono","Sostituire le prove con una battuta"],1,"Confronta le premesse e spiega perché gli elementi del caso sostengono una lettura rispetto all’altra."]
    ]
  }
};

function installTeachingRooms(map){
  const romania=map.zones.secondo, seminar=map.zones["parenzo-interno"], parenzo=map.zones.parenzo;
  if(!romania||!seminar||!parenzo)return map;
  romania.width=Math.max(romania.width,38);
  romania.height=Math.max(romania.height,15);
  romania.name="Edificio centrale · Corridoio del secondo piano";
  const object=(uid,kind,name,x,y,extra={})=>({uid,kind,name,x,y,...extra});
  const parenzoDoor=parenzo.objects.find(o=>o.uid==="parenzo-inside");
  const seminarExit=seminar.objects.find(o=>o.uid==="parenzo-interno-exit");
  if(parenzoDoor&&seminarExit&&!map.zones["parenzo-corridoio"]){
    parenzoDoor.target="parenzo-corridoio#esterno";
    parenzoDoor.name="Entra nell’edificio di Parenzo";
    const outside=parenzo.objects.find(o=>o.uid==="parenzo-interior-return");
    if(outside)outside.target="parenzo-corridoio";
    seminar.name="Parenzo · T02 · Seminario";
    seminarExit.name="Torna al corridoio";
    seminarExit.target="parenzo-corridoio#seminario";
    map.zones["parenzo-corridoio"]={
      name:"Parenzo · Corridoio del primo piano",width:28,height:14,ground:"floor",
      objects:[
        object("parenzo-corridoio-arrivo","entrance","Arrivo dalle scale",13,11,{target:"esterno"}),
        object("parenzo-corridoio-uscita","door","Scendi e torna all’esterno",13,12,{action:"portal",target:"parenzo#parenzo-corridoio"}),
        object("parenzo-porta-seminario","door","T02 · Aula del seminario",13,3,{action:"portal",target:"parenzo-interno#outside"}),
        object("parenzo-rientro-seminario","entrance","Uscita del seminario",13,4,{target:"seminario"}),
        object("parenzo-bacheca-aule","sign","Pianta del primo piano",9,8,{action:"dialog",
          text:"A4 · Global Law. T02 · Seminario. A5 · Giurisprudenza. Le lezioni sono assegnate in base al calendario di gioco."})
      ]
    };
  }
  for(const [prefix,hall] of [["romania",romania],["parenzo",map.zones["parenzo-corridoio"]]]){
    if(!hall||hall.objects.some(o=>o.uid===prefix+"-corridoio-pavimento"))continue;
    hall.objects.push(
      object(prefix+"-corridoio-pavimento","paving","Corsia del corridoio",1,6,{w:hall.width-2,h:3,color:"#ad9b85"}),
      object(prefix+"-corridoio-parete","wall","Parete delle aule",0,0,{w:hall.width,h:1,solid:true}),
      object(prefix+"-corridoio-panca","bench","Panchina d’attesa",hall.width-5,8,{w:3,solid:true}),
      object(prefix+"-corridoio-bacheca","sign","Lezioni di oggi",hall.width-6,6,{action:"dialog",
        text:prefix==="romania"?
          "A201 Microeconomia · A202 Matematica finanziaria · A204 Statistica · A205a Economia aziendale e Business · A206a Management and AI · A207 Scienze Politiche e PPE · A209 Macroeconomia.":
          "A4 Global Law · T02 Seminario · A5 Giurisprudenza."})
    );
  }
  for(const [id,course] of Object.entries(teachingRooms)){
    const hallway=map.zones[course.corridor];
    if(map.zones[id]||!hallway)continue;
    const [x,y]=course.door;
    const doorName=course.code+" · "+course.title;
    hallway.objects.push(
      object(id+"-porta","door",doorName,x,y,{action:"portal",target:id+"#corridoio",text:course.overview}),
      object(id+"-rientro","entrance","Rientro "+course.code,x,y+(y<7?1:-1),{target:id})
    );
    const objects=[
      object(id+"-ingresso","entrance","Ingresso",12,12,{target:"corridoio"}),
      object(id+"-uscita","door","Torna al corridoio",12,13,{action:"portal",target:course.corridor+"#"+id}),
      object(id+"-docente","professor",course.teacher,12,4,{action:"native",native:id}),
      object(id+"-lavagna","board","Lavagna · "+course.title,8,1,{w:8,action:"dialog",text:course.overview}),
      object(id+"-cattedra","desk","Cattedra",9,3,{w:3,solid:true}),
      object(id+"-vetrata","window","Finestre",2,1,{w:4}),
      object(id+"-vetrata-est","window","Finestre",19,1,{w:4}),
      object(id+"-parete","wall","Parete della lavagna",0,0,{w:26,solid:true}),
      object(id+"-corridoio-banchi","paving","Passaggio centrale",11,6,{w:3,h:6,color:"#ac9b87"})
    ];
    for(const column of [3,7,16,20])for(const row of [6,8,10]){
      objects.push(object(id+"-banco-"+column+"-"+row,"desk","Banco",column,row,{w:2,solid:true}));
    }
    map.zones[id]={name:doorName,width:26,height:15,ground:"floor",objects};
  }
  return map;
}

function paintTeachingSigns(context,zone,cameraX,cameraY,zoom,width,height){
  if(zone!=="secondo"&&zone!=="parenzo-corridoio")return;
  context.save();
  context.textAlign="center";
  context.font="bold 7px monospace";
  for(const door of room(zone).objects){
    if(door.action!=="portal")continue;
    const code=door.name.match(/^(A[0-9]+[a-z]?|T02) · /)?.[1];
    if(!code)continue;
    const x=((door.x+.5)*16-cameraX)*zoom;
    const y=((door.y-.42)*16-cameraY)*zoom;
    if(x<15||x>width-15||y<6||y>height-6)continue;
    const plaqueWidth=context.measureText(code).width+6;
    rect(context,"#192438",x-plaqueWidth/2,y-6,plaqueWidth,10);
    context.fillStyle="#ffe3a9";
    context.fillText(code,x,y+1);
  }
  context.restore();
}

function teachingScene(id){
  const course=teachingRooms[id];
  const sessions=state.lessonSessions??={};
  const progress=sessions[id];
  const restart=()=>{sessions[id]={index:0,correct:0,answer:null};};
  const title=course.teacher+" · "+course.title;
  if(!progress)return scene(title,course.overview,["Inizia gli esercizi",restart]);
  if(progress.index>=course.topics.length){
    return scene(title,"Risultato: "+progress.correct+"/"+course.topics.length+". Puoi ripetere l’esercitazione o uscire nel corridoio.",["Riprova",restart]);
  }
  const [question,choices,correct,explanation]=course.topics[progress.index];
  if(progress.answer!==null){
    const feedback=progress.answer===correct?"Risposta corretta. ":"Risposta corretta: "+choices[correct]+". ";
    return scene(title,feedback+explanation,[progress.index+1===course.topics.length?"Vedi il risultato":"Domanda successiva",()=>{
      progress.index++;
      progress.answer=null;
      if(progress.index===course.topics.length)record(course.title+" · "+progress.correct+"/"+course.topics.length);
    }]);
  }
  return scene(title,(progress.index+1)+"/"+course.topics.length+" · "+question,...choices.map((label,index)=>[label,()=>{
    if(progress.answer!==null)return;
    progress.answer=index;
    if(index===correct)progress.correct++;
  }]));
}
