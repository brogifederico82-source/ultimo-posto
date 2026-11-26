// Idee extra: diario delle scoperte con traguardi, eventi del campus (altoparlante, telefono, piccione,
// studente in crisi), battute che cambiano con l'orario, reazioni degli altri personaggi, easter egg di
// Radio Luiss e sociologia, mini-missioni di Nina ed epilogo riassuntivo.
// Il resto del gioco chiama solo pochi ganci: installIdee (mappa), tickIdee (ciclo di gioco), ideeRender
// (fine di renderScene), ideeTune (conversationFor), ideeChoices (campusOptionalScene), ideeEventScene e
// ideeObjectScene (getScene), ideeOpenRecap (festa di Pola). Tutto lo stato sta in state.idee (creato al
// primo uso: i salvataggi vecchi continuano a funzionare).

// ---------------------------------------------------------------------------
// Mappa: Nina, la radiolina e il cartello dell'esperimento
// ---------------------------------------------------------------------------
function installIdee(map){
  const garden=map?.zones?.giardino;
  if(!garden||garden.objects.some(o=>o.uid==="idee-nina"))return map;
  const walkable=new Set(["paving","path","grass"]);
  const taken=(x,y)=>garden.objects.some(o=>!walkable.has(o.kind)&&x>=o.x&&x<o.x+(o.w||1)&&y>=o.y&&y<o.y+(o.h||1));
  const spot=(wantX,wantY)=>{
    if(!taken(wantX,wantY))return [wantX,wantY];
    for(let r=1;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
      const x=wantX+dx,y=wantY+dy;
      if(!taken(x,y)&&!taken(x+1,y)&&!taken(x-1,y)&&!taken(x,y+1)&&!taken(x,y-1))return [x,y];
    }
    return [wantX,wantY];
  };
  const [nx,ny]=spot(22,43);
  garden.objects.push({uid:"idee-nina",kind:"student",name:"Nina · Rappresentante di corso",x:nx,y:ny,w:1,h:1,color:"#c0698a",
    solid:false,action:"dialog",text:"",behavior:"idle",speed:1,route:[]});
  const [rx,ry]=spot(42,52);
  garden.objects.push({uid:"idee-radiolina",kind:"sign",name:"Radiolina dimenticata",x:rx,y:ry,w:1,h:1,color:"#c2955a",
    action:"dialog",text:""});
  const [ax,ay]=spot(53,57);
  garden.objects.push({uid:"idee-asch",kind:"sign",name:"Esperimento sociale",x:ax,y:ay,w:1,h:1,color:"#d1ae72",
    action:"dialog",text:""});
  return map;
}

// ---------------------------------------------------------------------------
// Stato, orario e utilità
// ---------------------------------------------------------------------------
function ix(){
  return (state.idee??={talked:[],got:[],news:[],told:{},stats:{},missions:{},radio:[],asked:[],worn:{},active:"",mbase:[],endSeen:"",lastEvent:"",lastCall:"",lastNote:-1});
}
function ideeBump(name){const stats=ix().stats;stats[name]=(stats[name]||0)+1;dirty=true;}
function ideeHash(text){let h=7;for(const ch of String(text))h=(h*31+ch.charCodeAt(0))%1000003;return h;}
function ideePick(list,seed){return list[ideeHash(seed)%list.length];}
function ideeHour(){
  if(typeof window.ideeHourOverride==="number")return window.ideeHourOverride;
  const now=new Date();return now.getHours()+now.getMinutes()/60;
}
function ideeSlot(){
  const h=ideeHour();
  return h>=6&&h<11?"mattina":h>=11&&h<14.5?"pranzo":h>=14.5&&h<18.5?"pomeriggio":h>=18.5&&h<22?"sera":"notte";
}
const ideeRole=o=>o.kind==="professor"?"p":o.kind==="creator"?"c":"o";
function ideeFx(fx){
  if(!fx)return;
  if(fx.coins)awardCoins(fx.coins);
  if(fx.t)change(fx.t[0],fx.t[1]);
}

// ---------------------------------------------------------------------------
// Traguardi e contatori
// ---------------------------------------------------------------------------
function ideeMetrics(){
  const d=ix(),s=d.stats;
  return {
    sorprese:campusSurprises.filter(item=>has(item.id)).length,
    monete:wallet().picked.length,
    mele:Object.keys(state.villaMeli||{}).length*2,
    persone:d.talked.length,
    giochi:Object.values(state.wins||{}).filter(Boolean).length,
    seminati:s.seminati||0,lanciate:s.lanciate||0,
    boar:s.boar||0,traffic:s.traffic||0,guard:s.guard||0,
    annunci:s.annunci||0,telefonate:s.telefonate||0,aiuti:s.aiutiOk||0,aiutiTot:s.aiuti||0,piccioni:s.piccioni||0,
    radio:state.secrets.includes("frequenza-88")?1:0,asch:state.secrets.includes("esperimento-asch")?1:0,
    missioni:Object.values(d.missions).filter(v=>v==="done").length
  };
}
const ideeTraguardi=[
  {id:"occhio",name:"Occhio lungo",desc:"Trova 3 sorprese nascoste",goal:3,val:m=>m.sorprese,
    reward:{name:"Camicia a pois fortunati",field:"motivo",value:2}},
  {id:"cacciatore",name:"Cacciatore di Guagliò",desc:"Trova tutte le sorprese del campus",goal:()=>campusSurprises.length,val:m=>m.sorprese,
    reward:{name:"Cappello da esploratore",field:"accessorio",value:1}},
  {id:"monete",name:"Raccattamonete",desc:"Raccogli 8 monete in giro",goal:8,val:m=>m.monete,
    reward:{name:"Patch del salvadanaio",field:"dettaglio",value:2}},
  {id:"socievole",name:"Socievole",desc:"Parla con 8 persone diverse",goal:8,val:m=>m.persone,
    reward:{name:"Papillon da relatore",field:"accessorio",value:2}},
  {id:"rete",name:"Il tuo nome è nei corridoi",desc:"Parla con 20 persone diverse",goal:20,val:m=>m.persone,
    reward:{name:"Monocolo del professore",field:"accessorio",value:4}},
  {id:"campione",name:"Competitivo",desc:"Vinci 3 minigiochi",goal:3,val:m=>m.giochi,
    reward:{name:"Sneaker bianche da torneo",field:"scarpe",value:1}},
  {id:"diplomatico",name:"Diplomatico del bosco",desc:"Lancia una mela a un cinghiale",goal:1,val:m=>m.lanciate,
    reward:{name:"Sciarpa del fuoricorso",field:"accessorio",value:5}},
  {id:"maratoneta",name:"Maratoneta di Villa Ada",desc:"Semina 3 cinghiali",goal:3,val:m=>m.seminati,
    reward:{name:"Zaino tecnico da trekking",field:"zaino",value:2}},
  {id:"umilta",name:"Scuola di umiltà",desc:"Perdi una volta contro un cinghiale",goal:1,val:m=>m.boar,
    reward:{name:"Baffi a manubrio da cinghialologo",field:"baffi",value:1}},
  {id:"sintonizzato",name:"Sintonizzato",desc:"Trova la frequenza segreta della radiolina",goal:1,val:m=>m.radio,
    reward:{name:"Laccetto Radio Luiss",field:"dettaglio",value:3}},
  {id:"sociologo",name:"Sociologo da panchina",desc:"Fai l’esperimento del cartello",goal:1,val:m=>m.asch,
    reward:{name:"Occhiali da ricercatore",field:"accessorio",value:3}},
  {id:"ripetizioni",name:"Ripetizioni gratis",desc:"Aiuta 3 studenti in crisi",goal:3,val:m=>m.aiuti,
    reward:{name:"Pizzetto da assistente",field:"baffi",value:3}},
  {id:"altoparlante",name:"Orecchio al megafono",desc:"Ascolta 5 annunci dell’altoparlante",goal:5,val:m=>m.annunci,reward:null},
  {id:"reperibile",name:"Sempre reperibile",desc:"Rispondi a 3 telefonate",goal:3,val:m=>m.telefonate,reward:null},
  {id:"volontario",name:"Volontario a metà",desc:"Completa 3 missioni di Nina",goal:3,val:m=>m.missioni,reward:null}
];
const ideeGoal=t=>typeof t.goal==="function"?t.goal():t.goal;
function ideeCheck(){
  if(!state||testMode)return;
  const d=ix();
  for(const n of ideeNews)if(!d.news.includes(n.id)&&n.test()){d.news.push(n.id);dirty=true;}
  const m=ideeMetrics();
  for(const t of ideeTraguardi){
    if(d.got.includes(t.id)||t.val(m)<ideeGoal(t))continue;
    d.got.push(t.id);dirty=true;
    record("Traguardo · "+t.name+(t.reward?" · premio: "+t.reward.name:""));
    ideeToast("Traguardo · "+t.name,t.reward?"Premio nel Diario delle scoperte: "+t.reward.name+".":t.desc+".");
    sound("objective","interface");
  }
}
function ideeWear(t){
  const d=ix(),r=t.reward;
  if(!r)return;
  const worn=d.worn[r.field];
  if(worn?.id===t.id){state.avatar[r.field]=worn.prev;delete d.worn[r.field];}
  else{d.worn[r.field]={id:t.id,prev:worn?worn.prev:state.avatar[r.field]};state.avatar[r.field]=r.value;}
  sound("buy","map");save();ideePanel();
}

