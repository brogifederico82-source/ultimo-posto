// Map data and rendering
const layers={
  terreno:"Terreno",edifici:"Edifici",arredi:"Arredamento",persone:"Personaggi",decori:"Decorazioni"
};
const catalog={
  "Villa Alberoni":[["polaVilla","Villino di Villa Alberoni","edifici","#a78464",21,6,true],["polaNinfeo","Tinello Alberoni","edifici","#b4a285",10,5,true],["polaBuffet","Buffet","arredi","#dad0b8",7,2,true],["polaLights","Filo di luci","decori","#ffe1a1",8,1]],
  "Campus LUISS":[["domeHall","Padiglione metallico","edifici","#52616a",7,4,true],["chapel","Aula Chiesa","edifici","#ad6c51",6,5,true],["faculty","Edificio in cotto","edifici","#ae6b50",8,4,true],["court","Campo sportivo","decori","#527d72",7,4]],
  "Viale Romania":[["shelter","Pensilina","edifici","#466e7a",4,2,true],["pillar","Pilastro con urna","edifici","#e9e4d3",1,3,true],["booth","Guardiola","edifici","#ddc4a0",3,3,true],["pine","Pino marittimo","decori","#526d49",3,3],["cypress","Cipresso","decori","#355246",1,2],["luiss","Scritta LUISS","decori","#325988",5,2],["zebra","Strisce pedonali","decori","#e4deca",1,3],["bus","Autobus ATAC 360","persone","#a84a45",5,1],["shuttle","Navetta LUISS","persone","#e4e5da",4,1,true],["car","Auto","persone","#b96054",2,1],["scooter","Motorino","persone","#e8bc45"]],
  "Architettura":[["wall","Muro","edifici","#887870",1,1,true],["door","Porta","edifici","#ac754d"],["window","Finestra","edifici","#78a5a5"],["stairs","Scale","edifici","#a09b88"],["roof","Edificio","edifici","#ab6654",4,3,true]],
  "Terreno":[["grass","Prato","terreno","#42774e"],["road","Asfalto","terreno","#687078"],["paving","Pavimentazione","terreno","#a59a87"],["path","Sentiero","terreno","#b3a18a"],["floor","Pavimento interno","terreno","#806a65"]],
  "Vegetazione":[["orangeTree","Arancio","decori","#34754b",2,2,true],["roseBed","Roseto","decori","#d75f81",2,1],["flowerMeadow","Aiuola mista","decori","#eab266",2,1],["tree","Albero","decori","#4c7553",1,1,true],["hedge","Siepe","decori","#557c4e",1,1,true],["bush","Cespuglio","decori","#648052"],["flowers","Fiori","decori","#d8a86f"]],
  "Arredamento":[["radioVan","Furgone di Radio Luiss","arredi","#ad3039",3,2,true],["desk","Scrivania","arredi","#a68864",2,1,true],["chair","Sedia","arredi","#9f7851",1,1,true],["sofa","Divano","arredi","#9b685a",2,1,true],["shelf","Scaffale","arredi","#916c4c",1,1,true],["bench","Panchina","arredi","#a08a5b",2,1,true]],
  "Università":[["classroom","Aula","edifici","#a67762",3,2,true],["board","Lavagna","arredi","#487062"],["vending","Distributore","arredi","#9b6456",1,1,true],["turnstile","Tornello","edifici","#84958a"],["library","Biblioteca","edifici","#897460",3,2,true]],
  "Intrattenimento":[["foos","Biliardino","arredi","#48866d",2,1,true],["ping","Ping pong","arredi","#397d82",2,1,true],["bris","Tavolo da briscola","arredi","#80694b",2,1,true],["poker","Tavolo da poker","arredi","#33725e",2,1,true]],
  "Personaggi":[["athlete","Gymbro","persone","#a94e47"],["heatedStudent","Studente con IQOS","persone","#af6380"],["sportGlasses","Studente con occhiali sportivi","persone","#527f87"],["student","Studente","persone","#bb6268"],["guard","Guardia","persone","#6089aa"],["creator","Influencer","persone","#9966a3"],["bartender","Barista","persone","#ae775e"],["professor","Professore","persone","#b09461"],["cleaner","Spazzino","persone","#80a471"],["boar","Cinghiale","persone","#6a5848"]],
  "Decorazioni":[["sign","Cartello","decori","#d1ae72"],["bin","Cestino","decori","#71877c",1,1,true],["lamp","Lampione","decori","#d2ac66"],["fountain","Fontana","decori","#699b9b",2,2,true],["nasone","Nasone romano","decori","#465556"],["rope","Cordone","decori","#a94057"],["entrance","Ingresso","decori","#d1af6d"],["event","Evento","decori","#c67668"],["goal","Obiettivo","decori","#d6bb74"]]
};
const assets=Object.fromEntries(Object.values(catalog).flat().map(row=>[row[0],row]));
const assetVariants=["Classica","Chiara","Scura"];
const mapDataKey="ultimo-posto-mappa-v1";
const campusLayoutVersion=3;
const embedded=$("edEmbedded").textContent.trim();
let embeddedId=2166136261;
for(let i=0;i<embedded.length;i++)embeddedId=Math.imul(embeddedId^embedded.charCodeAt(i),16777619)>>>0;
const mapStorageKey=embedded?mapDataKey+"-"+embeddedId:mapDataKey;
function saveProfileKey(mode){
  return saveKey+(embedded?"-"+embeddedId:"")+(mode==="free"?"-free":"");
}

