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
  if(loft?.objects.some(o=>o.uid==="loft-coding")&&!loft.objects.some(o=>o.uid==="loft-coding-chair")){
    add(loft,"loft-coding-chair","chair","Seduta della postazione coding",12,3,{color:"#486d87",solid:true});
    add(loft,"loft-lab-chair","chair","Seduta del laboratorio",18,3,{color:"#527e72",solid:true});
    add(loft,"loft-projection-seat-left","sofa","Seduta per la proiezione",16,12,{w:3,color:"#586688",solid:true});
    add(loft,"loft-projection-seat-right","sofa","Seduta per la proiezione",20,12,{w:3,color:"#586688",solid:true});
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
  add("dome2-forecourt","paving","Piazzetta della Serra",20,65,{w:5,h:2,color:"#b9ac95"});
  add("dome2-walk-edge","paving","Bordo del vialetto",21,67,{w:3,h:6,color:"#a89d8d"});
  add("dome2-walk-center","paving","Vialetto della Serra",22,67,{w:1,h:7,color:"#c7bba4"});
  add("dome2-calcetto","student","Matteo · Calcetto",22,65,
    {color:"#3f84a8",solid:true,action:"native",native:"calcetto"});
  return map;
}

function widenAcademicHalls(map){
  const floorDirectory={
    primo:"Primo piano · A101, A103a e A103b.",
    secondo:"Secondo piano · A201, A202, A203 (Aula Toti), A204, A205a/b, A206a/b, A207, A209, A210 e A211 (Aula Grande). A200 (Aula Chiesa) ha anche un accesso dal campus.",
    terzo:"Terzo piano · A303, A305a e A305b."
  };
  for(const id of ["terra","primo","secondo","terzo","quarto","quinto","parenzo-corridoio"]){
    const hall=map.zones[id];
    hall.width+=4;
    hall.height+=3;
    const {width,height}=hall;
    const setSide=(uid,x,y)=>{
      const item=hall.objects.find(o=>o.uid===uid);
      if(item)Object.assign(item,{x,y});
    };
    setSide("romania-corridoio-panca",width-5,height-3);
    setSide("parenzo-corridoio-panca",width-5,height-3);
    setSide("terra-ospite",14,11);
    setSide("terzo-silenzio",15,11);
    const walls=[[0,0,width,1],[0,1,1,height-2],[width-1,1,1,height-2],[0,height-1,width,1]];
    hall.objects=hall.objects.filter(o=>!o.uid.endsWith("-corridoio-parete"));
    for(const [i,[x,y,w,h]] of walls.entries()){
      hall.objects.push({uid:id+"-hall-wall-"+i,kind:"wall",name:"Parete perimetrale",x,y,w,h,solid:true,color:"#a38f7d"});
    }
    hall.objects.push({uid:id+"-hall-paving",kind:"paving",name:"Corridoio principale",x:1,y:5,w:width-2,h:5,color:"#b8a790"});
    if(floorDirectory[id])hall.objects.push({uid:id+"-hall-directory",kind:"sign",name:"Pianta del piano",
      x:width-4,y:4,color:"#c7ad7e",action:"dialog",text:floorDirectory[id]});
    for(const object of hall.objects.filter(o=>o.action==="portal")){
      hall.objects.push({uid:object.uid+"-hall-threshold",kind:"paving",name:"Soglia",x:object.x,y:object.y,color:"#b8a790"});
    }
  }
}
