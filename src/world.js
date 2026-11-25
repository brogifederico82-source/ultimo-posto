// Map data and rendering
const layers={
  terreno:"Terreno",edifici:"Edifici",arredi:"Arredamento",persone:"Personaggi",decori:"Decorazioni"
};
const catalog={
  "Campus LUISS":[["domeHall","Padiglione metallico","edifici","#52616a",7,4,true],["chapel","Aula Chiesa","edifici","#ad6c51",6,5,true],["faculty","Edificio in cotto","edifici","#ae6b50",8,4,true],["court","Campo sportivo","decori","#527d72",7,4]],
  "Viale Romania":[["shelter","Pensilina","edifici","#466e7a",4,2,true],["pillar","Pilastro con urna","edifici","#e9e4d3",1,3,true],["booth","Guardiola","edifici","#ddc4a0",3,3,true],["pine","Pino marittimo","decori","#526d49",3,3],["cypress","Cipresso","decori","#355246",1,2],["luiss","Scritta LUISS","decori","#325988",5,2],["zebra","Strisce pedonali","decori","#e4deca",1,3],["bus","Autobus ATAC 360","persone","#a84a45",5,1],["shuttle","Navetta LUISS","persone","#e4e5da",4,1,true],["car","Auto","persone","#b96054",2,1],["scooter","Motorino","persone","#e8bc45"]],
  "Architettura":[["wall","Muro","edifici","#887870",1,1,true],["door","Porta","edifici","#ac754d"],["window","Finestra","edifici","#78a5a5"],["stairs","Scale","edifici","#a09b88"],["roof","Edificio","edifici","#ab6654",4,3,true]],
  "Terreno":[["grass","Prato","terreno","#476f4d"],["road","Asfalto","terreno","#687078"],["paving","Pavimentazione","terreno","#a59a87"],["path","Sentiero","terreno","#b3a18a"],["floor","Pavimento interno","terreno","#806a65"]],
  "Vegetazione":[["tree","Albero","decori","#4c7553",1,1,true],["hedge","Siepe","decori","#557c4e",1,1,true],["bush","Cespuglio","decori","#648052"],["flowers","Fiori","decori","#d8a86f"]],
  "Arredamento":[["desk","Scrivania","arredi","#a68864",2,1,true],["chair","Sedia","arredi","#9f7851",1,1,true],["sofa","Divano","arredi","#9b685a",2,1,true],["shelf","Scaffale","arredi","#916c4c",1,1,true],["bench","Panchina","arredi","#a08a5b",2,1,true]],
  "Università":[["classroom","Aula","edifici","#a67762",3,2,true],["board","Lavagna","arredi","#487062"],["vending","Distributore","arredi","#9b6456",1,1,true],["turnstile","Tornello","edifici","#84958a"],["library","Biblioteca","edifici","#897460",3,2,true]],
  "Intrattenimento":[["foos","Biliardino","arredi","#48866d",2,1,true],["ping","Ping pong","arredi","#397d82",2,1,true],["bris","Tavolo da briscola","arredi","#80694b",2,1,true],["poker","Tavolo da poker","arredi","#33725e",2,1,true]],
  "Personaggi":[["athlete","Gymbro","persone","#a94e47"],["heatedStudent","Studente con IQOS","persone","#af6380"],["sportGlasses","Studente con occhiali sportivi","persone","#527f87"],["student","Studente","persone","#bb6268"],["guard","Guardia","persone","#6089aa"],["creator","Influencer","persone","#9966a3"],["bartender","Barista","persone","#ae775e"],["professor","Professore","persone","#b09461"],["cleaner","Spazzino","persone","#80a471"]],
  "Decorazioni":[["sign","Cartello","decori","#d1ae72"],["bin","Cestino","decori","#71877c",1,1,true],["lamp","Lampione","decori","#d2ac66"],["fountain","Fontana","decori","#699b9b",2,2,true],["rope","Cordone","decori","#a94057"],["entrance","Ingresso","decori","#d1af6d"],["event","Evento","decori","#c67668"],["goal","Obiettivo","decori","#d6bb74"]]
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
const maxCampusZones=33;
const stockCampus=installTeachingRooms(JSON.parse($("edOriginal").textContent));
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
const originalMap=normalizeCampus(improveDome2Entrance(addVialeArcade(joinRomaniaEntrance(furnishCampusInteriors(stockCampus)))));
updateGardenStudentNames(originalMap);
const oldEntrance=[{"uid":"ingresso-guardia","kind":"guard","name":"Guardia","x":4,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#6089aa","solid":true,"action":"native","native":"guardia","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-bacheca","kind":"sign","name":"Bacheca","x":10,"y":5,"w":1,"h":1,"rotation":0,"variant":0,"color":"#d1ae72","solid":true,"action":"native","native":"bacheca","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-varco","kind":"turnstile","name":"Tornello","x":17,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#84958a","solid":true,"action":"native","native":"varco","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-start","kind":"entrance","name":"Punto di ingresso","x":3,"y":6,"w":1,"h":1,"rotation":0,"variant":0,"color":"#d1af6d","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-4","kind":"paving","name":"Pavimentazione","x":3,"y":2,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-5","kind":"paving","name":"Pavimentazione","x":16,"y":2,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-6","kind":"paving","name":"Pavimentazione","x":3,"y":3,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-7","kind":"paving","name":"Pavimentazione","x":16,"y":3,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-8","kind":"paving","name":"Pavimentazione","x":0,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-9","kind":"paving","name":"Pavimentazione","x":1,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-10","kind":"paving","name":"Pavimentazione","x":2,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-11","kind":"paving","name":"Pavimentazione","x":3,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-12","kind":"paving","name":"Pavimentazione","x":4,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-13","kind":"paving","name":"Pavimentazione","x":5,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-14","kind":"paving","name":"Pavimentazione","x":6,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-15","kind":"paving","name":"Pavimentazione","x":7,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-16","kind":"paving","name":"Pavimentazione","x":8,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-17","kind":"paving","name":"Pavimentazione","x":9,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-18","kind":"paving","name":"Pavimentazione","x":10,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-19","kind":"paving","name":"Pavimentazione","x":11,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-20","kind":"paving","name":"Pavimentazione","x":12,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-21","kind":"paving","name":"Pavimentazione","x":13,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-22","kind":"paving","name":"Pavimentazione","x":14,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-23","kind":"paving","name":"Pavimentazione","x":15,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-24","kind":"paving","name":"Pavimentazione","x":16,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-25","kind":"paving","name":"Pavimentazione","x":17,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-26","kind":"paving","name":"Pavimentazione","x":18,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-27","kind":"paving","name":"Pavimentazione","x":19,"y":4,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-28","kind":"paving","name":"Pavimentazione","x":3,"y":5,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-29","kind":"paving","name":"Pavimentazione","x":16,"y":5,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-30","kind":"paving","name":"Pavimentazione","x":3,"y":6,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-31","kind":"paving","name":"Pavimentazione","x":16,"y":6,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-32","kind":"paving","name":"Pavimentazione","x":0,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-33","kind":"paving","name":"Pavimentazione","x":1,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-34","kind":"paving","name":"Pavimentazione","x":2,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-35","kind":"paving","name":"Pavimentazione","x":3,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-36","kind":"paving","name":"Pavimentazione","x":4,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-37","kind":"paving","name":"Pavimentazione","x":5,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-38","kind":"paving","name":"Pavimentazione","x":6,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-39","kind":"paving","name":"Pavimentazione","x":7,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-40","kind":"paving","name":"Pavimentazione","x":8,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-41","kind":"paving","name":"Pavimentazione","x":9,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-42","kind":"paving","name":"Pavimentazione","x":10,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-43","kind":"paving","name":"Pavimentazione","x":11,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-44","kind":"paving","name":"Pavimentazione","x":12,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-45","kind":"paving","name":"Pavimentazione","x":13,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-46","kind":"paving","name":"Pavimentazione","x":14,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-47","kind":"paving","name":"Pavimentazione","x":15,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-48","kind":"paving","name":"Pavimentazione","x":16,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-49","kind":"paving","name":"Pavimentazione","x":17,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-50","kind":"paving","name":"Pavimentazione","x":18,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-51","kind":"paving","name":"Pavimentazione","x":19,"y":7,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-52","kind":"paving","name":"Pavimentazione","x":3,"y":8,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-53","kind":"paving","name":"Pavimentazione","x":16,"y":8,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-54","kind":"paving","name":"Pavimentazione","x":3,"y":9,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-55","kind":"paving","name":"Pavimentazione","x":16,"y":9,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-56","kind":"paving","name":"Pavimentazione","x":3,"y":10,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-57","kind":"paving","name":"Pavimentazione","x":16,"y":10,"w":1,"h":1,"rotation":0,"variant":0,"color":"#a59a87","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-58","kind":"road","name":"Asfalto","x":0,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-59","kind":"road","name":"Asfalto","x":1,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-60","kind":"road","name":"Asfalto","x":2,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-61","kind":"road","name":"Asfalto","x":3,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-62","kind":"road","name":"Asfalto","x":4,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-63","kind":"road","name":"Asfalto","x":5,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-64","kind":"road","name":"Asfalto","x":6,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-65","kind":"road","name":"Asfalto","x":7,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-66","kind":"road","name":"Asfalto","x":8,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-67","kind":"road","name":"Asfalto","x":9,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-68","kind":"road","name":"Asfalto","x":10,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-69","kind":"road","name":"Asfalto","x":11,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-70","kind":"road","name":"Asfalto","x":12,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-71","kind":"road","name":"Asfalto","x":13,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-72","kind":"road","name":"Asfalto","x":14,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-73","kind":"road","name":"Asfalto","x":15,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-74","kind":"road","name":"Asfalto","x":16,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-75","kind":"road","name":"Asfalto","x":17,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-76","kind":"road","name":"Asfalto","x":18,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-77","kind":"road","name":"Asfalto","x":19,"y":11,"w":1,"h":1,"rotation":0,"variant":0,"color":"#687078","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-78","kind":"tree","name":"Albero","x":0.0625,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-79","kind":"tree","name":"Albero","x":2.9375,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-80","kind":"tree","name":"Albero","x":5.125,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-81","kind":"tree","name":"Albero","x":13.875,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-82","kind":"tree","name":"Albero","x":17.25,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]},{"uid":"ingresso-83","kind":"tree","name":"Albero","x":18.75,"y":9.7,"w":1.15,"h":1.4,"rotation":0,"variant":0,"color":"#4c7553","solid":false,"action":"","native":"","text":"","target":"","gate":"","missionTarget":"","auto":false,"behavior":"idle","speed":1.7,"route":[]}];
let campus=loadCampus();
let testMode=false, editorState=null;
function freshMap(){return structuredClone(originalMap);}
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
      const oldGarden=source.zones.giardino;
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
      if(!embedded){updateGardenStudentNames(map);addVialeArcade(map);improveDome2Entrance(map);}
      return map;
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
  foregroundCache=new WeakMap();
  try{localStorage.setItem(mapStorageKey,JSON.stringify(campus));return true;}
  catch{return false;}
}
function room(id){return campus.zones[id]??campus.zones.ingresso;}
function kindLayer(o){return assets[o.kind][2];}
function sceneObjects(zone){
  let objects=foregroundCache.get(zone);
  if(!objects){
    objects=zone.objects.filter(o=>kindLayer(o)!=="terreno"||o.solid||o.action);
    foregroundCache.set(zone,objects);
  }
  return objects;
}
function entriesIn(id){return room(id).objects.filter(o=>o.kind==="entrance");}
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
  if(width>94&&o.uid==="viale-bus-360"&&o.behavior==="loop")return vialeBusAt(o,now);
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
function blocked(id,x,y,now=0){
  const zone=room(id);
  if(x<0||y<0||x>=zone.width||y>=zone.height)return true;
  return sceneObjects(zone).some(o=>o.solid&&
    (o.uid!=="viale-ingresso-varco"||(!state?.campusGateOpen&&!isFree()))&&
    (!o.gate||gateLocked(o.gate))&&insideObject(positionOf(o,now),x+.5,y+.5));
}
function freeTile(id,x,y){
  const z=room(id);
  const sx=Math.round(clamp(x,0,z.width-1)),sy=Math.round(clamp(y,0,z.height-1));
  for(let radius=0;radius<Math.max(z.width,z.height);radius++)
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)
      if(Math.max(Math.abs(dx),Math.abs(dy))===radius&&!blocked(id,sx+dx,sy+dy))return [sx+dx,sy+dy];
  return [sx,sy];
}
function reachEntry(id,preferred){
  const entries=entriesIn(id);
  const entry=entries.find(e=>e.uid===preferred||e.target===preferred)??entries[0];
  return freeTile(id,entry?.x??2,entry?.y??2);
}
function currentObject(){return room(state.zone).objects.find(o=>o.uid===activeScene);}
function nearbyIn(id,x,y,now=0){
  let best,dist=.95;
  for(const item of sceneObjects(room(id))){
    if(!item.action&&(kindLayer(item)!=="persone"||isVehicle(item)))continue;
    const o=positionOf(item,now);
    const xDist=Math.max(o.x-(x+.5),0,(x+.5)-(o.x+o.w));
    const yDist=Math.max(o.y-(y+.5),0,(y+.5)-(o.y+o.h));
    const d=xDist+yDist;
    if(d<dist){best=o;dist=d;}
  }
  return best;
}
function colorVariant(hex,variant){
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
    rect(c,patch>0?"#a9af5820":"#244d4020",x*16,y*16,16,16);
    rect(c,"#d5df9b31",x*16+(x*5+y*3)%13,y*16+5,2,1);
    rect(c,"#17372d48",x*16+4,y*16+12,3,2);
  }else if(kind==="path"){
    const seed=(x*37+y*71)%13;
    rect(c,"#ead4ac65",x*16+seed,y*16+4,2,1);
    rect(c,"#705c4440",x*16+2,y*16+seed,1,1);
  }else if(kind==="road"){
    if(x%2===0)rect(c,"#e9d8a77a",x*16+1,y*16+8,14,1);
  }else{
    rect(c,"#272a3836",x*16,y*16,16,1);
    if(kind==="paving"||kind==="floor")rect(c,"#fff0bf19",x*16+7+(y%2)*5,y*16,1,16);
  }
}
function drawObject(c,o,now=0,editing=false){
  const spec=assets[o.kind];
  if(!spec||spec[2]==="terreno")return;
  if(o.kind==="entrance"&&!editing)return;
  const x=o.x*16,y=o.y*16,w=o.w*16,h=o.h*16;
  const color=colorVariant(o.color,o.variant);
  c.save();c.translate(x+w/2,y+h/2);c.rotate(o.rotation*Math.PI/180);
  if(o.rotation%180)c.scale(h/w,w/h);
  c.translate(-w/2,-h/2);
  c.scale(w/16,h/16);
  const box=(t,a,b,ww,hh)=>rect(c,t,a,b,ww,hh);
  const shadow="#283236",light="#ead6ac",white="#fff1c8";
  if(isVehicle(o)){
    if(o.look==="left"){c.translate(16,0);c.scale(-1,1);}
    box("#17212688",1,11,14,3);
    if(o.kind==="bus"||o.kind==="shuttle"){
      const bus=o.kind==="bus";
      box("#292e30",0,2,16,12);box(bus?"#a24746":color,.3,3,15.4,10);
      box(bus?"#8e4640":"#315372",.4,9,15.2,2);
      for(const px of [1,4,7,10,13])box("#93aab0",px,4,2,4);
      box("#3f5860",15,4,.65,7);
      box("#181f21",2,1,2,2);box("#181f21",11,12,2,2);
      box("#fff0ad",15,9,.6,1.5);box("#e8644e",0,9,.55,1.5);
      c.scale(16/w,16/h);
      if(o.look==="left"){c.translate(w,0);c.scale(-1,1);}
      c.fillStyle=bus?"#fff1b9":"#f4ead2";c.font="bold 6px monospace";
      c.textAlign="center";c.fillText(bus?"360":"LUISS",w/2,h*.71);
    }else if(o.kind==="car"){
      box(shadow,0,3,16,10);box(color,1,4,14,8);box("#b1cad0",8,5,3,6);box("#435960",4,5,3,6);
      box("#242a2b",3,2,2,2);box("#242a2b",11,12,2,2);box("#fff0ac",14,5,1,2);box("#e85d50",1,5,1,2);
    }else{
      box(shadow,1,7,4,4);box(shadow,11,7,4,4);box(color,3,6,11,4);
      box("#3d4e57",5,5,5,5);box("#ddad83",9,4,3,3);box("#fff1ad",13,6,1,2);
    }
  }else if(spec[2]==="persone"){
    const appearance=characterAppearance(o);
    const size=o.kind==="athlete"?1.05:.89;
    sprite(c,appearance,8,15,o.step??0,o.look??"down",size,characterCoat(o));
    if(o.native==="trend"){
      sprite(c,{...appearance,capelli:5,tinta:2,abito:3},12,15,(Math.floor(now/170)+1)%3,"down",.73);
    }
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
        box("#b6b5a7",2,5,12,11);box(color,3,5,9,10);box("#fff7e5",2,4,12,1);
        box("#afa691",4,1,8,2);box(light,5,0,6,2);box("#c6baa2",5,2,6,2);box("#777266",5,8,4,2);break;
      case "booth":
        box("#4f4140",0,1,16,14);box(color,1,2,14,12);box("#f7e4ba",1,2,14,2);box("#3d5051",3,7,4,4);box("#725746",10,7,3,7);if(o.native==="shop"){
          box("#20294a",1,2,14,4);c.textAlign="center";c.font="bold 2.5px monospace";c.fillStyle="#fff1c8";
          c.fillText("LUISS SHOP",8,5,13);
        }else if(o.native==="cavalli"){
          box("#1b234c",.5,1,15,5);box("#506dff",.5,1,15,.65);box("#c45ed9",.5,5.5,15,.45);
          box("#151d31",2,7,5,3.5);box("#6b87f3",2.5,7.5,4,1.5);box("#262b4e",10,6.5,3,6.5);
          c.textAlign="center";c.font="bold 2.5px monospace";c.fillStyle="#e7f3ff";c.fillText("CORSE 360",8,4.7,13);
        }
        break;
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
        crown("#b1b87544",5.2,4.2,3.5,2);
        break;
      }
      case "cypress":
        box("#303f38",7,10,2,6);box(color,5,3,6,11);box(color,7,0,2,4);box("#78915c",6,5,2,6);break;
      case "luiss":
        c.font="bold 5px Georgia";c.textAlign="center";c.fillStyle="#101923";c.fillText("LUISS",8,10.4);c.fillStyle="#f4ede0";c.fillText("LUISS",8,9.7);break;
      case "zebra":box(color,0,3,16,8);break;
      case "domeHall":{
        // Barrel roof: a continuous curved highlight and transverse ribs.
        box(shadow,0,.6,16,15.4);
        const vault=c.createLinearGradient(0,0,16,0);
        for(const [stop,tone] of [[0,"#53666b"],[.25,"#acbabc"],[.45,"#e2e6dc"],[.78,color],[1,"#59696d"]])
          vault.addColorStop(stop,tone);
        c.fillStyle=vault;c.fillRect(.2,.2,15.4,13.8);
        for(let i=1;i<14;i+=1.7)box("#42596366",.3,i,15.2,.12);
        box("#384f54",.5,14,15,1.4);
        for(let i=1;i<16;i+=2)box("#b5c2b4",i,14,.18,1.4);
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
      case "wall":box(shadow,0,1,16,14);box(color,0,2,16,10);box(light,0,2,16,2);box("#141d213a",0,9,16,1);break;
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
      case "fountain":box(shadow,1,4,14,10);box(color,2,4,12,8);box("#aed4c6",6,6,4,4);box(white,7+(Math.floor(now/250)%2),5,2,2);break;
      case "rope":for(const a of [1,7,14])box(light,a,2,1,12);box(color,1,5,14,2);break;
      default:
        box(shadow,3,3,10,11);box(color,4,4,8,8);box(light,7,8,2,6);
        c.fillStyle=shadow;c.font="bold 7px monospace";c.textAlign="center";
        c.fillText(({entrance:"↳",event:"!",goal:"★",sign:"·"})[o.kind]??"·",8,10);
    }
  }
  c.restore();
}
// Campus perimeter and street alignment traced against the reference plan.
function paintRomaniaEdges(c){
  c.save();c.scale(16,16);
  c.beginPath();c.rect(0,0,144,144);
  c.moveTo(23,5);c.bezierCurveTo(46,11,60,17,70,28);
  c.bezierCurveTo(81,41,88,56,86,70);
  c.lineTo(83,87);c.lineTo(64,92);c.lineTo(9,78);
  c.lineTo(7,45);c.bezierCurveTo(8,28,15,15,23,5);c.closePath();
  c.fillStyle="#34464a45";c.fill("evenodd");
  c.lineCap="round";c.lineJoin="round";
  const street=(trace)=>{
    c.beginPath();trace();
    c.lineWidth=4.5;c.strokeStyle="#ad9c82";c.stroke();
    c.lineWidth=3.65;c.strokeStyle="#535d66";c.stroke();
    c.lineWidth=.07;c.strokeStyle="#f1d9a298";c.setLineDash([.55,.48]);c.stroke();c.setLineDash([]);
  };
  if(hasIntegratedEntrance()){
    c.beginPath();
    for(const [index,[x,y]] of vialeRoad.entries()){
      if(index===0)c.moveTo(x,y+.5);
      else c.lineTo(x,y+.5);
    }
    c.lineWidth=4.1;c.strokeStyle="#a29a88";c.stroke();
    c.lineWidth=3.6;c.strokeStyle="#c2b4a0";c.stroke();
    c.lineWidth=3.25;c.strokeStyle="#48545f";c.stroke();
    c.lineWidth=3.02;c.strokeStyle="#505c69";c.stroke();
    c.lineCap="butt";c.lineWidth=.1;c.strokeStyle="#efdf9c";c.setLineDash([.65,.52]);c.stroke();c.setLineDash([]);
    for(const x of [40,51,72,88]){
      const y=vialeRoadY(x)+.5;
      c.fillStyle="#afbac5";c.fillRect(x,y-1.16,.65,.1);c.fillRect(x,y+1.08,.65,.1);
    }
    c.lineCap="round";
  }else street(()=>{c.moveTo(2,78);c.bezierCurveTo(17,80,28,84,41,88);c.lineTo(79,98);c.lineTo(91,101);});
  street(()=>{c.moveTo(22,3);c.bezierCurveTo(55,9,75,25,82,42);c.bezierCurveTo(91,56,92,66,89,79);});
  c.restore();
}
function worldView(c,id,now,view,visible=layers,editing=false,player=null){
  const z=room(id);
  const margin=2,left=Math.max(0,Math.floor(view.x/16)-margin),top=Math.max(0,Math.floor(view.y/16)-margin);
  const right=Math.min(z.width,Math.ceil((view.x+view.w)/16)+margin);
  const bottom=Math.min(z.height,Math.ceil((view.y+view.h)/16)+margin);
  if(visible.terreno){
    let tiles=editing?null:terrainCache.get(z);
    if(!tiles){tiles=terrainMap(z);if(!editing)terrainCache.set(z,tiles);}
    for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
      const tile=tiles.get(x+y*z.width);
      groundTile(c,tile?.kind??z.ground,x,y,tile?.color,tile?.variant);
    }
  }
  if(visible.terreno&&id==="giardino"&&!editing&&z.width===144&&
      z.objects.some(o=>o.uid==="entry-from-panama"&&o.x===72&&o.y===47))paintRomaniaEdges(c);
  // Connect the existing garden walks around the planted islands north of the bar.
  if(visible.terreno && id==="giardino" &&
      left<78 && right>11 && top<74 && bottom>13 &&
      sceneObjects(z).some(o=>o.uid==="bosco-studio" && o.x===34 && o.y===24)){
    const tiles=editing?terrainMap(z):terrainCache.get(z);
    c.save();c.beginPath();
    for(let y=Math.max(top,13);y<Math.min(bottom,74);y++)
      for(let x=Math.max(left,11);x<Math.min(right,78);x++)
        if((tiles.get(x+y*z.width)?.kind??z.ground)==="grass")c.rect(x*16,y*16,16,16);
    c.clip();c.scale(16,16);
    c.beginPath();c.moveTo(16,40);c.bezierCurveTo(14,35,19,32,22,30);
    c.bezierCurveTo(26,27,26,19,32,20);c.bezierCurveTo(38,20,39,24,42,24);
    c.moveTo(22,30);c.bezierCurveTo(28,31,30,28,32,25);
    c.moveTo(22,73);c.bezierCurveTo(21,62,16,58,16,40);
    c.moveTo(42,24);c.bezierCurveTo(50,24,58,30,63,34);
    c.bezierCurveTo(68,38,69,45,72,47);
    c.moveTo(72,47);c.bezierCurveTo(76,52,77,60,74,64);
    c.moveTo(22,73);c.bezierCurveTo(25,68,28,65,36,64);
    c.moveTo(37,66);c.bezierCurveTo(38,70,43,76,48,79);
    c.moveTo(42,35);c.bezierCurveTo(43,40,52,44,59,54);
    c.bezierCurveTo(66,57,71,59,78,60);
    c.lineCap="round";c.lineWidth=1.65;c.strokeStyle="#8c9470";c.stroke();
    c.lineWidth=1.4;c.strokeStyle="#b9a584";c.stroke();c.restore();
  }
  const foreground=[];
  for(const raw of editing?z.objects:sceneObjects(z)){
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
}
const reducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;
let mapClock=0,trafficClock=0,lastTrafficFrame=0;
function trafficImpact(){
  if(isFree()||state.ending||minigame||activeScene||state.prologue)return;
  const zone=room(state.zone);
  const hit=sceneObjects(zone).find(o=>{
    if(!isVehicle(o)||o.behavior==="idle")return false;
    const at=positionOf(o,trafficClock,zone.width);
    return !at.parked&&insideObject(at,state.x+.5,state.y+.5);
  });
  if(!hit)return;
  state.ending={traffic:true,title:"Game Over",text:hit.kind==="bus"?"Il 360 ti ha sorpreso mentre attraversavi Viale Romania.":hit.kind==="car"?"Ti ha colpito un’auto su Viale Romania.":state.zone==="giardino"?"Ti ha colpito un motorino in cerca di parcheggio.":"Ti ha colpito un motorino su Viale Romania."};
  activeScene=null;keys.clear();controls.clear();chime([46,38]);save();renderScene();
}
function openingScene(){
  if(state.prologue===1)return scene("Domani, ore 9:00","Il telefono vibra sul marciapiede di Viale Romania. Il gruppo del corso manda l’ultimo messaggio: «Domani alle 9. Portate il documento». Hai un portatile quasi scarico, gli appunti a metà e un pomeriggio per rimediare.",
    ["Cerco una presa",()=>{change("pragmatismo",5);state.prologue=2;record("Prima di tutto: una presa.");}],
    ["Cerco un posto in silenzio",()=>{change("autocontrollo",5);state.prologue=2;record("Prima di tutto: il silenzio.");}]);
  return scene("Viale Romania 32","Sull’altro lato del viale, due studenti spariscono oltre i pilastri della LUISS. Un motorino passa davanti alle strisce. La guardia è già al suo posto. Devi solo arrivare dall’altra parte.",
    ["Aspetta un varco e parti",()=>{state.prologue=0;}]);
}