const mapId=()=>globalThis.crypto?.randomUUID?.()??("obj-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2));
const maxCampusZones=100;
const stockCampus=installTeachingRooms(JSON.parse($("edOriginal").textContent));
const polaZones=["pola","pola-cortile"];
const sourcePola={ingresso:stockCampus.zones.ingresso,...Object.fromEntries(polaZones.map(id=>[id,stockCampus.zones[id]]))};
const normalizedPola=normalizeCampus({version:1,zones:sourcePola}).zones;
const originalPolaStock=Object.fromEntries(polaZones.map(id=>[id,[sourcePola[id],normalizedPola[id]].map(
  zone=>new Map(zone.objects.map(o=>[o.uid,JSON.stringify(o)]))
)]));
const priorInteriors=normalizeCampus({version:1,zones:Object.fromEntries(
  ["ingresso","aula-chiesa","polivalente","loft"].map(id=>[id,stockCampus.zones[id]])
)});
stockCampus.zones.giardino.objects.push({
  uid:"giardino-poker",kind:"poker",name:"Tavolo da poker · Giardino",x:44,y:38,w:2,h:1,
  color:"#33725e",solid:true,action:"native",native:"poker"
});
const gardenStudentNames={
  "walker-0":["Giulia · Rappresentante","Niccolò · Rappresentante"],
  "walker-1":["Samir · Studente","Andre · Studente"],
  "walker-3":["Elena · Tutor","Pierfrancesco · Tutor"],
  "walker-4":["Luca · Matricola","Alessandrino · Matricola"],
  "walker-5":["Sara · Pendolare","Microsoft · Pendolare"],
  "courtyard-student":["Alice · Dottoranda","Assessore · Dottorando"]
};
function updateGardenStudentNames(map){
  for(const student of map.zones.giardino?.objects??[]){
    const names=gardenStudentNames[student.uid];
    if(names&&student.name===names[0])student.name=names[1];
  }
}
const legacyCampusOutline=[[20,8],[24,9],[29,12],[34,14],[42,17],[49,19],[61,25],[73,38],[84,49],[85,60],[83,73],[68,91],[9,78],[5,53],[13,28],[17,15]];
function campusOutlineFor(zone){
  return zoneObjects(zone).byId.has("cinta-plan-22:8")?romaniaBoundary:legacyCampusOutline;
}
function insideCampusOutline(x,y,outline=romaniaBoundary){
  return outline.reduce((inside,[ax,ay],i)=>{
    const [bx,by]=outline[(i+1)%outline.length];
    return (ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax?!inside:inside;
  },false);
}
function refineRomania(map){
  const garden=map.zones.giardino;
  if(garden?.width!==144||!garden.objects.some(o=>o.uid==="entry-from-panama"&&o.x===72&&o.y===47))return map;
  const add=(uid,kind,name,x,y,extra={})=>({uid,kind,name,x,y,...extra});
  if(!garden.objects.some(o=>o.uid==="ada-gate")){
    for(const o of garden.objects){
      if((o.uid.startsWith("orto-")||o.uid==="giardiniera-nora")&&o.y<16)o.y+=12;
      if(o.uid==="sport-court"&&o.x===9&&o.y===52)Object.assign(o,{kind:"roof",name:"Prese d’aria · The Dome 2",color:"#737f79",solid:true});
    }
    garden.objects.push(add("ada-gate","door","Sentiero per Villa Ada",79,47,{action:"portal",target:"villa-ada#panama"}));
    garden.objects.push(add("ada-return-point","entrance","Rientro da Villa Ada",78,47,{target:"villa-ada"}));
    garden.objects.push(add("dome2-vent-sign","sign","Prese d’aria · The Dome 2",14,59,{action:"dialog",text:"Griglie di aerazione. Il passaggio al Dome 2 è dal piazzale più a sud."}));
  }
  if(!map.zones["villa-ada"]&&Object.keys(map.zones).length<maxCampusZones){
    map.zones["villa-ada"]={name:"Villa Ada · Sentiero nel parco",width:26,height:16,ground:"grass",objects:[
      add("ada-entry","entrance","Ingresso dal sentiero",3,12,{target:"panama"}),
      add("ada-exit","door","Torna verso il campus",3,13,{action:"portal",target:"giardino#villa-ada"}),
      add("ada-walk","path","Sentiero",3,10,{w:18,h:2}),
      add("ada-bench","bench","Panchina del ripasso",10,9,{w:2,solid:true,action:"event",text:"Sul retro della panchina qualcuno ha inciso: «Se sai spiegarlo al pino, sei pronto». Il pino ha appena chiesto un esempio."}),
      add("ada-notes","sign","Cartello delle deviazioni",20,9,{action:"event",text:"Sentiero breve: 5 minuti. Sentiero lungo: 20 minuti. Sentiero di chi ripassa: da definire dopo l’appello."}),
      ...[5,9,14,18,22].flatMap(x=>[add("ada-pine-n-"+x,"pine","Pino",x,3,{w:2,h:3}),add("ada-pine-s-"+x,"pine","Pino",x,13,{w:2,h:3})])
    ]};
  }
  const classroomNotes=[
    "«Se la risposta è dipende, scrivi da che cosa». Sul retro ci sono tre variabili e una macchia di caffè.",
    "Un vecchio appunto chiede di spiegare la lezione senza usare la parola più importante. Una mano diversa ha scritto «ci vediamo al prossimo appello».",
    "Due compagni hanno lasciato due soluzioni incompatibili e lo stesso punto interrogativo. Puoi segnare il foglio nel diario."
  ];
  for(const [id,z] of Object.entries(map.zones)){
    if(!Object.hasOwn(teachingRooms,id)&&!["aula-chiesa","aula-toti","polivalente","dome2","parenzo-interno"].includes(id))continue;
    const uid=id+"-retro-banco";
    if(z.objects.some(o=>o.uid===uid))continue;
    const y=z.height-3;
    const x=[2,4,6].find(x=>!z.objects.some(o=>(o.solid||o.action)&&x>=o.x-1&&x<o.x+(o.w??1)+1&&y>=o.y-1&&y<o.y+(o.h??1)+1))??2;
    const course=teachingRooms[id]?.title??z.name.split(" · ").at(-1);
    z.objects.push(add(uid,"sign","Appunto lasciato in aula",x,y,{action:"event",
      text:course+" · "+classroomNotes[id.length%classroomNotes.length]}));
  }
  return map;
}
const originalMap=normalizeCampus(refineRomania(installPola(addRadioVan(furnishCampusFountains(improveDome2Entrance(addVialeArcade(joinRomaniaEntrance(furnishCampusInteriors(stockCampus)))))))));
updateGardenStudentNames(originalMap);
for(const [uid,x,y] of [
  ["giardiniera-nora",35,25],
  ["viale-ingresso-bacheca",25,76],
  ["viale-luiss-shop",20,77]
]){
  const object=originalMap.zones.giardino.objects.find(item=>item.uid===uid);
  Object.assign(object,{x,y});
}

arrangeRomaniaSurfaces(originalMap.zones.giardino);
traceRomaniaCampus(originalMap.zones.giardino);
installQuartiere(originalMap);
installVillaAda(originalMap);
installLore(originalMap);
installIdee(originalMap);
installSegreti(originalMap);
quartiereRifinisci(originalMap);
updateCampusPlaces(originalMap);
furnishCampusGardens(originalMap);
const firstFloor=originalMap.zones.primo;
firstFloor.objects=firstFloor.objects.filter(o=>!(o.kind==="grass"||o.uid==="primo-31"||o.uid==="primo-32"));
widenCampusWalks(originalMap.zones.giardino);
widenAcademicHalls(originalMap);
Object.assign(originalMap.zones,normalizeCampus(originalMap).zones);

const oldEntrance=[{"uid":"ingresso-guardia","kind":"guard","name":"Guardia","x":4,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#6089aa","solid":true,"action":"native","native":"guardia","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-bacheca","kind":"sign","name":"Bacheca","x":10,"y":5,"w":1,"h":1,"rotation":0,"variant":0,"color":"#d1ae72","solid":true,"action":"native","native":"bacheca","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-varco","kind":"turnstile","name":"Tornello","x":17,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#84958a","solid":true,"action":"native","native":"varco","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-start","kind":"entrance","name":"Punto di ingresso","x":3,"y":6,"w":1,"h":1,"rotation":0,"variant":0,"color":"#d1af6d","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-4","kind":"paving","name":"Pavimentazione","x":3,"y":2,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-5","kind":"paving","name":"Pavimentazione","x":16,"y":2,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-6","kind":"paving","name":"Pavimentazione","x":3,"y":3,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-7","kind":"paving","name":"Pavimentazione","x":16,"y":3,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-8","kind":"paving","name":"Pavimentazione","x":0,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-9","kind":"paving","name":"Pavimentazione","x":1,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-10","kind":"paving","name":"Pavimentazione","x":2,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-11","kind":"paving","name":"Pavimentazione","x":3,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-12","kind":"paving","name":"Pavimentazione","x":4,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-13","kind":"paving","name":"Pavimentazione","x":5,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-14","kind":"paving","name":"Pavimentazione","x":6,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-15","kind":"paving","name":"Pavimentazione","x":7,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-16","kind":"paving","name":"Pavimentazione","x":8,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-17","kind":"paving","name":"Pavimentazione","x":9,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-18","kind":"paving","name":"Pavimentazione","x":10,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-19","kind":"paving","name":"Pavimentazione","x":11,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-20","kind":"paving","name":"Pavimentazione","x":12,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-21","kind":"paving","name":"Pavimentazione","x":13,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-22","kind":"paving","name":"Pavimentazione","x":14,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-23","kind":"paving","name":"Pavimentazione","x":15,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-24","kind":"paving","name":"Pavimentazione","x":16,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-25","kind":"paving","name":"Pavimentazione","x":17,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-26","kind":"paving","name":"Pavimentazione","x":18,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-27","kind":"paving","name":"Pavimentazione","x":19,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-28","kind":"paving","name":"Pavimentazione","x":3,"y":5,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-29","kind":"paving","name":"Pavimentazione","x":16,"y":5,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-30","kind":"paving","name":"Pavimentazione","x":3,"y":6,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-31","kind":"paving","name":"Pavimentazione","x":16,"y":6,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-32","kind":"paving","name":"Pavimentazione","x":0,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-33","kind":"paving","name":"Pavimentazione","x":1,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-34","kind":"paving","name":"Pavimentazione","x":2,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-35","kind":"paving","name":"Pavimentazione","x":3,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-36","kind":"paving","name":"Pavimentazione","x":4,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-37","kind":"paving","name":"Pavimentazione","x":5,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-38","kind":"paving","name":"Pavimentazione","x":6,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-39","kind":"paving","name":"Pavimentazione","x":7,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-40","kind":"paving","name":"Pavimentazione","x":8,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-41","kind":"paving","name":"Pavimentazione","x":9,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-42","kind":"paving","name":"Pavimentazione","x":10,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-43","kind":"paving","name":"Pavimentazione","x":11,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-44","kind":"paving","name":"Pavimentazione","x":12,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-45","kind":"paving","name":"Pavimentazione","x":13,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-46","kind":"paving","name":"Pavimentazione","x":14,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-47","kind":"paving","name":"Pavimentazione","x":15,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-48","kind":"paving","name":"Pavimentazione","x":16,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-49","kind":"paving","name":"Pavimentazione","x":17,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-50","kind":"paving","name":"Pavimentazione","x":18,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-51","kind":"paving","name":"Pavimentazione","x":19,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-52","kind":"paving","name":"Pavimentazione","x":3,"y":8,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-53","kind":"paving","name":"Pavimentazione","x":16,"y":8,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-54","kind":"paving","name":"Pavimentazione","x":3,"y":9,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-55","kind":"paving","name":"Pavimentazione","x":16,"y":9,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-56","kind":"paving","name":"Pavimentazione","x":3,"y":10,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-57","kind":"paving","name":"Pavimentazione","x":16,"y":10,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-58","kind":"road","name":"Asfalto","x":0,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-59","kind":"road","name":"Asfalto","x":1,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-60","kind":"road","name":"Asfalto","x":2,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-61","kind":"road","name":"Asfalto","x":3,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-62","kind":"road","name":"Asfalto","x":4,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-63","kind":"road","name":"Asfalto","x":5,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-64","kind":"road","name":"Asfalto","x":6,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-65","kind":"road","name":"Asfalto","x":7,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-66","kind":"road","name":"Asfalto","x":8,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-67","kind":"road","name":"Asfalto","x":9,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-68","kind":"road","name":"Asfalto","x":10,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-69","kind":"road","name":"Asfalto","x":11,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-70","kind":"road","name":"Asfalto","x":12,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-71","kind":"road","name":"Asfalto","x":13,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-72","kind":"road","name":"Asfalto","x":14,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-73","kind":"road","name":"Asfalto","x":15,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-74","kind":"road","name":"Asfalto","x":16,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-75","kind":"road","name":"Asfalto","x":17,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-76","kind":"road","name":"Asfalto","x":18,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-77","kind":"road","name":"Asfalto","x":19,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-78","kind":"tree","name":"Albero","x":0.0625,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-79","kind":"tree","name":"Albero","x":2.9375,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-80","kind":"tree","name":"Albero","x":5.125,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-81","kind":"tree","name":"Albero","x":13.875,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-82","kind":"tree","name":"Albero","x":17.25,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-83","kind":"tree","name":"Albero","x":18.75,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]}];
let campus=loadCampus();
let testMode=false, editorState=null;
function freshMap(){return quartiereMarcaMappa(structuredClone(originalMap));}
function mapText(value,max,fallback=""){return typeof value==="string"?value.slice(0,max):fallback;}
function mapNum(value,low,high,fallback){
  return typeof value==="number"&&Number.isFinite(value)?Math.min(high,Math.max(low,value)):fallback;
}
function normalizeCampus(raw){
  if(raw?.version!==1||!raw.zones||typeof raw.zones!=="object"||Array.isArray(raw.zones))throw Error("Il file deve contenere una mappa di Ultimo Posto.");
  const entries=Object.entries(raw.zones);
  if(!entries.some(([id])=>id==="ingresso")||entries.length>maxCampusZones)throw Error("La mappa deve avere un ingresso e al massimo "+maxCampusZones+" ambienti.");
  const normalized={version:1,zones:Object.create(null)};
  const seen=new Set();
  for(const [id,zone] of entries){
    if(!/^[a-z][a-z0-9-]{0,35}$/.test(id)||!zone||!Array.isArray(zone.objects)||zone.objects.length>20000)throw Error("Un ambiente ha un formato non valido.");
    const width=Math.round(mapNum(zone.width,8,144,20)),height=Math.round(mapNum(zone.height,8,144,12));
    const ground=Object.hasOwn(assets,zone.ground)&&assets[zone.ground][2]==="terreno"?zone.ground:"floor";
    const coord=(v,size)=>mapNum(v,0,size-1,0);
    const objects=[];
    for(const item of zone.objects){
      if(!item||!Object.hasOwn(assets,item.kind))continue;
      const x=coord(item.x,width),y=coord(item.y,height);
      const name=mapText(item.name,90,assets[item.kind][1]);
      const uid=mapText(item.uid,96);
      const objectId=uid&&!seen.has(uid)?uid:mapId();
      seen.add(objectId);
      const action=["native","dialog","portal","minigame","mission","goal","event"].includes(item.action)?item.action:"";
      objects.push({uid:objectId,kind:item.kind,name,x,y,w:mapNum(item.w,1,width-x,1),h:mapNum(item.h,1,height-y,1),
        rotation:[0,90,180,270].includes(item.rotation)?item.rotation:0,variant:Math.round(mapNum(item.variant,0,2,0)),
        color:/^#[0-9a-fA-F]{6}$/.test(item.color??"")?item.color:assets[item.kind][3],solid:item.solid===true,
        action,native:mapText(item.native,40),text:mapText(item.text,1800),target:mapText(item.target,90),
        gate:Object.hasOwn(challengeNames,item.gate)?item.gate:"",missionTarget:mapText(item.missionTarget,96),
        auto:item.auto===true, behavior:["patrol","loop","idle"].includes(item.behavior)?item.behavior:"idle",
        speed:mapNum(item.speed,0.4,6,1.7),
        route:Array.isArray(item.route)?item.route.slice(0,100).filter(p=>Array.isArray(p)&&p.length===2).map(([px,py])=>[coord(px,width),coord(py,height)]):[]});
    }
    const plan=zone.plan??{};
    if(typeof quartiereMarca==="function")quartiereMarca(id,objects);
    normalized.zones[id]={name:mapText(zone.name,90,id),width,height,ground,objects,
      plan:{show:plan.show===true,x:mapNum(plan.x,-3000,3000,0),y:mapNum(plan.y,-3000,3000,0),
        opacity:mapNum(plan.opacity,5,100,45),scale:mapNum(plan.scale,10,250,57)}};
  }
  return normalized;
}
function gardenFingerprint(zone){
  const raw=JSON.stringify(zone);
  let hash=2166136261;
  for(let i=0;i<raw.length;i++)hash=Math.imul(hash^raw.charCodeAt(i),16777619);
  return hash>>>0;
}
function loadCampus(){
  try{
    const source=JSON.parse(localStorage.getItem(mapStorageKey)||embedded||"null");
    if(source){
      const map=normalizeCampus(source);
      if(!embedded&&map.zones.giardino?.objects.some(o=>o.uid.startsWith("viale-prolungamento-"))){
        layVialeRoad(map.zones.giardino);
        map.zones.giardino=normalizeCampus({version:1,zones:{ingresso:map.zones.ingresso,giardino:map.zones.giardino}}).zones.giardino;
      }
      const oldGarden=source.zones.giardino;
      if(!embedded&&oldGarden?.width===144&&oldGarden.height===144&&gardenFingerprint(oldGarden.objects)===1176053){
        map.zones.giardino.objects=structuredClone(originalMap.zones.giardino.objects);
      }

      const unchangedGarden=oldGarden?.width===80&&oldGarden.height===54&&oldGarden.ground==="grass"
        &&oldGarden.name==="Giardino · Campus di Viale Romania"&&gardenFingerprint(oldGarden.objects)===878799855;
      if(!embedded&&oldGarden&&(unchangedGarden||[1143647332,3016915705,1510962805].includes(gardenFingerprint(oldGarden)))){
        const {show,opacity}=map.zones.giardino.plan;
        map.zones.giardino=structuredClone(originalMap.zones.giardino);
        Object.assign(map.zones.giardino.plan,{show,opacity});
        if(map.zones.caffe?.name==="Bar · Briscola e biliardini")map.zones.caffe.name=originalMap.zones.caffe.name;
        map.zones.portico??=structuredClone(originalMap.zones.portico);
        if(map.zones.caffe)map.zones.caffe.objects=map.zones.caffe.objects.filter(o=>o.native!=="biliardo");
      }
      const previousStandard={
        ingresso:[2355382267],giardino:[41786557,2911912747,421162834,3760909246],caffe:[1103875068],
        terra:[3914295745],primo:[1551090469,2069236810]
      };
      if(!embedded)for(const [id,hashes] of Object.entries(previousStandard)){
        const prior=source.zones[id];
        if(!prior||!hashes.includes(gardenFingerprint(prior.objects)))continue;
        const latest=structuredClone(originalMap.zones[id]);
        const gardenBefore=id==="giardino";
        const wasOuterExpansion=gardenBefore&&prior.width===104&&prior.height===94;
        const sizeMatches=gardenBefore
          ?wasOuterExpansion||prior.width===72&&prior.height===79
          :prior.width===latest.width&&prior.height===latest.height;
        if(!sizeMatches||prior.ground!==latest.ground)continue;
        latest.name=map.zones[id].name;
        const plan=map.zones[id].plan;
        if(gardenBefore)Object.assign(latest.plan,{show:plan.show,opacity:plan.opacity});
        else latest.plan=plan;
        map.zones[id]=latest;
      }
      const entry=map.zones.ingresso;
      if(!embedded&&entry.width===20&&entry.height===12&&entry.objects.length===84&&
        entry.objects.every((o,i)=>JSON.stringify(o)===JSON.stringify(oldEntrance[i])))map.zones.ingresso=structuredClone(originalMap.zones.ingresso);
      if(!embedded&&!map.zones.mensa&&Object.keys(map.zones).length<maxCampusZones&&
        [map.zones.giardino,map.zones.primo].some(zone=>zone?.objects.some(o=>o.action==="portal"&&o.target==="mensa"))){
        map.zones.mensa=structuredClone(originalMap.zones.mensa);
      }
      if(!embedded&&map.zones.giardino?.objects.some(o=>o.uid==="giardino-from-ingresso")){
        for(const id of ["aula-chiesa","polivalente","loft"]){
          const saved=map.zones[id], prior=priorInteriors.zones[id];
          if(id==="loft"&&saved?.width===25&&saved.height===15&&gardenFingerprint(saved.objects)===3322590601){
            saved.objects=structuredClone(originalMap.zones.loft.objects);
            continue;
          }
          if(saved&&saved.height===prior.height&&saved.width===prior.width&&
            gardenFingerprint(saved.objects)===gardenFingerprint(prior.objects)){
            map.zones[id]=structuredClone(originalMap.zones[id]);
          }
        }
        const addedRooms=new Set();
        for(const [id,zone] of Object.entries(originalMap.zones)){
          if(!map.zones[id]&&Object.keys(map.zones).length<maxCampusZones){map.zones[id]=structuredClone(zone);addedRooms.add(id);}
        }
        const corridor=map.zones.secondo;
        if(corridor?.width===20&&corridor.height===12&&corridor.objects.some(o=>o.uid==="secondo-a200")){
          corridor.width=originalMap.zones.secondo.width;
          corridor.height=originalMap.zones.secondo.height;
        }
        const parenzoDoor=map.zones.parenzo?.objects.find(o=>o.uid==="parenzo-inside");
        const seminarExit=map.zones["parenzo-interno"]?.objects.find(o=>o.uid==="parenzo-interno-exit");
        if(addedRooms.has("parenzo-corridoio")&&parenzoDoor?.target==="parenzo-interno#outside"&&seminarExit){
          parenzoDoor.target="parenzo-corridoio#esterno";
          seminarExit.target="parenzo-corridoio#seminario";
          const returnPoint=map.zones.parenzo.objects.find(o=>o.uid==="parenzo-interior-return");
          if(returnPoint)returnPoint.target="parenzo-corridoio";
        }
        for(const id of ["giardino","secondo","parenzo-corridoio"]){
          const saved=map.zones[id], latest=originalMap.zones[id];
          if(!saved||!latest)continue;
          const ids=new Set(saved.objects.map(o=>o.uid));
          for(const object of latest.objects){
            if(ids.has(object.uid)||object.x>=saved.width||object.y>=saved.height)continue;
            const target=object.target.split("#")[0];
            if(object.uid==="giardino-poker"&&object.x+object.w<=saved.width&&object.y+object.h<=saved.height){
              if(!saved.objects.some(o=>o.solid&&o.x<object.x+object.w&&o.x+o.w>object.x&&o.y<object.y+object.h&&o.y+o.h>object.y))saved.objects.push(structuredClone(object));
            }else if(object.uid==="romania-a200-porta"||((object.action==="portal"||object.kind==="entrance")&&addedRooms.has(target))){
              saved.objects.push(structuredClone(object));
            }
          }
        }
      }
      if(!embedded){
        if(map.zones.dome?.name==="The Dome · Sala studio")map.zones.dome.name=originalMap.zones.dome.name;
        if(map.zones.dome2?.name==="The Dome 2 · Padiglione ovest")map.zones.dome2.name=originalMap.zones.dome2.name;
        const circulationVersions={giardino:[54651953,773650580,4070000894],terra:4057807250,primo:762344755,secondo:2961961042,
          terzo:3154952425,quarto:395991853,quinto:1898163422,"parenzo-corridoio":2872205863};
        for(const [id,hash] of Object.entries(circulationVersions)){
          const prior=map.zones[id];
          const latest=originalMap.zones[id];
          if(!prior||![hash].flat().includes(gardenFingerprint(prior.objects)))continue;
          map.zones[id]={...structuredClone(latest),name:prior.name,plan:prior.plan};
        }
        const revisedZones={pola:[1834389237],giardino:[2965020914,1377501407,80380783,3935577901,3770965331,785279541,2540694351,2053466179],primo:[1116216150,713528194],mensa:[4059249112]};
        for(const [id,hashes] of Object.entries(revisedZones)){
          const prior=map.zones[id], latest=originalMap.zones[id];
          if(!prior||(id!=="mensa"&&(prior.width!==latest.width||prior.height!==latest.height))||
              !hashes.includes(gardenFingerprint(prior.objects)))continue;
          map.zones[id]={...structuredClone(latest),name:id==="mensa"?latest.name:prior.name,plan:prior.plan};
        }
        furnishCampusGardens(map);
      }
      if(!embedded){updateGardenStudentNames(map);addVialeArcade(map);improveDome2Entrance(map);furnishCampusFountains(map);addRadioVan(map);installPola(map);}
      if(!embedded)furnishCampusGardens(map);
      return embedded?quartiereRigenera(map):normalizeCampus(quartiereRifinisci(installSegreti(installLore(installIdee(installQuartiere(installVillaAda(refineRomania(map))))))));
    }
  }catch{}
  return freshMap();
}
let terrainCache=new WeakMap();
let minimapCache=new WeakMap();
let foregroundCache=new WeakMap();
function saveCampus(){
  overviewZone=null;
  terrainCache=new WeakMap();
  minimapCache=new WeakMap();
  wallRuns=new WeakMap();
  boundaryCache=new WeakMap();
  foregroundCache=new WeakMap();
  try{localStorage.setItem(mapStorageKey,JSON.stringify(campus));return true;}
  catch{return false;}
}
function room(id){return campus.zones[id]??campus.zones.ingresso;}
function kindLayer(o){return assets[o.kind][2];}
function zoneObjects(zone){
  let index=foregroundCache.get(zone);
  if(index)return index;
  index={objects:[],solid:[],interactions:[],actions:[],vehicles:[],entries:[],byId:new Map(),landmarks:new Map()};
  for(const o of zone.objects){
    index.byId.set(o.uid,o);
    const layer=kindLayer(o);
    if(layer==="terreno"&&!o.solid&&!o.action)continue;
    index.objects.push(o);
    if(o.solid)index.solid.push(o);
    if(o.action){
      index.actions.push(o);
      if(o.native&&!index.landmarks.has(o.native))index.landmarks.set(o.native,o);
    }
    if(o.action||(layer==="persone"&&!isVehicle(o)))index.interactions.push(o);
    if(o.kind==="entrance")index.entries.push(o);
    if(isVehicle(o)&&o.behavior!=="idle")index.vehicles.push(o);
  }
  foregroundCache.set(zone,index);
  return index;
}
function sceneObjects(zone){return zoneObjects(zone).objects;}
function entriesIn(id){return zoneObjects(room(id)).entries;}
function terrainMap(zone){
  const tiles=new Map();
  for(const o of zone.objects){
    if(kindLayer(o)!=="terreno")continue;
    if(![o.x,o.y,o.w,o.h].every(Number.isInteger))continue;
    for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)tiles.set(x+y*zone.width,o);
  }
  return tiles;
}
const isVehicle=o=>["car","scooter","bus","shuttle"].includes(o.kind);
function positionOf(o,now,width){
  if(width>=144&&o.behavior==="loop"&&Object.hasOwn(vialeTraffic,o.uid))return vialeVehicleAt(o,now,vialeTraffic[o.uid]);
  if(width&&isVehicle(o)&&o.behavior==="loop"){
    const integrated=o.uid.startsWith("viale-");
    const start=integrated?vialeEntrance.x:0;
    const direction=o.y-(integrated?vialeEntrance.y:0)<14?1:-1;
    const span=(integrated?vialeEntrance.width:width)+o.w;
    const cycle=((o.x-start+o.w+direction*now*o.speed/1000)%span+span)%span;
    return {...o,x:start+cycle-o.w,look:direction>0?"right":"left"};
  }
  if(o.behavior==="idle"||!o.route?.length||kindLayer(o)!=="persone")return o;
  const nodes=[[o.x,o.y],...o.route];
  if(o.behavior==="patrol")nodes.push(...nodes.slice(1,-1).reverse());
  nodes.push(nodes[0]);
  const lengths=nodes.slice(1).map(([x,y],i)=>Math.hypot(x-nodes[i][0],y-nodes[i][1]));
  const total=lengths.reduce((a,b)=>a+b,0);
  if(!total)return o;
  let distance=(now/1000*o.speed)%total;
  if(isVehicle(o)&&o.behavior==="patrol"){
    const arrival=total/2, pause=o.speed*2;
    const cycle=(now/1000*o.speed)%(total+pause);
    if(cycle>=arrival&&cycle<arrival+pause){
      const [x,y]=o.route.at(-1);
      return {...o,x,y,parked:true};
    }
    distance=cycle>=arrival+pause?cycle-pause:cycle;
  }
  for(let i=0;i<lengths.length;i++){
    const length=lengths[i];
    if(distance>=length){distance-=length;continue;}
    const [x,y]=nodes[i], [nx,ny]=nodes[i+1];
    return {...o,x:x+(nx-x)*distance/length,y:y+(ny-y)*distance/length,
      look:Math.abs(nx-x)>=Math.abs(ny-y)?(nx<x?"left":"right"):(ny<y?"up":"down"),
      step:Math.floor(now/110)%3};
  }
  return o;
}
function insideObject(o,x,y){return x>=o.x-.002&&x<o.x+o.w&&y>=o.y-.002&&y<o.y+o.h;}
function blocked(id,x,y,now=0,profile=state){
  const zone=room(id);
  if(x<0||y<0||x>=zone.width||y>=zone.height)return true;
  return zoneObjects(zone).solid.some(o=>
    (!campusTurnstile(o.uid)||(!profile?.campusGateOpen&&profile?.mode!=="free"))&&
    (!o.gate||gateLocked(o.gate,profile))&&insideObject(positionOf(o,now),x+.5,y+.5));
}
function freeTile(id,x,y,profile=state){
  const z=room(id);
  const sx=Math.round(clamp(x,0,z.width-1)),sy=Math.round(clamp(y,0,z.height-1));
  for(let radius=0;radius<Math.max(z.width,z.height);radius++)
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)
      if(Math.max(Math.abs(dx),Math.abs(dy))===radius&&!blocked(id,sx+dx,sy+dy,0,profile))return [sx+dx,sy+dy];
  return [sx,sy];
}
function reachEntry(id,preferred,profile=state){
  const entries=entriesIn(id);
  const entry=entries.find(e=>e.uid===preferred||e.target===preferred)??entries[0];
  return freeTile(id,entry?.x??2,entry?.y??2,profile);
}
function currentObject(){return zoneObjects(room(state.zone)).byId.get(activeScene);}
function nearbyIn(id,x,y,now=0){
  let best,dist=.95;
  for(const item of zoneObjects(room(id)).interactions){
    const o=positionOf(item,now);
    const xDist=Math.max(o.x-(x+.5),0,(x+.5)-(o.x+o.w));
    const yDist=Math.max(o.y-(y+.5),0,(y+.5)-(o.y+o.h));
    const d=xDist+yDist;
    if(d<dist){best=o;dist=d;}
  }
  return best;
}
function colorVariant(hex,variant){
  hex=vividHex(hex);
  if(!variant)return hex;
  const amount=variant===1?28:-27;
  return "#"+[1,3,5].map(i=>Math.min(255,Math.max(0,parseInt(hex.slice(i,i+2),16)+amount)).toString(16).padStart(2,"0")).join("");
}
function groundTile(c,kind,x,y,hex,variant=0){
  const color=colorVariant(hex??assets[kind][3],variant);
  rect(c,color,x*16,y*16,16,16);
  if(kind!=="grass"&&kind!=="path"&&(x+y)%2===0)rect(c,"#151d2014",x*16,y*16,16,16);
  if(kind==="grass"){
    const patch=Math.sin(x*.38+y*.19)+Math.cos(y*.41-x*.12);
    rect(c,patch>0?"#acd45125":"#174f4227",x*16,y*16,16,16);
    rect(c,"#d5df9b31",x*16+(x*5+y*3)%13,y*16+5,2,1);
    rect(c,"#17372d48",x*16+4,y*16+12,3,2);
  }else if(kind==="path"){
    const seed=(x*37+y*71)%13;
    rect(c,"#ead4ac65",x*16+seed,y*16+4,2,1);
    rect(c,"#705c4440",x*16+2,y*16+seed,1,1);
  }else if(kind==="road"){
    const fleck=(x*7+y*5)%13;
    rect(c,"#acb5be29",x*16+fleck,y*16+5,2,1);
  }else{
    const seam=kind==="paving"?(y%2)*8:0;
    rect(c,"#272a3836",x*16,y*16,16,1);
    rect(c,"#272a3830",x*16+seam,y*16+1,1,15);
    rect(c,"#fff0bf19",x*16+1,y*16+1,15,1);
  }
}
const vialeShopFronts={
  rosticceria:{sign:"ROSTICCERIA",roof:"#b96546",trim:"#773b33",stucco:"#c49b73",cloth:"#b74f43",light:"#f8cf8b",display:"#a66a46"},
  cavalli:{sign:"CORSE 360",roof:"#735a8e",trim:"#32284d",stucco:"#877795",cloth:"#7352a2",light:"#eed4fa",display:"#394665"},
  tabaccheria:{sign:"TABACCHI",roof:"#4a7c70",trim:"#224e49",stucco:"#92b09b",cloth:"#357062",light:"#e9edd4",display:"#4c6461"}
};
function paintVialeShop(c,o,w,h,now){
  const theme=vialeShopFronts[o.native];
  const ink=(color,x,y,width,height)=>{
    c.fillStyle=color;c.fillRect(x,y,width,height);
  };
  // Keep the existing collision rectangle. The roof and cornice project behind it.
  ink("#252a2a66",1,13.4,14.7,2.2);
  ink("#4c4b41",.55,-5.4,14.9,3.6);
  ink(theme.roof,1.1,-5.1,13.8,2.9);
  ink("#e2c7a37a",1.4,-5.1,13.2,.5);
  for(let x=2;x<14;x+=1.5)ink("#30262a32",x,-4.55,.16,2.1);
  ink("#554a45",.25,-3.1,15.5,17.6);
  ink(theme.stucco,.7,-1,14.6,14.8);
  for(const x of [.9,9.95,14.6]){
    ink("#e1c7a477",x,7.2,.35,5.9);
    ink("#574b443c",x+.35,8.8,.22,3.9);
  }
  ink(theme.roof,.75,-3.6,14.5,2.7);
  ink("#e1c4a477",1.1,-3.6,13.8,.6);
  ink(theme.trim,1,.1,14,4.5);
  ink(theme.light,1,4.15,14,.45);
  ink("#282b2d",.8,6.1,14.4,1.05);
  for(let i=0;i<8;i++)ink(i%2?theme.cloth:theme.light,1+i*1.75,4.65,1.75,1.55);
  ink("#6b5847",1.15,7.35,8.7,5);
  ink(theme.display,1.55,7.7,7.9,4.2);
  ink(theme.trim,10.55,7.05,3.9,6.8);
  ink("#4a5b61",11,7.65,3,3.1);
  ink("#aac0b5",11.1,7.8,2.7,.5);
  ink(theme.light,13.35,11.05,.45,.5);
  ink("#e0c6a2",1.1,12.1,8.8,.6);
  ink("#cabb9f",.9,13.7,14.25,.7);
  if(o.native==="rosticceria"){
    for(const [i,tone] of ["#f5b563","#d88c4b","#e9c080"].entries()){
      ink("#71503b",2+i*2.5,10.45,2.1,.7);
      ink(tone,2.15+i*2.5,9.55,1.8,.9);
      ink("#efce8a",2.4+i*2.5,9.3,1.1,.35);
    }
    ink("#efd79b",1.8,8,7.2,.45);
  }else if(o.native==="cavalli"){
    for(const [i,tone] of ["#83a8dc","#a79ad7","#79baa6"].entries()){
      const x=1.9+i*2.45;
      ink("#29303c",x,8,2,3.6);
      ink(tone,x+.25,8.35,1.5,1.25);
      ink("#bac8cf",x+.35,10.1,1.2,.32);
    }
    const light=Math.floor(now/600)%2===0;
    ink(light?"#c4a5e1":"#9881b6",1.3,.35,.7,3.45);
    ink(light?"#c4a5e1":"#9881b6",14,.35,.7,3.45);
  }else{
    ink("#bfc6ae",2,8.35,6.8,.4);
    for(const [i,tone] of ["#c18b77","#dcd2ae","#90a8a7","#bbb1c5"].entries()){
      ink(tone,2.1+i*1.7,9.2,1.15,1.9);
      ink("#dfd8bb",2.15+i*1.7,9.3,.8,.35);
    }
    ink("#293c3a",14.55,7.7,1.2,2.45);
    ink("#ebede0",14.75,8.1,.8,.4);
    ink("#ebede0",15.04,8.1,.25,1.35);
  }
  c.save();c.scale(16/w,16/h);
  c.textAlign="center";c.fillStyle=theme.light;
  c.font=insegnaFont(Math.max(2,Math.min(6,h*.31,w*.9/theme.sign.length*1.55)));
  c.fillText(theme.sign,w/2,h*.226,w*.86);
  c.restore();
}
function drawObject(c,o,now=0,editing=false){
  const spec=assets[o.kind];
  if(!spec||spec[2]==="terreno")return;
  if(o.kind==="entrance"&&!editing)return;
  const x=o.x*16,y=o.y*16,w=o.w*16,h=o.h*16;
  const color=colorVariant(o.color,o.variant);
  c.save();c.translate(x+w/2,y+h/2);c.rotate(o.rotation*Math.PI/180+(o.bend??0));
  if(o.rotation%180)c.scale(h/w,w/h);
  c.translate(-w/2,-h/2);
  c.scale(w/16,h/16);
  if(!editing)ambienteOggetto(c,o,now);
  const box=(t,a,b,ww,hh)=>rect(c,t,a,b,ww,hh);
  const shadow="#283236",light="#ead6ac",white="#fff1c8";
  if(o.uid==="sport-court"&&o.kind==="roof"){
    box("#394340",0,0,16,16);box("#87958d",.45,.55,15.1,14.8);
    for(const top of [2.4,8.9])for(const left of [1.6,6.4,11.2]){
      box("#c5c9bc",left,top,3.2,4.4);
      box("#35423d",left+.26,top+.38,2.68,3.64);
      for(let i=0;i<5;i++)box("#65776d",left+.32,top+.71+i*.59,2.56,.18);
    }
    c.restore();return;
  }
  if(isVehicle(o)){
    if(o.look==="left"){c.translate(16,0);c.scale(-1,1);}
    box("#17212688",1,11,14,3);
    if(o.bend!==undefined&&o.kind!=="scooter"){
      for(const axle of [2,12]){
        box("#20252c",axle,2,3,3);box("#20252c",axle,11,3,3);
      }
    }
    if(o.kind==="bus"||o.kind==="shuttle"){
      const bus=o.kind==="bus";
      box("#292e30",0,2,16,12);box(bus?"#a24746":color,.3,3,15.4,10);
      box(bus?"#8e4640":"#315372",.4,9,15.2,2);
      for(const px of [1,4,7,10,13])box("#93aab0",px,4,2,4);
      box("#3f5860",15,4,.65,7);
      box("#181f21",2,1,2,2);box("#181f21",11,12,2,2);
      box("#fff0ad",14,7,2,2);box(o.braking?"#ff9874":"#bd5349",0,9,1,2);
      box("#db9d86",1,3,12,1);box("#f3c0a2",9,4,2,1);
      c.scale(16/w,16/h);
      if(o.look==="left"){c.translate(w,0);c.scale(-1,1);}
      c.fillStyle=bus?"#fff1b9":"#f4ead2";c.font=insegnaFont(6);
      c.textAlign="center";c.fillText(bus?"360":"LUISS",w/2,h*.8);
      c.restore();c.save();c.translate(x+w/2,y+h/2);c.rotate(o.rotation*Math.PI/180+(o.bend??0));if(o.rotation%180)c.scale(h/w,w/h);c.translate(-w/2,-h/2);c.scale(w/16,h/16);if(o.look==="left"){c.translate(16,0);c.scale(-1,1);}
      insegnaAutobus(c,o,w,h,now);
    }else if(o.kind==="car"){
      const shell=(tone,inset)=>{
        c.beginPath();
        c.moveTo(1+inset,5);c.quadraticCurveTo(2,3+inset,5,3+inset);
        c.lineTo(12,3+inset);c.quadraticCurveTo(15.8-inset,3.6,15.8-inset,6.5);
        c.lineTo(15.8-inset,9.5);c.quadraticCurveTo(15.8-inset,12.5,12,12.8-inset);
        c.lineTo(5,12.8-inset);c.quadraticCurveTo(2,12.5,1+inset,11);
        c.closePath();c.fillStyle=tone;c.fill();
      };
      for(const axle of [3,11.5])for(const row of [2,10.6])box("#18232a",axle,row,2.7,2.7);
      shell("#263439",0);shell(color,.65);
      box("#172c38",4.4,4.8,6.6,6.4);box("#789aa5",9.1,5.25,1.65,5.5);
      box("#435d66",4.6,5.45,1.15,5.1);box(color,6,5.4,2.65,5.2);
      box("#e3e5d277",6,5.4,2.65,.65);box("#e3e5d239",11.8,4.6,2.1,.55);
      box("#22353f",14.7,7,1,2);box("#fff1be",14,5,.95,1.55);box("#fff1be",14,9.5,.95,1.55);
      for(const row of [5.1,9.6])box(o.braking?"#ff9874":"#ca5551",1.5,row,.9,1.35);
    }else{
      box(shadow,1,7,4,4);box(shadow,11,7,4,4);box(color,3,6,11,4);
      const lean=reducedMotion||o.bend===undefined?0:Math.sign(o.bend);
      box("#3d4e57",5,5+lean,5,5);box("#ddad83",9,4+lean,3,3);
      box("#e7dfc5",10,4+lean,2,1);box("#fff1ad",13,6,2,1);
      box(o.braking?"#ff9874":"#e85d50",3,7,1,2);
    }
  }else if(o.kind==="boar"){
    c.translate(8-8*1.3,15-15*1.3);c.scale(1.3,1.3);
    drawBoarShape(c,o.look??"left","calm",now,o.x);
  }else if(spec[2]==="persone"){
    const appearance=characterAppearance(o);
    const size=o.kind==="athlete"?1.05:.89;
    sprite(c,appearance,o.native==="trend"?-3:8,15,o.step??0,editing?o.look??"down":ambienteSguardo(o,now),size,characterCoat(o));
    if(o.native==="trend"){
      sprite(c,{...appearance,capelli:5,tinta:2,abito:3},21,15,(Math.floor(now/170)+1)%3,"down",.89);
    }
    if(o.native==="incontro-viale")drawVialeCigarette(c,o,7,5,1,editing?0:now);
    if(o.kind==="heatedStudent"){
      box("#e9e0d4",12,6,2,1);box("#9b8c80",14,6,1,1);
      const cycle=(Math.floor(now/210)+o.x)%17;
      if(now&&cycle<4){
        box("#e5dec87a",14+cycle/2,5-cycle,2,1);
        if(cycle>1)box("#dfd8bb42",15+cycle/2,3-cycle,2,1);
      }
    }
  }else{
    switch(o.kind){
      case "shelter":
        box("#243431",0,5,16,11);box(color,.5,2,15,8);
        box("#a2b8af",1,3,14,1);box("#77999e",2,10,12,2);
        box("#ded2b1",1,12,1,3);box("#ded2b1",14,12,1,3);break;
      case "pillar":
        if(o.uid.startsWith("viale-pilastro-")){
          box("#9d998d",2,5,12,11);box("#f4edda",3,5,9,10);
          box("#c7c2b3",1,4,14,1.5);box("#fbf3dd",2,3.4,12,1);
          box("#b9aa91",6,2.3,4,1.3);box("#d4c5aa",4,.8,8,1.8);
          box("#ede0c5",3,.5,10,.7);box("#967b50",5,9,4,2);break;
        }
        if(o.uid.startsWith("romania-panama-stipite-")){
          box("#706653",2,5,12,11);box("#b0a18a",3,5,9,11);
          for(const row of [7,10,13])box("#897b65",3,row,9,.55);
          box("#8d806a",1,4,14,2);box("#c1b19a",2,3.5,12,1);
          box("#8f806b",6,2.5,4,1.5);box("#b5a68d",5,.5,6,2.5);box("#c8bba3",6,0,4,1);break;
        }
        box("#b6b5a7",2,5,12,11);box(color,3,5,9,10);box("#fff7e5",2,4,12,1);
        box("#afa691",4,1,8,2);box(light,5,0,6,2);box("#c6baa2",5,2,6,2);box("#777266",5,8,4,2);break;
      case "booth":
        box("#20303666",.7,2.4,15.3,13.6);
        box("#574740",0,.7,16,14.3);box(color,.55,1.1,14.9,13.7);
        box("#edd9b1",.4,1,15.2,.65);box("#374345",2,7,5.5,5);box("#725746",10,7,3.6,7.4);
        if(Object.hasOwn(vialeShopFronts,o.native))paintVialeShop(c,o,w,h,now);
        else if(o.native==="shop"){
          box("#26345b",.65,1.65,14.7,4.2);box("#d8af69",.7,5.8,14.6,.55);
          for(let i=0;i<6;i++)box(i%2?"#26345b":"#d8be91",1+i*2.35,6.35,2.35,1);
          box("#f5d99d",1.9,7.55,6.8,4.7);box("#385462",2.25,7.9,6.1,4);
          for(let i=0;i<3;i++)box(["#e9c487","#aa7f96","#7898bb"][i],2.8+i*1.75,9.5,1.25,1.8);
          box("#c7a984",10,7.65,3.7,6.65);box("#45636e",10.4,8,2.9,4.5);
          box("#f2d08a",12.8,11,.35,.48);box("#aa957c",.8,13.6,14.4,.9);
          c.textAlign="center";c.font=insegnaFont(2.8);c.fillStyle="#fff1ce";
          c.fillText("LUISS SHOP",8,4.75,13.7);
        }
        insegnaEdificio(c,o,w,h,now);
        break;
      case "orangeTree":{
        box("#24372c70",2,11,13,4);
        box("#795542",7,9,2,6);box("#a47c55",8,9,1,5);
        const crown=(tone,x,y,rx,ry)=>{
          c.fillStyle=tone;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
        };
        crown("#2a4b3b",8,7,7,6);
        crown(color,7.5,6,6.3,5.3);
        crown("#527d4c",5.6,4.5,3.6,3.4);
        crown("#426d49",10.3,6.5,4,3.9);
        crown("#79a356",4.7,3.7,2.4,1.65);
        crown("#385b43",8.2,9.2,4.1,2.55);
        for(const [x,y] of [[3,5],[5,8],[7,4],[9,6],[11,5],[13,8],[7,11]]){
          box("#6f9255",x,y,2,1);box("#4c7749",x+1,y+1,1,1);
        }
        for(const [x,y] of [[4,4],[7,2],[10,4],[6,7],[12,7],[8,10],[3,8]]){
          box("#c26a2f",x,y,2,2);box("#f6a23b",x,y,2,1);box("#ffd278",x,y,1,1);
        }
        break;
      }
      case "roseBed":case "flowerMeadow":{
        const roses=o.kind==="roseBed";
        box("#36463370",1,11,14,3);box("#695543",1,7,14,6);
        box("#88705a",1,7,14,1);
        box("#9b8466",1,12,14,1);
        box("#416146",2,8,12,4);box("#5d8050",2,9,12,2);
        for(const [i,[x,y]] of [[2,7],[4,4],[6,8],[8,5],[10,7],[12,4],[13,9]].entries()){
          box("#4c7551",x,y+1,2,4);
          box("#73905d",x-1,y+2,2,1);
          const bloom=roses?(i%3===0?"#b23858":color):[color,"#f0dfaa","#ae89ca"][i%3];
          box(bloom,x-1,y,3,2);
          if(roses){box(bloom,x,y-1,2,1);box("#f1a3a6",x,y,1,1);}
          else{box(bloom,x,y-1,1,4);box("#f1d690",x,y+1,1,1);}
          box("#92a370",x-1,y+3,1,1);
        }
        break;
      }
      case "tree":case "pine":{
        const pine=o.kind==="pine";
        const crown=(tone,cx,cy,rx,ry)=>{
          c.fillStyle=tone;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.fill();
        };
        crown("#192d3340",9,12,6.8,2.8);
        box("#665442",7,7,1.6,8);
        crown("#304c3d",8,7,7.6,pine?4.6:6.4);
        crown(color,6.5,5.8,6.1,pine?3.8:5.2);
        crown(color,11,6.4,4.3,3.6);
        for(let i=0;i<17;i++){
          const angle=i*2.4+o.x,radius=Math.sqrt(i/17);
          const lx=7.7+Math.cos(angle)*radius*5.8,ly=5.8+Math.sin(angle)*radius*(pine?2.8:4);
          crown(i%3?"#a6b57338":"#243f353a",lx,ly,1.6+(i%3)*.25,1.1);
        }
        break;
      }
      case "cypress":
        box("#303f38",7,10,2,6);box(color,5,3,6,11);box(color,7,0,2,4);box("#78915c",6,5,2,6);break;
      case "luiss":
        c.font=insegnaFont(5,true);c.textAlign="center";c.fillStyle="#101923";c.fillText("LUISS",8,10.4);c.fillStyle="#f4ede0";c.fillText("LUISS",8,9.7);break;
      case "zebra":
        if(/^(viale-)?crosswalk-(13|14|15)$/.test(o.uid)&&o.w===4&&o.h===1){
          const upper=o.uid.endsWith("-13"),lower=o.uid.endsWith("-15");
          const top=upper?2:0,height=16-top-(lower?2:0);
          for(let band=0;band<8;band++){
            c.fillStyle=color;
            c.fillRect(.5+band*2,top,1.16,height);
          }
        }else box(color,0,3,16,8);
        break;
      case "sign":
        if(o.uid==="viale-bus-360-stop"||o.uid==="bus-360-stop"){
          box("#182a39",6,0,9,9);box("#315b8e",7,1,7,6);
          box(white,9,2,3,2);box(white,8,4,5,2);
          box("#39434a",10,9,1,6);box("#23333d",8,14,5,1);
        }else{
          const cart=insegnaCartello(c,o,box);insegnaCartelloTesto(c,cart.txt,w,h);
        }
        break;
      case "domeHall":{
        // Barrel roof: a continuous curved highlight and transverse ribs.
        box(shadow,0,.6,16,15.4);
        const vault=c.createLinearGradient(0,0,16,0);
        for(const [stop,tone] of vividOn?[[0,"#4f6b78"],[.25,"#c9d0c6"],[.45,"#f6ead0"],[.78,color],[1,"#6a6f68"]]:[[0,"#53666b"],[.25,"#acbabc"],[.45,"#e2e6dc"],[.78,color],[1,"#59696d"]])
          vault.addColorStop(stop,tone);
        c.fillStyle=vault;c.fillRect(.2,.2,15.4,13.8);
        for(let i=1;i<14;i+=1.7)box("#42596366",.3,i,15.2,.12);
        box("#384f54",.5,14,15,1.4);
        for(let i=1;i<16;i+=2)box("#b5c2b4",i,14,.18,1.4);
        insegnaEdificio(c,o,w,h,now);
        break;
      }
      case "faculty":case "chapel":case "roof":{
        // Hip ends follow the building's long axis, including the narrow chapel.
        const tall=h>w, ridge=tall?[[8,2.8],[8,10.8]]:[[2.8,6.8],[13.2,6.8]];
        const [r1,r2]=ridge;
        const face=(tone,points)=>{
          c.fillStyle=tone;c.beginPath();c.moveTo(...points[0]);
          for(const point of points.slice(1))c.lineTo(...point);
          c.closePath();c.fill();
        };
        box("#756455",0,1,16,15);box("#d4b791",.2,12.8,15.6,2.7);
        box(color,.1,.2,15.8,13.2);
        const nw=[.1,.2],ne=[15.9,.2],sw=[.1,13.4],se=[15.9,13.4];
        face("#ffe1a43d",tall?[nw,r1,r2,sw]:[nw,ne,r2,r1]);
        face("#432a234d",tall?[ne,se,r2,r1]:[sw,r1,r2,se]);
        face("#6e423833",tall?[sw,r2,se]:[ne,se,r2]);
        const bays=Math.max(3,Math.round(w/14));
        for(let i=0;i<bays;i++)box("#515654",(i+.34)*16/bays,14,5/bays,.9);
        if(o.uid==="main-gatehouse"&&o.name==="LUISS Shop"){
          box("#30253c",2.7,11.6,10.6,2.6);
          c.save();c.scale(16/w,16/h);
          c.fillStyle="#fff1d7";c.textAlign="center";c.font=insegnaFont(9);
          c.fillText(o.name,w/2,h*.84,w*.62);
          c.restore();
        }
        insegnaEdificio(c,o,w,h,now);
        if(o.kind==="chapel"){box("#ebd9b3",6,13.5,4,2.2);box("#66574c",7,14,2,1.7);}
        break;
      }
      case "court":
        box("#334b43",0,0,16,16);box(color,1,1,14,14);
        c.strokeStyle="#d0d8b6";c.lineWidth=.22;c.strokeRect(2,2,12,12);box("#d0d8b6",7.9,2,.2,12);break;
      case "hedge":box("#293e36",0,0,16,16);box(color,1,1,14,12);box("#a9c88245",2,3,11,3);break;
      case "bush":box(shadow,1,8,14,6);box(color,3,5,10,7);box("#bed49c60",5,5,5,2);break;
      case "flowers":for(const [a,b] of [[2,5],[8,3],[11,9],[5,11]]){box("#739f64",a+1,b+2,1,4);box(color,a,b,3,3);box(white,a+1,b+1,1,1);}break;
      case "classroom":case "library":
        box(shadow,0,0,16,16);box(color,1,1,14,12);box(light,1,13,14,2);
        for(let a=3;a<15;a+=3)box("#ffffff26",a,2,1,9);
        if(o.kind==="classroom"||o.kind==="library"){box("#384b49",5,10,6,4);box("#89a299",6,10,4,2);}
        break;
      case "radioVan":{
        box("#26333680",1,11,15,4);
        box("#22262a",2,10,3,4);box("#22262a",11,10,3,4);
        box("#a7a7a1",3,11,1,2);box("#a7a7a1",12,11,1,2);
        box("#532d33",0,5,15,6);box("#532d33",13,7,3,4);
        box(color,1,4,13,8);box(color,13,6,3,6);
        box("#d46462",1,4,12,1);box("#902830",1,11,14,1);
        box("#293941",2,5,8,3);box("#293941",11,5,2,3);box("#293941",13,6,2,2);
        box("#68888a",2,5,7,1);box("#68888a",11,5,2,1);
        box("#c5c1b1",3,2,5,2);box("#e6dec9",3,2,4,1);
        box("#f0ca87",15,8,1,1);box("#eb826e",0,7,1,1);
        c.save();c.scale(16/w,16/h);
        c.fillStyle="#fff3df";c.textAlign="center";c.font=insegnaFont(Math.min(7,w/6.5));
        c.fillText("Radio Luiss",w*.47,h*.66,w*.86);
        c.restore();
        break;
      }
      case "wall":
        box(shadow,0,1,16,15);box(color,0,0,16,14);
        c.save();c.scale(16/w,16/h);c.globalAlpha=.70;
        c.fillStyle=masonryPattern(c,.17);c.fillRect(0,h*.13,w,h*.69);c.restore();
        box("#efe4ca",0,1,16,1.3);box("#665d4f",0,13.6,16,1.3);break;
      case "door":case "turnstile":
        box(shadow,2,2,12,13);
        if(o.gate&&!gateLocked(o.gate)&&!editing)box(color,2,2,3,12);
        else{box(color,3,3,10,11);box(light,10,8,2,2);if(o.kind==="turnstile")box(light,0,5,16,2);}
        break;
      case "window":box(shadow,0,4,16,8);box(color,1,5,14,6);box(light,7,5,2,6);break;
      case "stairs":for(let i=0;i<5;i++){box(color,1,i*3+1,14,2);box(shadow,1,i*3+3,14,1);}break;
      case "chair":case "sofa":case "bench":box(shadow,1,7,14,8);box(color,1,4,14,5);box(color,2,10,12,3);box(light,3,8,10,1);break;
      case "shelf":case "vending":box(shadow,2,1,12,14);box(color,3,2,10,11);for(let i=0;i<3;i++){box(light,4,4+i*3,8,1);box("#83a294",5+i*2,3+i*3,2,1);}break;
      case "desk":case "board":box(shadow,1,3,14,11);box(color,1,3,14,8);box(light,1,3,14,1);break;
      case "foos":case "ping":case "bris":
        box(shadow,0,3,16,12);box(color,1,4,14,9);box(light,1,7,14,1);
        if(o.kind==="foos")for(const a of [4,8,12]){box(light,a,2,1,13);box("#dd9b6a",a-1,7,3,2);}
        if(o.kind==="bris"){box(white,4,5,2,3);box(white,10,8,2,3);}
        break;
      case "poker":
        box("#56392c",0,3,16,12);box(color,1,4,14,9);box(light,2,5,12,1);
        box(white,4,7,2,4);box(white,7,6,2,4);box("#dfae58",11,8,2,2);
        break;
      case "lamp":box(shadow,7,5,2,10);box(color,5,2,6,5);box(white,6,3,4,2);break;
      case "bin":box(shadow,4,5,8,10);box(color,4,4,8,8);box(light,3,4,10,2);break;
      case "polaVilla":case "polaNinfeo":case "polaBuffet":case "polaLights":
        paintPolaLandmark(c,o,box,now);
        break;
      case "fountain":{
        const ripple=Math.floor(now/180)%4;
        box("#293d3a65",0,6,16,8);box("#354b48",2,4,12,10);
        box("#354b48",1,6,14,6);box("#ded2b2",2,4,12,8);
        box("#ded2b2",1,6,14,4);box("#9e9d86",2,11,12,2);
        box(color,3,6,10,5);box("#458688",4,7,8,3);
        box("#c5c5a8",7,7,2,3);box("#aed4c6",6,6,4,1);
        box("#e4f4e8",7,3,1,3);box("#a2dce1",8,2+ripple%2,1,4);
        box("#9ccdce",4,8+ripple%2,2,1);box("#b6e8e8",10,9-ripple%2,2,1);
        if(ripple>0){box("#d5eeee",6,4+ripple%2,1,1);box("#a2dce1",9,4,1,1);}
        break;
      }
      case "nasone":{
        const drop=Math.floor(now/110)%4;
        box("#293d3a65",3,13,11,2);box("#b5a88d",3,12,11,2);
        box("#394345",5,12,7,1);box("#202e33",6,3,4,10);
        box(color,7,3,3,9);box("#859294",7,4,1,7);
        box("#657778",7,2,3,2);box("#495a5a",8,3,4,2);
        box("#ad9671",11,4,2,1);box("#566568",12,5,1,1);
        box("#98d7df",12,6,1,2);box("#b6e7e6",12,8+drop,1,1);
        break;
      }
      case "rope":for(const a of [1,7,14])box(light,a,2,1,12);box(color,1,5,14,2);break;
      default:
        box(shadow,3,3,10,11);box(color,4,4,8,8);box(light,7,8,2,6);
        c.fillStyle=shadow;c.font="bold 7px monospace";c.textAlign="center";
        c.fillText(({entrance:"↳",event:"!",goal:"★"})[o.kind]??"·",8,10);
    }
  }
  const stairDirection=o.uid==="terra-primo"||/^(primo|secondo|terzo|quarto|quinto)-up$/.test(o.uid)?-1:
    /^(secondo|terzo|quarto|quinto|loft)-down$/.test(o.uid)||o.uid==="primo-terra"?1:0;
  if(stairDirection&&(o.kind==="door"||o.kind==="stairs")){
    box("#182a41",2,1,12,14);
    box("#7c98ac",2,1,12,1);
    c.strokeStyle="#e6d8ac";c.lineWidth=1.3;c.lineCap="square";
    c.beginPath();
    c.moveTo(8,8-stairDirection*4);c.lineTo(8,8+stairDirection*4);
    c.moveTo(5,8+stairDirection);c.lineTo(8,8+stairDirection*4);c.lineTo(11,8+stairDirection);
    c.stroke();
  }
  c.restore();
}
// Use the same road centerline for asphalt, lane markings and traffic.
function paintVialeRoad(c,left,right){
  c.save();
  c.scale(16,16);
  const start=Math.max(-1,left-3),end=Math.min(vialeRoad.at(-1)[0]+1,right+3);
  const trace=(from,to)=>{
    c.beginPath();
    c.moveTo(from,vialeRoadY(from)+.5);
    for(let x=from+.5;x<to;x+=.5)c.lineTo(x,vialeRoadY(x)+.5);
    c.lineTo(to,vialeRoadY(to)+.5);
  };
  trace(start,end);
  c.lineJoin="round";c.lineCap="butt";
  for(const [width,color] of [[4.38,"#817e70"],[4.16,"#a69f90"],[3.32,"#d2c6ae"],[3.14,"#343e48"],[2.9,"#4a5562"]]){
    c.lineWidth=width;c.strokeStyle=color;c.stroke();
  }
  for(let x=Math.ceil(start);x<end;x++){
    const center=vialeRoadY(x+.5)+.5;
    c.fillStyle="#8f8b7e";
    c.fillRect(x,center-2.04,.045,.42);
    c.fillRect(x,center+1.65,.045,.42);
    c.fillStyle="#57616c";
    c.fillRect(x+.24,center-.72,.14,.045);
    c.fillRect(x+.7,center+.94,.12,.045);
    if(x%5===0){
      c.fillStyle="#323f47";c.fillRect(x+.35,center+1.16,.47,.16);
      c.fillStyle="#7d8588";
      for(let slot=0;slot<4;slot++)c.fillRect(x+.41+slot*.1,center+1.19,.035,.1);
    }
  }
  c.lineWidth=.09;c.strokeStyle="#d5c89f";c.setLineDash([.58,.48]);
  for(const [from,to] of [[start,Math.min(end,21)],[Math.max(start,25),end]]){
    if(to<=from)continue;
    trace(from,to);c.lineDashOffset=from;c.stroke();
  }
  c.restore();
}
// Resurface the straight stretch at the gate using its existing walkable tiles.
function paintEntranceStreet(c,id,z,tiles,left,top,right,bottom){
  if(id!=="ingresso")return;
  const ox=0,oy=0,from=0,to=z.width;
  if(left>=to||right<=from||top>=oy+17||bottom<=oy+12)return;
  const crossing=z.objects.find(o=>o.uid==="crosswalk-14"&&o.y===oy+14&&o.rotation===0);
  for(let y=Math.max(top,oy+12);y<Math.min(bottom,oy+17);y++){
    const row=y-oy;
    for(let x=Math.max(left,from);x<Math.min(right,to);x++){
      const tile=tiles.get(x+y*z.width);
      if(!tile||!tile.uid.startsWith("romania-"))continue;
      const px=x*16,py=y*16;
      const crosswalk=crossing&&x>=crossing.x&&x<crossing.x+crossing.w;
      if(tile.kind==="road"&&row>=13&&row<=15){
        rect(c,row===14?"#4a5562":"#4e5966",px,py,16,16);
        const fleck=(x*7+y*5)%13;
        rect(c,"#5b6571",px+fleck,py+5,2,1);
        rect(c,"#3f4854",px+(fleck+7)%13,py+12,2,1);
        if(row===13)rect(c,"#394550",px,py,16,2);
        if(row===15)rect(c,"#394550",px,py+14,16,2);
        if(row===14&&x%2===0&&!crosswalk)rect(c,"#d5c89f",px+2,py+8,12,1);
        if((x===ox+10||x===ox+24)&&row!==14){
          const east=row===13,tip=px+(east?12:3);
          rect(c,"#abb7bd",px+3,py+8,10,1);
          for(let step=0;step<3;step++){
            rect(c,"#abb7bd",tip+(east?-step:step),py+8-step,1,step*2+1);
          }
        }
      }else if(tile.kind==="paving"&&(row===12||row===16)){
        const edge=row===12?13:0;
        rect(c,"#aba294",px,py,16,16);
        rect(c,"#8b857a",px,py+6,16,1);
        rect(c,"#8b857a",px+(x%2?10:5),py+7,1,6);
        rect(c,crosswalk?"#be9e66":"#d1c5ab",px,py+edge,16,3);
        if(crosswalk){
          const ramp=row===12?8:4;
          rect(c,"#c6a16b",px,py+ramp,16,4);
          for(const dot of [2,6,10,14])rect(c,"#725c43",px+dot,py+ramp+1,1,2);
        }else{
          rect(c,"#908575",px+15,py+edge,1,3);
        }
      }
    }
  }
}
let wallRuns=new WeakMap();
function continuousWalls(zone){
  if(wallRuns.has(zone))return wallRuns.get(zone);
  const walls=sceneObjects(zone).filter(o=>o.kind==="wall"&&!o.rotation&&!o.action&&!o.uid.startsWith("cinta-"))
    .sort((a,b)=>a.y-b.y||a.x-b.x);
  const runs=[];
  for(const wall of walls){
    const previous=runs.at(-1);
    if(previous&&previous.y===wall.y&&previous.h===wall.h&&previous.x+previous.w===wall.x&&
      previous.color===wall.color&&previous.variant===wall.variant)previous.w+=wall.w;
    else runs.push({...wall});
  }
  const objects=[...sceneObjects(zone).filter(o=>o.kind!=="wall"||o.rotation||o.action),...runs];
  wallRuns.set(zone,objects);
  return objects;
}
let boundaryCache=new WeakMap();
function boundaryStrokes(zone){
  let lines=boundaryCache.get(zone);
  if(lines)return lines;
  const walls=zoneObjects(zone).solid.filter(o=>o.kind==="wall"&&o.uid.startsWith("cinta-"));
  const points=walls.flatMap(o=>Array.from({length:Math.ceil(o.w*o.h)},(_,i)=>[
    o.x+.5+i%Math.ceil(o.w),o.y+.5+Math.floor(i/Math.ceil(o.w))
  ]));
  lines=points.map(point=>[point,point]);
  for(const [i,a] of points.entries())for(const b of points.slice(i+1)){
    const dx=Math.abs(a[0]-b[0]),dy=Math.abs(a[1]-b[1]);
    if(dx<=1&&dy<=1&&(dx||dy))lines.push([a,b]);
  }
  boundaryCache.set(zone,lines);
  return lines;
}
// A repeatable travertine surface anchored in world coordinates.
let masonryTile;
const masonryPatterns=new WeakMap();
function masonryPattern(c,scale){
  let patterns=masonryPatterns.get(c);
  if(!patterns){patterns=new Map();masonryPatterns.set(c,patterns);}
  if(patterns.has(scale))return patterns.get(scale);
  if(!masonryTile){
    masonryTile=document.createElement("canvas");
    masonryTile.width=128;masonryTile.height=64;
    const ink=masonryTile.getContext("2d");
    ink.fillStyle="#938778";ink.fillRect(0,0,128,64);
    let seed=749;
    const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
    for(let row=0;row<4;row++){
      for(let col=-1;col<4;col++){
        const x=col*32+(row%2)*16,y=row*16;
        const tone=Math.floor(176+random()*19);
        ink.fillStyle="rgb("+tone+","+(tone-12)+","+(tone-30)+")";
        ink.fillRect(x+.8,y+.9,31.2,15);
        ink.fillStyle="#fff1cc60";ink.fillRect(x+1,y+1,30,.9);
      }
    }
    for(let i=0;i<1100;i++){
      ink.fillStyle=i%4?"#70574324":"#ffefd955";
      ink.fillRect(random()*128,random()*64,random()*3+.4,.5+random());
    }
  }
  const pattern=c.createPattern(masonryTile,"repeat");
  pattern.setTransform(new DOMMatrix().scale(scale));
  patterns.set(scale,pattern);return pattern;
}
function paintCampusBoundary(c,zone,left,top,right,bottom){
  const lines=boundaryStrokes(zone).filter(([[x,y],[xx,yy]])=>
    Math.max(x,xx)>=left-1&&Math.min(x,xx)<=right+1&&Math.max(y,yy)>=top-1&&Math.min(y,yy)<=bottom+1);
  if(!lines.length)return;
  c.save();c.scale(16,16);c.lineCap="round";c.lineJoin="round";
  for(const [width,color,offset] of [[.94,"#252a2755",.30],[.84,"#887c68",.12],[.74,masonryPattern(c,1/88),.06],[.32,"#887762",-.22],[.27,"#d7c9af",-.26],[.065,"#f0e2cc",-.37]]){
    c.beginPath();
    for(const [[x,y],[xx,yy]] of lines){c.moveTo(x,y+offset);c.lineTo(xx+.001,yy+offset);}
    c.lineWidth=width;c.strokeStyle=color;c.stroke();
  }
  c.restore();
}
const grassEdges=[[0,-1,0,0,16,2],[1,0,14,0,2,16],[0,1,0,14,16,2],[-1,0,0,0,2,16]];
function worldView(c,id,now,view,visible=layers,editing=false,player=null){
  const z=room(id);
  const margin=2,left=Math.max(0,Math.floor(view.x/16)-margin),top=Math.max(0,Math.floor(view.y/16)-margin);
  const right=Math.min(z.width,Math.ceil((view.x+view.w)/16)+margin);
  const bottom=Math.min(z.height,Math.ceil((view.y+view.h)/16)+margin);
  const curvedRoad=!editing&&id==="giardino"&&z.width>=144&&hasIntegratedEntrance();
  let tiles;
  if(visible.terreno){
    const outline=id==="giardino"&&z.width===144?campusOutlineFor(z):null;
    const urban=outline&&zoneObjects(z).byId.has("campus-circulation");
    tiles=editing?null:terrainCache.get(z);
    if(!tiles){tiles=terrainMap(z);if(!editing)terrainCache.set(z,tiles);}
    for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
      const tile=tiles.get(x+y*z.width);
      const outside=outline&&(tile?.kind??z.ground)==="grass"&&!tile?.uid.startsWith("quartiere-verde-")&&!insideCampusOutline(x+.5,y+.5,outline);
      if(outside){
        if(urban)groundTile(c,"paving",x,y,(x>95&&y<70)||(y>104)?"#969488":"#a49d90");
        else rect(c,vividOn?"#7b6e58":"#53595b",x*16,y*16,16,16);
      }
      else if(curvedRoad&&tile?.uid.startsWith("romania-surface-carreggiata-")){
        groundTile(c,"paving",x,y,"#a49a87");
      }else groundTile(c,tile?.kind??z.ground,x,y,tile?.color,tile?.variant);
      if(!outside&&(tile?.kind??z.ground)==="grass"){
        for(const [dx,dy,px,py,w,h] of grassEdges){
          const xx=x+dx,yy=y+dy;
          if(xx<0||xx>=z.width||yy<0||yy>=z.height)continue;
          const kind=tiles.get(xx+yy*z.width)?.kind??z.ground;
          if(kind==="paving"||kind==="floor")rect(c,vividOn?"#cdb98f":"#b6aa90",x*16+px,y*16+py,w,h);
        }
      }
    }
  }
  if(tiles&&curvedRoad&&top<98&&bottom>78){
    paintVialeRoad(c,left,right);
  }
  if(tiles)paintEntranceStreet(c,id,z,tiles,left,top,right,bottom);
  if(!editing&&visible.edifici)paintCampusBoundary(c,z,left,top,right,bottom);
  if(!editing&&typeof realismoOmbre==="function")realismoOmbre(c,z,id,left,top,right,bottom,now);
  const foreground=[];
  for(const raw of editing?z.objects:continuousWalls(z)){
    const layer=kindLayer(raw);
    if(!visible[layer]||layer==="terreno")continue;
    const o=positionOf(raw,editing?0:isVehicle(raw)?trafficClock:now,z.width);
    if(o.x+o.w<left||o.y+o.h<top||o.x>right||o.y>bottom)continue;
    if(o.kind==="zebra"){
      drawObject(c,o,now,editing);
      continue;
    }
    foreground.push({row:o.y+o.h,draw:()=>drawObject(c,o,now,editing)});
  }
  if(player)foreground.push(player);
  foreground.sort((a,b)=>a.row-b.row).forEach(o=>o.draw());
  const effect=editing?null:vialeEncounterEffect;
  if(effect?.zone===id){
    const progress=(performance.now()-effect.start)/1050;
    if(progress>=1)vialeEncounterEffect=null;
    else{
      const originX=(effect.x+.5)*16,originY=(effect.y+.5)*16;
      const spread=[.64,.90,.50,1.0][effect.style];
      c.save();
      for(let i=0;i<26;i++){
        const age=reducedMotion ? .35 : (progress-i%6*.018)/.87;
        if(age<0||age>=1)continue;
        const angle=((i*13%27)/26-.5)*spread;
        const speed=42+i*19%73;
        const x=originX+Math.sin(angle)*speed*age;
        const y=originY-Math.cos(angle)*speed*age+95*age*age;
        const size=Math.max(.8,(2+i%3)*(1-age*.63));
        c.globalAlpha=(1-age)**1.4*(reducedMotion?1-progress:1);
        rect(c,i%3?"#fff":"#dddff7",x,y,size,size);
      }
      c.restore();
    }
  }
}
const systemReducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;
let reducedMotion=systemReducedMotion;
try{if(localStorage.getItem("ultimo-posto-movimento-ridotto")==="on")reducedMotion=true;}catch{}
let mapClock=0,trafficClock=0,lastTrafficFrame=0;
function trafficImpact(){
  if(isFree()||state.ending||minigame||activeScene||state.prologue)return;
  const zone=room(state.zone);
  const hit=zoneObjects(zone).vehicles.find(o=>{
    const at=positionOf(o,trafficClock,zone.width);
    if(at.parked)return false;
    let x=state.x+.5,y=state.y+.5;
    if(at.bend){
      const cx=at.x+at.w/2,cy=at.y+at.h/2;
      const dx=x-cx,dy=y-cy;
      const cos=Math.cos(at.bend),sin=Math.sin(at.bend);
      x=cx+dx*cos+dy*sin;
      y=cy-dx*sin+dy*cos;
    }
    return insideObject(at,x,y);
  });
  if(!hit)return;
  state.ending={traffic:true,title:"Game Over",vehicle:hit.kind,color:hit.color,direction:positionOf(hit,trafficClock,zone.width).look,text:hit.kind==="bus"?"Il 360 ti ha sorpreso mentre attraversavi Viale Romania.":hit.kind==="car"?"Ti ha colpito un’auto su Viale Romania.":state.zone==="giardino"?"Ti ha colpito un motorino in cerca di parcheggio.":"Ti ha colpito un motorino su Viale Romania."};
  startImpactAnimation();
  activeScene=null;clearCampusInputs();chime([46,38]);save();renderScene();
}
function openingScene(){
  if(state.prologue===1)return scene("Domani, ore 9:00","Il telefono vibra sul marciapiede di Viale Romania. Il gruppo del corso manda l’ultimo messaggio: «Domani alle 9. Portate il documento». Hai un portatile quasi scarico, gli appunti a metà e un pomeriggio per rimediare.",
    ["Cerco una presa",()=>{change("pragmatismo",5);state.prologue=2;record("Prima di tutto: una presa.");}],
    ["Cerco un posto in silenzio",()=>{change("autocontrollo",5);state.prologue=2;record("Prima di tutto: il silenzio.");}]);
  return scene("Viale Romania 32","Sull’altro lato del viale, due studenti spariscono oltre i pilastri della LUISS. Un motorino passa davanti alle strisce. La guardia è già al suo posto. Devi solo arrivare dall’altra parte.",
    ["Aspetta un varco e parti",()=>{state.prologue=0;}]);
}
