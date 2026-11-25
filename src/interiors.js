// Playable layouts based on documented spaces, with room IDs and arrivals kept stable.
function furnishCampusInteriors(map){
  const add=(zone,uid,kind,name,x,y,extra={})=>zone.objects.push({uid,kind,name,x,y,...extra});
  const garden=map.zones.giardino;
  if(garden?.objects.some(o=>o.uid==="romania-a200")&&!garden.objects.some(o=>o.uid==="romania-a200-porta")){
    add(garden,"romania-a200-porta","door","A200 · Entra in Aula Chiesa",36,64,
      {action:"portal",target:"aula-chiesa#campus"});
  }

  const church=map.zones["aula-chiesa"];
  if(church&&!church.objects.some(o=>o.uid==="a200-navata")){
    church.height=22;
    church.objects=church.objects.filter(o=>!o.uid.startsWith("a200-desk-"));
    const move=(id,x,y)=>Object.assign(church.objects.find(o=>o.uid===id),{x,y});
    move("a200-entry",11,19);move("a200-out",11,20);
    move("a200-scale-entry",14,18);move("a200-stair-exit",14,20);
    add(church,"a200-navata","paving","Navata centrale",10,5,{w:4,h:15,color:"#b49e86"});
    add(church,"a200-pedana","paving","Pedana della cattedra",6,2,{w:12,h:3,color:"#a58766"});
    add(church,"a200-fondo","wall","Parete di fondo",4,0,{w:16,solid:true,color:"#ab9279"});
    for(const x of [2,20])for(const y of [3,7,11,15]){
      add(church,"a200-finestra-"+x+"-"+y,"window","Finestra laterale",x,y,{color:"#91b0b6"});
    }
    for(const y of [7,9,11,13,15,17])for(const x of [4,14]){
      add(church,"a200-fila-"+x+"-"+y,"desk","Fila di banchi",x,y,{w:5,solid:true,color:"#a77e56"});
    }
  }

  const hall=map.zones.polivalente;
  if(hall&&!hall.objects.some(o=>o.uid==="polivalente-palco")){
    hall.width=26;hall.height=17;
    hall.objects=hall.objects.filter(o=>!o.uid.startsWith("polivalente-seat-"));
    add(hall,"polivalente-palco","paving","Pedana eventi",5,2,{w:15,h:3,color:"#526879"});
    add(hall,"polivalente-schermo","board","Schermo della sala",8,1,{w:9,color:"#b9c8d2"});
    for(const y of [6,8,10])for(const x of [5,6,7,8,14,15,16,17]){
      add(hall,"polivalente-sedia-"+x+"-"+y,"chair","Seduta mobile",x,y,{solid:true,color:"#526575"});
    }
    add(hall,"polivalente-foyer","paving","Foyer e ingresso",3,11,{w:20,h:3,color:"#b0a496"});
    add(hall,"polivalente-regia","desk","Banco della regia",21,8,{w:3,solid:true,color:"#625f68"});
  }

  const loft=map.zones.loft;
  if(loft&&!loft.objects.some(o=>o.uid==="loft-podcast")){
    loft.width=25;loft.height=15;
    add(loft,"loft-podcast","desk","Postazione podcast",6,2,{w:4,solid:true,color:"#675985",action:"dialog",
      text:"Microfoni, cuffie e un cartello: lascia mezzo secondo di silenzio prima di parlare."});
    add(loft,"loft-coding","desk","Area coding",11,2,{w:3,solid:true,color:"#56758b"});
    add(loft,"loft-laboratorio","desk","Laboratorio e stampa 3D",17,2,{w:4,solid:true,color:"#7c7779"});
    add(loft,"loft-proiezione","board","Sala cinema",19,10,{w:4,action:"dialog",text:"La sala proiezioni è dall’altro lato della vetrata. Qui vicino trovi il cabinato."});
    add(loft,"loft-tappeto","paving","Zona di lavoro",6,6,{w:10,h:4,color:"#77748a"});
  }
  return map;
}

function improveDome2Entrance(map){
  if(map.zones.td2?.objects.some(o=>o.uid==="td2-student"&&o.native==="calcetto")){
    delete map.zones.td2;
    const corridor=map.zones.terra;
    if(corridor)corridor.objects=corridor.objects.filter(o=>o.uid!=="terra-td2"&&o.uid!=="terra-td2-arrival");
  }
  const garden=map.zones.giardino;
  const door=garden?.objects.find(o=>o.uid==="dome2-door");
  if(!door||door.x!==20||door.y!==64||garden.width<26||garden.height<74)return map;
  const add=(uid,kind,name,x,y,extra={})=>{
    if(garden.objects.some(o=>o.uid===uid))return;
    garden.objects.push({uid,kind,name,x,y,w:1,h:1,rotation:0,variant:0,color:"#758685",
      solid:false,action:"",native:"",text:"",target:"",gate:"",missionTarget:"",auto:false,
      behavior:"idle",speed:1.7,route:[],...extra});
  };
  add("dome2-forecourt","paving","Piazzetta The Dome 2",20,65,{w:5,h:2,color:"#b9ac95"});
  add("dome2-walk-edge","paving","Bordo del vialetto",21,67,{w:3,h:6,color:"#a89d8d"});
  add("dome2-walk-center","paving","Vialetto The Dome 2",22,67,{w:1,h:7,color:"#c7bba4"});
  add("dome2-calcetto","student","Matteo · Calcetto",22,65,
    {color:"#3f84a8",solid:true,action:"native",native:"calcetto"});
  return map;
}
