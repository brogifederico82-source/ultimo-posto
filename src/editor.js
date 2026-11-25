// Editor controls share the same map model used by Play.
const ed=$("edCanvas"), edInk=ed.getContext("2d");
const planImage=$("edPlanImage");
const toolsInfo={
  select:["Seleziona","Trascina gli oggetti. Maiusc aggiunge alla selezione."],
  area:["Seleziona area","Trascina un rettangolo, poi usa Copia area o Elimina."],
  place:["Posiziona","Clicca una casella per inserire l’elemento del catalogo."],
  paint:["Pennello","Trascina per disegnare pavimenti, muri o siepi."],
  fill:["Riempimento","Seleziona un terreno, poi clicca la superficie contigua da riempire."],
  erase:["Gomma","Trascina per cancellare gli elementi sul livello selezionato nel catalogo."],
  pan:["Sposta visuale","Trascina la mappa. Puoi usare anche il tasto centrale."],
  path:["Percorso NPC","Clicca per aggiungere tappe al personaggio selezionato."],
  overlay:["Sposta planimetria","Trascina il disegno di riferimento sulla mappa."]
};
editorState={zone:"giardino",tool:"select",asset:"grass",variant:0,selection:new Set(),area:null,clip:null,
  shown:{...layers},x:0,y:0,scale:1,undo:[],redo:[],pointer:null,cursor:null,fit:true};
