const vialeEntrance={x:8,y:69,gateY:75,width:30};
const vialeCoins=[
  ["fermata","giardino",24,86],["shop","giardino",22,77],["panchine","giardino",18,40],
  ["orto","giardino",46,25],["dome","giardino",60,56],["radio","giardino",35,57],
  ["panama","giardino",72,48],["atrio","terra",11,6],["chiesa","aula-chiesa",11,15],
  ["polivalente","polivalente",11,10],["loft","loft",16,7],["parenzo","parenzo-corridoio",11,9],
  ["pola","pola-cortile",23,11]
];
const campusMerch=[
  {id:"felpa",name:"Felpa blu Luiss",cost:2,outfit:{abito:4,taglio:1}},
  {id:"tote",name:"Tote bag del campus",cost:3,outfit:{zaino:3}},
  {id:"varsity",name:"Giubbotto varsity",cost:5,outfit:{abito:4,taglio:3}},
  {id:"spilla",name:"Spilla «Ultimo posto»",cost:4,outfit:{dettaglio:1}}
];
function joinRomaniaEntrance(map){
  const garden=map.zones.giardino, street=map.zones.ingresso;
  if(!garden||!street||garden.width<90||garden.height<90||garden.objects.some(o=>o.uid==="viale-ingresso-start"))return map;
  const {x,y,width}=vialeEntrance;
  garden.objects=garden.objects.filter(o=>{
    if(o.uid==="giardino-uscita")return false;
    return o.action||o.kind==="entrance"||o.x<x||o.x>=x+width||o.y<y+4||o.y>=y+20;
  });
  for(const obj of street.objects){
    if(obj.kind==="wall")continue;
    const clone={...obj,uid:"viale-"+obj.uid,x:obj.x+x,y:obj.y+y,route:obj.route?.map(([px,py])=>[px+x,py+y])};
    if(obj.uid==="ingresso-start")clone.target="viale";
    if(obj.uid==="ingresso-varco")clone.solid=true;
    if(obj.uid==="luiss-shop"){
      Object.assign(clone,{kind:"booth",x:x+10,y:y+8,w:2,h:1,solid:true,color:"#8e6f9b"});
    }
    garden.objects.push(clone);
  }
  const gateX=x+15;
  for(const [start,end] of [[x,gateX-2],[gateX+3,x+width]]){
    for(let side=start;side<end;side+=3){
      garden.objects.push({uid:"viale-inferriata-"+side,kind:"rope",name:"Inferriata bassa",
        x:side,y:y+6,w:Math.min(3,end-side),h:1,color:"#65736a",solid:true});
    }
  }
  for(const [side,px] of [["sx",gateX-2],["dx",gateX+2]]){
    garden.objects.push({uid:"viale-pilastro-"+side,kind:"pillar",name:"Pilastro in pietra",
      x:px,y:y+5,w:1,h:2,color:"#e7dbc1",solid:true});
  }
  for(const px of [gateX-1,gateX+1]){
    garden.objects.push({uid:"viale-inferriata-"+px,kind:"rope",name:"Inferriata bassa",
      x:px,y:y+6,w:1,h:1,color:"#65736a",solid:true});
  }
  return map;
}
const vialeRoad=[[0,81],[12,81],[17,83],[37,83],[49,87.5],[55,88.75],[59,90],[68,94.5],[75,94],[144,94]];
const vialeSlopes=vialeRoad.slice(1).map(([x,y],i)=>(y-vialeRoad[i][1])/(x-vialeRoad[i][0]));
const vialeTangents=vialeRoad.map((_,i)=>{
  const before=vialeSlopes[i-1]??0,after=vialeSlopes[i]??0;
  return before*after>0?2*before*after/(before+after):0;
});
function vialeRoadY(x){
  const i=vialeRoad.findIndex(([end])=>end>=x);
  if(i<=0)return vialeRoad[i===0?0:vialeRoad.length-1][1];
  const [start,y]=vialeRoad[i-1], [end,nextY]=vialeRoad[i];
  const t=(x-start)/(end-start);
  const bend=t*(1-t);
  return y+(nextY-y)*t*t*(3-2*t)+(end-start)*bend*((1-t)*vialeTangents[i-1]-t*vialeTangents[i]);
}
const vialeTraffic={
  "viale-romania-276":{east:true,start:9},
  "viale-romania-277":{east:true,start:22},
  "viale-bus-360":{east:true,start:33},
  "viale-romania-278":{east:false,start:38},
  "viale-romania-279":{east:false,start:21}
};
function vialeVehicleAt(vehicle,now,lane){
  const end=vialeRoad.at(-1)[0],margin=6,span=end+2*margin;
  // All vehicles in a lane use the same clock and slowdown curve to maintain separation.
  const traveled=((lane.east?lane.start+margin:end+margin-lane.start)+now*(lane.east?4.5:5.2)/1000)%span;
  const x=lane.east?traveled-margin:end+margin-traveled;
  const approach=(x-23)/5;
  const approaching=lane.east?approach<0:approach>0;
  const center=x-Math.atan(approach)*1.15;
  const bend=Math.atan2(vialeRoadY(center+1)-vialeRoadY(center-1),2);
  const westInset=.36*Math.max(0,Math.min(1,(17-center)/3));
  const curveInset=.28*Math.max(0,Math.min(1,(center-53)/2,(67-center)/2));
  const laneInset=westInset+curveInset;
  return {...vehicle,x:center-vehicle.w/2,y:vialeRoadY(center)+(lane.east?-.93+laneInset:.96-laneInset),
    look:lane.east?"right":"left",bend,braking:approaching&&Math.abs(approach)<1.3};
}
const vialeSurfacePrefix="viale-asfalto-";
function layVialeRoad(garden){
  const end=vialeRoad.at(-1)[0];
  if(!garden||garden.width<end||garden.height<105||
      garden.objects.some(o=>o.uid.startsWith(vialeSurfacePrefix)||o.uid==="romania-surface-carreggiata-0"))return;
  if(!garden.objects.some(o=>o.uid==="viale-ingresso-start"))return;
  garden.objects=garden.objects.filter(o=>!o.uid.startsWith("viale-prolungamento-"));
  const blocked=new Set();
  for(const o of garden.objects){
    if(!o.solid)continue;
    for(let x=Math.floor(o.x);x<o.x+(o.w??1);x++)
      for(let y=Math.floor(o.y);y<o.y+(o.h??1);y++)blocked.add(x+y*garden.width);
  }
  for(let x=0;x<end;x++){
    if(x>=17&&x<37)continue; // Keep the existing crossing and street tiles in front of the gate.
    const middle=Math.round(vialeRoadY(x+.5));
    for(let y=middle-1;y<=middle+1;y++){
      if(blocked.has(x+y*garden.width))continue;
      garden.objects.push({uid:vialeSurfacePrefix+x+"-"+y,kind:"road",name:"Viale Romania",
        x,y,w:1,h:1,color:"#4b5663",solid:false});
    }
  }
}
function addVialeArcade(map){
  const street=map.zones.ingresso;
  const garden=map.zones.giardino;
  const integrated=garden?.objects.some(o=>o.uid==="viale-ingresso-start");
  layVialeRoad(garden);
  for(const [area,uid,name,x,y,w,color,native] of [
    [street,"ingresso-tabaccheria","Tabaccheria · Viale Romania",21,17,2,"#426787","tabaccheria"],
    [integrated?garden:null,"giardino-tabaccheria","Tabaccheria · Viale Romania",67,99,2,"#426787","tabaccheria"],
    [street,"ingresso-sala-giochi","Sala scommesse · Viale Romania",24,17,2,"#a45153","cavalli"],
    [integrated?garden:null,"giardino-sala-giochi","Sala scommesse · Viale Romania",63,102,3,"#a45153","cavalli"],
    [integrated?garden:null,"giardino-rosticceria","Rosticceria · Viale Romania",64,96,2,"#8b527e","rosticceria"]
  ]){
    if(!area||x+w>area.width||y>=area.height)continue;
    const existing=area.objects.find(o=>o.uid===uid);
    if(existing){
      if(uid==="giardino-sala-giochi"&&existing.x===32&&existing.y===86&&existing.name==="Sala giochi · Viale Romania"){
        Object.assign(existing,{x,y,w,color,name});
      }
      continue;
    }
    if(area.objects.some(o=>o.solid&&o.x<x+w&&o.x+(o.w??1)>x&&o.y<y+1&&o.y+(o.h??1)>y))continue;
    area.objects.push({uid,kind:"booth",name,x,y,w,h:1,color,solid:true,action:"native",native,gate:"",target:"",route:[],rotation:0,variant:0});
  }
  return map;
}
function furnishCampusFountains(map){
  const garden=map.zones.giardino;
  if(!garden||garden.width!==144||garden.height!==144||
      !garden.objects.some(o=>o.uid==="viale-ingresso-start")||
      garden.objects.some(o=>o.uid.startsWith("acqua-romania-")))return map;
  const objects=garden.objects;
  const building=objects.findIndex(o=>o.uid==="quartiere-12"&&o.kind==="roof"&&
    o.x===49&&o.y===91&&o.w===8&&o.h===10&&!o.action);
  if(building!==-1){
    const [removed]=objects.splice(building,1);
    objects.push({...removed,uid:"acqua-romania-pavimento",kind:"paving",name:"Pavimentazione dello slargo",
      x:49,y:92,w:8,h:7,color:"#ada18e",solid:false});
  }
  const furniture=[
    ["giardino","fountain","Fontana del giardino",13,34,2,2,"#679994"],
    ["vialetto","fountain","Fontana del vialetto",25,45,2,2,"#578d89"],
    ["piazzale","fountain","Fontana del piazzale",63,50,2,2,"#6b9c98"],
    ["slargo","fountain","Fontana dello slargo",52,94,2,2,"#679994"],
    ["panca-ovest","bench","Panchina dello slargo",49,97,2,1,"#a1865f"],
    ["panca-est","bench","Panchina dello slargo",55,97,2,1,"#a1865f"],
    ["aiuola-ovest","flowers","Aiuola dello slargo",49,93,2,1,"#c89379"],
    ["aiuola-est","flowers","Aiuola dello slargo",55,93,2,1,"#c89379"],
    ...[[16,86],[28,86],[43,88],[60,94],[85,96],[108,96],[129,96]].map(([x,y])=>
      ["nasone-"+x,"nasone","Nasone · Viale Romania",x,y,1,1,"#465556"])
  ];
  for(const [id,kind,name,x,y,w,h,color] of furniture){
    if(objects.some(o=>(o.solid||o.action||o.kind==="entrance")&&
        o.x<x+w&&o.x+o.w>x&&o.y<y+h&&o.y+o.h>y))continue;
    if(kind==="nasone"&&Math.abs(y-vialeRoadY(x+.5))<1.85)continue;
    objects.push({uid:"acqua-romania-"+id,kind,name,x,y,w,h,color,solid:kind==="fountain",
      rotation:0,variant:0,action:"",native:"",text:"",target:"",gate:"",missionTarget:"",
      auto:false,behavior:"idle",speed:1.7,route:[]});
  }
  return map;
}
// Perimeter traced from the campus plan, in playable map coordinates.
const romaniaBoundary=[
  [22,8],[26,11],[32,12],[41,14],[48,16],[55,18],[59,23],[63,27],
  [68,34],[73,41],[78,46],[80,49],[82,52],[85,57],[83,62],[79,70],
  [77,76],[73,83],[70,90],[61,87],[49,83],[38,79],[28,78],[26,75],[23,75],
  [20,75],[8,72],[6,69],[7,60],[7,55],[7,49],[9,41],[13,29],[17,18]
];
// Via Panama runs along the outside of the northeast wall, parallel to it.
const panamaStreet=[
  [18,0],[22,4],[27,7],[34,9],[42,10],[49,12],[56,14],[61,19],
  [66,25],[71,31],[76,38],[82,45],[87,51],[90,54],[95,55],[99,59],[106,65],[120,70],[134,75],[144,77]
];
function distanceFromRoute(px,py,points){
  let best=Infinity;
  for(let i=1;i<points.length;i++){
    const [x,y]=points[i-1], [ex,ey]=points[i];
    const dx=ex-x,dy=ey-y;
    const t=Math.max(0,Math.min(1,((px-x)*dx+(py-y)*dy)/(dx*dx+dy*dy)));
    best=Math.min(best,Math.hypot(px-x-t*dx,py-y-t*dy));
  }
  return best;
}
const romaniaGardenWalks=[
  [[22,73],[22,65],[18,59],[18,51],[17,43],[16,37],[17,31],[20,25],[21,19],[23,14]],
  [[23,14],[30,16],[35,17],[41,19],[47,21],[51,24],[54,28],[59,33],[64,37],[70,43],[73,47],[79,47]],
  [[20,25],[25,23],[31,23],[35,26],[35,30],[31,34],[29,39],[27,44],[26,49]],
  [[16,37],[20,37],[24,39],[27,44]],
  [[44,35],[47,36],[49,39],[49,46],[49,52],[55,55],[62,55],[66,52],[69,49],[73,47]],
  [[66,52],[70,55],[73,59],[75,64],[72,70],[68,75],[62,79],[54,80],[48,80]]
];
function traceMapTiles(points){
  const cells=new Map();
  for(let i=1;i<points.length;i++){
    const [ax,ay]=points[i-1], [bx,by]=points[i];
    const steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay));
    let x=ax,y=ay;
    cells.set(x+":"+y,[x,y]);
    for(let n=1;n<=steps;n++){
      const nx=Math.round(ax+(bx-ax)*n/steps), ny=Math.round(ay+(by-ay)*n/steps);
      // When rounding changes both axes, keep the corner closed to cardinal movement.
      if(nx!==x&&ny!==y)cells.set(x+":"+ny,[x,ny]);
      cells.set(nx+":"+ny,[nx,ny]);
      x=nx;y=ny;
    }
  }
  return cells;
}
function traceRomaniaCampus(garden){
  const width=garden.width;
  const rectContains=(o,x,y)=>x+.5>=o.x&&x+.5<o.x+o.w&&y+.5>=o.y&&y+.5<o.y+o.h;
  garden.objects=garden.objects.filter(o=>!o.uid.startsWith("cinta-")&&!o.uid.startsWith("viale-inferriata-"));
  const add=(uid,kind,name,x,y,color,solid=false,w=1)=>garden.objects.push({uid,kind,name,x,y,w,h:1,color,solid});
  const walls=traceMapTiles([...romaniaBoundary,romaniaBoundary[0]]);
  const move=(uid,x,y)=>Object.assign(garden.objects.find(o=>o.uid===uid),{x,y});
  move("viale-romania-256",28,72);
  move("viale-romania-267",29,70);
  move("viale-romania-268",32,70);
  move("viale-romania-269",35,70);
  move("viale-romania-270",37,73);
  move("viale-romania-257",10,69);
  move("viale-romania-258",13,68);
  move("campus-tree-0",15,31);
  move("campus-tree-1",17,24);
  move("campus-tree-2",19,20);
  move("campus-tree-43",80,55);
  move("campus-pillar-2",73,44);
  move("campus-tree-34",36,75);
  move("romania-seduta-atrio",46,79);
  for(const [key,[x,y]] of walls){
    if(y===75&&x>=21&&x<=25)continue; // The two pillars and the turnstile close this section.
    if(x>=78&&x<=80&&y>=46&&y<=48)continue; // Pedestrian access from Via Panama.
    add("cinta-plan-"+key,"wall","Cinta del campus",x,y,"#bda68b",true);
  }
  add("viale-inferriata-22","rope","Fianco del tornello",22,75,"#65736a",true);
  add("viale-inferriata-24","rope","Fianco del tornello",24,75,"#65736a",true);

  for(const o of garden.objects){
    if(o.kind==="road"&&o.uid.startsWith("romania-terreno-")&&o.y<80){
      Object.assign(o,{kind:"paving",name:"Pavimentazione",color:"#a49a87"});
    }
  }
  const tiles=terrainMap(garden);
  const buildings=garden.objects.filter(o=>["roof","domeHall","faculty","chapel","booth","wall"].includes(o.kind));
  for(let y=0;y<80;y++){
    for(let x=15;x<width;x++){
      const distance=distanceFromRoute(x+.5,y+.5,panamaStreet);
      if(distance>=2.25||insideCampusOutline(x+.5,y+.5)||buildings.some(o=>rectContains(o,x,y)))continue;
      if(distance<1.45)add("panama-asfalto-"+x+"-"+y,"road","Via Panama",x,y,"#535d66");
      else add("panama-marciapiede-"+x+"-"+y,"paving","Marciapiede di Via Panama",x,y,"#b3a896");
    }
  }
  const paths=new Map();
  for(const walk of romaniaGardenWalks){
    for(const [x,y] of traceMapTiles(walk).values()){
      for(const [dx,dy] of [[0,0],[1,0],[0,1]]){
        const xx=x+dx,yy=y+dy,key=xx+yy*width;
        const kind=tiles.get(key)?.kind??garden.ground;
        if((kind==="grass"||kind==="path")&&insideCampusOutline(xx+.5,yy+.5)&&
          !buildings.some(o=>rectContains(o,xx,yy)))paths.set(key,[xx,yy]);
      }
    }
  }
  for(const [key,[x,y]] of paths)add("romania-vialetto-"+key,"path","Vialetto del giardino",x,y,"#bba687");

  // A continuous paved route connects Via Panama to the Dome forecourt.
  const panamaTiles=terrainMap(garden);
  for(let y=46;y<=48;y++){
    for(let x=70;x<=85;x++){
      if(panamaTiles.get(x+y*width)?.kind==="road")break;
      add("romania-panama-soglia-"+x+"-"+y,"paving","Passaggio di Via Panama",x,y,"#b5aa97");
    }
  }
  add("romania-panama-stipite-n","pillar","Pilastro di Via Panama",78,45,"#dec9a9",true);
  add("romania-panama-stipite-s","pillar","Pilastro di Via Panama",81,49,"#dec9a9",true);
}
function arrangeRomaniaSurfaces(garden){
  const paving="#a49a87";
  const objects=new Map(garden.objects.map(o=>[o.uid,o]));
  const move=(uid,x,y)=>Object.assign(objects.get(uid)??{},{x,y});
  move("quartiere-14",3,85);
  move("viale-romania-262",12,87);
  move("viale-romania-272",12,78);
  move("giardino-rosticceria",65,98);
  move("giardino-sala-giochi",62,101);
  move("campus-lamp-6",76,43);
  move("acqua-romania-vialetto",23,45);
  move("acqua-romania-piazzale",63,51);
  move("acqua-romania-nasone-43",43,89);
  move("acqua-romania-nasone-85",85,97);

  const northPath=objects.get("campus-garden-path");
  if(northPath)northPath.w=7;
  garden.objects=garden.objects.filter(o=>!o.uid.startsWith("campus-pine-")&&!o.uid.startsWith(vialeSurfacePrefix));
  for(const o of garden.objects){
    // The old diagonal road and its two spurs predate the traffic centerline.
    if(o.kind==="road"&&o.uid.startsWith("romania-terreno-")&&o.y>=80){
      Object.assign(o,{kind:"paving",name:"Pavimentazione",color:paving});
    }
  }
  const patch=(uid,kind,x,y,w,h,color=paving)=>garden.objects.push({
    uid:"romania-surface-"+uid,kind,x,y,w,h,color
  });

  patch("slargo-accesso","paving",48,90,10,9);
  patch("negozi","paving",60,97,13,6);
  patch("fontana-giardino","paving",12,33,4,4);
  patch("fontana-piazzale","paving",61,49,6,5);
  for(const [side,x] of [["ovest",49],["est",55]]){
    patch("aiuola-"+side,"grass",x,93,2,1,"#606647");
  }

  // Give the curved road a continuous substrate and sidewalks on the tile map.
  for(let x=0;x<garden.width;x++){
    const row=Math.round(vialeRoadY(x+.5));
    patch("marciapiede-n-"+x,"paving",x,row-2,1,1);
    patch("marciapiede-s-"+x,"paving",x,row+2,1,1);
    patch("carreggiata-"+x,"road",x,row-1,1,3,"#4a5562");
  }
}
function addRadioVan(map){
  const garden=map.zones.giardino;
  if(!garden)return map;
  const van=garden.objects.find(o=>o.uid==="radio-luiss-van");
  if(van&&(van.x!==30||van.y!==55||van.w!==3||van.h!==2||van.rotation!==0))return map;
  if(!garden.objects.some(o=>o.uid==="giardino-caffe"&&o.x===42&&o.y===35))return map;
  const {width,height}=garden;
  const x=45,y=33,w=3,h=2;
  if(x+w>width||y+h>height||garden.objects.some(o=>(o.solid||o.action)&&
      o.x<x+w&&o.x+(o.w??1)>x&&o.y<y+h&&o.y+(o.h??1)>y))return map;
  const text="Il furgone rosso di Radio Luiss è parcheggiato di fianco al bar. Sul sedile c’è una lista di ospiti. In cima qualcuno ha scritto: «Quello che arriva prima paga il caffè».";
  if(van){
    Object.assign(van,{x,y,text});
    return map;
  }
  garden.objects.push({
    uid:"radio-luiss-van",kind:"radioVan",name:"Furgone di Radio Luiss",x,y,w,h,color:"#ad3039",
    rotation:0,variant:0,solid:true,action:"dialog",native:"",target:"",gate:"",missionTarget:"",
    text,
    behavior:"idle",speed:1.7,auto:false,route:[]
  });
  return map;
}

