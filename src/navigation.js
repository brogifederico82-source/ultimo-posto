// Story waypoints point to the next interaction in the current area.
const campusWaypoints={
  ingresso:()=>has("Via libera")?"ingresso-varco":"ingresso-guardia",
  giardino:()=>{
    if(!has("Colloquio tutor"))return "tutor-entry";
    if(!has("Lezione A200"))return "giardino-evento";
    if(!has("Progetto LOFT"))return "giardino-terra";
    return has("Seminario Parenzo")?"carsharing-romania":"navetta-sign";
  },
  tutorato:()=>has("Colloquio tutor")?"tutor-out":"tutor-viola",
  "aula-chiesa":()=>has("Lezione A200")?"a200-stair-exit":"prof-storia",
  "aula-toti":()=>"a203-exit",
  dome:()=>"dome-out",
  terra:()=>"terra-primo",
  primo:()=>"primo-up",
  secondo:()=>has("Lezione A200")?"secondo-up":"secondo-a200",
  terzo:()=>"terzo-up",
  quarto:()=>"quarto-up",
  quinto:()=>"quinto-up",
  loft:()=>has("Progetto LOFT")?"loft-down":"loft-placard",
  parenzo:()=>has("Seminario Parenzo")?"parenzo-back":"parenzo-inside",
  "parenzo-corridoio":()=>has("Seminario Parenzo")?"parenzo-corridoio-uscita":"parenzo-porta-seminario",
  "parenzo-interno":()=>has("Seminario Parenzo")?"parenzo-interno-exit":"parenzo-interno-npc",
  pola:()=>"pola-inside",
  "pola-cortile":()=>"pola-cortile-npc"
};
const floorOrder=["terra","primo","secondo","terzo","quarto","quinto","loft"];
function nextCampusWaypoint(){
  if(!state||state.prologue||state.ending||isFree()||has("Festa a Pola"))return null;
  const zone=state.zone;
  const downstairs={terra:"terra-giardino",primo:"primo-terra",secondo:"secondo-down",terzo:"terzo-down",
    quarto:"quarto-down",quinto:"quinto-down",loft:"loft-down"};
  let uid=campusWaypoints[zone]?.();
  if(floorOrder.includes(zone)&&(has("Progetto LOFT")||!has("Colloquio tutor")))uid=downstairs[zone];
  if(floorOrder.indexOf(zone)>floorOrder.indexOf("secondo")&&!has("Lezione A200"))uid=downstairs[zone];
  return uid?room(zone).objects.find(o=>o.uid===uid)??null:null;
}
function paintCampusWaypoint(context,x,y){
  context.save();
  context.translate(x,y);
  context.beginPath();
  context.moveTo(0,-5);
  context.lineTo(4,0);
  context.lineTo(0,5);
  context.lineTo(-4,0);
  context.closePath();
  context.fillStyle="#f0be75";
  context.strokeStyle="#172331";
  context.lineWidth=1.5;
  context.fill();
  context.stroke();
  context.restore();
}
