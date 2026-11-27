// Strade vive: rende il quartiere reale (celle pq-*, pola, parenzo) riconoscibile e abitato, restando fedele ai dati.
// Dati dal generatore (scripts/overture/to-zone.py, in quartiere-dati.js): nome della via per tessera (RLE), strisce pedonali vere
// (segmenti "crosswalk"), auto e motorini parcheggiati, passanti, panchine, cartelli dei luoghi LUISS e dei parchi.
// Gli oggetti generati hanno uid "q-<zona>-..." e non vengono salvati: si rigenerano dai dati (vedi quartiere.js).
// Attenzione: niente const/let a livello di file (queste funzioni girano mentre world.js viene ancora eseguito).

function stradeViveColori(){
  return stradeViveColori.d||(stradeViveColori.d={
    auto:["#e8e6e0","#e8e6e0","#c9ccd1","#c9ccd1","#8a9097","#8a9097","#3a3f47","#26292e","#2f4a7a","#8f2f33","#3d6b4f","#b5aea0","#d4b64e"],
    moto:["#e8bc45","#c9473f","#3f6fb0","#2f2f33","#d9d6cd","#5d9b6b"]});
}

// ---------- nome della via in cui ci si trova ----------
function stradeViveVie(id){
  const cache=stradeViveVie.c||(stradeViveVie.c={});
  if(Object.hasOwn(cache,id))return cache[id];
  const d=typeof quartiereDati==="function"?quartiereCache()[id]:null;
  if(!d||!d.via){cache[id]=null;return null;}
  const celle=new Uint8Array(d.w*d.h).fill(255);
  const alfabeto="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let k=0;
  for(const m of d.via.matchAll(/([A-Za-z_])(\d+)/g)){
    const n=+m[2],v=m[1]==="_"?255:alfabeto.indexOf(m[1]);
    celle.fill(v,k,k+n);k+=n;
  }
  return cache[id]={celle,nomi:d.nomi||[],w:d.w,h:d.h};
}
function stradeViveVia(id,x,y){
  const v=stradeViveVie(id);
  if(!v||x<0||y<0||x>=v.w||y>=v.h)return null;
  const i=v.celle[y*v.w+x];
  return i===255?null:(v.nomi[i]??null);
}
// Ripiego: cartello con il nome della via più vicino (entro 30 tessere).
function stradeViveCartello(id,x,y){
  const d=typeof quartiereCache==="function"?quartiereCache()[id]:null;
  let best=null,dist=30;
  for(const [a,b,nome] of d?.insegne||[]){
    const k=Math.abs(a-x)+Math.abs(b-y);
    if(k<dist){dist=k;best=nome;}
  }
  return best;
}
// Nome da mostrare nell'HUD: la via sotto i piedi; null se la zona non è del quartiere.
function stradeViveLuogo(){
  if(!state||!stradeViveVie(state.zone))return null;
  return stradeViveVia(state.zone,Math.round(state.x),Math.round(state.y))||stradeViveCartello(state.zone,state.x,state.y)||null;
}
function tickStradeVive(now){
  const chiave=state.zone+"|"+state.x+"|"+state.y;
  if(tickStradeVive.k===chiave)return;
  tickStradeVive.k=chiave;
  const nome=stradeViveLuogo();
  if(nome===null)return;
  const el=document.getElementById("zone");
  const testo=tr(nome);
  if(el&&el.textContent!==testo)el.textContent=testo;
}