function updateCampusPlaces(map){
  const garden=map.zones.giardino;
  const objects=new Map(garden.objects.map(o=>[o.uid,o]));
  const update=(uid,changes)=>{
    const object=objects.get(uid);
    if(object)Object.assign(object,changes);
  };
  const add=(uid,kind,name,x,y,extra={})=>garden.objects.push({uid,kind,name,x,y,...extra});

  // Reuse the building just inside the turnstile, on the player's left.
  update("main-gatehouse",{kind:"faculty",name:"LUISS Shop",x:15,y:68,w:6,h:5,color:"#967292"});
  update("viale-luiss-shop",{kind:"door",name:"LUISS Shop · Ingresso",x:21,y:71,w:1,h:1,solid:false});
  update("wayfinding-west",{name:"LUISS Shop · A sinistra",text:"Il LUISS Shop è nell’edificio subito a sinistra. Per il campus, dopo il tornello tieni la destra e prosegui sul vialetto."});
  add("romania-shop-approach","paving","Passaggio del LUISS Shop",21,70,{w:5,h:4,color:"#b4a894"});

  update("dome-building",{name:"The Dome 2"});
  update("giardino-dome",{name:"The Dome 2 · Sala studio"});
  update("dome-route",{name:"Indicazioni per The Dome 2",text:"The Dome 2 è il padiglione grande davanti a te. L’ingresso è sul lato del piazzale."});
  map.zones.dome.name="The Dome 2 · Sala studio";
  map.zones.dome2.name="Serra · Spazio polifunzionale";
  update("dome2-door",{name:"Entra nella Serra"});
  update("polivalente",{name:"Serra · Padiglione ovest"});
  update("dome2-arrival",{name:"Accesso alla Serra"});
  update("dome2-forecourt",{name:"Piazzetta della Serra"});
  update("dome2-walk-center",{name:"Vialetto della Serra"});
  update("dome2-vent-sign",{name:"Prese d’aria della Serra",text:"Griglie di aerazione. L’ingresso della Serra si trova sul piazzale più a sud."});
  update("sport-court",{name:"Copertura delle prese d’aria"});
  update("dome2-calcetto",{x:61,y:56});

  update("giardino-mensa",{name:"Atrio centrale · Ingresso",x:48,y:68});
  update("giardino-from-mensa",{name:"Uscita dell’atrio",x:48,y:69});
  update("mensa-direction",{name:"Atrio centrale ↑",text:"L’atrio centrale è tra le ali dell’edificio principale."});
  add("romania-atrio-floor","paving","Pavimentazione dell’atrio",41,64,{w:10,h:7,color:"#b3a999"});
  const atrium=map.zones.mensa;
  atrium.name="Atrio centrale";
  Object.assign(atrium,{width:18,height:12,ground:"floor"});
  const portals={
    "mensa-to-garden":[8,11,"Esci verso il campus"],"mensa-from-garden":[8,10,"Accesso dal campus"],
    "mensa-to-first":[9,0,"Sali al primo piano"],"mensa-from-first":[9,1,"Accesso dal primo piano"]
  };
  atrium.objects=atrium.objects.filter(o=>Object.hasOwn(portals,o.uid));
  for(const object of atrium.objects){
    const [x,y,name]=portals[object.uid];
    Object.assign(object,{x,y,name});
  }
  for(const [i,[x,y,w,h]] of [[0,0,9,1],[10,0,8,1],[0,11,8,1],[9,11,9,1],[0,1,1,10],[17,1,1,10]].entries()){
    atrium.objects.push({uid:"atrio-wall-"+i,kind:"wall",name:"Parete dell’atrio",x,y,w,h,solid:true,color:"#9d8a7b"});
  }
  const upstairs=map.zones.primo.objects.find(o=>o.uid==="primo-mensa");
  if(upstairs)upstairs.name="Scendi nell’atrio centrale";

  // Carve out a planted patch inside the west garden, with a single path at the south end.
  add("orto-terreno","grass","Terreno dell’orto",19,27,{w:7,h:7,color:"#6f7652"});
  const beds=garden.objects.filter(o=>/^orto-(bed|seed)-/.test(o.uid));
  beds.forEach((o,i)=>Object.assign(o,{x:20+(i%2)*3,y:28+Math.floor(i/2)}));
  for(const [i,[x,y,w,h]] of [[19,27,7,1],[19,28,1,5],[25,28,1,5],[19,33,2,1],[24,33,2,1]].entries()){
    add("orto-bordo-"+i,"hedge","Bordo dell’orto",x,y,{w,h,color:"#586848",solid:true});
  }
  add("orto-accesso","path","Accesso all’orto",21,33,{w:3,h:3,color:"#ad9774"});
  update("orto-luiss",{x:21,y:34});
  update("orto-pollinatori",{x:24,y:32});
  update("giardiniera-nora",{x:22,y:33});
  update("ada-gate",{name:"Villa Ada · Entra nel parco"});
  update("ca-verso-ada",{name:"Villa Ada ←"});
  add("romania-ada-direzione","sign","Villa Ada ↑",16,59,{action:"dialog",text:"Per Villa Ada segui il vialetto lungo il muro ovest. Il cancello è oltre la piazzetta della Serra."});
}
const campusPlanting={
  giardino:{
    landmark:"entry-from-panama",
    plants:[
      ["orangeTree",24,42,2,2],["orangeTree",36,37,2,2],["orangeTree",61,48,2,2],
      ["orangeTree",48,12,2,2],["orangeTree",15,42,2,2],["orangeTree",28,43,2,2],
      ["roseBed",36,39,2,1],["roseBed",26,46,3,1],["roseBed",48,35,2,1],
      ["roseBed",15,35,2,1],["roseBed",62,53,2,1],["roseBed",34,42,2,1],
      ["flowerMeadow",21,44,1,1],["flowerMeadow",30,44,2,1],["flowerMeadow",47,15,2,1],
      ["flowerMeadow",49,34,2,1],["flowerMeadow",64,52,2,1],["flowerMeadow",17,42,2,1],
      ["flowerMeadow",29,40,2,1],["flowerMeadow",36,40,2,1]
    ],
    people:[
      ["marta", "cleaner", "Marta · Cura del giardino",21,43,[[23,43]],"#587d6a"],
      ["bar", "student", "Lea · Pausa al bar",50,35,[],"#af7175"],
      ["orto", "student", "Karim · Orto Luiss",24,35,[],"#5a7b94"],
      ["dome", "student", "Eva · Gruppo studio",65,50,[],"#a67c54"],
      ["radio", "student", "Dario · Radio Luiss",45,35,[],"#9f5655"]
    ]
  },
  pola:{
    landmark:"pola-villa",
    plants:[
      ["orangeTree",11,22,2,2],["orangeTree",27,20,2,2],["orangeTree",26,15,2,2],
      ["roseBed",16,22,2,1],["roseBed",9,21,2,1],["flowerMeadow",32,18,2,1]
    ],
    people:[["pola", "student", "Noemi · Giardino di Villa Alberoni",28,18,[[31,18]],"#a2865c"]]
  },
  "pola-cortile":{
    landmark:"pola-cortile-buffet",
    plants:[["roseBed",9,9,2,1],["roseBed",26,16,2,1],["flowerMeadow",18,11,2,1]],
    people:[["festa", "student", "Irene · Amica del laureando",6,9,[],"#9c6386"]]
  }
};
function furnishCampusGardens(map){
  for(const [id,{landmark,plants,people}] of Object.entries(campusPlanting)){
    const area=map.zones[id];
    if(!area||!area.objects.some(o=>o.uid===landmark)||area.objects.some(o=>o.uid.startsWith("giardini-vivi-")))continue;
    const occupied=(x,y,w,h)=>area.objects.some(o=>
      (o.kind==="entrance"||assets[o.kind]?.[2]!=="terreno")&&
      o.x<x+w&&o.x+(o.w??1)>x&&o.y<y+h&&o.y+(o.h??1)>y);
    const add=(key,kind,name,x,y,w,h,color,route=[],action="")=>{
      if(x+w>area.width||y+h>area.height||occupied(x,y,w,h))return;
      if(id==="giardino"&&!insideCampusOutline(x+w/2,y+h/2,area.objects.some(o=>o.uid==="cinta-plan-22:8")?romaniaBoundary:legacyCampusOutline))return;
      area.objects.push({uid:"giardini-vivi-"+key,kind,name,x,y,w,h,color,solid:kind==="orangeTree",
        rotation:0,variant:0,action,native:"",text:"",target:"",gate:"",missionTarget:"",
        auto:false,behavior:route.length?"patrol":"idle",speed:1.05,route});
    };
    for(const [i,[kind,x,y,w,h]] of plants.entries()){
      const spec=assets[kind];
      add(id+"-"+i,kind,spec[1],x,y,w,h,spec[3]);
    }
    for(const [key,kind,name,x,y,route,color] of people){
      const safeRoute=route.filter(([endX,endY])=>{
        const left=Math.min(x,endX),top=Math.min(y,endY);
        return !occupied(left,top,Math.abs(endX-x)+1,Math.abs(endY-y)+1);
      });
      add(key,kind,name,x,y,1,1,color,safeRoute,"dialog");
    }
  }
  return map;
}

