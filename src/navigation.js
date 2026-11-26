// Story waypoints point to the next interaction in the current area.
const campusWaypoints={
  ingresso:()=>has("Via libera")?"ingresso-varco":"ingresso-guardia",
  giardino:()=>{
    if(atViale(state))return has("Via libera")?"viale-ingresso-varco":"viale-ingresso-guardia";
    if(!has("Colloquio tutor"))return "tutor-entry";
    if(!has("Lezione A200"))return "romania-a200-porta";
    if(!has("Progetto LOFT"))return "giardino-terra";
    return has("Seminario Parenzo")?"carsharing-romania":"navetta-sign";
  },
  tutorato:()=>has("Colloquio tutor")?"tutor-out":"tutor-viola",
  "aula-chiesa":()=>!has("Lezione A200")?"prof-storia":
    has("Colloquio tutor")&&!has("Progetto LOFT")?"a200-stair-exit":"a200-out",
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
function localStoryWaypoint(zone){
  const downstairs={terra:"terra-giardino",primo:"primo-terra",secondo:"secondo-down",terzo:"terzo-down",
    quarto:"quarto-down",quinto:"quinto-down",loft:"loft-down"};
  let uid=Object.hasOwn(campusWaypoints,zone)?campusWaypoints[zone]():null;
  if(floorOrder.includes(zone)&&(has("Progetto LOFT")||!has("Colloquio tutor")))uid=downstairs[zone];
  if(floorOrder.indexOf(zone)>floorOrder.indexOf("secondo")&&!has("Lezione A200"))uid=downstairs[zone];
  const waypoint=zoneObjects(room(zone)).byId.get(uid);
  return waypoint&&!gateLocked(waypoint.gate)?waypoint:null;
}
function nextCampusWaypoint(){
  if(!state||state.prologue||state.ending||isFree()||has("Festa a Pola"))return null;
  const localWaypoint=localStoryWaypoint(state.zone);
  if(localWaypoint)return localWaypoint;
  // A detour can span multiple rooms. Keep the first usable door on the shortest route back.
  const visited=new Set([state.zone]);
  const roomsToVisit=[{zone:state.zone,firstDoor:null}];
  for(const {zone,firstDoor} of roomsToVisit){
    for(const door of zoneObjects(room(zone)).actions){
      const destination=doorDestination(door)?.[0];
      if(!destination||visited.has(destination))continue;
      visited.add(destination);
      const wayBack=firstDoor??door;
      if(localStoryWaypoint(destination))return wayBack;
      roomsToVisit.push({zone:destination,firstDoor:wayBack});
    }
  }
  return null;
}
function updateStoryWaypointHint(){
  const hint=$("storyWaypointHint"),waypoint=nextCampusWaypoint();
  const label=waypoint?local("Qui cerca ","Look for ")+tr(waypoint.name):"";
  if(hint.textContent!==label)hint.textContent=label;
  hint.hidden=!label;
}
function paintWaypointOnStage(context,px,py,minimap){
  const x=clamp(px,10,310);
  const y=clamp(py,10,182);
  const underneath=minimap&&x>=minimap.x-6&&y<=minimap.y+minimap.height+6;
  if(x===px&&y===py&&!underneath){paintCampusWaypoint(context,x,y);return;}
  context.save();
  context.translate(x,underneath?minimap.y+minimap.height+7:y);
  context.rotate(Math.atan2(py-96,px-160));
  context.beginPath();
  context.moveTo(6,0);context.lineTo(-4,-4);context.lineTo(-2,0);context.lineTo(-4,4);context.closePath();
  context.fillStyle="#f0be75";
  context.strokeStyle="#172331";
  context.lineWidth=1.5;
  context.fill();context.stroke();
  context.restore();
}
function paintCampusWaypoint(context,x,y,size=1){
  context.save();
  context.translate(x,y);
  if(size!==1)context.scale(size,size);
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