// ---------------------------------------------------------------------------
// Messaggi a tempo (altoparlante, traguardi)
// ---------------------------------------------------------------------------
let ideeToastQueue=[],ideeToastBusy=false,ideeToastTimer=0;
function ideeToastElement(){
  let el=document.getElementById("ideeToast");
  if(el)return el;
  const style=document.createElement("style");
  style.textContent="#ideeToast{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:30;width:min(560px,calc(100% - 24px));"+
    "background:#182725;color:var(--cream);border:2px solid #a38358;box-shadow:0 6px 18px #0009;padding:10px 14px;pointer-events:none}"+
    "#ideeToast strong{display:block;color:var(--gold);font-size:.8rem;letter-spacing:.06em;text-transform:uppercase}"+
    "#ideeToast span{display:block;margin-top:3px}"+
    "#ideeDiaryBody h4{margin:14px 0 4px}#ideeDiaryBody ul{padding-left:18px;margin:4px 0}"+
    "#ideeDiaryBody .idee-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:2px 14px;list-style:none;padding:0}"+
    "#ideeDiaryBody li.idee-lock{opacity:.7}#ideeDiaryBody button{margin-left:6px}";
  document.head.append(style);
  el=document.createElement("div");el.id="ideeToast";el.setAttribute("role","status");el.setAttribute("aria-live","polite");el.hidden=true;
  document.body.append(el);
  return el;
}
function ideeToast(title,text){
  ideeToastQueue.push([title,text]);
  if(!ideeToastBusy)ideeToastNext();
}
function ideeToastNext(){
  const el=ideeToastElement(),next=ideeToastQueue.shift();
  if(!next){ideeToastBusy=false;el.hidden=true;return;}
  ideeToastBusy=true;
  const head=document.createElement("strong"),body=document.createElement("span");
  head.textContent=next[0];body.textContent=next[1];
  el.replaceChildren(head,body);el.hidden=false;
  clearTimeout(ideeToastTimer);
  ideeToastTimer=setTimeout(ideeToastNext,Math.min(9000,4500+next[1].length*35));
}

// ---------------------------------------------------------------------------
// Diario delle scoperte (pannello sotto il diario di viaggio)
// ---------------------------------------------------------------------------
function ideeElement(tag,text,attrs){
  const el=document.createElement(tag);
  if(text!=null)el.textContent=text;
  if(attrs)for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);
  return el;
}
function ideePanel(){
  if(!state||screen!=="game")return;
  let box=document.getElementById("ideeDiary");
  if(!box){
    ideeToastElement();
    box=ideeElement("details",null,{id:"ideeDiary","class":"journal"});
    box.append(ideeElement("summary",null,{id:"ideeDiaryTitle"}),ideeElement("div",null,{id:"ideeDiaryBody"}));
    const anchor=$("log").closest("details");
    if(!anchor)return;
    anchor.insertAdjacentElement("afterend",box);
  }
  box.hidden=testMode;
  if(testMode)return;
  const d=ix(),m=ideeMetrics();
  const total=ideeTraguardi.length;
  $("ideeDiaryTitle").textContent="Diario delle scoperte · "+d.got.length+"/"+total+" traguardi";
  const signature=JSON.stringify([m,d.got,d.worn,d.active,d.missions,wallet().coins,state.avatar.accessorio]);
  if(box.dataset.signature===signature)return;
  box.dataset.signature=signature;
  const body=$("ideeDiaryBody");
  const counters=[
    ["Sorprese trovate",m.sorprese+"/"+campusSurprises.length],["Monete raccolte",m.monete+"/"+vialeCoins.length],
    ["Monete in tasca",String(wallet().coins)],["Mele raccolte",String(m.mele)],
    ["Persone incontrate",String(m.persone)],["Minigiochi vinti",String(m.giochi)],
    ["Cinghiali seminati",String(m.seminati)],["Mele lanciate",String(m.lanciate)],
    ["Annunci ascoltati",String(m.annunci)],["Telefonate",String(m.telefonate)],
    ["Studenti aiutati",String(m.aiuti)],["Game Over",String(m.boar+m.traffic+m.guard)]
  ];
  const grid=ideeElement("ul",null,{"class":"idee-grid"});
  for(const [label,value] of counters)grid.append(ideeElement("li",label+" · "+value));
  const list=ideeElement("ul");
  for(const t of ideeTraguardi){
    const done=d.got.includes(t.id),goal=ideeGoal(t),have=Math.min(goal,t.val(m));
    const li=ideeElement("li",(done?"✓ ":"○ ")+t.name+" — "+t.desc+(done?"":" ("+have+"/"+goal+")"),done?{}:{"class":"idee-lock"});
    if(done&&t.reward){
      const wearing=d.worn[t.reward.field]?.id===t.id;
      li.append(document.createTextNode(" · "+t.reward.name));
      const button=ideeElement("button",wearing?"Togli":"Indossa",{type:"button"});
      button.onclick=()=>ideeWear(t);
      li.append(button);
    }
    list.append(li);
  }
  const mission=ideeElement("p",null,{"class":"hint"});
  const active=d.active&&ideeMissione(d.active);
  mission.textContent=active?"Missione di Nina · "+active.title+" · "+Math.min(active.goal,active.progress())+"/"+active.goal+".":
    "Missioni di Nina · "+m.missioni+"/"+ideeMissioni.length+" completate"+(m.missioni<ideeMissioni.length?". Cerca Nina nel campus.":".");
  body.replaceChildren(ideeElement("h4","Contatori"),grid,ideeElement("h4","Traguardi"),list,ideeElement("h4","Missioni facoltative"),mission,
    ideeElement("h4","Il tuo semestre in numeri"),ideeElement("p",ideeRecap(),{"class":"hint"}));
}
function ideeRender(){
  if(!state||testMode)return;
  ideeCheck();
  ideePanel();
  const title=$("journalTitle");
  if(title)title.textContent=title.textContent.replace(/(\d+)\/(\d+)( |$)/,(all,a,b,tail)=>a+"/"+Math.max(Number(a),Number(b))+tail);
}
function ideeRecap(){
  const m=ideeMetrics(),d=ix();
  const parts=["Sorprese trovate: "+m.sorprese+" su "+campusSurprises.length+". Monete raccolte: "+m.monete+". Persone incontrate: "+m.persone+". Minigiochi vinti: "+m.giochi+"."];
  if(m.boar+m.seminati+m.lanciate)parts.push("A Villa Ada hai perso "+m.boar+" "+(m.boar===1?"volta":"volte")+" contro i cinghiali, ne hai seminati "+m.seminati+" e ne hai ammansiti "+m.lanciate+" con una mela: il bilancio è in pareggio morale.");
  if(m.traffic)parts.push("Il 360 ti ha ricordato la precedenza "+m.traffic+" "+(m.traffic===1?"volta":"volte")+".");
  if(m.guard)parts.push("La guardia al tornello ti conosce per nome, o almeno per badge.");
  if(m.piccioni)parts.push("Un piccione custodisce ancora il tuo panino, senza rimorsi.");
  if(m.telefonate)parts.push("Telefonate prese: "+m.telefonate+". Messaggi non letti nel gruppo del corso: 327, come sempre.");
  if(m.aiuti)parts.push("Hai tolto dai guai "+m.aiuti+" "+(m.aiuti===1?"studente":"studenti")+", senza chiedere il programma in cambio.");
  const n=d.got.length,t=ideeTraguardi.length;
  parts.push("Traguardi: "+n+" su "+t+". "+(n>=t?"Collezione completa: il campus ti dedicherebbe una targa, ma la bacheca è già piena.":
    n>=t*.6?"Sei un volto noto del campus, quasi un fatto sociale.":n>=t*.3?"Il campus comincia a riconoscerti. Il bar, per primo.":"Il semestre è ancora lungo: la maggior parte delle cose belle sta dietro l’angolo sbagliato."));
  return parts.join(" ");
}
function ideeOpenRecap(){
  ideeOpen({title:"Il tuo semestre in numeri",text:ideeRecap(),choices:[["Chiudi il diario",()=>null]]},false);
}