// ---------- suono: parco, vicolo, strada grande ----------
function stradeViveSuono(){
  const z=state.zone,v=stradeViveVie(z);
  if(!v)return "street";
  const d=quartiereCache()[z],cx=Math.round(state.x),cy=Math.round(state.y);
  let strade=0,edifici=0,verde=0,tot=0;
  for(let y=Math.max(0,cy-4);y<=Math.min(d.h-1,cy+4);y++)for(let x=Math.max(0,cx-4);x<=Math.min(d.w-1,cx+4);x++){
    const c=d.righe[y][x];tot++;
    if(c==="r")strade++;else if(c==="B")edifici++;else if(c==="."||c==="a")verde++;
  }
  if(verde/tot>.6)return "parco";
  if(strade/tot>.3)return "viale";
  if(edifici/tot>.45&&strade/tot<.12)return "vicolo";
  return "street";
}
if(typeof sfxProfiles!=="undefined"){
  sfxProfiles.parco=sfxProfiles.parco||{wind:.6,leaves:.8,traffic:.12,murmur:.05,room:0,birds:.5};
  sfxProfiles.vicolo=sfxProfiles.vicolo||{wind:.05,leaves:0,traffic:.18,murmur:.55,room:0,birds:.1};
}

// ---------- disegno delle strisce pedonali: barre parallele alla direzione di attraversamento ----------
function stradeViveZebra(c,o,color){
  const lungoY=o.h>=o.w,px=o.w*16,py=o.h*16;     // in coordinate locali 1 unità = o.w pixel in x, o.h pixel in y
  c.fillStyle=color;
  if(lungoY){
    const n=Math.max(3,Math.floor(px/5.5)),passo=px/n;
    for(let i=0;i<n;i++)c.fillRect((i*passo+passo*.2)/o.w,1/o.h,passo*.6/o.w,(py-2)/o.h);
  }else{
    const n=Math.max(3,Math.floor(py/5.5)),passo=py/n;
    for(let i=0;i<n;i++)c.fillRect(1/o.w,(i*passo+passo*.2)/o.h,(px-2)/o.w,passo*.6/o.h);
  }
}