function hasIntegratedEntrance(){
  const garden=campus.zones.giardino;
  return Boolean(garden&&zoneObjects(garden).byId.has("viale-ingresso-start"));
}
function inVialeDistrict(x,y){
  if(x>=vialeEntrance.x&&x<vialeEntrance.x+vialeEntrance.width)return y>vialeEntrance.gateY;
  return x>=0&&x<vialeRoad.at(-1)[0]&&y>=Math.round(vialeRoadY(x+.5))-1&&y<=105;
}
function atViale(s){
  return Boolean(s&&(s.zone==="ingresso"||
    s.zone==="giardino"&&hasIntegratedEntrance()&&inVialeDistrict(s.x,s.y)));
}
function blockedBeforeCampus(x,y){
  return state.zone==="giardino"&&hasIntegratedEntrance()&&!state.campusGateOpen&&!isFree()&&!inVialeDistrict(x,y);
}
function wallet(){
  return (state.wallet??={coins:0,picked:[],owned:[]});
}
function refreshWallet(){
  $("walletCoins").textContent=wallet().coins+" "+local("monete","coins");
}
function awardCoins(amount){
  if(testMode)return;
  wallet().coins+=amount;
  refreshWallet();
}
function collectCampusCoin(){
  if(testMode)return;
  const coin=vialeCoins.find(([,zone,x,y])=>state.zone===zone&&state.x===x&&state.y===y);
  if(!coin||wallet().picked.includes(coin[0]))return;
  wallet().picked.push(coin[0]);awardCoins(1);record("Hai raccolto una moneta del campus.");
  sound("coin","map");save();
}
function paintCampusCoins(context,zone,view,now){
  if(!state||testMode)return;
  const collected=wallet().picked;
  for(const [id,area,x,y] of vialeCoins){
    if(area!==zone||collected.includes(id))continue;
    const px=x*16+8,py=y*16+8,hop=reducedMotion?0:Math.sin(now/150)*1.5;
    if(px<view.x-6||px>view.x+view.w+6||py<view.y-6||py>view.y+view.h+6)continue;
    context.fillStyle="#c38b45";context.beginPath();context.ellipse(px,py+hop,4,5,0,0,Math.PI*2);context.fill();
    context.fillStyle="#f8d782";context.beginPath();context.ellipse(px-.6,py-1+hop,3.4,4.4,0,0,Math.PI*2);context.fill();
    rect(context,"#fff0b3",px-2,py-3+hop,1,3);
  }
}
function shopScene(){
  const purse=wallet();
  const description="Hai "+purse.coins+" monete. Ne trovi nel campus e ai minigiochi.";
  const options=campusMerch.flatMap(item=>{
    const owned=purse.owned.includes(item.id);
    if(!owned&&purse.coins<item.cost)return [];
    return [[(owned?"Indossa ":"Compra · "+item.cost+" monete · ")+item.name,()=>{
      if(!purse.owned.includes(item.id)){
        if(purse.coins<item.cost)return;
        purse.coins-=item.cost;purse.owned.push(item.id);sound("buy","map");
      }
      Object.assign(state.avatar,item.outfit);
      record("Luiss Shop · "+item.name);refreshWallet();
    }]];
  });
  const prices=campusMerch.map(item=>item.name+" "+(purse.owned.includes(item.id)?"(già tuo)":item.cost+" monete")).join(" · ");
  return scene("Luiss Shop",description+" "+prices,...options);
}