// ---------------------------------------------------------------------------
// Eventi del campus
// ---------------------------------------------------------------------------
const ideeAnnunci={
  any:[
    "«Si avvisano gli studenti che l’aula 107 è stata ritrovata. Non si sa ancora in quale edificio.»",
    "«Chi ha lasciato un ombrello in Aula Chiesa è pregato di ritirarlo: ha cominciato a seguire il corso.»",
    "«Il distributore informa che oggi è disponibile solo il tasto “sorpresa”. La sorpresa è un tè al limone.»",
    "«Si ricorda che il silenzio in biblioteca è obbligatorio. Quello al bar è facoltativo, ma raccomandato.»",
    "«Smarrito: un gruppo WhatsApp di progetto. Chi lo trovasse non risponda.»",
    "«Il wifi del campus comunica di essere in manutenzione emotiva. Torna a breve, forse più forte.»",
    "«La fila per il caffè è diventata una corrente accademica. Le iscrizioni sono aperte.»",
    "«Il Rettorato smentisce che i piccioni abbiano ottenuto il badge. Sono in attesa di conferma.»",
    "«Radio Luiss ricorda: in onda alle 13, con tre ascoltatori certificati e uno non identificato.»",
    "«Un cinghiale è stato avvistato a Villa Ada. Lo ricordiamo: il tornello è ancora in sua attesa.»"
  ],
  mattina:[
    "«Buongiorno dal campus: gli studenti che si sentono già in ritardo sono invitati a farsene una ragione.»",
    "«Colazione al bar: cornetto e dubbi esistenziali al prezzo di uno. Il dubbio è in omaggio.»",
    "«Si informa che la lezione delle nove è iniziata alle nove e sette. Il professore ringrazia per la puntualità.»"
  ],
  pranzo:[
    "«Il menù di oggi: pasta, pasta e una variazione sul tema della pasta. In mensa la gratitudine si esprime con un vassoio.»",
    "«Si invitano gli studenti a non studiare a stomaco vuoto. A stomaco pieno è lecito addormentarsi.»",
    "«Chi ha preso l’ultimo posto accanto alla presa è pregato di non far finta di niente.»"
  ],
  pomeriggio:[
    "«Pausa caffè consigliata a tutti. Il prossimo avviso arriverà dopo il prossimo caffè.»",
    "«È il momento del pomeriggio in cui la concentrazione si trasferisce in un’altra aula. Verrà ritrovata.»",
    "«Il gruppo di studio del terzo piano comunica di essere pronto a iniziare. È il terzo giorno consecutivo.»"
  ],
  sera:[
    "«Il campus sta per chiudere. Gli studenti con l’esame domani sono invitati a restare, a loro rischio e pericolo.»",
    "«Luci della sera, appunti sul tavolo e il sospetto di aver sbagliato capitolo. Buona serata a tutti.»",
    "«Radio Luiss saluta gli ascoltatori della sera: sono quattro, e almeno uno sta davvero ascoltando.»"
  ],
  notte:[
    "«Avviso per chi è ancora in giro: il campus dorme, ma qualcuno ha lasciato un esame acceso.»",
    "«Se sentite rumori dal Matroneo, è solo il cursore. Probabilmente.»"
  ]
};
function ideeAnnuncio(){
  const pool=[...ideeAnnunci.any,...ideeAnnunci[ideeSlot()]];
  const d=ix();
  let index=Math.floor(Math.random()*pool.length);
  if(index===d.lastNote)index=(index+1)%pool.length;
  d.lastNote=index;
  ideeBump("annunci");
  ideeToast("Altoparlante del campus",pool[index]);
  sound("post","map");
}

