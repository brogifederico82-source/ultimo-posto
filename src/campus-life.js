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
    const clone={...obj,uid:"viale-"+obj.uid,x:obj.x+x,y:obj.y+y,route:obj.route?.map(([px,py])=>[px+x,py+y])};
    if(obj.uid==="ingresso-start")clone.target="viale";
    if(obj.uid==="ingresso-varco")clone.solid=true;
    if(obj.uid==="luiss-shop"){
      Object.assign(clone,{kind:"booth",x:x+10,y:y+8,w:2,h:1,solid:true,color:"#8e6f9b"});
    }
    garden.objects.push(clone);
  }
  garden.objects.push(
    {uid:"viale-tornello-sinistra",kind:"wall",name:"Recinzione dell’ingresso",x,y:y+6,w:15,h:1,solid:true},
    {uid:"viale-tornello-destra",kind:"wall",name:"Recinzione dell’ingresso",x:x+16,y:y+6,w:14,h:1,solid:true}
  );
  return map;
}
function hasIntegratedEntrance(){
  return Boolean(campus.zones.giardino?.objects.some(o=>o.uid==="viale-ingresso-start"));
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
