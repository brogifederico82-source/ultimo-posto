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
      garden.objects.some(o=>o.uid.startsWith(vialeSurfacePrefix)))return;
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