const ideeChiamate=[
  {id:"mamma",who:"Mamma",slots:["mattina","pranzo"],
    open:"«Pronto, tesoro? Hai mangiato? Hai studiato? Hai mangiato mentre studiavi? Ti sento strano.»",
    replies:[
      ["«Tutto sotto controllo, mamma.»","«Quando lo dici tu c’è sempre qualcosa che prende fuoco. Mangia, mi raccomando. Ti ho fatto una ricarica da due euro.»",{coins:2}],
      ["«Sto studiando. Davvero.»","«Allora ti lascio. E se un domani ti laurei, ricordati che l’avevo detto io.»",{t:["ambizione",2]}],
      ["«Mamma, qui non c’è segnale…»","«Eppure mi senti benissimo. È una bella dote.» Riattacca con grande dignità.",{t:["fiducia",1]}]]},
  {id:"chiara",who:"Chiara · Coinquilina",
    open:"«Ehi! Il latte l’hai finito tu? Dimmi di no, ti prego, sto già scrivendo il comunicato.»",
    replies:[
      ["«Non sono stato io.»","«Giuro che ti credo, ma sul frigo c’è comunque il tuo nome. A matita, per educazione.»",{t:["fiducia",2]}],
      ["«Lo ricompro stasera.»","«Questo è un programma di governo. Votato all’unanimità, con astensione del frigo.»",{t:["empatia",2]}],
      ["«Era per l’esame.»","«Allora è forza maggiore. Torna con la caffeina, non con le scuse.»",{t:["pragmatismo",1]}]]},
  {id:"federico",who:"Federico · Gruppo di studio",slots:["pomeriggio","sera"],
    open:"«Siamo in sei in Aula Chiesa e cinque stanno litigando sul titolo della cartella condivisa. Tu dove sei?»",
    replies:[
      ["«Arrivo, tenete il posto.»","«Il posto è già stato assegnato a uno zaino. Troverai un modo per farlo spostare, magari con un sorriso.»",{t:["socialita",2]}],
      ["«Studio meglio da solo.»","«Come tutti. Infatti siamo in sei, da soli, insieme.»",{t:["autocontrollo",2]}],
      ["«Vi mando un riassunto.»","«Mandalo subito: il gruppo è fermo da due ore. Ti passo due monete per il caffè.»",{coins:2}]]},
  {id:"gennaro",who:"Zio Gennaro",slots:["sera","notte"],
    open:"«Pronto, nipote! Studi? Fai bene. Quando dico bene intendo: fai come me, che non ho studiato e ho fatto fortuna. Ma tu studia.»",
    replies:[
      ["«Zio, mi serve un consiglio.»","«Prima l’esame, poi la vita. Anche se di solito è il contrario, ma non dirlo a tua madre.»",{t:["razionalita",2]}],
      ["«Come va il negozio?»","«Chiuso per inventario. L’inventario sono io, che dormo in magazzino. Un abbraccio!»",{t:["empatia",2]}],
      ["«Zio, adesso non posso parlare.»","«Capisco: l’esame è sacro. Ti lascio una moneta da due euro nella busta, per quando torni.»",{coins:2}]]},
  {id:"tommaso",who:"Tommaso · Radio Luiss",
    open:"«Siamo in onda fra tre minuti e abbiamo un buco di un minuto: puoi dire due parole su cosa significa studiare qui?»",
    replies:[
      ["«Si studia in piedi, con una presa a trenta metri.»","«Perfetto, spezzo e metto la sigla. Ti citiamo come “fonte anonima ma esausta”.»",{t:["socialita",2]}],
      ["«Non sono preparato.»","«È il formato ideale: l’improvvisazione ha sempre il miglior ascolto. Parti tu.»",{t:["coraggio",2]}],
      ["«Passo, grazie.»","«Peccato. Il buco lo riempio con la sigla. Ti saluto con un lungo applauso registrato.»",{t:["autocontrollo",1]}]]},
  {id:"sconosciuto",who:"Numero sconosciuto",
    open:"«Buongiorno, la contatto per una proposta vantaggiosa sull’assicurazione del suo motorino.»",
    replies:[
      ["«Non ho il motorino.»","«Ottimo, è il nostro cliente ideale. Le invio comunque il preventivo, così non resta senza.»",{t:["pragmatismo",1]}],
      ["«Sto studiando, richiami fra dieci anni.»","«Segnato in agenda: ci sentiamo dopo la magistrale.»",{t:["autocontrollo",2]}],
      ["Metti giù senza rispondere","Hai fatto la scelta più saggia dell’intera giornata. Anche l’operatore, in fondo, lo capisce.",{coins:1}]]},
  {id:"gruppo",who:"Quelli del corso (gruppo)",slots:["sera","notte"],
    open:"«327 messaggi non letti. L’ultimo dice: “scusate, ma l’esame è domani?”.»",
    replies:[
      ["Leggi tutto il gruppo","Dopo ventisette minuti sai che l’esame è domani, che l’aula è cambiata e che nessuno ha il programma. Sei il più informato del gruppo.",{t:["curiosita",2]}],
      ["Silenzia il gruppo","Silenzio. Per un attimo il campus sembra una chiesa, senza nemmeno l’organo.",{t:["autocontrollo",2]}],
      ["Scrivi «tranquilli, ci penso io»","In otto secondi sei il capogruppo per acclamazione. La carica non prevede stipendio.",{t:["ambizione",2]}]]}
];
function ideeEventoTelefono(){
  const slot=ideeSlot(),d=ix();
  let pool=ideeChiamate.filter(c=>(!c.slots||c.slots.includes(slot))&&c.id!==d.lastCall);
  if(!pool.length)pool=ideeChiamate;
  const call=pool[Math.floor(Math.random()*pool.length)];
  d.lastCall=call.id;
  return {title:"Squilla il telefono",text:"Il telefono vibra con insistenza. Sul display: «"+call.who+"».",choices:[
    ["Rispondi",()=>{
      ideeBump("telefonate");sound("talk","map");
      return {title:call.who,text:call.open,choices:call.replies.map(([label,out,fx])=>[label,()=>{
        ideeFx(fx);record("Telefono · "+call.who+(fx?.coins?" · +"+fx.coins+(fx.coins===1?" moneta":" monete"):""));
        return ideeEnd(call.who,out);
      }])};
    }],
    ["Lascia squillare",()=>null]
  ]};
}