// ---------- passanti ----------
function stradeVivePersone(){
  return stradeVivePersone.d||(stradeVivePersone.d={
    luiss:[
      ["Studente di passaggio","student","«Sto cercando un’aula che esiste solo sul portale. Di persona, nessuno l’ha mai vista.»","Dove stai andando?","«A lezione. Probabilmente. Il corridoio decide per me.»"],
      ["Studentessa con il caffè","sportGlasses","«Terzo caffè prima delle dieci. Il quarto lo prendo in prestito dal futuro.»","Consigli per gli esami?","«Ripassa i primi capitoli due volte. Gli ultimi non li legge nessuno, nemmeno chi li ha scritti.»"],
      ["Studente con le cuffie","student","«Ascolto la registrazione della lezione a velocità doppia. Capisco metà, in metà tempo.»","Funziona?","«Ho risparmiato un’ora e perso un concetto. Il cambio mi sembra onesto.»"],
      ["Matricola smarrita","student","«Cerco la sede giusta. In zona ce ne sono tante e tutte sembrano quella sbagliata.»","Come ti orienti?","«Seguo quello con la cartellina. Ha l’aria di sapere dove va. Di solito sbaglia anche lui.»"],
      ["Studente con il badge","sportGlasses","«Il badge funziona a tutti i tornelli, tranne quello davanti a cui ho fretta.»","Succede spesso?","«Solo quando guardo l’orologio. Quindi sempre.»"],
      ["Studentessa in ritardo","student","«Il 360 è passato. In senso contrario, ma è passato.»","Ce la fai?","«Se corro, arrivo sudata. Se cammino, arrivo giustificata dalla fila. Sto valutando.»"],
      ["Studente di Giurisprudenza","sportGlasses","«Ho un codice sottobraccio che pesa più del mio zaino. E si legge peggio.»","È difficile?","«Gli articoli sono brevi. Sono i commi a essere lunghi.»"],
      ["Studentessa al telefono","student","«No, non sono in ritardo: sto arrivando con calma strategica.»","Con chi parlavi?","«Con la mia coscienza. Dice che dovrei studiare. Ho messo il silenzioso.»"]
    ],
    verde:[
      ["Runner del mattino","athlete","«Il parco alle sette è un’altra città: più silenziosa e con meno scuse.»","Quanto corri?","«Finché trovo una panchina per fermarmi a guardare il panorama. Cioè poco.»"],
      ["Passeggiatore con cane","professor","«Il mio cane conosce tutte le panchine del parco. Io solo le due vicino alle fontanelle.»","Come si chiama?","«Dipende da chi lo chiama. Con me risponde. Con i vicini, mai.»"],
      ["Turista con la mappa","creator","«La mappa dice che il sentiero è qui. Il parco dice che è altrove. Credo abbia ragione il parco.»","Cosa cerchi?","«Un punto panoramico. O una panchina all’ombra. Ormai prendo il primo che trovo.»"],
      ["Signora con il giornale","professor","«Una volta qui si saliva a piedi. Oggi si sale cercando parcheggio.»","Viene spesso?","«Ogni mattina. Il parco non cambia mai idea: è la cosa che mi piace di più.»"],
      ["Ciclista a piedi","athlete","«Ho la bici ma oggi la spingo. La salita, ti dirò, è una questione di principio.»","Di quale principio?","«Quello per cui chi sale ha sempre ragione. Almeno finché non arriva in cima.»"],
      ["Turista in cerca d’ombra","creator","«Ho visto più platani oggi che in tutta la vita. Sono tutti uguali e li ho fotografati tutti.»","Ti piace?","«Moltissimo. Tranne il momento in cui ho perso il gruppo.»"]
    ],
    quartiere:[
      ["Passante","student","«Qui si cerca parcheggio come altrove si cerca lavoro: con ottimismo e poca speranza.»","È così difficile?","«Ho visto gente girare tre volte l’isolato e salutare le stesse auto come vecchi amici.»"],
      ["Signora con la spesa","professor","«Il quartiere è tranquillo. Salvo quando ci sono i lavori. O le feste. O le lezioni.»","Come si sta qui?","«Bene. Basta non avere fretta e non possedere un motorino.»"],
      ["Corriere con il pacco","creator","«Tutti i citofoni sono giusti. Tutti, tranne quello che cerco.»","Quanti ne consegni?","«Abbastanza da conoscere i cani di mezza via. Loro mi conoscono meglio dei padroni.»"],
      ["Spazzino","cleaner","«Pulire le strade qui è un lavoro di fantasia: il ritmo lo decidono le foglie.»","Sono tante?","«In autunno, sempre una più dell’altra. Non so come facciano a organizzarsi.»"],
      ["Turista","creator","«Mi hanno detto che il quartiere è elegante. Al momento ho incontrato più motorini che statue.»","Cosa hai visto?","«Un portone bellissimo, una fontanella e un cartello che ho letto tre volte.»"],
      ["Passante con l’ombrello","professor","«Pioverà? Porto l’ombrello da quando ho deciso di non portarlo.»","Funziona?","«Quando lo dimentico piove. Quando lo porto, no. L’universo ha un suo stile.»"]
    ]
  });
}
function stradeVivePersona(id,n,d){
  const p=d.pedoni[n];
  if(!p)return null;
  const tag=d.tag||[],seme=p[4],pool=stradeVivePersone();
  const gruppo=tag.includes("luiss")&&seme%5<3?"luiss":tag.includes("verde")&&seme%5<3?"verde":"quartiere";
  const lista=pool[gruppo],voce=lista[(seme*7+n)%lista.length];
  const via=stradeViveVia(id,p[0],p[1])||stradeViveCartello(id,p[0],p[1]);
  return {nome:voce[0],kind:voce[1],intro:voce[2],argomenti:[[voce[3],voce[4]],
    ["Dove siamo?",via?"«Siamo in "+via+". Almeno, così dice il cartello.»":"«In un posto con più motorini che spazi.»"]]};
}
// Conversazione per i passanti del quartiere (hook di conversationFor in dialogue.js).
function stradeViveConversazione(o){
  const m=/^q-(.+)-pedone-(\d+)$/.exec(o.uid);
  if(!m||typeof quartiereCache!=="function")return null;
  const d=quartiereCache()[m[1]];
  const persona=d&&stradeVivePersona(m[1],+m[2],d);
  return persona?[persona.intro,...persona.argomenti]:null;
}

