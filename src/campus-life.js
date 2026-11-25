const vialeEntrance={x:8,y:69,gateY:75,width:30};
const vialeCoins=[
  ["fermata","giardino",24,86],["shop","giardino",22,77],["panchine","giardino",18,40],
  ["orto","giardino",46,13],["dome","giardino",60,56],["radio","giardino",35,57],
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
function addVialeArcade(map){
  for(const [zone,x,y] of [["ingresso",24,17],["giardino",32,86]]){
    const area=map.zones[zone];
    if(!area||x+2>area.width||y>=area.height||(zone==="giardino"&&!area.objects.some(o=>o.uid==="viale-ingresso-start")))continue;
    const uid=zone+"-sala-giochi";
    if(area.objects.some(o=>o.uid===uid||o.solid&&o.x<x+2&&o.x+(o.w??1)>x&&o.y<y+1&&o.y+(o.h??1)>y))continue;
    area.objects.push({uid,kind:"booth",name:"Sala giochi · Viale Romania",x,y,w:2,h:1,
      color:"#8b527e",solid:true,action:"native",native:"cavalli",gate:"",target:"",route:[],rotation:0,variant:0});
  }
  return map;
}
function hasIntegratedEntrance(){
  const garden=campus.zones.giardino;
  return Boolean(garden&&zoneObjects(garden).byId.has("viale-ingresso-start"));
}
function atViale(s){
  if(!s)return false;
  if(s.zone==="ingresso")return true;
  return s.zone==="giardino"&&hasIntegratedEntrance()&&s.y>vialeEntrance.gateY&&
    s.x>=vialeEntrance.x&&s.x<vialeEntrance.x+vialeEntrance.width;
}
function blockedBeforeCampus(x,y){
  return state.zone==="giardino"&&hasIntegratedEntrance()&&!state.campusGateOpen&&!isFree()&&
    (y<=vialeEntrance.gateY||x<vialeEntrance.x||x>=vialeEntrance.x+vialeEntrance.width);
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
  chime([74,81],.07);save();
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
        purse.coins-=item.cost;purse.owned.push(item.id);chime([67,76],.09);
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