const ideeStudenti=[
  {id:"luca",who:"Luca · Micro, secondo anno",
    ask:"«Scusa, hai un secondo? Se il prezzo del caffè sale e io continuo a comprarlo, che bene sono?»",
    answers:[
      ["Un bene di Giffen, ma solo il lunedì",true,"«Giffen! Lo scrivo sul braccio.» Luca ti stringe la mano con la gratitudine di chi ha appena salvato mezzo esame."],
      ["Un bene da ufficio",false,"«Mmm. Non mi convince, ma suona bene.» Luca ringrazia lo stesso e prende nota, con espressione dubbiosa."],
      ["Un bene che non esiste, come il silenzio in mensa",false,"Luca ride per un minuto intero. Sull’esame ti porta sfortuna, ma sul morale ti lascia un buon ricordo."]]},
  {id:"marta",who:"Marta · Diritto privato",
    ask:"«Aiuto! Un contratto verbale vale o devo farmi dare tutto per iscritto, anche il caffè?»",
    answers:[
      ["Vale, tranne dove la legge vuole la forma scritta",true,"«Ecco, ora lo ricordo!» Marta ripassa mentalmente il capitolo e ti guarda come un manuale con le gambe."],
      ["Vale solo se c’era un testimone",false,"«Un testimone... non male come idea.» Marta scrive, poi cancella, poi scrive di nuovo. Non è convinta, ma è grata."],
      ["Vale se lo firma anche il caffè",false,"Marta ti fissa. Poi annota: «caffè = parte contrattuale?». Lo cancella, ma sorride."]]},
  {id:"edo",who:"Edo · Statistica",
    ask:"«Domanda veloce: se due cose crescono insieme, una causa l’altra? Tipo gelati e scottature.»",
    answers:[
      ["No: correlazione non è causalità",true,"«Giusto! C’è di mezzo il sole, che stavolta non ha un esame.» Edo ti ringrazia a modo suo: con un grafico disegnato sul braccio."],
      ["Solo se il campione è grande e il prof è stanco",false,"Edo prende nota con serietà. Nessuno lo ha mai deluso con tanta cortesia."],
      ["Sì, sempre, ma dipende dalla stagione",false,"«Quindi in inverno meno gelati e più dubbi.» Edo ci pensa un po’. Ti ringrazia comunque."]]},
  {id:"sofia",who:"Sofia · Storia contemporanea",
    ask:"«Scusa, mi ricordi in che anno è stato firmato il Trattato di Roma? Ho la mente come l’orario del 360.»",
    answers:[
      ["Nel 1957",true,"«Millenovecentocinquantasette! Come fai a ricordarlo?» Sofia ti guarda con la gratitudine di chi ha appena trovato il parcheggio."],
      ["Nel 1492, ma con più burocrazia",false,"«Colombo ha firmato anche questo?» Sofia aggrotta la fronte. Poi ride: «Per fortuna non è domani l’esame.»"],
      ["Prima del caffè",false,"«Allora è presto.» Sofia ci pensa. «No, aspetta, è tardi.» Si allontana scuotendo la testa, serena."]]},
  {id:"ugo",who:"Ugo · Sociologia",
    ask:"«Una dritta: come spiegheresti il “fatto sociale” in una riga? Ho il compitino fra venti minuti.»",
    answers:[
      ["Qualcosa che esiste perché molti ci credono, come la fila",true,"«La fila! Perfetto, la Mameli adora gli esempi quotidiani.» Ugo corre via, ripetendo la frase come un mantra."],
      ["Un fatto accaduto in società",false,"«Mmm, un po’ circolare.» Ugo scrive e sottolinea due volte la parola «fatto». Non si sa mai."],
      ["Un evento in cui nessuno ha preso la parola",false,"Ugo fissa il vuoto: «Era il mio piano B.» Ti ringrazia con un sorriso nervoso."]]}
];
function ideeEventoStudente(){
  const d=ix();
  const pool=ideeStudenti.filter(s=>!d.asked.includes(s.id));
  if(!pool.length)return null;
  const s=pool[Math.floor(Math.random()*pool.length)];
  return {title:s.who,text:s.ask,choices:s.answers.map(([label,right,out])=>[label,()=>{
    d.asked.push(s.id);ideeBump("aiuti");
    if(right){ideeBump("aiutiOk");awardCoins(2);change("razionalita",2);}else change("empatia",1);
    record("Campus · "+s.who+(right?" · risposta giusta, 2 monete di gratitudine.":" · ci hai provato."));
    return ideeEnd(s.who,out+(right?" Ti lascia due monete «per il disturbo».":""));
  }])};
}

function ideeEventoPiccione(){
  if(!has("Panino"))return null;
  const stolen=(title,text,fx)=>()=>{
    state.pockets=state.pockets.filter(item=>item!=="Panino");
    ideeFx(fx);record("Campus · Un piccione ti ha preso il panino.");
    return ideeEnd(title,text);
  };
  ideeBump("piccioni");
  return {title:"Un piccione sospetto",text:"Un piccione atterra a mezzo metro con la sicurezza di chi ha già letto il regolamento della mensa. Fissa il tuo panino. Poi te. Poi di nuovo il panino. Il negoziato è breve.",choices:[
    ["Lascia che se lo prenda",stolen("Il piccione ringrazia","Il piccione afferra il panino e ti guarda con una gratitudine appena sufficiente e un senso di impunità ormai totale.",{t:["empatia",2]})],
    ["Inseguilo",stolen("Inseguimento","Corri per otto metri, scavalchi un’aiuola e ti fermi davanti a un muro. Il piccione, dal cornicione, mastica con calma. Sull’aiuola, però, c’è una moneta caduta nel trambusto.",{coins:1})],
    ["Offri un compromesso: metà panino",()=>{
      carry("Piuma del piccione");
      return stolen("Trattativa","Spezzi il panino. Il piccione accetta, poi vuole l’altra metà: ha capito come funzionano i tavoli di trattativa. Se ne va lasciando una piuma, che per lui vale come firma.",{t:["pragmatismo",2]})();
    }]
  ]};
}

let ideeEvent=null,ideeLastTick=0,ideeCheckClock=0,ideeAnnTimer=null,ideeEvTimer=null;
const ideeKinds={telefono:ideeEventoTelefono,studente:ideeEventoStudente,piccione:ideeEventoPiccione};
function ideeEnd(title,text){
  return {title,text,choices:[["Torna al campus",()=>null]]};
}
function ideeOpen(event,noise=true){
  ideeEvent=event;activeScene="idee-evento";state.chatTopic=null;state.freeMoment=null;
  keys.clear();controls.clear();
  if(noise)sound("whistle","map");
  save();renderScene();
}
function ideeTrigger(kind){
  const make=ideeKinds[kind];
  const event=make&&make();
  if(!event)return false;
  ideeOpen(event);
  return true;
}
function ideeEventScene(){
  if(activeScene!=="idee-evento"||!ideeEvent)return null;
  return scene(ideeEvent.title,ideeEvent.text,...ideeEvent.choices.map(([label,action])=>[label,()=>{
    const next=action();
    if(next)ideeEvent=next;else{ideeEvent=null;activeScene=null;}
  }]));
}
function ideeEligible(){
  return screen==="game"&&!testMode&&!state.prologue&&exploringCampus()&&state.zone==="giardino"&&!atViale(state)&&(isFree()||state.campusGateOpen);
}
const ideeBoarModes=new WeakMap();
function ideeWatch(){
  for(const b of villaBoars){
    const before=ideeBoarModes.get(b);
    if(before==="charge"&&b.mode==="graze")ideeBump("seminati");
    if(before==="charge"&&b.mode==="eat")ideeBump("lanciate");
    ideeBoarModes.set(b,b.mode);
  }
  const d=ix(),e=state.ending;
  const key=e?(e.boar?"boar":e.traffic?"traffic":e.guard?"guard":""):"";
  if(!key){if(d.endSeen)d.endSeen="";}
  else if(d.endSeen!==key){d.endSeen=key;ideeBump(key);}
}
function tickIdee(now){
  if(!state||screen!=="game"||testMode){ideeLastTick=now;return;}
  const delta=Math.min(250,now-(ideeLastTick||now));
  ideeLastTick=now;
  ideeWatch();
  ideeCheckClock+=delta;
  if(ideeCheckClock>=1000){ideeCheckClock=0;ideeCheck();ideePanel();}
  if(!ideeEligible())return;
  ideeAnnTimer=(ideeAnnTimer??(40000+Math.random()*30000))-delta;
  ideeEvTimer=(ideeEvTimer??(110000+Math.random()*60000))-delta;
  if(ideeEvTimer<=0){
    ideeEvTimer=150000+Math.random()*90000;
    const d=ix();
    const kinds=Object.keys(ideeKinds).filter(kind=>kind!==d.lastEvent);
    for(let tries=0;tries<4&&kinds.length;tries++){
      const kind=kinds.splice(Math.floor(Math.random()*kinds.length),1)[0];
      if(ideeTrigger(kind)){d.lastEvent=kind;return;}
    }
  }
  if(ideeAnnTimer<=0){ideeAnnTimer=80000+Math.random()*50000;ideeAnnuncio();}
}