const es=editorState;
const editRoom=()=>room(es.zone);
function updateEditorStatus(message){
  $("edStatus").textContent=message;
}
function persistEditor(message="Modifiche salvate"){
  updateEditorStatus(saveCampus()?message:"Salvataggio del browser non disponibile. Usa Esporta JSON.");
}
function storeChange(before, message, refresh=true){
  const after=JSON.stringify(campus);
  if(before===after)return false;
  es.undo.push(before);
  if(es.undo.length>32)es.undo.shift();
  es.redo.length=0;
  persistEditor(message);
  if(refresh)refreshEditor();
  return true;
}
function edit(fn,message){
  const before=JSON.stringify(campus);
  fn();
  storeChange(before,message);
}
function historyStep(from,to){
  if(!from.length)return;
  to.push(JSON.stringify(campus));
  campus=JSON.parse(from.pop());
  if(!Object.hasOwn(campus.zones,es.zone))es.zone=Object.keys(campus.zones)[0];
  es.selection.clear();es.area=null;es.pointer=null;
  persistEditor();refreshEditor();
}
function fillSelect(select,list,selected){
  select.replaceChildren();
  for(const [value,label] of list){
    const option=document.createElement("option");
    option.value=value;option.textContent=label;
    select.append(option);
  }
  select.value=selected;
}
function editTool(tool){
  es.tool=tool;
  for(const button of $("edTools").children)button.setAttribute("aria-pressed",String(button.dataset.tool===tool));
  $("edMovePlan").setAttribute("aria-pressed",String(tool==="overlay"));
  $("edToolHint").textContent=toolsInfo[tool][1]+(tool==="erase"?" Livello: "+layers[assets[es.asset][2]]+".":"");
  ed.style.cursor=tool==="pan"||tool==="overlay"?"grab":"crosshair";
}
for(const [id,[name]] of Object.entries(toolsInfo).filter(([id])=>id!=="overlay")){
  const button=document.createElement("button");
  button.dataset.tool=id;button.textContent=name;button.onclick=()=>editTool(id);
  $("edTools").append(button);
}
for(const [layer,label] of Object.entries(layers)){
  const row=document.createElement("label"),check=document.createElement("input");
  check.type="checkbox";check.checked=true;
  check.onchange=()=>{es.shown[layer]=check.checked;};
  row.append(check," "+label);$("edLayers").append(row);
}
const variantPicker=document.createElement("select");
variantPicker.setAttribute("aria-label","Variante da posizionare");
fillSelect(variantPicker,assetVariants.map((n,i)=>[i,n]),0);
variantPicker.onchange=()=>{es.variant=Number(variantPicker.value);paintCatalog();};
$("edCatalog").append(variantPicker);
const paletteButtons=[];
for(const [category,items] of Object.entries(catalog)){
  const box=document.createElement("details"),title=document.createElement("summary"),group=document.createElement("div");
  title.textContent=category;group.className="editor-tiles";
  if(category==="Terreno"||category==="Architettura")box.open=true;
  for(const [id,name] of items){
    const button=document.createElement("button"), icon=document.createElement("canvas");
    icon.width=24;icon.height=24;icon.setAttribute("aria-hidden","true");
    button.dataset.asset=id;button.append(icon,name);group.append(button);
    button.onclick=()=>{
      es.asset=id;
      if(es.tool!=="erase"&&es.tool!=="fill"&&es.tool!=="paint")editTool(assets[id][2]==="terreno"||id==="wall"?"paint":"place");
      else editTool(es.tool);
      paintCatalog();
    };
    paletteButtons.push([button,icon,id]);
  }
  box.append(title,group);$("edCatalog").append(box);
}
function paintCatalog(){
  for(const [button,icon,kind] of paletteButtons){
    const c=icon.getContext("2d");c.clearRect(0,0,24,24);c.save();c.translate(4,4);
    const item=makeObject(kind,0,0,false);
    item.w=item.h=1;
    if(kindLayer(item)==="terreno")groundTile(c,kind,0,0,item.color,item.variant);
    else drawObject(c,item,0,true);
    c.restore();
    button.setAttribute("aria-pressed",String(es.asset===kind));
  }
}
function makeObject(kind,x,y,useId=true){
  const [,name,layer,color,w=1,h=1,solid=false]=assets[kind];
  const action=({ping:"minigame",foos:"minigame",bris:"minigame",door:"portal",stairs:"portal",goal:"goal",event:"event"})[kind]??(layer==="persone"?"dialog":"");
  return {uid:useId?mapId():"",kind,name,x,y,w,h,rotation:0,variant:es.variant,color,solid,
    action,native:"",text:"",target:action==="minigame"?kind:"",gate:"",missionTarget:"",auto:false,behavior:"idle",speed:1.7,route:[]};
}
function selectedObjects(){return editRoom().objects.filter(o=>es.selection.has(o.uid));}
function inputProperty(parent,label,value,apply,options={}){
  const row=document.createElement("label");
  const input=document.createElement(options.values?"select":options.multiline?"textarea":"input");
  input.setAttribute("aria-label",label);
  if(options.values)fillSelect(input,options.values,value);
  else if(options.multiline){input.rows=3;input.value=value;}
  else{
    input.type=options.type??"text";
    if(input.type==="checkbox")input.checked=value;
    else input.value=value;
    if(options.type==="number"){
      input.min=options.min;input.max=options.max;input.step=options.step??1;
    }
    if(options.maxLength)input.maxLength=options.maxLength;
  }
  input.onchange=()=>{
    let next=input.value;
    if(input.type==="checkbox")next=input.checked;
    if(input.type==="number"){
      if(!input.value.trim()){input.value=value;return;}
      next=clamp(Number(next),Number(input.min),Number(input.max));
      if(!Number.isFinite(next)){input.value=value;return;}
    }
    edit(()=>apply(next));
  };
  row.append(label,input);parent.append(row);
}
function constrainObject(o,z=editRoom()){
  o.w=clamp(o.w,1,z.width);o.h=clamp(o.h,1,z.height);
  o.x=clamp(o.x,0,z.width-o.w);o.y=clamp(o.y,0,z.height-o.h);
  o.route=o.route.map(([x,y])=>[clamp(x,0,z.width-1),clamp(y,0,z.height-1)]);
}
const encounterTypes=[["","Nessuna"],["native","Incontro originale"],["dialog","Dialogo"],["portal","Porta verso un ambiente"],["minigame","Minigioco"],["mission","Obiettivo di missione"],["goal","Posto studio (finale)"],["event","Evento narrativo"]];
function refreshProps(){
  const props=$("edProps");
  props.replaceChildren();
  const selected=selectedObjects();
  $("edSelection").textContent=selected.length===1?assets[selected[0].kind][1]:
    selected.length?selected.length+" elementi selezionati":"Seleziona un oggetto sulla mappa.";
  $("edObjectActions").hidden=!selected.length;
  $("edRotate").disabled=selected.every(o=>kindLayer(o)==="terreno");
  if(selected.length!==1)return;
  const o=selected[0],z=editRoom();
  const field=(label,key,options,transform=v=>v)=>inputProperty(props,label,o[key],v=>{o[key]=transform(v);constrainObject(o,z);},options);
  field("Nome","name",{maxLength:90});
  const geometry=document.createElement("div");
  geometry.className="editor-controls-grid";props.append(geometry);
  const number=(label,key,min,max,step=1)=>inputProperty(geometry,label,o[key],v=>{o[key]=v;constrainObject(o,z);},{type:"number",min,max,step});
  const ground=kindLayer(o)==="terreno";
  if(ground){
    for(const [label,key,max] of [["X","x",z.width-1],["Y","y",z.height-1]])inputProperty(geometry,label,o[key],v=>{
      o[key]=Math.round(v);
      z.objects=z.objects.filter(other=>other===o||kindLayer(other)!=="terreno"||other.x!==o.x||other.y!==o.y);
    },{type:"number",min:0,max});
  }else{
    number("X","x",0,z.width-1,.25);number("Y","y",0,z.height-1,.25);
    number("Larghezza","w",1,z.width,.25);number("Altezza","h",1,z.height,.25);
    inputProperty(props,"Orientamento",o.rotation,value=>orient(o,Number(value)),
      {values:[0,90,180,270].map(n=>[n,n+"°"])});
  }
  field("Colore","color",{type:"color"});
  field("Variante","variant",{values:assetVariants.map((name,i)=>[i,name])},Number);
  field("Blocca il passaggio","solid",{type:"checkbox"});
  if(o.kind==="entrance"){
    field("Provenienza preferita","target",{values:[["","Ingresso predefinito"],...Object.entries(campus.zones).map(([id,r])=>[id,r.name])]});
    return;
  }
  inputProperty(props,"Interazione",o.action,value=>{
    o.action=value;o.auto=false;o.target=value==="minigame"?"ping":"";
  },{values:encounterTypes.filter(([id])=>id!=="native"||o.native)});
  if(o.action){
    field(o.action==="native"?"Testo aggiuntivo":"Dialogo / descrizione","text",{multiline:true});
    if(o.action==="portal"){
      const places=Object.entries(campus.zones);
      const opts=[["","Scegli destinazione"]];
      for(const [id,r] of places){
        opts.push([id,r.name]);
        for(const entry of entriesIn(id))opts.push([id+"#"+entry.uid,r.name+" · "+entry.name]);
      }
      field("Destinazione","target",{values:opts});
    }
    if(o.action==="minigame")field("Sfida","target",{values:Object.entries(challengeNames)});
    if(o.action==="mission"){
      field("Testo dell’obiettivo","target",{maxLength:90});
      const points=Object.values(campus.zones).flatMap(room=>room.objects
        .filter(item=>item.uid!==o.uid&&item.action&&item.action!=="mission")
        .map(item=>[item.uid,room.name+" · "+item.name]));
      field("Completa raggiungendo","missionTarget",{values:[["","Nessun punto collegato"],...points]});
    }
    if(["dialog","event","mission"].includes(o.action)||o.native==="trend")field("Attiva al passaggio","auto",{type:"checkbox"});
  }
  if(!ground)field("Richiede una vittoria","gate",{values:[["","Nessuna"],...Object.entries(challengeNames)]});
  if(kindLayer(o)==="persone"){
    field("Comportamento","behavior",{values:[["idle","Fermo"],["patrol","Andata e ritorno"],["loop","Giro continuo"]]});
    field("Velocità","speed",{type:"number",min:.4,max:6,step:.1});
    const row=document.createElement("div"),path=document.createElement("button"),clear=document.createElement("button");
    row.className="editor-tools";
    path.textContent="Disegna percorso ("+o.route.length+")";path.onclick=()=>editTool("path");
    clear.textContent="Azzera percorso";clear.disabled=!o.route.length;
    clear.onclick=()=>edit(()=>{o.route=[];o.behavior="idle";});
    row.append(path,clear);props.append(row);
  }
}
function refreshEditor(){
  const zone=editRoom();
  fillSelect($("edZone"),Object.entries(campus.zones).map(([id,r])=>[id,r.name]),es.zone);
  $("edWidth").value=zone.width;$("edHeight").value=zone.height;
  $("edUndo").disabled=!es.undo.length;$("edRedo").disabled=!es.redo.length;
  $("edCopy").disabled=!es.selection.size&&!es.area;$("edPaste").disabled=!es.clip;
  $("edPlan").checked=zone.plan.show;
  $("edOpacity").value=zone.plan.opacity;$("edPlanScale").value=zone.plan.scale;
  $("edPlanX").value=Math.round(zone.plan.x);$("edPlanY").value=Math.round(zone.plan.y);
  $("edMovePlan").disabled=!zone.plan.show;
  $("edAlignPlan").disabled=es.zone!=="giardino"||!zone.objects.some(o=>o.uid==="main-front");
  const props=$("edRoomProps");props.replaceChildren();
  inputProperty(props,"Nome ambiente",zone.name,v=>{zone.name=v.trim()||zone.name;},{maxLength:90});
  inputProperty(props,"Terreno di base",zone.ground,v=>{zone.ground=v;},{values:catalog.Terreno.map(([kind,label])=>[kind,label])});
  refreshProps();
}
function enterEditor(){
  es.pointer=null;
  editTool(es.tool);
  refreshEditor();
}
const screenSize=()=>ed.getBoundingClientRect();
function fitMap(){
  const bounds=screenSize(),z=editRoom();
  if(!bounds.width||!bounds.height)return;
  es.scale=clamp(Math.min(bounds.width/(z.width*16+28),bounds.height/(z.height*16+28)),.18,4);
  es.x=(bounds.width-z.width*16*es.scale)/2;es.y=(bounds.height-z.height*16*es.scale)/2;
  updateZoom();es.fit=false;
}
function updateZoom(){
  $("edZoom").value=Math.round(es.scale*100);
  $("edZoomLabel").textContent=Math.round(es.scale*100)+"%";
}
function zoomAt(scale,x,y){
  const next=clamp(scale,.18,4);
  es.x=x-(x-es.x)*next/es.scale;es.y=y-(y-es.y)*next/es.scale;
  es.scale=next;updateZoom();
}
function drawEditor(now){
  const bounds=screenSize();
  if(!bounds.width||!bounds.height)return;
  if(es.fit)fitMap();
  const ratio=Math.min(devicePixelRatio||1,2);
  const w=Math.round(bounds.width*ratio),h=Math.round(bounds.height*ratio);
  if(ed.width!==w||ed.height!==h){ed.width=w;ed.height=h;}
  edInk.setTransform(ratio,0,0,ratio,0,0);
  edInk.imageSmoothingEnabled=false;
  edInk.clearRect(0,0,bounds.width,bounds.height);
  const z=editRoom(),p=z.plan;
  edInk.save();edInk.translate(es.x,es.y);edInk.scale(es.scale,es.scale);
  const view={x:-es.x/es.scale,y:-es.y/es.scale,w:bounds.width/es.scale,h:bounds.height/es.scale};
  worldView(edInk,es.zone,0,view,es.shown,true);
  if(p.show&&planImage.complete&&planImage.naturalWidth){
    edInk.globalAlpha=p.opacity/100;
    edInk.drawImage(planImage,p.x,p.y,planImage.naturalWidth*p.scale/100,planImage.naturalHeight*p.scale/100);
    edInk.globalAlpha=1;
  }
  if($("edGrid").checked){
    edInk.beginPath();
    for(let x=0;x<=z.width;x++){edInk.moveTo(x*16,0);edInk.lineTo(x*16,z.height*16);}
    for(let y=0;y<=z.height;y++){edInk.moveTo(0,y*16);edInk.lineTo(z.width*16,y*16);}
    edInk.strokeStyle="#fff1d540";edInk.lineWidth=1/es.scale;edInk.stroke();
  }
  edInk.lineWidth=1.5/es.scale;
  edInk.strokeStyle="#f6d28c";
  if(es.area){
    const [x,y,w,h]=es.area;
    rect(edInk,"#f4bc5a31",x*16,y*16,w*16,h*16);
    edInk.strokeRect(x*16,y*16,w*16,h*16);
  }
  for(const o of selectedObjects()){
    edInk.strokeRect(o.x*16+1,o.y*16+1,o.w*16-2,o.h*16-2);
    if(kindLayer(o)!=="terreno")rect(edInk,"#f6d28c",(o.x+o.w)*16-4,(o.y+o.h)*16-4,4,4);
    if(o.route.length){
      edInk.beginPath();edInk.moveTo((o.x+.5)*16,(o.y+.5)*16);
      for(const [x,y] of o.route)edInk.lineTo((x+.5)*16,(y+.5)*16);
      edInk.stroke();
      for(const [x,y] of o.route)rect(edInk,"#f1d196",(x+.5)*16-2,(y+.5)*16-2,4,4);
    }
  }
  if(es.cursor&&["place","paint","fill","erase","path"].includes(es.tool)){
    const {x,y}=es.cursor;
    if(x>=0&&y>=0&&x<z.width&&y<z.height)edInk.strokeRect(x*16,y*16,16,16);
  }
  edInk.restore();
}
function editorCoords(event){
  const b=screenSize();
  const sx=event.clientX-b.left,sy=event.clientY-b.top;
  const fx=(sx-es.x)/es.scale/16,fy=(sy-es.y)/es.scale/16;
  return {sx,sy,fx,fy,x:Math.floor(fx),y:Math.floor(fy)};
}
const tileInside=(x,y,z=editRoom())=>x>=0&&y>=0&&x<z.width&&y<z.height;
function hitObject(point,predicate=o=>es.shown[kindLayer(o)]){
  return editRoom().objects.filter(o=>predicate(o)&&insideObject(o,point.fx,point.fy))
    .sort((a,b)=>Number(kindLayer(b)!=="terreno")-Number(kindLayer(a)!=="terreno")||
      b.y+b.h-a.y-a.h).find(Boolean);
}
function putTile(z,kind,x,y,template=null){
  const index=z.objects.findIndex(o=>kindLayer(o)==="terreno"&&o.x===x&&o.y===y);
  const tile=template?{...template,uid:mapId(),x,y}:makeObject(kind,x,y);
  if(index<0)z.objects.push(tile);
  else{
    const old=z.objects[index];
    if(old.kind===tile.kind&&old.variant===tile.variant&&old.color===tile.color&&old.solid===tile.solid&&!template)return;
    z.objects[index]=tile;
  }
}
function brush(x,y,erase=false){
  if(!tileInside(x,y))return;
  const z=editRoom();
  if(erase){
    const layer=assets[es.asset][2];
    const o=hitObject({fx:x+.5,fy:y+.5},item=>kindLayer(item)===layer&&es.shown[layer]);
    if(o){z.objects=z.objects.filter(item=>item!==o);es.selection.delete(o.uid);}
    return;
  }
  const layer=assets[es.asset][2];
  es.shown[layer]=true;
  if(layer==="terreno"){putTile(z,es.asset,x,y);return;}
  if(es.tool==="paint"&&z.objects.some(o=>o.kind===es.asset&&o.x===x&&o.y===y))return;
  const o=makeObject(es.asset,x,y);
  constrainObject(o,z);
  z.objects.push(o);
  if(es.tool==="place")es.selection=new Set([o.uid]);
}
function paintLine(from,to,erase){
  const length=Math.max(1,Math.abs(to.x-from.x),Math.abs(to.y-from.y));
  let previous="";
  for(let i=0;i<=length;i++){
    const x=Math.round(from.x+(to.x-from.x)*i/length),y=Math.round(from.y+(to.y-from.y)*i/length);
    if(previous!==x+","+y){brush(x,y,erase);previous=x+","+y;}
  }
}
function floodFill(from){
  if(assets[es.asset][2]!=="terreno"){updateEditorStatus("Scegli un terreno dal catalogo.");return;}
  const z=editRoom();
  if(!tileInside(from.x,from.y,z))return;
  const tiles=terrainMap(z);
  const surface=(x,y)=>{
    const tile=tiles.get(x+y*z.width);
    return tile?[tile.kind,tile.color,tile.variant,tile.solid].join("|"):[z.ground,assets[z.ground][3],0,false].join("|");
  };
  const base=surface(from.x,from.y), brushColor=[es.asset,assets[es.asset][3],es.variant,false].join("|");
  if(base===brushColor)return;
  edit(()=>{
    const queue=[[from.x,from.y]], seen=new Set(),added=[];
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i],key=x+y*z.width;
      if(seen.has(key)||surface(x,y)!==base)continue;
      seen.add(key);
      added.push(makeObject(es.asset,x,y));
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(tileInside(x+dx,y+dy,z))queue.push([x+dx,y+dy]);
    }
    z.objects=z.objects.filter(o=>kindLayer(o)!=="terreno"||!seen.has(o.x+o.y*z.width));
    z.objects.push(...added);
  });
}
function markArea(from,to){
  const z=editRoom();
  const left=clamp(Math.min(from.x,to.x),0,z.width-1),right=clamp(Math.max(from.x,to.x),0,z.width-1);
  const top=clamp(Math.min(from.y,to.y),0,z.height-1),bottom=clamp(Math.max(from.y,to.y),0,z.height-1);
  es.area=[left,top,right-left+1,bottom-top+1];
  es.selection=new Set(z.objects.filter(o=>es.shown[kindLayer(o)]&&o.x<right+1&&o.y<bottom+1&&o.x+o.w>left&&o.y+o.h>top).map(o=>o.uid));
}
ed.onpointerdown=e=>{
  if(e.button!==0&&e.button!==1)return;
  e.preventDefault();ed.focus();
  const point=editorCoords(e);
  const mode=e.button===1?"pan":es.tool;
  if(mode==="fill"){floodFill(point);return;}
  if(mode==="path"){
    const [o]=selectedObjects();
    if(o&&kindLayer(o)==="persone"&&tileInside(point.x,point.y)&&o.route.length<100)edit(()=>{
      o.route.push([point.x,point.y]);if(o.behavior==="idle")o.behavior="patrol";
    });
    return;
  }
  if(!["pan","overlay"].includes(mode)&&!tileInside(point.x,point.y))return;
  const drag={mode,from:point,last:point,baseX:es.x,baseY:es.y,before:JSON.stringify(campus)};
  if(mode==="overlay"){drag.baseX=editRoom().plan.x;drag.baseY=editRoom().plan.y;}
  if(mode==="select"){
    const sel=selectedObjects();
    const handle=sel.length===1&&kindLayer(sel[0])!=="terreno"&&
      Math.abs(point.fx-sel[0].x-sel[0].w)<.34&&Math.abs(point.fy-sel[0].y-sel[0].h)<.34;
    es.area=null;
    const hit=handle?sel[0]:hitObject(point);
    if(e.shiftKey&&hit){
      es.selection.has(hit.uid)?es.selection.delete(hit.uid):es.selection.add(hit.uid);
      refreshEditor();return;
    }
    if(!hit)es.selection.clear();
    else if(!es.selection.has(hit.uid))es.selection=new Set([hit.uid]);
    drag.resize=handle;
    drag.items=selectedObjects().map(o=>[o,o.x,o.y,o.w,o.h,o.route]);
  }
  if(mode==="area")markArea(point,point);
  if(mode==="place"||mode==="paint"||mode==="erase")brush(point.x,point.y,mode==="erase");
  es.pointer=drag;ed.setPointerCapture(e.pointerId);refreshEditor();
};
ed.onpointermove=e=>{
  const point=editorCoords(e);es.cursor=point;
  const drag=es.pointer;
  $("edCoords").textContent="Casella "+point.x+", "+point.y;
  if(!drag)return;
  const {from,mode}=drag,z=editRoom();
  if(mode==="pan"){es.x=drag.baseX+point.sx-from.sx;es.y=drag.baseY+point.sy-from.sy;}
  if(mode==="overlay"){
    z.plan.x=clamp(drag.baseX+(point.sx-from.sx)/es.scale,-3000,3000);
    z.plan.y=clamp(drag.baseY+(point.sy-from.sy)/es.scale,-3000,3000);
  }
  if(mode==="area")markArea(from,point);
  if(mode==="paint"||mode==="erase")paintLine(drag.last,point,mode==="erase");
  if(mode==="select"&&drag.items.length){
    const dx=Math.round(point.fx-from.fx),dy=Math.round(point.fy-from.fy);
    for(const [o,x,y,w,h,route] of drag.items){
      if(drag.resize){o.w=w+dx;o.h=h+dy;}
      else{
        o.x=x+dx;o.y=y+dy;
        o.route=route.map(([rx,ry])=>[rx+dx,ry+dy]);
      }
      constrainObject(o,z);
    }
  }
  drag.last=point;
};
function finishDrag(){
  const drag=es.pointer;if(!drag)return;
  es.pointer=null;
  if(drag.mode==="select"&&!drag.resize){
    const z=editRoom(), moved=new Set(drag.items.filter(([o,x,y])=>kindLayer(o)==="terreno"&&(o.x!==x||o.y!==y)).map(([o])=>o));
    const coordinates=new Set([...moved].map(o=>o.x+o.y*z.width));
    z.objects=z.objects.filter(o=>moved.has(o)||kindLayer(o)!=="terreno"||!coordinates.has(o.x+o.y*z.width));
  }
  storeChange(drag.before,undefined,false);refreshEditor();
}
ed.onpointerup=finishDrag;ed.onpointercancel=finishDrag;ed.onlostpointercapture=finishDrag;
ed.addEventListener("wheel",e=>{
  e.preventDefault();
  const p=editorCoords(e);
  zoomAt(es.scale*(e.deltaY>0?.88:1.14),p.sx,p.sy);
},{passive:false});
function orient(o,rotation){
  if((o.rotation-rotation)%180)[o.w,o.h]=[o.h,o.w];
  o.rotation=rotation;
  constrainObject(o);
}
function rotateObjects(){
  edit(()=>{
    for(const o of selectedObjects()){
      if(kindLayer(o)==="terreno")continue;
      orient(o,(o.rotation+90)%360);
    }
  });
}
function deleteObjects(){
  if(!es.selection.size)return;
  edit(()=>{
    const z=editRoom();
    z.objects=z.objects.filter(o=>!es.selection.has(o.uid));
    es.selection.clear();es.area=null;
  });
}
function copyObjects(){
  const selected=selectedObjects(),z=editRoom();
  if(!selected.length&&!es.area)return;
  const x=es.area?.[0]??Math.min(...selected.map(o=>o.x));
  const y=es.area?.[1]??Math.min(...selected.map(o=>o.y));
  const content=structuredClone(selected);
  if(es.area&&es.shown.terreno){
    const [, ,w,h]=es.area,tiles=terrainMap(z);
    for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(!tiles.has(xx+yy*z.width))content.push(makeObject(z.ground,xx,yy,false));
  }
  es.clip={content,x,y};
  updateEditorStatus("Area copiata. Porta il cursore sulla destinazione e incolla.");refreshEditor();
}
function pasteObjects(offset=false){
  if(!es.clip)return;
  edit(()=>{
    const {x,y,content}=es.clip,z=editRoom();
    const target=(!offset&&es.cursor&&tileInside(es.cursor.x,es.cursor.y))?es.cursor:{x:x+1,y:y+1};
    const idMap=new Map(content.filter(o=>o.uid).map(o=>[o.uid,mapId()]));
    const selected=[],groundReplacements=new Set(),added=[];
    for(const original of content){
      const o=structuredClone(original);
      o.uid=idMap.get(original.uid)??mapId();
      const dx=target.x-x,dy=target.y-y;
      o.x+=dx;o.y+=dy;o.route=o.route.map(([rx,ry])=>[rx+dx,ry+dy]);
      if(o.missionTarget&&idMap.has(o.missionTarget))o.missionTarget=idMap.get(o.missionTarget);
      if(o.action==="portal"&&o.target.includes("#")){
        const [,entry]=o.target.split("#");
        if(idMap.has(entry))o.target=es.zone+"#"+idMap.get(entry);
      }
      if(!tileInside(o.x,o.y,z))continue;
      constrainObject(o,z);
      if(kindLayer(o)==="terreno")groundReplacements.add(o.x+o.y*z.width);
      added.push(o);selected.push(o.uid);
    }
    z.objects=z.objects.filter(o=>kindLayer(o)!=="terreno"||!groundReplacements.has(o.x+o.y*z.width));
    z.objects.push(...added);
    es.selection=new Set(selected);es.area=null;editTool("select");
  });
}
$("edUndo").onclick=()=>historyStep(es.undo,es.redo);
$("edRedo").onclick=()=>historyStep(es.redo,es.undo);
$("edRotate").onclick=rotateObjects;$("edDelete").onclick=deleteObjects;
$("edCopy").onclick=copyObjects;$("edPaste").onclick=()=>pasteObjects();
$("edDuplicate").onclick=()=>{copyObjects();pasteObjects(true);};
$("edFit").onclick=fitMap;
$("edZoom").oninput=()=>{const b=screenSize();zoomAt(Number($("edZoom").value)/100,b.width/2,b.height/2);};
$("edZone").onchange=()=>{
  es.zone=$("edZone").value;es.selection.clear();es.area=null;es.fit=true;es.cursor=null;refreshEditor();
};
$("edNewZone").onclick=()=>{
  if(Object.keys(campus.zones).length>=32){updateEditorStatus("Hai raggiunto il limite di 32 ambienti.");return;}
  const id="ambiente-"+mapId().slice(0,12);
  edit(()=>{
    campus.zones[id]={name:"Nuovo ambiente",width:24,height:16,ground:"floor",objects:[makeObject("entrance",2,2)],
      plan:{show:false,x:0,y:0,scale:57,opacity:45}};
    es.zone=id;es.selection.clear();es.area=null;es.fit=true;
  });
};
$("edResize").onclick=()=>{
  const width=Number($("edWidth").value),height=Number($("edHeight").value);
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<8||height<8||width>120||height>120){
    updateEditorStatus("Usa dimensioni intere tra 8 e 120 caselle.");return;
  }
  const z=editRoom();
  if(z.objects.some(o=>o.x+o.w>width||o.y+o.h>height)||z.objects.some(o=>o.route.some(([x,y])=>x>=width||y>=height))){
    updateEditorStatus("Sposta o elimina prima gli elementi e i percorsi oltre il nuovo bordo.");return;
  }
  edit(()=>{z.width=width;z.height=height;es.fit=true;});
};
$("edAlignPlan").onclick=()=>edit(()=>{
  const zone=editRoom();
  Object.assign(zone.plan,{...originalMap.zones.giardino.plan,show:true,opacity:zone.plan.opacity});
  es.fit=true;
},"Planimetria allineata");
for(const [id,key] of [["edPlan","show"],["edOpacity","opacity"],["edPlanScale","scale"],["edPlanX","x"],["edPlanY","y"]]){
  $(id).onchange=()=>{
    edit(()=>{
      const input=$(id);
      editRoom().plan[key]=key==="show"?input.checked:clamp(Number(input.value),Number(input.min),Number(input.max));
      if(key==="show"&&!input.checked&&es.tool==="overlay")editTool("select");
    });
  };
}
$("edMovePlan").onclick=()=>editTool(es.tool==="overlay"?"select":"overlay");
$("edRestore").onclick=()=>{
  if(!confirm("Ripristinare la mappa originale? Puoi annullare l’operazione."))return;
  edit(()=>{campus=freshMap();es.zone="giardino";es.selection.clear();es.area=null;es.fit=true;editTool("select");},"Mappa originale ripristinata");
};
function downloadFile(contents,type,name){
  const url=URL.createObjectURL(new Blob([contents],{type}));
  const link=document.createElement("a");link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
}
$("edJson").onclick=()=>downloadFile(JSON.stringify(campus,null,2),"application/json","ultimo-posto-mappa.json");
$("edImport").onclick=()=>$("edFile").click();
$("edFile").onchange=async()=>{
  const file=$("edFile").files[0];$("edFile").value="";
  if(!file)return;
  try{
    if(file.size>24*1024*1024)throw Error("Il file supera 24 MB.");
    const data=normalizeCampus(JSON.parse(await file.text()));
    edit(()=>{
      campus=data;es.zone=Object.hasOwn(campus.zones,es.zone)?es.zone:"ingresso";es.selection.clear();es.area=null;es.fit=true;
    },"Mappa importata");
  }catch(error){updateEditorStatus("Importazione non riuscita · "+error.message);}
};
$("edHtml").onclick=()=>{
  const copy=new DOMParser().parseFromString(htmlTemplate,"text/html");
  copy.getElementById("edEmbedded").textContent=JSON.stringify(campus).replaceAll("<","\\u003c");
  downloadFile("<!doctype html>\n"+copy.documentElement.outerHTML,"text/html;charset=utf-8","ultimo-posto-mappa.html");
};
$("edTest").onclick=()=>{
  const prior=stored();
  const zone=es.zone;
  const [x,y]=reachEntry(zone);
  state={version:1,name:prior?.name??"Neri",avatar:prior?.avatar??avatar(),
    traits:structuredClone(prior?.traits??Object.fromEntries(Object.keys(traits).map(id=>[id,50]))),
    zone,x,y,look:"down",log:[],secrets:[],pockets:[],ending:null,wins:{},campusExpanded:true,events:[],completedEvents:[],mission:"",missionTarget:""};
  testMode=true;activeScene=null;dirty=false;show("game");
};
$("edOpen").onclick=()=>show("editor");
window.addEventListener("keydown",event=>{
  if(screen!=="editor"||/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName))return;
  const key=event.key.toLowerCase(),mod=event.ctrlKey||event.metaKey;
  if(mod&&["z","y","c","v","d"].includes(key)){
    event.preventDefault();
    if(key==="z")event.shiftKey?historyStep(es.redo,es.undo):historyStep(es.undo,es.redo);
    if(key==="y")historyStep(es.redo,es.undo);
    if(key==="c")copyObjects();
    if(key==="v")pasteObjects();
    if(key==="d"){copyObjects();pasteObjects(true);}
  }
  if(key==="delete"){event.preventDefault();deleteObjects();}
  if(key==="escape"){es.selection.clear();es.area=null;editTool("select");refreshEditor();}
  if(key==="r"&&!mod)rotateObjects();
});
paintCatalog();
editTool("select");

$("langIt").onclick=()=>chooseLanguage("it");$("langEn").onclick=()=>chooseLanguage("en");
updateMeters();show("home");requestAnimationFrame(frame);