// ---------- oggetti generati per una cella ----------
// 'evita': posizioni [x,y] di oggetti della storia e punti speciali (porte, ingressi, cartelli) da non coprire.
function stradeViveOggetti(id,d,evita){
  const out=[],col=stradeViveColori();
  const lontano=(x,y,r)=>!evita.some(([a,b])=>Math.abs(a-x)<=r&&Math.abs(b-y)<=r);
  (d.strisce||[]).forEach(([x,y,w,h],n)=>out.push({uid:"q-"+id+"-zebra-"+n,kind:"zebra",name:"Strisce pedonali",x,y,w,h,color:"#e4deca",solid:false,rotation:0}));
  (d.auto||[]).forEach(([x,y,rot,c],n)=>{
    const vert=rot%180!==0,w=vert?1:2,h=vert?2:1;
    if(!lontano(x,y,2)||(vert?!lontano(x,y+1,2):!lontano(x+1,y,2)))return;
    out.push({uid:"q-"+id+"-auto-"+n,kind:"car",name:"Auto parcheggiata",x,y,w,h,color:col.auto[c%col.auto.length],solid:true,rotation:rot,behavior:"idle",route:[]});
  });
  (d.moto||[]).forEach(([x,y,rot,c],n)=>{
    if(!lontano(x,y,2))return;
    out.push({uid:"q-"+id+"-moto-"+n,kind:"scooter",name:"Motorino parcheggiato",x,y,w:1,h:1,color:col.moto[c%col.moto.length],solid:true,rotation:rot,behavior:"idle",route:[]});
  });
  (d.panchine||[]).forEach(([x,y,rot],n)=>{
    if(!lontano(x,y,1)||!lontano(x+1,y,1))return;
    out.push({uid:"q-"+id+"-panchina-"+n,kind:"bench",name:"Panchina",x,y,w:2,h:1,color:"#a08a5b",solid:true,rotation:rot||0});
  });
  (d.parchi||[]).forEach(([x,y,nome],n)=>out.push({uid:"q-"+id+"-parco-"+n,kind:"sign",name:nome,x,y,w:1,h:1,color:"#2f7a4a",solid:false,
    action:"event",text:"Area verde: "+nome+". Il nome viene dai dati cartografici aperti (Overture Maps)."}));
  (d.luoghi||[]).forEach(([x,y,nome,indirizzo],n)=>out.push({uid:"q-"+id+"-luogo-"+n,kind:"sign",name:nome+" · "+indirizzo,x,y,w:1,h:1,color:"#2a56a8",solid:false,
    action:"event",text:nome+". Indirizzo: "+indirizzo+". Nome e posizione vengono dai dati cartografici aperti (Overture Maps) e non sono stati verificati sul posto."}));
  (d.pedoni||[]).forEach((p,n)=>{
    const persona=stradeVivePersona(id,n,d);
    if(!persona||!lontano(p[0],p[1],1))return;
    const colore={athlete:"#a94e47",sportGlasses:"#527f87",student:"#bb6268",professor:"#b09461",creator:"#9966a3",cleaner:"#80a471"}[persona.kind]||"#bb6268";
    out.push({uid:"q-"+id+"-pedone-"+n,kind:persona.kind,name:persona.nome,x:p[0],y:p[1],w:1,h:1,color:colore,solid:false,action:"dialog",native:"",text:persona.intro,
      target:"",behavior:"patrol",speed:p[5],route:[[p[2],p[3]]],rotation:0,variant:p[4]%3,gate:"",missionTarget:"",auto:false});
  });
  return out;
}