// ---------------------------------------------------------------------------
// Battute con l'orario e reazioni dei personaggi
// ---------------------------------------------------------------------------
const ideeOrario={
  mattina:{prompt:"Com’è cominciata la giornata?",
    o:["«Con un caffè e tre buoni propositi. Il caffè è già finito.»","«Mi sono svegliato presto per non arrivare in ritardo. Sono arrivato in ritardo con più dignità.»","«C’è quell’ora in cui il campus sembra ordinato. Dura fino alle nove e dieci.»"],
    p:["«Al mattino spiego meglio. Gli studenti capiscono meglio dopo. Il problema è la fascia di mezzo.»","«Ho aperto la mail alle sette: già quattro studenti convinti che l’appello fosse ieri.»"],
    c:["«Il mattino ha il microfono più pulito. Poi arrivano le chiacchiere e si rovina tutto.»","«Alle otto la voce è ancora quella buona. Alle nove la restituisco al campus.»"]},
  pranzo:{prompt:"Hai già pranzato?",
    o:["«Sto decidendo tra due panini e una crisi. Dopo pranzo ne ho una in meno.»","«A quest’ora il campus ragiona con lo stomaco. Le decisioni migliori si prendono dopo il primo.»","«Alle una tutti in fila. È l’unica coda dove la cortesia viene ricambiata con un vassoio.»"],
    p:["«Pranzo sempre in fretta. Poi passo il pomeriggio a spiegare perché non c’è fretta.»","«In mensa i miei studenti mi riconoscono solo se ho il vassoio.»"],
    c:["«Pranzo in regia: due panini, una cuffia e una diretta. Chi mangia e parla ha la mia stima.»","«A quest’ora il palinsesto è: pasta e posate. Gli ascolti sono altissimi.»"]},
  pomeriggio:{prompt:"Come va il pomeriggio?",
    o:["«Lento. È l’ora in cui il campus si stende e aspetta il caffè delle quattro.»","«Tra una lezione e l’altra ho imparato più cose sulle sedie che sul programma.»","«Il pomeriggio è lungo, ma ha il vantaggio che nessuno ti chiede nulla fino a stasera.»"],
    p:["«Il pomeriggio è l’ora dei ricevimenti. E dei ritardi dei ricevimenti.»","«Ho ancora due lezioni e un’idea. L’idea è andare a casa.»"],
    c:["«Pomeriggio di montaggio: taglio i silenzi e lascio i respiri. Il respiro è il ritmo.»","«Alle cinque c’è la rubrica del bar. Nessuno la ascolta, ma tutti la citano.»"]},
  sera:{prompt:"Ancora qui a quest’ora?",
    o:["«Ho un esame domani. Lo dico così, tutta la sera: lo dico per convincermi di essere organizzato.»","«Il campus la sera cambia. Le luci si accendono e tutti diventano filosofi.»","«Sono qui perché a casa ci sono le distrazioni. Qui ci sono solo le distrazioni più eleganti.»"],
    p:["«Alla sera il campus si ascolta meglio. Peccato che, quando parlo io, ci sia già qualcuno che dorme.»","«Un docente che resta fino a tardi o è dedicato, o ha perso le chiavi.»"],
    c:["«Questa è la mia ora preferita: voce calda, nessuno in regia e il distributore che brontola in sottofondo.»","«La sera abbiamo gli ascoltatori fedeli: quattro. Con voi cinque. Spettacolo.»"]},
  notte:{prompt:"Ma a quest’ora c’è ancora gente?",
    o:["«Io no. Sono una proiezione del tuo sonno arretrato. Vai a dormire, ti aspetta un appello.»","«Di notte il campus è tutto un’eco. Anche i pensieri tornano indietro due volte.»","«Questa è l’ora in cui si studia meglio. Tutti lo dicono. Nessuno lo dimostra.»"],
    p:["«Chi lavora di notte lo fa per scelta o per scadenza. Io, per la seconda.»","«Alle due di notte le tesi sembrano geniali. Alle sette meno.»"],
    c:["«Di notte il microfono è tutto mio. Nessuno disturba, tranne il silenzio, che ogni tanto tossisce.»","«Questa è la fascia “frequenza fantasma”: se ascolti con attenzione, senti il campus respirare.»"]}
};
const ideeNews=[
  {id:"briscola",test:()=>won("bris"),p:"Ho battuto uno a briscola.",
    lines:{p:"«Briscola? Dicono sia sociologia applicata: quattro persone, un mazzo e nessuna fiducia reciproca. Complimenti, allora.»",
      c:"«Una vittoria a briscola! La metto nel palinsesto: “Il Settebello e io”, in onda dopo il traffico.»",
      o:"«Hai battuto qualcuno a briscola? Qui si diventa leggenda per molto meno. E si smette di essere invitati a giocare per molto di più.»"}},
  {id:"felpa",test:()=>state.avatar.taglio===1&&state.avatar.abito===4,p:"Ti piace la mia felpa?",
    lines:{p:"«Bella la felpa. Segno di appartenenza: l’abito fa il membro, direbbe Goffman, a bassa voce.»",
      c:"«La felpa blu! Ti vedo benissimo in copertina. O almeno nel fondo della foto.»",
      o:"«Quella felpa è nuova? Ti fa sembrare uno che sa dov’è l’aula. Non è vero, ma fa il suo effetto.»"}},
  {id:"cinghiale",test:()=>(state.idee?.stats.boar||0)>0,p:"Mi ha caricato un cinghiale.",
    lines:{p:"«Un cinghiale? Lo annoto come osservazione non partecipante, anche se la partecipazione, a quanto vedo, è stata notevole.»",
      c:"«Raccontami tutto: un cinghiale ha chiuso il tuo episodio pilota? Titolo suggerito: “Puntata tragica, ascolti altissimi”.»",
      o:"«Ti ha caricato un cinghiale? Respira. Ormai sei un veterano: i cinghiali sono il nostro esame orale, ma con più pelo.»"}},
  {id:"traffico",test:()=>(state.idee?.stats.traffic||0)>0,p:"Ho attraversato male il viale.",
    lines:{p:"«Il viale? Capita. Il 360 non ha mai accettato giustificazioni, nemmeno con firma del genitore.»",
      c:"«Il 360 ti ha steso? Lo metto nel meteo del traffico: “strisce pedonali, scarsa fiducia”.»",
      o:"«Occhio al viale: il 360 passa quando vuole e si fa rispettare. Guarda, poi attraversa, poi guarda ancora.»"}},
  {id:"guardia",test:()=>(state.idee?.stats.guard||0)>0,p:"Ho litigato con la guardia al tornello.",
    lines:{p:"«La guardia al tornello? Faccia pure. È l’unico esame che qui non prevede appelli straordinari.»",
      c:"«Una scena con la guardia? Se hai la registrazione, in radio andrebbe fortissimo.»",
      o:"«La guardia non scherza. Il badge è come il programma d’esame: se non lo mostri, non passi.»"}},
  {id:"mela",test:()=>(state.idee?.stats.lanciate||0)>0,p:"Ho lanciato una mela a un cinghiale.",
    lines:{p:"«Una mela a un cinghiale? Un perfetto esempio di scambio. Mauss avrebbe preso appunti, tenendosi a distanza.»",
      c:"«Lanciare una mela a un cinghiale! Titolo: “Il dono ai tempi della selva”.»",
      o:"«Una mela a un cinghiale? Coraggioso. E anche un po’ sprecato: le mele qui sono per i cinghiali e per chi ha il coraggio di raccoglierle.»"}},
  {id:"seminato",test:()=>(state.idee?.stats.seminati||0)>0,p:"Ho seminato un cinghiale.",
    lines:{p:"«Hai seminato un cinghiale? Allenamento aerobico a parte, hai dimostrato che anche l’inseguimento più ostinato si esaurisce.»",
      c:"«Un cinghiale seminato? Ti voglio come ospite: “Correre in discesa senza guardarsi indietro”.»",
      o:"«Seminare un cinghiale non è da tutti. Io, per dire, non riesco a seminare nemmeno il volantinaggio.»"}},
  {id:"radiolina",test:()=>state.secrets.includes("frequenza-88"),p:"Ho trovato la frequenza segreta.",who:o=>o.kind==="creator",
    lines:{c:"«Hai trovato la quarta stazione? Non dirlo a nessuno in regia: vorrebbero subito una sigla.»",o:"«Una frequenza segreta? Qui è l’unico posto dove ci credo.»"}},
  {id:"asch",test:()=>state.secrets.includes("esperimento-asch"),p:"Ho fatto l’esperimento del cartello.",who:o=>o.kind==="professor",
    lines:{p:"«Il cartello “guarda in alto”? Asch sorriderebbe. Il conformismo funziona anche senza esame.»",o:"«Hai guardato in alto? Anch’io, e lo facevo da solo.»"}},
  {id:"piccione",test:()=>(state.idee?.stats.piccioni||0)>0,p:"Un piccione mi ha rubato il panino.",
    lines:{p:"«Un piccione ha preso il panino? Un esempio di comportamento opportunista ben documentato in letteratura.»",
      c:"«Il piccione-rapinatore! Lo voglio intervistare. Mandami la scheda del colpevole.»",
      o:"«Il piccione ti ha rubato il panino? Sì, è il solito. Ormai ha il badge ad honorem.»"}},
  {id:"aiuto",test:()=>(state.idee?.stats.aiutiOk||0)>0,p:"Ho dato una mano a uno studente in crisi.",
    lines:{p:"«Hai aiutato uno studente? Si chiama capitale sociale e rende più dei buoni del Tesoro.»",
      c:"«Una buona azione! Ne parliamo nel notiziario delle 13, tra il meteo e il traffico.»",
      o:"«Hai dato una mano a uno studente? Ottimo. Qui si fa a turno: ieri è toccato a me.»"}},
  {id:"giochi",test:()=>Object.values(state.wins||{}).filter(Boolean).length>=3,p:"Sto vincendo parecchio, ultimamente.",
    lines:{p:"«Quante vittorie... Studi così, vedrai che anche la media ne risente.»",
      c:"«Vincitore seriale! Ti serve un podcast di commento.»",
      o:"«Vinci così spesso che quasi mi dispiace. Quasi.»"}},
  {id:"missione",test:()=>Object.values(state.idee?.missions||{}).includes("done"),p:"Ho fatto una missione per Nina.",
    lines:{p:"«Sento che collabori con la rappresentanza di corso. Il volontariato è un fatto sociale, e anche un buon curriculum.»",
      c:"«Hai fatto una missione per Nina? Diventi un volto noto, e Nina ha sempre un’altra cartellina.»",
      o:"«Ho saputo che aiuti Nina. Brava persona, ma poi non ti lascia più andare.»"}}
];
function ideeNewsFor(o){
  const d=ix(),told=d.told[o.uid]||[],role=ideeRole(o);
  for(let i=d.news.length-1;i>=0;i--){
    const n=ideeNews.find(item=>item.id===d.news[i]);
    if(!n||told.includes(n.id)||(n.who&&!n.who(o)))continue;
    return {n,reply:n.lines[role]||n.lines.o};
  }
  return null;
}
function ideeTune(o,profile){
  if(!profile||!state||testMode||!o?.uid)return profile;
  const d=ix();
  if(activeScene===o.uid&&!d.talked.includes(o.uid)){d.talked.push(o.uid);dirty=true;}
  const spoken=state.chatTopic?.uid===o.uid?ideeNews.find(item=>item.p===state.chatTopic.prompt):null;
  if(spoken){const told=(d.told[o.uid]??=[]);if(!told.includes(spoken.id)){told.push(spoken.id);dirty=true;}}
  const slot=ideeSlot(),set=ideeOrario[slot],lines=set[ideeRole(o)]||set.o;
  const extra=[[set.prompt,ideePick(lines,o.uid+slot)]];
  const news=ideeNewsFor(o);
  if(news)extra.push([news.n.p,news.reply]);
  return [...profile,...extra];
}