const unarmedGuard=$("unarmedGuard");
try{unarmedGuard.checked=localStorage.getItem("ultimo-posto-guardia") === "disarmata";}catch{}
unarmedGuard.onchange=()=>{
  try{localStorage.setItem("ultimo-posto-guardia",unarmedGuard.checked?"disarmata":"armata");}catch{}
};
let guardOutcomeStart=0;
function refreshGateWarning(){
  $("gateWarning").hidden=!atViale(state)||!state.guardWarned||has("Via libera")||Boolean(state.ending);
}
function warnAtGate(){
  if(isFree()||state.campusGateOpen||has("Via libera"))return;
  state.guardWarned=true;
  refreshGateWarning();
  save();
}
function crossRestrictedLine(x,y){
  if(testMode||isFree()||state.ending||state.campusGateOpen||has("Via libera")||
     !atViale(state)||!hasIntegratedEntrance())return false;
  const gateX=vialeEntrance.x+15;
  if(x!==gateX||y!==vialeEntrance.gateY||state.y!==y+1)return false;
  if(!state.guardWarned){
    warnAtGate();
    chime([52,47],.14);
    return true;
  }
  const armed=!unarmedGuard.checked;
  state.ending={guard:true,armed,title:"Game Over · Tornello",text:
    (armed?"Dopo l’avvertimento, la guardia ha sparato.":"Dopo l’avvertimento, la guardia ti ha bloccato a terra.")+
    " Per passare, dovevi fermarti sulla linea, mostrare il badge alla guardia e aprire il tornello."};
  activeScene=null;keys.clear();controls.clear();
  guardOutcomeStart=performance.now();
  record("Game Over · Hai forzato il tornello dopo l’avvertimento.");
  chime(armed?[35,29]:[42,34],.09,.09);
  save();renderScene();$("sceneTitle").focus();
  return true;
}
function paintRestrictedLine(c,zone){
  if(zone!=="giardino"||!hasIntegratedEntrance()||state.campusGateOpen||isFree())return;
  const x=(vialeEntrance.x+15)*16,y=(vialeEntrance.gateY+1)*16+1;
  for(let i=0;i<5;i++)rect(c,i%2?"#211e26":"#e9b76a",x+i*3,y,3,2);
}
function paintGuardOutcome(now){
  const canvas=$("guardOutcome");
  if(canvas.hidden||!state.ending?.guard)return;
  const c=canvas.getContext("2d"), t=reducedMotion||!guardOutcomeStart?1:Math.min(1,Math.max(0,(now-guardOutcomeStart)/360));
  const armed=state.ending.armed;
  rect(c,"#1e1c2b",0,0,320,128);
  rect(c,"#373141",0,84,320,44);
  for(let x=0;x<320;x+=27)rect(c,"#493d4b",x,105,22,1);
  rect(c,"#d2a565",24,87,101,3);
  sprite(c,guard,armed?78:152,94,0,"right",2.55);
  if(armed){
    rect(c,"#30343e",91,68,16,4);
    rect(c,"#424452",102,68,5,3);
  }
  c.save();c.translate(175,100);c.rotate(-Math.PI/2);
  sprite(c,state.avatar,0,0,0,"down",2.15);
  c.restore();
  for(let i=0;i<34;i++){
    const angle=i*2.39996,radius=(armed?64:31)*(i%8+2)/10;
    const x=168+Math.cos(angle)*radius*t,y=101+Math.sin(angle)*radius*t*.43;
    rect(c,["#9d233d","#df4650","#701831"][i%3],x,y,i%4+2,i%3+2);
  }
  rect(c,"#a2203b",158,105,16+31*t,5);
  rect(c,"#711831",154,110,20+22*t,3);
}