// ---------------------------------------------------------------------------
// Conversazioni di Nina e missioni facoltative
// ---------------------------------------------------------------------------
Object.assign(conversations,{
  "idee-nina":[
    "Nina ha un gilet pieno di spille e una cartellina con scritto «URGENTE (da tre anni)». «Sono la rappresentante di corso. Raccolgo firme, lamentele e, a volte, sedie. Ho anche missioni facoltative: facoltative nel senso che nessuno ti obbliga. Tranne il senso di colpa.»",
    ["Cos’è la petizione?","«“Più prese, meno ansia”. Per ora ha settantatré firme e un cuoricino disegnato da un anonimo. È un inizio. Il Rettorato risponde che prenderà in esame, cioè che aspetterà.»"],
    ["Perché i rappresentanti non dormono mai?","«Perché ogni volta che chiudiamo gli occhi qualcuno cambia l’orario. L’ultima volta, l’aula 107 si è trasferita in un edificio che non esiste.»"],
    ["Come si fa a diventare rappresentante?","«Basta dire “ci penso io” in un gruppo da trecento persone. Non è una battuta: è il verbale della mia candidatura.»"]
  ]
});
const ideeMissioni=[
  {id:"firme",title:"Il giro delle firme",goal:5,coins:3,
    brief:"«Mi servono cinque persone che non abbiamo ancora in elenco. Parla con cinque persone diverse del campus: nessuna firma, soltanto un buongiorno decente. Poi torna da me e ti pago in monete.»",
    progress:()=>{const d=ix();return d.talked.filter(uid=>!d.mbase.includes(uid)).length;},
    status:n=>"Cinque persone nuove, non ne manca molto: ne hai salutate "+n+"."},
  {id:"mela",title:"Una mela per Elio",goal:1,coins:4,
    brief:"«Elio, quello che sorveglia il distributore, giura che gli serve una mela di Villa Ada per ragioni di bilanciamento nutrizionale. Portagliela: le mele crescono a ovest, nel parco, dove ci sono anche i cinghiali. Poi torna da me.»",
    progress:()=>ix().elioMela?1:0,
    status:n=>n?"Elio ha avuto la sua mela.":"Elio aspetta ancora la mela. Le mele crescono a Villa Ada, a ovest: occhio ai cinghiali."},
  {id:"radio",title:"La quarta stazione",goal:1,coins:3,
    brief:"«Sul campus qualcuno ha dimenticato una radiolina. Una leggenda dice che dopo la terza stazione ne arrivi una quarta. Io non ho tempo: sono una rappresentante. Ma tu sì. Trovala.»",
    progress:()=>state.secrets.includes("frequenza-88")?1:0,
    status:n=>n?"La quarta stazione l’hai sentita.":"La radiolina sta su una panchina del campus. Gira la manopola finché non senti una voce strana."}
];
const ideeMissione=id=>ideeMissioni.find(m=>m.id===id);
function ideeChoices(sceneData,o){
  if(testMode||!state||!o)return sceneData;
  const d=ix();
  if(o.uid==="idee-nina"){
    if(d.active){
      const m=ideeMissione(d.active),n=m.progress();
      if(n>=m.goal)sceneData.choices.unshift(["Consegna: "+m.title,()=>{
        awardCoins(m.coins);d.missions[m.id]="done";d.active="";
        record("Missione · "+m.title+" · "+m.coins+" monete da Nina.");sound("coin","map");chime([64,67,72]);
        state.chatTopic={uid:o.uid,prompt:"Missione compiuta: "+m.title,reply:"«Ottimo lavoro. Ho segnato tutto sulla cartellina, che comunque non riapro da tre anni. Ecco "+m.coins+" monete: sono quelle della cassa comune, quindi in teoria sono di tutti.»"};
      }]);
      else sceneData.choices.unshift(speechChoice(o,"A che punto è «"+m.title+"»?","«"+m.status(n)+"»"));
    }else{
      const open=ideeMissioni.filter(m=>d.missions[m.id]!=="done");
      if(!open.length)sceneData.choices.unshift(speechChoice(o,"Hai altre missioni?","«Per ora no: hai già salvato più campus di quanto richieda il regolamento. Se mi viene in mente qualcosa, ti cerco io.»"));
      for(const m of open.reverse())sceneData.choices.unshift(["Missione facoltativa · "+m.title,()=>{
        d.missions[m.id]="active";d.active=m.id;d.mbase=[...d.talked];
        record("Missione · "+m.title+" (da Nina)");
        state.chatTopic={uid:o.uid,prompt:"Missione facoltativa · "+m.title,reply:m.brief};
      }]);
    }
  }
  if(o.uid==="ca-elio"&&d.active==="mela"&&!d.elioMela){
    if((state.mele||0)>0)sceneData.choices.unshift(["Offri una mela a Elio",()=>{
      state.mele-=1;d.elioMela=true;
      record("Missione · Hai consegnato una mela a Elio.");sound("coin","map");
      state.chatTopic={uid:o.uid,prompt:"Offri una mela a Elio",reply:"Elio la guarda come un diamante. «Una mela di Villa Ada. Con il picciolo. Posso dire a Nina che la missione è tua.» Il distributore, per solidarietà, restituisce due centesimi."};
    }]);
    else sceneData.choices.unshift(speechChoice(o,"Ti serve davvero una mela?","«Una di Villa Ada, sì. Ne basta una. Se è senza vermi, la custodisco come un esame passato.»"));
  }
  return sceneData;
}

// ---------------------------------------------------------------------------
// Easter egg: radiolina (Radio Luiss e sociologia) ed esperimento del cartello
// ---------------------------------------------------------------------------
const ideeStazioni=[
  ["88.0 · Sociologia in Onda","«…e oggi analizziamo il fatto sociale più misterioso del campus: il posto in prima fila che tutti rispettano e nessuno occupa. In studio, come ospite, la fila del bar.»"],
  ["91.4 · Radio Luiss","«Qui Radio Luiss, in diretta da un luogo non meglio precisato. Per la sigla: tre note al sintetizzatore e una porta che sbatte. La porta, per inciso, è la regia.»"],
  ["96.7 · Il Bollettino dei Cinghiali","«Domani sole, con possibilità di cinghiali nel pomeriggio. Venti da ovest, qualche mela in quota. Chi esce da Villa Ada è pregato di non guardarsi indietro.»"],
  ["101.1 · La frequenza fantasma","Tra due stazioni il fruscio si apre. Una voce calma, che sembra la tua: «Per chi ascolta ancora: l’ultimo posto libero è sempre quello accanto a chi sta già studiando. Chiedi permesso, siediti, comincia.» Poi di nuovo il fruscio, e un applauso registrato, molto lontano."]
];
function ideeObjectScene(o){
  if(!state||!o?.uid?.startsWith("idee-"))return null;
  if(o.uid==="idee-radiolina"){
    const d=ix(),turn=state.chatTopic?.uid===o.uid?state.chatTopic:null;
    const unheard=[0,1,2,3].filter(i=>!d.radio.includes(i));
    const label=d.radio.length<3?"Gira la manopola":d.radio.includes(3)?"Continua a girare la manopola":"Gira ancora la manopola";
    return {...scene(o.name,turn?.reply??"Una radiolina a pile, abbandonata su una panchina. La manopola gira ancora. Dall’altoparlante esce un fruscio paziente.",
      [label,()=>{
        const index=unheard.length?unheard[0]:Math.floor(Math.random()*ideeStazioni.length);
        if(!d.radio.includes(index))d.radio.push(index);
        const [name,text]=ideeStazioni[index];
        if(index===3&&!state.secrets.includes("frequenza-88")){discover("frequenza-88","La frequenza segreta della radiolina");awardCoins(3);}
        state.chatTopic={uid:o.uid,prompt:name,reply:text};
        sound(index===3?"objective":"inspect","map");
      }]),playerLine:turn?.prompt};
  }
  if(o.uid==="idee-asch"){
    const seen=state.secrets.includes("esperimento-asch"),turn=state.chatTopic?.uid===o.uid?state.chatTopic:null;
    const intro=seen?"Il cartello ora ha una firma: «Prof.ssa Mameli, con riconoscenza». Più in basso, qualcuno ha scritto: «Ma c’era davvero qualcosa?»":
      "Un cartello a pennarello, attaccato a un palo: «ESPERIMENTO SOCIALE IN CORSO. NON LEGGERE QUESTO CARTELLO. GUARDA IN ALTO.» Sotto, in piccolo: «Grazie dell’attenzione. Le firme dei partecipanti saranno raccolte da Nina.»";
    return {...scene(o.name,turn?.reply??intro,[seen?"Guarda in alto di nuovo":"Guarda in alto",()=>{
      const first=!state.secrets.includes("esperimento-asch");
      if(first)discover("esperimento-asch","Esperimento sociale: «guarda in alto»");
      state.chatTopic={uid:o.uid,prompt:seen?"Guarda in alto di nuovo":"Guarda in alto",reply:first?
        "Alzi gli occhi. Non c’è niente, a parte un nuvolone di fantasia accademica. Dopo qualche secondo, però, due studenti si fermano a guardare nello stesso punto, poi altri tre. Una ragazza chiede: «Che c’è lassù?». Nessuno lo sa, tutti sono sicuri che sia importante. Hai appena visto il conformismo all’opera: Asch avrebbe preso appunti e, da qualche parte, la prof.ssa Mameli sorride.":
        "Guardi in alto di nuovo. Stavolta nessuno ti segue: l’esperimento, a quanto pare, funziona solo la prima volta."};
      sound("inspect","map");
    }]),playerLine:turn?.prompt};
  }
  return null;
}