function tobaccoShopScene(){
  const purse=wallet();
  const hasProduct=item=>item==="Sigarette"?cigarettesLeft()>0:has(item);
  const products=[["Sigarette",local("Sigarette","Cigarettes"),2],["IQOS","IQOS",5]];
  return scene(local("Tabaccheria · Viale Romania","Tobacconist · Viale Romania"),
    local("Al bancone · Sigarette 2 monete · IQOS 5 monete. Saldo: ","At the counter · Cigarettes 2 coins · IQOS 5 coins. Balance: ")+purse.coins,
    ...products.filter(([item,,cost])=>!testMode&&!hasProduct(item)&&purse.coins>=cost).map(([item,label,cost])=>[
      local("Compra ","Buy ")+label+" · "+cost,()=>{
        if(hasProduct(item)||purse.coins<cost)return;
        const previousCount=state.cigarettes,hadItem=has(item);
        purse.coins-=cost;carry(item);
        if(item==="Sigarette")state.cigarettes=10;
        if(!save()){
          purse.coins+=cost;state.cigarettes=previousCount;
          if(!hadItem)state.pockets.splice(state.pockets.indexOf(item),1);
          return;
        }
        record("Tabaccheria · "+item);refreshWallet();sound("buy","map");
        const animation=$("tobaccoHandoff");
        animation.classList.remove("tobacco-handoff");
        void animation.offsetWidth;
        animation.classList.add("tobacco-handoff");
      }
    ]));
}
